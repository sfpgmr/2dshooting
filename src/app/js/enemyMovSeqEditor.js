"use strict";
import * as Enemies from '../../js/enemies';
import { UndoManager } from './undo'; 

class InputCommand{
  constructor(id,name,desc)
  {
    this.id = id;
    this.name = name;
    this.desc = desc;
  }
  toJSON(){
    return this.name;
  }
};

const InputCommands =
{
  enter: new InputCommand(1,'enter','挿入'),
  esc: new InputCommand(2,'esc','キャンセル'),
  right: new InputCommand(3,'right','カーソル移動（右）'),
  left: new InputCommand(4,'left','カーソル移動（左）'),
  up: new InputCommand(5,'up','カーソル移動（上）'),
  down: new InputCommand(6,'down','カーソル移動（下）'),
  undo: new InputCommand(8,'undo','アンドゥ'),
  redo: new InputCommand(9,'redo','リドゥ'),
  pageUp: new InputCommand(10,'pageUp','ページアップ'),
  pageDown: new InputCommand(11,'pageDown','ページダウン'),
  home: new InputCommand(12,'home','先頭行に移動'),
  end: new InputCommand(13,'end','終端行に移動'),
  scrollUp: new InputCommand(16,'scrollUp','高速スクロールアップ'),
  scrollDown: new InputCommand(17,'scrollDown','高速スクロールダウン'),
  delete: new InputCommand(18,'delete','行削除'),
  linePaste: new InputCommand(19,'linePaste','行ペースト'),
  measureBefore: new InputCommand(20,'measureBefore','小節単位の上移動'),
  measureNext: new InputCommand(21,'measureNext','小節単位の下移動'),
  select:new InputCommand(22,'select','選択の開始・終了'),
  cutEvent:new InputCommand(23,'cutEvent','イベントカット'),
  copyEvent:new InputCommand(24,'copyEvent','イベントコピー'),
  pasteEvent:new InputCommand(25,'pasteEvent','イベントペースト')
};

//
const keyBinds =
  {
    13: [{
      keyCode: 13,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      metaKey: false,
      inputCommand: InputCommands.enter
    }],
    27: [{
      keyCode: 27,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      metaKey: false,
      inputCommand: InputCommands.esc
    }],
    32: [{
      keyCode: 32,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      metaKey: false,
      inputCommand: InputCommands.right
    }],
    39: [{
      keyCode: 39,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      metaKey: false,
      inputCommand: InputCommands.right
    }],
    37: [{
      keyCode: 37,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      metaKey: false,
      inputCommand: InputCommands.left
    }],
    38: [{
      keyCode: 38,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      metaKey: false,
      inputCommand: InputCommands.up
    }],
    40: [{
      keyCode: 40,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      metaKey: false,
      inputCommand: InputCommands.down
    }],
    106: [{
      keyCode: 106,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      metaKey: false,
      inputCommand: InputCommands.insertMeasure
    }],
    90: [{
      keyCode: 90,
      ctrlKey: true,
      shiftKey: false,
      altKey: false,
      metaKey: false,
      inputCommand: InputCommands.undo
    }],
    33: [{
      keyCode: 33,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      metaKey: false,
      inputCommand: InputCommands.pageUp
      },{
        keyCode: 33,
        ctrlKey: false,
        shiftKey: true,
        altKey: false,
        metaKey: false,
        inputCommand: InputCommands.scrollUp
      },{
      keyCode: 33,
      ctrlKey: false,
      shiftKey: false,
      altKey: true,
      metaKey: false,
      inputCommand: InputCommands.measureBefore
      }      ],
    // 82: [{
    //   keyCode: 82,
    //   ctrlKey: true,
    //   shiftKey: false,
    //   altKey: false,
    //   metaKey: false,
    //   inputCommand: InputCommands.pageUp
    // }],
    34: [{ // Page Down 
      keyCode: 34,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      metaKey: false,
      inputCommand: InputCommands.pageDown
    }, {
        keyCode: 34,
        ctrlKey: false,
        shiftKey: true,
        altKey: false,
        metaKey: false,
        inputCommand: InputCommands.scrollDown
      }],
    36: [{
      keyCode: 36,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      metaKey: false,
      inputCommand: InputCommands.home
    }],
    35: [{
      keyCode: 35,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      metaKey: false,
      inputCommand: InputCommands.end
    }],
    89: [{
      keyCode: 89,
      ctrlKey: true,
      shiftKey: false,
      altKey: false,
      metaKey: false,
      inputCommand: InputCommands.delete
    }],
    76: [{
      keyCode: 76,
      ctrlKey: true,
      shiftKey: false,
      altKey: false,
      metaKey: false,
      inputCommand: InputCommands.linePaste
    }],
    117:[// F6
      {
      keyCode: 117,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      metaKey: false,
      inputCommand: InputCommands.select
      }
    ],
    118:[// F7
      {
      keyCode: 118,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      metaKey: false,
      inputCommand: InputCommands.cutEvent
      }
    ],
    119:[// F8
      {
      keyCode: 119,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      metaKey: false,
      inputCommand: InputCommands.copyEvent
      }
    ],
    120:[// F9
      {
      keyCode: 120,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      metaKey: false,
      inputCommand: InputCommands.pasteEvent
      }
    ]
  };

export class EnemyMovSeqEditor {
  constructor(enemyEditor,patternNo) {
    this.undoManager = new UndoManager();
    this.enemyEditor = enemyEditor;
    this.lineBuffer = null;
    this.debugUi = enemyEditor.devTool.debugUi;
    this.editorUi = enemyEditor.ui.append('div').classed('movseq-editor', true);
    this.eventEdit = this.editorUi.append('table').attr('tabindex',0);
    this.headrow = this.eventEdit.append('thead').append('tr');
    this.headrow.append('th').text('No');
    this.headrow.append('th').text('Command');
    this.headrow.append('th').text('param');
    
    this.eventBody = this.eventEdit.append('tbody').attr('id', 'seqevents');
    this.patternNo = patternNo;
  }

  set patternNo(v) 
  {
    if(v == this.patternNo_) return;
    let this_ = this;
    this.patternNo_ = v;
    this.editor && this.editor.return(0);
    this.eventBody.datum(this.enemyEditor.devTool.game.enemies.movePatterns[v]);
    this.editor = doEditor(this.eventBody,this);
    this.editor.next();

    // キー入力ハンドラ
    this.eventEdit.on('keydown', function (d) {
      let e = d3.event;
  //    console.log(e.keyCode);
      let key = keyBinds[e.keyCode];
      let ret = {};
      if (key) {
        key.some((d) => {
          if (d.ctrlKey == e.ctrlKey
            && d.shiftKey == e.shiftKey
            && d.altKey == e.altKey
            && d.metaKey == e.metaKey
            ) {
            ret = this_.editor.next(d);
            return true;
          }
        });
        if (ret.value) {
          d3.event.preventDefault();
          d3.event.cancelBubble = true;
          return false;
        }
      }
    });
  }
}

// エディタ本体
function* doEditor(eventEdit, formEditor) {
  let keycode = 0;// 入力されたキーコードを保持する変数
  let events = eventEdit.datum();// 現在編集中のトラック
  let editView = d3.select('#seqevents');//編集画面のセレクション
  let rowIndex = 0;// 編集画面の現在行
  let currentEventIndex = 0;// イベント配列の編集開始行
  let cellIndex = 0;// 列インデックス
  let cancelEvent = false;// イベントをキャンセルするかどうか
  const NUM_ROW = 10;// １画面の行数
  let selectStartIndex = null;
  let selectEndIndex = null;
  let needDraw = false;
  let g = formEditor.enemyEditor.devTool.game;
  
  //if(!g.tasks.enable){
  //  g.tasks.enable = true;
//    g.tasks.clear();
//    g.tasks.pushTask(g.render.bind(g), g.RENDERER_PRIORITY);
//    g.showSpaceField();
 //   g.enemies.reset();
 //// }

  //g.tasks.process(g);
  
  function setInput() {
    let this_ = this;
    this.attr('contentEditable',function(d,i){
//      if(i != 0){
        return 'true'        
//      } else {
//        return 'false';
//      }
    });

    this.on('focus', function () {
   //   console.log(this.parentNode.rowIndex - 1);
      rowIndex = this.parentNode.rowIndex - 1;
      cellIndex = this.cellIndex;
      //g.enemies.reset();
      let index = parseInt(this_.attr('data-row-index'));
      //formEditor.enemyEditor.devTool.game.enemies.startEnemyIndexed(events[index],index);
    });
  }
  
  function setBlur(){
    let this_ = this; 
    let data = this.data();
     this.on('blur',function(d,i){
       if(needDraw) return;
        //events[parseInt(this_.attr('data-row-index'))];
        //if(this_.attr('data-row-index')){
          let array;
//          let data = this_.data();
          if(i == 2){
            data[2] = this.innerText;
            array = [data[1]].concat(JSON.parse(`[${this.innerText}]`));
          } else {
            data[1] = this.innerText;
            array = [this.innerText].concat(JSON.parse(`[${data[2]}]`));                
          }
          events[parseInt(this_.attr('data-row-index'))] = formEditor.enemyEditor.devTool.game.enemies.createMovePatternFromArray(array);
          console.log(this_,d,i,data,events);
          //needDraw = true;
       // }
      });
  }
  
  
  // 既存イベントの表示
  function drawEvent() 
  {
    let sti = null,sei = null;
    if(selectStartIndex != null && selectEndIndex != null){
        if(currentEventIndex <= selectStartIndex){
          sti = selectStartIndex - currentEventIndex;
          if((currentEventIndex + NUM_ROW) >= selectEndIndex)
          {
            sei = selectEndIndex - currentEventIndex; 
          } else {
            sei = NUM_ROW - 1;
          }
        } else
        {
          sti = 0;
          if((currentEventIndex + NUM_ROW) >= selectEndIndex)
          {
            sei = selectEndIndex - currentEventIndex;
          } else {
            sei = NUM_ROW - 1;          
          }
        }
    }

    let evflagment = 
      events.slice(currentEventIndex, Math.min(currentEventIndex + NUM_ROW,events.length)).map((d,i)=>{
        let array =  d.toJSON();
        if(array.length == 1){
          return [i + currentEventIndex,array[0],''];
        }
        return [i + currentEventIndex,array[0],array.slice(1).join(',')];
      });
    
    editView.selectAll('tr').remove();
    let select = editView.selectAll('tr').data(evflagment);
    let enter = select.enter();
    let rows = enter.append('tr').attr('data-index', (d, i) => i);
    if(sti != null && sei != null){
      rows.each(function(d,i){
        if(i >= sti && i <= sei){
          d3.select(this).classed('selected',true);          
        }
     });
    }
    
    rows.each(function (d, i) {
      let row = d3.select(this);
 
       row.selectAll('td')
      .data(d)
      .enter()
      .append('td')
      .attr('data-row-index',i + currentEventIndex)      
      .text((d)=>d)
      .call(setInput)
      .call(setBlur);
    });

    if (rowIndex > (evflagment.length - 1)) {
      rowIndex = evflagment.length - 1;
    }

  }
	
  // イベントのフォーカス
  function focusEvent() {
    if(!editView.node().rows[rowIndex].cells[cellIndex]){
      debugger;
    }
    editView.node().rows[rowIndex].cells[cellIndex].focus();
  }
	
  // イベントの挿入
  function insertEvent(rowIndex) {
    formEditor.undoManager.exec({
      exec() {
        this.row = editView.node().rows[rowIndex];
        this.cellIndex = cellIndex;
        this.rowIndex = rowIndex;
        this.currentEvetIndex = currentEventIndex;
        this.exec_();
      },
      exec_() {
        var row = d3.select(editView.node().insertRow(this.rowIndex));
        var cols =  row.selectAll('td').data([this.rowIndex + currentEventIndex,'LineMove','0,0,0']);

        cellIndex = 0;
        cols.enter().append('td')
        .call(setInput)
        .call(setBlur)
        .attr('data-row-index',this.rowIndex + currentEventIndex)
        .text(d=>d);

        row.node().cells[this.cellIndex].focus();
        row.attr('data-new', true);
        //needDraw = true;
      },
      redo() {
        this.exec_();
      },
      undo() {
        editView.node().deleteRow(this.rowIndex);
        this.row.cells[this.cellIndex].focus();
      }
    });
  }
  
  // 新規入力行の確定
  function endNewInput(down = true) {
    d3.select(editView.node().rows[rowIndex]).attr('data-new', null);
    // 現在の編集行
    //let curRow = editView.node().rows[rowIndex].cells;
    //let ev = d3.select(editView.node().rows[rowIndex]).selectAll('td').data();
    let ev = [editView.node().rows[rowIndex].cells[1].innerText]
      .concat(JSON.parse(`[${editView.node().rows[rowIndex].cells[2].innerText}]`));
//    ev = [ev[1]].concat(JSON.parse(`[${ev[2]}]`)); 
    ev = formEditor.enemyEditor.devTool.game.enemies.createMovePatternFromArray(ev);
    formEditor.undoManager.exec({
      exec(){
        this.startIndex = rowIndex + currentEventIndex;
        this.ev = ev;
        this.count = ev.length;
        this.enter();
      },
      enter(){
        events.splice(this.startIndex,0,this.ev);
      },
      redo(){
        this.enter();
      },
      undo(){
        events.splice(this.startIndex,this.count);
      }
    });
    
    if (down) {
      if (rowIndex == (NUM_ROW - 1)) {
        ++currentEventIndex;
      } else {
        ++rowIndex;
      }
    }
    // 挿入後、再描画
    needDraw = true;
  }
  
  function addRow(delta)
  {
    rowIndex += delta;
    let rowLength = editView.node().rows.length;
    if(rowIndex >= rowLength){
      let d = rowIndex - rowLength + 1;
      rowIndex = rowLength - 1;
      if((currentEventIndex + NUM_ROW -1) < (events.length - 1)){
        currentEventIndex += d;
        if((currentEventIndex + NUM_ROW -1) > (events.length - 1)){
          currentEventIndex = (events.length - NUM_ROW + 1);
        }
      }
      needDraw = true;
    }
    if(rowIndex < 0){
      let d = rowIndex;
      rowIndex = 0;
      if(currentEventIndex != 0){
        currentEventIndex += d;
        if(currentEventIndex < 0){
          currentEventIndex = 0;
        }
        needDraw = true;
      } 
    }
    focusEvent();
  }
  
  // エンター
  function doEnter(){
    //console.log('CR/LF');
    // 現在の行が新規か編集中か
    let flag = d3.select(editView.node().rows[rowIndex]).attr('data-new');
    if (flag) {
      endNewInput();
    } else {
      //新規編集中の行でなければ、新規入力用行を挿入
      insertEvent(rowIndex);
    }
    cancelEvent = true;
  }
  
  // 右移動
  function doRight(){
    cellIndex++;
    let curRow = editView.node().rows;
    if (cellIndex > (curRow[rowIndex].cells.length - 1)) {
      cellIndex = 1;
      if (rowIndex < (curRow.length - 1)) {
        if (d3.select(curRow[rowIndex]).attr('data-new')) {
          endNewInput();
          return;
        } else {
          addRow(1);
          return;
        }
      }
    }
    focusEvent();
    cancelEvent = true;
  }

  // 左カーソル 
  function doLeft() {
    let curRow = editView.node().rows;
    --cellIndex;
    if (cellIndex < 1) {
      if (rowIndex != 0) {
        if (d3.select(curRow[rowIndex]).attr('data-new')) {
          endNewInput(false);
          return;
        }
        cellIndex = editView.node().rows[rowIndex].cells.length - 1;
        addRow(-1);
        return;
      } else {
        cellIndex = 1;
      }
    }
    focusEvent();
    cancelEvent = true;
  }
  
  // 上移動
  function doUp() {
    let curRow = editView.node().rows;
    if (d3.select(curRow[rowIndex]).attr('data-new')) {
      endNewInput(false);
    } else {
      addRow(-1);
    }
    cancelEvent = true;
  }

  function doDown() {
    let curRow = editView.node().rows;
    if (d3.select(curRow[rowIndex]).attr('data-new')) {
      endNewInput(false);
    }
    addRow(1);
    cancelEvent = true;
  }
  
  function doPageDown() {
    if (currentEventIndex < (events.length - 1)) {
      currentEventIndex += NUM_ROW;
      if (currentEventIndex > (events.length - 1)) {
        currentEventIndex -= NUM_ROW;
      } else {
        needDraw = true;
      }
      focusEvent();
    }
    cancelEvent = true;
  }
  
  function doPageUp(){
    if (currentEventIndex > 0) {
      currentEventIndex -= NUM_ROW;
      if (currentEventIndex < 0) {
        currentEventIndex = 0;
      }
      needDraw = true;
    }
    cancelEvent = true;
  }

  function doScrollUp()
  {
    if (currentEventIndex > 0) {
      --currentEventIndex;
      needDraw = true;
    }
    cancelEvent = true;
  }

  function doScrollDown()
  {
    if ((currentEventIndex + NUM_ROW) <= (events.length - 1)) {
      ++currentEventIndex;
      needDraw = true;
    }
    cancelEvent = true;
  }

  function doHome(){
    if (currentEventIndex > 0) {
      rowIndex = 0;
      currentEventIndex = 0;
      needDraw = true;
    }
    cancelEvent = true;
  }
  
  function doEnd(){
    if (currentEventIndex != (events.length - 1)) {
      rowIndex = 0;
      currentEventIndex = events.length - 1;
      needDraw = true;
    }
    cancelEvent = true;
  }

  function doDelete() {
    if ((rowIndex + currentEventIndex) == (events.length - 1)) {
      cancelEvent = true;
      return;
    }
    formEditor.undoManager.exec(
      {
        exec() {
          this.rowIndex = rowIndex;
          this.currentEventIndex = currentEventIndex;
          this.event = events[this.rowIndex];
          this.rowData = events[this.currentEventIndex + this.rowIndex];
          editView.node().deleteRow(this.rowIndex);
          this.lineBuffer = formEditor.lineBuffer;
          formEditor.lineBuffer = [this.event];
          events.splice(this.currentEventIndex + this.rowIndex,1);
          needDraw = true;
        },
        redo() {
          editView.node().deleteRow(this.rowIndex);
          events.splice(this.currentEventIndex + this.rowIndex,1);
          needDraw = true;
        },
        undo() {
          formEditor.lineBuffer = this.lineBuffer;
          events.splice(this.currentEventIndex + this.rowIndex,0,this.event);
          needDraw = true;
        }
      }
    );
    cancelEvent = true;
  }
  
  function doLinePaste()
  {
    pasteEvent();
  }
  
  function doRedo(){
    formEditor.undoManager.redo();
    cancelEvent = true;
  }

  function doUndo(){
    formEditor.undoManager.undo();
    cancelEvent = true;
  }
  // cutEventの編集から
  // イベントのカット
  function cutEvent()
  {
    formEditor.undoManager.exec(
    {
      exec(){
        this.selectStartIndex = selectStartIndex;
        this.selectEndIndex = selectEndIndex;
        this.cut();
      },
      cut(){
        this.lineBuffer = formEditor.lineBuffer;
        formEditor.lineBuffer = 
        formEditor.lineBuffer.splice(this.selectStartIndex, this.selectEndIndex + 1 - this.selectStartIndex );
        rowIndex = this.selectStartIndex - currentEventIndex;
        needDraw = true;
      },
      redo()
      {
        this.cut();        
      },
      undo(){
       formEditor.lineBuffer.forEach((d,i)=>{
         events.splice(this.selectStartIndex + i,0,d);
       });
       formEditor.lineBuffer = this.lineBuffer;
       needDraw = true;
      }
    });
    cancelEvent = true;
  } 
  
  // イベントのコピー
  function copyEvent()
  {
    formEditor.undoManager.exec(
    {
      exec(){
        this.selectStartIndex = selectStartIndex;
        this.selectEndIndex = selectEndIndex;
        this.copy();
      },
      copy(){
        this.lineBuffer = formEditor.lineBuffer;
        formEditor.lineBuffer = [];
        for(let i = this.selectStartIndex,e = this.selectEndIndex + 1;i< e;++i)
        {
          formEditor.lineBuffer.push(events[i].clone());
        }
        needDraw = true;
      },
      redo()
      {
        this.copy();        
      },
      undo(){
       formEditor.lineBuffer = this.lineBuffer;
       needDraw = true;
      }
    });
    cancelEvent = true;
  }
  
  // イベントのペースト
  function pasteEvent(){
    if(formEditor.lineBuffer){
    formEditor.undoManager.exec(
    {
      exec(){
        this.startIndex = rowIndex + currentEventIndex;
        this.count = formEditor.lineBuffer.length;
        this.paste();
      },
      paste(){
        for(let i = this.count - 1,e = 0;i >= e;--i)
        {
          events.splice(this.startIndex,0,formEditor.lineBuffer[i].clone());
        }
      },
      redo(){
        this.paste();
      },
      undo(){
        events.splice(this.startIndex,this.count);
        needDraw = true;
      }
    });
    needDraw = true;
    }
    cancelEvent = true;
  }
  
  function *doSelect()
  {
    let input;
    let indexBackup = rowIndex + currentEventIndex;
    selectStartIndex = rowIndex + currentEventIndex;
    selectEndIndex = selectStartIndex;
    cancelEvent = true;
    drawEvent();
    focusEvent();
    let exitLoop = false;
    while(!exitLoop)
    {
      input = yield cancelEvent;
      
      switch(input.inputCommand.id){
        case InputCommands.select.id:
          exitLoop = true;
          break;
        case InputCommands.cutEvent.id:
          cutEvent();
          exitLoop = true;
          break;
        case InputCommands.copyEvent.id:
          copyEvent();
          exitLoop = true;
          break;
        default:
          let fn = editFuncs[input.inputCommand.id];
          if(fn){
            fn(input);
          } else {
              cancelEvent = false;
          }
          // 選択範囲の計算
          if(indexBackup != (rowIndex + currentEventIndex))
          {
            let delta = rowIndex + currentEventIndex - indexBackup;
            let indexNext = rowIndex + currentEventIndex;         
            if(delta < 0){
              if(selectStartIndex > indexNext){
                selectStartIndex = indexNext;
              } else {
                selectEndIndex = indexNext;
              }
            } else {
              if(selectEndIndex < indexNext){
                selectEndIndex = indexNext;
              } else {
                selectStartIndex = indexNext;
              }
            }
            indexBackup = rowIndex + currentEventIndex;
            needDraw = true;
            cancelEvent = true;
          }        
        break;
      }
      if(needDraw){
        drawEvent();
        focusEvent();
        needDraw = false;
      }
    }

    // 後始末
    selectStartIndex = null;
    selectEndIndex = null;
    cancelEvent = true;
    drawEvent();
    focusEvent();
    needDraw = false;
  }
  
  var editFuncs = {
    [InputCommands.enter.id]:doEnter,
    [InputCommands.right.id]:doRight,
    [InputCommands.left.id]:doLeft,
    [InputCommands.up.id]:doUp,
    [InputCommands.down.id]:doDown,
    [InputCommands.pageDown.id]:doPageDown,
    [InputCommands.pageUp.id]:doPageUp,
    [InputCommands.scrollUp.id]:doScrollUp,
    [InputCommands.scrollDown.id]:doScrollDown,
    [InputCommands.home.id]:doHome,
    [InputCommands.end.id]:doEnd,
    [InputCommands.delete.id]:doDelete,
    [InputCommands.linePaste.id]:doLinePaste,
    [InputCommands.redo.id]:doRedo,
    [InputCommands.undo.id]:doUndo,
    [InputCommands.pasteEvent.id]:pasteEvent
  };
  
  drawEvent();
  while (true) {
//    console.log('new line', rowIndex, events.length);
    if (events.length == 0 || rowIndex > (events.length - 1)) {
    }
    keyloop:
    while (true) {
      let input = yield cancelEvent;
      if(input.inputCommand.id === InputCommands.select.id)
      {
        yield* doSelect();
      } else {
        let fn = editFuncs[input.inputCommand.id];
        if (fn) {
          fn(input);
          if (needDraw) {
            drawEvent();
            focusEvent();
            needDraw = false;
          }
        } else {
          cancelEvent = false;
 //         console.log('default');
        }
      }
    }
  }
}
