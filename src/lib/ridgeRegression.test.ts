import assert from "node:assert";
import { test, describe } from "node:test";
import { fitRidgeRegression } from "./ridgeRegression";

describe("TypeScript Ridge Regression Solver", () => {
  test("fits simple linear relation y = 50 * x1 + 20 cleanly", () => {
    const X = [[0.1], [0.3], [0.5], [0.7], [0.9]];
    const y = [25, 35, 45, 55, 65]; // y = 50 * x + 20

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
});
