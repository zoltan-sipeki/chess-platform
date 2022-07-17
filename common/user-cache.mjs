const EXPIRATION = 60 * 60 * 1000;

export async function get(db, redis, userId, ...fields) {
    const key = `user:${userId}`;

    let connection = null;
    try {
        let user = await redis.v4.get(key);
        if (!user) {
            connection = await db.getConnection();
            [user] = await connection.query(`
                SELECT id, name, tag, avatar, lastOnline, rankedMMR, unrankedMMR, defaultStatus, status, statusText, matchIdInProgress, isInQueue
                FROM users
                WHERE id = ?
            `, [userId]);

            if (!user) {
                await connection.end();
                return null;
            }

            const friends = await connection.query({
                rowsAsArray: true, sql: `
                SELECT friendId
                FROM friend_list
                WHERE userId = ?
            `}, [userId]);

            const chatrooms = await connection.query({
                rowsAsArray: true, sql: `
                SELECT chatroomId
                FROM chatroom_members
                WHERE userId = ?
            `}, [userId]);

            await connection.end();

            user.friends = friends.map(f => f[0]);
            user.chatrooms = chatrooms.map(c => c[0]);

            await redis.v4.pSetEx(key, EXPIRATION, JSON.stringify(user));
        }
        else {
            user = JSON.parse(user);
        }

        if (fields.length === 0) {
            return null;
        }

        if (fields.length === 1) {
            return user[fields[0]];
        }

        const result = {};
        for (const field of fields) {
            result[field] = user[field];
        }

        return result;
    }
    catch (err) {
        throw err;
    }
    finally {
        if (connection !== null) {
            await connection.end();
        }
    }
}

export async function set(redis, userId, fields) {
    try {
        const key = `user:${userId}`;
        let user = await redis.v4.get(key);
        if (user) {
            user = JSON.parse(user);
            Object.assign(user, fields);
            await redis.v4.pSetEx(key, EXPIRATION, JSON.stringify(user));
        }
    }
    catch (err) {
        throw err;
    }
}

export async function update(db, redis, userId) {
    try {
        const key = `user:${userId}`;
        let user = await redis.v4.get(key);
        if (user == null) {
            return;
        }

        user = JSON.parse(user);
        await db.query(`
            UPDATE users
            SET name = ?, tag = ?, avatar = ?, lastOnline = ?, rankedMMR = ?, unrankedMMR = ?, defaultStatus = ?, status = ?, statusText = ?, matchIdInProgress = ?, isInQueue = ? 
            WHERE id = ?
        `, [user.name, user.tag, user.avatar, new Date(user.lastOnline), user.rankedMMR, user.unrankedMMR, user.defaultStatus, user.status, user.statusText, user.matchIdInProgress, user.isInQueue, user.id]);
    }
    catch (err) {
        throw err;
    }
}

export async function remove(redis, userId) {
    try {
        await redis.v4.del(`user:${userId}`);
    }
    catch (err) {
        throw err;
    }
}

