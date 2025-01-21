import Template from '../instance/Template';
import './Stats.css';

function Stats() {

    return (
        <Template>
            <div className="stats-home d-flex flex-reverse">
                <div className="stats-element one h-100 w-50">
                    <div className="stats-row h-50 w-100">
                    <div className="stats-zone d-flex flex-reverse">
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
                        <div className="stats-zone">
                            cc
                        </div>
                    </div>
                </div>
                <div className="stats-element two h-100 w-50">
                <div className="dropdown-stats btn-group">
                    <button type="button" className="btn btn-dropdown-stats">
                        Action
                    </button>
                    <button 
                        type="button" 
                        className="btn btn-dropdown-stats dropdown-toggle dropdown-toggle-split" 
                        data-bs-toggle="dropdown" 
                        aria-expanded="false"
                    >
                        <span className="visually-hidden">Toggle Dropdown</span>
                    </button>
                    <ul className="dropdown-menu custom-dropdown-menu">
                        <li><a className="dropdown-item" href="#">Action</a></li>
                        <li><a className="dropdown-item" href="#">Another action</a></li>
                        <li><a className="dropdown-item" href="#">Something else here</a></li>
                        <li><hr className="dropdown-divider" /></li>
                        <li><a className="dropdown-item" href="#">Separated link</a></li>
                    </ul>
                </div>
                </div>

            </div>
        </Template>
    )

}

export default Stats;