import { ROWS, COLS } from "../chessboard/chessboard-constants.mjs";

export function rookMoves(piece, board) {
  const row = piece.row;
  const col = piece.col;

  const moves = [];
  for (let i = row + 1; i < ROWS; ++i) {
    const current = board.getPiece(i, col);
    moves.push(current);
    if (!current.isNull()) {
      break;
    }
  }

  for (let i = row - 1; i >= 0; --i) {
    const current = board.getPiece(i, col);
    moves.push(current);
    if (!current.isNull()) {
      break;
    }
  }

  for (let j = col + 1; j < COLS; ++j) {
    const current = board.getPiece(row, j);
    moves.push(current);
    if (!current.isNull()) {
      break;
    }
  }

  for (let j = col - 1; j >= 0; --j) {
    const current = board.getPiece(row, j);
    moves.push(current);
    if (!current.isNull()) {
      break;
    }
  }

  return moves;
}
