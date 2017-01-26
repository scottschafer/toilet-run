import { SpriteMap } from "./sprite-map";
import { CharacterMap } from "./character-map";
import { Sprite } from "./sprite";
import { Constants } from '../models/constants';
import { IMazeLevel } from "../IMazeLevel";

export class OtherSprite extends Sprite {

    public static readonly TYPE_TOILET:number = 0;
    public static readonly TYPE_PLUNGER:number = 1;
    public static readonly TYPE_TP:number = 2;
    public static readonly TYPE_SYMBOL:number = 3;
    public static readonly TYPE_CLOGGED_TOILET:number = 4;
    
    public static readonly WALK_UP:number = 8;
    public static readonly WALK_LEFT:number = 9;
    public static readonly WALK_DOWN:number = 10;
    public static readonly WALK_RIGHT:number = 11;
    public static readonly NUM_WALK_FRAMES:number = 9;

    static otherSpriteMap:SpriteMap = new SpriteMap('assets/others.png');

    targetX: number;
    targetY: number;
    scaling: number = .5;
    protected moveX: number;
    protected moveY: number;
    private counter: number = 0;

    constructor() {
        super();
    }

    static getSpriteMap():SpriteMap { return OtherSprite.otherSpriteMap; }

    draw(ctx: CanvasRenderingContext2D) {
        this.spriteMap = OtherSprite.otherSpriteMap;


        if (this.spriteMap) {
            super.draw(ctx, this.scaling);
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

        super.update(game);

        if (this.targetX != undefined) {
            var maxC = game.getGridSize() - 1;
            this.x = Math.min(maxC, Math.max(0, this.x + this.moveX));
            this.y = Math.min(maxC, Math.max(0, this.y + this.moveY));

            var xd:number = (this.targetX - this.x);
            var yd:number = (this.targetY - this.y);

            if ((xd * xd + yd * yd) < .001) {
                // we've arrived!
                this.x = this.targetX;
                this.y = this.targetY;
                this.frame = 0;
                this.targetX = this.targetY = undefined;
                this.onArrival(game);
            }            
        }
    }

    onArrival(game:IMazeLevel) {}
}
