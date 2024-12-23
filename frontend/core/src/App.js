import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import LoginForm from './users/LoginForm';
import Home from './Home';
import Friends from './friends/Friends';
import Logout from './users/Logout';
import TerminalLogin from './users/TerminalLogin';
import Room from './chat/index';
import Home_game from './game/Home_game';
import { Game, Games} from './game/game';
import { AuthProvider, useAuth } from './users/AuthContext';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Profile from './users/Profile';
import { useNavigate } from 'react-router-dom';
import { Button } from 'bootstrap/dist/js/bootstrap.bundle.min';
import ProtectedRoute from './instance/RouteInstance';
import { jwtDecode } from 'jwt-decode';
import useTokenValidation from './instance/EventListener';

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
  const token = getCookies('token');
  let decodeToken = null;
  if (token)
    decodeToken = jwtDecode(token);

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
                  <Link to="/terminal" className="text-decoration-none text-dark">Terminal</Link>
                </button>
              </div>
              <div>
                <button className="buttonRegister">
                  <Link to="/forms" className="text-decoration-none text-dark">Formulaire</Link>
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
                  <Link to={`/profile/${decodeToken.id}`} className="text-decoration-none text-dark">Profile</Link>
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
        <TokenValidationWrapper>
          <div className='h-100'>
            <div className='head'>
              <NavBar />
            </div>

            <Routes>
              <Route path="/home" element={<Home />} />
              <Route path="/forms" element={<LoginForm />} />
              <Route path="/terminal" element={<TerminalLogin />} />
              <Route path='/logout' element={<ProtectedRoute><Logout /></ProtectedRoute>} />
              <Route path='/chat' element={<Room />} />
              <Route path='/home_game' element={<ProtectedRoute><Home_game /></ProtectedRoute>} />
              <Route path='/game/:id' element={<ProtectedRoute><Game /></ProtectedRoute>} />
              <Route path='/profile/:id' element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path='/friends' element={<ProtectedRoute><Friends /></ProtectedRoute>} />
              <Route path='/games/:id' element={<Games />} />
            </Routes>
            
          </div>
        </TokenValidationWrapper>
      </Router>
    </AuthProvider>
  );
}

function TokenValidationWrapper({ children }) {
  useTokenValidation();
  return children;
}

export default App;
