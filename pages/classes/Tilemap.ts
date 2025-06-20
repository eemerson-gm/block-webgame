import { Application, AnimatedSprite } from "pixi.js";

export class Tilemap {
  game: Application;
  tiles: (AnimatedSprite | null)[][];

  constructor(game: Application, width: number, height: number) {
    this.game = game;
    this.tiles = Array.from({ length: width }, () =>
      Array.from({ length: height }, () => null)
    );
    console.log(this.tiles);
  }

  getTile(x: number, y: number) {
    if (x < 0 || x >= this.tiles.length || y < 0 || y >= this.tiles[0].length) {
      return null;
    }
    return this.tiles[x][y];
  }

  setTile(x: number, y: number, sprite: AnimatedSprite | null) {
    const spriteTile = this.tiles[x][y];
    if (spriteTile) {
      this.game.stage.removeChild(spriteTile);
      spriteTile.destroy();
    }
    if (sprite) {
      sprite.x = x * sprite.width;
      sprite.y = y * sprite.height;
      this.game.stage.addChild(sprite);
    }
    this.tiles[x][y] = sprite;
  }
}
