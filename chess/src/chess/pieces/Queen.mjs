import { Piece } from "./Piece.mjs";
import { rookMoves } from "./rook-strategy.mjs";
import { bishopMoves } from "./bishop-strategy.mjs";
import { PIECE_TYPE } from "./piece-constants.mjs";

export class Queen extends Piece {
  constructor(row, col, color) {
    super(row, col, color, PIECE_TYPE.QUEEN);
  }

  getMoves(board) {
    return [...rookMoves(this, board), ...bishopMoves(this, board)];
  }
}
