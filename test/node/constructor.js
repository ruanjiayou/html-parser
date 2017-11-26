const Node = require('../../lib/node');
const assert = require('assert');

describe('测试new Node()构造函数', function () {
    it('初始化nodeName和nodeType', function () {
        const n = new Node({
            nodeName: 'div',
            nodeType: Node.TYPE.D
        });
        assert.equal(n.nodeName, 'div');
        assert.equal(n.nodeType, Node.TYPE.D);
        assert.equal(n.text, '');
    });
    it('attributes', function () {
        const n = new Node({
            attributes: {
                href: 'http://www.jiayou.com/',
                target: '_blank'
            }
        });
        assert.equal(n.attributes.href, 'http://www.jiayou.com/');
        assert.equal(n.attributes.target, '_blank');
        assert.equal(n.attr('href'), 'http://www.jiayou.com/');
        assert.equal(n.attr('target'), '_blank');
        n.attr('src', 'pp');
        assert.equal(n.attr('src'), 'pp');
    });
    it('初始化text', function () {
        const n = new Node({ text: '测试' });
        assert.equal(n.text, '测试');
    });
    it('测试额外的键值', function(){
        const n = new Node({
            onclick: 'return'
        });
        assert.equal(n.onclick, undefined);
    });
});