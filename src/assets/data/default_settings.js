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
      openMainOnSelection: false,
      openMainOnScreenshot: false,
      mainWindowClosed: "hide",
      fontSize: "standard",
      language: "English",
    },
    keys,
    shortcuts: {
      showOrHide: ["Ctrl", "Tab"],
      selection: ["Ctrl", "CapsLock"],
      screenshot: ["Shift", "Alt", "Z"],
    },
  };
};

export const fontSizes = {
  small: "14",
  standard: "16",
  large: "20",
  huge: "22",
};
