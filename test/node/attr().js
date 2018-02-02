const Node = require('../../index').Node;
const assert = require('assert');

describe('测试attr()', function () {
    // it('attr()函数三种传参', function () {
    //     let n = new Node({
    //         nodeName: 'div',
    //         nodeType: Node.TYPE.D,
    //         attributes: {
    //             id: 'div1',
    //             class: 'main'
    //         }
    //     });
    //     assert.equal(n.attr('id'), 'div1');
    //     assert.equal(n.attr('class'), 'main');
    //     assert.equal(n.attr('id'), 'div1');
    //     assert.equal(n.attr('id'), 'div1');
    //     assert.equal(n.attr(), 'id="div1" class="main"');

    //     n.attr({
    //         type: 'type',
    //         placeholder: 'placeholder'
    //     });
    //     assert.equal(n.attr('type'), 'type');
    //     assert.equal(n.attr('placeholder'), 'placeholder');
    // });
    it('_matcher()', function () {
        let n = new Node({
            nodeName: 'div',
            nodeType: Node.TYPE.D,
            attributes: {
                id: 'div1',
                class: 'main test article',
                type: 'btn-primary'
            }
        });
        assert.equal(true, n._matcher('[id=div1]'));
        assert.equal(true, n._matcher('[id="div1"]'));
        assert.equal(false, n._matcher('[class="main"]'));
        assert.equal(true, n._matcher('[class~="test"]'));
        assert.equal(false, n._matcher('[class|="main"]'));
        assert.equal(true, n._matcher('[class^="main"]'));
        assert.equal(true, n._matcher('[class$="article"]'));
        assert.equal(true, n._matcher('[class*="test"]'));

        assert.equal(true, n._matcher('[type|="btn"]'));
    });
});