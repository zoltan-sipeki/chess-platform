import FS from "fs/promises";
import { mypath } from "../../../common/utils.mjs";
import { writeFile } from "../../../common/utils.mjs";

const PROFILE_NAMES_FOLDER = mypath(import.meta.url, "../../../data/profile-names");

export async function hasTags(profileName) {
    const path = `${PROFILE_NAMES_FOLDER}/${profileName.toLowerCase()}.json`;
    let content = null;

    try {
        content = await FS.readFile(path, { encoding: "utf8" });
        content = JSON.parse(content);

        return content.tags.length > 0;
    }
    catch (err) {
        if (err.code === "ENOENT") {
            return true;
        }
        
        throw err;    
    }
}

export async function generateTag(profileName) {
    const fileName = `${profileName.toLowerCase()}.json`;
    const path = `${PROFILE_NAMES_FOLDER}/${fileName}`;
    let content = null;
    
    try {
        content = await FS.readFile(path, { encoding: "utf8" });
        content = JSON.parse(content);
    }
    catch (err) {
        if (err.code === "ENOENT") {
            content = generateNumbers();
        }
        else {
            throw err;
        }
    }
    
    if (content.tags.length === 0) {
        return -1;
    }
    
    const tag = pickNumber(content.tags);
    
    await writeFile(PROFILE_NAMES_FOLDER, fileName, JSON.stringify(content));
    
    return tag;
}

export async function returnOldTagToPool(profileName, tag) {
    const fileName = `${profileName.toLowerCase()}.json`;
    const path = `${PROFILE_NAMES_FOLDER}/${fileName}`;
    
    try {
        let content = await FS.readFile(path, { encoding: "utf8" });
        content = JSON.parse(content);
        content.tags.push(tag);
        await writeFile(PROFILE_NAMES_FOLDER, fileName, JSON.stringify(content));
    }
    catch (err) {
        throw err;
    }
}

function generateNumbers(group = 1000) {
    const json = {
        tags: []
    }

    const max = group * 10;
    for (let i = group; i < max; ++i) {
        json.tags.push(i);
    }

    return json;
}

function pickNumber(array) {
    const index = Math.floor(Math.random() * array.length);

    const number = array[index];
    const last = array.length - 1;
    array[index] = array[last];
    array[last] = number;

    array.pop();
    return number;
}
