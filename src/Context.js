import React, { createContext, useEffect, useState } from 'react';

export const MapContext = createContext();

export const MapProvider = ({ children }) => {
    const [addressdata, setAddressdata] = useState(null);
    const [totalSum, setTotalSum] = useState({})

    const [timelineData, setTimelineData] = useState([''])

    useEffect(() => {
        // fetch("https://mocki.io/v1/6cdb3611-1841-4771-8e9c-7911c6ffc453")
        // fetch("https://mocki.io/v1/6cdb3611-1841-4771-8e9c-7911c6ffc453")
        // fetch("https://mocki.io/v1/57d7784f-7727-43ef-a875-ccc24f9982b8")
        fetch("https://mocki.io/v1/35959bdf-03e9-4830-9b90-499297d461f2")
            // fetch("https://mocki.io/v1/5bd3b8d4-0d0f-4fa8-b2e0-a5e049b769ca")
            // fetch("https://crm.star-ind.com/index.php?entryPoint=dtTimeline")
            .then((res) => res.json())
            .then((data) => {
                let sortredData = data;
                sortredData.sort((a, b) => {
                    const timeA = new Date(a.date_entered).getTime()
                    const timeB = new Date(b.date_entered).getTime()

                    return timeA - timeB

                });
                setTimelineData(sortredData)
            })
            .catch(err => console.log(err))





    }, [])
    const totals = (data) => {
        setTotalSum(data)
    }
    const SendAddress = (data) => {
        setAddressdata(data);
    };

    return (
        <MapContext.Provider value={{ timelineData, SendAddress, addressdata, totals, totalSum }}>
            {children}
        </MapContext.Provider>
    );
};