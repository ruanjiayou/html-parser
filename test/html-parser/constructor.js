const parser = require('../../index');
const assert = require('assert');

describe('构造函数', function(){

    it('基本构造函数', function(){
        let doc1 = new parser('<a></a>');
        let doc2 = new parser('<a>测试</a>');
        let doc3 = new parser('<a>测<img/>试</a>');
        let doc4 = new parser('<a>测<p>te<img/>st</p>试</a>');
        assert.equal(doc1.innerHTML, '<a></a>')
        assert.equal(doc2.innerHTML, '<a>测试</a>')
        assert.equal(doc3.innerHTML, '<a>测<img/>试</a>')
        assert.equal(doc4.innerHTML, '<a>测<p>te<img/>st</p>试</a>')
    });
});