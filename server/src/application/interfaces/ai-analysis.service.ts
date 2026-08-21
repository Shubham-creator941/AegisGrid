import { Event, Evidence } from '../../domain/entities/index.js';

export interface AIAnalysisInput {
  event: Event;
  evidence: Evidence[];
}

export interface AIAnalysisOutput {
  model_name: string;
  model_version: string;
  structured_output: unknown;
  confidence: number;
}

export interface AIAnalysisService {
  analyze(input: AIAnalysisInput): Promise<AIAnalysisOutput>;
}
