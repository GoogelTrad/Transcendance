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
    const [step, setStep] = useState(false);
    const [code, setCode] = useState();
    const navigate = useNavigate();
    const {isAuthenticated, setIsAuthenticated} = useAuth();
    const [loginData, setLoginData] = useState({
        name: 'f',
        password: 'f',
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
            const response = await axiosInstance.post('api/login', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 401)
                setStep(true);
            else if (response.status === 200) {
                setIsAuthenticated(true);
                navigate('/home');
            }
        } catch (error) {
            if (error.response && error.response.status === 401) 
                setStep(true); 
            else 
                showToast('error', 'Incorrect login or password!');
        }
    };

    const handleVerify = async () => {
        try {
            const response = await axiosInstance.post('/api/code' , {code, name: loginData.name});
            if (response.status === 200)
            {
                setIsAuthenticated(true);
                navigate('/home');
            }
        }
        catch(error) {
            console.log('error');
        }
    }

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
        } catch (error) {
            showToast('error', 'Cannot create the account!');
        }
    };

    return (
            <div className="coucou row">
                {step === false ? (
                    <div className="col-md-6 d-flex flex-column align-items-center justify-content-center border-end">
                        <div className='login-coucou d-flex flex-column align-items-center'>
                            <h2 className='titre'>Login here</h2>
                            <form className='w-75 d-flex flex-column align-items-center' onSubmit={handleLoginSubmit}>
                                <div className='mb-3'>
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
                                <div className='mb-3'>
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
                                <Button type='submit' className='submit-button btn btn-primary'>Login</Button>
                            </form>
                            <div>
                                <Button type="submit" className='submit-button btn btn-primary' onClick={handleSchoolLogin}>42</Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="col-md-6 d-flex flex-column align-items-center justify-content-center border-end">
                        <h2>Enter Confirmation Code</h2>
                        <input
                            type="text"
                            placeholder="Confirmation Code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                        />
                        <button onClick={handleVerify}>Verify</button>
                        {/* <button onClick={setStep(false)}>Cancel</button> */}
                    </div>
                )}
                <div className="col-md-6 d-flex flex-column align-items-center justify-content-center">
                    <div className='register-coucou d-flex flex-column align-items-center'>
                        <h2 className='titre'>Register here</h2>
                        <form className='w-75 d-flex flex-column align-items-center' onSubmit={handleRegisterSubmit}>
                            <div className='mb-3'>
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
                            <div className='mb-3'>
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
                            <div className='mb-3'>
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
                            <div className=' mb-3'>
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
