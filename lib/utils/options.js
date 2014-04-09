/**
Options utilities
*/

/**
Use number utilities
*/
var number = require('./number');

/**
Expose properties
*/
module.exports.getArray = getArray;
module.exports.getFunction = getFunction;
module.exports.getBoolean = getBoolean;
module.exports.getNumber = getNumber;
module.exports.getInteger = getInteger;
module.exports.getString = getString;


/*
Return an array from options, or the default value otherwise
@param  {Object}    the options
@param  {String}    a key if options is an object
@param  {Object}    any default value
@return {Array}     the array or the default value
*/
function getArray(options, key, defValue) {
  return (options instanceof Array && options) ||
         (options instanceof Object && options[key] && options[key] instanceof Array && options[key]) ||
         defValue;
};

/*
Return a function from options, or the default value otherwise
@param  {Object}    the options
@param  {String}    a key if options is an object
@param  {Object}    any default value
@return {Function}  the Function or the default value
*/
function getFunction(options, key, defValue) {
  return (options instanceof Function && options) ||
         (options instanceof Object && options[key] && options[key] instanceof Function && options[key]) ||
         defValue;
};

/*
Return a boolean from options, or the default value otherwise
@param  {Object}    the options
@param  {String}    a key if options is an object
@param  {Object}    any default value
@return {Boolean}   the boolean or the default value
*/
function getBoolean(options, key, defValue) {
  return (options === true) || (options === false) ? options : (options instanceof Object && (key in options) ? !!options[key] : defValue);
};

/*
Return a number from options, or the default value otherwise
@param  {Object}    the options
@param  {String}    a key if options is an object
@param  {Object}    any default value
@return {Number}    the number or the default value
*/
function getNumber(options, key, defValue) {
  var value = number.getNumber(options);
  if (value === false)
    value = (options instanceof Object && ((key = String(key)) in options) && number.getNumber(options[key]));
  return (value === false || value === undefined) ? defValue : value;
};

/*
Return an integer from options, or the default value otherwise
@param  {Object}    the options
@param  {String}    a key if options is an object
@param  {Object}    any default value
@return {Number}    the integer or the default value
*/
function getInteger(options, key, defValue) {
  var value = number.getInteger(options);
  if (value === false)
    value = (options instanceof Object && ((key = String(key)) in options) && number.getInteger(options[key]));
  return (value === false || value === undefined) ? defValue : value;
};

/*
Return a string from options, or the default value otherwise
@param  {Object}    the options
@param  {String}    a key if options is an object
@param  {Object}    any default value
@return {String}    the string or the default value
*/
function getString(options, key, defValue) {
  return typeof options === 'string'
         ? options
         : (options instanceof Object) && (typeof options[key] === 'string')
           ? options[key]
           : defValue;
};
