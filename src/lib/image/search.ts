import type { ImageCandidate, ImageSearchProvider } from "./types";

export function pickBestCandidate(candidates: ImageCandidate[]): ImageCandidate | null {
  return [...candidates]
    .filter((candidate) => candidate.width >= 500 && candidate.height >= 500)
    .sort((left, right) => right.score - left.score)[0] ?? null;
}

export class FakeImageSearchProvider implements ImageSearchProvider {
  async search(query: string): Promise<ImageCandidate[]> {
    const encoded = encodeURIComponent(query.toLowerCase().replace(/\s+/g, "-"));
    return [
      {
        url: `https://images.example.com/${encoded}.png`,
        width: 1400,
        height: 1200,
        score: 0.9,
        provider: "fake-search"
      }
    ];
  }
}

export class HttpImageSearchProvider implements ImageSearchProvider {
  constructor(private readonly endpoint: string, private readonly apiKey: string) {}

  async search(query: string): Promise<ImageCandidate[]> {
    const response = await fetch(`${this.endpoint}?q=${encodeURIComponent(query)}`, {
      headers: { Authorization: `Bearer ${this.apiKey}` }
    });

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as { images?: ImageCandidate[] };
    return payload.images ?? [];
  }
}
