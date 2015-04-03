/*
Validator dependencies
*/
var optUtil = require('../utils/options');
var format = require('util').format;

const DEFAULT_MESSAGE = 'Field `%s` has no value';

const DEFAULT_CAN_BE_NULL = false;
const DEFAULT_CAN_BE_UNDEFINED = false;
const DEFAULT_CAN_BE_TRUTHY = true;

/*
Ensure that the given property has a value other than null or undefined.

Options:

 - {Boolean}   the property must have value (true) or not (false)
 - {Object}    option object :
                - hasValue (Boolean)  the property can or cannot have value (default true)
                - null {Boolean}      the property can or cannot be null (default false)
                - undefined (Boolean) the property can or cannot be undefined (default false)
                - message (String)    the invalid / error message (default "Field '%s' is required.")

*/
module.exports = function * hasValue(propertyName, options, translator) {
  var canBeNull;
  var canBeUndefined;
  var canHaveValue;
  var value = this._data[propertyName];


  if (options === true) {
    canBeNull = false;
    canBeUndefined = false;
    canHaveValue = true;
  } else if (options === false) {
    canBeNull = true;
    canBeUndefined = true;
    canHaveValue = false;
  } else {
    canBeNull = optUtil.getBoolean(options, 'null', DEFAULT_CAN_BE_NULL);
    canBeUndefined = optUtil.getBoolean(options, 'undefined', DEFAULT_CAN_BE_UNDEFINED);
    canHaveValue = optUtil.getBoolean(options, 'hasValue', DEFAULT_CAN_BE_TRUTHY);
  }

  //console.log("******** TESTING HAS VALUE", value, canBeNull, canBeUndefined, canHaveValue);

  if ( ((value === null) && !canBeNull) ||
       ((value === undefined) && !canBeUndefined) ||
       ((value !== undefined && value !== null) && !canHaveValue)
  ) {
    return (options && options.message || format(yield translator(DEFAULT_MESSAGE), propertyName));
  }
};
