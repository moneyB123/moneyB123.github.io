(function () {
    var config = {
        userInfo:{
            ustaNumberKey: 'uid',        
            personIdKey: 'pid',
            ustaNumber: '0',
            ustaNumberEncrypt: '0',
            userIdKey: 'userId',
            userIdEncrypt:'',
            ustaNumberUrlParamEncrypt: ''
        },
        /* Default root urls */
        rootUrl: {
            dashboard: '/Dashboard/',
            tournaments: '/Tournaments/',
            teamTennis: '/TeamTennis/',
            flexLeagues: '/FlexLeagues/',
            leagues: '/Leagues/'
        },
        host: window.location.hostname,
        protocol: window.location.protocol,
        /* Get full url address */
        getFullUrl: function (url, projectName) {
            //var str = this.protocol + this.host;
            var str ="";
            if (projectName) {
                str += this.rootUrl[projectName];
            }
            str += url;
            return str;
        },
        ssoLoginWarningConfirmedCookieName: "SSOLoginWarningTempConfirmed"
    };

    var isLogged = function () {
        return config.isLogin;
    }

    // invoke from backend 
    window.setNavigationConfig = function (params) {
        config = $.extend(config, params);
        if (params.rootUrl) {
            config.rootUrl = params.rootUrl;
        }
        if (params.userInfo) {
            config.userInfo = params.userInfo;
        }
        if (params.isLogin != 'undefined') {
            config.isLogin = (params.isLogin != "False");
        } 
        if (params.linkJoinUstaUrl) {
            config.linkJoinUstaUrl = params.linkJoinUstaUrl;
        }
        if (params.currentProject) {
            config.currentProject = params.currentProject;
        }

        $(function () {
            navigationInitialize();
        });
    };

    /* -------------- Template engine ------------*/

    function tmpl(id, data) {
        var dom = document.getElementById(id);
        if (!dom) return;
        var html=dom.innerHTML;
        var result="var p=[];with(obj){p.push('"
            +html.replace(/[\r\n\t]/g," ")
            .replace(/<#=(.*?)#>/g, "');p.push($1);p.push('")
            .replace(/<#/g, "');")
            .replace(/#>/g, "p.push('")
            +"');}return p.join('');";
        var fn=new Function("obj",result);
        return fn(data);
    }

    /*--------------- Local strorage --------------*/

    function getCookieAsHashtable(cookie_name) {
        var ret = {};
        var cookieString = getCookieString(cookie_name);
        if (cookieString) {
            var params = cookieString.split("&");
            for (var i = 0; i < params.length; i++) {
                var ck = params[i].split("=");
                var cName = ck[0];
                var cValue = decodeURI(ck[1]);
                ret[cName] = cValue;
            }
        }
        return ret;
    }
    function getCookieString(cookie_name) {
        var value = null;
        var allcookies = document.cookie;
        var cookie_pos = allcookies.indexOf(cookie_name);
        if (cookie_pos != -1) {
            cookie_pos += cookie_name.length + 1;
            var cookie_end = allcookies.indexOf(";", cookie_pos);
            if (cookie_end == -1) {
                cookie_end = allcookies.length;
            }
            value = unescape(allcookies.substring(cookie_pos, cookie_end));
        }
        return value;
    }

    var _jstorage = $.jStorage.noConflict(true);

    var storage = {
        set: function (key, val, expires) {
            if (!isNaN(expires))
                _jstorage.set(key, val, { TTL: expires * 1000 });
            else
                _jstorage.set(key, val);
        },
        get: function (key, defVal) {
            if (typeof defVal == "undefined")
                return _jstorage.get(key);
            else
                return _jstorage.get(key, defVal);
        },
        del: function (key) {
            _jstorage.deleteKey(key);
        },
        flush: function () {
            _jstorage.flush();
        }
    };

    /* ------------- Service Ajax Support -------- */

    var expiresDef = 60 * 30;

    var cacheConfig = {
        divisions: {
            key: 'quickPanel_divisions',
            expires: expiresDef
        },
        states: {
            key: 'quickPanel_states',
            expires: expiresDef
        },
        tournamentsLinks: {
            key: 'quickPanel_tournamentsLinks',
            expires: expiresDef
        },
        myTennis: {
            key: 'quickPanel_myTennis',
            expires: expiresDef,
            userKey: "quickPanel_myTennis_ustaNumber"
        },
        flexLeagues: {
            expires: expiresDef
        }
    };

    function getAjaxService() {
        //Singleton
        var host = config.host;       
        function cacheDataResponse(cacheItem, callback) {
            var data = storage.get(cacheItem.key);
            if (data) {
                callback(data);
                return true;
            }
            return false;
        }
        function getTlSessionID() {
            return TL.JSCommon.CookieUtil.GetCookie("TLSESSIONID");
        }
        function cacheMyTennisDataResponse(callback) {
            //var cacheUstaNumber = storage.get(cacheConfig.myTennis.userKey);
            //if (cacheUstaNumber != config.userInfo.ustaNumber)
            //    return false;
            var tlSessionId = storage.get(cacheConfig.myTennis.userKey);
            if (tlSessionId !== getTlSessionID())
                return false;
            return cacheDataResponse(cacheConfig.myTennis, callback);
        }
        function addCache(cacheItem, data) {
            storage.del(cacheItem.key);
            storage.set(cacheItem.key, data, cacheItem.expires);
        }
        function addMyTennisCache(data) {
            storage.del(cacheConfig.myTennis.userKey);
            //storage.set(cacheConfig.myTennis.userKey, config.userInfo.ustaNumber);
            storage.set(cacheConfig.myTennis.userKey, getTlSessionID());
            addCache(cacheConfig.myTennis, data);
        }
        return {
            checkZipFormat: function (strZipCode, callback) {
                $.ajax({
                    contentType: "application/json; charset=UTF-8",
                    dataType: "json",
                    url: config.rootUrl.dashboard + "service/DashboardService.svc/Common/CheckZipCode/" + strZipCode + "/Y/0",
                    success: function (ret) {
                        callback(ret.CheckZipFormatResult);
                    }
                });
            },
            getEncrypt: function (str, callback) {
                $.ajax({
                    contentType: "application/json; charset=UTF-8",
                    dataType: "json",
                    url: config.rootUrl.dashboard + "service/DashboardService.svc/Common/Encrypt/" + str,
                    success: function (ret) {
                        callback(ret.EncryptResult);
                    }
                });
            },          
            getDivisions: function (callback) {
                if (cacheDataResponse(cacheConfig.divisions, callback)) return;
                var url = config.rootUrl.flexLeagues + "service/FlexLeaguesService.svc/Divisions";
                //console.log(url);
                $.ajax({
                    contentType: "application/json; charset=UTF-8",
                    dataType: "json",
                    url: url,
                    jsonp: "callBackAction",
                    success: function (ret) {
                        var data = ret.GetDivisionsResult;
                        addCache(cacheConfig.divisions, data);
                        callback(data);
                    }
                });
            },
            getStates: function (callback) {
                if (cacheDataResponse(cacheConfig.states, callback)) return;
                $.ajax({
                    contentType: "application/json; charset=UTF-8",
                    dataType: "json",
                    url: config.rootUrl.flexLeagues + "service/FlexLeaguesService.svc/States",
                    success: function (ret) {
                        var data = ret.GetStatesResult;
                        addCache(cacheConfig.states, data);
                        callback(data);
                    }
                });
            },
            getMetroAreaByStateId: function (stateId, callback) {
                $.ajax({
                    contentType: "application/json; charset=UTF-8",
                    dataType: "json",
                    url: config.rootUrl.flexLeagues + "service/FlexLeaguesService.svc/State=" + stateId +"/MetroAreas",
                    success: function (ret) {
                        callback(ret.GetMetroAreasByStateResult);
                    }
                });
            },
            getFlexLeagues: function (year, state, metroArea, callback) {
                $.ajax({
                    contentType: "application/json; charset=UTF-8",
                    dataType: "json",
                    url: config.rootUrl.flexLeagues + "service/FlexLeaguesService.svc/Year=" + year + "/State=" + state + "/metroArea=" + metroArea +"/FlexLeagues",
                    success: function (ret) {
                        callback(ret.GetFlexLeaguesByYearResult);
                    }
                });
            },
            getFlights: function (flexLeagueId, callback) {
                var url = config.rootUrl.flexLeagues + "service/FlexLeaguesService.svc/FlexLeague=" + flexLeagueId + "/Flights";
                //console.log(url);
                $.ajax({
                    contentType: "application/json; charset=UTF-8",
                    dataType: "json",
                    url: url,
                    success: function (ret) {
                        callback(ret.GetFlightsByFlexLeagueIdResult);
                    }
                });
            },
            getTournamentsLastThreeLinks: function (callback) {
                if (cacheDataResponse(cacheConfig.tournamentsLinks, callback)) return;
                var url = config.rootUrl.tournaments + "service/TournamentsService.svc/Groups";               
                $.ajax({
                    contentType: "application/json; charset=UTF-8",
                    dataType: "json",
                    url: url,
                    success: function (ret) {
                        var data = ret.GetGroupsResult;
                        addCache(cacheConfig.tournamentsLinks, data);
                        callback(data);
                    }
                });
            },
            isSelfRate: function (callback) {
                var url = config.rootUrl.leagues + "service/LeaguesService.svc/IsEligibleToSelfRate";
                $.ajax({
                    type: 'GET',
                    contentType: "application/json; charset=UTF-8",
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader(config.userInfo.ustaNumberKey, config.userInfo.ustaNumberEncrypt);
                    },
                    dataType: "json",
                    url: url,
                    success: function (ret) {
                        callback(ret.IsEligibleToSelfRateResult);
                    }
                });
            },
            getMyTennisData: function (callback) {
                if (cacheMyTennisDataResponse(callback)) return;
                var url = config.rootUrl.dashboard + "service/DashboardService.svc/MyTennis";
                //console.log(url);
                $.ajax({
                    type: 'GET',
                    cache: false,
                    contentType: "application/json; charset=UTF-8",
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader(config.userInfo.personIdKey, config.userInfo.personIdEncrypt);
                        xhr.setRequestHeader(config.userInfo.userIdKey, config.userInfo.userIdEncrypt);
                    },
                    dataType: "json",
                    url: url,
                    success: function (ret) {
                        var data = ret.GetMyTennisResult;
                        addMyTennisCache(data);
                        callback(data);
                    }
                });
            },
           viewFLStatsAndStandingReport: function (flightId, callback) {                
                var url = config.rootUrl.flexLeagues + "service/FlexLeaguesService.svc/SetReportCriteria/StatsAndStandings/FlightId=" + flightId;
                $.ajax({
                    type: 'POST',
                    contentType: "application/json; charset=UTF-8",
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader(config.userInfo.userIdKey, config.userInfo.userIdEncrypt);
                    },
                    dataType: "json",
                    url: url,
                    success: function (ret) {
                        callback(ret.SetStatsAndStandingsReportCriteriaResult);
                    }
                });
           },
           checkSSOLoginWarningSwitch: function (callback) {
               var url = config.rootUrl.dashboard + "service/TLReferenceData.svc/System/Setting/5500";
               $.ajax({
                   type: 'GET',
                   cache: false,
                   contentType: "application/json; charset=UTF-8",
                   beforeSend: function (xhr) {
                       xhr.setRequestHeader(config.userInfo.userIdKey, config.userInfo.userIdEncrypt);
                   },
                   dataType: "json",
                   url: url,
                   success: function (ret) {
                       callback(ret);
                   }
               });
           },
           getRole: function (callback) {
               var url = config.rootUrl.dashboard + "service/DashboardService.svc/SSO/GetCurrentRoleID";
               $.ajax({
                   type: 'GET',
                   cache: false,
                   contentType: "application/json; charset=UTF-8",
                   beforeSend: function (xhr) {
                       xhr.setRequestHeader(config.userInfo.userIdKey, config.userInfo.userIdEncrypt);
                   },
                   dataType: "json",
                   url: url,
                   success: function (ret) {
                       callback(ret.GetCurrentRoleIDResult);
                   }
               });
           },
           isSSOAnnouncementConfirmed: function (callback) {
               var url = config.rootUrl.dashboard + "service/DashboardService.svc/SSO/IsLoginWarningConfirmed";
               $.ajax({
                   type: 'GET',
                   cache: false,
                   contentType: "application/json; charset=UTF-8",
                   beforeSend: function (xhr) {
                       xhr.setRequestHeader(config.userInfo.userIdKey, config.userInfo.userIdEncrypt);
                   },
                   dataType: "json",
                   url: url,
                   success: function (ret) {
                       callback(ret.IsSSOLoginWarningConfirmedResult);
                   }
               });
           },
           confirmSSOAnnouncement: function () {
               var url = config.rootUrl.dashboard + "service/DashboardService.svc/SSO/ConfirmLoginWarning";
               $.ajax({
                   type: 'POST',
                   cache: false,
                   contentType: "application/json; charset=UTF-8",
                   beforeSend: function (xhr) {
                       xhr.setRequestHeader(config.userInfo.userIdKey, config.userInfo.userIdEncrypt);
                   },
                   dataType: "json",
                   url: url,
                   success: function (ret) {
                       //
                   }
               });
           }
        };
    }
    var service = getAjaxService();

    window.logOut = function () {
        storage.flush();
        var hostname = window.location.hostname;
        if (hostname.toLowerCase().startWith("m.")) {
            logOutMobilizer();
            deleteSsoCookies();
            return false;
        }

        if (window.location.href.indexOf("progression") != -1) {
            Progression.Ajax.get("https://" + GetTennisLinkHostname() + "/Dashboard/Service/DashboardService.svc/Logout", function (ret) {
                deleteSsoCookies();
                window.location.href = getLogoutReturnURL();
                return false;
            });
            return false;
        }
        else {
            TL.JSCommon.Logout(getLogoutReturnURL());
            deleteSsoCookies();
            return false;
        }
    }

    //The domain of the following cookies are changed in USTA-26083. We need delete the cookies with old domain, otherwise, the logout function will not work.
    function  deleteSsoCookies() {
        TL.JSCommon.CookieUtil.DeleteCookie("tluuid");
        TL.JSCommon.CookieUtil.DeleteCookie("tlemailId");
        TL.JSCommon.CookieUtil.DeleteCookie("ssou");
        TL.JSCommon.CookieUtil.DeleteCookie("ProfileToken");
    }

    window.logIn = function () {
        storage.flush();
        if ($('a.login').length > 0) {
            safeClick($('a.login')[0]);
        }
    }
    window.logOutMobilizer = function () {
        var iframeId = "temp_25091";
        var iframe = $("#" + iframeId);
        if (iframe.length > 0) {
            iframe.remove();
        }
        var url = "https://" + GetTennisLinkHostname() + "/Dashboard/Service/DashboardService.svc/Logout";
        iframe = $("<iframe id='" + iframeId + "' src= '" + url + "' />");
        iframe[0].onload = function() {
            window.parent.location = getLogoutReturnURL();
        }
        $('body').append(iframe);
    }

    function navigationInitialize() {
        $("#navheader").html(tmpl('navigation_tmpl', config));
        $("#q1").html(tmpl('leagues_tmpl', config));
        $("#q2").html(tmpl('tournament_tmpl', config));
        $("#q3").html(tmpl('team_tennis_tmpl', config));
        $("#q4").html(tmpl('flex_league_tmpl', config));

        function cacheFlexLeagues(year) {
            var state = $("#q_sel_state2").val();
            var metroArea = $("#q_sel_metro_area2").val();
            var cacheKey = "quickPanel_flexLeagues_" + year + "_" + state + "_" + metroArea;
            var data = storage.get(cacheKey);
            if (data) {
                addSelectOptions(data, 'q_sel_flex_league');
                return;
            }
            service.getFlexLeagues(year, state, metroArea, function (data) {
                storage.set(cacheKey, data, cacheConfig.flexLeagues.expires);
                addSelectOptions(data, 'q_sel_flex_league');
            });
        }

        // Set flex leagues year as year now
        $("#q_fl_year option").each(function () {
            var year = $(this).val();
            var yearNow = new Date().getFullYear();
            if (year == yearNow) {
                $(this).attr("selected", "selected");
                cacheFlexLeagues(year);
            }
        });

        if (isLogged()) {
            var permissionDashboard = getCookieAsHashtable("DashboardCookie");
            service.getMyTennisData(function (ret) {
                var data = {
                    userName: ret.PersionInfo.UserName,
                    lnkSection: { text: ret.PersionInfo.LnkSectionText, link: ret.PersionInfo.LnkSectionUrl },
                    location: ret.PersionInfo.District,
                    ustaNumber: config.userInfo.ustaNumber,
                    lnkAppealRatingLevel: config.getFullUrl("Appeal/Preauthorize.aspx?MemberNum=" + config.userInfo.ustaNumberUrlParamEncrypt + "&source=fr&coord=***", 'leagues'),
                    lnkManageAccount: config.getFullUrl("Main/ManageAccount.aspx", 'dashboard'),
                    ntrpLevel: ret.PersionInfo.NtrpLevel,
                    juniorLevel: ret.PersionInfo.JuniorLevel,
                    imgUrl: ret.PersionInfo.ImgUrl,
                    canUserAppeal: ret.PersionInfo.CanUserAppeal,
                    myEvent:{
                        flexLeagues: ret.MyEvents.FlexLeagues,
                        flexLeaguesLink: ret.MyEvents.FlexLeaguesLink,
                        leagues: ret.MyEvents.Leagues,
                        leaguesLink: ret.MyEvents.LeaguesLink,
                        teamTennis: ret.MyEvents.TeamTennis,
                        teamTennisLink: ret.MyEvents.TeamTennisLink,
                        tournament: ret.MyEvents.Tournament,
                        tournamentDate: ret.MyEvents.TournamentRegistrationOpen,
                        tournamentLink: ret.MyEvents.TournamentLink,
                        canFindTournament: true,//permissionDashboard["Tournaments"] == 'True',
                        canFindLeagues: ret.MyEvents.CanLeaguesDisplayed,
                        canFindTeamTennis: true,//permissionDashboard["TeamTennis"] == 'True'
                        canFindFlexLeagues: ret.MyEvents.CanFlexLeaguesDisplayed
                    }
                };
                $("#q5").html(tmpl('my_tennis_tmpl', $.extend(data, config)));
            });
        }

        /* ------------- UI binding part ---------------- */

        //tournaments last three links
        service.getTournamentsLastThreeLinks(function (ret) {
            if (ret.length > 0) {
                $('#q_tt_link1').attr("href", config.getFullUrl(ret[0].LinkValue, 'tournaments'));
                $('#q_tt_link1').text(ret[0].LinkDescription);
            }
            if (ret.length > 1) {
                $('#q_tt_link2').attr("href", config.getFullUrl(ret[1].LinkValue, 'tournaments'));
                $('#q_tt_link2').text(ret[1].LinkDescription);
            }
            if (ret.length > 2) {
                $('#q_tt_link3').attr("href", config.getFullUrl(ret[2].LinkValue, 'tournaments'));
                $('#q_tt_link3').text(ret[2].LinkDescription);
            }
        });

        //flex leagues

        service.getDivisions(function (ret) {
            addSelectOptions(ret, 'q_sel_division');
        });
        service.getStates(function (ret) {
            addSelectOptions(ret, 'q_sel_state1');
            addSelectOptions(ret, 'q_sel_state2');
        });
        $("#q_sel_state1").change(function () {
            var selected = $(this).children('option:selected').val();
            service.getMetroAreaByStateId(selected, function (ret) {
                addSelectOptions(ret, 'q_sel_metro_area1');
            });
        });
        $("#q_sel_state2").change(function () {
            var selected = $(this).children('option:selected').val();
            service.getMetroAreaByStateId(selected, function (ret) {
                addSelectOptions(ret, 'q_sel_metro_area2');
            });
        });

        $("#q_fl_year, #q_sel_state2, #q_sel_metro_area2").change(function () {
            updateSelectFlexLeagues();
        });

        function updateSelectFlexLeagues() {
            var year = $("#q_fl_year").children('option:selected').val();
            var state = $("#q_sel_state2").children('option:selected').val();
            var metroArea = $("#q_sel_metro_area2").children('option:selected').val();

            service.getFlexLeagues(year, state, metroArea, function (ret) {
                addSelectOptions(ret, 'q_sel_flex_league');

                $("#q_sel_flex_league").change();
            });
        }

        $("#q_self_rate").click(function () {
            quickPanelFunctionalities.selfRateClick();
        });

        $("#q_sel_flex_league").change(function () {
            var selected = $(this).children('option:selected').val();
            service.getFlights(selected, function (ret) {
                addSelectOptions(ret, 'q_sel_flight');
            });
        });



        //For support safari click 
        function safeClick(elm) {
            if (!elm) return;

            if (document.createEvent) {
                var eventObj = document.createEvent('MouseEvents');
                eventObj.initEvent('click', true, true);
                elm.dispatchEvent(eventObj);
            } else {
                elm.click();
            }
        }

        $("#btnFindFlexLeague").click(function () {
            quickPanelFunctionalities.findFlexLeagueByFormOne();
        });

        $("#btnViewStatsAndStadings").click(function () {
            quickPanelFunctionalities.findFlexLeagueByFormTwo();
        });
        
        $("#btnFindRanking").click(function () {
            quickPanelFunctionalities.findRanking();
        });

        $("#btnFindRating").click(function () {
            return quickPanelFunctionalities.findRating();
        });

        $("#btnFindRatingTT").click(function () {
            return quickPanelFunctionalities.findRatingTT();
        });

        $("#btnSearchTournament").click(function () {
            SearchTournaments();
        });

        $("#q_tournament_name").keydown(function (e) {
            if (!e) var e = window.event;
            var key = e.keyCode ? e.keyCode : e.which;
            if (key == 13) {
                SearchTournaments();
                return false;
            }
        });

        function SearchTournaments() {
            quickPanelFunctionalities.findATournament();
        }

        $("#btnFindByPlayerName").click(function () {
            quickPanelFunctionalities.findByPlayerName();
        });

        $("#btnFindByTeamName").click(function () {
            quickPanelFunctionalities.findByTeamName();
        });

        $("#btnPersonGO").click(function () {
            quickPanelFunctionalities.findByPersonId();
        });
        $("#btnTeamNumberGO").click(function () {
            quickPanelFunctionalities.findByTeamNumber();
        }); 

        $("#btnMatchGO").click(function () {
            quickPanelFunctionalities.findByMatchNumber();
        });

        $("#btnFindPlayerRecord").click(function () {
            quickPanelFunctionalities.findPlayerRecord();
        });

        $("#btnLinkToRecordAScore").click(function () {
            quickPanelFunctionalities.recordAScoreClick();
        });

        $("#ss_icon_simple_search_help").click(function () {
            window.open(config.rootUrl.leagues + "HelpTutorials/Simple_Search_help.htm", "SimpleSearchHelpWin", "toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=650, height=450");
        });        

        $(".quickPanel .fl-link").each(function () {
            var link = $(this).attr("data-href");
            $(this).click(function () {
                if (isLogged()) window.location.href = link;
                else redirectDashboard("Main/Login.aspx");
            });            
        });

        $("#btnSearchStatsStanding").click(function () {
            var val = $("#q_stats-standings-input").val().trim();
            if (quickPanelFunctionalities.fnFuzzySearch(val)) {
                var sData = "?t=R-17&search=" + escape(val);
                redirectLeague("Main/StatsAndStandings.aspx" + sData);
            }
        });

        $("#btnSearchNTRP").click(function () {
            var searchTerm = $("#q_ntrp_input").val();
            if (searchTerm == '') {
                showError("Enter USTA Membership #, team # or player name.");
                return false;
            }            
            if (isNaN(searchTerm)) {
                if (fnIncludeXSSChar(searchTerm)) {
                    showError("The player name include invalid character.");
                    return false;
                }
                var mySplitResult = searchTerm.split(" ");
                if (mySplitResult.length == 1) {
                    showError("Enter both the First Name and Last Name of the player.");
                    return false;
                }
                if (mySplitResult[0].length == 1 || mySplitResult[1].length == 1) {
                    showError("You must enter at least the first 2 letters of the Last Name and first 2 letters of the First Name.");
                    return false;
                }
            }
            var sData = "?S=" + searchTerm;
            redirectLeague("reports/NTRP/FindRating.aspx" + sData);
        });

        $("#btnSearchNTRP").keypress(function (e) {
            if (onEnter(e)) $("#btnSearchNTRP").click();
        });

        $('#navbar li').each(function () {
            var link = $(this).attr("data-href");
            if (!link) return;
            $(this).click(function () {
                window.location.href = link;
            });
        });

        /*function isIpad(){
            var ua = navigator.userAgent.toLowerCase();
            var s;
            s = ua.match(/iPad/i);

            if(s=="ipad")
            {
                return true;
            }
            else{
                return false;
            }
        }
        $('#navbar li').each(function () {
            if (!isIpad()) {
                var link = $(this).attr("data-href");
                if (!link) return;

                $(this).click(function () {
                    window.location.href = link;
                });
            }

            $(this)[0].addEventListener('touchstart', function (e) {
                var This = this;
                if (!$('#quickPanel').is(':visible')) {
                    $(This).mouseover();
                    previewFoucsMenu = $(This).attr('data-href');
                } else {
                    alert($(This).attr('data-href'));
                    alert(previewFoucsMenu);
                    if ($(This).attr('data-href') == previewFoucsMenu) {
                        var link = $(This).attr("data-href");
                        if (!link) return;

                        window.location.href = link;

                    } else {
                        $(This).mouseover();
                        previewFoucsMenu = $(This).attr('data-href');
                    }
                }

            });
        });*/

        /* ------------ Navigation bar control part -------------- */

        jQuery.fn.hoverDelay = function (options, hoverFunc, outFunc) {
            var defaults = {
                hoverDuring: 200,
                outDuring: 200,
                hoverEvent: hoverFunc || function () {
                    $.noop();
                },
                outEvent: outFunc || function () {
                    $.noop();
                }
            };
            var sets = $.extend(defaults, options || {});
            var hoverTimer, outTimer;
            return $(this).each(function () {
                $(this).hover(function (e) {
                    var This = this;
                    clearTimeout(outTimer);
                    hoverTimer = setTimeout(function () { sets.hoverEvent.call(This, e) }, sets.hoverDuring);
                }, function (e) {
                    clearTimeout(hoverTimer);
                    var This = this;
                    outTimer = setTimeout(function () { sets.outEvent.call(This, e) }, sets.outDuring);
                });
            });
        };

        var defaultLi = $("#navbar li.default");
       
        $('.quickPanel').hoverDelay({
            hoverDuring: 150,
            outDuring: 500},function () {
           /*$(this).show();
           var inx = $(".quickPanel > div").index($(".quickPanel > div:visible"));
           $('#navbar li').eq(inx).addClass("hover");*/
        },
        function (e) {
            var target = e.relatedTarget || e.toElement;
            //console.log(target);
            if (!target || target.id === 'quickPanelErrorContainer')
                return;

            $(this).hide();
            $(this).addClass("hidden");
            var activeItem = $('#navbar li.hover');
            $('#navbar li').removeClass("hover");
            hideError();
            defaultLi.addClass("default");
        });

        $('#navbar li').hoverDelay({
            hoverDuring: 150,
            outDuring: 500
            },function () {
            var quickPanels = $(".quickPanel > div");
            var navButtons = $('#navbar li');
            var activePanel = quickPanels.eq(navButtons.index(this));
            //if not login state then will not show my tennis drop down menu.
            if (!isLogged() && navButtons.index(this) == 4)
                return;

            if (activePanel.length > 0) {
                $(".quickPanel").show();
                $(".quickPanel").removeClass("hidden");
                quickPanels.hide();
                quickPanels.addClass("hidden");
                activePanel.show();
                activePanel.removeClass("hidden");
                navButtons.removeClass("hover");
                defaultLi.removeClass("default");
                $(this).addClass("hover");

                //restore error if has original message
                hideError();

                var errorMsg = $(this).data("error");
                if (errorMsg && errorMsg.length > 0) {
                    showError(errorMsg);
                }
            }
        }, function (e) {
            var target = e.relatedTarget || e.toElement;
            if (!target) return;
            //console.log(target);
            if ((target.nodeName && target.nodeName === 'LI') ||
                target.id === 'quickPanelErrorContainer') {
                return;
            }
            $('.quickPanel').hide();
            hideError();
            var activeItem = $('#navbar li.hover');
            $('#navbar li').removeClass("hover");
            defaultLi.addClass("default");
        });

        if (isLogged() && config.currentProject && (config.currentProject == "tournaments" || config.currentProject == "dashboard")) {
            service.checkSSOLoginWarningSwitch(function (switchOn) {
                var cookie = TL.JSCommon.CookieUtil.GetCookie(config.ssoLoginWarningConfirmedCookieName);

                if (switchOn === "True" && cookie == null) {
                    service.getRole(function (role) {
                        if (role.Name == "TM") {
                            service.isSSOAnnouncementConfirmed(function (result) {
                                if (!result.Confirmed) {
                                    var Container = "#divSSOAnnouncement";
                                    var Announcement = {
                                        Content: "<div style='font-style:italic;'>In order to provide a more secure experience in the immediate future and a more personalized experience in the near future, " +
                                            "TennisLink login is changing effective July 11, 2017.  The Tournament Manager (Member Organization number) login will no longer " +
                                            "be supported and all tournament administration must be accessed by logging in with Tournament Director credentials. " +
                                            "</div><br><div style='font-style:italic;'>ACTION REQUIRED: Please be sure your tournaments have a Tournament Director assigned and that TennisLink is " +
                                            "being accessed by logging into TennisLink as Tournament Director (not using Member Organization number).</div><br><div style='font-style:italic;'>" +
                                            "Please contact Linkteam for more information at Linkteam@usta.com</div>",
                                        ConfirmText: "Don’t Show again",
                                        OkText: "OK"
                                    };
                                    $(Container).html(tmpl("SSOAnnouncement_tmpl", Announcement));
                                    $("[data-id='OK']", $(Container)).on("click", function () {
                                        if ($("[data-id='Confirmed']", $(Container)).is(":checked")) {
                                            service.confirmSSOAnnouncement();
                                        }
                                        $.colorbox.close();
                                    });
                                    $.colorbox({
                                        inline: true,
                                        href: Container,
                                        width: 600,
                                        height: 250,
                                        onLoad: function () {
                                            TL.JSCommon.CookieUtil.AddCookie(config.ssoLoginWarningConfirmedCookieName, "true", 1);
                                            $(Container).show();
                                        },
                                        onClosed: function () {
                                            $(Container).hide();
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });


        }
    }

    /* ------------ Functionalities part ------------- */

    function addSelectOptions(arr, id, keyField, valueField) {
        var $sel = $("#" + id);
        $("#" + id + " option").remove();
        var keyField = "Key"  || keyField;
        var valueField = "Value" || valueField;
        if (!arr || arr.length == 0 || $sel.length == 0) return;
        for (var i = 0; i < arr.length; i++) {
            var item = arr[i];
            $sel.append("<option value='" + item[keyField] + "'>" + item[valueField] + "</option>");
        }
    }

    function onEnter(e) {
        var e = e || window.event;
        var key = e.keyCode ? e.keyCode : e.which;

        return key == 13;
    }

    String.prototype.trim = function () {
        return this.replace(/(^\s*)|(\s*$)/g, "");
    }

    function fnIncludeXSSChar(checkValue) {
        var regex = /[@<>/%]/;
        var ret = regex.test(checkValue);
        return ret;
    }

    function isInt(value) {
        var reg = /\D/;
        return value.match(reg) == null;  
    }

    function redirect(url) {       
        window.location.href = url;
    }

    function redirectDashboard(url) {
        redirect(config.rootUrl.dashboard + url);
    }

    function redirectTournaments(url) {
        redirect(config.rootUrl.tournaments + url);
    }

    function redirectTT(url) {
        redirect(config.rootUrl.teamTennis + url);
    }

    function redirectFlexLeague(url) {
        redirect(config.rootUrl.flexLeagues + url);
    }

    function redirectLeague(url) {
        redirect(config.rootUrl.leagues + url);
    }

    function getLogoutReturnURL()
    {
        var url=window.location.href.toLowerCase();
        var result = "";
        if (window.location.hostname.toLowerCase().startWith("m.")) {
            result = "https://" + window.location.hostname;
        }
        else if (url.indexOf("leagues") != -1)
        {
            result = config.rootUrl.leagues;
        }
        else if (url.indexOf("tournaments") != -1)
        {
            result = config.rootUrl.tournaments;
        }
        else if (url.indexOf("teamtennis") != -1) {
            result = config.rootUrl.teamTennis;
        }
        else if (url.indexOf("flexLeagues") != -1) {
            result = config.rootUrl.flexLeagues;
        }
        else if (url.indexOf("dashboard") != -1) {
            result = config.rootUrl.dashboard;
        }
        else if (url.indexOf("progression") != -1) {
            result = config.rootUrl.dashboard + "Main/Login.aspx?App=26";
        }
        return result;
    }


    var showError = function (msg) {
        var errMessage = $("#quickPanelErrorContainer");
        errMessage.html(msg);
        errMessage.show();
        $("#navbar li.hover").data("error", msg);
    };

    var hideError = function () {
        $("#quickPanelErrorContainer").hide();
    }   
    function openSelfRate() {
        var w;
        var h;
        w = 800;
        h = 600;
        if (config.userInfo.ustaNumber && parseInt(config.userInfo.ustaNumber) > 0) {
            var newWin = window.open(config.rootUrl.leagues + 'SelfRate/selfrate.aspx?ustanum=' + config.userInfo.ustaNumberUrlParamEncrypt + '&caller=home', 'SelfRate', ',toolbar=no,location=no,directories=no,status=no,menubar=yes,scrollbars=yes,resizable=yes,copyhistory=yes');
            //newWin.focus();
            //updateSelfRate(); todo
        }
        else {
            alert("Only USTA Members are allowed to Self Rate.");
        }
    }

    window.openSimpleSearchHelp = function(){
        window.open("/Leagues/HelpTutorials/Simple_Search_help.htm", "SimpleSearchHelpWin", "toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=650, height=450");
    }
    window.openTournamentsSimpleSearchHelp = function () {
        window.open("/tournaments/Common/Player_Search_Help.htm", "SimpleSearchHelpWin", "toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=650, height=450");
    }
    window.openPopUpSelfRate = function(swfURL) {
        window.open(swfURL, "flashWin", "toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=850, height=550");
    }

    window.tournamentshelp = function (url) {
        var oWin = window.open(url, 'Help', 'toolbar=0,menubar=0,location=0,directories=0,scrollbars=0,width=650,height=400');
        if (window.focus) { oWin.focus() }
        return false;
    }

    window.tt_findbyTeamName_help = function(formName) { 
        var sURL = formName;
        var newWin = window.open(sURL, "ProgramHelp", "width=600,height=300,resizable=yes,toolbar=no,status=yes");
        newWin.focus();				
    }

    window.validateSearchMemberName = function(searchTerm) {
        if (!fnIncludeXSSChar(searchTerm)) {
            var fname = "";
            var lname = "";
            var mySplitResult = searchTerm.split(" ");
            /*if (mySplitResult.length == 1) {
                // alert('Please enter both the Last Name and First Name of a player.');
                errMessage.html("<div class='error'>Please enter both the Last Name and First Name of a player.</div>");
                errMessage.show();
                return;
            }*/

            /*if (mySplitResult.length == 1 && mySplitResult[0].length == 1) {
                return { success: false, error: "You must enter at least the first 2 letters of the last name." };
            }*/

            if (mySplitResult.length == 1 && mySplitResult[0].length <= 2) {
                return { success: false, error: "When searching based on last name only, at least 3 characters are required. Otherwise you must enter at least 2 characters for first name and at least 2 characters for last name." };
            }
            if (mySplitResult.length > 1) {
                fname = mySplitResult[0];
                lname = mySplitResult[mySplitResult.length - 1];
                if (fname.length < 2 || lname.length < 2) {                   
                    return { success: false, error: "You must enter at least the first 2 letters of the first name and the first 2 letters of the last name." };
                }
            }
        } else {
            return { success: false, error: "The player name include invalid character." };
        }
        return { success: true };    
    }

    var quickPanelFunctionalities = window.quickPanelFunctionalities = {
        _validateName: function (firstName, lastName) {
            if (lastName.length < 2) {
                showError("Please enter at least 2 characters for the Last Name.");
                return false;
            }
            if (firstName.length < 1) {
                showError("Please enter at least 1 character for the First Name.");
                return false;
            }
            return true;
        },
        selfRateClick: function () {
            if (config.userInfo.ustaNumber && parseInt(config.userInfo.ustaNumber) > 0) {
                service.isSelfRate(function(ret){
                    if (ret)
                        openSelfRate(config.userInfo.ustaNumber);
                    else
                        alert('Sorry, you are not eligible to self-rate.');
                });
                
            }else{
                var r = confirm('Player must have a USTA Account and be logged in to self-rate. Press OK to login or create an account.');
                if (r == true) {
                    redirect(config.rootUrl.dashboard + "main/login.aspx");
                }
            }
        },
        recordAScoreClick: function () {
            if (isLogged()) {
                redirect(config.rootUrl.leagues + "Scorecard/RecordAScore.aspx");
                return;
            }
            var sResult = confirm("You must be logged in to enter a score. Click OK to login");
            if (sResult) {
                location.replace(config.rootUrl.dashboard + "Main/Login.aspx?App=3&ref=recordascore");
            }
        },
        findFlexLeagueByFormOne: function () {
            var divisionSelected = $('#q_sel_division').val();
            var stateSelected = $('#q_sel_state1').val();
            var metroAreaSelected = $('#q_sel_metro_area1').val();
            var url = "FlightSettings/FLSearch.aspx?isFromNavigation=true" + "&navigationDivision=" + divisionSelected + "&navigationState=" + stateSelected + "&navigationMetroArea=" + metroAreaSelected;
            redirectFlexLeague(url);
            
        },
        findFlexLeagueByFormTwo: function () {
            var year = $('#q_fl_year').val();
            var stateSelected = $('#q_sel_state2').val();
            var metroAreaSelected = $('#q_sel_metro_area2').val();
            var flexLeagueSelected = $('#q_sel_flex_league').val();
            var flightSelected = $('#q_sel_flight').val();
            service.viewFLStatsAndStandingReport(flightSelected, function (data) {
                if (data) {
                    var oWin = window.open(config.rootUrl.flexLeagues + "Reports/CRReportViewer.aspx?nostyle=1&rpttp=" + data, 'flexLeagues', 'toolbar=0,menubar=0,location=0,directories=0,scrollbars=0');
                    if (window.focus) { oWin.focus(); }
                } else {
                    alert("System error.");
                }
            });

        },
        findRanking: function () {
            var sInput = $("#q_ranking").val().trim();
            if (sInput.length == 0) {
                showError("Please enter USTA Membership # or player name.");
                return;
            }
            if (isInt(sInput)) {
                service.getEncrypt(sInput, function (ret) {
                    redirectTournaments("Rankings/RankingHome.aspx?PlayerID=" + ret);
                });                
            } else {
                var result = validateSearchMemberName(sInput);
                if (!result.success) {
                    showError(result.error);
                    return;
                }
                //USTA-20635 using new url format. By Aaron Jee
                redirectTournaments("Rankings/RankingHome.aspx?RankingPlayerName=" + sInput)
            }
        },
        findRating: function () {
            var sInput = $("#RatingInput").val().trim();
            if (sInput.length == 0) {
                showError("Please enter USTA Membership # or player name.");
                return false;
            }
            location.href = "/Dashboard/Main/Progression/RatingSearch.aspx?p=" + TL.JSCommon.encode64forUrlParameter(sInput);
            return false;
        },
        findRatingTT: function () {
            var sInput = $("#RatingInputTT").val().trim();
            if (sInput.length == 0) {
                showError("Please enter USTA Membership # or player name.");
                return false;
            }
            location.href = "/Dashboard/Main/Progression/RatingSearch.aspx?p=" + TL.JSCommon.encode64forUrlParameter(sInput);
            return false;
        },
        findATournament: function () {
            var sSearchTerm = $("#q_tournament_name").val().trim(),
                tournametType = $("#q_tournament_type").val(),
                strAgeGroup = tournametType.split(":")[0],
                strSanctioned = tournametType.split(":")[1];            

            if (sSearchTerm.length == 0) {
                showError("Please enter a Zip Code, Tournament ID# or Tournament Name.");
                return;
            }
            service.checkZipFormat(sSearchTerm, function (ret) {
                if (ret) {
                    redirectTournaments("Schedule/SearchResults.aspx?Action=2&Year=" + new Date().getFullYear() + "&Zip=" + sSearchTerm + "&Sanctioned=" + strSanctioned + "&AgeGroup=" + strAgeGroup + "&QuickSearch=6");
                } else {
                    if (isInt(sSearchTerm)) {
                        redirectTournaments("Schedule/SearchResults.aspx?Action=1&Year=&TournamentID=" + sSearchTerm + "&Sanctioned=" + strSanctioned + "&AgeGroup=" + strAgeGroup)
                    } else {
                        redirectTournaments("Schedule/SearchResults.aspx?Action=2&Year=" + new Date().getFullYear() + "&Keywords=" + sSearchTerm + "&Sanctioned=" + strSanctioned + "&AgeGroup=" + strAgeGroup)
                    }
                }
            });
        },
        findPlayerRecord: function () {
            var firstName = $("#q_fl_first_name").val().trim();
            var lastName = $("#q_fl_last_name").val().trim();
            var checked = $("#q_name_start_with").attr("checked");
            if (checked) {
                if (firstName.length < 2 || lastName.length < 3) {
                    showError('Must input at least 2 letters for First Name and 3 letters for Last Name');
                    return false;
                }
            }
            redirectFlexLeague("Reports/ViewReport.aspx?ReportID=20&FName=" + firstName + "&LName=" + lastName + "&SType=" + (checked ? "1" : "0"));
        },
        findByPlayerName: function () {
            var firstName = $("#q_tt_first_name").val().trim();
            var lastName = $("#q_tt_last_name").val().trim();
            if (!this._validateName(firstName, lastName)) return;
            redirectTT("Main/Stats.aspx?Load=AdvSearch&Search=Player&FN=" + firstName + "&LN=" + lastName + "&EM=False");

        },
        findByTeamName: function () {
            var teamName = $("#q_tt_team_name").val().trim();
            if(teamName.length < 4){
                showError("Please enter at least 4 characters for the Team Name.");
                return;
            }
            redirectTT("Main/Stats.aspx?Load=AdvSearch&Search=Team&TN=" + teamName);
        },
        findByPersonId: function () {
            var personId = $("#q_tt_personId").val().trim();
            if(personId.length == 0){
                showError("Please enter a USTA/Team Tennis Number.");
                return;
            }
            if(!isInt(personId)){
                showError("Please enter a numeric value.");
                return;
            }
            redirectTT("Main/Stats.aspx?Load=AdvSearch&Search=MemberID&ID=" + personId);
        },
        findByTeamNumber: function () {
            var teamNumber = $("#q_tt_team_number").val().trim();
            if(teamNumber.length == 0){
                showError("Please enter a Team Number.");
                return;
            }
            if(!isInt(teamNumber)){
                showError("Please enter a numeric value.");
                return;
            }
            redirectTT("Main/Stats.aspx?Load=AdvSearch&Search=TeamNumber&TNO=" + teamNumber);
        },
        findByMatchNumber: function () {
            var matchNumber = $("#q_tt_match_number").val().trim();
            if (matchNumber.length == 0) {
                showError("Please enter a Match Number.");
                return;
            }
            if (!isInt(matchNumber)) {
                showError("Please enter a valid match number.");
                return;
            }
            redirectTT("Main/Stats.aspx?Load=AdvSearch&Search=MatchNumber&MNO=" + matchNumber);
        },
        fnFuzzySearch: function (inputVal) {
            var searchTerm = inputVal;
            if (searchTerm == '') {
                showError("Enter USTA Membership #, team # or player name.");
                return false;
            }
            if (isInt(searchTerm) != true) {
                var result = validateSearchMemberName(searchTerm);
                if (!result.success) {
                    showError(result.error);
                    return false;
                }
            }
            return true;
        }
    };

  })();