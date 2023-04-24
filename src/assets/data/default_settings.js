import engineNames from "./engine_names";

export default () => {
  const keys = {};
  engineNames.map((item) => {
    keys[item.key] = "";
  });
  return {
    basics: {
      startOnBoot: false,
      autoToTray: false,
      alwaysOnTop: true,
      autoUpdate: true,
      openMainOnPickup: false,
      openMainOnScreenshot: false,
      mainWindowClosed: "hide",
      fontSize: "standard",
      language: "English",
    },
    keys,
    shortcuts: {
      showOrHide: ["Ctrl", "Tab"],
      pickup: ["Ctrl", "Shift", "G"],
      screenshot: ["Shift", "Alt", "Z"],
    },
  };
};
