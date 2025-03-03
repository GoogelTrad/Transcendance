import React, { useState, useEffect } from "react";
import person from "../assets/game/person.svg";
import "./TournamentBracket.css";
import waiting from '../assets/waiting.gif';

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
                tournamentResponse.player1,  // correction ici
                tournamentResponse.player2 ? tournamentResponse.player2 : waiting,  // correction ici
            ]);
        }
        rounds.unshift([
            isBox.winner && isBox.winner[0].box1 ? isBox.winner[0].box1 : waiting,
        ]);
    }

    if (numberPlayer == "4") {
        rounds.unshift([
            tournamentResponse.player1,
            tournamentResponse.player2 ? tournamentResponse.player2 : waiting,  // correction ici
            tournamentResponse.player3 ? tournamentResponse.player3 : waiting,  // correction ici
            tournamentResponse.player4 ? tournamentResponse.player4 : waiting,  // correction ici
        ]);
        rounds.unshift([
            isBox.winnerRound1[0].box1 ? isBox.winnerRound1[0].box1 : waiting,
            isBox.winnerRound1[0].box2 ? isBox.winnerRound1[0].box2 : waiting,
        ]);
        rounds.unshift([
            isBox.winner[0].box1 ? isBox.winner[0].box1 : waiting,
        ]);
    }

    return rounds;
};

  const rounds = generateRounds(numberPlayer);
  	//useEffect(() => {
	//	  console.log("tournamentRepppp : ", tournamentResponse);
	//	  console.log("tournamentRepppp1 : ", tournamentResponse.player1);
	//  }, [tournamentResponse]);

  return (
    <div className="bracket-container h-100 w-100">
      {rounds.map((round, roundIndex) => (
        <div key={roundIndex} className="round">
          {round.map((player, playerIndex) => (
            <div key={playerIndex} className="match">
              {player === waiting ? (
                <img src={waiting} alt="waiting" />
              ) : (
                <span>{player}</span>
              )}
            </div>
          ))}
         
        </div>
      ))}
      {/* <p className ="start" onClick={() => onStartTournament()} >► Start</p> */}
    </div>
  );
};

export default TournamentBracket;

