import {
  Application,
  Assets,
  AnimatedSprite,
  Texture,
  Ticker,
  AnimatedSpriteFrames,
} from "pixi.js";
import { useEffect, useRef } from "react";
import { Tilemap } from "../classes/Tilemap";

interface GameObject {
  id: number;
  spriteName: string;
  sprite: AnimatedSprite;
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
  const gameSprites = useRef<{ [id: string]: Texture[] }>({});
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

  const createSprite = async (spriteName: string) => {
    const textures = gameSprites.current[spriteName];
    textures.forEach((texture) => {
      texture.source.scaleMode = "nearest";
    });
    const sprite = new AnimatedSprite(textures);
    sprite.texture.source.scaleMode = "nearest";
    return sprite;
  };

  const createTilemap = async (width: number, height: number) => {
    if (!game.current) return;
    const tilemap = new Tilemap(game.current, width, height);
    return tilemap;
  };

  const loadSpriteTexture = async (spriteName: string, frameCount?: number) => {
    if (!frameCount) {
      const texture = await Assets.load(`${spriteName}.png`);
      gameSprites.current[spriteName] = [texture];
      console.log(`Loaded sprite '${spriteName}':`, texture);
      return;
    }
    const textures = await Promise.all(
      Array.from({ length: frameCount }, (_, i) =>
        Assets.load(`${spriteName}${i + 1}.png`)
      ) as Promise<Texture>[]
    );
    gameSprites.current[spriteName] = textures;
    console.log(`Loaded ${spriteName}:`, textures);
  };

  const getSpriteTexture = (spriteName: string) => {
    return gameSprites.current[spriteName];
  };

  const addSprite = async (x: number, y: number, spriteName: string) => {
    const sprite = await createSprite(spriteName);
    sprite.position.x = x;
    sprite.position.y = y;
    game.current?.stage.addChild(sprite);
  };

  const changeSprite = (
    objId: number,
    spriteName: string,
    speed: number = 0.15
  ) => {
    const obj = getObject(objId);
    if (!obj) return;
    if (obj.spriteName === spriteName) return;
    const textures = getSpriteTexture(spriteName);
    const sprite = obj.sprite;
    textures.forEach((texture) => {
      texture.source.scaleMode = "nearest";
    });
    sprite.textures = textures;
    sprite.animationSpeed = speed;
    sprite.play();
    obj.spriteName = spriteName;
  };

  const addObject = async (
    x: number,
    y: number,
    spriteName: string,
    getOptions: (
      id: number,
      sprite: AnimatedSprite
    ) => {
      onCreate?: () => void;
      onStep?: (time: Ticker) => void;
    }
  ) => {
    if (!game.current) return;
    const objId = ++uniqueId.current;
    const sprite = await createSprite(spriteName);
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
      spriteName,
      sprite,
      onStep,
    });
    return uniqueId.current;
  };

  const getObject = (id: number) => {
    return gameObjects.current.find((obj) => obj.id === id);
  };

  const removeSprite = (sprite: AnimatedSprite) => {
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
    loadSpriteTexture,
    getSpriteTexture,
    addSprite,
    addObject,
    removeSprite,
    removeObject,
    createSprite,
    createTilemap,
    changeSprite,
    addKeyPressEvent,
    addKeyReleaseEvent,
    addKeyHoldEvent,
  };
};

export { useGameState };
