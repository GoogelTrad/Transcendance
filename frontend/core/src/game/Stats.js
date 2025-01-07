import './Stats.css'
import '../Home'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import Button from 'react-bootstrap/Button';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate, useParams} from 'react-router-dom';
import React, { useEffect, useState, useRef} from "react";
import { jwtDecode } from "jwt-decode";
import { getCookies } from './../App.js';
import axiosInstance from "../instance/AxiosInstance";

function Games_Stats() {
    const [user, setUser] = useState(null);
    const token = getCookies('token');
    const decodeToken = jwtDecode(token);
    const { id } = useParams();
    const [games, setGames] = useState([]);


    useEffect(() => {
        const fetchStats = async () => {
          try {
            const token = getCookies('token');
            const response = await axiosInstance.get(`http://localhost:8000/game/fetch_data_user/${id}/`, {});
            setGames(response.data);
          } catch (error) {
            console.error('Error fetching user stats:', error);
          }
        };
    
        fetchStats();
      }, [id]);
    return (
  <div>
      <h1>User Stats</h1>
      <table>
        <thead>
          <tr>
            <th>Game ID</th>
            <th>Player 1</th>
            <th>Player 2</th>
            <th>Score 1</th>
            <th>Score 2</th>
            <th>Winner</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {games.map((game) => (
            <tr key={game.id}>
              <td>{game.id}</td>
              <td>{game.player1}</td>
              <td>{game.player2}</td>
              <td>{game.score1}</td>
              <td>{game.score2}</td>
              <td>{game.winner}</td>
              <td>{game.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Games_Stats;
