
var Model = require('beyo-model').Model;
var Types = require('beyo-model').Types;

var hasValue = require('../../lib/validators/has-value');

describe('Test `has-value` validator', function() {
  var TestModel;
  var model;

  var customMessage = "Testing hasValue successful!";

  var translator = function * (msg) { return msg; };
  var noop = function * () {};

  before(function () {
    Types.define('hasValueTestType', function (v) {
      return v;  // always valid
    });

    TestModel = Model.define('HasValueTestModel', {
      attributes: {
        foo: 'hasValueTestType'
      }
    });
  });

  it('should validate not null', function * () {
    yield [
      false, true, void 0, "", 0, undefined
    ].map(function (validEmptyValue) {
      return function * () {
        var model = TestModel({ foo: validEmptyValue });

        assert.equal(yield hasValue.call(model, 'foo', { null: false, undefined: true, hasValue: true }, translator, noop), undefined);
      };
    });
  });

  it('should validate not undefined', function * () {
    yield [
      false, true, "", 0, null
    ].map(function (validEmptyValue) {
      return function * () {
        var model = TestModel({ foo: validEmptyValue });

        assert.equal(yield hasValue.call(model, 'foo', { null: true, undefined: false, hasValue: true }, translator, noop), undefined);
      };
    });
  });

  it('should validate hasValue', function * () {
    yield [
      false, true, "", "hello", 0, 123, function () {}, {}, {hello:"world"}, [], [1, 2, 3]
    ].map(function (value) {
      return function * () {
        var model = TestModel({ foo: value });

        assert.equal(yield hasValue.call(model, 'foo', true, translator, noop), undefined);
      };
    });

    yield [
      void 0, undefined, null
    ].map(function (value) {
      return function * () {
        var model = TestModel({ foo: value });

        assert.notEqual(yield hasValue.call(model, 'foo', true, translator, noop), undefined);
      };
    });
  });

  it('should validate !hasValue', function * () {
    yield [
      false, true, "", "hello", 0, 123, function () {}, {}, {hello:"world"}, [], [1, 2, 3]
    ].map(function (value) {
      return function * () {
        var model = TestModel({ foo: value });

        assert.notEqual(yield hasValue.call(model, 'foo', { null: true, undefined: true, hasValue: false }, translator, noop), undefined);
        assert.notEqual(yield hasValue.call(model, 'foo', false, translator, noop), undefined);
      };
    });

    yield [
      void 0, undefined, null
    ].map(function (value) {
      return function * () {
        var model = TestModel({ foo: value });

        assert.equal(yield hasValue.call(model, 'foo', { null: true, undefined: true, hasValue: false }, translator, noop), undefined);
        assert.equal(yield hasValue.call(model, 'foo', false, translator, noop), undefined);
      };
    });
  });

  it('should allow changing the error message', function * () {
    var model = TestModel({ foo: null });

    (yield hasValue.call(model, 'foo', { message: customMessage }, translator, noop)).should.equal(customMessage);
  });


});
