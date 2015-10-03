var util = require('util');
var Transform = require('stream').Transform;
util.inherits(IbusProtocol, Transform);

var Log = require('log'),
    log = new Log('debug');

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
        log.debug('Analyzing: ', chunk);

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
            mLen = chunk[i + 1];
            mDst = chunk[i + 2];

            // test to see if have enough data for a complete message
            if (chunk.length >= (i + 2 + mLen)) {

                mMsg = chunk.slice(i + 3, i + 3 + mLen - 2);
                mCrc = chunk[i + 2 + mLen - 1];

                var crc = 0x00;

                crc = crc ^ mSrc;
                crc = crc ^ mLen;
                crc = crc ^ mDst;

                for (var j = 0; j < mMsg.length; j++) {
                    crc = crc ^ mMsg[j];
                }

                //log.debug('Crc: ', mCrc, ' Computed Crc:', crc);

                if (crc === mCrc) {
                    messages.push({
                        'src': mSrc.toString(16),
                        'len': mLen.toString(16),
                        'dst': mDst.toString(16),
                        'msg': mMsg,
                        'crc': mCrc.toString(16)
                    });

                    // mark end of last message
                    lastFind = (i + 3 + mLen + 1);

                    // skip ahead
                    i = (i + 2 + mLen + 1);
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
    }

    done();
};

module.exports = IbusProtocol;
// Usage:
// var parser = new SimpleProtocol();
// source.pipe(parser)
// Now parser is a readable stream that will emit 'header'
// with the parsed header data.