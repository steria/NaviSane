// ==UserScript==
// @name        NaviSane
// @version     2.8
// @namespace   https://github.com/steria/NaviSane
// @homepage    https://github.com/steria/NaviSane
// @downloadURL https://github.com/steria/NaviSane/raw/master/NaviSane.user.js
// @description GUI-tweaks for timeføring
// @match       https://naviwep.steria.no/*
// @require     https://code.jquery.com/jquery-3.2.1.min.js
// ==/UserScript==

// Pre-commit sjekkliste:
// * Justere @version
// * Beskrive feature i readme.md (og justere "NY"-markering/er der)

// TODO/WISHLIST:
// responsiveColumnWidths() - incl. responsive day names?
// finish saneArrowKeys() (right/left navigation)
// reopenButton()
// highlightLineUnderCursor()
// highlightFocusedLine()
// style -> class
// menuHoverIntent()


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

function saneTableStyle() {
  $("head").append("<style>" +

    // Regneark-celler: hele cellen _er_ et input-felt
    ".riSingle {width:auto !important;} " +
    "input.myclass { width: 100% !important;  background-color: transparent !important; border-width:0 !important; } " +

    // Konsistente tallkolonner
    ".rgMasterTable td[align=right]{font-family: Arial, sans-serif !important;} " + // like brede siffer i bold som normal
    "input.myclass {font-family: Arial, sans-serif !important } " + // samme font i input
    ".RadGrid_WebBlue .rgFooter td{padding-right: 5px; border:unset} " + // samme høyremarg for input og utregnede verdier

    // Flat stil
    ".RadGrid_WebBlue { border: unset } "+
    ".RadMenu_WebBlue .rmRootGroup {background-image: unset} "+
    ".RadGrid_WebBlue .rgHeader { background-image: unset; border: unset} " +
    ".RadGrid_WebBlue .rgRow>td, .RadGrid_WebBlue .rgAltRow>td " + "  { border-width:0 0 0 1px;} " +
    ".RadGrid_WebBlue .rgCommandCell {border:unset} "+
    ".RadGrid_WebBlue .rgCommandRow {background: unset} " +
    ".RadGrid_WebBlue .rgPager {background:unset} "+
    ".RadGrid_WebBlue td.rgPagerCell {border:unset} "+

    // Kolonnefarger
    ".rgMasterTable>tbody td[align=right]{padding: 1px;  background-color:transparent;} " + // hvit for input
    ".rgMasterTable>tbody td{ background-color:rgba(0,64,128, 0.05);} " +  // blågrå for read-only
    ".rgMasterTable>tbody td:last-child {background-color:rgba(0,64,128, 0.05);} " +
    ".RadGrid_WebBlue .rgAltRow { background-color: #f7f7f7;} " + // sebra-striper som funker med kolonnefargene

    // Fjern øvre knapper
    "thead .rgCommandRow {display: none} "+

    // Flytt nedre knapper til høyre og på samme linje:
    ".RadGrid_WebBlue .rgCommandCell tr{display: inline} "+
    ".RadGrid_WebBlue .rgCommandCell table {width: 100%} "+
    ".RadGrid_WebBlue .rgCommandCell table tbody {text-align: right} "+

    // Vanlig knappeutseende på periode-dropdown
    ".RadComboBox_WebBlue tr{display: block}"+
    ".RadComboBox_WebBlue .rcbArrowCell, .RadComboBox_WebBlue .rcbInputCell{-webkit-appearance: button; background-image: unset}"+
    ".RadComboBox_WebBlue .rcbInputCell{width: auto !important}"+
    ".RadComboBox .rcbInputCell input {width: auto}"+
    ".RadComboBox .rcbInputCell:after {content: '▼'}"+
    ".RadComboBox .rcbArrowCell {display:none}"+
    "</style>");
}

function inputsInSameRow($input) {
  var row = $input.closest('tr');
  return $(row).find('input.riTextBox');
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
  $("input[id$=SaveRegistrations]").prop("title", "Ctrl+S");
}

function replaceSelection(input, content){
  var old = $(input).val();
  $(input).val(old.slice(0,input.selectionStart) + content + old.slice(input.selectionEnd));
}

function saneDecimalPoint() {
  $("#TimeSheetTableDiv .riTextBox").keydown(function (e1) {
    if (e1.key === ".") {
      replaceSelection(e1.target, ",");
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

function highlightDayOff($cell){
  var column = $cell.index() + 1;
  $cell.closest('table').find('tbody td:nth-child(' + column + ')').each( function(){
    $(this).attr("style", "background-color:rgba(255,0,0, 0.05);"); //TODO: use class in stead
  });
}

function highlightTimeDiffs() {
  $("tr.rgFooter:nth-child(2)>td[align=right]").each(function () {
    $(this).attr("style", "color:#999; font-weight:normal");
    if ($(this).text().includes("0,00")) {
      highlightDayOff($(this));
    }
  });
  $("tr.rgFooter:last>td[align=right]").each(function () {
    if ($(this).text().includes("-")) {
      $(this).attr("style", "color:#e00; font-weight:bold");
    }
    else if ($(this).text().includes("0,00")) {
      $(this).attr("style", "color:#0b0; font-weight:normal;");
    }
    else {
      $(this).attr("style", "color:#00d; font-weight:bold");
    }
  });

}

function saneTableFocus() {
  $("#ctl00_ContentPlaceHolder1_Grid_TimeSheet").removeAttr('tabIndex');
}

function conditionalPager(){
  if ($(".rgPager .rgInfoPart").text().contains("in 1 pages")){
    $(".rgPager").hide();
  }
}

function toDecimal(hoursMinutes){
  var [both, hours, minutes] = hoursMinutes.match(/(\d+):(\d+)/);
  var hundredths = Math.round(minutes*100/60);
  return `${hours},${hundredths}`;
}

function parseTime(src){
  if (src.match(/\d+:\d+/)) return toDecimal(src);
  return src.replace('.', ',');
}

function smartPaste(){
  $("#TimeSheetTableDiv .riTextBox").on('paste', function(e) {
    var payload = e.originalEvent.clipboardData.getData('text');
    var rowCells = inputsInSameRow(e.target);
    var focusColumn = rowCells.index(e.target);
    var newValues = payload.split("\t").map(s=>parseTime(s));
    if (newValues && newValues[0]){
      for (var i = 0; i < newValues.length && i + focusColumn < rowCells.length; i++){
        $(rowCells[i+focusColumn]).val(newValues[i]);
      }
      return false;
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

function afterNativePeriodInit() {
  saneArrowKeys();
  saneTableFocus();
}

function initPeriod() {
  saneColumnHeaders();
  sanePeriodHeader();
  smartPaste();
  highlightTimeDiffs();
  conditionalPager();
  setTimeout(afterNativePeriodInit, 100);
}

function initPeriodDirectView() {
  sanePeriodNavigation();
  arrowKeyNavigation();
  saneSaveShortcut();
  saneDecimalPoint();
  likeYesterdayShortcuts();
  initPeriod();

  onPeriodChange(initPeriod);
}

function initCommon() {
  saneTableStyle();
  killThoseEffingMenuAnimations();
}

function initPage() {
  initCommon();
  if ("/timereg_direct.aspx".appearsIn(document.location.pathname)) {
    initPeriodDirectView();
  }
}

initPage();
