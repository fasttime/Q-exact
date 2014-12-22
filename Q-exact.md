<a name="Q"></a>
#class: Q
**Members**

* [class: Q](#Q)
  * [q.add(addend)](#Q#add)
  * [Q.add([...addends])](#Q.add)
  * [q.divide(divisor)](#Q#divide)
  * [Q.divide(divisor, dividend)](#Q.divide)
  * [q.equals(comparand)](#Q#equals)
  * [Q.equals([...comparands])](#Q.equals)
  * [q.minus(subtrahend)](#Q#minus)
  * [q.multiply(factor)](#Q#multiply)
  * [Q.multiply([...factors])](#Q.multiply)
  * [q.negate()](#Q#negate)
  * [Q.negate(operand)](#Q.negate)
  * [q.over(divisor)](#Q#over)
  * [q.plus(addend)](#Q#plus)
  * [q.subtract(subtrahend)](#Q#subtract)
  * [Q.subtract(minuend, subtrahend)](#Q.subtract)
  * [q.times(factor)](#Q#times)
  * [const: Q.MAX_EXP](#Q.MAX_EXP)
  * [const: Q.MAX_PRIME](#Q.MAX_PRIME)
  * [const: Q.MIN_EXP](#Q.MIN_EXP)

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

**Returns**: `boolean` - `true` if the comparand is equal.  
<a name="Q.equals"></a>
##Q.equals([...comparands])
**Params**

- \[...comparands\] <code>[Q](#Q)</code> - Optional rationals to compare for equality.  

**Returns**: `boolean` - `true` if all comparands are equal.  
<a name="Q#minus"></a>
##q.minus(subtrahend)
Asynonym of [subtract](#Q#subtract).

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
<a name="Q#plus"></a>
##q.plus(addend)
A synonym of [add](#Q#add).

**Params**

- addend <code>[Q](#Q)</code> - Rational to add to `this`.  

**Returns**: [Q](#Q) - The sum.  
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
