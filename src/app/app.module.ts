import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { MaterializeModule } from 'angular2-materialize';
import { AppComponent } from './app.component';
import { GameComponent } from './game/game.component';
import { StartScreenComponent } from './start-screen/start-screen.component';
import { GameDashboardComponent } from './game-dashboard/game-dashboard.component';
import { ScaleToWidthDirective } from './scale-to-width.directive';
import { HighScoreComponent } from './high-score/high-score.component';

import { ClipboardModule } from 'ngx-clipboard';

@NgModule({
  declarations: [
    AppComponent,
    GameComponent,
    StartScreenComponent,
    GameDashboardComponent,
    ScaleToWidthDirective,
    HighScoreComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    MaterializeModule,
    ClipboardModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

