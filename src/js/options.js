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
        plot(parseData(dataObject));
    });
});

function parseData(dataObject){
    var datas = {};
    datas['labels'] = [];
    datas['seriesLabels'] = ['Playing time', 'Real time']
    datas['series'] = [[],[]];
    for (var key in dataObject)
        if (dataObject.hasOwnProperty(key)){
            datas['labels'].push(dateFromDay(key));
            datas['series'][0].push(YTTGetDurationAsMinutes(dataObject[key]['R']));
            datas['series'][1].push(YTTGetDurationAsMinutes(dataObject[key]['T']));
        }
    return datas;
}

function dateFromDay(str){
    var year = parseFloat(str.substring(str.length - 4));
    var day = parseFloat(str.substring(0, str.length - 4));
    var date = new Date(year, 0);
    date.setDate(day);
    return ("0" + date.getDate()).slice(-2) + "-" + ("0"+(date.getMonth()+1)).slice(-2) + "-" + date.getFullYear();
}

function plot(data){
    var chart = new Chartist.Line('#chartYTT', data, {
        height: 600,
        showArea: true,
        fullWidth: true,
        lineSmooth: Chartist.Interpolation.simple({
            divisor: 2
        }),
        chartPadding: {
            right: 100,
            top: 20,
            left: 10
        },
        plugins: [
            Chartist.plugins.ctAxisTitle({
                axisX:{
                    axisTitle: 'Date',
                    axisClass: 'ct-axis-title',
                    offset: {
                        x: 0,
                        y: 35
                    }
                },
                axisY: {
                    axisTitle: 'Time (minutes)',
                    axisClass: 'ct-axis-title',
                    offset: {
                        x: 0,
                        y: 0
                    },
                    flipTitle: false
                }
            })
        ]
    });
    var seq = 0;
    var delays = 80;
    var durations = 500;
    chart.on('created', function() {
        seq = 0;
    });
    chart.on('draw', function(dataEvent) {
        if(dataEvent.type === 'line' || dataEvent.type === 'area') {
            dataEvent.element.animate({
                opacity: {
                    begin: seq++ * 80,
                    dur: 500,
                    from: 0,
                    to: 1
                },
                x1: {
                    begin: seq++ * 80,
                    dur: 500,
                    from: dataEvent.x - 100,
                    to: dataEvent.x,
                    easing: Chartist.Svg.Easing.easeOutQuart
                },
                d: {
                    begin: 2000 * dataEvent.index,
                    dur: 2000,
                    from: dataEvent.path.clone().scale(1, 0).translate(0, dataEvent.chartRect.height()).stringify(),
                    to: dataEvent.path.clone().stringify(),
                    easing: Chartist.Svg.Easing.easeOutQuint
                }
            });
        }
        else if(dataEvent.type === 'point') {
            if(dataEvent.index + 1 == dataEvent.series.length)
            {
                dataEvent.group.elem('text', {
                    x: dataEvent.x + 10,
                    y: dataEvent.y + 3,
                    id: "YTTLabel" + dataEvent['seriesIndex']
                }, 'ct-label-end').text(data['seriesLabels'][dataEvent['seriesIndex']]);
            }
            var newX = -15;
            var newY = 0;
            if(dataEvent.index == 0)
                newX += 15;
            else if(dataEvent.index + 1 == dataEvent.series.length)
                newX -= 30;
            if(dataEvent['seriesIndex'] == 0)
                newY = 20;
            else
                newY = -9;
            dataEvent.group.elem('text', {
                x: dataEvent.x + newX,
                y: dataEvent.y + newY
            }, 'ct-label').text(YTTGetDurationString({minutes:dataEvent.value.y}));
            dataEvent.element.animate({
                opacity: {
                    begin: seq++ * 80,
                    dur: 500,
                    from: 0,
                    to: 1
                },
                x1: {
                    begin: seq++ * 80,
                    dur: 500,
                    from: dataEvent.x - 100,
                    to: dataEvent.x,
                    easing: Chartist.Svg.Easing.easeOutQuart
                }
            });
        }
        else if(dataEvent.type === 'label' && dataEvent.axis === 'x') {
            dataEvent.element.animate({
                y: {
                    begin: seq * delays,
                    dur: durations,
                    from: dataEvent.y + 100,
                    to: dataEvent.y,
                    easing: 'easeOutQuart'
                }
            });
        }
        else if(dataEvent.type === 'label' && dataEvent.axis === 'y') {
            dataEvent.element.animate({
                x: {
                    begin: seq * delays,
                    dur: durations,
                    from: dataEvent.x - 100,
                    to: dataEvent.x,
                    easing: 'easeOutQuart'
                }
            });
        }
        else if(dataEvent.type === 'grid') {
            var pos1Animation = {
                begin: seq * delays,
                dur: durations,
                from: dataEvent[dataEvent.axis.units.pos + '1'] - 30,
                to: dataEvent[dataEvent.axis.units.pos + '1'],
                easing: 'easeOutQuart'
            };
            var pos2Animation = {
                begin: seq * delays,
                dur: durations,
                from: dataEvent[dataEvent.axis.units.pos + '2'] - 100,
                to: dataEvent[dataEvent.axis.units.pos + '2'],
                easing: 'easeOutQuart'
            };
            var animations = {};
            animations[dataEvent.axis.units.pos + '1'] = pos1Animation;
            animations[dataEvent.axis.units.pos + '2'] = pos2Animation;
            animations['opacity'] = {
                begin: seq * delays,
                dur: durations,
                from: 0,
                to: 1,
                easing: 'easeOutQuart'
            };
            dataEvent.element.animate(animations);
        }
    });
}