import { Component, OnInit, Inject } from '@angular/core';
import { CharacterMap } from '../sprites/character-map';
import { AppState, AppStateService } from '../services/app-state-service';
import { Constants } from '../models/constants';

declare var $:any;

@Component({
  selector: 'start-screen',
  templateUrl: './start-screen.component.html',
  styleUrls: ['./start-screen.component.scss']
})
@Inject(AppStateService)
export class StartScreenComponent implements OnInit {

  playerCharacters:[string] = ["boy", "sara", "orc"];

  private characterMaps: { [name: string]:CharacterMap } = {};
  private frame:number = 0;
  private selected: string;
  private state:AppState;

  constructor(public appState: AppStateService) {
    //this.state = this.appState.state;
  }

  ngOnInit() {
    this.playerCharacters.forEach((name) => {
      this.characterMaps[name] = new CharacterMap(name); 
    });
    
    this.selected = null;

    var self = this;
    setInterval(() => {
      if (this.appState.state == AppState.GAME_INTRO) {
        this.frame += .33;
        this.updateFrames();
      }
    }, Constants.MS_PER_FRAME);
  }


  ngDoCheck() {
    //this.state = this.appState.state;
  }

  updateFrames() {
    this.playerCharacters.forEach((name, index) => {
      var action = CharacterMap.DANCE;

      var frame = Math.floor(this.frame);
      var xOff = 10;
      var yOff = 20;

      if (! this.selected) {
        frame = (frame /*+ index * 2*/) % 12;
        if (frame > 5) {
          frame = 11 - frame;
        }
      }
      else {
        if (this.selected == name) {
          action = (index == 0) ? 15 : 13;
        }
        else {
          action = 20;
          yOff = 10 + this.frame * this.frame;
        }
        frame = Math.min(frame, 5);
      }

      var canvas = $('#' + name);
      if (canvas.length) {
        canvas = canvas[0];
        var ctx: CanvasRenderingContext2D = canvas.getContext('2d');
        ctx.clearRect(0,0,200, 200);
        this.characterMaps[name].drawFrame(ctx, action, frame, xOff, yOff, 2, 2);      
      }
    });
  }

  select(character:string) {
    this.frame = 0;

    this.selected = character;
    this.appState.character = this.characterMaps[character];

    setTimeout(()=> {
      this.appState.state = this.state = AppState.GAME_STARTING;
    }, 2000);
  }
}
