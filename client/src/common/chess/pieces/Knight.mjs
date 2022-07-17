import { Piece } from "./Piece.mjs";
import { knightMoves } from "./knight-strategy.mjs";
import { PIECE_TYPE } from "./piece-constants.mjs";

export class Knight extends Piece {
  constructor(row, col, color) {
    super(row, col, color, PIECE_TYPE.KNIGHT);
  }

  getMoves(board) {
    return knightMoves(this, board);
  }
}
