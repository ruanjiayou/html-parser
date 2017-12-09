const fs = require('fs');
const http = require('http');
const https = require('https');
const crypto = require('crypto');

/**
 * 判断路径是否合法
 * @param {string} path - 路径
 * @return {boolean} - true 路径合法 false - 路径不合法
 */
function isValidPath(path) {
    return /[<>"/?\\*|':]/.test(path);
}
/**
 * 去掉路径中不合法的字符
 * @param {string} path - 路径
 * @return {string} - 返回合法的字符
 */
function toValidPath(path) {
    return path.replace(/[<>"/?\\*|':]/g, ' ');
}

/**
 * 生成16位长度的GUID
 */
function GUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    }).toUpperCase();
};

/**
 * 判断是否是图片拓展名
 * @param {string} ext - 拓展名
 * @return {boolean} - true 是 false 否
 */
function isImageExt(ext) {
    return ext === 'png' || ext === 'gif' || ext === 'jpg' || ext === 'bmp' || ext === 'jpeg' || false;
}

/**
 * 获取文件MIME类型
 * @param {string} header - 文件字符串
 * @returns {string=""} 
 */
function getMIME(header) {
    var res = '';
    if (/^\u0042\u004d/.test(header)) {
        res = 'bmp';
    } else if (/^\u00ff\u00d8\u00ff/.test(header)) {
        res = 'jpg';
    } else if (/^\u0047\u0049\u0046/.test(header)) {
        res = 'gif';
    } else if (/^\u0049\u0049\u002A/.test(header)) {
        res = 'tif';
    } else if (/^\u0089\u0050\u004E/.test(header)) {
        res = 'png';
    }
    return res;
}

/**
 * 按url下载到本地的dir目录. 要保证dir存在
 * 自动识别文件头,key和ext
 * @param {string} dir 
 * @returns {object} result 返回的json
 * @returns {string} result.dir 本地路径
 * @returns {string} result.key 文件名
 * @returns {string} result.ext 拓展名
 * @returns {string} result.len 文件大小
 * @returns {function} result.md5 文件md5
 */
function downImage(url, dir) {
    let key, ext, path;
    return new Promise(function (resolve) {
        let imgData = '',
            shttp = /^https/.test(url) ? https : http;
        md5sum = crypto.createHash('md5');
        shttp.get(url, function (res) {
            //一定要设置response的编码为binary否则会下载下来的图片打不开
            res.setEncoding('binary');
            res.headers['Referer'] = url;
            res.on('data', function (chunk) {
                md5sum.update(chunk);
                imgData += chunk;
            });
            res.on('end', function () {
                if (/^image\/(.*)/.test(res.headers['content-type'])) {
                    ext = RegExp.$1;
                } else {
                    ext = getMIME(imgData.substr(0, 3));
                }
                if (isImageExt(ext)) {
                    do {
                        key = GUID();
                        path = `${dir}/${key}.${ext}`;
                    } while (isFileExists(path));
                    fs.writeFile(path, imgData, 'binary', function (err) {
                        if (err) {
                            throw new Error('write error!');
                        } else {
                            resolve({
                                "dir": dir,
                                "key": key,
                                "ext": ext,
                                "len": imgData.length,
                                "md5": md5sum.digest('hex').toUpperCase()
                            });
                        }
                    });

                } else {
                    throw new Error('isn\'t image');
                }

            });
        });
    });


}

/**
 * 判断文件是否存在
 * @param {string} path - 文件路径
 * @return {boolean} - true 文件存在 false 文件不存在
 */
function isFileExists(path) {
    return fs.existsSync(path) && !fs.lstatSync(path).isDirectory();
}
/**
 * 判断目录是否存在
 * @param {string} dir - 目录路径
 * @return {boolean} - true 目录存在 false 目录不存在
 */
function isDirExists(dir) {
    return fs.existsSync(dir) && fs.lstatSync(dir).isDirectory();
}
/**
 * 同步读取文件文本
 * @param {string} path - 文件绝对路径
 * @return {string} - 字符串
 */
function readTxt(path) {
    var res = '';
    if (isFileExists(path)) {
        try {
            res = fs.readFileSync(path, 'utf-8');
        }
        catch (e) {
            console.log('read error!');
        }
    }
    return res;
}
/**
 * 写入文件
 * @param {string} path - 文件路径
 * @param {*} txt - 字符串
 * @return {boolean} - true 写入完成 false 写入失败
 */
function writeTxt(path, txt) {
    try {
        fs.writeFileSync(path, txt);
        return true;
    }
    catch (e) {
        return false;
    }
}
/**
 * 追加写入文本
 * @param {string} path - 文件路径
 * @param {*} txt - 字符串
 * @return {boolean} - true 写入完成 false 写入失败
 */
function addTxt(path, txt) {
    try {
        fs.writeFileSync(path, txt, { flag: 'a+' });
        return true;
    }
    catch (e) {
        return false;
    }
}
function delTxt(path) {

}
/**
 * 字数统计:
 */
function count(str) {
    let res = {
        bytes: 0,
        chinese: 0,
        english: 0,
        num: 0,
        punctuation: 0
    };
    for (let i = 0; i < str.length; i++) {
        let c = str.charAt(i);
        if (/[\u4e00-\u9fa5]/.test(c)) {
            // 中文
            res.chinese++;
        } else if (/[^\x00-\xff]/.test(c)) {
            // 标点?
            res.punctuation++;
        } else {
            // 英文
            res.english++;
        }
        if (/[0-9]/.test(c)) {
            // 数字
            res.num++;
            res.english--;
        }
    }
    res.bytes = (res.chinese + res.punctuation) * 2 + res.english + res.num;
    return res;
}
module.exports = {
    addTxt,
    readTxt,
    writeTxt,
    isDirExists,
    isFileExists,
    isValidPath,
    toValidPath,
    isImageExt,
    downImage,
    count
};