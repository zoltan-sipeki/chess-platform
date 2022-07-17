import * as Constants from "../common/validator-constants";

export const PROFILE_NAME_INPUT_HELP_TEXT = `Your profile name must only contain alphanumeric characters or single hyphens. It must not start or end with a hyphen. It must also not start with a digit. It's length must not be longer than ${Constants.PROFILE_NAME_MAX_LENGTH} characters.`;
export const PASSWORD_HELP_TEXT = `Your password must contain a minimum of ${Constants.PASSWORD_MIN_LENGTH} characters, including at least 2 lower-case letters, 2 upper-case letters and 2 digits.`;
export const GENERIC_ERROR = "Some error has occurred. Please try again.";