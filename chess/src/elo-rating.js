export function calculateELORating(mmr1, score1, mmr2, score2) {
    const E1 = 1 / (1 + Math.pow(10, (mmr2 - mmr1) / 400));
    const E2 = 1 / (1 + Math.pow(10, (mmr1 - mmr2) / 400));

    const K1 = getKFactor(mmr1);
    const K2 = getKFactor(mmr2);

    const R1 = Math.floor(mmr1 + K1 * (score1 - E1));
    const R2 = Math.floor(mmr2 + K2 * (score2- E2));

    return [R1, R2];
}

function getKFactor(mmr) {
    if (mmr < 2100) {
        return 32;
    }

    if (mmr > 2400) {
        return 16;
    }

    return 24;
}