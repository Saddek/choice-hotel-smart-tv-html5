"use strict";

var Channels = {
    getChannels : function() {
        var endpoint = '/channels';
        RocketFApi.talk(endpoint, 'get', {}, function(data){
            c(data);
        })
    }
};

var popupContent = $('#popup').html();
swal({   
	text: popupContent,   
	html: true 
});