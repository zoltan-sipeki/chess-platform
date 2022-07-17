import { Pawn } from "./Pawn.mjs";
import { Rook } from "./Rook.mjs";
import { Queen } from "./Queen.mjs";
import { King } from "./King.mjs";
import { Knight } from "./Knight.mjs";
import { Bishop } from "./Bishop.mjs";
import { PIECE_TYPE } from "./piece-constants.mjs";
import { NullPiece } from "./NullPiece.mjs";

export const PIECE_CONSTRUCTORS = {
    [PIECE_TYPE.BISHOP]: Bishop,
    [PIECE_TYPE.KNIGHT]: Knight,
    [PIECE_TYPE.ROOK]: Rook,
    [PIECE_TYPE.QUEEN]: Queen,
    [PIECE_TYPE.PAWN]: Pawn,
    [PIECE_TYPE.KING]: King,
    [PIECE_TYPE.NONE]: NullPiece
};