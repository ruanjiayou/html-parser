const Node = require('../../index').Node;
const assert = require('assert');

describe('toString()', function(){
    it('单个节点 <br/>', function(){
        let n1 = new Node('<br/>');
        assert.equal(n1.toString(), '<br/>');
    });
    it('单个节点 <div></div>', function(){
        let n1 = new Node();
        n1.nodeName = 'div';
        n1.nodeType = Node.TYPE.D;
        assert.equal('<div></div>', n1.toString());
    });
    it('单个节点 root', function(){
        let n1 = new Node();
        n1.nodeType = Node.TYPE.ROOT;
        assert.equal('', n1.toString());
    });
    it('ROOT有子节点', function(){
        let n1 = new Node();
        n1.nodeType = Node.TYPE.ROOT;

        let n2 = new Node();
        n2.nodeName = 'div';
        n2.nodeType = Node.TYPE.D;
        n1.append(n2);
        assert.equal('<div></div>', n1.toString());

        let n3 = new Node('<img/>');
        n1.append(n3);
        assert.equal('<div></div><img/>', n1.toString());
    });
    it('div有子节点节点 <br/><img/>', function(){
        let n1 = new Node();
        n1.nodeName = 'div';
        n1.nodeType = Node.TYPE.D;
        n1.append(new Node('<br/>'));
        n1.append(new Node('<img/>'));
        assert.equal('<div>\n    <br/>\n    <img/>\n</div>', n1.toString());
    });
    
});