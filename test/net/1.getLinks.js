const Debug = require('debug')('TEST:LINKS');
const Node = require('../../lib/node');
const Parser = require('../../index');
const NET = require('../../lib/NET');
const _ = require('lodash');
const URI = require('uri-parser-helper');
const shttp = require('request-promise');
/**
 * url
 * path
 * rule
 * book
 * author
 * db
 * 
 */
/*
const entry = new URI('http://www.tsxsw.com/html/1/1990/');
NET.getHTML(entry.toString()).then(function (res) {
    if (res.status === NET.Result.STATUS_SUCCESS) {
        let doc = new Parser(res.message);
        let books = doc.$('h1');
        let authors = doc.$('.author,#author');
        let info = {
            book: '',
            author: ''
        };
        let links = doc.$('a');
        // 获取书籍信息
        books.forEach((item) => {
            let txt = item.innerText.trim();
            if (txt !== '') {
                info.book = txt;
            }
        });
        // 获取作者信息
        authors.forEach((item) => {
            let txt = item.innerText.trim().replace(/作者|[:：]/g, '');
            if (txt !== '') {
                info.author = txt;
            }
        });
        links = _.filter(links, function (o) {
            return /^\d+[.]html$/.test(o.attr('href') || '');
        });
        _.sortBy(links, function (o) {
            let num = (o.attr('href') || '').replace('.html', '');
            return parseInt(num);
        });
        console.log(info);
        console.log(`links length:${links.length}`);
        links.forEach(function (item, index) {
            let url = entry.create(item.attr('href'));
            console.log(`${index}:${item.innerText} \n\t${url}`);
        });
    }
}).catch(function (err) {
    console.log(err.message);
});
*/
const entry = new URI('http://novel.jiayou.com/admin/author');
