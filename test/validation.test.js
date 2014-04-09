
const VALIDATION_MODULE = '../lib/validation';
const VALIDATOR_PATH = '../lib/validators/';

var fs = require('fs');
var assert = require("assert");

describe('Test Validation', function () {

  var Validation;

  before(function () {
    Validation = require(VALIDATION_MODULE);
  });

  describe('where calling get', function () {
    it('should return all the existing validators', function (done) {
      fs.readdir('./lib/validators', function (err, files) {
        if (err) throw err;

        for (var i=0; i<10; i++) { // check for consistency
          files.forEach(function(file){
            var validator = file.replace('.js', '');

            Validation.get(validator).should.not.be.empty;
            Validation.get(validator).should.be.a.Function;
          });
        }

        done();
      });
    });

    it('should fail to return unknown or invalid validators', function() {
      [
        undefined, null, false, true, '', 0, [], {}, function () {}
      ].forEach(function(invalidValidator) {
        (function() {
          Validation.get(invalidValidator);
        }).should.throw();
      });
    });
  });

  describe('where validating models', function() {
    it('should validate');

    it('should chain validators in their respective order');

    it('should fail');

    it('should fail without throwing an exception');
  });

});
