import { db } from '../config/db.ts';
import { Application, Scheme } from '../models/types.ts';

export interface RankedApplication {
  application: Application;
  calculatedScore: number;
  breakdown: {
    academicPoints: number;
    incomePoints: number;
    eligibilityBonus: number;
  };
  rank: number;
  recommendation: string;
}

export function generateSelectionRanking(schemeCode: 'NFST' | 'NOS'): RankedApplication[] {
  const scheme = db.schemes.find((s) => s.code === schemeCode);
  const version = scheme?.versions[0];
  const criteria = version?.selectionCriteria || { academicWeight: 60, incomeWeight: 40 };

  const eligibleApps = db.applications.filter(
    (a) => a.schemeCode === schemeCode && ['under_scrutiny', 'verified', 'shortlisted', 'selected'].includes(a.status)
  );

  const scored = eligibleApps.map((app) => {
    const academicPct = Number(app.responses.postGradPercentage || app.responses.qualifyingPercentage || 60);
    const familyIncome = Number(app.responses.familyAnnualIncome || 400000);

    // Academic score scaled to weight
    const academicPoints = Math.round((academicPct / 100) * criteria.academicWeight);

    // Income score (lower income = higher social support priority)
    // Up to 300,000 gets full points; up to 600,000 gets scaled points
    const incomeRatio = Math.max(0, 1 - (familyIncome - 100000) / 500000);
    const incomePoints = Math.round(incomeRatio * criteria.incomeWeight);

    const eligibilityBonus = app.eligibilityResult?.overallScore ? Math.round(app.eligibilityResult.overallScore * 0.1) : 5;

    const totalScore = Math.min(100, academicPoints + incomePoints + eligibilityBonus);

    return {
      application: app,
      calculatedScore: totalScore,
      breakdown: {
        academicPoints,
        incomePoints,
        eligibilityBonus
      },
      rank: 0,
      recommendation: totalScore >= 75 ? 'Recommended for Selection' : 'Waitlisted for Committee Scrutiny'
    };
  });

  scored.sort((a, b) => b.calculatedScore - a.calculatedScore);

  return scored.map((item, index) => ({
    ...item,
    rank: index + 1
  }));
}
