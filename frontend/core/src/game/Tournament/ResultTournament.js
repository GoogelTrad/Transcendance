import './Tournament.css';
import React, { useState, useEffect, useRef } from 'react';
import fisrtPrize from '../../assets/1prize.png';
import secondPrize from '../../assets/2prize.png';
import thirdPrize from '../../assets/3prize.png';
import star from '../../assets/star.png';

import { useTranslation } from 'react-i18next';
import axiosInstance from "../../instance/AxiosInstance";

function ResultTournament({ items, setItems, setModalResult, setModalStats, removeLaunch, launching, tournamentCode }) {

    const { t } = useTranslation();
    const [tournamentResponse, setTournamentResponse] = useState({});
    
        useEffect(() => {
            
            if(tournamentCode === 0) { return;}
            const fetchTournement = async () => {
                try {
                    const response = await axiosInstance.get(`/api/game/fetch_data_tournament_by_code/${tournamentCode}`);
                    setTournamentResponse(response.data);
                } catch (error) {
                console.log("Error fetching tournament:", error);
                }
            };
            fetchTournement();
          }, [tournamentCode]);
    
        const handleClick = (e) => {
            console.log("Click sur le bouton stats");
            e.stopPropagation(); // Empêcher la propagation de l'événement
            
            try {
                // 1. Préparer les items actifs
                console.log("Items avant modification:", items);
                const itemsActiv = items.map(item => ({
                    ...item,
                    active: item.name === 'global' || item.name === 'Tournament'
                }));
                setItems(itemsActiv);
                console.log("Items après modification:", itemsActiv);
    
                // 2. Lancer la modal stats
                console.log("Lancement de la modal stats");
                launching({ newLaunch: 'stats', setModal: setModalStats });
    
                // 3. Fermer le modal result
                console.log("Fermeture du modal result");
                setTimeout(() => {
                    setModalResult(false);
                    removeLaunch("tournament");
                    removeLaunch("resultTournament");
                }, 100);
            } catch (error) {
                console.error("Erreur dans handleClick:", error);
            }
        };

        useEffect(() => {
            

        }, [tournamentResponse]);

        

    return (
        <div className="tournament background h-100 w-100">
            <img src={fisrtPrize} alt="first" className="trophy-first" style={{ 
                position: 'absolute', 
                right: '33%', 
                top: '3.5%', 
                height: 'clamp(50px, 22%, 150px)', 
                width: 'auto'
            }}/>
            <img src={secondPrize} alt="second" className="trophy-second" style={{ position:'absolute', zIndex: '1049', left: '15%', top:'18%', height: 'clamp(50px, 20%, 150px)', width: 'auto'}}/>
            <img src={thirdPrize} alt="third" className="trophy-third" style={{ position:'absolute', zIndex: '1049', right: '15%', top:'18%', height: 'clamp(50px, 19%, 150px)', width: 'auto'}}/>
            <div className="w-100 d-flex" style={{ position: 'absolute', height: '10%' }}>
                <div className="tournament-text h-100 d-flex w-50 justify-content-start align-items-center" style={{ paddingTop:'2%', paddingLeft:'7%', fontSize: 'clamp(0.5rem, 1vw, 1rem)'}}>
                    {tournamentResponse.code || "000"}
                </div>
                <div className="tournament-text h-100 d-flex w-50 justify-content-end align-items-center" style={{ paddingTop:'2%', paddingRight:'7%', fontSize: 'clamp(0.5rem, 1vw, 1rem)'}}>
                    {tournamentResponse.date || "00/00/00"}
                </div>
            </div>
            <div className="w-100 d-flex flex-column align-items-center" style={{ position: 'absolute', height: '34%', top: '19%' }}>
                <div className="d-flex justify-content-center align-items-center w-100" style={{ height: '36%', marginTop:'7%' }}>
                    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize:'150%', width:'30%'}} className="tournament-text podium d-flex h-100 justify-content-center align-items-center ">{tournamentResponse.winner_final || "first player"}</div>
                </div>
                <div className="d-flex justify-content-center w-100" style={{ height: '32%'}}>
                    <div  style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize:'130%', width:'30%'}}  className="tournament-text podium d-flex h-100 justify-content-center align-items-center">{tournamentResponse.second || t('SecondPlayer')}</div>
                    <div  style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize:'110%', width:'30%'}}  className="tournament-text podium d-flex h-100 justify-content-center align-items-center">{tournamentResponse.size > 2 ? tournamentResponse.third : ""}</div>
                </div>
            </div>
            <div className="horizontal-line" style={{width:'80%', right:'10%', position: 'absolute', top:'50%', backgroundColor: 'white', height: '1%'}}></div>
            <div className="tournament-text w-100 d-flex flex-column" 
                style={{ paddingLeft: '8%', paddingRight: '8%', position: 'absolute', textTransform: 'none', height: '45%', top: '55%', fontSize: 'clamp(1.2rem, 1.5vw, 1rem)' }}>
                {[
                    { place: "RANKING", name: "PSEUDO" },
                    { place: "1st", name: tournamentResponse.first },
                    { place: "2nd", name: tournamentResponse.second},
                    ...(tournamentResponse.size > 2 ? [
                        { place: "3rd", name: tournamentResponse.third },
                        { place: "4th", name: tournamentResponse.fourth }
                    ] : [])
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
            <div className="w-100 d-flex align-items-center justify-content-center position-relative stats-button-container" 
                style={{ position: 'absolute', top: '84%', height: '15%' }}>
                <button 
                    onClick={handleClick}
                    style={{ 
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        width: '100%',
                        height: '100%',
                        position: 'relative'
                    }}
                >
                    <img src={star} alt="star"
                        style={{ 
                            backgroundColor:'rgba(238, 232, 143, 0.15)', 
                            borderRadius:'30%', 
                            position: 'absolute',
                            height: '100%',
                            zIndex: 0,
                            left: '50%',
                            transform: 'translateX(-50%)'
                        }} 
                    />
                    <div className="d-flex flex-column tournament-text text-center" 
                        style={{ 
                            color: 'rgba(0, 150, 255, 0.8)', 
                            fontWeight:'bold',
                            fontSize: 'clamp(0.8rem, 2vw, 1rem)', 
                            top: '15%', 
                            position: 'relative', 
                            zIndex: 1 
                        }}>
                        <span>{t('STATS')}</span>
                    </div>
                </button>
            </div>
        </div>
    );
}

export default ResultTournament;
