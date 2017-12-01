/**
 * Created by zhangwei on 4/11/17.
 */
var request = require('request').defaults({maxRedirects:500});
var dotenv = require('dotenv');
var jsonfile = require('jsonfile');
var http = require('http');

var ACCOUNT_PATH = "./config/accounts.json";
var DEBUG = false;

//constructin function
var Linkedinet = function(config) {

    config = config || {};
    this.DEBUG = config.debug || DEBUG;
    this.ACCOUNT_PATH = config.accountPath || ACCOUNT_PATH;
    this.accounts = jsonfile.readFileSync(this.ACCOUNT_PATH);

};

var cookiesOptions = {
    method: 'GET',
    url: 'https://www.linkedin.com/uas/login',
    headers:
        {
            'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Encoding':'gzip, deflate, sdch, br',
            'Accept-Language':'en,zh-CN;q=0.8,zh;q=0.6,zh-TW;q=0.4',
            'Cache-Control':'no-cache',
            'Connection':'keep-alive',
            'Host':'www.linkedin.com',
            'Upgrade-Insecure-Requests':1,
            'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36'
        },
    timeout: 10000
};

Linkedinet.prototype.fetchCsrfandCookies = function() {

    return new Promise(function(resolve, reject){
        request(cookiesOptions, function (error, response, body) {
            if (error) {
                reject(error);
            }

            const cookies = response.headers["set-cookie"];
            var strCookies = "";
            var csrf = null;

            cookies.map(v =>{
                if(/bcookie=/.test(v))
                    csrf = v.split('"')[1].split("&")[1];
                if(!(v.includes('delete me') || v.includes('deleteMe')))
                    strCookies += v.split(";")[0] +"; ";
            });

            resolve({
                cookies : strCookies,
                csrf : csrf,
                JSESSIONID: getJSESSIONID(cookies).replace(/['"]+/g, ''),
                authtoken: getAUTHTOKEN(cookies).replace(/['"]+/g, '')
            });
        });
    });

};

function getJSESSIONID (cookies) {

    for(var index in cookies) {
        if(cookies[index].includes('JSESSIONID=')) {
            var sessionid = cookies[index].split(';')[0].split('=')[1];
            if(sessionid !== 'delete me') {
                return sessionid;
            }
        }
    }
    return "[ERROR!]";
}

function getAUTHTOKEN (cookies) {

    for(var index in cookies) {
        if(cookies[index].includes('leo_auth_token=')) {
            return cookies[index].split('"')[1];
        }
    }
    return "[ERROR!]";
}

Linkedinet.prototype.loginAndGetToken = function(accountIndex){
    const self = this;
    return new Promise(function(resolve, reject){
        self.fetchCsrfandCookies().then(function(initTokens) {
            if(initTokens.authtoken === '[ERROR!]') {
                //already login
                console.log('already login...');
                resolve(initTokens);
            } else {
                //go to login
                console.log('going to login... in: ' + self.accounts[accountIndex].email);
                var form = {
                    'loginCsrfParam':initTokens.csrf,
                    'session_key':self.accounts[accountIndex].email,
                    'session_password':self.accounts[accountIndex].password
                };

                var tokenOptions = {
                    method: 'POST',
                    url: 'https://www.linkedin.com/uas/login-submit',
                    headers:
                        {
                            'cache-control': 'no-cache',
                            'Accept-Encoding':'gzip, deflate, sdch, br',
                            'Accept-Language':'en,zh-CN;q=0.8,zh;q=0.6,zh-TW;q=0.4',
                            'referer': 'https://www.linkedin.com/',
                            'accept': '*/*',
                            'content-type': 'application/x-www-form-urlencoded',
                            'user-agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2',
                            'x-requested-with': 'XMLHttpRequest',
                            'origin': 'https://www.linkedin.com',
                            'cookie': initTokens.cookies
                        },
                    'form': form,
                    timeout: 10000
                };

                request(tokenOptions, function (error, response, body) {
                    if (error) {
                        reject(error);
                    }
                    const cookies = response.headers["set-cookie"];
                    var strCookies = "";
                    var csrf = null;

                    cookies.map(v =>{
                        if(/bcookie=/.test(v))
                            csrf = v.split('"')[1].split("&")[1];
                        if(!(v.includes('delete me') || v.includes('deleteMe')))
                            strCookies += v.split(";")[0] +"; ";
                    });

                    resolve({
                        cookies : strCookies,
                        csrf : csrf,
                        JSESSIONID: initTokens.JSESSIONID
                    });
                });
            }
        });
    });
};

Linkedinet.prototype.fetchProfileContact = function(profileName) {

    const self = this;
    console.log("Fetching profile: " + profileName);
    var pickedAccountIndex = randomPick(self.accounts);
    return new Promise(function(resolve, reject){
        self.getCurrentToken(pickedAccountIndex).then(function(headerCredentials){
            self.goFetchProfileContact(profileName, headerCredentials)
                .then(function(contact){
                    resolve(contact);
                })
                .catch(function(err){
                    reject(err);
                });
        })
            .catch(function(err){
                reject(err);
            });
    });
};


Linkedinet.prototype.goFetchProfileContact = function (profileName, credentials) {
    const self = this;
    return new Promise((resolve, reject) => {

        var contactRequestOptions = {
            method: 'GET',
            url: 'https://www.linkedin.com/voyager/api/identity/profiles/' + profileName + '/profileContactInfo',
            headers: {
                'x-requested-with':'XMLHttpRequest',
                'x-restli-protocol-versio': '2.0.0',
                'pragma': 'no-cache',
                'X-LI-Lang': 'en_US',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36',
                'accept': 'application/vnd.linkedin.normalized+json',
                'csrf-token': credentials.JSESSIONID,
                'referer': 'https://www.linkedin.com/in/' + profileName,
                'accept-encoding': 'gzip, deflate, br',
                'accept-language': 'en,zh-CN;q=0.8,zh;q=0.6',
                'cookie': credentials.cookies
            },
            gzip: true,
            timeout: 10000
        };
        request(contactRequestOptions, function (error, response, body) {
            if (error) {
                reject(error);
            } else if(response.statusCode === 200) {
                resolve(JSON.parse(body));
            } else {
                reject(JSON.parse(body));
            }
        });

    });
};


Linkedinet.prototype.getCurrentToken = function (accountIndex) {
    const self = this;
    return new Promise(function(resolve, reject){
        self.loginAndGetToken(accountIndex).then(function(tokens) {
            resolve(tokens);
        });
    });
}

Linkedinet.prototype.getLoggedInIfImNot = function(accountIndex) {
    const self = this;
    var currentAccount = self.accounts[accountIndex];
    return new Promise(function(resolve, reject){
        if(currentAccount.csrf === ""
            || currentAccount.cookies === ""
            || (currentAccount.JSESSIONID === "" || currentAccount.JSESSIONID === "[ERROR!]")){
            self.fetchCsrfandCookies().then(function(json){
                //update account in json
                currentAccount.csrf = json.csrf;
                currentAccount.cookies = json.cookies;
                currentAccount.JSESSIONID = json.JSESSIONID;
                self.accounts[accountIndex] = currentAccount;
                jsonfile.writeFile(self.ACCOUNT_PATH, self.accounts, {spaces: 2}, function (err) {
                    if(err){
                        reject(err);
                    }
                    else{
                        self.accounts = jsonfile.readFileSync(self.ACCOUNT_PATH);
                    }
                });

                if(currentAccount.token === ""){
                    self.fetchToken(accountIndex).then(function(token){
                        currentAccount.token = token;
                        self.accounts[accountIndex] = currentAccount;
                        jsonfile.writeFile(self.ACCOUNT_PATH, self.accounts, {spaces: 2}, function (err) {
                            if(err){
                                reject(err);
                            }
                            else{
                                self.accounts = jsonfile.readFileSync(self.ACCOUNT_PATH);
                            }
                        });
                        return resolve();
                    })
                    .catch(function(err){
                        reject(err);
                    });
                }
                else{
                    return resolve();
                }

            })
            .catch(function(err){
                reject(err);
            });
        }
        else{
            return resolve();
        }
    });

};

Linkedinet.prototype.buildToken = function (accountIndex) {
    const self = this;
    var cookies_token = {
        'name'     : 'li_at',
        'value'    : self.accounts[accountIndex].cookies,
        'domain'   : 'www.linkedin.com',
        'path'     : '/',
        'httponly' : true,
        'secure'   : true,
        'expires'  : new Date("2217-11-11T18:24:17.000Z").getTime()
    };

    return cookies_token;
};

Linkedinet.prototype.goFetchProfile = function (profileName, accountIndex) {

};


Linkedinet.prototype.fetchProfile = function(profileName) {

    const self = this;
    var pickedAccountIndex = randomPick(self.accounts);
    return new Promise(function(resolve, reject){
        self.getLoggedInIfImNot(pickedAccountIndex).then(function(){
            self.goFetchProfile(profileName, pickedAccountIndex).then(function(profile){
                resolve(profile);
            })
            .catch(function(err){
               reject(err);
            });
        })
        .catch(function(err){
            reject(err);
        });
    });
};


Linkedinet.prototype.fetchEmployeeNum = function(companyId) {

    const self = this;
    var pickedAccountIndex = randomPick(self.accounts) || 0;
    return new Promise(function(resolve, reject){
        self.getLoggedInIfImNot(pickedAccountIndex).then(function(){
            self.goFetchEmployeeNum(companyId, pickedAccountIndex).then(function(num){
                resolve(num);
            })
                .catch(function(err){
                    reject(err);
                });
        })
            .catch(function(err){
                reject(err);
            });
    });
};


Linkedinet.prototype.getSearchId = function (){
    "use strict";
      return Math.floor((Math.random() * 10000) + 0) + 1492303504458;
};

// still get 401
Linkedinet.prototype.fetchEmployeesOptions = function (accountIndex, companyId, start){
    const self = this;
    var  fetchEmployeesOptions = {
        method: 'GET',
        url: 'https://www.linkedin.com/voyager/api/search/cluster?count=10&guides=List(v-%3EPEOPLE,facetCurrentCompany-%3E'+companyId+')&origin=OTHER&q=guided&searchId='+self.getSearchId()+'&start='+start,
        headers: {
            'X-LI-Lang': 'en_US',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36',
            'Accept': 'application/vnd.linkedin.normalized+json',
            'Csrf-Token': self.accounts[accountIndex].JSESSIONID,
            'Referer': 'https://www.linkedin.com/search/results/people/?facetCurrentCompany=%5B'+companyId+'%5D',
            'Accept-Encoding': 'gzip, deflate, sdch, br',
            'Accept-Language': 'en,zh-CN;q=0.8,zh;q=0.6,zh-TW;q=0.4',
            'Cookie': self.accounts[accountIndex].cookies
        }
    };
    return fetchEmployeesOptions;
};


Linkedinet.prototype.goFetchEmployeeNum = function (companyId, accountIndex) {
    const self = this;
    return new Promise((resolve, reject) => {
        request(self.fetchEmployeesOptions(accountIndex, companyId, 0), function (error, response, body) {
            if (error) {
                reject(error);
                throw new Error(error);
            }
            else{
                resolve(body);
            }
        });
    });
};

Linkedinet.prototype.fetchProfile = function(profileName) {

    const self = this;
    var pickedAccountIndex = randomPick(self.accounts) || 0;
    return new Promise(function(resolve, reject){
        self.getLoggedInIfImNot(pickedAccountIndex).then(function(){
            self.goFetchProfile(profileName, pickedAccountIndex).then(function(profile){
                resolve(profile);
            })
                .catch(function(err){
                    reject(err);
                });
        })
            .catch(function(err){
                reject(err);
            });
    });
};

function randomPick(accounts) {
    //return 0;
    return Math.floor((Math.random() * accounts.length) + 0);

}



module.exports = Linkedinet;