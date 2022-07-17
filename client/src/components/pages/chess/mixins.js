import { COLS } from "../../../common/chess/chessboard/chessboard-constants.mjs";
import { Position } from "../../../common/chess/Position.mjs";

const MOVE_HIGHLIGHT = "rgba(255, 190, 0, 0.5)";
const CHECK_HIGHLIGHT = "rgba(255, 0, 0, 0.8)";

export function animate(move, backward) {
    const { styles, chessboard } = this.state;

    const swaps = move.getSwaps();
    for (const swap of swaps) {
        let from = null;
        let to = null;
        if (backward) {
            from = swap.to;
            to = swap.from;
        }
        else {
            from = swap.from;
            to = swap.to;
        }
        const fromRect = this.rects[from.row * COLS + from.col];
        const toRect = this.rects[to.row * COLS + to.col];

        let style = styles[from.row * COLS + from.col];
        styles[from.row * COLS + from.col] = {
            ...style,
            transition: "transform 0.2s",
            transform: `translate(${Math.floor(
                toRect.x - fromRect.x
            )}px, ${Math.floor(toRect.y - fromRect.y)}px)`
        };
        style = styles[to.row * COLS + to.col];

        document.addEventListener(
            "transitionend",
            (e) => {
                this.setState({
                    imgs: chessboard.getPieceImgs(),
                    styles: styles.map(() => ({}))
                });
            },
            { once: true }
        );
    }
}

export function highlightMove(move, myColor) {
    const { moveHighlights, chessboard } = this.state;
    const swaps = move.getSwaps();
    for (const swap of swaps) {
        const { from, to } = swap;
        moveHighlights[from.row * COLS + from.col] = MOVE_HIGHLIGHT;
        moveHighlights[to.row * COLS + to.col] = MOVE_HIGHLIGHT;
    }

    if (move.isCheck() || move.isCheckmate()) {
        const king = chessboard.getKing(myColor);
        moveHighlights[king.row * COLS + king.col] = CHECK_HIGHLIGHT;
        this.king = new Position(king.row, king.col);
    }

    this.swaps = swaps;
}

export function removeMoveHighlights() {
    const { moveHighlights } = this.state;
    for (const swap of this.swaps) {
        const { from, to } = swap;
        moveHighlights[from.row * COLS + from.col] = "";
        moveHighlights[to.row * COLS + to.col] = "";
    }
    if (this.king !== null) {
        moveHighlights[this.king.row * COLS + this.king.col] = "";
    }

    this.swaps = [];
    this.king = null;
}