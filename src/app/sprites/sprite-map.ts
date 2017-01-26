export class SpriteMap {
    private image:HTMLImageElement;

    constructor(imagePath:string, 
        private elementWidth: number = 64,
        private elementHeight: number = 64,
        private offsetX: number = 0,
        private offsetY: number = 0) {

        this.image = new Image();
        this.image.onload = function() {
        }

        this.image.src = imagePath;
    }

    draw(ctx: CanvasRenderingContext2D, elemX:number, elemY:number, destX: number, destY: number, scalingX:number = 1, scalingY:number = 1) {
        var sourceX = elemX * this.elementWidth + this.offsetX;
        var sourceY = elemY * this.elementHeight + this.offsetY;
        var sourceWidth =  this.elementWidth;
        var sourceHeight =  this.elementHeight;
        var destWidth = this.elementWidth * scalingX;
        var destHeight = this.elementHeight * scalingX;
        //var destX = canvas.width / 2 - destWidth / 2;
        //var destY = canvas.height / 2 - destHeight / 2;

        ctx.drawImage(this.image, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight);
    }

}
