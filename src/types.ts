export const enum Role {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest',
  Developer = 'developer',
}

export type MeshInfoJson = {
  glbUrl: string;
  availableColors: string[];
};

export type MeshHighlightOptions = {
  highlight: {
    color: string;
    opacity: number;
  };
  selected: {
    color: string;
    opacity: number;
  };
  blinkSelection: {
    color: string;
    opacity: number;
    halfBlinkDuration: number; // in seconds
    delay: number; // in seconds
    blinks: number; // number of blinks
  };
};
export type MeshHighlights = keyof MeshHighlightOptions;
export type MeshHighlightSettings = {
  [k in MeshHighlights]: boolean;
};
