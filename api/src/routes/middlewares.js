import { checkRequestFormat } from "../utils/misc.js";
import { validatePassword, verifyPassword } from "../../../common/validators.mjs";
import { comparePasswords } from "../utils/password.js";
import { redis } from "../redis.js";
import { RS_API_MESSAGES, RS_USER_DELETED } from "../../../common/redis-sub-constants.mjs";
import Database from "../database.js";
import * as UserCache from "../utils/user-cache.js";
import * as SSE from "../utils/sse-messages-types.mjs";

export function isAuthenticated(req, res, next) {
    if (!req.session.userID) {
        res.sendStatus(401);
    }
    else {
        next();
    }
}

export function validateRequestBody(...fields) {
    return (req, res, next) => {
        const missingFields = checkRequestFormat(req.body, ...fields);

        if (missingFields.length === 0) {
            next();
        }
        else {
            res.status(400).json({ error: `Field(s) missing from request body: ${missingFields.join(", ")}`});
        }
    };
}

export function validateQueryString(...fields) {
    return (req, res, next) => {
        const missingParams = checkRequestFormat(req.query, ...fields);
        
        if (missingParams.length === 0) {
            next();
        }
        else {
            res.status(400).json({ error: `Missing query param(s): ${missingParams.join(", ")}` });
        }
    };
}

export async function validateCurrentPassword(req, res, next) {
    const { currentPassword } = req.body;

    try {
        const [user] = await Database.query("SELECT password FROM users WHERE id = ?", [req.session.userID]);
        if (!await comparePasswords(currentPassword, user.password)) {
            res.status(401).json({ error: "Invalid current password. " });
            return;
        }
        next();
    }
    catch (err) {
        next(err);
    }
}

export function validatePasswords(req, res, next) {
    const { password, secondPassword } = req.body;
    const errorResponse = {
        password: {},
        secondPassword: {}
    };

    errorResponse.password.error = validatePassword(password);
    errorResponse.secondPassword.error = verifyPassword(password, secondPassword);

    for (const input in errorResponse) {
        if (errorResponse[input].error) {
            res.status(400).json(errorResponse);
            return;
        }
    }
    next();
}

export async function logOutUser(req, res, next) {
    const key = `active-sessions:${req.session.userID}`;
    try {
        if (res.locals.userDeleted) {
            const activeSessions = await redis.v4.lRange(key, 0, -1);
            const userId = req.session.userID;
            await Promise.all([
                Promise.all(activeSessions.map(session => redis.v4.del(`sess:${session}`))),
                redis.v4.publish(RS_API_MESSAGES, JSON.stringify({ type: RS_USER_DELETED, data: { userId }}))
            ]);
        }
        else {
            req.session.destroy();
        }

        res.clearCookie("loggedIn");
        next();
    }
    catch (err) {
        next(err);
    }
    
}

export async function notifyFriendsOfUpdate(req, res, next) {
    try {
        const userId = req.session.userID;
        const { changes } = res.locals;
        const { sse } = req.app.locals;
        const friends = await UserCache.get(userId, "friends");
        await UserCache.set(userId, changes);

        for (const friendId of friends) {
            const friend = sse.get(friendId);
            if (friend != null) {
                friend.write(`data: ${JSON.stringify({ type: SSE.FRIEND_UPDATE, data: { friendId: userId, changes } })}\n\n`)
            }
        }

        next();
    }
    catch (err) {
        next(err);
    }
}

export async function notifyFriendsOfRemoval(req, res, next) {
    const senderId = req.session.userID;
    const { friends } = res.locals;
    const { sse } = req.app.locals;

    try {
        if (friends != null) {
            for (const friendId of friends) {
                await Promise.all([
                    UserCache.removeFriend(senderId, friendId),
                    UserCache.removeFriend(friendId, senderId)
                ]);
        
                const friend = sse.get(friendId);
                if (friend != null) {
                    friend.write(`data: ${JSON.stringify({ type: SSE.REMOVE_FRIEND, data: { friendId: senderId } })}\n\n`);
                }
            }
        }
        next();
    }
    catch (err) {
        next(err);
    }
}