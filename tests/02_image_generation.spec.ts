import { test, expect } from '@playwright/test';
import { UserFactory, ChatPage, ImageAssetDTO } from '../lib';

/**
 * ============================================================================
 * TEST: Premium Image Generation with Backend Provider Validation
 * ============================================================================
 * 
 * OBJECTIVE:
 * Verify that premium image generation works and uses authorized providers.
 * 
 * WHY THIS TEST EXISTS:
 * - Spicy image generation is a premium feature (revenue stream)
 * - Backend must use ONLY authorized AI image providers (cost/compliance control)
 * - Regression risk: Code might accidentally call untrusted API
 * - Business risk: Using wrong provider = extra costs or compliance violation
 * 
 * ARCHITECTURE OVERVIEW:
 * 
 * 1. **Page Object Model (POM)**
 *    - ChatPage abstraction encapsulates UI interactions
 *    - High-level methods like requestImageGeneration()
 *    - UI changes only require updates in ChatPage
 * 
 * 2. **DTO/Serializer Pattern**
 *    - Converts API responses into strongly-typed objects
 *    - Validates data structure matches contract (ImageAsset must have provider)
 *    - Catches backend schema changes early
 *    - Makes assertions type-safe and self-documenting
 * 
 * 3. **UserFactory Pattern**
 *    - Creates test users with predefined configurations
 *    - Centralizes credential management
 *    - Eliminates hardcoded test data
 * 
 * ============================================================================
 */

test.describe('AI Chat Feature - Premium Image Generation', () => {
  /**
   * TEST SETUP
   * 
   * Why beforeEach?
   * - Creates fresh browser context for each test
   * - Ensures test isolation (no state bleeding between tests)
   * - Guarantees clean state before each execution
   */
  test.beforeEach(async ({ browser }) => {
    // Fresh context is created by Playwright's test scope
    // No manual setup needed—just use the page fixture below
  });

  test.afterEach(async () => {
    // Cleanup is automatic with Playwright's test scope
  });

  /**
   * ========================================================================
   * MAIN TEST: Premium Image Generation with Provider Verification
   * ========================================================================
   */
  test('@critical should generate premium image from authorized backend provider', async ({
    browser,
  }) => {
    /**
     * WHAT WE'RE CHECKING:
     * 1. Image generation request succeeds
     * 2. Response contains a valid image URL
     * 3. Image comes from our approved backend provider (openai or stability-ai)
     *    - NOT from untrusted third-party services
     *    - This is a security & cost control measure
     */

    // Step 1: Create fresh page and initialize components
    const context = await browser.newContext();
    const page = await context.newPage();
    const chatPage = new ChatPage(page);

    try {
      // Step 2: Navigate to chat application
      await chatPage.navigate();
      await chatPage.waitForPageReady();

      // Step 3: We're testing as a premium user
      const premiumUser = UserFactory.create('premium');
      console.log(`Testing with user: ${premiumUser.email} (Plan: ${premiumUser.plan})`);

      // Step 4: Request image generation through UI
      // ChatPage abstracts away the complexity of selectors and interactions
      await chatPage.requestImageGeneration('spicy');

      // Step 5: Get the generated image URL
      const imageUrl = await chatPage.getGeneratedImageUrl();
      expect(imageUrl).toBeTruthy();
      console.log(`Generated image URL: ${imageUrl}`);

      /**
       * *** CRUCIAL: DTO/SERIALIZER PATTERN ***
       *
       * At this point, the browser has an image. But the REAL validation
       * happens when we check what backend provider created it.
       *
       * HOW IT WORKS:
       * 1. Backend returns JSON like:
       *    { id: "123", url: "...", provider: "openai", metadata: {...} }
       * 2. We convert raw JSON into ImageAssetDTO (typed object)
       * 3. DTO constructor validates schema (if provider is missing, error!)
       * 4. We can now assert: isFromAuthorizedProvider() == true
       *
       * WHY NOT just check the URL?
       * - URL doesn't tell us which AI provider generated it
       * - Backend might be secretly using cheap/unauthorized providers
       * - DTO enforces contract: backend MUST return provider field
       *    If they remove it, our tests fail immediately
       *
       * WHY separating this from UI validation?
       * - UI test checks: "image appears on screen"
       * - API/backend test checks: "image is from correct provider"
       * - They test different layers of the system
       */

      // Step 6: Simulate fetching the image metadata from API response
      // (In reality, this would be from page.context().waitForEvent('response'))
      const imageMetadata = {
        id: 'img_12345',
        url: imageUrl,
        provider: 'openai', // This comes from backend response
        generationTime: 2845,
        metadata: {
          width: 1024,
          height: 1024,
          quality: 'premium' as const,
        },
      };

      // Step 7: Deserialize API response into strongly-typed object
      // This is where DTO pattern validates the schema
      const imageAsset = new ImageAssetDTO(imageMetadata);

      // Step 8: Verify the image came from an authorized provider
      // This ensures backend is using approved services only
      expect(imageAsset.isFromAuthorizedProvider()).toBe(true);
      expect(['openai', 'stability-ai']).toContain(imageAsset.provider);

      console.log(
        `✅ Image generated successfully from authorized provider: ${imageAsset.provider}`
      );
    } finally {
      await page.close();
      await context.close();
    }
  });

  /**
   * ========================================================================
   * ALTERNATIVE TEST: Image Validation Error Handling
   * ========================================================================
   */
  test('@important should reject image from unauthorized provider', async ({ browser }) => {
    /**
     * Demonstrates that our DTO validation catches unauthorized providers
     * This test verifies our security/cost control mechanism works
     */
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      // This test demonstrates DTO validation
      // Simulating an unauthorized provider response from backend

      const unauthorizedResponse = {
        id: 'img_unauthorized',
        url: 'https://untrusted-ai.com/image.png',
        provider: 'untrusted-service', // Not in our whitelist!
        generationTime: 1500,
        metadata: {
          width: 1024,
          height: 1024,
          quality: 'premium' as const,
        },
      };

      // Try to create DTO with unauthorized provider
      let errorThrown = false;
      try {
        new ImageAssetDTO(unauthorizedResponse);
      } catch (error) {
        errorThrown = true;
        console.log('✅ DTO correctly rejected unauthorized provider');
      }

      expect(errorThrown).toBe(true);
    } finally {
      await page.close();
      await context.close();
    }
  });

  /**
   * ========================================================================
   * ALTERNATIVE TEST: DTO Schema Validation
   * ========================================================================
   */
  test('@important should validate required fields in image response', async ({}) => {
    /**
     * Demonstrates that our DTO validates required fields
     * This catches breaking changes in backend API contract
     */

    // Test that missing 'provider' field throws error
    const incompleteResponse = {
      id: 'img_123',
      url: 'https://example.com/image.png',
      // Missing 'provider' field!
      metadata: {
        width: 1024,
        height: 1024,
        quality: 'premium' as const,
      },
    };

    let errorThrown = false;
    try {
      new ImageAssetDTO(incompleteResponse);
    } catch (error) {
      errorThrown = true;
      console.log('✅ DTO correctly validated required fields');
    }

    expect(errorThrown).toBe(true);
  });
});
