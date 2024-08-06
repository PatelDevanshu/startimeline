import React, { useContext, useEffect, useState } from 'react'
import GoogleMapReact from 'google-map-react'
import './Map.scss'
import { MapContext } from '../../Context';
import { v4 as uuidv4 } from 'uuid';

const Map = () => {
    const [mapData, setMapData] = useState([]);
    const { timelineData } = useContext(MapContext);
    const { SendAddress } = useContext(MapContext);
    const { totals } = useContext(MapContext);
    // const intitialcenter = { lat: 20.39012149793167, lng: 72.90738269251017 }
    const intitialcenter = { lat: 20.5937, lng: 78.9629 }
    let timelinesum = [];

    useEffect(() => {
        setMapData(timelineData);
    }, [timelineData]);

    let usrpath = mapData.map((d) => {
        return { lat: d.latitude ? d.latitude : "", lng: d.longitude ? d.longitude : "" };
    });

    let path = [...usrpath];
    let Distancecount = 0
    let DurationCount = 0;

    const handleApiLoaded = (map, maps) => {
        if (path.length > 1) {
            path.map((x) => {
                return new maps.Marker({
                    position: x,
                    map: map,
                    options: {
                        icon: {
                            path: window.google.maps.SymbolPath.CIRCLE,
                            scale: 8,
                            fillColor: "blue",
                            fillOpacity: 1,
                            strokeWeight: 2,
                        },
                    },
                });
            });

            //NEw map
            const batchSize = 25; // Maximum number of coordinates per batch

            // // Divide the path into batches
            function createCoordinateBatches() {
                const batches = [];
                for (let i = 0; i < path.length; i += batchSize) {
                    const batch = path.slice(i, Math.min(i + batchSize, path.length));
                    batches.push(batch);
                }
                return batches;
            }

            // // Make the Directions API requests for each batch
            function makeDirectionsRequests(batches) {
                const directionsService = new maps.DirectionsService();
                const results = [];
                let completedRequests = 0;

                batches.forEach((batch, index) => {
                    const waypoints = batch.map(({ lat, lng }) => {
                        const obj = {
                            location: {
                                lat: lat, lng: lng
                            },
                            stopover: true,
                        }
                        return obj;
                    });

                    directionsService.route(
                        {
                            origin: waypoints[0].location, // {lat:75474,lng:295}
                            destination: waypoints[waypoints.length - 1].location, // {lat:75474,lng:295}
                            waypoints: waypoints.slice(1, -1),
                            optimizeWaypoints: false, // Disable optimizing waypoints to maintain the order
                            travelMode: maps.TravelMode.DRIVING,
                        },
                        (result, status) => {
                            if (status === maps.DirectionsStatus.OK) {
                                results[index] = result;
                                const legs = result.routes[0].legs;
                                legs.forEach((leg) => {

                                    // Distancecount += leg.distance.value;
                                    // DurationCount += leg.duration.value;

                                    // console.log("leg,count", leg.distance.value)
                                    Distancecount += leg.distance.value;
                                    DurationCount += leg.duration.value;
                                    // console.log("distancecout", Distancecount);
                                    // console.log("durationcout", DurationCount);
                                })
                                let particularTimeline = legs.filter((leg) => leg.distance.value >= 100).map((leg) => ({
                                    startAddress: leg.start_address,
                                    endAddress: leg.end_address,
                                    duration: leg.duration.text,
                                    distance: leg.distance.text,
                                    id: uuidv4()
                                }))
                                timelinesum = timelinesum.concat(particularTimeline);
                                SendAddress(timelinesum)
                            } else {
                                console.error(`Directions request failed for batch at index ${index}`);
                            }
                            totals({
                                totalDistance: (Distancecount / 1000).toFixed(2),
                                // totalDuration: (DurationCount / 3600).toFixed(2)
                                totalDuration: convertSecondsToHours(DurationCount)
                            })

                            completedRequests++;

                            if (completedRequests === batches.length) {
                                mergeResultsAndRender(results);
                            }
                        }
                    );
                })
            }

            function convertSecondsToHours(seconds) {
                const hours = Math.floor(seconds / 3600); // Calculate the whole number of hours
                const minutes = Math.floor((seconds % 3600) / 60); // Calculate the remaining minutes

                return hours + ":" + (minutes < 10 ? "0" : "") + minutes; // Format the result as "hours.minutes"
            }

            // // Merge the results of the Directions API requests
            function mergeResultsAndRender(results) {
                let bounds = new maps.LatLngBounds();
                // console.log(bounds.union());

                const mergedRoute = {
                    routes: [],
                };

                results.forEach((result) => {
                    mergedRoute.routes = mergedRoute.routes.concat(result);
                });

                mergedRoute.routes.forEach((route) => {
                    let resultBounds = route.routes[0].bounds;
                    const directionsRenderer = new maps.DirectionsRenderer({
                        preserveViewport: true  //Added to preserve viewport
                    });
                    directionsRenderer.setDirections(route);
                    directionsRenderer.setMap(map); // Replace "yourMapObject" with your actual map object
                    bounds.union(resultBounds)
                    // console.log(bounds.union(resultBounds))
                    // bounds.extend(resultBounds.getNorthEast());
                    // bounds.extend(resultBounds.getSouthWest());
                    // map.setZoom(15)
                    map.fitBounds(bounds);
                })
            }
            function handleRouting() {
                const coordinateBatches = createCoordinateBatches();
                makeDirectionsRequests(coordinateBatches);
            }
            handleRouting();
        }
        else {
            totals({
                totalDistance: "0.0",
                // totalDuration: (DurationCount / 3600).toFixed(2)
                totalDuration: "0.0"
            })
            SendAddress(timelinesum);
        }
    }

    return (
        <div className='map'>
            <GoogleMapReact
                bootstrapURLKeys={{
                    key: "AIzaSyCT1zlrTPeEW0ablyPx1r1oIRRkE4AMWy8"
                }}
                key={JSON.stringify(mapData)}
                defaultCenter={intitialcenter}
                defaultZoom={6}
                yesIWantToUseGoogleMapApiInternals={true}
                onGoogleApiLoaded={({ map, maps }) => handleApiLoaded(map, maps)}
            >
            </GoogleMapReact>
        </div>
    )
}

export default Map