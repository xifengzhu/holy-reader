var gulp = require('gulp');
var del = require('del');
var path = require('path');
var autoprefixer = require('gulp-autoprefixer');
var htmlmin = require('gulp-htmlmin');
var sass = require('gulp-sass');
var jsonminify = require('gulp-jsonminify2');
var gutil = require('gulp-util');
var combiner = require('stream-combiner2');;
var babel = require('gulp-babel');
var uglify = require('gulp-uglify');
var rename = require("gulp-rename")
var minifycss = require('gulp-minify-css');
var runSequence = require('run-sequence');
var jsonlint = require("gulp-jsonlint");
var fs = require('fs');
var argv = require('yargs').argv;
var watch = require('gulp-watch');

var colors = gutil.colors;
var handleError = function(err) {
  console.log('\n')
  gutil.log(colors.red('Error!'))
  gutil.log('fileName: ' + colors.red(err.fileName))
  gutil.log('lineNumber: ' + colors.red(err.lineNumber))
  gutil.log('message: ' + err.message)
  gutil.log('plugin: ' + colors.yellow(err.plugin))


  /* http://stackoverflow.com/questions/23971388/prevent-errors-from-breaking-crashing-gulp-watch
     https://github.com/gulpjs/gulp/issues/259

     错误处理回调函数，报错的时候不会停止`gulp watch`
  */

  this.emit('end')
};

gulp.task('clean', () => {
  return del(['./dist/**'])
})

gulp.task('generate', () => {
  fs.mkdir(`src/pages/${argv.page}`);
  fs.writeFileSync(`src/pages/${argv.page}/${argv.page}.js`, "");
  fs.writeFileSync(`src/pages/${argv.page}/${argv.page}.json`, "");
  fs.writeFileSync(`src/pages/${argv.page}/${argv.page}.wxml`, "");
  fs.writeFileSync(`src/pages/${argv.page}/${argv.page}.scss`, "");
});

gulp.task('watch', () => {
  watch('./src/**/**/*.json', () => { runSequence('json')});
  watch('./src/images/**', () => { runSequence('images')});
  watch('./src/**/**/*.wxml', () => { runSequence('templates')});
  watch('./src/**/**/*.wxss', () => { runSequence('wxss')});
  watch('./src/**/**/*.scss', () => { runSequence('wxss')});
  watch('./src/**/**/*.js', () => { runSequence('scripts')});
  watch('./src/*.*').pipe(gulp.dest('./dist'));
});

gulp.task('jsonLint', () => {
  var combined = combiner.obj([
    gulp.src(['./src/**/**/*.json']),
    jsonlint(),
    jsonlint.reporter(),
    jsonlint.failAfterError()
  ]);

  combined.on('error', handleError);
});

gulp.task('json', ['jsonLint'], () => {
  return gulp.src('./src/**/**/*.json')
    .pipe(gulp.dest('./dist'))
})

// gulp.task('jsonPro', ['jsonLint'], () => {
//   return gulp.src('./src/**/**/*.json')
//     .pipe(jsonminify())
//     .pipe(gulp.dest('./dist'))
// })

gulp.task('images', () => {
  return gulp.src('./src/images/**')
    .pipe(gulp.dest('./dist/images'))
})

gulp.task('templates', () => {
  return gulp.src('./src/**/**/*.wxml')
    .pipe(gulp.dest('./dist'))
})

// gulp.task('templatesPro', () => {
//   return gulp.src('./src/**/**/*.wxml')
//     .pipe(htmlmin({
//       collapseWhitespace: true,
//       removeComments: true,
//       keepClosingSlash: true
//     }))
//     .pipe(gulp.dest('./dist'))
// });

gulp.task('wxss', () => {
  var combined = combiner.obj([
    gulp.src(['./src/**/**/*.{wxss,scss}', '!./src/styles/**']),
    sass().on('error', sass.logError),
    autoprefixer([
      'iOS >= 8',
      'Android >= 4.1'
    ]),
    rename((path) => {
      console.log(path)
      path.extname = '.wxss'
    }),
    gulp.dest('./dist')
  ]);

  combined.on('error', handleError);
});

// gulp.task('wxssPro', () => {
//   var combined = combiner.obj([
//     gulp.src(['./src/**/**/*.{wxss,scss}', '!./src/styles/**']),
//     sass().on('error', sass.logError),
//     autoprefixer([
//       'iOS >= 8',
//       'Android >= 4.1'
//     ]),
//     minifycss(),
//     rename((path) => path.extname = '.wxss'),
//     gulp.dest('./dist')
//   ]);

//   combined.on('error', handleError);
// });

gulp.task('scripts', () => {
  return gulp.src('./src/**/**/*.js')
    .pipe(babel({
      presets: ['es2015']
    }).on('error', handleError))
    .pipe(gulp.dest('./dist'))
})
// gulp.task('scriptsPro', () => {
//   return gulp.src('./src/**/**/*.js')
//     .pipe(babel({
//       presets: ['es2015']
//     }))
//     .pipe(uglify({
//       compress: true,
//     }))
//     .pipe(gulp.dest('./dist'))
// })

gulp.task('dev', ['clean'], () => {
  runSequence('json',
    'images',
    'templates',
    'wxss',
    'scripts',
    'watch');
});

// gulp.task('build', [
//   'jsonPro',
//   'images',
//   'templatesPro',
//   'wxssPro',
//   'scriptsPro'
// ]);

// gulp.task('pro', ['clean'], () => {
//   runSequence('build');
// })
