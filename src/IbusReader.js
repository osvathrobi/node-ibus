var IbusInterface = require('./IbusInterface.js');
var Log = require('log'),
    log = new Log('debug');

// config
//var device = '/dev/ttys003';
var device = '/dev/cu.usbserial-A601HPGR';

// data
var ibusInterface = new IbusInterface();

// events
process.on('SIGINT', onSignalInt);

// implementation
function onSignalInt() {
    log.info("Gracefully shutting down.. (Ctrl-C)");
    ibusInterface.shutdown();
    process.exit();
}

function init() {
    ibusInterface.startup(device);
}

// main start
init();