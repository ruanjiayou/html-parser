const parser = require('../../index');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

describe('测试几个网站的页面', function(){
    it('环球网', function(){
        let p = path.join(__dirname, '../data/example-huanqiu-1.html');
        let str = fs.readFileSync(p, 'utf-8');
        
        let t_base = new Date().getTime();
        console.log(t_base);
        
        let doc1 = new parser().parse(str);
        
        let t_parse = new Date().getTime()
        console.log(t_parse - t_base);

        fs.writeFileSync('d:/test.html', doc1.toString());

        let t_2str = new Date().getTime();
        console.log(t_2str - t_parse);
    });
});