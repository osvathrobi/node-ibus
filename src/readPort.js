// To emulate virtual interface
// socat -d -d PTY PTY
// echo -e -n "\x50\x04\x68\x3B\x21\xA6" > /dev/ttys014
// /dev/ttys002 <--- /dev/ttys003
// cat BMW_IBUS_1.bin > /dev/ttys003

// sudo socat -U -d -d -d /dev/ttys006,clocal=1,cs8,nonblock=1,ixoff=0,ixon=0,ispeed=9600,ospeed=9600,raw,echo=0,crtscts=0 FILE:BMW_IBUS_1.bin
// sudo socat -U -d -d -d /dev/ttys006,clocal=1,cs8,nonblock=1,ixoff=0,ixon=0,ispeed=9600,ospeed=9600,raw,echo=0,crtscts=0 FILE:test.bin

var serialport = require("serialport");

var serialPort = new serialport.SerialPort("/dev/ttys003", {
    baudrate: 9600,
    parity: 'even',
    stopbits: 1,
    //databits: 8, 
    parser: serialport.parsers.raw
}, false);

serialPort.open(function(error) {
    if (error) {
        console.log('failed to open: ' + error);
    } else {

        console.log('open');

        serialPort.on('data', function(data) {
            console.log(data);            
        });


    }
});


process.on( 'SIGINT', function() {
  console.log( "\nGracefully shutting down from SIGINT (Ctrl-C)" );


  // some other closing procedures go here
  process.exit( );
})