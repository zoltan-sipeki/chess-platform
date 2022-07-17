import React, { Component } from "react";
import { PIECE_IMGS } from "../../../common/chess/pieces/piece-imgs.mjs";
import { PIECE_TYPE, PIECE_COLOR } from "../../../common/chess/pieces/piece-constants.mjs";

class PiecePicker extends Component {
    promote = e => {
        this.props.promote(e.target.dataset.type);
    }

    render() {
        const { show, whitesTurn } = this.props;
        if (!show) {
            return null;
        }

        const color = whitesTurn ? PIECE_COLOR.WHITE : PIECE_COLOR.BLACK;

        return (
            <div className="d-flex justify-content-center mt-3">
                <div className="d-inline-block">
                    <h6 className="mb-2 text-center">Pick a piece:</h6>
                    <div className="d-flex justify-content-center border border-dark rounded py-1 mb-2">
                        <img
                            onClick={this.promote}
                            className="mx-1 promotion"
                            width="60"
                            height="60"
                            src={PIECE_IMGS[color][PIECE_TYPE.BISHOP]}
                            data-type={PIECE_TYPE.BISHOP}
                            alt=""
                        />
                        <img
                            onClick={this.promote}
                            className="mx-1 promotion"
                            width="60"
                            height="60"
                            src={PIECE_IMGS[color][PIECE_TYPE.KNIGHT]}
                            data-type={PIECE_TYPE.KNIGHT}
                            alt=""
                        />
                        <img
                            onClick={this.promote}
                            className="mx-1 promotion"
                            width="60"
                            height="60"
                            src={PIECE_IMGS[color][PIECE_TYPE.QUEEN]}
                            data-type={PIECE_TYPE.QUEEN}
                            alt=""
                        />
                        <img
                            onClick={this.promote}
                            className="mx-1 promotion"
                            width="60"
                            height="60"
                            src={PIECE_IMGS[color][PIECE_TYPE.ROOK]}
                            data-type={PIECE_TYPE.ROOK}
                            alt=""
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default PiecePicker;
