let YTTPlayer;

/**
 * Update the player state in the DOM.
 * @param {number} playerState The event of the player (player status).
 */
function changeDOMTime(playerState) {
    console.log("ps", playerState);
    if (playerState === 1) {
        document.getElementById(YTT_DOM_PLAYER_STATE).innerHTML = YTT_STATE_EVENT_STATE_KEY_PLAYING + YTT_DOM_SPLITTER + YTTGetPlayer().getCurrentTime();
    } else if (playerState === 2 || playerState === 0 || playerState === -5 || playerState === 3) {
        document.getElementById(YTT_DOM_PLAYER_STATE).innerHTML = YTT_STATE_EVENT_STATE_KEY_WATCHED + YTT_DOM_SPLITTER + document.getElementById(YTT_DOM_PLAYER_TIME_2).innerHTML;
    } else {
        document.getElementById(YTT_DOM_PLAYER_STATE).innerHTML = 'unknown(' + playerState + ')' + YTT_DOM_SPLITTER + document.getElementById(YTT_DOM_PLAYER_TIME_2).innerHTML;
    }
}

/**
 * Update the video infos in the DOM.
 */
function changeDOMInfos() {
    document.getElementById(YTT_DOM_PLAYER_INFOS).innerHTML = YTTPlayer.getVideoData()['video_id'] + YTT_DOM_SPLITTER + YTTPlayer.getDuration();
}

/**
 * Called when the video changes.
 */
function changeVideo() {
    console.log("v");
    if (YTTGetPlayer().getVideoData && YTTGetPlayer().getVideoData()['video_id'] !== (document.getElementById(YTT_DOM_PLAYER_INFOS).innerHTML.split(YTT_DOM_SPLITTER)[0] || '') && YTTGetPlayer().getCurrentTime && YTTGetPlayer().getDuration) {
        changeDOMTime(-5);
        changeDOMInfos();
    }
}

/**
 * Get the current hooked player.
 * @returns {Player}
 */
function YTTGetPlayer() {
    return YTTPlayer;
}

/**
 * Try to hook a YouTube player.
 * @param {Player} player The player to hook.
 * @returns {boolean} True if successfull, false otherwise.
 */
function hookYTTPlayer(player) {
    if (typeof player !== 'object' || !(player.getCurrentTime || player.getVideoData || player.getDuration || player.getPlayerState)) {
        return false;
    }
    console.log('Player hooked');
    YTTPlayer = player;
    document.getElementById(YTT_DOM_PLAYER_TIME_1).innerHTML = YTTPlayer.getCurrentTime();
    document.getElementById(YTT_DOM_PLAYER_TIME_2).innerHTML = YTTPlayer.getCurrentTime();
    changeDOMInfos();
    changeDOMTime(YTTPlayer.getPlayerState());
    YTTPlayer.addEventListener('onStateChange', changeDOMTime);
    YTTPlayer.addEventListener('onApiChange', changeVideo);
    return true;
}
