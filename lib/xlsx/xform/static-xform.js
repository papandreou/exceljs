'use strict';

var utils = require('../../utils/utils');
var BaseXform = require('./base-xform');
var XmlStream = require('../../utils/xml-stream');

// var model = {
//   tag: 'name',
//   $: {attr: 'value'},
//   c: [
//     { tag: 'child' }
//   ],
//   t: 'some text'
// };

function build(xmlStream, model) {
  xmlStream.openNode(model.tag, model.$);
  if (model.c) {
    model.c.forEach(function(child) {
      build(xmlStream, child);
    });
  }
  if (model.t) {
    xmlStream.writeText(model.t);
  }
  xmlStream.closeNode();
}

var StaticXform = module.exports = function(model) {
  // This class is an optimisation for static (unimportant and unchanging) xml
  // It is stateless - apart from its static model and so can be used as a singleton
  // Being stateless - it will only track entry to and exit from it's root xml tag during parsing and nothing else
  // Known issues:
  //    since stateless - parseOpen always returns true. Parent xform must know when to start using this xform
  //    if the root tag is recursive, the parsing will behave unpredictably
  this._model = model;
};

utils.inherits(StaticXform, BaseXform, {
  render: function(xmlStream) {
    if (!this._xml) {
      var stream = new XmlStream();
      build(stream, this._model);
      this._xml = stream.xml;
    }
    xmlStream.writeXml(this._xml);
  },

  parseOpen: function() {
    return true;
  },
  parseText: function() {
  },
  parseClose: function(name) {
    switch (name) {
      case this._model.tag:
        return false;
      default:
        return true;
    }
  }
});
