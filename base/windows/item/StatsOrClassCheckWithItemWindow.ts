import { GoldenSun } from "../../GoldenSun";
import * as _ from "lodash";
import { StatsCheckWithItemWindow } from "./StatsCheckWithItemWindow";
import { ClassChangeWithItemWindow } from "./ClassChangeWithItemWindow";
import { Item, item_types } from "../../Item";

export class StatsOrClassCheckWithItemWindow {
  public game: Phaser.Game;
  public data: GoldenSun;

  private item_change_stats_window: StatsCheckWithItemWindow;
  private item_change_class_window: ClassChangeWithItemWindow;

  private item: Item;

  constructor(game, data) {
    this.game = game;
    this.data = data;

    this.item_change_stats_window = new StatsCheckWithItemWindow(
      this.game,
      this.data
    );
    this.item_change_class_window = new ClassChangeWithItemWindow(
      this.game,
      this.data
    );
  }

  get window_open(): boolean {
    return (
      this.item_change_stats_window.window_open ||
      this.item_change_class_window.window_open
    );
  }

  update_position() {
    if (this.item_change_stats_window.window_open)
      this.item_change_stats_window.update_position();
    if (this.item_change_class_window.window_open)
      this.item_change_class_window.update_position();
  }

  hide() {
    if (this.item_change_stats_window.window_open)
      this.item_change_stats_window.hide();
    if (this.item_change_class_window.window_open)
      this.item_change_class_window.hide();
  }

  show() {
    if (this.item.type === item_types.CLASS_CHANGER) {
      this.item_change_class_window.show();
    } else {
      this.item_change_stats_window.show();
    }
  }

  update_info(set_compare_arrows = true) {
    if (this.item_change_stats_window.window_open)
      this.item_change_stats_window.update_info(set_compare_arrows);
    if (this.item_change_class_window.window_open)
      this.item_change_class_window.update_info();
  }

  hide_arrows() {
    if (this.item_change_stats_window.window_open)
      this.item_change_stats_window.hide_arrows();
  }

  compare_items(compare_removing = false) {
    if (this.item_change_stats_window.window_open)
      this.item_change_stats_window.compare_items(compare_removing);
  }

  open(char, item, item_obj, callback?) {
    this.item = item;

    if (this.item.type === item_types.CLASS_CHANGER) {
      this.item_change_class_window.open(char, item, item_obj, callback);
    } else {
      this.item_change_stats_window.open(char, item, item_obj, callback);
    }
  }

  close(callback?) {
    if (this.item_change_stats_window.window_open)
      this.item_change_stats_window.close(callback);
    if (this.item_change_class_window.window_open)
      this.item_change_class_window.close(callback);
  }
}
