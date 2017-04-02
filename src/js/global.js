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
export const CHECK_COLLISION = true;
export const DEBUG = false;
export var textureFiles = {};
export var stage = 0;
export var tasks = null;
export var gameTimer = null;
export var bombs = null;
export var addScore = null;
export var myship_ = null;
export var textureRoot = './res/';
export var pause = false;
export var game = null;

export function setGame(v){game = v;}
export function setPause(v){pause = v;}
export function setMyShip(v){myship_ = v;}
export function setAddScore(v){addScore = v;}
export function setBombs(v){bombs = v;}
export function setGameTimer(v){gameTimer = v;}
export function setTasks(v){tasks = v;}
export function setStage(v){stage = v;}

