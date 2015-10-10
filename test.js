var IbusInterface = require('./index.js').IbusInterface;
var IbusDevices = require('./index.js').IbusDevices;

// config
//var device = '/dev/ttys003';
var device = '/dev/cu.usbserial-A601HPGR';

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
    console.log('[IbusReader]', 'Id: 	  ', data.id);
    console.log('[IbusReader]', 'From: 	  ', IbusDevices.getDeviceName(data.src));
    console.log('[IbusReader]', 'To: 	  ', IbusDevices.getDeviceName(data.dst));
    console.log('[IbusReader]', 'Message: ', data.msg.toString('ascii'), data.msg, '\n');
}

// main start

//ibusInterface.startup();

setInterval(function() {
    /*
    ibusInterface.sendMessage({
        src: 0xf0,
        dst: 0x68,
        msg: new Buffer([0x48, 0x00])
    });

    ibusInterface.sendMessage({
        src: 0xf0,
        dst: 0x68,
        msg: new Buffer([0x48, 0x80])
    });
	*/

    ibusInterface.sendMessage({
        src: 0x68,
        dst: 0x3b,
        msg: new Buffer([0x23, 0x62, 0x30, 0x50, 0x50, 0x50 ])
    });

    ibusInterface.sendMessage({
        src: 0x68,
        dst: 0x3b,
        msg: new Buffer([0xa5, 0x63, 0x41, 0x01, 0x50, 0x50, 0x50 ])
    });


}, 3000);