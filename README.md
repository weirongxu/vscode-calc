# vscode-calc

<p align="center">
  <img src="https://github.com/weirongxu/vscode-calc/raw/master/logo/calc-logo.png" alt="vscode-calc" width="200">
  <br>
  <a href="https://github.com/weirongxu/vscode-calc/actions?query=workflow%3Aci">
    <img src="https://img.shields.io/github/workflow/status/weirongxu/vscode-calc/ci" alt="Build Status">
  </a>
  <br>
  Calculate extension for vscode
</p>

## Features

- Support underscores in numbers `10_000_000`
- Support bignumber, use [decimal.js](https://github.com/MikeMcl/decimal.js)
- Support [Mathematics functions](http://mikemcl.github.io/decimal.js/#methods)

![screenshot](https://user-images.githubusercontent.com/1709861/65939023-3987ce80-e457-11e9-8e4b-35a3287b1d8a.gif)

## Usage

1. Input calculate expression
   ```
   sin(PI / 2) =
   ```

## Operators

Precedence is from highest to lowest.

| Operator                              | Example                                     |
| ------------------------------------- | ------------------------------------------- |
| exponentiation `**`                   | `4 ** 3 ** 2` equivalent to `4 ** (3 ** 2)` |
| unary `+ -`                           | `-2` `+2`                                   |
| multiply / divide / remainder `* / %` | `4 % 3` `4 * 3`                             |
| addition / subtraction                | `.2 - .1` `.1 + .2`                         |

## Mathematics Constant

- `E`
- `PI`

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
