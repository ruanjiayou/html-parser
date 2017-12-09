const shttp = require('../../lib/NET').shttp;
const assert = require('assert');

describe('测试shttp', function () {
    it('get()', function (done) {
        shttp
            .get('http://novel.jiayou.com/admin/book/1000000')
            .emit()
            .then(function (res) {
                assert(res.status, true);
            })
            .catch(function (err) {
                console.log(err.message);
            });
        done();
    });
    it('post', function () {
        console.log('post');
    });
});