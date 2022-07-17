export class Interval {
    static SIZE = 16;

    static compare(a, b) {
        if (a.high < b.low) {
            return -1;
        }
        if (a.low > b.high) {
            return 1;
        }
        return 0;
    }

    constructor(mmr) {
        this.low = mmr - Interval.SIZE;
        this.high = mmr + Interval.SIZE;
        this.expansionRate = 1;
        this.timer = -1;
    }

    expand() {
        const newSize = Interval.SIZE * ++this.expansionRate;
        this.low -= newSize;
        this.high += newSize;
    }

    clearTimer() {
        clearTimeout(this.timer);
        this.timer = -1;
    }

    setTimer(callback, timeOut) {
        this.timer = setTimeout(callback, timeOut);
    }
}