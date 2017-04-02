'use strict';
import EventEmitter from '../../js/EventEmitter3';

export class UndoManager extends EventEmitter {
	constructor(){
		super();
		this.buffer = [];
		this.index = -1;
	}
	
	clear(){
    this.buffer.length = 0;
    this.index = -1;
    this.emit('cleared');
	}
	
	exec(command){
    command.exec();
    if ((this.index + 1) < this.buffer.length)
    {
      this.buffer.length = this.index + 1;
    }
    this.buffer.push(command);
    ++this.index;
    this.emit('executed');
	}
	
	redo(){
    if ((this.index + 1) < (this.buffer.length))
    {
      ++this.index;
      var command = this.buffer[this.index];
      command.redo();
      this.emit('redid');
      if ((this.index  + 1) == this.buffer.length)
      {
        this.emit('redoEmpty');
      }
    }
	}
  undo()
  {
    if (this.buffer.length > 0 && this.index >= 0)
    {
      var command = this.buffer[this.index];
      command.undo();
      --this.index;
      this.emit('undid');
      if (this.index < 0)
      {
        this.index = -1;
        this.emit('undoEmpty');
      }
    }
  }
	
}

var undoManager = new UndoManager();
export default undoManager;