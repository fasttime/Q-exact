## Classes

<dl>
<dt><a href="#Q">Q</a></dt>
<dd><p>Represents a rational number.
All operations involving <code>Q</code>s are <em>exact</em>, unless explicitly noted otherwise.
The numeric value of a <code>Q</code> is immutable.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#QuotientAndRemainder">QuotientAndRemainder</a> : <code>object</code></dt>
<dd><p>Contains integer quotient and remainder of a division.</p>
</dd>
<dt><a href="#Rational">Rational</a> : <code><a href="#Q">Q</a></code> | <code>number</code></dt>
<dd><p>A number or an instance of a <code>Q</code>.</p>
</dd>
<dt><a href="#RoundingMode">RoundingMode</a> : <code>string</code></dt>
<dd><p>A string specifying how fractional values are rounded.</p>
<ul>
<li>&quot;up&quot; - Rounding away from zero.</li>
<li>&quot;down&quot; - Rounding towards zero.</li>
<li>&quot;ceiling&quot; - Rounding towards positive infinity.</li>
<li>&quot;floor&quot; - Rounding towards negative infinity.</li>
<li>&quot;half up&quot; -
Rounding towards the nearest integer, or away from zero if two neighbors are equidistant.</li>
<li>&quot;half down&quot; -
Rounding towards the nearest integer, or towards zero if two neighbors are equidistant.</li>
<li>&quot;half even&quot; -
Rounding towards the nearest integer, or towards the even neighbor if two neighbors are
equidistant.</li>
</ul>
</dd>
</dl>

<a name="Q"></a>

## Q
Represents a rational number.
All operations involving `Q`s are *exact*, unless explicitly noted otherwise.
The numeric value of a `Q` is immutable.

**Kind**: global class  

* [Q](#Q)
    * [new Q(value)](#new_Q_new)
    * _instance_
        * [.abs()](#Q+abs) ⇒ [<code>Q</code>](#Q)
        * [.add(addend)](#Q+add) ⇒ [<code>Q</code>](#Q)
        * [.compareTo(comparand)](#Q+compareTo) ⇒ <code>number</code>
        * [.divide(divisor)](#Q+divide) ⇒ [<code>Q</code>](#Q)
        * [.divideAndRemainder(dividend, divisor)](#Q+divideAndRemainder) ⇒ [<code>QuotientAndRemainder</code>](#QuotientAndRemainder)
        * [.equals(comparand)](#Q+equals) ⇒ <code>boolean</code>
        * [.invert()](#Q+invert) ⇒ [<code>Q</code>](#Q)
        * [.isInteger()](#Q+isInteger) ⇒ <code>boolean</code>
        * [.isPrime()](#Q+isPrime) ⇒ <code>boolean</code>
        * [.minus(subtrahend)](#Q+minus)
        * [.multiply(factor)](#Q+multiply) ⇒ [<code>Q</code>](#Q)
        * [.negate()](#Q+negate) ⇒ [<code>Q</code>](#Q)
        * [.over(divisor)](#Q+over)
        * [.plus(addend)](#Q+plus)
        * [.pow(exp)](#Q+pow) ⇒ [<code>Q</code>](#Q)
        * [.round([mode])](#Q+round) ⇒ [<code>Q</code>](#Q)
        * [.sign()](#Q+sign) ⇒ <code>number</code>
        * [.subtract(subtrahend)](#Q+subtract) ⇒ [<code>Q</code>](#Q)
        * [.times(factor)](#Q+times)
        * [.toString([options])](#Q+toString) ⇒ <code>string</code>
        * [.valueOf()](#Q+valueOf) ⇒ <code>number</code>
    * _static_
        * [.MAX_EXP](#Q.MAX_EXP) : <code>number</code>
        * [.MAX_PRIME](#Q.MAX_PRIME) : <code>number</code>
        * [.MIN_EXP](#Q.MIN_EXP) : <code>number</code>
        * [.abs(operand)](#Q.abs) ⇒ [<code>Q</code>](#Q)
        * [.add([...addends])](#Q.add) ⇒ [<code>Q</code>](#Q)
        * [.compare(comparand1, comparand2)](#Q.compare) ⇒ <code>number</code>
        * [.divide(dividend, divisor)](#Q.divide) ⇒ [<code>Q</code>](#Q)
        * [.divideAndRemainder(dividend, divisor)](#Q.divideAndRemainder) ⇒ [<code>QuotientAndRemainder</code>](#QuotientAndRemainder)
        * [.equals([...comparands])](#Q.equals) ⇒ <code>boolean</code>
        * [.invert(operand)](#Q.invert) ⇒ [<code>Q</code>](#Q)
        * [.isInteger(operand)](#Q.isInteger) ⇒ <code>boolean</code>
        * [.isPrime(operand)](#Q.isPrime) ⇒ <code>boolean</code>
        * [.multiply([...factors])](#Q.multiply) ⇒ [<code>Q</code>](#Q)
        * [.negate(operand)](#Q.negate) ⇒ [<code>Q</code>](#Q)
        * [.pow(base, exp)](#Q.pow) ⇒ [<code>Q</code>](#Q)
        * [.round(operand, [mode])](#Q.round) ⇒ [<code>Q</code>](#Q)
        * [.sign(operand)](#Q.sign) ⇒ <code>number</code>
        * [.subtract(minuend, subtrahend)](#Q.subtract) ⇒ [<code>Q</code>](#Q)
        * [.toString(q, [options])](#Q.toString) ⇒ <code>string</code>

<a name="new_Q_new"></a>

### new Q(value)
Creates a new instance of a `Q` with a specified value.
The constructor can be used with or without the `new` operator, e.g. `new Q(2.5)` or
`Q(2.5)`.

All fractions with integer numerator up to 4736 and integer denominator up to 52 can be
safely instantiated passing their numeric value to the constructor.
```js
var q = Q(2015 / 37);
```

For fractions of larger numerators or denominators, this may yield incorrect results due to
the limited precision of floating point numbers, e.g. 2/67.
In those cases, the exact fraction can be obtained from a division.
```js
var q = Q.divide(2, 67);
```

**Throws**:

- The constructor throws an "Invalid argument" error if the argument cannot be converted to a
finite numeric value.


| Param | Type | Description |
| --- | --- | --- |
| value | <code>number</code> | The numeric value of the object being created. |

<a name="Q+abs"></a>

### q.abs() ⇒ [<code>Q</code>](#Q)
Returns the absolute value of this rational.

**Kind**: instance method of [<code>Q</code>](#Q)  
**Returns**: [<code>Q</code>](#Q) - The absolute value.  
<a name="Q+add"></a>

### q.add(addend) ⇒ [<code>Q</code>](#Q)
Returns the sum of this rational and a specified addend.

**Kind**: instance method of [<code>Q</code>](#Q)  
**Returns**: [<code>Q</code>](#Q) - The sum.  
**Throws**:

- If the sum cannot be represented as a `Q`, or an intermediate calculation results in an
overflow, an "Arithmetic overflow" error is thrown.


| Param | Type | Description |
| --- | --- | --- |
| addend | [<code>Rational</code>](#Rational) | The addend. |

<a name="Q+compareTo"></a>

### q.compareTo(comparand) ⇒ <code>number</code>
Compares this rational and a specified comparand for order.

**Kind**: instance method of [<code>Q</code>](#Q)  
**Returns**: <code>number</code> - -1, 0, or 1 as this rational is less than, equal to, or greater than the comparand.  
**Throws**:

- If an intermediate calculation results in an overflow, an "Arithmetic overflow" error is
thrown.


| Param | Type | Description |
| --- | --- | --- |
| comparand | [<code>Rational</code>](#Rational) | The comparand. |

<a name="Q+divide"></a>

### q.divide(divisor) ⇒ [<code>Q</code>](#Q)
Divides a this rational by a specified divisor, returning the exact quotient.

**Kind**: instance method of [<code>Q</code>](#Q)  
**Returns**: [<code>Q</code>](#Q) - The quotient.  
**Throws**:

- If the divisor is 0, a "No rational result" error is thrown.
- If the quotient cannot be represented as a `Q`, an "Arithmetic overflow" error is thrown.


| Param | Type | Description |
| --- | --- | --- |
| divisor | [<code>Rational</code>](#Rational) | The divisor. |

<a name="Q+divideAndRemainder"></a>

### q.divideAndRemainder(dividend, divisor) ⇒ [<code>QuotientAndRemainder</code>](#QuotientAndRemainder)
Divides this rational by a specified divisor, returning integer quotient and remainder.

**Kind**: instance method of [<code>Q</code>](#Q)  
**Returns**: [<code>QuotientAndRemainder</code>](#QuotientAndRemainder) - Integer quotient and remainder.  
**Throws**:

- If the divisor is 0, a "No rational result" error is thrown.
- If the quotient cannot be represented as a `Q`, or an intermediate calculation results in an
overflow, an "Arithmetic overflow" error is thrown.


| Param | Type | Description |
| --- | --- | --- |
| dividend | [<code>Rational</code>](#Rational) | The dividend. |
| divisor | [<code>Rational</code>](#Rational) | The divisor. |

<a name="Q+equals"></a>

### q.equals(comparand) ⇒ <code>boolean</code>
Compares this rational and a specified comparand for equality.

**Kind**: instance method of [<code>Q</code>](#Q)  
**Returns**: <code>boolean</code> - `true` if this rational and the comparand are equal; otherwise, `false`.  

| Param | Type | Description |
| --- | --- | --- |
| comparand | [<code>Rational</code>](#Rational) | The comparand. |

<a name="Q+invert"></a>

### q.invert() ⇒ [<code>Q</code>](#Q)
Returns the reciprocal of this rational.

**Kind**: instance method of [<code>Q</code>](#Q)  
**Returns**: [<code>Q</code>](#Q) - The reciprocal.  
**Throws**:

- If this rational is 0, a "No rational result" error is thrown.

<a name="Q+isInteger"></a>

### q.isInteger() ⇒ <code>boolean</code>
Determines whether this rational is integer.

**Kind**: instance method of [<code>Q</code>](#Q)  
**Returns**: <code>boolean</code> - `true` if this rational is integer; otherwise, `false`.  
<a name="Q+isPrime"></a>

### q.isPrime() ⇒ <code>boolean</code>
Determines whether this rational is a prime number.

**Kind**: instance method of [<code>Q</code>](#Q)  
**Returns**: <code>boolean</code> - `true` if this rational is a prime number; otherwise, `false`.  
<a name="Q+minus"></a>

### q.minus(subtrahend)
A synonym of [subtract](#Q+subtract).

**Kind**: instance method of [<code>Q</code>](#Q)  

| Param |
| --- |
| subtrahend | 

<a name="Q+multiply"></a>

### q.multiply(factor) ⇒ [<code>Q</code>](#Q)
Returns the product of this rational and a specified factor.

**Kind**: instance method of [<code>Q</code>](#Q)  
**Returns**: [<code>Q</code>](#Q) - The product.  
**Throws**:

- If the product cannot be represented as a `Q`, an "Arithmetic overflow" error is thrown.


| Param | Type | Description |
| --- | --- | --- |
| factor | [<code>Rational</code>](#Rational) | The factor. |

<a name="Q+negate"></a>

### q.negate() ⇒ [<code>Q</code>](#Q)
Returns the additive inverse of this rational.

**Kind**: instance method of [<code>Q</code>](#Q)  
**Returns**: [<code>Q</code>](#Q) - The additive inverse.  
<a name="Q+over"></a>

### q.over(divisor)
A synonym of [divide](#Q+divide).

**Kind**: instance method of [<code>Q</code>](#Q)  

| Param |
| --- |
| divisor | 

<a name="Q+plus"></a>

### q.plus(addend)
A synonym of [add](#Q+add).

**Kind**: instance method of [<code>Q</code>](#Q)  

| Param |
| --- |
| addend | 

<a name="Q+pow"></a>

### q.pow(exp) ⇒ [<code>Q</code>](#Q)
Returns this rational raised to the power of a specified exponent.

**Kind**: instance method of [<code>Q</code>](#Q)  
**Returns**: [<code>Q</code>](#Q) - The result of the exponentiation.  
**Throws**:

- If the exponentiation has no rational result, a "No rational result" error is thrown.
This includes the following cases:
- The base is positive and the result is irrational (e.g. with base 2 and exponent 1/2).
- The base is negative and the exponent is not integer.
- The base is 0 and the exponent is nonpositive.
- If the result of the exponentiation cannot be represented as a `Q`, an "Arithmetic overflow"
error is thrown.


| Param | Type | Description |
| --- | --- | --- |
| exp | [<code>Rational</code>](#Rational) | The exponent. |

<a name="Q+round"></a>

### q.round([mode]) ⇒ [<code>Q</code>](#Q)
Rounds this rational to an integer.

**Kind**: instance method of [<code>Q</code>](#Q)  
**Returns**: [<code>Q</code>](#Q) - The rounding result.  
**Throws**:

- If an intermediate calculation results in an overflow, an "Arithmetic overflow" error is
thrown.


| Param | Type | Default |
| --- | --- | --- |
| [mode] | [<code>RoundingMode</code>](#RoundingMode) | <code>&quot;half even&quot;</code> | 

<a name="Q+sign"></a>

### q.sign() ⇒ <code>number</code>
Returns the sign of this rational.

**Kind**: instance method of [<code>Q</code>](#Q)  
**Returns**: <code>number</code> - -1, 0, or 1 as this rational is negative, zero, or positive.  
<a name="Q+subtract"></a>

### q.subtract(subtrahend) ⇒ [<code>Q</code>](#Q)
Returns the difference of this rational and a specified subtrahend.

**Kind**: instance method of [<code>Q</code>](#Q)  
**Returns**: [<code>Q</code>](#Q) - The difference.  
**Throws**:

- If the difference cannot be represented as a `Q`, or an intermediate calculation results in
an overflow, an "Arithmetic overflow" error is thrown.


| Param | Type | Description |
| --- | --- | --- |
| subtrahend | [<code>Rational</code>](#Rational) | The subtrahend. |

<a name="Q+times"></a>

### q.times(factor)
A synonym of [multiply](#Q+multiply).

**Kind**: instance method of [<code>Q</code>](#Q)  

| Param |
| --- |
| factor | 

<a name="Q+toString"></a>

### q.toString([options]) ⇒ <code>string</code>
Returns a string representation of this rational.

**Kind**: instance method of [<code>Q</code>](#Q)  
**Returns**: <code>string</code> - A string.
In "fraction" mode, if an intermediate calculation results in an overflow, this function
returns the string "(OVERFLOW)".  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>object</code> |  | Optional formatting options. |
| [options.mode] | <code>string</code> | <code>&quot;factor&quot;</code> | "factor" for a string representation as product of factors (e.g. "2⋅3²⋅5⁻¹" for 3.6), or "fraction" for a fractional representation (e.g. "18/5"). |

<a name="Q+valueOf"></a>

### q.valueOf() ⇒ <code>number</code>
Returns a numeric representation of this rational.

The number returned by this function is *not exact*, it could differ from the exact value of
this rational by more than 50%.
Rationals with very large absolute value are represented as ±infinity, and very small
rationals are rounded to ±0.

**Kind**: instance method of [<code>Q</code>](#Q)  
**Returns**: <code>number</code> - A number.  
<a name="Q.MAX_EXP"></a>

### Q.MAX\_EXP : <code>number</code>
The maximum exponent for a prime factor.

Rationals whose prime factorization contains an exponent greater than this number cannot be
represented.

An attempt to instantiate such a number will typically result in an "Arithmetic overflow"
error.

**Kind**: static constant of [<code>Q</code>](#Q)  
<a name="Q.MAX_PRIME"></a>

### Q.MAX\_PRIME : <code>number</code>
The largest exponent for a prime factor.

Rationals whose prime factorization contains a prime larger than this number cannot be
represented.

An attempt to instantiate such a number will typically result in an "Arithmetic overflow"
error.

**Kind**: static constant of [<code>Q</code>](#Q)  
<a name="Q.MIN_EXP"></a>

### Q.MIN\_EXP : <code>number</code>
The minimum exponent for a prime factor.

Rationals whose prime factorization contains an exponent less than this number cannot be
represented.

An attempt to instantiate such a number will typically result in an "Arithmetic overflow"
error.

**Kind**: static constant of [<code>Q</code>](#Q)  
<a name="Q.abs"></a>

### Q.abs(operand) ⇒ [<code>Q</code>](#Q)
Returns the absolute value of a specified operand.

**Kind**: static method of [<code>Q</code>](#Q)  
**Returns**: [<code>Q</code>](#Q) - The absolute value.  

| Param | Type | Description |
| --- | --- | --- |
| operand | [<code>Rational</code>](#Rational) | The operand. |

<a name="Q.add"></a>

### Q.add([...addends]) ⇒ [<code>Q</code>](#Q)
Returns the sum of the specified addends.

**Kind**: static method of [<code>Q</code>](#Q)  
**Returns**: [<code>Q</code>](#Q) - The sum.
If this function is called without arguments, the return value is 0.  
**Throws**:

- If the sum cannot be represented as a `Q`, or an intermediate calculation results in an
overflow, an "Arithmetic overflow" error is thrown.


| Param | Type | Description |
| --- | --- | --- |
| [...addends] | [<code>Rational</code>](#Rational) | Optional addends. |

<a name="Q.compare"></a>

### Q.compare(comparand1, comparand2) ⇒ <code>number</code>
Compares two specified comparands for order.

**Kind**: static method of [<code>Q</code>](#Q)  
**Returns**: <code>number</code> - -1, 0, or 1 as the first comparand is less than, equal to, or greater than the second
comparand.  
**Throws**:

- If an intermediate calculation results in an overflow, an "Arithmetic overflow" error is
thrown.


| Param | Type | Description |
| --- | --- | --- |
| comparand1 | [<code>Rational</code>](#Rational) | The first comparand. |
| comparand2 | [<code>Rational</code>](#Rational) | The second comparand. |

<a name="Q.divide"></a>

### Q.divide(dividend, divisor) ⇒ [<code>Q</code>](#Q)
Divides a specified dividend by a specified divisor, returning the exact quotient.

**Kind**: static method of [<code>Q</code>](#Q)  
**Returns**: [<code>Q</code>](#Q) - The quotient.  
**Throws**:

- If the divisor is 0, a "No rational result" error is thrown.
- If the quotient cannot be represented as a `Q`, an "Arithmetic overflow" error is thrown.


| Param | Type | Description |
| --- | --- | --- |
| dividend | [<code>Rational</code>](#Rational) | The dividend. |
| divisor | [<code>Rational</code>](#Rational) | The divisor. |

<a name="Q.divideAndRemainder"></a>

### Q.divideAndRemainder(dividend, divisor) ⇒ [<code>QuotientAndRemainder</code>](#QuotientAndRemainder)
Divides a specified dividend by a specified divisor, returning integer quotient and
remainder.

**Kind**: static method of [<code>Q</code>](#Q)  
**Returns**: [<code>QuotientAndRemainder</code>](#QuotientAndRemainder) - Integer quotient and remainder.  
**Throws**:

- If the divisor is 0, a "No rational result" error is thrown.
- If the quotient cannot be represented as a `Q`, or an intermediate calculation results in an
overflow, an "Arithmetic overflow" error is thrown.


| Param | Type | Description |
| --- | --- | --- |
| dividend | [<code>Rational</code>](#Rational) | The dividend. |
| divisor | [<code>Rational</code>](#Rational) | The divisor. |

<a name="Q.equals"></a>

### Q.equals([...comparands]) ⇒ <code>boolean</code>
Compares the specified comparands for equality.

**Kind**: static method of [<code>Q</code>](#Q)  
**Returns**: <code>boolean</code> - `true` if all comparands are equal; otherwise, `false`.
If this function is called with one or no arguments, the return value is `true`.  

| Param | Type | Description |
| --- | --- | --- |
| [...comparands] | [<code>Rational</code>](#Rational) | Optional comparands. |

<a name="Q.invert"></a>

### Q.invert(operand) ⇒ [<code>Q</code>](#Q)
Returns the reciprocal of a specified operand.

**Kind**: static method of [<code>Q</code>](#Q)  
**Returns**: [<code>Q</code>](#Q) - The reciprocal.  
**Throws**:

- If the operand is 0, a "No rational result" error is thrown.


| Param | Type | Description |
| --- | --- | --- |
| operand | [<code>Rational</code>](#Rational) | The operand. |

<a name="Q.isInteger"></a>

### Q.isInteger(operand) ⇒ <code>boolean</code>
Determines whether a specified operand is integer.

**Kind**: static method of [<code>Q</code>](#Q)  
**Returns**: <code>boolean</code> - `true` if the operand is integer; otherwise, `false`.  

| Param | Type | Description |
| --- | --- | --- |
| operand | [<code>Rational</code>](#Rational) | The operand. |

<a name="Q.isPrime"></a>

### Q.isPrime(operand) ⇒ <code>boolean</code>
Determines whether a specified operand is a prime number.

**Kind**: static method of [<code>Q</code>](#Q)  
**Returns**: <code>boolean</code> - `true` if the operand is a prime number; otherwise, `false`.  

| Param | Type | Description |
| --- | --- | --- |
| operand | [<code>Rational</code>](#Rational) | The operand. |

<a name="Q.multiply"></a>

### Q.multiply([...factors]) ⇒ [<code>Q</code>](#Q)
Returns the product of the specified factors.

**Kind**: static method of [<code>Q</code>](#Q)  
**Returns**: [<code>Q</code>](#Q) - The product.
If this function is called without arguments, the return value is 1.  
**Throws**:

- If the product cannot be represented as a `Q`, or an intermediate calculation results in an
overflow, an "Arithmetic overflow" error is thrown.


| Param | Type | Description |
| --- | --- | --- |
| [...factors] | [<code>Rational</code>](#Rational) | Optional factors. |

<a name="Q.negate"></a>

### Q.negate(operand) ⇒ [<code>Q</code>](#Q)
Returns the additive inverse of a specified operand.

**Kind**: static method of [<code>Q</code>](#Q)  
**Returns**: [<code>Q</code>](#Q) - The additive inverse.  

| Param | Type | Description |
| --- | --- | --- |
| operand | [<code>Rational</code>](#Rational) | The operand. |

<a name="Q.pow"></a>

### Q.pow(base, exp) ⇒ [<code>Q</code>](#Q)
Returns a specified base raised to the power of a specified exponent.

**Kind**: static method of [<code>Q</code>](#Q)  
**Returns**: [<code>Q</code>](#Q) - The result of the exponentiation.  
**Throws**:

- If the exponentiation has no rational result, a "No rational result" error is thrown.
This includes the following cases:
- The base is positive and the result is irrational (e.g. with base 2 and exponent 1/2).
- The base is negative and the exponent is not integer.
- The base is 0 and the exponent is nonpositive.
- If the result of the exponentiation cannot be represented as a `Q`, an "Arithmetic overflow"
error is thrown.


| Param | Type | Description |
| --- | --- | --- |
| base | [<code>Rational</code>](#Rational) | The base. |
| exp | [<code>Rational</code>](#Rational) | The exponent. |

<a name="Q.round"></a>

### Q.round(operand, [mode]) ⇒ [<code>Q</code>](#Q)
Rounds a specified operand to an integer.

**Kind**: static method of [<code>Q</code>](#Q)  
**Returns**: [<code>Q</code>](#Q) - The rounding result.  
**Throws**:

- If an intermediate calculation results in an overflow, an "Arithmetic overflow" error is
thrown.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| operand | [<code>Rational</code>](#Rational) |  | The operand. |
| [mode] | [<code>RoundingMode</code>](#RoundingMode) | <code>&quot;half even&quot;</code> |  |

<a name="Q.sign"></a>

### Q.sign(operand) ⇒ <code>number</code>
Returns the sign of a specified operand.

**Kind**: static method of [<code>Q</code>](#Q)  
**Returns**: <code>number</code> - -1, 0, or 1 as the operand is negative, zero, or positive.  

| Param | Type | Description |
| --- | --- | --- |
| operand | [<code>Rational</code>](#Rational) | The operand. |

<a name="Q.subtract"></a>

### Q.subtract(minuend, subtrahend) ⇒ [<code>Q</code>](#Q)
Returns the difference of the specified minuend and subtrahend.

**Kind**: static method of [<code>Q</code>](#Q)  
**Returns**: [<code>Q</code>](#Q) - The difference.  
**Throws**:

- If the difference cannot be represented as a `Q`, or an intermediate calculation results in
an overflow, an "Arithmetic overflow" error is thrown.


| Param | Type | Description |
| --- | --- | --- |
| minuend | [<code>Rational</code>](#Rational) | The minuend. |
| subtrahend | [<code>Rational</code>](#Rational) | The subtrahend. |

<a name="Q.toString"></a>

### Q.toString(q, [options]) ⇒ <code>string</code>
Returns a string representation of a specified rational.

**Kind**: static method of [<code>Q</code>](#Q)  
**Returns**: <code>string</code> - A string.
In "fraction" mode, if an intermediate calculation results in an overflow, this function
returns the string "(OVERFLOW)".  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| q | [<code>Rational</code>](#Rational) |  | The rational. |
| [options] | <code>object</code> |  | Optional formatting options. |
| [options.mode] | <code>string</code> | <code>&quot;factor&quot;</code> | "factor" for a string representation as product of factors (e.g. "2⋅3²⋅5⁻¹" for 3.6), or "fraction" for a fractional representation (e.g. "18/5"). |

<a name="QuotientAndRemainder"></a>

## QuotientAndRemainder : <code>object</code>
Contains integer quotient and remainder of a division.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| quotient | [<code>Q</code>](#Q) | The quotient. |
| remainder | [<code>Q</code>](#Q) | The remainder. |

<a name="Rational"></a>

## Rational : [<code>Q</code>](#Q) \| <code>number</code>
A number or an instance of a `Q`.

**Kind**: global typedef  
<a name="RoundingMode"></a>

## RoundingMode : <code>string</code>
A string specifying how fractional values are rounded.
- "up" - Rounding away from zero.
- "down" - Rounding towards zero.
- "ceiling" - Rounding towards positive infinity.
- "floor" - Rounding towards negative infinity.
- "half up" -
  Rounding towards the nearest integer, or away from zero if two neighbors are equidistant.
- "half down" -
  Rounding towards the nearest integer, or towards zero if two neighbors are equidistant.
- "half even" -
  Rounding towards the nearest integer, or towards the even neighbor if two neighbors are
  equidistant.

**Kind**: global typedef  
