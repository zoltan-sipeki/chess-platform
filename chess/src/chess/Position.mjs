import { ROWS } from "./chessboard/chessboard-constants.mjs";

export class Position {
  constructor(row, col) {
    this.row = row;
    this.col = col;
  }

  algebraicNotation() {
    const a = "a".charCodeAt(0);
    return `${String.fromCharCode(a + this.col)}${ROWS - this.row}`;
  }
}
