/**
 * Creates a new instance of `Q` with a specified value.
 * The constructor can be used with or without the `new` operator, e.g. `new Q(2.5)` or `Q(2.5)`.
 *
 * @class Q
 * @param value The numeric value of the object being created.
 * 
 * @throws
 * The constructor throws an "Invalid argument" error if the argument cannot be converted to a
 * finite numeric value.
 * 
 * @classdesc
 * Represents a rational number.
 * All operations involving `Q`s are *exact*, unless explicitly noted otherwise.
 * The numeric value of a `Q` is immutable.
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
    
    function addFactors(op1, op2, operationSign)
    {
        var sign;
        var factors;
        var sign1 = op1._sign;
        var sign2 = op2._sign;
        var factors1 = op1._factors;
        var factors2 = op2._factors;
        if (sign1 && sign2)
        {
            var decomposition = decompose(factors1, factors2);
            var term1 = sign1 * decomposition.norm1;
            var term2 = operationSign * sign2 * decomposition.norm2;
            var numerator = term1 + term2;
            if (numerator - term1 !== term2 || numerator - term2 !== term1)
            {
                throwArithmeticOverflow();
            }
            var mod = Math.abs(numerator);
            sign = numerator / mod ^ 0;
            factors = decomposition.factors;
            factorize(factors, mod, safeIncrementExp);
            for (var factor in factors)
            {
                if (!factors[factor])
                {
                    delete factors[factor];
                }
            }
        }
        else
        {
            sign = sign1 + operationSign * sign2;
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
    
    var binPow = Math.pow.bind(null, 2);
    
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
    
    function decompose(factors1, factors2)
    {
        var factors = createFactors();
        var factor;
        for (factor in factors1)
        {
            factors[factor] = Math.min(factors1[factor], getExp(factors2, factor));
        }
        for (factor in factors2)
        {
            factors[factor] = Math.min(factors2[factor], getExp(factors1, factor));
        }
        var oddProduct1 = 1;
        var oddProduct2 = 1;
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
        var binExp = getExp(factors, 2);
        var norm1 = getDecompositionNorm(oddProduct1, factors1, binExp);
        var norm2 = getDecompositionNorm(oddProduct2, factors2, binExp);
        var result = { factors: factors, norm1: norm1, norm2: norm2 };
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
        var wrapper = function () { return callOnQ(value, arguments); };
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
        if (q._sign)
        {
            var factors = q._factors;
            Object.keys(factors).sort(
                function (factor1, factor2) { return factor1 - factor2; }
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
    
    function getDecompositionNorm(oddProduct, factors, binExp)
    {
        var result;
        if (oddProduct & 1)
        {
            var binDiff = getExp(factors, 2) - binExp;
            result = oddProduct * binPow(binDiff);
        }
        else
        {
            result = Infinity;
        }
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
        Object.defineProperties(this, { _sign: { value: sign }, _factors: { value: factors } });
    }
    
    function isInteger(number)
    {
        return number % 1 === 0;
    }
    
    var isSafeInteger = Number.isSafeInteger || function (testValue)
    {
        var result =
            typeof testValue === 'number' &&
            testValue % 1 === 0 &&
            testValue >= MIN_SAFE_INTEGER &&
            testValue <= MAX_SAFE_INTEGER;
        return result;
    };
    
    function makeQ(n)
    {
        return n instanceof Q ? n : new Q(n);
    }
    
    function multiplyFactors(op1, op2, operationSign)
    {
        var sign = op1._sign * op2._sign ^ 0;
        var factors;
        if (sign)
        {
            factors = createFactors();
            var factor;
            var factors1 = op1._factors;
            for (factor in factors1)
            {
                factors[factor] = factors1[factor];
            }
            var factors2 = op2._factors;
            for (factor in factors2)
            {
                var exp = getExp(factors1, factor) + operationSign * factors2[factor];
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
            var result = addFactors(this, makeQ(op), 1);
            return result;
        };
    
    var qCompare =
        function ()
        {
            var result = callOnQ(qCompareTo, arguments);
            return result;
        };
    
    var qCompareTo =
        function (op)
        {
            op = makeQ(op);
            var result;
            var sign1 = this._sign;
            var sign2 = op._sign;
            if (!sign1 || !sign2)
            {
                result = sign1 - sign2;
            }
            else if (sign1 !== sign2)
            {
                result = sign1;
            }
            else
            {
                var decomposition = decompose(this._factors, op._factors);
                var norm1 = decomposition.norm1;
                var norm2 = decomposition.norm2;
                // norm1 and norm2 are positive integers, or Infinity.
                if (norm1 > MAX_SAFE_INTEGER && norm2 > MAX_SAFE_INTEGER)
                {
                    throwArithmeticOverflow();
                }
                if (norm1 > norm2)
                {
                    result = sign1;
                }
                else if (norm1 < norm2)
                {
                    result = -sign1;
                }
                else
                {
                    result = 0;
                }
            }
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
            if (!op._sign)
            {
                throwNoRationalResult();
            }
            var result = multiplyFactors(this, op, -1);
            return result;
        };
    
    var qInvert =
        function ()
        {
            var sign = this._sign;
            if (!sign)
            {
                throwNoRationalResult();
            }
            var invertedFactors = createFactors();
            var factors = this._factors;
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
            var result = multiplyFactors(this, makeQ(op), 1);
            return result;
        };
    
    var qNegate =
        function ()
        {
            var result = createQ(0 - this._sign, this._factors);
            return result;
        };
    
    var qPow =
        function (op)
        {
            op = makeQ(op);
            var sign;
            var factors;
            var sign1 = this._sign;
            var sign2 = op._sign;
            if (sign1)
            {
                factors = createFactors();
                if (sign2)
                {
                    var factors1 = this._factors;
                    var factors2 = op._factors;
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
            if (this._sign !== op._sign)
            {
                return false;
            }
            var factors1 = this._factors;
            var factors2 = op._factors;
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
        function (options)
        {
            var result;
            options = options || { mode: null };
            var mode = options.mode;
            mode = mode && mode;
            var sign = this._sign;
            if (mode === 'fraction')
            {
                if (sign)
                {
                    var numerator = 1;
                    var denominator = 1;
                    var factors = this._factors;
                    for (var factor in factors)
                    {
                        var exp = factors[factor];
                        if (exp > 0)
                        {
                            numerator *= Math.pow(factor, exp);
                        }
                        else
                        {
                            denominator *= Math.pow(factor, -exp);
                        }
                    }
                    if (numerator > MAX_SAFE_INTEGER || denominator > MAX_SAFE_INTEGER)
                    {
                        result = '(OVERFLOW)';
                    }
                    else
                    {
                        result =
                            (sign < 0 ? '-' : '') +
                            (denominator !== 1 ? numerator + '/' + denominator : numerator);
                    }
                }
                else
                {
                    result = 0 + '';
                }
            }
            else
            {
                if (sign)
                {
                    result = '';
                    forEachFactor(
                        this,
                        function (factor, exp)
                        {
                            var factorString = factor + (exp !== 1 ? superscript(exp) : '');
                            result += (result ? '⋅' : '') + factorString;
                        }
                    );
                    result = (sign < 0 ? '-' : '') + (result || 1);
                }
                else
                {
                    result = 0 + '';
                }
            }
            return result;
        };
    
    var qSign =
        function ()
        {
            var result = this._sign;
            return result;
        };
    
    var qSubtract =
        function (op)
        {
            var result = addFactors(this, makeQ(op), -1);
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
            result *= this._sign;
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
     * Returns the sum of this rational and a specified addend.
     * 
     * @function Q#add
     * 
     * @param {Q} addend The addend.
     * 
     * @returns {Q} The sum.
     * 
     * @throws
     * If the sum cannot be represented as a `Q`, or an intermediate calculation results in an
     * overflow, an "Arithmetic overflow" error is thrown.
     */
    defineProtoFunction('add', qAdd);
    
    /**
     * Returns the sum of the specified addends.
     * 
     * @function Q.add
     * 
     * @param {...Q} [addends] Optional addends.
     * 
     * @returns {Q}
     * The sum.
     * If this function is called without arguments, the return value is 0.
     * 
     * @throws
     * If the sum cannot be represented as a `Q`, or an intermediate calculation results in an
     * overflow, an "Arithmetic overflow" error is thrown.
     */
    defineConstructorFunction('add', createGroupFunction(qAdd, 0));
    
    /**
     * Compares two specified comparands for order.
     * 
     * @function Q.compare
     * 
     * @param {Q} comparand1 The first comparand.
     * 
     * @param {Q} comparand2 The second comparand.
     * 
     * @returns {number}
     * -1, 0, or 1 as the first comparand is less than, equal to, or greater than the second
     * comparand.
     * 
     * @throws
     * If an intermediate calculation results in an overflow, an "Arithmetic overflow" error is
     * thrown.
     */
    defineConstructorFunction('compare', qCompare);
    
    /**
     * Compares this rational and a specified comparand for order.
     * 
     * @function Q#compareTo
     * 
     * @param {Q} comparand The comparand.
     * 
     * @returns {number}
     * -1, 0, or 1 as this rational is less than, equal to, or greater than the comparand.
     * 
     * @throws
     * If an intermediate calculation results in an overflow, an "Arithmetic overflow" error is
     * thrown.
     */
    defineProtoFunction('compareTo', qCompareTo);
    
    /**
     * Returns the quotient of this rational and a specified divisor.
     * 
     * @function Q#divide
     * 
     * @param {Q} divisor The divisor.
     * 
     * @returns {Q} The quotient.
     * 
     * @throws If the divisor is 0, a "No rational result" error is thrown.
     * 
     * @throws
     * If the quotient cannot be represented as a `Q`, an "Arithmetic overflow" error is thrown.
     */
    function _jsdoc_workaround_() { } // jshint ignore:line
    
    /**
     * Returns the quotient of the specified dividend and divisor.
     * 
     * @function Q.divide
     * 
     * @param {Q} dividend The dividend.
     * 
     * @param {Q} divisor The divisor.
     * 
     * @returns {Q} The quotient.
     * 
     * @throws If the divisor is 0, a "No rational result" error is thrown.
     * 
     * @throws
     * If the quotient cannot be represented as a `Q`, an "Arithmetic overflow" error is thrown.
     */
    defineSharedFunction('divide', qDivide);
    
    /**
     * Compares this rational and a specified comparand for equality.
     * @function Q#equals
     * @param {Q} comparand The comparand.
     * @returns {boolean} `true` if this rational and the comparand are equal; otherwise, `false`.
     */
    defineProtoFunction('equals', qProtoEquals);
    
    /**
     * Compares the specified comparands for equality.
     * 
     * @function Q.equals
     * 
     * @param {...Q} [comparands] Optional comparands.
     * 
     * @returns {boolean}
     * `true` if all comparands are equal; otherwise, `false`.
     * If this function is called with one or no arguments, the return value is `true`.
     */
    defineConstructorFunction('equals', qConstructorEquals);
    
    /**
     * Returns the reciprocal of this rational.
     * 
     * @function Q#invert
     * 
     * @returns {Q} The reciprocal.
     *
     * @throws If this rational is 0, a "No rational result" error is thrown.
     */
    function _jsdoc_workaround_() { } // jshint ignore:line
    
    /**
     * Returns the reciprocal of a specified operand.
     * 
     * @function Q.invert
     * 
     * @param {Q} operand The operand.
     * 
     * @returns {Q} The reciprocal.
     *
     * @throws If the operand is 0, a "No rational result" error is thrown.
     */
    defineSharedFunction('invert', qInvert);
    
    /**
     * A synonym of {@link Q#subtract}.
     * @function Q#minus
     * @param subtrahend
     */
    defineProtoFunction('minus', qSubtract);
    
    /**
     * Returns the product of this rational and a specified factor.
     * 
     * @function Q#multiply
     * 
     * @param {Q} factor The factor.
     * 
     * @returns {Q} The product.
     *
     * @throws
     * If the product cannot be represented as a `Q`, an "Arithmetic overflow" error is thrown.
     */
    defineProtoFunction('multiply', qMultiply);
    
    /**
     * Returns the product of the specified factors.
     * 
     * @function Q.multiply
     * 
     * @param {...Q} [factors] Optional factors.
     *
     * @returns {Q}
     * The product.
     * If this function is called without arguments, the return value is 1.
     *
     * @throws
     * If the product cannot be represented as a `Q`, an "Arithmetic overflow" error is thrown.
     */
    defineConstructorFunction('multiply', createGroupFunction(qMultiply, 1));
    
    /**
     * Returns the additive inverse of this rational.
     * @function Q#negate
     * @returns {Q} The additive inverse.
     */
    function _jsdoc_workaround_() { } // jshint ignore:line
    
    /**
     * Returns the additive inverse of a specified operand.
     * @function Q.negate
     * @param {Q} operand The operand.
     * @returns {Q} The additive inverse.
     */
    defineSharedFunction('negate', qNegate);
    
    /**
     * A synonym of {@link Q#divide}.
     * @function Q#over
     * @param divisor
     */
    defineProtoFunction('over', qDivide);
    
    /**
     * Returns this rational raised to the power of a specified exponent.
     * 
     * @function Q#pow
     * 
     * @param {Q} exp The exponent.
     * 
     * @returns {Q} The result of the exponentiation.
     *
     * @throws
     * If the exponentiation has no rational result, a "No rational result" error is thrown.
     * This includes the following cases:
     * - The base is positive and the result is irrational (e.g. with base 2 and exponent 1/2).
     * - The base is negative and the exponent is not integer.
     * - The base is 0 and the exponent is nonpositive.
     * 
     * @throws
     * If the result of the exponentiation cannot be represented as a `Q`, an "Arithmetic overflow"
     * error is thrown.
     */
    function _jsdoc_workaround_() { } // jshint ignore:line
    
    /**
     * Returns a specified base raised to the power of a specified exponent.
     * 
     * @function Q.pow
     * 
     * @param {Q} base The base.
     * 
     * @param {Q} exp The exponent.
     * 
     * @returns {Q} The result of the exponentiation.
     *
     * @throws
     * If the exponentiation has no rational result, a "No rational result" error is thrown.
     * This includes the following cases:
     * - The base is positive and the result is irrational (e.g. with base 2 and exponent 1/2).
     * - The base is negative and the exponent is not integer.
     * - The base is 0 and the exponent is nonpositive.
     * 
     * @throws
     * If the result of the exponentiation cannot be represented as a `Q`, an "Arithmetic overflow"
     * error is thrown.
     */
    defineSharedFunction('pow', qPow);
    
    /**
     * A synonym of {@link Q#add}.
     * @function Q#plus
     * @param addend
     */
    defineProtoFunction('plus', qAdd);
    
    /**
     * Returns the sign of this rational.
     * @function Q#sign
     * @returns {number} -1, 0, or 1 as this rational is negative, zero, or positive.
     */
    function _jsdoc_workaround_() { } // jshint ignore:line
    
    /**
     * Returns the sign of a specified operand.
     * @function Q.sign
     * @param {Q} operand The operand.
     * @returns {number} -1, 0, or 1 as the operand is negative, zero, or positive.
     */
    defineSharedFunction('sign', qSign);
    
    /**
     * Returns the difference of this rational and a specified subtrahend.
     * 
     * @function Q#subtract
     * 
     * @param {Q} subtrahend The subtrahend.
     * 
     * @returns {Q} The difference.
     * 
     * @throws
     * If the difference cannot be represented as a `Q`, or an intermediate calculation results in
     * an overflow, an "Arithmetic overflow" error is thrown.
     */
    function _jsdoc_workaround_() { } // jshint ignore:line
    
    /**
     * Returns the difference of the specified minuend and subtrahend.
     * 
     * @function Q.subtract
     * 
     * @param {Q} minuend The minuend.
     * 
     * @param {Q} subtrahend The subtrahend.
     * 
     * @returns {Q} The difference.
     * 
     * @throws
     * If the difference cannot be represented as a `Q`, or an intermediate calculation results in
     * an overflow, an "Arithmetic overflow" error is thrown.
     */
    defineSharedFunction('subtract', qSubtract);
    
    /**
     * A synonym of {@link Q#multiply}.
     * @function Q#times
     * @param factor
     */
    defineProtoFunction('times', qMultiply);
    
    /**
     * Returns a string representation of this rational.
     *
     * @function Q#toString
     *
     * @param {object} [options] Optional formatting options.
     *
     * @param {string} [options.mode]
     * "factor" for a string representation as product of factors (e.g. "2⋅3²⋅5⁻¹" for 3.6), or
     * "fraction" for a fractional representation (e.g. "18/5").
     * The default is "factor".
     *
     * @returns {string}
     * A string.
     * In "fraction" mode, if an intermediate calculation results in an overflow, this function
     * returns the string "(OVERFLOW)".
     */
    defineProtoFunction('toString', qProtoToString);
    
    /**
     * Returns a string representation of a specified rational.
     *
     * @function Q.toString
     *
     * @param {Q} q The rational.
     *
     * @param {object} [options] Optional formatting options.
     *
     * @param {string} [options.mode]
     * "factor" for a string representation as product of factors (e.g. "2⋅3²⋅5⁻¹" for 3.6), or
     * "fraction" for a fractional representation (e.g. "18/5").
     * The default is "factor".
     *
     * @returns {string}
     * A string.
     * In "fraction" mode, if an intermediate calculation results in an overflow, this function
     * returns the string "(OVERFLOW)".
     */
    defineConstructorFunction('toString', qConstructorToString);
    
    /**
     * Returns a numeric representation of this rational.
     * 
     * The number returned by this function is subject to rounding: the result is *not exact*.
     * Rationals with very large absolute value are represented as ±infinity, and very small
     * rationals are rounded to ±0.
     * 
     * @function Q#valueOf
     *
     * @returns {number} A number.
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
