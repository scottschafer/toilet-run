import { Component, OnInit } from '@angular/core';
import { AppState, AppStateService } from '../services/app-state-service';

@Component({
  selector: 'high-score',
  templateUrl: './high-score.component.html',
  styleUrls: ['./high-score.component.scss']
})
export class HighScoreComponent implements OnInit {

  public bragMessage:string;
  public isCopied: boolean = false;

  constructor(public appState:AppStateService) { 
  }

  ngOnInit() {

    this.bragMessage = "I scored " + this.appState.highScore + " on " + window.location.href +
      ", a fun and silly game of plungers and toilets! Can you beat my score?";
  }

  onClose() {
    this.appState.state = AppState.GAME_INTRO;
  }

}
