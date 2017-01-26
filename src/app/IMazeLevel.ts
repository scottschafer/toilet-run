import { Sprite } from "./sprites/sprite";
import { OtherSprite } from "./sprites/other-sprite";

export interface IMazeLevel {

  getGridSize():number;

  canMoveLeft(x, y):boolean;
  canMoveRight(x, y):boolean;
  canMoveUp(x, y):boolean;
  canMoveDown(x, y):boolean;

  getSpritesAtPosition(x, y):Array<Sprite>;
  removeSprite(sprite:Sprite);
  createOtherSprite(type:number, x?:number, y?:number, onTop?:boolean):OtherSprite;    
};