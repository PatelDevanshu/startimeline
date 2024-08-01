import React from 'react';
import './Navbar.css';
import Logo from '../../assets/img/logo/Usertimeline.png';

const Navbar = () => {
    return (
        <div className='navbar'>
            <div className='container-fluid'>
                <div className='navbar_logo'>
                    <a href='/login'>
                        <img src={Logo} alt='User Timeline' className='logo_img'></img>
                    </a>
                </div>
                <div></div>
            </div>
        </div>
    );
};

export default Navbar;