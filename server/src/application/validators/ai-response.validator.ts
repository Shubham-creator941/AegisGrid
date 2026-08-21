import { AIAnalysisOutput } from '../interfaces/ai-analysis.service.js';
import { BusinessRuleError } from '../../domain/errors/index.js';

export class AIResponseValidator {
  /**
   * Validates the structural requirements of an AI response.
   * Throws BusinessRuleError if the response is invalid.
   * 
   * NOTE: We only validate what is explicitly supported by the domain contract.
   * Complex business rules, schema constraints, or specific confidence ranges 
   * are not enforced here because the authoritative PDF does not explicitly define them.
   */
  public static validate(response: any): asserts response is AIAnalysisOutput {
    if (!response || typeof response !== 'object') {
      throw new BusinessRuleError('INVALID_AI_RESPONSE', 'AI response must be an object');
    }

    if (typeof response.model_name !== 'string' || response.model_name.trim() === '') {
      throw new BusinessRuleError('INVALID_AI_RESPONSE', 'AI response must include a valid model_name string');
    }

    if (typeof response.model_version !== 'string' || response.model_version.trim() === '') {
      throw new BusinessRuleError('INVALID_AI_RESPONSE', 'AI response must include a valid model_version string');
    }

    if (response.structured_output === undefined || response.structured_output === null) {
      throw new BusinessRuleError('INVALID_AI_RESPONSE', 'AI response must include structured_output');
    }

    // Confidence representation/range is checked strictly for 'number' type. 
    // Range constraint (e.g., 0-1) is omitted as it is not explicitly defined by the PDF.
    if (typeof response.confidence !== 'number' || isNaN(response.confidence)) {
      throw new BusinessRuleError('INVALID_AI_RESPONSE', 'AI response must include a numeric confidence score');
    }
  }
}
