export type AppStep =
  | "idle"
  | "uploading"
  | "decoding"
  | "adjusting"
  | "customising"
  | "rendering"
  | "ready"
  | "sharing";

export type OutputFormat = "card" | "frame";

export type CardVariant = "signboard" | "ticket" | "notice";
export type FrameVariant = "sunburst" | "checker" | "azulejo" | "arc";

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
  zoom: number;
}

export interface CardConfig {
  name: string;
  stack: string;
  title: string;
  badgeNumber: string;
  /**
   * Usage Note TIP — Builder Card:
   * Social handle dynamically inserted into the blank zone on the card
   * (e.g. "@yasar247"). Use HTML Canvas to slot this into the design.
   */
  socialHandle: string;
  variant: CardVariant;
  rerollNonce: number;
}

export interface FrameConfig {
  variant: FrameVariant;
  thickness: "subtle" | "bold";
  showBottomArc: boolean;
}

export interface AppState {
  step: AppStep;
  format: OutputFormat;
  rawFile: File | null;
  dataUrl: string | null;
  imageBitmap: ImageBitmap | null;
  crop: CropArea;
  cardConfig: CardConfig;
  frameConfig: FrameConfig;
  errorMessage: string | null;
  renderedBlob: Blob | null;
  renderedDataUrl: string | null;
  shareUrl: string | null;
  aiBackgroundDataUrl: string | null;
}

export const INITIAL_CROP: CropArea = {
  x: 0,
  y: 0,
  width: 100,
  height: 100,
  zoom: 1,
};

export const INITIAL_STATE: AppState = {
  step: "idle",
  format: "card",
  rawFile: null,
  dataUrl: null,
  imageBitmap: null,
  crop: INITIAL_CROP,
  aiBackgroundDataUrl: null,
  cardConfig: {
    name: "Aditya Roy",
    stack: "Full-Stack AI",
    title: "Signal Over Noise",
    badgeNumber: "#247-0412",
    socialHandle: "@builder",
    variant: "ticket",
    rerollNonce: 0,
  },
  frameConfig: {
    variant: "sunburst",
    thickness: "bold",
    showBottomArc: true,
  },
  errorMessage: null,
  renderedBlob: null,
  renderedDataUrl: null,
  shareUrl: null,
};

export function isValidTransition(from: AppStep, to: AppStep): boolean {
  const allowedMap: Record<AppStep, AppStep[]> = {
    idle: ["uploading", "decoding"],
    uploading: ["decoding", "idle", "adjusting"],
    decoding: ["adjusting", "idle"],
    adjusting: ["customising", "idle"],
    customising: ["rendering", "adjusting", "idle"],
    rendering: ["ready", "customising", "idle"],
    ready: ["sharing", "rendering", "customising", "idle"],
    sharing: ["ready", "customising", "idle"],
  };

  return allowedMap[from]?.includes(to) ?? false;
}
