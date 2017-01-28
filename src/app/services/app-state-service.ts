import { Injectable } from '@angular/core';
import { OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { CharacterMap } from '../sprites/character-map';

export enum AppState {
    GAME_INTRO = 0,
    GAME_STARTING,
    GAME_IN_PROGRESS,
    GAME_NEXT_LEVEL,
    GAME_LOST_LIFE_POOPED_PANTS,
    GAME_LOST_LIFE_HIT_MONSTER,
    GAME_PLAYER_DYING,
    GAME_NEXT_LIFE,
    GAME_OVER
};


@Injectable()
export class AppStateService {

  private _state:AppState = AppState.GAME_INTRO; 
    //;

  constructor() {
  }

  @Input()
  get state(): AppState {
    return this._state;
  }

  @Output() appStateChange = new EventEmitter();

  set state(val:AppState) {
    this._state = val;
    this.appStateChange.emit(this._state);
  } 

  @Input()
  get numLives(): AppState {
    return this._numLives;
  }

  @Output() numLivesChange = new EventEmitter();

  set numLives(val:AppState) {
    this._numLives = val;
    this.numLivesChange.emit(this._numLives);
  } 


  public isPaused:boolean = false;
  public justDropped:boolean = false;

  public character:CharacterMap;
  public levelNumber:number;

  public hasTP:boolean = false;
  public hasPlunger:boolean = false;

  private _numLives: number = 3;
  public numTP: number = 0;
  public numPlungers: number = 0;

  public lastBathroomBreak: number;
}
