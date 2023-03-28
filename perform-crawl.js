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

// Modules
const sleep    = ms => new Promise( resolve => setTimeout( resolve, ms ) );
const fs       = require('fs');
const readline = require('readline');
const exec     = require('shelljs').exec;
const util     = require('util');
const pexec    = util.promisify( exec );
const adb      = require('adbkit');

( async() => {
  // Interfaces needed for Android
  //const client = adb.createClient();
  //const devices = await client.listDevices();
  // Moving to working with just one device
  //const device = devices[0];

  // Setup all required folders
  await createDirectories([APKS_BASE_DIR, APKS_DIR])

  // Read packages file for which packages to download
  let packagesToDownload = readPackagesFile()

  console.log(`Downloading ${packagesToDownload.length} apks`);
  packagesToDownload.forEach((item, i) => {
    console.log(`Trying to download package: ${item}`)
  });

})();

function readPackagesFile() {
  return fs.readFileSync(PACKAGE_NAMES_FILE, 'utf8').split("\n")
            .filter(e => typeof e === 'string' && e !== '' && !e.startsWith("#"))
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
