const { HTML } = require('../../index');
const assert = require('assert');

describe('测试bfsAsync异步深度优先搜索', function () {

    it('bfsAsync()', function (done) {
        let i = 0;
        let doc4 = new HTML('<a>测<p>te<img/>st</p>试</a>');
        doc4.bfsAsync(async function (n) {
            console.log(i++);
            console.log(`nodeType:${n.nodeType} nodeName:${n.nodeName}`);
            return new Promise(function (resolve, reject) {
                resolve(`nodeType:${n.nodeType} nodeName:${n.nodeName}`);
            });
        }).then(res => {
            console.log('then', res)
            assert.strictEqual(res, true);
            assert.strictEqual(doc4.innerHTML, '<a>测<p>te<img/>st</p>试</a>');
        }).catch(e => {
            console.log('catch', e.message);
        }).finally(() => {
            console.log('finally');
        });

    });
});
