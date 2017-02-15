import { Inject } from '@angular/core';
import { SpriteMap } from "./sprite-map";
import { CharacterMap } from "./character-map";
import { Sprite } from "./sprite";
import { OtherSprite } from "./other-sprite";
import { AppState, AppStateService } from '../services/app-state-service';
import { AudioType, AudioService } from '../services/audio-service';
import { EventType, GameEvent, EventPublisherService } from '../services/event-publisher-service';
import { Constants } from '../constants';
import { IMazeLevel } from "../IMazeLevel";

@Inject(AppStateService)
export class PlayerSprite extends Sprite {

     targetX: number;
     targetY: number;
    private moveX: number;
    private moveY: number;
    private counter: number = 0;
    private bubbleFrame: number = 0;

    constructor(public appState:AppStateService,
        public audioService: AudioService,
        private eventPublisherService:EventPublisherService) {

        super();
    }

    draw(ctx: CanvasRenderingContext2D) {
        this.spriteMap = this.appState.character;

        if (! this.spriteMap) {
            this.spriteMap = new CharacterMap("boy");
        }

        if (this.spriteMap) {
            super.draw(ctx);
        }

        var dist = 15;
        var xOff = 20;
        var yOff = 35;
        var rotation = 0;
        switch (this.type) {
            case CharacterMap.WALK_LEFT:
                xOff = 30;
                yOff = 35;
                rotation = -Math.PI / 4;
                break;
            case CharacterMap.WALK_RIGHT:
                xOff = -5;
                yOff = 35;
                rotation = -Math.PI / 4;
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

        var otherMap:SpriteMap = OtherSprite.getSpriteMap();
        if (this.appState.hasTP || this.appState.hasPlunger) {
            var scaling:number = .35;
            var destX = this.x * 64 + xOff;
            var destY = this.y * 64 + yOff;
            
            ctx.save();
            ctx.translate(destX, destY);
            destX = destY = 0;
            ctx.rotate(rotation);

            otherMap.draw(ctx, this.appState.hasGoldenPlunger ? 1 : 0, this.appState.hasTP ? OtherSprite.TYPE_TP : OtherSprite.TYPE_PLUNGER,
                destX, destY, scaling, scaling);
            ctx.restore();
        }

        if (this.appState.msUntilSoapDone > 0) {
            var scaling:number = .6;
            var destX = this.x * 64 + ((this.type == CharacterMap.WALK_RIGHT) ? 10 : 10);
            var destY = this.y * 64 + 30;
            ctx.globalAlpha = Math.min(1.0, 2 * this.appState.msUntilSoapDone / Constants.MS_UNTIL_SOAP_WEARS_OFF);
            otherMap.draw(ctx, 3 + Math.floor(this.bubbleFrame) % 3, OtherSprite.TYPE_SOAP, destX, destY, scaling);
            ctx.globalAlpha = 1;
        }
    }

    go(x: number, y: number) {
        if (x == this.targetX && y == this.targetY) {
            return;
        }

        this.moveX = this.moveY = 0;
        var dist = 2 / (1000 / Constants.MS_PER_FRAME);

        if (this.appState.msUntilSoapDone > 0) {
            dist *= 1.5;
        }

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

        this.bubbleFrame += Constants.MS_PER_FRAME / 100;
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
                else {
                    if (game.canPlayerExit(this.x, this.y)) {
                        this.go(this.x + 1, this.y);
                    }                    
                }
            }            
        }

        // handle collision
        this.pickup(game);
        //this.handleCollision(game.getSpritesAtPosition(this.x, this.y), game);        
    }

    pickup(game:IMazeLevel) {
        this.handleCollision(game.getSpritesAtPosition(this.x, this.y), game, true);
    }

    handleCollision(sprites:Array<Sprite>, game:IMazeLevel, pickup? ) {
        sprites.forEach((sprite) => {
            if (sprite != this) {
                switch (sprite.type) {
                    case OtherSprite.TYPE_SOAP:
                        ++this.appState.numSoaps;
                        game.removeSprite(sprite);
                        this.eventPublisherService.emit(EventType.EVENT_USE_SOAP);                        
                        break;
                    case OtherSprite.TYPE_TP:
                        if (pickup)
                        if (! this.appState.hasTP && ! this.appState.hasPlunger && ! this.appState.justDropped) {
                            this.appState.hasTP = true;
                            game.removeSprite(sprite);
                        }
                        break;

                        case OtherSprite.TYPE_PLUNGER:
                        if (this.appState.hasTP) {
                            this.eventPublisherService.emit(EventType.EVENT_PICKUP_DROP);
                        }

                        if (pickup)
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
                                    this.audioService.playSoundEffect(AudioType.SFX_EXTRA_LIFE);
                                }
                                this.appState.score += 50;
                                this.appState.hasGoldenPlunger = false;
//                                game.createOtherSprite(OtherSprite.TYPE_TOILET, Math.round(sprite.x), Math.round(sprite.y));
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
                                
                                this.eventPublisherService.emit(EventType.EVENT_USE_TOILET);

                                // go to the bathroom
                                var goBathroomSprite:OtherSprite = game.createOtherSprite(OtherSprite.TYPE_SYMBOL, this.x, this.y, true);
                                goBathroomSprite.frame = Math.floor(Math.random() * 4);
                                goBathroomSprite.scaling = 1;
  
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
