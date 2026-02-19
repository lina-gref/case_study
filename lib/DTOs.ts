/**
 * ImageAssetDTO: Data Transfer Object pattern
 * 
 * Why serialize API responses?
 * - Validates that API response matches expected schema
 * - Catches breaking changes in backend immediately
 * - Makes test assertions type-safe
 * - Documents the contract: what shape should the image response have?
 * 
 * DTO Pattern means:
 * - Raw JSON response → transformed into strongly-typed object
 * - If backend removes "provider" field, serializer throws error
 * - Tests don't need to know JSON structure
 */

export interface ImageMetadata {
  width: number;
  height: number;
  quality: 'standard' | 'premium';
}

export interface ImageAssetData {
  id: string;
  url: string;
  provider: 'openai' | 'stability-ai' | 'midjourney';
  generationTime?: number;
  metadata?: ImageMetadata;
}

export class ImageAssetDTO {
  id: string;
  url: string;
  provider: 'openai' | 'stability-ai' | 'midjourney';
  generationTime: number;
  metadata: ImageMetadata;

  constructor(data: any) {
    /**
     * Serialization: Convert raw response to typed object
     * This constructor validates required fields
     */
    if (!data.id) throw new Error('ImageAsset missing required field: id');
    if (!data.url) throw new Error('ImageAsset missing required field: url');
    if (!data.provider) throw new Error('ImageAsset missing required field: provider');
    if (!['openai', 'stability-ai', 'midjourney'].includes(data.provider)) {
      throw new Error(`ImageAsset has invalid provider: ${data.provider}`);
    }

    this.id = data.id;
    this.url = data.url;
    this.provider = data.provider;
    this.generationTime = data.generationTime || 0;
    this.metadata = data.metadata || { width: 1024, height: 1024, quality: 'premium' };
  }

  /**
   * Validate that this image asset comes from an authorized backend provider
   * This prevents frontend code from accepting images from untrusted sources
   */
  isFromAuthorizedProvider(): boolean {
    const authorizedProviders = ['openai', 'stability-ai'];
    return authorizedProviders.includes(this.provider);
  }
}
