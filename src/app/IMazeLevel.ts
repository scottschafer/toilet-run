import { Sprite } from "./sprites/sprite";
import { OtherSprite } from "./sprites/other-sprite";

export interface IMazeLevel {

  getGridSize():number;

  canPlayerExit(x, y): boolean;

  canMoveLeft(x, y):boolean;
  canMoveRight(x, y):boolean;
  canMoveUp(x, y):boolean;
  canMoveDown(x, y):boolean;

  getSpritesAtPosition(x, y, minDist?:number):Array<Sprite>;
  removeSprite(sprite:Sprite);
  createOtherSprite(type:number, x?:number, y?:number, onTop?:boolean):OtherSprite;    
};