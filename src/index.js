import React from 'react';
import ReactDOM from 'react-dom';

import {Observer, IObserver} from 'react-observer-pattern';

import 'bootstrap/dist/css/bootstrap.css';
import 'font-awesome/css/font-awesome.css';
import './index.css';

import * as config from './settings/settings';

function HeaderComponent(props) {

    return (
        <div>
            <a className={config.styles.titleFont} href="#">Breakout Game</a>
        </div>);
}

class Input extends React.Component implements IObserver {

    constructor(props) {
        super(props);

        Observer.GetGlobalInstance().RegisterObserver(props.topic, this);
        this.state = {
            value: 0
        };
    }

    ReceiveNotification(message: any): void {
        this.setState(message);
    }

    render() {
        return (
            <input id={this.props.inputId} className={this.props.className} type="text" readOnly="true" value={this.state.value}>
            </input>
        );
    }
}

class Results extends React.Component {

    render() {
        return (
            <div id="navbar" className={config.styles.resultBar}>
                <li className="alignToLeft"><a className={config.styles.resultLabel} href="#">{this.props.label}</a></li>
                <li className="alignToLeft">
                    <form className="navbar-nav">
                        <div className="form-group">
                            <Input inputId={this.props.inputId} className={config.styles.resultDisplay}
                                   topic={this.props.topic}/>
                        </div>
                    </form>
                </li>
            </div>
        );
    }
}

class GameControls extends React.Component {

    render() {
        return (
            <li>
                <div className="buttons-container stretched">
                    <div className="container-cell stretched">
                        <div className="btn-group stretched">
                            <button type="button" id="btn-play" className={config.styles.playButton}> Play
                            </button>
                            <button type="button" id="btn-pause" className={config.styles.pauseButton}> Pause
                            </button>
                            <button type="button" id="btn-stop" className={config.styles.stopButton}> Stop
                            </button>
                        </div>
                    </div>
                </div>
            </li>
        );
    }
}

class GameDisplay extends React.Component {

    render() {
        return (
            <div className="gameDisplay container">
                <div className="vertical-center">
                    <ul className="no-bullets">
                        <li>
                            <div id="animationContainer">
                                <canvas id="gameCanvas" width={this.props.width} height={this.props.height}></canvas>
                            </div>
                        </li>
                        <GameControls/>
                    </ul>
                </div>
            </div>
        );
    }
}

class Game extends React.Component {

    render() {
        return (
            <div className="game main">
                <nav className={config.styles.mainNavBar}>
                    <div className={config.styles.resultsContainer}>
                        <HeaderComponent/>
                        <ul>
                            <Results label="Games Played: " inputId="gamesplayed" topic={config.events.gamesPlayed}/>
                            <Results label="Score: " inputId="score" topic={config.events.score}/>
                        </ul>
                    </div>
                </nav>
                <GameDisplay width={config.gameWidth} height={config.gameHeight}/>
            </div>
        );
    }
}

//====================================
ReactDOM.render(
    <Game />,
    document.getElementById('root')
);
