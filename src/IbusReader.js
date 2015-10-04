var IbusInterface = require('./IbusInterface.js');
var IbusDevices = require('./IbusDevices.js');

// config
var device = '/dev/ttys003';

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
	console.log('From: 	  ', IbusDevices.getDeviceName(data.src));
	console.log('To: 	  ', IbusDevices.getDeviceName(data.dst));
	console.log('Message: ', data.msg, '\n');
}

function init() {
    ibusInterface.startup();
}

// main start
init();