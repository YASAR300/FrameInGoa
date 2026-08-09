/**
 * SSR-safe helper to convert Lucide SVG strings to preloaded HTMLImageElements for HTML5 Canvas 2D rendering.
 */

function createSvgImage(svgStr: string): HTMLImageElement | null {
  if (typeof window === "undefined") return null;
  const img = new Image();
  const encoded = encodeURIComponent(svgStr);
  img.src = `data:image/svg+xml;charset=utf-8,${encoded}`;
  return img;
}

let _userIcon: HTMLImageElement | null = null;
let _wrenchIcon: HTMLImageElement | null = null;
let _awardIcon: HTMLImageElement | null = null;
let _imagePlusIcon: HTMLImageElement | null = null;

export function getUserIconImg(): HTMLImageElement | null {
  if (!_userIcon) {
    _userIcon = createSvgImage(`
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1f0e06" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    `);
  }
  return _userIcon;
}

export function getWrenchIconImg(): HTMLImageElement | null {
  if (!_wrenchIcon) {
    _wrenchIcon = createSvgImage(`
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1f0e06" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
      </svg>
    `);
  }
  return _wrenchIcon;
}

export function getAwardIconImg(): HTMLImageElement | null {
  if (!_awardIcon) {
    _awardIcon = createSvgImage(`
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1f0e06" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="8" r="6"/>
        <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
      </svg>
    `);
  }
  return _awardIcon;
}

export function getImagePlusIconImg(): HTMLImageElement | null {
  if (!_imagePlusIcon) {
    _imagePlusIcon = createSvgImage(`
      <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"/>
        <line x1="16" x2="22" y1="5" y2="5"/>
        <line x1="19" x2="19" y1="2" y2="8"/>
        <circle cx="9" cy="9" r="2"/>
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
      </svg>
    `);
  }
  return _imagePlusIcon;
}
