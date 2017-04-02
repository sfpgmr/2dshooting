"use strict";
//var STAGE_MAX = 1;
import * as sfg from './global'; 
import * as util from './util';
import * as audio from './audio';
//import * as song from './song';
import * as graphics from './graphics';
import * as io from './io';
import * as comm from './comm';
import * as text from './text';
import * as gameobj from './gameobj';
import * as myship from './myship';
import * as enemies from './enemies';
import * as effectobj from './effectobj';
import { Game } from './game';

/// メイン
window.onload = function () {

  sfg.game = new Game();
  sfg.game.exec();

};
