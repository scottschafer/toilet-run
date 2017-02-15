import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

export enum EventType {
  EVENT_CHANGE_STATE,
  EVENT_MOVE_UP,
  EVENT_MOVE_DOWN,
  EVENT_MOVE_LEFT,
  EVENT_MOVE_RIGHT,

  EVENT_PICKUP_DROP,
  EVENT_USE_SOAP,

  EVENT_USE_TOILET
};

export class GameEvent {
  public readonly type:EventType;
  public readonly data;

  constructor(type:EventType, data?) {
    this.type = type;
    this.data = data;
  }
};

export class EventEmitter extends Subject<GameEvent>{
    constructor() {
        super();
    }
    emit(value) { super.next(value); }
}


@Injectable()
export class EventPublisherService {
  Stream:EventEmitter;
  
  constructor() {
    this.Stream = new EventEmitter();  
  }

  emit(type:EventType, data?) {
    this.Stream.emit(new GameEvent(type,data));
  }
}
