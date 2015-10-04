var serialport = require("serialport");
var Log = require('log'),
    log = new Log('info');
var util = require('util'); 
var EventEmitter = require('events').EventEmitter;

var IbusProtocol = require('./IbusProtocol.js');
var IbusDevices = require('./IbusDevices.js');

var IbusInterface = function(devicePath) {

    // self reference
    var _self = this;

    // exposed data
    this.getInterface = getInterface;
    this.initIBUS = initIBUS;
    this.closeIBUS = closeIBUS;
    this.startup = startup;
    this.shutdown = shutdown;

    // local data
    var serialPort;
    var device = devicePath;
    var parser;

    // implementation
    function initIBUS() {
        serialPort = new serialport.SerialPort(device, {
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
                
                parser = new IbusProtocol();
                parser.on('message', onMessage);

                serialPort.pipe(parser);
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

    function startup() {
        initIBUS();
    }

    function shutdown() {
        closeIBUS();
    }

    function onMessage(msg) {
        log.debug('Raw Message: ', msg.src, msg.len, msg.dst, msg.msg, '[' + msg.msg.toString('ascii') + ']', msg.crc);
        log.debug('Message: [' + IbusDevices.getDeviceName(msg.src) + '] to [' + IbusDevices.getDeviceName(msg.dst) + "]");
        log.debug(msg.msg.slice(0, 16));

        _self.emit('data', msg);
    }
};

util.inherits(IbusInterface, EventEmitter);
module.exports = IbusInterface;