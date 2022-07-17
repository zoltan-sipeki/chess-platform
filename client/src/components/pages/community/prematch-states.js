export const SELF = {
    FINDING_MATCH: 1 << 1,
    MODAL_SHOWN: 1 << 2,
    GAME_ACCEPTED: 1 << 3,
    TIMED_OUT: 1 << 4,
    INVITE: 1 << 5
};

export const OPPONENT = {
    READY: 1 << 1,
    TIMED_OUT: 1 << 2,
    DECLINED: 1 << 3,
    DISCONNECTED: 1 << 4
};