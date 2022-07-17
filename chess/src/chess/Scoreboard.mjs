import { PIECE_COLOR } from "./pieces/piece-constants.mjs";

class Scoreboard {
    constructor() {
        this.winner = "";
        this.by = "";
        this.scores = {
            [PIECE_COLOR.WHITE]: -1,
            [PIECE_COLOR.BLACK]: -1,
        };
        this.mmrChanges = null;
    }
}

export class Win extends Scoreboard {
    constructor(winnerColor, loserColor, by) {
        super();
        this.winner = winnerColor;
        this.by = by;
        this.scores[winnerColor] = 1;
        this.scores[loserColor] = 0;
    }
}

export class Draw extends Scoreboard {
    constructor(by) {
        super();
        this.winner = "Draw";
        this.by = by;
        this.scores[PIECE_COLOR.WHITE] = 0.5;
        this.scores[PIECE_COLOR.BLACK] = 0.5;
    }
}
