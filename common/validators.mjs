import * as Constants from "./validator-constants.mjs";

export class InputState {
    constructor(value = "", error = null) {
        this.value = value;
        this.error = error;
    }

    static copy(other) {
        if (!(other instanceof InputState)) {
            throw new Error("Type of the argument must be \"InputState\".")
        }

        return new InputState(other.value, other.error);
    }
}

function isDigit(c) {
    return c >= "0" && c <= "9";
}

function isAlpha(c) {
    return c >= "a" && c <= "z" || c >= "A" && c <= "Z";
}

function isAlphaNum(c) {
    return isAlpha(c) || isDigit(c);
}

function removeSpace(str) {
    let result = "";

    let i = 0;
    for (; i < str.length && str[i] === " "; ++i);

    let j = str.length - 1;
    for (; j >= 0 && str[j] === " "; --j);

    for (; i <= j; ++i) {
        if (str[i] === " " && str[i - 1] === " ")
            continue;

        result += str[i];
    }

    return result;
}

export function validateProfileName(profileName) {
    if (profileName.length === 0) {
        return Constants.ERROR_PROFILE_NAME_EMPTY;
    }

    if (profileName.length > Constants.PROFILE_NAME_MAX_LENGTH) {
        return Constants.ERROR_PROFILE_NAME_TOO_LONG;
    }

    if (profileName[0] === "-" || profileName[profileName.length - 1] === "-") {
        return Constants.ERROR_PROFILE_NAME_INVALID;
    }

    if (isDigit(profileName[0])) {
        return Constants.ERROR_PROFILE_NAME_INVALID;
    }

    for (let i = 0; i < profileName.length; ++i) {
        if (i > 0 && profileName[i] === "-") {
            if (profileName[i - 1] === "-") {
                return Constants.ERROR_PROFILE_NAME_INVALID;
            }
            continue;
        }

        if (!isAlphaNum(profileName[i])) {
            return Constants.ERROR_PROFILE_NAME_INVALID;
        }
    }

    return Constants.NO_ERROR;
}

export function validateEmail(email) {
    if (email.length === 0) {
        return Constants.ERROR_EMAIL_ADDRESS_EMPTY;
    }

    const REGEX = /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/i;

    if (email.match(REGEX) == null) {
        return Constants.ERROR_EMAIL_ADDRESS_INVALID;
    }

    if (email.length > Constants.EMAIL_ADDRESS_MAX_LENGTH) {
        return Constants.ERROR_EMAIL_TOO_LONG;
    }

    return Constants.NO_ERROR;
}

export function validatePassword(password) {
    if (password.length === 0) {
        return Constants.ERROR_PASSWORD_EMPTY;
    }

    if (password.length < Constants.PASSWORD_MIN_LENGTH) {
        return Constants.ERROR_PASSWORD_INVALID;
    }

    let ucase = 0;
    let lcase = 0;
    let digits = 0;

    for (const c of password) {
        const alpha = isAlpha(c);

        ucase += alpha && c === c.toUpperCase();
        lcase += alpha && c === c.toLowerCase();
        digits += isDigit(c);
    }

    if (ucase < 2 || lcase < 2 || digits < 2) {
        return Constants.ERROR_PASSWORD_INVALID;
    }

    return Constants.NO_ERROR;
}

export function verifyPassword(password, secondPassword) {
    if (secondPassword.length === 0) {
        return Constants.ERROR_PASSWORD_NOT_VERIFIED;
    }

    if (secondPassword !== password) {
        return Constants.ERROR_PASSWORD_NO_MATCH
    }

    return Constants.NO_ERROR;
}