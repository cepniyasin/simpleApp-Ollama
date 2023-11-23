import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import {RequestBoxComponent} from "./request-box/request-box.component";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RequestBoxComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
