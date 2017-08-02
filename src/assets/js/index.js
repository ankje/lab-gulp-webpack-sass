var $=require('jquery');
require(['ui/pageSwitch.js'],function(pageSwitch){
    var banner=new pageSwitch($('.banner .sections')[0],{
        duration:1000,
        start:0,
        direction:0,
        loop:true,
        ease:'ease',
        transition:'scrollCover',
        mouse:false,
        mousewheel:false,
        arrowkey:false,
        autoplay:true,
        interval:3000
    }),banner_navs=$('.banner .pages:eq(0) li');
    banner.on('before',function(m,n){
        banner_navs[m].className='';
        banner_navs[n].className='active';
    });
    $('.banner .btn-l').click(function(){
        banner.prev();
    });
    $('.banner .btn-r').click(function(){
        banner.next();
    });

    $('.banner .pages:eq(0) li').each(function(k,e){
        $(this).click(function(){
            banner.slide(k);
        });
    });

    var isIE= /msie/.test(navigator.userAgent.toLowerCase());
    $('.banner').hover(function(){
        banner.pause();
        if(isIE)
            $('.banner .btn').show();
        else
            $('.banner .btn').fadeIn();
    },function(){
        banner.play();
        if(isIE)
            $('.banner .btn').hide();
        else
            $('.banner .btn').fadeOut();
    });
    if(isIE)
        $('.banner .btn').hide();
    else
        $('.banner .btn').fadeOut();


    //视频部分
    var videoBanner=new pageSwitch($('.video-info-box .videos .sections')[0],{
        duration:1000,
        start:0,
        direction:0,
        loop:true,
        ease:'ease',
        transition:'fade',
        mouse:false,
        mousewheel:false,
        arrowkey:false,
        autoplay:true,
        interval:3500
    }),videoBanner_navs=$('.video-info-box .videos .pages li');
    videoBanner.on('before',function(m,n){
        videoBanner_navs[m].className='';
        videoBanner_navs[n].className='active';
    });
    $('.video-info-box .videos .pages li').each(function(k,e){
        $(this).click(function(){
            videoBanner.slide(k);
        });
    });
});
require(['ui/jquery.nav.js'],function(){
    //vnav
    $('.vnav .wrap ul').onePageNav();
});
require(['ui/marquee'],function(){
    //公告部分
    $(".video-info-box .gonggao .marquee-wrap").kxbdMarquee({direction:"up",isEqual:false,scrollAmount:1,scrollDelay:80});
});

$(function () {
    //导航动画
    $('.header .nav ul li').not('.on').each(function(k,e){
        var width=$(this).width();
        $(this).children('span').css({

        });
        $(this).children('a:first').hover(function(){
            $(this).siblings('span:first').animate({width:width},1000);
        },function(){
            $(this).siblings('span:first').stop().width(0);
        });
    });
    $('.header .nav ul li:first').addClass('on');

    //手机展开导航
    $('.header').click(function(){
        if($('.header .nav').height()==0)
            $('.header .nav').animate({height:100});
        else
            $('.header .nav').stop().animate({height:0});
    });
});