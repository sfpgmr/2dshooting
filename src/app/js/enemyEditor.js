"use strict";

export default class EnemyEditor {
  constructor(devTool)
  {
    this.devTool = devTool;
    // 敵
    devTool.debugUi.append('div').attr('id','enemy').text('enemy').style('display','none');

  }
}