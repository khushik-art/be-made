import * as THREE from 'three';

import { ChairLayoutParams, ChairLayoutResult } from '../../types/chairs';

/* =========================
   Public API
========================= */

const MM_TO_M = 0.001;

export class ChairLayout {
  static getLayout(params: ChairLayoutParams): ChairLayoutResult {
    const { topShape, length, width, count } = params;

    // 🔥 convert mm → meters
    const L = length * MM_TO_M;
    const W = width * MM_TO_M;

    switch (topShape) {
      case 'rectangle':
      case 'oblong':
        return layoutRectangular(L, W, count);

      case 'round':
        return layoutCircular(L, count);

      case 'oval':
        return layoutEllipse(L, W, count);

      case 'capsule':
        return layoutRectangular(L, W, count);

      case 'square':
        return layoutSquare(L, count);
    }
  }
}

/* =========================
   Shape helpers
========================= */

/* =========================
   Rectangular layout
========================= */

function layoutRectangular(
  length: number,
  width: number,
  count: number,
): ChairLayoutResult {
  const result: ChairLayoutResult = [];

  const halfL = length / 2;
  const halfW = width / 2;
  const offset = 0.15;

  const capped = Math.min(count, 12);

  // Determine if we need end chairs
  const hasEnds = capped >= 4;

  // Chairs on long sides
  const longSideTotal = hasEnds ? capped - 2 : capped;
  const perLongSide = longSideTotal / 2;

  // ---- FRONT (grow from center) ----
  for (let i = 0; i < perLongSide; i++) {
    const t = (i + 1) / (perLongSide + 1);

    result.push({
      position: new THREE.Vector3(lerp(-halfL, halfL, t), 0, halfW + offset),
      rotation: new THREE.Euler(0, Math.PI, 0),
    });
  }

  // ---- BACK ----
  for (let i = 0; i < perLongSide; i++) {
    const t = (i + 1) / (perLongSide + 1);

    result.push({
      position: new THREE.Vector3(lerp(-halfL, halfL, t), 0, -(halfW + offset)),
      rotation: new THREE.Euler(0, 0, 0),
    });
  }

  // ---- END PAIR (only when count >= 10) ----
  if (hasEnds) {
    result.push({
      position: new THREE.Vector3(-(halfL + offset), 0, 0),
      rotation: new THREE.Euler(0, Math.PI / 2, 0),
    });

    result.push({
      position: new THREE.Vector3(halfL + offset, 0, 0),
      rotation: new THREE.Euler(0, -Math.PI / 2, 0),
    });
  }

  return result;
}

/* =========================
   Circular / Oval / 
========================= */

function layoutCircular(diameter: number, count: number): ChairLayoutResult {
  const result: ChairLayoutResult = [];
  const capped = Math.min(count, 8);
  const offset = 0.25;
  const radius = diameter / 2 + offset;

  for (let i = 0; i < capped; i++) {
    const angle = (i / capped) * Math.PI * 2;
    const positionAngle = Math.atan2(
      -(Math.sin(angle) * radius),
      -(Math.cos(angle) * radius),
    );

    // console.log('Position:', hello);

    result.push({
      position: new THREE.Vector3(
        Math.sin(angle) * radius,
        0,
        Math.cos(angle) * radius,
      ),
      rotation: new THREE.Euler(0, positionAngle, 0),
    });
  }

  return result;
}

// Ellipse

function layoutEllipse(
  length: number,
  width: number,
  count: number,
): ChairLayoutResult {
  const result: ChairLayoutResult = [];

  const offset = 0.37;

  const a = length / 2 + offset;
  const b = width / 2 + offset;

  const segments = 720; // higher = smoother accuracy

  // 1️⃣ Sample ellipse perimeter
  const points: THREE.Vector2[] = [];
  const cumulative: number[] = [];

  let totalLength = 0;
  let prev = new THREE.Vector2(a, 0);

  cumulative.push(0);

  for (let i = 1; i <= segments; i++) {
    const t = (i / segments) * Math.PI * 2;

    const p = new THREE.Vector2(Math.cos(t) * a, Math.sin(t) * b);

    totalLength += p.distanceTo(prev);
    cumulative.push(totalLength);
    points.push(p);

    prev = p;
  }

  // 2️⃣ Evenly distribute by arc length
  for (let i = 0; i < count; i++) {
    const targetLength = ((i + 0.5) / count) * totalLength;

    // find segment
    let index = 0;
    while (cumulative[index] < targetLength) index++;

    const point = points[index];

    // direction toward center
    const angle = Math.atan2(-point.x, -point.y);

    result.push({
      position: new THREE.Vector3(point.x, 0, point.y),
      rotation: new THREE.Euler(0, angle, 0),
    });
  }

  return result;
}

// Capsule

function layoutSquare(size: number, count: number): ChairLayoutResult {
  const result: ChairLayoutResult = [];

  const half = size / 2;
  const offset = 0.15;

  const capped = Math.min(count, 8);

  let front = 0;
  let back = 0;
  let left = 0;
  let right = 0;

  if (capped === 2) {
    front = 1;
    back = 1;
  }

  if (capped === 4) {
    front = 1;
    back = 1;
    left = 1;
    right = 1;
  }

  if (capped === 6) {
    front = 2;
    back = 2;
    left = 1;
    right = 1;
  }

  if (capped === 8) {
    front = 2;
    back = 2;
    left = 2;
    right = 2;
  }

  const spacing = size / 4;

  // ---- FRONT ----
  for (let i = 0; i < front; i++) {
    const index = i - (front - 1) / 2;
    result.push({
      position: new THREE.Vector3(index * (spacing + 0.3), 0, half + offset),
      rotation: new THREE.Euler(0, Math.PI, 0),
    });
  }

  // ---- BACK ----
  for (let i = 0; i < back; i++) {
    const index = i - (back - 1) / 2;
    result.push({
      position: new THREE.Vector3(index * (spacing + 0.3), 0, -(half + offset)),
      rotation: new THREE.Euler(0, 0, 0),
    });
  }

  // ---- LEFT ----
  for (let i = 0; i < left; i++) {
    const index = i - (left - 1) / 2;
    result.push({
      position: new THREE.Vector3(-(half + offset), 0, index * (spacing + 0.3)),
      rotation: new THREE.Euler(0, Math.PI / 2, 0),
    });
  }

  // ---- RIGHT ----
  for (let i = 0; i < right; i++) {
    const index = i - (right - 1) / 2;
    result.push({
      position: new THREE.Vector3(half + offset, 0, index * (spacing + 0.3)),
      rotation: new THREE.Euler(0, -Math.PI / 2, 0),
    });
  }

  return result;
}

/* =========================
   Utils
========================= */

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
