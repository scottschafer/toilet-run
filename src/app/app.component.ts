import { Component, OnInit } from '@angular/core';
import { AppState, AppStateService } from './services/app-state-service';
import { AudioService } from './services/audio-service';
import { UserInputService } from './services/user-input.service';
import { EventPublisherService } from './services/event-publisher-service';
import { CookieService } from 'angular2-cookie/services/cookies.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [ AppStateService, AudioService, UserInputService, EventPublisherService, CookieService ]
})
export class AppComponent implements OnInit {

  public readonly GAME_SPLASH_SCREEN = AppState.GAME_SPLASH_SCREEN;
  public readonly GAME_INTRO = AppState.GAME_INTRO;
  public readonly GAME_IN_PROGRESS = AppState.GAME_IN_PROGRESS;
  public readonly GAME_STARTING = AppState.GAME_STARTING;
  
  public readonly GAME_LOST_LIFE_POOPED_PANTS = AppState.GAME_LOST_LIFE_POOPED_PANTS;
  public readonly GAME_LOST_LIFE_HIT_MONSTER = AppState.GAME_LOST_LIFE_HIT_MONSTER;
  
  public readonly GAME_NEW_HIGHSCORE = AppState.GAME_NEW_HIGHSCORE;

  constructor(public appState: AppStateService) {
  }

  ngOnInit() {
  }

  ngDoCheck() {
    if (this.appState.state == undefined) {
      this.appState.state = AppState.GAME_SPLASH_SCREEN;

      window.setTimeout(() => {
        this.appState.state = AppState.GAME_INTRO;
      }, 5000);
    }
  }
}
