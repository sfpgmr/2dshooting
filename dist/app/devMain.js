 "use strict";
//var STAGE_MAX = 1;
var root = '../js';

import * as sfg from '../js/global'; 
import * as util from '../js/util';
import * as audio from '../js/audio';
//import * as song from './song';
import * as graphics from '../js/graphics';
import * as io from '../js/io';
import * as comm from '../js/comm';
import * as text from '../js/text';
import * as gameobj from '../js/gameobj';
import * as myship from '../js/myship';
import * as enemies from '../js/enemies';
import * as effectobj from '../js/effectobj';
import { DevTool } from '/devtool';
import { Game } from '../js/game';

/// メイン
window.onload = function () {
  sfg.game = new Game();
  sfg.game.exec();
  sfg.devTool = new DevTool(this);
};

