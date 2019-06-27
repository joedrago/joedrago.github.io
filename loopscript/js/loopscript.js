require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (Buffer){
//
// jDataView by Vjeux <vjeuxx@gmail.com> - Jan 2010
// Continued by RReverser <me@rreverser.com> - Feb 2013
//
// A unique way to work with a binary file in the browser
// http://github.com/jDataView/jDataView
// http://jDataView.github.io/

(function (global) {

'use strict';

var compatibility = {
	// NodeJS Buffer in v0.5.5 and newer
	NodeBuffer: 'Buffer' in global && 'readInt16LE' in Buffer.prototype,
	DataView: 'DataView' in global && (
		'getFloat64' in DataView.prototype ||            // Chrome
		'getFloat64' in new DataView(new ArrayBuffer(1)) // Node
	),
	ArrayBuffer: 'ArrayBuffer' in global,
	PixelData: 'CanvasPixelArray' in global && 'ImageData' in global && 'document' in global
};

// we don't want to bother with old Buffer implementation
if (compatibility.NodeBuffer) {
	(function (buffer) {
		try {
			buffer.writeFloatLE(Infinity, 0);
		} catch (e) {
			compatibility.NodeBuffer = false;
		}
	})(new Buffer(4));
}

if (compatibility.PixelData) {
	var createPixelData = function (byteLength, buffer) {
		var data = createPixelData.context2d.createImageData((byteLength + 3) / 4, 1).data;
		data.byteLength = byteLength;
		if (buffer !== undefined) {
			for (var i = 0; i < byteLength; i++) {
				data[i] = buffer[i];
			}
		}
		return data;
	};
	createPixelData.context2d = document.createElement('canvas').getContext('2d');
}

var dataTypes = {
	'Int8': 1,
	'Int16': 2,
	'Int32': 4,
	'Uint8': 1,
	'Uint16': 2,
	'Uint32': 4,
	'Float32': 4,
	'Float64': 8
};

var nodeNaming = {
	'Int8': 'Int8',
	'Int16': 'Int16',
	'Int32': 'Int32',
	'Uint8': 'UInt8',
	'Uint16': 'UInt16',
	'Uint32': 'UInt32',
	'Float32': 'Float',
	'Float64': 'Double'
};

function arrayFrom(arrayLike, forceCopy) {
	return (!forceCopy && (arrayLike instanceof Array)) ? arrayLike : Array.prototype.slice.call(arrayLike);
}

function defined(value, defaultValue) {
	return value !== undefined ? value : defaultValue;
}

function jDataView(buffer, byteOffset, byteLength, littleEndian) {
	/* jshint validthis:true */

	if (buffer instanceof jDataView) {
		var result = buffer.slice(byteOffset, byteOffset + byteLength);
		result._littleEndian = defined(littleEndian, result._littleEndian);
		return result;
	}

	if (!(this instanceof jDataView)) {
		return new jDataView(buffer, byteOffset, byteLength, littleEndian);
	}

	this.buffer = buffer = jDataView.wrapBuffer(buffer);

	// Check parameters and existing functionnalities
	this._isArrayBuffer = compatibility.ArrayBuffer && buffer instanceof ArrayBuffer;
	this._isPixelData = compatibility.PixelData && buffer instanceof CanvasPixelArray;
	this._isDataView = compatibility.DataView && this._isArrayBuffer;
	this._isNodeBuffer = compatibility.NodeBuffer && buffer instanceof Buffer;

	// Handle Type Errors
	if (!this._isNodeBuffer && !this._isArrayBuffer && !this._isPixelData && !(buffer instanceof Array)) {
		throw new TypeError('jDataView buffer has an incompatible type');
	}

	// Default Values
	this._littleEndian = !!littleEndian;

	var bufferLength = 'byteLength' in buffer ? buffer.byteLength : buffer.length;
	this.byteOffset = byteOffset = defined(byteOffset, 0);
	this.byteLength = byteLength = defined(byteLength, bufferLength - byteOffset);

	if (!this._isDataView) {
		this._checkBounds(byteOffset, byteLength, bufferLength);
	} else {
		this._view = new DataView(buffer, byteOffset, byteLength);
	}

	// Create uniform methods (action wrappers) for the following data types

	this._engineAction =
		this._isDataView
			? this._dataViewAction
		: this._isNodeBuffer
			? this._nodeBufferAction
		: this._isArrayBuffer
			? this._arrayBufferAction
		: this._arrayAction;
}

function getCharCodes(string) {
	if (compatibility.NodeBuffer) {
		return new Buffer(string, 'binary');
	}

	var Type = compatibility.ArrayBuffer ? Uint8Array : Array,
		codes = new Type(string.length);

	for (var i = 0, length = string.length; i < length; i++) {
		codes[i] = string.charCodeAt(i) & 0xff;
	}
	return codes;
}

// mostly internal function for wrapping any supported input (String or Array-like) to best suitable buffer format
jDataView.wrapBuffer = function (buffer) {
	switch (typeof buffer) {
		case 'number':
			if (compatibility.NodeBuffer) {
				buffer = new Buffer(buffer);
				buffer.fill(0);
			} else
			if (compatibility.ArrayBuffer) {
				buffer = new Uint8Array(buffer).buffer;
			} else
			if (compatibility.PixelData) {
				buffer = createPixelData(buffer);
			} else {
				buffer = new Array(buffer);
				for (var i = 0; i < buffer.length; i++) {
					buffer[i] = 0;
				}
			}
			return buffer;

		case 'string':
			buffer = getCharCodes(buffer);
			/* falls through */
		default:
			if ('length' in buffer && !((compatibility.NodeBuffer && buffer instanceof Buffer) || (compatibility.ArrayBuffer && buffer instanceof ArrayBuffer) || (compatibility.PixelData && buffer instanceof CanvasPixelArray))) {
				if (compatibility.NodeBuffer) {
					buffer = new Buffer(buffer);
				} else
				if (compatibility.ArrayBuffer) {
					if (!(buffer instanceof ArrayBuffer)) {
						buffer = new Uint8Array(buffer).buffer;
						// bug in Node.js <= 0.8:
						if (!(buffer instanceof ArrayBuffer)) {
							buffer = new Uint8Array(arrayFrom(buffer, true)).buffer;
						}
					}
				} else
				if (compatibility.PixelData) {
					buffer = createPixelData(buffer.length, buffer);
				} else {
					buffer = arrayFrom(buffer);
				}
			}
			return buffer;
	}
};

function pow2(n) {
	return (n >= 0 && n < 31) ? (1 << n) : (pow2[n] || (pow2[n] = Math.pow(2, n)));
}

// left for backward compatibility
jDataView.createBuffer = function () {
	return jDataView.wrapBuffer(arguments);
};

function Uint64(lo, hi) {
	this.lo = lo;
	this.hi = hi;
}

jDataView.Uint64 = Uint64;

Uint64.prototype = {
	valueOf: function () {
		return this.lo + pow2(32) * this.hi;
	},

	toString: function () {
		return Number.prototype.toString.apply(this.valueOf(), arguments);
	}
};

Uint64.fromNumber = function (number) {
	var hi = Math.floor(number / pow2(32)),
		lo = number - hi * pow2(32);

	return new Uint64(lo, hi);
};

function Int64(lo, hi) {
	Uint64.apply(this, arguments);
}

jDataView.Int64 = Int64;

Int64.prototype = 'create' in Object ? Object.create(Uint64.prototype) : new Uint64();

Int64.prototype.valueOf = function () {
	if (this.hi < pow2(31)) {
		return Uint64.prototype.valueOf.apply(this, arguments);
	}
	return -((pow2(32) - this.lo) + pow2(32) * (pow2(32) - 1 - this.hi));
};

Int64.fromNumber = function (number) {
	var lo, hi;
	if (number >= 0) {
		var unsigned = Uint64.fromNumber(number);
		lo = unsigned.lo;
		hi = unsigned.hi;
	} else {
		hi = Math.floor(number / pow2(32));
		lo = number - hi * pow2(32);
		hi += pow2(32);
	}
	return new Int64(lo, hi);
};

jDataView.prototype = {
	_offset: 0,
	_bitOffset: 0,

	compatibility: compatibility,

	_checkBounds: function (byteOffset, byteLength, maxLength) {
		// Do additional checks to simulate DataView
		if (typeof byteOffset !== 'number') {
			throw new TypeError('Offset is not a number.');
		}
		if (typeof byteLength !== 'number') {
			throw new TypeError('Size is not a number.');
		}
		if (byteLength < 0) {
			throw new RangeError('Length is negative.');
		}
		if (byteOffset < 0 || byteOffset + byteLength > defined(maxLength, this.byteLength)) {
			throw new RangeError('Offsets are out of bounds.');
		}
	},

	_action: function (type, isReadAction, byteOffset, littleEndian, value) {
		return this._engineAction(
			type,
			isReadAction,
			defined(byteOffset, this._offset),
			defined(littleEndian, this._littleEndian),
			value
		);
	},

	_dataViewAction: function (type, isReadAction, byteOffset, littleEndian, value) {
		// Move the internal offset forward
		this._offset = byteOffset + dataTypes[type];
		return isReadAction ? this._view['get' + type](byteOffset, littleEndian) : this._view['set' + type](byteOffset, value, littleEndian);
	},

	_nodeBufferAction: function (type, isReadAction, byteOffset, littleEndian, value) {
		// Move the internal offset forward
		this._offset = byteOffset + dataTypes[type];
		var nodeName = nodeNaming[type] + ((type === 'Int8' || type === 'Uint8') ? '' : littleEndian ? 'LE' : 'BE');
		byteOffset += this.byteOffset;
		return isReadAction ? this.buffer['read' + nodeName](byteOffset) : this.buffer['write' + nodeName](value, byteOffset);
	},

	_arrayBufferAction: function (type, isReadAction, byteOffset, littleEndian, value) {
		var size = dataTypes[type], TypedArray = global[type + 'Array'], typedArray;

		littleEndian = defined(littleEndian, this._littleEndian);

		// ArrayBuffer: we use a typed array of size 1 from original buffer if alignment is good and from slice when it's not
		if (size === 1 || ((this.byteOffset + byteOffset) % size === 0 && littleEndian)) {
			typedArray = new TypedArray(this.buffer, this.byteOffset + byteOffset, 1);
			this._offset = byteOffset + size;
			return isReadAction ? typedArray[0] : (typedArray[0] = value);
		} else {
			var bytes = new Uint8Array(isReadAction ? this.getBytes(size, byteOffset, littleEndian, true) : size);
			typedArray = new TypedArray(bytes.buffer, 0, 1);

			if (isReadAction) {
				return typedArray[0];
			} else {
				typedArray[0] = value;
				this._setBytes(byteOffset, bytes, littleEndian);
			}
		}
	},

	_arrayAction: function (type, isReadAction, byteOffset, littleEndian, value) {
		return isReadAction ? this['_get' + type](byteOffset, littleEndian) : this['_set' + type](byteOffset, value, littleEndian);
	},

	// Helpers

	_getBytes: function (length, byteOffset, littleEndian) {
		littleEndian = defined(littleEndian, this._littleEndian);
		byteOffset = defined(byteOffset, this._offset);
		length = defined(length, this.byteLength - byteOffset);

		this._checkBounds(byteOffset, length);

		byteOffset += this.byteOffset;

		this._offset = byteOffset - this.byteOffset + length;

		var result = this._isArrayBuffer
					 ? new Uint8Array(this.buffer, byteOffset, length)
					 : (this.buffer.slice || Array.prototype.slice).call(this.buffer, byteOffset, byteOffset + length);

		return littleEndian || length <= 1 ? result : arrayFrom(result).reverse();
	},

	// wrapper for external calls (do not return inner buffer directly to prevent it's modifying)
	getBytes: function (length, byteOffset, littleEndian, toArray) {
		var result = this._getBytes(length, byteOffset, defined(littleEndian, true));
		return toArray ? arrayFrom(result) : result;
	},

	_setBytes: function (byteOffset, bytes, littleEndian) {
		var length = bytes.length;

		// needed for Opera
		if (length === 0) {
			return;
		}

		littleEndian = defined(littleEndian, this._littleEndian);
		byteOffset = defined(byteOffset, this._offset);

		this._checkBounds(byteOffset, length);

		if (!littleEndian && length > 1) {
			bytes = arrayFrom(bytes, true).reverse();
		}

		byteOffset += this.byteOffset;

		if (this._isArrayBuffer) {
			new Uint8Array(this.buffer, byteOffset, length).set(bytes);
		}
		else {
			if (this._isNodeBuffer) {
				new Buffer(bytes).copy(this.buffer, byteOffset);
			} else {
				for (var i = 0; i < length; i++) {
					this.buffer[byteOffset + i] = bytes[i];
				}
			}
		}

		this._offset = byteOffset - this.byteOffset + length;
	},

	setBytes: function (byteOffset, bytes, littleEndian) {
		this._setBytes(byteOffset, bytes, defined(littleEndian, true));
	},

	getString: function (byteLength, byteOffset, encoding) {
		if (this._isNodeBuffer) {
			byteOffset = defined(byteOffset, this._offset);
			byteLength = defined(byteLength, this.byteLength - byteOffset);

			this._checkBounds(byteOffset, byteLength);

			this._offset = byteOffset + byteLength;
			return this.buffer.toString(encoding || 'binary', this.byteOffset + byteOffset, this.byteOffset + this._offset);
		}
		var bytes = this._getBytes(byteLength, byteOffset, true), string = '';
		byteLength = bytes.length;
		for (var i = 0; i < byteLength; i++) {
			string += String.fromCharCode(bytes[i]);
		}
		if (encoding === 'utf8') {
			string = decodeURIComponent(escape(string));
		}
		return string;
	},

	setString: function (byteOffset, subString, encoding) {
		if (this._isNodeBuffer) {
			byteOffset = defined(byteOffset, this._offset);
			this._checkBounds(byteOffset, subString.length);
			this._offset = byteOffset + this.buffer.write(subString, this.byteOffset + byteOffset, encoding || 'binary');
			return;
		}
		if (encoding === 'utf8') {
			subString = unescape(encodeURIComponent(subString));
		}
		this._setBytes(byteOffset, getCharCodes(subString), true);
	},

	getChar: function (byteOffset) {
		return this.getString(1, byteOffset);
	},

	setChar: function (byteOffset, character) {
		this.setString(byteOffset, character);
	},

	tell: function () {
		return this._offset;
	},

	seek: function (byteOffset) {
		this._checkBounds(byteOffset, 0);
		/* jshint boss: true */
		return this._offset = byteOffset;
	},

	skip: function (byteLength) {
		return this.seek(this._offset + byteLength);
	},

	slice: function (start, end, forceCopy) {
		function normalizeOffset(offset, byteLength) {
			return offset < 0 ? offset + byteLength : offset;
		}

		start = normalizeOffset(start, this.byteLength);
		end = normalizeOffset(defined(end, this.byteLength), this.byteLength);

		return forceCopy
			   ? new jDataView(this.getBytes(end - start, start, true, true), undefined, undefined, this._littleEndian)
			   : new jDataView(this.buffer, this.byteOffset + start, end - start, this._littleEndian);
	},

	alignBy: function (byteCount) {
		this._bitOffset = 0;
		if (defined(byteCount, 1) !== 1) {
			return this.skip(byteCount - (this._offset % byteCount || byteCount));
		} else {
			return this._offset;
		}
	},

	// Compatibility functions

	_getFloat64: function (byteOffset, littleEndian) {
		var b = this._getBytes(8, byteOffset, littleEndian),

			sign = 1 - (2 * (b[7] >> 7)),
			exponent = ((((b[7] << 1) & 0xff) << 3) | (b[6] >> 4)) - ((1 << 10) - 1),

		// Binary operators such as | and << operate on 32 bit values, using + and Math.pow(2) instead
			mantissa = ((b[6] & 0x0f) * pow2(48)) + (b[5] * pow2(40)) + (b[4] * pow2(32)) +
						(b[3] * pow2(24)) + (b[2] * pow2(16)) + (b[1] * pow2(8)) + b[0];

		if (exponent === 1024) {
			if (mantissa !== 0) {
				return NaN;
			} else {
				return sign * Infinity;
			}
		}

		if (exponent === -1023) { // Denormalized
			return sign * mantissa * pow2(-1022 - 52);
		}

		return sign * (1 + mantissa * pow2(-52)) * pow2(exponent);
	},

	_getFloat32: function (byteOffset, littleEndian) {
		var b = this._getBytes(4, byteOffset, littleEndian),

			sign = 1 - (2 * (b[3] >> 7)),
			exponent = (((b[3] << 1) & 0xff) | (b[2] >> 7)) - 127,
			mantissa = ((b[2] & 0x7f) << 16) | (b[1] << 8) | b[0];

		if (exponent === 128) {
			if (mantissa !== 0) {
				return NaN;
			} else {
				return sign * Infinity;
			}
		}

		if (exponent === -127) { // Denormalized
			return sign * mantissa * pow2(-126 - 23);
		}

		return sign * (1 + mantissa * pow2(-23)) * pow2(exponent);
	},

	_get64: function (Type, byteOffset, littleEndian) {
		littleEndian = defined(littleEndian, this._littleEndian);
		byteOffset = defined(byteOffset, this._offset);

		var parts = littleEndian ? [0, 4] : [4, 0];

		for (var i = 0; i < 2; i++) {
			parts[i] = this.getUint32(byteOffset + parts[i], littleEndian);
		}

		this._offset = byteOffset + 8;

		return new Type(parts[0], parts[1]);
	},

	getInt64: function (byteOffset, littleEndian) {
		return this._get64(Int64, byteOffset, littleEndian);
	},

	getUint64: function (byteOffset, littleEndian) {
		return this._get64(Uint64, byteOffset, littleEndian);
	},

	_getInt32: function (byteOffset, littleEndian) {
		var b = this._getBytes(4, byteOffset, littleEndian);
		return (b[3] << 24) | (b[2] << 16) | (b[1] << 8) | b[0];
	},

	_getUint32: function (byteOffset, littleEndian) {
		return this._getInt32(byteOffset, littleEndian) >>> 0;
	},

	_getInt16: function (byteOffset, littleEndian) {
		return (this._getUint16(byteOffset, littleEndian) << 16) >> 16;
	},

	_getUint16: function (byteOffset, littleEndian) {
		var b = this._getBytes(2, byteOffset, littleEndian);
		return (b[1] << 8) | b[0];
	},

	_getInt8: function (byteOffset) {
		return (this._getUint8(byteOffset) << 24) >> 24;
	},

	_getUint8: function (byteOffset) {
		return this._getBytes(1, byteOffset)[0];
	},

	_getBitRangeData: function (bitLength, byteOffset) {
		var startBit = (defined(byteOffset, this._offset) << 3) + this._bitOffset,
			endBit = startBit + bitLength,
			start = startBit >>> 3,
			end = (endBit + 7) >>> 3,
			b = this._getBytes(end - start, start, true),
			wideValue = 0;

		/* jshint boss: true */
		if (this._bitOffset = endBit & 7) {
			this._bitOffset -= 8;
		}

		for (var i = 0, length = b.length; i < length; i++) {
			wideValue = (wideValue << 8) | b[i];
		}

		return {
			start: start,
			bytes: b,
			wideValue: wideValue
		};
	},

	getSigned: function (bitLength, byteOffset) {
		var shift = 32 - bitLength;
		return (this.getUnsigned(bitLength, byteOffset) << shift) >> shift;
	},

	getUnsigned: function (bitLength, byteOffset) {
		var value = this._getBitRangeData(bitLength, byteOffset).wideValue >>> -this._bitOffset;
		return bitLength < 32 ? (value & ~(-1 << bitLength)) : value;
	},

	_setBinaryFloat: function (byteOffset, value, mantSize, expSize, littleEndian) {
		var signBit = value < 0 ? 1 : 0,
			exponent,
			mantissa,
			eMax = ~(-1 << (expSize - 1)),
			eMin = 1 - eMax;

		if (value < 0) {
			value = -value;
		}

		if (value === 0) {
			exponent = 0;
			mantissa = 0;
		} else if (isNaN(value)) {
			exponent = 2 * eMax + 1;
			mantissa = 1;
		} else if (value === Infinity) {
			exponent = 2 * eMax + 1;
			mantissa = 0;
		} else {
			exponent = Math.floor(Math.log(value) / Math.LN2);
			if (exponent >= eMin && exponent <= eMax) {
				mantissa = Math.floor((value * pow2(-exponent) - 1) * pow2(mantSize));
				exponent += eMax;
			} else {
				mantissa = Math.floor(value / pow2(eMin - mantSize));
				exponent = 0;
			}
		}

		var b = [];
		while (mantSize >= 8) {
			b.push(mantissa % 256);
			mantissa = Math.floor(mantissa / 256);
			mantSize -= 8;
		}
		exponent = (exponent << mantSize) | mantissa;
		expSize += mantSize;
		while (expSize >= 8) {
			b.push(exponent & 0xff);
			exponent >>>= 8;
			expSize -= 8;
		}
		b.push((signBit << expSize) | exponent);

		this._setBytes(byteOffset, b, littleEndian);
	},

	_setFloat32: function (byteOffset, value, littleEndian) {
		this._setBinaryFloat(byteOffset, value, 23, 8, littleEndian);
	},

	_setFloat64: function (byteOffset, value, littleEndian) {
		this._setBinaryFloat(byteOffset, value, 52, 11, littleEndian);
	},

	_set64: function (Type, byteOffset, value, littleEndian) {
		if (!(value instanceof Type)) {
			value = Type.fromNumber(value);
		}

		littleEndian = defined(littleEndian, this._littleEndian);
		byteOffset = defined(byteOffset, this._offset);

		var parts = littleEndian ? {lo: 0, hi: 4} : {lo: 4, hi: 0};

		for (var partName in parts) {
			this.setUint32(byteOffset + parts[partName], value[partName], littleEndian);
		}

		this._offset = byteOffset + 8;
	},

	setInt64: function (byteOffset, value, littleEndian) {
		this._set64(Int64, byteOffset, value, littleEndian);
	},

	setUint64: function (byteOffset, value, littleEndian) {
		this._set64(Uint64, byteOffset, value, littleEndian);
	},

	_setUint32: function (byteOffset, value, littleEndian) {
		this._setBytes(byteOffset, [
			value & 0xff,
			(value >>> 8) & 0xff,
			(value >>> 16) & 0xff,
			value >>> 24
		], littleEndian);
	},

	_setUint16: function (byteOffset, value, littleEndian) {
		this._setBytes(byteOffset, [
			value & 0xff,
			(value >>> 8) & 0xff
		], littleEndian);
	},

	_setUint8: function (byteOffset, value) {
		this._setBytes(byteOffset, [value & 0xff]);
	},

	setUnsigned: function (byteOffset, value, bitLength) {
		var data = this._getBitRangeData(bitLength, byteOffset),
			wideValue = data.wideValue,
			b = data.bytes;

		wideValue &= ~(~(-1 << bitLength) << -this._bitOffset); // clearing bit range before binary "or"
		wideValue |= (bitLength < 32 ? (value & ~(-1 << bitLength)) : value) << -this._bitOffset; // setting bits

		for (var i = b.length - 1; i >= 0; i--) {
			b[i] = wideValue & 0xff;
			wideValue >>>= 8;
		}

		this._setBytes(data.start, b, true);
	}
};

var proto = jDataView.prototype;

for (var type in dataTypes) {
	(function (type) {
		proto['get' + type] = function (byteOffset, littleEndian) {
			return this._action(type, true, byteOffset, littleEndian);
		};
		proto['set' + type] = function (byteOffset, value, littleEndian) {
			this._action(type, false, byteOffset, littleEndian, value);
		};
	})(type);
}

proto._setInt32 = proto._setUint32;
proto._setInt16 = proto._setUint16;
proto._setInt8 = proto._setUint8;
proto.setSigned = proto.setUnsigned;

for (var method in proto) {
	if (method.slice(0, 3) === 'set') {
		(function (type) {
			proto['write' + type] = function () {
				Array.prototype.unshift.call(arguments, undefined);
				this['set' + type].apply(this, arguments);
			};
		})(method.slice(3));
	}
}

if (typeof module !== 'undefined' && typeof module.exports === 'object') {
	module.exports = jDataView;
} else
if (typeof define === 'function' && define.amd) {
	define([], function () { return jDataView });
} else {
	var oldGlobal = global.jDataView;
	(global.jDataView = jDataView).noConflict = function () {
		global.jDataView = oldGlobal;
		return this;
	};
}

})((function () { /* jshint strict: false */ return this })());
}).call(this,require("buffer").Buffer)
},{"buffer":3}],2:[function(require,module,exports){

},{}],3:[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('is-array')

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192 // not used by this implementation

var kMaxLength = 0x3fffffff

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Note:
 *
 * - Implementation must support adding new properties to `Uint8Array` instances.
 *   Firefox 4-29 lacked support, fixed in Firefox 30+.
 *   See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *  - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *  - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *    incorrect length in some situations.
 *
 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they will
 * get the Object implementation, which is slower but will work correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = (function () {
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        new Uint8Array(1).subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Find the length
  var length
  if (type === 'number')
    length = subject > 0 ? subject >>> 0 : 0
  else if (type === 'string') {
    if (encoding === 'base64')
      subject = base64clean(subject)
    length = Buffer.byteLength(subject, encoding)
  } else if (type === 'object' && subject !== null) { // assume object is array-like
    if (subject.type === 'Buffer' && isArray(subject.data))
      subject = subject.data
    length = +subject.length > 0 ? Math.floor(+subject.length) : 0
  } else
    throw new TypeError('must start with number, buffer, array or string')

  if (this.length > kMaxLength)
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
      'size: 0x' + kMaxLength.toString(16) + ' bytes')

  var buf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer.TYPED_ARRAY_SUPPORT && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    if (Buffer.isBuffer(subject)) {
      for (i = 0; i < length; i++)
        buf[i] = subject.readUInt8(i)
    } else {
      for (i = 0; i < length; i++)
        buf[i] = ((subject[i] % 256) + 256) % 256
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer.TYPED_ARRAY_SUPPORT && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

Buffer.isBuffer = function (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b))
    throw new TypeError('Arguments must be Buffers')

  var x = a.length
  var y = b.length
  for (var i = 0, len = Math.min(x, y); i < len && a[i] === b[i]; i++) {}
  if (i !== len) {
    x = a[i]
    y = b[i]
  }
  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function (list, totalLength) {
  if (!isArray(list)) throw new TypeError('Usage: Buffer.concat(list[, length])')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (totalLength === undefined) {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str + ''
  switch (encoding || 'utf8') {
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    case 'hex':
      ret = str.length >>> 1
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    default:
      ret = str.length
  }
  return ret
}

// pre-set for values that may exist in the future
Buffer.prototype.length = undefined
Buffer.prototype.parent = undefined

// toString(encoding, start=0, end=buffer.length)
Buffer.prototype.toString = function (encoding, start, end) {
  var loweredCase = false

  start = start >>> 0
  end = end === undefined || end === Infinity ? this.length : end >>> 0

  if (!encoding) encoding = 'utf8'
  if (start < 0) start = 0
  if (end > this.length) end = this.length
  if (end <= start) return ''

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'binary':
        return binarySlice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase)
          throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.equals = function (b) {
  if(!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max)
      str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  return Buffer.compare(this, b)
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(byte)) throw new Error('Invalid hex string')
    buf[offset + i] = byte
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  var charsWritten = blitBuffer(utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

function asciiWrite (buf, string, offset, length) {
  var charsWritten = blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function binaryWrite (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  var charsWritten = blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function utf16leWrite (buf, string, offset, length) {
  var charsWritten = blitBuffer(utf16leToBytes(string), buf, offset, length)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = utf16leWrite(this, string, offset, length)
      break
    default:
      throw new TypeError('Unknown encoding: ' + encoding)
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function binarySlice (buf, start, end) {
  return asciiSlice(buf, start, end)
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len;
    if (start < 0)
      start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0)
      end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start)
    end = start

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    return Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0)
    throw new RangeError('offset is not uint')
  if (offset + ext > length)
    throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
      ((this[offset + 1] << 16) |
      (this[offset + 2] << 8) |
      this[offset + 3])
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80))
    return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return (this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16) |
      (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
      (this[offset + 1] << 16) |
      (this[offset + 2] << 8) |
      (this[offset + 3])
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  if (!noAssert)
    checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
  if (value > max || value < min) throw new TypeError('value is out of bounds')
  if (offset + ext > buf.length) throw new TypeError('index out of range')
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = value
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else objectWriteUInt16(this, value, offset, true)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else objectWriteUInt16(this, value, offset, false)
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = value
  } else objectWriteUInt32(this, value, offset, true)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else objectWriteUInt32(this, value, offset, false)
  return offset + 4
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = value
  return offset + 1
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
  } else objectWriteUInt16(this, value, offset, true)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = value
  } else objectWriteUInt16(this, value, offset, false)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = value
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else objectWriteUInt32(this, value, offset, true)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert)
    checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = value
  } else objectWriteUInt32(this, value, offset, false)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (value > max || value < min) throw new TypeError('value is out of bounds')
  if (offset + ext > buf.length) throw new TypeError('index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert)
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert)
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  if (end < start) throw new TypeError('sourceEnd < sourceStart')
  if (target_start < 0 || target_start >= target.length)
    throw new TypeError('targetStart out of bounds')
  if (start < 0 || start >= source.length) throw new TypeError('sourceStart out of bounds')
  if (end < 0 || end > source.length) throw new TypeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  var len = end - start

  if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < len; i++) {
      target[i + target_start] = this[i + start]
    }
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (end < start) throw new TypeError('end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  if (start < 0 || start >= this.length) throw new TypeError('start out of bounds')
  if (end < 0 || end > this.length) throw new TypeError('end out of bounds')

  var i
  if (typeof value === 'number') {
    for (i = start; i < end; i++) {
      this[i] = value
    }
  } else {
    var bytes = utf8ToBytes(value.toString())
    var len = bytes.length
    for (i = start; i < end; i++) {
      this[i] = bytes[i % len]
    }
  }

  return this
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1) {
        buf[i] = this[i]
      }
      return buf.buffer
    }
  } else {
    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function (arr) {
  arr.constructor = Buffer
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.equals = BP.equals
  arr.compare = BP.compare
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

var INVALID_BASE64_RE = /[^+\/0-9A-z]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F) {
      byteArray.push(b)
    } else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++) {
        byteArray.push(parseInt(h[j], 16))
      }
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

},{"base64-js":4,"ieee754":5,"is-array":6}],4:[function(require,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS)
			return 62 // '+'
		if (code === SLASH)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

},{}],5:[function(require,module,exports){
exports.read = function(buffer, offset, isLE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isLE ? (nBytes - 1) : 0,
      d = isLE ? -1 : 1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isLE ? 0 : (nBytes - 1),
      d = isLE ? 1 : -1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],6:[function(require,module,exports){

/**
 * isArray
 */

var isArray = Array.isArray;

/**
 * toString
 */

var str = Object.prototype.toString;

/**
 * Whether or not the given `val`
 * is an array.
 *
 * example:
 *
 *        isArray([]);
 *        // > true
 *        isArray(arguments);
 *        // > false
 *        isArray('');
 *        // > false
 *
 * @param {mixed} val
 * @return {bool}
 */

module.exports = isArray || function (val) {
  return !! val && '[object Array]' == str.call(val);
};

},{}],"+lAcbR":[function(require,module,exports){
var BeatMaker, main;

(function() {
  var nowOffset;
  if (typeof window.performance === 'undefined') {
    window.performance = {};
  }
  if (!window.performance.now) {
    nowOffset = +new Date();
    if (performance.timing && performance.timing) {
      nowOffset = performance.timing.navigationStart;
    }
    return window.performance.now = function() {
      var now;
      now = +new Date();
      return now - nowOffset;
    };
  }
})();

BeatMaker = (function() {
  function BeatMaker() {
    this.reset();
  }

  BeatMaker.prototype.setInputText = function(text) {
    return $("#beatinput").val(text);
  };

  BeatMaker.prototype.setOutputText = function(text) {
    return $("#beatoutput").html(text);
  };

  BeatMaker.prototype.error = function(text) {
    return this.setInputText(" ERROR: " + text);
  };

  BeatMaker.prototype.reset = function(note) {
    this.keyDownCount = 0;
    this.keyDownTime = {};
    this.recording = false;
    this.notes = [];
    if (note == null) {
      note = "";
    }
    return this.setInputText("" + note + " Click here and hit use A-Z keys to make a new beat (please loop the full pattern exactly twice)");
  };

  BeatMaker.prototype.updateRecording = function() {
    var now;
    if (!this.recording) {
      return;
    }
    now = window.performance.now();
    if (now > (this.lastKeyEvent + 2000)) {
      return $("#beatinput").val(" Recording (" + (Math.floor(4000 - (now - this.lastKeyEvent))) + " ms left...)...");
    } else {
      return $("#beatinput").val(" Recording...");
    }
  };

  BeatMaker.prototype.startRecording = function() {
    this.recording = true;
    return this.updateRecording();
  };

  BeatMaker.prototype.stopRecording = function() {
    var recordedNotes;
    recordedNotes = this.notes;
    this.reset(" Recording finished.");
    return this.generate(recordedNotes);
  };

  BeatMaker.prototype.keyDown = function(key, ts) {
    if (this.keyDownTime.hasOwnProperty(key)) {
      return;
    }
    this.lastKeyEvent = window.performance.now();
    if (!this.recording) {
      this.startRecording();
    }
    this.keyDownTime[key] = ts;
    return this.keyDownCount++;
  };

  BeatMaker.prototype.keyUp = function(key, ts) {
    if (!this.recording) {
      return;
    }
    this.lastKeyEvent = window.performance.now();
    this.notes.push({
      key: key,
      start: this.keyDownTime[key],
      end: ts
    });
    delete this.keyDownTime[key];
    return this.keyDownCount--;
  };

  BeatMaker.prototype.tick = function() {
    var now;
    if (!this.recording) {
      return;
    }
    this.updateRecording();
    if (this.keyDownCount > 0) {
      return;
    }
    now = window.performance.now();
    if (now > (this.lastKeyEvent + 4000)) {
      return this.stopRecording();
    }
  };

  BeatMaker.prototype.generate = function(notes) {
    var baseBPM, beat, beatStart, beatTime, i, key, keyNotes, loopCount, note, noteCount, noteIndex, pieceCount, pieceIndex, pieceSeen, pieceTime, pieces, _i, _j, _k, _l, _len, _len1, _m, _n;
    notes.sort(function(a, b) {
      return a.start - b.start;
    });
    if ((notes.length % 2) !== 0) {
      this.error("Odd count of notes! Please loop your beat exactly twice.");
      return;
    }
    beat = "";
    beatStart = notes[0].start;
    noteCount = notes.length >> 1;
    beatTime = notes[noteCount].start - beatStart;
    beat += "# " + noteCount + " notes, total time " + beatTime + " seconds\n";
    baseBPM = Math.floor(120000 / beatTime);
    while (baseBPM > 60) {
      baseBPM >>= 1;
    }
    beat += "# BPM guesses: " + baseBPM + ", " + (baseBPM * 2) + ", " + (baseBPM * 4) + "\n";
    beat += "\n# Here is your beat at various levels of granularity:\n";
    keyNotes = {};
    for (noteIndex = _i = 0; 0 <= noteCount ? _i < noteCount : _i > noteCount; noteIndex = 0 <= noteCount ? ++_i : --_i) {
      note = notes[noteIndex];
      if (!keyNotes.hasOwnProperty(note.key)) {
        keyNotes[note.key] = [];
      }
      keyNotes[note.key].push({
        start: note.start - beatStart,
        length: note.end - note.start
      });
    }
    pieceCount = 8;
    pieceTime = 0;
    for (loopCount = _j = 0; _j < 3; loopCount = ++_j) {
      pieceCount <<= 1;
      console.log("trying to fit in " + pieceCount + " pieces");
      beat += "\nloop pattern" + pieceCount + "\n";
      pieceTime = beatTime / pieceCount;
      for (key in keyNotes) {
        notes = keyNotes[key];
        console.log("* fitting key " + key);
        pieceSeen = [];
        for (i = _k = 0; 0 <= pieceCount ? _k < pieceCount : _k > pieceCount; i = 0 <= pieceCount ? ++_k : --_k) {
          pieceSeen[i] = false;
        }
        for (_l = 0, _len = notes.length; _l < _len; _l++) {
          note = notes[_l];
          pieceIndex = Math.floor((note.start + (pieceTime / 2)) / pieceTime);
          console.log("piece index for " + note.start + " is " + pieceIndex);
          if (pieceSeen[pieceIndex]) {
            console.log("already saw index " + pieceIndex + " for key " + key + ", doubling pieceCount");
            loopCount = 0;
            continue;
          }
        }
      }
      for (key in keyNotes) {
        notes = keyNotes[key];
        console.log("* rendering key " + key);
        pieces = [];
        for (i = _m = 0; 0 <= pieceCount ? _m < pieceCount : _m > pieceCount; i = 0 <= pieceCount ? ++_m : --_m) {
          pieces[i] = ".";
        }
        for (_n = 0, _len1 = notes.length; _n < _len1; _n++) {
          note = notes[_n];
          pieceIndex = Math.floor((note.start + (pieceTime / 2)) / pieceTime);
          console.log("piece index for " + note.start + " is " + pieceIndex);
          pieces[pieceIndex] = "x";
        }
        beat += ("  pattern " + key + " ") + pieces.join("") + "\n";
      }
    }
    console.log(keyNotes);
    return this.setOutputText(beat);
  };

  return BeatMaker;

})();

main = function() {
  var beatmaker;
  beatmaker = new BeatMaker;
  $('#beatinput').keydown(function(event) {
    var key, keyCode, now;
    keyCode = parseInt(event.keyCode);
    if ((keyCode < 65) || (keyCode > 90)) {
      return;
    }
    key = String.fromCharCode(event.keyCode);
    now = window.performance.now();
    return beatmaker.keyDown(key, now);
  });
  $('#beatinput').keyup(function(event) {
    var key, keyCode, now;
    keyCode = parseInt(event.keyCode);
    if ((keyCode < 65) || (keyCode > 90)) {
      return;
    }
    key = String.fromCharCode(event.keyCode);
    now = window.performance.now();
    return beatmaker.keyUp(key, now);
  });
  return setInterval(function() {
    return beatmaker.tick();
  }, 250);
};

main();

module.exports = {
  lel: "playz"
};



},{}],"./beatmaker":[function(require,module,exports){
module.exports=require('+lAcbR');
},{}],"./examples":[function(require,module,exports){
module.exports=require('J6p0lP');
},{}],"J6p0lP":[function(require,module,exports){
module.exports = {
  first: "# ------------------------------------------------------------\n# Your first LoopScript. Click \"Compile\" below to start!\n\ntone note1\n  duration 250\n  octave 4\n  note C\n\ntone bass1\n  duration 250\n  octave 1\n  note B\n\nloop loop1\n  pattern note1 x.......x.......\n  pattern bass1 ....x.......x...\n",
  notes: "# ------------------------------------------------------------\n# Note overrides!\n\n# H-L are the black keys:\n#     H I   J K L\n#    C D E F G A B\n\n# Try setting the duration to 100\ntone note1\n  adsr 0.005 0.05 0.7 0.05\n  duration 250\n\n# Samples can have their notes overridden too!\nsample ding\n  src samples/ding_e.wav\n  srcnote e\n\nloop loop1\n  pattern note1 b.a.g.a.b.b.b...\n\nloop loop2\n  pattern ding b.a.g.a.b.b.b...\n\ntrack song\n  pattern loop1 x\n  pattern loop2 .x\n",
  motto: "# ------------------------------------------------------------\n# An approximation of the beat from Drake's \"The Motto\"\n\nbpm 100\nsection # to share ADSR\n  adsr 0.005 0.05 0.7 0.05\n  tone bass1 -> octave 1\n  tone bass2 -> octave 2\n\nsample clap  -> src samples/clap.wav\nsample snare -> src samples/snare.wav\nsample hihat -> src samples/hihat.wav\n\nloop loop1\n  pattern hihat ..x.......x.......x.......x.....\n  pattern clap  ....x.......x.......x.......x...\n  pattern snare ......x...x...x.x...............\n  pattern bass1 Bbbbbb..........................\n  pattern bass2 ......HhhhhhDddddd....HhhhJj.Jj.\n\ntrack song\n  pattern loop1 xxxx\n",
  length: "# ------------------------------------------------------------\n# Showing off various note lengths using caps and lowercase\n# Also shows what ADSR can do!\n\ntone note1\n  adsr 0.005 0.05 0.7 0.05\n\ntone note2\n  # Note: Only the first tone has ADSR\n\n# If you use any letters other than \"x\" on a tone pattern, you override its\n# note with the note listed. Also, if you use any capital letters in a pattern,\n# you override the length of that note with the number of matching lowercase\n# letters following it.\n\nloop loop1\n  pattern note1 GgggggggFfffff..AaaaBbb.Cc..D...\n\nloop loop2\n  pattern note2 GgggggggFfffff..AaaaBbb.Cc..D...\n\ntrack song\n  pattern loop1 x.\n  pattern loop2 .x\n",
  chocobo: "# ------------------------------------------------------------\n# The Chocobo Theme (first part only)\n\nbpm 125\n\nsection Tone (in a section to share ADSR)\n  adsr 0.005 0.05 0.7 0.05\n  tone chocobo1\n    octave 5\n  tone chocobo2\n    octave 4\n\nloop loop1\n pattern chocobo1 Dddd......Dd..........................................D.E.Ffffff...\n pattern chocobo2 ....BbGgEe..BbGgBb..Gg..Bbbbbb.AaGgGAG.F.Gggggg.F.GgGB.............\n\ntrack song\n  pattern loop1 xx",
  kick: "# ------------------------------------------------------------\n# Bass kick (mixing a simple kick with a sustained bass sine)\n# Try changing 'freq' to anywhere in 55-80, and/or 'duration'\n\ntone note1\n  adsr 0.005 0.05 0.7 0.05\n  freq 60\n  duration 1500\n\nsample kick\n  src samples/kick3.wav\n\ntrack BassKick\n  pattern note1 x\n  pattern kick  x\n",
  kickpattern: "# ------------------------------------------------------------\n# Simple kick pattern\n\nbpm 90\n\ntone note1\n  adsr 0.005 0.05 0.7 0.05\n  octave 1\n  duration 1500\n\nsample kick\n  src samples/kick3.wav\n\nsample clap\n  src samples/clap.wav\n\nloop loop1\n  pattern clap  ....x.......x...\n  pattern note1 b.b...b.b.b.....\n  pattern kick  x.x...x.x.x.....\n\ntrack derp\n  pattern loop1 xxxx\n",
  wiggle: "# ------------------------------------------------------------\n# A silly approximation of Jason Derulo's Wiggle\n\nbpm 82\n\ntone bass\n  adsr 0.005 0.05 0.7 0.05\n  duration 1500\n  octave 2\n\nsample kick\n  src samples/kick3.wav\n\nsample snap\n  volume 0.5\n  src samples/snap.wav\n\nloop loop1\n  pattern snap ....x.......x...\n  pattern kick x..x..x.........\n  pattern bass a..f..e.........\n\ntrack wiggle\n  pattern loop1 xxxx",
  gambino3005: "# ------------------------------------------------------------\n# Childish Gambino - 3005 (intro)\n\nbpm 83\n\nsample z1   -> src samples/3005_zap1.wav\nsample z2   -> src samples/3005_zap2.wav\nsample z3   -> src samples/3005_zap3.wav\nsample rim  -> src samples/3005_rim.wav\nsample kick -> src samples/kick3.wav\n\ntone bass\n  adsr 0.005 0.05 0.9 0.5\n  duration 1500\n  freq 55\n  volume 1.2\n\nloop zaploop\n  pattern z1 x..x..x.........................\n  pattern z2 ........x..x..x.........x..x..x.\n  pattern z3 ................x..x..x.........\n\nloop rimloop\n  pattern rim ....x..x.x..x.......x..x.x..x...\n\nloop bassloop\n  pattern kick x.....x...x.....x.....x...x.....\n  pattern bass x.....x...x.....x.....x...x.....\n\ntrack 3005\n  pattern zaploop  xxxxxxxxxx\n  pattern rimloop  ..xx..xxxx\n  pattern bassloop ....xxxxxx\n"
};



},{}],"./freq":[function(require,module,exports){
module.exports=require('SwjZMG');
},{}],"SwjZMG":[function(require,module,exports){
var findFreq, freqTable, legalNoteRegex;

freqTable = [
  {
    "a": 27.5000,
    "l": 29.1353,
    "b": 30.8677
  }, {
    "c": 32.7032,
    "h": 34.6479,
    "d": 36.7081,
    "i": 38.8909,
    "e": 41.2035,
    "f": 43.6536,
    "j": 46.2493,
    "g": 48.9995,
    "k": 51.9130,
    "a": 55.0000,
    "l": 58.2705,
    "b": 61.7354
  }, {
    "c": 65.4064,
    "h": 69.2957,
    "d": 73.4162,
    "i": 77.7817,
    "e": 82.4069,
    "f": 87.3071,
    "j": 92.4986,
    "g": 97.9989,
    "k": 103.826,
    "a": 110.000,
    "l": 116.541,
    "b": 123.471
  }, {
    "c": 130.813,
    "h": 138.591,
    "d": 146.832,
    "i": 155.563,
    "e": 164.814,
    "f": 174.614,
    "j": 184.997,
    "g": 195.998,
    "k": 207.652,
    "a": 220.000,
    "l": 233.082,
    "b": 246.942
  }, {
    "c": 261.626,
    "h": 277.183,
    "d": 293.665,
    "i": 311.127,
    "e": 329.628,
    "f": 349.228,
    "j": 369.994,
    "g": 391.995,
    "k": 415.305,
    "a": 440.000,
    "l": 466.164,
    "b": 493.883
  }, {
    "c": 523.251,
    "h": 554.365,
    "d": 587.330,
    "i": 622.254,
    "e": 659.255,
    "f": 698.456,
    "j": 739.989,
    "g": 783.991,
    "k": 830.609,
    "a": 880.000,
    "l": 932.328,
    "b": 987.767
  }, {
    "c": 1046.50,
    "h": 1108.73,
    "d": 1174.66,
    "i": 1244.51,
    "e": 1318.51,
    "f": 1396.91,
    "j": 1479.98,
    "g": 1567.98,
    "k": 1661.22,
    "a": 1760.00,
    "l": 1864.66,
    "b": 1975.53
  }, {
    "c": 2093.00,
    "h": 2217.46,
    "d": 2349.32,
    "i": 2489.02,
    "e": 2637.02,
    "f": 2793.83,
    "j": 2959.96,
    "g": 3135.96,
    "k": 3322.44,
    "a": 3520.00,
    "l": 3729.31,
    "b": 3951.07
  }, {
    "c": 4186.01
  }
];

legalNoteRegex = /[a-l]/;

findFreq = function(octave, note) {
  var octaveTable;
  note = note.toLowerCase();
  if ((octave >= 0) && (octave < freqTable.length) && legalNoteRegex.test(note)) {
    octaveTable = freqTable[octave];
    if ((octaveTable != null) && (octaveTable[note] != null)) {
      return octaveTable[note];
    }
  }
  return 440.0;
};

module.exports = {
  freqTable: freqTable,
  findFreq: findFreq
};



},{}],"./loopscript":[function(require,module,exports){
module.exports=require('q0pWe1');
},{}],"q0pWe1":[function(require,module,exports){
var Parser, Renderer, clone, countIndent, findFreq, fs, generateBitmapDataURL, jDataView, logDebug, parseBool, renderLoopScript, renderWaveformImage, riffwave, _asLittleEndianHex, _collapseData, _scaleRows,
  __slice = [].slice;

findFreq = require('./freq').findFreq;

riffwave = require("./riffwave");

jDataView = require('../js/jdataview');

fs = require('fs');

logDebug = function() {
  var args;
  args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
};

clone = function(obj) {
  var flags, key, newInstance;
  if ((obj == null) || typeof obj !== 'object') {
    return obj;
  }
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  if (obj instanceof RegExp) {
    flags = '';
    if (obj.global != null) {
      flags += 'g';
    }
    if (obj.ignoreCase != null) {
      flags += 'i';
    }
    if (obj.multiline != null) {
      flags += 'm';
    }
    if (obj.sticky != null) {
      flags += 'y';
    }
    return new RegExp(obj.source, flags);
  }
  newInstance = new obj.constructor();
  for (key in obj) {
    newInstance[key] = clone(obj[key]);
  }
  return newInstance;
};

parseBool = function(v) {
  switch (String(v)) {
    case "true":
      return true;
    case "yes":
      return true;
    case "on":
      return true;
    case "1":
      return true;
    default:
      return false;
  }
};

countIndent = function(text) {
  var i, indent, _i, _ref;
  indent = 0;
  for (i = _i = 0, _ref = text.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
    if (text[i] === '\t') {
      indent += 8;
    } else {
      indent++;
    }
  }
  return indent;
};

_asLittleEndianHex = function(value, bytes) {
  var result;
  result = [];
  while (bytes > 0) {
    result.push(String.fromCharCode(value & 255));
    value >>= 8;
    bytes--;
  }
  return result.join('');
};

_collapseData = function(rows, row_padding) {
  var i, j, padding, pixel, pixels_len, result, rows_len, _i, _j;
  rows_len = rows.length;
  pixels_len = rows_len ? rows[0].length : 0;
  padding = '';
  result = [];
  while (row_padding > 0) {
    padding += '\x00';
    row_padding--;
  }
  for (i = _i = 0; 0 <= rows_len ? _i < rows_len : _i > rows_len; i = 0 <= rows_len ? ++_i : --_i) {
    for (j = _j = 0; 0 <= pixels_len ? _j < pixels_len : _j > pixels_len; j = 0 <= pixels_len ? ++_j : --_j) {
      pixel = rows[i][j];
      result.push(String.fromCharCode(pixel[2]) + String.fromCharCode(pixel[1]) + String.fromCharCode(pixel[0]));
    }
    result.push(padding);
  }
  return result.join('');
};

_scaleRows = function(rows, scale) {
  var new_row, new_rows, real_h, real_w, scaled_h, scaled_w, x, y, _i, _j;
  real_w = rows.length;
  scaled_w = parseInt(real_w * scale);
  real_h = real_w ? rows[0].length : 0;
  scaled_h = parseInt(real_h * scale);
  new_rows = [];
  for (y = _i = 0; 0 <= scaled_h ? _i < scaled_h : _i > scaled_h; y = 0 <= scaled_h ? ++_i : --_i) {
    new_rows.push(new_row = []);
    for (x = _j = 0; 0 <= scaled_w ? _j < scaled_w : _j > scaled_w; x = 0 <= scaled_w ? ++_j : --_j) {
      new_row.push(rows[parseInt(y / scale)][parseInt(x / scale)]);
    }
  }
  return new_rows;
};

generateBitmapDataURL = function(rows, scale) {
  var file, height, num_data_bytes, num_file_bytes, row_padding, width;
  if (!btoa) {
    return false;
  }
  scale = scale || 1;
  if (scale !== 1) {
    rows = _scaleRows(rows, scale);
  }
  height = rows.length;
  width = height ? rows[0].length : 0;
  row_padding = (4 - (width * 3) % 4) % 4;
  num_data_bytes = (width * 3 + row_padding) * height;
  num_file_bytes = 54 + num_data_bytes;
  height = _asLittleEndianHex(height, 4);
  width = _asLittleEndianHex(width, 4);
  num_data_bytes = _asLittleEndianHex(num_data_bytes, 4);
  num_file_bytes = _asLittleEndianHex(num_file_bytes, 4);
  file = 'BM' + num_file_bytes + '\x00\x00' + '\x00\x00' + '\x36\x00\x00\x00' + '\x28\x00\x00\x00' + width + height + '\x01\x00' + '\x18\x00' + '\x00\x00\x00\x00' + num_data_bytes + '\x13\x0B\x00\x00' + '\x13\x0B\x00\x00' + '\x00\x00\x00\x00' + '\x00\x00\x00\x00' + _collapseData(rows, row_padding);
  return 'data:image/bmp;base64,' + btoa(file);
};

Parser = (function() {
  function Parser(log) {
    this.log = log;
    this.commentRegex = /^([^#]*?)(\s*#.*)?$/;
    this.onlyWhitespaceRegex = /^\s*$/;
    this.indentRegex = /^(\s*)(\S.*)$/;
    this.leadingUnderscoreRegex = /^_/;
    this.hasCapitalLettersRegex = /[A-Z]/;
    this.isNoteRegex = /[A-La-l]/;
    this.namedStates = {
      "default": {
        srcoctave: 4,
        srcnote: 'a',
        octave: 4,
        note: 'a',
        wave: 'sine',
        bpm: 120,
        duration: 200,
        volume: 1.0,
        clip: true,
        reverb: {
          delay: 0,
          decay: 0
        },
        adsr: {
          a: 0,
          d: 0,
          s: 1,
          r: 1
        }
      }
    };
    this.objectKeys = {
      tone: {
        wave: 'string',
        freq: 'float',
        duration: 'float',
        adsr: 'adsr',
        octave: 'int',
        note: 'string',
        volume: 'float',
        clip: 'bool',
        reverb: 'reverb'
      },
      sample: {
        src: 'string',
        volume: 'float',
        clip: 'bool',
        reverb: 'reverb',
        srcoctave: 'int',
        srcnote: 'string',
        octave: 'int',
        note: 'string'
      },
      loop: {
        bpm: 'int'
      },
      track: {}
    };
    this.stateStack = [];
    this.reset('default', 0);
    this.objects = {};
    this.object = null;
    this.objectScopeReady = false;
  }

  Parser.prototype.isObjectType = function(type) {
    return this.objectKeys[type] != null;
  };

  Parser.prototype.error = function(text) {
    return this.log.error("PARSE ERROR, line " + this.lineNo + ": " + text);
  };

  Parser.prototype.reset = function(name, indent) {
    var newState;
    if (name == null) {
      name = 'default';
    }
    if (indent == null) {
      indent = 0;
    }
    if (!this.namedStates[name]) {
      this.error("invalid reset name: " + name);
      return false;
    }
    newState = clone(this.namedStates[name]);
    newState._indent = indent;
    this.stateStack.push(newState);
    return true;
  };

  Parser.prototype.flatten = function() {
    var flattenedState, key, state, _i, _len, _ref;
    flattenedState = {};
    _ref = this.stateStack;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      state = _ref[_i];
      for (key in state) {
        flattenedState[key] = state[key];
      }
    }
    return flattenedState;
  };

  Parser.prototype.trace = function(prefix) {
    if (prefix == null) {
      prefix = '';
    }
    return this.log.verbose(("trace: " + prefix + " ") + JSON.stringify(this.flatten()));
  };

  Parser.prototype.createObject = function() {
    var data, i, indent, _i, _ref;
    indent = arguments[0], data = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    this.object = {
      _indent: indent
    };
    for (i = _i = 0, _ref = data.length; _i < _ref; i = _i += 2) {
      this.object[data[i]] = data[i + 1];
    }
    this.objectScopeReady = true;
    if (this.object._type === 'loop') {
      this.object._patterns = [];
    }
    if (this.object._type === 'track') {
      this.object._patterns = [];
    }
    if (this.object._name) {
      this.lastObject = this.object._name;
      return logDebug("createObject[" + indent + "]: ", this.lastObject);
    }
  };

  Parser.prototype.finishObject = function() {
    var expectedType, key, state, v;
    if (this.object) {
      state = this.flatten();
      for (key in this.objectKeys[this.object._type]) {
        expectedType = this.objectKeys[this.object._type][key];
        if (state[key] != null) {
          v = state[key];
          this.object[key] = (function() {
            switch (expectedType) {
              case 'int':
                return parseInt(v);
              case 'float':
                return parseFloat(v);
              case 'bool':
                return parseBool(v);
              default:
                return v;
            }
          })();
        }
      }
      logDebug("finishObject: ", this.object);
      this.objects[this.object._name] = this.object;
    }
    return this.object = null;
  };

  Parser.prototype.creatingObjectType = function(type) {
    if (!this.object) {
      return false;
    }
    if (!this.object._type === type) {
      return false;
    }
    return true;
  };

  Parser.prototype.updateFakeIndents = function(indent) {
    var i, prevIndent, _results;
    if (indent >= 1000) {
      return;
    }
    i = this.stateStack.length - 1;
    _results = [];
    while (i > 0) {
      prevIndent = this.stateStack[i - 1]._indent;
      if ((this.stateStack[i]._indent > 1000) && (prevIndent < indent)) {
        logDebug("updateFakeIndents: changing stack indent " + i + " from " + this.stateStack[i]._indent + " to " + indent);
        this.stateStack[i]._indent = indent;
      }
      _results.push(i--);
    }
    return _results;
  };

  Parser.prototype.pushState = function(indent) {
    if (indent == null) {
      indent = 0;
    }
    logDebug("pushState(" + indent + ")");
    this.updateFakeIndents(indent);
    this.stateStack.push({
      _indent: indent
    });
    return true;
  };

  Parser.prototype.popState = function(indent) {
    var topIndent;
    logDebug("popState(" + indent + ")");
    if (this.object != null) {
      if (indent <= this.object._indent) {
        this.finishObject();
      }
    }
    this.updateFakeIndents(indent);
    while (true) {
      topIndent = this.getTopIndent();
      logDebug("popState(" + indent + ") top indent " + topIndent);
      if (indent === topIndent) {
        break;
      }
      if (this.stateStack.length < 2) {
        return false;
      }
      logDebug("popState(" + indent + ") popping indent " + topIndent);
      this.stateStack.pop();
    }
    return true;
  };

  Parser.prototype.parsePattern = function(pattern) {
    var c, i, length, next, overrideLength, sound, sounds, symbol;
    overrideLength = this.hasCapitalLettersRegex.test(pattern);
    i = 0;
    sounds = [];
    while (i < pattern.length) {
      c = pattern[i];
      if (c !== '.') {
        symbol = c.toLowerCase();
        sound = {
          offset: i
        };
        if (this.isNoteRegex.test(c)) {
          sound.note = symbol;
        }
        if (overrideLength) {
          length = 1;
          while (true) {
            next = pattern[i + 1];
            if (next === symbol) {
              length++;
              i++;
              if (i === pattern.length) {
                break;
              }
            } else {
              break;
            }
          }
          sound.length = length;
        }
        sounds.push(sound);
      }
      i++;
    }
    return {
      pattern: pattern,
      length: pattern.length,
      sounds: sounds
    };
  };

  Parser.prototype.getTopIndent = function() {
    return this.stateStack[this.stateStack.length - 1]._indent;
  };

  Parser.prototype.processTokens = function(tokens, indent) {
    var cmd, pattern;
    cmd = tokens[0].toLowerCase();
    if (cmd === 'reset') {
      if (!this.reset(tokens[1], indent)) {
        return false;
      }
    } else if (cmd === 'section') {
      this.objectScopeReady = true;
    } else if (this.isObjectType(cmd)) {
      this.createObject(indent, '_type', cmd, '_name', tokens[1]);
    } else if (cmd === 'pattern') {
      if (!(this.creatingObjectType('loop') || this.creatingObjectType('track'))) {
        this.error("unexpected pattern command");
        return false;
      }
      pattern = this.parsePattern(tokens[2]);
      pattern.src = tokens[1];
      this.object._patterns.push(pattern);
    } else if (cmd === 'adsr') {
      this.stateStack[this.stateStack.length - 1][cmd] = {
        a: parseFloat(tokens[1]),
        d: parseFloat(tokens[2]),
        s: parseFloat(tokens[3]),
        r: parseFloat(tokens[4])
      };
    } else if (cmd === 'reverb') {
      this.stateStack[this.stateStack.length - 1][cmd] = {
        delay: parseInt(tokens[1]),
        decay: parseFloat(tokens[2])
      };
    } else {
      if (this.leadingUnderscoreRegex.test(cmd)) {
        this.error("cannot set internal names (underscore prefix)");
        return false;
      }
      this.stateStack[this.stateStack.length - 1][cmd] = tokens[1];
    }
    return true;
  };

  Parser.prototype.parse = function(text) {
    var arrowSection, arrowSections, indent, indentText, line, lineObjs, lines, obj, semiSection, semiSections, topIndent, _, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref;
    lines = text.split('\n');
    this.lineNo = 0;
    for (_i = 0, _len = lines.length; _i < _len; _i++) {
      line = lines[_i];
      this.lineNo++;
      line = line.replace(/(\r\n|\n|\r)/gm, "");
      line = this.commentRegex.exec(line)[1];
      if (this.onlyWhitespaceRegex.test(line)) {
        continue;
      }
      _ref = this.indentRegex.exec(line), _ = _ref[0], indentText = _ref[1], line = _ref[2];
      indent = countIndent(indentText);
      lineObjs = [];
      arrowSections = line.split(/\s*->\s*/);
      for (_j = 0, _len1 = arrowSections.length; _j < _len1; _j++) {
        arrowSection = arrowSections[_j];
        semiSections = arrowSection.split(/\s*;\s*/);
        for (_k = 0, _len2 = semiSections.length; _k < _len2; _k++) {
          semiSection = semiSections[_k];
          lineObjs.push({
            indent: indent,
            line: semiSection
          });
        }
        indent += 1000;
      }
      for (_l = 0, _len3 = lineObjs.length; _l < _len3; _l++) {
        obj = lineObjs[_l];
        logDebug("handling indent: " + JSON.stringify(obj));
        topIndent = this.getTopIndent();
        if (obj.indent > topIndent) {
          this.pushState(obj.indent);
        } else {
          if (!this.popState(obj.indent)) {
            this.log.error("unexpected outdent");
            return false;
          }
        }
        logDebug("processing: " + JSON.stringify(obj));
        if (!this.processTokens(obj.line.split(/\s+/), obj.indent)) {
          return false;
        }
      }
    }
    this.popState(0);
    return true;
  };

  return Parser;

})();

Renderer = (function() {
  function Renderer(log, sampleRate, readLocalFiles, objects) {
    this.log = log;
    this.sampleRate = sampleRate;
    this.readLocalFiles = readLocalFiles;
    this.objects = objects;
    this.soundCache = {};
  }

  Renderer.prototype.error = function(text) {
    return this.log.error("RENDER ERROR: " + text);
  };

  Renderer.prototype.generateEnvelope = function(adsr, length) {
    var AtoD, DtoS, StoR, attackLen, decayLen, envelope, i, peakSustainDelta, releaseLen, sustain, sustainLen, _i, _j, _k, _l;
    envelope = Array(length);
    AtoD = Math.floor(adsr.a * length);
    DtoS = Math.floor(adsr.d * length);
    StoR = Math.floor(adsr.r * length);
    attackLen = AtoD;
    decayLen = DtoS - AtoD;
    sustainLen = StoR - DtoS;
    releaseLen = length - StoR;
    sustain = adsr.s;
    peakSustainDelta = 1.0 - sustain;
    for (i = _i = 0; 0 <= attackLen ? _i < attackLen : _i > attackLen; i = 0 <= attackLen ? ++_i : --_i) {
      envelope[i] = i / attackLen;
    }
    for (i = _j = 0; 0 <= decayLen ? _j < decayLen : _j > decayLen; i = 0 <= decayLen ? ++_j : --_j) {
      envelope[AtoD + i] = 1.0 - (peakSustainDelta * (i / decayLen));
    }
    for (i = _k = 0; 0 <= sustainLen ? _k < sustainLen : _k > sustainLen; i = 0 <= sustainLen ? ++_k : --_k) {
      envelope[DtoS + i] = sustain;
    }
    for (i = _l = 0; 0 <= releaseLen ? _l < releaseLen : _l > releaseLen; i = 0 <= releaseLen ? ++_l : --_l) {
      envelope[StoR + i] = sustain - (sustain * (i / releaseLen));
    }
    return envelope;
  };

  Renderer.prototype.renderTone = function(toneObj, overrides) {
    var A, B, amplitude, envelope, freq, i, length, period, sample, samples, _i;
    amplitude = 10000;
    if (overrides.length > 0) {
      length = overrides.length;
    } else {
      length = Math.floor(toneObj.duration * this.sampleRate / 1000);
    }
    samples = Array(length);
    A = 200;
    B = 0.5;
    if (overrides.note != null) {
      freq = findFreq(toneObj.octave, overrides.note);
    } else if (toneObj.freq != null) {
      freq = toneObj.freq;
    } else {
      freq = findFreq(toneObj.octave, toneObj.note);
    }
    envelope = this.generateEnvelope(toneObj.adsr, length);
    period = this.sampleRate / freq;
    for (i = _i = 0; 0 <= length ? _i < length : _i > length; i = 0 <= length ? ++_i : --_i) {
      if (toneObj.wave === "sawtooth") {
        sample = ((i % period) / period) - 0.5;
      } else {
        sample = Math.sin(i / period * 2 * Math.PI);
        if (toneObj.wave === "square") {
          sample = sample > 0 ? 1 : -1;
        }
      }
      samples[i] = sample * amplitude * envelope[i];
    }
    return {
      samples: samples,
      length: samples.length
    };
  };

  Renderer.prototype.renderSample = function(sampleObj, overrides) {
    var data, factor, i, newfreq, oldfreq, overrideNote, relength, resamples, samples, subchunk2Size, view, _i, _j;
    view = null;
    if (this.readLocalFiles) {
      data = fs.readFileSync(sampleObj.src);
      view = new jDataView(data, 0, data.length, true);
    } else {
      $.ajax({
        url: sampleObj.src,
        mimeType: 'text/plain; charset=x-user-defined',
        success: function(data) {
          return view = new jDataView(data, 0, data.length, true);
        },
        async: false
      });
    }
    if (!view) {
      return {
        samples: [],
        length: 0
      };
    }
    view.seek(40);
    subchunk2Size = view.getInt32();
    samples = [];
    while (view.tell() + 1 < view.byteLength) {
      samples.push(view.getInt16());
    }
    overrideNote = overrides.note ? overrides.note : sampleObj.note;
    if ((overrideNote !== sampleObj.srcnote) || (sampleObj.octave !== sampleObj.srcoctave)) {
      oldfreq = findFreq(sampleObj.srcoctave, sampleObj.srcnote);
      newfreq = findFreq(sampleObj.octave, overrideNote);
      factor = oldfreq / newfreq;
      relength = Math.floor(samples.length * factor);
      resamples = Array(relength);
      for (i = _i = 0; 0 <= relength ? _i < relength : _i > relength; i = 0 <= relength ? ++_i : --_i) {
        resamples[i] = 0;
      }
      for (i = _j = 0; 0 <= relength ? _j < relength : _j > relength; i = 0 <= relength ? ++_j : --_j) {
        resamples[i] = samples[Math.floor(i / factor)];
      }
      return {
        samples: resamples,
        length: resamples.length
      };
    } else {
      return {
        samples: samples,
        length: samples.length
      };
    }
  };

  Renderer.prototype.renderLoop = function(loopObj) {
    var beatCount, copyLen, end, fadeClip, i, j, obj, offset, offsetLength, overflowLength, overrides, pattern, patternSamples, samples, samplesPerBeat, sectionCount, sound, srcSound, totalLength, v, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _n, _o, _p, _q, _r, _ref, _ref1, _ref2, _ref3, _ref4, _s, _t;
    beatCount = 0;
    _ref = loopObj._patterns;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      pattern = _ref[_i];
      if (beatCount < pattern.length) {
        beatCount = pattern.length;
      }
    }
    samplesPerBeat = this.sampleRate / (loopObj.bpm / 60) / 4;
    totalLength = Math.floor(samplesPerBeat * beatCount);
    overflowLength = totalLength;
    _ref1 = loopObj._patterns;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      pattern = _ref1[_j];
      sectionCount = pattern.length / 16;
      offsetLength = Math.floor(totalLength / 16 / sectionCount);
      _ref2 = pattern.sounds;
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        sound = _ref2[_k];
        overrides = {};
        if (sound.length > 0) {
          overrides.length = sound.length * offsetLength;
        }
        if (sound.note != null) {
          overrides.note = sound.note;
        }
        sound._render = this.render(pattern.src, overrides);
        end = (sound.offset * offsetLength) + sound._render.samples.length;
        if (overflowLength < end) {
          overflowLength = end;
        }
      }
    }
    samples = Array(overflowLength);
    for (i = _l = 0; 0 <= overflowLength ? _l < overflowLength : _l > overflowLength; i = 0 <= overflowLength ? ++_l : --_l) {
      samples[i] = 0;
    }
    _ref3 = loopObj._patterns;
    for (_m = 0, _len3 = _ref3.length; _m < _len3; _m++) {
      pattern = _ref3[_m];
      sectionCount = pattern.length / 16;
      offsetLength = Math.floor(totalLength / 16 / sectionCount);
      patternSamples = Array(overflowLength);
      for (i = _n = 0; 0 <= overflowLength ? _n < overflowLength : _n > overflowLength; i = 0 <= overflowLength ? ++_n : --_n) {
        patternSamples[i] = 0;
      }
      _ref4 = pattern.sounds;
      for (_o = 0, _len4 = _ref4.length; _o < _len4; _o++) {
        sound = _ref4[_o];
        srcSound = sound._render;
        obj = this.getObject(pattern.src);
        offset = sound.offset * offsetLength;
        copyLen = srcSound.samples.length;
        if ((offset + copyLen) > overflowLength) {
          copyLen = overflowLength - offset;
        }
        if (obj.clip) {
          fadeClip = 200;
          if (offset > fadeClip) {
            for (j = _p = 0; 0 <= fadeClip ? _p < fadeClip : _p > fadeClip; j = 0 <= fadeClip ? ++_p : --_p) {
              v = patternSamples[offset - fadeClip + j];
              patternSamples[offset - fadeClip + j] = Math.floor(v * ((fadeClip - j) / fadeClip));
            }
          }
          for (j = _q = offset; offset <= overflowLength ? _q < overflowLength : _q > overflowLength; j = offset <= overflowLength ? ++_q : --_q) {
            patternSamples[j] = 0;
          }
          for (j = _r = 0; 0 <= copyLen ? _r < copyLen : _r > copyLen; j = 0 <= copyLen ? ++_r : --_r) {
            patternSamples[offset + j] = srcSound.samples[j];
          }
        } else {
          for (j = _s = 0; 0 <= copyLen ? _s < copyLen : _s > copyLen; j = 0 <= copyLen ? ++_s : --_s) {
            patternSamples[offset + j] += srcSound.samples[j];
          }
        }
      }
      for (j = _t = 0; 0 <= overflowLength ? _t < overflowLength : _t > overflowLength; j = 0 <= overflowLength ? ++_t : --_t) {
        samples[j] += patternSamples[j];
      }
    }
    return {
      samples: samples,
      length: totalLength
    };
  };

  Renderer.prototype.renderTrack = function(trackObj) {
    var copyLen, i, j, overflowLength, pattern, pieceCount, pieceIndex, pieceOverflowLength, pieceTotalLength, possibleMaxLength, samples, srcSound, totalLength, trackOffset, _i, _j, _k, _l, _len, _len1, _len2, _m, _n, _o, _ref, _ref1, _ref2;
    pieceCount = 0;
    _ref = trackObj._patterns;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      pattern = _ref[_i];
      if (pieceCount < pattern.pattern.length) {
        pieceCount = pattern.pattern.length;
      }
    }
    totalLength = 0;
    overflowLength = 0;
    pieceTotalLength = Array(pieceCount);
    pieceOverflowLength = Array(pieceCount);
    for (pieceIndex = _j = 0; 0 <= pieceCount ? _j < pieceCount : _j > pieceCount; pieceIndex = 0 <= pieceCount ? ++_j : --_j) {
      pieceTotalLength[pieceIndex] = 0;
      pieceOverflowLength[pieceIndex] = 0;
      _ref1 = trackObj._patterns;
      for (_k = 0, _len1 = _ref1.length; _k < _len1; _k++) {
        pattern = _ref1[_k];
        if ((pieceIndex < pattern.pattern.length) && (pattern.pattern[pieceIndex] !== '.')) {
          srcSound = this.render(pattern.src);
          if (pieceTotalLength[pieceIndex] < srcSound.length) {
            pieceTotalLength[pieceIndex] = srcSound.length;
          }
          if (pieceOverflowLength[pieceIndex] < srcSound.samples.length) {
            pieceOverflowLength[pieceIndex] = srcSound.samples.length;
          }
        }
      }
      possibleMaxLength = totalLength + pieceOverflowLength[pieceIndex];
      if (overflowLength < possibleMaxLength) {
        overflowLength = possibleMaxLength;
      }
      totalLength += pieceTotalLength[pieceIndex];
    }
    samples = Array(overflowLength);
    for (i = _l = 0; 0 <= overflowLength ? _l < overflowLength : _l > overflowLength; i = 0 <= overflowLength ? ++_l : --_l) {
      samples[i] = 0;
    }
    _ref2 = trackObj._patterns;
    for (_m = 0, _len2 = _ref2.length; _m < _len2; _m++) {
      pattern = _ref2[_m];
      trackOffset = 0;
      srcSound = this.render(pattern.src, {});
      for (pieceIndex = _n = 0; 0 <= pieceCount ? _n < pieceCount : _n > pieceCount; pieceIndex = 0 <= pieceCount ? ++_n : --_n) {
        if ((pieceIndex < pattern.pattern.length) && (pattern.pattern[pieceIndex] !== '.')) {
          copyLen = srcSound.samples.length;
          if ((trackOffset + copyLen) > overflowLength) {
            copyLen = overflowLength - trackOffset;
          }
          for (j = _o = 0; 0 <= copyLen ? _o < copyLen : _o > copyLen; j = 0 <= copyLen ? ++_o : --_o) {
            samples[trackOffset + j] += srcSound.samples[j];
          }
        }
        trackOffset += pieceTotalLength[pieceIndex];
      }
    }
    return {
      samples: samples,
      length: totalLength
    };
  };

  Renderer.prototype.calcCacheName = function(type, which, overrides) {
    var name;
    if ((type !== 'tone') && (type !== 'sample')) {
      return which;
    }
    name = which;
    if (overrides.note) {
      name += "/N" + overrides.note;
    }
    if (overrides.length) {
      name += "/L" + overrides.length;
    }
    return name;
  };

  Renderer.prototype.getObject = function(which) {
    var object;
    object = this.objects[which];
    if (!object) {
      this.error("no such object " + which);
      return null;
    }
    return object;
  };

  Renderer.prototype.render = function(which, overrides) {
    var cacheName, delaySamples, factor, i, newfreq, object, oldfreq, overrideNote, relength, resamples, samples, sound, totalLength, _i, _j, _k, _l, _m, _n, _ref, _ref1, _ref2, _ref3;
    object = this.getObject(which);
    if (!object) {
      return null;
    }
    if (overrides == null) {
      overrides = {};
    }
    cacheName = this.calcCacheName(object._type, which, overrides);
    if (this.soundCache[cacheName]) {
      return this.soundCache[cacheName];
    }
    sound = (function() {
      switch (object._type) {
        case 'tone':
          return this.renderTone(object, overrides);
        case 'sample':
          return this.renderSample(object, overrides);
        case 'loop':
          return this.renderLoop(object);
        case 'track':
          return this.renderTrack(object);
        default:
          this.error("unknown type " + object._type);
          return null;
      }
    }).call(this);
    if (object._type !== 'tone') {
      overrideNote = overrides.note ? overrides.note : object.note;
      if ((overrideNote !== object.srcnote) || (object.octave !== object.srcoctave)) {
        oldfreq = findFreq(object.srcoctave, object.srcnote);
        newfreq = findFreq(object.octave, overrideNote);
        factor = oldfreq / newfreq;
        relength = Math.floor(sound.samples.length * factor);
        resamples = Array(relength);
        for (i = _i = 0; 0 <= relength ? _i < relength : _i > relength; i = 0 <= relength ? ++_i : --_i) {
          resamples[i] = 0;
        }
        for (i = _j = 0; 0 <= relength ? _j < relength : _j > relength; i = 0 <= relength ? ++_j : --_j) {
          resamples[i] = sound.samples[Math.floor(i / factor)];
        }
        sound.samples = resamples;
        sound.length = resamples.length;
      }
    }
    if ((object.volume != null) && (object.volume !== 1.0)) {
      for (i = _k = 0, _ref = sound.samples.length; 0 <= _ref ? _k < _ref : _k > _ref; i = 0 <= _ref ? ++_k : --_k) {
        sound.samples[i] *= object.volume;
      }
    }
    if ((object.reverb != null) && (object.reverb.delay > 0)) {
      delaySamples = Math.floor(object.reverb.delay * this.sampleRate / 1000);
      if (sound.samples.length > delaySamples) {
        totalLength = sound.samples.length + (delaySamples * 8);
        samples = Array(totalLength);
        for (i = _l = 0, _ref1 = sound.samples.length; 0 <= _ref1 ? _l < _ref1 : _l > _ref1; i = 0 <= _ref1 ? ++_l : --_l) {
          samples[i] = sound.samples[i];
        }
        for (i = _m = _ref2 = sound.samples.length; _ref2 <= totalLength ? _m < totalLength : _m > totalLength; i = _ref2 <= totalLength ? ++_m : --_m) {
          samples[i] = 0;
        }
        for (i = _n = 0, _ref3 = totalLength - delaySamples; 0 <= _ref3 ? _n < _ref3 : _n > _ref3; i = 0 <= _ref3 ? ++_n : --_n) {
          samples[i + delaySamples] += Math.floor(samples[i] * object.reverb.decay);
        }
        sound.samples = samples;
      }
    }
    this.log.verbose("Rendered " + cacheName + ".");
    this.soundCache[cacheName] = sound;
    return sound;
  };

  return Renderer;

})();

renderWaveformImage = function(samples, width, height, backgroundColor, waveformColor) {
  var a, i, j, lineHeight, lineOffset, peak, row, rows, sample, sampleAvg, sampleIndex, sampleMax, sampleOffset, sampleSum, samplesPerCol, _i, _j, _k, _l, _len, _m, _n, _o, _ref;
  if (backgroundColor == null) {
    backgroundColor = [255, 255, 255];
  }
  if (waveformColor == null) {
    waveformColor = [255, 0, 0];
  }
  rows = [];
  for (j = _i = 0; 0 <= height ? _i < height : _i > height; j = 0 <= height ? ++_i : --_i) {
    row = [];
    for (i = _j = 0; 0 <= width ? _j < width : _j > width; i = 0 <= width ? ++_j : --_j) {
      row.push(backgroundColor);
    }
    rows.push(row);
  }
  samplesPerCol = Math.floor(samples.length / width);
  peak = 0;
  for (_k = 0, _len = samples.length; _k < _len; _k++) {
    sample = samples[_k];
    a = Math.abs(sample);
    if (peak < a) {
      peak = a;
    }
  }
  peak = Math.floor(peak * 1.1);
  if (peak === 0) {
    row = rows[Math.floor(height / 2)];
    for (i = _l = 0; 0 <= width ? _l < width : _l > width; i = 0 <= width ? ++_l : --_l) {
      row[i] = waveformColor;
    }
  } else {
    for (i = _m = 0; 0 <= width ? _m < width : _m > width; i = 0 <= width ? ++_m : --_m) {
      sampleOffset = Math.floor((i / width) * samples.length);
      sampleSum = 0;
      sampleMax = 0;
      for (sampleIndex = _n = sampleOffset, _ref = sampleOffset + samplesPerCol; sampleOffset <= _ref ? _n < _ref : _n > _ref; sampleIndex = sampleOffset <= _ref ? ++_n : --_n) {
        a = Math.abs(samples[sampleIndex]);
        sampleSum += a;
        if (sampleMax < a) {
          sampleMax = a;
        }
      }
      sampleAvg = Math.floor(sampleSum / samplesPerCol);
      lineHeight = Math.floor(sampleMax / peak * height);
      lineOffset = (height - lineHeight) >> 1;
      if (lineHeight === 0) {
        lineHeight = 1;
      }
      for (j = _o = 0; 0 <= lineHeight ? _o < lineHeight : _o > lineHeight; j = 0 <= lineHeight ? ++_o : --_o) {
        row = rows[j + lineOffset];
        row[i] = waveformColor;
      }
    }
  }
  return generateBitmapDataURL(rows);
};

renderLoopScript = function(args) {
  var logObj, outputSound, parser, renderer, ret, sampleRate, which;
  logObj = args.log;
  logObj.verbose("Parsing...");
  parser = new Parser(logObj);
  parser.parse(args.script);
  which = args.which;
  if (which == null) {
    which = parser.lastObject;
  }
  if (which) {
    sampleRate = 44100;
    logObj.verbose("Rendering...");
    renderer = new Renderer(logObj, sampleRate, args.readLocalFiles, parser.objects);
    outputSound = renderer.render(which, {});
    ret = {};
    if (args.wavFilename) {
      riffwave.writeWAV(args.wavFilename, sampleRate, outputSound.samples);
    } else {
      ret.wavUrl = riffwave.makeBlobUrl(sampleRate, outputSound.samples);
    }
    if ((args.imageWidth != null) && (args.imageHeight != null) && (args.imageWidth > 0) && (args.imageHeight > 0)) {
      ret.imageUrl = renderWaveformImage(outputSound.samples, args.imageWidth, args.imageHeight, args.imageBackgroundColor, args.imageWaveformColor);
    }
    return ret;
  }
  return null;
};

module.exports = {
  render: renderLoopScript
};



},{"../js/jdataview":1,"./freq":"SwjZMG","./riffwave":"XjRWhK","fs":2}],"XjRWhK":[function(require,module,exports){
(function (Buffer){
var FastBase64, RIFFWAVE, b64toBlob, fs, makeBlobUrl, makeDataURI, writeWAV;

fs = require("fs");

FastBase64 = (function() {
  function FastBase64() {
    var i, _i;
    this.chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    this.encLookup = [];
    for (i = _i = 0; _i < 4096; i = ++_i) {
      this.encLookup[i] = this.chars[i >> 6] + this.chars[i & 0x3F];
    }
  }

  FastBase64.prototype.encode = function(src) {
    var dst, i, len, n, n1, n2, n3;
    len = src.length;
    dst = '';
    i = 0;
    while (len > 2) {
      n = (src[i] << 16) | (src[i + 1] << 8) | src[i + 2];
      dst += this.encLookup[n >> 12] + this.encLookup[n & 0xFFF];
      len -= 3;
      i += 3;
    }
    if (len > 0) {
      n1 = (src[i] & 0xFC) >> 2;
      n2 = (src[i] & 0x03) << 4;
      if (len > 1) {
        n2 |= (src[++i] & 0xF0) >> 4;
      }
      dst += this.chars[n1];
      dst += this.chars[n2];
      if (len === 2) {
        n3 = (src[i++] & 0x0F) << 2;
        n3 |= (src[i] & 0xC0) >> 6;
        dst += this.chars[n3];
      }
      if (len === 1) {
        dst += '=';
      }
      dst += '=';
    }
    return dst;
  };

  return FastBase64;

})();

RIFFWAVE = (function() {
  function RIFFWAVE(sampleRate, data) {
    this.sampleRate = sampleRate;
    this.data = data;
    this.wav = [];
    this.header = {
      chunkId: [0x52, 0x49, 0x46, 0x46],
      chunkSize: 0,
      format: [0x57, 0x41, 0x56, 0x45],
      subChunk1Id: [0x66, 0x6d, 0x74, 0x20],
      subChunk1Size: 16,
      audioFormat: 1,
      numChannels: 1,
      sampleRate: this.sampleRate,
      byteRate: 0,
      blockAlign: 0,
      bitsPerSample: 16,
      subChunk2Id: [0x64, 0x61, 0x74, 0x61],
      subChunk2Size: 0
    };
    this.generate();
  }

  RIFFWAVE.prototype.u32ToArray = function(i) {
    return [i & 0xFF, (i >> 8) & 0xFF, (i >> 16) & 0xFF, (i >> 24) & 0xFF];
  };

  RIFFWAVE.prototype.u16ToArray = function(i) {
    return [i & 0xFF, (i >> 8) & 0xFF];
  };

  RIFFWAVE.prototype.split16bitArray = function(data) {
    var i, j, len, r, _i;
    r = [];
    j = 0;
    len = data.length;
    for (i = _i = 0; 0 <= len ? _i < len : _i > len; i = 0 <= len ? ++_i : --_i) {
      r[j++] = data[i] & 0xFF;
      r[j++] = (data[i] >> 8) & 0xFF;
    }
    return r;
  };

  RIFFWAVE.prototype.generate = function() {
    var fb;
    this.header.blockAlign = (this.header.numChannels * this.header.bitsPerSample) >> 3;
    this.header.byteRate = this.header.blockAlign * this.sampleRate;
    this.header.subChunk2Size = this.data.length * (this.header.bitsPerSample >> 3);
    this.header.chunkSize = 36 + this.header.subChunk2Size;
    if (this.header.bitsPerSample === 16) {
      this.data = this.split16bitArray(this.data);
    }
    this.wav = this.header.chunkId.concat(this.u32ToArray(this.header.chunkSize), this.header.format, this.header.subChunk1Id, this.u32ToArray(this.header.subChunk1Size), this.u16ToArray(this.header.audioFormat), this.u16ToArray(this.header.numChannels), this.u32ToArray(this.header.sampleRate), this.u32ToArray(this.header.byteRate), this.u16ToArray(this.header.blockAlign), this.u16ToArray(this.header.bitsPerSample), this.header.subChunk2Id, this.u32ToArray(this.header.subChunk2Size), this.data);
    fb = new FastBase64;
    this.base64Data = fb.encode(this.wav);
    return this.dataURI = 'data:audio/wav;base64,' + this.base64Data;
  };

  RIFFWAVE.prototype.raw = function() {
    return new Buffer(this.base64Data, "base64");
  };

  return RIFFWAVE;

})();

writeWAV = function(filename, sampleRate, samples) {
  var wave;
  wave = new RIFFWAVE(sampleRate, samples);
  fs.writeFileSync(filename, wave.raw());
  return true;
};

makeDataURI = function(sampleRate, samples) {
  var wave;
  wave = new RIFFWAVE(sampleRate, samples);
  return wave.dataURI;
};

b64toBlob = function(b64Data, contentType, sliceSize) {
  var blob, byteArray, byteArrays, byteCharacters, byteNumbers, i, offset, slice, _i, _j, _ref, _ref1;
  contentType = contentType || '';
  sliceSize = sliceSize || 512;
  byteCharacters = atob(b64Data);
  byteArrays = [];
  for (offset = _i = 0, _ref = byteCharacters.length; sliceSize > 0 ? _i < _ref : _i > _ref; offset = _i += sliceSize) {
    slice = byteCharacters.slice(offset, offset + sliceSize);
    byteNumbers = new Array(slice.length);
    for (i = _j = 0, _ref1 = slice.length; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  blob = new Blob(byteArrays, {
    type: contentType
  });
  return blob;
};

makeBlobUrl = function(sampleRate, samples) {
  var blob, wave;
  wave = new RIFFWAVE(sampleRate, samples);
  blob = b64toBlob(wave.base64Data, "audio/wav");
  return URL.createObjectURL(blob);
};

module.exports = {
  RIFFWAVE: RIFFWAVE,
  writeWAV: writeWAV,
  makeDataURI: makeDataURI,
  makeBlobUrl: makeBlobUrl
};



}).call(this,require("buffer").Buffer)
},{"buffer":3,"fs":2}],"./riffwave":[function(require,module,exports){
module.exports=require('XjRWhK');
},{}]},{},[])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uXFxub2RlX21vZHVsZXNcXGJyb3dzZXJpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3Nlci1wYWNrXFxfcHJlbHVkZS5qcyIsImpkYXRhdmlldy5qcyIsIi4uXFxub2RlX21vZHVsZXNcXGJyb3dzZXJpZnlcXGxpYlxcX2VtcHR5LmpzIiwiLi5cXG5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxidWZmZXJcXGluZGV4LmpzIiwiLi5cXG5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxidWZmZXJcXG5vZGVfbW9kdWxlc1xcYmFzZTY0LWpzXFxsaWJcXGI2NC5qcyIsIi4uXFxub2RlX21vZHVsZXNcXGJyb3dzZXJpZnlcXG5vZGVfbW9kdWxlc1xcYnVmZmVyXFxub2RlX21vZHVsZXNcXGllZWU3NTRcXGluZGV4LmpzIiwiLi5cXG5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxidWZmZXJcXG5vZGVfbW9kdWxlc1xcaXMtYXJyYXlcXGluZGV4LmpzIiwiLi5cXHNyY1xcYmVhdG1ha2VyLmNvZmZlZSIsIi4uXFxzcmNcXGV4YW1wbGVzLmNvZmZlZSIsIi4uXFxzcmNcXGZyZXEuY29mZmVlIiwiLi5cXHNyY1xcbG9vcHNjcmlwdC5jb2ZmZWUiLCIuLlxcc3JjXFxyaWZmd2F2ZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNXZCQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BGQTtBQUNBO0FBQ0E7QUFDQTtB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LEVBdUJWO0FBQUEsSUFDRSxHQUFBLEVBQUssT0FEUDtBQUFBLElBRUUsR0FBQSxFQUFLLE9BRlA7QUFBQSxJQUdFLEdBQUEsRUFBSyxPQUhQO0FBQUEsSUFJRSxHQUFBLEVBQUssT0FKUDtBQUFBLElBS0UsR0FBQSxFQUFLLE9BTFA7QUFBQSxJQU1FLEdBQUEsRUFBSyxPQU5QO0FBQUEsSUFPRSxHQUFBLEVBQUssT0FQUDtBQUFBLElBUUUsR0FBQSxFQUFLLE9BUlA7QUFBQSxJQVNFLEdBQUEsRUFBSyxPQVRQO0FBQUEsSUFVRSxHQUFBLEVBQUssT0FWUDtBQUFBLElBV0UsR0FBQSxFQUFLLE9BWFA7QUFBQSxJQVlFLEdBQUEsRUFBSyxPQVpQO0dBdkJVLEVBc0NWO0FBQUEsSUFDRSxHQUFBLEVBQUssT0FEUDtBQUFBLElBRUUsR0FBQSxFQUFLLE9BRlA7QUFBQSxJQUdFLEdBQUEsRUFBSyxPQUhQO0FBQUEsSUFJRSxHQUFBLEVBQUssT0FKUDtBQUFBLElBS0UsR0FBQSxFQUFLLE9BTFA7QUFBQSxJQU1FLEdBQUEsRUFBSyxPQU5QO0FBQUEsSUFPRSxHQUFBLEVBQUssT0FQUDtBQUFBLElBUUUsR0FBQSxFQUFLLE9BUlA7QUFBQSxJQVNFLEdBQUEsRUFBSyxPQVRQO0FBQUEsSUFVRSxHQUFBLEVBQUssT0FWUDtBQUFBLElBV0UsR0FBQSxFQUFLLE9BWFA7QUFBQSxJQVlFLEdBQUEsRUFBSyxPQVpQO0dBdENVLEVBcURWO0FBQUEsSUFDRSxHQUFBLEVBQUssT0FEUDtBQUFBLElBRUUsR0FBQSxFQUFLLE9BRlA7QUFBQSxJQUdFLEdBQUEsRUFBSyxPQUhQO0FBQUEsSUFJRSxHQUFBLEVBQUssT0FKUDtBQUFBLElBS0UsR0FBQSxFQUFLLE9BTFA7QUFBQSxJQU1FLEdBQUEsRUFBSyxPQU5QO0FBQUEsSUFPRSxHQUFBLEVBQUssT0FQUDtBQUFBLElBUUUsR0FBQSxFQUFLLE9BUlA7QUFBQSxJQVNFLEdBQUEsRUFBSyxPQVRQO0FBQUEsSUFVRSxHQUFBLEVBQUssT0FWUDtBQUFBLElBV0UsR0FBQSxFQUFLLE9BWFA7QUFBQSxJQVlFLEdBQUEsRUFBSyxPQVpQO0dBckRVLEVBb0VWO0FBQUEsSUFDRSxHQUFBLEVBQUssT0FEUDtBQUFBLElBRUUsR0FBQSxFQUFLLE9BRlA7QUFBQSxJQUdFLEdBQUEsRUFBSyxPQUhQO0FBQUEsSUFJRSxHQUFBLEVBQUssT0FKUDtBQUFBLElBS0UsR0FBQSxFQUFLLE9BTFA7QUFBQSxJQU1FLEdBQUEsRUFBSyxPQU5QO0FBQUEsSUFPRSxHQUFBLEVBQUssT0FQUDtBQUFBLElBUUUsR0FBQSxFQUFLLE9BUlA7QUFBQSxJQVNFLEdBQUEsRUFBSyxPQVRQO0FBQUEsSUFVRSxHQUFBLEVBQUssT0FWUDtBQUFBLElBV0UsR0FBQSxFQUFLLE9BWFA7QUFBQSxJQVlFLEdBQUEsRUFBSyxPQVpQO0dBcEVVLEVBbUZWO0FBQUEsSUFDRSxHQUFBLEVBQUssT0FEUDtBQUFBLElBRUUsR0FBQSxFQUFLLE9BRlA7QUFBQSxJQUdFLEdBQUEsRUFBSyxPQUhQO0FBQUEsSUFJRSxHQUFBLEVBQUssT0FKUDtBQUFBLElBS0UsR0FBQSxFQUFLLE9BTFA7QUFBQSxJQU1FLEdBQUEsRUFBSyxPQU5QO0FBQUEsSUFPRSxHQUFBLEVBQUssT0FQUDtBQUFBLElBUUUsR0FBQSxFQUFLLE9BUlA7QUFBQSxJQVNFLEdBQUEsRUFBSyxPQVRQO0FBQUEsSUFVRSxHQUFBLEVBQUssT0FWUDtBQUFBLElBV0UsR0FBQSxFQUFLLE9BWFA7QUFBQSxJQVlFLEdBQUEsRUFBSyxPQVpQO0dBbkZVLEVBa0dWO0FBQUEsSUFDRSxHQUFBLEVBQUssT0FEUDtBQUFBLElBRUUsR0FBQSxFQUFLLE9BRlA7QUFBQSxJQUdFLEdBQUEsRUFBSyxPQUhQO0FBQUEsSUFJRSxHQUFBLEVBQUssT0FKUDtBQUFBLElBS0UsR0FBQSxFQUFLLE9BTFA7QUFBQSxJQU1FLEdBQUEsRUFBSyxPQU5QO0FBQUEsSUFPRSxHQUFBLEVBQUssT0FQUDtBQUFBLElBUUUsR0FBQSxFQUFLLE9BUlA7QUFBQSxJQVNFLEdBQUEsRUFBSyxPQVRQO0FBQUEsSUFVRSxHQUFBLEVBQUssT0FWUDtBQUFBLElBV0UsR0FBQSxFQUFLLE9BWFA7QUFBQSxJQVlFLEdBQUEsRUFBSyxPQVpQO0dBbEdVLEVBaUhWO0FBQUEsSUFDRSxHQUFBLEVBQUssT0FEUDtHQWpIVTtDQUFaLENBQUE7O0FBQUEsY0FzSEEsR0FBaUIsT0F0SGpCLENBQUE7O0FBQUEsUUF3SEEsR0FBVyxTQUFDLE1BQUQsRUFBUyxJQUFULEdBQUE7QUFDVCxNQUFBLFdBQUE7QUFBQSxFQUFBLElBQUEsR0FBTyxJQUFJLENBQUMsV0FBTCxDQUFBLENBQVAsQ0FBQTtBQUNBLEVBQUEsSUFBRyxDQUFDLE1BQUEsSUFBVSxDQUFYLENBQUEsSUFBa0IsQ0FBQyxNQUFBLEdBQVMsU0FBUyxDQUFDLE1BQXBCLENBQWxCLElBQWtELGNBQWMsQ0FBQyxJQUFmLENBQW9CLElBQXBCLENBQXJEO0FBQ0UsSUFBQSxXQUFBLEdBQWMsU0FBVSxDQUFBLE1BQUEsQ0FBeEIsQ0FBQTtBQUNBLElBQUEsSUFBRyxxQkFBQSxJQUFpQiwyQkFBcEI7QUFDRSxhQUFPLFdBQVksQ0FBQSxJQUFBLENBQW5CLENBREY7S0FGRjtHQURBO0FBS0EsU0FBTyxLQUFQLENBTlM7QUFBQSxDQXhIWCxDQUFBOztBQUFBLE1BZ0lNLENBQUMsT0FBUCxHQUNFO0FBQUEsRUFBQSxTQUFBLEVBQVcsU0FBWDtBQUFBLEVBQ0EsUUFBQSxFQUFVLFFBRFY7Q0FqSUYsQ0FBQTs7Ozs7OztBQ0dBLElBQUEseU1BQUE7RUFBQSxrQkFBQTs7QUFBQSxXQUFhLE9BQUEsQ0FBUSxRQUFSLEVBQVosUUFBRCxDQUFBOztBQUFBLFFBQ0EsR0FBYSxPQUFBLENBQVEsWUFBUixDQURiLENBQUE7O0FBQUEsU0FFQSxHQUFhLE9BQUEsQ0FBUSxpQkFBUixDQUZiLENBQUE7O0FBQUEsRUFHQSxHQUFhLE9BQUEsQ0FBUSxJQUFSLENBSGIsQ0FBQTs7QUFBQSxRQVFBLEdBQVcsU0FBQSxHQUFBO0FBQVcsTUFBQSxJQUFBO0FBQUEsRUFBViw4REFBVSxDQUFYO0FBQUEsQ0FSWCxDQUFBOztBQUFBLEtBV0EsR0FBUSxTQUFDLEdBQUQsR0FBQTtBQUNOLE1BQUEsdUJBQUE7QUFBQSxFQUFBLElBQU8sYUFBSixJQUFZLE1BQUEsQ0FBQSxHQUFBLEtBQWdCLFFBQS9CO0FBQ0UsV0FBTyxHQUFQLENBREY7R0FBQTtBQUdBLEVBQUEsSUFBRyxHQUFBLFlBQWUsSUFBbEI7QUFDRSxXQUFXLElBQUEsSUFBQSxDQUFLLEdBQUcsQ0FBQyxPQUFKLENBQUEsQ0FBTCxDQUFYLENBREY7R0FIQTtBQU1BLEVBQUEsSUFBRyxHQUFBLFlBQWUsTUFBbEI7QUFDRSxJQUFBLEtBQUEsR0FBUSxFQUFSLENBQUE7QUFDQSxJQUFBLElBQWdCLGtCQUFoQjtBQUFBLE1BQUEsS0FBQSxJQUFTLEdBQVQsQ0FBQTtLQURBO0FBRUEsSUFBQSxJQUFnQixzQkFBaEI7QUFBQSxNQUFBLEtBQUEsSUFBUyxHQUFULENBQUE7S0FGQTtBQUdBLElBQUEsSUFBZ0IscUJBQWhCO0FBQUEsTUFBQSxLQUFBLElBQVMsR0FBVCxDQUFBO0tBSEE7QUFJQSxJQUFBLElBQWdCLGtCQUFoQjtBQUFBLE1BQUEsS0FBQSxJQUFTLEdBQVQsQ0FBQTtLQUpBO0FBS0EsV0FBVyxJQUFBLE1BQUEsQ0FBTyxHQUFHLENBQUMsTUFBWCxFQUFtQixLQUFuQixDQUFYLENBTkY7R0FOQTtBQUFBLEVBY0EsV0FBQSxHQUFrQixJQUFBLEdBQUcsQ0FBQyxXQUFKLENBQUEsQ0FkbEIsQ0FBQTtBQWdCQSxPQUFBLFVBQUEsR0FBQTtBQUNFLElBQUEsV0FBWSxDQUFBLEdBQUEsQ0FBWixHQUFtQixLQUFBLENBQU0sR0FBSSxDQUFBLEdBQUEsQ0FBVixDQUFuQixDQURGO0FBQUEsR0FoQkE7QUFtQkEsU0FBTyxXQUFQLENBcEJNO0FBQUEsQ0FYUixDQUFBOztBQUFBLFNBaUNBLEdBQVksU0FBQyxDQUFELEdBQUE7QUFDVixVQUFPLE1BQUEsQ0FBTyxDQUFQLENBQVA7QUFBQSxTQUNPLE1BRFA7YUFDbUIsS0FEbkI7QUFBQSxTQUVPLEtBRlA7YUFFa0IsS0FGbEI7QUFBQSxTQUdPLElBSFA7YUFHaUIsS0FIakI7QUFBQSxTQUlPLEdBSlA7YUFJZ0IsS0FKaEI7QUFBQTthQUtPLE1BTFA7QUFBQSxHQURVO0FBQUEsQ0FqQ1osQ0FBQTs7QUFBQSxXQXlDQSxHQUFjLFNBQUMsSUFBRCxHQUFBO0FBQ1osTUFBQSxtQkFBQTtBQUFBLEVBQUEsTUFBQSxHQUFTLENBQVQsQ0FBQTtBQUNBLE9BQVMsOEZBQVQsR0FBQTtBQUNFLElBQUEsSUFBRyxJQUFLLENBQUEsQ0FBQSxDQUFMLEtBQVcsSUFBZDtBQUNFLE1BQUEsTUFBQSxJQUFVLENBQVYsQ0FERjtLQUFBLE1BQUE7QUFHRSxNQUFBLE1BQUEsRUFBQSxDQUhGO0tBREY7QUFBQSxHQURBO0FBTUEsU0FBTyxNQUFQLENBUFk7QUFBQSxDQXpDZCxDQUFBOztBQUFBLGtCQXFEQSxHQUFxQixTQUFDLEtBQUQsRUFBUSxLQUFSLEdBQUE7QUFTbkIsTUFBQSxNQUFBO0FBQUEsRUFBQSxNQUFBLEdBQVMsRUFBVCxDQUFBO0FBRUEsU0FBTSxLQUFBLEdBQVEsQ0FBZCxHQUFBO0FBQ0UsSUFBQSxNQUFNLENBQUMsSUFBUCxDQUFZLE1BQU0sQ0FBQyxZQUFQLENBQW9CLEtBQUEsR0FBUSxHQUE1QixDQUFaLENBQUEsQ0FBQTtBQUFBLElBQ0EsS0FBQSxLQUFVLENBRFYsQ0FBQTtBQUFBLElBRUEsS0FBQSxFQUZBLENBREY7RUFBQSxDQUZBO0FBT0EsU0FBTyxNQUFNLENBQUMsSUFBUCxDQUFZLEVBQVosQ0FBUCxDQWhCbUI7QUFBQSxDQXJEckIsQ0FBQTs7QUFBQSxhQXVFQSxHQUFnQixTQUFDLElBQUQsRUFBTyxXQUFQLEdBQUE7QUFFZCxNQUFBLDBEQUFBO0FBQUEsRUFBQSxRQUFBLEdBQVcsSUFBSSxDQUFDLE1BQWhCLENBQUE7QUFBQSxFQUNBLFVBQUEsR0FBZ0IsUUFBSCxHQUFpQixJQUFLLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBekIsR0FBcUMsQ0FEbEQsQ0FBQTtBQUFBLEVBRUEsT0FBQSxHQUFVLEVBRlYsQ0FBQTtBQUFBLEVBR0EsTUFBQSxHQUFTLEVBSFQsQ0FBQTtBQUtBLFNBQU0sV0FBQSxHQUFjLENBQXBCLEdBQUE7QUFDRSxJQUFBLE9BQUEsSUFBVyxNQUFYLENBQUE7QUFBQSxJQUNBLFdBQUEsRUFEQSxDQURGO0VBQUEsQ0FMQTtBQVNBLE9BQVMsMEZBQVQsR0FBQTtBQUNFLFNBQVMsa0dBQVQsR0FBQTtBQUNFLE1BQUEsS0FBQSxHQUFRLElBQUssQ0FBQSxDQUFBLENBQUcsQ0FBQSxDQUFBLENBQWhCLENBQUE7QUFBQSxNQUNBLE1BQU0sQ0FBQyxJQUFQLENBQVksTUFBTSxDQUFDLFlBQVAsQ0FBb0IsS0FBTSxDQUFBLENBQUEsQ0FBMUIsQ0FBQSxHQUNBLE1BQU0sQ0FBQyxZQUFQLENBQW9CLEtBQU0sQ0FBQSxDQUFBLENBQTFCLENBREEsR0FFQSxNQUFNLENBQUMsWUFBUCxDQUFvQixLQUFNLENBQUEsQ0FBQSxDQUExQixDQUZaLENBREEsQ0FERjtBQUFBLEtBQUE7QUFBQSxJQU1BLE1BQU0sQ0FBQyxJQUFQLENBQVksT0FBWixDQU5BLENBREY7QUFBQSxHQVRBO0FBa0JBLFNBQU8sTUFBTSxDQUFDLElBQVAsQ0FBWSxFQUFaLENBQVAsQ0FwQmM7QUFBQSxDQXZFaEIsQ0FBQTs7QUFBQSxVQTZGQSxHQUFhLFNBQUMsSUFBRCxFQUFPLEtBQVAsR0FBQTtBQUVYLE1BQUEsbUVBQUE7QUFBQSxFQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsTUFBZCxDQUFBO0FBQUEsRUFDQSxRQUFBLEdBQVcsUUFBQSxDQUFTLE1BQUEsR0FBUyxLQUFsQixDQURYLENBQUE7QUFBQSxFQUVBLE1BQUEsR0FBWSxNQUFILEdBQWUsSUFBSyxDQUFBLENBQUEsQ0FBRSxDQUFDLE1BQXZCLEdBQW1DLENBRjVDLENBQUE7QUFBQSxFQUdBLFFBQUEsR0FBVyxRQUFBLENBQVMsTUFBQSxHQUFTLEtBQWxCLENBSFgsQ0FBQTtBQUFBLEVBSUEsUUFBQSxHQUFXLEVBSlgsQ0FBQTtBQU1BLE9BQVMsMEZBQVQsR0FBQTtBQUNFLElBQUEsUUFBUSxDQUFDLElBQVQsQ0FBYyxPQUFBLEdBQVUsRUFBeEIsQ0FBQSxDQUFBO0FBQ0EsU0FBUywwRkFBVCxHQUFBO0FBQ0UsTUFBQSxPQUFPLENBQUMsSUFBUixDQUFhLElBQUssQ0FBQSxRQUFBLENBQVMsQ0FBQSxHQUFFLEtBQVgsQ0FBQSxDQUFtQixDQUFBLFFBQUEsQ0FBUyxDQUFBLEdBQUUsS0FBWCxDQUFBLENBQXJDLENBQUEsQ0FERjtBQUFBLEtBRkY7QUFBQSxHQU5BO0FBV0EsU0FBTyxRQUFQLENBYlc7QUFBQSxDQTdGYixDQUFBOztBQUFBLHFCQTRHQSxHQUF3QixTQUFDLElBQUQsRUFBTyxLQUFQLEdBQUE7QUFLdEIsTUFBQSxnRUFBQTtBQUFBLEVBQUEsSUFBRyxDQUFBLElBQUg7QUFDRSxXQUFPLEtBQVAsQ0FERjtHQUFBO0FBQUEsRUFHQSxLQUFBLEdBQVEsS0FBQSxJQUFTLENBSGpCLENBQUE7QUFJQSxFQUFBLElBQUksS0FBQSxLQUFTLENBQWI7QUFDRSxJQUFBLElBQUEsR0FBTyxVQUFBLENBQVcsSUFBWCxFQUFpQixLQUFqQixDQUFQLENBREY7R0FKQTtBQUFBLEVBT0EsTUFBQSxHQUFTLElBQUksQ0FBQyxNQVBkLENBQUE7QUFBQSxFQVFBLEtBQUEsR0FBVyxNQUFILEdBQWUsSUFBSyxDQUFBLENBQUEsQ0FBRSxDQUFDLE1BQXZCLEdBQW1DLENBUjNDLENBQUE7QUFBQSxFQVNBLFdBQUEsR0FBYyxDQUFDLENBQUEsR0FBSSxDQUFDLEtBQUEsR0FBUSxDQUFULENBQUEsR0FBYyxDQUFuQixDQUFBLEdBQXdCLENBVHRDLENBQUE7QUFBQSxFQVVBLGNBQUEsR0FBaUIsQ0FBQyxLQUFBLEdBQVEsQ0FBUixHQUFZLFdBQWIsQ0FBQSxHQUE0QixNQVY3QyxDQUFBO0FBQUEsRUFXQSxjQUFBLEdBQWlCLEVBQUEsR0FBSyxjQVh0QixDQUFBO0FBQUEsRUFhQSxNQUFBLEdBQVMsa0JBQUEsQ0FBbUIsTUFBbkIsRUFBMkIsQ0FBM0IsQ0FiVCxDQUFBO0FBQUEsRUFjQSxLQUFBLEdBQVEsa0JBQUEsQ0FBbUIsS0FBbkIsRUFBMEIsQ0FBMUIsQ0FkUixDQUFBO0FBQUEsRUFlQSxjQUFBLEdBQWlCLGtCQUFBLENBQW1CLGNBQW5CLEVBQW1DLENBQW5DLENBZmpCLENBQUE7QUFBQSxFQWdCQSxjQUFBLEdBQWlCLGtCQUFBLENBQW1CLGNBQW5CLEVBQW1DLENBQW5DLENBaEJqQixDQUFBO0FBQUEsRUFvQkEsSUFBQSxHQUFPLElBQUEsR0FDQyxjQURELEdBRUMsVUFGRCxHQUdDLFVBSEQsR0FJQyxrQkFKRCxHQUtDLGtCQUxELEdBTUMsS0FORCxHQU9DLE1BUEQsR0FRQyxVQVJELEdBU0MsVUFURCxHQVVDLGtCQVZELEdBV0MsY0FYRCxHQVlDLGtCQVpELEdBYUMsa0JBYkQsR0FjQyxrQkFkRCxHQWVDLGtCQWZELEdBZ0JDLGFBQUEsQ0FBYyxJQUFkLEVBQW9CLFdBQXBCLENBcENSLENBQUE7QUFzQ0EsU0FBTyx3QkFBQSxHQUEyQixJQUFBLENBQUssSUFBTCxDQUFsQyxDQTNDc0I7QUFBQSxDQTVHeEIsQ0FBQTs7QUFBQTtBQTZKZSxFQUFBLGdCQUFFLEdBQUYsR0FBQTtBQUNYLElBRFksSUFBQyxDQUFBLE1BQUEsR0FDYixDQUFBO0FBQUEsSUFBQSxJQUFDLENBQUEsWUFBRCxHQUFnQixxQkFBaEIsQ0FBQTtBQUFBLElBQ0EsSUFBQyxDQUFBLG1CQUFELEdBQXVCLE9BRHZCLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxXQUFELEdBQWUsZUFGZixDQUFBO0FBQUEsSUFHQSxJQUFDLENBQUEsc0JBQUQsR0FBMEIsSUFIMUIsQ0FBQTtBQUFBLElBSUEsSUFBQyxDQUFBLHNCQUFELEdBQTBCLE9BSjFCLENBQUE7QUFBQSxJQUtBLElBQUMsQ0FBQSxXQUFELEdBQWUsVUFMZixDQUFBO0FBQUEsSUFXQSxJQUFDLENBQUEsV0FBRCxHQUNFO0FBQUEsTUFBQSxTQUFBLEVBQ0U7QUFBQSxRQUFBLFNBQUEsRUFBVyxDQUFYO0FBQUEsUUFDQSxPQUFBLEVBQVMsR0FEVDtBQUFBLFFBRUEsTUFBQSxFQUFRLENBRlI7QUFBQSxRQUdBLElBQUEsRUFBTSxHQUhOO0FBQUEsUUFJQSxJQUFBLEVBQU0sTUFKTjtBQUFBLFFBS0EsR0FBQSxFQUFLLEdBTEw7QUFBQSxRQU1BLFFBQUEsRUFBVSxHQU5WO0FBQUEsUUFPQSxNQUFBLEVBQVEsR0FQUjtBQUFBLFFBUUEsSUFBQSxFQUFNLElBUk47QUFBQSxRQVNBLE1BQUEsRUFDRTtBQUFBLFVBQUEsS0FBQSxFQUFPLENBQVA7QUFBQSxVQUNBLEtBQUEsRUFBTyxDQURQO1NBVkY7QUFBQSxRQVlBLElBQUEsRUFDRTtBQUFBLFVBQUEsQ0FBQSxFQUFHLENBQUg7QUFBQSxVQUNBLENBQUEsRUFBRyxDQURIO0FBQUEsVUFFQSxDQUFBLEVBQUcsQ0FGSDtBQUFBLFVBR0EsQ0FBQSxFQUFHLENBSEg7U0FiRjtPQURGO0tBWkYsQ0FBQTtBQUFBLElBZ0NBLElBQUMsQ0FBQSxVQUFELEdBQ0U7QUFBQSxNQUFBLElBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxRQUNBLElBQUEsRUFBTSxPQUROO0FBQUEsUUFFQSxRQUFBLEVBQVUsT0FGVjtBQUFBLFFBR0EsSUFBQSxFQUFNLE1BSE47QUFBQSxRQUlBLE1BQUEsRUFBUSxLQUpSO0FBQUEsUUFLQSxJQUFBLEVBQU0sUUFMTjtBQUFBLFFBTUEsTUFBQSxFQUFRLE9BTlI7QUFBQSxRQU9BLElBQUEsRUFBTSxNQVBOO0FBQUEsUUFRQSxNQUFBLEVBQVEsUUFSUjtPQURGO0FBQUEsTUFXQSxNQUFBLEVBQ0U7QUFBQSxRQUFBLEdBQUEsRUFBSyxRQUFMO0FBQUEsUUFDQSxNQUFBLEVBQVEsT0FEUjtBQUFBLFFBRUEsSUFBQSxFQUFNLE1BRk47QUFBQSxRQUdBLE1BQUEsRUFBUSxRQUhSO0FBQUEsUUFJQSxTQUFBLEVBQVcsS0FKWDtBQUFBLFFBS0EsT0FBQSxFQUFTLFFBTFQ7QUFBQSxRQU1BLE1BQUEsRUFBUSxLQU5SO0FBQUEsUUFPQSxJQUFBLEVBQU0sUUFQTjtPQVpGO0FBQUEsTUFxQkEsSUFBQSxFQUNFO0FBQUEsUUFBQSxHQUFBLEVBQUssS0FBTDtPQXRCRjtBQUFBLE1Bd0JBLEtBQUEsRUFBTyxFQXhCUDtLQWpDRixDQUFBO0FBQUEsSUEyREEsSUFBQyxDQUFBLFVBQUQsR0FBYyxFQTNEZCxDQUFBO0FBQUEsSUE0REEsSUFBQyxDQUFBLEtBQUQsQ0FBTyxTQUFQLEVBQWtCLENBQWxCLENBNURBLENBQUE7QUFBQSxJQTZEQSxJQUFDLENBQUEsT0FBRCxHQUFXLEVBN0RYLENBQUE7QUFBQSxJQThEQSxJQUFDLENBQUEsTUFBRCxHQUFVLElBOURWLENBQUE7QUFBQSxJQStEQSxJQUFDLENBQUEsZ0JBQUQsR0FBb0IsS0EvRHBCLENBRFc7RUFBQSxDQUFiOztBQUFBLG1CQWtFQSxZQUFBLEdBQWMsU0FBQyxJQUFELEdBQUE7QUFDWixXQUFPLDZCQUFQLENBRFk7RUFBQSxDQWxFZCxDQUFBOztBQUFBLG1CQXFFQSxLQUFBLEdBQU8sU0FBQyxJQUFELEdBQUE7V0FDTCxJQUFDLENBQUEsR0FBRyxDQUFDLEtBQUwsQ0FBWSxvQkFBQSxHQUFvQixJQUFDLENBQUEsTUFBckIsR0FBNEIsSUFBNUIsR0FBZ0MsSUFBNUMsRUFESztFQUFBLENBckVQLENBQUE7O0FBQUEsbUJBd0VBLEtBQUEsR0FBTyxTQUFDLElBQUQsRUFBTyxNQUFQLEdBQUE7QUFDTCxRQUFBLFFBQUE7O01BQUEsT0FBUTtLQUFSOztNQUNBLFNBQVU7S0FEVjtBQUVBLElBQUEsSUFBRyxDQUFBLElBQUssQ0FBQSxXQUFZLENBQUEsSUFBQSxDQUFwQjtBQUNFLE1BQUEsSUFBQyxDQUFBLEtBQUQsQ0FBUSxzQkFBQSxHQUFzQixJQUE5QixDQUFBLENBQUE7QUFDQSxhQUFPLEtBQVAsQ0FGRjtLQUZBO0FBQUEsSUFLQSxRQUFBLEdBQVcsS0FBQSxDQUFNLElBQUMsQ0FBQSxXQUFZLENBQUEsSUFBQSxDQUFuQixDQUxYLENBQUE7QUFBQSxJQU1BLFFBQVEsQ0FBQyxPQUFULEdBQW1CLE1BTm5CLENBQUE7QUFBQSxJQU9BLElBQUMsQ0FBQSxVQUFVLENBQUMsSUFBWixDQUFpQixRQUFqQixDQVBBLENBQUE7QUFRQSxXQUFPLElBQVAsQ0FUSztFQUFBLENBeEVQLENBQUE7O0FBQUEsbUJBbUZBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxRQUFBLDBDQUFBO0FBQUEsSUFBQSxjQUFBLEdBQWlCLEVBQWpCLENBQUE7QUFDQTtBQUFBLFNBQUEsMkNBQUE7dUJBQUE7QUFDRSxXQUFBLFlBQUEsR0FBQTtBQUNFLFFBQUEsY0FBZSxDQUFBLEdBQUEsQ0FBZixHQUFzQixLQUFNLENBQUEsR0FBQSxDQUE1QixDQURGO0FBQUEsT0FERjtBQUFBLEtBREE7QUFJQSxXQUFPLGNBQVAsQ0FMTztFQUFBLENBbkZULENBQUE7O0FBQUEsbUJBMEZBLEtBQUEsR0FBTyxTQUFDLE1BQUQsR0FBQTs7TUFDTCxTQUFVO0tBQVY7V0FDQSxJQUFDLENBQUEsR0FBRyxDQUFDLE9BQUwsQ0FBYSxDQUFDLFNBQUEsR0FBUyxNQUFULEdBQWdCLEdBQWpCLENBQUEsR0FBc0IsSUFBSSxDQUFDLFNBQUwsQ0FBZSxJQUFDLENBQUEsT0FBRCxDQUFBLENBQWYsQ0FBbkMsRUFGSztFQUFBLENBMUZQLENBQUE7O0FBQUEsbUJBOEZBLFlBQUEsR0FBYyxTQUFBLEdBQUE7QUFDVixRQUFBLHlCQUFBO0FBQUEsSUFEVyx1QkFBUSw4REFDbkIsQ0FBQTtBQUFBLElBQUEsSUFBQyxDQUFBLE1BQUQsR0FBVTtBQUFBLE1BQUUsT0FBQSxFQUFTLE1BQVg7S0FBVixDQUFBO0FBQ0EsU0FBUyxzREFBVCxHQUFBO0FBQ0UsTUFBQSxJQUFDLENBQUEsTUFBTyxDQUFBLElBQUssQ0FBQSxDQUFBLENBQUwsQ0FBUixHQUFtQixJQUFLLENBQUEsQ0FBQSxHQUFFLENBQUYsQ0FBeEIsQ0FERjtBQUFBLEtBREE7QUFBQSxJQUdBLElBQUMsQ0FBQSxnQkFBRCxHQUFvQixJQUhwQixDQUFBO0FBS0EsSUFBQSxJQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBUixLQUFpQixNQUFwQjtBQUNFLE1BQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxTQUFSLEdBQW9CLEVBQXBCLENBREY7S0FMQTtBQVFBLElBQUEsSUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQVIsS0FBaUIsT0FBcEI7QUFDRSxNQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBUixHQUFvQixFQUFwQixDQURGO0tBUkE7QUFXQSxJQUFBLElBQUcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFYO0FBQ0UsTUFBQSxJQUFDLENBQUEsVUFBRCxHQUFjLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBdEIsQ0FBQTthQUNBLFFBQUEsQ0FBVSxlQUFBLEdBQWUsTUFBZixHQUFzQixLQUFoQyxFQUFzQyxJQUFDLENBQUEsVUFBdkMsRUFGRjtLQVpVO0VBQUEsQ0E5RmQsQ0FBQTs7QUFBQSxtQkE4R0EsWUFBQSxHQUFjLFNBQUEsR0FBQTtBQUNaLFFBQUEsMkJBQUE7QUFBQSxJQUFBLElBQUcsSUFBQyxDQUFBLE1BQUo7QUFDRSxNQUFBLEtBQUEsR0FBUSxJQUFDLENBQUEsT0FBRCxDQUFBLENBQVIsQ0FBQTtBQUNBLFdBQUEseUNBQUEsR0FBQTtBQUNFLFFBQUEsWUFBQSxHQUFlLElBQUMsQ0FBQSxVQUFXLENBQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFSLENBQWUsQ0FBQSxHQUFBLENBQTFDLENBQUE7QUFDQSxRQUFBLElBQUcsa0JBQUg7QUFDRSxVQUFBLENBQUEsR0FBSSxLQUFNLENBQUEsR0FBQSxDQUFWLENBQUE7QUFBQSxVQUNBLElBQUMsQ0FBQSxNQUFPLENBQUEsR0FBQSxDQUFSO0FBQWUsb0JBQU8sWUFBUDtBQUFBLG1CQUNSLEtBRFE7dUJBQ0csUUFBQSxDQUFTLENBQVQsRUFESDtBQUFBLG1CQUVSLE9BRlE7dUJBRUssVUFBQSxDQUFXLENBQVgsRUFGTDtBQUFBLG1CQUdSLE1BSFE7dUJBR0ksU0FBQSxDQUFVLENBQVYsRUFISjtBQUFBO3VCQUlSLEVBSlE7QUFBQTtjQURmLENBREY7U0FGRjtBQUFBLE9BREE7QUFBQSxNQVdBLFFBQUEsQ0FBUyxnQkFBVCxFQUEyQixJQUFDLENBQUEsTUFBNUIsQ0FYQSxDQUFBO0FBQUEsTUFZQSxJQUFDLENBQUEsT0FBUSxDQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBUixDQUFULEdBQTBCLElBQUMsQ0FBQSxNQVozQixDQURGO0tBQUE7V0FjQSxJQUFDLENBQUEsTUFBRCxHQUFVLEtBZkU7RUFBQSxDQTlHZCxDQUFBOztBQUFBLG1CQStIQSxrQkFBQSxHQUFvQixTQUFDLElBQUQsR0FBQTtBQUNsQixJQUFBLElBQWdCLENBQUEsSUFBSyxDQUFBLE1BQXJCO0FBQUEsYUFBTyxLQUFQLENBQUE7S0FBQTtBQUNBLElBQUEsSUFBZ0IsQ0FBQSxJQUFLLENBQUEsTUFBTSxDQUFDLEtBQVosS0FBcUIsSUFBckM7QUFBQSxhQUFPLEtBQVAsQ0FBQTtLQURBO0FBRUEsV0FBTyxJQUFQLENBSGtCO0VBQUEsQ0EvSHBCLENBQUE7O0FBQUEsbUJBb0lBLGlCQUFBLEdBQW1CLFNBQUMsTUFBRCxHQUFBO0FBQ2pCLFFBQUEsdUJBQUE7QUFBQSxJQUFBLElBQVUsTUFBQSxJQUFVLElBQXBCO0FBQUEsWUFBQSxDQUFBO0tBQUE7QUFBQSxJQUNBLENBQUEsR0FBSSxJQUFDLENBQUEsVUFBVSxDQUFDLE1BQVosR0FBcUIsQ0FEekIsQ0FBQTtBQUVBO1dBQU0sQ0FBQSxHQUFJLENBQVYsR0FBQTtBQUNFLE1BQUEsVUFBQSxHQUFhLElBQUMsQ0FBQSxVQUFXLENBQUEsQ0FBQSxHQUFJLENBQUosQ0FBTSxDQUFDLE9BQWhDLENBQUE7QUFDQSxNQUFBLElBQUcsQ0FBQyxJQUFDLENBQUEsVUFBVyxDQUFBLENBQUEsQ0FBRSxDQUFDLE9BQWYsR0FBeUIsSUFBMUIsQ0FBQSxJQUFvQyxDQUFDLFVBQUEsR0FBYSxNQUFkLENBQXZDO0FBQ0UsUUFBQSxRQUFBLENBQVUsMkNBQUEsR0FBMkMsQ0FBM0MsR0FBNkMsUUFBN0MsR0FBcUQsSUFBQyxDQUFBLFVBQVcsQ0FBQSxDQUFBLENBQUUsQ0FBQyxPQUFwRSxHQUE0RSxNQUE1RSxHQUFrRixNQUE1RixDQUFBLENBQUE7QUFBQSxRQUNBLElBQUMsQ0FBQSxVQUFXLENBQUEsQ0FBQSxDQUFFLENBQUMsT0FBZixHQUF5QixNQUR6QixDQURGO09BREE7QUFBQSxvQkFJQSxDQUFBLEdBSkEsQ0FERjtJQUFBLENBQUE7b0JBSGlCO0VBQUEsQ0FwSW5CLENBQUE7O0FBQUEsbUJBOElBLFNBQUEsR0FBVyxTQUFDLE1BQUQsR0FBQTs7TUFDVCxTQUFVO0tBQVY7QUFBQSxJQUNBLFFBQUEsQ0FBVSxZQUFBLEdBQVksTUFBWixHQUFtQixHQUE3QixDQURBLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxpQkFBRCxDQUFtQixNQUFuQixDQUZBLENBQUE7QUFBQSxJQUdBLElBQUMsQ0FBQSxVQUFVLENBQUMsSUFBWixDQUFpQjtBQUFBLE1BQUUsT0FBQSxFQUFTLE1BQVg7S0FBakIsQ0FIQSxDQUFBO0FBSUEsV0FBTyxJQUFQLENBTFM7RUFBQSxDQTlJWCxDQUFBOztBQUFBLG1CQXFKQSxRQUFBLEdBQVUsU0FBQyxNQUFELEdBQUE7QUFDUixRQUFBLFNBQUE7QUFBQSxJQUFBLFFBQUEsQ0FBVSxXQUFBLEdBQVcsTUFBWCxHQUFrQixHQUE1QixDQUFBLENBQUE7QUFDQSxJQUFBLElBQUcsbUJBQUg7QUFDRSxNQUFBLElBQUcsTUFBQSxJQUFVLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBckI7QUFDRSxRQUFBLElBQUMsQ0FBQSxZQUFELENBQUEsQ0FBQSxDQURGO09BREY7S0FEQTtBQUFBLElBS0EsSUFBQyxDQUFBLGlCQUFELENBQW1CLE1BQW5CLENBTEEsQ0FBQTtBQU9BLFdBQUEsSUFBQSxHQUFBO0FBQ0UsTUFBQSxTQUFBLEdBQVksSUFBQyxDQUFBLFlBQUQsQ0FBQSxDQUFaLENBQUE7QUFBQSxNQUNBLFFBQUEsQ0FBVSxXQUFBLEdBQVcsTUFBWCxHQUFrQixlQUFsQixHQUFpQyxTQUEzQyxDQURBLENBQUE7QUFFQSxNQUFBLElBQVMsTUFBQSxLQUFVLFNBQW5CO0FBQUEsY0FBQTtPQUZBO0FBR0EsTUFBQSxJQUFHLElBQUMsQ0FBQSxVQUFVLENBQUMsTUFBWixHQUFxQixDQUF4QjtBQUNFLGVBQU8sS0FBUCxDQURGO09BSEE7QUFBQSxNQUtBLFFBQUEsQ0FBVSxXQUFBLEdBQVcsTUFBWCxHQUFrQixtQkFBbEIsR0FBcUMsU0FBL0MsQ0FMQSxDQUFBO0FBQUEsTUFNQSxJQUFDLENBQUEsVUFBVSxDQUFDLEdBQVosQ0FBQSxDQU5BLENBREY7SUFBQSxDQVBBO0FBZUEsV0FBTyxJQUFQLENBaEJRO0VBQUEsQ0FySlYsQ0FBQTs7QUFBQSxtQkF1S0EsWUFBQSxHQUFjLFNBQUMsT0FBRCxHQUFBO0FBQ1osUUFBQSx5REFBQTtBQUFBLElBQUEsY0FBQSxHQUFpQixJQUFDLENBQUEsc0JBQXNCLENBQUMsSUFBeEIsQ0FBNkIsT0FBN0IsQ0FBakIsQ0FBQTtBQUFBLElBQ0EsQ0FBQSxHQUFJLENBREosQ0FBQTtBQUFBLElBRUEsTUFBQSxHQUFTLEVBRlQsQ0FBQTtBQUdBLFdBQU0sQ0FBQSxHQUFJLE9BQU8sQ0FBQyxNQUFsQixHQUFBO0FBQ0UsTUFBQSxDQUFBLEdBQUksT0FBUSxDQUFBLENBQUEsQ0FBWixDQUFBO0FBQ0EsTUFBQSxJQUFHLENBQUEsS0FBSyxHQUFSO0FBQ0UsUUFBQSxNQUFBLEdBQVMsQ0FBQyxDQUFDLFdBQUYsQ0FBQSxDQUFULENBQUE7QUFBQSxRQUNBLEtBQUEsR0FBUTtBQUFBLFVBQUUsTUFBQSxFQUFRLENBQVY7U0FEUixDQUFBO0FBRUEsUUFBQSxJQUFHLElBQUMsQ0FBQSxXQUFXLENBQUMsSUFBYixDQUFrQixDQUFsQixDQUFIO0FBQ0UsVUFBQSxLQUFLLENBQUMsSUFBTixHQUFhLE1BQWIsQ0FERjtTQUZBO0FBSUEsUUFBQSxJQUFHLGNBQUg7QUFDRSxVQUFBLE1BQUEsR0FBUyxDQUFULENBQUE7QUFDQSxpQkFBQSxJQUFBLEdBQUE7QUFDRSxZQUFBLElBQUEsR0FBTyxPQUFRLENBQUEsQ0FBQSxHQUFFLENBQUYsQ0FBZixDQUFBO0FBQ0EsWUFBQSxJQUFHLElBQUEsS0FBUSxNQUFYO0FBQ0UsY0FBQSxNQUFBLEVBQUEsQ0FBQTtBQUFBLGNBQ0EsQ0FBQSxFQURBLENBQUE7QUFFQSxjQUFBLElBQUcsQ0FBQSxLQUFLLE9BQU8sQ0FBQyxNQUFoQjtBQUNFLHNCQURGO2VBSEY7YUFBQSxNQUFBO0FBTUUsb0JBTkY7YUFGRjtVQUFBLENBREE7QUFBQSxVQVVBLEtBQUssQ0FBQyxNQUFOLEdBQWUsTUFWZixDQURGO1NBSkE7QUFBQSxRQWdCQSxNQUFNLENBQUMsSUFBUCxDQUFZLEtBQVosQ0FoQkEsQ0FERjtPQURBO0FBQUEsTUFtQkEsQ0FBQSxFQW5CQSxDQURGO0lBQUEsQ0FIQTtBQXdCQSxXQUFPO0FBQUEsTUFDTCxPQUFBLEVBQVMsT0FESjtBQUFBLE1BRUwsTUFBQSxFQUFRLE9BQU8sQ0FBQyxNQUZYO0FBQUEsTUFHTCxNQUFBLEVBQVEsTUFISDtLQUFQLENBekJZO0VBQUEsQ0F2S2QsQ0FBQTs7QUFBQSxtQkFzTUEsWUFBQSxHQUFjLFNBQUEsR0FBQTtBQUNaLFdBQU8sSUFBQyxDQUFBLFVBQVcsQ0FBQSxJQUFDLENBQUEsVUFBVSxDQUFDLE1BQVosR0FBcUIsQ0FBckIsQ0FBdUIsQ0FBQyxPQUEzQyxDQURZO0VBQUEsQ0F0TWQsQ0FBQTs7QUFBQSxtQkF5TUEsYUFBQSxHQUFlLFNBQUMsTUFBRCxFQUFTLE1BQVQsR0FBQTtBQUNiLFFBQUEsWUFBQTtBQUFBLElBQUEsR0FBQSxHQUFNLE1BQU8sQ0FBQSxDQUFBLENBQUUsQ0FBQyxXQUFWLENBQUEsQ0FBTixDQUFBO0FBQ0EsSUFBQSxJQUFHLEdBQUEsS0FBTyxPQUFWO0FBQ0UsTUFBQSxJQUFHLENBQUEsSUFBSyxDQUFBLEtBQUQsQ0FBTyxNQUFPLENBQUEsQ0FBQSxDQUFkLEVBQWtCLE1BQWxCLENBQVA7QUFDRSxlQUFPLEtBQVAsQ0FERjtPQURGO0tBQUEsTUFHSyxJQUFHLEdBQUEsS0FBTyxTQUFWO0FBQ0gsTUFBQSxJQUFDLENBQUEsZ0JBQUQsR0FBb0IsSUFBcEIsQ0FERztLQUFBLE1BRUEsSUFBRyxJQUFDLENBQUEsWUFBRCxDQUFjLEdBQWQsQ0FBSDtBQUNILE1BQUEsSUFBQyxDQUFBLFlBQUQsQ0FBYyxNQUFkLEVBQXNCLE9BQXRCLEVBQStCLEdBQS9CLEVBQW9DLE9BQXBDLEVBQTZDLE1BQU8sQ0FBQSxDQUFBLENBQXBELENBQUEsQ0FERztLQUFBLE1BRUEsSUFBRyxHQUFBLEtBQU8sU0FBVjtBQUNILE1BQUEsSUFBRyxDQUFBLENBQUssSUFBQyxDQUFBLGtCQUFELENBQW9CLE1BQXBCLENBQUEsSUFBK0IsSUFBQyxDQUFBLGtCQUFELENBQW9CLE9BQXBCLENBQWhDLENBQVA7QUFDRSxRQUFBLElBQUMsQ0FBQSxLQUFELENBQU8sNEJBQVAsQ0FBQSxDQUFBO0FBQ0EsZUFBTyxLQUFQLENBRkY7T0FBQTtBQUFBLE1BSUEsT0FBQSxHQUFVLElBQUMsQ0FBQSxZQUFELENBQWMsTUFBTyxDQUFBLENBQUEsQ0FBckIsQ0FKVixDQUFBO0FBQUEsTUFLQSxPQUFPLENBQUMsR0FBUixHQUFjLE1BQU8sQ0FBQSxDQUFBLENBTHJCLENBQUE7QUFBQSxNQU1BLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBUyxDQUFDLElBQWxCLENBQXVCLE9BQXZCLENBTkEsQ0FERztLQUFBLE1BUUEsSUFBRyxHQUFBLEtBQU8sTUFBVjtBQUNILE1BQUEsSUFBQyxDQUFBLFVBQVcsQ0FBQSxJQUFDLENBQUEsVUFBVSxDQUFDLE1BQVosR0FBcUIsQ0FBckIsQ0FBd0IsQ0FBQSxHQUFBLENBQXBDLEdBQ0U7QUFBQSxRQUFBLENBQUEsRUFBRyxVQUFBLENBQVcsTUFBTyxDQUFBLENBQUEsQ0FBbEIsQ0FBSDtBQUFBLFFBQ0EsQ0FBQSxFQUFHLFVBQUEsQ0FBVyxNQUFPLENBQUEsQ0FBQSxDQUFsQixDQURIO0FBQUEsUUFFQSxDQUFBLEVBQUcsVUFBQSxDQUFXLE1BQU8sQ0FBQSxDQUFBLENBQWxCLENBRkg7QUFBQSxRQUdBLENBQUEsRUFBRyxVQUFBLENBQVcsTUFBTyxDQUFBLENBQUEsQ0FBbEIsQ0FISDtPQURGLENBREc7S0FBQSxNQU1BLElBQUcsR0FBQSxLQUFPLFFBQVY7QUFDSCxNQUFBLElBQUMsQ0FBQSxVQUFXLENBQUEsSUFBQyxDQUFBLFVBQVUsQ0FBQyxNQUFaLEdBQXFCLENBQXJCLENBQXdCLENBQUEsR0FBQSxDQUFwQyxHQUNFO0FBQUEsUUFBQSxLQUFBLEVBQU8sUUFBQSxDQUFTLE1BQU8sQ0FBQSxDQUFBLENBQWhCLENBQVA7QUFBQSxRQUNBLEtBQUEsRUFBTyxVQUFBLENBQVcsTUFBTyxDQUFBLENBQUEsQ0FBbEIsQ0FEUDtPQURGLENBREc7S0FBQSxNQUFBO0FBTUgsTUFBQSxJQUFHLElBQUMsQ0FBQSxzQkFBc0IsQ0FBQyxJQUF4QixDQUE2QixHQUE3QixDQUFIO0FBQ0UsUUFBQSxJQUFDLENBQUEsS0FBRCxDQUFPLCtDQUFQLENBQUEsQ0FBQTtBQUNBLGVBQU8sS0FBUCxDQUZGO09BQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxVQUFXLENBQUEsSUFBQyxDQUFBLFVBQVUsQ0FBQyxNQUFaLEdBQXFCLENBQXJCLENBQXdCLENBQUEsR0FBQSxDQUFwQyxHQUEyQyxNQUFPLENBQUEsQ0FBQSxDQUhsRCxDQU5HO0tBdEJMO0FBaUNBLFdBQU8sSUFBUCxDQWxDYTtFQUFBLENBek1mLENBQUE7O0FBQUEsbUJBNk9BLEtBQUEsR0FBTyxTQUFDLElBQUQsR0FBQTtBQUNMLFFBQUEscUtBQUE7QUFBQSxJQUFBLEtBQUEsR0FBUSxJQUFJLENBQUMsS0FBTCxDQUFXLElBQVgsQ0FBUixDQUFBO0FBQUEsSUFDQSxJQUFDLENBQUEsTUFBRCxHQUFVLENBRFYsQ0FBQTtBQUVBLFNBQUEsNENBQUE7dUJBQUE7QUFDRSxNQUFBLElBQUMsQ0FBQSxNQUFELEVBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQSxHQUFPLElBQUksQ0FBQyxPQUFMLENBQWEsZ0JBQWIsRUFBOEIsRUFBOUIsQ0FEUCxDQUFBO0FBQUEsTUFFQSxJQUFBLEdBQU8sSUFBQyxDQUFBLFlBQVksQ0FBQyxJQUFkLENBQW1CLElBQW5CLENBQXlCLENBQUEsQ0FBQSxDQUZoQyxDQUFBO0FBR0EsTUFBQSxJQUFZLElBQUMsQ0FBQSxtQkFBbUIsQ0FBQyxJQUFyQixDQUEwQixJQUExQixDQUFaO0FBQUEsaUJBQUE7T0FIQTtBQUFBLE1BSUEsT0FBd0IsSUFBQyxDQUFBLFdBQVcsQ0FBQyxJQUFiLENBQWtCLElBQWxCLENBQXhCLEVBQUMsV0FBRCxFQUFJLG9CQUFKLEVBQWdCLGNBSmhCLENBQUE7QUFBQSxNQUtBLE1BQUEsR0FBUyxXQUFBLENBQVksVUFBWixDQUxULENBQUE7QUFBQSxNQU1BLFFBQUEsR0FBVyxFQU5YLENBQUE7QUFBQSxNQVFBLGFBQUEsR0FBZ0IsSUFBSSxDQUFDLEtBQUwsQ0FBVyxVQUFYLENBUmhCLENBQUE7QUFTQSxXQUFBLHNEQUFBO3lDQUFBO0FBQ0UsUUFBQSxZQUFBLEdBQWUsWUFBWSxDQUFDLEtBQWIsQ0FBbUIsU0FBbkIsQ0FBZixDQUFBO0FBQ0EsYUFBQSxxREFBQTt5Q0FBQTtBQUNFLFVBQUEsUUFBUSxDQUFDLElBQVQsQ0FBYztBQUFBLFlBQ1YsTUFBQSxFQUFRLE1BREU7QUFBQSxZQUVWLElBQUEsRUFBTSxXQUZJO1dBQWQsQ0FBQSxDQURGO0FBQUEsU0FEQTtBQUFBLFFBTUEsTUFBQSxJQUFVLElBTlYsQ0FERjtBQUFBLE9BVEE7QUFrQkEsV0FBQSxpREFBQTsyQkFBQTtBQUNFLFFBQUEsUUFBQSxDQUFTLG1CQUFBLEdBQXNCLElBQUksQ0FBQyxTQUFMLENBQWUsR0FBZixDQUEvQixDQUFBLENBQUE7QUFBQSxRQUNBLFNBQUEsR0FBWSxJQUFDLENBQUEsWUFBRCxDQUFBLENBRFosQ0FBQTtBQUVBLFFBQUEsSUFBRyxHQUFHLENBQUMsTUFBSixHQUFhLFNBQWhCO0FBQ0UsVUFBQSxJQUFDLENBQUEsU0FBRCxDQUFXLEdBQUcsQ0FBQyxNQUFmLENBQUEsQ0FERjtTQUFBLE1BQUE7QUFHRSxVQUFBLElBQUcsQ0FBQSxJQUFLLENBQUEsUUFBRCxDQUFVLEdBQUcsQ0FBQyxNQUFkLENBQVA7QUFDRSxZQUFBLElBQUMsQ0FBQSxHQUFHLENBQUMsS0FBTCxDQUFXLG9CQUFYLENBQUEsQ0FBQTtBQUNBLG1CQUFPLEtBQVAsQ0FGRjtXQUhGO1NBRkE7QUFBQSxRQVNBLFFBQUEsQ0FBUyxjQUFBLEdBQWlCLElBQUksQ0FBQyxTQUFMLENBQWUsR0FBZixDQUExQixDQVRBLENBQUE7QUFVQSxRQUFBLElBQUcsQ0FBQSxJQUFLLENBQUEsYUFBRCxDQUFlLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBVCxDQUFlLEtBQWYsQ0FBZixFQUFzQyxHQUFHLENBQUMsTUFBMUMsQ0FBUDtBQUNFLGlCQUFPLEtBQVAsQ0FERjtTQVhGO0FBQUEsT0FuQkY7QUFBQSxLQUZBO0FBQUEsSUFtQ0EsSUFBQyxDQUFBLFFBQUQsQ0FBVSxDQUFWLENBbkNBLENBQUE7QUFvQ0EsV0FBTyxJQUFQLENBckNLO0VBQUEsQ0E3T1AsQ0FBQTs7Z0JBQUE7O0lBN0pGLENBQUE7O0FBQUE7QUE4YmUsRUFBQSxrQkFBRSxHQUFGLEVBQVEsVUFBUixFQUFxQixjQUFyQixFQUFzQyxPQUF0QyxHQUFBO0FBQ1gsSUFEWSxJQUFDLENBQUEsTUFBQSxHQUNiLENBQUE7QUFBQSxJQURrQixJQUFDLENBQUEsYUFBQSxVQUNuQixDQUFBO0FBQUEsSUFEK0IsSUFBQyxDQUFBLGlCQUFBLGNBQ2hDLENBQUE7QUFBQSxJQURnRCxJQUFDLENBQUEsVUFBQSxPQUNqRCxDQUFBO0FBQUEsSUFBQSxJQUFDLENBQUEsVUFBRCxHQUFjLEVBQWQsQ0FEVztFQUFBLENBQWI7O0FBQUEscUJBR0EsS0FBQSxHQUFPLFNBQUMsSUFBRCxHQUFBO1dBQ0wsSUFBQyxDQUFBLEdBQUcsQ0FBQyxLQUFMLENBQVksZ0JBQUEsR0FBZ0IsSUFBNUIsRUFESztFQUFBLENBSFAsQ0FBQTs7QUFBQSxxQkFNQSxnQkFBQSxHQUFrQixTQUFDLElBQUQsRUFBTyxNQUFQLEdBQUE7QUFDaEIsUUFBQSxxSEFBQTtBQUFBLElBQUEsUUFBQSxHQUFXLEtBQUEsQ0FBTSxNQUFOLENBQVgsQ0FBQTtBQUFBLElBQ0EsSUFBQSxHQUFPLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBSSxDQUFDLENBQUwsR0FBUyxNQUFwQixDQURQLENBQUE7QUFBQSxJQUVBLElBQUEsR0FBTyxJQUFJLENBQUMsS0FBTCxDQUFXLElBQUksQ0FBQyxDQUFMLEdBQVMsTUFBcEIsQ0FGUCxDQUFBO0FBQUEsSUFHQSxJQUFBLEdBQU8sSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFJLENBQUMsQ0FBTCxHQUFTLE1BQXBCLENBSFAsQ0FBQTtBQUFBLElBSUEsU0FBQSxHQUFZLElBSlosQ0FBQTtBQUFBLElBS0EsUUFBQSxHQUFXLElBQUEsR0FBTyxJQUxsQixDQUFBO0FBQUEsSUFNQSxVQUFBLEdBQWEsSUFBQSxHQUFPLElBTnBCLENBQUE7QUFBQSxJQU9BLFVBQUEsR0FBYSxNQUFBLEdBQVMsSUFQdEIsQ0FBQTtBQUFBLElBUUEsT0FBQSxHQUFVLElBQUksQ0FBQyxDQVJmLENBQUE7QUFBQSxJQVNBLGdCQUFBLEdBQW1CLEdBQUEsR0FBTSxPQVR6QixDQUFBO0FBVUEsU0FBUyw4RkFBVCxHQUFBO0FBRUUsTUFBQSxRQUFTLENBQUEsQ0FBQSxDQUFULEdBQWMsQ0FBQSxHQUFJLFNBQWxCLENBRkY7QUFBQSxLQVZBO0FBYUEsU0FBUywwRkFBVCxHQUFBO0FBRUUsTUFBQSxRQUFTLENBQUEsSUFBQSxHQUFPLENBQVAsQ0FBVCxHQUFxQixHQUFBLEdBQU0sQ0FBQyxnQkFBQSxHQUFtQixDQUFDLENBQUEsR0FBSSxRQUFMLENBQXBCLENBQTNCLENBRkY7QUFBQSxLQWJBO0FBZ0JBLFNBQVMsa0dBQVQsR0FBQTtBQUVFLE1BQUEsUUFBUyxDQUFBLElBQUEsR0FBTyxDQUFQLENBQVQsR0FBcUIsT0FBckIsQ0FGRjtBQUFBLEtBaEJBO0FBbUJBLFNBQVMsa0dBQVQsR0FBQTtBQUVFLE1BQUEsUUFBUyxDQUFBLElBQUEsR0FBTyxDQUFQLENBQVQsR0FBcUIsT0FBQSxHQUFVLENBQUMsT0FBQSxHQUFVLENBQUMsQ0FBQSxHQUFJLFVBQUwsQ0FBWCxDQUEvQixDQUZGO0FBQUEsS0FuQkE7QUFzQkEsV0FBTyxRQUFQLENBdkJnQjtFQUFBLENBTmxCLENBQUE7O0FBQUEscUJBK0JBLFVBQUEsR0FBWSxTQUFDLE9BQUQsRUFBVSxTQUFWLEdBQUE7QUFDVixRQUFBLHVFQUFBO0FBQUEsSUFBQSxTQUFBLEdBQVksS0FBWixDQUFBO0FBQ0EsSUFBQSxJQUFHLFNBQVMsQ0FBQyxNQUFWLEdBQW1CLENBQXRCO0FBQ0UsTUFBQSxNQUFBLEdBQVMsU0FBUyxDQUFDLE1BQW5CLENBREY7S0FBQSxNQUFBO0FBR0UsTUFBQSxNQUFBLEdBQVMsSUFBSSxDQUFDLEtBQUwsQ0FBVyxPQUFPLENBQUMsUUFBUixHQUFtQixJQUFDLENBQUEsVUFBcEIsR0FBaUMsSUFBNUMsQ0FBVCxDQUhGO0tBREE7QUFBQSxJQUtBLE9BQUEsR0FBVSxLQUFBLENBQU0sTUFBTixDQUxWLENBQUE7QUFBQSxJQU1BLENBQUEsR0FBSSxHQU5KLENBQUE7QUFBQSxJQU9BLENBQUEsR0FBSSxHQVBKLENBQUE7QUFRQSxJQUFBLElBQUcsc0JBQUg7QUFDRSxNQUFBLElBQUEsR0FBTyxRQUFBLENBQVMsT0FBTyxDQUFDLE1BQWpCLEVBQXlCLFNBQVMsQ0FBQyxJQUFuQyxDQUFQLENBREY7S0FBQSxNQUVLLElBQUcsb0JBQUg7QUFDSCxNQUFBLElBQUEsR0FBTyxPQUFPLENBQUMsSUFBZixDQURHO0tBQUEsTUFBQTtBQUdILE1BQUEsSUFBQSxHQUFPLFFBQUEsQ0FBUyxPQUFPLENBQUMsTUFBakIsRUFBeUIsT0FBTyxDQUFDLElBQWpDLENBQVAsQ0FIRztLQVZMO0FBQUEsSUFjQSxRQUFBLEdBQVcsSUFBQyxDQUFBLGdCQUFELENBQWtCLE9BQU8sQ0FBQyxJQUExQixFQUFnQyxNQUFoQyxDQWRYLENBQUE7QUFBQSxJQWVBLE1BQUEsR0FBUyxJQUFDLENBQUEsVUFBRCxHQUFjLElBZnZCLENBQUE7QUFnQkEsU0FBUyxrRkFBVCxHQUFBO0FBQ0UsTUFBQSxJQUFHLE9BQU8sQ0FBQyxJQUFSLEtBQWdCLFVBQW5CO0FBQ0UsUUFBQSxNQUFBLEdBQVMsQ0FBQyxDQUFDLENBQUEsR0FBSSxNQUFMLENBQUEsR0FBZSxNQUFoQixDQUFBLEdBQTBCLEdBQW5DLENBREY7T0FBQSxNQUFBO0FBR0UsUUFBQSxNQUFBLEdBQVMsSUFBSSxDQUFDLEdBQUwsQ0FBUyxDQUFBLEdBQUksTUFBSixHQUFhLENBQWIsR0FBaUIsSUFBSSxDQUFDLEVBQS9CLENBQVQsQ0FBQTtBQUNBLFFBQUEsSUFBRyxPQUFPLENBQUMsSUFBUixLQUFnQixRQUFuQjtBQUNFLFVBQUEsTUFBQSxHQUFhLE1BQUEsR0FBUyxDQUFiLEdBQXFCLENBQXJCLEdBQTRCLENBQUEsQ0FBckMsQ0FERjtTQUpGO09BQUE7QUFBQSxNQU1BLE9BQVEsQ0FBQSxDQUFBLENBQVIsR0FBYSxNQUFBLEdBQVMsU0FBVCxHQUFxQixRQUFTLENBQUEsQ0FBQSxDQU4zQyxDQURGO0FBQUEsS0FoQkE7QUF5QkEsV0FBTztBQUFBLE1BQ0wsT0FBQSxFQUFTLE9BREo7QUFBQSxNQUVMLE1BQUEsRUFBUSxPQUFPLENBQUMsTUFGWDtLQUFQLENBMUJVO0VBQUEsQ0EvQlosQ0FBQTs7QUFBQSxxQkE4REEsWUFBQSxHQUFjLFNBQUMsU0FBRCxFQUFZLFNBQVosR0FBQTtBQUNaLFFBQUEsMEdBQUE7QUFBQSxJQUFBLElBQUEsR0FBTyxJQUFQLENBQUE7QUFFQSxJQUFBLElBQUcsSUFBQyxDQUFBLGNBQUo7QUFDRSxNQUFBLElBQUEsR0FBTyxFQUFFLENBQUMsWUFBSCxDQUFnQixTQUFTLENBQUMsR0FBMUIsQ0FBUCxDQUFBO0FBQUEsTUFDQSxJQUFBLEdBQVcsSUFBQSxTQUFBLENBQVUsSUFBVixFQUFnQixDQUFoQixFQUFtQixJQUFJLENBQUMsTUFBeEIsRUFBZ0MsSUFBaEMsQ0FEWCxDQURGO0tBQUEsTUFBQTtBQUlFLE1BQUEsQ0FBQyxDQUFDLElBQUYsQ0FBTztBQUFBLFFBQ0wsR0FBQSxFQUFLLFNBQVMsQ0FBQyxHQURWO0FBQUEsUUFFTCxRQUFBLEVBQVUsb0NBRkw7QUFBQSxRQUdMLE9BQUEsRUFBUyxTQUFDLElBQUQsR0FBQTtpQkFDUCxJQUFBLEdBQVcsSUFBQSxTQUFBLENBQVUsSUFBVixFQUFnQixDQUFoQixFQUFtQixJQUFJLENBQUMsTUFBeEIsRUFBZ0MsSUFBaEMsRUFESjtRQUFBLENBSEo7QUFBQSxRQUtMLEtBQUEsRUFBTyxLQUxGO09BQVAsQ0FBQSxDQUpGO0tBRkE7QUFjQSxJQUFBLElBQUcsQ0FBQSxJQUFIO0FBQ0UsYUFBTztBQUFBLFFBQ0wsT0FBQSxFQUFTLEVBREo7QUFBQSxRQUVMLE1BQUEsRUFBUSxDQUZIO09BQVAsQ0FERjtLQWRBO0FBQUEsSUFxQkEsSUFBSSxDQUFDLElBQUwsQ0FBVSxFQUFWLENBckJBLENBQUE7QUFBQSxJQXNCQSxhQUFBLEdBQWdCLElBQUksQ0FBQyxRQUFMLENBQUEsQ0F0QmhCLENBQUE7QUFBQSxJQXVCQSxPQUFBLEdBQVUsRUF2QlYsQ0FBQTtBQXdCQSxXQUFNLElBQUksQ0FBQyxJQUFMLENBQUEsQ0FBQSxHQUFZLENBQVosR0FBZ0IsSUFBSSxDQUFDLFVBQTNCLEdBQUE7QUFDRSxNQUFBLE9BQU8sQ0FBQyxJQUFSLENBQWEsSUFBSSxDQUFDLFFBQUwsQ0FBQSxDQUFiLENBQUEsQ0FERjtJQUFBLENBeEJBO0FBQUEsSUEyQkEsWUFBQSxHQUFrQixTQUFTLENBQUMsSUFBYixHQUF1QixTQUFTLENBQUMsSUFBakMsR0FBMkMsU0FBUyxDQUFDLElBM0JwRSxDQUFBO0FBNEJBLElBQUEsSUFBRyxDQUFDLFlBQUEsS0FBZ0IsU0FBUyxDQUFDLE9BQTNCLENBQUEsSUFBdUMsQ0FBQyxTQUFTLENBQUMsTUFBVixLQUFvQixTQUFTLENBQUMsU0FBL0IsQ0FBMUM7QUFDRSxNQUFBLE9BQUEsR0FBVSxRQUFBLENBQVMsU0FBUyxDQUFDLFNBQW5CLEVBQThCLFNBQVMsQ0FBQyxPQUF4QyxDQUFWLENBQUE7QUFBQSxNQUNBLE9BQUEsR0FBVSxRQUFBLENBQVMsU0FBUyxDQUFDLE1BQW5CLEVBQTJCLFlBQTNCLENBRFYsQ0FBQTtBQUFBLE1BR0EsTUFBQSxHQUFTLE9BQUEsR0FBVSxPQUhuQixDQUFBO0FBQUEsTUFPQSxRQUFBLEdBQVcsSUFBSSxDQUFDLEtBQUwsQ0FBVyxPQUFPLENBQUMsTUFBUixHQUFpQixNQUE1QixDQVBYLENBQUE7QUFBQSxNQVFBLFNBQUEsR0FBWSxLQUFBLENBQU0sUUFBTixDQVJaLENBQUE7QUFTQSxXQUFTLDBGQUFULEdBQUE7QUFDRSxRQUFBLFNBQVUsQ0FBQSxDQUFBLENBQVYsR0FBZSxDQUFmLENBREY7QUFBQSxPQVRBO0FBV0EsV0FBUywwRkFBVCxHQUFBO0FBQ0UsUUFBQSxTQUFVLENBQUEsQ0FBQSxDQUFWLEdBQWUsT0FBUSxDQUFBLElBQUksQ0FBQyxLQUFMLENBQVcsQ0FBQSxHQUFJLE1BQWYsQ0FBQSxDQUF2QixDQURGO0FBQUEsT0FYQTtBQWNBLGFBQU87QUFBQSxRQUNMLE9BQUEsRUFBUyxTQURKO0FBQUEsUUFFTCxNQUFBLEVBQVEsU0FBUyxDQUFDLE1BRmI7T0FBUCxDQWZGO0tBQUEsTUFBQTtBQW9CRSxhQUFPO0FBQUEsUUFDTCxPQUFBLEVBQVMsT0FESjtBQUFBLFFBRUwsTUFBQSxFQUFRLE9BQU8sQ0FBQyxNQUZYO09BQVAsQ0FwQkY7S0E3Qlk7RUFBQSxDQTlEZCxDQUFBOztBQUFBLHFCQW9IQSxVQUFBLEdBQVksU0FBQyxPQUFELEdBQUE7QUFDVixRQUFBLGtUQUFBO0FBQUEsSUFBQSxTQUFBLEdBQVksQ0FBWixDQUFBO0FBQ0E7QUFBQSxTQUFBLDJDQUFBO3lCQUFBO0FBQ0UsTUFBQSxJQUFHLFNBQUEsR0FBWSxPQUFPLENBQUMsTUFBdkI7QUFDRSxRQUFBLFNBQUEsR0FBWSxPQUFPLENBQUMsTUFBcEIsQ0FERjtPQURGO0FBQUEsS0FEQTtBQUFBLElBS0EsY0FBQSxHQUFpQixJQUFDLENBQUEsVUFBRCxHQUFjLENBQUMsT0FBTyxDQUFDLEdBQVIsR0FBYyxFQUFmLENBQWQsR0FBbUMsQ0FMcEQsQ0FBQTtBQUFBLElBTUEsV0FBQSxHQUFjLElBQUksQ0FBQyxLQUFMLENBQVcsY0FBQSxHQUFpQixTQUE1QixDQU5kLENBQUE7QUFBQSxJQU9BLGNBQUEsR0FBaUIsV0FQakIsQ0FBQTtBQVNBO0FBQUEsU0FBQSw4Q0FBQTswQkFBQTtBQUNFLE1BQUEsWUFBQSxHQUFlLE9BQU8sQ0FBQyxNQUFSLEdBQWlCLEVBQWhDLENBQUE7QUFBQSxNQUNBLFlBQUEsR0FBZSxJQUFJLENBQUMsS0FBTCxDQUFXLFdBQUEsR0FBYyxFQUFkLEdBQW1CLFlBQTlCLENBRGYsQ0FBQTtBQUVBO0FBQUEsV0FBQSw4Q0FBQTswQkFBQTtBQUNFLFFBQUEsU0FBQSxHQUFZLEVBQVosQ0FBQTtBQUNBLFFBQUEsSUFBRyxLQUFLLENBQUMsTUFBTixHQUFlLENBQWxCO0FBQ0UsVUFBQSxTQUFTLENBQUMsTUFBVixHQUFtQixLQUFLLENBQUMsTUFBTixHQUFlLFlBQWxDLENBREY7U0FEQTtBQUdBLFFBQUEsSUFBRyxrQkFBSDtBQUNFLFVBQUEsU0FBUyxDQUFDLElBQVYsR0FBaUIsS0FBSyxDQUFDLElBQXZCLENBREY7U0FIQTtBQUFBLFFBS0EsS0FBSyxDQUFDLE9BQU4sR0FBZ0IsSUFBQyxDQUFBLE1BQUQsQ0FBUSxPQUFPLENBQUMsR0FBaEIsRUFBcUIsU0FBckIsQ0FMaEIsQ0FBQTtBQUFBLFFBTUEsR0FBQSxHQUFNLENBQUMsS0FBSyxDQUFDLE1BQU4sR0FBZSxZQUFoQixDQUFBLEdBQWdDLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BTjVELENBQUE7QUFPQSxRQUFBLElBQUcsY0FBQSxHQUFpQixHQUFwQjtBQUNFLFVBQUEsY0FBQSxHQUFpQixHQUFqQixDQURGO1NBUkY7QUFBQSxPQUhGO0FBQUEsS0FUQTtBQUFBLElBdUJBLE9BQUEsR0FBVSxLQUFBLENBQU0sY0FBTixDQXZCVixDQUFBO0FBd0JBLFNBQVMsa0hBQVQsR0FBQTtBQUNFLE1BQUEsT0FBUSxDQUFBLENBQUEsQ0FBUixHQUFhLENBQWIsQ0FERjtBQUFBLEtBeEJBO0FBMkJBO0FBQUEsU0FBQSw4Q0FBQTswQkFBQTtBQUNFLE1BQUEsWUFBQSxHQUFlLE9BQU8sQ0FBQyxNQUFSLEdBQWlCLEVBQWhDLENBQUE7QUFBQSxNQUNBLFlBQUEsR0FBZSxJQUFJLENBQUMsS0FBTCxDQUFXLFdBQUEsR0FBYyxFQUFkLEdBQW1CLFlBQTlCLENBRGYsQ0FBQTtBQUFBLE1BR0EsY0FBQSxHQUFpQixLQUFBLENBQU0sY0FBTixDQUhqQixDQUFBO0FBSUEsV0FBUyxrSEFBVCxHQUFBO0FBQ0UsUUFBQSxjQUFlLENBQUEsQ0FBQSxDQUFmLEdBQW9CLENBQXBCLENBREY7QUFBQSxPQUpBO0FBT0E7QUFBQSxXQUFBLDhDQUFBOzBCQUFBO0FBQ0UsUUFBQSxRQUFBLEdBQVcsS0FBSyxDQUFDLE9BQWpCLENBQUE7QUFBQSxRQUVBLEdBQUEsR0FBTSxJQUFDLENBQUEsU0FBRCxDQUFXLE9BQU8sQ0FBQyxHQUFuQixDQUZOLENBQUE7QUFBQSxRQUdBLE1BQUEsR0FBUyxLQUFLLENBQUMsTUFBTixHQUFlLFlBSHhCLENBQUE7QUFBQSxRQUlBLE9BQUEsR0FBVSxRQUFRLENBQUMsT0FBTyxDQUFDLE1BSjNCLENBQUE7QUFLQSxRQUFBLElBQUcsQ0FBQyxNQUFBLEdBQVMsT0FBVixDQUFBLEdBQXFCLGNBQXhCO0FBQ0UsVUFBQSxPQUFBLEdBQVUsY0FBQSxHQUFpQixNQUEzQixDQURGO1NBTEE7QUFRQSxRQUFBLElBQUcsR0FBRyxDQUFDLElBQVA7QUFDRSxVQUFBLFFBQUEsR0FBVyxHQUFYLENBQUE7QUFDQSxVQUFBLElBQUcsTUFBQSxHQUFTLFFBQVo7QUFDRSxpQkFBUywwRkFBVCxHQUFBO0FBQ0UsY0FBQSxDQUFBLEdBQUksY0FBZSxDQUFBLE1BQUEsR0FBUyxRQUFULEdBQW9CLENBQXBCLENBQW5CLENBQUE7QUFBQSxjQUNBLGNBQWUsQ0FBQSxNQUFBLEdBQVMsUUFBVCxHQUFvQixDQUFwQixDQUFmLEdBQXdDLElBQUksQ0FBQyxLQUFMLENBQVcsQ0FBQSxHQUFJLENBQUMsQ0FBQyxRQUFBLEdBQVcsQ0FBWixDQUFBLEdBQWlCLFFBQWxCLENBQWYsQ0FEeEMsQ0FERjtBQUFBLGFBREY7V0FEQTtBQUtBLGVBQVMsaUlBQVQsR0FBQTtBQUVFLFlBQUEsY0FBZSxDQUFBLENBQUEsQ0FBZixHQUFvQixDQUFwQixDQUZGO0FBQUEsV0FMQTtBQVFBLGVBQVMsc0ZBQVQsR0FBQTtBQUNFLFlBQUEsY0FBZSxDQUFBLE1BQUEsR0FBUyxDQUFULENBQWYsR0FBNkIsUUFBUSxDQUFDLE9BQVEsQ0FBQSxDQUFBLENBQTlDLENBREY7QUFBQSxXQVRGO1NBQUEsTUFBQTtBQVlFLGVBQVMsc0ZBQVQsR0FBQTtBQUNFLFlBQUEsY0FBZSxDQUFBLE1BQUEsR0FBUyxDQUFULENBQWYsSUFBOEIsUUFBUSxDQUFDLE9BQVEsQ0FBQSxDQUFBLENBQS9DLENBREY7QUFBQSxXQVpGO1NBVEY7QUFBQSxPQVBBO0FBZ0NBLFdBQVMsa0hBQVQsR0FBQTtBQUNFLFFBQUEsT0FBUSxDQUFBLENBQUEsQ0FBUixJQUFjLGNBQWUsQ0FBQSxDQUFBLENBQTdCLENBREY7QUFBQSxPQWpDRjtBQUFBLEtBM0JBO0FBK0RBLFdBQU87QUFBQSxNQUNMLE9BQUEsRUFBUyxPQURKO0FBQUEsTUFFTCxNQUFBLEVBQVEsV0FGSDtLQUFQLENBaEVVO0VBQUEsQ0FwSFosQ0FBQTs7QUFBQSxxQkF5TEEsV0FBQSxHQUFhLFNBQUMsUUFBRCxHQUFBO0FBQ1gsUUFBQSx5T0FBQTtBQUFBLElBQUEsVUFBQSxHQUFhLENBQWIsQ0FBQTtBQUNBO0FBQUEsU0FBQSwyQ0FBQTt5QkFBQTtBQUNFLE1BQUEsSUFBRyxVQUFBLEdBQWEsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFoQztBQUNFLFFBQUEsVUFBQSxHQUFhLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBN0IsQ0FERjtPQURGO0FBQUEsS0FEQTtBQUFBLElBS0EsV0FBQSxHQUFjLENBTGQsQ0FBQTtBQUFBLElBTUEsY0FBQSxHQUFpQixDQU5qQixDQUFBO0FBQUEsSUFPQSxnQkFBQSxHQUFtQixLQUFBLENBQU0sVUFBTixDQVBuQixDQUFBO0FBQUEsSUFRQSxtQkFBQSxHQUFzQixLQUFBLENBQU0sVUFBTixDQVJ0QixDQUFBO0FBU0EsU0FBa0Isb0hBQWxCLEdBQUE7QUFDRSxNQUFBLGdCQUFpQixDQUFBLFVBQUEsQ0FBakIsR0FBK0IsQ0FBL0IsQ0FBQTtBQUFBLE1BQ0EsbUJBQW9CLENBQUEsVUFBQSxDQUFwQixHQUFrQyxDQURsQyxDQUFBO0FBRUE7QUFBQSxXQUFBLDhDQUFBOzRCQUFBO0FBQ0UsUUFBQSxJQUFHLENBQUMsVUFBQSxHQUFhLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBOUIsQ0FBQSxJQUEwQyxDQUFDLE9BQU8sQ0FBQyxPQUFRLENBQUEsVUFBQSxDQUFoQixLQUErQixHQUFoQyxDQUE3QztBQUNFLFVBQUEsUUFBQSxHQUFXLElBQUMsQ0FBQSxNQUFELENBQVEsT0FBTyxDQUFDLEdBQWhCLENBQVgsQ0FBQTtBQUNBLFVBQUEsSUFBRyxnQkFBaUIsQ0FBQSxVQUFBLENBQWpCLEdBQStCLFFBQVEsQ0FBQyxNQUEzQztBQUNFLFlBQUEsZ0JBQWlCLENBQUEsVUFBQSxDQUFqQixHQUErQixRQUFRLENBQUMsTUFBeEMsQ0FERjtXQURBO0FBR0EsVUFBQSxJQUFHLG1CQUFvQixDQUFBLFVBQUEsQ0FBcEIsR0FBa0MsUUFBUSxDQUFDLE9BQU8sQ0FBQyxNQUF0RDtBQUNFLFlBQUEsbUJBQW9CLENBQUEsVUFBQSxDQUFwQixHQUFrQyxRQUFRLENBQUMsT0FBTyxDQUFDLE1BQW5ELENBREY7V0FKRjtTQURGO0FBQUEsT0FGQTtBQUFBLE1BU0EsaUJBQUEsR0FBb0IsV0FBQSxHQUFjLG1CQUFvQixDQUFBLFVBQUEsQ0FUdEQsQ0FBQTtBQVVBLE1BQUEsSUFBRyxjQUFBLEdBQWlCLGlCQUFwQjtBQUNFLFFBQUEsY0FBQSxHQUFpQixpQkFBakIsQ0FERjtPQVZBO0FBQUEsTUFZQSxXQUFBLElBQWUsZ0JBQWlCLENBQUEsVUFBQSxDQVpoQyxDQURGO0FBQUEsS0FUQTtBQUFBLElBd0JBLE9BQUEsR0FBVSxLQUFBLENBQU0sY0FBTixDQXhCVixDQUFBO0FBeUJBLFNBQVMsa0hBQVQsR0FBQTtBQUNFLE1BQUEsT0FBUSxDQUFBLENBQUEsQ0FBUixHQUFhLENBQWIsQ0FERjtBQUFBLEtBekJBO0FBNEJBO0FBQUEsU0FBQSw4Q0FBQTswQkFBQTtBQUNFLE1BQUEsV0FBQSxHQUFjLENBQWQsQ0FBQTtBQUFBLE1BQ0EsUUFBQSxHQUFXLElBQUMsQ0FBQSxNQUFELENBQVEsT0FBTyxDQUFDLEdBQWhCLEVBQXFCLEVBQXJCLENBRFgsQ0FBQTtBQUVBLFdBQWtCLG9IQUFsQixHQUFBO0FBQ0UsUUFBQSxJQUFHLENBQUMsVUFBQSxHQUFhLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBOUIsQ0FBQSxJQUEwQyxDQUFDLE9BQU8sQ0FBQyxPQUFRLENBQUEsVUFBQSxDQUFoQixLQUErQixHQUFoQyxDQUE3QztBQUNFLFVBQUEsT0FBQSxHQUFVLFFBQVEsQ0FBQyxPQUFPLENBQUMsTUFBM0IsQ0FBQTtBQUNBLFVBQUEsSUFBRyxDQUFDLFdBQUEsR0FBYyxPQUFmLENBQUEsR0FBMEIsY0FBN0I7QUFDRSxZQUFBLE9BQUEsR0FBVSxjQUFBLEdBQWlCLFdBQTNCLENBREY7V0FEQTtBQUdBLGVBQVMsc0ZBQVQsR0FBQTtBQUNFLFlBQUEsT0FBUSxDQUFBLFdBQUEsR0FBYyxDQUFkLENBQVIsSUFBNEIsUUFBUSxDQUFDLE9BQVEsQ0FBQSxDQUFBLENBQTdDLENBREY7QUFBQSxXQUpGO1NBQUE7QUFBQSxRQU9BLFdBQUEsSUFBZSxnQkFBaUIsQ0FBQSxVQUFBLENBUGhDLENBREY7QUFBQSxPQUhGO0FBQUEsS0E1QkE7QUF5Q0EsV0FBTztBQUFBLE1BQ0wsT0FBQSxFQUFTLE9BREo7QUFBQSxNQUVMLE1BQUEsRUFBUSxXQUZIO0tBQVAsQ0ExQ1c7RUFBQSxDQXpMYixDQUFBOztBQUFBLHFCQXdPQSxhQUFBLEdBQWUsU0FBQyxJQUFELEVBQU8sS0FBUCxFQUFjLFNBQWQsR0FBQTtBQUNiLFFBQUEsSUFBQTtBQUFBLElBQUEsSUFBRyxDQUFDLElBQUEsS0FBUSxNQUFULENBQUEsSUFBcUIsQ0FBQyxJQUFBLEtBQVEsUUFBVCxDQUF4QjtBQUNFLGFBQU8sS0FBUCxDQURGO0tBQUE7QUFBQSxJQUdBLElBQUEsR0FBTyxLQUhQLENBQUE7QUFJQSxJQUFBLElBQUcsU0FBUyxDQUFDLElBQWI7QUFDRSxNQUFBLElBQUEsSUFBUyxJQUFBLEdBQUksU0FBUyxDQUFDLElBQXZCLENBREY7S0FKQTtBQU1BLElBQUEsSUFBRyxTQUFTLENBQUMsTUFBYjtBQUNFLE1BQUEsSUFBQSxJQUFTLElBQUEsR0FBSSxTQUFTLENBQUMsTUFBdkIsQ0FERjtLQU5BO0FBU0EsV0FBTyxJQUFQLENBVmE7RUFBQSxDQXhPZixDQUFBOztBQUFBLHFCQW9QQSxTQUFBLEdBQVcsU0FBQyxLQUFELEdBQUE7QUFDVCxRQUFBLE1BQUE7QUFBQSxJQUFBLE1BQUEsR0FBUyxJQUFDLENBQUEsT0FBUSxDQUFBLEtBQUEsQ0FBbEIsQ0FBQTtBQUNBLElBQUEsSUFBRyxDQUFBLE1BQUg7QUFDRSxNQUFBLElBQUMsQ0FBQSxLQUFELENBQVEsaUJBQUEsR0FBaUIsS0FBekIsQ0FBQSxDQUFBO0FBQ0EsYUFBTyxJQUFQLENBRkY7S0FEQTtBQUlBLFdBQU8sTUFBUCxDQUxTO0VBQUEsQ0FwUFgsQ0FBQTs7QUFBQSxxQkEyUEEsTUFBQSxHQUFRLFNBQUMsS0FBRCxFQUFRLFNBQVIsR0FBQTtBQUNOLFFBQUEsK0tBQUE7QUFBQSxJQUFBLE1BQUEsR0FBUyxJQUFDLENBQUEsU0FBRCxDQUFXLEtBQVgsQ0FBVCxDQUFBO0FBQ0EsSUFBQSxJQUFHLENBQUEsTUFBSDtBQUNFLGFBQU8sSUFBUCxDQURGO0tBREE7O01BSUEsWUFBYTtLQUpiO0FBQUEsSUFNQSxTQUFBLEdBQVksSUFBQyxDQUFBLGFBQUQsQ0FBZSxNQUFNLENBQUMsS0FBdEIsRUFBNkIsS0FBN0IsRUFBb0MsU0FBcEMsQ0FOWixDQUFBO0FBT0EsSUFBQSxJQUFHLElBQUMsQ0FBQSxVQUFXLENBQUEsU0FBQSxDQUFmO0FBQ0UsYUFBTyxJQUFDLENBQUEsVUFBVyxDQUFBLFNBQUEsQ0FBbkIsQ0FERjtLQVBBO0FBQUEsSUFVQSxLQUFBO0FBQVEsY0FBTyxNQUFNLENBQUMsS0FBZDtBQUFBLGFBQ0QsTUFEQztpQkFDVyxJQUFDLENBQUEsVUFBRCxDQUFZLE1BQVosRUFBb0IsU0FBcEIsRUFEWDtBQUFBLGFBRUQsUUFGQztpQkFFYSxJQUFDLENBQUEsWUFBRCxDQUFjLE1BQWQsRUFBc0IsU0FBdEIsRUFGYjtBQUFBLGFBR0QsTUFIQztpQkFHVyxJQUFDLENBQUEsVUFBRCxDQUFZLE1BQVosRUFIWDtBQUFBLGFBSUQsT0FKQztpQkFJWSxJQUFDLENBQUEsV0FBRCxDQUFhLE1BQWIsRUFKWjtBQUFBO0FBTUosVUFBQSxJQUFDLENBQUEsS0FBRCxDQUFRLGVBQUEsR0FBZSxNQUFNLENBQUMsS0FBOUIsQ0FBQSxDQUFBO2lCQUNBLEtBUEk7QUFBQTtpQkFWUixDQUFBO0FBbUJBLElBQUEsSUFBRyxNQUFNLENBQUMsS0FBUCxLQUFnQixNQUFuQjtBQUNFLE1BQUEsWUFBQSxHQUFrQixTQUFTLENBQUMsSUFBYixHQUF1QixTQUFTLENBQUMsSUFBakMsR0FBMkMsTUFBTSxDQUFDLElBQWpFLENBQUE7QUFDQSxNQUFBLElBQUcsQ0FBQyxZQUFBLEtBQWdCLE1BQU0sQ0FBQyxPQUF4QixDQUFBLElBQW9DLENBQUMsTUFBTSxDQUFDLE1BQVAsS0FBaUIsTUFBTSxDQUFDLFNBQXpCLENBQXZDO0FBQ0UsUUFBQSxPQUFBLEdBQVUsUUFBQSxDQUFTLE1BQU0sQ0FBQyxTQUFoQixFQUEyQixNQUFNLENBQUMsT0FBbEMsQ0FBVixDQUFBO0FBQUEsUUFDQSxPQUFBLEdBQVUsUUFBQSxDQUFTLE1BQU0sQ0FBQyxNQUFoQixFQUF3QixZQUF4QixDQURWLENBQUE7QUFBQSxRQUdBLE1BQUEsR0FBUyxPQUFBLEdBQVUsT0FIbkIsQ0FBQTtBQUFBLFFBT0EsUUFBQSxHQUFXLElBQUksQ0FBQyxLQUFMLENBQVcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFkLEdBQXVCLE1BQWxDLENBUFgsQ0FBQTtBQUFBLFFBUUEsU0FBQSxHQUFZLEtBQUEsQ0FBTSxRQUFOLENBUlosQ0FBQTtBQVNBLGFBQVMsMEZBQVQsR0FBQTtBQUNFLFVBQUEsU0FBVSxDQUFBLENBQUEsQ0FBVixHQUFlLENBQWYsQ0FERjtBQUFBLFNBVEE7QUFXQSxhQUFTLDBGQUFULEdBQUE7QUFDRSxVQUFBLFNBQVUsQ0FBQSxDQUFBLENBQVYsR0FBZSxLQUFLLENBQUMsT0FBUSxDQUFBLElBQUksQ0FBQyxLQUFMLENBQVcsQ0FBQSxHQUFJLE1BQWYsQ0FBQSxDQUE3QixDQURGO0FBQUEsU0FYQTtBQUFBLFFBY0EsS0FBSyxDQUFDLE9BQU4sR0FBZ0IsU0FkaEIsQ0FBQTtBQUFBLFFBZUEsS0FBSyxDQUFDLE1BQU4sR0FBZSxTQUFTLENBQUMsTUFmekIsQ0FERjtPQUZGO0tBbkJBO0FBd0NBLElBQUEsSUFBRyx1QkFBQSxJQUFtQixDQUFDLE1BQU0sQ0FBQyxNQUFQLEtBQWlCLEdBQWxCLENBQXRCO0FBQ0UsV0FBUyx1R0FBVCxHQUFBO0FBQ0UsUUFBQSxLQUFLLENBQUMsT0FBUSxDQUFBLENBQUEsQ0FBZCxJQUFvQixNQUFNLENBQUMsTUFBM0IsQ0FERjtBQUFBLE9BREY7S0F4Q0E7QUE2Q0EsSUFBQSxJQUFHLHVCQUFBLElBQW1CLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFkLEdBQXNCLENBQXZCLENBQXRCO0FBQ0UsTUFBQSxZQUFBLEdBQWUsSUFBSSxDQUFDLEtBQUwsQ0FBVyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQWQsR0FBc0IsSUFBQyxDQUFBLFVBQXZCLEdBQW9DLElBQS9DLENBQWYsQ0FBQTtBQUNBLE1BQUEsSUFBRyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQWQsR0FBdUIsWUFBMUI7QUFDRSxRQUFBLFdBQUEsR0FBYyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQWQsR0FBdUIsQ0FBQyxZQUFBLEdBQWUsQ0FBaEIsQ0FBckMsQ0FBQTtBQUFBLFFBRUEsT0FBQSxHQUFVLEtBQUEsQ0FBTSxXQUFOLENBRlYsQ0FBQTtBQUdBLGFBQVMsNEdBQVQsR0FBQTtBQUNFLFVBQUEsT0FBUSxDQUFBLENBQUEsQ0FBUixHQUFhLEtBQUssQ0FBQyxPQUFRLENBQUEsQ0FBQSxDQUEzQixDQURGO0FBQUEsU0FIQTtBQUtBLGFBQVMseUlBQVQsR0FBQTtBQUNFLFVBQUEsT0FBUSxDQUFBLENBQUEsQ0FBUixHQUFhLENBQWIsQ0FERjtBQUFBLFNBTEE7QUFPQSxhQUFTLGtIQUFULEdBQUE7QUFDRSxVQUFBLE9BQVEsQ0FBQSxDQUFBLEdBQUksWUFBSixDQUFSLElBQTZCLElBQUksQ0FBQyxLQUFMLENBQVcsT0FBUSxDQUFBLENBQUEsQ0FBUixHQUFhLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBdEMsQ0FBN0IsQ0FERjtBQUFBLFNBUEE7QUFBQSxRQVNBLEtBQUssQ0FBQyxPQUFOLEdBQWdCLE9BVGhCLENBREY7T0FGRjtLQTdDQTtBQUFBLElBMkRBLElBQUMsQ0FBQSxHQUFHLENBQUMsT0FBTCxDQUFjLFdBQUEsR0FBVyxTQUFYLEdBQXFCLEdBQW5DLENBM0RBLENBQUE7QUFBQSxJQTREQSxJQUFDLENBQUEsVUFBVyxDQUFBLFNBQUEsQ0FBWixHQUF5QixLQTVEekIsQ0FBQTtBQTZEQSxXQUFPLEtBQVAsQ0E5RE07RUFBQSxDQTNQUixDQUFBOztrQkFBQTs7SUE5YkYsQ0FBQTs7QUFBQSxtQkE0dkJBLEdBQXNCLFNBQUMsT0FBRCxFQUFVLEtBQVYsRUFBaUIsTUFBakIsRUFBeUIsZUFBekIsRUFBMEMsYUFBMUMsR0FBQTtBQUNwQixNQUFBLDJLQUFBOztJQUFBLGtCQUFtQixDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsR0FBWDtHQUFuQjs7SUFDQSxnQkFBaUIsQ0FBQyxHQUFELEVBQU0sQ0FBTixFQUFTLENBQVQ7R0FEakI7QUFBQSxFQUVBLElBQUEsR0FBTyxFQUZQLENBQUE7QUFHQSxPQUFTLGtGQUFULEdBQUE7QUFDRSxJQUFBLEdBQUEsR0FBTSxFQUFOLENBQUE7QUFDQSxTQUFTLDhFQUFULEdBQUE7QUFDRSxNQUFBLEdBQUcsQ0FBQyxJQUFKLENBQVMsZUFBVCxDQUFBLENBREY7QUFBQSxLQURBO0FBQUEsSUFHQSxJQUFJLENBQUMsSUFBTCxDQUFVLEdBQVYsQ0FIQSxDQURGO0FBQUEsR0FIQTtBQUFBLEVBU0EsYUFBQSxHQUFnQixJQUFJLENBQUMsS0FBTCxDQUFXLE9BQU8sQ0FBQyxNQUFSLEdBQWlCLEtBQTVCLENBVGhCLENBQUE7QUFBQSxFQVdBLElBQUEsR0FBTyxDQVhQLENBQUE7QUFZQSxPQUFBLDhDQUFBO3lCQUFBO0FBQ0UsSUFBQSxDQUFBLEdBQUksSUFBSSxDQUFDLEdBQUwsQ0FBUyxNQUFULENBQUosQ0FBQTtBQUNBLElBQUEsSUFBRyxJQUFBLEdBQU8sQ0FBVjtBQUNFLE1BQUEsSUFBQSxHQUFPLENBQVAsQ0FERjtLQUZGO0FBQUEsR0FaQTtBQUFBLEVBaUJBLElBQUEsR0FBTyxJQUFJLENBQUMsS0FBTCxDQUFXLElBQUEsR0FBTyxHQUFsQixDQWpCUCxDQUFBO0FBbUJBLEVBQUEsSUFBRyxJQUFBLEtBQVEsQ0FBWDtBQUNFLElBQUEsR0FBQSxHQUFNLElBQU0sQ0FBQSxJQUFJLENBQUMsS0FBTCxDQUFXLE1BQUEsR0FBUyxDQUFwQixDQUFBLENBQVosQ0FBQTtBQUNBLFNBQVMsOEVBQVQsR0FBQTtBQUNFLE1BQUEsR0FBSSxDQUFBLENBQUEsQ0FBSixHQUFTLGFBQVQsQ0FERjtBQUFBLEtBRkY7R0FBQSxNQUFBO0FBS0UsU0FBUyw4RUFBVCxHQUFBO0FBQ0UsTUFBQSxZQUFBLEdBQWUsSUFBSSxDQUFDLEtBQUwsQ0FBVyxDQUFDLENBQUEsR0FBSSxLQUFMLENBQUEsR0FBYyxPQUFPLENBQUMsTUFBakMsQ0FBZixDQUFBO0FBQUEsTUFDQSxTQUFBLEdBQVksQ0FEWixDQUFBO0FBQUEsTUFFQSxTQUFBLEdBQVksQ0FGWixDQUFBO0FBR0EsV0FBbUIsb0tBQW5CLEdBQUE7QUFDRSxRQUFBLENBQUEsR0FBSSxJQUFJLENBQUMsR0FBTCxDQUFTLE9BQVEsQ0FBQSxXQUFBLENBQWpCLENBQUosQ0FBQTtBQUFBLFFBQ0EsU0FBQSxJQUFhLENBRGIsQ0FBQTtBQUVBLFFBQUEsSUFBRyxTQUFBLEdBQVksQ0FBZjtBQUNFLFVBQUEsU0FBQSxHQUFZLENBQVosQ0FERjtTQUhGO0FBQUEsT0FIQTtBQUFBLE1BUUEsU0FBQSxHQUFZLElBQUksQ0FBQyxLQUFMLENBQVcsU0FBQSxHQUFZLGFBQXZCLENBUlosQ0FBQTtBQUFBLE1BU0EsVUFBQSxHQUFhLElBQUksQ0FBQyxLQUFMLENBQVcsU0FBQSxHQUFZLElBQVosR0FBbUIsTUFBOUIsQ0FUYixDQUFBO0FBQUEsTUFVQSxVQUFBLEdBQWEsQ0FBQyxNQUFBLEdBQVMsVUFBVixDQUFBLElBQXlCLENBVnRDLENBQUE7QUFXQSxNQUFBLElBQUcsVUFBQSxLQUFjLENBQWpCO0FBQ0UsUUFBQSxVQUFBLEdBQWEsQ0FBYixDQURGO09BWEE7QUFhQSxXQUFTLGtHQUFULEdBQUE7QUFDRSxRQUFBLEdBQUEsR0FBTSxJQUFLLENBQUEsQ0FBQSxHQUFJLFVBQUosQ0FBWCxDQUFBO0FBQUEsUUFDQSxHQUFJLENBQUEsQ0FBQSxDQUFKLEdBQVMsYUFEVCxDQURGO0FBQUEsT0FkRjtBQUFBLEtBTEY7R0FuQkE7QUEwQ0EsU0FBTyxxQkFBQSxDQUFzQixJQUF0QixDQUFQLENBM0NvQjtBQUFBLENBNXZCdEIsQ0FBQTs7QUFBQSxnQkE0eUJBLEdBQW1CLFNBQUMsSUFBRCxHQUFBO0FBQ2pCLE1BQUEsNkRBQUE7QUFBQSxFQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsR0FBZCxDQUFBO0FBQUEsRUFDQSxNQUFNLENBQUMsT0FBUCxDQUFlLFlBQWYsQ0FEQSxDQUFBO0FBQUEsRUFFQSxNQUFBLEdBQWEsSUFBQSxNQUFBLENBQU8sTUFBUCxDQUZiLENBQUE7QUFBQSxFQUdBLE1BQU0sQ0FBQyxLQUFQLENBQWEsSUFBSSxDQUFDLE1BQWxCLENBSEEsQ0FBQTtBQUFBLEVBS0EsS0FBQSxHQUFRLElBQUksQ0FBQyxLQUxiLENBQUE7O0lBTUEsUUFBUyxNQUFNLENBQUM7R0FOaEI7QUFRQSxFQUFBLElBQUcsS0FBSDtBQUNFLElBQUEsVUFBQSxHQUFhLEtBQWIsQ0FBQTtBQUFBLElBQ0EsTUFBTSxDQUFDLE9BQVAsQ0FBZSxjQUFmLENBREEsQ0FBQTtBQUFBLElBRUEsUUFBQSxHQUFlLElBQUEsUUFBQSxDQUFTLE1BQVQsRUFBaUIsVUFBakIsRUFBNkIsSUFBSSxDQUFDLGNBQWxDLEVBQWtELE1BQU0sQ0FBQyxPQUF6RCxDQUZmLENBQUE7QUFBQSxJQUdBLFdBQUEsR0FBYyxRQUFRLENBQUMsTUFBVCxDQUFnQixLQUFoQixFQUF1QixFQUF2QixDQUhkLENBQUE7QUFBQSxJQUlBLEdBQUEsR0FBTSxFQUpOLENBQUE7QUFLQSxJQUFBLElBQUcsSUFBSSxDQUFDLFdBQVI7QUFDRSxNQUFBLFFBQVEsQ0FBQyxRQUFULENBQWtCLElBQUksQ0FBQyxXQUF2QixFQUFvQyxVQUFwQyxFQUFnRCxXQUFXLENBQUMsT0FBNUQsQ0FBQSxDQURGO0tBQUEsTUFBQTtBQUdFLE1BQUEsR0FBRyxDQUFDLE1BQUosR0FBYSxRQUFRLENBQUMsV0FBVCxDQUFxQixVQUFyQixFQUFpQyxXQUFXLENBQUMsT0FBN0MsQ0FBYixDQUhGO0tBTEE7QUFTQSxJQUFBLElBQUcseUJBQUEsSUFBcUIsMEJBQXJCLElBQTJDLENBQUMsSUFBSSxDQUFDLFVBQUwsR0FBa0IsQ0FBbkIsQ0FBM0MsSUFBcUUsQ0FBQyxJQUFJLENBQUMsV0FBTCxHQUFtQixDQUFwQixDQUF4RTtBQUNFLE1BQUEsR0FBRyxDQUFDLFFBQUosR0FBZSxtQkFBQSxDQUFvQixXQUFXLENBQUMsT0FBaEMsRUFBeUMsSUFBSSxDQUFDLFVBQTlDLEVBQTBELElBQUksQ0FBQyxXQUEvRCxFQUE0RSxJQUFJLENBQUMsb0JBQWpGLEVBQXVHLElBQUksQ0FBQyxrQkFBNUcsQ0FBZixDQURGO0tBVEE7QUFXQSxXQUFPLEdBQVAsQ0FaRjtHQVJBO0FBc0JBLFNBQU8sSUFBUCxDQXZCaUI7QUFBQSxDQTV5Qm5CLENBQUE7O0FBQUEsTUFxMEJNLENBQUMsT0FBUCxHQUNFO0FBQUEsRUFBQSxNQUFBLEVBQVEsZ0JBQVI7Q0F0MEJGLENBQUE7Ozs7O0FDSEEsSUFBQSx1RUFBQTs7QUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVIsQ0FBTCxDQUFBOztBQUFBO0FBSWUsRUFBQSxvQkFBQSxHQUFBO0FBQ1gsUUFBQSxLQUFBO0FBQUEsSUFBQSxJQUFDLENBQUEsS0FBRCxHQUFTLG1FQUFULENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxTQUFELEdBQWEsRUFEYixDQUFBO0FBRUEsU0FBUywrQkFBVCxHQUFBO0FBQ0UsTUFBQSxJQUFDLENBQUEsU0FBVSxDQUFBLENBQUEsQ0FBWCxHQUFnQixJQUFDLENBQUEsS0FBTSxDQUFBLENBQUEsSUFBSyxDQUFMLENBQVAsR0FBaUIsSUFBQyxDQUFBLEtBQU0sQ0FBQSxDQUFBLEdBQUksSUFBSixDQUF4QyxDQURGO0FBQUEsS0FIVztFQUFBLENBQWI7O0FBQUEsdUJBTUEsTUFBQSxHQUFRLFNBQUMsR0FBRCxHQUFBO0FBQ04sUUFBQSwwQkFBQTtBQUFBLElBQUEsR0FBQSxHQUFNLEdBQUcsQ0FBQyxNQUFWLENBQUE7QUFBQSxJQUNBLEdBQUEsR0FBTSxFQUROLENBQUE7QUFBQSxJQUVBLENBQUEsR0FBSSxDQUZKLENBQUE7QUFHQSxXQUFPLEdBQUEsR0FBTSxDQUFiLEdBQUE7QUFDRSxNQUFBLENBQUEsR0FBSSxDQUFDLEdBQUksQ0FBQSxDQUFBLENBQUosSUFBVSxFQUFYLENBQUEsR0FBaUIsQ0FBQyxHQUFJLENBQUEsQ0FBQSxHQUFFLENBQUYsQ0FBSixJQUFVLENBQVgsQ0FBakIsR0FBaUMsR0FBSSxDQUFBLENBQUEsR0FBRSxDQUFGLENBQXpDLENBQUE7QUFBQSxNQUNBLEdBQUEsSUFBTSxJQUFJLENBQUMsU0FBVSxDQUFBLENBQUEsSUFBSyxFQUFMLENBQWYsR0FBMEIsSUFBSSxDQUFDLFNBQVUsQ0FBQSxDQUFBLEdBQUksS0FBSixDQUQvQyxDQUFBO0FBQUEsTUFFQSxHQUFBLElBQU0sQ0FGTixDQUFBO0FBQUEsTUFHQSxDQUFBLElBQUksQ0FISixDQURGO0lBQUEsQ0FIQTtBQVFBLElBQUEsSUFBSSxHQUFBLEdBQU0sQ0FBVjtBQUNFLE1BQUEsRUFBQSxHQUFJLENBQUMsR0FBSSxDQUFBLENBQUEsQ0FBSixHQUFTLElBQVYsQ0FBQSxJQUFtQixDQUF2QixDQUFBO0FBQUEsTUFDQSxFQUFBLEdBQUksQ0FBQyxHQUFJLENBQUEsQ0FBQSxDQUFKLEdBQVMsSUFBVixDQUFBLElBQW1CLENBRHZCLENBQUE7QUFFQSxNQUFBLElBQUksR0FBQSxHQUFNLENBQVY7QUFDRSxRQUFBLEVBQUEsSUFBTSxDQUFDLEdBQUksQ0FBQSxFQUFBLENBQUEsQ0FBSixHQUFXLElBQVosQ0FBQSxJQUFxQixDQUEzQixDQURGO09BRkE7QUFBQSxNQUlBLEdBQUEsSUFBTSxJQUFJLENBQUMsS0FBTSxDQUFBLEVBQUEsQ0FKakIsQ0FBQTtBQUFBLE1BS0EsR0FBQSxJQUFNLElBQUksQ0FBQyxLQUFNLENBQUEsRUFBQSxDQUxqQixDQUFBO0FBTUEsTUFBQSxJQUFJLEdBQUEsS0FBTyxDQUFYO0FBQ0UsUUFBQSxFQUFBLEdBQUksQ0FBQyxHQUFJLENBQUEsQ0FBQSxFQUFBLENBQUosR0FBVyxJQUFaLENBQUEsSUFBcUIsQ0FBekIsQ0FBQTtBQUFBLFFBQ0EsRUFBQSxJQUFNLENBQUMsR0FBSSxDQUFBLENBQUEsQ0FBSixHQUFTLElBQVYsQ0FBQSxJQUFtQixDQUR6QixDQUFBO0FBQUEsUUFFQSxHQUFBLElBQU0sSUFBSSxDQUFDLEtBQU0sQ0FBQSxFQUFBLENBRmpCLENBREY7T0FOQTtBQVVBLE1BQUEsSUFBSSxHQUFBLEtBQU8sQ0FBWDtBQUNFLFFBQUEsR0FBQSxJQUFNLEdBQU4sQ0FERjtPQVZBO0FBQUEsTUFZQSxHQUFBLElBQU0sR0FaTixDQURGO0tBUkE7QUF1QkEsV0FBTyxHQUFQLENBeEJNO0VBQUEsQ0FOUixDQUFBOztvQkFBQTs7SUFKRixDQUFBOztBQUFBO0FBcUNlLEVBQUEsa0JBQUUsVUFBRixFQUFlLElBQWYsR0FBQTtBQUNYLElBRFksSUFBQyxDQUFBLGFBQUEsVUFDYixDQUFBO0FBQUEsSUFEeUIsSUFBQyxDQUFBLE9BQUEsSUFDMUIsQ0FBQTtBQUFBLElBQUEsSUFBQyxDQUFBLEdBQUQsR0FBTyxFQUFQLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxNQUFELEdBQ0U7QUFBQSxNQUFBLE9BQUEsRUFBZSxDQUFDLElBQUQsRUFBTSxJQUFOLEVBQVcsSUFBWCxFQUFnQixJQUFoQixDQUFmO0FBQUEsTUFDQSxTQUFBLEVBQWUsQ0FEZjtBQUFBLE1BRUEsTUFBQSxFQUFlLENBQUMsSUFBRCxFQUFNLElBQU4sRUFBVyxJQUFYLEVBQWdCLElBQWhCLENBRmY7QUFBQSxNQUdBLFdBQUEsRUFBZSxDQUFDLElBQUQsRUFBTSxJQUFOLEVBQVcsSUFBWCxFQUFnQixJQUFoQixDQUhmO0FBQUEsTUFJQSxhQUFBLEVBQWUsRUFKZjtBQUFBLE1BS0EsV0FBQSxFQUFlLENBTGY7QUFBQSxNQU1BLFdBQUEsRUFBZSxDQU5mO0FBQUEsTUFPQSxVQUFBLEVBQWUsSUFBQyxDQUFBLFVBUGhCO0FBQUEsTUFRQSxRQUFBLEVBQWUsQ0FSZjtBQUFBLE1BU0EsVUFBQSxFQUFlLENBVGY7QUFBQSxNQVVBLGFBQUEsRUFBZSxFQVZmO0FBQUEsTUFXQSxXQUFBLEVBQWUsQ0FBQyxJQUFELEVBQU0sSUFBTixFQUFXLElBQVgsRUFBZ0IsSUFBaEIsQ0FYZjtBQUFBLE1BWUEsYUFBQSxFQUFlLENBWmY7S0FGRixDQUFBO0FBQUEsSUFnQkEsSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQWhCQSxDQURXO0VBQUEsQ0FBYjs7QUFBQSxxQkFtQkEsVUFBQSxHQUFZLFNBQUMsQ0FBRCxHQUFBO0FBQ1YsV0FBTyxDQUFDLENBQUEsR0FBRSxJQUFILEVBQVMsQ0FBQyxDQUFBLElBQUcsQ0FBSixDQUFBLEdBQU8sSUFBaEIsRUFBc0IsQ0FBQyxDQUFBLElBQUcsRUFBSixDQUFBLEdBQVEsSUFBOUIsRUFBb0MsQ0FBQyxDQUFBLElBQUcsRUFBSixDQUFBLEdBQVEsSUFBNUMsQ0FBUCxDQURVO0VBQUEsQ0FuQlosQ0FBQTs7QUFBQSxxQkFzQkEsVUFBQSxHQUFZLFNBQUMsQ0FBRCxHQUFBO0FBQ1YsV0FBTyxDQUFDLENBQUEsR0FBRSxJQUFILEVBQVMsQ0FBQyxDQUFBLElBQUcsQ0FBSixDQUFBLEdBQU8sSUFBaEIsQ0FBUCxDQURVO0VBQUEsQ0F0QlosQ0FBQTs7QUFBQSxxQkF5QkEsZUFBQSxHQUFpQixTQUFDLElBQUQsR0FBQTtBQUNmLFFBQUEsZ0JBQUE7QUFBQSxJQUFBLENBQUEsR0FBSSxFQUFKLENBQUE7QUFBQSxJQUNBLENBQUEsR0FBSSxDQURKLENBQUE7QUFBQSxJQUVBLEdBQUEsR0FBTSxJQUFJLENBQUMsTUFGWCxDQUFBO0FBR0EsU0FBUyxzRUFBVCxHQUFBO0FBQ0UsTUFBQSxDQUFFLENBQUEsQ0FBQSxFQUFBLENBQUYsR0FBUyxJQUFLLENBQUEsQ0FBQSxDQUFMLEdBQVUsSUFBbkIsQ0FBQTtBQUFBLE1BQ0EsQ0FBRSxDQUFBLENBQUEsRUFBQSxDQUFGLEdBQVMsQ0FBQyxJQUFLLENBQUEsQ0FBQSxDQUFMLElBQVMsQ0FBVixDQUFBLEdBQWUsSUFEeEIsQ0FERjtBQUFBLEtBSEE7QUFPQSxXQUFPLENBQVAsQ0FSZTtFQUFBLENBekJqQixDQUFBOztBQUFBLHFCQW1DQSxRQUFBLEdBQVUsU0FBQSxHQUFBO0FBQ1IsUUFBQSxFQUFBO0FBQUEsSUFBQSxJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVIsR0FBcUIsQ0FBQyxJQUFDLENBQUEsTUFBTSxDQUFDLFdBQVIsR0FBc0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxhQUEvQixDQUFBLElBQWlELENBQXRFLENBQUE7QUFBQSxJQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUixHQUFtQixJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVIsR0FBcUIsSUFBQyxDQUFBLFVBRHpDLENBQUE7QUFBQSxJQUVBLElBQUMsQ0FBQSxNQUFNLENBQUMsYUFBUixHQUF3QixJQUFDLENBQUEsSUFBSSxDQUFDLE1BQU4sR0FBZSxDQUFDLElBQUMsQ0FBQSxNQUFNLENBQUMsYUFBUixJQUF5QixDQUExQixDQUZ2QyxDQUFBO0FBQUEsSUFHQSxJQUFDLENBQUEsTUFBTSxDQUFDLFNBQVIsR0FBb0IsRUFBQSxHQUFLLElBQUMsQ0FBQSxNQUFNLENBQUMsYUFIakMsQ0FBQTtBQUtBLElBQUEsSUFBRyxJQUFDLENBQUEsTUFBTSxDQUFDLGFBQVIsS0FBeUIsRUFBNUI7QUFDRSxNQUFBLElBQUMsQ0FBQSxJQUFELEdBQVEsSUFBQyxDQUFBLGVBQUQsQ0FBaUIsSUFBQyxDQUFBLElBQWxCLENBQVIsQ0FERjtLQUxBO0FBQUEsSUFRQSxJQUFDLENBQUEsR0FBRCxHQUFPLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQWhCLENBQ0wsSUFBQyxDQUFBLFVBQUQsQ0FBWSxJQUFDLENBQUEsTUFBTSxDQUFDLFNBQXBCLENBREssRUFFTCxJQUFDLENBQUEsTUFBTSxDQUFDLE1BRkgsRUFHTCxJQUFDLENBQUEsTUFBTSxDQUFDLFdBSEgsRUFJTCxJQUFDLENBQUEsVUFBRCxDQUFZLElBQUMsQ0FBQSxNQUFNLENBQUMsYUFBcEIsQ0FKSyxFQUtMLElBQUMsQ0FBQSxVQUFELENBQVksSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFwQixDQUxLLEVBTUwsSUFBQyxDQUFBLFVBQUQsQ0FBWSxJQUFDLENBQUEsTUFBTSxDQUFDLFdBQXBCLENBTkssRUFPTCxJQUFDLENBQUEsVUFBRCxDQUFZLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBcEIsQ0FQSyxFQVFMLElBQUMsQ0FBQSxVQUFELENBQVksSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFwQixDQVJLLEVBU0wsSUFBQyxDQUFBLFVBQUQsQ0FBWSxJQUFDLENBQUEsTUFBTSxDQUFDLFVBQXBCLENBVEssRUFVTCxJQUFDLENBQUEsVUFBRCxDQUFZLElBQUMsQ0FBQSxNQUFNLENBQUMsYUFBcEIsQ0FWSyxFQVdMLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FYSCxFQVlMLElBQUMsQ0FBQSxVQUFELENBQVksSUFBQyxDQUFBLE1BQU0sQ0FBQyxhQUFwQixDQVpLLEVBYUwsSUFBQyxDQUFBLElBYkksQ0FSUCxDQUFBO0FBQUEsSUF1QkEsRUFBQSxHQUFLLEdBQUEsQ0FBQSxVQXZCTCxDQUFBO0FBQUEsSUF3QkEsSUFBQyxDQUFBLFVBQUQsR0FBYyxFQUFFLENBQUMsTUFBSCxDQUFVLElBQUMsQ0FBQSxHQUFYLENBeEJkLENBQUE7V0F5QkEsSUFBQyxDQUFBLE9BQUQsR0FBVyx3QkFBQSxHQUEyQixJQUFDLENBQUEsV0ExQi9CO0VBQUEsQ0FuQ1YsQ0FBQTs7QUFBQSxxQkErREEsR0FBQSxHQUFLLFNBQUEsR0FBQTtBQUNILFdBQVcsSUFBQSxNQUFBLENBQU8sSUFBQyxDQUFBLFVBQVIsRUFBb0IsUUFBcEIsQ0FBWCxDQURHO0VBQUEsQ0EvREwsQ0FBQTs7a0JBQUE7O0lBckNGLENBQUE7O0FBQUEsUUF1R0EsR0FBVyxTQUFDLFFBQUQsRUFBVyxVQUFYLEVBQXVCLE9BQXZCLEdBQUE7QUFDVCxNQUFBLElBQUE7QUFBQSxFQUFBLElBQUEsR0FBVyxJQUFBLFFBQUEsQ0FBUyxVQUFULEVBQXFCLE9BQXJCLENBQVgsQ0FBQTtBQUFBLEVBQ0EsRUFBRSxDQUFDLGFBQUgsQ0FBaUIsUUFBakIsRUFBMkIsSUFBSSxDQUFDLEdBQUwsQ0FBQSxDQUEzQixDQURBLENBQUE7QUFFQSxTQUFPLElBQVAsQ0FIUztBQUFBLENBdkdYLENBQUE7O0FBQUEsV0E0R0EsR0FBYyxTQUFDLFVBQUQsRUFBYSxPQUFiLEdBQUE7QUFDWixNQUFBLElBQUE7QUFBQSxFQUFBLElBQUEsR0FBVyxJQUFBLFFBQUEsQ0FBUyxVQUFULEVBQXFCLE9BQXJCLENBQVgsQ0FBQTtBQUNBLFNBQU8sSUFBSSxDQUFDLE9BQVosQ0FGWTtBQUFBLENBNUdkLENBQUE7O0FBQUEsU0FnSEEsR0FBWSxTQUFDLE9BQUQsRUFBVSxXQUFWLEVBQXVCLFNBQXZCLEdBQUE7QUFDVixNQUFBLCtGQUFBO0FBQUEsRUFBQSxXQUFBLEdBQWMsV0FBQSxJQUFlLEVBQTdCLENBQUE7QUFBQSxFQUNBLFNBQUEsR0FBWSxTQUFBLElBQWEsR0FEekIsQ0FBQTtBQUFBLEVBR0EsY0FBQSxHQUFpQixJQUFBLENBQUssT0FBTCxDQUhqQixDQUFBO0FBQUEsRUFJQSxVQUFBLEdBQWEsRUFKYixDQUFBO0FBTUEsT0FBYyw4R0FBZCxHQUFBO0FBQ0UsSUFBQSxLQUFBLEdBQVEsY0FBYyxDQUFDLEtBQWYsQ0FBcUIsTUFBckIsRUFBNkIsTUFBQSxHQUFTLFNBQXRDLENBQVIsQ0FBQTtBQUFBLElBRUEsV0FBQSxHQUFrQixJQUFBLEtBQUEsQ0FBTSxLQUFLLENBQUMsTUFBWixDQUZsQixDQUFBO0FBR0EsU0FBUyxvR0FBVCxHQUFBO0FBQ0UsTUFBQSxXQUFZLENBQUEsQ0FBQSxDQUFaLEdBQWlCLEtBQUssQ0FBQyxVQUFOLENBQWlCLENBQWpCLENBQWpCLENBREY7QUFBQSxLQUhBO0FBQUEsSUFNQSxTQUFBLEdBQWdCLElBQUEsVUFBQSxDQUFXLFdBQVgsQ0FOaEIsQ0FBQTtBQUFBLElBUUEsVUFBVSxDQUFDLElBQVgsQ0FBZ0IsU0FBaEIsQ0FSQSxDQURGO0FBQUEsR0FOQTtBQUFBLEVBaUJBLElBQUEsR0FBVyxJQUFBLElBQUEsQ0FBSyxVQUFMLEVBQWlCO0FBQUEsSUFBQyxJQUFBLEVBQU0sV0FBUDtHQUFqQixDQWpCWCxDQUFBO0FBa0JBLFNBQU8sSUFBUCxDQW5CVTtBQUFBLENBaEhaLENBQUE7O0FBQUEsV0FxSUEsR0FBYyxTQUFDLFVBQUQsRUFBYSxPQUFiLEdBQUE7QUFDWixNQUFBLFVBQUE7QUFBQSxFQUFBLElBQUEsR0FBVyxJQUFBLFFBQUEsQ0FBUyxVQUFULEVBQXFCLE9BQXJCLENBQVgsQ0FBQTtBQUFBLEVBQ0EsSUFBQSxHQUFPLFNBQUEsQ0FBVSxJQUFJLENBQUMsVUFBZixFQUEyQixXQUEzQixDQURQLENBQUE7QUFFQSxTQUFPLEdBQUcsQ0FBQyxlQUFKLENBQW9CLElBQXBCLENBQVAsQ0FIWTtBQUFBLENBcklkLENBQUE7O0FBQUEsTUEwSU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxFQUFBLFFBQUEsRUFBVSxRQUFWO0FBQUEsRUFDQSxRQUFBLEVBQVUsUUFEVjtBQUFBLEVBRUEsV0FBQSxFQUFhLFdBRmI7QUFBQSxFQUdBLFdBQUEsRUFBYSxXQUhiO0NBM0lGLENBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiKGZ1bmN0aW9uIChCdWZmZXIpe1xuLy9cclxuLy8gakRhdGFWaWV3IGJ5IFZqZXV4IDx2amV1eHhAZ21haWwuY29tPiAtIEphbiAyMDEwXHJcbi8vIENvbnRpbnVlZCBieSBSUmV2ZXJzZXIgPG1lQHJyZXZlcnNlci5jb20+IC0gRmViIDIwMTNcclxuLy9cclxuLy8gQSB1bmlxdWUgd2F5IHRvIHdvcmsgd2l0aCBhIGJpbmFyeSBmaWxlIGluIHRoZSBicm93c2VyXHJcbi8vIGh0dHA6Ly9naXRodWIuY29tL2pEYXRhVmlldy9qRGF0YVZpZXdcclxuLy8gaHR0cDovL2pEYXRhVmlldy5naXRodWIuaW8vXHJcblxyXG4oZnVuY3Rpb24gKGdsb2JhbCkge1xyXG5cclxuJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyIGNvbXBhdGliaWxpdHkgPSB7XHJcblx0Ly8gTm9kZUpTIEJ1ZmZlciBpbiB2MC41LjUgYW5kIG5ld2VyXHJcblx0Tm9kZUJ1ZmZlcjogJ0J1ZmZlcicgaW4gZ2xvYmFsICYmICdyZWFkSW50MTZMRScgaW4gQnVmZmVyLnByb3RvdHlwZSxcclxuXHREYXRhVmlldzogJ0RhdGFWaWV3JyBpbiBnbG9iYWwgJiYgKFxyXG5cdFx0J2dldEZsb2F0NjQnIGluIERhdGFWaWV3LnByb3RvdHlwZSB8fCAgICAgICAgICAgIC8vIENocm9tZVxyXG5cdFx0J2dldEZsb2F0NjQnIGluIG5ldyBEYXRhVmlldyhuZXcgQXJyYXlCdWZmZXIoMSkpIC8vIE5vZGVcclxuXHQpLFxyXG5cdEFycmF5QnVmZmVyOiAnQXJyYXlCdWZmZXInIGluIGdsb2JhbCxcclxuXHRQaXhlbERhdGE6ICdDYW52YXNQaXhlbEFycmF5JyBpbiBnbG9iYWwgJiYgJ0ltYWdlRGF0YScgaW4gZ2xvYmFsICYmICdkb2N1bWVudCcgaW4gZ2xvYmFsXHJcbn07XHJcblxyXG4vLyB3ZSBkb24ndCB3YW50IHRvIGJvdGhlciB3aXRoIG9sZCBCdWZmZXIgaW1wbGVtZW50YXRpb25cclxuaWYgKGNvbXBhdGliaWxpdHkuTm9kZUJ1ZmZlcikge1xyXG5cdChmdW5jdGlvbiAoYnVmZmVyKSB7XHJcblx0XHR0cnkge1xyXG5cdFx0XHRidWZmZXIud3JpdGVGbG9hdExFKEluZmluaXR5LCAwKTtcclxuXHRcdH0gY2F0Y2ggKGUpIHtcclxuXHRcdFx0Y29tcGF0aWJpbGl0eS5Ob2RlQnVmZmVyID0gZmFsc2U7XHJcblx0XHR9XHJcblx0fSkobmV3IEJ1ZmZlcig0KSk7XHJcbn1cclxuXHJcbmlmIChjb21wYXRpYmlsaXR5LlBpeGVsRGF0YSkge1xyXG5cdHZhciBjcmVhdGVQaXhlbERhdGEgPSBmdW5jdGlvbiAoYnl0ZUxlbmd0aCwgYnVmZmVyKSB7XHJcblx0XHR2YXIgZGF0YSA9IGNyZWF0ZVBpeGVsRGF0YS5jb250ZXh0MmQuY3JlYXRlSW1hZ2VEYXRhKChieXRlTGVuZ3RoICsgMykgLyA0LCAxKS5kYXRhO1xyXG5cdFx0ZGF0YS5ieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aDtcclxuXHRcdGlmIChidWZmZXIgIT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGJ5dGVMZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdGRhdGFbaV0gPSBidWZmZXJbaV07XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdHJldHVybiBkYXRhO1xyXG5cdH07XHJcblx0Y3JlYXRlUGl4ZWxEYXRhLmNvbnRleHQyZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpLmdldENvbnRleHQoJzJkJyk7XHJcbn1cclxuXHJcbnZhciBkYXRhVHlwZXMgPSB7XHJcblx0J0ludDgnOiAxLFxyXG5cdCdJbnQxNic6IDIsXHJcblx0J0ludDMyJzogNCxcclxuXHQnVWludDgnOiAxLFxyXG5cdCdVaW50MTYnOiAyLFxyXG5cdCdVaW50MzInOiA0LFxyXG5cdCdGbG9hdDMyJzogNCxcclxuXHQnRmxvYXQ2NCc6IDhcclxufTtcclxuXHJcbnZhciBub2RlTmFtaW5nID0ge1xyXG5cdCdJbnQ4JzogJ0ludDgnLFxyXG5cdCdJbnQxNic6ICdJbnQxNicsXHJcblx0J0ludDMyJzogJ0ludDMyJyxcclxuXHQnVWludDgnOiAnVUludDgnLFxyXG5cdCdVaW50MTYnOiAnVUludDE2JyxcclxuXHQnVWludDMyJzogJ1VJbnQzMicsXHJcblx0J0Zsb2F0MzInOiAnRmxvYXQnLFxyXG5cdCdGbG9hdDY0JzogJ0RvdWJsZSdcclxufTtcclxuXHJcbmZ1bmN0aW9uIGFycmF5RnJvbShhcnJheUxpa2UsIGZvcmNlQ29weSkge1xyXG5cdHJldHVybiAoIWZvcmNlQ29weSAmJiAoYXJyYXlMaWtlIGluc3RhbmNlb2YgQXJyYXkpKSA/IGFycmF5TGlrZSA6IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFycmF5TGlrZSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRlZmluZWQodmFsdWUsIGRlZmF1bHRWYWx1ZSkge1xyXG5cdHJldHVybiB2YWx1ZSAhPT0gdW5kZWZpbmVkID8gdmFsdWUgOiBkZWZhdWx0VmFsdWU7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGpEYXRhVmlldyhidWZmZXIsIGJ5dGVPZmZzZXQsIGJ5dGVMZW5ndGgsIGxpdHRsZUVuZGlhbikge1xyXG5cdC8qIGpzaGludCB2YWxpZHRoaXM6dHJ1ZSAqL1xyXG5cclxuXHRpZiAoYnVmZmVyIGluc3RhbmNlb2YgakRhdGFWaWV3KSB7XHJcblx0XHR2YXIgcmVzdWx0ID0gYnVmZmVyLnNsaWNlKGJ5dGVPZmZzZXQsIGJ5dGVPZmZzZXQgKyBieXRlTGVuZ3RoKTtcclxuXHRcdHJlc3VsdC5fbGl0dGxlRW5kaWFuID0gZGVmaW5lZChsaXR0bGVFbmRpYW4sIHJlc3VsdC5fbGl0dGxlRW5kaWFuKTtcclxuXHRcdHJldHVybiByZXN1bHQ7XHJcblx0fVxyXG5cclxuXHRpZiAoISh0aGlzIGluc3RhbmNlb2YgakRhdGFWaWV3KSkge1xyXG5cdFx0cmV0dXJuIG5ldyBqRGF0YVZpZXcoYnVmZmVyLCBieXRlT2Zmc2V0LCBieXRlTGVuZ3RoLCBsaXR0bGVFbmRpYW4pO1xyXG5cdH1cclxuXHJcblx0dGhpcy5idWZmZXIgPSBidWZmZXIgPSBqRGF0YVZpZXcud3JhcEJ1ZmZlcihidWZmZXIpO1xyXG5cclxuXHQvLyBDaGVjayBwYXJhbWV0ZXJzIGFuZCBleGlzdGluZyBmdW5jdGlvbm5hbGl0aWVzXHJcblx0dGhpcy5faXNBcnJheUJ1ZmZlciA9IGNvbXBhdGliaWxpdHkuQXJyYXlCdWZmZXIgJiYgYnVmZmVyIGluc3RhbmNlb2YgQXJyYXlCdWZmZXI7XHJcblx0dGhpcy5faXNQaXhlbERhdGEgPSBjb21wYXRpYmlsaXR5LlBpeGVsRGF0YSAmJiBidWZmZXIgaW5zdGFuY2VvZiBDYW52YXNQaXhlbEFycmF5O1xyXG5cdHRoaXMuX2lzRGF0YVZpZXcgPSBjb21wYXRpYmlsaXR5LkRhdGFWaWV3ICYmIHRoaXMuX2lzQXJyYXlCdWZmZXI7XHJcblx0dGhpcy5faXNOb2RlQnVmZmVyID0gY29tcGF0aWJpbGl0eS5Ob2RlQnVmZmVyICYmIGJ1ZmZlciBpbnN0YW5jZW9mIEJ1ZmZlcjtcclxuXHJcblx0Ly8gSGFuZGxlIFR5cGUgRXJyb3JzXHJcblx0aWYgKCF0aGlzLl9pc05vZGVCdWZmZXIgJiYgIXRoaXMuX2lzQXJyYXlCdWZmZXIgJiYgIXRoaXMuX2lzUGl4ZWxEYXRhICYmICEoYnVmZmVyIGluc3RhbmNlb2YgQXJyYXkpKSB7XHJcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdqRGF0YVZpZXcgYnVmZmVyIGhhcyBhbiBpbmNvbXBhdGlibGUgdHlwZScpO1xyXG5cdH1cclxuXHJcblx0Ly8gRGVmYXVsdCBWYWx1ZXNcclxuXHR0aGlzLl9saXR0bGVFbmRpYW4gPSAhIWxpdHRsZUVuZGlhbjtcclxuXHJcblx0dmFyIGJ1ZmZlckxlbmd0aCA9ICdieXRlTGVuZ3RoJyBpbiBidWZmZXIgPyBidWZmZXIuYnl0ZUxlbmd0aCA6IGJ1ZmZlci5sZW5ndGg7XHJcblx0dGhpcy5ieXRlT2Zmc2V0ID0gYnl0ZU9mZnNldCA9IGRlZmluZWQoYnl0ZU9mZnNldCwgMCk7XHJcblx0dGhpcy5ieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCA9IGRlZmluZWQoYnl0ZUxlbmd0aCwgYnVmZmVyTGVuZ3RoIC0gYnl0ZU9mZnNldCk7XHJcblxyXG5cdGlmICghdGhpcy5faXNEYXRhVmlldykge1xyXG5cdFx0dGhpcy5fY2hlY2tCb3VuZHMoYnl0ZU9mZnNldCwgYnl0ZUxlbmd0aCwgYnVmZmVyTGVuZ3RoKTtcclxuXHR9IGVsc2Uge1xyXG5cdFx0dGhpcy5fdmlldyA9IG5ldyBEYXRhVmlldyhidWZmZXIsIGJ5dGVPZmZzZXQsIGJ5dGVMZW5ndGgpO1xyXG5cdH1cclxuXHJcblx0Ly8gQ3JlYXRlIHVuaWZvcm0gbWV0aG9kcyAoYWN0aW9uIHdyYXBwZXJzKSBmb3IgdGhlIGZvbGxvd2luZyBkYXRhIHR5cGVzXHJcblxyXG5cdHRoaXMuX2VuZ2luZUFjdGlvbiA9XHJcblx0XHR0aGlzLl9pc0RhdGFWaWV3XHJcblx0XHRcdD8gdGhpcy5fZGF0YVZpZXdBY3Rpb25cclxuXHRcdDogdGhpcy5faXNOb2RlQnVmZmVyXHJcblx0XHRcdD8gdGhpcy5fbm9kZUJ1ZmZlckFjdGlvblxyXG5cdFx0OiB0aGlzLl9pc0FycmF5QnVmZmVyXHJcblx0XHRcdD8gdGhpcy5fYXJyYXlCdWZmZXJBY3Rpb25cclxuXHRcdDogdGhpcy5fYXJyYXlBY3Rpb247XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldENoYXJDb2RlcyhzdHJpbmcpIHtcclxuXHRpZiAoY29tcGF0aWJpbGl0eS5Ob2RlQnVmZmVyKSB7XHJcblx0XHRyZXR1cm4gbmV3IEJ1ZmZlcihzdHJpbmcsICdiaW5hcnknKTtcclxuXHR9XHJcblxyXG5cdHZhciBUeXBlID0gY29tcGF0aWJpbGl0eS5BcnJheUJ1ZmZlciA/IFVpbnQ4QXJyYXkgOiBBcnJheSxcclxuXHRcdGNvZGVzID0gbmV3IFR5cGUoc3RyaW5nLmxlbmd0aCk7XHJcblxyXG5cdGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBzdHJpbmcubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuXHRcdGNvZGVzW2ldID0gc3RyaW5nLmNoYXJDb2RlQXQoaSkgJiAweGZmO1xyXG5cdH1cclxuXHRyZXR1cm4gY29kZXM7XHJcbn1cclxuXHJcbi8vIG1vc3RseSBpbnRlcm5hbCBmdW5jdGlvbiBmb3Igd3JhcHBpbmcgYW55IHN1cHBvcnRlZCBpbnB1dCAoU3RyaW5nIG9yIEFycmF5LWxpa2UpIHRvIGJlc3Qgc3VpdGFibGUgYnVmZmVyIGZvcm1hdFxyXG5qRGF0YVZpZXcud3JhcEJ1ZmZlciA9IGZ1bmN0aW9uIChidWZmZXIpIHtcclxuXHRzd2l0Y2ggKHR5cGVvZiBidWZmZXIpIHtcclxuXHRcdGNhc2UgJ251bWJlcic6XHJcblx0XHRcdGlmIChjb21wYXRpYmlsaXR5Lk5vZGVCdWZmZXIpIHtcclxuXHRcdFx0XHRidWZmZXIgPSBuZXcgQnVmZmVyKGJ1ZmZlcik7XHJcblx0XHRcdFx0YnVmZmVyLmZpbGwoMCk7XHJcblx0XHRcdH0gZWxzZVxyXG5cdFx0XHRpZiAoY29tcGF0aWJpbGl0eS5BcnJheUJ1ZmZlcikge1xyXG5cdFx0XHRcdGJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcikuYnVmZmVyO1xyXG5cdFx0XHR9IGVsc2VcclxuXHRcdFx0aWYgKGNvbXBhdGliaWxpdHkuUGl4ZWxEYXRhKSB7XHJcblx0XHRcdFx0YnVmZmVyID0gY3JlYXRlUGl4ZWxEYXRhKGJ1ZmZlcik7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0YnVmZmVyID0gbmV3IEFycmF5KGJ1ZmZlcik7XHJcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBidWZmZXIubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRcdGJ1ZmZlcltpXSA9IDA7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiBidWZmZXI7XHJcblxyXG5cdFx0Y2FzZSAnc3RyaW5nJzpcclxuXHRcdFx0YnVmZmVyID0gZ2V0Q2hhckNvZGVzKGJ1ZmZlcik7XHJcblx0XHRcdC8qIGZhbGxzIHRocm91Z2ggKi9cclxuXHRcdGRlZmF1bHQ6XHJcblx0XHRcdGlmICgnbGVuZ3RoJyBpbiBidWZmZXIgJiYgISgoY29tcGF0aWJpbGl0eS5Ob2RlQnVmZmVyICYmIGJ1ZmZlciBpbnN0YW5jZW9mIEJ1ZmZlcikgfHwgKGNvbXBhdGliaWxpdHkuQXJyYXlCdWZmZXIgJiYgYnVmZmVyIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpIHx8IChjb21wYXRpYmlsaXR5LlBpeGVsRGF0YSAmJiBidWZmZXIgaW5zdGFuY2VvZiBDYW52YXNQaXhlbEFycmF5KSkpIHtcclxuXHRcdFx0XHRpZiAoY29tcGF0aWJpbGl0eS5Ob2RlQnVmZmVyKSB7XHJcblx0XHRcdFx0XHRidWZmZXIgPSBuZXcgQnVmZmVyKGJ1ZmZlcik7XHJcblx0XHRcdFx0fSBlbHNlXHJcblx0XHRcdFx0aWYgKGNvbXBhdGliaWxpdHkuQXJyYXlCdWZmZXIpIHtcclxuXHRcdFx0XHRcdGlmICghKGJ1ZmZlciBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKSkge1xyXG5cdFx0XHRcdFx0XHRidWZmZXIgPSBuZXcgVWludDhBcnJheShidWZmZXIpLmJ1ZmZlcjtcclxuXHRcdFx0XHRcdFx0Ly8gYnVnIGluIE5vZGUuanMgPD0gMC44OlxyXG5cdFx0XHRcdFx0XHRpZiAoIShidWZmZXIgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikpIHtcclxuXHRcdFx0XHRcdFx0XHRidWZmZXIgPSBuZXcgVWludDhBcnJheShhcnJheUZyb20oYnVmZmVyLCB0cnVlKSkuYnVmZmVyO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fSBlbHNlXHJcblx0XHRcdFx0aWYgKGNvbXBhdGliaWxpdHkuUGl4ZWxEYXRhKSB7XHJcblx0XHRcdFx0XHRidWZmZXIgPSBjcmVhdGVQaXhlbERhdGEoYnVmZmVyLmxlbmd0aCwgYnVmZmVyKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0YnVmZmVyID0gYXJyYXlGcm9tKGJ1ZmZlcik7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiBidWZmZXI7XHJcblx0fVxyXG59O1xyXG5cclxuZnVuY3Rpb24gcG93MihuKSB7XHJcblx0cmV0dXJuIChuID49IDAgJiYgbiA8IDMxKSA/ICgxIDw8IG4pIDogKHBvdzJbbl0gfHwgKHBvdzJbbl0gPSBNYXRoLnBvdygyLCBuKSkpO1xyXG59XHJcblxyXG4vLyBsZWZ0IGZvciBiYWNrd2FyZCBjb21wYXRpYmlsaXR5XHJcbmpEYXRhVmlldy5jcmVhdGVCdWZmZXIgPSBmdW5jdGlvbiAoKSB7XHJcblx0cmV0dXJuIGpEYXRhVmlldy53cmFwQnVmZmVyKGFyZ3VtZW50cyk7XHJcbn07XHJcblxyXG5mdW5jdGlvbiBVaW50NjQobG8sIGhpKSB7XHJcblx0dGhpcy5sbyA9IGxvO1xyXG5cdHRoaXMuaGkgPSBoaTtcclxufVxyXG5cclxuakRhdGFWaWV3LlVpbnQ2NCA9IFVpbnQ2NDtcclxuXHJcblVpbnQ2NC5wcm90b3R5cGUgPSB7XHJcblx0dmFsdWVPZjogZnVuY3Rpb24gKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMubG8gKyBwb3cyKDMyKSAqIHRoaXMuaGk7XHJcblx0fSxcclxuXHJcblx0dG9TdHJpbmc6IGZ1bmN0aW9uICgpIHtcclxuXHRcdHJldHVybiBOdW1iZXIucHJvdG90eXBlLnRvU3RyaW5nLmFwcGx5KHRoaXMudmFsdWVPZigpLCBhcmd1bWVudHMpO1xyXG5cdH1cclxufTtcclxuXHJcblVpbnQ2NC5mcm9tTnVtYmVyID0gZnVuY3Rpb24gKG51bWJlcikge1xyXG5cdHZhciBoaSA9IE1hdGguZmxvb3IobnVtYmVyIC8gcG93MigzMikpLFxyXG5cdFx0bG8gPSBudW1iZXIgLSBoaSAqIHBvdzIoMzIpO1xyXG5cclxuXHRyZXR1cm4gbmV3IFVpbnQ2NChsbywgaGkpO1xyXG59O1xyXG5cclxuZnVuY3Rpb24gSW50NjQobG8sIGhpKSB7XHJcblx0VWludDY0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbn1cclxuXHJcbmpEYXRhVmlldy5JbnQ2NCA9IEludDY0O1xyXG5cclxuSW50NjQucHJvdG90eXBlID0gJ2NyZWF0ZScgaW4gT2JqZWN0ID8gT2JqZWN0LmNyZWF0ZShVaW50NjQucHJvdG90eXBlKSA6IG5ldyBVaW50NjQoKTtcclxuXHJcbkludDY0LnByb3RvdHlwZS52YWx1ZU9mID0gZnVuY3Rpb24gKCkge1xyXG5cdGlmICh0aGlzLmhpIDwgcG93MigzMSkpIHtcclxuXHRcdHJldHVybiBVaW50NjQucHJvdG90eXBlLnZhbHVlT2YuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuXHR9XHJcblx0cmV0dXJuIC0oKHBvdzIoMzIpIC0gdGhpcy5sbykgKyBwb3cyKDMyKSAqIChwb3cyKDMyKSAtIDEgLSB0aGlzLmhpKSk7XHJcbn07XHJcblxyXG5JbnQ2NC5mcm9tTnVtYmVyID0gZnVuY3Rpb24gKG51bWJlcikge1xyXG5cdHZhciBsbywgaGk7XHJcblx0aWYgKG51bWJlciA+PSAwKSB7XHJcblx0XHR2YXIgdW5zaWduZWQgPSBVaW50NjQuZnJvbU51bWJlcihudW1iZXIpO1xyXG5cdFx0bG8gPSB1bnNpZ25lZC5sbztcclxuXHRcdGhpID0gdW5zaWduZWQuaGk7XHJcblx0fSBlbHNlIHtcclxuXHRcdGhpID0gTWF0aC5mbG9vcihudW1iZXIgLyBwb3cyKDMyKSk7XHJcblx0XHRsbyA9IG51bWJlciAtIGhpICogcG93MigzMik7XHJcblx0XHRoaSArPSBwb3cyKDMyKTtcclxuXHR9XHJcblx0cmV0dXJuIG5ldyBJbnQ2NChsbywgaGkpO1xyXG59O1xyXG5cclxuakRhdGFWaWV3LnByb3RvdHlwZSA9IHtcclxuXHRfb2Zmc2V0OiAwLFxyXG5cdF9iaXRPZmZzZXQ6IDAsXHJcblxyXG5cdGNvbXBhdGliaWxpdHk6IGNvbXBhdGliaWxpdHksXHJcblxyXG5cdF9jaGVja0JvdW5kczogZnVuY3Rpb24gKGJ5dGVPZmZzZXQsIGJ5dGVMZW5ndGgsIG1heExlbmd0aCkge1xyXG5cdFx0Ly8gRG8gYWRkaXRpb25hbCBjaGVja3MgdG8gc2ltdWxhdGUgRGF0YVZpZXdcclxuXHRcdGlmICh0eXBlb2YgYnl0ZU9mZnNldCAhPT0gJ251bWJlcicpIHtcclxuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignT2Zmc2V0IGlzIG5vdCBhIG51bWJlci4nKTtcclxuXHRcdH1cclxuXHRcdGlmICh0eXBlb2YgYnl0ZUxlbmd0aCAhPT0gJ251bWJlcicpIHtcclxuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignU2l6ZSBpcyBub3QgYSBudW1iZXIuJyk7XHJcblx0XHR9XHJcblx0XHRpZiAoYnl0ZUxlbmd0aCA8IDApIHtcclxuXHRcdFx0dGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0xlbmd0aCBpcyBuZWdhdGl2ZS4nKTtcclxuXHRcdH1cclxuXHRcdGlmIChieXRlT2Zmc2V0IDwgMCB8fCBieXRlT2Zmc2V0ICsgYnl0ZUxlbmd0aCA+IGRlZmluZWQobWF4TGVuZ3RoLCB0aGlzLmJ5dGVMZW5ndGgpKSB7XHJcblx0XHRcdHRocm93IG5ldyBSYW5nZUVycm9yKCdPZmZzZXRzIGFyZSBvdXQgb2YgYm91bmRzLicpO1xyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdF9hY3Rpb246IGZ1bmN0aW9uICh0eXBlLCBpc1JlYWRBY3Rpb24sIGJ5dGVPZmZzZXQsIGxpdHRsZUVuZGlhbiwgdmFsdWUpIHtcclxuXHRcdHJldHVybiB0aGlzLl9lbmdpbmVBY3Rpb24oXHJcblx0XHRcdHR5cGUsXHJcblx0XHRcdGlzUmVhZEFjdGlvbixcclxuXHRcdFx0ZGVmaW5lZChieXRlT2Zmc2V0LCB0aGlzLl9vZmZzZXQpLFxyXG5cdFx0XHRkZWZpbmVkKGxpdHRsZUVuZGlhbiwgdGhpcy5fbGl0dGxlRW5kaWFuKSxcclxuXHRcdFx0dmFsdWVcclxuXHRcdCk7XHJcblx0fSxcclxuXHJcblx0X2RhdGFWaWV3QWN0aW9uOiBmdW5jdGlvbiAodHlwZSwgaXNSZWFkQWN0aW9uLCBieXRlT2Zmc2V0LCBsaXR0bGVFbmRpYW4sIHZhbHVlKSB7XHJcblx0XHQvLyBNb3ZlIHRoZSBpbnRlcm5hbCBvZmZzZXQgZm9yd2FyZFxyXG5cdFx0dGhpcy5fb2Zmc2V0ID0gYnl0ZU9mZnNldCArIGRhdGFUeXBlc1t0eXBlXTtcclxuXHRcdHJldHVybiBpc1JlYWRBY3Rpb24gPyB0aGlzLl92aWV3WydnZXQnICsgdHlwZV0oYnl0ZU9mZnNldCwgbGl0dGxlRW5kaWFuKSA6IHRoaXMuX3ZpZXdbJ3NldCcgKyB0eXBlXShieXRlT2Zmc2V0LCB2YWx1ZSwgbGl0dGxlRW5kaWFuKTtcclxuXHR9LFxyXG5cclxuXHRfbm9kZUJ1ZmZlckFjdGlvbjogZnVuY3Rpb24gKHR5cGUsIGlzUmVhZEFjdGlvbiwgYnl0ZU9mZnNldCwgbGl0dGxlRW5kaWFuLCB2YWx1ZSkge1xyXG5cdFx0Ly8gTW92ZSB0aGUgaW50ZXJuYWwgb2Zmc2V0IGZvcndhcmRcclxuXHRcdHRoaXMuX29mZnNldCA9IGJ5dGVPZmZzZXQgKyBkYXRhVHlwZXNbdHlwZV07XHJcblx0XHR2YXIgbm9kZU5hbWUgPSBub2RlTmFtaW5nW3R5cGVdICsgKCh0eXBlID09PSAnSW50OCcgfHwgdHlwZSA9PT0gJ1VpbnQ4JykgPyAnJyA6IGxpdHRsZUVuZGlhbiA/ICdMRScgOiAnQkUnKTtcclxuXHRcdGJ5dGVPZmZzZXQgKz0gdGhpcy5ieXRlT2Zmc2V0O1xyXG5cdFx0cmV0dXJuIGlzUmVhZEFjdGlvbiA/IHRoaXMuYnVmZmVyWydyZWFkJyArIG5vZGVOYW1lXShieXRlT2Zmc2V0KSA6IHRoaXMuYnVmZmVyWyd3cml0ZScgKyBub2RlTmFtZV0odmFsdWUsIGJ5dGVPZmZzZXQpO1xyXG5cdH0sXHJcblxyXG5cdF9hcnJheUJ1ZmZlckFjdGlvbjogZnVuY3Rpb24gKHR5cGUsIGlzUmVhZEFjdGlvbiwgYnl0ZU9mZnNldCwgbGl0dGxlRW5kaWFuLCB2YWx1ZSkge1xyXG5cdFx0dmFyIHNpemUgPSBkYXRhVHlwZXNbdHlwZV0sIFR5cGVkQXJyYXkgPSBnbG9iYWxbdHlwZSArICdBcnJheSddLCB0eXBlZEFycmF5O1xyXG5cclxuXHRcdGxpdHRsZUVuZGlhbiA9IGRlZmluZWQobGl0dGxlRW5kaWFuLCB0aGlzLl9saXR0bGVFbmRpYW4pO1xyXG5cclxuXHRcdC8vIEFycmF5QnVmZmVyOiB3ZSB1c2UgYSB0eXBlZCBhcnJheSBvZiBzaXplIDEgZnJvbSBvcmlnaW5hbCBidWZmZXIgaWYgYWxpZ25tZW50IGlzIGdvb2QgYW5kIGZyb20gc2xpY2Ugd2hlbiBpdCdzIG5vdFxyXG5cdFx0aWYgKHNpemUgPT09IDEgfHwgKCh0aGlzLmJ5dGVPZmZzZXQgKyBieXRlT2Zmc2V0KSAlIHNpemUgPT09IDAgJiYgbGl0dGxlRW5kaWFuKSkge1xyXG5cdFx0XHR0eXBlZEFycmF5ID0gbmV3IFR5cGVkQXJyYXkodGhpcy5idWZmZXIsIHRoaXMuYnl0ZU9mZnNldCArIGJ5dGVPZmZzZXQsIDEpO1xyXG5cdFx0XHR0aGlzLl9vZmZzZXQgPSBieXRlT2Zmc2V0ICsgc2l6ZTtcclxuXHRcdFx0cmV0dXJuIGlzUmVhZEFjdGlvbiA/IHR5cGVkQXJyYXlbMF0gOiAodHlwZWRBcnJheVswXSA9IHZhbHVlKTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHZhciBieXRlcyA9IG5ldyBVaW50OEFycmF5KGlzUmVhZEFjdGlvbiA/IHRoaXMuZ2V0Qnl0ZXMoc2l6ZSwgYnl0ZU9mZnNldCwgbGl0dGxlRW5kaWFuLCB0cnVlKSA6IHNpemUpO1xyXG5cdFx0XHR0eXBlZEFycmF5ID0gbmV3IFR5cGVkQXJyYXkoYnl0ZXMuYnVmZmVyLCAwLCAxKTtcclxuXHJcblx0XHRcdGlmIChpc1JlYWRBY3Rpb24pIHtcclxuXHRcdFx0XHRyZXR1cm4gdHlwZWRBcnJheVswXTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHR0eXBlZEFycmF5WzBdID0gdmFsdWU7XHJcblx0XHRcdFx0dGhpcy5fc2V0Qnl0ZXMoYnl0ZU9mZnNldCwgYnl0ZXMsIGxpdHRsZUVuZGlhbik7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRfYXJyYXlBY3Rpb246IGZ1bmN0aW9uICh0eXBlLCBpc1JlYWRBY3Rpb24sIGJ5dGVPZmZzZXQsIGxpdHRsZUVuZGlhbiwgdmFsdWUpIHtcclxuXHRcdHJldHVybiBpc1JlYWRBY3Rpb24gPyB0aGlzWydfZ2V0JyArIHR5cGVdKGJ5dGVPZmZzZXQsIGxpdHRsZUVuZGlhbikgOiB0aGlzWydfc2V0JyArIHR5cGVdKGJ5dGVPZmZzZXQsIHZhbHVlLCBsaXR0bGVFbmRpYW4pO1xyXG5cdH0sXHJcblxyXG5cdC8vIEhlbHBlcnNcclxuXHJcblx0X2dldEJ5dGVzOiBmdW5jdGlvbiAobGVuZ3RoLCBieXRlT2Zmc2V0LCBsaXR0bGVFbmRpYW4pIHtcclxuXHRcdGxpdHRsZUVuZGlhbiA9IGRlZmluZWQobGl0dGxlRW5kaWFuLCB0aGlzLl9saXR0bGVFbmRpYW4pO1xyXG5cdFx0Ynl0ZU9mZnNldCA9IGRlZmluZWQoYnl0ZU9mZnNldCwgdGhpcy5fb2Zmc2V0KTtcclxuXHRcdGxlbmd0aCA9IGRlZmluZWQobGVuZ3RoLCB0aGlzLmJ5dGVMZW5ndGggLSBieXRlT2Zmc2V0KTtcclxuXHJcblx0XHR0aGlzLl9jaGVja0JvdW5kcyhieXRlT2Zmc2V0LCBsZW5ndGgpO1xyXG5cclxuXHRcdGJ5dGVPZmZzZXQgKz0gdGhpcy5ieXRlT2Zmc2V0O1xyXG5cclxuXHRcdHRoaXMuX29mZnNldCA9IGJ5dGVPZmZzZXQgLSB0aGlzLmJ5dGVPZmZzZXQgKyBsZW5ndGg7XHJcblxyXG5cdFx0dmFyIHJlc3VsdCA9IHRoaXMuX2lzQXJyYXlCdWZmZXJcclxuXHRcdFx0XHRcdCA/IG5ldyBVaW50OEFycmF5KHRoaXMuYnVmZmVyLCBieXRlT2Zmc2V0LCBsZW5ndGgpXHJcblx0XHRcdFx0XHQgOiAodGhpcy5idWZmZXIuc2xpY2UgfHwgQXJyYXkucHJvdG90eXBlLnNsaWNlKS5jYWxsKHRoaXMuYnVmZmVyLCBieXRlT2Zmc2V0LCBieXRlT2Zmc2V0ICsgbGVuZ3RoKTtcclxuXHJcblx0XHRyZXR1cm4gbGl0dGxlRW5kaWFuIHx8IGxlbmd0aCA8PSAxID8gcmVzdWx0IDogYXJyYXlGcm9tKHJlc3VsdCkucmV2ZXJzZSgpO1xyXG5cdH0sXHJcblxyXG5cdC8vIHdyYXBwZXIgZm9yIGV4dGVybmFsIGNhbGxzIChkbyBub3QgcmV0dXJuIGlubmVyIGJ1ZmZlciBkaXJlY3RseSB0byBwcmV2ZW50IGl0J3MgbW9kaWZ5aW5nKVxyXG5cdGdldEJ5dGVzOiBmdW5jdGlvbiAobGVuZ3RoLCBieXRlT2Zmc2V0LCBsaXR0bGVFbmRpYW4sIHRvQXJyYXkpIHtcclxuXHRcdHZhciByZXN1bHQgPSB0aGlzLl9nZXRCeXRlcyhsZW5ndGgsIGJ5dGVPZmZzZXQsIGRlZmluZWQobGl0dGxlRW5kaWFuLCB0cnVlKSk7XHJcblx0XHRyZXR1cm4gdG9BcnJheSA/IGFycmF5RnJvbShyZXN1bHQpIDogcmVzdWx0O1xyXG5cdH0sXHJcblxyXG5cdF9zZXRCeXRlczogZnVuY3Rpb24gKGJ5dGVPZmZzZXQsIGJ5dGVzLCBsaXR0bGVFbmRpYW4pIHtcclxuXHRcdHZhciBsZW5ndGggPSBieXRlcy5sZW5ndGg7XHJcblxyXG5cdFx0Ly8gbmVlZGVkIGZvciBPcGVyYVxyXG5cdFx0aWYgKGxlbmd0aCA9PT0gMCkge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0bGl0dGxlRW5kaWFuID0gZGVmaW5lZChsaXR0bGVFbmRpYW4sIHRoaXMuX2xpdHRsZUVuZGlhbik7XHJcblx0XHRieXRlT2Zmc2V0ID0gZGVmaW5lZChieXRlT2Zmc2V0LCB0aGlzLl9vZmZzZXQpO1xyXG5cclxuXHRcdHRoaXMuX2NoZWNrQm91bmRzKGJ5dGVPZmZzZXQsIGxlbmd0aCk7XHJcblxyXG5cdFx0aWYgKCFsaXR0bGVFbmRpYW4gJiYgbGVuZ3RoID4gMSkge1xyXG5cdFx0XHRieXRlcyA9IGFycmF5RnJvbShieXRlcywgdHJ1ZSkucmV2ZXJzZSgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGJ5dGVPZmZzZXQgKz0gdGhpcy5ieXRlT2Zmc2V0O1xyXG5cclxuXHRcdGlmICh0aGlzLl9pc0FycmF5QnVmZmVyKSB7XHJcblx0XHRcdG5ldyBVaW50OEFycmF5KHRoaXMuYnVmZmVyLCBieXRlT2Zmc2V0LCBsZW5ndGgpLnNldChieXRlcyk7XHJcblx0XHR9XHJcblx0XHRlbHNlIHtcclxuXHRcdFx0aWYgKHRoaXMuX2lzTm9kZUJ1ZmZlcikge1xyXG5cdFx0XHRcdG5ldyBCdWZmZXIoYnl0ZXMpLmNvcHkodGhpcy5idWZmZXIsIGJ5dGVPZmZzZXQpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRcdHRoaXMuYnVmZmVyW2J5dGVPZmZzZXQgKyBpXSA9IGJ5dGVzW2ldO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuX29mZnNldCA9IGJ5dGVPZmZzZXQgLSB0aGlzLmJ5dGVPZmZzZXQgKyBsZW5ndGg7XHJcblx0fSxcclxuXHJcblx0c2V0Qnl0ZXM6IGZ1bmN0aW9uIChieXRlT2Zmc2V0LCBieXRlcywgbGl0dGxlRW5kaWFuKSB7XHJcblx0XHR0aGlzLl9zZXRCeXRlcyhieXRlT2Zmc2V0LCBieXRlcywgZGVmaW5lZChsaXR0bGVFbmRpYW4sIHRydWUpKTtcclxuXHR9LFxyXG5cclxuXHRnZXRTdHJpbmc6IGZ1bmN0aW9uIChieXRlTGVuZ3RoLCBieXRlT2Zmc2V0LCBlbmNvZGluZykge1xyXG5cdFx0aWYgKHRoaXMuX2lzTm9kZUJ1ZmZlcikge1xyXG5cdFx0XHRieXRlT2Zmc2V0ID0gZGVmaW5lZChieXRlT2Zmc2V0LCB0aGlzLl9vZmZzZXQpO1xyXG5cdFx0XHRieXRlTGVuZ3RoID0gZGVmaW5lZChieXRlTGVuZ3RoLCB0aGlzLmJ5dGVMZW5ndGggLSBieXRlT2Zmc2V0KTtcclxuXHJcblx0XHRcdHRoaXMuX2NoZWNrQm91bmRzKGJ5dGVPZmZzZXQsIGJ5dGVMZW5ndGgpO1xyXG5cclxuXHRcdFx0dGhpcy5fb2Zmc2V0ID0gYnl0ZU9mZnNldCArIGJ5dGVMZW5ndGg7XHJcblx0XHRcdHJldHVybiB0aGlzLmJ1ZmZlci50b1N0cmluZyhlbmNvZGluZyB8fCAnYmluYXJ5JywgdGhpcy5ieXRlT2Zmc2V0ICsgYnl0ZU9mZnNldCwgdGhpcy5ieXRlT2Zmc2V0ICsgdGhpcy5fb2Zmc2V0KTtcclxuXHRcdH1cclxuXHRcdHZhciBieXRlcyA9IHRoaXMuX2dldEJ5dGVzKGJ5dGVMZW5ndGgsIGJ5dGVPZmZzZXQsIHRydWUpLCBzdHJpbmcgPSAnJztcclxuXHRcdGJ5dGVMZW5ndGggPSBieXRlcy5sZW5ndGg7XHJcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGJ5dGVMZW5ndGg7IGkrKykge1xyXG5cdFx0XHRzdHJpbmcgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShieXRlc1tpXSk7XHJcblx0XHR9XHJcblx0XHRpZiAoZW5jb2RpbmcgPT09ICd1dGY4Jykge1xyXG5cdFx0XHRzdHJpbmcgPSBkZWNvZGVVUklDb21wb25lbnQoZXNjYXBlKHN0cmluZykpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHN0cmluZztcclxuXHR9LFxyXG5cclxuXHRzZXRTdHJpbmc6IGZ1bmN0aW9uIChieXRlT2Zmc2V0LCBzdWJTdHJpbmcsIGVuY29kaW5nKSB7XHJcblx0XHRpZiAodGhpcy5faXNOb2RlQnVmZmVyKSB7XHJcblx0XHRcdGJ5dGVPZmZzZXQgPSBkZWZpbmVkKGJ5dGVPZmZzZXQsIHRoaXMuX29mZnNldCk7XHJcblx0XHRcdHRoaXMuX2NoZWNrQm91bmRzKGJ5dGVPZmZzZXQsIHN1YlN0cmluZy5sZW5ndGgpO1xyXG5cdFx0XHR0aGlzLl9vZmZzZXQgPSBieXRlT2Zmc2V0ICsgdGhpcy5idWZmZXIud3JpdGUoc3ViU3RyaW5nLCB0aGlzLmJ5dGVPZmZzZXQgKyBieXRlT2Zmc2V0LCBlbmNvZGluZyB8fCAnYmluYXJ5Jyk7XHJcblx0XHRcdHJldHVybjtcclxuXHRcdH1cclxuXHRcdGlmIChlbmNvZGluZyA9PT0gJ3V0ZjgnKSB7XHJcblx0XHRcdHN1YlN0cmluZyA9IHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChzdWJTdHJpbmcpKTtcclxuXHRcdH1cclxuXHRcdHRoaXMuX3NldEJ5dGVzKGJ5dGVPZmZzZXQsIGdldENoYXJDb2RlcyhzdWJTdHJpbmcpLCB0cnVlKTtcclxuXHR9LFxyXG5cclxuXHRnZXRDaGFyOiBmdW5jdGlvbiAoYnl0ZU9mZnNldCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuZ2V0U3RyaW5nKDEsIGJ5dGVPZmZzZXQpO1xyXG5cdH0sXHJcblxyXG5cdHNldENoYXI6IGZ1bmN0aW9uIChieXRlT2Zmc2V0LCBjaGFyYWN0ZXIpIHtcclxuXHRcdHRoaXMuc2V0U3RyaW5nKGJ5dGVPZmZzZXQsIGNoYXJhY3Rlcik7XHJcblx0fSxcclxuXHJcblx0dGVsbDogZnVuY3Rpb24gKCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuX29mZnNldDtcclxuXHR9LFxyXG5cclxuXHRzZWVrOiBmdW5jdGlvbiAoYnl0ZU9mZnNldCkge1xyXG5cdFx0dGhpcy5fY2hlY2tCb3VuZHMoYnl0ZU9mZnNldCwgMCk7XHJcblx0XHQvKiBqc2hpbnQgYm9zczogdHJ1ZSAqL1xyXG5cdFx0cmV0dXJuIHRoaXMuX29mZnNldCA9IGJ5dGVPZmZzZXQ7XHJcblx0fSxcclxuXHJcblx0c2tpcDogZnVuY3Rpb24gKGJ5dGVMZW5ndGgpIHtcclxuXHRcdHJldHVybiB0aGlzLnNlZWsodGhpcy5fb2Zmc2V0ICsgYnl0ZUxlbmd0aCk7XHJcblx0fSxcclxuXHJcblx0c2xpY2U6IGZ1bmN0aW9uIChzdGFydCwgZW5kLCBmb3JjZUNvcHkpIHtcclxuXHRcdGZ1bmN0aW9uIG5vcm1hbGl6ZU9mZnNldChvZmZzZXQsIGJ5dGVMZW5ndGgpIHtcclxuXHRcdFx0cmV0dXJuIG9mZnNldCA8IDAgPyBvZmZzZXQgKyBieXRlTGVuZ3RoIDogb2Zmc2V0O1xyXG5cdFx0fVxyXG5cclxuXHRcdHN0YXJ0ID0gbm9ybWFsaXplT2Zmc2V0KHN0YXJ0LCB0aGlzLmJ5dGVMZW5ndGgpO1xyXG5cdFx0ZW5kID0gbm9ybWFsaXplT2Zmc2V0KGRlZmluZWQoZW5kLCB0aGlzLmJ5dGVMZW5ndGgpLCB0aGlzLmJ5dGVMZW5ndGgpO1xyXG5cclxuXHRcdHJldHVybiBmb3JjZUNvcHlcclxuXHRcdFx0ICAgPyBuZXcgakRhdGFWaWV3KHRoaXMuZ2V0Qnl0ZXMoZW5kIC0gc3RhcnQsIHN0YXJ0LCB0cnVlLCB0cnVlKSwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHRoaXMuX2xpdHRsZUVuZGlhbilcclxuXHRcdFx0ICAgOiBuZXcgakRhdGFWaWV3KHRoaXMuYnVmZmVyLCB0aGlzLmJ5dGVPZmZzZXQgKyBzdGFydCwgZW5kIC0gc3RhcnQsIHRoaXMuX2xpdHRsZUVuZGlhbik7XHJcblx0fSxcclxuXHJcblx0YWxpZ25CeTogZnVuY3Rpb24gKGJ5dGVDb3VudCkge1xyXG5cdFx0dGhpcy5fYml0T2Zmc2V0ID0gMDtcclxuXHRcdGlmIChkZWZpbmVkKGJ5dGVDb3VudCwgMSkgIT09IDEpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuc2tpcChieXRlQ291bnQgLSAodGhpcy5fb2Zmc2V0ICUgYnl0ZUNvdW50IHx8IGJ5dGVDb3VudCkpO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuX29mZnNldDtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHQvLyBDb21wYXRpYmlsaXR5IGZ1bmN0aW9uc1xyXG5cclxuXHRfZ2V0RmxvYXQ2NDogZnVuY3Rpb24gKGJ5dGVPZmZzZXQsIGxpdHRsZUVuZGlhbikge1xyXG5cdFx0dmFyIGIgPSB0aGlzLl9nZXRCeXRlcyg4LCBieXRlT2Zmc2V0LCBsaXR0bGVFbmRpYW4pLFxyXG5cclxuXHRcdFx0c2lnbiA9IDEgLSAoMiAqIChiWzddID4+IDcpKSxcclxuXHRcdFx0ZXhwb25lbnQgPSAoKCgoYls3XSA8PCAxKSAmIDB4ZmYpIDw8IDMpIHwgKGJbNl0gPj4gNCkpIC0gKCgxIDw8IDEwKSAtIDEpLFxyXG5cclxuXHRcdC8vIEJpbmFyeSBvcGVyYXRvcnMgc3VjaCBhcyB8IGFuZCA8PCBvcGVyYXRlIG9uIDMyIGJpdCB2YWx1ZXMsIHVzaW5nICsgYW5kIE1hdGgucG93KDIpIGluc3RlYWRcclxuXHRcdFx0bWFudGlzc2EgPSAoKGJbNl0gJiAweDBmKSAqIHBvdzIoNDgpKSArIChiWzVdICogcG93Mig0MCkpICsgKGJbNF0gKiBwb3cyKDMyKSkgK1xyXG5cdFx0XHRcdFx0XHQoYlszXSAqIHBvdzIoMjQpKSArIChiWzJdICogcG93MigxNikpICsgKGJbMV0gKiBwb3cyKDgpKSArIGJbMF07XHJcblxyXG5cdFx0aWYgKGV4cG9uZW50ID09PSAxMDI0KSB7XHJcblx0XHRcdGlmIChtYW50aXNzYSAhPT0gMCkge1xyXG5cdFx0XHRcdHJldHVybiBOYU47XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0cmV0dXJuIHNpZ24gKiBJbmZpbml0eTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdGlmIChleHBvbmVudCA9PT0gLTEwMjMpIHsgLy8gRGVub3JtYWxpemVkXHJcblx0XHRcdHJldHVybiBzaWduICogbWFudGlzc2EgKiBwb3cyKC0xMDIyIC0gNTIpO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBzaWduICogKDEgKyBtYW50aXNzYSAqIHBvdzIoLTUyKSkgKiBwb3cyKGV4cG9uZW50KTtcclxuXHR9LFxyXG5cclxuXHRfZ2V0RmxvYXQzMjogZnVuY3Rpb24gKGJ5dGVPZmZzZXQsIGxpdHRsZUVuZGlhbikge1xyXG5cdFx0dmFyIGIgPSB0aGlzLl9nZXRCeXRlcyg0LCBieXRlT2Zmc2V0LCBsaXR0bGVFbmRpYW4pLFxyXG5cclxuXHRcdFx0c2lnbiA9IDEgLSAoMiAqIChiWzNdID4+IDcpKSxcclxuXHRcdFx0ZXhwb25lbnQgPSAoKChiWzNdIDw8IDEpICYgMHhmZikgfCAoYlsyXSA+PiA3KSkgLSAxMjcsXHJcblx0XHRcdG1hbnRpc3NhID0gKChiWzJdICYgMHg3ZikgPDwgMTYpIHwgKGJbMV0gPDwgOCkgfCBiWzBdO1xyXG5cclxuXHRcdGlmIChleHBvbmVudCA9PT0gMTI4KSB7XHJcblx0XHRcdGlmIChtYW50aXNzYSAhPT0gMCkge1xyXG5cdFx0XHRcdHJldHVybiBOYU47XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0cmV0dXJuIHNpZ24gKiBJbmZpbml0eTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdGlmIChleHBvbmVudCA9PT0gLTEyNykgeyAvLyBEZW5vcm1hbGl6ZWRcclxuXHRcdFx0cmV0dXJuIHNpZ24gKiBtYW50aXNzYSAqIHBvdzIoLTEyNiAtIDIzKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gc2lnbiAqICgxICsgbWFudGlzc2EgKiBwb3cyKC0yMykpICogcG93MihleHBvbmVudCk7XHJcblx0fSxcclxuXHJcblx0X2dldDY0OiBmdW5jdGlvbiAoVHlwZSwgYnl0ZU9mZnNldCwgbGl0dGxlRW5kaWFuKSB7XHJcblx0XHRsaXR0bGVFbmRpYW4gPSBkZWZpbmVkKGxpdHRsZUVuZGlhbiwgdGhpcy5fbGl0dGxlRW5kaWFuKTtcclxuXHRcdGJ5dGVPZmZzZXQgPSBkZWZpbmVkKGJ5dGVPZmZzZXQsIHRoaXMuX29mZnNldCk7XHJcblxyXG5cdFx0dmFyIHBhcnRzID0gbGl0dGxlRW5kaWFuID8gWzAsIDRdIDogWzQsIDBdO1xyXG5cclxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgMjsgaSsrKSB7XHJcblx0XHRcdHBhcnRzW2ldID0gdGhpcy5nZXRVaW50MzIoYnl0ZU9mZnNldCArIHBhcnRzW2ldLCBsaXR0bGVFbmRpYW4pO1xyXG5cdFx0fVxyXG5cclxuXHRcdHRoaXMuX29mZnNldCA9IGJ5dGVPZmZzZXQgKyA4O1xyXG5cclxuXHRcdHJldHVybiBuZXcgVHlwZShwYXJ0c1swXSwgcGFydHNbMV0pO1xyXG5cdH0sXHJcblxyXG5cdGdldEludDY0OiBmdW5jdGlvbiAoYnl0ZU9mZnNldCwgbGl0dGxlRW5kaWFuKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5fZ2V0NjQoSW50NjQsIGJ5dGVPZmZzZXQsIGxpdHRsZUVuZGlhbik7XHJcblx0fSxcclxuXHJcblx0Z2V0VWludDY0OiBmdW5jdGlvbiAoYnl0ZU9mZnNldCwgbGl0dGxlRW5kaWFuKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5fZ2V0NjQoVWludDY0LCBieXRlT2Zmc2V0LCBsaXR0bGVFbmRpYW4pO1xyXG5cdH0sXHJcblxyXG5cdF9nZXRJbnQzMjogZnVuY3Rpb24gKGJ5dGVPZmZzZXQsIGxpdHRsZUVuZGlhbikge1xyXG5cdFx0dmFyIGIgPSB0aGlzLl9nZXRCeXRlcyg0LCBieXRlT2Zmc2V0LCBsaXR0bGVFbmRpYW4pO1xyXG5cdFx0cmV0dXJuIChiWzNdIDw8IDI0KSB8IChiWzJdIDw8IDE2KSB8IChiWzFdIDw8IDgpIHwgYlswXTtcclxuXHR9LFxyXG5cclxuXHRfZ2V0VWludDMyOiBmdW5jdGlvbiAoYnl0ZU9mZnNldCwgbGl0dGxlRW5kaWFuKSB7XHJcblx0XHRyZXR1cm4gdGhpcy5fZ2V0SW50MzIoYnl0ZU9mZnNldCwgbGl0dGxlRW5kaWFuKSA+Pj4gMDtcclxuXHR9LFxyXG5cclxuXHRfZ2V0SW50MTY6IGZ1bmN0aW9uIChieXRlT2Zmc2V0LCBsaXR0bGVFbmRpYW4pIHtcclxuXHRcdHJldHVybiAodGhpcy5fZ2V0VWludDE2KGJ5dGVPZmZzZXQsIGxpdHRsZUVuZGlhbikgPDwgMTYpID4+IDE2O1xyXG5cdH0sXHJcblxyXG5cdF9nZXRVaW50MTY6IGZ1bmN0aW9uIChieXRlT2Zmc2V0LCBsaXR0bGVFbmRpYW4pIHtcclxuXHRcdHZhciBiID0gdGhpcy5fZ2V0Qnl0ZXMoMiwgYnl0ZU9mZnNldCwgbGl0dGxlRW5kaWFuKTtcclxuXHRcdHJldHVybiAoYlsxXSA8PCA4KSB8IGJbMF07XHJcblx0fSxcclxuXHJcblx0X2dldEludDg6IGZ1bmN0aW9uIChieXRlT2Zmc2V0KSB7XHJcblx0XHRyZXR1cm4gKHRoaXMuX2dldFVpbnQ4KGJ5dGVPZmZzZXQpIDw8IDI0KSA+PiAyNDtcclxuXHR9LFxyXG5cclxuXHRfZ2V0VWludDg6IGZ1bmN0aW9uIChieXRlT2Zmc2V0KSB7XHJcblx0XHRyZXR1cm4gdGhpcy5fZ2V0Qnl0ZXMoMSwgYnl0ZU9mZnNldClbMF07XHJcblx0fSxcclxuXHJcblx0X2dldEJpdFJhbmdlRGF0YTogZnVuY3Rpb24gKGJpdExlbmd0aCwgYnl0ZU9mZnNldCkge1xyXG5cdFx0dmFyIHN0YXJ0Qml0ID0gKGRlZmluZWQoYnl0ZU9mZnNldCwgdGhpcy5fb2Zmc2V0KSA8PCAzKSArIHRoaXMuX2JpdE9mZnNldCxcclxuXHRcdFx0ZW5kQml0ID0gc3RhcnRCaXQgKyBiaXRMZW5ndGgsXHJcblx0XHRcdHN0YXJ0ID0gc3RhcnRCaXQgPj4+IDMsXHJcblx0XHRcdGVuZCA9IChlbmRCaXQgKyA3KSA+Pj4gMyxcclxuXHRcdFx0YiA9IHRoaXMuX2dldEJ5dGVzKGVuZCAtIHN0YXJ0LCBzdGFydCwgdHJ1ZSksXHJcblx0XHRcdHdpZGVWYWx1ZSA9IDA7XHJcblxyXG5cdFx0LyoganNoaW50IGJvc3M6IHRydWUgKi9cclxuXHRcdGlmICh0aGlzLl9iaXRPZmZzZXQgPSBlbmRCaXQgJiA3KSB7XHJcblx0XHRcdHRoaXMuX2JpdE9mZnNldCAtPSA4O1xyXG5cdFx0fVxyXG5cclxuXHRcdGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBiLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdHdpZGVWYWx1ZSA9ICh3aWRlVmFsdWUgPDwgOCkgfCBiW2ldO1xyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiB7XHJcblx0XHRcdHN0YXJ0OiBzdGFydCxcclxuXHRcdFx0Ynl0ZXM6IGIsXHJcblx0XHRcdHdpZGVWYWx1ZTogd2lkZVZhbHVlXHJcblx0XHR9O1xyXG5cdH0sXHJcblxyXG5cdGdldFNpZ25lZDogZnVuY3Rpb24gKGJpdExlbmd0aCwgYnl0ZU9mZnNldCkge1xyXG5cdFx0dmFyIHNoaWZ0ID0gMzIgLSBiaXRMZW5ndGg7XHJcblx0XHRyZXR1cm4gKHRoaXMuZ2V0VW5zaWduZWQoYml0TGVuZ3RoLCBieXRlT2Zmc2V0KSA8PCBzaGlmdCkgPj4gc2hpZnQ7XHJcblx0fSxcclxuXHJcblx0Z2V0VW5zaWduZWQ6IGZ1bmN0aW9uIChiaXRMZW5ndGgsIGJ5dGVPZmZzZXQpIHtcclxuXHRcdHZhciB2YWx1ZSA9IHRoaXMuX2dldEJpdFJhbmdlRGF0YShiaXRMZW5ndGgsIGJ5dGVPZmZzZXQpLndpZGVWYWx1ZSA+Pj4gLXRoaXMuX2JpdE9mZnNldDtcclxuXHRcdHJldHVybiBiaXRMZW5ndGggPCAzMiA/ICh2YWx1ZSAmIH4oLTEgPDwgYml0TGVuZ3RoKSkgOiB2YWx1ZTtcclxuXHR9LFxyXG5cclxuXHRfc2V0QmluYXJ5RmxvYXQ6IGZ1bmN0aW9uIChieXRlT2Zmc2V0LCB2YWx1ZSwgbWFudFNpemUsIGV4cFNpemUsIGxpdHRsZUVuZGlhbikge1xyXG5cdFx0dmFyIHNpZ25CaXQgPSB2YWx1ZSA8IDAgPyAxIDogMCxcclxuXHRcdFx0ZXhwb25lbnQsXHJcblx0XHRcdG1hbnRpc3NhLFxyXG5cdFx0XHRlTWF4ID0gfigtMSA8PCAoZXhwU2l6ZSAtIDEpKSxcclxuXHRcdFx0ZU1pbiA9IDEgLSBlTWF4O1xyXG5cclxuXHRcdGlmICh2YWx1ZSA8IDApIHtcclxuXHRcdFx0dmFsdWUgPSAtdmFsdWU7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKHZhbHVlID09PSAwKSB7XHJcblx0XHRcdGV4cG9uZW50ID0gMDtcclxuXHRcdFx0bWFudGlzc2EgPSAwO1xyXG5cdFx0fSBlbHNlIGlmIChpc05hTih2YWx1ZSkpIHtcclxuXHRcdFx0ZXhwb25lbnQgPSAyICogZU1heCArIDE7XHJcblx0XHRcdG1hbnRpc3NhID0gMTtcclxuXHRcdH0gZWxzZSBpZiAodmFsdWUgPT09IEluZmluaXR5KSB7XHJcblx0XHRcdGV4cG9uZW50ID0gMiAqIGVNYXggKyAxO1xyXG5cdFx0XHRtYW50aXNzYSA9IDA7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRleHBvbmVudCA9IE1hdGguZmxvb3IoTWF0aC5sb2codmFsdWUpIC8gTWF0aC5MTjIpO1xyXG5cdFx0XHRpZiAoZXhwb25lbnQgPj0gZU1pbiAmJiBleHBvbmVudCA8PSBlTWF4KSB7XHJcblx0XHRcdFx0bWFudGlzc2EgPSBNYXRoLmZsb29yKCh2YWx1ZSAqIHBvdzIoLWV4cG9uZW50KSAtIDEpICogcG93MihtYW50U2l6ZSkpO1xyXG5cdFx0XHRcdGV4cG9uZW50ICs9IGVNYXg7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0bWFudGlzc2EgPSBNYXRoLmZsb29yKHZhbHVlIC8gcG93MihlTWluIC0gbWFudFNpemUpKTtcclxuXHRcdFx0XHRleHBvbmVudCA9IDA7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHR2YXIgYiA9IFtdO1xyXG5cdFx0d2hpbGUgKG1hbnRTaXplID49IDgpIHtcclxuXHRcdFx0Yi5wdXNoKG1hbnRpc3NhICUgMjU2KTtcclxuXHRcdFx0bWFudGlzc2EgPSBNYXRoLmZsb29yKG1hbnRpc3NhIC8gMjU2KTtcclxuXHRcdFx0bWFudFNpemUgLT0gODtcclxuXHRcdH1cclxuXHRcdGV4cG9uZW50ID0gKGV4cG9uZW50IDw8IG1hbnRTaXplKSB8IG1hbnRpc3NhO1xyXG5cdFx0ZXhwU2l6ZSArPSBtYW50U2l6ZTtcclxuXHRcdHdoaWxlIChleHBTaXplID49IDgpIHtcclxuXHRcdFx0Yi5wdXNoKGV4cG9uZW50ICYgMHhmZik7XHJcblx0XHRcdGV4cG9uZW50ID4+Pj0gODtcclxuXHRcdFx0ZXhwU2l6ZSAtPSA4O1xyXG5cdFx0fVxyXG5cdFx0Yi5wdXNoKChzaWduQml0IDw8IGV4cFNpemUpIHwgZXhwb25lbnQpO1xyXG5cclxuXHRcdHRoaXMuX3NldEJ5dGVzKGJ5dGVPZmZzZXQsIGIsIGxpdHRsZUVuZGlhbik7XHJcblx0fSxcclxuXHJcblx0X3NldEZsb2F0MzI6IGZ1bmN0aW9uIChieXRlT2Zmc2V0LCB2YWx1ZSwgbGl0dGxlRW5kaWFuKSB7XHJcblx0XHR0aGlzLl9zZXRCaW5hcnlGbG9hdChieXRlT2Zmc2V0LCB2YWx1ZSwgMjMsIDgsIGxpdHRsZUVuZGlhbik7XHJcblx0fSxcclxuXHJcblx0X3NldEZsb2F0NjQ6IGZ1bmN0aW9uIChieXRlT2Zmc2V0LCB2YWx1ZSwgbGl0dGxlRW5kaWFuKSB7XHJcblx0XHR0aGlzLl9zZXRCaW5hcnlGbG9hdChieXRlT2Zmc2V0LCB2YWx1ZSwgNTIsIDExLCBsaXR0bGVFbmRpYW4pO1xyXG5cdH0sXHJcblxyXG5cdF9zZXQ2NDogZnVuY3Rpb24gKFR5cGUsIGJ5dGVPZmZzZXQsIHZhbHVlLCBsaXR0bGVFbmRpYW4pIHtcclxuXHRcdGlmICghKHZhbHVlIGluc3RhbmNlb2YgVHlwZSkpIHtcclxuXHRcdFx0dmFsdWUgPSBUeXBlLmZyb21OdW1iZXIodmFsdWUpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGxpdHRsZUVuZGlhbiA9IGRlZmluZWQobGl0dGxlRW5kaWFuLCB0aGlzLl9saXR0bGVFbmRpYW4pO1xyXG5cdFx0Ynl0ZU9mZnNldCA9IGRlZmluZWQoYnl0ZU9mZnNldCwgdGhpcy5fb2Zmc2V0KTtcclxuXHJcblx0XHR2YXIgcGFydHMgPSBsaXR0bGVFbmRpYW4gPyB7bG86IDAsIGhpOiA0fSA6IHtsbzogNCwgaGk6IDB9O1xyXG5cclxuXHRcdGZvciAodmFyIHBhcnROYW1lIGluIHBhcnRzKSB7XHJcblx0XHRcdHRoaXMuc2V0VWludDMyKGJ5dGVPZmZzZXQgKyBwYXJ0c1twYXJ0TmFtZV0sIHZhbHVlW3BhcnROYW1lXSwgbGl0dGxlRW5kaWFuKTtcclxuXHRcdH1cclxuXHJcblx0XHR0aGlzLl9vZmZzZXQgPSBieXRlT2Zmc2V0ICsgODtcclxuXHR9LFxyXG5cclxuXHRzZXRJbnQ2NDogZnVuY3Rpb24gKGJ5dGVPZmZzZXQsIHZhbHVlLCBsaXR0bGVFbmRpYW4pIHtcclxuXHRcdHRoaXMuX3NldDY0KEludDY0LCBieXRlT2Zmc2V0LCB2YWx1ZSwgbGl0dGxlRW5kaWFuKTtcclxuXHR9LFxyXG5cclxuXHRzZXRVaW50NjQ6IGZ1bmN0aW9uIChieXRlT2Zmc2V0LCB2YWx1ZSwgbGl0dGxlRW5kaWFuKSB7XHJcblx0XHR0aGlzLl9zZXQ2NChVaW50NjQsIGJ5dGVPZmZzZXQsIHZhbHVlLCBsaXR0bGVFbmRpYW4pO1xyXG5cdH0sXHJcblxyXG5cdF9zZXRVaW50MzI6IGZ1bmN0aW9uIChieXRlT2Zmc2V0LCB2YWx1ZSwgbGl0dGxlRW5kaWFuKSB7XHJcblx0XHR0aGlzLl9zZXRCeXRlcyhieXRlT2Zmc2V0LCBbXHJcblx0XHRcdHZhbHVlICYgMHhmZixcclxuXHRcdFx0KHZhbHVlID4+PiA4KSAmIDB4ZmYsXHJcblx0XHRcdCh2YWx1ZSA+Pj4gMTYpICYgMHhmZixcclxuXHRcdFx0dmFsdWUgPj4+IDI0XHJcblx0XHRdLCBsaXR0bGVFbmRpYW4pO1xyXG5cdH0sXHJcblxyXG5cdF9zZXRVaW50MTY6IGZ1bmN0aW9uIChieXRlT2Zmc2V0LCB2YWx1ZSwgbGl0dGxlRW5kaWFuKSB7XHJcblx0XHR0aGlzLl9zZXRCeXRlcyhieXRlT2Zmc2V0LCBbXHJcblx0XHRcdHZhbHVlICYgMHhmZixcclxuXHRcdFx0KHZhbHVlID4+PiA4KSAmIDB4ZmZcclxuXHRcdF0sIGxpdHRsZUVuZGlhbik7XHJcblx0fSxcclxuXHJcblx0X3NldFVpbnQ4OiBmdW5jdGlvbiAoYnl0ZU9mZnNldCwgdmFsdWUpIHtcclxuXHRcdHRoaXMuX3NldEJ5dGVzKGJ5dGVPZmZzZXQsIFt2YWx1ZSAmIDB4ZmZdKTtcclxuXHR9LFxyXG5cclxuXHRzZXRVbnNpZ25lZDogZnVuY3Rpb24gKGJ5dGVPZmZzZXQsIHZhbHVlLCBiaXRMZW5ndGgpIHtcclxuXHRcdHZhciBkYXRhID0gdGhpcy5fZ2V0Qml0UmFuZ2VEYXRhKGJpdExlbmd0aCwgYnl0ZU9mZnNldCksXHJcblx0XHRcdHdpZGVWYWx1ZSA9IGRhdGEud2lkZVZhbHVlLFxyXG5cdFx0XHRiID0gZGF0YS5ieXRlcztcclxuXHJcblx0XHR3aWRlVmFsdWUgJj0gfih+KC0xIDw8IGJpdExlbmd0aCkgPDwgLXRoaXMuX2JpdE9mZnNldCk7IC8vIGNsZWFyaW5nIGJpdCByYW5nZSBiZWZvcmUgYmluYXJ5IFwib3JcIlxyXG5cdFx0d2lkZVZhbHVlIHw9IChiaXRMZW5ndGggPCAzMiA/ICh2YWx1ZSAmIH4oLTEgPDwgYml0TGVuZ3RoKSkgOiB2YWx1ZSkgPDwgLXRoaXMuX2JpdE9mZnNldDsgLy8gc2V0dGluZyBiaXRzXHJcblxyXG5cdFx0Zm9yICh2YXIgaSA9IGIubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuXHRcdFx0YltpXSA9IHdpZGVWYWx1ZSAmIDB4ZmY7XHJcblx0XHRcdHdpZGVWYWx1ZSA+Pj49IDg7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5fc2V0Qnl0ZXMoZGF0YS5zdGFydCwgYiwgdHJ1ZSk7XHJcblx0fVxyXG59O1xyXG5cclxudmFyIHByb3RvID0gakRhdGFWaWV3LnByb3RvdHlwZTtcclxuXHJcbmZvciAodmFyIHR5cGUgaW4gZGF0YVR5cGVzKSB7XHJcblx0KGZ1bmN0aW9uICh0eXBlKSB7XHJcblx0XHRwcm90b1snZ2V0JyArIHR5cGVdID0gZnVuY3Rpb24gKGJ5dGVPZmZzZXQsIGxpdHRsZUVuZGlhbikge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5fYWN0aW9uKHR5cGUsIHRydWUsIGJ5dGVPZmZzZXQsIGxpdHRsZUVuZGlhbik7XHJcblx0XHR9O1xyXG5cdFx0cHJvdG9bJ3NldCcgKyB0eXBlXSA9IGZ1bmN0aW9uIChieXRlT2Zmc2V0LCB2YWx1ZSwgbGl0dGxlRW5kaWFuKSB7XHJcblx0XHRcdHRoaXMuX2FjdGlvbih0eXBlLCBmYWxzZSwgYnl0ZU9mZnNldCwgbGl0dGxlRW5kaWFuLCB2YWx1ZSk7XHJcblx0XHR9O1xyXG5cdH0pKHR5cGUpO1xyXG59XHJcblxyXG5wcm90by5fc2V0SW50MzIgPSBwcm90by5fc2V0VWludDMyO1xyXG5wcm90by5fc2V0SW50MTYgPSBwcm90by5fc2V0VWludDE2O1xyXG5wcm90by5fc2V0SW50OCA9IHByb3RvLl9zZXRVaW50ODtcclxucHJvdG8uc2V0U2lnbmVkID0gcHJvdG8uc2V0VW5zaWduZWQ7XHJcblxyXG5mb3IgKHZhciBtZXRob2QgaW4gcHJvdG8pIHtcclxuXHRpZiAobWV0aG9kLnNsaWNlKDAsIDMpID09PSAnc2V0Jykge1xyXG5cdFx0KGZ1bmN0aW9uICh0eXBlKSB7XHJcblx0XHRcdHByb3RvWyd3cml0ZScgKyB0eXBlXSA9IGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHRBcnJheS5wcm90b3R5cGUudW5zaGlmdC5jYWxsKGFyZ3VtZW50cywgdW5kZWZpbmVkKTtcclxuXHRcdFx0XHR0aGlzWydzZXQnICsgdHlwZV0uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuXHRcdFx0fTtcclxuXHRcdH0pKG1ldGhvZC5zbGljZSgzKSk7XHJcblx0fVxyXG59XHJcblxyXG5pZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSAnb2JqZWN0Jykge1xyXG5cdG1vZHVsZS5leHBvcnRzID0gakRhdGFWaWV3O1xyXG59IGVsc2VcclxuaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xyXG5cdGRlZmluZShbXSwgZnVuY3Rpb24gKCkgeyByZXR1cm4gakRhdGFWaWV3IH0pO1xyXG59IGVsc2Uge1xyXG5cdHZhciBvbGRHbG9iYWwgPSBnbG9iYWwuakRhdGFWaWV3O1xyXG5cdChnbG9iYWwuakRhdGFWaWV3ID0gakRhdGFWaWV3KS5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xyXG5cdFx0Z2xvYmFsLmpEYXRhVmlldyA9IG9sZEdsb2JhbDtcclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH07XHJcbn1cclxuXHJcbn0pKChmdW5jdGlvbiAoKSB7IC8qIGpzaGludCBzdHJpY3Q6IGZhbHNlICovIHJldHVybiB0aGlzIH0pKCkpO1xufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyKSIsbnVsbCwiLyohXG4gKiBUaGUgYnVmZmVyIG1vZHVsZSBmcm9tIG5vZGUuanMsIGZvciB0aGUgYnJvd3Nlci5cbiAqXG4gKiBAYXV0aG9yICAgRmVyb3NzIEFib3VraGFkaWplaCA8ZmVyb3NzQGZlcm9zcy5vcmc+IDxodHRwOi8vZmVyb3NzLm9yZz5cbiAqIEBsaWNlbnNlICBNSVRcbiAqL1xuXG52YXIgYmFzZTY0ID0gcmVxdWlyZSgnYmFzZTY0LWpzJylcbnZhciBpZWVlNzU0ID0gcmVxdWlyZSgnaWVlZTc1NCcpXG52YXIgaXNBcnJheSA9IHJlcXVpcmUoJ2lzLWFycmF5JylcblxuZXhwb3J0cy5CdWZmZXIgPSBCdWZmZXJcbmV4cG9ydHMuU2xvd0J1ZmZlciA9IEJ1ZmZlclxuZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFUyA9IDUwXG5CdWZmZXIucG9vbFNpemUgPSA4MTkyIC8vIG5vdCB1c2VkIGJ5IHRoaXMgaW1wbGVtZW50YXRpb25cblxudmFyIGtNYXhMZW5ndGggPSAweDNmZmZmZmZmXG5cbi8qKlxuICogSWYgYEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUYDpcbiAqICAgPT09IHRydWUgICAgVXNlIFVpbnQ4QXJyYXkgaW1wbGVtZW50YXRpb24gKGZhc3Rlc3QpXG4gKiAgID09PSBmYWxzZSAgIFVzZSBPYmplY3QgaW1wbGVtZW50YXRpb24gKG1vc3QgY29tcGF0aWJsZSwgZXZlbiBJRTYpXG4gKlxuICogQnJvd3NlcnMgdGhhdCBzdXBwb3J0IHR5cGVkIGFycmF5cyBhcmUgSUUgMTArLCBGaXJlZm94IDQrLCBDaHJvbWUgNyssIFNhZmFyaSA1LjErLFxuICogT3BlcmEgMTEuNissIGlPUyA0LjIrLlxuICpcbiAqIE5vdGU6XG4gKlxuICogLSBJbXBsZW1lbnRhdGlvbiBtdXN0IHN1cHBvcnQgYWRkaW5nIG5ldyBwcm9wZXJ0aWVzIHRvIGBVaW50OEFycmF5YCBpbnN0YW5jZXMuXG4gKiAgIEZpcmVmb3ggNC0yOSBsYWNrZWQgc3VwcG9ydCwgZml4ZWQgaW4gRmlyZWZveCAzMCsuXG4gKiAgIFNlZTogaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9Njk1NDM4LlxuICpcbiAqICAtIENocm9tZSA5LTEwIGlzIG1pc3NpbmcgdGhlIGBUeXBlZEFycmF5LnByb3RvdHlwZS5zdWJhcnJheWAgZnVuY3Rpb24uXG4gKlxuICogIC0gSUUxMCBoYXMgYSBicm9rZW4gYFR5cGVkQXJyYXkucHJvdG90eXBlLnN1YmFycmF5YCBmdW5jdGlvbiB3aGljaCByZXR1cm5zIGFycmF5cyBvZlxuICogICAgaW5jb3JyZWN0IGxlbmd0aCBpbiBzb21lIHNpdHVhdGlvbnMuXG4gKlxuICogV2UgZGV0ZWN0IHRoZXNlIGJ1Z2d5IGJyb3dzZXJzIGFuZCBzZXQgYEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUYCB0byBgZmFsc2VgIHNvIHRoZXkgd2lsbFxuICogZ2V0IHRoZSBPYmplY3QgaW1wbGVtZW50YXRpb24sIHdoaWNoIGlzIHNsb3dlciBidXQgd2lsbCB3b3JrIGNvcnJlY3RseS5cbiAqL1xuQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQgPSAoZnVuY3Rpb24gKCkge1xuICB0cnkge1xuICAgIHZhciBidWYgPSBuZXcgQXJyYXlCdWZmZXIoMClcbiAgICB2YXIgYXJyID0gbmV3IFVpbnQ4QXJyYXkoYnVmKVxuICAgIGFyci5mb28gPSBmdW5jdGlvbiAoKSB7IHJldHVybiA0MiB9XG4gICAgcmV0dXJuIDQyID09PSBhcnIuZm9vKCkgJiYgLy8gdHlwZWQgYXJyYXkgaW5zdGFuY2VzIGNhbiBiZSBhdWdtZW50ZWRcbiAgICAgICAgdHlwZW9mIGFyci5zdWJhcnJheSA9PT0gJ2Z1bmN0aW9uJyAmJiAvLyBjaHJvbWUgOS0xMCBsYWNrIGBzdWJhcnJheWBcbiAgICAgICAgbmV3IFVpbnQ4QXJyYXkoMSkuc3ViYXJyYXkoMSwgMSkuYnl0ZUxlbmd0aCA9PT0gMCAvLyBpZTEwIGhhcyBicm9rZW4gYHN1YmFycmF5YFxuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn0pKClcblxuLyoqXG4gKiBDbGFzczogQnVmZmVyXG4gKiA9PT09PT09PT09PT09XG4gKlxuICogVGhlIEJ1ZmZlciBjb25zdHJ1Y3RvciByZXR1cm5zIGluc3RhbmNlcyBvZiBgVWludDhBcnJheWAgdGhhdCBhcmUgYXVnbWVudGVkXG4gKiB3aXRoIGZ1bmN0aW9uIHByb3BlcnRpZXMgZm9yIGFsbCB0aGUgbm9kZSBgQnVmZmVyYCBBUEkgZnVuY3Rpb25zLiBXZSB1c2VcbiAqIGBVaW50OEFycmF5YCBzbyB0aGF0IHNxdWFyZSBicmFja2V0IG5vdGF0aW9uIHdvcmtzIGFzIGV4cGVjdGVkIC0tIGl0IHJldHVybnNcbiAqIGEgc2luZ2xlIG9jdGV0LlxuICpcbiAqIEJ5IGF1Z21lbnRpbmcgdGhlIGluc3RhbmNlcywgd2UgY2FuIGF2b2lkIG1vZGlmeWluZyB0aGUgYFVpbnQ4QXJyYXlgXG4gKiBwcm90b3R5cGUuXG4gKi9cbmZ1bmN0aW9uIEJ1ZmZlciAoc3ViamVjdCwgZW5jb2RpbmcsIG5vWmVybykge1xuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgQnVmZmVyKSlcbiAgICByZXR1cm4gbmV3IEJ1ZmZlcihzdWJqZWN0LCBlbmNvZGluZywgbm9aZXJvKVxuXG4gIHZhciB0eXBlID0gdHlwZW9mIHN1YmplY3RcblxuICAvLyBGaW5kIHRoZSBsZW5ndGhcbiAgdmFyIGxlbmd0aFxuICBpZiAodHlwZSA9PT0gJ251bWJlcicpXG4gICAgbGVuZ3RoID0gc3ViamVjdCA+IDAgPyBzdWJqZWN0ID4+PiAwIDogMFxuICBlbHNlIGlmICh0eXBlID09PSAnc3RyaW5nJykge1xuICAgIGlmIChlbmNvZGluZyA9PT0gJ2Jhc2U2NCcpXG4gICAgICBzdWJqZWN0ID0gYmFzZTY0Y2xlYW4oc3ViamVjdClcbiAgICBsZW5ndGggPSBCdWZmZXIuYnl0ZUxlbmd0aChzdWJqZWN0LCBlbmNvZGluZylcbiAgfSBlbHNlIGlmICh0eXBlID09PSAnb2JqZWN0JyAmJiBzdWJqZWN0ICE9PSBudWxsKSB7IC8vIGFzc3VtZSBvYmplY3QgaXMgYXJyYXktbGlrZVxuICAgIGlmIChzdWJqZWN0LnR5cGUgPT09ICdCdWZmZXInICYmIGlzQXJyYXkoc3ViamVjdC5kYXRhKSlcbiAgICAgIHN1YmplY3QgPSBzdWJqZWN0LmRhdGFcbiAgICBsZW5ndGggPSArc3ViamVjdC5sZW5ndGggPiAwID8gTWF0aC5mbG9vcigrc3ViamVjdC5sZW5ndGgpIDogMFxuICB9IGVsc2VcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdtdXN0IHN0YXJ0IHdpdGggbnVtYmVyLCBidWZmZXIsIGFycmF5IG9yIHN0cmluZycpXG5cbiAgaWYgKHRoaXMubGVuZ3RoID4ga01heExlbmd0aClcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignQXR0ZW1wdCB0byBhbGxvY2F0ZSBCdWZmZXIgbGFyZ2VyIHRoYW4gbWF4aW11bSAnICtcbiAgICAgICdzaXplOiAweCcgKyBrTWF4TGVuZ3RoLnRvU3RyaW5nKDE2KSArICcgYnl0ZXMnKVxuXG4gIHZhciBidWZcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgLy8gUHJlZmVycmVkOiBSZXR1cm4gYW4gYXVnbWVudGVkIGBVaW50OEFycmF5YCBpbnN0YW5jZSBmb3IgYmVzdCBwZXJmb3JtYW5jZVxuICAgIGJ1ZiA9IEJ1ZmZlci5fYXVnbWVudChuZXcgVWludDhBcnJheShsZW5ndGgpKVxuICB9IGVsc2Uge1xuICAgIC8vIEZhbGxiYWNrOiBSZXR1cm4gVEhJUyBpbnN0YW5jZSBvZiBCdWZmZXIgKGNyZWF0ZWQgYnkgYG5ld2ApXG4gICAgYnVmID0gdGhpc1xuICAgIGJ1Zi5sZW5ndGggPSBsZW5ndGhcbiAgICBidWYuX2lzQnVmZmVyID0gdHJ1ZVxuICB9XG5cbiAgdmFyIGlcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUICYmIHR5cGVvZiBzdWJqZWN0LmJ5dGVMZW5ndGggPT09ICdudW1iZXInKSB7XG4gICAgLy8gU3BlZWQgb3B0aW1pemF0aW9uIC0tIHVzZSBzZXQgaWYgd2UncmUgY29weWluZyBmcm9tIGEgdHlwZWQgYXJyYXlcbiAgICBidWYuX3NldChzdWJqZWN0KVxuICB9IGVsc2UgaWYgKGlzQXJyYXlpc2goc3ViamVjdCkpIHtcbiAgICAvLyBUcmVhdCBhcnJheS1pc2ggb2JqZWN0cyBhcyBhIGJ5dGUgYXJyYXlcbiAgICBpZiAoQnVmZmVyLmlzQnVmZmVyKHN1YmplY3QpKSB7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspXG4gICAgICAgIGJ1ZltpXSA9IHN1YmplY3QucmVhZFVJbnQ4KGkpXG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKylcbiAgICAgICAgYnVmW2ldID0gKChzdWJqZWN0W2ldICUgMjU2KSArIDI1NikgJSAyNTZcbiAgICB9XG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICBidWYud3JpdGUoc3ViamVjdCwgMCwgZW5jb2RpbmcpXG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gJ251bWJlcicgJiYgIUJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUICYmICFub1plcm8pIHtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGJ1ZltpXSA9IDBcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYnVmXG59XG5cbkJ1ZmZlci5pc0J1ZmZlciA9IGZ1bmN0aW9uIChiKSB7XG4gIHJldHVybiAhIShiICE9IG51bGwgJiYgYi5faXNCdWZmZXIpXG59XG5cbkJ1ZmZlci5jb21wYXJlID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgaWYgKCFCdWZmZXIuaXNCdWZmZXIoYSkgfHwgIUJ1ZmZlci5pc0J1ZmZlcihiKSlcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudHMgbXVzdCBiZSBCdWZmZXJzJylcblxuICB2YXIgeCA9IGEubGVuZ3RoXG4gIHZhciB5ID0gYi5sZW5ndGhcbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IE1hdGgubWluKHgsIHkpOyBpIDwgbGVuICYmIGFbaV0gPT09IGJbaV07IGkrKykge31cbiAgaWYgKGkgIT09IGxlbikge1xuICAgIHggPSBhW2ldXG4gICAgeSA9IGJbaV1cbiAgfVxuICBpZiAoeCA8IHkpIHJldHVybiAtMVxuICBpZiAoeSA8IHgpIHJldHVybiAxXG4gIHJldHVybiAwXG59XG5cbkJ1ZmZlci5pc0VuY29kaW5nID0gZnVuY3Rpb24gKGVuY29kaW5nKSB7XG4gIHN3aXRjaCAoU3RyaW5nKGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgY2FzZSAnYXNjaWknOlxuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICBjYXNlICdyYXcnOlxuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5CdWZmZXIuY29uY2F0ID0gZnVuY3Rpb24gKGxpc3QsIHRvdGFsTGVuZ3RoKSB7XG4gIGlmICghaXNBcnJheShsaXN0KSkgdGhyb3cgbmV3IFR5cGVFcnJvcignVXNhZ2U6IEJ1ZmZlci5jb25jYXQobGlzdFssIGxlbmd0aF0pJylcblxuICBpZiAobGlzdC5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gbmV3IEJ1ZmZlcigwKVxuICB9IGVsc2UgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgcmV0dXJuIGxpc3RbMF1cbiAgfVxuXG4gIHZhciBpXG4gIGlmICh0b3RhbExlbmd0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdG90YWxMZW5ndGggPSAwXG4gICAgZm9yIChpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRvdGFsTGVuZ3RoICs9IGxpc3RbaV0ubGVuZ3RoXG4gICAgfVxuICB9XG5cbiAgdmFyIGJ1ZiA9IG5ldyBCdWZmZXIodG90YWxMZW5ndGgpXG4gIHZhciBwb3MgPSAwXG4gIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGl0ZW0gPSBsaXN0W2ldXG4gICAgaXRlbS5jb3B5KGJ1ZiwgcG9zKVxuICAgIHBvcyArPSBpdGVtLmxlbmd0aFxuICB9XG4gIHJldHVybiBidWZcbn1cblxuQnVmZmVyLmJ5dGVMZW5ndGggPSBmdW5jdGlvbiAoc3RyLCBlbmNvZGluZykge1xuICB2YXIgcmV0XG4gIHN0ciA9IHN0ciArICcnXG4gIHN3aXRjaCAoZW5jb2RpbmcgfHwgJ3V0ZjgnKSB7XG4gICAgY2FzZSAnYXNjaWknOlxuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgY2FzZSAncmF3JzpcbiAgICAgIHJldCA9IHN0ci5sZW5ndGhcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldCA9IHN0ci5sZW5ndGggKiAyXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2hleCc6XG4gICAgICByZXQgPSBzdHIubGVuZ3RoID4+PiAxXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgIHJldCA9IHV0ZjhUb0J5dGVzKHN0cikubGVuZ3RoXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICByZXQgPSBiYXNlNjRUb0J5dGVzKHN0cikubGVuZ3RoXG4gICAgICBicmVha1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXQgPSBzdHIubGVuZ3RoXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG4vLyBwcmUtc2V0IGZvciB2YWx1ZXMgdGhhdCBtYXkgZXhpc3QgaW4gdGhlIGZ1dHVyZVxuQnVmZmVyLnByb3RvdHlwZS5sZW5ndGggPSB1bmRlZmluZWRcbkJ1ZmZlci5wcm90b3R5cGUucGFyZW50ID0gdW5kZWZpbmVkXG5cbi8vIHRvU3RyaW5nKGVuY29kaW5nLCBzdGFydD0wLCBlbmQ9YnVmZmVyLmxlbmd0aClcbkJ1ZmZlci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoZW5jb2RpbmcsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxvd2VyZWRDYXNlID0gZmFsc2VcblxuICBzdGFydCA9IHN0YXJ0ID4+PiAwXG4gIGVuZCA9IGVuZCA9PT0gdW5kZWZpbmVkIHx8IGVuZCA9PT0gSW5maW5pdHkgPyB0aGlzLmxlbmd0aCA6IGVuZCA+Pj4gMFxuXG4gIGlmICghZW5jb2RpbmcpIGVuY29kaW5nID0gJ3V0ZjgnXG4gIGlmIChzdGFydCA8IDApIHN0YXJ0ID0gMFxuICBpZiAoZW5kID4gdGhpcy5sZW5ndGgpIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmIChlbmQgPD0gc3RhcnQpIHJldHVybiAnJ1xuXG4gIHdoaWxlICh0cnVlKSB7XG4gICAgc3dpdGNoIChlbmNvZGluZykge1xuICAgICAgY2FzZSAnaGV4JzpcbiAgICAgICAgcmV0dXJuIGhleFNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ3V0ZjgnOlxuICAgICAgY2FzZSAndXRmLTgnOlxuICAgICAgICByZXR1cm4gdXRmOFNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgICAgcmV0dXJuIGFzY2lpU2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgICAgcmV0dXJuIGJpbmFyeVNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICAgIHJldHVybiBiYXNlNjRTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICd1Y3MyJzpcbiAgICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgICByZXR1cm4gdXRmMTZsZVNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGlmIChsb3dlcmVkQ2FzZSlcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdVbmtub3duIGVuY29kaW5nOiAnICsgZW5jb2RpbmcpXG4gICAgICAgIGVuY29kaW5nID0gKGVuY29kaW5nICsgJycpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgbG93ZXJlZENhc2UgPSB0cnVlXG4gICAgfVxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24gKGIpIHtcbiAgaWYoIUJ1ZmZlci5pc0J1ZmZlcihiKSkgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnQgbXVzdCBiZSBhIEJ1ZmZlcicpXG4gIHJldHVybiBCdWZmZXIuY29tcGFyZSh0aGlzLCBiKSA9PT0gMFxufVxuXG5CdWZmZXIucHJvdG90eXBlLmluc3BlY3QgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBzdHIgPSAnJ1xuICB2YXIgbWF4ID0gZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFU1xuICBpZiAodGhpcy5sZW5ndGggPiAwKSB7XG4gICAgc3RyID0gdGhpcy50b1N0cmluZygnaGV4JywgMCwgbWF4KS5tYXRjaCgvLnsyfS9nKS5qb2luKCcgJylcbiAgICBpZiAodGhpcy5sZW5ndGggPiBtYXgpXG4gICAgICBzdHIgKz0gJyAuLi4gJ1xuICB9XG4gIHJldHVybiAnPEJ1ZmZlciAnICsgc3RyICsgJz4nXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuY29tcGFyZSA9IGZ1bmN0aW9uIChiKSB7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKGIpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudCBtdXN0IGJlIGEgQnVmZmVyJylcbiAgcmV0dXJuIEJ1ZmZlci5jb21wYXJlKHRoaXMsIGIpXG59XG5cbi8vIGBnZXRgIHdpbGwgYmUgcmVtb3ZlZCBpbiBOb2RlIDAuMTMrXG5CdWZmZXIucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIChvZmZzZXQpIHtcbiAgY29uc29sZS5sb2coJy5nZXQoKSBpcyBkZXByZWNhdGVkLiBBY2Nlc3MgdXNpbmcgYXJyYXkgaW5kZXhlcyBpbnN0ZWFkLicpXG4gIHJldHVybiB0aGlzLnJlYWRVSW50OChvZmZzZXQpXG59XG5cbi8vIGBzZXRgIHdpbGwgYmUgcmVtb3ZlZCBpbiBOb2RlIDAuMTMrXG5CdWZmZXIucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uICh2LCBvZmZzZXQpIHtcbiAgY29uc29sZS5sb2coJy5zZXQoKSBpcyBkZXByZWNhdGVkLiBBY2Nlc3MgdXNpbmcgYXJyYXkgaW5kZXhlcyBpbnN0ZWFkLicpXG4gIHJldHVybiB0aGlzLndyaXRlVUludDgodiwgb2Zmc2V0KVxufVxuXG5mdW5jdGlvbiBoZXhXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIG9mZnNldCA9IE51bWJlcihvZmZzZXQpIHx8IDBcbiAgdmFyIHJlbWFpbmluZyA9IGJ1Zi5sZW5ndGggLSBvZmZzZXRcbiAgaWYgKCFsZW5ndGgpIHtcbiAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgfSBlbHNlIHtcbiAgICBsZW5ndGggPSBOdW1iZXIobGVuZ3RoKVxuICAgIGlmIChsZW5ndGggPiByZW1haW5pbmcpIHtcbiAgICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICAgIH1cbiAgfVxuXG4gIC8vIG11c3QgYmUgYW4gZXZlbiBudW1iZXIgb2YgZGlnaXRzXG4gIHZhciBzdHJMZW4gPSBzdHJpbmcubGVuZ3RoXG4gIGlmIChzdHJMZW4gJSAyICE9PSAwKSB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgaGV4IHN0cmluZycpXG5cbiAgaWYgKGxlbmd0aCA+IHN0ckxlbiAvIDIpIHtcbiAgICBsZW5ndGggPSBzdHJMZW4gLyAyXG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIHZhciBieXRlID0gcGFyc2VJbnQoc3RyaW5nLnN1YnN0cihpICogMiwgMiksIDE2KVxuICAgIGlmIChpc05hTihieXRlKSkgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGhleCBzdHJpbmcnKVxuICAgIGJ1ZltvZmZzZXQgKyBpXSA9IGJ5dGVcbiAgfVxuICByZXR1cm4gaVxufVxuXG5mdW5jdGlvbiB1dGY4V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gYmxpdEJ1ZmZlcih1dGY4VG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbmZ1bmN0aW9uIGFzY2lpV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gYmxpdEJ1ZmZlcihhc2NpaVRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5mdW5jdGlvbiBiaW5hcnlXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBhc2NpaVdyaXRlKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gYmFzZTY0V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gYmxpdEJ1ZmZlcihiYXNlNjRUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cbn1cblxuZnVuY3Rpb24gdXRmMTZsZVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IGJsaXRCdWZmZXIodXRmMTZsZVRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24gKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgsIGVuY29kaW5nKSB7XG4gIC8vIFN1cHBvcnQgYm90aCAoc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCwgZW5jb2RpbmcpXG4gIC8vIGFuZCB0aGUgbGVnYWN5IChzdHJpbmcsIGVuY29kaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgaWYgKGlzRmluaXRlKG9mZnNldCkpIHtcbiAgICBpZiAoIWlzRmluaXRlKGxlbmd0aCkpIHtcbiAgICAgIGVuY29kaW5nID0gbGVuZ3RoXG4gICAgICBsZW5ndGggPSB1bmRlZmluZWRcbiAgICB9XG4gIH0gZWxzZSB7ICAvLyBsZWdhY3lcbiAgICB2YXIgc3dhcCA9IGVuY29kaW5nXG4gICAgZW5jb2RpbmcgPSBvZmZzZXRcbiAgICBvZmZzZXQgPSBsZW5ndGhcbiAgICBsZW5ndGggPSBzd2FwXG4gIH1cblxuICBvZmZzZXQgPSBOdW1iZXIob2Zmc2V0KSB8fCAwXG4gIHZhciByZW1haW5pbmcgPSB0aGlzLmxlbmd0aCAtIG9mZnNldFxuICBpZiAoIWxlbmd0aCkge1xuICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICB9IGVsc2Uge1xuICAgIGxlbmd0aCA9IE51bWJlcihsZW5ndGgpXG4gICAgaWYgKGxlbmd0aCA+IHJlbWFpbmluZykge1xuICAgICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gICAgfVxuICB9XG4gIGVuY29kaW5nID0gU3RyaW5nKGVuY29kaW5nIHx8ICd1dGY4JykudG9Mb3dlckNhc2UoKVxuXG4gIHZhciByZXRcbiAgc3dpdGNoIChlbmNvZGluZykge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgICByZXQgPSBoZXhXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgICByZXQgPSB1dGY4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYXNjaWknOlxuICAgICAgcmV0ID0gYXNjaWlXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiaW5hcnknOlxuICAgICAgcmV0ID0gYmluYXJ5V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgIHJldCA9IGJhc2U2NFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXQgPSB1dGYxNmxlV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1Vua25vd24gZW5jb2Rpbmc6ICcgKyBlbmNvZGluZylcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICdCdWZmZXInLFxuICAgIGRhdGE6IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHRoaXMuX2FyciB8fCB0aGlzLCAwKVxuICB9XG59XG5cbmZ1bmN0aW9uIGJhc2U2NFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgaWYgKHN0YXJ0ID09PSAwICYmIGVuZCA9PT0gYnVmLmxlbmd0aCkge1xuICAgIHJldHVybiBiYXNlNjQuZnJvbUJ5dGVBcnJheShidWYpXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1Zi5zbGljZShzdGFydCwgZW5kKSlcbiAgfVxufVxuXG5mdW5jdGlvbiB1dGY4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgcmVzID0gJydcbiAgdmFyIHRtcCA9ICcnXG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIGlmIChidWZbaV0gPD0gMHg3Rikge1xuICAgICAgcmVzICs9IGRlY29kZVV0ZjhDaGFyKHRtcCkgKyBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSlcbiAgICAgIHRtcCA9ICcnXG4gICAgfSBlbHNlIHtcbiAgICAgIHRtcCArPSAnJScgKyBidWZbaV0udG9TdHJpbmcoMTYpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlcyArIGRlY29kZVV0ZjhDaGFyKHRtcClcbn1cblxuZnVuY3Rpb24gYXNjaWlTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciByZXQgPSAnJ1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICByZXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0pXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5mdW5jdGlvbiBiaW5hcnlTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHJldHVybiBhc2NpaVNsaWNlKGJ1Ziwgc3RhcnQsIGVuZClcbn1cblxuZnVuY3Rpb24gaGV4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuXG4gIGlmICghc3RhcnQgfHwgc3RhcnQgPCAwKSBzdGFydCA9IDBcbiAgaWYgKCFlbmQgfHwgZW5kIDwgMCB8fCBlbmQgPiBsZW4pIGVuZCA9IGxlblxuXG4gIHZhciBvdXQgPSAnJ1xuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIG91dCArPSB0b0hleChidWZbaV0pXG4gIH1cbiAgcmV0dXJuIG91dFxufVxuXG5mdW5jdGlvbiB1dGYxNmxlU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgYnl0ZXMgPSBidWYuc2xpY2Uoc3RhcnQsIGVuZClcbiAgdmFyIHJlcyA9ICcnXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpICs9IDIpIHtcbiAgICByZXMgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShieXRlc1tpXSArIGJ5dGVzW2kgKyAxXSAqIDI1NilcbiAgfVxuICByZXR1cm4gcmVzXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuc2xpY2UgPSBmdW5jdGlvbiAoc3RhcnQsIGVuZCkge1xuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgc3RhcnQgPSB+fnN0YXJ0XG4gIGVuZCA9IGVuZCA9PT0gdW5kZWZpbmVkID8gbGVuIDogfn5lbmRcblxuICBpZiAoc3RhcnQgPCAwKSB7XG4gICAgc3RhcnQgKz0gbGVuO1xuICAgIGlmIChzdGFydCA8IDApXG4gICAgICBzdGFydCA9IDBcbiAgfSBlbHNlIGlmIChzdGFydCA+IGxlbikge1xuICAgIHN0YXJ0ID0gbGVuXG4gIH1cblxuICBpZiAoZW5kIDwgMCkge1xuICAgIGVuZCArPSBsZW5cbiAgICBpZiAoZW5kIDwgMClcbiAgICAgIGVuZCA9IDBcbiAgfSBlbHNlIGlmIChlbmQgPiBsZW4pIHtcbiAgICBlbmQgPSBsZW5cbiAgfVxuXG4gIGlmIChlbmQgPCBzdGFydClcbiAgICBlbmQgPSBzdGFydFxuXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHJldHVybiBCdWZmZXIuX2F1Z21lbnQodGhpcy5zdWJhcnJheShzdGFydCwgZW5kKSlcbiAgfSBlbHNlIHtcbiAgICB2YXIgc2xpY2VMZW4gPSBlbmQgLSBzdGFydFxuICAgIHZhciBuZXdCdWYgPSBuZXcgQnVmZmVyKHNsaWNlTGVuLCB1bmRlZmluZWQsIHRydWUpXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzbGljZUxlbjsgaSsrKSB7XG4gICAgICBuZXdCdWZbaV0gPSB0aGlzW2kgKyBzdGFydF1cbiAgICB9XG4gICAgcmV0dXJuIG5ld0J1ZlxuICB9XG59XG5cbi8qXG4gKiBOZWVkIHRvIG1ha2Ugc3VyZSB0aGF0IGJ1ZmZlciBpc24ndCB0cnlpbmcgdG8gd3JpdGUgb3V0IG9mIGJvdW5kcy5cbiAqL1xuZnVuY3Rpb24gY2hlY2tPZmZzZXQgKG9mZnNldCwgZXh0LCBsZW5ndGgpIHtcbiAgaWYgKChvZmZzZXQgJSAxKSAhPT0gMCB8fCBvZmZzZXQgPCAwKVxuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdvZmZzZXQgaXMgbm90IHVpbnQnKVxuICBpZiAob2Zmc2V0ICsgZXh0ID4gbGVuZ3RoKVxuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdUcnlpbmcgdG8gYWNjZXNzIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDggPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KVxuICAgIGNoZWNrT2Zmc2V0KG9mZnNldCwgMSwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiB0aGlzW29mZnNldF1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2TEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KVxuICAgIGNoZWNrT2Zmc2V0KG9mZnNldCwgMiwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiB0aGlzW29mZnNldF0gfCAodGhpc1tvZmZzZXQgKyAxXSA8PCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpXG4gICAgY2hlY2tPZmZzZXQob2Zmc2V0LCAyLCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuICh0aGlzW29mZnNldF0gPDwgOCkgfCB0aGlzW29mZnNldCArIDFdXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQzMkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydClcbiAgICBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuXG4gIHJldHVybiAoKHRoaXNbb2Zmc2V0XSkgfFxuICAgICAgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgOCkgfFxuICAgICAgKHRoaXNbb2Zmc2V0ICsgMl0gPDwgMTYpKSArXG4gICAgICAodGhpc1tvZmZzZXQgKyAzXSAqIDB4MTAwMDAwMClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyQkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KVxuICAgIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICh0aGlzW29mZnNldF0gKiAweDEwMDAwMDApICtcbiAgICAgICgodGhpc1tvZmZzZXQgKyAxXSA8PCAxNikgfFxuICAgICAgKHRoaXNbb2Zmc2V0ICsgMl0gPDwgOCkgfFxuICAgICAgdGhpc1tvZmZzZXQgKyAzXSlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50OCA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpXG4gICAgY2hlY2tPZmZzZXQob2Zmc2V0LCAxLCB0aGlzLmxlbmd0aClcbiAgaWYgKCEodGhpc1tvZmZzZXRdICYgMHg4MCkpXG4gICAgcmV0dXJuICh0aGlzW29mZnNldF0pXG4gIHJldHVybiAoKDB4ZmYgLSB0aGlzW29mZnNldF0gKyAxKSAqIC0xKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydClcbiAgICBjaGVja09mZnNldChvZmZzZXQsIDIsIHRoaXMubGVuZ3RoKVxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXRdIHwgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgOClcbiAgcmV0dXJuICh2YWwgJiAweDgwMDApID8gdmFsIHwgMHhGRkZGMDAwMCA6IHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydClcbiAgICBjaGVja09mZnNldChvZmZzZXQsIDIsIHRoaXMubGVuZ3RoKVxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXQgKyAxXSB8ICh0aGlzW29mZnNldF0gPDwgOClcbiAgcmV0dXJuICh2YWwgJiAweDgwMDApID8gdmFsIHwgMHhGRkZGMDAwMCA6IHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQzMkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydClcbiAgICBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuXG4gIHJldHVybiAodGhpc1tvZmZzZXRdKSB8XG4gICAgICAodGhpc1tvZmZzZXQgKyAxXSA8PCA4KSB8XG4gICAgICAodGhpc1tvZmZzZXQgKyAyXSA8PCAxNikgfFxuICAgICAgKHRoaXNbb2Zmc2V0ICsgM10gPDwgMjQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDMyQkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KVxuICAgIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICh0aGlzW29mZnNldF0gPDwgMjQpIHxcbiAgICAgICh0aGlzW29mZnNldCArIDFdIDw8IDE2KSB8XG4gICAgICAodGhpc1tvZmZzZXQgKyAyXSA8PCA4KSB8XG4gICAgICAodGhpc1tvZmZzZXQgKyAzXSlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpXG4gICAgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIHRydWUsIDIzLCA0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdEJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydClcbiAgICBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gaWVlZTc1NC5yZWFkKHRoaXMsIG9mZnNldCwgZmFsc2UsIDIzLCA0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpXG4gICAgY2hlY2tPZmZzZXQob2Zmc2V0LCA4LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIHRydWUsIDUyLCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpXG4gICAgY2hlY2tPZmZzZXQob2Zmc2V0LCA4LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIGZhbHNlLCA1MiwgOClcbn1cblxuZnVuY3Rpb24gY2hlY2tJbnQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgZXh0LCBtYXgsIG1pbikge1xuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihidWYpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdidWZmZXIgbXVzdCBiZSBhIEJ1ZmZlciBpbnN0YW5jZScpXG4gIGlmICh2YWx1ZSA+IG1heCB8fCB2YWx1ZSA8IG1pbikgdGhyb3cgbmV3IFR5cGVFcnJvcigndmFsdWUgaXMgb3V0IG9mIGJvdW5kcycpXG4gIGlmIChvZmZzZXQgKyBleHQgPiBidWYubGVuZ3RoKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdpbmRleCBvdXQgb2YgcmFuZ2UnKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDggPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpXG4gICAgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMSwgMHhmZiwgMClcbiAgaWYgKCFCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkgdmFsdWUgPSBNYXRoLmZsb29yKHZhbHVlKVxuICB0aGlzW29mZnNldF0gPSB2YWx1ZVxuICByZXR1cm4gb2Zmc2V0ICsgMVxufVxuXG5mdW5jdGlvbiBvYmplY3RXcml0ZVVJbnQxNiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4pIHtcbiAgaWYgKHZhbHVlIDwgMCkgdmFsdWUgPSAweGZmZmYgKyB2YWx1ZSArIDFcbiAgZm9yICh2YXIgaSA9IDAsIGogPSBNYXRoLm1pbihidWYubGVuZ3RoIC0gb2Zmc2V0LCAyKTsgaSA8IGo7IGkrKykge1xuICAgIGJ1ZltvZmZzZXQgKyBpXSA9ICh2YWx1ZSAmICgweGZmIDw8ICg4ICogKGxpdHRsZUVuZGlhbiA/IGkgOiAxIC0gaSkpKSkgPj4+XG4gICAgICAobGl0dGxlRW5kaWFuID8gaSA6IDEgLSBpKSAqIDhcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2TEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpXG4gICAgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMiwgMHhmZmZmLCAwKVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldF0gPSB2YWx1ZVxuICAgIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDgpXG4gIH0gZWxzZSBvYmplY3RXcml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlKVxuICByZXR1cm4gb2Zmc2V0ICsgMlxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2QkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpXG4gICAgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMiwgMHhmZmZmLCAwKVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldF0gPSAodmFsdWUgPj4+IDgpXG4gICAgdGhpc1tvZmZzZXQgKyAxXSA9IHZhbHVlXG4gIH0gZWxzZSBvYmplY3RXcml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSlcbiAgcmV0dXJuIG9mZnNldCArIDJcbn1cblxuZnVuY3Rpb24gb2JqZWN0V3JpdGVVSW50MzIgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuKSB7XG4gIGlmICh2YWx1ZSA8IDApIHZhbHVlID0gMHhmZmZmZmZmZiArIHZhbHVlICsgMVxuICBmb3IgKHZhciBpID0gMCwgaiA9IE1hdGgubWluKGJ1Zi5sZW5ndGggLSBvZmZzZXQsIDQpOyBpIDwgajsgaSsrKSB7XG4gICAgYnVmW29mZnNldCArIGldID0gKHZhbHVlID4+PiAobGl0dGxlRW5kaWFuID8gaSA6IDMgLSBpKSAqIDgpICYgMHhmZlxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydClcbiAgICBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCA0LCAweGZmZmZmZmZmLCAwKVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldCArIDNdID0gKHZhbHVlID4+PiAyNClcbiAgICB0aGlzW29mZnNldCArIDJdID0gKHZhbHVlID4+PiAxNilcbiAgICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiA4KVxuICAgIHRoaXNbb2Zmc2V0XSA9IHZhbHVlXG4gIH0gZWxzZSBvYmplY3RXcml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlKVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyQkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpXG4gICAgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgNCwgMHhmZmZmZmZmZiwgMClcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgdGhpc1tvZmZzZXRdID0gKHZhbHVlID4+PiAyNClcbiAgICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiAxNilcbiAgICB0aGlzW29mZnNldCArIDJdID0gKHZhbHVlID4+PiA4KVxuICAgIHRoaXNbb2Zmc2V0ICsgM10gPSB2YWx1ZVxuICB9IGVsc2Ugb2JqZWN0V3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UpXG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQ4ID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KVxuICAgIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDEsIDB4N2YsIC0weDgwKVxuICBpZiAoIUJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB2YWx1ZSA9IE1hdGguZmxvb3IodmFsdWUpXG4gIGlmICh2YWx1ZSA8IDApIHZhbHVlID0gMHhmZiArIHZhbHVlICsgMVxuICB0aGlzW29mZnNldF0gPSB2YWx1ZVxuICByZXR1cm4gb2Zmc2V0ICsgMVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydClcbiAgICBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAyLCAweDdmZmYsIC0weDgwMDApXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHRoaXNbb2Zmc2V0XSA9IHZhbHVlXG4gICAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gOClcbiAgfSBlbHNlIG9iamVjdFdyaXRlVUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUpXG4gIHJldHVybiBvZmZzZXQgKyAyXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KVxuICAgIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDIsIDB4N2ZmZiwgLTB4ODAwMClcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgdGhpc1tvZmZzZXRdID0gKHZhbHVlID4+PiA4KVxuICAgIHRoaXNbb2Zmc2V0ICsgMV0gPSB2YWx1ZVxuICB9IGVsc2Ugb2JqZWN0V3JpdGVVSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UpXG4gIHJldHVybiBvZmZzZXQgKyAyXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KVxuICAgIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDQsIDB4N2ZmZmZmZmYsIC0weDgwMDAwMDAwKVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldF0gPSB2YWx1ZVxuICAgIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDgpXG4gICAgdGhpc1tvZmZzZXQgKyAyXSA9ICh2YWx1ZSA+Pj4gMTYpXG4gICAgdGhpc1tvZmZzZXQgKyAzXSA9ICh2YWx1ZSA+Pj4gMjQpXG4gIH0gZWxzZSBvYmplY3RXcml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlKVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MzJCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydClcbiAgICBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCA0LCAweDdmZmZmZmZmLCAtMHg4MDAwMDAwMClcbiAgaWYgKHZhbHVlIDwgMCkgdmFsdWUgPSAweGZmZmZmZmZmICsgdmFsdWUgKyAxXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSA+Pj4gMjQpXG4gICAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gMTYpXG4gICAgdGhpc1tvZmZzZXQgKyAyXSA9ICh2YWx1ZSA+Pj4gOClcbiAgICB0aGlzW29mZnNldCArIDNdID0gdmFsdWVcbiAgfSBlbHNlIG9iamVjdFdyaXRlVUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlKVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5mdW5jdGlvbiBjaGVja0lFRUU3NTQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgZXh0LCBtYXgsIG1pbikge1xuICBpZiAodmFsdWUgPiBtYXggfHwgdmFsdWUgPCBtaW4pIHRocm93IG5ldyBUeXBlRXJyb3IoJ3ZhbHVlIGlzIG91dCBvZiBib3VuZHMnKVxuICBpZiAob2Zmc2V0ICsgZXh0ID4gYnVmLmxlbmd0aCkgdGhyb3cgbmV3IFR5cGVFcnJvcignaW5kZXggb3V0IG9mIHJhbmdlJylcbn1cblxuZnVuY3Rpb24gd3JpdGVGbG9hdCAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpXG4gICAgY2hlY2tJRUVFNzU0KGJ1ZiwgdmFsdWUsIG9mZnNldCwgNCwgMy40MDI4MjM0NjYzODUyODg2ZSszOCwgLTMuNDAyODIzNDY2Mzg1Mjg4NmUrMzgpXG4gIGllZWU3NTQud3JpdGUoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDIzLCA0KVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRmxvYXRMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gd3JpdGVGbG9hdCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0QkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHdyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiB3cml0ZURvdWJsZSAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpXG4gICAgY2hlY2tJRUVFNzU0KGJ1ZiwgdmFsdWUsIG9mZnNldCwgOCwgMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgsIC0xLjc5NzY5MzEzNDg2MjMxNTdFKzMwOClcbiAgaWVlZTc1NC53cml0ZShidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgNTIsIDgpXG4gIHJldHVybiBvZmZzZXQgKyA4XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVEb3VibGVMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVEb3VibGVCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG4vLyBjb3B5KHRhcmdldEJ1ZmZlciwgdGFyZ2V0U3RhcnQ9MCwgc291cmNlU3RhcnQ9MCwgc291cmNlRW5kPWJ1ZmZlci5sZW5ndGgpXG5CdWZmZXIucHJvdG90eXBlLmNvcHkgPSBmdW5jdGlvbiAodGFyZ2V0LCB0YXJnZXRfc3RhcnQsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHNvdXJjZSA9IHRoaXNcblxuICBpZiAoIXN0YXJ0KSBzdGFydCA9IDBcbiAgaWYgKCFlbmQgJiYgZW5kICE9PSAwKSBlbmQgPSB0aGlzLmxlbmd0aFxuICBpZiAoIXRhcmdldF9zdGFydCkgdGFyZ2V0X3N0YXJ0ID0gMFxuXG4gIC8vIENvcHkgMCBieXRlczsgd2UncmUgZG9uZVxuICBpZiAoZW5kID09PSBzdGFydCkgcmV0dXJuXG4gIGlmICh0YXJnZXQubGVuZ3RoID09PSAwIHx8IHNvdXJjZS5sZW5ndGggPT09IDApIHJldHVyblxuXG4gIC8vIEZhdGFsIGVycm9yIGNvbmRpdGlvbnNcbiAgaWYgKGVuZCA8IHN0YXJ0KSB0aHJvdyBuZXcgVHlwZUVycm9yKCdzb3VyY2VFbmQgPCBzb3VyY2VTdGFydCcpXG4gIGlmICh0YXJnZXRfc3RhcnQgPCAwIHx8IHRhcmdldF9zdGFydCA+PSB0YXJnZXQubGVuZ3RoKVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3RhcmdldFN0YXJ0IG91dCBvZiBib3VuZHMnKVxuICBpZiAoc3RhcnQgPCAwIHx8IHN0YXJ0ID49IHNvdXJjZS5sZW5ndGgpIHRocm93IG5ldyBUeXBlRXJyb3IoJ3NvdXJjZVN0YXJ0IG91dCBvZiBib3VuZHMnKVxuICBpZiAoZW5kIDwgMCB8fCBlbmQgPiBzb3VyY2UubGVuZ3RoKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdzb3VyY2VFbmQgb3V0IG9mIGJvdW5kcycpXG5cbiAgLy8gQXJlIHdlIG9vYj9cbiAgaWYgKGVuZCA+IHRoaXMubGVuZ3RoKVxuICAgIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICh0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0X3N0YXJ0IDwgZW5kIC0gc3RhcnQpXG4gICAgZW5kID0gdGFyZ2V0Lmxlbmd0aCAtIHRhcmdldF9zdGFydCArIHN0YXJ0XG5cbiAgdmFyIGxlbiA9IGVuZCAtIHN0YXJ0XG5cbiAgaWYgKGxlbiA8IDEwMDAgfHwgIUJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgdGFyZ2V0W2kgKyB0YXJnZXRfc3RhcnRdID0gdGhpc1tpICsgc3RhcnRdXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHRhcmdldC5fc2V0KHRoaXMuc3ViYXJyYXkoc3RhcnQsIHN0YXJ0ICsgbGVuKSwgdGFyZ2V0X3N0YXJ0KVxuICB9XG59XG5cbi8vIGZpbGwodmFsdWUsIHN0YXJ0PTAsIGVuZD1idWZmZXIubGVuZ3RoKVxuQnVmZmVyLnByb3RvdHlwZS5maWxsID0gZnVuY3Rpb24gKHZhbHVlLCBzdGFydCwgZW5kKSB7XG4gIGlmICghdmFsdWUpIHZhbHVlID0gMFxuICBpZiAoIXN0YXJ0KSBzdGFydCA9IDBcbiAgaWYgKCFlbmQpIGVuZCA9IHRoaXMubGVuZ3RoXG5cbiAgaWYgKGVuZCA8IHN0YXJ0KSB0aHJvdyBuZXcgVHlwZUVycm9yKCdlbmQgPCBzdGFydCcpXG5cbiAgLy8gRmlsbCAwIGJ5dGVzOyB3ZSdyZSBkb25lXG4gIGlmIChlbmQgPT09IHN0YXJ0KSByZXR1cm5cbiAgaWYgKHRoaXMubGVuZ3RoID09PSAwKSByZXR1cm5cblxuICBpZiAoc3RhcnQgPCAwIHx8IHN0YXJ0ID49IHRoaXMubGVuZ3RoKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdzdGFydCBvdXQgb2YgYm91bmRzJylcbiAgaWYgKGVuZCA8IDAgfHwgZW5kID4gdGhpcy5sZW5ndGgpIHRocm93IG5ldyBUeXBlRXJyb3IoJ2VuZCBvdXQgb2YgYm91bmRzJylcblxuICB2YXIgaVxuICBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xuICAgIGZvciAoaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICAgIHRoaXNbaV0gPSB2YWx1ZVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB2YXIgYnl0ZXMgPSB1dGY4VG9CeXRlcyh2YWx1ZS50b1N0cmluZygpKVxuICAgIHZhciBsZW4gPSBieXRlcy5sZW5ndGhcbiAgICBmb3IgKGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgICB0aGlzW2ldID0gYnl0ZXNbaSAlIGxlbl1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpc1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgYEFycmF5QnVmZmVyYCB3aXRoIHRoZSAqY29waWVkKiBtZW1vcnkgb2YgdGhlIGJ1ZmZlciBpbnN0YW5jZS5cbiAqIEFkZGVkIGluIE5vZGUgMC4xMi4gT25seSBhdmFpbGFibGUgaW4gYnJvd3NlcnMgdGhhdCBzdXBwb3J0IEFycmF5QnVmZmVyLlxuICovXG5CdWZmZXIucHJvdG90eXBlLnRvQXJyYXlCdWZmZXIgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICAgIHJldHVybiAobmV3IEJ1ZmZlcih0aGlzKSkuYnVmZmVyXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBidWYgPSBuZXcgVWludDhBcnJheSh0aGlzLmxlbmd0aClcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBidWYubGVuZ3RoOyBpIDwgbGVuOyBpICs9IDEpIHtcbiAgICAgICAgYnVmW2ldID0gdGhpc1tpXVxuICAgICAgfVxuICAgICAgcmV0dXJuIGJ1Zi5idWZmZXJcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQnVmZmVyLnRvQXJyYXlCdWZmZXIgbm90IHN1cHBvcnRlZCBpbiB0aGlzIGJyb3dzZXInKVxuICB9XG59XG5cbi8vIEhFTFBFUiBGVU5DVElPTlNcbi8vID09PT09PT09PT09PT09PT1cblxudmFyIEJQID0gQnVmZmVyLnByb3RvdHlwZVxuXG4vKipcbiAqIEF1Z21lbnQgYSBVaW50OEFycmF5ICppbnN0YW5jZSogKG5vdCB0aGUgVWludDhBcnJheSBjbGFzcyEpIHdpdGggQnVmZmVyIG1ldGhvZHNcbiAqL1xuQnVmZmVyLl9hdWdtZW50ID0gZnVuY3Rpb24gKGFycikge1xuICBhcnIuY29uc3RydWN0b3IgPSBCdWZmZXJcbiAgYXJyLl9pc0J1ZmZlciA9IHRydWVcblxuICAvLyBzYXZlIHJlZmVyZW5jZSB0byBvcmlnaW5hbCBVaW50OEFycmF5IGdldC9zZXQgbWV0aG9kcyBiZWZvcmUgb3ZlcndyaXRpbmdcbiAgYXJyLl9nZXQgPSBhcnIuZ2V0XG4gIGFyci5fc2V0ID0gYXJyLnNldFxuXG4gIC8vIGRlcHJlY2F0ZWQsIHdpbGwgYmUgcmVtb3ZlZCBpbiBub2RlIDAuMTMrXG4gIGFyci5nZXQgPSBCUC5nZXRcbiAgYXJyLnNldCA9IEJQLnNldFxuXG4gIGFyci53cml0ZSA9IEJQLndyaXRlXG4gIGFyci50b1N0cmluZyA9IEJQLnRvU3RyaW5nXG4gIGFyci50b0xvY2FsZVN0cmluZyA9IEJQLnRvU3RyaW5nXG4gIGFyci50b0pTT04gPSBCUC50b0pTT05cbiAgYXJyLmVxdWFscyA9IEJQLmVxdWFsc1xuICBhcnIuY29tcGFyZSA9IEJQLmNvbXBhcmVcbiAgYXJyLmNvcHkgPSBCUC5jb3B5XG4gIGFyci5zbGljZSA9IEJQLnNsaWNlXG4gIGFyci5yZWFkVUludDggPSBCUC5yZWFkVUludDhcbiAgYXJyLnJlYWRVSW50MTZMRSA9IEJQLnJlYWRVSW50MTZMRVxuICBhcnIucmVhZFVJbnQxNkJFID0gQlAucmVhZFVJbnQxNkJFXG4gIGFyci5yZWFkVUludDMyTEUgPSBCUC5yZWFkVUludDMyTEVcbiAgYXJyLnJlYWRVSW50MzJCRSA9IEJQLnJlYWRVSW50MzJCRVxuICBhcnIucmVhZEludDggPSBCUC5yZWFkSW50OFxuICBhcnIucmVhZEludDE2TEUgPSBCUC5yZWFkSW50MTZMRVxuICBhcnIucmVhZEludDE2QkUgPSBCUC5yZWFkSW50MTZCRVxuICBhcnIucmVhZEludDMyTEUgPSBCUC5yZWFkSW50MzJMRVxuICBhcnIucmVhZEludDMyQkUgPSBCUC5yZWFkSW50MzJCRVxuICBhcnIucmVhZEZsb2F0TEUgPSBCUC5yZWFkRmxvYXRMRVxuICBhcnIucmVhZEZsb2F0QkUgPSBCUC5yZWFkRmxvYXRCRVxuICBhcnIucmVhZERvdWJsZUxFID0gQlAucmVhZERvdWJsZUxFXG4gIGFyci5yZWFkRG91YmxlQkUgPSBCUC5yZWFkRG91YmxlQkVcbiAgYXJyLndyaXRlVUludDggPSBCUC53cml0ZVVJbnQ4XG4gIGFyci53cml0ZVVJbnQxNkxFID0gQlAud3JpdGVVSW50MTZMRVxuICBhcnIud3JpdGVVSW50MTZCRSA9IEJQLndyaXRlVUludDE2QkVcbiAgYXJyLndyaXRlVUludDMyTEUgPSBCUC53cml0ZVVJbnQzMkxFXG4gIGFyci53cml0ZVVJbnQzMkJFID0gQlAud3JpdGVVSW50MzJCRVxuICBhcnIud3JpdGVJbnQ4ID0gQlAud3JpdGVJbnQ4XG4gIGFyci53cml0ZUludDE2TEUgPSBCUC53cml0ZUludDE2TEVcbiAgYXJyLndyaXRlSW50MTZCRSA9IEJQLndyaXRlSW50MTZCRVxuICBhcnIud3JpdGVJbnQzMkxFID0gQlAud3JpdGVJbnQzMkxFXG4gIGFyci53cml0ZUludDMyQkUgPSBCUC53cml0ZUludDMyQkVcbiAgYXJyLndyaXRlRmxvYXRMRSA9IEJQLndyaXRlRmxvYXRMRVxuICBhcnIud3JpdGVGbG9hdEJFID0gQlAud3JpdGVGbG9hdEJFXG4gIGFyci53cml0ZURvdWJsZUxFID0gQlAud3JpdGVEb3VibGVMRVxuICBhcnIud3JpdGVEb3VibGVCRSA9IEJQLndyaXRlRG91YmxlQkVcbiAgYXJyLmZpbGwgPSBCUC5maWxsXG4gIGFyci5pbnNwZWN0ID0gQlAuaW5zcGVjdFxuICBhcnIudG9BcnJheUJ1ZmZlciA9IEJQLnRvQXJyYXlCdWZmZXJcblxuICByZXR1cm4gYXJyXG59XG5cbnZhciBJTlZBTElEX0JBU0U2NF9SRSA9IC9bXitcXC8wLTlBLXpdL2dcblxuZnVuY3Rpb24gYmFzZTY0Y2xlYW4gKHN0cikge1xuICAvLyBOb2RlIHN0cmlwcyBvdXQgaW52YWxpZCBjaGFyYWN0ZXJzIGxpa2UgXFxuIGFuZCBcXHQgZnJvbSB0aGUgc3RyaW5nLCBiYXNlNjQtanMgZG9lcyBub3RcbiAgc3RyID0gc3RyaW5ndHJpbShzdHIpLnJlcGxhY2UoSU5WQUxJRF9CQVNFNjRfUkUsICcnKVxuICAvLyBOb2RlIGFsbG93cyBmb3Igbm9uLXBhZGRlZCBiYXNlNjQgc3RyaW5ncyAobWlzc2luZyB0cmFpbGluZyA9PT0pLCBiYXNlNjQtanMgZG9lcyBub3RcbiAgd2hpbGUgKHN0ci5sZW5ndGggJSA0ICE9PSAwKSB7XG4gICAgc3RyID0gc3RyICsgJz0nXG4gIH1cbiAgcmV0dXJuIHN0clxufVxuXG5mdW5jdGlvbiBzdHJpbmd0cmltIChzdHIpIHtcbiAgaWYgKHN0ci50cmltKSByZXR1cm4gc3RyLnRyaW0oKVxuICByZXR1cm4gc3RyLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKVxufVxuXG5mdW5jdGlvbiBpc0FycmF5aXNoIChzdWJqZWN0KSB7XG4gIHJldHVybiBpc0FycmF5KHN1YmplY3QpIHx8IEJ1ZmZlci5pc0J1ZmZlcihzdWJqZWN0KSB8fFxuICAgICAgc3ViamVjdCAmJiB0eXBlb2Ygc3ViamVjdCA9PT0gJ29iamVjdCcgJiZcbiAgICAgIHR5cGVvZiBzdWJqZWN0Lmxlbmd0aCA9PT0gJ251bWJlcidcbn1cblxuZnVuY3Rpb24gdG9IZXggKG4pIHtcbiAgaWYgKG4gPCAxNikgcmV0dXJuICcwJyArIG4udG9TdHJpbmcoMTYpXG4gIHJldHVybiBuLnRvU3RyaW5nKDE2KVxufVxuXG5mdW5jdGlvbiB1dGY4VG9CeXRlcyAoc3RyKSB7XG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgIHZhciBiID0gc3RyLmNoYXJDb2RlQXQoaSlcbiAgICBpZiAoYiA8PSAweDdGKSB7XG4gICAgICBieXRlQXJyYXkucHVzaChiKVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgc3RhcnQgPSBpXG4gICAgICBpZiAoYiA+PSAweEQ4MDAgJiYgYiA8PSAweERGRkYpIGkrK1xuICAgICAgdmFyIGggPSBlbmNvZGVVUklDb21wb25lbnQoc3RyLnNsaWNlKHN0YXJ0LCBpKzEpKS5zdWJzdHIoMSkuc3BsaXQoJyUnKVxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBoLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIGJ5dGVBcnJheS5wdXNoKHBhcnNlSW50KGhbal0sIDE2KSlcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiBhc2NpaVRvQnl0ZXMgKHN0cikge1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICAvLyBOb2RlJ3MgY29kZSBzZWVtcyB0byBiZSBkb2luZyB0aGlzIGFuZCBub3QgJiAweDdGLi5cbiAgICBieXRlQXJyYXkucHVzaChzdHIuY2hhckNvZGVBdChpKSAmIDB4RkYpXG4gIH1cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiB1dGYxNmxlVG9CeXRlcyAoc3RyKSB7XG4gIHZhciBjLCBoaSwgbG9cbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgYyA9IHN0ci5jaGFyQ29kZUF0KGkpXG4gICAgaGkgPSBjID4+IDhcbiAgICBsbyA9IGMgJSAyNTZcbiAgICBieXRlQXJyYXkucHVzaChsbylcbiAgICBieXRlQXJyYXkucHVzaChoaSlcbiAgfVxuXG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gYmFzZTY0VG9CeXRlcyAoc3RyKSB7XG4gIHJldHVybiBiYXNlNjQudG9CeXRlQXJyYXkoc3RyKVxufVxuXG5mdW5jdGlvbiBibGl0QnVmZmVyIChzcmMsIGRzdCwgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIGlmICgoaSArIG9mZnNldCA+PSBkc3QubGVuZ3RoKSB8fCAoaSA+PSBzcmMubGVuZ3RoKSlcbiAgICAgIGJyZWFrXG4gICAgZHN0W2kgKyBvZmZzZXRdID0gc3JjW2ldXG4gIH1cbiAgcmV0dXJuIGlcbn1cblxuZnVuY3Rpb24gZGVjb2RlVXRmOENoYXIgKHN0cikge1xuICB0cnkge1xuICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoc3RyKVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZSgweEZGRkQpIC8vIFVURiA4IGludmFsaWQgY2hhclxuICB9XG59XG4iLCJ2YXIgbG9va3VwID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky8nO1xuXG47KGZ1bmN0aW9uIChleHBvcnRzKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuICB2YXIgQXJyID0gKHR5cGVvZiBVaW50OEFycmF5ICE9PSAndW5kZWZpbmVkJylcbiAgICA/IFVpbnQ4QXJyYXlcbiAgICA6IEFycmF5XG5cblx0dmFyIFBMVVMgICA9ICcrJy5jaGFyQ29kZUF0KDApXG5cdHZhciBTTEFTSCAgPSAnLycuY2hhckNvZGVBdCgwKVxuXHR2YXIgTlVNQkVSID0gJzAnLmNoYXJDb2RlQXQoMClcblx0dmFyIExPV0VSICA9ICdhJy5jaGFyQ29kZUF0KDApXG5cdHZhciBVUFBFUiAgPSAnQScuY2hhckNvZGVBdCgwKVxuXG5cdGZ1bmN0aW9uIGRlY29kZSAoZWx0KSB7XG5cdFx0dmFyIGNvZGUgPSBlbHQuY2hhckNvZGVBdCgwKVxuXHRcdGlmIChjb2RlID09PSBQTFVTKVxuXHRcdFx0cmV0dXJuIDYyIC8vICcrJ1xuXHRcdGlmIChjb2RlID09PSBTTEFTSClcblx0XHRcdHJldHVybiA2MyAvLyAnLydcblx0XHRpZiAoY29kZSA8IE5VTUJFUilcblx0XHRcdHJldHVybiAtMSAvL25vIG1hdGNoXG5cdFx0aWYgKGNvZGUgPCBOVU1CRVIgKyAxMClcblx0XHRcdHJldHVybiBjb2RlIC0gTlVNQkVSICsgMjYgKyAyNlxuXHRcdGlmIChjb2RlIDwgVVBQRVIgKyAyNilcblx0XHRcdHJldHVybiBjb2RlIC0gVVBQRVJcblx0XHRpZiAoY29kZSA8IExPV0VSICsgMjYpXG5cdFx0XHRyZXR1cm4gY29kZSAtIExPV0VSICsgMjZcblx0fVxuXG5cdGZ1bmN0aW9uIGI2NFRvQnl0ZUFycmF5IChiNjQpIHtcblx0XHR2YXIgaSwgaiwgbCwgdG1wLCBwbGFjZUhvbGRlcnMsIGFyclxuXG5cdFx0aWYgKGI2NC5sZW5ndGggJSA0ID4gMCkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHN0cmluZy4gTGVuZ3RoIG11c3QgYmUgYSBtdWx0aXBsZSBvZiA0Jylcblx0XHR9XG5cblx0XHQvLyB0aGUgbnVtYmVyIG9mIGVxdWFsIHNpZ25zIChwbGFjZSBob2xkZXJzKVxuXHRcdC8vIGlmIHRoZXJlIGFyZSB0d28gcGxhY2Vob2xkZXJzLCB0aGFuIHRoZSB0d28gY2hhcmFjdGVycyBiZWZvcmUgaXRcblx0XHQvLyByZXByZXNlbnQgb25lIGJ5dGVcblx0XHQvLyBpZiB0aGVyZSBpcyBvbmx5IG9uZSwgdGhlbiB0aGUgdGhyZWUgY2hhcmFjdGVycyBiZWZvcmUgaXQgcmVwcmVzZW50IDIgYnl0ZXNcblx0XHQvLyB0aGlzIGlzIGp1c3QgYSBjaGVhcCBoYWNrIHRvIG5vdCBkbyBpbmRleE9mIHR3aWNlXG5cdFx0dmFyIGxlbiA9IGI2NC5sZW5ndGhcblx0XHRwbGFjZUhvbGRlcnMgPSAnPScgPT09IGI2NC5jaGFyQXQobGVuIC0gMikgPyAyIDogJz0nID09PSBiNjQuY2hhckF0KGxlbiAtIDEpID8gMSA6IDBcblxuXHRcdC8vIGJhc2U2NCBpcyA0LzMgKyB1cCB0byB0d28gY2hhcmFjdGVycyBvZiB0aGUgb3JpZ2luYWwgZGF0YVxuXHRcdGFyciA9IG5ldyBBcnIoYjY0Lmxlbmd0aCAqIDMgLyA0IC0gcGxhY2VIb2xkZXJzKVxuXG5cdFx0Ly8gaWYgdGhlcmUgYXJlIHBsYWNlaG9sZGVycywgb25seSBnZXQgdXAgdG8gdGhlIGxhc3QgY29tcGxldGUgNCBjaGFyc1xuXHRcdGwgPSBwbGFjZUhvbGRlcnMgPiAwID8gYjY0Lmxlbmd0aCAtIDQgOiBiNjQubGVuZ3RoXG5cblx0XHR2YXIgTCA9IDBcblxuXHRcdGZ1bmN0aW9uIHB1c2ggKHYpIHtcblx0XHRcdGFycltMKytdID0gdlxuXHRcdH1cblxuXHRcdGZvciAoaSA9IDAsIGogPSAwOyBpIDwgbDsgaSArPSA0LCBqICs9IDMpIHtcblx0XHRcdHRtcCA9IChkZWNvZGUoYjY0LmNoYXJBdChpKSkgPDwgMTgpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAxKSkgPDwgMTIpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAyKSkgPDwgNikgfCBkZWNvZGUoYjY0LmNoYXJBdChpICsgMykpXG5cdFx0XHRwdXNoKCh0bXAgJiAweEZGMDAwMCkgPj4gMTYpXG5cdFx0XHRwdXNoKCh0bXAgJiAweEZGMDApID4+IDgpXG5cdFx0XHRwdXNoKHRtcCAmIDB4RkYpXG5cdFx0fVxuXG5cdFx0aWYgKHBsYWNlSG9sZGVycyA9PT0gMikge1xuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAyKSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMSkpID4+IDQpXG5cdFx0XHRwdXNoKHRtcCAmIDB4RkYpXG5cdFx0fSBlbHNlIGlmIChwbGFjZUhvbGRlcnMgPT09IDEpIHtcblx0XHRcdHRtcCA9IChkZWNvZGUoYjY0LmNoYXJBdChpKSkgPDwgMTApIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAxKSkgPDwgNCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDIpKSA+PiAyKVxuXHRcdFx0cHVzaCgodG1wID4+IDgpICYgMHhGRilcblx0XHRcdHB1c2godG1wICYgMHhGRilcblx0XHR9XG5cblx0XHRyZXR1cm4gYXJyXG5cdH1cblxuXHRmdW5jdGlvbiB1aW50OFRvQmFzZTY0ICh1aW50OCkge1xuXHRcdHZhciBpLFxuXHRcdFx0ZXh0cmFCeXRlcyA9IHVpbnQ4Lmxlbmd0aCAlIDMsIC8vIGlmIHdlIGhhdmUgMSBieXRlIGxlZnQsIHBhZCAyIGJ5dGVzXG5cdFx0XHRvdXRwdXQgPSBcIlwiLFxuXHRcdFx0dGVtcCwgbGVuZ3RoXG5cblx0XHRmdW5jdGlvbiBlbmNvZGUgKG51bSkge1xuXHRcdFx0cmV0dXJuIGxvb2t1cC5jaGFyQXQobnVtKVxuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIHRyaXBsZXRUb0Jhc2U2NCAobnVtKSB7XG5cdFx0XHRyZXR1cm4gZW5jb2RlKG51bSA+PiAxOCAmIDB4M0YpICsgZW5jb2RlKG51bSA+PiAxMiAmIDB4M0YpICsgZW5jb2RlKG51bSA+PiA2ICYgMHgzRikgKyBlbmNvZGUobnVtICYgMHgzRilcblx0XHR9XG5cblx0XHQvLyBnbyB0aHJvdWdoIHRoZSBhcnJheSBldmVyeSB0aHJlZSBieXRlcywgd2UnbGwgZGVhbCB3aXRoIHRyYWlsaW5nIHN0dWZmIGxhdGVyXG5cdFx0Zm9yIChpID0gMCwgbGVuZ3RoID0gdWludDgubGVuZ3RoIC0gZXh0cmFCeXRlczsgaSA8IGxlbmd0aDsgaSArPSAzKSB7XG5cdFx0XHR0ZW1wID0gKHVpbnQ4W2ldIDw8IDE2KSArICh1aW50OFtpICsgMV0gPDwgOCkgKyAodWludDhbaSArIDJdKVxuXHRcdFx0b3V0cHV0ICs9IHRyaXBsZXRUb0Jhc2U2NCh0ZW1wKVxuXHRcdH1cblxuXHRcdC8vIHBhZCB0aGUgZW5kIHdpdGggemVyb3MsIGJ1dCBtYWtlIHN1cmUgdG8gbm90IGZvcmdldCB0aGUgZXh0cmEgYnl0ZXNcblx0XHRzd2l0Y2ggKGV4dHJhQnl0ZXMpIHtcblx0XHRcdGNhc2UgMTpcblx0XHRcdFx0dGVtcCA9IHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDFdXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUodGVtcCA+PiAyKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKCh0ZW1wIDw8IDQpICYgMHgzRilcblx0XHRcdFx0b3V0cHV0ICs9ICc9PSdcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgMjpcblx0XHRcdFx0dGVtcCA9ICh1aW50OFt1aW50OC5sZW5ndGggLSAyXSA8PCA4KSArICh1aW50OFt1aW50OC5sZW5ndGggLSAxXSlcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSh0ZW1wID4+IDEwKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKCh0ZW1wID4+IDQpICYgMHgzRilcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSgodGVtcCA8PCAyKSAmIDB4M0YpXG5cdFx0XHRcdG91dHB1dCArPSAnPSdcblx0XHRcdFx0YnJlYWtcblx0XHR9XG5cblx0XHRyZXR1cm4gb3V0cHV0XG5cdH1cblxuXHRleHBvcnRzLnRvQnl0ZUFycmF5ID0gYjY0VG9CeXRlQXJyYXlcblx0ZXhwb3J0cy5mcm9tQnl0ZUFycmF5ID0gdWludDhUb0Jhc2U2NFxufSh0eXBlb2YgZXhwb3J0cyA9PT0gJ3VuZGVmaW5lZCcgPyAodGhpcy5iYXNlNjRqcyA9IHt9KSA6IGV4cG9ydHMpKVxuIiwiZXhwb3J0cy5yZWFkID0gZnVuY3Rpb24oYnVmZmVyLCBvZmZzZXQsIGlzTEUsIG1MZW4sIG5CeXRlcykge1xuICB2YXIgZSwgbSxcbiAgICAgIGVMZW4gPSBuQnl0ZXMgKiA4IC0gbUxlbiAtIDEsXG4gICAgICBlTWF4ID0gKDEgPDwgZUxlbikgLSAxLFxuICAgICAgZUJpYXMgPSBlTWF4ID4+IDEsXG4gICAgICBuQml0cyA9IC03LFxuICAgICAgaSA9IGlzTEUgPyAobkJ5dGVzIC0gMSkgOiAwLFxuICAgICAgZCA9IGlzTEUgPyAtMSA6IDEsXG4gICAgICBzID0gYnVmZmVyW29mZnNldCArIGldO1xuXG4gIGkgKz0gZDtcblxuICBlID0gcyAmICgoMSA8PCAoLW5CaXRzKSkgLSAxKTtcbiAgcyA+Pj0gKC1uQml0cyk7XG4gIG5CaXRzICs9IGVMZW47XG4gIGZvciAoOyBuQml0cyA+IDA7IGUgPSBlICogMjU2ICsgYnVmZmVyW29mZnNldCArIGldLCBpICs9IGQsIG5CaXRzIC09IDgpO1xuXG4gIG0gPSBlICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpO1xuICBlID4+PSAoLW5CaXRzKTtcbiAgbkJpdHMgKz0gbUxlbjtcbiAgZm9yICg7IG5CaXRzID4gMDsgbSA9IG0gKiAyNTYgKyBidWZmZXJbb2Zmc2V0ICsgaV0sIGkgKz0gZCwgbkJpdHMgLT0gOCk7XG5cbiAgaWYgKGUgPT09IDApIHtcbiAgICBlID0gMSAtIGVCaWFzO1xuICB9IGVsc2UgaWYgKGUgPT09IGVNYXgpIHtcbiAgICByZXR1cm4gbSA/IE5hTiA6ICgocyA/IC0xIDogMSkgKiBJbmZpbml0eSk7XG4gIH0gZWxzZSB7XG4gICAgbSA9IG0gKyBNYXRoLnBvdygyLCBtTGVuKTtcbiAgICBlID0gZSAtIGVCaWFzO1xuICB9XG4gIHJldHVybiAocyA/IC0xIDogMSkgKiBtICogTWF0aC5wb3coMiwgZSAtIG1MZW4pO1xufTtcblxuZXhwb3J0cy53cml0ZSA9IGZ1bmN0aW9uKGJ1ZmZlciwgdmFsdWUsIG9mZnNldCwgaXNMRSwgbUxlbiwgbkJ5dGVzKSB7XG4gIHZhciBlLCBtLCBjLFxuICAgICAgZUxlbiA9IG5CeXRlcyAqIDggLSBtTGVuIC0gMSxcbiAgICAgIGVNYXggPSAoMSA8PCBlTGVuKSAtIDEsXG4gICAgICBlQmlhcyA9IGVNYXggPj4gMSxcbiAgICAgIHJ0ID0gKG1MZW4gPT09IDIzID8gTWF0aC5wb3coMiwgLTI0KSAtIE1hdGgucG93KDIsIC03NykgOiAwKSxcbiAgICAgIGkgPSBpc0xFID8gMCA6IChuQnl0ZXMgLSAxKSxcbiAgICAgIGQgPSBpc0xFID8gMSA6IC0xLFxuICAgICAgcyA9IHZhbHVlIDwgMCB8fCAodmFsdWUgPT09IDAgJiYgMSAvIHZhbHVlIDwgMCkgPyAxIDogMDtcblxuICB2YWx1ZSA9IE1hdGguYWJzKHZhbHVlKTtcblxuICBpZiAoaXNOYU4odmFsdWUpIHx8IHZhbHVlID09PSBJbmZpbml0eSkge1xuICAgIG0gPSBpc05hTih2YWx1ZSkgPyAxIDogMDtcbiAgICBlID0gZU1heDtcbiAgfSBlbHNlIHtcbiAgICBlID0gTWF0aC5mbG9vcihNYXRoLmxvZyh2YWx1ZSkgLyBNYXRoLkxOMik7XG4gICAgaWYgKHZhbHVlICogKGMgPSBNYXRoLnBvdygyLCAtZSkpIDwgMSkge1xuICAgICAgZS0tO1xuICAgICAgYyAqPSAyO1xuICAgIH1cbiAgICBpZiAoZSArIGVCaWFzID49IDEpIHtcbiAgICAgIHZhbHVlICs9IHJ0IC8gYztcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWUgKz0gcnQgKiBNYXRoLnBvdygyLCAxIC0gZUJpYXMpO1xuICAgIH1cbiAgICBpZiAodmFsdWUgKiBjID49IDIpIHtcbiAgICAgIGUrKztcbiAgICAgIGMgLz0gMjtcbiAgICB9XG5cbiAgICBpZiAoZSArIGVCaWFzID49IGVNYXgpIHtcbiAgICAgIG0gPSAwO1xuICAgICAgZSA9IGVNYXg7XG4gICAgfSBlbHNlIGlmIChlICsgZUJpYXMgPj0gMSkge1xuICAgICAgbSA9ICh2YWx1ZSAqIGMgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pO1xuICAgICAgZSA9IGUgKyBlQmlhcztcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IHZhbHVlICogTWF0aC5wb3coMiwgZUJpYXMgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pO1xuICAgICAgZSA9IDA7XG4gICAgfVxuICB9XG5cbiAgZm9yICg7IG1MZW4gPj0gODsgYnVmZmVyW29mZnNldCArIGldID0gbSAmIDB4ZmYsIGkgKz0gZCwgbSAvPSAyNTYsIG1MZW4gLT0gOCk7XG5cbiAgZSA9IChlIDw8IG1MZW4pIHwgbTtcbiAgZUxlbiArPSBtTGVuO1xuICBmb3IgKDsgZUxlbiA+IDA7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IGUgJiAweGZmLCBpICs9IGQsIGUgLz0gMjU2LCBlTGVuIC09IDgpO1xuXG4gIGJ1ZmZlcltvZmZzZXQgKyBpIC0gZF0gfD0gcyAqIDEyODtcbn07XG4iLCJcbi8qKlxuICogaXNBcnJheVxuICovXG5cbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheTtcblxuLyoqXG4gKiB0b1N0cmluZ1xuICovXG5cbnZhciBzdHIgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG4vKipcbiAqIFdoZXRoZXIgb3Igbm90IHRoZSBnaXZlbiBgdmFsYFxuICogaXMgYW4gYXJyYXkuXG4gKlxuICogZXhhbXBsZTpcbiAqXG4gKiAgICAgICAgaXNBcnJheShbXSk7XG4gKiAgICAgICAgLy8gPiB0cnVlXG4gKiAgICAgICAgaXNBcnJheShhcmd1bWVudHMpO1xuICogICAgICAgIC8vID4gZmFsc2VcbiAqICAgICAgICBpc0FycmF5KCcnKTtcbiAqICAgICAgICAvLyA+IGZhbHNlXG4gKlxuICogQHBhcmFtIHttaXhlZH0gdmFsXG4gKiBAcmV0dXJuIHtib29sfVxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gaXNBcnJheSB8fCBmdW5jdGlvbiAodmFsKSB7XG4gIHJldHVybiAhISB2YWwgJiYgJ1tvYmplY3QgQXJyYXldJyA9PSBzdHIuY2FsbCh2YWwpO1xufTtcbiIsIlxyXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuIyBwb2x5ZmlsbCBmb3Igd2luZG93LnBlcmZvcm1hbmNlLm5vdygpIGZyb20gaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vcGF1bGlyaXNoLzU0Mzg2NTBcclxuZG8gLT5cclxuICAjIHByZXBhcmUgYmFzZSBwZXJmIG9iamVjdFxyXG4gIGlmIHR5cGVvZiB3aW5kb3cucGVyZm9ybWFuY2U9PSd1bmRlZmluZWQnXHJcbiAgICB3aW5kb3cucGVyZm9ybWFuY2UgPSB7fVxyXG4gIGlmIG5vdCB3aW5kb3cucGVyZm9ybWFuY2Uubm93XHJcbiAgICAjIGNvbnNvbGUubG9nIFwicG9seWZpbGxpbmcgd2luZG93LnBlcmZvcm1hbmNlLm5vdygpXCJcclxuICAgIG5vd09mZnNldCA9ICtuZXcgRGF0ZSgpXHJcbiAgICBpZiBwZXJmb3JtYW5jZS50aW1pbmcgYW5kIHBlcmZvcm1hbmNlLnRpbWluZ1xyXG4gICAgICBub3dPZmZzZXQgPSBwZXJmb3JtYW5jZS50aW1pbmcubmF2aWdhdGlvblN0YXJ0XHJcbiAgICB3aW5kb3cucGVyZm9ybWFuY2Uubm93ID0gLT5cclxuICAgICAgbm93ID0gK25ldyBEYXRlKClcclxuICAgICAgcmV0dXJuIG5vdyAtIG5vd09mZnNldFxyXG5cclxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiMgQmVhdE1ha2VyXHJcblxyXG5jbGFzcyBCZWF0TWFrZXJcclxuICBjb25zdHJ1Y3RvcjogLT5cclxuICAgIEByZXNldCgpXHJcblxyXG4gIHNldElucHV0VGV4dDogKHRleHQpIC0+XHJcbiAgICAkKFwiI2JlYXRpbnB1dFwiKS52YWwodGV4dClcclxuXHJcbiAgc2V0T3V0cHV0VGV4dDogKHRleHQpIC0+XHJcbiAgICAkKFwiI2JlYXRvdXRwdXRcIikuaHRtbCh0ZXh0KVxyXG5cclxuICBlcnJvcjogKHRleHQpIC0+XHJcbiAgICBAc2V0SW5wdXRUZXh0KFwiIEVSUk9SOiAje3RleHR9XCIpXHJcblxyXG4gIHJlc2V0OiAobm90ZSkgLT5cclxuICAgIEBrZXlEb3duQ291bnQgPSAwXHJcbiAgICBAa2V5RG93blRpbWUgPSB7fVxyXG4gICAgQHJlY29yZGluZyA9IGZhbHNlXHJcbiAgICBAbm90ZXMgPSBbXVxyXG4gICAgbm90ZSA/PSBcIlwiXHJcbiAgICBAc2V0SW5wdXRUZXh0KFwiI3tub3RlfSBDbGljayBoZXJlIGFuZCBoaXQgdXNlIEEtWiBrZXlzIHRvIG1ha2UgYSBuZXcgYmVhdCAocGxlYXNlIGxvb3AgdGhlIGZ1bGwgcGF0dGVybiBleGFjdGx5IHR3aWNlKVwiKVxyXG5cclxuICB1cGRhdGVSZWNvcmRpbmc6IC0+XHJcbiAgICByZXR1cm4gaWYgbm90IEByZWNvcmRpbmdcclxuICAgIG5vdyA9IHdpbmRvdy5wZXJmb3JtYW5jZS5ub3coKVxyXG4gICAgaWYgbm93ID4gKEBsYXN0S2V5RXZlbnQgKyAyMDAwKVxyXG4gICAgICAkKFwiI2JlYXRpbnB1dFwiKS52YWwoXCIgUmVjb3JkaW5nICgje01hdGguZmxvb3IoNDAwMCAtIChub3cgLSBAbGFzdEtleUV2ZW50KSl9IG1zIGxlZnQuLi4pLi4uXCIpXHJcbiAgICBlbHNlXHJcbiAgICAgICQoXCIjYmVhdGlucHV0XCIpLnZhbChcIiBSZWNvcmRpbmcuLi5cIilcclxuXHJcbiAgc3RhcnRSZWNvcmRpbmc6IC0+XHJcbiAgICBAcmVjb3JkaW5nID0gdHJ1ZVxyXG4gICAgQHVwZGF0ZVJlY29yZGluZygpXHJcblxyXG4gIHN0b3BSZWNvcmRpbmc6IC0+XHJcbiAgICByZWNvcmRlZE5vdGVzID0gQG5vdGVzXHJcbiAgICBAcmVzZXQoXCIgUmVjb3JkaW5nIGZpbmlzaGVkLlwiKVxyXG4gICAgQGdlbmVyYXRlKHJlY29yZGVkTm90ZXMpXHJcblxyXG4gIGtleURvd246IChrZXksIHRzKSAtPlxyXG4gICAgcmV0dXJuIGlmIEBrZXlEb3duVGltZS5oYXNPd25Qcm9wZXJ0eShrZXkpXHJcbiAgICBAbGFzdEtleUV2ZW50ID0gd2luZG93LnBlcmZvcm1hbmNlLm5vdygpXHJcbiAgICBpZiBub3QgQHJlY29yZGluZ1xyXG4gICAgICBAc3RhcnRSZWNvcmRpbmcoKVxyXG5cclxuICAgICMgY29uc29sZS5sb2coXCJET1dOOiAje2tleX0gKCN7dHN9KVwiKVxyXG4gICAgQGtleURvd25UaW1lW2tleV0gPSB0c1xyXG4gICAgQGtleURvd25Db3VudCsrXHJcblxyXG4gIGtleVVwOiAoa2V5LCB0cykgLT5cclxuICAgIHJldHVybiBpZiBub3QgQHJlY29yZGluZ1xyXG4gICAgQGxhc3RLZXlFdmVudCA9IHdpbmRvdy5wZXJmb3JtYW5jZS5ub3coKVxyXG4gICAgIyBjb25zb2xlLmxvZyhcIlVQICA6ICN7a2V5fSAoI3t0c30pXCIpXHJcbiAgICBAbm90ZXMucHVzaCB7XHJcbiAgICAgIGtleToga2V5XHJcbiAgICAgIHN0YXJ0OiBAa2V5RG93blRpbWVba2V5XVxyXG4gICAgICBlbmQ6IHRzXHJcbiAgICB9XHJcbiAgICBkZWxldGUgQGtleURvd25UaW1lW2tleV1cclxuICAgIEBrZXlEb3duQ291bnQtLVxyXG5cclxuICB0aWNrOiAtPlxyXG4gICAgcmV0dXJuIGlmIG5vdCBAcmVjb3JkaW5nXHJcbiAgICBAdXBkYXRlUmVjb3JkaW5nKClcclxuICAgIHJldHVybiBpZiBAa2V5RG93bkNvdW50ID4gMFxyXG4gICAgbm93ID0gd2luZG93LnBlcmZvcm1hbmNlLm5vdygpXHJcbiAgICBpZiBub3cgPiAoQGxhc3RLZXlFdmVudCArIDQwMDApXHJcbiAgICAgIEBzdG9wUmVjb3JkaW5nKClcclxuXHJcbiAgZ2VuZXJhdGU6IChub3RlcykgLT5cclxuXHJcbiAgICBub3Rlcy5zb3J0IChhLCBiKSAtPlxyXG4gICAgICBhLnN0YXJ0IC0gYi5zdGFydFxyXG5cclxuICAgIGlmIChub3Rlcy5sZW5ndGggJSAyKSAhPSAwXHJcbiAgICAgIEBlcnJvciBcIk9kZCBjb3VudCBvZiBub3RlcyEgUGxlYXNlIGxvb3AgeW91ciBiZWF0IGV4YWN0bHkgdHdpY2UuXCJcclxuICAgICAgcmV0dXJuXHJcblxyXG4gICAgYmVhdCA9IFwiXCJcclxuXHJcbiAgICBiZWF0U3RhcnQgPSBub3Rlc1swXS5zdGFydFxyXG4gICAgbm90ZUNvdW50ID0gbm90ZXMubGVuZ3RoID4+IDFcclxuICAgIGJlYXRUaW1lID0gbm90ZXNbbm90ZUNvdW50XS5zdGFydCAtIGJlYXRTdGFydFxyXG4gICAgYmVhdCArPSBcIiMgI3tub3RlQ291bnR9IG5vdGVzLCB0b3RhbCB0aW1lICN7YmVhdFRpbWV9IHNlY29uZHNcXG5cIlxyXG5cclxuICAgIGJhc2VCUE0gPSBNYXRoLmZsb29yKDEyMDAwMCAvIGJlYXRUaW1lKVxyXG4gICAgd2hpbGUgKGJhc2VCUE0gPiA2MClcclxuICAgICAgYmFzZUJQTSA+Pj0gMVxyXG4gICAgYmVhdCArPSBcIiMgQlBNIGd1ZXNzZXM6ICN7YmFzZUJQTX0sICN7YmFzZUJQTSAqIDJ9LCAje2Jhc2VCUE0gKiA0fVxcblwiXHJcblxyXG4gICAgYmVhdCArPSBcIlxcbiMgSGVyZSBpcyB5b3VyIGJlYXQgYXQgdmFyaW91cyBsZXZlbHMgb2YgZ3JhbnVsYXJpdHk6XFxuXCJcclxuXHJcbiAgICBrZXlOb3RlcyA9IHt9XHJcbiAgICBmb3Igbm90ZUluZGV4IGluIFswLi4ubm90ZUNvdW50XVxyXG4gICAgICBub3RlID0gbm90ZXNbbm90ZUluZGV4XVxyXG4gICAgICBpZiBub3Qga2V5Tm90ZXMuaGFzT3duUHJvcGVydHkobm90ZS5rZXkpXHJcbiAgICAgICAga2V5Tm90ZXNbbm90ZS5rZXldID0gW11cclxuICAgICAga2V5Tm90ZXNbbm90ZS5rZXldLnB1c2gge1xyXG4gICAgICAgIHN0YXJ0OiBub3RlLnN0YXJ0IC0gYmVhdFN0YXJ0XHJcbiAgICAgICAgbGVuZ3RoOiBub3RlLmVuZCAtIG5vdGUuc3RhcnRcclxuICAgICAgfVxyXG5cclxuICAgIHBpZWNlQ291bnQgPSA4XHJcbiAgICBwaWVjZVRpbWUgPSAwXHJcbiAgICBmb3IgbG9vcENvdW50IGluIFswLi4uM11cclxuICAgICAgcGllY2VDb3VudCA8PD0gMVxyXG4gICAgICBjb25zb2xlLmxvZyBcInRyeWluZyB0byBmaXQgaW4gI3twaWVjZUNvdW50fSBwaWVjZXNcIlxyXG5cclxuICAgICAgYmVhdCArPSBcIlxcbmxvb3AgcGF0dGVybiN7cGllY2VDb3VudH1cXG5cIlxyXG5cclxuICAgICAgcGllY2VUaW1lID0gYmVhdFRpbWUgLyBwaWVjZUNvdW50XHJcbiAgICAgIGZvciBrZXksIG5vdGVzIG9mIGtleU5vdGVzXHJcbiAgICAgICAgY29uc29sZS5sb2cgXCIqIGZpdHRpbmcga2V5ICN7a2V5fVwiXHJcbiAgICAgICAgcGllY2VTZWVuID0gW11cclxuICAgICAgICBmb3IgaSBpbiBbMC4uLnBpZWNlQ291bnRdXHJcbiAgICAgICAgICBwaWVjZVNlZW5baV0gPSBmYWxzZVxyXG5cclxuICAgICAgICBmb3Igbm90ZSBpbiBub3Rlc1xyXG4gICAgICAgICAgcGllY2VJbmRleCA9IE1hdGguZmxvb3IoKG5vdGUuc3RhcnQgKyAocGllY2VUaW1lIC8gMikpIC8gcGllY2VUaW1lKVxyXG4gICAgICAgICAgY29uc29sZS5sb2cgXCJwaWVjZSBpbmRleCBmb3IgI3tub3RlLnN0YXJ0fSBpcyAje3BpZWNlSW5kZXh9XCJcclxuICAgICAgICAgIGlmIHBpZWNlU2VlbltwaWVjZUluZGV4XVxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyBcImFscmVhZHkgc2F3IGluZGV4ICN7cGllY2VJbmRleH0gZm9yIGtleSAje2tleX0sIGRvdWJsaW5nIHBpZWNlQ291bnRcIlxyXG4gICAgICAgICAgICBsb29wQ291bnQgPSAwXHJcbiAgICAgICAgICAgIGNvbnRpbnVlXHJcblxyXG4gICAgICBmb3Iga2V5LCBub3RlcyBvZiBrZXlOb3Rlc1xyXG4gICAgICAgIGNvbnNvbGUubG9nIFwiKiByZW5kZXJpbmcga2V5ICN7a2V5fVwiXHJcbiAgICAgICAgcGllY2VzID0gW11cclxuICAgICAgICBmb3IgaSBpbiBbMC4uLnBpZWNlQ291bnRdXHJcbiAgICAgICAgICBwaWVjZXNbaV0gPSBcIi5cIlxyXG5cclxuICAgICAgICBmb3Igbm90ZSBpbiBub3Rlc1xyXG4gICAgICAgICAgcGllY2VJbmRleCA9IE1hdGguZmxvb3IoKG5vdGUuc3RhcnQgKyAocGllY2VUaW1lIC8gMikpIC8gcGllY2VUaW1lKVxyXG4gICAgICAgICAgY29uc29sZS5sb2cgXCJwaWVjZSBpbmRleCBmb3IgI3tub3RlLnN0YXJ0fSBpcyAje3BpZWNlSW5kZXh9XCJcclxuICAgICAgICAgIHBpZWNlc1twaWVjZUluZGV4XSA9IFwieFwiXHJcblxyXG4gICAgICAgIGJlYXQgKz0gXCIgIHBhdHRlcm4gI3trZXl9IFwiICsgcGllY2VzLmpvaW4oXCJcIikgKyBcIlxcblwiXHJcblxyXG4gICAgY29uc29sZS5sb2cga2V5Tm90ZXNcclxuXHJcbiAgICBAc2V0T3V0cHV0VGV4dChiZWF0KVxyXG5cclxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiMgbWFpblxyXG5cclxubWFpbiA9IC0+XHJcbiAgYmVhdG1ha2VyID0gbmV3IEJlYXRNYWtlclxyXG5cclxuICAkKCcjYmVhdGlucHV0Jykua2V5ZG93biAoZXZlbnQpIC0+XHJcbiAgICBrZXlDb2RlID0gcGFyc2VJbnQoZXZlbnQua2V5Q29kZSlcclxuICAgIGlmIChrZXlDb2RlIDwgNjUpIG9yIChrZXlDb2RlID4gOTApXHJcbiAgICAgIHJldHVyblxyXG5cclxuICAgIGtleSA9IFN0cmluZy5mcm9tQ2hhckNvZGUoZXZlbnQua2V5Q29kZSlcclxuICAgIG5vdyA9IHdpbmRvdy5wZXJmb3JtYW5jZS5ub3coKVxyXG4gICAgYmVhdG1ha2VyLmtleURvd24oa2V5LCBub3cpXHJcblxyXG4gICQoJyNiZWF0aW5wdXQnKS5rZXl1cCAoZXZlbnQpIC0+XHJcbiAgICBrZXlDb2RlID0gcGFyc2VJbnQoZXZlbnQua2V5Q29kZSlcclxuICAgIGlmIChrZXlDb2RlIDwgNjUpIG9yIChrZXlDb2RlID4gOTApXHJcbiAgICAgIHJldHVyblxyXG5cclxuICAgIGtleSA9IFN0cmluZy5mcm9tQ2hhckNvZGUoZXZlbnQua2V5Q29kZSlcclxuICAgIG5vdyA9IHdpbmRvdy5wZXJmb3JtYW5jZS5ub3coKVxyXG4gICAgYmVhdG1ha2VyLmtleVVwKGtleSwgbm93KVxyXG5cclxuICBzZXRJbnRlcnZhbCggLT5cclxuICAgIGJlYXRtYWtlci50aWNrKClcclxuICAsIDI1MCk7XHJcblxyXG5tYWluKClcclxubW9kdWxlLmV4cG9ydHMgPVxyXG4gIGxlbDogXCJwbGF5elwiXHJcbiIsIm1vZHVsZS5leHBvcnRzID1cclxuXHJcbiAgZmlyc3Q6IFwiXCJcIlxyXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4jIFlvdXIgZmlyc3QgTG9vcFNjcmlwdC4gQ2xpY2sgXCJDb21waWxlXCIgYmVsb3cgdG8gc3RhcnQhXHJcblxyXG50b25lIG5vdGUxXHJcbiAgZHVyYXRpb24gMjUwXHJcbiAgb2N0YXZlIDRcclxuICBub3RlIENcclxuXHJcbnRvbmUgYmFzczFcclxuICBkdXJhdGlvbiAyNTBcclxuICBvY3RhdmUgMVxyXG4gIG5vdGUgQlxyXG5cclxubG9vcCBsb29wMVxyXG4gIHBhdHRlcm4gbm90ZTEgeC4uLi4uLi54Li4uLi4uLlxyXG4gIHBhdHRlcm4gYmFzczEgLi4uLnguLi4uLi4ueC4uLlxyXG5cclxuXCJcIlwiXHJcblxyXG4gIG5vdGVzOiBcIlwiXCJcclxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuIyBOb3RlIG92ZXJyaWRlcyFcclxuXHJcbiMgSC1MIGFyZSB0aGUgYmxhY2sga2V5czpcclxuIyAgICAgSCBJICAgSiBLIExcclxuIyAgICBDIEQgRSBGIEcgQSBCXHJcblxyXG4jIFRyeSBzZXR0aW5nIHRoZSBkdXJhdGlvbiB0byAxMDBcclxudG9uZSBub3RlMVxyXG4gIGFkc3IgMC4wMDUgMC4wNSAwLjcgMC4wNVxyXG4gIGR1cmF0aW9uIDI1MFxyXG5cclxuIyBTYW1wbGVzIGNhbiBoYXZlIHRoZWlyIG5vdGVzIG92ZXJyaWRkZW4gdG9vIVxyXG5zYW1wbGUgZGluZ1xyXG4gIHNyYyBzYW1wbGVzL2RpbmdfZS53YXZcclxuICBzcmNub3RlIGVcclxuXHJcbmxvb3AgbG9vcDFcclxuICBwYXR0ZXJuIG5vdGUxIGIuYS5nLmEuYi5iLmIuLi5cclxuXHJcbmxvb3AgbG9vcDJcclxuICBwYXR0ZXJuIGRpbmcgYi5hLmcuYS5iLmIuYi4uLlxyXG5cclxudHJhY2sgc29uZ1xyXG4gIHBhdHRlcm4gbG9vcDEgeFxyXG4gIHBhdHRlcm4gbG9vcDIgLnhcclxuXHJcblwiXCJcIlxyXG5cclxuICBtb3R0bzogXCJcIlwiXHJcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiMgQW4gYXBwcm94aW1hdGlvbiBvZiB0aGUgYmVhdCBmcm9tIERyYWtlJ3MgXCJUaGUgTW90dG9cIlxyXG5cclxuYnBtIDEwMFxyXG5zZWN0aW9uICMgdG8gc2hhcmUgQURTUlxyXG4gIGFkc3IgMC4wMDUgMC4wNSAwLjcgMC4wNVxyXG4gIHRvbmUgYmFzczEgLT4gb2N0YXZlIDFcclxuICB0b25lIGJhc3MyIC0+IG9jdGF2ZSAyXHJcblxyXG5zYW1wbGUgY2xhcCAgLT4gc3JjIHNhbXBsZXMvY2xhcC53YXZcclxuc2FtcGxlIHNuYXJlIC0+IHNyYyBzYW1wbGVzL3NuYXJlLndhdlxyXG5zYW1wbGUgaGloYXQgLT4gc3JjIHNhbXBsZXMvaGloYXQud2F2XHJcblxyXG5sb29wIGxvb3AxXHJcbiAgcGF0dGVybiBoaWhhdCAuLnguLi4uLi4ueC4uLi4uLi54Li4uLi4uLnguLi4uLlxyXG4gIHBhdHRlcm4gY2xhcCAgLi4uLnguLi4uLi4ueC4uLi4uLi54Li4uLi4uLnguLi5cclxuICBwYXR0ZXJuIHNuYXJlIC4uLi4uLnguLi54Li4ueC54Li4uLi4uLi4uLi4uLi4uXHJcbiAgcGF0dGVybiBiYXNzMSBCYmJiYmIuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxyXG4gIHBhdHRlcm4gYmFzczIgLi4uLi4uSGhoaGhoRGRkZGRkLi4uLkhoaGhKai5Kai5cclxuXHJcbnRyYWNrIHNvbmdcclxuICBwYXR0ZXJuIGxvb3AxIHh4eHhcclxuXHJcblwiXCJcIlxyXG5cclxuICBsZW5ndGg6IFwiXCJcIlxyXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4jIFNob3dpbmcgb2ZmIHZhcmlvdXMgbm90ZSBsZW5ndGhzIHVzaW5nIGNhcHMgYW5kIGxvd2VyY2FzZVxyXG4jIEFsc28gc2hvd3Mgd2hhdCBBRFNSIGNhbiBkbyFcclxuXHJcbnRvbmUgbm90ZTFcclxuICBhZHNyIDAuMDA1IDAuMDUgMC43IDAuMDVcclxuXHJcbnRvbmUgbm90ZTJcclxuICAjIE5vdGU6IE9ubHkgdGhlIGZpcnN0IHRvbmUgaGFzIEFEU1JcclxuXHJcbiMgSWYgeW91IHVzZSBhbnkgbGV0dGVycyBvdGhlciB0aGFuIFwieFwiIG9uIGEgdG9uZSBwYXR0ZXJuLCB5b3Ugb3ZlcnJpZGUgaXRzXHJcbiMgbm90ZSB3aXRoIHRoZSBub3RlIGxpc3RlZC4gQWxzbywgaWYgeW91IHVzZSBhbnkgY2FwaXRhbCBsZXR0ZXJzIGluIGEgcGF0dGVybixcclxuIyB5b3Ugb3ZlcnJpZGUgdGhlIGxlbmd0aCBvZiB0aGF0IG5vdGUgd2l0aCB0aGUgbnVtYmVyIG9mIG1hdGNoaW5nIGxvd2VyY2FzZVxyXG4jIGxldHRlcnMgZm9sbG93aW5nIGl0LlxyXG5cclxubG9vcCBsb29wMVxyXG4gIHBhdHRlcm4gbm90ZTEgR2dnZ2dnZ2dGZmZmZmYuLkFhYWFCYmIuQ2MuLkQuLi5cclxuXHJcbmxvb3AgbG9vcDJcclxuICBwYXR0ZXJuIG5vdGUyIEdnZ2dnZ2dnRmZmZmZmLi5BYWFhQmJiLkNjLi5ELi4uXHJcblxyXG50cmFjayBzb25nXHJcbiAgcGF0dGVybiBsb29wMSB4LlxyXG4gIHBhdHRlcm4gbG9vcDIgLnhcclxuXHJcblwiXCJcIlxyXG5cclxuICBjaG9jb2JvOiBcIlwiXCJcclxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuIyBUaGUgQ2hvY29ibyBUaGVtZSAoZmlyc3QgcGFydCBvbmx5KVxyXG5cclxuYnBtIDEyNVxyXG5cclxuc2VjdGlvbiBUb25lIChpbiBhIHNlY3Rpb24gdG8gc2hhcmUgQURTUilcclxuICBhZHNyIDAuMDA1IDAuMDUgMC43IDAuMDVcclxuICB0b25lIGNob2NvYm8xXHJcbiAgICBvY3RhdmUgNVxyXG4gIHRvbmUgY2hvY29ibzJcclxuICAgIG9jdGF2ZSA0XHJcblxyXG5sb29wIGxvb3AxXHJcbiBwYXR0ZXJuIGNob2NvYm8xIERkZGQuLi4uLi5EZC4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLkQuRS5GZmZmZmYuLi5cclxuIHBhdHRlcm4gY2hvY29ibzIgLi4uLkJiR2dFZS4uQmJHZ0JiLi5HZy4uQmJiYmJiLkFhR2dHQUcuRi5HZ2dnZ2cuRi5HZ0dCLi4uLi4uLi4uLi4uLlxyXG5cclxudHJhY2sgc29uZ1xyXG4gIHBhdHRlcm4gbG9vcDEgeHhcclxuXCJcIlwiXHJcblxyXG4gIGtpY2s6IFwiXCJcIlxyXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4jIEJhc3Mga2ljayAobWl4aW5nIGEgc2ltcGxlIGtpY2sgd2l0aCBhIHN1c3RhaW5lZCBiYXNzIHNpbmUpXHJcbiMgVHJ5IGNoYW5naW5nICdmcmVxJyB0byBhbnl3aGVyZSBpbiA1NS04MCwgYW5kL29yICdkdXJhdGlvbidcclxuXHJcbnRvbmUgbm90ZTFcclxuICBhZHNyIDAuMDA1IDAuMDUgMC43IDAuMDVcclxuICBmcmVxIDYwXHJcbiAgZHVyYXRpb24gMTUwMFxyXG5cclxuc2FtcGxlIGtpY2tcclxuICBzcmMgc2FtcGxlcy9raWNrMy53YXZcclxuXHJcbnRyYWNrIEJhc3NLaWNrXHJcbiAgcGF0dGVybiBub3RlMSB4XHJcbiAgcGF0dGVybiBraWNrICB4XHJcblxyXG5cIlwiXCJcclxuXHJcbiAga2lja3BhdHRlcm46IFwiXCJcIlxyXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4jIFNpbXBsZSBraWNrIHBhdHRlcm5cclxuXHJcbmJwbSA5MFxyXG5cclxudG9uZSBub3RlMVxyXG4gIGFkc3IgMC4wMDUgMC4wNSAwLjcgMC4wNVxyXG4gIG9jdGF2ZSAxXHJcbiAgZHVyYXRpb24gMTUwMFxyXG5cclxuc2FtcGxlIGtpY2tcclxuICBzcmMgc2FtcGxlcy9raWNrMy53YXZcclxuXHJcbnNhbXBsZSBjbGFwXHJcbiAgc3JjIHNhbXBsZXMvY2xhcC53YXZcclxuXHJcbmxvb3AgbG9vcDFcclxuICBwYXR0ZXJuIGNsYXAgIC4uLi54Li4uLi4uLnguLi5cclxuICBwYXR0ZXJuIG5vdGUxIGIuYi4uLmIuYi5iLi4uLi5cclxuICBwYXR0ZXJuIGtpY2sgIHgueC4uLngueC54Li4uLi5cclxuXHJcbnRyYWNrIGRlcnBcclxuICBwYXR0ZXJuIGxvb3AxIHh4eHhcclxuXHJcblwiXCJcIlxyXG5cclxuICB3aWdnbGU6IFwiXCJcIlxyXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4jIEEgc2lsbHkgYXBwcm94aW1hdGlvbiBvZiBKYXNvbiBEZXJ1bG8ncyBXaWdnbGVcclxuXHJcbmJwbSA4MlxyXG5cclxudG9uZSBiYXNzXHJcbiAgYWRzciAwLjAwNSAwLjA1IDAuNyAwLjA1XHJcbiAgZHVyYXRpb24gMTUwMFxyXG4gIG9jdGF2ZSAyXHJcblxyXG5zYW1wbGUga2lja1xyXG4gIHNyYyBzYW1wbGVzL2tpY2szLndhdlxyXG5cclxuc2FtcGxlIHNuYXBcclxuICB2b2x1bWUgMC41XHJcbiAgc3JjIHNhbXBsZXMvc25hcC53YXZcclxuXHJcbmxvb3AgbG9vcDFcclxuICBwYXR0ZXJuIHNuYXAgLi4uLnguLi4uLi4ueC4uLlxyXG4gIHBhdHRlcm4ga2ljayB4Li54Li54Li4uLi4uLi4uXHJcbiAgcGF0dGVybiBiYXNzIGEuLmYuLmUuLi4uLi4uLi5cclxuXHJcbnRyYWNrIHdpZ2dsZVxyXG4gIHBhdHRlcm4gbG9vcDEgeHh4eFxyXG5cIlwiXCJcclxuXHJcbiAgZ2FtYmlubzMwMDU6IFwiXCJcIlxyXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4jIENoaWxkaXNoIEdhbWJpbm8gLSAzMDA1IChpbnRybylcclxuXHJcbmJwbSA4M1xyXG5cclxuc2FtcGxlIHoxICAgLT4gc3JjIHNhbXBsZXMvMzAwNV96YXAxLndhdlxyXG5zYW1wbGUgejIgICAtPiBzcmMgc2FtcGxlcy8zMDA1X3phcDIud2F2XHJcbnNhbXBsZSB6MyAgIC0+IHNyYyBzYW1wbGVzLzMwMDVfemFwMy53YXZcclxuc2FtcGxlIHJpbSAgLT4gc3JjIHNhbXBsZXMvMzAwNV9yaW0ud2F2XHJcbnNhbXBsZSBraWNrIC0+IHNyYyBzYW1wbGVzL2tpY2szLndhdlxyXG5cclxudG9uZSBiYXNzXHJcbiAgYWRzciAwLjAwNSAwLjA1IDAuOSAwLjVcclxuICBkdXJhdGlvbiAxNTAwXHJcbiAgZnJlcSA1NVxyXG4gIHZvbHVtZSAxLjJcclxuXHJcbmxvb3AgemFwbG9vcFxyXG4gIHBhdHRlcm4gejEgeC4ueC4ueC4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cclxuICBwYXR0ZXJuIHoyIC4uLi4uLi4ueC4ueC4ueC4uLi4uLi4uLnguLnguLnguXHJcbiAgcGF0dGVybiB6MyAuLi4uLi4uLi4uLi4uLi4ueC4ueC4ueC4uLi4uLi4uLlxyXG5cclxubG9vcCByaW1sb29wXHJcbiAgcGF0dGVybiByaW0gLi4uLnguLngueC4ueC4uLi4uLi54Li54LnguLnguLi5cclxuXHJcbmxvb3AgYmFzc2xvb3BcclxuICBwYXR0ZXJuIGtpY2sgeC4uLi4ueC4uLnguLi4uLnguLi4uLnguLi54Li4uLi5cclxuICBwYXR0ZXJuIGJhc3MgeC4uLi4ueC4uLnguLi4uLnguLi4uLnguLi54Li4uLi5cclxuXHJcbnRyYWNrIDMwMDVcclxuICBwYXR0ZXJuIHphcGxvb3AgIHh4eHh4eHh4eHhcclxuICBwYXR0ZXJuIHJpbWxvb3AgIC4ueHguLnh4eHhcclxuICBwYXR0ZXJuIGJhc3Nsb29wIC4uLi54eHh4eHhcclxuXHJcblwiXCJcIiIsImZyZXFUYWJsZSA9IFtcclxuICB7ICMgT2N0YXZlIDBcclxuXHJcbiAgICBcImFcIjogMjcuNTAwMFxyXG4gICAgXCJsXCI6IDI5LjEzNTNcclxuICAgIFwiYlwiOiAzMC44Njc3XHJcbiAgfVxyXG5cclxuICB7ICMgT2N0YXZlIDFcclxuICAgIFwiY1wiOiAzMi43MDMyXHJcbiAgICBcImhcIjogMzQuNjQ3OVxyXG4gICAgXCJkXCI6IDM2LjcwODFcclxuICAgIFwiaVwiOiAzOC44OTA5XHJcbiAgICBcImVcIjogNDEuMjAzNVxyXG4gICAgXCJmXCI6IDQzLjY1MzZcclxuICAgIFwialwiOiA0Ni4yNDkzXHJcbiAgICBcImdcIjogNDguOTk5NVxyXG4gICAgXCJrXCI6IDUxLjkxMzBcclxuICAgIFwiYVwiOiA1NS4wMDAwXHJcbiAgICBcImxcIjogNTguMjcwNVxyXG4gICAgXCJiXCI6IDYxLjczNTRcclxuICB9XHJcblxyXG4gIHsgIyBPY3RhdmUgMlxyXG4gICAgXCJjXCI6IDY1LjQwNjRcclxuICAgIFwiaFwiOiA2OS4yOTU3XHJcbiAgICBcImRcIjogNzMuNDE2MlxyXG4gICAgXCJpXCI6IDc3Ljc4MTdcclxuICAgIFwiZVwiOiA4Mi40MDY5XHJcbiAgICBcImZcIjogODcuMzA3MVxyXG4gICAgXCJqXCI6IDkyLjQ5ODZcclxuICAgIFwiZ1wiOiA5Ny45OTg5XHJcbiAgICBcImtcIjogMTAzLjgyNlxyXG4gICAgXCJhXCI6IDExMC4wMDBcclxuICAgIFwibFwiOiAxMTYuNTQxXHJcbiAgICBcImJcIjogMTIzLjQ3MVxyXG4gIH1cclxuXHJcbiAgeyAjIE9jdGF2ZSAzXHJcbiAgICBcImNcIjogMTMwLjgxM1xyXG4gICAgXCJoXCI6IDEzOC41OTFcclxuICAgIFwiZFwiOiAxNDYuODMyXHJcbiAgICBcImlcIjogMTU1LjU2M1xyXG4gICAgXCJlXCI6IDE2NC44MTRcclxuICAgIFwiZlwiOiAxNzQuNjE0XHJcbiAgICBcImpcIjogMTg0Ljk5N1xyXG4gICAgXCJnXCI6IDE5NS45OThcclxuICAgIFwia1wiOiAyMDcuNjUyXHJcbiAgICBcImFcIjogMjIwLjAwMFxyXG4gICAgXCJsXCI6IDIzMy4wODJcclxuICAgIFwiYlwiOiAyNDYuOTQyXHJcbiAgfVxyXG5cclxuICB7ICMgT2N0YXZlIDRcclxuICAgIFwiY1wiOiAyNjEuNjI2XHJcbiAgICBcImhcIjogMjc3LjE4M1xyXG4gICAgXCJkXCI6IDI5My42NjVcclxuICAgIFwiaVwiOiAzMTEuMTI3XHJcbiAgICBcImVcIjogMzI5LjYyOFxyXG4gICAgXCJmXCI6IDM0OS4yMjhcclxuICAgIFwialwiOiAzNjkuOTk0XHJcbiAgICBcImdcIjogMzkxLjk5NVxyXG4gICAgXCJrXCI6IDQxNS4zMDVcclxuICAgIFwiYVwiOiA0NDAuMDAwXHJcbiAgICBcImxcIjogNDY2LjE2NFxyXG4gICAgXCJiXCI6IDQ5My44ODNcclxuICB9XHJcblxyXG4gIHsgIyBPY3RhdmUgNVxyXG4gICAgXCJjXCI6IDUyMy4yNTFcclxuICAgIFwiaFwiOiA1NTQuMzY1XHJcbiAgICBcImRcIjogNTg3LjMzMFxyXG4gICAgXCJpXCI6IDYyMi4yNTRcclxuICAgIFwiZVwiOiA2NTkuMjU1XHJcbiAgICBcImZcIjogNjk4LjQ1NlxyXG4gICAgXCJqXCI6IDczOS45ODlcclxuICAgIFwiZ1wiOiA3ODMuOTkxXHJcbiAgICBcImtcIjogODMwLjYwOVxyXG4gICAgXCJhXCI6IDg4MC4wMDBcclxuICAgIFwibFwiOiA5MzIuMzI4XHJcbiAgICBcImJcIjogOTg3Ljc2N1xyXG4gIH1cclxuXHJcbiAgeyAjIE9jdGF2ZSA2XHJcbiAgICBcImNcIjogMTA0Ni41MFxyXG4gICAgXCJoXCI6IDExMDguNzNcclxuICAgIFwiZFwiOiAxMTc0LjY2XHJcbiAgICBcImlcIjogMTI0NC41MVxyXG4gICAgXCJlXCI6IDEzMTguNTFcclxuICAgIFwiZlwiOiAxMzk2LjkxXHJcbiAgICBcImpcIjogMTQ3OS45OFxyXG4gICAgXCJnXCI6IDE1NjcuOThcclxuICAgIFwia1wiOiAxNjYxLjIyXHJcbiAgICBcImFcIjogMTc2MC4wMFxyXG4gICAgXCJsXCI6IDE4NjQuNjZcclxuICAgIFwiYlwiOiAxOTc1LjUzXHJcbiAgfVxyXG5cclxuICB7ICMgT2N0YXZlIDdcclxuICAgIFwiY1wiOiAyMDkzLjAwXHJcbiAgICBcImhcIjogMjIxNy40NlxyXG4gICAgXCJkXCI6IDIzNDkuMzJcclxuICAgIFwiaVwiOiAyNDg5LjAyXHJcbiAgICBcImVcIjogMjYzNy4wMlxyXG4gICAgXCJmXCI6IDI3OTMuODNcclxuICAgIFwialwiOiAyOTU5Ljk2XHJcbiAgICBcImdcIjogMzEzNS45NlxyXG4gICAgXCJrXCI6IDMzMjIuNDRcclxuICAgIFwiYVwiOiAzNTIwLjAwXHJcbiAgICBcImxcIjogMzcyOS4zMVxyXG4gICAgXCJiXCI6IDM5NTEuMDdcclxuICB9XHJcblxyXG4gIHsgIyBPY3RhdmUgOFxyXG4gICAgXCJjXCI6IDQxODYuMDFcclxuICB9XHJcbl1cclxuXHJcbmxlZ2FsTm90ZVJlZ2V4ID0gL1thLWxdL1xyXG5cclxuZmluZEZyZXEgPSAob2N0YXZlLCBub3RlKSAtPlxyXG4gIG5vdGUgPSBub3RlLnRvTG93ZXJDYXNlKClcclxuICBpZiAob2N0YXZlID49IDApIGFuZCAob2N0YXZlIDwgZnJlcVRhYmxlLmxlbmd0aCkgYW5kIGxlZ2FsTm90ZVJlZ2V4LnRlc3Qobm90ZSlcclxuICAgIG9jdGF2ZVRhYmxlID0gZnJlcVRhYmxlW29jdGF2ZV1cclxuICAgIGlmIG9jdGF2ZVRhYmxlPyBhbmQgb2N0YXZlVGFibGVbbm90ZV0/XHJcbiAgICAgIHJldHVybiBvY3RhdmVUYWJsZVtub3RlXVxyXG4gIHJldHVybiA0NDAuMFxyXG5cclxubW9kdWxlLmV4cG9ydHMgPVxyXG4gIGZyZXFUYWJsZTogZnJlcVRhYmxlXHJcbiAgZmluZEZyZXE6IGZpbmRGcmVxXHJcbiIsIiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4jIEltcG9ydHNcclxuXHJcbntmaW5kRnJlcX0gPSByZXF1aXJlICcuL2ZyZXEnXHJcbnJpZmZ3YXZlICAgPSByZXF1aXJlIFwiLi9yaWZmd2F2ZVwiXHJcbmpEYXRhVmlldyAgPSByZXF1aXJlICcuLi9qcy9qZGF0YXZpZXcnXHJcbmZzICAgICAgICAgPSByZXF1aXJlICdmcydcclxuXHJcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4jIEhlbHBlciBmdW5jdGlvbnNcclxuXHJcbmxvZ0RlYnVnID0gKGFyZ3MuLi4pIC0+XHJcbiAgIyBjb25zb2xlLmxvZy5hcHBseShjb25zb2xlLCBhcmdzKVxyXG5cclxuY2xvbmUgPSAob2JqKSAtPlxyXG4gIGlmIG5vdCBvYmo/IG9yIHR5cGVvZiBvYmogaXNudCAnb2JqZWN0J1xyXG4gICAgcmV0dXJuIG9ialxyXG5cclxuICBpZiBvYmogaW5zdGFuY2VvZiBEYXRlXHJcbiAgICByZXR1cm4gbmV3IERhdGUob2JqLmdldFRpbWUoKSlcclxuXHJcbiAgaWYgb2JqIGluc3RhbmNlb2YgUmVnRXhwXHJcbiAgICBmbGFncyA9ICcnXHJcbiAgICBmbGFncyArPSAnZycgaWYgb2JqLmdsb2JhbD9cclxuICAgIGZsYWdzICs9ICdpJyBpZiBvYmouaWdub3JlQ2FzZT9cclxuICAgIGZsYWdzICs9ICdtJyBpZiBvYmoubXVsdGlsaW5lP1xyXG4gICAgZmxhZ3MgKz0gJ3knIGlmIG9iai5zdGlja3k/XHJcbiAgICByZXR1cm4gbmV3IFJlZ0V4cChvYmouc291cmNlLCBmbGFncylcclxuXHJcbiAgbmV3SW5zdGFuY2UgPSBuZXcgb2JqLmNvbnN0cnVjdG9yKClcclxuXHJcbiAgZm9yIGtleSBvZiBvYmpcclxuICAgIG5ld0luc3RhbmNlW2tleV0gPSBjbG9uZSBvYmpba2V5XVxyXG5cclxuICByZXR1cm4gbmV3SW5zdGFuY2VcclxuXHJcbnBhcnNlQm9vbCA9ICh2KSAtPlxyXG4gIHN3aXRjaCBTdHJpbmcodilcclxuICAgIHdoZW4gXCJ0cnVlXCIgdGhlbiB0cnVlXHJcbiAgICB3aGVuIFwieWVzXCIgdGhlbiB0cnVlXHJcbiAgICB3aGVuIFwib25cIiB0aGVuIHRydWVcclxuICAgIHdoZW4gXCIxXCIgdGhlbiB0cnVlXHJcbiAgICBlbHNlIGZhbHNlXHJcblxyXG5jb3VudEluZGVudCA9ICh0ZXh0KSAtPlxyXG4gIGluZGVudCA9IDBcclxuICBmb3IgaSBpbiBbMC4uLnRleHQubGVuZ3RoXVxyXG4gICAgaWYgdGV4dFtpXSA9PSAnXFx0J1xyXG4gICAgICBpbmRlbnQgKz0gOFxyXG4gICAgZWxzZVxyXG4gICAgICBpbmRlbnQrK1xyXG4gIHJldHVybiBpbmRlbnRcclxuXHJcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4jIEJpdG1hcCBjb2RlIG9yaWdpbmFsbHkgZnJvbSBodHRwOi8vbXJjb2xlcy5jb20vbG93LXJlcy1wYWludC8gKE1JVCBsaWNlbnNlZClcclxuXHJcbl9hc0xpdHRsZUVuZGlhbkhleCA9ICh2YWx1ZSwgYnl0ZXMpIC0+XHJcbiAgIyBDb252ZXJ0IHZhbHVlIGludG8gbGl0dGxlIGVuZGlhbiBoZXggYnl0ZXNcclxuICAjIHZhbHVlIC0gdGhlIG51bWJlciBhcyBhIGRlY2ltYWwgaW50ZWdlciAocmVwcmVzZW50aW5nIGJ5dGVzKVxyXG4gICMgYnl0ZXMgLSB0aGUgbnVtYmVyIG9mIGJ5dGVzIHRoYXQgdGhpcyB2YWx1ZSB0YWtlcyB1cCBpbiBhIHN0cmluZ1xyXG5cclxuICAjIEV4YW1wbGU6XHJcbiAgIyBfYXNMaXR0bGVFbmRpYW5IZXgoMjgzNSwgNClcclxuICAjID4gJ1xceDEzXFx4MGJcXHgwMFxceDAwJ1xyXG5cclxuICByZXN1bHQgPSBbXVxyXG5cclxuICB3aGlsZSBieXRlcyA+IDBcclxuICAgIHJlc3VsdC5wdXNoKFN0cmluZy5mcm9tQ2hhckNvZGUodmFsdWUgJiAyNTUpKVxyXG4gICAgdmFsdWUgPj49IDhcclxuICAgIGJ5dGVzLS1cclxuXHJcbiAgcmV0dXJuIHJlc3VsdC5qb2luKCcnKVxyXG5cclxuX2NvbGxhcHNlRGF0YSA9IChyb3dzLCByb3dfcGFkZGluZykgLT5cclxuICAjIENvbnZlcnQgcm93cyBvZiBSR0IgYXJyYXlzIGludG8gQk1QIGRhdGFcclxuICByb3dzX2xlbiA9IHJvd3MubGVuZ3RoXHJcbiAgcGl4ZWxzX2xlbiA9IGlmIHJvd3NfbGVuIHRoZW4gcm93c1swXS5sZW5ndGggZWxzZSAwXHJcbiAgcGFkZGluZyA9ICcnXHJcbiAgcmVzdWx0ID0gW11cclxuXHJcbiAgd2hpbGUgcm93X3BhZGRpbmcgPiAwXHJcbiAgICBwYWRkaW5nICs9ICdcXHgwMCdcclxuICAgIHJvd19wYWRkaW5nLS1cclxuXHJcbiAgZm9yIGkgaW4gWzAuLi5yb3dzX2xlbl1cclxuICAgIGZvciBqIGluIFswLi4ucGl4ZWxzX2xlbl1cclxuICAgICAgcGl4ZWwgPSByb3dzW2ldW2pdXHJcbiAgICAgIHJlc3VsdC5wdXNoKFN0cmluZy5mcm9tQ2hhckNvZGUocGl4ZWxbMl0pICtcclxuICAgICAgICAgICAgICAgICAgU3RyaW5nLmZyb21DaGFyQ29kZShwaXhlbFsxXSkgK1xyXG4gICAgICAgICAgICAgICAgICBTdHJpbmcuZnJvbUNoYXJDb2RlKHBpeGVsWzBdKSlcclxuXHJcbiAgICByZXN1bHQucHVzaChwYWRkaW5nKVxyXG5cclxuICByZXR1cm4gcmVzdWx0LmpvaW4oJycpXHJcblxyXG5fc2NhbGVSb3dzID0gKHJvd3MsIHNjYWxlKSAtPlxyXG4gICMgU2ltcGxlc3Qgc2NhbGluZyBwb3NzaWJsZVxyXG4gIHJlYWxfdyA9IHJvd3MubGVuZ3RoXHJcbiAgc2NhbGVkX3cgPSBwYXJzZUludChyZWFsX3cgKiBzY2FsZSlcclxuICByZWFsX2ggPSBpZiByZWFsX3cgdGhlbiByb3dzWzBdLmxlbmd0aCBlbHNlIDBcclxuICBzY2FsZWRfaCA9IHBhcnNlSW50KHJlYWxfaCAqIHNjYWxlKVxyXG4gIG5ld19yb3dzID0gW11cclxuXHJcbiAgZm9yIHkgaW4gWzAuLi5zY2FsZWRfaF1cclxuICAgIG5ld19yb3dzLnB1c2gobmV3X3JvdyA9IFtdKVxyXG4gICAgZm9yIHggaW4gWzAuLi5zY2FsZWRfd11cclxuICAgICAgbmV3X3Jvdy5wdXNoKHJvd3NbcGFyc2VJbnQoeS9zY2FsZSldW3BhcnNlSW50KHgvc2NhbGUpXSlcclxuXHJcbiAgcmV0dXJuIG5ld19yb3dzXHJcblxyXG5nZW5lcmF0ZUJpdG1hcERhdGFVUkwgPSAocm93cywgc2NhbGUpIC0+XHJcbiAgIyBFeHBlY3RzIHJvd3Mgc3RhcnRpbmcgaW4gYm90dG9tIGxlZnRcclxuICAjIGZvcm1hdHRlZCBsaWtlIHRoaXM6IFtbWzI1NSwgMCwgMF0sIFsyNTUsIDI1NSwgMF0sIC4uLl0sIC4uLl1cclxuICAjIHdoaWNoIHJlcHJlc2VudHM6IFtbcmVkLCB5ZWxsb3csIC4uLl0sIC4uLl1cclxuXHJcbiAgaWYgIWJ0b2FcclxuICAgIHJldHVybiBmYWxzZVxyXG5cclxuICBzY2FsZSA9IHNjYWxlIHx8IDFcclxuICBpZiAoc2NhbGUgIT0gMSlcclxuICAgIHJvd3MgPSBfc2NhbGVSb3dzKHJvd3MsIHNjYWxlKVxyXG5cclxuICBoZWlnaHQgPSByb3dzLmxlbmd0aCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyB0aGUgbnVtYmVyIG9mIHJvd3NcclxuICB3aWR0aCA9IGlmIGhlaWdodCB0aGVuIHJvd3NbMF0ubGVuZ3RoIGVsc2UgMCAgICAgICAgIyB0aGUgbnVtYmVyIG9mIGNvbHVtbnMgcGVyIHJvd1xyXG4gIHJvd19wYWRkaW5nID0gKDQgLSAod2lkdGggKiAzKSAlIDQpICUgNCAgICAgICAgICAgICAjIHBhZCBlYWNoIHJvdyB0byBhIG11bHRpcGxlIG9mIDQgYnl0ZXNcclxuICBudW1fZGF0YV9ieXRlcyA9ICh3aWR0aCAqIDMgKyByb3dfcGFkZGluZykgKiBoZWlnaHQgIyBzaXplIGluIGJ5dGVzIG9mIEJNUCBkYXRhXHJcbiAgbnVtX2ZpbGVfYnl0ZXMgPSA1NCArIG51bV9kYXRhX2J5dGVzICAgICAgICAgICAgICAgICMgZnVsbCBoZWFkZXIgc2l6ZSAob2Zmc2V0KSArIHNpemUgb2YgZGF0YVxyXG5cclxuICBoZWlnaHQgPSBfYXNMaXR0bGVFbmRpYW5IZXgoaGVpZ2h0LCA0KVxyXG4gIHdpZHRoID0gX2FzTGl0dGxlRW5kaWFuSGV4KHdpZHRoLCA0KVxyXG4gIG51bV9kYXRhX2J5dGVzID0gX2FzTGl0dGxlRW5kaWFuSGV4KG51bV9kYXRhX2J5dGVzLCA0KVxyXG4gIG51bV9maWxlX2J5dGVzID0gX2FzTGl0dGxlRW5kaWFuSGV4KG51bV9maWxlX2J5dGVzLCA0KVxyXG5cclxuICAjIHRoZXNlIGFyZSB0aGUgYWN0dWFsIGJ5dGVzIG9mIHRoZSBmaWxlLi4uXHJcblxyXG4gIGZpbGUgPSAnQk0nICsgICAgICAgICAgICAgICAgIyBcIk1hZ2ljIE51bWJlclwiXHJcbiAgICAgICAgICBudW1fZmlsZV9ieXRlcyArICAgICAjIHNpemUgb2YgdGhlIGZpbGUgKGJ5dGVzKSpcclxuICAgICAgICAgICdcXHgwMFxceDAwJyArICAgICAgICAgIyByZXNlcnZlZFxyXG4gICAgICAgICAgJ1xceDAwXFx4MDAnICsgICAgICAgICAjIHJlc2VydmVkXHJcbiAgICAgICAgICAnXFx4MzZcXHgwMFxceDAwXFx4MDAnICsgIyBvZmZzZXQgb2Ygd2hlcmUgQk1QIGRhdGEgbGl2ZXMgKDU0IGJ5dGVzKVxyXG4gICAgICAgICAgJ1xceDI4XFx4MDBcXHgwMFxceDAwJyArICMgbnVtYmVyIG9mIHJlbWFpbmluZyBieXRlcyBpbiBoZWFkZXIgZnJvbSBoZXJlICg0MCBieXRlcylcclxuICAgICAgICAgIHdpZHRoICsgICAgICAgICAgICAgICMgdGhlIHdpZHRoIG9mIHRoZSBiaXRtYXAgaW4gcGl4ZWxzKlxyXG4gICAgICAgICAgaGVpZ2h0ICsgICAgICAgICAgICAgIyB0aGUgaGVpZ2h0IG9mIHRoZSBiaXRtYXAgaW4gcGl4ZWxzKlxyXG4gICAgICAgICAgJ1xceDAxXFx4MDAnICsgICAgICAgICAjIHRoZSBudW1iZXIgb2YgY29sb3IgcGxhbmVzICgxKVxyXG4gICAgICAgICAgJ1xceDE4XFx4MDAnICsgICAgICAgICAjIDI0IGJpdHMgLyBwaXhlbFxyXG4gICAgICAgICAgJ1xceDAwXFx4MDBcXHgwMFxceDAwJyArICMgTm8gY29tcHJlc3Npb24gKDApXHJcbiAgICAgICAgICBudW1fZGF0YV9ieXRlcyArICAgICAjIHNpemUgb2YgdGhlIEJNUCBkYXRhIChieXRlcykqXHJcbiAgICAgICAgICAnXFx4MTNcXHgwQlxceDAwXFx4MDAnICsgIyAyODM1IHBpeGVscy9tZXRlciAtIGhvcml6b250YWwgcmVzb2x1dGlvblxyXG4gICAgICAgICAgJ1xceDEzXFx4MEJcXHgwMFxceDAwJyArICMgMjgzNSBwaXhlbHMvbWV0ZXIgLSB0aGUgdmVydGljYWwgcmVzb2x1dGlvblxyXG4gICAgICAgICAgJ1xceDAwXFx4MDBcXHgwMFxceDAwJyArICMgTnVtYmVyIG9mIGNvbG9ycyBpbiB0aGUgcGFsZXR0ZSAoa2VlcCAwIGZvciAyNC1iaXQpXHJcbiAgICAgICAgICAnXFx4MDBcXHgwMFxceDAwXFx4MDAnICsgIyAwIGltcG9ydGFudCBjb2xvcnMgKG1lYW5zIGFsbCBjb2xvcnMgYXJlIGltcG9ydGFudClcclxuICAgICAgICAgIF9jb2xsYXBzZURhdGEocm93cywgcm93X3BhZGRpbmcpXHJcblxyXG4gIHJldHVybiAnZGF0YTppbWFnZS9ibXA7YmFzZTY0LCcgKyBidG9hKGZpbGUpXHJcblxyXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuIyBQYXJzZXJcclxuXHJcbmNsYXNzIFBhcnNlclxyXG4gIGNvbnN0cnVjdG9yOiAoQGxvZykgLT5cclxuICAgIEBjb21tZW50UmVnZXggPSAvXihbXiNdKj8pKFxccyojLiopPyQvXHJcbiAgICBAb25seVdoaXRlc3BhY2VSZWdleCA9IC9eXFxzKiQvXHJcbiAgICBAaW5kZW50UmVnZXggPSAvXihcXHMqKShcXFMuKikkL1xyXG4gICAgQGxlYWRpbmdVbmRlcnNjb3JlUmVnZXggPSAvXl8vXHJcbiAgICBAaGFzQ2FwaXRhbExldHRlcnNSZWdleCA9IC9bQS1aXS9cclxuICAgIEBpc05vdGVSZWdleCA9IC9bQS1MYS1sXS9cclxuXHJcbiAgICAjIEgtTCBhcmUgdGhlIGJsYWNrIGtleXM6XHJcbiAgICAjICBIIEkgICBKIEsgTFxyXG4gICAgIyBDIEQgRSBGIEcgQSBCXHJcblxyXG4gICAgQG5hbWVkU3RhdGVzID1cclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICBzcmNvY3RhdmU6IDRcclxuICAgICAgICBzcmNub3RlOiAnYSdcclxuICAgICAgICBvY3RhdmU6IDRcclxuICAgICAgICBub3RlOiAnYSdcclxuICAgICAgICB3YXZlOiAnc2luZSdcclxuICAgICAgICBicG06IDEyMFxyXG4gICAgICAgIGR1cmF0aW9uOiAyMDBcclxuICAgICAgICB2b2x1bWU6IDEuMFxyXG4gICAgICAgIGNsaXA6IHRydWVcclxuICAgICAgICByZXZlcmI6XHJcbiAgICAgICAgICBkZWxheTogMFxyXG4gICAgICAgICAgZGVjYXk6IDBcclxuICAgICAgICBhZHNyOiAjIG5vLW9wIEFEU1IgKGZ1bGwgMS4wIHN1c3RhaW4pXHJcbiAgICAgICAgICBhOiAwXHJcbiAgICAgICAgICBkOiAwXHJcbiAgICAgICAgICBzOiAxXHJcbiAgICAgICAgICByOiAxXHJcblxyXG4gICAgIyBpZiBhIGtleSBpcyBwcmVzZW50IGluIHRoaXMgbWFwLCB0aGF0IG5hbWUgaXMgY29uc2lkZXJlZCBhbiBcIm9iamVjdFwiXHJcbiAgICBAb2JqZWN0S2V5cyA9XHJcbiAgICAgIHRvbmU6XHJcbiAgICAgICAgd2F2ZTogJ3N0cmluZydcclxuICAgICAgICBmcmVxOiAnZmxvYXQnXHJcbiAgICAgICAgZHVyYXRpb246ICdmbG9hdCdcclxuICAgICAgICBhZHNyOiAnYWRzcidcclxuICAgICAgICBvY3RhdmU6ICdpbnQnXHJcbiAgICAgICAgbm90ZTogJ3N0cmluZydcclxuICAgICAgICB2b2x1bWU6ICdmbG9hdCdcclxuICAgICAgICBjbGlwOiAnYm9vbCdcclxuICAgICAgICByZXZlcmI6ICdyZXZlcmInXHJcblxyXG4gICAgICBzYW1wbGU6XHJcbiAgICAgICAgc3JjOiAnc3RyaW5nJ1xyXG4gICAgICAgIHZvbHVtZTogJ2Zsb2F0J1xyXG4gICAgICAgIGNsaXA6ICdib29sJ1xyXG4gICAgICAgIHJldmVyYjogJ3JldmVyYidcclxuICAgICAgICBzcmNvY3RhdmU6ICdpbnQnXHJcbiAgICAgICAgc3Jjbm90ZTogJ3N0cmluZydcclxuICAgICAgICBvY3RhdmU6ICdpbnQnXHJcbiAgICAgICAgbm90ZTogJ3N0cmluZydcclxuXHJcbiAgICAgIGxvb3A6XHJcbiAgICAgICAgYnBtOiAnaW50J1xyXG5cclxuICAgICAgdHJhY2s6IHt9XHJcblxyXG4gICAgQHN0YXRlU3RhY2sgPSBbXVxyXG4gICAgQHJlc2V0ICdkZWZhdWx0JywgMFxyXG4gICAgQG9iamVjdHMgPSB7fVxyXG4gICAgQG9iamVjdCA9IG51bGxcclxuICAgIEBvYmplY3RTY29wZVJlYWR5ID0gZmFsc2VcclxuXHJcbiAgaXNPYmplY3RUeXBlOiAodHlwZSkgLT5cclxuICAgIHJldHVybiBAb2JqZWN0S2V5c1t0eXBlXT9cclxuXHJcbiAgZXJyb3I6ICh0ZXh0KSAtPlxyXG4gICAgQGxvZy5lcnJvciBcIlBBUlNFIEVSUk9SLCBsaW5lICN7QGxpbmVOb306ICN7dGV4dH1cIlxyXG5cclxuICByZXNldDogKG5hbWUsIGluZGVudCkgLT5cclxuICAgIG5hbWUgPz0gJ2RlZmF1bHQnXHJcbiAgICBpbmRlbnQgPz0gMFxyXG4gICAgaWYgbm90IEBuYW1lZFN0YXRlc1tuYW1lXVxyXG4gICAgICBAZXJyb3IgXCJpbnZhbGlkIHJlc2V0IG5hbWU6ICN7bmFtZX1cIlxyXG4gICAgICByZXR1cm4gZmFsc2VcclxuICAgIG5ld1N0YXRlID0gY2xvbmUoQG5hbWVkU3RhdGVzW25hbWVdKVxyXG4gICAgbmV3U3RhdGUuX2luZGVudCA9IGluZGVudFxyXG4gICAgQHN0YXRlU3RhY2sucHVzaCBuZXdTdGF0ZVxyXG4gICAgcmV0dXJuIHRydWVcclxuXHJcbiAgZmxhdHRlbjogKCkgLT5cclxuICAgIGZsYXR0ZW5lZFN0YXRlID0ge31cclxuICAgIGZvciBzdGF0ZSBpbiBAc3RhdGVTdGFja1xyXG4gICAgICBmb3Iga2V5IG9mIHN0YXRlXHJcbiAgICAgICAgZmxhdHRlbmVkU3RhdGVba2V5XSA9IHN0YXRlW2tleV1cclxuICAgIHJldHVybiBmbGF0dGVuZWRTdGF0ZVxyXG5cclxuICB0cmFjZTogKHByZWZpeCkgLT5cclxuICAgIHByZWZpeCA/PSAnJ1xyXG4gICAgQGxvZy52ZXJib3NlIFwidHJhY2U6ICN7cHJlZml4fSBcIiArIEpTT04uc3RyaW5naWZ5KEBmbGF0dGVuKCkpXHJcblxyXG4gIGNyZWF0ZU9iamVjdDogKGluZGVudCwgZGF0YS4uLikgLT5cclxuICAgICAgQG9iamVjdCA9IHsgX2luZGVudDogaW5kZW50IH1cclxuICAgICAgZm9yIGkgaW4gWzAuLi5kYXRhLmxlbmd0aF0gYnkgMlxyXG4gICAgICAgIEBvYmplY3RbZGF0YVtpXV0gPSBkYXRhW2krMV1cclxuICAgICAgQG9iamVjdFNjb3BlUmVhZHkgPSB0cnVlXHJcblxyXG4gICAgICBpZiBAb2JqZWN0Ll90eXBlID09ICdsb29wJ1xyXG4gICAgICAgIEBvYmplY3QuX3BhdHRlcm5zID0gW11cclxuXHJcbiAgICAgIGlmIEBvYmplY3QuX3R5cGUgPT0gJ3RyYWNrJ1xyXG4gICAgICAgIEBvYmplY3QuX3BhdHRlcm5zID0gW11cclxuXHJcbiAgICAgIGlmIEBvYmplY3QuX25hbWVcclxuICAgICAgICBAbGFzdE9iamVjdCA9IEBvYmplY3QuX25hbWVcclxuICAgICAgICBsb2dEZWJ1ZyBcImNyZWF0ZU9iamVjdFsje2luZGVudH1dOiBcIiwgQGxhc3RPYmplY3RcclxuXHJcbiAgZmluaXNoT2JqZWN0OiAtPlxyXG4gICAgaWYgQG9iamVjdFxyXG4gICAgICBzdGF0ZSA9IEBmbGF0dGVuKClcclxuICAgICAgZm9yIGtleSBvZiBAb2JqZWN0S2V5c1tAb2JqZWN0Ll90eXBlXVxyXG4gICAgICAgIGV4cGVjdGVkVHlwZSA9IEBvYmplY3RLZXlzW0BvYmplY3QuX3R5cGVdW2tleV1cclxuICAgICAgICBpZiBzdGF0ZVtrZXldP1xyXG4gICAgICAgICAgdiA9IHN0YXRlW2tleV1cclxuICAgICAgICAgIEBvYmplY3Rba2V5XSA9IHN3aXRjaCBleHBlY3RlZFR5cGVcclxuICAgICAgICAgICAgd2hlbiAnaW50JyB0aGVuIHBhcnNlSW50KHYpXHJcbiAgICAgICAgICAgIHdoZW4gJ2Zsb2F0JyB0aGVuIHBhcnNlRmxvYXQodilcclxuICAgICAgICAgICAgd2hlbiAnYm9vbCcgdGhlbiBwYXJzZUJvb2wodilcclxuICAgICAgICAgICAgZWxzZSB2XHJcblxyXG4gICAgICBsb2dEZWJ1ZyBcImZpbmlzaE9iamVjdDogXCIsIEBvYmplY3RcclxuICAgICAgQG9iamVjdHNbQG9iamVjdC5fbmFtZV0gPSBAb2JqZWN0XHJcbiAgICBAb2JqZWN0ID0gbnVsbFxyXG5cclxuICBjcmVhdGluZ09iamVjdFR5cGU6ICh0eXBlKSAtPlxyXG4gICAgcmV0dXJuIGZhbHNlIGlmIG5vdCBAb2JqZWN0XHJcbiAgICByZXR1cm4gZmFsc2UgaWYgbm90IEBvYmplY3QuX3R5cGUgPT0gdHlwZVxyXG4gICAgcmV0dXJuIHRydWVcclxuXHJcbiAgdXBkYXRlRmFrZUluZGVudHM6IChpbmRlbnQpIC0+XHJcbiAgICByZXR1cm4gaWYgaW5kZW50ID49IDEwMDBcclxuICAgIGkgPSBAc3RhdGVTdGFjay5sZW5ndGggLSAxXHJcbiAgICB3aGlsZSBpID4gMFxyXG4gICAgICBwcmV2SW5kZW50ID0gQHN0YXRlU3RhY2tbaSAtIDFdLl9pbmRlbnRcclxuICAgICAgaWYgKEBzdGF0ZVN0YWNrW2ldLl9pbmRlbnQgPiAxMDAwKSBhbmQgKHByZXZJbmRlbnQgPCBpbmRlbnQpXHJcbiAgICAgICAgbG9nRGVidWcgXCJ1cGRhdGVGYWtlSW5kZW50czogY2hhbmdpbmcgc3RhY2sgaW5kZW50ICN7aX0gZnJvbSAje0BzdGF0ZVN0YWNrW2ldLl9pbmRlbnR9IHRvICN7aW5kZW50fVwiXHJcbiAgICAgICAgQHN0YXRlU3RhY2tbaV0uX2luZGVudCA9IGluZGVudFxyXG4gICAgICBpLS1cclxuXHJcbiAgcHVzaFN0YXRlOiAoaW5kZW50KSAtPlxyXG4gICAgaW5kZW50ID89IDBcclxuICAgIGxvZ0RlYnVnIFwicHVzaFN0YXRlKCN7aW5kZW50fSlcIlxyXG4gICAgQHVwZGF0ZUZha2VJbmRlbnRzIGluZGVudFxyXG4gICAgQHN0YXRlU3RhY2sucHVzaCB7IF9pbmRlbnQ6IGluZGVudCB9XHJcbiAgICByZXR1cm4gdHJ1ZVxyXG5cclxuICBwb3BTdGF0ZTogKGluZGVudCkgLT5cclxuICAgIGxvZ0RlYnVnIFwicG9wU3RhdGUoI3tpbmRlbnR9KVwiXHJcbiAgICBpZiBAb2JqZWN0P1xyXG4gICAgICBpZiBpbmRlbnQgPD0gQG9iamVjdC5faW5kZW50XHJcbiAgICAgICAgQGZpbmlzaE9iamVjdCgpXHJcblxyXG4gICAgQHVwZGF0ZUZha2VJbmRlbnRzIGluZGVudFxyXG5cclxuICAgIGxvb3BcclxuICAgICAgdG9wSW5kZW50ID0gQGdldFRvcEluZGVudCgpXHJcbiAgICAgIGxvZ0RlYnVnIFwicG9wU3RhdGUoI3tpbmRlbnR9KSB0b3AgaW5kZW50ICN7dG9wSW5kZW50fVwiXHJcbiAgICAgIGJyZWFrIGlmIGluZGVudCA9PSB0b3BJbmRlbnRcclxuICAgICAgaWYgQHN0YXRlU3RhY2subGVuZ3RoIDwgMlxyXG4gICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICBsb2dEZWJ1ZyBcInBvcFN0YXRlKCN7aW5kZW50fSkgcG9wcGluZyBpbmRlbnQgI3t0b3BJbmRlbnR9XCJcclxuICAgICAgQHN0YXRlU3RhY2sucG9wKClcclxuICAgIHJldHVybiB0cnVlXHJcblxyXG4gIHBhcnNlUGF0dGVybjogKHBhdHRlcm4pIC0+XHJcbiAgICBvdmVycmlkZUxlbmd0aCA9IEBoYXNDYXBpdGFsTGV0dGVyc1JlZ2V4LnRlc3QocGF0dGVybilcclxuICAgIGkgPSAwXHJcbiAgICBzb3VuZHMgPSBbXVxyXG4gICAgd2hpbGUgaSA8IHBhdHRlcm4ubGVuZ3RoXHJcbiAgICAgIGMgPSBwYXR0ZXJuW2ldXHJcbiAgICAgIGlmIGMgIT0gJy4nXHJcbiAgICAgICAgc3ltYm9sID0gYy50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgc291bmQgPSB7IG9mZnNldDogaSB9XHJcbiAgICAgICAgaWYgQGlzTm90ZVJlZ2V4LnRlc3QoYylcclxuICAgICAgICAgIHNvdW5kLm5vdGUgPSBzeW1ib2xcclxuICAgICAgICBpZiBvdmVycmlkZUxlbmd0aFxyXG4gICAgICAgICAgbGVuZ3RoID0gMVxyXG4gICAgICAgICAgbG9vcFxyXG4gICAgICAgICAgICBuZXh0ID0gcGF0dGVybltpKzFdXHJcbiAgICAgICAgICAgIGlmIG5leHQgPT0gc3ltYm9sXHJcbiAgICAgICAgICAgICAgbGVuZ3RoKytcclxuICAgICAgICAgICAgICBpKytcclxuICAgICAgICAgICAgICBpZiBpID09IHBhdHRlcm4ubGVuZ3RoXHJcbiAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgIHNvdW5kLmxlbmd0aCA9IGxlbmd0aFxyXG4gICAgICAgIHNvdW5kcy5wdXNoIHNvdW5kXHJcbiAgICAgIGkrK1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgcGF0dGVybjogcGF0dGVyblxyXG4gICAgICBsZW5ndGg6IHBhdHRlcm4ubGVuZ3RoXHJcbiAgICAgIHNvdW5kczogc291bmRzXHJcbiAgICB9XHJcblxyXG4gIGdldFRvcEluZGVudDogLT5cclxuICAgIHJldHVybiBAc3RhdGVTdGFja1tAc3RhdGVTdGFjay5sZW5ndGggLSAxXS5faW5kZW50XHJcblxyXG4gIHByb2Nlc3NUb2tlbnM6ICh0b2tlbnMsIGluZGVudCkgLT5cclxuICAgIGNtZCA9IHRva2Vuc1swXS50b0xvd2VyQ2FzZSgpXHJcbiAgICBpZiBjbWQgPT0gJ3Jlc2V0J1xyXG4gICAgICBpZiBub3QgQHJlc2V0KHRva2Vuc1sxXSwgaW5kZW50KVxyXG4gICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgZWxzZSBpZiBjbWQgPT0gJ3NlY3Rpb24nXHJcbiAgICAgIEBvYmplY3RTY29wZVJlYWR5ID0gdHJ1ZVxyXG4gICAgZWxzZSBpZiBAaXNPYmplY3RUeXBlKGNtZClcclxuICAgICAgQGNyZWF0ZU9iamVjdCBpbmRlbnQsICdfdHlwZScsIGNtZCwgJ19uYW1lJywgdG9rZW5zWzFdXHJcbiAgICBlbHNlIGlmIGNtZCA9PSAncGF0dGVybidcclxuICAgICAgaWYgbm90IChAY3JlYXRpbmdPYmplY3RUeXBlKCdsb29wJykgb3IgQGNyZWF0aW5nT2JqZWN0VHlwZSgndHJhY2snKSlcclxuICAgICAgICBAZXJyb3IgXCJ1bmV4cGVjdGVkIHBhdHRlcm4gY29tbWFuZFwiXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gICAgICBwYXR0ZXJuID0gQHBhcnNlUGF0dGVybih0b2tlbnNbMl0pXHJcbiAgICAgIHBhdHRlcm4uc3JjID0gdG9rZW5zWzFdXHJcbiAgICAgIEBvYmplY3QuX3BhdHRlcm5zLnB1c2ggcGF0dGVyblxyXG4gICAgZWxzZSBpZiBjbWQgPT0gJ2Fkc3InXHJcbiAgICAgIEBzdGF0ZVN0YWNrW0BzdGF0ZVN0YWNrLmxlbmd0aCAtIDFdW2NtZF0gPVxyXG4gICAgICAgIGE6IHBhcnNlRmxvYXQodG9rZW5zWzFdKVxyXG4gICAgICAgIGQ6IHBhcnNlRmxvYXQodG9rZW5zWzJdKVxyXG4gICAgICAgIHM6IHBhcnNlRmxvYXQodG9rZW5zWzNdKVxyXG4gICAgICAgIHI6IHBhcnNlRmxvYXQodG9rZW5zWzRdKVxyXG4gICAgZWxzZSBpZiBjbWQgPT0gJ3JldmVyYidcclxuICAgICAgQHN0YXRlU3RhY2tbQHN0YXRlU3RhY2subGVuZ3RoIC0gMV1bY21kXSA9XHJcbiAgICAgICAgZGVsYXk6IHBhcnNlSW50KHRva2Vuc1sxXSlcclxuICAgICAgICBkZWNheTogcGFyc2VGbG9hdCh0b2tlbnNbMl0pXHJcbiAgICBlbHNlXHJcbiAgICAgICMgVGhlIGJvcmluZyByZWd1bGFyIGNhc2U6IHN0YXNoIG9mZiB0aGlzIHZhbHVlXHJcbiAgICAgIGlmIEBsZWFkaW5nVW5kZXJzY29yZVJlZ2V4LnRlc3QoY21kKVxyXG4gICAgICAgIEBlcnJvciBcImNhbm5vdCBzZXQgaW50ZXJuYWwgbmFtZXMgKHVuZGVyc2NvcmUgcHJlZml4KVwiXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgIEBzdGF0ZVN0YWNrW0BzdGF0ZVN0YWNrLmxlbmd0aCAtIDFdW2NtZF0gPSB0b2tlbnNbMV1cclxuXHJcbiAgICByZXR1cm4gdHJ1ZVxyXG5cclxuICBwYXJzZTogKHRleHQpIC0+XHJcbiAgICBsaW5lcyA9IHRleHQuc3BsaXQoJ1xcbicpXHJcbiAgICBAbGluZU5vID0gMFxyXG4gICAgZm9yIGxpbmUgaW4gbGluZXNcclxuICAgICAgQGxpbmVObysrXHJcbiAgICAgIGxpbmUgPSBsaW5lLnJlcGxhY2UoLyhcXHJcXG58XFxufFxccikvZ20sXCJcIikgIyBzdHJpcCBuZXdsaW5lc1xyXG4gICAgICBsaW5lID0gQGNvbW1lbnRSZWdleC5leGVjKGxpbmUpWzFdICAgICAgICMgc3RyaXAgY29tbWVudHMgYW5kIHRyYWlsaW5nIHdoaXRlc3BhY2VcclxuICAgICAgY29udGludWUgaWYgQG9ubHlXaGl0ZXNwYWNlUmVnZXgudGVzdChsaW5lKVxyXG4gICAgICBbXywgaW5kZW50VGV4dCwgbGluZV0gPSBAaW5kZW50UmVnZXguZXhlYyBsaW5lXHJcbiAgICAgIGluZGVudCA9IGNvdW50SW5kZW50IGluZGVudFRleHRcclxuICAgICAgbGluZU9ianMgPSBbXVxyXG5cclxuICAgICAgYXJyb3dTZWN0aW9ucyA9IGxpbmUuc3BsaXQoL1xccyotPlxccyovKVxyXG4gICAgICBmb3IgYXJyb3dTZWN0aW9uIGluIGFycm93U2VjdGlvbnNcclxuICAgICAgICBzZW1pU2VjdGlvbnMgPSBhcnJvd1NlY3Rpb24uc3BsaXQoL1xccyo7XFxzKi8pXHJcbiAgICAgICAgZm9yIHNlbWlTZWN0aW9uIGluIHNlbWlTZWN0aW9uc1xyXG4gICAgICAgICAgbGluZU9ianMucHVzaCB7XHJcbiAgICAgICAgICAgICAgaW5kZW50OiBpbmRlbnRcclxuICAgICAgICAgICAgICBsaW5lOiBzZW1pU2VjdGlvblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgaW5kZW50ICs9IDEwMDBcclxuXHJcbiAgICAgIGZvciBvYmogaW4gbGluZU9ianNcclxuICAgICAgICBsb2dEZWJ1ZyBcImhhbmRsaW5nIGluZGVudDogXCIgKyBKU09OLnN0cmluZ2lmeShvYmopXHJcbiAgICAgICAgdG9wSW5kZW50ID0gQGdldFRvcEluZGVudCgpXHJcbiAgICAgICAgaWYgb2JqLmluZGVudCA+IHRvcEluZGVudFxyXG4gICAgICAgICAgQHB1c2hTdGF0ZShvYmouaW5kZW50KVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgIGlmIG5vdCBAcG9wU3RhdGUob2JqLmluZGVudClcclxuICAgICAgICAgICAgQGxvZy5lcnJvciBcInVuZXhwZWN0ZWQgb3V0ZGVudFwiXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxyXG5cclxuICAgICAgICBsb2dEZWJ1ZyBcInByb2Nlc3Npbmc6IFwiICsgSlNPTi5zdHJpbmdpZnkob2JqKVxyXG4gICAgICAgIGlmIG5vdCBAcHJvY2Vzc1Rva2VucyhvYmoubGluZS5zcGxpdCgvXFxzKy8pLCBvYmouaW5kZW50KVxyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlXHJcblxyXG4gICAgQHBvcFN0YXRlKDApXHJcbiAgICByZXR1cm4gdHJ1ZVxyXG5cclxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiMgUmVuZGVyZXJcclxuXHJcbiMgSW4gYWxsIGNhc2VzIHdoZXJlIGEgcmVuZGVyZWQgc291bmQgaXMgZ2VuZXJhdGVkLCB0aGVyZSBhcmUgYWN0dWFsbHkgdHdvIGxlbmd0aHNcclxuIyBhc3NvY2lhdGVkIHdpdGggdGhlIHNvdW5kLiBcInNvdW5kLmxlbmd0aFwiIGlzIHRoZSBcImV4cGVjdGVkXCIgbGVuZ3RoLCB3aXRoIHJlZ2FyZHNcclxuIyB0byB0aGUgdHlwZWQtaW4gZHVyYXRpb24gZm9yIGl0IG9yIGZvciBkZXRlcm1pbmluZyBsb29wIG9mZmV0cy4gVGhlIG90aGVyIGxlbmd0aFxyXG4jIGlzIHRoZSBzb3VuZC5zYW1wbGVzLmxlbmd0aCAoYWxzbyBrbm93biBhcyB0aGUgXCJvdmVyZmxvdyBsZW5ndGhcIiksIHdoaWNoIGlzIHRoZVxyXG4jIGxlbmd0aCB0aGF0IGFjY291bnRzIGZvciB0aGluZ3MgbGlrZSByZXZlcmIgb3IgYW55dGhpbmcgZWxzZSB0aGF0IHdvdWxkIGNhdXNlIHRoZVxyXG4jIHNvdW5kIHRvIHNwaWxsIGludG8gdGhlIG5leHQgbG9vcC90cmFjay4gVGhpcyBhbGxvd3MgZm9yIHNlYW1sZXNzIGxvb3BzIHRoYXQgY2FuXHJcbiMgcGxheSBhIGxvbmcgc291bmQgYXMgdGhlIGVuZCBvZiBhIHBhdHRlcm4sIGFuZCBpdCdsbCBjbGVhbmx5IG1peCBpbnRvIHRoZSBiZWdpbm5pbmdcclxuIyBvZiB0aGUgbmV4dCBwYXR0ZXJuLlxyXG5cclxuY2xhc3MgUmVuZGVyZXJcclxuICBjb25zdHJ1Y3RvcjogKEBsb2csIEBzYW1wbGVSYXRlLCBAcmVhZExvY2FsRmlsZXMsIEBvYmplY3RzKSAtPlxyXG4gICAgQHNvdW5kQ2FjaGUgPSB7fVxyXG5cclxuICBlcnJvcjogKHRleHQpIC0+XHJcbiAgICBAbG9nLmVycm9yIFwiUkVOREVSIEVSUk9SOiAje3RleHR9XCJcclxuXHJcbiAgZ2VuZXJhdGVFbnZlbG9wZTogKGFkc3IsIGxlbmd0aCkgLT5cclxuICAgIGVudmVsb3BlID0gQXJyYXkobGVuZ3RoKVxyXG4gICAgQXRvRCA9IE1hdGguZmxvb3IoYWRzci5hICogbGVuZ3RoKVxyXG4gICAgRHRvUyA9IE1hdGguZmxvb3IoYWRzci5kICogbGVuZ3RoKVxyXG4gICAgU3RvUiA9IE1hdGguZmxvb3IoYWRzci5yICogbGVuZ3RoKVxyXG4gICAgYXR0YWNrTGVuID0gQXRvRFxyXG4gICAgZGVjYXlMZW4gPSBEdG9TIC0gQXRvRFxyXG4gICAgc3VzdGFpbkxlbiA9IFN0b1IgLSBEdG9TXHJcbiAgICByZWxlYXNlTGVuID0gbGVuZ3RoIC0gU3RvUlxyXG4gICAgc3VzdGFpbiA9IGFkc3Iuc1xyXG4gICAgcGVha1N1c3RhaW5EZWx0YSA9IDEuMCAtIHN1c3RhaW5cclxuICAgIGZvciBpIGluIFswLi4uYXR0YWNrTGVuXVxyXG4gICAgICAjIEF0dGFja1xyXG4gICAgICBlbnZlbG9wZVtpXSA9IGkgLyBhdHRhY2tMZW5cclxuICAgIGZvciBpIGluIFswLi4uZGVjYXlMZW5dXHJcbiAgICAgICMgRGVjYXlcclxuICAgICAgZW52ZWxvcGVbQXRvRCArIGldID0gMS4wIC0gKHBlYWtTdXN0YWluRGVsdGEgKiAoaSAvIGRlY2F5TGVuKSlcclxuICAgIGZvciBpIGluIFswLi4uc3VzdGFpbkxlbl1cclxuICAgICAgIyBTdXN0YWluXHJcbiAgICAgIGVudmVsb3BlW0R0b1MgKyBpXSA9IHN1c3RhaW5cclxuICAgIGZvciBpIGluIFswLi4ucmVsZWFzZUxlbl1cclxuICAgICAgIyBSZWxlYXNlXHJcbiAgICAgIGVudmVsb3BlW1N0b1IgKyBpXSA9IHN1c3RhaW4gLSAoc3VzdGFpbiAqIChpIC8gcmVsZWFzZUxlbikpXHJcbiAgICByZXR1cm4gZW52ZWxvcGVcclxuXHJcbiAgcmVuZGVyVG9uZTogKHRvbmVPYmosIG92ZXJyaWRlcykgLT5cclxuICAgIGFtcGxpdHVkZSA9IDEwMDAwXHJcbiAgICBpZiBvdmVycmlkZXMubGVuZ3RoID4gMFxyXG4gICAgICBsZW5ndGggPSBvdmVycmlkZXMubGVuZ3RoXHJcbiAgICBlbHNlXHJcbiAgICAgIGxlbmd0aCA9IE1hdGguZmxvb3IodG9uZU9iai5kdXJhdGlvbiAqIEBzYW1wbGVSYXRlIC8gMTAwMClcclxuICAgIHNhbXBsZXMgPSBBcnJheShsZW5ndGgpXHJcbiAgICBBID0gMjAwXHJcbiAgICBCID0gMC41XHJcbiAgICBpZiBvdmVycmlkZXMubm90ZT9cclxuICAgICAgZnJlcSA9IGZpbmRGcmVxKHRvbmVPYmoub2N0YXZlLCBvdmVycmlkZXMubm90ZSlcclxuICAgIGVsc2UgaWYgdG9uZU9iai5mcmVxP1xyXG4gICAgICBmcmVxID0gdG9uZU9iai5mcmVxXHJcbiAgICBlbHNlXHJcbiAgICAgIGZyZXEgPSBmaW5kRnJlcSh0b25lT2JqLm9jdGF2ZSwgdG9uZU9iai5ub3RlKVxyXG4gICAgZW52ZWxvcGUgPSBAZ2VuZXJhdGVFbnZlbG9wZSh0b25lT2JqLmFkc3IsIGxlbmd0aClcclxuICAgIHBlcmlvZCA9IEBzYW1wbGVSYXRlIC8gZnJlcVxyXG4gICAgZm9yIGkgaW4gWzAuLi5sZW5ndGhdXHJcbiAgICAgIGlmIHRvbmVPYmoud2F2ZSA9PSBcInNhd3Rvb3RoXCJcclxuICAgICAgICBzYW1wbGUgPSAoKGkgJSBwZXJpb2QpIC8gcGVyaW9kKSAtIDAuNVxyXG4gICAgICBlbHNlXHJcbiAgICAgICAgc2FtcGxlID0gTWF0aC5zaW4oaSAvIHBlcmlvZCAqIDIgKiBNYXRoLlBJKVxyXG4gICAgICAgIGlmIHRvbmVPYmoud2F2ZSA9PSBcInNxdWFyZVwiXHJcbiAgICAgICAgICBzYW1wbGUgPSBpZiAoc2FtcGxlID4gMCkgdGhlbiAxIGVsc2UgLTFcclxuICAgICAgc2FtcGxlc1tpXSA9IHNhbXBsZSAqIGFtcGxpdHVkZSAqIGVudmVsb3BlW2ldXHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgc2FtcGxlczogc2FtcGxlc1xyXG4gICAgICBsZW5ndGg6IHNhbXBsZXMubGVuZ3RoXHJcbiAgICB9XHJcblxyXG4gIHJlbmRlclNhbXBsZTogKHNhbXBsZU9iaiwgb3ZlcnJpZGVzKSAtPlxyXG4gICAgdmlldyA9IG51bGxcclxuXHJcbiAgICBpZiBAcmVhZExvY2FsRmlsZXNcclxuICAgICAgZGF0YSA9IGZzLnJlYWRGaWxlU3luYyBzYW1wbGVPYmouc3JjXHJcbiAgICAgIHZpZXcgPSBuZXcgakRhdGFWaWV3KGRhdGEsIDAsIGRhdGEubGVuZ3RoLCB0cnVlKVxyXG4gICAgZWxzZVxyXG4gICAgICAkLmFqYXgge1xyXG4gICAgICAgIHVybDogc2FtcGxlT2JqLnNyY1xyXG4gICAgICAgIG1pbWVUeXBlOiAndGV4dC9wbGFpbjsgY2hhcnNldD14LXVzZXItZGVmaW5lZCdcclxuICAgICAgICBzdWNjZXNzOiAoZGF0YSkgLT5cclxuICAgICAgICAgIHZpZXcgPSBuZXcgakRhdGFWaWV3KGRhdGEsIDAsIGRhdGEubGVuZ3RoLCB0cnVlKVxyXG4gICAgICAgIGFzeW5jOiBmYWxzZVxyXG4gICAgICB9XHJcblxyXG4gICAgaWYgbm90IHZpZXdcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzYW1wbGVzOiBbXVxyXG4gICAgICAgIGxlbmd0aDogMFxyXG4gICAgICB9XHJcblxyXG4gICAgIyBza2lwIHRoZSBmaXJzdCA0MCBieXRlc1xyXG4gICAgdmlldy5zZWVrKDQwKVxyXG4gICAgc3ViY2h1bmsyU2l6ZSA9IHZpZXcuZ2V0SW50MzIoKVxyXG4gICAgc2FtcGxlcyA9IFtdXHJcbiAgICB3aGlsZSB2aWV3LnRlbGwoKSsxIDwgdmlldy5ieXRlTGVuZ3RoXHJcbiAgICAgIHNhbXBsZXMucHVzaCB2aWV3LmdldEludDE2KClcclxuXHJcbiAgICBvdmVycmlkZU5vdGUgPSBpZiBvdmVycmlkZXMubm90ZSB0aGVuIG92ZXJyaWRlcy5ub3RlIGVsc2Ugc2FtcGxlT2JqLm5vdGVcclxuICAgIGlmIChvdmVycmlkZU5vdGUgIT0gc2FtcGxlT2JqLnNyY25vdGUpIG9yIChzYW1wbGVPYmoub2N0YXZlICE9IHNhbXBsZU9iai5zcmNvY3RhdmUpXHJcbiAgICAgIG9sZGZyZXEgPSBmaW5kRnJlcShzYW1wbGVPYmouc3Jjb2N0YXZlLCBzYW1wbGVPYmouc3Jjbm90ZSlcclxuICAgICAgbmV3ZnJlcSA9IGZpbmRGcmVxKHNhbXBsZU9iai5vY3RhdmUsIG92ZXJyaWRlTm90ZSlcclxuXHJcbiAgICAgIGZhY3RvciA9IG9sZGZyZXEgLyBuZXdmcmVxXHJcbiAgICAgICMgQGxvZy52ZXJib3NlIFwib2xkOiAje29sZGZyZXF9LCBuZXc6ICN7bmV3ZnJlcX0sIGZhY3RvcjogI3tmYWN0b3J9XCJcclxuXHJcbiAgICAgICMgVE9ETzogUHJvcGVybHkgcmVzYW1wbGUgaGVyZSB3aXRoIHNvbWV0aGluZyBvdGhlciB0aGFuIFwibmVhcmVzdCBuZWlnaGJvclwiXHJcbiAgICAgIHJlbGVuZ3RoID0gTWF0aC5mbG9vcihzYW1wbGVzLmxlbmd0aCAqIGZhY3RvcilcclxuICAgICAgcmVzYW1wbGVzID0gQXJyYXkocmVsZW5ndGgpXHJcbiAgICAgIGZvciBpIGluIFswLi4ucmVsZW5ndGhdXHJcbiAgICAgICAgcmVzYW1wbGVzW2ldID0gMFxyXG4gICAgICBmb3IgaSBpbiBbMC4uLnJlbGVuZ3RoXVxyXG4gICAgICAgIHJlc2FtcGxlc1tpXSA9IHNhbXBsZXNbTWF0aC5mbG9vcihpIC8gZmFjdG9yKV1cclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgc2FtcGxlczogcmVzYW1wbGVzXHJcbiAgICAgICAgbGVuZ3RoOiByZXNhbXBsZXMubGVuZ3RoXHJcbiAgICAgIH1cclxuICAgIGVsc2VcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzYW1wbGVzOiBzYW1wbGVzXHJcbiAgICAgICAgbGVuZ3RoOiBzYW1wbGVzLmxlbmd0aFxyXG4gICAgICB9XHJcblxyXG4gIHJlbmRlckxvb3A6IChsb29wT2JqKSAtPlxyXG4gICAgYmVhdENvdW50ID0gMFxyXG4gICAgZm9yIHBhdHRlcm4gaW4gbG9vcE9iai5fcGF0dGVybnNcclxuICAgICAgaWYgYmVhdENvdW50IDwgcGF0dGVybi5sZW5ndGhcclxuICAgICAgICBiZWF0Q291bnQgPSBwYXR0ZXJuLmxlbmd0aFxyXG5cclxuICAgIHNhbXBsZXNQZXJCZWF0ID0gQHNhbXBsZVJhdGUgLyAobG9vcE9iai5icG0gLyA2MCkgLyA0XHJcbiAgICB0b3RhbExlbmd0aCA9IE1hdGguZmxvb3Ioc2FtcGxlc1BlckJlYXQgKiBiZWF0Q291bnQpXHJcbiAgICBvdmVyZmxvd0xlbmd0aCA9IHRvdGFsTGVuZ3RoXHJcblxyXG4gICAgZm9yIHBhdHRlcm4gaW4gbG9vcE9iai5fcGF0dGVybnNcclxuICAgICAgc2VjdGlvbkNvdW50ID0gcGF0dGVybi5sZW5ndGggLyAxNlxyXG4gICAgICBvZmZzZXRMZW5ndGggPSBNYXRoLmZsb29yKHRvdGFsTGVuZ3RoIC8gMTYgLyBzZWN0aW9uQ291bnQpXHJcbiAgICAgIGZvciBzb3VuZCBpbiBwYXR0ZXJuLnNvdW5kc1xyXG4gICAgICAgIG92ZXJyaWRlcyA9IHt9XHJcbiAgICAgICAgaWYgc291bmQubGVuZ3RoID4gMFxyXG4gICAgICAgICAgb3ZlcnJpZGVzLmxlbmd0aCA9IHNvdW5kLmxlbmd0aCAqIG9mZnNldExlbmd0aFxyXG4gICAgICAgIGlmIHNvdW5kLm5vdGU/XHJcbiAgICAgICAgICBvdmVycmlkZXMubm90ZSA9IHNvdW5kLm5vdGVcclxuICAgICAgICBzb3VuZC5fcmVuZGVyID0gQHJlbmRlcihwYXR0ZXJuLnNyYywgb3ZlcnJpZGVzKVxyXG4gICAgICAgIGVuZCA9IChzb3VuZC5vZmZzZXQgKiBvZmZzZXRMZW5ndGgpICsgc291bmQuX3JlbmRlci5zYW1wbGVzLmxlbmd0aFxyXG4gICAgICAgIGlmIG92ZXJmbG93TGVuZ3RoIDwgZW5kXHJcbiAgICAgICAgICBvdmVyZmxvd0xlbmd0aCA9IGVuZFxyXG5cclxuICAgIHNhbXBsZXMgPSBBcnJheShvdmVyZmxvd0xlbmd0aClcclxuICAgIGZvciBpIGluIFswLi4ub3ZlcmZsb3dMZW5ndGhdXHJcbiAgICAgIHNhbXBsZXNbaV0gPSAwXHJcblxyXG4gICAgZm9yIHBhdHRlcm4gaW4gbG9vcE9iai5fcGF0dGVybnNcclxuICAgICAgc2VjdGlvbkNvdW50ID0gcGF0dGVybi5sZW5ndGggLyAxNlxyXG4gICAgICBvZmZzZXRMZW5ndGggPSBNYXRoLmZsb29yKHRvdGFsTGVuZ3RoIC8gMTYgLyBzZWN0aW9uQ291bnQpXHJcblxyXG4gICAgICBwYXR0ZXJuU2FtcGxlcyA9IEFycmF5KG92ZXJmbG93TGVuZ3RoKVxyXG4gICAgICBmb3IgaSBpbiBbMC4uLm92ZXJmbG93TGVuZ3RoXVxyXG4gICAgICAgIHBhdHRlcm5TYW1wbGVzW2ldID0gMFxyXG5cclxuICAgICAgZm9yIHNvdW5kIGluIHBhdHRlcm4uc291bmRzXHJcbiAgICAgICAgc3JjU291bmQgPSBzb3VuZC5fcmVuZGVyXHJcblxyXG4gICAgICAgIG9iaiA9IEBnZXRPYmplY3QocGF0dGVybi5zcmMpXHJcbiAgICAgICAgb2Zmc2V0ID0gc291bmQub2Zmc2V0ICogb2Zmc2V0TGVuZ3RoXHJcbiAgICAgICAgY29weUxlbiA9IHNyY1NvdW5kLnNhbXBsZXMubGVuZ3RoXHJcbiAgICAgICAgaWYgKG9mZnNldCArIGNvcHlMZW4pID4gb3ZlcmZsb3dMZW5ndGhcclxuICAgICAgICAgIGNvcHlMZW4gPSBvdmVyZmxvd0xlbmd0aCAtIG9mZnNldFxyXG5cclxuICAgICAgICBpZiBvYmouY2xpcFxyXG4gICAgICAgICAgZmFkZUNsaXAgPSAyMDAgIyBmYWRlIG91dCBvdmVyIHRoaXMgbWFueSBzYW1wbGVzIHByaW9yIHRvIGEgY2xpcCB0byBhdm9pZCBhIHBvcFxyXG4gICAgICAgICAgaWYgb2Zmc2V0ID4gZmFkZUNsaXBcclxuICAgICAgICAgICAgZm9yIGogaW4gWzAuLi5mYWRlQ2xpcF1cclxuICAgICAgICAgICAgICB2ID0gcGF0dGVyblNhbXBsZXNbb2Zmc2V0IC0gZmFkZUNsaXAgKyBqXVxyXG4gICAgICAgICAgICAgIHBhdHRlcm5TYW1wbGVzW29mZnNldCAtIGZhZGVDbGlwICsgal0gPSBNYXRoLmZsb29yKHYgKiAoKGZhZGVDbGlwIC0gaikgLyBmYWRlQ2xpcCkpXHJcbiAgICAgICAgICBmb3IgaiBpbiBbb2Zmc2V0Li4ub3ZlcmZsb3dMZW5ndGhdXHJcbiAgICAgICAgICAgICMgY2xlYW4gb3V0IHRoZSByZXN0IG9mIHRoZSBzb3VuZCB0byBlbnN1cmUgdGhhdCB0aGUgcHJldmlvdXMgb25lICh3aGljaCBjb3VsZCBiZSBsb25nZXIpIHdhcyBmdWxseSBjbGlwcGVkXHJcbiAgICAgICAgICAgIHBhdHRlcm5TYW1wbGVzW2pdID0gMFxyXG4gICAgICAgICAgZm9yIGogaW4gWzAuLi5jb3B5TGVuXVxyXG4gICAgICAgICAgICBwYXR0ZXJuU2FtcGxlc1tvZmZzZXQgKyBqXSA9IHNyY1NvdW5kLnNhbXBsZXNbal1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICBmb3IgaiBpbiBbMC4uLmNvcHlMZW5dXHJcbiAgICAgICAgICAgIHBhdHRlcm5TYW1wbGVzW29mZnNldCArIGpdICs9IHNyY1NvdW5kLnNhbXBsZXNbal1cclxuXHJcbiAgICAgICMgTm93IGNvcHkgdGhlIGNsaXBwZWQgcGF0dGVybiBpbnRvIHRoZSBmaW5hbCBsb29wXHJcbiAgICAgIGZvciBqIGluIFswLi4ub3ZlcmZsb3dMZW5ndGhdXHJcbiAgICAgICAgc2FtcGxlc1tqXSArPSBwYXR0ZXJuU2FtcGxlc1tqXVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHNhbXBsZXM6IHNhbXBsZXNcclxuICAgICAgbGVuZ3RoOiB0b3RhbExlbmd0aFxyXG4gICAgfVxyXG5cclxuICByZW5kZXJUcmFjazogKHRyYWNrT2JqKSAtPlxyXG4gICAgcGllY2VDb3VudCA9IDBcclxuICAgIGZvciBwYXR0ZXJuIGluIHRyYWNrT2JqLl9wYXR0ZXJuc1xyXG4gICAgICBpZiBwaWVjZUNvdW50IDwgcGF0dGVybi5wYXR0ZXJuLmxlbmd0aFxyXG4gICAgICAgIHBpZWNlQ291bnQgPSBwYXR0ZXJuLnBhdHRlcm4ubGVuZ3RoXHJcblxyXG4gICAgdG90YWxMZW5ndGggPSAwXHJcbiAgICBvdmVyZmxvd0xlbmd0aCA9IDBcclxuICAgIHBpZWNlVG90YWxMZW5ndGggPSBBcnJheShwaWVjZUNvdW50KVxyXG4gICAgcGllY2VPdmVyZmxvd0xlbmd0aCA9IEFycmF5KHBpZWNlQ291bnQpXHJcbiAgICBmb3IgcGllY2VJbmRleCBpbiBbMC4uLnBpZWNlQ291bnRdXHJcbiAgICAgIHBpZWNlVG90YWxMZW5ndGhbcGllY2VJbmRleF0gPSAwXHJcbiAgICAgIHBpZWNlT3ZlcmZsb3dMZW5ndGhbcGllY2VJbmRleF0gPSAwXHJcbiAgICAgIGZvciBwYXR0ZXJuIGluIHRyYWNrT2JqLl9wYXR0ZXJuc1xyXG4gICAgICAgIGlmIChwaWVjZUluZGV4IDwgcGF0dGVybi5wYXR0ZXJuLmxlbmd0aCkgYW5kIChwYXR0ZXJuLnBhdHRlcm5bcGllY2VJbmRleF0gIT0gJy4nKVxyXG4gICAgICAgICAgc3JjU291bmQgPSBAcmVuZGVyKHBhdHRlcm4uc3JjKVxyXG4gICAgICAgICAgaWYgcGllY2VUb3RhbExlbmd0aFtwaWVjZUluZGV4XSA8IHNyY1NvdW5kLmxlbmd0aFxyXG4gICAgICAgICAgICBwaWVjZVRvdGFsTGVuZ3RoW3BpZWNlSW5kZXhdID0gc3JjU291bmQubGVuZ3RoXHJcbiAgICAgICAgICBpZiBwaWVjZU92ZXJmbG93TGVuZ3RoW3BpZWNlSW5kZXhdIDwgc3JjU291bmQuc2FtcGxlcy5sZW5ndGhcclxuICAgICAgICAgICAgcGllY2VPdmVyZmxvd0xlbmd0aFtwaWVjZUluZGV4XSA9IHNyY1NvdW5kLnNhbXBsZXMubGVuZ3RoXHJcbiAgICAgIHBvc3NpYmxlTWF4TGVuZ3RoID0gdG90YWxMZW5ndGggKyBwaWVjZU92ZXJmbG93TGVuZ3RoW3BpZWNlSW5kZXhdXHJcbiAgICAgIGlmIG92ZXJmbG93TGVuZ3RoIDwgcG9zc2libGVNYXhMZW5ndGhcclxuICAgICAgICBvdmVyZmxvd0xlbmd0aCA9IHBvc3NpYmxlTWF4TGVuZ3RoXHJcbiAgICAgIHRvdGFsTGVuZ3RoICs9IHBpZWNlVG90YWxMZW5ndGhbcGllY2VJbmRleF1cclxuXHJcbiAgICBzYW1wbGVzID0gQXJyYXkob3ZlcmZsb3dMZW5ndGgpXHJcbiAgICBmb3IgaSBpbiBbMC4uLm92ZXJmbG93TGVuZ3RoXVxyXG4gICAgICBzYW1wbGVzW2ldID0gMFxyXG5cclxuICAgIGZvciBwYXR0ZXJuIGluIHRyYWNrT2JqLl9wYXR0ZXJuc1xyXG4gICAgICB0cmFja09mZnNldCA9IDBcclxuICAgICAgc3JjU291bmQgPSBAcmVuZGVyKHBhdHRlcm4uc3JjLCB7fSlcclxuICAgICAgZm9yIHBpZWNlSW5kZXggaW4gWzAuLi5waWVjZUNvdW50XVxyXG4gICAgICAgIGlmIChwaWVjZUluZGV4IDwgcGF0dGVybi5wYXR0ZXJuLmxlbmd0aCkgYW5kIChwYXR0ZXJuLnBhdHRlcm5bcGllY2VJbmRleF0gIT0gJy4nKVxyXG4gICAgICAgICAgY29weUxlbiA9IHNyY1NvdW5kLnNhbXBsZXMubGVuZ3RoXHJcbiAgICAgICAgICBpZiAodHJhY2tPZmZzZXQgKyBjb3B5TGVuKSA+IG92ZXJmbG93TGVuZ3RoXHJcbiAgICAgICAgICAgIGNvcHlMZW4gPSBvdmVyZmxvd0xlbmd0aCAtIHRyYWNrT2Zmc2V0XHJcbiAgICAgICAgICBmb3IgaiBpbiBbMC4uLmNvcHlMZW5dXHJcbiAgICAgICAgICAgIHNhbXBsZXNbdHJhY2tPZmZzZXQgKyBqXSArPSBzcmNTb3VuZC5zYW1wbGVzW2pdXHJcblxyXG4gICAgICAgIHRyYWNrT2Zmc2V0ICs9IHBpZWNlVG90YWxMZW5ndGhbcGllY2VJbmRleF1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBzYW1wbGVzOiBzYW1wbGVzXHJcbiAgICAgIGxlbmd0aDogdG90YWxMZW5ndGhcclxuICAgIH1cclxuXHJcbiAgY2FsY0NhY2hlTmFtZTogKHR5cGUsIHdoaWNoLCBvdmVycmlkZXMpIC0+XHJcbiAgICBpZiAodHlwZSAhPSAndG9uZScpIGFuZCAodHlwZSAhPSAnc2FtcGxlJylcclxuICAgICAgcmV0dXJuIHdoaWNoXHJcblxyXG4gICAgbmFtZSA9IHdoaWNoXHJcbiAgICBpZiBvdmVycmlkZXMubm90ZVxyXG4gICAgICBuYW1lICs9IFwiL04je292ZXJyaWRlcy5ub3RlfVwiXHJcbiAgICBpZiBvdmVycmlkZXMubGVuZ3RoXHJcbiAgICAgIG5hbWUgKz0gXCIvTCN7b3ZlcnJpZGVzLmxlbmd0aH1cIlxyXG5cclxuICAgIHJldHVybiBuYW1lXHJcblxyXG4gIGdldE9iamVjdDogKHdoaWNoKSAtPlxyXG4gICAgb2JqZWN0ID0gQG9iamVjdHNbd2hpY2hdXHJcbiAgICBpZiBub3Qgb2JqZWN0XHJcbiAgICAgIEBlcnJvciBcIm5vIHN1Y2ggb2JqZWN0ICN7d2hpY2h9XCJcclxuICAgICAgcmV0dXJuIG51bGxcclxuICAgIHJldHVybiBvYmplY3RcclxuXHJcbiAgcmVuZGVyOiAod2hpY2gsIG92ZXJyaWRlcykgLT5cclxuICAgIG9iamVjdCA9IEBnZXRPYmplY3Qod2hpY2gpXHJcbiAgICBpZiBub3Qgb2JqZWN0XHJcbiAgICAgIHJldHVybiBudWxsXHJcblxyXG4gICAgb3ZlcnJpZGVzID89IHt9XHJcblxyXG4gICAgY2FjaGVOYW1lID0gQGNhbGNDYWNoZU5hbWUob2JqZWN0Ll90eXBlLCB3aGljaCwgb3ZlcnJpZGVzKVxyXG4gICAgaWYgQHNvdW5kQ2FjaGVbY2FjaGVOYW1lXVxyXG4gICAgICByZXR1cm4gQHNvdW5kQ2FjaGVbY2FjaGVOYW1lXVxyXG5cclxuICAgIHNvdW5kID0gc3dpdGNoIG9iamVjdC5fdHlwZVxyXG4gICAgICB3aGVuICd0b25lJyB0aGVuIEByZW5kZXJUb25lKG9iamVjdCwgb3ZlcnJpZGVzKVxyXG4gICAgICB3aGVuICdzYW1wbGUnIHRoZW4gQHJlbmRlclNhbXBsZShvYmplY3QsIG92ZXJyaWRlcylcclxuICAgICAgd2hlbiAnbG9vcCcgdGhlbiBAcmVuZGVyTG9vcChvYmplY3QpXHJcbiAgICAgIHdoZW4gJ3RyYWNrJyB0aGVuIEByZW5kZXJUcmFjayhvYmplY3QpXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBAZXJyb3IgXCJ1bmtub3duIHR5cGUgI3tvYmplY3QuX3R5cGV9XCJcclxuICAgICAgICBudWxsXHJcblxyXG4gICAgaWYgb2JqZWN0Ll90eXBlICE9ICd0b25lJ1xyXG4gICAgICBvdmVycmlkZU5vdGUgPSBpZiBvdmVycmlkZXMubm90ZSB0aGVuIG92ZXJyaWRlcy5ub3RlIGVsc2Ugb2JqZWN0Lm5vdGVcclxuICAgICAgaWYgKG92ZXJyaWRlTm90ZSAhPSBvYmplY3Quc3Jjbm90ZSkgb3IgKG9iamVjdC5vY3RhdmUgIT0gb2JqZWN0LnNyY29jdGF2ZSlcclxuICAgICAgICBvbGRmcmVxID0gZmluZEZyZXEob2JqZWN0LnNyY29jdGF2ZSwgb2JqZWN0LnNyY25vdGUpXHJcbiAgICAgICAgbmV3ZnJlcSA9IGZpbmRGcmVxKG9iamVjdC5vY3RhdmUsIG92ZXJyaWRlTm90ZSlcclxuXHJcbiAgICAgICAgZmFjdG9yID0gb2xkZnJlcSAvIG5ld2ZyZXFcclxuICAgICAgICAjIEBsb2cudmVyYm9zZSBcIm9sZDogI3tvbGRmcmVxfSwgbmV3OiAje25ld2ZyZXF9LCBmYWN0b3I6ICN7ZmFjdG9yfVwiXHJcblxyXG4gICAgICAgICMgVE9ETzogUHJvcGVybHkgcmVzYW1wbGUgaGVyZSB3aXRoIHNvbWV0aGluZyBvdGhlciB0aGFuIFwibmVhcmVzdCBuZWlnaGJvclwiXHJcbiAgICAgICAgcmVsZW5ndGggPSBNYXRoLmZsb29yKHNvdW5kLnNhbXBsZXMubGVuZ3RoICogZmFjdG9yKVxyXG4gICAgICAgIHJlc2FtcGxlcyA9IEFycmF5KHJlbGVuZ3RoKVxyXG4gICAgICAgIGZvciBpIGluIFswLi4ucmVsZW5ndGhdXHJcbiAgICAgICAgICByZXNhbXBsZXNbaV0gPSAwXHJcbiAgICAgICAgZm9yIGkgaW4gWzAuLi5yZWxlbmd0aF1cclxuICAgICAgICAgIHJlc2FtcGxlc1tpXSA9IHNvdW5kLnNhbXBsZXNbTWF0aC5mbG9vcihpIC8gZmFjdG9yKV1cclxuXHJcbiAgICAgICAgc291bmQuc2FtcGxlcyA9IHJlc2FtcGxlc1xyXG4gICAgICAgIHNvdW5kLmxlbmd0aCA9IHJlc2FtcGxlcy5sZW5ndGhcclxuXHJcbiAgICAjIFZvbHVtZVxyXG4gICAgaWYgb2JqZWN0LnZvbHVtZT8gYW5kIChvYmplY3Qudm9sdW1lICE9IDEuMClcclxuICAgICAgZm9yIGkgaW4gWzAuLi5zb3VuZC5zYW1wbGVzLmxlbmd0aF1cclxuICAgICAgICBzb3VuZC5zYW1wbGVzW2ldICo9IG9iamVjdC52b2x1bWVcclxuXHJcbiAgICAjIFJldmVyYlxyXG4gICAgaWYgb2JqZWN0LnJldmVyYj8gYW5kIChvYmplY3QucmV2ZXJiLmRlbGF5ID4gMClcclxuICAgICAgZGVsYXlTYW1wbGVzID0gTWF0aC5mbG9vcihvYmplY3QucmV2ZXJiLmRlbGF5ICogQHNhbXBsZVJhdGUgLyAxMDAwKVxyXG4gICAgICBpZiBzb3VuZC5zYW1wbGVzLmxlbmd0aCA+IGRlbGF5U2FtcGxlc1xyXG4gICAgICAgIHRvdGFsTGVuZ3RoID0gc291bmQuc2FtcGxlcy5sZW5ndGggKyAoZGVsYXlTYW1wbGVzICogOCkgIyB0aGlzICo4IGlzIHRvdGFsbHkgd3JvbmcuIE5lZWRzIG1vcmUgdGhvdWdodC5cclxuICAgICAgICAjIEBsb2cudmVyYm9zZSBcInJldmVyYmluZyAje2NhY2hlTmFtZX06ICN7ZGVsYXlTYW1wbGVzfS4gbGVuZ3RoIHVwZGF0ZSAje3NvdW5kLnNhbXBsZXMubGVuZ3RofSAtPiAje3RvdGFsTGVuZ3RofVwiXHJcbiAgICAgICAgc2FtcGxlcyA9IEFycmF5KHRvdGFsTGVuZ3RoKVxyXG4gICAgICAgIGZvciBpIGluIFswLi4uc291bmQuc2FtcGxlcy5sZW5ndGhdXHJcbiAgICAgICAgICBzYW1wbGVzW2ldID0gc291bmQuc2FtcGxlc1tpXVxyXG4gICAgICAgIGZvciBpIGluIFtzb3VuZC5zYW1wbGVzLmxlbmd0aC4uLnRvdGFsTGVuZ3RoXVxyXG4gICAgICAgICAgc2FtcGxlc1tpXSA9IDBcclxuICAgICAgICBmb3IgaSBpbiBbMC4uLih0b3RhbExlbmd0aCAtIGRlbGF5U2FtcGxlcyldXHJcbiAgICAgICAgICBzYW1wbGVzW2kgKyBkZWxheVNhbXBsZXNdICs9IE1hdGguZmxvb3Ioc2FtcGxlc1tpXSAqIG9iamVjdC5yZXZlcmIuZGVjYXkpXHJcbiAgICAgICAgc291bmQuc2FtcGxlcyA9IHNhbXBsZXNcclxuXHJcbiAgICBAbG9nLnZlcmJvc2UgXCJSZW5kZXJlZCAje2NhY2hlTmFtZX0uXCJcclxuICAgIEBzb3VuZENhY2hlW2NhY2hlTmFtZV0gPSBzb3VuZFxyXG4gICAgcmV0dXJuIHNvdW5kXHJcblxyXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuIyBXYXZlZm9ybSBJbWFnZSBSZW5kZXJlclxyXG5cclxucmVuZGVyV2F2ZWZvcm1JbWFnZSA9IChzYW1wbGVzLCB3aWR0aCwgaGVpZ2h0LCBiYWNrZ3JvdW5kQ29sb3IsIHdhdmVmb3JtQ29sb3IpIC0+XHJcbiAgYmFja2dyb3VuZENvbG9yID89IFsyNTUsIDI1NSwgMjU1XVxyXG4gIHdhdmVmb3JtQ29sb3IgPz0gWzI1NSwgMCwgMF1cclxuICByb3dzID0gW11cclxuICBmb3IgaiBpbiBbMC4uLmhlaWdodF1cclxuICAgIHJvdyA9IFtdXHJcbiAgICBmb3IgaSBpbiBbMC4uLndpZHRoXVxyXG4gICAgICByb3cucHVzaCBiYWNrZ3JvdW5kQ29sb3JcclxuICAgIHJvd3MucHVzaCByb3dcclxuXHJcbiAgc2FtcGxlc1BlckNvbCA9IE1hdGguZmxvb3Ioc2FtcGxlcy5sZW5ndGggLyB3aWR0aClcclxuXHJcbiAgcGVhayA9IDBcclxuICBmb3Igc2FtcGxlIGluIHNhbXBsZXNcclxuICAgIGEgPSBNYXRoLmFicyhzYW1wbGUpXHJcbiAgICBpZiBwZWFrIDwgYVxyXG4gICAgICBwZWFrID0gYVxyXG5cclxuICBwZWFrID0gTWF0aC5mbG9vcihwZWFrICogMS4xKSAjIEdpdmUgYSBiaXQgb2YgbWFyZ2luIG9uIHRvcC9ib3R0b21cclxuXHJcbiAgaWYgcGVhayA9PSAwXHJcbiAgICByb3cgPSByb3dzWyBNYXRoLmZsb29yKGhlaWdodCAvIDIpIF1cclxuICAgIGZvciBpIGluIFswLi4ud2lkdGhdXHJcbiAgICAgIHJvd1tpXSA9IHdhdmVmb3JtQ29sb3JcclxuICBlbHNlXHJcbiAgICBmb3IgaSBpbiBbMC4uLndpZHRoXVxyXG4gICAgICBzYW1wbGVPZmZzZXQgPSBNYXRoLmZsb29yKChpIC8gd2lkdGgpICogc2FtcGxlcy5sZW5ndGgpXHJcbiAgICAgIHNhbXBsZVN1bSA9IDBcclxuICAgICAgc2FtcGxlTWF4ID0gMFxyXG4gICAgICBmb3Igc2FtcGxlSW5kZXggaW4gW3NhbXBsZU9mZnNldC4uLihzYW1wbGVPZmZzZXQrc2FtcGxlc1BlckNvbCldXHJcbiAgICAgICAgYSA9IE1hdGguYWJzKHNhbXBsZXNbc2FtcGxlSW5kZXhdKVxyXG4gICAgICAgIHNhbXBsZVN1bSArPSBhXHJcbiAgICAgICAgaWYgc2FtcGxlTWF4IDwgYVxyXG4gICAgICAgICAgc2FtcGxlTWF4ID0gYVxyXG4gICAgICBzYW1wbGVBdmcgPSBNYXRoLmZsb29yKHNhbXBsZVN1bSAvIHNhbXBsZXNQZXJDb2wpXHJcbiAgICAgIGxpbmVIZWlnaHQgPSBNYXRoLmZsb29yKHNhbXBsZU1heCAvIHBlYWsgKiBoZWlnaHQpXHJcbiAgICAgIGxpbmVPZmZzZXQgPSAoaGVpZ2h0IC0gbGluZUhlaWdodCkgPj4gMVxyXG4gICAgICBpZiBsaW5lSGVpZ2h0ID09IDBcclxuICAgICAgICBsaW5lSGVpZ2h0ID0gMVxyXG4gICAgICBmb3IgaiBpbiBbMC4uLmxpbmVIZWlnaHRdXHJcbiAgICAgICAgcm93ID0gcm93c1tqICsgbGluZU9mZnNldF1cclxuICAgICAgICByb3dbaV0gPSB3YXZlZm9ybUNvbG9yXHJcblxyXG4gIHJldHVybiBnZW5lcmF0ZUJpdG1hcERhdGFVUkwgcm93c1xyXG5cclxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiMgRXhwb3J0c1xyXG5cclxucmVuZGVyTG9vcFNjcmlwdCA9IChhcmdzKSAtPlxyXG4gIGxvZ09iaiA9IGFyZ3MubG9nXHJcbiAgbG9nT2JqLnZlcmJvc2UgXCJQYXJzaW5nLi4uXCJcclxuICBwYXJzZXIgPSBuZXcgUGFyc2VyKGxvZ09iailcclxuICBwYXJzZXIucGFyc2UgYXJncy5zY3JpcHRcclxuXHJcbiAgd2hpY2ggPSBhcmdzLndoaWNoXHJcbiAgd2hpY2ggPz0gcGFyc2VyLmxhc3RPYmplY3RcclxuXHJcbiAgaWYgd2hpY2hcclxuICAgIHNhbXBsZVJhdGUgPSA0NDEwMFxyXG4gICAgbG9nT2JqLnZlcmJvc2UgXCJSZW5kZXJpbmcuLi5cIlxyXG4gICAgcmVuZGVyZXIgPSBuZXcgUmVuZGVyZXIobG9nT2JqLCBzYW1wbGVSYXRlLCBhcmdzLnJlYWRMb2NhbEZpbGVzLCBwYXJzZXIub2JqZWN0cylcclxuICAgIG91dHB1dFNvdW5kID0gcmVuZGVyZXIucmVuZGVyKHdoaWNoLCB7fSlcclxuICAgIHJldCA9IHt9XHJcbiAgICBpZiBhcmdzLndhdkZpbGVuYW1lXHJcbiAgICAgIHJpZmZ3YXZlLndyaXRlV0FWIGFyZ3Mud2F2RmlsZW5hbWUsIHNhbXBsZVJhdGUsIG91dHB1dFNvdW5kLnNhbXBsZXNcclxuICAgIGVsc2VcclxuICAgICAgcmV0LndhdlVybCA9IHJpZmZ3YXZlLm1ha2VCbG9iVXJsKHNhbXBsZVJhdGUsIG91dHB1dFNvdW5kLnNhbXBsZXMpXHJcbiAgICBpZiBhcmdzLmltYWdlV2lkdGg/IGFuZCBhcmdzLmltYWdlSGVpZ2h0PyBhbmQgKGFyZ3MuaW1hZ2VXaWR0aCA+IDApIGFuZCAoYXJncy5pbWFnZUhlaWdodCA+IDApXHJcbiAgICAgIHJldC5pbWFnZVVybCA9IHJlbmRlcldhdmVmb3JtSW1hZ2Uob3V0cHV0U291bmQuc2FtcGxlcywgYXJncy5pbWFnZVdpZHRoLCBhcmdzLmltYWdlSGVpZ2h0LCBhcmdzLmltYWdlQmFja2dyb3VuZENvbG9yLCBhcmdzLmltYWdlV2F2ZWZvcm1Db2xvcilcclxuICAgIHJldHVybiByZXRcclxuXHJcbiAgcmV0dXJuIG51bGxcclxuXHJcbm1vZHVsZS5leHBvcnRzID1cclxuICByZW5kZXI6IHJlbmRlckxvb3BTY3JpcHRcclxuIiwiZnMgPSByZXF1aXJlIFwiZnNcIlxyXG5cclxuY2xhc3MgRmFzdEJhc2U2NFxyXG5cclxuICBjb25zdHJ1Y3RvcjogLT5cclxuICAgIEBjaGFycyA9IFwiQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLz1cIlxyXG4gICAgQGVuY0xvb2t1cCA9IFtdXHJcbiAgICBmb3IgaSBpbiBbMC4uLjQwOTZdXHJcbiAgICAgIEBlbmNMb29rdXBbaV0gPSBAY2hhcnNbaSA+PiA2XSArIEBjaGFyc1tpICYgMHgzRl1cclxuXHJcbiAgZW5jb2RlOiAoc3JjKSAtPlxyXG4gICAgbGVuID0gc3JjLmxlbmd0aFxyXG4gICAgZHN0ID0gJydcclxuICAgIGkgPSAwXHJcbiAgICB3aGlsZSAobGVuID4gMilcclxuICAgICAgbiA9IChzcmNbaV0gPDwgMTYpIHwgKHNyY1tpKzFdPDw4KSB8IHNyY1tpKzJdXHJcbiAgICAgIGRzdCs9IHRoaXMuZW5jTG9va3VwW24gPj4gMTJdICsgdGhpcy5lbmNMb29rdXBbbiAmIDB4RkZGXVxyXG4gICAgICBsZW4tPSAzXHJcbiAgICAgIGkrPSAzXHJcbiAgICBpZiAobGVuID4gMClcclxuICAgICAgbjE9IChzcmNbaV0gJiAweEZDKSA+PiAyXHJcbiAgICAgIG4yPSAoc3JjW2ldICYgMHgwMykgPDwgNFxyXG4gICAgICBpZiAobGVuID4gMSlcclxuICAgICAgICBuMiB8PSAoc3JjWysraV0gJiAweEYwKSA+PiA0XHJcbiAgICAgIGRzdCs9IHRoaXMuY2hhcnNbbjFdXHJcbiAgICAgIGRzdCs9IHRoaXMuY2hhcnNbbjJdXHJcbiAgICAgIGlmIChsZW4gPT0gMilcclxuICAgICAgICBuMz0gKHNyY1tpKytdICYgMHgwRikgPDwgMlxyXG4gICAgICAgIG4zIHw9IChzcmNbaV0gJiAweEMwKSA+PiA2XHJcbiAgICAgICAgZHN0Kz0gdGhpcy5jaGFyc1tuM11cclxuICAgICAgaWYgKGxlbiA9PSAxKVxyXG4gICAgICAgIGRzdCs9ICc9J1xyXG4gICAgICBkc3QrPSAnPSdcclxuXHJcbiAgICByZXR1cm4gZHN0XHJcblxyXG5jbGFzcyBSSUZGV0FWRVxyXG4gIGNvbnN0cnVjdG9yOiAoQHNhbXBsZVJhdGUsIEBkYXRhKSAtPlxyXG4gICAgQHdhdiA9IFtdICAgICAjIEFycmF5IGNvbnRhaW5pbmcgdGhlIGdlbmVyYXRlZCB3YXZlIGZpbGVcclxuICAgIEBoZWFkZXIgPSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIE9GRlMgU0laRSBOT1RFU1xyXG4gICAgICBjaHVua0lkICAgICAgOiBbMHg1MiwweDQ5LDB4NDYsMHg0Nl0sICMgMCAgICA0ICBcIlJJRkZcIiA9IDB4NTI0OTQ2NDZcclxuICAgICAgY2h1bmtTaXplICAgIDogMCwgICAgICAgICAgICAgICAgICAgICAjIDQgICAgNCAgMzYrU3ViQ2h1bmsyU2l6ZSA9IDQrKDgrU3ViQ2h1bmsxU2l6ZSkrKDgrU3ViQ2h1bmsyU2l6ZSlcclxuICAgICAgZm9ybWF0ICAgICAgIDogWzB4NTcsMHg0MSwweDU2LDB4NDVdLCAjIDggICAgNCAgXCJXQVZFXCIgPSAweDU3NDE1NjQ1XHJcbiAgICAgIHN1YkNodW5rMUlkICA6IFsweDY2LDB4NmQsMHg3NCwweDIwXSwgIyAxMiAgIDQgIFwiZm10IFwiID0gMHg2NjZkNzQyMFxyXG4gICAgICBzdWJDaHVuazFTaXplOiAxNiwgICAgICAgICAgICAgICAgICAgICMgMTYgICA0ICAxNiBmb3IgUENNXHJcbiAgICAgIGF1ZGlvRm9ybWF0ICA6IDEsICAgICAgICAgICAgICAgICAgICAgIyAyMCAgIDIgIFBDTSA9IDFcclxuICAgICAgbnVtQ2hhbm5lbHMgIDogMSwgICAgICAgICAgICAgICAgICAgICAjIDIyICAgMiAgTW9ubyA9IDEsIFN0ZXJlbyA9IDIuLi5cclxuICAgICAgc2FtcGxlUmF0ZSAgIDogQHNhbXBsZVJhdGUsICAgICAgICAgICAjIDI0ICAgNCAgODAwMCwgNDQxMDAuLi5cclxuICAgICAgYnl0ZVJhdGUgICAgIDogMCwgICAgICAgICAgICAgICAgICAgICAjIDI4ICAgNCAgU2FtcGxlUmF0ZSpOdW1DaGFubmVscypCaXRzUGVyU2FtcGxlLzhcclxuICAgICAgYmxvY2tBbGlnbiAgIDogMCwgICAgICAgICAgICAgICAgICAgICAjIDMyICAgMiAgTnVtQ2hhbm5lbHMqQml0c1BlclNhbXBsZS84XHJcbiAgICAgIGJpdHNQZXJTYW1wbGU6IDE2LCAgICAgICAgICAgICAgICAgICAgIyAzNCAgIDIgIDggYml0cyA9IDgsIDE2IGJpdHMgPSAxNlxyXG4gICAgICBzdWJDaHVuazJJZCAgOiBbMHg2NCwweDYxLDB4NzQsMHg2MV0sICMgMzYgICA0ICBcImRhdGFcIiA9IDB4NjQ2MTc0NjFcclxuICAgICAgc3ViQ2h1bmsyU2l6ZTogMCAgICAgICAgICAgICAgICAgICAgICAjIDQwICAgNCAgZGF0YSBzaXplID0gTnVtU2FtcGxlcypOdW1DaGFubmVscypCaXRzUGVyU2FtcGxlLzhcclxuXHJcbiAgICBAZ2VuZXJhdGUoKVxyXG5cclxuICB1MzJUb0FycmF5OiAoaSkgLT5cclxuICAgIHJldHVybiBbaSYweEZGLCAoaT4+OCkmMHhGRiwgKGk+PjE2KSYweEZGLCAoaT4+MjQpJjB4RkZdXHJcblxyXG4gIHUxNlRvQXJyYXk6IChpKSAtPlxyXG4gICAgcmV0dXJuIFtpJjB4RkYsIChpPj44KSYweEZGXVxyXG5cclxuICBzcGxpdDE2Yml0QXJyYXk6IChkYXRhKSAtPlxyXG4gICAgciA9IFtdXHJcbiAgICBqID0gMFxyXG4gICAgbGVuID0gZGF0YS5sZW5ndGhcclxuICAgIGZvciBpIGluIFswLi4ubGVuXVxyXG4gICAgICByW2orK10gPSBkYXRhW2ldICYgMHhGRlxyXG4gICAgICByW2orK10gPSAoZGF0YVtpXT4+OCkgJiAweEZGXHJcblxyXG4gICAgcmV0dXJuIHJcclxuXHJcbiAgZ2VuZXJhdGU6IC0+XHJcbiAgICBAaGVhZGVyLmJsb2NrQWxpZ24gPSAoQGhlYWRlci5udW1DaGFubmVscyAqIEBoZWFkZXIuYml0c1BlclNhbXBsZSkgPj4gM1xyXG4gICAgQGhlYWRlci5ieXRlUmF0ZSA9IEBoZWFkZXIuYmxvY2tBbGlnbiAqIEBzYW1wbGVSYXRlXHJcbiAgICBAaGVhZGVyLnN1YkNodW5rMlNpemUgPSBAZGF0YS5sZW5ndGggKiAoQGhlYWRlci5iaXRzUGVyU2FtcGxlID4+IDMpXHJcbiAgICBAaGVhZGVyLmNodW5rU2l6ZSA9IDM2ICsgQGhlYWRlci5zdWJDaHVuazJTaXplXHJcblxyXG4gICAgaWYgQGhlYWRlci5iaXRzUGVyU2FtcGxlID09IDE2XHJcbiAgICAgIEBkYXRhID0gQHNwbGl0MTZiaXRBcnJheShAZGF0YSlcclxuXHJcbiAgICBAd2F2ID0gQGhlYWRlci5jaHVua0lkLmNvbmNhdChcclxuICAgICAgQHUzMlRvQXJyYXkoQGhlYWRlci5jaHVua1NpemUpLFxyXG4gICAgICBAaGVhZGVyLmZvcm1hdCxcclxuICAgICAgQGhlYWRlci5zdWJDaHVuazFJZCxcclxuICAgICAgQHUzMlRvQXJyYXkoQGhlYWRlci5zdWJDaHVuazFTaXplKSxcclxuICAgICAgQHUxNlRvQXJyYXkoQGhlYWRlci5hdWRpb0Zvcm1hdCksXHJcbiAgICAgIEB1MTZUb0FycmF5KEBoZWFkZXIubnVtQ2hhbm5lbHMpLFxyXG4gICAgICBAdTMyVG9BcnJheShAaGVhZGVyLnNhbXBsZVJhdGUpLFxyXG4gICAgICBAdTMyVG9BcnJheShAaGVhZGVyLmJ5dGVSYXRlKSxcclxuICAgICAgQHUxNlRvQXJyYXkoQGhlYWRlci5ibG9ja0FsaWduKSxcclxuICAgICAgQHUxNlRvQXJyYXkoQGhlYWRlci5iaXRzUGVyU2FtcGxlKSxcclxuICAgICAgQGhlYWRlci5zdWJDaHVuazJJZCxcclxuICAgICAgQHUzMlRvQXJyYXkoQGhlYWRlci5zdWJDaHVuazJTaXplKSxcclxuICAgICAgQGRhdGFcclxuICAgIClcclxuICAgIGZiID0gbmV3IEZhc3RCYXNlNjRcclxuICAgIEBiYXNlNjREYXRhID0gZmIuZW5jb2RlKEB3YXYpXHJcbiAgICBAZGF0YVVSSSA9ICdkYXRhOmF1ZGlvL3dhdjtiYXNlNjQsJyArIEBiYXNlNjREYXRhXHJcblxyXG4gIHJhdzogLT5cclxuICAgIHJldHVybiBuZXcgQnVmZmVyKEBiYXNlNjREYXRhLCBcImJhc2U2NFwiKVxyXG5cclxud3JpdGVXQVYgPSAoZmlsZW5hbWUsIHNhbXBsZVJhdGUsIHNhbXBsZXMpIC0+XHJcbiAgd2F2ZSA9IG5ldyBSSUZGV0FWRSBzYW1wbGVSYXRlLCBzYW1wbGVzXHJcbiAgZnMud3JpdGVGaWxlU3luYyhmaWxlbmFtZSwgd2F2ZS5yYXcoKSlcclxuICByZXR1cm4gdHJ1ZVxyXG5cclxubWFrZURhdGFVUkkgPSAoc2FtcGxlUmF0ZSwgc2FtcGxlcykgLT5cclxuICB3YXZlID0gbmV3IFJJRkZXQVZFIHNhbXBsZVJhdGUsIHNhbXBsZXNcclxuICByZXR1cm4gd2F2ZS5kYXRhVVJJXHJcblxyXG5iNjR0b0Jsb2IgPSAoYjY0RGF0YSwgY29udGVudFR5cGUsIHNsaWNlU2l6ZSkgLT5cclxuICBjb250ZW50VHlwZSA9IGNvbnRlbnRUeXBlIHx8ICcnXHJcbiAgc2xpY2VTaXplID0gc2xpY2VTaXplIHx8IDUxMlxyXG5cclxuICBieXRlQ2hhcmFjdGVycyA9IGF0b2IoYjY0RGF0YSlcclxuICBieXRlQXJyYXlzID0gW11cclxuXHJcbiAgZm9yIG9mZnNldCBpbiBbMC4uLmJ5dGVDaGFyYWN0ZXJzLmxlbmd0aF0gYnkgc2xpY2VTaXplXHJcbiAgICBzbGljZSA9IGJ5dGVDaGFyYWN0ZXJzLnNsaWNlKG9mZnNldCwgb2Zmc2V0ICsgc2xpY2VTaXplKVxyXG5cclxuICAgIGJ5dGVOdW1iZXJzID0gbmV3IEFycmF5KHNsaWNlLmxlbmd0aClcclxuICAgIGZvciBpIGluIFswLi4uc2xpY2UubGVuZ3RoXVxyXG4gICAgICBieXRlTnVtYmVyc1tpXSA9IHNsaWNlLmNoYXJDb2RlQXQoaSlcclxuXHJcbiAgICBieXRlQXJyYXkgPSBuZXcgVWludDhBcnJheShieXRlTnVtYmVycylcclxuXHJcbiAgICBieXRlQXJyYXlzLnB1c2goYnl0ZUFycmF5KVxyXG5cclxuICBibG9iID0gbmV3IEJsb2IoYnl0ZUFycmF5cywge3R5cGU6IGNvbnRlbnRUeXBlfSlcclxuICByZXR1cm4gYmxvYlxyXG5cclxubWFrZUJsb2JVcmwgPSAoc2FtcGxlUmF0ZSwgc2FtcGxlcykgLT5cclxuICB3YXZlID0gbmV3IFJJRkZXQVZFIHNhbXBsZVJhdGUsIHNhbXBsZXNcclxuICBibG9iID0gYjY0dG9CbG9iKHdhdmUuYmFzZTY0RGF0YSwgXCJhdWRpby93YXZcIilcclxuICByZXR1cm4gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPVxyXG4gIFJJRkZXQVZFOiBSSUZGV0FWRVxyXG4gIHdyaXRlV0FWOiB3cml0ZVdBVlxyXG4gIG1ha2VEYXRhVVJJOiBtYWtlRGF0YVVSSVxyXG4gIG1ha2VCbG9iVXJsOiBtYWtlQmxvYlVybFxyXG4iXX0=
