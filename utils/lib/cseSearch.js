/**
 * Created by zhangwei on 10/20/17.
 */
var GoogleSearch = require('google-search');
var async = require('async');

var DEFAULT_SITE_SEARCH = "www.linkedin.com/in";
var DEFAULT_NUM = 10;
var DEFAULT_GL = "us";
var DEFAULT_SORT = "date";
var DEFAULT_FILTER = 1;
var DEFAULT_START = 1;
var DEFAULT_DATE_RESTRICT = "m[6]";
var DEFAULT_PAGE = 1;

//constructin function
var FreePplSearch = function(config) {

    config = config || {};
    this.SITE_SEARCH = config.SITE_SEARCH || DEFAULT_SITE_SEARCH;
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


FreePplSearch.prototype.searchRecruiter = function(company){
    const self = this;
    var result = [];
    console.log(company);
    var cseSearcher = function(startIndex, done) {
        self.googleSearch.build({
            q: "technical recruiter at " + company,
            num: self.NUM,
            gl: self.GL,
            start: startIndex
        }, function (error, response) {
            if(error) {
                done(error)
            } else {
                var items = response.items;
                if (items === undefined || items.length === 0) {
                    done(null);
                } else {
                    items.forEach(function (item) {
                        var res = {};
                        if (item.pagemap.person === undefined) {
                            return;
                        }
                        res.role = item.pagemap.person[0].role;
                        res.company = item.pagemap.person[0].org;

                        if (res.role === undefined || res.company === undefined) {
                            return;
                        }

                        if (!res.role.toLowerCase().includes('recruit') || !res.company.toLowerCase().includes(company.toLowerCase())) {
                            return;
                        }

                        res.name = item.pagemap.hcard[0].fn;
                        res.link = item.link;
                        res.location = item.pagemap.person !== undefined ? item.pagemap.person[0].location : 'US';
                        res.avatar = item.pagemap.cse_image !== undefined ? item.pagemap.cse_image[0].src : undefined;
                        res.desc = item.snippet;

                        result.push(res);
                    });
                    done(null);
                }
            }
        });
    };

    return new Promise(function(resolve, reject) {
        async.eachLimit(self.PAGE_ARR, 1, cseSearcher, function (err) {
            "use strict";
            if(err) reject(err);
            else {
                resolve(result);
            }
        });
    });

};

FreePplSearch.prototype.searchGreenhouseJobs = function(title, location){
    const self = this;
    var result = [];

    var cseSearcher = function(startIndex, done) {
        self.googleSearch.build({
            q: title + " " + location,
            num: self.NUM,
            gl: self.GL,
            sort: self.SORT,
            filter: self.FILTER,
            start: self.START,
            dateRestrict: self.DATE_RESTRICT
        }, function (error, response) {
            if(error) {
                done(error)
            } else {
                var items = response.items;
                if (items === undefined || items.length === 0) {
                    done(null);
                }
                items.forEach(function (item) {
                    var res = {};
                    res.position = item.pagemap.metatags[0]['og:title'];
                    res.link = item.link;
                    res.company = item.title.toLowerCase().split(' at ')[1];
                    if (res.company == undefined || !res.company.match(/\w+/g)) {
                        res.company = res.link.split('\/')[3];
                    }
                    result.push(res);
                });
                done(null);
            }
        });
    };

    return new Promise(function(resolve, reject) {
        async.eachLimit(self.PAGE_ARR, 1, cseSearcher, function (err) {
            "use strict";
            if(err) reject(err);
            else {
                resolve(result);
            }
        });
    });

};

FreePplSearch.prototype.searchLinkedinJobs = function(title, location) {
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
                    res.company = item.title.split('at')[1].split('in ')[0].trim();
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

module.exports = FreePplSearch;