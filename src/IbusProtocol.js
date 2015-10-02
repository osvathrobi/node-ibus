var util = require('util');
var Transform = require('stream').Transform;
util.inherits(IbusProtocol, Transform);

function IbusProtocol(options) {
    if (!(this instanceof SimpleProtocol))
        return new SimpleProtocol(options);

    Transform.call(this, options);
    this._oldChunk = '';

}

IbusProtocol.prototype._transform = function(chunk, encoding, done) {
    var _self = this;

    // gather messages from current chunk
    var messages = [];

    var lastFind = -1;

    for (var i = 0; i < chunk.length - 2; i++) {
        if (chunk[i] === "[".charCodeAt(0)) {
            if (chunk[i + 2] === "]".charCodeAt(0)) {
                messages.push(chunk[i+1]);
                lastFind = i + 2;
                i = i + 2; //skip ahead
            }
        }
    }

    if (messages.length > 0) {
        messages.forEach(function(message) {
            _self.emit('message', message);
        });
    }


    if (lastFind !== -1) {
        this.push(chunk.slice(lastFind));
    } else {
        // drop data, reinterpret from last 20 positions
        if (chunk.length > 100000) {
            console.log('dropping some data..');
            this.push(chunk.slice(20000));
        } else {
            this.push(chunk);
        }
    }

    done();
};

module.exports = IbusProtocol;
// Usage:
// var parser = new SimpleProtocol();
// source.pipe(parser)
// Now parser is a readable stream that will emit 'header'
// with the parsed header data.