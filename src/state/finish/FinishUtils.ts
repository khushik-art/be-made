// FinishUtils.ts
import * as THREE from 'three';

const textureLoader = new THREE.TextureLoader();
const textureCache = new Map<string, THREE.Texture>();
const texturePromiseCache = new Map<string, Promise<THREE.Texture>>();

export function loadTexture(
  url?: string,
  options?: {
    srgb?: boolean;
    repeat?: [number, number];
  },
): THREE.Texture | null {
  if (!url) return null;

  if (textureCache.has(url)) {
    return textureCache.get(url)!;
  }

  const texture = textureLoader.load(url);
  texture.flipY = false;

  if (options?.srgb) {
    texture.colorSpace = THREE.SRGBColorSpace;
  }

  if (options?.repeat) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(options.repeat[0], options.repeat[1]);
  }

  texture.anisotropy = 16;

  textureCache.set(url, texture);
  return texture;
}

export async function loadTextureAsync(
  url?: string,
  options?: {
    srgb?: boolean;
    repeat?: [number, number];
  },
): Promise<THREE.Texture | null> {
  if (!url) return null;

  if (textureCache.has(url)) {
    return textureCache.get(url)!;
  }

  if (!texturePromiseCache.has(url)) {
    texturePromiseCache.set(
      url,
      textureLoader.loadAsync(url).then((texture) => {
        texture.flipY = false;
        texture.anisotropy = 16;
        textureCache.set(url, texture);
        texturePromiseCache.delete(url);
        return texture;
      }),
    );
  }

  let texture: THREE.Texture | null = null;
  try {
    texture = await texturePromiseCache.get(url)!;
  } catch {
    texturePromiseCache.delete(url);
    return null;
  }

  if (!texture) return null;

  if (options?.srgb) {
    texture.colorSpace = THREE.SRGBColorSpace;
  }

  if (options?.repeat) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(options.repeat[0], options.repeat[1]);
  }

  return texture;
}

export function disposeMaterial(material: THREE.Material) {
  material.dispose();
}
