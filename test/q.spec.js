/* global expect */
/* jshint mocha: true, node: true */

'use strict';

var Q = require('../lib/q');
require('expectations');
require('./matcher_helpers.js')(Q);

var ArithmeticOverflowError = new Error('Arithmetic overflow');
var InvalidArgumentError = new Error('Invalid argument');
var NoRationalResultError = new Error('No rational result');

var ERR_NR = { };
var ERR_AO = { };

var expectToBe = function (actual, expected) { expect(actual).toBe(expected); };

var expectToBeQ = function (actual, expected) { expect(actual).toBeQ(expected); };

function createTestCall1(operationName)
{
    function test(description, op, expected)
    {
        var testCase;
        
        if (expected === ERR_NR)
        {
            testCase =
                function ()
                {
                    expect(function () { Q[operationName](op); }).toThrow(NoRationalResultError);
                };
        }
        else if (expected === ERR_AO)
        {
            testCase =
                function ()
                {
                    expect(function () { Q[operationName](op); }).toThrow(ArithmeticOverflowError);
                };
        }
        else
        {
            var expectation = test.expectation;
            testCase = function () { expectation(Q[operationName](op), expected); };
        }
        
        it(description, testCase);
    }
    
    test.onConstructor = function (op, expected) { test.onConstructor.many([op], [expected]); };
    
    test.onConstructor.many =
        function (opList, expectedList)
        {
            var expectation = test.expectation;
            it(
                'on constructor with Q arg',
                function ()
                {
                    opList.forEach(
                        function (op, index)
                        {
                            var expected = expectedList[index];
                            expectation(Q[operationName](Q(op)), expected);
                        }
                    );
                }
            );
            it(
                'on constructor with decimal string arg',
                function ()
                {
                    opList.forEach(
                        function (op, index)
                        {
                            var expected = expectedList[index];
                            expectation(Q[operationName](op + ''), expected);
                        }
                    );
                }
            );
            it(
                'on constructor without args',
                function ()
                {
                    expect(function () { Q[operationName](); }).toThrow(InvalidArgumentError);
                }
            );
        };
    
    test.onInstance = function (op, expected) { test.onInstance.many([op], [expected]); };
    
    test.onInstance.many =
        function (opList, expectedList)
        {
            var expectation = test.expectation;
            it(
                'on instance with numeric arg',
                function ()
                {
                    opList.forEach(
                        function (op, index)
                        {
                            var expected = expectedList[index];
                            expectation(op[operationName](), expected);
                        }
                    );
                }
            );
        };
    
    test.expectation = expectToBe;
    
    return test;
}

function createTestCall2(operationName, symmetric)
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
            var expectation = test.expectation;
            if (symmetric && op1 !== op2)
            {
                var expected1 = expected;
                var expected2 = test.flipResult(expected);
                testCase =
                    function ()
                    {
                        expectation(Q[operationName](op1, op2), expected1);
                        expectation(Q[operationName](op2, op1), expected2);
                    };
            }
            else
            {
                testCase = function () { expectation(Q[operationName](op1, op2), expected); };
            }
        }
        
        it(description, testCase);
    }
    
    test.onConstructor =
        function (op1, op2, expected) { test.onConstructor.many([op1], [op2], [expected]); };
    
    test.onConstructor.many =
        function (op1List, op2List, expectedList)
        {
            var expectation = test.expectation;
            it(
                'on constructor with Q args',
                function ()
                {
                    op1List.forEach(
                        function (op1, index)
                        {
                            var op2 = op2List[index];
                            var expected = expectedList[index];
                            expectation(Q[operationName](Q(op1), Q(op2)), expected);
                        }
                    );
                }
            );
            it(
                'on constructor with decimal string args',
                function ()
                {
                    op1List.forEach(
                        function (op1, index)
                        {
                            var op2 = op2List[index];
                            var expected = expectedList[index];
                            expectation(Q[operationName](op1 + '', op2 + ''), expected);
                        }
                    );
                }
            );
            it(
                'on constructor without args',
                function ()
                {
                    expect(function () { Q[operationName](); }).toThrow(InvalidArgumentError);
                }
            );
            it(
                'on constructor with one arg',
                function ()
                {
                    expect(function () { Q[operationName](op1List[0]); }).toThrow(
                        InvalidArgumentError
                    );
                }
            );
        };
    
    test.onConstructorVarargs =
        function (op1, op2, op3, expected0, expected1, expected2, expected3)
        {
            var expectation = test.expectation;
            it(
                'on constructor with Q args',
                function () { expectation(Q[operationName](Q(op1), Q(op2)), expected2); }
            );
            it(
                'on constructor with decimal string args',
                function () { expectation(Q[operationName](op1 + '', op2 + ''), expected2); }
            );
            it(
                'on constructor without args',
                function () { expectation(Q[operationName](), expected0); }
            );
            it(
                'on constructor with one arg',
                function () { expectation(Q[operationName](op1), expected1); }
            );
            it(
                'on constructor with several args',
                function () { expectation(Q[operationName](op1, op2, op3), expected3); }
            );
        };
    
    test.onInstance =
        function (op1, op2, expected) { test.onInstance.many(op1, [op2], [expected]); };
    
    test.onInstance.many =
        function (op1, op2List, expectedList)
        {
            var expectation = test.expectation;
            var operationName = test.methodName;
            it(
                'on instance with numeric arg',
                function ()
                {
                    op2List.forEach(
                        function (op2, index)
                        {
                            var expected = expectedList[index];
                            expectation(op1[operationName](op2), expected);
                        }
                    );
                }
            );
            it(
                'on instance with Q arg',
                function ()
                {
                    op2List.forEach(
                        function (op2, index)
                        {
                            var expected = expectedList[index];
                            expectation(op1[operationName](Q(op2)), expected);
                        }
                    );
                }
            );
            it(
                'on instance with decimal string arg',
                function ()
                {
                    op2List.forEach(
                        function (op2, index)
                        {
                            var expected = expectedList[index];
                            expectation(op1[operationName](op2 + ''), expected);
                        }
                    );
                }
            );
            it(
                'on instance without args',
                function ()
                {
                    expect(function () { op1[operationName](); }).toThrow(InvalidArgumentError);
                }
            );
        };
    
    test.expectation = expectToBe;
    test.flipResult = function (expected) { return expected; };
    test.methodName = operationName;
    
    return test;
}

describe(
    'No enumerable own properties in',
    function ()
    {
        it('constructor', function () { expect(Object.keys(Q).length).toBe(0); });
        it('prototype', function () { expect(Object.keys(Q.prototype).length).toBe(0); });
    }
);

describe(
    'log2',
    function ()
    {
        var log2a = Q.debug.log2;
        var log2b;
        var descriptor = Object.getOwnPropertyDescriptor(Math, 'log2');
        delete Math.log2;
        try
        {
            log2b = Q.debug.log2;
        }
        finally
        {
            Object.defineProperty(Math, 'log2', descriptor);
        }
        
        it(
            'has two different implementations',
            function ()
            {
                expect(log2a).toBe(Math.log2);
                expect(log2b).not.toBe(Math.log2);
            }
        );
        describe(
            'calculates the binary logarithm of',
            function ()
            {
                function test(base, expected)
                {
                    describe(
                        base,
                        function ()
                        {
                            it(
                                'with implementation A',
                                function ()
                                {
                                    expect(log2a(base)).toBeCloseTo(expected, 13);
                                }
                            );
                            it(
                                'with implementation B',
                                function ()
                                {
                                    expect(log2b(base)).toBeCloseTo(expected, 13);
                                }
                            );
                        }
                    );
                }
                
                test(Math.pow(2, 53) - 1, 53);
                test(Math.pow(2, -55), -55);
            }
        );
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
        itShouldBeQ(
            'with composite positive arg',
            200560490130,
            { 2: 1, 3: 1, 5: 1, 7: 1, 11: 1, 13: 1, 17: 1, 19: 1, 23: 1, 29: 1, 31: 1 }
        );
        itShouldBeQ(
            'with composite negative arg',
            -200560490130,
            { 2: 1, 3: 1, 5: 1, 7: 1, 11: 1, 13: 1, 17: 1, 19: 1, 23: 1, 29: 1, 31: 1 }
        );
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
    'abs',
    function ()
    {
        var test = createTestCall1('abs');
        test.expectation = expectToBeQ;
        
        test('with arg 1', 1, 1);
        test('with arg -1', -1, 1);
        test('with arg 0', 0, 0);
        test('with positive rational arg', 123, 123);
        test('with negative rational arg', -2 / 7, 2 / 7);
        test.onInstance(Q(-75 / 28), 75 / 28);
        test.onConstructor(0.1, 0.1);
    }
);

describe(
    'add',
    function ()
    {
        var test = createTestCall2('add', true);
        test.expectation = expectToBeQ;
        
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
        test.onInstance(Q(2), -0.3333333333333333, 5 / 3);
        test.onConstructorVarargs(-0.1, 2, 10, 0, -0.1, 1.9, 11.9);
    }
);

describe(
    'compare/compareTo',
    function ()
    {
        var test = createTestCall2('compare', true);
        test.flipResult = function (expected) { return -expected; };
        test.methodName = 'compareTo';
        
        var maxPow2 = Q(2).pow(Q.MAX_EXP);
        var maxPow3 = Q(3).pow(Q.MAX_EXP);
        var maxPowMinus2 = Q(-2).pow(Q.MAX_EXP);
        var maxPowMinus3 = Q(-3).pow(Q.MAX_EXP);
        var minPow2 = Q(2).pow(Q.MIN_EXP);
        var minPowMinus2 = Q(-2).pow(Q.MIN_EXP);
        var q3Pow34 = Q(3).pow(34);
        var q5Pow23 = Q(5).pow(23);
        
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
        test('positive rational < very large positive odd', 2 / 3, maxPow3, -1);
        test('positive rational < very large positive even', 1 / 5, maxPow2, -1);
        test('positive rational > very large negative', 2 / 3, maxPowMinus3, 1);
        
        test('negative rational < very small positive', -2 / 3, minPow2, -1);
        test('negative rational > very large negative odd', -2 / 3, maxPowMinus3, 1);
        test('negative rational > very large negative even', -1 / 5, maxPowMinus2, 1);
        test('negative rational > very large negative', -2 / 3, -Math.pow(2, 53), 1);
        
        test('very small positive > very small negative', minPow2, minPowMinus2, 1);
        test('very small positive > very large negative', minPow2, maxPowMinus3, 1);
        test('very small negative < very small positive', minPowMinus2, minPow2, -1);
        test('very small negative < very large positive', minPowMinus2, maxPow3, -1);
        
        test('fails if both decomposition norms are too large', q5Pow23, q3Pow34, ERR_AO);
        
        test.onInstance.many(Q(2), [1, 7, 2], [1, -1, 0]);
        test.onConstructor.many([8, 7, 7], [7, 8, 7], [1, -1, 0]);
    }
);

describe(
    'divide',
    function ()
    {
        var test = createTestCall2('divide', false);
        test.expectation = expectToBeQ;
        
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
        test.onInstance(Q(2), -2, -1);
        test.onConstructor(-0.1, 2, -0.05);
    }
);

describe(
    'divideAndRemainder',
    function ()
    {
        var test = createTestCall2('divideAndRemainder', false);
        var expectation =
            function (actual, expected)
            {
                expect(actual.quotient).toBeQ(expected[0]);
                expect(actual.remainder).toBeQ(expected[1]);
            };
        test.expectation = expectation;
        
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
        var maxPow2Times3 = maxPow2.times(3);
        var maxPow2Times5 = maxPow2.times(5);
        var minPow2 = Q(2).pow(Q.MIN_EXP);
        
        describe(
            '0',
            function ()
            {
                var test = setDividend(0);
                test('by 0', 0, ERR_NR);
                test('by positive rational', 75 / 28, [0, 0]);
                test('by negative rational', -75 / 28, [0, 0]);
                test('by very large', maxPow2, [0, 0]);
                test('by very small', minPow2, [0, 0]);
            }
        );
        
        describe(
            'positive rational',
            function ()
            {
                var test = setDividend(12.5);
                test('by 0', 0, ERR_NR);
                test('by 1', 1, [12, 0.5]);
                test('by positive integer', 6, [2, 0.5]);
                test('by negative integer', -6, [-2, 0.5]);
                test('by positive fractional', 11 / 7, [7, 1.5]);
                test('by negative fractional', -11 / 7, [-7, 1.5]);
            }
        );
        
        describe(
            'negative rational',
            function ()
            {
                var test = setDividend(-12.5);
                test('by 0', 0, ERR_NR);
                test('by 1', 1, [-12, -0.5]);
                test('by positive integer', 6, [-2, -0.5]);
                test('by negative integer', -6, [2, -0.5]);
                test('by positive fractional', 11 / 7, [-7, -1.5]);
                test('by negative fractional', -11 / 7, [7, -1.5]);
            }
        );
        
        test('too large by rational', Number.MAX_VALUE, 8 / 7, ERR_AO);
        test('too small by rational', Number.MIN_VALUE, 8 / 7, ERR_AO);
        test('fails if a remainder exp would be too large', maxPow2Times5, maxPow2Times3, ERR_AO);
        test.onInstance(Q(8), -3, [-2, 2]);
        test.onConstructor(8, -3, [-2, 2]);
    }
);

describe(
    'equals',
    function ()
    {
        var test = createTestCall2('equals', true);
        
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
        test.onInstance.many(Q(2), [2, 7], [true, false]);
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
        var test = createTestCall1('invert');
        test.expectation = expectToBeQ;
        
        test('1', 1, 1);
        test('-1', -1, -1);
        test('0', 0, ERR_NR);
        test('positive rational', 75 / 28, 28 / 75);
        test('negative rational', -75 / 28, -28 / 75);
        test.onInstance(Q(-2 / 3), -3 / 2);
        test.onConstructor(0.1, 10);
    }
);

describe(
    'isInteger',
    function ()
    {
        var test = createTestCall1('isInteger');
        
        test('with arg 1', 1, true);
        test('with arg -1', -1, true);
        test('with arg 0', 0, true);
        test('with positive integer arg', 123, true);
        test('with negative integer arg', -8, true);
        test('with positive fractional arg', 0.5, false);
        test('with negative fractional arg', -8.1, false);
        test.onInstance.many([Q(4), Q(-75 / 28)], [true, false]);
        test.onConstructor.many([4, -75 / 28], [true, false]);
    }
);

describe(
    'isPrime',
    function ()
    {
        var test = createTestCall1('isPrime');
        
        test('with arg 1', 1, false);
        test('with arg -1', -1, false);
        test('with arg 0', 0, false);
        test('with prime arg', 101, true);
        test('with composite arg', 100, false);
        test('with positive fractional arg', 3 / 5, false);
        test('with negative arg', -7, false);
        test.onInstance.many([Q(2), Q(4)], [true, false]);
        test.onConstructor.many([2, 4], [true, false]);
    }
);

describe(
    'multiply',
    function ()
    {
        var test = createTestCall2('multiply', true);
        test.expectation = expectToBeQ;
        
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
        test.onInstance(Q(2), -0.3333333333333333, -2 / 3);
        test.onConstructorVarargs(-0.1, 2, 10, 1, -0.1, -0.2, -2);
    }
);

describe(
    'negate',
    function ()
    {
        var test = createTestCall1('negate');
        test.expectation = expectToBeQ;
        
        test('1', 1, -1);
        test('-1', -1, 1);
        test('0', 0, 0);
        test('positive rational', 123, -123);
        test('negative rational', -7 / 2, 7 / 2);
        test.onInstance(Q(-75 / 28), 75 / 28);
        test.onConstructor(0.1, -0.1);
    }
);

describe(
    'pow',
    function ()
    {
        var test = createTestCall2('pow', false);
        test.expectation = expectToBeQ;
        
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
        
        test.onInstance(Q(2), -2, 0.25);
        test.onConstructor(-0.1, 2, 0.01);
    }
);

describe(
    'round',
    function ()
    {
        var test = createTestCall1('round');
        test.expectation = expectToBeQ;
        
        function testMany(description, value, matches)
        {
            describe(
                description,
                function ()
                {
                    Object.keys(matches).forEach(
                        function (mode)
                        {
                            var expected = matches[mode];
                            it(
                                ' in "' + mode + '" mode',
                                function () { expect(Q.round(value, mode)).toBeQ(expected); }
                            );
                        }
                    );
                }
            );
        }
        
        testMany(
            '1',
            1,
            {
                'up': 1,
                'down': 1,
                'ceiling': 1,
                'floor': 1,
                'half up': 1,
                'half down': 1,
                'half even': 1
            }
        );
        
        testMany(
            '-1',
            -1,
            {
                'up': -1,
                'down': -1,
                'ceiling': -1,
                'floor': -1,
                'half up': -1,
                'half down': -1,
                'half even': -1
            }
        );
        
        testMany(
            '0',
            0,
            {
                'up': 0,
                'down': 0,
                'ceiling': 0,
                'floor': 0,
                'half up': 0,
                'half down': 0,
                'half even': 0
            }
        );
        
        testMany(
            '5.5',
            5.5,
            {
                'up': 6,
                'down': 5,
                'ceiling': 6,
                'floor': 5,
                'half up': 6,
                'half down': 5,
                'half even': 6
            }
        );
        
        testMany(
            '2.5',
            2.5,
            {
                'up': 3,
                'down': 2,
                'ceiling': 3,
                'floor': 2,
                'half up': 3,
                'half down': 2,
                'half even': 2
            }
        );
        
        testMany(
            '1.6',
            1.6,
            {
                'up': 2,
                'down': 1,
                'ceiling': 2,
                'floor': 1,
                'half up': 2,
                'half down': 2,
                'half even': 2
            }
        );
        
        testMany(
            '1.1',
            1.1,
            {
                'up': 2,
                'down': 1,
                'ceiling': 2,
                'floor': 1,
                'half up': 1,
                'half down': 1,
                'half even': 1
            }
        );
        
        testMany(
            '-1.1',
            -1.1,
            {
                'up': -2,
                'down': -1,
                'ceiling': -1,
                'floor': -2,
                'half up': -1,
                'half down': -1,
                'half even': -1
            }
        );
        
        testMany(
            '-1.6',
            -1.6,
            {
                'up': -2,
                'down': -1,
                'ceiling': -1,
                'floor': -2,
                'half up': -2,
                'half down': -2,
                'half even': -2
            }
        );
        
        testMany(
            '-2.5',
            -2.5,
            {
                'up': -3,
                'down': -2,
                'ceiling': -2,
                'floor': -3,
                'half up': -3,
                'half down': -2,
                'half even': -2
            }
        );
        
        testMany(
            '-5.5',
            -5.5,
            {
                'up': -6,
                'down': -5,
                'ceiling': -5,
                'floor': -6,
                'half up': -6,
                'half down': -5,
                'half even': -6
            }
        );
        
        testMany(
            'very small positive',
            Math.pow(2, -52),
            {
                'up': 1,
                'down': 0,
                'ceiling': 1,
                'floor': 0,
                'half up': 0,
                'half down': 0,
                'half even': 0
            }
        );
        
        testMany(
            'very small negative',
            -Math.pow(2, -52),
            {
                'up': -1,
                'down': 0,
                'ceiling': 0,
                'floor': -1,
                'half up': 0,
                'half down': 0,
                'half even': 0
            }
        );
        
        test('too small positive', Number.MIN_VALUE, ERR_AO);
        test('too small negative', -Number.MIN_VALUE, ERR_AO);
        test('too large positive', Number.MAX_VALUE, ERR_AO);
        test('too large negative', -Number.MAX_VALUE, ERR_AO);
        test.onInstance(Q(-2 / 3), -1);
        test.onConstructor(5.1, 5);
        it(
            'uses mode "half even" as default mode',
            function ()
            {
                expect(Q.round(2.5)).toBeQ(2);
                expect(Q.round(3.5)).toBeQ(4);
            }
        );
        it(
            'converts mode to a string',
            function ()
            {
                var mode = { valueOf: function () { return 'up'; } };
                expect(Q.round(1.2, mode)).toBeQ(2);
            }
        );
    }
);

describe(
    'sign',
    function ()
    {
        var test = createTestCall1('sign');
        
        test('of 1', 1, 1);
        test('of -1', -1, -1);
        test('of 0', 0, 0);
        test('of positive rational', 75 / 28, 1);
        test('of negative rational', -75 / 28, -1);
        test.onInstance(Q(-75 / 28), -1);
        test.onConstructor(0.1, 1);
    }
);

describe(
    'subtract',
    function ()
    {
        var test = createTestCall2('subtract', false);
        test.expectation = expectToBeQ;
        
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
        test.onInstance(Q(2), -2, 4);
        test.onConstructor(-0.1, 2, -2.1);
    }
);

describe(
    'toString',
    function ()
    {
        function test(description, value, factorsModeExpected, fractionModeExpected)
        {
            it(
                description,
                function ()
                {
                    expect(Q.toString(value, {mode: 'factor' })).toBe(factorsModeExpected);
                    expect(Q.toString(value, {mode: 'fraction' })).toBe(fractionModeExpected);
                }
            );
        }
        
        var maxPow2 = Q(2).pow(Q.MAX_EXP);
        var minPow2 = Q(2).pow(Q.MIN_EXP);
        
        test('with arg 1', 1, '1', '1');
        test('with arg -1', -1, '-1', '-1');
        test('with arg 0', 0, '0', '0');
        test('with positive rational arg', 98 / 75, '2⋅3⁻¹⋅5⁻²⋅7²', '98/75');
        test('with negative rational arg', -98 / 75, '-2⋅3⁻¹⋅5⁻²⋅7²', '-98/75');
        test('with large prime arg', 100000000003, '100000000003', '100000000003');
        test('with arg with a large positive exp', maxPow2, '2⁹⁰⁰⁷¹⁹⁹²⁵⁴⁷⁴⁰⁹⁹¹', '(OVERFLOW)');
        test('with arg with a large negative exp', minPow2, '2⁻⁹⁰⁰⁷¹⁹⁹²⁵⁴⁷⁴⁰⁹⁹¹', '(OVERFLOW)');
        it(
            'on instance',
            function ()
            {
                var q = Q(-2 / 3);
                expect(q.toString({mode: 'factor' })).toBe('-2⋅3⁻¹');
                expect(q.toString({mode: 'fraction' })).toBe('-2/3');
            }
        );
        it(
            'on constructor with Q arg',
            function ()
            {
                var q = Q(-0.1);
                expect(Q.toString(q, {mode: 'factor' })).toBe('-2⁻¹⋅5⁻¹');
                expect(Q.toString(q, {mode: 'fraction' })).toBe('-1/10');
            }
        );
        it(
            'on constructor with decimal string arg',
            function ()
            {
                expect(Q.toString('-0.1', {mode: 'factor' })).toBe('-2⁻¹⋅5⁻¹');
                expect(Q.toString('-0.1', {mode: 'fraction' })).toBe('-1/10');
            }
        );
        it('on constructor without args', function () { expect(Q.toString()).toBeString(); });
        it('uses mode "factor" as default mode', function () { expect(Q.toString(4)).toBe('2²'); });
        it(
            'converts mode to a string',
            function ()
            {
                var options = { mode: { valueOf: function () { return 'fraction'; } } };
                expect(Q.toString(4.5, options)).toBe('9/2');
            }
        );
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
