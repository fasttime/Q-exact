Q-exact
=======

A library to make exact calculations with [rational numbers](http://mathworld.wolfram.com/RationalNumber.html) without rounding errors.

Compare this:

`1 / 49 * 49` ▶ `0.9999999999999999`

with this:

`Q(1).over(49).times(49)` ▶ `1`

Q-exact overcomes some of the classic limitations of [floating-point arithmetic](http://mathworld.wolfram.com/Floating-PointArithmetic.html) by requiring that all results be expressed exactly, or not at all.
Rational numbers in Q-exact are stored as products of prime factors.
For example, `-75/28` is represented as `-2⁻²⋅3⋅5²⋅7⁻¹`.
There is no way to represent [irrational numbers](http://mathworld.wolfram.com/IrrationalNumber.html), `Infinity` or `NaN`.

See the [**Q Class Reference**](Q-exact.md) for further informations.

*This is a preliminary documentation and may be subject to change at any time.*
