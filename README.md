# node-bmw-ibus

## Install

```npm install```

## Configuration

tba


## Running

```node IbusReader.js```


## Testing

### Raw IBUS data stream files

in the src/raw folders I have sniffed and logged some of the data that goes through the stream.

### Setting up a virtual Serial Device
```sudo socat -d -d -d -d -lf /tmp/socat pty,link=/dev/master,raw,echo=0,user=matt,group=staff pty,link=/dev/slave,raw,echo=0,user=matt,group=staff```

### Simulating IBUS

From the src/raw folder run:

```socat -U -d -d -d /dev/ttys006,clocal=1,cs8,nonblock=1,ixoff=0,ixon=0,ispeed=9600,ospeed=9600,raw,echo=0,crtscts=0 FILE:test.bin```
