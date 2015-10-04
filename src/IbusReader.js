var IbusInterface = require('./IbusInterface.js');

// config
var device = '/dev/ttys003';
//var device = '/dev/cu.usbserial-A601HPGR';

// data
var ibusInterface = new IbusInterface(device);

// events
process.on('SIGINT', onSignalInt);
ibusInterface.on('data', onIbusData);

// implementation
function onSignalInt() {
    ibusInterface.shutdown();
    process.exit();
}

function onIbusData(data) {
	console.log('GOT some ', data);
}

function init() {
    ibusInterface.startup();
}

// main start
init();