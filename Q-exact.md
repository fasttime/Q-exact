#Index

**Classes**

* [class: Q](#Q)
  * [new Q(value)](#new_Q)
  * [q.abs()](#Q#abs)
  * [Q.abs(operand)](#Q.abs)
  * [q.add(addend)](#Q#add)
  * [Q.add([...addends])](#Q.add)
  * [Q.compare(comparand1, comparand2)](#Q.compare)
  * [q.compareTo(comparand)](#Q#compareTo)
  * [q.divide(divisor)](#Q#divide)
  * [Q.divide(dividend, divisor)](#Q.divide)
  * [q.divideAndRemainder(dividend, divisor)](#Q#divideAndRemainder)
  * [Q.divideAndRemainder(dividend, divisor)](#Q.divideAndRemainder)
  * [q.equals(comparand)](#Q#equals)
  * [Q.equals([...comparands])](#Q.equals)
  * [q.invert()](#Q#invert)
  * [Q.invert(operand)](#Q.invert)
  * [q.isInteger()](#Q#isInteger)
  * [Q.isInteger(operand)](#Q.isInteger)
  * [q.isPrime()](#Q#isPrime)
  * [Q.isPrime(operand)](#Q.isPrime)
  * [q.minus(subtrahend)](#Q#minus)
  * [q.multiply(factor)](#Q#multiply)
  * [Q.multiply([...factors])](#Q.multiply)
  * [q.negate()](#Q#negate)
  * [Q.negate(operand)](#Q.negate)
  * [q.over(divisor)](#Q#over)
  * [q.plus(addend)](#Q#plus)
  * [q.pow(exp)](#Q#pow)
  * [Q.pow(base, exp)](#Q.pow)
  * [q.round([mode])](#Q#round)
  * [Q.round(operand, [mode])](#Q.round)
  * [q.sign()](#Q#sign)
  * [Q.sign(operand)](#Q.sign)
  * [q.subtract(subtrahend)](#Q#subtract)
  * [Q.subtract(minuend, subtrahend)](#Q.subtract)
  * [q.times(factor)](#Q#times)
  * [q.toString([options])](#Q#toString)
  * [Q.toString(q, [options])](#Q.toString)
  * [q.valueOf()](#Q#valueOf)
  * [const: Q.MAX_EXP](#Q.MAX_EXP)
  * [const: Q.MAX_PRIME](#Q.MAX_PRIME)
  * [const: Q.MIN_EXP](#Q.MIN_EXP)

**Typedefs**

* [type: QuotientAndRemainder](#QuotientAndRemainder)
* [type: Rational](#Rational)
* [type: RoundingMode](#RoundingMode)
 
<a name="Q"></a>
#class: Q
Represents a rational number.
All operations involving `Q`s are *exact*, unless explicitly noted otherwise.
The numeric value of a `Q` is immutable.

**Members**

* [class: Q](#Q)
  * [new Q(value)](#new_Q)
  * [q.abs()](#Q#abs)
  * [Q.abs(operand)](#Q.abs)
  * [q.add(addend)](#Q#add)
  * [Q.add([...addends])](#Q.add)
  * [Q.compare(comparand1, comparand2)](#Q.compare)
  * [q.compareTo(comparand)](#Q#compareTo)
  * [q.divide(divisor)](#Q#divide)
  * [Q.divide(dividend, divisor)](#Q.divide)
  * [q.divideAndRemainder(dividend, divisor)](#Q#divideAndRemainder)
  * [Q.divideAndRemainder(dividend, divisor)](#Q.divideAndRemainder)
  * [q.equals(comparand)](#Q#equals)
  * [Q.equals([...comparands])](#Q.equals)
  * [q.invert()](#Q#invert)
  * [Q.invert(operand)](#Q.invert)
  * [q.isInteger()](#Q#isInteger)
  * [Q.isInteger(operand)](#Q.isInteger)
  * [q.isPrime()](#Q#isPrime)
  * [Q.isPrime(operand)](#Q.isPrime)
  * [q.minus(subtrahend)](#Q#minus)
  * [q.multiply(factor)](#Q#multiply)
  * [Q.multiply([...factors])](#Q.multiply)
  * [q.negate()](#Q#negate)
  * [Q.negate(operand)](#Q.negate)
  * [q.over(divisor)](#Q#over)
  * [q.plus(addend)](#Q#plus)
  * [q.pow(exp)](#Q#pow)
  * [Q.pow(base, exp)](#Q.pow)
  * [q.round([mode])](#Q#round)
  * [Q.round(operand, [mode])](#Q.round)
  * [q.sign()](#Q#sign)
  * [Q.sign(operand)](#Q.sign)
  * [q.subtract(subtrahend)](#Q#subtract)
  * [Q.subtract(minuend, subtrahend)](#Q.subtract)
  * [q.times(factor)](#Q#times)
  * [q.toString([options])](#Q#toString)
  * [Q.toString(q, [options])](#Q.toString)
  * [q.valueOf()](#Q#valueOf)
  * [const: Q.MAX_EXP](#Q.MAX_EXP)
  * [const: Q.MAX_PRIME](#Q.MAX_PRIME)
  * [const: Q.MIN_EXP](#Q.MIN_EXP)

<a name="new_Q"></a>
##new Q(value)
Creates a new instance of a `Q` with a specified value.
The constructor can be used with or without the `new` operator, e.g. `new Q(2.5)` or
`Q(2.5)`.

All fractions with integer numerator up to 4000 and integer denominator up to 50 can be
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

**Params**

- value `number` - The numeric value of the object being created.  

<a name="Q#abs"></a>
##q.abs()
Returns the absolute value of this rational.

**Returns**: [Q](#Q) - The absolute value.  
<a name="Q.abs"></a>
##Q.abs(operand)
Returns the absolute value of a specified operand.

**Params**

- operand <code>[Rational](#Rational)</code> - The operand.  

**Returns**: [Q](#Q) - The absolute value.  
<a name="Q#add"></a>
##q.add(addend)
Returns the sum of this rational and a specified addend.

**Params**

- addend <code>[Rational](#Rational)</code> - The addend.  

**Returns**: [Q](#Q) - The sum.  
<a name="Q.add"></a>
##Q.add([...addends])
Returns the sum of the specified addends.

**Params**

- \[...addends\] <code>[Rational](#Rational)</code> - Optional addends.  

**Returns**: [Q](#Q) - The sum.
If this function is called without arguments, the return value is 0.  
<a name="Q.compare"></a>
##Q.compare(comparand1, comparand2)
Compares two specified comparands for order.

**Params**

- comparand1 <code>[Rational](#Rational)</code> - The first comparand.  
- comparand2 <code>[Rational](#Rational)</code> - The second comparand.  

**Returns**: `number` - -1, 0, or 1 as the first comparand is less than, equal to, or greater than the second
comparand.  
<a name="Q#compareTo"></a>
##q.compareTo(comparand)
Compares this rational and a specified comparand for order.

**Params**

- comparand <code>[Rational](#Rational)</code> - The comparand.  

**Returns**: `number` - -1, 0, or 1 as this rational is less than, equal to, or greater than the comparand.  
<a name="Q#divide"></a>
##q.divide(divisor)
Divides a this rational by a specified divisor, returning the exact quotient.

**Params**

- divisor <code>[Rational](#Rational)</code> - The divisor.  

**Returns**: [Q](#Q) - The quotient.  
<a name="Q.divide"></a>
##Q.divide(dividend, divisor)
Divides a specified dividend by a specified divisor, returning the exact quotient.

**Params**

- dividend <code>[Rational](#Rational)</code> - The dividend.  
- divisor <code>[Rational](#Rational)</code> - The divisor.  

**Returns**: [Q](#Q) - The quotient.  
<a name="Q#divideAndRemainder"></a>
##q.divideAndRemainder(dividend, divisor)
Divides this rational by a specified divisor, returning integer quotient and remainder.

**Params**

- dividend <code>[Rational](#Rational)</code> - The dividend.  
- divisor <code>[Rational](#Rational)</code> - The divisor.  

**Returns**: [QuotientAndRemainder](#QuotientAndRemainder) - Integer quotient and remainder.  
<a name="Q.divideAndRemainder"></a>
##Q.divideAndRemainder(dividend, divisor)
Divides a specified dividend by a specified divisor, returning integer quotient and
remainder.

**Params**

- dividend <code>[Rational](#Rational)</code> - The dividend.  
- divisor <code>[Rational](#Rational)</code> - The divisor.  

**Returns**: [QuotientAndRemainder](#QuotientAndRemainder) - Integer quotient and remainder.  
<a name="Q#equals"></a>
##q.equals(comparand)
Compares this rational and a specified comparand for equality.

**Params**

- comparand <code>[Rational](#Rational)</code> - The comparand.  

**Returns**: `boolean` - `true` if this rational and the comparand are equal; otherwise, `false`.  
<a name="Q.equals"></a>
##Q.equals([...comparands])
Compares the specified comparands for equality.

**Params**

- \[...comparands\] <code>[Rational](#Rational)</code> - Optional comparands.  

**Returns**: `boolean` - `true` if all comparands are equal; otherwise, `false`.
If this function is called with one or no arguments, the return value is `true`.  
<a name="Q#invert"></a>
##q.invert()
Returns the reciprocal of this rational.

**Returns**: [Q](#Q) - The reciprocal.  
<a name="Q.invert"></a>
##Q.invert(operand)
Returns the reciprocal of a specified operand.

**Params**

- operand <code>[Rational](#Rational)</code> - The operand.  

**Returns**: [Q](#Q) - The reciprocal.  
<a name="Q#isInteger"></a>
##q.isInteger()
Determines whether this rational is integer.

**Returns**: `boolean` - `true` if this rational is integer; otherwise, `false`.  
<a name="Q.isInteger"></a>
##Q.isInteger(operand)
Determines whether a specified operand is integer.

**Params**

- operand <code>[Rational](#Rational)</code> - The operand.  

**Returns**: `boolean` - `true` if the operand is integer; otherwise, `false`.  
<a name="Q#isPrime"></a>
##q.isPrime()
Determines whether this rational is a prime number.

**Returns**: `boolean` - `true` if this rational is a prime number; otherwise, `false`.  
<a name="Q.isPrime"></a>
##Q.isPrime(operand)
Determines whether a specified operand is a prime number.

**Params**

- operand <code>[Rational](#Rational)</code> - The operand.  

**Returns**: `boolean` - `true` if the operand is a prime number; otherwise, `false`.  
<a name="Q#minus"></a>
##q.minus(subtrahend)
A synonym of [subtract](#Q#subtract).

**Params**

- subtrahend   

<a name="Q#multiply"></a>
##q.multiply(factor)
Returns the product of this rational and a specified factor.

**Params**

- factor <code>[Rational](#Rational)</code> - The factor.  

**Returns**: [Q](#Q) - The product.  
<a name="Q.multiply"></a>
##Q.multiply([...factors])
Returns the product of the specified factors.

**Params**

- \[...factors\] <code>[Rational](#Rational)</code> - Optional factors.  

**Returns**: [Q](#Q) - The product.
If this function is called without arguments, the return value is 1.  
<a name="Q#negate"></a>
##q.negate()
Returns the additive inverse of this rational.

**Returns**: [Q](#Q) - The additive inverse.  
<a name="Q.negate"></a>
##Q.negate(operand)
Returns the additive inverse of a specified operand.

**Params**

- operand <code>[Rational](#Rational)</code> - The operand.  

**Returns**: [Q](#Q) - The additive inverse.  
<a name="Q#over"></a>
##q.over(divisor)
A synonym of [divide](#Q#divide).

**Params**

- divisor   

<a name="Q#plus"></a>
##q.plus(addend)
A synonym of [add](#Q#add).

**Params**

- addend   

<a name="Q#pow"></a>
##q.pow(exp)
Returns this rational raised to the power of a specified exponent.

**Params**

- exp <code>[Rational](#Rational)</code> - The exponent.  

**Returns**: [Q](#Q) - The result of the exponentiation.  
<a name="Q.pow"></a>
##Q.pow(base, exp)
Returns a specified base raised to the power of a specified exponent.

**Params**

- base <code>[Rational](#Rational)</code> - The base.  
- exp <code>[Rational](#Rational)</code> - The exponent.  

**Returns**: [Q](#Q) - The result of the exponentiation.  
<a name="Q#round"></a>
##q.round([mode])
Rounds this rational to an integer.

**Params**

- \[mode="half even"\] <code>[RoundingMode](#RoundingMode)</code>  

**Returns**: [Q](#Q) - The rounding result.  
<a name="Q.round"></a>
##Q.round(operand, [mode])
Rounds a specified operand to an integer.

**Params**

- operand <code>[Rational](#Rational)</code> - The operand.  
- \[mode="half even"\] <code>[RoundingMode](#RoundingMode)</code>  

**Returns**: [Q](#Q) - The rounding result.  
<a name="Q#sign"></a>
##q.sign()
Returns the sign of this rational.

**Returns**: `number` - -1, 0, or 1 as this rational is negative, zero, or positive.  
<a name="Q.sign"></a>
##Q.sign(operand)
Returns the sign of a specified operand.

**Params**

- operand <code>[Rational](#Rational)</code> - The operand.  

**Returns**: `number` - -1, 0, or 1 as the operand is negative, zero, or positive.  
<a name="Q#subtract"></a>
##q.subtract(subtrahend)
Returns the difference of this rational and a specified subtrahend.

**Params**

- subtrahend <code>[Rational](#Rational)</code> - The subtrahend.  

**Returns**: [Q](#Q) - The difference.  
<a name="Q.subtract"></a>
##Q.subtract(minuend, subtrahend)
Returns the difference of the specified minuend and subtrahend.

**Params**

- minuend <code>[Rational](#Rational)</code> - The minuend.  
- subtrahend <code>[Rational](#Rational)</code> - The subtrahend.  

**Returns**: [Q](#Q) - The difference.  
<a name="Q#times"></a>
##q.times(factor)
A synonym of [multiply](#Q#multiply).

**Params**

- factor   

<a name="Q#toString"></a>
##q.toString([options])
Returns a string representation of this rational.

**Params**

- \[options\] `object` - Optional formatting options.  
  - \[mode="factor"\] `string` - "factor" for a string representation as product of factors (e.g. "2⋅3²⋅5⁻¹" for 3.6), or
"fraction" for a fractional representation (e.g. "18/5").  

**Returns**: `string` - A string.
In "fraction" mode, if an intermediate calculation results in an overflow, this function
returns the string "(OVERFLOW)".  
<a name="Q.toString"></a>
##Q.toString(q, [options])
Returns a string representation of a specified rational.

**Params**

- q <code>[Rational](#Rational)</code> - The rational.  
- \[options\] `object` - Optional formatting options.  
  - \[mode="factor"\] `string` - "factor" for a string representation as product of factors (e.g. "2⋅3²⋅5⁻¹" for 3.6), or
"fraction" for a fractional representation (e.g. "18/5").  

**Returns**: `string` - A string.
In "fraction" mode, if an intermediate calculation results in an overflow, this function
returns the string "(OVERFLOW)".  
<a name="Q#valueOf"></a>
##q.valueOf()
Returns a numeric representation of this rational.

The number returned by this function is subject to rounding: the result is *not exact*.
Rationals with very large absolute value are represented as ±infinity, and very small
rationals are rounded to ±0.

**Returns**: `number` - A number.  
<a name="Q.MAX_EXP"></a>
##const: Q.MAX_EXP
The maximum exponent for a prime factor.

Rationals whose prime factorization contains an exponent greater than this number cannot be
represented.

An attempt to instantiate such a number will typically result in an "Arithmetic overflow"
error.

**Type**: `number`  
<a name="Q.MAX_PRIME"></a>
##const: Q.MAX_PRIME
The largest exponent for a prime factor.

Rationals whose prime factorization contains a prime larger than this number cannot be
represented.

An attempt to instantiate such a number will typically result in an "Arithmetic overflow"
error.

**Type**: `number`  
<a name="Q.MIN_EXP"></a>
##const: Q.MIN_EXP
The minimum exponent for a prime factor.

Rationals whose prime factorization contains an exponent less than this number cannot be
represented.

An attempt to instantiate such a number will typically result in an "Arithmetic overflow"
error.

**Type**: `number`  
<a name="QuotientAndRemainder"></a>
#type: QuotientAndRemainder
Contains integer quotient and remainder of a division.

**Properties**

- quotient <code>[Q](#Q)</code> - The quotient.  
- remainder <code>[Q](#Q)</code> - The remainder.  

**Type**: `object`  
<a name="Rational"></a>
#type: Rational
A number or an instance of a `Q`.

**Type**: [Q](#Q) | `number`  
<a name="RoundingMode"></a>
#type: RoundingMode
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

**Type**: `string`  
