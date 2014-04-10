/*
Validator dependencies
*/
var optUtil = require('../utils/options');
var format = require('util').format;

const DEFAULT_MESSAGE = 'Invalid value for field `%s`';
/*
Use strict comparison '===' when checking identity (true), or loose comparison '==' (false)
*/
const DEFAULT_STRICT_COMPARE = true;
/*
Ignore case when comparing strings
*/
const DEFAULT_IGNORE_CASE = false;

/*
Ensure that the given property exists in the given possible values.

Options:

 - {Array}    define the restricted values (see defaults)
 - {Object}   option object :
               - values {Array}           the array of restricted values
               - strictCompare {boolean}  if values should be compared in a strict way ('===') or not ('==') (default true)
               - ignoreCase {boolean}     compare strings ignoring cases (default false)
               - message (String)         the invalid / error message (default "Invalid value for field '%s'")

*/
module.exports = function * blacklist(model, propertyName, options, translator, next) {
  var restrictedValues = optUtil.getArray(options, 'values');
  var strictCompare    = optUtil.getBoolean(options, 'strictCompare', DEFAULT_STRICT_COMPARE);
  var ignoreCase       = optUtil.getBoolean(options, 'ignoreCase', DEFAULT_IGNORE_CASE);
  var value;
  var valueIsString;
  var valid = true;
  var i;
  var ilen;

  if (restrictedValues && restrictedValues.length) {
    value = model._data[propertyName];
    valueIsString = (typeof value === 'string');

    if (ignoreCase && valueIsString) {
      value = value.toLocaleLowerCase();

      if (strictCompare) {
        for (i = 0, ilen = restrictedValues.length; i < ilen && valid; ++i) {
          if (typeof restrictedValues[i] === 'string' && value === restrictedValues[i].toLocaleLowerCase()) {
            valid = false;
          }
        }
      } else {
        for (i = 0, ilen = restrictedValues.length; i < ilen && valid; ++i) {
          if (typeof restrictedValues[i] === 'string' && value == restrictedValues[i].toLocaleLowerCase() || value == restrictedValues[i]) {
            valid = false;
          }
        }
      }
    } else {
      if (strictCompare) {
        for (i = 0, ilen = restrictedValues.length; i < ilen && valid; ++i) {
          if (value === restrictedValues[i]) valid = false;
        }
      } else {
        for (i = 0, ilen = restrictedValues.length; i < ilen && valid; ++i) {
          if (value == restrictedValues[i]) valid = false;
        }
      }
    }

    if (!valid) {
      return (options && options.message || format(yield translator(DEFAULT_MESSAGE), propertyName));
    }
  }

  return yield next;
};
