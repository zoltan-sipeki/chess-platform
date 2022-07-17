import {
    Move,
    NormalMove,
    CapturingMove,
    EnPassantMove,
    QueenSideCastlingMove,
    KingSideCastlingMove,
    PromotionMove,
    ReplayPromotionMove,
    CheckMove,
    CheckmateMove,
    InvalidMove
} from "./Move.mjs";
import { Position } from "./Position.mjs";
import { PIECE_TYPE } from "./pieces/piece-constants.mjs";
import { Pawn } from "./pieces/Pawn.mjs";
import { Bishop } from "./pieces/Bishop.mjs";
import { King } from "./pieces/King.mjs";
import { Knight } from "./pieces/Knight.mjs";
import { Queen } from "./pieces/Queen.mjs";
import { Rook } from "./pieces/Rook.mjs";
import { NullPiece } from "./pieces/NullPiece.mjs";

export function deserializeMove(move, replay) {
    let result = null;

    if ("move" in move) {
        if (move.move.type & Move.TYPE.PROMOTION) {
            result = copyObjectWithPrototype(move, replay ? ReplayPromotionMove.prototype : PromotionMove.prototype, (src, key) => {
                if (key === "move") {
                    return deserializeMove(src.move, replay);
                }
                return src[key];
            });
        }
    }
    else {
        if (move.type & Move.TYPE.NORMAL) {
            result = copyMoveWithPrototype(move, NormalMove.prototype)
        }
        else if (move.type & Move.TYPE.CAPTURE) {
            result = copyMoveWithPrototype(move, CapturingMove.prototype);
        }
        else if (move.type & Move.TYPE.EN_PASSANT) {
            result = copyMoveWithPrototype(move, EnPassantMove.prototype);
        }
        else if (move.type & Move.TYPE.QUEEN_SIDE_CASTLING) {
            result = copyMoveWithPrototype(move, QueenSideCastlingMove.prototype);
        }
        else if (move.type & Move.TYPE.KING_SIDE_CASTLING) {
            result = copyMoveWithPrototype(move, KingSideCastlingMove.prototype);
        }
        else if (move.type === Move.TYPE.INVALID) {
            result = copyMoveWithPrototype(move, InvalidMove.prototype);
        }
    }

    if (result.type & Move.TYPE.CHECK) {
        result = new CheckMove(result);
    }
    else if (result.type & Move.TYPE.CHECKMATE) {
        result = new CheckmateMove(result);
    }

    return result;
}


function copyMoveWithPrototype(src, prototype) {
    return copyObjectWithPrototype(src, prototype, (src, key) => {
        if (key === "from" || key === "to") {
            return copyObjectWithPrototype(src[key], Position.prototype);
        }
        return src[key];
    })
}

export function deserializePiece(piece) {
    let result = null;

    switch (piece.type) {
        case PIECE_TYPE.PAWN:
            result = copyObjectWithPrototype(piece, Pawn.prototype);
            break;

        case PIECE_TYPE.KING:
            result = copyObjectWithPrototype(piece, King.prototype);
            break;

        case PIECE_TYPE.KNIGHT:
            result = copyObjectWithPrototype(piece, Knight.prototype);
            break;

        case PIECE_TYPE.QUEEN:
            result = copyObjectWithPrototype(piece, Queen.prototype);
            break;

        case PIECE_TYPE.ROOK:
            result = copyObjectWithPrototype(piece, Rook.prototype);
            break;

        case PIECE_TYPE.BISHOP:
            result = copyObjectWithPrototype(piece, Bishop.prototype);
            break;

        case PIECE_TYPE.NONE:
            result = copyObjectWithPrototype(piece, NullPiece.prototype);
            break;

        default:
            break;
    }

    return result;
}

function copyObjectWithPrototype(src, prototype, callback) {
    const dst = Object.create(prototype);

    for (const key in src) {
        if (callback) {
            dst[key] = callback(src, key);
        }
        else {
            dst[key] = src[key];
        }
    }

    return dst;
}