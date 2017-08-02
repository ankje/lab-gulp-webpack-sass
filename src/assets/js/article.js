var $=require('jquery');
var isImgLoad=require('core/imgloaded');

$(function () {
    $('.arcticle img').each(function(k,e){
        var wW=$(window).width();
        isImgLoad($(e),function(ee){
            if(ee.width()>=wW){
                ee.css({
                    width:'100%',
                    height:'auto'
                });
            }
        })
    });
});