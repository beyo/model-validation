
var Model = require('beyo-model').Model;

var whitelist = require('../../lib/validators/whitelist');

describe('Test `whitelist` validator', function() {
  var TestModel;
  var model;

  var customMessage = "Testing whitelist successful!";
  var options;

  var translator = function * (msg) { return msg; };
  var noop = function * () {};

  before(function () {
    TestModel = Model.define('WhiteListTestModel', {
      attributes: {
        prop:        { type: 'string' },
        propUpper:   { type: 'string' },
        propInvalid: { type: 'string' }
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
    assert.equal(yield whitelist(model, 'propInvalid', undefined, translator, noop), undefined);
    assert.equal(yield whitelist(model, 'propInvalid', null, translator, noop), undefined);
    assert.equal(yield whitelist(model, 'propInvalid', {}, translator, noop), undefined);
    assert.equal(yield whitelist(model, 'propInvalid', [], translator, noop), undefined);

    options.values = [];
    assert.equal(yield whitelist(model, 'propInvalid', options, translator, noop), undefined);

    delete options.values;
    assert.equal(yield whitelist(model, 'propInvalid', options, translator, noop), undefined);
  });

  it('should validate', function * () {
    assert.equal(yield whitelist(model, 'prop', options, translator, noop), undefined);
    assert.equal(yield whitelist(model, 'prop', options.values, translator, noop), undefined);

    (yield whitelist(model, 'propUpper', options, translator, noop)).should.be.a.String;
    options.ignoreCase = true;
    assert.equal(yield whitelist(model, 'propUpper', options, translator, noop), undefined);

    (yield whitelist(model, 'propInvalid', options, translator, noop)).should.be.a.String;
    options.strictCompare = false;
    assert.equal(yield whitelist(model, 'propInvalid', options, translator, noop), undefined);
  });

  it('should not validate', function * () {
    (yield whitelist(model, 'propUpper', options, translator, noop)).should.be.a.String;
    (yield whitelist(model, 'propInvalid', options, translator, noop)).should.a.String;
  });

  it('should allow changing the error message', function * () {
    options.message = customMessage;

    (yield whitelist(model, 'propInvalid', options, translator, noop)).should.equal(customMessage);
  });

});
