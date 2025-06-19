import { Application, Assets, Sprite, Texture, Ticker } from "pixi.js";
import { useEffect, useRef } from "react";
import { Tilemap } from "../classes/Tilemap";

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
  onGameStart?: (game: Application) => void;
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
    startGame()
      .then(() => {
        if (onGameStart && game.current) {
          onGameStart(game.current);
        }
      })
      .catch(console.error);
  }, [onGameStart, stageHeight, stageWidth, viewHeight, viewWidth]);

  const createSprite = async (spritePath: string) => {
    const texture = (await Assets.load(spritePath)) as Texture;
    const sprite = new Sprite(texture);
    sprite.texture.source.scaleMode = "nearest";
    return sprite;
  };

  const createTilemap = async (width: number, height: number) => {
    if (!game.current) return;
    const tilemap = new Tilemap(game.current, width, height);
    return tilemap;
  };

  const addSprite = async (x: number, y: number, spritePath: string) => {
    const sprite = await createSprite(spritePath);
    sprite.position.x = x;
    sprite.position.y = y;
    game.current?.stage.addChild(sprite);
  };

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
    const sprite = await createSprite(spritePath);
    sprite.position.x = x;
    sprite.position.y = y;
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

  const removeSprite = (sprite: Sprite) => {
    if (!game.current) return;
    game.current.stage.removeChild(sprite);
    sprite.destroy();
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
    addSprite,
    addObject,
    removeSprite,
    removeObject,
    createSprite,
    createTilemap,
    addKeyPressEvent,
    addKeyReleaseEvent,
    addKeyHoldEvent,
  };
};

export { useGameState };
