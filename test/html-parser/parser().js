const parser = require('../../index');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const Node = require('../../lib/node');

describe('测试几个网站的页面', function () {
    it('解析注释', function(){
        let str = '<!DOCTYPE html>';

        let doc1 = new parser(str);

        assert.equal(doc1.innerHTML, '<!DOCTYPE html>');
    });
    it('解析文字', function(){
        let str = '阮家友';

        let doc1 = new parser(str);

        assert.equal(doc1.innerHTML, '阮家友');
    });
    it('解析单标签', function(){
        let str = '<html>';

        let doc1 = new parser(str);

        assert.equal(doc1.innerHTML, '<html></html>');
    });
    it('解析双标签', function(){
        let str = '<html></html>';

        let doc1 = new parser(str);

        assert.equal(doc1.innerHTML, '<html></html>');
    });
    it('解析混合', function(){
        let str = '<html><title>xxx</title></html>';

        let doc1 = new parser(str);

        assert.equal(doc1.innerHTML, '<html><title>xxx</title></html>');
    });
});