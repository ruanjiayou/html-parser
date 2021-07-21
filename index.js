const Html = require('./lib/Html');
const Node = require('./lib/Node');
const $ = require('./lib/$');

module.exports = {
  default: Html.getClass(),
  HTML: Html.getClass(),
  Node: Node.getClass(),
  $,
};