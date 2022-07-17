// client messages
export const C_QUEUE = "c_queue";                   // { data: { type: "Ranked" | "Unranked" }}
export const C_EXIT_QUEUE = "c_exit_queue";         // { data: null }
export const C_READY = "c_ready";                   // { data: null }
export const C_DECLINE = "c_decline";               // { data: null }
export const C_LOAD = "c_load";                     // { data: null }
export const C_INVITE = "c_invite";                 // { data: { inviteeId }}
export const C_MOVE = "c_move";                     // { data: { from: { row, col }, to: { row, col } }}
export const C_PROMOTE = "c_promote";               // { data: { pieceType }}
export const C_RESIGN = "c_resign";                 // { data: null }

// server messages
export const S_QUEUE = "s_queue";                   // { data: { type: "Ranked" | "Unranked" }}
export const S_EXIT_QUEUE = "s_exit_queue";         // { data: null }
export const S_READY = "s_ready";                   // { data: null }
export const S_DECLINE = "s_decline";               // { data: { playerId }}
export const S_INVITE = "s_invite";                 // { data: { roomId, inviter: { id, name, tag, avatar }}}
export const S_INVITE_SUCCESS = "s_invite_success"; // { data: { roomId, invitee: { id, name, tag, avatar }}}
export const S_GAME_READY = "s_game_ready";         // { data: { roomId }}
export const S_LOAD_ERROR = "s_load_error";         // { data: { players: [id, id] }}
export const S_READY_ERROR = "s_ready_error";       // { data: { players: [id, id] }}
export const S_DISCONNECT = "s_disconnect";         // { data: { player: { id, name, tag, avatar }}}

export const S_START_GAME = "s_start_game";         // { data: { color, nextTurn }}
export const S_MOVE = "s_move";                     // { data: MoveResponse }
export const S_FLAG_FALL = "s_flag_fall";           // { data: MoveResponse }
export const S_RESIGN = "s_resign";                 // { data: MoveResponse }
export const S_REPLAY_READY = "s_replay_ready";     // data: { replayId }
export const S_GAME_STARTED = "s_game_started";     // data: { matchId }
export const S_GAME_ENDED = "s_game_ended";         // data: { matchId }

