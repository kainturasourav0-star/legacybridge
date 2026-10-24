import { logger } from '@/lib/logger';

export interface NvidiaNimMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface NvidiaNimCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
}

export interface NvidiaNimCompletionResult {
  text: string;
  model: string;
  provider: 'nvidia-nim';
  simulated: boolean;
}

export class NvidiaNimProvider {
  private apiKey?: string;
  private defaultModel: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.NVIDIA_API_KEY;
    this.defaultModel = process.env.NVIDIA_MODEL || 'deepseek-ai/deepseek-v4.1-flash';
    this.baseUrl = (process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1').replace(/\/+$/, '');
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && !this.apiKey.includes('placeholder') && this.apiKey.startsWith('nvapi-'));
  }

  async complete(
    messages: NvidiaNimMessage[],
    options: NvidiaNimCompletionOptions = {}
  ): Promise<NvidiaNimCompletionResult> {
    const model = options.model || this.defaultModel;
    const temperature = options.temperature ?? 0.2;
    const maxTokens = options.maxTokens ?? 1000;
    const timeoutMs = options.timeoutMs ?? 15_000;

    if (!this.isConfigured()) {
      logger.info('NVIDIA NIM API key not configured. Using deterministic fallback.', { model });
      return {
        text: '{"status": "simulated", "strategy": "deterministic_fallback"}',
        model: `${model} (simulated)`,
        provider: 'nvidia-nim',
        simulated: true,
      };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`NVIDIA API HTTP error ${res.status}: ${await res.text()}`);
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || '';

      return {
        text: content,
        model,
        provider: 'nvidia-nim',
        simulated: false,
      };
    } catch (err: any) {
      logger.warn('NVIDIA NIM call failed. Returning resilient fallback.', { error: err.message });
      return {
        text: '{"status": "fallback", "strategy": "resilient_heuristic"}',
        model: `${model} (fallback)`,
        provider: 'nvidia-nim',
        simulated: true,
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

export const nvidiaNimProvider = new NvidiaNimProvider();
