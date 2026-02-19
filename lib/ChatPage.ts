import { Page } from '@playwright/test';

/**
 * ChatPage: Page Object Model for AI Chat UI
 * 
 * Why POM?
 * - Encapsulates all UI interactions in one place
 * - Tests never directly reference selectors
 * - If the UI team changes the button from class="send-btn" to id="submit",
 *   we only update this file—no test code changes
 * - Promotes "What to do" (sendMessage) over "How to do it" (click that button)
 */

export class ChatPage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('/chat');
    await this.page.waitForLoadState('networkidle');
  }

  async waitForPageReady() {
    /**
     * Explicit wait for chat interface to be ready
     * Avoids race conditions and flaky tests
     */
    await this.page.waitForSelector('[data-testid="chat-input"]', {
      state: 'visible',
      timeout: 8000,
    });
  }

  async sendMessage(message: string): Promise<void> {
    /**
     * High-level action: Send a message
     * Hides the complexity of locators and interactions
     */
    const chatInput = this.page.locator('[data-testid="chat-input"]');
    const sendButton = this.page.locator('[data-testid="chat-send-button"]');

    await chatInput.fill(message);
    await sendButton.click();
  }

  async getLastMessage(): Promise<string> {
    /**
     * Retrieve the last AI response from chat
     * Returns clean text for assertion
     */
    const lastMessage = this.page.locator('[data-testid="chat-message-ai"]:last-child');
    await lastMessage.waitFor({ state: 'visible', timeout: 10000 });
    return await lastMessage.textContent() || '';
  }

  async requestImageGeneration(imageType: string): Promise<void> {
    /**
     * High-level action: Request image generation
     * Specific to premium feature
     */
    const generateButton = this.page.locator('[data-testid="generate-image-button"]');
    const typeSelector = this.page.locator('[data-testid="image-type-selector"]');

    await typeSelector.selectOption(imageType);
    await generateButton.click();
  }

  async getGeneratedImageUrl(): Promise<string | null> {
    /**
     * Retrieve the generated image URL from the UI
     * Used for verification and backend validation
     */
    const imageElement = this.page.locator('[data-testid="generated-image"]:last-child');
    await imageElement.waitFor({ state: 'visible', timeout: 15000 });
    return await imageElement.getAttribute('src');
  }
}
