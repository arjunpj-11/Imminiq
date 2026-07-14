import type { ProfileUploadKind } from '../../domain/uploads.types';

export interface IAIUploadPromptBuilder {
  buildPrompt(kind: ProfileUploadKind, prompt: string): string;
}

export class AIUploadPromptBuilder implements IAIUploadPromptBuilder {
  buildPrompt(kind: ProfileUploadKind, prompt: string): string {
    return kind === 'avatar' ? this.buildAvatarPrompt(prompt) : this.buildBannerPrompt(prompt);
  }

  private buildAvatarPrompt(prompt: string): string {
    return `
Create a clean, high-quality profile avatar.
Subject instructions: ${prompt}.
Style: centered portrait, clear face or character focus, polished digital illustration,
professional profile picture composition, balanced lighting, simple background,
no text, no watermark, no logo, square-friendly framing.
`.trim();
  }

  private buildBannerPrompt(prompt: string): string {
    return `
Create a premium, high-quality profile banner background.
Subject instructions: ${prompt}.
Composition: cinematic wide-profile cover style, visually rich but not cluttered,
important visual elements placed near the center so the image can be cropped into a horizontal banner,
balanced spacing on the left and right side.
Style: polished digital artwork, elegant lighting, detailed background, premium visual quality,
no text, no letters, no watermark, no logo, no UI elements.
`.trim();
  }
}
