import { RBTree } from "./RedBlackTree.js";
import { Player } from "./Player.js";
import { Interval } from "./Interval.js";
import { MATCH } from "./Room.js";
import * as MSG from "./chess-message-types.mjs";
import { notifyChatServer } from "./redis.js";
import { RS_ENQUEUED, RS_DEQUEUED } from "../../common/redis-sub-constants.mjs";

const QUEUE_TIMEOUT = 10000;

class MMQueue {
    constructor(onMatchFoundCallback) {
        this.queue = new RBTree(Player.compare);
        this.onMatchFoundCallback = onMatchFoundCallback;
    }

    async enqueue(player) {
        if (player.isInQueue() || player.isInGame()) {
            return;
        }

        await this.onEnqueue(player);
        if (this.insert(player)) {
            notifyChatServer([player], RS_ENQUEUED);
        }
    }

    insert(player) {
        const partner = this.queue.insert(player);
        if (partner != null) {
            this.onMatchFound(player, partner);
            return false;
        }
        
        player.setQueueTimeout(
            () => this.expandSearch(player),
            QUEUE_TIMEOUT
        );

        return true;
    }

    dequeue(player) {
        player.clearQueueTimeout();
        this.queue.remove(player);
        player.queue = null;
        player.searchInterval = null;
        notifyChatServer([player], RS_DEQUEUED);
    }

    expandSearch(player) {
        this.queue.remove(player);
        player.expandSearchInterval();
        this.insert(player);
    }

    onMatchFound(player, partner) {
        player.queue = null;
        player.searchInterval = null;
        notifyChatServer([player], RS_DEQUEUED);
        this.dequeue(partner);
    }

    async onEnqueue(player) { }
}

export class RankedMMQueue extends MMQueue {
    constructor(onMatchFoundCallback) {
        super(onMatchFoundCallback);
    }

    onMatchFound(player, partner) {
        super.onMatchFound(player, partner);
        this.onMatchFoundCallback([player, partner], MATCH.RANKED);
    }

    async onEnqueue(player) {
        player.queue = MATCH.RANKED;
        player.searchInterval = new Interval(await player.get("rankedMMR")); 
        player.send({ type: MSG.S_QUEUE, data: { type: "Ranked" } });
    }
}

export class UnrankedMMQueue extends MMQueue {
    constructor(onMatchFoundCallback) {
        super(onMatchFoundCallback);
    }

    onMatchFound(player, partner) {
        super.onMatchFound(player, partner);
        this.onMatchFoundCallback([player, partner], MATCH.UNRANKED);
    }

    async onEnqueue(player) {
        player.queue = MATCH.UNRANKED;
        player.searchInterval = new Interval(await player.get("unrankedMMR")); 
        player.send({ type: MSG.S_QUEUE, data: { type: "Unranked" } });
    }
}
