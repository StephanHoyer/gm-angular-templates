var _ = require('lodash');
var async = require('async');
var fs = require('fs');
var jade = require('jade');

var templates = {};
var renderedTemplates = {};

var addAsyncFunc = function(name, func) {
  templates[name] = func;
};

var addFunc = function(name, func) {
  addAsyncFunc(name, function(done) {
    done(null, func());
  });
};

var addJadeFile =  function(name, filename, context) {
  addAsyncFunc(name, function(done) {
    fs.readFile(filename, function(err, template) {
      if (err) {
        console.error(err);
      }
      done(null, jade.compile(template, {
        filename: filename,
      })(context));
    });
  });
};

var getRenderedTemplates = function(templatesDone) {
  async.each(Object.keys(templates), function(name, templateDone) {
    templates[name](function(err, renderedTemplate) {
      renderedTemplates[name] = renderedTemplate;
      templateDone();
    });
  }, function(err) {
    templatesDone(err, renderedTemplates);
  });
};

module.exports = {
  _namespace: 'angular:templates',
  func: function(done) { done(null, addFunc); },
  asyncFunc: function(done) { done(null, addAsyncFunc); },
  jade: function(done) { done(null, addJadeFile); },
  all: function(done) { done(null, getRenderedTemplates); }
};
