import { get_text_width } from "../utils";
import * as numbers from "../magic_numbers";
import { TextObj, Window } from "../Window";
import { GoldenSun } from "../GoldenSun";
import { Button } from "../XGamepad";
import * as _ from "lodash";

const FORWARD = 1;
const BACKWARD = -1;

const BUTTON_WIDTH = 24;
const BUTTON_HEIGHT = 24;
const BUTTON_Y = numbers.GAME_HEIGHT - BUTTON_HEIGHT;

const ACTIVE_DEFAULT = 1.15;
const MAX_SCALE_DEFAULT = 1.25;

const TITLE_WINDOW_HEIGHT =
  BUTTON_HEIGHT - numbers.OUTSIDE_BORDER_WIDTH - numbers.INSIDE_BORDER_WIDTH;

export class HorizontalMenu {
  public game: Phaser.Game;
  public data: GoldenSun;
  public buttons_keys: string[];
  public titles: string[];
  public on_cancel: Function;
  public on_press: Function;
  public buttons_number: number;

  public title_window_width: number;
  public dock_right: boolean;

  public custom_scale: {
    active_default: number;
    max_scale: number;
  };
  public selected_button_index: number;
  public menu_open: boolean;
  public menu_active: boolean;
  public selected_button_tween: Phaser.Tween;

  public x: number;
  public y: number;
  public title_window: Window;

  public group: Phaser.Group;
  public buttons: {
    sprite: Phaser.Sprite;
    title: string;
  }[];
  public title_text_obj: TextObj;

  constructor(
    game: Phaser.Game,
    data: GoldenSun,
    buttons: string[],
    titles: string[],
    callbacks: {
      on_cancel?: Function;
      on_press: Function;
    },
    title_window_width?: number,
    dock_right: boolean = false
  ) {
    this.game = game;
    this.data = data;
    this.buttons_keys = buttons;
    this.titles = titles;
    this.on_cancel = () => {
      if (this.on_cancel) {
        if (callbacks.on_cancel) callbacks.on_cancel();
      }
    };
    this.on_press = () => {
      if (this.on_press) {
        if (callbacks.on_press) callbacks.on_press();
      }
    };
    this.buttons_number = buttons.length;

    const max_title_width = get_text_width(
      this.game,
      _.maxBy(titles, (title) => title.length)
    );
    this.title_window_width =
      title_window_width !== undefined
        ? title_window_width
        : max_title_width +
          2 * (numbers.WINDOW_PADDING_H + numbers.INSIDE_BORDER_WIDTH);
    const total_width =
      BUTTON_WIDTH * this.buttons_number +
      this.title_window_width +
      2 * numbers.OUTSIDE_BORDER_WIDTH +
      2;
    this.dock_right = dock_right;

    this.custom_scale = null;
    this.selected_button_index = 0;
    this.menu_open = false;
    this.menu_active = false;
    this.selected_button_tween = null;

    this.x = numbers.GAME_WIDTH - total_width;
    if (!this.dock_right) this.x = this.x >> 1;
    this.y = BUTTON_Y;

    this.title_window = new Window(
      this.game,
      this.x + BUTTON_WIDTH * this.buttons_number,
      this.y,
      this.title_window_width,
      TITLE_WINDOW_HEIGHT
    );
    this.group = game.add.group();
    this.group.visible = false;
    this.group.width = 0;
    this.group.height = 0;

    this.title_text_obj = this.title_window.set_text_in_position("");

    this.mount_buttons();
  }

  set_controls() {
    const controls = [
      {
        buttons: Button.LEFT,
        on_down: this.previous_button.bind(this),
        sfx: { down: "menu/move" },
      },
      {
        buttons: Button.RIGHT,
        on_down: this.next_button.bind(this),
        sfx: { down: "menu/move" },
      },
      {
        buttons: Button.A,
        on_down: this.on_press.bind(this),
        sfx: { down: "menu/positive" },
      },
      {
        buttons: Button.B,
        on_down: this.on_cancel.bind(this),
        sfx: { down: "menu/negative" },
      },
    ];

    this.data.control_manager.add_controls(controls, {
      loop_config: { horizontal: true },
    });
  }

  mount_buttons(filtered_buttons: string[] = []) {
    const buttons = this.buttons_keys.filter(
      (key) => !filtered_buttons.includes(key)
    );
    this.buttons_number = buttons.length;
    const total_width =
      BUTTON_WIDTH * this.buttons_number +
      this.title_window_width +
      (numbers.OUTSIDE_BORDER_WIDTH << 1) +
      2;
    this.x = numbers.GAME_WIDTH - total_width;

    if (!this.dock_right) this.x = this.x >> 1;
    this.title_window.update_position({
      x: this.x + BUTTON_WIDTH * this.buttons_number,
    });

    if (this.buttons) {
      this.buttons.forEach((obj) => {
        obj.sprite.destroy();
      });
    }

    this.buttons = new Array(this.buttons_number);
    for (let i = 0; i < this.buttons_number; ++i) {
      this.buttons[i] = {
        sprite: this.group.create(0, 0, "buttons", buttons[i]),
        title: this.titles[i],
      };
      this.buttons[i].sprite.anchor.setTo(0.5, 1);
      this.buttons[i].sprite.centerX = (BUTTON_WIDTH * (i + 0.5)) | 0;
      this.buttons[i].sprite.centerY = (BUTTON_HEIGHT >> 1) | 0;
    }
  }

  change_button(step: number) {
    this.reset_button();

    this.selected_button_index =
      (this.selected_button_index + step) % this.buttons_number;
    if (this.selected_button_index < 0) {
      this.selected_button_index = this.buttons_number - 1;
    }

    this.title_window.update_text(
      this.buttons[this.selected_button_index].title,
      this.title_text_obj
    );
    this.set_button();
  }

  next_button() {
    this.change_button(FORWARD);
  }

  previous_button() {
    this.change_button(BACKWARD);
  }

  set_to_position(index: number) {
    this.reset_button();

    this.selected_button_index = index;
    this.title_window.update_text(
      this.buttons[this.selected_button_index].title,
      this.title_text_obj
    );

    this.set_button();
  }

  set_button() {
    let active_default = ACTIVE_DEFAULT;
    let max_scale = MAX_SCALE_DEFAULT;

    if (this.custom_scale) {
      active_default = this.custom_scale.active_default;
      max_scale = this.custom_scale.max_scale;
    }

    this.buttons[this.selected_button_index].sprite.scale.setTo(
      active_default,
      active_default
    );
    this.buttons[this.selected_button_index].sprite.bringToTop();
    this.selected_button_tween = this.game.add
      .tween(this.buttons[this.selected_button_index].sprite.scale)
      .to(
        { x: max_scale, y: max_scale },
        Phaser.Timer.QUARTER >> 1,
        Phaser.Easing.Linear.None,
        true,
        0,
        -1,
        true
      );
  }

  reset_button() {
    if (this.buttons[this.selected_button_index]) {
      this.buttons[this.selected_button_index].sprite.scale.setTo(1.0, 1.0);
    }

    if (this.selected_button_tween) {
      this.selected_button_tween.stop();
    }
  }

  update_position() {
    this.group.x = this.game.camera.x + this.x;
    this.group.y = this.game.camera.y + this.y;
    this.title_window.update();
  }

  open(
    callback?: Function,
    select_index: number = 0,
    start_active: boolean = true,
    custom_scale?: { active_default: number; max_scale: number }
  ) {
    this.reset_button();

    if (custom_scale) this.custom_scale = custom_scale;

    this.menu_active = start_active;
    this.group.visible = true;
    this.selected_button_index = select_index;

    this.update_position();
    this.title_window.update_text(
      this.buttons[this.selected_button_index].title,
      this.title_text_obj
    );

    let window_promise_resolve: () => void;
    let window_promise = new Promise((resolve) => {
      window_promise_resolve = resolve as () => void;
    });
    this.title_window.show(window_promise_resolve);

    let buttons_resolve: Function;
    let buttons_promise = new Promise((resolve) => {
      buttons_resolve = resolve;
    });

    this.game.add
      .tween(this.group)
      .to(
        {
          width: BUTTON_WIDTH * this.buttons_number,
          height: BUTTON_HEIGHT,
        },
        Phaser.Timer.QUARTER >> 2,
        Phaser.Easing.Linear.None,
        true
      )
      .onComplete.addOnce(buttons_resolve);

    Promise.all([window_promise, buttons_promise]).then(() => {
      this.set_button();
      this.menu_open = true;
      if (callback) {
        callback();
      }
      this.set_controls();
      this.game.world.bringToTop(this.group);
    });
  }

  close(callback?: Function, animate: boolean = true) {
    if (!this.menu_open) {
      return;
    }

    this.reset_button();
    this.data.control_manager.reset();

    this.menu_open = false;
    this.group.visible = false;

    if (animate) {
      let window_promise_resolve: () => void;
      let window_promise = new Promise((resolve) => {
        window_promise_resolve = resolve as () => void;
      });
      this.title_window.close(window_promise_resolve);

      const transition_time = Phaser.Timer.QUARTER >> 2;
      let buttons_resolve: Function;
      let buttons_promise = new Promise((resolve) => {
        buttons_resolve = resolve;
      });

      this.game.add
        .tween(this.group)
        .to(
          { width: 0, height: 0 },
          transition_time,
          Phaser.Easing.Linear.None,
          true
        )
        .onComplete.addOnce(buttons_resolve);
      Promise.all([window_promise, buttons_promise]).then(
        callback !== undefined ? (callback as () => void) : () => {}
      );
    } else {
      this.title_window.close(undefined, false);
      this.group.width = this.group.height = 0;
      if (callback) {
        callback();
      }
    }
  }

  activate() {
    this.menu_active = true;

    this.buttons.forEach((obj) => {
      obj.sprite.visible = true;
    });

    if (!this.title_window.open) {
      this.title_window.show(undefined, false);
    }

    this.title_window.update_text(
      this.buttons[this.selected_button_index].title,
      this.title_text_obj
    );
    this.set_button();
    this.set_controls();
  }

  deactivate(hide = false) {
    this.data.control_manager.reset();
    this.reset_button();
    this.menu_active = false;

    if (hide) {
      this.buttons.forEach((obj) => {
        obj.sprite.visible = false;
      });
      this.title_window.close(undefined, false);
    }
  }

  destroy() {
    this.title_window.destroy(false);
    this.group.destroy();
  }
}
