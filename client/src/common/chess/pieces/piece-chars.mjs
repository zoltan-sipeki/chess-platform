import { PIECE_COLOR, PIECE_TYPE } from "./piece-constants.mjs";

export const PIECE_CHARS = {
  [PIECE_COLOR.WHITE]: {
    [PIECE_TYPE.BISHOP]: String.fromCodePoint(9815),
    [PIECE_TYPE.KNIGHT]: String.fromCodePoint(9816),
    [PIECE_TYPE.ROOK]: String.fromCodePoint(9814),
    [PIECE_TYPE.QUEEN]: String.fromCodePoint(9813),
    [PIECE_TYPE.PAWN]: String.fromCodePoint(9817),
    [PIECE_TYPE.KING]: String.fromCodePoint(9812)
  },
  [PIECE_COLOR.BLACK]: {
    [PIECE_TYPE.BISHOP]: String.fromCodePoint(9821),
    [PIECE_TYPE.KNIGHT]: String.fromCodePoint(9822),
    [PIECE_TYPE.ROOK]: String.fromCodePoint(9820),
    [PIECE_TYPE.QUEEN]: String.fromCodePoint(9819),
    [PIECE_TYPE.PAWN]: String.fromCodePoint(9823),
    [PIECE_TYPE.KING]: String.fromCodePoint(9818)
  }
};
