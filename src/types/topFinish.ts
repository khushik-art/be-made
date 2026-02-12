export interface TopFinishTextures {
  id: string;

  baseUrl: string; // top surface color
  mdfUrl: string; // MDF layer color

  normalUrl?: string;
  roughnessUrl?: string;
  metalnessUrl?: string;

  previewUrl?: string;
  sample_previewUrl?: string;
}
