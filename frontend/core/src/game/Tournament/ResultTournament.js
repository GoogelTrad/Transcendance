import './Tournament.css';
import React, { useState, useEffect, useRef } from 'react';
import fisrtPrize from '../../assets/1prize.png';
import secondPrize from '../../assets/2prize.png';
import thirdPrize from '../../assets/3prize.png';
import star from '../../assets/star.png';

function ResultTournament({ items, setItems, setIsModalTournament, setModalResult, setModalStats, removeLaunch, launching }) {

    const [tournamentResponse, setTournamentResponse] = useState({});

        useEffect(() => {
            setTournamentResponse({
                size: 2,
                first: 'jacques',
                second: 'bob',
                scoreFirst: 22,
                scoreSecond: 19,
                tournamentCode: 555,
                date: "00/00/00",
            });
        }, []);
    
        const handleClick = () => {
            setIsModalTournament(false)
            setModalResult(false);
            removeLaunch("tournament");
            removeLaunch("resultTournament");
            const itemsActiv = items.map(items => ({
                ...items,
                active: items.name === 'global' || items.name === 'Tournament',
            }));
            setItems(itemsActiv);
            setModalStats(true);
            launching({ newLaunch: 'stats', setModal: setModalStats });
        };

        

    return (
        <div className="tournament background h-100 w-100">
            <img src={fisrtPrize} alt="first" style={{ position:'absolute', right: '33%', top:'3.5%', height:'22%'}}></img>
            <img src={secondPrize} alt="second" style={{ position:'absolute', zIndex: '1049', left: '15%', top:'18%', height:'20%'}}></img>
            <img src={thirdPrize} alt="third" style={{ position:'absolute', zIndex: '1049', right: '15%', top:'18%', height:'19%'}}></img>
            <div className="w-100 d-flex" style={{ position: 'absolute', height: '10%' }}>
                <div className="tournament-text h-100 d-flex w-50 justify-content-start align-items-center" style={{ paddingTop:'2%', paddingLeft:'7%'}}>
                    {tournamentResponse.tournamentCode || "000"}
                </div>
                <div className="tournament-text h-100 d-flex w-50 justify-content-end align-items-center" style={{ paddingTop:'2%', paddingRight:'7%'}}>
                    {tournamentResponse.date || "00/00/00"}
                </div>
            </div>
            <div className="w-100 d-flex flex-column align-items-center" style={{ position: 'absolute', height: '34%', top: '19%' }}>
                <div className="d-flex justify-content-center align-items-center w-100" style={{ height: '36%', marginTop:'7%' }}>
                    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize:'150%', width:'30%'}} className="tournament-text podium d-flex h-100 justify-content-center align-items-center ">{tournamentResponse.first || "first player"}</div>
                </div>
                <div className="d-flex justify-content-center w-100" style={{ height: '32%'}}>
                    <div  style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize:'130%', width:'30%'}}  className="tournament-text podium d-flex h-100 justify-content-center align-items-center">{tournamentResponse.second || "second player"}</div>
                    <div  style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize:'110%', width:'30%'}}  className="tournament-text podium d-flex h-100 justify-content-center align-items-center">{tournamentResponse.third || ""}</div>
                </div>
            </div>
            <div className="horizontal-line" style={{width:'80%', right:'10%', position: 'absolute', top:'50%', backgroundColor: 'white', height: '1%'}}></div>
            <div className="tournament-text w-100 d-flex flex-column" 
                style={{ paddingLeft: '8%', paddingRight: '8%', position: 'absolute', textTransform: 'none', height: '45%', top: '55%' }}>
                {[
                    { place: "RANKING", name: "PSEUDO", score: "SCORE" },
                    { place: "1st", name: tournamentResponse.first, score: tournamentResponse.scoreFirst },
                    { place: "2nd", name: tournamentResponse.second, score: tournamentResponse.scoreSecond },
                    { place: "3rd", name: tournamentResponse.third, score: tournamentResponse.scoreThird },
                    { place: "4th", name: tournamentResponse.fourth, score: tournamentResponse.scoreFourth }
                ].map((player, index) => (
                    <div key={index} 
                        className="d-flex justify-content-between" 
                        style={{ 
                            width: '100%', 
                            textAlign: 'left',
                            color: index === 0 ? 'rgba(0, 150, 255, 0.8)' : 'white', 
                            fontWeight: index === 0 ? 'bold' : 'normal'
                        }}>
                        <span style={{ width: '20%' }}>{player.place || ""}</span>
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '50%', textAlign: 'center' }}>{player.name || ""}</span>
                        <span style={{ width: '20%', textAlign: 'right' }}>{player.score || " " }</span>
                    </div>
                ))}
            </div>
            <div className="w-100 d-flex align-items-center justify-content-center position-relative" 
                style={{ position: 'absolute', top: '84%', height: '15%' }}>
                <img src={star} alt="star" onClick={handleClick} 
                    style={{ backgroundColor:'rgba(238, 232, 143, 0.15)', borderRadius:'30%', position: 'absolute', height: '100%', zIndex: 0 }} />

                <div className="d-flex flex-column tournament-text text-center" 
                    style={{ color: 'rgba(0, 150, 255, 0.8)', fontWeight:'bold', fontSize: '100%', fontWeight: 'bold', top: '15%', position: 'relative', zIndex: 1 }}>
                    <span>STATS</span>
                </div>

            </div>

        </div>
    );
}

export default ResultTournament;
