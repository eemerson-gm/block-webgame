"use client";

import { Tilemap } from "../classes/Tilemap";
import { useGameState } from "./useGameState";

const approach = (start: number, end: number, amount: number) => {
  if (start < end) {
    return Math.min(start + amount, end);
  } else {
    return Math.max(start - amount, end);
  }
};

export default function Game() {
  const {
    createTilemap,
    createSprite,
    addObject,
    removeObject,
    addKeyHoldEvent,
    addKeyPressEvent,
  } = useGameState({
    viewWidth: 960,
    viewHeight: 540,
    stageWidth: 320,
    stageHeight: 180,
    onGameStart: () => {
      const tilemapWidth = 320 / 16;
      const tilemapHeight = 180 / 16;
      createTilemap(tilemapWidth, tilemapHeight).then((tilemap) => {
        if (!tilemap) return;
        for (let x = 0; x < tilemapWidth; x++) {
          for (let y = 8; y < tilemapHeight; y++) {
            createSprite("block.png").then((sprite) => {
              if (!sprite) return;
              tilemap.setTile(x, y, sprite);
            });
          }
        }

        addObject(0, 0, "frog.png", (id, sprite) => {
          const speed = 1;
          const accel = 0.3;
          let hspeed = 0;
          let vspeed = 0;
          let key_left = false;
          let key_right = false;
          let key_jump = false;
          let isGrounded = false;
          return {
            onCreate: () => {
              addKeyHoldEvent("a", (is_held) => {
                key_left = is_held;
              });
              addKeyHoldEvent("d", (is_held) => {
                key_right = is_held;
              });
              addKeyHoldEvent("w", (is_held) => {
                key_jump = is_held;
              });
              addKeyPressEvent("f", () => {
                removeObject(id);
              });
            },
            onStep: (ticker) => {
              const deltaTime = ticker.deltaTime;

              hspeed = approach(
                hspeed,
                (Number(key_right) - Number(key_left)) * speed,
                accel
              );

              const tile_meeting = (x: number, y: number, tilemap: Tilemap) => {
                const originalX = sprite.x;
                const originalY = sprite.y;

                sprite.x = x;
                sprite.y = y;

                const sprite_top = sprite.y;
                const sprite_bottom = sprite.y + sprite.height;
                const sprite_left = sprite.x;
                const sprite_right = sprite.x + sprite.width;

                const collision =
                  tilemap.getTile(
                    Math.floor(sprite_left / 16),
                    Math.floor(sprite_top / 16)
                  ) ||
                  tilemap.getTile(
                    Math.floor(sprite_right / 16),
                    Math.floor(sprite_top / 16)
                  ) ||
                  tilemap.getTile(
                    Math.floor(sprite_left / 16),
                    Math.floor(sprite_bottom / 16)
                  ) ||
                  tilemap.getTile(
                    Math.floor(sprite_right / 16),
                    Math.floor(sprite_bottom / 16)
                  );

                sprite.x = originalX;
                sprite.y = originalY;

                return collision !== null;
              };

              vspeed += 0.1;

              if (tile_meeting(sprite.x + hspeed, sprite.y, tilemap)) {
                let counter = 0;
                while (
                  !tile_meeting(
                    sprite.x + Math.sign(hspeed),
                    sprite.y,
                    tilemap
                  ) &&
                  counter++ < 16
                ) {
                  sprite.x += Math.sign(hspeed);
                }
                hspeed = 0;
              }

              if (tile_meeting(sprite.x, sprite.y + vspeed, tilemap)) {
                let counter = 0;
                while (
                  !tile_meeting(
                    sprite.x,
                    sprite.y + Math.sign(vspeed),
                    tilemap
                  ) &&
                  counter++ < 16
                ) {
                  sprite.y += Math.sign(vspeed);
                }
                vspeed = 0;
              }

              const isGrounded = tile_meeting(sprite.x, sprite.y + 1, tilemap);
              if (isGrounded && key_jump) {
                vspeed = -3;
              }

              sprite.x += hspeed * deltaTime;
              sprite.y += vspeed * deltaTime;
            },
          };
        });
      });
    },
  });

  return <div id="game-canvas"></div>;
}
