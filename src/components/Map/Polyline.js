import React, { useEffect } from "react";
import { Marker, Polyline, Popup, useMap } from "react-leaflet";
import { Icon } from 'leaflet'
import marker from 'leaflet/dist/images/marker-icon.png';

const RoutePolyline = ({ route, waypoints, initialCenter, initialZoom }) => {
    const map = useMap();

    useEffect(() => {
        if (route.length > 1) {
            const bounds = route;
            map.fitBounds(bounds);
        }
        else {
            map.setView(initialCenter, initialZoom);
        }
    }, [route, map, initialCenter, initialZoom]);

    return (
        <>
            <Polyline positions={route} color="blue" weight={8} />
            {waypoints.length > 0 && waypoints.map((value, index) => (
                <Marker
                    key={index}
                    position={[value.lat, value.lng]}
                    title={`Waypoint ${index + 1}`}
                    alt={`Marker for waypoint ${index + 1}`}
                    riseOnHover={true}
                    icon={new Icon({ iconUrl: marker, iconSize: [25, 41], iconAnchor: [12, 41] })}
                >
                    <Popup>
                        Waypoint {index + 1}
                    </Popup>
                </Marker>
            ))}
        </>
    )
};

export default RoutePolyline;