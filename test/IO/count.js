const _ = require('../../lib/_');
const assert = require('assert');
const IO = require('../../lib/IO');

describe('测试字数统计', function () {
    it('测试数字', function () {
        let str = '0123456789';
        let res = IO.count(str);
        assert.equal(res.num, 10);
    });
    it('测试英文', function () {
        let str = 'abcdefghijklmnopqrstuvwXyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let res = IO.count(str);
        assert.equal(res.english, 52);
    });
    it('测试中文', function () {
        let str = '阮家友';
        let res = IO.count(str);
        assert.equal(res.chinese, 3);
    });
    it('混合测试', function () {
        let str = '0123456789abcdefghijklmnopqrstuvwXyzABCDEFGHIJKLMNOPQRSTUVWXYZ阮家友，。、‘’“”：【】！？';
        let res = IO.count(str);
        assert.equal(res.num, 10);
        assert.equal(res.english, 52);
        assert.equal(res.chinese, 3);
        assert.equal(res.punctuation, 12);
        assert.equal(res.bytes, 92);
    });
});