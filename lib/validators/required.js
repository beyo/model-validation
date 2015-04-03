/*
Validator dependencies
*/
var optUtil = require('../utils/options');
var format = require('util').format;

const DEFAULT_MESSAGE = 'Field `%s` is required';

const DEFAULT_REQUIRED = true;

/*
Ensure that the given property exists in the given model.

Options:

 - {Boolean}   the property is required (true) or not (false) (default true)
 - {Object}    option object :
                - required {Boolean}  the property is required or not (default true)
                - message (String)    the invalid / error message (default "Field '%s' is required.")

*/
module.exports = function * required(propertyName, options, translator) {
  var isRequired = optUtil.getBoolean(options, 'required', DEFAULT_REQUIRED);

  if (isRequired && !this._data.hasOwnProperty(propertyName)) {
    return (options && options.message || format(yield translator(DEFAULT_MESSAGE), propertyName));
  }
};
