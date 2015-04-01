
var Model = require('beyo-model').Model;

var hasValue = require('../../lib/validators/has-value');

describe('Test `has-value` validator', function() {
  var TestModel;
  var model;

  var customMessage = "Testing hasValue successful!";

  var translator = function * (msg) { return msg; };
  var noop = function * () {};

  before(function () {
    TestModel = Model.define('HasValueTestModel', {
      attributes: {
        // foo: ...
      }
    });
  });

  it('should validate not null', function * () {
    yield [
      false, true, void 0, "", 0, undefined
    ].map(function (validEmptyValue) {
      return function * () {
        var model = TestModel({ foo: validEmptyValue });

        assert.equal(yield hasValue(model, 'foo', { null: false, undefined: true, hasValue: true }, translator, noop), undefined);
      };
    });
  });

  it('should validate not undefined', function * () {
    yield [
      false, true, void 0, "", 0, null
    ].map(function (validEmptyValue) {
      return function * () {
        var model = TestModel({ foo: validEmptyValue });

        assert.equal(yield hasValue(model, 'foo', { null: true, undefined: false, hasValue: true }, translator, noop), undefined);
      };
    });
  });

});
