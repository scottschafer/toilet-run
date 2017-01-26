import { SpriteMap } from "./sprite-map";
import { CharacterMap } from "./character-map";
import { Sprite } from "./sprite";
import { OtherSprite } from "./other-sprite";

import { Constants } from '../models/constants';
import { IMazeLevel } from "../IMazeLevel";

export class CloggedToiletSprite extends OtherSprite {

    direction:number = 1;

    constructor() {
        super();
        this.startFrame = 0;
        this.endFrame = 2;

    }

    update(game:IMazeLevel) {
        super.update(game);

        if (this.targetX === undefined) {
            this.onArrival(game);
        }
    }

    go(x:number, y:number) {
        this.moveX = (x - this.x) / 50;
        this.moveY = (y - this.y) / 50;
        this.targetX = x;
        this.targetY = y;
    }

    onArrival(game:IMazeLevel) {

        if (this.direction == 1) {
            if (game.canMoveRight(this.x, this.y)) {
                this.go(this.x + 1, this.y);
            }
            else {
                this.direction = -1;
                if (game.canMoveLeft(this.x, this.y)) {
                    this.go(this.x - 1, this.y);
                }
            }
        }
        else {
            if (game.canMoveLeft(this.x, this.y)) {
                this.go(this.x - 1, this.y);
            }
            else {
                this.direction = 1;
                if (game.canMoveRight(this.x, this.y)) {
                    this.go(this.x + 1, this.y);
                }
            }
        }

        this.startFrame = (this.direction == -1) ? 0 : 3;
        this.endFrame = (this.direction == -1) ? 2 : 5;

        if (this.frame < this.startFrame || this.frame > this.endFrame) {
            this.frame = this.startFrame;
        }

    }

}
