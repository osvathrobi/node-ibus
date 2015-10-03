# node-bmw-ibus

BMW IBUS interface implementation in JavaScript intended for use with NodeJS. (on the RaspberryPi, pc, etc.)

## Details

This is  an async event based implementation of the protocol using transform streams and is not relying on the bus quiet time to detect message packet boundries. (this also means it can be tested with ibus data logs)

It should capture much more of the IBUS messages even if your device is busy reacting to them. It works by analyzing and consuming stream chunks which are buffering while the device is busy. The limit of the buffer can be manually set to protect from overflow.


## Install

```npm install```

## Configuration

tba


## Running

```node IbusReader.js```


## Testing

### Raw IBUS data stream files

in the src/raw folder I have sniffed and logged some of the data that goes through the IBUS stream of a BMW X3 E83 from 2010.

```test1.bin```, ```BMW_IBUS_1.bin``` and ```BMW_IBUS_2.bin```

You can play back these log files to a virtual serial device and test your code.

### Setting up a virtual Serial Device

```socat -d -d PTY PTY```

This will create 2 devices: ex ```/dev/ttys003``` and ```/dev/ttys003```

You start IbusReader with the master (ex ```/dev/ttys003```) and send traffic to the slave (ex ```/dev/ttys006```)

### Simulating IBUS traffic on the serial slave

From the src/raw folder run:

```socat -U -d -d -d /dev/ttys006,clocal=1,cs8,nonblock=1,ixoff=0,ixon=0,ispeed=9600,ospeed=9600,raw,echo=0,crtscts=0 FILE:test.bin```
