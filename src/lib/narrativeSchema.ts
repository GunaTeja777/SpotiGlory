/**
 * Runtime GenAI Narrative Schema Validator
 * 
 * Strict runtime validator verifying JSON response structure from LLM calls
 * and formatting error feedback for 1-shot retry attempts.
 */

import { NarrativeProfile } from "./narrativePrompt";

export interface ValidationResult {
  success: boolean;
  data?: NarrativeProfile;
  error?: string;
}

/**
 * Validates raw parsed JSON object against strict NarrativeProfile schema.
 */
export function validateNarrativeJson(obj: any): ValidationResult {
  if (!obj || typeof obj !== "object") {
    return { success: false, error: "Response is not a valid JSON object" };
  }

  if (typeof obj.listeningPersona !== "string" || obj.listeningPersona.trim().length < 3) {
    return { success: false, error: "Missing or short 'listeningPersona' field (min 3 chars)" };
  }

  if (typeof obj.headline !== "string" || obj.headline.trim().length < 5) {
    return { success: false, error: "Missing or short 'headline' field (min 5 chars)" };
  }

  if (typeof obj.summary !== "string" || obj.summary.trim().length < 15) {
    return { success: false, error: "Missing or short 'summary' field (min 15 chars)" };
  }

  if (!Array.isArray(obj.traits) || obj.traits.length !== 5) {
    return { success: false, error: "Field 'traits' must be an array of exactly 5 OCEAN trait objects" };
  }

  for (let i = 0; i < obj.traits.length; i++) {
    const t = obj.traits[i];
    if (!t || typeof t !== "object" || !t.trait || !t.insight) {
      return { success: false, error: `Trait object at index ${i} is missing 'trait' or 'insight' fields` };
    }
  }

  if (!Array.isArray(obj.funFacts) || obj.funFacts.length !== 3) {
    return { success: false, error: "Field 'funFacts' must be an array of exactly 3 string observations" };
  }

  return {
    success: true,
    data: {
      listeningPersona: obj.listeningPersona.trim(),
      headline: obj.headline.trim(),
      summary: obj.summary.trim(),
      motivationalLine: typeof obj.motivationalLine === "string" ? obj.motivationalLine.trim() : undefined,
      uniqueSignature: typeof obj.uniqueSignature === "string" ? obj.uniqueSignature.trim() : undefined,
      traits: obj.traits.map((t: any) => ({
        trait: String(t.trait).trim(),
        label: String(t.label || "").trim(),
        insight: String(t.insight).trim(),
      })),
      funFacts: obj.funFacts.map((f: any) => String(f).trim()),
    },
  };
}

/**
 * Formats a 1-shot retry prompt with explicit error feedback for the LLM.
 */
export function build1ShotCorrectionPrompt(previousResponse: string, validationError: string): string {
  return `YOUR PREVIOUS JSON RESPONSE FAILED VALIDATION:
Error: ${validationError}

Previous Response Snippet:
"${previousResponse.slice(0, 300)}..."

CORRECTIVE INSTRUCTION: Please re-generate the JSON immediately ensuring all required fields ('listeningPersona', 'headline', 'summary', 5 'traits', 3 'funFacts') are strictly present and properly formatted. Respond ONLY with clean JSON.`;
}
