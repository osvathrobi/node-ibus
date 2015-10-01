var VirtualSerialPort = require('virtual-serialport');
sp = new VirtualSerialPort("/dev/ttyUSB0");

sp.on("dataToDevice", function(data) {
    console.log("Arduino says, " + data);
});
 
sp.write("BLOOP!"); // "Arduino says, BLOOP!" 

