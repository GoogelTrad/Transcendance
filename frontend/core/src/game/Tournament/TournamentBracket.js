import React, { useState, useEffect } from "react";
import person from '../../assets/game/person.svg';
import "./Tournament.css";
import waiting from '../../assets/waiting.gif';

const TournamentBracket = ({ numberPlayer, tournamentResponse }) => {
  const [isBox, setIsBox] = useState({
    winnerRound1: [{ box1: "", box2: "" }],
    winner: [{ box1: "" }],
  });

  const generateRounds = (numberPlayer) => {
    let rounds = [];

    if (numberPlayer == "2") {
		
        for (let i = 0; i < 3; i++) {
            rounds.unshift([
                tournamentResponse?.player1, 
                tournamentResponse?.player2 ? tournamentResponse?.player2 : waiting, 
            ]);
        }
        rounds.unshift([
            isBox.winner && isBox.winner[0].box1 ? isBox.winner[0].box1 : waiting,
        ]);
    }

    if (numberPlayer == "4") {
        rounds.unshift([
            tournamentResponse?.player1,
            tournamentResponse?.player2 ? tournamentResponse.player2 : waiting,
            tournamentResponse?.player3 ? tournamentResponse.player3 : waiting,
            tournamentResponse?.player4 ? tournamentResponse.player4 : waiting,
        ]);
        rounds.unshift([
            tournamentResponse?.winner1 ? tournamentResponse.winner1 : waiting,
            tournamentResponse?.winner2 ? tournamentResponse.winner2 : waiting,
        ]);
        rounds.unshift([
          tournamentResponse?.winner_final ? tournamentResponse.winner_final : waiting,
        ]);
    }

    return rounds;
};

  const rounds = generateRounds(numberPlayer);

  return (
    <div className="bracket-container h-100 w-100" style={{ backgroundColor:'transparent'}}>
      {rounds.map((round, roundIndex) => (
        <div key={roundIndex} className="round">
          {round.map((player, playerIndex) => (
            <div key={playerIndex} className="match tournament-text">
              {player === waiting ? (
                <img src={waiting} alt="waiting" />
              ) : (
                <span>{player}</span>
              )}
            </div>
          ))}
         
        </div>
      ))}
    </div>
  );
};

export default TournamentBracket;

