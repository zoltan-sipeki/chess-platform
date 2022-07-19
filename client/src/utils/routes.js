// -- API ROUTES --
export const ROUTE_FORGOT_PASSWORD =                                        "/api/auth/forgot-password";
export const ROUTE_SIGN_IN =                                                "/api/auth/sign-in";
export const ROUTE_SIGN_UP =                                                "/api/auth/sign-up";
export const ROUTE_SIGN_OUT =                                               "/api/community/sign-out";

export const ROUTE_EVENTS =                                                 "/api/community/events";

export const ROUTE_MY_ACCOUNT =                                             "/api/community/myaccount/";

export const ROUTE_UPLOAD_AVATAR =                                          "/api/community/myaccount/settings/avatar/upload";
export const ROUTE_REMOVE_AVATAR =                                          "/api/community/myaccount/settings/avatar/remove";
export const ROUTE_CHANGE_EMAIL =                                           "/api/community/myaccount/settings/email";
export const ROUTE_CHANGE_PASSWORD =                                        "/api/community/myaccount/settings/password";
export const ROUTE_CHANGE_PROFILE_NAME =                                    "/api/community/myaccount/settings/name";
export const ROUTE_CHANGE_PROFILE_PAGE =                                    "/api/community/myaccount/settings/profile";
export const ROUTE_DELETE_ACCOUNT =                                         "/api/community/myaccount/settings/delete";

export const ROUTE_ACCEPT_FRIEND_REQUEST = id =>                            `/api/community/myaccount/friend-requests/${id}/accept`;
export const ROUTE_REJECT_FRIEND_REQUEST = id =>                            `/api/community/myaccount/friend-requests/${id}/reject`;

export const ROUTE_SEE_NOTIFICATION = notificationId =>                     `/api/community/myaccount/notifications/${notificationId}/see`;
export const ROUTE_REMOVE_NOTIFICATION = notificationId =>                  `/api/community/myaccount/notifications/${notificationId}/remove`;

export const ROUTE_CHAT_PARTNER = tabId =>                                  `/api/community/myaccount/messages/${tabId}/tab`;
export const ROUTE_MESSAGES = (chatroomId, page, pageSize) =>               `/api/community/myaccount/messages/${chatroomId}?page=${page}&size=${pageSize}`;

export const ROUTE_SEARCH_USER = name =>                                    `/api/community/users/search?name=${name}`;
export const ROUTE_SEARCH_PAGE = (name, limit) =>                           `/api/community/users/search?name=${name}&limit=${limit}`;
export const ROUTE_USER_FRIEND_REQUESTS = userId =>                         `/api/community/users/${userId}/friend-requests`;
export const ROUTE_USER_FRIENDS = userId =>                                 `/api/community/users/${userId}/friends`;
export const ROUTE_USER_MATCHES = userId =>                                 `/api/community/users/${userId}/matches`;
export const ROUTE_USER_PROFILE = (userId, friendsLimit, matchesLimit) =>   `/api/community/users/${userId}?friends=${friendsLimit}&matches=${matchesLimit}`;
export const ROUTE_UNFRIEND = friendId =>                                   `/api/community/users/${friendId}/unfriend`;

export const ROUTE_CHESS_MATCH_REPLAY = matchId =>                          `/api/chess/matches/${matchId}/replay`;
export const ROUTE_LEADERBOARD =                                            "/api/chess/leaderboard";

export const ROUTE_PASSWORD = (pathname, search) =>                         `/api${pathname}${search}`;

// -- WEBSOCKET ROUTES --
export const ROUTE_CHAT_SERVER =                                            "ws://load-balancer-1791276754.eu-central-1.elb.amazonaws.com/chat";
export const ROUTE_CHESS_SERVER =                                           "ws://load-balancer-1791276754.eu-central-1.elb.amazonaws.com/chess";

// -- CHESS ROUTES --
export const ROUTE_CHESS_MATCH = matchId =>                                 `/chess/matches/${matchId}`;

// -- LINKS --
export const LINK_HOME_PAGE =                                               "/";
export const LINK_SIGN_IN =                                                 "/auth/sign-in";
export const LINK_SIGN_UP =                                                 "/auth/sign-up";
export const LINK_COMMUNITY =                                               "/community";
export const LINK_LEADERBOARD =                                             "/community/leaderboard";
export const LINK_SETTINGS_PAGE =                                           "/community/myaccount/settings";
export const LINK_CHAT_WINDOW = chatroomId =>                               `/community/myaccount/messages/${chatroomId}`;
export const LINK_SEARCH_PAGE = name =>                                     `/community/users/search?name=${name}`;
export const LINK_MATCHES_PAGE = userId =>                                  `/community/users/${userId}/matches`;
export const LINK_FRIENDS_PAGE = userId =>                                  `/community/users/${userId}/friends`;
export const LINK_PROFILE_PAGE = userId =>                                  `/community/users/${userId}`;
export const LINK_MATCH_REPLAY = matchId =>                                 `/matches/${matchId}/replay`;
export const LINK_MATCH = matchId =>                                        `/matches/${matchId}`;

