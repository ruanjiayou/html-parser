const Node = require('../../index').Node;
const assert = require('assert');

describe('parse()', function(){
    it('解析正常模式标签', function(){
        let n1 = new Node().parse('<a>');
        let n2 = new Node().parse('</a>');
        let n3 = new Node().parse('测<试');
        let n4 = new Node().parse('</A>');
        let n5 = new Node().parse('<a onclick>');
        let n6 = new Node().parse('<a onclick="alert("test")">');
        assert.equal(n1.nodeName, 'a');
        assert.equal(n2.nodeName, 'a');
        assert.equal(n3.nodeName, '');
        assert.equal(n4.nodeName, 'a');
        assert.equal(n5.nodeName, 'a');
        assert.equal(n6.nodeName, 'a');
        let n7 = new Node().parse('<br>');
        let n8 = new Node().parse('<br/>');
        let n9 = new Node().parse('</br>');
        let n10 = new Node().parse('</br/>');
        let n11 = new Node().parse('< br >');
        let n12 = new Node().parse('< bR >');
        assert.equal(n7.nodeName, 'br');
        assert.equal(n8.nodeName, 'br');
        assert.equal(n9.nodeName, 'br');
        assert.equal(n10.nodeName, 'br');
        assert.equal(n11.nodeName, 'br');
        assert.equal(n12.nodeName, 'br');
    });
    it('解析单标签', function(){
        let n1 = new Node('<img/>');
        assert.equal('img', n1.nodeName);
        assert.equal(Node.TYPE.S, n1.nodeType);

        let n2 = new Node('<img class="p" id="banner"/>');
        assert.equal('img', n2.nodeName);
        assert.equal(Node.TYPE.S, n2.nodeType);
        assert.equal('class="p" id="banner"', n2.attr());
    });
});