const EXPIRATION = 60 * 60 * 1000;

export async function getMembers(db, redis, chatroomId) {
    const key = `chatroom:${chatroomId}`;

    try {
        let members = await redis.v4.get(key);
        if (!members) {
            members = await db.query({
                rowsAsArray: true, sql: `
                    SELECT userId
                    FROM chatroom_members
                    WHERE chatroomId = ?
                `}, [chatroomId]);
            members = members.map(c => c[0]);
            await redis.v4.pSetEx(key, EXPIRATION, JSON.stringify(members));
        }
        else {
            members = JSON.parse(members);
        }

        return members;
    }
    catch (err) {
        throw err;
    }
}

export async function removeMember(redis, chatroomId, userId) {
    const key = `chatroom:${chatroomId}`;

    try {
        let members = await redis.v4.get(key);
        if (members) {
            members = JSON.parse(members);
            members = members.filter(member => member !== userId);
            await redis.v4.pSetEx(key, EXPIRATION, JSON.stringify(members));
        }
    }
    catch (err) {
        throw err;
    }
}
