import { GameEvent, event_types } from "./GameEvent";

export class CameraShakeEvent extends GameEvent {
  private enable: boolean;

  constructor(game, data, active, key_name, enable) {
    super(game, data, event_types.CAMERA_SHAKE, active, key_name);
    this.enable = enable;
  }

  _fire() {
    if (this.enable) {
      this.data.camera.enable_shake();
    } else {
      this.data.camera.disable_shake();
    }
  }

  _destroy() {}
}
