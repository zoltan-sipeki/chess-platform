import { Position } from "./Position.mjs";
import { PIECE_CHARS } from "./pieces/piece-chars.mjs";
import { PIECE_TYPE } from "./pieces/piece-constants.mjs";

export class Move {
    static TYPE = Object.freeze({
        INVALID: 0,
        NORMAL: 1 << 0, // 1
        CAPTURE: 1 << 1, // 2
        EN_PASSANT: 1 << 2, // 4
        PROMOTION: 1 << 3, // 8
        QUEEN_SIDE_CASTLING: 1 << 4, // 16
        KING_SIDE_CASTLING: 1 << 5, // 32
        CHECK: 1 << 6, // 64
        CHECKMATE: 1 << 7 // 128
    });

    static invalidMove(piece, board, toRow, toCol) {
        const moves = piece.possibleMoves(board);
        if (moves.find((move) => move.row === toRow && move.col === toCol)) {
            return null;
        }
        return new InvalidMove(
            piece,
            new Position(piece.row, piece.col),
            new Position(toRow, toCol)
        );
    }

    static normalMove(piece, board, toRow, toCol) {
        if (board.getPiece(toRow, toCol).isNull()) {
            return new NormalMove(
                piece,
                new Position(piece.row, piece.col),
                new Position(toRow, toCol)
            );
        }

        return null;
    }

    static capturingMove(piece, board, toRow, toCol) {
        const target = board.getPiece(toRow, toCol);
        if (!target.isNull() && target.color !== piece.color) {
            return new CapturingMove(
                piece,
                new Position(piece.row, piece.col),
                new Position(toRow, toCol)
            );
        }

        return null;
    }

    constructor(piece, from, to, type) {
        this.piece = {
            color: piece.color,
            type: piece.type
        };
        this.from = from;
        this.to = to;
        this.type = type;
        this.timeStampMS = 0;
    }

    isPromotion() {
        return this.type & Move.TYPE.PROMOTION;
    }

    isCapture() {
        return this.type & Move.TYPE.CAPTURE;
    }

    isInvalid() {
        return this.type === Move.TYPE.INVALID;
    }

    isCheck() {
        return this.type & Move.TYPE.CHECK;
    }

    isCheckmate() {
        return this.type & Move.TYPE.CHECKMATE;
    }

    isPawn() {
        return this.piece.type === PIECE_TYPE.PAWN;
    }

    execute(board) { }

    undo(board) { }

    getSwaps() { }

    toString() { }
}

export class NormalMove extends Move {
    constructor(piece, from, to) {
        super(piece, from, to, Move.TYPE.NORMAL);
    }

    execute(board) {
        const from = this.from;
        const to = this.to;

        board.swapPositions(from.row, from.col, to.row, to.col);
    }

    undo(board) {
        this.execute(board);
    }

    getSwaps() {
        return [{ from: this.from, to: this.to }];
    }

    toString() {
        const { piece, from, to } = this;
        return `${PIECE_CHARS[piece.color][piece.type]
            }${from.algebraicNotation()}-${to.algebraicNotation()}`;
    }
}

export class InvalidMove extends Move {
    constructor(piece, from, to) {
        super(piece, from, to, Move.TYPE.INVALID);
    }

    execute(board) { }

    undo(board) { }

    getSwaps() { }

    toString() {
        return "";
    }
}

export class CapturingMove extends Move {
    constructor(piece, from, to) {
        super(piece, from, to, Move.TYPE.CAPTURE);
        this.capturedPiece = null;
    }

    execute(board) {
        const from = this.from;
        const to = this.to;

        this.capturedPiece = board.getPiece(to.row, to.col);
        board.replacePiece(
            this.capturedPiece,
            board.createPiece(
                this.capturedPiece.row,
                this.capturedPiece.col,
                PIECE_TYPE.NONE
            )
        );
        board.swapPositions(from.row, from.col, to.row, to.col);
    }

    undo(board) {
        const from = this.from;
        const to = this.to;

        board.swapPositions(from.row, from.col, to.row, to.col);
        board.replacePiece(
            board.getPiece(this.capturedPiece.row, this.capturedPiece.col),
            this.capturedPiece
        );
        this.capturedPiece = null;
    }

    getSwaps() {
        return [{ from: this.from, to: this.to }];
    }

    toString() {
        const { piece, from, to } = this;
        return `${PIECE_CHARS[piece.color][piece.type]
            }${from.algebraicNotation()}x${to.algebraicNotation()}`;
    }

    toJSON(key) {
        const result = { ...this };
        result.capturedPiece = null;
        return result;
    }
}

export class EnPassantMove extends Move {
    constructor(piece, from, to) {
        super(piece, from, to, Move.TYPE.EN_PASSANT);
        this.capturedPiece = null;
    }

    execute(board) {
        const from = this.from;
        const to = this.to;

        board.swapPositions(from.row, from.col, to.row, to.col);
        if (to.col < from.col) {
            this.capturedPiece = board.getPiece(from.row, from.col - 1);
        } else {
            this.capturedPiece = board.getPiece(from.row, from.col + 1);
        }
        board.replacePiece(
            this.capturedPiece,
            board.createPiece(
                this.capturedPiece.row,
                this.capturedPiece.col,
                PIECE_TYPE.NONE
            )
        );
    }

    undo(board) {
        const from = this.from;
        const to = this.to;

        board.replacePiece(
            board.getPiece(this.capturedPiece.row, this.capturedPiece.col),
            this.capturedPiece
        );
        board.swapPositions(from.row, from.col, to.row, to.col);
        this.capturedPiece = null;
    }

    getSwaps() {
        return [{ from: this.from, to: this.to }];
    }

    toString() {
        const { piece, from, to } = this;
        return `${PIECE_CHARS[piece.color][piece.type]
            }${from.algebraicNotation()}x${to.algebraicNotation()} e.p.`;
    }

    toJSON(key) {
        const result = { ...this };
        result.capturedPiece = null;
        return result;
    }
}

export class QueenSideCastlingMove extends Move {
    constructor(piece, from, to) {
        super(piece, from, to, Move.TYPE.QUEEN_SIDE_CASTLING);
    }

    execute(board) {
        const from = this.from;
        const to = this.to;

        board.swapPositions(from.row, from.col, to.row, to.col);
        board.swapPositions(from.row, 0, to.row, to.col + 1);
    }

    getSwaps() {
        return [{ from: this.from, to: this.to }, { from: new Position(this.from.row, 0), to: new Position(this.to.row, this.to.col + 1) }];
    }

    undo(board) {
        this.execute(board);
    }

    toString() {
        return "0-0-0";
    }
}

export class KingSideCastlingMove extends Move {
    constructor(piece, from, to) {
        super(piece, from, to, Move.TYPE.KING_SIDE_CASTLING);
    }

    execute(board) {
        const from = this.from;
        const to = this.to;

        board.swapPositions(from.row, from.col, to.row, to.col);
        board.swapPositions(from.row, 7, to.row, to.col - 1);

        return [{ from, to }, { from: new Position(from.row, 7), to: new Position(to.row, to.col - 1) }];
    }

    undo(board) {
        this.execute(board);
    }

    getSwaps() {
        return [{ from: this.from, to: this.to }, { from: new Position(this.from.row, 7), to: new Position(this.to.row, this.to.col - 1) }];
    }

    toString() {
        return "0-0";
    }
}

export class PromotionMove {
    constructor(move) {
        this.move = move;
        this.move.type |= Move.TYPE.PROMOTION;
        this.promotionPiece = null;
        this.pawn = null;

        Object.defineProperties(this, {
            "type": {
                enumerable: false
            },
            "from": {
                enumerable: false
            },
            "to": {
                enumerable: false
            },
        });
    }

    get timeStampMS() {
        return this.move.timeStampMS;
    }

    set timeStampMS(value) {
        this.move.timeStampMS = value;;
    }

    get type() {
        return this.move.type;
    }

    set type(value) {
        this.move.type = value;
    }

    get from() {
        return this.move.from;
    }

    get to() {
        return this.move.to;
    }

    isInvalid() {
        return this.move.type === Move.TYPE.INVALID;
    }

    isPromotion() {
        return this.move.isPromotion() && this.promotionPiece === null;
    }

    isCapture() {
        return this.move.isCapture();
    }

    isCheck() {
        return this.move.type & Move.TYPE.CHECK;
    }

    isCheckmate() {
        return this.type & Move.TYPE.CHECKMATE;
    }

    isPawn() {
        return this.move.isPawn();
    }

    execute(board) {
        if (this.promotionPiece === null) {
            this.executeFirstHalf(board);
        }
        else {
            this.executeSecondHalf(board);
        }
    }

    executeFirstHalf(board) {
        this.move.execute(board);
    }

    executeSecondHalf(board) {
        const { to } = this.move;
        this.pawn = board.getPiece(to.row, to.col);
        board.replacePiece(
            this.pawn,
            board.createPiece(this.pawn.row, this.pawn.col, this.promotionPiece.type, this.promotionPiece.color)
        );
    }

    undo(board) {
        if (this.promotionPiece === null) {
            this.undoFirstHalf(board);
        }
        else {
            this.undoSecondHalf(board);
        }
    }

    undoFirstHalf(board) {
        this.move.undo(board);
    }

    undoSecondHalf(board) {
        board.replacePiece(
            board.getPiece(this.pawn.row, this.pawn.col),
            this.pawn
        );
        this.pawn = null;
    }

    getSwaps() {
        return this.move.getSwaps();
    }

    toString() {
        return `${this.move.toString()}${PIECE_CHARS[this.promotionPiece.color][this.promotionPiece.type]}`;
    }

    toJSON(key) {
        const result = { ...this };
        result.pawn = null;
        return result;
    }
}

export class ReplayPromotionMove extends PromotionMove {
    execute(board) {
        this.executeFirstHalf(board);
        this.executeSecondHalf(board);
    }

    undo(board) {
        this.undoSecondHalf(board);
        this.undoFirstHalf(board);
    }
}

export class CheckMove {
    constructor(move) {
        this.move = move;
        this.move.type |= Move.CHECK;
    }

    get timeStampMS() {
        return this.move.timeStampMS;
    }

    set timeStampMS(value) {
        this.move.timeStampMS = value;;
    }


    get type() {
        return this.move.type;
    }

    set type(value) {
        return this.move.type = value;
    }

    get from() {
        return this.move.from;
    }

    get to() {
        return this.move.to;
    }

    execute(board) {
        this.move.execute(board);
    }

    undo(board) {
        this.move.undo(board);
    }

    getSwaps() {
        return this.move.getSwaps();
    }

    isInvalid() {
        return this.move.type === Move.TYPE.INVALID;
    }

    isCheck() {
        return this.move.type & Move.TYPE.CHECK;
    }

    isCheckmate() {
        return this.type & Move.TYPE.CHECKMATE;
    }

    isPromotion() {
        return this.move.isPromotion();
    }

    isCapture() {
        return this.move.isCapture();
    }

    isPawn() {
        return this.move.isPawn();
    }

    toString() {
        return `${this.move.toString()}+`;
    }
}

export class CheckmateMove {
    constructor(move) {
        this.move = move;
        this.move.type |= Move.CHECKMATE;
    }

    get timeStampMS() {
        return this.move.timeStampMS;
    }

    set timeStampMS(value) {
        this.move.timeStampMS = value;;
    }

    get type() {
        return this.move.type;
    }

    set type(value) {
        return this.move.type = value;
    }

    get from() {
        return this.move.from;
    }

    get to() {
        return this.move.to;
    }

    execute(board) {
        this.move.execute(board);
    }

    undo(board) {
        this.move.undo(board);
    }

    getSwaps() {
        return this.move.getSwaps();
    }

    isInvalid() {
        return this.move.type === Move.TYPE.INVALID;
    }

    isPromotion() {
        return this.move.isPromotion();
    }

    isCapture() {
        return this.move.isCapture();
    }

    isCheck() {
        return this.move.type & Move.TYPE.CHECK;
    }

    isCheckmate() {
        return this.type & Move.TYPE.CHECKMATE;
    }

    isPawn() {
        return this.move.isPawn();
    }

    toString() {
        return `${this.move.toString()}++`;
    }
}