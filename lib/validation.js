
var fs = require('fs');
var path = require('path');

var Model = require('beyo-model').Model;
var Types = require('beyo-model').Types;
var errorFactory = require('error-factory');
var errorArguments = [ 'message', 'messageData' ];

var ValidationException = errorFactory('beyo.model.validation.ValidationException', errorArguments);


/**
System validators
*/
var validators = loadBuiltinValidators();

/**
Custom unlocked validators
*/
var customValidators = {};


module.exports.define = defineValidator;
module.exports.undefine = undefineValidator;
module.exports.isDefined = isValidatorDefined;
module.exports.getValidators = getDefinedValidators;
module.exports.get = getValidator;
module.exports.validate = validateModel;

Object.freeze(validators);


/**
Model Hook
*/
Model.on('define', function modelDefine(modelDef) {
  var keys;
  var attr;
  var i;
  var ilen;
  var validationOptions = modelDef.options && modelDef.options.validation || {};
  var validators = {};

  keys = Object.keys(modelDef.options.attributes || {});
  for (i = 0, ilen = keys.length; i < ilen; ++i) {
    attr = keys[i];
    if (modelDef.attributes[attr] && modelDef.options.attributes[attr].validation) {
      validators[attr] = createValidationChain(modelDef.options.attributes[attr].validation, validationOptions, attr);
    }
  }

  Object.defineProperty(modelDef.constructor.prototype, 'validate', {
    enumerable: true,
    configurable: false,
    writable: false,
    value: function validate() {
      return validateModel(this, validators);
    }
  });
});



function loadBuiltinValidators() {
  var validators = {};
  var VALIDATOR_PATTERN = /(.*?)\.js$/;
  var validatorPath = path.join(__dirname, 'validators');

  fs.readdirSync(validatorPath).forEach(function (file) {
    var validator;

    if (file.match(VALIDATOR_PATTERN)) {
      validator = path.basename(file, '.js');

      validators[validatorNameSanitize(validator)] = require(path.join(validatorPath, file));
    }
  });

  return validators;
}


/**
Define a new validator

@param {String} validatorName        the unique validator name
@param {Function} validatorCallback  the validation callback
*/
function defineValidator(validatorName, validatorCallback) {
  if (typeof validatorName !== 'string') {
    throw ValidationException('Validator name must be a string : `{{name}}`', { name: validatorName });
  } else if (!validatorName.length) {
    throw ValidationException('Validator name not be empty');
  } else if (!(validatorCallback instanceof Function)) {
    throw ValidationException('Validator callback must be a function : `{{callback}}`', { callback: validatorCallback });
  }

  validatorName = validatorNameSanitize(validatorName);

  if (customValidators[validatorName]) {
    throw ValidationException('Validator already defined : `{{name}}`', { name: validatorName });
  }

  customValidators[validatorName] = validatorCallback;
}


/**
Undefine a validator

@param {String} validatorName      the unique validator name
@return {Function}                 the undefined validation callback
*/
function undefineValidator(validatorName) {
  var validatorCallback;

  if (typeof validatorName !== 'string') {
    throw ValidationException('Validator name must be a string : `{{name}}`', { name: validatorName });
  } else if (!validatorName.length) {
    throw ValidationException('Validator name not be empty');
  }

  validatorName = validatorNameSanitize(validatorName);

  if (validators[validatorName]) {
    throw ValidationException('Cannot undefine system validator : `{{name}}`', { name: validatorName });
  }

  validatorCallback = customValidators[validatorName];

  delete customValidators[validatorName];

  return validatorCallback;
}


/**
Check and return if the given validator is defined or not

@param {String} validatorName      the unique validator name
@return {Boolean}
*/
function isValidatorDefined(validatorName) {
  if (typeof validatorName !== 'string') {
    throw ValidationException('Validator name must be a string : `{{name}}`', { name: validatorName });
  } else if (!validatorName.length) {
    throw ValidationException('Validator name not be empty');
  }

  validatorName = validatorNameSanitize(validatorName);

  return !!(customValidators[validatorName] || validators[validatorName]);
}


/**
Return a list of all defined and known validators

@param {Boolean} filter        if true, return only system validators,
                               if false, return only custom validators,
                               if undefined (default) return all validators
@return {Array}
*/
function getDefinedValidators(filter) {
  var validatorNames = [];

  if (filter || (filter === undefined)) {
    validatorNames = Object.keys(validators);
  }

  if (!filter) {
    validatorNames = validatorNames.concat(Object.keys(customValidators));
  }

  Object.freeze(validatorNames);

  return validatorNames;
}


/**
Return a defined validator

@param {String} validatorName      the unique validator name
@return {Function}                 the undefined validation callback
*/
function getValidator(validatorName) {
  var validatorCallback;

  if (typeof validatorName !== 'string') {
    throw ValidationException('Validator name must be a string : `{{name}}`', { name: validatorName });
  } else if (!validatorName.length) {
    throw ValidationException('Validator name not be empty');
  }

  validatorName = validatorNameSanitize(validatorName);
  validatorCallback = customValidators[validatorName] || validators[validatorName];

  return validatorCallback;
}

/**
Validate the given value.

@param {Model} model       the model to validate
@param {Array} validators  an array of model validators
@return {false|Object}     returns false if all is well, or an object representing the error per attribute
*/
function * validateModel(model, validators) {
  var chain;
  var chainResult;
  var keys;
  var attr;
  var i;
  var ilen;
  var errors = {};
  var hasError = false;
  var typeDef;

  if (!Model.isModel(model)) {
    throw ValidationException('Invalid model type `{{model}}`', { model: model });
  }

  keys = Object.keys(validators);

  for (i = 0, ilen = keys.length; i < ilen; ++i) {
    attr = keys[i];
    chain = validators[attr];

    chainResult = yield * chain(model, attr);

    if (chainResult) {
      hasError = true;
      errors[attr] = chainResult;
    }
  }

  if (!hasError) {
    yield Object.keys(model.__proto__.constructor.attributes).map(function (attr, index, keys) {
      return function * () {
        typeDef = Types.parseTypeDef(model.__proto__.constructor.attributes[attr].type);
        
        if (Model.isDefined(typeDef.name) && typeDef.indexes && Array.isArray(model._data[attr])) {
          yield model._data[attr].map(function (item, index) {
            return function * () {
              if (item) {
                chainResult = yield item.validate();

                if (chainResult) {
                  hasError = true;
                  errors[attr + "[" + index + "]"] = chainResult;
                }
              }
            };
          });
        }
      };
    });
  }

  return hasError ? errors : false;
}


/**
Create a validation chain and return the callback async function

@param {Object} validationChain      the validation chain options
@param {Object} validationOptions    options sent to the validators
@return {Function}
*/
function createValidationChain(validationChain, validationOptions) {
  var keys = Object.keys(validationChain);

  return function * validate(model, propertyName) {
    var key;
    var i;
    var iLen;
    var validatorName;
    var curr;
    var t = validationOptions.translatorCallback || defaultTranslator;
    var result = false;

    for (i = 0, iLen = keys.length; !result && i < iLen; ++i) {
      key = keys[i];
      validatorName = validatorNameSanitize(key);
      validator = customValidators[validatorName] || validators[validatorName];

      if (!validator) {
        throw ValidationException('Unknown validator `{{validator}}`', { validator: validatorName });
      }

      result = yield * validator.call(model, propertyName, validationChain[key], t);
    }

    return result;
  };
}


/*
function validatorFilename(validator) {
  return String(validator).trim()
    .replace(/([a-z\d])([A-Z]+)/g, '$1-$2')
    .replace(/[-\s]+/g, '-')
    .toLowerCase();
}
*/

function validatorNameSanitize(validator) {
  return String(validator).trim()
    .replace(/([a-z\d])([A-Z]+)/g, '$1-$2')
    .toLowerCase()
    .replace(/[-\s]+([a-z])/g, function(a, b) { return b.toUpperCase(); })
    .replace(/\W+/g, '');
}



function * noop() {}

function * defaultTranslator(msg) { return msg; }
