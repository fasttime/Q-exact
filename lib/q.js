/**
 * Creates a new instance of `Q` with a specified value.
 * The constructor can be used with or without the `new` operator, e.g. `new Q(2.5)` or `Q(2.5)`.
 *
 * @class Q
 * @param value The numeric value of the object being created.
 * 
 * **Errors**
 * 
 * The constructor throws an "Invalid argument" error if the argument cannot be converted to a
 * finite numeric value.
 * 
 * @classdesc
 * Represents a rational number. All operations involving `Q`s are *exact*, unless explicitly noted
 * otherwise.
 */
(function (self)
{
    'use strict';
    
    var FUSSINESS = 10;
    var MIN_SAFE_INTEGER = -0x1fffffffffffff;
    var MAX_SAFE_INTEGER = 0x1fffffffffffff;
    var ODD_PRIMES = [3];
    var SUPERSCRIPT_DIGITS = '⁰¹²³⁴⁵⁶⁷⁸⁹';
    var SUPERSCRIPT_MINUS = '⁻';
    
    var isSafeInteger = Number.isSafeInteger || function (testValue)
    {
        var result =
            typeof testValue === 'number' &&
            testValue % 1 === 0 &&
            testValue >= MIN_SAFE_INTEGER &&
            testValue <= MAX_SAFE_INTEGER;
        return result;
    };
    
    function add(a, b)
    {
        return a + b;
    }
    
    function addFactors(op1, op2, operation)
    {
        var sign;
        var factors;
        var sign1 = op1.sign;
        var sign2 = op2.sign;
        var factors1 = op1.factors;
        var factors2 = op2.factors;
        if (sign1 && sign2)
        {
            factors = createFactors();
            var factor;
            for (factor in factors1)
            {
                factors[factor] = Math.min(factors1[factor], getExp(factors2, factor));
            }
            for (factor in factors2)
            {
                factors[factor] = Math.min(factors2[factor], getExp(factors1, factor));
            }
            var oddProduct1 = sign1;
            var oddProduct2 = sign2;
            for (factor in factors)
            {
                if (+factor === 2)
                {
                    continue;
                }
                var exp = factors[factor];
                var diff1 = getExp(factors1, factor) - exp;
                if (diff1 > 0)
                {
                    oddProduct1 *= Math.pow(factor, diff1);
                    continue;
                }
                var diff2 = getExp(factors2, factor) - exp;
                if (diff2 > 0)
                {
                    oddProduct2 *= Math.pow(factor, diff2);
                    continue;
                }
            }
            if (!(oddProduct1 & oddProduct2 & 0x01))
            {
                throwArithmeticOverflow();
            }
            var binDiff1 = getExp(factors1, 2) - getExp(factors, 2);
            var product1 = oddProduct1 * binPow(binDiff1);
            var binDiff2 = getExp(factors2, 2) - getExp(factors, 2);
            var product2 = oddProduct2 * binPow(binDiff2);
            var n = operation(product1, product2);
            if (operation(product1 - n, product2) !== 0)
            {
                throwArithmeticOverflow();
            }
            var absN = Math.abs(n);
            sign = n / absN ^ 0;
            factorize(factors, absN, safeIncrementExp);
            for (factor in factors)
            {
                if (!factors[factor])
                {
                    delete factors[factor];
                }
            }
        }
        else
        {
            sign = operation(sign1, sign2);
            factors = factors1 || factors2;
        }
        var result = createQ(sign, factors);
        return result;
    }
    
    function binLog(mod)
    {
        var result = Math.log(mod) * Math.LOG2E ^ 0;
        var ratio = mod / binPow(result);
        if (ratio >= 2)
        {
            ++result;
        }
        else if (ratio < 1)
        {
            --result;
        }
        return result;
    }
    
    function binPow(exp)
    {
        var result = Math.pow(2, exp);
        return result;
    }
    
    function binPowTimes(factor, exp)
    {
        var result = exp > 1023 ? factor * binPow(1023) * binPow(exp - 1023) : factor * binPow(exp);
        return result;
    }
        
    function callOnQ(fn, args)
    {
        return fn.apply(makeQ(args[0]), Array.prototype.slice.call(args, 1));
    }
    
    function checkPeriod(floor, fracLength, period)
    {
        for (var index = period; index < fracLength; ++index)
        {
            if (getBinDigit(floor, index) !== getBinDigit(floor, index - period))
            {
                break;
            }
        }
        if (index >= FUSSINESS + period)
        {
            return index;
        }
    }
    
    function createFactors()
    {
        return { };
    }
    
    function createGroupFunction(fn, neutral)
    {
        var result =
            function ()
            {
                var result =
                    Array.prototype.reduce.call(
                        arguments,
                        function (previousValue, currentValue)
                        {
                            return fn.call(previousValue, currentValue);
                        },
                        Q(neutral)
                    );
                return result;
            };
        return result;
    }
    
    function createQ()
    {
        var result = Object.create(Q.prototype);
        initQ.apply(result, arguments);
        return result;
    }
    
    function decrementExp(factors, factor)
    {
        var exp = getExp(factors, factor) - 1;
        setExp(factors, factor, exp);
    }
    
    function defineConstant(name, value)
    {
        Object.defineProperty(Q, name, { value: value });
    }
    
    function defineConstructorFunction(name, value)
    {
        defineFunction(Q, name, value);
    }
    
    function defineFunction(obj, name, value)
    {
        Object.defineProperty(obj, name, { configurable: true, value: value, writable: true });
    }
    
    function defineProtoFunction(name, value)
    {
        defineFunction(Q.prototype, name, value);
    }
    
    function defineSharedFunction(name, value)
    {
        defineProtoFunction(name, value);
        var wrapper =
            function ()
            {
                return callOnQ(value, arguments);
            };
        defineConstructorFunction(name, wrapper);
    }
    
    function factorize(factors, mod, countFactor)
    {
        if (mod > 1)
        {
            var primeIndex = 0;
            var prime = 2;
            for (;;)
            {
                if (prime * prime > mod)
                {
                    break;
                }
                if (!(mod % prime))
                {
                    countFactor(factors, prime);
                    mod /= prime;
                }
                else
                {
                    prime = ODD_PRIMES[primeIndex++] || getAnotherPrime();
                }
            }
            countFactor(factors, mod);
        }
    }
    
    function factorizeFraction(factors, mod)
    {
        var fracLength = 52 - binLog(mod);
        mod = binPowTimes(mod, fracLength);
        var maxPeriod = Math.min(fracLength - FUSSINESS, 52);
        var exp;
        for (var period = 2; period <= maxPeriod; ++period)
        {
            var floor = mod - getBinDigit(mod, period - 1);
            var startIndex = checkPeriod(floor, fracLength, period);
            if (startIndex)
            {
                var periodBinPow = binPow(period);
                var repetend = Math.floor(floor / binPow(startIndex - period)) % periodBinPow;
                if (repetend)
                {
                    var prefix = Math.floor(floor / binPow(startIndex));
                    var divisor = periodBinPow - 1;
                    var numerator = prefix * divisor + repetend;
                    factorize(factors, numerator, incrementExp);
                    factorize(factors, divisor, decrementExp);
                    exp = getExp(factors, 2) - fracLength + startIndex;
                    setExp(factors, 2, exp);
                    return;
                }
            }
        }
        factorize(factors, mod, incrementExp);
        exp = getExp(factors, 2) - fracLength;
        setExp(factors, 2, exp);
    }
    
    function forEachFactor(q, callback)
    {
        if (q.sign)
        {
            var factors = q.factors;
            Object.keys(factors).sort(
                function (factor1, factor2)
                {
                    return factor1 - factor2;
                }
            ).forEach(
                function (factor)
                {
                    var exp = factors[factor];
                    callback(factor, exp);
                }
            );
        }
    }
    
    function getAnotherPrime()
    {
        var n = ODD_PRIMES[ODD_PRIMES.length - 1];
        for (;;)
        {
            n += 2;
            for (var primeIndex = 0;; ++primeIndex)
            {
                var prime = ODD_PRIMES[primeIndex];
                if (prime * prime > n)
                {
                    ODD_PRIMES.push(n);
                    return n;
                }
                if (!(n % prime))
                {
                    break;
                }
            }
        }
    }
    
    function getBinDigit(n, index)
    {
        var result = n / binPow(index) & 1;
        return result;
    }
    
    function getExp(factors, factor)
    {
        var result = factors[factor] || 0;
        return result;
    }
    
    function incrementExp(factors, factor)
    {
         var exp = getExp(factors, factor) + 1;
         factors[factor] = exp;
    }
    
    function initQ(sign, factors)
    {
        if (sign)
        {
            Object.freeze(factors);
        }
        else
        {
            factors = undefined;
        }
        Object.defineProperties(this, { sign: { value: sign }, factors: { value: factors } });
    }
    
    function isInteger(number)
    {
        return number % 1 === 0;
    }
    
    function makeQ(n)
    {
        return n instanceof Q ? n : new Q(n);
    }
    
    function multiplyFactors(op1, op2, operation)
    {
        var sign = op1.sign * op2.sign ^ 0;
        var factors;
        if (sign)
        {
            factors = createFactors();
            var factor;
            var factors1 = op1.factors;
            for (factor in factors1)
            {
                factors[factor] = factors1[factor];
            }
            var factors2 = op2.factors;
            for (factor in factors2)
            {
                var exp = operation(getExp(factors1, factor), factors2[factor]);
                if (!isSafeInteger(exp))
                {
                    throwArithmeticOverflow();
                }
                setExp(factors, factor, exp);
            }
        }
        var result = createQ(sign, factors);
        return result;
    }
    
    function safeIncrementExp(factors, factor)
    {
        var exp = getExp(factors, factor) + 1;
        if (exp > MAX_SAFE_INTEGER)
        {
            throwArithmeticOverflow();
        }
        factors[factor] = exp;
    }
    
    function setExp(factors, factor, exp)
    {
        if (exp)
        {
            factors[factor] = exp;
        }
        else
        {
            delete factors[factor];
        }
    }
    
    function subtract(a, b)
    {
        return a - b;
    }
    
    function superscript(exp)
    {
        var absExp = Math.abs(exp);
        var result = '';
        do
        {
            var rest = absExp % 10;
            absExp = (absExp - rest) / 10;
            var digit = SUPERSCRIPT_DIGITS[rest];
            result = digit + result;
        }
        while (absExp);
        if (exp < 0)
        {
            result = SUPERSCRIPT_MINUS + result;
        }
        return result;
    }
    
    function throwArithmeticOverflow()
    {
        throw Error('Arithmetic overflow');
    }
    
    function throwInvalidArgument()
    {
        throw Error('Invalid argument');
    }
    
    function throwNoRationalResult()
    {
        throw Error('No rational result');
    }
    
    function Q(value)
    {
        value = Number(value);
        if (!isFinite(value))
        {
            throwInvalidArgument();
        }
        var factors;
        var mod = Math.abs(value);
        var sign = value / mod ^ 0;
        if (sign)
        {
            factors = createFactors();
            factorizeFraction(factors, mod);
        }
        var result = (this instanceof Q ? initQ : createQ).call(this, sign, factors);
        return result;
    }
    
    var qAdd =
        function (op)
        {
            var result = addFactors(this, makeQ(op), add);
            return result;
        };
    
    var qConstructorEquals =
        function (op)
        {
            var length = arguments.length;
            if (length)
            {
                op = makeQ(op);
                for (var index = 1; index < length; ++index)
                {
                    if (!op.equals(arguments[index]))
                    {
                        return false;
                    }
                }
            }
            return true;
        };
    
    var qConstructorToString =
        function ()
        {
            var result;
            if (arguments.length)
            {
                result = callOnQ(qProtoToString, arguments);
            }
            else
            {
                result = Function.prototype.toString.call(this);
            }
            return result;
        };
    
    var qDivide =
        function (op)
        {
            op = makeQ(op);
            if (!op.sign)
            {
                throwNoRationalResult();
            }
            var result = multiplyFactors(this, op, subtract);
            return result;
        };
    
    var qInvert =
        function ()
        {
            var sign = this.sign;
            if (!sign)
            {
                throwNoRationalResult();
            }
            var invertedFactors = createFactors();
            var factors = this.factors;
            for (var factor in factors)
            {
                invertedFactors[factor] = -factors[factor];
            }
            var result = createQ(sign, invertedFactors);
            return result;
        };
    
    var qMultiply =
        function (op)
        {
            var result = multiplyFactors(this, makeQ(op), add);
            return result;
        };
    
    var qNegate =
        function ()
        {
            var result = createQ(0 - this.sign, this.factors);
            return result;
        };
    
    var qPow =
        function (op)
        {
            op = makeQ(op);
            var sign;
            var factors;
            var sign1 = this.sign;
            var sign2 = op.sign;
            if (sign1)
            {
                factors = createFactors();
                if (sign2)
                {
                    var factors1 = this.factors;
                    var factors2 = op.factors;
                    var product = sign2;
                    var factor;
                    var exp;
                    if (sign1 > 0)
                    {
                        var antiProduct = 1;
                        for (factor in factors2)
                        {
                            exp = factors2[factor];
                            if (exp > 0)
                            {
                                product *= Math.pow(factor, exp);
                            }
                            else
                            {
                                antiProduct *= Math.pow(factor, -exp);
                            }
                        }
                        for (factor in factors1)
                        {
                            exp = factors1[factor] / antiProduct;
                            if (!exp || !isInteger(exp))
                            {
                                throwNoRationalResult();
                            }
                            exp *= product;
                            if (!isSafeInteger(exp))
                            {
                                throwArithmeticOverflow();
                            }
                            factors[factor] = exp;
                        }
                        sign = 1;
                    }
                    else
                    {
                        for (factor in factors2)
                        {
                            exp = factors2[factor];
                            if (exp < 0)
                            {
                                throwNoRationalResult();
                            }
                            product *= Math.pow(factor, exp);
                        }
                        for (factor in factors1)
                        {
                            exp = factors1[factor] * product;
                            if (!isSafeInteger(exp))
                            {
                                throwArithmeticOverflow();
                            }
                            factors[factor] = exp;
                        }
                        sign = factors2[2] ? 1 : -1;
                    }
                }
                else
                {
                    sign = 1;
                }
            }
            else
            {
                if (sign2 <= 0)
                {
                    throwNoRationalResult();
                }
                sign = 0;
            }
            var result = createQ(sign, factors);
            return result;
        };
    
    var qProtoEquals =
        function (op)
        {
            op = makeQ(op);
            if (this.sign !== op.sign)
            {
                return false;
            }
            var factors1 = this.factors;
            var factors2 = op.factors;
            var factor;
            for (factor in factors1)
            {
                if (factors1[factor] !== factors2[factor])
                {
                    return false;
                }
            }
            for (factor in factors2)
            {
                if (factors2[factor] !== factors1[factor])
                {
                    return false;
                }
            }
            return true;
        };
    
    var qProtoToString =
        function ()
        {
            var result = '';
            forEachFactor(
                this,
                function (factor, exp)
                {
                    var factorString = factor + (exp !== 1 ? superscript(exp) : '');
                    result += (result ? '⋅' : '') + factorString;
                }
            );
            var sign = this.sign;
            result = (result ? sign < 0 ? '-' : '' : sign) + result;
            return result;
        };
    
    var qSubtract =
        function (op)
        {
            var result = addFactors(this, makeQ(op), subtract);
            return result;
        };
    
    var qValueOf =
        function ()
        {
            var n = 1;
            var d = 1;
            forEachFactor(
                this,
                function (factor, exp)
                {
                    if (exp > 0)
                    {
                        n *= Math.pow(factor, exp);
                    }
                    else
                    {
                        d *= Math.pow(factor, -exp);
                    }
                }
            );
            var result = n / d;
            if (!isFinite(result))
            {
                var sum = 0;
                forEachFactor(
                    this,
                    function (factor, exp)
                    {
                        sum += exp * Math.log(factor);
                    }
                );
                result = Math.exp(sum);
            }
            result *= this.sign;
            return result;
        };
    
    /**
     * The maximum exponent for a prime factor.
     * 
     * Rationals whose prime factorization contains an exponent greater than this number cannot be
     * represented.
     *
     * An attempt to instanciate such a number will typically result in an "Arithmetic overflow"
     * error.
     * 
     * @const {number} Q.MAX_EXP
     */
    defineConstant('MAX_EXP', MAX_SAFE_INTEGER);
        
    /**
     * The largest exponent for a prime factor.
     * 
     * Rationals whose prime factorization contains a prime larger than this number cannot be
     * represented.
     * 
     * An attempt to instanciate such a number will typically result in an "Arithmetic overflow"
     * error.
     * 
     * @const {number} Q.MAX_PRIME
     */
    defineConstant('MAX_PRIME', 9007199254740881); // binPow(53) - 111
    
    /**
     * The minimum exponent for a prime factor.
     * 
     * Rationals whose prime factorization contains an exponent less than this number cannot be
     * represented.
     * 
     * An attempt to instanciate such a number will typically result in an "Arithmetic overflow"
     * error.
     * 
     * @const {number} Q.MIN_EXP
     */
    defineConstant('MIN_EXP', MIN_SAFE_INTEGER);
    
    /**
     * @function Q#add
     * @param {Q} addend Rational to add to `this`.
     * @returns {Q} The sum.
     */
    defineProtoFunction('add', qAdd);
    
    /**
     * @function Q.add
     * @param {...Q} [addends] Optional rationals to add.
     * @returns {Q} The sum.
     */
    defineConstructorFunction('add', createGroupFunction(qAdd, 0));
    
    /**
     * Divides `this` by a specified quantity.
     * @function Q#divide
     * @param {Q} divisor
     * @returns {Q} The quotient.
     */
    function _jsdoc_workaround_() { } // jshint ignore:line
    
    /**
     * @function Q.divide
     * @param {Q} divisor
     * @param {Q} dividend
     * @returns {Q} The quotient.
     */
    defineSharedFunction('divide', qDivide);
    
    /**
     * @function Q#equals
     * @param {Q} comparand Rational to compare for equality with `this`.
     * @returns {boolean} `true` if the comparand is equal.
     */
    defineProtoFunction('equals', qProtoEquals);
    
    /**
     * @function Q.equals
     * @param {...Q} [comparands] Optional rationals to compare for equality.
     * @returns {boolean} `true` if all comparands are equal.
     */
    defineConstructorFunction('equals', qConstructorEquals);
    
    /**
     * @function Q#invert
     * @returns {Q} The reciprocal of `this`.
     */
    function _jsdoc_workaround_() { } // jshint ignore:line
    
    /**
     * @function Q.invert
     * @param {Q} operand
     * @returns {Q} The reciprocal of the operand.
     */
    defineSharedFunction('invert', qInvert);
    
    /**
     * A synonym of {@link Q#subtract}.
     * @function Q#minus
     * @param {Q} subtrahend
     * @returns {Q} The difference.
     */
    defineProtoFunction('minus', qSubtract);
    
    /**
     * @function Q#multiply
     * @param {Q} factor Rational to multiply by `this`.
     * @returns {Q} The product.
     */
    defineProtoFunction('multiply', qMultiply);
    
    /**
     * @function Q.multiply
     * @param {...Q} [factors] Optional rationals to multiply.
     * @returns {Q} The product.
     */
    defineConstructorFunction('multiply', createGroupFunction(qMultiply, 1));
    
    /**
     * @function Q#negate
     * @returns {Q} The additive inverse of `this`.
     */
    function _jsdoc_workaround_() { } // jshint ignore:line
    
    /**
     * @function Q.negate
     * @param {Q} operand
     * @returns {Q} The additive inverse of the operand.
     */
    defineSharedFunction('negate', qNegate);
    
    /**
     * A synonym of {@link Q#divide}.
     * @function Q#over
     * @param {Q} divisor
     * @returns {Q} The quotient.
     */
    defineProtoFunction('over', qDivide);
    
    /**
     * @function Q#pow
     * @param {Q} exp The exponent.
     * @returns {Q} `this` raised to the power of the exponent.
     */
    function _jsdoc_workaround_() { } // jshint ignore:line
    
    /**
     * @function Q.pow
     * @param {Q} base The base.
     * @param {Q} exp The exponent.
     * @returns {Q} The base raised to the power of the exponent.
     */
    defineSharedFunction('pow', qPow);
    
    /**
     * A synonym of {@link Q#add}.
     * @function Q#plus
     * @param {Q} addend Rational to add to `this`.
     * @returns {Q} The sum.
     */
    defineProtoFunction('plus', qAdd);
    
    /**
     * @function Q#subtract
     * @param {Q} subtrahend
     * @returns {Q} The difference.
     */
    function _jsdoc_workaround_() { } // jshint ignore:line
    
    /**
     * @function Q.subtract
     * @param {Q} minuend
     * @param {Q} subtrahend
     * @returns {Q} The difference.
     */
    defineSharedFunction('subtract', qSubtract);
    
    /**
     * A synonym of {@link Q#multiply}.
     * @function Q#times
     * @param {Q} factor Rational to multiply by `this`.
     * @returns {Q} The product.
     */
    defineProtoFunction('times', qMultiply);
    
    /**
     * @function Q#toString
     * @returns A string representation of `this`.
     */
    defineProtoFunction('toString', qProtoToString);
    
    /**
     * @function Q.toString
     * @param {Q} q
     * @returns A string representation of the argument.
     */
    defineConstructorFunction('toString', qConstructorToString);
    
    /**
     * Returns a numeric representation of this rational.
     * 
     * The number returned by this function is subject to rounding: the result is *not exact*.
     * Rationals with very large absolute value will be rounded to positive or negative infinity,
     * and very small rationals will be rounded to 0.
     * 
     * @function Q#valueOf
     * @returns A numeric representation of `this`.
     */
    defineProtoFunction('valueOf', qValueOf);
    
    function setUp(self)
    {
        if (self != null)
        {
            self.Q = Q;
        }
    }
    
    setUp(self);
    
    if (typeof module !== 'undefined')
    {
        module.exports = Q;
    }
}
)(typeof self === 'undefined' ? null : self);
