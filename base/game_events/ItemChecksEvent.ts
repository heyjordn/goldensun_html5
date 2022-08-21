import { ItemSlot } from "MainChar";
import { GameEvent, event_types } from "./GameEvent";

enum control_types {
  HAS_ITEM = "has_item",
  IS_BROKEN = "is_broken",
  EQUIPPED = "equipped",
  QUANTITY_CHECK = "quantity_check",
}

export class ItemChecksEvent extends GameEvent {
  private char_key: string;
  private control_type: control_types;
  private item_key: string;
  private slot_index: number;
  private quantity: number;
  private check_ok_events: GameEvent[];
  private check_fail_events: GameEvent[];

  constructor(
    game,
    data,
    active,
    key_name,
    char_key,
    control_type,
    item_key,
    slot_index,
    quantity,
    check_ok_events,
    check_fail_events
  ) {
    super(game, data, event_types.ITEM_CHECKS, active, key_name);
    this.char_key = char_key;
    this.control_type = control_type;
    this.item_key = item_key;
    this.slot_index = slot_index;
    this.quantity = quantity ?? 1;
    this.check_ok_events = [];
    if (check_ok_events !== undefined) {
      check_ok_events.forEach((event_info) => {
        const event =
          this.data.game_event_manager.get_event_instance(event_info);
        this.check_ok_events.push(event);
      });
    }
    this.check_fail_events = [];
    if (check_fail_events !== undefined) {
      check_fail_events.forEach((event_info) => {
        const event =
          this.data.game_event_manager.get_event_instance(event_info);
        this.check_fail_events.push(event);
      });
    }
  }

  _fire() {
    const char = this.data.info.main_char_list[this.char_key];
    if (!char) {
      console.warn(
        `Could not manipulate items for "${this.char_key}" char. Check "char_key" property.`
      );
      return;
    }
    let item_slot: ItemSlot = null;
    if (this.slot_index !== undefined) {
      item_slot = char.items.find(
        (item_slot) => item_slot.index === this.slot_index
      );
    } else if (this.item_key) {
      item_slot = char.items.find(
        (item_slot) => item_slot.key_name === this.item_key
      );
    }
    if (this.control_type !== control_types.HAS_ITEM && !item_slot) {
      console.warn(`Could not find an item slot with given info.`);
      return;
    }
    let check = false;
    switch (this.control_type) {
      case control_types.HAS_ITEM:
        check = Boolean(item_slot);
        break;
      case control_types.IS_BROKEN:
        check = item_slot.broken;
        break;
      case control_types.EQUIPPED:
        check = item_slot.equipped;
        break;
      case control_types.QUANTITY_CHECK:
        check = item_slot.quantity === this.quantity;
        break;
    }
    if (check) {
      this.check_ok_events.forEach((event) => event.fire(this.origin_npc));
    } else {
      this.check_fail_events.forEach((event) => event.fire(this.origin_npc));
    }
  }

  _destroy() {
    this.check_ok_events.forEach((event) => event.destroy());
    this.check_fail_events.forEach((event) => event.destroy());
  }
}
