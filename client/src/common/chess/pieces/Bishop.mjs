import { Piece } from "./Piece.mjs";
import { bishopMoves } from "./bishop-strategy.mjs";
import { PIECE_TYPE } from "./piece-constants.mjs";

export class Bishop extends Piece {
  constructor(row, col, color) {
    super(row, col, color, PIECE_TYPE.BISHOP);
  }

  getMoves(board) {
    return bishopMoves(this, board);
  }
}
