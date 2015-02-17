/* global expect */
/* jshint node: true */

(function ()
{
    'use strict';
    
    function compareFactors(factors1, factors2)
    {
        var result;
        if (factors1 === factors2)
        {
            result = true;
        }
        else
        {
            var keys1 = Object.getOwnPropertyNames(factors1).sort();
            var keys2 = Object.getOwnPropertyNames(factors2).sort();
            if (keys1.length !== keys2.length)
            {
                result = false;
            }
            else
            {
                result =
                    keys1.every(
                        function (factor) { return factors1[factor] === factors2[factor]; }
                    );
            }
        }
        return result;
    }
    
    var MATCHERS =
    {
        toBeCloseTo: function (expected, precision)
        {
            if (precision !== 0)
            {
                precision = precision || 2;
            }
            
            var actual = this.value;
            var message = this.generateMessage(actual, this.expr, 'to be close to ' + expected);
            var pass = Math.abs(expected - actual) < (Math.pow(10, -precision) / 2);
            if (pass)
            {
                return this.assertions.pass(message);
            }
            this.assertions.fail(message);
        },
        toBeQ: function (expected)
        {
            var message;
            var actual = this.value;
            if (!(actual instanceof Q))
            {
                message = 'Expected an instance of Q';
                return this.assertions.fail(message);
            }
            if (Object.keys(actual).length)
            {
                message = 'Unexpected enumerable properties set';
                return this.assertions.fail(message);
            }
            if (!('_factors' in actual))
            {
                message = 'Expected factors property not set';
                return this.assertions.fail(message);
            }
            var sign = actual._sign;
            var factors = actual._factors;
            if (Object.is(sign, 0))
            {
                if (factors !== void 0)
                {
                    message = 'Expected factors to be undefined, but was ' + factors;
                    return this.assertions.fail(message);
                }
            }
            else if (sign === 1 || sign === -1)
            {
                if (Object.prototype.toString.call(factors) !== '[object Object]')
                {
                    message = 'Expected factors property to be an object, but was ' + factors;
                    return this.assertions.fail(message);
                }
                if (1 in factors)
                {
                    message = 'Found unexpected factor 1';
                    return this.assertions.fail(message);
                }
            }
            else
            {
                message = 'Expected sign to be 0, 1, or -1, but was ' + sign;
                return this.assertions.fail(message);
            }
            if (expected != null)
            {
                var expectedQ = typeof expected === 'number' ? Q(expected) : expected;
                if (
                    sign !== expectedQ._sign ||
                    expectedQ._factors && !compareFactors(factors, expectedQ._factors))
                {
                    message =
                        'Expected ' + (typeof expected === 'number' ? expected : 'a different Q');
                    return this.assertions.fail(message);
                }
            }
            this.assertions.pass(message);
        },
        toBeString: function ()
        {
            var actual = this.value;
            var message = this.generateMessage(actual, this.expr, 'to be a string');
            var pass = typeof actual === 'string';
            if (pass)
            {
                return this.assertions.pass(message);
            }
            this.assertions.fail(message);
        }
    };
    
    var Q;
    
    Object.keys(MATCHERS).forEach(
        function (name)
        {
            var matcher = MATCHERS[name];
            expect.addAssertion(name, matcher);
        }
    );
    
    module.exports = function (arg) { Q = arg; };
})();
