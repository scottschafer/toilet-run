import { Inject } from '@angular/core';
import { SpriteMap } from "./sprite-map";
import { CharacterMap } from "./character-map";
import { Sprite } from "./sprite";
import { OtherSprite } from "./other-sprite";
import { AppState, AppStateService } from '../services/app-state-service';
import { Constants } from '../models/constants';
import { IMazeLevel } from "../IMazeLevel";

@Inject(AppStateService)
export class PlayerSprite extends Sprite {

     targetX: number;
     targetY: number;
    private moveX: number;
    private moveY: number;
    private counter: number = 0;

    constructor(public appState:AppStateService) {
        super();
    }

    draw(ctx: CanvasRenderingContext2D) {
        this.spriteMap = this.appState.character;

        var dist = 20;
        var xOff = 20;
        var yOff = 20;
        switch (this.type) {
            case CharacterMap.WALK_LEFT:
                xOff -= dist;
                break;
            case CharacterMap.WALK_RIGHT:
                xOff += dist;
                break;
            case CharacterMap.WALK_UP:
                yOff -= dist;
                xOff += dist;
                break;
            case CharacterMap.WALK_DOWN:
                yOff -= dist;
                xOff -= dist;
                break;
        }

        if (this.appState.hasTP || this.appState.hasPlunger) {
            var otherMap:SpriteMap = OtherSprite.getSpriteMap();
            var scaling:number = .35;
            var destX = this.x * 64 + xOff;
            var destY = this.y * 64 + yOff;
            
            otherMap.draw(ctx, this.appState.hasGoldenPlunger ? 1 : 0, this.appState.hasTP ? OtherSprite.TYPE_TP : OtherSprite.TYPE_PLUNGER,
                destX, destY, scaling, scaling);
        }
        if (! this.spriteMap) {
            this.spriteMap = new CharacterMap("boy");
        }

        if (this.spriteMap) {
            super.draw(ctx);
        }
    }

    go(x: number, y: number) {
        if (x == this.targetX && y == this.targetY) {
            return;
        }

        this.moveX = this.moveY = 0;
        var dist = 1.5 / (1000 / Constants.MS_PER_FRAME);

        if (x < this.x) {
            this.type = CharacterMap.WALK_LEFT;
            this.moveX = -dist;
        }
        else if (x > this.x) {
            this.type = CharacterMap.WALK_RIGHT;
            this.moveX = dist;
        }
        else if (y < this.y) {
            this.type = CharacterMap.WALK_UP;
            this.moveY = -dist;
        }
        else if (y > this.y) {
            this.type = CharacterMap.WALK_DOWN;
            this.moveY = dist;
        }
        this.targetX = x;
        this.targetY = y;
    }

    update(game:IMazeLevel) {

        if (this.targetX != undefined) {
            ++this.counter;
            if (this.counter & 1) {
                this.frame = (this.frame + 1) % CharacterMap.NUM_WALK_FRAMES;
            }
            var maxC = game.getGridSize() - 1;
            this.x = this.x + this.moveX;
            this.y = this.y + this.moveY;

            var xd:number = (this.targetX - this.x);
            var yd:number = (this.targetY - this.y);

            if ((xd * xd + yd * yd) < .001) {
                // we've arrived!
                this.appState.justDropped = false;
                this.x = this.targetX;
                this.y = this.targetY;
                this.frame = 0;
                this.targetX = this.targetY = undefined;

                var maxC = game.getGridSize();
                if (this.x < 0 || this.y < 0 || this.x >= maxC || this.y >= maxC) {
                    this.appState.state = AppState.GAME_NEXT_LEVEL;
                }
            }            
        }

        // handle collision
        this.pickup(game);
    }

    pickup(game:IMazeLevel) {
        this.handleCollision(game.getSpritesAtPosition(this.x, this.y), game);
    }

    handleCollision(sprites:Array<Sprite>, game:IMazeLevel ) {
        sprites.forEach((sprite) => {
            if (sprite != this) {
                switch (sprite.type) {
                    case OtherSprite.TYPE_TP:
                        if (! this.appState.hasTP && ! this.appState.hasPlunger && ! this.appState.justDropped) {
                            this.appState.hasTP = true;
                            game.removeSprite(sprite);
                        }
                        break;

                        case OtherSprite.TYPE_PLUNGER: 
                            if (! this.appState.hasTP && ! this.appState.hasPlunger && ! this.appState.justDropped) {
                                this.appState.hasPlunger = true;
                                this.appState.hasGoldenPlunger = sprite.frame > 0;
                                game.removeSprite(sprite);
                            }
                            break;

                        case OtherSprite.TYPE_CLOGGED_TOILET:
                            if (this.appState.hasPlunger) {
                                this.appState.hasPlunger = false;
                                if (this.appState.hasGoldenPlunger) {
                                    ++this.appState.numLives;
                                }
                                this.appState.score += 50;
                                this.appState.hasGoldenPlunger = false;
                                game.createOtherSprite(OtherSprite.TYPE_TOILET, sprite.x, sprite.y);
                                game.removeSprite(sprite);
                            }
                            else {
                                this.appState.state = AppState.GAME_LOST_LIFE_HIT_MONSTER;
                            }
                            break;

                        case OtherSprite.TYPE_TOILET:
                            if (this.appState.hasTP) {
                                this.appState.hasTP = false;
                                this.appState.lastBathroomBreak = new Date().getTime();

                                // go to the bathroom
                                var goBathroomSprite:OtherSprite = game.createOtherSprite(OtherSprite.TYPE_SYMBOL, this.x, this.y, true);
                                goBathroomSprite.frame = Math.floor(Math.random() * 4);
                                goBathroomSprite.scaling = 1;
                                this.appState.score += 10;

                                window.setTimeout(() => {
                                    game.removeSprite(goBathroomSprite);
                                }, 1000);

                            }
                            break;
                }
            }
        });
    }

}
