import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/user/logo.png';
import './Template.css';

function Template({ children }) {
    return (
        <div className='general container-fluid'>
            <div className='task-bar'>
                <img src={logo} alt='logo' className='logo' />
                <div className='border-start border-2 border-black border-opacity-25 h-75'></div>
            </div>
            <div className="content-area">{children}</div>
        </div>
    );
}

export default Template;
