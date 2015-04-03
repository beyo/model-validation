
var Model = require('beyo-model').Model;

var blacklist = require('../../lib/validators/blacklist');

describe('Test `blacklist` validator', function() {
  var TestModel;
  var model;

  var customMessage = "Testing blacklist successful!";
  var options;

  var translator = function * (msg) { return msg; };
  var noop = function * () {};

  before(function () {
    TestModel = Model.define('BlackListTestModel', {
      attributes: {
        prop:        { type: 'string' },
        propUpper:   { type: 'string' },
        propInvalid: { type: 'integer' }
      }
    });
  });

  beforeEach(function () {
    options = {
       values: ["a", true, null]
    };

    model = TestModel({
      prop: "a",
      propUpper: "A",
      propInvalid: 1
    });
  });

  it('should ignore if no values defined', function * () {
    assert.equal(yield blacklist.call(model, 'prop', undefined, translator, noop), undefined);
    assert.equal(yield blacklist.call(model, 'prop', null, translator, noop), undefined);
    assert.equal(yield blacklist.call(model, 'prop', {}, translator, noop), undefined);
    assert.equal(yield blacklist.call(model, 'prop', [], translator, noop), undefined);

    options.values = [];
    assert.equal(yield blacklist.call(model, 'prop', options, translator, noop), undefined);

    delete options.values;
    assert.equal(yield blacklist.call(model, 'prop', options, translator, noop), undefined);
  });

  it('should validate', function * () {
    assert.equal(yield blacklist.call(model, 'propUpper', options, translator, noop), undefined);
    assert.equal(yield blacklist.call(model, 'propInvalid', options, translator, noop), undefined);
  });

  it('should not validate', function * () {
    (yield blacklist.call(model, 'prop', options, translator, noop)).should.be.a.String;

    (yield blacklist.call(model, 'prop', options.values, translator, noop)).should.be.a.String;

    options.ignoreCase = true;
    (yield blacklist.call(model, 'propUpper', options, translator, noop)).should.be.a.String;

    options.strictCompare = false;
    (yield blacklist.call(model, 'propInvalid', options, translator, noop)).should.be.a.String;
  });

  it('should allow changing the error message', function * () {
    options.message = customMessage;

    (yield blacklist.call(model, 'prop', options, translator, noop)).should.equal(customMessage);
  });

});
