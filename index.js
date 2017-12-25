const _ = require('lodash');
const attrReg = /\b([_a-zA-Z][-_a-zA-Z0-9]*)(\s*=\s*(['"])(.*?)(\3))?/g;
const tagNameReg = /[a-z][0-9a-z]*/;
/**
 * Node节点类型
 */
class Node {
    /**
     * Node节点构造函数
     * @param {string|object} - o 字符串或节点的JSON对象
     */
    constructor(o) {
        // 默认数据
        const n = {
            nodeName: '',
            nodeType: Node.TEXT,
            attributes: {},
            text: ''
        };

        // 数据结构
        this.parentNode = null;
        this.prevNode = null;
        this.nextNode = null;
        this.firstChild = null;

        this.nodeName = '';
        this.nodeType = Node.TYPE.TEXT;
        this.attributes = {};
        this.text = '';
        // 数据处理
        if (_.isObject(o)) {
            if (!_.isNil(o.nodeName)) {
                this.nodeName = o.nodeName;
            }
            if (!_.isNil(o.nodeType)) {
                this.nodeType = o.nodeType;
            }
            if (!_.isNil(o.text)) {
                this.text = o.text;
            }
            if (_.isObject(o.attributes)) {
                _.assign(this.attributes, o.attributes);
            }
        } else if (_.isString(o)) {
            o = o.trim();
            this.parse(o);
        }
    }
    // 内部辅助
    _2attr(str) {
        let m = attrReg.exec(str);
        while (!_.isNull(m)) {
            this.attr(m[1], m[4]);
            m = attrReg.exec(str);
        }
    }
    // 调整dom树
    _adjust(node) {
        var bFound = false,
            op = this;
        if (node.nodeType === Node.TYPE.ST) {
            this.append(node);
            return node;
        }
        //结束标签处理
        if (node.nodeType === Node.TYPE.SE) {
            while (op.nodeType !== Node.TYPE.ROOT) {
                if (op.nodeName === node.nodeName) {
                    bFound = true;
                    break;
                }
                op = op.parentNode;
            }
            if (bFound) {
                while (op.nodeType !== Node.TYPE.ROOT) {
                    if (op.nodeType === Node.TYPE.ST) {
                        op.nodeType = Node.TYPE.S;
                        if (op.nodeName === node.nodeName) {
                            op.nodeType = Node.TYPE.D;
                            op = op.parentNode;
                            break;
                        }
                        else if (op.firstChild !== null) {
                            op.firstChild.parentNode = op.parentNode;
                            op.firstChild.prevNode = op;
                            op.nextNode = op.firstChild;
                            op.firstChild = null;
                        }
                    }
                    op = op.parentNode;
                }
                return op;
            }
            else {
                node.nodeType = Node.TYPE.S;
            }
        }
        if (node.nodeType === Node.TYPE.TEXT) {
            if (this.lastChild && this.lastChild.nodeType === Node.TYPE.TEXT) {
                this.lastChild.text += node.text;
            } else if (node.text !== '') {
                this.append(node);
            }
            return this;
        }
        return this.append(node);
    }
    parse(str) {
        this.nodeType = Node.TYPE.TEXT;
        if (str[0] === '<' && str[str.length - 1] === '>') {
            if (str[1] === '!') {
                this.nodeType = Node.TYPE.COMMENT;
                this.text = str;
            } else {
                let m = /^<([/]?)\s*([\w\W]+?)\s*([/]?)>$/g.exec(str);
                if (m !== null) {
                    this.nodeType = Node.TYPE.ST;
                    if (m[1] === '/') {
                        this.nodeType = Node.TYPE.SE;
                    }
                    if (m[3] === '/') {
                        this.nodeType = Node.TYPE.S;
                    }
                    let t = /^([a-z0-9]+)([\s\S]*)$/i.exec(m[2]);
                    if (t !== null) {
                        this.nodeName = t[1].toLowerCase();
                        this._2attr(t[2]);
                    } else {
                        this.text = m[2];
                    }
                    if (Node.SINGLE.has(this.nodeName)) {
                        this.nodeType = Node.TYPE.S;
                    }
                    return this;
                }
            }
        }
        this.text = str;
        return this;
    }

    set nodeName(name) {
        if (tagNameReg.test(name)) {
            this._nodeName = name;
        } else {
            this._nodeName = '';
        }
    }
    set nodeType(type) {
        this._nodeType = type;
    }
    get nodeName() {
        return this._nodeName;
    }
    get nodeType() {
        return this._nodeType;
    }
    get lastChild() {
        var res = this.firstChild;
        if (res !== null) {
            while (res.nextNode !== null) {
                res = res.nextNode;
            }
        }
        return res;
    }
    get innerHTML() {
        let res = '',
            t = this.firstChild,
            s = '';
        while (t !== null) {
            switch (t.nodeType) {
                case Node.TYPE.S:
                    s = t.attr();
                    if (s !== '') {
                        s = ' ' + s;
                    }
                    res += `<${t.nodeName}${s}/>`;
                    break;
                case Node.TYPE.ST:
                case Node.TYPE.D:
                    res += t.outerHTML;
                    break;
                default:
                    // COMMENT TEXT
                    res += t.text;
                    break;
            }
            t = t.nextNode;
        }
        return res;
    }
    set innerHTML(str) {
        let n = new HTML(str);
        console.log(n.toString());
        if (this.firstChild) {
            this.firstChild.remove();
        }
        this.firstChild = n.Root.firstChild;
        this.firstChild.parentNode = this;
        return this;
    }
    get outerHTML() {
        let res = '';
        let s = this.attr();
        if (s !== '') {
            s = ' ' + s;
        }
        switch (this.nodeType) {
            case Node.TYPE.S:
                res = `<${this.nodeName}${s}/>`;
                break;
            case Node.TYPE.ST:
            case Node.TYPE.D:
                res = `<${this.nodeName}${s}>${this.innerHTML}</${this.nodeName}>`;
                break;
            default:
                res = this.text;
                break;
        }
        return res;
    }
    get innerText() {
        let res = '',
            t = this.firstChild;
        while (t !== null) {
            res += t.nodeType === Node.TYPE.TEXT || t.nodeType === Node.TYPE.COMMENT ? t.text : '';
            t = t.nextNode;
        }
        return res;
    }
    /**
     * 获取单个属性、设置单个属性、获取所有属性、设置多个属性
     * @param {string|object} key 
     * @param {string|boolean|number} val 
     * @returns this对象
     * @returns 单个属性string
     * @returns 所有属性string
     */
    attr(key, val) {
        if (arguments.length === 2) {
            this.attributes[key] = _.toString(val);
            return this;
        } else if (arguments.length === 0) {
            let res = '';
            _.forEach(this.attributes, function (v, k) {
                res += ` ${k}="${v}"`;
            });
            return res.substring(1);
        } else {
            if (_.isObject(key)) {
                for (let k in key) {
                    this.attributes[k] = key[k];
                }
                return this;
            } else {
                let res = this.attributes[key];
                if (_.isNil(res)) {
                    res = null;
                }
                return res;
            }
        }
    }

    /**
     * 删除属性
     * @param {string|array} o 
     * @returns this
     */
    removeAttr(o) {
        if (!_.isArray(o)) {
            o = [o];
        }
        _.forEach(function (v) {
            delete this.attributes[_.toString(v)];
        });
        return this;
    }

    /**
     * 判断是否有类名
     * @param {string|array} o 
     * @returns {boolean} 是否有指定的类名
     */
    hasClass(o) {
        let s = _.isNil(this.attr('class')) ? '' : this.attr('class');
        s = s.split(' ');
        let res = false;
        if (_.isString(o)) {
            o = o.split(' ');
        }
        if (_.isArray(o)) {
            _.forEach(o, function (val) {
                if (val !== '' && -1 !== _.indexOf(s, val)) {
                    res = true;
                    return false;
                }
            });
        }
        return res;
    }
    /**
     * 添加一个或多个类
     * @param {string|array} o 
     */
    addClass(o) {
        if (_.isArray(o)) {
            o = o.join(' ');
        }
        if (_.isString(o)) {
            this.attr('class', this.attr('class') + ' ' + o);
        }
        return this;
    }
    delClass(o) {
        if (_.isString(o)) {
            o = o.split(' ');
        }
        if (_.isArray(o)) {
            let p = this.attr('class').split(' ');
            for (let i = p.length - 1; i >= 0; i--) {
                if (-1 !== o.indexOf(p[i])) {
                    p.splice(i, 1);
                }
            }
            this.attr('class', p.join(' '));
        }
        return this;
    }

    // 文档节点操作方法
    append(o) {
        if (_.isString(o)) {
            this.append(new Node(o));
        } else if (o instanceof Node) {
            if (o.parentNode !== null) {
                o = o.remove();
            }
            let t = this.firstChild;
            o.parentNode = this;
            if (t === null) {
                this.firstChild = o;
            } else {
                while (t.nextNode !== null) t = t.nextNode;
                t.nextNode = o;
                o.prevNode = t;
            }
        }
        return this;
    }
    remove() {
        if (this.prevNode === null) {
            this.parentNode.firstChild = this.nextNode;
            if (this.nextNode) {
                this.nextNode.prevNode = null;
            }
        } else {
            this.prevNode.nextNode = this.nextNode;
            if (this.nextNode !== null) {
                this.nextNode.prevNode = this.prevNode;
            }
        }
        this.parentNode = this.prevNode = this.nextNode = null;
        return this;
    }
    // 去一层包裹
    unwrap() {
        let op = this.parentNode,
            last = this.lastChild;
        // 没有子节点直接去掉
        if (last === null) {
            this.remove();
            return;
        }
        // 是第一个子节点 可能没有下个兄弟节点
        if (op.firstChild === this) {
            op.firstChild = this.firstChild;
            if (this.firstChild) {
                this.firstChild.parentNode = op;
            }
        } else {
            this.prevNode.nextNode = this.firstChild;
            this.firstChild.prevNode = this.prevNode;
        }
        // 链接上后面的节点
        last.nextNode = this.nextNode;
        if (this.nextNode) {
            this.nextNode.prevNode = last;
        }
        return this;
    }
    // 节点树转为前端树插件可用的树
    toJSON() {
        let oc = this.firstChild;
        let res = {
            nodeName: this.nodeName,
            nodeType: this.nodeType,
            attr: this.attr(),
            text: ''
        };
        if (this.nodeType === Node.TYPE.TEXT || this.nodeType === Node.TYPE.COMMENT) {
            res.text = this.text;
        }
        if (oc !== null) {
            res.children = [];
        }
        while (oc !== null) {
            res.children.push(oc.toJSON());
            oc = oc.nextNode;
        }
        return res;
    }
    // 缩进符号 几个空格 属性顺序
    toString(indent, level) {
        // 层级与缩进
        indent = indent || '    ';
        level = level || 0;
        let prefix = _.repeat(indent, level);

        let res = '';
        let t = this.firstChild;
        let tagBR = this.lastChild !== t || t !== null && t.nodeType === Node.TYPE.D;
        let pre
        switch (this.nodeType) {
            case Node.TYPE.S:
                res = `${prefix}${this.outerHTML}`;
                break;
            case Node.TYPE.D:
                level++;
                let s = this.attr();
                if (s !== '') {
                    s = ` ${s}`;
                }
                res = `${prefix}<${this.nodeName}${s}>`;
                if (tagBR) {
                    while (t !== null) {
                        res += `\n${t.toString(indent, level)}`;
                        t = t.nextNode;
                    }
                    res += `\n${prefix}`;
                } else if (t) {
                    res += t.toString();
                }
                res += `</${this.nodeName}>`;
                break;
            case Node.TYPE.ROOT:
                res = '';
                while (t !== null) {
                    res += `${t.toString(indent)}`;
                    t = t.nextNode;
                }
                break;
            default:
                res = `${prefix}${this.text}`;
                break;
        }
        return res;
    };
    async bfsAsync(callback) {
        // 是否中断bfs
        var bBreak = false;
        // 遍历队列
        var queue = [];
        // 临时变量
        var temp = null;
        if (!_.isFunction(callback)) return;
        queue.push(this);
        while (queue.length !== 0 && bBreak === false) {
            temp = queue.shift();
            if (temp.nodeType !== Node.TYPE.ROOT) {
                bBreak = true === await callback.call(this, temp) ? true : false;
            };
            // 确定callback中没有删除节点
            if (temp.parentNode !== null || temp.nodeType === Node.TYPE.ROOT) {
                temp = temp.firstChild;
                while (temp !== null) {
                    queue.push(temp);
                    temp = temp.nextNode;
                }
            }
        }
        return true;
    }
    bfsSync(callback) {
        // 是否中断bfs
        var bBreak = false;
        // 遍历队列
        var queue = [];
        // 临时变量
        var temp = null;
        if (!_.isFunction(callback)) return;
        queue.push(this);
        while (queue.length !== 0 && bBreak === false) {
            temp = queue.shift();
            if (temp.nodeType !== Node.TYPE.ROOT) {
                bBreak = true === callback.call(temp, temp) ? true : false;
            };
            // 确定callback中没有删除节点
            if (temp.parentNode !== null || temp.nodeType === Node.TYPE.ROOT) {
                temp = temp.firstChild;
                while (temp !== null) {
                    queue.push(temp);
                    temp = temp.nextNode;
                }
            }
        }
        return true;
    }
    /**
     * 查找节点 支持逗号分割 #id .class tagname [attr] 四大类型
     * @param {string} selector 
     * 返回节点数组
     */
    $(selector) {
        let res = [],
            filter = [],
            bFound;
        if (_.isString(selector)) {
            filter = selector.split(',');
            filter = filter.map(function (item) {
                return item.trim();
            });
        }
        this.bfsSync(function (n) {
            bFound = false;
            for (let i = 0, len = filter.length; i < len; i++) {
                let t = filter[i];
                switch (t.charAt(0)) {
                    case '#':
                        bFound = n.attr('id') === t.substring(1);
                        break;
                    case '.':
                        bFound = n.hasClass(t.substring(1));
                        break;
                    case '[':
                        if (t.charAt(t.length - 1) === ']') {
                            let reg = /\[([a-z][a-z0-9]+)(\s*=\s*(['"])([\s\S]+*)\3)\]/i;
                            let m = reg.exec(t);
                            if (m !== null) {
                                bFound = true;
                                let attr = n.attr(m[1]);
                                if (m[4] !== '' && attr !== m[4]) {
                                    bFound = false;
                                }
                            }
                        }
                        break;
                    default:
                        bFound = n.nodeName === t;
                        break;
                }
                if (bFound) {
                    res.push(n);
                }
            }
        });
        return res;
    }
    // TODO:svg处理
}
/**
 * 类型常量
 */
; (function () {
    const single = new Set([
        'meta',
        'base',
        'link',
        'basefont',
        'source',
        'keygen',
        'frame',
        'input',
        'param',
        'area',
        'img',
        'col',
        'br',
        'hr'
    ]);
    const type = {
        ROOT: 'root',
        S: 'single',
        D: 'double',
        ST: 'start',
        SE: 'end',
        TEXT: 'text',
        COMMENT: 'comment'
    };
    // 单标签
    Node.SINGLE = single;
    // 类型常量
    Node.TYPE = type;
})();

/**
 * HTML文档类
 */
class HTML {
    constructor(html) {
        this.Root = new Node();
        this.Root.nodeType = Node.TYPE.ROOT;
        this.parse(html);
    };
    parse(html) {
        html = html || '';
        var ch,         //当前字符
            temp,       //临时节点
            currNode = this.Root, //当前节点
            N = html.length, //html长度
            posL = 0,   //html片段开始位置
            currPos = 0,   //html片段当前位置
            bQS = false,
            bQD = false,
            bLeftBS = false,
            bCommentST = false;
        this.Root.firstChild = null;
        for (let i = 0; i < N; i++) {
            ch = html[i];
            currPos = i;
            //注释处理
            if (bCommentST && ch === HTML.CHAR.R_BRACKET) {
                if (i > 1 && html[i - 1] === HTML.CHAR.CONNECTOR && html[i - 2] === HTML.CHAR.CONNECTOR) {
                    temp = html.substring(posL, currPos + 1);
                    currNode = currNode._adjust(new Node(temp));
                    bCommentST = false;
                    bLeftBS = false;
                    posL = i + 1;
                    continue;
                }
            }
            //引号处理 转义处理
            if ((bQD || bQS) && (ch === HTML.CHAR.D_QUOTE || ch === HTML.CHAR.S_QUOTE) && html[i - 1] === HTML.CHAR.BACKSLASH) {
                continue;
            }
            //不然有bug
            if (bLeftBS || currNode.nodeName === 'script') {
                if (ch === HTML.CHAR.D_QUOTE) {
                    //双引号开始过则闭合 否则开启
                    bQD = !bQD;
                }
                if (ch === HTML.CHAR.S_QUOTE) {
                    //单引号开始过则此单引号进行闭合操作 否则开启
                    bQS = !bQS;
                }
            }
            //如果在注释或字符串中则跳过
            if (bCommentST || bQD || bQS) {
                continue;
            }
            switch (ch) {
                case HTML.CHAR.WARNING:// !
                    if (bLeftBS && i + 2 < N && html[i - 1] === HTML.CHAR.L_BRACKET && html[i + 1] === HTML.CHAR.CONNECTOR && html[i + 2] === HTML.CHAR.CONNECTOR) {
                        bCommentST = true;
                    }
                    break;
                case HTML.CHAR.L_BRACKET:// <
                    //当前块类型为文本或>开始后遇到<
                    //push 重开<
                    if (posL !== currPos) {
                        temp = html.substring(posL, currPos);
                        currNode = currNode._adjust(new Node(temp));
                    }
                    posL = i;
                    bLeftBS = true;
                    bQS = bQD = false;
                    break;
                case HTML.CHAR.R_BRACKET:// >
                    //<开始了 才处理
                    if (bLeftBS) {
                        //不在字符串内 不在注释内 <开启了  ----> 是html片段
                        temp = html.substring(posL, currPos + 1);
                        currNode = currNode._adjust(new Node(temp));
                        //闭合 <
                        bLeftBS = false;
                        posL = currPos + 1;
                    }
                    break;
                default: break;
            }//switch end
        }//for end
        if (posL !== currPos) {
            temp = html.substring(posL, currPos + 1);
            currNode._adjust(new Node(temp));
        }
        return this;
    };
    get innerHTML() {
        return this.Root.innerHTML;
    }
    // 提供的便捷方法
    // 美化输出
    toString() {
        return this.Root.toString();
    };
    // 为了转为tree可视化
    toJSON() {
        return this.Root.toJSON();
    }
    bfsSync(callback) {
        this.Root.bfsSync(callback);
    }
    async bfsAsync(callback) {
        await this.Root.bfsAsync(callback);
    }
    $(selector) {
        return this.Root.$(selector);
    }
}
HTML.CHAR = {
    L_BRACKET: `<`,
    R_BRACKET: `>`,
    S_QUOTE: `'`,
    D_QUOTE: `"`,
    WARNING: `!`,
    CONNECTOR: `-`,
    BACKSLASH: `\\`
}
HTML.Node = Node;
module.exports = HTML;