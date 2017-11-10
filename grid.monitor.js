var REFRESH_ENABLED = false;
var OFF = 'OFF';

var values = [
    OFF,
    '0.5 seconds',
    '1 second',
    '2 seconds',
    '3 seconds',
    '5 seconds',
    '10 seconds'];

var millisTable = [
    '0',
    '500',
    '1000',
    '2000',
    '3000',
    '5000',
    '10000'];

function prettyPrint(el) {
    var spaces = 5;

    return el
        ? '<pre>' + JSON
            .stringify(el, null, spaces)
            .replace(/\s{5}"/g, '') //extra spaces
            .replace(/[",:{}]/g, '') //symbols
            .replace(/\n\s+\n/g, '\n') //empty lines
        + '</pre>'
        : null;
}

function getRowByUrl(url) {
    return getTableRow($("[id='" + url + "']"));
}

function getTableRow(element) {
    return $('#mytable').DataTable().row(element);
}

function removeRow(el) {
    var row = getTableRow($(el).parents('tr'));
    var url = row.data().url;

    $.post("/gridremove", url,
        function (data, status) {
            console.log(data);
            row.remove().draw(true); //remove out of callback
        });
}

function addRow(text) {
    text = text.trim().replace(/\/$/, '');
    var gridData = {url: text};

    var row = getRowByUrl(text);
    if (row.index() !== undefined) {
        alert("Url " + text + " already exists in row: " + (row.index() + 1));
        return false;
    } else {
        $('#mytable').DataTable().row.add(gridData).draw(false);
        $.post("/gridadd", text, data => getRowByUrl(text).data(JSON.parse(data)).draw(false));
        return true;
    }
}

function setTableRefreshRate() {
    $('#mytable').DataTable().ajax.reload();
    var refreshRate = millisTable[$('#rr-scroll').val()];
    console.log('refreshRate' + refreshRate)
    if (!$('#rr-panel').hasClass('disabled')) {
        window.setTimeout(setTableRefreshRate, refreshRate);
        REFRESH_ENABLED = true;
    }
}

function firstColumnData(row) {
    let link = row.url;
    let a = link.replace(":4444", ":8080");
    let text = link//.replace('http://', '').replace('https://', '');
    return "<a href='" + a + "'>" + text + "</a>";
}

function getTotalByColumn(columnNumber) {
    return $('#mytable').DataTable()
        .column(columnNumber)
        .data()
        .map(i => parseInt(i) || 0)
        .reduce((a, b) => a + b, 0);
}

function refreshUsedMetric() {
    updateIfChanged($("#current-used"), getTotalByColumn(2));
    updateIfChanged($("#total-used"), getTotalByColumn(1));
}

function updateIfChanged(el, val) {
    if (parseInt(el.text()) !== val) {
        el.animate({'opacity': 0}, 200, function () {
            $(this).text(val);
        }).animate({'opacity': 1}, 200);
    }
}

var rrr;
function openJson(row) {
    console.log(row);
    rrr = row;
    var row = getTableRow($(el).parents('tr'));
}

$(document).ready(function () {
    var table = $('#mytable').DataTable({
        autoWidth: true,
        ordering: false,
        searching: false,
        info: false,
        paging: false,
        rowId: 'url',
        ajax: {
            timeout: 10000,
            type: 'GET',
            url: '/grids',
            dataSrc: d => d.data.map(JSON.parse),
            liveAjax: true,
            interval: 1,
        },
        drawCallback: refreshUsedMetric,
        columns: [
            {
                "data": row => firstColumnData(row),
                "title": "url",
                "defaultContent": "",
                "width": "20%"
            },
            {
                "data": "total",
                "title": "total",
                "defaultContent": "",
                "width": "5%"
            },
            {
                "data": "used",
                "title": "used",
                "defaultContent": "",
                "width": "5%"
            },
            {
                "data": "queued",
                "title": "queued",
                "defaultContent": "",
                "width": "5%"
            },
            {
                "data": "pending",
                "title": "pending",
                "defaultContent": "",
                "width": "5%",
            },
            {
                data: row => {
                    if (row.browsers) {
                        let data = row.browsers.chrome['61.0'].zoomdata;
                        if (data) {
                            return prettyPrint(data);
                        } else {
                            return ""
                        }
                    }
                },
                "title": "Chrome",
                "defaultContent": "Not responding"
            },
            {
                "data": row => "<a class='button json' href='" + row.url + "/status" + "' target='_blank'>JSON</a><a class='button remove' onclick='removeRow(this)'>Remove</a>",
                "title": "",
                "width": "min"
            }
        ]
    });

    $("#urlinput").keyup(function (event) {
        if (event.keyCode === 13) {
            var url = $(this).val();
            if (url) {
                if (addRow(url)) $(this).val('');
            }
        }
    });

    $('#rr-val')
        .text(OFF);

    $('#rr-scroll')
        .attr('max', values.length - 1)
        .on('input', function () {
            var val = values[this.value];
            $('#rr-val').text(val);
            if (val === OFF) {
                $('#rr-scroll, #rr-panel').addClass('disabled');
                REFRESH_ENABLED = false;
            } else {
                $('#rr-scroll, #rr-panel').removeClass('disabled');
                if (!REFRESH_ENABLED) {
                    setTableRefreshRate()
                }
            }
        });

    $('#rr-scroll, #rr-panel').addClass('disabled');

});