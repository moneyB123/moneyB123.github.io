
var pagesHistoryCookieName = "TL_PERSON_RECENT_PAGES";
var channelsHistoryCookieName = "TL_PERSON_RECENT_CHANNELS";
var pagesHistoryCnt = 10;
var channelsHistoryCnt = 10;
var expirationDays = 100;
var domainNameWidget = "";

if (document.URL.toLowerCase().indexOf('staging') > -1 || document.URL.toLowerCase().indexOf('qa') > -1) {
    domainNameWidget = "staging.usta.com";
} else {
    domainNameWidget = "usta.com";
}

// Sets the cookie value
function setCookie(name, value, expires, path, domain) {
    var cookie = name + "=" + encodeURIComponent(value) + ";";

    if (expires) {
        if (expires instanceof Date) {
            if (isNaN(expires.getTime()))
                expires = new Date();
        }
        else
            expires = new Date(new Date().getTime() + parseInt(expires) * 1000 * 60 * 60 * 24);
        cookie += "expires=" + expires.toGMTString() + ";";
    }
    if (path)
        cookie += "path=" + path + ";";
    if (domain)
        cookie += "domain=" + domain + ";";
    document.cookie = cookie;
}

// Gets the cookie value
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0)
            return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
}

// Adds to the cookie value
function addToCookieValue(cookieVal, v) { return v + "|" + cookieVal; }

// Returns N recent items from the cookie value
function getTopFromCookieValue(cookieVal, n) {
    var items = cookieVal.split('|');
    if (items.length > n) {
        cookieVal = "";
        for (var i = n - 1; i >= 0; --i)
            if (items[i].length > 0)
                cookieVal = addToCookieValue(cookieVal, items[i]);
    }
    return cookieVal;
}

function RunTLWidgetTracking(pageTitle, pageUrl) {
    try {
        
        //Replace &nbsp; and &amp;
        pageTitle = pageTitle.replace(/&nbsp;/gi, ' ')
        pageTitle = pageTitle.replace(/&amp;/gi, '&')

        //alert(pageTitle);
        //alert(pageUrl);

        // Get the cookie values
        var pagesHistoryCookie = getCookie(pagesHistoryCookieName);
        var channelsHistoryCookie = getCookie(channelsHistoryCookieName);
        if (pagesHistoryCookie == null)
            pagesHistoryCookie = '';
        if (channelsHistoryCookie == null)
            channelsHistoryCookie = '';
        // Add the tracking items to the cookie values
       
        pagesHistoryCookie = addToCookieValue(pagesHistoryCookie, encodeURIComponent(pageTitle) + "=" + encodeURIComponent(pageUrl));
        // Set the resulted cookies
        if (pagesHistoryCookie != '')
            setCookie(pagesHistoryCookieName, getTopFromCookieValue(pagesHistoryCookie, pagesHistoryCnt), expirationDays, "/", domainNameWidget);
        if (channelsHistoryCookie != '')
            setCookie(channelsHistoryCookieName, getTopFromCookieValue(channelsHistoryCookie, channelsHistoryCnt), expirationDays, "/", domainNameWidget);

    } catch (err) { }
}