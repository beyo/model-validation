/*
Validator dependencies
*/
var optUtil = require('../utils/options');
var format = require('util').format;

const DEFAULT_MESSAGE = 'Field `%s` must contain at least %d character(s)';
const DEFAULT_MIN_LENGTH = 3;

/*
Ensure that, if the property value is a string, it's length contains
the minimum amount of characters

Options:

 - {Number}    the minimum length of the string (default 3)
 - {Object}    option object :
                - max {Number}   the minimum length of the string (default 3)
                - message (String)   the invalid / error message (default "Field '%s' must contain at least %d character(s).")

*/
module.exports = function * minLength(propertyName, options, translator) {
  var value = this._data[propertyName];
  var minLen = optUtil.getInteger(options, 'min', DEFAULT_MIN_LENGTH);

  if ((typeof value !== 'string') || (value.length < minLen)) {
    return (options && options.message || format(yield translator(DEFAULT_MESSAGE), propertyName, minLen));
  }
};
