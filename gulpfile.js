// INCOMPLETE
// Obviously you need gulp to run gulp
var gulp = require('gulp');
// Sass Compiler
var sass = require('gulp-sass');
// Template Engine
var nunjucksRender = require('gulp-nunjucks-render');
// Starts realtime server that reloads when files are changed
var browserSync = require('browser-sync');
// Optimize CSS and JS
var useref = require('gulp-useref');
// Minify JS
var uglify = require('gulp-uglify'); //replaced with gulp-uglify-es
// Minify JS
// var uglify = require('gulp-uglify-es').default;
// Differentiate between CSS and JS for optimization/minification
var gulpIf = require('gulp-if');
// Minify CSS
var cssnano = require('gulp-cssnano');
// Optimize images
var imagemin = require('gulp-imagemin');
// Cache optimized images or other large files
var cache = require('gulp-cache');
// Delete directories/files when necessary
var del = require('del');
// Structure HTML with proper indentation, etc.
// var htmlbeautify = require('gulp-html-beautify');
// Run tasks in order; starts next task only when previous task is complete
// var runSequence = require('run-sequence'); // deprecated in gulp 4.0+
var runSequence = require('gulp4-run-sequence');
// Connects to PHP server
var php = require('gulp-connect-php');
// Merge streams (used to copy PHP core files simultaneously)
var merge = require('merge-stream');
// Help debug gulp-uglify js errors
var pump = require('pump');


// INCOMPLETE

// Basic Gulp task syntax
gulp.task('hello', function() {
  console.log('Hello Developer!');
})

// Development Tasks
// -----------------

// Start browserSync server
gulp.task('browserSync', function() {
  browserSync({
    server: {
      baseDir: 'src'
    }
    // port: 8080,
    // proxy: 'localhost:8888'
  })
});

gulp.task('php', function() {
  php.server({
    base: 'src',
    // port: 8010,
    // open: true
  })
});

// Sass Compiling
gulp.task('sass', function() {
  // return gulp.src('src/scss/**/*.scss', ['!src/scss/vendor/**/*.scss']) // Gets all files ending with .scss in src/scss and children dirs, except vendor files
  return gulp.src('src/scss/*.scss', ['!src/scss/vendor/**/*.scss']) // Gets all files ending with .scss in src/scss, except vendor files
    .pipe(sass()) // Passes it through gulp-sass
    .pipe(gulp.dest('src/css')) // Outputs it in the css folder
    .pipe(browserSync.reload({ // Reloading with Browser Sync
      stream: true
    }));
})

// Template Engine
gulp.task('nunjucks', function() {
  // Gets .html and .njk (nunjucks) files in pages
 return gulp.src('src/pages/**/*.+(html|njk)')
 // Renders template with nunjucks
 .pipe(nunjucksRender({
     path: ['src/templates'],
     // ext: '.php'
     ext: '.html'
   }))
 // output files in src folder (moved to dist folder for production)
 .pipe(gulp.dest('src'))
});

// Watchers (watch for changes to files with following extensions; run task in [] or reload browserSync server)
gulp.task('watch', function() {
  // gulp.watch('src/scss/**/*.scss', ['sass']);
  // gulp.watch('src/**/*.+(html|njk)', ['nunjucks']);
  // gulp.watch('src/*.+(html|php)', browserSync.reload);
  // gulp.watch('src/js/**/*.js', browserSync.reload);

  // gulp 4.x now requires a function to be passed in gulp.watch
  gulp.watch('src/scss/**/*.scss', gulp.series('sass'));
  gulp.watch('src/**/*.+(html|njk)', gulp.series('nunjucks'));
  gulp.watch('src/*.+(html|php)').on('change', browserSync.reload);
  // gulp.watch('src/js/**/*.js').on('change', browserSync.reload);
})

// Optimization Tasks
// ------------------

// Optimizing CSS and JavaScript
gulp.task('useref', function() {

  // return gulp.src(['src/**/*.php', '!src/config/**/*', '!src/models/db.php'])
  return gulp.src(['src/**/*.php', '!src/models/db.php', '!src/models/db1.php', '!src/models/db2.php'])
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulpIf('*.css', cssnano()))
    .pipe(gulp.dest('dist'));
});

// Beautify HTML with proper indentation, etc.
// gulp.task('htmlbeautify', function() {
//   gulp.src('dist/*.html')
//     .pipe(htmlbeautify({
//       indentSize: 1,
//       indentCharacter: " "
//     }))
//     .pipe(gulp.dest('dist'));
// });

// Optimizing Images
gulp.task('images', function() {
  return gulp.src('src/images/**/*.+(png|jpg|jpeg|gif|svg|webp)')
    // Caching images that ran through imagemin
    .pipe(cache(imagemin({
      interlaced: true,
    })))
    .pipe(gulp.dest('dist/images'))
});

// Copying fonts
gulp.task('fonts', function() {
  return gulp.src('src/fonts/**/*')
    .pipe(gulp.dest('dist/fonts'))
})
gulp.task('email', function() {
  return gulp.src('src/email/**/*')
    .pipe(gulp.dest('dist/email'))
})
// Copying Vendor CSS
gulp.task('vendor:css', function() {
  return gulp.src('src/css/vendor/**/*')
    .pipe(gulp.dest('dist/css/vendor'))
})
// Copying Vendor JS
gulp.task('vendor:js', function() {
  return gulp.src('src/js/vendor/**/*')
    .pipe(gulp.dest('dist/js/vendor'))
})
// Copying PHP core
gulp.task('core', function() {
  var config = gulp.src('src/config/*')
    .pipe(gulp.dest('dist/config'));
  var controllers = gulp.src('src/controllers/**/*')
    .pipe(gulp.dest('dist/controllers'));
  var models = gulp.src('src/models/*')
    .pipe(gulp.dest('dist/models'));
  var admin = gulp.src('src/admin/*.')
    .pipe(gulp.dest('dist/admin'));

  return merge(config, controllers, models, admin);
});

// Cleaning
gulp.task('clean', function() {
  return del.sync('dist').then(function(cb) {
    return cache.clearAll(cb);
  });
})
gulp.task('clean:dist', async function() {
  return del.sync(['dist/**/*', '!dist/images', '!dist/images/**/*', '!dist/config', '!dist/config/**/*', '!dist/controllers', '!dist/controllers/**/*', '!dist/models', '!dist/models/**/*', '!dist/email', '!dist/email/**/*', '!dist/favicon.ico', '!dist/*.png']);
});
gulp.task('clean:root', async function() {
  return del.sync(['css', 'js']);
});

// Build Sequences
// ---------------

gulp.task('default', function(callback) {
  // runSequence(['sass', 'php', 'browserSync', 'watch'],
  runSequence(['sass', 'browserSync', 'watch'],
    callback
  )
})

gulp.task('uglify-error-debugging', function (cb) {
  pump([
    gulp.src('**/*.js'),
    uglify(),
    gulp.dest('dist/')
  ], cb);
});

gulp.task('build', function(callback) {
  runSequence(
    'clean:dist',
    ['vendor:css', 'vendor:js'],
    ['sass', 'useref'],
    'nunjucks',
    // 'htmlbeautify',
    // ['images', 'fonts'],
    // 'email',
    'clean:root',
    callback
  )
})
