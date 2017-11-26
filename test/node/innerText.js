const Node = require('../../lib/node');
const assert = require('assert');

describe('innerText', function(){
    it('基本测试', function(){
        let n1 = new Node();
        n1.nodeName = 'div';
        n1.nodeType = Node.TYPE.D;
        n1.append(new Node('测试'));
        assert.equal('测试', n1.innerText);

        let n2 = new Node();
        n2.nodeName = 'div';
        n2.nodeType = Node.TYPE.D;
        n2.append(new Node('测试'));
        n2.append(new Node('<img/>'));
        n2.append(new Node('abcd'));
        assert.equal('测试abcd', n2.innerText);
    });
});