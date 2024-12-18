import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import './LoginForm.css';
import {Link} from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import axiosInstance from '../instance/AxiosInstance';
import { ToastContainer } from 'react-toastify';
import { showToast } from '../instance/ToastsInstance';
import 'react-toastify/dist/ReactToastify.css';

function LoginForm()
{
    const {isAuthenticated, setIsAuthenticated} = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState
    ({
        name: 'r',
        password: 'r',
    });

    const handleChange = (e) => 
    {
        e.preventDefault();
        const {name, value} = e.target;
        setFormData
        ({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) =>
    {
        e.preventDefault();
        const data = new FormData();
        for (const [key, value] of Object.entries(formData))
            data.append(key, value);
        try 
        {
            await axiosInstance.post('api/login', data, {
                headers: {
                'Content-Type': 'multipart/form-data',
            }})
            setIsAuthenticated(true);
            navigate("/home");
        } 
        catch (error) {
            showToast("error", "Incorrect login or password!");
            console.error(error);
        }
    };

    return (
        <>
            <div className='login-container'>
                <form className='login-form' onSubmit={handleSubmit}>
                    <h1 className='title'>Please Login</h1>
                    <div className='form-group'>
                        <label htmlFor='name'>Username</label>
                        <input className='input-form'
                            type='text'
                            id='name'
                            name='name'
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder='Type your username'>    
                        </input>
                    </div>
                    <div className='form-group'>
                        <label htmlFor='password'>Password</label>
                        <input className='input-form'
                            type='password'
                            id='password'
                            name='password'
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder='Type your password'>
                        </input>
                    </div>

                    <Button type='submit' className='submit-button btn'>Login</Button>
                    <div className='register-text'>
                        <p>Need to create an account ?</p>
                        
                        <div className='register-here'>
                            <Link to='/register'>Register here</Link>
                        </div>
                    </div>
                    <div>
                    </div>
                </form>
                <ToastContainer />
            </div>
        </>
    )
}

export default LoginForm;