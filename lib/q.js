/* global DEBUG, module, self */

(function ()
{
    'use strict';
    
    var FUSSINESS = 10;
    var MIN_SAFE_INTEGER = -0x1fffffffffffff;
    var MAX_SAFE_INTEGER = 0x1fffffffffffff;
    var SUPERSCRIPT_DIGITS = '⁰¹²³⁴⁵⁶⁷⁸⁹';
    var SUPERSCRIPT_MINUS = '⁻';
    
    function _get_isSafeInteger()
    {
        var isSafeInteger =
            Number.isSafeInteger ||
            function (testValue)
            {
                var result =
                    typeof testValue === 'number' &&
                    testValue % 1 === 0 &&
                    testValue >= MIN_SAFE_INTEGER &&
                    testValue <= MAX_SAFE_INTEGER;
                return result;
            };
        return isSafeInteger;
    }
    
    function _get_log2()
    {
        var log2 =
            Math.log2 ||
            function (mod)
            {
                var result = Math.log(mod) * Math.LOG2E;
                return result;
            };
        return log2;
    }
    
    var abs = Math.abs;
    
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
            var mod = abs(numerator);
            sign = numerator / mod ^ 0;
            factors = decomposition.factors;
            finishFactors(factors, mod);
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
        var result = floor(log2(mod));
        var ratio = mod / binPow(result);
        if (ratio < 1)
        {
            --result;
        }
        else if (ratio >= 2)
        {
            ++result;
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
    
    var ceil = Math.ceil;
    
    function checkPeriod(intPart, fracLength, period)
    {
        for (var index = period; index < fracLength; ++index)
        {
            if (getBinDigit(intPart, index) !== getBinDigit(intPart, index - period))
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
                            var result = fn.call(previousValue, currentValue);
                            return result;
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
            factors[factor] = min(factors1[factor], getExp(factors2, factor));
        }
        for (factor in factors2)
        {
            factors[factor] = min(factors2[factor], getExp(factors1, factor));
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
                oddProduct1 *= pow(factor, diff1);
                continue;
            }
            var diff2 = getExp(factors2, factor) - exp;
            if (diff2 > 0)
            {
                oddProduct2 *= pow(factor, diff2);
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
        while (mod > 1)
        {
            var factor = getLeastPrime(mod);
            countFactor(factors, factor);
            mod /= factor;
        }
    }
    
    function factorizeFraction(factors, mod)
    {
        var fracLength = 52 - binLog(mod);
        mod = binPowTimes(mod, fracLength);
        var maxPeriod = min(fracLength - FUSSINESS, 52);
        var exp;
        for (var period = 2; period <= maxPeriod; ++period)
        {
            var intPart = mod - getBinDigit(mod, period - 1);
            var startIndex = checkPeriod(intPart, fracLength, period);
            if (startIndex)
            {
                var periodBinPow = binPow(period);
                var repetend = floor(intPart / binPow(startIndex - period)) % periodBinPow;
                if (repetend)
                {
                    var prefix = floor(intPart / binPow(startIndex));
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
    
    function finishFactors(factors, mod)
    {
        factorize(factors, mod, safeIncrementExp);
        for (var factor in factors)
        {
            if (!factors[factor])
            {
                delete factors[factor];
            }
        }
    }
    
    function fixStringOption(option)
    {
        if (option != null)
        {
            return option + '';
        }
    }
    
    var floor = Math.floor;
    
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
    
    function getLeastPrime(mod)
    {
        if (!(mod % 2))
        {
            return 2;
        }
        if (!(mod % 3))
        {
            return 3;
        }
        if (!(mod % 5))
        {
            return 5;
        }
        var maxFactor = Math.sqrt(mod);
        for (var n = 7; n <= maxFactor; n += 30)
        {
            var factor;
            if (!(mod % (factor = n)))
            {
                return factor;
            }
            if (!(mod % (factor = n + 4)))
            {
                return factor;
            }
            if (!(mod % (factor = n + 6)))
            {
                return factor;
            }
            if (!(mod % (factor = n + 10)))
            {
                return factor;
            }
            if (!(mod % (factor = n + 12)))
            {
                return factor;
            }
            if (!(mod % (factor = n + 16)))
            {
                return factor;
            }
            if (!(mod % (factor = n + 22)))
            {
                return factor;
            }
            if (!(mod % (factor = n + 24)))
            {
                return factor;
            }
        }
        return mod;
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
    
    var isSafeInteger = _get_isSafeInteger();
    
    var log2 = _get_log2();
    
    function makeQ(n)
    {
        var result = n instanceof Q ? n : new Q(n);
        return result;
    }
    
    var min = Math.min;
    
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
    
    var pow = Math.pow;
    
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
        var absExp = abs(exp);
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
        var mod = abs(value);
        var sign = value / mod ^ 0;
        if (sign)
        {
            factors = createFactors();
            factorizeFraction(factors, mod);
        }
        var result = (this instanceof Q ? initQ : createQ).call(this, sign, factors);
        return result;
    }
    
    var qAbs =
        function ()
        {
            var sign = this._sign;
            var result = sign < 0 ? createQ(1, this._factors) : this;
            return result;
        };
    
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
    
    var qDivideAndRemainder =
        function (op)
        {
            op = makeQ(op);
            var sign2 = op._sign;
            if (!sign2)
            {
                throwNoRationalResult();
            }
            var factor;
            var numerator = 1;
            var denominator = 1;
            var remFactors = createFactors();
            var sign1 = this._sign;
            if (sign1)
            {
                var exp;
                var factors1 = this._factors;
                var factors2 = op._factors;
                for (factor in factors1)
                {
                    var exp1 = factors1[factor];
                    var exp2 = getExp(factors2, factor);
                    exp = exp1 - exp2;
                    if (exp > 0)
                    {
                        remFactors[factor] = exp2;
                        numerator *= pow(factor, exp);
                    }
                    else
                    {
                        remFactors[factor] = exp1;
                        denominator *= pow(factor, -exp);
                    }
                }
                for (factor in factors2)
                {
                    if (factors1[factor])
                    {
                        continue;
                    }
                    exp = factors2[factor];
                    if (exp < 0)
                    {
                        remFactors[factor] = exp;
                        numerator *= pow(factor, -exp);
                    }
                    else
                    {
                        denominator *= pow(factor, exp);
                    }
                }
                if (numerator > MAX_SAFE_INTEGER || denominator > MAX_SAFE_INTEGER)
                {
                    throwArithmeticOverflow();
                }
            }
            var remMod = numerator % denominator;
            var remSign = remMod && sign1;
            finishFactors(remFactors, remMod);
            var quotMod = floor(numerator / denominator);
            var quotFactors;
            var quotSign = quotMod && sign1 * sign2 ^ 0;
            if (quotSign)
            {
                quotFactors = createFactors();
                factorize(quotFactors, quotMod, incrementExp);
            }
            var quotient = createQ(quotSign, quotFactors);
            var remainder = createQ(remSign, remFactors);
            var result = { quotient: quotient, remainder: remainder };
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
            var factors = createFactors();
            var factorsIn = this._factors;
            for (var factor in factorsIn)
            {
                factors[factor] = -factorsIn[factor];
            }
            var result = createQ(sign, factors);
            return result;
        };
    
    var qIsInteger =
        function ()
        {
            var factors = this._factors;
            for (var factor in factors)
            {
                var exp = factors[factor];
                if (exp < 0)
                {
                    return false;
                }
            }
            return true;
        };
    
    var qIsPrime =
        function ()
        {
            var result;
            if (this._sign > 0)
            {
                var factors = this._factors;
                var keys = Object.keys(factors);
                result = keys.length === 1 && factors[keys[0]] === 1;
            }
            else
            {
                result = false;
            }
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
                                product *= pow(factor, exp);
                            }
                            else
                            {
                                antiProduct *= pow(factor, -exp);
                            }
                        }
                        for (factor in factors1)
                        {
                            exp = factors1[factor] / antiProduct;
                            if (!exp || exp % 1)
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
                            product *= pow(factor, exp);
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
            function prependSign(string)
            {
                var result = (sign < 0 ? '-' : '') + string;
                return result;
            }
            
            var result;
            options = options || { mode: null };
            var mode = fixStringOption(options.mode);
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
                            numerator *= pow(factor, exp);
                        }
                        else
                        {
                            denominator *= pow(factor, -exp);
                        }
                    }
                    if (numerator > MAX_SAFE_INTEGER || denominator > MAX_SAFE_INTEGER)
                    {
                        result = '(OVERFLOW)';
                    }
                    else
                    {
                        result =
                            prependSign(
                                denominator !== 1 ? numerator + '/' + denominator : numerator
                            );
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
                            var expString = exp !== 1 ? superscript(exp) : '';
                            result += (result ? '⋅' : '') + factor + expString;
                        }
                    );
                    result = prependSign(result || 1);
                }
                else
                {
                    result = 0 + '';
                }
            }
            return result;
        };
    
    var qRound =
        function (mode)
        {
            var numerator = 1;
            var denominator = 1;
            var factorsIn = this._factors;
            for (var factor in factorsIn)
            {
                var exp = factorsIn[factor];
                if (exp > 0)
                {
                    numerator *= pow(factor, exp);
                }
                else
                {
                    denominator *= pow(factor, -exp);
                }
            }
            if (numerator > MAX_SAFE_INTEGER || denominator > MAX_SAFE_INTEGER)
            {
                throwArithmeticOverflow();
            }
            var quotient = numerator / denominator;
            var signIn = this._sign;
            var up;
            mode = fixStringOption(mode);
            switch (mode)
            {
            case 'up':
                up = true;
                break;
            case 'down':
                up = false;
                break;
            case 'ceiling':
                up = signIn > 0;
                break;
            case 'floor':
                up = signIn < 0;
                break;
            case 'half up':
                up = quotient % 1 >= 0.5;
                break;
            case 'half down':
                up = quotient % 1 > 0.5;
                break;
            default:
                var bias = quotient % 2;
                up = bias >= 1.5 || bias > 0.5 && bias < 1;
                break;
            }
            var rounder = up ? ceil : floor;
            var mod = rounder(quotient);
            var factors;
            var sign = mod && signIn;
            if (sign)
            {
                factors = createFactors();
                factorize(factors, mod, incrementExp);
            }
            var result = createQ(sign, factors);
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
                        n *= pow(factor, exp);
                    }
                    else
                    {
                        d *= pow(factor, -exp);
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
     * Creates a new instance of a `Q` with a specified value.
     * The constructor can be used with or without the `new` operator, e.g. `new Q(2.5)` or
     * `Q(2.5)`.
     *
     * All fractions with integer numerator up to 4000 and integer denominator up to 50 can be
     * safely instantiated passing their numeric value to the constructor.
     * ```js
     * var q = Q(2015 / 37);
     * ```
     *
     * For fractions of larger numerators or denominators, this may yield incorrect results due to
     * the limited precision of floating point numbers, e.g. 2/67.
     * In those cases, the exact fraction can be obtained from a division.
     * ```js
     * var q = Q.divide(2, 67);
     * ```
     *
     * @class Q
     *
     * @param {number} value The numeric value of the object being created.
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
    
    /**
     * Contains integer quotient and remainder of a division.
     * @typedef {object} QuotientAndRemainder
     * @property {Q} quotient The quotient.
     * @property {Q} remainder The remainder.
     */
    
    /**
     * A number or an instance of a `Q`.
     * @typedef {Q|number} Rational
     */
    
    /**
     * A string specifying how fractional values are rounded.
     * - "up" - Rounding away from zero.
     * - "down" - Rounding towards zero.
     * - "ceiling" - Rounding towards positive infinity.
     * - "floor" - Rounding towards negative infinity.
     * - "half up" -
     *   Rounding towards the nearest integer, or away from zero if two neighbors are equidistant.
     * - "half down" -
     *   Rounding towards the nearest integer, or towards zero if two neighbors are equidistant.
     * - "half even" -
     *   Rounding towards the nearest integer, or towards the even neighbor if two neighbors are
     *   equidistant.
     *
     * @typedef {string} RoundingMode
     */
    
    /**
     * The maximum exponent for a prime factor.
     *
     * Rationals whose prime factorization contains an exponent greater than this number cannot be
     * represented.
     *
     * An attempt to instantiate such a number will typically result in an "Arithmetic overflow"
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
     * An attempt to instantiate such a number will typically result in an "Arithmetic overflow"
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
     * An attempt to instantiate such a number will typically result in an "Arithmetic overflow"
     * error.
     *
     * @const {number} Q.MIN_EXP
     */
    defineConstant('MIN_EXP', MIN_SAFE_INTEGER);
    
    /**
     * Returns the absolute value of this rational.
     * @function Q#abs
     * @returns {Q} The absolute value.
     */
    // istanbul ignore next
    function _jsdoc_workaround_() { } // jshint ignore: line
    
    /**
     * Returns the absolute value of a specified operand.
     * @function Q.abs
     * @param {Rational} operand The operand.
     * @returns {Q} The absolute value.
     */
    defineSharedFunction('abs', qAbs);
    
    /**
     * Returns the sum of this rational and a specified addend.
     *
     * @function Q#add
     *
     * @param {Rational} addend The addend.
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
     * @param {...Rational} [addends] Optional addends.
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
     * @param {Rational} comparand1 The first comparand.
     *
     * @param {Rational} comparand2 The second comparand.
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
     * @param {Rational} comparand The comparand.
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
     * Divides a this rational by a specified divisor, returning the exact quotient.
     *
     * @function Q#divide
     *
     * @param {Rational} divisor The divisor.
     *
     * @returns {Q} The quotient.
     *
     * @throws If the divisor is 0, a "No rational result" error is thrown.
     *
     * @throws
     * If the quotient cannot be represented as a `Q`, an "Arithmetic overflow" error is thrown.
     */
    // istanbul ignore next
    function _jsdoc_workaround_() { } // jshint ignore: line
    
    /**
     * Divides a specified dividend by a specified divisor, returning the exact quotient.
     *
     * @function Q.divide
     *
     * @param {Rational} dividend The dividend.
     *
     * @param {Rational} divisor The divisor.
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
     * Divides this rational by a specified divisor, returning integer quotient and remainder.
     *
     * @function Q#divideAndRemainder
     *
     * @param {Rational} dividend The dividend.
     *
     * @param {Rational} divisor The divisor.
     *
     * @returns {QuotientAndRemainder} Integer quotient and remainder.
     *
     * @throws If the divisor is 0, a "No rational result" error is thrown.
     *
     * @throws
     * If the quotient cannot be represented as a `Q`, or an intermediate calculation results in an
     * overflow, an "Arithmetic overflow" error is thrown.
     */
    // istanbul ignore next
    function _jsdoc_workaround_() { } // jshint ignore: line
    
    /**
     * Divides a specified dividend by a specified divisor, returning integer quotient and
     * remainder.
     *
     * @function Q.divideAndRemainder
     *
     * @param {Rational} dividend The dividend.
     *
     * @param {Rational} divisor The divisor.
     *
     * @returns {QuotientAndRemainder} Integer quotient and remainder.
     *
     * @throws If the divisor is 0, a "No rational result" error is thrown.
     *
     * @throws
     * If the quotient cannot be represented as a `Q`, or an intermediate calculation results in an
     * overflow, an "Arithmetic overflow" error is thrown.
     */
    defineSharedFunction('divideAndRemainder', qDivideAndRemainder);
    
    /**
     * Compares this rational and a specified comparand for equality.
     * @function Q#equals
     * @param {Rational} comparand The comparand.
     * @returns {boolean} `true` if this rational and the comparand are equal; otherwise, `false`.
     */
    defineProtoFunction('equals', qProtoEquals);
    
    /**
     * Compares the specified comparands for equality.
     *
     * @function Q.equals
     *
     * @param {...Rational} [comparands] Optional comparands.
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
    // istanbul ignore next
    function _jsdoc_workaround_() { } // jshint ignore: line
    
    /**
     * Returns the reciprocal of a specified operand.
     *
     * @function Q.invert
     *
     * @param {Rational} operand The operand.
     *
     * @returns {Q} The reciprocal.
     *
     * @throws If the operand is 0, a "No rational result" error is thrown.
     */
    defineSharedFunction('invert', qInvert);
    
    /**
     * Determines whether this rational is integer.
     *
     * @function Q#isInteger
     *
     * @returns {boolean} `true` if this rational is integer; otherwise, `false`.
     */
    // istanbul ignore next
    function _jsdoc_workaround_() { } // jshint ignore: line
    
    /**
     * Determines whether a specified operand is integer.
     *
     * @function Q.isInteger
     *
     * @param {Rational} operand The operand.
     *
     * @returns {boolean} `true` if the operand is integer; otherwise, `false`.
     */
    defineSharedFunction('isInteger', qIsInteger);
    
    /**
     * Determines whether this rational is a prime number.
     *
     * @function Q#isPrime
     *
     * @returns {boolean} `true` if this rational is a prime number; otherwise, `false`.
     */
    // istanbul ignore next
    function _jsdoc_workaround_() { } // jshint ignore: line
    
    /**
     * Determines whether a specified operand is a prime number.
     *
     * @function Q.isPrime
     *
     * @param {Rational} operand The operand.
     *
     * @returns {boolean} `true` if the operand is a prime number; otherwise, `false`.
     */
    defineSharedFunction('isPrime', qIsPrime);
    
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
     * @param {Rational} factor The factor.
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
     * @param {...Rational} [factors] Optional factors.
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
    // istanbul ignore next
    function _jsdoc_workaround_() { } // jshint ignore: line
    
    /**
     * Returns the additive inverse of a specified operand.
     * @function Q.negate
     * @param {Rational} operand The operand.
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
     * A synonym of {@link Q#add}.
     * @function Q#plus
     * @param addend
     */
    defineProtoFunction('plus', qAdd);
    
    /**
     * Returns this rational raised to the power of a specified exponent.
     *
     * @function Q#pow
     *
     * @param {Rational} exp The exponent.
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
    // istanbul ignore next
    function _jsdoc_workaround_() { } // jshint ignore: line
    
    /**
     * Returns a specified base raised to the power of a specified exponent.
     *
     * @function Q.pow
     *
     * @param {Rational} base The base.
     *
     * @param {Rational} exp The exponent.
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
     * Rounds this rational to an integer.
     *
     * @function Q#round
     *
     * @param {RoundingMode} [mode="half even"]
     *
     * @returns {Q} The rounding result.
     *
     * @throws
     * If an intermediate calculation results in an overflow, an "Arithmetic overflow" error is
     * thrown.
     */
    // istanbul ignore next
    function _jsdoc_workaround_() { } // jshint ignore: line
    
    /**
     * Rounds a specified operand to an integer.
     *
     * @function Q.round
     *
     * @param {Rational} operand The operand.
     *
     * @param {RoundingMode} [mode="half even"]
     *
     * @returns {Q} The rounding result.
     *
     * @throws
     * If an intermediate calculation results in an overflow, an "Arithmetic overflow" error is
     * thrown.
     */
    defineSharedFunction('round', qRound);
    
    /**
     * Returns the sign of this rational.
     * @function Q#sign
     * @returns {number} -1, 0, or 1 as this rational is negative, zero, or positive.
     */
    // istanbul ignore next
    function _jsdoc_workaround_() { } // jshint ignore: line
    
    /**
     * Returns the sign of a specified operand.
     * @function Q.sign
     * @param {Rational} operand The operand.
     * @returns {number} -1, 0, or 1 as the operand is negative, zero, or positive.
     */
    defineSharedFunction('sign', qSign);
    
    /**
     * Returns the difference of this rational and a specified subtrahend.
     *
     * @function Q#subtract
     *
     * @param {Rational} subtrahend The subtrahend.
     *
     * @returns {Q} The difference.
     *
     * @throws
     * If the difference cannot be represented as a `Q`, or an intermediate calculation results in
     * an overflow, an "Arithmetic overflow" error is thrown.
     */
    // istanbul ignore next
    function _jsdoc_workaround_() { } // jshint ignore: line
    
    /**
     * Returns the difference of the specified minuend and subtrahend.
     *
     * @function Q.subtract
     *
     * @param {Rational} minuend The minuend.
     *
     * @param {Rational} subtrahend The subtrahend.
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
     * @param {string} [options.mode=factor]
     * "factor" for a string representation as product of factors (e.g. "2⋅3²⋅5⁻¹" for 3.6), or
     * "fraction" for a fractional representation (e.g. "18/5").
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
     * @param {Rational} q The rational.
     *
     * @param {object} [options] Optional formatting options.
     *
     * @param {string} [options.mode=factor]
     * "factor" for a string representation as product of factors (e.g. "2⋅3²⋅5⁻¹" for 3.6), or
     * "fraction" for a fractional representation (e.g. "18/5").
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
    
    setUp(typeof self !== 'undefined' ? /* istanbul ignore next */ self : null);
    
    // istanbul ignore else
    if (typeof module !== 'undefined')
    {
        module.exports = Q;
    }
    
    // istanbul ignore else
    if (typeof DEBUG === 'undefined' || /* istanbul ignore next */ DEBUG)
    {
        var descriptors =
        {
            isSafeInteger: { get: _get_isSafeInteger },
            log2: { get: _get_log2 },
            setUp: { value: setUp }
        };
        defineConstant('debug', Object.create(Object.prototype, descriptors));
    }
}
)();
