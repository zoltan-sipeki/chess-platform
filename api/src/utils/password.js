import { randomBytes, pbkdf2 } from "crypto";

export const SALT_LENGTH = 64;
const ITERATIONS = 100092;

export function hashPassword(password, salt) {
    salt = salt ?? randomBytes(SALT_LENGTH);
    
    return new Promise((resolve, reject) => {
        pbkdf2(password.normalize("NFC"), salt, ITERATIONS, SALT_LENGTH, "sha3-512", (err, hash) => {
            if (err) {
                reject(err);
            }
            else {
                resolve({ hash , salt });
            }
        });
    });
}

export async function comparePasswords(current, stored) {
    const salt = stored.slice(0, SALT_LENGTH);
    const storedHash = stored.slice(SALT_LENGTH);
    const { hash } = await hashPassword(current, salt);

    return storedHash.equals(hash);
}
