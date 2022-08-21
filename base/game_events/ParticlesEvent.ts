import { ParticlesInfo } from "ParticlesWrapper";
import { GameEvent, event_types } from "./GameEvent";

enum game_groups {
  LOWER = "lower",
  MIDDLE = "middle",
  OVER = "over",
}

export class ParticlesEvent extends GameEvent {
  private particles_info: ParticlesInfo;
  private group: Phaser.Group;

  constructor(game, data, active, key_name, particles_info, group) {
    super(game, data, event_types.PARTICLES, active, key_name);
    this.particles_info = particles_info;
    switch (group) {
      case game_groups.LOWER:
        this.group = this.data.underlayer_group;
        break;
      case game_groups.MIDDLE:
        this.group = this.data.middlelayer_group;
        break;
      case game_groups.OVER:
        this.group = this.data.overlayer_group;
        break;
    }
  }

  async _fire() {
    ++this.data.game_event_manager.events_running_count;
    const promises = this.data.particle_wrapper.start_particles(
      this.particles_info,
      this.group
    );
    const udpate_callback = () => this.data.particle_wrapper.render();
    this.data.game_event_manager.add_callback(udpate_callback);
    await Promise.all(promises);
    this.data.game_event_manager.remove_callback(udpate_callback);
    --this.data.game_event_manager.events_running_count;
  }

  _destroy() {}
}
