import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import RegisterForm from './users/RegisterForm';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import LoginForm from './users/LoginForm';

function App() {
  return (
      <Router>
        <div>
          <div className='head'>
            <nav className='nav'>
                <div>
                  <button className="buttonUsers">
                    <Link to="/register" class="text-decoration-none text-dark">Users</Link>
                  </button>
                </div>
                <div>
                  <button className="buttonGame">
                    <Link to="/game" class="text-decoration-none text-dark">Game</Link>
                  </button>
                </div>
                <div>
                  <button className="buttonChat">
                    <Link to="/chat" class="text-decoration-none text-dark">Chat</Link>
                  </button>
                </div>
                <div>
                  <button className="buttonAccueil">
                    <Link to="/home" class="text-decoration-none text-dark">Home</Link>
                  </button>
                </div>
            </nav>
          </div>
    
            <Routes>
              <Route path="/register" element={<RegisterForm />} />
              <Route path="/login" element={<LoginForm />} />

            </Routes>
        </div>
      </Router>
  );
}

export default App;
