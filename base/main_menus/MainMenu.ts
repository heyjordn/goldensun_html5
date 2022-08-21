import { MainPsynergyMenu } from "./MainPsynergyMenu";
import { MainItemMenu } from "./MainItemMenu";
import { MainDjinnMenu } from "./MainDjinnMenu";
import { MainStatusMenu } from "./MainStatusMenu";
import { CharsStatusWindow } from "../windows/CharsStatusWindow";
import { GoldenSun } from "../GoldenSun";
import { Button } from "../XGamepad";
import { HorizontalMenu } from "../support_menus/HorizontalMenu";
import * as _ from "lodash";

export class MainMenu {
  private static readonly TITLE_WINDOW_WIDTH = 70;
  private game: Phaser.Game;
  private data: GoldenSun;

  private buttons_keys: string[];
  private current_index: number;

  public chars_status_window: CharsStatusWindow;
  private horizontal_menu: HorizontalMenu;
  private psynergy_menu: MainPsynergyMenu;
  private item_menu: MainItemMenu;
  private djinn_menu: MainDjinnMenu;
  private status_menu: MainStatusMenu;

  public constructor(game: Phaser.Game, data: GoldenSun) {
    this.game = game;
    this.data = data;

    this.buttons_keys = ["psynergy", "djinni", "item", "status"];
    this.current_index = 0;

    this.chars_status_window = new CharsStatusWindow(this.game, this.data);
    this.horizontal_menu = new HorizontalMenu(
      this.game,
      this.data,
      this.buttons_keys,
      this.buttons_keys.map((b) => _.capitalize(b)),
      {
        on_press: this.button_press.bind(this),
        on_cancel: this.close_menu.bind(this),
      },
      MainMenu.TITLE_WINDOW_WIDTH
    );
    this.psynergy_menu = new MainPsynergyMenu(this.game, this.data);
    this.item_menu = new MainItemMenu(this.game, this.data);
    this.djinn_menu = new MainDjinnMenu(this.game, this.data);
    this.status_menu = new MainStatusMenu(this.game, this.data);
  }

  public get is_active() {
    return this.horizontal_menu.menu_active;
  }

  private button_press() {
    this.current_index = this.horizontal_menu.selected_button_index;

    switch (this.buttons_keys[this.horizontal_menu.selected_button_index]) {
      case "psynergy":
        this.button_press_action(this.psynergy_menu);
        break;
      case "djinni":
        this.button_press_action(this.djinn_menu);
        break;
      case "item":
        this.button_press_action(this.item_menu);
        break;
      case "status":
        this.button_press_action(this.status_menu);
        break;
    }
  }

  private button_press_action(
    menu: MainPsynergyMenu | MainDjinnMenu | MainItemMenu | MainStatusMenu
  ) {
    this.horizontal_menu.close(() => {
      menu.open_menu((close_this_menu: boolean) => {
        if (close_this_menu) {
          this.close_menu();
        } else {
          this.chars_status_window.update_chars_info();
          this.horizontal_menu.open(undefined, this.current_index);
        }
      });
    }, false);
  }

  public update_position() {
    this.chars_status_window.update_position();
    this.horizontal_menu.update_position();
  }

  public open_menu() {
    if (this.data.map.map_name_window.open) {
      this.data.map.map_name_window.close();
    }
    this.chars_status_window.update_chars_info();
    this.chars_status_window.update_position();
    this.chars_status_window.show();
    this.horizontal_menu.open();
  }

  public close_menu() {
    if (!this.horizontal_menu.menu_active) return;
    this.data.control_manager.reset();
    this.data.cursor_manager.hide();

    let promises: Promise<void>[] = [];

    let closed: () => void;
    let promise = new Promise<void>((resolve) => (closed = resolve));
    promises.push(promise);

    this.horizontal_menu.close(closed);
    this.chars_status_window.close(closed);

    Promise.all(promises).then(() => {
      this.data.menu_open = false;
      this.current_index = 0;
    });
  }
}

export function initialize_menu(game: Phaser.Game, data: GoldenSun) {
  let trigger_menu = () => {
    if (
      data.hero.in_action() ||
      data.hero.walking_over_rope ||
      data.in_battle ||
      !data.assets_loaded ||
      data.shop_open ||
      data.healer_open ||
      data.save_open ||
      data.game_event_manager.on_event ||
      data.tile_event_manager.timers_running ||
      data.tile_event_manager.on_event
    ) {
      return;
    }
    if (!data.menu_open) {
      data.menu_open = true;
      data.hero.stop_char();
      data.hero.update_shadow();
      data.audio.play_se("menu/move");
      data.main_menu.open_menu();
    }
  };

  const controls = [
    { buttons: Button.A, on_down: trigger_menu },
    { buttons: Button.SELECT, on_down: trigger_menu },
  ];

  data.control_manager.add_controls(controls, { persist: true });

  return new MainMenu(game, data);
}
