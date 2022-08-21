import * as numbers from "./magic_numbers";
import { Debug } from "./debug/Debug";
import { load_all } from "./initializers/assets_loader";
import { load_databases } from "./initializers/databases_loader";
import { GameInfo, initialize_game_data } from "./initializers/initialize_info";
import { Collision } from "./Collision";
import { Hero } from "./Hero";
import { TileEventManager } from "./tile_events/TileEventManager";
import { GameEventManager } from "./game_events/GameEventManager";
import { Map } from "./Map";
import { Battle } from "./battle/Battle";
import { MainMenu, initialize_menu } from "./main_menus/MainMenu";
import { ShopMenu } from "./main_menus/ShopMenu";
import { InnMenu } from "./main_menus/InnMenu";
import { ControlManager } from "./utils/ControlManager";
import { CursorManager } from "./utils/CursorManager";
import { Gamepad as XGamepad, Button, AdvanceButton } from "./XGamepad";
import { Audio } from "./Audio";
import { Storage } from "./Storage";
import { Camera } from "./Camera";
import { HealerMenu } from "./main_menus/HealerMenu";
import { Snapshot } from "./Snapshot";
import { base_actions } from "./utils";
import { StartMenu } from "./main_menus/StartMenu";
import { initialize_save_menu, SaveMenu } from "./main_menus/SaveMenu";
import { ParticlesWrapper } from "./ParticlesWrapper";

export enum EngineFilters {
  COLORIZE = "colorize",
  OUTLINE = "outline",
  LEVELS = "levels",
  COLOR_BLEND = "color_blend",
  HUE = "hue",
  TINT = "tint",
  GRAY = "gray",
  FLAME = "flame",
  MODE7 = "mode7",
}

/**
 * The project has basically two important folders: assets and base. All the source code is located inside base folder.
 * All the game assets (images, database files, sounds, etc) are located inside assets folder. An engine user will only
 * modify the assets folder for instance. Any modification in assets folder files will automatically be reflected in the game.
 *
 * This class is the starting point to understand how the code works. It's the engine's main class. When the game starts,
 * it will load database files in assets/dbs folder in order to instantiate the main classes of the game like Hero,
 * Map, MainMenu, Audio, ControlManager etc.
 */
export {
  numbers,
  Debug,
  load_all,
  load_databases,
  initialize_game_data,
  Collision,
  Hero,
  TileEventManager,
  GameEventManager,
  Map,
  Battle,
  MainMenu,
  initialize_menu,
  ShopMenu,
  InnMenu,
  ControlManager,
  CursorManager,
  XGamepad,
  Button,
  AdvanceButton,
  Audio,
  Storage,
  Camera,
  HealerMenu,
  Snapshot,
  base_actions,
  StartMenu,
  initialize_save_menu,
  SaveMenu,
  ParticlesWrapper,
};
