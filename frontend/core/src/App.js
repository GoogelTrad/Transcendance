import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import Home from './Home';
import Friends from './friends/Friends';
import Logout from './users/Logout';
import HomeGame from './game/Home_game';
import Tournament from './game/Tournament/Tournament';
import GameInstance from './instance/GameInstance';
import { AuthProvider, useAuth } from './users/AuthContext';
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Profile from './users/Profile';
import ProtectedRoute from './instance/RouteInstance';
import HomeChat from './chat/Homechat';
import Room from "./chat/Room";
import LoginRegister from './users/LoginForm';
import { AuthSuccess } from './users/AuthSchool';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import SetupInterceptors from "./instance/SetupInterceptors";
import PageNotFound from './NotFound';
import { useTranslation } from 'react-i18next';

function NavigateFunctionComponent(props) {
  let navigate = useNavigate();
  const [ ran, setRan ] = useState(false);
  const {setIsAuthenticated, logout} = useAuth();
  const { t } = useTranslation();

  if(!ran){
     SetupInterceptors(navigate, setIsAuthenticated, t, logout);
     setRan(true);
  }
  return <></>;
}

function App() {

  return (
    <>
      <AuthProvider>
        <Router>
          {<NavigateFunctionComponent />}
            <Routes>
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/home" element={<Home />} />
              <Route path="/login" element={<LoginRegister />} />
              <Route path='/logout' element={<ProtectedRoute><Logout /></ProtectedRoute>} />
              <Route path='/chat' element={<ProtectedRoute><HomeChat/></ProtectedRoute>} />
              <Route path="/room/:roomName" element={<ProtectedRoute><Room/></ProtectedRoute>} />
              <Route path='/home_game' element={<ProtectedRoute><HomeGame /></ProtectedRoute>} />
              <Route path='/game/:id' element={<ProtectedRoute><GameInstance /></ProtectedRoute>} />
              <Route path='/profile' element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path='/friends' element={<ProtectedRoute><Friends /></ProtectedRoute>} />
              <Route path='/games/tournament/:tournamentCode' element={<ProtectedRoute><Tournament /></ProtectedRoute>} />
              <Route path="/auth-success" element={<AuthSuccess />} />
              <Route path="*" element={<PageNotFound />} />
            </Routes>
        </Router>
      </AuthProvider>
      <ToastContainer/>
    </>
  );
}

export default App;
