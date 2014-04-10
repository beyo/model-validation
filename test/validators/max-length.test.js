
var Model = require('beyo-model').Model;

var maxLength = require('../../lib/validators/max-length');

describe('Test `max-length` validator', function() {
  var TestModel;
  var model;

  var customMessage = "Testing max-length successful!";

  var translator = function * (msg) { return msg; };
  var noop = function * () {};

  before(function () {
    TestModel = Model.define('MaxLengthTestModel', {
      attributes: {
        login:    { type: 'string' },
        password: { type: 'string' }
      }
    });
  });

  beforeEach(function () {
    model = TestModel({
      login: "john.smith@domain.com",
      password: (function (n) {
        var str = '';
        for (var i = 0; i < n; ++i) {
          str += String.fromCharCode(97 + (i%26));
        }
        return str;
      })(800)
    });
  });

  it('should validate', function * () {
    assert.equal(yield maxLength(model, 'login', undefined, translator, noop), undefined);
  });

  it('should not validate', function * () {
    (yield maxLength(model, 'password', undefined, translator, noop)).should.be.a.String;;
  });

  it('should allow changing the error message', function * () {
    (yield maxLength(model, 'password', { message: customMessage }, translator, noop)).should.equal(customMessage);
  });

  it('should allow setting adjusting new max', function * () {
    (yield maxLength(model, 'login', { max: 2 }, translator, noop)).should.not.be.true;
    assert.equal(yield maxLength(model, 'password', { max: 4000 }, translator, noop), undefined);
  });

  it('should accept options to be the max length value', function * () {
    (yield maxLength(model, 'login', 2, translator, noop)).should.be.a.String;
    assert.equal(yield maxLength(model, 'password', 4000, translator, noop), undefined);
  });

});
