
import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { CharacterMap } from '../sprites/character-map';

export enum AudioType {
  MUSIC_STARTSCREEN,
  MUSIC_LEVEL,
  MUSIC_DEATH,

  SFX_FART,
  SFX_FLUSH
};

@Injectable()
export class AudioService {

  private lastType: AudioType;
  private music: HTMLAudioElement;
  private fxFart: HTMLAudioElement = new Audio("assets/sounds/Girl Fart-SoundBible.com-669012925.mp3");
  private fxFlush: HTMLAudioElement = new Audio("assets/sounds/Toilet_Flushing-KevanGC-917782919.mp3");

  constructor() { }

  public stopMusic() {
    this.lastType = null;
    if (this.music) {
      this.music.pause();
      this.music = null;
    }
  }

  public playMusic(type: AudioType) {

    if (this.lastType === type) {
      return;
    }
    this.stopMusic();

    switch (type) {
      case AudioType.MUSIC_STARTSCREEN:
        this.music = new Audio("assets/sounds/BGM.ogg");
        break;

      case AudioType.MUSIC_LEVEL:
        this.music = new Audio("assets/sounds/LeftRightExcluded.mp3");
        break;

      case AudioType.MUSIC_DEATH:
        this.music = new Audio("assets/sounds/hell-Mike_Koenig-144950046.mp3");
        break;
    }

    if (this.music) {
      this.lastType = type;
      if (typeof this.music.loop == 'boolean') {
        this.music.loop = true;
      }
      else {
        this.music.addEventListener('ended', function () {
          this.currentTime = 0;
          this.play();
        }, false);
      }
      this.music.play();
    }
  }

  public playSoundEffect(type: AudioType) {
    switch (type) {
      case AudioType.SFX_FART:
        this.fxFart.play();
        break;

      case AudioType.SFX_FLUSH:
        this.fxFlush.play();
        break;
    }
  }

}
