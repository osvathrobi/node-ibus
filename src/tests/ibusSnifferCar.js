var serialport = require("serialport");
var fs = require("fs");

var crypto = require('crypto');
var fs = require('fs');

d = new Date()
df = d.getMonth()+'-'+d.getDate()+'-'+d.getYear()+' '+(d.getHours()+1)+'_'+d.getMinutes()

var wstream = fs.createWriteStream('raw/' + df + '_message.bin');

// {0xAA, 0xBB, 0x06, 0x00, 0x00, 0x00, 0x01, 0x01, 0x03, 0x03 };
// AH02DHFV
// A601HPGR - car

var serialPort = new serialport.SerialPort("/dev/cu.usbserial-A601HPGR", {
    baudrate: 9600,
    parity: 'even',
    stopbits: 1,
    databits: 8, 
    parser: serialport.parsers.raw
}, false);

serialPort.open(function(error) {
    if (error) {
        console.log('failed to open: ' + error);
    } else {

        console.log('open');

        serialPort.on('data', function(data) {
            console.log(data.toString('hex'));
            //appendData(data.toString('hex'));
            wstream.write(data);
        });


    }
});


process.on( 'SIGINT', function() {
  console.log( "\nGracefully shutting down from SIGINT (Ctrl-C)" );

  wstream.end();

  // some other closing procedures go here
  process.exit( );
})