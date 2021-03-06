import { Component, OnInit, Inject } from '@angular/core';
import { CharacterMap } from '../sprites/character-map';
import { AppState, AppStateService } from '../services/app-state-service';
import { AudioService, AudioType } from '../services/audio-service';
import { Constants } from '../constants';

declare var $:any;

@Component({
  selector: 'start-screen',
  templateUrl: './start-screen.component.html',
  styleUrls: ['./start-screen.component.scss']
})
@Inject(AppStateService)
export class StartScreenComponent implements OnInit {

  playerCharacters:[string] = ["boy", "girl2", "boy2", "sara", "orc"];

  private characterMaps: { [name: string]:CharacterMap } = {};
  private frame:number = 0;
  private selected: string;

  constructor(public appState: AppStateService,
    public audioService: AudioService) {      
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
    if (this.appState.state == AppState.GAME_INTRO) {
      this.audioService.playMusic(AudioType.MUSIC_STARTSCREEN);
    }
  }

  private allowFlipDirection:boolean = true;
  private action = CharacterMap.DANCE1;

  updateFrames() {

    var frame = Math.floor(this.frame);
    var flipDirection = false;
    if (! this.selected) {
      if ((frame % 12) == 1) {
        if (this.allowFlipDirection) {
          this.action = (this.action == CharacterMap.DANCE1) ? CharacterMap.DANCE3 : CharacterMap.DANCE1;   
          this.allowFlipDirection = false;
        }
      }
      else {
        this.allowFlipDirection = true;
      }
    }

    this.playerCharacters.forEach((name, index) => {
      var action = this.action;

      var xOff = 10;
      var yOff = 20;

      if (! this.selected) {

/*
        if (flipDirection) {
          action = CharacterMap.DANCE1 + Math.floor(Math.random() * 4);  
        }
        */

        frame = (frame /*+ index * 2*/) % 12;
        if (frame > 5) {
          frame = 11 - frame;
        }
      }
      else {
        if (this.selected == name) {

          action = (Math.floor(this.frame / 10) & 1 )? 15 : 13;
          if (index == 0) {
            action = 15;
          }
          else if (index == (this.playerCharacters.length - 1)) {
            action = 13;
          }
          frame = Math.min(Math.floor(this.frame) % 10, 5);
        }
        else {
          action = 20;
          yOff = 10 + this.frame * this.frame;
          frame = Math.min(frame, 5);
        }
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

    var waveTime = 1800;
    // if a player on the edge, they will only wave once
    var index = this.playerCharacters.indexOf(character);
    if (index == 0 || index == (this.playerCharacters.length - 1)) {
      waveTime = 1000;
    }

    setTimeout(()=> {
      this.appState.state = AppState.GAME_STARTING;
      this.selected = null;
    }, waveTime);
  }
}
