import * as Collections from 'typescript-collections';
import { SquareMazeGrid } from "../../../maze-generator-ts/src/Objects/SquareMazeGrid";

export abstract class SpriteModel {
    x: number;
    y: number;

    abstract draw(ctx: CanvasRenderingContext2D);
}
