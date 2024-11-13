import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';

function App() {
  return (
    <div className="App">
      <div className="Chat">
        <button className="buttonChat">Chat</button>
      </div>
      <div className="Game">
        <button className="buttonGame">Game</button>
      </div>
      <div className="Users">
        <button className="buttonUsers">Users</button>
      </div>
    </div>
  );
}

export default App;
