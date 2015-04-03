
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
    assert.equal(yield match.call(model, 'foo', '.*', translator, noop), undefined);
    assert.equal(yield match.call(model, 'foo', /^bar$/, translator, noop), undefined);

    assert.equal(yield match.call(model, 'phone', new RegExp('^(\\d{3}-){2}\\d{4}'), translator, noop), undefined);  // not match
  });

  it('should ignore "optional" requirements', function * () {
    var values = [
      undefined, null, true
    ]

    for (var i = 0, ilen = values.length; i < ilen; ++i) {
      assert.equal(yield match.call(model, 'foo', values[i], translator, noop), undefined);     // not required, aka optional
      assert.equal(yield match.call(model, 'foo', { pattern: values[i] }, translator, noop), undefined);     // not required, aka optional
    }
  });

  it('should not validate', function * () {
    (yield match.call(model, 'foo', false, translator, noop)).should.be.a.String;
    (yield match.call(model, 'foo', { pattern: false }, translator, noop)).should.be.a.String;
    (yield match.call(model, 'foo', /\d+/, translator, noop)).should.be.a.String;
    (yield match.call(model, 'foo', { pattern: /\d+/ }, translator, noop)).should.be.a.String;

    (yield match.call(model, 'phone', { pattern: false }, translator, noop)).should.be.a.String;

  });

  it('should allow changing the error message', function * () {
    (yield match.call(model, 'bar', { pattern: false, message: customMessage }, translator, noop)).should.equal(customMessage);
  });

});