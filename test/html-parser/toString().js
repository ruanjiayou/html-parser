const parser = require('../../index');
const Node = parser.Node;
const assert = require('assert');
const path = require('path');
const fs = require('fs');

describe('格式化HTML缩进', function(){

    it('四种常见情况', function(){
        let doc1 = new parser('<a></a>');
        let doc2 = new parser('<a>测试</a>');
        let doc3 = new parser('<a>测<img/>试</a>');
        let doc4 = new parser('<a>测<p>te<img/>st</p>试</a>');
        // console.log(doc1.toString());
        // console.log(doc2.toString());
        // console.log(doc3.toString());
        // console.log(doc4.toString());
        assert.equal(doc1.toString(), '<a></a>');
        assert.equal(doc2.toString(), '<a>测试</a>');
        assert.equal(doc3.toString(), 
`<a>
    测
    <img/>
    试
</a>`);
        assert.equal(doc4.toString(), 
`<a>
    测
    <p>
        te
        <img/>
        st
    </p>
    试
</a>`);
    });
    it('环球网-格式化缩进', function () {
        let p = path.join(__dirname, '../data/example-huanqiu-1.html');
        let str = fs.readFileSync(p, 'utf-8');

        let t_base = new Date().getTime();
        //console.log(t_base);

        let doc1 = new parser().parse(str);

        let t_parse = new Date().getTime()
        //console.log(t_parse - t_base);

        //fs.writeFileSync('d:/test.html', doc1.toString());

        let t_2str = new Date().getTime();
        //console.log(t_2str - t_parse);
    });
    
    
    it('13万节点-性能测试 php的只要11秒', function () {
        let p = path.join(__dirname, '../data/example-maxLength.html');
        let str = fs.readFileSync(p, 'utf-8');
        console.log(`file size:${str.length}`);

        let t_base = new Date().getTime();
        //console.log(t_base);

        let doc1 = new parser().parse(str);

        let t_parse = new Date().getTime();
        console.log(`parse maxlength time: ` + (t_parse - t_base));

        //fs.writeFileSync('d:/maxLength.html', doc1.toString());

        let len = 0,
            single = 0,
            double = 0,
            others = 0;

        doc1.bfsSync(function(n){
            len++;
            switch(n.nodeType) {
                case Node.TYPE.S:
                    single++;
                    break;
                case Node.TYPE.D:
                    double++;
                    break;
                default:
                    others++;
                    break;
            }
        });
        let div = doc1.$('#footer');
        console.log(div[0].toString());
        console.log(`len:${len}`);
        console.log(`single:${single}`);
        console.log(`double:${double}`);
        console.log(`others:${others}`);

    });
    
});