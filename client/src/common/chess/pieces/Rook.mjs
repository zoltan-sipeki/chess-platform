import { Piece } from "./Piece.mjs";
import { rookMoves } from "./rook-strategy.mjs";
import { PIECE_TYPE } from "./piece-constants.mjs";

export class Rook extends Piece {
  constructor(row, col, color) {
    super(row, col, color, PIECE_TYPE.ROOK);
  }

  getMoves(board) {
    return rookMoves(this, board);
  }
}
