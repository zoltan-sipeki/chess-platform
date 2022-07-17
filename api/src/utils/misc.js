export function checkRequestFormat(object, ...fields) {
    const missing = [];
    for (let i = 0; i < fields.length; ++i) {
        if (!(fields[i] in object))
            missing.push(fields[i]);
    }

    return missing;
}

export async function addUserDataToQueryResult(connection, result, fieldName) {
    if (result.length === 0) {
        return result;
    }

    let whereClause = "";
    for (let i = 0; i < result.length; ++i) {
        whereClause += "id = ?"
        if (i + 1 < result.length) {
            whereClause += " OR ";
        }
    }

    const users = await connection.query(`
        SELECT id, name, tag, avatar
        FROM users
        WHERE ${whereClause}
    `, result.map(item => item[fieldName]));;

    for (const item of result) {
        item[fieldName] = users.find(user => user.id === item[fieldName]) ?? null;
    }

    return result;
}