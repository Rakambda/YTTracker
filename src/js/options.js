var ratio = 1;

function getAverage(values) {
    var total = 0;
    for (var value in values)
        if(values.hasOwnProperty(value))
            total += values[value];
    return total / values.length;
}

function canvasToImage(backgroundColor)
{
    var canvas = document.getElementById("chartYTT");
    var context = canvas.getContext("2d");
    var w = canvas.width;
    var h = canvas.height;
    var data;
    if(backgroundColor)
    {
        data = context.getImageData(0, 0, w, h);
        var compositeOperation = context.globalCompositeOperation;
        context.globalCompositeOperation = "destination-over";
        context.fillStyle = backgroundColor;
        context.fillRect(0,0,w,h);
    }
    var imageData = canvas.toDataURL("image/png");
    if(backgroundColor)
    {
        context.clearRect (0,0,w,h);
        context.putImageData(data, 0,0);
        context.globalCompositeOperation = compositeOperation;
    }
    return imageData;
}

$(document).ready(function(){
    chrome.storage.sync.get(null, function(config) {
        var dataObject = {};
        for (var key in config) {
            if (config.hasOwnProperty(key) && key.substring(0, 3) == 'day') {
                if (!dataObject[key.substring(3, key.length - 1)])
                    dataObject[key.substring(3, key.length - 1)] = {};
                dataObject[key.substring(3, key.length - 1)][key.substring(key.length - 1)] = config[key];
            }
        }
        var datas = parseData(dataObject);
        var average = getAverage(datas['datasets'][0]['data']);
        datas['datasets'].push({
            borderColor: "rgba(255,255,0,0.5)",
            backgroundColor: "rgba(255,255,0,0.5)",
            pointBorderColor: "rgba(255,255,0,0.5)",
            pointBackgroundColor: "rgba(255,255,0,0.5)",
            pointBorderWidth: 0.1,
            pointHoverRadius: 1,
            tension: 0.4,
            fill:false,
            label:'Average played time',
            data:Array.apply(null, new Array(datas['datasets'][0]['data'].length)).map(function () { return average; })
        });
        plot(datas);

        $('#exportButton').click(function(){
            var setsData = {};
            setsData['ratio'] = ratio;
            for (var index in datas['datasets'])
            {
                if (datas['datasets'].hasOwnProperty(index))
                {
                    if(datas['datasets'][index]['label'][0] === 'A')
                    {
                        continue;
                    }
                    setsData[datas['datasets'][index]['label']] = datas['datasets'][index]['data'];
                }
            }
            var result = JSON.stringify({
                'labels': datas['labels'],
                'sets': setsData
            });
            console.log(result);
            chrome.downloads.download({
                url: 'data:application/json;base64,' + btoa(result),
                filename: 'YTTExport.json'
            });
        });

        $('#exportPNGButton').click(function(){
            chrome.downloads.download({
                url: canvasToImage(),
                filename: 'YTTExport.png'
            });
        });

        $('#exportPNGBACKButton').click(function(){
            chrome.downloads.download({
                url: canvasToImage("#FFFFFF"),
                filename: 'YTTExport.png'
            });
        });

        $('#importButton').change(function(event){
            var f = event.target.files[0];
            if(f)
            {
                var reader = new FileReader();
                reader.onload = function(e){importData(e.target.result);};
                reader.readAsText(f);
            }
        });

        $('#averageHolder').text(YTTGetDurationString({milliseconds:ratio*average}));
        var REAL_TODAY_KEY = YTTGetRealDayConfigKey();
        chrome.storage.sync.get([REAL_TODAY_KEY], function (result){
            $('#watchedHolder').text(YTTGetDurationString(result[REAL_TODAY_KEY]));
        });
    });
});

function importData(data) {
    var dataObject;
    try{
        dataObject = JSON.parse(data);
    }
    catch(err){
        alert("Corrupted file!");
        return;
    }
    if(!dataObject || !dataObject['labels'] || !dataObject['sets'])
    {
        alert("Corrupted file!");
        return;
    }
    if(!confirm("Be careful, if a day is already saved, it will be replaced by the one in the imported file!\nAre you sure to continue?"))
        return;
    var config = {};

    for (var key in dataObject['sets'])
        if (dataObject['sets'].hasOwnProperty(key))
        {
            if(key === 'ratio' || key[0] === 'A')
            {
                continue;
            }
            for(var dateIndex = 0; dateIndex < dataObject.labels.length; dateIndex++)
            {
                var dateElements = dataObject['labels'][dateIndex].split('-');
                var dateObj = new Date(dateElements[2], parseInt(dateElements[1]) - 1, dateElements[0]);
                config[key[0] == 'T' ? YTTGetTotalDayConfigKey(dateObj) : YTTGetRealDayConfigKey(dateObj)] = {milliseconds:(dataObject['ratio'] || 1)*dataObject['sets'][key][dateIndex]};
            }
        }

    chrome.storage.sync.set(config);
    location.reload();
}

function getNextConfigDate(date) {
    var year = parseFloat(date.substring(date.length - 4));
    var days = parseFloat(date.substring(0, date.length - 4));
    var dateObj = new Date(year, 0);
    dateObj.setDate(days + 1);
    return YTTGetDayConfigKey(dateObj).substr(3);
}

function parseData(dataObject){
    var objects = [];
    var datas = {};
    datas['labels'] = [];
    datas['seriesLabels'] = ['Playing time', 'Total time', 'Average played time'];
    datas['datasets'] = [
        {
            borderColor: "rgba(255,136,0,1)",
            backgroundColor: "rgba(255,0,0,0.2)",
            pointBorderColor: "rgba(255,0,0,1)",
            pointBackgroundColor: "#fff",
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            tension: 0.4,
            fill:true,
            label:'Playing time',
            data:[]
        },{
            borderColor: "rgba(50,255,0,1)",
            backgroundColor: "rgba(255,0,0,0.2)",
            pointBorderColor: "rgba(0,0,255,1)",
            pointBackgroundColor: "#fff",
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            tension: 0.4,
            fill:true,
            label: 'Total time',
            data:[]
        }
    ];

    var min = "19999";
    var max = "0";
    for (var key in dataObject)
        if (dataObject.hasOwnProperty(key))
        {
            if(YTTCompareConfigDate(min, key) < 0)
            {
                min = key;
            }
            if(YTTCompareConfigDate(max, key) > 0)
            {
                max = key;
            }
            objects.push({key:dateFromDay(key), real: YTTGetDurationAsMillisec(dataObject[key]['R']), total: YTTGetDurationAsMillisec(dataObject[key]['T'])});
        }

    var current = min;
    var i = 0;
    while(YTTCompareConfigDate(max, current) < 0 && i < 365 * 10)
    {
        i++;
        current = getNextConfigDate(current);
        if(!dataObject.hasOwnProperty(current))
        {
            objects.push({key:dateFromDay(current), real: 0, total: 0});
        }
    }

    objects.sort(function(a, b){
        return getDateFromTime(a['key']).getTime() - getDateFromTime(b['key']).getTime();
    });
    for(var object in objects)
        if(objects.hasOwnProperty(object))
        {
            datas['labels'].push(objects[object]['key']);
            datas['datasets'][0]['data'].push(objects[object]['real']/ratio);
            datas['datasets'][1]['data'].push(objects[object]['total']/ratio);
        }
    return datas;
}

function getDateFromTime(time){
    var parts = time.split('-');
    return new Date(parts[2], parts[1], parts[0]);
}

function dateFromDay(str){
    var year = parseFloat(str.substring(str.length - 4));
    var day = parseFloat(str.substring(0, str.length - 4));
    var date = new Date(year, 0);
    date.setDate(day);
    return ("0" + date.getDate()).slice(-2) + "-" + ("0"+(date.getMonth()+1)).slice(-2) + "-" + date.getFullYear();
}

function plot(data){
    var opt = {
        tooltips:{
            callbacks:{
                label:function(tooltipItem) {
                    return YTTGetDurationString({milliseconds:ratio*tooltipItem['yLabel']});
                }
            }
        },
        scales: {
            yAxes:[{
                type: "linear",
                ticks: {
                    autoSkip: false,
                    beginAtZero: true,
                    fixedStepSize: 3600 * 1000,
                    userCallback:function(data){return YTTGetDurationString({milliseconds:ratio*data});}
                }
            }]
        },
        pan: {
            enabled: true,
            mode: 'x'
        },
        zoom: {
            enabled: true,
            mode: 'x'
        }
    };
    var div = $('#chartYTT');
    var chart = new Chart(div, {
        type: 'line',
        data: data,
        options: opt
    });
}