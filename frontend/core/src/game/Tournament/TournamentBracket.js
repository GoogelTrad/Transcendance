import React, { useState, useEffect } from "react";
import person from '../../assets/game/person.svg';
import "./Tournament.css";
import waiting from '../../assets/waiting.gif';

// Composant pour afficher le résultat W/L
const ResultIndicator = ({ isWinner }) => (
  <span style={{ color: isWinner ? '#00ff00' : '#ff0000' }}>
    {isWinner ? 'W' : 'L'}
  </span>
);

// Fonction pour vérifier le gagnant
const checkWinner = (winner, player) => {
  if (!winner) return null;
  return <ResultIndicator isWinner={winner === player} />;
};

const TournamentBracket = ({ numberPlayer, tournamentResponse }) => {
  const [winners, setWinners] = useState({
    winner1: null,
    winner2: null,
    winner_final: null
  });
  const [isBox, setIsBox] = useState({
    winnerRound1: [{ box1: "", box2: "" }],
    winner: [{ box1: "" }],
  });

  useEffect(() => {
    console.log("Mise à jour des gagnants:", tournamentResponse);
    setWinners({
      winner1: tournamentResponse?.winner1 || null,
      winner2: tournamentResponse?.winner2 || null,
      winner_final: tournamentResponse?.winner_final || null
    });
  }, [tournamentResponse?.winner1, tournamentResponse?.winner2, tournamentResponse?.winner_final]);

  // Fonction principale refactorisée
  const getMatchResult = (player, roundIndex, playerIndex) => {
    const matchConfigs = {
      "2": [
        { round: 1, check: () => checkWinner(winners.winner_final, player) },
        { round: 2, check: () => checkWinner(winners.winner2, player) },
        { round: 3, check: () => checkWinner(winners.winner1, player) }
      ],
      "4": [
        { round: 0, check: () => checkWinner(winners.winner_final, player) },
        { 
          round: 1, 
          check: () => {
            if ((playerIndex === 0 || playerIndex === 1) && winners.winner1) {
              return checkWinner(winners.winner1, player);
            } else if (winners.winner2) {
              return checkWinner(winners.winner2, player);
            }
            return null;
          }
        }
      ]
    };

    const size = tournamentResponse?.size;
    const configs = matchConfigs[size];
    
    if (!configs) return null;

    const matchConfig = configs.find(config => config.round === roundIndex);
    return matchConfig ? matchConfig.check() : null;
  };

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
    <div className="bracket-container h-100 w-100" style={{ backgroundColor: 'transparent' }}>
      {rounds.map((round, roundIndex) => (
        <div key={roundIndex} className="round">
          {round.map((player, playerIndex) => (
            <div key={playerIndex} className="match tournament-text">
              <div className="d-flex justify-content-between align-items-center w-100 h-100">
                <div className="d-flex justify-content-center align-items-center" style={{ width: '10%' }}>
                  {getMatchResult(player, roundIndex, playerIndex)}
                </div>
                <div className="d-flex justify-content-center align-items-center" style={{ width: '90%' }}>
                  {player === waiting ? (
                    <img src={waiting} alt="waiting" className="waiting-img" />
                  ) : (
                    <span>{player}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default TournamentBracket;

