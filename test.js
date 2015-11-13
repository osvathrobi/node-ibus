var IbusInterface = require('./index.js').IbusInterface;
var IbusDevices = require('./index.js').IbusDevices;

// config
//var device = '/dev/ttys003';
var device = '/dev/ttyAMA0';

// data
var ibusInterface = new IbusInterface(device);

// events
//process.on('SIGINT', onSignalInt);
ibusInterface.on('data', onIbusData);

// implementation
function onSignalInt() {
    ibusInterface.shutdown(function() {
        process.exit();
    });
}

function onIbusData(data) {
    console.log('[IbusReader]', 'Id:      ', data.id);
    console.log('[IbusReader]', 'From:    ', IbusDevices.getDeviceName(data.src));
    console.log('[IbusReader]', 'To:      ', IbusDevices.getDeviceName(data.dst));
    console.log('[IbusReader]', 'Message: ', data.msg.toString('ascii'), data.msg, '\n');
    
}

// main start
//ibusInterface.startup();
