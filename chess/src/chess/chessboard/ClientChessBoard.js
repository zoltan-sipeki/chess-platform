
import { ChessBoard } from "./ChessBoard.mjs";
import { PIECE_IMGS } from "../pieces/piece-imgs.mjs";

export class ClientChessBoard extends ChessBoard {
  getPieceImgs() {
    return this.board.map(piece => PIECE_IMGS[piece.color][piece.type]);
  }

  getTurnColor() {
    return ClientChessBoard.TURNS[Number(this.whitesTurn)];
  }

  getColor(bool) {
    return ClientChessBoard.TURNS[Number(bool)];
  }

  addMove(move) {
    this.moves = [...this.moves, move];
  }

  popMove() {
    this.moves.pop();
    this.moves = [...this.moves];
  }
}
