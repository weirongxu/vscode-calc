# vscode-calc

Calculate extension for vscode

[![Build Status](https://travis-ci.com/weirongxu/vscode-calc.svg?branch=master)](https://travis-ci.com/weirongxu/vscode-calc)

## Features

* Support bignumber, use [decimal.js](https://github.com/MikeMcl/decimal.js)
* Suppoort [Mathematics functions](http://mikemcl.github.io/decimal.js/#methods)

![screenshot](https://user-images.githubusercontent.com/1709861/65939023-3987ce80-e457-11e9-8e4b-35a3287b1d8a.gif)

## Usage

1. Input calculate expression
    ```
    sin(PI / 2) =
    ```

## Settings

* `calc.replaceOriginalExpression`, enable relace original expression, default: `false`

## Operators

Precedence is from highest to lowest.

| Operator                              | Example                                     |
|---------------------------------------|---------------------------------------------|
| exponentiation `**`                   | `4 ** 3 ** 2` equivalent to `4 ** (3 ** 2)` |
| unary `+ -`                           | `-2` `+2`                                   |
| multiply / divide / remainder `* / %` | `4 % 3` `4 * 3`                             |
| addition / subtraction                | `.2 - .1` `.1 + .2`                         |

## Mathematics Constant

* `E`
* `PI`

## Mathematics Functions

```
abs, acos, acosh, add, asin,
asinh, atan, atanh, atan2, cbrt
ceil, cos, cosh, div, exp,
floor, hypot, ln, log, log2,
log10, max, min, mod, mul,
pow, random, round, sign, sin,
sinh, sqrt, sub, tan, tanh, trunc
```

Details: http://mikemcl.github.io/decimal.js/#methods

## License

MIT
