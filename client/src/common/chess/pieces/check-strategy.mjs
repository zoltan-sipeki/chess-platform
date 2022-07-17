import { bishopMoves } from "./bishop-strategy.mjs";
import { knightMoves } from "./knight-strategy.mjs";
import { pawnCapturingMoves } from "./pawn-strategy.mjs";
import { rookMoves } from "./rook-strategy.mjs";

export function underAttack(piece, board, color) {
  let checkPiece = captureAsQueenOrBishop(piece, board, color);
  if (checkPiece) {
    return checkPiece;
  }

  checkPiece = captureAsKnight(piece, board, color);
  if (checkPiece) {
    return checkPiece;
  }

  checkPiece = captureAsPawn(piece, board, color);
  if (checkPiece) {
    return checkPiece;
  }

  return captureAsQueenOrRook(piece, board, color);
}

function captureAsPawn(piece, board, color) {
  const moves = pawnCapturingMoves(piece, board);
  return moves.find(
    (current) => current.isPawn() && current.color !== color
  ) === undefined
    ? false
    : true;
}

function captureAsKnight(piece, board, color) {
  const moves = knightMoves(piece, board);
  return moves.find(
    (current) => current.isKnight() && current.color !== color
  ) === undefined
    ? false
    : true;
}

function captureAsQueenOrBishop(piece, board, color) {
  const moves = bishopMoves(piece, board);
  return moves.find(
    (current) =>
      (current.isBishop() || current.isQueen()) && current.color !== color
  ) === undefined
    ? false
    : true;
}

function captureAsQueenOrRook(piece, board, color) {
  const moves = rookMoves(piece, board);
  return moves.find(
    (current) =>
      (current.isRook() || current.isQueen()) && current.color !== color
  ) === undefined
    ? false
    : true;
}
