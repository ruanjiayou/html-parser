const URI = require('uri-parser-helper');
const NET = require('../lib/NET');
const Parser = require('../index');
// 参考:  /src\s*=\s*['"](http\:\/\/image[^\'\"]+?\.(jpg|png|gif))[^'"]*?['"]/g
async function getImageByReg(url, reg) {
    let paths = [];
    let res = await NET.getHTML(url);
    if (res.status === NET.Result.STATUS_SUCCESS) {
        // 抽取图片的正则
        if (!reg) {
            reg = /src\s*=\s*['"](http\:\/\/image[^\'\"]+?\.(jpg|png|gif))[^'"]*?['"]/g
        }
        let m;
        while ((m = reg.exec(res.message)) !== null) {
            paths.push(m[1]);
        }
    }
    return paths;
}
/**
 * 
 * @param {string} url 
 * @param {array} src 地址的属性数组默认是 ['_src', 'data-original-src', 'original', 'src']
 * @param {function} cb 判断函数 图片是否是指定格式的 返回boolean
 */
async function getByImg(url, src, cb) {
    let title = '';
    let entry = new URI(url);
    let res = await NET.getHTML(entry.href);
    let paths = [];
    if (!src) {
        src = ['_src', 'data-original-src', 'src', 'original'];
    }
    if (res.status === NET.Result.STATUS_SUCCESS) {
        let doc = new Parser(res.message);
        doc.bfsSync(function (n) {
            if (n.nodeName === 'title') {
                title = n.innerText.trim();
            }
            if (n.nodeName === 'img') {
                for (let k in src) {
                    let s = n.attr(src[k]);
                    if (s) {
                        s = entry.create(s).href;
                        if (typeof cb === 'function' && cb(s)) {
                            paths.push();
                        } else {
                            paths.push();
                        }
                        break;
                    }
                }
            }
        });
    }
    return {
        title: title,
        result: paths
    };
}

// 测试:2017-12-9 17:13:46 测试通过
// getImageByReg('http://my.poco.cn/lastphoto_v2-htx-id-6014977-user_id-66409560-p-0.xhtml')
//     .then(function (res) {
//         console.log(res);
//     })
//     .catch(function (err) {
//         console.log(err.message);
//     });

// 测试:2017-12-9 17:16:58 2017-12-9 17:34:17 测试通过
getByImg('http://bbs.huoying666.com/forum-53-1.html')
    .then(function (res) {
        console.log(res);
    })
    .catch(function (err) {
        console.log(err.message);
    });

module.exports = {
    getByImg,
    getImageByReg
}