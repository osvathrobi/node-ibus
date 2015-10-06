var serialport = require("serialport");
var Log = require('log'),
    log = new Log('info'),
    clc = require('cli-color');

var util = require('util');
var EventEmitter = require('events').EventEmitter;
var async = require("async");

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
    this.sendMessage = sendMessage;

    // local data
    var serialPort;
    var device = devicePath;
    var parser;
    var lastActivityTime = 0;
    var queue = [];


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
                log.error('[IbusInterface] Failed to open: ' + error);
            } else {
                log.info('[IbusInterface] Port Open [' + device + ']');

                serialPort.on('data', function(data) {
                    log.debug('[IbusInterface] Data on port: ', data);

                    lastActivityTime = Date.now();
                });

                serialPort.on('error', function(err) {
                    log.error("[IbusInterface] Error", err);
                    shutdown(startup);
                });

                parser = new IbusProtocol();
                parser.on('message', onMessage);

                serialPort.pipe(parser);

                watchForEmptyBus(processWriteQueue);
            }
        });
    }    

    function watchForEmptyBus(workerFn) {
        if (Date.now() - lastActivityTime >= 2) {
            workerFn(function success() {
                // operation is ready, resume looking for an empty bus
                setImmediate(watchForEmptyBus, workerFn);
            });
        } else {
            // keep looking for an empty Bus
            setImmediate(watchForEmptyBus, workerFn);
        }
    }

    function processWriteQueue(ready) {
        // noop on empty queue
        if (queue.length <= 0) {
            return;
        }

        // process 1 message
        var dataBuf = queue.pop();

        log.debug(clc.blue('[IbusInterface] Write queue length: '), queue.length);

        serialPort.write(dataBuf, function(error, resp) {
            if (error) {
                log.error('[IbusInterface] Failed to write: ' + error);
            } else {
                log.debug('[IbusInterface] ', clc.white('Wrote to Device: '), dataBuf, resp);

                serialPort.drain(function(error) {
                    log.debug(clc.white('Data drained'));

                    // this counts as an activity, so mark it
                    lastActivityTime = Date.now(); 

                    ready();
                });
            }

        });
    }

    function closeIBUS(callb) {
        serialPort.close(function(error) {
            if (error) {
                log.error('[IbusInterface] Error closing port: ', error);
                callb();
            } else {
                log.info('[IbusInterface] Port Closed [' + device + ']');
                parser = null;
                callb();
            }
        });
    }

    function getInterface() {
        return serialPort;
    }

    function startup() {
        initIBUS();
    }

    function shutdown(callb) {
        log.info('[IbusInterface] Shutting down Ibus device..');
        closeIBUS(callb);
    }

    function onMessage(msg) {
        log.debug('[IbusInterface] Raw Message: ', msg.src, msg.len, msg.dst, msg.msg, '[' + msg.msg.toString('ascii') + ']', msg.crc);

        _self.emit('data', msg);
    }

    function sendMessage(msg) {

        var dataBuf = IbusProtocol.createIbusMessage(msg);
        log.debug('[IbusInterface] Send message: ', dataBuf);

        if (queue.length > 1000) {
            log.warning('[IbusInterface] Queue too large, dropping message..', dataBuf);
            return;
        }

        queue.unshift(dataBuf);
    }

};

util.inherits(IbusInterface, EventEmitter);
module.exports = IbusInterface;