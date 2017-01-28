import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { GaugeModule } from 'ng2-kw-gauge';

import { MaterializeModule } from 'angular2-materialize';
import { AppComponent } from './app.component';
import { GameComponent } from './game/game.component';
import { StartScreenComponent } from './start-screen/start-screen.component';
import { GameDashboardComponent } from './game-dashboard/game-dashboard.component';


@NgModule({
  declarations: [
    AppComponent,
    GameComponent,
    StartScreenComponent,
    GameDashboardComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    MaterializeModule,
    GaugeModule
  ],
  //providers: [ AppStateService ],
  bootstrap: [AppComponent]
})
export class AppModule { }

