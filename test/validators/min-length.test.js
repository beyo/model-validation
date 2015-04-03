
var Model = require('beyo-model').Model;

var minLength = require('../../lib/validators/min-length');

describe('Test `min-length` validator', function() {
  var TestModel;
  var model;

  var customMessage = "Testing min-length successful!";

  var translator = function * (msg) { return msg; };
  var noop = function * () {};

  before(function () {
    TestModel = Model.define('MinLengthTestModel', {
      attributes: {
        firstName: { type: 'string' },
        lastName:  { type: 'string' }
      }
    });
  });

  beforeEach(function () {
    model = TestModel({
      firstName: "Jo",
      lastName: "Johnson"
    });
  });

  it('should validate', function * () {
    assert.equal(yield minLength.call(model, 'lastName', undefined, translator, noop), undefined);
  });

  it('should not validate', function * () {
    (yield minLength.call(model, 'firstName', undefined, translator, noop)).should.be.a.String;;
  });

  it('should allow changing the error message', function * () {
    (yield minLength.call(model, 'firstName', { message: customMessage }, translator, noop)).should.equal(customMessage);
  });

  it('should allow setting adjusting new min', function * () {
    assert.equal(yield minLength.call(model, 'firstName', { min: 2 }, translator, noop), undefined);
    (yield minLength.call(model, 'lastName', { min: 8 }, translator, noop)).should.not.be.true;
  });

  it('should accept options to be the min length value', function * () {
    assert.equal(yield minLength.call(model, 'firstName', 2, translator, noop), undefined);
    (yield minLength.call(model, 'lastName', 8, translator, noop)).should.not.be.true;
  });

});
