const { HTML: parser } = require('../../index');
const assert = require('assert');

describe('构造函数', function () {

    it('基本构造函数', function () {
        let doc1 = new parser('<a></a>');
        let doc2 = new parser('<a>测试</a>');
        let doc3 = new parser('<a>测<img/>试</a>');
        let doc4 = new parser('<a>测<p>te<img/>st</p>试</a>');
        assert.strictEqual(doc1.innerHTML, '<a></a>')
        assert.strictEqual(doc2.innerHTML, '<a>测试</a>')
        assert.strictEqual(doc3.innerHTML, '<a>测<img/>试</a>')
        assert.strictEqual(doc4.innerHTML, '<a>测<p>te<img/>st</p>试</a>')
    });
});