import { Component, OnInit } from '@angular/core';
import { AppState, AppStateService } from './services/app-state-service';
import { AudioService } from './services/audio-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [AppStateService, AudioService]
})
export class AppComponent implements OnInit {

  public readonly GAME_SPLASH_SCREEN = AppState.GAME_SPLASH_SCREEN;
  public readonly GAME_INTRO = AppState.GAME_INTRO;
  public readonly GAME_IN_PROGRESS = AppState.GAME_IN_PROGRESS;
  public readonly GAME_STARTING = AppState.GAME_STARTING;
  
  public readonly GAME_LOST_LIFE_POOPED_PANTS = AppState.GAME_LOST_LIFE_POOPED_PANTS;
  public readonly GAME_LOST_LIFE_HIT_MONSTER = AppState.GAME_LOST_LIFE_HIT_MONSTER;
  

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
