"use strict";
import * as sfg from './global';

export class DevTool {
  constructor(game) {
    this.game = game;
    this.keydown = this.keydown_();
    this.keydown.next();
  }

  *keydown_() {
    var e = yield;
    while (true) {
      var process = false;
      if (e.keyCode == 192) { // @ Key
        sfg.CHECK_COLLISION = !sfg.CHECK_COLLISION;
        process = true;
      };

      if (e.keyCode == 80 /* P */) {
        if (!sfg.pause) {
          this.game.pause();
        } else {
          this.game.resume();
        }
        process = true;
      }

      if (e.keyCode == 88 /* X */ && sfg.DEBUG) {
        if (!sfg.pause) {
          this.game.pause();
        } else {
          this.game.resume();
        }
        process = true;
      }
      e = yield process;
    }
  }
}

