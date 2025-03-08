import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import { useNavigate, Link } from 'react-router-dom';
import { showToast } from '../instance/ToastsInstance';
import axiosInstance from '../instance/AxiosInstance';
import 'react-toastify/dist/ReactToastify.css';
import './LoginForm.css';
import { useAuth } from './AuthContext';
import AuthSchool from './AuthSchool';

import { useTranslation } from 'react-i18next';

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

    const { t } = useTranslation();
    const [step, setStep] = useState(false);
    const [code, setCode] = useState('');
    const navigate = useNavigate();
    const [rulesPassword, setRulesPassword] = useState(false);
    const {isAuthenticated, login} = useAuth();
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
            return showToast('error', t('Toasts.AlrealdyConnected'));
        try {
            const response = await axiosInstance.post('/api/user/login', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log("coucou")
            if (response.status === 200) {
                login();
                setModal(false);
                setTerminal(false);
                removeLaunch("terminal");
                removeLaunch("forms");
                navigate('/home');
            }
        } catch (error) {
            if (error.status === 403)
                setStep(true);
            else 
                showToast('error', t('Toasts.IncorrectLoginOrPassword'));
    }
    };

    const handleVerify = async () => {
        try {
            const response = await axiosInstance.post('/api/user/code' , {code, name: loginData.name});
            if (response.status === 200)
            {
                login();
                setModal(false);
                setTerminal(false);
                removeLaunch("terminal");
                removeLaunch("forms");
                navigate('/home');
            }
        }
        catch(error) {
            showToast("error", t('ToastsError'));
        }
    }

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        for (const [key, value] of Object.entries(registerData)) {
            data.append(key, value);
        }
        setRulesPassword(false);
        // if (!ValidatePassword(data.password))
        //     setRulesPassword(true);
        if(isAuthenticated)
            return showToast('error', t('Toasts.NotCreateNewAccountWhileConnected'));
        try {
            const response = await axiosInstance.post('/api/user/create', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            showToast("info", t('Toasts.AccountCreatedSuccesfully'));
        } catch (error) {
            console.log(error);
            if (error.response) {
                if (error.response.status === 406) {
                    showToast("error", t('Toasts.EmailType'));
                }
                else if (error.response.status === 403)
                    showToast("error", t("Toasts.NameAlreadyTaken"));
                else {
                    showToast("error", t("Toasts.CannotCreateTheAccount"));
                }
            } else {
                showToast("error", t("Toasts.CannotCreateTheAccount"));
            }
        }
    };

    // useEffect(() => {console.log(step)}, [step]);
    
    return (
            <div className="coucou row">
                {step === false ? (
                    <div className="col-md-6 d-flex flex-column align-items-center justify-content-center border-end">
                        <div className='login-coucou d-flex flex-column align-items-center'>
                            <h2 className='titre-coucou'>{t('Login')}</h2>
                            <form className='w-75 d-flex flex-column align-items-center' onSubmit={handleLoginSubmit}>
                                <div className='mb-3'>
                                    <label htmlFor='name'>{t('Username')}:</label>
                                    <input className='login-input'
                                        type='text'
                                        id='login-name'
                                        name='name'
                                        value={loginData.name}
                                        onChange={handleLoginChange}
                                        required
                                        placeholder={t('Username')}>
                                    </input>
                                </div>
                                <div className='mb-3'>
                                    <label htmlFor='password'>{t('PasswordConnect')}:</label>
                                    <input className='login-input'
                                        type='password'
                                        id='login-password'
                                        name='password'
                                        value={loginData.password}
                                        onChange={handleLoginChange}
                                        required
                                        placeholder={t('PasswordConnect')}>
                                    </input>
                                </div>
                                <Button type='submit' className='submit-button btn btn-primary'>{t('LoginButton')}</Button>
                            </form>
                            <div>
                                <AuthSchool noButton={false}/>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="col-md-6 d-flex flex-column align-items-center justify-content-center border-end">
                        <h2>{t('ConfirmationCode')}</h2>
                        <input
                            type="text"
                            placeholder={t('ConfirmationCode')}
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                        />
                        <button onClick={handleVerify}>{t('Verify')}</button>
                        <button onClick={() => setStep(false)}>{t('Cancel')}</button>
                    </div>
                )}
                <div className="col-md-6 d-flex flex-column align-items-center justify-content-center">
                    <div className='register-coucou d-flex flex-column align-items-center'>
                        <h2 className='titre-coucou'>{t('RegisterHere')}</h2>
                        <form className='w-75 d-flex flex-column align-items-center' onSubmit={handleRegisterSubmit}>
                            <div className='mb-3'>
                                <label htmlFor='name'>{t('Username')}:</label>
                                <input className='register-input'
                                    type='text'
                                    id='register-name'
                                    name='name'
                                    value={registerData.name}
                                    onChange={handleRegisterChange}
                                    required
                                    placeholder={t('Username')}>
                                </input>
                            </div>
                            <div className='mb-3'>
                                <label htmlFor="email">{t('Email')}:</label>
                                <input className='register-input'
                                    type='text'
                                    id='register-email'
                                    name='email'
                                    value={registerData.email}
                                    onChange={handleRegisterChange}
                                    required
                                    placeholder={t('Email')}>
                                </input>
                            </div>
                            <div className='mb-3'>
                                <label htmlFor='password'>{t('PasswordConnect')}:</label>
                                <input className='register-input'
                                    type='password'
                                    id='register-password'
                                    name='password'
                                    value={registerData.password}
                                    onChange={handleRegisterChange}
                                    required
                                    placeholder={t('PasswordConnect')}>
                                </input>
                                {rulesPassword && 
                                    <p className='rule-password'>
                                        {t('PasswordContains')} :
                                        <br />
                                            {t('8CharactersLong')}
                                        <br />
                                            {t('1Uppercase')}
                                        <br />
                                            {t('1Lowercase')}
                                        <br />
                                            {t('1Number')}
                                        <br />
                                            {t('1SpecialCaractere')}
                                    </p>
                                }
                            </div>
                            <div className='mb-3'>
                                <label htmlFor='password_confirm'>{t('ConfirmPassword')}:</label>
                                <input className='register-input'
                                    type='password'
                                    id='register-password_confirm'
                                    name='password_confirm'
                                    value={registerData.password_confirm}
                                    onChange={handleRegisterChange}
                                    required
                                    placeholder={t('ConfirmPassword')}>
                                </input>
                            </div>

                            <Button type='submit' className='submit-button btn'>{t('Register')}</Button>
                        </form>
                    </div>
                </div>

            </div>
    );
}

export default LoginRegister;