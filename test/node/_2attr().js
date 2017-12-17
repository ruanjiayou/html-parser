const Node = require('../../index').Node;
const assert = require('assert');

describe('_2attr()', function(){
    it('正常一个属性', function(){
        let n1 = new Node();
        n1._2attr('class="a b c"');
        n1._2attr('id = "div1"');
        assert.equal(n1.attr('class'), 'a b c');
        assert.equal(n1.attr('id'), 'div1');
    });
    it('有属性名没有属性值的情况', function(){
        let n1 = new Node();
        let n2 = new Node();
        let n3 = new Node();
        n1._2attr('disabled');
        n2._2attr('class="a"  disabled');
        n3._2attr('class="a"  disabled type="button"');
        assert.equal('', n1.attr('disabled'));
        assert.equal('a', n2.attr('class'));
        assert.equal('', n2.attr('disabled'));
        assert.equal('a', n3.attr('class'));
        assert.equal('', n3.attr('disabled'));
        assert.equal('button', n3.attr('type'));
    });
    it('错误的情况', function(){
        let n1 = new Node();
        let n2 = new Node();
        let n3 = new Node();
        let n4 = new Node();
        let n5 = new Node();
        let n6 = new Node();
        let n7 = new Node();
        let n8 = new Node();
        n1._2attr('class="a" 8');
        n2._2attr('class="a" *');
        n3._2attr('class="a" +');
        n4._2attr('class="a" 我');
        n5._2attr('class="a" 8 type="button"');
        n6._2attr('class="a" * type="button"');
        n7._2attr('class="a" + type="button"');
        n8._2attr('class="a" 我 type="button"');

        assert.equal('class="a"', n1.attr());
        assert.equal('class="a"', n2.attr());
        assert.equal('class="a"', n3.attr());
        assert.equal('class="a"', n4.attr());
        assert.equal('class="a" type="button"', n5.attr());
        assert.equal('class="a" type="button"', n6.attr());
        assert.equal('class="a" type="button"', n7.attr());
        assert.equal('class="a" type="button"', n8.attr());
    });
});