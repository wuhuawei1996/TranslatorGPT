// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use rdev::{simulate, EventType, Key, SimulateError};

use std::{thread, time};
use tauri::Manager;

use base64::encode;
use screenshots::Screen;

use tauri_plugin_autostart::MacosLauncher;

#[derive(Clone, serde::Serialize)]
struct Payload {
    args: Vec<String>,
    cwd: String,
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

#[tauri::command]
fn screenshot(x: &str, y: &str, width: &str, height: &str) -> String {
    let screen = Screen::from_point(100, 100).unwrap();
    let image = screen
        .capture_area(
            x.parse::<i32>().unwrap(),
            y.parse::<i32>().unwrap(),
            width.parse::<u32>().unwrap(),
            height.parse::<u32>().unwrap(),
        )
        .unwrap();
    let buffer = image.buffer();
    let base64_str = encode(buffer);
    base64_str
}

#[tauri::command]

fn copy_content() {
    send(&EventType::KeyPress(Key::ControlLeft));
    send(&EventType::KeyPress(Key::KeyC));
    send(&EventType::KeyRelease(Key::KeyC));
    send(&EventType::KeyRelease(Key::ControlLeft));
}

fn send(event_type: &EventType) {
    let delay = time::Duration::from_millis(20);
    match simulate(event_type) {
        Ok(()) => (),
        Err(SimulateError) => {
            println!("We could not send {:?}", event_type);
        }
    }
    // Let ths OS catchup (at least MacOS)
    thread::sleep(delay);
}

fn main() {
    let quit = tauri::CustomMenuItem::new("quit".to_string(), "退出");
    let tray_menu = tauri::SystemTrayMenu::new().add_item(quit);
    let system_tray = tauri::SystemTray::new().with_menu(tray_menu);
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, argv, cwd| {
            println!("{}, {argv:?}, {cwd}", app.package_info().name);

            app.emit_all("single-instance", Payload { args: argv, cwd })
                .unwrap();
        }))
        .system_tray(system_tray)
        .on_system_tray_event(|_app, event| match event {
            tauri::SystemTrayEvent::LeftClick {
                position: _,
                size: _,
                ..
            } => {
                _app.emit_all("show_index", "").expect("show failed");
            }
            tauri::SystemTrayEvent::RightClick {
                position: _,
                size: _,
                ..
            } => {}
            tauri::SystemTrayEvent::DoubleClick {
                position: _,
                size: _,
                ..
            } => {}
            tauri::SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                "quit" => {
                    std::process::exit(0);
                }
                _ => {}
            },
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![screenshot, copy_content])
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            Some(vec!["--flag1", "--flag2"]), /* arbitrary number of args to pass to your app */
        ))
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
