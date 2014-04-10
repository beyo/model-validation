/*
Validator dependencies
*/
var optUtil = require('../utils/options');
var format = require('util').format;

const DEFAULT_MESSAGE = "Field '%s' is not unique.";

const DEFAULT_UNIQUE = true;

/*
Ensure that the given property exists in the given model.

NOTE : This validator is async.

Options:

 - {Boolean}   the property must be unique (true) or not (false) (default true)
 - {Object}    option object :
                - unique {Number}            the property is unique (true) or not (false) (default true)
                - filterBuilder {Function}   a function called to generate a filter sent to the mapper.
                                             The function receives two arguments; the property name and
                                             the model being validated. If not specified, the default filter
                                              will be an object `{ property: value }`
                - searchCallback             the search callback function that should return a model based
                                             on a given filter. The function should be yieldable. If not
                                             specified, the model mapper will be used, if one specified.
                                             (See https://github.com/beyo/model-mapper)
                - message (String)           the invalid / error message (default "Field '%s' is not unique.")

*/
module.exports = function * unique(model, propertyName, options, translator, next) {
  var isUnique       = optUtil.getBoolean(options, 'unique', DEFAULT_UNIQUE);
  var filterBuilder  = optUtil.getFunction(options, 'filterBuilder', defaultFilterBuilder);
  var searchCallback = optUtil.getFunction(options, 'searchCallback', defaultSearchCallback(model));
  var mapper         = model.__proto__.mapper;
  var filter;
  var otherModel;

  if (isUnique && searchCallback) {
    filter = filterBuilder(propertyName, model);

    otherModel = yield searchCallback(filter);

    if (otherModel) {
      return (options && options.message || format(yield translator(DEFAULT_MESSAGE), propertyName));
    }
  }

  return yield next;
};


function defaultFilterBuilder(propertyName, model) {
  var filter = {};
  filter[propertyName] = model._data[propertyName];

  return filter;
}

function defaultSearchCallback(model) {
  return function * searchCallback(filter) {
    var mapper = model.__proto__.mapper;

    if (mapper && mapper.find) {
      return yield mapper.find(filter);
    }
  };
}
