/**
 * Transposes a matrix (turns rows into columns and vice-versa).
 * @param matrix The matrix to transpose.
 * @returns The transposed matrix.
 */
export function transpose(matrix: number[][]): number[][] {
  if (!matrix || matrix.length === 0 || matrix[0].length === 0) {
    return [];
  }
  return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
}

/**
 * Multiplies two matrices.
 * @param a The first matrix.
 * @param b The second matrix.
 * @returns The resulting matrix.
 */
export function matrixMultiply(a: number[][], b: number[][]): number[][] {
  const aRows = a.length;
  const aCols = a[0].length;
  const bRows = b.length;
  const bCols = b[0].length;

  if (aCols !== bRows) {
    throw new Error(`Matrix multiplication dimension mismatch: (${aRows}x${aCols}) * (${bRows}x${bCols})`);
  }

  const result = Array.from({ length: aRows }, () => Array(bCols).fill(0));

  for (let i = 0; i < aRows; i++) {
    for (let j = 0; j < bCols; j++) {
      for (let k = 0; k < aCols; k++) {
        result[i][j] += a[i][k] * b[k][j];
      }
    }
  }
  return result;
}

/**
 * Inverts a square matrix using Gauss-Jordan elimination.
 * @param matrix The matrix to invert.
 * @returns The inverted matrix, or null if the matrix is singular.
 */
export function invertMatrix(matrix: number[][]): number[][] | null {
  const n = matrix.length;
  if (n !== matrix[0].length) {
    throw new Error("Matrix must be square to be inverted.");
  }

  const augmented = matrix.map((row, i) => [
    ...row,
    ...Array(n).fill(0).map((_, j) => (i === j ? 1 : 0)),
  ]);

  for (let i = 0; i < n; i++) {
    let maxRow = i;
    for (let j = i + 1; j < n; j++) {
      if (Math.abs(augmented[j][i]) > Math.abs(augmented[maxRow][i])) {
        maxRow = j;
      }
    }

    if (maxRow !== i) {
      [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
    }

    if (Math.abs(augmented[i][i]) < 1e-12) {
      // Matrix is singular or nearly singular
      return null;
    }

    const pivot = augmented[i][i];
    for (let j = i; j < 2 * n; j++) {
      augmented[i][j] /= pivot;
    }

    for (let j = 0; j < n; j++) {
      if (j !== i) {
        const factor = augmented[j][i];
        for (let k = i; k < 2 * n; k++) {
          augmented[j][k] -= factor * augmented[i][k];
        }
      }
    }
  }

  return augmented.map(row => row.slice(n));
}
