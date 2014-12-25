<a name="Q"></a>
#class: Q
Represents a rational number. All operations involving `Q`s are *exact*, unless explicitly noted
otherwise.

**Members**

* [class: Q](#Q)
  * [new Q(value)](#new_Q)
  * [q.add(addend)](#Q#add)
  * [Q.add([...addends])](#Q.add)
  * [Q.compare(comparand1, comparand2)](#Q.compare)
  * [q.compareTo(comparand)](#Q#compareTo)
  * [q.divide(divisor)](#Q#divide)
  * [Q.divide(divisor, dividend)](#Q.divide)
  * [q.equals(comparand)](#Q#equals)
  * [Q.equals([...comparands])](#Q.equals)
  * [q.invert()](#Q#invert)
  * [Q.invert(operand)](#Q.invert)
  * [q.minus(subtrahend)](#Q#minus)
  * [q.multiply(factor)](#Q#multiply)
  * [Q.multiply([...factors])](#Q.multiply)
  * [q.negate()](#Q#negate)
  * [Q.negate(operand)](#Q.negate)
  * [q.over(divisor)](#Q#over)
  * [q.pow(exp)](#Q#pow)
  * [Q.pow(base, exp)](#Q.pow)
  * [q.plus(addend)](#Q#plus)
  * [q.sign()](#Q#sign)
  * [Q.sign(operand)](#Q.sign)
  * [q.subtract(subtrahend)](#Q#subtract)
  * [Q.subtract(minuend, subtrahend)](#Q.subtract)
  * [q.times(factor)](#Q#times)
  * [q.toString()](#Q#toString)
  * [Q.toString(q)](#Q.toString)
  * [q.valueOf()](#Q#valueOf)
  * [const: Q.MAX_EXP](#Q.MAX_EXP)
  * [const: Q.MAX_PRIME](#Q.MAX_PRIME)
  * [const: Q.MIN_EXP](#Q.MIN_EXP)

<a name="new_Q"></a>
##new Q(value)
Creates a new instance of `Q` with a specified value.
The constructor can be used with or without the `new` operator, e.g. `new Q(2.5)` or `Q(2.5)`.

**Params**

- value  - The numeric value of the object being created.

**Errors**

The constructor throws an "Invalid argument" error if the argument cannot be converted to a
finite numeric value.  

<a name="Q#add"></a>
##q.add(addend)
**Params**

- addend <code>[Q](#Q)</code> - Rational to add to `this`.  

**Returns**: [Q](#Q) - The sum.  
<a name="Q.add"></a>
##Q.add([...addends])
**Params**

- \[...addends\] <code>[Q](#Q)</code> - Optional rationals to add.  

**Returns**: [Q](#Q) - The sum.  
<a name="Q.compare"></a>
##Q.compare(comparand1, comparand2)
**Params**

- comparand1 <code>[Q](#Q)</code> - First rational to be compared.  
- comparand2 <code>[Q](#Q)</code> - Second rational to be compared.  

**Returns**: `number` - -1, 0, or 1 as the first comparand is less than, equal to, or greater than the second
comparand.  
<a name="Q#compareTo"></a>
##q.compareTo(comparand)
**Params**

- comparand <code>[Q](#Q)</code>  

**Returns**: `number` - -1, 0, or 1 as `this` is less than, equal to, or greater than the comparand.  
<a name="Q#divide"></a>
##q.divide(divisor)
Divides `this` by a specified quantity.

**Params**

- divisor <code>[Q](#Q)</code>  

**Returns**: [Q](#Q) - The quotient.  
<a name="Q.divide"></a>
##Q.divide(divisor, dividend)
**Params**

- divisor <code>[Q](#Q)</code>  
- dividend <code>[Q](#Q)</code>  

**Returns**: [Q](#Q) - The quotient.  
<a name="Q#equals"></a>
##q.equals(comparand)
**Params**

- comparand <code>[Q](#Q)</code> - Rational to compare for equality with `this`.  

**Returns**: `boolean` - `true` if `this` and the comparand are equal; otherwise, false.  
<a name="Q.equals"></a>
##Q.equals([...comparands])
**Params**

- \[...comparands\] <code>[Q](#Q)</code> - Optional rationals to compare for equality.  

**Returns**: `boolean` - `true` if all comparands are equal; otherwise, false.  
<a name="Q#invert"></a>
##q.invert()
**Returns**: [Q](#Q) - The reciprocal of `this`.  
<a name="Q.invert"></a>
##Q.invert(operand)
**Params**

- operand <code>[Q](#Q)</code>  

**Returns**: [Q](#Q) - The reciprocal of the operand.  
<a name="Q#minus"></a>
##q.minus(subtrahend)
A synonym of [subtract](#Q#subtract).

**Params**

- subtrahend <code>[Q](#Q)</code>  

**Returns**: [Q](#Q) - The difference.  
<a name="Q#multiply"></a>
##q.multiply(factor)
**Params**

- factor <code>[Q](#Q)</code> - Rational to multiply by `this`.  

**Returns**: [Q](#Q) - The product.  
<a name="Q.multiply"></a>
##Q.multiply([...factors])
**Params**

- \[...factors\] <code>[Q](#Q)</code> - Optional rationals to multiply.  

**Returns**: [Q](#Q) - The product.  
<a name="Q#negate"></a>
##q.negate()
**Returns**: [Q](#Q) - The additive inverse of `this`.  
<a name="Q.negate"></a>
##Q.negate(operand)
**Params**

- operand <code>[Q](#Q)</code>  

**Returns**: [Q](#Q) - The additive inverse of the operand.  
<a name="Q#over"></a>
##q.over(divisor)
A synonym of [divide](#Q#divide).

**Params**

- divisor <code>[Q](#Q)</code>  

**Returns**: [Q](#Q) - The quotient.  
<a name="Q#pow"></a>
##q.pow(exp)
**Params**

- exp <code>[Q](#Q)</code> - The exponent.  

**Returns**: [Q](#Q) - `this` raised to the power of the exponent.  
<a name="Q.pow"></a>
##Q.pow(base, exp)
**Params**

- base <code>[Q](#Q)</code> - The base.  
- exp <code>[Q](#Q)</code> - The exponent.  

**Returns**: [Q](#Q) - The base raised to the power of the exponent.  
<a name="Q#plus"></a>
##q.plus(addend)
A synonym of [add](#Q#add).

**Params**

- addend <code>[Q](#Q)</code> - Rational to add to `this`.  

**Returns**: [Q](#Q) - The sum.  
<a name="Q#sign"></a>
##q.sign()
**Returns**: [Q](#Q) - -1, 0, or 1 as `this` is negative, zero, or positive.  
<a name="Q.sign"></a>
##Q.sign(operand)
**Params**

- operand <code>[Q](#Q)</code>  

**Returns**: [Q](#Q) - -1, 0, or 1 as the operand is negative, zero, or positive.  
<a name="Q#subtract"></a>
##q.subtract(subtrahend)
**Params**

- subtrahend <code>[Q](#Q)</code>  

**Returns**: [Q](#Q) - The difference.  
<a name="Q.subtract"></a>
##Q.subtract(minuend, subtrahend)
**Params**

- minuend <code>[Q](#Q)</code>  
- subtrahend <code>[Q](#Q)</code>  

**Returns**: [Q](#Q) - The difference.  
<a name="Q#times"></a>
##q.times(factor)
A synonym of [multiply](#Q#multiply).

**Params**

- factor <code>[Q](#Q)</code> - Rational to multiply by `this`.  

**Returns**: [Q](#Q) - The product.  
<a name="Q#toString"></a>
##q.toString()
**Returns**:  - A string representation of `this`.  
<a name="Q.toString"></a>
##Q.toString(q)
**Params**

- q <code>[Q](#Q)</code>  

**Returns**:  - A string representation of the argument.  
<a name="Q#valueOf"></a>
##q.valueOf()
Returns a numeric representation of this rational.

The number returned by this function is subject to rounding: the result is *not exact*.
Rationals with very large absolute value will be rounded to positive or negative infinity,
and very small rationals will be rounded to 0.

**Returns**:  - A numeric representation of `this`.  
<a name="Q.MAX_EXP"></a>
##const: Q.MAX_EXP
The maximum exponent for a prime factor.

Rationals whose prime factorization contains an exponent greater than this number cannot be
represented.

An attempt to instanciate such a number will typically result in an "Arithmetic overflow"
error.

**Type**: `number`  
<a name="Q.MAX_PRIME"></a>
##const: Q.MAX_PRIME
The largest exponent for a prime factor.

Rationals whose prime factorization contains a prime larger than this number cannot be
represented.

An attempt to instanciate such a number will typically result in an "Arithmetic overflow"
error.

**Type**: `number`  
<a name="Q.MIN_EXP"></a>
##const: Q.MIN_EXP
The minimum exponent for a prime factor.

Rationals whose prime factorization contains an exponent less than this number cannot be
represented.

An attempt to instanciate such a number will typically result in an "Arithmetic overflow"
error.

**Type**: `number`  
