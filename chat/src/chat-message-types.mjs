export const FRIEND_REQUEST = "friend_request";
export const FRIEND_REQUEST_ACCEPTED = "friend_request_accepted";
export const UNFRIEND = "unfriend";
export const S_STATUS_CHANGE = "s_status_change";
export const C_STATUS_CHANGE = "c_status_change";
export const C_MESSAGE = "c_message";   // data: { chatroomId, senderId }
export const S_MESSAGE = "s_message";   // data: { message: { id, text, date, sender}, chatroomId }}
export const C_TYPING = "c_typing";     // data: { chatroomId }
export const S_TYPING = "s_typing";     // data: { name, chatroomId }
export const C_MESSAGE_SEEN = "c_message_seen";
export const NOTIFICATION_SEEN = "notification_seen";
export const NOTIFICATION_REMOVED = "notification_removed";