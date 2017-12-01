/**
 * Created by zhangwei on 11/4/17.
 */
var GoogleSearch = require('google-search');
var async = require('async');
var request = require('request');
var cheerio = require('cheerio');

var DEFAULT_NUM = 10;
var DEFAULT_GL = "us";
var DEFAULT_SORT = "date";
var DEFAULT_FILTER = 1;
var DEFAULT_START = 1;
var DEFAULT_DATE_RESTRICT = "m[6]";
var DEFAULT_PAGE = 1;


//constructin function
var LinkedinHelper = function(config) {

    config = config || {};
    this.NUM = config.NUM || DEFAULT_NUM;
    this.GL = config.GL || DEFAULT_GL;
    this.KEY = config.KEY;
    this.CX = config.CX;
    this.FILTER = DEFAULT_FILTER;
    this.SORT = config.SORT || DEFAULT_SORT;
    this.START = config.START || DEFAULT_START;
    this.DATE_RESTRICT = config.DATE_RESTRICT || DEFAULT_DATE_RESTRICT;
    this.PAGE = config.PAGE || DEFAULT_PAGE;
    this.PAGE_ARR = generatePageArr(this.PAGE);
    this.googleSearch = new GoogleSearch({
        key: this.KEY,
        cx: this.CX
    });

};

function generatePageArr(page) {
    "use strict";
    var pages = [];
    for(var i=1;i<=page;i++){
        pages.push((i-1)*10+1);
    }
    return pages;
}

LinkedinHelper.prototype.getJobDescriptionAndLocation = function(link){
    return new Promise(function(resolve, reject) {
        var options = {
            method: "GET",
            url: link,
            maxRedirects: 0,
            followRedirect: false,
            timeout: 5000
        };
        request(options, function (error, response, html) {
            var res = {};
            if (!error && response.statusCode == 200) {
                var $ = cheerio.load(html);
                res.description = $('#content').html();
                res.location = $('#header > div').text();
                resolve(res);
            } else {
                resolve(res);
            }
        });
    });
};

LinkedinHelper.prototype.searchJobs = function(title, location) {
    const self = this;
    var result = [];
    var filter = new Set();

    var cseSearcher = function (startIndex, done) {
        self.googleSearch.build({
            q: title + " " + location,
            num: self.NUM,
            gl: self.GL,
            sort: self.SORT,
            filter: self.FILTER,
            start: self.START,
            dateRestrict: self.DATE_RESTRICT
        }, function (error, response) {
            if (error) {
                done(error)
            } else {
                var items = response.items;
                if (items === undefined || items.length === 0) {
                    done(null);
                }
                items.forEach(function (item) {
                    var res = {};
                    if (!item.title.toLowerCase().includes(location)) {
                        return;
                    }
                    res.link = item.pagemap.metatags[0]['og:url'];
                    if (filter.has(res.link)) {
                        return;
                    }
                    filter.add(res.link);
                    res.position = item.pagemap.metatags[0]['og:title'];
                    res.company = item.title.split('at')[1].split('in ')[0].trim().toLowerCase();
                    res.location = location;
                    //need to get description
                    result.push(res);
                });
                done(null);
            }
        });
    };

    return new Promise(function (resolve, reject) {
        async.eachLimit(self.PAGE_ARR, 1, cseSearcher, function (err) {
            "use strict";
            if (err) reject(err);
            else {
                resolve(result);
            }
        });
    });
};

module.exports = LinkedinHelper;