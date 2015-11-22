var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var del = require('del');
var es = require('event-stream');
var bowerFiles = require('main-bower-files');
var print = require('gulp-print');
var connect = require('gulp-connect');
var Q = require('q');
var Proxy = require('gulp-connect-proxy');
var modRewrite = require('connect-modrewrite');
var angularProtractor = require('gulp-angular-protractor');
// == PATH STRINGS ========

var paths = {
    scripts: './app/**/*.js',
    styles: ['./app/**/*.css', './app/**/*.scss'],
    images: './images/**/*',
    index: './app/index.html',
    templates: ['app/**/*.html', '!app/index.html'],
    distDev: './public-devel',
    distProd: './public',
    i18n: './app/i18n/**/*.json',
    distScriptsProd: './public/js'

};

// == PIPE SEGMENTS ========

var pipes = {};

pipes.orderedVendorScripts = function() {
    return plugins.order(['jquery.js', 
        'angular.js',
        'angular-ui-router.js',
        'angular-translate.js',
        'angular-translate-loader-static-files.js']);
};
pipes.i18n = function() {
    return gulp.src(paths.i18n);           
};

pipes.orderedAppScripts = function() {
    return plugins.angularFilesort();
};

pipes.minifiedFileName = function() {
    return plugins.rename(function (path) {
        path.extname = '.min' + path.extname;
    });
};

pipes.validatedAppScripts = function() {
    return gulp.src(paths.scripts)
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));
};

pipes.builtAppScriptsDev = function() {
    return pipes.validatedAppScripts()
        .pipe(gulp.dest(paths.distDev));
};

pipes.builtAppScriptsProd = function() {
    var scriptedTemplates = pipes.scriptedTemplates();
    var validatedAppScripts = pipes.validatedAppScripts();

    return es.merge(scriptedTemplates, validatedAppScripts)
        .pipe(pipes.orderedAppScripts())
        .pipe(plugins.sourcemaps.init())
            .pipe(plugins.concat('app.min.js'))
            .pipe(plugins.uglify())
        .pipe(plugins.sourcemaps.write())
        .pipe(gulp.dest(paths.distScriptsProd));
};

pipes.builtVendorScriptsDev = function() {
    return gulp.src(bowerFiles())
        .pipe(gulp.dest(paths.distDev + '/bower_components'));
};

pipes.builtVendorScriptsProd = function() {
    return gulp.src(bowerFiles('**/*.js'))
        .pipe(pipes.orderedVendorScripts())
        .pipe(plugins.concat('vendor.min.js'))
        .pipe(plugins.uglify())
        .pipe(gulp.dest(paths.distScriptsProd));
};



pipes.validatedTemplates = function() {
    return gulp.src(paths.templates)
        .pipe(plugins.htmlhint({'doctype-first': false}))
        .pipe(plugins.htmlhint.reporter());
};

pipes.builtTemplatesDev = function() {
    return pipes.validatedTemplates()
        .pipe(gulp.dest(paths.distDev));
};

pipes.scriptedTemplates = function() {
    return pipes.validatedTemplates()
        .pipe(plugins.htmlhint.failReporter())
        .pipe(plugins.htmlmin({ collapseWhitespace: true,
                conservativeCollapse: true,
                minifyJS: true,
                minifyCSS: true,
                useShortDoctype: false,
                removeEmptyAttributes: true,
                removeComments: true
        }))
        .pipe(plugins.angularTemplatecache({
                module: 'tbnotes.templates'
        }));
};

pipes.scriptedTemplatesSavedDev = function() {
    return pipes.scriptedTemplates()
        .pipe(gulp.dest(paths.distDev));
};

pipes.builtStylesDev = function() {
    return gulp.src(paths.styles)
        .pipe(plugins.sass({
            loadPath: [
             './bower_components/bootstrap-sass/assets/stylesheets',
             './bower_components/fontawesome/scss',
            ]
           }
        ))
        .pipe(gulp.dest(paths.distDev));
};

pipes.builtStylesProd = function() {
    return gulp.src(paths.styles)
        .pipe(plugins.sourcemaps.init())
            .pipe(plugins.sass({
            loadPath: [
             './bower_components/bootstrap-sass/assets/stylesheets',
             './bower_components/fontawesome/scss',
            ]
           }
        ))
        .pipe(plugins.minifyCss())
        .pipe(plugins.sourcemaps.write())
        .pipe(pipes.minifiedFileName())
        .pipe(gulp.dest(paths.distProd));
};

pipes.processedImagesDev = function() {
    return gulp.src(paths.images)
        .pipe(gulp.dest(paths.distDev + '/images/'));
};

pipes.processedImagesProd = function() {
    return gulp.src(paths.images)
        .pipe(gulp.dest(paths.distProd + '/images/'));
};

pipes.validatedIndex = function() {
    return gulp.src(paths.index)
        .pipe(plugins.htmlhint())
        .pipe(plugins.htmlhint.reporter());
};

pipes.getFonts = function() {
    return gulp.src(['./bower_components/components-font-awesome/fonts/**.*' ,
                    './bower_components/bootstrap-sass/assets/fonts/**/**.*']
        );        
};

pipes.builtIndexDev = function() {

    var orderedVendorScripts = pipes.builtVendorScriptsDev()
        .pipe(pipes.orderedVendorScripts());

    var orderedAppScripts = pipes.builtAppScriptsDev()
        .pipe(pipes.orderedAppScripts());

    var appStyles = pipes.builtStylesDev();

    var appTemplates =  pipes.scriptedTemplatesSavedDev();

    return pipes.validatedIndex()
        .pipe(gulp.dest(paths.distDev)) // write first to get relative path for inject
        .pipe(plugins.inject(orderedVendorScripts, {relative: true, name: 'bower'}))
        .pipe(plugins.inject(appTemplates, {relative: true, name: 'tpls'}))
        .pipe(plugins.inject(orderedAppScripts, {relative: true}))
        .pipe(plugins.inject(appStyles, {relative: true}))
        .pipe(gulp.dest(paths.distDev))
        .pipe(connect.reload());
};

pipes.builtIndexProd = function() {

    var vendorScripts = pipes.builtVendorScriptsProd();
    var appScripts = pipes.builtAppScriptsProd();
    var appStyles = pipes.builtStylesProd();

    return pipes.validatedIndex()
        .pipe(gulp.dest(paths.distProd)) // write first to get relative path for inject
        .pipe(plugins.inject(vendorScripts, {relative: true, name: 'bower'}))
        .pipe(plugins.inject(appScripts, {relative: true}))
        .pipe(plugins.inject(appStyles, {relative: true}))
        .pipe(plugins.htmlmin({collapseWhitespace: true, removeComments: true}))
        .pipe(gulp.dest(paths.distProd));
};

pipes.builtAppDev = function() {
    return es.merge(pipes.builtIndexDev(), pipes.builtTemplatesDev(), pipes.processedImagesDev(),
        pipes.i18n().pipe(gulp.dest(paths.distDev + '/i18n')),
        pipes.getFonts().pipe(gulp.dest(paths.distDev + '/fonts'))
        );
};

pipes.builtAppProd = function() {
    return es.merge(pipes.builtIndexProd(), pipes.processedImagesProd(),
        pipes.i18n().pipe(gulp.dest(paths.distProd + '/i18n')),
        pipes.getFonts().pipe(gulp.dest(paths.distProd + '/fonts'))
        );
};

// == TASKS ========

// removes all compiled dev files
gulp.task('clean-dev', function() {
    var deferred = Q.defer();
    del(paths.distDev, function() {
        deferred.resolve();
    });
    return deferred.promise;
});

// removes all compiled production files
gulp.task('clean-prod', function() {
    var deferred = Q.defer();
    del(paths.distProd, function() {
        deferred.resolve();
    });
    return deferred.promise;
});

// checks html source files for syntax errors
gulp.task('validate-templates', pipes.validatedTemplates);

// checks index.html for syntax errors
gulp.task('validate-index', pipes.validatedIndex);

// moves html source files into the dev environment
gulp.task('build-templates-dev', pipes.builtTemplatesDev);

// converts templates to javascript using html2js
gulp.task('convert-templates-to-js', pipes.scriptedTemplates);

// runs jshint on the app scripts
gulp.task('validate-app-scripts', pipes.validatedAppScripts);

// moves app scripts into the dev environment
gulp.task('build-app-scripts-dev', pipes.builtAppScriptsDev);

// concatenates, uglifies, and moves app scripts and templates into the prod environment
gulp.task('build-app-scripts-prod', pipes.builtAppScriptsProd);

// compiles app sass and moves to the dev environment
gulp.task('build-styles-dev', pipes.builtStylesDev);

// compiles and minifies app sass to css and moves to the prod environment
gulp.task('build-styles-prod', pipes.builtStylesProd);

// moves vendor scripts into the dev environment
gulp.task('build-vendor-scripts-dev', pipes.builtVendorScriptsDev);

// concatenates, uglifies, and moves vendor scripts into the prod environment
gulp.task('build-vendor-scripts-prod', pipes.builtVendorScriptsProd);

// validates and injects sources into index.html and moves it to the dev environment
gulp.task('build-index-dev', pipes.builtIndexDev);

// validates and injects sources into index.html, minifies and moves it to the dev environment
gulp.task('build-index-prod', pipes.builtIndexProd);

// builds a complete dev environment
gulp.task('build-app-dev', pipes.builtAppDev);

// builds a complete prod environment
gulp.task('build-app-prod', pipes.builtAppProd);

// cleans and builds a complete dev environment
gulp.task('clean-build-app-dev', ['clean-dev'], pipes.builtAppDev);

// cleans and builds a complete prod environment
gulp.task('clean-build-app-prod', ['clean-prod'], pipes.builtAppProd);

gulp.task('start-dev', ['clean-build-app-dev'], function() {
  gulp.watch([paths.templates, paths.scripts], ['build-index-dev']);
  connect.server({
    root: paths.distDev,
    livereload: true,
    port: 9000,
    middleware: function (connect, opt) {
        opt.route = '/proxy';
        var proxy = new Proxy(opt);
        return [proxy];
    }
  });
});

gulp.task('start-prod', ['clean-build-app-prod'], function() {
  connect.server({
    root: paths.distProd,
    port: 9000,
    middleware: function (connect, opt) {
        opt.route = '/proxy';
        var proxy = new Proxy(opt);
        return [proxy];
    }
  });
});

gulp.task('start-e2e-tests', ['start-prod'], function() {
gulp.src(['./test/e2e/specs/*.js'])
    .pipe(angularProtractor({
        'configFile': 'test/e2e/config.js',
        'args': ['--baseUrl', 'http://localhost:9000'],
        'autoStartStopServer': true,
        'debug': true
    }))
    .on('error', function(e) {connect.serverClose(); throw e })
    .on('end', function() {connect.serverClose();});
});


// default task builds for prod
gulp.task('default', ['start-prod']);
