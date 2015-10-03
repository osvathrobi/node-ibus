var serialport = require("serialport");
var Log = require('log'),
    log = new Log('info');
var fs = require('fs'); 

var IbusProtocol = require('./IbusProtocol.js');
var IbusDevices = require('./IbusDevices.js');

var IbusInterface = function() {

    // self reference
    var _self = this;

    // exposed data
    this.getInterface = getInterface;
    this.initIBUS = initIBUS;
    this.closeIBUS = closeIBUS;
    this.startup = startup;
    this.shutdown = shutdown;

    // local data
    var serialPort = null;
    var device = device;
    var wstream;
    var parser;

    // implementation
    function initIBUS(devicePath) {
        device = devicePath;

        serialPort = new serialport.SerialPort(devicePath || "/dev/ttys003", {
            baudrate: 9600,
            parity: 'even',
            stopbits: 1,
            databits: 8,
            parser: serialport.parsers.raw
        }, false);

        serialPort.open(function(error) {
            if (error) {
                log.error('Failed to open: ' + error);
            } else {

                log.info('Port Open [' + device + ']');

                wstream = fs.createWriteStream('raw/dumps/' + Date.now() + '_ibus.bin');

                parser = new IbusProtocol();

                parser.on('message', onMessage);

                serialPort.pipe(parser);
                serialPort.pipe(wstream);
            }
        });
    }

    function closeIBUS() {
        log.info('Port Closed [' + device + ']');
        serialPort.close();
    }

    function getInterface() {
        return serialPort;
    }

    function startup(device) {
        initIBUS(device);
    }

    function shutdown() {
        closeIBUS();
        wstream.close();
    }

    function onMessage(msg) {
        log.debug('Message: ', msg.src, msg.len, msg.dst, msg.msg, '[' + msg.msg.toString('ascii') + ']');
        console.log('[' + IbusDevices.getDeviceName(msg.src) + '] to [' + IbusDevices.getDeviceName(msg.dst) + "]");
        console.log(msg.msg.slice(0, 16));
        console.log("");
    }
};

module.exports = IbusInterface;