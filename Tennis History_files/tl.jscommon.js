//Name space
var TL = TL || {} ;

//For support safari click 
function safeClick(elm) {
    if (document.createEvent) {
        var eventObj = document.createEvent('MouseEvents');
        eventObj.initEvent('click', true, true);
        elm.dispatchEvent(eventObj);
    } else {
        elm.click();
    }
};
function getBrowserInfo() {
    var Sys = {};
    var ua = navigator.userAgent.toLowerCase();
    var re = /(msie|firefox|chrome|opera|version).*?([\d.]+)/;
    var m = ua.match(re);
    Sys.browser = m[1].replace(/version/, "'safari");
    Sys.ver = m[2];
    return Sys;
};
String.format = function (str) {
    /*if (str && str.length > 0) {
        var args = arguments, re = new RegExp("%([1-" + args.length + "])", "g");
        return String(str).replace(re, function ($1, $2) {
            return args[$2];
        });
    }*/
    var args = [].slice.apply(arguments);
    var format = args.shift();

    return format.replace(/{(\d+)}/g, function () {
        return args[arguments[1]];
    });
};
String.prototype.reverse = function () {
    if (this.length == 0)
        return this;

    var i = this.length;
    var dstr = "";
    while (--i >= 0) {
        dstr += str.charAt(i);
    }
    return dstr;
};

String.removeAllSpace = function (str) {
  return str.replace(/\s+/g, "");
};

String.compressHtml = function(str){
    str = str.replace(/>\s+?</g, "><");
   return str.replace(/\r\n\s*/g,"");
};

String.removeHtmlTag = function (str) {
    return str.replace(/<\/?[^>]*>/g, "");
};

String.prototype.replaceAll  = function(s1,s2){     
    return this.replace(new RegExp(s1,"gm"),s2);     
};

String.prototype.startWith = function (str) {
    if (str == null || str == "" || this.length == 0 || str.length > this.length)
        return false;
    return this.substr(0, str.length) === str;
};
String.prototype.endWith = function (str) {
    if (str == null || str == "" || this.length == 0 || str.length > this.length)
        return false;
    return this.substring(this.length - str.length) == str;
};

var _prototypeToString = Object.prototype.toString,
    _arrayTypeString = '[object array]';

/*Object.deepClone = function (source, target) {
    target = target || {};
    for (var i in source) {
        if (source.hasOwnProperty(i)) {
            var item = source[i];
            if (typeof item === 'object') {
                target[i] = (_prototypeToString.apply(item).toLowerCase() === _arrayTypeString) ? [] : {};
                Object.deepClone(item, target[i]);
            } else {
                target[i] = item;
            }
        }
    }
    return target;
};*/

var isString = function isString(value) { return typeof value === 'string'; }
var isNumber = function isNumber(value) { return !isNaN(value); }
var isObject = function isObject(value) { return value != null && typeof value === 'object'; }
var isDate = function isDate(value) { return toString.call(value) === '[object Date]'; }
var isDefined = function isDefined(value) { return typeof value !== 'undefined'; }
var isFunction = function isFunction(value) { return typeof value == 'function'; }
var isArray = (function () {
    if (!isFunction(Array.isArray)) {
        return function (value) {
            return toString.call(value) === '[object Array]';
        };
    }
    return Array.isArray;
})();

function isInteger(obj) {
    return obj % 1 === 0
}

function isArrayLike(obj) {
    if (obj == null || isWindow(obj)) {
        return false;
    }
    var length = obj.length;
    if (obj.nodeType === 1 && length) {
        return true;
    }
    return isString(obj) || isArray(obj) || length === 0 ||
           typeof length === 'number' && length > 0 && (length - 1) in obj;
}
function tryDecodeURIComponent(value) {
    try {
        return decodeURIComponent(value);
    } catch (e) {
        /*Ignore any invalid uri component*/
        return value;
    }
}

function forEach(obj, iterator, context) {
    var key, length;
    if (obj) {
        if (isFunction(obj)) {
            for (key in obj) {
                // Need to check if hasOwnProperty exists,
                // as on IE8 the result of querySelectorAll is an object without a hasOwnProperty function
                if (key != 'prototype' && key != 'length' && key != 'name' && (!obj.hasOwnProperty || obj.hasOwnProperty(key))) {
                    iterator.call(context, obj[key], key);
                }
            }
        } else if (isArray(obj) || isArrayLike(obj)) {
            for (key = 0, length = obj.length; key < length; key++) {
                iterator.call(context, obj[key], key);
            }
        } else if (obj.forEach && obj.forEach !== forEach) {
            obj.forEach(iterator, context);
        } else {
            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    iterator.call(context, obj[key], key);
                }
            }
        }
    }
    return obj;
}
(function () {
    function parseKeyValue(/**string*/keyValue) {
        var obj = {}, key_value, key;
        forEach((keyValue || "").split('&'), function (keyValue) {
            if (keyValue) {
                key_value = keyValue.split('=');
                key = tryDecodeURIComponent(key_value[0]);
                if (isDefined(key)) {
                    var val = isDefined(key_value[1]) ? tryDecodeURIComponent(key_value[1]) : true;
                    if (!obj[key]) {
                        obj[key] = val;
                    } else if (isArray(obj[key])) {
                        obj[key].push(val);
                    } else {
                        obj[key] = [obj[key], val];
                    }
                }
            }
        });
        return obj;
    }
    String.prototype.isNullOrEmpty = function () {
        return this === null || this.length == 0;
    }
    Date.prototype.formatString = function (formator) {
        var returnText = formator.toUpperCase();
        if (returnText.indexOf("YYYY") > -1) {
            returnText = returnText.replace("YYYY", this.getFullYear());
        }
        if (returnText.indexOf("MM") > -1) {
            returnText = returnText.replace("MM", this.getMonth() + 1);
        }
        if (returnText.indexOf("DD") > -1) {
            returnText = returnText.replace("DD", this.getDate());
        }
        if (returnText.indexOf("HH") > -1) {
            returnText = returnText.replace("HH", this.getHours());
        }
        if (returnText.indexOf("MI") > -1) {
            returnText = returnText.replace("MI", this.getMinutes());
        }
        if (returnText.indexOf("SS") > -1) {
            returnText = returnText.replace("SS", this.getSeconds());
        }
        if (returnText.indexOf("SI") > -1) {
            returnText = returnText.replace("SI", this.getMilliseconds());
        }
        return returnText;
    }

    var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var base64DecodeChars = new Array(
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
        52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1,
        -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
        15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1,
        -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
        41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);

    function getSearchString() {
        var hash = window.location.hash;
        if (hash && hash.length > 0) {
            var s = hash.indexOf("?");
            return hash.substr(s + 1, hash.length - s);
        }
        return window.location.search.replace(/^\?/, '');
    }

    TL.JSCommon = {
        extend: function (source, target) {
            target = target || {};
            for (var i in source) {
                if (source.hasOwnProperty(i)) {
                    target[i] = source[i];
                }
            }
            return target;
        },
        /**
       * getUrlParameter()
       * Get url parameters by key or get all.
       * @param {key} string
       * @return {Object}/{String}
       */
        getUrlParameter: function (key) {
            var search = getSearchString();
            return key ? parseKeyValue(search)[key]
                : parseKeyValue(search);
        },
        setUrlParameterVal: function (key, val) {
            var search = window.location.href;
            if(search.indexOf(key)!=-1)
            {
                var oldStr = key + "=" + TL.JSCommon.getUrlParameter(key);
                var newStr = key + "=" + val;
                search = search.replace(oldStr, newStr);
            }
            else
            {
                if(search.indexOf("?")!=-1)
                {
                    search += "&" + key + "=" + val;
                }
                else
                {
                    search += "?" + key + "=" + val;
                }
            }
            return search;
        },
        strToDate: function (strDate) {
            var re = new RegExp('\\/Date\\(([-+])?(\\d+)(?:[+-]\\d{4})?\\)\\/');
            var r = (strDate || '').match(re);
            return r ? new Date(((r[1] || '') + r[2]) * 1) : null;
        },
        /**
        * cloneObject(obj)
        * Clones a object and eliminate all references to the original contexts
        * @param {Object} obj
        * @return {Object}
        */
        cloneObject: function (obj) {
            var hash, newObj;
            if (obj) {
                hash = JSON.stringify(obj);
                newObj = JSON.parse(hash);
            }
            else {
                newObj = {};
            }
            return newObj;
        },
        encode64: function (input) {
            var str = input;
            var out, i, len;
            var c1, c2, c3;
            len = str.length;
            i = 0;
            out = "";
            while (i < len) {
                c1 = str.charCodeAt(i++) & 0xff;
                if (i == len) {
                    out += base64EncodeChars.charAt(c1 >> 2);
                    out += base64EncodeChars.charAt((c1 & 0x3) << 4);
                    out += "==";
                    break;
                }
                c2 = str.charCodeAt(i++);
                if (i == len) {
                    out += base64EncodeChars.charAt(c1 >> 2);
                    out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
                    out += base64EncodeChars.charAt((c2 & 0xF) << 2);
                    out += "=";
                    break;
                }
                c3 = str.charCodeAt(i++);
                out += base64EncodeChars.charAt(c1 >> 2);
                out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
                out += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
                out += base64EncodeChars.charAt(c3 & 0x3F);
            }
            return out;
        },
        decode64: function (input) {
            var str = input;
            var c1, c2, c3, c4;
            var i, len, out;
            len = str.length;
            i = 0;
            out = "";
            while (i < len) {
                /* c1 */
                do {
                    c1 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
                } while (i < len && c1 == -1);
                if (c1 == -1)
                    break;
                /* c2 */
                do {
                    c2 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
                } while (i < len && c2 == -1);
                if (c2 == -1)
                    break;
                out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));
                /* c3 */
                do {
                    c3 = str.charCodeAt(i++) & 0xff;
                    if (c3 == 61)
                        return out;
                    c3 = base64DecodeChars[c3];
                } while (i < len && c3 == -1);
                if (c3 == -1)
                    break;
                out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));
                /* c4 */
                do {
                    c4 = str.charCodeAt(i++) & 0xff;
                    if (c4 == 61)
                        return out;
                    c4 = base64DecodeChars[c4];
                } while (i < len && c4 == -1);
                if (c4 == -1)
                    break;
                out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
            }
            return out;
        },
        /* Please note base64 encoded string may end with '=', so this can only be used when encoding the whole query string */
        encode64forUrlParameter: function (str) {
            return TL.JSCommon.encode64(str).replace(/\+/g, '-').replace(/\//g, '_');
        },
        decode64forUrlParameter: function (str) {
            return TL.JSCommon.decode64(str.replace(/-/g, '+').replace(/_/g, '/'));
        },
        trim: function (input) {
            if (isString(input)) {
                input = input.replace(/(^\s*)|(\s*$)/g, "");
            }
            return input;
        },
        postToPage: function (pageUrl, keyValuePairs) {
            var formId = "form_PostToPageGenerate";
            var form = $("#" + formId);
            if (form.length > 0) {
                form.remove();
            }

            form = $("<form id='" + formId + "'>");
            form.attr('style', 'display:none');
            form.attr('target', '');
            form.attr('method', 'post');
            form.attr('action', pageUrl);
            $('body').append(form);

            for (var i in keyValuePairs) {
                var param = $('<input type="hidden">');
                param.attr('name', keyValuePairs[i].key);
                param.val(keyValuePairs[i].value);
                form.append(param);
            }
            form.submit();
        },
        Logout: function (returnURL) {
           
            var url = "https://" + GetTennisLinkHostname() + "/Dashboard/Service/DashboardService.svc/Logout";
            var protocol = window.location.protocol.toLowerCase();

            if (protocol == "https:")
            {
                TL.JSCommon.Ajax().get(url, function (ret) {
                    TL.JSCommon.CookieUtil.DeleteCookie("tluuid");
                    TL.JSCommon.CookieUtil.DeleteCookie("tlemailId");
                    TL.JSCommon.CookieUtil.DeleteCookie("ssou");
                    TL.JSCommon.CookieUtil.DeleteCookie("ProfileToken");
                    window.location.href = returnURL;
                });
            }
            else
            {
                if ($.support.cors) {
                    TL.JSCommon.Ajax().getX(url, function (ret) {
                        TL.JSCommon.CookieUtil.DeleteCookie("tluuid");
                        TL.JSCommon.CookieUtil.DeleteCookie("tlemailId");
                        TL.JSCommon.CookieUtil.DeleteCookie("ssou");
                        TL.JSCommon.CookieUtil.DeleteCookie("ProfileToken");
                        window.location.href = returnURL;
                    });
                }
                else
                {
                    $("#ifrmSyncUSTASSO").attr("src", url);
                    setTimeout(function() {
                        TL.JSCommon.CookieUtil.DeleteCookie("tluuid");
                        TL.JSCommon.CookieUtil.DeleteCookie("tlemailId");
                        TL.JSCommon.CookieUtil.DeleteCookie("ssou");
                        TL.JSCommon.CookieUtil.DeleteCookie("ProfileToken");
                        window.location.href = returnURL;
                    }, 2000);
                }
            }
            
        }
    };
    TL.JSCommon.DataUtil = {
        seperateThreeAsOneRow: function (data) {
            if (data.length > 0) {
                var newArray1 = [], newArray2 = [], newArray3 = [], newArray = [];
                m = Math.floor(data.length / 3) + 1;

                for (var i = 0; i < data.length; i++) {
                    var item = data[i], mi = Math.floor(i / m);
                    if (mi == 0) {
                        newArray1.push(item);
                    }
                    if (mi == 1) {
                        newArray2.push(item);
                    }
                    if (mi == 2) {
                        newArray3.push(item);
                    }
                }
                for (var j = 0; j < m; j++) {
                    var l = {}, c = {}, r = {};
                    if (newArray1.length > j) {
                        l = newArray1[j];
                    }
                    if (newArray2.length > j) {
                        c = newArray2[j];
                    }
                    if (newArray3.length > j) {
                        r = newArray3[j];
                    }
                    newArray.push({ left: l, center: c, right: r });
                }
                return newArray;
            }
            return data;
        },
        seperateTwoAsOneRow: function (data) {
            if (data.length > 0) {
                var newArray = [],
                mIndex = Math.floor(data.length / 2),
                isEven = (data.length % 2) === 0,
                lIndex = 0,
                rIndex = isEven ? mIndex : mIndex + 1;

                while (true) {
                    if (lIndex < mIndex) {
                        newArray.push({ left: data[lIndex], right: data[rIndex] });
                    } else {
                        if (!isEven) {
                            newArray.push({ left: data[lIndex], right: {} });
                        }
                        break;
                    }
                    lIndex++; rIndex++;
                }
                return newArray;
            }
            return data;
        }
    };
    TL.JSCommon.CollUtil = {
        find: function (arr, func, includeInx) {
            if (arr == null || arr.length == 0) {
                return null;
            }

            for (var i = 0; i < arr.length; i++) {
                var item = arr[i];
                if (func.call({ inx: i, item: item }, item)) {
                    if (includeInx) {
                        return { item: item, index: i };
                    } else {
                        return item;
                    }
                }
            }
            return null;
        },
        getDistinctValue: function (arr, name) {
            var values = [];
            $.each(arr, function (index, val) {
                if ($.inArray(val[name], values) < 0) {
                    values.push(val[name]);
                }
            });
            return values.sort();
        },
        groupBy: function (arr, func) {
            if (arr == null || arr.length == 0 || func == null) {
                return {};
            }

            var retObj = {};
            for (var i = 0; i < arr.length; i++) {
                var item = arr[i];
                var key = func(item);

                var list = retObj[key];
                if (list) {
                    list.push(item);
                } else {
                    retObj[key] = [item];
                }
            }
            return retObj;
        },
        remove: function (arr, func) {
            if (arr && arr.length > 0 && func) {
                var delArr = [];
                for (var i = 0; i < arr.length; i++) {
                    if (func(arr[i])) { delArr.push(i); }
                }

                if (delArr.length > 0) {
                    for (var j = delArr.length - 1; j >= 0; j--) {
                        arr.splice(delArr[j], 1);
                    }
                }
            }
        },
        filter: function (arr, func) {
            if (arr == null || arr.length == 0 || func == null) {
                return arr;
            }

            var retArr = [];
            for (var i = 0; i < arr.length; i++) {
                var item = arr[i];
                if (func(item)) retArr.push(item);
            }
            return retArr;
        },
        join: function (arr, func, splitter) {
            if (arr == null || arr.length == 0 || func == null) {
                return "";
            }
            var retArr = []; splitter = splitter || ',';
            for (var i = 0; i < arr.length; i++) {
                var temp = func(arr[i]);
                retArr.push(temp);
            }
            return retArr.join(splitter);
        }
    };
})();

(function ($, window) {

    function IsLocalStorageEnable() {
        var localStorageReallyWorks = false;
        if ("localStorage" in window) {
            try {
                window.localStorage.setItem("_tmptest", "tmpval");
                localStorageReallyWorks = true;
                window.localStorage.removeItem("_tmptest");
            } catch (e) {
            }
        }
        if (localStorageReallyWorks) {
             try {
                 if (window.localStorage) {
                     return true;
                 }
             } catch (e) {
             }
        }
        return false;
    }

    function checkKey(key) {
        if (typeof key != "string" && typeof key != "number") { throw new TypeError("Key name must be string or numeric"); }
        if (typeof key == "number") {
            key = key.toString();
        }
        return key;
    }

    var storageCache = function () {
        var self = {
            Get: function (key) {
                /// <signature>
                /// <param name='key' type='String'/>
                /// </signature>
                return localStorage.getItem(key);
            },
            Set: function (key, data) {
                /// <signature>
                /// <param name='key' type='String'/>
                /// <param name='data' type='Object'/>
                /// </signature>
                localStorage.setItem(key, data)
            },
            Remove: function (key) {
                /// <signature>
                /// <param name='key' type='String'/>
                /// </signature>
                localStorage.removeItem(key)
            },
            Clear: function () {
                localStorage.clear();
            }
        };

        return self;
    };

    var cookieCache = function () {
        var self = {
            defaultExpiredays: 2,
            Get: function (key) {
                /// <signature>
                /// <param name='key' type='String'/>
                /// </signature>
                if (document.cookie.length > 0) {
                    var startIndex = document.cookie.indexOf(key + "=");
                    if (startIndex != -1) {
                        startIndex = startIndex + key.length + 1;
                        var endIndex = document.cookie.indexOf(";", startIndex);
                        if (endIndex == -1) endIndex = document.cookie.length;
                        return unescape(document.cookie.substring(startIndex, endIndex));
                    }
                }
                return null;
            },
            Set: function (key, data) {
                /// <signature>
                /// <param name='key' type='String'/>
                /// <param name='data' type='Object'/>
                /// </signature>
                var exdate = new Date();
                //exdate.setDate(exdate.getDate() + self.defaultExpiredays);
                //document.cookie = key + "=" + escape(data) + ";expires=" + exdate.toGMTString();
                document.cookie = key + "=" + escape(data) + ";";
            },
            Remove: function (key) {
                /// <signature>
                /// <param name='key' type='String'/>
                /// </signature>
                var exdate = new Date();
                exdate.setDate(exdate.getDate() -1);
                document.cookie = key + "=;expires=" + exdate.toGMTString();
            },
        };

        return self;
    };

    var innerService = function () {
        var container = null;

        if (IsLocalStorageEnable()) {
            container = new storageCache();
        } else {
            container = new cookieCache();
        }

        var self = {
            Get: function (key) {
                /// <signature>
                /// <param name='key' type='String'/>
                /// </signature>
                key = checkKey(key);
                var obj = container.Get(key);
                if (obj == null) {
                    return null;
                }
                return JSON.parse(TL.JSCommon.decode64(obj));
            },
            Set: function (key, obj) {
                /// <signature>
                /// <param name='key' type='String'/>
                /// <param name='obj' type='JSON Object'/>
                /// </signature>
                key = checkKey(key);
                if (typeof obj == "undefined") {
                    container.remove(key);
                    return;
                }
                if (typeof obj != "object") {
                    throw new TypeError("obj must be JSON Object");;
                }
                container.Set(key, TL.JSCommon.encode64(JSON.stringify(obj)));
            },
            Remove: function (key) {
                /// <signature>
                /// <param name='key' type='String'/>
                /// </signature>
                key = checkKey(key);
                container.Remove(key);
            }
        };

        return self;
    };

    TL.JSCommon.Cache = new innerService();
})(window.jQuery, window);

(function ($, window) {
    var innerService = function () {
        function SegmentGenerator() {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }
        function GenerateGuid() {
            return (SegmentGenerator() + SegmentGenerator() + "-" + SegmentGenerator() + "-" + SegmentGenerator() + "-" + SegmentGenerator() + "-" + SegmentGenerator() + SegmentGenerator() + SegmentGenerator());
        }
        var self = {
            "new": function () {
                return GenerateGuid();
            }
        };
        return self;
    };
    TL.JSCommon.GUID = new innerService();
})(window.jQuery, window);

(function ($, window) {
    var innerService = function () {
        var self = {
            GetCookie: function (name) {
                var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
                
                if (arr = document.cookie.match(reg))
                    return unescape(arr[2]);
                else
                    return null;
            },
            AddCookie: function (name, value, expireDays) {
                var Days = expireDays || 30;
                var exp = new Date();
                exp.setTime(exp.getTime() + Days*24*60*60*1000);
                document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString() + ";path=/";
            },
            AddCookie_new: function (name, value, expireDays, domain, path) {
                var days = expireDays || 30;
                domain = domain || location.host;
                path = path || "/";
                var exp = new Date();
                exp.setTime(exp.getTime() + days * 24 * 60 * 60 * 1000);
                document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString() + ";domain=" + domain + ";path=" + path;
            },
            DeleteCookie: function(name) {
                var exp = new Date();
                exp.setTime(exp.getTime() - 1);
                var cval = TL.JSCommon.CookieUtil.GetCookie(name);
                if (cval != null)
                    document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString() + ";path=/";
            }
        };
        return self;
    };
    TL.JSCommon.CookieUtil = new innerService();
})(window.jQuery, window);

function Hashtable() {
    this._hashValue = new Object();
    this._iCount = 0;
}
Hashtable.prototype.add = function (strKey, value) {
    if (!strKey) {
        throw "hash value not allow null!";
    }
    if (typeof (strKey) == "string") {
        this._hashValue[strKey] = typeof (value) != "undefined" ? value : null;
        this._iCount++;
        return true;
    }
}
Hashtable.prototype.get = function (key) {
    if (!key) {
        throw "hash value not allow null!";
    }

    if (typeof (key) == "string" && this._hashValue[key] != typeof ('undefined')) {
        return this._hashValue[key];
    }
    if (typeof (key) == "number")
        return this._getCellByIndex(key);

    return null;
}
Hashtable.prototype.contains = function (key) {
    return this.get(key) != null;
}
Hashtable.prototype.findKey = function (iIndex) {
    if (typeof (iIndex) == "number")
        return this._getCellByIndex(iIndex, false);
    else
        throw "parameter must be a number!";
}
Hashtable.prototype.count = function () {
    return this._iCount;
}
Hashtable.prototype._getCellByIndex = function (iIndex, bIsGetValue) {
    vari = 0;
    if (bIsGetValue == null) bIsGetValue = true;
    for (var key in this._hashValue) {
        if (i == iIndex) {
            return bIsGetValue ? this._hashValue[key] : key;
        }
        i++;
    }
    return null;
}
Hashtable.prototype.remove = function (key) {
    for (var strKey in this._hashValue) {
        if (key == strKey) {
            delete this._hashValue[key];
            this._iCount--;
        }
    }
}
Hashtable.prototype.clear = function () {
    for (var key in this._hashValue) {
        delete this._hashValue[key];
    }
    this._iCount = 0;
}

Hashtable.prototype.each = function (iterator) {
    if (iterator) {
        for (var strKey in this._hashValue) {
            iterator(strKey, this._hashValue[strKey]);
        }
    }
}
Hashtable.prototype.toString = function (s) {
    var str = "";
    s = s || ",";
    this.each(function (key, val) {
        if (str.length > 0) str += s;
        str += (key + "=" + val);
    });
    return str;
}
Hashtable.fromString = function (str, s) {
    if (str) {
        s = s || ",";
        var arr = str.split(s);
        if (arr.length > 0) {
            var table = new Hashtable();
            for (var i = 0; i < arr.length; i++) {
                var token = arr[i];
                var tokenArr = token.split("=");
                table.add(tokenArr[0], tokenArr[1]);
            }
            return table;
        }
    }
    return null;
}

function SendToExcel(fileName, container, application) {
    var div = $(container);
    var copy = div.clone(true);

    var htmlContent = "";
    var source = $('[data-tag_export_to="Excel"]', copy);

    //$(':not(:visible)', $('[data-tag_export_to="Excel"]')).remove();
    //div.replaceWith(copy);
    $('[data-tag_exclude_export_from="Excel"]', source).remove();
    //htmlContent = source.prop("outerHTML");
    $.each(source, function (index, val) {
        var newhtmlObj = $(val.outerHTML);
        $('[data-tag_exclude_export_from="Excel"]', newhtmlObj).remove();
        htmlContent += newhtmlObj[0].outerHTML;
    });

    //div.replaceWith(copy);
    var formId = "temp_SendToExcel";
    var form = $("#" + formId);
    if (form.length > 0) {
        form.remove();
    }

    form = $("<form id='" + formId + "'>");
    form.attr('style', 'display:none');
    form.attr('target', '');
    form.attr('method', 'post');
    var downloadFileUrl = "/Dashboard/DownloadFile.aspx";
    form.attr('action', downloadFileUrl);

    var outPutValue = $('<input type="hidden">');
    outPutValue.attr('name', 'fileContent');
    htmlContent = String.compressHtml(htmlContent);
    htmlContent = HtmlEncode(htmlContent);
    outPutValue.val(htmlContent);

    var fileNameInput = $('<input type="hidden">');
    fileNameInput.attr('name', 'fileName');
    fileNameInput.val(fileName);

    var applicationInput = $('<input type="hidden">');
    applicationInput.attr('name', 'application');
    applicationInput.val(application);

    var fileFormat = $('<input type="hidden">');
    fileFormat.attr('name', 'fileFormat');
    fileFormat.val('6');

    $('body').append(form);
    form.append(fileNameInput);
    form.append(outPutValue);
    form.append(fileFormat);
    form.append(applicationInput);
    form.submit();
}

function getCurrentApplicationUrl() {
    var url = window.location.href;
    var segs = url.split("/", 4);
    return segs[0] + "//" + segs[2] + "/" + segs[3];
}

function HtmlEncode(str) {
    var div = document.createElement("div");
    var text = document.createTextNode(str);
    div.appendChild(text);
    return div.innerHTML;
}
function HtmlDecode(str) {
    var div = document.createElement("div");
    div.innerHTML = str;
    return div.innerHTML;
}

function GetTennisLinkHostname() {
    var hostname = window.location.hostname;
    return hostname.toLowerCase().startWith("m.") ? hostname.substr(2) : hostname;
}
function GetHostname() {
    return window.location.hostname;
}
function GetProtocol()
{
    return window.location.protocol;
}

function IsMobilizer() {
    return window.location.hostname.toLowerCase().startWith("m.");
}

(function ($, window) {
    function mergeAjaxOption(url, data, successCallback, option) {
        if (!option) {
            option = {};
        }

        if (url) {
            option.url = url;
        }

        if (data) {
            option.data = JSON.stringify(data);
        }

        if (successCallback && typeof successCallback == "function") {
            option.success = function (data, textStatus, jqXhr) {                
                successCallback(data, textStatus, jqXhr);
            }
        }

        return option;
    }

    TL.JSCommon.Ajax = function (option) {
        var defaultOption = {
            contentType: "application/json;charset=UTF-8",
            dataType: "json",
            cache: false,
            async: false
        };

        if (!option) {
            option = {};
        }

        $.extend(defaultOption, option);

        var optionX = {};
        $.extend(optionX, defaultOption);
        optionX.crossDomain = true;
        optionX.xhrFields = {
            withCredentials: true
        };

        var ajax = {
            "get": function (url, successCallback) {
                var opt = mergeAjaxOption(url, null, successCallback, defaultOption);
                opt.type = "GET";
                return $.ajax(opt);
            },
            "getX": function (url, successCallback) {
                var opt = mergeAjaxOption(url, null, successCallback, optionX);
                opt.type = "GET";
                return $.ajax(opt);
            },
            "post": function (url, data, successCallback) {
                var opt = mergeAjaxOption(url, data, successCallback, defaultOption);
                opt.type = "POST";
                return $.ajax(opt);
            },
            "postX": function (url, data, successCallback) {
                var opt = mergeAjaxOption(url, data, successCallback, optionX);
                opt.type = "POST";
                return $.ajax(opt);
            },
            "put": function (url, data, successCallback) {
                var opt = mergeAjaxOption(url, data, successCallback, defaultOption);
                opt.type = "PUT";
                return $.ajax(opt);
            },
            "putX": function (url, data, successCallback) {
                var opt = mergeAjaxOption(url, data, successCallback, optionX);
                opt.type = "PUT";
                return $.ajax(opt);
            },
            "delete": function (url, data, successCallback) {
                var opt = mergeAjaxOption(url, data, successCallback, defaultOption);
                opt.type = "DELETE";
                return $.ajax(opt);
            },
            "deleteX": function (url, data, successCallback) {
                var opt = mergeAjaxOption(url, data, successCallback, optionX);
                opt.type = "DELETE";
                return $.ajax(opt);
            }
            
        };

        return ajax;
    };
})(window.jQuery, window);


TL.MonitorUserChangeCookie = "refreshUserState";

var _SN = TL.JSCommon.GUID.new().toLowerCase();
TL.Locker = {
    CookieName: "RefreshLocker",
    Locked: function() {
        var s = TL.JSCommon.CookieUtil.GetCookie(TL.Locker.CookieName);
        if (!s) {
            return false;
        }

        var v = JSON.parse(s);
        var lockTime = v.time;
        return new Date().getTime() - lockTime < 30 * 1000;
    },
    Release: function() {
        TL.JSCommon.CookieUtil.DeleteCookie(TL.Locker.CookieName);
    },
    Lock: function () {
        var v = { session: _SN, time: new Date().getTime() };
        TL.JSCommon.CookieUtil.AddCookie(TL.Locker.CookieName, JSON.stringify(v), 1);
    },
    ApplyLocker: function(action) {
        if (!action || typeof action != "function") return;
        if (!TL.Locker.Locked()) {
            TL.Locker.Lock();
            setTimeout(function() {
                var s = TL.JSCommon.CookieUtil.GetCookie(TL.Locker.CookieName);
                var v = JSON.parse(s);
                if (v.session === _SN) {
                    action();
                }
            }, 500);
        }
    }
};

$(function() {
    if (window.location.href.toLowerCase().indexOf("syncustasso.aspx") == -1) {
        TL.Locker.Release();
        var lastRefreshTime = TL.JSCommon.CookieUtil.GetCookie(TL.MonitorUserChangeCookie);
        if (!lastRefreshTime) {
            lastRefreshTime = 0;
        }

        var h = setInterval(function() {
            var refresh = TL.JSCommon.CookieUtil.GetCookie(TL.MonitorUserChangeCookie);
            if (refresh) {
                if (refresh > lastRefreshTime) {
                    var org = window.location.href;
                    var u = window.location.href.toLowerCase();
                    if (u.indexOf("dashboard/main/login.aspx") > 0 && u.indexOf("syncimd=1") <= 0) {
                        if (u.indexOf("?") > 0) {
                            org += "&syncimd=1";
                        } else {
                            org += "?syncimd=1";
                        }
                    }

                    TL.Locker.ApplyLocker(function () {
                        var host = location.host.toLowerCase();
                        if (host.startWith("m.")) {
                            var url = "https://" + location.hostname + "?g=" + new Date().getTime();
                            window.location.href = url;
                        } else {
                            window.location.href = org;
                        }
                        clearInterval(h);
                    });
                }
            }
        }, 1000);
    }
});
 