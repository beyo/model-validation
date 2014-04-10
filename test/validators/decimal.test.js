
var Model = require('beyo-model').Model;

var decimal = require('../../lib/validators/decimal');

describe('Test `decimal` validator', function () {
  var TestModel;
  var model;

  var customMessage = "Testing decimal successful!";

  var translator = function * (msg) { return msg; };
  var noop = function * () {};

  before(function () {
    TestModel = Model.define('DecimalTestModel', {
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
      stack.push((function * () { return yield decimal(model, 'floatPositive', options, translator, noop); })());
      stack.push((function * () { return yield decimal(model, 'floatNegative', options, translator, noop); })());
      stack.push((function * () { return yield decimal(model, 'floatZero', options, translator, noop); })());
      stack.push((function * () { return yield decimal(model, 'zero', options, translator, noop); })());
    });

    while (stack.length) assert.equal(yield stack.pop(), undefined);

    assert.equal(yield decimal(model, 'floatPositive', undefined, translator, noop), undefined);
    assert.equal(yield decimal(model, 'floatNegative', undefined, translator, noop), undefined);
    assert.equal(yield decimal(model, 'floatZero', undefined, translator, noop), undefined);
    assert.equal(yield decimal(model, 'zero', undefined, translator, noop), undefined);

    //Object.keys(model._data).forEach(function(propertyName) {
    //  stack.push((function * () { return yield decimal(model, propertyName, false, translator, noop); })());
    //});
    //while (stack.length) assert.equal(yield stack.pop(), undefined);
  });

  it('should validate only positive', function * () {
    var positiveOptions = {
      positive: true,
      negative: false,
      zero: false
    };

    assert.equal(yield decimal(model, 'floatPositive', positiveOptions, translator, noop), undefined);
    (yield decimal(model, 'floatNegative', positiveOptions, translator, noop)).should.be.a.String;
    (yield decimal(model, 'floatZero', positiveOptions, translator, noop)).should.be.a.String;
    (yield decimal(model, 'zero', positiveOptions, translator, noop)).should.be.a.String;
  });

  it('should validate only negative', function * () {
    var negativeOptions = {
      positive: false,
      negative: true,
      zero: false
    };

    (yield decimal(model, 'floatPositive', negativeOptions, translator, noop)).should.be.a.String;
    assert.equal(yield decimal(model, 'floatNegative', negativeOptions, translator, noop), undefined);
    (yield decimal(model, 'floatZero', negativeOptions, translator, noop)).should.be.a.String;
    (yield decimal(model, 'zero', negativeOptions, translator, noop)).should.be.a.String;
  });

  it('should validate only zero', function * () {
    var zeroOptions = {
      positive: false,
      negative: false,
      zero: true
    };

    (yield decimal(model, 'floatPositive', zeroOptions, translator, noop)).should.be.a.String;
    (yield decimal(model, 'floatNegative', zeroOptions, translator, noop)).should.be.a.String;
    assert.equal(yield decimal(model, 'floatZero', zeroOptions, translator, noop), undefined);
    assert.equal(yield decimal(model, 'zero', zeroOptions, translator, noop), undefined);
  });

  it('should validate "not a number"', function * () {
    assert.equal(yield decimal(model, 'foo', false, translator, noop), undefined);
    assert.equal(yield decimal(model, 'foo', { positive: false, negative: false, zero: false }, translator, noop), undefined);

    (yield decimal(model, 'foo', undefined, translator, noop)).should.be.a.String;
  });

  it('should not validate', function * () {
    (yield decimal(model, 'floatPositive', false, translator, noop)).should.be.a.String;;
    (yield decimal(model, 'floatNegative', false, translator, noop)).should.be.a.String;;
    (yield decimal(model, 'floatZero', false, translator, noop)).should.be.a.String;;

    (yield decimal(model, 'foo', undefined, translator, noop)).should.be.a.String;
    (yield decimal(model, 'foo', true, translator, noop)).should.be.a.String;
  });

  it('should not validate when an integer is provided', function * () {
    (yield decimal(model, 'positive', true, translator, noop)).should.be.a.String;
    (yield decimal(model, 'negative', true, translator, noop)).should.be.a.String;
  });

  it('should allow changing the error message', function * () {
    (yield decimal(model, 'foo', { message: customMessage }, translator, noop)).should.equal(customMessage);
  });

});
