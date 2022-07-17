import { ROWS, COLS } from "../chessboard/chessboard-constants.mjs";
import { Piece } from "./Piece.mjs";
import { underAttack } from "./check-strategy.mjs";
import { KingSideCastlingMove, QueenSideCastlingMove, Move } from "../Move.mjs";
import { Position } from "../Position.mjs";
import { PIECE_TYPE } from "./piece-constants.mjs";

export class King extends Piece {
  constructor(row, col, color) {
    super(row, col, color, PIECE_TYPE.KING);
  }

  determineMove(board, toRow, toCol) {
    const row = this.row;
    const col = this.col;

    if (toCol - col === 2) {
      return new KingSideCastlingMove(
        this,
        new Position(row, col),
        new Position(toRow, toCol)
      );
    }

    if (toCol - col === -2) {
      return new QueenSideCastlingMove(
        this,
        new Position(row, col),
        new Position(toRow, toCol)
      );
    }

    let move = Move.normalMove(this, board, toRow, toCol);
    if (move) {
      return move;
    }

    return Move.capturingMove(this, board, toRow, toCol);
  }

  getMoves(board) {
    const row = this.row;
    const col = this.col;

    const moves = [];

    for (let i = row - 1; i <= row + 1; ++i) {
      for (let j = col - 1; j <= col + 1; ++j) {
        if (
          i < 0 ||
          i >= ROWS ||
          j < 0 ||
          j >= COLS ||
          (i === row && j === col)
        ) {
          continue;
        }
        moves.push(board.getPiece(i, j));
      }
    }

    if (this.canCastleKingSide(board)) {
      moves.push(board.getPiece(this.row, this.col + 2));
    }

    if (this.canCastleQueenSide(board)) {
      moves.push(board.getPiece(this.row, this.col - 2));
    }

    return moves;
  }

  isInCheck(board) {
    return underAttack(this, board, this.color);
  }

  canCastleKingSide(board) {
    if (this.lastTurn > -1) {
      return false;
    }

    const row = this.row;
    const col = this.col;

    const rightRook = board.getPiece(row, 7);
    if (rightRook.lastTurn > -1 || !rightRook.isRook()) {
      return false;
    }

    for (let j = col + 1; j < COLS - 1; ++j) {
      if (!board.getPiece(row, j).isNull()) {
        return false;
      }
    }

    return (
      !underAttack(board.getPiece(row, col + 1), board, this.color) &&
      !underAttack(board.getPiece(row, col + 2), board, this.color)
    );
  }

  canCastleQueenSide(board) {
    if (this.lastTurn > -1) {
      return false;
    }

    const row = this.row;
    const col = this.col;

    const leftRook = board.getPiece(row, 0);
    if (leftRook.lastTurn > -1 || !leftRook.isRook()) {
      return false;
    }

    for (let j = col - 1; j > 0; --j) {
      if (!board.getPiece(row, j).isNull()) {
        return false;
      }
    }

    return (
      !underAttack(board.getPiece(row, col - 1), board, this.color) &&
      !underAttack(board.getPiece(row, col - 2), board, this.color)
    );
  }
}
