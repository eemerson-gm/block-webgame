import { Application, Assets, Sprite, Texture, Ticker } from "pixi.js";
import { useEffect, useRef } from "react";

interface GameObject {
  id: number;
  sprite: Sprite;
  onStep: ((time: Ticker) => void) | undefined;
}

interface useGameStateProps {
  viewWidth: number;
  viewHeight: number;
  stageWidth: number;
  stageHeight: number;
  onGameStart?: () => void;
}

const useGameState = ({
  viewWidth,
  viewHeight,
  stageWidth,
  stageHeight,
  onGameStart,
}: useGameStateProps) => {
  const uniqueId = useRef<number>(0);
  const game = useRef<Application>(null);
  const gameObjects = useRef<GameObject[]>([]);
  useEffect(() => {
    const startGame = async () => {
      game.current = new Application();

      await game.current.init({
        background: "#1099bb",
        width: viewWidth,
        height: viewHeight,
      });
      game.current.stage.scale.x = viewWidth / stageWidth;
      game.current.stage.scale.y = viewHeight / stageHeight;
      document.getElementById("game-canvas")?.appendChild(game.current.canvas);
    };
    startGame().then(onGameStart).catch(console.error);
  }, [onGameStart, stageHeight, stageWidth, viewHeight, viewWidth]);

  const addObject = async (
    x: number,
    y: number,
    spritePath: string,
    getOptions: (
      id: number,
      sprite: Sprite
    ) => {
      onCreate?: () => void;
      onStep?: (time: Ticker) => void;
    }
  ) => {
    if (!game.current) return;
    const objId = ++uniqueId.current;
    const texture = (await Assets.load(spritePath)) as Texture;
    const sprite = new Sprite(texture);
    sprite.position.x = x;
    sprite.position.y = y;
    sprite.texture.source.scaleMode = "nearest";
    game.current?.stage.addChild(sprite);
    const { onCreate, onStep } = getOptions(objId, sprite);
    if (onCreate) {
      onCreate();
    }
    if (onStep) {
      game.current?.ticker?.add(onStep);
    }
    gameObjects.current.push({
      id: objId,
      sprite,
      onStep,
    });
    return uniqueId.current;
  };

  const removeObject = (id: number) => {
    const obj = gameObjects.current.find(({ id: objId }) => objId === id);
    if (obj) {
      game.current?.stage.removeChild(obj.sprite);
      obj.sprite.destroy();
      if (obj.onStep) {
        game.current?.ticker.remove(obj.onStep);
      }
    }
  };

  const addKeyPressEvent = (key: string, callback: () => void) => {
    window.addEventListener("keypress", (event) => {
      if (event.key === key) {
        callback();
      }
    });
  };

  const addKeyReleaseEvent = (key: string, callback: () => void) => {
    window.addEventListener("keyup", (event) => {
      if (event.key === key) {
        callback();
      }
    });
  };

  const addKeyHoldEvent = (
    key: string,
    callback: (is_held: boolean) => void
  ) => {
    addKeyPressEvent(key, () => {
      callback(true);
    });
    addKeyReleaseEvent(key, () => {
      callback(false);
    });
  };

  return {
    addObject,
    removeObject,
    addKeyPressEvent,
    addKeyReleaseEvent,
    addKeyHoldEvent,
  };
};

export { useGameState };
