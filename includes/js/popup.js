$(function () {
	$('#openOptionsButton').on("click", function () {
		YTTOpenOptionsPage(null, function(){
			window.open(YTTGetRuntimeURL('options.html'));
		});
	});

	$('#openChartButton').on("click", function () {
		window.open(YTTGetRuntimeURL('chart.html'));
	});

	$('#openOnlineStatsButton').on("click", function () {
		window.open('https://yttracker.mrcraftcod.fr/');
	});

	const todayKey = YTTGetDayConfigKey();
	YTTGetConfig([YTT_CONFIG_TOTAL_STATS_KEY, YTT_CONFIG_START_TIME_KEY, todayKey], function (config) {
		const configDay = config[todayKey];
		if (configDay) {
			const todayDay = new YTTDay(configDay);

			$('#todayWatched').text(todayDay.getWatchedDuration().getAsString());
			$('#todayOpened').text(todayDay.getOpenedDuration().getAsString());
			$('#todayCount').text(todayDay.getCount());
		}

		const totals = new YTTDay(config[YTT_CONFIG_TOTAL_STATS_KEY]);
		$('#totalWatched').text(totals.getWatchedDuration().getAsString());
		$('#totalOpened').text(totals.getOpenedDuration().getAsString());
		$('#totalCount').text(totals.getCount());

		$('#totalStartDate').text(YTTGetDateString(config[YTT_CONFIG_START_TIME_KEY]));
	});

});

