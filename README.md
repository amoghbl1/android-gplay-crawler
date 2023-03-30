# Overview

Recent changes to the Google Play store seem to break the ability to download APKs directly from there using google credentials.

An alternative is to use a physical android device, install apps on it from the play store, and exfiltrate the `.apk` files. This codebase automates this process.

Follow the setup, configuration, and run instructions to obtain apks.

# Setup

Install the required by running `npm install`.

# Configuration

### package_names.txt
Supply the packages to download in a simple text file, where each line is a package name. Name this file `package_names.txt` and you should be good to go.

These packages, once crawled, will be save in `./apks/DATE_TIME/` where `DATE_TIME` is the date and time for when the crawl is launched.

### Physical device

Make sure an Android device is accessible to the computer running this tool through adb. The easiest way is to hook up a physical device and enable debugging, but remote options should work as well.

### Tapping install

This codebase drives the physical device to the play store page, and taps
`x = 600, y = 780`.

You can modify these to hit the right coordinates for your device by modifying `DEVICE_X` and `DEVICE_Y` variables in `perform-crawl.js`

# Run

Use

`npm run crawl`

to drive the connected android device to install the apps and extract APKs to `./apks/`
