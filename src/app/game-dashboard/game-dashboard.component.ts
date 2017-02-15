import { Component, OnInit, ElementRef } from '@angular/core';
import { AppState, AppStateService } from '../services/app-state-service';
import { EventType, GameEvent, EventPublisherService } from '../services/event-publisher-service';
import { Constants } from '../constants';
declare var $: any;

@Component({
  selector: 'game-dashboard',
  templateUrl: './game-dashboard.component.html',
  styleUrls: ['./game-dashboard.component.scss']
})
export class GameDashboardComponent implements OnInit {

  readonly BATHROOM_BREAK_MS: number = 30000;
  public bathroomNeed:number = 0;
  public soapTime:number = 0;

  public barcolor: string;
  public lives = [];

  private lastW: number;
  private lastH: number;

  constructor(private elementRef: ElementRef,
    public appState:AppStateService,
    private eventPublisherService: EventPublisherService ) { 
  }

  ngOnInit() {
  }

  ngDoCheck() {

    //this.adjustScaling();

    this.soapTime = Math.floor(100 * Math.min(1, this.appState.msUntilSoapDone / Constants.MS_UNTIL_SOAP_WEARS_OFF)) / 100;

    if (this.lives.length != this.appState.numLives) {
      if (this.appState.numLives > 0) {
        this.lives = new Array(this.appState.numLives);
      }
      else {
        this.lives = [];
      }
    }
    /*
    if (this.soaps.length != this.appState.numSoaps + 2) {
      this.soaps = new Array(this.appState.numSoaps + 2);
    }
    */
    this.bathroomNeed = 1 - Math.floor(100 * Math.min(1, this.appState.msUntilBathroomBreak / Constants.MS_UNTIL_BATHROOM_BREAK)) / 100;

    if (this.bathroomNeed < .5) {
      this.barcolor = "rgb(0,255,0)";
    }
    else if (this.bathroomNeed < .75) {
      this.barcolor = "rgb(255,255,0)";
    }
    else {
      this.barcolor = "rgb(255,0,0)";
    }
  }

  adjustScaling() {
    var parent = $(this.elementRef.nativeElement).parent();

    var w: number = parent.width();
    var h: number = parent.height();

    if (w != this.lastW || h != this.lastH) {
      this.lastW = w;
      this.lastH = h;

      var scaling = w / 800;
      $(this.elementRef.nativeElement).find('.dashboard-parent').css({ width: ((100/scaling) + '%'), transform: ('scale(' + scaling + ')') });
    }
  }

  onDrop() {
    this.eventPublisherService.emit(EventType.EVENT_PICKUP_DROP);
  }

  onUseSoap() {
    this.eventPublisherService.emit(EventType.EVENT_USE_SOAP);
  }

  togglePause() {
    this.appState.isPaused = ! this.appState.isPaused; 
  }
}
