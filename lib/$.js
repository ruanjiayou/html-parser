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
            group_res = [];
        groups.forEach((tokens) => {
            let temp_res = this.length === 0 ? [this.context] : this.elems.map(function (ele) { return ele; })
            let token_res = [];
            tokens.forEach((token) => {
                if (token.type === 'COMBATOR') {
                    status = token.value;
                } else if (['ID', 'CLASS', 'TAG', 'ATTR'].indexOf(token.type) !== -1) {
                    token_res = temp_res.map((item) => {
                        return item.$(token.value, status);
                    });
                    temp_res = [];
                    token_res.forEach((arr) => {
                        temp_res = temp_res.concat(arr);
                    });
                    status = '';
                }
            });
            group_res.push(temp_res);
        });
        group_res.forEach((arr) => {
            res = res.concat(arr);
        });
        return res;
    }
    find(selector) {
        let res = new Selector(this.context);
        res.elems = this._func(selector);
        return res;
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
            this.elems = this._func(o);
            break;
        case 'object':
            this.elems = [o];
            break;
        case 'function':
            return o;
            break;
        default: 
            this.elems = [ctx.Root]
        break;
    }
    return this;
}
Selector.prototype.init.prototype = Selector.prototype;

function vQueryFactory(ctx) {
    this.context = ctx;
    let that = this;
    return new Selector.prototype.init(undefined, that.context);
    // return function (selector) {
    //     return new Selector.prototype.init(selector, that.context);
    // };
}

module.exports = vQueryFactory;