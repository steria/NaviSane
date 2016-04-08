// ==UserScript==
// @name        NaviSane
// @version     2.1.2
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
// finish saneArrowKeys() (right/left navigation)
// highlightNegativeDiffs()
// highlightPositiveDiffs()
// highlightZeroHourDays()
// forbedre saneColumnWidth() => responsiveColumnWidths() - inc. responsive day names
// spreadsheetLook()
// highlightLineUnderCursor
// highlightFocusedLine
// reopenButton()
// menuHoverIntent()
// '.' => ','
// 07:15 -> 7,25
// fix "likeYesterday()"

// UTILS

if (!String.prototype.contains) {
    String.prototype.contains = function () {
        return this.indexOf(arguments[0]) !== -1;
    };
}

String.prototype.appearsIn = function () {
    return arguments[0].indexOf(this) !== -1;
};

const KEYCODE_EQUALS = 61;

const KEY_LEFT = 37;
const KEY_UP = 38;
const KEY_RIGHT = 39;
const KEY_DOWN = 40;
const KEY_S = 83;


// FEATURES

function saneColumnHeaders() {
    var monthName = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    $("a[title^='Date']").each(function () {
        var title = $(this).attr("title");
        var month = Number(title.substr(10, 2));
        var day = Number(title.substr(12, 2));
        var date = monthName[month] + " " + day;
        $(this).append("<br>" + date);
    });
}

function saneCellAlignment() {
    $('span.riSingle').css('width', 'auto');
}

function sanePeriodHeader() {
    var headerSpan = $("#ctl00_ContentPlaceHolder1_LBL_CurrentPeriod");
    var oldTitle = headerSpan.text();
    var groups = /^(\d\d\.\d\d\.\d\d\d\d - \d\d\.\d\d\.\d\d\d\d) .Week(\d\d?).\d\d\d\d ?(\d?)/.exec(oldTitle);
    var dateRange = groups[1];
    var weekNo = groups[2];
    var weekPart = groups[3];
    var weekSep = weekPart.length > 0 ? "." : "";
    var newText = "&nbsp;<b>Week " + weekNo + weekSep + weekPart + "</b>&nbsp; <span style='color:silver;font-size:smaller'>" + dateRange + "</span>";
    headerSpan.html(newText);
}

function currentPeriod() {
    var header = $("#ctl00_ContentPlaceHolder1_LBL_CurrentPeriod").text();
    return header.replace(/^.*(\d\d\.\d\d\.\d\d\d\d - \d\d\.\d\d\.\d\d\d\d).*$/, "$1");
}

function sanePeriodNavigation() {
    $(".CurrentPeriod")
        .prepend("<button type='button' id='prevPeriod'>◀</button>")
        .append("<button type='button' id='nextPeriod'>▶</button>")
    ;

    $("#prevPeriod").click(function () {
        var period = currentPeriod();
        var dropdown = $("#ctl00_ContentPlaceHolder1_PeriodDropdownList_Arrow").get(0);
        dropdown.click();
        var thisItem = $("li.rcbItem:contains('" + period + "')");
        thisItem.next().click();
    });

    $("#nextPeriod").click(function () {
        var period = currentPeriod();
        var dropdown = $("#ctl00_ContentPlaceHolder1_PeriodDropdownList_Arrow").get(0);
        dropdown.click();
        var thisItem = $("li.rcbItem:contains('" + period + "')");
        thisItem.prev().click();
    });
}

function saneCellWidths() {
    $("head").append("<style>.myclass { width: 40px !important; }</style>");
}


function killThoseEffingMenuAnimations() {
    Telerik.Web.UI.AnimationSettings.prototype.get_type = function () {
        return 0;
    }
    Telerik.Web.UI.AnimationSettings.prototype.get_duration = function () {
        return 0;
    }
    Telerik.Web.UI.RadMenu.prototype.get_collapseDelay = function () {
        return 0;
    }
}

function zebraStripes() {
    $("head").append("<style>" +
        ".rgMasterTable>tbody tr:nth-child(even) { background-color: #E4ECF2; }" +
        ".rgMasterTable>tbody>tr.rgEditRow>td{ border-bottom-width: 0;}" +
        //".rgMasterTable>tbody>tr.rgEditRow>td:nth-child(1n+6) {width: 50px; border-right:solid 1px silver; }" +
        "</style>");
}

function inputsInSameColumn($input) {
    var column = $input.closest('td').index() + 1;
    return $input.closest('table').find('td:nth-child(' + column + ') input.riTextBox');
}

function inputLikeYesterday($input) {
    var $inputToLeft = $input.closest("td").prev().find("input.riTextBox");
    if ($inputToLeft.length === 1) {
        $input.val($inputToLeft.val());
    }
}

function columnLikeYesterday($input) {
    var $inputToLeft = $input.closest("td").prev().find("input.riTextBox");
    var $inputToRight = $input.closest("td").next().find("input.riTextBox");
    if ($inputToLeft.length === 0) {
        columnLikeYesterday($inputToRight);
        return;
    }
    inputsInSameColumn($input).each(function () {
        inputLikeYesterday($(this));
    });

    $inputToRight.focus();
}

function likeYesterdayShortcut() {
    $(document).keypress(function (keyEvent) { // only 'keypress' identifies '=' consistently without regard to actual key combo used (on Chrome)
        if (keyEvent.keyCode === KEYCODE_EQUALS) {
            columnLikeYesterday($(keyEvent.target));
        }
    });
    $("input.riTextBox").attr("title", "Like yesterday: '='");
}


function saveShortcut() {
    $(document).keydown(function (keyEvent) {
        if (keyEvent.ctrlKey && keyEvent.keyCode === KEY_S) {
            keyEvent.preventDefault();
            keyEvent.target.blur();
            $("#ctl00_ContentPlaceHolder1_Grid_TimeSheet_ctl00_ctl02_ctl00_BTN_SaveRegistrations").click();
            return false;
        }
    });
}

function upCell($input) {
    var columnNo = $($input).closest('td').index();
    var $row = $input.closest('tr');
    $row.prev().children().eq(columnNo).find('input.riTextBox').focus();
}

function downCell($input) {
    var columnNo = $($input).closest('td').index();
    var $row = $input.closest('tr');
    $row.next().children().eq(columnNo).find('input.riTextBox').focus();
}

function rightCell($input) {
    //TODO: move focus right ONLY if cursor is at end of content.
}

function leftCell($input) {
    //TODO: move focus left ONLY if cursor is at start of content.
}

function saneArrowKeys() {
    $(document).keydown(function (keyEvent) { // only keyup/keydown is generated for arrow keys (in Chrome)
        switch (keyEvent.keyCode) {
            case KEY_UP:
                upCell($(keyEvent.target));
                break;
            case KEY_DOWN:
                downCell($(keyEvent.target));
                break;
            case KEY_RIGHT:
                rightCell($(keyEvent.target));
                break;
            case KEY_LEFT:
                leftCell($(keyEvent.target));
                break;
        }
    });

    $("input.riTextBox").each(function () {
        this.control._incrementSettings.InterceptArrowKeys = false;
    });
}


// SETUP

function onPeriodChange(handler) {
    $(".CurrentPeriod").on("DOMNodeInserted", function (e) {
        if (e.target.id === "ctl00_ContentPlaceHolder1_LBL_Approved") {
            handler();
        }
    });
}

function initPeriod() {
    saneColumnHeaders();
    saneCellAlignment();
    sanePeriodHeader();
    setTimeout(saneArrowKeys, 100); // Timeout is an ugly hack. TODO: find clean trigger that occurs after page applies arrow key bindings, even following save.
}

function ignore() {
} //pass item as param to get rid of 'unused' warnings

function initPeriodDirectView() {
    sanePeriodNavigation();
    saneCellWidths();
    zebraStripes();
    ignore(likeYesterdayShortcut()); //TODO: reenable when bugs fixed
    saveShortcut();
    onPeriodChange(initPeriod);
    initPeriod();
}

function initCommon() {
    killThoseEffingMenuAnimations();
}

function initView() {
    if ("/timereg_direct.aspx".appearsIn(document.location.pathname)) {
        initPeriodDirectView();
    }
}

function initPage() {
    initCommon();
    initView();
}

initPage();

