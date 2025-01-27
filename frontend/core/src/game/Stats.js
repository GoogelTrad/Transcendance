import Template from '../instance/Template';
import useSocket from '../socket';
import './Stats.css';
import React, { useEffect, useState } from "react";

function Stats() {
    const [items, setItems] = useState([
        { name: "All games", active: false },
        { name: "Friends", active: false },
        { name: "Win", active: false },
        { name: "Loose", active: false }
    ]);

    const [selectedItem, setSelectedItem] = useState("...");

    const handleItemClick = (name) => {
        const updatedItems = items.map(item =>
            item.name === name
                ? { ...item, active: true }
                : { ...item, active: false }
        );
        setItems(updatedItems);
        setSelectedItem(name);
    };

    function StatsTable({ data }) {
        return (
            <div className="stats-zone-details">
                <div className="d-flex flex-row mb-3 h-100 w-100">
                    <div className="details">Date
                        <div className="details-composants">{data.date || "N/A"}</div>
                    </div>
                    <div className="details">Against
                        <div className="details-composants">{data.against || "N/A"}</div>
                    </div>
                    <div className="details">Time
                        <div className="details-composants">{data.time || "N/A"}</div>
                    </div>
                    <div className="details">Score
                        <div className="details-composants">{data.score || "N/A"}</div>
                    </div>
                    <div className="details result">Result
                        <div className="details-composants">{data.result || "N/A"}</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Template>
            <div className="stats-home d-flex flex-reverse">
                <div className="stats-element one h-100 w-50">
                    <div className="stats-row h-50 w-100">
                    <div className="stats-zone left d-flex flex-reverse">
                        <div className="stats-row d-flex left h-100">
                        <div class="d-flex flex-column mb-3 w-100 h-100">
                            <div class="p-2 w-100 item-1">Flex item 1
                                
                            </div>   
                        <div class="stats-row-element d-flex flex-column mb-3">
                            <div class="p-2">Ratio</div>
                            <div class="counter p-2">0</div>
                        </div>
                        </div>
                        </div>
                        <div className="stats-row-element h-100 w-100">
                            <div className="stats-row-element d-flex w-100">
                                <div class="d-flex flex-column mb-3">
                                    <div class="p-2">Games played</div>
                                    <div class="counter p-2">0</div>
                                </div>
                            </div>
                            <div className="stats-row-element d-flex w-100">
                            <div class="d-flex flex-row mb-3 h-100 w-100">
                                    <div class="p-2 w-50 h-50">Win <p className="counter">0</p></div>
                                    <div class="p-2 w-50 h-100">Win rate <p className="counter">0</p></div>
                                </div>
                            </div>
                            <div className="stats-row-element d-flex w-100">
                            <div class="d-flex flex-row mb-3 h-100 w-100">
                                    <div class="p-2 w-50 h-50">Loose <p className="counter">0</p></div>
                                    <div class="p-2 w-50 h-100">Loose rate <p className="counter">0</p></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    </div>
                    <div className="stats-row h-50 w-100">
                        <div className="stats-zone left">
                            cc
                        </div>
                    </div>
                </div>
                <div className="stats-row two d-flex h-100 w-50">
                    <div className="stats-zone right">
                        <div className="dropdown-stats btn-group">
                            <button type="button" className="btn btn-dropdown-stats">
                                {selectedItem || "..."}
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
                                {items.map((item) => (
                                    <li key={item.name}>
                                        <a
                                            className={`dropdown-item ${item.active ? "active" : ""}`}
                                            onClick={() => handleItemClick(item.name)}
                                            href="#"
                                        >
                                            {item.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        {selectedItem === "All games" && (
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
                        {selectedItem === "Friends" && (
                            <div className="stats-zone-details w-100">
                                <div class="dropdown-friends d-flex h-100 w-100 ">
                                    <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        ...
                                    </button>
                                    <ul class="dropdown-menu">
                                        <li><a class="dropdown-item d-flex" >Action</a>
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
                       {selectedItem === "Win" && (
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
                        {selectedItem === "Loose" && (
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
        </Template>
    )

}

export default Stats;