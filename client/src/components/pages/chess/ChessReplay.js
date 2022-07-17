import React, { Component } from "react";
import Row from "./Row";
import Col from "./Col";
import { ClientChessBoard } from "../../../common/chess/chessboard/ClientChessBoard.js";
import {
    ROWS,
    COLS
} from "../../../common/chess/chessboard/chessboard-constants.mjs";
import { deserializeMove } from "../../../common/chess/deserialize.mjs";
import { withRouter } from "react-router-dom";
import { PIECE_IMGS } from "../../../common/chess/pieces/piece-imgs.mjs";
import ChessPiece from "./ChessPiece";
import { animate, highlightMove, removeMoveHighlights } from "./mixins";
import ChessBoard from "./ChessBoard";
import TimeStamp from "../../TimeStamp";
import Modal from "../../modal/Modal";
import ModalFooter from "../../modal/ModalFooter";
import Scoreboard from "./Scoreboard";
import { ROUTE_CHESS_MATCH_REPLAY } from "../../../utils/routes";

class ChessReplay extends Component {
    constructor(props) {
        super(props);

        this.swaps = [];
        this.king = null;
        this.prevCursor = -1;
        this.cursor = -1;
        this.sliderRef = React.createRef();
        this.rects = [];
        this.imgRefs = new Array(ROWS * COLS);

        for (let i = 0; i < this.imgRefs.length; ++i) {
            this.imgRefs[i] = React.createRef();
        }

        this.state = {
            chessboard: new ClientChessBoard(),
            styles: new Array(ROWS * COLS),
            imgs: new Array(ROWS * COLS),
            moveHighlights: new Array(ROWS * COLS),
            max: 0,
            slider: 0,
            replay: null,
            showScoreboard: false
        };

        for (let i = 0; i < this.state.imgs.length; ++i) {
            const piece = this.state.chessboard.board[i];
            this.state.imgs[i] = PIECE_IMGS[piece.color][piece.type];
        }

    }

    componentDidMount() {
        this.loadReplay();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.replay !== this.state.replay && this.state.replay !== null) {
            this.rects = this.imgRefs.map(ref => {
                const rect = ref.current.getBoundingClientRect();
                return {
                    x: rect.left + window.scrollX,
                    y: rect.top + window.scrollY
                };
            });
        }
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.focusSlider);
    }

    async loadReplay() {
        const response = await fetch(ROUTE_CHESS_MATCH_REPLAY(this.props.match.params.id));
        if (response.ok) {
            const replay = await response.json();
            replay.moves = replay.moves.map(move => deserializeMove(move, true));
            document.addEventListener("keydown", this.focusSlider);
            this.setState({ max: replay.moves.length, replay });
        }
    }

    focusSlider = e => {
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
            this.sliderRef.current.focus();
        }
    }

    onChange = (e) => {
        const currentCursor = Number.parseInt(e.target.value, 10) - 1;
        const diff = currentCursor - this.cursor;

        if (diff > 0) {
            this.skipForwardNSteps(diff);
        } else {
            this.skipBackwardNSteps(diff * -1);
        }

        this.prevCursor = currentCursor;
    };

    skipBackwardNSteps(n) {
        if (this.cursor < 0) {
            return;
        }

        const { chessboard } = this.state;
        removeMoveHighlights.call(this);

        if (n === 1) {
            const move = this.state.replay.moves[this.cursor--];
            animate.call(this, move, true);
            move.undo(chessboard);
            chessboard.popMove();
        } else {
            for (let i = 0; i < n; ++i) {
                const move = this.state.replay.moves[this.cursor--];
                move.undo(chessboard);
                chessboard.popMove();
            }
            this.setState({
                imgs: chessboard.getPieceImgs()
            });
        }
        if (this.cursor > -1) {
            highlightMove.call(this, this.state.replay.moves[this.cursor], chessboard.getColor(!!(this.cursor % 2)));
        }
        this.setState({ slider: this.cursor + 1 });
    }

    skipForwardNSteps(n) {
        if (this.cursor >= this.state.replay.moves.length) {
            return;
        }

        const { chessboard } = this.state;
        removeMoveHighlights.call(this);

        if (n === 1) {
            const move = this.state.replay.moves[++this.cursor];
            move.execute(chessboard);
            chessboard.addMove(move);
            animate.call(this, move);
        } else {
            for (let i = 0; i < n; ++i) {
                const move = this.state.replay.moves[++this.cursor];
                move.execute(chessboard);
                chessboard.addMove(move);
            }
            this.setState({
                imgs: chessboard.getPieceImgs()
            });
        }
        highlightMove.call(this, this.state.replay.moves[this.cursor], chessboard.getColor(!!(this.cursor % 2)));
        this.setState({ slider: this.cursor + 1 });
    }

    skipStart = (e) => {
        if (this.cursor < 0) {
            return;
        }

        this.skipBackwardNSteps(this.cursor + 1);
    };

    skipEnd = (e) => {
        if (this.cursor + 1 >= this.state.replay.moves.length) {
            return;
        }

        this.skipForwardNSteps(this.state.replay.moves.length - this.cursor - 1);
    };

    skipBackward = (e) => {
        if (this.cursor < 0) {
            return;
        }

        this.skipBackwardNSteps(1);
    };

    skipForward = (e) => {
        if (this.cursor + 1 >= this.state.replay.moves.length) {
            return;
        }

        this.skipForwardNSteps(1);
    };

    showScoreboard = e => {
        this.setState({ showScoreboard: true });
    }

    hideScoreboard = e => {
        this.setState({ showScoreboard: false });
    }

    render() {
        const {
            max,
            slider,
            imgs,
            styles,
            chessboard,
            moveHighlights,
            showScoreboard,
            replay
        } = this.state;

        if (this.state.replay === null) {
            return null;
        }

        const rows = [];
        for (let i = 0; i < ROWS; ++i) {
            const cols = [];
            for (let j = 0; j < COLS; ++j) {
                cols.push(
                    <Col key={i * COLS + j} className="board-col">
                        <ChessPiece
                            imgRef={this.imgRefs[i * COLS + j]}
                            row={i}
                            col={j}
                            img={imgs[i * COLS + j]}
                            style={styles[i * COLS + j]}
                            moveHighlight={moveHighlights[i * COLS + j]}
                            className="chess-piece disabled"
                            onMouseDown={null}
                        />
                    </Col>
                );
            }
            rows.push(
                <Row key={i} className="board-row">
                    {cols}
                </Row>
            );
        }

        const left = (
            <button onClick={this.showScoreboard} className="btn btn-primary w-50">Scoreboard</button>
        );

        const right = (
            <TimeStamp className="fs-3" time={this.cursor < 0 ? 0 : replay.moves[this.cursor].timeStampMS} />
        )

        const bottom = (
            <>
                <input
                    ref={this.sliderRef}
                    type="range"
                    onChange={this.onChange}
                    min="0"
                    max={max}
                    value={slider}
                    className="w-100"
                />
                <div className="d-flex justify-content-evenly mt-3 border border-2 rounded px-0 py-0 w-75">
                    <i
                        role="button"
                        onClick={this.skipStart}
                        className="fs-2 bi bi-skip-start-fill text-secondary"
                    ></i>
                    <i
                        role="button"
                        onClick={this.skipBackward}
                        className="fs-2 bi bi-skip-backward-fill text-secondary"
                    ></i>
                    <i
                        role="button"
                        onClick={this.skipForward}
                        className="fs-2 bi bi-skip-forward-fill text-secondary"
                    ></i>
                    <i
                        role="button"
                        onClick={this.skipEnd}
                        className="fs-2 bi bi-skip-end-fill text-secondary"
                    ></i>
                </div>
            </>
        );

        return (
            <>
                <ChessBoard
                    rows={rows}
                    players={replay.players}
                    whitesTurn={Math.abs(this.cursor % 2) === 1}
                    moves={chessboard.moves}
                    left={left}
                    bottom={bottom}
                    right={right}
                />
                <Modal show={showScoreboard} onClose={this.hideScoreboard}>
                    <Scoreboard scoreboard={replay.scoreboard} players={replay.players} />
                    <ModalFooter>
                        <button onClick={this.hideScoreboard} className="btn btn-primary">Hide</button>
                    </ModalFooter>
                </Modal>
            </>
        );
    }
}

export default withRouter(ChessReplay);
