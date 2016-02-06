"use strict";

export default class Controller {
  constructor(devtool)
  {
    this.devtool = devtool;
    let g = devtool.game;
    let debugUi = devtool.debugUi;
    // 制御画面 
    let toggle = devtool.toggleGame();
    
    let controllerData = 
    [
      //　ゲームプレイ
      {
        name:'play',
        func(){
          this.attr('class',toggle.next(false).value);
        }
      }
    ];
    
    let controller = debugUi.append('div').attr('id','control').classed('controller',true);
    let buttons = controller.selectAll('button').data(controllerData)
    .enter().append('button');
    buttons.attr('class',d=>d.name);
    
    buttons.on('click',function(d){
      d.func.apply(d3.select(this));
    });
    
    controller.append('span').text('ステージ').style({'width':'100px','display':'inline-block','text-align':'center'});
    
    var stage = controller
    .append('input')
    .attr({'type':'text','value':g.stage.no})
    .style({'width':'40px','text-align':'right'});
    g.stage.on('update',(d)=>{
      stage.node().value = d.no;
    });
    
    stage.on('change',function(){
      let v =  parseInt(this.value);
      if(g.stage.no != v){
        g.stage.jump(v);
      }
    });
    
    
  }
}
