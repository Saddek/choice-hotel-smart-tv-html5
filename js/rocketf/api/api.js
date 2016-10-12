'use strict';

var API_SUCCESS = 'success';
var API_ERROR = 'error';
var RocketFApi = {
    baseUrl : CONFIG.contentAPI.baseUrl,
    fakeBaseUrl: CONFIG.contentAPI.fakeBaseUrl,
    region: CONFIG.contentAPI.defaultRegion,
    endpoints: API_ENDPOINTS,
    mac: '',
    setRegion: function(region) {
        this.region = region;
    },
    setMacAddress: function(mac) {
        this.mac = mac;
    },
    talk: function(apiName, data, successHandler, errorHandler) {
        App.throbber(true);
        // check if use real or fake talk
        var endpointSetting = this.getSetting(apiName);
        var method = endpointSetting.method;
        if (!endpointSetting.available || CONFIG.developer.useFake) {
            return this.fakeTalk(endpointSetting.endpoint.fake, method, data, successHandler, errorHandler);
        }

        var endpoint = this.generateEndpoint(endpointSetting, data);

        // cause of unstable API, temporary overwrite method to POST
        // method = "POST";

        // endpoint begin with slash
        var requestUrl = this.baseUrl + this.region + "/" + this.cleanEndpoint(endpoint);
        data.mac = App.mac;
        $.ajax({
            url: requestUrl,
            type: method,
            data: data,
            crossDomain: true,
            dataType: 'JSON',
            // async: false,
            success: function(response) {
                if (response.status == API_SUCCESS && response.data.result) {
                    if (endpoint.indexOf('login') == -1) {
                        response.data = $.parseJSON(response.data.result);
                    }
                    successHandler(response);
                } else {
                    if (typeof(errorHandler) != und) {
                        errorHandler(response.message);
                    } else {
                        App.notification('System error', 'We have encountered an problem on our server, please try again later.', 'error');
                    }
                }
            }
        });

    },
    // API request for not exists API
    fakeTalk: function(endpoint, method, data, successHandler, errorHandler) {
        if (typeof(method) == und) {
            method = "GET";
        } else {
            method = method.toUpperCase();
        }
        // for simply we use no region here
        var requestUrl = this.fakeBaseUrl +  endpoint.replace('/', '');
        $.ajax({
            url: requestUrl,
            type: method,
            data: data,
            crossDomain: true,
            dataType: 'JSON',
            // async: false,
            success: function(response) {
                if (response.status == API_SUCCESS) {
                    successHandler(response);
                } else {
                    if (typeof(errorHandler) != und) {
                        errorHandler(response.message);
                    } else {
                        App.notification('System error', 'We have encountered an problem on our server, please try again later.', 'error');
                    }
                }
            }
        })
            .fail(function(jqXHR, textStatus, errorThrown ){
                if (typeof(errorHandler) != und) {
                    errorHandler(textStatus, errorThrown);
                } else {
                    App.notification('System error', 'We have encountered an problem on our server, please try again later.', 'error');
                }
            });
    },
    login: function(mac, password) {
        var requestUrl = CONFIG.loginAPI.loginUrl.replace(['{mac}', '{password}'], [mac, password]);
        $.ajax({
            url: requestUrl,
            type: 'POST',
            crossDomain: true,
            dataType: 'JSON',
            async: false,
            success: function(response) {
                if (response.name) {
                    successHandler(response);
                } else {
                    if (typeof(errorHandler) != und) {
                        errorHandler(response.message);
                    } else {
                        App.notification('System error', 'We have encountered an problem on our server, please try again later.', 'error');
                    }
                }
            }
        })
            .fail(function(jqXHR, textStatus, errorThrown ){
                if (typeof(errorHandler) != und) {
                    errorHandler(textStatus, errorThrown);
                } else {
                    App.notification('System error', 'We have encountered an problem on our server, please try again later.', 'error');
                }
            });
    },

    getSetting: function(apiName) {
        return typeof(this.endpoints[apiName]) != und ? this.endpoints[apiName] : null;
    },
    generateEndpoint: function(endpointSetting, params) {
        return typeof(endpointSetting.endpoint.make) != und ? endpointSetting.endpoint.make(endpointSetting.endpoint.real, params) : endpointSetting.endpoint.real;
    },
    cleanEndpoint: function(endpoint) {
        return endpoint[0] == '/' ? endpoint.substr(1) : endpoint;
    }
};