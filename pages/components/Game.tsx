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
    loadSpriteTexture,
    changeSprite,
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
    onGameStart: async () => {
      const tilemapWidth = 320 / 16;
      const tilemapHeight = 180 / 16;
      await loadSpriteTexture("block");
      await loadSpriteTexture("player");
      await loadSpriteTexture("player_jump");
      await loadSpriteTexture("player_walk", 2);
      createTilemap(tilemapWidth, tilemapHeight).then((tilemap) => {
        if (!tilemap) return;
        for (let x = 0; x < tilemapWidth; x++) {
          for (let y = 8; y < tilemapHeight; y++) {
            createSprite("block").then((sprite) => {
              if (!sprite) return;
              tilemap.setTile(x, y, sprite);
            });
          }
        }
        createSprite("block").then((sprite) => {
          if (!sprite) return;
          tilemap.setTile(4, 7, sprite);
        });

        addObject(0, 0, "player", (objId, sprite) => {
          const speed = 1.5;
          const accel = 0.3;
          const gravity = 0.2;
          let x = 0;
          let y = 0;
          let hspeed = 0;
          let vspeed = 0;
          let key_left = false;
          let key_right = false;
          let key_jump = false;
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
                removeObject(objId);
              });
            },
            onStep: (ticker) => {
              const tile_meeting = (x: number, y: number, tilemap: Tilemap) => {
                const originalX = x;
                const originalY = y;

                x = x;
                y = y;

                const sprite_top = y;
                const sprite_bottom = y + sprite.height;
                const sprite_left = x;
                const sprite_right = x + sprite.width;

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

                x = originalX;
                y = originalY;

                return collision !== null;
              };

              const deltaTime = ticker.deltaTime;
              const key_sign = Number(key_right) - Number(key_left);
              const isGrounded = tile_meeting(x, y + 1, tilemap);

              if (key_sign !== 0 && isGrounded) {
                changeSprite(objId, "player_walk");
                sprite.scale.x = key_sign;
              } else if (isGrounded) {
                changeSprite(objId, "player");
              } else {
                changeSprite(objId, "player_jump");
              }
              hspeed = approach(hspeed, key_sign * speed, accel);
              vspeed += gravity;

              if (tile_meeting(x + hspeed, y, tilemap)) {
                let counter = 0;
                while (
                  !tile_meeting(x + Math.sign(hspeed), y, tilemap) &&
                  counter++ < 16
                ) {
                  x += Math.sign(hspeed);
                }
                x = Math.round(x / 16) * 16 - Math.sign(hspeed) * 0.1;
                hspeed = 0;
              }

              if (tile_meeting(x, y + vspeed, tilemap)) {
                let counter = 0;
                while (
                  !tile_meeting(x, y + Math.sign(vspeed), tilemap) &&
                  counter++ < 16
                ) {
                  y += Math.sign(vspeed);
                }
                y = Math.round(y / 16) * 16 - gravity;
                vspeed = 0;
              }

              if (isGrounded && key_jump) {
                vspeed = -3;
              }

              x += hspeed * deltaTime;
              y += vspeed * deltaTime;

              if (sprite.scale.x == 1) {
                sprite.position.x = x;
                sprite.position.y = y;
              } else {
                sprite.position.x = x + sprite.width;
                sprite.position.y = y;
              }
            },
          };
        });
      });
    },
  });

  return <div id="game-canvas"></div>;
}
