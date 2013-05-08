var _ = require('lodash');
var async = require('async');
var expect = require('expect.js');

var angular = require('./');

var initApp = function(module, scope, initDone) {
  async.forEach(Object.keys(module), function(name, initFuncDone) {
    var initFunc = module[name];
    if (_.isFunction(initFunc)) {
      initFunc(function(err, func) {
        scope[name] = func;
        initFuncDone();
      });
    }
  });
  initDone();
};

describe('angular template collector', function() {
  var app = {};

  before(function(initDone) {
    // preinit all apps functions which have no dependencies and save them to
    // `app`-object for usage in tests
    initApp(angular, app, initDone);
  });

  it('should add function as template', function(done) {
    app.func('func', function() {
      return 'templatefunc';
    });
    app.all(function(err, templates) {
      expect(templates).to.be.a('object').and.to.have.key('func');
      expect(templates.func).to.be('templatefunc');
      done();
    });
  });

  it('should add async function as template', function(done) {
    app.asyncFunc('asyncfunc', function(done) {
      done(null, 'templateasyncfunc');
    });
    app.all(function(err, templates) {
      expect(templates).to.be.a('object').and.to.have.key('asyncfunc');
      expect(templates.asyncfunc).to.be('templateasyncfunc');
      done();
    });
  });

  it('should add jadefile as template', function(done) {
    app.jade('jadefile', __dirname + '/test.jade', {variable: 'foo'});
    app.all(function(err, templates) {
      expect(templates).to.be.a('object').and.to.have.key('jadefile');
      expect(templates.jadefile).to.be('<div id="jadefile">foo</div>');
      done();
    });
  });
});

