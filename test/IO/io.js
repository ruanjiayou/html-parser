const _ = require('../../lib/_');
const assert = require('assert');
const IO = require('../../lib/IO');

const ts = new Date().getTime();

describe('测试IO操作', function(){
    it('存在性检测', function(){
        let t1 = IO.isDirExists('u:/');
        assert.equal(t1, false);
        let t2 = IO.isDirExists('d:/');
        assert.equal(t2, true);
        let t3 = IO.isDirExists('d:/test/');
        assert.equal(t3, false);
        let t4 = IO.isFileExists('d:/test.html');
        assert.equal(t4, true);
        let t5 = IO.isFileExists('d:/bug.js');
        assert.equal(t5, false);

    });
    let txt = 'D:/test.html';
    it('同步读写文件', function(){
        IO.writeTxt(txt, 'abc');
        let str = IO.readTxt(txt);
        assert.equal(str, 'abc');

        IO.addTxt(txt, '123');
        str = IO.readTxt(txt);
        assert.equal(str, 'abc123');
    });
});