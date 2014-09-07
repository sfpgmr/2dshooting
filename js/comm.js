/// <reference path="../../../scripts/dsp.js" />
/// <reference path="../../../scripts/three/three.js" />
/// <reference path="graphics.js" />
/// <reference path="io.js" />
/// <reference path="song.js" />
/// <reference path="audio.js" />
/// <reference path="text.js" />
/// <reference path="util.js" />
/// <reference path="gameobj.js" />
/// <reference path="enemies.js" />
/// <reference path="effectobj.js" />
/// <reference path="myship.js" />
/// <reference path="game.js" />
/// <reference path="http://localhost:8081/socket.io/socket.io.js" />

function Comm() {
  this.enable = false;
  try {
    this.socket = io.connect('http://' + window.location.hostname + ':8081/test');
    this.enable = true;
    var self = this;
    this.socket.on('sendHighScores', this.updateHighScores);
    this.socket.on('sendHighScore', function (data) {
      self.updateHighScore(data);
    });
    this.socket.on('sendRank', function (data) {
      self.updateHighScores(data.highScores);
    });

    this.socket.on('errorConnectionMax', function () {
      alert('同時接続の上限に達しました。');
      self.enable = false;
    });

    this.socket.on('disconnect', function () {
      if (self.enable) {
        self.enable = false;
        alert('サーバー接続が切断されました。');
      }
    });

  } catch (e) {
    alert('Socket.IOが利用できないため、ハイスコア情報が取得できません。' + e);
  }
}

Comm.prototype = {
  sendScore:function(score)
  {
    if (this.enable) {
      this.socket.emit('sendScore', score);
    }
  },
  updateHighScores: function (data) {
    highScores = data;
    console.log(data);
    highScore = highScores[0].score;
  },
  updateHighScore: function (data) {
    if (highScore < data.score) {
      console.log('update highscore');
      highScore = data.score;
      printScore();
    }
  },
  disconnect:function()
  {
    if (this.enable) {
      this.enable = false;
      this.socket.disconnect();
    }
  }
}
