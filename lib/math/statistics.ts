/**
 * Approximates the cumulative distribution function (CDF) for the t-distribution.
 * Note: This is a simplified approximation. For high-precision applications, a more robust library might be needed.
 * @param t The t-statistic.
 * @param df The degrees of freedom.
 * @returns The probability P(T <= t).
 */
export function tcdf(t: number, df: number): number {
    // Approximation using the relationship with the Incomplete Beta Function.
    // This is a common method but has limitations.
    let A = (t: number, df: number) => {
        const x = df / (df + t * t);
        // This is a simple form, a proper Incomplete Beta function implementation would be more complex.
        // For the sake of this project, we'll use a known approximation.
        // Source: Abramowitz and Stegun, formula 26.7.8
        const sign = t > 0 ? 1 : -1;
        const p = 0.5 + sign * (0.5 * Math.sqrt(1 - x)); // Simplified for illustration
        return p;
    }
    // A more direct and slightly better approximation for student's t-test
    const x = df / (df + t * t);
    if (t > 0) {
      return 1 - 0.5 * ibeta(x, df / 2, 0.5);
    } else {
      return 0.5 * ibeta(x, df / 2, 0.5);
    }
}

/**
 * Approximates the cumulative distribution function (CDF) for the F-distribution.
 * Note: This is a simplified approximation.
 * @param F The F-statistic.
 * @param df1 The degrees of freedom for the numerator.
 * @param df2 The degrees of freedom for the denominator.
 * @returns The probability P(X <= F).
 */
export function fcdf(F: number, df1: number, df2: number): number {
    const x = (df1 * F) / (df1 * F + df2);
    return ibeta(x, df1 / 2, df2 / 2);
}


// Incomplete Beta function - required for tcdf and fcdf
function ibeta(x: number, a: number, b: number): number {
    if (x < 0 || x > 1) return NaN;
    if (x === 0) return 0;
    if (x === 1) return 1;

    const bt = Math.exp(gammaln(a + b) - gammaln(a) - gammaln(b) + a * Math.log(x) + b * Math.log(1 - x));

    if (x < (a + 1) / (a + b + 2)) {
        return bt * betacf(x, a, b) / a;
    } else {
        return 1 - bt * betacf(1 - x, b, a) / b;
    }
}

// Log-gamma function
function gammaln(x: number): number {
    const cof = [
        76.18009172947146, -86.50532032941677,
        24.01409824083091, -1.231739572450155,
        0.1208650973866179e-2, -0.5395239384953e-5
    ];
    let y = x;
    let tmp = x + 5.5;
    tmp -= (x + 0.5) * Math.log(tmp);
    let ser = 1.000000000190015;
    for (let j = 0; j < 6; j++) {
        y++;
        ser += cof[j] / y;
    }
    return -tmp + Math.log(2.5066282746310005 * ser / x);
}

// Continued fraction for incomplete beta function
function betacf(x: number, a: number, b: number): number {
    const MAXIT = 100;
    const EPS = 3.0e-7;
    const FPMIN = 1.0e-30;

    let m = 1;
    let qab = a + b;
    let qap = a + 1.0;
    let qam = a - 1.0;
    let c = 1.0;
    let d = 1.0 - qab * x / qap;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    d = 1.0 / d;
    let h = d;

    for (; m <= MAXIT; m++) {
        let m2 = 2 * m;
        let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
        d = 1.0 + aa * d;
        if (Math.abs(d) < FPMIN) d = FPMIN;
        c = 1.0 + aa / c;
        if (Math.abs(c) < FPMIN) c = FPMIN;
        d = 1.0 / d;
        h *= (d * c);
        aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
        d = 1.0 + aa * d;
        if (Math.abs(d) < FPMIN) d = FPMIN;
        c = 1.0 + aa / c;
        if (Math.abs(c) < FPMIN) c = FPMIN;
        d = 1.0 / d;
        let del = d * c;
        h *= del;
        if (Math.abs(del - 1.0) < EPS) break;
    }
    return h;
}

/**
 * Calculates the error function (erf).
 * Used for calculating p-values from z-scores in a normal distribution.
 * @param x The value to calculate the error function for.
 * @returns The result of erf(x).
 */
export function erf(x: number): number {
    // Using the Abramowitz and Stegun approximation, same as in the legacy file.
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
}
