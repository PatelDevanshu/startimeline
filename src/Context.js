import React, { createContext, useState } from 'react';

export const MapContext = createContext();

export const MapProvider = ({ children }) => {
    const [addressdata, setAddressdata] = useState(null);
    const [totalSum, setTotalSum] = useState({});
    const [timelineData, setTimelineData] = useState(['']);
    const [handler, setHandler] = useState({
        loader: false,
        error: false,
        notfound: false
    })

    // useEffect(() => {
    //     // fetch("https://crm.star-ind.com/index.php?entryPoint=dtTimeline")
    //     fetch("http://localhost:4001/api/filterdata")
    //         .then((res) => res.json())
    //         .then((data) => {
    //             console.log("userdata", data);
    //             let sortredData = data;
    //             sortredData.sort((a, b) => {
    //                 const timeA = new Date(a.date_entered).getTime()
    //                 const timeB = new Date(b.date_entered).getTime()

    //                 return timeA - timeB

    //             });
    //             setTimelineData(sortredData)
    //         })
    //         .catch(err => console.log(err))
    // }, [])
    const totals = (data) => {
        setTotalSum(data)
    }
    const SendAddress = (data) => {
        setAddressdata(data);
    };
    const SetData = (data) => {
        setTimelineData(data);
    }
    const SetHandler = (data) => {
        setHandler(data);
    }

    return (
        <MapContext.Provider value={{ timelineData, SendAddress, addressdata, totals, totalSum, SetData, SetHandler, handler }}>
            {children}
        </MapContext.Provider>
    );
};