
var Model = require('beyo-model').Model;

var match = require('../../lib/validators/match');

describe('Test `match` validator', function() {
  var TestModel;
  var model;

  var customMessage = "Testing match successful!";

  var translator = function * (msg) { return msg; };
  var noop = function * () {};

  before(function () {
    TestModel = Model.define('MatchTestModel', {
      attributes: {
        foo: { type: 'text' },
        phone: { type: 'text' }
      }
    });
  });

  beforeEach(function () {
    model = TestModel({
      foo: "bar",
      phone: "555-444-3333"
    });
  });

  it('should validate', function * () {
    assert.equal(yield match(model, 'foo', '.*', translator, noop), undefined);
    assert.equal(yield match(model, 'foo', /^bar/, translator, noop), undefined);

    assert.equal(yield match(model, 'bar', false, translator, noop), undefined);  // not match
  });

  /*
  it('should ignore "optional" requirements', function * () {
    assert.equal(yield match(model, 'id', false, translator, noop), undefined);     // not required, aka optional
    assert.equal(yield match(model, 'id', undefined, translator, noop), undefined);
    assert.equal(yield match(model, 'id', null, translator, noop), undefined);
  });

  it('should not validate', function * () {
    (yield match(model, 'bar', true, translator, noop)).should.be.a.String;

    (yield match(model, 'bar', {}, translator, noop)).should.be.a.String;
    (yield match(model, 'bar', undefined, translator, noop)).should.be.a.String;
    (yield match(model, 'bar', null, translator, noop)).should.be.a.String;
  });

  it('should allow changing the error message', function * () {
    (yield match(model, 'bar', { message: customMessage }, translator, noop)).should.equal(customMessage);
  });
*/

});