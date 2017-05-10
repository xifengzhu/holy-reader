const gulp = require('gulp');
const del = require('del');
const path = require('path');
const autoprefixer = require('gulp-autoprefixer');
const htmlmin = require('gulp-htmlmin');
const sass = require('gulp-sass');
const jsonminify = require('gulp-jsonminify2');
const gutil = require('gulp-util');
const combiner = require('stream-combiner2');;
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const rename = require("gulp-rename")
const minifycss = require('gulp-minify-css');
const runSequence = require('run-sequence');
const jsonlint = require("gulp-jsonlint");
const fs = require('fs');
const argv = require('yargs').argv;
const watch = require('gulp-watch');
const eslint = require('gulp-eslint');

const colors = gutil.colors;
const handleError = function(err) {
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
  fs.writeFileSync(`src/pages/${argv.page}/${argv.page}.js`, "Page({})");
  fs.writeFileSync(`src/pages/${argv.page}/${argv.page}.json`, "{}");
  fs.writeFileSync(`src/pages/${argv.page}/${argv.page}.wxml`, "");
  fs.writeFileSync(`src/pages/${argv.page}/${argv.page}.scss`, "");
});

gulp.task('watch', () => {
  watch('./src/**/**/*.json', () => { runSequence('json')});
  watch('./src/images/**', () => { runSequence('images')});
  watch('./src/**/**/*.wxml', () => { runSequence('templates')});
  watch('./src/**/**/*.wxss', () => { runSequence('wxss')});
  watch('./src/**/**/*.scss', () => { runSequence('wxss')});
  watch('./src/**/**/*.js', () => { runSequence(['lint', 'scripts']) });
  watch('./src/*.*').pipe(gulp.dest('./dist'));
});

gulp.task('jsonLint', () => {
  const combined = combiner.obj([
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

gulp.task('images', () => {
  return gulp.src('./src/images/**')
    .pipe(gulp.dest('./dist/images'))
})

gulp.task('templates', () => {
  return gulp.src('./src/**/**/*.wxml')
    .pipe(gulp.dest('./dist'))
})

gulp.task('wxss', () => {
  const combined = combiner.obj([
    gulp.src(['./src/**/**/*.{wxss,scss}', '!./src/styles/**']),
    sass().on('error', sass.logError),
    autoprefixer([
      'iOS >= 8',
      'Android >= 4.1'
    ]),
    rename((path) => {
      path.extname = '.wxss'
    }),
    gulp.dest('./dist')
  ]);

  combined.on('error', handleError);
});


gulp.task('scripts', () => {
  return gulp.src('./src/**/**/*.js')
    .pipe(babel({
      presets: ['es2015']
    }).on('error', handleError))
    .pipe(gulp.dest('./dist'))
})

gulp.task('lint', () => {
  // ESLint ignores files with "node_modules" paths.
  // So, it's best to have gulp ignore the directory as well.
  // Also, Be sure to return the stream from the task;
  // Otherwise, the task may end before the stream has finished.
  return gulp.src(['src/**/*.js','!node_modules/**', '!dist/*', '!src/utils/timeago.js', '!src/images/*'])
    // eslint() attaches the lint output to the "eslint" property
    // of the file object so it can be used by other modules.
    .pipe(eslint())
    // eslint.format() outputs the lint results to the console.
    // Alternatively use eslint.formatEach() (see Docs).
    .pipe(eslint.format())
    // To have the process exit with an error code (1) on
    // lint error, return the stream and pipe to failAfterError last.
    // .pipe(eslint.failAfterError());
})

gulp.task('dev', ['clean'], () => {
  runSequence('json',
    'images',
    'templates',
    'wxss',
    'scripts',
    'lint',
    'watch');
})

// ================ for production configure =======================
// ================ run gulp build =================================

gulp.task('jsonPro', ['jsonLint'], () => {
  return gulp.src('./src/**/**/*.json')
    .pipe(jsonminify())
    .pipe(gulp.dest('./dist'))
})

gulp.task('templatesPro', () => {
  return gulp.src('./src/**/**/*.wxml')
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeComments: true,
      keepClosingSlash: true
    }))
    .pipe(gulp.dest('./dist'))
});


gulp.task('scriptsPro', ['lint'], () => {
  return gulp.src('./src/**/**/*.js')
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(uglify({
      compress: true,
    }))
    .pipe(gulp.dest('./dist'))
})

gulp.task('wxssPro', () => {
  const combined = combiner.obj([
    gulp.src(['./src/**/**/*.{wxss,scss}', '!./src/styles/**']),
    sass().on('error', sass.logError),
    autoprefixer([
      'iOS >= 8',
      'Android >= 4.1'
    ]),
    minifycss(),
    rename((path) => path.extname = '.wxss'),
    gulp.dest('./dist')
  ]);

  combined.on('error', handleError);
});


gulp.task('dev', ['clean'], () => {
  runSequence('json',
    'images',
    'templates',
    'wxss',
    'scripts',
    'lint',
    'watch');
})

gulp.task('build', ['clean'], () => [
  runSequence(
    'jsonPro',
    'images',
    'templatesPro',
    'wxssPro',
    'scriptsPro'
  )
]);
