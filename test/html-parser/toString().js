const parser = require('../../index');
const assert = require('assert');

describe('格式化HTML缩进', function(){

    it('四种常见情况', function(){
        let doc1 = new parser('<a></a>');
        let doc2 = new parser('<a>测试</a>');
        let doc3 = new parser('<a>测<img/>试</a>');
        let doc4 = new parser('<a>测<p>te<img/>st</p>试</a>');
        // console.log(doc1.toString());
        // console.log(doc2.toString());
        // console.log(doc3.toString());
        // console.log(doc4.toString());
        assert.equal(doc1.toString(), '<a></a>');
        assert.equal(doc2.toString(), '<a>测试</a>');
        assert.equal(doc3.toString(), 
`<a>
    测
    <img/>
    试
</a>`);
        assert.equal(doc4.toString(), 
`<a>
    测
    <p>
        te
        <img/>
        st
    </p>
    试
</a>`);
    });
});