var serialport = require("serialport");
var Log = require('log'),
    log = new Log('debug');

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

                serialPort.on('data', function(data) {
                    log.debug(data);
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