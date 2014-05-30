/*
Validator dependencies
*/
var optUtil = require('../utils/options');
var format = require('util').format;

const DEFAULT_MESSAGE = 'Field `%s` does not match pattern';

const DEFAULT_PATTERN = /.*/;

/*
Ensure that the given property matches a given regular expression. If the value
is undefined or does not exist in the model, this validation will be successful.

Options:

 - {String|RegExp}   the model property's pattern to match against
 - {Object}          option object :
                      - pattern {Boolean}   the model property's pattern to match against
                      - message (String)    the invalid / error message (default "Field '%s' is required.")

*/
module.exports = function * match(model, propertyName, options, translator, next) {
  var matchPattern = optUtil.getBoolean(options, 'pattern', DEFAULT_PATTERN);

  if (model._data.hasOwnProperty(propertyName) && !matchPattern.test(model._data[propertyName])) {
    return (options && options.message || format(yield translator(DEFAULT_MESSAGE), propertyName))
  }

  return yield next;
};
