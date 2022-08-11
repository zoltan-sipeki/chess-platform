import Database from "../database.js";

const LOWEST_TAG = 1000;
const HIGHEST_TAG = 9999;
const ALL_TAGS = getAllTagsArray();

export async function generateTag(profileName) {
    const takenTags = await Database.query({
        rowsAsArray: true,
        sql: `
            SELECT tag
            FROM users
            WHERE name = ?
        `
    }, [profileName]);

    let tags = new Set(ALL_TAGS);

    for (const tag of takenTags) {
        tags.delete(tag);
    }

    if (tags.size === 0) {
        return -1;
    }

    tags = [...tags.values()];
    const index = Math.floor(Math.random() * tags.length); 

    return tags[index];
}

function getAllTagsArray() {
    const result = [];
    for (let i = LOWEST_TAG; i <= HIGHEST_TAG; ++i) {
        result.push(i);
    }
    return result;
}
