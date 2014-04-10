
var Model = require('beyo-model').Model;

var required = require('../../lib/validators/required');

describe('Test `required` validator', function() {
  var TestModel;
  var model;

  var customMessage = "Testing required successful!";

  var translator = function * (msg) { return msg; };
  var noop = function * () {};

  before(function () {
    TestModel = Model.define('RequiredTestModel', {
      attributes: {
        id:  { type: 'int' },
        foo: { type: 'text' }
      }
    });
  });

  beforeEach(function () {
    model = TestModel({
      id: 1,
      foo: "bar"
    });
  });

  it('should validate', function * () {
    assert.equal(yield required(model, 'id', true, translator, noop), undefined);
    assert.equal(yield required(model, 'id', {}, translator, noop), undefined);

    assert.equal(yield required(model, 'bar', false, translator, noop), undefined);  // not required
  });

  it('should ignore "optional" requirements', function * () {
    assert.equal(yield required(model, 'id', false, translator, noop), undefined);     // not required, aka optional
    assert.equal(yield required(model, 'id', undefined, translator, noop), undefined);
    assert.equal(yield required(model, 'id', null, translator, noop), undefined);
  });

  it('should not validate', function * () {
    (yield required(model, 'bar', true, translator, noop)).should.be.a.String;

    (yield required(model, 'bar', {}, translator, noop)).should.be.a.String;
    (yield required(model, 'bar', undefined, translator, noop)).should.be.a.String;
    (yield required(model, 'bar', null, translator, noop)).should.be.a.String;
  });

  it('should allow changing the error message', function * () {
    (yield required(model, 'bar', { message: customMessage }, translator, noop)).should.equal(customMessage);
  });

});
