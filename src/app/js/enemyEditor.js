"use strict";
import * as fs from 'fs';
import * as Enemies from '../../js/enemies';

export default class EnemyEditor {
  constructor(devTool)
  {
    this.devTool = devTool;
    // 敵
    devTool.debugUi.append('div').attr('id','enemy').text('enemy').style('display','none');
    let g = devTool.game;
  }
}