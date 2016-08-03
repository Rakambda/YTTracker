$(document).ready(function () {
    var themeDOM;

    chrome.storage.sync.get([YTT_CONFIG_THEME, YTT_CONFIG_HANDDRAWN], function (config) {
        function setTheme(theme) {
            if (themeDOM) {
                themeDOM.remove();
            }
            themeDOM = $('<link rel="stylesheet" href="css/themes/' + theme + '.css">');
            themeDOM.appendTo('head');
        }

        function setSelectedTheme(theme) {
            $('#darkTheme').prop('selected', false);
            $('#lightTheme').prop('selected', false);
            $('#' + theme).prop('selected', true);
        }

        function setSelectedHandDrawn(state) {
            $('#handDrawnFalse').prop('selected', false);
            $('#handDrawnTrue').prop('selected', false);
            $('#handDrawn' + state.charAt(0).toUpperCase() + state.slice(1)).prop('selected', true);
        }

        switch (config[YTT_CONFIG_THEME]) {
            case 'light':
                setTheme('light');
                setSelectedTheme('lightTheme');
                break;
            case 'dark':
            default:
                setTheme('dark');
                setSelectedTheme('darkTheme');
        }

        switch (config[YTT_CONFIG_HANDDRAWN]) {
            case 'true':
                setSelectedHandDrawn('true');
                break;
            case 'false':
            default:
                setSelectedHandDrawn('false');
        }

        $('#themeSelect').change(function () {
            var theme = $('#themeSelect').find(":selected").val();
            setTheme(theme);
            var newConfig = {};
            newConfig[YTT_CONFIG_THEME] = theme;
            chrome.storage.sync.set(newConfig);
        });

        $('#handDrawnSelect').change(function () {
            var state = $('#handDrawnSelect').find(":selected").val();
            var newConfig = {};
            newConfig[YTT_CONFIG_HANDDRAWN] = state;
            chrome.storage.sync.set(newConfig);
        });
    });
});