# node-ibus

This is a JavaScript implementation of the single wire Ibus protocol found on many BMWs and some of Mini, Land Rover, MG cars. (intended for homebrew use with the RaspberryPi, PC, etc.)

## Details

You can use this package with Resler's interface (http://www.reslers.de/IBUS/index.html) or similar Ibus adapters.
While being mostly an async implementation the write queue however relies on setImmediate to detect idle state on the bus. It then processes a write queue when the bus is being idle for more then 1.4 ms.


## Install

```npm install ibus```


## Usage

Require the packages you want to use.

```
var IbusInterface = require('ibus').IbusInterface;
var IbusDevices = require('ibus').IbusDevices;
```

Configure your device location

```
// config
var device = '/dev/cu.usbserial-AH02DHFV';

// setup interface
var ibusInterface = new IbusInterface(device);

function init() {
    ibusInterface.startup();
}

// main start
init();
```

Add an event listener on the ibus interface output stream.

```
// events
ibusInterface.on('data', onIbusData);

function onIbusData(data) {
    console.log('[IbusReader]', 'Id: 	  ', data.id);
    console.log('[IbusReader]', 'From: 	  ', IbusDevices.getDeviceName(data.src));
    console.log('[IbusReader]', 'To: 	  ', IbusDevices.getDeviceName(data.dst));
    console.log('[IbusReader]', 'Message: ', data.msg, '\n');
}
```

Cleanup and close the device when exiting.

```
// implementation
process.on('SIGINT', onSignalInt);

function onSignalInt() {
    ibusInterface.shutdown(function() {
        process.exit();
    });
}
```

## Documentation

- TODO


## Running

```node IbusReader.js```


## Testing

### Raw IBUS data stream files

in the src/raw folder I have sniffed and logged some of the data that goes through the IBUS stream of a BMW X3 E83 from 2010.

```test1.bin```, ```BMW_IBUS_1.bin``` and ```BMW_IBUS_2.bin```

You can play back these log files to a virtual serial device and test your code.

### Setting up a virtual Serial Device

```socat -d -d PTY PTY```

This will create 2 devices: ex ```/dev/ttys003``` and ```/dev/ttys006```

You start IbusReader with the master (ex ```/dev/ttys003```) and send traffic to the slave (ex ```/dev/ttys006```)

### Simulating IBUS traffic on the serial slave

From the src/raw folder run:

```socat -U -d -d -d /dev/ttys006,clocal=1,cs8,nonblock=1,ixoff=0,ixon=0,ispeed=9600,ospeed=9600,raw,echo=0,crtscts=0 FILE:test.bin```
