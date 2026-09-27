<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Mock UMS — Group List</title></head>
<body>
<!-- Stand-in for the real UMS Group List page, used to test extension/ums-export.js locally.
     tools/devserver.py answers the export postback with tools/fixtures/ums-grouplist-sample.xls. -->
<form method="post" action="./GroupList.aspx" id="form1">
    <input type="hidden" name="__EVENTTARGET" id="__EVENTTARGET" value="">
    <input type="hidden" name="__EVENTARGUMENT" id="__EVENTARGUMENT" value="">
    <input type="hidden" name="__VIEWSTATE" id="__VIEWSTATE" value="mockViewState==">
    <input type="hidden" name="__EVENTVALIDATION" id="__EVENTVALIDATION" value="mockValidation==">
    <script>
        function __doPostBack(t, a) { var f = document.forms.form1; f.__EVENTTARGET.value = t; f.__EVENTARGUMENT.value = a; f.submit(); }
    </script>
    <h2>Group List</h2>
    <label>From <input type="text" name="ctl00$ContentPlaceHolder1$txtFrom" value="01/10/2026"></label>
    <input type="submit" name="ctl00$ContentPlaceHolder1$btnSearch" value="Search">
    <a id="ctl00_ContentPlaceHolder1_lnkExport" href="javascript:__doPostBack('ctl00$ContentPlaceHolder1$lnkExport','')">Export to Excel</a>
    <input type="submit" name="ctl00$ContentPlaceHolder1$btnExportXls" id="btnExportXls" value="Download XLS">
    <table><tr><th>SR NO</th><th>SH Ref</th></tr></table>
</form>
</body>
</html>
