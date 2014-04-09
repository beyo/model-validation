
var whitelist = require('../../lib/validators/whitelist');

describe('Test `whitelist` validator', function() {
  var model = {
    __data: {
      prop: "a",
      propUpper: "A",
      propInvalid: 1
    }
  };
  var customMessage = "Testing whitelist successful!";
  var options;

  beforeEach(function() {
    options = {
       values: ["a", true, null]
    };
  });

  it('should ignore if no values defined', function() {
    whitelist(model, 'propInvalid').should.be.true;
    whitelist(model, 'propInvalid', null).should.be.true;
    whitelist(model, 'propInvalid', {}).should.be.true;
    whitelist(model, 'propInvalid', []).should.be.true;

    options.values = [];
    whitelist(model, 'propInvalid', options).should.be.true;

    delete options.values;
    whitelist(model, 'propInvalid', options).should.be.true;
  });

  it('should validate', function() {
    whitelist(model, 'prop', options).should.be.true;
    whitelist(model, 'prop', options.values).should.be.true;

    whitelist(model, 'propUpper', options).should.be.a.String;;
    options.ignoreCase = true;
    whitelist(model, 'propUpper', options).should.be.true;

    whitelist(model, 'propInvalid', options).should.be.a.String;;
    options.strictCompare = false;
    whitelist(model, 'propInvalid', options).should.be.true;
  });

  it('should not validate', function() {
    whitelist(model, 'propUpper', options).should.not.be.true;
    whitelist(model, 'propUpper', options).should.be.a.String;;

    whitelist(model, 'propInvalid', options).should.not.be.true;
    whitelist(model, 'propInvalid', options).should.a.String;;
  });

  it('should allow changing the error message', function() {
    options.message = customMessage;

    whitelist(model, 'propInvalid', options).should.equal(customMessage);
  });

});
