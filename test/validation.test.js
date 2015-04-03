
const VALIDATION_MODULE = '../lib/validation';
const VALIDATOR_PATH = '../lib/validators/';

var fs = require('fs');
var assert = require("assert");

var Validation = require('../lib/validation');
var Model = require('beyo-model').Model;

describe('Test Validation', function () {

  var Validation;

  before(function () {
    Validation = require(VALIDATION_MODULE);
  });

  it('should define new validators', function () {
    Validation.isDefined('foo').should.be.false;
    Validation.define('foo', function * () {});
    Validation.isDefined('foo').should.be.true;

    (function () { Validation.define('foo', function * () {}); }).should.throw();

    Validation.getValidators(true).length.should.not.equal(Validation.getValidators(false));
    Validation.getValidators(null).length.should.not.equal(Validation.getValidators(false));
    Validation.getValidators(null).length.should.not.equal(Validation.getValidators(true));


    Validation.undefine('foo').should.be.a.Function;
    Validation.isDefined('foo').should.be.false;
  });

  it('should fail with invalid validators', function () {
    [
      undefined, null, false, true, '', 0, {}, [], function () {}
    ].forEach(function (validatorName) {
      (function() { Validation.define(validatorName, function () {}); }).should.throw();
      (function() { Validation.isDefined(validatorName); }).should.throw();
      (function() { Validation.get(validatorName); }).should.throw();
      (function() { Validation.undefine(validatorName); }).should.throw();
    });

    assert.equal(Validation.undefine('foo'), undefined);

    [
      undefined, null, false, true, '', 0, {}, []
    ].forEach(function (validator) {
      (function() { Validation.define('foo', validator); }).should.throw();
    });

  });

  it('should return all the existing validators', function (done) {
    var sysValidators = Validation.getValidators(true);
    sysValidators.should.be.an.Array.and.not.be.empty;

    fs.readdir('./lib/validators', function (err, files) {
      var count;
      if (err) throw err;

      for (var i=0; i<10; i++) { // check for consistency
        count = 0;

        files.forEach(function(file){
          var validator = file.replace('.js', '');

          count++;

          Validation.get(validator).should.be.a.Function;

          (function () { Validation.undefine(validator); }).should.throw();
        });

        count.should.be.equal(sysValidators.length);
      }

      done();
    });
  });

  describe('where validating models', function () {
    var buffer;

    before(function () {
      Validation.define('testA', function * (propertyName, options, translator) {
        buffer.push('A');
      });
      Validation.define('testB', function * (propertyName, options, translator) {
        buffer.push('B');
      });
      Validation.define('testC', function * (propertyName, options, translator) {
        buffer.push('C');
      });

      Validation.define('testV', function * (propertyName, options, translator) {
        buffer.push('V');
        if (!this._data[propertyName]) {
          return "TestV failed";
        }
      });
    });

    beforeEach(function () {
      buffer = [];
    });

    it('should validate', function * () {
      var ModelType = Model.define('ValidationSuccess', {
        attributes: {
          value: { type: 'int', validation: { 'integer': { negative: false } } },
          text: { type: 'text', validation: { 'min-length': 10, 'max-length': 12 } }
        }
      });
      var model;

      model = new ModelType({ value: 0, text: 'Hello world' });
      model.validate.should.be.a.Function;

      (yield model.validate()).should.be.false;

      model = new ModelType({ value: -1, text: 'Hello world!!!!!!!' });

      (yield model.validate()).should.be.an.Object;

      (yield model.validate()).should.eql({
        'value': 'Field `value` must be a valid integer',
        'text': 'Field `text` must contain at most 12 character(s)'
      });
    });

    it('should chain validators in their respective order', function * () {
      var ModelType = Model.define('ValidationChainOrder', {
        attributes: {
          value1: { type: 'text', validation: { 'testA': true, 'testB': true, 'testC': true } },
          value2: { type: 'text', validation: { 'testC': true, 'testA': true, 'testB': true } },
          value3: { type: 'text', validation: { 'testB': true, 'testC': true, 'testA': true } }
        }
      });
      var data = { value1: '', value2: '', value3: '' };

      (yield ModelType(data).validate()).should.be.false;
      buffer.should.eql([
        'A', 'B', 'C',   // value1
        'C', 'A', 'B',   // value2
        'B', 'C', 'A'    // value3
      ]);
    });

    it('should fail with invalid validator chain', function * () {
      if (!Validation.isDefined('testA')) {
        Validation.define('testA', function * (model, propertyName, options, translator, next) {
          buffer.push('A');
          yield next;
        });
      }

      var ModelType = Model.define('ValidationInvalidChain', {
        attributes: {
          value1: { type: 'text', validation: { 'testA': true, 'testZ': true } }
        }
      });

      var validationError;

      try {
        yield ModelType({ value1: '' }).validate();
      } catch (e) {
        validationError = e;
      }

      validationError.should.be.an.Error
        .and.have.property('message')
          .and.be.equal('Unknown validator `testZ`');
    });

    it('should fail with invalid model', function * () {
      var error;

      try {
        yield Validation.validate('foo');
      } catch (e) {
        error = e;
      }

      error.should.be.an.Error
        .and.have.property('message')
          .and.be.equal('Invalid model type `foo`');
    });

    it('should validate even if model attribute not set', function * () {
      var ModelType = Model.define('ValidationUndefinedAttribute', {
        attributes: {
          value1: { type: 'text', validation: { 'testA': true } }
        }
      });

      var errors = yield ModelType().validate();

      errors.should.be.false;
      buffer.should.eql(['A']);
    });


    it('should validate model attribute array', function * () {
      var ModelItemType = Model.define('ValidationArrayItemAttributes', {
        attributes: {
          item: { type: 'text', validation: { 'testA': true, 'testV': true } }
        }
      })

      var ModelType = Model.define('ValidationArrayAttributes', {
        attributes: {
          items: { type: 'ValidationArrayItemAttributes[]' }
        }
      });

      var errors = yield ModelType({ items: [ null, undefined, ModelItemType({ item: null }) ] }).validate();

      errors.should.be.eql({ 'items[2]': { 'item': 'TestV failed' } });
      buffer.should.eql(['A', 'V']);
    });

  });

});
