export const VIRTUAL_WIDTH = 240;
export const VIRTUAL_HEIGHT = 320;

export const V_RIGHT = VIRTUAL_WIDTH / 2.0;
export const V_TOP = VIRTUAL_HEIGHT / 2.0;
export const V_LEFT = -1 * VIRTUAL_WIDTH / 2.0;
export const V_BOTTOM = -1 * VIRTUAL_HEIGHT / 2.0;

export const CHAR_SIZE = 8;
export const TEXT_WIDTH = VIRTUAL_WIDTH / CHAR_SIZE;
export const TEXT_HEIGHT = VIRTUAL_HEIGHT / CHAR_SIZE;
export const PIXEL_SIZE = 1;
export const ACTUAL_CHAR_SIZE = CHAR_SIZE * PIXEL_SIZE;
export const SPRITE_SIZE_X = 16.0;
export const SPRITE_SIZE_Y = 16.0;
export var CHECK_COLLISION = true;
export const DEBUG = false;
export var textureFiles = {};
export var stage;
export var tasks;
export var gameTimer;
export var bombs;
export var addScore;
export var myship_;
export const textureRoot = './res/';
export var pause = false;
export var game;


