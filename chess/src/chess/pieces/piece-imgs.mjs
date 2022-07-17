import ImgBlackBishop from "./imgs/black-bishop.svg";
import ImgWhiteBishop from "./imgs/white-bishop.svg";
import ImgWhiteKnight from "./imgs/white-knight.svg";
import ImgBlackKnight from "./imgs/black-knight.svg";
import ImgWhiteRook from "./imgs/white-rook.svg";
import ImgBlackRook from "./imgs/black-rook.svg";
import ImgWhiteQueen from "./imgs/white-queen.svg";
import ImgBlackQueen from "./imgs/black-queen.svg";
import ImgWhiteKing from "./imgs/white-king.svg";
import ImgBlackKing from "./imgs/black-king.svg";
import ImgWhitePawn from "./imgs/white-pawn.svg";
import ImgBlackPawn from "./imgs/black-pawn.svg";
import ImgNullPiece from "./imgs/null-piece.png";
import { PIECE_COLOR, PIECE_TYPE } from "./piece-constants.mjs";

export const PIECE_IMGS = {
  [PIECE_COLOR.WHITE]: {
    [PIECE_TYPE.BISHOP]: ImgWhiteBishop,
    [PIECE_TYPE.KNIGHT]: ImgWhiteKnight,
    [PIECE_TYPE.KING]: ImgWhiteKing,
    [PIECE_TYPE.PAWN]: ImgWhitePawn,
    [PIECE_TYPE.QUEEN]: ImgWhiteQueen,
    [PIECE_TYPE.ROOK]: ImgWhiteRook
  },
  [PIECE_COLOR.BLACK]: {
    [PIECE_TYPE.BISHOP]: ImgBlackBishop,
    [PIECE_TYPE.KNIGHT]: ImgBlackKnight,
    [PIECE_TYPE.KING]: ImgBlackKing,
    [PIECE_TYPE.PAWN]: ImgBlackPawn,
    [PIECE_TYPE.QUEEN]: ImgBlackQueen,
    [PIECE_TYPE.ROOK]: ImgBlackRook
  },
  [PIECE_COLOR.NONE]: {
    [PIECE_TYPE.NONE]: ImgNullPiece
  }
};
