import { PIECE_COLOR, PIECE_TYPE } from "./piece-constants.mjs";
import { Move } from "../Move.mjs";

export class Piece {
    constructor(row, col, color, type) {
        this.row = row;
        this.col = col;
        this.color = color;
        this.type = type;
        this.lastTurn = -1;
        this.moves = 0;
    }

    isBlack() {
        return this.color === PIECE_COLOR.BLACK;
    }

    isWhite() {
        return this.color === PIECE_COLOR.WHITE;
    }

    isNull() {
        return this.type === PIECE_TYPE.NONE;
    }

    isKing() {
        return this.type === PIECE_TYPE.KING;
    }

    isPawn() {
        return this.type === PIECE_TYPE.PAWN;
    }

    isKnight() {
        return this.type === PIECE_TYPE.KNIGHT;
    }

    isRook() {
        return this.type === PIECE_TYPE.ROOK;
    }

    isBishop() {
        return this.type === PIECE_TYPE.BISHOP;
    }

    isQueen() {
        return this.type === PIECE_TYPE.QUEEN;
    }

    getKing(board) {
        return board.getKing(this.color);
    }

    getOpponent() {
        if (this.color === PIECE_COLOR.BLACK) {
            return PIECE_COLOR.WHITE;
        }

        if (this.color === PIECE_COLOR.WHITE) {
            return PIECE_COLOR.BLACK;
        }

        return PIECE_COLOR.NONE;
    }

    getOpponentKing(board) {
        return board.getKing(this.getOpponent());
    }

    getOpponentPieces(board) {
        return board.getPiecesByColor(this.getOpponent());
    }

    possibleMoves(board) {
        let moves = this.getMoves(board);
        moves = moves.filter(
            (piece) => piece.color !== this.color && !piece.isKing()
        );

        const king = this.getKing(board);

        return moves.filter((target) => {
            const move = this.determineMove(board, target.row, target.col);
            let check = false;
            move.execute(board);
            check = king.isInCheck(board);
            move.undo(board);
            return !check;
        });
    }

    determineMove(board, toRow, toCol) {
        let move = Move.normalMove(this, board, toRow, toCol);
        if (move) {
            return move;
        }

        return Move.capturingMove(this, board, toRow, toCol);
    }
}
