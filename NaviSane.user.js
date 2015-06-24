// ==UserScript==
// @name        NaviSane
// @version     1.8
// @namespace   https://github.com/steria/NaviSane
// @homepage    https://github.com/steria/NaviSane
// @downloadURL https://github.com/steria/NaviSane/raw/master/NaviSane.user.js
// @description GUI-tweaks for timeføring
// @match       https://naviwep.steria.no/*
// @require     http://code.jquery.com/jquery-1.10.2.min.js
// ==/UserScript==

// Pre-commit sjekkliste:
// * Justere @version
// * Beskrive feature i readme.md (og justere "NY"-markering/er der)

// TODO/WISHLIST:
// highlightNegativeDiffs()
// highlightZeroHourDays()
// spreadsheetLook()
// saneTabbingOrder()
// saneArrowKeys()
// reopenButton()
// saveShortcut();


// UTILS

if ( !String.prototype.contains ) {
    String.prototype.contains = function() {
        return this.indexOf(arguments[0]) !== -1;
    };
}

String.prototype.appearsIn = function() {
    return arguments[0].indexOf(this) !== -1;
};

const KEYCODE_EQUALS = 61;


// FEATURES

function saneColumnHeaders(){
    var monthName = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    $("a[title^='Date']" ).each(function(){
        var title = $(this).attr("title")
        var month = Number(title.substr(10, 2));
        var day = Number(title.substr(12, 2));
        var date = monthName[month] + " " + day;
        $(this).append("<br>"+date);
    });
}

function saneCellAlignment(){
    $('span.riSingle').css('width','auto');
}

function sanePeriodHeader(){
    var headerSpan = $("#ctl00_ContentPlaceHolder1_LBL_CurrentPeriod");
    var oldTitle = headerSpan.text();
    var groups = /^(\d\d\.\d\d\.\d\d\d\d - \d\d\.\d\d\.\d\d\d\d) .Week(\d\d?).\d\d\d\d ?(\d?)/.exec(oldTitle);
    var dateRange = groups[1];
    var weekNo = groups[2];
    var weekPart = groups[3];
    var weekSep = weekPart.length>0 ? "." : ""; 
    var newText = "&nbsp;<b>Week " + weekNo + weekSep + weekPart + "</b>&nbsp; <span style='color:silver;font-size:smaller'>" + dateRange + "</span>";
    headerSpan.html(newText);
}

function currentPeriod(){
    var header = $("#ctl00_ContentPlaceHolder1_LBL_CurrentPeriod").text();
    return header.replace(/^.*(\d\d\.\d\d\.\d\d\d\d - \d\d\.\d\d\.\d\d\d\d).*$/, "$1");
}

function sanePeriodNavigation(){
    $(".CurrentPeriod").prepend("<button type='button' id='prevPeriod'>◀</button>");
    $(".CurrentPeriod").append("<button type='button' id='nextPeriod'>▶</button>");
    
    $("#prevPeriod").click(function() {
        var period = currentPeriod();
        var dropdown = $("#ctl00_ContentPlaceHolder1_PeriodDropdownList_Arrow").get(0);
        dropdown.click();
        var thisItem = $("li.rcbItem:contains('"+period+"')");
        thisItem.next().click();
    } );
    
    $("#nextPeriod").click(function() {
        var period = currentPeriod();
        var dropdown = $("#ctl00_ContentPlaceHolder1_PeriodDropdownList_Arrow").get(0);
        dropdown.click();
        var thisItem = $("li.rcbItem:contains('"+period+"')");
        thisItem.prev().click();
    } );
}

function saneCellWidths(){
	$("head").append("<style>.myclass { width: 40px !important; }</style>");
}

function killThoseEffingMenuAnimations(){
    Telerik.Web.UI.AnimationSettings.prototype.get_type = function(){return 0;}
    Telerik.Web.UI.AnimationSettings.prototype.get_duration = function(){return 0;}
    Telerik.Web.UI.RadMenu.prototype.get_collapseDelay = function(){return 0;}
}    

function zebraStripes() {
    $("head").append("<style>.rgMasterTable tbody tr:nth-child(even) { background-color: #E4ECF2; }</style>");
}

function inputsInSameColumn($input){
    var column = $input.closest('td').index() +1;
    var $inputs = $input.closest('table').find('td:nth-child('+ column +') .riTextBox');
    return $inputs;
}

function inputLikeYesterday($input) {
    var $inputToLeft = $input.closest("td").prev().find(".riTextBox");
    if ($inputToLeft.length === 1){
        $input.val($inputToLeft.val());
    }
}

function columnLikeYesterday($input) {
    var $inputToLeft = $input.closest("td").prev().find(".riTextBox");
    var $inputToRight = $input.closest("td").next().find(".riTextBox");
    if ($inputToLeft.length === 0){
        columnLikeYesterday($inputToRight);
        return;
    }
    inputsInSameColumn($input).each(function(){
        inputLikeYesterday($(this));
    });

    $inputToRight.focus();
}

function likeYesterdayShortcut() {
    $(".riTextBox").keypress(function(event){
        if (event.keyCode === KEYCODE_EQUALS){ 
            columnLikeYesterday($(event.target));
        }
    }).attr("title","Like yesterday: press '='");
}

                             
// SETUP

function onPeriodChange(handler){
    $(".CurrentPeriod").on("DOMNodeInserted", function(e){
        if (e.target.id == "ctl00_ContentPlaceHolder1_LBL_Approved"){
			handler();
        }
    });
}

function initPeriod(){
    saneColumnHeaders();
    saneCellAlignment();
    sanePeriodHeader();
}

function initPeriodDirectView(){
    sanePeriodNavigation();
    saneCellWidths();
    zebraStripes();
    likeYesterdayShortcut();
    
    onPeriodChange(initPeriod);
    initPeriod();
}

function initCommon(){
    killThoseEffingMenuAnimations();
}

function initView(){
    if ("/timereg_direct.aspx".appearsIn(document.location.pathname)){
        initPeriodDirectView();
    }
}

function initPage(){
    initCommon();
    initView();
}

initPage();

