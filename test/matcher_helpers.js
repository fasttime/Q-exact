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
    
    function printFactors(factors)
    {
        var result =
            '{ ' +
            Object.keys(factors).sort(
                function (factor1, factor2) { return factor1 - factor2; }
            ).map(
                function (factor)
                {
                    var exp = factors[factor];
                    var factorString = factor + ': ' + exp;
                    return factorString;
                }
            ).join(', ') +
            ' }';
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
            var message = this.generateMessage(actual, this.expr, 'to be close to', expected);
            var pass = Math.abs(expected - actual) < Math.pow(10, -precision) / 2;
            this.assertions[pass ? 'pass' : 'fail'](message);
        },
        toBeQ: function (expected)
        {
            var message;
            var actual = this.value;
            if (!(actual instanceof Q))
            {
                message = 'Expected an instance of Q';
                this.assertions.fail(message);
            }
            if (Object.keys(actual).length)
            {
                message = 'Unexpected enumerable properties set';
                this.assertions.fail(message);
            }
            if (!('_factors' in actual))
            {
                message = 'Expected factors property not set';
                this.assertions.fail(message);
            }
            var sign = actual._sign;
            var factors = actual._factors;
            if (Object.is(sign, 0))
            {
                if (factors !== void 0)
                {
                    message = 'Expected factors to be undefined, but was ' + factors;
                    this.assertions.fail(message);
                }
            }
            else if (sign === 1 || sign === -1)
            {
                if (Object.prototype.toString.call(factors) !== '[object Object]')
                {
                    message = 'Expected factors property to be an object, but was ' + factors;
                    this.assertions.fail(message);
                }
                if (1 in factors)
                {
                    message = 'Found unexpected factor 1';
                    this.assertions.fail(message);
                }
            }
            else
            {
                message = 'Expected sign to be 0, 1, or -1, but was ' + sign;
                this.assertions.fail(message);
            }
            if (expected != null)
            {
                var expectedQ = typeof expected === 'number' ? Q(expected) : expected;
                var expectedSign = expectedQ._sign;
                if (sign !== expectedSign)
                {
                    message = 'Expected sign to be ' + expectedSign + ', but was ' + sign;
                    this.assertions.fail(message);
                }
                var expectedFactors = expectedQ._factors;
                if (expectedFactors && !compareFactors(factors, expectedFactors))
                {
                    message =
                        'Expected factors to be ' + printFactors(expectedFactors) + ', but was ' +
                        printFactors(factors);
                    this.assertions.fail(message);
                }
            }
            this.assertions.pass(message);
        },
        toBeString: function ()
        {
            var actual = this.value;
            var message = this.generateMessage(actual, this.expr, 'to be a string');
            var pass = typeof actual === 'string';
            this.assertions[pass ? 'pass' : 'fail'](message);
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
