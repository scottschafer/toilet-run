import { Component, OnInit } from '@angular/core';
import { AppState, AppStateService } from './services/app-state-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [AppStateService]
})
export class AppComponent implements OnInit {

  public readonly GAME_INTRO = AppState.GAME_INTRO;
  public readonly GAME_IN_PROGRESS = AppState.GAME_IN_PROGRESS;
  public readonly GAME_STARTING = AppState.GAME_STARTING;
  
  public readonly GAME_LOST_LIFE_POOPED_PANTS = AppState.GAME_LOST_LIFE_POOPED_PANTS;
  public readonly GAME_LOST_LIFE_HIT_MONSTER = AppState.GAME_LOST_LIFE_HIT_MONSTER;
  
  //public state: AppState;

  constructor(public appState: AppStateService) {
    //this.state = appState.state;
  }

  ngOnInit() {
  }

  ngDoCheck() {
    //this.state = AppStateModel.state;
  }
}
