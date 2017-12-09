const http = require('http');
const https = require('https');
const iconv = require('iconv-lite');
const URI = require('uri-parser-helper');
const superHTTP = require('request-promise');

class Result {
    constructor() {
        this.status = Result.STATUS_ERROR;
        this.message = '';
        this.obj = null;
        this.list = [];
    }
}
Result.STATUS_SUCCESS = 'SUCCESS';
Result.STATUS_ERROR = 'ERROR';
Result.STATUS_TIMEOUT = 'TIMEOUT';
Result.STATUS_REDIRECT = 'REDIRECT';
/**
 * 将buffer数组转换为字符串 自动处理编码问题
 * @param {Buffer[]} chunks - Buffer数组
 * @return {string} - 返回字符串
 */
//var charset = /<meta[^>]*charset=(['"])?([^>]+)\1>/.exec(res);
function _buffArr2str(chunks, charset) {
    var res = '';
    chunks = Buffer.concat(chunks);
    res = iconv.decode(chunks, 'utf-8');
    if (charset !== 'utf-8') {
        if (charset === null) {
            var t = /<meta[^>]*charset=(['"']?)([^;'"\s>]+)\1([^>]+)>/.exec(res);
            charset = t ? t[2] : 'utf-8';
        }
        res = iconv.decode(chunks, charset);
    }
    return res;
}
/**
 * 根据url获取字符串 自动判断http和https、编码/以及重定向
 * @param {string} url 
 * @param {object} - 返回Result对象
 */
function _getHTML(url) {
    var result = new Result();
    var opts = {};
    if (typeof url === 'string') {
        url = new URI(url);
        opts = {
            hostname: url.host,
            port: url.port,
            path: url.pathname,
            method: 'GET'

        };
    } else {
        opts = url;
    }
    return new Promise(function (resolve) {
        //设置超时
        var timeoutEvent, time = 5;
        //支持https
        var httpHelper = /^https/.test(url.protocol) ? https : http;
        //数据Buffer
        var chunks = [];
        var req = httpHelper.get(opts, async function (res) {
            result.obj = res.headers;
            var reurl = res.headers['location'] || '';
            // 有重定向就直接重定向
            if (reurl) {
                console.log('redirect:' + reurl);
                result.status = Result.STATUS_REDIRECT;
                result.message = reurl;
                req.abort();
                //throw (new Error('redirect!'));
            }
            res.on('data', function (chunk) {
                chunks.push(chunk);
            });
            res.on('end', async function () {
                clearTimeout(timeoutEvent);
                result.status = Result.STATUS_SUCCESS;
                // 编码处理
                let t = /charset=(['"']?)([^;\s]+)\1/.exec(res.headers['content-type']);
                t = t ? t[2] : null;
                result.message = _buffArr2str(chunks, t);
                resolve(result);
            });
            res.on('error', async function (err) {
                if (result.status === Result.STATUS_REDIRECT) {
                    result.status = Result.STATUS_ERROR;
                    result = await _getHTML(result.message);
                } else {
                    result.message = err.message;
                    resolve(result);
                }
            });
        });
        req.on('timeout', function () {
            req.abort();
        });
        req.on('error', function (err) {
            result.message = err.message;
            resolve(result);
        });
        timeoutEvent = setTimeout(function () {
            req.emit('timeout', {
                message: '请求超过' + time + 's！'
            });
        }, time * 1000);
    });
}

/**
 * 判断指定url是否可以连接访问
 * @param {string} url - url
 * @returns {boolean} - promise
 */
function isOnline(url) {
    return new Promise(function (resolve) {
        let time = 1;
        let httpHelper = /^https/.test(url) ? https : http;
        let req = httpHelper.get(url, function (res) {
            res.on('end', function () { resolve(true); });
            res.on('error', function () { resolve(false); });
        });
        req.on('timeout', function () { req.abort(); });
        req.on('error', function () { resolve(false); });
        setTimeout(function () { req.emit('timeout'); }, time * 1000);
    });
}
/**
 * TODO:文件下载与上传
 */
class httpHelper {
    constructor() {
        this.uri = new URI('http://127.0.0.1');
        this.options = {
            method: 'GET',
            uri: '',
            body: {},
            //json: true,
            headers: {
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Encoding": "gzip, deflate",
                "Accept-Language": "zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2",
                "Connection": "keep-alive",
                "Upgrade-Insecure-Requests": "1",
                "User-Agent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:57.0) Gecko/20100101 Firefox/57.0"
            },
        };
    }
    /**
     * application/json 
     * form x-www-form-urlencoded application/json multipart/form-data
     */
    type(type) {
        //TODO:默认
        switch (type.toLowerCase()) {
            case 'json': this.options.json = true; break;
            case 'application/json': this.options.json = true; break;
            default: break;
        }
        return this;
    }
    clear() {
        this.options.method = 'GET';
        this.options.uri = '';
        this.options.body = {};
    }
    /**
     * 设置header
     * @param {string|object} v1 
     * @param {string} [v2]
     */
    set(v1, v2) {
        if (typeof v1 === 'string' && typeof v2 === 'string') {
            this.options[v1] = v2;
        }
        if (typeof v1 === 'object') {
            for (let k in v1) {
                this.options[k] = v1[k];
            }
        }
        return this;
    }
    /**
     * 设置get请求的search
     * @param {string|object} o 请求的search部分
     */
    query(o) {
        if (typeof o === 'string') {
            this.uri.search = o;
        }
        if (typeof o === 'object') {
            let str = '';
            for (let k in o) {
                str += k + '=' + o[k];
            }
            this.uri.search = str.substring(1);
        }
        return this;
    }
    /**
     * 设置请求的body
     * @param {string|object} v1 
     * @param {string} [v2]
     */
    send(v1, v2) {
        this.options.json = true;
        if (!this.options.body) {
            this.options.body = {};
        }
        if (typeof v1 === 'string' && typeof v2 === 'string') {
            this.options.body[v1] = v2;
        }
        if (typeof v1 === 'object') {
            for (let k in v1) {
                this.options.body[k] = v1[k];
            }
        }
        return this;
    }
    get(url) {
        this.clear();
        this.uri = new URI(url);
        delete this.options.body;
        return this;
    }
    patch(url) {
        this.clear();
        this.options.method = 'PATCH';
        this.uri = new URI(url);
        return this;
    }
    post(url) {
        this.clear();
        this.options.method = 'POST';
        this.uri = new URI(url);
        return this;
    }
    put(url) {
        this.clear();
        this.options.method = 'PUT';
        this.uri = new URI(url);
        return this;
    }
    delete(url) {
        this.clear();
        this.options.method = 'DELETE';
        this.uri = new URI(url);
        return this;
    }
    emit() {
        this.options.uri = this.uri.href;
        return superHTTP(this.options);
    }
}

/**
 * 照理来说应该是 
 * shttp是function
 * get post等里面会 
 */
module.exports = {
    Result: Result,
    isOnline: function (url) { return _isOnline(url); },
    getHTML: async function (url) {
        var res = await _getHTML(url);
        var counts = 1;
        while (res.status !== Result.STATUS_SUCCESS) {
            if (counts > 3) {
                res.status = Result.STATUS_TIMEOUT;
                console.log('4次了。。。还不成功');
                break;
            }
            counts++;
            res = await _getHTML(url);
        }
        return res;
    },
    shttp: new httpHelper()
}