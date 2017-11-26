const _ = require('../../lib/_');
const assert = require('assert');

describe('辅助函数_()单元测试', function(){
    it('type', function(){
        assert.equal(_.isFunction(function(){}), true);
        assert.equal(_.isFunction(new Function()), true);
        assert.equal(_.isArray([]), true);
        assert.equal(_.isArray(new Array()), true);
        assert.equal(_.isString(''), true);
        assert.equal(_.isString(new String()), true);
        assert.equal(_.isDate(new Date()), true);
        assert.equal(_.isNumber(1), true);
        assert.equal(_.isNumber(1e1), true);
        assert.equal(_.isRegExp(/[0-9]+/), true);
        assert.equal(_.isRegExp(new RegExp()), true);
        assert.equal(_.isObject({}), true);
        assert.equal(_.isObject([]), true);
        assert.equal(_.isObject(null), true);
        assert.equal(_.isBoolean(true), true);
        assert.equal(_.isBoolean(false), true);
        assert.equal(_.isNull(null), true);
        assert.equal(_.isUndefined(undefined), true);
        assert.equal(_.isNil(null), true);
        assert.equal(_.isNil(undefined), true);
        assert.equal(_.isNaN(NaN), true);
    });
    it('keys()', function(){
        var res1 = _.keys({ a: 1, b: 2});
        var res2 = _.keys('123');
        assert.equal(res1[0], 'a');
        assert.equal(res1[1], 'b');
        assert.equal(res2[0], '0');
        assert.equal(res2[1], '1');
        assert.equal(res2[2], '2');
    });
    it('pick()', function(){
        var t = {
            a: 1,
            b: 2,
            c: 3
        };
        var res1 = _.pick(t, ['a', 'c']);
        assert.equal(res1.a, 1);
        assert.equal(res1.b, undefined);
        var res2 = _.pick(t, { a: 'required', b: 'required'});
        assert.equal(res2.a, 1);
        assert.equal(res2.c, undefined);
    });
});