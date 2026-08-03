import assert from "node:assert";
import { test, describe } from "node:test";
import { 
  computeIpipSelfReportScores, 
  calculatePearsonCorrelation, 
  evaluateGroundTruthValidation, 
  PairedScoreSample 
} from "./ipipQuiz";

describe("Mini-IPIP Ground Truth Validation & Pearson Correlation", () => {
  test("computes IPIP self-reported scores accurately from 1-5 Likert answers", () => {
    const maxAnswers = {
      q1: 5, q2: 5, q3: 5, q4: 5, q5: 5, q6: 5, q7: 5, q8: 5, q9: 5, q10: 5
    };
    const scores = computeIpipSelfReportScores(maxAnswers);
    assert.strictEqual(scores.openness, 100);
    assert.strictEqual(scores.conscientiousness, 100);
    assert.strictEqual(scores.extraversion, 100);
    assert.strictEqual(scores.agreeableness, 100);
    assert.strictEqual(scores.neuroticism, 100);
  });

  test("calculates Pearson correlation coefficient r = 1.0 for identical vectors", () => {
    const pairs = [
      { x: 10, y: 10 },
      { x: 20, y: 20 },
      { x: 30, y: 30 },
      { x: 40, y: 40 },
    ];
    const r = calculatePearsonCorrelation(pairs);
    assert.strictEqual(r, 1);
  });

  test("calculates Pearson correlation coefficient r = -1.0 for perfectly inverse vectors", () => {
    const pairs = [
      { x: 10, y: 40 },
      { x: 20, y: 30 },
      { x: 30, y: 20 },
      { x: 40, y: 10 },
    ];
    const r = calculatePearsonCorrelation(pairs);
    assert.strictEqual(r, -1);
  });

  test("evaluates ground truth validation report for paired samples", () => {
    const samples: PairedScoreSample[] = [
      {
        id: "s1",
        timestamp: "2026-08-01T10:00:00Z",
        computed: { openness: 70, conscientiousness: 60, extraversion: 80, agreeableness: 75, neuroticism: 30 },
        selfReported: { openness: 75, conscientiousness: 65, extraversion: 85, agreeableness: 70, neuroticism: 35 },
      },
      {
        id: "s2",
        timestamp: "2026-08-01T11:00:00Z",
        computed: { openness: 40, conscientiousness: 40, extraversion: 50, agreeableness: 50, neuroticism: 60 },
        selfReported: { openness: 45, conscientiousness: 35, extraversion: 45, agreeableness: 55, neuroticism: 65 },
      },
    ];

    const report = evaluateGroundTruthValidation(samples);
    assert.ok(report.openness);
    assert.strictEqual(report.openness.sampleSize, 2);
    assert.ok(report.openness.r > 0.9);
  });
});
