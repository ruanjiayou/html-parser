const parser = require('../../index');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const Node = require('../../index').Node;

describe('测试几个网站的页面', function () {
    it('解析注释', function () {
        let str = '<!DOCTYPE html>';

        let doc1 = new parser(str);

        assert.equal(doc1.innerHTML, '<!DOCTYPE html>');
    });
    it('解析文字', function () {
        let str = '阮家友';

        let doc1 = new parser(str);

        assert.equal(doc1.innerHTML, '阮家友');
    });
    it('解析单标签', function () {
        let str = '<html>';

        let doc1 = new parser(str);

        assert.equal(doc1.innerHTML, '<html></html>');
    });
    it('解析双标签', function () {
        let str = '<html></html>';

        let doc1 = new parser(str);

        assert.equal(doc1.innerHTML, '<html></html>');
    });
    it('解析混合', function () {
        let str = '<html><title>xxx</title></html>';

        let doc1 = new parser(str);

        assert.equal(doc1.innerHTML, '<html><title>xxx</title></html>');
    });
    it('2018-2-6 14:35:28 测试bug', function () {
        let str = '<!--代码如诗 , 如痴如醉 !--><html xmlns:wb="http://open.weibo.com/wb"><title>xxx</title></html>';

        let doc1 = new parser(str);
        assert.equal(doc1.innerHTML, '<!--代码如诗 , 如痴如醉 !--><html xmlns="" wb="http://open.weibo.com/wb"><title>xxx</title></html>');
    });
    it('www.acg.fi', function(){
        let str = fs.readFileSync(path.join(__dirname, '../data/example-acg.html'), 'utf-8');
        let doc1 = new parser(str);
        fs.writeFileSync('d:/test.txt', doc1.toString());
    });
    it('tag attr test', function(){
        let str = '<a href="https://at.umeng.com/jG9b4z "89"><img border="0" src="http://7vzp6z.com1.z0.glb.clouddn.com/aqu.gif" bdsfid="90"></a>';
        let doc1 = new parser(str);
        assert.equal(doc1.toString(), '<a href="https://at.umeng.com/jG9b4z "><img border="0" src="http://7vzp6z.com1.z0.glb.clouddn.com/aqu.gif" bdsfid="90"/></a>');
        console.log(doc1.toString());
    });
});