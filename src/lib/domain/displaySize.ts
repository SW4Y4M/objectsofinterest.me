import type { DisplaySize } from "./wishlistObject";

export type DisplaySizeInput = {
  width: number;
  height: number;
  index: number;
};

export function chooseDisplaySize(input: DisplaySizeInput): DisplaySize {
  const { width, height, index } = input;
  const aspectRatio = width / Math.max(height, 1);
  const highResolution = width >= 1400 && height >= 1200;

  if (index < 2 && highResolution && aspectRatio >= 0.8 && aspectRatio <= 1.3) {
    return "feature";
  }

  if (aspectRatio >= 1.45) {
    return "wide";
  }

  if (aspectRatio <= 0.72) {
    return "tall";
  }

  return "standard";
}
