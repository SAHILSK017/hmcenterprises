/** Default exploded phone GLB — replace with production asset when ready */
export const DEFAULT_PHONE_GLB = "/models/phone-exploded.glb";

/** Map GLB mesh names (case-insensitive) to internal component IDs */
export const GLB_MESH_TO_COMPONENT: Record<string, string> = {
  backglass: "backGlass",
  back_glass: "backGlass",
  frame: "frame",
  display: "display",
  screen: "display",
  battery: "battery",
  motherboard: "motherboard",
  board: "motherboard",
  camera: "camera",
  cameramodule: "camera",
  speaker: "speaker",
  chargingport: "chargingPort",
  charging_port: "chargingPort",
  wirelesscoil: "wirelessCoil",
  coil: "wirelessCoil",
  simtray: "simTray",
  sim_tray: "simTray",
  buttons: "buttons",
  screws: "screws",
};
