import type * as THREE from "three";

export type PlaneData = {
  id: string;
  position: THREE.Vector3;
  scale: THREE.Vector3;
  mediaIndex: number;
};

export type ChunkData = { key: string; cx: number; cy: number; cz: number };

export type CameraGridState = { cx: number; cy: number; cz: number; camZ: number };
