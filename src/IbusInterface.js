var serialport = require("serialport");
var Log = require('log'),
    log = new Log('debug');

var IbusProtocol = require('./IbusProtocol.js');

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

                var parser = new IbusProtocol();
                serialPort.pipe(parser);

                parser.on('message', function(msg) {
                    //if (msg.src === '68') {
                        console.log('Got a validated message!!', msg.src, msg.len, msg.dst, msg.msg.toString('ascii'), 'CRC: ', msg.crc);
                    //}
                });

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
    }

};

module.exports = IbusInterface;