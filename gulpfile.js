const gulp = require('gulp');
const del = require('del');
const path = require('path');
const autoprefixer = require('gulp-autoprefixer');
const sass = require('gulp-sass');
const gutil = require('gulp-util');
const babel = require('gulp-babel');
const rename = require('gulp-rename')
const fs = require('fs');
const argv = require('yargs').argv;
const chokidar = require('chokidar');
const eslint = require('gulp-eslint');

const colors = gutil.colors;

const handleError = function(err) {
  console.log('\n')
  gutil.log(colors.red('Error!'))
  gutil.log('fileName: ' + colors.red(err.fileName))
  gutil.log('lineNumber: ' + colors.red(err.lineNumber))
  gutil.log('message: ' + err.message)
  gutil.log('plugin: ' + colors.yellow(err.plugin))
  this.emit('end')
};

const fileCopy = (src, dest) => {
  return gulp.src(src).pipe(gulp.dest(dest));
};

// getBuildCopyPath
const getBuildCopyPath = (src) => {
  const dirName = path.resolve(path.dirname(src)); // 转换为绝对路径
  const distPath = path.join(path.dirname(__filename), 'dist');
  const srcPath = path.join(path.dirname(__filename), 'src');
  return dirName.replace(srcPath, distPath);
};

// sassCompile
const sassCompile = (src, dest = './dist') => {
  return gulp.src(src)
    .pipe(sass())
    .on('error', handleError)
    .pipe(
      autoprefixer([
        'iOS >= 8',
        'Android >= 4.1'
      ])
    )
    .pipe(
      rename((path) => {
        path.extname = '.wxss'
      })
    )
    .pipe(gulp.dest(dest))
};

const buildJs = (src, dest = './dist') => {
  return gulp.src(src)
    .pipe(babel({
      presets: ['es2015']
    }).on('error', handleError))
    .pipe(gulp.dest(dest))
}

const lint = (src) => {
  return gulp.src(src)
    // eslint() attaches the lint output to the "eslint" property
    // of the file object so it can be used by other modules.
    .pipe(eslint())
    // eslint.format() outputs the lint results to the console.
    // Alternatively use eslint.formatEach() (see Docs).
    .pipe(eslint.format())
    // To have the process exit with an error code (1) on
    // lint error, return the stream and pipe to failAfterError last.
    // .pipe(eslint.failAfterError());
}


// clean dist folder
gulp.task('clean', () => {
  return del(['./dist/**'])
});

// wxml copy
gulp.task('copy-wxml', (done) => {
  fileCopy(['./src/**/*.wxml'], './dist');
  done();
});

// json copy
gulp.task('copy-json', (done) => {
  fileCopy(['./src/**/*.json'], './dist');
  done();
});

// image copy
gulp.task('copy-image', (done) => {
  fileCopy(['./src/**/*.png'], './dist');
  done();
});

// copy all
gulp.task('copy', gulp.series(['copy-json', 'copy-wxml', 'copy-image']));

// watch 监听
gulp.task('watch', () => {
  const jsWatcher = chokidar.watch('./src/**/*.js', { ignoreInitial: true });
  const styleWatcher = chokidar.watch(['./src/**/*.scss', './src/**/*.wxss'], { ignoreInitial: true });

  const commomWatcher = chokidar.watch(['./src/**/*.json', './src/**/*.wxml', './src/images/*'], { ignoreInitial: true });

  commomWatcher
    .on('all', (event, path) => {
      if (['change', 'add'].includes(event)) {
        fileCopy(path, getBuildCopyPath(path));
      }
    });

  styleWatcher
    .on('all', (event, path) => {
      if (['change', 'add'].includes(event)) {
        sassCompile(path, getBuildCopyPath(path));
      }
    });

  jsWatcher
    .on('all', (event, path) => {
      if (['change', 'add'].includes(event)) {
        lint(path);
        buildJs(path, getBuildCopyPath(path));
      }
    });
});

/**
 * Generate Page
 *
 * usage: gulp generate --page '${page-name}'
 */
gulp.task('generate', (done) => {
  fs.mkdirSync(`src/pages/${argv.page}`);
  fs.writeFileSync(`src/pages/${argv.page}/${argv.page}.js`, "Page({})");
  fs.writeFileSync(`src/pages/${argv.page}/${argv.page}.json`, "{}");
  fs.writeFileSync(`src/pages/${argv.page}/${argv.page}.wxml`, "");
  fs.writeFileSync(`src/pages/${argv.page}/${argv.page}.scss`, "");
  done();
});

gulp.task('sassCompile', () => {
  return sassCompile(['./src/**/**/*.scss', './src/**/**/*.wxss']);
});

gulp.task('buildJsTask', () => {
  return buildJs('./src/**/**/*.js');
})

gulp.task('eslint', () => {
  return lint(['src/**/*.js', '!node_modules/**', '!dist/*', '!src/images/*', '!src/utils/timeago.js'])
});

gulp.task('dev', gulp.series(
  ['clean',
    'buildJsTask',
    'sassCompile',
    'copy',
    'eslint',
    'watch'
  ]
));
