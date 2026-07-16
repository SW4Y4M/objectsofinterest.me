import * as THREE from "three";
import { CHUNK_SIZE } from "./constants";
import type { PlaneData } from "./types";

function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const cache = new Map<string, PlaneData[]>();
const MAX_CACHE = 256;

function generate(cx: number, cy: number, cz: number): PlaneData[] {
  const planes: PlaneData[] = [];
  const seed = hashString(`${cx},${cy},${cz}`);
  for (let i = 0; i < 9; i++) {
    const s = seed + i * 1000;
    const r = (n: number) => seededRandom(s + n);
    const size = 12 + r(4) * 8;
    planes.push({
      id: `${cx}-${cy}-${cz}-${i}`,
      position: new THREE.Vector3(
        cx * CHUNK_SIZE + (r(0) - 0.5) * CHUNK_SIZE,
        cy * CHUNK_SIZE + (r(1) - 0.5) * CHUNK_SIZE,
        cz * CHUNK_SIZE + (r(2) - 0.5) * CHUNK_SIZE
      ),
      scale: new THREE.Vector3(size, size, 1),
      mediaIndex: Math.floor(r(5) * 1_000_000)
    });
  }
  return planes;
}

export function getChunkPlanes(cx: number, cy: number, cz: number): PlaneData[] {
  const key = `${cx},${cy},${cz}`;
  const hit = cache.get(key);
  if (hit) {
    cache.delete(key);
    cache.set(key, hit);
    return hit;
  }
  const planes = generate(cx, cy, cz);
  cache.set(key, planes);
  while (cache.size > MAX_CACHE) {
    const first = cache.keys().next().value as string | undefined;
    if (!first) break;
    cache.delete(first);
  }
  return planes;
}
