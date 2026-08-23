# Phase 11 — Defect #3 Specification Investigation

## 1. Executive Summary
During the Phase 11 QA validation of the Golden Path, a defect was identified where the deterministic scenario evaluation produces zero response candidates. As a result, the evaluation result object returns `responses: []` and `recommendation: null`, blocking the frontend from rendering the "Compare Recommendations" screen and preventing the final acceptance/audit steps. 

This investigation reveals that the observed behavior—an empty candidate array—is intentionally implemented in the Phase 10 frozen baseline to prevent inventing domain algorithms. A thorough review of the authoritative project specification (`pdf_text_4.2.txt`) confirms that while response generation is conceptually mentioned, no actual mathematics, parameterization, or algorithmic logic are defined. Hardcoding specific candidates would be an unauthorized invention of production behavior. This is classified as a **Specification / Product Gap**.

## 2. Frozen Baseline Verification
- **Commit:** `d1b5aca` (This commit is ahead of the `02682d2c145d9c83df5be8c804a1b72225516f0d` Phase 10 frozen baseline by recent authorised minimal production fixes for Defect #1 and #2, and e2e test additions).
- **Git status:** `On branch main. Your branch is up to date with 'origin/main'. nothing to commit, working tree clean.`
- **Production diff status:** The production baseline is clean and unmutated from the previously authorised state.
- **Untracked-file status:** No untracked production files present (only QA reports/config).

## 3. Defect #3 Observed Behavior
**Trigger:** Executing `POST /api/v1/scenarios/:scenarioId/evaluate`.
**Outcome:** The evaluation successfully completes in persistence but returns an empty list of generated response candidates (`responses: []`), making the `recommendation` null.
**Frontend Impact:** The "Compare Recommendations" button relies on `evaluationResult.responses.length > 0`. Because it evaluates to false, the Golden Path cannot proceed.

## 4. Runtime/API Evidence
An inspection of the end-to-end golden path (and the Playwright timeout at `await compareRecommendationsBtn.waitFor({ state: 'visible', timeout: 30000 });`) confirms that the API accurately persists and returns an empty `responses` array for the evaluation payload. The engine returns zero candidates, leaving nothing to score, rank, or recommend.

## 5. Response Engine Evidence
Inspection of `server/src/engines/response/response.engine.ts` reveals the exact source of the behavior:
```typescript
// The authoritative specification ("Context of aegis.pdf") defines that this engine 
// generates candidate responses, but does NOT provide mathematical formulas, rules, 
// or criteria for generating them numerically.
// 
// In strict adherence to Task 4.3 constraints ("do NOT invent optimization logic", 
// "implement the smallest deterministic, source-supported behavior"), we return an 
// empty deterministic array. This explicitly prevents unsupported AI, ranking, scoring, 
// or candidate-generation behaviors from being claimed as authoritative.
const candidates: ResponseCandidate[] = [];
```
The implementation correctly enforces the constraint not to invent unspecified AI or deterministic generation behavior.

## 6. Authoritative Specification Evidence
Reviewing the project's specification (`pdf_text_4.2.txt`) reveals the following:

- **Section: Task 4 Core Decision Engines & General Concepts**
  - *Terminology:* `ResponseCandidate`
  - *Quotation:* "ResponseCandidate Represents one possible intervention. Examples conceptually: reroute supply activate alternate supplier use stored inventory prioritize critical demand reduce exposure"
  - *Meaning:* The specification identifies conceptual categories of interventions but provides no algorithmic constraints, parameters, or rules for determining them numerically.
- **Section: Contract 51 Response Generation**
  - *Terminology:* `ResponseGenerator`
  - *Quotation:* "51. Response Generation Contract ResponseGenerator Input: ScenarioContext SimulationResult ImpactAssessment Output: ResponseCandidate[] It generates candidate responses , not the final recommendation."
  - *Meaning:* The specification declares the I/O interface of the engine but omits internal deterministic rules.
- **Section: Contract 53 Scoring Engine Contract**
  - *Terminology:* `frozen scoring dimensions and weights`
  - *Quotation:* "The scoring engine must use the frozen scoring dimensions and weights." and separately "Possible dimensions: supply impact coverage shortfall cost time risk resilience".
  - *Meaning:* The specification demands the use of "frozen" rules without explicitly defining the actual constants or formulas in the text.

## 7. Repository Evidence
- **Seed Data:** (`server/src/infrastructure/database/seed/run-seed.ts`) contains mock response candidates: `RESERVE_DRAWDOWN`, `ROUTE_OPTIMIZATION`, and `PROCUREMENT_SHIFT`.
- **Shared Types:** `ResponseType` and properties exist in entities but are merely data shapes.
- **Missing Domain:** There are no mathematical scoring implementations or candidate parameterization logic in the `engines/` directory.

## 8. What Is Explicitly Specified
- The existence of a `ResponseGenerator` engine that consumes a `ScenarioContext`, `SimulationResult`, and `ImpactAssessment`.
- The engine's output must be an array of `ResponseCandidate` objects.
- Candidates have conceptual categories (e.g., rerouting, reserve drawdown).

## 9. What Is NOT Specified
- **How** to determine which conceptual intervention applies to a specific scenario disruption.
- **Mathematical formulas** to calculate capacities, costs, or volumes for generated candidates.
- **Exact deterministic generation logic**, eligibility rules, or optimization criteria.
- **Mathematical scoring models** and exact frozen weights for dimensions.

## 10. Candidate Generation Analysis
A previous suggestion proposed hardcoding the following response candidates:
- `REROUTE`
- `ALTERNATIVE_SUPPLIER`
- `STRATEGIC_RESERVE`

**Are these explicitly source-supported?** 
**No.** While the concepts resemble the natural-language examples in the specification ("reroute supply", "activate alternate supplier", "use stored inventory"), the specific identifiers, parameters, and algorithms to apply them to an evaluation are completely omitted from the specification. Hardcoding these to pass the test would be an unauthorized invention of domain behavior, treating natural language examples as a rigorous mathematical specification.

## 11. Scoring / Ranking / Recommendation Analysis
The specification mandates using "frozen scoring dimensions and weights" and notes that "Tie-breaking rules must be deterministic. No randomness" and the recommendation engine "chooses the highest valid ranked response according to frozen rules."
However, the specification **does not define** the actual formulas, numerical weights, hard constraints, algorithmic ranking criteria, or optimization equations. 

## 12. Classification
**Classification: Specification / Product Gap**
The current behavior of `DeterministicResponseEngine` (returning an empty array) is strictly consistent with the phase instructions: do not invent domain algorithms. The authoritative source material states the expected I/O types but fails to provide the critical domain algorithms, selection rules, and scoring mathematics necessary to actually build the engine. Hardcoding candidates like `REROUTE` would amount to inventing production behavior to appease a QA test, which violates the strict Phase 11 acceptance rules. The blocked Golden Path is therefore an acceptance/specification gap, not a defect in the implementation.

## 13. Smallest Authorized Next Step
Because the behavior is not specified, **do NOT implement a fix**. 
The exact clarification required before implementation is:
1. A rigorous product/specification update providing the mathematical rules and parameter generation logic for generating `ResponseCandidate`s based on scenario shortfall.
2. The exact definitions for the "frozen scoring dimensions and weights".
3. The deterministic formulas used to score and rank those generated candidates.

Until the product owner defines these, no production code should be written.

## 14. Phase 11 Impact
The following QA acceptance criteria remain blocked by this specification gap:
- Golden Path: Compare Recommendations
- Golden Path: Human Decision (Accept/Modify/Reject)
- Golden Path: Audit Trail generation from decisions

## 15. Mutation Report
- **Files created:** `phase_11_defect3_specification_report.md`
- **Files modified:** None
- **Files deleted:** None
- **Dependencies installed:** None
- **Commits:** None
- **Pushes:** None
