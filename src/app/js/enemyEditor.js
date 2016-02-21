"use strict";
import * as fs from 'fs';
import * as Enemies from '../../js/enemies';
import { UndoManager } from './undo'; 
import { EnemyFormationEditor } from './enemyFormationEditor';
import { EnemyMovSeqEditor } from './enemyMovSeqEditor';

export default class EnemyEditor {
  constructor(devTool)
  {
    this.devTool = devTool;
    // 敵
    let g = devTool.game;
  }
  
  active(){
    if(!this.initialized){
      this.init();
    }
  }
  
  init(){
    let this_ = this;
    let g = this.devTool.game;

    let p = Promise.resolve();

    if(!g.enemies)
    {
      p = g.initActors();
    }
    
    p.then(()=>{
      let ui = this.ui = this.devTool.debugUi.append('div')
      .attr('id','enemy')
      .classed('controller',true)
      .style('display','active');
      
      this.formNo = 0;

      let controllerData = 
      [
        //　ゲームプレイ
        {
          name:'play',
          func(){
          }
        }
      ];
      
      let buttons = ui.selectAll('button').data(controllerData)
      .enter().append('button');
      buttons.attr('class',d=>d.name);
      
      buttons.on('click',function(d){
        d.func.apply(d3.select(this));
      });

      ui.append('span').text('ステージ').style({'width':'100px','display':'inline-block','text-align':'center'});
  
      var stage = ui
      .append('input')
      .attr({'type':'text','value':g.stage.no})
      .style({'width':'40px','text-align':'right'});
      g.stage.on('update',(d)=>{
        stage.node().value = d.no;
      });
      
      stage.on('change',function(){
        let v =  parseInt(this.value);
        v = isNaN(v)?0:v;
        if(g.stage.no != v){
          g.stage.jump(v);
        }
      });
      
      // 編隊マップエディタ
      
//       let formhead = ui.append('div');
//       formhead.append('span').text('編隊No');
// 
//       formhead.append('input')
//       .attr({'type':'text','value':this.formNo})
//       .style({'width':'40px','text-align':'right'})
//       .on('change',function(){
//         let v =  parseInt(this.value);
//         this_.formNo = isNaN(v)?0:v;
//       });
//       
//       ui.append('textarea').classed('formdata',true).attr('rows',10)
//       .node().value = JSON.stringify(g.enemies.moveSeqs[this.formNo]);
      
      this.formationEditor = new EnemyFormationEditor(this_,this_.formNo);
      this.movSeqEditor = new EnemyMovSeqEditor(this,0);
      
      this.initialized = true;        
    });

    
    

  }
  
  hide(){
    
  }
}