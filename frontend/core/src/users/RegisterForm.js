import React, { useState } from 'react';
import axios from 'axios'
import Button from 'react-bootstrap/Button';
import './RegisterForm.css'
import {useNavigate, Link } from 'react-router-dom';


function RegisterForm()
{
    const navigate = useNavigate();
    const [formData, setFormData] = useState
    ({
        name: '',
        email: '',
        password: '',
        // password_confirm: '',
    });

    const handleChange = (e) =>
    {
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
        {
            data.append(key, value);
        }
        try 
        {
            await axios.post('http://localhost:8000/api/user/create/', data, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            navigate("/home");
        } 
        catch (error)
        {
            console.error(error);
        }
    };

    return (
        <>
            <div className='form-container'>
                <div className='form-box'>
                    <h2>Register here</h2>
                    <form className='registration-form' onSubmit={handleSubmit}>
                        <div className='form-group'>
                            <label htmlFor='name'>Username:</label>
                            <input className='input-form'
                                type='text'
                                id='name'
                                name='name'
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder='Username'>
                            </input>
                        </div>
                        <div className='form-group'>
                            <label htmlFor="email">Mail:</label>
                            <input className='input-form'
                                type='email'
                                id='email'
                                name='email'
                                value={formData.mail}
                                onChange={handleChange}
                                required
                                placeholder='Email'>
                            </input>
                        </div>
                        <div className='form-group'>
                            <label htmlFor='password'>Password:</label>
                            <input className='input-form'
                                type='password'
                                id='password'
                                name='password'
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder='Password'>
                            </input>
                        </div>
                        {/* <div className='form-group'>
                            <label htmlFor='password_confirm'>Confirm Password:</label>
                            <input className='input-form'
                                type='password'
                                id='password_confirm'
                                name='password_confirm'
                                value={formData.password_confirm}
                                onChange={handleChange}
                                required
                                placeholder='Confirm Password'>
                            </input>
                        </div> */}

                        <Button type='submit' className='submit-button btn'>Register</Button>
                    </form>
                    <div className='login-text'>
                        <p>Already have an account ?</p>
                        
                        <div>
                            <Link to='/login'>Login</Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default RegisterForm;