import * as THREE from "three";

const textureCache = new Map<string, THREE.Texture>();
const loadCallbacks = new Map<string, Set<(t: THREE.Texture) => void>>();
const loader = new THREE.TextureLoader();

const isLoaded = (tex: THREE.Texture) => {
  const img = tex.image as HTMLImageElement | undefined;
  return img instanceof HTMLImageElement && img.complete && img.naturalWidth > 0;
};

export function getTexture(url: string, onLoad?: (t: THREE.Texture) => void): THREE.Texture {
  const existing = textureCache.get(url);
  if (existing) {
    if (onLoad) {
      if (isLoaded(existing)) onLoad(existing);
      else loadCallbacks.get(url)?.add(onLoad);
    }
    return existing;
  }
  const callbacks = new Set<(t: THREE.Texture) => void>();
  if (onLoad) callbacks.add(onLoad);
  loadCallbacks.set(url, callbacks);
  const texture = loader.load(url, (tex) => {
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = true;
    tex.anisotropy = 4;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    loadCallbacks.get(url)?.forEach((cb) => cb(tex));
    loadCallbacks.delete(url);
  });
  textureCache.set(url, texture);
  return texture;
}
