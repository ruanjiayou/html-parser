const Node = require('../../lib/node');
const assert = require('assert');

describe('class操作相关', function(){
    it('hasClass()', function(){
        let n = new Node({ 
            nodeName: 'div',
            nodeType: Node.TYPE.D,
            attributes: {
                class: 'class1 class2 class3'
            }
        });
        assert.equal(n.hasClass('class1'), true);
    });
    it('addClass()', function(){
        let n = new Node({ 
            nodeName: 'div',
            nodeType: Node.TYPE.D,
            attributes: {
                class: 'class1 class2 class3'
            }
        });
        n.addClass('class4');
        assert.equal(n.hasClass('class4'), true);
        n.addClass('class5 class6');
        assert.equal(n.hasClass('class5'), true);
        assert.equal(n.hasClass('class6'), true);
        n.addClass(['class7']);
        assert.equal(n.hasClass('class7'), true);
        n.addClass(['class8', 'class 9']);
        assert.equal(n.hasClass('class8'), true);
    });
    it('delClass()', function(){
        let n = new Node({ 
            nodeName: 'div',
            nodeType: Node.TYPE.D,
            attributes: {
                class: 'class1 class2 class3'
            }
        });
        assert.equal(n.hasClass('class1'), true);
        n.delClass('class1');
        assert.equal(n.hasClass('class1'), false);
        n.addClass('class4 class5 class6');
        n.delClass('class2 class3');
        assert.equal(n.hasClass('class2'), false);
        assert.equal(n.hasClass('class3'), false);
        n.delClass(['class4', 'class5']);
        assert.equal(n.hasClass('class4'), false);
        assert.equal(n.hasClass('class5'), false);
    });
});