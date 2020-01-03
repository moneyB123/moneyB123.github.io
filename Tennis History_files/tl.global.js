var TL = TL || {};
var _BaseUrl = "https://" + window.location.hostname;
var _RefreshJanRainTokenUrl = "{0}/Dashboard/Service/DashboardService.svc/Login/RefreshJanRainToken";
var _RefreshLoginStateUrl = "{0}/Dashboard/Service/DashboardService.svc/Login/RefreshTLLoginState/{1}";
var _SystemSettingGetUrl = "{0}/Dashboard/Service/TLReferenceData.svc/System/Setting/{1}";
var _LogoutUrl = "{0}/Dashboard/Service/DashboardService.svc/Logout";
var _Interval;
var OathTokenCookieName = "OAuthToken";
var UstaEmailIDCookieName = "emailId";
var TennisLinkEmailIDCookieName = "tlemailId";
var TennisLinkUuidCookieName = "tluuid";

var FailedOAuthTokenUsedInLastTimeCookieName = "FailedOAuthToken";
var FailedJanrainAccessTokenUsedInLastTimeCookieName = "FailedJanrainAccessToken";
var FailedJanrainRefreshTokenUsedInLastTimeCookieName = "FailedJanrainRefreshToken";
var FailedJanrainUuidUsedInLastTimeCookieName = "FailedJanrainUuid";

// Jan Rain 
var JanrainRefreshTokenCookieName = "refresh_token";
var JanrainAccessTokenCookieName = "access_token";
var JanrainRefreshTokenCreatedOnCookieName = "LastRefreshTokenTime";
var JanrainAccessTokenCreatedOnInitByLoginFlag = "InitByLogin";
var _SessionId = TL.JSCommon.GUID.new();
var _AttemptTimesAfterRefreshFailure = 3;
var _RefreshFailureTimes = 0;
var JanrainUuidCookieName = "uuid";

var _AjaxOption = {
    beforeSend: function (xhr) {
        xhr.setRequestHeader("PageID", _SessionId);
    }
};


TL.Global = {
    RefreshJanRainTokenUrl: function () {
        //JanRain Access Token, JanRain Refresh Token, JanRian UUID
        //MUST USE IN HTTPS PAGE
        var janrainRefreshToken = TL.JSCommon.CookieUtil.GetCookie(JanrainRefreshTokenCookieName);
        var tennislinkUuid = TL.JSCommon.CookieUtil.GetCookie(TennisLinkUuidCookieName);
        var janrainUuid = TL.JSCommon.CookieUtil.GetCookie(JanrainUuidCookieName);
        var failedJanrainRefeshTokenUsedInLastTime = TL.JSCommon.CookieUtil.GetCookie(FailedJanrainRefreshTokenUsedInLastTimeCookieName);

        if (!janrainRefreshToken || !tennislinkUuid || tennislinkUuid !== janrainUuid) {
            //If not login tl, return
            //if there is no JanRain Access Token, exit refresh.
            //if user in tl is diffrent from user in usta.com, exit refresh.
            return;
        }

        if (failedJanrainRefeshTokenUsedInLastTime && failedJanrainRefeshTokenUsedInLastTime === janrainRefreshToken) {
            //to avoid dup calls, especially for the invalid/expired token issue.
            return;
        }

        var createdOn = TL.JSCommon.CookieUtil.GetCookie(JanrainRefreshTokenCreatedOnCookieName);
        var currentTime = new Date().getTime();
        var diff = (currentTime - createdOn) / 1000;

        if (createdOn === JanrainAccessTokenCreatedOnInitByLoginFlag) {
            TL.JSCommon.CookieUtil.AddCookie(JanrainRefreshTokenCreatedOnCookieName, new Date().getTime(), 1000);
            return;
        }

        if (createdOn == null || diff > _Interval) {
            TL.Global.SingletonLocker.ApplyLocker(function (callback) {
                var refreshUrl = String.format(_RefreshJanRainTokenUrl, _BaseUrl);
                var currentOption = {
                    error: function (request, textStatus, jqXHR) {
                        _RefreshFailureTimes++;
                        if (_RefreshFailureTimes > _AttemptTimesAfterRefreshFailure) {
                            _RefreshFailureTimes = 0;
                            TL.JSCommon.CookieUtil.AddCookie(JanrainRefreshTokenCreatedOnCookieName, new Date().getTime(), 1000);
                        }

                        if (callback && typeof callback === "function") {
                            callback();
                        }
                    }
                };

                $.extend(currentOption, _AjaxOption);
                TL.JSCommon.Ajax(currentOption).getX(refreshUrl, function (success) {
                    _RefreshFailureTimes = 0;
                    TL.JSCommon.CookieUtil.AddCookie(JanrainRefreshTokenCreatedOnCookieName, new Date().getTime(), 1000);

                    if (callback && typeof callback === "function") {
                        callback();
                    }
                });
            });
        }
    },
    ChangeLoginStateThroughJanrain: function() {
        //MUST USE IN HTTPS PAGE
        var janrainUuid = TL.JSCommon.CookieUtil.GetCookie(JanrainUuidCookieName);
        var tennislinkUuid = TL.JSCommon.CookieUtil.GetCookie(TennisLinkUuidCookieName);

        var janrainAccessTokenBeforeChange = TL.JSCommon.CookieUtil.GetCookie(JanrainAccessTokenCookieName);
        var failedJanrainAccessTokenUsedInLastTime = TL.JSCommon.CookieUtil.GetCookie(FailedJanrainAccessTokenUsedInLastTimeCookieName);
        var failedJanrainUuidUsedInLastTime = TL.JSCommon.CookieUtil.GetCookie(FailedJanrainUuidUsedInLastTimeCookieName);
        if (!janrainUuid && !tennislinkUuid) {
            //Not login on either side
            return;
        }

        if (janrainUuid && tennislinkUuid && janrainUuid === tennislinkUuid) {
            //login with same account, return
            return;
        }

        if (failedJanrainAccessTokenUsedInLastTime && janrainAccessTokenBeforeChange && failedJanrainAccessTokenUsedInLastTime === janrainAccessTokenBeforeChange) {
            //to avoid dup calls, especially for the invalid/expired token issue.
            return;
        }

        if (failedJanrainUuidUsedInLastTime && janrainUuid && failedJanrainUuidUsedInLastTime === janrainUuid) {
            //to avoid dup calls, especially for uuid matching none or multiple usta account(s) in Tennis Link DB.
            return;
        }

        TL.Global.SingletonLocker.ApplyLocker(function(callback) {
            var refreshUrl = String.format(_RefreshLoginStateUrl, _BaseUrl, "janrain");
            TL.JSCommon.Ajax(_AjaxOption).getX(refreshUrl, function (refreshPageImmediatly) {
                if (refreshPageImmediatly) {
                    TL.JSCommon.CookieUtil.AddCookie_new(TL.MonitorUserChangeCookie, new Date().getTime(), 1, "." + location.host);
                }

                if (callback && typeof callback === "function") {
                    callback();
                }
            });
        });
    },
    ChangeLoginStateThroughHybris: function () {
        //MUST USE IN HTTPS PAGE
        var ustaEmailId = TL.JSCommon.CookieUtil.GetCookie(UstaEmailIDCookieName);
        var tennislinkEmailId = TL.JSCommon.CookieUtil.GetCookie(TennisLinkEmailIDCookieName);

        var oauthTokenBeforeChange = TL.JSCommon.CookieUtil.GetCookie(OathTokenCookieName);
        var failedOauthTokenUsedInLastTime = TL.JSCommon.CookieUtil.GetCookie(FailedOAuthTokenUsedInLastTimeCookieName);

        if (!ustaEmailId && !tennislinkEmailId) {
            //Not login on either side
            return;
        }

        // ASM Includeing "" in EmailID
        if (ustaEmailId) {
            // trim left "
            if (ustaEmailId.charAt(0) === '"' && ustaEmailId.length > 1) {
                ustaEmailId = ustaEmailId.substr(1, ustaEmailId.length - 1);
            }
            // trim right "
            if (ustaEmailId.charAt(ustaEmailId.length - 1) === '"' && ustaEmailId.length > 1) {
                ustaEmailId = ustaEmailId.substr(0, ustaEmailId.length - 1);
            }
        }

        if (ustaEmailId && tennislinkEmailId && ustaEmailId === tennislinkEmailId) {
            //login with same account, return
            return;
        }

        if (failedOauthTokenUsedInLastTime && oauthTokenBeforeChange && failedOauthTokenUsedInLastTime === oauthTokenBeforeChange) {
            //to avoid dup calls, especially for the invalid/expired token issue.
            return;
        }

        TL.Global.SingletonLocker.ApplyLocker(function (callback) {
            var refreshUrl = String.format(_RefreshLoginStateUrl, _BaseUrl, "hybris");
            TL.JSCommon.Ajax(_AjaxOption).getX(refreshUrl, function (refreshPageImmediatly) {
                if (refreshPageImmediatly) {
                    //The domain of the following cookies are changed in USTA-26083. We need delete the cookies with old domain, otherwise, the logout function will not work.
                    var curOauthToken = TL.JSCommon.CookieUtil.GetCookie(OathTokenCookieName);
                    if (!curOauthToken) {
                        TL.JSCommon.CookieUtil.DeleteCookie("tluuid");
                        TL.JSCommon.CookieUtil.DeleteCookie("tlemailId");
                        TL.JSCommon.CookieUtil.DeleteCookie("ssou");
                        TL.JSCommon.CookieUtil.DeleteCookie("ProfileToken");
                    }
                    //----USTA-26083 end-----------------------------------------------------

                    TL.JSCommon.CookieUtil.AddCookie_new(TL.MonitorUserChangeCookie, new Date().getTime(), 1, "." + location.host);
                }

                if (callback && typeof callback === "function") {
                    callback();
                }
            });
        });
    },
    GetSystemSetting: function(settingId, callback) {
        var url = String.format(_SystemSettingGetUrl, _BaseUrl, settingId);
        TL.JSCommon.Ajax().getX(url, function (ret) {
            if (callback && typeof callback === "function") {
                callback(ret);
            }
        });
    },
    SingletonLocker: {
        CookieName: "SingletonLocker",
        Locked: function () {
            var s = TL.JSCommon.CookieUtil.GetCookie(TL.Global.SingletonLocker.CookieName);
            if (!s) {
                return false;
            }

            var v = JSON.parse(s);
            var lockTime = v.time;
            return new Date().getTime() - lockTime < 30 * 1000;
        },
        Release: function() {
            TL.JSCommon.CookieUtil.DeleteCookie(TL.Global.SingletonLocker.CookieName);
        },
        Lock: function () {
            var v = { session: _SessionId, time: new Date().getTime() };
            TL.JSCommon.CookieUtil.AddCookie(TL.Global.SingletonLocker.CookieName, JSON.stringify(v), 1);
        },
        ApplyLocker: function (action) {
            if (!action || typeof action != "function") return;
            if (!TL.Global.SingletonLocker.Locked()) {
                TL.Global.SingletonLocker.Lock();
                setTimeout(function() {
                    var s = TL.JSCommon.CookieUtil.GetCookie(TL.Global.SingletonLocker.CookieName);
                    var v = JSON.parse(s);
                    if (v.session === _SessionId) {
                        action(function() {
                                TL.Global.SingletonLocker.Release();
                            });
                    }
                }, 500);
            }
        }
    },
    DeleteFailedCookies: function () {
        var janrainUuid = TL.JSCommon.CookieUtil.GetCookie(JanrainUuidCookieName);
        var faliedJanrainUuid = TL.JSCommon.CookieUtil.GetCookie(FailedJanrainUuidUsedInLastTimeCookieName);
        if (faliedJanrainUuid && (!janrainUuid || faliedJanrainUuid !== janrainUuid)) {
            TL.JSCommon.CookieUtil.DeleteCookie(FailedJanrainUuidUsedInLastTimeCookieName);
        }

        var hybrisOathToken = TL.JSCommon.CookieUtil.GetCookie(OathTokenCookieName);
        var faliedHybrisOathToken = TL.JSCommon.CookieUtil.GetCookie(FailedOAuthTokenUsedInLastTimeCookieName);
        if (faliedHybrisOathToken && (!hybrisOathToken || faliedHybrisOathToken !== hybrisOathToken)) {
            TL.JSCommon.CookieUtil.DeleteCookie(FailedOAuthTokenUsedInLastTimeCookieName);
        }

        var janrainAccessToken = TL.JSCommon.CookieUtil.GetCookie(JanrainAccessTokenCookieName);
        var faliedJanrainAccessToken = TL.JSCommon.CookieUtil.GetCookie(FailedJanrainAccessTokenUsedInLastTimeCookieName);
        if (faliedJanrainAccessToken && (!janrainAccessToken || faliedJanrainAccessToken!== janrainAccessToken)) {
            TL.JSCommon.CookieUtil.DeleteCookie(FailedJanrainAccessTokenUsedInLastTimeCookieName);
        }

        var janrainRefreshToken = TL.JSCommon.CookieUtil.GetCookie(JanrainRefreshTokenCookieName);
        var faliedJanrainRefreshToken = TL.JSCommon.CookieUtil.GetCookie(FailedJanrainRefreshTokenUsedInLastTimeCookieName);
        if (faliedJanrainRefreshToken && (!janrainRefreshToken || faliedJanrainRefreshToken !== janrainRefreshToken)) {
            TL.JSCommon.CookieUtil.DeleteCookie(FailedJanrainRefreshTokenUsedInLastTimeCookieName);
        }
    },
    Init: function () {
        TL.Global.GetSystemSetting("5317", function(i) {
            _Interval = i;
            $(function () {
                setInterval(function () {
                    //Clear Failed id and Tokens
                    TL.Global.DeleteFailedCookies();

                    var janrainUuid = TL.JSCommon.CookieUtil.GetCookie(JanrainUuidCookieName);
                    if (janrainUuid) {
                        TL.Global.ChangeLoginStateThroughJanrain();
                    } else {
                        TL.Global.ChangeLoginStateThroughHybris();
                    }

                    TL.Global.RefreshJanRainTokenUrl();
                }, 1000);
            });
        });
    }
}

TL.Global.Init();

