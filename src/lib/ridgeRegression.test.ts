import assert from "node:assert";
import { test, describe } from "node:test";
import { fitRidgeRegression, retrainModel, bumpVersionString, ModelVersionEntry } from "./ridgeRegression";
import { PairedScoreSample } from "./ipipQuiz";

describe("TypeScript Ridge Regression Solver & Incremental Retraining Engine", () => {
  test("fits simple linear relation y = 50 * x1 + 20 cleanly", () => {
    const X = [[0.1], [0.3], [0.5], [0.7], [0.9]];
    const y = [25, 35, 45, 55, 65];

    const model = fitRidgeRegression(X, y, 0.01);
    assert.strictEqual(model.sampleCount, 5);
    assert.ok(model.rSquared > 0.95);
    assert.ok(model.weights[0] > 40 && model.weights[0] < 60);
  });

  test("handles empty samples gracefully", () => {
    const model = fitRidgeRegression([], []);
    assert.strictEqual(model.sampleCount, 0);
    assert.strictEqual(model.rSquared, 0);
  });

  test("bumps semver version strings accurately (v1.0.0 -> v1.1.0 -> v1.2.0)", () => {
    assert.strictEqual(bumpVersionString("v1.0.0"), "v1.1.0");
    assert.strictEqual(bumpVersionString("v1.1.0"), "v1.2.0");
    assert.strictEqual(bumpVersionString("v2.5.0"), "v2.6.0");
  });

  test("incremental retraining refits weights and preserves version history", () => {
    const samplesBatch1: PairedScoreSample[] = [
      {
        id: "p1",
        timestamp: "2026-08-01T10:00:00Z",
        computed: { openness: 80, conscientiousness: 70, extraversion: 60, agreeableness: 50, neuroticism: 40 },
        selfReported: { openness: 85, conscientiousness: 75, extraversion: 65, agreeableness: 55, neuroticism: 45 },
      },
      {
        id: "p2",
        timestamp: "2026-08-01T11:00:00Z",
        computed: { openness: 30, conscientiousness: 40, extraversion: 50, agreeableness: 60, neuroticism: 70 },
        selfReported: { openness: 35, conscientiousness: 45, extraversion: 55, agreeableness: 65, neuroticism: 75 },
      },
    ];

    const version1 = retrainModel({ threshold: 2, force: true, customSamples: samplesBatch1 });
    assert.ok(version1.version);
    assert.strictEqual(version1.sampleCount, 2);
    assert.ok(typeof version1.pearsonR.openness === "number");
    assert.ok(version1.traitModels.openness);

    // Retrain with expanded dataset (Batch 2)
    const samplesBatch2: PairedScoreSample[] = [
      ...samplesBatch1,
      {
        id: "p3",
        timestamp: "2026-08-01T12:00:00Z",
        computed: { openness: 90, conscientiousness: 20, extraversion: 30, agreeableness: 40, neuroticism: 50 },
        selfReported: { openness: 95, conscientiousness: 25, extraversion: 35, agreeableness: 45, neuroticism: 55 },
      },
    ];

    const version2 = retrainModel({ threshold: 3, force: true, customSamples: samplesBatch2 });
    assert.notStrictEqual(version1.version, version2.version);
    assert.strictEqual(version2.sampleCount, 3);
    assert.ok(version2.pearsonR.openness > 0.9);
  });
});
