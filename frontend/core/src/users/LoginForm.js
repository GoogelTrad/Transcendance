import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { showToast } from '../instance/ToastsInstance';
import axiosInstance from '../instance/AxiosInstance';
import 'react-toastify/dist/ReactToastify.css';
import './LoginForm.css';
import { useAuth } from './AuthContext';

function LoginRegister() {
    const navigate = useNavigate();
    const {isAuthenticated, setIsAuthenticated} = useAuth();
    const [loginData, setLoginData] = useState({
        name: '',
        password: '',
    });

    const [registerData, setRegisterData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirm: '',
    });

    const handleLoginChange = (e) => {
        const { name, value } = e.target;
        setLoginData({
            ...loginData,
            [name]: value,
        });
    };

    const handleSchoolLogin = async (e) => {
        e.preventDefault();
        try {
            window.location.href = "http://localhost:8000/auth/code";
        }
        catch(error) {
            return "Error while trying to connect with 42."
        }
    }

    const handleRegisterChange = (e) => {
        const { name, value } = e.target;
        setRegisterData({
            ...registerData,
            [name]: value,
        });
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        for (const [key, value] of Object.entries(loginData)) {
            data.append(key, value);
        }
        try {
            await axiosInstance.post('api/login', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setIsAuthenticated(true);
            navigate('/home');
        } catch (error) {
            showToast('error', 'Incorrect login or password!');
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        for (const [key, value] of Object.entries(registerData)) {
            data.append(key, value);
        }
        try {
            await axiosInstance.post('api/user/create', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setIsAuthenticated(true);
            navigate('/login');
        } catch (error) {
            showToast('error', 'Cannot create the account!');
        }
    };

    return (
        <div className="general-forms d-flex justify-content-around align-items-center vh-100">
            <div className="d-flex flex-column border">
                <h2 className='titre'>Login here</h2>
                <form className='login-form d-flex flex-column gap-2 align-items-end' onSubmit={handleLoginSubmit}>
                    <div className='form-group'>
                        <label htmlFor='name'>Username:</label>
                        <input className='login-input'
                            type='text'
                            id='login-name'
                            name='name'
                            value={loginData.name}
                            onChange={handleLoginChange}
                            required
                            placeholder='Username'>
                        </input>
                    </div>
                    <div className='form-group'>
                        <label htmlFor='password'>Password:</label>
                        <input className='login-input'
                            type='password'
                            id='login-password'
                            name='password'
                            value={loginData.password}
                            onChange={handleLoginChange}
                            required
                            placeholder='Password'>
                        </input>
                    </div>

                    <Button type='submit' className='submit-button btn'>Login</Button>
                </form>
                <div>
                    <button type="submit" onClick={handleSchoolLogin}>42</button>
                </div>
            </div>
            <div className="general-register">
                <div className="d-flex flex-column border">
                    <h2 className='titre'>Register here</h2>
                    <form className='register-form d-flex flex-column gap-2 align-items-end' onSubmit={handleRegisterSubmit}>
                        <div className='form-group '>
                            <label htmlFor='name'>Username:</label>
                            <input className='register-input'
                                type='text'
                                id='register-name'
                                name='name'
                                value={registerData.name}
                                onChange={handleRegisterChange}
                                required
                                placeholder='Username'>
                            </input>
                        </div>
                        <div className='form-group'>
                            <label htmlFor="email">Mail:</label>
                            <input className='register-input'
                                type='email'
                                id='register-email'
                                name='email'
                                value={registerData.mail}
                                onChange={handleRegisterChange}
                                required
                                placeholder='Email'>
                            </input>
                        </div>
                        <div className='form-group'>
                            <label htmlFor='password'>Password:</label>
                            <input className='register-input'
                                type='password'
                                id='register-password'
                                name='password'
                                value={registerData.password}
                                onChange={handleRegisterChange}
                                required
                                placeholder='Password'>
                            </input>
                        </div>
                        <div className='form-group'>
                            <label htmlFor='password_confirm'>Confirm Password:</label>
                            <input className='register-input'
                                type='password'
                                id='register-password_confirm'
                                name='password_confirm'
                                value={registerData.password_confirm}
                                onChange={handleRegisterChange}
                                required
                                placeholder='Confirm Password'>
                            </input>
                        </div>

                        <Button type='submit' className='submit-button btn'>Register</Button>
                    </form>
                </div>
            </div>

            <ToastContainer />
        </div>
    );
}

export default LoginRegister;
