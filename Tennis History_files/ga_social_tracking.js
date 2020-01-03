// Copyright 2012 Google Inc. All Rights Reserved.

/**
 * @fileoverview A simple script to automatically track Facebook and Twitter
 * buttons using Google Analytics social tracking feature.
*/



  /** Google Analytics Social Button Tracking */

/**
 * Namespace.
 * @type {Object}.
 */
var _ga = _ga || {};


/**
 * Ensure global _gaq Google Analytics queue has been initialized.
 * @type {Array}
 */
var _gaq = _gaq || [];


/**
 * Tracks social interactions by iterating through each tracker object
 * of the page, and calling the _trackSocial method. This function
 * should be pushed onto the _gaq queue. For details on parameters see
 * http://code.google.com/apis/analytics/docs/gaJS/gaJSApiSocialTracking.html
 * @param {string} network The network on which the action occurs.
 * @param {string} socialAction The type of action that happens.
 * @param {string} opt_target Optional text value that indicates the
 *     subject of the action.
 * @param {string} opt_pagePath Optional page (by path, not full URL)
 *     from which the action occurred.
 * @return a function that iterates over each tracker object
 *    and calls the _trackSocial method.
 * @private
 */
_ga.getSocialActionTrackers_ = function(
    network, socialAction, opt_target, opt_pagePath) {
  return function() {
    var trackers = _gat._getTrackers();
    for (var i = 0, tracker; tracker = trackers[i]; i++) {
      tracker._trackSocial(network, socialAction, opt_target, opt_pagePath);
    }
  };
};


/**
 * Tracks Facebook likes, unlikes and sends by suscribing to the Facebook
 * JSAPI event model. Note: This will not track facebook buttons using the
 * iframe method.
 * @param {string} opt_pagePath An optional URL to associate the social
 *     tracking with a particular page.
 */
_ga.trackFacebook = function(opt_pagePath) {
    try {
        if (FB && FB.Event && FB.Event.subscribe) {
            FB.Event.subscribe('edge.create', function(opt_target) {
                _gaq.push(_ga.getSocialActionTrackers_('facebook', 'like',
            opt_target, opt_pagePath));
            });
            FB.Event.subscribe('edge.remove', function(opt_target) {
                _gaq.push(_ga.getSocialActionTrackers_('facebook', 'unlike',
            opt_target, opt_pagePath));
            });
            //FB.Event.subscribe('message.send', function(opt_target) {
            //    _gaq.push(_ga.getSocialActionTrackers_('facebook', 'send',
            //opt_target, opt_pagePath));
            //});
        }
    } catch (e) { }
};


/**
 * Handles tracking for Twitter click and tweet Intent Events which occur
 * everytime a user Tweets using a Tweet Button, clicks a Tweet Button, or
 * clicks a Tweet Count. This method should be binded to Twitter click and
 * tweet events and used as a callback function.
 * Details here: http://dev.twitter.com/docs/intents/events
 * @param {object} intent_event An object representing the Twitter Intent Event
 *     passed from the Tweet Button.
 * @param {string} opt_pagePath An optional URL to associate the social
 *     tracking with a particular page.
 * @private
 */
_ga.trackTwitterHandler_ = function(intent_event, opt_pagePath) {
    var opt_target; //Default value is undefined
    if (intent_event && intent_event.type == 'tweet' ||
          intent_event.type == 'click') {
        if (intent_event.target.nodeName == 'IFRAME') {
            opt_target = _ga.extractParamFromUri_(intent_event.target.src, 'url');
        }
        var socialAction = intent_event.type + ((intent_event.type == 'click') ?
        '-' + intent_event.region : ''); //append the type of click to action
        _gaq.push(_ga.getSocialActionTrackers_('twitter', socialAction, opt_target,
        opt_pagePath));
    }
};

/**
 * Binds Twitter Intent Events to a callback function that will handle
 * the social tracking for Google Analytics. This function should be called
 * once the Twitter widget.js file is loaded and ready.
 * @param {string} opt_pagePath An optional URL to associate the social
 *     tracking with a particular page.
 */
_ga.trackTwitter = function(opt_pagePath) {
    intent_handler = function(intent_event) {
        _ga.trackTwitterHandler_(intent_event, opt_pagePath);
    };

    //bind twitter Click and Tweet events to Twitter tracking handler
    //twttr.events.bind('click', intent_handler);
    twttr.events.bind('tweet', intent_handler);
};



/**
 * Extracts a query parameter value from a URI.
 * @param {string} uri The URI from which to extract the parameter.
 * @param {string} paramName The name of the query paramater to extract.
 * @return {string} The un-encoded value of the query paramater. undefined
 *     if there is no URI parameter.
 * @private
 */
_ga.extractParamFromUri_ = function(uri, paramName) {
  if (!uri) {
    return;
  }
  var regex = new RegExp('[\\?&#]' + paramName + '=([^&#]*)');
  var params = regex.exec(uri);
  if (params != null) {
    return unescape(params[1]);
  }
  return;
};


function loadSocialMediaAsyn(opt_pagePath) {
    try {
        if (!window.fbAsyncInit) { 
            // Load Facebook JS-API asynchronously 
            (function(d, s, id) {
                var js, fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) { return; }
                js = d.createElement(s); js.id = id;
                js.src = "//connect.facebook.net/en_US/all.js#xfbml=1";
                fjs.parentNode.insertBefore(js, fjs);
            } (document, 'script', 'facebook-jssdk'));

            window.fbAsyncInit = function() {
                //_ga.trackFacebook(opt_target, opt_pagePath); //Google Analytics tracking
                _ga.trackFacebook(opt_pagePath); //Google Analytics tracking

            };

        } else {
            //_ga.trackFacebook(opt_pagePath); //Google Analytics tracking
            FB.XFBML.parse();
        }

        // Load Twitter JS-API asynchronously
        if (!window.twttr) {
            window.twttr = (function(d, s, id) {
                var t, js, fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) return; js = d.createElement(s); js.id = id;
                js.src = "//platform.twitter.com/widgets.js"; fjs.parentNode.insertBefore(js, fjs);
                return window.twttr || (t = { _e: [], ready: function(f) { t._e.push(f) } });
            } (document, "script", "twitter-wjs"));

            // Wait for the asynchronous resources to load
            twttr.ready(function(twttr) {
                _ga.trackTwitter(opt_pagePath); //Google Analytics tracking
                //_ga.trackTwitter(opt_target, opt_pagePath); //Google Analytics tracking
            });
        } else if (typeof (twttr.widgets.load) != 'undefined') {
            twttr.widgets.load();
        }


        // Load Google +1 JS-API asynchronously 
        (function() {
            var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
            po.src = '//apis.google.com/js/plusone.js';
            var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
        })();
    } catch (e) { }
}
