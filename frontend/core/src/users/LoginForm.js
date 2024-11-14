import React, { useState } from 'react';
import axios from 'axios'
import Button from 'react-bootstrap/Button';
import './LoginForm.css'
import {Link} from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

function LoginForm()
{
    const navigate = useNavigate();
    const [formData, setFormData] = useState
    ({
        username: '',
        password: '',
    });

    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

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
            data.append(key, value)
        try
        {
            const reponse = await axios.post('http://localhost:8000/users/login', data, {
                headers:{
                    'Content-Type': 'multipart/form-data',
                }
            });

            if (reponse.status == 201)
            {
                //token
                if (reponse.data.token)
                    localStorage.setItem('access_token', reponse.data.token);
                navigate('/home');
            }
            else
                alert("Login successful but something went wrong!");
            // alert(reponse.data.message);
        }
        catch (error)
        {
            if (error.reponse)
                alert(`Error: ${error.reponse.data.message || "Bad Input"}`);
            else if (error.request)
                alert("Network error! Please try again later.");
            else
                alert("An unexpected error occurred!");

            console.error(error);
        }
    };

    return (
        <>
            <div className='login-container'>
                <form className='login-form' onSubmit={handleSubmit}>
                    <h1 className='title'>User Login</h1>
                    <div className='form-group'>
                        <label htmlFor='username'>Username</label>
                        <input className='input-form'
                            type='text'
                            id='username'
                            name='username'
                            value={formData.username}
                            onChange={handleChange}
                            required
                            placeholder='Username'>    
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
                            placeholder='Password'>
                        </input>
                    </div>

                        {errorMessage && <p className='error-message'>{errorMessage}</p>}
                        {successMessage && <p className='success-manage'>{successMessage}</p>}
    
                    <Button type='submit' className='submit-button' class="btn btn-primary p-2 border border-0 rounded-pill">Login</Button>
                    <div className='register-text'>
                        <p>Need to create an account ?</p>
                        
                        <div>
                            <Link to='/register'>Register here</Link>
                        </div>
                    </div>
                </form>
            </div>
        </>
    )
}

export default LoginForm;