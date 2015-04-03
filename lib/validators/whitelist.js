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

 - {Array}    define the allowed values (see defaults)
 - {Object}   option object :
               - values {Array}           the array of restricted values
               - strictCompare {boolean}  if values should be compared in a strict way ('===') or not ('==') (default true)
               - ignoreCase {boolean}     compare strings ignoring cases (default false)
               - message (String)         the invalid / error message (default "Invalid value for field '%s'")

*/
module.exports = function * blacklist(propertyName, options, translator) {
  var possibleValues = optUtil.getArray(options, 'values');
  var strictCompare  = optUtil.getBoolean(options, 'strictCompare', DEFAULT_STRICT_COMPARE);
  var ignoreCase     = optUtil.getBoolean(options, 'ignoreCase', DEFAULT_IGNORE_CASE);
  var value;
  var valueIsString;
  var invalid = true;
  var i;
  var ilen;

  if (possibleValues && possibleValues.length) {
    value = this._data[propertyName];
    valueIsString = (typeof value === 'string');

    if (ignoreCase && valueIsString) {
      value = value.toLocaleLowerCase();

      if (strictCompare) {
        for (i = 0, ilen = possibleValues.length; i < ilen && invalid; ++i) {
          if (typeof possibleValues[i] === 'string' && value === possibleValues[i].toLocaleLowerCase()) invalid = false;
        }
      } else {
        for (i = 0, ilen = possibleValues.length; i < ilen && invalid; ++i) {
          if (typeof possibleValues[i] === 'string' && value == possibleValues[i].toLocaleLowerCase() || value == possibleValues[i]) invalid = false;
        }
      }
    } else {
      if (strictCompare) {
        for (i = 0, ilen = possibleValues.length; i < ilen && invalid; ++i) {
          if (value === possibleValues[i]) invalid = false;
        }
      } else {
        for (i = 0, ilen = possibleValues.length; i < ilen && invalid; ++i) {
          if (value == possibleValues[i]) invalid = false;
        }
      }
    }

    if (invalid) {
      return (options && options.message || format(yield translator(DEFAULT_MESSAGE), propertyName));
    }
  }
};
