import { ROUTE_CHESS_SERVER } from "./routes";

const RECONNECT_TIMEOUT = 10 * 1000;

const ports = [];
let socket = createSocket();
let reconnectTimeout = -1;

// eslint-disable-next-line no-undef
// eslint-disable-next-line no-restricted-globals
self.addEventListener("connect", e => {
    const port = e.ports[0];
    ports.push(port);

    port.addEventListener("message", e => {
        if (e.data === "close") {
            clearTimeout(reconnectTimeout);
            socket.removeEventListener("close", closeHandler);
            socket.close();
            const index = ports.findIndex(p => p === port);
            if (index > -1) {
                ports.splice(index, 1);
            }
        }
        else if (e.data === "socketstate") {
            port.postMessage({ type: "socketstate", data: socket.readyState });
        }
        else {
            socket.send(JSON.stringify(e.data));
        }
    });

    if (socket.readyState === 3) {
        socket = createSocket();
        socket.addEventListener("open", createSocketOpenCallBack(port, socket));
    }

    socket.addEventListener("message", createSocketMessageCallback(port));

    port.start();
    createSocketOpenCallBack(port, socket)();
});

function createSocket() {
    // eslint-disable-next-line no-restricted-globals
    const protocol = self.location.protocol === "https:" ? "wss:" : "ws:";
    const socket = new WebSocket(`${protocol}//${ROUTE_CHESS_SERVER}`);
    socket.addEventListener("close", closeHandler);
    socket.addEventListener("error", errorHandler);
    return socket;
}

function createSocketOpenCallBack(port, socket) {
    return e => {
        port.postMessage({ type: "socketstate", data: socket.readyState });
    }
}

function createSocketMessageCallback(port) {
    return e => {
        const msg = JSON.parse(e.data);
        port.postMessage(msg);
    }
}

function closeHandler(e) {
    for (const port of ports) {
        port.postMessage({ type: "reconnect", data: null });
    }

    reconnectTimeout = setTimeout(() => {
        socket = createSocket();
        for (const port of ports) {
            socket.addEventListener("message", createSocketMessageCallback(port));
            socket.addEventListener("open", createSocketOpenCallBack(port, socket));
        }
    }, RECONNECT_TIMEOUT);
}

function errorHandler(e) {
    console.error(e);
    socket.close();
}