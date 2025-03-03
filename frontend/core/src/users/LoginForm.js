import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { showToast } from '../instance/ToastsInstance';
import axiosInstance from '../instance/AxiosInstance';
import 'react-toastify/dist/ReactToastify.css';
import './LoginForm.css';
import { useAuth } from './AuthContext';
import AuthSchool from './AuthSchool';

export function ValidatePassword(password){
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[@$!%*?&]/.test(password);

    if (password && password.length >= minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar) 
        return true;
    else 
        return false;
};

function LoginRegister({setModal, setTerminal, removeLaunch}) {
    const [step, setStep] = useState(false);
    const [code, setCode] = useState();
    const navigate = useNavigate();
    const [rulesPassword, setRulesPassword] = useState(false);
    const authChannel = new BroadcastChannel("auth_channel");
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

    const handleSchoolLogin = () => {    
        AuthSchool();  
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
        if(isAuthenticated)
            return showToast('error', 'Alrealdy connected!');
        try {
            const response = await axiosInstance.post('/api/user/login', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 401)
                setStep(true);
            else if (response.status === 200) {
                setIsAuthenticated(true);
                setModal(false);
                setTerminal(false);
                removeLaunch("terminal");
                removeLaunch("forms");
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
            const response = await axiosInstance.post('/api/user/code' , {code, name: loginData.name});
            if (response.status === 200)
            {
                setIsAuthenticated(true);
                setModal(false);
                setTerminal(false);
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
        setRulesPassword(false);
        //A remettre pour les regles du mot de passe.
        // if (!ValidatePassword(data.password))
        //     setRulesPassword(true);
        if(isAuthenticated)
            return showToast('error', 'Cannot create new account while connected!');
        try {
            await axiosInstance.post('/api/user/create', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            showToast('success', 'Account created succesfully!');
        } catch (error) {
            showToast('error', 'Cannot create the account!');
        }
    };

    useEffect(() => {
        authChannel.onmessage = (event) => {
            const { token } = event.data;
            if (token) {
                document.cookie = `token=${token}`;
                setIsAuthenticated(true);
                setModal(false);
                setTerminal(false);
                removeLaunch("terminal");
                removeLaunch("forms");
                navigate('/');
            }
        };

        return () => {
            authChannel.close();
        };
    }, []);
    
    return (
            <div className="coucou row">
                {step === false ? (
                    <div className="col-md-6 d-flex flex-column align-items-center justify-content-center border-end">
                        <div className='login-coucou d-flex flex-column align-items-center'>
                            <h2 className='titre-coucou'>Login here</h2>
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
                                <AuthSchool/>
                                {/* <Button type="submit" className='submit-button btn btn-primary' onClick={AuthSchool}>42</Button> */}
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
                        <h2 className='titre-coucou'>Register here</h2>
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
                                {rulesPassword && 
                                    <p className='rule-password'>
                                        Password need to contains :
                                        <br />
                                            At least 8 characters long
                                        <br / >
                                            At least 1 uppercase
                                        <br />
                                            At least 1 lowercase
                                        <br />
                                            At least 1 number
                                        <br />
                                            At least 1 special caractere (@$!%*?&)
                                    </p>
                                }
                            </div>
                            <div className='mb-3'>
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
