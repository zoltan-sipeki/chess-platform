
import { PIECE_COLOR, PIECE_TYPE } from "../pieces/piece-constants.mjs";
import { PIECE_CONSTRUCTORS } from "../pieces/piece-constructors.mjs";
import { PieceRegistry } from "../PieceRegistry.mjs";
import { ROWS, COLS } from "./chessboard-constants.mjs";

export class ChessBoard {
    static TURNS = [PIECE_COLOR.BLACK, PIECE_COLOR.WHITE];

    constructor() {
        this.board = new Array(ROWS * COLS);
        this.whitesTurn = true;
        this.registry = new PieceRegistry();
        this.turn = 0;
        this.moves = [];
        this.nextTurn = 0;

        this.initBoard();
    }

    initBoard() {
        for (let i = 0; i < ROWS; ++i) {
            for (let j = 0; j < COLS; ++j) {
                if (i === 1) {
                    this.board[i * COLS + j] = this.createPiece(i, j, PIECE_TYPE.PAWN, PIECE_COLOR.BLACK);
                } else if (i === 6) {
                    this.board[i * COLS + j] = this.createPiece(i, j, PIECE_TYPE.PAWN, PIECE_COLOR.WHITE);
                } else if (i > 1 && i < 6) {
                    this.board[i * COLS + j] = this.createPiece(i, j, PIECE_TYPE.NONE);
                }
            }
        }

        this.board[0 * COLS + 0] = this.createPiece(0, 0, PIECE_TYPE.ROOK, PIECE_COLOR.BLACK);
        this.board[0 * COLS + 1] = this.createPiece(0, 1, PIECE_TYPE.KNIGHT, PIECE_COLOR.BLACK);
        this.board[0 * COLS + 2] = this.createPiece(0, 2, PIECE_TYPE.BISHOP, PIECE_COLOR.BLACK);
        this.board[0 * COLS + 3] = this.createPiece(0, 3, PIECE_TYPE.QUEEN, PIECE_COLOR.BLACK);
        this.board[0 * COLS + 4] = this.createPiece(0, 4, PIECE_TYPE.KING, PIECE_COLOR.BLACK);
        this.board[0 * COLS + 5] = this.createPiece(0, 5, PIECE_TYPE.BISHOP, PIECE_COLOR.BLACK);
        this.board[0 * COLS + 6] = this.createPiece(0, 6, PIECE_TYPE.KNIGHT, PIECE_COLOR.BLACK);
        this.board[0 * COLS + 7] = this.createPiece(0, 7, PIECE_TYPE.ROOK, PIECE_COLOR.BLACK);

        this.board[7 * COLS + 0] = this.createPiece(7, 0, PIECE_TYPE.ROOK, PIECE_COLOR.WHITE);
        this.board[7 * COLS + 1] = this.createPiece(7, 1, PIECE_TYPE.KNIGHT, PIECE_COLOR.WHITE);
        this.board[7 * COLS + 2] = this.createPiece(7, 2, PIECE_TYPE.BISHOP, PIECE_COLOR.WHITE);
        this.board[7 * COLS + 3] = this.createPiece(7, 3, PIECE_TYPE.QUEEN, PIECE_COLOR.WHITE);
        this.board[7 * COLS + 4] = this.createPiece(7, 4, PIECE_TYPE.KING, PIECE_COLOR.WHITE);
        this.board[7 * COLS + 5] = this.createPiece(7, 5, PIECE_TYPE.BISHOP, PIECE_COLOR.WHITE);
        this.board[7 * COLS + 6] = this.createPiece(7, 6, PIECE_TYPE.KNIGHT, PIECE_COLOR.WHITE);
        this.board[7 * COLS + 7] = this.createPiece(7, 7, PIECE_TYPE.ROOK, PIECE_COLOR.WHITE);

        this.board.forEach((piece) => this.registry.add(piece));
    }

    createPiece(row, col, type, color) {
        return new PIECE_CONSTRUCTORS[type](row, col, color);
    }

    replacePiece(toBeReplaced, replacement) {
        this.registry.remove(toBeReplaced);
        this.registry.add(replacement);
        this.setPiece(replacement.row, replacement.col, replacement);
    }

    getKing(color) {
        if (typeof color === "boolean") {
            color = ChessBoard.TURNS[Number(color)];
        }
        return this.registry.get(PIECE_TYPE.KING, color)[0];
    }

    getPiece(row, col) {
        return this.board[row * COLS + col];
    }

    setPiece(row, col, piece) {
        this.board[row * COLS + col] = piece;
    }

    swapPositions(row1, col1, row2, col2) {
        const first = this.getPiece(row1, col1);
        const second = this.getPiece(row2, col2);
        first.row = row2;
        first.col = col2;

        second.row = row1;
        second.col = col1;

        this.setPiece(row1, col1, second);
        this.setPiece(row2, col2, first);
    }

    finalizeMove(move) {
        this.addMove(move);
        const swaps = move.getSwaps();
        for (const swap of swaps) {
            let piece = this.getPiece(swap.from.row, swap.from.col);
            if (!piece.isNull()) {
                piece.lastTurn = this.turn;
                ++piece.moves;
            }
            piece = this.getPiece(swap.to.row, swap.to.col);
            if (!piece.isNull()) {
                piece.lastTurn = this.turn;
                ++piece.moves;
            }
        }

        ++this.turn;
        this.whitesTurn = !this.whitesTurn;
    }
}