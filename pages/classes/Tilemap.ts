import { Sprite } from "pixi.js";

export class Tilemap {
  tiles: (Sprite | null)[][];

  constructor(width: number, height: number) {
    this.tiles = Array.from({ length: width }, () =>
      new Array(height).fill(null)
    );
  }

  setTile(x: number, y: number, sprite: Sprite | null) {
    const tile = this.tiles[x][y];
    if (!tile && sprite) {
      this.tiles[x][y] = sprite;
    } else {
      tile?.destroy();
    }
  }
}
