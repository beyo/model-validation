
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

  before(function () {
    TestModelA = Model.define('UniqueTestAModel', {
      attributes: {
        id:  { type: 'int' }
      }
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

  it('should validate');

  it('should not validate');

  it('should allow changing the error message');

});
