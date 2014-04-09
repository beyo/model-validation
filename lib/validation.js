
var Model = require('beyo-model').Model;
var errorFactory = require('error-factory');
var errorArguments = [ 'message', 'messageData' ];

var ValidationException = errorFactory('ValidationException', errorArguments);


/**
System validators
*/
var validators = {


};

/**
Custom unlocked validators
*/
var customValidators = {};


module.exports.define = defineValidator;
module.exports.undefine = undefineValidator;
module.exports.isDefined = isValidatorDefined;
module.exports.validators = getDefinedValidators;
module.exports.get = getValidator;
module.exports.validate = validate;

Object.freeze(validators);


/**
Model Hook
*/
Model.on('define', function modelDefine(options) {
  var keys;
  var attr;
  var i;
  var ilen;
  var translator = options.validation && options.validation.translator;

  Object.defineProperty(options.prototype, 'validate', {
    enumerable: true,
    configurable: false,
    writable: false,
    value: function * validate() {
      return yield validate(this);
    }
  });

  keys = Object.keys(options.attributes || {});
  for (i = 0, ilen = keys.length; i < ilen; ++i) {
    attr = keys[i];
    if (options.attributes[attr] && options.attributes[attr].validation) {
      options.attributes[attr].validation = createValidationChain(options.attributes[attr].validation, translator);
    }
  }
});


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
  } else if (customValidators[validatorName]) {
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
  } else if (validators[validatorName]) {
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

  validatorCallback = customValidators[validatorName] || validators[validatorName];

  return validatorCallback;
}

/**
Validate the given value.

@param {Model} model     the model to validate
@return {true|Object}    returns true if all is well, or an object representing the error per attribute
*/
function * validate(model) {
  var chain;
  var chainResult;
  var attributes;
  var keys;
  var attr;
  var i;
  var ilen;
  var errors = {};
  var hasError = false;

  if (!Model.isModel(model)) {
    throw ValidationException('Invalid model type `{{model}}`', { model: model });
  }

  attributes = model.__proto__.attributes || {};
  keys = Object.keys(attributes);

  for (i = 0, ilen = keys.length; i < ilen; ++i) {
    attr = keys[i];
    if (attributes[attr].validation) {
      chain = attributes[attr].validation;

      chainResult = yield chain(model, attr);

      if (chainResult) {
        hasError = true;
        errors[attr] = chainResult;
      }
    }
  }

  return !hasError || errors;
}


/**
Create a validation chain and return the callback async function

@param {Object} validationChain      the validation chain options
@return {Function}
*/
function createValidationChain(validationChain, translator) {
  var keys = Object.keys(validationChain);

  translator = translator || defaultTranslator;

  return function * validate(model, propertyName) {
    var i = keys.length;
    var validator;
    var prev = noop();
    var curr;

    while (i--) {
      validator = keys[i];
      curr = customValidators[validator] || validators[validator];

      if (!curr) {
        throw ValidationException('Unknown validator `{{validator}}`', { validator: validator });
      }

      prev = curr.call(this, model, propertyName, validationChain[validator], translator, prev);
    }

    yield * prev;
  };
}

function * noop() {}

function * defaultTranslator(msg) { return msg; }
