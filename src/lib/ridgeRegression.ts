/**
 * Pure TypeScript Ridge Regression Solver (L2 Regularized Linear Model)
 * 
 * Fits weight vectors w = (X^T X + lambda * I)^(-1) X^T y from paired ground-truth samples,
 * enabling transition from heuristic scoring rules to a learned linear model.
 */

export interface RidgeRegressionModel {
  weights: number[];
  bias: number;
  rSquared: number;
  sampleCount: number;
  lambda: number;
}

/**
 * Solves system of linear equations A * x = b using Gauss-Jordan elimination with partial pivoting.
 */
function solveLinearSystem(A: number[][], b: number[]): number[] {
  const n = A.length;
  // Create augmented matrix [A | b]
  const M: number[][] = A.map((row, i) => [...row, b[i]]);

  for (let i = 0; i < n; i++) {
    // Find pivot
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(M[k][i]) > Math.abs(M[maxRow][i])) {
        maxRow = k;
      }
    }

    // Swap maximum row with current row
    [M[i], M[maxRow]] = [M[maxRow], M[i]];

    // Check for singular matrix
    if (Math.abs(M[i][i]) < 1e-10) {
      M[i][i] = 1e-10;
    }

    // Make pivot 1
    const pivot = M[i][i];
    for (let j = i; j <= n; j++) {
      M[i][j] /= pivot;
    }

    // Eliminate column elements in other rows
    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = M[k][i];
        for (let j = i; j <= n; j++) {
          M[k][j] -= factor * M[i][j];
        }
      }
    }
  }

  return M.map((row) => row[n]);
}

/**
 * Fits Ridge Regression model w = (X^T X + lambda * I)^(-1) X^T y
 * @param X Input feature matrix (N samples x P features, values 0..1)
 * @param y Target output vector (N samples, values 0..100)
 * @param lambda Regularization hyperparameter (default 1.0)
 */
export function fitRidgeRegression(
  X: number[][],
  y: number[],
  lambda = 1.0
): RidgeRegressionModel {
  const n = X.length;
  if (n === 0) {
    return { weights: [], bias: 0, rSquared: 0, sampleCount: 0, lambda };
  }

  const p = X[0].length;

  // Add bias term (1.0) as last feature in design matrix X_bias
  const Xb: number[][] = X.map((row) => [...row, 1.0]);
  const numFeatures = p + 1;

  // Compute X^T * X (size (p+1) x (p+1))
  const XtX: number[][] = Array(numFeatures)
    .fill(0)
    .map(() => Array(numFeatures).fill(0));

  for (let i = 0; i < numFeatures; i++) {
    for (let j = 0; j < numFeatures; j++) {
      for (let k = 0; k < n; k++) {
        XtX[i][j] += Xb[k][i] * Xb[k][j];
      }
      // Add L2 penalty (lambda * I) to feature weights (excluding bias term at index p)
      if (i === j && i < p) {
        XtX[i][j] += lambda;
      }
    }
  }

  // Compute X^T * y (size p+1)
  const Xty: number[] = Array(numFeatures).fill(0);
  for (let i = 0; i < numFeatures; i++) {
    for (let k = 0; k < n; k++) {
      Xty[i] += Xb[k][i] * y[k];
    }
  }

  // Solve (X^T X + lambda * I) * params = X^T y
  const params = solveLinearSystem(XtX, Xty);
  const weights = params.slice(0, p).map((w) => Number(w.toFixed(3)));
  const bias = Number(params[p].toFixed(3));

  // Compute R-squared metric
  const meanY = y.reduce((sum, val) => sum + val, 0) / n;
  let totalSS = 0;
  let residualSS = 0;

  for (let k = 0; k < n; k++) {
    let pred = bias;
    for (let j = 0; j < p; j++) {
      pred += X[k][j] * weights[j];
    }
    totalSS += (y[k] - meanY) ** 2;
    residualSS += (y[k] - pred) ** 2;
  }

  const rSquared = totalSS > 0 ? Number(Math.max(0, 1 - residualSS / totalSS).toFixed(3)) : 0;

  return {
    weights,
    bias,
    rSquared,
    sampleCount: n,
    lambda,
  };
}
