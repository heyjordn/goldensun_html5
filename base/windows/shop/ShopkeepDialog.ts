import { DialogManager } from "../../utils/DialogManager";
import { GoldenSun } from "../../GoldenSun";
import * as _ from "lodash";

const FRAME_SIZE = 36;

export type DialogData = {
  key_name: string;
  messages: DialogMessage[];
};

export type DialogMessage = {
  key: string;
  text: string;
};

export class ShopkeepDialog {
  public game: Phaser.Game;
  public data: GoldenSun;

  public shop_key: string;
  public avatar_key: string;
  public dialog_key: string;
  public voice_key: string;

  public dialog_manager: DialogManager;
  public messages: { [key: string]: DialogMessage };
  public current_message: string;
  public is_active: boolean;

  constructor(game: Phaser.Game, data: GoldenSun) {
    this.game = game;
    this.data = data;

    this.shop_key = null;
    this.avatar_key = null;
    this.dialog_key = null;

    this.dialog_manager = new DialogManager(this.game, this.data);

    this.messages = null;
    this.current_message = null;
    this.is_active = false;
  }

  open(
    shop_key: string,
    avatar_key: string,
    dialog_key: string,
    voice_key: string
  ) {
    this.shop_key = shop_key;
    this.avatar_key = avatar_key;
    this.dialog_key = dialog_key;
    this.voice_key = voice_key;
    this.messages = _.mapKeys(
      this.data.shop_menu.shopkeep_dialog_db[this.dialog_key].messages,
      (messages) => messages.key
    );

    this.update_dialog("welcome");
  }

  update_position() {
    this.dialog_manager.update_position();
  }

  replace_text(message: string, hero?: string, item?: string, price?: string) {
    do {
      if (message.includes("${HERO}"))
        message = message.replace("${HERO}", hero);
      if (message.includes("${ITEM}"))
        message = message.replace("${ITEM}", item);
      if (message.includes("${PRICE}"))
        message = message.replace("${PRICE}", price);
    } while (
      message.includes("${HERO}") ||
      message.includes("${ITEM}") ||
      message.includes("${PRICE}")
    );

    return message;
  }

  get_message(message_key: string) {
    return this.messages[message_key].text;
  }

  update_dialog(
    message: string,
    show_crystal: boolean = false,
    is_key: boolean = true,
    callback?: (finished: boolean) => void
  ) {
    if (is_key) this.current_message = this.messages[message].text;
    else this.current_message = message;
    this.is_active = true;

    this.dialog_manager.next_dialog(this.current_message, callback, {
      avatar: this.avatar_key,
      voice_key: this.voice_key,
      custom_pos: { x: FRAME_SIZE + 4, y: 0 },
      custom_avatar_pos: { x: 0, y: 0 },
      show_crystal: show_crystal,
    });
  }

  close_dialog(callback?: () => void, dialog_only: boolean = true) {
    this.is_active = false;
    this.dialog_manager.kill_dialog(callback, dialog_only);
  }

  close(callback?: () => void) {
    this.close_dialog(callback, false);

    this.shop_key = null;
    this.avatar_key = null;
    this.dialog_key = null;

    this.messages = null;
    this.current_message = null;
  }
}
