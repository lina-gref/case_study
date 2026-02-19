/**
 * lib/index.ts - Centralized exports for the testing library
 * 
 * This file re-exports all components, allowing cleaner imports in test files:
 * 
 * Instead of:
 *   import { UserFactory } from '../lib/UserFactory';
 *   import { ChatPage } from '../lib/ChatPage';
 *   import { ApiHub } from '../lib/ApiHub';
 *   import { ImageAssetDTO } from '../lib/DTOs';
 * 
 * You can now write:
 *   import { UserFactory, ChatPage, ApiHub, ImageAssetDTO } from '../lib';
 */

export { UserFactory, type TestUser } from './UserFactory';
export { ChatPage } from './ChatPage';
export { ApiHub } from './ApiHub';
export { ImageAssetDTO, type ImageAssetData, type ImageMetadata } from './DTOs';
