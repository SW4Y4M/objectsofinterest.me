export type MockImageSpec = {
  label: string;
  tone: string;
  width: number;
  height: number;
};

export function createMockImageDataUrl({ label, tone, width, height }: MockImageSpec) {
  const safeLabel = label.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const radius = Math.max(18, Math.round(Math.min(width, height) * 0.06));
  const border = Math.max(20, Math.round(Math.min(width, height) * 0.03));
  const accent = Math.max(16, Math.round(Math.min(width, height) * 0.22));
  const fontSize = Math.max(28, Math.round(Math.min(width, height) * 0.11));

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
      <rect width="${width}" height="${height}" fill="#f6f1ea" />
      <rect x="${border}" y="${border}" width="${width - border * 2}" height="${height - border * 2}" rx="${radius}" fill="${tone}" opacity="0.18" />
      <circle cx="${Math.round(width * 0.7)}" cy="${Math.round(height * 0.35)}" r="${accent}" fill="#111111" opacity="0.08" />
      <path d="M ${Math.round(width * 0.18)} ${Math.round(height * 0.76)} C ${Math.round(width * 0.34)} ${Math.round(height * 0.55)} ${Math.round(width * 0.66)} ${Math.round(height * 0.55)} ${Math.round(width * 0.82)} ${Math.round(height * 0.76)}" fill="none" stroke="#111111" stroke-opacity="0.1" stroke-width="${Math.max(10, Math.round(Math.min(width, height) * 0.02))}" stroke-linecap="round" />
      <text x="${Math.round(width * 0.1)}" y="${Math.round(height * 0.88)}" font-family="Inter, ui-sans-serif, system-ui, sans-serif" font-size="${fontSize}" font-weight="600" letter-spacing="0" fill="#111111" fill-opacity="0.6">${safeLabel}</text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}
