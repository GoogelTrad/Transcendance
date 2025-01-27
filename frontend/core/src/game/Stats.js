import Template from '../instance/Template';
import useSocket from '../socket';
import HomeGame from './Home_game';
import './Stats.css';
import { useLocation } from 'react-router-dom';
import React, { useState, useEffect } from "react";

function Stats({itemsArray = [] }) {
    const location = useLocation();
    const [items, setItems] = useState(location.state?.updatedItems || itemsArray);
    const [option, setOption] = useState([]);
    const [mode, setMode] = useState([]);
    const [selectedOption, setSelectedOption] = useState("");

    const handleDivClick = (name) => {
        setMode(prevMode => 
            prevMode.map(mode => ({
                ...mode,
                active: mode.name === name ? !mode.active : false 
            }))
        );
    };

    const handlChoiceOption = (name) => {
        setOption(prevOption => 
            prevOption.map(option => ({
                ...option,
                active: option.name === name ? !option.active : false
        }))
        );
    };

    useEffect(() => {
        console.log("Items dans useEffect :", items);
    
        const filteredModes = items
            .filter(item => ['profile', 'collect', 'global'].includes(item.name))
            .map(item => ({
                name: item.name,
                active: item.active || false,
            }));
    
        console.log("Modes filtrés :", filteredModes);
        setMode(filteredModes);
    
        const filteredOptions = items
            .filter(item => ['All games', 'Friends', 'Win', 'Loose'].includes(item.name))
            .map(item => ({
                name: item.name,
                active: item.active || false,
            }));
    
        console.log("Options filtrées :", filteredOptions);
        setOption(filteredOptions);

        const activeOption = filteredOptions.find(option => option.active);
        if (activeOption) {
            setSelectedOption(activeOption.name);
        } else {
            setSelectedOption(null);
        }
    }, [items]);
    
    function StatsTable({ data }) {
        return (
            <div className="stats-zone-table">
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Against</th>
                            <th>Time</th>
                            <th>Score</th>
                            <th>Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{data.date || "N/A"}</td>
                            <td>{data.against || "N/A"}</td>
                            <td>{data.time || "N/A"}</td>
                            <td>{data.score || "N/A"}</td>
                            <td>{data.result || "N/A"}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }

    return (
        <Template>
            <div className={`background h-100 w-100 ${mode.find(mode => mode.active) ? 'background-blur' : ''}`}>
                <div  className="stats-home d-flex flex-reverse">
                    <div className="stats-element one h-100 w-50">
                        <div className="stats-row h-50 w-100" onClick={() => handleDivClick('profile')}>
                        <div 
                            className={`stats-zone ${mode.find(mode => mode.name === 'profile')?.active ? 'expanded left' : ''} left d-flex flex-reverse`}>
                            <div className="stats-row d-flex left h-100">
                            <div className="d-flex flex-column mb-3 w-100 h-100">
                                <div className="p-2 w-100 item-1">Flex item 1
                                    
                                </div>   
                            <div className="stats-row-element d-flex flex-column mb-3">
                                <div className="p-2">Ratio</div>
                                <div className="counter p-2">0</div>
                            </div>
                            </div>
                            </div>
                            <div className="stats-row-element h-100 w-100">
                                <div className="stats-row-element d-flex w-100">
                                    <div className="d-flex flex-column mb-3">
                                        <div className="p-2">Games played</div>
                                        <div className="counter p-2">0</div>
                                    </div>
                                </div>
                                <div className="stats-row-element d-flex w-100">
                                <div className="d-flex flex-row mb-3 h-100 w-100">
                                        <div className="p-2 w-50 h-50">Win <p className="counter">0</p></div>
                                        <div className="p-2 w-50 h-100">Win rate <p className="counter">0</p></div>
                                    </div>
                                </div>
                                <div className="stats-row-element d-flex w-100">
                                <div className="d-flex flex-row mb-3 h-100 w-100">
                                        <div className="p-2 w-50 h-50">Loose <p className="counter">0</p></div>
                                        <div className="p-2 w-50 h-100">Loose rate <p className="counter">0</p></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        </div>
                        <div className="stats-row h-50 w-100"  onClick={() => handleDivClick('collect')}>
                            <div className={`stats-zone ${mode.find(mode => mode.name === 'collect')?.active ? 'expanded left' : ''} left d-flex flex-reverse`}>
                            
                                cc
                            </div>
                        </div>
                    </div>
                    <div className="stats-row two d-flex h-100 w-50"  onClick={() => handleDivClick('global')}>
                        <div 
                            className={`stats-zone ${mode.find(mode => mode.name === 'global')?.active ? 'expanded right' : ''} right d-flex flex-column`}>
                            <div className="dropdown-stats btn-group" onClick={(e) => e.stopPropagation()}>                             
                                <button type="button" className="btn btn-dropdown-stats">
                                    {selectedOption || "..."}
                                </button>
                                <button
                                    type="button"
    
                                    className="btn btn-dropdown-stats dropdown-toggle dropdown-toggle-split"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    <span className="visually-hidden">Toggle Dropdown</span>
                                </button>
                                <ul
                                    className="dropdown-stats-menu dropdown-menu custom-dropdown-menu">
                                    {option.map((option) => (
                                        <li key={option.name}>
                                            <a
                                                className={`dropdown-item ${option.active ? "active" : ""}`}
                                                onClick={() => handlChoiceOption(option.name)}
                                                href="#"
                                            >
                                                {option.name}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            {option.find(option => option.name === 'All games')?.active && (
                            <StatsTable
                                    data={{
                                        date: "00/00/00",
                                        against: "cccccc.",
                                        time: "00:00",
                                        score: "00-00",
                                        result: "win/loose",
                                    }}
                                />
                            )}
                            {option.find(option => option.name === 'Friends')?.active && (
                                <div className="stats-zone-details w-100">
                                    <div className="dropdown-friends d-flex h-100 w-100 "
                                        onClick={(e) => e.stopPropagation()}>
                                        <button className="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                            ...
                                        </button>
                                        <ul className="dropdown-menu">
                                            <li><a className="dropdown-item d-flex" >Action</a>
                                                <div className="horizontal-line"></div>
                                            </li>
                                            <li><a class="dropdown-item d-flex" >Another</a>
                                                <div className="horizontal-line"></div>
                                            </li>
                                            <li><a class="dropdown-item d-flex">other</a>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            )}
                            {option.find(option => option.name === 'Win')?.active && (
                                <StatsTable
                                    data={{
                                        date: "01/01/01",
                                        against: "aaaaaa.",
                                        time: "01:00",
                                        score: "01-00",
                                        result: "win",
                                    }}
                                />
                            )}
                            {option.find(option => option.name === 'Loose')?.active && (
                                <StatsTable
                                    data={{
                                        date: "02/02/02",
                                        against: "bbbbbb.",
                                        time: "02:00",
                                        score: "00-02",
                                        result: "loose",
                                    }}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Template>
    )

}

export default Stats;