
export enum AppStage {
  GATHERING = 'GATHERING',
  ANALYSIS = 'ANALYSIS',
  APPOINTMENT = 'APPOINTMENT',
  SYNTHESIS = 'SYNTHESIS'
}

export interface AgentData {
  agentName: string;
  currentBrokerage: string;
  closedVolume: string;
  closedUnits: string;
  listingsTaken: string;
  gci: string;
  commissionRate: string;
  buySideUnits: string;
  sellSideUnits: string;
  yearsInBusiness: string;
  primaryServiceArea: string;
  marketShare: string;
  averageDaysOnMarket: string;
  productionTrend: string;
}

export interface AnalysisResult {
  gapAnalysis: string;
  recruitingQuestions: string[];
}

export interface SynthesisResult {
  currentStructure: string;
  primaryGaps: string;
  breakthroughs: string;
  nextActions: string;
}

export interface Resource {
  title: string;
  url: string;
}
