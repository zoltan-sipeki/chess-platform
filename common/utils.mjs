import FS from "fs/promises";
import Path from "path";
import URL from "url";

export function mypath(metaUrl, relativePath) {
    return Path.resolve(Path.dirname(URL.fileURLToPath(metaUrl)), relativePath);
}

export async function writeFile(folderPath, fileName, content) {
    try {
        await FS.mkdir(folderPath, { recursive: true });
        await FS.writeFile(`${folderPath}/${fileName}`, content);
    }
    catch (err) {
        if (err.name === "EEXIST") {
            await FS.writeFile(`${folderPath}/${fileName}`, content);
        }
        else {
            throw err;
        }
    }
}