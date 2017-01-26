import { SpriteMap } from "./sprite-map";
import { GameComponent } from "../game/game.component";
import { IMazeLevel } from "../IMazeLevel";

export class Sprite {
    spriteMap: SpriteMap;
    public x: number = 0;
    public y: number = 0;
    public offsetX: number = 0;
    public offsetY: number = 0;

    type: number = 0;
    frame: number = 0;

    startFrame: number = 0;
    endFrame: number = 0;
    frameDirection: number = .2;

    draw(ctx: CanvasRenderingContext2D, scaling: number = 1) {
        var destX = this.x * 64 + (64 - 64 * scaling) / 2 + this.offsetX;
        var destY = this.y * 64 + (64 - 64 * scaling) / 2 + this.offsetY;
        
        this.spriteMap.draw(ctx, Math.floor(this.frame), this.type, destX, destY, scaling, scaling);
    }

    update(game:IMazeLevel) {
        if (this.startFrame != this.endFrame) {
            this.frame += this.frameDirection;
            if (this.frame < this.startFrame || this.frame >= (this.endFrame+1)) {
                this.frameDirection = - this.frameDirection;
                this.frame += this.frameDirection;
            }
        }
    }

}
