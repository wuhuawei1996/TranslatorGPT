import { appWindow } from "@tauri-apps/api/window";
export default async () => {
  await appWindow.center();
  await appWindow.unminimize();
  await appWindow.show();
  await appWindow.setFocus();
};
