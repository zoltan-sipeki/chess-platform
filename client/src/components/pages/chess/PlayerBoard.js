import React, { Component } from "react";
import Circle from "./Circle";
import { PIECE_COLOR } from "../../../common/chess/pieces/piece-constants";
import BlackSquare from "./BlackSquare";
import WhiteSquare from "./WhiteSquare";
import User from "../../user/User";

class PlayerBoard extends Component {
  render() {
    const { players, whitesTurn } = this.props;
    const whitePlayer =
      players[0].color === PIECE_COLOR.WHITE ? players[0] : players[1];
    const blackPlayer =
      players[0].color === PIECE_COLOR.BLACK ? players[0] : players[1];

    return (
      <div className="container-fluid mb-3">
        <div className="row text-dark fw-bold border-bottom border-dark border-2 pb-2">
          <div className="col-4 text-center">Color</div>
          <div className="col-4 text-center">Player</div>
          <div className="col-4 text-center">Next</div>
        </div>
        <div className="row border-bottom py-2">
          <div className="col-4 d-flex align-items-center justify-content-center">
            <BlackSquare />
          </div>
          <div className="col-4 d-flex align-items-center justify-content-center">
            { blackPlayer.id ? <User name={blackPlayer.name} tag={blackPlayer.tag} avatar={blackPlayer.avatar} /> : "deleted user" }
          </div>
          <div className="col-4 d-flex align-items-center justify-content-center">
            {!whitesTurn && <Circle />}
          </div>
        </div>
        <div className="row border-bottom py-2">
          <div className="col-4 d-flex align-items-center justify-content-center">
            <WhiteSquare />
          </div>
          <div className="col-4 d-flex align-items-center justify-content-center">
            { whitePlayer.id ? <User name={whitePlayer.name} tag={whitePlayer.tag} avatar={whitePlayer.avatar} /> : "deleted user" }
          </div>
          <div className="col-4 d-flex align-items-center justify-content-center">
            {whitesTurn && <Circle />}
          </div>
        </div>
      </div>
    );
  }
}

export default PlayerBoard;
