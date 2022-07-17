import { ROWS, COLS } from "../chessboard/chessboard-constants.mjs";

export function knightMoves(piece, board) {
  const row = piece.row;
  const col = piece.col;

  const moves = [];
  const upperSecondRow = row - 2 >= 0;
  const upperFirstRow = row - 1 >= 0;
  const lowerFirstRow = row + 1 < ROWS;
  const lowerSecondRow = row + 2 < ROWS;
  const leftSecondCol = col - 2 >= 0;
  const leftFirstCol = col - 1 >= 0;
  const rightFirstCol = col + 1 < COLS;
  const rightSecondCol = col + 2 < COLS;

  if (upperSecondRow) {
    if (leftFirstCol) {
      moves.push(board.getPiece(row - 2, col - 1));
    }
    if (rightFirstCol) {
      moves.push(board.getPiece(row - 2, col + 1));
    }
  }

  if (upperFirstRow) {
    if (leftSecondCol) {
      moves.push(board.getPiece(row - 1, col - 2));
    }
    if (rightSecondCol) {
      moves.push(board.getPiece(row - 1, col + 2));
    }
  }

  if (lowerFirstRow) {
    if (leftSecondCol) {
      moves.push(board.getPiece(row + 1, col - 2));
    }
    if (rightSecondCol) {
      moves.push(board.getPiece(row + 1, col + 2));
    }
  }

  if (lowerSecondRow) {
    if (leftFirstCol) {
      moves.push(board.getPiece(row + 2, col - 1));
    }
    if (rightFirstCol) {
      moves.push(board.getPiece(row + 2, col + 1));
    }
  }

  return moves;
}
