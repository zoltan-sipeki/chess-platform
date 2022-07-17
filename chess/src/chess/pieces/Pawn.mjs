import { Piece } from "./Piece.mjs";
import { ROWS, COLS } from "../chessboard/chessboard-constants.mjs";
import { pawnCapturingMoves } from "./pawn-strategy.mjs";
import { EnPassantMove, Move, PromotionMove } from "../Move.mjs";
import { Position } from "../Position.mjs";
import { PIECE_TYPE } from "./piece-constants.mjs";

export class Pawn extends Piece {
  constructor(row, col, color) {
    super(row, col, color, PIECE_TYPE.PAWN);
  }

  determineMove(board, toRow, toCol) {
    const row = this.row;
    const col = this.col;

    const enPassant = this.enPassant(board);
    if (enPassant && enPassant.row === toRow && enPassant.col === toCol) {
      return new EnPassantMove(
        this,
        new Position(row, col),
        new Position(toRow, toCol)
      );
    }

    let move =
      Move.normalMove(this, board, toRow, toCol) ??
      Move.capturingMove(this, board, toRow, toCol);

    if (toRow === 0 || toRow === 7) {
      move = new PromotionMove(move);
    }

    return move;
  }

  enPassant(board) {
    const row = this.row;
    const col = this.col;

    const white = this.isWhite();
    const dir = white ? -1 : 1;
    const enpassantRow = white ? 3 : 4;

    if (row === enpassantRow) {
      if (col + 1 < COLS) {
        const right = board.getPiece(row, col + 1);
        if (
          right.isPawn() &&
          right.color !== this.color &&
          board.turn - right.lastTurn === 1 &&
          right.moves === 1
        ) {
          return board.getPiece(row + dir, col + 1);
        }
      }

      if (col - 1 >= 0) {
        const left = board.getPiece(row, col - 1);
        if (
          left.isPawn() &&
          left.color !== this.color &&
          board.turn - left.lastTurn === 1 &&
          left.moves === 1
        ) {
          return board.getPiece(row + dir, col - 1);
        }
      }
    }

    return null;
  }

  getMoves(board) {
    const row = this.row;
    const col = this.col;

    const dir = this.isWhite() ? -1 : 1;
    const moves = pawnCapturingMoves(this, board);

    if (this.lastTurn > -1) {
      const targetRow = row + dir;
      if (targetRow >= 0 && targetRow < ROWS) {
        const piece = board.getPiece(targetRow, col);
        if (piece.isNull()) {
          moves.push(piece);
        }
      }
    } else {
      const end = row + dir * 3;
      for (let i = row + dir; i !== end; i += dir) {
        if (i < 0 || i >= ROWS) {
          break;
        }
        const piece = board.getPiece(i, col);
        if (piece.isNull()) {
          moves.push(piece);
        } else {
          break;
        }
      }
    }

    const enPassant = this.enPassant(board);
    if (enPassant) {
      moves.push(enPassant);
    }
    return moves;
  }
}
