const _ = require('lodash');

const attrReg = /\b([_a-zA-Z][-_a-zA-Z0-9]*)(\s*=\s*(['"])(.*?)(\3))?/g;

/**
 * 
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
                let m = /^<([/]?)([\w\W]+?)([/]?)>$/g.exec(str);
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
                    if(Node.SINGLE.has(this.nodeName)){
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
        if (/[a-z][0-9a-z]*/.test(name)) {
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
                    s = t.attr();
                    if (s !== '') {
                        s = ' ' + s;
                    }
                    res += `<${t.nodeName}${s}/>`;
                    break;
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
        let n = new Node(str);
        this.removeAttr(this.firstChild);
        this.appendChild(n);
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
        const s = this.attr('class').split(' ');
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
            res.text = this.Text;
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
        indent = indent || '    ';
        level = level || 0;
        let prefix = _.repeat(indent, level);
        let res = '';
        let t = this.firstChild;
        let bFirst = true;
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
                while (t !== null) {
                    if(t.nodeType === Node.TYPE.COMMENT || t.nodeType === Node.TYPE.TEXT){
                        res += `${t.toString()}`;
                    } else {
                        res += `\n${t.toString(indent, level)}`;
                        bFirst = false;
                    }
                    t = t.nextNode;
                }
                if (bFirst === false) {
                    res += `\n${prefix}`;
                }
                res += `</${this.nodeName}>`;
                break;
            case Node.TYPE.ROOT:
                res = '';
                while (t !== null) {
                    if (bFirst === false) {
                        res = res + '\n';
                    }
                    res += `${prefix}${t.toString(indent)}`;
                    t = t.nextNode;
                    bFirst = false;
                }
                break;
            default:
                res = `${this.text}`;
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
            if (temp.nodeType !== Node.ROOT) {
                bBreak = true === await callback.call(this, temp) ? true : false;
            };
            // 确定callback中没有删除节点
            if (temp.parentNode !== null || temp.nodeType === Node.ROOT) {
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
            if (temp.nodeType !== Node.ROOT) {
                bBreak = true === callback.call(this, temp) ? true : false;
            };
            // 确定callback中没有删除节点
            if (temp.parentNode !== null || temp.nodeType === Node.ROOT) {
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
        let res,
            filter = [],
            bFound;
        if (_.isString(selector)) {
            filter = selector.split(',').map(function (item) {
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
                        bFound = this.hasClass(t.substring(1));
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
                    break;
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
; (function(){
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
module.exports = Node;
