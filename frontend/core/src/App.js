import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import Home from './Home';
import Friends from './friends/Friends';
import Logout from './users/Logout';
import TerminalLogin from './users/TerminalLogin';
import Home_game from './game/Home_game';
import Stats from './game/Stats';
import { Game, Games} from './game/game';
import { AuthProvider, useAuth } from './users/AuthContext';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import Profile from './users/Profile';
import ProtectedRoute from './instance/RouteInstance';
import { jwtDecode } from 'jwt-decode';
import HomeChat from './chat/Homechat';
import Room from "./chat/Room";
import LoginRegister from './users/LoginForm';
import Tournament from './game/Tournament';
import AuthSchool, { AuthSuccess } from './users/AuthSchool';
import { useEffect } from 'react';
import axiosInstance from './instance/AxiosInstance';

function NavBar()
{
  const { userInfo } = useAuth();
  const decodeToken = userInfo;
}

function App() {

  return (
    <AuthProvider>
      <Router>
        <div className='h-100'>
          <div className='head'>
            <NavBar />
          </div>

          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<LoginRegister />} />
            <Route path='/logout' element={<ProtectedRoute><Logout /></ProtectedRoute>} />
            <Route path='/chat' element={<ProtectedRoute><HomeChat/></ProtectedRoute>} />
            <Route path="/room/:roomName" element={<ProtectedRoute><Room/></ProtectedRoute>} />
            <Route path='/home_game' element={<ProtectedRoute><Home_game /></ProtectedRoute>} />
            <Route path='/game/:id' element={<ProtectedRoute><Game /></ProtectedRoute>} />
            <Route path='/profile' element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path='/friends' element={<ProtectedRoute><Friends /></ProtectedRoute>} />
            <Route path='/games/:id' element={<Games />} />
            <Route path='/games/Stats'  element={<Stats />} />
            <Route path='/games/Tournament' element={<Tournament />} />
            <Route path="/auth-success" element={<AuthSuccess />} />
          </Routes>
        
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
