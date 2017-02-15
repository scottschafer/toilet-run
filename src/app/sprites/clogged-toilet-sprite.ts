import { SpriteMap } from "./sprite-map";
import { CharacterMap } from "./character-map";
import { Sprite } from "./sprite";
import { OtherSprite } from "./other-sprite";
import { AppState, AppStateService } from '../services/app-state-service';

import { Constants } from '../constants';
import { IMazeLevel } from "../IMazeLevel";

export class CloggedToiletSprite extends OtherSprite {

    direction:number = 1;

    constructor(
        public appState: AppStateService
    ) {
        super();
        this.startFrame = 0;
        this.endFrame = 2;

    }

    update(game:IMazeLevel) {
        super.update(game);

        this.setFrameLimits();

        if (this.targetX === undefined) {
            this.onArrival(game);
        }
    }

    go(x:number, y:number) {
        this.moveX = (x - this.x) / 30;
        this.moveY = (y - this.y) / 30;
        this.targetX = x;
        this.targetY = y;
    }

    onArrival(game:IMazeLevel) {


        if (this.direction == 1) {
            if (game.canMoveRight(this.x, this.y)) {
                this.go(this.x + 1, this.y);
            }
            else {
                if (game.canMoveLeft(this.x, this.y)) {
                    this.direction = -1;
                    this.go(this.x - 1, this.y);
                }
            }
        }
        else {
            if (game.canMoveLeft(this.x, this.y)) {
                this.go(this.x - 1, this.y);
            }
            else {
                if (game.canMoveRight(this.x, this.y)) {
                    this.direction = 1;
                    this.go(this.x + 1, this.y);
                }
            }
        }

        this.setFrameLimits();
    }

    setFrameLimits() {
        this.startFrame = (this.direction == -1) ? 0 : 3;
        this.endFrame = (this.direction == -1) ? 2 : 5;

        if (!this.appState.hasPlunger && ! this.appState.hasGoldenPlunger) {
            this.startFrame += 6;
            this.endFrame += 6;
        }

        if (this.frame < this.startFrame || this.frame > this.endFrame) {
            this.frame = this.startFrame;
        }
    }

}
