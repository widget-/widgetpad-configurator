# Widgetpad Configurator

## Description

Configures a dance pad running `widgetpad-firmware` or similar. It is currently in "very beta" status.

Built with Electron and React.

![Screenshot](readme_files/screenshot.png)

## Building / Running

Note: I haven't tried this on a clean setup yet.

* Install NodeJS 15 or later and npm.
* `git checkout` and `cd` into project folder.
* `npm i` to install dependencies
* To run both React webserver and Electron together:
    * `npm run dev`
* Or separately:
    * React webserver: `npm run start`
    * Electron: `npm run electron-no-wait`

## Roadmap / Todo

* Features
    * [x] Electron and React
    * [x] SerialPort connection handling
    * [x] Multiple port compatibility
    * [x] Panel value and threshold UI
    * [x] Multiple sensors per panel
    * [ ] Edit thresholds
    * [ ] Save configuration to device
    * [ ] Pad settings page
    * [ ] Save pad settings to on-device storage
* Code quality
    * [ ] Use react-router (may be unneccessary)
    * [ ] Convert JS to Typescript
    * [ ] Use Redux
    * [ ] Overdocument everything
    * [ ] Find all unused leftover modules that `create-react-app` left me
