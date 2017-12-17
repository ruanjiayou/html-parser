require('D:/MyGitHub/extend/Date/request');
const Debug = require('debug')('TEST:LINKS');
const Node = require('../lib/node');
const Parser = require('../index');
const NET = require('../lib/NET');
const IO = require('../lib/IO');
const _ = require('lodash');
const URI = require('uri-parser-helper');
//const shttp = require('request-promise');
const shttp = NET.shttp;

const entry = new URI('http://www.tsxsw.com/html/23/23308/');
const analysis = {
    path: 'd:/novel_down_analysis.txt',
    book: '',
    author: '',
    start: '',
    finish: '',
    chapters: 0,
    count: 0
};

async function downBook(uri) {
    analysis.start = new Date().format('{yy}-{mm}-{dd} {hh}:{ii}:{ss}');
    // 1.获取网页源码
    let res = await NET.getHTML(uri);
    if (res.status !== NET.Result.STATUS_SUCCESS) {
        throw new Error('获取网页失败!!!');
    }
    // 2.解析网页
    let document = new Parser(res.message);
    // 3.获取作者信息
    let authorsNode = document.$('.author,#author');
    let authorName = '';
    for (let i = 0; i < authorsNode.length; i++) {
        let t = authorsNode[i].innerText.trim().replace(/作者|[:：]/g, '');
        if (t !== '') {
            authorName = t;
        }
    }
    if (authorName === '') {
        authorName = '佚名';
    }
    analysis.author = authorName;
    // 4.添加作者
    let author = await shttp
        .patch('http://api.novel.jiayou.com/admin/author')
        .send({ name: authorName })
        .emit();
    console.log(author.result);
    if (!author) {
        throw new Error('create author failed!');
    }
    // 5.获取书籍信息
    let booksNode = document.$('h1');
    let bookName = '';
    for (let i = 0; i < booksNode.length; i++) {
        if (booksNode[i].innerText.trim() !== '') {
            bookName = booksNode[i].innerText.trim();
            break;
        }
    }
    if (bookName === '') {
        throw new Error('book no name!');
    }
    analysis.book = bookName;
    let poster = '';
    _.forEach(document.$('img'), function(n){
        if(n.attr('alt')===analysis.book){
            poster = n.attr('src');
            return false;
        }
    });
    // 6.创建书籍
    let book = await shttp
        .patch('http://api.novel.jiayou.com/admin/book')
        .send({ authorId: author.result.id, name: bookName, poster: poster })
        .emit();
    if (book.result.count !== 0) {
        throw new Error('书籍已采集?')
    }
    // 7.获取所有链接 过滤/排序
    let links = document.$('a');
    links = _.filter(links, function (o) {
        return /^\d+[.]html$/.test(o.attr('href') || '');
    });
    _.sortBy(links, function (o) {
        let num = (o.attr('href') || '').replace('.html', '');
        return parseInt(num);
    });
    let count = 0;
    // 8.循环下载
    for (let i = 0; i < links.length; i++) {
        let item = links[i];
        let url = entry.create(item.attr('href')).href;
        let title = item.innerText.trim();
        res = await NET.getHTML(url);
        if (res.status === NET.Result.STATUS_SUCCESS) {
            console.log(`${i}:${title} \n\t${url}`);
            document = new Parser(res.message);
            let content = document.$('#content')[0].innerHTML;
            let tongji = IO.count(content);
            count = count + tongji.chinese + tongji.punctuation + tongji.num;
            await shttp
                .post(`http://api.novel.jiayou.com/admin/book/${book.result.id}/chapter`)
                .send({ title: title, content: content })
                .emit();
        }
    }
    analysis.chapters = links.length;
    analysis.count = count;
    console.log(`总字数:${count}`);
    await shttp
        .put(`http://api.novel.jiayou.com/admin/book/${book.result.id}`)
        .send({ count: count })
        .emit();
    analysis.finish = new Date().format('{yy}-{mm}-{dd} {hh}:{ii}:{ss}');
    IO.addTxt(analysis.path, '\n' + JSON.stringify(analysis));
}
async function downBooks(){
    let i = 31;
    for(;i<=95;i++){
        let res = await NET.getHTML(`http://www.tsxsw.com/qb/${i}/`);
        if (res.status !== NET.Result.STATUS_SUCCESS) {
            throw new Error('获取网页失败!!!');
        } else {
            let doc = new Parser(res.message);
            let urls = doc.$('a');
            let remainUrls = new Set();
            for(let k =0;k<urls.length;k++){
                let href = urls[k].attr('href');
                if(/^http[:]\/\/www\.tsxsw\.com\/\html\/\d+\/\d+\/$/.test(href) && false===remainUrls.has(href)){
                    remainUrls.add(href);
                    console.log(href);
                    try{
                        await downBook(href);
                    } catch(err){
                        console.log(`down error:${err.message}`);
                    }
                }
            }
        }
    }
}
/*
downBook(entry.href).then(function () {
    console.log('下载完成');
}).catch(function (err) {
    console.log(`error:${err.message}`);
});
*/

downBooks().then(function(){
    console.log('end');
}).catch(function(err){
    console.log('err:'+err.message);
});
