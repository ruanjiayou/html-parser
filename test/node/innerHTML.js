const Node = require('../../lib/node');
const assert = require('assert');

describe('innerHTML', function(){
    it('基本测试', function(){
        let n1 = new Node();
        n1.nodeName = 'div';
        n1.nodeType = Node.TYPE.D;
        n1.append(new Node('测试'));
        assert.equal('测试', n1.innerHTML);

        let n2 = new Node();
        n2.nodeName = 'div';
        n2.nodeType = Node.TYPE.D;
        n2.append(new Node('测试'));
        n2.append(new Node('<img/>'));
        n2.append(n1);
        n2.append(new Node('abcd'));
        assert.equal('测试<img/><div>测试</div>abcd', n2.innerHTML);
    });
});