import React, { useContext, useEffect, useState } from 'react'
import logo from "../../assets/img/logo/dreamer.png"
import userLogo from "../../assets/icons/user-line.svg"
import "./Sidebar.scss"
import Timeline from '../Timeline/Timeline'
import Navigation from '../Navigation/Navigation'
import { MapContext } from '../../Context';


function Sidebar() {
  const [showUsers, setShowUsers] = useState(false)
  const [iddata, setIddata] = useState([""]);
  const [selectedid, setSelectedid] = useState("");
  const [userName, setUserName] = useState(null)
  const { addressdata } = useContext(MapContext);
  const { totalSum } = useContext(MapContext)
  const [renderTimeline, setRenderTimeline] = useState(null)
  const [openCalender, setOpenCalender] = useState(0)



  useEffect(() => {

    fetch("https://startimeline.onrender.com/users/useriddata")
      .then((res) => res.json())
      .then((data) => setIddata(data))
      .catch((err) => console.log(err));
    setRenderTimeline(addressdata)
  }, [addressdata]);



  let arrUser = [{ id: "", uname: "" }];
  let uiddata = iddata.map((d) => {
    // console.log("in iddata", d);
    return { id: d.id, uname: d.user_name };
  });
  arrUser = [].concat(uiddata);
  const handleUserid = async (event) => {
    setOpenCalender((prevState) => prevState = prevState + 1)

    setShowUsers((prevState) => {
      return !prevState
    })

    setSelectedid(event.id);
    setUserName(event.userName)

  };

  function showUsersHandler() {
    setShowUsers((prevState) => {
      return !prevState
    })
  }


  return (

    <div className='sidebar' >
      {showUsers && <div onClick={showUsersHandler} id="overlay"></div>}
      <div className="sidebar-header">
        <div className="img-container">
          <img src={logo} alt="Company Logo" />
        </div>
        {userName && <p className='username'>{userName}</p>}
        <div className="sidebar-user__data" onClick={showUsersHandler}>
          <img src={userLogo} alt="" />
        </div>
        {showUsers &&
          <ul
            name="usercredentials"
            className="sidebar-users"
            id="usercrd"
            value={selectedid}
          >
            {arrUser.map((d) => {
              return (
                <li key={d.id} className={d.id === selectedid ? "active" : ''} onClick={() => handleUserid({
                  id: d.id,
                  userName: d.uname
                })} >
                  {d.uname}
                </li>
              );
            })}
          </ul>
        }

      </div>


      {selectedid && <Navigation props1={selectedid} openCalender={openCalender} />}

      {selectedid && <div className='totals'>

        <div className='total-time'>
          <h5>Total Time</h5>
          <p>{totalSum.totalDistance} Km</p>
        </div>
        <div className='total-duration'>
          <h5>Total Duration</h5>
          <p>{totalSum.totalDuration} hrs</p>
        </div>


      </div>}



      <ul className='timeline'>

        {renderTimeline && renderTimeline.map((d) =>
          <Timeline key={d.id} startAddress={d.startAddress} endAddress={d.endAddress} duration={d.duration} distance={d.distance} />
        )}



      </ul>
    </div>
  )
}

export default Sidebar