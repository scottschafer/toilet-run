import { Injectable } from '@angular/core';
import { OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { CharacterMap } from '../sprites/character-map';
import { CookieService } from 'angular2-cookie/services/cookies.service';

export enum AppState {
    GAME_SPLASH_SCREEN = 0,
    GAME_INTRO,
    GAME_STARTING,
    GAME_IN_PROGRESS,
    GAME_NEXT_LEVEL,
    GAME_LOST_LIFE_POOPED_PANTS,
    GAME_LOST_LIFE_HIT_MONSTER,
    GAME_NEW_HIGHSCORE,
    GAME_NEXT_LIFE
};


@Injectable()
export class AppStateService {

  constructor(private cookieService:CookieService) {
    //this.state = AppState.GAME_SPLASH_SCREEN;
  }

  public state: AppState;
  public numLives: number;

  public canvasDimension: number = 1000;
  public canvasBorder: number = 10;

  public isPaused:boolean = false;
  public justDropped:boolean = false;

  public score:number = 0;
  private _highScore;

  public character:CharacterMap;
  public levelNumber:number;

  public hasTP:boolean = false;
  public hasPlunger:boolean = false;
  public hasGoldenPlunger:boolean = false;

  public numSoaps: number = 0;

  public numTP: number = 0;
  public numPlungers: number = 0;

  public msUntilBathroomBreak: number;
  public msUntilSoapDone: number;

  get highScore():number {
    if (this._highScore === undefined) {
      this._highScore = parseInt(this.cookieService.get('highScore'));
      this._highScore = isNaN(this._highScore) ? 0 : this._highScore;
    }
    return this._highScore;
  }

  set highScore(val:number) {
    this._highScore = val;
    this.cookieService.put('highScore',val.toString());    
  }

}
