import React, { useState, useEffect } from "react";
import person from "../assets/game/person.svg";
import "./TournamentBracket.css";

const TournamentBracket = ({ numberPlayer }) => {

  const generateRounds = (numberPlayer) => {
    let rounds = [];
    let currentRound = Array.from({ length: numberPlayer }, (_, i) => `Joueur ${i + 1}`);

    if (numberPlayer === "4") {
      rounds.unshift(["Case 1", "Case 2", "Case 3", "Case 4"]);
    }
    if (numberPlayer == "2")
    {
      for (let i = 0; i < 2; i++)
        rounds.unshift(["Case 1", "Case 2"]);
    }
    while (currentRound.length > 1) {
      rounds.unshift(currentRound);
      let nextRound = [];
      for (let i = 0; i < currentRound.length; i += 2) {
        nextRound.push(`Match ${Math.floor(i / 2) + 1}`);
      }
      currentRound = nextRound;
    }
    rounds.unshift(currentRound);
    console.log(numberPlayer);
    
    
    return rounds;
  };

  const rounds = generateRounds(numberPlayer);

  return (
    <div className="bracket-container h-100 w-100">
      {rounds.map((round, roundIndex) => (
        <div key={roundIndex} className="round">
          {round.map((player, playerIndex) => (
            <div key={playerIndex} className="match">
              <span>{player}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );  
};

export default TournamentBracket;

