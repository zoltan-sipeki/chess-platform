import { PIECE_COLOR, PIECE_TYPE } from "./pieces/piece-constants.mjs";

export class PieceRegistry {
    constructor(board) {
        this.pieces = {
            [PIECE_COLOR.WHITE]: {
                [PIECE_TYPE.BISHOP]: [],
                [PIECE_TYPE.KING]: [],
                [PIECE_TYPE.KNIGHT]: [],
                [PIECE_TYPE.PAWN]: [],
                [PIECE_TYPE.ROOK]: [],
                [PIECE_TYPE.QUEEN]: []
            },
            [PIECE_COLOR.BLACK]: {
                [PIECE_TYPE.BISHOP]: [],
                [PIECE_TYPE.KING]: [],
                [PIECE_TYPE.KNIGHT]: [],
                [PIECE_TYPE.PAWN]: [],
                [PIECE_TYPE.ROOK]: [],
                [PIECE_TYPE.QUEEN]: []
            },
            [PIECE_COLOR.NONE]: {
                [PIECE_TYPE.NONE]: []
            }
        };

        Object.defineProperty(this.pieces[PIECE_COLOR.WHITE], "size", {
            writable: true,
            enumerable: false,
            value: 0
        });

        Object.defineProperty(this.pieces[PIECE_COLOR.BLACK], "size", {
            writable: true,
            enumerable: false,
            value: 0
        });

        if (board) {
            board.forEach(piece => this.add(piece));
        }
    }

    get blackCount() {
        return this.pieces[PIECE_COLOR.BLACK].size;
    }

    get whiteCount() {
        return this.pieces[PIECE_COLOR.WHITE].size;
    }

    getCountByType(type) {
        return {
            [PIECE_TYPE.WHITE]: this.pieces[PIECE_TYPE.WHITE][type].length,
            [PIECE_TYPE.BLACK]: this.pieces[PIECE_TYPE.BLACK][type].length
        };
    }

    get(type, color) {
        return this.pieces[color][type];
    }

    getPiecesByColor(color) {
        return Object.values(this.pieces[color]).flat();
    }

    getPiecesByType(type, { asArray = false }) {
        if (asArray) {
            return [
                ...this.pieces[PIECE_COLOR.WHITE][type],
                ...this.pieces[PIECE_COLOR.BLACK][type]
            ];
        }

        return {
            [PIECE_COLOR.WHITE]: this.pieces[PIECE_COLOR.WHITE][type],
            [PIECE_COLOR.BLACK]: this.pieces[PIECE_COLOR.BLACK][type]
        };
    }

    add(piece) {
        this.pieces[piece.color][piece.type].push(piece);
        if (!piece.isNull()) {
            ++this.pieces[piece.color].size;
        }
    }

    remove(piece) {
        if (piece.isKing()) {
            return;
        }
        this.pieces[piece.color][piece.type] = this.pieces[piece.color][
            piece.type
        ].filter((stored) => stored.row !== piece.row || stored.col !== piece.col);
        if (!piece.isNull()) {
            --this.pieces[piece.color].size;
        }
    }

    // on client
    replace(piece) {
        const pieces = this.pieces[piece.color][piece.type];
        const index = pieces.findIndex((stored) => stored.row === piece.row && stored.col === piece.col);
        if (index > -1) {
            const copy = pieces[index].copy();
            pieces[index] = pieces[pieces.length - 1];
            pieces[pieces.length - 1] = copy;
            return copy;
        }

        return null;
    }

    swap(toBeRemoved, toBeAdded) {
        this.remove(toBeRemoved);
        this.add(toBeAdded);
    }
}
