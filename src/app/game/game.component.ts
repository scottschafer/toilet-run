import { Component, OnInit, ElementRef, ComponentRef, Input, Inject } from '@angular/core';
import { CharacterMap } from "../sprites/character-map";
import { AppState, AppStateService } from '../services/app-state-service';
import { AudioService, AudioType } from '../services/audio-service';
import { SquareMazeGrid, SquareWall } from "../../../maze-generator-ts/src/Objects/SquareMazeGrid";
import { MazeCell, MazeGrid } from "../../../maze-generator-ts/src/Objects/MazeGrid";
import { Constants } from '../constants';
import { Sprite } from "../sprites/sprite";
import { PlayerSprite } from "../sprites/player-sprite";
import { OtherSprite } from "../sprites/other-sprite";
import { CloggedToiletSprite } from "../sprites/clogged-toilet-sprite";
import { GaugeSegment, GaugeLabel } from 'ng2-kw-gauge';
import { IMazeLevel } from "../IMazeLevel";
import { PseudoRandom } from "../../../maze-generator-ts/src/Helpers/PseudoRandom";
import { EventType, GameEvent, EventPublisherService } from '../services/event-publisher-service';
import { UserInputService } from '../services/user-input.service';

declare var $: any;

@Component({
  selector: 'game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
@Inject(AppStateService)
export class GameComponent implements OnInit, IMazeLevel {
  
  private lastW: number;
  private lastH: number;

  private justLostLevel: boolean = false;

  maze: SquareMazeGrid;

  private canvas: HTMLCanvasElement;
  private wallsCanvas: HTMLCanvasElement;
  private floorCanvas: HTMLCanvasElement;
  private characterMap: CharacterMap;

  private gridSize: number;

  private canvasScaling: number;
  private spriteScaling: number;

  private sprites: Array<Sprite>;
  public player: PlayerSprite;

  private mousedown: boolean = false;
  private mouseTargetX: number;
  private mouseTargetY: number;
  private backgroundImage: HTMLImageElement;
  private wallsImage: HTMLImageElement;

  private keyDown: Array<boolean> = new Array(256);

  private random: PseudoRandom = new PseudoRandom();
  private numCloggedToilets: number;

  event: MouseEvent;

  constructor(private elementRef: ElementRef,
    public appState: AppStateService,
    public audioService: AudioService,
    private eventPublisherService:EventPublisherService,
    private userInputService: UserInputService
    ) {      
  }

  getGridSize(): number {
    return this.gridSize;
  }

  canPlayerExit(x, y): boolean {
    if (this.numCloggedToilets) {
      return false;
    }

    var endCell: MazeCell = this.maze.endCell;
    return (endCell.xPos == Math.floor(x) && endCell.yPos == Math.floor(y));
  }

  ngOnInit() {

    this.eventPublisherService.Stream.subscribe(event => this.processEvent(event));

    $(window).mouseup(() => {
      this.mousedown = false;
    })

    $(window).keydown((e) => {
      if (e.keyCode == 32) {
        this.eventPublisherService.emit(EventType.EVENT_PICKUP_DROP);
      }
      this.keyDown[e.keyCode] = true;
    })

    $(window).keyup((e) => {
      this.keyDown[e.keyCode] = false;
    })

    this.backgroundImage = new Image();
    this.backgroundImage.src = "assets/tiles.jpg";

    this.wallsImage = new Image();
    this.wallsImage.src = "assets/walls.png";

    this.characterMap = new CharacterMap();

    this.canvas = $(this.elementRef.nativeElement).find('.game-view')[0];//('.off-screen-canvas')[0];
    this.wallsCanvas = $(this.elementRef.nativeElement).find('.offscreen-walls')[0];//('.off-screen-canvas')[0];
    this.floorCanvas = $(this.elementRef.nativeElement).find('.offscreen-floor')[0];//('.off-screen-canvas')[0];

    setInterval(() => {
      if (this.appState.state == AppState.GAME_IN_PROGRESS) {
        this.updateScreen();
      }

      if (! this.appState.isPaused) {
        this.appState.msUntilBathroomBreak = Math.max(0, this.appState.msUntilBathroomBreak - Constants.MS_PER_FRAME);
        this.appState.msUntilSoapDone = Math.max(0, this.appState.msUntilSoapDone - Constants.MS_PER_FRAME);
      }
    }, Constants.MS_PER_FRAME);
  }

  ngDoCheck() {

    if (this.appState.state == AppState.GAME_IN_PROGRESS && this.appState.msUntilBathroomBreak <= 0) {
      this.appState.state = AppState.GAME_LOST_LIFE_POOPED_PANTS;
    }

    switch (this.appState.state) {
      case AppState.GAME_STARTING:
        this.initGame();
        this.appState.state = AppState.GAME_IN_PROGRESS;
        break;

      case AppState.GAME_NEXT_LEVEL:
        this.nextLevel();
        this.appState.state = AppState.GAME_IN_PROGRESS;
        break;

      case AppState.GAME_LOST_LIFE_POOPED_PANTS:
      case AppState.GAME_LOST_LIFE_HIT_MONSTER:
        this.justLostLevel = true;
        this.audioService.playMusic(AudioType.MUSIC_DEATH);

        if (!this.appState.isPaused) {
          this.appState.isPaused = true;
          window.setTimeout(() => {
            --this.appState.numLives;
            if (this.appState.numLives <= 0) {

              // game over

              if (this.appState.score > this.appState.highScore) {
                this.appState.highScore = this.appState.score;
                this.appState.state = AppState.GAME_NEW_HIGHSCORE; 
              }
              else {
                this.appState.state = AppState.GAME_INTRO;
              }
            }
            else {
              --this.appState.levelNumber;
              this.appState.state = AppState.GAME_NEXT_LEVEL;
            }
            this.appState.isPaused = false;
          }, 5000);
        }
        break;

    }


    var parent = $(this.elementRef.nativeElement).parent();

    var w: number = parent.width();
    var h: number = parent.height();

    if (this.lastW != w || this.lastH != h) {
      this.lastW = w;
      this.lastH = h;

      if (w && h) {
        w -= 20;
        h -= 20;
      }

      var dim = w = h = Math.min(w, h);

      this.canvasScaling = dim / this.appState.canvasDimension;
      $(this.canvas).css({ width: (dim + 'px'), height: (dim + 'px') });
      $(this.canvas).css({ width: (dim + 'px'), height: (dim + 'px') });
    }
  }

  processEvent(event: GameEvent) {
    var d = 1;
    switch(event.type) {
      case EventType.EVENT_MOVE_DOWN:
        this.handlePlayerMove(0,d);
        break;

      case EventType.EVENT_MOVE_UP:
        this.handlePlayerMove(0,-d);
        break;

      case EventType.EVENT_MOVE_LEFT:
        this.handlePlayerMove(-d, 0);
        break;

      case EventType.EVENT_MOVE_RIGHT:
        this.handlePlayerMove(d, 0);
        break;

      case EventType.EVENT_PICKUP_DROP:
        this.dropItem();
        break;

      case EventType.EVENT_USE_SOAP:
        this.useSoap();
        break;

      case EventType.EVENT_USE_TOILET:
        this.useToilet();
        break;
    }
  }

  initGame() {
    this.appState.levelNumber = 0;
    this.appState.numLives = 3;

    this.justLostLevel = false;
    this.nextLevel();
  }

  // this is woefully inefficient, but it probably doesn't matter here
  getSpritesAtPosition(x, y, minDist?: number): Array<Sprite> {
    if (minDist === undefined) {
      minDist = .1;
    }
    minDist *= minDist;

    var result: Array<Sprite> = new Array<Sprite>();
    this.sprites.forEach((sprite) => {
      var xd = x - sprite.x;
      var yd = y - sprite.y;
      if ((xd * xd + yd * yd) < minDist) {
        result.push(sprite);
      }
    });

    return result;
  }

  createOtherSprite(type: number, x?: number, y?: number, onTop?: boolean): OtherSprite {

    if (x === undefined) {
      var minDistance = this.gridSize / 2;

      for (var i = 0; true; i++) {

        x = Math.floor(this.random.nextDouble() * this.gridSize);
        y = Math.floor(this.random.nextDouble() * this.gridSize);

        if (this.getSpritesAtPosition(x, y, minDistance).length == 0) {
          break;
        }
        if ((i % 10) == 0) {
          minDistance = Math.max(1, minDistance * .8);
        }
      }
    }

    var sprite: OtherSprite;

    if (type === OtherSprite.TYPE_SYMBOL) {
      this.audioService.playSoundEffect(AudioType.SFX_FART);
    }
    switch (type) {
      default:
        sprite = new OtherSprite();
        break;

      case OtherSprite.TYPE_CLOGGED_TOILET:
        sprite = new CloggedToiletSprite(this.appState);
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

  removeSprite(sprite: Sprite) {
    var i: number = this.sprites.indexOf(sprite);
    this.sprites.splice(i, 1);

    if (sprite.type == OtherSprite.TYPE_CLOGGED_TOILET) {
      --this.numCloggedToilets;
      this.audioService.playSoundEffect(AudioType.SFX_FLUSH);

      if (this.numCloggedToilets == 0) {

        // all clogged toilets are gone, so open exit
        if (this.maze.endCell.hasWall(SquareWall.Right)) {
            this.maze.endCell.removeWall(SquareWall.Right);
        }
        else {
          for (var i = 0; i < 4; i++) {
            this.maze.endCell.removeWall(i);
          }
        }

        this.renderWalls();
      }
    }
  }

  nextLevel() {

    this.audioService.playMusic(AudioType.MUSIC_LEVEL);

    ++this.appState.levelNumber;

    this.random.seed = this.appState.levelNumber;
    this.appState.msUntilBathroomBreak = Constants.MS_UNTIL_BATHROOM_BREAK;
    this.appState.hasPlunger = this.appState.hasTP = false;

    this.gridSize = 5 + Math.floor(this.appState.levelNumber / 2);
    this.maze = SquareMazeGrid.generate(this.gridSize, this.gridSize, this.appState.levelNumber);
    while (!this.maze.iterate()) { }

    this.spriteScaling = (this.appState.canvasDimension - this.appState.canvasBorder * 2) / (this.gridSize * 64);

    // remove some random walls
    for (var x = 0; x < this.gridSize; x++) {
      for (var y = 0; y < this.gridSize; y++) {
        var cell: MazeCell = this.maze.getCell(x, y);
        if (cell == this.maze.startCell) {
          continue;
        }

        if ((x > 0) && (y > 0) && (x < (this.gridSize - 1)) && (y < (this.gridSize - 1))) {
          var wallCount;
          wallCount = 0;
          for (var i = 0; i < 4; i++) {
            wallCount += cell.hasWall(i) ? 1 : 0;
          }
          if (wallCount >= 3) {
            var removeWall = Math.floor(this.random.nextDouble() * 4);
            cell.removeWall(removeWall);
            switch (removeWall) {
              case SquareWall.Left:
                this.maze.getCell(x - 1, y).removeWall(SquareWall.Right);
                break;
              case SquareWall.Right:
                this.maze.getCell(x + 1, y).removeWall(SquareWall.Left);
                break;
              case SquareWall.Top:
                this.maze.getCell(x, y - 1).removeWall(SquareWall.Bottom);
                break;
              case SquareWall.Bottom:
                this.maze.getCell(x, y + 1).removeWall(SquareWall.Top);
                break;
            }
          }
        }
      }
    }

    this.renderFloors();
    this.renderWalls();

    // initialize player
    this.player = new PlayerSprite(this.appState, this.audioService, this.eventPublisherService);
    this.player.x = this.maze.startCell.xPos;
    this.player.y = this.maze.startCell.yPos;
    this.player.type = CharacterMap.WALK_RIGHT;
    this.sprites = [
      this.player
    ]

    var numRegularToilets = 1;
    var numCloggedToilets = Math.floor(2 + this.appState.levelNumber / 2);
    var numPlungers = numCloggedToilets;//Math.floor(2 + this.appState.levelNumber / 3);
    var numTP = Math.max(1, numPlungers - 2);

    this.numCloggedToilets = numCloggedToilets;

    numRegularToilets = 0;

    while (numRegularToilets--) {
      var toilet = this.createOtherSprite(OtherSprite.TYPE_TOILET);
      toilet.offsetX = 0;
      toilet.offsetY = 10;
    }

    while (numCloggedToilets--) {
      var clogged: OtherSprite = this.createOtherSprite(OtherSprite.TYPE_CLOGGED_TOILET);
    }
    while (numPlungers--) {
      var plunger:OtherSprite = this.createOtherSprite(OtherSprite.TYPE_PLUNGER);
      // every four levels you get a golden plunger
      var goldenPlungerLevel = (this.appState.levelNumber % 4 == 0); 
      if (goldenPlungerLevel && ! numPlungers && ! this.justLostLevel) {
        plunger.frame = 1;
      }
    }
    while (numTP--) {
      this.createOtherSprite(OtherSprite.TYPE_TP);
    }

    var numSoaps = 1;
    while (numSoaps--) {
      var soap:OtherSprite = this.createOtherSprite(OtherSprite.TYPE_SOAP);
      soap.startFrame = 0;
      soap.endFrame = 2;
    }
    this.justLostLevel = false;
  }

  renderFloors() {
    if (!this.backgroundImage.width) {
      setTimeout(() => {
        this.renderFloors();
      }, 100);
      return;
    }

    var ctx: CanvasRenderingContext2D = this.floorCanvas.getContext('2d');

    ctx.fillStyle = "black";
    ctx.fillRect(0,0,this.floorCanvas.width,this.floorCanvas.height);
    

    // draw the tiles
    var srcX = (this.appState.levelNumber % 4) * 128;
    var srcY = 0;

    var border = this.appState.canvasBorder;
    var dstW = (this.appState.canvasDimension - border * 2) / this.gridSize;

    for (var x = 0; x < this.gridSize; x++) {
      for (var y = 0; y < this.gridSize; y++) {

        ctx.drawImage(this.backgroundImage, srcX, srcY, 128, 128,
          x * dstW + border, y * dstW + border, dstW, dstW);
      }      
    }

    ctx.fillStyle = 'black';
    ctx.fillRect(this.maze.endCell.xPos * dstW + border + dstW - 10, this.maze.endCell.yPos * dstW + border, 20, dstW);
  }

  renderWalls() {    
    if (! this.wallsImage.width) {
      setTimeout(() => {
        this.renderWalls();
      }, 100);
      return;
    }

    var ctx: CanvasRenderingContext2D = this.wallsCanvas.getContext('2d');
    ctx.clearRect(0,0,this.appState.canvasDimension,this.appState.canvasDimension);

    /*
    var scaleWidth = 6 / this.gridSize;

    // draw the tiles
    var srcX = (this.appState.levelNumber % 4) * 128;
    var srcY = 0;
    for (var x = 0; x < this.gridSize; x++) {
      for (var y = 0; y < this.gridSize; y++) {

        var dstW = 1000 / this.gridSize;
        var dstX = x * dstW;

        ctx.drawImage(this.backgroundImage, srcX, srcY, 128, 128, x * dstW, y * dstW, dstW, dstW);
      }      
    }
*/
    // now render the walls
    var border = this.appState.canvasBorder;
    var dstW = (this.appState.canvasDimension - border * 2) / this.gridSize;

    var srcW = 80;
    for (var x = 0; x < this.gridSize; x++) {
      for (var y = 0; y < this.gridSize; y++) {
        var cell: MazeCell = this.maze.getCell(x, y);

        var cd = this.spriteScaling * 64;
        ///var xc = x * this.spriteScaling * 64 + this.appState.canvasBorder;
        ////var yc = y * this.spriteScaling * 64 + this.appState.canvasBorder;


        var dstX = x * dstW - (srcW - 64) / 128 * dstW + border;
        var dstY = y * dstW - (srcW - 64) / 128 * dstW + border;

        var srcX = 64;
        var srcY = 64; 

        for (var iWall = SquareWall.Top; iWall <= SquareWall.Left; iWall++) {

          if (cell.hasWall(iWall)) {
            if (iWall == SquareWall.Top && y != 0) {
              continue;
            }            
            var srcX = 64 + iWall * 128;
            var srcY = 64;

            srcX -= (srcW - 64) / 2;
            srcY -= (srcW - 64) / 2;

            if (cell == this.maze.endCell && iWall == SquareWall.Right) {
//              ctx.fillStyle = 'black';
//              ctx.fillRect(dstX + dstW, dstY, dstX + dstW + 12, dstY + dstW + 12);
              ctx.globalAlpha = .3;
            }
            else {
              ctx.globalAlpha = 1;
            }

            ctx.drawImage(this.wallsImage, srcX, srcY, srcW, srcW, dstX, dstY, dstW * 80 / 64, dstW * 80 / 64);
          }
        }
      }
    }
  }


  updateScreen() {
    var canvas: HTMLCanvasElement = this.canvas;

    if (!canvas) {
      return;
    }

    if (this.appState.state != AppState.GAME_IN_PROGRESS) {
      return;
    }

    var ctx: CanvasRenderingContext2D = canvas.getContext('2d');

    ctx.drawImage(this.floorCanvas, 0, 0, this.floorCanvas.width, this.floorCanvas.height);

    this.updatePlayer();

    ctx.save();
    ctx.scale(this.spriteScaling, this.spriteScaling);
    for (var i = this.sprites.length - 1; i >= 0; i--) {
      var sprite = this.sprites[i];
      if (!this.appState.isPaused) {
        sprite.update(this);
      }
      sprite.draw(ctx);
    };
    ctx.restore();
    ctx.drawImage(this.wallsCanvas, 0, 0, this.wallsCanvas.width, this.wallsCanvas.height);
  }

  onMouseDown(event: MouseEvent) {
    this.mousedown = true;
    this.onMouseMove(event);
  }

  onMouseMove(event: MouseEvent) {

    var offset = $(this.canvas).offset();
    this.event = event;
    var clickX = (event.clientX - offset.left) / this.canvasScaling;
    var clickY = (event.clientY - offset.top) / this.canvasScaling;

    var targetX = Math.floor(clickX / this.appState.canvasDimension * this.gridSize);
    var targetY = Math.floor(clickY / this.appState.canvasDimension * this.gridSize);

    targetX = Math.max(0, Math.min(this.gridSize - 1, targetX));
    targetY = Math.max(0, Math.min(this.gridSize - 1, targetY));

    this.mouseTargetX = targetX;
    this.mouseTargetY = targetY;

    this.updatePlayer();
  }

  canMoveLeft(x, y): boolean {
    var maxC = this.getGridSize() - 1;
    if (x <= 0 || x > maxC || y < 0 || y > maxC) {
      return false;
    }
    return !(this.maze.getCell(x, y).hasWall(SquareWall.Left) || this.maze.getCell(x - 1, y).hasWall(SquareWall.Right));
  }

  canMoveRight(x, y): boolean {
    var maxC = this.getGridSize() - 1;
    if (x < 0 || x >= maxC || y < 0 || y > maxC) {
      return false;
    }

    return !(this.maze.getCell(x, y).hasWall(SquareWall.Right) || this.maze.getCell(x + 1, y).hasWall(SquareWall.Left));
  }

  canMoveUp(x, y): boolean {
    var maxC = this.getGridSize() - 1;
    if (x < 0 || x > maxC || y <= 0 || y > maxC) {
      return false;
    }
    return !(this.maze.getCell(x, y).hasWall(SquareWall.Top) || this.maze.getCell(x, y - 1).hasWall(SquareWall.Bottom));
  }

  canMoveDown(x, y): boolean {
    var maxC = this.getGridSize() - 1;
    if (x < 0 || x > maxC || y < 0 || y >= maxC) {
      return false;
    }
    return !(this.maze.getCell(x, y).hasWall(SquareWall.Bottom) || this.maze.getCell(x, y + 1).hasWall(SquareWall.Top));
  }

  handlePlayerMove(xd:number, yd:number) {
    var x = Math.floor(this.player.x), y = Math.floor(this.player.y);
    var targetX = x + xd * 64;
    var targetY = y + yd * 64;
    
    var cell = this.maze.getCell(x, y);

    var alwaysAllowMove = false;
    if (cell === this.maze.endCell && !this.numCloggedToilets) {
      alwaysAllowMove = true;
    }

    if (Math.abs(xd) > Math.abs(yd)) {
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
    else if (!this.mousedown) {
      return;
    }


    var cell = this.maze.getCell(x, y);

    var alwaysAllowMove = false;
    if (cell === this.maze.endCell && !this.numCloggedToilets) {
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

  dropItem() {

    var hasTP = this.appState.hasTP; 
    var hasPlunger = this.appState.hasPlunger;

    if (hasTP || hasPlunger) {
      this.audioService.playSoundEffect(AudioType.SFX_DROP);

      this.appState.hasTP = this.appState.hasPlunger = false;
    }

    this.player.pickup(this);  

    if (hasTP) {
      this.createOtherSprite(OtherSprite.TYPE_TP, this.player.x, this.player.y);
      this.appState.justDropped = true;
    }

    if (hasPlunger) {
      var plunger:OtherSprite = this.createOtherSprite(OtherSprite.TYPE_PLUNGER, this.player.x, this.player.y);
      if (this.appState.hasGoldenPlunger) {
        plunger.frame = 1;
        this.appState.hasGoldenPlunger = false;
      }

      this.appState.justDropped = true;
    }
  }

  useSoap() {
    this.appState.msUntilSoapDone = Constants.MS_UNTIL_SOAP_WEARS_OFF;
  }

  useToilet() {
    this.appState.score += 10;
    this.appState.msUntilBathroomBreak = Constants.MS_UNTIL_BATHROOM_BREAK;
//                                this.appState.lastBathroomBreak = new Date().getTime();
    
  }

}
