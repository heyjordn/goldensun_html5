import { TextObj, Window } from "../../Window";
import * as numbers from "../../magic_numbers";
import { DropItemWindow } from "./DropItemWindow";
import { ItemQuantityManagerWindow } from "./ItemQuantityManagerWindow";
import { UseGiveItemWindow } from "./UseGiveItemWindow";
import { GoldenSun } from "../../GoldenSun";
import { Button } from "../../XGamepad";
import { ItemSlot, item_equip_slot, MainChar } from "../../MainChar";
import { Item, item_types } from "../../Item";
import { MainItemMenu } from "../../main_menus/MainItemMenu";
import { CursorManager, PointVariants } from "../../utils/CursorManager";
import { StatsOrClassCheckWithItemWindow } from "./StatsOrClassCheckWithItemWindow";
import { get_text_width } from "../../utils";

const WIN_WIDTH = 132;
const WIN_HEIGHT = 52;
const WIN_X = 104;
const WIN_Y = 0;

const OPTION_TEXT_HORIZONTAL_PADDING = 8;
const OPTION_TEXT_MAX_WIDHT = 40;
const OPTION_TEXT_Y_POS = 32;

const MAX_HORIZONTAL = 3;
const MAX_VERTICAL = 2;

const CHAR_NAME_X = 27;
const CHAR_NAME_Y = 8;

const ITEM_NAME_X = 27;
const ITEM_NAME_Y = CHAR_NAME_Y + numbers.FONT_SIZE;
const ITEM_ICON_X = 8;
const ITEM_ICON_Y = 8;

const DISABLE_COLOR = 0x606060;
const ENABLE_COLOR = 0xffffff;

const ACTION_WINDOW_MSG_X = 110;
const ACTION_WINDOW_MSG_Y = 66;
const ACTION_WINDOW_MSG_WIDTH = 67;
const ACTION_WINDOW_MSG_HEIGHT = 20;

const CURSOR_X_POS = [96, 136, 176];
const CURSOR_Y_POS = [36, 44];

const SEPARATOR_X0 = 4;
const SEPARATOR_X1 = WIN_WIDTH;
const SEPARATOR_Y0 = (WIN_HEIGHT >> 1) + 1;
const SEPARATOR_Y1 = (WIN_HEIGHT >> 1) + 1;

export class ItemOptionsWindow {
  private static readonly ICON_GROUP_KEY = "item_icon";

  public game: Phaser.Game;
  public data: GoldenSun;
  public item_obj: ItemSlot;
  public item: Item;
  public char: MainChar;
  public close_callback: Function;

  public window_open: boolean;
  public window_active: boolean;
  public x: number;
  public y: number;
  public base_window: Window;
  public group: Phaser.Group;

  public text_sprites: {
    use: TextObj;
    equip: TextObj;
    details: TextObj;
    give: TextObj;
    remove: TextObj;
    drop: TextObj;
  };

  public horizontal_index: number;
  public vertical_index: number;

  public option_active: {
    use: boolean;
    equip: boolean;
    details: boolean;
    give: boolean;
    remove: boolean;
    drop: boolean;
  };

  public give_item_options_window: UseGiveItemWindow;
  public item_quantity_manager_window: ItemQuantityManagerWindow;
  public drop_item_window: DropItemWindow;
  public action_message_window: Window;

  public char_name: TextObj;
  public item_name: TextObj;
  public action_msg: TextObj;

  public stats_update_callback: Function;
  public stats_window: StatsOrClassCheckWithItemWindow;
  public item_menu: MainItemMenu;

  constructor(game: Phaser.Game, data: GoldenSun) {
    this.game = game;
    this.data = data;
    this.item_obj = null;
    this.item = null;
    this.char = null;

    this.stats_window = null;
    this.item_menu = null;

    this.window_open = false;
    this.window_active = false;
    this.x = WIN_X;
    this.y = WIN_Y;
    this.base_window = new Window(
      this.game,
      this.x,
      this.y,
      WIN_WIDTH,
      WIN_HEIGHT
    );
    this.group = this.game.add.group();
    this.base_window.draw_separator(
      SEPARATOR_X0,
      SEPARATOR_Y0,
      SEPARATOR_X1,
      SEPARATOR_Y1,
      false
    );

    this.text_sprites = {
      use: this.base_window.set_text_in_position(
        "Use",
        OPTION_TEXT_HORIZONTAL_PADDING,
        OPTION_TEXT_Y_POS
      ),
      equip: this.base_window.set_text_in_position(
        "Equip",
        OPTION_TEXT_HORIZONTAL_PADDING + OPTION_TEXT_MAX_WIDHT,
        OPTION_TEXT_Y_POS
      ),
      details: this.base_window.set_text_in_position(
        "Details",
        OPTION_TEXT_HORIZONTAL_PADDING + 2 * OPTION_TEXT_MAX_WIDHT,
        OPTION_TEXT_Y_POS
      ),
      give: this.base_window.set_text_in_position(
        "Give",
        OPTION_TEXT_HORIZONTAL_PADDING,
        OPTION_TEXT_Y_POS + numbers.FONT_SIZE
      ),
      remove: this.base_window.set_text_in_position(
        "Remove",
        OPTION_TEXT_HORIZONTAL_PADDING + OPTION_TEXT_MAX_WIDHT,
        OPTION_TEXT_Y_POS + numbers.FONT_SIZE
      ),
      drop: this.base_window.set_text_in_position(
        "Drop",
        OPTION_TEXT_HORIZONTAL_PADDING + 2 * OPTION_TEXT_MAX_WIDHT,
        OPTION_TEXT_Y_POS + numbers.FONT_SIZE
      ),
    };

    this.horizontal_index = 0;
    this.vertical_index = 0;

    this.option_active = {
      use: true,
      equip: true,
      details: true,
      give: true,
      remove: true,
      drop: true,
    };

    this.give_item_options_window = new UseGiveItemWindow(this.game, this.data);
    this.item_quantity_manager_window = new ItemQuantityManagerWindow(
      this.game,
      this.data
    );
    this.drop_item_window = new DropItemWindow(this.game, this.data);
    this.action_message_window = new Window(
      this.game,
      ACTION_WINDOW_MSG_X,
      ACTION_WINDOW_MSG_Y,
      ACTION_WINDOW_MSG_WIDTH,
      ACTION_WINDOW_MSG_HEIGHT
    );

    this.action_msg = this.action_message_window.set_text_in_position(
      "",
      undefined,
      undefined,
      { italic: true }
    );
  }

  hide() {
    this.base_window.group.visible = false;
  }

  show() {
    this.base_window.group.visible = true;
  }

  hide_text() {
    for (let key in this.text_sprites) {
      this.text_sprites[key].text.visible = this.text_sprites[
        key
      ].shadow.visible = false;
    }
  }

  show_text() {
    for (let key in this.text_sprites) {
      this.text_sprites[key].text.visible = this.text_sprites[
        key
      ].shadow.visible = true;
    }
  }

  next_vertical() {
    if (this.vertical_index < MAX_VERTICAL - 1)
      this.choose_position(this.vertical_index + 1, this.horizontal_index);
    else this.choose_position(0, this.horizontal_index);
  }

  previous_vertical() {
    if (this.vertical_index > 0)
      this.choose_position(this.vertical_index - 1, this.horizontal_index);
    else this.choose_position(MAX_VERTICAL - 1, this.horizontal_index);
  }

  next_horizontal() {
    if (this.horizontal_index < MAX_HORIZONTAL - 1)
      this.choose_position(this.vertical_index, this.horizontal_index + 1);
    else this.choose_position(this.vertical_index, 0);
  }

  previous_horizontal() {
    if (this.horizontal_index > 0)
      this.choose_position(this.vertical_index, this.horizontal_index - 1);
    else this.choose_position(this.vertical_index, MAX_HORIZONTAL - 1);
  }

  choose_position(vertical: number, horizontal: number) {
    this.vertical_index = vertical;
    this.horizontal_index = horizontal;

    const cursor_x = CURSOR_X_POS[this.horizontal_index];
    const cursor_y = CURSOR_Y_POS[this.vertical_index];

    const tween_config = {
      type: CursorManager.CursorTweens.POINT,
      variant: PointVariants.NORMAL,
    };
    this.data.cursor_manager.move_to(
      { x: cursor_x, y: cursor_y },
      { animate: false, tween_config: tween_config }
    );
    this.on_change();
  }

  set_available_options() {
    this.show_text();
    const current_char_slot: ItemSlot = this.item.equipable
      ? this.char.equip_slots[item_equip_slot[this.item.type]]
      : null;
    if (
      !this.item.use_ability ||
      this.item_obj.broken ||
      !this.data.info.abilities_list[this.item.use_ability]
        .effects_outside_battle
    ) {
      this.text_sprites.use.text.tint = DISABLE_COLOR;
      this.option_active.use = false;
    } else {
      this.text_sprites.use.text.tint = ENABLE_COLOR;
      this.option_active.use = true;
    }
    if (
      !this.item.equipable ||
      this.item_obj.equipped ||
      !this.item.equipable_chars.includes(this.char.key_name) ||
      (current_char_slot &&
        this.data.info.items_list[current_char_slot.key_name]
          .curses_when_equipped)
    ) {
      this.text_sprites.equip.text.tint = DISABLE_COLOR;
      this.option_active.equip = false;
    } else {
      this.text_sprites.equip.text.tint = ENABLE_COLOR;
      this.option_active.equip = true;
    }
    if (
      this.data.info.party_data.members.length <= 1 ||
      (this.item_obj.equipped && this.item.curses_when_equipped)
    ) {
      this.text_sprites.give.text.tint = DISABLE_COLOR;
      this.option_active.give = false;
    } else {
      this.text_sprites.give.text.tint = ENABLE_COLOR;
      this.option_active.give = true;
    }
    if (
      !this.item.equipable ||
      !this.item_obj.equipped ||
      !this.item.equipable_chars.includes(this.char.key_name) ||
      (this.item_obj.equipped && this.item.curses_when_equipped)
    ) {
      this.text_sprites.remove.text.tint = DISABLE_COLOR;
      this.option_active.remove = false;
    } else {
      this.text_sprites.remove.text.tint = ENABLE_COLOR;
      this.option_active.remove = true;
    }
    if (
      this.item.important_item ||
      (this.item_obj.equipped && this.item.curses_when_equipped)
    ) {
      this.text_sprites.drop.text.tint = DISABLE_COLOR;
      this.option_active.drop = false;
    } else {
      this.text_sprites.drop.text.tint = ENABLE_COLOR;
      this.option_active.drop = true;
    }
  }

  set_header() {
    this.base_window.define_internal_group(ItemOptionsWindow.ICON_GROUP_KEY);
    const item = this.data.info.items_list[this.item.key_name];
    this.base_window.make_item_obj(
      this.item.key_name,
      { x: ITEM_ICON_X, y: ITEM_ICON_Y },
      {
        broken: this.item_obj.broken,
        equipped: this.item_obj.equipped,
        quantity: item.carry_up_to_30 ? this.item_obj.quantity : undefined,
        internal_group: ItemOptionsWindow.ICON_GROUP_KEY,
      }
    );

    this.char_name = this.base_window.set_text_in_position(
      this.char.name,
      CHAR_NAME_X,
      CHAR_NAME_Y
    );
    this.item_name = this.base_window.set_text_in_position(
      this.item.name,
      ITEM_NAME_X,
      ITEM_NAME_Y
    );
  }

  unset_header() {
    this.base_window.destroy_text_obj(this.char_name);
    this.base_window.destroy_text_obj(this.item_name);
    this.base_window.destroy_internal_group(ItemOptionsWindow.ICON_GROUP_KEY);
  }

  update_position() {
    this.group.x = this.game.camera.x + this.x;
    this.group.y = this.game.camera.y + this.y;
  }

  open_action_message_window(text: string, close_callback: Function) {
    const text_width = get_text_width(this.game, text, true);
    this.action_message_window.update_size({ width: text_width + 10 });
    this.action_message_window.update_text(text, this.action_msg);
    this.data.cursor_manager.hide();
    if (this.stats_update_callback !== undefined) {
      this.stats_update_callback();
    }

    this.action_message_window.show(undefined, true, () => {
      close_callback();
    });

    this.data.control_manager.add_simple_controls(() => {
      this.action_message_window.close();
      this.data.control_manager.reset();
    });
  }

  on_choose() {
    if (this.horizontal_index === 0) {
      if (this.vertical_index === 0 && this.option_active.use) {
        //Use
        this.deactivate();
        this.give_item_options_window.open(
          this.item_obj,
          this.item,
          this.char,
          this.item_menu,
          false,
          () => {
            this.data.cursor_manager.show();
            this.item_menu.choosing_destination = false;
            this.item_menu.shift_item_overview(false);
            if (this.give_item_options_window.choosing_char) {
              this.open_options(this.vertical_index, this.horizontal_index);
            }
          }
        );
      } else if (this.vertical_index === 1 && this.option_active.give) {
        //Give
        this.deactivate();
        this.give_item_options_window.open(
          this.item_obj,
          this.item,
          this.char,
          this.item_menu,
          true,
          () => {
            this.data.cursor_manager.show();
            this.item_menu.choosing_destination = false;
            this.item_menu.shift_item_overview(false);
            if (this.give_item_options_window.choosing_char) {
              this.open_options(this.vertical_index, this.horizontal_index);
            }
          }
        );
      }
    } else if (this.horizontal_index === 1) {
      if (this.vertical_index === 0 && this.option_active.equip) {
        //Equip
        this.char.equip_item(this.item_obj.index);
        this.open_action_message_window("Equipped it.", () => {
          if (this.item.curses_when_equipped) {
            this.open_action_message_window("You were cursed!", () => {
              this.close(this.close_callback);
            });
          } else {
            this.close(this.close_callback);
          }
        });
      }
      if (this.vertical_index === 1 && this.option_active.remove) {
        //Remove
        this.char.unequip_item(this.item_obj.index);
        this.open_action_message_window("Removed.", () => {
          this.close(this.close_callback);
        });
      }
    } else if (this.horizontal_index === 2) {
      if (this.vertical_index === 0 && this.option_active.details) {
        //Details
        this.deactivate();
        this.item_menu.show_details(this.item, this.item_obj, () => {
          this.data.cursor_manager.show();
          this.item_menu.choosing_destination = false;
          this.item_menu.shift_item_overview(false);
          this.open_options(this.vertical_index, this.horizontal_index);
        });
      } else if (this.vertical_index === 1 && this.option_active.drop) {
        //Drop
        this.deactivate();
        this.drop_item_window.open(
          this.item_obj,
          this.item,
          this.char,
          this.item_menu,
          () => {
            if (this.drop_item_window.dropped) {
              this.hide_text();
              this.item_menu.item_choose_window.close();
              this.item_menu.shift_item_overview(true, false);
              this.open_action_message_window("Dropped it.", () => {
                this.close(this.close_callback);
              });
            } else
              this.open_options(this.vertical_index, this.horizontal_index);
          }
        );
      }
    }
  }

  on_change() {
    this.stats_window.hide_arrows();

    if (this.stats_window.window_open) this.stats_window.close();

    this.stats_window.open(this.char, this.item, this.item_obj);

    if (this.horizontal_index === 0) {
      if (this.vertical_index === 0 && this.option_active.use) {
        this.stats_window.hide();
      }
      if (
        this.vertical_index === 1 &&
        this.option_active.give &&
        this.item_obj.equipped
      ) {
        this.stats_window.compare_items(true);
      }
    } else if (this.horizontal_index === 1) {
      if (this.vertical_index === 0 && this.option_active.equip) {
        this.stats_window.compare_items();
      }
      if (this.vertical_index === 1 && this.option_active.remove) {
        this.stats_window.compare_items(true);
      }
    } else if (this.horizontal_index === 2) {
      if (
        this.vertical_index === 1 &&
        this.option_active.drop &&
        this.item_obj.equipped
      ) {
        this.stats_window.compare_items(true);
      }
    }
  }

  open_options(vertical: number = 0, horizontal: number = 0) {
    this.set_header();
    this.item_menu.item_choose_window.deactivate();

    if (this.item.type === item_types.ABILITY_GRANTOR) {
    } else if (this.item.type !== item_types.GENERAL_ITEM) {
      this.item_menu.item_change_stats_window.open(
        this.data.info.party_data.members[
          this.item_menu.item_choose_window.char_index
        ],
        this.item,
        this.item_obj
      );
      this.item_menu.item_change_stats_window.compare_items();
    }
    this.item_menu.chars_menu.select_char(
      this.item_menu.item_choose_window.char_index
    );
    this.item_menu.item_options_window.stats_window.compare_items(true);

    this.item_menu.set_description_window_text(this.item.description, true);

    this.choose_position(vertical, horizontal);

    //Missing sound for item removal
    //Missing check for item use and item remove, and using appropriate sound
    const controls = [
      {
        buttons: Button.LEFT,
        on_down: this.previous_horizontal.bind(this),
        sfx: { down: "menu/move" },
      },
      {
        buttons: Button.RIGHT,
        on_down: this.next_horizontal.bind(this),
        sfx: { down: "menu/move" },
      },
      {
        buttons: Button.UP,
        on_down: this.next_vertical.bind(this),
        sfx: { down: "menu/move" },
      },
      {
        buttons: Button.DOWN,
        on_down: this.previous_vertical.bind(this),
        sfx: { down: "menu/move" },
      },
      {
        buttons: Button.A,
        on_down: this.on_choose.bind(this),
        sfx: { down: "menu/positive" },
      },
      {
        buttons: Button.B,
        on_down: this.close.bind(this, this.close_callback),
        sfx: { down: "menu/negative" },
      },
    ];

    this.data.control_manager.add_controls(controls, {
      loop_config: { vertical: true, horizontal: true },
    });
  }

  open(
    item_obj: ItemSlot,
    item: Item,
    char: MainChar,
    stats_window: StatsOrClassCheckWithItemWindow,
    item_menu: MainItemMenu,
    close_callback: Function,
    stats_update_callback: Function,
    open_callback?: Function
  ) {
    this.item_obj = item_obj;
    this.item = item;
    this.char = char;
    this.stats_window = stats_window;
    this.item_menu = item_menu;

    this.close_callback = close_callback;
    this.stats_update_callback = stats_update_callback;
    this.update_position();
    this.set_available_options();
    this.on_change();

    this.open_options();

    this.base_window.show(() => {
      this.window_open = true;
      this.window_active = true;
      if (open_callback !== undefined) {
        open_callback();
      }
    }, false);
  }

  close(callback?: Function) {
    this.data.cursor_manager.hide();
    this.data.control_manager.reset();

    this.unset_header();
    this.base_window.close(() => {
      this.window_open = false;
      this.window_active = false;
      if (callback !== undefined) {
        callback();
      }
    }, false);
  }

  activate() {
    this.set_header();
    this.set_available_options();
    this.on_change();
    this.window_active = true;
  }

  deactivate() {
    this.unset_header();
    this.data.cursor_manager.hide();
    this.window_active = false;
  }
}
