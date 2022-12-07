require=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(
      uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)
    ))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],2:[function(require,module,exports){
var bigInt = (function (undefined) {
    "use strict";

    var BASE = 1e7,
        LOG_BASE = 7,
        MAX_INT = 9007199254740992,
        MAX_INT_ARR = smallToArray(MAX_INT),
        DEFAULT_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";

    var supportsNativeBigInt = typeof BigInt === "function";

    function Integer(v, radix, alphabet, caseSensitive) {
        if (typeof v === "undefined") return Integer[0];
        if (typeof radix !== "undefined") return +radix === 10 && !alphabet ? parseValue(v) : parseBase(v, radix, alphabet, caseSensitive);
        return parseValue(v);
    }

    function BigInteger(value, sign) {
        this.value = value;
        this.sign = sign;
        this.isSmall = false;
    }
    BigInteger.prototype = Object.create(Integer.prototype);

    function SmallInteger(value) {
        this.value = value;
        this.sign = value < 0;
        this.isSmall = true;
    }
    SmallInteger.prototype = Object.create(Integer.prototype);

    function NativeBigInt(value) {
        this.value = value;
    }
    NativeBigInt.prototype = Object.create(Integer.prototype);

    function isPrecise(n) {
        return -MAX_INT < n && n < MAX_INT;
    }

    function smallToArray(n) { // For performance reasons doesn't reference BASE, need to change this function if BASE changes
        if (n < 1e7)
            return [n];
        if (n < 1e14)
            return [n % 1e7, Math.floor(n / 1e7)];
        return [n % 1e7, Math.floor(n / 1e7) % 1e7, Math.floor(n / 1e14)];
    }

    function arrayToSmall(arr) { // If BASE changes this function may need to change
        trim(arr);
        var length = arr.length;
        if (length < 4 && compareAbs(arr, MAX_INT_ARR) < 0) {
            switch (length) {
                case 0: return 0;
                case 1: return arr[0];
                case 2: return arr[0] + arr[1] * BASE;
                default: return arr[0] + (arr[1] + arr[2] * BASE) * BASE;
            }
        }
        return arr;
    }

    function trim(v) {
        var i = v.length;
        while (v[--i] === 0);
        v.length = i + 1;
    }

    function createArray(length) { // function shamelessly stolen from Yaffle's library https://github.com/Yaffle/BigInteger
        var x = new Array(length);
        var i = -1;
        while (++i < length) {
            x[i] = 0;
        }
        return x;
    }

    function truncate(n) {
        if (n > 0) return Math.floor(n);
        return Math.ceil(n);
    }

    function add(a, b) { // assumes a and b are arrays with a.length >= b.length
        var l_a = a.length,
            l_b = b.length,
            r = new Array(l_a),
            carry = 0,
            base = BASE,
            sum, i;
        for (i = 0; i < l_b; i++) {
            sum = a[i] + b[i] + carry;
            carry = sum >= base ? 1 : 0;
            r[i] = sum - carry * base;
        }
        while (i < l_a) {
            sum = a[i] + carry;
            carry = sum === base ? 1 : 0;
            r[i++] = sum - carry * base;
        }
        if (carry > 0) r.push(carry);
        return r;
    }

    function addAny(a, b) {
        if (a.length >= b.length) return add(a, b);
        return add(b, a);
    }

    function addSmall(a, carry) { // assumes a is array, carry is number with 0 <= carry < MAX_INT
        var l = a.length,
            r = new Array(l),
            base = BASE,
            sum, i;
        for (i = 0; i < l; i++) {
            sum = a[i] - base + carry;
            carry = Math.floor(sum / base);
            r[i] = sum - carry * base;
            carry += 1;
        }
        while (carry > 0) {
            r[i++] = carry % base;
            carry = Math.floor(carry / base);
        }
        return r;
    }

    BigInteger.prototype.add = function (v) {
        var n = parseValue(v);
        if (this.sign !== n.sign) {
            return this.subtract(n.negate());
        }
        var a = this.value, b = n.value;
        if (n.isSmall) {
            return new BigInteger(addSmall(a, Math.abs(b)), this.sign);
        }
        return new BigInteger(addAny(a, b), this.sign);
    };
    BigInteger.prototype.plus = BigInteger.prototype.add;

    SmallInteger.prototype.add = function (v) {
        var n = parseValue(v);
        var a = this.value;
        if (a < 0 !== n.sign) {
            return this.subtract(n.negate());
        }
        var b = n.value;
        if (n.isSmall) {
            if (isPrecise(a + b)) return new SmallInteger(a + b);
            b = smallToArray(Math.abs(b));
        }
        return new BigInteger(addSmall(b, Math.abs(a)), a < 0);
    };
    SmallInteger.prototype.plus = SmallInteger.prototype.add;

    NativeBigInt.prototype.add = function (v) {
        return new NativeBigInt(this.value + parseValue(v).value);
    }
    NativeBigInt.prototype.plus = NativeBigInt.prototype.add;

    function subtract(a, b) { // assumes a and b are arrays with a >= b
        var a_l = a.length,
            b_l = b.length,
            r = new Array(a_l),
            borrow = 0,
            base = BASE,
            i, difference;
        for (i = 0; i < b_l; i++) {
            difference = a[i] - borrow - b[i];
            if (difference < 0) {
                difference += base;
                borrow = 1;
            } else borrow = 0;
            r[i] = difference;
        }
        for (i = b_l; i < a_l; i++) {
            difference = a[i] - borrow;
            if (difference < 0) difference += base;
            else {
                r[i++] = difference;
                break;
            }
            r[i] = difference;
        }
        for (; i < a_l; i++) {
            r[i] = a[i];
        }
        trim(r);
        return r;
    }

    function subtractAny(a, b, sign) {
        var value;
        if (compareAbs(a, b) >= 0) {
            value = subtract(a, b);
        } else {
            value = subtract(b, a);
            sign = !sign;
        }
        value = arrayToSmall(value);
        if (typeof value === "number") {
            if (sign) value = -value;
            return new SmallInteger(value);
        }
        return new BigInteger(value, sign);
    }

    function subtractSmall(a, b, sign) { // assumes a is array, b is number with 0 <= b < MAX_INT
        var l = a.length,
            r = new Array(l),
            carry = -b,
            base = BASE,
            i, difference;
        for (i = 0; i < l; i++) {
            difference = a[i] + carry;
            carry = Math.floor(difference / base);
            difference %= base;
            r[i] = difference < 0 ? difference + base : difference;
        }
        r = arrayToSmall(r);
        if (typeof r === "number") {
            if (sign) r = -r;
            return new SmallInteger(r);
        } return new BigInteger(r, sign);
    }

    BigInteger.prototype.subtract = function (v) {
        var n = parseValue(v);
        if (this.sign !== n.sign) {
            return this.add(n.negate());
        }
        var a = this.value, b = n.value;
        if (n.isSmall)
            return subtractSmall(a, Math.abs(b), this.sign);
        return subtractAny(a, b, this.sign);
    };
    BigInteger.prototype.minus = BigInteger.prototype.subtract;

    SmallInteger.prototype.subtract = function (v) {
        var n = parseValue(v);
        var a = this.value;
        if (a < 0 !== n.sign) {
            return this.add(n.negate());
        }
        var b = n.value;
        if (n.isSmall) {
            return new SmallInteger(a - b);
        }
        return subtractSmall(b, Math.abs(a), a >= 0);
    };
    SmallInteger.prototype.minus = SmallInteger.prototype.subtract;

    NativeBigInt.prototype.subtract = function (v) {
        return new NativeBigInt(this.value - parseValue(v).value);
    }
    NativeBigInt.prototype.minus = NativeBigInt.prototype.subtract;

    BigInteger.prototype.negate = function () {
        return new BigInteger(this.value, !this.sign);
    };
    SmallInteger.prototype.negate = function () {
        var sign = this.sign;
        var small = new SmallInteger(-this.value);
        small.sign = !sign;
        return small;
    };
    NativeBigInt.prototype.negate = function () {
        return new NativeBigInt(-this.value);
    }

    BigInteger.prototype.abs = function () {
        return new BigInteger(this.value, false);
    };
    SmallInteger.prototype.abs = function () {
        return new SmallInteger(Math.abs(this.value));
    };
    NativeBigInt.prototype.abs = function () {
        return new NativeBigInt(this.value >= 0 ? this.value : -this.value);
    }


    function multiplyLong(a, b) {
        var a_l = a.length,
            b_l = b.length,
            l = a_l + b_l,
            r = createArray(l),
            base = BASE,
            product, carry, i, a_i, b_j;
        for (i = 0; i < a_l; ++i) {
            a_i = a[i];
            for (var j = 0; j < b_l; ++j) {
                b_j = b[j];
                product = a_i * b_j + r[i + j];
                carry = Math.floor(product / base);
                r[i + j] = product - carry * base;
                r[i + j + 1] += carry;
            }
        }
        trim(r);
        return r;
    }

    function multiplySmall(a, b) { // assumes a is array, b is number with |b| < BASE
        var l = a.length,
            r = new Array(l),
            base = BASE,
            carry = 0,
            product, i;
        for (i = 0; i < l; i++) {
            product = a[i] * b + carry;
            carry = Math.floor(product / base);
            r[i] = product - carry * base;
        }
        while (carry > 0) {
            r[i++] = carry % base;
            carry = Math.floor(carry / base);
        }
        return r;
    }

    function shiftLeft(x, n) {
        var r = [];
        while (n-- > 0) r.push(0);
        return r.concat(x);
    }

    function multiplyKaratsuba(x, y) {
        var n = Math.max(x.length, y.length);

        if (n <= 30) return multiplyLong(x, y);
        n = Math.ceil(n / 2);

        var b = x.slice(n),
            a = x.slice(0, n),
            d = y.slice(n),
            c = y.slice(0, n);

        var ac = multiplyKaratsuba(a, c),
            bd = multiplyKaratsuba(b, d),
            abcd = multiplyKaratsuba(addAny(a, b), addAny(c, d));

        var product = addAny(addAny(ac, shiftLeft(subtract(subtract(abcd, ac), bd), n)), shiftLeft(bd, 2 * n));
        trim(product);
        return product;
    }

    // The following function is derived from a surface fit of a graph plotting the performance difference
    // between long multiplication and karatsuba multiplication versus the lengths of the two arrays.
    function useKaratsuba(l1, l2) {
        return -0.012 * l1 - 0.012 * l2 + 0.000015 * l1 * l2 > 0;
    }

    BigInteger.prototype.multiply = function (v) {
        var n = parseValue(v),
            a = this.value, b = n.value,
            sign = this.sign !== n.sign,
            abs;
        if (n.isSmall) {
            if (b === 0) return Integer[0];
            if (b === 1) return this;
            if (b === -1) return this.negate();
            abs = Math.abs(b);
            if (abs < BASE) {
                return new BigInteger(multiplySmall(a, abs), sign);
            }
            b = smallToArray(abs);
        }
        if (useKaratsuba(a.length, b.length)) // Karatsuba is only faster for certain array sizes
            return new BigInteger(multiplyKaratsuba(a, b), sign);
        return new BigInteger(multiplyLong(a, b), sign);
    };

    BigInteger.prototype.times = BigInteger.prototype.multiply;

    function multiplySmallAndArray(a, b, sign) { // a >= 0
        if (a < BASE) {
            return new BigInteger(multiplySmall(b, a), sign);
        }
        return new BigInteger(multiplyLong(b, smallToArray(a)), sign);
    }
    SmallInteger.prototype._multiplyBySmall = function (a) {
        if (isPrecise(a.value * this.value)) {
            return new SmallInteger(a.value * this.value);
        }
        return multiplySmallAndArray(Math.abs(a.value), smallToArray(Math.abs(this.value)), this.sign !== a.sign);
    };
    BigInteger.prototype._multiplyBySmall = function (a) {
        if (a.value === 0) return Integer[0];
        if (a.value === 1) return this;
        if (a.value === -1) return this.negate();
        return multiplySmallAndArray(Math.abs(a.value), this.value, this.sign !== a.sign);
    };
    SmallInteger.prototype.multiply = function (v) {
        return parseValue(v)._multiplyBySmall(this);
    };
    SmallInteger.prototype.times = SmallInteger.prototype.multiply;

    NativeBigInt.prototype.multiply = function (v) {
        return new NativeBigInt(this.value * parseValue(v).value);
    }
    NativeBigInt.prototype.times = NativeBigInt.prototype.multiply;

    function square(a) {
        //console.assert(2 * BASE * BASE < MAX_INT);
        var l = a.length,
            r = createArray(l + l),
            base = BASE,
            product, carry, i, a_i, a_j;
        for (i = 0; i < l; i++) {
            a_i = a[i];
            carry = 0 - a_i * a_i;
            for (var j = i; j < l; j++) {
                a_j = a[j];
                product = 2 * (a_i * a_j) + r[i + j] + carry;
                carry = Math.floor(product / base);
                r[i + j] = product - carry * base;
            }
            r[i + l] = carry;
        }
        trim(r);
        return r;
    }

    BigInteger.prototype.square = function () {
        return new BigInteger(square(this.value), false);
    };

    SmallInteger.prototype.square = function () {
        var value = this.value * this.value;
        if (isPrecise(value)) return new SmallInteger(value);
        return new BigInteger(square(smallToArray(Math.abs(this.value))), false);
    };

    NativeBigInt.prototype.square = function (v) {
        return new NativeBigInt(this.value * this.value);
    }

    function divMod1(a, b) { // Left over from previous version. Performs faster than divMod2 on smaller input sizes.
        var a_l = a.length,
            b_l = b.length,
            base = BASE,
            result = createArray(b.length),
            divisorMostSignificantDigit = b[b_l - 1],
            // normalization
            lambda = Math.ceil(base / (2 * divisorMostSignificantDigit)),
            remainder = multiplySmall(a, lambda),
            divisor = multiplySmall(b, lambda),
            quotientDigit, shift, carry, borrow, i, l, q;
        if (remainder.length <= a_l) remainder.push(0);
        divisor.push(0);
        divisorMostSignificantDigit = divisor[b_l - 1];
        for (shift = a_l - b_l; shift >= 0; shift--) {
            quotientDigit = base - 1;
            if (remainder[shift + b_l] !== divisorMostSignificantDigit) {
                quotientDigit = Math.floor((remainder[shift + b_l] * base + remainder[shift + b_l - 1]) / divisorMostSignificantDigit);
            }
            // quotientDigit <= base - 1
            carry = 0;
            borrow = 0;
            l = divisor.length;
            for (i = 0; i < l; i++) {
                carry += quotientDigit * divisor[i];
                q = Math.floor(carry / base);
                borrow += remainder[shift + i] - (carry - q * base);
                carry = q;
                if (borrow < 0) {
                    remainder[shift + i] = borrow + base;
                    borrow = -1;
                } else {
                    remainder[shift + i] = borrow;
                    borrow = 0;
                }
            }
            while (borrow !== 0) {
                quotientDigit -= 1;
                carry = 0;
                for (i = 0; i < l; i++) {
                    carry += remainder[shift + i] - base + divisor[i];
                    if (carry < 0) {
                        remainder[shift + i] = carry + base;
                        carry = 0;
                    } else {
                        remainder[shift + i] = carry;
                        carry = 1;
                    }
                }
                borrow += carry;
            }
            result[shift] = quotientDigit;
        }
        // denormalization
        remainder = divModSmall(remainder, lambda)[0];
        return [arrayToSmall(result), arrayToSmall(remainder)];
    }

    function divMod2(a, b) { // Implementation idea shamelessly stolen from Silent Matt's library http://silentmatt.com/biginteger/
        // Performs faster than divMod1 on larger input sizes.
        var a_l = a.length,
            b_l = b.length,
            result = [],
            part = [],
            base = BASE,
            guess, xlen, highx, highy, check;
        while (a_l) {
            part.unshift(a[--a_l]);
            trim(part);
            if (compareAbs(part, b) < 0) {
                result.push(0);
                continue;
            }
            xlen = part.length;
            highx = part[xlen - 1] * base + part[xlen - 2];
            highy = b[b_l - 1] * base + b[b_l - 2];
            if (xlen > b_l) {
                highx = (highx + 1) * base;
            }
            guess = Math.ceil(highx / highy);
            do {
                check = multiplySmall(b, guess);
                if (compareAbs(check, part) <= 0) break;
                guess--;
            } while (guess);
            result.push(guess);
            part = subtract(part, check);
        }
        result.reverse();
        return [arrayToSmall(result), arrayToSmall(part)];
    }

    function divModSmall(value, lambda) {
        var length = value.length,
            quotient = createArray(length),
            base = BASE,
            i, q, remainder, divisor;
        remainder = 0;
        for (i = length - 1; i >= 0; --i) {
            divisor = remainder * base + value[i];
            q = truncate(divisor / lambda);
            remainder = divisor - q * lambda;
            quotient[i] = q | 0;
        }
        return [quotient, remainder | 0];
    }

    function divModAny(self, v) {
        var value, n = parseValue(v);
        if (supportsNativeBigInt) {
            return [new NativeBigInt(self.value / n.value), new NativeBigInt(self.value % n.value)];
        }
        var a = self.value, b = n.value;
        var quotient;
        if (b === 0) throw new Error("Cannot divide by zero");
        if (self.isSmall) {
            if (n.isSmall) {
                return [new SmallInteger(truncate(a / b)), new SmallInteger(a % b)];
            }
            return [Integer[0], self];
        }
        if (n.isSmall) {
            if (b === 1) return [self, Integer[0]];
            if (b == -1) return [self.negate(), Integer[0]];
            var abs = Math.abs(b);
            if (abs < BASE) {
                value = divModSmall(a, abs);
                quotient = arrayToSmall(value[0]);
                var remainder = value[1];
                if (self.sign) remainder = -remainder;
                if (typeof quotient === "number") {
                    if (self.sign !== n.sign) quotient = -quotient;
                    return [new SmallInteger(quotient), new SmallInteger(remainder)];
                }
                return [new BigInteger(quotient, self.sign !== n.sign), new SmallInteger(remainder)];
            }
            b = smallToArray(abs);
        }
        var comparison = compareAbs(a, b);
        if (comparison === -1) return [Integer[0], self];
        if (comparison === 0) return [Integer[self.sign === n.sign ? 1 : -1], Integer[0]];

        // divMod1 is faster on smaller input sizes
        if (a.length + b.length <= 200)
            value = divMod1(a, b);
        else value = divMod2(a, b);

        quotient = value[0];
        var qSign = self.sign !== n.sign,
            mod = value[1],
            mSign = self.sign;
        if (typeof quotient === "number") {
            if (qSign) quotient = -quotient;
            quotient = new SmallInteger(quotient);
        } else quotient = new BigInteger(quotient, qSign);
        if (typeof mod === "number") {
            if (mSign) mod = -mod;
            mod = new SmallInteger(mod);
        } else mod = new BigInteger(mod, mSign);
        return [quotient, mod];
    }

    BigInteger.prototype.divmod = function (v) {
        var result = divModAny(this, v);
        return {
            quotient: result[0],
            remainder: result[1]
        };
    };
    NativeBigInt.prototype.divmod = SmallInteger.prototype.divmod = BigInteger.prototype.divmod;


    BigInteger.prototype.divide = function (v) {
        return divModAny(this, v)[0];
    };
    NativeBigInt.prototype.over = NativeBigInt.prototype.divide = function (v) {
        return new NativeBigInt(this.value / parseValue(v).value);
    };
    SmallInteger.prototype.over = SmallInteger.prototype.divide = BigInteger.prototype.over = BigInteger.prototype.divide;

    BigInteger.prototype.mod = function (v) {
        return divModAny(this, v)[1];
    };
    NativeBigInt.prototype.mod = NativeBigInt.prototype.remainder = function (v) {
        return new NativeBigInt(this.value % parseValue(v).value);
    };
    SmallInteger.prototype.remainder = SmallInteger.prototype.mod = BigInteger.prototype.remainder = BigInteger.prototype.mod;

    BigInteger.prototype.pow = function (v) {
        var n = parseValue(v),
            a = this.value,
            b = n.value,
            value, x, y;
        if (b === 0) return Integer[1];
        if (a === 0) return Integer[0];
        if (a === 1) return Integer[1];
        if (a === -1) return n.isEven() ? Integer[1] : Integer[-1];
        if (n.sign) {
            return Integer[0];
        }
        if (!n.isSmall) throw new Error("The exponent " + n.toString() + " is too large.");
        if (this.isSmall) {
            if (isPrecise(value = Math.pow(a, b)))
                return new SmallInteger(truncate(value));
        }
        x = this;
        y = Integer[1];
        while (true) {
            if (b & 1 === 1) {
                y = y.times(x);
                --b;
            }
            if (b === 0) break;
            b /= 2;
            x = x.square();
        }
        return y;
    };
    SmallInteger.prototype.pow = BigInteger.prototype.pow;

    NativeBigInt.prototype.pow = function (v) {
        var n = parseValue(v);
        var a = this.value, b = n.value;
        var _0 = BigInt(0), _1 = BigInt(1), _2 = BigInt(2);
        if (b === _0) return Integer[1];
        if (a === _0) return Integer[0];
        if (a === _1) return Integer[1];
        if (a === BigInt(-1)) return n.isEven() ? Integer[1] : Integer[-1];
        if (n.isNegative()) return new NativeBigInt(_0);
        var x = this;
        var y = Integer[1];
        while (true) {
            if ((b & _1) === _1) {
                y = y.times(x);
                --b;
            }
            if (b === _0) break;
            b /= _2;
            x = x.square();
        }
        return y;
    }

    BigInteger.prototype.modPow = function (exp, mod) {
        exp = parseValue(exp);
        mod = parseValue(mod);
        if (mod.isZero()) throw new Error("Cannot take modPow with modulus 0");
        var r = Integer[1],
            base = this.mod(mod);
        if (exp.isNegative()) {
            exp = exp.multiply(Integer[-1]);
            base = base.modInv(mod);
        }
        while (exp.isPositive()) {
            if (base.isZero()) return Integer[0];
            if (exp.isOdd()) r = r.multiply(base).mod(mod);
            exp = exp.divide(2);
            base = base.square().mod(mod);
        }
        return r;
    };
    NativeBigInt.prototype.modPow = SmallInteger.prototype.modPow = BigInteger.prototype.modPow;

    function compareAbs(a, b) {
        if (a.length !== b.length) {
            return a.length > b.length ? 1 : -1;
        }
        for (var i = a.length - 1; i >= 0; i--) {
            if (a[i] !== b[i]) return a[i] > b[i] ? 1 : -1;
        }
        return 0;
    }

    BigInteger.prototype.compareAbs = function (v) {
        var n = parseValue(v),
            a = this.value,
            b = n.value;
        if (n.isSmall) return 1;
        return compareAbs(a, b);
    };
    SmallInteger.prototype.compareAbs = function (v) {
        var n = parseValue(v),
            a = Math.abs(this.value),
            b = n.value;
        if (n.isSmall) {
            b = Math.abs(b);
            return a === b ? 0 : a > b ? 1 : -1;
        }
        return -1;
    };
    NativeBigInt.prototype.compareAbs = function (v) {
        var a = this.value;
        var b = parseValue(v).value;
        a = a >= 0 ? a : -a;
        b = b >= 0 ? b : -b;
        return a === b ? 0 : a > b ? 1 : -1;
    }

    BigInteger.prototype.compare = function (v) {
        // See discussion about comparison with Infinity:
        // https://github.com/peterolson/BigInteger.js/issues/61
        if (v === Infinity) {
            return -1;
        }
        if (v === -Infinity) {
            return 1;
        }

        var n = parseValue(v),
            a = this.value,
            b = n.value;
        if (this.sign !== n.sign) {
            return n.sign ? 1 : -1;
        }
        if (n.isSmall) {
            return this.sign ? -1 : 1;
        }
        return compareAbs(a, b) * (this.sign ? -1 : 1);
    };
    BigInteger.prototype.compareTo = BigInteger.prototype.compare;

    SmallInteger.prototype.compare = function (v) {
        if (v === Infinity) {
            return -1;
        }
        if (v === -Infinity) {
            return 1;
        }

        var n = parseValue(v),
            a = this.value,
            b = n.value;
        if (n.isSmall) {
            return a == b ? 0 : a > b ? 1 : -1;
        }
        if (a < 0 !== n.sign) {
            return a < 0 ? -1 : 1;
        }
        return a < 0 ? 1 : -1;
    };
    SmallInteger.prototype.compareTo = SmallInteger.prototype.compare;

    NativeBigInt.prototype.compare = function (v) {
        if (v === Infinity) {
            return -1;
        }
        if (v === -Infinity) {
            return 1;
        }
        var a = this.value;
        var b = parseValue(v).value;
        return a === b ? 0 : a > b ? 1 : -1;
    }
    NativeBigInt.prototype.compareTo = NativeBigInt.prototype.compare;

    BigInteger.prototype.equals = function (v) {
        return this.compare(v) === 0;
    };
    NativeBigInt.prototype.eq = NativeBigInt.prototype.equals = SmallInteger.prototype.eq = SmallInteger.prototype.equals = BigInteger.prototype.eq = BigInteger.prototype.equals;

    BigInteger.prototype.notEquals = function (v) {
        return this.compare(v) !== 0;
    };
    NativeBigInt.prototype.neq = NativeBigInt.prototype.notEquals = SmallInteger.prototype.neq = SmallInteger.prototype.notEquals = BigInteger.prototype.neq = BigInteger.prototype.notEquals;

    BigInteger.prototype.greater = function (v) {
        return this.compare(v) > 0;
    };
    NativeBigInt.prototype.gt = NativeBigInt.prototype.greater = SmallInteger.prototype.gt = SmallInteger.prototype.greater = BigInteger.prototype.gt = BigInteger.prototype.greater;

    BigInteger.prototype.lesser = function (v) {
        return this.compare(v) < 0;
    };
    NativeBigInt.prototype.lt = NativeBigInt.prototype.lesser = SmallInteger.prototype.lt = SmallInteger.prototype.lesser = BigInteger.prototype.lt = BigInteger.prototype.lesser;

    BigInteger.prototype.greaterOrEquals = function (v) {
        return this.compare(v) >= 0;
    };
    NativeBigInt.prototype.geq = NativeBigInt.prototype.greaterOrEquals = SmallInteger.prototype.geq = SmallInteger.prototype.greaterOrEquals = BigInteger.prototype.geq = BigInteger.prototype.greaterOrEquals;

    BigInteger.prototype.lesserOrEquals = function (v) {
        return this.compare(v) <= 0;
    };
    NativeBigInt.prototype.leq = NativeBigInt.prototype.lesserOrEquals = SmallInteger.prototype.leq = SmallInteger.prototype.lesserOrEquals = BigInteger.prototype.leq = BigInteger.prototype.lesserOrEquals;

    BigInteger.prototype.isEven = function () {
        return (this.value[0] & 1) === 0;
    };
    SmallInteger.prototype.isEven = function () {
        return (this.value & 1) === 0;
    };
    NativeBigInt.prototype.isEven = function () {
        return (this.value & BigInt(1)) === BigInt(0);
    }

    BigInteger.prototype.isOdd = function () {
        return (this.value[0] & 1) === 1;
    };
    SmallInteger.prototype.isOdd = function () {
        return (this.value & 1) === 1;
    };
    NativeBigInt.prototype.isOdd = function () {
        return (this.value & BigInt(1)) === BigInt(1);
    }

    BigInteger.prototype.isPositive = function () {
        return !this.sign;
    };
    SmallInteger.prototype.isPositive = function () {
        return this.value > 0;
    };
    NativeBigInt.prototype.isPositive = SmallInteger.prototype.isPositive;

    BigInteger.prototype.isNegative = function () {
        return this.sign;
    };
    SmallInteger.prototype.isNegative = function () {
        return this.value < 0;
    };
    NativeBigInt.prototype.isNegative = SmallInteger.prototype.isNegative;

    BigInteger.prototype.isUnit = function () {
        return false;
    };
    SmallInteger.prototype.isUnit = function () {
        return Math.abs(this.value) === 1;
    };
    NativeBigInt.prototype.isUnit = function () {
        return this.abs().value === BigInt(1);
    }

    BigInteger.prototype.isZero = function () {
        return false;
    };
    SmallInteger.prototype.isZero = function () {
        return this.value === 0;
    };
    NativeBigInt.prototype.isZero = function () {
        return this.value === BigInt(0);
    }

    BigInteger.prototype.isDivisibleBy = function (v) {
        var n = parseValue(v);
        if (n.isZero()) return false;
        if (n.isUnit()) return true;
        if (n.compareAbs(2) === 0) return this.isEven();
        return this.mod(n).isZero();
    };
    NativeBigInt.prototype.isDivisibleBy = SmallInteger.prototype.isDivisibleBy = BigInteger.prototype.isDivisibleBy;

    function isBasicPrime(v) {
        var n = v.abs();
        if (n.isUnit()) return false;
        if (n.equals(2) || n.equals(3) || n.equals(5)) return true;
        if (n.isEven() || n.isDivisibleBy(3) || n.isDivisibleBy(5)) return false;
        if (n.lesser(49)) return true;
        // we don't know if it's prime: let the other functions figure it out
    }

    function millerRabinTest(n, a) {
        var nPrev = n.prev(),
            b = nPrev,
            r = 0,
            d, t, i, x;
        while (b.isEven()) b = b.divide(2), r++;
        next: for (i = 0; i < a.length; i++) {
            if (n.lesser(a[i])) continue;
            x = bigInt(a[i]).modPow(b, n);
            if (x.isUnit() || x.equals(nPrev)) continue;
            for (d = r - 1; d != 0; d--) {
                x = x.square().mod(n);
                if (x.isUnit()) return false;
                if (x.equals(nPrev)) continue next;
            }
            return false;
        }
        return true;
    }

    // Set "strict" to true to force GRH-supported lower bound of 2*log(N)^2
    BigInteger.prototype.isPrime = function (strict) {
        var isPrime = isBasicPrime(this);
        if (isPrime !== undefined) return isPrime;
        var n = this.abs();
        var bits = n.bitLength();
        if (bits <= 64)
            return millerRabinTest(n, [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]);
        var logN = Math.log(2) * bits.toJSNumber();
        var t = Math.ceil((strict === true) ? (2 * Math.pow(logN, 2)) : logN);
        for (var a = [], i = 0; i < t; i++) {
            a.push(bigInt(i + 2));
        }
        return millerRabinTest(n, a);
    };
    NativeBigInt.prototype.isPrime = SmallInteger.prototype.isPrime = BigInteger.prototype.isPrime;

    BigInteger.prototype.isProbablePrime = function (iterations, rng) {
        var isPrime = isBasicPrime(this);
        if (isPrime !== undefined) return isPrime;
        var n = this.abs();
        var t = iterations === undefined ? 5 : iterations;
        for (var a = [], i = 0; i < t; i++) {
            a.push(bigInt.randBetween(2, n.minus(2), rng));
        }
        return millerRabinTest(n, a);
    };
    NativeBigInt.prototype.isProbablePrime = SmallInteger.prototype.isProbablePrime = BigInteger.prototype.isProbablePrime;

    BigInteger.prototype.modInv = function (n) {
        var t = bigInt.zero, newT = bigInt.one, r = parseValue(n), newR = this.abs(), q, lastT, lastR;
        while (!newR.isZero()) {
            q = r.divide(newR);
            lastT = t;
            lastR = r;
            t = newT;
            r = newR;
            newT = lastT.subtract(q.multiply(newT));
            newR = lastR.subtract(q.multiply(newR));
        }
        if (!r.isUnit()) throw new Error(this.toString() + " and " + n.toString() + " are not co-prime");
        if (t.compare(0) === -1) {
            t = t.add(n);
        }
        if (this.isNegative()) {
            return t.negate();
        }
        return t;
    };

    NativeBigInt.prototype.modInv = SmallInteger.prototype.modInv = BigInteger.prototype.modInv;

    BigInteger.prototype.next = function () {
        var value = this.value;
        if (this.sign) {
            return subtractSmall(value, 1, this.sign);
        }
        return new BigInteger(addSmall(value, 1), this.sign);
    };
    SmallInteger.prototype.next = function () {
        var value = this.value;
        if (value + 1 < MAX_INT) return new SmallInteger(value + 1);
        return new BigInteger(MAX_INT_ARR, false);
    };
    NativeBigInt.prototype.next = function () {
        return new NativeBigInt(this.value + BigInt(1));
    }

    BigInteger.prototype.prev = function () {
        var value = this.value;
        if (this.sign) {
            return new BigInteger(addSmall(value, 1), true);
        }
        return subtractSmall(value, 1, this.sign);
    };
    SmallInteger.prototype.prev = function () {
        var value = this.value;
        if (value - 1 > -MAX_INT) return new SmallInteger(value - 1);
        return new BigInteger(MAX_INT_ARR, true);
    };
    NativeBigInt.prototype.prev = function () {
        return new NativeBigInt(this.value - BigInt(1));
    }

    var powersOfTwo = [1];
    while (2 * powersOfTwo[powersOfTwo.length - 1] <= BASE) powersOfTwo.push(2 * powersOfTwo[powersOfTwo.length - 1]);
    var powers2Length = powersOfTwo.length, highestPower2 = powersOfTwo[powers2Length - 1];

    function shift_isSmall(n) {
        return Math.abs(n) <= BASE;
    }

    BigInteger.prototype.shiftLeft = function (v) {
        var n = parseValue(v).toJSNumber();
        if (!shift_isSmall(n)) {
            throw new Error(String(n) + " is too large for shifting.");
        }
        if (n < 0) return this.shiftRight(-n);
        var result = this;
        if (result.isZero()) return result;
        while (n >= powers2Length) {
            result = result.multiply(highestPower2);
            n -= powers2Length - 1;
        }
        return result.multiply(powersOfTwo[n]);
    };
    NativeBigInt.prototype.shiftLeft = SmallInteger.prototype.shiftLeft = BigInteger.prototype.shiftLeft;

    BigInteger.prototype.shiftRight = function (v) {
        var remQuo;
        var n = parseValue(v).toJSNumber();
        if (!shift_isSmall(n)) {
            throw new Error(String(n) + " is too large for shifting.");
        }
        if (n < 0) return this.shiftLeft(-n);
        var result = this;
        while (n >= powers2Length) {
            if (result.isZero() || (result.isNegative() && result.isUnit())) return result;
            remQuo = divModAny(result, highestPower2);
            result = remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0];
            n -= powers2Length - 1;
        }
        remQuo = divModAny(result, powersOfTwo[n]);
        return remQuo[1].isNegative() ? remQuo[0].prev() : remQuo[0];
    };
    NativeBigInt.prototype.shiftRight = SmallInteger.prototype.shiftRight = BigInteger.prototype.shiftRight;

    function bitwise(x, y, fn) {
        y = parseValue(y);
        var xSign = x.isNegative(), ySign = y.isNegative();
        var xRem = xSign ? x.not() : x,
            yRem = ySign ? y.not() : y;
        var xDigit = 0, yDigit = 0;
        var xDivMod = null, yDivMod = null;
        var result = [];
        while (!xRem.isZero() || !yRem.isZero()) {
            xDivMod = divModAny(xRem, highestPower2);
            xDigit = xDivMod[1].toJSNumber();
            if (xSign) {
                xDigit = highestPower2 - 1 - xDigit; // two's complement for negative numbers
            }

            yDivMod = divModAny(yRem, highestPower2);
            yDigit = yDivMod[1].toJSNumber();
            if (ySign) {
                yDigit = highestPower2 - 1 - yDigit; // two's complement for negative numbers
            }

            xRem = xDivMod[0];
            yRem = yDivMod[0];
            result.push(fn(xDigit, yDigit));
        }
        var sum = fn(xSign ? 1 : 0, ySign ? 1 : 0) !== 0 ? bigInt(-1) : bigInt(0);
        for (var i = result.length - 1; i >= 0; i -= 1) {
            sum = sum.multiply(highestPower2).add(bigInt(result[i]));
        }
        return sum;
    }

    BigInteger.prototype.not = function () {
        return this.negate().prev();
    };
    NativeBigInt.prototype.not = SmallInteger.prototype.not = BigInteger.prototype.not;

    BigInteger.prototype.and = function (n) {
        return bitwise(this, n, function (a, b) { return a & b; });
    };
    NativeBigInt.prototype.and = SmallInteger.prototype.and = BigInteger.prototype.and;

    BigInteger.prototype.or = function (n) {
        return bitwise(this, n, function (a, b) { return a | b; });
    };
    NativeBigInt.prototype.or = SmallInteger.prototype.or = BigInteger.prototype.or;

    BigInteger.prototype.xor = function (n) {
        return bitwise(this, n, function (a, b) { return a ^ b; });
    };
    NativeBigInt.prototype.xor = SmallInteger.prototype.xor = BigInteger.prototype.xor;

    var LOBMASK_I = 1 << 30, LOBMASK_BI = (BASE & -BASE) * (BASE & -BASE) | LOBMASK_I;
    function roughLOB(n) { // get lowestOneBit (rough)
        // SmallInteger: return Min(lowestOneBit(n), 1 << 30)
        // BigInteger: return Min(lowestOneBit(n), 1 << 14) [BASE=1e7]
        var v = n.value,
            x = typeof v === "number" ? v | LOBMASK_I :
                typeof v === "bigint" ? v | BigInt(LOBMASK_I) :
                    v[0] + v[1] * BASE | LOBMASK_BI;
        return x & -x;
    }

    function integerLogarithm(value, base) {
        if (base.compareTo(value) <= 0) {
            var tmp = integerLogarithm(value, base.square(base));
            var p = tmp.p;
            var e = tmp.e;
            var t = p.multiply(base);
            return t.compareTo(value) <= 0 ? { p: t, e: e * 2 + 1 } : { p: p, e: e * 2 };
        }
        return { p: bigInt(1), e: 0 };
    }

    BigInteger.prototype.bitLength = function () {
        var n = this;
        if (n.compareTo(bigInt(0)) < 0) {
            n = n.negate().subtract(bigInt(1));
        }
        if (n.compareTo(bigInt(0)) === 0) {
            return bigInt(0);
        }
        return bigInt(integerLogarithm(n, bigInt(2)).e).add(bigInt(1));
    }
    NativeBigInt.prototype.bitLength = SmallInteger.prototype.bitLength = BigInteger.prototype.bitLength;

    function max(a, b) {
        a = parseValue(a);
        b = parseValue(b);
        return a.greater(b) ? a : b;
    }
    function min(a, b) {
        a = parseValue(a);
        b = parseValue(b);
        return a.lesser(b) ? a : b;
    }
    function gcd(a, b) {
        a = parseValue(a).abs();
        b = parseValue(b).abs();
        if (a.equals(b)) return a;
        if (a.isZero()) return b;
        if (b.isZero()) return a;
        var c = Integer[1], d, t;
        while (a.isEven() && b.isEven()) {
            d = min(roughLOB(a), roughLOB(b));
            a = a.divide(d);
            b = b.divide(d);
            c = c.multiply(d);
        }
        while (a.isEven()) {
            a = a.divide(roughLOB(a));
        }
        do {
            while (b.isEven()) {
                b = b.divide(roughLOB(b));
            }
            if (a.greater(b)) {
                t = b; b = a; a = t;
            }
            b = b.subtract(a);
        } while (!b.isZero());
        return c.isUnit() ? a : a.multiply(c);
    }
    function lcm(a, b) {
        a = parseValue(a).abs();
        b = parseValue(b).abs();
        return a.divide(gcd(a, b)).multiply(b);
    }
    function randBetween(a, b, rng) {
        a = parseValue(a);
        b = parseValue(b);
        var usedRNG = rng || Math.random;
        var low = min(a, b), high = max(a, b);
        var range = high.subtract(low).add(1);
        if (range.isSmall) return low.add(Math.floor(usedRNG() * range));
        var digits = toBase(range, BASE).value;
        var result = [], restricted = true;
        for (var i = 0; i < digits.length; i++) {
            var top = restricted ? digits[i] : BASE;
            var digit = truncate(usedRNG() * top);
            result.push(digit);
            if (digit < top) restricted = false;
        }
        return low.add(Integer.fromArray(result, BASE, false));
    }

    var parseBase = function (text, base, alphabet, caseSensitive) {
        alphabet = alphabet || DEFAULT_ALPHABET;
        text = String(text);
        if (!caseSensitive) {
            text = text.toLowerCase();
            alphabet = alphabet.toLowerCase();
        }
        var length = text.length;
        var i;
        var absBase = Math.abs(base);
        var alphabetValues = {};
        for (i = 0; i < alphabet.length; i++) {
            alphabetValues[alphabet[i]] = i;
        }
        for (i = 0; i < length; i++) {
            var c = text[i];
            if (c === "-") continue;
            if (c in alphabetValues) {
                if (alphabetValues[c] >= absBase) {
                    if (c === "1" && absBase === 1) continue;
                    throw new Error(c + " is not a valid digit in base " + base + ".");
                }
            }
        }
        base = parseValue(base);
        var digits = [];
        var isNegative = text[0] === "-";
        for (i = isNegative ? 1 : 0; i < text.length; i++) {
            var c = text[i];
            if (c in alphabetValues) digits.push(parseValue(alphabetValues[c]));
            else if (c === "<") {
                var start = i;
                do { i++; } while (text[i] !== ">" && i < text.length);
                digits.push(parseValue(text.slice(start + 1, i)));
            }
            else throw new Error(c + " is not a valid character");
        }
        return parseBaseFromArray(digits, base, isNegative);
    };

    function parseBaseFromArray(digits, base, isNegative) {
        var val = Integer[0], pow = Integer[1], i;
        for (i = digits.length - 1; i >= 0; i--) {
            val = val.add(digits[i].times(pow));
            pow = pow.times(base);
        }
        return isNegative ? val.negate() : val;
    }

    function stringify(digit, alphabet) {
        alphabet = alphabet || DEFAULT_ALPHABET;
        if (digit < alphabet.length) {
            return alphabet[digit];
        }
        return "<" + digit + ">";
    }

    function toBase(n, base) {
        base = bigInt(base);
        if (base.isZero()) {
            if (n.isZero()) return { value: [0], isNegative: false };
            throw new Error("Cannot convert nonzero numbers to base 0.");
        }
        if (base.equals(-1)) {
            if (n.isZero()) return { value: [0], isNegative: false };
            if (n.isNegative())
                return {
                    value: [].concat.apply([], Array.apply(null, Array(-n.toJSNumber()))
                        .map(Array.prototype.valueOf, [1, 0])
                    ),
                    isNegative: false
                };

            var arr = Array.apply(null, Array(n.toJSNumber() - 1))
                .map(Array.prototype.valueOf, [0, 1]);
            arr.unshift([1]);
            return {
                value: [].concat.apply([], arr),
                isNegative: false
            };
        }

        var neg = false;
        if (n.isNegative() && base.isPositive()) {
            neg = true;
            n = n.abs();
        }
        if (base.isUnit()) {
            if (n.isZero()) return { value: [0], isNegative: false };

            return {
                value: Array.apply(null, Array(n.toJSNumber()))
                    .map(Number.prototype.valueOf, 1),
                isNegative: neg
            };
        }
        var out = [];
        var left = n, divmod;
        while (left.isNegative() || left.compareAbs(base) >= 0) {
            divmod = left.divmod(base);
            left = divmod.quotient;
            var digit = divmod.remainder;
            if (digit.isNegative()) {
                digit = base.minus(digit).abs();
                left = left.next();
            }
            out.push(digit.toJSNumber());
        }
        out.push(left.toJSNumber());
        return { value: out.reverse(), isNegative: neg };
    }

    function toBaseString(n, base, alphabet) {
        var arr = toBase(n, base);
        return (arr.isNegative ? "-" : "") + arr.value.map(function (x) {
            return stringify(x, alphabet);
        }).join('');
    }

    BigInteger.prototype.toArray = function (radix) {
        return toBase(this, radix);
    };

    SmallInteger.prototype.toArray = function (radix) {
        return toBase(this, radix);
    };

    NativeBigInt.prototype.toArray = function (radix) {
        return toBase(this, radix);
    };

    BigInteger.prototype.toString = function (radix, alphabet) {
        if (radix === undefined) radix = 10;
        if (radix !== 10) return toBaseString(this, radix, alphabet);
        var v = this.value, l = v.length, str = String(v[--l]), zeros = "0000000", digit;
        while (--l >= 0) {
            digit = String(v[l]);
            str += zeros.slice(digit.length) + digit;
        }
        var sign = this.sign ? "-" : "";
        return sign + str;
    };

    SmallInteger.prototype.toString = function (radix, alphabet) {
        if (radix === undefined) radix = 10;
        if (radix != 10) return toBaseString(this, radix, alphabet);
        return String(this.value);
    };

    NativeBigInt.prototype.toString = SmallInteger.prototype.toString;

    NativeBigInt.prototype.toJSON = BigInteger.prototype.toJSON = SmallInteger.prototype.toJSON = function () { return this.toString(); }

    BigInteger.prototype.valueOf = function () {
        return parseInt(this.toString(), 10);
    };
    BigInteger.prototype.toJSNumber = BigInteger.prototype.valueOf;

    SmallInteger.prototype.valueOf = function () {
        return this.value;
    };
    SmallInteger.prototype.toJSNumber = SmallInteger.prototype.valueOf;
    NativeBigInt.prototype.valueOf = NativeBigInt.prototype.toJSNumber = function () {
        return parseInt(this.toString(), 10);
    }

    function parseStringValue(v) {
        if (isPrecise(+v)) {
            var x = +v;
            if (x === truncate(x))
                return supportsNativeBigInt ? new NativeBigInt(BigInt(x)) : new SmallInteger(x);
            throw new Error("Invalid integer: " + v);
        }
        var sign = v[0] === "-";
        if (sign) v = v.slice(1);
        var split = v.split(/e/i);
        if (split.length > 2) throw new Error("Invalid integer: " + split.join("e"));
        if (split.length === 2) {
            var exp = split[1];
            if (exp[0] === "+") exp = exp.slice(1);
            exp = +exp;
            if (exp !== truncate(exp) || !isPrecise(exp)) throw new Error("Invalid integer: " + exp + " is not a valid exponent.");
            var text = split[0];
            var decimalPlace = text.indexOf(".");
            if (decimalPlace >= 0) {
                exp -= text.length - decimalPlace - 1;
                text = text.slice(0, decimalPlace) + text.slice(decimalPlace + 1);
            }
            if (exp < 0) throw new Error("Cannot include negative exponent part for integers");
            text += (new Array(exp + 1)).join("0");
            v = text;
        }
        var isValid = /^([0-9][0-9]*)$/.test(v);
        if (!isValid) throw new Error("Invalid integer: " + v);
        if (supportsNativeBigInt) {
            return new NativeBigInt(BigInt(sign ? "-" + v : v));
        }
        var r = [], max = v.length, l = LOG_BASE, min = max - l;
        while (max > 0) {
            r.push(+v.slice(min, max));
            min -= l;
            if (min < 0) min = 0;
            max -= l;
        }
        trim(r);
        return new BigInteger(r, sign);
    }

    function parseNumberValue(v) {
        if (supportsNativeBigInt) {
            return new NativeBigInt(BigInt(v));
        }
        if (isPrecise(v)) {
            if (v !== truncate(v)) throw new Error(v + " is not an integer.");
            return new SmallInteger(v);
        }
        return parseStringValue(v.toString());
    }

    function parseValue(v) {
        if (typeof v === "number") {
            return parseNumberValue(v);
        }
        if (typeof v === "string") {
            return parseStringValue(v);
        }
        if (typeof v === "bigint") {
            return new NativeBigInt(v);
        }
        return v;
    }
    // Pre-define numbers in range [-999,999]
    for (var i = 0; i < 1000; i++) {
        Integer[i] = parseValue(i);
        if (i > 0) Integer[-i] = parseValue(-i);
    }
    // Backwards compatibility
    Integer.one = Integer[1];
    Integer.zero = Integer[0];
    Integer.minusOne = Integer[-1];
    Integer.max = max;
    Integer.min = min;
    Integer.gcd = gcd;
    Integer.lcm = lcm;
    Integer.isInstance = function (x) { return x instanceof BigInteger || x instanceof SmallInteger || x instanceof NativeBigInt; };
    Integer.randBetween = randBetween;

    Integer.fromArray = function (digits, base, isNegative) {
        return parseBaseFromArray(digits.map(parseValue), parseValue(base || 10), isNegative);
    };

    return Integer;
})();

// Node.js check
if (typeof module !== "undefined" && module.hasOwnProperty("exports")) {
    module.exports = bigInt;
}

//amd check
if (typeof define === "function" && define.amd) {
    define( function () {
        return bigInt;
    });
}

},{}],3:[function(require,module,exports){
(function (Buffer){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = { __proto__: Uint8Array.prototype, foo: function () { return 42 } }
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species != null &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayLike(value)
  }

  if (value == null) {
    throw TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  var valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  var b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(
      value[Symbol.toPrimitive]('string'), encodingOrOffset, length
    )
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      buf = Buffer.from(buf)
    }
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  var len = string.length
  var mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
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

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
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
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
        : (firstByte > 0xBF) ? 2
          : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (var i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : Buffer.from(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

}).call(this,require("buffer").Buffer)

},{"base64-js":1,"buffer":3,"ieee754":5}],4:[function(require,module,exports){
;(function (globalScope) {
  'use strict';


  /*
   *  decimal.js v10.2.0
   *  An arbitrary-precision Decimal type for JavaScript.
   *  https://github.com/MikeMcl/decimal.js
   *  Copyright (c) 2019 Michael Mclaughlin <M8ch88l@gmail.com>
   *  MIT Licence
   */


  // -----------------------------------  EDITABLE DEFAULTS  ------------------------------------ //


    // The maximum exponent magnitude.
    // The limit on the value of `toExpNeg`, `toExpPos`, `minE` and `maxE`.
  var EXP_LIMIT = 9e15,                      // 0 to 9e15

    // The limit on the value of `precision`, and on the value of the first argument to
    // `toDecimalPlaces`, `toExponential`, `toFixed`, `toPrecision` and `toSignificantDigits`.
    MAX_DIGITS = 1e9,                        // 0 to 1e9

    // Base conversion alphabet.
    NUMERALS = '0123456789abcdef',

    // The natural logarithm of 10 (1025 digits).
    LN10 = '2.3025850929940456840179914546843642076011014886287729760333279009675726096773524802359972050895982983419677840422862486334095254650828067566662873690987816894829072083255546808437998948262331985283935053089653777326288461633662222876982198867465436674744042432743651550489343149393914796194044002221051017141748003688084012647080685567743216228355220114804663715659121373450747856947683463616792101806445070648000277502684916746550586856935673420670581136429224554405758925724208241314695689016758940256776311356919292033376587141660230105703089634572075440370847469940168269282808481184289314848524948644871927809676271275775397027668605952496716674183485704422507197965004714951050492214776567636938662976979522110718264549734772662425709429322582798502585509785265383207606726317164309505995087807523710333101197857547331541421808427543863591778117054309827482385045648019095610299291824318237525357709750539565187697510374970888692180205189339507238539205144634197265287286965110862571492198849978748873771345686209167058',

    // Pi (1025 digits).
    PI = '3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491298336733624406566430860213949463952247371907021798609437027705392171762931767523846748184676694051320005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235420199561121290219608640344181598136297747713099605187072113499999983729780499510597317328160963185950244594553469083026425223082533446850352619311881710100031378387528865875332083814206171776691473035982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989380952572010654858632789',


    // The initial configuration properties of the Decimal constructor.
    DEFAULTS = {

      // These values must be integers within the stated ranges (inclusive).
      // Most of these values can be changed at run-time using the `Decimal.config` method.

      // The maximum number of significant digits of the result of a calculation or base conversion.
      // E.g. `Decimal.config({ precision: 20 });`
      precision: 20,                         // 1 to MAX_DIGITS

      // The rounding mode used when rounding to `precision`.
      //
      // ROUND_UP         0 Away from zero.
      // ROUND_DOWN       1 Towards zero.
      // ROUND_CEIL       2 Towards +Infinity.
      // ROUND_FLOOR      3 Towards -Infinity.
      // ROUND_HALF_UP    4 Towards nearest neighbour. If equidistant, up.
      // ROUND_HALF_DOWN  5 Towards nearest neighbour. If equidistant, down.
      // ROUND_HALF_EVEN  6 Towards nearest neighbour. If equidistant, towards even neighbour.
      // ROUND_HALF_CEIL  7 Towards nearest neighbour. If equidistant, towards +Infinity.
      // ROUND_HALF_FLOOR 8 Towards nearest neighbour. If equidistant, towards -Infinity.
      //
      // E.g.
      // `Decimal.rounding = 4;`
      // `Decimal.rounding = Decimal.ROUND_HALF_UP;`
      rounding: 4,                           // 0 to 8

      // The modulo mode used when calculating the modulus: a mod n.
      // The quotient (q = a / n) is calculated according to the corresponding rounding mode.
      // The remainder (r) is calculated as: r = a - n * q.
      //
      // UP         0 The remainder is positive if the dividend is negative, else is negative.
      // DOWN       1 The remainder has the same sign as the dividend (JavaScript %).
      // FLOOR      3 The remainder has the same sign as the divisor (Python %).
      // HALF_EVEN  6 The IEEE 754 remainder function.
      // EUCLID     9 Euclidian division. q = sign(n) * floor(a / abs(n)). Always positive.
      //
      // Truncated division (1), floored division (3), the IEEE 754 remainder (6), and Euclidian
      // division (9) are commonly used for the modulus operation. The other rounding modes can also
      // be used, but they may not give useful results.
      modulo: 1,                             // 0 to 9

      // The exponent value at and beneath which `toString` returns exponential notation.
      // JavaScript numbers: -7
      toExpNeg: -7,                          // 0 to -EXP_LIMIT

      // The exponent value at and above which `toString` returns exponential notation.
      // JavaScript numbers: 21
      toExpPos:  21,                         // 0 to EXP_LIMIT

      // The minimum exponent value, beneath which underflow to zero occurs.
      // JavaScript numbers: -324  (5e-324)
      minE: -EXP_LIMIT,                      // -1 to -EXP_LIMIT

      // The maximum exponent value, above which overflow to Infinity occurs.
      // JavaScript numbers: 308  (1.7976931348623157e+308)
      maxE: EXP_LIMIT,                       // 1 to EXP_LIMIT

      // Whether to use cryptographically-secure random number generation, if available.
      crypto: false                          // true/false
    },


  // ----------------------------------- END OF EDITABLE DEFAULTS ------------------------------- //


    Decimal, inexact, noConflict, quadrant,
    external = true,

    decimalError = '[DecimalError] ',
    invalidArgument = decimalError + 'Invalid argument: ',
    precisionLimitExceeded = decimalError + 'Precision limit exceeded',
    cryptoUnavailable = decimalError + 'crypto unavailable',

    mathfloor = Math.floor,
    mathpow = Math.pow,

    isBinary = /^0b([01]+(\.[01]*)?|\.[01]+)(p[+-]?\d+)?$/i,
    isHex = /^0x([0-9a-f]+(\.[0-9a-f]*)?|\.[0-9a-f]+)(p[+-]?\d+)?$/i,
    isOctal = /^0o([0-7]+(\.[0-7]*)?|\.[0-7]+)(p[+-]?\d+)?$/i,
    isDecimal = /^(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i,

    BASE = 1e7,
    LOG_BASE = 7,
    MAX_SAFE_INTEGER = 9007199254740991,

    LN10_PRECISION = LN10.length - 1,
    PI_PRECISION = PI.length - 1,

    // Decimal.prototype object
    P = { name: '[object Decimal]' };


  // Decimal prototype methods


  /*
   *  absoluteValue             abs
   *  ceil
   *  comparedTo                cmp
   *  cosine                    cos
   *  cubeRoot                  cbrt
   *  decimalPlaces             dp
   *  dividedBy                 div
   *  dividedToIntegerBy        divToInt
   *  equals                    eq
   *  floor
   *  greaterThan               gt
   *  greaterThanOrEqualTo      gte
   *  hyperbolicCosine          cosh
   *  hyperbolicSine            sinh
   *  hyperbolicTangent         tanh
   *  inverseCosine             acos
   *  inverseHyperbolicCosine   acosh
   *  inverseHyperbolicSine     asinh
   *  inverseHyperbolicTangent  atanh
   *  inverseSine               asin
   *  inverseTangent            atan
   *  isFinite
   *  isInteger                 isInt
   *  isNaN
   *  isNegative                isNeg
   *  isPositive                isPos
   *  isZero
   *  lessThan                  lt
   *  lessThanOrEqualTo         lte
   *  logarithm                 log
   *  [maximum]                 [max]
   *  [minimum]                 [min]
   *  minus                     sub
   *  modulo                    mod
   *  naturalExponential        exp
   *  naturalLogarithm          ln
   *  negated                   neg
   *  plus                      add
   *  precision                 sd
   *  round
   *  sine                      sin
   *  squareRoot                sqrt
   *  tangent                   tan
   *  times                     mul
   *  toBinary
   *  toDecimalPlaces           toDP
   *  toExponential
   *  toFixed
   *  toFraction
   *  toHexadecimal             toHex
   *  toNearest
   *  toNumber
   *  toOctal
   *  toPower                   pow
   *  toPrecision
   *  toSignificantDigits       toSD
   *  toString
   *  truncated                 trunc
   *  valueOf                   toJSON
   */


  /*
   * Return a new Decimal whose value is the absolute value of this Decimal.
   *
   */
  P.absoluteValue = P.abs = function () {
    var x = new this.constructor(this);
    if (x.s < 0) x.s = 1;
    return finalise(x);
  };


  /*
   * Return a new Decimal whose value is the value of this Decimal rounded to a whole number in the
   * direction of positive Infinity.
   *
   */
  P.ceil = function () {
    return finalise(new this.constructor(this), this.e + 1, 2);
  };


  /*
   * Return
   *   1    if the value of this Decimal is greater than the value of `y`,
   *  -1    if the value of this Decimal is less than the value of `y`,
   *   0    if they have the same value,
   *   NaN  if the value of either Decimal is NaN.
   *
   */
  P.comparedTo = P.cmp = function (y) {
    var i, j, xdL, ydL,
      x = this,
      xd = x.d,
      yd = (y = new x.constructor(y)).d,
      xs = x.s,
      ys = y.s;

    // Either NaN or ±Infinity?
    if (!xd || !yd) {
      return !xs || !ys ? NaN : xs !== ys ? xs : xd === yd ? 0 : !xd ^ xs < 0 ? 1 : -1;
    }

    // Either zero?
    if (!xd[0] || !yd[0]) return xd[0] ? xs : yd[0] ? -ys : 0;

    // Signs differ?
    if (xs !== ys) return xs;

    // Compare exponents.
    if (x.e !== y.e) return x.e > y.e ^ xs < 0 ? 1 : -1;

    xdL = xd.length;
    ydL = yd.length;

    // Compare digit by digit.
    for (i = 0, j = xdL < ydL ? xdL : ydL; i < j; ++i) {
      if (xd[i] !== yd[i]) return xd[i] > yd[i] ^ xs < 0 ? 1 : -1;
    }

    // Compare lengths.
    return xdL === ydL ? 0 : xdL > ydL ^ xs < 0 ? 1 : -1;
  };


  /*
   * Return a new Decimal whose value is the cosine of the value in radians of this Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-1, 1]
   *
   * cos(0)         = 1
   * cos(-0)        = 1
   * cos(Infinity)  = NaN
   * cos(-Infinity) = NaN
   * cos(NaN)       = NaN
   *
   */
  P.cosine = P.cos = function () {
    var pr, rm,
      x = this,
      Ctor = x.constructor;

    if (!x.d) return new Ctor(NaN);

    // cos(0) = cos(-0) = 1
    if (!x.d[0]) return new Ctor(1);

    pr = Ctor.precision;
    rm = Ctor.rounding;
    Ctor.precision = pr + Math.max(x.e, x.sd()) + LOG_BASE;
    Ctor.rounding = 1;

    x = cosine(Ctor, toLessThanHalfPi(Ctor, x));

    Ctor.precision = pr;
    Ctor.rounding = rm;

    return finalise(quadrant == 2 || quadrant == 3 ? x.neg() : x, pr, rm, true);
  };


  /*
   *
   * Return a new Decimal whose value is the cube root of the value of this Decimal, rounded to
   * `precision` significant digits using rounding mode `rounding`.
   *
   *  cbrt(0)  =  0
   *  cbrt(-0) = -0
   *  cbrt(1)  =  1
   *  cbrt(-1) = -1
   *  cbrt(N)  =  N
   *  cbrt(-I) = -I
   *  cbrt(I)  =  I
   *
   * Math.cbrt(x) = (x < 0 ? -Math.pow(-x, 1/3) : Math.pow(x, 1/3))
   *
   */
  P.cubeRoot = P.cbrt = function () {
    var e, m, n, r, rep, s, sd, t, t3, t3plusx,
      x = this,
      Ctor = x.constructor;

    if (!x.isFinite() || x.isZero()) return new Ctor(x);
    external = false;

    // Initial estimate.
    s = x.s * mathpow(x.s * x, 1 / 3);

     // Math.cbrt underflow/overflow?
     // Pass x to Math.pow as integer, then adjust the exponent of the result.
    if (!s || Math.abs(s) == 1 / 0) {
      n = digitsToString(x.d);
      e = x.e;

      // Adjust n exponent so it is a multiple of 3 away from x exponent.
      if (s = (e - n.length + 1) % 3) n += (s == 1 || s == -2 ? '0' : '00');
      s = mathpow(n, 1 / 3);

      // Rarely, e may be one less than the result exponent value.
      e = mathfloor((e + 1) / 3) - (e % 3 == (e < 0 ? -1 : 2));

      if (s == 1 / 0) {
        n = '5e' + e;
      } else {
        n = s.toExponential();
        n = n.slice(0, n.indexOf('e') + 1) + e;
      }

      r = new Ctor(n);
      r.s = x.s;
    } else {
      r = new Ctor(s.toString());
    }

    sd = (e = Ctor.precision) + 3;

    // Halley's method.
    // TODO? Compare Newton's method.
    for (;;) {
      t = r;
      t3 = t.times(t).times(t);
      t3plusx = t3.plus(x);
      r = divide(t3plusx.plus(x).times(t), t3plusx.plus(t3), sd + 2, 1);

      // TODO? Replace with for-loop and checkRoundingDigits.
      if (digitsToString(t.d).slice(0, sd) === (n = digitsToString(r.d)).slice(0, sd)) {
        n = n.slice(sd - 3, sd + 1);

        // The 4th rounding digit may be in error by -1 so if the 4 rounding digits are 9999 or 4999
        // , i.e. approaching a rounding boundary, continue the iteration.
        if (n == '9999' || !rep && n == '4999') {

          // On the first iteration only, check to see if rounding up gives the exact result as the
          // nines may infinitely repeat.
          if (!rep) {
            finalise(t, e + 1, 0);

            if (t.times(t).times(t).eq(x)) {
              r = t;
              break;
            }
          }

          sd += 4;
          rep = 1;
        } else {

          // If the rounding digits are null, 0{0,4} or 50{0,3}, check for an exact result.
          // If not, then there are further digits and m will be truthy.
          if (!+n || !+n.slice(1) && n.charAt(0) == '5') {

            // Truncate to the first rounding digit.
            finalise(r, e + 1, 1);
            m = !r.times(r).times(r).eq(x);
          }

          break;
        }
      }
    }

    external = true;

    return finalise(r, e, Ctor.rounding, m);
  };


  /*
   * Return the number of decimal places of the value of this Decimal.
   *
   */
  P.decimalPlaces = P.dp = function () {
    var w,
      d = this.d,
      n = NaN;

    if (d) {
      w = d.length - 1;
      n = (w - mathfloor(this.e / LOG_BASE)) * LOG_BASE;

      // Subtract the number of trailing zeros of the last word.
      w = d[w];
      if (w) for (; w % 10 == 0; w /= 10) n--;
      if (n < 0) n = 0;
    }

    return n;
  };


  /*
   *  n / 0 = I
   *  n / N = N
   *  n / I = 0
   *  0 / n = 0
   *  0 / 0 = N
   *  0 / N = N
   *  0 / I = 0
   *  N / n = N
   *  N / 0 = N
   *  N / N = N
   *  N / I = N
   *  I / n = I
   *  I / 0 = I
   *  I / N = N
   *  I / I = N
   *
   * Return a new Decimal whose value is the value of this Decimal divided by `y`, rounded to
   * `precision` significant digits using rounding mode `rounding`.
   *
   */
  P.dividedBy = P.div = function (y) {
    return divide(this, new this.constructor(y));
  };


  /*
   * Return a new Decimal whose value is the integer part of dividing the value of this Decimal
   * by the value of `y`, rounded to `precision` significant digits using rounding mode `rounding`.
   *
   */
  P.dividedToIntegerBy = P.divToInt = function (y) {
    var x = this,
      Ctor = x.constructor;
    return finalise(divide(x, new Ctor(y), 0, 1, 1), Ctor.precision, Ctor.rounding);
  };


  /*
   * Return true if the value of this Decimal is equal to the value of `y`, otherwise return false.
   *
   */
  P.equals = P.eq = function (y) {
    return this.cmp(y) === 0;
  };


  /*
   * Return a new Decimal whose value is the value of this Decimal rounded to a whole number in the
   * direction of negative Infinity.
   *
   */
  P.floor = function () {
    return finalise(new this.constructor(this), this.e + 1, 3);
  };


  /*
   * Return true if the value of this Decimal is greater than the value of `y`, otherwise return
   * false.
   *
   */
  P.greaterThan = P.gt = function (y) {
    return this.cmp(y) > 0;
  };


  /*
   * Return true if the value of this Decimal is greater than or equal to the value of `y`,
   * otherwise return false.
   *
   */
  P.greaterThanOrEqualTo = P.gte = function (y) {
    var k = this.cmp(y);
    return k == 1 || k === 0;
  };


  /*
   * Return a new Decimal whose value is the hyperbolic cosine of the value in radians of this
   * Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [1, Infinity]
   *
   * cosh(x) = 1 + x^2/2! + x^4/4! + x^6/6! + ...
   *
   * cosh(0)         = 1
   * cosh(-0)        = 1
   * cosh(Infinity)  = Infinity
   * cosh(-Infinity) = Infinity
   * cosh(NaN)       = NaN
   *
   *  x        time taken (ms)   result
   * 1000      9                 9.8503555700852349694e+433
   * 10000     25                4.4034091128314607936e+4342
   * 100000    171               1.4033316802130615897e+43429
   * 1000000   3817              1.5166076984010437725e+434294
   * 10000000  abandoned after 2 minute wait
   *
   * TODO? Compare performance of cosh(x) = 0.5 * (exp(x) + exp(-x))
   *
   */
  P.hyperbolicCosine = P.cosh = function () {
    var k, n, pr, rm, len,
      x = this,
      Ctor = x.constructor,
      one = new Ctor(1);

    if (!x.isFinite()) return new Ctor(x.s ? 1 / 0 : NaN);
    if (x.isZero()) return one;

    pr = Ctor.precision;
    rm = Ctor.rounding;
    Ctor.precision = pr + Math.max(x.e, x.sd()) + 4;
    Ctor.rounding = 1;
    len = x.d.length;

    // Argument reduction: cos(4x) = 1 - 8cos^2(x) + 8cos^4(x) + 1
    // i.e. cos(x) = 1 - cos^2(x/4)(8 - 8cos^2(x/4))

    // Estimate the optimum number of times to use the argument reduction.
    // TODO? Estimation reused from cosine() and may not be optimal here.
    if (len < 32) {
      k = Math.ceil(len / 3);
      n = (1 / tinyPow(4, k)).toString();
    } else {
      k = 16;
      n = '2.3283064365386962890625e-10';
    }

    x = taylorSeries(Ctor, 1, x.times(n), new Ctor(1), true);

    // Reverse argument reduction
    var cosh2_x,
      i = k,
      d8 = new Ctor(8);
    for (; i--;) {
      cosh2_x = x.times(x);
      x = one.minus(cosh2_x.times(d8.minus(cosh2_x.times(d8))));
    }

    return finalise(x, Ctor.precision = pr, Ctor.rounding = rm, true);
  };


  /*
   * Return a new Decimal whose value is the hyperbolic sine of the value in radians of this
   * Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-Infinity, Infinity]
   *
   * sinh(x) = x + x^3/3! + x^5/5! + x^7/7! + ...
   *
   * sinh(0)         = 0
   * sinh(-0)        = -0
   * sinh(Infinity)  = Infinity
   * sinh(-Infinity) = -Infinity
   * sinh(NaN)       = NaN
   *
   * x        time taken (ms)
   * 10       2 ms
   * 100      5 ms
   * 1000     14 ms
   * 10000    82 ms
   * 100000   886 ms            1.4033316802130615897e+43429
   * 200000   2613 ms
   * 300000   5407 ms
   * 400000   8824 ms
   * 500000   13026 ms          8.7080643612718084129e+217146
   * 1000000  48543 ms
   *
   * TODO? Compare performance of sinh(x) = 0.5 * (exp(x) - exp(-x))
   *
   */
  P.hyperbolicSine = P.sinh = function () {
    var k, pr, rm, len,
      x = this,
      Ctor = x.constructor;

    if (!x.isFinite() || x.isZero()) return new Ctor(x);

    pr = Ctor.precision;
    rm = Ctor.rounding;
    Ctor.precision = pr + Math.max(x.e, x.sd()) + 4;
    Ctor.rounding = 1;
    len = x.d.length;

    if (len < 3) {
      x = taylorSeries(Ctor, 2, x, x, true);
    } else {

      // Alternative argument reduction: sinh(3x) = sinh(x)(3 + 4sinh^2(x))
      // i.e. sinh(x) = sinh(x/3)(3 + 4sinh^2(x/3))
      // 3 multiplications and 1 addition

      // Argument reduction: sinh(5x) = sinh(x)(5 + sinh^2(x)(20 + 16sinh^2(x)))
      // i.e. sinh(x) = sinh(x/5)(5 + sinh^2(x/5)(20 + 16sinh^2(x/5)))
      // 4 multiplications and 2 additions

      // Estimate the optimum number of times to use the argument reduction.
      k = 1.4 * Math.sqrt(len);
      k = k > 16 ? 16 : k | 0;

      x = x.times(1 / tinyPow(5, k));
      x = taylorSeries(Ctor, 2, x, x, true);

      // Reverse argument reduction
      var sinh2_x,
        d5 = new Ctor(5),
        d16 = new Ctor(16),
        d20 = new Ctor(20);
      for (; k--;) {
        sinh2_x = x.times(x);
        x = x.times(d5.plus(sinh2_x.times(d16.times(sinh2_x).plus(d20))));
      }
    }

    Ctor.precision = pr;
    Ctor.rounding = rm;

    return finalise(x, pr, rm, true);
  };


  /*
   * Return a new Decimal whose value is the hyperbolic tangent of the value in radians of this
   * Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-1, 1]
   *
   * tanh(x) = sinh(x) / cosh(x)
   *
   * tanh(0)         = 0
   * tanh(-0)        = -0
   * tanh(Infinity)  = 1
   * tanh(-Infinity) = -1
   * tanh(NaN)       = NaN
   *
   */
  P.hyperbolicTangent = P.tanh = function () {
    var pr, rm,
      x = this,
      Ctor = x.constructor;

    if (!x.isFinite()) return new Ctor(x.s);
    if (x.isZero()) return new Ctor(x);

    pr = Ctor.precision;
    rm = Ctor.rounding;
    Ctor.precision = pr + 7;
    Ctor.rounding = 1;

    return divide(x.sinh(), x.cosh(), Ctor.precision = pr, Ctor.rounding = rm);
  };


  /*
   * Return a new Decimal whose value is the arccosine (inverse cosine) in radians of the value of
   * this Decimal.
   *
   * Domain: [-1, 1]
   * Range: [0, pi]
   *
   * acos(x) = pi/2 - asin(x)
   *
   * acos(0)       = pi/2
   * acos(-0)      = pi/2
   * acos(1)       = 0
   * acos(-1)      = pi
   * acos(1/2)     = pi/3
   * acos(-1/2)    = 2*pi/3
   * acos(|x| > 1) = NaN
   * acos(NaN)     = NaN
   *
   */
  P.inverseCosine = P.acos = function () {
    var halfPi,
      x = this,
      Ctor = x.constructor,
      k = x.abs().cmp(1),
      pr = Ctor.precision,
      rm = Ctor.rounding;

    if (k !== -1) {
      return k === 0
        // |x| is 1
        ? x.isNeg() ? getPi(Ctor, pr, rm) : new Ctor(0)
        // |x| > 1 or x is NaN
        : new Ctor(NaN);
    }

    if (x.isZero()) return getPi(Ctor, pr + 4, rm).times(0.5);

    // TODO? Special case acos(0.5) = pi/3 and acos(-0.5) = 2*pi/3

    Ctor.precision = pr + 6;
    Ctor.rounding = 1;

    x = x.asin();
    halfPi = getPi(Ctor, pr + 4, rm).times(0.5);

    Ctor.precision = pr;
    Ctor.rounding = rm;

    return halfPi.minus(x);
  };


  /*
   * Return a new Decimal whose value is the inverse of the hyperbolic cosine in radians of the
   * value of this Decimal.
   *
   * Domain: [1, Infinity]
   * Range: [0, Infinity]
   *
   * acosh(x) = ln(x + sqrt(x^2 - 1))
   *
   * acosh(x < 1)     = NaN
   * acosh(NaN)       = NaN
   * acosh(Infinity)  = Infinity
   * acosh(-Infinity) = NaN
   * acosh(0)         = NaN
   * acosh(-0)        = NaN
   * acosh(1)         = 0
   * acosh(-1)        = NaN
   *
   */
  P.inverseHyperbolicCosine = P.acosh = function () {
    var pr, rm,
      x = this,
      Ctor = x.constructor;

    if (x.lte(1)) return new Ctor(x.eq(1) ? 0 : NaN);
    if (!x.isFinite()) return new Ctor(x);

    pr = Ctor.precision;
    rm = Ctor.rounding;
    Ctor.precision = pr + Math.max(Math.abs(x.e), x.sd()) + 4;
    Ctor.rounding = 1;
    external = false;

    x = x.times(x).minus(1).sqrt().plus(x);

    external = true;
    Ctor.precision = pr;
    Ctor.rounding = rm;

    return x.ln();
  };


  /*
   * Return a new Decimal whose value is the inverse of the hyperbolic sine in radians of the value
   * of this Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-Infinity, Infinity]
   *
   * asinh(x) = ln(x + sqrt(x^2 + 1))
   *
   * asinh(NaN)       = NaN
   * asinh(Infinity)  = Infinity
   * asinh(-Infinity) = -Infinity
   * asinh(0)         = 0
   * asinh(-0)        = -0
   *
   */
  P.inverseHyperbolicSine = P.asinh = function () {
    var pr, rm,
      x = this,
      Ctor = x.constructor;

    if (!x.isFinite() || x.isZero()) return new Ctor(x);

    pr = Ctor.precision;
    rm = Ctor.rounding;
    Ctor.precision = pr + 2 * Math.max(Math.abs(x.e), x.sd()) + 6;
    Ctor.rounding = 1;
    external = false;

    x = x.times(x).plus(1).sqrt().plus(x);

    external = true;
    Ctor.precision = pr;
    Ctor.rounding = rm;

    return x.ln();
  };


  /*
   * Return a new Decimal whose value is the inverse of the hyperbolic tangent in radians of the
   * value of this Decimal.
   *
   * Domain: [-1, 1]
   * Range: [-Infinity, Infinity]
   *
   * atanh(x) = 0.5 * ln((1 + x) / (1 - x))
   *
   * atanh(|x| > 1)   = NaN
   * atanh(NaN)       = NaN
   * atanh(Infinity)  = NaN
   * atanh(-Infinity) = NaN
   * atanh(0)         = 0
   * atanh(-0)        = -0
   * atanh(1)         = Infinity
   * atanh(-1)        = -Infinity
   *
   */
  P.inverseHyperbolicTangent = P.atanh = function () {
    var pr, rm, wpr, xsd,
      x = this,
      Ctor = x.constructor;

    if (!x.isFinite()) return new Ctor(NaN);
    if (x.e >= 0) return new Ctor(x.abs().eq(1) ? x.s / 0 : x.isZero() ? x : NaN);

    pr = Ctor.precision;
    rm = Ctor.rounding;
    xsd = x.sd();

    if (Math.max(xsd, pr) < 2 * -x.e - 1) return finalise(new Ctor(x), pr, rm, true);

    Ctor.precision = wpr = xsd - x.e;

    x = divide(x.plus(1), new Ctor(1).minus(x), wpr + pr, 1);

    Ctor.precision = pr + 4;
    Ctor.rounding = 1;

    x = x.ln();

    Ctor.precision = pr;
    Ctor.rounding = rm;

    return x.times(0.5);
  };


  /*
   * Return a new Decimal whose value is the arcsine (inverse sine) in radians of the value of this
   * Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-pi/2, pi/2]
   *
   * asin(x) = 2*atan(x/(1 + sqrt(1 - x^2)))
   *
   * asin(0)       = 0
   * asin(-0)      = -0
   * asin(1/2)     = pi/6
   * asin(-1/2)    = -pi/6
   * asin(1)       = pi/2
   * asin(-1)      = -pi/2
   * asin(|x| > 1) = NaN
   * asin(NaN)     = NaN
   *
   * TODO? Compare performance of Taylor series.
   *
   */
  P.inverseSine = P.asin = function () {
    var halfPi, k,
      pr, rm,
      x = this,
      Ctor = x.constructor;

    if (x.isZero()) return new Ctor(x);

    k = x.abs().cmp(1);
    pr = Ctor.precision;
    rm = Ctor.rounding;

    if (k !== -1) {

      // |x| is 1
      if (k === 0) {
        halfPi = getPi(Ctor, pr + 4, rm).times(0.5);
        halfPi.s = x.s;
        return halfPi;
      }

      // |x| > 1 or x is NaN
      return new Ctor(NaN);
    }

    // TODO? Special case asin(1/2) = pi/6 and asin(-1/2) = -pi/6

    Ctor.precision = pr + 6;
    Ctor.rounding = 1;

    x = x.div(new Ctor(1).minus(x.times(x)).sqrt().plus(1)).atan();

    Ctor.precision = pr;
    Ctor.rounding = rm;

    return x.times(2);
  };


  /*
   * Return a new Decimal whose value is the arctangent (inverse tangent) in radians of the value
   * of this Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-pi/2, pi/2]
   *
   * atan(x) = x - x^3/3 + x^5/5 - x^7/7 + ...
   *
   * atan(0)         = 0
   * atan(-0)        = -0
   * atan(1)         = pi/4
   * atan(-1)        = -pi/4
   * atan(Infinity)  = pi/2
   * atan(-Infinity) = -pi/2
   * atan(NaN)       = NaN
   *
   */
  P.inverseTangent = P.atan = function () {
    var i, j, k, n, px, t, r, wpr, x2,
      x = this,
      Ctor = x.constructor,
      pr = Ctor.precision,
      rm = Ctor.rounding;

    if (!x.isFinite()) {
      if (!x.s) return new Ctor(NaN);
      if (pr + 4 <= PI_PRECISION) {
        r = getPi(Ctor, pr + 4, rm).times(0.5);
        r.s = x.s;
        return r;
      }
    } else if (x.isZero()) {
      return new Ctor(x);
    } else if (x.abs().eq(1) && pr + 4 <= PI_PRECISION) {
      r = getPi(Ctor, pr + 4, rm).times(0.25);
      r.s = x.s;
      return r;
    }

    Ctor.precision = wpr = pr + 10;
    Ctor.rounding = 1;

    // TODO? if (x >= 1 && pr <= PI_PRECISION) atan(x) = halfPi * x.s - atan(1 / x);

    // Argument reduction
    // Ensure |x| < 0.42
    // atan(x) = 2 * atan(x / (1 + sqrt(1 + x^2)))

    k = Math.min(28, wpr / LOG_BASE + 2 | 0);

    for (i = k; i; --i) x = x.div(x.times(x).plus(1).sqrt().plus(1));

    external = false;

    j = Math.ceil(wpr / LOG_BASE);
    n = 1;
    x2 = x.times(x);
    r = new Ctor(x);
    px = x;

    // atan(x) = x - x^3/3 + x^5/5 - x^7/7 + ...
    for (; i !== -1;) {
      px = px.times(x2);
      t = r.minus(px.div(n += 2));

      px = px.times(x2);
      r = t.plus(px.div(n += 2));

      if (r.d[j] !== void 0) for (i = j; r.d[i] === t.d[i] && i--;);
    }

    if (k) r = r.times(2 << (k - 1));

    external = true;

    return finalise(r, Ctor.precision = pr, Ctor.rounding = rm, true);
  };


  /*
   * Return true if the value of this Decimal is a finite number, otherwise return false.
   *
   */
  P.isFinite = function () {
    return !!this.d;
  };


  /*
   * Return true if the value of this Decimal is an integer, otherwise return false.
   *
   */
  P.isInteger = P.isInt = function () {
    return !!this.d && mathfloor(this.e / LOG_BASE) > this.d.length - 2;
  };


  /*
   * Return true if the value of this Decimal is NaN, otherwise return false.
   *
   */
  P.isNaN = function () {
    return !this.s;
  };


  /*
   * Return true if the value of this Decimal is negative, otherwise return false.
   *
   */
  P.isNegative = P.isNeg = function () {
    return this.s < 0;
  };


  /*
   * Return true if the value of this Decimal is positive, otherwise return false.
   *
   */
  P.isPositive = P.isPos = function () {
    return this.s > 0;
  };


  /*
   * Return true if the value of this Decimal is 0 or -0, otherwise return false.
   *
   */
  P.isZero = function () {
    return !!this.d && this.d[0] === 0;
  };


  /*
   * Return true if the value of this Decimal is less than `y`, otherwise return false.
   *
   */
  P.lessThan = P.lt = function (y) {
    return this.cmp(y) < 0;
  };


  /*
   * Return true if the value of this Decimal is less than or equal to `y`, otherwise return false.
   *
   */
  P.lessThanOrEqualTo = P.lte = function (y) {
    return this.cmp(y) < 1;
  };


  /*
   * Return the logarithm of the value of this Decimal to the specified base, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * If no base is specified, return log[10](arg).
   *
   * log[base](arg) = ln(arg) / ln(base)
   *
   * The result will always be correctly rounded if the base of the log is 10, and 'almost always'
   * otherwise:
   *
   * Depending on the rounding mode, the result may be incorrectly rounded if the first fifteen
   * rounding digits are [49]99999999999999 or [50]00000000000000. In that case, the maximum error
   * between the result and the correctly rounded result will be one ulp (unit in the last place).
   *
   * log[-b](a)       = NaN
   * log[0](a)        = NaN
   * log[1](a)        = NaN
   * log[NaN](a)      = NaN
   * log[Infinity](a) = NaN
   * log[b](0)        = -Infinity
   * log[b](-0)       = -Infinity
   * log[b](-a)       = NaN
   * log[b](1)        = 0
   * log[b](Infinity) = Infinity
   * log[b](NaN)      = NaN
   *
   * [base] {number|string|Decimal} The base of the logarithm.
   *
   */
  P.logarithm = P.log = function (base) {
    var isBase10, d, denominator, k, inf, num, sd, r,
      arg = this,
      Ctor = arg.constructor,
      pr = Ctor.precision,
      rm = Ctor.rounding,
      guard = 5;

    // Default base is 10.
    if (base == null) {
      base = new Ctor(10);
      isBase10 = true;
    } else {
      base = new Ctor(base);
      d = base.d;

      // Return NaN if base is negative, or non-finite, or is 0 or 1.
      if (base.s < 0 || !d || !d[0] || base.eq(1)) return new Ctor(NaN);

      isBase10 = base.eq(10);
    }

    d = arg.d;

    // Is arg negative, non-finite, 0 or 1?
    if (arg.s < 0 || !d || !d[0] || arg.eq(1)) {
      return new Ctor(d && !d[0] ? -1 / 0 : arg.s != 1 ? NaN : d ? 0 : 1 / 0);
    }

    // The result will have a non-terminating decimal expansion if base is 10 and arg is not an
    // integer power of 10.
    if (isBase10) {
      if (d.length > 1) {
        inf = true;
      } else {
        for (k = d[0]; k % 10 === 0;) k /= 10;
        inf = k !== 1;
      }
    }

    external = false;
    sd = pr + guard;
    num = naturalLogarithm(arg, sd);
    denominator = isBase10 ? getLn10(Ctor, sd + 10) : naturalLogarithm(base, sd);

    // The result will have 5 rounding digits.
    r = divide(num, denominator, sd, 1);

    // If at a rounding boundary, i.e. the result's rounding digits are [49]9999 or [50]0000,
    // calculate 10 further digits.
    //
    // If the result is known to have an infinite decimal expansion, repeat this until it is clear
    // that the result is above or below the boundary. Otherwise, if after calculating the 10
    // further digits, the last 14 are nines, round up and assume the result is exact.
    // Also assume the result is exact if the last 14 are zero.
    //
    // Example of a result that will be incorrectly rounded:
    // log[1048576](4503599627370502) = 2.60000000000000009610279511444746...
    // The above result correctly rounded using ROUND_CEIL to 1 decimal place should be 2.7, but it
    // will be given as 2.6 as there are 15 zeros immediately after the requested decimal place, so
    // the exact result would be assumed to be 2.6, which rounded using ROUND_CEIL to 1 decimal
    // place is still 2.6.
    if (checkRoundingDigits(r.d, k = pr, rm)) {

      do {
        sd += 10;
        num = naturalLogarithm(arg, sd);
        denominator = isBase10 ? getLn10(Ctor, sd + 10) : naturalLogarithm(base, sd);
        r = divide(num, denominator, sd, 1);

        if (!inf) {

          // Check for 14 nines from the 2nd rounding digit, as the first may be 4.
          if (+digitsToString(r.d).slice(k + 1, k + 15) + 1 == 1e14) {
            r = finalise(r, pr + 1, 0);
          }

          break;
        }
      } while (checkRoundingDigits(r.d, k += 10, rm));
    }

    external = true;

    return finalise(r, pr, rm);
  };


  /*
   * Return a new Decimal whose value is the maximum of the arguments and the value of this Decimal.
   *
   * arguments {number|string|Decimal}
   *
  P.max = function () {
    Array.prototype.push.call(arguments, this);
    return maxOrMin(this.constructor, arguments, 'lt');
  };
   */


  /*
   * Return a new Decimal whose value is the minimum of the arguments and the value of this Decimal.
   *
   * arguments {number|string|Decimal}
   *
  P.min = function () {
    Array.prototype.push.call(arguments, this);
    return maxOrMin(this.constructor, arguments, 'gt');
  };
   */


  /*
   *  n - 0 = n
   *  n - N = N
   *  n - I = -I
   *  0 - n = -n
   *  0 - 0 = 0
   *  0 - N = N
   *  0 - I = -I
   *  N - n = N
   *  N - 0 = N
   *  N - N = N
   *  N - I = N
   *  I - n = I
   *  I - 0 = I
   *  I - N = N
   *  I - I = N
   *
   * Return a new Decimal whose value is the value of this Decimal minus `y`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   */
  P.minus = P.sub = function (y) {
    var d, e, i, j, k, len, pr, rm, xd, xe, xLTy, yd,
      x = this,
      Ctor = x.constructor;

    y = new Ctor(y);

    // If either is not finite...
    if (!x.d || !y.d) {

      // Return NaN if either is NaN.
      if (!x.s || !y.s) y = new Ctor(NaN);

      // Return y negated if x is finite and y is ±Infinity.
      else if (x.d) y.s = -y.s;

      // Return x if y is finite and x is ±Infinity.
      // Return x if both are ±Infinity with different signs.
      // Return NaN if both are ±Infinity with the same sign.
      else y = new Ctor(y.d || x.s !== y.s ? x : NaN);

      return y;
    }

    // If signs differ...
    if (x.s != y.s) {
      y.s = -y.s;
      return x.plus(y);
    }

    xd = x.d;
    yd = y.d;
    pr = Ctor.precision;
    rm = Ctor.rounding;

    // If either is zero...
    if (!xd[0] || !yd[0]) {

      // Return y negated if x is zero and y is non-zero.
      if (yd[0]) y.s = -y.s;

      // Return x if y is zero and x is non-zero.
      else if (xd[0]) y = new Ctor(x);

      // Return zero if both are zero.
      // From IEEE 754 (2008) 6.3: 0 - 0 = -0 - -0 = -0 when rounding to -Infinity.
      else return new Ctor(rm === 3 ? -0 : 0);

      return external ? finalise(y, pr, rm) : y;
    }

    // x and y are finite, non-zero numbers with the same sign.

    // Calculate base 1e7 exponents.
    e = mathfloor(y.e / LOG_BASE);
    xe = mathfloor(x.e / LOG_BASE);

    xd = xd.slice();
    k = xe - e;

    // If base 1e7 exponents differ...
    if (k) {
      xLTy = k < 0;

      if (xLTy) {
        d = xd;
        k = -k;
        len = yd.length;
      } else {
        d = yd;
        e = xe;
        len = xd.length;
      }

      // Numbers with massively different exponents would result in a very high number of
      // zeros needing to be prepended, but this can be avoided while still ensuring correct
      // rounding by limiting the number of zeros to `Math.ceil(pr / LOG_BASE) + 2`.
      i = Math.max(Math.ceil(pr / LOG_BASE), len) + 2;

      if (k > i) {
        k = i;
        d.length = 1;
      }

      // Prepend zeros to equalise exponents.
      d.reverse();
      for (i = k; i--;) d.push(0);
      d.reverse();

    // Base 1e7 exponents equal.
    } else {

      // Check digits to determine which is the bigger number.

      i = xd.length;
      len = yd.length;
      xLTy = i < len;
      if (xLTy) len = i;

      for (i = 0; i < len; i++) {
        if (xd[i] != yd[i]) {
          xLTy = xd[i] < yd[i];
          break;
        }
      }

      k = 0;
    }

    if (xLTy) {
      d = xd;
      xd = yd;
      yd = d;
      y.s = -y.s;
    }

    len = xd.length;

    // Append zeros to `xd` if shorter.
    // Don't add zeros to `yd` if shorter as subtraction only needs to start at `yd` length.
    for (i = yd.length - len; i > 0; --i) xd[len++] = 0;

    // Subtract yd from xd.
    for (i = yd.length; i > k;) {

      if (xd[--i] < yd[i]) {
        for (j = i; j && xd[--j] === 0;) xd[j] = BASE - 1;
        --xd[j];
        xd[i] += BASE;
      }

      xd[i] -= yd[i];
    }

    // Remove trailing zeros.
    for (; xd[--len] === 0;) xd.pop();

    // Remove leading zeros and adjust exponent accordingly.
    for (; xd[0] === 0; xd.shift()) --e;

    // Zero?
    if (!xd[0]) return new Ctor(rm === 3 ? -0 : 0);

    y.d = xd;
    y.e = getBase10Exponent(xd, e);

    return external ? finalise(y, pr, rm) : y;
  };


  /*
   *   n % 0 =  N
   *   n % N =  N
   *   n % I =  n
   *   0 % n =  0
   *  -0 % n = -0
   *   0 % 0 =  N
   *   0 % N =  N
   *   0 % I =  0
   *   N % n =  N
   *   N % 0 =  N
   *   N % N =  N
   *   N % I =  N
   *   I % n =  N
   *   I % 0 =  N
   *   I % N =  N
   *   I % I =  N
   *
   * Return a new Decimal whose value is the value of this Decimal modulo `y`, rounded to
   * `precision` significant digits using rounding mode `rounding`.
   *
   * The result depends on the modulo mode.
   *
   */
  P.modulo = P.mod = function (y) {
    var q,
      x = this,
      Ctor = x.constructor;

    y = new Ctor(y);

    // Return NaN if x is ±Infinity or NaN, or y is NaN or ±0.
    if (!x.d || !y.s || y.d && !y.d[0]) return new Ctor(NaN);

    // Return x if y is ±Infinity or x is ±0.
    if (!y.d || x.d && !x.d[0]) {
      return finalise(new Ctor(x), Ctor.precision, Ctor.rounding);
    }

    // Prevent rounding of intermediate calculations.
    external = false;

    if (Ctor.modulo == 9) {

      // Euclidian division: q = sign(y) * floor(x / abs(y))
      // result = x - q * y    where  0 <= result < abs(y)
      q = divide(x, y.abs(), 0, 3, 1);
      q.s *= y.s;
    } else {
      q = divide(x, y, 0, Ctor.modulo, 1);
    }

    q = q.times(y);

    external = true;

    return x.minus(q);
  };


  /*
   * Return a new Decimal whose value is the natural exponential of the value of this Decimal,
   * i.e. the base e raised to the power the value of this Decimal, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   */
  P.naturalExponential = P.exp = function () {
    return naturalExponential(this);
  };


  /*
   * Return a new Decimal whose value is the natural logarithm of the value of this Decimal,
   * rounded to `precision` significant digits using rounding mode `rounding`.
   *
   */
  P.naturalLogarithm = P.ln = function () {
    return naturalLogarithm(this);
  };


  /*
   * Return a new Decimal whose value is the value of this Decimal negated, i.e. as if multiplied by
   * -1.
   *
   */
  P.negated = P.neg = function () {
    var x = new this.constructor(this);
    x.s = -x.s;
    return finalise(x);
  };


  /*
   *  n + 0 = n
   *  n + N = N
   *  n + I = I
   *  0 + n = n
   *  0 + 0 = 0
   *  0 + N = N
   *  0 + I = I
   *  N + n = N
   *  N + 0 = N
   *  N + N = N
   *  N + I = N
   *  I + n = I
   *  I + 0 = I
   *  I + N = N
   *  I + I = I
   *
   * Return a new Decimal whose value is the value of this Decimal plus `y`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   */
  P.plus = P.add = function (y) {
    var carry, d, e, i, k, len, pr, rm, xd, yd,
      x = this,
      Ctor = x.constructor;

    y = new Ctor(y);

    // If either is not finite...
    if (!x.d || !y.d) {

      // Return NaN if either is NaN.
      if (!x.s || !y.s) y = new Ctor(NaN);

      // Return x if y is finite and x is ±Infinity.
      // Return x if both are ±Infinity with the same sign.
      // Return NaN if both are ±Infinity with different signs.
      // Return y if x is finite and y is ±Infinity.
      else if (!x.d) y = new Ctor(y.d || x.s === y.s ? x : NaN);

      return y;
    }

     // If signs differ...
    if (x.s != y.s) {
      y.s = -y.s;
      return x.minus(y);
    }

    xd = x.d;
    yd = y.d;
    pr = Ctor.precision;
    rm = Ctor.rounding;

    // If either is zero...
    if (!xd[0] || !yd[0]) {

      // Return x if y is zero.
      // Return y if y is non-zero.
      if (!yd[0]) y = new Ctor(x);

      return external ? finalise(y, pr, rm) : y;
    }

    // x and y are finite, non-zero numbers with the same sign.

    // Calculate base 1e7 exponents.
    k = mathfloor(x.e / LOG_BASE);
    e = mathfloor(y.e / LOG_BASE);

    xd = xd.slice();
    i = k - e;

    // If base 1e7 exponents differ...
    if (i) {

      if (i < 0) {
        d = xd;
        i = -i;
        len = yd.length;
      } else {
        d = yd;
        e = k;
        len = xd.length;
      }

      // Limit number of zeros prepended to max(ceil(pr / LOG_BASE), len) + 1.
      k = Math.ceil(pr / LOG_BASE);
      len = k > len ? k + 1 : len + 1;

      if (i > len) {
        i = len;
        d.length = 1;
      }

      // Prepend zeros to equalise exponents. Note: Faster to use reverse then do unshifts.
      d.reverse();
      for (; i--;) d.push(0);
      d.reverse();
    }

    len = xd.length;
    i = yd.length;

    // If yd is longer than xd, swap xd and yd so xd points to the longer array.
    if (len - i < 0) {
      i = len;
      d = yd;
      yd = xd;
      xd = d;
    }

    // Only start adding at yd.length - 1 as the further digits of xd can be left as they are.
    for (carry = 0; i;) {
      carry = (xd[--i] = xd[i] + yd[i] + carry) / BASE | 0;
      xd[i] %= BASE;
    }

    if (carry) {
      xd.unshift(carry);
      ++e;
    }

    // Remove trailing zeros.
    // No need to check for zero, as +x + +y != 0 && -x + -y != 0
    for (len = xd.length; xd[--len] == 0;) xd.pop();

    y.d = xd;
    y.e = getBase10Exponent(xd, e);

    return external ? finalise(y, pr, rm) : y;
  };


  /*
   * Return the number of significant digits of the value of this Decimal.
   *
   * [z] {boolean|number} Whether to count integer-part trailing zeros: true, false, 1 or 0.
   *
   */
  P.precision = P.sd = function (z) {
    var k,
      x = this;

    if (z !== void 0 && z !== !!z && z !== 1 && z !== 0) throw Error(invalidArgument + z);

    if (x.d) {
      k = getPrecision(x.d);
      if (z && x.e + 1 > k) k = x.e + 1;
    } else {
      k = NaN;
    }

    return k;
  };


  /*
   * Return a new Decimal whose value is the value of this Decimal rounded to a whole number using
   * rounding mode `rounding`.
   *
   */
  P.round = function () {
    var x = this,
      Ctor = x.constructor;

    return finalise(new Ctor(x), x.e + 1, Ctor.rounding);
  };


  /*
   * Return a new Decimal whose value is the sine of the value in radians of this Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-1, 1]
   *
   * sin(x) = x - x^3/3! + x^5/5! - ...
   *
   * sin(0)         = 0
   * sin(-0)        = -0
   * sin(Infinity)  = NaN
   * sin(-Infinity) = NaN
   * sin(NaN)       = NaN
   *
   */
  P.sine = P.sin = function () {
    var pr, rm,
      x = this,
      Ctor = x.constructor;

    if (!x.isFinite()) return new Ctor(NaN);
    if (x.isZero()) return new Ctor(x);

    pr = Ctor.precision;
    rm = Ctor.rounding;
    Ctor.precision = pr + Math.max(x.e, x.sd()) + LOG_BASE;
    Ctor.rounding = 1;

    x = sine(Ctor, toLessThanHalfPi(Ctor, x));

    Ctor.precision = pr;
    Ctor.rounding = rm;

    return finalise(quadrant > 2 ? x.neg() : x, pr, rm, true);
  };


  /*
   * Return a new Decimal whose value is the square root of this Decimal, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   *  sqrt(-n) =  N
   *  sqrt(N)  =  N
   *  sqrt(-I) =  N
   *  sqrt(I)  =  I
   *  sqrt(0)  =  0
   *  sqrt(-0) = -0
   *
   */
  P.squareRoot = P.sqrt = function () {
    var m, n, sd, r, rep, t,
      x = this,
      d = x.d,
      e = x.e,
      s = x.s,
      Ctor = x.constructor;

    // Negative/NaN/Infinity/zero?
    if (s !== 1 || !d || !d[0]) {
      return new Ctor(!s || s < 0 && (!d || d[0]) ? NaN : d ? x : 1 / 0);
    }

    external = false;

    // Initial estimate.
    s = Math.sqrt(+x);

    // Math.sqrt underflow/overflow?
    // Pass x to Math.sqrt as integer, then adjust the exponent of the result.
    if (s == 0 || s == 1 / 0) {
      n = digitsToString(d);

      if ((n.length + e) % 2 == 0) n += '0';
      s = Math.sqrt(n);
      e = mathfloor((e + 1) / 2) - (e < 0 || e % 2);

      if (s == 1 / 0) {
        n = '1e' + e;
      } else {
        n = s.toExponential();
        n = n.slice(0, n.indexOf('e') + 1) + e;
      }

      r = new Ctor(n);
    } else {
      r = new Ctor(s.toString());
    }

    sd = (e = Ctor.precision) + 3;

    // Newton-Raphson iteration.
    for (;;) {
      t = r;
      r = t.plus(divide(x, t, sd + 2, 1)).times(0.5);

      // TODO? Replace with for-loop and checkRoundingDigits.
      if (digitsToString(t.d).slice(0, sd) === (n = digitsToString(r.d)).slice(0, sd)) {
        n = n.slice(sd - 3, sd + 1);

        // The 4th rounding digit may be in error by -1 so if the 4 rounding digits are 9999 or
        // 4999, i.e. approaching a rounding boundary, continue the iteration.
        if (n == '9999' || !rep && n == '4999') {

          // On the first iteration only, check to see if rounding up gives the exact result as the
          // nines may infinitely repeat.
          if (!rep) {
            finalise(t, e + 1, 0);

            if (t.times(t).eq(x)) {
              r = t;
              break;
            }
          }

          sd += 4;
          rep = 1;
        } else {

          // If the rounding digits are null, 0{0,4} or 50{0,3}, check for an exact result.
          // If not, then there are further digits and m will be truthy.
          if (!+n || !+n.slice(1) && n.charAt(0) == '5') {

            // Truncate to the first rounding digit.
            finalise(r, e + 1, 1);
            m = !r.times(r).eq(x);
          }

          break;
        }
      }
    }

    external = true;

    return finalise(r, e, Ctor.rounding, m);
  };


  /*
   * Return a new Decimal whose value is the tangent of the value in radians of this Decimal.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-Infinity, Infinity]
   *
   * tan(0)         = 0
   * tan(-0)        = -0
   * tan(Infinity)  = NaN
   * tan(-Infinity) = NaN
   * tan(NaN)       = NaN
   *
   */
  P.tangent = P.tan = function () {
    var pr, rm,
      x = this,
      Ctor = x.constructor;

    if (!x.isFinite()) return new Ctor(NaN);
    if (x.isZero()) return new Ctor(x);

    pr = Ctor.precision;
    rm = Ctor.rounding;
    Ctor.precision = pr + 10;
    Ctor.rounding = 1;

    x = x.sin();
    x.s = 1;
    x = divide(x, new Ctor(1).minus(x.times(x)).sqrt(), pr + 10, 0);

    Ctor.precision = pr;
    Ctor.rounding = rm;

    return finalise(quadrant == 2 || quadrant == 4 ? x.neg() : x, pr, rm, true);
  };


  /*
   *  n * 0 = 0
   *  n * N = N
   *  n * I = I
   *  0 * n = 0
   *  0 * 0 = 0
   *  0 * N = N
   *  0 * I = N
   *  N * n = N
   *  N * 0 = N
   *  N * N = N
   *  N * I = N
   *  I * n = I
   *  I * 0 = N
   *  I * N = N
   *  I * I = I
   *
   * Return a new Decimal whose value is this Decimal times `y`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   */
  P.times = P.mul = function (y) {
    var carry, e, i, k, r, rL, t, xdL, ydL,
      x = this,
      Ctor = x.constructor,
      xd = x.d,
      yd = (y = new Ctor(y)).d;

    y.s *= x.s;

     // If either is NaN, ±Infinity or ±0...
    if (!xd || !xd[0] || !yd || !yd[0]) {

      return new Ctor(!y.s || xd && !xd[0] && !yd || yd && !yd[0] && !xd

        // Return NaN if either is NaN.
        // Return NaN if x is ±0 and y is ±Infinity, or y is ±0 and x is ±Infinity.
        ? NaN

        // Return ±Infinity if either is ±Infinity.
        // Return ±0 if either is ±0.
        : !xd || !yd ? y.s / 0 : y.s * 0);
    }

    e = mathfloor(x.e / LOG_BASE) + mathfloor(y.e / LOG_BASE);
    xdL = xd.length;
    ydL = yd.length;

    // Ensure xd points to the longer array.
    if (xdL < ydL) {
      r = xd;
      xd = yd;
      yd = r;
      rL = xdL;
      xdL = ydL;
      ydL = rL;
    }

    // Initialise the result array with zeros.
    r = [];
    rL = xdL + ydL;
    for (i = rL; i--;) r.push(0);

    // Multiply!
    for (i = ydL; --i >= 0;) {
      carry = 0;
      for (k = xdL + i; k > i;) {
        t = r[k] + yd[i] * xd[k - i - 1] + carry;
        r[k--] = t % BASE | 0;
        carry = t / BASE | 0;
      }

      r[k] = (r[k] + carry) % BASE | 0;
    }

    // Remove trailing zeros.
    for (; !r[--rL];) r.pop();

    if (carry) ++e;
    else r.shift();

    y.d = r;
    y.e = getBase10Exponent(r, e);

    return external ? finalise(y, Ctor.precision, Ctor.rounding) : y;
  };


  /*
   * Return a string representing the value of this Decimal in base 2, round to `sd` significant
   * digits using rounding mode `rm`.
   *
   * If the optional `sd` argument is present then return binary exponential notation.
   *
   * [sd] {number} Significant digits. Integer, 1 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   */
  P.toBinary = function (sd, rm) {
    return toStringBinary(this, 2, sd, rm);
  };


  /*
   * Return a new Decimal whose value is the value of this Decimal rounded to a maximum of `dp`
   * decimal places using rounding mode `rm` or `rounding` if `rm` is omitted.
   *
   * If `dp` is omitted, return a new Decimal whose value is the value of this Decimal.
   *
   * [dp] {number} Decimal places. Integer, 0 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   */
  P.toDecimalPlaces = P.toDP = function (dp, rm) {
    var x = this,
      Ctor = x.constructor;

    x = new Ctor(x);
    if (dp === void 0) return x;

    checkInt32(dp, 0, MAX_DIGITS);

    if (rm === void 0) rm = Ctor.rounding;
    else checkInt32(rm, 0, 8);

    return finalise(x, dp + x.e + 1, rm);
  };


  /*
   * Return a string representing the value of this Decimal in exponential notation rounded to
   * `dp` fixed decimal places using rounding mode `rounding`.
   *
   * [dp] {number} Decimal places. Integer, 0 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   */
  P.toExponential = function (dp, rm) {
    var str,
      x = this,
      Ctor = x.constructor;

    if (dp === void 0) {
      str = finiteToString(x, true);
    } else {
      checkInt32(dp, 0, MAX_DIGITS);

      if (rm === void 0) rm = Ctor.rounding;
      else checkInt32(rm, 0, 8);

      x = finalise(new Ctor(x), dp + 1, rm);
      str = finiteToString(x, true, dp + 1);
    }

    return x.isNeg() && !x.isZero() ? '-' + str : str;
  };


  /*
   * Return a string representing the value of this Decimal in normal (fixed-point) notation to
   * `dp` fixed decimal places and rounded using rounding mode `rm` or `rounding` if `rm` is
   * omitted.
   *
   * As with JavaScript numbers, (-0).toFixed(0) is '0', but e.g. (-0.00001).toFixed(0) is '-0'.
   *
   * [dp] {number} Decimal places. Integer, 0 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   * (-0).toFixed(0) is '0', but (-0.1).toFixed(0) is '-0'.
   * (-0).toFixed(1) is '0.0', but (-0.01).toFixed(1) is '-0.0'.
   * (-0).toFixed(3) is '0.000'.
   * (-0.5).toFixed(0) is '-0'.
   *
   */
  P.toFixed = function (dp, rm) {
    var str, y,
      x = this,
      Ctor = x.constructor;

    if (dp === void 0) {
      str = finiteToString(x);
    } else {
      checkInt32(dp, 0, MAX_DIGITS);

      if (rm === void 0) rm = Ctor.rounding;
      else checkInt32(rm, 0, 8);

      y = finalise(new Ctor(x), dp + x.e + 1, rm);
      str = finiteToString(y, false, dp + y.e + 1);
    }

    // To determine whether to add the minus sign look at the value before it was rounded,
    // i.e. look at `x` rather than `y`.
    return x.isNeg() && !x.isZero() ? '-' + str : str;
  };


  /*
   * Return an array representing the value of this Decimal as a simple fraction with an integer
   * numerator and an integer denominator.
   *
   * The denominator will be a positive non-zero value less than or equal to the specified maximum
   * denominator. If a maximum denominator is not specified, the denominator will be the lowest
   * value necessary to represent the number exactly.
   *
   * [maxD] {number|string|Decimal} Maximum denominator. Integer >= 1 and < Infinity.
   *
   */
  P.toFraction = function (maxD) {
    var d, d0, d1, d2, e, k, n, n0, n1, pr, q, r,
      x = this,
      xd = x.d,
      Ctor = x.constructor;

    if (!xd) return new Ctor(x);

    n1 = d0 = new Ctor(1);
    d1 = n0 = new Ctor(0);

    d = new Ctor(d1);
    e = d.e = getPrecision(xd) - x.e - 1;
    k = e % LOG_BASE;
    d.d[0] = mathpow(10, k < 0 ? LOG_BASE + k : k);

    if (maxD == null) {

      // d is 10**e, the minimum max-denominator needed.
      maxD = e > 0 ? d : n1;
    } else {
      n = new Ctor(maxD);
      if (!n.isInt() || n.lt(n1)) throw Error(invalidArgument + n);
      maxD = n.gt(d) ? (e > 0 ? d : n1) : n;
    }

    external = false;
    n = new Ctor(digitsToString(xd));
    pr = Ctor.precision;
    Ctor.precision = e = xd.length * LOG_BASE * 2;

    for (;;)  {
      q = divide(n, d, 0, 1, 1);
      d2 = d0.plus(q.times(d1));
      if (d2.cmp(maxD) == 1) break;
      d0 = d1;
      d1 = d2;
      d2 = n1;
      n1 = n0.plus(q.times(d2));
      n0 = d2;
      d2 = d;
      d = n.minus(q.times(d2));
      n = d2;
    }

    d2 = divide(maxD.minus(d0), d1, 0, 1, 1);
    n0 = n0.plus(d2.times(n1));
    d0 = d0.plus(d2.times(d1));
    n0.s = n1.s = x.s;

    // Determine which fraction is closer to x, n0/d0 or n1/d1?
    r = divide(n1, d1, e, 1).minus(x).abs().cmp(divide(n0, d0, e, 1).minus(x).abs()) < 1
        ? [n1, d1] : [n0, d0];

    Ctor.precision = pr;
    external = true;

    return r;
  };


  /*
   * Return a string representing the value of this Decimal in base 16, round to `sd` significant
   * digits using rounding mode `rm`.
   *
   * If the optional `sd` argument is present then return binary exponential notation.
   *
   * [sd] {number} Significant digits. Integer, 1 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   */
  P.toHexadecimal = P.toHex = function (sd, rm) {
    return toStringBinary(this, 16, sd, rm);
  };


  /*
   * Returns a new Decimal whose value is the nearest multiple of `y` in the direction of rounding
   * mode `rm`, or `Decimal.rounding` if `rm` is omitted, to the value of this Decimal.
   *
   * The return value will always have the same sign as this Decimal, unless either this Decimal
   * or `y` is NaN, in which case the return value will be also be NaN.
   *
   * The return value is not affected by the value of `precision`.
   *
   * y {number|string|Decimal} The magnitude to round to a multiple of.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   * 'toNearest() rounding mode not an integer: {rm}'
   * 'toNearest() rounding mode out of range: {rm}'
   *
   */
  P.toNearest = function (y, rm) {
    var x = this,
      Ctor = x.constructor;

    x = new Ctor(x);

    if (y == null) {

      // If x is not finite, return x.
      if (!x.d) return x;

      y = new Ctor(1);
      rm = Ctor.rounding;
    } else {
      y = new Ctor(y);
      if (rm === void 0) {
        rm = Ctor.rounding;
      } else {
        checkInt32(rm, 0, 8);
      }

      // If x is not finite, return x if y is not NaN, else NaN.
      if (!x.d) return y.s ? x : y;

      // If y is not finite, return Infinity with the sign of x if y is Infinity, else NaN.
      if (!y.d) {
        if (y.s) y.s = x.s;
        return y;
      }
    }

    // If y is not zero, calculate the nearest multiple of y to x.
    if (y.d[0]) {
      external = false;
      x = divide(x, y, 0, rm, 1).times(y);
      external = true;
      finalise(x);

    // If y is zero, return zero with the sign of x.
    } else {
      y.s = x.s;
      x = y;
    }

    return x;
  };


  /*
   * Return the value of this Decimal converted to a number primitive.
   * Zero keeps its sign.
   *
   */
  P.toNumber = function () {
    return +this;
  };


  /*
   * Return a string representing the value of this Decimal in base 8, round to `sd` significant
   * digits using rounding mode `rm`.
   *
   * If the optional `sd` argument is present then return binary exponential notation.
   *
   * [sd] {number} Significant digits. Integer, 1 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   */
  P.toOctal = function (sd, rm) {
    return toStringBinary(this, 8, sd, rm);
  };


  /*
   * Return a new Decimal whose value is the value of this Decimal raised to the power `y`, rounded
   * to `precision` significant digits using rounding mode `rounding`.
   *
   * ECMAScript compliant.
   *
   *   pow(x, NaN)                           = NaN
   *   pow(x, ±0)                            = 1

   *   pow(NaN, non-zero)                    = NaN
   *   pow(abs(x) > 1, +Infinity)            = +Infinity
   *   pow(abs(x) > 1, -Infinity)            = +0
   *   pow(abs(x) == 1, ±Infinity)           = NaN
   *   pow(abs(x) < 1, +Infinity)            = +0
   *   pow(abs(x) < 1, -Infinity)            = +Infinity
   *   pow(+Infinity, y > 0)                 = +Infinity
   *   pow(+Infinity, y < 0)                 = +0
   *   pow(-Infinity, odd integer > 0)       = -Infinity
   *   pow(-Infinity, even integer > 0)      = +Infinity
   *   pow(-Infinity, odd integer < 0)       = -0
   *   pow(-Infinity, even integer < 0)      = +0
   *   pow(+0, y > 0)                        = +0
   *   pow(+0, y < 0)                        = +Infinity
   *   pow(-0, odd integer > 0)              = -0
   *   pow(-0, even integer > 0)             = +0
   *   pow(-0, odd integer < 0)              = -Infinity
   *   pow(-0, even integer < 0)             = +Infinity
   *   pow(finite x < 0, finite non-integer) = NaN
   *
   * For non-integer or very large exponents pow(x, y) is calculated using
   *
   *   x^y = exp(y*ln(x))
   *
   * Assuming the first 15 rounding digits are each equally likely to be any digit 0-9, the
   * probability of an incorrectly rounded result
   * P([49]9{14} | [50]0{14}) = 2 * 0.2 * 10^-14 = 4e-15 = 1/2.5e+14
   * i.e. 1 in 250,000,000,000,000
   *
   * If a result is incorrectly rounded the maximum error will be 1 ulp (unit in last place).
   *
   * y {number|string|Decimal} The power to which to raise this Decimal.
   *
   */
  P.toPower = P.pow = function (y) {
    var e, k, pr, r, rm, s,
      x = this,
      Ctor = x.constructor,
      yn = +(y = new Ctor(y));

    // Either ±Infinity, NaN or ±0?
    if (!x.d || !y.d || !x.d[0] || !y.d[0]) return new Ctor(mathpow(+x, yn));

    x = new Ctor(x);

    if (x.eq(1)) return x;

    pr = Ctor.precision;
    rm = Ctor.rounding;

    if (y.eq(1)) return finalise(x, pr, rm);

    // y exponent
    e = mathfloor(y.e / LOG_BASE);

    // If y is a small integer use the 'exponentiation by squaring' algorithm.
    if (e >= y.d.length - 1 && (k = yn < 0 ? -yn : yn) <= MAX_SAFE_INTEGER) {
      r = intPow(Ctor, x, k, pr);
      return y.s < 0 ? new Ctor(1).div(r) : finalise(r, pr, rm);
    }

    s = x.s;

    // if x is negative
    if (s < 0) {

      // if y is not an integer
      if (e < y.d.length - 1) return new Ctor(NaN);

      // Result is positive if x is negative and the last digit of integer y is even.
      if ((y.d[e] & 1) == 0) s = 1;

      // if x.eq(-1)
      if (x.e == 0 && x.d[0] == 1 && x.d.length == 1) {
        x.s = s;
        return x;
      }
    }

    // Estimate result exponent.
    // x^y = 10^e,  where e = y * log10(x)
    // log10(x) = log10(x_significand) + x_exponent
    // log10(x_significand) = ln(x_significand) / ln(10)
    k = mathpow(+x, yn);
    e = k == 0 || !isFinite(k)
      ? mathfloor(yn * (Math.log('0.' + digitsToString(x.d)) / Math.LN10 + x.e + 1))
      : new Ctor(k + '').e;

    // Exponent estimate may be incorrect e.g. x: 0.999999999999999999, y: 2.29, e: 0, r.e: -1.

    // Overflow/underflow?
    if (e > Ctor.maxE + 1 || e < Ctor.minE - 1) return new Ctor(e > 0 ? s / 0 : 0);

    external = false;
    Ctor.rounding = x.s = 1;

    // Estimate the extra guard digits needed to ensure five correct rounding digits from
    // naturalLogarithm(x). Example of failure without these extra digits (precision: 10):
    // new Decimal(2.32456).pow('2087987436534566.46411')
    // should be 1.162377823e+764914905173815, but is 1.162355823e+764914905173815
    k = Math.min(12, (e + '').length);

    // r = x^y = exp(y*ln(x))
    r = naturalExponential(y.times(naturalLogarithm(x, pr + k)), pr);

    // r may be Infinity, e.g. (0.9999999999999999).pow(-1e+40)
    if (r.d) {

      // Truncate to the required precision plus five rounding digits.
      r = finalise(r, pr + 5, 1);

      // If the rounding digits are [49]9999 or [50]0000 increase the precision by 10 and recalculate
      // the result.
      if (checkRoundingDigits(r.d, pr, rm)) {
        e = pr + 10;

        // Truncate to the increased precision plus five rounding digits.
        r = finalise(naturalExponential(y.times(naturalLogarithm(x, e + k)), e), e + 5, 1);

        // Check for 14 nines from the 2nd rounding digit (the first rounding digit may be 4 or 9).
        if (+digitsToString(r.d).slice(pr + 1, pr + 15) + 1 == 1e14) {
          r = finalise(r, pr + 1, 0);
        }
      }
    }

    r.s = s;
    external = true;
    Ctor.rounding = rm;

    return finalise(r, pr, rm);
  };


  /*
   * Return a string representing the value of this Decimal rounded to `sd` significant digits
   * using rounding mode `rounding`.
   *
   * Return exponential notation if `sd` is less than the number of digits necessary to represent
   * the integer part of the value in normal notation.
   *
   * [sd] {number} Significant digits. Integer, 1 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   */
  P.toPrecision = function (sd, rm) {
    var str,
      x = this,
      Ctor = x.constructor;

    if (sd === void 0) {
      str = finiteToString(x, x.e <= Ctor.toExpNeg || x.e >= Ctor.toExpPos);
    } else {
      checkInt32(sd, 1, MAX_DIGITS);

      if (rm === void 0) rm = Ctor.rounding;
      else checkInt32(rm, 0, 8);

      x = finalise(new Ctor(x), sd, rm);
      str = finiteToString(x, sd <= x.e || x.e <= Ctor.toExpNeg, sd);
    }

    return x.isNeg() && !x.isZero() ? '-' + str : str;
  };


  /*
   * Return a new Decimal whose value is the value of this Decimal rounded to a maximum of `sd`
   * significant digits using rounding mode `rm`, or to `precision` and `rounding` respectively if
   * omitted.
   *
   * [sd] {number} Significant digits. Integer, 1 to MAX_DIGITS inclusive.
   * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
   *
   * 'toSD() digits out of range: {sd}'
   * 'toSD() digits not an integer: {sd}'
   * 'toSD() rounding mode not an integer: {rm}'
   * 'toSD() rounding mode out of range: {rm}'
   *
   */
  P.toSignificantDigits = P.toSD = function (sd, rm) {
    var x = this,
      Ctor = x.constructor;

    if (sd === void 0) {
      sd = Ctor.precision;
      rm = Ctor.rounding;
    } else {
      checkInt32(sd, 1, MAX_DIGITS);

      if (rm === void 0) rm = Ctor.rounding;
      else checkInt32(rm, 0, 8);
    }

    return finalise(new Ctor(x), sd, rm);
  };


  /*
   * Return a string representing the value of this Decimal.
   *
   * Return exponential notation if this Decimal has a positive exponent equal to or greater than
   * `toExpPos`, or a negative exponent equal to or less than `toExpNeg`.
   *
   */
  P.toString = function () {
    var x = this,
      Ctor = x.constructor,
      str = finiteToString(x, x.e <= Ctor.toExpNeg || x.e >= Ctor.toExpPos);

    return x.isNeg() && !x.isZero() ? '-' + str : str;
  };


  /*
   * Return a new Decimal whose value is the value of this Decimal truncated to a whole number.
   *
   */
  P.truncated = P.trunc = function () {
    return finalise(new this.constructor(this), this.e + 1, 1);
  };


  /*
   * Return a string representing the value of this Decimal.
   * Unlike `toString`, negative zero will include the minus sign.
   *
   */
  P.valueOf = P.toJSON = function () {
    var x = this,
      Ctor = x.constructor,
      str = finiteToString(x, x.e <= Ctor.toExpNeg || x.e >= Ctor.toExpPos);

    return x.isNeg() ? '-' + str : str;
  };


  /*
  // Add aliases to match BigDecimal method names.
  // P.add = P.plus;
  P.subtract = P.minus;
  P.multiply = P.times;
  P.divide = P.div;
  P.remainder = P.mod;
  P.compareTo = P.cmp;
  P.negate = P.neg;
   */


  // Helper functions for Decimal.prototype (P) and/or Decimal methods, and their callers.


  /*
   *  digitsToString           P.cubeRoot, P.logarithm, P.squareRoot, P.toFraction, P.toPower,
   *                           finiteToString, naturalExponential, naturalLogarithm
   *  checkInt32               P.toDecimalPlaces, P.toExponential, P.toFixed, P.toNearest,
   *                           P.toPrecision, P.toSignificantDigits, toStringBinary, random
   *  checkRoundingDigits      P.logarithm, P.toPower, naturalExponential, naturalLogarithm
   *  convertBase              toStringBinary, parseOther
   *  cos                      P.cos
   *  divide                   P.atanh, P.cubeRoot, P.dividedBy, P.dividedToIntegerBy,
   *                           P.logarithm, P.modulo, P.squareRoot, P.tan, P.tanh, P.toFraction,
   *                           P.toNearest, toStringBinary, naturalExponential, naturalLogarithm,
   *                           taylorSeries, atan2, parseOther
   *  finalise                 P.absoluteValue, P.atan, P.atanh, P.ceil, P.cos, P.cosh,
   *                           P.cubeRoot, P.dividedToIntegerBy, P.floor, P.logarithm, P.minus,
   *                           P.modulo, P.negated, P.plus, P.round, P.sin, P.sinh, P.squareRoot,
   *                           P.tan, P.times, P.toDecimalPlaces, P.toExponential, P.toFixed,
   *                           P.toNearest, P.toPower, P.toPrecision, P.toSignificantDigits,
   *                           P.truncated, divide, getLn10, getPi, naturalExponential,
   *                           naturalLogarithm, ceil, floor, round, trunc
   *  finiteToString           P.toExponential, P.toFixed, P.toPrecision, P.toString, P.valueOf,
   *                           toStringBinary
   *  getBase10Exponent        P.minus, P.plus, P.times, parseOther
   *  getLn10                  P.logarithm, naturalLogarithm
   *  getPi                    P.acos, P.asin, P.atan, toLessThanHalfPi, atan2
   *  getPrecision             P.precision, P.toFraction
   *  getZeroString            digitsToString, finiteToString
   *  intPow                   P.toPower, parseOther
   *  isOdd                    toLessThanHalfPi
   *  maxOrMin                 max, min
   *  naturalExponential       P.naturalExponential, P.toPower
   *  naturalLogarithm         P.acosh, P.asinh, P.atanh, P.logarithm, P.naturalLogarithm,
   *                           P.toPower, naturalExponential
   *  nonFiniteToString        finiteToString, toStringBinary
   *  parseDecimal             Decimal
   *  parseOther               Decimal
   *  sin                      P.sin
   *  taylorSeries             P.cosh, P.sinh, cos, sin
   *  toLessThanHalfPi         P.cos, P.sin
   *  toStringBinary           P.toBinary, P.toHexadecimal, P.toOctal
   *  truncate                 intPow
   *
   *  Throws:                  P.logarithm, P.precision, P.toFraction, checkInt32, getLn10, getPi,
   *                           naturalLogarithm, config, parseOther, random, Decimal
   */


  function digitsToString(d) {
    var i, k, ws,
      indexOfLastWord = d.length - 1,
      str = '',
      w = d[0];

    if (indexOfLastWord > 0) {
      str += w;
      for (i = 1; i < indexOfLastWord; i++) {
        ws = d[i] + '';
        k = LOG_BASE - ws.length;
        if (k) str += getZeroString(k);
        str += ws;
      }

      w = d[i];
      ws = w + '';
      k = LOG_BASE - ws.length;
      if (k) str += getZeroString(k);
    } else if (w === 0) {
      return '0';
    }

    // Remove trailing zeros of last w.
    for (; w % 10 === 0;) w /= 10;

    return str + w;
  }


  function checkInt32(i, min, max) {
    if (i !== ~~i || i < min || i > max) {
      throw Error(invalidArgument + i);
    }
  }


  /*
   * Check 5 rounding digits if `repeating` is null, 4 otherwise.
   * `repeating == null` if caller is `log` or `pow`,
   * `repeating != null` if caller is `naturalLogarithm` or `naturalExponential`.
   */
  function checkRoundingDigits(d, i, rm, repeating) {
    var di, k, r, rd;

    // Get the length of the first word of the array d.
    for (k = d[0]; k >= 10; k /= 10) --i;

    // Is the rounding digit in the first word of d?
    if (--i < 0) {
      i += LOG_BASE;
      di = 0;
    } else {
      di = Math.ceil((i + 1) / LOG_BASE);
      i %= LOG_BASE;
    }

    // i is the index (0 - 6) of the rounding digit.
    // E.g. if within the word 3487563 the first rounding digit is 5,
    // then i = 4, k = 1000, rd = 3487563 % 1000 = 563
    k = mathpow(10, LOG_BASE - i);
    rd = d[di] % k | 0;

    if (repeating == null) {
      if (i < 3) {
        if (i == 0) rd = rd / 100 | 0;
        else if (i == 1) rd = rd / 10 | 0;
        r = rm < 4 && rd == 99999 || rm > 3 && rd == 49999 || rd == 50000 || rd == 0;
      } else {
        r = (rm < 4 && rd + 1 == k || rm > 3 && rd + 1 == k / 2) &&
          (d[di + 1] / k / 100 | 0) == mathpow(10, i - 2) - 1 ||
            (rd == k / 2 || rd == 0) && (d[di + 1] / k / 100 | 0) == 0;
      }
    } else {
      if (i < 4) {
        if (i == 0) rd = rd / 1000 | 0;
        else if (i == 1) rd = rd / 100 | 0;
        else if (i == 2) rd = rd / 10 | 0;
        r = (repeating || rm < 4) && rd == 9999 || !repeating && rm > 3 && rd == 4999;
      } else {
        r = ((repeating || rm < 4) && rd + 1 == k ||
        (!repeating && rm > 3) && rd + 1 == k / 2) &&
          (d[di + 1] / k / 1000 | 0) == mathpow(10, i - 3) - 1;
      }
    }

    return r;
  }


  // Convert string of `baseIn` to an array of numbers of `baseOut`.
  // Eg. convertBase('255', 10, 16) returns [15, 15].
  // Eg. convertBase('ff', 16, 10) returns [2, 5, 5].
  function convertBase(str, baseIn, baseOut) {
    var j,
      arr = [0],
      arrL,
      i = 0,
      strL = str.length;

    for (; i < strL;) {
      for (arrL = arr.length; arrL--;) arr[arrL] *= baseIn;
      arr[0] += NUMERALS.indexOf(str.charAt(i++));
      for (j = 0; j < arr.length; j++) {
        if (arr[j] > baseOut - 1) {
          if (arr[j + 1] === void 0) arr[j + 1] = 0;
          arr[j + 1] += arr[j] / baseOut | 0;
          arr[j] %= baseOut;
        }
      }
    }

    return arr.reverse();
  }


  /*
   * cos(x) = 1 - x^2/2! + x^4/4! - ...
   * |x| < pi/2
   *
   */
  function cosine(Ctor, x) {
    var k, y,
      len = x.d.length;

    // Argument reduction: cos(4x) = 8*(cos^4(x) - cos^2(x)) + 1
    // i.e. cos(x) = 8*(cos^4(x/4) - cos^2(x/4)) + 1

    // Estimate the optimum number of times to use the argument reduction.
    if (len < 32) {
      k = Math.ceil(len / 3);
      y = (1 / tinyPow(4, k)).toString();
    } else {
      k = 16;
      y = '2.3283064365386962890625e-10';
    }

    Ctor.precision += k;

    x = taylorSeries(Ctor, 1, x.times(y), new Ctor(1));

    // Reverse argument reduction
    for (var i = k; i--;) {
      var cos2x = x.times(x);
      x = cos2x.times(cos2x).minus(cos2x).times(8).plus(1);
    }

    Ctor.precision -= k;

    return x;
  }


  /*
   * Perform division in the specified base.
   */
  var divide = (function () {

    // Assumes non-zero x and k, and hence non-zero result.
    function multiplyInteger(x, k, base) {
      var temp,
        carry = 0,
        i = x.length;

      for (x = x.slice(); i--;) {
        temp = x[i] * k + carry;
        x[i] = temp % base | 0;
        carry = temp / base | 0;
      }

      if (carry) x.unshift(carry);

      return x;
    }

    function compare(a, b, aL, bL) {
      var i, r;

      if (aL != bL) {
        r = aL > bL ? 1 : -1;
      } else {
        for (i = r = 0; i < aL; i++) {
          if (a[i] != b[i]) {
            r = a[i] > b[i] ? 1 : -1;
            break;
          }
        }
      }

      return r;
    }

    function subtract(a, b, aL, base) {
      var i = 0;

      // Subtract b from a.
      for (; aL--;) {
        a[aL] -= i;
        i = a[aL] < b[aL] ? 1 : 0;
        a[aL] = i * base + a[aL] - b[aL];
      }

      // Remove leading zeros.
      for (; !a[0] && a.length > 1;) a.shift();
    }

    return function (x, y, pr, rm, dp, base) {
      var cmp, e, i, k, logBase, more, prod, prodL, q, qd, rem, remL, rem0, sd, t, xi, xL, yd0,
        yL, yz,
        Ctor = x.constructor,
        sign = x.s == y.s ? 1 : -1,
        xd = x.d,
        yd = y.d;

      // Either NaN, Infinity or 0?
      if (!xd || !xd[0] || !yd || !yd[0]) {

        return new Ctor(// Return NaN if either NaN, or both Infinity or 0.
          !x.s || !y.s || (xd ? yd && xd[0] == yd[0] : !yd) ? NaN :

          // Return ±0 if x is 0 or y is ±Infinity, or return ±Infinity as y is 0.
          xd && xd[0] == 0 || !yd ? sign * 0 : sign / 0);
      }

      if (base) {
        logBase = 1;
        e = x.e - y.e;
      } else {
        base = BASE;
        logBase = LOG_BASE;
        e = mathfloor(x.e / logBase) - mathfloor(y.e / logBase);
      }

      yL = yd.length;
      xL = xd.length;
      q = new Ctor(sign);
      qd = q.d = [];

      // Result exponent may be one less than e.
      // The digit array of a Decimal from toStringBinary may have trailing zeros.
      for (i = 0; yd[i] == (xd[i] || 0); i++);

      if (yd[i] > (xd[i] || 0)) e--;

      if (pr == null) {
        sd = pr = Ctor.precision;
        rm = Ctor.rounding;
      } else if (dp) {
        sd = pr + (x.e - y.e) + 1;
      } else {
        sd = pr;
      }

      if (sd < 0) {
        qd.push(1);
        more = true;
      } else {

        // Convert precision in number of base 10 digits to base 1e7 digits.
        sd = sd / logBase + 2 | 0;
        i = 0;

        // divisor < 1e7
        if (yL == 1) {
          k = 0;
          yd = yd[0];
          sd++;

          // k is the carry.
          for (; (i < xL || k) && sd--; i++) {
            t = k * base + (xd[i] || 0);
            qd[i] = t / yd | 0;
            k = t % yd | 0;
          }

          more = k || i < xL;

        // divisor >= 1e7
        } else {

          // Normalise xd and yd so highest order digit of yd is >= base/2
          k = base / (yd[0] + 1) | 0;

          if (k > 1) {
            yd = multiplyInteger(yd, k, base);
            xd = multiplyInteger(xd, k, base);
            yL = yd.length;
            xL = xd.length;
          }

          xi = yL;
          rem = xd.slice(0, yL);
          remL = rem.length;

          // Add zeros to make remainder as long as divisor.
          for (; remL < yL;) rem[remL++] = 0;

          yz = yd.slice();
          yz.unshift(0);
          yd0 = yd[0];

          if (yd[1] >= base / 2) ++yd0;

          do {
            k = 0;

            // Compare divisor and remainder.
            cmp = compare(yd, rem, yL, remL);

            // If divisor < remainder.
            if (cmp < 0) {

              // Calculate trial digit, k.
              rem0 = rem[0];
              if (yL != remL) rem0 = rem0 * base + (rem[1] || 0);

              // k will be how many times the divisor goes into the current remainder.
              k = rem0 / yd0 | 0;

              //  Algorithm:
              //  1. product = divisor * trial digit (k)
              //  2. if product > remainder: product -= divisor, k--
              //  3. remainder -= product
              //  4. if product was < remainder at 2:
              //    5. compare new remainder and divisor
              //    6. If remainder > divisor: remainder -= divisor, k++

              if (k > 1) {
                if (k >= base) k = base - 1;

                // product = divisor * trial digit.
                prod = multiplyInteger(yd, k, base);
                prodL = prod.length;
                remL = rem.length;

                // Compare product and remainder.
                cmp = compare(prod, rem, prodL, remL);

                // product > remainder.
                if (cmp == 1) {
                  k--;

                  // Subtract divisor from product.
                  subtract(prod, yL < prodL ? yz : yd, prodL, base);
                }
              } else {

                // cmp is -1.
                // If k is 0, there is no need to compare yd and rem again below, so change cmp to 1
                // to avoid it. If k is 1 there is a need to compare yd and rem again below.
                if (k == 0) cmp = k = 1;
                prod = yd.slice();
              }

              prodL = prod.length;
              if (prodL < remL) prod.unshift(0);

              // Subtract product from remainder.
              subtract(rem, prod, remL, base);

              // If product was < previous remainder.
              if (cmp == -1) {
                remL = rem.length;

                // Compare divisor and new remainder.
                cmp = compare(yd, rem, yL, remL);

                // If divisor < new remainder, subtract divisor from remainder.
                if (cmp < 1) {
                  k++;

                  // Subtract divisor from remainder.
                  subtract(rem, yL < remL ? yz : yd, remL, base);
                }
              }

              remL = rem.length;
            } else if (cmp === 0) {
              k++;
              rem = [0];
            }    // if cmp === 1, k will be 0

            // Add the next digit, k, to the result array.
            qd[i++] = k;

            // Update the remainder.
            if (cmp && rem[0]) {
              rem[remL++] = xd[xi] || 0;
            } else {
              rem = [xd[xi]];
              remL = 1;
            }

          } while ((xi++ < xL || rem[0] !== void 0) && sd--);

          more = rem[0] !== void 0;
        }

        // Leading zero?
        if (!qd[0]) qd.shift();
      }

      // logBase is 1 when divide is being used for base conversion.
      if (logBase == 1) {
        q.e = e;
        inexact = more;
      } else {

        // To calculate q.e, first get the number of digits of qd[0].
        for (i = 1, k = qd[0]; k >= 10; k /= 10) i++;
        q.e = i + e * logBase - 1;

        finalise(q, dp ? pr + q.e + 1 : pr, rm, more);
      }

      return q;
    };
  })();


  /*
   * Round `x` to `sd` significant digits using rounding mode `rm`.
   * Check for over/under-flow.
   */
   function finalise(x, sd, rm, isTruncated) {
    var digits, i, j, k, rd, roundUp, w, xd, xdi,
      Ctor = x.constructor;

    // Don't round if sd is null or undefined.
    out: if (sd != null) {
      xd = x.d;

      // Infinity/NaN.
      if (!xd) return x;

      // rd: the rounding digit, i.e. the digit after the digit that may be rounded up.
      // w: the word of xd containing rd, a base 1e7 number.
      // xdi: the index of w within xd.
      // digits: the number of digits of w.
      // i: what would be the index of rd within w if all the numbers were 7 digits long (i.e. if
      // they had leading zeros)
      // j: if > 0, the actual index of rd within w (if < 0, rd is a leading zero).

      // Get the length of the first word of the digits array xd.
      for (digits = 1, k = xd[0]; k >= 10; k /= 10) digits++;
      i = sd - digits;

      // Is the rounding digit in the first word of xd?
      if (i < 0) {
        i += LOG_BASE;
        j = sd;
        w = xd[xdi = 0];

        // Get the rounding digit at index j of w.
        rd = w / mathpow(10, digits - j - 1) % 10 | 0;
      } else {
        xdi = Math.ceil((i + 1) / LOG_BASE);
        k = xd.length;
        if (xdi >= k) {
          if (isTruncated) {

            // Needed by `naturalExponential`, `naturalLogarithm` and `squareRoot`.
            for (; k++ <= xdi;) xd.push(0);
            w = rd = 0;
            digits = 1;
            i %= LOG_BASE;
            j = i - LOG_BASE + 1;
          } else {
            break out;
          }
        } else {
          w = k = xd[xdi];

          // Get the number of digits of w.
          for (digits = 1; k >= 10; k /= 10) digits++;

          // Get the index of rd within w.
          i %= LOG_BASE;

          // Get the index of rd within w, adjusted for leading zeros.
          // The number of leading zeros of w is given by LOG_BASE - digits.
          j = i - LOG_BASE + digits;

          // Get the rounding digit at index j of w.
          rd = j < 0 ? 0 : w / mathpow(10, digits - j - 1) % 10 | 0;
        }
      }

      // Are there any non-zero digits after the rounding digit?
      isTruncated = isTruncated || sd < 0 ||
        xd[xdi + 1] !== void 0 || (j < 0 ? w : w % mathpow(10, digits - j - 1));

      // The expression `w % mathpow(10, digits - j - 1)` returns all the digits of w to the right
      // of the digit at (left-to-right) index j, e.g. if w is 908714 and j is 2, the expression
      // will give 714.

      roundUp = rm < 4
        ? (rd || isTruncated) && (rm == 0 || rm == (x.s < 0 ? 3 : 2))
        : rd > 5 || rd == 5 && (rm == 4 || isTruncated || rm == 6 &&

          // Check whether the digit to the left of the rounding digit is odd.
          ((i > 0 ? j > 0 ? w / mathpow(10, digits - j) : 0 : xd[xdi - 1]) % 10) & 1 ||
            rm == (x.s < 0 ? 8 : 7));

      if (sd < 1 || !xd[0]) {
        xd.length = 0;
        if (roundUp) {

          // Convert sd to decimal places.
          sd -= x.e + 1;

          // 1, 0.1, 0.01, 0.001, 0.0001 etc.
          xd[0] = mathpow(10, (LOG_BASE - sd % LOG_BASE) % LOG_BASE);
          x.e = -sd || 0;
        } else {

          // Zero.
          xd[0] = x.e = 0;
        }

        return x;
      }

      // Remove excess digits.
      if (i == 0) {
        xd.length = xdi;
        k = 1;
        xdi--;
      } else {
        xd.length = xdi + 1;
        k = mathpow(10, LOG_BASE - i);

        // E.g. 56700 becomes 56000 if 7 is the rounding digit.
        // j > 0 means i > number of leading zeros of w.
        xd[xdi] = j > 0 ? (w / mathpow(10, digits - j) % mathpow(10, j) | 0) * k : 0;
      }

      if (roundUp) {
        for (;;) {

          // Is the digit to be rounded up in the first word of xd?
          if (xdi == 0) {

            // i will be the length of xd[0] before k is added.
            for (i = 1, j = xd[0]; j >= 10; j /= 10) i++;
            j = xd[0] += k;
            for (k = 1; j >= 10; j /= 10) k++;

            // if i != k the length has increased.
            if (i != k) {
              x.e++;
              if (xd[0] == BASE) xd[0] = 1;
            }

            break;
          } else {
            xd[xdi] += k;
            if (xd[xdi] != BASE) break;
            xd[xdi--] = 0;
            k = 1;
          }
        }
      }

      // Remove trailing zeros.
      for (i = xd.length; xd[--i] === 0;) xd.pop();
    }

    if (external) {

      // Overflow?
      if (x.e > Ctor.maxE) {

        // Infinity.
        x.d = null;
        x.e = NaN;

      // Underflow?
      } else if (x.e < Ctor.minE) {

        // Zero.
        x.e = 0;
        x.d = [0];
        // Ctor.underflow = true;
      } // else Ctor.underflow = false;
    }

    return x;
  }


  function finiteToString(x, isExp, sd) {
    if (!x.isFinite()) return nonFiniteToString(x);
    var k,
      e = x.e,
      str = digitsToString(x.d),
      len = str.length;

    if (isExp) {
      if (sd && (k = sd - len) > 0) {
        str = str.charAt(0) + '.' + str.slice(1) + getZeroString(k);
      } else if (len > 1) {
        str = str.charAt(0) + '.' + str.slice(1);
      }

      str = str + (x.e < 0 ? 'e' : 'e+') + x.e;
    } else if (e < 0) {
      str = '0.' + getZeroString(-e - 1) + str;
      if (sd && (k = sd - len) > 0) str += getZeroString(k);
    } else if (e >= len) {
      str += getZeroString(e + 1 - len);
      if (sd && (k = sd - e - 1) > 0) str = str + '.' + getZeroString(k);
    } else {
      if ((k = e + 1) < len) str = str.slice(0, k) + '.' + str.slice(k);
      if (sd && (k = sd - len) > 0) {
        if (e + 1 === len) str += '.';
        str += getZeroString(k);
      }
    }

    return str;
  }


  // Calculate the base 10 exponent from the base 1e7 exponent.
  function getBase10Exponent(digits, e) {
    var w = digits[0];

    // Add the number of digits of the first word of the digits array.
    for ( e *= LOG_BASE; w >= 10; w /= 10) e++;
    return e;
  }


  function getLn10(Ctor, sd, pr) {
    if (sd > LN10_PRECISION) {

      // Reset global state in case the exception is caught.
      external = true;
      if (pr) Ctor.precision = pr;
      throw Error(precisionLimitExceeded);
    }
    return finalise(new Ctor(LN10), sd, 1, true);
  }


  function getPi(Ctor, sd, rm) {
    if (sd > PI_PRECISION) throw Error(precisionLimitExceeded);
    return finalise(new Ctor(PI), sd, rm, true);
  }


  function getPrecision(digits) {
    var w = digits.length - 1,
      len = w * LOG_BASE + 1;

    w = digits[w];

    // If non-zero...
    if (w) {

      // Subtract the number of trailing zeros of the last word.
      for (; w % 10 == 0; w /= 10) len--;

      // Add the number of digits of the first word.
      for (w = digits[0]; w >= 10; w /= 10) len++;
    }

    return len;
  }


  function getZeroString(k) {
    var zs = '';
    for (; k--;) zs += '0';
    return zs;
  }


  /*
   * Return a new Decimal whose value is the value of Decimal `x` to the power `n`, where `n` is an
   * integer of type number.
   *
   * Implements 'exponentiation by squaring'. Called by `pow` and `parseOther`.
   *
   */
  function intPow(Ctor, x, n, pr) {
    var isTruncated,
      r = new Ctor(1),

      // Max n of 9007199254740991 takes 53 loop iterations.
      // Maximum digits array length; leaves [28, 34] guard digits.
      k = Math.ceil(pr / LOG_BASE + 4);

    external = false;

    for (;;) {
      if (n % 2) {
        r = r.times(x);
        if (truncate(r.d, k)) isTruncated = true;
      }

      n = mathfloor(n / 2);
      if (n === 0) {

        // To ensure correct rounding when r.d is truncated, increment the last word if it is zero.
        n = r.d.length - 1;
        if (isTruncated && r.d[n] === 0) ++r.d[n];
        break;
      }

      x = x.times(x);
      truncate(x.d, k);
    }

    external = true;

    return r;
  }


  function isOdd(n) {
    return n.d[n.d.length - 1] & 1;
  }


  /*
   * Handle `max` and `min`. `ltgt` is 'lt' or 'gt'.
   */
  function maxOrMin(Ctor, args, ltgt) {
    var y,
      x = new Ctor(args[0]),
      i = 0;

    for (; ++i < args.length;) {
      y = new Ctor(args[i]);
      if (!y.s) {
        x = y;
        break;
      } else if (x[ltgt](y)) {
        x = y;
      }
    }

    return x;
  }


  /*
   * Return a new Decimal whose value is the natural exponential of `x` rounded to `sd` significant
   * digits.
   *
   * Taylor/Maclaurin series.
   *
   * exp(x) = x^0/0! + x^1/1! + x^2/2! + x^3/3! + ...
   *
   * Argument reduction:
   *   Repeat x = x / 32, k += 5, until |x| < 0.1
   *   exp(x) = exp(x / 2^k)^(2^k)
   *
   * Previously, the argument was initially reduced by
   * exp(x) = exp(r) * 10^k  where r = x - k * ln10, k = floor(x / ln10)
   * to first put r in the range [0, ln10], before dividing by 32 until |x| < 0.1, but this was
   * found to be slower than just dividing repeatedly by 32 as above.
   *
   * Max integer argument: exp('20723265836946413') = 6.3e+9000000000000000
   * Min integer argument: exp('-20723265836946411') = 1.2e-9000000000000000
   * (Math object integer min/max: Math.exp(709) = 8.2e+307, Math.exp(-745) = 5e-324)
   *
   *  exp(Infinity)  = Infinity
   *  exp(-Infinity) = 0
   *  exp(NaN)       = NaN
   *  exp(±0)        = 1
   *
   *  exp(x) is non-terminating for any finite, non-zero x.
   *
   *  The result will always be correctly rounded.
   *
   */
  function naturalExponential(x, sd) {
    var denominator, guard, j, pow, sum, t, wpr,
      rep = 0,
      i = 0,
      k = 0,
      Ctor = x.constructor,
      rm = Ctor.rounding,
      pr = Ctor.precision;

    // 0/NaN/Infinity?
    if (!x.d || !x.d[0] || x.e > 17) {

      return new Ctor(x.d
        ? !x.d[0] ? 1 : x.s < 0 ? 0 : 1 / 0
        : x.s ? x.s < 0 ? 0 : x : 0 / 0);
    }

    if (sd == null) {
      external = false;
      wpr = pr;
    } else {
      wpr = sd;
    }

    t = new Ctor(0.03125);

    // while abs(x) >= 0.1
    while (x.e > -2) {

      // x = x / 2^5
      x = x.times(t);
      k += 5;
    }

    // Use 2 * log10(2^k) + 5 (empirically derived) to estimate the increase in precision
    // necessary to ensure the first 4 rounding digits are correct.
    guard = Math.log(mathpow(2, k)) / Math.LN10 * 2 + 5 | 0;
    wpr += guard;
    denominator = pow = sum = new Ctor(1);
    Ctor.precision = wpr;

    for (;;) {
      pow = finalise(pow.times(x), wpr, 1);
      denominator = denominator.times(++i);
      t = sum.plus(divide(pow, denominator, wpr, 1));

      if (digitsToString(t.d).slice(0, wpr) === digitsToString(sum.d).slice(0, wpr)) {
        j = k;
        while (j--) sum = finalise(sum.times(sum), wpr, 1);

        // Check to see if the first 4 rounding digits are [49]999.
        // If so, repeat the summation with a higher precision, otherwise
        // e.g. with precision: 18, rounding: 1
        // exp(18.404272462595034083567793919843761) = 98372560.1229999999 (should be 98372560.123)
        // `wpr - guard` is the index of first rounding digit.
        if (sd == null) {

          if (rep < 3 && checkRoundingDigits(sum.d, wpr - guard, rm, rep)) {
            Ctor.precision = wpr += 10;
            denominator = pow = t = new Ctor(1);
            i = 0;
            rep++;
          } else {
            return finalise(sum, Ctor.precision = pr, rm, external = true);
          }
        } else {
          Ctor.precision = pr;
          return sum;
        }
      }

      sum = t;
    }
  }


  /*
   * Return a new Decimal whose value is the natural logarithm of `x` rounded to `sd` significant
   * digits.
   *
   *  ln(-n)        = NaN
   *  ln(0)         = -Infinity
   *  ln(-0)        = -Infinity
   *  ln(1)         = 0
   *  ln(Infinity)  = Infinity
   *  ln(-Infinity) = NaN
   *  ln(NaN)       = NaN
   *
   *  ln(n) (n != 1) is non-terminating.
   *
   */
  function naturalLogarithm(y, sd) {
    var c, c0, denominator, e, numerator, rep, sum, t, wpr, x1, x2,
      n = 1,
      guard = 10,
      x = y,
      xd = x.d,
      Ctor = x.constructor,
      rm = Ctor.rounding,
      pr = Ctor.precision;

    // Is x negative or Infinity, NaN, 0 or 1?
    if (x.s < 0 || !xd || !xd[0] || !x.e && xd[0] == 1 && xd.length == 1) {
      return new Ctor(xd && !xd[0] ? -1 / 0 : x.s != 1 ? NaN : xd ? 0 : x);
    }

    if (sd == null) {
      external = false;
      wpr = pr;
    } else {
      wpr = sd;
    }

    Ctor.precision = wpr += guard;
    c = digitsToString(xd);
    c0 = c.charAt(0);

    if (Math.abs(e = x.e) < 1.5e15) {

      // Argument reduction.
      // The series converges faster the closer the argument is to 1, so using
      // ln(a^b) = b * ln(a),   ln(a) = ln(a^b) / b
      // multiply the argument by itself until the leading digits of the significand are 7, 8, 9,
      // 10, 11, 12 or 13, recording the number of multiplications so the sum of the series can
      // later be divided by this number, then separate out the power of 10 using
      // ln(a*10^b) = ln(a) + b*ln(10).

      // max n is 21 (gives 0.9, 1.0 or 1.1) (9e15 / 21 = 4.2e14).
      //while (c0 < 9 && c0 != 1 || c0 == 1 && c.charAt(1) > 1) {
      // max n is 6 (gives 0.7 - 1.3)
      while (c0 < 7 && c0 != 1 || c0 == 1 && c.charAt(1) > 3) {
        x = x.times(y);
        c = digitsToString(x.d);
        c0 = c.charAt(0);
        n++;
      }

      e = x.e;

      if (c0 > 1) {
        x = new Ctor('0.' + c);
        e++;
      } else {
        x = new Ctor(c0 + '.' + c.slice(1));
      }
    } else {

      // The argument reduction method above may result in overflow if the argument y is a massive
      // number with exponent >= 1500000000000000 (9e15 / 6 = 1.5e15), so instead recall this
      // function using ln(x*10^e) = ln(x) + e*ln(10).
      t = getLn10(Ctor, wpr + 2, pr).times(e + '');
      x = naturalLogarithm(new Ctor(c0 + '.' + c.slice(1)), wpr - guard).plus(t);
      Ctor.precision = pr;

      return sd == null ? finalise(x, pr, rm, external = true) : x;
    }

    // x1 is x reduced to a value near 1.
    x1 = x;

    // Taylor series.
    // ln(y) = ln((1 + x)/(1 - x)) = 2(x + x^3/3 + x^5/5 + x^7/7 + ...)
    // where x = (y - 1)/(y + 1)    (|x| < 1)
    sum = numerator = x = divide(x.minus(1), x.plus(1), wpr, 1);
    x2 = finalise(x.times(x), wpr, 1);
    denominator = 3;

    for (;;) {
      numerator = finalise(numerator.times(x2), wpr, 1);
      t = sum.plus(divide(numerator, new Ctor(denominator), wpr, 1));

      if (digitsToString(t.d).slice(0, wpr) === digitsToString(sum.d).slice(0, wpr)) {
        sum = sum.times(2);

        // Reverse the argument reduction. Check that e is not 0 because, besides preventing an
        // unnecessary calculation, -0 + 0 = +0 and to ensure correct rounding -0 needs to stay -0.
        if (e !== 0) sum = sum.plus(getLn10(Ctor, wpr + 2, pr).times(e + ''));
        sum = divide(sum, new Ctor(n), wpr, 1);

        // Is rm > 3 and the first 4 rounding digits 4999, or rm < 4 (or the summation has
        // been repeated previously) and the first 4 rounding digits 9999?
        // If so, restart the summation with a higher precision, otherwise
        // e.g. with precision: 12, rounding: 1
        // ln(135520028.6126091714265381533) = 18.7246299999 when it should be 18.72463.
        // `wpr - guard` is the index of first rounding digit.
        if (sd == null) {
          if (checkRoundingDigits(sum.d, wpr - guard, rm, rep)) {
            Ctor.precision = wpr += guard;
            t = numerator = x = divide(x1.minus(1), x1.plus(1), wpr, 1);
            x2 = finalise(x.times(x), wpr, 1);
            denominator = rep = 1;
          } else {
            return finalise(sum, Ctor.precision = pr, rm, external = true);
          }
        } else {
          Ctor.precision = pr;
          return sum;
        }
      }

      sum = t;
      denominator += 2;
    }
  }


  // ±Infinity, NaN.
  function nonFiniteToString(x) {
    // Unsigned.
    return String(x.s * x.s / 0);
  }


  /*
   * Parse the value of a new Decimal `x` from string `str`.
   */
  function parseDecimal(x, str) {
    var e, i, len;

    // Decimal point?
    if ((e = str.indexOf('.')) > -1) str = str.replace('.', '');

    // Exponential form?
    if ((i = str.search(/e/i)) > 0) {

      // Determine exponent.
      if (e < 0) e = i;
      e += +str.slice(i + 1);
      str = str.substring(0, i);
    } else if (e < 0) {

      // Integer.
      e = str.length;
    }

    // Determine leading zeros.
    for (i = 0; str.charCodeAt(i) === 48; i++);

    // Determine trailing zeros.
    for (len = str.length; str.charCodeAt(len - 1) === 48; --len);
    str = str.slice(i, len);

    if (str) {
      len -= i;
      x.e = e = e - i - 1;
      x.d = [];

      // Transform base

      // e is the base 10 exponent.
      // i is where to slice str to get the first word of the digits array.
      i = (e + 1) % LOG_BASE;
      if (e < 0) i += LOG_BASE;

      if (i < len) {
        if (i) x.d.push(+str.slice(0, i));
        for (len -= LOG_BASE; i < len;) x.d.push(+str.slice(i, i += LOG_BASE));
        str = str.slice(i);
        i = LOG_BASE - str.length;
      } else {
        i -= len;
      }

      for (; i--;) str += '0';
      x.d.push(+str);

      if (external) {

        // Overflow?
        if (x.e > x.constructor.maxE) {

          // Infinity.
          x.d = null;
          x.e = NaN;

        // Underflow?
        } else if (x.e < x.constructor.minE) {

          // Zero.
          x.e = 0;
          x.d = [0];
          // x.constructor.underflow = true;
        } // else x.constructor.underflow = false;
      }
    } else {

      // Zero.
      x.e = 0;
      x.d = [0];
    }

    return x;
  }


  /*
   * Parse the value of a new Decimal `x` from a string `str`, which is not a decimal value.
   */
  function parseOther(x, str) {
    var base, Ctor, divisor, i, isFloat, len, p, xd, xe;

    if (str === 'Infinity' || str === 'NaN') {
      if (!+str) x.s = NaN;
      x.e = NaN;
      x.d = null;
      return x;
    }

    if (isHex.test(str))  {
      base = 16;
      str = str.toLowerCase();
    } else if (isBinary.test(str))  {
      base = 2;
    } else if (isOctal.test(str))  {
      base = 8;
    } else {
      throw Error(invalidArgument + str);
    }

    // Is there a binary exponent part?
    i = str.search(/p/i);

    if (i > 0) {
      p = +str.slice(i + 1);
      str = str.substring(2, i);
    } else {
      str = str.slice(2);
    }

    // Convert `str` as an integer then divide the result by `base` raised to a power such that the
    // fraction part will be restored.
    i = str.indexOf('.');
    isFloat = i >= 0;
    Ctor = x.constructor;

    if (isFloat) {
      str = str.replace('.', '');
      len = str.length;
      i = len - i;

      // log[10](16) = 1.2041... , log[10](88) = 1.9444....
      divisor = intPow(Ctor, new Ctor(base), i, i * 2);
    }

    xd = convertBase(str, base, BASE);
    xe = xd.length - 1;

    // Remove trailing zeros.
    for (i = xe; xd[i] === 0; --i) xd.pop();
    if (i < 0) return new Ctor(x.s * 0);
    x.e = getBase10Exponent(xd, xe);
    x.d = xd;
    external = false;

    // At what precision to perform the division to ensure exact conversion?
    // maxDecimalIntegerPartDigitCount = ceil(log[10](b) * otherBaseIntegerPartDigitCount)
    // log[10](2) = 0.30103, log[10](8) = 0.90309, log[10](16) = 1.20412
    // E.g. ceil(1.2 * 3) = 4, so up to 4 decimal digits are needed to represent 3 hex int digits.
    // maxDecimalFractionPartDigitCount = {Hex:4|Oct:3|Bin:1} * otherBaseFractionPartDigitCount
    // Therefore using 4 * the number of digits of str will always be enough.
    if (isFloat) x = divide(x, divisor, len * 4);

    // Multiply by the binary exponent part if present.
    if (p) x = x.times(Math.abs(p) < 54 ? mathpow(2, p) : Decimal.pow(2, p));
    external = true;

    return x;
  }


  /*
   * sin(x) = x - x^3/3! + x^5/5! - ...
   * |x| < pi/2
   *
   */
  function sine(Ctor, x) {
    var k,
      len = x.d.length;

    if (len < 3) return taylorSeries(Ctor, 2, x, x);

    // Argument reduction: sin(5x) = 16*sin^5(x) - 20*sin^3(x) + 5*sin(x)
    // i.e. sin(x) = 16*sin^5(x/5) - 20*sin^3(x/5) + 5*sin(x/5)
    // and  sin(x) = sin(x/5)(5 + sin^2(x/5)(16sin^2(x/5) - 20))

    // Estimate the optimum number of times to use the argument reduction.
    k = 1.4 * Math.sqrt(len);
    k = k > 16 ? 16 : k | 0;

    x = x.times(1 / tinyPow(5, k));
    x = taylorSeries(Ctor, 2, x, x);

    // Reverse argument reduction
    var sin2_x,
      d5 = new Ctor(5),
      d16 = new Ctor(16),
      d20 = new Ctor(20);
    for (; k--;) {
      sin2_x = x.times(x);
      x = x.times(d5.plus(sin2_x.times(d16.times(sin2_x).minus(d20))));
    }

    return x;
  }


  // Calculate Taylor series for `cos`, `cosh`, `sin` and `sinh`.
  function taylorSeries(Ctor, n, x, y, isHyperbolic) {
    var j, t, u, x2,
      i = 1,
      pr = Ctor.precision,
      k = Math.ceil(pr / LOG_BASE);

    external = false;
    x2 = x.times(x);
    u = new Ctor(y);

    for (;;) {
      t = divide(u.times(x2), new Ctor(n++ * n++), pr, 1);
      u = isHyperbolic ? y.plus(t) : y.minus(t);
      y = divide(t.times(x2), new Ctor(n++ * n++), pr, 1);
      t = u.plus(y);

      if (t.d[k] !== void 0) {
        for (j = k; t.d[j] === u.d[j] && j--;);
        if (j == -1) break;
      }

      j = u;
      u = y;
      y = t;
      t = j;
      i++;
    }

    external = true;
    t.d.length = k + 1;

    return t;
  }


  // Exponent e must be positive and non-zero.
  function tinyPow(b, e) {
    var n = b;
    while (--e) n *= b;
    return n;
  }


  // Return the absolute value of `x` reduced to less than or equal to half pi.
  function toLessThanHalfPi(Ctor, x) {
    var t,
      isNeg = x.s < 0,
      pi = getPi(Ctor, Ctor.precision, 1),
      halfPi = pi.times(0.5);

    x = x.abs();

    if (x.lte(halfPi)) {
      quadrant = isNeg ? 4 : 1;
      return x;
    }

    t = x.divToInt(pi);

    if (t.isZero()) {
      quadrant = isNeg ? 3 : 2;
    } else {
      x = x.minus(t.times(pi));

      // 0 <= x < pi
      if (x.lte(halfPi)) {
        quadrant = isOdd(t) ? (isNeg ? 2 : 3) : (isNeg ? 4 : 1);
        return x;
      }

      quadrant = isOdd(t) ? (isNeg ? 1 : 4) : (isNeg ? 3 : 2);
    }

    return x.minus(pi).abs();
  }


  /*
   * Return the value of Decimal `x` as a string in base `baseOut`.
   *
   * If the optional `sd` argument is present include a binary exponent suffix.
   */
  function toStringBinary(x, baseOut, sd, rm) {
    var base, e, i, k, len, roundUp, str, xd, y,
      Ctor = x.constructor,
      isExp = sd !== void 0;

    if (isExp) {
      checkInt32(sd, 1, MAX_DIGITS);
      if (rm === void 0) rm = Ctor.rounding;
      else checkInt32(rm, 0, 8);
    } else {
      sd = Ctor.precision;
      rm = Ctor.rounding;
    }

    if (!x.isFinite()) {
      str = nonFiniteToString(x);
    } else {
      str = finiteToString(x);
      i = str.indexOf('.');

      // Use exponential notation according to `toExpPos` and `toExpNeg`? No, but if required:
      // maxBinaryExponent = floor((decimalExponent + 1) * log[2](10))
      // minBinaryExponent = floor(decimalExponent * log[2](10))
      // log[2](10) = 3.321928094887362347870319429489390175864

      if (isExp) {
        base = 2;
        if (baseOut == 16) {
          sd = sd * 4 - 3;
        } else if (baseOut == 8) {
          sd = sd * 3 - 2;
        }
      } else {
        base = baseOut;
      }

      // Convert the number as an integer then divide the result by its base raised to a power such
      // that the fraction part will be restored.

      // Non-integer.
      if (i >= 0) {
        str = str.replace('.', '');
        y = new Ctor(1);
        y.e = str.length - i;
        y.d = convertBase(finiteToString(y), 10, base);
        y.e = y.d.length;
      }

      xd = convertBase(str, 10, base);
      e = len = xd.length;

      // Remove trailing zeros.
      for (; xd[--len] == 0;) xd.pop();

      if (!xd[0]) {
        str = isExp ? '0p+0' : '0';
      } else {
        if (i < 0) {
          e--;
        } else {
          x = new Ctor(x);
          x.d = xd;
          x.e = e;
          x = divide(x, y, sd, rm, 0, base);
          xd = x.d;
          e = x.e;
          roundUp = inexact;
        }

        // The rounding digit, i.e. the digit after the digit that may be rounded up.
        i = xd[sd];
        k = base / 2;
        roundUp = roundUp || xd[sd + 1] !== void 0;

        roundUp = rm < 4
          ? (i !== void 0 || roundUp) && (rm === 0 || rm === (x.s < 0 ? 3 : 2))
          : i > k || i === k && (rm === 4 || roundUp || rm === 6 && xd[sd - 1] & 1 ||
            rm === (x.s < 0 ? 8 : 7));

        xd.length = sd;

        if (roundUp) {

          // Rounding up may mean the previous digit has to be rounded up and so on.
          for (; ++xd[--sd] > base - 1;) {
            xd[sd] = 0;
            if (!sd) {
              ++e;
              xd.unshift(1);
            }
          }
        }

        // Determine trailing zeros.
        for (len = xd.length; !xd[len - 1]; --len);

        // E.g. [4, 11, 15] becomes 4bf.
        for (i = 0, str = ''; i < len; i++) str += NUMERALS.charAt(xd[i]);

        // Add binary exponent suffix?
        if (isExp) {
          if (len > 1) {
            if (baseOut == 16 || baseOut == 8) {
              i = baseOut == 16 ? 4 : 3;
              for (--len; len % i; len++) str += '0';
              xd = convertBase(str, base, baseOut);
              for (len = xd.length; !xd[len - 1]; --len);

              // xd[0] will always be be 1
              for (i = 1, str = '1.'; i < len; i++) str += NUMERALS.charAt(xd[i]);
            } else {
              str = str.charAt(0) + '.' + str.slice(1);
            }
          }

          str =  str + (e < 0 ? 'p' : 'p+') + e;
        } else if (e < 0) {
          for (; ++e;) str = '0' + str;
          str = '0.' + str;
        } else {
          if (++e > len) for (e -= len; e-- ;) str += '0';
          else if (e < len) str = str.slice(0, e) + '.' + str.slice(e);
        }
      }

      str = (baseOut == 16 ? '0x' : baseOut == 2 ? '0b' : baseOut == 8 ? '0o' : '') + str;
    }

    return x.s < 0 ? '-' + str : str;
  }


  // Does not strip trailing zeros.
  function truncate(arr, len) {
    if (arr.length > len) {
      arr.length = len;
      return true;
    }
  }


  // Decimal methods


  /*
   *  abs
   *  acos
   *  acosh
   *  add
   *  asin
   *  asinh
   *  atan
   *  atanh
   *  atan2
   *  cbrt
   *  ceil
   *  clone
   *  config
   *  cos
   *  cosh
   *  div
   *  exp
   *  floor
   *  hypot
   *  ln
   *  log
   *  log2
   *  log10
   *  max
   *  min
   *  mod
   *  mul
   *  pow
   *  random
   *  round
   *  set
   *  sign
   *  sin
   *  sinh
   *  sqrt
   *  sub
   *  tan
   *  tanh
   *  trunc
   */


  /*
   * Return a new Decimal whose value is the absolute value of `x`.
   *
   * x {number|string|Decimal}
   *
   */
  function abs(x) {
    return new this(x).abs();
  }


  /*
   * Return a new Decimal whose value is the arccosine in radians of `x`.
   *
   * x {number|string|Decimal}
   *
   */
  function acos(x) {
    return new this(x).acos();
  }


  /*
   * Return a new Decimal whose value is the inverse of the hyperbolic cosine of `x`, rounded to
   * `precision` significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */
  function acosh(x) {
    return new this(x).acosh();
  }


  /*
   * Return a new Decimal whose value is the sum of `x` and `y`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   * y {number|string|Decimal}
   *
   */
  function add(x, y) {
    return new this(x).plus(y);
  }


  /*
   * Return a new Decimal whose value is the arcsine in radians of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   *
   */
  function asin(x) {
    return new this(x).asin();
  }


  /*
   * Return a new Decimal whose value is the inverse of the hyperbolic sine of `x`, rounded to
   * `precision` significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */
  function asinh(x) {
    return new this(x).asinh();
  }


  /*
   * Return a new Decimal whose value is the arctangent in radians of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   *
   */
  function atan(x) {
    return new this(x).atan();
  }


  /*
   * Return a new Decimal whose value is the inverse of the hyperbolic tangent of `x`, rounded to
   * `precision` significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */
  function atanh(x) {
    return new this(x).atanh();
  }


  /*
   * Return a new Decimal whose value is the arctangent in radians of `y/x` in the range -pi to pi
   * (inclusive), rounded to `precision` significant digits using rounding mode `rounding`.
   *
   * Domain: [-Infinity, Infinity]
   * Range: [-pi, pi]
   *
   * y {number|string|Decimal} The y-coordinate.
   * x {number|string|Decimal} The x-coordinate.
   *
   * atan2(±0, -0)               = ±pi
   * atan2(±0, +0)               = ±0
   * atan2(±0, -x)               = ±pi for x > 0
   * atan2(±0, x)                = ±0 for x > 0
   * atan2(-y, ±0)               = -pi/2 for y > 0
   * atan2(y, ±0)                = pi/2 for y > 0
   * atan2(±y, -Infinity)        = ±pi for finite y > 0
   * atan2(±y, +Infinity)        = ±0 for finite y > 0
   * atan2(±Infinity, x)         = ±pi/2 for finite x
   * atan2(±Infinity, -Infinity) = ±3*pi/4
   * atan2(±Infinity, +Infinity) = ±pi/4
   * atan2(NaN, x) = NaN
   * atan2(y, NaN) = NaN
   *
   */
  function atan2(y, x) {
    y = new this(y);
    x = new this(x);
    var r,
      pr = this.precision,
      rm = this.rounding,
      wpr = pr + 4;

    // Either NaN
    if (!y.s || !x.s) {
      r = new this(NaN);

    // Both ±Infinity
    } else if (!y.d && !x.d) {
      r = getPi(this, wpr, 1).times(x.s > 0 ? 0.25 : 0.75);
      r.s = y.s;

    // x is ±Infinity or y is ±0
    } else if (!x.d || y.isZero()) {
      r = x.s < 0 ? getPi(this, pr, rm) : new this(0);
      r.s = y.s;

    // y is ±Infinity or x is ±0
    } else if (!y.d || x.isZero()) {
      r = getPi(this, wpr, 1).times(0.5);
      r.s = y.s;

    // Both non-zero and finite
    } else if (x.s < 0) {
      this.precision = wpr;
      this.rounding = 1;
      r = this.atan(divide(y, x, wpr, 1));
      x = getPi(this, wpr, 1);
      this.precision = pr;
      this.rounding = rm;
      r = y.s < 0 ? r.minus(x) : r.plus(x);
    } else {
      r = this.atan(divide(y, x, wpr, 1));
    }

    return r;
  }


  /*
   * Return a new Decimal whose value is the cube root of `x`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   *
   */
  function cbrt(x) {
    return new this(x).cbrt();
  }


  /*
   * Return a new Decimal whose value is `x` rounded to an integer using `ROUND_CEIL`.
   *
   * x {number|string|Decimal}
   *
   */
  function ceil(x) {
    return finalise(x = new this(x), x.e + 1, 2);
  }


  /*
   * Configure global settings for a Decimal constructor.
   *
   * `obj` is an object with one or more of the following properties,
   *
   *   precision  {number}
   *   rounding   {number}
   *   toExpNeg   {number}
   *   toExpPos   {number}
   *   maxE       {number}
   *   minE       {number}
   *   modulo     {number}
   *   crypto     {boolean|number}
   *   defaults   {true}
   *
   * E.g. Decimal.config({ precision: 20, rounding: 4 })
   *
   */
  function config(obj) {
    if (!obj || typeof obj !== 'object') throw Error(decimalError + 'Object expected');
    var i, p, v,
      useDefaults = obj.defaults === true,
      ps = [
        'precision', 1, MAX_DIGITS,
        'rounding', 0, 8,
        'toExpNeg', -EXP_LIMIT, 0,
        'toExpPos', 0, EXP_LIMIT,
        'maxE', 0, EXP_LIMIT,
        'minE', -EXP_LIMIT, 0,
        'modulo', 0, 9
      ];

    for (i = 0; i < ps.length; i += 3) {
      if (p = ps[i], useDefaults) this[p] = DEFAULTS[p];
      if ((v = obj[p]) !== void 0) {
        if (mathfloor(v) === v && v >= ps[i + 1] && v <= ps[i + 2]) this[p] = v;
        else throw Error(invalidArgument + p + ': ' + v);
      }
    }

    if (p = 'crypto', useDefaults) this[p] = DEFAULTS[p];
    if ((v = obj[p]) !== void 0) {
      if (v === true || v === false || v === 0 || v === 1) {
        if (v) {
          if (typeof crypto != 'undefined' && crypto &&
            (crypto.getRandomValues || crypto.randomBytes)) {
            this[p] = true;
          } else {
            throw Error(cryptoUnavailable);
          }
        } else {
          this[p] = false;
        }
      } else {
        throw Error(invalidArgument + p + ': ' + v);
      }
    }

    return this;
  }


  /*
   * Return a new Decimal whose value is the cosine of `x`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */
  function cos(x) {
    return new this(x).cos();
  }


  /*
   * Return a new Decimal whose value is the hyperbolic cosine of `x`, rounded to precision
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */
  function cosh(x) {
    return new this(x).cosh();
  }


  /*
   * Create and return a Decimal constructor with the same configuration properties as this Decimal
   * constructor.
   *
   */
  function clone(obj) {
    var i, p, ps;

    /*
     * The Decimal constructor and exported function.
     * Return a new Decimal instance.
     *
     * v {number|string|Decimal} A numeric value.
     *
     */
    function Decimal(v) {
      var e, i, t,
        x = this;

      // Decimal called without new.
      if (!(x instanceof Decimal)) return new Decimal(v);

      // Retain a reference to this Decimal constructor, and shadow Decimal.prototype.constructor
      // which points to Object.
      x.constructor = Decimal;

      // Duplicate.
      if (v instanceof Decimal) {
        x.s = v.s;

        if (external) {
          if (!v.d || v.e > Decimal.maxE) {

            // Infinity.
            x.e = NaN;
            x.d = null;
          } else if (v.e < Decimal.minE) {

            // Zero.
            x.e = 0;
            x.d = [0];
          } else {
            x.e = v.e;
            x.d = v.d.slice();
          }
        } else {
          x.e = v.e;
          x.d = v.d ? v.d.slice() : v.d;
        }

        return;
      }

      t = typeof v;

      if (t === 'number') {
        if (v === 0) {
          x.s = 1 / v < 0 ? -1 : 1;
          x.e = 0;
          x.d = [0];
          return;
        }

        if (v < 0) {
          v = -v;
          x.s = -1;
        } else {
          x.s = 1;
        }

        // Fast path for small integers.
        if (v === ~~v && v < 1e7) {
          for (e = 0, i = v; i >= 10; i /= 10) e++;

          if (external) {
            if (e > Decimal.maxE) {
              x.e = NaN;
              x.d = null;
            } else if (e < Decimal.minE) {
              x.e = 0;
              x.d = [0];
            } else {
              x.e = e;
              x.d = [v];
            }
          } else {
            x.e = e;
            x.d = [v];
          }

          return;

        // Infinity, NaN.
        } else if (v * 0 !== 0) {
          if (!v) x.s = NaN;
          x.e = NaN;
          x.d = null;
          return;
        }

        return parseDecimal(x, v.toString());

      } else if (t !== 'string') {
        throw Error(invalidArgument + v);
      }

      // Minus sign?
      if ((i = v.charCodeAt(0)) === 45) {
        v = v.slice(1);
        x.s = -1;
      } else {
        // Plus sign?
        if (i === 43) v = v.slice(1);
        x.s = 1;
      }

      return isDecimal.test(v) ? parseDecimal(x, v) : parseOther(x, v);
    }

    Decimal.prototype = P;

    Decimal.ROUND_UP = 0;
    Decimal.ROUND_DOWN = 1;
    Decimal.ROUND_CEIL = 2;
    Decimal.ROUND_FLOOR = 3;
    Decimal.ROUND_HALF_UP = 4;
    Decimal.ROUND_HALF_DOWN = 5;
    Decimal.ROUND_HALF_EVEN = 6;
    Decimal.ROUND_HALF_CEIL = 7;
    Decimal.ROUND_HALF_FLOOR = 8;
    Decimal.EUCLID = 9;

    Decimal.config = Decimal.set = config;
    Decimal.clone = clone;
    Decimal.isDecimal = isDecimalInstance;

    Decimal.abs = abs;
    Decimal.acos = acos;
    Decimal.acosh = acosh;        // ES6
    Decimal.add = add;
    Decimal.asin = asin;
    Decimal.asinh = asinh;        // ES6
    Decimal.atan = atan;
    Decimal.atanh = atanh;        // ES6
    Decimal.atan2 = atan2;
    Decimal.cbrt = cbrt;          // ES6
    Decimal.ceil = ceil;
    Decimal.cos = cos;
    Decimal.cosh = cosh;          // ES6
    Decimal.div = div;
    Decimal.exp = exp;
    Decimal.floor = floor;
    Decimal.hypot = hypot;        // ES6
    Decimal.ln = ln;
    Decimal.log = log;
    Decimal.log10 = log10;        // ES6
    Decimal.log2 = log2;          // ES6
    Decimal.max = max;
    Decimal.min = min;
    Decimal.mod = mod;
    Decimal.mul = mul;
    Decimal.pow = pow;
    Decimal.random = random;
    Decimal.round = round;
    Decimal.sign = sign;          // ES6
    Decimal.sin = sin;
    Decimal.sinh = sinh;          // ES6
    Decimal.sqrt = sqrt;
    Decimal.sub = sub;
    Decimal.tan = tan;
    Decimal.tanh = tanh;          // ES6
    Decimal.trunc = trunc;        // ES6

    if (obj === void 0) obj = {};
    if (obj) {
      if (obj.defaults !== true) {
        ps = ['precision', 'rounding', 'toExpNeg', 'toExpPos', 'maxE', 'minE', 'modulo', 'crypto'];
        for (i = 0; i < ps.length;) if (!obj.hasOwnProperty(p = ps[i++])) obj[p] = this[p];
      }
    }

    Decimal.config(obj);

    return Decimal;
  }


  /*
   * Return a new Decimal whose value is `x` divided by `y`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   * y {number|string|Decimal}
   *
   */
  function div(x, y) {
    return new this(x).div(y);
  }


  /*
   * Return a new Decimal whose value is the natural exponential of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} The power to which to raise the base of the natural log.
   *
   */
  function exp(x) {
    return new this(x).exp();
  }


  /*
   * Return a new Decimal whose value is `x` round to an integer using `ROUND_FLOOR`.
   *
   * x {number|string|Decimal}
   *
   */
  function floor(x) {
    return finalise(x = new this(x), x.e + 1, 3);
  }


  /*
   * Return a new Decimal whose value is the square root of the sum of the squares of the arguments,
   * rounded to `precision` significant digits using rounding mode `rounding`.
   *
   * hypot(a, b, ...) = sqrt(a^2 + b^2 + ...)
   *
   * arguments {number|string|Decimal}
   *
   */
  function hypot() {
    var i, n,
      t = new this(0);

    external = false;

    for (i = 0; i < arguments.length;) {
      n = new this(arguments[i++]);
      if (!n.d) {
        if (n.s) {
          external = true;
          return new this(1 / 0);
        }
        t = n;
      } else if (t.d) {
        t = t.plus(n.times(n));
      }
    }

    external = true;

    return t.sqrt();
  }


  /*
   * Return true if object is a Decimal instance (where Decimal is any Decimal constructor),
   * otherwise return false.
   *
   */
  function isDecimalInstance(obj) {
    return obj instanceof Decimal || obj && obj.name === '[object Decimal]' || false;
  }


  /*
   * Return a new Decimal whose value is the natural logarithm of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   *
   */
  function ln(x) {
    return new this(x).ln();
  }


  /*
   * Return a new Decimal whose value is the log of `x` to the base `y`, or to base 10 if no base
   * is specified, rounded to `precision` significant digits using rounding mode `rounding`.
   *
   * log[y](x)
   *
   * x {number|string|Decimal} The argument of the logarithm.
   * y {number|string|Decimal} The base of the logarithm.
   *
   */
  function log(x, y) {
    return new this(x).log(y);
  }


  /*
   * Return a new Decimal whose value is the base 2 logarithm of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   *
   */
  function log2(x) {
    return new this(x).log(2);
  }


  /*
   * Return a new Decimal whose value is the base 10 logarithm of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   *
   */
  function log10(x) {
    return new this(x).log(10);
  }


  /*
   * Return a new Decimal whose value is the maximum of the arguments.
   *
   * arguments {number|string|Decimal}
   *
   */
  function max() {
    return maxOrMin(this, arguments, 'lt');
  }


  /*
   * Return a new Decimal whose value is the minimum of the arguments.
   *
   * arguments {number|string|Decimal}
   *
   */
  function min() {
    return maxOrMin(this, arguments, 'gt');
  }


  /*
   * Return a new Decimal whose value is `x` modulo `y`, rounded to `precision` significant digits
   * using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   * y {number|string|Decimal}
   *
   */
  function mod(x, y) {
    return new this(x).mod(y);
  }


  /*
   * Return a new Decimal whose value is `x` multiplied by `y`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   * y {number|string|Decimal}
   *
   */
  function mul(x, y) {
    return new this(x).mul(y);
  }


  /*
   * Return a new Decimal whose value is `x` raised to the power `y`, rounded to precision
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} The base.
   * y {number|string|Decimal} The exponent.
   *
   */
  function pow(x, y) {
    return new this(x).pow(y);
  }


  /*
   * Returns a new Decimal with a random value equal to or greater than 0 and less than 1, and with
   * `sd`, or `Decimal.precision` if `sd` is omitted, significant digits (or less if trailing zeros
   * are produced).
   *
   * [sd] {number} Significant digits. Integer, 0 to MAX_DIGITS inclusive.
   *
   */
  function random(sd) {
    var d, e, k, n,
      i = 0,
      r = new this(1),
      rd = [];

    if (sd === void 0) sd = this.precision;
    else checkInt32(sd, 1, MAX_DIGITS);

    k = Math.ceil(sd / LOG_BASE);

    if (!this.crypto) {
      for (; i < k;) rd[i++] = Math.random() * 1e7 | 0;

    // Browsers supporting crypto.getRandomValues.
    } else if (crypto.getRandomValues) {
      d = crypto.getRandomValues(new Uint32Array(k));

      for (; i < k;) {
        n = d[i];

        // 0 <= n < 4294967296
        // Probability n >= 4.29e9, is 4967296 / 4294967296 = 0.00116 (1 in 865).
        if (n >= 4.29e9) {
          d[i] = crypto.getRandomValues(new Uint32Array(1))[0];
        } else {

          // 0 <= n <= 4289999999
          // 0 <= (n % 1e7) <= 9999999
          rd[i++] = n % 1e7;
        }
      }

    // Node.js supporting crypto.randomBytes.
    } else if (crypto.randomBytes) {

      // buffer
      d = crypto.randomBytes(k *= 4);

      for (; i < k;) {

        // 0 <= n < 2147483648
        n = d[i] + (d[i + 1] << 8) + (d[i + 2] << 16) + ((d[i + 3] & 0x7f) << 24);

        // Probability n >= 2.14e9, is 7483648 / 2147483648 = 0.0035 (1 in 286).
        if (n >= 2.14e9) {
          crypto.randomBytes(4).copy(d, i);
        } else {

          // 0 <= n <= 2139999999
          // 0 <= (n % 1e7) <= 9999999
          rd.push(n % 1e7);
          i += 4;
        }
      }

      i = k / 4;
    } else {
      throw Error(cryptoUnavailable);
    }

    k = rd[--i];
    sd %= LOG_BASE;

    // Convert trailing digits to zeros according to sd.
    if (k && sd) {
      n = mathpow(10, LOG_BASE - sd);
      rd[i] = (k / n | 0) * n;
    }

    // Remove trailing words which are zero.
    for (; rd[i] === 0; i--) rd.pop();

    // Zero?
    if (i < 0) {
      e = 0;
      rd = [0];
    } else {
      e = -1;

      // Remove leading words which are zero and adjust exponent accordingly.
      for (; rd[0] === 0; e -= LOG_BASE) rd.shift();

      // Count the digits of the first word of rd to determine leading zeros.
      for (k = 1, n = rd[0]; n >= 10; n /= 10) k++;

      // Adjust the exponent for leading zeros of the first word of rd.
      if (k < LOG_BASE) e -= LOG_BASE - k;
    }

    r.e = e;
    r.d = rd;

    return r;
  }


  /*
   * Return a new Decimal whose value is `x` rounded to an integer using rounding mode `rounding`.
   *
   * To emulate `Math.round`, set rounding to 7 (ROUND_HALF_CEIL).
   *
   * x {number|string|Decimal}
   *
   */
  function round(x) {
    return finalise(x = new this(x), x.e + 1, this.rounding);
  }


  /*
   * Return
   *   1    if x > 0,
   *  -1    if x < 0,
   *   0    if x is 0,
   *  -0    if x is -0,
   *   NaN  otherwise
   *
   * x {number|string|Decimal}
   *
   */
  function sign(x) {
    x = new this(x);
    return x.d ? (x.d[0] ? x.s : 0 * x.s) : x.s || NaN;
  }


  /*
   * Return a new Decimal whose value is the sine of `x`, rounded to `precision` significant digits
   * using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */
  function sin(x) {
    return new this(x).sin();
  }


  /*
   * Return a new Decimal whose value is the hyperbolic sine of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */
  function sinh(x) {
    return new this(x).sinh();
  }


  /*
   * Return a new Decimal whose value is the square root of `x`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   *
   */
  function sqrt(x) {
    return new this(x).sqrt();
  }


  /*
   * Return a new Decimal whose value is `x` minus `y`, rounded to `precision` significant digits
   * using rounding mode `rounding`.
   *
   * x {number|string|Decimal}
   * y {number|string|Decimal}
   *
   */
  function sub(x, y) {
    return new this(x).sub(y);
  }


  /*
   * Return a new Decimal whose value is the tangent of `x`, rounded to `precision` significant
   * digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */
  function tan(x) {
    return new this(x).tan();
  }


  /*
   * Return a new Decimal whose value is the hyperbolic tangent of `x`, rounded to `precision`
   * significant digits using rounding mode `rounding`.
   *
   * x {number|string|Decimal} A value in radians.
   *
   */
  function tanh(x) {
    return new this(x).tanh();
  }


  /*
   * Return a new Decimal whose value is `x` truncated to an integer.
   *
   * x {number|string|Decimal}
   *
   */
  function trunc(x) {
    return finalise(x = new this(x), x.e + 1, 1);
  }


  // Create and configure initial Decimal constructor.
  Decimal = clone(DEFAULTS);

  Decimal['default'] = Decimal.Decimal = Decimal;

  // Create the internal constants from their string values.
  LN10 = new Decimal(LN10);
  PI = new Decimal(PI);


  // Export.


  // AMD.
  if (typeof define == 'function' && define.amd) {
    define(function () {
      return Decimal;
    });

  // Node and other environments that support module.exports.
  } else if (typeof module != 'undefined' && module.exports) {
    if (typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol') {
      P[Symbol.for('nodejs.util.inspect.custom')] = P.toString;
      P[Symbol.toStringTag] = 'Decimal';
    }

    module.exports = Decimal;

  // Browser.
  } else {
    if (!globalScope) {
      globalScope = typeof self != 'undefined' && self && self.self == self ? self : window;
    }

    noConflict = globalScope.Decimal;
    Decimal.noConflict = function () {
      globalScope.Decimal = noConflict;
      return Decimal;
    };

    globalScope.Decimal = Decimal;
  }
})(this);

},{}],5:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],"e001":[function(require,module,exports){
var problem;

module.exports = problem = new Problem(`
Problem 1: Multiples of 3 and 5
-------------------------------

If we list all the natural numbers below 10 that are multiples of 3 or 5, we get 3, 5, 6 and 9.
The sum of these multiples is 23.

Find the sum of all the multiples of 3 or 5 below 1000.
`);

problem.test = function() {
  var i, j, sum;
  sum = 0;
  for (i = j = 1; j < 10; i = ++j) {
    if ((i % 3 === 0) || (i % 5 === 0)) {
      sum += i;
    }
  }
  return equal(sum, 23, `Sum of natural numbers < 10: ${sum}`);
};

problem.answer = function() {
  var i, j, sum;
  sum = 0;
  for (i = j = 1; j < 1000; i = ++j) {
    if ((i % 3 === 0) || (i % 5 === 0)) {
      sum += i;
    }
  }
  return sum;
};


},{}],"e002":[function(require,module,exports){
var problem;

module.exports = problem = new Problem(`
Problem 2: Even Fibonacci numbers
---------------------------------

Each new term in the Fibonacci sequence is generated by adding the previous two terms.
By starting with 1 and 2, the first 10 terms will be:

1, 2, 3, 5, 8, 13, 21, 34, 55, 89, ...

By considering the terms in the Fibonacci sequence whose values do not exceed four million,
find the sum of the even-valued terms.
`);

problem.answer = function() {
  var curr, next, prev, sum;
  prev = 1;
  curr = 1;
  sum = 0;
  while (curr < 4000000) {
    if ((curr % 2) === 0) {
      sum += curr;
    }
    next = curr + prev;
    prev = curr;
    curr = next;
  }
  return sum;
};


},{}],"e003":[function(require,module,exports){
var isPrime, largestPrimeFactor, leastFactor, primeFactors, problem;

module.exports = problem = new Problem(`
Problem 3: Largest prime factor
-------------------------------

The prime factors of 13195 are 5, 7, 13 and 29.

What is the largest prime factor of the number 600851475143 ?
`);

// -----------------------------------------------------------------------------------
// Shamelessly pilfered/adopted from http://www.javascripter.net/faq/numberisprime.htm
leastFactor = function(n) {
  var i, j, m, ref;
  if (isNaN(n) || !isFinite(n)) {
    return 0/0;
  }
  if (n === 0) {
    return 0;
  }
  if ((n % 1) !== 0 || (n * n) < 2) {
    return 1;
  }
  if ((n % 2) === 0) {
    return 2;
  }
  if ((n % 3) === 0) {
    return 3;
  }
  if ((n % 5) === 0) {
    return 5;
  }
  m = Math.sqrt(n);
  for (i = j = 7, ref = m; j <= ref; i = j += 30) {
    if ((n % i) === 0) {
      return i;
    }
    if ((n % (i + 4)) === 0) {
      return i + 4;
    }
    if ((n % (i + 6)) === 0) {
      return i + 6;
    }
    if ((n % (i + 10)) === 0) {
      return i + 10;
    }
    if ((n % (i + 12)) === 0) {
      return i + 12;
    }
    if ((n % (i + 16)) === 0) {
      return i + 16;
    }
    if ((n % (i + 22)) === 0) {
      return i + 22;
    }
    if ((n % (i + 24)) === 0) {
      return i + 24;
    }
  }
  return n;
};

isPrime = function(n) {
  if (isNaN(n) || !isFinite(n) || (n % 1) !== 0 || (n < 2)) {
    return false;
  }
  if (n === leastFactor(n)) {
    return true;
  }
  return false;
};

// -----------------------------------------------------------------------------------
primeFactors = function(n) {
  var factor, factors;
  if (n === 1) {
    return [1];
  }
  factors = [];
  while (!isPrime(n)) {
    factor = leastFactor(n);
    factors.push(factor);
    n /= factor;
  }
  factors.push(n);
  return factors;
};

largestPrimeFactor = function(n) {
  var factor;
  if (n === 1) {
    return 1;
  }
  while (!isPrime(n)) {
    factor = leastFactor(n);
    n /= factor;
  }
  return n;
};

problem.answer = function() {
  return largestPrimeFactor(600851475143);
};


},{}],"e004":[function(require,module,exports){
var isPalindrome, problem;

module.exports = problem = new Problem(`
Problem 4: Largest palindrome product
-------------------------------------

A palindromic number reads the same both ways.

Find the largest palindrome made from the product of two 3-digit numbers.
`);

isPalindrome = function(n) {
  var i, k, ref, str;
  str = n.toString();
  for (i = k = 0, ref = str.length / 2; (0 <= ref ? k < ref : k > ref); i = 0 <= ref ? ++k : --k) {
    if (str[i] !== str[str.length - 1 - i]) {
      return false;
    }
  }
  return true;
};

problem.test = function() {
  var k, l, len, len1, ref, ref1, results, v;
  ref = [1, 11, 121, 1221, 12321, 1234321];
  // Make sure isPalindrome works properly first
  for (k = 0, len = ref.length; k < len; k++) {
    v = ref[k];
    equal(isPalindrome(v), true, `isPalindrome(${v}) returns true`);
  }
  ref1 = [12, 123, 1234, 12345, 123456, 12324];
  results = [];
  for (l = 0, len1 = ref1.length; l < len1; l++) {
    v = ref1[l];
    results.push(equal(isPalindrome(v), false, `isPalindrome(${v}) returns false`));
  }
  return results;
};

problem.answer = function() {
  var i, j, k, l, largesti, largestj, largestp, product;
  largesti = 0;
  largestj = 0;
  largestp = 0;
  for (i = k = 100; k <= 999; i = ++k) {
    for (j = l = 100; l <= 999; j = ++l) {
      product = i * j;
      if (isPalindrome(product) && (product > largestp)) {
        largesti = i;
        largestj = j;
        largestp = product;
      }
    }
  }
  return largestp;
};


},{}],"e005":[function(require,module,exports){
var problem;

module.exports = problem = new Problem(`
Problem 5: Smallest multiple
----------------------------

2520 is the smallest number that can be divided by each of the numbers from 1 to 10 without any remainder.

What is the smallest positive number that is evenly divisible by all of the numbers from 1 to 20?
`);

problem.answer = function() {
  var found, i, j, n;
  n = 0;
  while (true) {
    n += 20; // Probably could be some clever sum of primes between 1-20 or something. I don't care.
    found = true;
    for (i = j = 1; j <= 20; i = ++j) {
      if ((n % i) !== 0) {
        found = false;
        break;
      }
    }
    if (found) {
      break;
    }
  }
  return n;
};


},{}],"e006":[function(require,module,exports){
var differenceSumSquares, problem, squareOfSum, sumOfSquares;

module.exports = problem = new Problem(`
Problem 6: Sum square difference
--------------------------------

The sum of the squares of the first ten natural numbers is,

             1^2 + 2^2 + ... + 10^2 = 385

The square of the sum of the first ten natural numbers is,

          (1 + 2 + ... + 10)^2 = 55^2 = 3025

Hence the difference between the sum of the squares of the first ten natural numbers and the square of the sum is 3025 − 385 = 2640.

Find the difference between the sum of the squares of the first one hundred natural numbers and the square of the sum.
`);

sumOfSquares = function(n) {
  var i, j, ref, sum;
  sum = 0;
  for (i = j = 1, ref = n; (1 <= ref ? j <= ref : j >= ref); i = 1 <= ref ? ++j : --j) {
    sum += i * i;
  }
  return sum;
};

squareOfSum = function(n) {
  var i, j, ref, sum;
  sum = 0;
  for (i = j = 1, ref = n; (1 <= ref ? j <= ref : j >= ref); i = 1 <= ref ? ++j : --j) {
    sum += i;
  }
  return sum * sum;
};

differenceSumSquares = function(n) {
  return squareOfSum(n) - sumOfSquares(n);
};

problem.test = function() {
  equal(sumOfSquares(10), 385, "Sum of squares of first ten natural numbers is 385");
  equal(squareOfSum(10), 3025, "Square of sum of first ten natural numbers is 3025");
  return equal(differenceSumSquares(10), 2640, "Difference in values for the first ten natural numbers is 2640");
};

problem.answer = function() {
  return differenceSumSquares(100);
};


},{}],"e007":[function(require,module,exports){
var math, nthPrime, problem;

module.exports = problem = new Problem(`
Problem 7: 10001st prime
------------------------

By listing the first six prime numbers: 2, 3, 5, 7, 11, and 13, we can see that the 6th prime is 13.

What is the 10,001st prime number?
`);

math = require("math");

nthPrime = function(n) {
  var i, j, ref, sieve;
  sieve = new math.IncrementalSieve();
  for (i = j = 1, ref = n; (1 <= ref ? j < ref : j > ref); i = 1 <= ref ? ++j : --j) {
    sieve.next();
  }
  return sieve.next();
};

problem.test = function() {
  return equal(nthPrime(6), 13, "6th prime is 13");
};

problem.answer = function() {
  return nthPrime(10001);
};


},{"math":"math"}],"e008":[function(require,module,exports){
var digit, digits, largestProduct, problem, str;

module.exports = problem = new Problem(`
Problem 8: Largest product in a series
--------------------------------------

The four adjacent digits in the 1000-digit number that have the greatest product are 9 x 9 x 8 x 9 = 5832.

  73167176531330624919225119674426574742355349194934
  96983520312774506326239578318016984801869478851843
  85861560789112949495459501737958331952853208805511
  12540698747158523863050715693290963295227443043557
  66896648950445244523161731856403098711121722383113
  62229893423380308135336276614282806444486645238749
  30358907296290491560440772390713810515859307960866
  70172427121883998797908792274921901699720888093776
  65727333001053367881220235421809751254540594752243
  52584907711670556013604839586446706324415722155397
  53697817977846174064955149290862569321978468622482
  83972241375657056057490261407972968652414535100474
  82166370484403199890008895243450658541227588666881
  16427171479924442928230863465674813919123162824586
  17866458359124566529476545682848912883142607690042
  24219022671055626321111109370544217506941658960408
  07198403850962455444362981230987879927244284909188
  84580156166097919133875499200524063689912560717606
  05886116467109405077541002256983155200055935729725
  71636269561882670428252483600823257530420752963450

Find the thirteen adjacent digits in the 1000-digit number that have the greatest product. What is the value of this product?
`);

str = `73167176531330624919225119674426574742355349194934
96983520312774506326239578318016984801869478851843
85861560789112949495459501737958331952853208805511
12540698747158523863050715693290963295227443043557
66896648950445244523161731856403098711121722383113
62229893423380308135336276614282806444486645238749
30358907296290491560440772390713810515859307960866
70172427121883998797908792274921901699720888093776
65727333001053367881220235421809751254540594752243
52584907711670556013604839586446706324415722155397
53697817977846174064955149290862569321978468622482
83972241375657056057490261407972968652414535100474
82166370484403199890008895243450658541227588666881
16427171479924442928230863465674813919123162824586
17866458359124566529476545682848912883142607690042
24219022671055626321111109370544217506941658960408
07198403850962455444362981230987879927244284909188
84580156166097919133875499200524063689912560717606
05886116467109405077541002256983155200055935729725
71636269561882670428252483600823257530420752963450`;

str = str.replace(/[^0-9]/gm, "");

digits = (function() {
  var j, len, results;
  results = [];
  for (j = 0, len = str.length; j < len; j++) {
    digit = str[j];
    results.push(parseInt(digit));
  }
  return results;
})();

largestProduct = function(digitCount) {
  var end, i, j, k, largest, product, ref, ref1, ref2, start;
  if (digitCount > digits.length) {
    return 0;
  }
  largest = 0;
  for (start = j = 0, ref = digits.length - digitCount; (0 <= ref ? j <= ref : j >= ref); start = 0 <= ref ? ++j : --j) {
    end = start + digitCount;
    product = 1;
    for (i = k = ref1 = start, ref2 = end; (ref1 <= ref2 ? k < ref2 : k > ref2); i = ref1 <= ref2 ? ++k : --k) {
      product *= digits[i];
    }
    if (largest < product) {
      largest = product;
    }
  }
  return largest;
};

problem.test = function() {
  equal(largestProduct(4), 5832, "Greatest product of 4 adjacent digits is 5832");
  return equal(largestProduct(5), 40824, "Greatest product of 5 adjacent digits is 40824");
};

problem.answer = function() {
  return largestProduct(13);
};


},{}],"e009":[function(require,module,exports){
var findFirstTriplet, isTriplet, problem;

module.exports = problem = new Problem(`
Problem 9: Special Pythagorean triplet
--------------------------------------

A Pythagorean triplet is a set of three natural numbers, a < b < c, for which,

    a^2 + b^2 = c^2

For example, 3^2 + 4^2 = 9 + 16 = 25 = 5^2.

There exists exactly one Pythagorean triplet for which a + b + c = 1000.

Find the product abc.
`);

isTriplet = function(a, b, c) {
  return ((a * a) + (b * b)) === (c * c);
};

findFirstTriplet = function(sum) {
  var a, b, c, i, j;
  for (a = i = 1; i < 1000; a = ++i) {
    for (b = j = 1; j < 1000; b = ++j) {
      c = 1000 - a - b;
      if (isTriplet(a, b, c)) {
        return [a, b, c];
      }
    }
  }
  return false;
};

problem.test = function() {
  return equal(isTriplet(3, 4, 5), true, "(3,4,5) is a Pythagorean triplet");
};

problem.answer = function() {
  return findFirstTriplet(1000);
};


},{}],"e010":[function(require,module,exports){
var math, primeSum, problem;

module.exports = problem = new Problem(`
Problem 10: Summation of primes
-------------------------------

The sum of the primes below 10 is 2 + 3 + 5 + 7 = 17.

Find the sum of all the primes below two million.
`);

math = require("math");

primeSum = function(ceiling) {
  var n, sieve, sum;
  sieve = new math.IncrementalSieve();
  sum = 0;
  while (true) {
    n = sieve.next();
    if (n >= ceiling) {
      break;
    }
    sum += n;
  }
  return sum;
};

problem.test = function() {
  return equal(primeSum(10), 17, "Sum of primes below 10 is 17");
};

problem.answer = function() {
  return primeSum(2000000);
};


},{"math":"math"}],"e011":[function(require,module,exports){
var getLine, getLineProduct, grid, prepareGrid, problem;

module.exports = problem = new Problem(`
Problem 11: Largest product in a grid
-------------------------------------

In the 20x20 grid below, four numbers along a diagonal line have been marked in red.

          08 02 22 97 38 15 00 40 00 75 04 05 07 78 52 12 50 77 91 08
          49 49 99 40 17 81 18 57 60 87 17 40 98 43 69 48 04 56 62 00
          81 49 31 73 55 79 14 29 93 71 40 67 53 88 30 03 49 13 36 65
          52 70 95 23 04 60 11 42 69 24 68 56 01 32 56 71 37 02 36 91
          22 31 16 71 51 67 63 89 41 92 36 54 22 40 40 28 66 33 13 80
          24 47 32 60 99 03 45 02 44 75 33 53 78 36 84 20 35 17 12 50
          32 98 81 28 64 23 67 10 26_38 40 67 59 54 70 66 18 38 64 70
          67 26 20 68 02 62 12 20 95 63_94 39 63 08 40 91 66 49 94 21
          24 55 58 05 66 73 99 26 97 17 78_78 96 83 14 88 34 89 63 72
          21 36 23 09 75 00 76 44 20 45 35 14 00 61 33 97 34 31 33 95
          78 17 53 28 22 75 31 67 15 94 03 80 04 62 16 14 09 53 56 92
          16 39 05 42 96 35 31 47 55 58 88 24 00 17 54 24 36 29 85 57
          86 56 00 48 35 71 89 07 05 44 44 37 44 60 21 58 51 54 17 58
          19 80 81 68 05 94 47 69 28 73 92 13 86 52 17 77 04 89 55 40
          04 52 08 83 97 35 99 16 07 97 57 32 16 26 26 79 33 27 98 66
          88 36 68 87 57 62 20 72 03 46 33 67 46 55 12 32 63 93 53 69
          04 42 16 73 38 25 39 11 24 94 72 18 08 46 29 32 40 62 76 36
          20 69 36 41 72 30 23 88 34 62 99 69 82 67 59 85 74 04 36 16
          20 73 35 29 78 31 90 01 74 31 49 71 48 86 81 16 23 57 05 54
          01 70 54 71 83 51 54 69 16 92 33 48 61 43 52 01 89 19 67 48

The product of these numbers is 26 x 63 x 78 x 14 = 1788696.

What is the greatest product of four adjacent numbers in the same direction (up, down, left, right, or diagonally) in the 20x20 grid?
`);

grid = null;

prepareGrid = function() {
  var digit, digits, i, index, j, k, l, rawDigits, results;
  rawDigits = `08 02 22 97 38 15 00 40 00 75 04 05 07 78 52 12 50 77 91 08
49 49 99 40 17 81 18 57 60 87 17 40 98 43 69 48 04 56 62 00
81 49 31 73 55 79 14 29 93 71 40 67 53 88 30 03 49 13 36 65
52 70 95 23 04 60 11 42 69 24 68 56 01 32 56 71 37 02 36 91
22 31 16 71 51 67 63 89 41 92 36 54 22 40 40 28 66 33 13 80
24 47 32 60 99 03 45 02 44 75 33 53 78 36 84 20 35 17 12 50
32 98 81 28 64 23 67 10 26 38 40 67 59 54 70 66 18 38 64 70
67 26 20 68 02 62 12 20 95 63 94 39 63 08 40 91 66 49 94 21
24 55 58 05 66 73 99 26 97 17 78 78 96 83 14 88 34 89 63 72
21 36 23 09 75 00 76 44 20 45 35 14 00 61 33 97 34 31 33 95
78 17 53 28 22 75 31 67 15 94 03 80 04 62 16 14 09 53 56 92
16 39 05 42 96 35 31 47 55 58 88 24 00 17 54 24 36 29 85 57
86 56 00 48 35 71 89 07 05 44 44 37 44 60 21 58 51 54 17 58
19 80 81 68 05 94 47 69 28 73 92 13 86 52 17 77 04 89 55 40
04 52 08 83 97 35 99 16 07 97 57 32 16 26 26 79 33 27 98 66
88 36 68 87 57 62 20 72 03 46 33 67 46 55 12 32 63 93 53 69
04 42 16 73 38 25 39 11 24 94 72 18 08 46 29 32 40 62 76 36
20 69 36 41 72 30 23 88 34 62 99 69 82 67 59 85 74 04 36 16
20 73 35 29 78 31 90 01 74 31 49 71 48 86 81 16 23 57 05 54
01 70 54 71 83 51 54 69 16 92 33 48 61 43 52 01 89 19 67 48`.replace(/[^0-9 ]/gm, " ");
  digits = (function() {
    var k, len, ref, results;
    ref = rawDigits.split(" ");
    results = [];
    for (k = 0, len = ref.length; k < len; k++) {
      digit = ref[k];
      results.push(parseInt(digit));
    }
    return results;
  })();
  grid = Array(20);
  for (i = k = 0; k < 20; i = ++k) {
    grid[i] = Array(20);
  }
  index = 0;
  results = [];
  for (j = l = 0; l < 20; j = ++l) {
    results.push((function() {
      var m, results1;
      results1 = [];
      for (i = m = 0; m < 20; i = ++m) {
        grid[i][j] = digits[index];
        results1.push(index++);
      }
      return results1;
    })());
  }
  return results;
};

prepareGrid();

// Gets a product of 4 values starting at (sx, sy), heading in the direction (dx, dy)
// Returns -1 if there is no room to make a stripe of 4.
getLineProduct = function(sx, sy, dx, dy) {
  var ex, ey, i, k, product, x, y;
  ex = sx + (4 * dx);
  if ((ex < 0) || (ex >= 20)) {
    return -1;
  }
  ey = sy + (4 * dy);
  if ((ey < 0) || (ey >= 20)) {
    return -1;
  }
  x = sx;
  y = sy;
  product = 1;
  for (i = k = 0; k < 4; i = ++k) {
    product *= grid[x][y];
    x += dx;
    y += dy;
  }
  return product;
};

getLine = function(sx, sy, dx, dy) {
  var ex, ey, i, k, line, x, y;
  ex = sx + (4 * dx);
  if ((ex < 0) || (ex >= 20)) {
    return [];
  }
  ey = sy + (4 * dy);
  if ((ey < 0) || (ey >= 20)) {
    return [];
  }
  line = [];
  x = sx;
  y = sy;
  for (i = k = 0; k < 4; i = ++k) {
    line.push(grid[x][y]);
    x += dx;
    y += dy;
  }
  return line;
};

problem.test = function() {
  // Example is diagonal right/down from (8,6)
  return equal(getLineProduct(8, 6, 1, 1), 1788696, "Diagonal value shown in example equals 1,788,696");
};

problem.answer = function() {
  var i, j, k, l, max, p;
  max = {
    product: 1,
    i: 0,
    j: 0,
    dir: "right"
  };
  for (j = k = 0; k < 20; j = ++k) {
    for (i = l = 0; l < 20; i = ++l) {
      p = getLineProduct(i, j, 1, 0);
      if (max.product < p) {
        max.product = p;
        max.i = i;
        max.j = j;
        max.dir = "right";
      }
      p = getLineProduct(i, j, 0, 1);
      if (max.product < p) {
        max.product = p;
        max.i = i;
        max.j = j;
        max.dir = "down";
      }
      p = getLineProduct(i, j, 1, 1);
      if (max.product < p) {
        max.product = p;
        max.i = i;
        max.j = j;
        max.dir = "diagonalR";
      }
      p = getLineProduct(i, j, -1, 1);
      if (max.product < p) {
        max.product = p;
        max.i = i;
        max.j = j;
        max.dir = "diagonalL";
      }
    }
  }
  return max;
};


},{}],"e012":[function(require,module,exports){
var divisorCount, math, problem;

module.exports = problem = new Problem(`
Problem 12: Highly divisible triangular number
----------------------------------------------

The sequence of triangle numbers is generated by adding the natural numbers. So the 7th triangle number would be

                      1 + 2 + 3 + 4 + 5 + 6 + 7 = 28.

The first ten terms would be:

                      1, 3, 6, 10, 15, 21, 28, 36, 45, 55, ...

Let us list the factors of the first seven triangle numbers:

 1: 1
 3: 1,3
 6: 1,2,3,6
10: 1,2,5,10
15: 1,3,5,15
21: 1,3,7,21
28: 1,2,4,7,14,28

We can see that 28 is the first triangle number to have over five divisors.

What is the value of the first triangle number to have over five hundred divisors?
`);

math = require("math");

// This function does its best to leverage Ramanujan's "Tau function",
// which is supposed to give the number of positive divisors.

// The idea is:
// * For primes, T(p^k) = k + 1
// * For any numbers whose GCD is 1, T(mn) = T(m) * T(n)

// I already have a method to prime factor a number, so I'll leverage
// every grouping of the same prime number as the first case, and
// multiply them together.

// Example: 28

// 28's prime factors are [2, 2, 7], or (2^2 + 7)

// I can assume that the GCD between any of the prime sets is going to be 1 because duh,
// which means that:

// T(28) == T(2^2) * T(7)

// T(2^2) == 2 + 1 == 3
// T(7^1) == 1 + 1 == 2
// 3 * 2 = 6
// 28 has 6 divisors.

// You're mad.
divisorCount = function(n) {
  var count, exponent, factor, factors, i, lastFactor, len;
  if (n === 1) {
    return 1;
  }
  factors = math.primeFactors(n);
  count = 1;
  lastFactor = 0;
  exponent = 1;
  for (i = 0, len = factors.length; i < len; i++) {
    factor = factors[i];
    if (factor === lastFactor) {
      exponent++;
    } else {
      if (lastFactor !== 0) {
        count *= exponent + 1;
      }
      lastFactor = factor;
      exponent = 1;
    }
  }
  if (lastFactor !== 0) {
    count *= exponent + 1;
  }
  return count;
};

problem.test = function() {
  equal(divisorCount(1), 1, " 1 has 1 divisors");
  equal(divisorCount(3), 2, " 3 has 2 divisors");
  equal(divisorCount(6), 4, " 6 has 4 divisors");
  equal(divisorCount(10), 4, "10 has 4 divisors");
  equal(divisorCount(15), 4, "15 has 4 divisors");
  equal(divisorCount(21), 4, "21 has 4 divisors");
  return equal(divisorCount(28), 6, "28 has 6 divisors");
};

problem.answer = function() {
  var count, n, step;
  n = 1;
  step = 2;
  while (true) {
    count = divisorCount(n);
    if (count > 500) {
      return {
        n: n,
        count: count
      };
    }
    // next triangular number
    n += step;
    step++;
  }
};


},{"math":"math"}],"e013":[function(require,module,exports){
var numbers, problem;

module.exports = problem = new Problem(`
Problem 13: Large sum
---------------------

Work out the first ten digits of the sum of the following one-hundred 50-digit numbers.

37107287533902102798797998220837590246510135740250
46376937677490009712648124896970078050417018260538
74324986199524741059474233309513058123726617309629
91942213363574161572522430563301811072406154908250
23067588207539346171171980310421047513778063246676
89261670696623633820136378418383684178734361726757
28112879812849979408065481931592621691275889832738
44274228917432520321923589422876796487670272189318
47451445736001306439091167216856844588711603153276
70386486105843025439939619828917593665686757934951
62176457141856560629502157223196586755079324193331
64906352462741904929101432445813822663347944758178
92575867718337217661963751590579239728245598838407
58203565325359399008402633568948830189458628227828
80181199384826282014278194139940567587151170094390
35398664372827112653829987240784473053190104293586
86515506006295864861532075273371959191420517255829
71693888707715466499115593487603532921714970056938
54370070576826684624621495650076471787294438377604
53282654108756828443191190634694037855217779295145
36123272525000296071075082563815656710885258350721
45876576172410976447339110607218265236877223636045
17423706905851860660448207621209813287860733969412
81142660418086830619328460811191061556940512689692
51934325451728388641918047049293215058642563049483
62467221648435076201727918039944693004732956340691
15732444386908125794514089057706229429197107928209
55037687525678773091862540744969844508330393682126
18336384825330154686196124348767681297534375946515
80386287592878490201521685554828717201219257766954
78182833757993103614740356856449095527097864797581
16726320100436897842553539920931837441497806860984
48403098129077791799088218795327364475675590848030
87086987551392711854517078544161852424320693150332
59959406895756536782107074926966537676326235447210
69793950679652694742597709739166693763042633987085
41052684708299085211399427365734116182760315001271
65378607361501080857009149939512557028198746004375
35829035317434717326932123578154982629742552737307
94953759765105305946966067683156574377167401875275
88902802571733229619176668713819931811048770190271
25267680276078003013678680992525463401061632866526
36270218540497705585629946580636237993140746255962
24074486908231174977792365466257246923322810917141
91430288197103288597806669760892938638285025333403
34413065578016127815921815005561868836468420090470
23053081172816430487623791969842487255036638784583
11487696932154902810424020138335124462181441773470
63783299490636259666498587618221225225512486764533
67720186971698544312419572409913959008952310058822
95548255300263520781532296796249481641953868218774
76085327132285723110424803456124867697064507995236
37774242535411291684276865538926205024910326572967
23701913275725675285653248258265463092207058596522
29798860272258331913126375147341994889534765745501
18495701454879288984856827726077713721403798879715
38298203783031473527721580348144513491373226651381
34829543829199918180278916522431027392251122869539
40957953066405232632538044100059654939159879593635
29746152185502371307642255121183693803580388584903
41698116222072977186158236678424689157993532961922
62467957194401269043877107275048102390895523597457
23189706772547915061505504953922979530901129967519
86188088225875314529584099251203829009407770775672
11306739708304724483816533873502340845647058077308
82959174767140363198008187129011875491310547126581
97623331044818386269515456334926366572897563400500
42846280183517070527831839425882145521227251250327
55121603546981200581762165212827652751691296897789
32238195734329339946437501907836945765883352399886
75506164965184775180738168837861091527357929701337
62177842752192623401942399639168044983993173312731
32924185707147349566916674687634660915035914677504
99518671430235219628894890102423325116913619626622
73267460800591547471830798392868535206946944540724
76841822524674417161514036427982273348055556214818
97142617910342598647204516893989422179826088076852
87783646182799346313767754307809363333018982642090
10848802521674670883215120185883543223812876952786
71329612474782464538636993009049310363619763878039
62184073572399794223406235393808339651327408011116
66627891981488087797941876876144230030984490851411
60661826293682836764744779239180335110989069790714
85786944089552990653640447425576083659976645795096
66024396409905389607120198219976047599490197230297
64913982680032973156037120041377903785566085089252
16730939319872750275468906903707539413042652315011
94809377245048795150954100921645863754710598436791
78639167021187492431995700641917969777599028300699
15368713711936614952811305876380278410754449733078
40789923115535562561142322423255033685442488917353
44889911501440648020369068063960672322193204149535
41503128880339536053299340368006977710650566631954
81234880673210146739058568557934581403627822703280
82616570773948327592232845941706525094512325230608
22918802058777319719839450180888072429661980811197
77158542502016545090413245809786882778948721859617
72107838435069186155435662884062257473692284509516
20849603980134001723930671666823555245252804609722
53503534226472524250874054075591789781264330331690
`);

numbers = [37107287533902102798797998220837590246510135740250, 46376937677490009712648124896970078050417018260538, 74324986199524741059474233309513058123726617309629, 91942213363574161572522430563301811072406154908250, 23067588207539346171171980310421047513778063246676, 89261670696623633820136378418383684178734361726757, 28112879812849979408065481931592621691275889832738, 44274228917432520321923589422876796487670272189318, 47451445736001306439091167216856844588711603153276, 70386486105843025439939619828917593665686757934951, 62176457141856560629502157223196586755079324193331, 64906352462741904929101432445813822663347944758178, 92575867718337217661963751590579239728245598838407, 58203565325359399008402633568948830189458628227828, 80181199384826282014278194139940567587151170094390, 35398664372827112653829987240784473053190104293586, 86515506006295864861532075273371959191420517255829, 71693888707715466499115593487603532921714970056938, 54370070576826684624621495650076471787294438377604, 53282654108756828443191190634694037855217779295145, 36123272525000296071075082563815656710885258350721, 45876576172410976447339110607218265236877223636045, 17423706905851860660448207621209813287860733969412, 81142660418086830619328460811191061556940512689692, 51934325451728388641918047049293215058642563049483, 62467221648435076201727918039944693004732956340691, 15732444386908125794514089057706229429197107928209, 55037687525678773091862540744969844508330393682126, 18336384825330154686196124348767681297534375946515, 80386287592878490201521685554828717201219257766954, 78182833757993103614740356856449095527097864797581, 16726320100436897842553539920931837441497806860984, 48403098129077791799088218795327364475675590848030, 87086987551392711854517078544161852424320693150332, 59959406895756536782107074926966537676326235447210, 69793950679652694742597709739166693763042633987085, 41052684708299085211399427365734116182760315001271, 65378607361501080857009149939512557028198746004375, 35829035317434717326932123578154982629742552737307, 94953759765105305946966067683156574377167401875275, 88902802571733229619176668713819931811048770190271, 25267680276078003013678680992525463401061632866526, 36270218540497705585629946580636237993140746255962, 24074486908231174977792365466257246923322810917141, 91430288197103288597806669760892938638285025333403, 34413065578016127815921815005561868836468420090470, 23053081172816430487623791969842487255036638784583, 11487696932154902810424020138335124462181441773470, 63783299490636259666498587618221225225512486764533, 67720186971698544312419572409913959008952310058822, 95548255300263520781532296796249481641953868218774, 76085327132285723110424803456124867697064507995236, 37774242535411291684276865538926205024910326572967, 23701913275725675285653248258265463092207058596522, 29798860272258331913126375147341994889534765745501, 18495701454879288984856827726077713721403798879715, 38298203783031473527721580348144513491373226651381, 34829543829199918180278916522431027392251122869539, 40957953066405232632538044100059654939159879593635, 29746152185502371307642255121183693803580388584903, 41698116222072977186158236678424689157993532961922, 62467957194401269043877107275048102390895523597457, 23189706772547915061505504953922979530901129967519, 86188088225875314529584099251203829009407770775672, 11306739708304724483816533873502340845647058077308, 82959174767140363198008187129011875491310547126581, 97623331044818386269515456334926366572897563400500, 42846280183517070527831839425882145521227251250327, 55121603546981200581762165212827652751691296897789, 32238195734329339946437501907836945765883352399886, 75506164965184775180738168837861091527357929701337, 62177842752192623401942399639168044983993173312731, 32924185707147349566916674687634660915035914677504, 99518671430235219628894890102423325116913619626622, 73267460800591547471830798392868535206946944540724, 76841822524674417161514036427982273348055556214818, 97142617910342598647204516893989422179826088076852, 87783646182799346313767754307809363333018982642090, 10848802521674670883215120185883543223812876952786, 71329612474782464538636993009049310363619763878039, 62184073572399794223406235393808339651327408011116, 66627891981488087797941876876144230030984490851411, 60661826293682836764744779239180335110989069790714, 85786944089552990653640447425576083659976645795096, 66024396409905389607120198219976047599490197230297, 64913982680032973156037120041377903785566085089252, 16730939319872750275468906903707539413042652315011, 94809377245048795150954100921645863754710598436791, 78639167021187492431995700641917969777599028300699, 15368713711936614952811305876380278410754449733078, 40789923115535562561142322423255033685442488917353, 44889911501440648020369068063960672322193204149535, 41503128880339536053299340368006977710650566631954, 81234880673210146739058568557934581403627822703280, 82616570773948327592232845941706525094512325230608, 22918802058777319719839450180888072429661980811197, 77158542502016545090413245809786882778948721859617, 72107838435069186155435662884062257473692284509516, 20849603980134001723930671666823555245252804609722, 53503534226472524250874054075591789781264330331690];

problem.answer = function() {
  var i, len, n, str, sum;
  sum = 0;
  for (i = 0, len = numbers.length; i < len; i++) {
    n = numbers[i];
    sum += n;
  }
  str = String(sum).replace(/\./g, "").substr(0, 10);
  return str;
};


},{}],"e014":[function(require,module,exports){
var collatzCache, collatzChainLength, problem;

module.exports = problem = new Problem(`
Problem 14: Longest Collatz sequence
------------------------------------

The following iterative sequence is defined for the set of positive integers:

    n -> n/2    (n is even)
    n -> 3n + 1 (n is odd)

Using the rule above and starting with 13, we generate the following sequence:

    13 -> 40 -> 20 -> 10 -> 5 -> 16 -> 8 -> 4 -> 2 -> 1

It can be seen that this sequence (starting at 13 and finishing at 1) contains 10 terms. Although it has not been proved yet (Collatz Problem), it is thought that all starting numbers finish at 1.

Which starting number, under one million, produces the longest chain?

NOTE: Once the chain starts the terms are allowed to go above one million.
`);

collatzCache = {};

collatzChainLength = function(startingValue) {
  var i, j, len, len1, n, toBeCached, v;
  n = startingValue;
  toBeCached = [];
  while (true) {
    if (collatzCache.hasOwnProperty(n)) {
      break;
    }
    // remember that we failed to cache this entry
    toBeCached.push(n);
    if (n === 1) {
      break;
    }
    if ((n % 2) === 0) {
      n = Math.floor(n / 2);
    } else {
      n = (n * 3) + 1;
    }
  }
  // Since we left breadcrumbs down the trail of things we haven't cached
  // walk back down the trail and cache all the entries found along the way
  len = toBeCached.length;
  for (i = j = 0, len1 = toBeCached.length; j < len1; i = ++j) {
    v = toBeCached[i];
    collatzCache[v] = collatzCache[n] + (len - i);
  }
  return collatzCache[startingValue];
};

problem.test = function() {
  collatzCache = {
    "1": 1
  };
  equal(collatzChainLength(13), 10, "13 has a collatz chain of 10");
  equal(collatzChainLength(26), 11, "26 has a collatz chain of 11");
  return equal(collatzChainLength(1), 1, "1 has a collatz chain of 1");
};

problem.answer = function() {
  var chainLength, i, j, maxChain, maxChainLength;
  collatzCache = {
    "1": 1
  };
  maxChain = 0;
  maxChainLength = 0;
  for (i = j = 1; j < 1000000; i = ++j) {
    chainLength = collatzChainLength(i);
    if (maxChainLength < chainLength) {
      maxChainLength = chainLength;
      maxChain = i;
    }
  }
  return {
    answer: maxChain,
    chainLength: maxChainLength
  };
};


},{}],"e015":[function(require,module,exports){
var lattice, math, problem;

module.exports = problem = new Problem(`
Problem 15: Lattice paths
-------------------------

Starting in the top left corner of a 2×2 grid, and only being able to move to the right and down, there are exactly 6 routes to the bottom right corner.

    (picture showing 6 paths: RRDD, RDRD, RDDR, DRRD, DRDR, DDRR)

How many such routes are there through a 20×20 grid?
`);

math = require("math");

lattice = function(n) {
  return math.nCr(n * 2, n);
};

problem.test = function() {
  equal(lattice(1), 2, "1x1 lattice has 2 paths");
  return equal(lattice(2), 6, "2x2 lattice has 6 paths");
};

problem.answer = function() {
  return lattice(20);
};


},{"math":"math"}],"e016":[function(require,module,exports){
var MAX_EXPONENT, bigInt, math, powerDigitSum, problem;

module.exports = problem = new Problem(`
Problem 16: Power digit sum
---------------------------

2^15 = 32768 and the sum of its digits is 3 + 2 + 7 + 6 + 8 = 26.

What is the sum of the digits of the number 2^1000?
`);

math = require("math");

bigInt = require("big-integer");

MAX_EXPONENT = 50;

powerDigitSum = function(x, y) {
  var d, digits, exponent, i, len, number, sum;
  number = bigInt(1);
  while (y !== 0) {
    exponent = y;
    if (exponent > MAX_EXPONENT) {
      exponent = MAX_EXPONENT;
    }
    y -= exponent;
    number = number.multiply(Math.floor(Math.pow(x, exponent)));
  }
  digits = String(number);
  sum = 0;
  for (i = 0, len = digits.length; i < len; i++) {
    d = digits[i];
    sum += parseInt(d);
  }
  return sum;
};

problem.test = function() {
  return equal(powerDigitSum(2, 15), 26, "sum of digits of 2^15 is 26");
};

problem.answer = function() {
  return powerDigitSum(2, 1000);
};


},{"big-integer":2,"math":"math"}],"e017":[function(require,module,exports){
var names, numberLetterCount, numberLetterCountRange, problem;

module.exports = problem = new Problem(`
Problem 17: Number letter counts
--------------------------------

If the numbers 1 to 5 are written out in words: one, two, three, four, five, then there are 3 + 3 + 5 + 4 + 4 = 19 letters used in total.

If all the numbers from 1 to 1000 (one thousand) inclusive were written out in words, how many letters would be used?

NOTE: Do not count spaces or hyphens. For example, 342 (three hundred and forty-two) contains 23 letters and 115 (one hundred and fifteen) contains 20 letters. The use of "and" when writing out numbers is in compliance with British usage.
`);

names = {
  ones: "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split(/\s+/),
  tens: "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split(/\s+/)
};

// supports 0-9999
numberLetterCount = function(num) {
  var hundreds, lettersOnly, n, name, tens, thousands;
  n = num;
  name = "";
  if (n >= 1000) {
    thousands = Math.floor(n / 1000);
    n = n % 1000;
    name += `${names.ones[thousands]} thousand `;
  }
  if (n >= 100) {
    hundreds = Math.floor(n / 100);
    n = n % 100;
    name += `${names.ones[hundreds]} hundred `;
  }
  if ((n > 0) && (name.length > 0)) {
    name += "and ";
  }
  if (n >= 20) {
    tens = Math.floor(n / 10);
    n = n % 10;
    name += `${names.tens[tens]} `;
  }
  if (n > 0) {
    name += `${names.ones[n]} `;
  }
  lettersOnly = name.replace(/[^a-z]/g, "");
  // console.log "num: #{num}, name: #{name}, lettersOnly: #{lettersOnly}"
  return lettersOnly.length;
};

numberLetterCountRange = function(a, b) {
  var i, j, ref, ref1, sum;
  sum = 0;
  for (i = j = ref = a, ref1 = b; (ref <= ref1 ? j <= ref1 : j >= ref1); i = ref <= ref1 ? ++j : --j) {
    sum += numberLetterCount(i);
  }
  return sum;
};

problem.test = function() {
  equal(numberLetterCountRange(1, 5), 19, "sum of lengths of numbers 1-5 is 19");
  equal(numberLetterCount(342), 23, "length of name of 342 is 23");
  return equal(numberLetterCount(115), 20, "length of name of 115 is 20");
};

problem.answer = function() {
  return numberLetterCountRange(1, 1000);
};


},{}],"e018":[function(require,module,exports){
var mainPyramid, math, maximumPathSum, problem, stringToPyramid, testPyramid;

module.exports = problem = new Problem(`
Problem 18: Maximum path sum I
------------------------------

By starting at the top of the triangle below and moving to adjacent numbers on the row below, the maximum total from top to bottom is 23.

                              3
                             7 4
                            2 4 6
                           8 5 9 3

That is, 3 + 7 + 4 + 9 = 23.

Find the maximum total from top to bottom of the triangle below:

                              75
                            95  64
                          17  47  82
                        18  35  87  10
                      20  04  82  47  65
                    19  01  23  75  03  34
                  88  02  77  73  07  63  67
                99  65  04  28  06  16  70  92
              41  41  26  56  83  40  80  70  33
            41  48  72  33  47  32  37  16  94  29
          53  71  44  65  25  43  91  52  97  51  14
        70  11  33  28  77  73  17  78  39  68  17  57
      91  71  52  38  17  14  91  43  58  50  27  29  48
    63  66  04  68  89  53  67  30  73  16  69  87  40  31
  04  62  98  27  23  09  70  98  73  93  38  53  60  04  23

NOTE: As there are only 16384 routes, it is possible to solve this problem by trying every route. However, Problem 67, is the same challenge with a triangle containing one-hundred rows; it cannot be solved by brute force, and requires a clever method! ;o)
`);

math = require("math");

testPyramid = `   3
  7 4
 2 4 6
8 5 9 3`;

mainPyramid = `                            75
                          95  64
                        17  47  82
                      18  35  87  10
                    20  04  82  47  65
                  19  01  23  75  03  34
                88  02  77  73  07  63  67
              99  65  04  28  06  16  70  92
            41  41  26  56  83  40  80  70  33
          41  48  72  33  47  32  37  16  94  29
        53  71  44  65  25  43  91  52  97  51  14
      70  11  33  28  77  73  17  78  39  68  17  57
    91  71  52  38  17  14  91  43  58  50  27  29  48
  63  66  04  68  89  53  67  30  73  16  69  87  40  31
04  62  98  27  23  09  70  98  73  93  38  53  60  04  23
`;

stringToPyramid = function(str) {
  var a, d, digits, grid, i, j, len, ref, row;
  digits = (function() {
    var j, len1, ref, results;
    ref = String(str).replace(/\n/g, " ").split(/\s+/).filter(function(s) {
      return s.length > 0;
    });
    results = [];
    for (j = 0, len1 = ref.length; j < len1; j++) {
      d = ref[j];
      results.push(parseInt(d));
    }
    return results;
  })();
  grid = [];
  row = 0;
  while (digits.length) {
    len = row + 1;
    a = Array(len);
    for (i = j = 0, ref = len; (0 <= ref ? j < ref : j > ref); i = 0 <= ref ? ++j : --j) {
      a[i] = digits.shift();
    }
    grid[row] = a;
    row++;
  }
  return grid;
};

// Crushes the pyramid from bottom up. When it is all done crushing, the top of the pyramid is the answer.
maximumPathSum = function(pyramidString) {
  var i, j, maxBelow, pyramid, ref, row, sum;
  pyramid = stringToPyramid(pyramidString);
  sum = 0;
  row = pyramid.length - 2;
  while (row >= 0) {
    for (i = j = 0, ref = row; (0 <= ref ? j <= ref : j >= ref); i = 0 <= ref ? ++j : --j) {
      maxBelow = Math.max(pyramid[row + 1][i], pyramid[row + 1][i + 1]);
      pyramid[row][i] += maxBelow;
    }
    row--;
  }
  return pyramid[0][0];
};

problem.test = function() {
  return equal(maximumPathSum(testPyramid), 23, "maximum path sum of test triangle is 23");
};

problem.answer = function() {
  console.log(window.args);
  return maximumPathSum(mainPyramid);
};


},{"math":"math"}],"e019":[function(require,module,exports){
var ONE_DAY_IN_MS, dateToTimestamp, dayAndDate, dayNames, problem;

module.exports = problem = new Problem(`
Problem 19: Counting Sundays
----------------------------

You are given the following information, but you may prefer to do some research for yourself.

* 1 Jan 1900 was a Monday.
* Thirty days has September,
  April, June and November.
  All the rest have thirty-one,
  Saving February alone,
  Which has twenty-eight, rain or shine.
  And on leap years, twenty-nine.
* A leap year occurs on any year evenly divisible by 4, but not on a century unless it is divisible by 400.

How many Sundays fell on the first of the month during the twentieth century (1 Jan 1901 to 31 Dec 2000)?
`);

ONE_DAY_IN_MS = 60 * 60 * 24 * 1000;

dayNames = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(/\s+/);

dayAndDate = function(timestamp) {
  var d;
  d = new Date(timestamp);
  return [d.getDay(), d.getDate()];
};

dateToTimestamp = function(year, month, day) {
  return new Date(year, month, day).getTime();
};

problem.test = function() {
  var day, dd, i, results, ts;
  ts = dateToTimestamp(1900, 0, 1);
  equal(dayAndDate(ts)[0], 1, "1900/1/1 was a Monday");
  results = [];
  for (day = i = 2; i <= 6; day = ++i) {
    ts += ONE_DAY_IN_MS;
    dd = dayAndDate(ts);
    equal(dd[0], day, `the following day was a ${dayNames[day]}`);
    results.push(equal(dd[1], day, `... and the date was 1/${dd[1]}`));
  }
  return results;
};

problem.answer = function() {
  var dd, endts, sundayCount, ts;
  ts = dateToTimestamp(1901, 0, 1);
  endts = dateToTimestamp(2000, 11, 31);
  sundayCount = 0;
  while (ts < endts) {
    dd = dayAndDate(ts);
    if ((dd[0] === 0) && (dd[1] === 1)) {
      sundayCount++;
    }
    ts += ONE_DAY_IN_MS;
  }
  return sundayCount;
};


},{}],"e020":[function(require,module,exports){
var bigInt, hugeFactorial, problem, sumOfDigits;

module.exports = problem = new Problem(`
Problem 20: Factorial digit sum
-------------------------------

n! means n x (n − 1) x ... x 3 x 2 x 1

For example, 10! = 10 x 9 x ... x 3 x 2 x 1 = 3628800,
and the sum of the digits in the number 10! is 3 + 6 + 2 + 8 + 8 + 0 + 0 = 27.

Find the sum of the digits in the number 100!
`);

bigInt = require("big-integer");

hugeFactorial = function(n) {
  var i, j, number, ref;
  number = bigInt(1);
  for (i = j = 1, ref = n; (1 <= ref ? j <= ref : j >= ref); i = 1 <= ref ? ++j : --j) {
    number = number.multiply(i);
  }
  return number;
};

sumOfDigits = function(n) {
  var digit, digits, j, len, sum;
  digits = String(n);
  sum = 0;
  for (j = 0, len = digits.length; j < len; j++) {
    digit = digits[j];
    sum += parseInt(digit);
  }
  return sum;
};

problem.test = function() {
  return equal(sumOfDigits(hugeFactorial(10)), 27, "sum of factorial digits of 10! is 27");
};

problem.answer = function() {
  return sumOfDigits(hugeFactorial(100));
};


},{"big-integer":2}],"e021":[function(require,module,exports){
var amicableCache, amicableValue, math, problem;

module.exports = problem = new Problem(`
Problem 21: Amicable numbers
----------------------------

Let d(n) be defined as the sum of proper divisors of n (numbers less than n which divide evenly into n).
If d(a) = b and d(b) = a, where a ≠ b, then a and b are an amicable pair and each of a and b are called amicable numbers.

For example, the proper divisors of 220 are 1, 2, 4, 5, 10, 11, 20, 22, 44, 55 and 110; therefore d(220) = 284. The proper divisors of 284 are 1, 2, 4, 71 and 142; so d(284) = 220.

Evaluate the sum of all the amicable numbers under 10000.
`);

math = require("math");

amicableCache = null;

amicableValue = function(n) {
  var j, len, ref, sum, v;
  if (amicableCache.hasOwnProperty(n)) {
    return amicableCache[n];
  }
  sum = 0;
  ref = math.divisors(n);
  for (j = 0, len = ref.length; j < len; j++) {
    v = ref[j];
    sum += v;
  }
  amicableCache[n] = sum;
  return sum;
};

problem.test = function() {
  amicableCache = {};
  equal(amicableValue(220), 284, "amicable(220) == 284");
  return equal(amicableValue(284), 220, "amicable(284) == 220");
};

problem.answer = function() {
  var a, amicableNumbers, amicableSeen, b, i, j, k, len, sum, v;
  amicableCache = {};
  amicableSeen = {};
  for (i = j = 2; j < 10000; i = ++j) {
    a = amicableValue(i);
    b = amicableValue(a);
    if ((a !== b) && (b === i)) {
      amicableSeen[a] = true;
      amicableSeen[b] = true;
    }
  }
  amicableNumbers = (function() {
    var k, len, ref, results;
    ref = Object.keys(amicableSeen);
    results = [];
    for (k = 0, len = ref.length; k < len; k++) {
      v = ref[k];
      results.push(parseInt(v));
    }
    return results;
  })();
  sum = 0;
  for (k = 0, len = amicableNumbers.length; k < len; k++) {
    v = amicableNumbers[k];
    sum += v;
  }
  return sum;
};


},{"math":"math"}],"e022":[function(require,module,exports){
(function (Buffer){
var alphabeticalValue, fs, problem, readNames;

module.exports = problem = new Problem(`
Problem 22: Names scores
------------------------

Using names.txt (right click and 'Save Link/Target As...'), a 46K text file containing over five-thousand first names, begin by sorting it into alphabetical order. Then working out the alphabetical value for each name, multiply this value by its alphabetical position in the list to obtain a name score.

For example, when the list is sorted into alphabetical order, COLIN, which is worth 3 + 15 + 12 + 9 + 14 = 53, is the 938th name in the list. So, COLIN would obtain a score of 938 × 53 = 49714.

What is the total of all the name scores in the file?
`);



readNames = function() {
  var names, rawNames;
  rawNames = String(Buffer("Ik1BUlkiLCJQQVRSSUNJQSIsIkxJTkRBIiwiQkFSQkFSQSIsIkVMSVpBQkVUSCIsIkpFTk5JRkVSIiwiTUFSSUEiLCJTVVNBTiIsIk1BUkdBUkVUIiwiRE9ST1RIWSIsIkxJU0EiLCJOQU5DWSIsIktBUkVOIiwiQkVUVFkiLCJIRUxFTiIsIlNBTkRSQSIsIkRPTk5BIiwiQ0FST0wiLCJSVVRIIiwiU0hBUk9OIiwiTUlDSEVMTEUiLCJMQVVSQSIsIlNBUkFIIiwiS0lNQkVSTFkiLCJERUJPUkFIIiwiSkVTU0lDQSIsIlNISVJMRVkiLCJDWU5USElBIiwiQU5HRUxBIiwiTUVMSVNTQSIsIkJSRU5EQSIsIkFNWSIsIkFOTkEiLCJSRUJFQ0NBIiwiVklSR0lOSUEiLCJLQVRITEVFTiIsIlBBTUVMQSIsIk1BUlRIQSIsIkRFQlJBIiwiQU1BTkRBIiwiU1RFUEhBTklFIiwiQ0FST0xZTiIsIkNIUklTVElORSIsIk1BUklFIiwiSkFORVQiLCJDQVRIRVJJTkUiLCJGUkFOQ0VTIiwiQU5OIiwiSk9ZQ0UiLCJESUFORSIsIkFMSUNFIiwiSlVMSUUiLCJIRUFUSEVSIiwiVEVSRVNBIiwiRE9SSVMiLCJHTE9SSUEiLCJFVkVMWU4iLCJKRUFOIiwiQ0hFUllMIiwiTUlMRFJFRCIsIktBVEhFUklORSIsIkpPQU4iLCJBU0hMRVkiLCJKVURJVEgiLCJST1NFIiwiSkFOSUNFIiwiS0VMTFkiLCJOSUNPTEUiLCJKVURZIiwiQ0hSSVNUSU5BIiwiS0FUSFkiLCJUSEVSRVNBIiwiQkVWRVJMWSIsIkRFTklTRSIsIlRBTU1ZIiwiSVJFTkUiLCJKQU5FIiwiTE9SSSIsIlJBQ0hFTCIsIk1BUklMWU4iLCJBTkRSRUEiLCJLQVRIUllOIiwiTE9VSVNFIiwiU0FSQSIsIkFOTkUiLCJKQUNRVUVMSU5FIiwiV0FOREEiLCJCT05OSUUiLCJKVUxJQSIsIlJVQlkiLCJMT0lTIiwiVElOQSIsIlBIWUxMSVMiLCJOT1JNQSIsIlBBVUxBIiwiRElBTkEiLCJBTk5JRSIsIkxJTExJQU4iLCJFTUlMWSIsIlJPQklOIiwiUEVHR1kiLCJDUllTVEFMIiwiR0xBRFlTIiwiUklUQSIsIkRBV04iLCJDT05OSUUiLCJGTE9SRU5DRSIsIlRSQUNZIiwiRUROQSIsIlRJRkZBTlkiLCJDQVJNRU4iLCJST1NBIiwiQ0lORFkiLCJHUkFDRSIsIldFTkRZIiwiVklDVE9SSUEiLCJFRElUSCIsIktJTSIsIlNIRVJSWSIsIlNZTFZJQSIsIkpPU0VQSElORSIsIlRIRUxNQSIsIlNIQU5OT04iLCJTSEVJTEEiLCJFVEhFTCIsIkVMTEVOIiwiRUxBSU5FIiwiTUFSSk9SSUUiLCJDQVJSSUUiLCJDSEFSTE9UVEUiLCJNT05JQ0EiLCJFU1RIRVIiLCJQQVVMSU5FIiwiRU1NQSIsIkpVQU5JVEEiLCJBTklUQSIsIlJIT05EQSIsIkhBWkVMIiwiQU1CRVIiLCJFVkEiLCJERUJCSUUiLCJBUFJJTCIsIkxFU0xJRSIsIkNMQVJBIiwiTFVDSUxMRSIsIkpBTUlFIiwiSk9BTk5FIiwiRUxFQU5PUiIsIlZBTEVSSUUiLCJEQU5JRUxMRSIsIk1FR0FOIiwiQUxJQ0lBIiwiU1VaQU5ORSIsIk1JQ0hFTEUiLCJHQUlMIiwiQkVSVEhBIiwiREFSTEVORSIsIlZFUk9OSUNBIiwiSklMTCIsIkVSSU4iLCJHRVJBTERJTkUiLCJMQVVSRU4iLCJDQVRIWSIsIkpPQU5OIiwiTE9SUkFJTkUiLCJMWU5OIiwiU0FMTFkiLCJSRUdJTkEiLCJFUklDQSIsIkJFQVRSSUNFIiwiRE9MT1JFUyIsIkJFUk5JQ0UiLCJBVURSRVkiLCJZVk9OTkUiLCJBTk5FVFRFIiwiSlVORSIsIlNBTUFOVEhBIiwiTUFSSU9OIiwiREFOQSIsIlNUQUNZIiwiQU5BIiwiUkVORUUiLCJJREEiLCJWSVZJQU4iLCJST0JFUlRBIiwiSE9MTFkiLCJCUklUVEFOWSIsIk1FTEFOSUUiLCJMT1JFVFRBIiwiWU9MQU5EQSIsIkpFQU5FVFRFIiwiTEFVUklFIiwiS0FUSUUiLCJLUklTVEVOIiwiVkFORVNTQSIsIkFMTUEiLCJTVUUiLCJFTFNJRSIsIkJFVEgiLCJKRUFOTkUiLCJWSUNLSSIsIkNBUkxBIiwiVEFSQSIsIlJPU0VNQVJZIiwiRUlMRUVOIiwiVEVSUkkiLCJHRVJUUlVERSIsIkxVQ1kiLCJUT05ZQSIsIkVMTEEiLCJTVEFDRVkiLCJXSUxNQSIsIkdJTkEiLCJLUklTVElOIiwiSkVTU0lFIiwiTkFUQUxJRSIsIkFHTkVTIiwiVkVSQSIsIldJTExJRSIsIkNIQVJMRU5FIiwiQkVTU0lFIiwiREVMT1JFUyIsIk1FTElOREEiLCJQRUFSTCIsIkFSTEVORSIsIk1BVVJFRU4iLCJDT0xMRUVOIiwiQUxMSVNPTiIsIlRBTUFSQSIsIkpPWSIsIkdFT1JHSUEiLCJDT05TVEFOQ0UiLCJMSUxMSUUiLCJDTEFVRElBIiwiSkFDS0lFIiwiTUFSQ0lBIiwiVEFOWUEiLCJORUxMSUUiLCJNSU5OSUUiLCJNQVJMRU5FIiwiSEVJREkiLCJHTEVOREEiLCJMWURJQSIsIlZJT0xBIiwiQ09VUlRORVkiLCJNQVJJQU4iLCJTVEVMTEEiLCJDQVJPTElORSIsIkRPUkEiLCJKTyIsIlZJQ0tJRSIsIk1BVFRJRSIsIlRFUlJZIiwiTUFYSU5FIiwiSVJNQSIsIk1BQkVMIiwiTUFSU0hBIiwiTVlSVExFIiwiTEVOQSIsIkNIUklTVFkiLCJERUFOTkEiLCJQQVRTWSIsIkhJTERBIiwiR1dFTkRPTFlOIiwiSkVOTklFIiwiTk9SQSIsIk1BUkdJRSIsIk5JTkEiLCJDQVNTQU5EUkEiLCJMRUFIIiwiUEVOTlkiLCJLQVkiLCJQUklTQ0lMTEEiLCJOQU9NSSIsIkNBUk9MRSIsIkJSQU5EWSIsIk9MR0EiLCJCSUxMSUUiLCJESUFOTkUiLCJUUkFDRVkiLCJMRU9OQSIsIkpFTk5ZIiwiRkVMSUNJQSIsIlNPTklBIiwiTUlSSUFNIiwiVkVMTUEiLCJCRUNLWSIsIkJPQkJJRSIsIlZJT0xFVCIsIktSSVNUSU5BIiwiVE9OSSIsIk1JU1RZIiwiTUFFIiwiU0hFTExZIiwiREFJU1kiLCJSQU1PTkEiLCJTSEVSUkkiLCJFUklLQSIsIktBVFJJTkEiLCJDTEFJUkUiLCJMSU5EU0VZIiwiTElORFNBWSIsIkdFTkVWQSIsIkdVQURBTFVQRSIsIkJFTElOREEiLCJNQVJHQVJJVEEiLCJTSEVSWUwiLCJDT1JBIiwiRkFZRSIsIkFEQSIsIk5BVEFTSEEiLCJTQUJSSU5BIiwiSVNBQkVMIiwiTUFSR1VFUklURSIsIkhBVFRJRSIsIkhBUlJJRVQiLCJNT0xMWSIsIkNFQ0lMSUEiLCJLUklTVEkiLCJCUkFOREkiLCJCTEFOQ0hFIiwiU0FORFkiLCJST1NJRSIsIkpPQU5OQSIsIklSSVMiLCJFVU5JQ0UiLCJBTkdJRSIsIklORVoiLCJMWU5EQSIsIk1BREVMSU5FIiwiQU1FTElBIiwiQUxCRVJUQSIsIkdFTkVWSUVWRSIsIk1PTklRVUUiLCJKT0RJIiwiSkFOSUUiLCJNQUdHSUUiLCJLQVlMQSIsIlNPTllBIiwiSkFOIiwiTEVFIiwiS1JJU1RJTkUiLCJDQU5EQUNFIiwiRkFOTklFIiwiTUFSWUFOTiIsIk9QQUwiLCJBTElTT04iLCJZVkVUVEUiLCJNRUxPRFkiLCJMVVoiLCJTVVNJRSIsIk9MSVZJQSIsIkZMT1JBIiwiU0hFTExFWSIsIktSSVNUWSIsIk1BTUlFIiwiTFVMQSIsIkxPTEEiLCJWRVJOQSIsIkJFVUxBSCIsIkFOVE9JTkVUVEUiLCJDQU5ESUNFIiwiSlVBTkEiLCJKRUFOTkVUVEUiLCJQQU0iLCJLRUxMSSIsIkhBTk5BSCIsIldISVRORVkiLCJCUklER0VUIiwiS0FSTEEiLCJDRUxJQSIsIkxBVE9ZQSIsIlBBVFRZIiwiU0hFTElBIiwiR0FZTEUiLCJERUxMQSIsIlZJQ0tZIiwiTFlOTkUiLCJTSEVSSSIsIk1BUklBTk5FIiwiS0FSQSIsIkpBQ1FVRUxZTiIsIkVSTUEiLCJCTEFOQ0EiLCJNWVJBIiwiTEVUSUNJQSIsIlBBVCIsIktSSVNUQSIsIlJPWEFOTkUiLCJBTkdFTElDQSIsIkpPSE5OSUUiLCJST0JZTiIsIkZSQU5DSVMiLCJBRFJJRU5ORSIsIlJPU0FMSUUiLCJBTEVYQU5EUkEiLCJCUk9PS0UiLCJCRVRIQU5ZIiwiU0FESUUiLCJCRVJOQURFVFRFIiwiVFJBQ0kiLCJKT0RZIiwiS0VORFJBIiwiSkFTTUlORSIsIk5JQ0hPTEUiLCJSQUNIQUVMIiwiQ0hFTFNFQSIsIk1BQkxFIiwiRVJORVNUSU5FIiwiTVVSSUVMIiwiTUFSQ0VMTEEiLCJFTEVOQSIsIktSWVNUQUwiLCJBTkdFTElOQSIsIk5BRElORSIsIktBUkkiLCJFU1RFTExFIiwiRElBTk5BIiwiUEFVTEVUVEUiLCJMT1JBIiwiTU9OQSIsIkRPUkVFTiIsIlJPU0VNQVJJRSIsIkFOR0VMIiwiREVTSVJFRSIsIkFOVE9OSUEiLCJIT1BFIiwiR0lOR0VSIiwiSkFOSVMiLCJCRVRTWSIsIkNIUklTVElFIiwiRlJFREEiLCJNRVJDRURFUyIsIk1FUkVESVRIIiwiTFlORVRURSIsIlRFUkkiLCJDUklTVElOQSIsIkVVTEEiLCJMRUlHSCIsIk1FR0hBTiIsIlNPUEhJQSIsIkVMT0lTRSIsIlJPQ0hFTExFIiwiR1JFVENIRU4iLCJDRUNFTElBIiwiUkFRVUVMIiwiSEVOUklFVFRBIiwiQUxZU1NBIiwiSkFOQSIsIktFTExFWSIsIkdXRU4iLCJLRVJSWSIsIkpFTk5BIiwiVFJJQ0lBIiwiTEFWRVJORSIsIk9MSVZFIiwiQUxFWElTIiwiVEFTSEEiLCJTSUxWSUEiLCJFTFZJUkEiLCJDQVNFWSIsIkRFTElBIiwiU09QSElFIiwiS0FURSIsIlBBVFRJIiwiTE9SRU5BIiwiS0VMTElFIiwiU09OSkEiLCJMSUxBIiwiTEFOQSIsIkRBUkxBIiwiTUFZIiwiTUlORFkiLCJFU1NJRSIsIk1BTkRZIiwiTE9SRU5FIiwiRUxTQSIsIkpPU0VGSU5BIiwiSkVBTk5JRSIsIk1JUkFOREEiLCJESVhJRSIsIkxVQ0lBIiwiTUFSVEEiLCJGQUlUSCIsIkxFTEEiLCJKT0hBTk5BIiwiU0hBUkkiLCJDQU1JTExFIiwiVEFNSSIsIlNIQVdOQSIsIkVMSVNBIiwiRUJPTlkiLCJNRUxCQSIsIk9SQSIsIk5FVFRJRSIsIlRBQklUSEEiLCJPTExJRSIsIkpBSU1FIiwiV0lOSUZSRUQiLCJLUklTVElFIiwiTUFSSU5BIiwiQUxJU0hBIiwiQUlNRUUiLCJSRU5BIiwiTVlSTkEiLCJNQVJMQSIsIlRBTU1JRSIsIkxBVEFTSEEiLCJCT05JVEEiLCJQQVRSSUNFIiwiUk9OREEiLCJTSEVSUklFIiwiQURESUUiLCJGUkFOQ0lORSIsIkRFTE9SSVMiLCJTVEFDSUUiLCJBRFJJQU5BIiwiQ0hFUkkiLCJTSEVMQlkiLCJBQklHQUlMIiwiQ0VMRVNURSIsIkpFV0VMIiwiQ0FSQSIsIkFERUxFIiwiUkVCRUtBSCIsIkxVQ0lOREEiLCJET1JUSFkiLCJDSFJJUyIsIkVGRklFIiwiVFJJTkEiLCJSRUJBIiwiU0hBV04iLCJTQUxMSUUiLCJBVVJPUkEiLCJMRU5PUkEiLCJFVFRBIiwiTE9UVElFIiwiS0VSUkkiLCJUUklTSEEiLCJOSUtLSSIsIkVTVEVMTEEiLCJGUkFOQ0lTQ0EiLCJKT1NJRSIsIlRSQUNJRSIsIk1BUklTU0EiLCJLQVJJTiIsIkJSSVRUTkVZIiwiSkFORUxMRSIsIkxPVVJERVMiLCJMQVVSRUwiLCJIRUxFTkUiLCJGRVJOIiwiRUxWQSIsIkNPUklOTkUiLCJLRUxTRVkiLCJJTkEiLCJCRVRUSUUiLCJFTElTQUJFVEgiLCJBSURBIiwiQ0FJVExJTiIsIklOR1JJRCIsIklWQSIsIkVVR0VOSUEiLCJDSFJJU1RBIiwiR09MRElFIiwiQ0FTU0lFIiwiTUFVREUiLCJKRU5JRkVSIiwiVEhFUkVTRSIsIkZSQU5LSUUiLCJERU5BIiwiTE9STkEiLCJKQU5FVFRFIiwiTEFUT05ZQSIsIkNBTkRZIiwiTU9SR0FOIiwiQ09OU1VFTE8iLCJUQU1JS0EiLCJST1NFVFRBIiwiREVCT1JBIiwiQ0hFUklFIiwiUE9MTFkiLCJESU5BIiwiSkVXRUxMIiwiRkFZIiwiSklMTElBTiIsIkRPUk9USEVBIiwiTkVMTCIsIlRSVURZIiwiRVNQRVJBTlpBIiwiUEFUUklDQSIsIktJTUJFUkxFWSIsIlNIQU5OQSIsIkhFTEVOQSIsIkNBUk9MSU5BIiwiQ0xFTyIsIlNURUZBTklFIiwiUk9TQVJJTyIsIk9MQSIsIkpBTklORSIsIk1PTExJRSIsIkxVUEUiLCJBTElTQSIsIkxPVSIsIk1BUklCRUwiLCJTVVNBTk5FIiwiQkVUVEUiLCJTVVNBTkEiLCJFTElTRSIsIkNFQ0lMRSIsIklTQUJFTExFIiwiTEVTTEVZIiwiSk9DRUxZTiIsIlBBSUdFIiwiSk9OSSIsIlJBQ0hFTExFIiwiTEVPTEEiLCJEQVBITkUiLCJBTFRBIiwiRVNURVIiLCJQRVRSQSIsIkdSQUNJRUxBIiwiSU1PR0VORSIsIkpPTEVORSIsIktFSVNIQSIsIkxBQ0VZIiwiR0xFTk5BIiwiR0FCUklFTEEiLCJLRVJJIiwiVVJTVUxBIiwiTElaWklFIiwiS0lSU1RFTiIsIlNIQU5BIiwiQURFTElORSIsIk1BWVJBIiwiSkFZTkUiLCJKQUNMWU4iLCJHUkFDSUUiLCJTT05EUkEiLCJDQVJNRUxBIiwiTUFSSVNBIiwiUk9TQUxJTkQiLCJDSEFSSVRZIiwiVE9OSUEiLCJCRUFUUklaIiwiTUFSSVNPTCIsIkNMQVJJQ0UiLCJKRUFOSU5FIiwiU0hFRU5BIiwiQU5HRUxJTkUiLCJGUklFREEiLCJMSUxZIiwiUk9CQklFIiwiU0hBVU5BIiwiTUlMTElFIiwiQ0xBVURFVFRFIiwiQ0FUSExFRU4iLCJBTkdFTElBIiwiR0FCUklFTExFIiwiQVVUVU1OIiwiS0FUSEFSSU5FIiwiU1VNTUVSIiwiSk9ESUUiLCJTVEFDSSIsIkxFQSIsIkNIUklTVEkiLCJKSU1NSUUiLCJKVVNUSU5FIiwiRUxNQSIsIkxVRUxMQSIsIk1BUkdSRVQiLCJET01JTklRVUUiLCJTT0NPUlJPIiwiUkVORSIsIk1BUlRJTkEiLCJNQVJHTyIsIk1BVklTIiwiQ0FMTElFIiwiQk9CQkkiLCJNQVJJVFpBIiwiTFVDSUxFIiwiTEVBTk5FIiwiSkVBTk5JTkUiLCJERUFOQSIsIkFJTEVFTiIsIkxPUklFIiwiTEFET05OQSIsIldJTExBIiwiTUFOVUVMQSIsIkdBTEUiLCJTRUxNQSIsIkRPTExZIiwiU1lCSUwiLCJBQkJZIiwiTEFSQSIsIkRBTEUiLCJJVlkiLCJERUUiLCJXSU5OSUUiLCJNQVJDWSIsIkxVSVNBIiwiSkVSSSIsIk1BR0RBTEVOQSIsIk9GRUxJQSIsIk1FQUdBTiIsIkFVRFJBIiwiTUFUSUxEQSIsIkxFSUxBIiwiQ09STkVMSUEiLCJCSUFOQ0EiLCJTSU1PTkUiLCJCRVRUWUUiLCJSQU5ESSIsIlZJUkdJRSIsIkxBVElTSEEiLCJCQVJCUkEiLCJHRU9SR0lOQSIsIkVMSVpBIiwiTEVBTk4iLCJCUklER0VUVEUiLCJSSE9EQSIsIkhBTEVZIiwiQURFTEEiLCJOT0xBIiwiQkVSTkFESU5FIiwiRkxPU1NJRSIsIklMQSIsIkdSRVRBIiwiUlVUSElFIiwiTkVMREEiLCJNSU5FUlZBIiwiTElMTFkiLCJURVJSSUUiLCJMRVRIQSIsIkhJTEFSWSIsIkVTVEVMQSIsIlZBTEFSSUUiLCJCUklBTk5BIiwiUk9TQUxZTiIsIkVBUkxJTkUiLCJDQVRBTElOQSIsIkFWQSIsIk1JQSIsIkNMQVJJU1NBIiwiTElESUEiLCJDT1JSSU5FIiwiQUxFWEFORFJJQSIsIkNPTkNFUENJT04iLCJUSUEiLCJTSEFSUk9OIiwiUkFFIiwiRE9OQSIsIkVSSUNLQSIsIkpBTUkiLCJFTE5PUkEiLCJDSEFORFJBIiwiTEVOT1JFIiwiTkVWQSIsIk1BUllMT1UiLCJNRUxJU0EiLCJUQUJBVEhBIiwiU0VSRU5BIiwiQVZJUyIsIkFMTElFIiwiU09GSUEiLCJKRUFOSUUiLCJPREVTU0EiLCJOQU5OSUUiLCJIQVJSSUVUVCIsIkxPUkFJTkUiLCJQRU5FTE9QRSIsIk1JTEFHUk9TIiwiRU1JTElBIiwiQkVOSVRBIiwiQUxMWVNPTiIsIkFTSExFRSIsIlRBTklBIiwiVE9NTUlFIiwiRVNNRVJBTERBIiwiS0FSSU5BIiwiRVZFIiwiUEVBUkxJRSIsIlpFTE1BIiwiTUFMSU5EQSIsIk5PUkVFTiIsIlRBTUVLQSIsIlNBVU5EUkEiLCJISUxMQVJZIiwiQU1JRSIsIkFMVEhFQSIsIlJPU0FMSU5EQSIsIkpPUkRBTiIsIkxJTElBIiwiQUxBTkEiLCJHQVkiLCJDTEFSRSIsIkFMRUpBTkRSQSIsIkVMSU5PUiIsIk1JQ0hBRUwiLCJMT1JSSUUiLCJKRVJSSSIsIkRBUkNZIiwiRUFSTkVTVElORSIsIkNBUk1FTExBIiwiVEFZTE9SIiwiTk9FTUkiLCJNQVJDSUUiLCJMSVpBIiwiQU5OQUJFTExFIiwiTE9VSVNBIiwiRUFSTEVORSIsIk1BTExPUlkiLCJDQVJMRU5FIiwiTklUQSIsIlNFTEVOQSIsIlRBTklTSEEiLCJLQVRZIiwiSlVMSUFOTkUiLCJKT0hOIiwiTEFLSVNIQSIsIkVEV0lOQSIsIk1BUklDRUxBIiwiTUFSR0VSWSIsIktFTllBIiwiRE9MTElFIiwiUk9YSUUiLCJST1NMWU4iLCJLQVRIUklORSIsIk5BTkVUVEUiLCJDSEFSTUFJTkUiLCJMQVZPTk5FIiwiSUxFTkUiLCJLUklTIiwiVEFNTUkiLCJTVVpFVFRFIiwiQ09SSU5FIiwiS0FZRSIsIkpFUlJZIiwiTUVSTEUiLCJDSFJZU1RBTCIsIkxJTkEiLCJERUFOTkUiLCJMSUxJQU4iLCJKVUxJQU5BIiwiQUxJTkUiLCJMVUFOTiIsIktBU0VZIiwiTUFSWUFOTkUiLCJFVkFOR0VMSU5FIiwiQ09MRVRURSIsIk1FTFZBIiwiTEFXQU5EQSIsIllFU0VOSUEiLCJOQURJQSIsIk1BREdFIiwiS0FUSElFIiwiRURESUUiLCJPUEhFTElBIiwiVkFMRVJJQSIsIk5PTkEiLCJNSVRaSSIsIk1BUkkiLCJHRU9SR0VUVEUiLCJDTEFVRElORSIsIkZSQU4iLCJBTElTU0EiLCJST1NFQU5OIiwiTEFLRUlTSEEiLCJTVVNBTk5BIiwiUkVWQSIsIkRFSURSRSIsIkNIQVNJVFkiLCJTSEVSRUUiLCJDQVJMWSIsIkpBTUVTIiwiRUxWSUEiLCJBTFlDRSIsIkRFSVJEUkUiLCJHRU5BIiwiQlJJQU5BIiwiQVJBQ0VMSSIsIktBVEVMWU4iLCJST1NBTk5FIiwiV0VOREkiLCJURVNTQSIsIkJFUlRBIiwiTUFSVkEiLCJJTUVMREEiLCJNQVJJRVRUQSIsIk1BUkNJIiwiTEVPTk9SIiwiQVJMSU5FIiwiU0FTSEEiLCJNQURFTFlOIiwiSkFOTkEiLCJKVUxJRVRURSIsIkRFRU5BIiwiQVVSRUxJQSIsIkpPU0VGQSIsIkFVR1VTVEEiLCJMSUxJQU5BIiwiWU9VTkciLCJDSFJJU1RJQU4iLCJMRVNTSUUiLCJBTUFMSUEiLCJTQVZBTk5BSCIsIkFOQVNUQVNJQSIsIlZJTE1BIiwiTkFUQUxJQSIsIlJPU0VMTEEiLCJMWU5ORVRURSIsIkNPUklOQSIsIkFMRlJFREEiLCJMRUFOTkEiLCJDQVJFWSIsIkFNUEFSTyIsIkNPTEVFTiIsIlRBTVJBIiwiQUlTSEEiLCJXSUxEQSIsIktBUllOIiwiQ0hFUlJZIiwiUVVFRU4iLCJNQVVSQSIsIk1BSSIsIkVWQU5HRUxJTkEiLCJST1NBTk5BIiwiSEFMTElFIiwiRVJOQSIsIkVOSUQiLCJNQVJJQU5BIiwiTEFDWSIsIkpVTElFVCIsIkpBQ0tMWU4iLCJGUkVJREEiLCJNQURFTEVJTkUiLCJNQVJBIiwiSEVTVEVSIiwiQ0FUSFJZTiIsIkxFTElBIiwiQ0FTQU5EUkEiLCJCUklER0VUVCIsIkFOR0VMSVRBIiwiSkFOTklFIiwiRElPTk5FIiwiQU5OTUFSSUUiLCJLQVRJTkEiLCJCRVJZTCIsIlBIT0VCRSIsIk1JTExJQ0VOVCIsIktBVEhFUllOIiwiRElBTk4iLCJDQVJJU1NBIiwiTUFSWUVMTEVOIiwiTElaIiwiTEFVUkkiLCJIRUxHQSIsIkdJTERBIiwiQURSSUFOIiwiUkhFQSIsIk1BUlFVSVRBIiwiSE9MTElFIiwiVElTSEEiLCJUQU1FUkEiLCJBTkdFTElRVUUiLCJGUkFOQ0VTQ0EiLCJCUklUTkVZIiwiS0FJVExJTiIsIkxPTElUQSIsIkZMT1JJTkUiLCJST1dFTkEiLCJSRVlOQSIsIlRXSUxBIiwiRkFOTlkiLCJKQU5FTEwiLCJJTkVTIiwiQ09OQ0VUVEEiLCJCRVJUSUUiLCJBTEJBIiwiQlJJR0lUVEUiLCJBTFlTT04iLCJWT05EQSIsIlBBTlNZIiwiRUxCQSIsIk5PRUxMRSIsIkxFVElUSUEiLCJLSVRUWSIsIkRFQU5OIiwiQlJBTkRJRSIsIkxPVUVMTEEiLCJMRVRBIiwiRkVMRUNJQSIsIlNIQVJMRU5FIiwiTEVTQSIsIkJFVkVSTEVZIiwiUk9CRVJUIiwiSVNBQkVMTEEiLCJIRVJNSU5JQSIsIlRFUlJBIiwiQ0VMSU5BIiwiVE9SSSIsIk9DVEFWSUEiLCJKQURFIiwiREVOSUNFIiwiR0VSTUFJTkUiLCJTSUVSUkEiLCJNSUNIRUxMIiwiQ09SVE5FWSIsIk5FTExZIiwiRE9SRVRIQSIsIlNZRE5FWSIsIkRFSURSQSIsIk1PTklLQSIsIkxBU0hPTkRBIiwiSlVESSIsIkNIRUxTRVkiLCJBTlRJT05FVFRFIiwiTUFSR09UIiwiQk9CQlkiLCJBREVMQUlERSIsIk5BTiIsIkxFRUFOTiIsIkVMSVNIQSIsIkRFU1NJRSIsIkxJQkJZIiwiS0FUSEkiLCJHQVlMQSIsIkxBVEFOWUEiLCJNSU5BIiwiTUVMTElTQSIsIktJTUJFUkxFRSIsIkpBU01JTiIsIlJFTkFFIiwiWkVMREEiLCJFTERBIiwiTUEiLCJKVVNUSU5BIiwiR1VTU0lFIiwiRU1JTElFIiwiQ0FNSUxMQSIsIkFCQklFIiwiUk9DSU8iLCJLQUlUTFlOIiwiSkVTU0UiLCJFRFlUSEUiLCJBU0hMRUlHSCIsIlNFTElOQSIsIkxBS0VTSEEiLCJHRVJJIiwiQUxMRU5FIiwiUEFNQUxBIiwiTUlDSEFFTEEiLCJEQVlOQSIsIkNBUllOIiwiUk9TQUxJQSIsIlNVTiIsIkpBQ1FVTElORSIsIlJFQkVDQSIsIk1BUllCRVRIIiwiS1JZU1RMRSIsIklPTEEiLCJET1RUSUUiLCJCRU5OSUUiLCJCRUxMRSIsIkFVQlJFWSIsIkdSSVNFTERBIiwiRVJORVNUSU5BIiwiRUxJREEiLCJBRFJJQU5ORSIsIkRFTUVUUklBIiwiREVMTUEiLCJDSE9ORyIsIkpBUVVFTElORSIsIkRFU1RJTlkiLCJBUkxFRU4iLCJWSVJHSU5BIiwiUkVUSEEiLCJGQVRJTUEiLCJUSUxMSUUiLCJFTEVBTk9SRSIsIkNBUkkiLCJUUkVWQSIsIkJJUkRJRSIsIldJTEhFTE1JTkEiLCJST1NBTEVFIiwiTUFVUklORSIsIkxBVFJJQ0UiLCJZT05HIiwiSkVOQSIsIlRBUllOIiwiRUxJQSIsIkRFQkJZIiwiTUFVRElFIiwiSkVBTk5BIiwiREVMSUxBSCIsIkNBVFJJTkEiLCJTSE9OREEiLCJIT1JURU5DSUEiLCJUSEVPRE9SQSIsIlRFUkVTSVRBIiwiUk9CQklOIiwiREFORVRURSIsIk1BUllKQU5FIiwiRlJFRERJRSIsIkRFTFBISU5FIiwiQlJJQU5ORSIsIk5JTERBIiwiREFOTkEiLCJDSU5ESSIsIkJFU1MiLCJJT05BIiwiSEFOTkEiLCJBUklFTCIsIldJTk9OQSIsIlZJREEiLCJST1NJVEEiLCJNQVJJQU5OQSIsIldJTExJQU0iLCJSQUNIRUFMIiwiR1VJTExFUk1JTkEiLCJFTE9JU0EiLCJDRUxFU1RJTkUiLCJDQVJFTiIsIk1BTElTU0EiLCJMT05BIiwiQ0hBTlRFTCIsIlNIRUxMSUUiLCJNQVJJU0VMQSIsIkxFT1JBIiwiQUdBVEhBIiwiU09MRURBRCIsIk1JR0RBTElBIiwiSVZFVFRFIiwiQ0hSSVNURU4iLCJBVEhFTkEiLCJKQU5FTCIsIkNITE9FIiwiVkVEQSIsIlBBVFRJRSIsIlRFU1NJRSIsIlRFUkEiLCJNQVJJTFlOTiIsIkxVQ1JFVElBIiwiS0FSUklFIiwiRElOQUgiLCJEQU5JRUxBIiwiQUxFQ0lBIiwiQURFTElOQSIsIlZFUk5JQ0UiLCJTSElFTEEiLCJQT1JUSUEiLCJNRVJSWSIsIkxBU0hBV04iLCJERVZPTiIsIkRBUkEiLCJUQVdBTkEiLCJPTUEiLCJWRVJEQSIsIkNIUklTVElOIiwiQUxFTkUiLCJaRUxMQSIsIlNBTkRJIiwiUkFGQUVMQSIsIk1BWUEiLCJLSVJBIiwiQ0FORElEQSIsIkFMVklOQSIsIlNVWkFOIiwiU0hBWUxBIiwiTFlOIiwiTEVUVElFIiwiQUxWQSIsIlNBTUFUSEEiLCJPUkFMSUEiLCJNQVRJTERFIiwiTUFET05OQSIsIkxBUklTU0EiLCJWRVNUQSIsIlJFTklUQSIsIklORElBIiwiREVMT0lTIiwiU0hBTkRBIiwiUEhJTExJUyIsIkxPUlJJIiwiRVJMSU5EQSIsIkNSVVoiLCJDQVRIUklORSIsIkJBUkIiLCJaT0UiLCJJU0FCRUxMIiwiSU9ORSIsIkdJU0VMQSIsIkNIQVJMSUUiLCJWQUxFTkNJQSIsIlJPWEFOTkEiLCJNQVlNRSIsIktJU0hBIiwiRUxMSUUiLCJNRUxMSVNTQSIsIkRPUlJJUyIsIkRBTElBIiwiQkVMTEEiLCJBTk5FVFRBIiwiWk9JTEEiLCJSRVRBIiwiUkVJTkEiLCJMQVVSRVRUQSIsIktZTElFIiwiQ0hSSVNUQUwiLCJQSUxBUiIsIkNIQVJMQSIsIkVMSVNTQSIsIlRJRkZBTkkiLCJUQU5BIiwiUEFVTElOQSIsIkxFT1RBIiwiQlJFQU5OQSIsIkpBWU1FIiwiQ0FSTUVMIiwiVkVSTkVMTCIsIlRPTUFTQSIsIk1BTkRJIiwiRE9NSU5HQSIsIlNBTlRBIiwiTUVMT0RJRSIsIkxVUkEiLCJBTEVYQSIsIlRBTUVMQSIsIlJZQU4iLCJNSVJOQSIsIktFUlJJRSIsIlZFTlVTIiwiTk9FTCIsIkZFTElDSVRBIiwiQ1JJU1RZIiwiQ0FSTUVMSVRBIiwiQkVSTklFQ0UiLCJBTk5FTUFSSUUiLCJUSUFSQSIsIlJPU0VBTk5FIiwiTUlTU1kiLCJDT1JJIiwiUk9YQU5BIiwiUFJJQ0lMTEEiLCJLUklTVEFMIiwiSlVORyIsIkVMWVNFIiwiSEFZREVFIiwiQUxFVEhBIiwiQkVUVElOQSIsIk1BUkdFIiwiR0lMTElBTiIsIkZJTE9NRU5BIiwiQ0hBUkxFUyIsIlpFTkFJREEiLCJIQVJSSUVUVEUiLCJDQVJJREFEIiwiVkFEQSIsIlVOQSIsIkFSRVRIQSIsIlBFQVJMSU5FIiwiTUFSSk9SWSIsIk1BUkNFTEEiLCJGTE9SIiwiRVZFVFRFIiwiRUxPVUlTRSIsIkFMSU5BIiwiVFJJTklEQUQiLCJEQVZJRCIsIkRBTUFSSVMiLCJDQVRIQVJJTkUiLCJDQVJST0xMIiwiQkVMVkEiLCJOQUtJQSIsIk1BUkxFTkEiLCJMVUFOTkUiLCJMT1JJTkUiLCJLQVJPTiIsIkRPUkVORSIsIkRBTklUQSIsIkJSRU5OQSIsIlRBVElBTkEiLCJTQU1NSUUiLCJMT1VBTk4iLCJMT1JFTiIsIkpVTElBTk5BIiwiQU5EUklBIiwiUEhJTE9NRU5BIiwiTFVDSUxBIiwiTEVPTk9SQSIsIkRPVklFIiwiUk9NT05BIiwiTUlNSSIsIkpBQ1FVRUxJTiIsIkdBWUUiLCJUT05KQSIsIk1JU1RJIiwiSk9FIiwiR0VORSIsIkNIQVNUSVRZIiwiU1RBQ0lBIiwiUk9YQU5OIiwiTUlDQUVMQSIsIk5JS0lUQSIsIk1FSSIsIlZFTERBIiwiTUFSTFlTIiwiSk9ITk5BIiwiQVVSQSIsIkxBVkVSTiIsIklWT05ORSIsIkhBWUxFWSIsIk5JQ0tJIiwiTUFKT1JJRSIsIkhFUkxJTkRBIiwiR0VPUkdFIiwiQUxQSEEiLCJZQURJUkEiLCJQRVJMQSIsIkdSRUdPUklBIiwiREFOSUVMIiwiQU5UT05FVFRFIiwiU0hFTExJIiwiTU9aRUxMRSIsIk1BUklBSCIsIkpPRUxMRSIsIkNPUkRFTElBIiwiSk9TRVRURSIsIkNISVFVSVRBIiwiVFJJU1RBIiwiTE9VSVMiLCJMQVFVSVRBIiwiR0VPUkdJQU5BIiwiQ0FOREkiLCJTSEFOT04iLCJMT05OSUUiLCJISUxERUdBUkQiLCJDRUNJTCIsIlZBTEVOVElOQSIsIlNURVBIQU5ZIiwiTUFHREEiLCJLQVJPTCIsIkdFUlJZIiwiR0FCUklFTExBIiwiVElBTkEiLCJST01BIiwiUklDSEVMTEUiLCJSQVkiLCJQUklOQ0VTUyIsIk9MRVRBIiwiSkFDUVVFIiwiSURFTExBIiwiQUxBSU5BIiwiU1VaQU5OQSIsIkpPVklUQSIsIkJMQUlSIiwiVE9TSEEiLCJSQVZFTiIsIk5FUkVJREEiLCJNQVJMWU4iLCJLWUxBIiwiSk9TRVBIIiwiREVMRklOQSIsIlRFTkEiLCJTVEVQSEVOSUUiLCJTQUJJTkEiLCJOQVRIQUxJRSIsIk1BUkNFTExFIiwiR0VSVElFIiwiREFSTEVFTiIsIlRIRUEiLCJTSEFST05EQSIsIlNIQU5URUwiLCJCRUxFTiIsIlZFTkVTU0EiLCJST1NBTElOQSIsIk9OQSIsIkdFTk9WRVZBIiwiQ09SRVkiLCJDTEVNRU5USU5FIiwiUk9TQUxCQSIsIlJFTkFURSIsIlJFTkFUQSIsIk1JIiwiSVZPUlkiLCJHRU9SR0lBTk5BIiwiRkxPWSIsIkRPUkNBUyIsIkFSSUFOQSIsIlRZUkEiLCJUSEVEQSIsIk1BUklBTSIsIkpVTEkiLCJKRVNJQ0EiLCJET05OSUUiLCJWSUtLSSIsIlZFUkxBIiwiUk9TRUxZTiIsIk1FTFZJTkEiLCJKQU5ORVRURSIsIkdJTk5ZIiwiREVCUkFIIiwiQ09SUklFIiwiQVNJQSIsIlZJT0xFVEEiLCJNWVJUSVMiLCJMQVRSSUNJQSIsIkNPTExFVFRFIiwiQ0hBUkxFRU4iLCJBTklTU0EiLCJWSVZJQU5BIiwiVFdZTEEiLCJQUkVDSU9VUyIsIk5FRFJBIiwiTEFUT05JQSIsIkxBTiIsIkhFTExFTiIsIkZBQklPTEEiLCJBTk5BTUFSSUUiLCJBREVMTCIsIlNIQVJZTiIsIkNIQU5UQUwiLCJOSUtJIiwiTUFVRCIsIkxJWkVUVEUiLCJMSU5EWSIsIktJQSIsIktFU0hBIiwiSkVBTkEiLCJEQU5FTExFIiwiQ0hBUkxJTkUiLCJDSEFORUwiLCJDQVJST0wiLCJWQUxPUklFIiwiTElBIiwiRE9SVEhBIiwiQ1JJU1RBTCIsIlNVTk5ZIiwiTEVPTkUiLCJMRUlMQU5JIiwiR0VSUkkiLCJERUJJIiwiQU5EUkEiLCJLRVNISUEiLCJJTUEiLCJFVUxBTElBIiwiRUFTVEVSIiwiRFVMQ0UiLCJOQVRJVklEQUQiLCJMSU5OSUUiLCJLQU1JIiwiR0VPUkdJRSIsIkNBVElOQSIsIkJST09LIiwiQUxEQSIsIldJTk5JRlJFRCIsIlNIQVJMQSIsIlJVVEhBTk4iLCJNRUFHSEFOIiwiTUFHREFMRU5FIiwiTElTU0VUVEUiLCJBREVMQUlEQSIsIlZFTklUQSIsIlRSRU5BIiwiU0hJUkxFTkUiLCJTSEFNRUtBIiwiRUxJWkVCRVRIIiwiRElBTiIsIlNIQU5UQSIsIk1JQ0tFWSIsIkxBVE9TSEEiLCJDQVJMT1RUQSIsIldJTkRZIiwiU09PTiIsIlJPU0lOQSIsIk1BUklBTk4iLCJMRUlTQSIsIkpPTk5JRSIsIkRBV05BIiwiQ0FUSElFIiwiQklMTFkiLCJBU1RSSUQiLCJTSURORVkiLCJMQVVSRUVOIiwiSkFORUVOIiwiSE9MTEkiLCJGQVdOIiwiVklDS0VZIiwiVEVSRVNTQSIsIlNIQU5URSIsIlJVQllFIiwiTUFSQ0VMSU5BIiwiQ0hBTkRBIiwiQ0FSWSIsIlRFUkVTRSIsIlNDQVJMRVRUIiwiTUFSVFkiLCJNQVJOSUUiLCJMVUxVIiwiTElTRVRURSIsIkpFTklGRkVSIiwiRUxFTk9SIiwiRE9SSU5EQSIsIkRPTklUQSIsIkNBUk1BTiIsIkJFUk5JVEEiLCJBTFRBR1JBQ0lBIiwiQUxFVEEiLCJBRFJJQU5OQSIsIlpPUkFJREEiLCJST05OSUUiLCJOSUNPTEEiLCJMWU5EU0VZIiwiS0VOREFMTCIsIkpBTklOQSIsIkNIUklTU1kiLCJBTUkiLCJTVEFSTEEiLCJQSFlMSVMiLCJQSFVPTkciLCJLWVJBIiwiQ0hBUklTU0UiLCJCTEFOQ0giLCJTQU5KVUFOSVRBIiwiUk9OQSIsIk5BTkNJIiwiTUFSSUxFRSIsIk1BUkFOREEiLCJDT1JZIiwiQlJJR0VUVEUiLCJTQU5KVUFOQSIsIk1BUklUQSIsIktBU1NBTkRSQSIsIkpPWUNFTFlOIiwiSVJBIiwiRkVMSVBBIiwiQ0hFTFNJRSIsIkJPTk5ZIiwiTUlSRVlBIiwiTE9SRU5aQSIsIktZT05HIiwiSUxFQU5BIiwiQ0FOREVMQVJJQSIsIlRPTlkiLCJUT0JZIiwiU0hFUklFIiwiT0siLCJNQVJLIiwiTFVDSUUiLCJMRUFUUklDRSIsIkxBS0VTSElBIiwiR0VSREEiLCJFRElFIiwiQkFNQkkiLCJNQVJZTElOIiwiTEFWT04iLCJIT1JURU5TRSIsIkdBUk5FVCIsIkVWSUUiLCJUUkVTU0EiLCJTSEFZTkEiLCJMQVZJTkEiLCJLWVVORyIsIkpFQU5FVFRBIiwiU0hFUlJJTEwiLCJTSEFSQSIsIlBIWUxJU1MiLCJNSVRUSUUiLCJBTkFCRUwiLCJBTEVTSUEiLCJUSFVZIiwiVEFXQU5EQSIsIlJJQ0hBUkQiLCJKT0FOSUUiLCJUSUZGQU5JRSIsIkxBU0hBTkRBIiwiS0FSSVNTQSIsIkVOUklRVUVUQSIsIkRBUklBIiwiREFOSUVMTEEiLCJDT1JJTk5BIiwiQUxBTk5BIiwiQUJCRVkiLCJST1hBTkUiLCJST1NFQU5OQSIsIk1BR05PTElBIiwiTElEQSIsIktZTEUiLCJKT0VMTEVOIiwiRVJBIiwiQ09SQUwiLCJDQVJMRUVOIiwiVFJFU0EiLCJQRUdHSUUiLCJOT1ZFTExBIiwiTklMQSIsIk1BWUJFTExFIiwiSkVORUxMRSIsIkNBUklOQSIsIk5PVkEiLCJNRUxJTkEiLCJNQVJRVUVSSVRFIiwiTUFSR0FSRVRURSIsIkpPU0VQSElOQSIsIkVWT05ORSIsIkRFVklOIiwiQ0lOVEhJQSIsIkFMQklOQSIsIlRPWUEiLCJUQVdOWUEiLCJTSEVSSVRBIiwiU0FOVE9TIiwiTVlSSUFNIiwiTElaQUJFVEgiLCJMSVNFIiwiS0VFTFkiLCJKRU5OSSIsIkdJU0VMTEUiLCJDSEVSWUxFIiwiQVJESVRIIiwiQVJESVMiLCJBTEVTSEEiLCJBRFJJQU5FIiwiU0hBSU5BIiwiTElOTkVBIiwiS0FST0xZTiIsIkhPTkciLCJGTE9SSURBIiwiRkVMSVNIQSIsIkRPUkkiLCJEQVJDSSIsIkFSVElFIiwiQVJNSURBIiwiWk9MQSIsIlhJT01BUkEiLCJWRVJHSUUiLCJTSEFNSUtBIiwiTkVOQSIsIk5BTk5FVFRFIiwiTUFYSUUiLCJMT1ZJRSIsIkpFQU5FIiwiSkFJTUlFIiwiSU5HRSIsIkZBUlJBSCIsIkVMQUlOQSIsIkNBSVRMWU4iLCJTVEFSUiIsIkZFTElDSVRBUyIsIkNIRVJMWSIsIkNBUllMIiwiWU9MT05EQSIsIllBU01JTiIsIlRFRU5BIiwiUFJVREVOQ0UiLCJQRU5OSUUiLCJOWURJQSIsIk1BQ0tFTlpJRSIsIk9SUEhBIiwiTUFSVkVMIiwiTElaQkVUSCIsIkxBVVJFVFRFIiwiSkVSUklFIiwiSEVSTUVMSU5EQSIsIkNBUk9MRUUiLCJUSUVSUkEiLCJNSVJJQU4iLCJNRVRBIiwiTUVMT05ZIiwiS09SSSIsIkpFTk5FVFRFIiwiSkFNSUxBIiwiRU5BIiwiQU5IIiwiWU9TSElLTyIsIlNVU0FOTkFIIiwiU0FMSU5BIiwiUkhJQU5OT04iLCJKT0xFRU4iLCJDUklTVElORSIsIkFTSFRPTiIsIkFSQUNFTFkiLCJUT01FS0EiLCJTSEFMT05EQSIsIk1BUlRJIiwiTEFDSUUiLCJLQUxBIiwiSkFEQSIsIklMU0UiLCJIQUlMRVkiLCJCUklUVEFOSSIsIlpPTkEiLCJTWUJMRSIsIlNIRVJSWUwiLCJSQU5EWSIsIk5JRElBIiwiTUFSTE8iLCJLQU5ESUNFIiwiS0FOREkiLCJERUIiLCJERUFOIiwiQU1FUklDQSIsIkFMWUNJQSIsIlRPTU1ZIiwiUk9OTkEiLCJOT1JFTkUiLCJNRVJDWSIsIkpPU0UiLCJJTkdFQk9SRyIsIkdJT1ZBTk5BIiwiR0VNTUEiLCJDSFJJU1RFTCIsIkFVRFJZIiwiWk9SQSIsIlZJVEEiLCJWQU4iLCJUUklTSCIsIlNURVBIQUlORSIsIlNISVJMRUUiLCJTSEFOSUtBIiwiTUVMT05JRSIsIk1BWklFIiwiSkFaTUlOIiwiSU5HQSIsIkhPQSIsIkhFVFRJRSIsIkdFUkFMWU4iLCJGT05EQSIsIkVTVFJFTExBIiwiQURFTExBIiwiU1UiLCJTQVJJVEEiLCJSSU5BIiwiTUlMSVNTQSIsIk1BUklCRVRIIiwiR09MREEiLCJFVk9OIiwiRVRIRUxZTiIsIkVORURJTkEiLCJDSEVSSVNFIiwiQ0hBTkEiLCJWRUxWQSIsIlRBV0FOTkEiLCJTQURFIiwiTUlSVEEiLCJMSSIsIktBUklFIiwiSkFDSU5UQSIsIkVMTkEiLCJEQVZJTkEiLCJDSUVSUkEiLCJBU0hMSUUiLCJBTEJFUlRIQSIsIlRBTkVTSEEiLCJTVEVQSEFOSSIsIk5FTExFIiwiTUlOREkiLCJMVSIsIkxPUklOREEiLCJMQVJVRSIsIkZMT1JFTkUiLCJERU1FVFJBIiwiREVEUkEiLCJDSUFSQSIsIkNIQU5URUxMRSIsIkFTSExZIiwiU1VaWSIsIlJPU0FMVkEiLCJOT0VMSUEiLCJMWURBIiwiTEVBVEhBIiwiS1JZU1RZTkEiLCJLUklTVEFOIiwiS0FSUkkiLCJEQVJMSU5FIiwiREFSQ0lFIiwiQ0lOREEiLCJDSEVZRU5ORSIsIkNIRVJSSUUiLCJBV0lMREEiLCJBTE1FREEiLCJST0xBTkRBIiwiTEFORVRURSIsIkpFUklMWU4iLCJHSVNFTEUiLCJFVkFMWU4iLCJDWU5ESSIsIkNMRVRBIiwiQ0FSSU4iLCJaSU5BIiwiWkVOQSIsIlZFTElBIiwiVEFOSUtBIiwiUEFVTCIsIkNIQVJJU1NBIiwiVEhPTUFTIiwiVEFMSUEiLCJNQVJHQVJFVEUiLCJMQVZPTkRBIiwiS0FZTEVFIiwiS0FUSExFTkUiLCJKT05OQSIsIklSRU5BIiwiSUxPTkEiLCJJREFMSUEiLCJDQU5ESVMiLCJDQU5EQU5DRSIsIkJSQU5ERUUiLCJBTklUUkEiLCJBTElEQSIsIlNJR1JJRCIsIk5JQ09MRVRURSIsIk1BUllKTyIsIkxJTkVUVEUiLCJIRURXSUciLCJDSFJJU1RJQU5BIiwiQ0FTU0lEWSIsIkFMRVhJQSIsIlRSRVNTSUUiLCJNT0RFU1RBIiwiTFVQSVRBIiwiTElUQSIsIkdMQURJUyIsIkVWRUxJQSIsIkRBVklEQSIsIkNIRVJSSSIsIkNFQ0lMWSIsIkFTSEVMWSIsIkFOTkFCRUwiLCJBR1VTVElOQSIsIldBTklUQSIsIlNISVJMWSIsIlJPU0FVUkEiLCJIVUxEQSIsIkVVTiIsIkJBSUxFWSIsIllFVFRBIiwiVkVST05BIiwiVEhPTUFTSU5BIiwiU0lCWUwiLCJTSEFOTkFOIiwiTUVDSEVMTEUiLCJMVUUiLCJMRUFORFJBIiwiTEFOSSIsIktZTEVFIiwiS0FORFkiLCJKT0xZTk4iLCJGRVJORSIsIkVCT05JIiwiQ09SRU5FIiwiQUxZU0lBIiwiWlVMQSIsIk5BREEiLCJNT0lSQSIsIkxZTkRTQVkiLCJMT1JSRVRUQSIsIkpVQU4iLCJKQU1NSUUiLCJIT1JURU5TSUEiLCJHQVlORUxMIiwiQ0FNRVJPTiIsIkFEUklBIiwiVklOQSIsIlZJQ0VOVEEiLCJUQU5HRUxBIiwiU1RFUEhJTkUiLCJOT1JJTkUiLCJORUxMQSIsIkxJQU5BIiwiTEVTTEVFIiwiS0lNQkVSRUxZIiwiSUxJQU5BIiwiR0xPUlkiLCJGRUxJQ0EiLCJFTU9HRU5FIiwiRUxGUklFREUiLCJFREVOIiwiRUFSVEhBIiwiQ0FSTUEiLCJCRUEiLCJPQ0lFIiwiTUFSUlkiLCJMRU5OSUUiLCJLSUFSQSIsIkpBQ0FMWU4iLCJDQVJMT1RBIiwiQVJJRUxMRSIsIllVIiwiU1RBUiIsIk9USUxJQSIsIktJUlNUSU4iLCJLQUNFWSIsIkpPSE5FVFRBIiwiSk9FWSIsIkpPRVRUQSIsIkpFUkFMRElORSIsIkpBVU5JVEEiLCJFTEFOQSIsIkRPUlRIRUEiLCJDQU1JIiwiQU1BREEiLCJBREVMSUEiLCJWRVJOSVRBIiwiVEFNQVIiLCJTSU9CSEFOIiwiUkVORUEiLCJSQVNISURBIiwiT1VJREEiLCJPREVMTCIsIk5JTFNBIiwiTUVSWUwiLCJLUklTVFlOIiwiSlVMSUVUQSIsIkRBTklDQSIsIkJSRUFOTkUiLCJBVVJFQSIsIkFOR0xFQSIsIlNIRVJST04iLCJPREVUVEUiLCJNQUxJQSIsIkxPUkVMRUkiLCJMSU4iLCJMRUVTQSIsIktFTk5BIiwiS0FUSExZTiIsIkZJT05BIiwiQ0hBUkxFVFRFIiwiU1VaSUUiLCJTSEFOVEVMTCIsIlNBQlJBIiwiUkFDUVVFTCIsIk1ZT05HIiwiTUlSQSIsIk1BUlRJTkUiLCJMVUNJRU5ORSIsIkxBVkFEQSIsIkpVTElBTk4iLCJKT0hOSUUiLCJFTFZFUkEiLCJERUxQSElBIiwiQ0xBSVIiLCJDSFJJU1RJQU5FIiwiQ0hBUk9MRVRURSIsIkNBUlJJIiwiQVVHVVNUSU5FIiwiQVNIQSIsIkFOR0VMTEEiLCJQQU9MQSIsIk5JTkZBIiwiTEVEQSIsIkxBSSIsIkVEQSIsIlNVTlNISU5FIiwiU1RFRkFOSSIsIlNIQU5FTEwiLCJQQUxNQSIsIk1BQ0hFTExFIiwiTElTU0EiLCJLRUNJQSIsIktBVEhSWU5FIiwiS0FSTEVORSIsIkpVTElTU0EiLCJKRVRUSUUiLCJKRU5OSUZGRVIiLCJIVUkiLCJDT1JSSU5BIiwiQ0hSSVNUT1BIRVIiLCJDQVJPTEFOTiIsIkFMRU5BIiwiVEVTUyIsIlJPU0FSSUEiLCJNWVJUSUNFIiwiTUFSWUxFRSIsIkxJQU5FIiwiS0VOWUFUVEEiLCJKVURJRSIsIkpBTkVZIiwiSU4iLCJFTE1JUkEiLCJFTERPUkEiLCJERU5OQSIsIkNSSVNUSSIsIkNBVEhJIiwiWkFJREEiLCJWT05OSUUiLCJWSVZBIiwiVkVSTklFIiwiUk9TQUxJTkUiLCJNQVJJRUxBIiwiTFVDSUFOQSIsIkxFU0xJIiwiS0FSQU4iLCJGRUxJQ0UiLCJERU5FRU4iLCJBRElOQSIsIldZTk9OQSIsIlRBUlNIQSIsIlNIRVJPTiIsIlNIQVNUQSIsIlNIQU5JVEEiLCJTSEFOSSIsIlNIQU5EUkEiLCJSQU5EQSIsIlBJTktJRSIsIlBBUklTIiwiTkVMSURBIiwiTUFSSUxPVSIsIkxZTEEiLCJMQVVSRU5FIiwiTEFDSSIsIkpPSSIsIkpBTkVORSIsIkRPUk9USEEiLCJEQU5JRUxFIiwiREFOSSIsIkNBUk9MWU5OIiwiQ0FSTFlOIiwiQkVSRU5JQ0UiLCJBWUVTSEEiLCJBTk5FTElFU0UiLCJBTEVUSEVBIiwiVEhFUlNBIiwiVEFNSUtPIiwiUlVGSU5BIiwiT0xJVkEiLCJNT1pFTEwiLCJNQVJZTFlOIiwiTUFESVNPTiIsIktSSVNUSUFOIiwiS0FUSFlSTiIsIktBU0FORFJBIiwiS0FOREFDRSIsIkpBTkFFIiwiR0FCUklFTCIsIkRPTUVOSUNBIiwiREVCQlJBIiwiREFOTklFTExFIiwiQ0hVTiIsIkJVRkZZIiwiQkFSQklFIiwiQVJDRUxJQSIsIkFKQSIsIlpFTk9CSUEiLCJTSEFSRU4iLCJTSEFSRUUiLCJQQVRSSUNLIiwiUEFHRSIsIk1ZIiwiTEFWSU5JQSIsIktVTSIsIktBQ0lFIiwiSkFDS0VMSU5FIiwiSFVPTkciLCJGRUxJU0EiLCJFTUVMSUEiLCJFTEVBTk9SQSIsIkNZVEhJQSIsIkNSSVNUSU4iLCJDTFlERSIsIkNMQVJJQkVMIiwiQ0FST04iLCJBTkFTVEFDSUEiLCJaVUxNQSIsIlpBTkRSQSIsIllPS08iLCJURU5JU0hBIiwiU1VTQU5OIiwiU0hFUklMWU4iLCJTSEFZIiwiU0hBV0FOREEiLCJTQUJJTkUiLCJST01BTkEiLCJNQVRISUxEQSIsIkxJTlNFWSIsIktFSUtPIiwiSk9BTkEiLCJJU0VMQSIsIkdSRVRUQSIsIkdFT1JHRVRUQSIsIkVVR0VOSUUiLCJEVVNUWSIsIkRFU0lSQUUiLCJERUxPUkEiLCJDT1JBWk9OIiwiQU5UT05JTkEiLCJBTklLQSIsIldJTExFTkUiLCJUUkFDRUUiLCJUQU1BVEhBIiwiUkVHQU4iLCJOSUNIRUxMRSIsIk1JQ0tJRSIsIk1BRUdBTiIsIkxVQU5BIiwiTEFOSVRBIiwiS0VMU0lFIiwiRURFTE1JUkEiLCJCUkVFIiwiQUZUT04iLCJURU9ET1JBIiwiVEFNSUUiLCJTSEVOQSIsIk1FRyIsIkxJTkgiLCJLRUxJIiwiS0FDSSIsIkRBTllFTExFIiwiQlJJVFQiLCJBUkxFVFRFIiwiQUxCRVJUSU5FIiwiQURFTExFIiwiVElGRklOWSIsIlNUT1JNWSIsIlNJTU9OQSIsIk5VTUJFUlMiLCJOSUNPTEFTQSIsIk5JQ0hPTCIsIk5JQSIsIk5BS0lTSEEiLCJNRUUiLCJNQUlSQSIsIkxPUkVFTiIsIktJWlpZIiwiSk9ITk5ZIiwiSkFZIiwiRkFMTE9OIiwiQ0hSSVNURU5FIiwiQk9CQllFIiwiQU5USE9OWSIsIllJTkciLCJWSU5DRU5aQSIsIlRBTkpBIiwiUlVCSUUiLCJST05JIiwiUVVFRU5JRSIsIk1BUkdBUkVUVCIsIktJTUJFUkxJIiwiSVJNR0FSRCIsIklERUxMIiwiSElMTUEiLCJFVkVMSU5BIiwiRVNUQSIsIkVNSUxFRSIsIkRFTk5JU0UiLCJEQU5JQSIsIkNBUkwiLCJDQVJJRSIsIkFOVE9OSU8iLCJXQUkiLCJTQU5HIiwiUklTQSIsIlJJS0tJIiwiUEFSVElDSUEiLCJNVUkiLCJNQVNBS08iLCJNQVJJTyIsIkxVVkVOSUEiLCJMT1JFRSIsIkxPTkkiLCJMSUVOIiwiS0VWSU4iLCJHSUdJIiwiRkxPUkVOQ0lBIiwiRE9SSUFOIiwiREVOSVRBIiwiREFMTEFTIiwiQ0hJIiwiQklMTFlFIiwiQUxFWEFOREVSIiwiVE9NSUtBIiwiU0hBUklUQSIsIlJBTkEiLCJOSUtPTEUiLCJORU9NQSIsIk1BUkdBUklURSIsIk1BREFMWU4iLCJMVUNJTkEiLCJMQUlMQSIsIktBTEkiLCJKRU5FVFRFIiwiR0FCUklFTEUiLCJFVkVMWU5FIiwiRUxFTk9SQSIsIkNMRU1FTlRJTkEiLCJBTEVKQU5EUklOQSIsIlpVTEVNQSIsIlZJT0xFVFRFIiwiVkFOTkVTU0EiLCJUSFJFU0EiLCJSRVRUQSIsIlBJQSIsIlBBVElFTkNFIiwiTk9FTExBIiwiTklDS0lFIiwiSk9ORUxMIiwiREVMVEEiLCJDSFVORyIsIkNIQVlBIiwiQ0FNRUxJQSIsIkJFVEhFTCIsIkFOWUEiLCJBTkRSRVciLCJUSEFOSCIsIlNVWkFOTiIsIlNQUklORyIsIlNIVSIsIk1JTEEiLCJMSUxMQSIsIkxBVkVSTkEiLCJLRUVTSEEiLCJLQVRUSUUiLCJHSUEiLCJHRU9SR0VORSIsIkVWRUxJTkUiLCJFU1RFTEwiLCJFTElaQkVUSCIsIlZJVklFTk5FIiwiVkFMTElFIiwiVFJVRElFIiwiU1RFUEhBTkUiLCJNSUNIRUwiLCJNQUdBTFkiLCJNQURJRSIsIktFTllFVFRBIiwiS0FSUkVOIiwiSkFORVRUQSIsIkhFUk1JTkUiLCJIQVJNT05ZIiwiRFJVQ0lMTEEiLCJERUJCSSIsIkNFTEVTVElOQSIsIkNBTkRJRSIsIkJSSVROSSIsIkJFQ0tJRSIsIkFNSU5BIiwiWklUQSIsIllVTiIsIllPTEFOREUiLCJWSVZJRU4iLCJWRVJORVRUQSIsIlRSVURJIiwiU09NTUVSIiwiUEVBUkxFIiwiUEFUUklOQSIsIk9TU0lFIiwiTklDT0xMRSIsIkxPWUNFIiwiTEVUVFkiLCJMQVJJU0EiLCJLQVRIQVJJTkEiLCJKT1NFTFlOIiwiSk9ORUxMRSIsIkpFTkVMTCIsIklFU0hBIiwiSEVJREUiLCJGTE9SSU5EQSIsIkZMT1JFTlRJTkEiLCJGTE8iLCJFTE9ESUEiLCJET1JJTkUiLCJCUlVOSUxEQSIsIkJSSUdJRCIsIkFTSExJIiwiQVJERUxMQSIsIlRXQU5BIiwiVEhVIiwiVEFSQUgiLCJTVU5HIiwiU0hFQSIsIlNIQVZPTiIsIlNIQU5FIiwiU0VSSU5BIiwiUkFZTkEiLCJSQU1PTklUQSIsIk5HQSIsIk1BUkdVUklURSIsIkxVQ1JFQ0lBIiwiS09VUlRORVkiLCJLQVRJIiwiSkVTVVMiLCJKRVNFTklBIiwiRElBTU9ORCIsIkNSSVNUQSIsIkFZQU5BIiwiQUxJQ0EiLCJBTElBIiwiVklOTklFIiwiU1VFTExFTiIsIlJPTUVMSUEiLCJSQUNIRUxMIiwiUElQRVIiLCJPTFlNUElBIiwiTUlDSElLTyIsIktBVEhBTEVFTiIsIkpPTElFIiwiSkVTU0kiLCJKQU5FU1NBIiwiSEFOQSIsIkhBIiwiRUxFQVNFIiwiQ0FSTEVUVEEiLCJCUklUQU5ZIiwiU0hPTkEiLCJTQUxPTUUiLCJST1NBTU9ORCIsIlJFR0VOQSIsIlJBSU5BIiwiTkdPQyIsIk5FTElBIiwiTE9VVkVOSUEiLCJMRVNJQSIsIkxBVFJJTkEiLCJMQVRJQ0lBIiwiTEFSSE9OREEiLCJKSU5BIiwiSkFDS0kiLCJIT0xMSVMiLCJIT0xMRVkiLCJFTU1ZIiwiREVFQU5OIiwiQ09SRVRUQSIsIkFSTkVUVEEiLCJWRUxWRVQiLCJUSEFMSUEiLCJTSEFOSUNFIiwiTkVUQSIsIk1JS0tJIiwiTUlDS0kiLCJMT05OQSIsIkxFQU5BIiwiTEFTSFVOREEiLCJLSUxFWSIsIkpPWUUiLCJKQUNRVUxZTiIsIklHTkFDSUEiLCJIWVVOIiwiSElST0tPIiwiSEVOUlkiLCJIRU5SSUVUVEUiLCJFTEFZTkUiLCJERUxJTkRBIiwiREFSTkVMTCIsIkRBSExJQSIsIkNPUkVFTiIsIkNPTlNVRUxBIiwiQ09OQ0hJVEEiLCJDRUxJTkUiLCJCQUJFVFRFIiwiQVlBTk5BIiwiQU5FVFRFIiwiQUxCRVJUSU5BIiwiU0tZRSIsIlNIQVdORUUiLCJTSEFORUtBIiwiUVVJQU5BIiwiUEFNRUxJQSIsIk1JTiIsIk1FUlJJIiwiTUVSTEVORSIsIk1BUkdJVCIsIktJRVNIQSIsIktJRVJBIiwiS0FZTEVORSIsIkpPREVFIiwiSkVOSVNFIiwiRVJMRU5FIiwiRU1NSUUiLCJFTFNFIiwiREFSWUwiLCJEQUxJTEEiLCJEQUlTRVkiLCJDT0RZIiwiQ0FTSUUiLCJCRUxJQSIsIkJBQkFSQSIsIlZFUlNJRSIsIlZBTkVTQSIsIlNIRUxCQSIsIlNIQVdOREEiLCJTQU0iLCJOT1JNQU4iLCJOSUtJQSIsIk5BT01BIiwiTUFSTkEiLCJNQVJHRVJFVCIsIk1BREFMSU5FIiwiTEFXQU5BIiwiS0lORFJBIiwiSlVUVEEiLCJKQVpNSU5FIiwiSkFORVRUIiwiSEFOTkVMT1JFIiwiR0xFTkRPUkEiLCJHRVJUUlVEIiwiR0FSTkVUVCIsIkZSRUVEQSIsIkZSRURFUklDQSIsIkZMT1JBTkNFIiwiRkxBVklBIiwiREVOTklTIiwiQ0FSTElORSIsIkJFVkVSTEVFIiwiQU5KQU5FVFRFIiwiVkFMREEiLCJUUklOSVRZIiwiVEFNQUxBIiwiU1RFVklFIiwiU0hPTk5BIiwiU0hBIiwiU0FSSU5BIiwiT05FSURBIiwiTUlDQUgiLCJNRVJJTFlOIiwiTUFSTEVFTiIsIkxVUkxJTkUiLCJMRU5OQSIsIktBVEhFUklOIiwiSklOIiwiSkVOSSIsIkhBRSIsIkdSQUNJQSIsIkdMQURZIiwiRkFSQUgiLCJFUklDIiwiRU5PTEEiLCJFTUEiLCJET01JTlFVRSIsIkRFVk9OQSIsIkRFTEFOQSIsIkNFQ0lMQSIsIkNBUFJJQ0UiLCJBTFlTSEEiLCJBTEkiLCJBTEVUSElBIiwiVkVOQSIsIlRIRVJFU0lBIiwiVEFXTlkiLCJTT05HIiwiU0hBS0lSQSIsIlNBTUFSQSIsIlNBQ0hJS08iLCJSQUNIRUxFIiwiUEFNRUxMQSIsIk5JQ0tZIiwiTUFSTkkiLCJNQVJJRUwiLCJNQVJFTiIsIk1BTElTQSIsIkxJR0lBIiwiTEVSQSIsIkxBVE9SSUEiLCJMQVJBRSIsIktJTUJFUiIsIktBVEhFUk4iLCJLQVJFWSIsIkpFTk5FRkVSIiwiSkFORVRIIiwiSEFMSU5BIiwiRlJFRElBIiwiREVMSVNBIiwiREVCUk9BSCIsIkNJRVJBIiwiQ0hJTiIsIkFOR0VMSUtBIiwiQU5EUkVFIiwiQUxUSEEiLCJZRU4iLCJWSVZBTiIsIlRFUlJFU0EiLCJUQU5OQSIsIlNVSyIsIlNVRElFIiwiU09PIiwiU0lHTkUiLCJTQUxFTkEiLCJST05OSSIsIlJFQkJFQ0NBIiwiTVlSVElFIiwiTUNLRU5aSUUiLCJNQUxJS0EiLCJNQUlEQSIsIkxPQU4iLCJMRU9OQVJEQSIsIktBWUxFSUdIIiwiRlJBTkNFIiwiRVRIWUwiLCJFTExZTiIsIkRBWUxFIiwiQ0FNTUlFIiwiQlJJVFROSSIsIkJJUkdJVCIsIkFWRUxJTkEiLCJBU1VOQ0lPTiIsIkFSSUFOTkEiLCJBS0lLTyIsIlZFTklDRSIsIlRZRVNIQSIsIlRPTklFIiwiVElFU0hBIiwiVEFLSVNIQSIsIlNURUZGQU5JRSIsIlNJTkRZIiwiU0FOVEFOQSIsIk1FR0hBTk4iLCJNQU5EQSIsIk1BQ0lFIiwiTEFEWSIsIktFTExZRSIsIktFTExFRSIsIkpPU0xZTiIsIkpBU09OIiwiSU5HRVIiLCJJTkRJUkEiLCJHTElOREEiLCJHTEVOTklTIiwiRkVSTkFOREEiLCJGQVVTVElOQSIsIkVORUlEQSIsIkVMSUNJQSIsIkRPVCIsIkRJR05BIiwiREVMTCIsIkFSTEVUVEEiLCJBTkRSRSIsIldJTExJQSIsIlRBTU1BUkEiLCJUQUJFVEhBIiwiU0hFUlJFTEwiLCJTQVJJIiwiUkVGVUdJTyIsIlJFQkJFQ0EiLCJQQVVMRVRUQSIsIk5JRVZFUyIsIk5BVE9TSEEiLCJOQUtJVEEiLCJNQU1NSUUiLCJLRU5JU0hBIiwiS0FaVUtPIiwiS0FTU0lFIiwiR0FSWSIsIkVBUkxFQU4iLCJEQVBISU5FIiwiQ09STElTUyIsIkNMT1RJTERFIiwiQ0FST0xZTkUiLCJCRVJORVRUQSIsIkFVR1VTVElOQSIsIkFVRFJFQSIsIkFOTklTIiwiQU5OQUJFTEwiLCJZQU4iLCJURU5OSUxMRSIsIlRBTUlDQSIsIlNFTEVORSIsIlNFQU4iLCJST1NBTkEiLCJSRUdFTklBIiwiUUlBTkEiLCJNQVJLSVRBIiwiTUFDWSIsIkxFRUFOTkUiLCJMQVVSSU5FIiwiS1lNIiwiSkVTU0VOSUEiLCJKQU5JVEEiLCJHRU9SR0lORSIsIkdFTklFIiwiRU1JS08iLCJFTFZJRSIsIkRFQU5EUkEiLCJEQUdNQVIiLCJDT1JJRSIsIkNPTExFTiIsIkNIRVJJU0giLCJST01BSU5FIiwiUE9SU0hBIiwiUEVBUkxFTkUiLCJNSUNIRUxJTkUiLCJNRVJOQSIsIk1BUkdPUklFIiwiTUFSR0FSRVRUQSIsIkxPUkUiLCJLRU5ORVRIIiwiSkVOSU5FIiwiSEVSTUlOQSIsIkZSRURFUklDS0EiLCJFTEtFIiwiRFJVU0lMTEEiLCJET1JBVEhZIiwiRElPTkUiLCJERVNJUkUiLCJDRUxFTkEiLCJCUklHSURBIiwiQU5HRUxFUyIsIkFMTEVHUkEiLCJUSEVPIiwiVEFNRUtJQSIsIlNZTlRISUEiLCJTVEVQSEVOIiwiU09PSyIsIlNMWVZJQSIsIlJPU0FOTiIsIlJFQVRIQSIsIlJBWUUiLCJNQVJRVUVUVEEiLCJNQVJHQVJUIiwiTElORyIsIkxBWUxBIiwiS1lNQkVSTFkiLCJLSUFOQSIsIktBWUxFRU4iLCJLQVRMWU4iLCJLQVJNRU4iLCJKT0VMTEEiLCJJUklOQSIsIkVNRUxEQSIsIkVMRU5JIiwiREVUUkEiLCJDTEVNTUlFIiwiQ0hFUllMTCIsIkNIQU5URUxMIiwiQ0FUSEVZIiwiQVJOSVRBIiwiQVJMQSIsIkFOR0xFIiwiQU5HRUxJQyIsIkFMWVNFIiwiWk9GSUEiLCJUSE9NQVNJTkUiLCJURU5OSUUiLCJTT04iLCJTSEVSTFkiLCJTSEVSTEVZIiwiU0hBUllMIiwiUkVNRURJT1MiLCJQRVRSSU5BIiwiTklDS09MRSIsIk1ZVU5HIiwiTVlSTEUiLCJNT1pFTExBIiwiTE9VQU5ORSIsIkxJU0hBIiwiTEFUSUEiLCJMQU5FIiwiS1JZU1RBIiwiSlVMSUVOTkUiLCJKT0VMIiwiSkVBTkVORSIsIkpBQ1FVQUxJTkUiLCJJU0FVUkEiLCJHV0VOREEiLCJFQVJMRUVOIiwiRE9OQUxEIiwiQ0xFT1BBVFJBIiwiQ0FSTElFIiwiQVVESUUiLCJBTlRPTklFVFRBIiwiQUxJU0UiLCJBTEVYIiwiVkVSREVMTCIsIlZBTCIsIlRZTEVSIiwiVE9NT0tPIiwiVEhBTyIsIlRBTElTSEEiLCJTVEVWRU4iLCJTTyIsIlNIRU1JS0EiLCJTSEFVTiIsIlNDQVJMRVQiLCJTQVZBTk5BIiwiU0FOVElOQSIsIlJPU0lBIiwiUkFFQU5OIiwiT0RJTElBIiwiTkFOQSIsIk1JTk5BIiwiTUFHQU4iLCJMWU5FTExFIiwiTEUiLCJLQVJNQSIsIkpPRUFOTiIsIklWQU5BIiwiSU5FTEwiLCJJTEFOQSIsIkhZRSIsIkhPTkVZIiwiSEVFIiwiR1VEUlVOIiwiRlJBTksiLCJEUkVBTUEiLCJDUklTU1kiLCJDSEFOVEUiLCJDQVJNRUxJTkEiLCJBUlZJTExBIiwiQVJUSFVSIiwiQU5OQU1BRSIsIkFMVkVSQSIsIkFMRUlEQSIsIkFBUk9OIiwiWUVFIiwiWUFOSVJBIiwiVkFOREEiLCJUSUFOTkEiLCJUQU0iLCJTVEVGQU5JQSIsIlNISVJBIiwiUEVSUlkiLCJOSUNPTCIsIk5BTkNJRSIsIk1PTlNFUlJBVEUiLCJNSU5IIiwiTUVMWU5EQSIsIk1FTEFOWSIsIk1BVFRIRVciLCJMT1ZFTExBIiwiTEFVUkUiLCJLSVJCWSIsIktBQ1kiLCJKQUNRVUVMWU5OIiwiSFlPTiIsIkdFUlRIQSIsIkZSQU5DSVNDTyIsIkVMSUFOQSIsIkNIUklTVEVOQSIsIkNIUklTVEVFTiIsIkNIQVJJU0UiLCJDQVRFUklOQSIsIkNBUkxFWSIsIkNBTkRZQ0UiLCJBUkxFTkEiLCJBTU1JRSIsIllBTkciLCJXSUxMRVRURSIsIlZBTklUQSIsIlRVWUVUIiwiVElOWSIsIlNZUkVFVEEiLCJTSUxWQSIsIlNDT1RUIiwiUk9OQUxEIiwiUEVOTkVZIiwiTllMQSIsIk1JQ0hBTCIsIk1BVVJJQ0UiLCJNQVJZQU0iLCJNQVJZQSIsIk1BR0VOIiwiTFVESUUiLCJMT01BIiwiTElWSUEiLCJMQU5FTEwiLCJLSU1CRVJMSUUiLCJKVUxFRSIsIkRPTkVUVEEiLCJESUVEUkEiLCJERU5JU0hBIiwiREVBTkUiLCJEQVdORSIsIkNMQVJJTkUiLCJDSEVSUllMIiwiQlJPTldZTiIsIkJSQU5ET04iLCJBTExBIiwiVkFMRVJZIiwiVE9OREEiLCJTVUVBTk4iLCJTT1JBWUEiLCJTSE9TSEFOQSIsIlNIRUxBIiwiU0hBUkxFRU4iLCJTSEFORUxMRSIsIk5FUklTU0EiLCJNSUNIRUFMIiwiTUVSSURJVEgiLCJNRUxMSUUiLCJNQVlFIiwiTUFQTEUiLCJNQUdBUkVUIiwiTFVJUyIsIkxJTEkiLCJMRU9OSUxBIiwiTEVPTklFIiwiTEVFQU5OQSIsIkxBVk9OSUEiLCJMQVZFUkEiLCJLUklTVEVMIiwiS0FUSEVZIiwiS0FUSEUiLCJKVVNUSU4iLCJKVUxJQU4iLCJKSU1NWSIsIkpBTk4iLCJJTERBIiwiSElMRFJFRCIsIkhJTERFR0FSREUiLCJHRU5JQSIsIkZVTUlLTyIsIkVWRUxJTiIsIkVSTUVMSU5EQSIsIkVMTFkiLCJEVU5HIiwiRE9MT1JJUyIsIkRJT05OQSIsIkRBTkFFIiwiQkVSTkVJQ0UiLCJBTk5JQ0UiLCJBTElYIiwiVkVSRU5BIiwiVkVSRElFIiwiVFJJU1RBTiIsIlNIQVdOTkEiLCJTSEFXQU5BIiwiU0hBVU5OQSIsIlJPWkVMTEEiLCJSQU5ERUUiLCJSQU5BRSIsIk1JTEFHUk8iLCJMWU5FTEwiLCJMVUlTRSIsIkxPVUlFIiwiTE9JREEiLCJMSVNCRVRIIiwiS0FSTEVFTiIsIkpVTklUQSIsIkpPTkEiLCJJU0lTIiwiSFlBQ0lOVEgiLCJIRURZIiwiR1dFTk4iLCJFVEhFTEVORSIsIkVSTElORSIsIkVEV0FSRCIsIkRPTllBIiwiRE9NT05JUVVFIiwiREVMSUNJQSIsIkRBTk5FVFRFIiwiQ0lDRUxZIiwiQlJBTkRBIiwiQkxZVEhFIiwiQkVUSEFOTiIsIkFTSExZTiIsIkFOTkFMRUUiLCJBTExJTkUiLCJZVUtPIiwiVkVMTEEiLCJUUkFORyIsIlRPV0FOREEiLCJURVNIQSIsIlNIRVJMWU4iLCJOQVJDSVNBIiwiTUlHVUVMSU5BIiwiTUVSSSIsIk1BWUJFTEwiLCJNQVJMQU5BIiwiTUFSR1VFUklUQSIsIk1BRExZTiIsIkxVTkEiLCJMT1JZIiwiTE9SSUFOTiIsIkxJQkVSVFkiLCJMRU9OT1JFIiwiTEVJR0hBTk4iLCJMQVVSSUNFIiwiTEFURVNIQSIsIkxBUk9OREEiLCJLQVRSSUNFIiwiS0FTSUUiLCJLQVJMIiwiS0FMRVkiLCJKQURXSUdBIiwiR0xFTk5JRSIsIkdFQVJMRElORSIsIkZSQU5DSU5BIiwiRVBJRkFOSUEiLCJEWUFOIiwiRE9SSUUiLCJESUVEUkUiLCJERU5FU0UiLCJERU1FVFJJQ0UiLCJERUxFTkEiLCJEQVJCWSIsIkNSSVNUSUUiLCJDTEVPUkEiLCJDQVRBUklOQSIsIkNBUklTQSIsIkJFUk5JRSIsIkJBUkJFUkEiLCJBTE1FVEEiLCJUUlVMQSIsIlRFUkVBU0EiLCJTT0xBTkdFIiwiU0hFSUxBSCIsIlNIQVZPTk5FIiwiU0FOT1JBIiwiUk9DSEVMTCIsIk1BVEhJTERFIiwiTUFSR0FSRVRBIiwiTUFJQSIsIkxZTlNFWSIsIkxBV0FOTkEiLCJMQVVOQSIsIktFTkEiLCJLRUVOQSIsIktBVElBIiwiSkFNRVkiLCJHTFlOREEiLCJHQVlMRU5FIiwiRUxWSU5BIiwiRUxBTk9SIiwiREFOVVRBIiwiREFOSUtBIiwiQ1JJU1RFTiIsIkNPUkRJRSIsIkNPTEVUVEEiLCJDTEFSSVRBIiwiQ0FSTU9OIiwiQlJZTk4iLCJBWlVDRU5BIiwiQVVORFJFQSIsIkFOR0VMRSIsIllJIiwiV0FMVEVSIiwiVkVSTElFIiwiVkVSTEVORSIsIlRBTUVTSEEiLCJTSUxWQU5BIiwiU0VCUklOQSIsIlNBTUlSQSIsIlJFREEiLCJSQVlMRU5FIiwiUEVOTkkiLCJQQU5ET1JBIiwiTk9SQUgiLCJOT01BIiwiTUlSRUlMTEUiLCJNRUxJU1NJQSIsIk1BUllBTElDRSIsIkxBUkFJTkUiLCJLSU1CRVJZIiwiS0FSWUwiLCJLQVJJTkUiLCJLQU0iLCJKT0xBTkRBIiwiSk9IQU5BIiwiSkVTVVNBIiwiSkFMRUVTQSIsIkpBRSIsIkpBQ1FVRUxZTkUiLCJJUklTSCIsIklMVU1JTkFEQSIsIkhJTEFSSUEiLCJIQU5IIiwiR0VOTklFIiwiRlJBTkNJRSIsIkZMT1JFVFRBIiwiRVhJRSIsIkVEREEiLCJEUkVNQSIsIkRFTFBIQSIsIkJFViIsIkJBUkJBUiIsIkFTU1VOVEEiLCJBUkRFTEwiLCJBTk5BTElTQSIsIkFMSVNJQSIsIllVS0lLTyIsIllPTEFORE8iLCJXT05EQSIsIldFSSIsIldBTFRSQVVEIiwiVkVUQSIsIlRFUVVJTEEiLCJURU1FS0EiLCJUQU1FSUtBIiwiU0hJUkxFRU4iLCJTSEVOSVRBIiwiUElFREFEIiwiT1pFTExBIiwiTUlSVEhBIiwiTUFSSUxVIiwiS0lNSUtPIiwiSlVMSUFORSIsIkpFTklDRSIsIkpFTiIsIkpBTkFZIiwiSkFDUVVJTElORSIsIkhJTERFIiwiRkUiLCJGQUUiLCJFVkFOIiwiRVVHRU5FIiwiRUxPSVMiLCJFQ0hPIiwiREVWT1JBSCIsIkNIQVUiLCJCUklOREEiLCJCRVRTRVkiLCJBUk1JTkRBIiwiQVJBQ0VMSVMiLCJBUFJZTCIsIkFOTkVUVCIsIkFMSVNISUEiLCJWRU9MQSIsIlVTSEEiLCJUT1NISUtPIiwiVEhFT0xBIiwiVEFTSElBIiwiVEFMSVRIQSIsIlNIRVJZIiwiUlVEWSIsIlJFTkVUVEEiLCJSRUlLTyIsIlJBU0hFRURBIiwiT01FR0EiLCJPQkRVTElBIiwiTUlLQSIsIk1FTEFJTkUiLCJNRUdHQU4iLCJNQVJUSU4iLCJNQVJMRU4iLCJNQVJHRVQiLCJNQVJDRUxJTkUiLCJNQU5BIiwiTUFHREFMRU4iLCJMSUJSQURBIiwiTEVaTElFIiwiTEVYSUUiLCJMQVRBU0hJQSIsIkxBU0FORFJBIiwiS0VMTEUiLCJJU0lEUkEiLCJJU0EiLCJJTk9DRU5DSUEiLCJHV1lOIiwiRlJBTkNPSVNFIiwiRVJNSU5JQSIsIkVSSU5OIiwiRElNUExFIiwiREVWT1JBIiwiQ1JJU0VMREEiLCJBUk1BTkRBIiwiQVJJRSIsIkFSSUFORSIsIkFOR0VMTyIsIkFOR0VMRU5BIiwiQUxMRU4iLCJBTElaQSIsIkFEUklFTkUiLCJBREFMSU5FIiwiWE9DSElUTCIsIlRXQU5OQSIsIlRSQU4iLCJUT01JS08iLCJUQU1JU0hBIiwiVEFJU0hBIiwiU1VTWSIsIlNJVSIsIlJVVEhBIiwiUk9YWSIsIlJIT05BIiwiUkFZTU9ORCIsIk9USEEiLCJOT1JJS08iLCJOQVRBU0hJQSIsIk1FUlJJRSIsIk1FTFZJTiIsIk1BUklOREEiLCJNQVJJS08iLCJNQVJHRVJUIiwiTE9SSVMiLCJMSVpaRVRURSIsIkxFSVNIQSIsIktBSUxBIiwiS0EiLCJKT0FOTklFIiwiSkVSUklDQSIsIkpFTkUiLCJKQU5ORVQiLCJKQU5FRSIsIkpBQ0lOREEiLCJIRVJUQSIsIkVMRU5PUkUiLCJET1JFVFRBIiwiREVMQUlORSIsIkRBTklFTEwiLCJDTEFVRElFIiwiQ0hJTkEiLCJCUklUVEEiLCJBUE9MT05JQSIsIkFNQkVSTFkiLCJBTEVBU0UiLCJZVVJJIiwiWVVLIiwiV0VOIiwiV0FORVRBIiwiVVRFIiwiVE9NSSIsIlNIQVJSSSIsIlNBTkRJRSIsIlJPU0VMTEUiLCJSRVlOQUxEQSIsIlJBR1VFTCIsIlBIWUxJQ0lBIiwiUEFUUklBIiwiT0xJTVBJQSIsIk9ERUxJQSIsIk1JVFpJRSIsIk1JVENIRUxMIiwiTUlTUyIsIk1JTkRBIiwiTUlHTk9OIiwiTUlDQSIsIk1FTkRZIiwiTUFSSVZFTCIsIk1BSUxFIiwiTFlORVRUQSIsIkxBVkVUVEUiLCJMQVVSWU4iLCJMQVRSSVNIQSIsIkxBS0lFU0hBIiwiS0lFUlNURU4iLCJLQVJZIiwiSk9TUEhJTkUiLCJKT0xZTiIsIkpFVFRBIiwiSkFOSVNFIiwiSkFDUVVJRSIsIklWRUxJU1NFIiwiR0xZTklTIiwiR0lBTk5BIiwiR0FZTkVMTEUiLCJFTUVSQUxEIiwiREVNRVRSSVVTIiwiREFOWUVMTCIsIkRBTklMTEUiLCJEQUNJQSIsIkNPUkFMRUUiLCJDSEVSIiwiQ0VPTEEiLCJCUkVUVCIsIkJFTEwiLCJBUklBTk5FIiwiQUxFU0hJQSIsIllVTkciLCJXSUxMSUVNQUUiLCJUUk9ZIiwiVFJJTkgiLCJUSE9SQSIsIlRBSSIsIlNWRVRMQU5BIiwiU0hFUklLQSIsIlNIRU1FS0EiLCJTSEFVTkRBIiwiUk9TRUxJTkUiLCJSSUNLSSIsIk1FTERBIiwiTUFMTElFIiwiTEFWT05OQSIsIkxBVElOQSIsIkxBUlJZIiwiTEFRVUFOREEiLCJMQUxBIiwiTEFDSEVMTEUiLCJLTEFSQSIsIktBTkRJUyIsIkpPSE5BIiwiSkVBTk1BUklFIiwiSkFZRSIsIkhBTkciLCJHUkFZQ0UiLCJHRVJUVURFIiwiRU1FUklUQSIsIkVCT05JRSIsIkNMT1JJTkRBIiwiQ0hJTkciLCJDSEVSWSIsIkNBUk9MQSIsIkJSRUFOTiIsIkJMT1NTT00iLCJCRVJOQVJESU5FIiwiQkVDS0kiLCJBUkxFVEhBIiwiQVJHRUxJQSIsIkFSQSIsIkFMSVRBIiwiWVVMQU5EQSIsIllPTiIsIllFU1NFTklBIiwiVE9CSSIsIlRBU0lBIiwiU1lMVklFIiwiU0hJUkwiLCJTSElSRUxZIiwiU0hFUklEQU4iLCJTSEVMTEEiLCJTSEFOVEVMTEUiLCJTQUNIQSIsIlJPWUNFIiwiUkVCRUNLQSIsIlJFQUdBTiIsIlBST1ZJREVOQ0lBIiwiUEFVTEVORSIsIk1JU0hBIiwiTUlLSSIsIk1BUkxJTkUiLCJNQVJJQ0EiLCJMT1JJVEEiLCJMQVRPWUlBIiwiTEFTT05ZQSIsIktFUlNUSU4iLCJLRU5EQSIsIktFSVRIQSIsIktBVEhSSU4iLCJKQVlNSUUiLCJKQUNLIiwiR1JJQ0VMREEiLCJHSU5FVFRFIiwiRVJZTiIsIkVMSU5BIiwiRUxGUklFREEiLCJEQU5ZRUwiLCJDSEVSRUUiLCJDSEFORUxMRSIsIkJBUlJJRSIsIkFWRVJZIiwiQVVST1JFIiwiQU5OQU1BUklBIiwiQUxMRUVOIiwiQUlMRU5FIiwiQUlERSIsIllBU01JTkUiLCJWQVNIVEkiLCJWQUxFTlRJTkUiLCJUUkVBU0EiLCJUT1JZIiwiVElGRkFORVkiLCJTSEVSWUxMIiwiU0hBUklFIiwiU0hBTkFFIiwiU0FVIiwiUkFJU0EiLCJQQSIsIk5FREEiLCJNSVRTVUtPIiwiTUlSRUxMQSIsIk1JTERBIiwiTUFSWUFOTkEiLCJNQVJBR1JFVCIsIk1BQkVMTEUiLCJMVUVUVEEiLCJMT1JJTkEiLCJMRVRJU0hBIiwiTEFUQVJTSEEiLCJMQU5FTExFIiwiTEFKVUFOQSIsIktSSVNTWSIsIktBUkxZIiwiS0FSRU5BIiwiSk9OIiwiSkVTU0lLQSIsIkpFUklDQSIsIkpFQU5FTExFIiwiSkFOVUFSWSIsIkpBTElTQSIsIkpBQ0VMWU4iLCJJWk9MQSIsIklWRVkiLCJHUkVHT1JZIiwiRVVOQSIsIkVUSEEiLCJEUkVXIiwiRE9NSVRJTEEiLCJET01JTklDQSIsIkRBSU5BIiwiQ1JFT0xBIiwiQ0FSTEkiLCJDQU1JRSIsIkJVTk5ZIiwiQlJJVFROWSIsIkFTSEFOVEkiLCJBTklTSEEiLCJBTEVFTiIsIkFEQUgiLCJZQVNVS08iLCJXSU5URVIiLCJWSUtJIiwiVkFMUklFIiwiVE9OQSIsIlRJTklTSEEiLCJUSEkiLCJURVJJU0EiLCJUQVRVTSIsIlRBTkVLQSIsIlNJTU9OTkUiLCJTSEFMQU5EQSIsIlNFUklUQSIsIlJFU1NJRSIsIlJFRlVHSUEiLCJQQVoiLCJPTEVORSIsIk5BIiwiTUVSUklMTCIsIk1BUkdIRVJJVEEiLCJNQU5ESUUiLCJNQU4iLCJNQUlSRSIsIkxZTkRJQSIsIkxVQ0kiLCJMT1JSSUFORSIsIkxPUkVUQSIsIkxFT05JQSIsIkxBVk9OQSIsIkxBU0hBV05EQSIsIkxBS0lBIiwiS1lPS08iLCJLUllTVElOQSIsIktSWVNURU4iLCJLRU5JQSIsIktFTFNJIiwiSlVERSIsIkpFQU5JQ0UiLCJJU09CRUwiLCJHRU9SR0lBTk4iLCJHRU5OWSIsIkZFTElDSURBRCIsIkVJTEVORSIsIkRFT04iLCJERUxPSVNFIiwiREVFREVFIiwiREFOTklFIiwiQ09OQ0VQVElPTiIsIkNMT1JBIiwiQ0hFUklMWU4iLCJDSEFORyIsIkNBTEFORFJBIiwiQkVSUlkiLCJBUk1BTkRJTkEiLCJBTklTQSIsIlVMQSIsIlRJTU9USFkiLCJUSUVSQSIsIlRIRVJFU1NBIiwiU1RFUEhBTklBIiwiU0lNQSIsIlNIWUxBIiwiU0hPTlRBIiwiU0hFUkEiLCJTSEFRVUlUQSIsIlNIQUxBIiwiU0FNTVkiLCJST1NTQU5BIiwiTk9IRU1JIiwiTkVSWSIsIk1PUklBSCIsIk1FTElUQSIsIk1FTElEQSIsIk1FTEFOSSIsIk1BUllMWU5OIiwiTUFSSVNIQSIsIk1BUklFVFRFIiwiTUFMT1JJRSIsIk1BREVMRU5FIiwiTFVESVZJTkEiLCJMT1JJQSIsIkxPUkVUVEUiLCJMT1JBTEVFIiwiTElBTk5FIiwiTEVPTiIsIkxBVkVOSUEiLCJMQVVSSU5EQSIsIkxBU0hPTiIsIktJVCIsIktJTUkiLCJLRUlMQSIsIktBVEVMWU5OIiwiS0FJIiwiSk9ORSIsIkpPQU5FIiwiSkkiLCJKQVlOQSIsIkpBTkVMTEEiLCJKQSIsIkhVRSIsIkhFUlRIQSIsIkZSQU5DRU5FIiwiRUxJTk9SRSIsIkRFU1BJTkEiLCJERUxTSUUiLCJERUVEUkEiLCJDTEVNRU5DSUEiLCJDQVJSWSIsIkNBUk9MSU4iLCJDQVJMT1MiLCJCVUxBSCIsIkJSSVRUQU5JRSIsIkJPSyIsIkJMT05ERUxMIiwiQklCSSIsIkJFQVVMQUgiLCJCRUFUQSIsIkFOTklUQSIsIkFHUklQSU5BIiwiVklSR0VOIiwiVkFMRU5FIiwiVU4iLCJUV0FOREEiLCJUT01NWUUiLCJUT0kiLCJUQVJSQSIsIlRBUkkiLCJUQU1NRVJBIiwiU0hBS0lBIiwiU0FEWUUiLCJSVVRIQU5ORSIsIlJPQ0hFTCIsIlJJVktBIiwiUFVSQSIsIk5FTklUQSIsIk5BVElTSEEiLCJNSU5HIiwiTUVSUklMRUUiLCJNRUxPREVFIiwiTUFSVklTIiwiTFVDSUxMQSIsIkxFRU5BIiwiTEFWRVRBIiwiTEFSSVRBIiwiTEFOSUUiLCJLRVJFTiIsIklMRUVOIiwiR0VPUkdFQU5OIiwiR0VOTkEiLCJHRU5FU0lTIiwiRlJJREEiLCJFV0EiLCJFVUZFTUlBIiwiRU1FTFkiLCJFTEEiLCJFRFlUSCIsIkRFT05OQSIsIkRFQURSQSIsIkRBUkxFTkEiLCJDSEFORUxMIiwiQ0hBTiIsIkNBVEhFUk4iLCJDQVNTT05EUkEiLCJDQVNTQVVORFJBIiwiQkVSTkFSREEiLCJCRVJOQSIsIkFSTElOREEiLCJBTkFNQVJJQSIsIkFMQkVSVCIsIldFU0xFWSIsIlZFUlRJRSIsIlZBTEVSSSIsIlRPUlJJIiwiVEFUWUFOQSIsIlNUQVNJQSIsIlNIRVJJU0UiLCJTSEVSSUxMIiwiU0VBU09OIiwiU0NPVFRJRSIsIlNBTkRBIiwiUlVUSEUiLCJST1NZIiwiUk9CRVJUTyIsIlJPQkJJIiwiUkFORUUiLCJRVVlFTiIsIlBFQVJMWSIsIlBBTE1JUkEiLCJPTklUQSIsIk5JU0hBIiwiTklFU0hBIiwiTklEQSIsIk5FVkFEQSIsIk5BTSIsIk1FUkxZTiIsIk1BWU9MQSIsIk1BUllMT1VJU0UiLCJNQVJZTEFORCIsIk1BUlgiLCJNQVJUSCIsIk1BUkdFTkUiLCJNQURFTEFJTkUiLCJMT05EQSIsIkxFT05USU5FIiwiTEVPTUEiLCJMRUlBIiwiTEFXUkVOQ0UiLCJMQVVSQUxFRSIsIkxBTk9SQSIsIkxBS0lUQSIsIktJWU9LTyIsIktFVFVSQUgiLCJLQVRFTElOIiwiS0FSRUVOIiwiSk9OSUUiLCJKT0hORVRURSIsIkpFTkVFIiwiSkVBTkVUVCIsIklaRVRUQSIsIkhJRURJIiwiSEVJS0UiLCJIQVNTSUUiLCJIQVJPTEQiLCJHSVVTRVBQSU5BIiwiR0VPUkdBTk4iLCJGSURFTEEiLCJGRVJOQU5ERSIsIkVMV0FOREEiLCJFTExBTUFFIiwiRUxJWiIsIkRVU1RJIiwiRE9UVFkiLCJDWU5EWSIsIkNPUkFMSUUiLCJDRUxFU1RBIiwiQVJHRU5USU5BIiwiQUxWRVJUQSIsIlhFTklBIiwiV0FWQSIsIlZBTkVUVEEiLCJUT1JSSUUiLCJUQVNISU5BIiwiVEFORFkiLCJUQU1CUkEiLCJUQU1BIiwiU1RFUEFOSUUiLCJTSElMQSIsIlNIQVVOVEEiLCJTSEFSQU4iLCJTSEFOSVFVQSIsIlNIQUUiLCJTRVRTVUtPIiwiU0VSQUZJTkEiLCJTQU5ERUUiLCJST1NBTUFSSUEiLCJQUklTQ0lMQSIsIk9MSU5EQSIsIk5BREVORSIsIk1VT0kiLCJNSUNIRUxJTkEiLCJNRVJDRURFWiIsIk1BUllST1NFIiwiTUFSSU4iLCJNQVJDRU5FIiwiTUFPIiwiTUFHQUxJIiwiTUFGQUxEQSIsIkxPR0FOIiwiTElOTiIsIkxBTk5JRSIsIktBWUNFIiwiS0FST0xJTkUiLCJLQU1JTEFIIiwiS0FNQUxBIiwiSlVTVEEiLCJKT0xJTkUiLCJKRU5OSU5FIiwiSkFDUVVFVFRBIiwiSVJBSURBIiwiR0VSQUxEIiwiR0VPUkdFQU5OQSIsIkZSQU5DSEVTQ0EiLCJGQUlSWSIsIkVNRUxJTkUiLCJFTEFORSIsIkVIVEVMIiwiRUFSTElFIiwiRFVMQ0lFIiwiREFMRU5FIiwiQ1JJUyIsIkNMQVNTSUUiLCJDSEVSRSIsIkNIQVJJUyIsIkNBUk9ZTE4iLCJDQVJNSU5BIiwiQ0FSSVRBIiwiQlJJQU4iLCJCRVRIQU5JRSIsIkFZQUtPIiwiQVJJQ0EiLCJBTiIsIkFMWVNBIiwiQUxFU1NBTkRSQSIsIkFLSUxBSCIsIkFEUklFTiIsIlpFVFRBIiwiWU9VTEFOREEiLCJZRUxFTkEiLCJZQUhBSVJBIiwiWFVBTiIsIldFTkRPTFlOIiwiVklDVE9SIiwiVElKVUFOQSIsIlRFUlJFTEwiLCJURVJJTkEiLCJURVJFU0lBIiwiU1VaSSIsIlNVTkRBWSIsIlNIRVJFTEwiLCJTSEFWT05EQSIsIlNIQVVOVEUiLCJTSEFSREEiLCJTSEFLSVRBIiwiU0VOQSIsIlJZQU5OIiwiUlVCSSIsIlJJVkEiLCJSRUdJTklBIiwiUkVBIiwiUkFDSEFMIiwiUEFSVEhFTklBIiwiUEFNVUxBIiwiTU9OTklFIiwiTU9ORVQiLCJNSUNIQUVMRSIsIk1FTElBIiwiTUFSSU5FIiwiTUFMS0EiLCJNQUlTSEEiLCJMSVNBTkRSQSIsIkxFTyIsIkxFS0lTSEEiLCJMRUFOIiwiTEFVUkVOQ0UiLCJMQUtFTkRSQSIsIktSWVNUSU4iLCJLT1JUTkVZIiwiS0laWklFIiwiS0lUVElFIiwiS0VSQSIsIktFTkRBTCIsIktFTUJFUkxZIiwiS0FOSVNIQSIsIkpVTEVORSIsIkpVTEUiLCJKT1NIVUEiLCJKT0hBTk5FIiwiSkVGRlJFWSIsIkpBTUVFIiwiSEFOIiwiSEFMTEVZIiwiR0lER0VUIiwiR0FMSU5BIiwiRlJFRFJJQ0tBIiwiRkxFVEEiLCJGQVRJTUFIIiwiRVVTRUJJQSIsIkVMWkEiLCJFTEVPTk9SRSIsIkRPUlRIRVkiLCJET1JJQSIsIkRPTkVMTEEiLCJESU5PUkFIIiwiREVMT1JTRSIsIkNMQVJFVEhBIiwiQ0hSSVNUSU5JQSIsIkNIQVJMWU4iLCJCT05HIiwiQkVMS0lTIiwiQVpaSUUiLCJBTkRFUkEiLCJBSUtPIiwiQURFTkEiLCJZRVIiLCJZQUpBSVJBIiwiV0FOIiwiVkFOSUEiLCJVTFJJS0UiLCJUT1NISUEiLCJUSUZBTlkiLCJTVEVGQU5ZIiwiU0hJWlVFIiwiU0hFTklLQSIsIlNIQVdBTk5BIiwiU0hBUk9MWU4iLCJTSEFSSUxZTiIsIlNIQVFVQU5BIiwiU0hBTlRBWSIsIlNFRSIsIlJPWkFOTkUiLCJST1NFTEVFIiwiUklDS0lFIiwiUkVNT05BIiwiUkVBTk5BIiwiUkFFTEVORSIsIlFVSU5OIiwiUEhVTkciLCJQRVRST05JTEEiLCJOQVRBQ0hBIiwiTkFOQ0VZIiwiTVlSTCIsIk1JWU9LTyIsIk1JRVNIQSIsIk1FUklERVRIIiwiTUFSVkVMTEEiLCJNQVJRVUlUVEEiLCJNQVJIVEEiLCJNQVJDSEVMTEUiLCJMSVpFVEgiLCJMSUJCSUUiLCJMQUhPTUEiLCJMQURBV04iLCJLSU5BIiwiS0FUSEVMRUVOIiwiS0FUSEFSWU4iLCJLQVJJU0EiLCJLQUxFSUdIIiwiSlVOSUUiLCJKVUxJRUFOTiIsIkpPSE5TSUUiLCJKQU5FQU4iLCJKQUlNRUUiLCJKQUNLUVVFTElORSIsIkhJU0FLTyIsIkhFUk1BIiwiSEVMQUlORSIsIkdXWU5FVEgiLCJHTEVOTiIsIkdJVEEiLCJFVVNUT0xJQSIsIkVNRUxJTkEiLCJFTElOIiwiRURSSVMiLCJET05ORVRURSIsIkRPTk5FVFRBIiwiRElFUkRSRSIsIkRFTkFFIiwiREFSQ0VMIiwiQ0xBVURFIiwiQ0xBUklTQSIsIkNJTkRFUkVMTEEiLCJDSElBIiwiQ0hBUkxFU0VUVEEiLCJDSEFSSVRBIiwiQ0VMU0EiLCJDQVNTWSIsIkNBU1NJIiwiQ0FSTEVFIiwiQlJVTkEiLCJCUklUVEFORVkiLCJCUkFOREUiLCJCSUxMSSIsIkJBTyIsIkFOVE9ORVRUQSIsIkFOR0xBIiwiQU5HRUxZTiIsIkFOQUxJU0EiLCJBTEFORSIsIldFTk9OQSIsIldFTkRJRSIsIlZFUk9OSVFVRSIsIlZBTk5FU0EiLCJUT0JJRSIsIlRFTVBJRSIsIlNVTUlLTyIsIlNVTEVNQSIsIlNQQVJLTEUiLCJTT01FUiIsIlNIRUJBIiwiU0hBWU5FIiwiU0hBUklDRSIsIlNIQU5FTCIsIlNIQUxPTiIsIlNBR0UiLCJST1kiLCJST1NJTyIsIlJPU0VMSUEiLCJSRU5BWSIsIlJFTUEiLCJSRUVOQSIsIlBPUlNDSEUiLCJQSU5HIiwiUEVHIiwiT1pJRSIsIk9SRVRIQSIsIk9SQUxFRSIsIk9EQSIsIk5VIiwiTkdBTiIsIk5BS0VTSEEiLCJNSUxMWSIsIk1BUllCRUxMRSIsIk1BUkxJTiIsIk1BUklTIiwiTUFSR1JFVFQiLCJNQVJBR0FSRVQiLCJNQU5JRSIsIkxVUkxFTkUiLCJMSUxMSUEiLCJMSUVTRUxPVFRFIiwiTEFWRUxMRSIsIkxBU0hBVU5EQSIsIkxBS0VFU0hBIiwiS0VJVEgiLCJLQVlDRUUiLCJLQUxZTiIsIkpPWUEiLCJKT0VUVEUiLCJKRU5BRSIsIkpBTklFQ0UiLCJJTExBIiwiR1JJU0VMIiwiR0xBWURTIiwiR0VORVZJRSIsIkdBTEEiLCJGUkVEREEiLCJGUkVEIiwiRUxNRVIiLCJFTEVPTk9SIiwiREVCRVJBIiwiREVBTkRSRUEiLCJEQU4iLCJDT1JSSU5ORSIsIkNPUkRJQSIsIkNPTlRFU1NBIiwiQ09MRU5FIiwiQ0xFT1RJTERFIiwiQ0hBUkxPVFQiLCJDSEFOVEFZIiwiQ0VDSUxMRSIsIkJFQVRSSVMiLCJBWkFMRUUiLCJBUkxFQU4iLCJBUkRBVEgiLCJBTkpFTElDQSIsIkFOSkEiLCJBTEZSRURJQSIsIkFMRUlTSEEiLCJBREFNIiwiWkFEQSIsIllVT05ORSIsIlhJQU8iLCJXSUxMT0RFQU4iLCJXSElUTEVZIiwiVkVOTklFIiwiVkFOTkEiLCJUWUlTSEEiLCJUT1ZBIiwiVE9SSUUiLCJUT05JU0hBIiwiVElMREEiLCJUSUVOIiwiVEVNUExFIiwiU0lSRU5BIiwiU0hFUlJJTCIsIlNIQU5USSIsIlNIQU4iLCJTRU5BSURBIiwiU0FNRUxMQSIsIlJPQkJZTiIsIlJFTkRBIiwiUkVJVEEiLCJQSEVCRSIsIlBBVUxJVEEiLCJOT0JVS08iLCJOR1VZRVQiLCJORU9NSSIsIk1PT04iLCJNSUtBRUxBIiwiTUVMQU5JQSIsIk1BWElNSU5BIiwiTUFSRyIsIk1BSVNJRSIsIkxZTk5BIiwiTElMTEkiLCJMQVlORSIsIkxBU0hBVU4iLCJMQUtFTllBIiwiTEFFTCIsIktJUlNUSUUiLCJLQVRITElORSIsIktBU0hBIiwiS0FSTFlOIiwiS0FSSU1BIiwiSk9WQU4iLCJKT1NFRklORSIsIkpFTk5FTEwiLCJKQUNRVUkiLCJKQUNLRUxZTiIsIkhZTyIsIkhJRU4iLCJHUkFaWU5BIiwiRkxPUlJJRSIsIkZMT1JJQSIsIkVMRU9OT1JBIiwiRFdBTkEiLCJET1JMQSIsIkRPTkciLCJERUxNWSIsIkRFSkEiLCJERURFIiwiREFOTiIsIkNSWVNUQSIsIkNMRUxJQSIsIkNMQVJJUyIsIkNMQVJFTkNFIiwiQ0hJRUtPIiwiQ0hFUkxZTiIsIkNIRVJFTExFIiwiQ0hBUk1BSU4iLCJDSEFSQSIsIkNBTU1ZIiwiQkVFIiwiQVJORVRURSIsIkFSREVMTEUiLCJBTk5JS0EiLCJBTUlFRSIsIkFNRUUiLCJBTExFTkEiLCJZVk9ORSIsIllVS0kiLCJZT1NISUUiLCJZRVZFVFRFIiwiWUFFTCIsIldJTExFVFRBIiwiVk9OQ0lMRSIsIlZFTkVUVEEiLCJUVUxBIiwiVE9ORVRURSIsIlRJTUlLQSIsIlRFTUlLQSIsIlRFTE1BIiwiVEVJU0hBIiwiVEFSRU4iLCJUQSIsIlNUQUNFRSIsIlNISU4iLCJTSEFXTlRBIiwiU0FUVVJOSU5BIiwiUklDQVJEQSIsIlBPSyIsIlBBU1RZIiwiT05JRSIsIk5VQklBIiwiTU9SQSIsIk1JS0UiLCJNQVJJRUxMRSIsIk1BUklFTExBIiwiTUFSSUFORUxBIiwiTUFSREVMTCIsIk1BTlkiLCJMVUFOTkEiLCJMT0lTRSIsIkxJU0FCRVRIIiwiTElORFNZIiwiTElMTElBTkEiLCJMSUxMSUFNIiwiTEVMQUgiLCJMRUlHSEEiLCJMRUFOT1JBIiwiTEFORyIsIktSSVNURUVOIiwiS0hBTElMQUgiLCJLRUVMRVkiLCJLQU5EUkEiLCJKVU5LTyIsIkpPQVFVSU5BIiwiSkVSTEVORSIsIkpBTkkiLCJKQU1JS0EiLCJKQU1FIiwiSFNJVSIsIkhFUk1JTEEiLCJHT0xERU4iLCJHRU5FVklWRSIsIkVWSUEiLCJFVUdFTkEiLCJFTU1BTElORSIsIkVMRlJFREEiLCJFTEVORSIsIkRPTkVUVEUiLCJERUxDSUUiLCJERUVBTk5BIiwiREFSQ0VZIiwiQ1VDIiwiQ0xBUklOREEiLCJDSVJBIiwiQ0hBRSIsIkNFTElOREEiLCJDQVRIRVJZTiIsIkNBVEhFUklOIiwiQ0FTSU1JUkEiLCJDQVJNRUxJQSIsIkNBTUVMTElBIiwiQlJFQU5BIiwiQk9CRVRURSIsIkJFUk5BUkRJTkEiLCJCRUJFIiwiQkFTSUxJQSIsIkFSTFlORSIsIkFNQUwiLCJBTEFZTkEiLCJaT05JQSIsIlpFTklBIiwiWVVSSUtPIiwiWUFFS08iLCJXWU5FTEwiLCJXSUxMT1ciLCJXSUxMRU5BIiwiVkVSTklBIiwiVFUiLCJUUkFWSVMiLCJUT1JBIiwiVEVSUklMWU4iLCJURVJJQ0EiLCJURU5FU0hBIiwiVEFXTkEiLCJUQUpVQU5BIiwiVEFJTkEiLCJTVEVQSE5JRSIsIlNPTkEiLCJTT0wiLCJTSU5BIiwiU0hPTkRSQSIsIlNISVpVS08iLCJTSEVSTEVORSIsIlNIRVJJQ0UiLCJTSEFSSUtBIiwiUk9TU0lFIiwiUk9TRU5BIiwiUk9SWSIsIlJJTUEiLCJSSUEiLCJSSEVCQSIsIlJFTk5BIiwiUEVURVIiLCJOQVRBTFlBIiwiTkFOQ0VFIiwiTUVMT0RJIiwiTUVEQSIsIk1BWElNQSIsIk1BVEhBIiwiTUFSS0VUVEEiLCJNQVJJQ1JVWiIsIk1BUkNFTEVORSIsIk1BTFZJTkEiLCJMVUJBIiwiTE9VRVRUQSIsIkxFSURBIiwiTEVDSUEiLCJMQVVSQU4iLCJMQVNIQVdOQSIsIkxBSU5FIiwiS0hBRElKQUgiLCJLQVRFUklORSIsIktBU0kiLCJLQUxMSUUiLCJKVUxJRVRUQSIsIkpFU1VTSVRBIiwiSkVTVElORSIsIkpFU1NJQSIsIkpFUkVNWSIsIkpFRkZJRSIsIkpBTllDRSIsIklTQURPUkEiLCJHRU9SR0lBTk5FIiwiRklERUxJQSIsIkVWSVRBIiwiRVVSQSIsIkVVTEFIIiwiRVNURUZBTkEiLCJFTFNZIiwiRUxJWkFCRVQiLCJFTEFESUEiLCJET0RJRSIsIkRJT04iLCJESUEiLCJERU5JU1NFIiwiREVMT1JBUyIsIkRFTElMQSIsIkRBWVNJIiwiREFLT1RBIiwiQ1VSVElTIiwiQ1JZU1RMRSIsIkNPTkNIQSIsIkNPTEJZIiwiQ0xBUkVUVEEiLCJDSFUiLCJDSFJJU1RJQSIsIkNIQVJMU0lFIiwiQ0hBUkxFTkEiLCJDQVJZTE9OIiwiQkVUVFlBTk4iLCJBU0xFWSIsIkFTSExFQSIsIkFNSVJBIiwiQUkiLCJBR1VFREEiLCJBR05VUyIsIllVRVRURSIsIlZJTklUQSIsIlZJQ1RPUklOQSIsIlRZTklTSEEiLCJUUkVFTkEiLCJUT0NDQVJBIiwiVElTSCIsIlRIT01BU0VOQSIsIlRFR0FOIiwiU09JTEEiLCJTSElMT0giLCJTSEVOTkEiLCJTSEFSTUFJTkUiLCJTSEFOVEFFIiwiU0hBTkRJIiwiU0VQVEVNQkVSIiwiU0FSQU4iLCJTQVJBSSIsIlNBTkEiLCJTQU1VRUwiLCJTQUxMRVkiLCJST1NFVFRFIiwiUk9MQU5ERSIsIlJFR0lORSIsIk9URUxJQSIsIk9TQ0FSIiwiT0xFVklBIiwiTklDSE9MTEUiLCJORUNPTEUiLCJOQUlEQSIsIk1ZUlRBIiwiTVlFU0hBIiwiTUlUU1VFIiwiTUlOVEEiLCJNRVJUSUUiLCJNQVJHWSIsIk1BSEFMSUEiLCJNQURBTEVORSIsIkxPVkUiLCJMT1VSQSIsIkxPUkVBTiIsIkxFV0lTIiwiTEVTSEEiLCJMRU9OSURBIiwiTEVOSVRBIiwiTEFWT05FIiwiTEFTSEVMTCIsIkxBU0hBTkRSQSIsIkxBTU9OSUNBIiwiS0lNQlJBIiwiS0FUSEVSSU5BIiwiS0FSUlkiLCJLQU5FU0hBIiwiSlVMSU8iLCJKT05HIiwiSkVORVZBIiwiSkFRVUVMWU4iLCJIV0EiLCJHSUxNQSIsIkdISVNMQUlORSIsIkdFUlRSVURJUyIsIkZSQU5TSVNDQSIsIkZFUk1JTkEiLCJFVFRJRSIsIkVUU1VLTyIsIkVMTElTIiwiRUxMQU4iLCJFTElESUEiLCJFRFJBIiwiRE9SRVRIRUEiLCJET1JFQVRIQSIsIkRFTllTRSIsIkRFTk5ZIiwiREVFVFRBIiwiREFJTkUiLCJDWVJTVEFMIiwiQ09SUklOIiwiQ0FZTEEiLCJDQVJMSVRBIiwiQ0FNSUxBIiwiQlVSTUEiLCJCVUxBIiwiQlVFTkEiLCJCTEFLRSIsIkJBUkFCQVJBIiwiQVZSSUwiLCJBVVNUSU4iLCJBTEFJTkUiLCJaQU5BIiwiV0lMSEVNSU5BIiwiV0FORVRUQSIsIlZJUkdJTCIsIlZJIiwiVkVST05JS0EiLCJWRVJOT04iLCJWRVJMSU5FIiwiVkFTSUxJS0kiLCJUT05JVEEiLCJUSVNBIiwiVEVPRklMQSIsIlRBWU5BIiwiVEFVTllBIiwiVEFORFJBIiwiVEFLQUtPIiwiU1VOTkkiLCJTVUFOTkUiLCJTSVhUQSIsIlNIQVJFTEwiLCJTRUVNQSIsIlJVU1NFTEwiLCJST1NFTkRBIiwiUk9CRU5BIiwiUkFZTU9OREUiLCJQRUkiLCJQQU1JTEEiLCJPWkVMTCIsIk5FSURBIiwiTkVFTFkiLCJNSVNUSUUiLCJNSUNIQSIsIk1FUklTU0EiLCJNQVVSSVRBIiwiTUFSWUxOIiwiTUFSWUVUVEEiLCJNQVJTSEFMTCIsIk1BUkNFTEwiLCJNQUxFTkEiLCJNQUtFREEiLCJNQURESUUiLCJMT1ZFVFRBIiwiTE9VUklFIiwiTE9SUklORSIsIkxPUklMRUUiLCJMRVNURVIiLCJMQVVSRU5BIiwiTEFTSEFZIiwiTEFSUkFJTkUiLCJMQVJFRSIsIkxBQ1JFU0hBIiwiS1JJU1RMRSIsIktSSVNITkEiLCJLRVZBIiwiS0VJUkEiLCJLQVJPTEUiLCJKT0lFIiwiSklOTlkiLCJKRUFOTkVUVEEiLCJKQU1BIiwiSEVJRFkiLCJHSUxCRVJURSIsIkdFTUEiLCJGQVZJT0xBIiwiRVZFTFlOTiIsIkVOREEiLCJFTExJIiwiRUxMRU5BIiwiRElWSU5BIiwiREFHTlkiLCJDT0xMRU5FIiwiQ09ESSIsIkNJTkRJRSIsIkNIQVNTSURZIiwiQ0hBU0lEWSIsIkNBVFJJQ0UiLCJDQVRIRVJJTkEiLCJDQVNTRVkiLCJDQVJPTEwiLCJDQVJMRU5BIiwiQ0FORFJBIiwiQ0FMSVNUQSIsIkJSWUFOTkEiLCJCUklUVEVOWSIsIkJFVUxBIiwiQkFSSSIsIkFVRFJJRSIsIkFVRFJJQSIsIkFSREVMSUEiLCJBTk5FTExFIiwiQU5HSUxBIiwiQUxPTkEiLCJBTExZTiIsIkRPVUdMQVMiLCJST0dFUiIsIkpPTkFUSEFOIiwiUkFMUEgiLCJOSUNIT0xBUyIsIkJFTkpBTUlOIiwiQlJVQ0UiLCJIQVJSWSIsIldBWU5FIiwiU1RFVkUiLCJIT1dBUkQiLCJFUk5FU1QiLCJQSElMTElQIiwiVE9ERCIsIkNSQUlHIiwiQUxBTiIsIlBISUxJUCIsIkVBUkwiLCJEQU5OWSIsIkJSWUFOIiwiU1RBTkxFWSIsIkxFT05BUkQiLCJOQVRIQU4iLCJNQU5VRUwiLCJST0RORVkiLCJNQVJWSU4iLCJWSU5DRU5UIiwiSkVGRkVSWSIsIkpFRkYiLCJDSEFEIiwiSkFDT0IiLCJBTEZSRUQiLCJCUkFETEVZIiwiSEVSQkVSVCIsIkZSRURFUklDSyIsIkVEV0lOIiwiRE9OIiwiUklDS1kiLCJSQU5EQUxMIiwiQkFSUlkiLCJCRVJOQVJEIiwiTEVST1kiLCJNQVJDVVMiLCJUSEVPRE9SRSIsIkNMSUZGT1JEIiwiTUlHVUVMIiwiSklNIiwiVE9NIiwiQ0FMVklOIiwiQklMTCIsIkxMT1lEIiwiREVSRUsiLCJXQVJSRU4iLCJEQVJSRUxMIiwiSkVST01FIiwiRkxPWUQiLCJBTFZJTiIsIlRJTSIsIkdPUkRPTiIsIkdSRUciLCJKT1JHRSIsIkRVU1RJTiIsIlBFRFJPIiwiREVSUklDSyIsIlpBQ0hBUlkiLCJIRVJNQU4iLCJHTEVOIiwiSEVDVE9SIiwiUklDQVJETyIsIlJJQ0siLCJCUkVOVCIsIlJBTU9OIiwiR0lMQkVSVCIsIk1BUkMiLCJSRUdJTkFMRCIsIlJVQkVOIiwiTkFUSEFOSUVMIiwiUkFGQUVMIiwiRURHQVIiLCJNSUxUT04iLCJSQVVMIiwiQkVOIiwiQ0hFU1RFUiIsIkRVQU5FIiwiRlJBTktMSU4iLCJCUkFEIiwiUk9OIiwiUk9MQU5EIiwiQVJOT0xEIiwiSEFSVkVZIiwiSkFSRUQiLCJFUklLIiwiREFSUllMIiwiTkVJTCIsIkpBVklFUiIsIkZFUk5BTkRPIiwiQ0xJTlRPTiIsIlRFRCIsIk1BVEhFVyIsIlRZUk9ORSIsIkRBUlJFTiIsIkxBTkNFIiwiS1VSVCIsIkFMTEFOIiwiTkVMU09OIiwiR1VZIiwiQ0xBWVRPTiIsIkhVR0giLCJNQVgiLCJEV0FZTkUiLCJEV0lHSFQiLCJBUk1BTkRPIiwiRkVMSVgiLCJFVkVSRVRUIiwiSUFOIiwiV0FMTEFDRSIsIktFTiIsIkJPQiIsIkFMRlJFRE8iLCJBTEJFUlRPIiwiREFWRSIsIklWQU4iLCJCWVJPTiIsIklTQUFDIiwiTU9SUklTIiwiQ0xJRlRPTiIsIldJTExBUkQiLCJST1NTIiwiQU5EWSIsIlNBTFZBRE9SIiwiS0lSSyIsIlNFUkdJTyIsIlNFVEgiLCJLRU5UIiwiVEVSUkFOQ0UiLCJFRFVBUkRPIiwiVEVSUkVOQ0UiLCJFTlJJUVVFIiwiV0FERSIsIlNUVUFSVCIsIkZSRURSSUNLIiwiQVJUVVJPIiwiQUxFSkFORFJPIiwiTklDSyIsIkxVVEhFUiIsIldFTkRFTEwiLCJKRVJFTUlBSCIsIkpVTElVUyIsIk9USVMiLCJUUkVWT1IiLCJPTElWRVIiLCJMVUtFIiwiSE9NRVIiLCJHRVJBUkQiLCJET1VHIiwiS0VOTlkiLCJIVUJFUlQiLCJMWUxFIiwiTUFUVCIsIkFMRk9OU08iLCJPUkxBTkRPIiwiUkVYIiwiQ0FSTFRPTiIsIkVSTkVTVE8iLCJORUFMIiwiUEFCTE8iLCJMT1JFTlpPIiwiT01BUiIsIldJTEJVUiIsIkdSQU5UIiwiSE9SQUNFIiwiUk9ERVJJQ0siLCJBQlJBSEFNIiwiV0lMTElTIiwiUklDS0VZIiwiQU5EUkVTIiwiQ0VTQVIiLCJKT0hOQVRIQU4iLCJNQUxDT0xNIiwiUlVET0xQSCIsIkRBTU9OIiwiS0VMVklOIiwiUFJFU1RPTiIsIkFMVE9OIiwiQVJDSElFIiwiTUFSQ08iLCJXTSIsIlBFVEUiLCJSQU5ET0xQSCIsIkdBUlJZIiwiR0VPRkZSRVkiLCJKT05BVEhPTiIsIkZFTElQRSIsIkdFUkFSRE8iLCJFRCIsIkRPTUlOSUMiLCJERUxCRVJUIiwiQ09MSU4iLCJHVUlMTEVSTU8iLCJFQVJORVNUIiwiTFVDQVMiLCJCRU5OWSIsIlNQRU5DRVIiLCJST0RPTEZPIiwiTVlST04iLCJFRE1VTkQiLCJHQVJSRVRUIiwiU0FMVkFUT1JFIiwiQ0VEUklDIiwiTE9XRUxMIiwiR1JFR0ciLCJTSEVSTUFOIiwiV0lMU09OIiwiU1lMVkVTVEVSIiwiUk9PU0VWRUxUIiwiSVNSQUVMIiwiSkVSTUFJTkUiLCJGT1JSRVNUIiwiV0lMQkVSVCIsIkxFTEFORCIsIlNJTU9OIiwiQ0xBUksiLCJJUlZJTkciLCJCUllBTlQiLCJPV0VOIiwiUlVGVVMiLCJXT09EUk9XIiwiS1JJU1RPUEhFUiIsIk1BQ0siLCJMRVZJIiwiTUFSQ09TIiwiR1VTVEFWTyIsIkpBS0UiLCJMSU9ORUwiLCJHSUxCRVJUTyIsIkNMSU5UIiwiTklDT0xBUyIsIklTTUFFTCIsIk9SVklMTEUiLCJFUlZJTiIsIkRFV0VZIiwiQUwiLCJXSUxGUkVEIiwiSk9TSCIsIkhVR08iLCJJR05BQ0lPIiwiQ0FMRUIiLCJUT01BUyIsIlNIRUxET04iLCJFUklDSyIsIlNURVdBUlQiLCJET1lMRSIsIkRBUlJFTCIsIlJPR0VMSU8iLCJURVJFTkNFIiwiU0FOVElBR08iLCJBTE9OWk8iLCJFTElBUyIsIkJFUlQiLCJFTEJFUlQiLCJSQU1JUk8iLCJDT05SQUQiLCJOT0FIIiwiR1JBRFkiLCJQSElMIiwiQ09STkVMSVVTIiwiTEFNQVIiLCJST0xBTkRPIiwiQ0xBWSIsIlBFUkNZIiwiREVYVEVSIiwiQlJBREZPUkQiLCJEQVJJTiIsIkFNT1MiLCJNT1NFUyIsIklSVklOIiwiU0FVTCIsIlJPTUFOIiwiUkFOREFMIiwiVElNTVkiLCJEQVJSSU4iLCJXSU5TVE9OIiwiQlJFTkRBTiIsIkFCRUwiLCJET01JTklDSyIsIkJPWUQiLCJFTUlMSU8iLCJFTElKQUgiLCJET01JTkdPIiwiRU1NRVRUIiwiTUFSTE9OIiwiRU1BTlVFTCIsIkpFUkFMRCIsIkVETU9ORCIsIkVNSUwiLCJERVdBWU5FIiwiV0lMTCIsIk9UVE8iLCJURUREWSIsIlJFWU5BTERPIiwiQlJFVCIsIkpFU1MiLCJUUkVOVCIsIkhVTUJFUlRPIiwiRU1NQU5VRUwiLCJTVEVQSEFOIiwiVklDRU5URSIsIkxBTU9OVCIsIkdBUkxBTkQiLCJNSUxFUyIsIkVGUkFJTiIsIkhFQVRIIiwiUk9ER0VSIiwiSEFSTEVZIiwiRVRIQU4iLCJFTERPTiIsIlJPQ0tZIiwiUElFUlJFIiwiSlVOSU9SIiwiRlJFRERZIiwiRUxJIiwiQlJZQ0UiLCJBTlRPSU5FIiwiU1RFUkxJTkciLCJDSEFTRSIsIkdST1ZFUiIsIkVMVE9OIiwiQ0xFVkVMQU5EIiwiRFlMQU4iLCJDSFVDSyIsIkRBTUlBTiIsIlJFVUJFTiIsIlNUQU4iLCJBVUdVU1QiLCJMRU9OQVJETyIsIkpBU1BFUiIsIlJVU1NFTCIsIkVSV0lOIiwiQkVOSVRPIiwiSEFOUyIsIk1PTlRFIiwiQkxBSU5FIiwiRVJOSUUiLCJDVVJUIiwiUVVFTlRJTiIsIkFHVVNUSU4iLCJNVVJSQVkiLCJKQU1BTCIsIkFET0xGTyIsIkhBUlJJU09OIiwiVFlTT04iLCJCVVJUT04iLCJCUkFEWSIsIkVMTElPVFQiLCJXSUxGUkVETyIsIkJBUlQiLCJKQVJST0QiLCJWQU5DRSIsIkRFTklTIiwiREFNSUVOIiwiSk9BUVVJTiIsIkhBUkxBTiIsIkRFU01PTkQiLCJFTExJT1QiLCJEQVJXSU4iLCJHUkVHT1JJTyIsIkJVRERZIiwiWEFWSUVSIiwiS0VSTUlUIiwiUk9TQ09FIiwiRVNURUJBTiIsIkFOVE9OIiwiU09MT01PTiIsIlNDT1RUWSIsIk5PUkJFUlQiLCJFTFZJTiIsIldJTExJQU1TIiwiTk9MQU4iLCJST0QiLCJRVUlOVE9OIiwiSEFMIiwiQlJBSU4iLCJST0IiLCJFTFdPT0QiLCJLRU5EUklDSyIsIkRBUklVUyIsIk1PSVNFUyIsIkZJREVMIiwiVEhBRERFVVMiLCJDTElGRiIsIk1BUkNFTCIsIkpBQ0tTT04iLCJSQVBIQUVMIiwiQlJZT04iLCJBUk1BTkQiLCJBTFZBUk8iLCJKRUZGUlkiLCJEQU5FIiwiSk9FU1BIIiwiVEhVUk1BTiIsIk5FRCIsIlJVU1RZIiwiTU9OVFkiLCJGQUJJQU4iLCJSRUdHSUUiLCJNQVNPTiIsIkdSQUhBTSIsIklTQUlBSCIsIlZBVUdITiIsIkdVUyIsIkxPWUQiLCJESUVHTyIsIkFET0xQSCIsIk5PUlJJUyIsIk1JTExBUkQiLCJST0NDTyIsIkdPTlpBTE8iLCJERVJJQ0siLCJST0RSSUdPIiwiV0lMRVkiLCJSSUdPQkVSVE8iLCJBTFBIT05TTyIsIlRZIiwiTk9FIiwiVkVSTiIsIlJFRUQiLCJKRUZGRVJTT04iLCJFTFZJUyIsIkJFUk5BUkRPIiwiTUFVUklDSU8iLCJISVJBTSIsIkRPTk9WQU4iLCJCQVNJTCIsIlJJTEVZIiwiTklDS09MQVMiLCJNQVlOQVJEIiwiU0NPVCIsIlZJTkNFIiwiUVVJTkNZIiwiRUREWSIsIlNFQkFTVElBTiIsIkZFREVSSUNPIiwiVUxZU1NFUyIsIkhFUklCRVJUTyIsIkRPTk5FTEwiLCJDT0xFIiwiREFWSVMiLCJHQVZJTiIsIkVNRVJZIiwiV0FSRCIsIlJPTUVPIiwiSkFZU09OIiwiREFOVEUiLCJDTEVNRU5UIiwiQ09ZIiwiTUFYV0VMTCIsIkpBUlZJUyIsIkJSVU5PIiwiSVNTQUMiLCJEVURMRVkiLCJCUk9DSyIsIlNBTkZPUkQiLCJDQVJNRUxPIiwiQkFSTkVZIiwiTkVTVE9SIiwiU1RFRkFOIiwiRE9OTlkiLCJBUlQiLCJMSU5XT09EIiwiQkVBVSIsIldFTERPTiIsIkdBTEVOIiwiSVNJRFJPIiwiVFJVTUFOIiwiREVMTUFSIiwiSk9ITkFUSE9OIiwiU0lMQVMiLCJGUkVERVJJQyIsIkRJQ0siLCJJUldJTiIsIk1FUkxJTiIsIkNIQVJMRVkiLCJNQVJDRUxJTk8iLCJIQVJSSVMiLCJDQVJMTyIsIlRSRU5UT04iLCJLVVJUSVMiLCJIVU5URVIiLCJBVVJFTElPIiwiV0lORlJFRCIsIlZJVE8iLCJDT0xMSU4iLCJERU5WRVIiLCJDQVJURVIiLCJMRU9ORUwiLCJFTU9SWSIsIlBBU1FVQUxFIiwiTU9IQU1NQUQiLCJNQVJJQU5PIiwiREFOSUFMIiwiTEFORE9OIiwiRElSSyIsIkJSQU5ERU4iLCJBREFOIiwiQlVGT1JEIiwiR0VSTUFOIiwiV0lMTUVSIiwiRU1FUlNPTiIsIlpBQ0hFUlkiLCJGTEVUQ0hFUiIsIkpBQ1FVRVMiLCJFUlJPTCIsIkRBTFRPTiIsIk1PTlJPRSIsIkpPU1VFIiwiRURXQVJETyIsIkJPT0tFUiIsIldJTEZPUkQiLCJTT05OWSIsIlNIRUxUT04iLCJDQVJTT04iLCJUSEVST04iLCJSQVlNVU5ETyIsIkRBUkVOIiwiSE9VU1RPTiIsIlJPQkJZIiwiTElOQ09MTiIsIkdFTkFSTyIsIkJFTk5FVFQiLCJPQ1RBVklPIiwiQ09STkVMTCIsIkhVTkciLCJBUlJPTiIsIkFOVE9OWSIsIkhFUlNDSEVMIiwiR0lPVkFOTkkiLCJHQVJUSCIsIkNZUlVTIiwiQ1lSSUwiLCJST05OWSIsIkxPTiIsIkZSRUVNQU4iLCJEVU5DQU4iLCJLRU5OSVRIIiwiQ0FSTUlORSIsIkVSSUNIIiwiQ0hBRFdJQ0siLCJXSUxCVVJOIiwiUlVTUyIsIlJFSUQiLCJNWUxFUyIsIkFOREVSU09OIiwiTU9SVE9OIiwiSk9OQVMiLCJGT1JFU1QiLCJNSVRDSEVMIiwiTUVSVklOIiwiWkFORSIsIlJJQ0giLCJKQU1FTCIsIkxBWkFSTyIsIkFMUEhPTlNFIiwiUkFOREVMTCIsIk1BSk9SIiwiSkFSUkVUVCIsIkJST09LUyIsIkFCRFVMIiwiTFVDSUFOTyIsIlNFWU1PVVIiLCJFVUdFTklPIiwiTU9IQU1NRUQiLCJWQUxFTlRJTiIsIkNIQU5DRSIsIkFSTlVMRk8iLCJMVUNJRU4iLCJGRVJESU5BTkQiLCJUSEFEIiwiRVpSQSIsIkFMRE8iLCJSVUJJTiIsIlJPWUFMIiwiTUlUQ0giLCJFQVJMRSIsIkFCRSIsIldZQVRUIiwiTUFSUVVJUyIsIkxBTk5ZIiwiS0FSRUVNIiwiSkFNQVIiLCJCT1JJUyIsIklTSUFIIiwiRU1JTEUiLCJFTE1PIiwiQVJPTiIsIkxFT1BPTERPIiwiRVZFUkVUVEUiLCJKT1NFRiIsIkVMT1kiLCJST0RSSUNLIiwiUkVJTkFMRE8iLCJMVUNJTyIsIkpFUlJPRCIsIldFU1RPTiIsIkhFUlNIRUwiLCJCQVJUT04iLCJQQVJLRVIiLCJMRU1VRUwiLCJCVVJUIiwiSlVMRVMiLCJHSUwiLCJFTElTRU8iLCJBSE1BRCIsIk5JR0VMIiwiRUZSRU4iLCJBTlRXQU4iLCJBTERFTiIsIk1BUkdBUklUTyIsIkNPTEVNQU4iLCJESU5PIiwiT1NWQUxETyIsIkxFUyIsIkRFQU5EUkUiLCJOT1JNQU5EIiwiS0lFVEgiLCJUUkVZIiwiTk9SQkVSVE8iLCJOQVBPTEVPTiIsIkpFUk9MRCIsIkZSSVRaIiwiUk9TRU5ETyIsIk1JTEZPUkQiLCJDSFJJU1RPUEVSIiwiQUxGT05aTyIsIkxZTUFOIiwiSk9TSUFIIiwiQlJBTlQiLCJXSUxUT04iLCJSSUNPIiwiSkFNQUFMIiwiREVXSVRUIiwiQlJFTlRPTiIsIk9MSU4iLCJGT1NURVIiLCJGQVVTVElOTyIsIkNMQVVESU8iLCJKVURTT04iLCJHSU5PIiwiRURHQVJETyIsIkFMRUMiLCJUQU5ORVIiLCJKQVJSRUQiLCJET05OIiwiVEFEIiwiUFJJTkNFIiwiUE9SRklSSU8iLCJPRElTIiwiTEVOQVJEIiwiQ0hBVU5DRVkiLCJUT0QiLCJNRUwiLCJNQVJDRUxPIiwiS09SWSIsIkFVR1VTVFVTIiwiS0VWRU4iLCJISUxBUklPIiwiQlVEIiwiU0FMIiwiT1JWQUwiLCJNQVVSTyIsIlpBQ0hBUklBSCIsIk9MRU4iLCJBTklCQUwiLCJNSUxPIiwiSkVEIiwiRElMTE9OIiwiQU1BRE8iLCJORVdUT04iLCJMRU5OWSIsIlJJQ0hJRSIsIkhPUkFDSU8iLCJCUklDRSIsIk1PSEFNRUQiLCJERUxNRVIiLCJEQVJJTyIsIlJFWUVTIiwiTUFDIiwiSk9OQUgiLCJKRVJST0xEIiwiUk9CVCIsIkhBTksiLCJSVVBFUlQiLCJST0xMQU5EIiwiS0VOVE9OIiwiREFNSU9OIiwiQU5UT05FIiwiV0FMRE8iLCJGUkVEUklDIiwiQlJBRExZIiwiS0lQIiwiQlVSTCIsIldBTEtFUiIsIlRZUkVFIiwiSkVGRkVSRVkiLCJBSE1FRCIsIldJTExZIiwiU1RBTkZPUkQiLCJPUkVOIiwiTk9CTEUiLCJNT1NIRSIsIk1JS0VMIiwiRU5PQ0giLCJCUkVORE9OIiwiUVVJTlRJTiIsIkpBTUlTT04iLCJGTE9SRU5DSU8iLCJEQVJSSUNLIiwiVE9CSUFTIiwiSEFTU0FOIiwiR0lVU0VQUEUiLCJERU1BUkNVUyIsIkNMRVRVUyIsIlRZUkVMTCIsIkxZTkRPTiIsIktFRU5BTiIsIldFUk5FUiIsIkdFUkFMRE8iLCJDT0xVTUJVUyIsIkNIRVQiLCJCRVJUUkFNIiwiTUFSS1VTIiwiSFVFWSIsIkhJTFRPTiIsIkRXQUlOIiwiRE9OVEUiLCJUWVJPTiIsIk9NRVIiLCJJU0FJQVMiLCJISVBPTElUTyIsIkZFUk1JTiIsIkFEQUxCRVJUTyIsIkJPIiwiQkFSUkVUVCIsIlRFT0RPUk8iLCJNQ0tJTkxFWSIsIk1BWElNTyIsIkdBUkZJRUxEIiwiUkFMRUlHSCIsIkxBV0VSRU5DRSIsIkFCUkFNIiwiUkFTSEFEIiwiS0lORyIsIkVNTUlUVCIsIkRBUk9OIiwiU0FNVUFMIiwiTUlRVUVMIiwiRVVTRUJJTyIsIkRPTUVOSUMiLCJEQVJST04iLCJCVVNURVIiLCJXSUxCRVIiLCJSRU5BVE8iLCJKQyIsIkhPWVQiLCJIQVlXT09EIiwiRVpFS0lFTCIsIkNIQVMiLCJGTE9SRU5USU5PIiwiRUxST1kiLCJDTEVNRU5URSIsIkFSREVOIiwiTkVWSUxMRSIsIkVESVNPTiIsIkRFU0hBV04iLCJOQVRIQU5JQUwiLCJKT1JET04iLCJEQU5JTE8iLCJDTEFVRCIsIlNIRVJXT09EIiwiUkFZTU9OIiwiUkFZRk9SRCIsIkNSSVNUT0JBTCIsIkFNQlJPU0UiLCJUSVRVUyIsIkhZTUFOIiwiRkVMVE9OIiwiRVpFUVVJRUwiLCJFUkFTTU8iLCJTVEFOVE9OIiwiTE9OTlkiLCJMRU4iLCJJS0UiLCJNSUxBTiIsIkxJTk8iLCJKQVJPRCIsIkhFUkIiLCJBTkRSRUFTIiwiV0FMVE9OIiwiUkhFVFQiLCJQQUxNRVIiLCJET1VHTEFTUyIsIkNPUkRFTEwiLCJPU1dBTERPIiwiRUxMU1dPUlRIIiwiVklSR0lMSU8iLCJUT05FWSIsIk5BVEhBTkFFTCIsIkRFTCIsIkJFTkVESUNUIiwiTU9TRSIsIkpPSE5TT04iLCJJU1JFQUwiLCJHQVJSRVQiLCJGQVVTVE8iLCJBU0EiLCJBUkxFTiIsIlpBQ0siLCJXQVJORVIiLCJNT0RFU1RPIiwiRlJBTkNFU0NPIiwiTUFOVUFMIiwiR0FZTE9SRCIsIkdBU1RPTiIsIkZJTElCRVJUTyIsIkRFQU5HRUxPIiwiTUlDSEFMRSIsIkdSQU5WSUxMRSIsIldFUyIsIk1BTElLIiwiWkFDS0FSWSIsIlRVQU4iLCJFTERSSURHRSIsIkNSSVNUT1BIRVIiLCJDT1JURVoiLCJBTlRJT05FIiwiTUFMQ09NIiwiTE9ORyIsIktPUkVZIiwiSk9TUEVIIiwiQ09MVE9OIiwiV0FZTE9OIiwiVk9OIiwiSE9TRUEiLCJTSEFEIiwiU0FOVE8iLCJSVURPTEYiLCJST0xGIiwiUkVZIiwiUkVOQUxETyIsIk1BUkNFTExVUyIsIkxVQ0lVUyIsIktSSVNUT0ZFUiIsIkJPWUNFIiwiQkVOVE9OIiwiSEFZREVOIiwiSEFSTEFORCIsIkFSTk9MRE8iLCJSVUVCRU4iLCJMRUFORFJPIiwiS1JBSUciLCJKRVJSRUxMIiwiSkVST01ZIiwiSE9CRVJUIiwiQ0VEUklDSyIsIkFSTElFIiwiV0lORk9SRCIsIldBTExZIiwiTFVJR0kiLCJLRU5FVEgiLCJKQUNJTlRPIiwiR1JBSUciLCJGUkFOS0xZTiIsIkVETVVORE8iLCJTSUQiLCJQT1JURVIiLCJMRUlGIiwiSkVSQU1ZIiwiQlVDSyIsIldJTExJQU4iLCJWSU5DRU5aTyIsIlNIT04iLCJMWU5XT09EIiwiSkVSRSIsIkhBSSIsIkVMREVOIiwiRE9SU0VZIiwiREFSRUxMIiwiQlJPREVSSUNLIiwiQUxPTlNPIg==","base64"));
  names = rawNames.replace(/"/gm, "").split(",");
  return names;
};

alphabeticalValue = function(name) {
  var i, j, ref, sum, v;
  sum = 0;
  for (i = j = 0, ref = name.length; (0 <= ref ? j < ref : j > ref); i = 0 <= ref ? ++j : --j) {
    v = name.charCodeAt(i) - 64; // A is 65 in ascii, so this makes the value of 'A' == 1
    sum += v;
  }
  return sum;
};

problem.test = function() {
  return equal(alphabeticalValue("COLIN"), 53, "alphabetical value for COLIN is 53");
};

problem.answer = function() {
  var i, j, len, name, names, sum, v;
  names = readNames();
  names.sort();
  sum = 0;
  for (i = j = 0, len = names.length; j < len; i = ++j) {
    name = names[i];
    v = alphabeticalValue(name) * (i + 1);
    sum += v;
  }
  return sum;
};


}).call(this,require("buffer").Buffer)

},{"buffer":3}],"e023":[function(require,module,exports){
var abundantList, divisorSum, isAbundant, isPerfect, math, problem;

module.exports = problem = new Problem(`
Problem 23: Non-abundant sums
-----------------------------

A perfect number is a number for which the sum of its proper divisors is exactly equal to the number. For example, the sum of the proper divisors of 28 would be 1 + 2 + 4 + 7 + 14 = 28, which means that 28 is a perfect number.

A number n is called deficient if the sum of its proper divisors is less than n and it is called abundant if this sum exceeds n.

As 12 is the smallest abundant number, 1 + 2 + 3 + 4 + 6 = 16, the smallest number that can be written as the sum of two abundant numbers is 24. By mathematical analysis, it can be shown that all integers greater than 28123 can be written as the sum of two abundant numbers. However, this upper limit cannot be reduced any further by analysis even though it is known that the greatest number that cannot be expressed as the sum of two abundant numbers is less than this limit.

Find the sum of all the positive integers which cannot be written as the sum of two abundant numbers.
`);

math = require("math");

divisorSum = function(n) {
  return math.sum(math.divisors(n));
};

isAbundant = function(n) {
  return divisorSum(n) > n;
};

isPerfect = function(n) {
  return divisorSum(n) === n;
};

abundantList = function() {
  var k, list, n;
  list = [];
  for (n = k = 1; k <= 28123; n = ++k) {
    if (isAbundant(n)) {
      list.push(n);
    }
  }
  return list;
};

problem.test = function() {
  return equal(isPerfect(28), true, "28 is a perfect number");
};

problem.answer = function() {
  var i, j, k, l, len, len1, list, m, sum, sumOfAbundantsSeen;
  list = abundantList();
  console.log(list);
  sumOfAbundantsSeen = {};
  for (k = 0, len = list.length; k < len; k++) {
    i = list[k];
    for (l = 0, len1 = list.length; l < len1; l++) {
      j = list[l];
      sumOfAbundantsSeen[i + j] = true;
    }
  }
  sum = 0;
  for (i = m = 1; m <= 28123; i = ++m) {
    if (!sumOfAbundantsSeen[i]) {
      sum += i;
    }
  }
  return sum;
};


},{"math":"math"}],"e024":[function(require,module,exports){
var dijkstraPermuteNext, lexPermuteFast, lexPermuteSlow, permute, problem, swap;

module.exports = problem = new Problem(`
Problem 24: Lexicographic permutations
--------------------------------------

A permutation is an ordered arrangement of objects. For example, 3124 is one possible permutation of the digits 1, 2, 3 and 4. If all of the permutations are listed numerically or alphabetically, we call it lexicographic order. The lexicographic permutations of 0, 1 and 2 are:

                            012   021   102   120   201   210

What is the millionth lexicographic permutation of the digits 0, 1, 2, 3, 4, 5, 6, 7, 8 and 9?
`);

// This function is -way- too slow
permute = function(current, src, dst) {
  var i, k, leftovers, len, newcurrent, results, v;
  results = [];
  for (i = k = 0, len = src.length; k < len; i = ++k) {
    v = src[i];
    newcurrent = current + v;
    if (src.length > 1) {
      leftovers = src.slice(0);
      leftovers.splice(i, 1);
      results.push(permute(newcurrent, leftovers, dst));
    } else {
      results.push(dst.push(newcurrent));
    }
  }
  return results;
};

lexPermuteSlow = function(chars) {
  var dst;
  dst = [];
  permute("", chars.split(""), dst);
  dst.sort();
  return dst;
};

swap = function(arr, a, b) {
  var t;
  t = arr[a];
  arr[a] = arr[b];
  return arr[b] = t;
};

// Don't ask me, ask Dijkstra's A Discipline of Programming, page 71
dijkstraPermuteNext = function(arr) {
  var i, j, results;
  i = arr.length - 1;
  while (arr[i - 1] >= arr[i]) {
    i--;
  }
  j = arr.length;
  while (arr[j - 1] <= arr[i - 1]) {
    j--;
  }
  swap(arr, i - 1, j - 1);
  i++;
  j = arr.length;
  results = [];
  while (i < j) {
    swap(arr, i - 1, j - 1);
    i++;
    results.push(j--);
  }
  return results;
};

lexPermuteFast = function(chars, which) {
  var arr, i, k, ref, v;
  arr = (function() {
    var k, len, results;
    results = [];
    for (k = 0, len = chars.length; k < len; k++) {
      v = chars[k];
      results.push(parseInt(v));
    }
    return results;
  })();
  for (i = k = 1, ref = which; (1 <= ref ? k < ref : k > ref); i = 1 <= ref ? ++k : --k) {
    dijkstraPermuteNext(arr);
  }
  return arr.join("");
};

problem.test = function() {
  equal(lexPermuteFast("012", 4), "120", "4th permutation of 012 is 120, fast version");
  return equal(lexPermuteSlow("012"), "012 021 102 120 201 210".split(" "), "permutation of 012 is 012 021 102 120 201 210, slow version");
};

problem.answer = function() {
  return lexPermuteFast("0123456789", 1000000);
};

// slow version, took ~13 seconds on a 2014 Macbook Pro
// dst = lexPermuteSlow("0123456789")
// return dst[999999] # [0] is first, therefore [999999] is 1,000,000th


},{}],"e025":[function(require,module,exports){
var bigInt, firstFiboWithDigitCount, problem;

module.exports = problem = new Problem(`
Problem 25: 1000-digit Fibonacci number
---------------------------------------

The Fibonacci sequence is defined by the recurrence relation:

F(n) = F(n−1) + F(n−2), where F(1) = 1 and F(2) = 1.
Hence the first 12 terms will be:

F(1)  = 1
F(2)  = 1
F(3)  = 2
F(4)  = 3
F(5)  = 5
F(6)  = 8
F(7)  = 13
F(8)  = 21
F(9)  = 34
F(10) = 55
F(11) = 89
F(12) = 144
The 12th term, F(12), is the first term to contain three digits.

What is the first term in the Fibonacci sequence to contain 1000 digits?
`);

bigInt = require("big-integer");

firstFiboWithDigitCount = function(n) {
  var curr, digitCount, index, next, prev, str;
  index = 1;
  prev = new bigInt(0);
  curr = new bigInt(1);
  while (true) {
    str = String(curr);
    digitCount = str.length;
    if (digitCount >= n) {
      return [index, str];
    }
    next = curr.plus(prev);
    prev = curr;
    curr = next;
    index++;
  }
};

problem.test = function() {
  return equal(firstFiboWithDigitCount(3), [12, "144"], "first fibonacci with 3 digits is F(12) = 144");
};

problem.answer = function() {
  return firstFiboWithDigitCount(1000);
};


},{"big-integer":2}],"e026":[function(require,module,exports){
var Decimal, findRecurringCycle, findRecurringCycleFast, findRecurringCycleSlow, loopsAt, problem;

module.exports = problem = new Problem(`
Problem 26: Reciprocal cycles
-----------------------------

A unit fraction contains 1 in the numerator. The decimal representation of the unit fractions with denominators 2 to 10 are given:

1/2   =   0.5
1/3   =   0.(3)
1/4   =   0.25
1/5   =   0.2
1/6   =   0.1(6)
1/7   =   0.(142857)
1/8   =   0.125
1/9   =   0.(1)
1/10  =   0.1

Where 0.1(6) means 0.166666..., and has a 1-digit recurring cycle. It can be seen that 1/7 has a 6-digit recurring cycle.

Find the value of d < 1000 for which 1/d contains the longest recurring cycle in its decimal fraction part.
`);

Decimal = require('decimal.js');

Decimal.precision = 1500; // oof

loopsAt = function(digits, front, len) {
  var endIndex, i, j, ref;
  endIndex = digits.length - 1 - front;
  if (endIndex <= len) {
    return false;
  }
  if (endIndex > 3) {
    // trim rounding digit, hax
    endIndex -= 1;
  }
  for (i = j = 0, ref = endIndex; (0 <= ref ? j <= ref : j >= ref); i = 0 <= ref ? ++j : --j) {
    if (digits.charAt(front + i) !== digits.charAt(front + (i % len))) {
      return false;
    }
  }
  return true;
};

// Never leave a text-based tools programmer to solve a math problem
findRecurringCycleSlow = function(denominator) {
  var cycle, cycleFront, cycleLength, digits, digitsLen, halfDigitsLen, j, k, ref, ref1;
  digits = String(new Decimal(1).dividedBy(denominator));
  digits = digits.replace(/^0./, "");
  digitsLen = digits.length;
  halfDigitsLen = digitsLen >> 1;
  cycle = {
    denominator: denominator,
    front: -1,
    length: -1,
    pretty: `0.${digits}`
  };
  for (cycleFront = j = 0, ref = halfDigitsLen; (0 <= ref ? j <= ref : j >= ref); cycleFront = 0 <= ref ? ++j : --j) {
    if (cycle.length !== -1) {
      break;
    }
    for (cycleLength = k = 1, ref1 = halfDigitsLen + 1; (1 <= ref1 ? k <= ref1 : k >= ref1); cycleLength = 1 <= ref1 ? ++k : --k) {
      if (loopsAt(digits, cycleFront, cycleLength)) {
        cycle.front = cycleFront;
        cycle.length = cycleLength;
        cycle.repeat = digits.substr(cycleFront, cycleLength);
        cycle.pretty = `0.${digits.substr(0, cycleFront)}(${cycle.repeat})`;
        break;
      }
    }
  }
  return cycle;
};

// This began life as someone else's fractionToDecimal() Python code; my homemade version is the slow garbage above
findRecurringCycleFast = function(denominator) {
  var cycle, firstNum, nonRecurringCount, nonRecurringPart, num, num2Factors, num5Factors, numerator, pretty, recurringPart;
  numerator = 1;
  num = denominator;
  num2Factors = 0;
  while (num % (2 ** (num2Factors + 1)) === 0) {
    num2Factors += 1;
  }
  num5Factors = 0;
  while (num % (5 ** (num5Factors + 1)) === 0) {
    num5Factors += 1;
  }
  nonRecurringCount = Math.max(num2Factors, num5Factors);
  nonRecurringPart = '';
  while ((nonRecurringCount > 0) && (numerator > 0)) {
    numerator *= 10;
    nonRecurringPart += String(Math.floor(numerator / denominator));
    numerator = numerator % denominator;
    nonRecurringCount -= 1;
  }
  firstNum = numerator;
  recurringPart = '';
  while (numerator > 0) {
    numerator *= 10;
    recurringPart += String(Math.floor(numerator / denominator));
    numerator %= denominator;
    if (numerator === firstNum) {
      break;
    }
  }
  pretty = `0.${nonRecurringPart}`;
  if (recurringPart.length > 0) {
    pretty += '(' + recurringPart + ')';
  }
  cycle = {
    denominator: denominator,
    length: recurringPart.length,
    pretty: pretty
  };
  return cycle;
};

findRecurringCycle = findRecurringCycleFast;

problem.test = function() {
  cequal(findRecurringCycle(2), "!c.pretty!", "0.5", "Recurring cycle length 1/2 : !c.pretty!");
  cequal(findRecurringCycle(3), "!c.pretty!", "0.(3)", "Recurring cycle length 1/3 : !c.pretty!");
  cequal(findRecurringCycle(4), "!c.pretty!", "0.25", "Recurring cycle length 1/4 : !c.pretty!");
  cequal(findRecurringCycle(5), "!c.pretty!", "0.2", "Recurring cycle length 1/5 : !c.pretty!");
  cequal(findRecurringCycle(6), "!c.pretty!", "0.1(6)", "Recurring cycle length 1/6 : !c.pretty!");
  cequal(findRecurringCycle(7), "!c.pretty!", "0.(142857)", "Recurring cycle length 1/7 : !c.pretty!");
  cequal(findRecurringCycle(8), "!c.pretty!", "0.125", "Recurring cycle length 1/8 : !c.pretty!");
  cequal(findRecurringCycle(9), "!c.pretty!", "0.(1)", "Recurring cycle length 1/9 : !c.pretty!");
  return cequal(findRecurringCycle(10), "!c.pretty!", "0.1", "Recurring cycle length 1/10: !c.pretty!");
};

problem.answer = function() {
  var cycle, j, largestCycle, largestLen, v;
  largestCycle = null;
  largestLen = 0;
  for (v = j = 2; j < 1000; v = ++j) {
    cycle = findRecurringCycle(v);
    if (largestLen < cycle.length) {
      largestLen = cycle.length;
      largestCycle = cycle;
    }
  }
  return largestCycle.denominator;
};


},{"decimal.js":4}],"math":[function(require,module,exports){
var IncrementalSieve, root;

root = typeof exports !== "undefined" && exports !== null ? exports : this;

// Sieve was blindly taken/adapted from RosettaCode. DONT EVEN CARE
IncrementalSieve = class IncrementalSieve {
  constructor() {
    this.n = 0;
  }

  next() {
    var nxt, p2, s;
    this.n += 2;
    if (this.n < 7) {
      if (this.n < 3) {
        this.n = 1;
        return 2;
      }
      if (this.n < 5) {
        return 3;
      }
      this.dict = {};
      this.bps = new IncrementalSieve();
      this.bps.next();
      this.p = this.bps.next();
      this.q = this.p * this.p;
      return 5;
    } else {
      s = this.dict[this.n];
      if (!s) {
        if (this.n < this.q) {
          return this.n;
        } else {
          p2 = this.p << 1;
          this.dict[this.n + p2] = p2;
          this.p = this.bps.next();
          this.q = this.p * this.p;
          return this.next();
        }
      } else {
        delete this.dict[this.n];
        nxt = this.n + s;
        while (this.dict[nxt]) {
          nxt += s;
        }
        this.dict[nxt] = s;
        return this.next();
      }
    }
  }

};

root.IncrementalSieve = IncrementalSieve;

// -----------------------------------------------------------------------------------
// Shamelessly pilfered/adopted from http://www.javascripter.net/faq/numberisprime.htm
root.leastFactor = function(n) {
  var i, j, m, ref;
  if (isNaN(n) || !isFinite(n)) {
    return 0/0;
  }
  if (n === 0) {
    return 0;
  }
  if ((n % 1) !== 0 || (n * n) < 2) {
    return 1;
  }
  if ((n % 2) === 0) {
    return 2;
  }
  if ((n % 3) === 0) {
    return 3;
  }
  if ((n % 5) === 0) {
    return 5;
  }
  m = Math.sqrt(n);
  for (i = j = 7, ref = m; j <= ref; i = j += 30) {
    if ((n % i) === 0) {
      return i;
    }
    if ((n % (i + 4)) === 0) {
      return i + 4;
    }
    if ((n % (i + 6)) === 0) {
      return i + 6;
    }
    if ((n % (i + 10)) === 0) {
      return i + 10;
    }
    if ((n % (i + 12)) === 0) {
      return i + 12;
    }
    if ((n % (i + 16)) === 0) {
      return i + 16;
    }
    if ((n % (i + 22)) === 0) {
      return i + 22;
    }
    if ((n % (i + 24)) === 0) {
      return i + 24;
    }
  }
  return n;
};

root.isPrime = function(n) {
  if (isNaN(n) || !isFinite(n) || (n % 1) !== 0 || (n < 2)) {
    return false;
  }
  if (n === root.leastFactor(n)) {
    return true;
  }
  return false;
};

// -----------------------------------------------------------------------------------
root.primeFactors = function(n) {
  var factor, factors;
  if (n === 1) {
    return [1];
  }
  factors = [];
  while (!root.isPrime(n)) {
    factor = root.leastFactor(n);
    factors.push(factor);
    n /= factor;
  }
  factors.push(n);
  return factors;
};

// This does a brute-force attempt at combining all of the prime factors (2^n attempts).
// I'm sure there is a cooler way.
root.divisors = function(n) {
  var attempt, combosToTry, divisorList, factor, factorsSeen, i, j, k, len, primes, ref, v;
  primes = root.primeFactors(n);
  combosToTry = Math.pow(2, primes.length);
  factorsSeen = {};
  for (attempt = j = 0, ref = combosToTry; (0 <= ref ? j < ref : j > ref); attempt = 0 <= ref ? ++j : --j) {
    factor = 1;
    for (i = k = 0, len = primes.length; k < len; i = ++k) {
      v = primes[i];
      if (attempt & (1 << i)) {
        factor *= v;
      }
    }
    if (factor < n) {
      factorsSeen[factor] = true;
    }
  }
  divisorList = (function() {
    var l, len1, ref1, results;
    ref1 = Object.keys(factorsSeen);
    results = [];
    for (l = 0, len1 = ref1.length; l < len1; l++) {
      v = ref1[l];
      results.push(parseInt(v));
    }
    return results;
  })();
  return divisorList;
};

root.sum = function(numberArray) {
  var j, len, n, sum;
  sum = 0;
  for (j = 0, len = numberArray.length; j < len; j++) {
    n = numberArray[j];
    sum += n;
  }
  return sum;
};

root.factorial = function(n) {
  var f;
  f = n;
  while (n > 1) {
    n--;
    f *= n;
  }
  return f;
};

root.nCr = function(n, r) {
  return Math.floor(root.factorial(n) / (root.factorial(r) * root.factorial(n - r)));
};


},{}],"terminal":[function(require,module,exports){
var LAST_PROBLEM, Problem, interp, root, type;

LAST_PROBLEM = 26;

root = window; // exports ? this

root.escapedStringify = function(o) {
  var str;
  str = JSON.stringify(o);
  str = str.replace("]", "\\]");
  return str;
};

root.runAll = function() {
  var lastPuzzle, loadNextScript, nextIndex;
  lastPuzzle = LAST_PROBLEM;
  nextIndex = 0;
  loadNextScript = function() {
    if (nextIndex < lastPuzzle) {
      nextIndex++;
      return runTest(nextIndex, loadNextScript);
    }
  };
  return loadNextScript();
};

root.iterateProblems = function(args) {
  var indexToProcess, iterateNext;
  indexToProcess = null;
  if (args.endIndex > 0) {
    if (args.startIndex <= args.endIndex) {
      indexToProcess = args.startIndex;
      args.startIndex++;
    }
  } else {
    if (args.list.length > 0) {
      indexToProcess = args.list.shift();
    }
  }
  if (indexToProcess !== null) {
    iterateNext = function() {
      window.args = args;
      return runTest(indexToProcess, function() {
        return iterateProblems(args);
      });
    };
    return iterateNext();
  }
};

root.runTest = function(index, cb) {
  var moduleName, problem;
  moduleName = `e${('000' + index).slice(-3)}`;
  window.index = index;
  problem = require(moduleName);
  problem.process();
  if (cb) {
    return window.setTimeout(cb, 0);
  }
};

Problem = class Problem {
  constructor(description) {
    var lines;
    this.description = description;
    this.index = window.index;
    lines = this.description.split(/\n/);
    while (lines.length > 0 && lines[0].length === 0) {
      lines.shift();
    }
    this.title = lines.shift();
    this.line = lines.shift();
    this.description = lines.join("\n");
  }

  now() {
    if (window.performance) {
      return window.performance.now();
    } else {
      return new Date().getTime();
    }
  }

  process() {
    var answer, answerFunc, end, formattedTitle, ms, sourceLine, start, testFunc, url;
    if (window.args.description) {
      window.terminal.echo("[[;#444444;]_______________________________________________________________________________________________]\n");
    }
    formattedTitle = $.terminal.format(`[[;#ffaa00;]${this.title}]`);
    url = `?c=${window.args.cmd}_${this.index}`;
    if (window.args.verbose) {
      url += "_v";
    }
    window.terminal.echo(`<a href=\"${url}\">${formattedTitle}</a>`, {
      raw: true
    });
    if (window.args.description) {
      window.terminal.echo(`[[;#444444;]${this.line}]`);
      window.terminal.echo(`[[;#ccccee;]${this.description}]\n`);
      sourceLine = $.terminal.format("[[;#444444;]Source:] ");
      sourceLine += ` <a href=\"src/e${('000' + this.index).slice(-3)}.coffee\">` + $.terminal.format("[[;#773300;]Local]") + "</a> ";
      sourceLine += $.terminal.format("[[;#444444;]/]");
      sourceLine += ` <a href=\"https://github.com/joedrago/euler/blob/master/src/e${('000' + this.index).slice(-3)}.coffee\">` + $.terminal.format("[[;#773300;]Github]") + "</a>";
      window.terminal.echo(sourceLine, {
        raw: true
      });
      if (window.args.test || window.args.answer) {
        window.terminal.echo("");
      }
    }
    testFunc = this.test;
    answerFunc = this.answer;
    if (window.args.test) {
      if (testFunc === void 0) {
        window.terminal.echo("[[;#444444;] (no tests)]");
      } else {
        testFunc();
      }
    }
    if (window.args.answer) {
      start = this.now();
      answer = answerFunc();
      end = this.now();
      ms = end - start;
      return window.terminal.echo(`[[;#ffffff;] -> ][[;#aaffaa;]Answer:] ([[;#aaffff;]${ms.toFixed(1)}ms]): [[;#ffffff;]${escapedStringify(answer)}]`);
    }
  }

};

root.Problem = Problem;

root.ok = function(v, msg) {
  return window.terminal.echo(`[[;#ffffff;] *  ]${v}: ${msg}`);
};

// https://coffeescript-cookbook.github.io/chapters/classes_and_objects/type-function
type = function(obj) {
  var classToType;
  if (obj === void 0 || obj === null) {
    return String(obj);
  }
  classToType = {
    '[object Boolean]': 'boolean',
    '[object Number]': 'number',
    '[object String]': 'string',
    '[object Function]': 'function',
    '[object Array]': 'array',
    '[object Date]': 'date',
    '[object RegExp]': 'regexp',
    '[object Object]': 'object'
  };
  return classToType[Object.prototype.toString.call(obj)];
};

interp = function(msg, a, b, c) {
  msg = msg.replace(/!([^!]+)!/g, function(wholeMatch, lookup) {
    var m, v, vkey;
    v = a;
    vkey = null;
    if (m = lookup.match(/([^\.]+)\.([^\.]+)/)) {
      if (m[1] === 'b') {
        v = b;
      }
      if (m[1] === 'c') {
        v = c;
      }
      v = v[m[2]];
    } else {
      if (lookup === 'b') {
        v = b;
      }
      if (lookup === 'c') {
        v = c;
      }
    }
    switch (type(v)) {
      case 'object':
      case 'array':
        return JSON.stringify(v);
    }
    return String(v);
  });
  return msg;
};

root.cequal = function(calc, a, b, msg) {
  var i, isEqual, j, ref;
  if (calc !== null) {
    a = interp(a, calc, calc, calc);
  }
  if ($.isArray(a) && $.isArray(b)) {
    isEqual = a.length === b.length;
    if (isEqual) {
      for (i = j = 0, ref = a.length; (0 <= ref ? j < ref : j > ref); i = 0 <= ref ? ++j : --j) {
        if (String(a[i]) !== String(b[i])) {
          isEqual = false;
          break;
        }
      }
    }
  } else {
    isEqual = String(a) === String(b);
  }
  msg = interp(msg, a, b, calc);
  if (isEqual) {
    return window.terminal.echo(`[[;#ffffff;] *  ][[;#555555;]PASS: ${msg}]`);
  } else {
    return window.terminal.echo(`[[;#ffffff;] *  ][[;#ffaaaa;]FAIL: ${msg} (${a} != ${b})]`);
  }
};

root.equal = function(a, b, msg) {
  return root.cequal(null, a, b, msg);
};

root.onCommand = (command) => {
  var arg, args, cmd, j, len, process, ref, v;
  if (command.length === 0) {
    return;
  }
  cmd = $.terminal.parseCommand(command);
  if (cmd.name.length === 0) {
    return;
  }
  args = {
    startIndex: 0,
    endIndex: 0,
    list: [],
    verbose: false,
    description: false,
    test: false,
    answer: false
  };
  process = true;
  ref = cmd.args;
  for (j = 0, len = ref.length; j < len; j++) {
    arg = ref[j];
    arg = String(arg);
    if (arg.length < 1) {
      continue;
    }
    if (arg[0] === 'v') {
      args.verbose = true;
    } else if (arg.match(/^\d+$/)) {
      v = parseInt(arg);
      if ((v >= 1) && (v <= LAST_PROBLEM)) {
        args.list.push(v);
      } else {
        process = false;
        window.terminal.echo(`[[;#ffaaaa;]No such test: ${v} (valid tests 1-${LAST_PROBLEM})]`);
      }
    }
  }
  if (args.list.length === 0) {
    args.startIndex = 1;
    args.endIndex = LAST_PROBLEM;
  }
  // Since all of our commands happen to have unique first letters, let people be super lazy/silly
  if (cmd.name[0] === 'l') {
    args.cmd = "list";
  } else if (cmd.name[0] === 'd') {
    args.cmd = "describe";
    args.description = true;
  } else if (cmd.name[0] === 't') {
    args.cmd = "test";
    args.test = true;
  } else if (cmd.name[0] === 'a') {
    args.cmd = "answer";
    args.answer = true;
  } else if (cmd.name[0] === 'r') {
    args.cmd = "run";
    args.test = true;
    args.answer = true;
  } else if (cmd.name[0] === 's') {
    args.cmd = "show";
    args.test = true;
    args.answer = true;
    args.description = true;
  } else if (cmd.name[0] === 'd') {
    args.cmd = "describe";
    args.description = true;
  } else if (cmd.name[0] === 'h') {
    args.cmd = "help";
    process = false;
    window.terminal.echo(`Commands:

    list [X]     - List problem titles
    describe [X] - Display full problem descriptions
    test [X]     - Run unit tests
    answer [X]   - Time and calculate answer
    run [X]      - test and answer combined
    show [X]     - describe, test, and answer combined
    help         - This help

    In all of these, [X] can be a list of one or more problem numbers. (a value from 1 to ${LAST_PROBLEM}). If absent, it implies all problems.
    Also, adding the word "verbose" to some of these commands will emit the description before performing the task.
`);
  } else {
    process = false;
    window.terminal.echo("[[;#ffaaaa;]Unknown command.]");
  }
  if (args.verbose) {
    args.description = true;
  }
  if (process) {
    return iterateProblems(args);
  }
};


},{}]},{},[])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uXFwuLlxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiLi5cXC4uXFxub2RlX21vZHVsZXNcXGJhc2U2NC1qc1xcaW5kZXguanMiLCIuLlxcLi5cXG5vZGVfbW9kdWxlc1xcYmlnLWludGVnZXJcXEJpZ0ludGVnZXIuanMiLCIuLlxcLi5cXG5vZGVfbW9kdWxlc1xcYnVmZmVyXFxpbmRleC5qcyIsIi4uXFwuLlxcbm9kZV9tb2R1bGVzXFxkZWNpbWFsLmpzXFxkZWNpbWFsLmpzIiwiLi5cXC4uXFxub2RlX21vZHVsZXNcXGllZWU3NTRcXGluZGV4LmpzIiwiLi5cXC4uXFxzcmNcXGUwMDEuY29mZmVlIiwiLi5cXC4uXFxzcmNcXGUwMDIuY29mZmVlIiwiLi5cXC4uXFxzcmNcXGUwMDMuY29mZmVlIiwiLi5cXC4uXFxzcmNcXGUwMDQuY29mZmVlIiwiLi5cXC4uXFxzcmNcXGUwMDUuY29mZmVlIiwiLi5cXC4uXFxzcmNcXGUwMDYuY29mZmVlIiwiLi5cXC4uXFxzcmNcXGUwMDcuY29mZmVlIiwiLi5cXC4uXFxzcmNcXGUwMDguY29mZmVlIiwiLi5cXC4uXFxzcmNcXGUwMDkuY29mZmVlIiwiLi5cXC4uXFxzcmNcXGUwMTAuY29mZmVlIiwiLi5cXC4uXFxzcmNcXGUwMTEuY29mZmVlIiwiLi5cXC4uXFxzcmNcXGUwMTIuY29mZmVlIiwiLi5cXC4uXFxzcmNcXGUwMTMuY29mZmVlIiwiLi5cXC4uXFxzcmNcXGUwMTQuY29mZmVlIiwiLi5cXC4uXFxzcmNcXGUwMTUuY29mZmVlIiwiLi5cXC4uXFxzcmNcXGUwMTYuY29mZmVlIiwiLi5cXC4uXFxzcmNcXGUwMTcuY29mZmVlIiwiLi5cXC4uXFxzcmNcXGUwMTguY29mZmVlIiwiLi5cXC4uXFxzcmNcXGUwMTkuY29mZmVlIiwiLi5cXC4uXFxzcmNcXGUwMjAuY29mZmVlIiwiLi5cXC4uXFxzcmNcXGUwMjEuY29mZmVlIiwiLi5cXC4uXFxzcmNcXGUwMjIuY29mZmVlIiwiLi5cXC4uXFxzcmNcXGUwMjMuY29mZmVlIiwiLi5cXC4uXFxzcmNcXGUwMjQuY29mZmVlIiwiLi5cXC4uXFxzcmNcXGUwMjUuY29mZmVlIiwiLi5cXC4uXFxzcmNcXGUwMjYuY29mZmVlIiwiLi5cXC4uXFxzcmNcXG1hdGguY29mZmVlIiwiLi5cXC4uXFxzcmNcXHRlcm1pbmFsLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDNzZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDanZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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TCxHQUFXO0lBQ1gsSUFBSSxDQUFDLE1BQUwsR0FBYyxLQUZYO0dBQUEsTUFHQSxJQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBRCxDQUFSLEtBQWUsR0FBbEI7SUFDSCxJQUFJLENBQUMsR0FBTCxHQUFXO0lBQ1gsSUFBSSxDQUFDLElBQUwsR0FBWTtJQUNaLElBQUksQ0FBQyxNQUFMLEdBQWMsS0FIWDtHQUFBLE1BSUEsSUFBRyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUQsQ0FBUixLQUFlLEdBQWxCO0lBQ0gsSUFBSSxDQUFDLEdBQUwsR0FBVztJQUNYLElBQUksQ0FBQyxJQUFMLEdBQVk7SUFDWixJQUFJLENBQUMsTUFBTCxHQUFjO0lBQ2QsSUFBSSxDQUFDLFdBQUwsR0FBbUIsS0FKaEI7R0FBQSxNQUtBLElBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFELENBQVIsS0FBZSxHQUFsQjtJQUNILElBQUksQ0FBQyxHQUFMLEdBQVc7SUFDWCxJQUFJLENBQUMsV0FBTCxHQUFtQixLQUZoQjtHQUFBLE1BR0EsSUFBRyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUQsQ0FBUixLQUFlLEdBQWxCO0lBQ0gsSUFBSSxDQUFDLEdBQUwsR0FBVztJQUNYLE9BQUEsR0FBVTtJQUNWLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBaEIsQ0FBcUIsQ0FBQTs7Ozs7Ozs7OzswRkFBQSxDQUFBLENBV3VFLFlBWHZFLENBQUE7O0FBQUEsQ0FBckIsRUFIRztHQUFBLE1BQUE7SUFtQkgsT0FBQSxHQUFVO0lBQ1YsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFoQixDQUFxQiwrQkFBckIsRUFwQkc7O0VBc0JMLElBQUcsSUFBSSxDQUFDLE9BQVI7SUFDRSxJQUFJLENBQUMsV0FBTCxHQUFtQixLQURyQjs7RUFHQSxJQUFHLE9BQUg7V0FDRSxlQUFBLENBQWdCLElBQWhCLEVBREY7O0FBbEZlIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiJ3VzZSBzdHJpY3QnXG5cbmV4cG9ydHMuYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGhcbmV4cG9ydHMudG9CeXRlQXJyYXkgPSB0b0J5dGVBcnJheVxuZXhwb3J0cy5mcm9tQnl0ZUFycmF5ID0gZnJvbUJ5dGVBcnJheVxuXG52YXIgbG9va3VwID0gW11cbnZhciByZXZMb29rdXAgPSBbXVxudmFyIEFyciA9IHR5cGVvZiBVaW50OEFycmF5ICE9PSAndW5kZWZpbmVkJyA/IFVpbnQ4QXJyYXkgOiBBcnJheVxuXG52YXIgY29kZSA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvJ1xuZm9yICh2YXIgaSA9IDAsIGxlbiA9IGNvZGUubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgbG9va3VwW2ldID0gY29kZVtpXVxuICByZXZMb29rdXBbY29kZS5jaGFyQ29kZUF0KGkpXSA9IGlcbn1cblxuLy8gU3VwcG9ydCBkZWNvZGluZyBVUkwtc2FmZSBiYXNlNjQgc3RyaW5ncywgYXMgTm9kZS5qcyBkb2VzLlxuLy8gU2VlOiBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9CYXNlNjQjVVJMX2FwcGxpY2F0aW9uc1xucmV2TG9va3VwWyctJy5jaGFyQ29kZUF0KDApXSA9IDYyXG5yZXZMb29rdXBbJ18nLmNoYXJDb2RlQXQoMCldID0gNjNcblxuZnVuY3Rpb24gZ2V0TGVucyAoYjY0KSB7XG4gIHZhciBsZW4gPSBiNjQubGVuZ3RoXG5cbiAgaWYgKGxlbiAlIDQgPiAwKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHN0cmluZy4gTGVuZ3RoIG11c3QgYmUgYSBtdWx0aXBsZSBvZiA0JylcbiAgfVxuXG4gIC8vIFRyaW0gb2ZmIGV4dHJhIGJ5dGVzIGFmdGVyIHBsYWNlaG9sZGVyIGJ5dGVzIGFyZSBmb3VuZFxuICAvLyBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9iZWF0Z2FtbWl0L2Jhc2U2NC1qcy9pc3N1ZXMvNDJcbiAgdmFyIHZhbGlkTGVuID0gYjY0LmluZGV4T2YoJz0nKVxuICBpZiAodmFsaWRMZW4gPT09IC0xKSB2YWxpZExlbiA9IGxlblxuXG4gIHZhciBwbGFjZUhvbGRlcnNMZW4gPSB2YWxpZExlbiA9PT0gbGVuXG4gICAgPyAwXG4gICAgOiA0IC0gKHZhbGlkTGVuICUgNClcblxuICByZXR1cm4gW3ZhbGlkTGVuLCBwbGFjZUhvbGRlcnNMZW5dXG59XG5cbi8vIGJhc2U2NCBpcyA0LzMgKyB1cCB0byB0d28gY2hhcmFjdGVycyBvZiB0aGUgb3JpZ2luYWwgZGF0YVxuZnVuY3Rpb24gYnl0ZUxlbmd0aCAoYjY0KSB7XG4gIHZhciBsZW5zID0gZ2V0TGVucyhiNjQpXG4gIHZhciB2YWxpZExlbiA9IGxlbnNbMF1cbiAgdmFyIHBsYWNlSG9sZGVyc0xlbiA9IGxlbnNbMV1cbiAgcmV0dXJuICgodmFsaWRMZW4gKyBwbGFjZUhvbGRlcnNMZW4pICogMyAvIDQpIC0gcGxhY2VIb2xkZXJzTGVuXG59XG5cbmZ1bmN0aW9uIF9ieXRlTGVuZ3RoIChiNjQsIHZhbGlkTGVuLCBwbGFjZUhvbGRlcnNMZW4pIHtcbiAgcmV0dXJuICgodmFsaWRMZW4gKyBwbGFjZUhvbGRlcnNMZW4pICogMyAvIDQpIC0gcGxhY2VIb2xkZXJzTGVuXG59XG5cbmZ1bmN0aW9uIHRvQnl0ZUFycmF5IChiNjQpIHtcbiAgdmFyIHRtcFxuICB2YXIgbGVucyA9IGdldExlbnMoYjY0KVxuICB2YXIgdmFsaWRMZW4gPSBsZW5zWzBdXG4gIHZhciBwbGFjZUhvbGRlcnNMZW4gPSBsZW5zWzFdXG5cbiAgdmFyIGFyciA9IG5ldyBBcnIoX2J5dGVMZW5ndGgoYjY0LCB2YWxpZExlbiwgcGxhY2VIb2xkZXJzTGVuKSlcblxuICB2YXIgY3VyQnl0ZSA9IDBcblxuICAvLyBpZiB0aGVyZSBhcmUgcGxhY2Vob2xkZXJzLCBvbmx5IGdldCB1cCB0byB0aGUgbGFzdCBjb21wbGV0ZSA0IGNoYXJzXG4gIHZhciBsZW4gPSBwbGFjZUhvbGRlcnNMZW4gPiAwXG4gICAgPyB2YWxpZExlbiAtIDRcbiAgICA6IHZhbGlkTGVuXG5cbiAgdmFyIGlcbiAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSArPSA0KSB7XG4gICAgdG1wID1cbiAgICAgIChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSldIDw8IDE4KSB8XG4gICAgICAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAxKV0gPDwgMTIpIHxcbiAgICAgIChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSArIDIpXSA8PCA2KSB8XG4gICAgICByZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSArIDMpXVxuICAgIGFycltjdXJCeXRlKytdID0gKHRtcCA+PiAxNikgJiAweEZGXG4gICAgYXJyW2N1ckJ5dGUrK10gPSAodG1wID4+IDgpICYgMHhGRlxuICAgIGFycltjdXJCeXRlKytdID0gdG1wICYgMHhGRlxuICB9XG5cbiAgaWYgKHBsYWNlSG9sZGVyc0xlbiA9PT0gMikge1xuICAgIHRtcCA9XG4gICAgICAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkpXSA8PCAyKSB8XG4gICAgICAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAxKV0gPj4gNClcbiAgICBhcnJbY3VyQnl0ZSsrXSA9IHRtcCAmIDB4RkZcbiAgfVxuXG4gIGlmIChwbGFjZUhvbGRlcnNMZW4gPT09IDEpIHtcbiAgICB0bXAgPVxuICAgICAgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpKV0gPDwgMTApIHxcbiAgICAgIChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSArIDEpXSA8PCA0KSB8XG4gICAgICAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAyKV0gPj4gMilcbiAgICBhcnJbY3VyQnl0ZSsrXSA9ICh0bXAgPj4gOCkgJiAweEZGXG4gICAgYXJyW2N1ckJ5dGUrK10gPSB0bXAgJiAweEZGXG4gIH1cblxuICByZXR1cm4gYXJyXG59XG5cbmZ1bmN0aW9uIHRyaXBsZXRUb0Jhc2U2NCAobnVtKSB7XG4gIHJldHVybiBsb29rdXBbbnVtID4+IDE4ICYgMHgzRl0gK1xuICAgIGxvb2t1cFtudW0gPj4gMTIgJiAweDNGXSArXG4gICAgbG9va3VwW251bSA+PiA2ICYgMHgzRl0gK1xuICAgIGxvb2t1cFtudW0gJiAweDNGXVxufVxuXG5mdW5jdGlvbiBlbmNvZGVDaHVuayAodWludDgsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHRtcFxuICB2YXIgb3V0cHV0ID0gW11cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpICs9IDMpIHtcbiAgICB0bXAgPVxuICAgICAgKCh1aW50OFtpXSA8PCAxNikgJiAweEZGMDAwMCkgK1xuICAgICAgKCh1aW50OFtpICsgMV0gPDwgOCkgJiAweEZGMDApICtcbiAgICAgICh1aW50OFtpICsgMl0gJiAweEZGKVxuICAgIG91dHB1dC5wdXNoKHRyaXBsZXRUb0Jhc2U2NCh0bXApKVxuICB9XG4gIHJldHVybiBvdXRwdXQuam9pbignJylcbn1cblxuZnVuY3Rpb24gZnJvbUJ5dGVBcnJheSAodWludDgpIHtcbiAgdmFyIHRtcFxuICB2YXIgbGVuID0gdWludDgubGVuZ3RoXG4gIHZhciBleHRyYUJ5dGVzID0gbGVuICUgMyAvLyBpZiB3ZSBoYXZlIDEgYnl0ZSBsZWZ0LCBwYWQgMiBieXRlc1xuICB2YXIgcGFydHMgPSBbXVxuICB2YXIgbWF4Q2h1bmtMZW5ndGggPSAxNjM4MyAvLyBtdXN0IGJlIG11bHRpcGxlIG9mIDNcblxuICAvLyBnbyB0aHJvdWdoIHRoZSBhcnJheSBldmVyeSB0aHJlZSBieXRlcywgd2UnbGwgZGVhbCB3aXRoIHRyYWlsaW5nIHN0dWZmIGxhdGVyXG4gIGZvciAodmFyIGkgPSAwLCBsZW4yID0gbGVuIC0gZXh0cmFCeXRlczsgaSA8IGxlbjI7IGkgKz0gbWF4Q2h1bmtMZW5ndGgpIHtcbiAgICBwYXJ0cy5wdXNoKGVuY29kZUNodW5rKFxuICAgICAgdWludDgsIGksIChpICsgbWF4Q2h1bmtMZW5ndGgpID4gbGVuMiA/IGxlbjIgOiAoaSArIG1heENodW5rTGVuZ3RoKVxuICAgICkpXG4gIH1cblxuICAvLyBwYWQgdGhlIGVuZCB3aXRoIHplcm9zLCBidXQgbWFrZSBzdXJlIHRvIG5vdCBmb3JnZXQgdGhlIGV4dHJhIGJ5dGVzXG4gIGlmIChleHRyYUJ5dGVzID09PSAxKSB7XG4gICAgdG1wID0gdWludDhbbGVuIC0gMV1cbiAgICBwYXJ0cy5wdXNoKFxuICAgICAgbG9va3VwW3RtcCA+PiAyXSArXG4gICAgICBsb29rdXBbKHRtcCA8PCA0KSAmIDB4M0ZdICtcbiAgICAgICc9PSdcbiAgICApXG4gIH0gZWxzZSBpZiAoZXh0cmFCeXRlcyA9PT0gMikge1xuICAgIHRtcCA9ICh1aW50OFtsZW4gLSAyXSA8PCA4KSArIHVpbnQ4W2xlbiAtIDFdXG4gICAgcGFydHMucHVzaChcbiAgICAgIGxvb2t1cFt0bXAgPj4gMTBdICtcbiAgICAgIGxvb2t1cFsodG1wID4+IDQpICYgMHgzRl0gK1xuICAgICAgbG9va3VwWyh0bXAgPDwgMikgJiAweDNGXSArXG4gICAgICAnPSdcbiAgICApXG4gIH1cblxuICByZXR1cm4gcGFydHMuam9pbignJylcbn1cbiIsInZhciBiaWdJbnQgPSAoZnVuY3Rpb24gKHVuZGVmaW5lZCkge1xyXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4gICAgdmFyIEJBU0UgPSAxZTcsXHJcbiAgICAgICAgTE9HX0JBU0UgPSA3LFxyXG4gICAgICAgIE1BWF9JTlQgPSA5MDA3MTk5MjU0NzQwOTkyLFxyXG4gICAgICAgIE1BWF9JTlRfQVJSID0gc21hbGxUb0FycmF5KE1BWF9JTlQpLFxyXG4gICAgICAgIERFRkFVTFRfQUxQSEFCRVQgPSBcIjAxMjM0NTY3ODlhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5elwiO1xyXG5cclxuICAgIHZhciBzdXBwb3J0c05hdGl2ZUJpZ0ludCA9IHR5cGVvZiBCaWdJbnQgPT09IFwiZnVuY3Rpb25cIjtcclxuXHJcbiAgICBmdW5jdGlvbiBJbnRlZ2VyKHYsIHJhZGl4LCBhbHBoYWJldCwgY2FzZVNlbnNpdGl2ZSkge1xyXG4gICAgICAgIGlmICh0eXBlb2YgdiA9PT0gXCJ1bmRlZmluZWRcIikgcmV0dXJuIEludGVnZXJbMF07XHJcbiAgICAgICAgaWYgKHR5cGVvZiByYWRpeCAhPT0gXCJ1bmRlZmluZWRcIikgcmV0dXJuICtyYWRpeCA9PT0gMTAgJiYgIWFscGhhYmV0ID8gcGFyc2VWYWx1ZSh2KSA6IHBhcnNlQmFzZSh2LCByYWRpeCwgYWxwaGFiZXQsIGNhc2VTZW5zaXRpdmUpO1xyXG4gICAgICAgIHJldHVybiBwYXJzZVZhbHVlKHYpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIEJpZ0ludGVnZXIodmFsdWUsIHNpZ24pIHtcclxuICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XHJcbiAgICAgICAgdGhpcy5zaWduID0gc2lnbjtcclxuICAgICAgICB0aGlzLmlzU21hbGwgPSBmYWxzZTtcclxuICAgIH1cclxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShJbnRlZ2VyLnByb3RvdHlwZSk7XHJcblxyXG4gICAgZnVuY3Rpb24gU21hbGxJbnRlZ2VyKHZhbHVlKSB7XHJcbiAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xyXG4gICAgICAgIHRoaXMuc2lnbiA9IHZhbHVlIDwgMDtcclxuICAgICAgICB0aGlzLmlzU21hbGwgPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgU21hbGxJbnRlZ2VyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoSW50ZWdlci5wcm90b3R5cGUpO1xyXG5cclxuICAgIGZ1bmN0aW9uIE5hdGl2ZUJpZ0ludCh2YWx1ZSkge1xyXG4gICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcclxuICAgIH1cclxuICAgIE5hdGl2ZUJpZ0ludC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEludGVnZXIucHJvdG90eXBlKTtcclxuXHJcbiAgICBmdW5jdGlvbiBpc1ByZWNpc2Uobikge1xyXG4gICAgICAgIHJldHVybiAtTUFYX0lOVCA8IG4gJiYgbiA8IE1BWF9JTlQ7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gc21hbGxUb0FycmF5KG4pIHsgLy8gRm9yIHBlcmZvcm1hbmNlIHJlYXNvbnMgZG9lc24ndCByZWZlcmVuY2UgQkFTRSwgbmVlZCB0byBjaGFuZ2UgdGhpcyBmdW5jdGlvbiBpZiBCQVNFIGNoYW5nZXNcclxuICAgICAgICBpZiAobiA8IDFlNylcclxuICAgICAgICAgICAgcmV0dXJuIFtuXTtcclxuICAgICAgICBpZiAobiA8IDFlMTQpXHJcbiAgICAgICAgICAgIHJldHVybiBbbiAlIDFlNywgTWF0aC5mbG9vcihuIC8gMWU3KV07XHJcbiAgICAgICAgcmV0dXJuIFtuICUgMWU3LCBNYXRoLmZsb29yKG4gLyAxZTcpICUgMWU3LCBNYXRoLmZsb29yKG4gLyAxZTE0KV07XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gYXJyYXlUb1NtYWxsKGFycikgeyAvLyBJZiBCQVNFIGNoYW5nZXMgdGhpcyBmdW5jdGlvbiBtYXkgbmVlZCB0byBjaGFuZ2VcclxuICAgICAgICB0cmltKGFycik7XHJcbiAgICAgICAgdmFyIGxlbmd0aCA9IGFyci5sZW5ndGg7XHJcbiAgICAgICAgaWYgKGxlbmd0aCA8IDQgJiYgY29tcGFyZUFicyhhcnIsIE1BWF9JTlRfQVJSKSA8IDApIHtcclxuICAgICAgICAgICAgc3dpdGNoIChsZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgMDogcmV0dXJuIDA7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDE6IHJldHVybiBhcnJbMF07XHJcbiAgICAgICAgICAgICAgICBjYXNlIDI6IHJldHVybiBhcnJbMF0gKyBhcnJbMV0gKiBCQVNFO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDogcmV0dXJuIGFyclswXSArIChhcnJbMV0gKyBhcnJbMl0gKiBCQVNFKSAqIEJBU0U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGFycjtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiB0cmltKHYpIHtcclxuICAgICAgICB2YXIgaSA9IHYubGVuZ3RoO1xyXG4gICAgICAgIHdoaWxlICh2Wy0taV0gPT09IDApO1xyXG4gICAgICAgIHYubGVuZ3RoID0gaSArIDE7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY3JlYXRlQXJyYXkobGVuZ3RoKSB7IC8vIGZ1bmN0aW9uIHNoYW1lbGVzc2x5IHN0b2xlbiBmcm9tIFlhZmZsZSdzIGxpYnJhcnkgaHR0cHM6Ly9naXRodWIuY29tL1lhZmZsZS9CaWdJbnRlZ2VyXHJcbiAgICAgICAgdmFyIHggPSBuZXcgQXJyYXkobGVuZ3RoKTtcclxuICAgICAgICB2YXIgaSA9IC0xO1xyXG4gICAgICAgIHdoaWxlICgrK2kgPCBsZW5ndGgpIHtcclxuICAgICAgICAgICAgeFtpXSA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB4O1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHRydW5jYXRlKG4pIHtcclxuICAgICAgICBpZiAobiA+IDApIHJldHVybiBNYXRoLmZsb29yKG4pO1xyXG4gICAgICAgIHJldHVybiBNYXRoLmNlaWwobik7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gYWRkKGEsIGIpIHsgLy8gYXNzdW1lcyBhIGFuZCBiIGFyZSBhcnJheXMgd2l0aCBhLmxlbmd0aCA+PSBiLmxlbmd0aFxyXG4gICAgICAgIHZhciBsX2EgPSBhLmxlbmd0aCxcclxuICAgICAgICAgICAgbF9iID0gYi5sZW5ndGgsXHJcbiAgICAgICAgICAgIHIgPSBuZXcgQXJyYXkobF9hKSxcclxuICAgICAgICAgICAgY2FycnkgPSAwLFxyXG4gICAgICAgICAgICBiYXNlID0gQkFTRSxcclxuICAgICAgICAgICAgc3VtLCBpO1xyXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBsX2I7IGkrKykge1xyXG4gICAgICAgICAgICBzdW0gPSBhW2ldICsgYltpXSArIGNhcnJ5O1xyXG4gICAgICAgICAgICBjYXJyeSA9IHN1bSA+PSBiYXNlID8gMSA6IDA7XHJcbiAgICAgICAgICAgIHJbaV0gPSBzdW0gLSBjYXJyeSAqIGJhc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHdoaWxlIChpIDwgbF9hKSB7XHJcbiAgICAgICAgICAgIHN1bSA9IGFbaV0gKyBjYXJyeTtcclxuICAgICAgICAgICAgY2FycnkgPSBzdW0gPT09IGJhc2UgPyAxIDogMDtcclxuICAgICAgICAgICAgcltpKytdID0gc3VtIC0gY2FycnkgKiBiYXNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY2FycnkgPiAwKSByLnB1c2goY2FycnkpO1xyXG4gICAgICAgIHJldHVybiByO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGFkZEFueShhLCBiKSB7XHJcbiAgICAgICAgaWYgKGEubGVuZ3RoID49IGIubGVuZ3RoKSByZXR1cm4gYWRkKGEsIGIpO1xyXG4gICAgICAgIHJldHVybiBhZGQoYiwgYSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gYWRkU21hbGwoYSwgY2FycnkpIHsgLy8gYXNzdW1lcyBhIGlzIGFycmF5LCBjYXJyeSBpcyBudW1iZXIgd2l0aCAwIDw9IGNhcnJ5IDwgTUFYX0lOVFxyXG4gICAgICAgIHZhciBsID0gYS5sZW5ndGgsXHJcbiAgICAgICAgICAgIHIgPSBuZXcgQXJyYXkobCksXHJcbiAgICAgICAgICAgIGJhc2UgPSBCQVNFLFxyXG4gICAgICAgICAgICBzdW0sIGk7XHJcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgICAgICBzdW0gPSBhW2ldIC0gYmFzZSArIGNhcnJ5O1xyXG4gICAgICAgICAgICBjYXJyeSA9IE1hdGguZmxvb3Ioc3VtIC8gYmFzZSk7XHJcbiAgICAgICAgICAgIHJbaV0gPSBzdW0gLSBjYXJyeSAqIGJhc2U7XHJcbiAgICAgICAgICAgIGNhcnJ5ICs9IDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHdoaWxlIChjYXJyeSA+IDApIHtcclxuICAgICAgICAgICAgcltpKytdID0gY2FycnkgJSBiYXNlO1xyXG4gICAgICAgICAgICBjYXJyeSA9IE1hdGguZmxvb3IoY2FycnkgLyBiYXNlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHI7XHJcbiAgICB9XHJcblxyXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gKHYpIHtcclxuICAgICAgICB2YXIgbiA9IHBhcnNlVmFsdWUodik7XHJcbiAgICAgICAgaWYgKHRoaXMuc2lnbiAhPT0gbi5zaWduKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnN1YnRyYWN0KG4ubmVnYXRlKCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgYSA9IHRoaXMudmFsdWUsIGIgPSBuLnZhbHVlO1xyXG4gICAgICAgIGlmIChuLmlzU21hbGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBCaWdJbnRlZ2VyKGFkZFNtYWxsKGEsIE1hdGguYWJzKGIpKSwgdGhpcy5zaWduKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCaWdJbnRlZ2VyKGFkZEFueShhLCBiKSwgdGhpcy5zaWduKTtcclxuICAgIH07XHJcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5wbHVzID0gQmlnSW50ZWdlci5wcm90b3R5cGUuYWRkO1xyXG5cclxuICAgIFNtYWxsSW50ZWdlci5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gKHYpIHtcclxuICAgICAgICB2YXIgbiA9IHBhcnNlVmFsdWUodik7XHJcbiAgICAgICAgdmFyIGEgPSB0aGlzLnZhbHVlO1xyXG4gICAgICAgIGlmIChhIDwgMCAhPT0gbi5zaWduKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnN1YnRyYWN0KG4ubmVnYXRlKCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgYiA9IG4udmFsdWU7XHJcbiAgICAgICAgaWYgKG4uaXNTbWFsbCkge1xyXG4gICAgICAgICAgICBpZiAoaXNQcmVjaXNlKGEgKyBiKSkgcmV0dXJuIG5ldyBTbWFsbEludGVnZXIoYSArIGIpO1xyXG4gICAgICAgICAgICBiID0gc21hbGxUb0FycmF5KE1hdGguYWJzKGIpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCaWdJbnRlZ2VyKGFkZFNtYWxsKGIsIE1hdGguYWJzKGEpKSwgYSA8IDApO1xyXG4gICAgfTtcclxuICAgIFNtYWxsSW50ZWdlci5wcm90b3R5cGUucGx1cyA9IFNtYWxsSW50ZWdlci5wcm90b3R5cGUuYWRkO1xyXG5cclxuICAgIE5hdGl2ZUJpZ0ludC5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gKHYpIHtcclxuICAgICAgICByZXR1cm4gbmV3IE5hdGl2ZUJpZ0ludCh0aGlzLnZhbHVlICsgcGFyc2VWYWx1ZSh2KS52YWx1ZSk7XHJcbiAgICB9XHJcbiAgICBOYXRpdmVCaWdJbnQucHJvdG90eXBlLnBsdXMgPSBOYXRpdmVCaWdJbnQucHJvdG90eXBlLmFkZDtcclxuXHJcbiAgICBmdW5jdGlvbiBzdWJ0cmFjdChhLCBiKSB7IC8vIGFzc3VtZXMgYSBhbmQgYiBhcmUgYXJyYXlzIHdpdGggYSA+PSBiXHJcbiAgICAgICAgdmFyIGFfbCA9IGEubGVuZ3RoLFxyXG4gICAgICAgICAgICBiX2wgPSBiLmxlbmd0aCxcclxuICAgICAgICAgICAgciA9IG5ldyBBcnJheShhX2wpLFxyXG4gICAgICAgICAgICBib3Jyb3cgPSAwLFxyXG4gICAgICAgICAgICBiYXNlID0gQkFTRSxcclxuICAgICAgICAgICAgaSwgZGlmZmVyZW5jZTtcclxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgYl9sOyBpKyspIHtcclxuICAgICAgICAgICAgZGlmZmVyZW5jZSA9IGFbaV0gLSBib3Jyb3cgLSBiW2ldO1xyXG4gICAgICAgICAgICBpZiAoZGlmZmVyZW5jZSA8IDApIHtcclxuICAgICAgICAgICAgICAgIGRpZmZlcmVuY2UgKz0gYmFzZTtcclxuICAgICAgICAgICAgICAgIGJvcnJvdyA9IDE7XHJcbiAgICAgICAgICAgIH0gZWxzZSBib3Jyb3cgPSAwO1xyXG4gICAgICAgICAgICByW2ldID0gZGlmZmVyZW5jZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yIChpID0gYl9sOyBpIDwgYV9sOyBpKyspIHtcclxuICAgICAgICAgICAgZGlmZmVyZW5jZSA9IGFbaV0gLSBib3Jyb3c7XHJcbiAgICAgICAgICAgIGlmIChkaWZmZXJlbmNlIDwgMCkgZGlmZmVyZW5jZSArPSBiYXNlO1xyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJbaSsrXSA9IGRpZmZlcmVuY2U7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByW2ldID0gZGlmZmVyZW5jZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yICg7IGkgPCBhX2w7IGkrKykge1xyXG4gICAgICAgICAgICByW2ldID0gYVtpXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdHJpbShyKTtcclxuICAgICAgICByZXR1cm4gcjtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBzdWJ0cmFjdEFueShhLCBiLCBzaWduKSB7XHJcbiAgICAgICAgdmFyIHZhbHVlO1xyXG4gICAgICAgIGlmIChjb21wYXJlQWJzKGEsIGIpID49IDApIHtcclxuICAgICAgICAgICAgdmFsdWUgPSBzdWJ0cmFjdChhLCBiKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB2YWx1ZSA9IHN1YnRyYWN0KGIsIGEpO1xyXG4gICAgICAgICAgICBzaWduID0gIXNpZ247XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhbHVlID0gYXJyYXlUb1NtYWxsKHZhbHVlKTtcclxuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcIm51bWJlclwiKSB7XHJcbiAgICAgICAgICAgIGlmIChzaWduKSB2YWx1ZSA9IC12YWx1ZTtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBTbWFsbEludGVnZXIodmFsdWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3IEJpZ0ludGVnZXIodmFsdWUsIHNpZ24pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHN1YnRyYWN0U21hbGwoYSwgYiwgc2lnbikgeyAvLyBhc3N1bWVzIGEgaXMgYXJyYXksIGIgaXMgbnVtYmVyIHdpdGggMCA8PSBiIDwgTUFYX0lOVFxyXG4gICAgICAgIHZhciBsID0gYS5sZW5ndGgsXHJcbiAgICAgICAgICAgIHIgPSBuZXcgQXJyYXkobCksXHJcbiAgICAgICAgICAgIGNhcnJ5ID0gLWIsXHJcbiAgICAgICAgICAgIGJhc2UgPSBCQVNFLFxyXG4gICAgICAgICAgICBpLCBkaWZmZXJlbmNlO1xyXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICAgICAgZGlmZmVyZW5jZSA9IGFbaV0gKyBjYXJyeTtcclxuICAgICAgICAgICAgY2FycnkgPSBNYXRoLmZsb29yKGRpZmZlcmVuY2UgLyBiYXNlKTtcclxuICAgICAgICAgICAgZGlmZmVyZW5jZSAlPSBiYXNlO1xyXG4gICAgICAgICAgICByW2ldID0gZGlmZmVyZW5jZSA8IDAgPyBkaWZmZXJlbmNlICsgYmFzZSA6IGRpZmZlcmVuY2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHIgPSBhcnJheVRvU21hbGwocik7XHJcbiAgICAgICAgaWYgKHR5cGVvZiByID09PSBcIm51bWJlclwiKSB7XHJcbiAgICAgICAgICAgIGlmIChzaWduKSByID0gLXI7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgU21hbGxJbnRlZ2VyKHIpO1xyXG4gICAgICAgIH0gcmV0dXJuIG5ldyBCaWdJbnRlZ2VyKHIsIHNpZ24pO1xyXG4gICAgfVxyXG5cclxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLnN1YnRyYWN0ID0gZnVuY3Rpb24gKHYpIHtcclxuICAgICAgICB2YXIgbiA9IHBhcnNlVmFsdWUodik7XHJcbiAgICAgICAgaWYgKHRoaXMuc2lnbiAhPT0gbi5zaWduKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFkZChuLm5lZ2F0ZSgpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGEgPSB0aGlzLnZhbHVlLCBiID0gbi52YWx1ZTtcclxuICAgICAgICBpZiAobi5pc1NtYWxsKVxyXG4gICAgICAgICAgICByZXR1cm4gc3VidHJhY3RTbWFsbChhLCBNYXRoLmFicyhiKSwgdGhpcy5zaWduKTtcclxuICAgICAgICByZXR1cm4gc3VidHJhY3RBbnkoYSwgYiwgdGhpcy5zaWduKTtcclxuICAgIH07XHJcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5taW51cyA9IEJpZ0ludGVnZXIucHJvdG90eXBlLnN1YnRyYWN0O1xyXG5cclxuICAgIFNtYWxsSW50ZWdlci5wcm90b3R5cGUuc3VidHJhY3QgPSBmdW5jdGlvbiAodikge1xyXG4gICAgICAgIHZhciBuID0gcGFyc2VWYWx1ZSh2KTtcclxuICAgICAgICB2YXIgYSA9IHRoaXMudmFsdWU7XHJcbiAgICAgICAgaWYgKGEgPCAwICE9PSBuLnNpZ24pIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYWRkKG4ubmVnYXRlKCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgYiA9IG4udmFsdWU7XHJcbiAgICAgICAgaWYgKG4uaXNTbWFsbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFNtYWxsSW50ZWdlcihhIC0gYik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzdWJ0cmFjdFNtYWxsKGIsIE1hdGguYWJzKGEpLCBhID49IDApO1xyXG4gICAgfTtcclxuICAgIFNtYWxsSW50ZWdlci5wcm90b3R5cGUubWludXMgPSBTbWFsbEludGVnZXIucHJvdG90eXBlLnN1YnRyYWN0O1xyXG5cclxuICAgIE5hdGl2ZUJpZ0ludC5wcm90b3R5cGUuc3VidHJhY3QgPSBmdW5jdGlvbiAodikge1xyXG4gICAgICAgIHJldHVybiBuZXcgTmF0aXZlQmlnSW50KHRoaXMudmFsdWUgLSBwYXJzZVZhbHVlKHYpLnZhbHVlKTtcclxuICAgIH1cclxuICAgIE5hdGl2ZUJpZ0ludC5wcm90b3R5cGUubWludXMgPSBOYXRpdmVCaWdJbnQucHJvdG90eXBlLnN1YnRyYWN0O1xyXG5cclxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLm5lZ2F0ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gbmV3IEJpZ0ludGVnZXIodGhpcy52YWx1ZSwgIXRoaXMuc2lnbik7XHJcbiAgICB9O1xyXG4gICAgU21hbGxJbnRlZ2VyLnByb3RvdHlwZS5uZWdhdGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHNpZ24gPSB0aGlzLnNpZ247XHJcbiAgICAgICAgdmFyIHNtYWxsID0gbmV3IFNtYWxsSW50ZWdlcigtdGhpcy52YWx1ZSk7XHJcbiAgICAgICAgc21hbGwuc2lnbiA9ICFzaWduO1xyXG4gICAgICAgIHJldHVybiBzbWFsbDtcclxuICAgIH07XHJcbiAgICBOYXRpdmVCaWdJbnQucHJvdG90eXBlLm5lZ2F0ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gbmV3IE5hdGl2ZUJpZ0ludCgtdGhpcy52YWx1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuYWJzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgQmlnSW50ZWdlcih0aGlzLnZhbHVlLCBmYWxzZSk7XHJcbiAgICB9O1xyXG4gICAgU21hbGxJbnRlZ2VyLnByb3RvdHlwZS5hYnMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBTbWFsbEludGVnZXIoTWF0aC5hYnModGhpcy52YWx1ZSkpO1xyXG4gICAgfTtcclxuICAgIE5hdGl2ZUJpZ0ludC5wcm90b3R5cGUuYWJzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgTmF0aXZlQmlnSW50KHRoaXMudmFsdWUgPj0gMCA/IHRoaXMudmFsdWUgOiAtdGhpcy52YWx1ZSk7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIGZ1bmN0aW9uIG11bHRpcGx5TG9uZyhhLCBiKSB7XHJcbiAgICAgICAgdmFyIGFfbCA9IGEubGVuZ3RoLFxyXG4gICAgICAgICAgICBiX2wgPSBiLmxlbmd0aCxcclxuICAgICAgICAgICAgbCA9IGFfbCArIGJfbCxcclxuICAgICAgICAgICAgciA9IGNyZWF0ZUFycmF5KGwpLFxyXG4gICAgICAgICAgICBiYXNlID0gQkFTRSxcclxuICAgICAgICAgICAgcHJvZHVjdCwgY2FycnksIGksIGFfaSwgYl9qO1xyXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBhX2w7ICsraSkge1xyXG4gICAgICAgICAgICBhX2kgPSBhW2ldO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGJfbDsgKytqKSB7XHJcbiAgICAgICAgICAgICAgICBiX2ogPSBiW2pdO1xyXG4gICAgICAgICAgICAgICAgcHJvZHVjdCA9IGFfaSAqIGJfaiArIHJbaSArIGpdO1xyXG4gICAgICAgICAgICAgICAgY2FycnkgPSBNYXRoLmZsb29yKHByb2R1Y3QgLyBiYXNlKTtcclxuICAgICAgICAgICAgICAgIHJbaSArIGpdID0gcHJvZHVjdCAtIGNhcnJ5ICogYmFzZTtcclxuICAgICAgICAgICAgICAgIHJbaSArIGogKyAxXSArPSBjYXJyeTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0cmltKHIpO1xyXG4gICAgICAgIHJldHVybiByO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIG11bHRpcGx5U21hbGwoYSwgYikgeyAvLyBhc3N1bWVzIGEgaXMgYXJyYXksIGIgaXMgbnVtYmVyIHdpdGggfGJ8IDwgQkFTRVxyXG4gICAgICAgIHZhciBsID0gYS5sZW5ndGgsXHJcbiAgICAgICAgICAgIHIgPSBuZXcgQXJyYXkobCksXHJcbiAgICAgICAgICAgIGJhc2UgPSBCQVNFLFxyXG4gICAgICAgICAgICBjYXJyeSA9IDAsXHJcbiAgICAgICAgICAgIHByb2R1Y3QsIGk7XHJcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgICAgICBwcm9kdWN0ID0gYVtpXSAqIGIgKyBjYXJyeTtcclxuICAgICAgICAgICAgY2FycnkgPSBNYXRoLmZsb29yKHByb2R1Y3QgLyBiYXNlKTtcclxuICAgICAgICAgICAgcltpXSA9IHByb2R1Y3QgLSBjYXJyeSAqIGJhc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHdoaWxlIChjYXJyeSA+IDApIHtcclxuICAgICAgICAgICAgcltpKytdID0gY2FycnkgJSBiYXNlO1xyXG4gICAgICAgICAgICBjYXJyeSA9IE1hdGguZmxvb3IoY2FycnkgLyBiYXNlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHI7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gc2hpZnRMZWZ0KHgsIG4pIHtcclxuICAgICAgICB2YXIgciA9IFtdO1xyXG4gICAgICAgIHdoaWxlIChuLS0gPiAwKSByLnB1c2goMCk7XHJcbiAgICAgICAgcmV0dXJuIHIuY29uY2F0KHgpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIG11bHRpcGx5S2FyYXRzdWJhKHgsIHkpIHtcclxuICAgICAgICB2YXIgbiA9IE1hdGgubWF4KHgubGVuZ3RoLCB5Lmxlbmd0aCk7XHJcblxyXG4gICAgICAgIGlmIChuIDw9IDMwKSByZXR1cm4gbXVsdGlwbHlMb25nKHgsIHkpO1xyXG4gICAgICAgIG4gPSBNYXRoLmNlaWwobiAvIDIpO1xyXG5cclxuICAgICAgICB2YXIgYiA9IHguc2xpY2UobiksXHJcbiAgICAgICAgICAgIGEgPSB4LnNsaWNlKDAsIG4pLFxyXG4gICAgICAgICAgICBkID0geS5zbGljZShuKSxcclxuICAgICAgICAgICAgYyA9IHkuc2xpY2UoMCwgbik7XHJcblxyXG4gICAgICAgIHZhciBhYyA9IG11bHRpcGx5S2FyYXRzdWJhKGEsIGMpLFxyXG4gICAgICAgICAgICBiZCA9IG11bHRpcGx5S2FyYXRzdWJhKGIsIGQpLFxyXG4gICAgICAgICAgICBhYmNkID0gbXVsdGlwbHlLYXJhdHN1YmEoYWRkQW55KGEsIGIpLCBhZGRBbnkoYywgZCkpO1xyXG5cclxuICAgICAgICB2YXIgcHJvZHVjdCA9IGFkZEFueShhZGRBbnkoYWMsIHNoaWZ0TGVmdChzdWJ0cmFjdChzdWJ0cmFjdChhYmNkLCBhYyksIGJkKSwgbikpLCBzaGlmdExlZnQoYmQsIDIgKiBuKSk7XHJcbiAgICAgICAgdHJpbShwcm9kdWN0KTtcclxuICAgICAgICByZXR1cm4gcHJvZHVjdDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBUaGUgZm9sbG93aW5nIGZ1bmN0aW9uIGlzIGRlcml2ZWQgZnJvbSBhIHN1cmZhY2UgZml0IG9mIGEgZ3JhcGggcGxvdHRpbmcgdGhlIHBlcmZvcm1hbmNlIGRpZmZlcmVuY2VcclxuICAgIC8vIGJldHdlZW4gbG9uZyBtdWx0aXBsaWNhdGlvbiBhbmQga2FyYXRzdWJhIG11bHRpcGxpY2F0aW9uIHZlcnN1cyB0aGUgbGVuZ3RocyBvZiB0aGUgdHdvIGFycmF5cy5cclxuICAgIGZ1bmN0aW9uIHVzZUthcmF0c3ViYShsMSwgbDIpIHtcclxuICAgICAgICByZXR1cm4gLTAuMDEyICogbDEgLSAwLjAxMiAqIGwyICsgMC4wMDAwMTUgKiBsMSAqIGwyID4gMDtcclxuICAgIH1cclxuXHJcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5tdWx0aXBseSA9IGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgdmFyIG4gPSBwYXJzZVZhbHVlKHYpLFxyXG4gICAgICAgICAgICBhID0gdGhpcy52YWx1ZSwgYiA9IG4udmFsdWUsXHJcbiAgICAgICAgICAgIHNpZ24gPSB0aGlzLnNpZ24gIT09IG4uc2lnbixcclxuICAgICAgICAgICAgYWJzO1xyXG4gICAgICAgIGlmIChuLmlzU21hbGwpIHtcclxuICAgICAgICAgICAgaWYgKGIgPT09IDApIHJldHVybiBJbnRlZ2VyWzBdO1xyXG4gICAgICAgICAgICBpZiAoYiA9PT0gMSkgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgICAgIGlmIChiID09PSAtMSkgcmV0dXJuIHRoaXMubmVnYXRlKCk7XHJcbiAgICAgICAgICAgIGFicyA9IE1hdGguYWJzKGIpO1xyXG4gICAgICAgICAgICBpZiAoYWJzIDwgQkFTRSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBCaWdJbnRlZ2VyKG11bHRpcGx5U21hbGwoYSwgYWJzKSwgc2lnbik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYiA9IHNtYWxsVG9BcnJheShhYnMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodXNlS2FyYXRzdWJhKGEubGVuZ3RoLCBiLmxlbmd0aCkpIC8vIEthcmF0c3ViYSBpcyBvbmx5IGZhc3RlciBmb3IgY2VydGFpbiBhcnJheSBzaXplc1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEJpZ0ludGVnZXIobXVsdGlwbHlLYXJhdHN1YmEoYSwgYiksIHNpZ24pO1xyXG4gICAgICAgIHJldHVybiBuZXcgQmlnSW50ZWdlcihtdWx0aXBseUxvbmcoYSwgYiksIHNpZ24pO1xyXG4gICAgfTtcclxuXHJcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS50aW1lcyA9IEJpZ0ludGVnZXIucHJvdG90eXBlLm11bHRpcGx5O1xyXG5cclxuICAgIGZ1bmN0aW9uIG11bHRpcGx5U21hbGxBbmRBcnJheShhLCBiLCBzaWduKSB7IC8vIGEgPj0gMFxyXG4gICAgICAgIGlmIChhIDwgQkFTRSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEJpZ0ludGVnZXIobXVsdGlwbHlTbWFsbChiLCBhKSwgc2lnbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXcgQmlnSW50ZWdlcihtdWx0aXBseUxvbmcoYiwgc21hbGxUb0FycmF5KGEpKSwgc2lnbik7XHJcbiAgICB9XHJcbiAgICBTbWFsbEludGVnZXIucHJvdG90eXBlLl9tdWx0aXBseUJ5U21hbGwgPSBmdW5jdGlvbiAoYSkge1xyXG4gICAgICAgIGlmIChpc1ByZWNpc2UoYS52YWx1ZSAqIHRoaXMudmFsdWUpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgU21hbGxJbnRlZ2VyKGEudmFsdWUgKiB0aGlzLnZhbHVlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG11bHRpcGx5U21hbGxBbmRBcnJheShNYXRoLmFicyhhLnZhbHVlKSwgc21hbGxUb0FycmF5KE1hdGguYWJzKHRoaXMudmFsdWUpKSwgdGhpcy5zaWduICE9PSBhLnNpZ24pO1xyXG4gICAgfTtcclxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLl9tdWx0aXBseUJ5U21hbGwgPSBmdW5jdGlvbiAoYSkge1xyXG4gICAgICAgIGlmIChhLnZhbHVlID09PSAwKSByZXR1cm4gSW50ZWdlclswXTtcclxuICAgICAgICBpZiAoYS52YWx1ZSA9PT0gMSkgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgaWYgKGEudmFsdWUgPT09IC0xKSByZXR1cm4gdGhpcy5uZWdhdGUoKTtcclxuICAgICAgICByZXR1cm4gbXVsdGlwbHlTbWFsbEFuZEFycmF5KE1hdGguYWJzKGEudmFsdWUpLCB0aGlzLnZhbHVlLCB0aGlzLnNpZ24gIT09IGEuc2lnbik7XHJcbiAgICB9O1xyXG4gICAgU21hbGxJbnRlZ2VyLnByb3RvdHlwZS5tdWx0aXBseSA9IGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgcmV0dXJuIHBhcnNlVmFsdWUodikuX211bHRpcGx5QnlTbWFsbCh0aGlzKTtcclxuICAgIH07XHJcbiAgICBTbWFsbEludGVnZXIucHJvdG90eXBlLnRpbWVzID0gU21hbGxJbnRlZ2VyLnByb3RvdHlwZS5tdWx0aXBseTtcclxuXHJcbiAgICBOYXRpdmVCaWdJbnQucHJvdG90eXBlLm11bHRpcGx5ID0gZnVuY3Rpb24gKHYpIHtcclxuICAgICAgICByZXR1cm4gbmV3IE5hdGl2ZUJpZ0ludCh0aGlzLnZhbHVlICogcGFyc2VWYWx1ZSh2KS52YWx1ZSk7XHJcbiAgICB9XHJcbiAgICBOYXRpdmVCaWdJbnQucHJvdG90eXBlLnRpbWVzID0gTmF0aXZlQmlnSW50LnByb3RvdHlwZS5tdWx0aXBseTtcclxuXHJcbiAgICBmdW5jdGlvbiBzcXVhcmUoYSkge1xyXG4gICAgICAgIC8vY29uc29sZS5hc3NlcnQoMiAqIEJBU0UgKiBCQVNFIDwgTUFYX0lOVCk7XHJcbiAgICAgICAgdmFyIGwgPSBhLmxlbmd0aCxcclxuICAgICAgICAgICAgciA9IGNyZWF0ZUFycmF5KGwgKyBsKSxcclxuICAgICAgICAgICAgYmFzZSA9IEJBU0UsXHJcbiAgICAgICAgICAgIHByb2R1Y3QsIGNhcnJ5LCBpLCBhX2ksIGFfajtcclxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGFfaSA9IGFbaV07XHJcbiAgICAgICAgICAgIGNhcnJ5ID0gMCAtIGFfaSAqIGFfaTtcclxuICAgICAgICAgICAgZm9yICh2YXIgaiA9IGk7IGogPCBsOyBqKyspIHtcclxuICAgICAgICAgICAgICAgIGFfaiA9IGFbal07XHJcbiAgICAgICAgICAgICAgICBwcm9kdWN0ID0gMiAqIChhX2kgKiBhX2opICsgcltpICsgal0gKyBjYXJyeTtcclxuICAgICAgICAgICAgICAgIGNhcnJ5ID0gTWF0aC5mbG9vcihwcm9kdWN0IC8gYmFzZSk7XHJcbiAgICAgICAgICAgICAgICByW2kgKyBqXSA9IHByb2R1Y3QgLSBjYXJyeSAqIGJhc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcltpICsgbF0gPSBjYXJyeTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdHJpbShyKTtcclxuICAgICAgICByZXR1cm4gcjtcclxuICAgIH1cclxuXHJcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5zcXVhcmUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCaWdJbnRlZ2VyKHNxdWFyZSh0aGlzLnZhbHVlKSwgZmFsc2UpO1xyXG4gICAgfTtcclxuXHJcbiAgICBTbWFsbEludGVnZXIucHJvdG90eXBlLnNxdWFyZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgdmFsdWUgPSB0aGlzLnZhbHVlICogdGhpcy52YWx1ZTtcclxuICAgICAgICBpZiAoaXNQcmVjaXNlKHZhbHVlKSkgcmV0dXJuIG5ldyBTbWFsbEludGVnZXIodmFsdWUpO1xyXG4gICAgICAgIHJldHVybiBuZXcgQmlnSW50ZWdlcihzcXVhcmUoc21hbGxUb0FycmF5KE1hdGguYWJzKHRoaXMudmFsdWUpKSksIGZhbHNlKTtcclxuICAgIH07XHJcblxyXG4gICAgTmF0aXZlQmlnSW50LnByb3RvdHlwZS5zcXVhcmUgPSBmdW5jdGlvbiAodikge1xyXG4gICAgICAgIHJldHVybiBuZXcgTmF0aXZlQmlnSW50KHRoaXMudmFsdWUgKiB0aGlzLnZhbHVlKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBkaXZNb2QxKGEsIGIpIHsgLy8gTGVmdCBvdmVyIGZyb20gcHJldmlvdXMgdmVyc2lvbi4gUGVyZm9ybXMgZmFzdGVyIHRoYW4gZGl2TW9kMiBvbiBzbWFsbGVyIGlucHV0IHNpemVzLlxyXG4gICAgICAgIHZhciBhX2wgPSBhLmxlbmd0aCxcclxuICAgICAgICAgICAgYl9sID0gYi5sZW5ndGgsXHJcbiAgICAgICAgICAgIGJhc2UgPSBCQVNFLFxyXG4gICAgICAgICAgICByZXN1bHQgPSBjcmVhdGVBcnJheShiLmxlbmd0aCksXHJcbiAgICAgICAgICAgIGRpdmlzb3JNb3N0U2lnbmlmaWNhbnREaWdpdCA9IGJbYl9sIC0gMV0sXHJcbiAgICAgICAgICAgIC8vIG5vcm1hbGl6YXRpb25cclxuICAgICAgICAgICAgbGFtYmRhID0gTWF0aC5jZWlsKGJhc2UgLyAoMiAqIGRpdmlzb3JNb3N0U2lnbmlmaWNhbnREaWdpdCkpLFxyXG4gICAgICAgICAgICByZW1haW5kZXIgPSBtdWx0aXBseVNtYWxsKGEsIGxhbWJkYSksXHJcbiAgICAgICAgICAgIGRpdmlzb3IgPSBtdWx0aXBseVNtYWxsKGIsIGxhbWJkYSksXHJcbiAgICAgICAgICAgIHF1b3RpZW50RGlnaXQsIHNoaWZ0LCBjYXJyeSwgYm9ycm93LCBpLCBsLCBxO1xyXG4gICAgICAgIGlmIChyZW1haW5kZXIubGVuZ3RoIDw9IGFfbCkgcmVtYWluZGVyLnB1c2goMCk7XHJcbiAgICAgICAgZGl2aXNvci5wdXNoKDApO1xyXG4gICAgICAgIGRpdmlzb3JNb3N0U2lnbmlmaWNhbnREaWdpdCA9IGRpdmlzb3JbYl9sIC0gMV07XHJcbiAgICAgICAgZm9yIChzaGlmdCA9IGFfbCAtIGJfbDsgc2hpZnQgPj0gMDsgc2hpZnQtLSkge1xyXG4gICAgICAgICAgICBxdW90aWVudERpZ2l0ID0gYmFzZSAtIDE7XHJcbiAgICAgICAgICAgIGlmIChyZW1haW5kZXJbc2hpZnQgKyBiX2xdICE9PSBkaXZpc29yTW9zdFNpZ25pZmljYW50RGlnaXQpIHtcclxuICAgICAgICAgICAgICAgIHF1b3RpZW50RGlnaXQgPSBNYXRoLmZsb29yKChyZW1haW5kZXJbc2hpZnQgKyBiX2xdICogYmFzZSArIHJlbWFpbmRlcltzaGlmdCArIGJfbCAtIDFdKSAvIGRpdmlzb3JNb3N0U2lnbmlmaWNhbnREaWdpdCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gcXVvdGllbnREaWdpdCA8PSBiYXNlIC0gMVxyXG4gICAgICAgICAgICBjYXJyeSA9IDA7XHJcbiAgICAgICAgICAgIGJvcnJvdyA9IDA7XHJcbiAgICAgICAgICAgIGwgPSBkaXZpc29yLmxlbmd0aDtcclxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgY2FycnkgKz0gcXVvdGllbnREaWdpdCAqIGRpdmlzb3JbaV07XHJcbiAgICAgICAgICAgICAgICBxID0gTWF0aC5mbG9vcihjYXJyeSAvIGJhc2UpO1xyXG4gICAgICAgICAgICAgICAgYm9ycm93ICs9IHJlbWFpbmRlcltzaGlmdCArIGldIC0gKGNhcnJ5IC0gcSAqIGJhc2UpO1xyXG4gICAgICAgICAgICAgICAgY2FycnkgPSBxO1xyXG4gICAgICAgICAgICAgICAgaWYgKGJvcnJvdyA8IDApIHtcclxuICAgICAgICAgICAgICAgICAgICByZW1haW5kZXJbc2hpZnQgKyBpXSA9IGJvcnJvdyArIGJhc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgYm9ycm93ID0gLTE7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlbWFpbmRlcltzaGlmdCArIGldID0gYm9ycm93O1xyXG4gICAgICAgICAgICAgICAgICAgIGJvcnJvdyA9IDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgd2hpbGUgKGJvcnJvdyAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgcXVvdGllbnREaWdpdCAtPSAxO1xyXG4gICAgICAgICAgICAgICAgY2FycnkgPSAwO1xyXG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhcnJ5ICs9IHJlbWFpbmRlcltzaGlmdCArIGldIC0gYmFzZSArIGRpdmlzb3JbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNhcnJ5IDwgMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZW1haW5kZXJbc2hpZnQgKyBpXSA9IGNhcnJ5ICsgYmFzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FycnkgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbWFpbmRlcltzaGlmdCArIGldID0gY2Fycnk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhcnJ5ID0gMTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBib3Jyb3cgKz0gY2Fycnk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmVzdWx0W3NoaWZ0XSA9IHF1b3RpZW50RGlnaXQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGRlbm9ybWFsaXphdGlvblxyXG4gICAgICAgIHJlbWFpbmRlciA9IGRpdk1vZFNtYWxsKHJlbWFpbmRlciwgbGFtYmRhKVswXTtcclxuICAgICAgICByZXR1cm4gW2FycmF5VG9TbWFsbChyZXN1bHQpLCBhcnJheVRvU21hbGwocmVtYWluZGVyKV07XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZGl2TW9kMihhLCBiKSB7IC8vIEltcGxlbWVudGF0aW9uIGlkZWEgc2hhbWVsZXNzbHkgc3RvbGVuIGZyb20gU2lsZW50IE1hdHQncyBsaWJyYXJ5IGh0dHA6Ly9zaWxlbnRtYXR0LmNvbS9iaWdpbnRlZ2VyL1xyXG4gICAgICAgIC8vIFBlcmZvcm1zIGZhc3RlciB0aGFuIGRpdk1vZDEgb24gbGFyZ2VyIGlucHV0IHNpemVzLlxyXG4gICAgICAgIHZhciBhX2wgPSBhLmxlbmd0aCxcclxuICAgICAgICAgICAgYl9sID0gYi5sZW5ndGgsXHJcbiAgICAgICAgICAgIHJlc3VsdCA9IFtdLFxyXG4gICAgICAgICAgICBwYXJ0ID0gW10sXHJcbiAgICAgICAgICAgIGJhc2UgPSBCQVNFLFxyXG4gICAgICAgICAgICBndWVzcywgeGxlbiwgaGlnaHgsIGhpZ2h5LCBjaGVjaztcclxuICAgICAgICB3aGlsZSAoYV9sKSB7XHJcbiAgICAgICAgICAgIHBhcnQudW5zaGlmdChhWy0tYV9sXSk7XHJcbiAgICAgICAgICAgIHRyaW0ocGFydCk7XHJcbiAgICAgICAgICAgIGlmIChjb21wYXJlQWJzKHBhcnQsIGIpIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goMCk7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB4bGVuID0gcGFydC5sZW5ndGg7XHJcbiAgICAgICAgICAgIGhpZ2h4ID0gcGFydFt4bGVuIC0gMV0gKiBiYXNlICsgcGFydFt4bGVuIC0gMl07XHJcbiAgICAgICAgICAgIGhpZ2h5ID0gYltiX2wgLSAxXSAqIGJhc2UgKyBiW2JfbCAtIDJdO1xyXG4gICAgICAgICAgICBpZiAoeGxlbiA+IGJfbCkge1xyXG4gICAgICAgICAgICAgICAgaGlnaHggPSAoaGlnaHggKyAxKSAqIGJhc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZ3Vlc3MgPSBNYXRoLmNlaWwoaGlnaHggLyBoaWdoeSk7XHJcbiAgICAgICAgICAgIGRvIHtcclxuICAgICAgICAgICAgICAgIGNoZWNrID0gbXVsdGlwbHlTbWFsbChiLCBndWVzcyk7XHJcbiAgICAgICAgICAgICAgICBpZiAoY29tcGFyZUFicyhjaGVjaywgcGFydCkgPD0gMCkgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBndWVzcy0tO1xyXG4gICAgICAgICAgICB9IHdoaWxlIChndWVzcyk7XHJcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKGd1ZXNzKTtcclxuICAgICAgICAgICAgcGFydCA9IHN1YnRyYWN0KHBhcnQsIGNoZWNrKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmVzdWx0LnJldmVyc2UoKTtcclxuICAgICAgICByZXR1cm4gW2FycmF5VG9TbWFsbChyZXN1bHQpLCBhcnJheVRvU21hbGwocGFydCldO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGRpdk1vZFNtYWxsKHZhbHVlLCBsYW1iZGEpIHtcclxuICAgICAgICB2YXIgbGVuZ3RoID0gdmFsdWUubGVuZ3RoLFxyXG4gICAgICAgICAgICBxdW90aWVudCA9IGNyZWF0ZUFycmF5KGxlbmd0aCksXHJcbiAgICAgICAgICAgIGJhc2UgPSBCQVNFLFxyXG4gICAgICAgICAgICBpLCBxLCByZW1haW5kZXIsIGRpdmlzb3I7XHJcbiAgICAgICAgcmVtYWluZGVyID0gMDtcclxuICAgICAgICBmb3IgKGkgPSBsZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xyXG4gICAgICAgICAgICBkaXZpc29yID0gcmVtYWluZGVyICogYmFzZSArIHZhbHVlW2ldO1xyXG4gICAgICAgICAgICBxID0gdHJ1bmNhdGUoZGl2aXNvciAvIGxhbWJkYSk7XHJcbiAgICAgICAgICAgIHJlbWFpbmRlciA9IGRpdmlzb3IgLSBxICogbGFtYmRhO1xyXG4gICAgICAgICAgICBxdW90aWVudFtpXSA9IHEgfCAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gW3F1b3RpZW50LCByZW1haW5kZXIgfCAwXTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBkaXZNb2RBbnkoc2VsZiwgdikge1xyXG4gICAgICAgIHZhciB2YWx1ZSwgbiA9IHBhcnNlVmFsdWUodik7XHJcbiAgICAgICAgaWYgKHN1cHBvcnRzTmF0aXZlQmlnSW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBbbmV3IE5hdGl2ZUJpZ0ludChzZWxmLnZhbHVlIC8gbi52YWx1ZSksIG5ldyBOYXRpdmVCaWdJbnQoc2VsZi52YWx1ZSAlIG4udmFsdWUpXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGEgPSBzZWxmLnZhbHVlLCBiID0gbi52YWx1ZTtcclxuICAgICAgICB2YXIgcXVvdGllbnQ7XHJcbiAgICAgICAgaWYgKGIgPT09IDApIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBkaXZpZGUgYnkgemVyb1wiKTtcclxuICAgICAgICBpZiAoc2VsZi5pc1NtYWxsKSB7XHJcbiAgICAgICAgICAgIGlmIChuLmlzU21hbGwpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBbbmV3IFNtYWxsSW50ZWdlcih0cnVuY2F0ZShhIC8gYikpLCBuZXcgU21hbGxJbnRlZ2VyKGEgJSBiKV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIFtJbnRlZ2VyWzBdLCBzZWxmXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG4uaXNTbWFsbCkge1xyXG4gICAgICAgICAgICBpZiAoYiA9PT0gMSkgcmV0dXJuIFtzZWxmLCBJbnRlZ2VyWzBdXTtcclxuICAgICAgICAgICAgaWYgKGIgPT0gLTEpIHJldHVybiBbc2VsZi5uZWdhdGUoKSwgSW50ZWdlclswXV07XHJcbiAgICAgICAgICAgIHZhciBhYnMgPSBNYXRoLmFicyhiKTtcclxuICAgICAgICAgICAgaWYgKGFicyA8IEJBU0UpIHtcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gZGl2TW9kU21hbGwoYSwgYWJzKTtcclxuICAgICAgICAgICAgICAgIHF1b3RpZW50ID0gYXJyYXlUb1NtYWxsKHZhbHVlWzBdKTtcclxuICAgICAgICAgICAgICAgIHZhciByZW1haW5kZXIgPSB2YWx1ZVsxXTtcclxuICAgICAgICAgICAgICAgIGlmIChzZWxmLnNpZ24pIHJlbWFpbmRlciA9IC1yZW1haW5kZXI7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHF1b3RpZW50ID09PSBcIm51bWJlclwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGYuc2lnbiAhPT0gbi5zaWduKSBxdW90aWVudCA9IC1xdW90aWVudDtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gW25ldyBTbWFsbEludGVnZXIocXVvdGllbnQpLCBuZXcgU21hbGxJbnRlZ2VyKHJlbWFpbmRlcildO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFtuZXcgQmlnSW50ZWdlcihxdW90aWVudCwgc2VsZi5zaWduICE9PSBuLnNpZ24pLCBuZXcgU21hbGxJbnRlZ2VyKHJlbWFpbmRlcildO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGIgPSBzbWFsbFRvQXJyYXkoYWJzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGNvbXBhcmlzb24gPSBjb21wYXJlQWJzKGEsIGIpO1xyXG4gICAgICAgIGlmIChjb21wYXJpc29uID09PSAtMSkgcmV0dXJuIFtJbnRlZ2VyWzBdLCBzZWxmXTtcclxuICAgICAgICBpZiAoY29tcGFyaXNvbiA9PT0gMCkgcmV0dXJuIFtJbnRlZ2VyW3NlbGYuc2lnbiA9PT0gbi5zaWduID8gMSA6IC0xXSwgSW50ZWdlclswXV07XHJcblxyXG4gICAgICAgIC8vIGRpdk1vZDEgaXMgZmFzdGVyIG9uIHNtYWxsZXIgaW5wdXQgc2l6ZXNcclxuICAgICAgICBpZiAoYS5sZW5ndGggKyBiLmxlbmd0aCA8PSAyMDApXHJcbiAgICAgICAgICAgIHZhbHVlID0gZGl2TW9kMShhLCBiKTtcclxuICAgICAgICBlbHNlIHZhbHVlID0gZGl2TW9kMihhLCBiKTtcclxuXHJcbiAgICAgICAgcXVvdGllbnQgPSB2YWx1ZVswXTtcclxuICAgICAgICB2YXIgcVNpZ24gPSBzZWxmLnNpZ24gIT09IG4uc2lnbixcclxuICAgICAgICAgICAgbW9kID0gdmFsdWVbMV0sXHJcbiAgICAgICAgICAgIG1TaWduID0gc2VsZi5zaWduO1xyXG4gICAgICAgIGlmICh0eXBlb2YgcXVvdGllbnQgPT09IFwibnVtYmVyXCIpIHtcclxuICAgICAgICAgICAgaWYgKHFTaWduKSBxdW90aWVudCA9IC1xdW90aWVudDtcclxuICAgICAgICAgICAgcXVvdGllbnQgPSBuZXcgU21hbGxJbnRlZ2VyKHF1b3RpZW50KTtcclxuICAgICAgICB9IGVsc2UgcXVvdGllbnQgPSBuZXcgQmlnSW50ZWdlcihxdW90aWVudCwgcVNpZ24pO1xyXG4gICAgICAgIGlmICh0eXBlb2YgbW9kID09PSBcIm51bWJlclwiKSB7XHJcbiAgICAgICAgICAgIGlmIChtU2lnbikgbW9kID0gLW1vZDtcclxuICAgICAgICAgICAgbW9kID0gbmV3IFNtYWxsSW50ZWdlcihtb2QpO1xyXG4gICAgICAgIH0gZWxzZSBtb2QgPSBuZXcgQmlnSW50ZWdlcihtb2QsIG1TaWduKTtcclxuICAgICAgICByZXR1cm4gW3F1b3RpZW50LCBtb2RdO1xyXG4gICAgfVxyXG5cclxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmRpdm1vZCA9IGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IGRpdk1vZEFueSh0aGlzLCB2KTtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBxdW90aWVudDogcmVzdWx0WzBdLFxyXG4gICAgICAgICAgICByZW1haW5kZXI6IHJlc3VsdFsxXVxyXG4gICAgICAgIH07XHJcbiAgICB9O1xyXG4gICAgTmF0aXZlQmlnSW50LnByb3RvdHlwZS5kaXZtb2QgPSBTbWFsbEludGVnZXIucHJvdG90eXBlLmRpdm1vZCA9IEJpZ0ludGVnZXIucHJvdG90eXBlLmRpdm1vZDtcclxuXHJcblxyXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuZGl2aWRlID0gZnVuY3Rpb24gKHYpIHtcclxuICAgICAgICByZXR1cm4gZGl2TW9kQW55KHRoaXMsIHYpWzBdO1xyXG4gICAgfTtcclxuICAgIE5hdGl2ZUJpZ0ludC5wcm90b3R5cGUub3ZlciA9IE5hdGl2ZUJpZ0ludC5wcm90b3R5cGUuZGl2aWRlID0gZnVuY3Rpb24gKHYpIHtcclxuICAgICAgICByZXR1cm4gbmV3IE5hdGl2ZUJpZ0ludCh0aGlzLnZhbHVlIC8gcGFyc2VWYWx1ZSh2KS52YWx1ZSk7XHJcbiAgICB9O1xyXG4gICAgU21hbGxJbnRlZ2VyLnByb3RvdHlwZS5vdmVyID0gU21hbGxJbnRlZ2VyLnByb3RvdHlwZS5kaXZpZGUgPSBCaWdJbnRlZ2VyLnByb3RvdHlwZS5vdmVyID0gQmlnSW50ZWdlci5wcm90b3R5cGUuZGl2aWRlO1xyXG5cclxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLm1vZCA9IGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgcmV0dXJuIGRpdk1vZEFueSh0aGlzLCB2KVsxXTtcclxuICAgIH07XHJcbiAgICBOYXRpdmVCaWdJbnQucHJvdG90eXBlLm1vZCA9IE5hdGl2ZUJpZ0ludC5wcm90b3R5cGUucmVtYWluZGVyID0gZnVuY3Rpb24gKHYpIHtcclxuICAgICAgICByZXR1cm4gbmV3IE5hdGl2ZUJpZ0ludCh0aGlzLnZhbHVlICUgcGFyc2VWYWx1ZSh2KS52YWx1ZSk7XHJcbiAgICB9O1xyXG4gICAgU21hbGxJbnRlZ2VyLnByb3RvdHlwZS5yZW1haW5kZXIgPSBTbWFsbEludGVnZXIucHJvdG90eXBlLm1vZCA9IEJpZ0ludGVnZXIucHJvdG90eXBlLnJlbWFpbmRlciA9IEJpZ0ludGVnZXIucHJvdG90eXBlLm1vZDtcclxuXHJcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5wb3cgPSBmdW5jdGlvbiAodikge1xyXG4gICAgICAgIHZhciBuID0gcGFyc2VWYWx1ZSh2KSxcclxuICAgICAgICAgICAgYSA9IHRoaXMudmFsdWUsXHJcbiAgICAgICAgICAgIGIgPSBuLnZhbHVlLFxyXG4gICAgICAgICAgICB2YWx1ZSwgeCwgeTtcclxuICAgICAgICBpZiAoYiA9PT0gMCkgcmV0dXJuIEludGVnZXJbMV07XHJcbiAgICAgICAgaWYgKGEgPT09IDApIHJldHVybiBJbnRlZ2VyWzBdO1xyXG4gICAgICAgIGlmIChhID09PSAxKSByZXR1cm4gSW50ZWdlclsxXTtcclxuICAgICAgICBpZiAoYSA9PT0gLTEpIHJldHVybiBuLmlzRXZlbigpID8gSW50ZWdlclsxXSA6IEludGVnZXJbLTFdO1xyXG4gICAgICAgIGlmIChuLnNpZ24pIHtcclxuICAgICAgICAgICAgcmV0dXJuIEludGVnZXJbMF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghbi5pc1NtYWxsKSB0aHJvdyBuZXcgRXJyb3IoXCJUaGUgZXhwb25lbnQgXCIgKyBuLnRvU3RyaW5nKCkgKyBcIiBpcyB0b28gbGFyZ2UuXCIpO1xyXG4gICAgICAgIGlmICh0aGlzLmlzU21hbGwpIHtcclxuICAgICAgICAgICAgaWYgKGlzUHJlY2lzZSh2YWx1ZSA9IE1hdGgucG93KGEsIGIpKSlcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgU21hbGxJbnRlZ2VyKHRydW5jYXRlKHZhbHVlKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHggPSB0aGlzO1xyXG4gICAgICAgIHkgPSBJbnRlZ2VyWzFdO1xyXG4gICAgICAgIHdoaWxlICh0cnVlKSB7XHJcbiAgICAgICAgICAgIGlmIChiICYgMSA9PT0gMSkge1xyXG4gICAgICAgICAgICAgICAgeSA9IHkudGltZXMoeCk7XHJcbiAgICAgICAgICAgICAgICAtLWI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGIgPT09IDApIGJyZWFrO1xyXG4gICAgICAgICAgICBiIC89IDI7XHJcbiAgICAgICAgICAgIHggPSB4LnNxdWFyZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4geTtcclxuICAgIH07XHJcbiAgICBTbWFsbEludGVnZXIucHJvdG90eXBlLnBvdyA9IEJpZ0ludGVnZXIucHJvdG90eXBlLnBvdztcclxuXHJcbiAgICBOYXRpdmVCaWdJbnQucHJvdG90eXBlLnBvdyA9IGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgdmFyIG4gPSBwYXJzZVZhbHVlKHYpO1xyXG4gICAgICAgIHZhciBhID0gdGhpcy52YWx1ZSwgYiA9IG4udmFsdWU7XHJcbiAgICAgICAgdmFyIF8wID0gQmlnSW50KDApLCBfMSA9IEJpZ0ludCgxKSwgXzIgPSBCaWdJbnQoMik7XHJcbiAgICAgICAgaWYgKGIgPT09IF8wKSByZXR1cm4gSW50ZWdlclsxXTtcclxuICAgICAgICBpZiAoYSA9PT0gXzApIHJldHVybiBJbnRlZ2VyWzBdO1xyXG4gICAgICAgIGlmIChhID09PSBfMSkgcmV0dXJuIEludGVnZXJbMV07XHJcbiAgICAgICAgaWYgKGEgPT09IEJpZ0ludCgtMSkpIHJldHVybiBuLmlzRXZlbigpID8gSW50ZWdlclsxXSA6IEludGVnZXJbLTFdO1xyXG4gICAgICAgIGlmIChuLmlzTmVnYXRpdmUoKSkgcmV0dXJuIG5ldyBOYXRpdmVCaWdJbnQoXzApO1xyXG4gICAgICAgIHZhciB4ID0gdGhpcztcclxuICAgICAgICB2YXIgeSA9IEludGVnZXJbMV07XHJcbiAgICAgICAgd2hpbGUgKHRydWUpIHtcclxuICAgICAgICAgICAgaWYgKChiICYgXzEpID09PSBfMSkge1xyXG4gICAgICAgICAgICAgICAgeSA9IHkudGltZXMoeCk7XHJcbiAgICAgICAgICAgICAgICAtLWI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGIgPT09IF8wKSBicmVhaztcclxuICAgICAgICAgICAgYiAvPSBfMjtcclxuICAgICAgICAgICAgeCA9IHguc3F1YXJlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB5O1xyXG4gICAgfVxyXG5cclxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLm1vZFBvdyA9IGZ1bmN0aW9uIChleHAsIG1vZCkge1xyXG4gICAgICAgIGV4cCA9IHBhcnNlVmFsdWUoZXhwKTtcclxuICAgICAgICBtb2QgPSBwYXJzZVZhbHVlKG1vZCk7XHJcbiAgICAgICAgaWYgKG1vZC5pc1plcm8oKSkgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IHRha2UgbW9kUG93IHdpdGggbW9kdWx1cyAwXCIpO1xyXG4gICAgICAgIHZhciByID0gSW50ZWdlclsxXSxcclxuICAgICAgICAgICAgYmFzZSA9IHRoaXMubW9kKG1vZCk7XHJcbiAgICAgICAgaWYgKGV4cC5pc05lZ2F0aXZlKCkpIHtcclxuICAgICAgICAgICAgZXhwID0gZXhwLm11bHRpcGx5KEludGVnZXJbLTFdKTtcclxuICAgICAgICAgICAgYmFzZSA9IGJhc2UubW9kSW52KG1vZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHdoaWxlIChleHAuaXNQb3NpdGl2ZSgpKSB7XHJcbiAgICAgICAgICAgIGlmIChiYXNlLmlzWmVybygpKSByZXR1cm4gSW50ZWdlclswXTtcclxuICAgICAgICAgICAgaWYgKGV4cC5pc09kZCgpKSByID0gci5tdWx0aXBseShiYXNlKS5tb2QobW9kKTtcclxuICAgICAgICAgICAgZXhwID0gZXhwLmRpdmlkZSgyKTtcclxuICAgICAgICAgICAgYmFzZSA9IGJhc2Uuc3F1YXJlKCkubW9kKG1vZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByO1xyXG4gICAgfTtcclxuICAgIE5hdGl2ZUJpZ0ludC5wcm90b3R5cGUubW9kUG93ID0gU21hbGxJbnRlZ2VyLnByb3RvdHlwZS5tb2RQb3cgPSBCaWdJbnRlZ2VyLnByb3RvdHlwZS5tb2RQb3c7XHJcblxyXG4gICAgZnVuY3Rpb24gY29tcGFyZUFicyhhLCBiKSB7XHJcbiAgICAgICAgaWYgKGEubGVuZ3RoICE9PSBiLmxlbmd0aCkge1xyXG4gICAgICAgICAgICByZXR1cm4gYS5sZW5ndGggPiBiLmxlbmd0aCA/IDEgOiAtMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IGEubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgICAgaWYgKGFbaV0gIT09IGJbaV0pIHJldHVybiBhW2ldID4gYltpXSA/IDEgOiAtMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcblxyXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuY29tcGFyZUFicyA9IGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgdmFyIG4gPSBwYXJzZVZhbHVlKHYpLFxyXG4gICAgICAgICAgICBhID0gdGhpcy52YWx1ZSxcclxuICAgICAgICAgICAgYiA9IG4udmFsdWU7XHJcbiAgICAgICAgaWYgKG4uaXNTbWFsbCkgcmV0dXJuIDE7XHJcbiAgICAgICAgcmV0dXJuIGNvbXBhcmVBYnMoYSwgYik7XHJcbiAgICB9O1xyXG4gICAgU21hbGxJbnRlZ2VyLnByb3RvdHlwZS5jb21wYXJlQWJzID0gZnVuY3Rpb24gKHYpIHtcclxuICAgICAgICB2YXIgbiA9IHBhcnNlVmFsdWUodiksXHJcbiAgICAgICAgICAgIGEgPSBNYXRoLmFicyh0aGlzLnZhbHVlKSxcclxuICAgICAgICAgICAgYiA9IG4udmFsdWU7XHJcbiAgICAgICAgaWYgKG4uaXNTbWFsbCkge1xyXG4gICAgICAgICAgICBiID0gTWF0aC5hYnMoYik7XHJcbiAgICAgICAgICAgIHJldHVybiBhID09PSBiID8gMCA6IGEgPiBiID8gMSA6IC0xO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gLTE7XHJcbiAgICB9O1xyXG4gICAgTmF0aXZlQmlnSW50LnByb3RvdHlwZS5jb21wYXJlQWJzID0gZnVuY3Rpb24gKHYpIHtcclxuICAgICAgICB2YXIgYSA9IHRoaXMudmFsdWU7XHJcbiAgICAgICAgdmFyIGIgPSBwYXJzZVZhbHVlKHYpLnZhbHVlO1xyXG4gICAgICAgIGEgPSBhID49IDAgPyBhIDogLWE7XHJcbiAgICAgICAgYiA9IGIgPj0gMCA/IGIgOiAtYjtcclxuICAgICAgICByZXR1cm4gYSA9PT0gYiA/IDAgOiBhID4gYiA/IDEgOiAtMTtcclxuICAgIH1cclxuXHJcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5jb21wYXJlID0gZnVuY3Rpb24gKHYpIHtcclxuICAgICAgICAvLyBTZWUgZGlzY3Vzc2lvbiBhYm91dCBjb21wYXJpc29uIHdpdGggSW5maW5pdHk6XHJcbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3BldGVyb2xzb24vQmlnSW50ZWdlci5qcy9pc3N1ZXMvNjFcclxuICAgICAgICBpZiAodiA9PT0gSW5maW5pdHkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodiA9PT0gLUluZmluaXR5KSB7XHJcbiAgICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIG4gPSBwYXJzZVZhbHVlKHYpLFxyXG4gICAgICAgICAgICBhID0gdGhpcy52YWx1ZSxcclxuICAgICAgICAgICAgYiA9IG4udmFsdWU7XHJcbiAgICAgICAgaWYgKHRoaXMuc2lnbiAhPT0gbi5zaWduKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuLnNpZ24gPyAxIDogLTE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChuLmlzU21hbGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2lnbiA/IC0xIDogMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGNvbXBhcmVBYnMoYSwgYikgKiAodGhpcy5zaWduID8gLTEgOiAxKTtcclxuICAgIH07XHJcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5jb21wYXJlVG8gPSBCaWdJbnRlZ2VyLnByb3RvdHlwZS5jb21wYXJlO1xyXG5cclxuICAgIFNtYWxsSW50ZWdlci5wcm90b3R5cGUuY29tcGFyZSA9IGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgaWYgKHYgPT09IEluZmluaXR5KSB7XHJcbiAgICAgICAgICAgIHJldHVybiAtMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHYgPT09IC1JbmZpbml0eSkge1xyXG4gICAgICAgICAgICByZXR1cm4gMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBuID0gcGFyc2VWYWx1ZSh2KSxcclxuICAgICAgICAgICAgYSA9IHRoaXMudmFsdWUsXHJcbiAgICAgICAgICAgIGIgPSBuLnZhbHVlO1xyXG4gICAgICAgIGlmIChuLmlzU21hbGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGEgPT0gYiA/IDAgOiBhID4gYiA/IDEgOiAtMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGEgPCAwICE9PSBuLnNpZ24pIHtcclxuICAgICAgICAgICAgcmV0dXJuIGEgPCAwID8gLTEgOiAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gYSA8IDAgPyAxIDogLTE7XHJcbiAgICB9O1xyXG4gICAgU21hbGxJbnRlZ2VyLnByb3RvdHlwZS5jb21wYXJlVG8gPSBTbWFsbEludGVnZXIucHJvdG90eXBlLmNvbXBhcmU7XHJcblxyXG4gICAgTmF0aXZlQmlnSW50LnByb3RvdHlwZS5jb21wYXJlID0gZnVuY3Rpb24gKHYpIHtcclxuICAgICAgICBpZiAodiA9PT0gSW5maW5pdHkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodiA9PT0gLUluZmluaXR5KSB7XHJcbiAgICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgYSA9IHRoaXMudmFsdWU7XHJcbiAgICAgICAgdmFyIGIgPSBwYXJzZVZhbHVlKHYpLnZhbHVlO1xyXG4gICAgICAgIHJldHVybiBhID09PSBiID8gMCA6IGEgPiBiID8gMSA6IC0xO1xyXG4gICAgfVxyXG4gICAgTmF0aXZlQmlnSW50LnByb3RvdHlwZS5jb21wYXJlVG8gPSBOYXRpdmVCaWdJbnQucHJvdG90eXBlLmNvbXBhcmU7XHJcblxyXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24gKHYpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jb21wYXJlKHYpID09PSAwO1xyXG4gICAgfTtcclxuICAgIE5hdGl2ZUJpZ0ludC5wcm90b3R5cGUuZXEgPSBOYXRpdmVCaWdJbnQucHJvdG90eXBlLmVxdWFscyA9IFNtYWxsSW50ZWdlci5wcm90b3R5cGUuZXEgPSBTbWFsbEludGVnZXIucHJvdG90eXBlLmVxdWFscyA9IEJpZ0ludGVnZXIucHJvdG90eXBlLmVxID0gQmlnSW50ZWdlci5wcm90b3R5cGUuZXF1YWxzO1xyXG5cclxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLm5vdEVxdWFscyA9IGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY29tcGFyZSh2KSAhPT0gMDtcclxuICAgIH07XHJcbiAgICBOYXRpdmVCaWdJbnQucHJvdG90eXBlLm5lcSA9IE5hdGl2ZUJpZ0ludC5wcm90b3R5cGUubm90RXF1YWxzID0gU21hbGxJbnRlZ2VyLnByb3RvdHlwZS5uZXEgPSBTbWFsbEludGVnZXIucHJvdG90eXBlLm5vdEVxdWFscyA9IEJpZ0ludGVnZXIucHJvdG90eXBlLm5lcSA9IEJpZ0ludGVnZXIucHJvdG90eXBlLm5vdEVxdWFscztcclxuXHJcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5ncmVhdGVyID0gZnVuY3Rpb24gKHYpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jb21wYXJlKHYpID4gMDtcclxuICAgIH07XHJcbiAgICBOYXRpdmVCaWdJbnQucHJvdG90eXBlLmd0ID0gTmF0aXZlQmlnSW50LnByb3RvdHlwZS5ncmVhdGVyID0gU21hbGxJbnRlZ2VyLnByb3RvdHlwZS5ndCA9IFNtYWxsSW50ZWdlci5wcm90b3R5cGUuZ3JlYXRlciA9IEJpZ0ludGVnZXIucHJvdG90eXBlLmd0ID0gQmlnSW50ZWdlci5wcm90b3R5cGUuZ3JlYXRlcjtcclxuXHJcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5sZXNzZXIgPSBmdW5jdGlvbiAodikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNvbXBhcmUodikgPCAwO1xyXG4gICAgfTtcclxuICAgIE5hdGl2ZUJpZ0ludC5wcm90b3R5cGUubHQgPSBOYXRpdmVCaWdJbnQucHJvdG90eXBlLmxlc3NlciA9IFNtYWxsSW50ZWdlci5wcm90b3R5cGUubHQgPSBTbWFsbEludGVnZXIucHJvdG90eXBlLmxlc3NlciA9IEJpZ0ludGVnZXIucHJvdG90eXBlLmx0ID0gQmlnSW50ZWdlci5wcm90b3R5cGUubGVzc2VyO1xyXG5cclxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmdyZWF0ZXJPckVxdWFscyA9IGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY29tcGFyZSh2KSA+PSAwO1xyXG4gICAgfTtcclxuICAgIE5hdGl2ZUJpZ0ludC5wcm90b3R5cGUuZ2VxID0gTmF0aXZlQmlnSW50LnByb3RvdHlwZS5ncmVhdGVyT3JFcXVhbHMgPSBTbWFsbEludGVnZXIucHJvdG90eXBlLmdlcSA9IFNtYWxsSW50ZWdlci5wcm90b3R5cGUuZ3JlYXRlck9yRXF1YWxzID0gQmlnSW50ZWdlci5wcm90b3R5cGUuZ2VxID0gQmlnSW50ZWdlci5wcm90b3R5cGUuZ3JlYXRlck9yRXF1YWxzO1xyXG5cclxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmxlc3Nlck9yRXF1YWxzID0gZnVuY3Rpb24gKHYpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jb21wYXJlKHYpIDw9IDA7XHJcbiAgICB9O1xyXG4gICAgTmF0aXZlQmlnSW50LnByb3RvdHlwZS5sZXEgPSBOYXRpdmVCaWdJbnQucHJvdG90eXBlLmxlc3Nlck9yRXF1YWxzID0gU21hbGxJbnRlZ2VyLnByb3RvdHlwZS5sZXEgPSBTbWFsbEludGVnZXIucHJvdG90eXBlLmxlc3Nlck9yRXF1YWxzID0gQmlnSW50ZWdlci5wcm90b3R5cGUubGVxID0gQmlnSW50ZWdlci5wcm90b3R5cGUubGVzc2VyT3JFcXVhbHM7XHJcblxyXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuaXNFdmVuID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiAodGhpcy52YWx1ZVswXSAmIDEpID09PSAwO1xyXG4gICAgfTtcclxuICAgIFNtYWxsSW50ZWdlci5wcm90b3R5cGUuaXNFdmVuID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiAodGhpcy52YWx1ZSAmIDEpID09PSAwO1xyXG4gICAgfTtcclxuICAgIE5hdGl2ZUJpZ0ludC5wcm90b3R5cGUuaXNFdmVuID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiAodGhpcy52YWx1ZSAmIEJpZ0ludCgxKSkgPT09IEJpZ0ludCgwKTtcclxuICAgIH1cclxuXHJcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5pc09kZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gKHRoaXMudmFsdWVbMF0gJiAxKSA9PT0gMTtcclxuICAgIH07XHJcbiAgICBTbWFsbEludGVnZXIucHJvdG90eXBlLmlzT2RkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiAodGhpcy52YWx1ZSAmIDEpID09PSAxO1xyXG4gICAgfTtcclxuICAgIE5hdGl2ZUJpZ0ludC5wcm90b3R5cGUuaXNPZGQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuICh0aGlzLnZhbHVlICYgQmlnSW50KDEpKSA9PT0gQmlnSW50KDEpO1xyXG4gICAgfVxyXG5cclxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmlzUG9zaXRpdmUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuICF0aGlzLnNpZ247XHJcbiAgICB9O1xyXG4gICAgU21hbGxJbnRlZ2VyLnByb3RvdHlwZS5pc1Bvc2l0aXZlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnZhbHVlID4gMDtcclxuICAgIH07XHJcbiAgICBOYXRpdmVCaWdJbnQucHJvdG90eXBlLmlzUG9zaXRpdmUgPSBTbWFsbEludGVnZXIucHJvdG90eXBlLmlzUG9zaXRpdmU7XHJcblxyXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuaXNOZWdhdGl2ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zaWduO1xyXG4gICAgfTtcclxuICAgIFNtYWxsSW50ZWdlci5wcm90b3R5cGUuaXNOZWdhdGl2ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy52YWx1ZSA8IDA7XHJcbiAgICB9O1xyXG4gICAgTmF0aXZlQmlnSW50LnByb3RvdHlwZS5pc05lZ2F0aXZlID0gU21hbGxJbnRlZ2VyLnByb3RvdHlwZS5pc05lZ2F0aXZlO1xyXG5cclxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmlzVW5pdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9O1xyXG4gICAgU21hbGxJbnRlZ2VyLnByb3RvdHlwZS5pc1VuaXQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGguYWJzKHRoaXMudmFsdWUpID09PSAxO1xyXG4gICAgfTtcclxuICAgIE5hdGl2ZUJpZ0ludC5wcm90b3R5cGUuaXNVbml0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmFicygpLnZhbHVlID09PSBCaWdJbnQoMSk7XHJcbiAgICB9XHJcblxyXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuaXNaZXJvID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH07XHJcbiAgICBTbWFsbEludGVnZXIucHJvdG90eXBlLmlzWmVybyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy52YWx1ZSA9PT0gMDtcclxuICAgIH07XHJcbiAgICBOYXRpdmVCaWdJbnQucHJvdG90eXBlLmlzWmVybyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy52YWx1ZSA9PT0gQmlnSW50KDApO1xyXG4gICAgfVxyXG5cclxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmlzRGl2aXNpYmxlQnkgPSBmdW5jdGlvbiAodikge1xyXG4gICAgICAgIHZhciBuID0gcGFyc2VWYWx1ZSh2KTtcclxuICAgICAgICBpZiAobi5pc1plcm8oKSkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIGlmIChuLmlzVW5pdCgpKSByZXR1cm4gdHJ1ZTtcclxuICAgICAgICBpZiAobi5jb21wYXJlQWJzKDIpID09PSAwKSByZXR1cm4gdGhpcy5pc0V2ZW4oKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5tb2QobikuaXNaZXJvKCk7XHJcbiAgICB9O1xyXG4gICAgTmF0aXZlQmlnSW50LnByb3RvdHlwZS5pc0RpdmlzaWJsZUJ5ID0gU21hbGxJbnRlZ2VyLnByb3RvdHlwZS5pc0RpdmlzaWJsZUJ5ID0gQmlnSW50ZWdlci5wcm90b3R5cGUuaXNEaXZpc2libGVCeTtcclxuXHJcbiAgICBmdW5jdGlvbiBpc0Jhc2ljUHJpbWUodikge1xyXG4gICAgICAgIHZhciBuID0gdi5hYnMoKTtcclxuICAgICAgICBpZiAobi5pc1VuaXQoKSkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIGlmIChuLmVxdWFscygyKSB8fCBuLmVxdWFscygzKSB8fCBuLmVxdWFscyg1KSkgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgaWYgKG4uaXNFdmVuKCkgfHwgbi5pc0RpdmlzaWJsZUJ5KDMpIHx8IG4uaXNEaXZpc2libGVCeSg1KSkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIGlmIChuLmxlc3Nlcig0OSkpIHJldHVybiB0cnVlO1xyXG4gICAgICAgIC8vIHdlIGRvbid0IGtub3cgaWYgaXQncyBwcmltZTogbGV0IHRoZSBvdGhlciBmdW5jdGlvbnMgZmlndXJlIGl0IG91dFxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIG1pbGxlclJhYmluVGVzdChuLCBhKSB7XHJcbiAgICAgICAgdmFyIG5QcmV2ID0gbi5wcmV2KCksXHJcbiAgICAgICAgICAgIGIgPSBuUHJldixcclxuICAgICAgICAgICAgciA9IDAsXHJcbiAgICAgICAgICAgIGQsIHQsIGksIHg7XHJcbiAgICAgICAgd2hpbGUgKGIuaXNFdmVuKCkpIGIgPSBiLmRpdmlkZSgyKSwgcisrO1xyXG4gICAgICAgIG5leHQ6IGZvciAoaSA9IDA7IGkgPCBhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChuLmxlc3NlcihhW2ldKSkgY29udGludWU7XHJcbiAgICAgICAgICAgIHggPSBiaWdJbnQoYVtpXSkubW9kUG93KGIsIG4pO1xyXG4gICAgICAgICAgICBpZiAoeC5pc1VuaXQoKSB8fCB4LmVxdWFscyhuUHJldikpIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICBmb3IgKGQgPSByIC0gMTsgZCAhPSAwOyBkLS0pIHtcclxuICAgICAgICAgICAgICAgIHggPSB4LnNxdWFyZSgpLm1vZChuKTtcclxuICAgICAgICAgICAgICAgIGlmICh4LmlzVW5pdCgpKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBpZiAoeC5lcXVhbHMoblByZXYpKSBjb250aW51ZSBuZXh0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU2V0IFwic3RyaWN0XCIgdG8gdHJ1ZSB0byBmb3JjZSBHUkgtc3VwcG9ydGVkIGxvd2VyIGJvdW5kIG9mIDIqbG9nKE4pXjJcclxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmlzUHJpbWUgPSBmdW5jdGlvbiAoc3RyaWN0KSB7XHJcbiAgICAgICAgdmFyIGlzUHJpbWUgPSBpc0Jhc2ljUHJpbWUodGhpcyk7XHJcbiAgICAgICAgaWYgKGlzUHJpbWUgIT09IHVuZGVmaW5lZCkgcmV0dXJuIGlzUHJpbWU7XHJcbiAgICAgICAgdmFyIG4gPSB0aGlzLmFicygpO1xyXG4gICAgICAgIHZhciBiaXRzID0gbi5iaXRMZW5ndGgoKTtcclxuICAgICAgICBpZiAoYml0cyA8PSA2NClcclxuICAgICAgICAgICAgcmV0dXJuIG1pbGxlclJhYmluVGVzdChuLCBbMiwgMywgNSwgNywgMTEsIDEzLCAxNywgMTksIDIzLCAyOSwgMzEsIDM3XSk7XHJcbiAgICAgICAgdmFyIGxvZ04gPSBNYXRoLmxvZygyKSAqIGJpdHMudG9KU051bWJlcigpO1xyXG4gICAgICAgIHZhciB0ID0gTWF0aC5jZWlsKChzdHJpY3QgPT09IHRydWUpID8gKDIgKiBNYXRoLnBvdyhsb2dOLCAyKSkgOiBsb2dOKTtcclxuICAgICAgICBmb3IgKHZhciBhID0gW10sIGkgPSAwOyBpIDwgdDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGEucHVzaChiaWdJbnQoaSArIDIpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG1pbGxlclJhYmluVGVzdChuLCBhKTtcclxuICAgIH07XHJcbiAgICBOYXRpdmVCaWdJbnQucHJvdG90eXBlLmlzUHJpbWUgPSBTbWFsbEludGVnZXIucHJvdG90eXBlLmlzUHJpbWUgPSBCaWdJbnRlZ2VyLnByb3RvdHlwZS5pc1ByaW1lO1xyXG5cclxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLmlzUHJvYmFibGVQcmltZSA9IGZ1bmN0aW9uIChpdGVyYXRpb25zLCBybmcpIHtcclxuICAgICAgICB2YXIgaXNQcmltZSA9IGlzQmFzaWNQcmltZSh0aGlzKTtcclxuICAgICAgICBpZiAoaXNQcmltZSAhPT0gdW5kZWZpbmVkKSByZXR1cm4gaXNQcmltZTtcclxuICAgICAgICB2YXIgbiA9IHRoaXMuYWJzKCk7XHJcbiAgICAgICAgdmFyIHQgPSBpdGVyYXRpb25zID09PSB1bmRlZmluZWQgPyA1IDogaXRlcmF0aW9ucztcclxuICAgICAgICBmb3IgKHZhciBhID0gW10sIGkgPSAwOyBpIDwgdDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGEucHVzaChiaWdJbnQucmFuZEJldHdlZW4oMiwgbi5taW51cygyKSwgcm5nKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBtaWxsZXJSYWJpblRlc3QobiwgYSk7XHJcbiAgICB9O1xyXG4gICAgTmF0aXZlQmlnSW50LnByb3RvdHlwZS5pc1Byb2JhYmxlUHJpbWUgPSBTbWFsbEludGVnZXIucHJvdG90eXBlLmlzUHJvYmFibGVQcmltZSA9IEJpZ0ludGVnZXIucHJvdG90eXBlLmlzUHJvYmFibGVQcmltZTtcclxuXHJcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5tb2RJbnYgPSBmdW5jdGlvbiAobikge1xyXG4gICAgICAgIHZhciB0ID0gYmlnSW50Lnplcm8sIG5ld1QgPSBiaWdJbnQub25lLCByID0gcGFyc2VWYWx1ZShuKSwgbmV3UiA9IHRoaXMuYWJzKCksIHEsIGxhc3RULCBsYXN0UjtcclxuICAgICAgICB3aGlsZSAoIW5ld1IuaXNaZXJvKCkpIHtcclxuICAgICAgICAgICAgcSA9IHIuZGl2aWRlKG5ld1IpO1xyXG4gICAgICAgICAgICBsYXN0VCA9IHQ7XHJcbiAgICAgICAgICAgIGxhc3RSID0gcjtcclxuICAgICAgICAgICAgdCA9IG5ld1Q7XHJcbiAgICAgICAgICAgIHIgPSBuZXdSO1xyXG4gICAgICAgICAgICBuZXdUID0gbGFzdFQuc3VidHJhY3QocS5tdWx0aXBseShuZXdUKSk7XHJcbiAgICAgICAgICAgIG5ld1IgPSBsYXN0Ui5zdWJ0cmFjdChxLm11bHRpcGx5KG5ld1IpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFyLmlzVW5pdCgpKSB0aHJvdyBuZXcgRXJyb3IodGhpcy50b1N0cmluZygpICsgXCIgYW5kIFwiICsgbi50b1N0cmluZygpICsgXCIgYXJlIG5vdCBjby1wcmltZVwiKTtcclxuICAgICAgICBpZiAodC5jb21wYXJlKDApID09PSAtMSkge1xyXG4gICAgICAgICAgICB0ID0gdC5hZGQobik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmlzTmVnYXRpdmUoKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdC5uZWdhdGUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHQ7XHJcbiAgICB9O1xyXG5cclxuICAgIE5hdGl2ZUJpZ0ludC5wcm90b3R5cGUubW9kSW52ID0gU21hbGxJbnRlZ2VyLnByb3RvdHlwZS5tb2RJbnYgPSBCaWdJbnRlZ2VyLnByb3RvdHlwZS5tb2RJbnY7XHJcblxyXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgdmFsdWUgPSB0aGlzLnZhbHVlO1xyXG4gICAgICAgIGlmICh0aGlzLnNpZ24pIHtcclxuICAgICAgICAgICAgcmV0dXJuIHN1YnRyYWN0U21hbGwodmFsdWUsIDEsIHRoaXMuc2lnbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXcgQmlnSW50ZWdlcihhZGRTbWFsbCh2YWx1ZSwgMSksIHRoaXMuc2lnbik7XHJcbiAgICB9O1xyXG4gICAgU21hbGxJbnRlZ2VyLnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciB2YWx1ZSA9IHRoaXMudmFsdWU7XHJcbiAgICAgICAgaWYgKHZhbHVlICsgMSA8IE1BWF9JTlQpIHJldHVybiBuZXcgU21hbGxJbnRlZ2VyKHZhbHVlICsgMSk7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCaWdJbnRlZ2VyKE1BWF9JTlRfQVJSLCBmYWxzZSk7XHJcbiAgICB9O1xyXG4gICAgTmF0aXZlQmlnSW50LnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgTmF0aXZlQmlnSW50KHRoaXMudmFsdWUgKyBCaWdJbnQoMSkpO1xyXG4gICAgfVxyXG5cclxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLnByZXYgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHZhbHVlID0gdGhpcy52YWx1ZTtcclxuICAgICAgICBpZiAodGhpcy5zaWduKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQmlnSW50ZWdlcihhZGRTbWFsbCh2YWx1ZSwgMSksIHRydWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc3VidHJhY3RTbWFsbCh2YWx1ZSwgMSwgdGhpcy5zaWduKTtcclxuICAgIH07XHJcbiAgICBTbWFsbEludGVnZXIucHJvdG90eXBlLnByZXYgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHZhbHVlID0gdGhpcy52YWx1ZTtcclxuICAgICAgICBpZiAodmFsdWUgLSAxID4gLU1BWF9JTlQpIHJldHVybiBuZXcgU21hbGxJbnRlZ2VyKHZhbHVlIC0gMSk7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCaWdJbnRlZ2VyKE1BWF9JTlRfQVJSLCB0cnVlKTtcclxuICAgIH07XHJcbiAgICBOYXRpdmVCaWdJbnQucHJvdG90eXBlLnByZXYgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBOYXRpdmVCaWdJbnQodGhpcy52YWx1ZSAtIEJpZ0ludCgxKSk7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHBvd2Vyc09mVHdvID0gWzFdO1xyXG4gICAgd2hpbGUgKDIgKiBwb3dlcnNPZlR3b1twb3dlcnNPZlR3by5sZW5ndGggLSAxXSA8PSBCQVNFKSBwb3dlcnNPZlR3by5wdXNoKDIgKiBwb3dlcnNPZlR3b1twb3dlcnNPZlR3by5sZW5ndGggLSAxXSk7XHJcbiAgICB2YXIgcG93ZXJzMkxlbmd0aCA9IHBvd2Vyc09mVHdvLmxlbmd0aCwgaGlnaGVzdFBvd2VyMiA9IHBvd2Vyc09mVHdvW3Bvd2VyczJMZW5ndGggLSAxXTtcclxuXHJcbiAgICBmdW5jdGlvbiBzaGlmdF9pc1NtYWxsKG4pIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5hYnMobikgPD0gQkFTRTtcclxuICAgIH1cclxuXHJcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5zaGlmdExlZnQgPSBmdW5jdGlvbiAodikge1xyXG4gICAgICAgIHZhciBuID0gcGFyc2VWYWx1ZSh2KS50b0pTTnVtYmVyKCk7XHJcbiAgICAgICAgaWYgKCFzaGlmdF9pc1NtYWxsKG4pKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihTdHJpbmcobikgKyBcIiBpcyB0b28gbGFyZ2UgZm9yIHNoaWZ0aW5nLlwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG4gPCAwKSByZXR1cm4gdGhpcy5zaGlmdFJpZ2h0KC1uKTtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gdGhpcztcclxuICAgICAgICBpZiAocmVzdWx0LmlzWmVybygpKSByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIHdoaWxlIChuID49IHBvd2VyczJMZW5ndGgpIHtcclxuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0Lm11bHRpcGx5KGhpZ2hlc3RQb3dlcjIpO1xyXG4gICAgICAgICAgICBuIC09IHBvd2VyczJMZW5ndGggLSAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVzdWx0Lm11bHRpcGx5KHBvd2Vyc09mVHdvW25dKTtcclxuICAgIH07XHJcbiAgICBOYXRpdmVCaWdJbnQucHJvdG90eXBlLnNoaWZ0TGVmdCA9IFNtYWxsSW50ZWdlci5wcm90b3R5cGUuc2hpZnRMZWZ0ID0gQmlnSW50ZWdlci5wcm90b3R5cGUuc2hpZnRMZWZ0O1xyXG5cclxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLnNoaWZ0UmlnaHQgPSBmdW5jdGlvbiAodikge1xyXG4gICAgICAgIHZhciByZW1RdW87XHJcbiAgICAgICAgdmFyIG4gPSBwYXJzZVZhbHVlKHYpLnRvSlNOdW1iZXIoKTtcclxuICAgICAgICBpZiAoIXNoaWZ0X2lzU21hbGwobikpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFN0cmluZyhuKSArIFwiIGlzIHRvbyBsYXJnZSBmb3Igc2hpZnRpbmcuXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobiA8IDApIHJldHVybiB0aGlzLnNoaWZ0TGVmdCgtbik7XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IHRoaXM7XHJcbiAgICAgICAgd2hpbGUgKG4gPj0gcG93ZXJzMkxlbmd0aCkge1xyXG4gICAgICAgICAgICBpZiAocmVzdWx0LmlzWmVybygpIHx8IChyZXN1bHQuaXNOZWdhdGl2ZSgpICYmIHJlc3VsdC5pc1VuaXQoKSkpIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgICAgIHJlbVF1byA9IGRpdk1vZEFueShyZXN1bHQsIGhpZ2hlc3RQb3dlcjIpO1xyXG4gICAgICAgICAgICByZXN1bHQgPSByZW1RdW9bMV0uaXNOZWdhdGl2ZSgpID8gcmVtUXVvWzBdLnByZXYoKSA6IHJlbVF1b1swXTtcclxuICAgICAgICAgICAgbiAtPSBwb3dlcnMyTGVuZ3RoIC0gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmVtUXVvID0gZGl2TW9kQW55KHJlc3VsdCwgcG93ZXJzT2ZUd29bbl0pO1xyXG4gICAgICAgIHJldHVybiByZW1RdW9bMV0uaXNOZWdhdGl2ZSgpID8gcmVtUXVvWzBdLnByZXYoKSA6IHJlbVF1b1swXTtcclxuICAgIH07XHJcbiAgICBOYXRpdmVCaWdJbnQucHJvdG90eXBlLnNoaWZ0UmlnaHQgPSBTbWFsbEludGVnZXIucHJvdG90eXBlLnNoaWZ0UmlnaHQgPSBCaWdJbnRlZ2VyLnByb3RvdHlwZS5zaGlmdFJpZ2h0O1xyXG5cclxuICAgIGZ1bmN0aW9uIGJpdHdpc2UoeCwgeSwgZm4pIHtcclxuICAgICAgICB5ID0gcGFyc2VWYWx1ZSh5KTtcclxuICAgICAgICB2YXIgeFNpZ24gPSB4LmlzTmVnYXRpdmUoKSwgeVNpZ24gPSB5LmlzTmVnYXRpdmUoKTtcclxuICAgICAgICB2YXIgeFJlbSA9IHhTaWduID8geC5ub3QoKSA6IHgsXHJcbiAgICAgICAgICAgIHlSZW0gPSB5U2lnbiA/IHkubm90KCkgOiB5O1xyXG4gICAgICAgIHZhciB4RGlnaXQgPSAwLCB5RGlnaXQgPSAwO1xyXG4gICAgICAgIHZhciB4RGl2TW9kID0gbnVsbCwgeURpdk1vZCA9IG51bGw7XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xyXG4gICAgICAgIHdoaWxlICgheFJlbS5pc1plcm8oKSB8fCAheVJlbS5pc1plcm8oKSkge1xyXG4gICAgICAgICAgICB4RGl2TW9kID0gZGl2TW9kQW55KHhSZW0sIGhpZ2hlc3RQb3dlcjIpO1xyXG4gICAgICAgICAgICB4RGlnaXQgPSB4RGl2TW9kWzFdLnRvSlNOdW1iZXIoKTtcclxuICAgICAgICAgICAgaWYgKHhTaWduKSB7XHJcbiAgICAgICAgICAgICAgICB4RGlnaXQgPSBoaWdoZXN0UG93ZXIyIC0gMSAtIHhEaWdpdDsgLy8gdHdvJ3MgY29tcGxlbWVudCBmb3IgbmVnYXRpdmUgbnVtYmVyc1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB5RGl2TW9kID0gZGl2TW9kQW55KHlSZW0sIGhpZ2hlc3RQb3dlcjIpO1xyXG4gICAgICAgICAgICB5RGlnaXQgPSB5RGl2TW9kWzFdLnRvSlNOdW1iZXIoKTtcclxuICAgICAgICAgICAgaWYgKHlTaWduKSB7XHJcbiAgICAgICAgICAgICAgICB5RGlnaXQgPSBoaWdoZXN0UG93ZXIyIC0gMSAtIHlEaWdpdDsgLy8gdHdvJ3MgY29tcGxlbWVudCBmb3IgbmVnYXRpdmUgbnVtYmVyc1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB4UmVtID0geERpdk1vZFswXTtcclxuICAgICAgICAgICAgeVJlbSA9IHlEaXZNb2RbMF07XHJcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKGZuKHhEaWdpdCwgeURpZ2l0KSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBzdW0gPSBmbih4U2lnbiA/IDEgOiAwLCB5U2lnbiA/IDEgOiAwKSAhPT0gMCA/IGJpZ0ludCgtMSkgOiBiaWdJbnQoMCk7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IHJlc3VsdC5sZW5ndGggLSAxOyBpID49IDA7IGkgLT0gMSkge1xyXG4gICAgICAgICAgICBzdW0gPSBzdW0ubXVsdGlwbHkoaGlnaGVzdFBvd2VyMikuYWRkKGJpZ0ludChyZXN1bHRbaV0pKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHN1bTtcclxuICAgIH1cclxuXHJcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS5ub3QgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubmVnYXRlKCkucHJldigpO1xyXG4gICAgfTtcclxuICAgIE5hdGl2ZUJpZ0ludC5wcm90b3R5cGUubm90ID0gU21hbGxJbnRlZ2VyLnByb3RvdHlwZS5ub3QgPSBCaWdJbnRlZ2VyLnByb3RvdHlwZS5ub3Q7XHJcblxyXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuYW5kID0gZnVuY3Rpb24gKG4pIHtcclxuICAgICAgICByZXR1cm4gYml0d2lzZSh0aGlzLCBuLCBmdW5jdGlvbiAoYSwgYikgeyByZXR1cm4gYSAmIGI7IH0pO1xyXG4gICAgfTtcclxuICAgIE5hdGl2ZUJpZ0ludC5wcm90b3R5cGUuYW5kID0gU21hbGxJbnRlZ2VyLnByb3RvdHlwZS5hbmQgPSBCaWdJbnRlZ2VyLnByb3RvdHlwZS5hbmQ7XHJcblxyXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUub3IgPSBmdW5jdGlvbiAobikge1xyXG4gICAgICAgIHJldHVybiBiaXR3aXNlKHRoaXMsIG4sIGZ1bmN0aW9uIChhLCBiKSB7IHJldHVybiBhIHwgYjsgfSk7XHJcbiAgICB9O1xyXG4gICAgTmF0aXZlQmlnSW50LnByb3RvdHlwZS5vciA9IFNtYWxsSW50ZWdlci5wcm90b3R5cGUub3IgPSBCaWdJbnRlZ2VyLnByb3RvdHlwZS5vcjtcclxuXHJcbiAgICBCaWdJbnRlZ2VyLnByb3RvdHlwZS54b3IgPSBmdW5jdGlvbiAobikge1xyXG4gICAgICAgIHJldHVybiBiaXR3aXNlKHRoaXMsIG4sIGZ1bmN0aW9uIChhLCBiKSB7IHJldHVybiBhIF4gYjsgfSk7XHJcbiAgICB9O1xyXG4gICAgTmF0aXZlQmlnSW50LnByb3RvdHlwZS54b3IgPSBTbWFsbEludGVnZXIucHJvdG90eXBlLnhvciA9IEJpZ0ludGVnZXIucHJvdG90eXBlLnhvcjtcclxuXHJcbiAgICB2YXIgTE9CTUFTS19JID0gMSA8PCAzMCwgTE9CTUFTS19CSSA9IChCQVNFICYgLUJBU0UpICogKEJBU0UgJiAtQkFTRSkgfCBMT0JNQVNLX0k7XHJcbiAgICBmdW5jdGlvbiByb3VnaExPQihuKSB7IC8vIGdldCBsb3dlc3RPbmVCaXQgKHJvdWdoKVxyXG4gICAgICAgIC8vIFNtYWxsSW50ZWdlcjogcmV0dXJuIE1pbihsb3dlc3RPbmVCaXQobiksIDEgPDwgMzApXHJcbiAgICAgICAgLy8gQmlnSW50ZWdlcjogcmV0dXJuIE1pbihsb3dlc3RPbmVCaXQobiksIDEgPDwgMTQpIFtCQVNFPTFlN11cclxuICAgICAgICB2YXIgdiA9IG4udmFsdWUsXHJcbiAgICAgICAgICAgIHggPSB0eXBlb2YgdiA9PT0gXCJudW1iZXJcIiA/IHYgfCBMT0JNQVNLX0kgOlxyXG4gICAgICAgICAgICAgICAgdHlwZW9mIHYgPT09IFwiYmlnaW50XCIgPyB2IHwgQmlnSW50KExPQk1BU0tfSSkgOlxyXG4gICAgICAgICAgICAgICAgICAgIHZbMF0gKyB2WzFdICogQkFTRSB8IExPQk1BU0tfQkk7XHJcbiAgICAgICAgcmV0dXJuIHggJiAteDtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbnRlZ2VyTG9nYXJpdGhtKHZhbHVlLCBiYXNlKSB7XHJcbiAgICAgICAgaWYgKGJhc2UuY29tcGFyZVRvKHZhbHVlKSA8PSAwKSB7XHJcbiAgICAgICAgICAgIHZhciB0bXAgPSBpbnRlZ2VyTG9nYXJpdGhtKHZhbHVlLCBiYXNlLnNxdWFyZShiYXNlKSk7XHJcbiAgICAgICAgICAgIHZhciBwID0gdG1wLnA7XHJcbiAgICAgICAgICAgIHZhciBlID0gdG1wLmU7XHJcbiAgICAgICAgICAgIHZhciB0ID0gcC5tdWx0aXBseShiYXNlKTtcclxuICAgICAgICAgICAgcmV0dXJuIHQuY29tcGFyZVRvKHZhbHVlKSA8PSAwID8geyBwOiB0LCBlOiBlICogMiArIDEgfSA6IHsgcDogcCwgZTogZSAqIDIgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHsgcDogYmlnSW50KDEpLCBlOiAwIH07XHJcbiAgICB9XHJcblxyXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUuYml0TGVuZ3RoID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBuID0gdGhpcztcclxuICAgICAgICBpZiAobi5jb21wYXJlVG8oYmlnSW50KDApKSA8IDApIHtcclxuICAgICAgICAgICAgbiA9IG4ubmVnYXRlKCkuc3VidHJhY3QoYmlnSW50KDEpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG4uY29tcGFyZVRvKGJpZ0ludCgwKSkgPT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIGJpZ0ludCgwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGJpZ0ludChpbnRlZ2VyTG9nYXJpdGhtKG4sIGJpZ0ludCgyKSkuZSkuYWRkKGJpZ0ludCgxKSk7XHJcbiAgICB9XHJcbiAgICBOYXRpdmVCaWdJbnQucHJvdG90eXBlLmJpdExlbmd0aCA9IFNtYWxsSW50ZWdlci5wcm90b3R5cGUuYml0TGVuZ3RoID0gQmlnSW50ZWdlci5wcm90b3R5cGUuYml0TGVuZ3RoO1xyXG5cclxuICAgIGZ1bmN0aW9uIG1heChhLCBiKSB7XHJcbiAgICAgICAgYSA9IHBhcnNlVmFsdWUoYSk7XHJcbiAgICAgICAgYiA9IHBhcnNlVmFsdWUoYik7XHJcbiAgICAgICAgcmV0dXJuIGEuZ3JlYXRlcihiKSA/IGEgOiBiO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gbWluKGEsIGIpIHtcclxuICAgICAgICBhID0gcGFyc2VWYWx1ZShhKTtcclxuICAgICAgICBiID0gcGFyc2VWYWx1ZShiKTtcclxuICAgICAgICByZXR1cm4gYS5sZXNzZXIoYikgPyBhIDogYjtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGdjZChhLCBiKSB7XHJcbiAgICAgICAgYSA9IHBhcnNlVmFsdWUoYSkuYWJzKCk7XHJcbiAgICAgICAgYiA9IHBhcnNlVmFsdWUoYikuYWJzKCk7XHJcbiAgICAgICAgaWYgKGEuZXF1YWxzKGIpKSByZXR1cm4gYTtcclxuICAgICAgICBpZiAoYS5pc1plcm8oKSkgcmV0dXJuIGI7XHJcbiAgICAgICAgaWYgKGIuaXNaZXJvKCkpIHJldHVybiBhO1xyXG4gICAgICAgIHZhciBjID0gSW50ZWdlclsxXSwgZCwgdDtcclxuICAgICAgICB3aGlsZSAoYS5pc0V2ZW4oKSAmJiBiLmlzRXZlbigpKSB7XHJcbiAgICAgICAgICAgIGQgPSBtaW4ocm91Z2hMT0IoYSksIHJvdWdoTE9CKGIpKTtcclxuICAgICAgICAgICAgYSA9IGEuZGl2aWRlKGQpO1xyXG4gICAgICAgICAgICBiID0gYi5kaXZpZGUoZCk7XHJcbiAgICAgICAgICAgIGMgPSBjLm11bHRpcGx5KGQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB3aGlsZSAoYS5pc0V2ZW4oKSkge1xyXG4gICAgICAgICAgICBhID0gYS5kaXZpZGUocm91Z2hMT0IoYSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgIHdoaWxlIChiLmlzRXZlbigpKSB7XHJcbiAgICAgICAgICAgICAgICBiID0gYi5kaXZpZGUocm91Z2hMT0IoYikpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChhLmdyZWF0ZXIoYikpIHtcclxuICAgICAgICAgICAgICAgIHQgPSBiOyBiID0gYTsgYSA9IHQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYiA9IGIuc3VidHJhY3QoYSk7XHJcbiAgICAgICAgfSB3aGlsZSAoIWIuaXNaZXJvKCkpO1xyXG4gICAgICAgIHJldHVybiBjLmlzVW5pdCgpID8gYSA6IGEubXVsdGlwbHkoYyk7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBsY20oYSwgYikge1xyXG4gICAgICAgIGEgPSBwYXJzZVZhbHVlKGEpLmFicygpO1xyXG4gICAgICAgIGIgPSBwYXJzZVZhbHVlKGIpLmFicygpO1xyXG4gICAgICAgIHJldHVybiBhLmRpdmlkZShnY2QoYSwgYikpLm11bHRpcGx5KGIpO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gcmFuZEJldHdlZW4oYSwgYiwgcm5nKSB7XHJcbiAgICAgICAgYSA9IHBhcnNlVmFsdWUoYSk7XHJcbiAgICAgICAgYiA9IHBhcnNlVmFsdWUoYik7XHJcbiAgICAgICAgdmFyIHVzZWRSTkcgPSBybmcgfHwgTWF0aC5yYW5kb207XHJcbiAgICAgICAgdmFyIGxvdyA9IG1pbihhLCBiKSwgaGlnaCA9IG1heChhLCBiKTtcclxuICAgICAgICB2YXIgcmFuZ2UgPSBoaWdoLnN1YnRyYWN0KGxvdykuYWRkKDEpO1xyXG4gICAgICAgIGlmIChyYW5nZS5pc1NtYWxsKSByZXR1cm4gbG93LmFkZChNYXRoLmZsb29yKHVzZWRSTkcoKSAqIHJhbmdlKSk7XHJcbiAgICAgICAgdmFyIGRpZ2l0cyA9IHRvQmFzZShyYW5nZSwgQkFTRSkudmFsdWU7XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IFtdLCByZXN0cmljdGVkID0gdHJ1ZTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRpZ2l0cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgdG9wID0gcmVzdHJpY3RlZCA/IGRpZ2l0c1tpXSA6IEJBU0U7XHJcbiAgICAgICAgICAgIHZhciBkaWdpdCA9IHRydW5jYXRlKHVzZWRSTkcoKSAqIHRvcCk7XHJcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKGRpZ2l0KTtcclxuICAgICAgICAgICAgaWYgKGRpZ2l0IDwgdG9wKSByZXN0cmljdGVkID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBsb3cuYWRkKEludGVnZXIuZnJvbUFycmF5KHJlc3VsdCwgQkFTRSwgZmFsc2UpKTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgcGFyc2VCYXNlID0gZnVuY3Rpb24gKHRleHQsIGJhc2UsIGFscGhhYmV0LCBjYXNlU2Vuc2l0aXZlKSB7XHJcbiAgICAgICAgYWxwaGFiZXQgPSBhbHBoYWJldCB8fCBERUZBVUxUX0FMUEhBQkVUO1xyXG4gICAgICAgIHRleHQgPSBTdHJpbmcodGV4dCk7XHJcbiAgICAgICAgaWYgKCFjYXNlU2Vuc2l0aXZlKSB7XHJcbiAgICAgICAgICAgIHRleHQgPSB0ZXh0LnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICAgIGFscGhhYmV0ID0gYWxwaGFiZXQudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGxlbmd0aCA9IHRleHQubGVuZ3RoO1xyXG4gICAgICAgIHZhciBpO1xyXG4gICAgICAgIHZhciBhYnNCYXNlID0gTWF0aC5hYnMoYmFzZSk7XHJcbiAgICAgICAgdmFyIGFscGhhYmV0VmFsdWVzID0ge307XHJcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGFscGhhYmV0Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGFscGhhYmV0VmFsdWVzW2FscGhhYmV0W2ldXSA9IGk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgYyA9IHRleHRbaV07XHJcbiAgICAgICAgICAgIGlmIChjID09PSBcIi1cIikgY29udGludWU7XHJcbiAgICAgICAgICAgIGlmIChjIGluIGFscGhhYmV0VmFsdWVzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoYWxwaGFiZXRWYWx1ZXNbY10gPj0gYWJzQmFzZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjID09PSBcIjFcIiAmJiBhYnNCYXNlID09PSAxKSBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYyArIFwiIGlzIG5vdCBhIHZhbGlkIGRpZ2l0IGluIGJhc2UgXCIgKyBiYXNlICsgXCIuXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJhc2UgPSBwYXJzZVZhbHVlKGJhc2UpO1xyXG4gICAgICAgIHZhciBkaWdpdHMgPSBbXTtcclxuICAgICAgICB2YXIgaXNOZWdhdGl2ZSA9IHRleHRbMF0gPT09IFwiLVwiO1xyXG4gICAgICAgIGZvciAoaSA9IGlzTmVnYXRpdmUgPyAxIDogMDsgaSA8IHRleHQubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIGMgPSB0ZXh0W2ldO1xyXG4gICAgICAgICAgICBpZiAoYyBpbiBhbHBoYWJldFZhbHVlcykgZGlnaXRzLnB1c2gocGFyc2VWYWx1ZShhbHBoYWJldFZhbHVlc1tjXSkpO1xyXG4gICAgICAgICAgICBlbHNlIGlmIChjID09PSBcIjxcIikge1xyXG4gICAgICAgICAgICAgICAgdmFyIHN0YXJ0ID0gaTtcclxuICAgICAgICAgICAgICAgIGRvIHsgaSsrOyB9IHdoaWxlICh0ZXh0W2ldICE9PSBcIj5cIiAmJiBpIDwgdGV4dC5sZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgZGlnaXRzLnB1c2gocGFyc2VWYWx1ZSh0ZXh0LnNsaWNlKHN0YXJ0ICsgMSwgaSkpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHRocm93IG5ldyBFcnJvcihjICsgXCIgaXMgbm90IGEgdmFsaWQgY2hhcmFjdGVyXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcGFyc2VCYXNlRnJvbUFycmF5KGRpZ2l0cywgYmFzZSwgaXNOZWdhdGl2ZSk7XHJcbiAgICB9O1xyXG5cclxuICAgIGZ1bmN0aW9uIHBhcnNlQmFzZUZyb21BcnJheShkaWdpdHMsIGJhc2UsIGlzTmVnYXRpdmUpIHtcclxuICAgICAgICB2YXIgdmFsID0gSW50ZWdlclswXSwgcG93ID0gSW50ZWdlclsxXSwgaTtcclxuICAgICAgICBmb3IgKGkgPSBkaWdpdHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgICAgdmFsID0gdmFsLmFkZChkaWdpdHNbaV0udGltZXMocG93KSk7XHJcbiAgICAgICAgICAgIHBvdyA9IHBvdy50aW1lcyhiYXNlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGlzTmVnYXRpdmUgPyB2YWwubmVnYXRlKCkgOiB2YWw7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gc3RyaW5naWZ5KGRpZ2l0LCBhbHBoYWJldCkge1xyXG4gICAgICAgIGFscGhhYmV0ID0gYWxwaGFiZXQgfHwgREVGQVVMVF9BTFBIQUJFVDtcclxuICAgICAgICBpZiAoZGlnaXQgPCBhbHBoYWJldC5sZW5ndGgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGFscGhhYmV0W2RpZ2l0XTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIFwiPFwiICsgZGlnaXQgKyBcIj5cIjtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiB0b0Jhc2UobiwgYmFzZSkge1xyXG4gICAgICAgIGJhc2UgPSBiaWdJbnQoYmFzZSk7XHJcbiAgICAgICAgaWYgKGJhc2UuaXNaZXJvKCkpIHtcclxuICAgICAgICAgICAgaWYgKG4uaXNaZXJvKCkpIHJldHVybiB7IHZhbHVlOiBbMF0sIGlzTmVnYXRpdmU6IGZhbHNlIH07XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBjb252ZXJ0IG5vbnplcm8gbnVtYmVycyB0byBiYXNlIDAuXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoYmFzZS5lcXVhbHMoLTEpKSB7XHJcbiAgICAgICAgICAgIGlmIChuLmlzWmVybygpKSByZXR1cm4geyB2YWx1ZTogWzBdLCBpc05lZ2F0aXZlOiBmYWxzZSB9O1xyXG4gICAgICAgICAgICBpZiAobi5pc05lZ2F0aXZlKCkpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBbXS5jb25jYXQuYXBwbHkoW10sIEFycmF5LmFwcGx5KG51bGwsIEFycmF5KC1uLnRvSlNOdW1iZXIoKSkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoQXJyYXkucHJvdG90eXBlLnZhbHVlT2YsIFsxLCAwXSlcclxuICAgICAgICAgICAgICAgICAgICApLFxyXG4gICAgICAgICAgICAgICAgICAgIGlzTmVnYXRpdmU6IGZhbHNlXHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdmFyIGFyciA9IEFycmF5LmFwcGx5KG51bGwsIEFycmF5KG4udG9KU051bWJlcigpIC0gMSkpXHJcbiAgICAgICAgICAgICAgICAubWFwKEFycmF5LnByb3RvdHlwZS52YWx1ZU9mLCBbMCwgMV0pO1xyXG4gICAgICAgICAgICBhcnIudW5zaGlmdChbMV0pO1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgdmFsdWU6IFtdLmNvbmNhdC5hcHBseShbXSwgYXJyKSxcclxuICAgICAgICAgICAgICAgIGlzTmVnYXRpdmU6IGZhbHNlXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgbmVnID0gZmFsc2U7XHJcbiAgICAgICAgaWYgKG4uaXNOZWdhdGl2ZSgpICYmIGJhc2UuaXNQb3NpdGl2ZSgpKSB7XHJcbiAgICAgICAgICAgIG5lZyA9IHRydWU7XHJcbiAgICAgICAgICAgIG4gPSBuLmFicygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoYmFzZS5pc1VuaXQoKSkge1xyXG4gICAgICAgICAgICBpZiAobi5pc1plcm8oKSkgcmV0dXJuIHsgdmFsdWU6IFswXSwgaXNOZWdhdGl2ZTogZmFsc2UgfTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogQXJyYXkuYXBwbHkobnVsbCwgQXJyYXkobi50b0pTTnVtYmVyKCkpKVxyXG4gICAgICAgICAgICAgICAgICAgIC5tYXAoTnVtYmVyLnByb3RvdHlwZS52YWx1ZU9mLCAxKSxcclxuICAgICAgICAgICAgICAgIGlzTmVnYXRpdmU6IG5lZ1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgb3V0ID0gW107XHJcbiAgICAgICAgdmFyIGxlZnQgPSBuLCBkaXZtb2Q7XHJcbiAgICAgICAgd2hpbGUgKGxlZnQuaXNOZWdhdGl2ZSgpIHx8IGxlZnQuY29tcGFyZUFicyhiYXNlKSA+PSAwKSB7XHJcbiAgICAgICAgICAgIGRpdm1vZCA9IGxlZnQuZGl2bW9kKGJhc2UpO1xyXG4gICAgICAgICAgICBsZWZ0ID0gZGl2bW9kLnF1b3RpZW50O1xyXG4gICAgICAgICAgICB2YXIgZGlnaXQgPSBkaXZtb2QucmVtYWluZGVyO1xyXG4gICAgICAgICAgICBpZiAoZGlnaXQuaXNOZWdhdGl2ZSgpKSB7XHJcbiAgICAgICAgICAgICAgICBkaWdpdCA9IGJhc2UubWludXMoZGlnaXQpLmFicygpO1xyXG4gICAgICAgICAgICAgICAgbGVmdCA9IGxlZnQubmV4dCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG91dC5wdXNoKGRpZ2l0LnRvSlNOdW1iZXIoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG91dC5wdXNoKGxlZnQudG9KU051bWJlcigpKTtcclxuICAgICAgICByZXR1cm4geyB2YWx1ZTogb3V0LnJldmVyc2UoKSwgaXNOZWdhdGl2ZTogbmVnIH07XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gdG9CYXNlU3RyaW5nKG4sIGJhc2UsIGFscGhhYmV0KSB7XHJcbiAgICAgICAgdmFyIGFyciA9IHRvQmFzZShuLCBiYXNlKTtcclxuICAgICAgICByZXR1cm4gKGFyci5pc05lZ2F0aXZlID8gXCItXCIgOiBcIlwiKSArIGFyci52YWx1ZS5tYXAoZnVuY3Rpb24gKHgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHN0cmluZ2lmeSh4LCBhbHBoYWJldCk7XHJcbiAgICAgICAgfSkuam9pbignJyk7XHJcbiAgICB9XHJcblxyXG4gICAgQmlnSW50ZWdlci5wcm90b3R5cGUudG9BcnJheSA9IGZ1bmN0aW9uIChyYWRpeCkge1xyXG4gICAgICAgIHJldHVybiB0b0Jhc2UodGhpcywgcmFkaXgpO1xyXG4gICAgfTtcclxuXHJcbiAgICBTbWFsbEludGVnZXIucHJvdG90eXBlLnRvQXJyYXkgPSBmdW5jdGlvbiAocmFkaXgpIHtcclxuICAgICAgICByZXR1cm4gdG9CYXNlKHRoaXMsIHJhZGl4KTtcclxuICAgIH07XHJcblxyXG4gICAgTmF0aXZlQmlnSW50LnByb3RvdHlwZS50b0FycmF5ID0gZnVuY3Rpb24gKHJhZGl4KSB7XHJcbiAgICAgICAgcmV0dXJuIHRvQmFzZSh0aGlzLCByYWRpeCk7XHJcbiAgICB9O1xyXG5cclxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKHJhZGl4LCBhbHBoYWJldCkge1xyXG4gICAgICAgIGlmIChyYWRpeCA9PT0gdW5kZWZpbmVkKSByYWRpeCA9IDEwO1xyXG4gICAgICAgIGlmIChyYWRpeCAhPT0gMTApIHJldHVybiB0b0Jhc2VTdHJpbmcodGhpcywgcmFkaXgsIGFscGhhYmV0KTtcclxuICAgICAgICB2YXIgdiA9IHRoaXMudmFsdWUsIGwgPSB2Lmxlbmd0aCwgc3RyID0gU3RyaW5nKHZbLS1sXSksIHplcm9zID0gXCIwMDAwMDAwXCIsIGRpZ2l0O1xyXG4gICAgICAgIHdoaWxlICgtLWwgPj0gMCkge1xyXG4gICAgICAgICAgICBkaWdpdCA9IFN0cmluZyh2W2xdKTtcclxuICAgICAgICAgICAgc3RyICs9IHplcm9zLnNsaWNlKGRpZ2l0Lmxlbmd0aCkgKyBkaWdpdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHNpZ24gPSB0aGlzLnNpZ24gPyBcIi1cIiA6IFwiXCI7XHJcbiAgICAgICAgcmV0dXJuIHNpZ24gKyBzdHI7XHJcbiAgICB9O1xyXG5cclxuICAgIFNtYWxsSW50ZWdlci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAocmFkaXgsIGFscGhhYmV0KSB7XHJcbiAgICAgICAgaWYgKHJhZGl4ID09PSB1bmRlZmluZWQpIHJhZGl4ID0gMTA7XHJcbiAgICAgICAgaWYgKHJhZGl4ICE9IDEwKSByZXR1cm4gdG9CYXNlU3RyaW5nKHRoaXMsIHJhZGl4LCBhbHBoYWJldCk7XHJcbiAgICAgICAgcmV0dXJuIFN0cmluZyh0aGlzLnZhbHVlKTtcclxuICAgIH07XHJcblxyXG4gICAgTmF0aXZlQmlnSW50LnByb3RvdHlwZS50b1N0cmluZyA9IFNtYWxsSW50ZWdlci5wcm90b3R5cGUudG9TdHJpbmc7XHJcblxyXG4gICAgTmF0aXZlQmlnSW50LnByb3RvdHlwZS50b0pTT04gPSBCaWdJbnRlZ2VyLnByb3RvdHlwZS50b0pTT04gPSBTbWFsbEludGVnZXIucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMudG9TdHJpbmcoKTsgfVxyXG5cclxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLnZhbHVlT2YgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHBhcnNlSW50KHRoaXMudG9TdHJpbmcoKSwgMTApO1xyXG4gICAgfTtcclxuICAgIEJpZ0ludGVnZXIucHJvdG90eXBlLnRvSlNOdW1iZXIgPSBCaWdJbnRlZ2VyLnByb3RvdHlwZS52YWx1ZU9mO1xyXG5cclxuICAgIFNtYWxsSW50ZWdlci5wcm90b3R5cGUudmFsdWVPZiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy52YWx1ZTtcclxuICAgIH07XHJcbiAgICBTbWFsbEludGVnZXIucHJvdG90eXBlLnRvSlNOdW1iZXIgPSBTbWFsbEludGVnZXIucHJvdG90eXBlLnZhbHVlT2Y7XHJcbiAgICBOYXRpdmVCaWdJbnQucHJvdG90eXBlLnZhbHVlT2YgPSBOYXRpdmVCaWdJbnQucHJvdG90eXBlLnRvSlNOdW1iZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHBhcnNlSW50KHRoaXMudG9TdHJpbmcoKSwgMTApO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBhcnNlU3RyaW5nVmFsdWUodikge1xyXG4gICAgICAgIGlmIChpc1ByZWNpc2UoK3YpKSB7XHJcbiAgICAgICAgICAgIHZhciB4ID0gK3Y7XHJcbiAgICAgICAgICAgIGlmICh4ID09PSB0cnVuY2F0ZSh4KSlcclxuICAgICAgICAgICAgICAgIHJldHVybiBzdXBwb3J0c05hdGl2ZUJpZ0ludCA/IG5ldyBOYXRpdmVCaWdJbnQoQmlnSW50KHgpKSA6IG5ldyBTbWFsbEludGVnZXIoeCk7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgaW50ZWdlcjogXCIgKyB2KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHNpZ24gPSB2WzBdID09PSBcIi1cIjtcclxuICAgICAgICBpZiAoc2lnbikgdiA9IHYuc2xpY2UoMSk7XHJcbiAgICAgICAgdmFyIHNwbGl0ID0gdi5zcGxpdCgvZS9pKTtcclxuICAgICAgICBpZiAoc3BsaXQubGVuZ3RoID4gMikgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBpbnRlZ2VyOiBcIiArIHNwbGl0LmpvaW4oXCJlXCIpKTtcclxuICAgICAgICBpZiAoc3BsaXQubGVuZ3RoID09PSAyKSB7XHJcbiAgICAgICAgICAgIHZhciBleHAgPSBzcGxpdFsxXTtcclxuICAgICAgICAgICAgaWYgKGV4cFswXSA9PT0gXCIrXCIpIGV4cCA9IGV4cC5zbGljZSgxKTtcclxuICAgICAgICAgICAgZXhwID0gK2V4cDtcclxuICAgICAgICAgICAgaWYgKGV4cCAhPT0gdHJ1bmNhdGUoZXhwKSB8fCAhaXNQcmVjaXNlKGV4cCkpIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgaW50ZWdlcjogXCIgKyBleHAgKyBcIiBpcyBub3QgYSB2YWxpZCBleHBvbmVudC5cIik7XHJcbiAgICAgICAgICAgIHZhciB0ZXh0ID0gc3BsaXRbMF07XHJcbiAgICAgICAgICAgIHZhciBkZWNpbWFsUGxhY2UgPSB0ZXh0LmluZGV4T2YoXCIuXCIpO1xyXG4gICAgICAgICAgICBpZiAoZGVjaW1hbFBsYWNlID49IDApIHtcclxuICAgICAgICAgICAgICAgIGV4cCAtPSB0ZXh0Lmxlbmd0aCAtIGRlY2ltYWxQbGFjZSAtIDE7XHJcbiAgICAgICAgICAgICAgICB0ZXh0ID0gdGV4dC5zbGljZSgwLCBkZWNpbWFsUGxhY2UpICsgdGV4dC5zbGljZShkZWNpbWFsUGxhY2UgKyAxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZXhwIDwgMCkgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGluY2x1ZGUgbmVnYXRpdmUgZXhwb25lbnQgcGFydCBmb3IgaW50ZWdlcnNcIik7XHJcbiAgICAgICAgICAgIHRleHQgKz0gKG5ldyBBcnJheShleHAgKyAxKSkuam9pbihcIjBcIik7XHJcbiAgICAgICAgICAgIHYgPSB0ZXh0O1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgaXNWYWxpZCA9IC9eKFswLTldWzAtOV0qKSQvLnRlc3Qodik7XHJcbiAgICAgICAgaWYgKCFpc1ZhbGlkKSB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGludGVnZXI6IFwiICsgdik7XHJcbiAgICAgICAgaWYgKHN1cHBvcnRzTmF0aXZlQmlnSW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgTmF0aXZlQmlnSW50KEJpZ0ludChzaWduID8gXCItXCIgKyB2IDogdikpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgciA9IFtdLCBtYXggPSB2Lmxlbmd0aCwgbCA9IExPR19CQVNFLCBtaW4gPSBtYXggLSBsO1xyXG4gICAgICAgIHdoaWxlIChtYXggPiAwKSB7XHJcbiAgICAgICAgICAgIHIucHVzaCgrdi5zbGljZShtaW4sIG1heCkpO1xyXG4gICAgICAgICAgICBtaW4gLT0gbDtcclxuICAgICAgICAgICAgaWYgKG1pbiA8IDApIG1pbiA9IDA7XHJcbiAgICAgICAgICAgIG1heCAtPSBsO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0cmltKHIpO1xyXG4gICAgICAgIHJldHVybiBuZXcgQmlnSW50ZWdlcihyLCBzaWduKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwYXJzZU51bWJlclZhbHVlKHYpIHtcclxuICAgICAgICBpZiAoc3VwcG9ydHNOYXRpdmVCaWdJbnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBOYXRpdmVCaWdJbnQoQmlnSW50KHYpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGlzUHJlY2lzZSh2KSkge1xyXG4gICAgICAgICAgICBpZiAodiAhPT0gdHJ1bmNhdGUodikpIHRocm93IG5ldyBFcnJvcih2ICsgXCIgaXMgbm90IGFuIGludGVnZXIuXCIpO1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFNtYWxsSW50ZWdlcih2KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHBhcnNlU3RyaW5nVmFsdWUodi50b1N0cmluZygpKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwYXJzZVZhbHVlKHYpIHtcclxuICAgICAgICBpZiAodHlwZW9mIHYgPT09IFwibnVtYmVyXCIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHBhcnNlTnVtYmVyVmFsdWUodik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0eXBlb2YgdiA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICByZXR1cm4gcGFyc2VTdHJpbmdWYWx1ZSh2KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHR5cGVvZiB2ID09PSBcImJpZ2ludFwiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgTmF0aXZlQmlnSW50KHYpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdjtcclxuICAgIH1cclxuICAgIC8vIFByZS1kZWZpbmUgbnVtYmVycyBpbiByYW5nZSBbLTk5OSw5OTldXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDEwMDA7IGkrKykge1xyXG4gICAgICAgIEludGVnZXJbaV0gPSBwYXJzZVZhbHVlKGkpO1xyXG4gICAgICAgIGlmIChpID4gMCkgSW50ZWdlclstaV0gPSBwYXJzZVZhbHVlKC1pKTtcclxuICAgIH1cclxuICAgIC8vIEJhY2t3YXJkcyBjb21wYXRpYmlsaXR5XHJcbiAgICBJbnRlZ2VyLm9uZSA9IEludGVnZXJbMV07XHJcbiAgICBJbnRlZ2VyLnplcm8gPSBJbnRlZ2VyWzBdO1xyXG4gICAgSW50ZWdlci5taW51c09uZSA9IEludGVnZXJbLTFdO1xyXG4gICAgSW50ZWdlci5tYXggPSBtYXg7XHJcbiAgICBJbnRlZ2VyLm1pbiA9IG1pbjtcclxuICAgIEludGVnZXIuZ2NkID0gZ2NkO1xyXG4gICAgSW50ZWdlci5sY20gPSBsY207XHJcbiAgICBJbnRlZ2VyLmlzSW5zdGFuY2UgPSBmdW5jdGlvbiAoeCkgeyByZXR1cm4geCBpbnN0YW5jZW9mIEJpZ0ludGVnZXIgfHwgeCBpbnN0YW5jZW9mIFNtYWxsSW50ZWdlciB8fCB4IGluc3RhbmNlb2YgTmF0aXZlQmlnSW50OyB9O1xyXG4gICAgSW50ZWdlci5yYW5kQmV0d2VlbiA9IHJhbmRCZXR3ZWVuO1xyXG5cclxuICAgIEludGVnZXIuZnJvbUFycmF5ID0gZnVuY3Rpb24gKGRpZ2l0cywgYmFzZSwgaXNOZWdhdGl2ZSkge1xyXG4gICAgICAgIHJldHVybiBwYXJzZUJhc2VGcm9tQXJyYXkoZGlnaXRzLm1hcChwYXJzZVZhbHVlKSwgcGFyc2VWYWx1ZShiYXNlIHx8IDEwKSwgaXNOZWdhdGl2ZSk7XHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiBJbnRlZ2VyO1xyXG59KSgpO1xyXG5cclxuLy8gTm9kZS5qcyBjaGVja1xyXG5pZiAodHlwZW9mIG1vZHVsZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBtb2R1bGUuaGFzT3duUHJvcGVydHkoXCJleHBvcnRzXCIpKSB7XHJcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGJpZ0ludDtcclxufVxyXG5cclxuLy9hbWQgY2hlY2tcclxuaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XHJcbiAgICBkZWZpbmUoIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gYmlnSW50O1xyXG4gICAgfSk7XHJcbn1cclxuIiwiLyohXG4gKiBUaGUgYnVmZmVyIG1vZHVsZSBmcm9tIG5vZGUuanMsIGZvciB0aGUgYnJvd3Nlci5cbiAqXG4gKiBAYXV0aG9yICAgRmVyb3NzIEFib3VraGFkaWplaCA8aHR0cHM6Ly9mZXJvc3Mub3JnPlxuICogQGxpY2Vuc2UgIE1JVFxuICovXG4vKiBlc2xpbnQtZGlzYWJsZSBuby1wcm90byAqL1xuXG4ndXNlIHN0cmljdCdcblxudmFyIGJhc2U2NCA9IHJlcXVpcmUoJ2Jhc2U2NC1qcycpXG52YXIgaWVlZTc1NCA9IHJlcXVpcmUoJ2llZWU3NTQnKVxuXG5leHBvcnRzLkJ1ZmZlciA9IEJ1ZmZlclxuZXhwb3J0cy5TbG93QnVmZmVyID0gU2xvd0J1ZmZlclxuZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFUyA9IDUwXG5cbnZhciBLX01BWF9MRU5HVEggPSAweDdmZmZmZmZmXG5leHBvcnRzLmtNYXhMZW5ndGggPSBLX01BWF9MRU5HVEhcblxuLyoqXG4gKiBJZiBgQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlRgOlxuICogICA9PT0gdHJ1ZSAgICBVc2UgVWludDhBcnJheSBpbXBsZW1lbnRhdGlvbiAoZmFzdGVzdClcbiAqICAgPT09IGZhbHNlICAgUHJpbnQgd2FybmluZyBhbmQgcmVjb21tZW5kIHVzaW5nIGBidWZmZXJgIHY0Lnggd2hpY2ggaGFzIGFuIE9iamVjdFxuICogICAgICAgICAgICAgICBpbXBsZW1lbnRhdGlvbiAobW9zdCBjb21wYXRpYmxlLCBldmVuIElFNilcbiAqXG4gKiBCcm93c2VycyB0aGF0IHN1cHBvcnQgdHlwZWQgYXJyYXlzIGFyZSBJRSAxMCssIEZpcmVmb3ggNCssIENocm9tZSA3KywgU2FmYXJpIDUuMSssXG4gKiBPcGVyYSAxMS42KywgaU9TIDQuMisuXG4gKlxuICogV2UgcmVwb3J0IHRoYXQgdGhlIGJyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCB0eXBlZCBhcnJheXMgaWYgdGhlIGFyZSBub3Qgc3ViY2xhc3NhYmxlXG4gKiB1c2luZyBfX3Byb3RvX18uIEZpcmVmb3ggNC0yOSBsYWNrcyBzdXBwb3J0IGZvciBhZGRpbmcgbmV3IHByb3BlcnRpZXMgdG8gYFVpbnQ4QXJyYXlgXG4gKiAoU2VlOiBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD02OTU0MzgpLiBJRSAxMCBsYWNrcyBzdXBwb3J0XG4gKiBmb3IgX19wcm90b19fIGFuZCBoYXMgYSBidWdneSB0eXBlZCBhcnJheSBpbXBsZW1lbnRhdGlvbi5cbiAqL1xuQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQgPSB0eXBlZEFycmF5U3VwcG9ydCgpXG5cbmlmICghQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQgJiYgdHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnICYmXG4gICAgdHlwZW9mIGNvbnNvbGUuZXJyb3IgPT09ICdmdW5jdGlvbicpIHtcbiAgY29uc29sZS5lcnJvcihcbiAgICAnVGhpcyBicm93c2VyIGxhY2tzIHR5cGVkIGFycmF5IChVaW50OEFycmF5KSBzdXBwb3J0IHdoaWNoIGlzIHJlcXVpcmVkIGJ5ICcgK1xuICAgICdgYnVmZmVyYCB2NS54LiBVc2UgYGJ1ZmZlcmAgdjQueCBpZiB5b3UgcmVxdWlyZSBvbGQgYnJvd3NlciBzdXBwb3J0LidcbiAgKVxufVxuXG5mdW5jdGlvbiB0eXBlZEFycmF5U3VwcG9ydCAoKSB7XG4gIC8vIENhbiB0eXBlZCBhcnJheSBpbnN0YW5jZXMgY2FuIGJlIGF1Z21lbnRlZD9cbiAgdHJ5IHtcbiAgICB2YXIgYXJyID0gbmV3IFVpbnQ4QXJyYXkoMSlcbiAgICBhcnIuX19wcm90b19fID0geyBfX3Byb3RvX186IFVpbnQ4QXJyYXkucHJvdG90eXBlLCBmb286IGZ1bmN0aW9uICgpIHsgcmV0dXJuIDQyIH0gfVxuICAgIHJldHVybiBhcnIuZm9vKCkgPT09IDQyXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoQnVmZmVyLnByb3RvdHlwZSwgJ3BhcmVudCcsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCFCdWZmZXIuaXNCdWZmZXIodGhpcykpIHJldHVybiB1bmRlZmluZWRcbiAgICByZXR1cm4gdGhpcy5idWZmZXJcbiAgfVxufSlcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KEJ1ZmZlci5wcm90b3R5cGUsICdvZmZzZXQnLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIGlmICghQnVmZmVyLmlzQnVmZmVyKHRoaXMpKSByZXR1cm4gdW5kZWZpbmVkXG4gICAgcmV0dXJuIHRoaXMuYnl0ZU9mZnNldFxuICB9XG59KVxuXG5mdW5jdGlvbiBjcmVhdGVCdWZmZXIgKGxlbmd0aCkge1xuICBpZiAobGVuZ3RoID4gS19NQVhfTEVOR1RIKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1RoZSB2YWx1ZSBcIicgKyBsZW5ndGggKyAnXCIgaXMgaW52YWxpZCBmb3Igb3B0aW9uIFwic2l6ZVwiJylcbiAgfVxuICAvLyBSZXR1cm4gYW4gYXVnbWVudGVkIGBVaW50OEFycmF5YCBpbnN0YW5jZVxuICB2YXIgYnVmID0gbmV3IFVpbnQ4QXJyYXkobGVuZ3RoKVxuICBidWYuX19wcm90b19fID0gQnVmZmVyLnByb3RvdHlwZVxuICByZXR1cm4gYnVmXG59XG5cbi8qKlxuICogVGhlIEJ1ZmZlciBjb25zdHJ1Y3RvciByZXR1cm5zIGluc3RhbmNlcyBvZiBgVWludDhBcnJheWAgdGhhdCBoYXZlIHRoZWlyXG4gKiBwcm90b3R5cGUgY2hhbmdlZCB0byBgQnVmZmVyLnByb3RvdHlwZWAuIEZ1cnRoZXJtb3JlLCBgQnVmZmVyYCBpcyBhIHN1YmNsYXNzIG9mXG4gKiBgVWludDhBcnJheWAsIHNvIHRoZSByZXR1cm5lZCBpbnN0YW5jZXMgd2lsbCBoYXZlIGFsbCB0aGUgbm9kZSBgQnVmZmVyYCBtZXRob2RzXG4gKiBhbmQgdGhlIGBVaW50OEFycmF5YCBtZXRob2RzLiBTcXVhcmUgYnJhY2tldCBub3RhdGlvbiB3b3JrcyBhcyBleHBlY3RlZCAtLSBpdFxuICogcmV0dXJucyBhIHNpbmdsZSBvY3RldC5cbiAqXG4gKiBUaGUgYFVpbnQ4QXJyYXlgIHByb3RvdHlwZSByZW1haW5zIHVubW9kaWZpZWQuXG4gKi9cblxuZnVuY3Rpb24gQnVmZmVyIChhcmcsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aCkge1xuICAvLyBDb21tb24gY2FzZS5cbiAgaWYgKHR5cGVvZiBhcmcgPT09ICdudW1iZXInKSB7XG4gICAgaWYgKHR5cGVvZiBlbmNvZGluZ09yT2Zmc2V0ID09PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgJ1RoZSBcInN0cmluZ1wiIGFyZ3VtZW50IG11c3QgYmUgb2YgdHlwZSBzdHJpbmcuIFJlY2VpdmVkIHR5cGUgbnVtYmVyJ1xuICAgICAgKVxuICAgIH1cbiAgICByZXR1cm4gYWxsb2NVbnNhZmUoYXJnKVxuICB9XG4gIHJldHVybiBmcm9tKGFyZywgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKVxufVxuXG4vLyBGaXggc3ViYXJyYXkoKSBpbiBFUzIwMTYuIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXIvcHVsbC85N1xuaWYgKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC5zcGVjaWVzICE9IG51bGwgJiZcbiAgICBCdWZmZXJbU3ltYm9sLnNwZWNpZXNdID09PSBCdWZmZXIpIHtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEJ1ZmZlciwgU3ltYm9sLnNwZWNpZXMsIHtcbiAgICB2YWx1ZTogbnVsbCxcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgd3JpdGFibGU6IGZhbHNlXG4gIH0pXG59XG5cbkJ1ZmZlci5wb29sU2l6ZSA9IDgxOTIgLy8gbm90IHVzZWQgYnkgdGhpcyBpbXBsZW1lbnRhdGlvblxuXG5mdW5jdGlvbiBmcm9tICh2YWx1ZSwgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKSB7XG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIGZyb21TdHJpbmcodmFsdWUsIGVuY29kaW5nT3JPZmZzZXQpXG4gIH1cblxuICBpZiAoQXJyYXlCdWZmZXIuaXNWaWV3KHZhbHVlKSkge1xuICAgIHJldHVybiBmcm9tQXJyYXlMaWtlKHZhbHVlKVxuICB9XG5cbiAgaWYgKHZhbHVlID09IG51bGwpIHtcbiAgICB0aHJvdyBUeXBlRXJyb3IoXG4gICAgICAnVGhlIGZpcnN0IGFyZ3VtZW50IG11c3QgYmUgb25lIG9mIHR5cGUgc3RyaW5nLCBCdWZmZXIsIEFycmF5QnVmZmVyLCBBcnJheSwgJyArXG4gICAgICAnb3IgQXJyYXktbGlrZSBPYmplY3QuIFJlY2VpdmVkIHR5cGUgJyArICh0eXBlb2YgdmFsdWUpXG4gICAgKVxuICB9XG5cbiAgaWYgKGlzSW5zdGFuY2UodmFsdWUsIEFycmF5QnVmZmVyKSB8fFxuICAgICAgKHZhbHVlICYmIGlzSW5zdGFuY2UodmFsdWUuYnVmZmVyLCBBcnJheUJ1ZmZlcikpKSB7XG4gICAgcmV0dXJuIGZyb21BcnJheUJ1ZmZlcih2YWx1ZSwgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKVxuICB9XG5cbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgJ1RoZSBcInZhbHVlXCIgYXJndW1lbnQgbXVzdCBub3QgYmUgb2YgdHlwZSBudW1iZXIuIFJlY2VpdmVkIHR5cGUgbnVtYmVyJ1xuICAgIClcbiAgfVxuXG4gIHZhciB2YWx1ZU9mID0gdmFsdWUudmFsdWVPZiAmJiB2YWx1ZS52YWx1ZU9mKClcbiAgaWYgKHZhbHVlT2YgIT0gbnVsbCAmJiB2YWx1ZU9mICE9PSB2YWx1ZSkge1xuICAgIHJldHVybiBCdWZmZXIuZnJvbSh2YWx1ZU9mLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpXG4gIH1cblxuICB2YXIgYiA9IGZyb21PYmplY3QodmFsdWUpXG4gIGlmIChiKSByZXR1cm4gYlxuXG4gIGlmICh0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9QcmltaXRpdmUgIT0gbnVsbCAmJlxuICAgICAgdHlwZW9mIHZhbHVlW1N5bWJvbC50b1ByaW1pdGl2ZV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gQnVmZmVyLmZyb20oXG4gICAgICB2YWx1ZVtTeW1ib2wudG9QcmltaXRpdmVdKCdzdHJpbmcnKSwgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoXG4gICAgKVxuICB9XG5cbiAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAnVGhlIGZpcnN0IGFyZ3VtZW50IG11c3QgYmUgb25lIG9mIHR5cGUgc3RyaW5nLCBCdWZmZXIsIEFycmF5QnVmZmVyLCBBcnJheSwgJyArXG4gICAgJ29yIEFycmF5LWxpa2UgT2JqZWN0LiBSZWNlaXZlZCB0eXBlICcgKyAodHlwZW9mIHZhbHVlKVxuICApXG59XG5cbi8qKlxuICogRnVuY3Rpb25hbGx5IGVxdWl2YWxlbnQgdG8gQnVmZmVyKGFyZywgZW5jb2RpbmcpIGJ1dCB0aHJvd3MgYSBUeXBlRXJyb3JcbiAqIGlmIHZhbHVlIGlzIGEgbnVtYmVyLlxuICogQnVmZmVyLmZyb20oc3RyWywgZW5jb2RpbmddKVxuICogQnVmZmVyLmZyb20oYXJyYXkpXG4gKiBCdWZmZXIuZnJvbShidWZmZXIpXG4gKiBCdWZmZXIuZnJvbShhcnJheUJ1ZmZlclssIGJ5dGVPZmZzZXRbLCBsZW5ndGhdXSlcbiAqKi9cbkJ1ZmZlci5mcm9tID0gZnVuY3Rpb24gKHZhbHVlLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGZyb20odmFsdWUsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aClcbn1cblxuLy8gTm90ZTogQ2hhbmdlIHByb3RvdHlwZSAqYWZ0ZXIqIEJ1ZmZlci5mcm9tIGlzIGRlZmluZWQgdG8gd29ya2Fyb3VuZCBDaHJvbWUgYnVnOlxuLy8gaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXIvcHVsbC8xNDhcbkJ1ZmZlci5wcm90b3R5cGUuX19wcm90b19fID0gVWludDhBcnJheS5wcm90b3R5cGVcbkJ1ZmZlci5fX3Byb3RvX18gPSBVaW50OEFycmF5XG5cbmZ1bmN0aW9uIGFzc2VydFNpemUgKHNpemUpIHtcbiAgaWYgKHR5cGVvZiBzaXplICE9PSAnbnVtYmVyJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wic2l6ZVwiIGFyZ3VtZW50IG11c3QgYmUgb2YgdHlwZSBudW1iZXInKVxuICB9IGVsc2UgaWYgKHNpemUgPCAwKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1RoZSB2YWx1ZSBcIicgKyBzaXplICsgJ1wiIGlzIGludmFsaWQgZm9yIG9wdGlvbiBcInNpemVcIicpXG4gIH1cbn1cblxuZnVuY3Rpb24gYWxsb2MgKHNpemUsIGZpbGwsIGVuY29kaW5nKSB7XG4gIGFzc2VydFNpemUoc2l6ZSlcbiAgaWYgKHNpemUgPD0gMCkge1xuICAgIHJldHVybiBjcmVhdGVCdWZmZXIoc2l6ZSlcbiAgfVxuICBpZiAoZmlsbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgLy8gT25seSBwYXkgYXR0ZW50aW9uIHRvIGVuY29kaW5nIGlmIGl0J3MgYSBzdHJpbmcuIFRoaXNcbiAgICAvLyBwcmV2ZW50cyBhY2NpZGVudGFsbHkgc2VuZGluZyBpbiBhIG51bWJlciB0aGF0IHdvdWxkXG4gICAgLy8gYmUgaW50ZXJwcmV0dGVkIGFzIGEgc3RhcnQgb2Zmc2V0LlxuICAgIHJldHVybiB0eXBlb2YgZW5jb2RpbmcgPT09ICdzdHJpbmcnXG4gICAgICA/IGNyZWF0ZUJ1ZmZlcihzaXplKS5maWxsKGZpbGwsIGVuY29kaW5nKVxuICAgICAgOiBjcmVhdGVCdWZmZXIoc2l6ZSkuZmlsbChmaWxsKVxuICB9XG4gIHJldHVybiBjcmVhdGVCdWZmZXIoc2l6ZSlcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGZpbGxlZCBCdWZmZXIgaW5zdGFuY2UuXG4gKiBhbGxvYyhzaXplWywgZmlsbFssIGVuY29kaW5nXV0pXG4gKiovXG5CdWZmZXIuYWxsb2MgPSBmdW5jdGlvbiAoc2l6ZSwgZmlsbCwgZW5jb2RpbmcpIHtcbiAgcmV0dXJuIGFsbG9jKHNpemUsIGZpbGwsIGVuY29kaW5nKVxufVxuXG5mdW5jdGlvbiBhbGxvY1Vuc2FmZSAoc2l6ZSkge1xuICBhc3NlcnRTaXplKHNpemUpXG4gIHJldHVybiBjcmVhdGVCdWZmZXIoc2l6ZSA8IDAgPyAwIDogY2hlY2tlZChzaXplKSB8IDApXG59XG5cbi8qKlxuICogRXF1aXZhbGVudCB0byBCdWZmZXIobnVtKSwgYnkgZGVmYXVsdCBjcmVhdGVzIGEgbm9uLXplcm8tZmlsbGVkIEJ1ZmZlciBpbnN0YW5jZS5cbiAqICovXG5CdWZmZXIuYWxsb2NVbnNhZmUgPSBmdW5jdGlvbiAoc2l6ZSkge1xuICByZXR1cm4gYWxsb2NVbnNhZmUoc2l6ZSlcbn1cbi8qKlxuICogRXF1aXZhbGVudCB0byBTbG93QnVmZmVyKG51bSksIGJ5IGRlZmF1bHQgY3JlYXRlcyBhIG5vbi16ZXJvLWZpbGxlZCBCdWZmZXIgaW5zdGFuY2UuXG4gKi9cbkJ1ZmZlci5hbGxvY1Vuc2FmZVNsb3cgPSBmdW5jdGlvbiAoc2l6ZSkge1xuICByZXR1cm4gYWxsb2NVbnNhZmUoc2l6ZSlcbn1cblxuZnVuY3Rpb24gZnJvbVN0cmluZyAoc3RyaW5nLCBlbmNvZGluZykge1xuICBpZiAodHlwZW9mIGVuY29kaW5nICE9PSAnc3RyaW5nJyB8fCBlbmNvZGluZyA9PT0gJycpIHtcbiAgICBlbmNvZGluZyA9ICd1dGY4J1xuICB9XG5cbiAgaWYgKCFCdWZmZXIuaXNFbmNvZGluZyhlbmNvZGluZykpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdVbmtub3duIGVuY29kaW5nOiAnICsgZW5jb2RpbmcpXG4gIH1cblxuICB2YXIgbGVuZ3RoID0gYnl0ZUxlbmd0aChzdHJpbmcsIGVuY29kaW5nKSB8IDBcbiAgdmFyIGJ1ZiA9IGNyZWF0ZUJ1ZmZlcihsZW5ndGgpXG5cbiAgdmFyIGFjdHVhbCA9IGJ1Zi53cml0ZShzdHJpbmcsIGVuY29kaW5nKVxuXG4gIGlmIChhY3R1YWwgIT09IGxlbmd0aCkge1xuICAgIC8vIFdyaXRpbmcgYSBoZXggc3RyaW5nLCBmb3IgZXhhbXBsZSwgdGhhdCBjb250YWlucyBpbnZhbGlkIGNoYXJhY3RlcnMgd2lsbFxuICAgIC8vIGNhdXNlIGV2ZXJ5dGhpbmcgYWZ0ZXIgdGhlIGZpcnN0IGludmFsaWQgY2hhcmFjdGVyIHRvIGJlIGlnbm9yZWQuIChlLmcuXG4gICAgLy8gJ2FieHhjZCcgd2lsbCBiZSB0cmVhdGVkIGFzICdhYicpXG4gICAgYnVmID0gYnVmLnNsaWNlKDAsIGFjdHVhbClcbiAgfVxuXG4gIHJldHVybiBidWZcbn1cblxuZnVuY3Rpb24gZnJvbUFycmF5TGlrZSAoYXJyYXkpIHtcbiAgdmFyIGxlbmd0aCA9IGFycmF5Lmxlbmd0aCA8IDAgPyAwIDogY2hlY2tlZChhcnJheS5sZW5ndGgpIHwgMFxuICB2YXIgYnVmID0gY3JlYXRlQnVmZmVyKGxlbmd0aClcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkgKz0gMSkge1xuICAgIGJ1ZltpXSA9IGFycmF5W2ldICYgMjU1XG4gIH1cbiAgcmV0dXJuIGJ1ZlxufVxuXG5mdW5jdGlvbiBmcm9tQXJyYXlCdWZmZXIgKGFycmF5LCBieXRlT2Zmc2V0LCBsZW5ndGgpIHtcbiAgaWYgKGJ5dGVPZmZzZXQgPCAwIHx8IGFycmF5LmJ5dGVMZW5ndGggPCBieXRlT2Zmc2V0KSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1wib2Zmc2V0XCIgaXMgb3V0c2lkZSBvZiBidWZmZXIgYm91bmRzJylcbiAgfVxuXG4gIGlmIChhcnJheS5ieXRlTGVuZ3RoIDwgYnl0ZU9mZnNldCArIChsZW5ndGggfHwgMCkpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignXCJsZW5ndGhcIiBpcyBvdXRzaWRlIG9mIGJ1ZmZlciBib3VuZHMnKVxuICB9XG5cbiAgdmFyIGJ1ZlxuICBpZiAoYnl0ZU9mZnNldCA9PT0gdW5kZWZpbmVkICYmIGxlbmd0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgYnVmID0gbmV3IFVpbnQ4QXJyYXkoYXJyYXkpXG4gIH0gZWxzZSBpZiAobGVuZ3RoID09PSB1bmRlZmluZWQpIHtcbiAgICBidWYgPSBuZXcgVWludDhBcnJheShhcnJheSwgYnl0ZU9mZnNldClcbiAgfSBlbHNlIHtcbiAgICBidWYgPSBuZXcgVWludDhBcnJheShhcnJheSwgYnl0ZU9mZnNldCwgbGVuZ3RoKVxuICB9XG5cbiAgLy8gUmV0dXJuIGFuIGF1Z21lbnRlZCBgVWludDhBcnJheWAgaW5zdGFuY2VcbiAgYnVmLl9fcHJvdG9fXyA9IEJ1ZmZlci5wcm90b3R5cGVcbiAgcmV0dXJuIGJ1ZlxufVxuXG5mdW5jdGlvbiBmcm9tT2JqZWN0IChvYmopIHtcbiAgaWYgKEJ1ZmZlci5pc0J1ZmZlcihvYmopKSB7XG4gICAgdmFyIGxlbiA9IGNoZWNrZWQob2JqLmxlbmd0aCkgfCAwXG4gICAgdmFyIGJ1ZiA9IGNyZWF0ZUJ1ZmZlcihsZW4pXG5cbiAgICBpZiAoYnVmLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIGJ1ZlxuICAgIH1cblxuICAgIG9iai5jb3B5KGJ1ZiwgMCwgMCwgbGVuKVxuICAgIHJldHVybiBidWZcbiAgfVxuXG4gIGlmIChvYmoubGVuZ3RoICE9PSB1bmRlZmluZWQpIHtcbiAgICBpZiAodHlwZW9mIG9iai5sZW5ndGggIT09ICdudW1iZXInIHx8IG51bWJlcklzTmFOKG9iai5sZW5ndGgpKSB7XG4gICAgICByZXR1cm4gY3JlYXRlQnVmZmVyKDApXG4gICAgfVxuICAgIHJldHVybiBmcm9tQXJyYXlMaWtlKG9iailcbiAgfVxuXG4gIGlmIChvYmoudHlwZSA9PT0gJ0J1ZmZlcicgJiYgQXJyYXkuaXNBcnJheShvYmouZGF0YSkpIHtcbiAgICByZXR1cm4gZnJvbUFycmF5TGlrZShvYmouZGF0YSlcbiAgfVxufVxuXG5mdW5jdGlvbiBjaGVja2VkIChsZW5ndGgpIHtcbiAgLy8gTm90ZTogY2Fubm90IHVzZSBgbGVuZ3RoIDwgS19NQVhfTEVOR1RIYCBoZXJlIGJlY2F1c2UgdGhhdCBmYWlscyB3aGVuXG4gIC8vIGxlbmd0aCBpcyBOYU4gKHdoaWNoIGlzIG90aGVyd2lzZSBjb2VyY2VkIHRvIHplcm8uKVxuICBpZiAobGVuZ3RoID49IEtfTUFYX0xFTkdUSCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdBdHRlbXB0IHRvIGFsbG9jYXRlIEJ1ZmZlciBsYXJnZXIgdGhhbiBtYXhpbXVtICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICdzaXplOiAweCcgKyBLX01BWF9MRU5HVEgudG9TdHJpbmcoMTYpICsgJyBieXRlcycpXG4gIH1cbiAgcmV0dXJuIGxlbmd0aCB8IDBcbn1cblxuZnVuY3Rpb24gU2xvd0J1ZmZlciAobGVuZ3RoKSB7XG4gIGlmICgrbGVuZ3RoICE9IGxlbmd0aCkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGVxZXFlcVxuICAgIGxlbmd0aCA9IDBcbiAgfVxuICByZXR1cm4gQnVmZmVyLmFsbG9jKCtsZW5ndGgpXG59XG5cbkJ1ZmZlci5pc0J1ZmZlciA9IGZ1bmN0aW9uIGlzQnVmZmVyIChiKSB7XG4gIHJldHVybiBiICE9IG51bGwgJiYgYi5faXNCdWZmZXIgPT09IHRydWUgJiZcbiAgICBiICE9PSBCdWZmZXIucHJvdG90eXBlIC8vIHNvIEJ1ZmZlci5pc0J1ZmZlcihCdWZmZXIucHJvdG90eXBlKSB3aWxsIGJlIGZhbHNlXG59XG5cbkJ1ZmZlci5jb21wYXJlID0gZnVuY3Rpb24gY29tcGFyZSAoYSwgYikge1xuICBpZiAoaXNJbnN0YW5jZShhLCBVaW50OEFycmF5KSkgYSA9IEJ1ZmZlci5mcm9tKGEsIGEub2Zmc2V0LCBhLmJ5dGVMZW5ndGgpXG4gIGlmIChpc0luc3RhbmNlKGIsIFVpbnQ4QXJyYXkpKSBiID0gQnVmZmVyLmZyb20oYiwgYi5vZmZzZXQsIGIuYnl0ZUxlbmd0aClcbiAgaWYgKCFCdWZmZXIuaXNCdWZmZXIoYSkgfHwgIUJ1ZmZlci5pc0J1ZmZlcihiKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAnVGhlIFwiYnVmMVwiLCBcImJ1ZjJcIiBhcmd1bWVudHMgbXVzdCBiZSBvbmUgb2YgdHlwZSBCdWZmZXIgb3IgVWludDhBcnJheSdcbiAgICApXG4gIH1cblxuICBpZiAoYSA9PT0gYikgcmV0dXJuIDBcblxuICB2YXIgeCA9IGEubGVuZ3RoXG4gIHZhciB5ID0gYi5sZW5ndGhcblxuICBmb3IgKHZhciBpID0gMCwgbGVuID0gTWF0aC5taW4oeCwgeSk7IGkgPCBsZW47ICsraSkge1xuICAgIGlmIChhW2ldICE9PSBiW2ldKSB7XG4gICAgICB4ID0gYVtpXVxuICAgICAgeSA9IGJbaV1cbiAgICAgIGJyZWFrXG4gICAgfVxuICB9XG5cbiAgaWYgKHggPCB5KSByZXR1cm4gLTFcbiAgaWYgKHkgPCB4KSByZXR1cm4gMVxuICByZXR1cm4gMFxufVxuXG5CdWZmZXIuaXNFbmNvZGluZyA9IGZ1bmN0aW9uIGlzRW5jb2RpbmcgKGVuY29kaW5nKSB7XG4gIHN3aXRjaCAoU3RyaW5nKGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgY2FzZSAnYXNjaWknOlxuICAgIGNhc2UgJ2xhdGluMSc6XG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5CdWZmZXIuY29uY2F0ID0gZnVuY3Rpb24gY29uY2F0IChsaXN0LCBsZW5ndGgpIHtcbiAgaWYgKCFBcnJheS5pc0FycmF5KGxpc3QpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJsaXN0XCIgYXJndW1lbnQgbXVzdCBiZSBhbiBBcnJheSBvZiBCdWZmZXJzJylcbiAgfVxuXG4gIGlmIChsaXN0Lmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBCdWZmZXIuYWxsb2MoMClcbiAgfVxuXG4gIHZhciBpXG4gIGlmIChsZW5ndGggPT09IHVuZGVmaW5lZCkge1xuICAgIGxlbmd0aCA9IDBcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7ICsraSkge1xuICAgICAgbGVuZ3RoICs9IGxpc3RbaV0ubGVuZ3RoXG4gICAgfVxuICB9XG5cbiAgdmFyIGJ1ZmZlciA9IEJ1ZmZlci5hbGxvY1Vuc2FmZShsZW5ndGgpXG4gIHZhciBwb3MgPSAwXG4gIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgKytpKSB7XG4gICAgdmFyIGJ1ZiA9IGxpc3RbaV1cbiAgICBpZiAoaXNJbnN0YW5jZShidWYsIFVpbnQ4QXJyYXkpKSB7XG4gICAgICBidWYgPSBCdWZmZXIuZnJvbShidWYpXG4gICAgfVxuICAgIGlmICghQnVmZmVyLmlzQnVmZmVyKGJ1ZikpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wibGlzdFwiIGFyZ3VtZW50IG11c3QgYmUgYW4gQXJyYXkgb2YgQnVmZmVycycpXG4gICAgfVxuICAgIGJ1Zi5jb3B5KGJ1ZmZlciwgcG9zKVxuICAgIHBvcyArPSBidWYubGVuZ3RoXG4gIH1cbiAgcmV0dXJuIGJ1ZmZlclxufVxuXG5mdW5jdGlvbiBieXRlTGVuZ3RoIChzdHJpbmcsIGVuY29kaW5nKSB7XG4gIGlmIChCdWZmZXIuaXNCdWZmZXIoc3RyaW5nKSkge1xuICAgIHJldHVybiBzdHJpbmcubGVuZ3RoXG4gIH1cbiAgaWYgKEFycmF5QnVmZmVyLmlzVmlldyhzdHJpbmcpIHx8IGlzSW5zdGFuY2Uoc3RyaW5nLCBBcnJheUJ1ZmZlcikpIHtcbiAgICByZXR1cm4gc3RyaW5nLmJ5dGVMZW5ndGhcbiAgfVxuICBpZiAodHlwZW9mIHN0cmluZyAhPT0gJ3N0cmluZycpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgJ1RoZSBcInN0cmluZ1wiIGFyZ3VtZW50IG11c3QgYmUgb25lIG9mIHR5cGUgc3RyaW5nLCBCdWZmZXIsIG9yIEFycmF5QnVmZmVyLiAnICtcbiAgICAgICdSZWNlaXZlZCB0eXBlICcgKyB0eXBlb2Ygc3RyaW5nXG4gICAgKVxuICB9XG5cbiAgdmFyIGxlbiA9IHN0cmluZy5sZW5ndGhcbiAgdmFyIG11c3RNYXRjaCA9IChhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gPT09IHRydWUpXG4gIGlmICghbXVzdE1hdGNoICYmIGxlbiA9PT0gMCkgcmV0dXJuIDBcblxuICAvLyBVc2UgYSBmb3IgbG9vcCB0byBhdm9pZCByZWN1cnNpb25cbiAgdmFyIGxvd2VyZWRDYXNlID0gZmFsc2VcbiAgZm9yICg7Oykge1xuICAgIHN3aXRjaCAoZW5jb2RpbmcpIHtcbiAgICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgIGNhc2UgJ2xhdGluMSc6XG4gICAgICBjYXNlICdiaW5hcnknOlxuICAgICAgICByZXR1cm4gbGVuXG4gICAgICBjYXNlICd1dGY4JzpcbiAgICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgICAgcmV0dXJuIHV0ZjhUb0J5dGVzKHN0cmluZykubGVuZ3RoXG4gICAgICBjYXNlICd1Y3MyJzpcbiAgICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgICByZXR1cm4gbGVuICogMlxuICAgICAgY2FzZSAnaGV4JzpcbiAgICAgICAgcmV0dXJuIGxlbiA+Pj4gMVxuICAgICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgICAgcmV0dXJuIGJhc2U2NFRvQnl0ZXMoc3RyaW5nKS5sZW5ndGhcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGlmIChsb3dlcmVkQ2FzZSkge1xuICAgICAgICAgIHJldHVybiBtdXN0TWF0Y2ggPyAtMSA6IHV0ZjhUb0J5dGVzKHN0cmluZykubGVuZ3RoIC8vIGFzc3VtZSB1dGY4XG4gICAgICAgIH1cbiAgICAgICAgZW5jb2RpbmcgPSAoJycgKyBlbmNvZGluZykudG9Mb3dlckNhc2UoKVxuICAgICAgICBsb3dlcmVkQ2FzZSA9IHRydWVcbiAgICB9XG4gIH1cbn1cbkJ1ZmZlci5ieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aFxuXG5mdW5jdGlvbiBzbG93VG9TdHJpbmcgKGVuY29kaW5nLCBzdGFydCwgZW5kKSB7XG4gIHZhciBsb3dlcmVkQ2FzZSA9IGZhbHNlXG5cbiAgLy8gTm8gbmVlZCB0byB2ZXJpZnkgdGhhdCBcInRoaXMubGVuZ3RoIDw9IE1BWF9VSU5UMzJcIiBzaW5jZSBpdCdzIGEgcmVhZC1vbmx5XG4gIC8vIHByb3BlcnR5IG9mIGEgdHlwZWQgYXJyYXkuXG5cbiAgLy8gVGhpcyBiZWhhdmVzIG5laXRoZXIgbGlrZSBTdHJpbmcgbm9yIFVpbnQ4QXJyYXkgaW4gdGhhdCB3ZSBzZXQgc3RhcnQvZW5kXG4gIC8vIHRvIHRoZWlyIHVwcGVyL2xvd2VyIGJvdW5kcyBpZiB0aGUgdmFsdWUgcGFzc2VkIGlzIG91dCBvZiByYW5nZS5cbiAgLy8gdW5kZWZpbmVkIGlzIGhhbmRsZWQgc3BlY2lhbGx5IGFzIHBlciBFQ01BLTI2MiA2dGggRWRpdGlvbixcbiAgLy8gU2VjdGlvbiAxMy4zLjMuNyBSdW50aW1lIFNlbWFudGljczogS2V5ZWRCaW5kaW5nSW5pdGlhbGl6YXRpb24uXG4gIGlmIChzdGFydCA9PT0gdW5kZWZpbmVkIHx8IHN0YXJ0IDwgMCkge1xuICAgIHN0YXJ0ID0gMFxuICB9XG4gIC8vIFJldHVybiBlYXJseSBpZiBzdGFydCA+IHRoaXMubGVuZ3RoLiBEb25lIGhlcmUgdG8gcHJldmVudCBwb3RlbnRpYWwgdWludDMyXG4gIC8vIGNvZXJjaW9uIGZhaWwgYmVsb3cuXG4gIGlmIChzdGFydCA+IHRoaXMubGVuZ3RoKSB7XG4gICAgcmV0dXJuICcnXG4gIH1cblxuICBpZiAoZW5kID09PSB1bmRlZmluZWQgfHwgZW5kID4gdGhpcy5sZW5ndGgpIHtcbiAgICBlbmQgPSB0aGlzLmxlbmd0aFxuICB9XG5cbiAgaWYgKGVuZCA8PSAwKSB7XG4gICAgcmV0dXJuICcnXG4gIH1cblxuICAvLyBGb3JjZSBjb2Vyc2lvbiB0byB1aW50MzIuIFRoaXMgd2lsbCBhbHNvIGNvZXJjZSBmYWxzZXkvTmFOIHZhbHVlcyB0byAwLlxuICBlbmQgPj4+PSAwXG4gIHN0YXJ0ID4+Pj0gMFxuXG4gIGlmIChlbmQgPD0gc3RhcnQpIHtcbiAgICByZXR1cm4gJydcbiAgfVxuXG4gIGlmICghZW5jb2RpbmcpIGVuY29kaW5nID0gJ3V0ZjgnXG5cbiAgd2hpbGUgKHRydWUpIHtcbiAgICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgICBjYXNlICdoZXgnOlxuICAgICAgICByZXR1cm4gaGV4U2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAndXRmOCc6XG4gICAgICBjYXNlICd1dGYtOCc6XG4gICAgICAgIHJldHVybiB1dGY4U2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAnYXNjaWknOlxuICAgICAgICByZXR1cm4gYXNjaWlTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICdsYXRpbjEnOlxuICAgICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgICAgcmV0dXJuIGxhdGluMVNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICAgIHJldHVybiBiYXNlNjRTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICd1Y3MyJzpcbiAgICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgICByZXR1cm4gdXRmMTZsZVNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGlmIChsb3dlcmVkQ2FzZSkgdGhyb3cgbmV3IFR5cGVFcnJvcignVW5rbm93biBlbmNvZGluZzogJyArIGVuY29kaW5nKVxuICAgICAgICBlbmNvZGluZyA9IChlbmNvZGluZyArICcnKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIGxvd2VyZWRDYXNlID0gdHJ1ZVxuICAgIH1cbiAgfVxufVxuXG4vLyBUaGlzIHByb3BlcnR5IGlzIHVzZWQgYnkgYEJ1ZmZlci5pc0J1ZmZlcmAgKGFuZCB0aGUgYGlzLWJ1ZmZlcmAgbnBtIHBhY2thZ2UpXG4vLyB0byBkZXRlY3QgYSBCdWZmZXIgaW5zdGFuY2UuIEl0J3Mgbm90IHBvc3NpYmxlIHRvIHVzZSBgaW5zdGFuY2VvZiBCdWZmZXJgXG4vLyByZWxpYWJseSBpbiBhIGJyb3dzZXJpZnkgY29udGV4dCBiZWNhdXNlIHRoZXJlIGNvdWxkIGJlIG11bHRpcGxlIGRpZmZlcmVudFxuLy8gY29waWVzIG9mIHRoZSAnYnVmZmVyJyBwYWNrYWdlIGluIHVzZS4gVGhpcyBtZXRob2Qgd29ya3MgZXZlbiBmb3IgQnVmZmVyXG4vLyBpbnN0YW5jZXMgdGhhdCB3ZXJlIGNyZWF0ZWQgZnJvbSBhbm90aGVyIGNvcHkgb2YgdGhlIGBidWZmZXJgIHBhY2thZ2UuXG4vLyBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyL2lzc3Vlcy8xNTRcbkJ1ZmZlci5wcm90b3R5cGUuX2lzQnVmZmVyID0gdHJ1ZVxuXG5mdW5jdGlvbiBzd2FwIChiLCBuLCBtKSB7XG4gIHZhciBpID0gYltuXVxuICBiW25dID0gYlttXVxuICBiW21dID0gaVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnN3YXAxNiA9IGZ1bmN0aW9uIHN3YXAxNiAoKSB7XG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxuICBpZiAobGVuICUgMiAhPT0gMCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdCdWZmZXIgc2l6ZSBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgMTYtYml0cycpXG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkgKz0gMikge1xuICAgIHN3YXAodGhpcywgaSwgaSArIDEpXG4gIH1cbiAgcmV0dXJuIHRoaXNcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5zd2FwMzIgPSBmdW5jdGlvbiBzd2FwMzIgKCkge1xuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgaWYgKGxlbiAlIDQgIT09IDApIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignQnVmZmVyIHNpemUgbXVzdCBiZSBhIG11bHRpcGxlIG9mIDMyLWJpdHMnKVxuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpICs9IDQpIHtcbiAgICBzd2FwKHRoaXMsIGksIGkgKyAzKVxuICAgIHN3YXAodGhpcywgaSArIDEsIGkgKyAyKVxuICB9XG4gIHJldHVybiB0aGlzXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuc3dhcDY0ID0gZnVuY3Rpb24gc3dhcDY0ICgpIHtcbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIGlmIChsZW4gJSA4ICE9PSAwKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0J1ZmZlciBzaXplIG11c3QgYmUgYSBtdWx0aXBsZSBvZiA2NC1iaXRzJylcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSArPSA4KSB7XG4gICAgc3dhcCh0aGlzLCBpLCBpICsgNylcbiAgICBzd2FwKHRoaXMsIGkgKyAxLCBpICsgNilcbiAgICBzd2FwKHRoaXMsIGkgKyAyLCBpICsgNSlcbiAgICBzd2FwKHRoaXMsIGkgKyAzLCBpICsgNClcbiAgfVxuICByZXR1cm4gdGhpc1xufVxuXG5CdWZmZXIucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcgKCkge1xuICB2YXIgbGVuZ3RoID0gdGhpcy5sZW5ndGhcbiAgaWYgKGxlbmd0aCA9PT0gMCkgcmV0dXJuICcnXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSByZXR1cm4gdXRmOFNsaWNlKHRoaXMsIDAsIGxlbmd0aClcbiAgcmV0dXJuIHNsb3dUb1N0cmluZy5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUudG9Mb2NhbGVTdHJpbmcgPSBCdWZmZXIucHJvdG90eXBlLnRvU3RyaW5nXG5cbkJ1ZmZlci5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24gZXF1YWxzIChiKSB7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKGIpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudCBtdXN0IGJlIGEgQnVmZmVyJylcbiAgaWYgKHRoaXMgPT09IGIpIHJldHVybiB0cnVlXG4gIHJldHVybiBCdWZmZXIuY29tcGFyZSh0aGlzLCBiKSA9PT0gMFxufVxuXG5CdWZmZXIucHJvdG90eXBlLmluc3BlY3QgPSBmdW5jdGlvbiBpbnNwZWN0ICgpIHtcbiAgdmFyIHN0ciA9ICcnXG4gIHZhciBtYXggPSBleHBvcnRzLklOU1BFQ1RfTUFYX0JZVEVTXG4gIHN0ciA9IHRoaXMudG9TdHJpbmcoJ2hleCcsIDAsIG1heCkucmVwbGFjZSgvKC57Mn0pL2csICckMSAnKS50cmltKClcbiAgaWYgKHRoaXMubGVuZ3RoID4gbWF4KSBzdHIgKz0gJyAuLi4gJ1xuICByZXR1cm4gJzxCdWZmZXIgJyArIHN0ciArICc+J1xufVxuXG5CdWZmZXIucHJvdG90eXBlLmNvbXBhcmUgPSBmdW5jdGlvbiBjb21wYXJlICh0YXJnZXQsIHN0YXJ0LCBlbmQsIHRoaXNTdGFydCwgdGhpc0VuZCkge1xuICBpZiAoaXNJbnN0YW5jZSh0YXJnZXQsIFVpbnQ4QXJyYXkpKSB7XG4gICAgdGFyZ2V0ID0gQnVmZmVyLmZyb20odGFyZ2V0LCB0YXJnZXQub2Zmc2V0LCB0YXJnZXQuYnl0ZUxlbmd0aClcbiAgfVxuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcih0YXJnZXQpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICdUaGUgXCJ0YXJnZXRcIiBhcmd1bWVudCBtdXN0IGJlIG9uZSBvZiB0eXBlIEJ1ZmZlciBvciBVaW50OEFycmF5LiAnICtcbiAgICAgICdSZWNlaXZlZCB0eXBlICcgKyAodHlwZW9mIHRhcmdldClcbiAgICApXG4gIH1cblxuICBpZiAoc3RhcnQgPT09IHVuZGVmaW5lZCkge1xuICAgIHN0YXJ0ID0gMFxuICB9XG4gIGlmIChlbmQgPT09IHVuZGVmaW5lZCkge1xuICAgIGVuZCA9IHRhcmdldCA/IHRhcmdldC5sZW5ndGggOiAwXG4gIH1cbiAgaWYgKHRoaXNTdGFydCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhpc1N0YXJ0ID0gMFxuICB9XG4gIGlmICh0aGlzRW5kID09PSB1bmRlZmluZWQpIHtcbiAgICB0aGlzRW5kID0gdGhpcy5sZW5ndGhcbiAgfVxuXG4gIGlmIChzdGFydCA8IDAgfHwgZW5kID4gdGFyZ2V0Lmxlbmd0aCB8fCB0aGlzU3RhcnQgPCAwIHx8IHRoaXNFbmQgPiB0aGlzLmxlbmd0aCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdvdXQgb2YgcmFuZ2UgaW5kZXgnKVxuICB9XG5cbiAgaWYgKHRoaXNTdGFydCA+PSB0aGlzRW5kICYmIHN0YXJ0ID49IGVuZCkge1xuICAgIHJldHVybiAwXG4gIH1cbiAgaWYgKHRoaXNTdGFydCA+PSB0aGlzRW5kKSB7XG4gICAgcmV0dXJuIC0xXG4gIH1cbiAgaWYgKHN0YXJ0ID49IGVuZCkge1xuICAgIHJldHVybiAxXG4gIH1cblxuICBzdGFydCA+Pj49IDBcbiAgZW5kID4+Pj0gMFxuICB0aGlzU3RhcnQgPj4+PSAwXG4gIHRoaXNFbmQgPj4+PSAwXG5cbiAgaWYgKHRoaXMgPT09IHRhcmdldCkgcmV0dXJuIDBcblxuICB2YXIgeCA9IHRoaXNFbmQgLSB0aGlzU3RhcnRcbiAgdmFyIHkgPSBlbmQgLSBzdGFydFxuICB2YXIgbGVuID0gTWF0aC5taW4oeCwgeSlcblxuICB2YXIgdGhpc0NvcHkgPSB0aGlzLnNsaWNlKHRoaXNTdGFydCwgdGhpc0VuZClcbiAgdmFyIHRhcmdldENvcHkgPSB0YXJnZXQuc2xpY2Uoc3RhcnQsIGVuZClcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKSB7XG4gICAgaWYgKHRoaXNDb3B5W2ldICE9PSB0YXJnZXRDb3B5W2ldKSB7XG4gICAgICB4ID0gdGhpc0NvcHlbaV1cbiAgICAgIHkgPSB0YXJnZXRDb3B5W2ldXG4gICAgICBicmVha1xuICAgIH1cbiAgfVxuXG4gIGlmICh4IDwgeSkgcmV0dXJuIC0xXG4gIGlmICh5IDwgeCkgcmV0dXJuIDFcbiAgcmV0dXJuIDBcbn1cblxuLy8gRmluZHMgZWl0aGVyIHRoZSBmaXJzdCBpbmRleCBvZiBgdmFsYCBpbiBgYnVmZmVyYCBhdCBvZmZzZXQgPj0gYGJ5dGVPZmZzZXRgLFxuLy8gT1IgdGhlIGxhc3QgaW5kZXggb2YgYHZhbGAgaW4gYGJ1ZmZlcmAgYXQgb2Zmc2V0IDw9IGBieXRlT2Zmc2V0YC5cbi8vXG4vLyBBcmd1bWVudHM6XG4vLyAtIGJ1ZmZlciAtIGEgQnVmZmVyIHRvIHNlYXJjaFxuLy8gLSB2YWwgLSBhIHN0cmluZywgQnVmZmVyLCBvciBudW1iZXJcbi8vIC0gYnl0ZU9mZnNldCAtIGFuIGluZGV4IGludG8gYGJ1ZmZlcmA7IHdpbGwgYmUgY2xhbXBlZCB0byBhbiBpbnQzMlxuLy8gLSBlbmNvZGluZyAtIGFuIG9wdGlvbmFsIGVuY29kaW5nLCByZWxldmFudCBpcyB2YWwgaXMgYSBzdHJpbmdcbi8vIC0gZGlyIC0gdHJ1ZSBmb3IgaW5kZXhPZiwgZmFsc2UgZm9yIGxhc3RJbmRleE9mXG5mdW5jdGlvbiBiaWRpcmVjdGlvbmFsSW5kZXhPZiAoYnVmZmVyLCB2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nLCBkaXIpIHtcbiAgLy8gRW1wdHkgYnVmZmVyIG1lYW5zIG5vIG1hdGNoXG4gIGlmIChidWZmZXIubGVuZ3RoID09PSAwKSByZXR1cm4gLTFcblxuICAvLyBOb3JtYWxpemUgYnl0ZU9mZnNldFxuICBpZiAodHlwZW9mIGJ5dGVPZmZzZXQgPT09ICdzdHJpbmcnKSB7XG4gICAgZW5jb2RpbmcgPSBieXRlT2Zmc2V0XG4gICAgYnl0ZU9mZnNldCA9IDBcbiAgfSBlbHNlIGlmIChieXRlT2Zmc2V0ID4gMHg3ZmZmZmZmZikge1xuICAgIGJ5dGVPZmZzZXQgPSAweDdmZmZmZmZmXG4gIH0gZWxzZSBpZiAoYnl0ZU9mZnNldCA8IC0weDgwMDAwMDAwKSB7XG4gICAgYnl0ZU9mZnNldCA9IC0weDgwMDAwMDAwXG4gIH1cbiAgYnl0ZU9mZnNldCA9ICtieXRlT2Zmc2V0IC8vIENvZXJjZSB0byBOdW1iZXIuXG4gIGlmIChudW1iZXJJc05hTihieXRlT2Zmc2V0KSkge1xuICAgIC8vIGJ5dGVPZmZzZXQ6IGl0IGl0J3MgdW5kZWZpbmVkLCBudWxsLCBOYU4sIFwiZm9vXCIsIGV0Yywgc2VhcmNoIHdob2xlIGJ1ZmZlclxuICAgIGJ5dGVPZmZzZXQgPSBkaXIgPyAwIDogKGJ1ZmZlci5sZW5ndGggLSAxKVxuICB9XG5cbiAgLy8gTm9ybWFsaXplIGJ5dGVPZmZzZXQ6IG5lZ2F0aXZlIG9mZnNldHMgc3RhcnQgZnJvbSB0aGUgZW5kIG9mIHRoZSBidWZmZXJcbiAgaWYgKGJ5dGVPZmZzZXQgPCAwKSBieXRlT2Zmc2V0ID0gYnVmZmVyLmxlbmd0aCArIGJ5dGVPZmZzZXRcbiAgaWYgKGJ5dGVPZmZzZXQgPj0gYnVmZmVyLmxlbmd0aCkge1xuICAgIGlmIChkaXIpIHJldHVybiAtMVxuICAgIGVsc2UgYnl0ZU9mZnNldCA9IGJ1ZmZlci5sZW5ndGggLSAxXG4gIH0gZWxzZSBpZiAoYnl0ZU9mZnNldCA8IDApIHtcbiAgICBpZiAoZGlyKSBieXRlT2Zmc2V0ID0gMFxuICAgIGVsc2UgcmV0dXJuIC0xXG4gIH1cblxuICAvLyBOb3JtYWxpemUgdmFsXG4gIGlmICh0eXBlb2YgdmFsID09PSAnc3RyaW5nJykge1xuICAgIHZhbCA9IEJ1ZmZlci5mcm9tKHZhbCwgZW5jb2RpbmcpXG4gIH1cblxuICAvLyBGaW5hbGx5LCBzZWFyY2ggZWl0aGVyIGluZGV4T2YgKGlmIGRpciBpcyB0cnVlKSBvciBsYXN0SW5kZXhPZlxuICBpZiAoQnVmZmVyLmlzQnVmZmVyKHZhbCkpIHtcbiAgICAvLyBTcGVjaWFsIGNhc2U6IGxvb2tpbmcgZm9yIGVtcHR5IHN0cmluZy9idWZmZXIgYWx3YXlzIGZhaWxzXG4gICAgaWYgKHZhbC5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiAtMVxuICAgIH1cbiAgICByZXR1cm4gYXJyYXlJbmRleE9mKGJ1ZmZlciwgdmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZywgZGlyKVxuICB9IGVsc2UgaWYgKHR5cGVvZiB2YWwgPT09ICdudW1iZXInKSB7XG4gICAgdmFsID0gdmFsICYgMHhGRiAvLyBTZWFyY2ggZm9yIGEgYnl0ZSB2YWx1ZSBbMC0yNTVdXG4gICAgaWYgKHR5cGVvZiBVaW50OEFycmF5LnByb3RvdHlwZS5pbmRleE9mID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBpZiAoZGlyKSB7XG4gICAgICAgIHJldHVybiBVaW50OEFycmF5LnByb3RvdHlwZS5pbmRleE9mLmNhbGwoYnVmZmVyLCB2YWwsIGJ5dGVPZmZzZXQpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gVWludDhBcnJheS5wcm90b3R5cGUubGFzdEluZGV4T2YuY2FsbChidWZmZXIsIHZhbCwgYnl0ZU9mZnNldClcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGFycmF5SW5kZXhPZihidWZmZXIsIFsgdmFsIF0sIGJ5dGVPZmZzZXQsIGVuY29kaW5nLCBkaXIpXG4gIH1cblxuICB0aHJvdyBuZXcgVHlwZUVycm9yKCd2YWwgbXVzdCBiZSBzdHJpbmcsIG51bWJlciBvciBCdWZmZXInKVxufVxuXG5mdW5jdGlvbiBhcnJheUluZGV4T2YgKGFyciwgdmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZywgZGlyKSB7XG4gIHZhciBpbmRleFNpemUgPSAxXG4gIHZhciBhcnJMZW5ndGggPSBhcnIubGVuZ3RoXG4gIHZhciB2YWxMZW5ndGggPSB2YWwubGVuZ3RoXG5cbiAgaWYgKGVuY29kaW5nICE9PSB1bmRlZmluZWQpIHtcbiAgICBlbmNvZGluZyA9IFN0cmluZyhlbmNvZGluZykudG9Mb3dlckNhc2UoKVxuICAgIGlmIChlbmNvZGluZyA9PT0gJ3VjczInIHx8IGVuY29kaW5nID09PSAndWNzLTInIHx8XG4gICAgICAgIGVuY29kaW5nID09PSAndXRmMTZsZScgfHwgZW5jb2RpbmcgPT09ICd1dGYtMTZsZScpIHtcbiAgICAgIGlmIChhcnIubGVuZ3RoIDwgMiB8fCB2YWwubGVuZ3RoIDwgMikge1xuICAgICAgICByZXR1cm4gLTFcbiAgICAgIH1cbiAgICAgIGluZGV4U2l6ZSA9IDJcbiAgICAgIGFyckxlbmd0aCAvPSAyXG4gICAgICB2YWxMZW5ndGggLz0gMlxuICAgICAgYnl0ZU9mZnNldCAvPSAyXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcmVhZCAoYnVmLCBpKSB7XG4gICAgaWYgKGluZGV4U2l6ZSA9PT0gMSkge1xuICAgICAgcmV0dXJuIGJ1ZltpXVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYnVmLnJlYWRVSW50MTZCRShpICogaW5kZXhTaXplKVxuICAgIH1cbiAgfVxuXG4gIHZhciBpXG4gIGlmIChkaXIpIHtcbiAgICB2YXIgZm91bmRJbmRleCA9IC0xXG4gICAgZm9yIChpID0gYnl0ZU9mZnNldDsgaSA8IGFyckxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAocmVhZChhcnIsIGkpID09PSByZWFkKHZhbCwgZm91bmRJbmRleCA9PT0gLTEgPyAwIDogaSAtIGZvdW5kSW5kZXgpKSB7XG4gICAgICAgIGlmIChmb3VuZEluZGV4ID09PSAtMSkgZm91bmRJbmRleCA9IGlcbiAgICAgICAgaWYgKGkgLSBmb3VuZEluZGV4ICsgMSA9PT0gdmFsTGVuZ3RoKSByZXR1cm4gZm91bmRJbmRleCAqIGluZGV4U2l6ZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGZvdW5kSW5kZXggIT09IC0xKSBpIC09IGkgLSBmb3VuZEluZGV4XG4gICAgICAgIGZvdW5kSW5kZXggPSAtMVxuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAoYnl0ZU9mZnNldCArIHZhbExlbmd0aCA+IGFyckxlbmd0aCkgYnl0ZU9mZnNldCA9IGFyckxlbmd0aCAtIHZhbExlbmd0aFxuICAgIGZvciAoaSA9IGJ5dGVPZmZzZXQ7IGkgPj0gMDsgaS0tKSB7XG4gICAgICB2YXIgZm91bmQgPSB0cnVlXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHZhbExlbmd0aDsgaisrKSB7XG4gICAgICAgIGlmIChyZWFkKGFyciwgaSArIGopICE9PSByZWFkKHZhbCwgaikpIHtcbiAgICAgICAgICBmb3VuZCA9IGZhbHNlXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGZvdW5kKSByZXR1cm4gaVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiAtMVxufVxuXG5CdWZmZXIucHJvdG90eXBlLmluY2x1ZGVzID0gZnVuY3Rpb24gaW5jbHVkZXMgKHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcpIHtcbiAgcmV0dXJuIHRoaXMuaW5kZXhPZih2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nKSAhPT0gLTFcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5pbmRleE9mID0gZnVuY3Rpb24gaW5kZXhPZiAodmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZykge1xuICByZXR1cm4gYmlkaXJlY3Rpb25hbEluZGV4T2YodGhpcywgdmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZywgdHJ1ZSlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5sYXN0SW5kZXhPZiA9IGZ1bmN0aW9uIGxhc3RJbmRleE9mICh2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nKSB7XG4gIHJldHVybiBiaWRpcmVjdGlvbmFsSW5kZXhPZih0aGlzLCB2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nLCBmYWxzZSlcbn1cblxuZnVuY3Rpb24gaGV4V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICBvZmZzZXQgPSBOdW1iZXIob2Zmc2V0KSB8fCAwXG4gIHZhciByZW1haW5pbmcgPSBidWYubGVuZ3RoIC0gb2Zmc2V0XG4gIGlmICghbGVuZ3RoKSB7XG4gICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gIH0gZWxzZSB7XG4gICAgbGVuZ3RoID0gTnVtYmVyKGxlbmd0aClcbiAgICBpZiAobGVuZ3RoID4gcmVtYWluaW5nKSB7XG4gICAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgICB9XG4gIH1cblxuICB2YXIgc3RyTGVuID0gc3RyaW5nLmxlbmd0aFxuXG4gIGlmIChsZW5ndGggPiBzdHJMZW4gLyAyKSB7XG4gICAgbGVuZ3RoID0gc3RyTGVuIC8gMlxuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyArK2kpIHtcbiAgICB2YXIgcGFyc2VkID0gcGFyc2VJbnQoc3RyaW5nLnN1YnN0cihpICogMiwgMiksIDE2KVxuICAgIGlmIChudW1iZXJJc05hTihwYXJzZWQpKSByZXR1cm4gaVxuICAgIGJ1ZltvZmZzZXQgKyBpXSA9IHBhcnNlZFxuICB9XG4gIHJldHVybiBpXG59XG5cbmZ1bmN0aW9uIHV0ZjhXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBibGl0QnVmZmVyKHV0ZjhUb0J5dGVzKHN0cmluZywgYnVmLmxlbmd0aCAtIG9mZnNldCksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbmZ1bmN0aW9uIGFzY2lpV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gYmxpdEJ1ZmZlcihhc2NpaVRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gbGF0aW4xV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gYXNjaWlXcml0ZShidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbmZ1bmN0aW9uIGJhc2U2NFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGJsaXRCdWZmZXIoYmFzZTY0VG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5mdW5jdGlvbiB1Y3MyV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gYmxpdEJ1ZmZlcih1dGYxNmxlVG9CeXRlcyhzdHJpbmcsIGJ1Zi5sZW5ndGggLSBvZmZzZXQpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24gd3JpdGUgKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgsIGVuY29kaW5nKSB7XG4gIC8vIEJ1ZmZlciN3cml0ZShzdHJpbmcpXG4gIGlmIChvZmZzZXQgPT09IHVuZGVmaW5lZCkge1xuICAgIGVuY29kaW5nID0gJ3V0ZjgnXG4gICAgbGVuZ3RoID0gdGhpcy5sZW5ndGhcbiAgICBvZmZzZXQgPSAwXG4gIC8vIEJ1ZmZlciN3cml0ZShzdHJpbmcsIGVuY29kaW5nKVxuICB9IGVsc2UgaWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkICYmIHR5cGVvZiBvZmZzZXQgPT09ICdzdHJpbmcnKSB7XG4gICAgZW5jb2RpbmcgPSBvZmZzZXRcbiAgICBsZW5ndGggPSB0aGlzLmxlbmd0aFxuICAgIG9mZnNldCA9IDBcbiAgLy8gQnVmZmVyI3dyaXRlKHN0cmluZywgb2Zmc2V0WywgbGVuZ3RoXVssIGVuY29kaW5nXSlcbiAgfSBlbHNlIGlmIChpc0Zpbml0ZShvZmZzZXQpKSB7XG4gICAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gICAgaWYgKGlzRmluaXRlKGxlbmd0aCkpIHtcbiAgICAgIGxlbmd0aCA9IGxlbmd0aCA+Pj4gMFxuICAgICAgaWYgKGVuY29kaW5nID09PSB1bmRlZmluZWQpIGVuY29kaW5nID0gJ3V0ZjgnXG4gICAgfSBlbHNlIHtcbiAgICAgIGVuY29kaW5nID0gbGVuZ3RoXG4gICAgICBsZW5ndGggPSB1bmRlZmluZWRcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgJ0J1ZmZlci53cml0ZShzdHJpbmcsIGVuY29kaW5nLCBvZmZzZXRbLCBsZW5ndGhdKSBpcyBubyBsb25nZXIgc3VwcG9ydGVkJ1xuICAgIClcbiAgfVxuXG4gIHZhciByZW1haW5pbmcgPSB0aGlzLmxlbmd0aCAtIG9mZnNldFxuICBpZiAobGVuZ3RoID09PSB1bmRlZmluZWQgfHwgbGVuZ3RoID4gcmVtYWluaW5nKSBsZW5ndGggPSByZW1haW5pbmdcblxuICBpZiAoKHN0cmluZy5sZW5ndGggPiAwICYmIChsZW5ndGggPCAwIHx8IG9mZnNldCA8IDApKSB8fCBvZmZzZXQgPiB0aGlzLmxlbmd0aCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdBdHRlbXB0IHRvIHdyaXRlIG91dHNpZGUgYnVmZmVyIGJvdW5kcycpXG4gIH1cblxuICBpZiAoIWVuY29kaW5nKSBlbmNvZGluZyA9ICd1dGY4J1xuXG4gIHZhciBsb3dlcmVkQ2FzZSA9IGZhbHNlXG4gIGZvciAoOzspIHtcbiAgICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgICBjYXNlICdoZXgnOlxuICAgICAgICByZXR1cm4gaGV4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgY2FzZSAndXRmOCc6XG4gICAgICBjYXNlICd1dGYtOCc6XG4gICAgICAgIHJldHVybiB1dGY4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgY2FzZSAnYXNjaWknOlxuICAgICAgICByZXR1cm4gYXNjaWlXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuXG4gICAgICBjYXNlICdsYXRpbjEnOlxuICAgICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgICAgcmV0dXJuIGxhdGluMVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICAgIC8vIFdhcm5pbmc6IG1heExlbmd0aCBub3QgdGFrZW4gaW50byBhY2NvdW50IGluIGJhc2U2NFdyaXRlXG4gICAgICAgIHJldHVybiBiYXNlNjRXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuXG4gICAgICBjYXNlICd1Y3MyJzpcbiAgICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgICByZXR1cm4gdWNzMldyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGlmIChsb3dlcmVkQ2FzZSkgdGhyb3cgbmV3IFR5cGVFcnJvcignVW5rbm93biBlbmNvZGluZzogJyArIGVuY29kaW5nKVxuICAgICAgICBlbmNvZGluZyA9ICgnJyArIGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIGxvd2VyZWRDYXNlID0gdHJ1ZVxuICAgIH1cbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uIHRvSlNPTiAoKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ0J1ZmZlcicsXG4gICAgZGF0YTogQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwodGhpcy5fYXJyIHx8IHRoaXMsIDApXG4gIH1cbn1cblxuZnVuY3Rpb24gYmFzZTY0U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICBpZiAoc3RhcnQgPT09IDAgJiYgZW5kID09PSBidWYubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1ZilcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gYmFzZTY0LmZyb21CeXRlQXJyYXkoYnVmLnNsaWNlKHN0YXJ0LCBlbmQpKVxuICB9XG59XG5cbmZ1bmN0aW9uIHV0ZjhTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcbiAgdmFyIHJlcyA9IFtdXG5cbiAgdmFyIGkgPSBzdGFydFxuICB3aGlsZSAoaSA8IGVuZCkge1xuICAgIHZhciBmaXJzdEJ5dGUgPSBidWZbaV1cbiAgICB2YXIgY29kZVBvaW50ID0gbnVsbFxuICAgIHZhciBieXRlc1BlclNlcXVlbmNlID0gKGZpcnN0Qnl0ZSA+IDB4RUYpID8gNFxuICAgICAgOiAoZmlyc3RCeXRlID4gMHhERikgPyAzXG4gICAgICAgIDogKGZpcnN0Qnl0ZSA+IDB4QkYpID8gMlxuICAgICAgICAgIDogMVxuXG4gICAgaWYgKGkgKyBieXRlc1BlclNlcXVlbmNlIDw9IGVuZCkge1xuICAgICAgdmFyIHNlY29uZEJ5dGUsIHRoaXJkQnl0ZSwgZm91cnRoQnl0ZSwgdGVtcENvZGVQb2ludFxuXG4gICAgICBzd2l0Y2ggKGJ5dGVzUGVyU2VxdWVuY2UpIHtcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgIGlmIChmaXJzdEJ5dGUgPCAweDgwKSB7XG4gICAgICAgICAgICBjb2RlUG9pbnQgPSBmaXJzdEJ5dGVcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgIHNlY29uZEJ5dGUgPSBidWZbaSArIDFdXG4gICAgICAgICAgaWYgKChzZWNvbmRCeXRlICYgMHhDMCkgPT09IDB4ODApIHtcbiAgICAgICAgICAgIHRlbXBDb2RlUG9pbnQgPSAoZmlyc3RCeXRlICYgMHgxRikgPDwgMHg2IHwgKHNlY29uZEJ5dGUgJiAweDNGKVxuICAgICAgICAgICAgaWYgKHRlbXBDb2RlUG9pbnQgPiAweDdGKSB7XG4gICAgICAgICAgICAgIGNvZGVQb2ludCA9IHRlbXBDb2RlUG9pbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgIHNlY29uZEJ5dGUgPSBidWZbaSArIDFdXG4gICAgICAgICAgdGhpcmRCeXRlID0gYnVmW2kgKyAyXVxuICAgICAgICAgIGlmICgoc2Vjb25kQnl0ZSAmIDB4QzApID09PSAweDgwICYmICh0aGlyZEJ5dGUgJiAweEMwKSA9PT0gMHg4MCkge1xuICAgICAgICAgICAgdGVtcENvZGVQb2ludCA9IChmaXJzdEJ5dGUgJiAweEYpIDw8IDB4QyB8IChzZWNvbmRCeXRlICYgMHgzRikgPDwgMHg2IHwgKHRoaXJkQnl0ZSAmIDB4M0YpXG4gICAgICAgICAgICBpZiAodGVtcENvZGVQb2ludCA+IDB4N0ZGICYmICh0ZW1wQ29kZVBvaW50IDwgMHhEODAwIHx8IHRlbXBDb2RlUG9pbnQgPiAweERGRkYpKSB7XG4gICAgICAgICAgICAgIGNvZGVQb2ludCA9IHRlbXBDb2RlUG9pbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgIHNlY29uZEJ5dGUgPSBidWZbaSArIDFdXG4gICAgICAgICAgdGhpcmRCeXRlID0gYnVmW2kgKyAyXVxuICAgICAgICAgIGZvdXJ0aEJ5dGUgPSBidWZbaSArIDNdXG4gICAgICAgICAgaWYgKChzZWNvbmRCeXRlICYgMHhDMCkgPT09IDB4ODAgJiYgKHRoaXJkQnl0ZSAmIDB4QzApID09PSAweDgwICYmIChmb3VydGhCeXRlICYgMHhDMCkgPT09IDB4ODApIHtcbiAgICAgICAgICAgIHRlbXBDb2RlUG9pbnQgPSAoZmlyc3RCeXRlICYgMHhGKSA8PCAweDEyIHwgKHNlY29uZEJ5dGUgJiAweDNGKSA8PCAweEMgfCAodGhpcmRCeXRlICYgMHgzRikgPDwgMHg2IHwgKGZvdXJ0aEJ5dGUgJiAweDNGKVxuICAgICAgICAgICAgaWYgKHRlbXBDb2RlUG9pbnQgPiAweEZGRkYgJiYgdGVtcENvZGVQb2ludCA8IDB4MTEwMDAwKSB7XG4gICAgICAgICAgICAgIGNvZGVQb2ludCA9IHRlbXBDb2RlUG9pbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGNvZGVQb2ludCA9PT0gbnVsbCkge1xuICAgICAgLy8gd2UgZGlkIG5vdCBnZW5lcmF0ZSBhIHZhbGlkIGNvZGVQb2ludCBzbyBpbnNlcnQgYVxuICAgICAgLy8gcmVwbGFjZW1lbnQgY2hhciAoVStGRkZEKSBhbmQgYWR2YW5jZSBvbmx5IDEgYnl0ZVxuICAgICAgY29kZVBvaW50ID0gMHhGRkZEXG4gICAgICBieXRlc1BlclNlcXVlbmNlID0gMVxuICAgIH0gZWxzZSBpZiAoY29kZVBvaW50ID4gMHhGRkZGKSB7XG4gICAgICAvLyBlbmNvZGUgdG8gdXRmMTYgKHN1cnJvZ2F0ZSBwYWlyIGRhbmNlKVxuICAgICAgY29kZVBvaW50IC09IDB4MTAwMDBcbiAgICAgIHJlcy5wdXNoKGNvZGVQb2ludCA+Pj4gMTAgJiAweDNGRiB8IDB4RDgwMClcbiAgICAgIGNvZGVQb2ludCA9IDB4REMwMCB8IGNvZGVQb2ludCAmIDB4M0ZGXG4gICAgfVxuXG4gICAgcmVzLnB1c2goY29kZVBvaW50KVxuICAgIGkgKz0gYnl0ZXNQZXJTZXF1ZW5jZVxuICB9XG5cbiAgcmV0dXJuIGRlY29kZUNvZGVQb2ludHNBcnJheShyZXMpXG59XG5cbi8vIEJhc2VkIG9uIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzIyNzQ3MjcyLzY4MDc0MiwgdGhlIGJyb3dzZXIgd2l0aFxuLy8gdGhlIGxvd2VzdCBsaW1pdCBpcyBDaHJvbWUsIHdpdGggMHgxMDAwMCBhcmdzLlxuLy8gV2UgZ28gMSBtYWduaXR1ZGUgbGVzcywgZm9yIHNhZmV0eVxudmFyIE1BWF9BUkdVTUVOVFNfTEVOR1RIID0gMHgxMDAwXG5cbmZ1bmN0aW9uIGRlY29kZUNvZGVQb2ludHNBcnJheSAoY29kZVBvaW50cykge1xuICB2YXIgbGVuID0gY29kZVBvaW50cy5sZW5ndGhcbiAgaWYgKGxlbiA8PSBNQVhfQVJHVU1FTlRTX0xFTkdUSCkge1xuICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KFN0cmluZywgY29kZVBvaW50cykgLy8gYXZvaWQgZXh0cmEgc2xpY2UoKVxuICB9XG5cbiAgLy8gRGVjb2RlIGluIGNodW5rcyB0byBhdm9pZCBcImNhbGwgc3RhY2sgc2l6ZSBleGNlZWRlZFwiLlxuICB2YXIgcmVzID0gJydcbiAgdmFyIGkgPSAwXG4gIHdoaWxlIChpIDwgbGVuKSB7XG4gICAgcmVzICs9IFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkoXG4gICAgICBTdHJpbmcsXG4gICAgICBjb2RlUG9pbnRzLnNsaWNlKGksIGkgKz0gTUFYX0FSR1VNRU5UU19MRU5HVEgpXG4gICAgKVxuICB9XG4gIHJldHVybiByZXNcbn1cblxuZnVuY3Rpb24gYXNjaWlTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciByZXQgPSAnJ1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyArK2kpIHtcbiAgICByZXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0gJiAweDdGKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuZnVuY3Rpb24gbGF0aW4xU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgcmV0ID0gJydcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgKytpKSB7XG4gICAgcmV0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuZnVuY3Rpb24gaGV4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuXG4gIGlmICghc3RhcnQgfHwgc3RhcnQgPCAwKSBzdGFydCA9IDBcbiAgaWYgKCFlbmQgfHwgZW5kIDwgMCB8fCBlbmQgPiBsZW4pIGVuZCA9IGxlblxuXG4gIHZhciBvdXQgPSAnJ1xuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7ICsraSkge1xuICAgIG91dCArPSB0b0hleChidWZbaV0pXG4gIH1cbiAgcmV0dXJuIG91dFxufVxuXG5mdW5jdGlvbiB1dGYxNmxlU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgYnl0ZXMgPSBidWYuc2xpY2Uoc3RhcnQsIGVuZClcbiAgdmFyIHJlcyA9ICcnXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpICs9IDIpIHtcbiAgICByZXMgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShieXRlc1tpXSArIChieXRlc1tpICsgMV0gKiAyNTYpKVxuICB9XG4gIHJldHVybiByZXNcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5zbGljZSA9IGZ1bmN0aW9uIHNsaWNlIChzdGFydCwgZW5kKSB7XG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxuICBzdGFydCA9IH5+c3RhcnRcbiAgZW5kID0gZW5kID09PSB1bmRlZmluZWQgPyBsZW4gOiB+fmVuZFxuXG4gIGlmIChzdGFydCA8IDApIHtcbiAgICBzdGFydCArPSBsZW5cbiAgICBpZiAoc3RhcnQgPCAwKSBzdGFydCA9IDBcbiAgfSBlbHNlIGlmIChzdGFydCA+IGxlbikge1xuICAgIHN0YXJ0ID0gbGVuXG4gIH1cblxuICBpZiAoZW5kIDwgMCkge1xuICAgIGVuZCArPSBsZW5cbiAgICBpZiAoZW5kIDwgMCkgZW5kID0gMFxuICB9IGVsc2UgaWYgKGVuZCA+IGxlbikge1xuICAgIGVuZCA9IGxlblxuICB9XG5cbiAgaWYgKGVuZCA8IHN0YXJ0KSBlbmQgPSBzdGFydFxuXG4gIHZhciBuZXdCdWYgPSB0aGlzLnN1YmFycmF5KHN0YXJ0LCBlbmQpXG4gIC8vIFJldHVybiBhbiBhdWdtZW50ZWQgYFVpbnQ4QXJyYXlgIGluc3RhbmNlXG4gIG5ld0J1Zi5fX3Byb3RvX18gPSBCdWZmZXIucHJvdG90eXBlXG4gIHJldHVybiBuZXdCdWZcbn1cblxuLypcbiAqIE5lZWQgdG8gbWFrZSBzdXJlIHRoYXQgYnVmZmVyIGlzbid0IHRyeWluZyB0byB3cml0ZSBvdXQgb2YgYm91bmRzLlxuICovXG5mdW5jdGlvbiBjaGVja09mZnNldCAob2Zmc2V0LCBleHQsIGxlbmd0aCkge1xuICBpZiAoKG9mZnNldCAlIDEpICE9PSAwIHx8IG9mZnNldCA8IDApIHRocm93IG5ldyBSYW5nZUVycm9yKCdvZmZzZXQgaXMgbm90IHVpbnQnKVxuICBpZiAob2Zmc2V0ICsgZXh0ID4gbGVuZ3RoKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignVHJ5aW5nIHRvIGFjY2VzcyBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnRMRSA9IGZ1bmN0aW9uIHJlYWRVSW50TEUgKG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgYnl0ZUxlbmd0aCwgdGhpcy5sZW5ndGgpXG5cbiAgdmFyIHZhbCA9IHRoaXNbb2Zmc2V0XVxuICB2YXIgbXVsID0gMVxuICB2YXIgaSA9IDBcbiAgd2hpbGUgKCsraSA8IGJ5dGVMZW5ndGggJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB2YWwgKz0gdGhpc1tvZmZzZXQgKyBpXSAqIG11bFxuICB9XG5cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50QkUgPSBmdW5jdGlvbiByZWFkVUludEJFIChvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgY2hlY2tPZmZzZXQob2Zmc2V0LCBieXRlTGVuZ3RoLCB0aGlzLmxlbmd0aClcbiAgfVxuXG4gIHZhciB2YWwgPSB0aGlzW29mZnNldCArIC0tYnl0ZUxlbmd0aF1cbiAgdmFyIG11bCA9IDFcbiAgd2hpbGUgKGJ5dGVMZW5ndGggPiAwICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdmFsICs9IHRoaXNbb2Zmc2V0ICsgLS1ieXRlTGVuZ3RoXSAqIG11bFxuICB9XG5cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50OCA9IGZ1bmN0aW9uIHJlYWRVSW50OCAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAxLCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIHRoaXNbb2Zmc2V0XVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZMRSA9IGZ1bmN0aW9uIHJlYWRVSW50MTZMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAyLCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIHRoaXNbb2Zmc2V0XSB8ICh0aGlzW29mZnNldCArIDFdIDw8IDgpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQxNkJFID0gZnVuY3Rpb24gcmVhZFVJbnQxNkJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDIsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gKHRoaXNbb2Zmc2V0XSA8PCA4KSB8IHRoaXNbb2Zmc2V0ICsgMV1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyTEUgPSBmdW5jdGlvbiByZWFkVUludDMyTEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICgodGhpc1tvZmZzZXRdKSB8XG4gICAgICAodGhpc1tvZmZzZXQgKyAxXSA8PCA4KSB8XG4gICAgICAodGhpc1tvZmZzZXQgKyAyXSA8PCAxNikpICtcbiAgICAgICh0aGlzW29mZnNldCArIDNdICogMHgxMDAwMDAwKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MzJCRSA9IGZ1bmN0aW9uIHJlYWRVSW50MzJCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcblxuICByZXR1cm4gKHRoaXNbb2Zmc2V0XSAqIDB4MTAwMDAwMCkgK1xuICAgICgodGhpc1tvZmZzZXQgKyAxXSA8PCAxNikgfFxuICAgICh0aGlzW29mZnNldCArIDJdIDw8IDgpIHxcbiAgICB0aGlzW29mZnNldCArIDNdKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnRMRSA9IGZ1bmN0aW9uIHJlYWRJbnRMRSAob2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCBieXRlTGVuZ3RoLCB0aGlzLmxlbmd0aClcblxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXRdXG4gIHZhciBtdWwgPSAxXG4gIHZhciBpID0gMFxuICB3aGlsZSAoKytpIDwgYnl0ZUxlbmd0aCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHZhbCArPSB0aGlzW29mZnNldCArIGldICogbXVsXG4gIH1cbiAgbXVsICo9IDB4ODBcblxuICBpZiAodmFsID49IG11bCkgdmFsIC09IE1hdGgucG93KDIsIDggKiBieXRlTGVuZ3RoKVxuXG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50QkUgPSBmdW5jdGlvbiByZWFkSW50QkUgKG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgYnl0ZUxlbmd0aCwgdGhpcy5sZW5ndGgpXG5cbiAgdmFyIGkgPSBieXRlTGVuZ3RoXG4gIHZhciBtdWwgPSAxXG4gIHZhciB2YWwgPSB0aGlzW29mZnNldCArIC0taV1cbiAgd2hpbGUgKGkgPiAwICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdmFsICs9IHRoaXNbb2Zmc2V0ICsgLS1pXSAqIG11bFxuICB9XG4gIG11bCAqPSAweDgwXG5cbiAgaWYgKHZhbCA+PSBtdWwpIHZhbCAtPSBNYXRoLnBvdygyLCA4ICogYnl0ZUxlbmd0aClcblxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDggPSBmdW5jdGlvbiByZWFkSW50OCAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAxLCB0aGlzLmxlbmd0aClcbiAgaWYgKCEodGhpc1tvZmZzZXRdICYgMHg4MCkpIHJldHVybiAodGhpc1tvZmZzZXRdKVxuICByZXR1cm4gKCgweGZmIC0gdGhpc1tvZmZzZXRdICsgMSkgKiAtMSlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MTZMRSA9IGZ1bmN0aW9uIHJlYWRJbnQxNkxFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDIsIHRoaXMubGVuZ3RoKVxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXRdIHwgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgOClcbiAgcmV0dXJuICh2YWwgJiAweDgwMDApID8gdmFsIHwgMHhGRkZGMDAwMCA6IHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkJFID0gZnVuY3Rpb24gcmVhZEludDE2QkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMiwgdGhpcy5sZW5ndGgpXG4gIHZhciB2YWwgPSB0aGlzW29mZnNldCArIDFdIHwgKHRoaXNbb2Zmc2V0XSA8PCA4KVxuICByZXR1cm4gKHZhbCAmIDB4ODAwMCkgPyB2YWwgfCAweEZGRkYwMDAwIDogdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDMyTEUgPSBmdW5jdGlvbiByZWFkSW50MzJMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcblxuICByZXR1cm4gKHRoaXNbb2Zmc2V0XSkgfFxuICAgICh0aGlzW29mZnNldCArIDFdIDw8IDgpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAyXSA8PCAxNikgfFxuICAgICh0aGlzW29mZnNldCArIDNdIDw8IDI0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQzMkJFID0gZnVuY3Rpb24gcmVhZEludDMyQkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICh0aGlzW29mZnNldF0gPDwgMjQpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAxXSA8PCAxNikgfFxuICAgICh0aGlzW29mZnNldCArIDJdIDw8IDgpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAzXSlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRMRSA9IGZ1bmN0aW9uIHJlYWRGbG9hdExFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gaWVlZTc1NC5yZWFkKHRoaXMsIG9mZnNldCwgdHJ1ZSwgMjMsIDQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEZsb2F0QkUgPSBmdW5jdGlvbiByZWFkRmxvYXRCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIGZhbHNlLCAyMywgNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRG91YmxlTEUgPSBmdW5jdGlvbiByZWFkRG91YmxlTEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgOCwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiBpZWVlNzU0LnJlYWQodGhpcywgb2Zmc2V0LCB0cnVlLCA1MiwgOClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRG91YmxlQkUgPSBmdW5jdGlvbiByZWFkRG91YmxlQkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgOCwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiBpZWVlNzU0LnJlYWQodGhpcywgb2Zmc2V0LCBmYWxzZSwgNTIsIDgpXG59XG5cbmZ1bmN0aW9uIGNoZWNrSW50IChidWYsIHZhbHVlLCBvZmZzZXQsIGV4dCwgbWF4LCBtaW4pIHtcbiAgaWYgKCFCdWZmZXIuaXNCdWZmZXIoYnVmKSkgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJidWZmZXJcIiBhcmd1bWVudCBtdXN0IGJlIGEgQnVmZmVyIGluc3RhbmNlJylcbiAgaWYgKHZhbHVlID4gbWF4IHx8IHZhbHVlIDwgbWluKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignXCJ2YWx1ZVwiIGFyZ3VtZW50IGlzIG91dCBvZiBib3VuZHMnKVxuICBpZiAob2Zmc2V0ICsgZXh0ID4gYnVmLmxlbmd0aCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0luZGV4IG91dCBvZiByYW5nZScpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50TEUgPSBmdW5jdGlvbiB3cml0ZVVJbnRMRSAodmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICB2YXIgbWF4Qnl0ZXMgPSBNYXRoLnBvdygyLCA4ICogYnl0ZUxlbmd0aCkgLSAxXG4gICAgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbWF4Qnl0ZXMsIDApXG4gIH1cblxuICB2YXIgbXVsID0gMVxuICB2YXIgaSA9IDBcbiAgdGhpc1tvZmZzZXRdID0gdmFsdWUgJiAweEZGXG4gIHdoaWxlICgrK2kgPCBieXRlTGVuZ3RoICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdGhpc1tvZmZzZXQgKyBpXSA9ICh2YWx1ZSAvIG11bCkgJiAweEZGXG4gIH1cblxuICByZXR1cm4gb2Zmc2V0ICsgYnl0ZUxlbmd0aFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludEJFID0gZnVuY3Rpb24gd3JpdGVVSW50QkUgKHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgdmFyIG1heEJ5dGVzID0gTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGgpIC0gMVxuICAgIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG1heEJ5dGVzLCAwKVxuICB9XG5cbiAgdmFyIGkgPSBieXRlTGVuZ3RoIC0gMVxuICB2YXIgbXVsID0gMVxuICB0aGlzW29mZnNldCArIGldID0gdmFsdWUgJiAweEZGXG4gIHdoaWxlICgtLWkgPj0gMCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHRoaXNbb2Zmc2V0ICsgaV0gPSAodmFsdWUgLyBtdWwpICYgMHhGRlxuICB9XG5cbiAgcmV0dXJuIG9mZnNldCArIGJ5dGVMZW5ndGhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQ4ID0gZnVuY3Rpb24gd3JpdGVVSW50OCAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDEsIDB4ZmYsIDApXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHJldHVybiBvZmZzZXQgKyAxXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MTZMRSA9IGZ1bmN0aW9uIHdyaXRlVUludDE2TEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAyLCAweGZmZmYsIDApXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDgpXG4gIHJldHVybiBvZmZzZXQgKyAyXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MTZCRSA9IGZ1bmN0aW9uIHdyaXRlVUludDE2QkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAyLCAweGZmZmYsIDApXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSA+Pj4gOClcbiAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHJldHVybiBvZmZzZXQgKyAyXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJMRSA9IGZ1bmN0aW9uIHdyaXRlVUludDMyTEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCA0LCAweGZmZmZmZmZmLCAwKVxuICB0aGlzW29mZnNldCArIDNdID0gKHZhbHVlID4+PiAyNClcbiAgdGhpc1tvZmZzZXQgKyAyXSA9ICh2YWx1ZSA+Pj4gMTYpXG4gIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDgpXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJCRSA9IGZ1bmN0aW9uIHdyaXRlVUludDMyQkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCA0LCAweGZmZmZmZmZmLCAwKVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgPj4+IDI0KVxuICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiAxNilcbiAgdGhpc1tvZmZzZXQgKyAyXSA9ICh2YWx1ZSA+Pj4gOClcbiAgdGhpc1tvZmZzZXQgKyAzXSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnRMRSA9IGZ1bmN0aW9uIHdyaXRlSW50TEUgKHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgdmFyIGxpbWl0ID0gTWF0aC5wb3coMiwgKDggKiBieXRlTGVuZ3RoKSAtIDEpXG5cbiAgICBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBsaW1pdCAtIDEsIC1saW1pdClcbiAgfVxuXG4gIHZhciBpID0gMFxuICB2YXIgbXVsID0gMVxuICB2YXIgc3ViID0gMFxuICB0aGlzW29mZnNldF0gPSB2YWx1ZSAmIDB4RkZcbiAgd2hpbGUgKCsraSA8IGJ5dGVMZW5ndGggJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICBpZiAodmFsdWUgPCAwICYmIHN1YiA9PT0gMCAmJiB0aGlzW29mZnNldCArIGkgLSAxXSAhPT0gMCkge1xuICAgICAgc3ViID0gMVxuICAgIH1cbiAgICB0aGlzW29mZnNldCArIGldID0gKCh2YWx1ZSAvIG11bCkgPj4gMCkgLSBzdWIgJiAweEZGXG4gIH1cblxuICByZXR1cm4gb2Zmc2V0ICsgYnl0ZUxlbmd0aFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50QkUgPSBmdW5jdGlvbiB3cml0ZUludEJFICh2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIHZhciBsaW1pdCA9IE1hdGgucG93KDIsICg4ICogYnl0ZUxlbmd0aCkgLSAxKVxuXG4gICAgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbGltaXQgLSAxLCAtbGltaXQpXG4gIH1cblxuICB2YXIgaSA9IGJ5dGVMZW5ndGggLSAxXG4gIHZhciBtdWwgPSAxXG4gIHZhciBzdWIgPSAwXG4gIHRoaXNbb2Zmc2V0ICsgaV0gPSB2YWx1ZSAmIDB4RkZcbiAgd2hpbGUgKC0taSA+PSAwICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgaWYgKHZhbHVlIDwgMCAmJiBzdWIgPT09IDAgJiYgdGhpc1tvZmZzZXQgKyBpICsgMV0gIT09IDApIHtcbiAgICAgIHN1YiA9IDFcbiAgICB9XG4gICAgdGhpc1tvZmZzZXQgKyBpXSA9ICgodmFsdWUgLyBtdWwpID4+IDApIC0gc3ViICYgMHhGRlxuICB9XG5cbiAgcmV0dXJuIG9mZnNldCArIGJ5dGVMZW5ndGhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDggPSBmdW5jdGlvbiB3cml0ZUludDggKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAxLCAweDdmLCAtMHg4MClcbiAgaWYgKHZhbHVlIDwgMCkgdmFsdWUgPSAweGZmICsgdmFsdWUgKyAxXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHJldHVybiBvZmZzZXQgKyAxXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkxFID0gZnVuY3Rpb24gd3JpdGVJbnQxNkxFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMiwgMHg3ZmZmLCAtMHg4MDAwKVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiA4KVxuICByZXR1cm4gb2Zmc2V0ICsgMlxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZCRSA9IGZ1bmN0aW9uIHdyaXRlSW50MTZCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDIsIDB4N2ZmZiwgLTB4ODAwMClcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlID4+PiA4KVxuICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlICYgMHhmZilcbiAgcmV0dXJuIG9mZnNldCArIDJcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDMyTEUgPSBmdW5jdGlvbiB3cml0ZUludDMyTEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCA0LCAweDdmZmZmZmZmLCAtMHg4MDAwMDAwMClcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gOClcbiAgdGhpc1tvZmZzZXQgKyAyXSA9ICh2YWx1ZSA+Pj4gMTYpXG4gIHRoaXNbb2Zmc2V0ICsgM10gPSAodmFsdWUgPj4+IDI0KVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MzJCRSA9IGZ1bmN0aW9uIHdyaXRlSW50MzJCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDQsIDB4N2ZmZmZmZmYsIC0weDgwMDAwMDAwKVxuICBpZiAodmFsdWUgPCAwKSB2YWx1ZSA9IDB4ZmZmZmZmZmYgKyB2YWx1ZSArIDFcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlID4+PiAyNClcbiAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gMTYpXG4gIHRoaXNbb2Zmc2V0ICsgMl0gPSAodmFsdWUgPj4+IDgpXG4gIHRoaXNbb2Zmc2V0ICsgM10gPSAodmFsdWUgJiAweGZmKVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5mdW5jdGlvbiBjaGVja0lFRUU3NTQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgZXh0LCBtYXgsIG1pbikge1xuICBpZiAob2Zmc2V0ICsgZXh0ID4gYnVmLmxlbmd0aCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0luZGV4IG91dCBvZiByYW5nZScpXG4gIGlmIChvZmZzZXQgPCAwKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW5kZXggb3V0IG9mIHJhbmdlJylcbn1cblxuZnVuY3Rpb24gd3JpdGVGbG9hdCAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgY2hlY2tJRUVFNzU0KGJ1ZiwgdmFsdWUsIG9mZnNldCwgNCwgMy40MDI4MjM0NjYzODUyODg2ZSszOCwgLTMuNDAyODIzNDY2Mzg1Mjg4NmUrMzgpXG4gIH1cbiAgaWVlZTc1NC53cml0ZShidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgMjMsIDQpXG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVGbG9hdExFID0gZnVuY3Rpb24gd3JpdGVGbG9hdExFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gd3JpdGVGbG9hdCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0QkUgPSBmdW5jdGlvbiB3cml0ZUZsb2F0QkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiB3cml0ZUZsb2F0KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gd3JpdGVEb3VibGUgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGNoZWNrSUVFRTc1NChidWYsIHZhbHVlLCBvZmZzZXQsIDgsIDEuNzk3NjkzMTM0ODYyMzE1N0UrMzA4LCAtMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgpXG4gIH1cbiAgaWVlZTc1NC53cml0ZShidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgNTIsIDgpXG4gIHJldHVybiBvZmZzZXQgKyA4XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVEb3VibGVMRSA9IGZ1bmN0aW9uIHdyaXRlRG91YmxlTEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiB3cml0ZURvdWJsZSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZURvdWJsZUJFID0gZnVuY3Rpb24gd3JpdGVEb3VibGVCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHdyaXRlRG91YmxlKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuLy8gY29weSh0YXJnZXRCdWZmZXIsIHRhcmdldFN0YXJ0PTAsIHNvdXJjZVN0YXJ0PTAsIHNvdXJjZUVuZD1idWZmZXIubGVuZ3RoKVxuQnVmZmVyLnByb3RvdHlwZS5jb3B5ID0gZnVuY3Rpb24gY29weSAodGFyZ2V0LCB0YXJnZXRTdGFydCwgc3RhcnQsIGVuZCkge1xuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcih0YXJnZXQpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdhcmd1bWVudCBzaG91bGQgYmUgYSBCdWZmZXInKVxuICBpZiAoIXN0YXJ0KSBzdGFydCA9IDBcbiAgaWYgKCFlbmQgJiYgZW5kICE9PSAwKSBlbmQgPSB0aGlzLmxlbmd0aFxuICBpZiAodGFyZ2V0U3RhcnQgPj0gdGFyZ2V0Lmxlbmd0aCkgdGFyZ2V0U3RhcnQgPSB0YXJnZXQubGVuZ3RoXG4gIGlmICghdGFyZ2V0U3RhcnQpIHRhcmdldFN0YXJ0ID0gMFxuICBpZiAoZW5kID4gMCAmJiBlbmQgPCBzdGFydCkgZW5kID0gc3RhcnRcblxuICAvLyBDb3B5IDAgYnl0ZXM7IHdlJ3JlIGRvbmVcbiAgaWYgKGVuZCA9PT0gc3RhcnQpIHJldHVybiAwXG4gIGlmICh0YXJnZXQubGVuZ3RoID09PSAwIHx8IHRoaXMubGVuZ3RoID09PSAwKSByZXR1cm4gMFxuXG4gIC8vIEZhdGFsIGVycm9yIGNvbmRpdGlvbnNcbiAgaWYgKHRhcmdldFN0YXJ0IDwgMCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCd0YXJnZXRTdGFydCBvdXQgb2YgYm91bmRzJylcbiAgfVxuICBpZiAoc3RhcnQgPCAwIHx8IHN0YXJ0ID49IHRoaXMubGVuZ3RoKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW5kZXggb3V0IG9mIHJhbmdlJylcbiAgaWYgKGVuZCA8IDApIHRocm93IG5ldyBSYW5nZUVycm9yKCdzb3VyY2VFbmQgb3V0IG9mIGJvdW5kcycpXG5cbiAgLy8gQXJlIHdlIG9vYj9cbiAgaWYgKGVuZCA+IHRoaXMubGVuZ3RoKSBlbmQgPSB0aGlzLmxlbmd0aFxuICBpZiAodGFyZ2V0Lmxlbmd0aCAtIHRhcmdldFN0YXJ0IDwgZW5kIC0gc3RhcnQpIHtcbiAgICBlbmQgPSB0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0U3RhcnQgKyBzdGFydFxuICB9XG5cbiAgdmFyIGxlbiA9IGVuZCAtIHN0YXJ0XG5cbiAgaWYgKHRoaXMgPT09IHRhcmdldCAmJiB0eXBlb2YgVWludDhBcnJheS5wcm90b3R5cGUuY29weVdpdGhpbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIC8vIFVzZSBidWlsdC1pbiB3aGVuIGF2YWlsYWJsZSwgbWlzc2luZyBmcm9tIElFMTFcbiAgICB0aGlzLmNvcHlXaXRoaW4odGFyZ2V0U3RhcnQsIHN0YXJ0LCBlbmQpXG4gIH0gZWxzZSBpZiAodGhpcyA9PT0gdGFyZ2V0ICYmIHN0YXJ0IDwgdGFyZ2V0U3RhcnQgJiYgdGFyZ2V0U3RhcnQgPCBlbmQpIHtcbiAgICAvLyBkZXNjZW5kaW5nIGNvcHkgZnJvbSBlbmRcbiAgICBmb3IgKHZhciBpID0gbGVuIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgIHRhcmdldFtpICsgdGFyZ2V0U3RhcnRdID0gdGhpc1tpICsgc3RhcnRdXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIFVpbnQ4QXJyYXkucHJvdG90eXBlLnNldC5jYWxsKFxuICAgICAgdGFyZ2V0LFxuICAgICAgdGhpcy5zdWJhcnJheShzdGFydCwgZW5kKSxcbiAgICAgIHRhcmdldFN0YXJ0XG4gICAgKVxuICB9XG5cbiAgcmV0dXJuIGxlblxufVxuXG4vLyBVc2FnZTpcbi8vICAgIGJ1ZmZlci5maWxsKG51bWJlclssIG9mZnNldFssIGVuZF1dKVxuLy8gICAgYnVmZmVyLmZpbGwoYnVmZmVyWywgb2Zmc2V0WywgZW5kXV0pXG4vLyAgICBidWZmZXIuZmlsbChzdHJpbmdbLCBvZmZzZXRbLCBlbmRdXVssIGVuY29kaW5nXSlcbkJ1ZmZlci5wcm90b3R5cGUuZmlsbCA9IGZ1bmN0aW9uIGZpbGwgKHZhbCwgc3RhcnQsIGVuZCwgZW5jb2RpbmcpIHtcbiAgLy8gSGFuZGxlIHN0cmluZyBjYXNlczpcbiAgaWYgKHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnKSB7XG4gICAgaWYgKHR5cGVvZiBzdGFydCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGVuY29kaW5nID0gc3RhcnRcbiAgICAgIHN0YXJ0ID0gMFxuICAgICAgZW5kID0gdGhpcy5sZW5ndGhcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBlbmQgPT09ICdzdHJpbmcnKSB7XG4gICAgICBlbmNvZGluZyA9IGVuZFxuICAgICAgZW5kID0gdGhpcy5sZW5ndGhcbiAgICB9XG4gICAgaWYgKGVuY29kaW5nICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIGVuY29kaW5nICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignZW5jb2RpbmcgbXVzdCBiZSBhIHN0cmluZycpXG4gICAgfVxuICAgIGlmICh0eXBlb2YgZW5jb2RpbmcgPT09ICdzdHJpbmcnICYmICFCdWZmZXIuaXNFbmNvZGluZyhlbmNvZGluZykpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1Vua25vd24gZW5jb2Rpbmc6ICcgKyBlbmNvZGluZylcbiAgICB9XG4gICAgaWYgKHZhbC5sZW5ndGggPT09IDEpIHtcbiAgICAgIHZhciBjb2RlID0gdmFsLmNoYXJDb2RlQXQoMClcbiAgICAgIGlmICgoZW5jb2RpbmcgPT09ICd1dGY4JyAmJiBjb2RlIDwgMTI4KSB8fFxuICAgICAgICAgIGVuY29kaW5nID09PSAnbGF0aW4xJykge1xuICAgICAgICAvLyBGYXN0IHBhdGg6IElmIGB2YWxgIGZpdHMgaW50byBhIHNpbmdsZSBieXRlLCB1c2UgdGhhdCBudW1lcmljIHZhbHVlLlxuICAgICAgICB2YWwgPSBjb2RlXG4gICAgICB9XG4gICAgfVxuICB9IGVsc2UgaWYgKHR5cGVvZiB2YWwgPT09ICdudW1iZXInKSB7XG4gICAgdmFsID0gdmFsICYgMjU1XG4gIH1cblxuICAvLyBJbnZhbGlkIHJhbmdlcyBhcmUgbm90IHNldCB0byBhIGRlZmF1bHQsIHNvIGNhbiByYW5nZSBjaGVjayBlYXJseS5cbiAgaWYgKHN0YXJ0IDwgMCB8fCB0aGlzLmxlbmd0aCA8IHN0YXJ0IHx8IHRoaXMubGVuZ3RoIDwgZW5kKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ091dCBvZiByYW5nZSBpbmRleCcpXG4gIH1cblxuICBpZiAoZW5kIDw9IHN0YXJ0KSB7XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHN0YXJ0ID0gc3RhcnQgPj4+IDBcbiAgZW5kID0gZW5kID09PSB1bmRlZmluZWQgPyB0aGlzLmxlbmd0aCA6IGVuZCA+Pj4gMFxuXG4gIGlmICghdmFsKSB2YWwgPSAwXG5cbiAgdmFyIGlcbiAgaWYgKHR5cGVvZiB2YWwgPT09ICdudW1iZXInKSB7XG4gICAgZm9yIChpID0gc3RhcnQ7IGkgPCBlbmQ7ICsraSkge1xuICAgICAgdGhpc1tpXSA9IHZhbFxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB2YXIgYnl0ZXMgPSBCdWZmZXIuaXNCdWZmZXIodmFsKVxuICAgICAgPyB2YWxcbiAgICAgIDogQnVmZmVyLmZyb20odmFsLCBlbmNvZGluZylcbiAgICB2YXIgbGVuID0gYnl0ZXMubGVuZ3RoXG4gICAgaWYgKGxlbiA9PT0gMCkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVGhlIHZhbHVlIFwiJyArIHZhbCArXG4gICAgICAgICdcIiBpcyBpbnZhbGlkIGZvciBhcmd1bWVudCBcInZhbHVlXCInKVxuICAgIH1cbiAgICBmb3IgKGkgPSAwOyBpIDwgZW5kIC0gc3RhcnQ7ICsraSkge1xuICAgICAgdGhpc1tpICsgc3RhcnRdID0gYnl0ZXNbaSAlIGxlbl1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpc1xufVxuXG4vLyBIRUxQRVIgRlVOQ1RJT05TXG4vLyA9PT09PT09PT09PT09PT09XG5cbnZhciBJTlZBTElEX0JBU0U2NF9SRSA9IC9bXisvMC05QS1aYS16LV9dL2dcblxuZnVuY3Rpb24gYmFzZTY0Y2xlYW4gKHN0cikge1xuICAvLyBOb2RlIHRha2VzIGVxdWFsIHNpZ25zIGFzIGVuZCBvZiB0aGUgQmFzZTY0IGVuY29kaW5nXG4gIHN0ciA9IHN0ci5zcGxpdCgnPScpWzBdXG4gIC8vIE5vZGUgc3RyaXBzIG91dCBpbnZhbGlkIGNoYXJhY3RlcnMgbGlrZSBcXG4gYW5kIFxcdCBmcm9tIHRoZSBzdHJpbmcsIGJhc2U2NC1qcyBkb2VzIG5vdFxuICBzdHIgPSBzdHIudHJpbSgpLnJlcGxhY2UoSU5WQUxJRF9CQVNFNjRfUkUsICcnKVxuICAvLyBOb2RlIGNvbnZlcnRzIHN0cmluZ3Mgd2l0aCBsZW5ndGggPCAyIHRvICcnXG4gIGlmIChzdHIubGVuZ3RoIDwgMikgcmV0dXJuICcnXG4gIC8vIE5vZGUgYWxsb3dzIGZvciBub24tcGFkZGVkIGJhc2U2NCBzdHJpbmdzIChtaXNzaW5nIHRyYWlsaW5nID09PSksIGJhc2U2NC1qcyBkb2VzIG5vdFxuICB3aGlsZSAoc3RyLmxlbmd0aCAlIDQgIT09IDApIHtcbiAgICBzdHIgPSBzdHIgKyAnPSdcbiAgfVxuICByZXR1cm4gc3RyXG59XG5cbmZ1bmN0aW9uIHRvSGV4IChuKSB7XG4gIGlmIChuIDwgMTYpIHJldHVybiAnMCcgKyBuLnRvU3RyaW5nKDE2KVxuICByZXR1cm4gbi50b1N0cmluZygxNilcbn1cblxuZnVuY3Rpb24gdXRmOFRvQnl0ZXMgKHN0cmluZywgdW5pdHMpIHtcbiAgdW5pdHMgPSB1bml0cyB8fCBJbmZpbml0eVxuICB2YXIgY29kZVBvaW50XG4gIHZhciBsZW5ndGggPSBzdHJpbmcubGVuZ3RoXG4gIHZhciBsZWFkU3Vycm9nYXRlID0gbnVsbFxuICB2YXIgYnl0ZXMgPSBbXVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyArK2kpIHtcbiAgICBjb2RlUG9pbnQgPSBzdHJpbmcuY2hhckNvZGVBdChpKVxuXG4gICAgLy8gaXMgc3Vycm9nYXRlIGNvbXBvbmVudFxuICAgIGlmIChjb2RlUG9pbnQgPiAweEQ3RkYgJiYgY29kZVBvaW50IDwgMHhFMDAwKSB7XG4gICAgICAvLyBsYXN0IGNoYXIgd2FzIGEgbGVhZFxuICAgICAgaWYgKCFsZWFkU3Vycm9nYXRlKSB7XG4gICAgICAgIC8vIG5vIGxlYWQgeWV0XG4gICAgICAgIGlmIChjb2RlUG9pbnQgPiAweERCRkYpIHtcbiAgICAgICAgICAvLyB1bmV4cGVjdGVkIHRyYWlsXG4gICAgICAgICAgaWYgKCh1bml0cyAtPSAzKSA+IC0xKSBieXRlcy5wdXNoKDB4RUYsIDB4QkYsIDB4QkQpXG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfSBlbHNlIGlmIChpICsgMSA9PT0gbGVuZ3RoKSB7XG4gICAgICAgICAgLy8gdW5wYWlyZWQgbGVhZFxuICAgICAgICAgIGlmICgodW5pdHMgLT0gMykgPiAtMSkgYnl0ZXMucHVzaCgweEVGLCAweEJGLCAweEJEKVxuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH1cblxuICAgICAgICAvLyB2YWxpZCBsZWFkXG4gICAgICAgIGxlYWRTdXJyb2dhdGUgPSBjb2RlUG9pbnRcblxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICAvLyAyIGxlYWRzIGluIGEgcm93XG4gICAgICBpZiAoY29kZVBvaW50IDwgMHhEQzAwKSB7XG4gICAgICAgIGlmICgodW5pdHMgLT0gMykgPiAtMSkgYnl0ZXMucHVzaCgweEVGLCAweEJGLCAweEJEKVxuICAgICAgICBsZWFkU3Vycm9nYXRlID0gY29kZVBvaW50XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIC8vIHZhbGlkIHN1cnJvZ2F0ZSBwYWlyXG4gICAgICBjb2RlUG9pbnQgPSAobGVhZFN1cnJvZ2F0ZSAtIDB4RDgwMCA8PCAxMCB8IGNvZGVQb2ludCAtIDB4REMwMCkgKyAweDEwMDAwXG4gICAgfSBlbHNlIGlmIChsZWFkU3Vycm9nYXRlKSB7XG4gICAgICAvLyB2YWxpZCBibXAgY2hhciwgYnV0IGxhc3QgY2hhciB3YXMgYSBsZWFkXG4gICAgICBpZiAoKHVuaXRzIC09IDMpID4gLTEpIGJ5dGVzLnB1c2goMHhFRiwgMHhCRiwgMHhCRClcbiAgICB9XG5cbiAgICBsZWFkU3Vycm9nYXRlID0gbnVsbFxuXG4gICAgLy8gZW5jb2RlIHV0ZjhcbiAgICBpZiAoY29kZVBvaW50IDwgMHg4MCkge1xuICAgICAgaWYgKCh1bml0cyAtPSAxKSA8IDApIGJyZWFrXG4gICAgICBieXRlcy5wdXNoKGNvZGVQb2ludClcbiAgICB9IGVsc2UgaWYgKGNvZGVQb2ludCA8IDB4ODAwKSB7XG4gICAgICBpZiAoKHVuaXRzIC09IDIpIDwgMCkgYnJlYWtcbiAgICAgIGJ5dGVzLnB1c2goXG4gICAgICAgIGNvZGVQb2ludCA+PiAweDYgfCAweEMwLFxuICAgICAgICBjb2RlUG9pbnQgJiAweDNGIHwgMHg4MFxuICAgICAgKVxuICAgIH0gZWxzZSBpZiAoY29kZVBvaW50IDwgMHgxMDAwMCkge1xuICAgICAgaWYgKCh1bml0cyAtPSAzKSA8IDApIGJyZWFrXG4gICAgICBieXRlcy5wdXNoKFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHhDIHwgMHhFMCxcbiAgICAgICAgY29kZVBvaW50ID4+IDB4NiAmIDB4M0YgfCAweDgwLFxuICAgICAgICBjb2RlUG9pbnQgJiAweDNGIHwgMHg4MFxuICAgICAgKVxuICAgIH0gZWxzZSBpZiAoY29kZVBvaW50IDwgMHgxMTAwMDApIHtcbiAgICAgIGlmICgodW5pdHMgLT0gNCkgPCAwKSBicmVha1xuICAgICAgYnl0ZXMucHVzaChcbiAgICAgICAgY29kZVBvaW50ID4+IDB4MTIgfCAweEYwLFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHhDICYgMHgzRiB8IDB4ODAsXG4gICAgICAgIGNvZGVQb2ludCA+PiAweDYgJiAweDNGIHwgMHg4MCxcbiAgICAgICAgY29kZVBvaW50ICYgMHgzRiB8IDB4ODBcbiAgICAgIClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGNvZGUgcG9pbnQnKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBieXRlc1xufVxuXG5mdW5jdGlvbiBhc2NpaVRvQnl0ZXMgKHN0cikge1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyArK2kpIHtcbiAgICAvLyBOb2RlJ3MgY29kZSBzZWVtcyB0byBiZSBkb2luZyB0aGlzIGFuZCBub3QgJiAweDdGLi5cbiAgICBieXRlQXJyYXkucHVzaChzdHIuY2hhckNvZGVBdChpKSAmIDB4RkYpXG4gIH1cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiB1dGYxNmxlVG9CeXRlcyAoc3RyLCB1bml0cykge1xuICB2YXIgYywgaGksIGxvXG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7ICsraSkge1xuICAgIGlmICgodW5pdHMgLT0gMikgPCAwKSBicmVha1xuXG4gICAgYyA9IHN0ci5jaGFyQ29kZUF0KGkpXG4gICAgaGkgPSBjID4+IDhcbiAgICBsbyA9IGMgJSAyNTZcbiAgICBieXRlQXJyYXkucHVzaChsbylcbiAgICBieXRlQXJyYXkucHVzaChoaSlcbiAgfVxuXG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gYmFzZTY0VG9CeXRlcyAoc3RyKSB7XG4gIHJldHVybiBiYXNlNjQudG9CeXRlQXJyYXkoYmFzZTY0Y2xlYW4oc3RyKSlcbn1cblxuZnVuY3Rpb24gYmxpdEJ1ZmZlciAoc3JjLCBkc3QsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyArK2kpIHtcbiAgICBpZiAoKGkgKyBvZmZzZXQgPj0gZHN0Lmxlbmd0aCkgfHwgKGkgPj0gc3JjLmxlbmd0aCkpIGJyZWFrXG4gICAgZHN0W2kgKyBvZmZzZXRdID0gc3JjW2ldXG4gIH1cbiAgcmV0dXJuIGlcbn1cblxuLy8gQXJyYXlCdWZmZXIgb3IgVWludDhBcnJheSBvYmplY3RzIGZyb20gb3RoZXIgY29udGV4dHMgKGkuZS4gaWZyYW1lcykgZG8gbm90IHBhc3Ncbi8vIHRoZSBgaW5zdGFuY2VvZmAgY2hlY2sgYnV0IHRoZXkgc2hvdWxkIGJlIHRyZWF0ZWQgYXMgb2YgdGhhdCB0eXBlLlxuLy8gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlci9pc3N1ZXMvMTY2XG5mdW5jdGlvbiBpc0luc3RhbmNlIChvYmosIHR5cGUpIHtcbiAgcmV0dXJuIG9iaiBpbnN0YW5jZW9mIHR5cGUgfHxcbiAgICAob2JqICE9IG51bGwgJiYgb2JqLmNvbnN0cnVjdG9yICE9IG51bGwgJiYgb2JqLmNvbnN0cnVjdG9yLm5hbWUgIT0gbnVsbCAmJlxuICAgICAgb2JqLmNvbnN0cnVjdG9yLm5hbWUgPT09IHR5cGUubmFtZSlcbn1cbmZ1bmN0aW9uIG51bWJlcklzTmFOIChvYmopIHtcbiAgLy8gRm9yIElFMTEgc3VwcG9ydFxuICByZXR1cm4gb2JqICE9PSBvYmogLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1zZWxmLWNvbXBhcmVcbn1cbiIsIjsoZnVuY3Rpb24gKGdsb2JhbFNjb3BlKSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuXHJcbiAgLypcclxuICAgKiAgZGVjaW1hbC5qcyB2MTAuMi4wXHJcbiAgICogIEFuIGFyYml0cmFyeS1wcmVjaXNpb24gRGVjaW1hbCB0eXBlIGZvciBKYXZhU2NyaXB0LlxyXG4gICAqICBodHRwczovL2dpdGh1Yi5jb20vTWlrZU1jbC9kZWNpbWFsLmpzXHJcbiAgICogIENvcHlyaWdodCAoYykgMjAxOSBNaWNoYWVsIE1jbGF1Z2hsaW4gPE04Y2g4OGxAZ21haWwuY29tPlxyXG4gICAqICBNSVQgTGljZW5jZVxyXG4gICAqL1xyXG5cclxuXHJcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gIEVESVRBQkxFIERFRkFVTFRTICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cclxuXHJcblxyXG4gICAgLy8gVGhlIG1heGltdW0gZXhwb25lbnQgbWFnbml0dWRlLlxyXG4gICAgLy8gVGhlIGxpbWl0IG9uIHRoZSB2YWx1ZSBvZiBgdG9FeHBOZWdgLCBgdG9FeHBQb3NgLCBgbWluRWAgYW5kIGBtYXhFYC5cclxuICB2YXIgRVhQX0xJTUlUID0gOWUxNSwgICAgICAgICAgICAgICAgICAgICAgLy8gMCB0byA5ZTE1XHJcblxyXG4gICAgLy8gVGhlIGxpbWl0IG9uIHRoZSB2YWx1ZSBvZiBgcHJlY2lzaW9uYCwgYW5kIG9uIHRoZSB2YWx1ZSBvZiB0aGUgZmlyc3QgYXJndW1lbnQgdG9cclxuICAgIC8vIGB0b0RlY2ltYWxQbGFjZXNgLCBgdG9FeHBvbmVudGlhbGAsIGB0b0ZpeGVkYCwgYHRvUHJlY2lzaW9uYCBhbmQgYHRvU2lnbmlmaWNhbnREaWdpdHNgLlxyXG4gICAgTUFYX0RJR0lUUyA9IDFlOSwgICAgICAgICAgICAgICAgICAgICAgICAvLyAwIHRvIDFlOVxyXG5cclxuICAgIC8vIEJhc2UgY29udmVyc2lvbiBhbHBoYWJldC5cclxuICAgIE5VTUVSQUxTID0gJzAxMjM0NTY3ODlhYmNkZWYnLFxyXG5cclxuICAgIC8vIFRoZSBuYXR1cmFsIGxvZ2FyaXRobSBvZiAxMCAoMTAyNSBkaWdpdHMpLlxyXG4gICAgTE4xMCA9ICcyLjMwMjU4NTA5Mjk5NDA0NTY4NDAxNzk5MTQ1NDY4NDM2NDIwNzYwMTEwMTQ4ODYyODc3Mjk3NjAzMzMyNzkwMDk2NzU3MjYwOTY3NzM1MjQ4MDIzNTk5NzIwNTA4OTU5ODI5ODM0MTk2Nzc4NDA0MjI4NjI0ODYzMzQwOTUyNTQ2NTA4MjgwNjc1NjY2NjI4NzM2OTA5ODc4MTY4OTQ4MjkwNzIwODMyNTU1NDY4MDg0Mzc5OTg5NDgyNjIzMzE5ODUyODM5MzUwNTMwODk2NTM3NzczMjYyODg0NjE2MzM2NjIyMjI4NzY5ODIxOTg4Njc0NjU0MzY2NzQ3NDQwNDI0MzI3NDM2NTE1NTA0ODkzNDMxNDkzOTM5MTQ3OTYxOTQwNDQwMDIyMjEwNTEwMTcxNDE3NDgwMDM2ODgwODQwMTI2NDcwODA2ODU1Njc3NDMyMTYyMjgzNTUyMjAxMTQ4MDQ2NjM3MTU2NTkxMjEzNzM0NTA3NDc4NTY5NDc2ODM0NjM2MTY3OTIxMDE4MDY0NDUwNzA2NDgwMDAyNzc1MDI2ODQ5MTY3NDY1NTA1ODY4NTY5MzU2NzM0MjA2NzA1ODExMzY0MjkyMjQ1NTQ0MDU3NTg5MjU3MjQyMDgyNDEzMTQ2OTU2ODkwMTY3NTg5NDAyNTY3NzYzMTEzNTY5MTkyOTIwMzMzNzY1ODcxNDE2NjAyMzAxMDU3MDMwODk2MzQ1NzIwNzU0NDAzNzA4NDc0Njk5NDAxNjgyNjkyODI4MDg0ODExODQyODkzMTQ4NDg1MjQ5NDg2NDQ4NzE5Mjc4MDk2NzYyNzEyNzU3NzUzOTcwMjc2Njg2MDU5NTI0OTY3MTY2NzQxODM0ODU3MDQ0MjI1MDcxOTc5NjUwMDQ3MTQ5NTEwNTA0OTIyMTQ3NzY1Njc2MzY5Mzg2NjI5NzY5Nzk1MjIxMTA3MTgyNjQ1NDk3MzQ3NzI2NjI0MjU3MDk0MjkzMjI1ODI3OTg1MDI1ODU1MDk3ODUyNjUzODMyMDc2MDY3MjYzMTcxNjQzMDk1MDU5OTUwODc4MDc1MjM3MTAzMzMxMDExOTc4NTc1NDczMzE1NDE0MjE4MDg0Mjc1NDM4NjM1OTE3NzgxMTcwNTQzMDk4Mjc0ODIzODUwNDU2NDgwMTkwOTU2MTAyOTkyOTE4MjQzMTgyMzc1MjUzNTc3MDk3NTA1Mzk1NjUxODc2OTc1MTAzNzQ5NzA4ODg2OTIxODAyMDUxODkzMzk1MDcyMzg1MzkyMDUxNDQ2MzQxOTcyNjUyODcyODY5NjUxMTA4NjI1NzE0OTIxOTg4NDk5Nzg3NDg4NzM3NzEzNDU2ODYyMDkxNjcwNTgnLFxyXG5cclxuICAgIC8vIFBpICgxMDI1IGRpZ2l0cykuXHJcbiAgICBQSSA9ICczLjE0MTU5MjY1MzU4OTc5MzIzODQ2MjY0MzM4MzI3OTUwMjg4NDE5NzE2OTM5OTM3NTEwNTgyMDk3NDk0NDU5MjMwNzgxNjQwNjI4NjIwODk5ODYyODAzNDgyNTM0MjExNzA2Nzk4MjE0ODA4NjUxMzI4MjMwNjY0NzA5Mzg0NDYwOTU1MDU4MjIzMTcyNTM1OTQwODEyODQ4MTExNzQ1MDI4NDEwMjcwMTkzODUyMTEwNTU1OTY0NDYyMjk0ODk1NDkzMDM4MTk2NDQyODgxMDk3NTY2NTkzMzQ0NjEyODQ3NTY0ODIzMzc4Njc4MzE2NTI3MTIwMTkwOTE0NTY0ODU2NjkyMzQ2MDM0ODYxMDQ1NDMyNjY0ODIxMzM5MzYwNzI2MDI0OTE0MTI3MzcyNDU4NzAwNjYwNjMxNTU4ODE3NDg4MTUyMDkyMDk2MjgyOTI1NDA5MTcxNTM2NDM2Nzg5MjU5MDM2MDAxMTMzMDUzMDU0ODgyMDQ2NjUyMTM4NDE0Njk1MTk0MTUxMTYwOTQzMzA1NzI3MDM2NTc1OTU5MTk1MzA5MjE4NjExNzM4MTkzMjYxMTc5MzEwNTExODU0ODA3NDQ2MjM3OTk2Mjc0OTU2NzM1MTg4NTc1MjcyNDg5MTIyNzkzODE4MzAxMTk0OTEyOTgzMzY3MzM2MjQ0MDY1NjY0MzA4NjAyMTM5NDk0NjM5NTIyNDczNzE5MDcwMjE3OTg2MDk0MzcwMjc3MDUzOTIxNzE3NjI5MzE3Njc1MjM4NDY3NDgxODQ2NzY2OTQwNTEzMjAwMDU2ODEyNzE0NTI2MzU2MDgyNzc4NTc3MTM0Mjc1Nzc4OTYwOTE3MzYzNzE3ODcyMTQ2ODQ0MDkwMTIyNDk1MzQzMDE0NjU0OTU4NTM3MTA1MDc5MjI3OTY4OTI1ODkyMzU0MjAxOTk1NjExMjEyOTAyMTk2MDg2NDAzNDQxODE1OTgxMzYyOTc3NDc3MTMwOTk2MDUxODcwNzIxMTM0OTk5OTk5ODM3Mjk3ODA0OTk1MTA1OTczMTczMjgxNjA5NjMxODU5NTAyNDQ1OTQ1NTM0NjkwODMwMjY0MjUyMjMwODI1MzM0NDY4NTAzNTI2MTkzMTE4ODE3MTAxMDAwMzEzNzgzODc1Mjg4NjU4NzUzMzIwODM4MTQyMDYxNzE3NzY2OTE0NzMwMzU5ODI1MzQ5MDQyODc1NTQ2ODczMTE1OTU2Mjg2Mzg4MjM1Mzc4NzU5Mzc1MTk1Nzc4MTg1Nzc4MDUzMjE3MTIyNjgwNjYxMzAwMTkyNzg3NjYxMTE5NTkwOTIxNjQyMDE5ODkzODA5NTI1NzIwMTA2NTQ4NTg2MzI3ODknLFxyXG5cclxuXHJcbiAgICAvLyBUaGUgaW5pdGlhbCBjb25maWd1cmF0aW9uIHByb3BlcnRpZXMgb2YgdGhlIERlY2ltYWwgY29uc3RydWN0b3IuXHJcbiAgICBERUZBVUxUUyA9IHtcclxuXHJcbiAgICAgIC8vIFRoZXNlIHZhbHVlcyBtdXN0IGJlIGludGVnZXJzIHdpdGhpbiB0aGUgc3RhdGVkIHJhbmdlcyAoaW5jbHVzaXZlKS5cclxuICAgICAgLy8gTW9zdCBvZiB0aGVzZSB2YWx1ZXMgY2FuIGJlIGNoYW5nZWQgYXQgcnVuLXRpbWUgdXNpbmcgdGhlIGBEZWNpbWFsLmNvbmZpZ2AgbWV0aG9kLlxyXG5cclxuICAgICAgLy8gVGhlIG1heGltdW0gbnVtYmVyIG9mIHNpZ25pZmljYW50IGRpZ2l0cyBvZiB0aGUgcmVzdWx0IG9mIGEgY2FsY3VsYXRpb24gb3IgYmFzZSBjb252ZXJzaW9uLlxyXG4gICAgICAvLyBFLmcuIGBEZWNpbWFsLmNvbmZpZyh7IHByZWNpc2lvbjogMjAgfSk7YFxyXG4gICAgICBwcmVjaXNpb246IDIwLCAgICAgICAgICAgICAgICAgICAgICAgICAvLyAxIHRvIE1BWF9ESUdJVFNcclxuXHJcbiAgICAgIC8vIFRoZSByb3VuZGluZyBtb2RlIHVzZWQgd2hlbiByb3VuZGluZyB0byBgcHJlY2lzaW9uYC5cclxuICAgICAgLy9cclxuICAgICAgLy8gUk9VTkRfVVAgICAgICAgICAwIEF3YXkgZnJvbSB6ZXJvLlxyXG4gICAgICAvLyBST1VORF9ET1dOICAgICAgIDEgVG93YXJkcyB6ZXJvLlxyXG4gICAgICAvLyBST1VORF9DRUlMICAgICAgIDIgVG93YXJkcyArSW5maW5pdHkuXHJcbiAgICAgIC8vIFJPVU5EX0ZMT09SICAgICAgMyBUb3dhcmRzIC1JbmZpbml0eS5cclxuICAgICAgLy8gUk9VTkRfSEFMRl9VUCAgICA0IFRvd2FyZHMgbmVhcmVzdCBuZWlnaGJvdXIuIElmIGVxdWlkaXN0YW50LCB1cC5cclxuICAgICAgLy8gUk9VTkRfSEFMRl9ET1dOICA1IFRvd2FyZHMgbmVhcmVzdCBuZWlnaGJvdXIuIElmIGVxdWlkaXN0YW50LCBkb3duLlxyXG4gICAgICAvLyBST1VORF9IQUxGX0VWRU4gIDYgVG93YXJkcyBuZWFyZXN0IG5laWdoYm91ci4gSWYgZXF1aWRpc3RhbnQsIHRvd2FyZHMgZXZlbiBuZWlnaGJvdXIuXHJcbiAgICAgIC8vIFJPVU5EX0hBTEZfQ0VJTCAgNyBUb3dhcmRzIG5lYXJlc3QgbmVpZ2hib3VyLiBJZiBlcXVpZGlzdGFudCwgdG93YXJkcyArSW5maW5pdHkuXHJcbiAgICAgIC8vIFJPVU5EX0hBTEZfRkxPT1IgOCBUb3dhcmRzIG5lYXJlc3QgbmVpZ2hib3VyLiBJZiBlcXVpZGlzdGFudCwgdG93YXJkcyAtSW5maW5pdHkuXHJcbiAgICAgIC8vXHJcbiAgICAgIC8vIEUuZy5cclxuICAgICAgLy8gYERlY2ltYWwucm91bmRpbmcgPSA0O2BcclxuICAgICAgLy8gYERlY2ltYWwucm91bmRpbmcgPSBEZWNpbWFsLlJPVU5EX0hBTEZfVVA7YFxyXG4gICAgICByb3VuZGluZzogNCwgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAwIHRvIDhcclxuXHJcbiAgICAgIC8vIFRoZSBtb2R1bG8gbW9kZSB1c2VkIHdoZW4gY2FsY3VsYXRpbmcgdGhlIG1vZHVsdXM6IGEgbW9kIG4uXHJcbiAgICAgIC8vIFRoZSBxdW90aWVudCAocSA9IGEgLyBuKSBpcyBjYWxjdWxhdGVkIGFjY29yZGluZyB0byB0aGUgY29ycmVzcG9uZGluZyByb3VuZGluZyBtb2RlLlxyXG4gICAgICAvLyBUaGUgcmVtYWluZGVyIChyKSBpcyBjYWxjdWxhdGVkIGFzOiByID0gYSAtIG4gKiBxLlxyXG4gICAgICAvL1xyXG4gICAgICAvLyBVUCAgICAgICAgIDAgVGhlIHJlbWFpbmRlciBpcyBwb3NpdGl2ZSBpZiB0aGUgZGl2aWRlbmQgaXMgbmVnYXRpdmUsIGVsc2UgaXMgbmVnYXRpdmUuXHJcbiAgICAgIC8vIERPV04gICAgICAgMSBUaGUgcmVtYWluZGVyIGhhcyB0aGUgc2FtZSBzaWduIGFzIHRoZSBkaXZpZGVuZCAoSmF2YVNjcmlwdCAlKS5cclxuICAgICAgLy8gRkxPT1IgICAgICAzIFRoZSByZW1haW5kZXIgaGFzIHRoZSBzYW1lIHNpZ24gYXMgdGhlIGRpdmlzb3IgKFB5dGhvbiAlKS5cclxuICAgICAgLy8gSEFMRl9FVkVOICA2IFRoZSBJRUVFIDc1NCByZW1haW5kZXIgZnVuY3Rpb24uXHJcbiAgICAgIC8vIEVVQ0xJRCAgICAgOSBFdWNsaWRpYW4gZGl2aXNpb24uIHEgPSBzaWduKG4pICogZmxvb3IoYSAvIGFicyhuKSkuIEFsd2F5cyBwb3NpdGl2ZS5cclxuICAgICAgLy9cclxuICAgICAgLy8gVHJ1bmNhdGVkIGRpdmlzaW9uICgxKSwgZmxvb3JlZCBkaXZpc2lvbiAoMyksIHRoZSBJRUVFIDc1NCByZW1haW5kZXIgKDYpLCBhbmQgRXVjbGlkaWFuXHJcbiAgICAgIC8vIGRpdmlzaW9uICg5KSBhcmUgY29tbW9ubHkgdXNlZCBmb3IgdGhlIG1vZHVsdXMgb3BlcmF0aW9uLiBUaGUgb3RoZXIgcm91bmRpbmcgbW9kZXMgY2FuIGFsc29cclxuICAgICAgLy8gYmUgdXNlZCwgYnV0IHRoZXkgbWF5IG5vdCBnaXZlIHVzZWZ1bCByZXN1bHRzLlxyXG4gICAgICBtb2R1bG86IDEsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAwIHRvIDlcclxuXHJcbiAgICAgIC8vIFRoZSBleHBvbmVudCB2YWx1ZSBhdCBhbmQgYmVuZWF0aCB3aGljaCBgdG9TdHJpbmdgIHJldHVybnMgZXhwb25lbnRpYWwgbm90YXRpb24uXHJcbiAgICAgIC8vIEphdmFTY3JpcHQgbnVtYmVyczogLTdcclxuICAgICAgdG9FeHBOZWc6IC03LCAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gMCB0byAtRVhQX0xJTUlUXHJcblxyXG4gICAgICAvLyBUaGUgZXhwb25lbnQgdmFsdWUgYXQgYW5kIGFib3ZlIHdoaWNoIGB0b1N0cmluZ2AgcmV0dXJucyBleHBvbmVudGlhbCBub3RhdGlvbi5cclxuICAgICAgLy8gSmF2YVNjcmlwdCBudW1iZXJzOiAyMVxyXG4gICAgICB0b0V4cFBvczogIDIxLCAgICAgICAgICAgICAgICAgICAgICAgICAvLyAwIHRvIEVYUF9MSU1JVFxyXG5cclxuICAgICAgLy8gVGhlIG1pbmltdW0gZXhwb25lbnQgdmFsdWUsIGJlbmVhdGggd2hpY2ggdW5kZXJmbG93IHRvIHplcm8gb2NjdXJzLlxyXG4gICAgICAvLyBKYXZhU2NyaXB0IG51bWJlcnM6IC0zMjQgICg1ZS0zMjQpXHJcbiAgICAgIG1pbkU6IC1FWFBfTElNSVQsICAgICAgICAgICAgICAgICAgICAgIC8vIC0xIHRvIC1FWFBfTElNSVRcclxuXHJcbiAgICAgIC8vIFRoZSBtYXhpbXVtIGV4cG9uZW50IHZhbHVlLCBhYm92ZSB3aGljaCBvdmVyZmxvdyB0byBJbmZpbml0eSBvY2N1cnMuXHJcbiAgICAgIC8vIEphdmFTY3JpcHQgbnVtYmVyczogMzA4ICAoMS43OTc2OTMxMzQ4NjIzMTU3ZSszMDgpXHJcbiAgICAgIG1heEU6IEVYUF9MSU1JVCwgICAgICAgICAgICAgICAgICAgICAgIC8vIDEgdG8gRVhQX0xJTUlUXHJcblxyXG4gICAgICAvLyBXaGV0aGVyIHRvIHVzZSBjcnlwdG9ncmFwaGljYWxseS1zZWN1cmUgcmFuZG9tIG51bWJlciBnZW5lcmF0aW9uLCBpZiBhdmFpbGFibGUuXHJcbiAgICAgIGNyeXB0bzogZmFsc2UgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRydWUvZmFsc2VcclxuICAgIH0sXHJcblxyXG5cclxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBFTkQgT0YgRURJVEFCTEUgREVGQVVMVFMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xyXG5cclxuXHJcbiAgICBEZWNpbWFsLCBpbmV4YWN0LCBub0NvbmZsaWN0LCBxdWFkcmFudCxcclxuICAgIGV4dGVybmFsID0gdHJ1ZSxcclxuXHJcbiAgICBkZWNpbWFsRXJyb3IgPSAnW0RlY2ltYWxFcnJvcl0gJyxcclxuICAgIGludmFsaWRBcmd1bWVudCA9IGRlY2ltYWxFcnJvciArICdJbnZhbGlkIGFyZ3VtZW50OiAnLFxyXG4gICAgcHJlY2lzaW9uTGltaXRFeGNlZWRlZCA9IGRlY2ltYWxFcnJvciArICdQcmVjaXNpb24gbGltaXQgZXhjZWVkZWQnLFxyXG4gICAgY3J5cHRvVW5hdmFpbGFibGUgPSBkZWNpbWFsRXJyb3IgKyAnY3J5cHRvIHVuYXZhaWxhYmxlJyxcclxuXHJcbiAgICBtYXRoZmxvb3IgPSBNYXRoLmZsb29yLFxyXG4gICAgbWF0aHBvdyA9IE1hdGgucG93LFxyXG5cclxuICAgIGlzQmluYXJ5ID0gL14wYihbMDFdKyhcXC5bMDFdKik/fFxcLlswMV0rKShwWystXT9cXGQrKT8kL2ksXHJcbiAgICBpc0hleCA9IC9eMHgoWzAtOWEtZl0rKFxcLlswLTlhLWZdKik/fFxcLlswLTlhLWZdKykocFsrLV0/XFxkKyk/JC9pLFxyXG4gICAgaXNPY3RhbCA9IC9eMG8oWzAtN10rKFxcLlswLTddKik/fFxcLlswLTddKykocFsrLV0/XFxkKyk/JC9pLFxyXG4gICAgaXNEZWNpbWFsID0gL14oXFxkKyhcXC5cXGQqKT98XFwuXFxkKykoZVsrLV0/XFxkKyk/JC9pLFxyXG5cclxuICAgIEJBU0UgPSAxZTcsXHJcbiAgICBMT0dfQkFTRSA9IDcsXHJcbiAgICBNQVhfU0FGRV9JTlRFR0VSID0gOTAwNzE5OTI1NDc0MDk5MSxcclxuXHJcbiAgICBMTjEwX1BSRUNJU0lPTiA9IExOMTAubGVuZ3RoIC0gMSxcclxuICAgIFBJX1BSRUNJU0lPTiA9IFBJLmxlbmd0aCAtIDEsXHJcblxyXG4gICAgLy8gRGVjaW1hbC5wcm90b3R5cGUgb2JqZWN0XHJcbiAgICBQID0geyBuYW1lOiAnW29iamVjdCBEZWNpbWFsXScgfTtcclxuXHJcblxyXG4gIC8vIERlY2ltYWwgcHJvdG90eXBlIG1ldGhvZHNcclxuXHJcblxyXG4gIC8qXHJcbiAgICogIGFic29sdXRlVmFsdWUgICAgICAgICAgICAgYWJzXHJcbiAgICogIGNlaWxcclxuICAgKiAgY29tcGFyZWRUbyAgICAgICAgICAgICAgICBjbXBcclxuICAgKiAgY29zaW5lICAgICAgICAgICAgICAgICAgICBjb3NcclxuICAgKiAgY3ViZVJvb3QgICAgICAgICAgICAgICAgICBjYnJ0XHJcbiAgICogIGRlY2ltYWxQbGFjZXMgICAgICAgICAgICAgZHBcclxuICAgKiAgZGl2aWRlZEJ5ICAgICAgICAgICAgICAgICBkaXZcclxuICAgKiAgZGl2aWRlZFRvSW50ZWdlckJ5ICAgICAgICBkaXZUb0ludFxyXG4gICAqICBlcXVhbHMgICAgICAgICAgICAgICAgICAgIGVxXHJcbiAgICogIGZsb29yXHJcbiAgICogIGdyZWF0ZXJUaGFuICAgICAgICAgICAgICAgZ3RcclxuICAgKiAgZ3JlYXRlclRoYW5PckVxdWFsVG8gICAgICBndGVcclxuICAgKiAgaHlwZXJib2xpY0Nvc2luZSAgICAgICAgICBjb3NoXHJcbiAgICogIGh5cGVyYm9saWNTaW5lICAgICAgICAgICAgc2luaFxyXG4gICAqICBoeXBlcmJvbGljVGFuZ2VudCAgICAgICAgIHRhbmhcclxuICAgKiAgaW52ZXJzZUNvc2luZSAgICAgICAgICAgICBhY29zXHJcbiAgICogIGludmVyc2VIeXBlcmJvbGljQ29zaW5lICAgYWNvc2hcclxuICAgKiAgaW52ZXJzZUh5cGVyYm9saWNTaW5lICAgICBhc2luaFxyXG4gICAqICBpbnZlcnNlSHlwZXJib2xpY1RhbmdlbnQgIGF0YW5oXHJcbiAgICogIGludmVyc2VTaW5lICAgICAgICAgICAgICAgYXNpblxyXG4gICAqICBpbnZlcnNlVGFuZ2VudCAgICAgICAgICAgIGF0YW5cclxuICAgKiAgaXNGaW5pdGVcclxuICAgKiAgaXNJbnRlZ2VyICAgICAgICAgICAgICAgICBpc0ludFxyXG4gICAqICBpc05hTlxyXG4gICAqICBpc05lZ2F0aXZlICAgICAgICAgICAgICAgIGlzTmVnXHJcbiAgICogIGlzUG9zaXRpdmUgICAgICAgICAgICAgICAgaXNQb3NcclxuICAgKiAgaXNaZXJvXHJcbiAgICogIGxlc3NUaGFuICAgICAgICAgICAgICAgICAgbHRcclxuICAgKiAgbGVzc1RoYW5PckVxdWFsVG8gICAgICAgICBsdGVcclxuICAgKiAgbG9nYXJpdGhtICAgICAgICAgICAgICAgICBsb2dcclxuICAgKiAgW21heGltdW1dICAgICAgICAgICAgICAgICBbbWF4XVxyXG4gICAqICBbbWluaW11bV0gICAgICAgICAgICAgICAgIFttaW5dXHJcbiAgICogIG1pbnVzICAgICAgICAgICAgICAgICAgICAgc3ViXHJcbiAgICogIG1vZHVsbyAgICAgICAgICAgICAgICAgICAgbW9kXHJcbiAgICogIG5hdHVyYWxFeHBvbmVudGlhbCAgICAgICAgZXhwXHJcbiAgICogIG5hdHVyYWxMb2dhcml0aG0gICAgICAgICAgbG5cclxuICAgKiAgbmVnYXRlZCAgICAgICAgICAgICAgICAgICBuZWdcclxuICAgKiAgcGx1cyAgICAgICAgICAgICAgICAgICAgICBhZGRcclxuICAgKiAgcHJlY2lzaW9uICAgICAgICAgICAgICAgICBzZFxyXG4gICAqICByb3VuZFxyXG4gICAqICBzaW5lICAgICAgICAgICAgICAgICAgICAgIHNpblxyXG4gICAqICBzcXVhcmVSb290ICAgICAgICAgICAgICAgIHNxcnRcclxuICAgKiAgdGFuZ2VudCAgICAgICAgICAgICAgICAgICB0YW5cclxuICAgKiAgdGltZXMgICAgICAgICAgICAgICAgICAgICBtdWxcclxuICAgKiAgdG9CaW5hcnlcclxuICAgKiAgdG9EZWNpbWFsUGxhY2VzICAgICAgICAgICB0b0RQXHJcbiAgICogIHRvRXhwb25lbnRpYWxcclxuICAgKiAgdG9GaXhlZFxyXG4gICAqICB0b0ZyYWN0aW9uXHJcbiAgICogIHRvSGV4YWRlY2ltYWwgICAgICAgICAgICAgdG9IZXhcclxuICAgKiAgdG9OZWFyZXN0XHJcbiAgICogIHRvTnVtYmVyXHJcbiAgICogIHRvT2N0YWxcclxuICAgKiAgdG9Qb3dlciAgICAgICAgICAgICAgICAgICBwb3dcclxuICAgKiAgdG9QcmVjaXNpb25cclxuICAgKiAgdG9TaWduaWZpY2FudERpZ2l0cyAgICAgICB0b1NEXHJcbiAgICogIHRvU3RyaW5nXHJcbiAgICogIHRydW5jYXRlZCAgICAgICAgICAgICAgICAgdHJ1bmNcclxuICAgKiAgdmFsdWVPZiAgICAgICAgICAgICAgICAgICB0b0pTT05cclxuICAgKi9cclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgdGhlIGFic29sdXRlIHZhbHVlIG9mIHRoaXMgRGVjaW1hbC5cclxuICAgKlxyXG4gICAqL1xyXG4gIFAuYWJzb2x1dGVWYWx1ZSA9IFAuYWJzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIHggPSBuZXcgdGhpcy5jb25zdHJ1Y3Rvcih0aGlzKTtcclxuICAgIGlmICh4LnMgPCAwKSB4LnMgPSAxO1xyXG4gICAgcmV0dXJuIGZpbmFsaXNlKHgpO1xyXG4gIH07XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIERlY2ltYWwgcm91bmRlZCB0byBhIHdob2xlIG51bWJlciBpbiB0aGVcclxuICAgKiBkaXJlY3Rpb24gb2YgcG9zaXRpdmUgSW5maW5pdHkuXHJcbiAgICpcclxuICAgKi9cclxuICBQLmNlaWwgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gZmluYWxpc2UobmV3IHRoaXMuY29uc3RydWN0b3IodGhpcyksIHRoaXMuZSArIDEsIDIpO1xyXG4gIH07XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVyblxyXG4gICAqICAgMSAgICBpZiB0aGUgdmFsdWUgb2YgdGhpcyBEZWNpbWFsIGlzIGdyZWF0ZXIgdGhhbiB0aGUgdmFsdWUgb2YgYHlgLFxyXG4gICAqICAtMSAgICBpZiB0aGUgdmFsdWUgb2YgdGhpcyBEZWNpbWFsIGlzIGxlc3MgdGhhbiB0aGUgdmFsdWUgb2YgYHlgLFxyXG4gICAqICAgMCAgICBpZiB0aGV5IGhhdmUgdGhlIHNhbWUgdmFsdWUsXHJcbiAgICogICBOYU4gIGlmIHRoZSB2YWx1ZSBvZiBlaXRoZXIgRGVjaW1hbCBpcyBOYU4uXHJcbiAgICpcclxuICAgKi9cclxuICBQLmNvbXBhcmVkVG8gPSBQLmNtcCA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICB2YXIgaSwgaiwgeGRMLCB5ZEwsXHJcbiAgICAgIHggPSB0aGlzLFxyXG4gICAgICB4ZCA9IHguZCxcclxuICAgICAgeWQgPSAoeSA9IG5ldyB4LmNvbnN0cnVjdG9yKHkpKS5kLFxyXG4gICAgICB4cyA9IHgucyxcclxuICAgICAgeXMgPSB5LnM7XHJcblxyXG4gICAgLy8gRWl0aGVyIE5hTiBvciDCsUluZmluaXR5P1xyXG4gICAgaWYgKCF4ZCB8fCAheWQpIHtcclxuICAgICAgcmV0dXJuICF4cyB8fCAheXMgPyBOYU4gOiB4cyAhPT0geXMgPyB4cyA6IHhkID09PSB5ZCA/IDAgOiAheGQgXiB4cyA8IDAgPyAxIDogLTE7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gRWl0aGVyIHplcm8/XHJcbiAgICBpZiAoIXhkWzBdIHx8ICF5ZFswXSkgcmV0dXJuIHhkWzBdID8geHMgOiB5ZFswXSA/IC15cyA6IDA7XHJcblxyXG4gICAgLy8gU2lnbnMgZGlmZmVyP1xyXG4gICAgaWYgKHhzICE9PSB5cykgcmV0dXJuIHhzO1xyXG5cclxuICAgIC8vIENvbXBhcmUgZXhwb25lbnRzLlxyXG4gICAgaWYgKHguZSAhPT0geS5lKSByZXR1cm4geC5lID4geS5lIF4geHMgPCAwID8gMSA6IC0xO1xyXG5cclxuICAgIHhkTCA9IHhkLmxlbmd0aDtcclxuICAgIHlkTCA9IHlkLmxlbmd0aDtcclxuXHJcbiAgICAvLyBDb21wYXJlIGRpZ2l0IGJ5IGRpZ2l0LlxyXG4gICAgZm9yIChpID0gMCwgaiA9IHhkTCA8IHlkTCA/IHhkTCA6IHlkTDsgaSA8IGo7ICsraSkge1xyXG4gICAgICBpZiAoeGRbaV0gIT09IHlkW2ldKSByZXR1cm4geGRbaV0gPiB5ZFtpXSBeIHhzIDwgMCA/IDEgOiAtMTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDb21wYXJlIGxlbmd0aHMuXHJcbiAgICByZXR1cm4geGRMID09PSB5ZEwgPyAwIDogeGRMID4geWRMIF4geHMgPCAwID8gMSA6IC0xO1xyXG4gIH07XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSBjb3NpbmUgb2YgdGhlIHZhbHVlIGluIHJhZGlhbnMgb2YgdGhpcyBEZWNpbWFsLlxyXG4gICAqXHJcbiAgICogRG9tYWluOiBbLUluZmluaXR5LCBJbmZpbml0eV1cclxuICAgKiBSYW5nZTogWy0xLCAxXVxyXG4gICAqXHJcbiAgICogY29zKDApICAgICAgICAgPSAxXHJcbiAgICogY29zKC0wKSAgICAgICAgPSAxXHJcbiAgICogY29zKEluZmluaXR5KSAgPSBOYU5cclxuICAgKiBjb3MoLUluZmluaXR5KSA9IE5hTlxyXG4gICAqIGNvcyhOYU4pICAgICAgID0gTmFOXHJcbiAgICpcclxuICAgKi9cclxuICBQLmNvc2luZSA9IFAuY29zID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIHByLCBybSxcclxuICAgICAgeCA9IHRoaXMsXHJcbiAgICAgIEN0b3IgPSB4LmNvbnN0cnVjdG9yO1xyXG5cclxuICAgIGlmICgheC5kKSByZXR1cm4gbmV3IEN0b3IoTmFOKTtcclxuXHJcbiAgICAvLyBjb3MoMCkgPSBjb3MoLTApID0gMVxyXG4gICAgaWYgKCF4LmRbMF0pIHJldHVybiBuZXcgQ3RvcigxKTtcclxuXHJcbiAgICBwciA9IEN0b3IucHJlY2lzaW9uO1xyXG4gICAgcm0gPSBDdG9yLnJvdW5kaW5nO1xyXG4gICAgQ3Rvci5wcmVjaXNpb24gPSBwciArIE1hdGgubWF4KHguZSwgeC5zZCgpKSArIExPR19CQVNFO1xyXG4gICAgQ3Rvci5yb3VuZGluZyA9IDE7XHJcblxyXG4gICAgeCA9IGNvc2luZShDdG9yLCB0b0xlc3NUaGFuSGFsZlBpKEN0b3IsIHgpKTtcclxuXHJcbiAgICBDdG9yLnByZWNpc2lvbiA9IHByO1xyXG4gICAgQ3Rvci5yb3VuZGluZyA9IHJtO1xyXG5cclxuICAgIHJldHVybiBmaW5hbGlzZShxdWFkcmFudCA9PSAyIHx8IHF1YWRyYW50ID09IDMgPyB4Lm5lZygpIDogeCwgcHIsIHJtLCB0cnVlKTtcclxuICB9O1xyXG5cclxuXHJcbiAgLypcclxuICAgKlxyXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSBjdWJlIHJvb3Qgb2YgdGhlIHZhbHVlIG9mIHRoaXMgRGVjaW1hbCwgcm91bmRlZCB0b1xyXG4gICAqIGBwcmVjaXNpb25gIHNpZ25pZmljYW50IGRpZ2l0cyB1c2luZyByb3VuZGluZyBtb2RlIGByb3VuZGluZ2AuXHJcbiAgICpcclxuICAgKiAgY2JydCgwKSAgPSAgMFxyXG4gICAqICBjYnJ0KC0wKSA9IC0wXHJcbiAgICogIGNicnQoMSkgID0gIDFcclxuICAgKiAgY2JydCgtMSkgPSAtMVxyXG4gICAqICBjYnJ0KE4pICA9ICBOXHJcbiAgICogIGNicnQoLUkpID0gLUlcclxuICAgKiAgY2JydChJKSAgPSAgSVxyXG4gICAqXHJcbiAgICogTWF0aC5jYnJ0KHgpID0gKHggPCAwID8gLU1hdGgucG93KC14LCAxLzMpIDogTWF0aC5wb3coeCwgMS8zKSlcclxuICAgKlxyXG4gICAqL1xyXG4gIFAuY3ViZVJvb3QgPSBQLmNicnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgZSwgbSwgbiwgciwgcmVwLCBzLCBzZCwgdCwgdDMsIHQzcGx1c3gsXHJcbiAgICAgIHggPSB0aGlzLFxyXG4gICAgICBDdG9yID0geC5jb25zdHJ1Y3RvcjtcclxuXHJcbiAgICBpZiAoIXguaXNGaW5pdGUoKSB8fCB4LmlzWmVybygpKSByZXR1cm4gbmV3IEN0b3IoeCk7XHJcbiAgICBleHRlcm5hbCA9IGZhbHNlO1xyXG5cclxuICAgIC8vIEluaXRpYWwgZXN0aW1hdGUuXHJcbiAgICBzID0geC5zICogbWF0aHBvdyh4LnMgKiB4LCAxIC8gMyk7XHJcblxyXG4gICAgIC8vIE1hdGguY2JydCB1bmRlcmZsb3cvb3ZlcmZsb3c/XHJcbiAgICAgLy8gUGFzcyB4IHRvIE1hdGgucG93IGFzIGludGVnZXIsIHRoZW4gYWRqdXN0IHRoZSBleHBvbmVudCBvZiB0aGUgcmVzdWx0LlxyXG4gICAgaWYgKCFzIHx8IE1hdGguYWJzKHMpID09IDEgLyAwKSB7XHJcbiAgICAgIG4gPSBkaWdpdHNUb1N0cmluZyh4LmQpO1xyXG4gICAgICBlID0geC5lO1xyXG5cclxuICAgICAgLy8gQWRqdXN0IG4gZXhwb25lbnQgc28gaXQgaXMgYSBtdWx0aXBsZSBvZiAzIGF3YXkgZnJvbSB4IGV4cG9uZW50LlxyXG4gICAgICBpZiAocyA9IChlIC0gbi5sZW5ndGggKyAxKSAlIDMpIG4gKz0gKHMgPT0gMSB8fCBzID09IC0yID8gJzAnIDogJzAwJyk7XHJcbiAgICAgIHMgPSBtYXRocG93KG4sIDEgLyAzKTtcclxuXHJcbiAgICAgIC8vIFJhcmVseSwgZSBtYXkgYmUgb25lIGxlc3MgdGhhbiB0aGUgcmVzdWx0IGV4cG9uZW50IHZhbHVlLlxyXG4gICAgICBlID0gbWF0aGZsb29yKChlICsgMSkgLyAzKSAtIChlICUgMyA9PSAoZSA8IDAgPyAtMSA6IDIpKTtcclxuXHJcbiAgICAgIGlmIChzID09IDEgLyAwKSB7XHJcbiAgICAgICAgbiA9ICc1ZScgKyBlO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIG4gPSBzLnRvRXhwb25lbnRpYWwoKTtcclxuICAgICAgICBuID0gbi5zbGljZSgwLCBuLmluZGV4T2YoJ2UnKSArIDEpICsgZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgciA9IG5ldyBDdG9yKG4pO1xyXG4gICAgICByLnMgPSB4LnM7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByID0gbmV3IEN0b3Iocy50b1N0cmluZygpKTtcclxuICAgIH1cclxuXHJcbiAgICBzZCA9IChlID0gQ3Rvci5wcmVjaXNpb24pICsgMztcclxuXHJcbiAgICAvLyBIYWxsZXkncyBtZXRob2QuXHJcbiAgICAvLyBUT0RPPyBDb21wYXJlIE5ld3RvbidzIG1ldGhvZC5cclxuICAgIGZvciAoOzspIHtcclxuICAgICAgdCA9IHI7XHJcbiAgICAgIHQzID0gdC50aW1lcyh0KS50aW1lcyh0KTtcclxuICAgICAgdDNwbHVzeCA9IHQzLnBsdXMoeCk7XHJcbiAgICAgIHIgPSBkaXZpZGUodDNwbHVzeC5wbHVzKHgpLnRpbWVzKHQpLCB0M3BsdXN4LnBsdXModDMpLCBzZCArIDIsIDEpO1xyXG5cclxuICAgICAgLy8gVE9ETz8gUmVwbGFjZSB3aXRoIGZvci1sb29wIGFuZCBjaGVja1JvdW5kaW5nRGlnaXRzLlxyXG4gICAgICBpZiAoZGlnaXRzVG9TdHJpbmcodC5kKS5zbGljZSgwLCBzZCkgPT09IChuID0gZGlnaXRzVG9TdHJpbmcoci5kKSkuc2xpY2UoMCwgc2QpKSB7XHJcbiAgICAgICAgbiA9IG4uc2xpY2Uoc2QgLSAzLCBzZCArIDEpO1xyXG5cclxuICAgICAgICAvLyBUaGUgNHRoIHJvdW5kaW5nIGRpZ2l0IG1heSBiZSBpbiBlcnJvciBieSAtMSBzbyBpZiB0aGUgNCByb3VuZGluZyBkaWdpdHMgYXJlIDk5OTkgb3IgNDk5OVxyXG4gICAgICAgIC8vICwgaS5lLiBhcHByb2FjaGluZyBhIHJvdW5kaW5nIGJvdW5kYXJ5LCBjb250aW51ZSB0aGUgaXRlcmF0aW9uLlxyXG4gICAgICAgIGlmIChuID09ICc5OTk5JyB8fCAhcmVwICYmIG4gPT0gJzQ5OTknKSB7XHJcblxyXG4gICAgICAgICAgLy8gT24gdGhlIGZpcnN0IGl0ZXJhdGlvbiBvbmx5LCBjaGVjayB0byBzZWUgaWYgcm91bmRpbmcgdXAgZ2l2ZXMgdGhlIGV4YWN0IHJlc3VsdCBhcyB0aGVcclxuICAgICAgICAgIC8vIG5pbmVzIG1heSBpbmZpbml0ZWx5IHJlcGVhdC5cclxuICAgICAgICAgIGlmICghcmVwKSB7XHJcbiAgICAgICAgICAgIGZpbmFsaXNlKHQsIGUgKyAxLCAwKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0LnRpbWVzKHQpLnRpbWVzKHQpLmVxKHgpKSB7XHJcbiAgICAgICAgICAgICAgciA9IHQ7XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBzZCArPSA0O1xyXG4gICAgICAgICAgcmVwID0gMTtcclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgIC8vIElmIHRoZSByb3VuZGluZyBkaWdpdHMgYXJlIG51bGwsIDB7MCw0fSBvciA1MHswLDN9LCBjaGVjayBmb3IgYW4gZXhhY3QgcmVzdWx0LlxyXG4gICAgICAgICAgLy8gSWYgbm90LCB0aGVuIHRoZXJlIGFyZSBmdXJ0aGVyIGRpZ2l0cyBhbmQgbSB3aWxsIGJlIHRydXRoeS5cclxuICAgICAgICAgIGlmICghK24gfHwgIStuLnNsaWNlKDEpICYmIG4uY2hhckF0KDApID09ICc1Jykge1xyXG5cclxuICAgICAgICAgICAgLy8gVHJ1bmNhdGUgdG8gdGhlIGZpcnN0IHJvdW5kaW5nIGRpZ2l0LlxyXG4gICAgICAgICAgICBmaW5hbGlzZShyLCBlICsgMSwgMSk7XHJcbiAgICAgICAgICAgIG0gPSAhci50aW1lcyhyKS50aW1lcyhyKS5lcSh4KTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBleHRlcm5hbCA9IHRydWU7XHJcblxyXG4gICAgcmV0dXJuIGZpbmFsaXNlKHIsIGUsIEN0b3Iucm91bmRpbmcsIG0pO1xyXG4gIH07XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiB0aGUgbnVtYmVyIG9mIGRlY2ltYWwgcGxhY2VzIG9mIHRoZSB2YWx1ZSBvZiB0aGlzIERlY2ltYWwuXHJcbiAgICpcclxuICAgKi9cclxuICBQLmRlY2ltYWxQbGFjZXMgPSBQLmRwID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIHcsXHJcbiAgICAgIGQgPSB0aGlzLmQsXHJcbiAgICAgIG4gPSBOYU47XHJcblxyXG4gICAgaWYgKGQpIHtcclxuICAgICAgdyA9IGQubGVuZ3RoIC0gMTtcclxuICAgICAgbiA9ICh3IC0gbWF0aGZsb29yKHRoaXMuZSAvIExPR19CQVNFKSkgKiBMT0dfQkFTRTtcclxuXHJcbiAgICAgIC8vIFN1YnRyYWN0IHRoZSBudW1iZXIgb2YgdHJhaWxpbmcgemVyb3Mgb2YgdGhlIGxhc3Qgd29yZC5cclxuICAgICAgdyA9IGRbd107XHJcbiAgICAgIGlmICh3KSBmb3IgKDsgdyAlIDEwID09IDA7IHcgLz0gMTApIG4tLTtcclxuICAgICAgaWYgKG4gPCAwKSBuID0gMDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbjtcclxuICB9O1xyXG5cclxuXHJcbiAgLypcclxuICAgKiAgbiAvIDAgPSBJXHJcbiAgICogIG4gLyBOID0gTlxyXG4gICAqICBuIC8gSSA9IDBcclxuICAgKiAgMCAvIG4gPSAwXHJcbiAgICogIDAgLyAwID0gTlxyXG4gICAqICAwIC8gTiA9IE5cclxuICAgKiAgMCAvIEkgPSAwXHJcbiAgICogIE4gLyBuID0gTlxyXG4gICAqICBOIC8gMCA9IE5cclxuICAgKiAgTiAvIE4gPSBOXHJcbiAgICogIE4gLyBJID0gTlxyXG4gICAqICBJIC8gbiA9IElcclxuICAgKiAgSSAvIDAgPSBJXHJcbiAgICogIEkgLyBOID0gTlxyXG4gICAqICBJIC8gSSA9IE5cclxuICAgKlxyXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIERlY2ltYWwgZGl2aWRlZCBieSBgeWAsIHJvdW5kZWQgdG9cclxuICAgKiBgcHJlY2lzaW9uYCBzaWduaWZpY2FudCBkaWdpdHMgdXNpbmcgcm91bmRpbmcgbW9kZSBgcm91bmRpbmdgLlxyXG4gICAqXHJcbiAgICovXHJcbiAgUC5kaXZpZGVkQnkgPSBQLmRpdiA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICByZXR1cm4gZGl2aWRlKHRoaXMsIG5ldyB0aGlzLmNvbnN0cnVjdG9yKHkpKTtcclxuICB9O1xyXG5cclxuXHJcbiAgLypcclxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgaW50ZWdlciBwYXJ0IG9mIGRpdmlkaW5nIHRoZSB2YWx1ZSBvZiB0aGlzIERlY2ltYWxcclxuICAgKiBieSB0aGUgdmFsdWUgb2YgYHlgLCByb3VuZGVkIHRvIGBwcmVjaXNpb25gIHNpZ25pZmljYW50IGRpZ2l0cyB1c2luZyByb3VuZGluZyBtb2RlIGByb3VuZGluZ2AuXHJcbiAgICpcclxuICAgKi9cclxuICBQLmRpdmlkZWRUb0ludGVnZXJCeSA9IFAuZGl2VG9JbnQgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgdmFyIHggPSB0aGlzLFxyXG4gICAgICBDdG9yID0geC5jb25zdHJ1Y3RvcjtcclxuICAgIHJldHVybiBmaW5hbGlzZShkaXZpZGUoeCwgbmV3IEN0b3IoeSksIDAsIDEsIDEpLCBDdG9yLnByZWNpc2lvbiwgQ3Rvci5yb3VuZGluZyk7XHJcbiAgfTtcclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgRGVjaW1hbCBpcyBlcXVhbCB0byB0aGUgdmFsdWUgb2YgYHlgLCBvdGhlcndpc2UgcmV0dXJuIGZhbHNlLlxyXG4gICAqXHJcbiAgICovXHJcbiAgUC5lcXVhbHMgPSBQLmVxID0gZnVuY3Rpb24gKHkpIHtcclxuICAgIHJldHVybiB0aGlzLmNtcCh5KSA9PT0gMDtcclxuICB9O1xyXG5cclxuXHJcbiAgLypcclxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBEZWNpbWFsIHJvdW5kZWQgdG8gYSB3aG9sZSBudW1iZXIgaW4gdGhlXHJcbiAgICogZGlyZWN0aW9uIG9mIG5lZ2F0aXZlIEluZmluaXR5LlxyXG4gICAqXHJcbiAgICovXHJcbiAgUC5mbG9vciA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiBmaW5hbGlzZShuZXcgdGhpcy5jb25zdHJ1Y3Rvcih0aGlzKSwgdGhpcy5lICsgMSwgMyk7XHJcbiAgfTtcclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgRGVjaW1hbCBpcyBncmVhdGVyIHRoYW4gdGhlIHZhbHVlIG9mIGB5YCwgb3RoZXJ3aXNlIHJldHVyblxyXG4gICAqIGZhbHNlLlxyXG4gICAqXHJcbiAgICovXHJcbiAgUC5ncmVhdGVyVGhhbiA9IFAuZ3QgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgcmV0dXJuIHRoaXMuY21wKHkpID4gMDtcclxuICB9O1xyXG5cclxuXHJcbiAgLypcclxuICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBEZWNpbWFsIGlzIGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0byB0aGUgdmFsdWUgb2YgYHlgLFxyXG4gICAqIG90aGVyd2lzZSByZXR1cm4gZmFsc2UuXHJcbiAgICpcclxuICAgKi9cclxuICBQLmdyZWF0ZXJUaGFuT3JFcXVhbFRvID0gUC5ndGUgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgdmFyIGsgPSB0aGlzLmNtcCh5KTtcclxuICAgIHJldHVybiBrID09IDEgfHwgayA9PT0gMDtcclxuICB9O1xyXG5cclxuXHJcbiAgLypcclxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgaHlwZXJib2xpYyBjb3NpbmUgb2YgdGhlIHZhbHVlIGluIHJhZGlhbnMgb2YgdGhpc1xyXG4gICAqIERlY2ltYWwuXHJcbiAgICpcclxuICAgKiBEb21haW46IFstSW5maW5pdHksIEluZmluaXR5XVxyXG4gICAqIFJhbmdlOiBbMSwgSW5maW5pdHldXHJcbiAgICpcclxuICAgKiBjb3NoKHgpID0gMSArIHheMi8yISArIHheNC80ISArIHheNi82ISArIC4uLlxyXG4gICAqXHJcbiAgICogY29zaCgwKSAgICAgICAgID0gMVxyXG4gICAqIGNvc2goLTApICAgICAgICA9IDFcclxuICAgKiBjb3NoKEluZmluaXR5KSAgPSBJbmZpbml0eVxyXG4gICAqIGNvc2goLUluZmluaXR5KSA9IEluZmluaXR5XHJcbiAgICogY29zaChOYU4pICAgICAgID0gTmFOXHJcbiAgICpcclxuICAgKiAgeCAgICAgICAgdGltZSB0YWtlbiAobXMpICAgcmVzdWx0XHJcbiAgICogMTAwMCAgICAgIDkgICAgICAgICAgICAgICAgIDkuODUwMzU1NTcwMDg1MjM0OTY5NGUrNDMzXHJcbiAgICogMTAwMDAgICAgIDI1ICAgICAgICAgICAgICAgIDQuNDAzNDA5MTEyODMxNDYwNzkzNmUrNDM0MlxyXG4gICAqIDEwMDAwMCAgICAxNzEgICAgICAgICAgICAgICAxLjQwMzMzMTY4MDIxMzA2MTU4OTdlKzQzNDI5XHJcbiAgICogMTAwMDAwMCAgIDM4MTcgICAgICAgICAgICAgIDEuNTE2NjA3Njk4NDAxMDQzNzcyNWUrNDM0Mjk0XHJcbiAgICogMTAwMDAwMDAgIGFiYW5kb25lZCBhZnRlciAyIG1pbnV0ZSB3YWl0XHJcbiAgICpcclxuICAgKiBUT0RPPyBDb21wYXJlIHBlcmZvcm1hbmNlIG9mIGNvc2goeCkgPSAwLjUgKiAoZXhwKHgpICsgZXhwKC14KSlcclxuICAgKlxyXG4gICAqL1xyXG4gIFAuaHlwZXJib2xpY0Nvc2luZSA9IFAuY29zaCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBrLCBuLCBwciwgcm0sIGxlbixcclxuICAgICAgeCA9IHRoaXMsXHJcbiAgICAgIEN0b3IgPSB4LmNvbnN0cnVjdG9yLFxyXG4gICAgICBvbmUgPSBuZXcgQ3RvcigxKTtcclxuXHJcbiAgICBpZiAoIXguaXNGaW5pdGUoKSkgcmV0dXJuIG5ldyBDdG9yKHgucyA/IDEgLyAwIDogTmFOKTtcclxuICAgIGlmICh4LmlzWmVybygpKSByZXR1cm4gb25lO1xyXG5cclxuICAgIHByID0gQ3Rvci5wcmVjaXNpb247XHJcbiAgICBybSA9IEN0b3Iucm91bmRpbmc7XHJcbiAgICBDdG9yLnByZWNpc2lvbiA9IHByICsgTWF0aC5tYXgoeC5lLCB4LnNkKCkpICsgNDtcclxuICAgIEN0b3Iucm91bmRpbmcgPSAxO1xyXG4gICAgbGVuID0geC5kLmxlbmd0aDtcclxuXHJcbiAgICAvLyBBcmd1bWVudCByZWR1Y3Rpb246IGNvcyg0eCkgPSAxIC0gOGNvc14yKHgpICsgOGNvc140KHgpICsgMVxyXG4gICAgLy8gaS5lLiBjb3MoeCkgPSAxIC0gY29zXjIoeC80KSg4IC0gOGNvc14yKHgvNCkpXHJcblxyXG4gICAgLy8gRXN0aW1hdGUgdGhlIG9wdGltdW0gbnVtYmVyIG9mIHRpbWVzIHRvIHVzZSB0aGUgYXJndW1lbnQgcmVkdWN0aW9uLlxyXG4gICAgLy8gVE9ETz8gRXN0aW1hdGlvbiByZXVzZWQgZnJvbSBjb3NpbmUoKSBhbmQgbWF5IG5vdCBiZSBvcHRpbWFsIGhlcmUuXHJcbiAgICBpZiAobGVuIDwgMzIpIHtcclxuICAgICAgayA9IE1hdGguY2VpbChsZW4gLyAzKTtcclxuICAgICAgbiA9ICgxIC8gdGlueVBvdyg0LCBrKSkudG9TdHJpbmcoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGsgPSAxNjtcclxuICAgICAgbiA9ICcyLjMyODMwNjQzNjUzODY5NjI4OTA2MjVlLTEwJztcclxuICAgIH1cclxuXHJcbiAgICB4ID0gdGF5bG9yU2VyaWVzKEN0b3IsIDEsIHgudGltZXMobiksIG5ldyBDdG9yKDEpLCB0cnVlKTtcclxuXHJcbiAgICAvLyBSZXZlcnNlIGFyZ3VtZW50IHJlZHVjdGlvblxyXG4gICAgdmFyIGNvc2gyX3gsXHJcbiAgICAgIGkgPSBrLFxyXG4gICAgICBkOCA9IG5ldyBDdG9yKDgpO1xyXG4gICAgZm9yICg7IGktLTspIHtcclxuICAgICAgY29zaDJfeCA9IHgudGltZXMoeCk7XHJcbiAgICAgIHggPSBvbmUubWludXMoY29zaDJfeC50aW1lcyhkOC5taW51cyhjb3NoMl94LnRpbWVzKGQ4KSkpKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZmluYWxpc2UoeCwgQ3Rvci5wcmVjaXNpb24gPSBwciwgQ3Rvci5yb3VuZGluZyA9IHJtLCB0cnVlKTtcclxuICB9O1xyXG5cclxuXHJcbiAgLypcclxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgaHlwZXJib2xpYyBzaW5lIG9mIHRoZSB2YWx1ZSBpbiByYWRpYW5zIG9mIHRoaXNcclxuICAgKiBEZWNpbWFsLlxyXG4gICAqXHJcbiAgICogRG9tYWluOiBbLUluZmluaXR5LCBJbmZpbml0eV1cclxuICAgKiBSYW5nZTogWy1JbmZpbml0eSwgSW5maW5pdHldXHJcbiAgICpcclxuICAgKiBzaW5oKHgpID0geCArIHheMy8zISArIHheNS81ISArIHheNy83ISArIC4uLlxyXG4gICAqXHJcbiAgICogc2luaCgwKSAgICAgICAgID0gMFxyXG4gICAqIHNpbmgoLTApICAgICAgICA9IC0wXHJcbiAgICogc2luaChJbmZpbml0eSkgID0gSW5maW5pdHlcclxuICAgKiBzaW5oKC1JbmZpbml0eSkgPSAtSW5maW5pdHlcclxuICAgKiBzaW5oKE5hTikgICAgICAgPSBOYU5cclxuICAgKlxyXG4gICAqIHggICAgICAgIHRpbWUgdGFrZW4gKG1zKVxyXG4gICAqIDEwICAgICAgIDIgbXNcclxuICAgKiAxMDAgICAgICA1IG1zXHJcbiAgICogMTAwMCAgICAgMTQgbXNcclxuICAgKiAxMDAwMCAgICA4MiBtc1xyXG4gICAqIDEwMDAwMCAgIDg4NiBtcyAgICAgICAgICAgIDEuNDAzMzMxNjgwMjEzMDYxNTg5N2UrNDM0MjlcclxuICAgKiAyMDAwMDAgICAyNjEzIG1zXHJcbiAgICogMzAwMDAwICAgNTQwNyBtc1xyXG4gICAqIDQwMDAwMCAgIDg4MjQgbXNcclxuICAgKiA1MDAwMDAgICAxMzAyNiBtcyAgICAgICAgICA4LjcwODA2NDM2MTI3MTgwODQxMjllKzIxNzE0NlxyXG4gICAqIDEwMDAwMDAgIDQ4NTQzIG1zXHJcbiAgICpcclxuICAgKiBUT0RPPyBDb21wYXJlIHBlcmZvcm1hbmNlIG9mIHNpbmgoeCkgPSAwLjUgKiAoZXhwKHgpIC0gZXhwKC14KSlcclxuICAgKlxyXG4gICAqL1xyXG4gIFAuaHlwZXJib2xpY1NpbmUgPSBQLnNpbmggPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgaywgcHIsIHJtLCBsZW4sXHJcbiAgICAgIHggPSB0aGlzLFxyXG4gICAgICBDdG9yID0geC5jb25zdHJ1Y3RvcjtcclxuXHJcbiAgICBpZiAoIXguaXNGaW5pdGUoKSB8fCB4LmlzWmVybygpKSByZXR1cm4gbmV3IEN0b3IoeCk7XHJcblxyXG4gICAgcHIgPSBDdG9yLnByZWNpc2lvbjtcclxuICAgIHJtID0gQ3Rvci5yb3VuZGluZztcclxuICAgIEN0b3IucHJlY2lzaW9uID0gcHIgKyBNYXRoLm1heCh4LmUsIHguc2QoKSkgKyA0O1xyXG4gICAgQ3Rvci5yb3VuZGluZyA9IDE7XHJcbiAgICBsZW4gPSB4LmQubGVuZ3RoO1xyXG5cclxuICAgIGlmIChsZW4gPCAzKSB7XHJcbiAgICAgIHggPSB0YXlsb3JTZXJpZXMoQ3RvciwgMiwgeCwgeCwgdHJ1ZSk7XHJcbiAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgLy8gQWx0ZXJuYXRpdmUgYXJndW1lbnQgcmVkdWN0aW9uOiBzaW5oKDN4KSA9IHNpbmgoeCkoMyArIDRzaW5oXjIoeCkpXHJcbiAgICAgIC8vIGkuZS4gc2luaCh4KSA9IHNpbmgoeC8zKSgzICsgNHNpbmheMih4LzMpKVxyXG4gICAgICAvLyAzIG11bHRpcGxpY2F0aW9ucyBhbmQgMSBhZGRpdGlvblxyXG5cclxuICAgICAgLy8gQXJndW1lbnQgcmVkdWN0aW9uOiBzaW5oKDV4KSA9IHNpbmgoeCkoNSArIHNpbmheMih4KSgyMCArIDE2c2luaF4yKHgpKSlcclxuICAgICAgLy8gaS5lLiBzaW5oKHgpID0gc2luaCh4LzUpKDUgKyBzaW5oXjIoeC81KSgyMCArIDE2c2luaF4yKHgvNSkpKVxyXG4gICAgICAvLyA0IG11bHRpcGxpY2F0aW9ucyBhbmQgMiBhZGRpdGlvbnNcclxuXHJcbiAgICAgIC8vIEVzdGltYXRlIHRoZSBvcHRpbXVtIG51bWJlciBvZiB0aW1lcyB0byB1c2UgdGhlIGFyZ3VtZW50IHJlZHVjdGlvbi5cclxuICAgICAgayA9IDEuNCAqIE1hdGguc3FydChsZW4pO1xyXG4gICAgICBrID0gayA+IDE2ID8gMTYgOiBrIHwgMDtcclxuXHJcbiAgICAgIHggPSB4LnRpbWVzKDEgLyB0aW55UG93KDUsIGspKTtcclxuICAgICAgeCA9IHRheWxvclNlcmllcyhDdG9yLCAyLCB4LCB4LCB0cnVlKTtcclxuXHJcbiAgICAgIC8vIFJldmVyc2UgYXJndW1lbnQgcmVkdWN0aW9uXHJcbiAgICAgIHZhciBzaW5oMl94LFxyXG4gICAgICAgIGQ1ID0gbmV3IEN0b3IoNSksXHJcbiAgICAgICAgZDE2ID0gbmV3IEN0b3IoMTYpLFxyXG4gICAgICAgIGQyMCA9IG5ldyBDdG9yKDIwKTtcclxuICAgICAgZm9yICg7IGstLTspIHtcclxuICAgICAgICBzaW5oMl94ID0geC50aW1lcyh4KTtcclxuICAgICAgICB4ID0geC50aW1lcyhkNS5wbHVzKHNpbmgyX3gudGltZXMoZDE2LnRpbWVzKHNpbmgyX3gpLnBsdXMoZDIwKSkpKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIEN0b3IucHJlY2lzaW9uID0gcHI7XHJcbiAgICBDdG9yLnJvdW5kaW5nID0gcm07XHJcblxyXG4gICAgcmV0dXJuIGZpbmFsaXNlKHgsIHByLCBybSwgdHJ1ZSk7XHJcbiAgfTtcclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgdGhlIGh5cGVyYm9saWMgdGFuZ2VudCBvZiB0aGUgdmFsdWUgaW4gcmFkaWFucyBvZiB0aGlzXHJcbiAgICogRGVjaW1hbC5cclxuICAgKlxyXG4gICAqIERvbWFpbjogWy1JbmZpbml0eSwgSW5maW5pdHldXHJcbiAgICogUmFuZ2U6IFstMSwgMV1cclxuICAgKlxyXG4gICAqIHRhbmgoeCkgPSBzaW5oKHgpIC8gY29zaCh4KVxyXG4gICAqXHJcbiAgICogdGFuaCgwKSAgICAgICAgID0gMFxyXG4gICAqIHRhbmgoLTApICAgICAgICA9IC0wXHJcbiAgICogdGFuaChJbmZpbml0eSkgID0gMVxyXG4gICAqIHRhbmgoLUluZmluaXR5KSA9IC0xXHJcbiAgICogdGFuaChOYU4pICAgICAgID0gTmFOXHJcbiAgICpcclxuICAgKi9cclxuICBQLmh5cGVyYm9saWNUYW5nZW50ID0gUC50YW5oID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIHByLCBybSxcclxuICAgICAgeCA9IHRoaXMsXHJcbiAgICAgIEN0b3IgPSB4LmNvbnN0cnVjdG9yO1xyXG5cclxuICAgIGlmICgheC5pc0Zpbml0ZSgpKSByZXR1cm4gbmV3IEN0b3IoeC5zKTtcclxuICAgIGlmICh4LmlzWmVybygpKSByZXR1cm4gbmV3IEN0b3IoeCk7XHJcblxyXG4gICAgcHIgPSBDdG9yLnByZWNpc2lvbjtcclxuICAgIHJtID0gQ3Rvci5yb3VuZGluZztcclxuICAgIEN0b3IucHJlY2lzaW9uID0gcHIgKyA3O1xyXG4gICAgQ3Rvci5yb3VuZGluZyA9IDE7XHJcblxyXG4gICAgcmV0dXJuIGRpdmlkZSh4LnNpbmgoKSwgeC5jb3NoKCksIEN0b3IucHJlY2lzaW9uID0gcHIsIEN0b3Iucm91bmRpbmcgPSBybSk7XHJcbiAgfTtcclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgdGhlIGFyY2Nvc2luZSAoaW52ZXJzZSBjb3NpbmUpIGluIHJhZGlhbnMgb2YgdGhlIHZhbHVlIG9mXHJcbiAgICogdGhpcyBEZWNpbWFsLlxyXG4gICAqXHJcbiAgICogRG9tYWluOiBbLTEsIDFdXHJcbiAgICogUmFuZ2U6IFswLCBwaV1cclxuICAgKlxyXG4gICAqIGFjb3MoeCkgPSBwaS8yIC0gYXNpbih4KVxyXG4gICAqXHJcbiAgICogYWNvcygwKSAgICAgICA9IHBpLzJcclxuICAgKiBhY29zKC0wKSAgICAgID0gcGkvMlxyXG4gICAqIGFjb3MoMSkgICAgICAgPSAwXHJcbiAgICogYWNvcygtMSkgICAgICA9IHBpXHJcbiAgICogYWNvcygxLzIpICAgICA9IHBpLzNcclxuICAgKiBhY29zKC0xLzIpICAgID0gMipwaS8zXHJcbiAgICogYWNvcyh8eHwgPiAxKSA9IE5hTlxyXG4gICAqIGFjb3MoTmFOKSAgICAgPSBOYU5cclxuICAgKlxyXG4gICAqL1xyXG4gIFAuaW52ZXJzZUNvc2luZSA9IFAuYWNvcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBoYWxmUGksXHJcbiAgICAgIHggPSB0aGlzLFxyXG4gICAgICBDdG9yID0geC5jb25zdHJ1Y3RvcixcclxuICAgICAgayA9IHguYWJzKCkuY21wKDEpLFxyXG4gICAgICBwciA9IEN0b3IucHJlY2lzaW9uLFxyXG4gICAgICBybSA9IEN0b3Iucm91bmRpbmc7XHJcblxyXG4gICAgaWYgKGsgIT09IC0xKSB7XHJcbiAgICAgIHJldHVybiBrID09PSAwXHJcbiAgICAgICAgLy8gfHh8IGlzIDFcclxuICAgICAgICA/IHguaXNOZWcoKSA/IGdldFBpKEN0b3IsIHByLCBybSkgOiBuZXcgQ3RvcigwKVxyXG4gICAgICAgIC8vIHx4fCA+IDEgb3IgeCBpcyBOYU5cclxuICAgICAgICA6IG5ldyBDdG9yKE5hTik7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHguaXNaZXJvKCkpIHJldHVybiBnZXRQaShDdG9yLCBwciArIDQsIHJtKS50aW1lcygwLjUpO1xyXG5cclxuICAgIC8vIFRPRE8/IFNwZWNpYWwgY2FzZSBhY29zKDAuNSkgPSBwaS8zIGFuZCBhY29zKC0wLjUpID0gMipwaS8zXHJcblxyXG4gICAgQ3Rvci5wcmVjaXNpb24gPSBwciArIDY7XHJcbiAgICBDdG9yLnJvdW5kaW5nID0gMTtcclxuXHJcbiAgICB4ID0geC5hc2luKCk7XHJcbiAgICBoYWxmUGkgPSBnZXRQaShDdG9yLCBwciArIDQsIHJtKS50aW1lcygwLjUpO1xyXG5cclxuICAgIEN0b3IucHJlY2lzaW9uID0gcHI7XHJcbiAgICBDdG9yLnJvdW5kaW5nID0gcm07XHJcblxyXG4gICAgcmV0dXJuIGhhbGZQaS5taW51cyh4KTtcclxuICB9O1xyXG5cclxuXHJcbiAgLypcclxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgaW52ZXJzZSBvZiB0aGUgaHlwZXJib2xpYyBjb3NpbmUgaW4gcmFkaWFucyBvZiB0aGVcclxuICAgKiB2YWx1ZSBvZiB0aGlzIERlY2ltYWwuXHJcbiAgICpcclxuICAgKiBEb21haW46IFsxLCBJbmZpbml0eV1cclxuICAgKiBSYW5nZTogWzAsIEluZmluaXR5XVxyXG4gICAqXHJcbiAgICogYWNvc2goeCkgPSBsbih4ICsgc3FydCh4XjIgLSAxKSlcclxuICAgKlxyXG4gICAqIGFjb3NoKHggPCAxKSAgICAgPSBOYU5cclxuICAgKiBhY29zaChOYU4pICAgICAgID0gTmFOXHJcbiAgICogYWNvc2goSW5maW5pdHkpICA9IEluZmluaXR5XHJcbiAgICogYWNvc2goLUluZmluaXR5KSA9IE5hTlxyXG4gICAqIGFjb3NoKDApICAgICAgICAgPSBOYU5cclxuICAgKiBhY29zaCgtMCkgICAgICAgID0gTmFOXHJcbiAgICogYWNvc2goMSkgICAgICAgICA9IDBcclxuICAgKiBhY29zaCgtMSkgICAgICAgID0gTmFOXHJcbiAgICpcclxuICAgKi9cclxuICBQLmludmVyc2VIeXBlcmJvbGljQ29zaW5lID0gUC5hY29zaCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBwciwgcm0sXHJcbiAgICAgIHggPSB0aGlzLFxyXG4gICAgICBDdG9yID0geC5jb25zdHJ1Y3RvcjtcclxuXHJcbiAgICBpZiAoeC5sdGUoMSkpIHJldHVybiBuZXcgQ3Rvcih4LmVxKDEpID8gMCA6IE5hTik7XHJcbiAgICBpZiAoIXguaXNGaW5pdGUoKSkgcmV0dXJuIG5ldyBDdG9yKHgpO1xyXG5cclxuICAgIHByID0gQ3Rvci5wcmVjaXNpb247XHJcbiAgICBybSA9IEN0b3Iucm91bmRpbmc7XHJcbiAgICBDdG9yLnByZWNpc2lvbiA9IHByICsgTWF0aC5tYXgoTWF0aC5hYnMoeC5lKSwgeC5zZCgpKSArIDQ7XHJcbiAgICBDdG9yLnJvdW5kaW5nID0gMTtcclxuICAgIGV4dGVybmFsID0gZmFsc2U7XHJcblxyXG4gICAgeCA9IHgudGltZXMoeCkubWludXMoMSkuc3FydCgpLnBsdXMoeCk7XHJcblxyXG4gICAgZXh0ZXJuYWwgPSB0cnVlO1xyXG4gICAgQ3Rvci5wcmVjaXNpb24gPSBwcjtcclxuICAgIEN0b3Iucm91bmRpbmcgPSBybTtcclxuXHJcbiAgICByZXR1cm4geC5sbigpO1xyXG4gIH07XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSBpbnZlcnNlIG9mIHRoZSBoeXBlcmJvbGljIHNpbmUgaW4gcmFkaWFucyBvZiB0aGUgdmFsdWVcclxuICAgKiBvZiB0aGlzIERlY2ltYWwuXHJcbiAgICpcclxuICAgKiBEb21haW46IFstSW5maW5pdHksIEluZmluaXR5XVxyXG4gICAqIFJhbmdlOiBbLUluZmluaXR5LCBJbmZpbml0eV1cclxuICAgKlxyXG4gICAqIGFzaW5oKHgpID0gbG4oeCArIHNxcnQoeF4yICsgMSkpXHJcbiAgICpcclxuICAgKiBhc2luaChOYU4pICAgICAgID0gTmFOXHJcbiAgICogYXNpbmgoSW5maW5pdHkpICA9IEluZmluaXR5XHJcbiAgICogYXNpbmgoLUluZmluaXR5KSA9IC1JbmZpbml0eVxyXG4gICAqIGFzaW5oKDApICAgICAgICAgPSAwXHJcbiAgICogYXNpbmgoLTApICAgICAgICA9IC0wXHJcbiAgICpcclxuICAgKi9cclxuICBQLmludmVyc2VIeXBlcmJvbGljU2luZSA9IFAuYXNpbmggPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgcHIsIHJtLFxyXG4gICAgICB4ID0gdGhpcyxcclxuICAgICAgQ3RvciA9IHguY29uc3RydWN0b3I7XHJcblxyXG4gICAgaWYgKCF4LmlzRmluaXRlKCkgfHwgeC5pc1plcm8oKSkgcmV0dXJuIG5ldyBDdG9yKHgpO1xyXG5cclxuICAgIHByID0gQ3Rvci5wcmVjaXNpb247XHJcbiAgICBybSA9IEN0b3Iucm91bmRpbmc7XHJcbiAgICBDdG9yLnByZWNpc2lvbiA9IHByICsgMiAqIE1hdGgubWF4KE1hdGguYWJzKHguZSksIHguc2QoKSkgKyA2O1xyXG4gICAgQ3Rvci5yb3VuZGluZyA9IDE7XHJcbiAgICBleHRlcm5hbCA9IGZhbHNlO1xyXG5cclxuICAgIHggPSB4LnRpbWVzKHgpLnBsdXMoMSkuc3FydCgpLnBsdXMoeCk7XHJcblxyXG4gICAgZXh0ZXJuYWwgPSB0cnVlO1xyXG4gICAgQ3Rvci5wcmVjaXNpb24gPSBwcjtcclxuICAgIEN0b3Iucm91bmRpbmcgPSBybTtcclxuXHJcbiAgICByZXR1cm4geC5sbigpO1xyXG4gIH07XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSBpbnZlcnNlIG9mIHRoZSBoeXBlcmJvbGljIHRhbmdlbnQgaW4gcmFkaWFucyBvZiB0aGVcclxuICAgKiB2YWx1ZSBvZiB0aGlzIERlY2ltYWwuXHJcbiAgICpcclxuICAgKiBEb21haW46IFstMSwgMV1cclxuICAgKiBSYW5nZTogWy1JbmZpbml0eSwgSW5maW5pdHldXHJcbiAgICpcclxuICAgKiBhdGFuaCh4KSA9IDAuNSAqIGxuKCgxICsgeCkgLyAoMSAtIHgpKVxyXG4gICAqXHJcbiAgICogYXRhbmgofHh8ID4gMSkgICA9IE5hTlxyXG4gICAqIGF0YW5oKE5hTikgICAgICAgPSBOYU5cclxuICAgKiBhdGFuaChJbmZpbml0eSkgID0gTmFOXHJcbiAgICogYXRhbmgoLUluZmluaXR5KSA9IE5hTlxyXG4gICAqIGF0YW5oKDApICAgICAgICAgPSAwXHJcbiAgICogYXRhbmgoLTApICAgICAgICA9IC0wXHJcbiAgICogYXRhbmgoMSkgICAgICAgICA9IEluZmluaXR5XHJcbiAgICogYXRhbmgoLTEpICAgICAgICA9IC1JbmZpbml0eVxyXG4gICAqXHJcbiAgICovXHJcbiAgUC5pbnZlcnNlSHlwZXJib2xpY1RhbmdlbnQgPSBQLmF0YW5oID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIHByLCBybSwgd3ByLCB4c2QsXHJcbiAgICAgIHggPSB0aGlzLFxyXG4gICAgICBDdG9yID0geC5jb25zdHJ1Y3RvcjtcclxuXHJcbiAgICBpZiAoIXguaXNGaW5pdGUoKSkgcmV0dXJuIG5ldyBDdG9yKE5hTik7XHJcbiAgICBpZiAoeC5lID49IDApIHJldHVybiBuZXcgQ3Rvcih4LmFicygpLmVxKDEpID8geC5zIC8gMCA6IHguaXNaZXJvKCkgPyB4IDogTmFOKTtcclxuXHJcbiAgICBwciA9IEN0b3IucHJlY2lzaW9uO1xyXG4gICAgcm0gPSBDdG9yLnJvdW5kaW5nO1xyXG4gICAgeHNkID0geC5zZCgpO1xyXG5cclxuICAgIGlmIChNYXRoLm1heCh4c2QsIHByKSA8IDIgKiAteC5lIC0gMSkgcmV0dXJuIGZpbmFsaXNlKG5ldyBDdG9yKHgpLCBwciwgcm0sIHRydWUpO1xyXG5cclxuICAgIEN0b3IucHJlY2lzaW9uID0gd3ByID0geHNkIC0geC5lO1xyXG5cclxuICAgIHggPSBkaXZpZGUoeC5wbHVzKDEpLCBuZXcgQ3RvcigxKS5taW51cyh4KSwgd3ByICsgcHIsIDEpO1xyXG5cclxuICAgIEN0b3IucHJlY2lzaW9uID0gcHIgKyA0O1xyXG4gICAgQ3Rvci5yb3VuZGluZyA9IDE7XHJcblxyXG4gICAgeCA9IHgubG4oKTtcclxuXHJcbiAgICBDdG9yLnByZWNpc2lvbiA9IHByO1xyXG4gICAgQ3Rvci5yb3VuZGluZyA9IHJtO1xyXG5cclxuICAgIHJldHVybiB4LnRpbWVzKDAuNSk7XHJcbiAgfTtcclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgdGhlIGFyY3NpbmUgKGludmVyc2Ugc2luZSkgaW4gcmFkaWFucyBvZiB0aGUgdmFsdWUgb2YgdGhpc1xyXG4gICAqIERlY2ltYWwuXHJcbiAgICpcclxuICAgKiBEb21haW46IFstSW5maW5pdHksIEluZmluaXR5XVxyXG4gICAqIFJhbmdlOiBbLXBpLzIsIHBpLzJdXHJcbiAgICpcclxuICAgKiBhc2luKHgpID0gMiphdGFuKHgvKDEgKyBzcXJ0KDEgLSB4XjIpKSlcclxuICAgKlxyXG4gICAqIGFzaW4oMCkgICAgICAgPSAwXHJcbiAgICogYXNpbigtMCkgICAgICA9IC0wXHJcbiAgICogYXNpbigxLzIpICAgICA9IHBpLzZcclxuICAgKiBhc2luKC0xLzIpICAgID0gLXBpLzZcclxuICAgKiBhc2luKDEpICAgICAgID0gcGkvMlxyXG4gICAqIGFzaW4oLTEpICAgICAgPSAtcGkvMlxyXG4gICAqIGFzaW4ofHh8ID4gMSkgPSBOYU5cclxuICAgKiBhc2luKE5hTikgICAgID0gTmFOXHJcbiAgICpcclxuICAgKiBUT0RPPyBDb21wYXJlIHBlcmZvcm1hbmNlIG9mIFRheWxvciBzZXJpZXMuXHJcbiAgICpcclxuICAgKi9cclxuICBQLmludmVyc2VTaW5lID0gUC5hc2luID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGhhbGZQaSwgayxcclxuICAgICAgcHIsIHJtLFxyXG4gICAgICB4ID0gdGhpcyxcclxuICAgICAgQ3RvciA9IHguY29uc3RydWN0b3I7XHJcblxyXG4gICAgaWYgKHguaXNaZXJvKCkpIHJldHVybiBuZXcgQ3Rvcih4KTtcclxuXHJcbiAgICBrID0geC5hYnMoKS5jbXAoMSk7XHJcbiAgICBwciA9IEN0b3IucHJlY2lzaW9uO1xyXG4gICAgcm0gPSBDdG9yLnJvdW5kaW5nO1xyXG5cclxuICAgIGlmIChrICE9PSAtMSkge1xyXG5cclxuICAgICAgLy8gfHh8IGlzIDFcclxuICAgICAgaWYgKGsgPT09IDApIHtcclxuICAgICAgICBoYWxmUGkgPSBnZXRQaShDdG9yLCBwciArIDQsIHJtKS50aW1lcygwLjUpO1xyXG4gICAgICAgIGhhbGZQaS5zID0geC5zO1xyXG4gICAgICAgIHJldHVybiBoYWxmUGk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIHx4fCA+IDEgb3IgeCBpcyBOYU5cclxuICAgICAgcmV0dXJuIG5ldyBDdG9yKE5hTik7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVE9ETz8gU3BlY2lhbCBjYXNlIGFzaW4oMS8yKSA9IHBpLzYgYW5kIGFzaW4oLTEvMikgPSAtcGkvNlxyXG5cclxuICAgIEN0b3IucHJlY2lzaW9uID0gcHIgKyA2O1xyXG4gICAgQ3Rvci5yb3VuZGluZyA9IDE7XHJcblxyXG4gICAgeCA9IHguZGl2KG5ldyBDdG9yKDEpLm1pbnVzKHgudGltZXMoeCkpLnNxcnQoKS5wbHVzKDEpKS5hdGFuKCk7XHJcblxyXG4gICAgQ3Rvci5wcmVjaXNpb24gPSBwcjtcclxuICAgIEN0b3Iucm91bmRpbmcgPSBybTtcclxuXHJcbiAgICByZXR1cm4geC50aW1lcygyKTtcclxuICB9O1xyXG5cclxuXHJcbiAgLypcclxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgYXJjdGFuZ2VudCAoaW52ZXJzZSB0YW5nZW50KSBpbiByYWRpYW5zIG9mIHRoZSB2YWx1ZVxyXG4gICAqIG9mIHRoaXMgRGVjaW1hbC5cclxuICAgKlxyXG4gICAqIERvbWFpbjogWy1JbmZpbml0eSwgSW5maW5pdHldXHJcbiAgICogUmFuZ2U6IFstcGkvMiwgcGkvMl1cclxuICAgKlxyXG4gICAqIGF0YW4oeCkgPSB4IC0geF4zLzMgKyB4XjUvNSAtIHheNy83ICsgLi4uXHJcbiAgICpcclxuICAgKiBhdGFuKDApICAgICAgICAgPSAwXHJcbiAgICogYXRhbigtMCkgICAgICAgID0gLTBcclxuICAgKiBhdGFuKDEpICAgICAgICAgPSBwaS80XHJcbiAgICogYXRhbigtMSkgICAgICAgID0gLXBpLzRcclxuICAgKiBhdGFuKEluZmluaXR5KSAgPSBwaS8yXHJcbiAgICogYXRhbigtSW5maW5pdHkpID0gLXBpLzJcclxuICAgKiBhdGFuKE5hTikgICAgICAgPSBOYU5cclxuICAgKlxyXG4gICAqL1xyXG4gIFAuaW52ZXJzZVRhbmdlbnQgPSBQLmF0YW4gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgaSwgaiwgaywgbiwgcHgsIHQsIHIsIHdwciwgeDIsXHJcbiAgICAgIHggPSB0aGlzLFxyXG4gICAgICBDdG9yID0geC5jb25zdHJ1Y3RvcixcclxuICAgICAgcHIgPSBDdG9yLnByZWNpc2lvbixcclxuICAgICAgcm0gPSBDdG9yLnJvdW5kaW5nO1xyXG5cclxuICAgIGlmICgheC5pc0Zpbml0ZSgpKSB7XHJcbiAgICAgIGlmICgheC5zKSByZXR1cm4gbmV3IEN0b3IoTmFOKTtcclxuICAgICAgaWYgKHByICsgNCA8PSBQSV9QUkVDSVNJT04pIHtcclxuICAgICAgICByID0gZ2V0UGkoQ3RvciwgcHIgKyA0LCBybSkudGltZXMoMC41KTtcclxuICAgICAgICByLnMgPSB4LnM7XHJcbiAgICAgICAgcmV0dXJuIHI7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSBpZiAoeC5pc1plcm8oKSkge1xyXG4gICAgICByZXR1cm4gbmV3IEN0b3IoeCk7XHJcbiAgICB9IGVsc2UgaWYgKHguYWJzKCkuZXEoMSkgJiYgcHIgKyA0IDw9IFBJX1BSRUNJU0lPTikge1xyXG4gICAgICByID0gZ2V0UGkoQ3RvciwgcHIgKyA0LCBybSkudGltZXMoMC4yNSk7XHJcbiAgICAgIHIucyA9IHgucztcclxuICAgICAgcmV0dXJuIHI7XHJcbiAgICB9XHJcblxyXG4gICAgQ3Rvci5wcmVjaXNpb24gPSB3cHIgPSBwciArIDEwO1xyXG4gICAgQ3Rvci5yb3VuZGluZyA9IDE7XHJcblxyXG4gICAgLy8gVE9ETz8gaWYgKHggPj0gMSAmJiBwciA8PSBQSV9QUkVDSVNJT04pIGF0YW4oeCkgPSBoYWxmUGkgKiB4LnMgLSBhdGFuKDEgLyB4KTtcclxuXHJcbiAgICAvLyBBcmd1bWVudCByZWR1Y3Rpb25cclxuICAgIC8vIEVuc3VyZSB8eHwgPCAwLjQyXHJcbiAgICAvLyBhdGFuKHgpID0gMiAqIGF0YW4oeCAvICgxICsgc3FydCgxICsgeF4yKSkpXHJcblxyXG4gICAgayA9IE1hdGgubWluKDI4LCB3cHIgLyBMT0dfQkFTRSArIDIgfCAwKTtcclxuXHJcbiAgICBmb3IgKGkgPSBrOyBpOyAtLWkpIHggPSB4LmRpdih4LnRpbWVzKHgpLnBsdXMoMSkuc3FydCgpLnBsdXMoMSkpO1xyXG5cclxuICAgIGV4dGVybmFsID0gZmFsc2U7XHJcblxyXG4gICAgaiA9IE1hdGguY2VpbCh3cHIgLyBMT0dfQkFTRSk7XHJcbiAgICBuID0gMTtcclxuICAgIHgyID0geC50aW1lcyh4KTtcclxuICAgIHIgPSBuZXcgQ3Rvcih4KTtcclxuICAgIHB4ID0geDtcclxuXHJcbiAgICAvLyBhdGFuKHgpID0geCAtIHheMy8zICsgeF41LzUgLSB4XjcvNyArIC4uLlxyXG4gICAgZm9yICg7IGkgIT09IC0xOykge1xyXG4gICAgICBweCA9IHB4LnRpbWVzKHgyKTtcclxuICAgICAgdCA9IHIubWludXMocHguZGl2KG4gKz0gMikpO1xyXG5cclxuICAgICAgcHggPSBweC50aW1lcyh4Mik7XHJcbiAgICAgIHIgPSB0LnBsdXMocHguZGl2KG4gKz0gMikpO1xyXG5cclxuICAgICAgaWYgKHIuZFtqXSAhPT0gdm9pZCAwKSBmb3IgKGkgPSBqOyByLmRbaV0gPT09IHQuZFtpXSAmJiBpLS07KTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoaykgciA9IHIudGltZXMoMiA8PCAoayAtIDEpKTtcclxuXHJcbiAgICBleHRlcm5hbCA9IHRydWU7XHJcblxyXG4gICAgcmV0dXJuIGZpbmFsaXNlKHIsIEN0b3IucHJlY2lzaW9uID0gcHIsIEN0b3Iucm91bmRpbmcgPSBybSwgdHJ1ZSk7XHJcbiAgfTtcclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgRGVjaW1hbCBpcyBhIGZpbml0ZSBudW1iZXIsIG90aGVyd2lzZSByZXR1cm4gZmFsc2UuXHJcbiAgICpcclxuICAgKi9cclxuICBQLmlzRmluaXRlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuICEhdGhpcy5kO1xyXG4gIH07XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIERlY2ltYWwgaXMgYW4gaW50ZWdlciwgb3RoZXJ3aXNlIHJldHVybiBmYWxzZS5cclxuICAgKlxyXG4gICAqL1xyXG4gIFAuaXNJbnRlZ2VyID0gUC5pc0ludCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiAhIXRoaXMuZCAmJiBtYXRoZmxvb3IodGhpcy5lIC8gTE9HX0JBU0UpID4gdGhpcy5kLmxlbmd0aCAtIDI7XHJcbiAgfTtcclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgRGVjaW1hbCBpcyBOYU4sIG90aGVyd2lzZSByZXR1cm4gZmFsc2UuXHJcbiAgICpcclxuICAgKi9cclxuICBQLmlzTmFOID0gZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuICF0aGlzLnM7XHJcbiAgfTtcclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgRGVjaW1hbCBpcyBuZWdhdGl2ZSwgb3RoZXJ3aXNlIHJldHVybiBmYWxzZS5cclxuICAgKlxyXG4gICAqL1xyXG4gIFAuaXNOZWdhdGl2ZSA9IFAuaXNOZWcgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5zIDwgMDtcclxuICB9O1xyXG5cclxuXHJcbiAgLypcclxuICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBEZWNpbWFsIGlzIHBvc2l0aXZlLCBvdGhlcndpc2UgcmV0dXJuIGZhbHNlLlxyXG4gICAqXHJcbiAgICovXHJcbiAgUC5pc1Bvc2l0aXZlID0gUC5pc1BvcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiB0aGlzLnMgPiAwO1xyXG4gIH07XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIERlY2ltYWwgaXMgMCBvciAtMCwgb3RoZXJ3aXNlIHJldHVybiBmYWxzZS5cclxuICAgKlxyXG4gICAqL1xyXG4gIFAuaXNaZXJvID0gZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuICEhdGhpcy5kICYmIHRoaXMuZFswXSA9PT0gMDtcclxuICB9O1xyXG5cclxuXHJcbiAgLypcclxuICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBEZWNpbWFsIGlzIGxlc3MgdGhhbiBgeWAsIG90aGVyd2lzZSByZXR1cm4gZmFsc2UuXHJcbiAgICpcclxuICAgKi9cclxuICBQLmxlc3NUaGFuID0gUC5sdCA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICByZXR1cm4gdGhpcy5jbXAoeSkgPCAwO1xyXG4gIH07XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIERlY2ltYWwgaXMgbGVzcyB0aGFuIG9yIGVxdWFsIHRvIGB5YCwgb3RoZXJ3aXNlIHJldHVybiBmYWxzZS5cclxuICAgKlxyXG4gICAqL1xyXG4gIFAubGVzc1RoYW5PckVxdWFsVG8gPSBQLmx0ZSA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICByZXR1cm4gdGhpcy5jbXAoeSkgPCAxO1xyXG4gIH07XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiB0aGUgbG9nYXJpdGhtIG9mIHRoZSB2YWx1ZSBvZiB0aGlzIERlY2ltYWwgdG8gdGhlIHNwZWNpZmllZCBiYXNlLCByb3VuZGVkIHRvIGBwcmVjaXNpb25gXHJcbiAgICogc2lnbmlmaWNhbnQgZGlnaXRzIHVzaW5nIHJvdW5kaW5nIG1vZGUgYHJvdW5kaW5nYC5cclxuICAgKlxyXG4gICAqIElmIG5vIGJhc2UgaXMgc3BlY2lmaWVkLCByZXR1cm4gbG9nWzEwXShhcmcpLlxyXG4gICAqXHJcbiAgICogbG9nW2Jhc2VdKGFyZykgPSBsbihhcmcpIC8gbG4oYmFzZSlcclxuICAgKlxyXG4gICAqIFRoZSByZXN1bHQgd2lsbCBhbHdheXMgYmUgY29ycmVjdGx5IHJvdW5kZWQgaWYgdGhlIGJhc2Ugb2YgdGhlIGxvZyBpcyAxMCwgYW5kICdhbG1vc3QgYWx3YXlzJ1xyXG4gICAqIG90aGVyd2lzZTpcclxuICAgKlxyXG4gICAqIERlcGVuZGluZyBvbiB0aGUgcm91bmRpbmcgbW9kZSwgdGhlIHJlc3VsdCBtYXkgYmUgaW5jb3JyZWN0bHkgcm91bmRlZCBpZiB0aGUgZmlyc3QgZmlmdGVlblxyXG4gICAqIHJvdW5kaW5nIGRpZ2l0cyBhcmUgWzQ5XTk5OTk5OTk5OTk5OTk5IG9yIFs1MF0wMDAwMDAwMDAwMDAwMC4gSW4gdGhhdCBjYXNlLCB0aGUgbWF4aW11bSBlcnJvclxyXG4gICAqIGJldHdlZW4gdGhlIHJlc3VsdCBhbmQgdGhlIGNvcnJlY3RseSByb3VuZGVkIHJlc3VsdCB3aWxsIGJlIG9uZSB1bHAgKHVuaXQgaW4gdGhlIGxhc3QgcGxhY2UpLlxyXG4gICAqXHJcbiAgICogbG9nWy1iXShhKSAgICAgICA9IE5hTlxyXG4gICAqIGxvZ1swXShhKSAgICAgICAgPSBOYU5cclxuICAgKiBsb2dbMV0oYSkgICAgICAgID0gTmFOXHJcbiAgICogbG9nW05hTl0oYSkgICAgICA9IE5hTlxyXG4gICAqIGxvZ1tJbmZpbml0eV0oYSkgPSBOYU5cclxuICAgKiBsb2dbYl0oMCkgICAgICAgID0gLUluZmluaXR5XHJcbiAgICogbG9nW2JdKC0wKSAgICAgICA9IC1JbmZpbml0eVxyXG4gICAqIGxvZ1tiXSgtYSkgICAgICAgPSBOYU5cclxuICAgKiBsb2dbYl0oMSkgICAgICAgID0gMFxyXG4gICAqIGxvZ1tiXShJbmZpbml0eSkgPSBJbmZpbml0eVxyXG4gICAqIGxvZ1tiXShOYU4pICAgICAgPSBOYU5cclxuICAgKlxyXG4gICAqIFtiYXNlXSB7bnVtYmVyfHN0cmluZ3xEZWNpbWFsfSBUaGUgYmFzZSBvZiB0aGUgbG9nYXJpdGhtLlxyXG4gICAqXHJcbiAgICovXHJcbiAgUC5sb2dhcml0aG0gPSBQLmxvZyA9IGZ1bmN0aW9uIChiYXNlKSB7XHJcbiAgICB2YXIgaXNCYXNlMTAsIGQsIGRlbm9taW5hdG9yLCBrLCBpbmYsIG51bSwgc2QsIHIsXHJcbiAgICAgIGFyZyA9IHRoaXMsXHJcbiAgICAgIEN0b3IgPSBhcmcuY29uc3RydWN0b3IsXHJcbiAgICAgIHByID0gQ3Rvci5wcmVjaXNpb24sXHJcbiAgICAgIHJtID0gQ3Rvci5yb3VuZGluZyxcclxuICAgICAgZ3VhcmQgPSA1O1xyXG5cclxuICAgIC8vIERlZmF1bHQgYmFzZSBpcyAxMC5cclxuICAgIGlmIChiYXNlID09IG51bGwpIHtcclxuICAgICAgYmFzZSA9IG5ldyBDdG9yKDEwKTtcclxuICAgICAgaXNCYXNlMTAgPSB0cnVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgYmFzZSA9IG5ldyBDdG9yKGJhc2UpO1xyXG4gICAgICBkID0gYmFzZS5kO1xyXG5cclxuICAgICAgLy8gUmV0dXJuIE5hTiBpZiBiYXNlIGlzIG5lZ2F0aXZlLCBvciBub24tZmluaXRlLCBvciBpcyAwIG9yIDEuXHJcbiAgICAgIGlmIChiYXNlLnMgPCAwIHx8ICFkIHx8ICFkWzBdIHx8IGJhc2UuZXEoMSkpIHJldHVybiBuZXcgQ3RvcihOYU4pO1xyXG5cclxuICAgICAgaXNCYXNlMTAgPSBiYXNlLmVxKDEwKTtcclxuICAgIH1cclxuXHJcbiAgICBkID0gYXJnLmQ7XHJcblxyXG4gICAgLy8gSXMgYXJnIG5lZ2F0aXZlLCBub24tZmluaXRlLCAwIG9yIDE/XHJcbiAgICBpZiAoYXJnLnMgPCAwIHx8ICFkIHx8ICFkWzBdIHx8IGFyZy5lcSgxKSkge1xyXG4gICAgICByZXR1cm4gbmV3IEN0b3IoZCAmJiAhZFswXSA/IC0xIC8gMCA6IGFyZy5zICE9IDEgPyBOYU4gOiBkID8gMCA6IDEgLyAwKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBUaGUgcmVzdWx0IHdpbGwgaGF2ZSBhIG5vbi10ZXJtaW5hdGluZyBkZWNpbWFsIGV4cGFuc2lvbiBpZiBiYXNlIGlzIDEwIGFuZCBhcmcgaXMgbm90IGFuXHJcbiAgICAvLyBpbnRlZ2VyIHBvd2VyIG9mIDEwLlxyXG4gICAgaWYgKGlzQmFzZTEwKSB7XHJcbiAgICAgIGlmIChkLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICBpbmYgPSB0cnVlO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGZvciAoayA9IGRbMF07IGsgJSAxMCA9PT0gMDspIGsgLz0gMTA7XHJcbiAgICAgICAgaW5mID0gayAhPT0gMTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGV4dGVybmFsID0gZmFsc2U7XHJcbiAgICBzZCA9IHByICsgZ3VhcmQ7XHJcbiAgICBudW0gPSBuYXR1cmFsTG9nYXJpdGhtKGFyZywgc2QpO1xyXG4gICAgZGVub21pbmF0b3IgPSBpc0Jhc2UxMCA/IGdldExuMTAoQ3Rvciwgc2QgKyAxMCkgOiBuYXR1cmFsTG9nYXJpdGhtKGJhc2UsIHNkKTtcclxuXHJcbiAgICAvLyBUaGUgcmVzdWx0IHdpbGwgaGF2ZSA1IHJvdW5kaW5nIGRpZ2l0cy5cclxuICAgIHIgPSBkaXZpZGUobnVtLCBkZW5vbWluYXRvciwgc2QsIDEpO1xyXG5cclxuICAgIC8vIElmIGF0IGEgcm91bmRpbmcgYm91bmRhcnksIGkuZS4gdGhlIHJlc3VsdCdzIHJvdW5kaW5nIGRpZ2l0cyBhcmUgWzQ5XTk5OTkgb3IgWzUwXTAwMDAsXHJcbiAgICAvLyBjYWxjdWxhdGUgMTAgZnVydGhlciBkaWdpdHMuXHJcbiAgICAvL1xyXG4gICAgLy8gSWYgdGhlIHJlc3VsdCBpcyBrbm93biB0byBoYXZlIGFuIGluZmluaXRlIGRlY2ltYWwgZXhwYW5zaW9uLCByZXBlYXQgdGhpcyB1bnRpbCBpdCBpcyBjbGVhclxyXG4gICAgLy8gdGhhdCB0aGUgcmVzdWx0IGlzIGFib3ZlIG9yIGJlbG93IHRoZSBib3VuZGFyeS4gT3RoZXJ3aXNlLCBpZiBhZnRlciBjYWxjdWxhdGluZyB0aGUgMTBcclxuICAgIC8vIGZ1cnRoZXIgZGlnaXRzLCB0aGUgbGFzdCAxNCBhcmUgbmluZXMsIHJvdW5kIHVwIGFuZCBhc3N1bWUgdGhlIHJlc3VsdCBpcyBleGFjdC5cclxuICAgIC8vIEFsc28gYXNzdW1lIHRoZSByZXN1bHQgaXMgZXhhY3QgaWYgdGhlIGxhc3QgMTQgYXJlIHplcm8uXHJcbiAgICAvL1xyXG4gICAgLy8gRXhhbXBsZSBvZiBhIHJlc3VsdCB0aGF0IHdpbGwgYmUgaW5jb3JyZWN0bHkgcm91bmRlZDpcclxuICAgIC8vIGxvZ1sxMDQ4NTc2XSg0NTAzNTk5NjI3MzcwNTAyKSA9IDIuNjAwMDAwMDAwMDAwMDAwMDk2MTAyNzk1MTE0NDQ3NDYuLi5cclxuICAgIC8vIFRoZSBhYm92ZSByZXN1bHQgY29ycmVjdGx5IHJvdW5kZWQgdXNpbmcgUk9VTkRfQ0VJTCB0byAxIGRlY2ltYWwgcGxhY2Ugc2hvdWxkIGJlIDIuNywgYnV0IGl0XHJcbiAgICAvLyB3aWxsIGJlIGdpdmVuIGFzIDIuNiBhcyB0aGVyZSBhcmUgMTUgemVyb3MgaW1tZWRpYXRlbHkgYWZ0ZXIgdGhlIHJlcXVlc3RlZCBkZWNpbWFsIHBsYWNlLCBzb1xyXG4gICAgLy8gdGhlIGV4YWN0IHJlc3VsdCB3b3VsZCBiZSBhc3N1bWVkIHRvIGJlIDIuNiwgd2hpY2ggcm91bmRlZCB1c2luZyBST1VORF9DRUlMIHRvIDEgZGVjaW1hbFxyXG4gICAgLy8gcGxhY2UgaXMgc3RpbGwgMi42LlxyXG4gICAgaWYgKGNoZWNrUm91bmRpbmdEaWdpdHMoci5kLCBrID0gcHIsIHJtKSkge1xyXG5cclxuICAgICAgZG8ge1xyXG4gICAgICAgIHNkICs9IDEwO1xyXG4gICAgICAgIG51bSA9IG5hdHVyYWxMb2dhcml0aG0oYXJnLCBzZCk7XHJcbiAgICAgICAgZGVub21pbmF0b3IgPSBpc0Jhc2UxMCA/IGdldExuMTAoQ3Rvciwgc2QgKyAxMCkgOiBuYXR1cmFsTG9nYXJpdGhtKGJhc2UsIHNkKTtcclxuICAgICAgICByID0gZGl2aWRlKG51bSwgZGVub21pbmF0b3IsIHNkLCAxKTtcclxuXHJcbiAgICAgICAgaWYgKCFpbmYpIHtcclxuXHJcbiAgICAgICAgICAvLyBDaGVjayBmb3IgMTQgbmluZXMgZnJvbSB0aGUgMm5kIHJvdW5kaW5nIGRpZ2l0LCBhcyB0aGUgZmlyc3QgbWF5IGJlIDQuXHJcbiAgICAgICAgICBpZiAoK2RpZ2l0c1RvU3RyaW5nKHIuZCkuc2xpY2UoayArIDEsIGsgKyAxNSkgKyAxID09IDFlMTQpIHtcclxuICAgICAgICAgICAgciA9IGZpbmFsaXNlKHIsIHByICsgMSwgMCk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IHdoaWxlIChjaGVja1JvdW5kaW5nRGlnaXRzKHIuZCwgayArPSAxMCwgcm0pKTtcclxuICAgIH1cclxuXHJcbiAgICBleHRlcm5hbCA9IHRydWU7XHJcblxyXG4gICAgcmV0dXJuIGZpbmFsaXNlKHIsIHByLCBybSk7XHJcbiAgfTtcclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgdGhlIG1heGltdW0gb2YgdGhlIGFyZ3VtZW50cyBhbmQgdGhlIHZhbHVlIG9mIHRoaXMgRGVjaW1hbC5cclxuICAgKlxyXG4gICAqIGFyZ3VtZW50cyB7bnVtYmVyfHN0cmluZ3xEZWNpbWFsfVxyXG4gICAqXHJcbiAgUC5tYXggPSBmdW5jdGlvbiAoKSB7XHJcbiAgICBBcnJheS5wcm90b3R5cGUucHVzaC5jYWxsKGFyZ3VtZW50cywgdGhpcyk7XHJcbiAgICByZXR1cm4gbWF4T3JNaW4odGhpcy5jb25zdHJ1Y3RvciwgYXJndW1lbnRzLCAnbHQnKTtcclxuICB9O1xyXG4gICAqL1xyXG5cclxuXHJcbiAgLypcclxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgbWluaW11bSBvZiB0aGUgYXJndW1lbnRzIGFuZCB0aGUgdmFsdWUgb2YgdGhpcyBEZWNpbWFsLlxyXG4gICAqXHJcbiAgICogYXJndW1lbnRzIHtudW1iZXJ8c3RyaW5nfERlY2ltYWx9XHJcbiAgICpcclxuICBQLm1pbiA9IGZ1bmN0aW9uICgpIHtcclxuICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmNhbGwoYXJndW1lbnRzLCB0aGlzKTtcclxuICAgIHJldHVybiBtYXhPck1pbih0aGlzLmNvbnN0cnVjdG9yLCBhcmd1bWVudHMsICdndCcpO1xyXG4gIH07XHJcbiAgICovXHJcblxyXG5cclxuICAvKlxyXG4gICAqICBuIC0gMCA9IG5cclxuICAgKiAgbiAtIE4gPSBOXHJcbiAgICogIG4gLSBJID0gLUlcclxuICAgKiAgMCAtIG4gPSAtblxyXG4gICAqICAwIC0gMCA9IDBcclxuICAgKiAgMCAtIE4gPSBOXHJcbiAgICogIDAgLSBJID0gLUlcclxuICAgKiAgTiAtIG4gPSBOXHJcbiAgICogIE4gLSAwID0gTlxyXG4gICAqICBOIC0gTiA9IE5cclxuICAgKiAgTiAtIEkgPSBOXHJcbiAgICogIEkgLSBuID0gSVxyXG4gICAqICBJIC0gMCA9IElcclxuICAgKiAgSSAtIE4gPSBOXHJcbiAgICogIEkgLSBJID0gTlxyXG4gICAqXHJcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgRGVjaW1hbCBtaW51cyBgeWAsIHJvdW5kZWQgdG8gYHByZWNpc2lvbmBcclxuICAgKiBzaWduaWZpY2FudCBkaWdpdHMgdXNpbmcgcm91bmRpbmcgbW9kZSBgcm91bmRpbmdgLlxyXG4gICAqXHJcbiAgICovXHJcbiAgUC5taW51cyA9IFAuc3ViID0gZnVuY3Rpb24gKHkpIHtcclxuICAgIHZhciBkLCBlLCBpLCBqLCBrLCBsZW4sIHByLCBybSwgeGQsIHhlLCB4TFR5LCB5ZCxcclxuICAgICAgeCA9IHRoaXMsXHJcbiAgICAgIEN0b3IgPSB4LmNvbnN0cnVjdG9yO1xyXG5cclxuICAgIHkgPSBuZXcgQ3Rvcih5KTtcclxuXHJcbiAgICAvLyBJZiBlaXRoZXIgaXMgbm90IGZpbml0ZS4uLlxyXG4gICAgaWYgKCF4LmQgfHwgIXkuZCkge1xyXG5cclxuICAgICAgLy8gUmV0dXJuIE5hTiBpZiBlaXRoZXIgaXMgTmFOLlxyXG4gICAgICBpZiAoIXgucyB8fCAheS5zKSB5ID0gbmV3IEN0b3IoTmFOKTtcclxuXHJcbiAgICAgIC8vIFJldHVybiB5IG5lZ2F0ZWQgaWYgeCBpcyBmaW5pdGUgYW5kIHkgaXMgwrFJbmZpbml0eS5cclxuICAgICAgZWxzZSBpZiAoeC5kKSB5LnMgPSAteS5zO1xyXG5cclxuICAgICAgLy8gUmV0dXJuIHggaWYgeSBpcyBmaW5pdGUgYW5kIHggaXMgwrFJbmZpbml0eS5cclxuICAgICAgLy8gUmV0dXJuIHggaWYgYm90aCBhcmUgwrFJbmZpbml0eSB3aXRoIGRpZmZlcmVudCBzaWducy5cclxuICAgICAgLy8gUmV0dXJuIE5hTiBpZiBib3RoIGFyZSDCsUluZmluaXR5IHdpdGggdGhlIHNhbWUgc2lnbi5cclxuICAgICAgZWxzZSB5ID0gbmV3IEN0b3IoeS5kIHx8IHgucyAhPT0geS5zID8geCA6IE5hTik7XHJcblxyXG4gICAgICByZXR1cm4geTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBJZiBzaWducyBkaWZmZXIuLi5cclxuICAgIGlmICh4LnMgIT0geS5zKSB7XHJcbiAgICAgIHkucyA9IC15LnM7XHJcbiAgICAgIHJldHVybiB4LnBsdXMoeSk7XHJcbiAgICB9XHJcblxyXG4gICAgeGQgPSB4LmQ7XHJcbiAgICB5ZCA9IHkuZDtcclxuICAgIHByID0gQ3Rvci5wcmVjaXNpb247XHJcbiAgICBybSA9IEN0b3Iucm91bmRpbmc7XHJcblxyXG4gICAgLy8gSWYgZWl0aGVyIGlzIHplcm8uLi5cclxuICAgIGlmICgheGRbMF0gfHwgIXlkWzBdKSB7XHJcblxyXG4gICAgICAvLyBSZXR1cm4geSBuZWdhdGVkIGlmIHggaXMgemVybyBhbmQgeSBpcyBub24temVyby5cclxuICAgICAgaWYgKHlkWzBdKSB5LnMgPSAteS5zO1xyXG5cclxuICAgICAgLy8gUmV0dXJuIHggaWYgeSBpcyB6ZXJvIGFuZCB4IGlzIG5vbi16ZXJvLlxyXG4gICAgICBlbHNlIGlmICh4ZFswXSkgeSA9IG5ldyBDdG9yKHgpO1xyXG5cclxuICAgICAgLy8gUmV0dXJuIHplcm8gaWYgYm90aCBhcmUgemVyby5cclxuICAgICAgLy8gRnJvbSBJRUVFIDc1NCAoMjAwOCkgNi4zOiAwIC0gMCA9IC0wIC0gLTAgPSAtMCB3aGVuIHJvdW5kaW5nIHRvIC1JbmZpbml0eS5cclxuICAgICAgZWxzZSByZXR1cm4gbmV3IEN0b3Iocm0gPT09IDMgPyAtMCA6IDApO1xyXG5cclxuICAgICAgcmV0dXJuIGV4dGVybmFsID8gZmluYWxpc2UoeSwgcHIsIHJtKSA6IHk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8geCBhbmQgeSBhcmUgZmluaXRlLCBub24temVybyBudW1iZXJzIHdpdGggdGhlIHNhbWUgc2lnbi5cclxuXHJcbiAgICAvLyBDYWxjdWxhdGUgYmFzZSAxZTcgZXhwb25lbnRzLlxyXG4gICAgZSA9IG1hdGhmbG9vcih5LmUgLyBMT0dfQkFTRSk7XHJcbiAgICB4ZSA9IG1hdGhmbG9vcih4LmUgLyBMT0dfQkFTRSk7XHJcblxyXG4gICAgeGQgPSB4ZC5zbGljZSgpO1xyXG4gICAgayA9IHhlIC0gZTtcclxuXHJcbiAgICAvLyBJZiBiYXNlIDFlNyBleHBvbmVudHMgZGlmZmVyLi4uXHJcbiAgICBpZiAoaykge1xyXG4gICAgICB4TFR5ID0gayA8IDA7XHJcblxyXG4gICAgICBpZiAoeExUeSkge1xyXG4gICAgICAgIGQgPSB4ZDtcclxuICAgICAgICBrID0gLWs7XHJcbiAgICAgICAgbGVuID0geWQubGVuZ3RoO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGQgPSB5ZDtcclxuICAgICAgICBlID0geGU7XHJcbiAgICAgICAgbGVuID0geGQubGVuZ3RoO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBOdW1iZXJzIHdpdGggbWFzc2l2ZWx5IGRpZmZlcmVudCBleHBvbmVudHMgd291bGQgcmVzdWx0IGluIGEgdmVyeSBoaWdoIG51bWJlciBvZlxyXG4gICAgICAvLyB6ZXJvcyBuZWVkaW5nIHRvIGJlIHByZXBlbmRlZCwgYnV0IHRoaXMgY2FuIGJlIGF2b2lkZWQgd2hpbGUgc3RpbGwgZW5zdXJpbmcgY29ycmVjdFxyXG4gICAgICAvLyByb3VuZGluZyBieSBsaW1pdGluZyB0aGUgbnVtYmVyIG9mIHplcm9zIHRvIGBNYXRoLmNlaWwocHIgLyBMT0dfQkFTRSkgKyAyYC5cclxuICAgICAgaSA9IE1hdGgubWF4KE1hdGguY2VpbChwciAvIExPR19CQVNFKSwgbGVuKSArIDI7XHJcblxyXG4gICAgICBpZiAoayA+IGkpIHtcclxuICAgICAgICBrID0gaTtcclxuICAgICAgICBkLmxlbmd0aCA9IDE7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFByZXBlbmQgemVyb3MgdG8gZXF1YWxpc2UgZXhwb25lbnRzLlxyXG4gICAgICBkLnJldmVyc2UoKTtcclxuICAgICAgZm9yIChpID0gazsgaS0tOykgZC5wdXNoKDApO1xyXG4gICAgICBkLnJldmVyc2UoKTtcclxuXHJcbiAgICAvLyBCYXNlIDFlNyBleHBvbmVudHMgZXF1YWwuXHJcbiAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgLy8gQ2hlY2sgZGlnaXRzIHRvIGRldGVybWluZSB3aGljaCBpcyB0aGUgYmlnZ2VyIG51bWJlci5cclxuXHJcbiAgICAgIGkgPSB4ZC5sZW5ndGg7XHJcbiAgICAgIGxlbiA9IHlkLmxlbmd0aDtcclxuICAgICAgeExUeSA9IGkgPCBsZW47XHJcbiAgICAgIGlmICh4TFR5KSBsZW4gPSBpO1xyXG5cclxuICAgICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgICAgaWYgKHhkW2ldICE9IHlkW2ldKSB7XHJcbiAgICAgICAgICB4TFR5ID0geGRbaV0gPCB5ZFtpXTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgayA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHhMVHkpIHtcclxuICAgICAgZCA9IHhkO1xyXG4gICAgICB4ZCA9IHlkO1xyXG4gICAgICB5ZCA9IGQ7XHJcbiAgICAgIHkucyA9IC15LnM7XHJcbiAgICB9XHJcblxyXG4gICAgbGVuID0geGQubGVuZ3RoO1xyXG5cclxuICAgIC8vIEFwcGVuZCB6ZXJvcyB0byBgeGRgIGlmIHNob3J0ZXIuXHJcbiAgICAvLyBEb24ndCBhZGQgemVyb3MgdG8gYHlkYCBpZiBzaG9ydGVyIGFzIHN1YnRyYWN0aW9uIG9ubHkgbmVlZHMgdG8gc3RhcnQgYXQgYHlkYCBsZW5ndGguXHJcbiAgICBmb3IgKGkgPSB5ZC5sZW5ndGggLSBsZW47IGkgPiAwOyAtLWkpIHhkW2xlbisrXSA9IDA7XHJcblxyXG4gICAgLy8gU3VidHJhY3QgeWQgZnJvbSB4ZC5cclxuICAgIGZvciAoaSA9IHlkLmxlbmd0aDsgaSA+IGs7KSB7XHJcblxyXG4gICAgICBpZiAoeGRbLS1pXSA8IHlkW2ldKSB7XHJcbiAgICAgICAgZm9yIChqID0gaTsgaiAmJiB4ZFstLWpdID09PSAwOykgeGRbal0gPSBCQVNFIC0gMTtcclxuICAgICAgICAtLXhkW2pdO1xyXG4gICAgICAgIHhkW2ldICs9IEJBU0U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHhkW2ldIC09IHlkW2ldO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFJlbW92ZSB0cmFpbGluZyB6ZXJvcy5cclxuICAgIGZvciAoOyB4ZFstLWxlbl0gPT09IDA7KSB4ZC5wb3AoKTtcclxuXHJcbiAgICAvLyBSZW1vdmUgbGVhZGluZyB6ZXJvcyBhbmQgYWRqdXN0IGV4cG9uZW50IGFjY29yZGluZ2x5LlxyXG4gICAgZm9yICg7IHhkWzBdID09PSAwOyB4ZC5zaGlmdCgpKSAtLWU7XHJcblxyXG4gICAgLy8gWmVybz9cclxuICAgIGlmICgheGRbMF0pIHJldHVybiBuZXcgQ3RvcihybSA9PT0gMyA/IC0wIDogMCk7XHJcblxyXG4gICAgeS5kID0geGQ7XHJcbiAgICB5LmUgPSBnZXRCYXNlMTBFeHBvbmVudCh4ZCwgZSk7XHJcblxyXG4gICAgcmV0dXJuIGV4dGVybmFsID8gZmluYWxpc2UoeSwgcHIsIHJtKSA6IHk7XHJcbiAgfTtcclxuXHJcblxyXG4gIC8qXHJcbiAgICogICBuICUgMCA9ICBOXHJcbiAgICogICBuICUgTiA9ICBOXHJcbiAgICogICBuICUgSSA9ICBuXHJcbiAgICogICAwICUgbiA9ICAwXHJcbiAgICogIC0wICUgbiA9IC0wXHJcbiAgICogICAwICUgMCA9ICBOXHJcbiAgICogICAwICUgTiA9ICBOXHJcbiAgICogICAwICUgSSA9ICAwXHJcbiAgICogICBOICUgbiA9ICBOXHJcbiAgICogICBOICUgMCA9ICBOXHJcbiAgICogICBOICUgTiA9ICBOXHJcbiAgICogICBOICUgSSA9ICBOXHJcbiAgICogICBJICUgbiA9ICBOXHJcbiAgICogICBJICUgMCA9ICBOXHJcbiAgICogICBJICUgTiA9ICBOXHJcbiAgICogICBJICUgSSA9ICBOXHJcbiAgICpcclxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBEZWNpbWFsIG1vZHVsbyBgeWAsIHJvdW5kZWQgdG9cclxuICAgKiBgcHJlY2lzaW9uYCBzaWduaWZpY2FudCBkaWdpdHMgdXNpbmcgcm91bmRpbmcgbW9kZSBgcm91bmRpbmdgLlxyXG4gICAqXHJcbiAgICogVGhlIHJlc3VsdCBkZXBlbmRzIG9uIHRoZSBtb2R1bG8gbW9kZS5cclxuICAgKlxyXG4gICAqL1xyXG4gIFAubW9kdWxvID0gUC5tb2QgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgdmFyIHEsXHJcbiAgICAgIHggPSB0aGlzLFxyXG4gICAgICBDdG9yID0geC5jb25zdHJ1Y3RvcjtcclxuXHJcbiAgICB5ID0gbmV3IEN0b3IoeSk7XHJcblxyXG4gICAgLy8gUmV0dXJuIE5hTiBpZiB4IGlzIMKxSW5maW5pdHkgb3IgTmFOLCBvciB5IGlzIE5hTiBvciDCsTAuXHJcbiAgICBpZiAoIXguZCB8fCAheS5zIHx8IHkuZCAmJiAheS5kWzBdKSByZXR1cm4gbmV3IEN0b3IoTmFOKTtcclxuXHJcbiAgICAvLyBSZXR1cm4geCBpZiB5IGlzIMKxSW5maW5pdHkgb3IgeCBpcyDCsTAuXHJcbiAgICBpZiAoIXkuZCB8fCB4LmQgJiYgIXguZFswXSkge1xyXG4gICAgICByZXR1cm4gZmluYWxpc2UobmV3IEN0b3IoeCksIEN0b3IucHJlY2lzaW9uLCBDdG9yLnJvdW5kaW5nKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBQcmV2ZW50IHJvdW5kaW5nIG9mIGludGVybWVkaWF0ZSBjYWxjdWxhdGlvbnMuXHJcbiAgICBleHRlcm5hbCA9IGZhbHNlO1xyXG5cclxuICAgIGlmIChDdG9yLm1vZHVsbyA9PSA5KSB7XHJcblxyXG4gICAgICAvLyBFdWNsaWRpYW4gZGl2aXNpb246IHEgPSBzaWduKHkpICogZmxvb3IoeCAvIGFicyh5KSlcclxuICAgICAgLy8gcmVzdWx0ID0geCAtIHEgKiB5ICAgIHdoZXJlICAwIDw9IHJlc3VsdCA8IGFicyh5KVxyXG4gICAgICBxID0gZGl2aWRlKHgsIHkuYWJzKCksIDAsIDMsIDEpO1xyXG4gICAgICBxLnMgKj0geS5zO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcSA9IGRpdmlkZSh4LCB5LCAwLCBDdG9yLm1vZHVsbywgMSk7XHJcbiAgICB9XHJcblxyXG4gICAgcSA9IHEudGltZXMoeSk7XHJcblxyXG4gICAgZXh0ZXJuYWwgPSB0cnVlO1xyXG5cclxuICAgIHJldHVybiB4Lm1pbnVzKHEpO1xyXG4gIH07XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSBuYXR1cmFsIGV4cG9uZW50aWFsIG9mIHRoZSB2YWx1ZSBvZiB0aGlzIERlY2ltYWwsXHJcbiAgICogaS5lLiB0aGUgYmFzZSBlIHJhaXNlZCB0byB0aGUgcG93ZXIgdGhlIHZhbHVlIG9mIHRoaXMgRGVjaW1hbCwgcm91bmRlZCB0byBgcHJlY2lzaW9uYFxyXG4gICAqIHNpZ25pZmljYW50IGRpZ2l0cyB1c2luZyByb3VuZGluZyBtb2RlIGByb3VuZGluZ2AuXHJcbiAgICpcclxuICAgKi9cclxuICBQLm5hdHVyYWxFeHBvbmVudGlhbCA9IFAuZXhwID0gZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIG5hdHVyYWxFeHBvbmVudGlhbCh0aGlzKTtcclxuICB9O1xyXG5cclxuXHJcbiAgLypcclxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgbmF0dXJhbCBsb2dhcml0aG0gb2YgdGhlIHZhbHVlIG9mIHRoaXMgRGVjaW1hbCxcclxuICAgKiByb3VuZGVkIHRvIGBwcmVjaXNpb25gIHNpZ25pZmljYW50IGRpZ2l0cyB1c2luZyByb3VuZGluZyBtb2RlIGByb3VuZGluZ2AuXHJcbiAgICpcclxuICAgKi9cclxuICBQLm5hdHVyYWxMb2dhcml0aG0gPSBQLmxuID0gZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIG5hdHVyYWxMb2dhcml0aG0odGhpcyk7XHJcbiAgfTtcclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgRGVjaW1hbCBuZWdhdGVkLCBpLmUuIGFzIGlmIG11bHRpcGxpZWQgYnlcclxuICAgKiAtMS5cclxuICAgKlxyXG4gICAqL1xyXG4gIFAubmVnYXRlZCA9IFAubmVnID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIHggPSBuZXcgdGhpcy5jb25zdHJ1Y3Rvcih0aGlzKTtcclxuICAgIHgucyA9IC14LnM7XHJcbiAgICByZXR1cm4gZmluYWxpc2UoeCk7XHJcbiAgfTtcclxuXHJcblxyXG4gIC8qXHJcbiAgICogIG4gKyAwID0gblxyXG4gICAqICBuICsgTiA9IE5cclxuICAgKiAgbiArIEkgPSBJXHJcbiAgICogIDAgKyBuID0gblxyXG4gICAqICAwICsgMCA9IDBcclxuICAgKiAgMCArIE4gPSBOXHJcbiAgICogIDAgKyBJID0gSVxyXG4gICAqICBOICsgbiA9IE5cclxuICAgKiAgTiArIDAgPSBOXHJcbiAgICogIE4gKyBOID0gTlxyXG4gICAqICBOICsgSSA9IE5cclxuICAgKiAgSSArIG4gPSBJXHJcbiAgICogIEkgKyAwID0gSVxyXG4gICAqICBJICsgTiA9IE5cclxuICAgKiAgSSArIEkgPSBJXHJcbiAgICpcclxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBEZWNpbWFsIHBsdXMgYHlgLCByb3VuZGVkIHRvIGBwcmVjaXNpb25gXHJcbiAgICogc2lnbmlmaWNhbnQgZGlnaXRzIHVzaW5nIHJvdW5kaW5nIG1vZGUgYHJvdW5kaW5nYC5cclxuICAgKlxyXG4gICAqL1xyXG4gIFAucGx1cyA9IFAuYWRkID0gZnVuY3Rpb24gKHkpIHtcclxuICAgIHZhciBjYXJyeSwgZCwgZSwgaSwgaywgbGVuLCBwciwgcm0sIHhkLCB5ZCxcclxuICAgICAgeCA9IHRoaXMsXHJcbiAgICAgIEN0b3IgPSB4LmNvbnN0cnVjdG9yO1xyXG5cclxuICAgIHkgPSBuZXcgQ3Rvcih5KTtcclxuXHJcbiAgICAvLyBJZiBlaXRoZXIgaXMgbm90IGZpbml0ZS4uLlxyXG4gICAgaWYgKCF4LmQgfHwgIXkuZCkge1xyXG5cclxuICAgICAgLy8gUmV0dXJuIE5hTiBpZiBlaXRoZXIgaXMgTmFOLlxyXG4gICAgICBpZiAoIXgucyB8fCAheS5zKSB5ID0gbmV3IEN0b3IoTmFOKTtcclxuXHJcbiAgICAgIC8vIFJldHVybiB4IGlmIHkgaXMgZmluaXRlIGFuZCB4IGlzIMKxSW5maW5pdHkuXHJcbiAgICAgIC8vIFJldHVybiB4IGlmIGJvdGggYXJlIMKxSW5maW5pdHkgd2l0aCB0aGUgc2FtZSBzaWduLlxyXG4gICAgICAvLyBSZXR1cm4gTmFOIGlmIGJvdGggYXJlIMKxSW5maW5pdHkgd2l0aCBkaWZmZXJlbnQgc2lnbnMuXHJcbiAgICAgIC8vIFJldHVybiB5IGlmIHggaXMgZmluaXRlIGFuZCB5IGlzIMKxSW5maW5pdHkuXHJcbiAgICAgIGVsc2UgaWYgKCF4LmQpIHkgPSBuZXcgQ3Rvcih5LmQgfHwgeC5zID09PSB5LnMgPyB4IDogTmFOKTtcclxuXHJcbiAgICAgIHJldHVybiB5O1xyXG4gICAgfVxyXG5cclxuICAgICAvLyBJZiBzaWducyBkaWZmZXIuLi5cclxuICAgIGlmICh4LnMgIT0geS5zKSB7XHJcbiAgICAgIHkucyA9IC15LnM7XHJcbiAgICAgIHJldHVybiB4Lm1pbnVzKHkpO1xyXG4gICAgfVxyXG5cclxuICAgIHhkID0geC5kO1xyXG4gICAgeWQgPSB5LmQ7XHJcbiAgICBwciA9IEN0b3IucHJlY2lzaW9uO1xyXG4gICAgcm0gPSBDdG9yLnJvdW5kaW5nO1xyXG5cclxuICAgIC8vIElmIGVpdGhlciBpcyB6ZXJvLi4uXHJcbiAgICBpZiAoIXhkWzBdIHx8ICF5ZFswXSkge1xyXG5cclxuICAgICAgLy8gUmV0dXJuIHggaWYgeSBpcyB6ZXJvLlxyXG4gICAgICAvLyBSZXR1cm4geSBpZiB5IGlzIG5vbi16ZXJvLlxyXG4gICAgICBpZiAoIXlkWzBdKSB5ID0gbmV3IEN0b3IoeCk7XHJcblxyXG4gICAgICByZXR1cm4gZXh0ZXJuYWwgPyBmaW5hbGlzZSh5LCBwciwgcm0pIDogeTtcclxuICAgIH1cclxuXHJcbiAgICAvLyB4IGFuZCB5IGFyZSBmaW5pdGUsIG5vbi16ZXJvIG51bWJlcnMgd2l0aCB0aGUgc2FtZSBzaWduLlxyXG5cclxuICAgIC8vIENhbGN1bGF0ZSBiYXNlIDFlNyBleHBvbmVudHMuXHJcbiAgICBrID0gbWF0aGZsb29yKHguZSAvIExPR19CQVNFKTtcclxuICAgIGUgPSBtYXRoZmxvb3IoeS5lIC8gTE9HX0JBU0UpO1xyXG5cclxuICAgIHhkID0geGQuc2xpY2UoKTtcclxuICAgIGkgPSBrIC0gZTtcclxuXHJcbiAgICAvLyBJZiBiYXNlIDFlNyBleHBvbmVudHMgZGlmZmVyLi4uXHJcbiAgICBpZiAoaSkge1xyXG5cclxuICAgICAgaWYgKGkgPCAwKSB7XHJcbiAgICAgICAgZCA9IHhkO1xyXG4gICAgICAgIGkgPSAtaTtcclxuICAgICAgICBsZW4gPSB5ZC5sZW5ndGg7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZCA9IHlkO1xyXG4gICAgICAgIGUgPSBrO1xyXG4gICAgICAgIGxlbiA9IHhkLmxlbmd0aDtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gTGltaXQgbnVtYmVyIG9mIHplcm9zIHByZXBlbmRlZCB0byBtYXgoY2VpbChwciAvIExPR19CQVNFKSwgbGVuKSArIDEuXHJcbiAgICAgIGsgPSBNYXRoLmNlaWwocHIgLyBMT0dfQkFTRSk7XHJcbiAgICAgIGxlbiA9IGsgPiBsZW4gPyBrICsgMSA6IGxlbiArIDE7XHJcblxyXG4gICAgICBpZiAoaSA+IGxlbikge1xyXG4gICAgICAgIGkgPSBsZW47XHJcbiAgICAgICAgZC5sZW5ndGggPSAxO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBQcmVwZW5kIHplcm9zIHRvIGVxdWFsaXNlIGV4cG9uZW50cy4gTm90ZTogRmFzdGVyIHRvIHVzZSByZXZlcnNlIHRoZW4gZG8gdW5zaGlmdHMuXHJcbiAgICAgIGQucmV2ZXJzZSgpO1xyXG4gICAgICBmb3IgKDsgaS0tOykgZC5wdXNoKDApO1xyXG4gICAgICBkLnJldmVyc2UoKTtcclxuICAgIH1cclxuXHJcbiAgICBsZW4gPSB4ZC5sZW5ndGg7XHJcbiAgICBpID0geWQubGVuZ3RoO1xyXG5cclxuICAgIC8vIElmIHlkIGlzIGxvbmdlciB0aGFuIHhkLCBzd2FwIHhkIGFuZCB5ZCBzbyB4ZCBwb2ludHMgdG8gdGhlIGxvbmdlciBhcnJheS5cclxuICAgIGlmIChsZW4gLSBpIDwgMCkge1xyXG4gICAgICBpID0gbGVuO1xyXG4gICAgICBkID0geWQ7XHJcbiAgICAgIHlkID0geGQ7XHJcbiAgICAgIHhkID0gZDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBPbmx5IHN0YXJ0IGFkZGluZyBhdCB5ZC5sZW5ndGggLSAxIGFzIHRoZSBmdXJ0aGVyIGRpZ2l0cyBvZiB4ZCBjYW4gYmUgbGVmdCBhcyB0aGV5IGFyZS5cclxuICAgIGZvciAoY2FycnkgPSAwOyBpOykge1xyXG4gICAgICBjYXJyeSA9ICh4ZFstLWldID0geGRbaV0gKyB5ZFtpXSArIGNhcnJ5KSAvIEJBU0UgfCAwO1xyXG4gICAgICB4ZFtpXSAlPSBCQVNFO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChjYXJyeSkge1xyXG4gICAgICB4ZC51bnNoaWZ0KGNhcnJ5KTtcclxuICAgICAgKytlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFJlbW92ZSB0cmFpbGluZyB6ZXJvcy5cclxuICAgIC8vIE5vIG5lZWQgdG8gY2hlY2sgZm9yIHplcm8sIGFzICt4ICsgK3kgIT0gMCAmJiAteCArIC15ICE9IDBcclxuICAgIGZvciAobGVuID0geGQubGVuZ3RoOyB4ZFstLWxlbl0gPT0gMDspIHhkLnBvcCgpO1xyXG5cclxuICAgIHkuZCA9IHhkO1xyXG4gICAgeS5lID0gZ2V0QmFzZTEwRXhwb25lbnQoeGQsIGUpO1xyXG5cclxuICAgIHJldHVybiBleHRlcm5hbCA/IGZpbmFsaXNlKHksIHByLCBybSkgOiB5O1xyXG4gIH07XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiB0aGUgbnVtYmVyIG9mIHNpZ25pZmljYW50IGRpZ2l0cyBvZiB0aGUgdmFsdWUgb2YgdGhpcyBEZWNpbWFsLlxyXG4gICAqXHJcbiAgICogW3pdIHtib29sZWFufG51bWJlcn0gV2hldGhlciB0byBjb3VudCBpbnRlZ2VyLXBhcnQgdHJhaWxpbmcgemVyb3M6IHRydWUsIGZhbHNlLCAxIG9yIDAuXHJcbiAgICpcclxuICAgKi9cclxuICBQLnByZWNpc2lvbiA9IFAuc2QgPSBmdW5jdGlvbiAoeikge1xyXG4gICAgdmFyIGssXHJcbiAgICAgIHggPSB0aGlzO1xyXG5cclxuICAgIGlmICh6ICE9PSB2b2lkIDAgJiYgeiAhPT0gISF6ICYmIHogIT09IDEgJiYgeiAhPT0gMCkgdGhyb3cgRXJyb3IoaW52YWxpZEFyZ3VtZW50ICsgeik7XHJcblxyXG4gICAgaWYgKHguZCkge1xyXG4gICAgICBrID0gZ2V0UHJlY2lzaW9uKHguZCk7XHJcbiAgICAgIGlmICh6ICYmIHguZSArIDEgPiBrKSBrID0geC5lICsgMTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGsgPSBOYU47XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGs7XHJcbiAgfTtcclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgRGVjaW1hbCByb3VuZGVkIHRvIGEgd2hvbGUgbnVtYmVyIHVzaW5nXHJcbiAgICogcm91bmRpbmcgbW9kZSBgcm91bmRpbmdgLlxyXG4gICAqXHJcbiAgICovXHJcbiAgUC5yb3VuZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciB4ID0gdGhpcyxcclxuICAgICAgQ3RvciA9IHguY29uc3RydWN0b3I7XHJcblxyXG4gICAgcmV0dXJuIGZpbmFsaXNlKG5ldyBDdG9yKHgpLCB4LmUgKyAxLCBDdG9yLnJvdW5kaW5nKTtcclxuICB9O1xyXG5cclxuXHJcbiAgLypcclxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgc2luZSBvZiB0aGUgdmFsdWUgaW4gcmFkaWFucyBvZiB0aGlzIERlY2ltYWwuXHJcbiAgICpcclxuICAgKiBEb21haW46IFstSW5maW5pdHksIEluZmluaXR5XVxyXG4gICAqIFJhbmdlOiBbLTEsIDFdXHJcbiAgICpcclxuICAgKiBzaW4oeCkgPSB4IC0geF4zLzMhICsgeF41LzUhIC0gLi4uXHJcbiAgICpcclxuICAgKiBzaW4oMCkgICAgICAgICA9IDBcclxuICAgKiBzaW4oLTApICAgICAgICA9IC0wXHJcbiAgICogc2luKEluZmluaXR5KSAgPSBOYU5cclxuICAgKiBzaW4oLUluZmluaXR5KSA9IE5hTlxyXG4gICAqIHNpbihOYU4pICAgICAgID0gTmFOXHJcbiAgICpcclxuICAgKi9cclxuICBQLnNpbmUgPSBQLnNpbiA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBwciwgcm0sXHJcbiAgICAgIHggPSB0aGlzLFxyXG4gICAgICBDdG9yID0geC5jb25zdHJ1Y3RvcjtcclxuXHJcbiAgICBpZiAoIXguaXNGaW5pdGUoKSkgcmV0dXJuIG5ldyBDdG9yKE5hTik7XHJcbiAgICBpZiAoeC5pc1plcm8oKSkgcmV0dXJuIG5ldyBDdG9yKHgpO1xyXG5cclxuICAgIHByID0gQ3Rvci5wcmVjaXNpb247XHJcbiAgICBybSA9IEN0b3Iucm91bmRpbmc7XHJcbiAgICBDdG9yLnByZWNpc2lvbiA9IHByICsgTWF0aC5tYXgoeC5lLCB4LnNkKCkpICsgTE9HX0JBU0U7XHJcbiAgICBDdG9yLnJvdW5kaW5nID0gMTtcclxuXHJcbiAgICB4ID0gc2luZShDdG9yLCB0b0xlc3NUaGFuSGFsZlBpKEN0b3IsIHgpKTtcclxuXHJcbiAgICBDdG9yLnByZWNpc2lvbiA9IHByO1xyXG4gICAgQ3Rvci5yb3VuZGluZyA9IHJtO1xyXG5cclxuICAgIHJldHVybiBmaW5hbGlzZShxdWFkcmFudCA+IDIgPyB4Lm5lZygpIDogeCwgcHIsIHJtLCB0cnVlKTtcclxuICB9O1xyXG5cclxuXHJcbiAgLypcclxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgc3F1YXJlIHJvb3Qgb2YgdGhpcyBEZWNpbWFsLCByb3VuZGVkIHRvIGBwcmVjaXNpb25gXHJcbiAgICogc2lnbmlmaWNhbnQgZGlnaXRzIHVzaW5nIHJvdW5kaW5nIG1vZGUgYHJvdW5kaW5nYC5cclxuICAgKlxyXG4gICAqICBzcXJ0KC1uKSA9ICBOXHJcbiAgICogIHNxcnQoTikgID0gIE5cclxuICAgKiAgc3FydCgtSSkgPSAgTlxyXG4gICAqICBzcXJ0KEkpICA9ICBJXHJcbiAgICogIHNxcnQoMCkgID0gIDBcclxuICAgKiAgc3FydCgtMCkgPSAtMFxyXG4gICAqXHJcbiAgICovXHJcbiAgUC5zcXVhcmVSb290ID0gUC5zcXJ0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIG0sIG4sIHNkLCByLCByZXAsIHQsXHJcbiAgICAgIHggPSB0aGlzLFxyXG4gICAgICBkID0geC5kLFxyXG4gICAgICBlID0geC5lLFxyXG4gICAgICBzID0geC5zLFxyXG4gICAgICBDdG9yID0geC5jb25zdHJ1Y3RvcjtcclxuXHJcbiAgICAvLyBOZWdhdGl2ZS9OYU4vSW5maW5pdHkvemVybz9cclxuICAgIGlmIChzICE9PSAxIHx8ICFkIHx8ICFkWzBdKSB7XHJcbiAgICAgIHJldHVybiBuZXcgQ3RvcighcyB8fCBzIDwgMCAmJiAoIWQgfHwgZFswXSkgPyBOYU4gOiBkID8geCA6IDEgLyAwKTtcclxuICAgIH1cclxuXHJcbiAgICBleHRlcm5hbCA9IGZhbHNlO1xyXG5cclxuICAgIC8vIEluaXRpYWwgZXN0aW1hdGUuXHJcbiAgICBzID0gTWF0aC5zcXJ0KCt4KTtcclxuXHJcbiAgICAvLyBNYXRoLnNxcnQgdW5kZXJmbG93L292ZXJmbG93P1xyXG4gICAgLy8gUGFzcyB4IHRvIE1hdGguc3FydCBhcyBpbnRlZ2VyLCB0aGVuIGFkanVzdCB0aGUgZXhwb25lbnQgb2YgdGhlIHJlc3VsdC5cclxuICAgIGlmIChzID09IDAgfHwgcyA9PSAxIC8gMCkge1xyXG4gICAgICBuID0gZGlnaXRzVG9TdHJpbmcoZCk7XHJcblxyXG4gICAgICBpZiAoKG4ubGVuZ3RoICsgZSkgJSAyID09IDApIG4gKz0gJzAnO1xyXG4gICAgICBzID0gTWF0aC5zcXJ0KG4pO1xyXG4gICAgICBlID0gbWF0aGZsb29yKChlICsgMSkgLyAyKSAtIChlIDwgMCB8fCBlICUgMik7XHJcblxyXG4gICAgICBpZiAocyA9PSAxIC8gMCkge1xyXG4gICAgICAgIG4gPSAnMWUnICsgZTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBuID0gcy50b0V4cG9uZW50aWFsKCk7XHJcbiAgICAgICAgbiA9IG4uc2xpY2UoMCwgbi5pbmRleE9mKCdlJykgKyAxKSArIGU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHIgPSBuZXcgQ3RvcihuKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHIgPSBuZXcgQ3RvcihzLnRvU3RyaW5nKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIHNkID0gKGUgPSBDdG9yLnByZWNpc2lvbikgKyAzO1xyXG5cclxuICAgIC8vIE5ld3Rvbi1SYXBoc29uIGl0ZXJhdGlvbi5cclxuICAgIGZvciAoOzspIHtcclxuICAgICAgdCA9IHI7XHJcbiAgICAgIHIgPSB0LnBsdXMoZGl2aWRlKHgsIHQsIHNkICsgMiwgMSkpLnRpbWVzKDAuNSk7XHJcblxyXG4gICAgICAvLyBUT0RPPyBSZXBsYWNlIHdpdGggZm9yLWxvb3AgYW5kIGNoZWNrUm91bmRpbmdEaWdpdHMuXHJcbiAgICAgIGlmIChkaWdpdHNUb1N0cmluZyh0LmQpLnNsaWNlKDAsIHNkKSA9PT0gKG4gPSBkaWdpdHNUb1N0cmluZyhyLmQpKS5zbGljZSgwLCBzZCkpIHtcclxuICAgICAgICBuID0gbi5zbGljZShzZCAtIDMsIHNkICsgMSk7XHJcblxyXG4gICAgICAgIC8vIFRoZSA0dGggcm91bmRpbmcgZGlnaXQgbWF5IGJlIGluIGVycm9yIGJ5IC0xIHNvIGlmIHRoZSA0IHJvdW5kaW5nIGRpZ2l0cyBhcmUgOTk5OSBvclxyXG4gICAgICAgIC8vIDQ5OTksIGkuZS4gYXBwcm9hY2hpbmcgYSByb3VuZGluZyBib3VuZGFyeSwgY29udGludWUgdGhlIGl0ZXJhdGlvbi5cclxuICAgICAgICBpZiAobiA9PSAnOTk5OScgfHwgIXJlcCAmJiBuID09ICc0OTk5Jykge1xyXG5cclxuICAgICAgICAgIC8vIE9uIHRoZSBmaXJzdCBpdGVyYXRpb24gb25seSwgY2hlY2sgdG8gc2VlIGlmIHJvdW5kaW5nIHVwIGdpdmVzIHRoZSBleGFjdCByZXN1bHQgYXMgdGhlXHJcbiAgICAgICAgICAvLyBuaW5lcyBtYXkgaW5maW5pdGVseSByZXBlYXQuXHJcbiAgICAgICAgICBpZiAoIXJlcCkge1xyXG4gICAgICAgICAgICBmaW5hbGlzZSh0LCBlICsgMSwgMCk7XHJcblxyXG4gICAgICAgICAgICBpZiAodC50aW1lcyh0KS5lcSh4KSkge1xyXG4gICAgICAgICAgICAgIHIgPSB0O1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgc2QgKz0gNDtcclxuICAgICAgICAgIHJlcCA9IDE7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAvLyBJZiB0aGUgcm91bmRpbmcgZGlnaXRzIGFyZSBudWxsLCAwezAsNH0gb3IgNTB7MCwzfSwgY2hlY2sgZm9yIGFuIGV4YWN0IHJlc3VsdC5cclxuICAgICAgICAgIC8vIElmIG5vdCwgdGhlbiB0aGVyZSBhcmUgZnVydGhlciBkaWdpdHMgYW5kIG0gd2lsbCBiZSB0cnV0aHkuXHJcbiAgICAgICAgICBpZiAoIStuIHx8ICErbi5zbGljZSgxKSAmJiBuLmNoYXJBdCgwKSA9PSAnNScpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIFRydW5jYXRlIHRvIHRoZSBmaXJzdCByb3VuZGluZyBkaWdpdC5cclxuICAgICAgICAgICAgZmluYWxpc2UociwgZSArIDEsIDEpO1xyXG4gICAgICAgICAgICBtID0gIXIudGltZXMocikuZXEoeCk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZXh0ZXJuYWwgPSB0cnVlO1xyXG5cclxuICAgIHJldHVybiBmaW5hbGlzZShyLCBlLCBDdG9yLnJvdW5kaW5nLCBtKTtcclxuICB9O1xyXG5cclxuXHJcbiAgLypcclxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgdGFuZ2VudCBvZiB0aGUgdmFsdWUgaW4gcmFkaWFucyBvZiB0aGlzIERlY2ltYWwuXHJcbiAgICpcclxuICAgKiBEb21haW46IFstSW5maW5pdHksIEluZmluaXR5XVxyXG4gICAqIFJhbmdlOiBbLUluZmluaXR5LCBJbmZpbml0eV1cclxuICAgKlxyXG4gICAqIHRhbigwKSAgICAgICAgID0gMFxyXG4gICAqIHRhbigtMCkgICAgICAgID0gLTBcclxuICAgKiB0YW4oSW5maW5pdHkpICA9IE5hTlxyXG4gICAqIHRhbigtSW5maW5pdHkpID0gTmFOXHJcbiAgICogdGFuKE5hTikgICAgICAgPSBOYU5cclxuICAgKlxyXG4gICAqL1xyXG4gIFAudGFuZ2VudCA9IFAudGFuID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIHByLCBybSxcclxuICAgICAgeCA9IHRoaXMsXHJcbiAgICAgIEN0b3IgPSB4LmNvbnN0cnVjdG9yO1xyXG5cclxuICAgIGlmICgheC5pc0Zpbml0ZSgpKSByZXR1cm4gbmV3IEN0b3IoTmFOKTtcclxuICAgIGlmICh4LmlzWmVybygpKSByZXR1cm4gbmV3IEN0b3IoeCk7XHJcblxyXG4gICAgcHIgPSBDdG9yLnByZWNpc2lvbjtcclxuICAgIHJtID0gQ3Rvci5yb3VuZGluZztcclxuICAgIEN0b3IucHJlY2lzaW9uID0gcHIgKyAxMDtcclxuICAgIEN0b3Iucm91bmRpbmcgPSAxO1xyXG5cclxuICAgIHggPSB4LnNpbigpO1xyXG4gICAgeC5zID0gMTtcclxuICAgIHggPSBkaXZpZGUoeCwgbmV3IEN0b3IoMSkubWludXMoeC50aW1lcyh4KSkuc3FydCgpLCBwciArIDEwLCAwKTtcclxuXHJcbiAgICBDdG9yLnByZWNpc2lvbiA9IHByO1xyXG4gICAgQ3Rvci5yb3VuZGluZyA9IHJtO1xyXG5cclxuICAgIHJldHVybiBmaW5hbGlzZShxdWFkcmFudCA9PSAyIHx8IHF1YWRyYW50ID09IDQgPyB4Lm5lZygpIDogeCwgcHIsIHJtLCB0cnVlKTtcclxuICB9O1xyXG5cclxuXHJcbiAgLypcclxuICAgKiAgbiAqIDAgPSAwXHJcbiAgICogIG4gKiBOID0gTlxyXG4gICAqICBuICogSSA9IElcclxuICAgKiAgMCAqIG4gPSAwXHJcbiAgICogIDAgKiAwID0gMFxyXG4gICAqICAwICogTiA9IE5cclxuICAgKiAgMCAqIEkgPSBOXHJcbiAgICogIE4gKiBuID0gTlxyXG4gICAqICBOICogMCA9IE5cclxuICAgKiAgTiAqIE4gPSBOXHJcbiAgICogIE4gKiBJID0gTlxyXG4gICAqICBJICogbiA9IElcclxuICAgKiAgSSAqIDAgPSBOXHJcbiAgICogIEkgKiBOID0gTlxyXG4gICAqICBJICogSSA9IElcclxuICAgKlxyXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoaXMgRGVjaW1hbCB0aW1lcyBgeWAsIHJvdW5kZWQgdG8gYHByZWNpc2lvbmAgc2lnbmlmaWNhbnRcclxuICAgKiBkaWdpdHMgdXNpbmcgcm91bmRpbmcgbW9kZSBgcm91bmRpbmdgLlxyXG4gICAqXHJcbiAgICovXHJcbiAgUC50aW1lcyA9IFAubXVsID0gZnVuY3Rpb24gKHkpIHtcclxuICAgIHZhciBjYXJyeSwgZSwgaSwgaywgciwgckwsIHQsIHhkTCwgeWRMLFxyXG4gICAgICB4ID0gdGhpcyxcclxuICAgICAgQ3RvciA9IHguY29uc3RydWN0b3IsXHJcbiAgICAgIHhkID0geC5kLFxyXG4gICAgICB5ZCA9ICh5ID0gbmV3IEN0b3IoeSkpLmQ7XHJcblxyXG4gICAgeS5zICo9IHgucztcclxuXHJcbiAgICAgLy8gSWYgZWl0aGVyIGlzIE5hTiwgwrFJbmZpbml0eSBvciDCsTAuLi5cclxuICAgIGlmICgheGQgfHwgIXhkWzBdIHx8ICF5ZCB8fCAheWRbMF0pIHtcclxuXHJcbiAgICAgIHJldHVybiBuZXcgQ3RvcigheS5zIHx8IHhkICYmICF4ZFswXSAmJiAheWQgfHwgeWQgJiYgIXlkWzBdICYmICF4ZFxyXG5cclxuICAgICAgICAvLyBSZXR1cm4gTmFOIGlmIGVpdGhlciBpcyBOYU4uXHJcbiAgICAgICAgLy8gUmV0dXJuIE5hTiBpZiB4IGlzIMKxMCBhbmQgeSBpcyDCsUluZmluaXR5LCBvciB5IGlzIMKxMCBhbmQgeCBpcyDCsUluZmluaXR5LlxyXG4gICAgICAgID8gTmFOXHJcblxyXG4gICAgICAgIC8vIFJldHVybiDCsUluZmluaXR5IGlmIGVpdGhlciBpcyDCsUluZmluaXR5LlxyXG4gICAgICAgIC8vIFJldHVybiDCsTAgaWYgZWl0aGVyIGlzIMKxMC5cclxuICAgICAgICA6ICF4ZCB8fCAheWQgPyB5LnMgLyAwIDogeS5zICogMCk7XHJcbiAgICB9XHJcblxyXG4gICAgZSA9IG1hdGhmbG9vcih4LmUgLyBMT0dfQkFTRSkgKyBtYXRoZmxvb3IoeS5lIC8gTE9HX0JBU0UpO1xyXG4gICAgeGRMID0geGQubGVuZ3RoO1xyXG4gICAgeWRMID0geWQubGVuZ3RoO1xyXG5cclxuICAgIC8vIEVuc3VyZSB4ZCBwb2ludHMgdG8gdGhlIGxvbmdlciBhcnJheS5cclxuICAgIGlmICh4ZEwgPCB5ZEwpIHtcclxuICAgICAgciA9IHhkO1xyXG4gICAgICB4ZCA9IHlkO1xyXG4gICAgICB5ZCA9IHI7XHJcbiAgICAgIHJMID0geGRMO1xyXG4gICAgICB4ZEwgPSB5ZEw7XHJcbiAgICAgIHlkTCA9IHJMO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEluaXRpYWxpc2UgdGhlIHJlc3VsdCBhcnJheSB3aXRoIHplcm9zLlxyXG4gICAgciA9IFtdO1xyXG4gICAgckwgPSB4ZEwgKyB5ZEw7XHJcbiAgICBmb3IgKGkgPSByTDsgaS0tOykgci5wdXNoKDApO1xyXG5cclxuICAgIC8vIE11bHRpcGx5IVxyXG4gICAgZm9yIChpID0geWRMOyAtLWkgPj0gMDspIHtcclxuICAgICAgY2FycnkgPSAwO1xyXG4gICAgICBmb3IgKGsgPSB4ZEwgKyBpOyBrID4gaTspIHtcclxuICAgICAgICB0ID0gcltrXSArIHlkW2ldICogeGRbayAtIGkgLSAxXSArIGNhcnJ5O1xyXG4gICAgICAgIHJbay0tXSA9IHQgJSBCQVNFIHwgMDtcclxuICAgICAgICBjYXJyeSA9IHQgLyBCQVNFIHwgMDtcclxuICAgICAgfVxyXG5cclxuICAgICAgcltrXSA9IChyW2tdICsgY2FycnkpICUgQkFTRSB8IDA7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUmVtb3ZlIHRyYWlsaW5nIHplcm9zLlxyXG4gICAgZm9yICg7ICFyWy0tckxdOykgci5wb3AoKTtcclxuXHJcbiAgICBpZiAoY2FycnkpICsrZTtcclxuICAgIGVsc2Ugci5zaGlmdCgpO1xyXG5cclxuICAgIHkuZCA9IHI7XHJcbiAgICB5LmUgPSBnZXRCYXNlMTBFeHBvbmVudChyLCBlKTtcclxuXHJcbiAgICByZXR1cm4gZXh0ZXJuYWwgPyBmaW5hbGlzZSh5LCBDdG9yLnByZWNpc2lvbiwgQ3Rvci5yb3VuZGluZykgOiB5O1xyXG4gIH07XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHZhbHVlIG9mIHRoaXMgRGVjaW1hbCBpbiBiYXNlIDIsIHJvdW5kIHRvIGBzZGAgc2lnbmlmaWNhbnRcclxuICAgKiBkaWdpdHMgdXNpbmcgcm91bmRpbmcgbW9kZSBgcm1gLlxyXG4gICAqXHJcbiAgICogSWYgdGhlIG9wdGlvbmFsIGBzZGAgYXJndW1lbnQgaXMgcHJlc2VudCB0aGVuIHJldHVybiBiaW5hcnkgZXhwb25lbnRpYWwgbm90YXRpb24uXHJcbiAgICpcclxuICAgKiBbc2RdIHtudW1iZXJ9IFNpZ25pZmljYW50IGRpZ2l0cy4gSW50ZWdlciwgMSB0byBNQVhfRElHSVRTIGluY2x1c2l2ZS5cclxuICAgKiBbcm1dIHtudW1iZXJ9IFJvdW5kaW5nIG1vZGUuIEludGVnZXIsIDAgdG8gOCBpbmNsdXNpdmUuXHJcbiAgICpcclxuICAgKi9cclxuICBQLnRvQmluYXJ5ID0gZnVuY3Rpb24gKHNkLCBybSkge1xyXG4gICAgcmV0dXJuIHRvU3RyaW5nQmluYXJ5KHRoaXMsIDIsIHNkLCBybSk7XHJcbiAgfTtcclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgRGVjaW1hbCByb3VuZGVkIHRvIGEgbWF4aW11bSBvZiBgZHBgXHJcbiAgICogZGVjaW1hbCBwbGFjZXMgdXNpbmcgcm91bmRpbmcgbW9kZSBgcm1gIG9yIGByb3VuZGluZ2AgaWYgYHJtYCBpcyBvbWl0dGVkLlxyXG4gICAqXHJcbiAgICogSWYgYGRwYCBpcyBvbWl0dGVkLCByZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBEZWNpbWFsLlxyXG4gICAqXHJcbiAgICogW2RwXSB7bnVtYmVyfSBEZWNpbWFsIHBsYWNlcy4gSW50ZWdlciwgMCB0byBNQVhfRElHSVRTIGluY2x1c2l2ZS5cclxuICAgKiBbcm1dIHtudW1iZXJ9IFJvdW5kaW5nIG1vZGUuIEludGVnZXIsIDAgdG8gOCBpbmNsdXNpdmUuXHJcbiAgICpcclxuICAgKi9cclxuICBQLnRvRGVjaW1hbFBsYWNlcyA9IFAudG9EUCA9IGZ1bmN0aW9uIChkcCwgcm0pIHtcclxuICAgIHZhciB4ID0gdGhpcyxcclxuICAgICAgQ3RvciA9IHguY29uc3RydWN0b3I7XHJcblxyXG4gICAgeCA9IG5ldyBDdG9yKHgpO1xyXG4gICAgaWYgKGRwID09PSB2b2lkIDApIHJldHVybiB4O1xyXG5cclxuICAgIGNoZWNrSW50MzIoZHAsIDAsIE1BWF9ESUdJVFMpO1xyXG5cclxuICAgIGlmIChybSA9PT0gdm9pZCAwKSBybSA9IEN0b3Iucm91bmRpbmc7XHJcbiAgICBlbHNlIGNoZWNrSW50MzIocm0sIDAsIDgpO1xyXG5cclxuICAgIHJldHVybiBmaW5hbGlzZSh4LCBkcCArIHguZSArIDEsIHJtKTtcclxuICB9O1xyXG5cclxuXHJcbiAgLypcclxuICAgKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB2YWx1ZSBvZiB0aGlzIERlY2ltYWwgaW4gZXhwb25lbnRpYWwgbm90YXRpb24gcm91bmRlZCB0b1xyXG4gICAqIGBkcGAgZml4ZWQgZGVjaW1hbCBwbGFjZXMgdXNpbmcgcm91bmRpbmcgbW9kZSBgcm91bmRpbmdgLlxyXG4gICAqXHJcbiAgICogW2RwXSB7bnVtYmVyfSBEZWNpbWFsIHBsYWNlcy4gSW50ZWdlciwgMCB0byBNQVhfRElHSVRTIGluY2x1c2l2ZS5cclxuICAgKiBbcm1dIHtudW1iZXJ9IFJvdW5kaW5nIG1vZGUuIEludGVnZXIsIDAgdG8gOCBpbmNsdXNpdmUuXHJcbiAgICpcclxuICAgKi9cclxuICBQLnRvRXhwb25lbnRpYWwgPSBmdW5jdGlvbiAoZHAsIHJtKSB7XHJcbiAgICB2YXIgc3RyLFxyXG4gICAgICB4ID0gdGhpcyxcclxuICAgICAgQ3RvciA9IHguY29uc3RydWN0b3I7XHJcblxyXG4gICAgaWYgKGRwID09PSB2b2lkIDApIHtcclxuICAgICAgc3RyID0gZmluaXRlVG9TdHJpbmcoeCwgdHJ1ZSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjaGVja0ludDMyKGRwLCAwLCBNQVhfRElHSVRTKTtcclxuXHJcbiAgICAgIGlmIChybSA9PT0gdm9pZCAwKSBybSA9IEN0b3Iucm91bmRpbmc7XHJcbiAgICAgIGVsc2UgY2hlY2tJbnQzMihybSwgMCwgOCk7XHJcblxyXG4gICAgICB4ID0gZmluYWxpc2UobmV3IEN0b3IoeCksIGRwICsgMSwgcm0pO1xyXG4gICAgICBzdHIgPSBmaW5pdGVUb1N0cmluZyh4LCB0cnVlLCBkcCArIDEpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB4LmlzTmVnKCkgJiYgIXguaXNaZXJvKCkgPyAnLScgKyBzdHIgOiBzdHI7XHJcbiAgfTtcclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdmFsdWUgb2YgdGhpcyBEZWNpbWFsIGluIG5vcm1hbCAoZml4ZWQtcG9pbnQpIG5vdGF0aW9uIHRvXHJcbiAgICogYGRwYCBmaXhlZCBkZWNpbWFsIHBsYWNlcyBhbmQgcm91bmRlZCB1c2luZyByb3VuZGluZyBtb2RlIGBybWAgb3IgYHJvdW5kaW5nYCBpZiBgcm1gIGlzXHJcbiAgICogb21pdHRlZC5cclxuICAgKlxyXG4gICAqIEFzIHdpdGggSmF2YVNjcmlwdCBudW1iZXJzLCAoLTApLnRvRml4ZWQoMCkgaXMgJzAnLCBidXQgZS5nLiAoLTAuMDAwMDEpLnRvRml4ZWQoMCkgaXMgJy0wJy5cclxuICAgKlxyXG4gICAqIFtkcF0ge251bWJlcn0gRGVjaW1hbCBwbGFjZXMuIEludGVnZXIsIDAgdG8gTUFYX0RJR0lUUyBpbmNsdXNpdmUuXHJcbiAgICogW3JtXSB7bnVtYmVyfSBSb3VuZGluZyBtb2RlLiBJbnRlZ2VyLCAwIHRvIDggaW5jbHVzaXZlLlxyXG4gICAqXHJcbiAgICogKC0wKS50b0ZpeGVkKDApIGlzICcwJywgYnV0ICgtMC4xKS50b0ZpeGVkKDApIGlzICctMCcuXHJcbiAgICogKC0wKS50b0ZpeGVkKDEpIGlzICcwLjAnLCBidXQgKC0wLjAxKS50b0ZpeGVkKDEpIGlzICctMC4wJy5cclxuICAgKiAoLTApLnRvRml4ZWQoMykgaXMgJzAuMDAwJy5cclxuICAgKiAoLTAuNSkudG9GaXhlZCgwKSBpcyAnLTAnLlxyXG4gICAqXHJcbiAgICovXHJcbiAgUC50b0ZpeGVkID0gZnVuY3Rpb24gKGRwLCBybSkge1xyXG4gICAgdmFyIHN0ciwgeSxcclxuICAgICAgeCA9IHRoaXMsXHJcbiAgICAgIEN0b3IgPSB4LmNvbnN0cnVjdG9yO1xyXG5cclxuICAgIGlmIChkcCA9PT0gdm9pZCAwKSB7XHJcbiAgICAgIHN0ciA9IGZpbml0ZVRvU3RyaW5nKHgpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY2hlY2tJbnQzMihkcCwgMCwgTUFYX0RJR0lUUyk7XHJcblxyXG4gICAgICBpZiAocm0gPT09IHZvaWQgMCkgcm0gPSBDdG9yLnJvdW5kaW5nO1xyXG4gICAgICBlbHNlIGNoZWNrSW50MzIocm0sIDAsIDgpO1xyXG5cclxuICAgICAgeSA9IGZpbmFsaXNlKG5ldyBDdG9yKHgpLCBkcCArIHguZSArIDEsIHJtKTtcclxuICAgICAgc3RyID0gZmluaXRlVG9TdHJpbmcoeSwgZmFsc2UsIGRwICsgeS5lICsgMSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVG8gZGV0ZXJtaW5lIHdoZXRoZXIgdG8gYWRkIHRoZSBtaW51cyBzaWduIGxvb2sgYXQgdGhlIHZhbHVlIGJlZm9yZSBpdCB3YXMgcm91bmRlZCxcclxuICAgIC8vIGkuZS4gbG9vayBhdCBgeGAgcmF0aGVyIHRoYW4gYHlgLlxyXG4gICAgcmV0dXJuIHguaXNOZWcoKSAmJiAheC5pc1plcm8oKSA/ICctJyArIHN0ciA6IHN0cjtcclxuICB9O1xyXG5cclxuXHJcbiAgLypcclxuICAgKiBSZXR1cm4gYW4gYXJyYXkgcmVwcmVzZW50aW5nIHRoZSB2YWx1ZSBvZiB0aGlzIERlY2ltYWwgYXMgYSBzaW1wbGUgZnJhY3Rpb24gd2l0aCBhbiBpbnRlZ2VyXHJcbiAgICogbnVtZXJhdG9yIGFuZCBhbiBpbnRlZ2VyIGRlbm9taW5hdG9yLlxyXG4gICAqXHJcbiAgICogVGhlIGRlbm9taW5hdG9yIHdpbGwgYmUgYSBwb3NpdGl2ZSBub24temVybyB2YWx1ZSBsZXNzIHRoYW4gb3IgZXF1YWwgdG8gdGhlIHNwZWNpZmllZCBtYXhpbXVtXHJcbiAgICogZGVub21pbmF0b3IuIElmIGEgbWF4aW11bSBkZW5vbWluYXRvciBpcyBub3Qgc3BlY2lmaWVkLCB0aGUgZGVub21pbmF0b3Igd2lsbCBiZSB0aGUgbG93ZXN0XHJcbiAgICogdmFsdWUgbmVjZXNzYXJ5IHRvIHJlcHJlc2VudCB0aGUgbnVtYmVyIGV4YWN0bHkuXHJcbiAgICpcclxuICAgKiBbbWF4RF0ge251bWJlcnxzdHJpbmd8RGVjaW1hbH0gTWF4aW11bSBkZW5vbWluYXRvci4gSW50ZWdlciA+PSAxIGFuZCA8IEluZmluaXR5LlxyXG4gICAqXHJcbiAgICovXHJcbiAgUC50b0ZyYWN0aW9uID0gZnVuY3Rpb24gKG1heEQpIHtcclxuICAgIHZhciBkLCBkMCwgZDEsIGQyLCBlLCBrLCBuLCBuMCwgbjEsIHByLCBxLCByLFxyXG4gICAgICB4ID0gdGhpcyxcclxuICAgICAgeGQgPSB4LmQsXHJcbiAgICAgIEN0b3IgPSB4LmNvbnN0cnVjdG9yO1xyXG5cclxuICAgIGlmICgheGQpIHJldHVybiBuZXcgQ3Rvcih4KTtcclxuXHJcbiAgICBuMSA9IGQwID0gbmV3IEN0b3IoMSk7XHJcbiAgICBkMSA9IG4wID0gbmV3IEN0b3IoMCk7XHJcblxyXG4gICAgZCA9IG5ldyBDdG9yKGQxKTtcclxuICAgIGUgPSBkLmUgPSBnZXRQcmVjaXNpb24oeGQpIC0geC5lIC0gMTtcclxuICAgIGsgPSBlICUgTE9HX0JBU0U7XHJcbiAgICBkLmRbMF0gPSBtYXRocG93KDEwLCBrIDwgMCA/IExPR19CQVNFICsgayA6IGspO1xyXG5cclxuICAgIGlmIChtYXhEID09IG51bGwpIHtcclxuXHJcbiAgICAgIC8vIGQgaXMgMTAqKmUsIHRoZSBtaW5pbXVtIG1heC1kZW5vbWluYXRvciBuZWVkZWQuXHJcbiAgICAgIG1heEQgPSBlID4gMCA/IGQgOiBuMTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIG4gPSBuZXcgQ3RvcihtYXhEKTtcclxuICAgICAgaWYgKCFuLmlzSW50KCkgfHwgbi5sdChuMSkpIHRocm93IEVycm9yKGludmFsaWRBcmd1bWVudCArIG4pO1xyXG4gICAgICBtYXhEID0gbi5ndChkKSA/IChlID4gMCA/IGQgOiBuMSkgOiBuO1xyXG4gICAgfVxyXG5cclxuICAgIGV4dGVybmFsID0gZmFsc2U7XHJcbiAgICBuID0gbmV3IEN0b3IoZGlnaXRzVG9TdHJpbmcoeGQpKTtcclxuICAgIHByID0gQ3Rvci5wcmVjaXNpb247XHJcbiAgICBDdG9yLnByZWNpc2lvbiA9IGUgPSB4ZC5sZW5ndGggKiBMT0dfQkFTRSAqIDI7XHJcblxyXG4gICAgZm9yICg7OykgIHtcclxuICAgICAgcSA9IGRpdmlkZShuLCBkLCAwLCAxLCAxKTtcclxuICAgICAgZDIgPSBkMC5wbHVzKHEudGltZXMoZDEpKTtcclxuICAgICAgaWYgKGQyLmNtcChtYXhEKSA9PSAxKSBicmVhaztcclxuICAgICAgZDAgPSBkMTtcclxuICAgICAgZDEgPSBkMjtcclxuICAgICAgZDIgPSBuMTtcclxuICAgICAgbjEgPSBuMC5wbHVzKHEudGltZXMoZDIpKTtcclxuICAgICAgbjAgPSBkMjtcclxuICAgICAgZDIgPSBkO1xyXG4gICAgICBkID0gbi5taW51cyhxLnRpbWVzKGQyKSk7XHJcbiAgICAgIG4gPSBkMjtcclxuICAgIH1cclxuXHJcbiAgICBkMiA9IGRpdmlkZShtYXhELm1pbnVzKGQwKSwgZDEsIDAsIDEsIDEpO1xyXG4gICAgbjAgPSBuMC5wbHVzKGQyLnRpbWVzKG4xKSk7XHJcbiAgICBkMCA9IGQwLnBsdXMoZDIudGltZXMoZDEpKTtcclxuICAgIG4wLnMgPSBuMS5zID0geC5zO1xyXG5cclxuICAgIC8vIERldGVybWluZSB3aGljaCBmcmFjdGlvbiBpcyBjbG9zZXIgdG8geCwgbjAvZDAgb3IgbjEvZDE/XHJcbiAgICByID0gZGl2aWRlKG4xLCBkMSwgZSwgMSkubWludXMoeCkuYWJzKCkuY21wKGRpdmlkZShuMCwgZDAsIGUsIDEpLm1pbnVzKHgpLmFicygpKSA8IDFcclxuICAgICAgICA/IFtuMSwgZDFdIDogW24wLCBkMF07XHJcblxyXG4gICAgQ3Rvci5wcmVjaXNpb24gPSBwcjtcclxuICAgIGV4dGVybmFsID0gdHJ1ZTtcclxuXHJcbiAgICByZXR1cm4gcjtcclxuICB9O1xyXG5cclxuXHJcbiAgLypcclxuICAgKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB2YWx1ZSBvZiB0aGlzIERlY2ltYWwgaW4gYmFzZSAxNiwgcm91bmQgdG8gYHNkYCBzaWduaWZpY2FudFxyXG4gICAqIGRpZ2l0cyB1c2luZyByb3VuZGluZyBtb2RlIGBybWAuXHJcbiAgICpcclxuICAgKiBJZiB0aGUgb3B0aW9uYWwgYHNkYCBhcmd1bWVudCBpcyBwcmVzZW50IHRoZW4gcmV0dXJuIGJpbmFyeSBleHBvbmVudGlhbCBub3RhdGlvbi5cclxuICAgKlxyXG4gICAqIFtzZF0ge251bWJlcn0gU2lnbmlmaWNhbnQgZGlnaXRzLiBJbnRlZ2VyLCAxIHRvIE1BWF9ESUdJVFMgaW5jbHVzaXZlLlxyXG4gICAqIFtybV0ge251bWJlcn0gUm91bmRpbmcgbW9kZS4gSW50ZWdlciwgMCB0byA4IGluY2x1c2l2ZS5cclxuICAgKlxyXG4gICAqL1xyXG4gIFAudG9IZXhhZGVjaW1hbCA9IFAudG9IZXggPSBmdW5jdGlvbiAoc2QsIHJtKSB7XHJcbiAgICByZXR1cm4gdG9TdHJpbmdCaW5hcnkodGhpcywgMTYsIHNkLCBybSk7XHJcbiAgfTtcclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJucyBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSBuZWFyZXN0IG11bHRpcGxlIG9mIGB5YCBpbiB0aGUgZGlyZWN0aW9uIG9mIHJvdW5kaW5nXHJcbiAgICogbW9kZSBgcm1gLCBvciBgRGVjaW1hbC5yb3VuZGluZ2AgaWYgYHJtYCBpcyBvbWl0dGVkLCB0byB0aGUgdmFsdWUgb2YgdGhpcyBEZWNpbWFsLlxyXG4gICAqXHJcbiAgICogVGhlIHJldHVybiB2YWx1ZSB3aWxsIGFsd2F5cyBoYXZlIHRoZSBzYW1lIHNpZ24gYXMgdGhpcyBEZWNpbWFsLCB1bmxlc3MgZWl0aGVyIHRoaXMgRGVjaW1hbFxyXG4gICAqIG9yIGB5YCBpcyBOYU4sIGluIHdoaWNoIGNhc2UgdGhlIHJldHVybiB2YWx1ZSB3aWxsIGJlIGFsc28gYmUgTmFOLlxyXG4gICAqXHJcbiAgICogVGhlIHJldHVybiB2YWx1ZSBpcyBub3QgYWZmZWN0ZWQgYnkgdGhlIHZhbHVlIG9mIGBwcmVjaXNpb25gLlxyXG4gICAqXHJcbiAgICogeSB7bnVtYmVyfHN0cmluZ3xEZWNpbWFsfSBUaGUgbWFnbml0dWRlIHRvIHJvdW5kIHRvIGEgbXVsdGlwbGUgb2YuXHJcbiAgICogW3JtXSB7bnVtYmVyfSBSb3VuZGluZyBtb2RlLiBJbnRlZ2VyLCAwIHRvIDggaW5jbHVzaXZlLlxyXG4gICAqXHJcbiAgICogJ3RvTmVhcmVzdCgpIHJvdW5kaW5nIG1vZGUgbm90IGFuIGludGVnZXI6IHtybX0nXHJcbiAgICogJ3RvTmVhcmVzdCgpIHJvdW5kaW5nIG1vZGUgb3V0IG9mIHJhbmdlOiB7cm19J1xyXG4gICAqXHJcbiAgICovXHJcbiAgUC50b05lYXJlc3QgPSBmdW5jdGlvbiAoeSwgcm0pIHtcclxuICAgIHZhciB4ID0gdGhpcyxcclxuICAgICAgQ3RvciA9IHguY29uc3RydWN0b3I7XHJcblxyXG4gICAgeCA9IG5ldyBDdG9yKHgpO1xyXG5cclxuICAgIGlmICh5ID09IG51bGwpIHtcclxuXHJcbiAgICAgIC8vIElmIHggaXMgbm90IGZpbml0ZSwgcmV0dXJuIHguXHJcbiAgICAgIGlmICgheC5kKSByZXR1cm4geDtcclxuXHJcbiAgICAgIHkgPSBuZXcgQ3RvcigxKTtcclxuICAgICAgcm0gPSBDdG9yLnJvdW5kaW5nO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgeSA9IG5ldyBDdG9yKHkpO1xyXG4gICAgICBpZiAocm0gPT09IHZvaWQgMCkge1xyXG4gICAgICAgIHJtID0gQ3Rvci5yb3VuZGluZztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjaGVja0ludDMyKHJtLCAwLCA4KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gSWYgeCBpcyBub3QgZmluaXRlLCByZXR1cm4geCBpZiB5IGlzIG5vdCBOYU4sIGVsc2UgTmFOLlxyXG4gICAgICBpZiAoIXguZCkgcmV0dXJuIHkucyA/IHggOiB5O1xyXG5cclxuICAgICAgLy8gSWYgeSBpcyBub3QgZmluaXRlLCByZXR1cm4gSW5maW5pdHkgd2l0aCB0aGUgc2lnbiBvZiB4IGlmIHkgaXMgSW5maW5pdHksIGVsc2UgTmFOLlxyXG4gICAgICBpZiAoIXkuZCkge1xyXG4gICAgICAgIGlmICh5LnMpIHkucyA9IHgucztcclxuICAgICAgICByZXR1cm4geTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIElmIHkgaXMgbm90IHplcm8sIGNhbGN1bGF0ZSB0aGUgbmVhcmVzdCBtdWx0aXBsZSBvZiB5IHRvIHguXHJcbiAgICBpZiAoeS5kWzBdKSB7XHJcbiAgICAgIGV4dGVybmFsID0gZmFsc2U7XHJcbiAgICAgIHggPSBkaXZpZGUoeCwgeSwgMCwgcm0sIDEpLnRpbWVzKHkpO1xyXG4gICAgICBleHRlcm5hbCA9IHRydWU7XHJcbiAgICAgIGZpbmFsaXNlKHgpO1xyXG5cclxuICAgIC8vIElmIHkgaXMgemVybywgcmV0dXJuIHplcm8gd2l0aCB0aGUgc2lnbiBvZiB4LlxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgeS5zID0geC5zO1xyXG4gICAgICB4ID0geTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4geDtcclxuICB9O1xyXG5cclxuXHJcbiAgLypcclxuICAgKiBSZXR1cm4gdGhlIHZhbHVlIG9mIHRoaXMgRGVjaW1hbCBjb252ZXJ0ZWQgdG8gYSBudW1iZXIgcHJpbWl0aXZlLlxyXG4gICAqIFplcm8ga2VlcHMgaXRzIHNpZ24uXHJcbiAgICpcclxuICAgKi9cclxuICBQLnRvTnVtYmVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuICt0aGlzO1xyXG4gIH07XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHZhbHVlIG9mIHRoaXMgRGVjaW1hbCBpbiBiYXNlIDgsIHJvdW5kIHRvIGBzZGAgc2lnbmlmaWNhbnRcclxuICAgKiBkaWdpdHMgdXNpbmcgcm91bmRpbmcgbW9kZSBgcm1gLlxyXG4gICAqXHJcbiAgICogSWYgdGhlIG9wdGlvbmFsIGBzZGAgYXJndW1lbnQgaXMgcHJlc2VudCB0aGVuIHJldHVybiBiaW5hcnkgZXhwb25lbnRpYWwgbm90YXRpb24uXHJcbiAgICpcclxuICAgKiBbc2RdIHtudW1iZXJ9IFNpZ25pZmljYW50IGRpZ2l0cy4gSW50ZWdlciwgMSB0byBNQVhfRElHSVRTIGluY2x1c2l2ZS5cclxuICAgKiBbcm1dIHtudW1iZXJ9IFJvdW5kaW5nIG1vZGUuIEludGVnZXIsIDAgdG8gOCBpbmNsdXNpdmUuXHJcbiAgICpcclxuICAgKi9cclxuICBQLnRvT2N0YWwgPSBmdW5jdGlvbiAoc2QsIHJtKSB7XHJcbiAgICByZXR1cm4gdG9TdHJpbmdCaW5hcnkodGhpcywgOCwgc2QsIHJtKTtcclxuICB9O1xyXG5cclxuXHJcbiAgLypcclxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBEZWNpbWFsIHJhaXNlZCB0byB0aGUgcG93ZXIgYHlgLCByb3VuZGVkXHJcbiAgICogdG8gYHByZWNpc2lvbmAgc2lnbmlmaWNhbnQgZGlnaXRzIHVzaW5nIHJvdW5kaW5nIG1vZGUgYHJvdW5kaW5nYC5cclxuICAgKlxyXG4gICAqIEVDTUFTY3JpcHQgY29tcGxpYW50LlxyXG4gICAqXHJcbiAgICogICBwb3coeCwgTmFOKSAgICAgICAgICAgICAgICAgICAgICAgICAgID0gTmFOXHJcbiAgICogICBwb3coeCwgwrEwKSAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IDFcclxuXHJcbiAgICogICBwb3coTmFOLCBub24temVybykgICAgICAgICAgICAgICAgICAgID0gTmFOXHJcbiAgICogICBwb3coYWJzKHgpID4gMSwgK0luZmluaXR5KSAgICAgICAgICAgID0gK0luZmluaXR5XHJcbiAgICogICBwb3coYWJzKHgpID4gMSwgLUluZmluaXR5KSAgICAgICAgICAgID0gKzBcclxuICAgKiAgIHBvdyhhYnMoeCkgPT0gMSwgwrFJbmZpbml0eSkgICAgICAgICAgID0gTmFOXHJcbiAgICogICBwb3coYWJzKHgpIDwgMSwgK0luZmluaXR5KSAgICAgICAgICAgID0gKzBcclxuICAgKiAgIHBvdyhhYnMoeCkgPCAxLCAtSW5maW5pdHkpICAgICAgICAgICAgPSArSW5maW5pdHlcclxuICAgKiAgIHBvdygrSW5maW5pdHksIHkgPiAwKSAgICAgICAgICAgICAgICAgPSArSW5maW5pdHlcclxuICAgKiAgIHBvdygrSW5maW5pdHksIHkgPCAwKSAgICAgICAgICAgICAgICAgPSArMFxyXG4gICAqICAgcG93KC1JbmZpbml0eSwgb2RkIGludGVnZXIgPiAwKSAgICAgICA9IC1JbmZpbml0eVxyXG4gICAqICAgcG93KC1JbmZpbml0eSwgZXZlbiBpbnRlZ2VyID4gMCkgICAgICA9ICtJbmZpbml0eVxyXG4gICAqICAgcG93KC1JbmZpbml0eSwgb2RkIGludGVnZXIgPCAwKSAgICAgICA9IC0wXHJcbiAgICogICBwb3coLUluZmluaXR5LCBldmVuIGludGVnZXIgPCAwKSAgICAgID0gKzBcclxuICAgKiAgIHBvdygrMCwgeSA+IDApICAgICAgICAgICAgICAgICAgICAgICAgPSArMFxyXG4gICAqICAgcG93KCswLCB5IDwgMCkgICAgICAgICAgICAgICAgICAgICAgICA9ICtJbmZpbml0eVxyXG4gICAqICAgcG93KC0wLCBvZGQgaW50ZWdlciA+IDApICAgICAgICAgICAgICA9IC0wXHJcbiAgICogICBwb3coLTAsIGV2ZW4gaW50ZWdlciA+IDApICAgICAgICAgICAgID0gKzBcclxuICAgKiAgIHBvdygtMCwgb2RkIGludGVnZXIgPCAwKSAgICAgICAgICAgICAgPSAtSW5maW5pdHlcclxuICAgKiAgIHBvdygtMCwgZXZlbiBpbnRlZ2VyIDwgMCkgICAgICAgICAgICAgPSArSW5maW5pdHlcclxuICAgKiAgIHBvdyhmaW5pdGUgeCA8IDAsIGZpbml0ZSBub24taW50ZWdlcikgPSBOYU5cclxuICAgKlxyXG4gICAqIEZvciBub24taW50ZWdlciBvciB2ZXJ5IGxhcmdlIGV4cG9uZW50cyBwb3coeCwgeSkgaXMgY2FsY3VsYXRlZCB1c2luZ1xyXG4gICAqXHJcbiAgICogICB4XnkgPSBleHAoeSpsbih4KSlcclxuICAgKlxyXG4gICAqIEFzc3VtaW5nIHRoZSBmaXJzdCAxNSByb3VuZGluZyBkaWdpdHMgYXJlIGVhY2ggZXF1YWxseSBsaWtlbHkgdG8gYmUgYW55IGRpZ2l0IDAtOSwgdGhlXHJcbiAgICogcHJvYmFiaWxpdHkgb2YgYW4gaW5jb3JyZWN0bHkgcm91bmRlZCByZXN1bHRcclxuICAgKiBQKFs0OV05ezE0fSB8IFs1MF0wezE0fSkgPSAyICogMC4yICogMTBeLTE0ID0gNGUtMTUgPSAxLzIuNWUrMTRcclxuICAgKiBpLmUuIDEgaW4gMjUwLDAwMCwwMDAsMDAwLDAwMFxyXG4gICAqXHJcbiAgICogSWYgYSByZXN1bHQgaXMgaW5jb3JyZWN0bHkgcm91bmRlZCB0aGUgbWF4aW11bSBlcnJvciB3aWxsIGJlIDEgdWxwICh1bml0IGluIGxhc3QgcGxhY2UpLlxyXG4gICAqXHJcbiAgICogeSB7bnVtYmVyfHN0cmluZ3xEZWNpbWFsfSBUaGUgcG93ZXIgdG8gd2hpY2ggdG8gcmFpc2UgdGhpcyBEZWNpbWFsLlxyXG4gICAqXHJcbiAgICovXHJcbiAgUC50b1Bvd2VyID0gUC5wb3cgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgdmFyIGUsIGssIHByLCByLCBybSwgcyxcclxuICAgICAgeCA9IHRoaXMsXHJcbiAgICAgIEN0b3IgPSB4LmNvbnN0cnVjdG9yLFxyXG4gICAgICB5biA9ICsoeSA9IG5ldyBDdG9yKHkpKTtcclxuXHJcbiAgICAvLyBFaXRoZXIgwrFJbmZpbml0eSwgTmFOIG9yIMKxMD9cclxuICAgIGlmICgheC5kIHx8ICF5LmQgfHwgIXguZFswXSB8fCAheS5kWzBdKSByZXR1cm4gbmV3IEN0b3IobWF0aHBvdygreCwgeW4pKTtcclxuXHJcbiAgICB4ID0gbmV3IEN0b3IoeCk7XHJcblxyXG4gICAgaWYgKHguZXEoMSkpIHJldHVybiB4O1xyXG5cclxuICAgIHByID0gQ3Rvci5wcmVjaXNpb247XHJcbiAgICBybSA9IEN0b3Iucm91bmRpbmc7XHJcblxyXG4gICAgaWYgKHkuZXEoMSkpIHJldHVybiBmaW5hbGlzZSh4LCBwciwgcm0pO1xyXG5cclxuICAgIC8vIHkgZXhwb25lbnRcclxuICAgIGUgPSBtYXRoZmxvb3IoeS5lIC8gTE9HX0JBU0UpO1xyXG5cclxuICAgIC8vIElmIHkgaXMgYSBzbWFsbCBpbnRlZ2VyIHVzZSB0aGUgJ2V4cG9uZW50aWF0aW9uIGJ5IHNxdWFyaW5nJyBhbGdvcml0aG0uXHJcbiAgICBpZiAoZSA+PSB5LmQubGVuZ3RoIC0gMSAmJiAoayA9IHluIDwgMCA/IC15biA6IHluKSA8PSBNQVhfU0FGRV9JTlRFR0VSKSB7XHJcbiAgICAgIHIgPSBpbnRQb3coQ3RvciwgeCwgaywgcHIpO1xyXG4gICAgICByZXR1cm4geS5zIDwgMCA/IG5ldyBDdG9yKDEpLmRpdihyKSA6IGZpbmFsaXNlKHIsIHByLCBybSk7XHJcbiAgICB9XHJcblxyXG4gICAgcyA9IHgucztcclxuXHJcbiAgICAvLyBpZiB4IGlzIG5lZ2F0aXZlXHJcbiAgICBpZiAocyA8IDApIHtcclxuXHJcbiAgICAgIC8vIGlmIHkgaXMgbm90IGFuIGludGVnZXJcclxuICAgICAgaWYgKGUgPCB5LmQubGVuZ3RoIC0gMSkgcmV0dXJuIG5ldyBDdG9yKE5hTik7XHJcblxyXG4gICAgICAvLyBSZXN1bHQgaXMgcG9zaXRpdmUgaWYgeCBpcyBuZWdhdGl2ZSBhbmQgdGhlIGxhc3QgZGlnaXQgb2YgaW50ZWdlciB5IGlzIGV2ZW4uXHJcbiAgICAgIGlmICgoeS5kW2VdICYgMSkgPT0gMCkgcyA9IDE7XHJcblxyXG4gICAgICAvLyBpZiB4LmVxKC0xKVxyXG4gICAgICBpZiAoeC5lID09IDAgJiYgeC5kWzBdID09IDEgJiYgeC5kLmxlbmd0aCA9PSAxKSB7XHJcbiAgICAgICAgeC5zID0gcztcclxuICAgICAgICByZXR1cm4geDtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIEVzdGltYXRlIHJlc3VsdCBleHBvbmVudC5cclxuICAgIC8vIHheeSA9IDEwXmUsICB3aGVyZSBlID0geSAqIGxvZzEwKHgpXHJcbiAgICAvLyBsb2cxMCh4KSA9IGxvZzEwKHhfc2lnbmlmaWNhbmQpICsgeF9leHBvbmVudFxyXG4gICAgLy8gbG9nMTAoeF9zaWduaWZpY2FuZCkgPSBsbih4X3NpZ25pZmljYW5kKSAvIGxuKDEwKVxyXG4gICAgayA9IG1hdGhwb3coK3gsIHluKTtcclxuICAgIGUgPSBrID09IDAgfHwgIWlzRmluaXRlKGspXHJcbiAgICAgID8gbWF0aGZsb29yKHluICogKE1hdGgubG9nKCcwLicgKyBkaWdpdHNUb1N0cmluZyh4LmQpKSAvIE1hdGguTE4xMCArIHguZSArIDEpKVxyXG4gICAgICA6IG5ldyBDdG9yKGsgKyAnJykuZTtcclxuXHJcbiAgICAvLyBFeHBvbmVudCBlc3RpbWF0ZSBtYXkgYmUgaW5jb3JyZWN0IGUuZy4geDogMC45OTk5OTk5OTk5OTk5OTk5OTksIHk6IDIuMjksIGU6IDAsIHIuZTogLTEuXHJcblxyXG4gICAgLy8gT3ZlcmZsb3cvdW5kZXJmbG93P1xyXG4gICAgaWYgKGUgPiBDdG9yLm1heEUgKyAxIHx8IGUgPCBDdG9yLm1pbkUgLSAxKSByZXR1cm4gbmV3IEN0b3IoZSA+IDAgPyBzIC8gMCA6IDApO1xyXG5cclxuICAgIGV4dGVybmFsID0gZmFsc2U7XHJcbiAgICBDdG9yLnJvdW5kaW5nID0geC5zID0gMTtcclxuXHJcbiAgICAvLyBFc3RpbWF0ZSB0aGUgZXh0cmEgZ3VhcmQgZGlnaXRzIG5lZWRlZCB0byBlbnN1cmUgZml2ZSBjb3JyZWN0IHJvdW5kaW5nIGRpZ2l0cyBmcm9tXHJcbiAgICAvLyBuYXR1cmFsTG9nYXJpdGhtKHgpLiBFeGFtcGxlIG9mIGZhaWx1cmUgd2l0aG91dCB0aGVzZSBleHRyYSBkaWdpdHMgKHByZWNpc2lvbjogMTApOlxyXG4gICAgLy8gbmV3IERlY2ltYWwoMi4zMjQ1NikucG93KCcyMDg3OTg3NDM2NTM0NTY2LjQ2NDExJylcclxuICAgIC8vIHNob3VsZCBiZSAxLjE2MjM3NzgyM2UrNzY0OTE0OTA1MTczODE1LCBidXQgaXMgMS4xNjIzNTU4MjNlKzc2NDkxNDkwNTE3MzgxNVxyXG4gICAgayA9IE1hdGgubWluKDEyLCAoZSArICcnKS5sZW5ndGgpO1xyXG5cclxuICAgIC8vIHIgPSB4XnkgPSBleHAoeSpsbih4KSlcclxuICAgIHIgPSBuYXR1cmFsRXhwb25lbnRpYWwoeS50aW1lcyhuYXR1cmFsTG9nYXJpdGhtKHgsIHByICsgaykpLCBwcik7XHJcblxyXG4gICAgLy8gciBtYXkgYmUgSW5maW5pdHksIGUuZy4gKDAuOTk5OTk5OTk5OTk5OTk5OSkucG93KC0xZSs0MClcclxuICAgIGlmIChyLmQpIHtcclxuXHJcbiAgICAgIC8vIFRydW5jYXRlIHRvIHRoZSByZXF1aXJlZCBwcmVjaXNpb24gcGx1cyBmaXZlIHJvdW5kaW5nIGRpZ2l0cy5cclxuICAgICAgciA9IGZpbmFsaXNlKHIsIHByICsgNSwgMSk7XHJcblxyXG4gICAgICAvLyBJZiB0aGUgcm91bmRpbmcgZGlnaXRzIGFyZSBbNDldOTk5OSBvciBbNTBdMDAwMCBpbmNyZWFzZSB0aGUgcHJlY2lzaW9uIGJ5IDEwIGFuZCByZWNhbGN1bGF0ZVxyXG4gICAgICAvLyB0aGUgcmVzdWx0LlxyXG4gICAgICBpZiAoY2hlY2tSb3VuZGluZ0RpZ2l0cyhyLmQsIHByLCBybSkpIHtcclxuICAgICAgICBlID0gcHIgKyAxMDtcclxuXHJcbiAgICAgICAgLy8gVHJ1bmNhdGUgdG8gdGhlIGluY3JlYXNlZCBwcmVjaXNpb24gcGx1cyBmaXZlIHJvdW5kaW5nIGRpZ2l0cy5cclxuICAgICAgICByID0gZmluYWxpc2UobmF0dXJhbEV4cG9uZW50aWFsKHkudGltZXMobmF0dXJhbExvZ2FyaXRobSh4LCBlICsgaykpLCBlKSwgZSArIDUsIDEpO1xyXG5cclxuICAgICAgICAvLyBDaGVjayBmb3IgMTQgbmluZXMgZnJvbSB0aGUgMm5kIHJvdW5kaW5nIGRpZ2l0ICh0aGUgZmlyc3Qgcm91bmRpbmcgZGlnaXQgbWF5IGJlIDQgb3IgOSkuXHJcbiAgICAgICAgaWYgKCtkaWdpdHNUb1N0cmluZyhyLmQpLnNsaWNlKHByICsgMSwgcHIgKyAxNSkgKyAxID09IDFlMTQpIHtcclxuICAgICAgICAgIHIgPSBmaW5hbGlzZShyLCBwciArIDEsIDApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHIucyA9IHM7XHJcbiAgICBleHRlcm5hbCA9IHRydWU7XHJcbiAgICBDdG9yLnJvdW5kaW5nID0gcm07XHJcblxyXG4gICAgcmV0dXJuIGZpbmFsaXNlKHIsIHByLCBybSk7XHJcbiAgfTtcclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdmFsdWUgb2YgdGhpcyBEZWNpbWFsIHJvdW5kZWQgdG8gYHNkYCBzaWduaWZpY2FudCBkaWdpdHNcclxuICAgKiB1c2luZyByb3VuZGluZyBtb2RlIGByb3VuZGluZ2AuXHJcbiAgICpcclxuICAgKiBSZXR1cm4gZXhwb25lbnRpYWwgbm90YXRpb24gaWYgYHNkYCBpcyBsZXNzIHRoYW4gdGhlIG51bWJlciBvZiBkaWdpdHMgbmVjZXNzYXJ5IHRvIHJlcHJlc2VudFxyXG4gICAqIHRoZSBpbnRlZ2VyIHBhcnQgb2YgdGhlIHZhbHVlIGluIG5vcm1hbCBub3RhdGlvbi5cclxuICAgKlxyXG4gICAqIFtzZF0ge251bWJlcn0gU2lnbmlmaWNhbnQgZGlnaXRzLiBJbnRlZ2VyLCAxIHRvIE1BWF9ESUdJVFMgaW5jbHVzaXZlLlxyXG4gICAqIFtybV0ge251bWJlcn0gUm91bmRpbmcgbW9kZS4gSW50ZWdlciwgMCB0byA4IGluY2x1c2l2ZS5cclxuICAgKlxyXG4gICAqL1xyXG4gIFAudG9QcmVjaXNpb24gPSBmdW5jdGlvbiAoc2QsIHJtKSB7XHJcbiAgICB2YXIgc3RyLFxyXG4gICAgICB4ID0gdGhpcyxcclxuICAgICAgQ3RvciA9IHguY29uc3RydWN0b3I7XHJcblxyXG4gICAgaWYgKHNkID09PSB2b2lkIDApIHtcclxuICAgICAgc3RyID0gZmluaXRlVG9TdHJpbmcoeCwgeC5lIDw9IEN0b3IudG9FeHBOZWcgfHwgeC5lID49IEN0b3IudG9FeHBQb3MpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY2hlY2tJbnQzMihzZCwgMSwgTUFYX0RJR0lUUyk7XHJcblxyXG4gICAgICBpZiAocm0gPT09IHZvaWQgMCkgcm0gPSBDdG9yLnJvdW5kaW5nO1xyXG4gICAgICBlbHNlIGNoZWNrSW50MzIocm0sIDAsIDgpO1xyXG5cclxuICAgICAgeCA9IGZpbmFsaXNlKG5ldyBDdG9yKHgpLCBzZCwgcm0pO1xyXG4gICAgICBzdHIgPSBmaW5pdGVUb1N0cmluZyh4LCBzZCA8PSB4LmUgfHwgeC5lIDw9IEN0b3IudG9FeHBOZWcsIHNkKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4geC5pc05lZygpICYmICF4LmlzWmVybygpID8gJy0nICsgc3RyIDogc3RyO1xyXG4gIH07XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIERlY2ltYWwgcm91bmRlZCB0byBhIG1heGltdW0gb2YgYHNkYFxyXG4gICAqIHNpZ25pZmljYW50IGRpZ2l0cyB1c2luZyByb3VuZGluZyBtb2RlIGBybWAsIG9yIHRvIGBwcmVjaXNpb25gIGFuZCBgcm91bmRpbmdgIHJlc3BlY3RpdmVseSBpZlxyXG4gICAqIG9taXR0ZWQuXHJcbiAgICpcclxuICAgKiBbc2RdIHtudW1iZXJ9IFNpZ25pZmljYW50IGRpZ2l0cy4gSW50ZWdlciwgMSB0byBNQVhfRElHSVRTIGluY2x1c2l2ZS5cclxuICAgKiBbcm1dIHtudW1iZXJ9IFJvdW5kaW5nIG1vZGUuIEludGVnZXIsIDAgdG8gOCBpbmNsdXNpdmUuXHJcbiAgICpcclxuICAgKiAndG9TRCgpIGRpZ2l0cyBvdXQgb2YgcmFuZ2U6IHtzZH0nXHJcbiAgICogJ3RvU0QoKSBkaWdpdHMgbm90IGFuIGludGVnZXI6IHtzZH0nXHJcbiAgICogJ3RvU0QoKSByb3VuZGluZyBtb2RlIG5vdCBhbiBpbnRlZ2VyOiB7cm19J1xyXG4gICAqICd0b1NEKCkgcm91bmRpbmcgbW9kZSBvdXQgb2YgcmFuZ2U6IHtybX0nXHJcbiAgICpcclxuICAgKi9cclxuICBQLnRvU2lnbmlmaWNhbnREaWdpdHMgPSBQLnRvU0QgPSBmdW5jdGlvbiAoc2QsIHJtKSB7XHJcbiAgICB2YXIgeCA9IHRoaXMsXHJcbiAgICAgIEN0b3IgPSB4LmNvbnN0cnVjdG9yO1xyXG5cclxuICAgIGlmIChzZCA9PT0gdm9pZCAwKSB7XHJcbiAgICAgIHNkID0gQ3Rvci5wcmVjaXNpb247XHJcbiAgICAgIHJtID0gQ3Rvci5yb3VuZGluZztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNoZWNrSW50MzIoc2QsIDEsIE1BWF9ESUdJVFMpO1xyXG5cclxuICAgICAgaWYgKHJtID09PSB2b2lkIDApIHJtID0gQ3Rvci5yb3VuZGluZztcclxuICAgICAgZWxzZSBjaGVja0ludDMyKHJtLCAwLCA4KTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZmluYWxpc2UobmV3IEN0b3IoeCksIHNkLCBybSk7XHJcbiAgfTtcclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdmFsdWUgb2YgdGhpcyBEZWNpbWFsLlxyXG4gICAqXHJcbiAgICogUmV0dXJuIGV4cG9uZW50aWFsIG5vdGF0aW9uIGlmIHRoaXMgRGVjaW1hbCBoYXMgYSBwb3NpdGl2ZSBleHBvbmVudCBlcXVhbCB0byBvciBncmVhdGVyIHRoYW5cclxuICAgKiBgdG9FeHBQb3NgLCBvciBhIG5lZ2F0aXZlIGV4cG9uZW50IGVxdWFsIHRvIG9yIGxlc3MgdGhhbiBgdG9FeHBOZWdgLlxyXG4gICAqXHJcbiAgICovXHJcbiAgUC50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciB4ID0gdGhpcyxcclxuICAgICAgQ3RvciA9IHguY29uc3RydWN0b3IsXHJcbiAgICAgIHN0ciA9IGZpbml0ZVRvU3RyaW5nKHgsIHguZSA8PSBDdG9yLnRvRXhwTmVnIHx8IHguZSA+PSBDdG9yLnRvRXhwUG9zKTtcclxuXHJcbiAgICByZXR1cm4geC5pc05lZygpICYmICF4LmlzWmVybygpID8gJy0nICsgc3RyIDogc3RyO1xyXG4gIH07XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIERlY2ltYWwgdHJ1bmNhdGVkIHRvIGEgd2hvbGUgbnVtYmVyLlxyXG4gICAqXHJcbiAgICovXHJcbiAgUC50cnVuY2F0ZWQgPSBQLnRydW5jID0gZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIGZpbmFsaXNlKG5ldyB0aGlzLmNvbnN0cnVjdG9yKHRoaXMpLCB0aGlzLmUgKyAxLCAxKTtcclxuICB9O1xyXG5cclxuXHJcbiAgLypcclxuICAgKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB2YWx1ZSBvZiB0aGlzIERlY2ltYWwuXHJcbiAgICogVW5saWtlIGB0b1N0cmluZ2AsIG5lZ2F0aXZlIHplcm8gd2lsbCBpbmNsdWRlIHRoZSBtaW51cyBzaWduLlxyXG4gICAqXHJcbiAgICovXHJcbiAgUC52YWx1ZU9mID0gUC50b0pTT04gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgeCA9IHRoaXMsXHJcbiAgICAgIEN0b3IgPSB4LmNvbnN0cnVjdG9yLFxyXG4gICAgICBzdHIgPSBmaW5pdGVUb1N0cmluZyh4LCB4LmUgPD0gQ3Rvci50b0V4cE5lZyB8fCB4LmUgPj0gQ3Rvci50b0V4cFBvcyk7XHJcblxyXG4gICAgcmV0dXJuIHguaXNOZWcoKSA/ICctJyArIHN0ciA6IHN0cjtcclxuICB9O1xyXG5cclxuXHJcbiAgLypcclxuICAvLyBBZGQgYWxpYXNlcyB0byBtYXRjaCBCaWdEZWNpbWFsIG1ldGhvZCBuYW1lcy5cclxuICAvLyBQLmFkZCA9IFAucGx1cztcclxuICBQLnN1YnRyYWN0ID0gUC5taW51cztcclxuICBQLm11bHRpcGx5ID0gUC50aW1lcztcclxuICBQLmRpdmlkZSA9IFAuZGl2O1xyXG4gIFAucmVtYWluZGVyID0gUC5tb2Q7XHJcbiAgUC5jb21wYXJlVG8gPSBQLmNtcDtcclxuICBQLm5lZ2F0ZSA9IFAubmVnO1xyXG4gICAqL1xyXG5cclxuXHJcbiAgLy8gSGVscGVyIGZ1bmN0aW9ucyBmb3IgRGVjaW1hbC5wcm90b3R5cGUgKFApIGFuZC9vciBEZWNpbWFsIG1ldGhvZHMsIGFuZCB0aGVpciBjYWxsZXJzLlxyXG5cclxuXHJcbiAgLypcclxuICAgKiAgZGlnaXRzVG9TdHJpbmcgICAgICAgICAgIFAuY3ViZVJvb3QsIFAubG9nYXJpdGhtLCBQLnNxdWFyZVJvb3QsIFAudG9GcmFjdGlvbiwgUC50b1Bvd2VyLFxyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgZmluaXRlVG9TdHJpbmcsIG5hdHVyYWxFeHBvbmVudGlhbCwgbmF0dXJhbExvZ2FyaXRobVxyXG4gICAqICBjaGVja0ludDMyICAgICAgICAgICAgICAgUC50b0RlY2ltYWxQbGFjZXMsIFAudG9FeHBvbmVudGlhbCwgUC50b0ZpeGVkLCBQLnRvTmVhcmVzdCxcclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgIFAudG9QcmVjaXNpb24sIFAudG9TaWduaWZpY2FudERpZ2l0cywgdG9TdHJpbmdCaW5hcnksIHJhbmRvbVxyXG4gICAqICBjaGVja1JvdW5kaW5nRGlnaXRzICAgICAgUC5sb2dhcml0aG0sIFAudG9Qb3dlciwgbmF0dXJhbEV4cG9uZW50aWFsLCBuYXR1cmFsTG9nYXJpdGhtXHJcbiAgICogIGNvbnZlcnRCYXNlICAgICAgICAgICAgICB0b1N0cmluZ0JpbmFyeSwgcGFyc2VPdGhlclxyXG4gICAqICBjb3MgICAgICAgICAgICAgICAgICAgICAgUC5jb3NcclxuICAgKiAgZGl2aWRlICAgICAgICAgICAgICAgICAgIFAuYXRhbmgsIFAuY3ViZVJvb3QsIFAuZGl2aWRlZEJ5LCBQLmRpdmlkZWRUb0ludGVnZXJCeSxcclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgIFAubG9nYXJpdGhtLCBQLm1vZHVsbywgUC5zcXVhcmVSb290LCBQLnRhbiwgUC50YW5oLCBQLnRvRnJhY3Rpb24sXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICBQLnRvTmVhcmVzdCwgdG9TdHJpbmdCaW5hcnksIG5hdHVyYWxFeHBvbmVudGlhbCwgbmF0dXJhbExvZ2FyaXRobSxcclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRheWxvclNlcmllcywgYXRhbjIsIHBhcnNlT3RoZXJcclxuICAgKiAgZmluYWxpc2UgICAgICAgICAgICAgICAgIFAuYWJzb2x1dGVWYWx1ZSwgUC5hdGFuLCBQLmF0YW5oLCBQLmNlaWwsIFAuY29zLCBQLmNvc2gsXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICBQLmN1YmVSb290LCBQLmRpdmlkZWRUb0ludGVnZXJCeSwgUC5mbG9vciwgUC5sb2dhcml0aG0sIFAubWludXMsXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICBQLm1vZHVsbywgUC5uZWdhdGVkLCBQLnBsdXMsIFAucm91bmQsIFAuc2luLCBQLnNpbmgsIFAuc3F1YXJlUm9vdCxcclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgIFAudGFuLCBQLnRpbWVzLCBQLnRvRGVjaW1hbFBsYWNlcywgUC50b0V4cG9uZW50aWFsLCBQLnRvRml4ZWQsXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICBQLnRvTmVhcmVzdCwgUC50b1Bvd2VyLCBQLnRvUHJlY2lzaW9uLCBQLnRvU2lnbmlmaWNhbnREaWdpdHMsXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICBQLnRydW5jYXRlZCwgZGl2aWRlLCBnZXRMbjEwLCBnZXRQaSwgbmF0dXJhbEV4cG9uZW50aWFsLFxyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgbmF0dXJhbExvZ2FyaXRobSwgY2VpbCwgZmxvb3IsIHJvdW5kLCB0cnVuY1xyXG4gICAqICBmaW5pdGVUb1N0cmluZyAgICAgICAgICAgUC50b0V4cG9uZW50aWFsLCBQLnRvRml4ZWQsIFAudG9QcmVjaXNpb24sIFAudG9TdHJpbmcsIFAudmFsdWVPZixcclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvU3RyaW5nQmluYXJ5XHJcbiAgICogIGdldEJhc2UxMEV4cG9uZW50ICAgICAgICBQLm1pbnVzLCBQLnBsdXMsIFAudGltZXMsIHBhcnNlT3RoZXJcclxuICAgKiAgZ2V0TG4xMCAgICAgICAgICAgICAgICAgIFAubG9nYXJpdGhtLCBuYXR1cmFsTG9nYXJpdGhtXHJcbiAgICogIGdldFBpICAgICAgICAgICAgICAgICAgICBQLmFjb3MsIFAuYXNpbiwgUC5hdGFuLCB0b0xlc3NUaGFuSGFsZlBpLCBhdGFuMlxyXG4gICAqICBnZXRQcmVjaXNpb24gICAgICAgICAgICAgUC5wcmVjaXNpb24sIFAudG9GcmFjdGlvblxyXG4gICAqICBnZXRaZXJvU3RyaW5nICAgICAgICAgICAgZGlnaXRzVG9TdHJpbmcsIGZpbml0ZVRvU3RyaW5nXHJcbiAgICogIGludFBvdyAgICAgICAgICAgICAgICAgICBQLnRvUG93ZXIsIHBhcnNlT3RoZXJcclxuICAgKiAgaXNPZGQgICAgICAgICAgICAgICAgICAgIHRvTGVzc1RoYW5IYWxmUGlcclxuICAgKiAgbWF4T3JNaW4gICAgICAgICAgICAgICAgIG1heCwgbWluXHJcbiAgICogIG5hdHVyYWxFeHBvbmVudGlhbCAgICAgICBQLm5hdHVyYWxFeHBvbmVudGlhbCwgUC50b1Bvd2VyXHJcbiAgICogIG5hdHVyYWxMb2dhcml0aG0gICAgICAgICBQLmFjb3NoLCBQLmFzaW5oLCBQLmF0YW5oLCBQLmxvZ2FyaXRobSwgUC5uYXR1cmFsTG9nYXJpdGhtLFxyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgUC50b1Bvd2VyLCBuYXR1cmFsRXhwb25lbnRpYWxcclxuICAgKiAgbm9uRmluaXRlVG9TdHJpbmcgICAgICAgIGZpbml0ZVRvU3RyaW5nLCB0b1N0cmluZ0JpbmFyeVxyXG4gICAqICBwYXJzZURlY2ltYWwgICAgICAgICAgICAgRGVjaW1hbFxyXG4gICAqICBwYXJzZU90aGVyICAgICAgICAgICAgICAgRGVjaW1hbFxyXG4gICAqICBzaW4gICAgICAgICAgICAgICAgICAgICAgUC5zaW5cclxuICAgKiAgdGF5bG9yU2VyaWVzICAgICAgICAgICAgIFAuY29zaCwgUC5zaW5oLCBjb3MsIHNpblxyXG4gICAqICB0b0xlc3NUaGFuSGFsZlBpICAgICAgICAgUC5jb3MsIFAuc2luXHJcbiAgICogIHRvU3RyaW5nQmluYXJ5ICAgICAgICAgICBQLnRvQmluYXJ5LCBQLnRvSGV4YWRlY2ltYWwsIFAudG9PY3RhbFxyXG4gICAqICB0cnVuY2F0ZSAgICAgICAgICAgICAgICAgaW50UG93XHJcbiAgICpcclxuICAgKiAgVGhyb3dzOiAgICAgICAgICAgICAgICAgIFAubG9nYXJpdGhtLCBQLnByZWNpc2lvbiwgUC50b0ZyYWN0aW9uLCBjaGVja0ludDMyLCBnZXRMbjEwLCBnZXRQaSxcclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hdHVyYWxMb2dhcml0aG0sIGNvbmZpZywgcGFyc2VPdGhlciwgcmFuZG9tLCBEZWNpbWFsXHJcbiAgICovXHJcblxyXG5cclxuICBmdW5jdGlvbiBkaWdpdHNUb1N0cmluZyhkKSB7XHJcbiAgICB2YXIgaSwgaywgd3MsXHJcbiAgICAgIGluZGV4T2ZMYXN0V29yZCA9IGQubGVuZ3RoIC0gMSxcclxuICAgICAgc3RyID0gJycsXHJcbiAgICAgIHcgPSBkWzBdO1xyXG5cclxuICAgIGlmIChpbmRleE9mTGFzdFdvcmQgPiAwKSB7XHJcbiAgICAgIHN0ciArPSB3O1xyXG4gICAgICBmb3IgKGkgPSAxOyBpIDwgaW5kZXhPZkxhc3RXb3JkOyBpKyspIHtcclxuICAgICAgICB3cyA9IGRbaV0gKyAnJztcclxuICAgICAgICBrID0gTE9HX0JBU0UgLSB3cy5sZW5ndGg7XHJcbiAgICAgICAgaWYgKGspIHN0ciArPSBnZXRaZXJvU3RyaW5nKGspO1xyXG4gICAgICAgIHN0ciArPSB3cztcclxuICAgICAgfVxyXG5cclxuICAgICAgdyA9IGRbaV07XHJcbiAgICAgIHdzID0gdyArICcnO1xyXG4gICAgICBrID0gTE9HX0JBU0UgLSB3cy5sZW5ndGg7XHJcbiAgICAgIGlmIChrKSBzdHIgKz0gZ2V0WmVyb1N0cmluZyhrKTtcclxuICAgIH0gZWxzZSBpZiAodyA9PT0gMCkge1xyXG4gICAgICByZXR1cm4gJzAnO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFJlbW92ZSB0cmFpbGluZyB6ZXJvcyBvZiBsYXN0IHcuXHJcbiAgICBmb3IgKDsgdyAlIDEwID09PSAwOykgdyAvPSAxMDtcclxuXHJcbiAgICByZXR1cm4gc3RyICsgdztcclxuICB9XHJcblxyXG5cclxuICBmdW5jdGlvbiBjaGVja0ludDMyKGksIG1pbiwgbWF4KSB7XHJcbiAgICBpZiAoaSAhPT0gfn5pIHx8IGkgPCBtaW4gfHwgaSA+IG1heCkge1xyXG4gICAgICB0aHJvdyBFcnJvcihpbnZhbGlkQXJndW1lbnQgKyBpKTtcclxuICAgIH1cclxuICB9XHJcblxyXG5cclxuICAvKlxyXG4gICAqIENoZWNrIDUgcm91bmRpbmcgZGlnaXRzIGlmIGByZXBlYXRpbmdgIGlzIG51bGwsIDQgb3RoZXJ3aXNlLlxyXG4gICAqIGByZXBlYXRpbmcgPT0gbnVsbGAgaWYgY2FsbGVyIGlzIGBsb2dgIG9yIGBwb3dgLFxyXG4gICAqIGByZXBlYXRpbmcgIT0gbnVsbGAgaWYgY2FsbGVyIGlzIGBuYXR1cmFsTG9nYXJpdGhtYCBvciBgbmF0dXJhbEV4cG9uZW50aWFsYC5cclxuICAgKi9cclxuICBmdW5jdGlvbiBjaGVja1JvdW5kaW5nRGlnaXRzKGQsIGksIHJtLCByZXBlYXRpbmcpIHtcclxuICAgIHZhciBkaSwgaywgciwgcmQ7XHJcblxyXG4gICAgLy8gR2V0IHRoZSBsZW5ndGggb2YgdGhlIGZpcnN0IHdvcmQgb2YgdGhlIGFycmF5IGQuXHJcbiAgICBmb3IgKGsgPSBkWzBdOyBrID49IDEwOyBrIC89IDEwKSAtLWk7XHJcblxyXG4gICAgLy8gSXMgdGhlIHJvdW5kaW5nIGRpZ2l0IGluIHRoZSBmaXJzdCB3b3JkIG9mIGQ/XHJcbiAgICBpZiAoLS1pIDwgMCkge1xyXG4gICAgICBpICs9IExPR19CQVNFO1xyXG4gICAgICBkaSA9IDA7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBkaSA9IE1hdGguY2VpbCgoaSArIDEpIC8gTE9HX0JBU0UpO1xyXG4gICAgICBpICU9IExPR19CQVNFO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGkgaXMgdGhlIGluZGV4ICgwIC0gNikgb2YgdGhlIHJvdW5kaW5nIGRpZ2l0LlxyXG4gICAgLy8gRS5nLiBpZiB3aXRoaW4gdGhlIHdvcmQgMzQ4NzU2MyB0aGUgZmlyc3Qgcm91bmRpbmcgZGlnaXQgaXMgNSxcclxuICAgIC8vIHRoZW4gaSA9IDQsIGsgPSAxMDAwLCByZCA9IDM0ODc1NjMgJSAxMDAwID0gNTYzXHJcbiAgICBrID0gbWF0aHBvdygxMCwgTE9HX0JBU0UgLSBpKTtcclxuICAgIHJkID0gZFtkaV0gJSBrIHwgMDtcclxuXHJcbiAgICBpZiAocmVwZWF0aW5nID09IG51bGwpIHtcclxuICAgICAgaWYgKGkgPCAzKSB7XHJcbiAgICAgICAgaWYgKGkgPT0gMCkgcmQgPSByZCAvIDEwMCB8IDA7XHJcbiAgICAgICAgZWxzZSBpZiAoaSA9PSAxKSByZCA9IHJkIC8gMTAgfCAwO1xyXG4gICAgICAgIHIgPSBybSA8IDQgJiYgcmQgPT0gOTk5OTkgfHwgcm0gPiAzICYmIHJkID09IDQ5OTk5IHx8IHJkID09IDUwMDAwIHx8IHJkID09IDA7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgciA9IChybSA8IDQgJiYgcmQgKyAxID09IGsgfHwgcm0gPiAzICYmIHJkICsgMSA9PSBrIC8gMikgJiZcclxuICAgICAgICAgIChkW2RpICsgMV0gLyBrIC8gMTAwIHwgMCkgPT0gbWF0aHBvdygxMCwgaSAtIDIpIC0gMSB8fFxyXG4gICAgICAgICAgICAocmQgPT0gayAvIDIgfHwgcmQgPT0gMCkgJiYgKGRbZGkgKyAxXSAvIGsgLyAxMDAgfCAwKSA9PSAwO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAoaSA8IDQpIHtcclxuICAgICAgICBpZiAoaSA9PSAwKSByZCA9IHJkIC8gMTAwMCB8IDA7XHJcbiAgICAgICAgZWxzZSBpZiAoaSA9PSAxKSByZCA9IHJkIC8gMTAwIHwgMDtcclxuICAgICAgICBlbHNlIGlmIChpID09IDIpIHJkID0gcmQgLyAxMCB8IDA7XHJcbiAgICAgICAgciA9IChyZXBlYXRpbmcgfHwgcm0gPCA0KSAmJiByZCA9PSA5OTk5IHx8ICFyZXBlYXRpbmcgJiYgcm0gPiAzICYmIHJkID09IDQ5OTk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgciA9ICgocmVwZWF0aW5nIHx8IHJtIDwgNCkgJiYgcmQgKyAxID09IGsgfHxcclxuICAgICAgICAoIXJlcGVhdGluZyAmJiBybSA+IDMpICYmIHJkICsgMSA9PSBrIC8gMikgJiZcclxuICAgICAgICAgIChkW2RpICsgMV0gLyBrIC8gMTAwMCB8IDApID09IG1hdGhwb3coMTAsIGkgLSAzKSAtIDE7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcjtcclxuICB9XHJcblxyXG5cclxuICAvLyBDb252ZXJ0IHN0cmluZyBvZiBgYmFzZUluYCB0byBhbiBhcnJheSBvZiBudW1iZXJzIG9mIGBiYXNlT3V0YC5cclxuICAvLyBFZy4gY29udmVydEJhc2UoJzI1NScsIDEwLCAxNikgcmV0dXJucyBbMTUsIDE1XS5cclxuICAvLyBFZy4gY29udmVydEJhc2UoJ2ZmJywgMTYsIDEwKSByZXR1cm5zIFsyLCA1LCA1XS5cclxuICBmdW5jdGlvbiBjb252ZXJ0QmFzZShzdHIsIGJhc2VJbiwgYmFzZU91dCkge1xyXG4gICAgdmFyIGosXHJcbiAgICAgIGFyciA9IFswXSxcclxuICAgICAgYXJyTCxcclxuICAgICAgaSA9IDAsXHJcbiAgICAgIHN0ckwgPSBzdHIubGVuZ3RoO1xyXG5cclxuICAgIGZvciAoOyBpIDwgc3RyTDspIHtcclxuICAgICAgZm9yIChhcnJMID0gYXJyLmxlbmd0aDsgYXJyTC0tOykgYXJyW2FyckxdICo9IGJhc2VJbjtcclxuICAgICAgYXJyWzBdICs9IE5VTUVSQUxTLmluZGV4T2Yoc3RyLmNoYXJBdChpKyspKTtcclxuICAgICAgZm9yIChqID0gMDsgaiA8IGFyci5sZW5ndGg7IGorKykge1xyXG4gICAgICAgIGlmIChhcnJbal0gPiBiYXNlT3V0IC0gMSkge1xyXG4gICAgICAgICAgaWYgKGFycltqICsgMV0gPT09IHZvaWQgMCkgYXJyW2ogKyAxXSA9IDA7XHJcbiAgICAgICAgICBhcnJbaiArIDFdICs9IGFycltqXSAvIGJhc2VPdXQgfCAwO1xyXG4gICAgICAgICAgYXJyW2pdICU9IGJhc2VPdXQ7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGFyci5yZXZlcnNlKCk7XHJcbiAgfVxyXG5cclxuXHJcbiAgLypcclxuICAgKiBjb3MoeCkgPSAxIC0geF4yLzIhICsgeF40LzQhIC0gLi4uXHJcbiAgICogfHh8IDwgcGkvMlxyXG4gICAqXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gY29zaW5lKEN0b3IsIHgpIHtcclxuICAgIHZhciBrLCB5LFxyXG4gICAgICBsZW4gPSB4LmQubGVuZ3RoO1xyXG5cclxuICAgIC8vIEFyZ3VtZW50IHJlZHVjdGlvbjogY29zKDR4KSA9IDgqKGNvc140KHgpIC0gY29zXjIoeCkpICsgMVxyXG4gICAgLy8gaS5lLiBjb3MoeCkgPSA4Kihjb3NeNCh4LzQpIC0gY29zXjIoeC80KSkgKyAxXHJcblxyXG4gICAgLy8gRXN0aW1hdGUgdGhlIG9wdGltdW0gbnVtYmVyIG9mIHRpbWVzIHRvIHVzZSB0aGUgYXJndW1lbnQgcmVkdWN0aW9uLlxyXG4gICAgaWYgKGxlbiA8IDMyKSB7XHJcbiAgICAgIGsgPSBNYXRoLmNlaWwobGVuIC8gMyk7XHJcbiAgICAgIHkgPSAoMSAvIHRpbnlQb3coNCwgaykpLnRvU3RyaW5nKCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBrID0gMTY7XHJcbiAgICAgIHkgPSAnMi4zMjgzMDY0MzY1Mzg2OTYyODkwNjI1ZS0xMCc7XHJcbiAgICB9XHJcblxyXG4gICAgQ3Rvci5wcmVjaXNpb24gKz0gaztcclxuXHJcbiAgICB4ID0gdGF5bG9yU2VyaWVzKEN0b3IsIDEsIHgudGltZXMoeSksIG5ldyBDdG9yKDEpKTtcclxuXHJcbiAgICAvLyBSZXZlcnNlIGFyZ3VtZW50IHJlZHVjdGlvblxyXG4gICAgZm9yICh2YXIgaSA9IGs7IGktLTspIHtcclxuICAgICAgdmFyIGNvczJ4ID0geC50aW1lcyh4KTtcclxuICAgICAgeCA9IGNvczJ4LnRpbWVzKGNvczJ4KS5taW51cyhjb3MyeCkudGltZXMoOCkucGx1cygxKTtcclxuICAgIH1cclxuXHJcbiAgICBDdG9yLnByZWNpc2lvbiAtPSBrO1xyXG5cclxuICAgIHJldHVybiB4O1xyXG4gIH1cclxuXHJcblxyXG4gIC8qXHJcbiAgICogUGVyZm9ybSBkaXZpc2lvbiBpbiB0aGUgc3BlY2lmaWVkIGJhc2UuXHJcbiAgICovXHJcbiAgdmFyIGRpdmlkZSA9IChmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgLy8gQXNzdW1lcyBub24temVybyB4IGFuZCBrLCBhbmQgaGVuY2Ugbm9uLXplcm8gcmVzdWx0LlxyXG4gICAgZnVuY3Rpb24gbXVsdGlwbHlJbnRlZ2VyKHgsIGssIGJhc2UpIHtcclxuICAgICAgdmFyIHRlbXAsXHJcbiAgICAgICAgY2FycnkgPSAwLFxyXG4gICAgICAgIGkgPSB4Lmxlbmd0aDtcclxuXHJcbiAgICAgIGZvciAoeCA9IHguc2xpY2UoKTsgaS0tOykge1xyXG4gICAgICAgIHRlbXAgPSB4W2ldICogayArIGNhcnJ5O1xyXG4gICAgICAgIHhbaV0gPSB0ZW1wICUgYmFzZSB8IDA7XHJcbiAgICAgICAgY2FycnkgPSB0ZW1wIC8gYmFzZSB8IDA7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChjYXJyeSkgeC51bnNoaWZ0KGNhcnJ5KTtcclxuXHJcbiAgICAgIHJldHVybiB4O1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNvbXBhcmUoYSwgYiwgYUwsIGJMKSB7XHJcbiAgICAgIHZhciBpLCByO1xyXG5cclxuICAgICAgaWYgKGFMICE9IGJMKSB7XHJcbiAgICAgICAgciA9IGFMID4gYkwgPyAxIDogLTE7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZm9yIChpID0gciA9IDA7IGkgPCBhTDsgaSsrKSB7XHJcbiAgICAgICAgICBpZiAoYVtpXSAhPSBiW2ldKSB7XHJcbiAgICAgICAgICAgIHIgPSBhW2ldID4gYltpXSA/IDEgOiAtMTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gcjtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBzdWJ0cmFjdChhLCBiLCBhTCwgYmFzZSkge1xyXG4gICAgICB2YXIgaSA9IDA7XHJcblxyXG4gICAgICAvLyBTdWJ0cmFjdCBiIGZyb20gYS5cclxuICAgICAgZm9yICg7IGFMLS07KSB7XHJcbiAgICAgICAgYVthTF0gLT0gaTtcclxuICAgICAgICBpID0gYVthTF0gPCBiW2FMXSA/IDEgOiAwO1xyXG4gICAgICAgIGFbYUxdID0gaSAqIGJhc2UgKyBhW2FMXSAtIGJbYUxdO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBSZW1vdmUgbGVhZGluZyB6ZXJvcy5cclxuICAgICAgZm9yICg7ICFhWzBdICYmIGEubGVuZ3RoID4gMTspIGEuc2hpZnQoKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKHgsIHksIHByLCBybSwgZHAsIGJhc2UpIHtcclxuICAgICAgdmFyIGNtcCwgZSwgaSwgaywgbG9nQmFzZSwgbW9yZSwgcHJvZCwgcHJvZEwsIHEsIHFkLCByZW0sIHJlbUwsIHJlbTAsIHNkLCB0LCB4aSwgeEwsIHlkMCxcclxuICAgICAgICB5TCwgeXosXHJcbiAgICAgICAgQ3RvciA9IHguY29uc3RydWN0b3IsXHJcbiAgICAgICAgc2lnbiA9IHgucyA9PSB5LnMgPyAxIDogLTEsXHJcbiAgICAgICAgeGQgPSB4LmQsXHJcbiAgICAgICAgeWQgPSB5LmQ7XHJcblxyXG4gICAgICAvLyBFaXRoZXIgTmFOLCBJbmZpbml0eSBvciAwP1xyXG4gICAgICBpZiAoIXhkIHx8ICF4ZFswXSB8fCAheWQgfHwgIXlkWzBdKSB7XHJcblxyXG4gICAgICAgIHJldHVybiBuZXcgQ3RvcigvLyBSZXR1cm4gTmFOIGlmIGVpdGhlciBOYU4sIG9yIGJvdGggSW5maW5pdHkgb3IgMC5cclxuICAgICAgICAgICF4LnMgfHwgIXkucyB8fCAoeGQgPyB5ZCAmJiB4ZFswXSA9PSB5ZFswXSA6ICF5ZCkgPyBOYU4gOlxyXG5cclxuICAgICAgICAgIC8vIFJldHVybiDCsTAgaWYgeCBpcyAwIG9yIHkgaXMgwrFJbmZpbml0eSwgb3IgcmV0dXJuIMKxSW5maW5pdHkgYXMgeSBpcyAwLlxyXG4gICAgICAgICAgeGQgJiYgeGRbMF0gPT0gMCB8fCAheWQgPyBzaWduICogMCA6IHNpZ24gLyAwKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGJhc2UpIHtcclxuICAgICAgICBsb2dCYXNlID0gMTtcclxuICAgICAgICBlID0geC5lIC0geS5lO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGJhc2UgPSBCQVNFO1xyXG4gICAgICAgIGxvZ0Jhc2UgPSBMT0dfQkFTRTtcclxuICAgICAgICBlID0gbWF0aGZsb29yKHguZSAvIGxvZ0Jhc2UpIC0gbWF0aGZsb29yKHkuZSAvIGxvZ0Jhc2UpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB5TCA9IHlkLmxlbmd0aDtcclxuICAgICAgeEwgPSB4ZC5sZW5ndGg7XHJcbiAgICAgIHEgPSBuZXcgQ3RvcihzaWduKTtcclxuICAgICAgcWQgPSBxLmQgPSBbXTtcclxuXHJcbiAgICAgIC8vIFJlc3VsdCBleHBvbmVudCBtYXkgYmUgb25lIGxlc3MgdGhhbiBlLlxyXG4gICAgICAvLyBUaGUgZGlnaXQgYXJyYXkgb2YgYSBEZWNpbWFsIGZyb20gdG9TdHJpbmdCaW5hcnkgbWF5IGhhdmUgdHJhaWxpbmcgemVyb3MuXHJcbiAgICAgIGZvciAoaSA9IDA7IHlkW2ldID09ICh4ZFtpXSB8fCAwKTsgaSsrKTtcclxuXHJcbiAgICAgIGlmICh5ZFtpXSA+ICh4ZFtpXSB8fCAwKSkgZS0tO1xyXG5cclxuICAgICAgaWYgKHByID09IG51bGwpIHtcclxuICAgICAgICBzZCA9IHByID0gQ3Rvci5wcmVjaXNpb247XHJcbiAgICAgICAgcm0gPSBDdG9yLnJvdW5kaW5nO1xyXG4gICAgICB9IGVsc2UgaWYgKGRwKSB7XHJcbiAgICAgICAgc2QgPSBwciArICh4LmUgLSB5LmUpICsgMTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBzZCA9IHByO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoc2QgPCAwKSB7XHJcbiAgICAgICAgcWQucHVzaCgxKTtcclxuICAgICAgICBtb3JlID0gdHJ1ZTtcclxuICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgLy8gQ29udmVydCBwcmVjaXNpb24gaW4gbnVtYmVyIG9mIGJhc2UgMTAgZGlnaXRzIHRvIGJhc2UgMWU3IGRpZ2l0cy5cclxuICAgICAgICBzZCA9IHNkIC8gbG9nQmFzZSArIDIgfCAwO1xyXG4gICAgICAgIGkgPSAwO1xyXG5cclxuICAgICAgICAvLyBkaXZpc29yIDwgMWU3XHJcbiAgICAgICAgaWYgKHlMID09IDEpIHtcclxuICAgICAgICAgIGsgPSAwO1xyXG4gICAgICAgICAgeWQgPSB5ZFswXTtcclxuICAgICAgICAgIHNkKys7XHJcblxyXG4gICAgICAgICAgLy8gayBpcyB0aGUgY2FycnkuXHJcbiAgICAgICAgICBmb3IgKDsgKGkgPCB4TCB8fCBrKSAmJiBzZC0tOyBpKyspIHtcclxuICAgICAgICAgICAgdCA9IGsgKiBiYXNlICsgKHhkW2ldIHx8IDApO1xyXG4gICAgICAgICAgICBxZFtpXSA9IHQgLyB5ZCB8IDA7XHJcbiAgICAgICAgICAgIGsgPSB0ICUgeWQgfCAwO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIG1vcmUgPSBrIHx8IGkgPCB4TDtcclxuXHJcbiAgICAgICAgLy8gZGl2aXNvciA+PSAxZTdcclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgIC8vIE5vcm1hbGlzZSB4ZCBhbmQgeWQgc28gaGlnaGVzdCBvcmRlciBkaWdpdCBvZiB5ZCBpcyA+PSBiYXNlLzJcclxuICAgICAgICAgIGsgPSBiYXNlIC8gKHlkWzBdICsgMSkgfCAwO1xyXG5cclxuICAgICAgICAgIGlmIChrID4gMSkge1xyXG4gICAgICAgICAgICB5ZCA9IG11bHRpcGx5SW50ZWdlcih5ZCwgaywgYmFzZSk7XHJcbiAgICAgICAgICAgIHhkID0gbXVsdGlwbHlJbnRlZ2VyKHhkLCBrLCBiYXNlKTtcclxuICAgICAgICAgICAgeUwgPSB5ZC5sZW5ndGg7XHJcbiAgICAgICAgICAgIHhMID0geGQubGVuZ3RoO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIHhpID0geUw7XHJcbiAgICAgICAgICByZW0gPSB4ZC5zbGljZSgwLCB5TCk7XHJcbiAgICAgICAgICByZW1MID0gcmVtLmxlbmd0aDtcclxuXHJcbiAgICAgICAgICAvLyBBZGQgemVyb3MgdG8gbWFrZSByZW1haW5kZXIgYXMgbG9uZyBhcyBkaXZpc29yLlxyXG4gICAgICAgICAgZm9yICg7IHJlbUwgPCB5TDspIHJlbVtyZW1MKytdID0gMDtcclxuXHJcbiAgICAgICAgICB5eiA9IHlkLnNsaWNlKCk7XHJcbiAgICAgICAgICB5ei51bnNoaWZ0KDApO1xyXG4gICAgICAgICAgeWQwID0geWRbMF07XHJcblxyXG4gICAgICAgICAgaWYgKHlkWzFdID49IGJhc2UgLyAyKSArK3lkMDtcclxuXHJcbiAgICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgIGsgPSAwO1xyXG5cclxuICAgICAgICAgICAgLy8gQ29tcGFyZSBkaXZpc29yIGFuZCByZW1haW5kZXIuXHJcbiAgICAgICAgICAgIGNtcCA9IGNvbXBhcmUoeWQsIHJlbSwgeUwsIHJlbUwpO1xyXG5cclxuICAgICAgICAgICAgLy8gSWYgZGl2aXNvciA8IHJlbWFpbmRlci5cclxuICAgICAgICAgICAgaWYgKGNtcCA8IDApIHtcclxuXHJcbiAgICAgICAgICAgICAgLy8gQ2FsY3VsYXRlIHRyaWFsIGRpZ2l0LCBrLlxyXG4gICAgICAgICAgICAgIHJlbTAgPSByZW1bMF07XHJcbiAgICAgICAgICAgICAgaWYgKHlMICE9IHJlbUwpIHJlbTAgPSByZW0wICogYmFzZSArIChyZW1bMV0gfHwgMCk7XHJcblxyXG4gICAgICAgICAgICAgIC8vIGsgd2lsbCBiZSBob3cgbWFueSB0aW1lcyB0aGUgZGl2aXNvciBnb2VzIGludG8gdGhlIGN1cnJlbnQgcmVtYWluZGVyLlxyXG4gICAgICAgICAgICAgIGsgPSByZW0wIC8geWQwIHwgMDtcclxuXHJcbiAgICAgICAgICAgICAgLy8gIEFsZ29yaXRobTpcclxuICAgICAgICAgICAgICAvLyAgMS4gcHJvZHVjdCA9IGRpdmlzb3IgKiB0cmlhbCBkaWdpdCAoaylcclxuICAgICAgICAgICAgICAvLyAgMi4gaWYgcHJvZHVjdCA+IHJlbWFpbmRlcjogcHJvZHVjdCAtPSBkaXZpc29yLCBrLS1cclxuICAgICAgICAgICAgICAvLyAgMy4gcmVtYWluZGVyIC09IHByb2R1Y3RcclxuICAgICAgICAgICAgICAvLyAgNC4gaWYgcHJvZHVjdCB3YXMgPCByZW1haW5kZXIgYXQgMjpcclxuICAgICAgICAgICAgICAvLyAgICA1LiBjb21wYXJlIG5ldyByZW1haW5kZXIgYW5kIGRpdmlzb3JcclxuICAgICAgICAgICAgICAvLyAgICA2LiBJZiByZW1haW5kZXIgPiBkaXZpc29yOiByZW1haW5kZXIgLT0gZGl2aXNvciwgaysrXHJcblxyXG4gICAgICAgICAgICAgIGlmIChrID4gMSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGsgPj0gYmFzZSkgayA9IGJhc2UgLSAxO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIHByb2R1Y3QgPSBkaXZpc29yICogdHJpYWwgZGlnaXQuXHJcbiAgICAgICAgICAgICAgICBwcm9kID0gbXVsdGlwbHlJbnRlZ2VyKHlkLCBrLCBiYXNlKTtcclxuICAgICAgICAgICAgICAgIHByb2RMID0gcHJvZC5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICByZW1MID0gcmVtLmxlbmd0aDtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBDb21wYXJlIHByb2R1Y3QgYW5kIHJlbWFpbmRlci5cclxuICAgICAgICAgICAgICAgIGNtcCA9IGNvbXBhcmUocHJvZCwgcmVtLCBwcm9kTCwgcmVtTCk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gcHJvZHVjdCA+IHJlbWFpbmRlci5cclxuICAgICAgICAgICAgICAgIGlmIChjbXAgPT0gMSkge1xyXG4gICAgICAgICAgICAgICAgICBrLS07XHJcblxyXG4gICAgICAgICAgICAgICAgICAvLyBTdWJ0cmFjdCBkaXZpc29yIGZyb20gcHJvZHVjdC5cclxuICAgICAgICAgICAgICAgICAgc3VidHJhY3QocHJvZCwgeUwgPCBwcm9kTCA/IHl6IDogeWQsIHByb2RMLCBiYXNlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIGNtcCBpcyAtMS5cclxuICAgICAgICAgICAgICAgIC8vIElmIGsgaXMgMCwgdGhlcmUgaXMgbm8gbmVlZCB0byBjb21wYXJlIHlkIGFuZCByZW0gYWdhaW4gYmVsb3csIHNvIGNoYW5nZSBjbXAgdG8gMVxyXG4gICAgICAgICAgICAgICAgLy8gdG8gYXZvaWQgaXQuIElmIGsgaXMgMSB0aGVyZSBpcyBhIG5lZWQgdG8gY29tcGFyZSB5ZCBhbmQgcmVtIGFnYWluIGJlbG93LlxyXG4gICAgICAgICAgICAgICAgaWYgKGsgPT0gMCkgY21wID0gayA9IDE7XHJcbiAgICAgICAgICAgICAgICBwcm9kID0geWQuc2xpY2UoKTtcclxuICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgIHByb2RMID0gcHJvZC5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgaWYgKHByb2RMIDwgcmVtTCkgcHJvZC51bnNoaWZ0KDApO1xyXG5cclxuICAgICAgICAgICAgICAvLyBTdWJ0cmFjdCBwcm9kdWN0IGZyb20gcmVtYWluZGVyLlxyXG4gICAgICAgICAgICAgIHN1YnRyYWN0KHJlbSwgcHJvZCwgcmVtTCwgYmFzZSk7XHJcblxyXG4gICAgICAgICAgICAgIC8vIElmIHByb2R1Y3Qgd2FzIDwgcHJldmlvdXMgcmVtYWluZGVyLlxyXG4gICAgICAgICAgICAgIGlmIChjbXAgPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIHJlbUwgPSByZW0ubGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIENvbXBhcmUgZGl2aXNvciBhbmQgbmV3IHJlbWFpbmRlci5cclxuICAgICAgICAgICAgICAgIGNtcCA9IGNvbXBhcmUoeWQsIHJlbSwgeUwsIHJlbUwpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIElmIGRpdmlzb3IgPCBuZXcgcmVtYWluZGVyLCBzdWJ0cmFjdCBkaXZpc29yIGZyb20gcmVtYWluZGVyLlxyXG4gICAgICAgICAgICAgICAgaWYgKGNtcCA8IDEpIHtcclxuICAgICAgICAgICAgICAgICAgaysrO1xyXG5cclxuICAgICAgICAgICAgICAgICAgLy8gU3VidHJhY3QgZGl2aXNvciBmcm9tIHJlbWFpbmRlci5cclxuICAgICAgICAgICAgICAgICAgc3VidHJhY3QocmVtLCB5TCA8IHJlbUwgPyB5eiA6IHlkLCByZW1MLCBiYXNlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgIHJlbUwgPSByZW0ubGVuZ3RoO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGNtcCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgIGsrKztcclxuICAgICAgICAgICAgICByZW0gPSBbMF07XHJcbiAgICAgICAgICAgIH0gICAgLy8gaWYgY21wID09PSAxLCBrIHdpbGwgYmUgMFxyXG5cclxuICAgICAgICAgICAgLy8gQWRkIHRoZSBuZXh0IGRpZ2l0LCBrLCB0byB0aGUgcmVzdWx0IGFycmF5LlxyXG4gICAgICAgICAgICBxZFtpKytdID0gaztcclxuXHJcbiAgICAgICAgICAgIC8vIFVwZGF0ZSB0aGUgcmVtYWluZGVyLlxyXG4gICAgICAgICAgICBpZiAoY21wICYmIHJlbVswXSkge1xyXG4gICAgICAgICAgICAgIHJlbVtyZW1MKytdID0geGRbeGldIHx8IDA7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgcmVtID0gW3hkW3hpXV07XHJcbiAgICAgICAgICAgICAgcmVtTCA9IDE7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICB9IHdoaWxlICgoeGkrKyA8IHhMIHx8IHJlbVswXSAhPT0gdm9pZCAwKSAmJiBzZC0tKTtcclxuXHJcbiAgICAgICAgICBtb3JlID0gcmVtWzBdICE9PSB2b2lkIDA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBMZWFkaW5nIHplcm8/XHJcbiAgICAgICAgaWYgKCFxZFswXSkgcWQuc2hpZnQoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gbG9nQmFzZSBpcyAxIHdoZW4gZGl2aWRlIGlzIGJlaW5nIHVzZWQgZm9yIGJhc2UgY29udmVyc2lvbi5cclxuICAgICAgaWYgKGxvZ0Jhc2UgPT0gMSkge1xyXG4gICAgICAgIHEuZSA9IGU7XHJcbiAgICAgICAgaW5leGFjdCA9IG1vcmU7XHJcbiAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgIC8vIFRvIGNhbGN1bGF0ZSBxLmUsIGZpcnN0IGdldCB0aGUgbnVtYmVyIG9mIGRpZ2l0cyBvZiBxZFswXS5cclxuICAgICAgICBmb3IgKGkgPSAxLCBrID0gcWRbMF07IGsgPj0gMTA7IGsgLz0gMTApIGkrKztcclxuICAgICAgICBxLmUgPSBpICsgZSAqIGxvZ0Jhc2UgLSAxO1xyXG5cclxuICAgICAgICBmaW5hbGlzZShxLCBkcCA/IHByICsgcS5lICsgMSA6IHByLCBybSwgbW9yZSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBxO1xyXG4gICAgfTtcclxuICB9KSgpO1xyXG5cclxuXHJcbiAgLypcclxuICAgKiBSb3VuZCBgeGAgdG8gYHNkYCBzaWduaWZpY2FudCBkaWdpdHMgdXNpbmcgcm91bmRpbmcgbW9kZSBgcm1gLlxyXG4gICAqIENoZWNrIGZvciBvdmVyL3VuZGVyLWZsb3cuXHJcbiAgICovXHJcbiAgIGZ1bmN0aW9uIGZpbmFsaXNlKHgsIHNkLCBybSwgaXNUcnVuY2F0ZWQpIHtcclxuICAgIHZhciBkaWdpdHMsIGksIGosIGssIHJkLCByb3VuZFVwLCB3LCB4ZCwgeGRpLFxyXG4gICAgICBDdG9yID0geC5jb25zdHJ1Y3RvcjtcclxuXHJcbiAgICAvLyBEb24ndCByb3VuZCBpZiBzZCBpcyBudWxsIG9yIHVuZGVmaW5lZC5cclxuICAgIG91dDogaWYgKHNkICE9IG51bGwpIHtcclxuICAgICAgeGQgPSB4LmQ7XHJcblxyXG4gICAgICAvLyBJbmZpbml0eS9OYU4uXHJcbiAgICAgIGlmICgheGQpIHJldHVybiB4O1xyXG5cclxuICAgICAgLy8gcmQ6IHRoZSByb3VuZGluZyBkaWdpdCwgaS5lLiB0aGUgZGlnaXQgYWZ0ZXIgdGhlIGRpZ2l0IHRoYXQgbWF5IGJlIHJvdW5kZWQgdXAuXHJcbiAgICAgIC8vIHc6IHRoZSB3b3JkIG9mIHhkIGNvbnRhaW5pbmcgcmQsIGEgYmFzZSAxZTcgbnVtYmVyLlxyXG4gICAgICAvLyB4ZGk6IHRoZSBpbmRleCBvZiB3IHdpdGhpbiB4ZC5cclxuICAgICAgLy8gZGlnaXRzOiB0aGUgbnVtYmVyIG9mIGRpZ2l0cyBvZiB3LlxyXG4gICAgICAvLyBpOiB3aGF0IHdvdWxkIGJlIHRoZSBpbmRleCBvZiByZCB3aXRoaW4gdyBpZiBhbGwgdGhlIG51bWJlcnMgd2VyZSA3IGRpZ2l0cyBsb25nIChpLmUuIGlmXHJcbiAgICAgIC8vIHRoZXkgaGFkIGxlYWRpbmcgemVyb3MpXHJcbiAgICAgIC8vIGo6IGlmID4gMCwgdGhlIGFjdHVhbCBpbmRleCBvZiByZCB3aXRoaW4gdyAoaWYgPCAwLCByZCBpcyBhIGxlYWRpbmcgemVybykuXHJcblxyXG4gICAgICAvLyBHZXQgdGhlIGxlbmd0aCBvZiB0aGUgZmlyc3Qgd29yZCBvZiB0aGUgZGlnaXRzIGFycmF5IHhkLlxyXG4gICAgICBmb3IgKGRpZ2l0cyA9IDEsIGsgPSB4ZFswXTsgayA+PSAxMDsgayAvPSAxMCkgZGlnaXRzKys7XHJcbiAgICAgIGkgPSBzZCAtIGRpZ2l0cztcclxuXHJcbiAgICAgIC8vIElzIHRoZSByb3VuZGluZyBkaWdpdCBpbiB0aGUgZmlyc3Qgd29yZCBvZiB4ZD9cclxuICAgICAgaWYgKGkgPCAwKSB7XHJcbiAgICAgICAgaSArPSBMT0dfQkFTRTtcclxuICAgICAgICBqID0gc2Q7XHJcbiAgICAgICAgdyA9IHhkW3hkaSA9IDBdO1xyXG5cclxuICAgICAgICAvLyBHZXQgdGhlIHJvdW5kaW5nIGRpZ2l0IGF0IGluZGV4IGogb2Ygdy5cclxuICAgICAgICByZCA9IHcgLyBtYXRocG93KDEwLCBkaWdpdHMgLSBqIC0gMSkgJSAxMCB8IDA7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgeGRpID0gTWF0aC5jZWlsKChpICsgMSkgLyBMT0dfQkFTRSk7XHJcbiAgICAgICAgayA9IHhkLmxlbmd0aDtcclxuICAgICAgICBpZiAoeGRpID49IGspIHtcclxuICAgICAgICAgIGlmIChpc1RydW5jYXRlZCkge1xyXG5cclxuICAgICAgICAgICAgLy8gTmVlZGVkIGJ5IGBuYXR1cmFsRXhwb25lbnRpYWxgLCBgbmF0dXJhbExvZ2FyaXRobWAgYW5kIGBzcXVhcmVSb290YC5cclxuICAgICAgICAgICAgZm9yICg7IGsrKyA8PSB4ZGk7KSB4ZC5wdXNoKDApO1xyXG4gICAgICAgICAgICB3ID0gcmQgPSAwO1xyXG4gICAgICAgICAgICBkaWdpdHMgPSAxO1xyXG4gICAgICAgICAgICBpICU9IExPR19CQVNFO1xyXG4gICAgICAgICAgICBqID0gaSAtIExPR19CQVNFICsgMTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGJyZWFrIG91dDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdyA9IGsgPSB4ZFt4ZGldO1xyXG5cclxuICAgICAgICAgIC8vIEdldCB0aGUgbnVtYmVyIG9mIGRpZ2l0cyBvZiB3LlxyXG4gICAgICAgICAgZm9yIChkaWdpdHMgPSAxOyBrID49IDEwOyBrIC89IDEwKSBkaWdpdHMrKztcclxuXHJcbiAgICAgICAgICAvLyBHZXQgdGhlIGluZGV4IG9mIHJkIHdpdGhpbiB3LlxyXG4gICAgICAgICAgaSAlPSBMT0dfQkFTRTtcclxuXHJcbiAgICAgICAgICAvLyBHZXQgdGhlIGluZGV4IG9mIHJkIHdpdGhpbiB3LCBhZGp1c3RlZCBmb3IgbGVhZGluZyB6ZXJvcy5cclxuICAgICAgICAgIC8vIFRoZSBudW1iZXIgb2YgbGVhZGluZyB6ZXJvcyBvZiB3IGlzIGdpdmVuIGJ5IExPR19CQVNFIC0gZGlnaXRzLlxyXG4gICAgICAgICAgaiA9IGkgLSBMT0dfQkFTRSArIGRpZ2l0cztcclxuXHJcbiAgICAgICAgICAvLyBHZXQgdGhlIHJvdW5kaW5nIGRpZ2l0IGF0IGluZGV4IGogb2Ygdy5cclxuICAgICAgICAgIHJkID0gaiA8IDAgPyAwIDogdyAvIG1hdGhwb3coMTAsIGRpZ2l0cyAtIGogLSAxKSAlIDEwIHwgMDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIEFyZSB0aGVyZSBhbnkgbm9uLXplcm8gZGlnaXRzIGFmdGVyIHRoZSByb3VuZGluZyBkaWdpdD9cclxuICAgICAgaXNUcnVuY2F0ZWQgPSBpc1RydW5jYXRlZCB8fCBzZCA8IDAgfHxcclxuICAgICAgICB4ZFt4ZGkgKyAxXSAhPT0gdm9pZCAwIHx8IChqIDwgMCA/IHcgOiB3ICUgbWF0aHBvdygxMCwgZGlnaXRzIC0gaiAtIDEpKTtcclxuXHJcbiAgICAgIC8vIFRoZSBleHByZXNzaW9uIGB3ICUgbWF0aHBvdygxMCwgZGlnaXRzIC0gaiAtIDEpYCByZXR1cm5zIGFsbCB0aGUgZGlnaXRzIG9mIHcgdG8gdGhlIHJpZ2h0XHJcbiAgICAgIC8vIG9mIHRoZSBkaWdpdCBhdCAobGVmdC10by1yaWdodCkgaW5kZXggaiwgZS5nLiBpZiB3IGlzIDkwODcxNCBhbmQgaiBpcyAyLCB0aGUgZXhwcmVzc2lvblxyXG4gICAgICAvLyB3aWxsIGdpdmUgNzE0LlxyXG5cclxuICAgICAgcm91bmRVcCA9IHJtIDwgNFxyXG4gICAgICAgID8gKHJkIHx8IGlzVHJ1bmNhdGVkKSAmJiAocm0gPT0gMCB8fCBybSA9PSAoeC5zIDwgMCA/IDMgOiAyKSlcclxuICAgICAgICA6IHJkID4gNSB8fCByZCA9PSA1ICYmIChybSA9PSA0IHx8IGlzVHJ1bmNhdGVkIHx8IHJtID09IDYgJiZcclxuXHJcbiAgICAgICAgICAvLyBDaGVjayB3aGV0aGVyIHRoZSBkaWdpdCB0byB0aGUgbGVmdCBvZiB0aGUgcm91bmRpbmcgZGlnaXQgaXMgb2RkLlxyXG4gICAgICAgICAgKChpID4gMCA/IGogPiAwID8gdyAvIG1hdGhwb3coMTAsIGRpZ2l0cyAtIGopIDogMCA6IHhkW3hkaSAtIDFdKSAlIDEwKSAmIDEgfHxcclxuICAgICAgICAgICAgcm0gPT0gKHgucyA8IDAgPyA4IDogNykpO1xyXG5cclxuICAgICAgaWYgKHNkIDwgMSB8fCAheGRbMF0pIHtcclxuICAgICAgICB4ZC5sZW5ndGggPSAwO1xyXG4gICAgICAgIGlmIChyb3VuZFVwKSB7XHJcblxyXG4gICAgICAgICAgLy8gQ29udmVydCBzZCB0byBkZWNpbWFsIHBsYWNlcy5cclxuICAgICAgICAgIHNkIC09IHguZSArIDE7XHJcblxyXG4gICAgICAgICAgLy8gMSwgMC4xLCAwLjAxLCAwLjAwMSwgMC4wMDAxIGV0Yy5cclxuICAgICAgICAgIHhkWzBdID0gbWF0aHBvdygxMCwgKExPR19CQVNFIC0gc2QgJSBMT0dfQkFTRSkgJSBMT0dfQkFTRSk7XHJcbiAgICAgICAgICB4LmUgPSAtc2QgfHwgMDtcclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgIC8vIFplcm8uXHJcbiAgICAgICAgICB4ZFswXSA9IHguZSA9IDA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4geDtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gUmVtb3ZlIGV4Y2VzcyBkaWdpdHMuXHJcbiAgICAgIGlmIChpID09IDApIHtcclxuICAgICAgICB4ZC5sZW5ndGggPSB4ZGk7XHJcbiAgICAgICAgayA9IDE7XHJcbiAgICAgICAgeGRpLS07XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgeGQubGVuZ3RoID0geGRpICsgMTtcclxuICAgICAgICBrID0gbWF0aHBvdygxMCwgTE9HX0JBU0UgLSBpKTtcclxuXHJcbiAgICAgICAgLy8gRS5nLiA1NjcwMCBiZWNvbWVzIDU2MDAwIGlmIDcgaXMgdGhlIHJvdW5kaW5nIGRpZ2l0LlxyXG4gICAgICAgIC8vIGogPiAwIG1lYW5zIGkgPiBudW1iZXIgb2YgbGVhZGluZyB6ZXJvcyBvZiB3LlxyXG4gICAgICAgIHhkW3hkaV0gPSBqID4gMCA/ICh3IC8gbWF0aHBvdygxMCwgZGlnaXRzIC0gaikgJSBtYXRocG93KDEwLCBqKSB8IDApICogayA6IDA7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChyb3VuZFVwKSB7XHJcbiAgICAgICAgZm9yICg7Oykge1xyXG5cclxuICAgICAgICAgIC8vIElzIHRoZSBkaWdpdCB0byBiZSByb3VuZGVkIHVwIGluIHRoZSBmaXJzdCB3b3JkIG9mIHhkP1xyXG4gICAgICAgICAgaWYgKHhkaSA9PSAwKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBpIHdpbGwgYmUgdGhlIGxlbmd0aCBvZiB4ZFswXSBiZWZvcmUgayBpcyBhZGRlZC5cclxuICAgICAgICAgICAgZm9yIChpID0gMSwgaiA9IHhkWzBdOyBqID49IDEwOyBqIC89IDEwKSBpKys7XHJcbiAgICAgICAgICAgIGogPSB4ZFswXSArPSBrO1xyXG4gICAgICAgICAgICBmb3IgKGsgPSAxOyBqID49IDEwOyBqIC89IDEwKSBrKys7XHJcblxyXG4gICAgICAgICAgICAvLyBpZiBpICE9IGsgdGhlIGxlbmd0aCBoYXMgaW5jcmVhc2VkLlxyXG4gICAgICAgICAgICBpZiAoaSAhPSBrKSB7XHJcbiAgICAgICAgICAgICAgeC5lKys7XHJcbiAgICAgICAgICAgICAgaWYgKHhkWzBdID09IEJBU0UpIHhkWzBdID0gMTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB4ZFt4ZGldICs9IGs7XHJcbiAgICAgICAgICAgIGlmICh4ZFt4ZGldICE9IEJBU0UpIGJyZWFrO1xyXG4gICAgICAgICAgICB4ZFt4ZGktLV0gPSAwO1xyXG4gICAgICAgICAgICBrID0gMTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFJlbW92ZSB0cmFpbGluZyB6ZXJvcy5cclxuICAgICAgZm9yIChpID0geGQubGVuZ3RoOyB4ZFstLWldID09PSAwOykgeGQucG9wKCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGV4dGVybmFsKSB7XHJcblxyXG4gICAgICAvLyBPdmVyZmxvdz9cclxuICAgICAgaWYgKHguZSA+IEN0b3IubWF4RSkge1xyXG5cclxuICAgICAgICAvLyBJbmZpbml0eS5cclxuICAgICAgICB4LmQgPSBudWxsO1xyXG4gICAgICAgIHguZSA9IE5hTjtcclxuXHJcbiAgICAgIC8vIFVuZGVyZmxvdz9cclxuICAgICAgfSBlbHNlIGlmICh4LmUgPCBDdG9yLm1pbkUpIHtcclxuXHJcbiAgICAgICAgLy8gWmVyby5cclxuICAgICAgICB4LmUgPSAwO1xyXG4gICAgICAgIHguZCA9IFswXTtcclxuICAgICAgICAvLyBDdG9yLnVuZGVyZmxvdyA9IHRydWU7XHJcbiAgICAgIH0gLy8gZWxzZSBDdG9yLnVuZGVyZmxvdyA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB4O1xyXG4gIH1cclxuXHJcblxyXG4gIGZ1bmN0aW9uIGZpbml0ZVRvU3RyaW5nKHgsIGlzRXhwLCBzZCkge1xyXG4gICAgaWYgKCF4LmlzRmluaXRlKCkpIHJldHVybiBub25GaW5pdGVUb1N0cmluZyh4KTtcclxuICAgIHZhciBrLFxyXG4gICAgICBlID0geC5lLFxyXG4gICAgICBzdHIgPSBkaWdpdHNUb1N0cmluZyh4LmQpLFxyXG4gICAgICBsZW4gPSBzdHIubGVuZ3RoO1xyXG5cclxuICAgIGlmIChpc0V4cCkge1xyXG4gICAgICBpZiAoc2QgJiYgKGsgPSBzZCAtIGxlbikgPiAwKSB7XHJcbiAgICAgICAgc3RyID0gc3RyLmNoYXJBdCgwKSArICcuJyArIHN0ci5zbGljZSgxKSArIGdldFplcm9TdHJpbmcoayk7XHJcbiAgICAgIH0gZWxzZSBpZiAobGVuID4gMSkge1xyXG4gICAgICAgIHN0ciA9IHN0ci5jaGFyQXQoMCkgKyAnLicgKyBzdHIuc2xpY2UoMSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHN0ciA9IHN0ciArICh4LmUgPCAwID8gJ2UnIDogJ2UrJykgKyB4LmU7XHJcbiAgICB9IGVsc2UgaWYgKGUgPCAwKSB7XHJcbiAgICAgIHN0ciA9ICcwLicgKyBnZXRaZXJvU3RyaW5nKC1lIC0gMSkgKyBzdHI7XHJcbiAgICAgIGlmIChzZCAmJiAoayA9IHNkIC0gbGVuKSA+IDApIHN0ciArPSBnZXRaZXJvU3RyaW5nKGspO1xyXG4gICAgfSBlbHNlIGlmIChlID49IGxlbikge1xyXG4gICAgICBzdHIgKz0gZ2V0WmVyb1N0cmluZyhlICsgMSAtIGxlbik7XHJcbiAgICAgIGlmIChzZCAmJiAoayA9IHNkIC0gZSAtIDEpID4gMCkgc3RyID0gc3RyICsgJy4nICsgZ2V0WmVyb1N0cmluZyhrKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmICgoayA9IGUgKyAxKSA8IGxlbikgc3RyID0gc3RyLnNsaWNlKDAsIGspICsgJy4nICsgc3RyLnNsaWNlKGspO1xyXG4gICAgICBpZiAoc2QgJiYgKGsgPSBzZCAtIGxlbikgPiAwKSB7XHJcbiAgICAgICAgaWYgKGUgKyAxID09PSBsZW4pIHN0ciArPSAnLic7XHJcbiAgICAgICAgc3RyICs9IGdldFplcm9TdHJpbmcoayk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gc3RyO1xyXG4gIH1cclxuXHJcblxyXG4gIC8vIENhbGN1bGF0ZSB0aGUgYmFzZSAxMCBleHBvbmVudCBmcm9tIHRoZSBiYXNlIDFlNyBleHBvbmVudC5cclxuICBmdW5jdGlvbiBnZXRCYXNlMTBFeHBvbmVudChkaWdpdHMsIGUpIHtcclxuICAgIHZhciB3ID0gZGlnaXRzWzBdO1xyXG5cclxuICAgIC8vIEFkZCB0aGUgbnVtYmVyIG9mIGRpZ2l0cyBvZiB0aGUgZmlyc3Qgd29yZCBvZiB0aGUgZGlnaXRzIGFycmF5LlxyXG4gICAgZm9yICggZSAqPSBMT0dfQkFTRTsgdyA+PSAxMDsgdyAvPSAxMCkgZSsrO1xyXG4gICAgcmV0dXJuIGU7XHJcbiAgfVxyXG5cclxuXHJcbiAgZnVuY3Rpb24gZ2V0TG4xMChDdG9yLCBzZCwgcHIpIHtcclxuICAgIGlmIChzZCA+IExOMTBfUFJFQ0lTSU9OKSB7XHJcblxyXG4gICAgICAvLyBSZXNldCBnbG9iYWwgc3RhdGUgaW4gY2FzZSB0aGUgZXhjZXB0aW9uIGlzIGNhdWdodC5cclxuICAgICAgZXh0ZXJuYWwgPSB0cnVlO1xyXG4gICAgICBpZiAocHIpIEN0b3IucHJlY2lzaW9uID0gcHI7XHJcbiAgICAgIHRocm93IEVycm9yKHByZWNpc2lvbkxpbWl0RXhjZWVkZWQpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZpbmFsaXNlKG5ldyBDdG9yKExOMTApLCBzZCwgMSwgdHJ1ZSk7XHJcbiAgfVxyXG5cclxuXHJcbiAgZnVuY3Rpb24gZ2V0UGkoQ3Rvciwgc2QsIHJtKSB7XHJcbiAgICBpZiAoc2QgPiBQSV9QUkVDSVNJT04pIHRocm93IEVycm9yKHByZWNpc2lvbkxpbWl0RXhjZWVkZWQpO1xyXG4gICAgcmV0dXJuIGZpbmFsaXNlKG5ldyBDdG9yKFBJKSwgc2QsIHJtLCB0cnVlKTtcclxuICB9XHJcblxyXG5cclxuICBmdW5jdGlvbiBnZXRQcmVjaXNpb24oZGlnaXRzKSB7XHJcbiAgICB2YXIgdyA9IGRpZ2l0cy5sZW5ndGggLSAxLFxyXG4gICAgICBsZW4gPSB3ICogTE9HX0JBU0UgKyAxO1xyXG5cclxuICAgIHcgPSBkaWdpdHNbd107XHJcblxyXG4gICAgLy8gSWYgbm9uLXplcm8uLi5cclxuICAgIGlmICh3KSB7XHJcblxyXG4gICAgICAvLyBTdWJ0cmFjdCB0aGUgbnVtYmVyIG9mIHRyYWlsaW5nIHplcm9zIG9mIHRoZSBsYXN0IHdvcmQuXHJcbiAgICAgIGZvciAoOyB3ICUgMTAgPT0gMDsgdyAvPSAxMCkgbGVuLS07XHJcblxyXG4gICAgICAvLyBBZGQgdGhlIG51bWJlciBvZiBkaWdpdHMgb2YgdGhlIGZpcnN0IHdvcmQuXHJcbiAgICAgIGZvciAodyA9IGRpZ2l0c1swXTsgdyA+PSAxMDsgdyAvPSAxMCkgbGVuKys7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGxlbjtcclxuICB9XHJcblxyXG5cclxuICBmdW5jdGlvbiBnZXRaZXJvU3RyaW5nKGspIHtcclxuICAgIHZhciB6cyA9ICcnO1xyXG4gICAgZm9yICg7IGstLTspIHpzICs9ICcwJztcclxuICAgIHJldHVybiB6cztcclxuICB9XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiBEZWNpbWFsIGB4YCB0byB0aGUgcG93ZXIgYG5gLCB3aGVyZSBgbmAgaXMgYW5cclxuICAgKiBpbnRlZ2VyIG9mIHR5cGUgbnVtYmVyLlxyXG4gICAqXHJcbiAgICogSW1wbGVtZW50cyAnZXhwb25lbnRpYXRpb24gYnkgc3F1YXJpbmcnLiBDYWxsZWQgYnkgYHBvd2AgYW5kIGBwYXJzZU90aGVyYC5cclxuICAgKlxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGludFBvdyhDdG9yLCB4LCBuLCBwcikge1xyXG4gICAgdmFyIGlzVHJ1bmNhdGVkLFxyXG4gICAgICByID0gbmV3IEN0b3IoMSksXHJcblxyXG4gICAgICAvLyBNYXggbiBvZiA5MDA3MTk5MjU0NzQwOTkxIHRha2VzIDUzIGxvb3AgaXRlcmF0aW9ucy5cclxuICAgICAgLy8gTWF4aW11bSBkaWdpdHMgYXJyYXkgbGVuZ3RoOyBsZWF2ZXMgWzI4LCAzNF0gZ3VhcmQgZGlnaXRzLlxyXG4gICAgICBrID0gTWF0aC5jZWlsKHByIC8gTE9HX0JBU0UgKyA0KTtcclxuXHJcbiAgICBleHRlcm5hbCA9IGZhbHNlO1xyXG5cclxuICAgIGZvciAoOzspIHtcclxuICAgICAgaWYgKG4gJSAyKSB7XHJcbiAgICAgICAgciA9IHIudGltZXMoeCk7XHJcbiAgICAgICAgaWYgKHRydW5jYXRlKHIuZCwgaykpIGlzVHJ1bmNhdGVkID0gdHJ1ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgbiA9IG1hdGhmbG9vcihuIC8gMik7XHJcbiAgICAgIGlmIChuID09PSAwKSB7XHJcblxyXG4gICAgICAgIC8vIFRvIGVuc3VyZSBjb3JyZWN0IHJvdW5kaW5nIHdoZW4gci5kIGlzIHRydW5jYXRlZCwgaW5jcmVtZW50IHRoZSBsYXN0IHdvcmQgaWYgaXQgaXMgemVyby5cclxuICAgICAgICBuID0gci5kLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgaWYgKGlzVHJ1bmNhdGVkICYmIHIuZFtuXSA9PT0gMCkgKytyLmRbbl07XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHggPSB4LnRpbWVzKHgpO1xyXG4gICAgICB0cnVuY2F0ZSh4LmQsIGspO1xyXG4gICAgfVxyXG5cclxuICAgIGV4dGVybmFsID0gdHJ1ZTtcclxuXHJcbiAgICByZXR1cm4gcjtcclxuICB9XHJcblxyXG5cclxuICBmdW5jdGlvbiBpc09kZChuKSB7XHJcbiAgICByZXR1cm4gbi5kW24uZC5sZW5ndGggLSAxXSAmIDE7XHJcbiAgfVxyXG5cclxuXHJcbiAgLypcclxuICAgKiBIYW5kbGUgYG1heGAgYW5kIGBtaW5gLiBgbHRndGAgaXMgJ2x0JyBvciAnZ3QnLlxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIG1heE9yTWluKEN0b3IsIGFyZ3MsIGx0Z3QpIHtcclxuICAgIHZhciB5LFxyXG4gICAgICB4ID0gbmV3IEN0b3IoYXJnc1swXSksXHJcbiAgICAgIGkgPSAwO1xyXG5cclxuICAgIGZvciAoOyArK2kgPCBhcmdzLmxlbmd0aDspIHtcclxuICAgICAgeSA9IG5ldyBDdG9yKGFyZ3NbaV0pO1xyXG4gICAgICBpZiAoIXkucykge1xyXG4gICAgICAgIHggPSB5O1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9IGVsc2UgaWYgKHhbbHRndF0oeSkpIHtcclxuICAgICAgICB4ID0geTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB4O1xyXG4gIH1cclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgdGhlIG5hdHVyYWwgZXhwb25lbnRpYWwgb2YgYHhgIHJvdW5kZWQgdG8gYHNkYCBzaWduaWZpY2FudFxyXG4gICAqIGRpZ2l0cy5cclxuICAgKlxyXG4gICAqIFRheWxvci9NYWNsYXVyaW4gc2VyaWVzLlxyXG4gICAqXHJcbiAgICogZXhwKHgpID0geF4wLzAhICsgeF4xLzEhICsgeF4yLzIhICsgeF4zLzMhICsgLi4uXHJcbiAgICpcclxuICAgKiBBcmd1bWVudCByZWR1Y3Rpb246XHJcbiAgICogICBSZXBlYXQgeCA9IHggLyAzMiwgayArPSA1LCB1bnRpbCB8eHwgPCAwLjFcclxuICAgKiAgIGV4cCh4KSA9IGV4cCh4IC8gMl5rKV4oMl5rKVxyXG4gICAqXHJcbiAgICogUHJldmlvdXNseSwgdGhlIGFyZ3VtZW50IHdhcyBpbml0aWFsbHkgcmVkdWNlZCBieVxyXG4gICAqIGV4cCh4KSA9IGV4cChyKSAqIDEwXmsgIHdoZXJlIHIgPSB4IC0gayAqIGxuMTAsIGsgPSBmbG9vcih4IC8gbG4xMClcclxuICAgKiB0byBmaXJzdCBwdXQgciBpbiB0aGUgcmFuZ2UgWzAsIGxuMTBdLCBiZWZvcmUgZGl2aWRpbmcgYnkgMzIgdW50aWwgfHh8IDwgMC4xLCBidXQgdGhpcyB3YXNcclxuICAgKiBmb3VuZCB0byBiZSBzbG93ZXIgdGhhbiBqdXN0IGRpdmlkaW5nIHJlcGVhdGVkbHkgYnkgMzIgYXMgYWJvdmUuXHJcbiAgICpcclxuICAgKiBNYXggaW50ZWdlciBhcmd1bWVudDogZXhwKCcyMDcyMzI2NTgzNjk0NjQxMycpID0gNi4zZSs5MDAwMDAwMDAwMDAwMDAwXHJcbiAgICogTWluIGludGVnZXIgYXJndW1lbnQ6IGV4cCgnLTIwNzIzMjY1ODM2OTQ2NDExJykgPSAxLjJlLTkwMDAwMDAwMDAwMDAwMDBcclxuICAgKiAoTWF0aCBvYmplY3QgaW50ZWdlciBtaW4vbWF4OiBNYXRoLmV4cCg3MDkpID0gOC4yZSszMDcsIE1hdGguZXhwKC03NDUpID0gNWUtMzI0KVxyXG4gICAqXHJcbiAgICogIGV4cChJbmZpbml0eSkgID0gSW5maW5pdHlcclxuICAgKiAgZXhwKC1JbmZpbml0eSkgPSAwXHJcbiAgICogIGV4cChOYU4pICAgICAgID0gTmFOXHJcbiAgICogIGV4cCjCsTApICAgICAgICA9IDFcclxuICAgKlxyXG4gICAqICBleHAoeCkgaXMgbm9uLXRlcm1pbmF0aW5nIGZvciBhbnkgZmluaXRlLCBub24temVybyB4LlxyXG4gICAqXHJcbiAgICogIFRoZSByZXN1bHQgd2lsbCBhbHdheXMgYmUgY29ycmVjdGx5IHJvdW5kZWQuXHJcbiAgICpcclxuICAgKi9cclxuICBmdW5jdGlvbiBuYXR1cmFsRXhwb25lbnRpYWwoeCwgc2QpIHtcclxuICAgIHZhciBkZW5vbWluYXRvciwgZ3VhcmQsIGosIHBvdywgc3VtLCB0LCB3cHIsXHJcbiAgICAgIHJlcCA9IDAsXHJcbiAgICAgIGkgPSAwLFxyXG4gICAgICBrID0gMCxcclxuICAgICAgQ3RvciA9IHguY29uc3RydWN0b3IsXHJcbiAgICAgIHJtID0gQ3Rvci5yb3VuZGluZyxcclxuICAgICAgcHIgPSBDdG9yLnByZWNpc2lvbjtcclxuXHJcbiAgICAvLyAwL05hTi9JbmZpbml0eT9cclxuICAgIGlmICgheC5kIHx8ICF4LmRbMF0gfHwgeC5lID4gMTcpIHtcclxuXHJcbiAgICAgIHJldHVybiBuZXcgQ3Rvcih4LmRcclxuICAgICAgICA/ICF4LmRbMF0gPyAxIDogeC5zIDwgMCA/IDAgOiAxIC8gMFxyXG4gICAgICAgIDogeC5zID8geC5zIDwgMCA/IDAgOiB4IDogMCAvIDApO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChzZCA9PSBudWxsKSB7XHJcbiAgICAgIGV4dGVybmFsID0gZmFsc2U7XHJcbiAgICAgIHdwciA9IHByO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgd3ByID0gc2Q7XHJcbiAgICB9XHJcblxyXG4gICAgdCA9IG5ldyBDdG9yKDAuMDMxMjUpO1xyXG5cclxuICAgIC8vIHdoaWxlIGFicyh4KSA+PSAwLjFcclxuICAgIHdoaWxlICh4LmUgPiAtMikge1xyXG5cclxuICAgICAgLy8geCA9IHggLyAyXjVcclxuICAgICAgeCA9IHgudGltZXModCk7XHJcbiAgICAgIGsgKz0gNTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBVc2UgMiAqIGxvZzEwKDJeaykgKyA1IChlbXBpcmljYWxseSBkZXJpdmVkKSB0byBlc3RpbWF0ZSB0aGUgaW5jcmVhc2UgaW4gcHJlY2lzaW9uXHJcbiAgICAvLyBuZWNlc3NhcnkgdG8gZW5zdXJlIHRoZSBmaXJzdCA0IHJvdW5kaW5nIGRpZ2l0cyBhcmUgY29ycmVjdC5cclxuICAgIGd1YXJkID0gTWF0aC5sb2cobWF0aHBvdygyLCBrKSkgLyBNYXRoLkxOMTAgKiAyICsgNSB8IDA7XHJcbiAgICB3cHIgKz0gZ3VhcmQ7XHJcbiAgICBkZW5vbWluYXRvciA9IHBvdyA9IHN1bSA9IG5ldyBDdG9yKDEpO1xyXG4gICAgQ3Rvci5wcmVjaXNpb24gPSB3cHI7XHJcblxyXG4gICAgZm9yICg7Oykge1xyXG4gICAgICBwb3cgPSBmaW5hbGlzZShwb3cudGltZXMoeCksIHdwciwgMSk7XHJcbiAgICAgIGRlbm9taW5hdG9yID0gZGVub21pbmF0b3IudGltZXMoKytpKTtcclxuICAgICAgdCA9IHN1bS5wbHVzKGRpdmlkZShwb3csIGRlbm9taW5hdG9yLCB3cHIsIDEpKTtcclxuXHJcbiAgICAgIGlmIChkaWdpdHNUb1N0cmluZyh0LmQpLnNsaWNlKDAsIHdwcikgPT09IGRpZ2l0c1RvU3RyaW5nKHN1bS5kKS5zbGljZSgwLCB3cHIpKSB7XHJcbiAgICAgICAgaiA9IGs7XHJcbiAgICAgICAgd2hpbGUgKGotLSkgc3VtID0gZmluYWxpc2Uoc3VtLnRpbWVzKHN1bSksIHdwciwgMSk7XHJcblxyXG4gICAgICAgIC8vIENoZWNrIHRvIHNlZSBpZiB0aGUgZmlyc3QgNCByb3VuZGluZyBkaWdpdHMgYXJlIFs0OV05OTkuXHJcbiAgICAgICAgLy8gSWYgc28sIHJlcGVhdCB0aGUgc3VtbWF0aW9uIHdpdGggYSBoaWdoZXIgcHJlY2lzaW9uLCBvdGhlcndpc2VcclxuICAgICAgICAvLyBlLmcuIHdpdGggcHJlY2lzaW9uOiAxOCwgcm91bmRpbmc6IDFcclxuICAgICAgICAvLyBleHAoMTguNDA0MjcyNDYyNTk1MDM0MDgzNTY3NzkzOTE5ODQzNzYxKSA9IDk4MzcyNTYwLjEyMjk5OTk5OTkgKHNob3VsZCBiZSA5ODM3MjU2MC4xMjMpXHJcbiAgICAgICAgLy8gYHdwciAtIGd1YXJkYCBpcyB0aGUgaW5kZXggb2YgZmlyc3Qgcm91bmRpbmcgZGlnaXQuXHJcbiAgICAgICAgaWYgKHNkID09IG51bGwpIHtcclxuXHJcbiAgICAgICAgICBpZiAocmVwIDwgMyAmJiBjaGVja1JvdW5kaW5nRGlnaXRzKHN1bS5kLCB3cHIgLSBndWFyZCwgcm0sIHJlcCkpIHtcclxuICAgICAgICAgICAgQ3Rvci5wcmVjaXNpb24gPSB3cHIgKz0gMTA7XHJcbiAgICAgICAgICAgIGRlbm9taW5hdG9yID0gcG93ID0gdCA9IG5ldyBDdG9yKDEpO1xyXG4gICAgICAgICAgICBpID0gMDtcclxuICAgICAgICAgICAgcmVwKys7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gZmluYWxpc2Uoc3VtLCBDdG9yLnByZWNpc2lvbiA9IHByLCBybSwgZXh0ZXJuYWwgPSB0cnVlKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgQ3Rvci5wcmVjaXNpb24gPSBwcjtcclxuICAgICAgICAgIHJldHVybiBzdW07XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBzdW0gPSB0O1xyXG4gICAgfVxyXG4gIH1cclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgdGhlIG5hdHVyYWwgbG9nYXJpdGhtIG9mIGB4YCByb3VuZGVkIHRvIGBzZGAgc2lnbmlmaWNhbnRcclxuICAgKiBkaWdpdHMuXHJcbiAgICpcclxuICAgKiAgbG4oLW4pICAgICAgICA9IE5hTlxyXG4gICAqICBsbigwKSAgICAgICAgID0gLUluZmluaXR5XHJcbiAgICogIGxuKC0wKSAgICAgICAgPSAtSW5maW5pdHlcclxuICAgKiAgbG4oMSkgICAgICAgICA9IDBcclxuICAgKiAgbG4oSW5maW5pdHkpICA9IEluZmluaXR5XHJcbiAgICogIGxuKC1JbmZpbml0eSkgPSBOYU5cclxuICAgKiAgbG4oTmFOKSAgICAgICA9IE5hTlxyXG4gICAqXHJcbiAgICogIGxuKG4pIChuICE9IDEpIGlzIG5vbi10ZXJtaW5hdGluZy5cclxuICAgKlxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIG5hdHVyYWxMb2dhcml0aG0oeSwgc2QpIHtcclxuICAgIHZhciBjLCBjMCwgZGVub21pbmF0b3IsIGUsIG51bWVyYXRvciwgcmVwLCBzdW0sIHQsIHdwciwgeDEsIHgyLFxyXG4gICAgICBuID0gMSxcclxuICAgICAgZ3VhcmQgPSAxMCxcclxuICAgICAgeCA9IHksXHJcbiAgICAgIHhkID0geC5kLFxyXG4gICAgICBDdG9yID0geC5jb25zdHJ1Y3RvcixcclxuICAgICAgcm0gPSBDdG9yLnJvdW5kaW5nLFxyXG4gICAgICBwciA9IEN0b3IucHJlY2lzaW9uO1xyXG5cclxuICAgIC8vIElzIHggbmVnYXRpdmUgb3IgSW5maW5pdHksIE5hTiwgMCBvciAxP1xyXG4gICAgaWYgKHgucyA8IDAgfHwgIXhkIHx8ICF4ZFswXSB8fCAheC5lICYmIHhkWzBdID09IDEgJiYgeGQubGVuZ3RoID09IDEpIHtcclxuICAgICAgcmV0dXJuIG5ldyBDdG9yKHhkICYmICF4ZFswXSA/IC0xIC8gMCA6IHgucyAhPSAxID8gTmFOIDogeGQgPyAwIDogeCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHNkID09IG51bGwpIHtcclxuICAgICAgZXh0ZXJuYWwgPSBmYWxzZTtcclxuICAgICAgd3ByID0gcHI7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB3cHIgPSBzZDtcclxuICAgIH1cclxuXHJcbiAgICBDdG9yLnByZWNpc2lvbiA9IHdwciArPSBndWFyZDtcclxuICAgIGMgPSBkaWdpdHNUb1N0cmluZyh4ZCk7XHJcbiAgICBjMCA9IGMuY2hhckF0KDApO1xyXG5cclxuICAgIGlmIChNYXRoLmFicyhlID0geC5lKSA8IDEuNWUxNSkge1xyXG5cclxuICAgICAgLy8gQXJndW1lbnQgcmVkdWN0aW9uLlxyXG4gICAgICAvLyBUaGUgc2VyaWVzIGNvbnZlcmdlcyBmYXN0ZXIgdGhlIGNsb3NlciB0aGUgYXJndW1lbnQgaXMgdG8gMSwgc28gdXNpbmdcclxuICAgICAgLy8gbG4oYV5iKSA9IGIgKiBsbihhKSwgICBsbihhKSA9IGxuKGFeYikgLyBiXHJcbiAgICAgIC8vIG11bHRpcGx5IHRoZSBhcmd1bWVudCBieSBpdHNlbGYgdW50aWwgdGhlIGxlYWRpbmcgZGlnaXRzIG9mIHRoZSBzaWduaWZpY2FuZCBhcmUgNywgOCwgOSxcclxuICAgICAgLy8gMTAsIDExLCAxMiBvciAxMywgcmVjb3JkaW5nIHRoZSBudW1iZXIgb2YgbXVsdGlwbGljYXRpb25zIHNvIHRoZSBzdW0gb2YgdGhlIHNlcmllcyBjYW5cclxuICAgICAgLy8gbGF0ZXIgYmUgZGl2aWRlZCBieSB0aGlzIG51bWJlciwgdGhlbiBzZXBhcmF0ZSBvdXQgdGhlIHBvd2VyIG9mIDEwIHVzaW5nXHJcbiAgICAgIC8vIGxuKGEqMTBeYikgPSBsbihhKSArIGIqbG4oMTApLlxyXG5cclxuICAgICAgLy8gbWF4IG4gaXMgMjEgKGdpdmVzIDAuOSwgMS4wIG9yIDEuMSkgKDllMTUgLyAyMSA9IDQuMmUxNCkuXHJcbiAgICAgIC8vd2hpbGUgKGMwIDwgOSAmJiBjMCAhPSAxIHx8IGMwID09IDEgJiYgYy5jaGFyQXQoMSkgPiAxKSB7XHJcbiAgICAgIC8vIG1heCBuIGlzIDYgKGdpdmVzIDAuNyAtIDEuMylcclxuICAgICAgd2hpbGUgKGMwIDwgNyAmJiBjMCAhPSAxIHx8IGMwID09IDEgJiYgYy5jaGFyQXQoMSkgPiAzKSB7XHJcbiAgICAgICAgeCA9IHgudGltZXMoeSk7XHJcbiAgICAgICAgYyA9IGRpZ2l0c1RvU3RyaW5nKHguZCk7XHJcbiAgICAgICAgYzAgPSBjLmNoYXJBdCgwKTtcclxuICAgICAgICBuKys7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGUgPSB4LmU7XHJcblxyXG4gICAgICBpZiAoYzAgPiAxKSB7XHJcbiAgICAgICAgeCA9IG5ldyBDdG9yKCcwLicgKyBjKTtcclxuICAgICAgICBlKys7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgeCA9IG5ldyBDdG9yKGMwICsgJy4nICsgYy5zbGljZSgxKSk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAvLyBUaGUgYXJndW1lbnQgcmVkdWN0aW9uIG1ldGhvZCBhYm92ZSBtYXkgcmVzdWx0IGluIG92ZXJmbG93IGlmIHRoZSBhcmd1bWVudCB5IGlzIGEgbWFzc2l2ZVxyXG4gICAgICAvLyBudW1iZXIgd2l0aCBleHBvbmVudCA+PSAxNTAwMDAwMDAwMDAwMDAwICg5ZTE1IC8gNiA9IDEuNWUxNSksIHNvIGluc3RlYWQgcmVjYWxsIHRoaXNcclxuICAgICAgLy8gZnVuY3Rpb24gdXNpbmcgbG4oeCoxMF5lKSA9IGxuKHgpICsgZSpsbigxMCkuXHJcbiAgICAgIHQgPSBnZXRMbjEwKEN0b3IsIHdwciArIDIsIHByKS50aW1lcyhlICsgJycpO1xyXG4gICAgICB4ID0gbmF0dXJhbExvZ2FyaXRobShuZXcgQ3RvcihjMCArICcuJyArIGMuc2xpY2UoMSkpLCB3cHIgLSBndWFyZCkucGx1cyh0KTtcclxuICAgICAgQ3Rvci5wcmVjaXNpb24gPSBwcjtcclxuXHJcbiAgICAgIHJldHVybiBzZCA9PSBudWxsID8gZmluYWxpc2UoeCwgcHIsIHJtLCBleHRlcm5hbCA9IHRydWUpIDogeDtcclxuICAgIH1cclxuXHJcbiAgICAvLyB4MSBpcyB4IHJlZHVjZWQgdG8gYSB2YWx1ZSBuZWFyIDEuXHJcbiAgICB4MSA9IHg7XHJcblxyXG4gICAgLy8gVGF5bG9yIHNlcmllcy5cclxuICAgIC8vIGxuKHkpID0gbG4oKDEgKyB4KS8oMSAtIHgpKSA9IDIoeCArIHheMy8zICsgeF41LzUgKyB4XjcvNyArIC4uLilcclxuICAgIC8vIHdoZXJlIHggPSAoeSAtIDEpLyh5ICsgMSkgICAgKHx4fCA8IDEpXHJcbiAgICBzdW0gPSBudW1lcmF0b3IgPSB4ID0gZGl2aWRlKHgubWludXMoMSksIHgucGx1cygxKSwgd3ByLCAxKTtcclxuICAgIHgyID0gZmluYWxpc2UoeC50aW1lcyh4KSwgd3ByLCAxKTtcclxuICAgIGRlbm9taW5hdG9yID0gMztcclxuXHJcbiAgICBmb3IgKDs7KSB7XHJcbiAgICAgIG51bWVyYXRvciA9IGZpbmFsaXNlKG51bWVyYXRvci50aW1lcyh4MiksIHdwciwgMSk7XHJcbiAgICAgIHQgPSBzdW0ucGx1cyhkaXZpZGUobnVtZXJhdG9yLCBuZXcgQ3RvcihkZW5vbWluYXRvciksIHdwciwgMSkpO1xyXG5cclxuICAgICAgaWYgKGRpZ2l0c1RvU3RyaW5nKHQuZCkuc2xpY2UoMCwgd3ByKSA9PT0gZGlnaXRzVG9TdHJpbmcoc3VtLmQpLnNsaWNlKDAsIHdwcikpIHtcclxuICAgICAgICBzdW0gPSBzdW0udGltZXMoMik7XHJcblxyXG4gICAgICAgIC8vIFJldmVyc2UgdGhlIGFyZ3VtZW50IHJlZHVjdGlvbi4gQ2hlY2sgdGhhdCBlIGlzIG5vdCAwIGJlY2F1c2UsIGJlc2lkZXMgcHJldmVudGluZyBhblxyXG4gICAgICAgIC8vIHVubmVjZXNzYXJ5IGNhbGN1bGF0aW9uLCAtMCArIDAgPSArMCBhbmQgdG8gZW5zdXJlIGNvcnJlY3Qgcm91bmRpbmcgLTAgbmVlZHMgdG8gc3RheSAtMC5cclxuICAgICAgICBpZiAoZSAhPT0gMCkgc3VtID0gc3VtLnBsdXMoZ2V0TG4xMChDdG9yLCB3cHIgKyAyLCBwcikudGltZXMoZSArICcnKSk7XHJcbiAgICAgICAgc3VtID0gZGl2aWRlKHN1bSwgbmV3IEN0b3IobiksIHdwciwgMSk7XHJcblxyXG4gICAgICAgIC8vIElzIHJtID4gMyBhbmQgdGhlIGZpcnN0IDQgcm91bmRpbmcgZGlnaXRzIDQ5OTksIG9yIHJtIDwgNCAob3IgdGhlIHN1bW1hdGlvbiBoYXNcclxuICAgICAgICAvLyBiZWVuIHJlcGVhdGVkIHByZXZpb3VzbHkpIGFuZCB0aGUgZmlyc3QgNCByb3VuZGluZyBkaWdpdHMgOTk5OT9cclxuICAgICAgICAvLyBJZiBzbywgcmVzdGFydCB0aGUgc3VtbWF0aW9uIHdpdGggYSBoaWdoZXIgcHJlY2lzaW9uLCBvdGhlcndpc2VcclxuICAgICAgICAvLyBlLmcuIHdpdGggcHJlY2lzaW9uOiAxMiwgcm91bmRpbmc6IDFcclxuICAgICAgICAvLyBsbigxMzU1MjAwMjguNjEyNjA5MTcxNDI2NTM4MTUzMykgPSAxOC43MjQ2Mjk5OTk5IHdoZW4gaXQgc2hvdWxkIGJlIDE4LjcyNDYzLlxyXG4gICAgICAgIC8vIGB3cHIgLSBndWFyZGAgaXMgdGhlIGluZGV4IG9mIGZpcnN0IHJvdW5kaW5nIGRpZ2l0LlxyXG4gICAgICAgIGlmIChzZCA9PSBudWxsKSB7XHJcbiAgICAgICAgICBpZiAoY2hlY2tSb3VuZGluZ0RpZ2l0cyhzdW0uZCwgd3ByIC0gZ3VhcmQsIHJtLCByZXApKSB7XHJcbiAgICAgICAgICAgIEN0b3IucHJlY2lzaW9uID0gd3ByICs9IGd1YXJkO1xyXG4gICAgICAgICAgICB0ID0gbnVtZXJhdG9yID0geCA9IGRpdmlkZSh4MS5taW51cygxKSwgeDEucGx1cygxKSwgd3ByLCAxKTtcclxuICAgICAgICAgICAgeDIgPSBmaW5hbGlzZSh4LnRpbWVzKHgpLCB3cHIsIDEpO1xyXG4gICAgICAgICAgICBkZW5vbWluYXRvciA9IHJlcCA9IDE7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gZmluYWxpc2Uoc3VtLCBDdG9yLnByZWNpc2lvbiA9IHByLCBybSwgZXh0ZXJuYWwgPSB0cnVlKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgQ3Rvci5wcmVjaXNpb24gPSBwcjtcclxuICAgICAgICAgIHJldHVybiBzdW07XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBzdW0gPSB0O1xyXG4gICAgICBkZW5vbWluYXRvciArPSAyO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcblxyXG4gIC8vIMKxSW5maW5pdHksIE5hTi5cclxuICBmdW5jdGlvbiBub25GaW5pdGVUb1N0cmluZyh4KSB7XHJcbiAgICAvLyBVbnNpZ25lZC5cclxuICAgIHJldHVybiBTdHJpbmcoeC5zICogeC5zIC8gMCk7XHJcbiAgfVxyXG5cclxuXHJcbiAgLypcclxuICAgKiBQYXJzZSB0aGUgdmFsdWUgb2YgYSBuZXcgRGVjaW1hbCBgeGAgZnJvbSBzdHJpbmcgYHN0cmAuXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gcGFyc2VEZWNpbWFsKHgsIHN0cikge1xyXG4gICAgdmFyIGUsIGksIGxlbjtcclxuXHJcbiAgICAvLyBEZWNpbWFsIHBvaW50P1xyXG4gICAgaWYgKChlID0gc3RyLmluZGV4T2YoJy4nKSkgPiAtMSkgc3RyID0gc3RyLnJlcGxhY2UoJy4nLCAnJyk7XHJcblxyXG4gICAgLy8gRXhwb25lbnRpYWwgZm9ybT9cclxuICAgIGlmICgoaSA9IHN0ci5zZWFyY2goL2UvaSkpID4gMCkge1xyXG5cclxuICAgICAgLy8gRGV0ZXJtaW5lIGV4cG9uZW50LlxyXG4gICAgICBpZiAoZSA8IDApIGUgPSBpO1xyXG4gICAgICBlICs9ICtzdHIuc2xpY2UoaSArIDEpO1xyXG4gICAgICBzdHIgPSBzdHIuc3Vic3RyaW5nKDAsIGkpO1xyXG4gICAgfSBlbHNlIGlmIChlIDwgMCkge1xyXG5cclxuICAgICAgLy8gSW50ZWdlci5cclxuICAgICAgZSA9IHN0ci5sZW5ndGg7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gRGV0ZXJtaW5lIGxlYWRpbmcgemVyb3MuXHJcbiAgICBmb3IgKGkgPSAwOyBzdHIuY2hhckNvZGVBdChpKSA9PT0gNDg7IGkrKyk7XHJcblxyXG4gICAgLy8gRGV0ZXJtaW5lIHRyYWlsaW5nIHplcm9zLlxyXG4gICAgZm9yIChsZW4gPSBzdHIubGVuZ3RoOyBzdHIuY2hhckNvZGVBdChsZW4gLSAxKSA9PT0gNDg7IC0tbGVuKTtcclxuICAgIHN0ciA9IHN0ci5zbGljZShpLCBsZW4pO1xyXG5cclxuICAgIGlmIChzdHIpIHtcclxuICAgICAgbGVuIC09IGk7XHJcbiAgICAgIHguZSA9IGUgPSBlIC0gaSAtIDE7XHJcbiAgICAgIHguZCA9IFtdO1xyXG5cclxuICAgICAgLy8gVHJhbnNmb3JtIGJhc2VcclxuXHJcbiAgICAgIC8vIGUgaXMgdGhlIGJhc2UgMTAgZXhwb25lbnQuXHJcbiAgICAgIC8vIGkgaXMgd2hlcmUgdG8gc2xpY2Ugc3RyIHRvIGdldCB0aGUgZmlyc3Qgd29yZCBvZiB0aGUgZGlnaXRzIGFycmF5LlxyXG4gICAgICBpID0gKGUgKyAxKSAlIExPR19CQVNFO1xyXG4gICAgICBpZiAoZSA8IDApIGkgKz0gTE9HX0JBU0U7XHJcblxyXG4gICAgICBpZiAoaSA8IGxlbikge1xyXG4gICAgICAgIGlmIChpKSB4LmQucHVzaCgrc3RyLnNsaWNlKDAsIGkpKTtcclxuICAgICAgICBmb3IgKGxlbiAtPSBMT0dfQkFTRTsgaSA8IGxlbjspIHguZC5wdXNoKCtzdHIuc2xpY2UoaSwgaSArPSBMT0dfQkFTRSkpO1xyXG4gICAgICAgIHN0ciA9IHN0ci5zbGljZShpKTtcclxuICAgICAgICBpID0gTE9HX0JBU0UgLSBzdHIubGVuZ3RoO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGkgLT0gbGVuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmb3IgKDsgaS0tOykgc3RyICs9ICcwJztcclxuICAgICAgeC5kLnB1c2goK3N0cik7XHJcblxyXG4gICAgICBpZiAoZXh0ZXJuYWwpIHtcclxuXHJcbiAgICAgICAgLy8gT3ZlcmZsb3c/XHJcbiAgICAgICAgaWYgKHguZSA+IHguY29uc3RydWN0b3IubWF4RSkge1xyXG5cclxuICAgICAgICAgIC8vIEluZmluaXR5LlxyXG4gICAgICAgICAgeC5kID0gbnVsbDtcclxuICAgICAgICAgIHguZSA9IE5hTjtcclxuXHJcbiAgICAgICAgLy8gVW5kZXJmbG93P1xyXG4gICAgICAgIH0gZWxzZSBpZiAoeC5lIDwgeC5jb25zdHJ1Y3Rvci5taW5FKSB7XHJcblxyXG4gICAgICAgICAgLy8gWmVyby5cclxuICAgICAgICAgIHguZSA9IDA7XHJcbiAgICAgICAgICB4LmQgPSBbMF07XHJcbiAgICAgICAgICAvLyB4LmNvbnN0cnVjdG9yLnVuZGVyZmxvdyA9IHRydWU7XHJcbiAgICAgICAgfSAvLyBlbHNlIHguY29uc3RydWN0b3IudW5kZXJmbG93ID0gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAvLyBaZXJvLlxyXG4gICAgICB4LmUgPSAwO1xyXG4gICAgICB4LmQgPSBbMF07XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHg7XHJcbiAgfVxyXG5cclxuXHJcbiAgLypcclxuICAgKiBQYXJzZSB0aGUgdmFsdWUgb2YgYSBuZXcgRGVjaW1hbCBgeGAgZnJvbSBhIHN0cmluZyBgc3RyYCwgd2hpY2ggaXMgbm90IGEgZGVjaW1hbCB2YWx1ZS5cclxuICAgKi9cclxuICBmdW5jdGlvbiBwYXJzZU90aGVyKHgsIHN0cikge1xyXG4gICAgdmFyIGJhc2UsIEN0b3IsIGRpdmlzb3IsIGksIGlzRmxvYXQsIGxlbiwgcCwgeGQsIHhlO1xyXG5cclxuICAgIGlmIChzdHIgPT09ICdJbmZpbml0eScgfHwgc3RyID09PSAnTmFOJykge1xyXG4gICAgICBpZiAoIStzdHIpIHgucyA9IE5hTjtcclxuICAgICAgeC5lID0gTmFOO1xyXG4gICAgICB4LmQgPSBudWxsO1xyXG4gICAgICByZXR1cm4geDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoaXNIZXgudGVzdChzdHIpKSAge1xyXG4gICAgICBiYXNlID0gMTY7XHJcbiAgICAgIHN0ciA9IHN0ci50b0xvd2VyQ2FzZSgpO1xyXG4gICAgfSBlbHNlIGlmIChpc0JpbmFyeS50ZXN0KHN0cikpICB7XHJcbiAgICAgIGJhc2UgPSAyO1xyXG4gICAgfSBlbHNlIGlmIChpc09jdGFsLnRlc3Qoc3RyKSkgIHtcclxuICAgICAgYmFzZSA9IDg7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aHJvdyBFcnJvcihpbnZhbGlkQXJndW1lbnQgKyBzdHIpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIElzIHRoZXJlIGEgYmluYXJ5IGV4cG9uZW50IHBhcnQ/XHJcbiAgICBpID0gc3RyLnNlYXJjaCgvcC9pKTtcclxuXHJcbiAgICBpZiAoaSA+IDApIHtcclxuICAgICAgcCA9ICtzdHIuc2xpY2UoaSArIDEpO1xyXG4gICAgICBzdHIgPSBzdHIuc3Vic3RyaW5nKDIsIGkpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc3RyID0gc3RyLnNsaWNlKDIpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENvbnZlcnQgYHN0cmAgYXMgYW4gaW50ZWdlciB0aGVuIGRpdmlkZSB0aGUgcmVzdWx0IGJ5IGBiYXNlYCByYWlzZWQgdG8gYSBwb3dlciBzdWNoIHRoYXQgdGhlXHJcbiAgICAvLyBmcmFjdGlvbiBwYXJ0IHdpbGwgYmUgcmVzdG9yZWQuXHJcbiAgICBpID0gc3RyLmluZGV4T2YoJy4nKTtcclxuICAgIGlzRmxvYXQgPSBpID49IDA7XHJcbiAgICBDdG9yID0geC5jb25zdHJ1Y3RvcjtcclxuXHJcbiAgICBpZiAoaXNGbG9hdCkge1xyXG4gICAgICBzdHIgPSBzdHIucmVwbGFjZSgnLicsICcnKTtcclxuICAgICAgbGVuID0gc3RyLmxlbmd0aDtcclxuICAgICAgaSA9IGxlbiAtIGk7XHJcblxyXG4gICAgICAvLyBsb2dbMTBdKDE2KSA9IDEuMjA0MS4uLiAsIGxvZ1sxMF0oODgpID0gMS45NDQ0Li4uLlxyXG4gICAgICBkaXZpc29yID0gaW50UG93KEN0b3IsIG5ldyBDdG9yKGJhc2UpLCBpLCBpICogMik7XHJcbiAgICB9XHJcblxyXG4gICAgeGQgPSBjb252ZXJ0QmFzZShzdHIsIGJhc2UsIEJBU0UpO1xyXG4gICAgeGUgPSB4ZC5sZW5ndGggLSAxO1xyXG5cclxuICAgIC8vIFJlbW92ZSB0cmFpbGluZyB6ZXJvcy5cclxuICAgIGZvciAoaSA9IHhlOyB4ZFtpXSA9PT0gMDsgLS1pKSB4ZC5wb3AoKTtcclxuICAgIGlmIChpIDwgMCkgcmV0dXJuIG5ldyBDdG9yKHgucyAqIDApO1xyXG4gICAgeC5lID0gZ2V0QmFzZTEwRXhwb25lbnQoeGQsIHhlKTtcclxuICAgIHguZCA9IHhkO1xyXG4gICAgZXh0ZXJuYWwgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBBdCB3aGF0IHByZWNpc2lvbiB0byBwZXJmb3JtIHRoZSBkaXZpc2lvbiB0byBlbnN1cmUgZXhhY3QgY29udmVyc2lvbj9cclxuICAgIC8vIG1heERlY2ltYWxJbnRlZ2VyUGFydERpZ2l0Q291bnQgPSBjZWlsKGxvZ1sxMF0oYikgKiBvdGhlckJhc2VJbnRlZ2VyUGFydERpZ2l0Q291bnQpXHJcbiAgICAvLyBsb2dbMTBdKDIpID0gMC4zMDEwMywgbG9nWzEwXSg4KSA9IDAuOTAzMDksIGxvZ1sxMF0oMTYpID0gMS4yMDQxMlxyXG4gICAgLy8gRS5nLiBjZWlsKDEuMiAqIDMpID0gNCwgc28gdXAgdG8gNCBkZWNpbWFsIGRpZ2l0cyBhcmUgbmVlZGVkIHRvIHJlcHJlc2VudCAzIGhleCBpbnQgZGlnaXRzLlxyXG4gICAgLy8gbWF4RGVjaW1hbEZyYWN0aW9uUGFydERpZ2l0Q291bnQgPSB7SGV4OjR8T2N0OjN8QmluOjF9ICogb3RoZXJCYXNlRnJhY3Rpb25QYXJ0RGlnaXRDb3VudFxyXG4gICAgLy8gVGhlcmVmb3JlIHVzaW5nIDQgKiB0aGUgbnVtYmVyIG9mIGRpZ2l0cyBvZiBzdHIgd2lsbCBhbHdheXMgYmUgZW5vdWdoLlxyXG4gICAgaWYgKGlzRmxvYXQpIHggPSBkaXZpZGUoeCwgZGl2aXNvciwgbGVuICogNCk7XHJcblxyXG4gICAgLy8gTXVsdGlwbHkgYnkgdGhlIGJpbmFyeSBleHBvbmVudCBwYXJ0IGlmIHByZXNlbnQuXHJcbiAgICBpZiAocCkgeCA9IHgudGltZXMoTWF0aC5hYnMocCkgPCA1NCA/IG1hdGhwb3coMiwgcCkgOiBEZWNpbWFsLnBvdygyLCBwKSk7XHJcbiAgICBleHRlcm5hbCA9IHRydWU7XHJcblxyXG4gICAgcmV0dXJuIHg7XHJcbiAgfVxyXG5cclxuXHJcbiAgLypcclxuICAgKiBzaW4oeCkgPSB4IC0geF4zLzMhICsgeF41LzUhIC0gLi4uXHJcbiAgICogfHh8IDwgcGkvMlxyXG4gICAqXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gc2luZShDdG9yLCB4KSB7XHJcbiAgICB2YXIgayxcclxuICAgICAgbGVuID0geC5kLmxlbmd0aDtcclxuXHJcbiAgICBpZiAobGVuIDwgMykgcmV0dXJuIHRheWxvclNlcmllcyhDdG9yLCAyLCB4LCB4KTtcclxuXHJcbiAgICAvLyBBcmd1bWVudCByZWR1Y3Rpb246IHNpbig1eCkgPSAxNipzaW5eNSh4KSAtIDIwKnNpbl4zKHgpICsgNSpzaW4oeClcclxuICAgIC8vIGkuZS4gc2luKHgpID0gMTYqc2luXjUoeC81KSAtIDIwKnNpbl4zKHgvNSkgKyA1KnNpbih4LzUpXHJcbiAgICAvLyBhbmQgIHNpbih4KSA9IHNpbih4LzUpKDUgKyBzaW5eMih4LzUpKDE2c2luXjIoeC81KSAtIDIwKSlcclxuXHJcbiAgICAvLyBFc3RpbWF0ZSB0aGUgb3B0aW11bSBudW1iZXIgb2YgdGltZXMgdG8gdXNlIHRoZSBhcmd1bWVudCByZWR1Y3Rpb24uXHJcbiAgICBrID0gMS40ICogTWF0aC5zcXJ0KGxlbik7XHJcbiAgICBrID0gayA+IDE2ID8gMTYgOiBrIHwgMDtcclxuXHJcbiAgICB4ID0geC50aW1lcygxIC8gdGlueVBvdyg1LCBrKSk7XHJcbiAgICB4ID0gdGF5bG9yU2VyaWVzKEN0b3IsIDIsIHgsIHgpO1xyXG5cclxuICAgIC8vIFJldmVyc2UgYXJndW1lbnQgcmVkdWN0aW9uXHJcbiAgICB2YXIgc2luMl94LFxyXG4gICAgICBkNSA9IG5ldyBDdG9yKDUpLFxyXG4gICAgICBkMTYgPSBuZXcgQ3RvcigxNiksXHJcbiAgICAgIGQyMCA9IG5ldyBDdG9yKDIwKTtcclxuICAgIGZvciAoOyBrLS07KSB7XHJcbiAgICAgIHNpbjJfeCA9IHgudGltZXMoeCk7XHJcbiAgICAgIHggPSB4LnRpbWVzKGQ1LnBsdXMoc2luMl94LnRpbWVzKGQxNi50aW1lcyhzaW4yX3gpLm1pbnVzKGQyMCkpKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHg7XHJcbiAgfVxyXG5cclxuXHJcbiAgLy8gQ2FsY3VsYXRlIFRheWxvciBzZXJpZXMgZm9yIGBjb3NgLCBgY29zaGAsIGBzaW5gIGFuZCBgc2luaGAuXHJcbiAgZnVuY3Rpb24gdGF5bG9yU2VyaWVzKEN0b3IsIG4sIHgsIHksIGlzSHlwZXJib2xpYykge1xyXG4gICAgdmFyIGosIHQsIHUsIHgyLFxyXG4gICAgICBpID0gMSxcclxuICAgICAgcHIgPSBDdG9yLnByZWNpc2lvbixcclxuICAgICAgayA9IE1hdGguY2VpbChwciAvIExPR19CQVNFKTtcclxuXHJcbiAgICBleHRlcm5hbCA9IGZhbHNlO1xyXG4gICAgeDIgPSB4LnRpbWVzKHgpO1xyXG4gICAgdSA9IG5ldyBDdG9yKHkpO1xyXG5cclxuICAgIGZvciAoOzspIHtcclxuICAgICAgdCA9IGRpdmlkZSh1LnRpbWVzKHgyKSwgbmV3IEN0b3IobisrICogbisrKSwgcHIsIDEpO1xyXG4gICAgICB1ID0gaXNIeXBlcmJvbGljID8geS5wbHVzKHQpIDogeS5taW51cyh0KTtcclxuICAgICAgeSA9IGRpdmlkZSh0LnRpbWVzKHgyKSwgbmV3IEN0b3IobisrICogbisrKSwgcHIsIDEpO1xyXG4gICAgICB0ID0gdS5wbHVzKHkpO1xyXG5cclxuICAgICAgaWYgKHQuZFtrXSAhPT0gdm9pZCAwKSB7XHJcbiAgICAgICAgZm9yIChqID0gazsgdC5kW2pdID09PSB1LmRbal0gJiYgai0tOyk7XHJcbiAgICAgICAgaWYgKGogPT0gLTEpIGJyZWFrO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBqID0gdTtcclxuICAgICAgdSA9IHk7XHJcbiAgICAgIHkgPSB0O1xyXG4gICAgICB0ID0gajtcclxuICAgICAgaSsrO1xyXG4gICAgfVxyXG5cclxuICAgIGV4dGVybmFsID0gdHJ1ZTtcclxuICAgIHQuZC5sZW5ndGggPSBrICsgMTtcclxuXHJcbiAgICByZXR1cm4gdDtcclxuICB9XHJcblxyXG5cclxuICAvLyBFeHBvbmVudCBlIG11c3QgYmUgcG9zaXRpdmUgYW5kIG5vbi16ZXJvLlxyXG4gIGZ1bmN0aW9uIHRpbnlQb3coYiwgZSkge1xyXG4gICAgdmFyIG4gPSBiO1xyXG4gICAgd2hpbGUgKC0tZSkgbiAqPSBiO1xyXG4gICAgcmV0dXJuIG47XHJcbiAgfVxyXG5cclxuXHJcbiAgLy8gUmV0dXJuIHRoZSBhYnNvbHV0ZSB2YWx1ZSBvZiBgeGAgcmVkdWNlZCB0byBsZXNzIHRoYW4gb3IgZXF1YWwgdG8gaGFsZiBwaS5cclxuICBmdW5jdGlvbiB0b0xlc3NUaGFuSGFsZlBpKEN0b3IsIHgpIHtcclxuICAgIHZhciB0LFxyXG4gICAgICBpc05lZyA9IHgucyA8IDAsXHJcbiAgICAgIHBpID0gZ2V0UGkoQ3RvciwgQ3Rvci5wcmVjaXNpb24sIDEpLFxyXG4gICAgICBoYWxmUGkgPSBwaS50aW1lcygwLjUpO1xyXG5cclxuICAgIHggPSB4LmFicygpO1xyXG5cclxuICAgIGlmICh4Lmx0ZShoYWxmUGkpKSB7XHJcbiAgICAgIHF1YWRyYW50ID0gaXNOZWcgPyA0IDogMTtcclxuICAgICAgcmV0dXJuIHg7XHJcbiAgICB9XHJcblxyXG4gICAgdCA9IHguZGl2VG9JbnQocGkpO1xyXG5cclxuICAgIGlmICh0LmlzWmVybygpKSB7XHJcbiAgICAgIHF1YWRyYW50ID0gaXNOZWcgPyAzIDogMjtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHggPSB4Lm1pbnVzKHQudGltZXMocGkpKTtcclxuXHJcbiAgICAgIC8vIDAgPD0geCA8IHBpXHJcbiAgICAgIGlmICh4Lmx0ZShoYWxmUGkpKSB7XHJcbiAgICAgICAgcXVhZHJhbnQgPSBpc09kZCh0KSA/IChpc05lZyA/IDIgOiAzKSA6IChpc05lZyA/IDQgOiAxKTtcclxuICAgICAgICByZXR1cm4geDtcclxuICAgICAgfVxyXG5cclxuICAgICAgcXVhZHJhbnQgPSBpc09kZCh0KSA/IChpc05lZyA/IDEgOiA0KSA6IChpc05lZyA/IDMgOiAyKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4geC5taW51cyhwaSkuYWJzKCk7XHJcbiAgfVxyXG5cclxuXHJcbiAgLypcclxuICAgKiBSZXR1cm4gdGhlIHZhbHVlIG9mIERlY2ltYWwgYHhgIGFzIGEgc3RyaW5nIGluIGJhc2UgYGJhc2VPdXRgLlxyXG4gICAqXHJcbiAgICogSWYgdGhlIG9wdGlvbmFsIGBzZGAgYXJndW1lbnQgaXMgcHJlc2VudCBpbmNsdWRlIGEgYmluYXJ5IGV4cG9uZW50IHN1ZmZpeC5cclxuICAgKi9cclxuICBmdW5jdGlvbiB0b1N0cmluZ0JpbmFyeSh4LCBiYXNlT3V0LCBzZCwgcm0pIHtcclxuICAgIHZhciBiYXNlLCBlLCBpLCBrLCBsZW4sIHJvdW5kVXAsIHN0ciwgeGQsIHksXHJcbiAgICAgIEN0b3IgPSB4LmNvbnN0cnVjdG9yLFxyXG4gICAgICBpc0V4cCA9IHNkICE9PSB2b2lkIDA7XHJcblxyXG4gICAgaWYgKGlzRXhwKSB7XHJcbiAgICAgIGNoZWNrSW50MzIoc2QsIDEsIE1BWF9ESUdJVFMpO1xyXG4gICAgICBpZiAocm0gPT09IHZvaWQgMCkgcm0gPSBDdG9yLnJvdW5kaW5nO1xyXG4gICAgICBlbHNlIGNoZWNrSW50MzIocm0sIDAsIDgpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc2QgPSBDdG9yLnByZWNpc2lvbjtcclxuICAgICAgcm0gPSBDdG9yLnJvdW5kaW5nO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICgheC5pc0Zpbml0ZSgpKSB7XHJcbiAgICAgIHN0ciA9IG5vbkZpbml0ZVRvU3RyaW5nKHgpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc3RyID0gZmluaXRlVG9TdHJpbmcoeCk7XHJcbiAgICAgIGkgPSBzdHIuaW5kZXhPZignLicpO1xyXG5cclxuICAgICAgLy8gVXNlIGV4cG9uZW50aWFsIG5vdGF0aW9uIGFjY29yZGluZyB0byBgdG9FeHBQb3NgIGFuZCBgdG9FeHBOZWdgPyBObywgYnV0IGlmIHJlcXVpcmVkOlxyXG4gICAgICAvLyBtYXhCaW5hcnlFeHBvbmVudCA9IGZsb29yKChkZWNpbWFsRXhwb25lbnQgKyAxKSAqIGxvZ1syXSgxMCkpXHJcbiAgICAgIC8vIG1pbkJpbmFyeUV4cG9uZW50ID0gZmxvb3IoZGVjaW1hbEV4cG9uZW50ICogbG9nWzJdKDEwKSlcclxuICAgICAgLy8gbG9nWzJdKDEwKSA9IDMuMzIxOTI4MDk0ODg3MzYyMzQ3ODcwMzE5NDI5NDg5MzkwMTc1ODY0XHJcblxyXG4gICAgICBpZiAoaXNFeHApIHtcclxuICAgICAgICBiYXNlID0gMjtcclxuICAgICAgICBpZiAoYmFzZU91dCA9PSAxNikge1xyXG4gICAgICAgICAgc2QgPSBzZCAqIDQgLSAzO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoYmFzZU91dCA9PSA4KSB7XHJcbiAgICAgICAgICBzZCA9IHNkICogMyAtIDI7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGJhc2UgPSBiYXNlT3V0O1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBDb252ZXJ0IHRoZSBudW1iZXIgYXMgYW4gaW50ZWdlciB0aGVuIGRpdmlkZSB0aGUgcmVzdWx0IGJ5IGl0cyBiYXNlIHJhaXNlZCB0byBhIHBvd2VyIHN1Y2hcclxuICAgICAgLy8gdGhhdCB0aGUgZnJhY3Rpb24gcGFydCB3aWxsIGJlIHJlc3RvcmVkLlxyXG5cclxuICAgICAgLy8gTm9uLWludGVnZXIuXHJcbiAgICAgIGlmIChpID49IDApIHtcclxuICAgICAgICBzdHIgPSBzdHIucmVwbGFjZSgnLicsICcnKTtcclxuICAgICAgICB5ID0gbmV3IEN0b3IoMSk7XHJcbiAgICAgICAgeS5lID0gc3RyLmxlbmd0aCAtIGk7XHJcbiAgICAgICAgeS5kID0gY29udmVydEJhc2UoZmluaXRlVG9TdHJpbmcoeSksIDEwLCBiYXNlKTtcclxuICAgICAgICB5LmUgPSB5LmQubGVuZ3RoO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB4ZCA9IGNvbnZlcnRCYXNlKHN0ciwgMTAsIGJhc2UpO1xyXG4gICAgICBlID0gbGVuID0geGQubGVuZ3RoO1xyXG5cclxuICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIHplcm9zLlxyXG4gICAgICBmb3IgKDsgeGRbLS1sZW5dID09IDA7KSB4ZC5wb3AoKTtcclxuXHJcbiAgICAgIGlmICgheGRbMF0pIHtcclxuICAgICAgICBzdHIgPSBpc0V4cCA/ICcwcCswJyA6ICcwJztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBpZiAoaSA8IDApIHtcclxuICAgICAgICAgIGUtLTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgeCA9IG5ldyBDdG9yKHgpO1xyXG4gICAgICAgICAgeC5kID0geGQ7XHJcbiAgICAgICAgICB4LmUgPSBlO1xyXG4gICAgICAgICAgeCA9IGRpdmlkZSh4LCB5LCBzZCwgcm0sIDAsIGJhc2UpO1xyXG4gICAgICAgICAgeGQgPSB4LmQ7XHJcbiAgICAgICAgICBlID0geC5lO1xyXG4gICAgICAgICAgcm91bmRVcCA9IGluZXhhY3Q7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBUaGUgcm91bmRpbmcgZGlnaXQsIGkuZS4gdGhlIGRpZ2l0IGFmdGVyIHRoZSBkaWdpdCB0aGF0IG1heSBiZSByb3VuZGVkIHVwLlxyXG4gICAgICAgIGkgPSB4ZFtzZF07XHJcbiAgICAgICAgayA9IGJhc2UgLyAyO1xyXG4gICAgICAgIHJvdW5kVXAgPSByb3VuZFVwIHx8IHhkW3NkICsgMV0gIT09IHZvaWQgMDtcclxuXHJcbiAgICAgICAgcm91bmRVcCA9IHJtIDwgNFxyXG4gICAgICAgICAgPyAoaSAhPT0gdm9pZCAwIHx8IHJvdW5kVXApICYmIChybSA9PT0gMCB8fCBybSA9PT0gKHgucyA8IDAgPyAzIDogMikpXHJcbiAgICAgICAgICA6IGkgPiBrIHx8IGkgPT09IGsgJiYgKHJtID09PSA0IHx8IHJvdW5kVXAgfHwgcm0gPT09IDYgJiYgeGRbc2QgLSAxXSAmIDEgfHxcclxuICAgICAgICAgICAgcm0gPT09ICh4LnMgPCAwID8gOCA6IDcpKTtcclxuXHJcbiAgICAgICAgeGQubGVuZ3RoID0gc2Q7XHJcblxyXG4gICAgICAgIGlmIChyb3VuZFVwKSB7XHJcblxyXG4gICAgICAgICAgLy8gUm91bmRpbmcgdXAgbWF5IG1lYW4gdGhlIHByZXZpb3VzIGRpZ2l0IGhhcyB0byBiZSByb3VuZGVkIHVwIGFuZCBzbyBvbi5cclxuICAgICAgICAgIGZvciAoOyArK3hkWy0tc2RdID4gYmFzZSAtIDE7KSB7XHJcbiAgICAgICAgICAgIHhkW3NkXSA9IDA7XHJcbiAgICAgICAgICAgIGlmICghc2QpIHtcclxuICAgICAgICAgICAgICArK2U7XHJcbiAgICAgICAgICAgICAgeGQudW5zaGlmdCgxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRGV0ZXJtaW5lIHRyYWlsaW5nIHplcm9zLlxyXG4gICAgICAgIGZvciAobGVuID0geGQubGVuZ3RoOyAheGRbbGVuIC0gMV07IC0tbGVuKTtcclxuXHJcbiAgICAgICAgLy8gRS5nLiBbNCwgMTEsIDE1XSBiZWNvbWVzIDRiZi5cclxuICAgICAgICBmb3IgKGkgPSAwLCBzdHIgPSAnJzsgaSA8IGxlbjsgaSsrKSBzdHIgKz0gTlVNRVJBTFMuY2hhckF0KHhkW2ldKTtcclxuXHJcbiAgICAgICAgLy8gQWRkIGJpbmFyeSBleHBvbmVudCBzdWZmaXg/XHJcbiAgICAgICAgaWYgKGlzRXhwKSB7XHJcbiAgICAgICAgICBpZiAobGVuID4gMSkge1xyXG4gICAgICAgICAgICBpZiAoYmFzZU91dCA9PSAxNiB8fCBiYXNlT3V0ID09IDgpIHtcclxuICAgICAgICAgICAgICBpID0gYmFzZU91dCA9PSAxNiA/IDQgOiAzO1xyXG4gICAgICAgICAgICAgIGZvciAoLS1sZW47IGxlbiAlIGk7IGxlbisrKSBzdHIgKz0gJzAnO1xyXG4gICAgICAgICAgICAgIHhkID0gY29udmVydEJhc2Uoc3RyLCBiYXNlLCBiYXNlT3V0KTtcclxuICAgICAgICAgICAgICBmb3IgKGxlbiA9IHhkLmxlbmd0aDsgIXhkW2xlbiAtIDFdOyAtLWxlbik7XHJcblxyXG4gICAgICAgICAgICAgIC8vIHhkWzBdIHdpbGwgYWx3YXlzIGJlIGJlIDFcclxuICAgICAgICAgICAgICBmb3IgKGkgPSAxLCBzdHIgPSAnMS4nOyBpIDwgbGVuOyBpKyspIHN0ciArPSBOVU1FUkFMUy5jaGFyQXQoeGRbaV0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHN0ciA9IHN0ci5jaGFyQXQoMCkgKyAnLicgKyBzdHIuc2xpY2UoMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBzdHIgPSAgc3RyICsgKGUgPCAwID8gJ3AnIDogJ3ArJykgKyBlO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZSA8IDApIHtcclxuICAgICAgICAgIGZvciAoOyArK2U7KSBzdHIgPSAnMCcgKyBzdHI7XHJcbiAgICAgICAgICBzdHIgPSAnMC4nICsgc3RyO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBpZiAoKytlID4gbGVuKSBmb3IgKGUgLT0gbGVuOyBlLS0gOykgc3RyICs9ICcwJztcclxuICAgICAgICAgIGVsc2UgaWYgKGUgPCBsZW4pIHN0ciA9IHN0ci5zbGljZSgwLCBlKSArICcuJyArIHN0ci5zbGljZShlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHN0ciA9IChiYXNlT3V0ID09IDE2ID8gJzB4JyA6IGJhc2VPdXQgPT0gMiA/ICcwYicgOiBiYXNlT3V0ID09IDggPyAnMG8nIDogJycpICsgc3RyO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB4LnMgPCAwID8gJy0nICsgc3RyIDogc3RyO1xyXG4gIH1cclxuXHJcblxyXG4gIC8vIERvZXMgbm90IHN0cmlwIHRyYWlsaW5nIHplcm9zLlxyXG4gIGZ1bmN0aW9uIHRydW5jYXRlKGFyciwgbGVuKSB7XHJcbiAgICBpZiAoYXJyLmxlbmd0aCA+IGxlbikge1xyXG4gICAgICBhcnIubGVuZ3RoID0gbGVuO1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICB9XHJcblxyXG5cclxuICAvLyBEZWNpbWFsIG1ldGhvZHNcclxuXHJcblxyXG4gIC8qXHJcbiAgICogIGFic1xyXG4gICAqICBhY29zXHJcbiAgICogIGFjb3NoXHJcbiAgICogIGFkZFxyXG4gICAqICBhc2luXHJcbiAgICogIGFzaW5oXHJcbiAgICogIGF0YW5cclxuICAgKiAgYXRhbmhcclxuICAgKiAgYXRhbjJcclxuICAgKiAgY2JydFxyXG4gICAqICBjZWlsXHJcbiAgICogIGNsb25lXHJcbiAgICogIGNvbmZpZ1xyXG4gICAqICBjb3NcclxuICAgKiAgY29zaFxyXG4gICAqICBkaXZcclxuICAgKiAgZXhwXHJcbiAgICogIGZsb29yXHJcbiAgICogIGh5cG90XHJcbiAgICogIGxuXHJcbiAgICogIGxvZ1xyXG4gICAqICBsb2cyXHJcbiAgICogIGxvZzEwXHJcbiAgICogIG1heFxyXG4gICAqICBtaW5cclxuICAgKiAgbW9kXHJcbiAgICogIG11bFxyXG4gICAqICBwb3dcclxuICAgKiAgcmFuZG9tXHJcbiAgICogIHJvdW5kXHJcbiAgICogIHNldFxyXG4gICAqICBzaWduXHJcbiAgICogIHNpblxyXG4gICAqICBzaW5oXHJcbiAgICogIHNxcnRcclxuICAgKiAgc3ViXHJcbiAgICogIHRhblxyXG4gICAqICB0YW5oXHJcbiAgICogIHRydW5jXHJcbiAgICovXHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSBhYnNvbHV0ZSB2YWx1ZSBvZiBgeGAuXHJcbiAgICpcclxuICAgKiB4IHtudW1iZXJ8c3RyaW5nfERlY2ltYWx9XHJcbiAgICpcclxuICAgKi9cclxuICBmdW5jdGlvbiBhYnMoeCkge1xyXG4gICAgcmV0dXJuIG5ldyB0aGlzKHgpLmFicygpO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgdGhlIGFyY2Nvc2luZSBpbiByYWRpYW5zIG9mIGB4YC5cclxuICAgKlxyXG4gICAqIHgge251bWJlcnxzdHJpbmd8RGVjaW1hbH1cclxuICAgKlxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGFjb3MoeCkge1xyXG4gICAgcmV0dXJuIG5ldyB0aGlzKHgpLmFjb3MoKTtcclxuICB9XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSBpbnZlcnNlIG9mIHRoZSBoeXBlcmJvbGljIGNvc2luZSBvZiBgeGAsIHJvdW5kZWQgdG9cclxuICAgKiBgcHJlY2lzaW9uYCBzaWduaWZpY2FudCBkaWdpdHMgdXNpbmcgcm91bmRpbmcgbW9kZSBgcm91bmRpbmdgLlxyXG4gICAqXHJcbiAgICogeCB7bnVtYmVyfHN0cmluZ3xEZWNpbWFsfSBBIHZhbHVlIGluIHJhZGlhbnMuXHJcbiAgICpcclxuICAgKi9cclxuICBmdW5jdGlvbiBhY29zaCh4KSB7XHJcbiAgICByZXR1cm4gbmV3IHRoaXMoeCkuYWNvc2goKTtcclxuICB9XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSBzdW0gb2YgYHhgIGFuZCBgeWAsIHJvdW5kZWQgdG8gYHByZWNpc2lvbmAgc2lnbmlmaWNhbnRcclxuICAgKiBkaWdpdHMgdXNpbmcgcm91bmRpbmcgbW9kZSBgcm91bmRpbmdgLlxyXG4gICAqXHJcbiAgICogeCB7bnVtYmVyfHN0cmluZ3xEZWNpbWFsfVxyXG4gICAqIHkge251bWJlcnxzdHJpbmd8RGVjaW1hbH1cclxuICAgKlxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGFkZCh4LCB5KSB7XHJcbiAgICByZXR1cm4gbmV3IHRoaXMoeCkucGx1cyh5KTtcclxuICB9XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSBhcmNzaW5lIGluIHJhZGlhbnMgb2YgYHhgLCByb3VuZGVkIHRvIGBwcmVjaXNpb25gXHJcbiAgICogc2lnbmlmaWNhbnQgZGlnaXRzIHVzaW5nIHJvdW5kaW5nIG1vZGUgYHJvdW5kaW5nYC5cclxuICAgKlxyXG4gICAqIHgge251bWJlcnxzdHJpbmd8RGVjaW1hbH1cclxuICAgKlxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGFzaW4oeCkge1xyXG4gICAgcmV0dXJuIG5ldyB0aGlzKHgpLmFzaW4oKTtcclxuICB9XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSBpbnZlcnNlIG9mIHRoZSBoeXBlcmJvbGljIHNpbmUgb2YgYHhgLCByb3VuZGVkIHRvXHJcbiAgICogYHByZWNpc2lvbmAgc2lnbmlmaWNhbnQgZGlnaXRzIHVzaW5nIHJvdW5kaW5nIG1vZGUgYHJvdW5kaW5nYC5cclxuICAgKlxyXG4gICAqIHgge251bWJlcnxzdHJpbmd8RGVjaW1hbH0gQSB2YWx1ZSBpbiByYWRpYW5zLlxyXG4gICAqXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gYXNpbmgoeCkge1xyXG4gICAgcmV0dXJuIG5ldyB0aGlzKHgpLmFzaW5oKCk7XHJcbiAgfVxyXG5cclxuXHJcbiAgLypcclxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgYXJjdGFuZ2VudCBpbiByYWRpYW5zIG9mIGB4YCwgcm91bmRlZCB0byBgcHJlY2lzaW9uYFxyXG4gICAqIHNpZ25pZmljYW50IGRpZ2l0cyB1c2luZyByb3VuZGluZyBtb2RlIGByb3VuZGluZ2AuXHJcbiAgICpcclxuICAgKiB4IHtudW1iZXJ8c3RyaW5nfERlY2ltYWx9XHJcbiAgICpcclxuICAgKi9cclxuICBmdW5jdGlvbiBhdGFuKHgpIHtcclxuICAgIHJldHVybiBuZXcgdGhpcyh4KS5hdGFuKCk7XHJcbiAgfVxyXG5cclxuXHJcbiAgLypcclxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgaW52ZXJzZSBvZiB0aGUgaHlwZXJib2xpYyB0YW5nZW50IG9mIGB4YCwgcm91bmRlZCB0b1xyXG4gICAqIGBwcmVjaXNpb25gIHNpZ25pZmljYW50IGRpZ2l0cyB1c2luZyByb3VuZGluZyBtb2RlIGByb3VuZGluZ2AuXHJcbiAgICpcclxuICAgKiB4IHtudW1iZXJ8c3RyaW5nfERlY2ltYWx9IEEgdmFsdWUgaW4gcmFkaWFucy5cclxuICAgKlxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGF0YW5oKHgpIHtcclxuICAgIHJldHVybiBuZXcgdGhpcyh4KS5hdGFuaCgpO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgdGhlIGFyY3RhbmdlbnQgaW4gcmFkaWFucyBvZiBgeS94YCBpbiB0aGUgcmFuZ2UgLXBpIHRvIHBpXHJcbiAgICogKGluY2x1c2l2ZSksIHJvdW5kZWQgdG8gYHByZWNpc2lvbmAgc2lnbmlmaWNhbnQgZGlnaXRzIHVzaW5nIHJvdW5kaW5nIG1vZGUgYHJvdW5kaW5nYC5cclxuICAgKlxyXG4gICAqIERvbWFpbjogWy1JbmZpbml0eSwgSW5maW5pdHldXHJcbiAgICogUmFuZ2U6IFstcGksIHBpXVxyXG4gICAqXHJcbiAgICogeSB7bnVtYmVyfHN0cmluZ3xEZWNpbWFsfSBUaGUgeS1jb29yZGluYXRlLlxyXG4gICAqIHgge251bWJlcnxzdHJpbmd8RGVjaW1hbH0gVGhlIHgtY29vcmRpbmF0ZS5cclxuICAgKlxyXG4gICAqIGF0YW4yKMKxMCwgLTApICAgICAgICAgICAgICAgPSDCsXBpXHJcbiAgICogYXRhbjIowrEwLCArMCkgICAgICAgICAgICAgICA9IMKxMFxyXG4gICAqIGF0YW4yKMKxMCwgLXgpICAgICAgICAgICAgICAgPSDCsXBpIGZvciB4ID4gMFxyXG4gICAqIGF0YW4yKMKxMCwgeCkgICAgICAgICAgICAgICAgPSDCsTAgZm9yIHggPiAwXHJcbiAgICogYXRhbjIoLXksIMKxMCkgICAgICAgICAgICAgICA9IC1waS8yIGZvciB5ID4gMFxyXG4gICAqIGF0YW4yKHksIMKxMCkgICAgICAgICAgICAgICAgPSBwaS8yIGZvciB5ID4gMFxyXG4gICAqIGF0YW4yKMKxeSwgLUluZmluaXR5KSAgICAgICAgPSDCsXBpIGZvciBmaW5pdGUgeSA+IDBcclxuICAgKiBhdGFuMijCsXksICtJbmZpbml0eSkgICAgICAgID0gwrEwIGZvciBmaW5pdGUgeSA+IDBcclxuICAgKiBhdGFuMijCsUluZmluaXR5LCB4KSAgICAgICAgID0gwrFwaS8yIGZvciBmaW5pdGUgeFxyXG4gICAqIGF0YW4yKMKxSW5maW5pdHksIC1JbmZpbml0eSkgPSDCsTMqcGkvNFxyXG4gICAqIGF0YW4yKMKxSW5maW5pdHksICtJbmZpbml0eSkgPSDCsXBpLzRcclxuICAgKiBhdGFuMihOYU4sIHgpID0gTmFOXHJcbiAgICogYXRhbjIoeSwgTmFOKSA9IE5hTlxyXG4gICAqXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gYXRhbjIoeSwgeCkge1xyXG4gICAgeSA9IG5ldyB0aGlzKHkpO1xyXG4gICAgeCA9IG5ldyB0aGlzKHgpO1xyXG4gICAgdmFyIHIsXHJcbiAgICAgIHByID0gdGhpcy5wcmVjaXNpb24sXHJcbiAgICAgIHJtID0gdGhpcy5yb3VuZGluZyxcclxuICAgICAgd3ByID0gcHIgKyA0O1xyXG5cclxuICAgIC8vIEVpdGhlciBOYU5cclxuICAgIGlmICgheS5zIHx8ICF4LnMpIHtcclxuICAgICAgciA9IG5ldyB0aGlzKE5hTik7XHJcblxyXG4gICAgLy8gQm90aCDCsUluZmluaXR5XHJcbiAgICB9IGVsc2UgaWYgKCF5LmQgJiYgIXguZCkge1xyXG4gICAgICByID0gZ2V0UGkodGhpcywgd3ByLCAxKS50aW1lcyh4LnMgPiAwID8gMC4yNSA6IDAuNzUpO1xyXG4gICAgICByLnMgPSB5LnM7XHJcblxyXG4gICAgLy8geCBpcyDCsUluZmluaXR5IG9yIHkgaXMgwrEwXHJcbiAgICB9IGVsc2UgaWYgKCF4LmQgfHwgeS5pc1plcm8oKSkge1xyXG4gICAgICByID0geC5zIDwgMCA/IGdldFBpKHRoaXMsIHByLCBybSkgOiBuZXcgdGhpcygwKTtcclxuICAgICAgci5zID0geS5zO1xyXG5cclxuICAgIC8vIHkgaXMgwrFJbmZpbml0eSBvciB4IGlzIMKxMFxyXG4gICAgfSBlbHNlIGlmICgheS5kIHx8IHguaXNaZXJvKCkpIHtcclxuICAgICAgciA9IGdldFBpKHRoaXMsIHdwciwgMSkudGltZXMoMC41KTtcclxuICAgICAgci5zID0geS5zO1xyXG5cclxuICAgIC8vIEJvdGggbm9uLXplcm8gYW5kIGZpbml0ZVxyXG4gICAgfSBlbHNlIGlmICh4LnMgPCAwKSB7XHJcbiAgICAgIHRoaXMucHJlY2lzaW9uID0gd3ByO1xyXG4gICAgICB0aGlzLnJvdW5kaW5nID0gMTtcclxuICAgICAgciA9IHRoaXMuYXRhbihkaXZpZGUoeSwgeCwgd3ByLCAxKSk7XHJcbiAgICAgIHggPSBnZXRQaSh0aGlzLCB3cHIsIDEpO1xyXG4gICAgICB0aGlzLnByZWNpc2lvbiA9IHByO1xyXG4gICAgICB0aGlzLnJvdW5kaW5nID0gcm07XHJcbiAgICAgIHIgPSB5LnMgPCAwID8gci5taW51cyh4KSA6IHIucGx1cyh4KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHIgPSB0aGlzLmF0YW4oZGl2aWRlKHksIHgsIHdwciwgMSkpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgdGhlIGN1YmUgcm9vdCBvZiBgeGAsIHJvdW5kZWQgdG8gYHByZWNpc2lvbmAgc2lnbmlmaWNhbnRcclxuICAgKiBkaWdpdHMgdXNpbmcgcm91bmRpbmcgbW9kZSBgcm91bmRpbmdgLlxyXG4gICAqXHJcbiAgICogeCB7bnVtYmVyfHN0cmluZ3xEZWNpbWFsfVxyXG4gICAqXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gY2JydCh4KSB7XHJcbiAgICByZXR1cm4gbmV3IHRoaXMoeCkuY2JydCgpO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgYHhgIHJvdW5kZWQgdG8gYW4gaW50ZWdlciB1c2luZyBgUk9VTkRfQ0VJTGAuXHJcbiAgICpcclxuICAgKiB4IHtudW1iZXJ8c3RyaW5nfERlY2ltYWx9XHJcbiAgICpcclxuICAgKi9cclxuICBmdW5jdGlvbiBjZWlsKHgpIHtcclxuICAgIHJldHVybiBmaW5hbGlzZSh4ID0gbmV3IHRoaXMoeCksIHguZSArIDEsIDIpO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qXHJcbiAgICogQ29uZmlndXJlIGdsb2JhbCBzZXR0aW5ncyBmb3IgYSBEZWNpbWFsIGNvbnN0cnVjdG9yLlxyXG4gICAqXHJcbiAgICogYG9iamAgaXMgYW4gb2JqZWN0IHdpdGggb25lIG9yIG1vcmUgb2YgdGhlIGZvbGxvd2luZyBwcm9wZXJ0aWVzLFxyXG4gICAqXHJcbiAgICogICBwcmVjaXNpb24gIHtudW1iZXJ9XHJcbiAgICogICByb3VuZGluZyAgIHtudW1iZXJ9XHJcbiAgICogICB0b0V4cE5lZyAgIHtudW1iZXJ9XHJcbiAgICogICB0b0V4cFBvcyAgIHtudW1iZXJ9XHJcbiAgICogICBtYXhFICAgICAgIHtudW1iZXJ9XHJcbiAgICogICBtaW5FICAgICAgIHtudW1iZXJ9XHJcbiAgICogICBtb2R1bG8gICAgIHtudW1iZXJ9XHJcbiAgICogICBjcnlwdG8gICAgIHtib29sZWFufG51bWJlcn1cclxuICAgKiAgIGRlZmF1bHRzICAge3RydWV9XHJcbiAgICpcclxuICAgKiBFLmcuIERlY2ltYWwuY29uZmlnKHsgcHJlY2lzaW9uOiAyMCwgcm91bmRpbmc6IDQgfSlcclxuICAgKlxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGNvbmZpZyhvYmopIHtcclxuICAgIGlmICghb2JqIHx8IHR5cGVvZiBvYmogIT09ICdvYmplY3QnKSB0aHJvdyBFcnJvcihkZWNpbWFsRXJyb3IgKyAnT2JqZWN0IGV4cGVjdGVkJyk7XHJcbiAgICB2YXIgaSwgcCwgdixcclxuICAgICAgdXNlRGVmYXVsdHMgPSBvYmouZGVmYXVsdHMgPT09IHRydWUsXHJcbiAgICAgIHBzID0gW1xyXG4gICAgICAgICdwcmVjaXNpb24nLCAxLCBNQVhfRElHSVRTLFxyXG4gICAgICAgICdyb3VuZGluZycsIDAsIDgsXHJcbiAgICAgICAgJ3RvRXhwTmVnJywgLUVYUF9MSU1JVCwgMCxcclxuICAgICAgICAndG9FeHBQb3MnLCAwLCBFWFBfTElNSVQsXHJcbiAgICAgICAgJ21heEUnLCAwLCBFWFBfTElNSVQsXHJcbiAgICAgICAgJ21pbkUnLCAtRVhQX0xJTUlULCAwLFxyXG4gICAgICAgICdtb2R1bG8nLCAwLCA5XHJcbiAgICAgIF07XHJcblxyXG4gICAgZm9yIChpID0gMDsgaSA8IHBzLmxlbmd0aDsgaSArPSAzKSB7XHJcbiAgICAgIGlmIChwID0gcHNbaV0sIHVzZURlZmF1bHRzKSB0aGlzW3BdID0gREVGQVVMVFNbcF07XHJcbiAgICAgIGlmICgodiA9IG9ialtwXSkgIT09IHZvaWQgMCkge1xyXG4gICAgICAgIGlmIChtYXRoZmxvb3IodikgPT09IHYgJiYgdiA+PSBwc1tpICsgMV0gJiYgdiA8PSBwc1tpICsgMl0pIHRoaXNbcF0gPSB2O1xyXG4gICAgICAgIGVsc2UgdGhyb3cgRXJyb3IoaW52YWxpZEFyZ3VtZW50ICsgcCArICc6ICcgKyB2KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChwID0gJ2NyeXB0bycsIHVzZURlZmF1bHRzKSB0aGlzW3BdID0gREVGQVVMVFNbcF07XHJcbiAgICBpZiAoKHYgPSBvYmpbcF0pICE9PSB2b2lkIDApIHtcclxuICAgICAgaWYgKHYgPT09IHRydWUgfHwgdiA9PT0gZmFsc2UgfHwgdiA9PT0gMCB8fCB2ID09PSAxKSB7XHJcbiAgICAgICAgaWYgKHYpIHtcclxuICAgICAgICAgIGlmICh0eXBlb2YgY3J5cHRvICE9ICd1bmRlZmluZWQnICYmIGNyeXB0byAmJlxyXG4gICAgICAgICAgICAoY3J5cHRvLmdldFJhbmRvbVZhbHVlcyB8fCBjcnlwdG8ucmFuZG9tQnl0ZXMpKSB7XHJcbiAgICAgICAgICAgIHRoaXNbcF0gPSB0cnVlO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhyb3cgRXJyb3IoY3J5cHRvVW5hdmFpbGFibGUpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzW3BdID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRocm93IEVycm9yKGludmFsaWRBcmd1bWVudCArIHAgKyAnOiAnICsgdik7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSBjb3NpbmUgb2YgYHhgLCByb3VuZGVkIHRvIGBwcmVjaXNpb25gIHNpZ25pZmljYW50XHJcbiAgICogZGlnaXRzIHVzaW5nIHJvdW5kaW5nIG1vZGUgYHJvdW5kaW5nYC5cclxuICAgKlxyXG4gICAqIHgge251bWJlcnxzdHJpbmd8RGVjaW1hbH0gQSB2YWx1ZSBpbiByYWRpYW5zLlxyXG4gICAqXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gY29zKHgpIHtcclxuICAgIHJldHVybiBuZXcgdGhpcyh4KS5jb3MoKTtcclxuICB9XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSBoeXBlcmJvbGljIGNvc2luZSBvZiBgeGAsIHJvdW5kZWQgdG8gcHJlY2lzaW9uXHJcbiAgICogc2lnbmlmaWNhbnQgZGlnaXRzIHVzaW5nIHJvdW5kaW5nIG1vZGUgYHJvdW5kaW5nYC5cclxuICAgKlxyXG4gICAqIHgge251bWJlcnxzdHJpbmd8RGVjaW1hbH0gQSB2YWx1ZSBpbiByYWRpYW5zLlxyXG4gICAqXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gY29zaCh4KSB7XHJcbiAgICByZXR1cm4gbmV3IHRoaXMoeCkuY29zaCgpO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qXHJcbiAgICogQ3JlYXRlIGFuZCByZXR1cm4gYSBEZWNpbWFsIGNvbnN0cnVjdG9yIHdpdGggdGhlIHNhbWUgY29uZmlndXJhdGlvbiBwcm9wZXJ0aWVzIGFzIHRoaXMgRGVjaW1hbFxyXG4gICAqIGNvbnN0cnVjdG9yLlxyXG4gICAqXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gY2xvbmUob2JqKSB7XHJcbiAgICB2YXIgaSwgcCwgcHM7XHJcblxyXG4gICAgLypcclxuICAgICAqIFRoZSBEZWNpbWFsIGNvbnN0cnVjdG9yIGFuZCBleHBvcnRlZCBmdW5jdGlvbi5cclxuICAgICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIGluc3RhbmNlLlxyXG4gICAgICpcclxuICAgICAqIHYge251bWJlcnxzdHJpbmd8RGVjaW1hbH0gQSBudW1lcmljIHZhbHVlLlxyXG4gICAgICpcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gRGVjaW1hbCh2KSB7XHJcbiAgICAgIHZhciBlLCBpLCB0LFxyXG4gICAgICAgIHggPSB0aGlzO1xyXG5cclxuICAgICAgLy8gRGVjaW1hbCBjYWxsZWQgd2l0aG91dCBuZXcuXHJcbiAgICAgIGlmICghKHggaW5zdGFuY2VvZiBEZWNpbWFsKSkgcmV0dXJuIG5ldyBEZWNpbWFsKHYpO1xyXG5cclxuICAgICAgLy8gUmV0YWluIGEgcmVmZXJlbmNlIHRvIHRoaXMgRGVjaW1hbCBjb25zdHJ1Y3RvciwgYW5kIHNoYWRvdyBEZWNpbWFsLnByb3RvdHlwZS5jb25zdHJ1Y3RvclxyXG4gICAgICAvLyB3aGljaCBwb2ludHMgdG8gT2JqZWN0LlxyXG4gICAgICB4LmNvbnN0cnVjdG9yID0gRGVjaW1hbDtcclxuXHJcbiAgICAgIC8vIER1cGxpY2F0ZS5cclxuICAgICAgaWYgKHYgaW5zdGFuY2VvZiBEZWNpbWFsKSB7XHJcbiAgICAgICAgeC5zID0gdi5zO1xyXG5cclxuICAgICAgICBpZiAoZXh0ZXJuYWwpIHtcclxuICAgICAgICAgIGlmICghdi5kIHx8IHYuZSA+IERlY2ltYWwubWF4RSkge1xyXG5cclxuICAgICAgICAgICAgLy8gSW5maW5pdHkuXHJcbiAgICAgICAgICAgIHguZSA9IE5hTjtcclxuICAgICAgICAgICAgeC5kID0gbnVsbDtcclxuICAgICAgICAgIH0gZWxzZSBpZiAodi5lIDwgRGVjaW1hbC5taW5FKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBaZXJvLlxyXG4gICAgICAgICAgICB4LmUgPSAwO1xyXG4gICAgICAgICAgICB4LmQgPSBbMF07XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB4LmUgPSB2LmU7XHJcbiAgICAgICAgICAgIHguZCA9IHYuZC5zbGljZSgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB4LmUgPSB2LmU7XHJcbiAgICAgICAgICB4LmQgPSB2LmQgPyB2LmQuc2xpY2UoKSA6IHYuZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgdCA9IHR5cGVvZiB2O1xyXG5cclxuICAgICAgaWYgKHQgPT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgaWYgKHYgPT09IDApIHtcclxuICAgICAgICAgIHgucyA9IDEgLyB2IDwgMCA/IC0xIDogMTtcclxuICAgICAgICAgIHguZSA9IDA7XHJcbiAgICAgICAgICB4LmQgPSBbMF07XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodiA8IDApIHtcclxuICAgICAgICAgIHYgPSAtdjtcclxuICAgICAgICAgIHgucyA9IC0xO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB4LnMgPSAxO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRmFzdCBwYXRoIGZvciBzbWFsbCBpbnRlZ2Vycy5cclxuICAgICAgICBpZiAodiA9PT0gfn52ICYmIHYgPCAxZTcpIHtcclxuICAgICAgICAgIGZvciAoZSA9IDAsIGkgPSB2OyBpID49IDEwOyBpIC89IDEwKSBlKys7XHJcblxyXG4gICAgICAgICAgaWYgKGV4dGVybmFsKSB7XHJcbiAgICAgICAgICAgIGlmIChlID4gRGVjaW1hbC5tYXhFKSB7XHJcbiAgICAgICAgICAgICAgeC5lID0gTmFOO1xyXG4gICAgICAgICAgICAgIHguZCA9IG51bGw7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZSA8IERlY2ltYWwubWluRSkge1xyXG4gICAgICAgICAgICAgIHguZSA9IDA7XHJcbiAgICAgICAgICAgICAgeC5kID0gWzBdO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHguZSA9IGU7XHJcbiAgICAgICAgICAgICAgeC5kID0gW3ZdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB4LmUgPSBlO1xyXG4gICAgICAgICAgICB4LmQgPSBbdl07XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAvLyBJbmZpbml0eSwgTmFOLlxyXG4gICAgICAgIH0gZWxzZSBpZiAodiAqIDAgIT09IDApIHtcclxuICAgICAgICAgIGlmICghdikgeC5zID0gTmFOO1xyXG4gICAgICAgICAgeC5lID0gTmFOO1xyXG4gICAgICAgICAgeC5kID0gbnVsbDtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBwYXJzZURlY2ltYWwoeCwgdi50b1N0cmluZygpKTtcclxuXHJcbiAgICAgIH0gZWxzZSBpZiAodCAhPT0gJ3N0cmluZycpIHtcclxuICAgICAgICB0aHJvdyBFcnJvcihpbnZhbGlkQXJndW1lbnQgKyB2KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gTWludXMgc2lnbj9cclxuICAgICAgaWYgKChpID0gdi5jaGFyQ29kZUF0KDApKSA9PT0gNDUpIHtcclxuICAgICAgICB2ID0gdi5zbGljZSgxKTtcclxuICAgICAgICB4LnMgPSAtMTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBQbHVzIHNpZ24/XHJcbiAgICAgICAgaWYgKGkgPT09IDQzKSB2ID0gdi5zbGljZSgxKTtcclxuICAgICAgICB4LnMgPSAxO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gaXNEZWNpbWFsLnRlc3QodikgPyBwYXJzZURlY2ltYWwoeCwgdikgOiBwYXJzZU90aGVyKHgsIHYpO1xyXG4gICAgfVxyXG5cclxuICAgIERlY2ltYWwucHJvdG90eXBlID0gUDtcclxuXHJcbiAgICBEZWNpbWFsLlJPVU5EX1VQID0gMDtcclxuICAgIERlY2ltYWwuUk9VTkRfRE9XTiA9IDE7XHJcbiAgICBEZWNpbWFsLlJPVU5EX0NFSUwgPSAyO1xyXG4gICAgRGVjaW1hbC5ST1VORF9GTE9PUiA9IDM7XHJcbiAgICBEZWNpbWFsLlJPVU5EX0hBTEZfVVAgPSA0O1xyXG4gICAgRGVjaW1hbC5ST1VORF9IQUxGX0RPV04gPSA1O1xyXG4gICAgRGVjaW1hbC5ST1VORF9IQUxGX0VWRU4gPSA2O1xyXG4gICAgRGVjaW1hbC5ST1VORF9IQUxGX0NFSUwgPSA3O1xyXG4gICAgRGVjaW1hbC5ST1VORF9IQUxGX0ZMT09SID0gODtcclxuICAgIERlY2ltYWwuRVVDTElEID0gOTtcclxuXHJcbiAgICBEZWNpbWFsLmNvbmZpZyA9IERlY2ltYWwuc2V0ID0gY29uZmlnO1xyXG4gICAgRGVjaW1hbC5jbG9uZSA9IGNsb25lO1xyXG4gICAgRGVjaW1hbC5pc0RlY2ltYWwgPSBpc0RlY2ltYWxJbnN0YW5jZTtcclxuXHJcbiAgICBEZWNpbWFsLmFicyA9IGFicztcclxuICAgIERlY2ltYWwuYWNvcyA9IGFjb3M7XHJcbiAgICBEZWNpbWFsLmFjb3NoID0gYWNvc2g7ICAgICAgICAvLyBFUzZcclxuICAgIERlY2ltYWwuYWRkID0gYWRkO1xyXG4gICAgRGVjaW1hbC5hc2luID0gYXNpbjtcclxuICAgIERlY2ltYWwuYXNpbmggPSBhc2luaDsgICAgICAgIC8vIEVTNlxyXG4gICAgRGVjaW1hbC5hdGFuID0gYXRhbjtcclxuICAgIERlY2ltYWwuYXRhbmggPSBhdGFuaDsgICAgICAgIC8vIEVTNlxyXG4gICAgRGVjaW1hbC5hdGFuMiA9IGF0YW4yO1xyXG4gICAgRGVjaW1hbC5jYnJ0ID0gY2JydDsgICAgICAgICAgLy8gRVM2XHJcbiAgICBEZWNpbWFsLmNlaWwgPSBjZWlsO1xyXG4gICAgRGVjaW1hbC5jb3MgPSBjb3M7XHJcbiAgICBEZWNpbWFsLmNvc2ggPSBjb3NoOyAgICAgICAgICAvLyBFUzZcclxuICAgIERlY2ltYWwuZGl2ID0gZGl2O1xyXG4gICAgRGVjaW1hbC5leHAgPSBleHA7XHJcbiAgICBEZWNpbWFsLmZsb29yID0gZmxvb3I7XHJcbiAgICBEZWNpbWFsLmh5cG90ID0gaHlwb3Q7ICAgICAgICAvLyBFUzZcclxuICAgIERlY2ltYWwubG4gPSBsbjtcclxuICAgIERlY2ltYWwubG9nID0gbG9nO1xyXG4gICAgRGVjaW1hbC5sb2cxMCA9IGxvZzEwOyAgICAgICAgLy8gRVM2XHJcbiAgICBEZWNpbWFsLmxvZzIgPSBsb2cyOyAgICAgICAgICAvLyBFUzZcclxuICAgIERlY2ltYWwubWF4ID0gbWF4O1xyXG4gICAgRGVjaW1hbC5taW4gPSBtaW47XHJcbiAgICBEZWNpbWFsLm1vZCA9IG1vZDtcclxuICAgIERlY2ltYWwubXVsID0gbXVsO1xyXG4gICAgRGVjaW1hbC5wb3cgPSBwb3c7XHJcbiAgICBEZWNpbWFsLnJhbmRvbSA9IHJhbmRvbTtcclxuICAgIERlY2ltYWwucm91bmQgPSByb3VuZDtcclxuICAgIERlY2ltYWwuc2lnbiA9IHNpZ247ICAgICAgICAgIC8vIEVTNlxyXG4gICAgRGVjaW1hbC5zaW4gPSBzaW47XHJcbiAgICBEZWNpbWFsLnNpbmggPSBzaW5oOyAgICAgICAgICAvLyBFUzZcclxuICAgIERlY2ltYWwuc3FydCA9IHNxcnQ7XHJcbiAgICBEZWNpbWFsLnN1YiA9IHN1YjtcclxuICAgIERlY2ltYWwudGFuID0gdGFuO1xyXG4gICAgRGVjaW1hbC50YW5oID0gdGFuaDsgICAgICAgICAgLy8gRVM2XHJcbiAgICBEZWNpbWFsLnRydW5jID0gdHJ1bmM7ICAgICAgICAvLyBFUzZcclxuXHJcbiAgICBpZiAob2JqID09PSB2b2lkIDApIG9iaiA9IHt9O1xyXG4gICAgaWYgKG9iaikge1xyXG4gICAgICBpZiAob2JqLmRlZmF1bHRzICE9PSB0cnVlKSB7XHJcbiAgICAgICAgcHMgPSBbJ3ByZWNpc2lvbicsICdyb3VuZGluZycsICd0b0V4cE5lZycsICd0b0V4cFBvcycsICdtYXhFJywgJ21pbkUnLCAnbW9kdWxvJywgJ2NyeXB0byddO1xyXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBwcy5sZW5ndGg7KSBpZiAoIW9iai5oYXNPd25Qcm9wZXJ0eShwID0gcHNbaSsrXSkpIG9ialtwXSA9IHRoaXNbcF07XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBEZWNpbWFsLmNvbmZpZyhvYmopO1xyXG5cclxuICAgIHJldHVybiBEZWNpbWFsO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgYHhgIGRpdmlkZWQgYnkgYHlgLCByb3VuZGVkIHRvIGBwcmVjaXNpb25gIHNpZ25pZmljYW50XHJcbiAgICogZGlnaXRzIHVzaW5nIHJvdW5kaW5nIG1vZGUgYHJvdW5kaW5nYC5cclxuICAgKlxyXG4gICAqIHgge251bWJlcnxzdHJpbmd8RGVjaW1hbH1cclxuICAgKiB5IHtudW1iZXJ8c3RyaW5nfERlY2ltYWx9XHJcbiAgICpcclxuICAgKi9cclxuICBmdW5jdGlvbiBkaXYoeCwgeSkge1xyXG4gICAgcmV0dXJuIG5ldyB0aGlzKHgpLmRpdih5KTtcclxuICB9XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSBuYXR1cmFsIGV4cG9uZW50aWFsIG9mIGB4YCwgcm91bmRlZCB0byBgcHJlY2lzaW9uYFxyXG4gICAqIHNpZ25pZmljYW50IGRpZ2l0cyB1c2luZyByb3VuZGluZyBtb2RlIGByb3VuZGluZ2AuXHJcbiAgICpcclxuICAgKiB4IHtudW1iZXJ8c3RyaW5nfERlY2ltYWx9IFRoZSBwb3dlciB0byB3aGljaCB0byByYWlzZSB0aGUgYmFzZSBvZiB0aGUgbmF0dXJhbCBsb2cuXHJcbiAgICpcclxuICAgKi9cclxuICBmdW5jdGlvbiBleHAoeCkge1xyXG4gICAgcmV0dXJuIG5ldyB0aGlzKHgpLmV4cCgpO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgYHhgIHJvdW5kIHRvIGFuIGludGVnZXIgdXNpbmcgYFJPVU5EX0ZMT09SYC5cclxuICAgKlxyXG4gICAqIHgge251bWJlcnxzdHJpbmd8RGVjaW1hbH1cclxuICAgKlxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGZsb29yKHgpIHtcclxuICAgIHJldHVybiBmaW5hbGlzZSh4ID0gbmV3IHRoaXMoeCksIHguZSArIDEsIDMpO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgdGhlIHNxdWFyZSByb290IG9mIHRoZSBzdW0gb2YgdGhlIHNxdWFyZXMgb2YgdGhlIGFyZ3VtZW50cyxcclxuICAgKiByb3VuZGVkIHRvIGBwcmVjaXNpb25gIHNpZ25pZmljYW50IGRpZ2l0cyB1c2luZyByb3VuZGluZyBtb2RlIGByb3VuZGluZ2AuXHJcbiAgICpcclxuICAgKiBoeXBvdChhLCBiLCAuLi4pID0gc3FydChhXjIgKyBiXjIgKyAuLi4pXHJcbiAgICpcclxuICAgKiBhcmd1bWVudHMge251bWJlcnxzdHJpbmd8RGVjaW1hbH1cclxuICAgKlxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGh5cG90KCkge1xyXG4gICAgdmFyIGksIG4sXHJcbiAgICAgIHQgPSBuZXcgdGhpcygwKTtcclxuXHJcbiAgICBleHRlcm5hbCA9IGZhbHNlO1xyXG5cclxuICAgIGZvciAoaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOykge1xyXG4gICAgICBuID0gbmV3IHRoaXMoYXJndW1lbnRzW2krK10pO1xyXG4gICAgICBpZiAoIW4uZCkge1xyXG4gICAgICAgIGlmIChuLnMpIHtcclxuICAgICAgICAgIGV4dGVybmFsID0gdHJ1ZTtcclxuICAgICAgICAgIHJldHVybiBuZXcgdGhpcygxIC8gMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHQgPSBuO1xyXG4gICAgICB9IGVsc2UgaWYgKHQuZCkge1xyXG4gICAgICAgIHQgPSB0LnBsdXMobi50aW1lcyhuKSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBleHRlcm5hbCA9IHRydWU7XHJcblxyXG4gICAgcmV0dXJuIHQuc3FydCgpO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIHRydWUgaWYgb2JqZWN0IGlzIGEgRGVjaW1hbCBpbnN0YW5jZSAod2hlcmUgRGVjaW1hbCBpcyBhbnkgRGVjaW1hbCBjb25zdHJ1Y3RvciksXHJcbiAgICogb3RoZXJ3aXNlIHJldHVybiBmYWxzZS5cclxuICAgKlxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGlzRGVjaW1hbEluc3RhbmNlKG9iaikge1xyXG4gICAgcmV0dXJuIG9iaiBpbnN0YW5jZW9mIERlY2ltYWwgfHwgb2JqICYmIG9iai5uYW1lID09PSAnW29iamVjdCBEZWNpbWFsXScgfHwgZmFsc2U7XHJcbiAgfVxyXG5cclxuXHJcbiAgLypcclxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgbmF0dXJhbCBsb2dhcml0aG0gb2YgYHhgLCByb3VuZGVkIHRvIGBwcmVjaXNpb25gXHJcbiAgICogc2lnbmlmaWNhbnQgZGlnaXRzIHVzaW5nIHJvdW5kaW5nIG1vZGUgYHJvdW5kaW5nYC5cclxuICAgKlxyXG4gICAqIHgge251bWJlcnxzdHJpbmd8RGVjaW1hbH1cclxuICAgKlxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGxuKHgpIHtcclxuICAgIHJldHVybiBuZXcgdGhpcyh4KS5sbigpO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgdGhlIGxvZyBvZiBgeGAgdG8gdGhlIGJhc2UgYHlgLCBvciB0byBiYXNlIDEwIGlmIG5vIGJhc2VcclxuICAgKiBpcyBzcGVjaWZpZWQsIHJvdW5kZWQgdG8gYHByZWNpc2lvbmAgc2lnbmlmaWNhbnQgZGlnaXRzIHVzaW5nIHJvdW5kaW5nIG1vZGUgYHJvdW5kaW5nYC5cclxuICAgKlxyXG4gICAqIGxvZ1t5XSh4KVxyXG4gICAqXHJcbiAgICogeCB7bnVtYmVyfHN0cmluZ3xEZWNpbWFsfSBUaGUgYXJndW1lbnQgb2YgdGhlIGxvZ2FyaXRobS5cclxuICAgKiB5IHtudW1iZXJ8c3RyaW5nfERlY2ltYWx9IFRoZSBiYXNlIG9mIHRoZSBsb2dhcml0aG0uXHJcbiAgICpcclxuICAgKi9cclxuICBmdW5jdGlvbiBsb2coeCwgeSkge1xyXG4gICAgcmV0dXJuIG5ldyB0aGlzKHgpLmxvZyh5KTtcclxuICB9XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSBiYXNlIDIgbG9nYXJpdGhtIG9mIGB4YCwgcm91bmRlZCB0byBgcHJlY2lzaW9uYFxyXG4gICAqIHNpZ25pZmljYW50IGRpZ2l0cyB1c2luZyByb3VuZGluZyBtb2RlIGByb3VuZGluZ2AuXHJcbiAgICpcclxuICAgKiB4IHtudW1iZXJ8c3RyaW5nfERlY2ltYWx9XHJcbiAgICpcclxuICAgKi9cclxuICBmdW5jdGlvbiBsb2cyKHgpIHtcclxuICAgIHJldHVybiBuZXcgdGhpcyh4KS5sb2coMik7XHJcbiAgfVxyXG5cclxuXHJcbiAgLypcclxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgYmFzZSAxMCBsb2dhcml0aG0gb2YgYHhgLCByb3VuZGVkIHRvIGBwcmVjaXNpb25gXHJcbiAgICogc2lnbmlmaWNhbnQgZGlnaXRzIHVzaW5nIHJvdW5kaW5nIG1vZGUgYHJvdW5kaW5nYC5cclxuICAgKlxyXG4gICAqIHgge251bWJlcnxzdHJpbmd8RGVjaW1hbH1cclxuICAgKlxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGxvZzEwKHgpIHtcclxuICAgIHJldHVybiBuZXcgdGhpcyh4KS5sb2coMTApO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgdGhlIG1heGltdW0gb2YgdGhlIGFyZ3VtZW50cy5cclxuICAgKlxyXG4gICAqIGFyZ3VtZW50cyB7bnVtYmVyfHN0cmluZ3xEZWNpbWFsfVxyXG4gICAqXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gbWF4KCkge1xyXG4gICAgcmV0dXJuIG1heE9yTWluKHRoaXMsIGFyZ3VtZW50cywgJ2x0Jyk7XHJcbiAgfVxyXG5cclxuXHJcbiAgLypcclxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgbWluaW11bSBvZiB0aGUgYXJndW1lbnRzLlxyXG4gICAqXHJcbiAgICogYXJndW1lbnRzIHtudW1iZXJ8c3RyaW5nfERlY2ltYWx9XHJcbiAgICpcclxuICAgKi9cclxuICBmdW5jdGlvbiBtaW4oKSB7XHJcbiAgICByZXR1cm4gbWF4T3JNaW4odGhpcywgYXJndW1lbnRzLCAnZ3QnKTtcclxuICB9XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIGB4YCBtb2R1bG8gYHlgLCByb3VuZGVkIHRvIGBwcmVjaXNpb25gIHNpZ25pZmljYW50IGRpZ2l0c1xyXG4gICAqIHVzaW5nIHJvdW5kaW5nIG1vZGUgYHJvdW5kaW5nYC5cclxuICAgKlxyXG4gICAqIHgge251bWJlcnxzdHJpbmd8RGVjaW1hbH1cclxuICAgKiB5IHtudW1iZXJ8c3RyaW5nfERlY2ltYWx9XHJcbiAgICpcclxuICAgKi9cclxuICBmdW5jdGlvbiBtb2QoeCwgeSkge1xyXG4gICAgcmV0dXJuIG5ldyB0aGlzKHgpLm1vZCh5KTtcclxuICB9XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIGB4YCBtdWx0aXBsaWVkIGJ5IGB5YCwgcm91bmRlZCB0byBgcHJlY2lzaW9uYCBzaWduaWZpY2FudFxyXG4gICAqIGRpZ2l0cyB1c2luZyByb3VuZGluZyBtb2RlIGByb3VuZGluZ2AuXHJcbiAgICpcclxuICAgKiB4IHtudW1iZXJ8c3RyaW5nfERlY2ltYWx9XHJcbiAgICogeSB7bnVtYmVyfHN0cmluZ3xEZWNpbWFsfVxyXG4gICAqXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gbXVsKHgsIHkpIHtcclxuICAgIHJldHVybiBuZXcgdGhpcyh4KS5tdWwoeSk7XHJcbiAgfVxyXG5cclxuXHJcbiAgLypcclxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyBgeGAgcmFpc2VkIHRvIHRoZSBwb3dlciBgeWAsIHJvdW5kZWQgdG8gcHJlY2lzaW9uXHJcbiAgICogc2lnbmlmaWNhbnQgZGlnaXRzIHVzaW5nIHJvdW5kaW5nIG1vZGUgYHJvdW5kaW5nYC5cclxuICAgKlxyXG4gICAqIHgge251bWJlcnxzdHJpbmd8RGVjaW1hbH0gVGhlIGJhc2UuXHJcbiAgICogeSB7bnVtYmVyfHN0cmluZ3xEZWNpbWFsfSBUaGUgZXhwb25lbnQuXHJcbiAgICpcclxuICAgKi9cclxuICBmdW5jdGlvbiBwb3coeCwgeSkge1xyXG4gICAgcmV0dXJuIG5ldyB0aGlzKHgpLnBvdyh5KTtcclxuICB9XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybnMgYSBuZXcgRGVjaW1hbCB3aXRoIGEgcmFuZG9tIHZhbHVlIGVxdWFsIHRvIG9yIGdyZWF0ZXIgdGhhbiAwIGFuZCBsZXNzIHRoYW4gMSwgYW5kIHdpdGhcclxuICAgKiBgc2RgLCBvciBgRGVjaW1hbC5wcmVjaXNpb25gIGlmIGBzZGAgaXMgb21pdHRlZCwgc2lnbmlmaWNhbnQgZGlnaXRzIChvciBsZXNzIGlmIHRyYWlsaW5nIHplcm9zXHJcbiAgICogYXJlIHByb2R1Y2VkKS5cclxuICAgKlxyXG4gICAqIFtzZF0ge251bWJlcn0gU2lnbmlmaWNhbnQgZGlnaXRzLiBJbnRlZ2VyLCAwIHRvIE1BWF9ESUdJVFMgaW5jbHVzaXZlLlxyXG4gICAqXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gcmFuZG9tKHNkKSB7XHJcbiAgICB2YXIgZCwgZSwgaywgbixcclxuICAgICAgaSA9IDAsXHJcbiAgICAgIHIgPSBuZXcgdGhpcygxKSxcclxuICAgICAgcmQgPSBbXTtcclxuXHJcbiAgICBpZiAoc2QgPT09IHZvaWQgMCkgc2QgPSB0aGlzLnByZWNpc2lvbjtcclxuICAgIGVsc2UgY2hlY2tJbnQzMihzZCwgMSwgTUFYX0RJR0lUUyk7XHJcblxyXG4gICAgayA9IE1hdGguY2VpbChzZCAvIExPR19CQVNFKTtcclxuXHJcbiAgICBpZiAoIXRoaXMuY3J5cHRvKSB7XHJcbiAgICAgIGZvciAoOyBpIDwgazspIHJkW2krK10gPSBNYXRoLnJhbmRvbSgpICogMWU3IHwgMDtcclxuXHJcbiAgICAvLyBCcm93c2VycyBzdXBwb3J0aW5nIGNyeXB0by5nZXRSYW5kb21WYWx1ZXMuXHJcbiAgICB9IGVsc2UgaWYgKGNyeXB0by5nZXRSYW5kb21WYWx1ZXMpIHtcclxuICAgICAgZCA9IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQzMkFycmF5KGspKTtcclxuXHJcbiAgICAgIGZvciAoOyBpIDwgazspIHtcclxuICAgICAgICBuID0gZFtpXTtcclxuXHJcbiAgICAgICAgLy8gMCA8PSBuIDwgNDI5NDk2NzI5NlxyXG4gICAgICAgIC8vIFByb2JhYmlsaXR5IG4gPj0gNC4yOWU5LCBpcyA0OTY3Mjk2IC8gNDI5NDk2NzI5NiA9IDAuMDAxMTYgKDEgaW4gODY1KS5cclxuICAgICAgICBpZiAobiA+PSA0LjI5ZTkpIHtcclxuICAgICAgICAgIGRbaV0gPSBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50MzJBcnJheSgxKSlbMF07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAvLyAwIDw9IG4gPD0gNDI4OTk5OTk5OVxyXG4gICAgICAgICAgLy8gMCA8PSAobiAlIDFlNykgPD0gOTk5OTk5OVxyXG4gICAgICAgICAgcmRbaSsrXSA9IG4gJSAxZTc7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgLy8gTm9kZS5qcyBzdXBwb3J0aW5nIGNyeXB0by5yYW5kb21CeXRlcy5cclxuICAgIH0gZWxzZSBpZiAoY3J5cHRvLnJhbmRvbUJ5dGVzKSB7XHJcblxyXG4gICAgICAvLyBidWZmZXJcclxuICAgICAgZCA9IGNyeXB0by5yYW5kb21CeXRlcyhrICo9IDQpO1xyXG5cclxuICAgICAgZm9yICg7IGkgPCBrOykge1xyXG5cclxuICAgICAgICAvLyAwIDw9IG4gPCAyMTQ3NDgzNjQ4XHJcbiAgICAgICAgbiA9IGRbaV0gKyAoZFtpICsgMV0gPDwgOCkgKyAoZFtpICsgMl0gPDwgMTYpICsgKChkW2kgKyAzXSAmIDB4N2YpIDw8IDI0KTtcclxuXHJcbiAgICAgICAgLy8gUHJvYmFiaWxpdHkgbiA+PSAyLjE0ZTksIGlzIDc0ODM2NDggLyAyMTQ3NDgzNjQ4ID0gMC4wMDM1ICgxIGluIDI4NikuXHJcbiAgICAgICAgaWYgKG4gPj0gMi4xNGU5KSB7XHJcbiAgICAgICAgICBjcnlwdG8ucmFuZG9tQnl0ZXMoNCkuY29weShkLCBpKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgIC8vIDAgPD0gbiA8PSAyMTM5OTk5OTk5XHJcbiAgICAgICAgICAvLyAwIDw9IChuICUgMWU3KSA8PSA5OTk5OTk5XHJcbiAgICAgICAgICByZC5wdXNoKG4gJSAxZTcpO1xyXG4gICAgICAgICAgaSArPSA0O1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgaSA9IGsgLyA0O1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhyb3cgRXJyb3IoY3J5cHRvVW5hdmFpbGFibGUpO1xyXG4gICAgfVxyXG5cclxuICAgIGsgPSByZFstLWldO1xyXG4gICAgc2QgJT0gTE9HX0JBU0U7XHJcblxyXG4gICAgLy8gQ29udmVydCB0cmFpbGluZyBkaWdpdHMgdG8gemVyb3MgYWNjb3JkaW5nIHRvIHNkLlxyXG4gICAgaWYgKGsgJiYgc2QpIHtcclxuICAgICAgbiA9IG1hdGhwb3coMTAsIExPR19CQVNFIC0gc2QpO1xyXG4gICAgICByZFtpXSA9IChrIC8gbiB8IDApICogbjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBSZW1vdmUgdHJhaWxpbmcgd29yZHMgd2hpY2ggYXJlIHplcm8uXHJcbiAgICBmb3IgKDsgcmRbaV0gPT09IDA7IGktLSkgcmQucG9wKCk7XHJcblxyXG4gICAgLy8gWmVybz9cclxuICAgIGlmIChpIDwgMCkge1xyXG4gICAgICBlID0gMDtcclxuICAgICAgcmQgPSBbMF07XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBlID0gLTE7XHJcblxyXG4gICAgICAvLyBSZW1vdmUgbGVhZGluZyB3b3JkcyB3aGljaCBhcmUgemVybyBhbmQgYWRqdXN0IGV4cG9uZW50IGFjY29yZGluZ2x5LlxyXG4gICAgICBmb3IgKDsgcmRbMF0gPT09IDA7IGUgLT0gTE9HX0JBU0UpIHJkLnNoaWZ0KCk7XHJcblxyXG4gICAgICAvLyBDb3VudCB0aGUgZGlnaXRzIG9mIHRoZSBmaXJzdCB3b3JkIG9mIHJkIHRvIGRldGVybWluZSBsZWFkaW5nIHplcm9zLlxyXG4gICAgICBmb3IgKGsgPSAxLCBuID0gcmRbMF07IG4gPj0gMTA7IG4gLz0gMTApIGsrKztcclxuXHJcbiAgICAgIC8vIEFkanVzdCB0aGUgZXhwb25lbnQgZm9yIGxlYWRpbmcgemVyb3Mgb2YgdGhlIGZpcnN0IHdvcmQgb2YgcmQuXHJcbiAgICAgIGlmIChrIDwgTE9HX0JBU0UpIGUgLT0gTE9HX0JBU0UgLSBrO1xyXG4gICAgfVxyXG5cclxuICAgIHIuZSA9IGU7XHJcbiAgICByLmQgPSByZDtcclxuXHJcbiAgICByZXR1cm4gcjtcclxuICB9XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIGB4YCByb3VuZGVkIHRvIGFuIGludGVnZXIgdXNpbmcgcm91bmRpbmcgbW9kZSBgcm91bmRpbmdgLlxyXG4gICAqXHJcbiAgICogVG8gZW11bGF0ZSBgTWF0aC5yb3VuZGAsIHNldCByb3VuZGluZyB0byA3IChST1VORF9IQUxGX0NFSUwpLlxyXG4gICAqXHJcbiAgICogeCB7bnVtYmVyfHN0cmluZ3xEZWNpbWFsfVxyXG4gICAqXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gcm91bmQoeCkge1xyXG4gICAgcmV0dXJuIGZpbmFsaXNlKHggPSBuZXcgdGhpcyh4KSwgeC5lICsgMSwgdGhpcy5yb3VuZGluZyk7XHJcbiAgfVxyXG5cclxuXHJcbiAgLypcclxuICAgKiBSZXR1cm5cclxuICAgKiAgIDEgICAgaWYgeCA+IDAsXHJcbiAgICogIC0xICAgIGlmIHggPCAwLFxyXG4gICAqICAgMCAgICBpZiB4IGlzIDAsXHJcbiAgICogIC0wICAgIGlmIHggaXMgLTAsXHJcbiAgICogICBOYU4gIG90aGVyd2lzZVxyXG4gICAqXHJcbiAgICogeCB7bnVtYmVyfHN0cmluZ3xEZWNpbWFsfVxyXG4gICAqXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gc2lnbih4KSB7XHJcbiAgICB4ID0gbmV3IHRoaXMoeCk7XHJcbiAgICByZXR1cm4geC5kID8gKHguZFswXSA/IHgucyA6IDAgKiB4LnMpIDogeC5zIHx8IE5hTjtcclxuICB9XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSBzaW5lIG9mIGB4YCwgcm91bmRlZCB0byBgcHJlY2lzaW9uYCBzaWduaWZpY2FudCBkaWdpdHNcclxuICAgKiB1c2luZyByb3VuZGluZyBtb2RlIGByb3VuZGluZ2AuXHJcbiAgICpcclxuICAgKiB4IHtudW1iZXJ8c3RyaW5nfERlY2ltYWx9IEEgdmFsdWUgaW4gcmFkaWFucy5cclxuICAgKlxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIHNpbih4KSB7XHJcbiAgICByZXR1cm4gbmV3IHRoaXMoeCkuc2luKCk7XHJcbiAgfVxyXG5cclxuXHJcbiAgLypcclxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgaHlwZXJib2xpYyBzaW5lIG9mIGB4YCwgcm91bmRlZCB0byBgcHJlY2lzaW9uYFxyXG4gICAqIHNpZ25pZmljYW50IGRpZ2l0cyB1c2luZyByb3VuZGluZyBtb2RlIGByb3VuZGluZ2AuXHJcbiAgICpcclxuICAgKiB4IHtudW1iZXJ8c3RyaW5nfERlY2ltYWx9IEEgdmFsdWUgaW4gcmFkaWFucy5cclxuICAgKlxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIHNpbmgoeCkge1xyXG4gICAgcmV0dXJuIG5ldyB0aGlzKHgpLnNpbmgoKTtcclxuICB9XHJcblxyXG5cclxuICAvKlxyXG4gICAqIFJldHVybiBhIG5ldyBEZWNpbWFsIHdob3NlIHZhbHVlIGlzIHRoZSBzcXVhcmUgcm9vdCBvZiBgeGAsIHJvdW5kZWQgdG8gYHByZWNpc2lvbmAgc2lnbmlmaWNhbnRcclxuICAgKiBkaWdpdHMgdXNpbmcgcm91bmRpbmcgbW9kZSBgcm91bmRpbmdgLlxyXG4gICAqXHJcbiAgICogeCB7bnVtYmVyfHN0cmluZ3xEZWNpbWFsfVxyXG4gICAqXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gc3FydCh4KSB7XHJcbiAgICByZXR1cm4gbmV3IHRoaXMoeCkuc3FydCgpO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgYHhgIG1pbnVzIGB5YCwgcm91bmRlZCB0byBgcHJlY2lzaW9uYCBzaWduaWZpY2FudCBkaWdpdHNcclxuICAgKiB1c2luZyByb3VuZGluZyBtb2RlIGByb3VuZGluZ2AuXHJcbiAgICpcclxuICAgKiB4IHtudW1iZXJ8c3RyaW5nfERlY2ltYWx9XHJcbiAgICogeSB7bnVtYmVyfHN0cmluZ3xEZWNpbWFsfVxyXG4gICAqXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gc3ViKHgsIHkpIHtcclxuICAgIHJldHVybiBuZXcgdGhpcyh4KS5zdWIoeSk7XHJcbiAgfVxyXG5cclxuXHJcbiAgLypcclxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyB0aGUgdGFuZ2VudCBvZiBgeGAsIHJvdW5kZWQgdG8gYHByZWNpc2lvbmAgc2lnbmlmaWNhbnRcclxuICAgKiBkaWdpdHMgdXNpbmcgcm91bmRpbmcgbW9kZSBgcm91bmRpbmdgLlxyXG4gICAqXHJcbiAgICogeCB7bnVtYmVyfHN0cmluZ3xEZWNpbWFsfSBBIHZhbHVlIGluIHJhZGlhbnMuXHJcbiAgICpcclxuICAgKi9cclxuICBmdW5jdGlvbiB0YW4oeCkge1xyXG4gICAgcmV0dXJuIG5ldyB0aGlzKHgpLnRhbigpO1xyXG4gIH1cclxuXHJcblxyXG4gIC8qXHJcbiAgICogUmV0dXJuIGEgbmV3IERlY2ltYWwgd2hvc2UgdmFsdWUgaXMgdGhlIGh5cGVyYm9saWMgdGFuZ2VudCBvZiBgeGAsIHJvdW5kZWQgdG8gYHByZWNpc2lvbmBcclxuICAgKiBzaWduaWZpY2FudCBkaWdpdHMgdXNpbmcgcm91bmRpbmcgbW9kZSBgcm91bmRpbmdgLlxyXG4gICAqXHJcbiAgICogeCB7bnVtYmVyfHN0cmluZ3xEZWNpbWFsfSBBIHZhbHVlIGluIHJhZGlhbnMuXHJcbiAgICpcclxuICAgKi9cclxuICBmdW5jdGlvbiB0YW5oKHgpIHtcclxuICAgIHJldHVybiBuZXcgdGhpcyh4KS50YW5oKCk7XHJcbiAgfVxyXG5cclxuXHJcbiAgLypcclxuICAgKiBSZXR1cm4gYSBuZXcgRGVjaW1hbCB3aG9zZSB2YWx1ZSBpcyBgeGAgdHJ1bmNhdGVkIHRvIGFuIGludGVnZXIuXHJcbiAgICpcclxuICAgKiB4IHtudW1iZXJ8c3RyaW5nfERlY2ltYWx9XHJcbiAgICpcclxuICAgKi9cclxuICBmdW5jdGlvbiB0cnVuYyh4KSB7XHJcbiAgICByZXR1cm4gZmluYWxpc2UoeCA9IG5ldyB0aGlzKHgpLCB4LmUgKyAxLCAxKTtcclxuICB9XHJcblxyXG5cclxuICAvLyBDcmVhdGUgYW5kIGNvbmZpZ3VyZSBpbml0aWFsIERlY2ltYWwgY29uc3RydWN0b3IuXHJcbiAgRGVjaW1hbCA9IGNsb25lKERFRkFVTFRTKTtcclxuXHJcbiAgRGVjaW1hbFsnZGVmYXVsdCddID0gRGVjaW1hbC5EZWNpbWFsID0gRGVjaW1hbDtcclxuXHJcbiAgLy8gQ3JlYXRlIHRoZSBpbnRlcm5hbCBjb25zdGFudHMgZnJvbSB0aGVpciBzdHJpbmcgdmFsdWVzLlxyXG4gIExOMTAgPSBuZXcgRGVjaW1hbChMTjEwKTtcclxuICBQSSA9IG5ldyBEZWNpbWFsKFBJKTtcclxuXHJcblxyXG4gIC8vIEV4cG9ydC5cclxuXHJcblxyXG4gIC8vIEFNRC5cclxuICBpZiAodHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcclxuICAgIGRlZmluZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHJldHVybiBEZWNpbWFsO1xyXG4gICAgfSk7XHJcblxyXG4gIC8vIE5vZGUgYW5kIG90aGVyIGVudmlyb25tZW50cyB0aGF0IHN1cHBvcnQgbW9kdWxlLmV4cG9ydHMuXHJcbiAgfSBlbHNlIGlmICh0eXBlb2YgbW9kdWxlICE9ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XHJcbiAgICBpZiAodHlwZW9mIFN5bWJvbCA9PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT0gJ3N5bWJvbCcpIHtcclxuICAgICAgUFtTeW1ib2wuZm9yKCdub2RlanMudXRpbC5pbnNwZWN0LmN1c3RvbScpXSA9IFAudG9TdHJpbmc7XHJcbiAgICAgIFBbU3ltYm9sLnRvU3RyaW5nVGFnXSA9ICdEZWNpbWFsJztcclxuICAgIH1cclxuXHJcbiAgICBtb2R1bGUuZXhwb3J0cyA9IERlY2ltYWw7XHJcblxyXG4gIC8vIEJyb3dzZXIuXHJcbiAgfSBlbHNlIHtcclxuICAgIGlmICghZ2xvYmFsU2NvcGUpIHtcclxuICAgICAgZ2xvYmFsU2NvcGUgPSB0eXBlb2Ygc2VsZiAhPSAndW5kZWZpbmVkJyAmJiBzZWxmICYmIHNlbGYuc2VsZiA9PSBzZWxmID8gc2VsZiA6IHdpbmRvdztcclxuICAgIH1cclxuXHJcbiAgICBub0NvbmZsaWN0ID0gZ2xvYmFsU2NvcGUuRGVjaW1hbDtcclxuICAgIERlY2ltYWwubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgZ2xvYmFsU2NvcGUuRGVjaW1hbCA9IG5vQ29uZmxpY3Q7XHJcbiAgICAgIHJldHVybiBEZWNpbWFsO1xyXG4gICAgfTtcclxuXHJcbiAgICBnbG9iYWxTY29wZS5EZWNpbWFsID0gRGVjaW1hbDtcclxuICB9XHJcbn0pKHRoaXMpO1xyXG4iLCJleHBvcnRzLnJlYWQgPSBmdW5jdGlvbiAoYnVmZmVyLCBvZmZzZXQsIGlzTEUsIG1MZW4sIG5CeXRlcykge1xuICB2YXIgZSwgbVxuICB2YXIgZUxlbiA9IChuQnl0ZXMgKiA4KSAtIG1MZW4gLSAxXG4gIHZhciBlTWF4ID0gKDEgPDwgZUxlbikgLSAxXG4gIHZhciBlQmlhcyA9IGVNYXggPj4gMVxuICB2YXIgbkJpdHMgPSAtN1xuICB2YXIgaSA9IGlzTEUgPyAobkJ5dGVzIC0gMSkgOiAwXG4gIHZhciBkID0gaXNMRSA/IC0xIDogMVxuICB2YXIgcyA9IGJ1ZmZlcltvZmZzZXQgKyBpXVxuXG4gIGkgKz0gZFxuXG4gIGUgPSBzICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpXG4gIHMgPj49ICgtbkJpdHMpXG4gIG5CaXRzICs9IGVMZW5cbiAgZm9yICg7IG5CaXRzID4gMDsgZSA9IChlICogMjU2KSArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KSB7fVxuXG4gIG0gPSBlICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpXG4gIGUgPj49ICgtbkJpdHMpXG4gIG5CaXRzICs9IG1MZW5cbiAgZm9yICg7IG5CaXRzID4gMDsgbSA9IChtICogMjU2KSArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KSB7fVxuXG4gIGlmIChlID09PSAwKSB7XG4gICAgZSA9IDEgLSBlQmlhc1xuICB9IGVsc2UgaWYgKGUgPT09IGVNYXgpIHtcbiAgICByZXR1cm4gbSA/IE5hTiA6ICgocyA/IC0xIDogMSkgKiBJbmZpbml0eSlcbiAgfSBlbHNlIHtcbiAgICBtID0gbSArIE1hdGgucG93KDIsIG1MZW4pXG4gICAgZSA9IGUgLSBlQmlhc1xuICB9XG4gIHJldHVybiAocyA/IC0xIDogMSkgKiBtICogTWF0aC5wb3coMiwgZSAtIG1MZW4pXG59XG5cbmV4cG9ydHMud3JpdGUgPSBmdW5jdGlvbiAoYnVmZmVyLCB2YWx1ZSwgb2Zmc2V0LCBpc0xFLCBtTGVuLCBuQnl0ZXMpIHtcbiAgdmFyIGUsIG0sIGNcbiAgdmFyIGVMZW4gPSAobkJ5dGVzICogOCkgLSBtTGVuIC0gMVxuICB2YXIgZU1heCA9ICgxIDw8IGVMZW4pIC0gMVxuICB2YXIgZUJpYXMgPSBlTWF4ID4+IDFcbiAgdmFyIHJ0ID0gKG1MZW4gPT09IDIzID8gTWF0aC5wb3coMiwgLTI0KSAtIE1hdGgucG93KDIsIC03NykgOiAwKVxuICB2YXIgaSA9IGlzTEUgPyAwIDogKG5CeXRlcyAtIDEpXG4gIHZhciBkID0gaXNMRSA/IDEgOiAtMVxuICB2YXIgcyA9IHZhbHVlIDwgMCB8fCAodmFsdWUgPT09IDAgJiYgMSAvIHZhbHVlIDwgMCkgPyAxIDogMFxuXG4gIHZhbHVlID0gTWF0aC5hYnModmFsdWUpXG5cbiAgaWYgKGlzTmFOKHZhbHVlKSB8fCB2YWx1ZSA9PT0gSW5maW5pdHkpIHtcbiAgICBtID0gaXNOYU4odmFsdWUpID8gMSA6IDBcbiAgICBlID0gZU1heFxuICB9IGVsc2Uge1xuICAgIGUgPSBNYXRoLmZsb29yKE1hdGgubG9nKHZhbHVlKSAvIE1hdGguTE4yKVxuICAgIGlmICh2YWx1ZSAqIChjID0gTWF0aC5wb3coMiwgLWUpKSA8IDEpIHtcbiAgICAgIGUtLVxuICAgICAgYyAqPSAyXG4gICAgfVxuICAgIGlmIChlICsgZUJpYXMgPj0gMSkge1xuICAgICAgdmFsdWUgKz0gcnQgLyBjXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhbHVlICs9IHJ0ICogTWF0aC5wb3coMiwgMSAtIGVCaWFzKVxuICAgIH1cbiAgICBpZiAodmFsdWUgKiBjID49IDIpIHtcbiAgICAgIGUrK1xuICAgICAgYyAvPSAyXG4gICAgfVxuXG4gICAgaWYgKGUgKyBlQmlhcyA+PSBlTWF4KSB7XG4gICAgICBtID0gMFxuICAgICAgZSA9IGVNYXhcbiAgICB9IGVsc2UgaWYgKGUgKyBlQmlhcyA+PSAxKSB7XG4gICAgICBtID0gKCh2YWx1ZSAqIGMpIC0gMSkgKiBNYXRoLnBvdygyLCBtTGVuKVxuICAgICAgZSA9IGUgKyBlQmlhc1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gdmFsdWUgKiBNYXRoLnBvdygyLCBlQmlhcyAtIDEpICogTWF0aC5wb3coMiwgbUxlbilcbiAgICAgIGUgPSAwXG4gICAgfVxuICB9XG5cbiAgZm9yICg7IG1MZW4gPj0gODsgYnVmZmVyW29mZnNldCArIGldID0gbSAmIDB4ZmYsIGkgKz0gZCwgbSAvPSAyNTYsIG1MZW4gLT0gOCkge31cblxuICBlID0gKGUgPDwgbUxlbikgfCBtXG4gIGVMZW4gKz0gbUxlblxuICBmb3IgKDsgZUxlbiA+IDA7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IGUgJiAweGZmLCBpICs9IGQsIGUgLz0gMjU2LCBlTGVuIC09IDgpIHt9XG5cbiAgYnVmZmVyW29mZnNldCArIGkgLSBkXSB8PSBzICogMTI4XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHByb2JsZW0gPSBuZXcgUHJvYmxlbSBcIlwiXCJcclxuXHJcblByb2JsZW0gMTogTXVsdGlwbGVzIG9mIDMgYW5kIDVcclxuLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuSWYgd2UgbGlzdCBhbGwgdGhlIG5hdHVyYWwgbnVtYmVycyBiZWxvdyAxMCB0aGF0IGFyZSBtdWx0aXBsZXMgb2YgMyBvciA1LCB3ZSBnZXQgMywgNSwgNiBhbmQgOS5cclxuVGhlIHN1bSBvZiB0aGVzZSBtdWx0aXBsZXMgaXMgMjMuXHJcblxyXG5GaW5kIHRoZSBzdW0gb2YgYWxsIHRoZSBtdWx0aXBsZXMgb2YgMyBvciA1IGJlbG93IDEwMDAuXHJcblxyXG5cIlwiXCJcclxuXHJcbnByb2JsZW0udGVzdCA9IC0+XHJcbiAgc3VtID0gMFxyXG4gIGZvciBpIGluIFsxLi4uMTBdXHJcbiAgICBpZiAoaSAlIDMgPT0gMCkgb3IgKGkgJSA1ID09IDApXHJcbiAgICAgIHN1bSArPSBpXHJcbiAgZXF1YWwoc3VtLCAyMywgXCJTdW0gb2YgbmF0dXJhbCBudW1iZXJzIDwgMTA6ICN7c3VtfVwiKVxyXG5cclxucHJvYmxlbS5hbnN3ZXIgPSAtPlxyXG4gIHN1bSA9IDBcclxuICBmb3IgaSBpbiBbMS4uLjEwMDBdXHJcbiAgICBpZiAoaSAlIDMgPT0gMCkgb3IgKGkgJSA1ID09IDApXHJcbiAgICAgIHN1bSArPSBpXHJcblxyXG4gIHJldHVybiBzdW1cclxuIiwibW9kdWxlLmV4cG9ydHMgPSBwcm9ibGVtID0gbmV3IFByb2JsZW0gXCJcIlwiXHJcblxyXG5Qcm9ibGVtIDI6IEV2ZW4gRmlib25hY2NpIG51bWJlcnNcclxuLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5FYWNoIG5ldyB0ZXJtIGluIHRoZSBGaWJvbmFjY2kgc2VxdWVuY2UgaXMgZ2VuZXJhdGVkIGJ5IGFkZGluZyB0aGUgcHJldmlvdXMgdHdvIHRlcm1zLlxyXG5CeSBzdGFydGluZyB3aXRoIDEgYW5kIDIsIHRoZSBmaXJzdCAxMCB0ZXJtcyB3aWxsIGJlOlxyXG5cclxuMSwgMiwgMywgNSwgOCwgMTMsIDIxLCAzNCwgNTUsIDg5LCAuLi5cclxuXHJcbkJ5IGNvbnNpZGVyaW5nIHRoZSB0ZXJtcyBpbiB0aGUgRmlib25hY2NpIHNlcXVlbmNlIHdob3NlIHZhbHVlcyBkbyBub3QgZXhjZWVkIGZvdXIgbWlsbGlvbixcclxuZmluZCB0aGUgc3VtIG9mIHRoZSBldmVuLXZhbHVlZCB0ZXJtcy5cclxuXHJcblwiXCJcIlxyXG5cclxucHJvYmxlbS5hbnN3ZXIgPSAtPlxyXG4gIHByZXYgPSAxXHJcbiAgY3VyciA9IDFcclxuICBzdW0gPSAwXHJcblxyXG4gIHdoaWxlIGN1cnIgPCA0MDAwMDAwXHJcbiAgICBpZiAoY3VyciAlIDIpID09IDBcclxuICAgICAgc3VtICs9IGN1cnJcclxuXHJcbiAgICBuZXh0ID0gY3VyciArIHByZXZcclxuICAgIHByZXYgPSBjdXJyXHJcbiAgICBjdXJyID0gbmV4dFxyXG5cclxuICByZXR1cm4gc3VtXHJcbiIsIm1vZHVsZS5leHBvcnRzID0gcHJvYmxlbSA9IG5ldyBQcm9ibGVtIFwiXCJcIlxyXG5cclxuUHJvYmxlbSAzOiBMYXJnZXN0IHByaW1lIGZhY3RvclxyXG4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5UaGUgcHJpbWUgZmFjdG9ycyBvZiAxMzE5NSBhcmUgNSwgNywgMTMgYW5kIDI5LlxyXG5cclxuV2hhdCBpcyB0aGUgbGFyZ2VzdCBwcmltZSBmYWN0b3Igb2YgdGhlIG51bWJlciA2MDA4NTE0NzUxNDMgP1xyXG5cclxuXCJcIlwiXHJcblxyXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiMgU2hhbWVsZXNzbHkgcGlsZmVyZWQvYWRvcHRlZCBmcm9tIGh0dHA6Ly93d3cuamF2YXNjcmlwdGVyLm5ldC9mYXEvbnVtYmVyaXNwcmltZS5odG1cclxuXHJcbmxlYXN0RmFjdG9yID0gKG4pIC0+XHJcbiAgcmV0dXJuIE5hTiBpZiBpc05hTihuKSBvciBub3QgaXNGaW5pdGUobilcclxuICByZXR1cm4gMCBpZiBuID09IDBcclxuICByZXR1cm4gMSBpZiAobiAlIDEpICE9IDAgb3IgKG4gKiBuKSA8IDJcclxuICByZXR1cm4gMiBpZiAobiAlIDIpID09IDBcclxuICByZXR1cm4gMyBpZiAobiAlIDMpID09IDBcclxuICByZXR1cm4gNSBpZiAobiAlIDUpID09IDBcclxuXHJcbiAgbSA9IE1hdGguc3FydCBuXHJcbiAgZm9yIGkgaW4gWzcuLm1dIGJ5IDMwXHJcbiAgICByZXR1cm4gaSAgICBpZiAobiAlIGkpICAgICAgPT0gMFxyXG4gICAgcmV0dXJuIGkrNCAgaWYgKG4gJSAoaSs0KSkgID09IDBcclxuICAgIHJldHVybiBpKzYgIGlmIChuICUgKGkrNikpICA9PSAwXHJcbiAgICByZXR1cm4gaSsxMCBpZiAobiAlIChpKzEwKSkgPT0gMFxyXG4gICAgcmV0dXJuIGkrMTIgaWYgKG4gJSAoaSsxMikpID09IDBcclxuICAgIHJldHVybiBpKzE2IGlmIChuICUgKGkrMTYpKSA9PSAwXHJcbiAgICByZXR1cm4gaSsyMiBpZiAobiAlIChpKzIyKSkgPT0gMFxyXG4gICAgcmV0dXJuIGkrMjQgaWYgKG4gJSAoaSsyNCkpID09IDBcclxuXHJcbiAgcmV0dXJuIG5cclxuXHJcbmlzUHJpbWUgPSAobikgLT5cclxuICBpZiBpc05hTihuKSBvciBub3QgaXNGaW5pdGUobikgb3IgKG4gJSAxKSAhPSAwIG9yIChuIDwgMilcclxuICAgIHJldHVybiBmYWxzZVxyXG4gIGlmIG4gPT0gbGVhc3RGYWN0b3IobilcclxuICAgIHJldHVybiB0cnVlXHJcblxyXG4gIHJldHVybiBmYWxzZVxyXG5cclxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxucHJpbWVGYWN0b3JzID0gKG4pIC0+XHJcbiAgcmV0dXJuIFsxXSBpZiBuID09IDFcclxuXHJcbiAgZmFjdG9ycyA9IFtdXHJcbiAgd2hpbGUgbm90IGlzUHJpbWUobilcclxuICAgIGZhY3RvciA9IGxlYXN0RmFjdG9yKG4pXHJcbiAgICBmYWN0b3JzLnB1c2ggZmFjdG9yXHJcbiAgICBuIC89IGZhY3RvclxyXG4gIGZhY3RvcnMucHVzaCBuXHJcbiAgcmV0dXJuIGZhY3RvcnNcclxuXHJcbmxhcmdlc3RQcmltZUZhY3RvciA9IChuKSAtPlxyXG4gIHJldHVybiAxIGlmIG4gPT0gMVxyXG5cclxuICB3aGlsZSBub3QgaXNQcmltZShuKVxyXG4gICAgZmFjdG9yID0gbGVhc3RGYWN0b3IobilcclxuICAgIG4gLz0gZmFjdG9yXHJcbiAgcmV0dXJuIG5cclxuXHJcbnByb2JsZW0uYW5zd2VyID0gLT5cclxuICByZXR1cm4gbGFyZ2VzdFByaW1lRmFjdG9yKDYwMDg1MTQ3NTE0MylcclxuIiwibW9kdWxlLmV4cG9ydHMgPSBwcm9ibGVtID0gbmV3IFByb2JsZW0gXCJcIlwiXHJcblxyXG5Qcm9ibGVtIDQ6IExhcmdlc3QgcGFsaW5kcm9tZSBwcm9kdWN0XHJcbi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbkEgcGFsaW5kcm9taWMgbnVtYmVyIHJlYWRzIHRoZSBzYW1lIGJvdGggd2F5cy5cclxuXHJcbkZpbmQgdGhlIGxhcmdlc3QgcGFsaW5kcm9tZSBtYWRlIGZyb20gdGhlIHByb2R1Y3Qgb2YgdHdvIDMtZGlnaXQgbnVtYmVycy5cclxuXHJcblwiXCJcIlxyXG5cclxuaXNQYWxpbmRyb21lID0gKG4pIC0+XHJcbiAgc3RyID0gbi50b1N0cmluZygpXHJcbiAgZm9yIGkgaW4gWzAuLi4oc3RyLmxlbmd0aCAvIDIpXVxyXG4gICAgaWYgc3RyW2ldICE9IHN0cltzdHIubGVuZ3RoIC0gMSAtIGldXHJcbiAgICAgIHJldHVybiBmYWxzZVxyXG4gIHJldHVybiB0cnVlXHJcblxyXG5wcm9ibGVtLnRlc3QgPSAtPlxyXG4gICMgTWFrZSBzdXJlIGlzUGFsaW5kcm9tZSB3b3JrcyBwcm9wZXJseSBmaXJzdFxyXG4gIGZvciB2IGluIFsxLCAxMSwgMTIxLCAxMjIxLCAxMjMyMSwgMTIzNDMyMV1cclxuICAgIGVxdWFsKGlzUGFsaW5kcm9tZSh2KSwgdHJ1ZSwgXCJpc1BhbGluZHJvbWUoI3t2fSkgcmV0dXJucyB0cnVlXCIpXHJcbiAgZm9yIHYgaW4gWzEyLCAxMjMsIDEyMzQsIDEyMzQ1LCAxMjM0NTYsIDEyMzI0XVxyXG4gICAgZXF1YWwoaXNQYWxpbmRyb21lKHYpLCBmYWxzZSwgXCJpc1BhbGluZHJvbWUoI3t2fSkgcmV0dXJucyBmYWxzZVwiKVxyXG5cclxucHJvYmxlbS5hbnN3ZXIgPSAtPlxyXG4gIGxhcmdlc3RpID0gMFxyXG4gIGxhcmdlc3RqID0gMFxyXG4gIGxhcmdlc3RwID0gMFxyXG5cclxuICBmb3IgaSBpbiBbMTAwLi45OTldXHJcbiAgICBmb3IgaiBpbiBbMTAwLi45OTldXHJcbiAgICAgIHByb2R1Y3QgPSBpICogalxyXG4gICAgICBpZiBpc1BhbGluZHJvbWUocHJvZHVjdCkgYW5kIChwcm9kdWN0ID4gbGFyZ2VzdHApXHJcbiAgICAgICAgbGFyZ2VzdGkgPSBpXHJcbiAgICAgICAgbGFyZ2VzdGogPSBqXHJcbiAgICAgICAgbGFyZ2VzdHAgPSBwcm9kdWN0XHJcblxyXG4gIHJldHVybiBsYXJnZXN0cFxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHByb2JsZW0gPSBuZXcgUHJvYmxlbSBcIlwiXCJcclxuXHJcblByb2JsZW0gNTogU21hbGxlc3QgbXVsdGlwbGVcclxuLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuMjUyMCBpcyB0aGUgc21hbGxlc3QgbnVtYmVyIHRoYXQgY2FuIGJlIGRpdmlkZWQgYnkgZWFjaCBvZiB0aGUgbnVtYmVycyBmcm9tIDEgdG8gMTAgd2l0aG91dCBhbnkgcmVtYWluZGVyLlxyXG5cclxuV2hhdCBpcyB0aGUgc21hbGxlc3QgcG9zaXRpdmUgbnVtYmVyIHRoYXQgaXMgZXZlbmx5IGRpdmlzaWJsZSBieSBhbGwgb2YgdGhlIG51bWJlcnMgZnJvbSAxIHRvIDIwP1xyXG5cclxuXCJcIlwiXHJcblxyXG5wcm9ibGVtLmFuc3dlciA9IC0+XHJcbiAgbiA9IDBcclxuICBsb29wXHJcbiAgICBuICs9IDIwICMgUHJvYmFibHkgY291bGQgYmUgc29tZSBjbGV2ZXIgc3VtIG9mIHByaW1lcyBiZXR3ZWVuIDEtMjAgb3Igc29tZXRoaW5nLiBJIGRvbid0IGNhcmUuXHJcbiAgICBmb3VuZCA9IHRydWVcclxuICAgIGZvciBpIGluIFsxLi4yMF1cclxuICAgICAgaWYgKG4gJSBpKSAhPSAwXHJcbiAgICAgICAgZm91bmQgPSBmYWxzZVxyXG4gICAgICAgIGJyZWFrXHJcblxyXG4gICAgYnJlYWsgaWYgZm91bmRcclxuXHJcbiAgcmV0dXJuIG5cclxuIiwibW9kdWxlLmV4cG9ydHMgPSBwcm9ibGVtID0gbmV3IFByb2JsZW0gXCJcIlwiXHJcblxyXG5Qcm9ibGVtIDY6IFN1bSBzcXVhcmUgZGlmZmVyZW5jZVxyXG4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuVGhlIHN1bSBvZiB0aGUgc3F1YXJlcyBvZiB0aGUgZmlyc3QgdGVuIG5hdHVyYWwgbnVtYmVycyBpcyxcclxuXHJcbiAgICAgICAgICAgICAxXjIgKyAyXjIgKyAuLi4gKyAxMF4yID0gMzg1XHJcblxyXG5UaGUgc3F1YXJlIG9mIHRoZSBzdW0gb2YgdGhlIGZpcnN0IHRlbiBuYXR1cmFsIG51bWJlcnMgaXMsXHJcblxyXG4gICAgICAgICAgKDEgKyAyICsgLi4uICsgMTApXjIgPSA1NV4yID0gMzAyNVxyXG5cclxuSGVuY2UgdGhlIGRpZmZlcmVuY2UgYmV0d2VlbiB0aGUgc3VtIG9mIHRoZSBzcXVhcmVzIG9mIHRoZSBmaXJzdCB0ZW4gbmF0dXJhbCBudW1iZXJzIGFuZCB0aGUgc3F1YXJlIG9mIHRoZSBzdW0gaXMgMzAyNSDiiJIgMzg1ID0gMjY0MC5cclxuXHJcbkZpbmQgdGhlIGRpZmZlcmVuY2UgYmV0d2VlbiB0aGUgc3VtIG9mIHRoZSBzcXVhcmVzIG9mIHRoZSBmaXJzdCBvbmUgaHVuZHJlZCBuYXR1cmFsIG51bWJlcnMgYW5kIHRoZSBzcXVhcmUgb2YgdGhlIHN1bS5cclxuXHJcblwiXCJcIlxyXG5cclxuc3VtT2ZTcXVhcmVzID0gKG4pIC0+XHJcbiAgc3VtID0gMFxyXG4gIGZvciBpIGluIFsxLi5uXVxyXG4gICAgc3VtICs9IChpICogaSlcclxuICByZXR1cm4gc3VtXHJcblxyXG5zcXVhcmVPZlN1bSA9IChuKSAtPlxyXG4gIHN1bSA9IDBcclxuICBmb3IgaSBpbiBbMS4ubl1cclxuICAgIHN1bSArPSBpXHJcbiAgcmV0dXJuIChzdW0gKiBzdW0pXHJcblxyXG5kaWZmZXJlbmNlU3VtU3F1YXJlcyA9IChuKSAtPlxyXG4gIHJldHVybiBzcXVhcmVPZlN1bShuKSAtIHN1bU9mU3F1YXJlcyhuKVxyXG5cclxucHJvYmxlbS50ZXN0ID0gLT5cclxuICBlcXVhbChzdW1PZlNxdWFyZXMoMTApLCAzODUsIFwiU3VtIG9mIHNxdWFyZXMgb2YgZmlyc3QgdGVuIG5hdHVyYWwgbnVtYmVycyBpcyAzODVcIilcclxuICBlcXVhbChzcXVhcmVPZlN1bSgxMCksIDMwMjUsIFwiU3F1YXJlIG9mIHN1bSBvZiBmaXJzdCB0ZW4gbmF0dXJhbCBudW1iZXJzIGlzIDMwMjVcIilcclxuICBlcXVhbChkaWZmZXJlbmNlU3VtU3F1YXJlcygxMCksIDI2NDAsIFwiRGlmZmVyZW5jZSBpbiB2YWx1ZXMgZm9yIHRoZSBmaXJzdCB0ZW4gbmF0dXJhbCBudW1iZXJzIGlzIDI2NDBcIilcclxuXHJcbnByb2JsZW0uYW5zd2VyID0gLT5cclxuICByZXR1cm4gZGlmZmVyZW5jZVN1bVNxdWFyZXMoMTAwKVxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHByb2JsZW0gPSBuZXcgUHJvYmxlbSBcIlwiXCJcclxuXHJcblByb2JsZW0gNzogMTAwMDFzdCBwcmltZVxyXG4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbkJ5IGxpc3RpbmcgdGhlIGZpcnN0IHNpeCBwcmltZSBudW1iZXJzOiAyLCAzLCA1LCA3LCAxMSwgYW5kIDEzLCB3ZSBjYW4gc2VlIHRoYXQgdGhlIDZ0aCBwcmltZSBpcyAxMy5cclxuXHJcbldoYXQgaXMgdGhlIDEwLDAwMXN0IHByaW1lIG51bWJlcj9cclxuXHJcblwiXCJcIlxyXG5cclxubWF0aCA9IHJlcXVpcmUgXCJtYXRoXCJcclxuXHJcbm50aFByaW1lID0gKG4pIC0+XHJcbiAgc2lldmUgPSBuZXcgbWF0aC5JbmNyZW1lbnRhbFNpZXZlXHJcbiAgZm9yIGkgaW4gWzEuLi5uXVxyXG4gICAgc2lldmUubmV4dCgpXHJcbiAgcmV0dXJuIHNpZXZlLm5leHQoKVxyXG5cclxucHJvYmxlbS50ZXN0ID0gLT5cclxuICBlcXVhbChudGhQcmltZSg2KSwgMTMsIFwiNnRoIHByaW1lIGlzIDEzXCIpXHJcblxyXG5wcm9ibGVtLmFuc3dlciA9IC0+XHJcbiAgcmV0dXJuIG50aFByaW1lKDEwMDAxKVxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHByb2JsZW0gPSBuZXcgUHJvYmxlbSBcIlwiXCJcclxuXHJcblByb2JsZW0gODogTGFyZ2VzdCBwcm9kdWN0IGluIGEgc2VyaWVzXHJcbi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5UaGUgZm91ciBhZGphY2VudCBkaWdpdHMgaW4gdGhlIDEwMDAtZGlnaXQgbnVtYmVyIHRoYXQgaGF2ZSB0aGUgZ3JlYXRlc3QgcHJvZHVjdCBhcmUgOSB4IDkgeCA4IHggOSA9IDU4MzIuXHJcblxyXG4gIDczMTY3MTc2NTMxMzMwNjI0OTE5MjI1MTE5Njc0NDI2NTc0NzQyMzU1MzQ5MTk0OTM0XHJcbiAgOTY5ODM1MjAzMTI3NzQ1MDYzMjYyMzk1NzgzMTgwMTY5ODQ4MDE4Njk0Nzg4NTE4NDNcclxuICA4NTg2MTU2MDc4OTExMjk0OTQ5NTQ1OTUwMTczNzk1ODMzMTk1Mjg1MzIwODgwNTUxMVxyXG4gIDEyNTQwNjk4NzQ3MTU4NTIzODYzMDUwNzE1NjkzMjkwOTYzMjk1MjI3NDQzMDQzNTU3XHJcbiAgNjY4OTY2NDg5NTA0NDUyNDQ1MjMxNjE3MzE4NTY0MDMwOTg3MTExMjE3MjIzODMxMTNcclxuICA2MjIyOTg5MzQyMzM4MDMwODEzNTMzNjI3NjYxNDI4MjgwNjQ0NDQ4NjY0NTIzODc0OVxyXG4gIDMwMzU4OTA3Mjk2MjkwNDkxNTYwNDQwNzcyMzkwNzEzODEwNTE1ODU5MzA3OTYwODY2XHJcbiAgNzAxNzI0MjcxMjE4ODM5OTg3OTc5MDg3OTIyNzQ5MjE5MDE2OTk3MjA4ODgwOTM3NzZcclxuICA2NTcyNzMzMzAwMTA1MzM2Nzg4MTIyMDIzNTQyMTgwOTc1MTI1NDU0MDU5NDc1MjI0M1xyXG4gIDUyNTg0OTA3NzExNjcwNTU2MDEzNjA0ODM5NTg2NDQ2NzA2MzI0NDE1NzIyMTU1Mzk3XHJcbiAgNTM2OTc4MTc5Nzc4NDYxNzQwNjQ5NTUxNDkyOTA4NjI1NjkzMjE5Nzg0Njg2MjI0ODJcclxuICA4Mzk3MjI0MTM3NTY1NzA1NjA1NzQ5MDI2MTQwNzk3Mjk2ODY1MjQxNDUzNTEwMDQ3NFxyXG4gIDgyMTY2MzcwNDg0NDAzMTk5ODkwMDA4ODk1MjQzNDUwNjU4NTQxMjI3NTg4NjY2ODgxXHJcbiAgMTY0MjcxNzE0Nzk5MjQ0NDI5MjgyMzA4NjM0NjU2NzQ4MTM5MTkxMjMxNjI4MjQ1ODZcclxuICAxNzg2NjQ1ODM1OTEyNDU2NjUyOTQ3NjU0NTY4Mjg0ODkxMjg4MzE0MjYwNzY5MDA0MlxyXG4gIDI0MjE5MDIyNjcxMDU1NjI2MzIxMTExMTA5MzcwNTQ0MjE3NTA2OTQxNjU4OTYwNDA4XHJcbiAgMDcxOTg0MDM4NTA5NjI0NTU0NDQzNjI5ODEyMzA5ODc4Nzk5MjcyNDQyODQ5MDkxODhcclxuICA4NDU4MDE1NjE2NjA5NzkxOTEzMzg3NTQ5OTIwMDUyNDA2MzY4OTkxMjU2MDcxNzYwNlxyXG4gIDA1ODg2MTE2NDY3MTA5NDA1MDc3NTQxMDAyMjU2OTgzMTU1MjAwMDU1OTM1NzI5NzI1XHJcbiAgNzE2MzYyNjk1NjE4ODI2NzA0MjgyNTI0ODM2MDA4MjMyNTc1MzA0MjA3NTI5NjM0NTBcclxuXHJcbkZpbmQgdGhlIHRoaXJ0ZWVuIGFkamFjZW50IGRpZ2l0cyBpbiB0aGUgMTAwMC1kaWdpdCBudW1iZXIgdGhhdCBoYXZlIHRoZSBncmVhdGVzdCBwcm9kdWN0LiBXaGF0IGlzIHRoZSB2YWx1ZSBvZiB0aGlzIHByb2R1Y3Q/XHJcblxyXG5cIlwiXCJcclxuXHJcbnN0ciA9IFwiXCJcIlxyXG4gICAgICA3MzE2NzE3NjUzMTMzMDYyNDkxOTIyNTExOTY3NDQyNjU3NDc0MjM1NTM0OTE5NDkzNFxyXG4gICAgICA5Njk4MzUyMDMxMjc3NDUwNjMyNjIzOTU3ODMxODAxNjk4NDgwMTg2OTQ3ODg1MTg0M1xyXG4gICAgICA4NTg2MTU2MDc4OTExMjk0OTQ5NTQ1OTUwMTczNzk1ODMzMTk1Mjg1MzIwODgwNTUxMVxyXG4gICAgICAxMjU0MDY5ODc0NzE1ODUyMzg2MzA1MDcxNTY5MzI5MDk2MzI5NTIyNzQ0MzA0MzU1N1xyXG4gICAgICA2Njg5NjY0ODk1MDQ0NTI0NDUyMzE2MTczMTg1NjQwMzA5ODcxMTEyMTcyMjM4MzExM1xyXG4gICAgICA2MjIyOTg5MzQyMzM4MDMwODEzNTMzNjI3NjYxNDI4MjgwNjQ0NDQ4NjY0NTIzODc0OVxyXG4gICAgICAzMDM1ODkwNzI5NjI5MDQ5MTU2MDQ0MDc3MjM5MDcxMzgxMDUxNTg1OTMwNzk2MDg2NlxyXG4gICAgICA3MDE3MjQyNzEyMTg4Mzk5ODc5NzkwODc5MjI3NDkyMTkwMTY5OTcyMDg4ODA5Mzc3NlxyXG4gICAgICA2NTcyNzMzMzAwMTA1MzM2Nzg4MTIyMDIzNTQyMTgwOTc1MTI1NDU0MDU5NDc1MjI0M1xyXG4gICAgICA1MjU4NDkwNzcxMTY3MDU1NjAxMzYwNDgzOTU4NjQ0NjcwNjMyNDQxNTcyMjE1NTM5N1xyXG4gICAgICA1MzY5NzgxNzk3Nzg0NjE3NDA2NDk1NTE0OTI5MDg2MjU2OTMyMTk3ODQ2ODYyMjQ4MlxyXG4gICAgICA4Mzk3MjI0MTM3NTY1NzA1NjA1NzQ5MDI2MTQwNzk3Mjk2ODY1MjQxNDUzNTEwMDQ3NFxyXG4gICAgICA4MjE2NjM3MDQ4NDQwMzE5OTg5MDAwODg5NTI0MzQ1MDY1ODU0MTIyNzU4ODY2Njg4MVxyXG4gICAgICAxNjQyNzE3MTQ3OTkyNDQ0MjkyODIzMDg2MzQ2NTY3NDgxMzkxOTEyMzE2MjgyNDU4NlxyXG4gICAgICAxNzg2NjQ1ODM1OTEyNDU2NjUyOTQ3NjU0NTY4Mjg0ODkxMjg4MzE0MjYwNzY5MDA0MlxyXG4gICAgICAyNDIxOTAyMjY3MTA1NTYyNjMyMTExMTEwOTM3MDU0NDIxNzUwNjk0MTY1ODk2MDQwOFxyXG4gICAgICAwNzE5ODQwMzg1MDk2MjQ1NTQ0NDM2Mjk4MTIzMDk4Nzg3OTkyNzI0NDI4NDkwOTE4OFxyXG4gICAgICA4NDU4MDE1NjE2NjA5NzkxOTEzMzg3NTQ5OTIwMDUyNDA2MzY4OTkxMjU2MDcxNzYwNlxyXG4gICAgICAwNTg4NjExNjQ2NzEwOTQwNTA3NzU0MTAwMjI1Njk4MzE1NTIwMDA1NTkzNTcyOTcyNVxyXG4gICAgICA3MTYzNjI2OTU2MTg4MjY3MDQyODI1MjQ4MzYwMDgyMzI1NzUzMDQyMDc1Mjk2MzQ1MFxyXG4gICAgICBcIlwiXCJcclxuc3RyID0gc3RyLnJlcGxhY2UoL1teMC05XS9nbSwgXCJcIilcclxuZGlnaXRzID0gKHBhcnNlSW50KGRpZ2l0KSBmb3IgZGlnaXQgaW4gc3RyKVxyXG5cclxubGFyZ2VzdFByb2R1Y3QgPSAoZGlnaXRDb3VudCkgLT5cclxuICByZXR1cm4gMCBpZiBkaWdpdENvdW50ID4gZGlnaXRzLmxlbmd0aFxyXG5cclxuICBsYXJnZXN0ID0gMFxyXG4gIGZvciBzdGFydCBpbiBbMC4uKGRpZ2l0cy5sZW5ndGggLSBkaWdpdENvdW50KV1cclxuICAgIGVuZCA9IHN0YXJ0ICsgZGlnaXRDb3VudFxyXG4gICAgcHJvZHVjdCA9IDFcclxuICAgIGZvciBpIGluIFtzdGFydC4uLmVuZF1cclxuICAgICAgcHJvZHVjdCAqPSBkaWdpdHNbaV1cclxuICAgIGlmIGxhcmdlc3QgPCBwcm9kdWN0XHJcbiAgICAgIGxhcmdlc3QgPSBwcm9kdWN0XHJcblxyXG4gIHJldHVybiBsYXJnZXN0XHJcblxyXG5wcm9ibGVtLnRlc3QgPSAtPlxyXG4gIGVxdWFsKGxhcmdlc3RQcm9kdWN0KDQpLCA1ODMyLCAgXCJHcmVhdGVzdCBwcm9kdWN0IG9mIDQgYWRqYWNlbnQgZGlnaXRzIGlzIDU4MzJcIilcclxuICBlcXVhbChsYXJnZXN0UHJvZHVjdCg1KSwgNDA4MjQsIFwiR3JlYXRlc3QgcHJvZHVjdCBvZiA1IGFkamFjZW50IGRpZ2l0cyBpcyA0MDgyNFwiKVxyXG5cclxucHJvYmxlbS5hbnN3ZXIgPSAtPlxyXG4gIHJldHVybiBsYXJnZXN0UHJvZHVjdCgxMylcclxuIiwibW9kdWxlLmV4cG9ydHMgPSBwcm9ibGVtID0gbmV3IFByb2JsZW0gXCJcIlwiXHJcblxyXG5Qcm9ibGVtIDk6IFNwZWNpYWwgUHl0aGFnb3JlYW4gdHJpcGxldFxyXG4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuQSBQeXRoYWdvcmVhbiB0cmlwbGV0IGlzIGEgc2V0IG9mIHRocmVlIG5hdHVyYWwgbnVtYmVycywgYSA8IGIgPCBjLCBmb3Igd2hpY2gsXHJcblxyXG4gICAgYV4yICsgYl4yID0gY14yXHJcblxyXG5Gb3IgZXhhbXBsZSwgM14yICsgNF4yID0gOSArIDE2ID0gMjUgPSA1XjIuXHJcblxyXG5UaGVyZSBleGlzdHMgZXhhY3RseSBvbmUgUHl0aGFnb3JlYW4gdHJpcGxldCBmb3Igd2hpY2ggYSArIGIgKyBjID0gMTAwMC5cclxuXHJcbkZpbmQgdGhlIHByb2R1Y3QgYWJjLlxyXG5cclxuXCJcIlwiXHJcblxyXG5pc1RyaXBsZXQgPSAoYSwgYiwgYykgLT5cclxuICByZXR1cm4gKChhKmEpICsgKGIqYikpID09IChjKmMpXHJcblxyXG5maW5kRmlyc3RUcmlwbGV0ID0gKHN1bSkgLT5cclxuICBmb3IgYSBpbiBbMS4uLjEwMDBdXHJcbiAgICBmb3IgYiBpbiBbMS4uLjEwMDBdXHJcbiAgICAgIGMgPSAxMDAwIC0gYSAtIGJcclxuICAgICAgaWYgaXNUcmlwbGV0KGEsIGIsIGMpXHJcbiAgICAgICAgcmV0dXJuIFthLCBiLCBjXVxyXG5cclxuICByZXR1cm4gZmFsc2VcclxuXHJcblxyXG5wcm9ibGVtLnRlc3QgPSAtPlxyXG4gIGVxdWFsKGlzVHJpcGxldCgzLCA0LCA1KSwgdHJ1ZSwgXCIoMyw0LDUpIGlzIGEgUHl0aGFnb3JlYW4gdHJpcGxldFwiKVxyXG5cclxucHJvYmxlbS5hbnN3ZXIgPSAtPlxyXG4gIHJldHVybiBmaW5kRmlyc3RUcmlwbGV0KDEwMDApXHJcbiIsIm1vZHVsZS5leHBvcnRzID0gcHJvYmxlbSA9IG5ldyBQcm9ibGVtIFwiXCJcIlxyXG5cclxuUHJvYmxlbSAxMDogU3VtbWF0aW9uIG9mIHByaW1lc1xyXG4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5UaGUgc3VtIG9mIHRoZSBwcmltZXMgYmVsb3cgMTAgaXMgMiArIDMgKyA1ICsgNyA9IDE3LlxyXG5cclxuRmluZCB0aGUgc3VtIG9mIGFsbCB0aGUgcHJpbWVzIGJlbG93IHR3byBtaWxsaW9uLlxyXG5cclxuXCJcIlwiXHJcblxyXG5tYXRoID0gcmVxdWlyZSBcIm1hdGhcIlxyXG5cclxucHJpbWVTdW0gPSAoY2VpbGluZykgLT5cclxuICBzaWV2ZSA9IG5ldyBtYXRoLkluY3JlbWVudGFsU2lldmVcclxuXHJcbiAgc3VtID0gMFxyXG4gIGxvb3BcclxuICAgIG4gPSBzaWV2ZS5uZXh0KClcclxuICAgIGlmIG4gPj0gY2VpbGluZ1xyXG4gICAgICBicmVha1xyXG4gICAgc3VtICs9IG5cclxuXHJcbiAgcmV0dXJuIHN1bVxyXG5cclxucHJvYmxlbS50ZXN0ID0gLT5cclxuICBlcXVhbChwcmltZVN1bSgxMCksIDE3LCBcIlN1bSBvZiBwcmltZXMgYmVsb3cgMTAgaXMgMTdcIilcclxuXHJcbnByb2JsZW0uYW5zd2VyID0gLT5cclxuICByZXR1cm4gcHJpbWVTdW0oMjAwMDAwMClcclxuIiwibW9kdWxlLmV4cG9ydHMgPSBwcm9ibGVtID0gbmV3IFByb2JsZW0gXCJcIlwiXHJcblxyXG5Qcm9ibGVtIDExOiBMYXJnZXN0IHByb2R1Y3QgaW4gYSBncmlkXHJcbi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbkluIHRoZSAyMHgyMCBncmlkIGJlbG93LCBmb3VyIG51bWJlcnMgYWxvbmcgYSBkaWFnb25hbCBsaW5lIGhhdmUgYmVlbiBtYXJrZWQgaW4gcmVkLlxyXG5cclxuICAgICAgICAgIDA4IDAyIDIyIDk3IDM4IDE1IDAwIDQwIDAwIDc1IDA0IDA1IDA3IDc4IDUyIDEyIDUwIDc3IDkxIDA4XHJcbiAgICAgICAgICA0OSA0OSA5OSA0MCAxNyA4MSAxOCA1NyA2MCA4NyAxNyA0MCA5OCA0MyA2OSA0OCAwNCA1NiA2MiAwMFxyXG4gICAgICAgICAgODEgNDkgMzEgNzMgNTUgNzkgMTQgMjkgOTMgNzEgNDAgNjcgNTMgODggMzAgMDMgNDkgMTMgMzYgNjVcclxuICAgICAgICAgIDUyIDcwIDk1IDIzIDA0IDYwIDExIDQyIDY5IDI0IDY4IDU2IDAxIDMyIDU2IDcxIDM3IDAyIDM2IDkxXHJcbiAgICAgICAgICAyMiAzMSAxNiA3MSA1MSA2NyA2MyA4OSA0MSA5MiAzNiA1NCAyMiA0MCA0MCAyOCA2NiAzMyAxMyA4MFxyXG4gICAgICAgICAgMjQgNDcgMzIgNjAgOTkgMDMgNDUgMDIgNDQgNzUgMzMgNTMgNzggMzYgODQgMjAgMzUgMTcgMTIgNTBcclxuICAgICAgICAgIDMyIDk4IDgxIDI4IDY0IDIzIDY3IDEwIDI2XzM4IDQwIDY3IDU5IDU0IDcwIDY2IDE4IDM4IDY0IDcwXHJcbiAgICAgICAgICA2NyAyNiAyMCA2OCAwMiA2MiAxMiAyMCA5NSA2M185NCAzOSA2MyAwOCA0MCA5MSA2NiA0OSA5NCAyMVxyXG4gICAgICAgICAgMjQgNTUgNTggMDUgNjYgNzMgOTkgMjYgOTcgMTcgNzhfNzggOTYgODMgMTQgODggMzQgODkgNjMgNzJcclxuICAgICAgICAgIDIxIDM2IDIzIDA5IDc1IDAwIDc2IDQ0IDIwIDQ1IDM1IDE0IDAwIDYxIDMzIDk3IDM0IDMxIDMzIDk1XHJcbiAgICAgICAgICA3OCAxNyA1MyAyOCAyMiA3NSAzMSA2NyAxNSA5NCAwMyA4MCAwNCA2MiAxNiAxNCAwOSA1MyA1NiA5MlxyXG4gICAgICAgICAgMTYgMzkgMDUgNDIgOTYgMzUgMzEgNDcgNTUgNTggODggMjQgMDAgMTcgNTQgMjQgMzYgMjkgODUgNTdcclxuICAgICAgICAgIDg2IDU2IDAwIDQ4IDM1IDcxIDg5IDA3IDA1IDQ0IDQ0IDM3IDQ0IDYwIDIxIDU4IDUxIDU0IDE3IDU4XHJcbiAgICAgICAgICAxOSA4MCA4MSA2OCAwNSA5NCA0NyA2OSAyOCA3MyA5MiAxMyA4NiA1MiAxNyA3NyAwNCA4OSA1NSA0MFxyXG4gICAgICAgICAgMDQgNTIgMDggODMgOTcgMzUgOTkgMTYgMDcgOTcgNTcgMzIgMTYgMjYgMjYgNzkgMzMgMjcgOTggNjZcclxuICAgICAgICAgIDg4IDM2IDY4IDg3IDU3IDYyIDIwIDcyIDAzIDQ2IDMzIDY3IDQ2IDU1IDEyIDMyIDYzIDkzIDUzIDY5XHJcbiAgICAgICAgICAwNCA0MiAxNiA3MyAzOCAyNSAzOSAxMSAyNCA5NCA3MiAxOCAwOCA0NiAyOSAzMiA0MCA2MiA3NiAzNlxyXG4gICAgICAgICAgMjAgNjkgMzYgNDEgNzIgMzAgMjMgODggMzQgNjIgOTkgNjkgODIgNjcgNTkgODUgNzQgMDQgMzYgMTZcclxuICAgICAgICAgIDIwIDczIDM1IDI5IDc4IDMxIDkwIDAxIDc0IDMxIDQ5IDcxIDQ4IDg2IDgxIDE2IDIzIDU3IDA1IDU0XHJcbiAgICAgICAgICAwMSA3MCA1NCA3MSA4MyA1MSA1NCA2OSAxNiA5MiAzMyA0OCA2MSA0MyA1MiAwMSA4OSAxOSA2NyA0OFxyXG5cclxuVGhlIHByb2R1Y3Qgb2YgdGhlc2UgbnVtYmVycyBpcyAyNiB4IDYzIHggNzggeCAxNCA9IDE3ODg2OTYuXHJcblxyXG5XaGF0IGlzIHRoZSBncmVhdGVzdCBwcm9kdWN0IG9mIGZvdXIgYWRqYWNlbnQgbnVtYmVycyBpbiB0aGUgc2FtZSBkaXJlY3Rpb24gKHVwLCBkb3duLCBsZWZ0LCByaWdodCwgb3IgZGlhZ29uYWxseSkgaW4gdGhlIDIweDIwIGdyaWQ/XHJcblxyXG5cIlwiXCJcclxuXHJcbmdyaWQgPSBudWxsXHJcblxyXG5wcmVwYXJlR3JpZCA9IC0+XHJcbiAgcmF3RGlnaXRzID0gXCJcIlwiXHJcbiAgICAwOCAwMiAyMiA5NyAzOCAxNSAwMCA0MCAwMCA3NSAwNCAwNSAwNyA3OCA1MiAxMiA1MCA3NyA5MSAwOFxyXG4gICAgNDkgNDkgOTkgNDAgMTcgODEgMTggNTcgNjAgODcgMTcgNDAgOTggNDMgNjkgNDggMDQgNTYgNjIgMDBcclxuICAgIDgxIDQ5IDMxIDczIDU1IDc5IDE0IDI5IDkzIDcxIDQwIDY3IDUzIDg4IDMwIDAzIDQ5IDEzIDM2IDY1XHJcbiAgICA1MiA3MCA5NSAyMyAwNCA2MCAxMSA0MiA2OSAyNCA2OCA1NiAwMSAzMiA1NiA3MSAzNyAwMiAzNiA5MVxyXG4gICAgMjIgMzEgMTYgNzEgNTEgNjcgNjMgODkgNDEgOTIgMzYgNTQgMjIgNDAgNDAgMjggNjYgMzMgMTMgODBcclxuICAgIDI0IDQ3IDMyIDYwIDk5IDAzIDQ1IDAyIDQ0IDc1IDMzIDUzIDc4IDM2IDg0IDIwIDM1IDE3IDEyIDUwXHJcbiAgICAzMiA5OCA4MSAyOCA2NCAyMyA2NyAxMCAyNiAzOCA0MCA2NyA1OSA1NCA3MCA2NiAxOCAzOCA2NCA3MFxyXG4gICAgNjcgMjYgMjAgNjggMDIgNjIgMTIgMjAgOTUgNjMgOTQgMzkgNjMgMDggNDAgOTEgNjYgNDkgOTQgMjFcclxuICAgIDI0IDU1IDU4IDA1IDY2IDczIDk5IDI2IDk3IDE3IDc4IDc4IDk2IDgzIDE0IDg4IDM0IDg5IDYzIDcyXHJcbiAgICAyMSAzNiAyMyAwOSA3NSAwMCA3NiA0NCAyMCA0NSAzNSAxNCAwMCA2MSAzMyA5NyAzNCAzMSAzMyA5NVxyXG4gICAgNzggMTcgNTMgMjggMjIgNzUgMzEgNjcgMTUgOTQgMDMgODAgMDQgNjIgMTYgMTQgMDkgNTMgNTYgOTJcclxuICAgIDE2IDM5IDA1IDQyIDk2IDM1IDMxIDQ3IDU1IDU4IDg4IDI0IDAwIDE3IDU0IDI0IDM2IDI5IDg1IDU3XHJcbiAgICA4NiA1NiAwMCA0OCAzNSA3MSA4OSAwNyAwNSA0NCA0NCAzNyA0NCA2MCAyMSA1OCA1MSA1NCAxNyA1OFxyXG4gICAgMTkgODAgODEgNjggMDUgOTQgNDcgNjkgMjggNzMgOTIgMTMgODYgNTIgMTcgNzcgMDQgODkgNTUgNDBcclxuICAgIDA0IDUyIDA4IDgzIDk3IDM1IDk5IDE2IDA3IDk3IDU3IDMyIDE2IDI2IDI2IDc5IDMzIDI3IDk4IDY2XHJcbiAgICA4OCAzNiA2OCA4NyA1NyA2MiAyMCA3MiAwMyA0NiAzMyA2NyA0NiA1NSAxMiAzMiA2MyA5MyA1MyA2OVxyXG4gICAgMDQgNDIgMTYgNzMgMzggMjUgMzkgMTEgMjQgOTQgNzIgMTggMDggNDYgMjkgMzIgNDAgNjIgNzYgMzZcclxuICAgIDIwIDY5IDM2IDQxIDcyIDMwIDIzIDg4IDM0IDYyIDk5IDY5IDgyIDY3IDU5IDg1IDc0IDA0IDM2IDE2XHJcbiAgICAyMCA3MyAzNSAyOSA3OCAzMSA5MCAwMSA3NCAzMSA0OSA3MSA0OCA4NiA4MSAxNiAyMyA1NyAwNSA1NFxyXG4gICAgMDEgNzAgNTQgNzEgODMgNTEgNTQgNjkgMTYgOTIgMzMgNDggNjEgNDMgNTIgMDEgODkgMTkgNjcgNDhcclxuICBcIlwiXCIucmVwbGFjZSgvW14wLTkgXS9nbSwgXCIgXCIpXHJcblxyXG4gIGRpZ2l0cyA9IChwYXJzZUludChkaWdpdCkgZm9yIGRpZ2l0IGluIHJhd0RpZ2l0cy5zcGxpdChcIiBcIikpXHJcbiAgZ3JpZCA9IEFycmF5KDIwKVxyXG4gIGZvciBpIGluIFswLi4uMjBdXHJcbiAgICBncmlkW2ldID0gQXJyYXkoMjApXHJcblxyXG4gIGluZGV4ID0gMFxyXG4gIGZvciBqIGluIFswLi4uMjBdXHJcbiAgICBmb3IgaSBpbiBbMC4uLjIwXVxyXG4gICAgICBncmlkW2ldW2pdID0gZGlnaXRzW2luZGV4XVxyXG4gICAgICBpbmRleCsrXHJcblxyXG5wcmVwYXJlR3JpZCgpXHJcblxyXG4jIEdldHMgYSBwcm9kdWN0IG9mIDQgdmFsdWVzIHN0YXJ0aW5nIGF0IChzeCwgc3kpLCBoZWFkaW5nIGluIHRoZSBkaXJlY3Rpb24gKGR4LCBkeSlcclxuIyBSZXR1cm5zIC0xIGlmIHRoZXJlIGlzIG5vIHJvb20gdG8gbWFrZSBhIHN0cmlwZSBvZiA0LlxyXG5nZXRMaW5lUHJvZHVjdCA9IChzeCwgc3ksIGR4LCBkeSkgLT5cclxuICBleCA9IHN4ICsgKDQgKiBkeClcclxuICByZXR1cm4gLTEgaWYgKGV4IDwgMCkgb3IgKGV4ID49IDIwKVxyXG4gIGV5ID0gc3kgKyAoNCAqIGR5KVxyXG4gIHJldHVybiAtMSBpZiAoZXkgPCAwKSBvciAoZXkgPj0gMjApXHJcblxyXG4gIHggPSBzeFxyXG4gIHkgPSBzeVxyXG4gIHByb2R1Y3QgPSAxXHJcbiAgZm9yIGkgaW4gWzAuLi40XVxyXG4gICAgcHJvZHVjdCAqPSBncmlkW3hdW3ldXHJcbiAgICB4ICs9IGR4XHJcbiAgICB5ICs9IGR5XHJcblxyXG4gIHJldHVybiBwcm9kdWN0XHJcblxyXG5nZXRMaW5lID0gKHN4LCBzeSwgZHgsIGR5KSAtPlxyXG4gIGV4ID0gc3ggKyAoNCAqIGR4KVxyXG4gIHJldHVybiBbXSBpZiAoZXggPCAwKSBvciAoZXggPj0gMjApXHJcbiAgZXkgPSBzeSArICg0ICogZHkpXHJcbiAgcmV0dXJuIFtdIGlmIChleSA8IDApIG9yIChleSA+PSAyMClcclxuXHJcbiAgbGluZSA9IFtdXHJcblxyXG4gIHggPSBzeFxyXG4gIHkgPSBzeVxyXG4gIGZvciBpIGluIFswLi4uNF1cclxuICAgIGxpbmUucHVzaCBncmlkW3hdW3ldXHJcbiAgICB4ICs9IGR4XHJcbiAgICB5ICs9IGR5XHJcblxyXG4gIHJldHVybiBsaW5lXHJcblxyXG5wcm9ibGVtLnRlc3QgPSAtPlxyXG4gICMgRXhhbXBsZSBpcyBkaWFnb25hbCByaWdodC9kb3duIGZyb20gKDgsNilcclxuICBlcXVhbChnZXRMaW5lUHJvZHVjdCg4LCA2LCAxLCAxKSwgMTc4ODY5NiwgXCJEaWFnb25hbCB2YWx1ZSBzaG93biBpbiBleGFtcGxlIGVxdWFscyAxLDc4OCw2OTZcIilcclxuXHJcbnByb2JsZW0uYW5zd2VyID0gLT5cclxuICBtYXggPVxyXG4gICAgcHJvZHVjdDogMVxyXG4gICAgaTogMFxyXG4gICAgajogMFxyXG4gICAgZGlyOiBcInJpZ2h0XCJcclxuXHJcbiAgZm9yIGogaW4gWzAuLi4yMF1cclxuICAgIGZvciBpIGluIFswLi4uMjBdXHJcbiAgICAgIHAgPSBnZXRMaW5lUHJvZHVjdChpLCBqLCAxLCAwKVxyXG4gICAgICBpZiBtYXgucHJvZHVjdCA8IHBcclxuICAgICAgICBtYXgucHJvZHVjdCA9IHBcclxuICAgICAgICBtYXguaSA9IGlcclxuICAgICAgICBtYXguaiA9IGpcclxuICAgICAgICBtYXguZGlyID0gXCJyaWdodFwiXHJcbiAgICAgIHAgPSBnZXRMaW5lUHJvZHVjdChpLCBqLCAwLCAxKVxyXG4gICAgICBpZiBtYXgucHJvZHVjdCA8IHBcclxuICAgICAgICBtYXgucHJvZHVjdCA9IHBcclxuICAgICAgICBtYXguaSA9IGlcclxuICAgICAgICBtYXguaiA9IGpcclxuICAgICAgICBtYXguZGlyID0gXCJkb3duXCJcclxuICAgICAgcCA9IGdldExpbmVQcm9kdWN0KGksIGosIDEsIDEpXHJcbiAgICAgIGlmIG1heC5wcm9kdWN0IDwgcFxyXG4gICAgICAgIG1heC5wcm9kdWN0ID0gcFxyXG4gICAgICAgIG1heC5pID0gaVxyXG4gICAgICAgIG1heC5qID0galxyXG4gICAgICAgIG1heC5kaXIgPSBcImRpYWdvbmFsUlwiXHJcbiAgICAgIHAgPSBnZXRMaW5lUHJvZHVjdChpLCBqLCAtMSwgMSlcclxuICAgICAgaWYgbWF4LnByb2R1Y3QgPCBwXHJcbiAgICAgICAgbWF4LnByb2R1Y3QgPSBwXHJcbiAgICAgICAgbWF4LmkgPSBpXHJcbiAgICAgICAgbWF4LmogPSBqXHJcbiAgICAgICAgbWF4LmRpciA9IFwiZGlhZ29uYWxMXCJcclxuXHJcbiAgcmV0dXJuIG1heFxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHByb2JsZW0gPSBuZXcgUHJvYmxlbSBcIlwiXCJcclxuXHJcblByb2JsZW0gMTI6IEhpZ2hseSBkaXZpc2libGUgdHJpYW5ndWxhciBudW1iZXJcclxuLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuVGhlIHNlcXVlbmNlIG9mIHRyaWFuZ2xlIG51bWJlcnMgaXMgZ2VuZXJhdGVkIGJ5IGFkZGluZyB0aGUgbmF0dXJhbCBudW1iZXJzLiBTbyB0aGUgN3RoIHRyaWFuZ2xlIG51bWJlciB3b3VsZCBiZVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgIDEgKyAyICsgMyArIDQgKyA1ICsgNiArIDcgPSAyOC5cclxuXHJcblRoZSBmaXJzdCB0ZW4gdGVybXMgd291bGQgYmU6XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgMSwgMywgNiwgMTAsIDE1LCAyMSwgMjgsIDM2LCA0NSwgNTUsIC4uLlxyXG5cclxuTGV0IHVzIGxpc3QgdGhlIGZhY3RvcnMgb2YgdGhlIGZpcnN0IHNldmVuIHRyaWFuZ2xlIG51bWJlcnM6XHJcblxyXG4gMTogMVxyXG4gMzogMSwzXHJcbiA2OiAxLDIsMyw2XHJcbjEwOiAxLDIsNSwxMFxyXG4xNTogMSwzLDUsMTVcclxuMjE6IDEsMyw3LDIxXHJcbjI4OiAxLDIsNCw3LDE0LDI4XHJcblxyXG5XZSBjYW4gc2VlIHRoYXQgMjggaXMgdGhlIGZpcnN0IHRyaWFuZ2xlIG51bWJlciB0byBoYXZlIG92ZXIgZml2ZSBkaXZpc29ycy5cclxuXHJcbldoYXQgaXMgdGhlIHZhbHVlIG9mIHRoZSBmaXJzdCB0cmlhbmdsZSBudW1iZXIgdG8gaGF2ZSBvdmVyIGZpdmUgaHVuZHJlZCBkaXZpc29ycz9cclxuXHJcblwiXCJcIlxyXG5cclxubWF0aCA9IHJlcXVpcmUgXCJtYXRoXCJcclxuXHJcbiMgVGhpcyBmdW5jdGlvbiBkb2VzIGl0cyBiZXN0IHRvIGxldmVyYWdlIFJhbWFudWphbidzIFwiVGF1IGZ1bmN0aW9uXCIsXHJcbiMgd2hpY2ggaXMgc3VwcG9zZWQgdG8gZ2l2ZSB0aGUgbnVtYmVyIG9mIHBvc2l0aXZlIGRpdmlzb3JzLlxyXG4jXHJcbiMgVGhlIGlkZWEgaXM6XHJcbiMgKiBGb3IgcHJpbWVzLCBUKHBeaykgPSBrICsgMVxyXG4jICogRm9yIGFueSBudW1iZXJzIHdob3NlIEdDRCBpcyAxLCBUKG1uKSA9IFQobSkgKiBUKG4pXHJcbiNcclxuIyBJIGFscmVhZHkgaGF2ZSBhIG1ldGhvZCB0byBwcmltZSBmYWN0b3IgYSBudW1iZXIsIHNvIEknbGwgbGV2ZXJhZ2VcclxuIyBldmVyeSBncm91cGluZyBvZiB0aGUgc2FtZSBwcmltZSBudW1iZXIgYXMgdGhlIGZpcnN0IGNhc2UsIGFuZFxyXG4jIG11bHRpcGx5IHRoZW0gdG9nZXRoZXIuXHJcbiNcclxuIyBFeGFtcGxlOiAyOFxyXG4jXHJcbiMgMjgncyBwcmltZSBmYWN0b3JzIGFyZSBbMiwgMiwgN10sIG9yICgyXjIgKyA3KVxyXG4jXHJcbiMgSSBjYW4gYXNzdW1lIHRoYXQgdGhlIEdDRCBiZXR3ZWVuIGFueSBvZiB0aGUgcHJpbWUgc2V0cyBpcyBnb2luZyB0byBiZSAxIGJlY2F1c2UgZHVoLFxyXG4jIHdoaWNoIG1lYW5zIHRoYXQ6XHJcbiNcclxuIyBUKDI4KSA9PSBUKDJeMikgKiBUKDcpXHJcbiNcclxuIyBUKDJeMikgPT0gMiArIDEgPT0gM1xyXG4jIFQoN14xKSA9PSAxICsgMSA9PSAyXHJcbiMgMyAqIDIgPSA2XHJcbiMgMjggaGFzIDYgZGl2aXNvcnMuXHJcbiNcclxuIyBZb3UncmUgbWFkLlxyXG5cclxuZGl2aXNvckNvdW50ID0gKG4pIC0+XHJcbiAgcmV0dXJuIDEgaWYgbiA9PSAxXHJcblxyXG4gIGZhY3RvcnMgPSBtYXRoLnByaW1lRmFjdG9ycyhuKVxyXG4gIGNvdW50ID0gMVxyXG4gIGxhc3RGYWN0b3IgPSAwXHJcbiAgZXhwb25lbnQgPSAxXHJcbiAgZm9yIGZhY3RvciBpbiBmYWN0b3JzXHJcbiAgICBpZiBmYWN0b3IgPT0gbGFzdEZhY3RvclxyXG4gICAgICBleHBvbmVudCsrXHJcbiAgICBlbHNlXHJcbiAgICAgIGlmIGxhc3RGYWN0b3IgIT0gMFxyXG4gICAgICAgICAgY291bnQgKj0gZXhwb25lbnQgKyAxXHJcbiAgICAgIGxhc3RGYWN0b3IgPSBmYWN0b3JcclxuICAgICAgZXhwb25lbnQgPSAxXHJcblxyXG4gIGlmIGxhc3RGYWN0b3IgIT0gMFxyXG4gICAgICBjb3VudCAqPSBleHBvbmVudCArIDFcclxuXHJcbiAgcmV0dXJuIGNvdW50XHJcblxyXG5wcm9ibGVtLnRlc3QgPSAtPlxyXG4gIGVxdWFsKGRpdmlzb3JDb3VudCggMSksIDEsIFwiIDEgaGFzIDEgZGl2aXNvcnNcIilcclxuICBlcXVhbChkaXZpc29yQ291bnQoIDMpLCAyLCBcIiAzIGhhcyAyIGRpdmlzb3JzXCIpXHJcbiAgZXF1YWwoZGl2aXNvckNvdW50KCA2KSwgNCwgXCIgNiBoYXMgNCBkaXZpc29yc1wiKVxyXG4gIGVxdWFsKGRpdmlzb3JDb3VudCgxMCksIDQsIFwiMTAgaGFzIDQgZGl2aXNvcnNcIilcclxuICBlcXVhbChkaXZpc29yQ291bnQoMTUpLCA0LCBcIjE1IGhhcyA0IGRpdmlzb3JzXCIpXHJcbiAgZXF1YWwoZGl2aXNvckNvdW50KDIxKSwgNCwgXCIyMSBoYXMgNCBkaXZpc29yc1wiKVxyXG4gIGVxdWFsKGRpdmlzb3JDb3VudCgyOCksIDYsIFwiMjggaGFzIDYgZGl2aXNvcnNcIilcclxuXHJcbnByb2JsZW0uYW5zd2VyID0gLT5cclxuICBuID0gMVxyXG4gIHN0ZXAgPSAyXHJcblxyXG4gIGxvb3BcclxuICAgIGNvdW50ID0gZGl2aXNvckNvdW50KG4pXHJcbiAgICBpZiBjb3VudCA+IDUwMFxyXG4gICAgICByZXR1cm4geyBuOiBuLCBjb3VudDogY291bnQgfVxyXG5cclxuICAgICMgbmV4dCB0cmlhbmd1bGFyIG51bWJlclxyXG4gICAgbiArPSBzdGVwXHJcbiAgICBzdGVwKytcclxuIiwibW9kdWxlLmV4cG9ydHMgPSBwcm9ibGVtID0gbmV3IFByb2JsZW0gXCJcIlwiXHJcblxyXG5Qcm9ibGVtIDEzOiBMYXJnZSBzdW1cclxuLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5Xb3JrIG91dCB0aGUgZmlyc3QgdGVuIGRpZ2l0cyBvZiB0aGUgc3VtIG9mIHRoZSBmb2xsb3dpbmcgb25lLWh1bmRyZWQgNTAtZGlnaXQgbnVtYmVycy5cclxuXHJcbjM3MTA3Mjg3NTMzOTAyMTAyNzk4Nzk3OTk4MjIwODM3NTkwMjQ2NTEwMTM1NzQwMjUwXHJcbjQ2Mzc2OTM3Njc3NDkwMDA5NzEyNjQ4MTI0ODk2OTcwMDc4MDUwNDE3MDE4MjYwNTM4XHJcbjc0MzI0OTg2MTk5NTI0NzQxMDU5NDc0MjMzMzA5NTEzMDU4MTIzNzI2NjE3MzA5NjI5XHJcbjkxOTQyMjEzMzYzNTc0MTYxNTcyNTIyNDMwNTYzMzAxODExMDcyNDA2MTU0OTA4MjUwXHJcbjIzMDY3NTg4MjA3NTM5MzQ2MTcxMTcxOTgwMzEwNDIxMDQ3NTEzNzc4MDYzMjQ2Njc2XHJcbjg5MjYxNjcwNjk2NjIzNjMzODIwMTM2Mzc4NDE4MzgzNjg0MTc4NzM0MzYxNzI2NzU3XHJcbjI4MTEyODc5ODEyODQ5OTc5NDA4MDY1NDgxOTMxNTkyNjIxNjkxMjc1ODg5ODMyNzM4XHJcbjQ0Mjc0MjI4OTE3NDMyNTIwMzIxOTIzNTg5NDIyODc2Nzk2NDg3NjcwMjcyMTg5MzE4XHJcbjQ3NDUxNDQ1NzM2MDAxMzA2NDM5MDkxMTY3MjE2ODU2ODQ0NTg4NzExNjAzMTUzMjc2XHJcbjcwMzg2NDg2MTA1ODQzMDI1NDM5OTM5NjE5ODI4OTE3NTkzNjY1Njg2NzU3OTM0OTUxXHJcbjYyMTc2NDU3MTQxODU2NTYwNjI5NTAyMTU3MjIzMTk2NTg2NzU1MDc5MzI0MTkzMzMxXHJcbjY0OTA2MzUyNDYyNzQxOTA0OTI5MTAxNDMyNDQ1ODEzODIyNjYzMzQ3OTQ0NzU4MTc4XHJcbjkyNTc1ODY3NzE4MzM3MjE3NjYxOTYzNzUxNTkwNTc5MjM5NzI4MjQ1NTk4ODM4NDA3XHJcbjU4MjAzNTY1MzI1MzU5Mzk5MDA4NDAyNjMzNTY4OTQ4ODMwMTg5NDU4NjI4MjI3ODI4XHJcbjgwMTgxMTk5Mzg0ODI2MjgyMDE0Mjc4MTk0MTM5OTQwNTY3NTg3MTUxMTcwMDk0MzkwXHJcbjM1Mzk4NjY0MzcyODI3MTEyNjUzODI5OTg3MjQwNzg0NDczMDUzMTkwMTA0MjkzNTg2XHJcbjg2NTE1NTA2MDA2Mjk1ODY0ODYxNTMyMDc1MjczMzcxOTU5MTkxNDIwNTE3MjU1ODI5XHJcbjcxNjkzODg4NzA3NzE1NDY2NDk5MTE1NTkzNDg3NjAzNTMyOTIxNzE0OTcwMDU2OTM4XHJcbjU0MzcwMDcwNTc2ODI2Njg0NjI0NjIxNDk1NjUwMDc2NDcxNzg3Mjk0NDM4Mzc3NjA0XHJcbjUzMjgyNjU0MTA4NzU2ODI4NDQzMTkxMTkwNjM0Njk0MDM3ODU1MjE3Nzc5Mjk1MTQ1XHJcbjM2MTIzMjcyNTI1MDAwMjk2MDcxMDc1MDgyNTYzODE1NjU2NzEwODg1MjU4MzUwNzIxXHJcbjQ1ODc2NTc2MTcyNDEwOTc2NDQ3MzM5MTEwNjA3MjE4MjY1MjM2ODc3MjIzNjM2MDQ1XHJcbjE3NDIzNzA2OTA1ODUxODYwNjYwNDQ4MjA3NjIxMjA5ODEzMjg3ODYwNzMzOTY5NDEyXHJcbjgxMTQyNjYwNDE4MDg2ODMwNjE5MzI4NDYwODExMTkxMDYxNTU2OTQwNTEyNjg5NjkyXHJcbjUxOTM0MzI1NDUxNzI4Mzg4NjQxOTE4MDQ3MDQ5MjkzMjE1MDU4NjQyNTYzMDQ5NDgzXHJcbjYyNDY3MjIxNjQ4NDM1MDc2MjAxNzI3OTE4MDM5OTQ0NjkzMDA0NzMyOTU2MzQwNjkxXHJcbjE1NzMyNDQ0Mzg2OTA4MTI1Nzk0NTE0MDg5MDU3NzA2MjI5NDI5MTk3MTA3OTI4MjA5XHJcbjU1MDM3Njg3NTI1Njc4NzczMDkxODYyNTQwNzQ0OTY5ODQ0NTA4MzMwMzkzNjgyMTI2XHJcbjE4MzM2Mzg0ODI1MzMwMTU0Njg2MTk2MTI0MzQ4NzY3NjgxMjk3NTM0Mzc1OTQ2NTE1XHJcbjgwMzg2Mjg3NTkyODc4NDkwMjAxNTIxNjg1NTU0ODI4NzE3MjAxMjE5MjU3NzY2OTU0XHJcbjc4MTgyODMzNzU3OTkzMTAzNjE0NzQwMzU2ODU2NDQ5MDk1NTI3MDk3ODY0Nzk3NTgxXHJcbjE2NzI2MzIwMTAwNDM2ODk3ODQyNTUzNTM5OTIwOTMxODM3NDQxNDk3ODA2ODYwOTg0XHJcbjQ4NDAzMDk4MTI5MDc3NzkxNzk5MDg4MjE4Nzk1MzI3MzY0NDc1Njc1NTkwODQ4MDMwXHJcbjg3MDg2OTg3NTUxMzkyNzExODU0NTE3MDc4NTQ0MTYxODUyNDI0MzIwNjkzMTUwMzMyXHJcbjU5OTU5NDA2ODk1NzU2NTM2NzgyMTA3MDc0OTI2OTY2NTM3Njc2MzI2MjM1NDQ3MjEwXHJcbjY5NzkzOTUwNjc5NjUyNjk0NzQyNTk3NzA5NzM5MTY2NjkzNzYzMDQyNjMzOTg3MDg1XHJcbjQxMDUyNjg0NzA4Mjk5MDg1MjExMzk5NDI3MzY1NzM0MTE2MTgyNzYwMzE1MDAxMjcxXHJcbjY1Mzc4NjA3MzYxNTAxMDgwODU3MDA5MTQ5OTM5NTEyNTU3MDI4MTk4NzQ2MDA0Mzc1XHJcbjM1ODI5MDM1MzE3NDM0NzE3MzI2OTMyMTIzNTc4MTU0OTgyNjI5NzQyNTUyNzM3MzA3XHJcbjk0OTUzNzU5NzY1MTA1MzA1OTQ2OTY2MDY3NjgzMTU2NTc0Mzc3MTY3NDAxODc1Mjc1XHJcbjg4OTAyODAyNTcxNzMzMjI5NjE5MTc2NjY4NzEzODE5OTMxODExMDQ4NzcwMTkwMjcxXHJcbjI1MjY3NjgwMjc2MDc4MDAzMDEzNjc4NjgwOTkyNTI1NDYzNDAxMDYxNjMyODY2NTI2XHJcbjM2MjcwMjE4NTQwNDk3NzA1NTg1NjI5OTQ2NTgwNjM2MjM3OTkzMTQwNzQ2MjU1OTYyXHJcbjI0MDc0NDg2OTA4MjMxMTc0OTc3NzkyMzY1NDY2MjU3MjQ2OTIzMzIyODEwOTE3MTQxXHJcbjkxNDMwMjg4MTk3MTAzMjg4NTk3ODA2NjY5NzYwODkyOTM4NjM4Mjg1MDI1MzMzNDAzXHJcbjM0NDEzMDY1NTc4MDE2MTI3ODE1OTIxODE1MDA1NTYxODY4ODM2NDY4NDIwMDkwNDcwXHJcbjIzMDUzMDgxMTcyODE2NDMwNDg3NjIzNzkxOTY5ODQyNDg3MjU1MDM2NjM4Nzg0NTgzXHJcbjExNDg3Njk2OTMyMTU0OTAyODEwNDI0MDIwMTM4MzM1MTI0NDYyMTgxNDQxNzczNDcwXHJcbjYzNzgzMjk5NDkwNjM2MjU5NjY2NDk4NTg3NjE4MjIxMjI1MjI1NTEyNDg2NzY0NTMzXHJcbjY3NzIwMTg2OTcxNjk4NTQ0MzEyNDE5NTcyNDA5OTEzOTU5MDA4OTUyMzEwMDU4ODIyXHJcbjk1NTQ4MjU1MzAwMjYzNTIwNzgxNTMyMjk2Nzk2MjQ5NDgxNjQxOTUzODY4MjE4Nzc0XHJcbjc2MDg1MzI3MTMyMjg1NzIzMTEwNDI0ODAzNDU2MTI0ODY3Njk3MDY0NTA3OTk1MjM2XHJcbjM3Nzc0MjQyNTM1NDExMjkxNjg0Mjc2ODY1NTM4OTI2MjA1MDI0OTEwMzI2NTcyOTY3XHJcbjIzNzAxOTEzMjc1NzI1Njc1Mjg1NjUzMjQ4MjU4MjY1NDYzMDkyMjA3MDU4NTk2NTIyXHJcbjI5Nzk4ODYwMjcyMjU4MzMxOTEzMTI2Mzc1MTQ3MzQxOTk0ODg5NTM0NzY1NzQ1NTAxXHJcbjE4NDk1NzAxNDU0ODc5Mjg4OTg0ODU2ODI3NzI2MDc3NzEzNzIxNDAzNzk4ODc5NzE1XHJcbjM4Mjk4MjAzNzgzMDMxNDczNTI3NzIxNTgwMzQ4MTQ0NTEzNDkxMzczMjI2NjUxMzgxXHJcbjM0ODI5NTQzODI5MTk5OTE4MTgwMjc4OTE2NTIyNDMxMDI3MzkyMjUxMTIyODY5NTM5XHJcbjQwOTU3OTUzMDY2NDA1MjMyNjMyNTM4MDQ0MTAwMDU5NjU0OTM5MTU5ODc5NTkzNjM1XHJcbjI5NzQ2MTUyMTg1NTAyMzcxMzA3NjQyMjU1MTIxMTgzNjkzODAzNTgwMzg4NTg0OTAzXHJcbjQxNjk4MTE2MjIyMDcyOTc3MTg2MTU4MjM2Njc4NDI0Njg5MTU3OTkzNTMyOTYxOTIyXHJcbjYyNDY3OTU3MTk0NDAxMjY5MDQzODc3MTA3Mjc1MDQ4MTAyMzkwODk1NTIzNTk3NDU3XHJcbjIzMTg5NzA2NzcyNTQ3OTE1MDYxNTA1NTA0OTUzOTIyOTc5NTMwOTAxMTI5OTY3NTE5XHJcbjg2MTg4MDg4MjI1ODc1MzE0NTI5NTg0MDk5MjUxMjAzODI5MDA5NDA3NzcwNzc1NjcyXHJcbjExMzA2NzM5NzA4MzA0NzI0NDgzODE2NTMzODczNTAyMzQwODQ1NjQ3MDU4MDc3MzA4XHJcbjgyOTU5MTc0NzY3MTQwMzYzMTk4MDA4MTg3MTI5MDExODc1NDkxMzEwNTQ3MTI2NTgxXHJcbjk3NjIzMzMxMDQ0ODE4Mzg2MjY5NTE1NDU2MzM0OTI2MzY2NTcyODk3NTYzNDAwNTAwXHJcbjQyODQ2MjgwMTgzNTE3MDcwNTI3ODMxODM5NDI1ODgyMTQ1NTIxMjI3MjUxMjUwMzI3XHJcbjU1MTIxNjAzNTQ2OTgxMjAwNTgxNzYyMTY1MjEyODI3NjUyNzUxNjkxMjk2ODk3Nzg5XHJcbjMyMjM4MTk1NzM0MzI5MzM5OTQ2NDM3NTAxOTA3ODM2OTQ1NzY1ODgzMzUyMzk5ODg2XHJcbjc1NTA2MTY0OTY1MTg0Nzc1MTgwNzM4MTY4ODM3ODYxMDkxNTI3MzU3OTI5NzAxMzM3XHJcbjYyMTc3ODQyNzUyMTkyNjIzNDAxOTQyMzk5NjM5MTY4MDQ0OTgzOTkzMTczMzEyNzMxXHJcbjMyOTI0MTg1NzA3MTQ3MzQ5NTY2OTE2Njc0Njg3NjM0NjYwOTE1MDM1OTE0Njc3NTA0XHJcbjk5NTE4NjcxNDMwMjM1MjE5NjI4ODk0ODkwMTAyNDIzMzI1MTE2OTEzNjE5NjI2NjIyXHJcbjczMjY3NDYwODAwNTkxNTQ3NDcxODMwNzk4MzkyODY4NTM1MjA2OTQ2OTQ0NTQwNzI0XHJcbjc2ODQxODIyNTI0Njc0NDE3MTYxNTE0MDM2NDI3OTgyMjczMzQ4MDU1NTU2MjE0ODE4XHJcbjk3MTQyNjE3OTEwMzQyNTk4NjQ3MjA0NTE2ODkzOTg5NDIyMTc5ODI2MDg4MDc2ODUyXHJcbjg3NzgzNjQ2MTgyNzk5MzQ2MzEzNzY3NzU0MzA3ODA5MzYzMzMzMDE4OTgyNjQyMDkwXHJcbjEwODQ4ODAyNTIxNjc0NjcwODgzMjE1MTIwMTg1ODgzNTQzMjIzODEyODc2OTUyNzg2XHJcbjcxMzI5NjEyNDc0NzgyNDY0NTM4NjM2OTkzMDA5MDQ5MzEwMzYzNjE5NzYzODc4MDM5XHJcbjYyMTg0MDczNTcyMzk5Nzk0MjIzNDA2MjM1MzkzODA4MzM5NjUxMzI3NDA4MDExMTE2XHJcbjY2NjI3ODkxOTgxNDg4MDg3Nzk3OTQxODc2ODc2MTQ0MjMwMDMwOTg0NDkwODUxNDExXHJcbjYwNjYxODI2MjkzNjgyODM2NzY0NzQ0Nzc5MjM5MTgwMzM1MTEwOTg5MDY5NzkwNzE0XHJcbjg1Nzg2OTQ0MDg5NTUyOTkwNjUzNjQwNDQ3NDI1NTc2MDgzNjU5OTc2NjQ1Nzk1MDk2XHJcbjY2MDI0Mzk2NDA5OTA1Mzg5NjA3MTIwMTk4MjE5OTc2MDQ3NTk5NDkwMTk3MjMwMjk3XHJcbjY0OTEzOTgyNjgwMDMyOTczMTU2MDM3MTIwMDQxMzc3OTAzNzg1NTY2MDg1MDg5MjUyXHJcbjE2NzMwOTM5MzE5ODcyNzUwMjc1NDY4OTA2OTAzNzA3NTM5NDEzMDQyNjUyMzE1MDExXHJcbjk0ODA5Mzc3MjQ1MDQ4Nzk1MTUwOTU0MTAwOTIxNjQ1ODYzNzU0NzEwNTk4NDM2NzkxXHJcbjc4NjM5MTY3MDIxMTg3NDkyNDMxOTk1NzAwNjQxOTE3OTY5Nzc3NTk5MDI4MzAwNjk5XHJcbjE1MzY4NzEzNzExOTM2NjE0OTUyODExMzA1ODc2MzgwMjc4NDEwNzU0NDQ5NzMzMDc4XHJcbjQwNzg5OTIzMTE1NTM1NTYyNTYxMTQyMzIyNDIzMjU1MDMzNjg1NDQyNDg4OTE3MzUzXHJcbjQ0ODg5OTExNTAxNDQwNjQ4MDIwMzY5MDY4MDYzOTYwNjcyMzIyMTkzMjA0MTQ5NTM1XHJcbjQxNTAzMTI4ODgwMzM5NTM2MDUzMjk5MzQwMzY4MDA2OTc3NzEwNjUwNTY2NjMxOTU0XHJcbjgxMjM0ODgwNjczMjEwMTQ2NzM5MDU4NTY4NTU3OTM0NTgxNDAzNjI3ODIyNzAzMjgwXHJcbjgyNjE2NTcwNzczOTQ4MzI3NTkyMjMyODQ1OTQxNzA2NTI1MDk0NTEyMzI1MjMwNjA4XHJcbjIyOTE4ODAyMDU4Nzc3MzE5NzE5ODM5NDUwMTgwODg4MDcyNDI5NjYxOTgwODExMTk3XHJcbjc3MTU4NTQyNTAyMDE2NTQ1MDkwNDEzMjQ1ODA5Nzg2ODgyNzc4OTQ4NzIxODU5NjE3XHJcbjcyMTA3ODM4NDM1MDY5MTg2MTU1NDM1NjYyODg0MDYyMjU3NDczNjkyMjg0NTA5NTE2XHJcbjIwODQ5NjAzOTgwMTM0MDAxNzIzOTMwNjcxNjY2ODIzNTU1MjQ1MjUyODA0NjA5NzIyXHJcbjUzNTAzNTM0MjI2NDcyNTI0MjUwODc0MDU0MDc1NTkxNzg5NzgxMjY0MzMwMzMxNjkwXHJcblxyXG5cIlwiXCJcclxuXHJcbm51bWJlcnMgPSBbXHJcbiAgMzcxMDcyODc1MzM5MDIxMDI3OTg3OTc5OTgyMjA4Mzc1OTAyNDY1MTAxMzU3NDAyNTBcclxuICA0NjM3NjkzNzY3NzQ5MDAwOTcxMjY0ODEyNDg5Njk3MDA3ODA1MDQxNzAxODI2MDUzOFxyXG4gIDc0MzI0OTg2MTk5NTI0NzQxMDU5NDc0MjMzMzA5NTEzMDU4MTIzNzI2NjE3MzA5NjI5XHJcbiAgOTE5NDIyMTMzNjM1NzQxNjE1NzI1MjI0MzA1NjMzMDE4MTEwNzI0MDYxNTQ5MDgyNTBcclxuICAyMzA2NzU4ODIwNzUzOTM0NjE3MTE3MTk4MDMxMDQyMTA0NzUxMzc3ODA2MzI0NjY3NlxyXG4gIDg5MjYxNjcwNjk2NjIzNjMzODIwMTM2Mzc4NDE4MzgzNjg0MTc4NzM0MzYxNzI2NzU3XHJcbiAgMjgxMTI4Nzk4MTI4NDk5Nzk0MDgwNjU0ODE5MzE1OTI2MjE2OTEyNzU4ODk4MzI3MzhcclxuICA0NDI3NDIyODkxNzQzMjUyMDMyMTkyMzU4OTQyMjg3Njc5NjQ4NzY3MDI3MjE4OTMxOFxyXG4gIDQ3NDUxNDQ1NzM2MDAxMzA2NDM5MDkxMTY3MjE2ODU2ODQ0NTg4NzExNjAzMTUzMjc2XHJcbiAgNzAzODY0ODYxMDU4NDMwMjU0Mzk5Mzk2MTk4Mjg5MTc1OTM2NjU2ODY3NTc5MzQ5NTFcclxuICA2MjE3NjQ1NzE0MTg1NjU2MDYyOTUwMjE1NzIyMzE5NjU4Njc1NTA3OTMyNDE5MzMzMVxyXG4gIDY0OTA2MzUyNDYyNzQxOTA0OTI5MTAxNDMyNDQ1ODEzODIyNjYzMzQ3OTQ0NzU4MTc4XHJcbiAgOTI1NzU4Njc3MTgzMzcyMTc2NjE5NjM3NTE1OTA1NzkyMzk3MjgyNDU1OTg4Mzg0MDdcclxuICA1ODIwMzU2NTMyNTM1OTM5OTAwODQwMjYzMzU2ODk0ODgzMDE4OTQ1ODYyODIyNzgyOFxyXG4gIDgwMTgxMTk5Mzg0ODI2MjgyMDE0Mjc4MTk0MTM5OTQwNTY3NTg3MTUxMTcwMDk0MzkwXHJcbiAgMzUzOTg2NjQzNzI4MjcxMTI2NTM4Mjk5ODcyNDA3ODQ0NzMwNTMxOTAxMDQyOTM1ODZcclxuICA4NjUxNTUwNjAwNjI5NTg2NDg2MTUzMjA3NTI3MzM3MTk1OTE5MTQyMDUxNzI1NTgyOVxyXG4gIDcxNjkzODg4NzA3NzE1NDY2NDk5MTE1NTkzNDg3NjAzNTMyOTIxNzE0OTcwMDU2OTM4XHJcbiAgNTQzNzAwNzA1NzY4MjY2ODQ2MjQ2MjE0OTU2NTAwNzY0NzE3ODcyOTQ0MzgzNzc2MDRcclxuICA1MzI4MjY1NDEwODc1NjgyODQ0MzE5MTE5MDYzNDY5NDAzNzg1NTIxNzc3OTI5NTE0NVxyXG4gIDM2MTIzMjcyNTI1MDAwMjk2MDcxMDc1MDgyNTYzODE1NjU2NzEwODg1MjU4MzUwNzIxXHJcbiAgNDU4NzY1NzYxNzI0MTA5NzY0NDczMzkxMTA2MDcyMTgyNjUyMzY4NzcyMjM2MzYwNDVcclxuICAxNzQyMzcwNjkwNTg1MTg2MDY2MDQ0ODIwNzYyMTIwOTgxMzI4Nzg2MDczMzk2OTQxMlxyXG4gIDgxMTQyNjYwNDE4MDg2ODMwNjE5MzI4NDYwODExMTkxMDYxNTU2OTQwNTEyNjg5NjkyXHJcbiAgNTE5MzQzMjU0NTE3MjgzODg2NDE5MTgwNDcwNDkyOTMyMTUwNTg2NDI1NjMwNDk0ODNcclxuICA2MjQ2NzIyMTY0ODQzNTA3NjIwMTcyNzkxODAzOTk0NDY5MzAwNDczMjk1NjM0MDY5MVxyXG4gIDE1NzMyNDQ0Mzg2OTA4MTI1Nzk0NTE0MDg5MDU3NzA2MjI5NDI5MTk3MTA3OTI4MjA5XHJcbiAgNTUwMzc2ODc1MjU2Nzg3NzMwOTE4NjI1NDA3NDQ5Njk4NDQ1MDgzMzAzOTM2ODIxMjZcclxuICAxODMzNjM4NDgyNTMzMDE1NDY4NjE5NjEyNDM0ODc2NzY4MTI5NzUzNDM3NTk0NjUxNVxyXG4gIDgwMzg2Mjg3NTkyODc4NDkwMjAxNTIxNjg1NTU0ODI4NzE3MjAxMjE5MjU3NzY2OTU0XHJcbiAgNzgxODI4MzM3NTc5OTMxMDM2MTQ3NDAzNTY4NTY0NDkwOTU1MjcwOTc4NjQ3OTc1ODFcclxuICAxNjcyNjMyMDEwMDQzNjg5Nzg0MjU1MzUzOTkyMDkzMTgzNzQ0MTQ5NzgwNjg2MDk4NFxyXG4gIDQ4NDAzMDk4MTI5MDc3NzkxNzk5MDg4MjE4Nzk1MzI3MzY0NDc1Njc1NTkwODQ4MDMwXHJcbiAgODcwODY5ODc1NTEzOTI3MTE4NTQ1MTcwNzg1NDQxNjE4NTI0MjQzMjA2OTMxNTAzMzJcclxuICA1OTk1OTQwNjg5NTc1NjUzNjc4MjEwNzA3NDkyNjk2NjUzNzY3NjMyNjIzNTQ0NzIxMFxyXG4gIDY5NzkzOTUwNjc5NjUyNjk0NzQyNTk3NzA5NzM5MTY2NjkzNzYzMDQyNjMzOTg3MDg1XHJcbiAgNDEwNTI2ODQ3MDgyOTkwODUyMTEzOTk0MjczNjU3MzQxMTYxODI3NjAzMTUwMDEyNzFcclxuICA2NTM3ODYwNzM2MTUwMTA4MDg1NzAwOTE0OTkzOTUxMjU1NzAyODE5ODc0NjAwNDM3NVxyXG4gIDM1ODI5MDM1MzE3NDM0NzE3MzI2OTMyMTIzNTc4MTU0OTgyNjI5NzQyNTUyNzM3MzA3XHJcbiAgOTQ5NTM3NTk3NjUxMDUzMDU5NDY5NjYwNjc2ODMxNTY1NzQzNzcxNjc0MDE4NzUyNzVcclxuICA4ODkwMjgwMjU3MTczMzIyOTYxOTE3NjY2ODcxMzgxOTkzMTgxMTA0ODc3MDE5MDI3MVxyXG4gIDI1MjY3NjgwMjc2MDc4MDAzMDEzNjc4NjgwOTkyNTI1NDYzNDAxMDYxNjMyODY2NTI2XHJcbiAgMzYyNzAyMTg1NDA0OTc3MDU1ODU2Mjk5NDY1ODA2MzYyMzc5OTMxNDA3NDYyNTU5NjJcclxuICAyNDA3NDQ4NjkwODIzMTE3NDk3Nzc5MjM2NTQ2NjI1NzI0NjkyMzMyMjgxMDkxNzE0MVxyXG4gIDkxNDMwMjg4MTk3MTAzMjg4NTk3ODA2NjY5NzYwODkyOTM4NjM4Mjg1MDI1MzMzNDAzXHJcbiAgMzQ0MTMwNjU1NzgwMTYxMjc4MTU5MjE4MTUwMDU1NjE4Njg4MzY0Njg0MjAwOTA0NzBcclxuICAyMzA1MzA4MTE3MjgxNjQzMDQ4NzYyMzc5MTk2OTg0MjQ4NzI1NTAzNjYzODc4NDU4M1xyXG4gIDExNDg3Njk2OTMyMTU0OTAyODEwNDI0MDIwMTM4MzM1MTI0NDYyMTgxNDQxNzczNDcwXHJcbiAgNjM3ODMyOTk0OTA2MzYyNTk2NjY0OTg1ODc2MTgyMjEyMjUyMjU1MTI0ODY3NjQ1MzNcclxuICA2NzcyMDE4Njk3MTY5ODU0NDMxMjQxOTU3MjQwOTkxMzk1OTAwODk1MjMxMDA1ODgyMlxyXG4gIDk1NTQ4MjU1MzAwMjYzNTIwNzgxNTMyMjk2Nzk2MjQ5NDgxNjQxOTUzODY4MjE4Nzc0XHJcbiAgNzYwODUzMjcxMzIyODU3MjMxMTA0MjQ4MDM0NTYxMjQ4Njc2OTcwNjQ1MDc5OTUyMzZcclxuICAzNzc3NDI0MjUzNTQxMTI5MTY4NDI3Njg2NTUzODkyNjIwNTAyNDkxMDMyNjU3Mjk2N1xyXG4gIDIzNzAxOTEzMjc1NzI1Njc1Mjg1NjUzMjQ4MjU4MjY1NDYzMDkyMjA3MDU4NTk2NTIyXHJcbiAgMjk3OTg4NjAyNzIyNTgzMzE5MTMxMjYzNzUxNDczNDE5OTQ4ODk1MzQ3NjU3NDU1MDFcclxuICAxODQ5NTcwMTQ1NDg3OTI4ODk4NDg1NjgyNzcyNjA3NzcxMzcyMTQwMzc5ODg3OTcxNVxyXG4gIDM4Mjk4MjAzNzgzMDMxNDczNTI3NzIxNTgwMzQ4MTQ0NTEzNDkxMzczMjI2NjUxMzgxXHJcbiAgMzQ4Mjk1NDM4MjkxOTk5MTgxODAyNzg5MTY1MjI0MzEwMjczOTIyNTExMjI4Njk1MzlcclxuICA0MDk1Nzk1MzA2NjQwNTIzMjYzMjUzODA0NDEwMDA1OTY1NDkzOTE1OTg3OTU5MzYzNVxyXG4gIDI5NzQ2MTUyMTg1NTAyMzcxMzA3NjQyMjU1MTIxMTgzNjkzODAzNTgwMzg4NTg0OTAzXHJcbiAgNDE2OTgxMTYyMjIwNzI5NzcxODYxNTgyMzY2Nzg0MjQ2ODkxNTc5OTM1MzI5NjE5MjJcclxuICA2MjQ2Nzk1NzE5NDQwMTI2OTA0Mzg3NzEwNzI3NTA0ODEwMjM5MDg5NTUyMzU5NzQ1N1xyXG4gIDIzMTg5NzA2NzcyNTQ3OTE1MDYxNTA1NTA0OTUzOTIyOTc5NTMwOTAxMTI5OTY3NTE5XHJcbiAgODYxODgwODgyMjU4NzUzMTQ1Mjk1ODQwOTkyNTEyMDM4MjkwMDk0MDc3NzA3NzU2NzJcclxuICAxMTMwNjczOTcwODMwNDcyNDQ4MzgxNjUzMzg3MzUwMjM0MDg0NTY0NzA1ODA3NzMwOFxyXG4gIDgyOTU5MTc0NzY3MTQwMzYzMTk4MDA4MTg3MTI5MDExODc1NDkxMzEwNTQ3MTI2NTgxXHJcbiAgOTc2MjMzMzEwNDQ4MTgzODYyNjk1MTU0NTYzMzQ5MjYzNjY1NzI4OTc1NjM0MDA1MDBcclxuICA0Mjg0NjI4MDE4MzUxNzA3MDUyNzgzMTgzOTQyNTg4MjE0NTUyMTIyNzI1MTI1MDMyN1xyXG4gIDU1MTIxNjAzNTQ2OTgxMjAwNTgxNzYyMTY1MjEyODI3NjUyNzUxNjkxMjk2ODk3Nzg5XHJcbiAgMzIyMzgxOTU3MzQzMjkzMzk5NDY0Mzc1MDE5MDc4MzY5NDU3NjU4ODMzNTIzOTk4ODZcclxuICA3NTUwNjE2NDk2NTE4NDc3NTE4MDczODE2ODgzNzg2MTA5MTUyNzM1NzkyOTcwMTMzN1xyXG4gIDYyMTc3ODQyNzUyMTkyNjIzNDAxOTQyMzk5NjM5MTY4MDQ0OTgzOTkzMTczMzEyNzMxXHJcbiAgMzI5MjQxODU3MDcxNDczNDk1NjY5MTY2NzQ2ODc2MzQ2NjA5MTUwMzU5MTQ2Nzc1MDRcclxuICA5OTUxODY3MTQzMDIzNTIxOTYyODg5NDg5MDEwMjQyMzMyNTExNjkxMzYxOTYyNjYyMlxyXG4gIDczMjY3NDYwODAwNTkxNTQ3NDcxODMwNzk4MzkyODY4NTM1MjA2OTQ2OTQ0NTQwNzI0XHJcbiAgNzY4NDE4MjI1MjQ2NzQ0MTcxNjE1MTQwMzY0Mjc5ODIyNzMzNDgwNTU1NTYyMTQ4MThcclxuICA5NzE0MjYxNzkxMDM0MjU5ODY0NzIwNDUxNjg5Mzk4OTQyMjE3OTgyNjA4ODA3Njg1MlxyXG4gIDg3NzgzNjQ2MTgyNzk5MzQ2MzEzNzY3NzU0MzA3ODA5MzYzMzMzMDE4OTgyNjQyMDkwXHJcbiAgMTA4NDg4MDI1MjE2NzQ2NzA4ODMyMTUxMjAxODU4ODM1NDMyMjM4MTI4NzY5NTI3ODZcclxuICA3MTMyOTYxMjQ3NDc4MjQ2NDUzODYzNjk5MzAwOTA0OTMxMDM2MzYxOTc2Mzg3ODAzOVxyXG4gIDYyMTg0MDczNTcyMzk5Nzk0MjIzNDA2MjM1MzkzODA4MzM5NjUxMzI3NDA4MDExMTE2XHJcbiAgNjY2Mjc4OTE5ODE0ODgwODc3OTc5NDE4NzY4NzYxNDQyMzAwMzA5ODQ0OTA4NTE0MTFcclxuICA2MDY2MTgyNjI5MzY4MjgzNjc2NDc0NDc3OTIzOTE4MDMzNTExMDk4OTA2OTc5MDcxNFxyXG4gIDg1Nzg2OTQ0MDg5NTUyOTkwNjUzNjQwNDQ3NDI1NTc2MDgzNjU5OTc2NjQ1Nzk1MDk2XHJcbiAgNjYwMjQzOTY0MDk5MDUzODk2MDcxMjAxOTgyMTk5NzYwNDc1OTk0OTAxOTcyMzAyOTdcclxuICA2NDkxMzk4MjY4MDAzMjk3MzE1NjAzNzEyMDA0MTM3NzkwMzc4NTU2NjA4NTA4OTI1MlxyXG4gIDE2NzMwOTM5MzE5ODcyNzUwMjc1NDY4OTA2OTAzNzA3NTM5NDEzMDQyNjUyMzE1MDExXHJcbiAgOTQ4MDkzNzcyNDUwNDg3OTUxNTA5NTQxMDA5MjE2NDU4NjM3NTQ3MTA1OTg0MzY3OTFcclxuICA3ODYzOTE2NzAyMTE4NzQ5MjQzMTk5NTcwMDY0MTkxNzk2OTc3NzU5OTAyODMwMDY5OVxyXG4gIDE1MzY4NzEzNzExOTM2NjE0OTUyODExMzA1ODc2MzgwMjc4NDEwNzU0NDQ5NzMzMDc4XHJcbiAgNDA3ODk5MjMxMTU1MzU1NjI1NjExNDIzMjI0MjMyNTUwMzM2ODU0NDI0ODg5MTczNTNcclxuICA0NDg4OTkxMTUwMTQ0MDY0ODAyMDM2OTA2ODA2Mzk2MDY3MjMyMjE5MzIwNDE0OTUzNVxyXG4gIDQxNTAzMTI4ODgwMzM5NTM2MDUzMjk5MzQwMzY4MDA2OTc3NzEwNjUwNTY2NjMxOTU0XHJcbiAgODEyMzQ4ODA2NzMyMTAxNDY3MzkwNTg1Njg1NTc5MzQ1ODE0MDM2Mjc4MjI3MDMyODBcclxuICA4MjYxNjU3MDc3Mzk0ODMyNzU5MjIzMjg0NTk0MTcwNjUyNTA5NDUxMjMyNTIzMDYwOFxyXG4gIDIyOTE4ODAyMDU4Nzc3MzE5NzE5ODM5NDUwMTgwODg4MDcyNDI5NjYxOTgwODExMTk3XHJcbiAgNzcxNTg1NDI1MDIwMTY1NDUwOTA0MTMyNDU4MDk3ODY4ODI3Nzg5NDg3MjE4NTk2MTdcclxuICA3MjEwNzgzODQzNTA2OTE4NjE1NTQzNTY2Mjg4NDA2MjI1NzQ3MzY5MjI4NDUwOTUxNlxyXG4gIDIwODQ5NjAzOTgwMTM0MDAxNzIzOTMwNjcxNjY2ODIzNTU1MjQ1MjUyODA0NjA5NzIyXHJcbiAgNTM1MDM1MzQyMjY0NzI1MjQyNTA4NzQwNTQwNzU1OTE3ODk3ODEyNjQzMzAzMzE2OTBcclxuXVxyXG5cclxucHJvYmxlbS5hbnN3ZXIgPSAtPlxyXG4gIHN1bSA9IDBcclxuICBmb3IgbiBpbiBudW1iZXJzXHJcbiAgICBzdW0gKz0gblxyXG5cclxuICBzdHIgPSBTdHJpbmcoc3VtKS5yZXBsYWNlKC9cXC4vZywgXCJcIikuc3Vic3RyKDAsIDEwKVxyXG4gIHJldHVybiBzdHJcclxuIiwibW9kdWxlLmV4cG9ydHMgPSBwcm9ibGVtID0gbmV3IFByb2JsZW0gXCJcIlwiXHJcblxyXG5Qcm9ibGVtIDE0OiBMb25nZXN0IENvbGxhdHogc2VxdWVuY2VcclxuLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5UaGUgZm9sbG93aW5nIGl0ZXJhdGl2ZSBzZXF1ZW5jZSBpcyBkZWZpbmVkIGZvciB0aGUgc2V0IG9mIHBvc2l0aXZlIGludGVnZXJzOlxyXG5cclxuICAgIG4gLT4gbi8yICAgIChuIGlzIGV2ZW4pXHJcbiAgICBuIC0+IDNuICsgMSAobiBpcyBvZGQpXHJcblxyXG5Vc2luZyB0aGUgcnVsZSBhYm92ZSBhbmQgc3RhcnRpbmcgd2l0aCAxMywgd2UgZ2VuZXJhdGUgdGhlIGZvbGxvd2luZyBzZXF1ZW5jZTpcclxuXHJcbiAgICAxMyAtPiA0MCAtPiAyMCAtPiAxMCAtPiA1IC0+IDE2IC0+IDggLT4gNCAtPiAyIC0+IDFcclxuXHJcbkl0IGNhbiBiZSBzZWVuIHRoYXQgdGhpcyBzZXF1ZW5jZSAoc3RhcnRpbmcgYXQgMTMgYW5kIGZpbmlzaGluZyBhdCAxKSBjb250YWlucyAxMCB0ZXJtcy4gQWx0aG91Z2ggaXQgaGFzIG5vdCBiZWVuIHByb3ZlZCB5ZXQgKENvbGxhdHogUHJvYmxlbSksIGl0IGlzIHRob3VnaHQgdGhhdCBhbGwgc3RhcnRpbmcgbnVtYmVycyBmaW5pc2ggYXQgMS5cclxuXHJcbldoaWNoIHN0YXJ0aW5nIG51bWJlciwgdW5kZXIgb25lIG1pbGxpb24sIHByb2R1Y2VzIHRoZSBsb25nZXN0IGNoYWluP1xyXG5cclxuTk9URTogT25jZSB0aGUgY2hhaW4gc3RhcnRzIHRoZSB0ZXJtcyBhcmUgYWxsb3dlZCB0byBnbyBhYm92ZSBvbmUgbWlsbGlvbi5cclxuXHJcblwiXCJcIlxyXG5cclxuY29sbGF0ekNhY2hlID0ge31cclxuXHJcbmNvbGxhdHpDaGFpbkxlbmd0aCA9IChzdGFydGluZ1ZhbHVlKSAtPlxyXG4gIG4gPSBzdGFydGluZ1ZhbHVlXHJcbiAgdG9CZUNhY2hlZCA9IFtdXHJcblxyXG4gIGxvb3BcclxuICAgIGJyZWFrIGlmIGNvbGxhdHpDYWNoZS5oYXNPd25Qcm9wZXJ0eShuKVxyXG5cclxuICAgICMgcmVtZW1iZXIgdGhhdCB3ZSBmYWlsZWQgdG8gY2FjaGUgdGhpcyBlbnRyeVxyXG4gICAgdG9CZUNhY2hlZC5wdXNoKG4pXHJcblxyXG4gICAgaWYgbiA9PSAxXHJcbiAgICAgIGJyZWFrXHJcblxyXG4gICAgaWYgKG4gJSAyKSA9PSAwXHJcbiAgICAgIG4gPSBNYXRoLmZsb29yKG4gLyAyKVxyXG4gICAgZWxzZVxyXG4gICAgICBuID0gKG4gKiAzKSArIDFcclxuXHJcbiAgIyBTaW5jZSB3ZSBsZWZ0IGJyZWFkY3J1bWJzIGRvd24gdGhlIHRyYWlsIG9mIHRoaW5ncyB3ZSBoYXZlbid0IGNhY2hlZFxyXG4gICMgd2FsayBiYWNrIGRvd24gdGhlIHRyYWlsIGFuZCBjYWNoZSBhbGwgdGhlIGVudHJpZXMgZm91bmQgYWxvbmcgdGhlIHdheVxyXG4gIGxlbiA9IHRvQmVDYWNoZWQubGVuZ3RoXHJcbiAgZm9yIHYsaSBpbiB0b0JlQ2FjaGVkXHJcbiAgICBjb2xsYXR6Q2FjaGVbdl0gPSBjb2xsYXR6Q2FjaGVbbl0gKyAobGVuIC0gaSlcclxuXHJcbiAgcmV0dXJuIGNvbGxhdHpDYWNoZVtzdGFydGluZ1ZhbHVlXVxyXG5cclxucHJvYmxlbS50ZXN0ID0gLT5cclxuICBjb2xsYXR6Q2FjaGUgPSB7IFwiMVwiOiAxIH1cclxuICBlcXVhbChjb2xsYXR6Q2hhaW5MZW5ndGgoMTMpLCAxMCwgXCIxMyBoYXMgYSBjb2xsYXR6IGNoYWluIG9mIDEwXCIpXHJcbiAgZXF1YWwoY29sbGF0ekNoYWluTGVuZ3RoKDI2KSwgMTEsIFwiMjYgaGFzIGEgY29sbGF0eiBjaGFpbiBvZiAxMVwiKVxyXG4gIGVxdWFsKGNvbGxhdHpDaGFpbkxlbmd0aCggMSksICAxLCBcIjEgaGFzIGEgY29sbGF0eiBjaGFpbiBvZiAxXCIpXHJcblxyXG5wcm9ibGVtLmFuc3dlciA9IC0+XHJcbiAgY29sbGF0ekNhY2hlID0geyBcIjFcIjogMSB9XHJcblxyXG4gIG1heENoYWluID0gMFxyXG4gIG1heENoYWluTGVuZ3RoID0gMFxyXG4gIGZvciBpIGluIFsxLi4uMTAwMDAwMF1cclxuICAgIGNoYWluTGVuZ3RoID0gY29sbGF0ekNoYWluTGVuZ3RoKGkpXHJcbiAgICBpZiBtYXhDaGFpbkxlbmd0aCA8IGNoYWluTGVuZ3RoXHJcbiAgICAgIG1heENoYWluTGVuZ3RoID0gY2hhaW5MZW5ndGhcclxuICAgICAgbWF4Q2hhaW4gPSBpXHJcblxyXG4gIHJldHVybiB7IGFuc3dlcjogbWF4Q2hhaW4sIGNoYWluTGVuZ3RoOiBtYXhDaGFpbkxlbmd0aCB9XHJcbiIsIm1vZHVsZS5leHBvcnRzID0gcHJvYmxlbSA9IG5ldyBQcm9ibGVtIFwiXCJcIlxyXG5cclxuUHJvYmxlbSAxNTogTGF0dGljZSBwYXRoc1xyXG4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5TdGFydGluZyBpbiB0aGUgdG9wIGxlZnQgY29ybmVyIG9mIGEgMsOXMiBncmlkLCBhbmQgb25seSBiZWluZyBhYmxlIHRvIG1vdmUgdG8gdGhlIHJpZ2h0IGFuZCBkb3duLCB0aGVyZSBhcmUgZXhhY3RseSA2IHJvdXRlcyB0byB0aGUgYm90dG9tIHJpZ2h0IGNvcm5lci5cclxuXHJcbiAgICAocGljdHVyZSBzaG93aW5nIDYgcGF0aHM6IFJSREQsIFJEUkQsIFJERFIsIERSUkQsIERSRFIsIEREUlIpXHJcblxyXG5Ib3cgbWFueSBzdWNoIHJvdXRlcyBhcmUgdGhlcmUgdGhyb3VnaCBhIDIww5cyMCBncmlkP1xyXG5cclxuXCJcIlwiXHJcblxyXG5tYXRoID0gcmVxdWlyZSBcIm1hdGhcIlxyXG5cclxubGF0dGljZSA9IChuKSAtPlxyXG4gIHJldHVybiBtYXRoLm5DcihuICogMiwgbilcclxuXHJcbnByb2JsZW0udGVzdCA9IC0+XHJcbiAgZXF1YWwobGF0dGljZSgxKSwgMiwgXCIxeDEgbGF0dGljZSBoYXMgMiBwYXRoc1wiKVxyXG4gIGVxdWFsKGxhdHRpY2UoMiksIDYsIFwiMngyIGxhdHRpY2UgaGFzIDYgcGF0aHNcIilcclxuXHJcbnByb2JsZW0uYW5zd2VyID0gLT5cclxuICByZXR1cm4gbGF0dGljZSgyMClcclxuIiwibW9kdWxlLmV4cG9ydHMgPSBwcm9ibGVtID0gbmV3IFByb2JsZW0gXCJcIlwiXHJcblxyXG5Qcm9ibGVtIDE2OiBQb3dlciBkaWdpdCBzdW1cclxuLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4yXjE1ID0gMzI3NjggYW5kIHRoZSBzdW0gb2YgaXRzIGRpZ2l0cyBpcyAzICsgMiArIDcgKyA2ICsgOCA9IDI2LlxyXG5cclxuV2hhdCBpcyB0aGUgc3VtIG9mIHRoZSBkaWdpdHMgb2YgdGhlIG51bWJlciAyXjEwMDA/XHJcblxyXG5cIlwiXCJcclxuXHJcbm1hdGggPSByZXF1aXJlIFwibWF0aFwiXHJcbmJpZ0ludCA9IHJlcXVpcmUgXCJiaWctaW50ZWdlclwiXHJcblxyXG5NQVhfRVhQT05FTlQgPSA1MFxyXG5cclxucG93ZXJEaWdpdFN1bSA9ICh4LCB5KSAtPlxyXG4gIG51bWJlciA9IGJpZ0ludCgxKVxyXG4gIHdoaWxlIHkgIT0gMFxyXG4gICAgZXhwb25lbnQgPSB5XHJcbiAgICBpZiBleHBvbmVudCA+IE1BWF9FWFBPTkVOVFxyXG4gICAgICBleHBvbmVudCA9IE1BWF9FWFBPTkVOVFxyXG4gICAgeSAtPSBleHBvbmVudFxyXG4gICAgbnVtYmVyID0gbnVtYmVyLm11bHRpcGx5IE1hdGguZmxvb3IoTWF0aC5wb3coeCwgZXhwb25lbnQpKVxyXG4gIGRpZ2l0cyA9IFN0cmluZyhudW1iZXIpXHJcblxyXG4gIHN1bSA9IDBcclxuICBmb3IgZCBpbiBkaWdpdHNcclxuICAgIHN1bSArPSBwYXJzZUludChkKVxyXG4gIHJldHVybiBzdW1cclxuXHJcbnByb2JsZW0udGVzdCA9IC0+XHJcbiAgZXF1YWwocG93ZXJEaWdpdFN1bSgyLCAxNSksIDI2LCBcInN1bSBvZiBkaWdpdHMgb2YgMl4xNSBpcyAyNlwiKVxyXG5cclxucHJvYmxlbS5hbnN3ZXIgPSAtPlxyXG4gIHJldHVybiBwb3dlckRpZ2l0U3VtKDIsIDEwMDApXHJcbiIsIm1vZHVsZS5leHBvcnRzID0gcHJvYmxlbSA9IG5ldyBQcm9ibGVtIFwiXCJcIlxyXG5cclxuUHJvYmxlbSAxNzogTnVtYmVyIGxldHRlciBjb3VudHNcclxuLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbklmIHRoZSBudW1iZXJzIDEgdG8gNSBhcmUgd3JpdHRlbiBvdXQgaW4gd29yZHM6IG9uZSwgdHdvLCB0aHJlZSwgZm91ciwgZml2ZSwgdGhlbiB0aGVyZSBhcmUgMyArIDMgKyA1ICsgNCArIDQgPSAxOSBsZXR0ZXJzIHVzZWQgaW4gdG90YWwuXHJcblxyXG5JZiBhbGwgdGhlIG51bWJlcnMgZnJvbSAxIHRvIDEwMDAgKG9uZSB0aG91c2FuZCkgaW5jbHVzaXZlIHdlcmUgd3JpdHRlbiBvdXQgaW4gd29yZHMsIGhvdyBtYW55IGxldHRlcnMgd291bGQgYmUgdXNlZD9cclxuXHJcbk5PVEU6IERvIG5vdCBjb3VudCBzcGFjZXMgb3IgaHlwaGVucy4gRm9yIGV4YW1wbGUsIDM0MiAodGhyZWUgaHVuZHJlZCBhbmQgZm9ydHktdHdvKSBjb250YWlucyAyMyBsZXR0ZXJzIGFuZCAxMTUgKG9uZSBodW5kcmVkIGFuZCBmaWZ0ZWVuKSBjb250YWlucyAyMCBsZXR0ZXJzLiBUaGUgdXNlIG9mIFwiYW5kXCIgd2hlbiB3cml0aW5nIG91dCBudW1iZXJzIGlzIGluIGNvbXBsaWFuY2Ugd2l0aCBCcml0aXNoIHVzYWdlLlxyXG5cclxuXCJcIlwiXHJcblxyXG5uYW1lcyA9XHJcbiAgb25lczogXCJ6ZXJvIG9uZSB0d28gdGhyZWUgZm91ciBmaXZlIHNpeCBzZXZlbiBlaWdodCBuaW5lIHRlbiBlbGV2ZW4gdHdlbHZlIHRoaXJ0ZWVuIGZvdXJ0ZWVuIGZpZnRlZW4gc2l4dGVlbiBzZXZlbnRlZW4gZWlnaHRlZW4gbmluZXRlZW5cIi5zcGxpdCgvXFxzKy8pXHJcbiAgdGVuczogXCJfIF8gdHdlbnR5IHRoaXJ0eSBmb3J0eSBmaWZ0eSBzaXh0eSBzZXZlbnR5IGVpZ2h0eSBuaW5ldHlcIi5zcGxpdCgvXFxzKy8pXHJcblxyXG4jIHN1cHBvcnRzIDAtOTk5OVxyXG5udW1iZXJMZXR0ZXJDb3VudCA9IChudW0pIC0+XHJcbiAgbiA9IG51bVxyXG4gIG5hbWUgPSBcIlwiXHJcblxyXG4gIGlmIG4gPj0gMTAwMFxyXG4gICAgdGhvdXNhbmRzID0gTWF0aC5mbG9vcihuIC8gMTAwMClcclxuICAgIG4gPSBuICUgMTAwMFxyXG4gICAgbmFtZSArPSBcIiN7bmFtZXMub25lc1t0aG91c2FuZHNdfSB0aG91c2FuZCBcIlxyXG5cclxuICBpZiBuID49IDEwMFxyXG4gICAgaHVuZHJlZHMgPSBNYXRoLmZsb29yKG4gLyAxMDApXHJcbiAgICBuID0gbiAlIDEwMFxyXG4gICAgbmFtZSArPSBcIiN7bmFtZXMub25lc1todW5kcmVkc119IGh1bmRyZWQgXCJcclxuXHJcbiAgaWYgKG4gPiAwKSBhbmQgKG5hbWUubGVuZ3RoID4gMClcclxuICAgIG5hbWUgKz0gXCJhbmQgXCJcclxuXHJcbiAgaWYgbiA+PSAyMFxyXG4gICAgdGVucyA9IE1hdGguZmxvb3IobiAvIDEwKVxyXG4gICAgbiA9IG4gJSAxMFxyXG4gICAgbmFtZSArPSBcIiN7bmFtZXMudGVuc1t0ZW5zXX0gXCJcclxuXHJcbiAgaWYgbiA+IDBcclxuICAgIG5hbWUgKz0gXCIje25hbWVzLm9uZXNbbl19IFwiXHJcblxyXG4gIGxldHRlcnNPbmx5ID0gbmFtZS5yZXBsYWNlKC9bXmEtel0vZywgXCJcIilcclxuICAjIGNvbnNvbGUubG9nIFwibnVtOiAje251bX0sIG5hbWU6ICN7bmFtZX0sIGxldHRlcnNPbmx5OiAje2xldHRlcnNPbmx5fVwiXHJcbiAgcmV0dXJuIGxldHRlcnNPbmx5Lmxlbmd0aFxyXG5cclxubnVtYmVyTGV0dGVyQ291bnRSYW5nZSA9IChhLCBiKSAtPlxyXG4gIHN1bSA9IDBcclxuICBmb3IgaSBpbiBbYS4uYl1cclxuICAgIHN1bSArPSBudW1iZXJMZXR0ZXJDb3VudChpKVxyXG4gIHJldHVybiBzdW1cclxuXHJcbnByb2JsZW0udGVzdCA9IC0+XHJcbiAgZXF1YWwobnVtYmVyTGV0dGVyQ291bnRSYW5nZSgxLCA1KSwgMTksIFwic3VtIG9mIGxlbmd0aHMgb2YgbnVtYmVycyAxLTUgaXMgMTlcIilcclxuICBlcXVhbChudW1iZXJMZXR0ZXJDb3VudCgzNDIpLCAyMywgXCJsZW5ndGggb2YgbmFtZSBvZiAzNDIgaXMgMjNcIilcclxuICBlcXVhbChudW1iZXJMZXR0ZXJDb3VudCgxMTUpLCAyMCwgXCJsZW5ndGggb2YgbmFtZSBvZiAxMTUgaXMgMjBcIilcclxuXHJcbnByb2JsZW0uYW5zd2VyID0gLT5cclxuICByZXR1cm4gbnVtYmVyTGV0dGVyQ291bnRSYW5nZSgxLCAxMDAwKVxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHByb2JsZW0gPSBuZXcgUHJvYmxlbSBcIlwiXCJcclxuXHJcblByb2JsZW0gMTg6IE1heGltdW0gcGF0aCBzdW0gSVxyXG4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbkJ5IHN0YXJ0aW5nIGF0IHRoZSB0b3Agb2YgdGhlIHRyaWFuZ2xlIGJlbG93IGFuZCBtb3ZpbmcgdG8gYWRqYWNlbnQgbnVtYmVycyBvbiB0aGUgcm93IGJlbG93LCB0aGUgbWF4aW11bSB0b3RhbCBmcm9tIHRvcCB0byBib3R0b20gaXMgMjMuXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgNyA0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAyIDQgNlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICA4IDUgOSAzXHJcblxyXG5UaGF0IGlzLCAzICsgNyArIDQgKyA5ID0gMjMuXHJcblxyXG5GaW5kIHRoZSBtYXhpbXVtIHRvdGFsIGZyb20gdG9wIHRvIGJvdHRvbSBvZiB0aGUgdHJpYW5nbGUgYmVsb3c6XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA3NVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOTUgIDY0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgMTcgIDQ3ICA4MlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAxOCAgMzUgIDg3ICAxMFxyXG4gICAgICAgICAgICAgICAgICAgICAgMjAgIDA0ICA4MiAgNDcgIDY1XHJcbiAgICAgICAgICAgICAgICAgICAgMTkgIDAxICAyMyAgNzUgIDAzICAzNFxyXG4gICAgICAgICAgICAgICAgICA4OCAgMDIgIDc3ICA3MyAgMDcgIDYzICA2N1xyXG4gICAgICAgICAgICAgICAgOTkgIDY1ICAwNCAgMjggIDA2ICAxNiAgNzAgIDkyXHJcbiAgICAgICAgICAgICAgNDEgIDQxICAyNiAgNTYgIDgzICA0MCAgODAgIDcwICAzM1xyXG4gICAgICAgICAgICA0MSAgNDggIDcyICAzMyAgNDcgIDMyICAzNyAgMTYgIDk0ICAyOVxyXG4gICAgICAgICAgNTMgIDcxICA0NCAgNjUgIDI1ICA0MyAgOTEgIDUyICA5NyAgNTEgIDE0XHJcbiAgICAgICAgNzAgIDExICAzMyAgMjggIDc3ICA3MyAgMTcgIDc4ICAzOSAgNjggIDE3ICA1N1xyXG4gICAgICA5MSAgNzEgIDUyICAzOCAgMTcgIDE0ICA5MSAgNDMgIDU4ICA1MCAgMjcgIDI5ICA0OFxyXG4gICAgNjMgIDY2ICAwNCAgNjggIDg5ICA1MyAgNjcgIDMwICA3MyAgMTYgIDY5ICA4NyAgNDAgIDMxXHJcbiAgMDQgIDYyICA5OCAgMjcgIDIzICAwOSAgNzAgIDk4ICA3MyAgOTMgIDM4ICA1MyAgNjAgIDA0ICAyM1xyXG5cclxuTk9URTogQXMgdGhlcmUgYXJlIG9ubHkgMTYzODQgcm91dGVzLCBpdCBpcyBwb3NzaWJsZSB0byBzb2x2ZSB0aGlzIHByb2JsZW0gYnkgdHJ5aW5nIGV2ZXJ5IHJvdXRlLiBIb3dldmVyLCBQcm9ibGVtIDY3LCBpcyB0aGUgc2FtZSBjaGFsbGVuZ2Ugd2l0aCBhIHRyaWFuZ2xlIGNvbnRhaW5pbmcgb25lLWh1bmRyZWQgcm93czsgaXQgY2Fubm90IGJlIHNvbHZlZCBieSBicnV0ZSBmb3JjZSwgYW5kIHJlcXVpcmVzIGEgY2xldmVyIG1ldGhvZCEgO28pXHJcblxyXG5cIlwiXCJcclxuXHJcbm1hdGggPSByZXF1aXJlIFwibWF0aFwiXHJcblxyXG50ZXN0UHlyYW1pZCA9IFwiXCJcIlxyXG4gICAgICAzXHJcbiAgICAgNyA0XHJcbiAgICAyIDQgNlxyXG4gICA4IDUgOSAzXHJcblwiXCJcIlxyXG5cclxubWFpblB5cmFtaWQgPSBcIlwiXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgNzVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDk1ICA2NFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDE3ICA0NyAgODJcclxuICAgICAgICAgICAgICAgICAgICAgICAgMTggIDM1ICA4NyAgMTBcclxuICAgICAgICAgICAgICAgICAgICAgIDIwICAwNCAgODIgIDQ3ICA2NVxyXG4gICAgICAgICAgICAgICAgICAgIDE5ICAwMSAgMjMgIDc1ICAwMyAgMzRcclxuICAgICAgICAgICAgICAgICAgODggIDAyICA3NyAgNzMgIDA3ICA2MyAgNjdcclxuICAgICAgICAgICAgICAgIDk5ICA2NSAgMDQgIDI4ICAwNiAgMTYgIDcwICA5MlxyXG4gICAgICAgICAgICAgIDQxICA0MSAgMjYgIDU2ICA4MyAgNDAgIDgwICA3MCAgMzNcclxuICAgICAgICAgICAgNDEgIDQ4ICA3MiAgMzMgIDQ3ICAzMiAgMzcgIDE2ICA5NCAgMjlcclxuICAgICAgICAgIDUzICA3MSAgNDQgIDY1ICAyNSAgNDMgIDkxICA1MiAgOTcgIDUxICAxNFxyXG4gICAgICAgIDcwICAxMSAgMzMgIDI4ICA3NyAgNzMgIDE3ICA3OCAgMzkgIDY4ICAxNyAgNTdcclxuICAgICAgOTEgIDcxICA1MiAgMzggIDE3ICAxNCAgOTEgIDQzICA1OCAgNTAgIDI3ICAyOSAgNDhcclxuICAgIDYzICA2NiAgMDQgIDY4ICA4OSAgNTMgIDY3ICAzMCAgNzMgIDE2ICA2OSAgODcgIDQwICAzMVxyXG4gIDA0ICA2MiAgOTggIDI3ICAyMyAgMDkgIDcwICA5OCAgNzMgIDkzICAzOCAgNTMgIDYwICAwNCAgMjNcclxuXHJcblwiXCJcIlxyXG5cclxuc3RyaW5nVG9QeXJhbWlkID0gKHN0cikgLT5cclxuICBkaWdpdHMgPSAocGFyc2VJbnQoZCkgZm9yIGQgaW4gU3RyaW5nKHN0cikucmVwbGFjZSgvXFxuL2csIFwiIFwiKS5zcGxpdCgvXFxzKy8pLmZpbHRlciAocykgLT4gcmV0dXJuIChzLmxlbmd0aCA+IDApIClcclxuICBncmlkID0gW11cclxuICByb3cgPSAwXHJcbiAgd2hpbGUgZGlnaXRzLmxlbmd0aFxyXG4gICAgbGVuID0gcm93ICsgMVxyXG4gICAgYSA9IEFycmF5KGxlbilcclxuICAgIGZvciBpIGluIFswLi4ubGVuXVxyXG4gICAgICBhW2ldID0gZGlnaXRzLnNoaWZ0KClcclxuICAgIGdyaWRbcm93XSA9IGFcclxuICAgIHJvdysrXHJcbiAgcmV0dXJuIGdyaWRcclxuXHJcbiMgQ3J1c2hlcyB0aGUgcHlyYW1pZCBmcm9tIGJvdHRvbSB1cC4gV2hlbiBpdCBpcyBhbGwgZG9uZSBjcnVzaGluZywgdGhlIHRvcCBvZiB0aGUgcHlyYW1pZCBpcyB0aGUgYW5zd2VyLlxyXG5tYXhpbXVtUGF0aFN1bSA9IChweXJhbWlkU3RyaW5nKSAtPlxyXG4gIHB5cmFtaWQgPSBzdHJpbmdUb1B5cmFtaWQocHlyYW1pZFN0cmluZylcclxuICBzdW0gPSAwXHJcbiAgcm93ID0gcHlyYW1pZC5sZW5ndGggLSAyXHJcbiAgd2hpbGUgcm93ID49IDBcclxuICAgIGZvciBpIGluIFswLi5yb3ddXHJcbiAgICAgIG1heEJlbG93ID0gTWF0aC5tYXgocHlyYW1pZFtyb3crMV1baV0sIHB5cmFtaWRbcm93KzFdW2krMV0pXHJcbiAgICAgIHB5cmFtaWRbcm93XVtpXSArPSBtYXhCZWxvd1xyXG4gICAgcm93LS1cclxuICByZXR1cm4gcHlyYW1pZFswXVswXVxyXG5cclxucHJvYmxlbS50ZXN0ID0gLT5cclxuICBlcXVhbChtYXhpbXVtUGF0aFN1bSh0ZXN0UHlyYW1pZCksIDIzLCBcIm1heGltdW0gcGF0aCBzdW0gb2YgdGVzdCB0cmlhbmdsZSBpcyAyM1wiKVxyXG5cclxucHJvYmxlbS5hbnN3ZXIgPSAtPlxyXG4gIGNvbnNvbGUubG9nIHdpbmRvdy5hcmdzXHJcbiAgcmV0dXJuIG1heGltdW1QYXRoU3VtKG1haW5QeXJhbWlkKVxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHByb2JsZW0gPSBuZXcgUHJvYmxlbSBcIlwiXCJcclxuXHJcblByb2JsZW0gMTk6IENvdW50aW5nIFN1bmRheXNcclxuLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuWW91IGFyZSBnaXZlbiB0aGUgZm9sbG93aW5nIGluZm9ybWF0aW9uLCBidXQgeW91IG1heSBwcmVmZXIgdG8gZG8gc29tZSByZXNlYXJjaCBmb3IgeW91cnNlbGYuXHJcblxyXG4qIDEgSmFuIDE5MDAgd2FzIGEgTW9uZGF5LlxyXG4qIFRoaXJ0eSBkYXlzIGhhcyBTZXB0ZW1iZXIsXHJcbiAgQXByaWwsIEp1bmUgYW5kIE5vdmVtYmVyLlxyXG4gIEFsbCB0aGUgcmVzdCBoYXZlIHRoaXJ0eS1vbmUsXHJcbiAgU2F2aW5nIEZlYnJ1YXJ5IGFsb25lLFxyXG4gIFdoaWNoIGhhcyB0d2VudHktZWlnaHQsIHJhaW4gb3Igc2hpbmUuXHJcbiAgQW5kIG9uIGxlYXAgeWVhcnMsIHR3ZW50eS1uaW5lLlxyXG4qIEEgbGVhcCB5ZWFyIG9jY3VycyBvbiBhbnkgeWVhciBldmVubHkgZGl2aXNpYmxlIGJ5IDQsIGJ1dCBub3Qgb24gYSBjZW50dXJ5IHVubGVzcyBpdCBpcyBkaXZpc2libGUgYnkgNDAwLlxyXG5cclxuSG93IG1hbnkgU3VuZGF5cyBmZWxsIG9uIHRoZSBmaXJzdCBvZiB0aGUgbW9udGggZHVyaW5nIHRoZSB0d2VudGlldGggY2VudHVyeSAoMSBKYW4gMTkwMSB0byAzMSBEZWMgMjAwMCk/XHJcblxyXG5cIlwiXCJcclxuXHJcbk9ORV9EQVlfSU5fTVMgPSA2MCAqIDYwICogMjQgKiAxMDAwXHJcblxyXG5kYXlOYW1lcyA9IFwiU3VuZGF5IE1vbmRheSBUdWVzZGF5IFdlZG5lc2RheSBUaHVyc2RheSBGcmlkYXkgU2F0dXJkYXlcIi5zcGxpdCgvXFxzKy8pXHJcblxyXG5kYXlBbmREYXRlID0gKHRpbWVzdGFtcCkgLT5cclxuICBkID0gbmV3IERhdGUodGltZXN0YW1wKVxyXG4gIHJldHVybiBbZC5nZXREYXkoKSwgZC5nZXREYXRlKCldXHJcblxyXG5kYXRlVG9UaW1lc3RhbXAgPSAoeWVhciwgbW9udGgsIGRheSkgLT5cclxuICByZXR1cm4gbmV3IERhdGUoeWVhciwgbW9udGgsIGRheSkuZ2V0VGltZSgpXHJcblxyXG5wcm9ibGVtLnRlc3QgPSAtPlxyXG4gIHRzID0gZGF0ZVRvVGltZXN0YW1wKDE5MDAsIDAsIDEpXHJcbiAgZXF1YWwoZGF5QW5kRGF0ZSh0cylbMF0sIDEsIFwiMTkwMC8xLzEgd2FzIGEgTW9uZGF5XCIpXHJcblxyXG4gIGZvciBkYXkgaW4gWzIuLjZdXHJcbiAgICB0cyArPSBPTkVfREFZX0lOX01TXHJcbiAgICBkZCA9IGRheUFuZERhdGUodHMpXHJcbiAgICBlcXVhbChkZFswXSwgZGF5LCBcInRoZSBmb2xsb3dpbmcgZGF5IHdhcyBhICN7ZGF5TmFtZXNbZGF5XX1cIilcclxuICAgIGVxdWFsKGRkWzFdLCBkYXksIFwiLi4uIGFuZCB0aGUgZGF0ZSB3YXMgMS8je2RkWzFdfVwiKVxyXG5cclxucHJvYmxlbS5hbnN3ZXIgPSAtPlxyXG4gIHRzID0gZGF0ZVRvVGltZXN0YW1wKDE5MDEsIDAsIDEpXHJcbiAgZW5kdHMgPSBkYXRlVG9UaW1lc3RhbXAoMjAwMCwgMTEsIDMxKVxyXG5cclxuICBzdW5kYXlDb3VudCA9IDBcclxuICB3aGlsZSB0cyA8IGVuZHRzXHJcbiAgICBkZCA9IGRheUFuZERhdGUodHMpXHJcbiAgICBpZiAoZGRbMF0gPT0gMCkgYW5kIChkZFsxXSA9PSAxKVxyXG4gICAgICBzdW5kYXlDb3VudCsrXHJcbiAgICB0cyArPSBPTkVfREFZX0lOX01TXHJcblxyXG4gIHJldHVybiBzdW5kYXlDb3VudFxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHByb2JsZW0gPSBuZXcgUHJvYmxlbSBcIlwiXCJcclxuXHJcblByb2JsZW0gMjA6IEZhY3RvcmlhbCBkaWdpdCBzdW1cclxuLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxubiEgbWVhbnMgbiB4IChuIOKIkiAxKSB4IC4uLiB4IDMgeCAyIHggMVxyXG5cclxuRm9yIGV4YW1wbGUsIDEwISA9IDEwIHggOSB4IC4uLiB4IDMgeCAyIHggMSA9IDM2Mjg4MDAsXHJcbmFuZCB0aGUgc3VtIG9mIHRoZSBkaWdpdHMgaW4gdGhlIG51bWJlciAxMCEgaXMgMyArIDYgKyAyICsgOCArIDggKyAwICsgMCA9IDI3LlxyXG5cclxuRmluZCB0aGUgc3VtIG9mIHRoZSBkaWdpdHMgaW4gdGhlIG51bWJlciAxMDAhXHJcblxyXG5cIlwiXCJcclxuXHJcbmJpZ0ludCA9IHJlcXVpcmUgXCJiaWctaW50ZWdlclwiXHJcblxyXG5odWdlRmFjdG9yaWFsID0gKG4pIC0+XHJcbiAgbnVtYmVyID0gYmlnSW50KDEpXHJcbiAgZm9yIGkgaW4gWzEuLm5dXHJcbiAgICBudW1iZXIgPSBudW1iZXIubXVsdGlwbHkgaVxyXG4gIHJldHVybiBudW1iZXJcclxuXHJcbnN1bU9mRGlnaXRzID0gKG4pIC0+XHJcbiAgZGlnaXRzID0gU3RyaW5nKG4pXHJcblxyXG4gIHN1bSA9IDBcclxuICBmb3IgZGlnaXQgaW4gZGlnaXRzXHJcbiAgICBzdW0gKz0gcGFyc2VJbnQoZGlnaXQpXHJcblxyXG4gIHJldHVybiBzdW1cclxuXHJcbnByb2JsZW0udGVzdCA9IC0+XHJcbiAgZXF1YWwoc3VtT2ZEaWdpdHMoaHVnZUZhY3RvcmlhbCgxMCkpLCAyNywgXCJzdW0gb2YgZmFjdG9yaWFsIGRpZ2l0cyBvZiAxMCEgaXMgMjdcIilcclxuXHJcbnByb2JsZW0uYW5zd2VyID0gLT5cclxuICByZXR1cm4gc3VtT2ZEaWdpdHMoaHVnZUZhY3RvcmlhbCgxMDApKVxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHByb2JsZW0gPSBuZXcgUHJvYmxlbSBcIlwiXCJcclxuXHJcblByb2JsZW0gMjE6IEFtaWNhYmxlIG51bWJlcnNcclxuLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuTGV0IGQobikgYmUgZGVmaW5lZCBhcyB0aGUgc3VtIG9mIHByb3BlciBkaXZpc29ycyBvZiBuIChudW1iZXJzIGxlc3MgdGhhbiBuIHdoaWNoIGRpdmlkZSBldmVubHkgaW50byBuKS5cclxuSWYgZChhKSA9IGIgYW5kIGQoYikgPSBhLCB3aGVyZSBhIOKJoCBiLCB0aGVuIGEgYW5kIGIgYXJlIGFuIGFtaWNhYmxlIHBhaXIgYW5kIGVhY2ggb2YgYSBhbmQgYiBhcmUgY2FsbGVkIGFtaWNhYmxlIG51bWJlcnMuXHJcblxyXG5Gb3IgZXhhbXBsZSwgdGhlIHByb3BlciBkaXZpc29ycyBvZiAyMjAgYXJlIDEsIDIsIDQsIDUsIDEwLCAxMSwgMjAsIDIyLCA0NCwgNTUgYW5kIDExMDsgdGhlcmVmb3JlIGQoMjIwKSA9IDI4NC4gVGhlIHByb3BlciBkaXZpc29ycyBvZiAyODQgYXJlIDEsIDIsIDQsIDcxIGFuZCAxNDI7IHNvIGQoMjg0KSA9IDIyMC5cclxuXHJcbkV2YWx1YXRlIHRoZSBzdW0gb2YgYWxsIHRoZSBhbWljYWJsZSBudW1iZXJzIHVuZGVyIDEwMDAwLlxyXG5cclxuXCJcIlwiXHJcblxyXG5tYXRoID0gcmVxdWlyZSBcIm1hdGhcIlxyXG5hbWljYWJsZUNhY2hlID0gbnVsbFxyXG5cclxuYW1pY2FibGVWYWx1ZSA9IChuKSAtPlxyXG4gIGlmIGFtaWNhYmxlQ2FjaGUuaGFzT3duUHJvcGVydHkobilcclxuICAgIHJldHVybiBhbWljYWJsZUNhY2hlW25dXHJcbiAgc3VtID0gMFxyXG4gIGZvciB2IGluIG1hdGguZGl2aXNvcnMobilcclxuICAgIHN1bSArPSB2XHJcbiAgYW1pY2FibGVDYWNoZVtuXSA9IHN1bVxyXG4gIHJldHVybiBzdW1cclxuXHJcbnByb2JsZW0udGVzdCA9IC0+XHJcbiAgYW1pY2FibGVDYWNoZSA9IHt9XHJcbiAgZXF1YWwoYW1pY2FibGVWYWx1ZSgyMjApLCAyODQsIFwiYW1pY2FibGUoMjIwKSA9PSAyODRcIilcclxuICBlcXVhbChhbWljYWJsZVZhbHVlKDI4NCksIDIyMCwgXCJhbWljYWJsZSgyODQpID09IDIyMFwiKVxyXG5cclxucHJvYmxlbS5hbnN3ZXIgPSAtPlxyXG4gIGFtaWNhYmxlQ2FjaGUgPSB7fVxyXG4gIGFtaWNhYmxlU2VlbiA9IHt9XHJcbiAgZm9yIGkgaW4gWzIuLi4xMDAwMF1cclxuICAgIGEgPSBhbWljYWJsZVZhbHVlKGkpXHJcbiAgICBiID0gYW1pY2FibGVWYWx1ZShhKVxyXG4gICAgaWYgKGEgIT0gYikgYW5kIChiID09IGkpXHJcbiAgICAgIGFtaWNhYmxlU2VlblthXSA9IHRydWVcclxuICAgICAgYW1pY2FibGVTZWVuW2JdID0gdHJ1ZVxyXG5cclxuICBhbWljYWJsZU51bWJlcnMgPSAocGFyc2VJbnQodikgZm9yIHYgaW4gT2JqZWN0LmtleXMoYW1pY2FibGVTZWVuKSlcclxuXHJcbiAgc3VtID0gMFxyXG4gIGZvciB2IGluIGFtaWNhYmxlTnVtYmVyc1xyXG4gICAgc3VtICs9IHZcclxuXHJcbiAgcmV0dXJuIHN1bVxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHByb2JsZW0gPSBuZXcgUHJvYmxlbSBcIlwiXCJcclxuXHJcblByb2JsZW0gMjI6IE5hbWVzIHNjb3Jlc1xyXG4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcblVzaW5nIG5hbWVzLnR4dCAocmlnaHQgY2xpY2sgYW5kICdTYXZlIExpbmsvVGFyZ2V0IEFzLi4uJyksIGEgNDZLIHRleHQgZmlsZSBjb250YWluaW5nIG92ZXIgZml2ZS10aG91c2FuZCBmaXJzdCBuYW1lcywgYmVnaW4gYnkgc29ydGluZyBpdCBpbnRvIGFscGhhYmV0aWNhbCBvcmRlci4gVGhlbiB3b3JraW5nIG91dCB0aGUgYWxwaGFiZXRpY2FsIHZhbHVlIGZvciBlYWNoIG5hbWUsIG11bHRpcGx5IHRoaXMgdmFsdWUgYnkgaXRzIGFscGhhYmV0aWNhbCBwb3NpdGlvbiBpbiB0aGUgbGlzdCB0byBvYnRhaW4gYSBuYW1lIHNjb3JlLlxyXG5cclxuRm9yIGV4YW1wbGUsIHdoZW4gdGhlIGxpc3QgaXMgc29ydGVkIGludG8gYWxwaGFiZXRpY2FsIG9yZGVyLCBDT0xJTiwgd2hpY2ggaXMgd29ydGggMyArIDE1ICsgMTIgKyA5ICsgMTQgPSA1MywgaXMgdGhlIDkzOHRoIG5hbWUgaW4gdGhlIGxpc3QuIFNvLCBDT0xJTiB3b3VsZCBvYnRhaW4gYSBzY29yZSBvZiA5Mzggw5cgNTMgPSA0OTcxNC5cclxuXHJcbldoYXQgaXMgdGhlIHRvdGFsIG9mIGFsbCB0aGUgbmFtZSBzY29yZXMgaW4gdGhlIGZpbGU/XHJcblxyXG5cIlwiXCJcclxuXHJcbmZzID0gcmVxdWlyZSBcImZzXCJcclxuXHJcbnJlYWROYW1lcyA9IC0+XHJcbiAgcmF3TmFtZXMgPSBTdHJpbmcoZnMucmVhZEZpbGVTeW5jKF9fZGlybmFtZSArIFwiLy4uL2RhdGEvbmFtZXMudHh0XCIpKVxyXG4gIG5hbWVzID0gcmF3TmFtZXMucmVwbGFjZSgvXCIvZ20sIFwiXCIpLnNwbGl0KFwiLFwiKVxyXG4gIHJldHVybiBuYW1lc1xyXG5cclxuYWxwaGFiZXRpY2FsVmFsdWUgPSAobmFtZSkgLT5cclxuICBzdW0gPSAwXHJcbiAgZm9yIGkgaW4gWzAuLi5uYW1lLmxlbmd0aF1cclxuICAgIHYgPSBuYW1lLmNoYXJDb2RlQXQoaSkgLSA2NCAjIEEgaXMgNjUgaW4gYXNjaWksIHNvIHRoaXMgbWFrZXMgdGhlIHZhbHVlIG9mICdBJyA9PSAxXHJcbiAgICBzdW0gKz0gdlxyXG4gIHJldHVybiBzdW1cclxuXHJcbnByb2JsZW0udGVzdCA9IC0+XHJcbiAgZXF1YWwoYWxwaGFiZXRpY2FsVmFsdWUoXCJDT0xJTlwiKSwgNTMsIFwiYWxwaGFiZXRpY2FsIHZhbHVlIGZvciBDT0xJTiBpcyA1M1wiKVxyXG5cclxucHJvYmxlbS5hbnN3ZXIgPSAtPlxyXG4gIG5hbWVzID0gcmVhZE5hbWVzKClcclxuICBuYW1lcy5zb3J0KClcclxuXHJcbiAgc3VtID0gMFxyXG4gIGZvciBuYW1lLCBpIGluIG5hbWVzXHJcbiAgICB2ID0gYWxwaGFiZXRpY2FsVmFsdWUobmFtZSkgKiAoaSArIDEpXHJcbiAgICBzdW0gKz0gdlxyXG4gIHJldHVybiBzdW1cclxuIiwibW9kdWxlLmV4cG9ydHMgPSBwcm9ibGVtID0gbmV3IFByb2JsZW0gXCJcIlwiXHJcblxyXG5Qcm9ibGVtIDIzOiBOb24tYWJ1bmRhbnQgc3Vtc1xyXG4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuQSBwZXJmZWN0IG51bWJlciBpcyBhIG51bWJlciBmb3Igd2hpY2ggdGhlIHN1bSBvZiBpdHMgcHJvcGVyIGRpdmlzb3JzIGlzIGV4YWN0bHkgZXF1YWwgdG8gdGhlIG51bWJlci4gRm9yIGV4YW1wbGUsIHRoZSBzdW0gb2YgdGhlIHByb3BlciBkaXZpc29ycyBvZiAyOCB3b3VsZCBiZSAxICsgMiArIDQgKyA3ICsgMTQgPSAyOCwgd2hpY2ggbWVhbnMgdGhhdCAyOCBpcyBhIHBlcmZlY3QgbnVtYmVyLlxyXG5cclxuQSBudW1iZXIgbiBpcyBjYWxsZWQgZGVmaWNpZW50IGlmIHRoZSBzdW0gb2YgaXRzIHByb3BlciBkaXZpc29ycyBpcyBsZXNzIHRoYW4gbiBhbmQgaXQgaXMgY2FsbGVkIGFidW5kYW50IGlmIHRoaXMgc3VtIGV4Y2VlZHMgbi5cclxuXHJcbkFzIDEyIGlzIHRoZSBzbWFsbGVzdCBhYnVuZGFudCBudW1iZXIsIDEgKyAyICsgMyArIDQgKyA2ID0gMTYsIHRoZSBzbWFsbGVzdCBudW1iZXIgdGhhdCBjYW4gYmUgd3JpdHRlbiBhcyB0aGUgc3VtIG9mIHR3byBhYnVuZGFudCBudW1iZXJzIGlzIDI0LiBCeSBtYXRoZW1hdGljYWwgYW5hbHlzaXMsIGl0IGNhbiBiZSBzaG93biB0aGF0IGFsbCBpbnRlZ2VycyBncmVhdGVyIHRoYW4gMjgxMjMgY2FuIGJlIHdyaXR0ZW4gYXMgdGhlIHN1bSBvZiB0d28gYWJ1bmRhbnQgbnVtYmVycy4gSG93ZXZlciwgdGhpcyB1cHBlciBsaW1pdCBjYW5ub3QgYmUgcmVkdWNlZCBhbnkgZnVydGhlciBieSBhbmFseXNpcyBldmVuIHRob3VnaCBpdCBpcyBrbm93biB0aGF0IHRoZSBncmVhdGVzdCBudW1iZXIgdGhhdCBjYW5ub3QgYmUgZXhwcmVzc2VkIGFzIHRoZSBzdW0gb2YgdHdvIGFidW5kYW50IG51bWJlcnMgaXMgbGVzcyB0aGFuIHRoaXMgbGltaXQuXHJcblxyXG5GaW5kIHRoZSBzdW0gb2YgYWxsIHRoZSBwb3NpdGl2ZSBpbnRlZ2VycyB3aGljaCBjYW5ub3QgYmUgd3JpdHRlbiBhcyB0aGUgc3VtIG9mIHR3byBhYnVuZGFudCBudW1iZXJzLlxyXG5cclxuXCJcIlwiXHJcblxyXG5tYXRoID0gcmVxdWlyZSBcIm1hdGhcIlxyXG5cclxuZGl2aXNvclN1bSA9IChuKSAtPlxyXG4gIHJldHVybiBtYXRoLnN1bShtYXRoLmRpdmlzb3JzKG4pKVxyXG5cclxuaXNBYnVuZGFudCA9IChuKSAtPlxyXG4gIHJldHVybiAoZGl2aXNvclN1bShuKSA+IG4pXHJcblxyXG5pc1BlcmZlY3QgPSAobikgLT5cclxuICByZXR1cm4gKGRpdmlzb3JTdW0obikgPT0gbilcclxuXHJcbmFidW5kYW50TGlzdCA9IC0+XHJcbiAgbGlzdCA9IFtdXHJcbiAgZm9yIG4gaW4gWzEuLjI4MTIzXVxyXG4gICAgaWYgaXNBYnVuZGFudChuKVxyXG4gICAgICBsaXN0LnB1c2ggblxyXG4gIHJldHVybiBsaXN0XHJcblxyXG5wcm9ibGVtLnRlc3QgPSAtPlxyXG4gIGVxdWFsKGlzUGVyZmVjdCgyOCksIHRydWUsIFwiMjggaXMgYSBwZXJmZWN0IG51bWJlclwiKVxyXG5cclxucHJvYmxlbS5hbnN3ZXIgPSAtPlxyXG4gIGxpc3QgPSBhYnVuZGFudExpc3QoKVxyXG4gIGNvbnNvbGUubG9nIGxpc3RcclxuICBzdW1PZkFidW5kYW50c1NlZW4gPSB7fVxyXG4gIGZvciBpIGluIGxpc3RcclxuICAgIGZvciBqIGluIGxpc3RcclxuICAgICAgc3VtT2ZBYnVuZGFudHNTZWVuWyBpICsgaiBdID0gdHJ1ZVxyXG5cclxuICBzdW0gPSAwXHJcbiAgZm9yIGkgaW4gWzEuLjI4MTIzXVxyXG4gICAgaWYgbm90IHN1bU9mQWJ1bmRhbnRzU2VlbltpXVxyXG4gICAgICBzdW0gKz0gaVxyXG5cclxuICByZXR1cm4gc3VtXHJcbiIsIm1vZHVsZS5leHBvcnRzID0gcHJvYmxlbSA9IG5ldyBQcm9ibGVtIFwiXCJcIlxyXG5cclxuUHJvYmxlbSAyNDogTGV4aWNvZ3JhcGhpYyBwZXJtdXRhdGlvbnNcclxuLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbkEgcGVybXV0YXRpb24gaXMgYW4gb3JkZXJlZCBhcnJhbmdlbWVudCBvZiBvYmplY3RzLiBGb3IgZXhhbXBsZSwgMzEyNCBpcyBvbmUgcG9zc2libGUgcGVybXV0YXRpb24gb2YgdGhlIGRpZ2l0cyAxLCAyLCAzIGFuZCA0LiBJZiBhbGwgb2YgdGhlIHBlcm11dGF0aW9ucyBhcmUgbGlzdGVkIG51bWVyaWNhbGx5IG9yIGFscGhhYmV0aWNhbGx5LCB3ZSBjYWxsIGl0IGxleGljb2dyYXBoaWMgb3JkZXIuIFRoZSBsZXhpY29ncmFwaGljIHBlcm11dGF0aW9ucyBvZiAwLCAxIGFuZCAyIGFyZTpcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAwMTIgICAwMjEgICAxMDIgICAxMjAgICAyMDEgICAyMTBcclxuXHJcbldoYXQgaXMgdGhlIG1pbGxpb250aCBsZXhpY29ncmFwaGljIHBlcm11dGF0aW9uIG9mIHRoZSBkaWdpdHMgMCwgMSwgMiwgMywgNCwgNSwgNiwgNywgOCBhbmQgOT9cclxuXHJcblwiXCJcIlxyXG5cclxuIyBUaGlzIGZ1bmN0aW9uIGlzIC13YXktIHRvbyBzbG93XHJcbnBlcm11dGUgPSAoY3VycmVudCwgc3JjLCBkc3QpIC0+XHJcbiAgZm9yIHYsaSBpbiBzcmNcclxuICAgIG5ld2N1cnJlbnQgPSBjdXJyZW50ICsgdlxyXG4gICAgaWYgc3JjLmxlbmd0aCA+IDFcclxuICAgICAgbGVmdG92ZXJzID0gc3JjLnNsaWNlKDApXHJcbiAgICAgIGxlZnRvdmVycy5zcGxpY2UoaSwgMSlcclxuICAgICAgcGVybXV0ZSBuZXdjdXJyZW50LCBsZWZ0b3ZlcnMsIGRzdFxyXG4gICAgZWxzZVxyXG4gICAgICBkc3QucHVzaCBuZXdjdXJyZW50XHJcblxyXG5sZXhQZXJtdXRlU2xvdyA9IChjaGFycykgLT5cclxuICBkc3QgPSBbXVxyXG4gIHBlcm11dGUoXCJcIiwgY2hhcnMuc3BsaXQoXCJcIiksIGRzdClcclxuICBkc3Quc29ydCgpXHJcbiAgcmV0dXJuIGRzdFxyXG5cclxuc3dhcCA9IChhcnIsIGEsIGIpIC0+XHJcbiAgdCA9IGFyclthXVxyXG4gIGFyclthXSA9IGFycltiXVxyXG4gIGFycltiXSA9IHRcclxuXHJcbiMgRG9uJ3QgYXNrIG1lLCBhc2sgRGlqa3N0cmEncyBBIERpc2NpcGxpbmUgb2YgUHJvZ3JhbW1pbmcsIHBhZ2UgNzFcclxuZGlqa3N0cmFQZXJtdXRlTmV4dCA9IChhcnIpIC0+XHJcbiAgaSA9IGFyci5sZW5ndGggLSAxXHJcbiAgd2hpbGUgYXJyW2ktMV0gPj0gYXJyW2ldXHJcbiAgICBpLS1cclxuXHJcbiAgaiA9IGFyci5sZW5ndGhcclxuICB3aGlsZSBhcnJbai0xXSA8PSBhcnJbaS0xXVxyXG4gICAgai0tXHJcblxyXG4gIHN3YXAgYXJyLCBpLTEsIGotMVxyXG5cclxuICBpKytcclxuICBqID0gYXJyLmxlbmd0aFxyXG4gIHdoaWxlIGkgPCBqXHJcbiAgICBzd2FwIGFyciwgaS0xLCBqLTFcclxuICAgIGkrK1xyXG4gICAgai0tXHJcblxyXG5sZXhQZXJtdXRlRmFzdCA9IChjaGFycywgd2hpY2gpIC0+XHJcbiAgYXJyID0gKHBhcnNlSW50KHYpIGZvciB2IGluIGNoYXJzKVxyXG4gIGZvciBpIGluIFsxLi4ud2hpY2hdXHJcbiAgICBkaWprc3RyYVBlcm11dGVOZXh0KGFycilcclxuICByZXR1cm4gYXJyLmpvaW4oXCJcIilcclxuXHJcbnByb2JsZW0udGVzdCA9IC0+XHJcbiAgZXF1YWwobGV4UGVybXV0ZUZhc3QoXCIwMTJcIiwgNCksIFwiMTIwXCIsIFwiNHRoIHBlcm11dGF0aW9uIG9mIDAxMiBpcyAxMjAsIGZhc3QgdmVyc2lvblwiKVxyXG4gIGVxdWFsKGxleFBlcm11dGVTbG93KFwiMDEyXCIpLCBcIjAxMiAwMjEgMTAyIDEyMCAyMDEgMjEwXCIuc3BsaXQoXCIgXCIpLCBcInBlcm11dGF0aW9uIG9mIDAxMiBpcyAwMTIgMDIxIDEwMiAxMjAgMjAxIDIxMCwgc2xvdyB2ZXJzaW9uXCIpXHJcblxyXG5wcm9ibGVtLmFuc3dlciA9IC0+XHJcbiAgcmV0dXJuIGxleFBlcm11dGVGYXN0KFwiMDEyMzQ1Njc4OVwiLCAxMDAwMDAwKVxyXG5cclxuICAjIHNsb3cgdmVyc2lvbiwgdG9vayB+MTMgc2Vjb25kcyBvbiBhIDIwMTQgTWFjYm9vayBQcm9cclxuICAjIGRzdCA9IGxleFBlcm11dGVTbG93KFwiMDEyMzQ1Njc4OVwiKVxyXG4gICMgcmV0dXJuIGRzdFs5OTk5OTldICMgWzBdIGlzIGZpcnN0LCB0aGVyZWZvcmUgWzk5OTk5OV0gaXMgMSwwMDAsMDAwdGhcclxuIiwibW9kdWxlLmV4cG9ydHMgPSBwcm9ibGVtID0gbmV3IFByb2JsZW0gXCJcIlwiXHJcblxyXG5Qcm9ibGVtIDI1OiAxMDAwLWRpZ2l0IEZpYm9uYWNjaSBudW1iZXJcclxuLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5UaGUgRmlib25hY2NpIHNlcXVlbmNlIGlzIGRlZmluZWQgYnkgdGhlIHJlY3VycmVuY2UgcmVsYXRpb246XHJcblxyXG5GKG4pID0gRihu4oiSMSkgKyBGKG7iiJIyKSwgd2hlcmUgRigxKSA9IDEgYW5kIEYoMikgPSAxLlxyXG5IZW5jZSB0aGUgZmlyc3QgMTIgdGVybXMgd2lsbCBiZTpcclxuXHJcbkYoMSkgID0gMVxyXG5GKDIpICA9IDFcclxuRigzKSAgPSAyXHJcbkYoNCkgID0gM1xyXG5GKDUpICA9IDVcclxuRig2KSAgPSA4XHJcbkYoNykgID0gMTNcclxuRig4KSAgPSAyMVxyXG5GKDkpICA9IDM0XHJcbkYoMTApID0gNTVcclxuRigxMSkgPSA4OVxyXG5GKDEyKSA9IDE0NFxyXG5UaGUgMTJ0aCB0ZXJtLCBGKDEyKSwgaXMgdGhlIGZpcnN0IHRlcm0gdG8gY29udGFpbiB0aHJlZSBkaWdpdHMuXHJcblxyXG5XaGF0IGlzIHRoZSBmaXJzdCB0ZXJtIGluIHRoZSBGaWJvbmFjY2kgc2VxdWVuY2UgdG8gY29udGFpbiAxMDAwIGRpZ2l0cz9cclxuXHJcblwiXCJcIlxyXG5cclxuYmlnSW50ID0gcmVxdWlyZSBcImJpZy1pbnRlZ2VyXCJcclxuXHJcbmZpcnN0Rmlib1dpdGhEaWdpdENvdW50ID0gKG4pIC0+XHJcbiAgaW5kZXggPSAxXHJcbiAgcHJldiA9IG5ldyBiaWdJbnQoMClcclxuICBjdXJyID0gbmV3IGJpZ0ludCgxKVxyXG4gIGxvb3BcclxuICAgIHN0ciA9IFN0cmluZyhjdXJyKVxyXG4gICAgZGlnaXRDb3VudCA9IHN0ci5sZW5ndGhcclxuICAgIGlmIGRpZ2l0Q291bnQgPj0gblxyXG4gICAgICByZXR1cm4gW2luZGV4LCBzdHJdXHJcbiAgICBuZXh0ID0gY3Vyci5wbHVzKHByZXYpXHJcbiAgICBwcmV2ID0gY3VyclxyXG4gICAgY3VyciA9IG5leHRcclxuICAgIGluZGV4KytcclxuXHJcbnByb2JsZW0udGVzdCA9IC0+XHJcbiAgZXF1YWwoZmlyc3RGaWJvV2l0aERpZ2l0Q291bnQoMyksIFsxMiwgXCIxNDRcIl0sIFwiZmlyc3QgZmlib25hY2NpIHdpdGggMyBkaWdpdHMgaXMgRigxMikgPSAxNDRcIilcclxuXHJcbnByb2JsZW0uYW5zd2VyID0gLT5cclxuICByZXR1cm4gZmlyc3RGaWJvV2l0aERpZ2l0Q291bnQoMTAwMClcclxuIiwibW9kdWxlLmV4cG9ydHMgPSBwcm9ibGVtID0gbmV3IFByb2JsZW0gXCJcIlwiXHJcblxyXG5Qcm9ibGVtIDI2OiBSZWNpcHJvY2FsIGN5Y2xlc1xyXG4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuQSB1bml0IGZyYWN0aW9uIGNvbnRhaW5zIDEgaW4gdGhlIG51bWVyYXRvci4gVGhlIGRlY2ltYWwgcmVwcmVzZW50YXRpb24gb2YgdGhlIHVuaXQgZnJhY3Rpb25zIHdpdGggZGVub21pbmF0b3JzIDIgdG8gMTAgYXJlIGdpdmVuOlxyXG5cclxuMS8yICAgPSAgIDAuNVxyXG4xLzMgICA9ICAgMC4oMylcclxuMS80ICAgPSAgIDAuMjVcclxuMS81ICAgPSAgIDAuMlxyXG4xLzYgICA9ICAgMC4xKDYpXHJcbjEvNyAgID0gICAwLigxNDI4NTcpXHJcbjEvOCAgID0gICAwLjEyNVxyXG4xLzkgICA9ICAgMC4oMSlcclxuMS8xMCAgPSAgIDAuMVxyXG5cclxuV2hlcmUgMC4xKDYpIG1lYW5zIDAuMTY2NjY2Li4uLCBhbmQgaGFzIGEgMS1kaWdpdCByZWN1cnJpbmcgY3ljbGUuIEl0IGNhbiBiZSBzZWVuIHRoYXQgMS83IGhhcyBhIDYtZGlnaXQgcmVjdXJyaW5nIGN5Y2xlLlxyXG5cclxuRmluZCB0aGUgdmFsdWUgb2YgZCA8IDEwMDAgZm9yIHdoaWNoIDEvZCBjb250YWlucyB0aGUgbG9uZ2VzdCByZWN1cnJpbmcgY3ljbGUgaW4gaXRzIGRlY2ltYWwgZnJhY3Rpb24gcGFydC5cclxuXHJcblwiXCJcIlxyXG5cclxuRGVjaW1hbCA9IHJlcXVpcmUgJ2RlY2ltYWwuanMnXHJcbkRlY2ltYWwucHJlY2lzaW9uID0gMTUwMCAjIG9vZlxyXG5cclxubG9vcHNBdCA9IChkaWdpdHMsIGZyb250LCBsZW4pIC0+XHJcbiAgZW5kSW5kZXggPSBkaWdpdHMubGVuZ3RoIC0gMSAtIGZyb250XHJcbiAgaWYgZW5kSW5kZXggPD0gbGVuXHJcbiAgICByZXR1cm4gZmFsc2VcclxuICBpZiBlbmRJbmRleCA+IDNcclxuICAgICMgdHJpbSByb3VuZGluZyBkaWdpdCwgaGF4XHJcbiAgICBlbmRJbmRleCAtPSAxXHJcbiAgZm9yIGkgaW4gWzAuLmVuZEluZGV4XVxyXG4gICAgaWYgZGlnaXRzLmNoYXJBdChmcm9udCArIGkpICE9IGRpZ2l0cy5jaGFyQXQoZnJvbnQgKyAoaSAlIGxlbikpXHJcbiAgICAgIHJldHVybiBmYWxzZVxyXG4gIHJldHVybiB0cnVlXHJcblxyXG4jIE5ldmVyIGxlYXZlIGEgdGV4dC1iYXNlZCB0b29scyBwcm9ncmFtbWVyIHRvIHNvbHZlIGEgbWF0aCBwcm9ibGVtXHJcbmZpbmRSZWN1cnJpbmdDeWNsZVNsb3cgPSAoZGVub21pbmF0b3IpIC0+XHJcbiAgZGlnaXRzID0gU3RyaW5nKG5ldyBEZWNpbWFsKDEpLmRpdmlkZWRCeShkZW5vbWluYXRvcikpXHJcbiAgZGlnaXRzID0gZGlnaXRzLnJlcGxhY2UoL14wLi8sIFwiXCIpXHJcbiAgZGlnaXRzTGVuID0gZGlnaXRzLmxlbmd0aFxyXG4gIGhhbGZEaWdpdHNMZW4gPSBkaWdpdHNMZW4gPj4gMVxyXG5cclxuICBjeWNsZSA9XHJcbiAgICBkZW5vbWluYXRvcjogZGVub21pbmF0b3JcclxuICAgIGZyb250OiAtMVxyXG4gICAgbGVuZ3RoOiAtMVxyXG4gICAgcHJldHR5OiBcIjAuI3tkaWdpdHN9XCJcclxuXHJcbiAgZm9yIGN5Y2xlRnJvbnQgaW4gWzAuLmhhbGZEaWdpdHNMZW5dXHJcbiAgICBpZiBjeWNsZS5sZW5ndGggIT0gLTFcclxuICAgICAgYnJlYWtcclxuICAgIGZvciBjeWNsZUxlbmd0aCBpbiBbMS4uaGFsZkRpZ2l0c0xlbisxXVxyXG4gICAgICBpZiBsb29wc0F0KGRpZ2l0cywgY3ljbGVGcm9udCwgY3ljbGVMZW5ndGgpXHJcbiAgICAgICAgY3ljbGUuZnJvbnQgPSBjeWNsZUZyb250XHJcbiAgICAgICAgY3ljbGUubGVuZ3RoID0gY3ljbGVMZW5ndGhcclxuICAgICAgICBjeWNsZS5yZXBlYXQgPSBkaWdpdHMuc3Vic3RyKGN5Y2xlRnJvbnQsIGN5Y2xlTGVuZ3RoKVxyXG4gICAgICAgIGN5Y2xlLnByZXR0eSA9IFwiMC4je2RpZ2l0cy5zdWJzdHIoMCwgY3ljbGVGcm9udCl9KCN7Y3ljbGUucmVwZWF0fSlcIlxyXG4gICAgICAgIGJyZWFrXHJcblxyXG4gIHJldHVybiBjeWNsZVxyXG5cclxuIyBUaGlzIGJlZ2FuIGxpZmUgYXMgc29tZW9uZSBlbHNlJ3MgZnJhY3Rpb25Ub0RlY2ltYWwoKSBQeXRob24gY29kZTsgbXkgaG9tZW1hZGUgdmVyc2lvbiBpcyB0aGUgc2xvdyBnYXJiYWdlIGFib3ZlXHJcbmZpbmRSZWN1cnJpbmdDeWNsZUZhc3QgPSAoZGVub21pbmF0b3IpIC0+XHJcbiAgbnVtZXJhdG9yID0gMVxyXG5cclxuICBudW0gPSBkZW5vbWluYXRvclxyXG4gIG51bTJGYWN0b3JzID0gMFxyXG4gIHdoaWxlIG51bSAlICgyICoqIChudW0yRmFjdG9ycyArIDEpKSA9PSAwXHJcbiAgICBudW0yRmFjdG9ycyArPSAxXHJcblxyXG4gIG51bTVGYWN0b3JzID0gMFxyXG4gIHdoaWxlIG51bSAlICg1ICoqIChudW01RmFjdG9ycyArIDEpKSA9PSAwXHJcbiAgICAgIG51bTVGYWN0b3JzICs9IDFcclxuICBub25SZWN1cnJpbmdDb3VudCA9IE1hdGgubWF4KG51bTJGYWN0b3JzLCBudW01RmFjdG9ycylcclxuXHJcbiAgbm9uUmVjdXJyaW5nUGFydCA9ICcnXHJcbiAgd2hpbGUgKG5vblJlY3VycmluZ0NvdW50ID4gMCkgYW5kIChudW1lcmF0b3IgPiAwKVxyXG4gICAgbnVtZXJhdG9yICo9IDEwXHJcbiAgICBub25SZWN1cnJpbmdQYXJ0ICs9IFN0cmluZyhNYXRoLmZsb29yKG51bWVyYXRvciAvIGRlbm9taW5hdG9yKSlcclxuICAgIG51bWVyYXRvciA9IG51bWVyYXRvciAlIGRlbm9taW5hdG9yXHJcbiAgICBub25SZWN1cnJpbmdDb3VudCAtPSAxXHJcblxyXG4gIGZpcnN0TnVtID0gbnVtZXJhdG9yXHJcbiAgcmVjdXJyaW5nUGFydCA9ICcnXHJcbiAgd2hpbGUgbnVtZXJhdG9yID4gMFxyXG4gICAgbnVtZXJhdG9yICo9IDEwXHJcbiAgICByZWN1cnJpbmdQYXJ0ICs9IFN0cmluZyhNYXRoLmZsb29yKG51bWVyYXRvciAvIGRlbm9taW5hdG9yKSlcclxuICAgIG51bWVyYXRvciAlPSBkZW5vbWluYXRvclxyXG4gICAgaWYgbnVtZXJhdG9yID09IGZpcnN0TnVtXHJcbiAgICAgIGJyZWFrXHJcblxyXG4gIHByZXR0eSA9IFwiMC4je25vblJlY3VycmluZ1BhcnR9XCJcclxuICBpZiByZWN1cnJpbmdQYXJ0Lmxlbmd0aCA+IDBcclxuICAgIHByZXR0eSArPSAnKCcgKyByZWN1cnJpbmdQYXJ0ICsgJyknXHJcblxyXG4gIGN5Y2xlID1cclxuICAgIGRlbm9taW5hdG9yOiBkZW5vbWluYXRvclxyXG4gICAgbGVuZ3RoOiByZWN1cnJpbmdQYXJ0Lmxlbmd0aFxyXG4gICAgcHJldHR5OiBwcmV0dHlcclxuICByZXR1cm4gY3ljbGVcclxuXHJcbmZpbmRSZWN1cnJpbmdDeWNsZSA9IGZpbmRSZWN1cnJpbmdDeWNsZUZhc3RcclxuXHJcbnByb2JsZW0udGVzdCA9IC0+XHJcbiAgY2VxdWFsKGZpbmRSZWN1cnJpbmdDeWNsZSgyKSwgIFwiIWMucHJldHR5IVwiLCBcIjAuNVwiLCBcIlJlY3VycmluZyBjeWNsZSBsZW5ndGggMS8yIDogIWMucHJldHR5IVwiKVxyXG4gIGNlcXVhbChmaW5kUmVjdXJyaW5nQ3ljbGUoMyksICBcIiFjLnByZXR0eSFcIiwgXCIwLigzKVwiLCBcIlJlY3VycmluZyBjeWNsZSBsZW5ndGggMS8zIDogIWMucHJldHR5IVwiKVxyXG4gIGNlcXVhbChmaW5kUmVjdXJyaW5nQ3ljbGUoNCksICBcIiFjLnByZXR0eSFcIiwgXCIwLjI1XCIsIFwiUmVjdXJyaW5nIGN5Y2xlIGxlbmd0aCAxLzQgOiAhYy5wcmV0dHkhXCIpXHJcbiAgY2VxdWFsKGZpbmRSZWN1cnJpbmdDeWNsZSg1KSwgIFwiIWMucHJldHR5IVwiLCBcIjAuMlwiLCBcIlJlY3VycmluZyBjeWNsZSBsZW5ndGggMS81IDogIWMucHJldHR5IVwiKVxyXG4gIGNlcXVhbChmaW5kUmVjdXJyaW5nQ3ljbGUoNiksICBcIiFjLnByZXR0eSFcIiwgXCIwLjEoNilcIiwgXCJSZWN1cnJpbmcgY3ljbGUgbGVuZ3RoIDEvNiA6ICFjLnByZXR0eSFcIilcclxuICBjZXF1YWwoZmluZFJlY3VycmluZ0N5Y2xlKDcpLCAgXCIhYy5wcmV0dHkhXCIsIFwiMC4oMTQyODU3KVwiLCBcIlJlY3VycmluZyBjeWNsZSBsZW5ndGggMS83IDogIWMucHJldHR5IVwiKVxyXG4gIGNlcXVhbChmaW5kUmVjdXJyaW5nQ3ljbGUoOCksICBcIiFjLnByZXR0eSFcIiwgXCIwLjEyNVwiLCBcIlJlY3VycmluZyBjeWNsZSBsZW5ndGggMS84IDogIWMucHJldHR5IVwiKVxyXG4gIGNlcXVhbChmaW5kUmVjdXJyaW5nQ3ljbGUoOSksICBcIiFjLnByZXR0eSFcIiwgXCIwLigxKVwiLCBcIlJlY3VycmluZyBjeWNsZSBsZW5ndGggMS85IDogIWMucHJldHR5IVwiKVxyXG4gIGNlcXVhbChmaW5kUmVjdXJyaW5nQ3ljbGUoMTApLCBcIiFjLnByZXR0eSFcIiwgXCIwLjFcIiwgXCJSZWN1cnJpbmcgY3ljbGUgbGVuZ3RoIDEvMTA6ICFjLnByZXR0eSFcIilcclxuXHJcbnByb2JsZW0uYW5zd2VyID0gLT5cclxuICBsYXJnZXN0Q3ljbGUgPSBudWxsXHJcbiAgbGFyZ2VzdExlbiA9IDBcclxuICBmb3IgdiBpbiBbMi4uLjEwMDBdXHJcbiAgICBjeWNsZSA9IGZpbmRSZWN1cnJpbmdDeWNsZSh2KVxyXG4gICAgaWYgbGFyZ2VzdExlbiA8IGN5Y2xlLmxlbmd0aFxyXG4gICAgICBsYXJnZXN0TGVuID0gY3ljbGUubGVuZ3RoXHJcbiAgICAgIGxhcmdlc3RDeWNsZSA9IGN5Y2xlXHJcbiAgcmV0dXJuIGxhcmdlc3RDeWNsZS5kZW5vbWluYXRvclxyXG4iLCJyb290ID0gZXhwb3J0cyA/IHRoaXNcclxuXHJcbiMgU2lldmUgd2FzIGJsaW5kbHkgdGFrZW4vYWRhcHRlZCBmcm9tIFJvc2V0dGFDb2RlLiBET05UIEVWRU4gQ0FSRVxyXG5jbGFzcyBJbmNyZW1lbnRhbFNpZXZlXHJcbiAgY29uc3RydWN0b3I6IC0+XHJcbiAgICBAbiA9IDBcclxuXHJcbiAgbmV4dDogLT5cclxuICAgIEBuICs9IDJcclxuICAgIGlmIEBuIDwgN1xyXG4gICAgICBpZiBAbiA8IDNcclxuICAgICAgICBAbiA9IDFcclxuICAgICAgICByZXR1cm4gMlxyXG4gICAgICBpZiBAbiA8IDVcclxuICAgICAgICByZXR1cm4gM1xyXG4gICAgICBAZGljdCA9IHt9XHJcbiAgICAgIEBicHMgPSBuZXcgSW5jcmVtZW50YWxTaWV2ZSgpXHJcbiAgICAgIEBicHMubmV4dCgpXHJcbiAgICAgIEBwID0gQGJwcy5uZXh0KClcclxuICAgICAgQHEgPSBAcCAqIEBwXHJcbiAgICAgIHJldHVybiA1XHJcbiAgICBlbHNlXHJcbiAgICAgIHMgPSBAZGljdFtAbl1cclxuICAgICAgaWYgbm90IHNcclxuICAgICAgICBpZiBAbiA8IEBxXHJcbiAgICAgICAgICByZXR1cm4gQG5cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICBwMiA9IEBwIDw8IDFcclxuICAgICAgICAgIEBkaWN0W0BuICsgcDJdID0gcDJcclxuICAgICAgICAgIEBwID0gQGJwcy5uZXh0KClcclxuICAgICAgICAgIEBxID0gQHAgKiBAcFxyXG4gICAgICAgICAgcmV0dXJuIEBuZXh0KClcclxuICAgICAgZWxzZVxyXG4gICAgICAgIGRlbGV0ZSBAZGljdFtAbl1cclxuICAgICAgICBueHQgPSBAbiArIHNcclxuICAgICAgICB3aGlsZSAoQGRpY3Rbbnh0XSlcclxuICAgICAgICAgIG54dCArPSBzXHJcbiAgICAgICAgQGRpY3Rbbnh0XSA9IHNcclxuICAgICAgICByZXR1cm4gQG5leHQoKVxyXG5cclxucm9vdC5JbmNyZW1lbnRhbFNpZXZlID0gSW5jcmVtZW50YWxTaWV2ZVxyXG5cclxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4jIFNoYW1lbGVzc2x5IHBpbGZlcmVkL2Fkb3B0ZWQgZnJvbSBodHRwOi8vd3d3LmphdmFzY3JpcHRlci5uZXQvZmFxL251bWJlcmlzcHJpbWUuaHRtXHJcblxyXG5yb290LmxlYXN0RmFjdG9yID0gKG4pIC0+XHJcbiAgcmV0dXJuIE5hTiBpZiBpc05hTihuKSBvciBub3QgaXNGaW5pdGUobilcclxuICByZXR1cm4gMCBpZiBuID09IDBcclxuICByZXR1cm4gMSBpZiAobiAlIDEpICE9IDAgb3IgKG4gKiBuKSA8IDJcclxuICByZXR1cm4gMiBpZiAobiAlIDIpID09IDBcclxuICByZXR1cm4gMyBpZiAobiAlIDMpID09IDBcclxuICByZXR1cm4gNSBpZiAobiAlIDUpID09IDBcclxuXHJcbiAgbSA9IE1hdGguc3FydCBuXHJcbiAgZm9yIGkgaW4gWzcuLm1dIGJ5IDMwXHJcbiAgICByZXR1cm4gaSAgICBpZiAobiAlIGkpICAgICAgPT0gMFxyXG4gICAgcmV0dXJuIGkrNCAgaWYgKG4gJSAoaSs0KSkgID09IDBcclxuICAgIHJldHVybiBpKzYgIGlmIChuICUgKGkrNikpICA9PSAwXHJcbiAgICByZXR1cm4gaSsxMCBpZiAobiAlIChpKzEwKSkgPT0gMFxyXG4gICAgcmV0dXJuIGkrMTIgaWYgKG4gJSAoaSsxMikpID09IDBcclxuICAgIHJldHVybiBpKzE2IGlmIChuICUgKGkrMTYpKSA9PSAwXHJcbiAgICByZXR1cm4gaSsyMiBpZiAobiAlIChpKzIyKSkgPT0gMFxyXG4gICAgcmV0dXJuIGkrMjQgaWYgKG4gJSAoaSsyNCkpID09IDBcclxuXHJcbiAgcmV0dXJuIG5cclxuXHJcbnJvb3QuaXNQcmltZSA9IChuKSAtPlxyXG4gIGlmIGlzTmFOKG4pIG9yIG5vdCBpc0Zpbml0ZShuKSBvciAobiAlIDEpICE9IDAgb3IgKG4gPCAyKVxyXG4gICAgcmV0dXJuIGZhbHNlXHJcbiAgaWYgbiA9PSByb290LmxlYXN0RmFjdG9yKG4pXHJcbiAgICByZXR1cm4gdHJ1ZVxyXG5cclxuICByZXR1cm4gZmFsc2VcclxuXHJcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbnJvb3QucHJpbWVGYWN0b3JzID0gKG4pIC0+XHJcbiAgcmV0dXJuIFsxXSBpZiBuID09IDFcclxuXHJcbiAgZmFjdG9ycyA9IFtdXHJcbiAgd2hpbGUgbm90IHJvb3QuaXNQcmltZShuKVxyXG4gICAgZmFjdG9yID0gcm9vdC5sZWFzdEZhY3RvcihuKVxyXG4gICAgZmFjdG9ycy5wdXNoIGZhY3RvclxyXG4gICAgbiAvPSBmYWN0b3JcclxuICBmYWN0b3JzLnB1c2ggblxyXG4gIHJldHVybiBmYWN0b3JzXHJcblxyXG4jIFRoaXMgZG9lcyBhIGJydXRlLWZvcmNlIGF0dGVtcHQgYXQgY29tYmluaW5nIGFsbCBvZiB0aGUgcHJpbWUgZmFjdG9ycyAoMl5uIGF0dGVtcHRzKS5cclxuIyBJJ20gc3VyZSB0aGVyZSBpcyBhIGNvb2xlciB3YXkuXHJcbnJvb3QuZGl2aXNvcnMgPSAobikgLT5cclxuICBwcmltZXMgPSByb290LnByaW1lRmFjdG9ycyhuKVxyXG4gIGNvbWJvc1RvVHJ5ID0gTWF0aC5wb3coMiwgcHJpbWVzLmxlbmd0aClcclxuICBmYWN0b3JzU2VlbiA9IHt9XHJcbiAgZm9yIGF0dGVtcHQgaW4gWzAuLi5jb21ib3NUb1RyeV1cclxuICAgIGZhY3RvciA9IDFcclxuICAgIGZvciB2LGkgaW4gcHJpbWVzXHJcbiAgICAgIGlmIChhdHRlbXB0ICYgKDEgPDwgaSkpXHJcbiAgICAgICAgZmFjdG9yICo9IHZcclxuICAgIGlmIGZhY3RvciA8IG5cclxuICAgICAgZmFjdG9yc1NlZW5bZmFjdG9yXSA9IHRydWVcclxuXHJcbiAgZGl2aXNvckxpc3QgPSAocGFyc2VJbnQodikgZm9yIHYgaW4gT2JqZWN0LmtleXMoZmFjdG9yc1NlZW4pKVxyXG4gIHJldHVybiBkaXZpc29yTGlzdFxyXG5cclxucm9vdC5zdW0gPSAobnVtYmVyQXJyYXkpIC0+XHJcbiAgc3VtID0gMFxyXG4gIGZvciBuIGluIG51bWJlckFycmF5XHJcbiAgICBzdW0gKz0gblxyXG4gIHJldHVybiBzdW1cclxuXHJcbnJvb3QuZmFjdG9yaWFsID0gKG4pIC0+XHJcbiAgZiA9IG5cclxuICB3aGlsZSBuID4gMVxyXG4gICAgbi0tXHJcbiAgICBmICo9IG5cclxuICByZXR1cm4gZlxyXG5cclxucm9vdC5uQ3IgPSAobiwgcikgLT5cclxuICByZXR1cm4gTWF0aC5mbG9vcihyb290LmZhY3RvcmlhbChuKSAvIChyb290LmZhY3RvcmlhbChyKSAqIHJvb3QuZmFjdG9yaWFsKG4gLSByKSkpXHJcbiIsIkxBU1RfUFJPQkxFTSA9IDI2XHJcblxyXG5yb290ID0gd2luZG93ICMgZXhwb3J0cyA/IHRoaXNcclxuXHJcbnJvb3QuZXNjYXBlZFN0cmluZ2lmeSA9IChvKSAtPlxyXG4gIHN0ciA9IEpTT04uc3RyaW5naWZ5KG8pXHJcbiAgc3RyID0gc3RyLnJlcGxhY2UoXCJdXCIsIFwiXFxcXF1cIilcclxuICByZXR1cm4gc3RyXHJcblxyXG5yb290LnJ1bkFsbCA9IC0+XHJcbiAgbGFzdFB1enpsZSA9IExBU1RfUFJPQkxFTVxyXG4gIG5leHRJbmRleCA9IDBcclxuXHJcbiAgbG9hZE5leHRTY3JpcHQgPSAtPlxyXG4gICAgaWYgbmV4dEluZGV4IDwgbGFzdFB1enpsZVxyXG4gICAgICBuZXh0SW5kZXgrK1xyXG4gICAgICBydW5UZXN0KG5leHRJbmRleCwgbG9hZE5leHRTY3JpcHQpXHJcbiAgbG9hZE5leHRTY3JpcHQoKVxyXG5cclxucm9vdC5pdGVyYXRlUHJvYmxlbXMgPSAoYXJncykgLT5cclxuXHJcbiAgaW5kZXhUb1Byb2Nlc3MgPSBudWxsXHJcbiAgaWYgYXJncy5lbmRJbmRleCA+IDBcclxuICAgIGlmIGFyZ3Muc3RhcnRJbmRleCA8PSBhcmdzLmVuZEluZGV4XHJcbiAgICAgIGluZGV4VG9Qcm9jZXNzID0gYXJncy5zdGFydEluZGV4XHJcbiAgICAgIGFyZ3Muc3RhcnRJbmRleCsrXHJcbiAgZWxzZVxyXG4gICAgaWYgYXJncy5saXN0Lmxlbmd0aCA+IDBcclxuICAgICAgaW5kZXhUb1Byb2Nlc3MgPSBhcmdzLmxpc3Quc2hpZnQoKVxyXG5cclxuICBpZiBpbmRleFRvUHJvY2VzcyAhPSBudWxsXHJcbiAgICBpdGVyYXRlTmV4dCA9IC0+XHJcbiAgICAgIHdpbmRvdy5hcmdzID0gYXJnc1xyXG4gICAgICBydW5UZXN0IGluZGV4VG9Qcm9jZXNzLCAtPlxyXG4gICAgICAgIGl0ZXJhdGVQcm9ibGVtcyhhcmdzKVxyXG4gICAgaXRlcmF0ZU5leHQoKVxyXG5cclxucm9vdC5ydW5UZXN0ID0gKGluZGV4LCBjYikgLT5cclxuICBtb2R1bGVOYW1lID0gXCJlI3soJzAwMCcraW5kZXgpLnNsaWNlKC0zKX1cIlxyXG4gIHdpbmRvdy5pbmRleCA9IGluZGV4XHJcbiAgcHJvYmxlbSA9IHJlcXVpcmUobW9kdWxlTmFtZSlcclxuICBwcm9ibGVtLnByb2Nlc3MoKVxyXG4gIHdpbmRvdy5zZXRUaW1lb3V0KGNiLCAwKSBpZiBjYlxyXG5cclxuY2xhc3MgUHJvYmxlbVxyXG4gIGNvbnN0cnVjdG9yOiAoQGRlc2NyaXB0aW9uKSAtPlxyXG4gICAgQGluZGV4ID0gd2luZG93LmluZGV4XHJcbiAgICBsaW5lcyA9IEBkZXNjcmlwdGlvbi5zcGxpdCgvXFxuLylcclxuICAgIGxpbmVzLnNoaWZ0KCkgd2hpbGUgbGluZXMubGVuZ3RoID4gMCBhbmQgbGluZXNbMF0ubGVuZ3RoID09IDBcclxuICAgIEB0aXRsZSA9IGxpbmVzLnNoaWZ0KClcclxuICAgIEBsaW5lID0gbGluZXMuc2hpZnQoKVxyXG4gICAgQGRlc2NyaXB0aW9uID0gbGluZXMuam9pbihcIlxcblwiKVxyXG5cclxuICBub3c6IC0+XHJcbiAgICByZXR1cm4gaWYgd2luZG93LnBlcmZvcm1hbmNlIHRoZW4gd2luZG93LnBlcmZvcm1hbmNlLm5vdygpIGVsc2UgbmV3IERhdGUoKS5nZXRUaW1lKClcclxuXHJcbiAgcHJvY2VzczogLT5cclxuICAgIGlmIHdpbmRvdy5hcmdzLmRlc2NyaXB0aW9uXHJcbiAgICAgIHdpbmRvdy50ZXJtaW5hbC5lY2hvIFwiW1s7IzQ0NDQ0NDtdX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19dXFxuXCJcclxuXHJcbiAgICBmb3JtYXR0ZWRUaXRsZSA9ICQudGVybWluYWwuZm9ybWF0KFwiW1s7I2ZmYWEwMDtdI3tAdGl0bGV9XVwiKVxyXG4gICAgdXJsID0gXCI/Yz0je3dpbmRvdy5hcmdzLmNtZH1fI3tAaW5kZXh9XCJcclxuICAgIGlmIHdpbmRvdy5hcmdzLnZlcmJvc2VcclxuICAgICAgdXJsICs9IFwiX3ZcIlxyXG4gICAgd2luZG93LnRlcm1pbmFsLmVjaG8gXCI8YSBocmVmPVxcXCIje3VybH1cXFwiPiN7Zm9ybWF0dGVkVGl0bGV9PC9hPlwiLCB7IHJhdzogdHJ1ZSB9XHJcblxyXG4gICAgaWYgd2luZG93LmFyZ3MuZGVzY3JpcHRpb25cclxuICAgICAgd2luZG93LnRlcm1pbmFsLmVjaG8gXCJbWzsjNDQ0NDQ0O10je0BsaW5lfV1cIlxyXG4gICAgICB3aW5kb3cudGVybWluYWwuZWNobyBcIltbOyNjY2NjZWU7XSN7QGRlc2NyaXB0aW9ufV1cXG5cIlxyXG4gICAgICBzb3VyY2VMaW5lID0gJC50ZXJtaW5hbC5mb3JtYXQoXCJbWzsjNDQ0NDQ0O11Tb3VyY2U6XSBcIilcclxuICAgICAgc291cmNlTGluZSArPSBcIiA8YSBocmVmPVxcXCJzcmMvZSN7KCcwMDAnK0BpbmRleCkuc2xpY2UoLTMpfS5jb2ZmZWVcXFwiPlwiICsgJC50ZXJtaW5hbC5mb3JtYXQoXCJbWzsjNzczMzAwO11Mb2NhbF1cIikgKyBcIjwvYT4gXCJcclxuICAgICAgc291cmNlTGluZSArPSAkLnRlcm1pbmFsLmZvcm1hdChcIltbOyM0NDQ0NDQ7XS9dXCIpXHJcbiAgICAgIHNvdXJjZUxpbmUgKz0gXCIgPGEgaHJlZj1cXFwiaHR0cHM6Ly9naXRodWIuY29tL2pvZWRyYWdvL2V1bGVyL2Jsb2IvbWFzdGVyL3NyYy9lI3soJzAwMCcrQGluZGV4KS5zbGljZSgtMyl9LmNvZmZlZVxcXCI+XCIgKyAkLnRlcm1pbmFsLmZvcm1hdChcIltbOyM3NzMzMDA7XUdpdGh1Yl1cIikgKyBcIjwvYT5cIlxyXG4gICAgICB3aW5kb3cudGVybWluYWwuZWNobyBzb3VyY2VMaW5lLCB7IHJhdzogdHJ1ZSB9XHJcbiAgICAgIGlmIHdpbmRvdy5hcmdzLnRlc3Qgb3Igd2luZG93LmFyZ3MuYW5zd2VyXHJcbiAgICAgICAgd2luZG93LnRlcm1pbmFsLmVjaG8gXCJcIlxyXG5cclxuICAgIHRlc3RGdW5jID0gQHRlc3RcclxuICAgIGFuc3dlckZ1bmMgPSBAYW5zd2VyXHJcblxyXG4gICAgaWYgd2luZG93LmFyZ3MudGVzdFxyXG4gICAgICBpZiB0ZXN0RnVuYyA9PSB1bmRlZmluZWRcclxuICAgICAgICB3aW5kb3cudGVybWluYWwuZWNobyBcIltbOyM0NDQ0NDQ7XSAobm8gdGVzdHMpXVwiXHJcbiAgICAgIGVsc2VcclxuICAgICAgICB0ZXN0RnVuYygpXHJcblxyXG4gICAgaWYgd2luZG93LmFyZ3MuYW5zd2VyXHJcbiAgICAgIHN0YXJ0ID0gQG5vdygpXHJcbiAgICAgIGFuc3dlciA9IGFuc3dlckZ1bmMoKVxyXG4gICAgICBlbmQgPSBAbm93KClcclxuICAgICAgbXMgPSBlbmQgLSBzdGFydFxyXG4gICAgICB3aW5kb3cudGVybWluYWwuZWNobyBcIltbOyNmZmZmZmY7XSAtPiBdW1s7I2FhZmZhYTtdQW5zd2VyOl0gKFtbOyNhYWZmZmY7XSN7bXMudG9GaXhlZCgxKX1tc10pOiBbWzsjZmZmZmZmO10je2VzY2FwZWRTdHJpbmdpZnkoYW5zd2VyKX1dXCJcclxuXHJcbnJvb3QuUHJvYmxlbSA9IFByb2JsZW1cclxuXHJcbnJvb3Qub2sgPSAodiwgbXNnKSAtPlxyXG4gIHdpbmRvdy50ZXJtaW5hbC5lY2hvIFwiW1s7I2ZmZmZmZjtdICogIF0je3Z9OiAje21zZ31cIlxyXG5cclxuIyBodHRwczovL2NvZmZlZXNjcmlwdC1jb29rYm9vay5naXRodWIuaW8vY2hhcHRlcnMvY2xhc3Nlc19hbmRfb2JqZWN0cy90eXBlLWZ1bmN0aW9uXHJcbnR5cGUgPSAob2JqKSAtPlxyXG4gIGlmIG9iaiA9PSB1bmRlZmluZWQgb3Igb2JqID09IG51bGxcclxuICAgIHJldHVybiBTdHJpbmcgb2JqXHJcbiAgY2xhc3NUb1R5cGUgPSB7XHJcbiAgICAnW29iamVjdCBCb29sZWFuXSc6ICdib29sZWFuJyxcclxuICAgICdbb2JqZWN0IE51bWJlcl0nOiAnbnVtYmVyJyxcclxuICAgICdbb2JqZWN0IFN0cmluZ10nOiAnc3RyaW5nJyxcclxuICAgICdbb2JqZWN0IEZ1bmN0aW9uXSc6ICdmdW5jdGlvbicsXHJcbiAgICAnW29iamVjdCBBcnJheV0nOiAnYXJyYXknLFxyXG4gICAgJ1tvYmplY3QgRGF0ZV0nOiAnZGF0ZScsXHJcbiAgICAnW29iamVjdCBSZWdFeHBdJzogJ3JlZ2V4cCcsXHJcbiAgICAnW29iamVjdCBPYmplY3RdJzogJ29iamVjdCdcclxuICB9XHJcbiAgcmV0dXJuIGNsYXNzVG9UeXBlW09iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopXVxyXG5cclxuaW50ZXJwID0gKG1zZywgYSwgYiwgYykgLT5cclxuICBtc2cgPSBtc2cucmVwbGFjZSAvIShbXiFdKykhL2csICh3aG9sZU1hdGNoLCBsb29rdXApIC0+XHJcbiAgICB2ID0gYVxyXG4gICAgdmtleSA9IG51bGxcclxuICAgIGlmIG0gPSBsb29rdXAubWF0Y2goLyhbXlxcLl0rKVxcLihbXlxcLl0rKS8pXHJcbiAgICAgIGlmIG1bMV0gPT0gJ2InXHJcbiAgICAgICAgdiA9IGJcclxuICAgICAgaWYgbVsxXSA9PSAnYydcclxuICAgICAgICB2ID0gY1xyXG4gICAgICB2ID0gdlttWzJdXVxyXG4gICAgZWxzZVxyXG4gICAgICBpZiBsb29rdXAgPT0gJ2InXHJcbiAgICAgICAgdiA9IGJcclxuICAgICAgaWYgbG9va3VwID09ICdjJ1xyXG4gICAgICAgIHYgPSBjXHJcbiAgICBzd2l0Y2ggdHlwZSh2KVxyXG4gICAgICB3aGVuICdvYmplY3QnLCAnYXJyYXknXHJcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHYpXHJcbiAgICByZXR1cm4gU3RyaW5nKHYpXHJcbiAgcmV0dXJuIG1zZ1xyXG5cclxucm9vdC5jZXF1YWwgPSAoY2FsYywgYSwgYiwgbXNnKSAtPlxyXG4gIGlmIGNhbGMgIT0gbnVsbFxyXG4gICAgYSA9IGludGVycChhLCBjYWxjLCBjYWxjLCBjYWxjKVxyXG5cclxuICBpZiAkLmlzQXJyYXkoYSkgYW5kICQuaXNBcnJheShiKVxyXG4gICAgaXNFcXVhbCA9IChhLmxlbmd0aCA9PSBiLmxlbmd0aClcclxuICAgIGlmIGlzRXF1YWxcclxuICAgICAgZm9yIGkgaW4gWzAuLi5hLmxlbmd0aF1cclxuICAgICAgICBpZiBTdHJpbmcoYVtpXSkgIT0gU3RyaW5nKGJbaV0pXHJcbiAgICAgICAgICBpc0VxdWFsID0gZmFsc2VcclxuICAgICAgICAgIGJyZWFrXHJcbiAgZWxzZVxyXG4gICAgaXNFcXVhbCA9IChTdHJpbmcoYSkgPT0gU3RyaW5nKGIpKVxyXG5cclxuICBtc2cgPSBpbnRlcnAobXNnLCBhLCBiLCBjYWxjKVxyXG5cclxuICBpZiBpc0VxdWFsXHJcbiAgICB3aW5kb3cudGVybWluYWwuZWNobyBcIltbOyNmZmZmZmY7XSAqICBdW1s7IzU1NTU1NTtdUEFTUzogI3ttc2d9XVwiXHJcbiAgZWxzZVxyXG4gICAgd2luZG93LnRlcm1pbmFsLmVjaG8gXCJbWzsjZmZmZmZmO10gKiAgXVtbOyNmZmFhYWE7XUZBSUw6ICN7bXNnfSAoI3thfSAhPSAje2J9KV1cIlxyXG5cclxucm9vdC5lcXVhbCA9IChhLCBiLCBtc2cpIC0+XHJcbiAgcmV0dXJuIHJvb3QuY2VxdWFsKG51bGwsIGEsIGIsIG1zZylcclxuXHJcbnJvb3Qub25Db21tYW5kID0gKGNvbW1hbmQpID0+XHJcbiAgcmV0dXJuIGlmIGNvbW1hbmQubGVuZ3RoID09IDBcclxuICBjbWQgPSAkLnRlcm1pbmFsLnBhcnNlQ29tbWFuZChjb21tYW5kKVxyXG4gIHJldHVybiBpZiBjbWQubmFtZS5sZW5ndGggPT0gMFxyXG5cclxuICBhcmdzID1cclxuICAgIHN0YXJ0SW5kZXg6IDBcclxuICAgIGVuZEluZGV4OiAwXHJcbiAgICBsaXN0OiBbXVxyXG4gICAgdmVyYm9zZTogZmFsc2VcclxuICAgIGRlc2NyaXB0aW9uOiBmYWxzZVxyXG4gICAgdGVzdDogZmFsc2VcclxuICAgIGFuc3dlcjogZmFsc2VcclxuXHJcbiAgcHJvY2VzcyA9IHRydWVcclxuXHJcbiAgZm9yIGFyZyBpbiBjbWQuYXJnc1xyXG4gICAgYXJnID0gU3RyaW5nKGFyZylcclxuICAgIGNvbnRpbnVlIGlmIGFyZy5sZW5ndGggPCAxXHJcbiAgICBpZiBhcmdbMF0gPT0gJ3YnXHJcbiAgICAgIGFyZ3MudmVyYm9zZSA9IHRydWVcclxuICAgIGVsc2UgaWYgYXJnLm1hdGNoKC9eXFxkKyQvKVxyXG4gICAgICB2ID0gcGFyc2VJbnQoYXJnKVxyXG4gICAgICBpZiAodiA+PSAxKSBhbmQgKHYgPD0gTEFTVF9QUk9CTEVNKVxyXG4gICAgICAgIGFyZ3MubGlzdC5wdXNoKHYpXHJcbiAgICAgIGVsc2VcclxuICAgICAgICBwcm9jZXNzID0gZmFsc2VcclxuICAgICAgICB3aW5kb3cudGVybWluYWwuZWNobyBcIltbOyNmZmFhYWE7XU5vIHN1Y2ggdGVzdDogI3t2fSAodmFsaWQgdGVzdHMgMS0je0xBU1RfUFJPQkxFTX0pXVwiXHJcblxyXG4gIGlmIGFyZ3MubGlzdC5sZW5ndGggPT0gMFxyXG4gICAgYXJncy5zdGFydEluZGV4ID0gMVxyXG4gICAgYXJncy5lbmRJbmRleCA9IExBU1RfUFJPQkxFTVxyXG5cclxuICAjIFNpbmNlIGFsbCBvZiBvdXIgY29tbWFuZHMgaGFwcGVuIHRvIGhhdmUgdW5pcXVlIGZpcnN0IGxldHRlcnMsIGxldCBwZW9wbGUgYmUgc3VwZXIgbGF6eS9zaWxseVxyXG4gIGlmIGNtZC5uYW1lWzBdID09ICdsJ1xyXG4gICAgYXJncy5jbWQgPSBcImxpc3RcIlxyXG4gIGVsc2UgaWYgY21kLm5hbWVbMF0gPT0gJ2QnXHJcbiAgICBhcmdzLmNtZCA9IFwiZGVzY3JpYmVcIlxyXG4gICAgYXJncy5kZXNjcmlwdGlvbiA9IHRydWVcclxuICBlbHNlIGlmIGNtZC5uYW1lWzBdID09ICd0J1xyXG4gICAgYXJncy5jbWQgPSBcInRlc3RcIlxyXG4gICAgYXJncy50ZXN0ID0gdHJ1ZVxyXG4gIGVsc2UgaWYgY21kLm5hbWVbMF0gPT0gJ2EnXHJcbiAgICBhcmdzLmNtZCA9IFwiYW5zd2VyXCJcclxuICAgIGFyZ3MuYW5zd2VyID0gdHJ1ZVxyXG4gIGVsc2UgaWYgY21kLm5hbWVbMF0gPT0gJ3InXHJcbiAgICBhcmdzLmNtZCA9IFwicnVuXCJcclxuICAgIGFyZ3MudGVzdCA9IHRydWVcclxuICAgIGFyZ3MuYW5zd2VyID0gdHJ1ZVxyXG4gIGVsc2UgaWYgY21kLm5hbWVbMF0gPT0gJ3MnXHJcbiAgICBhcmdzLmNtZCA9IFwic2hvd1wiXHJcbiAgICBhcmdzLnRlc3QgPSB0cnVlXHJcbiAgICBhcmdzLmFuc3dlciA9IHRydWVcclxuICAgIGFyZ3MuZGVzY3JpcHRpb24gPSB0cnVlXHJcbiAgZWxzZSBpZiBjbWQubmFtZVswXSA9PSAnZCdcclxuICAgIGFyZ3MuY21kID0gXCJkZXNjcmliZVwiXHJcbiAgICBhcmdzLmRlc2NyaXB0aW9uID0gdHJ1ZVxyXG4gIGVsc2UgaWYgY21kLm5hbWVbMF0gPT0gJ2gnXHJcbiAgICBhcmdzLmNtZCA9IFwiaGVscFwiXHJcbiAgICBwcm9jZXNzID0gZmFsc2VcclxuICAgIHdpbmRvdy50ZXJtaW5hbC5lY2hvIFwiXCJcIlxyXG4gICAgQ29tbWFuZHM6XHJcblxyXG4gICAgICAgIGxpc3QgW1hdICAgICAtIExpc3QgcHJvYmxlbSB0aXRsZXNcclxuICAgICAgICBkZXNjcmliZSBbWF0gLSBEaXNwbGF5IGZ1bGwgcHJvYmxlbSBkZXNjcmlwdGlvbnNcclxuICAgICAgICB0ZXN0IFtYXSAgICAgLSBSdW4gdW5pdCB0ZXN0c1xyXG4gICAgICAgIGFuc3dlciBbWF0gICAtIFRpbWUgYW5kIGNhbGN1bGF0ZSBhbnN3ZXJcclxuICAgICAgICBydW4gW1hdICAgICAgLSB0ZXN0IGFuZCBhbnN3ZXIgY29tYmluZWRcclxuICAgICAgICBzaG93IFtYXSAgICAgLSBkZXNjcmliZSwgdGVzdCwgYW5kIGFuc3dlciBjb21iaW5lZFxyXG4gICAgICAgIGhlbHAgICAgICAgICAtIFRoaXMgaGVscFxyXG5cclxuICAgICAgICBJbiBhbGwgb2YgdGhlc2UsIFtYXSBjYW4gYmUgYSBsaXN0IG9mIG9uZSBvciBtb3JlIHByb2JsZW0gbnVtYmVycy4gKGEgdmFsdWUgZnJvbSAxIHRvICN7TEFTVF9QUk9CTEVNfSkuIElmIGFic2VudCwgaXQgaW1wbGllcyBhbGwgcHJvYmxlbXMuXHJcbiAgICAgICAgQWxzbywgYWRkaW5nIHRoZSB3b3JkIFwidmVyYm9zZVwiIHRvIHNvbWUgb2YgdGhlc2UgY29tbWFuZHMgd2lsbCBlbWl0IHRoZSBkZXNjcmlwdGlvbiBiZWZvcmUgcGVyZm9ybWluZyB0aGUgdGFzay5cclxuXHJcbiAgICBcIlwiXCJcclxuICBlbHNlXHJcbiAgICBwcm9jZXNzID0gZmFsc2VcclxuICAgIHdpbmRvdy50ZXJtaW5hbC5lY2hvIFwiW1s7I2ZmYWFhYTtdVW5rbm93biBjb21tYW5kLl1cIlxyXG5cclxuICBpZiBhcmdzLnZlcmJvc2VcclxuICAgIGFyZ3MuZGVzY3JpcHRpb24gPSB0cnVlXHJcblxyXG4gIGlmIHByb2Nlc3NcclxuICAgIGl0ZXJhdGVQcm9ibGVtcyhhcmdzKVxyXG4iXX0=
