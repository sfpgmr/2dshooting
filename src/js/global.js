class sfg_ {
    constructor() {
        this.game = null;
        this.VIRTUAL_WIDTH = 240;
        this.VIRTUAL_HEIGHT = 320;

        this.V_RIGHT = this.VIRTUAL_WIDTH / 2.0;
        this.V_TOP = this.VIRTUAL_HEIGHT / 2.0;
        this.V_LEFT = -1 * this.VIRTUAL_WIDTH / 2.0;
        this.V_BOTTOM = -1 * this.VIRTUAL_HEIGHT / 2.0;

        this.CHAR_SIZE = 8;
        this.TEXT_WIDTH = this.VIRTUAL_WIDTH / this.CHAR_SIZE;
        this.TEXT_HEIGHT = this.VIRTUAL_HEIGHT / this.CHAR_SIZE;
        this.PIXEL_SIZE = 1;
        this.ACTUAL_CHAR_SIZE = this.CHAR_SIZE * this.PIXEL_SIZE;
        this.SPRITE_SIZE_X = 16.0;
        this.SPRITE_SIZE_Y = 16.0;
        this.CHECK_COLLISION = true;
        this.DEBUG = false;
        this.textureFiles = {};
        this.stage = 0;
        this.tasks = null;
        this.gameTimer = null;
        this.bombs = null;
        this.addScore = null;
        this.myship_ = null;
        this.textureRoot = './res/';
        this.pause = false;
        this.game = null;
    }
}

export var sfg = new sfg_();
