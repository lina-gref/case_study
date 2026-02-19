import { Page } from '@playwright/test';

/**
 * ApiHub: Network request interception and analysis
 * 
 * Why intercept network?
 * - Measure exact API latency (not UI rendering time)
 * - Verify backend contract (response schema, status codes)
 * - Avoid timing-based assertions (flaky and unreliable)
 * - Decouple UI tests from API tests logically
 * 
 * Example benefit:
 * If the UI takes 300ms to render but API responds in 4800ms total,
 * we want to measure the API response time, not the rendering time.
 */

export class ApiHub {
  private requestTimings: Map<string, number> = new Map();

  setupInterception(page: Page) {
    /**
     * Listen to all network responses
     * Record timing for chat API endpoint
     */
    page.on('response', async (response) => {
      const url = response.url();

      // Intercept chat message API responses
      if (url.includes('/api/chat/messages')) {
        const timing = response.request().postDataBuffer ? response.timing()?.responseEnd : 0;
        this.requestTimings.set('chat_latency', timing || 0);
      }

      // Intercept image generation API responses
      if (url.includes('/api/images/generate')) {
        const timing = response.timing()?.responseEnd || 0;
        this.requestTimings.set('image_generation_latency', timing || 0);
      }
    });
  }

  /**
   * Get measured latency
   * Returns the time from request sent to response received (milliseconds)
   */
  getLatency(endpoint: string): number {
    return this.requestTimings.get(endpoint) || 0;
  }

  /**
   * Assert latency is within acceptable range
   * This is crucial for UX—slow APIs = frustrated users
   */
  assertLatencyWithin(endpoint: string, maxMs: number): void {
    const actual = this.getLatency(endpoint);
    if (actual > maxMs) {
      throw new Error(
        `[LATENCY SLA VIOLATION] Endpoint: ${endpoint} took ${actual}ms (max: ${maxMs}ms)`
      );
    }
  }
}
