import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import RegisterForm from './users/RegisterForm';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

function App() {
  return (
      <Router>
        <div>
          <nav>
              <div class="d-flex p-2">
                <button className="buttonUsers" class="button rounded">
                  <Link to="/register" class="text-decoration-none text-dark">Users</Link>
                </button>
              </div>
              <div class="d-flex p-2">
                <button className="buttonGame" class="button rounded">
                  <Link to="/game" class="text-decoration-none text-dark">Game</Link>
                </button>
              </div>
              <div class="d-flex p-2">
                <button className="buttonChat" class="button rounded">
                  <Link to="/chat" class="text-decoration-none text-dark">Chat</Link>
                </button>
              </div>
              <div class="d-flex p-2">
                <button className="buttonAccueil" class="button rounded">
                  <Link to="/home" class="text-decoration-none text-dark">Accueil</Link>
                </button>
              </div>
          </nav>
  
          <Routes>
            <Route path="/register" element={<RegisterForm />} />
          </Routes>
        </div>
      </Router>
  );
}

export default App;
