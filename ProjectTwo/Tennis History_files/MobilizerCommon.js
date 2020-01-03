var TLMobilizer = TLMobilizer || {};

(function () {
    TLMobilizer.SSOIframe = function () {
        if ($("#ifrmSyncUSTASSO").length > 0) {$("#ifrmSyncUSTASSO").remove();}
        $("body").append('<iframe id="ifrmSyncUSTASSO" src="https://' + GetTennisLinkHostname() + '/Dashboard/Common/SyncUSTASSO.aspx" style="margin: 0; width: 0; height: 0; display: none;"></iframe>');

        if ($("#ifrmLogout").length > 0) { $("#ifrmLogout").remove(); }
        $("body").append('<iframe id="ifrmLogout" src="https://' + location.hostname + '/MSyncUSTASSO" style="margin: 0; width: 0; height: 0; display: none;"></iframe>');
    };    

    TLMobilizer.LogoutListener = function () {
        setInterval(function () {
            var OathTokenCookieName = "OAuthToken";
            var TennisLinkEmailIDCookieName = "tlemailId";
            var JanrainUuidCookieName = "uuid";

            var janrainUuid = TL.JSCommon.CookieUtil.GetCookie(JanrainUuidCookieName);
            var tennislinkEmailId = TL.JSCommon.CookieUtil.GetCookie(TennisLinkEmailIDCookieName);
            var oauthToken = TL.JSCommon.CookieUtil.GetCookie(OathTokenCookieName);
            

            console.log(janrainUuid);

            if (janrainUuid) {
                return;
            }

            if (tennislinkEmailId && !oauthToken) {
                var iframeId = "temp_26083";
                var iframe = $("#" + iframeId);
                if (iframe.length > 0) {
                    iframe.remove();
                }
                var url = "https://" + location.hostname + "/MLogout";
                //var url = "https://" + GetTennisLinkHostname() + "/dashboard/common/reset.aspx";

                iframe = $("<iframe id='" + iframeId + "' src= '" + url + "' style='margin: 0; width: 0; height: 0; display: none;'/>");
                iframe[0].onload = function () {
                    var domain=".usta.com";
                    TL.JSCommon.CookieUtil.AddCookie_new("uuid","",-1,domain );  
                    TL.JSCommon.CookieUtil.AddCookie_new("OAuthToken","",-1,domain ); 
                    TL.JSCommon.CookieUtil.AddCookie_new("ProfileToken","",-1,domain);   
                    TL.JSCommon.CookieUtil.AddCookie_new("tlemailId","",-1,domain);  
                    TL.JSCommon.CookieUtil.AddCookie_new("tluuid","",-1,domain );           
                    TL.JSCommon.CookieUtil.AddCookie_new("ssou","",-1,domain); 
                    TL.JSCommon.CookieUtil.AddCookie_new("emailId","",-1,domain); 
                    TL.JSCommon.CookieUtil.AddCookie_new("refreshUserState", JSON.stringify({ value: new Date().getTime(), key: "mobilizer" }), 1, "." + GetTennisLinkHostname());                    
                }

                $('body').append(iframe);
            }
        }, 10000);
    };
})();

$(function () {
    TLMobilizer.SSOIframe();
    //remove browser warning.
	var bw = "#9f4bd14d_3062_41d6_8853_c0bbfc87e18c";
	if($(bw).length>0)
	{
		$(bw).remove();
	}
});