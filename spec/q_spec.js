/* global beforeEach, describe, expect, it */

'use strict';

var Q = require('../lib/q');

var ArithmeticOverflowError = new Error('Arithmetic overflow');
var InvalidArgumentError = new Error('Invalid argument');
var NoRationalResultError = new Error('No rational result');

var ERR_NR = { };
var ERR_AO = { };

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
                keys1.every(function (factor) { return factors1[factor] === factors2[factor]; });
        }
    }
    return result;
}

function createTestCall(operationName, symmetric, asQ)
{
    function test(description, op1, op2, expected)
    {
        var testCase;
        
        if (expected === ERR_NR)
        {
            if (symmetric && op1 !== op2)
            {
                testCase =
                    function ()
                    {
                        expect(function () { Q[operationName](op1, op2); }).toThrow(
                            NoRationalResultError
                        );
                        expect(function () { Q[operationName](op2, op1); }).toThrow(
                            NoRationalResultError
                        );
                    };
            }
            else
            {
                testCase =
                    function ()
                    {
                        expect(function () { Q[operationName](op1, op2); }).toThrow(
                            NoRationalResultError
                        );
                    };
            }
        }
        else if (expected === ERR_AO)
        {
            if (symmetric && op1 !== op2)
            {
                testCase =
                    function ()
                    {
                        expect(function () { Q[operationName](op1, op2); }).toThrow(
                            ArithmeticOverflowError
                        );
                        expect(function () { Q[operationName](op2, op1); }).toThrow(
                            ArithmeticOverflowError
                        );
                    };
            }
            else
            {
                testCase =
                    function ()
                    {
                        expect(function () { Q[operationName](op1, op2); }).toThrow(
                            ArithmeticOverflowError
                        );
                    };
            }
        }
        else
        {
            var matcherName = asQ ? 'toBeQ' : 'toBe';
            if (symmetric && op1 !== op2)
            {
                var expected1 = expected;
                var expected2 = test.flipResult(expected);
                testCase =
                    function ()
                    {
                        expect(Q[operationName](op1, op2))[matcherName](expected1);
                        expect(Q[operationName](op2, op1))[matcherName](expected2);
                    };
            }
            else
            {
                testCase =
                    function () { expect(Q[operationName](op1, op2))[matcherName](expected); };
            }
        }
        
        it(description, testCase);
    }
    
    test.flipResult = function (expected) { return expected; };
    
    return test;
}

beforeEach(
    function()
    {
        this.addMatchers(
            {
                toBeQ:
                function (expected)
                {
                    var message;
                    this.message = function () { return message; };
                    var actual = this.actual;
                    if (!(actual instanceof Q))
                    {
                        message = 'Expected an instance of Q';
                        return false;
                    }
                    if (Object.keys(actual).length)
                    {
                        message = 'Unexpected enumerable properties set';
                        return false;
                    }
                    if (!('_factors' in actual))
                    {
                        message = 'Expected factors property not set';
                        return false;
                    }
                    var sign = actual._sign;
                    var factors = actual._factors;
                    if (sign === 0)
                    {
                        if (factors !== void 0)
                        {
                            message = 'Expected factors to be undefined, but was ' + factors;
                            return false;
                        }
                    }
                    else if (sign === 1 || sign === -1)
                    {
                        if (Object.prototype.toString.call(factors) !== '[object Object]')
                        {
                            message =
                                'Expected factors property to be an object, but was ' + factors;
                            return false;
                        }
                        if (1 in factors)
                        {
                            message = 'Found unexpected factor 1';
                            return false;
                        }
                    }
                    else
                    {
                        message = 'Expected sign to be 0, 1, or -1, but was ' + sign;
                        return false;
                    }
                    if (expected != null)
                    {
                        var expectedQ = typeof expected === 'number' ? Q(expected) : expected;
                        if (
                            sign !== expectedQ._sign ||
                            expectedQ._factors && !compareFactors(factors, expectedQ._factors))
                        {
                            message =
                                'Expected ' +
                                (typeof expected === 'number' ? expected : 'a different Q');
                            return false;
                        }
                    }
                    return true;
                },
                toBeString:
                function ()
                {
                    var actual = this.actual;
                    var result = Object.prototype.toString.call(actual) === '[object String]';
                    return result;
                }
            }
        );
    }
);

describe(
    'No enumerable own properties in',
    function ()
    {
        it('constructor', function () { expect(Object.keys(Q).length).toBe(0); });
        it('prototype', function () { expect(Object.keys(Q.prototype).length).toBe(0); });
    }
);

describe(
    'Constructor',
    function ()
    {
        function itShouldBeQ(description, value, factors)
        {
            var expected = { _sign: value > 0 ? 1 : value < 0 ? -1 : 0, _factors: factors };
            it(
                description,
                function ()
                {
                    expect(Q(value)).toBeQ(expected);
                    expect(new Q(value)).toBeQ(expected);
                }
            );
        }
        
        function itShouldBeInvalid(description, value)
        {
            it(
                description,
                function ()
                {
                    expect(function () { Q(value); }).toThrow(InvalidArgumentError);
                    expect(function () { new Q(value); }).toThrow(InvalidArgumentError);
                }
            );
        }
        
        itShouldBeQ('with arg 1', 1, { });
        itShouldBeQ('with arg -1', -1, { });
        itShouldBeQ('with arg 0', 0);
        itShouldBeQ('with repeating positive arg', 75 / 28, { 2: -2, 3: 1, 5: 2, 7: -1 });
        itShouldBeQ('with repeating negative arg', -75 / 28, { 2: -2, 3: 1, 5: 2, 7: -1 });
        itShouldBeQ('with very small positive arg', Number.MIN_VALUE);
        itShouldBeQ('with very small negative arg', -Number.MIN_VALUE);
        itShouldBeQ('with very large positive arg', Number.MAX_VALUE);
        itShouldBeQ('with very large negative arg', -Number.MAX_VALUE);
        itShouldBeQ('with decimal string arg', '-1.5', { 2: -1, 3: 1 });
        itShouldBeInvalid('with arg positive infinity', Infinity);
        itShouldBeInvalid('with arg negative infinity', -Infinity);
        itShouldBeInvalid('with arg NaN', NaN);
        itShouldBeInvalid('with bad string arg', 'ABC');
        it(
            'without args',
            function ()
            {
                expect(function () { Q(); }).toThrow(InvalidArgumentError);
                expect(function () { new Q(); }).toThrow(InvalidArgumentError);
            }
        );
    }
);

describe(
    'pow',
    function ()
    {
        var test = createTestCall('pow', false, true);
        
        function setBase(base)
        {
            var result =
                function (description, exp, expected) { test(description, base, exp, expected); };
            return result;
        }
        
        describe(
            'with base 1',
            function ()
            {
                var test = setBase(1);
                test('and exp 1', 1, 1);
                test('and exp -1', -1, 1);
                test('and exp 0', 0, 1);
                test('and positive rational exp', 75 / 28, 1);
                test('and negative rational exp', -75 / 28, 1);
                test('and very large positive exp', Number.MAX_VALUE, 1);
                test('and very large negative exp', -Number.MAX_VALUE, 1);
            }
        );
        
        describe(
            'with base -1',
            function ()
            {
                var test = setBase(-1);
                test('and exp 1', 1, -1);
                test('and exp -1', -1, -1);
                test('and exp 0', 0, 1);
                test('and positive odd exp', 7, -1);
                test('and negative odd exp', -7, -1);
                test('and positive even exp', 8, 1);
                test('and negative even exp', -8, 1);
                test('and positive fractional exp', 1.5, ERR_NR);
                test('and negative fractional exp', -1.5, ERR_NR);
                test('and very large positive exp', Number.MAX_VALUE, 1);
                test('and very large negative exp', -Number.MAX_VALUE, 1);
            }
        );
        
        describe(
            'with base 0',
            function ()
            {
                var test = setBase(0);
                test('and exp 1', 1, 0);
                test('and exp -1', -1, ERR_NR);
                test('and exp 0', 0, ERR_NR);
                test('and positive rational exp', 75 / 28, 0);
                test('and negative rational exp', -75 / 28, ERR_NR);
                test('and very large positive exp', Number.MAX_VALUE, 0);
                test('and very large negative exp', -Number.MAX_VALUE, ERR_NR);
            }
        );
        
        describe(
            'with positive rational base',
            function ()
            {
                var test = setBase(2 / 3);
                test('and exp 1', 1, 2 / 3);
                test('and exp -1', -1, 3 / 2);
                test('and exp 0', 0, 1);
                test('and positive integer exp', 6, { _sign: 1, _factors: { 2: 6, 3: -6 } });
                test('and negative integer exp', -6, { _sign: 1, _factors: { 2: -6, 3: 6 } });
                test('and positive fractional exp', 1.5, ERR_NR);
                test('and negative fractional exp', -1.5, ERR_NR);
                test(
                    'and very large positive exp',
                    Q.MAX_EXP,
                    { _sign: 1, _factors: { 2: Q.MAX_EXP, 3: -Q.MAX_EXP } }
                );
                test(
                    'and very large negative exp',
                    Q.MIN_EXP,
                    { _sign: 1, _factors: { 2: Q.MIN_EXP, 3: -Q.MIN_EXP } }
                );
                
                describe(
                    'with prime numerator and denominator',
                    function ()
                    {
                        var test = setBase(2 / 3);
                        test('and too large positive exp', Q.MAX_EXP + 1, ERR_AO);
                        test('and too large negative exp', Q.MIN_EXP - 1, ERR_AO);
                    }
                );
                
                describe(
                    'composite',
                    function ()
                    {
                        var test = setBase(4);
                        test('and too large positive exp', Q.MAX_EXP, ERR_AO);
                        test('and too large negative exp', Q.MIN_EXP, ERR_AO);
                    }
                );
            }
        );
        
        describe(
            'with negative rational base',
            function ()
            {
                var test = setBase(-2 / 3);
                test('and exp 1', 1, -2 / 3);
                test('and exp -1', -1, -3 / 2);
                test('and exp 0', 0, 1);
                test('and positive odd exp', 7, { _sign: -1, _factors: { 2: 7, 3: -7 } });
                test('and negative odd exp', -7, { _sign: -1, _factors: { 2: -7, 3: 7 } });
                test('and positive even exp', 8, { _sign: 1, _factors: { 2: 8, 3: -8 } });
                test('and negative even exp', -8, { _sign: 1, _factors: { 2: -8, 3: 8 } });
                test('and positive fractional exp', 1.5, ERR_NR);
                test('and negative fractional exp', -1.5, ERR_NR);
                test(
                    'and very large positive exp',
                    Q.MAX_EXP,
                    { _sign: -1, _factors: { 2: Q.MAX_EXP, 3: -Q.MAX_EXP } }
                );
                test(
                    'and very large negative exp',
                    Q.MIN_EXP,
                    { _sign: -1, _factors: { 2: Q.MIN_EXP, 3: -Q.MIN_EXP } }
                );
                
                describe(
                    'with prime numerator and denominator',
                    function ()
                    {
                        var test = setBase(-2 / 3);
                        test('and too large positive exp', Q.MAX_EXP + 1, ERR_AO);
                        test('and too large negative exp', Q.MIN_EXP - 1, ERR_AO);
                    }
                );
                
                describe(
                    'composite',
                    function ()
                    {
                        var test = setBase(-4);
                        test('and too large positive exp', Q.MAX_EXP, ERR_AO);
                        test('and too large negative exp', Q.MIN_EXP, ERR_AO);
                    }
                );
            }
        );
        
        it('on instance with numeric arg', function () { expect(Q(2).pow(-2)).toBeQ(0.25); });
        it('on instance with Q arg', function () { expect(Q(2).pow(Q(-2))).toBeQ(0.25); });
        it(
            'on instance with decimal string arg',
            function () { expect(Q(2).pow('-2')).toBeQ(0.25); }
        );
        it(
            'on instance without args',
            function () { expect(function () { Q(1).pow(); }).toThrow(InvalidArgumentError); }
        );
        test('on constructor with Q args', Q(-0.1), Q(2), 0.01);
        test('on constructor with decimal string args', '-0.1', '2', 0.01);
        it(
            'on constructor without args',
            function () { expect(function () { Q.pow(); }).toThrow(InvalidArgumentError); }
        );
        it(
            'on constructor with one arg',
            function () { expect(function () { Q.pow(1); }).toThrow(InvalidArgumentError); }
        );
    }
);

describe(
    'add',
    function ()
    {
        var test = createTestCall('add', true, true);
        
        var maxPow2 = Q(2).pow(Q.MAX_EXP);
        
        it(
            'is also named plus',
            function () { expect(Q.prototype.plus).toBe(Q.prototype.add); }
        );
        test('0 + 0', 0, 0, 0);
        test('0 + positive fractional', 0, 75 / 28, 75 / 28);
        test('0 + negative fractional', 0, -75 / 28, -75 / 28);
        test('positive fractional + positive fractional', 2 / 7, 3 / 5, 31 / 35);
        test('negative fractional + negative fractional', -2 / 7, -3 / 5, -31 / 35);
        test('positive fractional + negative fractional', 2 / 7, -3 / 5, -11 / 35);
        test('-1 + very large positive', -1, Math.pow(2, 53), Math.pow(2, 53) - 1);
        test('1 + very large negative', 1, -Math.pow(2, 53), 1 - Math.pow(2, 53));
        test('1 + too small positive', 1, Math.pow(2, -54), ERR_AO);
        test('-1 + too small negative', -1, -Math.pow(2, -54), ERR_AO);
        test('1 + too large positive', 1, Math.pow(2, 54), ERR_AO);
        test('-1 + too large negative', -1, -Math.pow(2, 54), ERR_AO);
        test(
            'fails if common numerator cannot be represented exactly',
            Math.pow(3, 16),
            Q(5).pow(-12),
            ERR_AO
        );
        test('fails if an exp would be too large', maxPow2, maxPow2, ERR_AO);
        it(
            'on instance with numeric arg',
            function () { expect(Q(2).add(-0.3333333333333333)).toBeQ(5 / 3); }
        );
        it(
            'on instance with Q arg',
            function () { expect(Q(2).add(Q(-0.3333333333333333))).toBeQ(5 / 3); }
        );
        it(
            'on instance with decimal string arg',
            function () { expect(Q(2).add('-0.3333333333333333')).toBeQ(5 / 3); }
        );
        it(
            'on instance without args',
            function () { expect(function () { Q(1).add(); }).toThrow(InvalidArgumentError); }
        );
        test('on constructor with Q args', Q(-0.1), Q(2), 1.9);
        test('on constructor with decimal string args', '-0.1', '2', 1.9);
        it('on constructor without args', function () { expect(Q.add()).toBeQ(0); });
        it('on constructor with one arg', function () { expect(Q.add(-2 / 3)).toBeQ(-2 / 3); });
        it('on constructor with several args', function () { expect(Q.add(1, 2, 3)).toBeQ(6); });
    }
);

describe(
    'compare/compareTo',
    function ()
    {
        var test = createTestCall('compare', true, false);
        test.flipResult = function (expected) { return -expected; };
        
        var maxPow2 = Q(2).pow(Q.MAX_EXP);
        var maxPow3 = Q(3).pow(Q.MAX_EXP);
        var maxPowMinus2 = Q(-2).pow(Q.MAX_EXP);
        var maxPowMinus3 = Q(-3).pow(Q.MAX_EXP);
        var minPow2 = Q(2).pow(Q.MIN_EXP);
        var minPowMinus2 = Q(-2).pow(Q.MIN_EXP);
        
        test('0 = 0', 0, 0, 0);
        test('0 < positive rational', 0, 75 / 28, -1);
        test('0 > negative rational', 0, -75 / 28, 1);
        test('0 < very small positive', 0, minPow2, -1);
        test('0 > very small negative', 0, minPowMinus2, 1);
        test('0 < very large positive', 0, maxPow2, -1);
        test('0 > very large negative', 0, maxPowMinus2, 1);
        
        test('positive rational > positive rational', 2 / 3, 0.5, 1);
        test('positive rational = positive rational', 2 / 3, 2 / 3, 0);
        test('negative rational > negative rational', -2 / 3, -1, 1);
        test('negative rational = negative rational', -2 / 3, -2 / 3, 0);
        test('positive rational > negative rational', 2 / 3, -75 / 28, 1);
        
        test('positive rational > very small negative', 2 / 3, minPowMinus2, 1);
        test('positive rational < very large positive', 2 / 3, Math.pow(2, 53), -1);
        test('positive rational > very large negative', 2 / 3, maxPowMinus3, 1);
        
        test('negative rational < very small positive', -2 / 3, minPow2, -1);
        test('negative rational < very large positive', -2 / 3, maxPow3, -1);
        test('negative rational > very large negative', -2 / 3, -Math.pow(2, 53), 1);
        
        test('very small positive > very small negative', minPow2, minPowMinus2, 1);
        test('very small positive > very large negative', minPow2, maxPowMinus3, 1);
        test('very small negative < very small positive', minPowMinus2, minPow2, -1);
        test('very small negative < very large positive', minPowMinus2, maxPow3, -1);
        
        it(
            'on instance with numeric arg',
            function ()
            {
                expect(Q(2).compareTo(1)).toBe(1);
                expect(Q(2).compareTo(7)).toBe(-1);
                expect(Q(2).compareTo(2)).toBe(0);
            }
        );
        it(
            'on instance with Q arg',
            function ()
            {
                expect(Q(2).compareTo(Q(1))).toBe(1);
                expect(Q(2).compareTo(Q(7))).toBe(-1);
                expect(Q(2).compareTo(Q(2))).toBe(0);
            }
        );
        it(
            'on instance with decimal string arg',
            function ()
            {
                expect(Q(2).compareTo('1')).toBe(1);
                expect(Q(2).compareTo('7')).toBe(-1);
                expect(Q(2).compareTo('2')).toBe(0);
            }
        );
        it(
            'on instance without args',
            function () { expect(function () { Q(1).compareTo(); }).toThrow(InvalidArgumentError); }
        );
        it(
            'on constructor with Q args',
            function ()
            {
                expect(Q.compare(Q(8), Q(7))).toBe(1);
                expect(Q.compare(Q(7), Q(8))).toBe(-1);
                expect(Q.compare(Q(7), Q(7))).toBe(0);
            }
        );
        it(
            'on constructor with decimal string args',
            function ()
            {
                expect(Q.compare('8', '7')).toBe(1);
                expect(Q.compare('7', '8')).toBe(-1);
                expect(Q.compare('7', '7')).toBe(0);
            }
        );
        it(
            'on constructor without args',
            function () { expect(function () { Q.compare(); }).toThrow(InvalidArgumentError); }
        );
        it(
            'on constructor with one arg',
            function () { expect(function () { Q.compare(1); }).toThrow(InvalidArgumentError); }
        );
    }
);

describe(
    'divide',
    function ()
    {
        var test = createTestCall('divide', false, true);
        
        function setDividend(dividend)
        {
            var result =
                function (description, divisor, expected)
                {
                    test(description, dividend, divisor, expected);
                };
            return result;
        }
        
        var maxPow2 = Q(2).pow(Q.MAX_EXP);
        var maxPowMinus2 = Q(-2).pow(Q.MAX_EXP);
        var minPow2 = Q(2).pow(Q.MIN_EXP);
        var minPow3 = Q(3).pow(Q.MIN_EXP);
        var minPowMinus3 = Q(-3).pow(Q.MIN_EXP);
        
        it(
            'is also named over',
            function () { expect(Q.prototype.divide).toBe(Q.prototype.over); }
        );
        
        describe(
            '0',
            function ()
            {
                var test = setDividend(0);
                test('by 0', 0, ERR_NR);
                test('by positive rational', 75 / 28, 0);
                test('by negative rational', -75 / 28, 0);
            }
        );
        
        describe(
            'positive rational',
            function ()
            {
                var test = setDividend(3 / 2);
                test('by 0', 0, ERR_NR);
                test('by positive rational', 75 / 28, 14 / 25);
                test('by negative rational', -75 / 28, -14 / 25);
                test('by very small positive', Number.MIN_VALUE, { _sign: 1 });
                test('by very small negative', -Number.MIN_VALUE, { _sign: -1 });
                test('by too small positive', minPow3, ERR_AO);
                test('by too small negative', minPowMinus3, ERR_AO);
                test('by too large positive', maxPow2, ERR_AO);
                test('by too large negative', maxPowMinus2, ERR_AO);
            }
        );
        
        describe(
            'negative rational',
            function ()
            {
                var test = setDividend(-3 / 2);
                test('by 0', 0, ERR_NR);
                test('by positive rational', 75 / 28, -14 / 25);
                test('by negative rational', -75 / 28, 14 / 25);
                test('by very small positive', Number.MIN_VALUE, { _sign: -1 });
                test('by very small negative', -Number.MIN_VALUE, { _sign: 1 });
                test('by too small positive', minPow3, ERR_AO);
                test('by too small negative', minPowMinus3, ERR_AO);
                test('by too large positive', maxPow2, ERR_AO);
                test('by too large positive', maxPowMinus2, ERR_AO);
            }
        );
        
        describe(
            'very small positive',
            function ()
            {
                var test = setDividend(Number.MIN_VALUE);
                test('by positive rational', 2, { _sign: 1 });
                test('by negative rational', -2, { _sign: -1 });
            }
        );
        
        describe(
            'very small negative',
            function ()
            {
                var test = setDividend(-Number.MIN_VALUE);
                test('by positive rational', 2, { _sign: -1 });
                test('by negative rational', -2, { _sign: 1 });
            }
        );
        
        describe(
            'very large positive',
            function ()
            {
                var test = setDividend(Math.pow(2, 1023));
                test('by positive rational', 0.5, { _sign: 1, _factors: { 2: 1024 } });
                test('by negative rational', -0.5, { _sign: -1, _factors: { 2: 1024 } });
            }
        );
        
        describe(
            'very large negative',
            function ()
            {
                var test = setDividend(-Math.pow(2, 1023));
                test('by positive rational', 0.5, { _sign: -1, _factors: { 2: 1024 } });
                test('by negative rational', -0.5, { _sign: 1, _factors: { 2: 1024 } });
            }
        );
        
        test('too small by rational', minPow2, 2 / 3, ERR_AO);
        test('too large by rational', maxPow2, 3 / 2, ERR_AO);
        it('on instance with numeric arg', function () { expect(Q(2).divide(-2)).toBeQ(-1); });
        it('on instance with Q arg', function () { expect(Q(2).divide(Q(-2))).toBeQ(-1); });
        it(
            'on instance with decimal string arg',
            function () { expect(Q(2).divide('-2')).toBeQ(-1); }
        );
        it(
            'on instance without args',
            function () { expect(function () { Q(1).divide(); }).toThrow(InvalidArgumentError); }
        );
        test('on constructor with Q args', Q(-0.1), Q(2), -0.05);
        test('on constructor with decimal string args', '-0.1', '2', -0.05);
        it(
            'on constructor without args',
            function () { expect(function () { Q.divide(); }).toThrow(InvalidArgumentError); }
        );
        it(
            'on constructor with one arg',
            function () { expect(function () { Q.divide(1); }).toThrow(InvalidArgumentError); }
        );
    }
);

describe(
    'equals',
    function ()
    {
        var test = createTestCall('equals', true, false);
        
        test('1 = 1', 1, 1, true);
        test('-1 = -1', -1, -1, true);
        test('0 = 0', 0, 0, true);
        test('1 ≠ -1', 1, -1, false);
        test('1 ≠ 0', 1, 0, false);
        test('-1 ≠ 0', -1, 0, false);
        test('with equal positive rationals', 75 / 28, 75 / 28, true);
        test('with equal negative rationals', -75 / 28, -75 / 28, true);
        test('with different positive rationals', 75 / 28, 3 / 2, false);
        test('with different negative rationals', -75 / 28, -3 / 2, false);
        test('1 ≠ positive rational', 1, 2 / 3, false);
        test('-1 ≠ negative rational', -1, -2 / 3, false);
        it(
            'on instance with numeric arg',
            function ()
            {
                expect(Q(2).equals(2)).toBe(true);
                expect(Q(2).equals(7)).toBe(false);
            }
        );
        it(
            'on instance with Q arg',
            function ()
            {
                expect(Q(2).equals(Q(2))).toBe(true);
                expect(Q(2).equals(Q(7))).toBe(false);
            }
        );
        it(
            'on instance with decimal string arg',
            function ()
            {
                expect(Q(2).equals('2')).toBe(true);
                expect(Q(2).equals('7')).toBe(false);
            }
        );
        it(
            'on instance without args',
            function () { expect(function () { Q(1).equals(); }).toThrow(InvalidArgumentError); }
        );
        it(
            'on constructor with Q args',
            function ()
            {
                expect(Q.equals(Q(-0.1), Q(-0.1))).toBe(true);
                expect(Q.equals(Q(-0.1), Q(7))).toBe(false);
            }
        );
        it(
            'on constructor with decimal string args',
            function ()
            {
                expect(Q.equals('-0.1', '-0.1')).toBe(true);
                expect(Q.equals('-0.1', '7')).toBe(false);
            }
        );
        it('on constructor without args', function () { expect(Q.equals()).toBe(true); });
        it('on constructor with one arg', function () { expect(Q.equals(-2 / 3)).toBe(true); });
        it(
            'on constructor with several args',
            function ()
            {
                expect(Q.equals(2, 2, 2)).toBe(true);
                expect(Q.equals(2, 2, 6)).toBe(false);
            }
        );
    }
);

describe(
    'invert',
    function ()
    {
        it('1', function () { expect(Q.invert(1)).toBeQ(1); });
        it('-1', function () { expect(Q.invert(-1)).toBeQ(-1); });
        it(
            '0',
            function () { expect(function () { Q.invert(0); }).toThrow(NoRationalResultError); }
        );
        it('positive rational', function () { expect(Q.invert(75 / 28)).toBeQ(28 / 75); });
        it('negative rational', function () { expect(Q.invert(-75 / 28)).toBeQ(-28 / 75); });
        it('on instance', function () { expect(Q(-2 / 3).invert()).toBeQ(-3 / 2); });
        it(
            'on constructor with Q arg',
            function () { expect(Q.invert(Q(75 / 28))).toBeQ(28 / 75); }
        );
        it(
            'on constructor with decimal string arg',
            function () { expect(Q.invert('0.1')).toBeQ(10); }
        );
        it(
            'on constructor without args',
            function () { expect(function () { Q.invert(); }).toThrow(InvalidArgumentError); }
        );
    }
);

describe(
    'multiply',
    function ()
    {
        var test = createTestCall('multiply', true, true);
        
        var maxPow2 = Q(2).pow(Q.MAX_EXP);
        var maxPow2Third = Q(2 / 3).pow(Q.MAX_EXP);
        var maxPow3 = Q(3).pow(Q.MAX_EXP);
        var maxPow6 = Q(6).pow(Q.MAX_EXP);
        var minPow2 = Q(2).pow(Q.MIN_EXP);
        var minPow3 = Q(3).pow(Q.MIN_EXP);
        var minPow6 = Q(6).pow(Q.MIN_EXP);
        
        it('is also named times', function () { expect(Q.prototype.plus).toBe(Q.prototype.add); });
        test('1 × 1', 1, 1, 1);
        test('-1 × -1', -1, -1, 1);
        test('0 × 0', 0, 0, 0);
        test('1 × -1', 1, -1, -1);
        test('1 × 0', 1, 0, 0);
        test('-1 × 0', -1, 0, 0);
        test('positive rational × positive rational', 10 / 9, 3 / 14, 5 / 21);
        test('negative rational × negative rational', -10 / 9, -3 / 14, 5 / 21);
        test('positive rational × negative rational', 10 / 9, -3 / 14, -5 / 21);
        test('1 × positive rational', 1, 75 / 28, 75 / 28);
        test('1 × negative rational', 1, -75 / 28, -75 / 28);
        test('-1 × positive rational', -1, 75 / 28, -75 / 28);
        test('-1 × negative rational', -1, -75 / 28, 75 / 28);
        test('0 × positive rational', 0, 75 / 28, 0);
        test('0 × negative rational', 0, -75 / 28, 0);
        test('very small × very small', minPow2, minPow3, minPow6);
        test('very large × very large', maxPow2, maxPow3, maxPow6);
        test('very small × very large', minPow3, maxPow2, maxPow2Third);
        test('fails if an exp would be too small', minPow2, 3 / 2, ERR_AO);
        test('fails if an exp would be too large', maxPow3, 3 / 2, ERR_AO);
        it(
            'on instance with numeric arg',
            function () { expect(Q(2).multiply(-0.3333333333333333)).toBeQ(-2 / 3); }
        );
        it(
            'on instance with Q arg',
            function () { expect(Q(2).multiply(Q(-0.3333333333333333))).toBeQ(-2 / 3); }
        );
        it(
            'on instance with decimal string arg',
            function () { expect(Q(2).multiply('-0.3333333333333333')).toBeQ(-2 / 3); }
        );
        it(
            'on instance without args',
            function () { expect(function () { Q(1).multiply(); }).toThrow(InvalidArgumentError); }
        );
        test('on constructor with Q args', Q(-0.1), Q(2), -0.2);
        test('on constructor with decimal string args', '-0.1', '2', -0.2);
        it('on constructor without args', function () { expect(Q.multiply()).toBeQ(1); });
        it(
            'on constructor with one arg',
            function () { expect(Q.multiply(-2 / 3)).toBeQ(-2 / 3); }
        );
        it(
            'on constructor with several args',
            function () { expect(Q.multiply(2, 3, 4 / 5)).toBeQ(24 / 5); }
        );
    }
);

describe(
    'negate',
    function ()
    {
        it('1', function () { expect(Q.negate(1)).toBeQ(-1); });
        it('-1', function () { expect(Q.negate(-1)).toBeQ(1); });
        it('0', function () { expect(Q.negate(0)).toBeQ(0); });
        it('positive rational', function () { expect(Q.negate(123)).toBeQ(-123); });
        it('negative rational', function () { expect(Q.negate(-Math.PI)).toBeQ(Math.PI); });
        it('on instance', function () { expect(Q(-75 / 28).negate()).toBeQ(75 / 28); });
        it(
            'on constructor with Q arg',
            function () { expect(Q.negate(Q(75 / 28))).toBeQ(-75 / 28); }
        );
        it(
            'on constructor with decimal string arg',
            function () { expect(Q.negate('0.1')).toBeQ(-0.1); }
        );
        it(
            'on constructor without args',
            function () { expect(function () { Q.negate(); }).toThrow(InvalidArgumentError); }
        );
    }
);

describe(
    'sign',
    function ()
    {
        it('of 1', function () { expect(Q.sign(1)).toBe(1); });
        it('of -1', function () { expect(Q.sign(-1)).toBe(-1); });
        it('of 0', function () { expect(Q.sign(0)).toBe(0); });
        it('of positive rational', function () { expect(Q.sign(75 / 28)).toBe(1); });
        it('of negative rational', function () { expect(Q.sign(-75 / 28)).toBe(-1); });
        it('on instance', function () { expect(Q(-75 / 28).sign()).toBe(-1); });
        it(
            'on constructor with Q arg',
            function () { expect(Q.sign(Q(75 / 28))).toBe(1); }
        );
        it(
            'on constructor with decimal string arg',
            function () { expect(Q.sign('0.1')).toBe(1); }
        );
        it(
            'on constructor without args',
            function () { expect(function () { Q.sign(); }).toThrow(InvalidArgumentError); }
        );
    }
);

describe(
    'subtract',
    function ()
    {
        var test = createTestCall('subtract', false, true);
        
        var maxPow2 = Q(2).pow(Q.MAX_EXP);
        var maxPowMinus2 = Q(-2).pow(Q.MAX_EXP);
        
        it(
            'is also named minus',
            function () { expect(Q.prototype.subtract).toBe(Q.prototype.minus); }
        );
        test('0 - 0', 0, 0, 0);
        test('0 - positive rational', 0, 75 / 28, -75 / 28);
        test('positive rational - 0', 75 / 28, 0, 75 / 28);
        test('0 - negative rational', 0, -75 / 28, 75 / 28);
        test('negative rational - 0', -75 / 28, 0, -75 / 28);
        test('positive rational - positive rational', 2 / 7, 3 / 5, -11 / 35);
        test('positive rational - negative rational', 2 / 7, -3 / 5, 31 / 35);
        test('negative rational - positive rational', -2 / 7, 3 / 5, -31 / 35);
        test('negative rational - negative rational', -2 / 7, -3 / 5, 11 / 35);
        test('0 - very large positive', 0, maxPow2, maxPowMinus2);
        test('very large positive - 0', maxPow2, 0, maxPow2);
        test('0 - very large negative', 0, maxPowMinus2, maxPow2);
        test('very large negative - 0', maxPowMinus2, 0, maxPowMinus2);
        test('1 - too small negative', 1, -Math.pow(2, -53), ERR_AO);
        test('too small negative - 1', -Math.pow(2, -53), 1, ERR_AO);
        test('-1 - too small positive', -1, Math.pow(2, -53), ERR_AO);
        test('too small positive - -1', Math.pow(2, -53), -1, ERR_AO);
        test('1 - too large negative', 1, -Math.pow(2, 53), ERR_AO);
        test('too large negative - 1', -Math.pow(2, 53), 1, ERR_AO);
        test('-1 - too large positive', -1, Math.pow(2, 53), ERR_AO);
        test('too large positive - -1', Math.pow(2, 53), -1, ERR_AO);
        test(
            'fails if common numerator cannot be represented exactly',
            Math.pow(3, 16),
            Q(5).pow(-12),
            ERR_AO
        );
        test('fails if an exp would be too large', maxPow2, maxPowMinus2, ERR_AO);
        it('on instance with numeric arg', function () { expect(Q(2).subtract(-2)).toBeQ(4); });
        it('on instance with Q arg', function () { expect(Q(2).subtract(Q(-2))).toBeQ(4); });
        it(
            'on instance with decimal string arg',
            function () { expect(Q(2).subtract('-2')).toBeQ(4); }
        );
        it(
            'on instance without args',
            function () { expect(function () { Q(1).subtract(); }).toThrow(InvalidArgumentError); }
        );
        test('on constructor with Q args', Q(-0.1), Q(2), -2.1);
        test('on constructor with decimal string args', '-0.1', '2', -2.1);
        it(
            'on constructor without args',
            function () { expect(function () { Q.subtract(); }).toThrow(InvalidArgumentError); }
        );
        it(
            'on constructor with one arg',
            function () { expect(function () { Q.subtract(1); }).toThrow(InvalidArgumentError); }
        );
    }
);

describe(
    'toString',
    function ()
    {
        function test(description, value, expected)
        {
            it(description, function () { expect(Q.toString(value)).toBe(expected); });
        }
        
        var maxPow2 = Q(2).pow(Q.MAX_EXP);
        var minPow2 = Q(2).pow(Q.MIN_EXP);
        
        test('with arg 1', 1, '1');
        test('with arg -1', -1, '-1');
        test('with arg 0', 0, '0');
        test('with positive rational arg', 98 / 75, '2⋅3⁻¹⋅5⁻²⋅7²');
        test('with negative rational arg', -98 / 75, '-2⋅3⁻¹⋅5⁻²⋅7²');
        test('with large prime arg', 100000000003, '100000000003');
        test('with arg with a large positive exp', maxPow2, '2⁹⁰⁰⁷¹⁹⁹²⁵⁴⁷⁴⁰⁹⁹¹');
        test('with arg with a large negative exp', minPow2, '2⁻⁹⁰⁰⁷¹⁹⁹²⁵⁴⁷⁴⁰⁹⁹¹');
        it('on instance', function () { expect(Q(-2 / 3).toString()).toBe('-2⋅3⁻¹'); });
        it(
            'on constructor with Q arg',
            function () { expect(Q.toString(Q(-0.1))).toBe('-2⁻¹⋅5⁻¹'); }
        );
        it(
            'on constructor with decimal string arg',
            function () { expect(Q.toString('-0.1')).toBe('-2⁻¹⋅5⁻¹'); }
        );
        it('on constructor without args', function () { expect(Q.toString()).toBeString(); });
    }
);

describe(
    'valueOf',
    function ()
    {
        function test(description, q, expected)
        {
            it(description, function () { expect(q.valueOf()).toBe(expected); });
        }
        
        test('with arg 1', Q(1), 1);
        test('with arg -1', Q(-1), -1);
        test('with arg 0', Q(0), 0);
        test('with large prime arg', Q(100000000003), 100000000003);
        test('with positive rational arg', Q(98 / 75), 98 / 75);
        test('with negative rational arg', Q(-98 / 75), -98 / 75);
        test('with very small positive arg', Q(3 / 2).pow(Q.MIN_EXP), 0);
        test('with very small negative arg', Q(-3 / 2).pow(Q.MIN_EXP), 0);
        test('with very large positive arg', Q(3 / 2).pow(Q.MAX_EXP), Infinity);
        test('with very large negative arg', Q(-3 / 2).pow(Q.MAX_EXP), -Infinity);
    }
);
