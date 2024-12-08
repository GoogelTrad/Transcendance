import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import RegisterForm from './users/RegisterForm';
import LoginForm from './users/LoginForm';
import Home from './Home';
import Logout from './users/Logout';
import Room from './chat/index';
import Home_game from './game/Home_game';
import { Game, Games} from './game/game';
import { AuthProvider, useAuth } from './users/AuthContext';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Profile from './users/Profile';
import { useNavigate } from 'react-router-dom';

export function getCookies(name) {
  const value = document.cookie;
  let parts = null;
  if (!value)
    parts = null;
  else
    parts = value.match(`(?:\s|^)${name}=([^;]*);?`)?.[1];

  return (parts);
}

function NavBar()
{
  const {isAuthenticated} = useAuth();

  return (
    <nav className='navbar navbar-expand-md navbar-dark fixed-top bg-dark'>
      <div className='container-fluid'>
        <div className='accueil-container'>
          <button className="buttonAccueil">
            <Link to="/home" className="text-decoration-none text-dark">Home</Link>
          </button>
        </div>

        {!isAuthenticated && (
          <>
            <div className='d-flex flex-row'>
              <div>
                <button className="buttonLogin">
                  <Link to="/login" className="text-decoration-none text-dark">Login</Link>
                </button>
              </div>
              <div>
                <button className="buttonRegister">
                  <Link to="/register" className="text-decoration-none text-dark">Register</Link>
                </button>
              </div>
            </div>
          </>
        )}

        {isAuthenticated && (
          <>
            <div>
              <button className="buttonGame">
                <Link to="/home_game" className="text-decoration-none text-dark">Game</Link>
              </button>
              <button className="buttonChat">
                <Link to="/chat" className="text-decoration-none text-dark">Chat</Link>
              </button>
            </div>
            <div className='d-flex flex-row'>
              <div>
                <button className="buttonProfile">
                  <Link to="/profile" className="text-decoration-none text-dark">Profile</Link>
                </button>
              </div>
              <div>
                <button className="buttonLogout">
                  <Link to="/logout" className="text-decoration-none text-dark">Logout</Link>
                </button>
              </div>
            </div>
          </>
        )}
        </div>
    </nav>
  );
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
            <Route path="/home" element={<Home />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path='/logout' element={<Logout />} />
            <Route path='/chat' element={<Room />} />
            <Route path='/home_game' element={<Home_game />} />
            <Route path='/game/:id' element={<Game />} />
            <Route path='/profile' element={<Profile />} />
            <Route path='/games/:id' element={<Games />} />
          </Routes>
          
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
