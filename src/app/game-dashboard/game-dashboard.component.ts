import { Component, OnInit } from '@angular/core';
import { AppState, AppStateService } from '../services/app-state-service';

@Component({
  selector: 'game-dashboard',
  templateUrl: './game-dashboard.component.html',
  styleUrls: ['./game-dashboard.component.css']
})
export class GameDashboardComponent implements OnInit {

  readonly BATHROOM_BREAK_MS: number = 30000;
  public bathroomNeed:number = 0;
  public barcolor: string;
  public lives = [];

  constructor(public appState:AppStateService) { }

  ngOnInit() {
  }

  ngDoCheck() {

    if (this.lives.length != this.appState.numLives) {
      this.lives = new Array(this.appState.numLives);
    }
    var elapsedBathroomBreak:number = new Date().getTime() - this.appState.lastBathroomBreak;
    this.bathroomNeed = Math.floor(100 * Math.min(1, elapsedBathroomBreak / this.BATHROOM_BREAK_MS)) / 100;

    if (this.bathroomNeed < .5) {
      this.barcolor = "rgb(0,255,0)";
    }
    else if (this.bathroomNeed < .75) {
      this.barcolor = "rgb(255,255,0)";
    }
    else {
      this.barcolor = "rgb(255,0,0)";
    }

    if (this.bathroomNeed >= 1 && this.appState.state == AppState.GAME_IN_PROGRESS) {
      this.appState.state = AppState.GAME_LOST_LIFE_POOPED_PANTS;
    }
  }

}
