import React, { useEffect, useState } from 'react'
import calenderLogo from "../../assets/icons/calendar-line.svg"
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import "./Navigation.scss"
import axios from 'axios';


const Navigation = ({ props1, openCalender }) => {
    const [showCalender, setShowCalender] = useState(false)
    const [cal, setCal] = useState(new Date());


    // const { updatedData } = useContext(MapContext);

    useEffect(() => {
        showCalendersHandler()
        handleDateformat(cal);
        fetchAxiosdata();
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
            console.log("no selected id");
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

                    console.log("USERDATA after post", res.data);

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