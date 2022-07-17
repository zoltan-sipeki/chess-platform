import * as STATUS from "../common/user-statuses.mjs";

export const STATUS_COLOR = Object.freeze({
    [STATUS.US_ONLINE] : "green",
    [STATUS.US_OFFLINE] : "dimgrey",
    [STATUS.US_AWAY] : "orange",
    [STATUS.US_IN_GAME] : "green",
    [STATUS.US_LOOKING_FOR_MATCH]: "green"
});