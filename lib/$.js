const tokenize = require('./tokenize.js');

class Selector {
    constructor(doc) {
        this.elems = [];
        this.context = doc;
    }
    setContext(ctx) {
        this.context = ctx;
        return this;
    }
    // 对象访问
    each(func) {
        this.elems.forEach(func);
    }
    size() {
        return this.elems.length;
    }
    get length() {
        return this.elems.length;
    }
    // context
    // selector
    get(index) {
        return this.elems[index];
    }
    // 插件机制
    extend(o, func) {
        let exts = {};
        if (typeof o === 'string') {
            exts[o] = func;
        } else {
            exts = o;
        }
        for (let k in exts) {
            this.prototype[k] = exts;
        }
        return this;
    }
    // 选择器 tokenize 已支持

    // 过滤
    eq(index) {
        return this.get(index);
    }
    first() {
        return this.get(0);
    }
    last() {
        return this.get(this.elems.length - 1);
    }
    children(selector) {
        return this.find(selector);
    }
    _func(selector) {
        let res = [],
            status = '',
            groups = tokenize(selector),
            group_res;
        groups.forEach((tokens) => {
            status = '';
            group_res = this.length === 0 ? [this.context] : this.elems.map(function (ele) { return ele; })
            let token_res = [];
            tokens.forEach((token) => {
                if (token.type === 'COMBATOR') {
                    status = token.value;
                } else if (['ID', 'CLASS', 'TAG', 'ATTR'].indexOf(token.type) !== -1) {
                    token_res = group_res.map((item) => {
                        return item.$(token.value, status);
                    });
                    group_res = [];
                    token_res.forEach((arr) => {
                        group_res = group_res.concat(arr);
                    });
                }
            });
        });
        group_res.forEach((arr) => {
            res = res.concat(arr);
        });
        this.elems = res;
    }
    html() {
        return (this.length !== 0) ? this.elems[0].innerHTML : '';
    }
    text() {
        return (this.length !== 0) ? this.elems[0].innerText : '';
    }
    attr(name) {
        return (this.length !== 0) ? this.elems[0].attr(name) : '';
    }
}
Selector.prototype.init = function (o, ctx) {
    this.elems = [];
    this.context = ctx;
    switch (typeof o) {
        case 'string':
            this._func(o);
            break;
        case 'object':
            this.elems = [o];
            break;
        case 'function':
            return o;
            break;
        default: break;
    }
    return this;
}
Selector.prototype.init.prototype = Selector.prototype;

function vQueryFactory(ctx) {
    this.context = ctx;
    let that = this;
    return function (selector) {
        return new Selector.prototype.init(selector, that.context);
    };
}

module.exports = vQueryFactory;