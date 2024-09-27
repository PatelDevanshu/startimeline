// src/components/MapComponent.js
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContext } from '../../Context';
import pLimit from 'p-limit';
import { v4 as uuidv4 } from 'uuid';
import RoutePolyline from './Polyline';

const MapComponent = () => {
    const [route, setRoute] = useState([]);
    const [mapData, setMapData] = useState([]);
    const [waypoints, setWaypoints] = useState([]);
    const [showRoute, setShowRoute] = useState(false);
    const { timelineData, SendAddress, totals, SetHandler } = useContext(MapContext);
    // const intitialcenter = { lat: 20.39012149793167, lng: 72.90738269251017 }
    const intitialcenter = { lat: 20.5937, lng: 78.9629 }
    const limit = pLimit(2);
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    useEffect(() => {
        setMapData(timelineData);
    }, [timelineData]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        fetchRoute();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mapData]);


    const fetchRoute = useCallback(async () => {
        let userpath = mapData.map((value) => {
            return { lat: value.latitude ? value.latitude : '', lng: value.longitude ? value.longitude : '' };
        });

        let path = [...userpath] || [];

        if (path.length === 0) {
            totals({
                totalDistance: '0.0',
                totalDuration: '0.0'
            })
            setRoute([]);
            setShowRoute(false);
            SendAddress([]);
            SetHandler({
                error: false,
                loader: false,
                notfound: true
            });
            return;
        }
        else if (path.length <= 1) {
            totals({
                totalDistance: '0.0',
                totalDuration: '0.0'
            })
            setRoute([]);
            setShowRoute(false);
            SendAddress([]);
            SetHandler({
                error: false,
                loader: false,
            })
            return;
        }
        else {
            SetHandler({
                loader: false,
                error: false,
                notfound: false
            })
            setWaypoints(path);

            //define arrays for the result data
            let getCords_search_indexes = [];
            let search_leg_distance = [];
            let search_leg_time = [];

            let result = await DirectionApi(path);

            const LegsResponse = LegsData(result.legs);

            if (LegsResponse.intersectionsList.length > 0) {
                search_leg_distance = LegsResponse?.search_leg_distance;
                search_leg_time = LegsResponse?.search_leg_time;

                const getCords = getCoordinates(path, LegsResponse?.start_indexes);
                getCords_search_indexes.push(...getCords);

                setRoute(LegsResponse?.intersectionsList);
                setShowRoute(true);
            }

            totals({
                totalDistance: (result.resDistance / 1000).toFixed(2),
                totalDuration: (convertSecondsToHours(result.resDuration))
            });

            if (getCords_search_indexes.length > 1) {
                const uniqueCoordinates = getUniqueCordinates(getCords_search_indexes);

                if (uniqueCoordinates.length > 0) {
                    SetHandler({
                        loader: true
                    })
                    const addressesArray = await fetchAddresses(uniqueCoordinates);

                    const coordToAddressMap = new Map();
                    uniqueCoordinates.forEach((coords, index) => {
                        const key = `${coords[0]},${coords[1]}`;
                        coordToAddressMap.set(key, addressesArray[index]?.display_name || 'No data');
                    });

                    const timelineAddress = mapAddressesBackToData(getCords_search_indexes, coordToAddressMap);

                    const timelineData = search_leg_distance.map((distance, index) => ({
                        startAddress: timelineAddress[index]?.start_address || 'No data',
                        endAddress: timelineAddress[index]?.end_address || 'No data',
                        duration: search_leg_time[index] || 'No data',
                        distance: distance || 'No data',
                        id: uuidv4()
                    }));

                    SendAddress(timelineData);
                    SetHandler({
                        loader: false
                    })
                }
            }
            else {
                SendAddress([]);
                SetHandler({
                    error: true,
                })
            }

            //BATCHWISE DATA RENDERING

            // const batchSize = 80;

            // function createCoordinateBatches() {
            //     const batches = [];
            //     for (let i = 0; i < path.length; i += batchSize) {
            //         const batch = path.slice(i, Math.min(i + batchSize, path.length));
            //         batches.push(batch);
            //     }
            //     return batches;
            // }

            // let coordinateBatches = createCoordinateBatches();
            // let routeResults = [];
            // let getCords_search_indexes = [];
            // let search_leg_distance = [];
            // let search_leg_time = [];
            // let allBatchDistance = 0.0;
            // let allBatchDuration = 0.0;

            // const routeResultPromises = coordinateBatches.map(async (batch, index) => {
            //     let result = await postRoute(batch);
            //     if (result) {
            //         const totalSums = await getTotalSums(result.leg_distance, result.leg_time);
            //         allBatchDistance += parseFloat(totalSums.totalDistance);
            //         allBatchDuration += parseFloat(totalSums.totalDuration);

            //         if (totalSums.search_leg_distance.length > 1) {
            //             search_leg_distance.push(...totalSums.search_leg_distance);
            //             search_leg_time.push(...totalSums.search_leg_time);
            //         }

            //         const getCords = getCoordinates(batch, totalSums.start_indexes);
            //         getCords_search_indexes.push(...getCords);
            //         routeResults.push(...result.decodedPoints);
            //     }
            // });

            // await Promise.all(routeResultPromises);
            // setRoute(routeResults);
            // setShowRoute(true);
            // let allBatchDurationInHours = convertMillisecondsToHours(allBatchDuration);
            // totals({
            //     totalDistance: allBatchDistance.toFixed(2) || '0.0',
            //     totalDuration: allBatchDurationInHours || '0.0'
            // })

            // if (getCords_search_indexes.length > 1) {
            //     const uniqueCoordinates = getUniqueCordinates(getCords_search_indexes);

            //     if (uniqueCoordinates.length > 0) {
            //         SetHandler({
            //             loader: true
            //         })
            //         const addressesArray = await fetchAddresses(uniqueCoordinates);

            //         const coordToAddressMap = new Map();
            //         uniqueCoordinates.forEach((coords, index) => {
            //             const key = `${coords[0]},${coords[1]}`;
            //             coordToAddressMap.set(key, addressesArray[index]?.display_name || 'No data');
            //         });

            //         const timelineAddress = mapAddressesBackToData(getCords_search_indexes, coordToAddressMap);

            //         const timelineData = search_leg_distance.map((distance, index) => ({
            //             startAddress: timelineAddress[index]?.start_address || 'No data',
            //             endAddress: timelineAddress[index]?.end_address || 'No data',
            //             duration: search_leg_time[index] || 'No data',
            //             distance: distance || 'No data',
            //             id: uuidv4()
            //         }));

            //         SendAddress(timelineData);
            //         SetHandler({
            //             loader: false
            //         })
            //     }
            // }
            // else {
            //     SendAddress([]);
            //     SetHandler({
            //         error: true,
            //     })
            // }
            return;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mapData, SendAddress, totals]);

    const DirectionApi = async (waypoints) => {
        let coordinateString = '';
        waypoints.forEach((value) => {
            coordinateString += `${value.lng},${value.lat};`;
        });
        const query = new URLSearchParams({
            key: 'pk.14a9bcc9b8f334ffeea59dfcb7851aab',
            steps: true,
        }).toString();

        let finalCoordinates = coordinateString.substring(0, coordinateString.length - 1);
        try {
            const request = await fetch(
                `https://api.locationiq.com/v1/directions/driving/${finalCoordinates}?${query}`,
                {
                    method: "GET",
                    headers: {
                        accept: "application/json"
                    }
                }
            )

            if (request.ok) {
                const response = await request.json();
                const legs = response.routes[0].legs;
                const resDistance = response.routes[0].distance;
                const resDuration = response.routes[0].duration;

                //For the Random created map
                // const routes = response.routes[0].geometry;
                // const decodedPoints = polyline.decode(routes);

                return { legs, response, resDistance, resDuration };
            } else {
                console.error('Request failed');
            }
        } catch (error) {
            console.error('Error fetching route:', error);
        }
        return { legs: [], response: [], resDistance: 0, resDuration: 0 };
    }

    function LegsData(legs) {
        let intersectionsList = [];
        let start_indexes = [];
        let search_leg_distance = [];
        let search_leg_time = [];

        legs.forEach((leg, leg_index) => {
            let steps = leg.steps;
            steps.forEach((step) => {
                let intersection = step.intersections;
                intersection.forEach((inter) => {
                    intersectionsList.push([inter.location[1], inter.location[0]]);
                });
            });

            if (leg.distance > 5000) {
                start_indexes.push(leg_index);
                search_leg_distance.push((leg.distance / 1000).toFixed(2));
                search_leg_time.push(convertSecondsToHours(leg.duration));
            }
        });
        return { intersectionsList, start_indexes, search_leg_distance, search_leg_time };
    }

    function convertSecondsToHours(seconds) {
        // const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        return hours + ":" + (minutes < 10 ? "0" : "") + minutes; // Format the result as "hours:minutes"
    }

    // const postRoute = async (waypoints) => {
    //     let coordinates = waypoints.map((value) => [value.lng, value.lat]);
    //     const query = new URLSearchParams({
    //         key: 'a249d870-e981-437f-a186-b11ae3309dc6'
    //     }).toString();

    //     try {
    //         const request = await fetch(
    //             `https://graphhopper.com/api/1/route?${query}`,
    //             {
    //                 method: 'POST',
    //                 headers: {
    //                     'Content-Type': 'application/json'
    //                 },
    //                 body: JSON.stringify({
    //                     profile: 'car',
    //                     points: coordinates,
    //                     details: ['leg_distance', 'leg_time'],
    //                 })
    //             }
    //         );
    //         if (request.ok) {
    //             const { paths } = await request.json();
    //             if (paths && paths.length > 0) {
    //                 const path = paths[0];
    //                 const encodedPoints = paths[0].points;
    //                 const decodedPoints = polyline.decode(encodedPoints);

    //                 const { leg_distance, leg_time } = path.details;

    //                 return {
    //                     decodedPoints,
    //                     leg_distance,
    //                     leg_time
    //                 };
    //             } else {
    //                 console.error('No paths found in the response');
    //             }
    //         } else {
    //             console.error('Request failed');
    //         }
    //     } catch (error) {
    //         console.error('Error fetching route:', error);
    //     }
    //     return { decodedPoints: [], leg_distance: [], leg_time: [] };
    // }

    // async function getTotalSums(leg_distance, leg_time) {
    //     let totalDistance = 0;
    //     let totalDuration = 0;
    //     let start_indexes = [];
    //     let search_leg_distance = [];
    //     let search_leg_time = [];

    //     if (leg_distance.length > 1) {
    //         leg_distance.forEach((d_leg, d_index) => {
    //             totalDistance += (d_leg[2] / 1000);
    //             if (d_leg[2] > 5000) {
    //                 start_indexes.push(d_index);
    //                 search_leg_distance.push((d_leg[2] / 1000).toFixed(2));
    //             }
    //         });
    //         totalDistance = totalDistance.toFixed(2);
    //     }
    //     if (leg_time.length > 1) {
    //         leg_time.forEach((d_leg, d_index) => {
    //             totalDuration += (d_leg[2]);
    //             if (start_indexes.includes(d_index)) {
    //                 // search_leg_time.push(convertMillisecondsToHours(d_leg[2]));
    //             }
    //         });
    //         totalDuration = totalDuration.toFixed(2);
    //     }
    //     return { totalDistance, totalDuration, start_indexes, search_leg_distance, search_leg_time };
    // }

    function getCoordinates(batch, start_indexes) {
        let search_cordinates = [];
        if (start_indexes.length > 1) {
            start_indexes.forEach((value) => {
                let start_cord = batch[value];
                let end_cord = batch[value + 1];

                search_cordinates.push({ end_cord, start_cord });
                return;
            });
            return search_cordinates;
        }
        else {
            return search_cordinates;
        }
    }

    function getUniqueCordinates(search_cord) {
        const coordinatesSet = new Set();
        const uniqueCoordinates = [];

        search_cord.forEach(({ start_cord, end_cord }) => {
            const startCoord = `${start_cord.lat},${start_cord.lng}`;
            const endCoord = `${end_cord.lat},${end_cord.lng}`;

            if (!coordinatesSet.has(startCoord)) {
                coordinatesSet.add(startCoord);
                uniqueCoordinates.push([start_cord.lat, start_cord.lng]);
            }

            if (!coordinatesSet.has(endCoord)) {
                coordinatesSet.add(endCoord);
                uniqueCoordinates.push([end_cord.lat, end_cord.lng]);
            }
        });
        return uniqueCoordinates;
    }

    async function fetchAddresses(coordinates) {
        if (coordinates.length === 0) return [];

        const results = [];
        for (const [lat, lon] of coordinates) {
            try {
                await delay(500);
                const data = await limit(() => getReverseGeocoding(lat, lon));
                results.push(data);
            } catch (error) {
                console.error(`Error processing (${lat}, ${lon}):`, error);
                results.push({ display_name: 'Address not found' });
            }
        }
        return results;
    }

    const getReverseGeocoding = async (lat, lon) => {
        const apiKey = 'pk.14a9bcc9b8f334ffeea59dfcb7851aab';
        const url = `https://us1.locationiq.com/v1/reverse.php?key=${apiKey}&lat=${lat}&lon=${lon}&format=json`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            if (!data.display_name) {
                throw new Error('Address not found');
            }
            return data;
        } catch (error) {
            console.error('Error fetching reverse geocoding data:', error);
            return null;
        }
    };

    const mapAddressesBackToData = (data, coordToAddressMap) => {
        return data.map(({ start_cord, end_cord }) => ({
            start_cord,
            end_cord,
            start_address: coordToAddressMap.get(`${start_cord.lat},${start_cord.lng}`),
            end_address: coordToAddressMap.get(`${end_cord.lat},${end_cord.lng}`)
        }));
    };

    return (
        <MapContainer center={intitialcenter} zoom={6} style={{ height: '100vh', width: '100%' }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
            />
            {showRoute && <RoutePolyline route={route} waypoints={waypoints} initialCenter={intitialcenter} initialZoom={6} />}
        </MapContainer>
    );
};

export default MapComponent;
