import React, { Component } from "react";
import Row from "./Row";
import Col from "./Col";
import Modal from "../../modal/Modal";
import { ClientChessBoard } from "../../../common/chess/chessboard/ClientChessBoard.js";
import { ROWS, COLS } from "../../../common/chess/chessboard/chessboard-constants.mjs";
import Timer from "../../Timer";
import PiecePicker from "./PiecePicker";
import { Link, withRouter } from "react-router-dom";
import { createChessSocketWorker } from "../../../utils/misc.js";
import { deserializeMove, deserializePiece } from "../../../common/chess/deserialize.mjs";
import { PieceRegistry } from "../../../common/chess/PieceRegistry";
import { Position } from "../../../common/chess/Position";
import Scoreboard from "./Scoreboard";
import ChessPiece from "./ChessPiece";
import { removeMoveHighlights, highlightMove, animate } from "./mixins";
import ChessBoard from "./ChessBoard";
import ModalFooter from "../../modal/ModalFooter";
import ResignModal from "./ResignModal";
import WaitingModal from "./WaitingModal";
import Spinner from "../../Spinner";
import * as MSG from "../../../common/message-types/chess-message-types.mjs";
import { LINK_MATCH_REPLAY, ROUTE_CHESS_MATCH } from "../../../utils/routes";

const LEGAL_MOVE_HIGHLIGHT = "rgba(255, 255, 0, 0.5)";

class Chess extends Component {
    constructor(props) {
        super(props);

        this.dragging = false;
        this.draggedRow = -1;
        this.draggedCol = -1;
        this.prevMouseX = 0;
        this.prevMouseY = 0;
        this.legalMoves = [];
        this.swaps = [];
        this.king = null;
        this.imgRefs = new Array(ROWS * COLS);
        this.rects = [];
        for (let i = 0; i < this.imgRefs.length; ++i) {
            this.imgRefs[i] = React.createRef();
        }

        this.state = {
            chessboard: null,
            styles: new Array(ROWS * COLS),
            imgs: new Array(ROWS * COLS),
            moveHighlights: new Array(ROWS * COLS),
            legalMoveHighlights: new Array(ROWS * COLS),
            borders: new Array(ROWS * COLS),
            players: [],
            color: "",
            promotion: false,
            scoreboard: null,
            showScoreboard: false,
            showResignModal: false,
            showWaitingModal: false,
            gameOver: false,
            gameStarted: false,
            loaded: false,
            replayReady: false,
            replayId: "",
        };

        this.socket = null;
        this.prevHoveredRow = 0;
        this.prevHoveredCol = 0;
    }

    componentDidMount() {
        this.socket = this.createSocket();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.gameStarted !== this.state.gameStarted && this.state.gameStarted) {
            this.rects = this.imgRefs.map(ref => {
                const rect = ref.current.getBoundingClientRect();
                return { x: rect.left + window.scrollX, y: rect.top + window.scrollY };
            });

        }
        if (prevState.loaded !== this.state.loaded && this.state.loaded) {
            this.socket.port.postMessage({ type: MSG.C_LOAD, data: null });
            if (!this.state.gameStarted) {
                this.setState({ showWaitingModal: true });
            }
        }

        if (prevState.gameOver !== this.state.gameOver && this.state.gameOver) {
            this.showScoreboard();
        }
    }

    componentWillUnmount() {
        if (this.socket != null) {
            this.socket.port.removeEventListener("message", this.handleSocket);
            this.socket.port.close();
        }
    }

    async init() {
        let response = await fetch(ROUTE_CHESS_MATCH(this.props.match.params.id));

        if (response.ok) {
            if (response.status === 204) {
                const chessboard = new ClientChessBoard();
                this.setState({ chessboard, imgs: chessboard.getPieceImgs(), loaded: true });
            }
            else {
                response = await response.json();
                this.setState({
                    players: response.players,
                    color: response.color
                });
                this.rebuildChessboard(response.gameState);
            }
        }
    }

    rebuildChessboard({ board, whitesTurn, turn, moves, nextTurn }) {
        board = board.map(piece => deserializePiece(piece));
        moves = moves.map(move => deserializeMove(move));

        const chessboard = new ClientChessBoard();
        chessboard.board = board;
        chessboard.moves = moves;
        chessboard.whitesTurn = whitesTurn;
        chessboard.turn = turn;
        chessboard.nextTurn = nextTurn;
        chessboard.registry = new PieceRegistry(board);

        this.setState({ chessboard, imgs: chessboard.getPieceImgs(), gameStarted: true });
    }


    createSocket() {
        const socket = createChessSocketWorker();
        socket.port.addEventListener("message", this.handleSocket);
        socket.port.start();
        socket.port.postMessage("socketstate");
        return socket;
    }

    handleSocket = e => {
        const msg = e.data;

        if (msg.type === "socketstate") {
            if (msg.data === 1) {
                this.init();
            }
            return;
        }

        switch (msg.type) {
            case MSG.S_START_GAME:
                this.handleStartGame(msg);
                break;

            case MSG.S_MOVE:
                this.handleMoveResponse(msg);
                break;

            case MSG.S_FLAG_FALL:
                this.handleFlagFall(msg);
                break;

            case MSG.S_RESIGN:
                this.handleResignResponse(msg);
                break;

            case MSG.S_LOAD_ERROR:
                this.handlePlayerLoadError(msg);
                break;

            case MSG.S_REPLAY_READY:
                this.handleReplayReady(msg);
                break;

            default:
                break;
        }
    }

    handleStartGame(msg) {
        const { nextTurn, players, color } = msg.data;
        const { chessboard } = this.state;
        chessboard.nextTurn = nextTurn;
        this.setState({ players, color, showWaitingModal: false, gameStarted: true });
    }

    handleMoveResponse(msg) {
        let { move, nextTurn, color, scoreboard } = msg.data;
        const { chessboard, styles } = this.state;

        move = deserializeMove(move);
        if (move.isInvalid()) {
            styles[move.from.row * COLS + move.from.col] = {};
            this.setState({ styles });
        }
        else {
            move.execute(chessboard);
            const promotion = move.isPromotion();
            if (!promotion) {
                chessboard.finalizeMove(move);
            }
            chessboard.nextTurn = nextTurn;

            if (color === this.state.color) {
                removeMoveHighlights.call(this);
                styles[move.from.row * COLS + move.from.col] = {};

                this.setState({
                    imgs: chessboard.getPieceImgs(),
                });
            }
            else {
                highlightMove.call(this, move, this.state.color);
                animate.call(this, move);
            }


            this.setState({
                chessboard,
                promotion: promotion && color === this.state.color,
                scoreboard,
                gameOver: scoreboard != null
            });

        }
    }

    handleFlagFall(msg) {
        const { chessboard } = this.state;
        const { scoreboard, nextTurn } = msg.data;
        chessboard.nextTurn = nextTurn;
        this.setState({ scoreboard, gameOver: true });
    }

    handleResignResponse(msg) {
        this.handleFlagFall(msg);
    }

    handlePlayerLoadError(msg) {
        this.setState({ failedToLoad: true });
    }

    handleReplayReady(msg) {
        this.setState({ replayReady: true, replayId: msg.data.replayId });
    }

    dragPiece = (e) => {
        e.preventDefault();

        this.draggedRow = Number.parseInt(e.target.dataset.row);
        this.draggedCol = Number.parseInt(e.target.dataset.col);

        this.dragging = true;
        this.prevMouseX = e.pageX;
        this.prevMouseY = e.pageY;

        const { chessboard, legalMoveHighlights, styles } = this.state;
        const middleX = e.target.offsetWidth / 2;
        const middleY = e.target.offsetHeight / 2;

        const piece = chessboard.getPiece(this.draggedRow, this.draggedCol);
        this.legalMoves = piece.possibleMoves(chessboard);
        for (const piece of this.legalMoves) {
            legalMoveHighlights[piece.row * COLS + piece.col] = LEGAL_MOVE_HIGHLIGHT;
        }

        styles[piece.row * COLS + piece.col] = {
            ...styles[piece.row * COLS + piece.col],
            position: "absolute",
            left: e.pageX - middleX,
            top: e.pageY - middleY,
            zIndex: 1000
        };

        this.setState({ legalMoveHighlights, styles });

        document.addEventListener("mousemove", this.movePiece);
        document.addEventListener("mouseup", this.stopDraggingPiece);
    };

    movePiece = (e) => {
        if (!this.dragging) {
            return;
        }

        const { chessboard, styles } = this.state;
        const piece = chessboard.getPiece(this.draggedRow, this.draggedCol);
        const style = styles[piece.row * COLS + piece.col];
        styles[piece.row * COLS + piece.col] = {
            ...style,
            left: style.left + e.pageX - this.prevMouseX,
            top: style.top + e.pageY - this.prevMouseY
        }


        this.setState({ styles });

        this.prevMouseX = e.pageX;
        this.prevMouseY = e.pageY;
    };

    stopDraggingPiece = (e) => {
        if (!this.dragging) {
            return;
        }
        this.dragging = false;

        const { legalMoveHighlights, styles } = this.state;
        for (const piece of this.legalMoves) {
            legalMoveHighlights[piece.row * COLS + piece.col] = "";
        }

        const target = document.elementsFromPoint(e.clientX, e.clientY)[1];
        if (target.dataset.row && target.dataset.col) {
            const row = Number.parseInt(target.dataset.row, 10);
            const col = Number.parseInt(target.dataset.col, 10);
            this.socket.port.postMessage({
                type: MSG.C_MOVE,
                data: {
                    move: {
                        from: new Position(this.draggedRow, this.draggedCol),
                        to: new Position(row, col)
                    }
                }
            });
        }
        else {
            styles[this.draggedRow * COLS + this.draggedCol] = {};
        }

        this.setState({ legalMoveHighlights, styles });
        document.removeEventListener("mousemove", this.movePiece);
        document.removeEventListener("mouseup", this.stopDraggingPiece);
    };

    promote = pieceType => {
        this.socket.port.postMessage({ type: MSG.C_PROMOTE, data: { pieceType } });
    }

    showResignModal = e => {
        this.setState({ showResignModal: true });
    }

    hideResignModal = e => {
        this.setState({ showResignModal: false });
    }

    showScoreboard = e => {
        if (this.state.showResignModal) {
            this.setState({ showResignModal: false }, () => {
                setTimeout(() => this.setState({ showScoreboard: true }), 300);
            })
        }
        else {
            this.setState({ showScoreboard: true });
        }
    }

    hideScoreboard = e => {
        this.setState({ showScoreboard: false });
    }

    resign = e => {
        this.socket.port.postMessage({ type: MSG.C_RESIGN, data: null });
    }

    render() {
        const {
            chessboard,
            players,
            color,
            promotion,
            showScoreboard,
            showResignModal,
            showWaitingModal,
            failedToLoad,
            scoreboard,
            gameOver,
            styles,
            imgs,
            legalMoveHighlights,
            moveHighlights,
            gameStarted,
            replayReady,
            replayId
        } = this.state;

        if (!gameStarted) {
            return <WaitingModal show={showWaitingModal} failedToLoad={failedToLoad} />
        }

        const rows = [];
        for (let i = 0; i < ROWS; ++i) {
            const cols = [];
            for (let j = 0; j < COLS; ++j) {
                const enabled = !gameOver && color === chessboard.getPiece(i, j).color && color === chessboard.getTurnColor();
                cols.push(
                    <Col key={i * COLS + j} className="board-col">
                        <ChessPiece
                            imgRef={this.imgRefs[i * COLS + j]}
                            row={i}
                            col={j}
                            img={imgs[i * COLS + j]}
                            style={styles[i * COLS + j]}
                            moveHighlight={moveHighlights[i * COLS + j]}
                            legalMoveHighlight={legalMoveHighlights[i * COLS + j]}
                            className={`chess-piece ${enabled ? "enabled" : "disabled"}`}
                            onMouseDown={enabled ? this.dragPiece : null}
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
            <button onClick={this.showResignModal} className="btn btn-secondary w-75 mt-2" disabled={gameOver}>
                Resign
            </button>
        );

        const right = (
            <Timer
                className="mb-2 fs-2"
                countDownTo={chessboard.nextTurn}
            />
        );

        let bottom = null;
        if (gameOver) {
            bottom = (
                <button onClick={this.showScoreboard} className="btn btn-primary">Scoreboard</button>
            );
        }
        else {
            bottom = (
                <PiecePicker show={promotion} whitesTurn={chessboard.whitesTurn} promote={this.promote} />
            );
        }

        return (
            <>
                <ChessBoard
                    rows={rows}
                    players={players}
                    whitesTurn={chessboard.whitesTurn}
                    moves={chessboard.moves}
                    left={left}
                    right={right}
                    bottom={bottom}
                />
                <ResignModal
                    show={showResignModal}
                    onClose={this.hideResignModal}
                    resign={this.resign}
                    hide={this.hideResignModal}
                />
                <Modal show={showScoreboard} onClose={this.hideScoreboard}>
                    <Scoreboard scoreboard={scoreboard} players={players} />
                    <ModalFooter>
                        {replayReady ?
                            <Link to={LINK_MATCH_REPLAY(replayId)} className="btn btn-primary">
                                Watch replay
                            </Link> :
                            <button className="btn btn-primary" disabled={true}><Spinner /> Waiting for replay</button>}
                        <button onClick={this.hideScoreboard} className="btn btn-secondary">Hide</button>
                    </ModalFooter>
                </Modal>
            </>
        );
    }
}

export default withRouter(Chess);