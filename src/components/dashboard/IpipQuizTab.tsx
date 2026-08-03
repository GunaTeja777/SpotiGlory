"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";
import { 
  MINI_IPIP_QUESTIONS, 
  computeIpipSelfReportScores, 
  evaluateGroundTruthValidation, 
  PairedScoreSample, 
  SelfReportedOceanScores 
} from "@/lib/ipipQuiz";
import { fitRidgeRegression, RidgeRegressionModel } from "@/lib/ridgeRegression";
import { ModelAccuracyChart } from "./ModelAccuracyChart";
import { 
  BrainCircuit, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw, 
  BarChart3, 
  Layers, 
  ShieldCheck 
} from "lucide-react";

export const IpipQuizTab: React.FC = () => {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [selfReported, setSelfReported] = useState<SelfReportedOceanScores | null>(null);
  const [samples, setSamples] = useState<PairedScoreSample[]>([]);
  const [ridgeModel, setRidgeModel] = useState<RidgeRegressionModel | null>(null);
  const [computedOcean, setComputedOcean] = useState<SelfReportedOceanScores | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch computed Spotify OCEAN scores from API & load saved samples
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/analysis/ocean");
        if (res.ok) {
          const json = await res.json();
          if (json.ocean) {
            setComputedOcean({
              openness: json.ocean.openness.score,
              conscientiousness: json.ocean.conscientiousness.score,
              extraversion: json.ocean.extraversion.score,
              agreeableness: json.ocean.agreeableness.score,
              neuroticism: json.ocean.neuroticism.score,
            });
          }
        }
      } catch (err) {
        console.error("Failed to load computed OCEAN scores", err);
      }

      const stored = localStorage.getItem("spotiglory_ipip_samples");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setSamples(parsed);
        } catch (e) {
          // Empty
        }
      }
      setIsLoading(false);
    };

    loadData();
  }, []);

  const handleAnswer = (questionId: string, val: number) => {
    const updated = { ...answers, [questionId]: val };
    setAnswers(updated);
    if (currentStep < MINI_IPIP_QUESTIONS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleFinishQuiz = () => {
    const scores = computeIpipSelfReportScores(answers);
    setSelfReported(scores);
    setIsCompleted(true);

    if (computedOcean) {
      const newSample: PairedScoreSample = {
        id: `ipip_${Date.now()}`,
        timestamp: new Date().toISOString(),
        computed: computedOcean,
        selfReported: scores,
      };

      const updatedSamples = [...samples, newSample];
      setSamples(updatedSamples);
      localStorage.setItem("spotiglory_ipip_samples", JSON.stringify(updatedSamples));
    }
  };

  const handleTrainRidgeRegression = () => {
    if (samples.length === 0) return;
    const X = samples.map((s) => [
      s.computed.openness / 100,
      s.computed.conscientiousness / 100,
      s.computed.extraversion / 100,
      s.computed.agreeableness / 100,
      s.computed.neuroticism / 100,
    ]);
    const y = samples.map((s) => s.selfReported.openness);
    const model = fitRidgeRegression(X, y, 0.5);
    setRidgeModel(model);
  };

  const validationReport = evaluateGroundTruthValidation(samples);
  const currentQ = MINI_IPIP_QUESTIONS[currentStep];

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <GlassCard variant="elevated" radius="3xl" className="p-8 border-purple-500/30 shadow-[0_20px_50px_rgba(168,85,247,0.15)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold tracking-wider uppercase mb-3">
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>Ground Truth Validation Engine</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
              10-Item Mini-IPIP Psychometric Quiz
            </h2>
            <p className="text-xs md:text-sm text-gray-300 mt-2 max-w-2xl leading-relaxed">
              Validate SpotiGlory's computed Spotify scores against your self-reported Big Five (OCEAN) ground truth to calculate Pearson correlation coefficients (<span className="font-mono text-purple-300 font-bold">r</span>) and train learned Ridge Regression models.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/[0.06] border border-white/10 text-xs font-mono text-gray-300 shrink-0">
            <ShieldCheck className="w-4 h-4 text-[#1DB954]" />
            <span>Public Domain IPIP Scale</span>
          </div>
        </div>
      </GlassCard>

      {/* Main Interactive Container */}
      {!isCompleted ? (
        <GlassCard variant="elevated" radius="3xl" className="p-8 border-white/18 min-h-[380px] flex flex-col justify-between">
          <div>
            {/* Progress Bar */}
            <div className="flex items-center justify-between text-xs font-mono text-gray-400 mb-3">
              <span>Question {currentStep + 1} of {MINI_IPIP_QUESTIONS.length}</span>
              <span className="text-purple-300 font-bold">{Math.round(((currentStep + 1) / MINI_IPIP_QUESTIONS.length) * 100)}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden mb-8">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-[#1DB954] transition-all duration-300"
                style={{ width: `${((currentStep + 1) / MINI_IPIP_QUESTIONS.length) * 100}%` }}
              />
            </div>

            {/* Question Box */}
            <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/10 mb-8 text-center">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 mb-3 inline-block">
                Evaluating {currentQ.trait}
              </span>
              <h3 className="text-xl font-bold text-white leading-relaxed">
                "{currentQ.text}"
              </h3>
            </div>

            {/* 5-Point Likert Options */}
            <div className="grid grid-cols-5 gap-3">
              {[
                { label: "Strongly Disagree", val: 1, color: "hover:border-red-500/50 hover:bg-red-500/10" },
                { label: "Disagree", val: 2, color: "hover:border-amber-500/50 hover:bg-amber-500/10" },
                { label: "Neutral", val: 3, color: "hover:border-gray-500/50 hover:bg-gray-500/10" },
                { label: "Agree", val: 4, color: "hover:border-cyan-500/50 hover:bg-cyan-500/10" },
                { label: "Strongly Agree", val: 5, color: "hover:border-[#1DB954]/50 hover:bg-[#1DB954]/10" },
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => handleAnswer(currentQ.id, opt.val)}
                  className={`p-4 rounded-2xl border transition-all text-center flex flex-col items-center gap-2 group ${
                    answers[currentQ.id] === opt.val
                      ? "bg-[#1DB954]/20 border-[#1DB954] text-white"
                      : "bg-white/[0.03] border-white/10 text-gray-300 " + opt.color
                  }`}
                >
                  <span className="text-lg font-mono font-black group-hover:scale-110 transition-transform">
                    {opt.val}
                  </span>
                  <span className="text-[11px] font-medium leading-tight">
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-white/10 mt-6">
            <button
              disabled={currentStep === 0}
              onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
              className="text-xs font-mono text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
            >
              ← Previous Question
            </button>

            {currentStep === MINI_IPIP_QUESTIONS.length - 1 && (
              <GlassButton
                variant="primary"
                size="md"
                onClick={handleFinishQuiz}
                rightIcon={<CheckCircle2 className="w-4 h-4 text-black" />}
                className="font-bold text-xs"
              >
                Submit Ground Truth Answers
              </GlassButton>
            )}
          </div>
        </GlassCard>
      ) : (
        /* Quiz Completion & Self-Report vs Computed Comparison */
        <div className="flex flex-col gap-6">
          <GlassCard variant="elevated" radius="3xl" className="p-8 border-[#1DB954]/30 shadow-[0_20px_50px_rgba(29,185,84,0.15)]">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#1DB954]/20 border border-[#1DB954]/40 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-[#1DB954]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Quiz Completed & Sample Recorded!</h3>
                  <p className="text-xs text-gray-400">Self-reported scores paired with Spotify calculated metrics</p>
                </div>
              </div>

              <GlassButton
                variant="subtle"
                size="sm"
                onClick={() => {
                  setIsCompleted(false);
                  setCurrentStep(0);
                  setAnswers({});
                }}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Retake Quiz
              </GlassButton>
            </div>

            {/* Score Comparison Table */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {selfReported && [
                { trait: "Openness", self: selfReported.openness, comp: computedOcean?.openness },
                { trait: "Conscientiousness", self: selfReported.conscientiousness, comp: computedOcean?.conscientiousness },
                { trait: "Extraversion", self: selfReported.extraversion, comp: computedOcean?.extraversion },
                { trait: "Agreeableness", self: selfReported.agreeableness, comp: computedOcean?.agreeableness },
                { trait: "Neuroticism", self: selfReported.neuroticism, comp: computedOcean?.neuroticism },
              ].map((item) => (
                <div key={item.trait} className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col gap-2">
                  <span className="text-xs font-bold text-gray-300">{item.trait}</span>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-gray-400">Self-Report:</span>
                    <span className="text-purple-300 font-bold">{item.self}/100</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-gray-400">Computed:</span>
                    <span className="text-[#1DB954] font-bold">{item.comp ?? "N/A"}/100</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {/* Pearson r Correlation Validation Report Card */}
      <GlassCard variant="elevated" radius="3xl" className="p-8 border-white/18">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Pearson Correlation Validation (r)</h3>
              <p className="text-xs text-gray-400 mt-0.5">Statistical validation across {samples.length} collected user pair samples</p>
            </div>
          </div>

          <GlassButton
            variant="subtle"
            size="sm"
            onClick={handleTrainRidgeRegression}
            leftIcon={<Layers className="w-3.5 h-3.5" />}
          >
            Train Ridge Regression Model
          </GlassButton>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Object.entries(validationReport).map(([key, val]) => (
            <div key={key} className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{val.trait}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  r = {val.r}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                {val.interpretation}
              </p>
              <span className="text-[9px] font-mono text-gray-500">
                N = {val.sampleSize} samples
              </span>
            </div>
          ))}
        </div>

        {/* Ridge Regression Model Weights Box */}
        {ridgeModel && (
          <div className="mt-6 p-6 rounded-2xl bg-purple-500/10 border border-purple-500/30 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-purple-200 uppercase tracking-wider font-mono flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-300" />
                <span>Learned Ridge Regression Parameters (L2 Regularized)</span>
              </h4>
              <span className="text-xs font-mono text-[#1DB954] font-bold">
                R² = {ridgeModel.rSquared}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-xs font-mono text-purple-300">
              {ridgeModel.weights.map((w, idx) => (
                <div key={idx} className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-center">
                  <span className="block text-[9px] text-purple-400">w{idx + 1}</span>
                  <span className="font-bold">{w}</span>
                </div>
              ))}
              <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-center">
                <span className="block text-[9px] text-purple-400">bias</span>
                <span className="font-bold">{ridgeModel.bias}</span>
              </div>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Model Accuracy Over Time Recharts Chart */}
      <ModelAccuracyChart />
    </div>
  );
};
