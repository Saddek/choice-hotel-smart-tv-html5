/**
 * generate app URLs
 * @type {{listMovies: Url.listMovies, movieDetail: Url.movieDetail}}
 */
var Url = {
    apps: function() {
        return '/pageApps.php';
    },
	listLiveTV: function() {
        return '/pageLiveTV.php';
    },
    listMovies: function() {
        return '/pageMovie.php';
    },
    settings: function() {
        return '/pageSettings.php';
    },
    movieDetail : function(movieId) {
        return '/pagePlayback.php?type=movie&id=' + movieId;
    },
    liveTVDetail: function(channelId) {
        return '/pagePlayback.php?type=livetv&id=' + channelId;
    }
};