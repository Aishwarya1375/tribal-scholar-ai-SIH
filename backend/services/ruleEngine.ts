import { Scheme, Application, EligibilityResult, RuleEvaluationResult } from '../models/types.ts';

export function evaluateApplicationEligibility(
  scheme: Scheme,
  versionNumber: number,
  responses: Record<string, any>,
  uploadedDocumentsCount: number,
  requiredDocumentsCount: number
): EligibilityResult {
  const version = scheme.versions.find((v) => v.version === versionNumber) || scheme.versions[0];
  const rules = version.rules;

  const evaluations: RuleEvaluationResult[] = [];
  const issues: string[] = [];
  const explanation: string[] = [];

  let passedBlockingRules = 0;
  let totalBlockingRules = 0;
  let hasDeficiency = false;
  let hasCriticalFailure = false;

  // 1. Check document completeness
  if (uploadedDocumentsCount < requiredDocumentsCount) {
    hasDeficiency = true;
    issues.push(`Missing mandatory documents: ${uploadedDocumentsCount} of ${requiredDocumentsCount} uploaded.`);
    explanation.push(`Document requirement incomplete: ${requiredDocumentsCount - uploadedDocumentsCount} document(s) still required.`);
  }

  // 2. Evaluate configured scheme rules
  for (const rule of rules) {
    if (rule.severity === 'blocking') {
      totalBlockingRules++;
    }

    const actualValue = responses[rule.field];
    let passed = false;

    if (actualValue === undefined || actualValue === null || actualValue === '') {
      passed = false;
      evaluations.push({
        ruleCode: rule.ruleCode,
        title: rule.title,
        passed: false,
        status: rule.severity === 'blocking' ? 'failed' : 'warning',
        message: `Field '${rule.field}' is missing or not provided.`,
        field: rule.field,
        actualValue: 'Not provided',
        expectedValue: rule.targetValue
      });
      if (rule.severity === 'blocking') {
        hasDeficiency = true;
        issues.push(`Missing data for rule ${rule.ruleCode} (${rule.title}).`);
      }
      continue;
    }

    switch (rule.operator) {
      case 'eq':
        passed = actualValue === rule.targetValue;
        break;
      case 'gte':
        passed = Number(actualValue) >= Number(rule.targetValue);
        break;
      case 'lte':
        passed = Number(actualValue) <= Number(rule.targetValue);
        break;
      case 'in':
        passed = Array.isArray(rule.targetValue) && rule.targetValue.includes(actualValue);
        break;
      case 'exists':
        passed = Boolean(actualValue);
        break;
      default:
        passed = true;
    }

    if (passed) {
      if (rule.severity === 'blocking') {
        passedBlockingRules++;
      }
      evaluations.push({
        ruleCode: rule.ruleCode,
        title: rule.title,
        passed: true,
        status: 'passed',
        message: `Criterion fulfilled: ${rule.title} (Value: ${actualValue}).`,
        field: rule.field,
        actualValue,
        expectedValue: rule.targetValue
      });
    } else {
      if (rule.severity === 'blocking') {
        hasCriticalFailure = true;
      }
      evaluations.push({
        ruleCode: rule.ruleCode,
        title: rule.title,
        passed: false,
        status: rule.severity === 'blocking' ? 'failed' : 'warning',
        message: `Criterion not met: ${rule.title} (Actual: ${actualValue}, Required: ${rule.operator} ${rule.targetValue}).`,
        field: rule.field,
        actualValue,
        expectedValue: rule.targetValue
      });
      issues.push(`Rule ${rule.ruleCode} failed: ${rule.title}`);
    }
  }

  // Calculate composite readiness / eligibility percentage
  const totalRules = rules.length || 1;
  const passedTotal = evaluations.filter((e) => e.passed).length;
  const overallScore = Math.round(
    (passedTotal / totalRules) * 70 + (uploadedDocumentsCount / Math.max(requiredDocumentsCount, 1)) * 30
  );

  let status: 'Eligible' | 'Ineligible' | 'Deficient' | 'Manual Review' = 'Eligible';
  let recommendedAction = 'Application is eligible. Forward to Verification Officer for Scrutiny.';

  if (hasDeficiency && !hasCriticalFailure) {
    status = 'Deficient';
    recommendedAction = 'Raise deficiency notice to applicant for missing or incomplete requirements.';
  } else if (hasCriticalFailure) {
    status = 'Ineligible';
    recommendedAction = 'Does not satisfy mandatory scheme benchmarks. Scrutiny Officer manual review required before final rejection.';
  } else if (overallScore < 80) {
    status = 'Manual Review';
    recommendedAction = 'Borderline criteria fulfillment. Requires MoTA Officer scrutiny.';
  } else {
    status = 'Eligible';
    recommendedAction = 'Satisfies all configured scheme conditions. Forward to Scrutiny Officer.';
  }

  explanation.push(
    `Evaluated against ${rules.length} configured scheme rules under version ${version.version}.`,
    `${passedTotal} rules satisfied, ${issues.length} potential issues or remarks flagged.`
  );

  return {
    status,
    overallScore,
    evaluations,
    explanation,
    issues,
    recommendedAction,
    source: 'ai',
    calculatedAt: new Date().toISOString()
  };
}
