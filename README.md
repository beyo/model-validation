# Beyo Model Validation

Data validation for [beyo models](https://github.com/beyo/model).


## Features

* Asynchronous model validation
* Integrates automatically with beyo models


## Install

```
npm install beyo-model-validation --save
```


## Usage

Just require `beyo-model-validation` before defining a new model. Requiring this
module is only needed once; not required when defining subsequent models.

```javascript
var Validation = require('beyo-model-validation').Validation;
var optionsUtils = require('beyo-model-validation').utils.options;
var Model = require('beyo-model');

Validation.define('passwordStrength', function * (model, propertyName, options, translator, next) {
  var allowSpecial = optionsUtil.getBoolean(options, 'allowSpecial', true);
  var allowWhitespace = optionsUtil.getBoolean(options, 'allowWhitespace', false);

  if (/* model._data[propertyName] is valid ? */) {
    return yield next;
  } else {
    return 'Password strength failed';
  }
});

var Foo = Model.define('Foo', {
  'attributes': {
    'id': {
      type: 'int',
      primary: true,
      validation: {
        notEmpty: true,
        unique: true
      }
     },
    'user': {
      type: 'string',
      validation: {
        notEmpty: true,
        email: true
      }
     },
    'pass': {
      type: 'string',
      validation: {
        notEmpty: true,
        minLength: 6,
        maxLength: 24,
        passwordStrength: ['lowercase', 'uppercase', 'digit', 'special']
      }
     },
    'active': {
      type: 'boolean',
      default: true
    }
  }
});

var foo = new Foo({ id: 1, user: 'Bob', pass: '1234' });

console.log(yield foo.validate());
// { "user": "Invalid email address",
//   "pass": "String must contain at least 6 characters"
// }
```

**NOTE**: the order of the declared validation chain is important; validators
will be executed in the same order.

**NOTE**: `model.validate()` returns `false` if all validation passes. This is to
facilitate checks like `var errors = model.validate(); if (errors) { ... }`.


## Available validators

* **blacklist** : the field's value must *not* be one of the specified disallowed values.
* **decimal** : the field's value must be decimal (numeric, not **integer**).
* **integer** : the field's value must be an integer (numeric, not **decimal**).
* **hasValue** : the field must contain a value (must not be `null` or `undefined`)
* **match** : the field's value must match the given regular expression.
* **maxLength** : the string-type field's value must not contain more characters than the given value.
* **minLength** : the string-type field's value must not contain less characters than the given value.
* **number** : the field's value must be a valid number (may be **integer** or **decimal**).
* **required** : the field is defined with *any* value.
* **unique** : the field's value is unique in the dataset. This validation is async and query the database schema.
* **whitelist** : the field's value must be one of the specified allowed values.


### TODO Validators

Any help welcome! See [contribution](#contribution)!

* **after** : *(TODO)* the date-type field's value must be after the given date.
* **alpha** : *(TODO)* the field's value must contain only alphabetical characters (a-z).
* **alphanumeric** : *(TODO)* the field's value must contains only alphanumerical characters (a-z0-9).
* **array** : *(TODO)* the field's value must be an array.
* **before** : *(TODO)* the date-type field's value must be before the given date.
* **boolean** : *(TODO)* the field's value must be boolean.
* **contains** : *(TODO)* the field's value must contain the given string.
* **creditcard** : *(TODO)* the field's value is a valid credit card number.
* **date** : *(TODO)* the field's value must be a date.
* **email** : *(TODO)* the field's value must be a valid email address.
* **empty** : *(TODO)* the field's value msut be empty (i.e. `0`, `""`, `[]`, or `{}`)
* **equals** : *(TODO)* the field's value must equal the given value (using double equality `==`).
* **falsey** : *(TODO)* the negation of **truthy**.
* **hexadecimal** : *(TODO)* the field's value is a valid hexadecimal number.
* **hexColor** : *(TODO)* the field's value is a valid hexadecimal color.
* **ip** : *(TODO)* the field's value must be a valid IP (may be an integer or a string).
* **ipv4** : *(TODO)* the field's value must be a valid IPv4 (may be an integer or a string).
* **ipv6** : *(TODO)* the field's value must be a valid IPv6 (may be an integer or a string).
* **is** : *(TODO)* the field's value must be the given value (using a triple equality `===`).
* **isbn** : *(TODO)* the field's value must be a valid ISBN.
* **len** : *(TODO)* the array-type field's value must contain the given number of elements.
* **lowercase** : *(TODO)* the field's value must be a lowercased string.
* **max** : *(TODO)* the field's value must not be greater than the given value.
* **min** : *(TODO)* the field's value must not be less than the given value.
* **not** : *(TODO)* the negation of **is**.
* **notContains** : *(TODO)* the negation of **contains**.
* **notEmpty** : *(TODO)* the negation of **empty**.
* **notEquals** : *(TODO)* the negation of **equals**.
* **notInteger** : *(TODO)* the negation of **integer**.
* **notNull** : *(TODO)* the negation of **null**.
* **notRegex** : *(TODO)* the negation of **regex**.
* **null** : *(TODO)* the field's value must be `null`.
* **regexp** : *(TODO)* the field's value must be a regular expression string, or `RegExp` object.
* **string** : *(TODO)* the field's value must be a string.
* **truthy** : *(TODO)* the field's value must evaluate to `true` (double equality `==`).
* **undefined** : *(TODO)* the field's value is equal to `undefined`.
* **uppercase** : *(TODO)* the negation of **lowercase**.
* **url** : *(TODO)* the field's value is a valid URL.
* **uuid** : *(TODO)* the field's value is a valid UUID (v3 or v4).
* **uuidv3** : *(TODO)* the field's value is a valid UUIDv3.
* **uuidv4** : *(TODO)* the field's value is a valid UUIDv4.


## Contribution

All contributions welcome! Every PR **must** be accompanied by their associated
unit tests!


## License

The MIT License (MIT)

Copyright (c) 2014 Mind2Soft <yanick.rochon@mind2soft.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
