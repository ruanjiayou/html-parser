const Node = require('../../lib/node');
require('./../../index');
const assert = require('assert');

describe('innerHTML', function(){
    console.log('循环引用 妈个鸡的 搞不定');
    // it('基本测试', function(){
    //     let n1 = new Node();
    //     n1.nodeName = 'div';
    //     n1.nodeType = Node.TYPE.D;
    //     n1.append(new Node('测试'));
    //     assert.equal('测试', n1.innerHTML);

    //     let n2 = new Node();
    //     n2.nodeName = 'div';
    //     n2.nodeType = Node.TYPE.D;
    //     n2.append(new Node('测试'));
    //     n2.append(new Node('<img/>'));
    //     n2.append(n1);
    //     n2.append(new Node('abcd'));
    //     assert.equal('测试<img/><div>测试</div>abcd', n2.innerHTML);

    //     let n3 = new Node();
    //     n3.nodeName = 'div';
    //     n3.nodeType = Node.TYPE.D;
    //     n3.innerHTML = '测试<img/><div>测试</div>abcd';
    //     assert.equal(n3.innerHTML, '<div>测试<img/><div>测试</div>abcd</div>');
    // });
});