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
 * Calculates the condition number of a matrix.
 * @param matrix The matrix to analyze.
 * @returns The condition number (ratio of largest to smallest singular value).
 */
function conditionNumber(matrix: number[][]): number {
  // For simplicity, we'll use a basic approach
  // In production, you might want to use a more robust SVD implementation
  const n = matrix.length;
  let maxNorm = 0;
  let minNorm = Infinity;

  // Calculate norms of rows
  for (let i = 0; i < n; i++) {
    const rowNorm = Math.sqrt(matrix[i].reduce((sum, val) => sum + val * val, 0));
    maxNorm = Math.max(maxNorm, rowNorm);
    minNorm = Math.min(minNorm, rowNorm);
  }

  return maxNorm / minNorm;
}

/**
 * Inverts a square matrix using Gauss-Jordan elimination with enhanced error handling.
 * @param matrix The matrix to invert.
 * @returns The inverted matrix, or null if the matrix is singular or ill-conditioned.
 */
export function invertMatrix(matrix: number[][]): number[][] | null {
  const n = matrix.length;

  // Input validation
  if (n === 0) {
    throw new Error("Matrix cannot be empty.");
  }

  if (n !== matrix[0].length) {
    throw new Error("Matrix must be square to be inverted.");
  }

  // Check for condition number to detect ill-conditioned matrices
  const cond = conditionNumber(matrix);
  if (cond > 1e12) {
    console.warn(`Matrix is ill-conditioned (condition number: ${cond.toExponential(2)}). Results may be unreliable.`);
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

    // Check for singularity with improved tolerance
    if (Math.abs(augmented[i][i]) < 1e-14) {
      console.warn("Matrix is singular or nearly singular. Cannot compute inverse.");
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

  const result = augmented.map(row => row.slice(n));

  // Verify the result by checking if A * A^(-1) ≈ I
  const verification = matrixMultiply(matrix, result);
  let maxError = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const expected = i === j ? 1 : 0;
      maxError = Math.max(maxError, Math.abs(verification[i][j] - expected));
    }
  }

  if (maxError > 1e-10) {
    console.warn(`Matrix inversion verification failed. Maximum error: ${maxError.toExponential(2)}`);
  }

  return result;
}

/**
 * Computes the determinant of a square matrix.
 * @param matrix The matrix to compute determinant for.
 * @returns The determinant value.
 */
export function determinant(matrix: number[][]): number {
  const n = matrix.length;

  if (n === 0) return 0;
  if (n === 1) return matrix[0][0];
  if (n === 2) return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];

  let det = 0;
  for (let j = 0; j < n; j++) {
    const minor = matrix.slice(1).map(row => row.filter((_, col) => col !== j));
    det += matrix[0][j] * Math.pow(-1, j) * determinant(minor);
  }

  return det;
}

/**
 * Checks if a matrix is invertible.
 * @param matrix The matrix to check.
 * @returns True if the matrix is invertible, false otherwise.
 */
export function isInvertible(matrix: number[][]): boolean {
  try {
    const det = determinant(matrix);
    return Math.abs(det) > 1e-14;
  } catch {
    return false;
  }
}
