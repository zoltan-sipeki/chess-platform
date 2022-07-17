const FRONT_END_URL = `http://${process.env.FRONT_END_HOST}:${process.env.FRONT_END_PORT}`;
const STATIC_URL = `http://${process.env.STATIC_HOST}:${process.env.STATIC_PORT}`;

export async function writeFile(path, mimeType, content, frontend = false) {
    try {
        const url = frontend ? FRONT_END_URL : STATIC_URL;
        const response = await fetch(`${url}${path}`, {
            method: "PUT",
            headers: {
                "Content-Type": mimeType
            },
            body: content
        });

        if (!response.ok) {
            const error = new Error(await response.text());
            error.code = response.status;
            throw error;
        }
    }
    catch (err) {
        throw err;
    }
}

export async function readFile(path, binary = false, frontend = false) {
    try {
        const url = frontend ? FRONT_END_URL : STATIC_URL;
        const response = await fetch(`${url}${path}`);
        if (response.ok) {
            if (binary) {
                return await response.arrayBuffer();
            }

            return await response.text();
        }

        const error = new Error(await response.text());
        error.code = response.status;
        throw error;
    }
    catch (err) {
        throw err;
    }
}

export async function removeFile(path, frontend = false) {
    try {
        const url = frontend ? FRONT_END_URL : STATIC_URL;
        const response = await fetch(`${url}${path}`, {
            method: "DELETE"
        });
    
        if (!response.ok) {
            const error = new Error(await response.text());
            error.code = response.status;
            throw error;
        }
    }
    catch (err) {
        throw err;
    }
}