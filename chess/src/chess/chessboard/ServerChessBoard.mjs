import { ChessBoard } from "./ChessBoard.mjs";
import { Move, InvalidMove } from "../Move.mjs";
import { Win, Draw } from "../Scoreboard.mjs";
import { PIECE_COLOR, PIECE_TYPE } from "../pieces/piece-constants.mjs";
import { Position } from "../Position.mjs";
import { MoveResult } from "./MoveResult.mjs";
import { ROWS, COLS } from "./chessboard-constants.mjs";

const MOVE_TIMEOUT = 5 * 60 * 1000;
const PROMOTION_TIMEOUT = 20 * 1000;

export class ServerChessBoard extends ChessBoard {
    constructor(startedAt, onFlagFallCallback) {
        super();
        this.startedAt = startedAt;
        this.promotion = null;
        this.movesWithoutPawnOrCapture = 0;
        this.positions = new Map();
        this.flagFallTimeout = -1;
        this.onFlagFallCallback = onFlagFallCallback;
    }

    startGame(room) {
        this.startFlagFallTimeout(MOVE_TIMEOUT);
        return { nextTurn: this.nextTurn };
    }

    startFlagFallTimeout(timeOut) {
        clearTimeout(this.flagFallTimeout);
        this.nextTurn = Date.now() + timeOut;
        this.flagFallTimeout = setTimeout(() => this.onFlagFallTimeout(), timeOut);
    }

    getState() {
        const { board, whitesTurn, turn, moves, nextTurn } = this;
        return { board, whitesTurn, turn, moves, nextTurn };
    }

    onFlagFallTimeout(room) {
        const winner = ServerChessBoard.TURNS[Number(!this.whitesTurn)];
        const loser = ServerChessBoard.TURNS[Number(this.whitesTurn)];
        this.nextTurn = 0;
        this.promotion = null;
        this.onFlagFallCallback(new MoveResult(loser, null, new Win(winner, loser, "flag-fall"), this.nextTurn));
    }

    getPiecesByColor(color) {
        return this.registry.getPiecesByColor(color);
    }

    move(color, playerMove) {
        const { from, to } = playerMove;
        if (from.row < 0 || from.row >= ROWS || from.col < 0 || from.col >= COLS || to.row < 0 || to.row >= ROWS || to.col < 0 || to.col >= COLS) {
            return new MoveResult(
                color,
                new InvalidMove(null, new Position(from.row, from.col), new Position(to.row, to.col)),
                null,
                this.nextTurn
            );
        }

        const piece = this.getPiece(from.row, from.col);
        if (ServerChessBoard.TURNS[Number(this.whitesTurn)] !== color || color !== piece.color) {
            return new MoveResult(
                color,
                new InvalidMove(piece, new Position(from.row, from.col), new Position(to.row, to.col)),
                null,
                this.nextTurn
            );
        }

        const legalMoves = piece.possibleMoves(this);
        if (!legalMoves.find((target) => target.row === to.row && target.col === to.col)) {
            return new MoveResult(
                color,
                new InvalidMove(piece, new Position(from.row, from.col), new Position(to.row, to.col)),
                null,
                this.nextTurn
            );
        }

        const move = piece.determineMove(this, to.row, to.col);
        move.execute(this);
        move.timeStampMS = Date.now() - this.startedAt;

        let outcome = null;
        if (move.isPromotion()) {
            this.promotion = { pawn: piece, move };
            this.startFlagFallTimeout(PROMOTION_TIMEOUT);
        }
        else {
            this.finalizeMove(move);
            outcome = this.checkWinOrDraw(piece, move);
            if (!outcome) {
                this.startFlagFallTimeout(MOVE_TIMEOUT);
            }
            else {
                this.nextTurn = 0;
            }
        }

        return new MoveResult(color, move, outcome, this.nextTurn);
    }

    promote(color, pieceType) {
        if (this.promotion === null) {
            return MoveResult(color, new InvalidMove(null, null, null), null, this.nextTurn);
        }

        if (ServerChessBoard.TURNS[Number(this.whitesTurn)] !== color) {
            const move = { ...this.promotion.move };
            move.move.type |= Move.TYPE.INVALID;
            return new MoveResult(color, move, null, this.nextTurn);
        }

        const { pawn, move } = this.promotion;
        this.promotion = null;
        move.promotionPiece = { type: pieceType, color: pawn.color };
        this.finalizeMove(move)
        move.execute(this);
        move.timeStampMS = Date.now() - this.startedAt;

        const outcome = this.checkWinOrDraw(this.getPiece(pawn.row, pawn.col), move);
        if (!outcome) {
            this.startFlagFallTimeout(MOVE_TIMEOUT);
        }

        return new MoveResult(color, move, outcome, this.nextTurn);
    }

    checkWinOrDraw(piece, move) {
        const check = piece.getOpponentKing(this).isInCheck(this);

        let outcome = this.checkOrStalemate(piece, check);
        if (check && outcome) {
            move.type |= Move.TYPE.CHECKMATE;
        }
        else if (check) {
            move.type |= Move.TYPE.CHECK;
        }

        if (outcome) {
            return outcome;
        }

        outcome = this.threefoldRepetition();
        if (outcome) {
            return outcome;
        }

        outcome = this.fiftyMoveRule();
        if (outcome) {
            return outcome;
        }

        return this.deadPosition();
    }

    checkOrStalemate(piece, check) {
        const opponentPieces = piece.getOpponentPieces(this);

        let canMove = false;
        for (const opponentPiece of opponentPieces) {
            const moves = opponentPiece.possibleMoves(this);
            if (moves.length > 0) {
                canMove = true;
                break;
            }
        }

        if (!canMove) {
            if (check) {
                return new Win(piece.color, piece.getOpponent(), "checkmate");
            }

            return new Draw("stalemate");
        }

        return null;
    }

    fiftyMoveRule() {
        if (this.movesWithoutPawnOrCapture >= 50) {
            return new Draw("fifty-move rule");
        }

        return null;
    }

    deadPosition() {
        const { blackCount, whiteCount } = this.registry;

        if (whiteCount === 1 && blackCount === 1) {
            return new Draw("dead position");
        }

        if (whiteCount <= 2 && blackCount <= 2) {
            const knights = this.registry.getPiecesByType(PIECE_TYPE.KNIGHT);
            const bishops = this.registry.getPiecesByType(PIECE_TYPE.BISHOP);

            if (whiteCount === 1) {
                if (bishops[PIECE_COLOR.BLACK].length === 1 || knights[PIECE_COLOR.BLACK].length === 1) {
                    return new Draw("dead position");
                }
            }

            if (blackCount === 1) {
                if (bishops[PIECE_COLOR.WHITE].length === 1 || knights[PIECE_COLOR.WHITE].length === 1) {
                    return new Draw("dead position");
                }
            }

            if (bishops[PIECE_COLOR.WHITE].length === 1 && bishops[PIECE_COLOR.BLACK].length === 1) {
                if (sameColorTile(bishops[PIECE_COLOR.WHITE][0], bishops[PIECE_COLOR.BLACK][0])) {
                    return new Draw("dead position");
                }
            }
        }

        function sameColorTile(bishop1, bishop2) {
            const b1Parity = (bishop1.row & 1) === (bishop1.col & 1);
            const b2Parity = (bishop2.row & 1) === (bishop2.col & 1);

            return b1Parity === b2Parity;
        }

        return null;
    }

    threefoldRepetition() {
        let position = {
            board: this.board,
            whitesTurn: this.whitesTurn,
            enpassant: this.isEnPassantPossible(),
            castlingRights: this.getCastlingRights()
        }
        position = JSON.stringify(position, (key, value) => {
            if (key === "board") {
                return this.board.map(piece => [piece.color, piece.type]);
            }
            return value;
        });

        const storedValue = this.positions.get(position);
        if (storedValue) {
            if (storedValue === 2) {
                return new Draw("threefold repetition");
            }
            this.positions.set(position, storedValue + 1);
        } else {
            this.positions.set(position, 1);
        }

        return null;
    }

    isEnPassantPossible() {
        const pawns = this.registry.getPiecesByType(PIECE_TYPE.PAWN, { asArray: true });
        for (const pawn of pawns) {
            if (pawn.enPassant(this)) {
                return true;
            }
        }
        return false;
    }

    getCastlingRights() {
        const kings = this.registry.getPiecesByType(PIECE_TYPE.KING, { asArray: true });

        const rights = {
            [PIECE_COLOR.WHITE]: [],
            [PIECE_COLOR.BLACK]: []
        };

        for (const king of kings) {
            if (king.isInCheck(this)) {
                rights[king.color] = [false, false];
            } else {
                rights[king.color][0] = king.canCastleKingSide(this);
                rights[king.color][1] = king.canCastleQueenSide(this);
            }
        }
        return rights;
    }

    addMove(move) {
        this.moves.push(move);
        if (this.turn % 2 !== 0 && this.moves.length >= 2) {
            const whiteMove = this.moves[this.moves.length - 2];
            const blackMove = this.moves[this.moves.length - 1];
            if (
                !whiteMove.isPawn() &&
                !whiteMove.isCapture() &&
                !blackMove.isPawn() &&
                !blackMove.isCapture()
            ) {
                ++this.movesWithoutPawnOrCapture;
            } else {
                this.movesWithoutPawnOrCapture = 0;
            }
        }
    }

    resign(loserColor) {
        clearTimeout(this.flagFallTimeout);
        this.nextTurn = 0;
        const winner = ServerChessBoard.TURNS.find(color => color !== loserColor);
        return new MoveResult(loserColor, null, new Win(winner, loserColor, "resignation"), this.nextTurn)
    }
}
