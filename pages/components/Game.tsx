"use client";

import { clamp } from "lodash";
import { useGameState } from "./useGameState";

const approach = (start: number, end: number, amount: number) => {
  if (start < end) {
    return Math.min(start + amount, end);
  } else {
    return Math.max(start - amount, end);
  }
};

export default function Game() {
  const { addObject, removeObject, addKeyHoldEvent, addKeyPressEvent } =
    useGameState({
      viewWidth: 960,
      viewHeight: 540,
      stageWidth: 320,
      stageHeight: 180,
      onGameStart: () => {
        addObject(0, 0, "/test_block.png", (id, sprite) => {
          const speed = 1;
          const accel = 0.3;
          let hspeed = 0;
          let vspeed = 0;
          let key_up = false;
          let key_down = false;
          let key_left = false;
          let key_right = false;
          return {
            onCreate: () => {
              addKeyHoldEvent("w", (is_held) => {
                key_up = is_held;
              });
              addKeyHoldEvent("s", (is_held) => {
                key_down = is_held;
              });
              addKeyHoldEvent("a", (is_held) => {
                key_left = is_held;
              });
              addKeyHoldEvent("d", (is_held) => {
                key_right = is_held;
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
              vspeed = approach(
                vspeed,
                (Number(key_down) - Number(key_up)) * speed,
                accel
              );

              sprite.x += hspeed * deltaTime;
              sprite.y += vspeed * deltaTime;
            },
          };
        });
      },
    });

  return <div id="game-canvas"></div>;
}
