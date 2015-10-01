var serialport = require("serialport");

var serialPort = new serialport.SerialPort("/dev/cu.usbmodem14541", {
  baudrate: 57600,
  //parser: serialport.parsers.raw
  parser: serialport.parsers.readline("\n")
}, false);

serialPort.open(function (error) {
  if ( error ) {
    console.log('failed to open: '+error);
  } else {
    
    console.log('open');
    
    serialPort.on('data', function(data) {
      console.log(data.toString("utf8"));
    });

    /*
    serialPort.write("ls\n", function(err, results) {
      console.log('err ' + err);
      console.log('results ' + results);
    });
    */
  }
});