import Crypto from "crypto";

const CIPHER = "aes-128-cbc";
const IV_SIZE = 16;
const INPUT_ENCODING ="utf8";
const OUTPUT_ENCODING = "base64";

const secretKey = Buffer.from(process.env.AES128_KEY, "base64");

export function AES128Encrypt(data) {
    const iv = Crypto.randomBytes(IV_SIZE);
    const cipher = Crypto.createCipheriv(CIPHER, secretKey, iv);
    const cipherText = Buffer.concat([cipher.update(data, INPUT_ENCODING), cipher.final()]);

    return Buffer.concat([iv, cipherText]).toString(OUTPUT_ENCODING);
}

export function AES128Decrypt(data) {
    const dataBinary = Buffer.from(data, OUTPUT_ENCODING);
    const iv = dataBinary.slice(0, IV_SIZE);
    const cipherText = dataBinary.slice(IV_SIZE);
    const decipher = Crypto.createDecipheriv(CIPHER, secretKey, iv);
    const plainText = decipher.update(cipherText) + decipher.final();

    return plainText.toString(INPUT_ENCODING);
}