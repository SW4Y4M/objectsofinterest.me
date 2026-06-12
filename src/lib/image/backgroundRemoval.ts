import type { BackgroundRemovalProvider, BackgroundRemovalResult } from "./types";

export class FakeBackgroundRemovalProvider implements BackgroundRemovalProvider {
  async removeBackground(input: { url: string }): Promise<BackgroundRemovalResult> {
    return {
      processedUrl: input.url,
      width: 1400,
      height: 1200,
      quality: "usable"
    };
  }
}

export class HttpBackgroundRemovalProvider implements BackgroundRemovalProvider {
  constructor(private readonly endpoint: string, private readonly apiKey: string) {}

  async removeBackground(input: { url: string }): Promise<BackgroundRemovalResult> {
    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ imageUrl: input.url })
    });

    if (!response.ok) {
      return { processedUrl: input.url, width: 0, height: 0, quality: "poor" };
    }

    return (await response.json()) as BackgroundRemovalResult;
  }
}
