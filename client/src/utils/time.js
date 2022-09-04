const NOW = Object.freeze({
    ms: 1,
    text: "now"
});

const SECOND = Object.freeze({
    ms: NOW.ms * 1000,
    text: "second"
});

export const MINUTE = Object.freeze({
    ms: SECOND.ms * 60,
    text: "minute"
});

const HOUR = Object.freeze({
    ms: MINUTE.ms * 60,
    text: "hour"
});

export const DAY = Object.freeze({
    ms: HOUR.ms * 24,
    text: "day"
});

const WEEK = Object.freeze({
    ms: DAY.ms * 7,
    text: "week"
});

const MONTH = Object.freeze({
    ms: DAY.ms * 30,
    text: "month"
});

const YEAR = Object.freeze({
    ms: DAY.ms * 365,
    text: "year"
});

const times = [YEAR, MONTH, WEEK, DAY, HOUR, MINUTE, SECOND];

export function toAgoString(pastTime) {
    const now = new Date();
    let diff = now.getTime() - pastTime.getTime();

    if (diff < 0) {
        diff = 0;
    }

    for (const time of times) {
        const quotient = Math.floor(diff / time.ms);

        if (quotient === 0) {
            continue;
        }

        if (quotient === 1) {
            return `1 ${time.text} ago`;
        }

        return `${quotient} ${time.text}s ago`;
    }

    return "just now";
}

export function timeElapsedSince(pastTime) {
    const now = new Date();
    let diff = now.getTime() - pastTime.getTime();

    if (diff < 0) {
        diff = 0;
    }

    for (const time of times) {
        const quotient = Math.floor(diff / time.ms);

        if (quotient === 0) {
            continue;
        }

        return { value: quotient, unit: time };
    }

    return { value: 0, unit: NOW };
}

export function stringifyDate(date) {
    const today = new Date();
    const diff = today.setHours(0, 0, 0, 0) - date.setHours(0, 0, 0, 0);

    const quotient = Math.floor(diff / DAY.ms);

    if (quotient === 0) {
        return "Today";
    }

    if (quotient === 1) {
        return "Yesterday";
    }

    return date.toLocaleDateString();
}

export function MSToTimeStamp(ms) {
    const hh = Math.floor(ms / HOUR.ms);
    const mm = Math.floor(ms % HOUR.ms / MINUTE.ms);
    const ss = Math.floor(ms % HOUR.ms % MINUTE.ms / SECOND.ms);

    const mmss = addLeadingZeros(mm) + ":" + addLeadingZeros(ss);
    if (hh === 0) {
        return mmss;
    }

    return addLeadingZeros(hh) + ":" + mmss;

    function addLeadingZeros(number) {
        if (number === 0) return "00";

        return number < 10 ? "0" + number : number.toString();
    }
}
