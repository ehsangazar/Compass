/**
 * Command Reference Utilities
 *
 * Utilities for transforming command references to tool-specific formats.
 */

/**
 * Transforms colon-based command references to hyphen-based format.
 * Converts `/compass:` patterns to `/compass-` for tools that use hyphen syntax.
 *
 * @param text - The text containing command references
 * @returns Text with command references transformed to hyphen format
 *
 * @example
 * transformToHyphenCommands('/compass:new') // returns '/compass-new'
 * transformToHyphenCommands('Use /compass:apply to implement') // returns 'Use /compass-apply to implement'
 */
export function transformToHyphenCommands(text: string): string {
  return text.replace(/\/compass:/g, '/compass-');
}
