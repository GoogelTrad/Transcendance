import React, { useState } from 'react';
import axios from 'axios'
import Button from 'react-bootstrap/Button';

// import './RegisterForm.css'

function RegisterForm()
{
    const [formData, setFormData] = useState
    ({
        pseudo: '',
        mail: '',
        password: '',
        password_confirm: '',
        pp: null,
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
            const response = await axios.post('http://localhost:8000/users/register', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            alert(response.data.message);
        } 
        catch (error)
        {
            alert("Error! Bad Input!");
            console.error(error);
        }
    };


    return (
        <>
            <div className='form-container' class="d-flex p-1 justify-content-center flex-row vh-100">
                <div class="d-flex flex-column border border-black border-2 rounded align-items-center h-full p-2 align-self-center">
                    <h2 class="p-2 text-">User Registration</h2>
                    <form className='registration-form' onSubmit={handleSubmit} class="d-flex flex-column align-items-center gap-2">
                        <div className='form-group' class="d-flex input-group input-group-sm w-full flex-column">
                            <label htmlFor='pseudo'>Username:</label>
                            <input
                                class="form-control w-100 border rounded-3"
                                type='text'
                                id='pseudo'
                                name='pseudo'
                                value={formData.pseudo}
                                onChange={handleChange}
                                required>
                            </input>
                        </div>
                        <div className='form-group' class="d-flex input-group input-group-sm w-full flex-column">
                            <label htmlFor="mail">Mail:</label>
                            <input
                                class="form-control w-100 border rounded-3"
                                type='email'
                                id='mail'
                                name='mail'
                                value={formData.mail}
                                onChange={handleChange}
                                required>
                            </input>
                        </div>
                        <div className='form-group' class="d-flex input-group input-group-sm w-full flex-column">
                            <label htmlFor='password'>Password:</label>
                            <input 
                                class="form-control w-100 border rounded-3"
                                type='password'
                                id='password'
                                name='password'
                                value={formData.password}
                                onChange={handleChange}
                                required>
                            </input>
                        </div>
                        <div className='form-group' class="d-flex input-group input-group-sm w-full flex-column">
                            <label htmlFor='password_confirm'>Confirm Password:</label>
                            <input
                                class="form-control w-100 border rounded-3"
                                type='password'
                                id='password_confirm'
                                name='password_confirm'
                                value={formData.password_confirm}
                                onChange={handleChange}
                                required>
                            </input>
                        </div>

                        {errorMessage && <p className='error-message'>{errorMessage}</p>}
                        {successMessage && <p className='success-manage'>{successMessage}</p>}

                        <Button type='submit' className='submit-button' class="btn btn-primary p-2 border border-0 rounded-pill">Register</Button>
                    </form>
                    </div>
            </div>
        </>

    );
}

export default RegisterForm;