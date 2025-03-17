import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

export interface LLMConfig {
  model: string;
  temperature?: number;
  maxTokens?: number;
  stop?: string[];
}

export interface LLMResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export class LLMService {
  private openai: OpenAI;
  private anthropic: Anthropic;

  constructor() {
    // 初始化 OpenAI 客户端
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // 初始化 Anthropic 客户端
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  private isAnthropicModel(model: string): boolean {
    return model.startsWith('claude-');
  }

  private isOpenAIModel(model: string): boolean {
    return model.startsWith('gpt-') || model === 'text-davinci-003';
  }

  async generateCompletion(prompt: string, config: LLMConfig): Promise<LLMResponse> {
    try {
      if (this.isOpenAIModel(config.model)) {
        // 使用 OpenAI API
        const response = await this.openai.chat.completions.create({
          model: config.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: config.temperature,
          max_tokens: config.maxTokens,
          stop: config.stop,
        });

        return {
          content: response.choices[0]?.message?.content || '',
          model: config.model,
          usage: {
            promptTokens: response.usage?.prompt_tokens || 0,
            completionTokens: response.usage?.completion_tokens || 0,
            totalTokens: response.usage?.total_tokens || 0,
          },
        };
      } else if (this.isAnthropicModel(config.model)) {
        // 使用 Anthropic API
        const response = await this.anthropic.messages.create({
          model: config.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: config.temperature ?? 0.7,
          max_tokens: config.maxTokens ?? 4096,
          stop_sequences: config.stop,
        });

        const content = response.content.find(block => 'text' in block)?.text || '';

        return {
          content,
          model: config.model,
          // Anthropic 目前不提供 token 使用统计
        };
      } else {
        throw new Error(`不支持的模型: ${config.model}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`LLM 调用失败: ${error.message}`);
      }
      throw error;
    }
  }
} 