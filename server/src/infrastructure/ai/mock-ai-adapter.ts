import { AIAnalysisInput, AIAnalysisOutput, AIAnalysisService } from '../../application/interfaces/ai-analysis.service.js';

export class MockAIAdapter implements AIAnalysisService {
  constructor(private apiKey: string) {
    if (!apiKey) {
      throw new Error('AI Provider Configuration Error: Missing API Key');
    }
  }

  async analyze(input: AIAnalysisInput): Promise<AIAnalysisOutput> {
    if (input.event.description === 'error-test') {
      throw new Error('Mock AI Provider Network Error');
    }

    if (input.event.description === 'malformed-test') {
      throw new Error('AI Provider Error: Malformed response from provider');
    }

    return {
      model_name: 'mock-ai-model',
      model_version: '1.0.0',
      structured_output: {
        severity: input.event.severity,
        summary: `Analyzed event ${input.event.id} with ${input.evidence.length} evidence items.`
      },
      confidence: 0.95
    };
  }
}
