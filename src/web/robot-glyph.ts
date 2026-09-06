import type { Direction } from "../domain/index.ts";

// Toy robot glyph: rounded body/head, antenna + eyes mark the front.
// Facing NORTH = unrotated (front points up); other facings rotate the whole glyph.
export const ROBOT_SVG = `
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="52" r="45" fill="var(--panel)" opacity="0.9"/>
  <line x1="50" y1="18" x2="50" y2="4" stroke="var(--robot-body-dk)" stroke-width="4.5" stroke-linecap="round"/>
  <circle cx="50" cy="4" r="5" fill="var(--gold)"/>
  <rect x="16" y="18" width="68" height="66" rx="24" fill="var(--robot-body)" stroke="var(--robot-body-dk)" stroke-width="4"/>
  <circle cx="35" cy="44" r="7.5" fill="var(--robot-face)"/>
  <circle cx="65" cy="44" r="7.5" fill="var(--robot-face)"/>
  <circle cx="35" cy="44" r="3" fill="var(--robot-body-dk)"/>
  <circle cx="65" cy="44" r="3" fill="var(--robot-body-dk)"/>
  <rect x="38" y="58" width="24" height="5" rx="2.5" fill="var(--robot-face)" opacity="0.9"/>
  <circle cx="50" cy="74" r="6.5" fill="var(--gold)"/>
</svg>`;

export const ROTATION: Record<Direction, number> = {
  NORTH: 0,
  EAST: 90,
  SOUTH: 180,
  WEST: 270,
};
