"use strict";
//var STAGE_MAX = 1;
import {sfg} from './global.js'; 
// import * as util from './util.js';
// import * as audio from './audio.js';
// //import * as song from './song';
// import * as graphics from './graphics.js';
// import * as io from './io.js';
// import * as comm from './comm.js';
// import * as text from './text.js';
// import * as gameobj from './gameobj.js';
// import * as myship from './myship.js';
// import * as enemies from './enemies.js';
// import * as effectobj from './effectobj.js';
import { Game } from './game.js';

/// メイン
window.onload = function () {

  sfg.game = new Game();
  sfg.game.exec();
};
