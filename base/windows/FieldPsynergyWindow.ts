import { TextObj, Window } from "../Window";
import * as numbers from "../magic_numbers";
import { GoldenSun } from "../GoldenSun";

const BASE_WIDTH = 10;
const BASE_HEIGHT = 20;
const POS_X = (numbers.GAME_WIDTH >> 1) - (BASE_WIDTH >> 1);
const POS_Y = (numbers.GAME_HEIGHT >> 1) + numbers.HERO_BODY_RADIUS + 6;
const DIFF_THRESHOLD = 90;
const DIFF_CORRECTION = 56;

/*The window showing cast psynergy's name on the field

Input: game [Phaser:Game] - Reference to the running game object
       data [GoldenSun] - Reference to the main JS Class instance*/
export class FieldPsynergyWindow {
  public game: Phaser.Game;
  public data: GoldenSun;
  public window: Window;
  public text_obj: TextObj;

  constructor(game, data) {
    this.game = game;
    this.data = data;
    this.window = new Window(this.game, POS_X, POS_Y, BASE_WIDTH, BASE_HEIGHT);
    this.text_obj = this.window.set_text_in_position("", undefined, undefined, {
      italic: true,
    });
  }

  /*Calculates a vertical offset so the window doesn't cover the hero

    Output: [number] - The vertical offset to apply*/
  vertical_adjust() {
    let diff = this.data.hero.sprite.y - this.game.camera.y;
    return diff > DIFF_THRESHOLD
      ? -DIFF_CORRECTION + (diff - DIFF_THRESHOLD)
      : 0;
  }

  /*Opens the window with the psynergy name

    Input: text [string] - The psynergy name to show
           callback [function] - Callback function (Optional)*/
  open(text, callback?) {
    this.window.send_to_front();
    this.window.update_text(text, this.text_obj);
    this.window.update_size({
      width: BASE_WIDTH + this.text_obj.text.width,
      height: BASE_HEIGHT,
    });
    this.window.update_position({
      x: (POS_X - (this.text_obj.text.width >> 1)) | 0,
      y: (POS_Y + this.vertical_adjust()) | 0,
    });

    this.window.show(() => {
      if (callback !== undefined) {
        callback();
      }
    }, false);
  }

  /*Closes the window

    Input: callback [function] - Callback function (Optional)*/
  close(callback?) {
    this.window.close(() => {
      if (callback !== undefined) {
        callback();
      }
    }, false);
  }
}
