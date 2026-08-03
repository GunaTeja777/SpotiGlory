/**
 * Pure TypeScript Ridge Regression Solver (L2 Regularized Linear Model)
 * & Incremental Model Retraining Engine with Version History
 * 
 * Fits weight vectors w = (X^T X + lambda * I)^(-1) X^T y from paired ground-truth samples,
 * tracks version history (v1.0.0 -> v1.1.0), and stores Pearson r accuracy per trait over time.
 */

import { PairedScoreSample, calculatePearsonCorrelation } from "./ipipQuiz";
import { getTraitFeedbackSamples } from "./feedbackStore";

export interface RidgeRegressionModel {
  weights: number[];
  bias: number;
  rSquared: number;
  sampleCount: number;
  lambda: number;
}

export interface ModelVersionEntry {
  version: string;
  timestamp: string;
  sampleCount: number;
  pearsonR: Record<string, number>;
  traitModels: Record<string, RidgeRegressionModel>;
}

export const MODEL_HISTORY_STORAGE_KEY = "spotiglory_model_versions";
let inMemoryHistory: ModelVersionEntry[] = [];

/**
 * Solves system of linear equations A * x = b using Gauss-Jordan elimination with partial pivoting.
 */
function solveLinearSystem(A: number[][], b: number[]): number[] {
  const n = A.length;
  // Create augmented matrix [A | b]
  const M: number[][] = A.map((row, i) => [...row, b[i]]);

  for (let i = 0; i < n; i++) {
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(M[k][i]) > Math.abs(M[maxRow][i])) {
        maxRow = k;
      }
    }

    [M[i], M[maxRow]] = [M[maxRow], M[i]];

    if (Math.abs(M[i][i]) < 1e-10) {
      M[i][i] = 1e-10;
    }

    const pivot = M[i][i];
    for (let j = i; j <= n; j++) {
      M[i][j] /= pivot;
    }

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
  const Xb: number[][] = X.map((row) => [...row, 1.0]);
  const numFeatures = p + 1;

  const XtX: number[][] = Array(numFeatures)
    .fill(0)
    .map(() => Array(numFeatures).fill(0));

  for (let i = 0; i < numFeatures; i++) {
    for (let j = 0; j < numFeatures; j++) {
      for (let k = 0; k < n; k++) {
        XtX[i][j] += Xb[k][i] * Xb[k][j];
      }
      if (i === j && i < p) {
        XtX[i][j] += lambda;
      }
    }
  }

  const Xty: number[] = Array(numFeatures).fill(0);
  for (let i = 0; i < numFeatures; i++) {
    for (let k = 0; k < n; k++) {
      Xty[i] += Xb[k][i] * y[k];
    }
  }

  const params = solveLinearSystem(XtX, Xty);
  const weights = params.slice(0, p).map((w) => Number(w.toFixed(3)));
  const bias = Number(params[p].toFixed(3));

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

/**
 * Bumps semver minor version string (v1.0.0 -> v1.1.0 -> v1.2.0)
 */
export function bumpVersionString(currentVersion: string): string {
  const match = currentVersion.match(/^v?(\d+)\.(\d+)\.(\d+)$/);
  if (!match) return "v1.1.0";
  const major = parseInt(match[1], 10);
  const minor = parseInt(match[2], 10) + 1;
  return `v${major}.${minor}.0`;
}

/**
 * Gets full model version history.
 */
export function getModelVersionHistory(): ModelVersionEntry[] {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const raw = localStorage.getItem(MODEL_HISTORY_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      // Empty
    }
  }
  return inMemoryHistory;
}

/**
 * Incremental retraining engine: pulls IPIP quiz samples + feedback correction pairs,
 * refits Ridge regression per OCEAN trait, bumps version (v1.0.0 -> v1.1.0), and stores Pearson r.
 */
export function retrainModel(options?: {
  threshold?: number;
  force?: boolean;
  lambda?: number;
  customSamples?: PairedScoreSample[];
}): ModelVersionEntry {
  const threshold = options?.threshold ?? 10;
  const lambda = options?.lambda ?? 0.5;

  let samples: PairedScoreSample[] = options?.customSamples || [];

  if (samples.length === 0 && typeof window !== "undefined" && window.localStorage) {
    try {
      const raw = localStorage.getItem("spotiglory_ipip_samples");
      if (raw) {
        samples = JSON.parse(raw);
      }
    } catch (e) {
      // Empty
    }
  }

  const history = getModelVersionHistory();
  const latestEntry = history.length > 0 ? history[history.length - 1] : null;

  if (samples.length < threshold && !options?.force && latestEntry) {
    return latestEntry;
  }

  const traits = ["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism"] as const;
  const traitModels: Record<string, RidgeRegressionModel> = {};
  const pearsonR: Record<string, number> = {};

  traits.forEach((t) => {
    const X = samples.map((s) => [
      (s.computed.openness || 50) / 100,
      (s.computed.conscientiousness || 50) / 100,
      (s.computed.extraversion || 50) / 100,
      (s.computed.agreeableness || 50) / 100,
      (s.computed.neuroticism || 50) / 100,
    ]);
    const y = samples.map((s) => s.selfReported[t] ?? 50);

    const model = fitRidgeRegression(X, y, lambda);
    traitModels[t] = model;

    // Calculate Pearson r for this trait
    const pairs = samples.map((s) => ({ x: s.computed[t] ?? 50, y: s.selfReported[t] ?? 50 }));
    pearsonR[t] = calculatePearsonCorrelation(pairs);
  });

  const nextVersion = latestEntry ? bumpVersionString(latestEntry.version) : "v1.0.0";
  const newEntry: ModelVersionEntry = {
    version: nextVersion,
    timestamp: new Date().toISOString(),
    sampleCount: samples.length,
    pearsonR,
    traitModels,
  };

  const updatedHistory = [...history, newEntry];
  inMemoryHistory = updatedHistory;

  if (typeof window !== "undefined" && window.localStorage) {
    try {
      localStorage.setItem(MODEL_HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
    } catch (e) {
      // Empty
    }
  }

  return newEntry;
}
