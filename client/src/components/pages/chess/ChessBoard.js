import React, { Component } from 'react';
import PlayerBoard from './PlayerBoard';
import FileRow from './FileRow';
import RankCol from './RankCol';
import MoveList from './MoveList';

export class ChessBoard extends Component {
    render() {
        const { bottom, right, left, rows, moves, players, whitesTurn } = this.props;

        return (
            <>
                <div className="mt-5">
                    <div className="container">
                        <div className="row mb-3"></div>
                        <div className="row">
                            <div className="col d-flex flex-column justify-content-center align-items-center">
                                <PlayerBoard
                                    players={players}
                                    whitesTurn={whitesTurn}
                                />
                                {left}
                            </div>
                            <div className="col">
                                <div style={{ userSelect: "none" }}>
                                    <FileRow className="border-bottom border-secondary" />
                                    <div className="d-flex">
                                        <RankCol className="border-end border-secondary" />
                                        <div>{rows}</div>
                                        <RankCol className="border-start border-secondary" />
                                    </div>
                                    <FileRow className="border-top border-secondary" />
                                </div>
                            </div>
                            <div className="col d-flex flex-column justify-content-center align-items-center">
                                {right}
                                <MoveList moves={moves} />
                            </div>
                        </div>
                        <div className="row mt-3">
                            <div className="col"></div>
                            <div className="col d-flex flex-column align-items-center">
                                {bottom}
                            </div>
                            <div className="col"></div>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}

export default ChessBoard
