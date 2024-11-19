import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import RegisterForm from './users/RegisterForm';
import LoginForm from './users/LoginForm';
import Home from './Home';
import Logout from './users/Logout';
import { AuthProvider, useAuth } from './users/AuthContext';
import { BrowserRouter as Router, Route, Routes, Link, Outlet, Navigate, useNavigate } from 'react-router-dom';
import React, {useEffect, useState} from "react";

export function getCookies(name) {
  const value = document.cookie;
  let parts = null;
  if (!value)
    parts = null;
  else
  parts = value.match(`(?:\s|^)${name}=([^;]*);?`)[1];

return (parts);
}

function NavBar()
{
  const {isAuthenticated} = useAuth();

  return (
    <nav className='nav'>
      <div>
        <button className="buttonAccueil">
          <Link to="/home" className="text-decoration-none text-dark">Home</Link>
        </button>
      </div>

      {!isAuthenticated && (
        <>
          <div>
            <button className="buttonRegister">
              <Link to="/register" className="text-decoration-none text-dark">Register</Link>
            </button>
          </div>
          <div>
            <button className="buttonLogin">
              <Link to="/login" className="text-decoration-none text-dark">Login</Link>
            </button>
          </div>
        </>
      )}

      {isAuthenticated && (
        <>
          <div>
            <button className="buttonGame">
              <Link to="/game" className="text-decoration-none text-dark">Game</Link>
            </button>
          </div>
          <div>
            <button className="buttonChat">
              <Link to="/chat" className="text-decoration-none text-dark">Chat</Link>
            </button>
          </div>
          <div>
            <button className="buttonLogout">
              <Link to="/logout" className="text-decoration-none text-dark">Logout</Link>
            </button>
          </div>
        </>
      )}
    </nav>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div>
          <div className='head'>
            <NavBar />
          </div>

          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path='/logout' element={<Logout />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
