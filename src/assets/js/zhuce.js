var $=require('jquery');
var pageSwitch=require('ui/pageSwitch.js');
require('ui/jquery.nav.js');
require('ui/jquery.validate.min.js');
var Base64=require('core/base64.js');
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

//注册
$(function(){

    $("#zhuceForm").validate({
        //设置校验触发的时机,默认全是true。不要尝试去设置它为true，可能会有js错误。
        //onsubmit:false,
        //onfocusout:true,
        //onkeyup:false,
        //onclick:false,

        //验证通过后执行的动作
        //success:function(label){
            //label.text("ok!").addClass("success");
        //},
        submitHandler:function(form){
            var oAgree=$('input[name=agree]');
            if(!oAgree.attr('checked')){
                alert('请同意使用协议!');
                return false;
            }

            var username=$('#r_uname').val();
            var password=Base64.encode($('#r_upwd').val());
            var rpassword=Base64.encode($('#r_upwd2').val());
            var realname=$('#r_name').val();
            var id_card=$('#r_icard').val();

            $.post('http://192.168.0.155:85/uhtml/reg.php',{
                username:username,
                password:password,
                rpassword:rpassword,
                realname:realname,
                idCard:id_card
            },function(result){
                console.log(result);
            },'json');

            return false;
            //form.submit();
        },
        //手动设置错误信息的显示方式
        errorPlacement: function(error, element) {
            element.parent().next().html('');
            error.appendTo(element.parent().next());
            //    if ( element.is(":radio") )
            //        error.appendTo( element.siblings("span") );
            //    else if ( element.is(":checkbox") ){
            //        error.appendTo ( element.siblings("span") );
            //    }
            //        else
            //        error.appendTo( element.parent() );
        }
        ,
        rules:{
            uname:{
                required: true,
                rangelength: [ 5, 12 ]
            },
            upwd: {
                required: true,
                minlength: 6
            },
            rpwd: {
                required: true,
                minlength: 6,
                equalTo: "input[name=upwd]"
            },
            rname:{
                required: true,
                rangelength: [ 2, 6 ]
            },
            icard:{
                required: true,
                rangelength: [ 15, 18 ]
            },
            //agree: "required"
        },
        //校验提示信息
        messages: {
            uname: {
                required: "请输入用户名",
                rangelength: "用户名长度必须为{0}到{1}个字符或汉字"
            },
            upwd: {
                required: "请输入密码",
                minlength: "密码的最小长度是{0}个字符"
            },
            rpwd: {
                required: "请输入确认密码",
                minlength: "确认密码的最小长度是{0}个字符",
                equalTo: "确认密码与密码不相等"
            },
            rname: {
                required: "请输入真实姓名",
                rangelength: "真实姓名长度必须为{0}到{1}个字符或汉字"
            },
            //agree: "您没有同意使用协议",
            icard: {
                required: "请输入身份证号",
                rangelength: "身份证号长度必须为{0}到{1}个字符或汉字"
            }
        }
    });

    var chkAgree=function(){
        var oAgree=$('input[name=agree]');
        var isAgree=oAgree.attr('checked');
        if(isAgree)
            $('.lg-slides').addClass('on');
        else
            $('.lg-slides').removeClass('on');
    }
    chkAgree();

    //chkAgree();

    $('#lg-slides1').click(function(){
        var oAgree=$('input[name=agree]');
        var isAgree=oAgree.attr('checked');
        if(isAgree)
            oAgree.attr('checked',false);
        else
            oAgree.attr('checked',true);
        chkAgree();
    });
});