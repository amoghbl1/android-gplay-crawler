'use strict';

// Types of tests flags
const DEBUG = true;

// Logging related variables
const DATE = new Date();
const APKS_BASE_DIR = `./apks/`;
const APKS_DIR = `${APKS_BASE_DIR}/${DATE.toISOString().split('T')[0].replace(/-/g, "") + DATE.toTimeString().split(' ')[0].replace(/:/g, "")}`;
const PACKAGE_NAMES_FILE = `./package_names.txt`;

// When to kill adb
const ADB_KILL_THRESHOLD = 25

// Device install button location
// X = 600, Y = 780 for our device
DEVICE_X = 600
DEVICE_Y = 780

// Modules
const sleep    = ms => new Promise( resolve => setTimeout( resolve, ms ) );
const fs       = require('fs');
const readline = require('readline');
const exec     = require('shelljs').exec;
const util     = require('util');
const pexec    = util.promisify( exec );
const adb      = require('@u4/adbkit');

( async() => {
  // Interfaces needed for Android
  const client = adb.createClient();
  const devices = await client.listDevices();
  if (!devices.length) {
    console.error('Need at least one connected android device');
    return;
  }
  // Moving to working with just one device
  const deviceClient = devices[0].getClient();

  // Setup all required folders
  await createDirectories([APKS_BASE_DIR, APKS_DIR])

  // Read packages file for which packages to download
  let packagesToDownload = readPackagesFile()

  console.log(`Downloading ${packagesToDownload.length} apks`);

  // Drive phone to play and get it to download the apps in sequence
  for (let package_name of packagesToDownload) {
    consoleDebug(`Trying to download package: ${package_name}`);
    // Hit download for all APKs, with a minimal sleep, tinker as required
    await maybeDownloadFromPlay(deviceClient, package_name);
  }

  // Extract each package in sequence
  for (let package_name of packagesToDownload) {
    consoleDebug(`Pulling ${package_name}`);
    await pullAPKFromPhone(deviceClient, package_name);
  }

})();

async function pullAPKFromPhone(deviceClient, package_name) {
  const apkPieces = (await deviceClient.execOut(`pm path ${package_name}`, 'utf8'))
                    .split("\n").filter(e => typeof e === 'string' && e !== '')
  let splitNumber = 0;
  let apkSHA = '';
  for (let apkPiece of apkPieces) {
    apkPiece = apkPiece.substring(8) // drop 'package:'
    if (apkSHA === '') {
      apkSHA = (await deviceClient.execOut(`sha256sum ${apkPiece}`, 'utf8'))
                .split(" ").filter(e => typeof e === 'string' && e!== '')[0]
    }
    let pieceDestination = `${APKS_DIR}/${package_name}-${apkSHA}-${splitNumber}.apk`;
    consoleDebug(`Pulling ${apkPiece} to ${pieceDestination}`);
    // Too lazy to write the adbkit version of this, just going with shell
    await pexec(`adb pull ${apkPiece} ${pieceDestination}`);
    splitNumber += 1;
  }
  consoleDebug(`Done pulling ${package_name}, total ${splitNumber} pieces`);
}

async function maybeDownloadFromPlay(deviceClient, package_name) {

  // Check if package is installed already
  let installed = await deviceClient.isInstalled(package_name);
  if (installed) {
    consoleDebug(`Package ${package_name} already installed, skipping...`);
    return;
  }

  await deviceClient.startActivity({
      'action': 'android.intent.action.VIEW',
      'data': `market://details?id=${package_name}`,
      'wait': true
    });
  await sleep(2000);

  await deviceClient.extra.tap(DEVICE_X, DEVICE_Y);
  await sleep(2000);
}

function readPackagesFile() {
  return fs.readFileSync(PACKAGE_NAMES_FILE, 'utf8').split("\n")
            .filter(e =>
                typeof e === 'string' &&
                e !== '' &&
                !e.startsWith("#") &&
                e !== 'X'
              )
}

async function createDirectories(directories) {
  for(let d of directories) {
    if ( !fs.existsSync(d) ) {
      fs.mkdirSync(d);
    }
  }
}

function consoleDebug(m) {
  if(DEBUG) {
    console.log(m);
  }
}
