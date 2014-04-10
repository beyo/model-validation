
var Model = require('beyo-model').Model;

var number = require('../../lib/validators/number');

describe('Test `number` validator', function() {
  var TestModel;
  var model;

  var customMessage = "Testing number successful!";

  var translator = function * (msg) { return msg; };
  var noop = function * () {};

  before(function () {
    TestModel = Model.define('NumberTestModel', {
      attributes: {
        positive: { type: 'float' },
        negative: { type: 'float' },
        zero:     { type: 'float' },
        foo:      { type: 'text' }
      }
    });
  });

  beforeEach(function () {
    model = TestModel({
      positive: 123.456,
      negative: -123.456,
      zero: 0,
      foo: "bar"
    });
  });

  it('should validate', function * () {
    var stack = [];

    [true, undefined, {}].forEach(function(options) {
      stack.push((function * () { yield number(model, 'positive', options, translator, noop); })());
      stack.push((function * () { yield number(model, 'negative', options, translator, noop); })());
      stack.push((function * () { yield number(model, 'zero', options, translator, noop); })());
    });

    while (stack.length) assert.equal(yield stack.pop(), undefined);

    assert.equal(yield number(model, 'positive', undefined, translator, noop), undefined);
    assert.equal(yield number(model, 'negative', undefined, translator, noop), undefined);
    assert.equal(yield number(model, 'zero', undefined, translator, noop), undefined);
  });

  it('should validate only positive', function * () {
    var positiveOptions = {
      positive: true,
      negative: false,
      zero: false
    };

    assert.equal(yield number(model, 'positive', positiveOptions, translator, noop), undefined);
    (yield number(model, 'negative', positiveOptions, translator, noop)).should.be.a.String;
    (yield number(model, 'zero', positiveOptions, translator, noop)).should.be.a.String;
  });

  it('should validate only negative', function * () {
    var negativeOptions = {
      positive: false,
      negative: true,
      zero: false
    };

    (yield number(model, 'positive', negativeOptions, translator, noop)).should.be.a.String;
    assert.equal(yield number(model, 'negative', negativeOptions, translator, noop), undefined);
    (yield number(model, 'zero', negativeOptions, translator, noop)).should.be.a.String;
  });

  it('should validate only zero', function * () {
    var zeroOptions = {
      positive: false,
      negative: false,
      zero: true
    };

    (yield number(model, 'positive', zeroOptions, translator, noop)).should.be.a.String;
    (yield number(model, 'negative', zeroOptions, translator, noop)).should.be.a.String;
    assert.equal(yield number(model, 'zero', zeroOptions, translator, noop), undefined);
  });

  it('should validate "not a number"', function * () {
    assert.equal(yield number(model, 'foo', false, translator, noop), undefined);
    assert.equal(yield number(model, 'foo', { positive: false, negative: false, zero: false }, translator, noop), undefined);
  });

  it('should not validate', function * () {
    (yield number(model, 'positive', false, translator, noop)).should.be.a.String;;
    (yield number(model, 'negative', false, translator, noop)).should.be.a.String;;
    (yield number(model, 'zero', false, translator, noop)).should.be.a.String;;

    (yield number(model, 'foo', undefined, translator, noop)).should.be.a.String;
    (yield number(model, 'foo', true, translator, noop)).should.be.a.String;
  });

  it('should allow changing the error message', function * () {
    (yield number(model, 'foo', { message: customMessage }, translator, noop)).should.equal(customMessage);
  });

});
