/**
 Gulpfile for gulp-webpack-demo
 created by fwon
 */

var gulp = require('gulp'),
    gutil = require('gulp-util'),
    sass = require('gulp-sass'),
    uglify = require('gulp-uglify'),
    minifyCss = require("gulp-clean-css"),
    fileinclude = require('gulp-file-include'),
    clean = require('gulp-clean'),
    spriter = require('gulp-css-spriter'),
    base64 = require('gulp-css-base64'),
    webpack = require('webpack'),
    webpackConfig = require('./webpack.config.js'),
    connect = require('gulp-connect'),
    prefixer = require("gulp-autoprefixer"),
    runSequence = require('run-sequence'),
    rev = require('gulp-rev'),
    revCollector = require('gulp-rev-collector'),
    mergeStream = require('merge-stream'),
    Q = require('q'),
    wait = require('gulp-wait'),//高度异步、同步执行有用
    thunkify = require('thunkify'),//thunk函数的转换器
    co = require('co'),//Generator或Promise的自动执行器
    fs = require('fs'),
    replace = require('gulp-replace');

var host = {
    path: 'dist/',
    port: 8080,
    html: 'index.html'
};

//将图片拷贝到目标目录
gulp.task('copy:images',['clean:images'],function (done) {
    gulp.src(['src/assets/images/**/*'],{base:'src'})
        .pipe(gulp.dest('dist'))

        //签名映射
        .pipe(rev())
        .pipe(gulp.dest('dist')) //保存文件
        .pipe(rev.manifest())//- 生成一个rev-manifest.json
        .pipe(gulp.dest('dist/rev/img'))

        .on('end', done);
});

// 样式处理
gulp.task('scss', ['clean:css'], function (done) {
    var cssSrc = ['src/assets/css/**/*.scss', 'src/assets/css/**/*.css'],
        cssDst = 'dist';
    gulp.src(cssSrc,{base:'src'})
        .pipe(sass({style: 'expanded'}))
        //添加css前缀
        .pipe(prefixer({
            browsers: ['last 2 versions', 'Android >= 4.0'],
            cascade: true,
            remove: true
        }))
        .pipe(minifyCss({compatibility: 'ie8'})) //如果不写ie8，那么ie7的* hack会被去掉 //cssmin()也可以，但未试过
        .pipe(gulp.dest(cssDst))

        //签名映射
        .pipe(rev())
        .pipe(gulp.dest(cssDst)) //保存文件
        .pipe(rev.manifest())//- 生成一个rev-manifest.json
        .pipe(gulp.dest('dist/rev/css'))

        .on('end', done);
});

gulp.task('revUrl',function() {
    gulp.src(['dist/rev/{css,img,js}/*.json', 'dist/app/*.html'])		//- 读取 rev-manifest.json 文件以及需要进行css名替换的文件
        .pipe(revCollector())                               				//- 执行文件内css名的替换
        .pipe(gulp.dest('dist/app'));										//- 替换后的文件输出的目录

    //替换css中的图片地址
    var data = fs.readFileSync('dist/rev/img/rev-manifest.json');
    var oData=JSON.parse(data.toString());
    var oNData={}
    var oNDataLen=0;
    for(k in oData){
        oNData[k.replace(/^assets\//,'../')]=oData[k].replace(/^assets\//,'../');
        oNDataLen++;
    }
    if(oNDataLen!=0){//todo:代码有待改善
        fs.writeFile('dist/rev/img/rev-manifest2.json',JSON.stringify(oNData),function(err){
            if(!err){
                gulp.src(['dist/rev/img/*.json', 'dist/assets/css/*.css'])
                    .pipe(revCollector())
                    .pipe(gulp.dest('dist/assets/css'));
            }
        });
    }else{
        gulp.src(['dist/rev/img/*.json', 'dist/assets/css/*.css'])
            .pipe(revCollector())
            .pipe(gulp.dest('dist/assets/css'));
    }

    gulp.src(['dist/rev/{css,img,js}/*.json', 'dist/assets/js/*.js'])
        .pipe(revCollector())
        .pipe(gulp.dest('dist/assets/js'));

});

//用于在html文件中直接include文件
gulp.task('fileinclude', function (done) {
    gulp.src(['src/app/*.html'])
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest('dist/app'))
        .on('end', done);
    // .pipe(connect.reload())
});

//雪碧图操作，应该先拷贝图片并压缩合并css
gulp.task('sprite',function (done) {
    var timestamp = +new Date();
    gulp.src('dist/assets/css/*.css')
        //雪碧图暂时不可控，如果不是固定的背景如有类似hover、current、active控制时，它不会计算对应的imgageposition的值
        /*.pipe(spriter({
            spriteSheet: 'dist/images/spritesheet' + timestamp + '.png',
            pathToSpriteSheetFromCSS: '../images/spritesheet' + timestamp + '.png',
            spritesmithOptions: {
                padding: 10
            }
        }))*/
        .pipe(base64())
        .on('end', done);
});

gulp.task('watch', function (done) {
    gulp.watch(['src/**/*.css','src/**/*.scss',], ['scss'])
        .on('end', done);
    gulp.watch('src/**/*.js', ['build-js'])
        .on('end', done);
    gulp.watch('src/**/*.html', ['fileinclude'])
        .on('end', done);
});

gulp.task('connect', function () {
    console.log('connect------------');
    connect.server({
        root: host.path,
        port: host.port,
        livereload: true
    });
});

var myDevConfig = Object.create(webpackConfig);

var devCompiler = webpack(myDevConfig);

//引用webpack对js进行操作
gulp.task("build-js",['clean:js'],function () {
    console.log('js编译中....');
    devCompiler.run(function (err, stats) {
        if (err) throw new gutil.PluginError("webpack:build-js", err);
        gutil.log("[webpack:build-js]", stats.toString({
            colors: true
        }));

        //签名映射
        var outJs=[];
        for(k in stats.compilation.assets){
            if(!new RegExp('.*\.js\.map').test(k) && !new RegExp('.*\.chunk\.js').test(k)){
                outJs.push('dist/assets/js/'+k);
            }
        }

        gulp.src(outJs,{base:'dist'})
            .pipe(rev())
            .pipe(gulp.dest('dist')) //保存文件
            .pipe(rev.manifest())//- 生成一个rev-manifest.json
            .pipe(gulp.dest('dist/rev/js'));

        console.log('js编译完成....');
    });
});

gulp.task('clean', function (done) {
    return gulp.src(['dist'],{read: false})
        .pipe(clean())
        .on('end', function(){console.log('dist清除完成')});
});

gulp.task('clean:css', function (done) {
    return gulp.src(['dist/assets/css'],{read: false})
        .pipe(clean())
        .on('end', function(){console.log('css清除完成')});
});

gulp.task('clean:js', function (done) {
    return gulp.src(['dist/assets/js'],{read: false})
        .pipe(clean())
        .on('end', function(){console.log('js清除完成')});
});

gulp.task('clean:images', function (done) {
    return gulp.src(['dist/assets/images'],{read: false})
        .pipe(clean())
        .on('end', function(){console.log('images清除完成')});
});

gulp.task('clean:html', function (done) {
    return gulp.src(['dist/app'],{read: false})
        .pipe(clean())
        .on('end', function(){console.log('html清除完成')});
});

//开发
gulp.task('dev',['clean'],function(callback) {
    runSequence(['connect', 'copy:images', 'fileinclude', 'scss', 'build-js'],'watch',callback);
});

//发布
gulp.task('default',['clean'], function(callback) {
    runSequence(['connect', 'copy:images', 'fileinclude', 'scss', 'build-js'],'revUrl',callback);
});
































/***********************以下是更新模板的相关任务（具体操作要根据实际项目作相应的修改）******************************/
var webPath='动态网站项目文件夹绝对路径(结尾没有反斜杠)';
gulp.task('model:clean',function(){
    return gulp.src([webPath+'/assets/js',webPath+'/assets/css',webPath+'/assets/images'],{read: false})
        .pipe(clean({force: true}))
        .on('end', function(){console.log('清空模板资源')});
});
gulp.task('model:ud-assets',['model:clean'],function (done) {
    var js=gulp.src(['dist/assets/js/*.js'])
        .pipe(gulp.dest(webPath+'/assets/js'))
        .on('end', function(){console.log('复制模板资源：js')});
    var css=gulp.src(['dist/assets/css/*.css'])
        .pipe(gulp.dest(webPath+'/assets/css'))
        .on('end', function(){console.log('复制模板资源：css')});
    var img=gulp.src(['dist/assets/images/*'])
        .pipe(gulp.dest(webPath+'/assets/images'))
        .on('end', function(){console.log('复制模板资源：images')});

    return mergeStream(js,css,img);

});

//复制manifest
gulp.task('model:cp-manifest',function() {
    return gulp.src(['dist/rev/**/*', '!dist/rev/img/rev-manifest2.json'])
        .pipe(gulp.dest(webPath + '/rev'))
        .on('end',function(){
            console.log('复制最新的manifest');
        })
});
//还原资源地址到原始地址
gulp.task('model:rs-assets-url',['model:cp-manifest'],function() {
    var deferred = Q.defer();
    co(function* (){
        var dirs=['css','img','js'];
        for(var i=0;i<dirs.length;i++){
            if(!fs.existsSync(webPath+'/rev/'+dirs[i]+'/rev-manifest.json'))
                continue;
            var data = fs.readFileSync(webPath+'/rev/'+dirs[i]+'/rev-manifest.json');
            var oData=JSON.parse(data.toString());
            for(k in oData){
                var tmpArr=k.split('.');
                if(tmpArr.length==2){
                    tmpArr[0]=tmpArr[0].replace(/\-/g,'\\-').replace(/\./g,'\\.').replace(/\//g,'\\/');
                    var reg=new RegExp(tmpArr[0]+'\\-[a-zA-Z0-9]{10}\\.'+tmpArr[1],'g');
                }else if(tmpArr.length>2){
                    var tmpStr='';
                    for(var i=0;i<tmpArr.length-1;i++){
                        tmpStr+='.'+tmpArr[i];
                    }
                    tmpStr=tmpStr.substr(1).replace(/\-/g,'\\-').replace(/\./g,'\\.').replace(/\//g,'\\/');
                    var reg=new RegExp(tmpStr+'\\-[a-zA-Z0-9]+\\.'+tmpArr[tmpArr.length-1],'g');
                }
                yield new Promise(function(resolve,reject){
                    gulp.src(webPath + '/templets/theme1/*.htm')
                        .pipe(replace(reg,k))
                        .pipe(gulp.dest(webPath+'/templets/theme1'))
                        .on('end', function () {
                            resolve('还原资源地址到原始地址...');
                        });
                }).then(function(resolveData){
                    console.log(resolveData);
                });
            }
        }
    }).then(function(){
        console.log('已完成-->还原资源地址到原始地址');
        deferred.resolve();
    });
    return deferred.promise;
});

gulp.task('model:default', ['model:ud-assets','model:rs-assets-url'], function () {

    return gulp.src([webPath+'/rev/{css,img,js}/*.json',webPath+'/templets/theme1/*.htm'])
        .pipe(revCollector())
        .pipe(gulp.dest(webPath+'/templets/theme1'))
        .on('end', function () {
            console.log('已完成-->更新模板资源地址');
        });

    //var deferred = Q.defer();
    /*new Promise(function(resolve,reject){
        //还原
        gulp.src([webPath + '/rev/{css,img,js}/!*.json', webPath + '/templets/theme1/!*.htm'])
            .pipe(revCollector())
            .pipe(gulp.dest(webPath + '/templets/theme1'))
            .on('end', function () {
                resolve('还原模板资源地址');
            });
    }).then(function(resolveData){
        var deferred = Q.defer();
        //复制最新的rev
        gulp.src(['dist/rev/!**!/!*.json', '!dist/rev/img/rev-manifest2.json'])
            // .pipe(wait(5000))
            .pipe(gulp.dest(webPath + '/rev'))
            .on('end', function () {
                console.log(resolveData);
                deferred.resolve('复制manifest');
            });
        return deferred.promise;
    }).then(function(resolveData){
        var deferred = Q.defer();
        gulp.src([webPath+'/rev/{css,img,js}/!*.json',webPath+'/templets/theme1/!*.htm'])
            .pipe(revCollector())
            .pipe(gulp.dest(webPath+'/templets/theme1'))
            .on('end', function () {
                console.log(resolveData);
                deferred.resolve('更新模板资源地址');
            });
        return deferred.promise;
    }).then(function(resolveData){
        console.log(resolveData);
    });*/
    //return deferred.promise;
});