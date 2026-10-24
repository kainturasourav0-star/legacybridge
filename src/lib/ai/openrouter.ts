import { logger } from '@/lib/logger';

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  retries?: number;
}

export interface OpenRouterCompletionResult {
  text: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  simulated: boolean;
}

export class OpenRouterProvider {
  private apiKey?: string;
  private defaultModel: string;
  private appUrl: string;

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY;
    this.defaultModel = process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet';
    this.appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://legacybridge.vercel.app';
  }

  /**
   * Generates completions via OpenRouter with bounded retries, timeout, and structured error handling.
   * If credentials are not configured, falls back to a deterministic local response.
   */
  async complete(
    messages: OpenRouterMessage[],
    options: OpenRouterCompletionOptions = {}
  ): Promise<OpenRouterCompletionResult> {
    const model = options.model || this.defaultModel;
    const temperature = options.temperature ?? 0.2;
    const maxTokens = options.maxTokens ?? 1500;
    const timeoutMs = options.timeoutMs ?? 15_000;
    const maxRetries = options.retries ?? 2;

    if (!this.apiKey || this.apiKey.includes('placeholder') || this.apiKey.includes('sample')) {
      logger.info('OpenRouter API key not configured or in demo mode. Returning deterministic response.', { model });
      return {
        text: this.getDeterministicFallback(messages),
        model: `${model} (deterministic-fallback)`,
        simulated: true,
      };
    }

    let attempt = 0;
    while (attempt <= maxRetries) {
      attempt++;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
            'HTTP-Referer': this.appUrl,
            'X-Title': 'LegacyBridge Modernization Platform',
          },
          body: JSON.stringify({
            model,
            messages,
            temperature,
            max_tokens: maxTokens,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          const errText = await res.text().catch(() => '');
          logger.warn(`OpenRouter API request failed with status ${res.status}`, { status: res.status });
          if (attempt > maxRetries) {
            throw new Error(`OpenRouter API error: ${res.status} ${errText}`);
          }
          await new Promise((r) => setTimeout(r, attempt * 1000));
          continue;
        }

        const data = await res.json();
        const output = data.choices?.[0]?.message?.content || '';

        return {
          text: output,
          model: data.model || model,
          usage: data.usage ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          } : undefined,
          simulated: false,
        };
      } catch (err: any) {
        clearTimeout(timeoutId);
        if (attempt > maxRetries) {
          logger.error('OpenRouter request failed after maximum retries. Using deterministic fallback.', { error: err.message });
          return {
            text: this.getDeterministicFallback(messages),
            model: `${model} (offline-fallback)`,
            simulated: true,
          };
        }
        await new Promise((r) => setTimeout(r, attempt * 1000));
      }
    }

    return {
      text: this.getDeterministicFallback(messages),
      model: `${model} (fallback)`,
      simulated: true,
    };
  }

  private getDeterministicFallback(messages: OpenRouterMessage[]): string {
    const userPrompt = messages.find((m) => m.role === 'user')?.content || '';
    if (userPrompt.toLowerCase().includes('stock') || userPrompt.toLowerCase().includes('drift')) {
      return JSON.stringify({
        rule: 'Stock Verification Check',
        originalBehavior: 'Hard rejection when stock < qty',
        modernBehavior: 'Log warning when stock < qty (Drift detected)',
        recommendation: 'Restore if (stock < qty) return reject("INSUFFICIENT_STOCK")',
      }, null, 2);
    }
    return JSON.stringify({
      status: 'analyzed',
      summary: 'Legacy monolith successfully decomposed into 4 bounded contexts: Customer, Order, Inventory, Payment.',
      confidence: 0.98,
      recommendedPhase: 'Phase 1: Inventory Extraction via Strangler Fig',
    }, null, 2);
  }
}

export const openRouterProvider = new OpenRouterProvider();
