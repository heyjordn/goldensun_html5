import { GameEvent, event_types } from "./GameEvent";

export class CharSetActivationEvent extends GameEvent {
  private is_npc: boolean;
  private npc_label: string;
  private activate: boolean;

  constructor(game, data, active, key_name, is_npc, npc_label, activate) {
    super(game, data, event_types.CHAR_SET_ACTIVATION, active, key_name);
    this.npc_label = npc_label;
    this.is_npc = is_npc;
    this.activate = activate;
  }

  _fire() {
    const target_char =
      GameEvent.get_char(this.data, {
        is_npc: this.is_npc,
        npc_label: this.npc_label,
      }) ?? this.origin_npc;

    target_char.toggle_active(this.activate);
  }

  _destroy() {}
}
