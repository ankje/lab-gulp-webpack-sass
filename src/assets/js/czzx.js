var $=require('jquery');
var pageSwitch=require('ui/pageSwitch.js');
require('ui/jquery.nav.js');
//banner
$(function () {
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
        autoplay:false,
        interval:1000
    }),banner_navs=$('.banner .pages li');
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

    $('.banner .pages li').each(function(k,e){
        $(this).click(function(){
            banner.slide(k);
        });
    });
});

$(function () {
    //vnav
    $('.vnav .wrap ul').onePageNav();

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

    //手机展开导航
    $('.header').click(function(){
        if($('.header .nav').height()==0)
            $('.header .nav').animate({height:100});
        else
            $('.header .nav').stop().animate({height:0});
    });
});

//充值部分
$(function(){
    var czfs=$('.cz-wrap [name=czfs]').val();
    var changeCzfs=function(czfs){
        $('.cz-wrap [data-czfs-con]').each(function(k,e){
            if($(e).attr('data-czfs-con')==czfs){
                $(e).show();
            }else{
                $(e).hide();
            }
        })
    }

    changeCzfs(czfs);

    $('.cz-wrap [name=czfs]').change(function(){
        changeCzfs($(this).val());
    });

    $('.txt-zdmz').blur(function(){
        var sVal=$(this).val();
        if(sVal!='' && sVal!='自定义金额'){
            $('#zdmz').val(sVal)
        }
    })

    $('.cz-wrap .mz').click(function(){
        $('.cz-wrap .mz').each(function(i,e){
            $(e).removeClass('checked')
        });
        $(this).addClass('checked')
    });

    $('.cz-wrap .bank').click(function(){
        $('.cz-wrap .bank').each(function(i,e){
            $(e).removeClass('checked')
        });
        $(this).addClass('checked')
    });

    $('.btn-submit').click(function(){
        var mianzhi=$('input[name=czval]:checked').val();
        var bank=$('input[name=blank]:checked').val();
        alert('系统维护中...');
    })
});