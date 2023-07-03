import React from 'react'
import durationLogo from "../../assets/icons/time-line.svg"
import motoLogo from "../../assets/icons/motorbike-line.svg"
import "./Timeline.scss"


function Timeline(props) {
    return (
        <li className='timeline-item'>



            <div className="start">
                <h1>{props.title}</h1>
                <p>{props.startAddress}</p>
            </div>

            <div className="timeline-details">
                <div className="timeline-item__innerdata">
                    <div className="data-img">
                        <img src={durationLogo} alt="" />
                    </div>
                    <h2>{props.duration}</h2>
                </div>

                <div className="timeline-road"></div>

                <div className="timeline-item__innerdata">
                    <div className="data-img">
                        <img src={motoLogo} alt="" />
                    </div>
                    <h2>{props.distance}</h2>
                </div>
            </div>
            <div className="end">
                <h1>{props.endTitle}</h1>
                <p>{props.endAddress}</p>
            </div>


        </li>

    )
}

export default Timeline