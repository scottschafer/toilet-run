import { SpriteMap } from "./sprite-map";

export class CharacterMap extends SpriteMap{

    public static readonly ELEMENT_WIDTH:number = 64;
    public static readonly ELEMENT_HEIGHT:number = 64;
    public static readonly OFFSET_X:number = 0;
    public static readonly OFFSET_Y:number = 0;


    public static readonly DANCE:number = 14;
    public static readonly WALK_UP:number = 8;
    public static readonly WALK_LEFT:number = 9;
    public static readonly WALK_DOWN:number = 10;
    public static readonly WALK_RIGHT:number = 11;
    public static readonly NUM_WALK_FRAMES:number = 9;

    constructor( player:string = "boy") {
        var path = "assets/" + player + ".png";
        super(path, CharacterMap.ELEMENT_WIDTH, CharacterMap.ELEMENT_HEIGHT, CharacterMap.OFFSET_X, CharacterMap.OFFSET_Y);
    }

    drawFrame(ctx: CanvasRenderingContext2D, type:number, frame: number, destX: number, destY: number, scalingX:number = 1, scalingY:number = 1) {
        this.draw(ctx, frame, type, destX, destY, scalingX, scalingY);
    }
}
