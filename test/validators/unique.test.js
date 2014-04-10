
var Model = require('beyo-model').Model;

var unique = require('../../lib/validators/unique');

describe('Test `unique` validator', function() {
  var TestModelA;
  var TestModelB;

  var modelA;
  var modelB;

  var customMessage = "Testing unique successful!";

  var translator = function * (msg) { return msg; };
  var noop = function * () {};

  var dummyMapper = function (options) {
    options = options || {};

    return {
      find: function * (filter) {
        filter.should.be.an.Object;

        if (options.knownValues) {
          return options.knownValues.indexOf(filter.id) > -1;
        }
      }
    };
  };


  before(function () {
    Model.once('define', function (options) {
      options.prototype.mapper = {
        value: dummyMapper()
      };
    });

    TestModelA = Model.define('UniqueTestAModel', {
      attributes: {
        id:  { type: 'int' }
      }
    });

    Model.once('define', function (options) {
      options.prototype.mapper = {
        value: dummyMapper({ knownValues: [ 2 ] })
      };
    });

    TestModelB = Model.define('UniqueTestBModel', {
      attributes: {
        id:  { type: 'int' }
      }
    });
  });

  beforeEach(function () {
    modelA = [ TestModelA({ id: 1 }) ];

    modelB = [
      TestModelB({ id: 1 }),
      TestModelB({ id: 1 }),
      TestModelB({ id: 2 })
    ];
  });

  it('should validate', function * () {
    assert.equal(yield unique(modelA[0], 'id', undefined, translator, noop), undefined);
    assert.equal(yield unique(modelB[0], 'id', undefined, translator, noop), undefined);
    assert.equal(yield unique(modelB[1], 'id', undefined, translator, noop), undefined);
  });

  it('should not validate', function * () {
    (yield unique(modelB[2], 'id', undefined, translator, noop)).should.be.a.String;
  });

  it('should allow changing the error message', function * () {
    (yield unique(modelB[2], 'id', { message: customMessage }, translator, noop)).should.equal(customMessage);
  })

});
