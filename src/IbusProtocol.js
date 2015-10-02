var util = require('util');
var Transform = require('stream').Transform;
util.inherits(IbusProtocol, Transform);

function IbusProtocol(options) {
    if (!(this instanceof IbusProtocol))
        return new IbusProtocol(options);

    Transform.call(this, options);
    this._oldChunk = '';

}


IbusProtocol.prototype._transform = function(chunk, encoding, done) {
    var _self = this;

    if (chunk.length < 5) {
        // don't bother with this chunk, gather more data
        this.push(chunk);
    } else {
        console.log('Analyzing: ', chunk);

        // gather messages from current chunk
        var messages = [];

        var lastFind = -1;

        var mSrc;
        var mLen;
        var mDst;
        var mMsg;
        var mCrc;

        // try to interpret a message        
        for (var i = 0; i < chunk.length - 5; i++) {
            mSrc = chunk[i + 0];
            mLen = chunk[i + 1] - 1; // ignore the DST
            mDst = chunk[i + 2];

            console.log('Found: ', mSrc, mLen, mDst);

            // test to see if have enough data for a complete message
            if (chunk.length > (i + 3 + mLen + 1)) {

                mMsg = chunk.slice(i + 4, mLen);
                mCrc = chunk[i + 3 + mLen];

                messages.push({
                    'src': mSrc,
                    'len': mLen,
                    'dst': mDst,
                    'msg': mMsg.toString('utf-8'),
                    'crc': mCrc,
                });

                // mark end of last message
                lastFind = (i + 3 + mLen + 1);

                // skip ahead
                i = (i + 3 + mLen + 1);
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
    }

    done();
};

module.exports = IbusProtocol;
// Usage:
// var parser = new SimpleProtocol();
// source.pipe(parser)
// Now parser is a readable stream that will emit 'header'
// with the parsed header data.