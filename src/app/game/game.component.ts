import { Component, OnInit, ElementRef, ComponentRef, Input, Inject } from '@angular/core';
import { CharacterMap } from "../sprites/character-map";
import { AppState, AppStateService } from '../services/app-state-service';
import { SquareMazeGrid, SquareWall } from "../../../maze-generator-ts/src/Objects/SquareMazeGrid";
import { MazeCell, MazeGrid } from "../../../maze-generator-ts/src/Objects/MazeGrid";
import { Constants } from '../models/constants';
import { Sprite } from "../sprites/sprite";
import { PlayerSprite } from "../sprites/player-sprite";
import { OtherSprite } from "../sprites/other-sprite";
import { CloggedToiletSprite } from "../sprites/clogged-toilet-sprite";
import { GaugeSegment, GaugeLabel } from 'ng2-kw-gauge';
import { IMazeLevel } from "../IMazeLevel";
import { PseudoRandom } from "../../../maze-generator-ts/src/Helpers/PseudoRandom";
declare var $:any;

@Component({
  selector: 'game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
@Inject(AppStateService)
export class GameComponent implements OnInit, IMazeLevel {

  private readonly WIDTH: number = 1000;
  private readonly HEIGHT: number = 1000;
  private readonly PADDING: number = 10;

  maze:SquareMazeGrid;

  private canvas:HTMLCanvasElement;
  private wallsCanvas:HTMLCanvasElement;
  private characterMap:CharacterMap;
  
  private gridSize:number;

  private state:AppState;
  private canvasScaling: number;
  private spriteScaling: number;
  
  private sprites: Array<Sprite>;
  public player: PlayerSprite;

  private mousedown: boolean = false;
  private mouseTargetX: number;
  private mouseTargetY: number;
  private backgroundImage:HTMLImageElement;

  private keyDown:Array<boolean> = new Array(256);

  private random:PseudoRandom = new PseudoRandom();
  private numCloggedToilets: number;

  event:MouseEvent;

  constructor(private elementRef: ElementRef,
    public appState:AppStateService) { }

  getGridSize():number {
    return this.gridSize;
  }

  ngOnInit() {
    $(window).mouseup(() => {
      this.mousedown = false;
    })

    $(window).keydown((e) => {
      this.keyDown[e.keyCode] = true;
    })

    $(window).keyup((e) => {
      this.keyDown[e.keyCode] = false;
    })

    this.backgroundImage = new Image();
    this.backgroundImage.src = "assets/tiles.jpg";

    this.characterMap = new CharacterMap();

    this.canvas = $(this.elementRef.nativeElement).find('.game-view')[0];//('.off-screen-canvas')[0];
    this.wallsCanvas = $(this.elementRef.nativeElement).find('.offscreen-walls')[0];//('.off-screen-canvas')[0];

    setInterval(() => {
      if (this.state == AppState.GAME_IN_PROGRESS) {
        this.updateScreen();
      }
    }, Constants.MS_PER_FRAME);
  }

  ngDoCheck() {

    switch(this.appState.state) {
      case AppState.GAME_STARTING:
        this.initGame();
        this.appState.state = AppState.GAME_IN_PROGRESS;
        break;
      
      case AppState.GAME_NEXT_LEVEL:
        this.nextLevel();
        this.appState.state = AppState.GAME_IN_PROGRESS;
        break;

      case AppState.GAME_LOST_LIFE_POOPED_PANTS:
        this.appState.state = AppState.GAME_PAUSED;
        debugger;
        window.setTimeout(() => {
          --this.appState.levelNumber;
          this.appState.state = AppState.GAME_NEXT_LEVEL;
        }, 2000);
    }

    this.state = this.appState.state;

    var parent = $(this.elementRef.nativeElement).parent();

    var w:number = parent.width(); 
    var h:number = parent.height();

    if (w && h) {
      w -= 20;
      h -= 20;
    }

    var dim = w = h = Math.min(w, h);

    this.canvasScaling = dim / 1000;
    $(this.canvas).css({width: (dim + 'px'), height: (dim + 'px')}); 
    $(this.canvas).css({width: (dim + 'px'), height: (dim + 'px')}); 
  }

  initGame() {
    this.appState.levelNumber = 0;
    this.nextLevel();
  }

// this is woefully inefficient, but it probably doesn't matter here
  getSpritesAtPosition(x, y):Array<Sprite>  {
    var result:Array<Sprite> = new Array<Sprite>();
    this.sprites.forEach((sprite) => {
      if (Math.floor(sprite.x) == x && Math.floor(sprite.y) == y) {
        result.push(sprite);
      }
    });

    return result;
  }

  createOtherSprite(type:number, x?:number, y?:number,onTop?:boolean):OtherSprite {

    if (x === undefined) {
      while (true) {
        x = Math.floor(this.random.nextDouble() * this.gridSize);
        y = Math.floor(this.random.nextDouble() * this.gridSize);

        if (this.getSpritesAtPosition(x,y).length == 0) {
          break;
        }
      }
    }

    var sprite:OtherSprite;
    
    switch (type) {
      default:
        sprite = new OtherSprite();
        break;

      case OtherSprite.TYPE_CLOGGED_TOILET:
        sprite = new CloggedToiletSprite();
        break;
    }
    sprite.type = type;
    sprite.x = x;
    sprite.y = y;
    if (onTop) {
      this.sprites.unshift(sprite);
    }
    else {
      this.sprites.push(sprite);
    }
    return sprite;
  }

  removeSprite(sprite:Sprite) {
    var i:number = this.sprites.indexOf(sprite);
    this.sprites.splice(i, 1);

    if (sprite.type == OtherSprite.TYPE_CLOGGED_TOILET) {
      --this.numCloggedToilets;
      if (this.numCloggedToilets == 0) {
        // all clogged toilets are gone, so open exit
        for (var i = 0; i < 4; i++) {
          this.maze.endCell.removeWall(i);
        }
        
        this.renderWalls();
      }
    }
  }  

  nextLevel() {
    ++this.appState.levelNumber;
    this.appState.lastBathroomBreak = new Date().getTime();

    this.gridSize = 5 + this.appState.levelNumber * 2;
    this.maze = SquareMazeGrid.generate(this.gridSize, this.gridSize);
    while (! this.maze.iterate() ){}

    this.spriteScaling = (1000 - this.PADDING * 2) / (this.gridSize * 64); 


    for (var i = 0; i < 4; i++) {
      this.maze.startCell.removeWall(i);
    }

    // remove some random walls
    for (var x = 0; x < this.gridSize; x++) {
      for (var y = 0; y < this.gridSize; y++) {
        var cell:MazeCell = this.maze.getCell(x,y);

        if ((x > 0) && (y > 0) && (x < (this.gridSize-1)) && (y < (this.gridSize-1)) ) {
          var wallCount;
          wallCount = 0; 
          for (i = 0; i < 4; i++) {
            wallCount += cell.hasWall(i) ? 1 : 0;
          }
          if (wallCount >= 3) {
            var removeWall = Math.floor(this.random.nextDouble() * 4);
            cell.removeWall(removeWall); 
            switch (removeWall) {
              case SquareWall.Left:
                this.maze.getCell(x-1, y).removeWall(SquareWall.Right);
                break;
              case SquareWall.Right:
                this.maze.getCell(x+1, y).removeWall(SquareWall.Left);
                break;
              case SquareWall.Top:
                this.maze.getCell(x, y-1).removeWall(SquareWall.Bottom);
                break;
              case SquareWall.Bottom:
                this.maze.getCell(x, y+1).removeWall(SquareWall.Top);
                break;
            }
          }
        }
      }
    }

    this.renderWalls();


    // initialize player
    this.player = new PlayerSprite(this.appState);
    this.player.x = this.maze.startCell.xPos;
    this.player.y = this.maze.startCell.yPos;
    this.player.type = CharacterMap.WALK_RIGHT;
    this.sprites = [
      this.player
    ]

      var numRegularToilets = 2;
      var numCloggedToilets = 2;
    this.numCloggedToilets = numCloggedToilets;
      var numPlungers = 2;
      var numTP = 2;

      while (numRegularToilets--) {
        var toilet = this.createOtherSprite(OtherSprite.TYPE_TOILET);
        toilet.offsetX = 0;
        toilet.offsetY = 10;
      }
      while (numCloggedToilets--) {
        var clogged:OtherSprite = this.createOtherSprite(OtherSprite.TYPE_CLOGGED_TOILET);        
      }
      while (numPlungers--) {
        this.createOtherSprite(OtherSprite.TYPE_PLUNGER);
      }
      while (numTP--) {
        this.createOtherSprite(OtherSprite.TYPE_TP);
      }
  }

  renderWalls() {
    var ctx: CanvasRenderingContext2D = this.wallsCanvas.getContext('2d');
    ctx.fillStyle = "black";
    ctx.lineWidth = 20;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.fillRect(0,0,1000,1000);
    ctx.shadowColor = "black";
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;    
    ctx.drawImage(this.backgroundImage,0,0,1000,1000);

    // now render the walls
    for (var x = 0; x < this.gridSize; x++) {
      for (var y = 0; y < this.gridSize; y++) {
        var cell:MazeCell = this.maze.getCell(x,y);

        if (cell == this.maze.endCell) {
          ctx.strokeStyle = "rgba(200,180,190,.5)";
        }
        else {
          ctx.strokeStyle = "rgba(200,180,190,1)";          
        }
        var cd = this.spriteScaling * 64;
        var xc = x * this.spriteScaling * 64 + this.PADDING;
        var yc = y * this.spriteScaling * 64 + this.PADDING;

        ctx.beginPath();
        if ((y == 0) && cell.hasWall(SquareWall.Top) ) {
          ctx.moveTo(xc,yc);
          ctx.lineTo(xc + cd, yc);
        }

        if (cell.hasWall(SquareWall.Right) ) {
          ctx.moveTo(xc + cd, yc);
          ctx.lineTo(xc + cd, yc + cd);
        }

        if (cell.hasWall(SquareWall.Bottom) ) {
          ctx.moveTo(xc, yc + cd);
          ctx.lineTo(xc + cd, yc + cd);
        }

        if ((x == 0) && cell.hasWall(SquareWall.Left) ) {
          ctx.moveTo(xc,yc);
          ctx.lineTo(xc, yc + cd);
        }
        ctx.closePath();
        ctx.stroke();
      }
    } 
  }
  

  updateScreen() {
    var canvas: HTMLCanvasElement = this.canvas;
        
    if (! canvas) {
      return;
    }

    if (this.appState.state != AppState.GAME_IN_PROGRESS) {
      return;
    }

    var ctx: CanvasRenderingContext2D = canvas.getContext('2d');

    ctx.drawImage(this.wallsCanvas, 0,0,1000,1000);

    this.updatePlayer();

    ctx.save();
    ctx.scale(this.spriteScaling, this.spriteScaling);
    for ( var i = this.sprites.length - 1; i >= 0; i--) {
      var sprite = this.sprites[i];
      sprite.update(this);
      sprite.draw(ctx);
    };
    ctx.restore();
  }

  onMouseDown(event:MouseEvent) {
    this.mousedown = true;
    this.onMouseMove(event);
  }

  onMouseMove(event:MouseEvent) {

    var offset = $(this.canvas).offset();
    this.event = event;
    var clickX = (event.clientX - offset.left) / this.canvasScaling;
    var clickY = (event.clientY - offset.top) / this.canvasScaling;
    
    var targetX = Math.floor(clickX / 1000 * this.gridSize);
    var targetY = Math.floor(clickY / 1000 * this.gridSize);

    targetX = Math.max(0, Math.min(this.gridSize - 1, targetX));
    targetY = Math.max(0, Math.min(this.gridSize - 1, targetY));

    this.mouseTargetX = targetX;
    this.mouseTargetY = targetY;

    this.updatePlayer();
  }

  canMoveLeft(x, y):boolean {
    var maxC = this.getGridSize() - 1;
    if (x <= 0 || x > maxC || y < 0 || y > maxC) {
      return false;
    }
    return !(this.maze.getCell(x, y).hasWall(SquareWall.Left) || this.maze.getCell(x - 1, y).hasWall(SquareWall.Right)); 
  }

  canMoveRight(x, y):boolean {
    var maxC = this.getGridSize() - 1;
    if (x < 0 || x >= maxC || y < 0 || y > maxC) {
      return false;
    }

    return !(this.maze.getCell(x, y).hasWall(SquareWall.Right) || this.maze.getCell(x + 1, y).hasWall(SquareWall.Left)); 
  }

  canMoveUp(x, y):boolean {
    var maxC = this.getGridSize() - 1;
    if (x < 0 || x > maxC || y <= 0 || y > maxC) {
      return false;
    }
    return !(this.maze.getCell(x, y).hasWall(SquareWall.Top) || this.maze.getCell(x, y - 1).hasWall(SquareWall.Bottom)); 
  }

  canMoveDown(x, y):boolean {
    var maxC = this.getGridSize() - 1;
    if (x < 0 || x > maxC || y < 0 || y >= maxC) {
      return false;
    }
    return !(this.maze.getCell(x, y).hasWall(SquareWall.Bottom) || this.maze.getCell(x, y + 1).hasWall(SquareWall.Top)); 
  }

  updatePlayer() {
    var targetX = this.mouseTargetX, targetY = this.mouseTargetY;
    var x = Math.floor(this.player.x), y = Math.floor(this.player.y);

    if (this.player.targetX != undefined) {
      return;
    }

    // handle keyboard / mouse movement
    if (this.keyDown[37]) {
      targetX = x - this.spriteScaling * 64;
      targetY = y;
    }
    else if (this.keyDown[39]) {
      targetX = x + this.spriteScaling * 64;
      targetY = y;
    }
    else if (this.keyDown[38]) {
      targetX = x;
      targetY = y - this.spriteScaling * 64;
    }
    else if (this.keyDown[40]) {
      targetX = x;
      targetY = y + this.spriteScaling * 64;
    }
    else if (! this.mousedown) {
      return;
    }


    var cell = this.maze.getCell(x, y);

    var alwaysAllowMove = false;
    if (cell === this.maze.endCell && ! this.numCloggedToilets) {
      alwaysAllowMove = true;
    }

    var xd = Math.abs(x - targetX);
    var yd = Math.abs(y - targetY);
    if (xd > yd) {
      var goToX;

      if (targetX < x && (alwaysAllowMove || this.canMoveLeft(x, y))) {
        goToX = x - 1;
      }
      else if (targetX > x && (alwaysAllowMove || this.canMoveRight(x, y))) {
        goToX = x + 1;
      }

      if (goToX != undefined) {
        this.player.y = Math.round(this.player.y);//(this.player.targetY == 'undefined') ? Math.round(this.player.y) : this.player.targetY;
        this.player.go(goToX, this.player.y);
      }
    }
    else {
      var goToY;
      if (targetY < y && (alwaysAllowMove || this.canMoveUp(x, y))) {
        goToY = y - 1;
      }
      else if (targetY > y && (alwaysAllowMove || this.canMoveDown(x, y))) {
        goToY = y + 1;
      }
      if (goToY != undefined) {
        this.player.x = Math.round(this.player.x);//(this.player.targetX == undefined) ? Math.round(this.player.x) : this.player.targetX;
        this.player.go(this.player.x, goToY);
      }
    }
  }


}
