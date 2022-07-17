export function getCookie(name) {
    const cookie = document.cookie.split("; ").map((token) => token.split("=")).find((cookie) => cookie[0] === name);
    return cookie === undefined ? null : cookie[1];
}

export function createChessSocketWorker() {
    return new SharedWorker(new URL("./chess-socket-worker.js", import.meta.url));
}

export function createChatSocketWorker() {
    return new SharedWorker(new URL("./chat-socket-worker.js", import.meta.url));
}