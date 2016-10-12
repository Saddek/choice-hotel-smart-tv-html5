API_ENDPOINTS = {
    login: {
        available: true,
        method: 'POST',
        endpoint: {
            real: '/login',
            fake: '/login'
        }
    },
    moviesCategories: {
        available: !true,
        method: 'GET',
        endpoint: {
            real: '',
            fake: '/movies/categories'
        }
    },
    moviesByCategories: {
        available: true,
        method: 'GET',
        endpoint: {
            real: '/content/info',
            fake: '/moviesByCategories'
        }
    },
    purchasedMovies: {
        available: true,
        method: 'GET',
        endpoint: {
            real: '/content/info',
            fake: '/movies/purchased/valid'
        }
    },
    // page playback
    channelDetail: {
        available: true,
        method: 'GET',
        endpoint: {
            real: '/channels',
            fake: '/channels/detail'
        }
    },
    movieDetail: {
        available: true,
        method: 'GET',
        endpoint: {
            real: '/content/info/{contentInfoId}',
            make: function(endpoint, params) {
                c(params);
                return endpoint.replace('{contentInfoId}', params.contentInfoId);
            },
            fake: '/movieDetail'
        }
    },
    mediaInfo: {
        available: true,
        method: 'GET',
        endpoint: {
            real: '/content/media',
            fake: '/mediaInfo'
        }
    },
    programList: {
        available: true,
        method: 'GET',
        endpoint: {
            real: '/tvprogram',
            fake: '/tvprogram'
        }
    },
    //page livetv
    channelList: {
        available: true,
        method: 'GET',
        endpoint: {
            real: '/channels',
            fake: '/channels'
        }
    },
    channelCategories: {
        available: true,
        method: 'GET',
        endpoint: {
            real: '/channels/categories',
            fake: '/channel/categories'
        }
    },
    programDetail: {
        available: true,
        method: 'GET',
        endpoint: {
            real: '/tvprogram',
            fake: '/programDetail'
        }
    },
    // food and activities
    activityCategories: {
        available: !true,
        method: 'GET',
        endpoint: {
            real: '',
            fake: '/activityCategories'
        }
    },
    activitiesByCategories: {
        available: !true,
        method: 'GET',
        endpoint: {
            real: '',
            fake: '/activitiesByCategories'
        }
    }


};