
var Model = require('beyo-model').Model;

var integer = require('../../lib/validators/integer');

describe('Test `integer` validator', function() {
  var TestModel;
  var model;

  var customMessage = "Testing integer successful!";

  var translator = function * (msg) { return msg; };
  var noop = function * () {};

  before(function () {
    TestModel = Model.define('IntegerTestModel', {
      attributes: {
        positive:      { type: 'int' },
        negative:      { type: 'int' },
        zero:          { type: 'int' },
        floatPositive: { type: 'float' },
        floatNegative: { type: 'float' },
        floatZero:     { type: 'float' },
        foo:           { type: 'text' }
      }
    });
  });

  beforeEach(function () {
    model = TestModel({
      positive: 123,
      negative: -123,
      zero: 0,
      floatPositive: 123.456,
      floatNegative: -123.456,
      floatZero: '0.0',
      foo: "bar"
    });
  });

  it('should validate', function * () {
    var stack = [];

    [
      undefined, true, {}
    ].forEach(function (options) {
      stack.push((function * () { yield integer.call(model, 'positive', options, translator, noop); })());
      stack.push((function * () { yield integer.call(model, 'negative', options, translator, noop); })());
      stack.push((function * () { yield integer.call(model, 'zero', options, translator, noop); })());
    });

    while (stack.length) assert.equal(yield stack.pop(), undefined);

    assert.equal(yield integer.call(model, 'positive', undefined, translator, noop), undefined);
    assert.equal(yield integer.call(model, 'negative', undefined, translator, noop), undefined);
    assert.equal(yield integer.call(model, 'zero', undefined, translator, noop), undefined);

    Object.keys(model._data).forEach(function(propertyName) {
      stack.push((function * () { yield integer.call(model, propertyName, false, translator, noop); })());
    });

    while (stack.length) assert.equal(yield stack.pop(), undefined);
  });

  it('should validate only positive', function * () {
    var positiveOptions = {
      positive: true,
      negative: false,
      zero: false
    };

    assert.equal(yield integer.call(model, 'positive', positiveOptions, translator, noop), undefined);
    (yield integer.call(model, 'negative', positiveOptions, translator, noop)).should.be.a.String;
    (yield integer.call(model, 'zero', positiveOptions, translator, noop)).should.be.a.String;
  });

  it('should validate only negative', function * () {
    var negativeOptions = {
      positive: false,
      negative: true,
      zero: false
    };

    (yield integer.call(model, 'positive', negativeOptions, translator, noop)).should.be.a.String;
    assert.equal(yield integer.call(model, 'negative', negativeOptions, translator, noop), undefined);
    (yield integer.call(model, 'zero', negativeOptions, translator, noop)).should.be.a.String;
  });

  it('should validate only zero', function * () {
    var zeroOptions = {
      positive: false,
      negative: false,
      zero: true
    };

    (yield integer.call(model, 'positive', zeroOptions, translator, noop)).should.be.a.String;
    (yield integer.call(model, 'negative', zeroOptions, translator, noop)).should.be.a.String;
    assert.equal(yield integer.call(model, 'zero', zeroOptions, translator, noop), undefined);
  });

  it('should validate "not a number"', function * () {
    assert.equal(yield integer.call(model, 'foo', false, translator, noop), undefined);
    assert.equal(yield integer.call(model, 'foo', { positive: false, negative: false, zero: false }, translator, noop), undefined);

    (yield integer.call(model, 'foo', undefined, translator, noop)).should.be.a.String;
  });

  it('should not validate', function * () {
    (yield integer.call(model, 'positive', false, translator, noop)).should.be.a.String;;
    (yield integer.call(model, 'negative', false, translator, noop)).should.be.a.String;;
    (yield integer.call(model, 'zero', false, translator, noop)).should.be.a.String;;

    (yield integer.call(model, 'foo', undefined, translator, noop)).should.be.a.String;
    (yield integer.call(model, 'foo', true, translator, noop)).should.be.a.String;
  });

  it('should not validate when a float is provided', function * () {
    (yield integer.call(model, 'floatPositive', true, translator, noop)).should.be.a.String;
    (yield integer.call(model, 'floatNegative', true, translator, noop)).should.be.a.String;

    model._data.floatZero = '0.0';  // NOTE: special case, as parseFloat('0.0') returns 0, which is an integer, and would validate

    (yield integer.call(model, 'floatZero', true, translator, noop)).should.be.a.String;
  });

  it('should allow changing the error message', function * () {
    (yield integer.call(model, 'foo', { message: customMessage }, translator, noop)).should.equal(customMessage);
  });

});
