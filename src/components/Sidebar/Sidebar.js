import React, { useContext, useEffect, useState } from 'react'
import logo from "../../assets/img/logo/Usertimeline_logo.png"
import userLogo from "../../assets/icons/user-line.svg"
import "./Sidebar.scss"
import Timeline from '../Timeline/Timeline'
import Navigation from '../Navigation/Navigation'
import { MapContext } from '../../Context';
import { AuthContext } from '../../Auth/AuthContext/Authcontext'
import { Link } from 'react-router-dom'


function Sidebar() {
  const [showUsers, setShowUsers] = useState(false)
  const [iddata, setIddata] = useState([""]);
  const [selectedid, setSelectedid] = useState("");
  const [userName, setUserName] = useState(null)
  const [renderTimeline, setRenderTimeline] = useState(null)
  const [openCalender, setOpenCalender] = useState(0);
  const { addressdata, totalSum, loader, error } = useContext(MapContext);
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    fetch("https://startimeline.onrender.com/users/useriddata")
      .then((res) => res.json())
      .then((data) => setIddata(data))
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    setRenderTimeline(addressdata);
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
    setUserName(event.userName);
  };

  function showUsersHandler() {
    setShowUsers((prevState) => {
      return !prevState
    })
  }

  const handleLogout = () => {
    logout();
  }

  return (
    <div className='sidebar' >
      {showUsers && <div onClick={showUsersHandler} id="overlay"></div>}
      <div className="sidebar-header">
        <div className="img-container">
          <Link to='/'>
            <img src={logo} alt="Company Logo" id='usert_logo' />
          </Link>
        </div>
        {userName && <p className='username'>{userName}</p>}
        <div className="sidebar-user__data" onClick={showUsersHandler}>
          <img src={userLogo} alt="user" />
        </div>
        {showUsers &&
          <ul
            name="usercredentials"
            className="sidebar-usersid"
            id="usercrd"
            value={selectedid}
          >
            {arrUser.length > 1 ? arrUser.map((d) => {
              return (
                <li key={d.id} className={d.id === selectedid ? "active" : ''} onClick={() => handleUserid({
                  id: d.id,
                  userName: d.uname
                })} >
                  {d.uname}
                </li>
              );
            }) :
              <li key='0'>Loading...</li>
            }
          </ul>
        }
      </div>
      <div className='sidebar-logout'>
        <button type='button' className='btn btn-secondary logout_btn' onClick={handleLogout}>Logout</button>
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

      {loader ? <div className='timeline_msg'>Loading...</div> : ''}
      {error ? <div className='timeline_msg'>User had travlled within 5kms.</div> : ''}
      <ul className='timeline'>
        {renderTimeline && !loader && renderTimeline.map((d) =>
          <Timeline key={d.id} startAddress={d.startAddress} endAddress={d.endAddress} duration={d.duration} distance={d.distance} />
        )}
      </ul>
    </div>
  )
}

export default Sidebar