// ==UserScript==
// @name        NaviSane
// @version     2.4
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
// dimZeroHourDays()
// "save" shortcut tooltip
// '.' => ','
// paste 07:15 => 7,25
// responsiveColumnWidths() - inc. responsive day names?
// finish saneArrowKeys() (right/left navigation)
// menuHoverIntent()
// reopenButton()
// highlightLineUnderCursor
// highlightFocusedLine
// style -> class

// UTILS

if (!String.prototype.contains) {
    String.prototype.contains = function () {
        return this.indexOf(arguments[0]) !== -1;
    };
}

String.prototype.appearsIn = function () {
    return arguments[0].indexOf(this) !== -1;
};

function ignore() {
    //pass item as param to get rid of 'unused' warnings
}


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
    $("head").append(
        "<style>" +
        "  input.myclass { width: 100% !important; } " +
        "  .riSingle {width:auto !important;} " +
        "</style> "
    );
}

function killThoseEffingMenuAnimations() {
    Telerik.Web.UI.AnimationSettings.prototype.get_type = function () {
        return 0;
    };
    Telerik.Web.UI.AnimationSettings.prototype.get_duration = function () {
        return 0;
    };
    Telerik.Web.UI.RadMenu.prototype.get_collapseDelay = function () {
        return 0;
    };
}

function spreasheetStyle() {
    $("head").append("<style>" +
        ".RadGrid_WebBlue .rgAltRow { background-color: #f0f3fa;}" +
        ".RadGrid_WebBlue .rgFooter td{padding-right: 5px;}" +
        ".rgMasterTable td[align=right]{font-family: Arial, sans-serif !important;}" +
        ".rgMasterTable>tbody td{ background-color:rgba(0,0,0, 0.05);}" +
        ".rgMasterTable>tbody td[align=right]{padding: 1px;  background-color:transparent;}" +
        ".rgMasterTable>tbody td:last-child {background-color:rgba(0,0,0, 0.05);}" +
        ".RadGrid_WebBlue .rgRow>td, .RadGrid_WebBlue .rgAltRow>td " + "  { border-width:0 0 0 1px;}" +
        "input.myclass { background-color: transparent !important; border-width:0 !important; font-family: Arial, sans-serif !important } " +
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
    if ($inputToLeft.length === 0) {
        return;
    }
    inputsInSameColumn($input).each(function () {
        inputLikeYesterday($(this));
    });

    $inputToRight.focus();
}

function likeYesterdayShortcuts() {
    $(document).keyup(function (keyEvent) {
        switch (keyEvent.key) {
        case " ":
            inputLikeYesterday($(keyEvent.target));
            break;
        case "=":
            columnLikeYesterday($(keyEvent.target));
            break;
        }
    });
    $("input.riTextBox").attr("title", "<space> = Like yesterday");
}

function saneSaveShortcut() {
    $(document).keydown(function (keyEvent) {
        if (keyEvent.ctrlKey && keyEvent.key === "s") {
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
    $("input.riTextBox").each(function () {
        this.control._incrementSettings.InterceptArrowKeys = false;
    });
}

function arrowKeyNavigation() {
    $(document).keydown(function (keyEvent) { // only keyup/keydown is generated for arrow keys (in Chrome)
        switch (keyEvent.key) {
        case "ArrowUp":
            upCell($(keyEvent.target));
            break;
        case "ArrowDown":
            downCell($(keyEvent.target));
            break;
        case "ArrowRight":
            rightCell($(keyEvent.target));
            break;
        case "ArrowLeft":
            leftCell($(keyEvent.target));
            break;
        }
    });
}

function highlightTimeDiffs() {
    $("tr.rgFooter:nth-child(2)>td[align=right]").each(function () {
        $(this).attr("style", "color:#999; font-weight:normal");
    });
    $("tr.rgFooter:last>td[align=right]").each(function () {
        if ($(this).text().includes("-")) {
            $(this).attr("style", "color:#e00; font-weight:bold");
        }
        else if ($(this).text().includes("0,00")) {
            $(this).attr("style", "color:#000; font-weight:normal");
        }
        else {
            $(this).attr("style", "color:#0b0; font-weight:bold");
        }
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
    highlightTimeDiffs();
    setTimeout(saneArrowKeys, 100); // Timeout is an ugly hack. TODO: find clean trigger that occurs after page applies arrow key bindings, even following save.
}

function initPeriodDirectView() {
    sanePeriodNavigation();
    saneCellWidths();
    spreasheetStyle();
    arrowKeyNavigation();
    saneSaveShortcut();
    likeYesterdayShortcuts();

    onPeriodChange(initPeriod);
    initPeriod();
}

function initView() {
    if ("/timereg_direct.aspx".appearsIn(document.location.pathname)) {
        initPeriodDirectView();
    }
}

function initCommon() {
    killThoseEffingMenuAnimations();
}

function initPage() {
    initCommon();
    initView();
}

initPage();
