const parser = require('../../index');
const assert = require('assert');

// describe('测试bfsAsync异步深度优先搜索', function () {

//     it('bfsAsync()', function () {

//     });
// });
let i = 0;
let doc4 = new parser('<a>测<p>te<img/>st</p>试</a>');
console.log(doc4.toString());
doc4.bfsAsync(async function (n) {
    console.log(i++);
    console.log(`nodeType:${n.nodeType} nodeName:${n.nodeName}`);
    return new Promise(function (resolve, reject) {
        resolve(`nodeType:${n.nodeType} nodeName:${n.nodeName}`);
    });
});
assert.equal(doc4.innerHTML, '<a>测<p>te<img/>st</p>试</a>')