import assert from "node:assert";
import { test, describe } from "node:test";
import { calculateTargetCorrection, saveTraitFeedbackSample, FeedbackRating } from "./feedbackStore";

describe("Trait Card Feedback Store & Retraining Mapper", () => {
  test("calculates target correction accurately for 'accurate' rating (no change)", () => {
    const target = calculateTargetCorrection(75, "accurate");
    assert.strictEqual(target, 75);
  });

  test("calculates target correction accurately for 'somewhat' rating (moderate shift)", () => {
    const targetHigh = calculateTargetCorrection(80, "somewhat");
    assert.strictEqual(targetHigh, 65);

    const targetLow = calculateTargetCorrection(30, "somewhat");
    assert.strictEqual(targetLow, 45);
  });

  test("calculates target correction accurately for 'not_accurate' rating (inversion)", () => {
    const target = calculateTargetCorrection(80, "not_accurate");
    assert.strictEqual(target, 20);
  });

  test("generates trait feedback sample object with timestamp and id", () => {
    const sample = saveTraitFeedbackSample("openness", 70, "accurate", { normalizedEntropy: 0.8 });
    assert.ok(sample.id.startsWith("fb_openness_"));
    assert.strictEqual(sample.trait, "openness");
    assert.strictEqual(sample.predictedScore, 70);
    assert.strictEqual(sample.targetScore, 70);
    assert.ok(sample.timestamp);
  });
});
