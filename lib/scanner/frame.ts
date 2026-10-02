/** The image a code was read from (a camera frame or an uploaded picture), kept in memory only. */
export interface Point { x: number; y: number }
export interface DetectionFrame {
  /** data: or blob: URL of the image. Never stored or sent anywhere. */
  src: string;
  /** Size of the image the decoder saw; `points` are in this coordinate space. */
  width: number;
  height: number;
  /** Corners of the detected symbol (top-left, top-right, bottom-right, bottom-left), if the decoder reported them. */
  points: Point[] | null;
}

export function pointsOf(position: unknown): Point[] | null {
  const p = position as Record<string, Point | undefined> | null | undefined;
  const corners = [p?.topLeft, p?.topRight, p?.bottomRight, p?.bottomLeft];
  return corners.every((c) => c && Number.isFinite(c.x) && Number.isFinite(c.y)) ? (corners as Point[]) : null;
}
