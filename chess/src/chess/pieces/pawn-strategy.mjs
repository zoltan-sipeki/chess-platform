import { ROWS, COLS } from "../chessboard/chessboard-constants.mjs";

export function pawnCapturingMoves(piece, board) {
  const row = piece.row;
  const col = piece.col;

  const moves = [];
  const dir = piece.isWhite() ? -1 : 1;
  for (let i = row + dir; i !== row; i += dir) {
    if (i < 0 || i >= ROWS) {
      break;
    }
    if (col - 1 >= 0) {
      const current = board.getPiece(row + dir, col - 1);
      if (!current.isNull()) {
        moves.push(current);
      }
    }

    if (col + 1 < COLS) {
      const current = board.getPiece(row + dir, col + 1);
      if (!current.isNull()) {
        moves.push(current);
      }
    }
  }

  return moves;
}
