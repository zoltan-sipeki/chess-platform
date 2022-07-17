import { emojis } from "./emojis";

const keys = Object.keys(emojis);
const escapedKeys = [];
for (let key of keys) {
    key = key.replace(/[[\]\\^$.|?*+(){}]/g, (match) => `\\${match}`);
    escapedKeys.push(key);
}

const regexp = new RegExp(escapedKeys.join("|"), "g");

export function replaceEmojis(text) {
    let pos = -1;
    let replacement = "";
    const newText = text.replace(regexp, (match, offset) => {
        pos = offset;
        replacement = emojis[match];
        return replacement;
    });

    return { newText, replacement, pos };
}