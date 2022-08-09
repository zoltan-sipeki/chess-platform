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

    const whereClause = result.map(item => "?").join(", ");
    const users = await connection.query(`
        SELECT id, name, tag, avatar
        FROM users
        WHERE id IN (${whereClause})
    `, result.map(item => item[fieldName]));;

    for (const item of result) {
        item[fieldName] = users.find(user => user.id === item[fieldName]) ?? null;
    }

    return result;
}