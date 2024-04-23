import React, { useContext, useEffect, useState } from 'react'
import calenderLogo from "../../assets/icons/calendar-line.svg"
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import "./Navigation.scss"
import axios from 'axios';
import { MapContext } from '../../Context';



const Navigation = ({ props1, openCalender }) => {
    const [showCalender, setShowCalender] = useState(false)
    const [cal, setCal] = useState(new Date());
    const { SetData } = useContext(MapContext);



    // const { updatedData } = useContext(MapContext);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        showCalendersHandler()
        handleDateformat(cal);
        fetchAxiosdata();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [openCalender]);


    let dateFormat;

    function handleDateformat(event) {
        const year = event.getFullYear();
        const month = String(event.getMonth() + 1).padStart(2, 0);
        const date = String(event.getDate()).padStart(2, 0);
        dateFormat = `${year}-${month}-${date}`;

    };
    const fetchAxiosdata = async () => {
        if (props1 === '') {
            alert("Please select a user");
        }
        else {
            await axios
                .post("http://localhost:4001/users/userData", {
                    props1,
                    dateFormat
                }, {
                    headers: {
                        // "Content-Type": "application/json",
                        // "Access-Control-Allow-Origin": "*"
                    }
                })
                .then((res) => {

                    let sortredData = res.data;
                    sortredData.sort((a, b) => {
                        const timeA = new Date(a.date_entered).getTime()
                        const timeB = new Date(b.date_entered).getTime()
                        return timeA - timeB
                    });
                    SetData(sortredData);
                    setShowCalender(false);
                })
                .catch((error) => {
                    console.error("Error fetching user data:", error);
                });
        }

    }


    const showCalendersHandler = async () => {

        setShowCalender((prevState) => {
            return !prevState
        });
    }
    const handleCalendar = async (event) => {
        setCal(event);
        handleDateformat(event);
        fetchAxiosdata();
    };






    return (
        <div className='navigation'>


            <button className='navigation-button' onClick={showCalendersHandler}>Select Date  <img src={calenderLogo} alt="" /> </button>
            <Calendar className={showCalender ? "navigation-calender active" : "navigation-calender"} onChange={handleCalendar} value={cal} />

        </div>

    )
}

export default Navigation