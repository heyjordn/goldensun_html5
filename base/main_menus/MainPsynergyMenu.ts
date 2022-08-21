import { BasicInfoWindow } from "../windows/BasicInfoWindow";
import { ItemPsynergyChooseWindow } from "../windows/ItemPsynergyChooseWindow";
import { TextObj, Window } from "../Window";
import * as numbers from "../magic_numbers";
import { GoldenSun } from "../GoldenSun";
import { CharsMenu, CharsMenuModes } from "../support_menus/CharsMenu";
import { Ability } from "../Ability";
import { AdvanceButton, Button } from "../XGamepad";

const GUIDE_WINDOW_X = 104;
const GUIDE_WINDOW_Y = 0;
const GUIDE_WINDOW_WIDTH = 132;
const GUIDE_WINDOW_HEIGHT = 20;
const DESCRIPTION_WINDOW_X = 0;
const DESCRIPTION_WINDOW_Y = 136;
const DESCRIPTION_WINDOW_WIDTH = 236;
const DESCRIPTION_WINDOW_HEIGHT = 20;
const PSY_OVERVIEW_WIN_X = 104;
const PSY_OVERVIEW_WIN_Y = 24;
const PSY_OVERVIEW_WIN_WIDTH = 132;
const PSY_OVERVIEW_WIN_HEIGHT = 76;
const SHORTCUTS_WINDOW_X = 104;
const SHORTCUTS_WINDOW_Y = 104;
const SHORTCUTS_WINDOW_WIDTH = 132;
const SHORTCUTS_WINDOW_HEIGHT = 28;

const TOTAL_BORDER = numbers.INSIDE_BORDER_WIDTH + numbers.OUTSIDE_BORDER_WIDTH;
const PSY_OVERVIEW_WIN_INSIDE_PADDING_H = 1;
const PSY_OVERVIEW_WIN_INSIDE_PADDING_V = 5;
const PSY_OVERVIEW_WIN_ICONS_PER_LINE = 8;
const PSY_OVERVIEW_WIN_SPACE_BETWN_LINE = 3;
const PSY_OVERVIEW_WIN_SPACE_BETWN_ICO =
  (PSY_OVERVIEW_WIN_WIDTH -
    2 * (numbers.INSIDE_BORDER_WIDTH + PSY_OVERVIEW_WIN_INSIDE_PADDING_H) -
    PSY_OVERVIEW_WIN_ICONS_PER_LINE * numbers.ICON_WIDTH) /
  (PSY_OVERVIEW_WIN_ICONS_PER_LINE - 1);

export class MainPsynergyMenu {
  public game: Phaser.Game;
  public data: GoldenSun;

  public selected_char_index: number;
  public is_open: boolean;
  public choosing_psynergy: boolean;
  public close_callback: Function;
  public choosing_target: boolean;

  public guide_window_msgs: {
    choosing_char: string;
    choosing_psynergy: string;
  };

  public psynergy_choose_window: ItemPsynergyChooseWindow;
  public chars_menu: CharsMenu;
  public basic_info_window: BasicInfoWindow;

  public description_window: Window;
  public guide_window: Window;
  public psynergy_overview_window: Window;
  public shortcuts_window: Window;
  public shortcuts_info: {
    l_ability?: TextObj;
    l_char?: TextObj;
    r_ability?: TextObj;
    r_char?: TextObj;
  };

  public guide_window_text: TextObj;
  public description_window_text: TextObj;
  public selected_ability: Ability;

  constructor(game: Phaser.Game, data: GoldenSun) {
    this.game = game;
    this.data = data;

    this.selected_char_index = 0;
    this.is_open = false;
    this.choosing_psynergy = false;
    this.close_callback = null;
    this.choosing_target = false;

    this.guide_window_msgs = {
      choosing_char: "Whose Psynergy?",
      choosing_psynergy: "Which Psynergy?",
    };

    this.psynergy_choose_window = new ItemPsynergyChooseWindow(
      this.game,
      this.data,
      true,
      this.psynergy_change.bind(this)
    );
    this.chars_menu = new CharsMenu(
      this.game,
      this.data,
      this.char_change.bind(this)
    );
    this.basic_info_window = new BasicInfoWindow(this.game);

    this.guide_window = new Window(
      this.game,
      GUIDE_WINDOW_X,
      GUIDE_WINDOW_Y,
      GUIDE_WINDOW_WIDTH,
      GUIDE_WINDOW_HEIGHT
    );
    this.description_window = new Window(
      this.game,
      DESCRIPTION_WINDOW_X,
      DESCRIPTION_WINDOW_Y,
      DESCRIPTION_WINDOW_WIDTH,
      DESCRIPTION_WINDOW_HEIGHT
    );
    this.psynergy_overview_window = new Window(
      this.game,
      PSY_OVERVIEW_WIN_X,
      PSY_OVERVIEW_WIN_Y,
      PSY_OVERVIEW_WIN_WIDTH,
      PSY_OVERVIEW_WIN_HEIGHT
    );
    this.shortcuts_window = new Window(
      this.game,
      SHORTCUTS_WINDOW_X,
      SHORTCUTS_WINDOW_Y,
      SHORTCUTS_WINDOW_WIDTH,
      SHORTCUTS_WINDOW_HEIGHT
    );
    this.init_shortcuts_window();

    this.guide_window_text = this.guide_window.set_text_in_position("");
    this.description_window_text =
      this.description_window.set_text_in_position("");
  }

  init_shortcuts_window() {
    this.shortcuts_info = {};

    const buttons_bg = this.game.add.graphics(8, 0);
    buttons_bg.beginFill(this.shortcuts_window.color, 1);
    buttons_bg.drawRect(0, 0, 28, 8);
    buttons_bg.endFill();
    this.shortcuts_window.add_sprite_to_window_group(buttons_bg);

    this.shortcuts_window.set_text_in_position(": Change shortcut", 37, 0, {
      with_bg: true,
    });
    this.shortcuts_window.create_at_group(9, 1, "keyboard_buttons", {
      frame: "l_button",
      color: 0x0,
    });
    this.shortcuts_window.create_at_group(8, 0, "keyboard_buttons", {
      frame: "l_button",
    });
    this.shortcuts_window.create_at_group(23, 1, "keyboard_buttons", {
      frame: "r_button",
      color: 0x0,
    });
    this.shortcuts_window.create_at_group(22, 0, "keyboard_buttons", {
      frame: "r_button",
    });

    this.shortcuts_window.create_at_group(9, 9, "keyboard_buttons", {
      frame: "l_button",
      color: 0x0,
    });
    this.shortcuts_window.create_at_group(8, 8, "keyboard_buttons", {
      frame: "l_button",
    });
    this.shortcuts_window.set_text_in_position(":", 23, 8);
    this.shortcuts_info.l_ability = this.shortcuts_window.set_text_in_position(
      "",
      27,
      8
    );
    this.shortcuts_info.l_char = this.shortcuts_window.set_text_in_position(
      "",
      88,
      8
    );

    this.shortcuts_window.create_at_group(9, 17, "keyboard_buttons", {
      frame: "r_button",
      color: 0x0,
    });
    this.shortcuts_window.create_at_group(8, 16, "keyboard_buttons", {
      frame: "r_button",
    });
    this.shortcuts_window.set_text_in_position(":", 23, 16);
    this.shortcuts_info.r_ability = this.shortcuts_window.set_text_in_position(
      "",
      27,
      16
    );
    this.shortcuts_info.r_char = this.shortcuts_window.set_text_in_position(
      "",
      88,
      16
    );
  }

  set_shortcuts_window_info() {
    const l_shortcut_info =
      this.data.info.party_data.psynergies_shortcuts[Button.L];
    if (l_shortcut_info) {
      const char_name =
        this.data.info.main_char_list[l_shortcut_info.main_char].name;
      const ability_name =
        this.data.info.abilities_list[l_shortcut_info.ability].name;
      this.shortcuts_window.update_text(char_name, this.shortcuts_info.l_char);
      this.shortcuts_window.update_text(
        ability_name,
        this.shortcuts_info.l_ability
      );
    } else {
      this.shortcuts_window.update_text("", this.shortcuts_info.l_char);
      this.shortcuts_window.update_text("", this.shortcuts_info.l_ability);
    }

    const r_shortcut_info =
      this.data.info.party_data.psynergies_shortcuts[Button.R];
    if (r_shortcut_info) {
      const char_name =
        this.data.info.main_char_list[r_shortcut_info.main_char].name;
      const ability_name =
        this.data.info.abilities_list[r_shortcut_info.ability].name;
      this.shortcuts_window.update_text(char_name, this.shortcuts_info.r_char);
      this.shortcuts_window.update_text(
        ability_name,
        this.shortcuts_info.r_ability
      );
    } else {
      this.shortcuts_window.update_text("", this.shortcuts_info.r_char);
      this.shortcuts_window.update_text("", this.shortcuts_info.r_ability);
    }
  }

  char_change(char_key?: string, char_index?: number) {
    if (char_index !== undefined) {
      this.selected_char_index = char_index;
    } else {
      if (this.selected_char_index === this.chars_menu.selected_index) {
        return;
      }
      this.selected_char_index = this.chars_menu.selected_index;
    }

    this.basic_info_window.set_char_basic_stats(
      this.data.info.party_data.members[this.selected_char_index]
    );
    this.set_psynergy_icons();

    if (this.psynergy_choose_window.window_open && !this.choosing_target) {
      this.psynergy_choose_window.close();
      this.psynergy_choose_window.open(this.selected_char_index);
    } else if (this.choosing_target && this.selected_ability) {
      this.set_description_window_text(this.selected_ability.description);
    }
  }

  char_choose(
    setting_shortcut: boolean = false,
    shortcut_button?: AdvanceButton.L | AdvanceButton.R
  ) {
    if (this.shortcuts_window.open)
      this.shortcuts_window.close(undefined, false);
    if (this.psynergy_overview_window.open)
      this.psynergy_overview_window.close(undefined, false);

    if (this.chars_menu.is_active) this.chars_menu.deactivate();
    this.choosing_psynergy = true;
    this.set_guide_window_text();

    if (!this.psynergy_choose_window.window_open) {
      this.psynergy_choose_window.open(
        this.chars_menu.selected_index,
        () => {
          this.choosing_psynergy = false;
          this.chars_menu.activate();
          this.set_guide_window_text();
          this.set_description_window_text();
        },
        undefined,
        undefined,
        setting_shortcut
      );
    } else {
      this.psynergy_choose_window.set_cursor_previous_pos();
    }

    this.grant_psynergy_choose_window_control(
      setting_shortcut,
      shortcut_button
    );
  }

  grant_psynergy_choose_window_control(
    setting_shortcut: boolean = false,
    shortcut_button?: AdvanceButton.L | AdvanceButton.R
  ) {
    this.psynergy_choose_window.grant_control(
      this.open_char_select.bind(this),
      () => {
        const psy_win = this.psynergy_choose_window;
        const selected_psy =
          psy_win.element_list[
            psy_win.elements[psy_win.selected_element_index] as string
          ];
        this.psynergy_choose(
          selected_psy as Ability,
          setting_shortcut,
          shortcut_button
        );
      },
      this.chars_menu.next_char.bind(this.chars_menu),
      this.chars_menu.previous_char.bind(this.chars_menu)
    );
  }

  psynergy_change(ability: Ability) {
    this.set_description_window_text(ability.description);
  }

  psynergy_choose(
    ability: Ability,
    setting_shortcut: boolean = false,
    shortcut_button?: AdvanceButton.L | AdvanceButton.R
  ) {
    if (ability.key_name in this.data.info.field_abilities_list) {
      const char = this.data.info.party_data.members[this.selected_char_index];
      if (setting_shortcut) {
        this.data.info.party_data.psynergies_shortcuts[shortcut_button] = {
          main_char: char.key_name,
          ability: ability.key_name,
        };
        this.set_shortcuts_window_info();
        this.open_char_select();
      } else {
        this.close_menu(true);
        this.data.info.field_abilities_list[ability.key_name].cast(
          this.data.hero,
          char.key_name
        );
      }
    } else if (ability.effects_outside_battle) {
      const this_char =
        this.data.info.party_data.members[this.selected_char_index];
      const current_char_index = this.selected_char_index;
      const grant_char_menu_control = () => {
        this.chars_menu.grant_control(
          () => {
            this.set_description_window_text(ability.description);
            this.char_change(undefined, current_char_index);
            this.char_choose();
          },
          () => {
            const dest_char =
              this.chars_menu.lines[this.chars_menu.current_line][
                this.chars_menu.selected_index
              ];
            const ability_used = this.psynergy_choose_window.cast_ability(
              this_char,
              dest_char,
              ability,
              this.description_window,
              this.description_window_text
            );
            if (ability_used) {
              this_char.current_pp -= ability.pp_cost;
              this.data.cursor_manager.hide();
              this.data.control_manager.add_controls([
                {
                  buttons: Button.A,
                  on_down: () => {
                    this.choosing_psynergy = false;
                    this.set_description_window_text();
                    this.choosing_psynergy = true;
                    this.selected_ability = null;
                    this.choosing_target = false;
                    this.char_change(undefined, current_char_index);
                    this.char_choose();
                  },
                  sfx: { down: "menu/positive_3" },
                },
              ]);
            } else {
              grant_char_menu_control();
            }
          }
        );
      };
      if (this_char.current_pp >= ability.pp_cost) {
        this.selected_ability = ability;
        this.choosing_target = true;
        this.chars_menu.select_char(this.selected_char_index);
        grant_char_menu_control();
      }
    } else {
      this.char_choose();
    }
  }

  set_guide_window_text() {
    if (this.choosing_psynergy) {
      this.guide_window.update_text(
        this.guide_window_msgs.choosing_psynergy,
        this.guide_window_text
      );
    } else {
      this.guide_window.update_text(
        this.guide_window_msgs.choosing_char,
        this.guide_window_text
      );
    }
  }

  set_description_window_text(
    description?: string,
    force: boolean = false,
    tween_if_necessary: boolean = false
  ) {
    if (this.description_window.text_tween) {
      this.description_window.clean_text_tween();
      this.description_window.reset_text_position(this.description_window_text);
    }
    if (this.choosing_psynergy || force) {
      this.psynergy_choose_window.set_description_window_text(
        this.description_window,
        this.description_window_text,
        description,
        tween_if_necessary
      );
    } else {
      this.description_window.update_text(
        this.data.info.party_data.coins + "    Coins",
        this.description_window_text
      );
    }
  }

  set_psynergy_icons() {
    this.psynergy_overview_window.remove_from_this_window();

    let counter = 0;
    for (
      let i = 0;
      i <
      this.data.info.party_data.members[this.selected_char_index].abilities
        .length;
      ++i
    ) {
      const ability_key_name =
        this.data.info.party_data.members[this.selected_char_index].abilities[
          i
        ];
      if (ability_key_name in this.data.info.abilities_list) {
        const ability = this.data.info.abilities_list[ability_key_name];
        if (ability.is_field_psynergy || ability.effects_outside_battle) {
          const x =
            TOTAL_BORDER +
            PSY_OVERVIEW_WIN_INSIDE_PADDING_H +
            Math.ceil(
              (counter % PSY_OVERVIEW_WIN_ICONS_PER_LINE) *
                (PSY_OVERVIEW_WIN_SPACE_BETWN_ICO + numbers.ICON_WIDTH)
            );
          const y =
            TOTAL_BORDER +
            PSY_OVERVIEW_WIN_INSIDE_PADDING_V +
            ((counter / PSY_OVERVIEW_WIN_ICONS_PER_LINE) | 0) *
              (PSY_OVERVIEW_WIN_SPACE_BETWN_LINE + numbers.ICON_HEIGHT);
          this.psynergy_overview_window.create_at_group(
            x,
            y,
            "abilities_icons",
            { frame: ability_key_name }
          );
          ++counter;
        }
      }
    }
  }

  open_char_select() {
    if (this.psynergy_choose_window.window_open)
      this.psynergy_choose_window.close();

    if (!this.psynergy_overview_window.open)
      this.psynergy_overview_window.show(undefined, false);
    if (!this.shortcuts_window.open)
      this.shortcuts_window.show(undefined, false);
    if (!this.chars_menu.is_open)
      this.chars_menu.open(this.selected_char_index, CharsMenuModes.MENU);

    this.chars_menu.select_char(this.selected_char_index);
    this.chars_menu.grant_control(
      this.close_menu.bind(this),
      this.char_choose.bind(this),
      undefined,
      [
        {
          buttons: Button.L,
          on_down: this.char_choose.bind(this, true, Button.L),
          sfx: { down: "menu/positive" },
        },
        {
          buttons: Button.R,
          on_down: this.char_choose.bind(this, true, Button.R),
          sfx: { down: "menu/positive" },
        },
      ]
    );
  }

  open_menu(close_callback: Function) {
    this.close_callback = close_callback;
    this.basic_info_window.open(
      this.data.info.party_data.members[this.selected_char_index]
    );

    this.is_open = true;
    this.choosing_psynergy = false;

    this.set_shortcuts_window_info();
    this.set_psynergy_icons();
    this.set_guide_window_text();
    this.set_description_window_text();

    this.guide_window.show(undefined, false);
    this.description_window.show(undefined, false);
    this.psynergy_overview_window.show(undefined, false);
    this.shortcuts_window.show(undefined, false);

    this.open_char_select();
  }

  close_menu(close_menu_below: boolean = false) {
    this.data.cursor_manager.hide();
    this.data.control_manager.reset();

    this.chars_menu.close();
    this.basic_info_window.close();

    this.is_open = false;

    this.guide_window.close(undefined, false);
    this.description_window.close(undefined, false);
    this.psynergy_overview_window.close(undefined, false);
    this.shortcuts_window.close(undefined, false);
    if (this.psynergy_choose_window.window_open)
      this.psynergy_choose_window.close();

    if (this.close_callback !== null) {
      this.close_callback(close_menu_below);
    }
  }
}
