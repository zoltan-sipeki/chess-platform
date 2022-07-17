import { Piece } from "./Piece.mjs";
import { PIECE_TYPE, PIECE_COLOR } from "./piece-constants.mjs";

export class NullPiece extends Piece {
  constructor(row, col) {
    super(row, col, PIECE_COLOR.NONE, PIECE_TYPE.NONE);
  }

  possibleMoves(board) {
    return [];
  }
}
