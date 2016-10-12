// global variables
window.und = 'undefined';
window.activeClass = 'active';
window.isLoggedIn = false;

MEDIA_TYPE = {
    MOVIE: 'movie',
    LIVETV: 'livetv'
};
CONFIG = {
    locale: 'EN',
    versionSDK: '2.0.220 [02.12.2015]',  // SDK version  (format: X.Y.SDK_SVN_Revision_number)
    version: '1.0.0 [18.10.2013]', // application version - put your own
    developer: {
        debug: true,
        active: false,
        console: null,
        useFake: false
    },
    template: 'handlebars',
    player: {
        licenseKey: 'hLJkJAX0eBEjTtxigYx2ePovQ0CbMvsN1m/gZfqO21K1UuypoPHdRek90oc=',
        muted: true
    },
    ajax: {
        timeout: 60000
    },
    keyboard: {
        oneLayout: true
    },
    GA: {
        account: '', // account number for Google Analytics
        ssl: true
    },
    contentAPI: {
        baseUrl: 'http://apirf.trungtran.space/', //end with slash
        fakeBaseUrl: 'http://fakeapirf.trungtran.space/', //end with slash
        defaultRegion: 1,
        pageSize: 50
    },
    loginAPI: {
        loginUrl: 'http://lv-api.acuteksolutions.com/cxf/ws/messagebus/rest/authorize/Beesmart/AuthorizeService/{mac}/{password}?region=default&operator=default'
    }
};