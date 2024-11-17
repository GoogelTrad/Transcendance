import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import RegisterForm from './users/RegisterForm';
import LoginForm from './users/LoginForm';
import Home from './Home';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

function App() {
  return (
      <Router>
        <div>
          <div className='head'>
            <nav className='nav'>
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
                  <button className="buttonAccueil">
                    <Link to="/home" className="text-decoration-none text-dark">Home</Link>
                  </button>
                </div>
            </nav>
          </div>
    
            <Routes>
              <Route path="/home" element={<Home />} />
              <Route path="/register" element={<RegisterForm />} />
              <Route path="/login" element={<LoginForm />} />
            </Routes>
        </div>
      </Router>
  );
}

export default App;
