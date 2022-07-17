import { ROWS, COLS } from "../chessboard/chessboard-constants.mjs";

export function bishopMoves(piece, board) {
  const row = piece.row;
  const col = piece.col;

  const moves = [];

  for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; --i, --j) {
    const current = board.getPiece(i, j);
    moves.push(current);
    if (!current.isNull()) {
      break;
    }
  }

  for (let i = row - 1, j = col + 1; i >= 0 && j < COLS; --i, ++j) {
    const current = board.getPiece(i, j);
    moves.push(current);
    if (!current.isNull()) {
      break;
    }
  }

  for (let i = row + 1, j = col - 1; i < ROWS && j >= 0; ++i, --j) {
    const current = board.getPiece(i, j);
    moves.push(current);
    if (!current.isNull()) {
      break;
    }
  }

  for (
    let i = row + 1, j = col + 1;
    i < ROWS && j < COLS;
    ++i, ++j
  ) {
    const current = board.getPiece(i, j);
    moves.push(current);
    if (!current.isNull()) {
      break;
    }
  }

  return moves;
}
