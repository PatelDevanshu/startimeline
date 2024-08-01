import React, { useContext, useState } from 'react';
import './Login.css';
import Navbar from '../Navbar/Navbar';
import { AuthContext } from '../AuthContext/Authcontext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    const { login } = useContext(AuthContext);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData({
            ...formData, [name]: value
        })
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        const response = await fetch("https://startimeline.onrender.com/auth/login", {
            method: "post",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        })

        if (response.ok) {
            const data = await response.json();
            login(data.user);
            navigate('/');
        }
        else {
            alert("Invalid Credentials");
        }
    }

    return (
        <div>
            <Navbar />
            <div className='container-fluid loginpg'>
                <div className='container login_cont'>
                    <div className='row'>
                        <div className='col-md-3'></div>
                        <div className='col-md-6'>
                            <div className='login_head'>
                                <h1 className='login_heading'>SIGN IN</h1>
                            </div>
                            <div className='form_cont'>
                                <form onSubmit={handleSubmit}>
                                    <div className='form-group form_row'>
                                        <div className='row'>
                                            <div className='col-sm-4'>
                                                <label className='label'>Username : </label>
                                            </div>
                                            <div className='col-sm-8'>
                                                <input type='text' name='username' className='form-control inp_field' value={formData.username} onChange={handleChange} placeholder='admin' required></input>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='form-group form_row'>
                                        <div className='row'>
                                            <div className='col-sm-4'>
                                                <label className='label'>Password : </label>
                                            </div>
                                            <div className='col-sm-8'>
                                                <input type='password' name='password' className='form-control inp_field' value={formData.password} onChange={handleChange} placeholder='admin123' required></input>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='form-group form_row'>
                                        <button type='submit' className='btn btn-success btn-lg'>Log In</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div className='col-md-3'></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;