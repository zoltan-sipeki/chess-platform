import React, { Component } from 'react';
import ModalHeader from "../../modal/ModalHeader";
import ModalBody from "../../modal/ModalBody";
import User from "../../user/User";
import { PIECE_COLOR } from "../../../common/chess/pieces/piece-constants.mjs";
import BlackSquare from './BlackSquare';
import WhiteSquare from './WhiteSquare';

class Scoreboard extends Component {
    render() {
        const { scoreboard, players } = this.props;

        if (!scoreboard) {
            return null;
        }

        const { winner, by, scores, mmrChanges } = scoreboard

        const white = players[0].color === PIECE_COLOR.WHITE ? players[0] : players[1];
        const black = players[1].color === PIECE_COLOR.BLACK ? players[1] : players[0];

        return (
            <>
                <ModalHeader closeButton>
                    Scoreboard
                </ModalHeader>
                <ModalBody>
                    <div className="mb-4">
                        <h4 className="text-center">{`${winner === "Draw" ? winner : winner + " won"}`}</h4>
                        <h6 className="text-center text-muted">by {by}</h6>
                    </div>
                    <div className="container-fluid">
                        <div className="row d-flex justify-content-evenly">
                            <div className="col-4">
                                <div className={`d-flex align-items-center justify-content-center px-2 py-2 ${winner === PIECE_COLOR.BLACK ? "border border-2 border-primary rounded" : ""}`}>
                                    <BlackSquare />
                                    <User name={black.name} tag={black.tag} avatar={black.avatar} />
                                </div>
                            </div>
                            <div className="col-4 d-flex justify-content-evenly align-items-center fw-bold w-25">
                                <div>{scores[PIECE_COLOR.BLACK]}</div>
                                <div>:</div>
                                <div>{scores[PIECE_COLOR.WHITE]}</div>
                            </div>
                            <div className="col-4">
                                <div className={`d-flex align-items-center justify-content-center px-2 py-2 ${winner === PIECE_COLOR.WHITE ? "border border-2 border-primary rounded" : ""}`}>
                                    <User name={white.name} tag={white.tag} avatar={white.avatar} className="me-2" />
                                    <WhiteSquare />
                                </div>
                            </div>
                        </div>
                        {mmrChanges &&
                            <>
                                <div className="row my-3">
                                    <div className="col-4">
                                        <div className="fw-bold text-center">
                                            <span className={`${mmrChanges[PIECE_COLOR.BLACK].change > 0 ? "text-success" : "text-danger"} me-1`}>
                                                {` (${mmrChanges[PIECE_COLOR.BLACK].change > 0 ? "+" : ""}${mmrChanges[PIECE_COLOR.BLACK].change})`}
                                            </span>
                                            {mmrChanges[PIECE_COLOR.BLACK].mmrAfter}
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <h6 className="text-center">Rating changes</h6>
                                    </div>
                                    <div className="col-4">
                                        <div className="fw-bold text-center">
                                            <span className={`${mmrChanges[PIECE_COLOR.WHITE].change > 0 ? "text-success" : "text-danger"} me-1`}>
                                                {` (${mmrChanges[PIECE_COLOR.WHITE].change > 0 ? "+" : ""}${mmrChanges[PIECE_COLOR.WHITE].change})`}
                                            </span>
                                            {mmrChanges[PIECE_COLOR.WHITE].mmrAfter}
                                        </div>
                                    </div>
                                </div>
                            </>}
                    </div>
                </ModalBody>
            </>
        );
    }
}

export default Scoreboard;
