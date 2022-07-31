const { src, dest, series, parallel, watch } = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const sass = require('gulp-dart-sass');
const cssnano = require('gulp-cssnano');
const rename = require('gulp-rename');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;
const clean = require('gulp-clean');
const kit = require('gulp-kit');

const paths = {
	html: './html/**/*.kit',
	sass: './src/sass/**/*.scss',
	distSass: './dist/css',
	js: './src/js/**/*.js',
	distJs: './dist/js',
	img: 'src/img/*',
	distImg: 'dist/img',
};
function sassCompiler(done) {
	src(paths.sass)
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer())
		.pipe(cssnano())
		.pipe(rename('./style.min.css'))
		.pipe(sourcemaps.write())
		.pipe(dest(paths.distSass));
	done();
}
function javaScript(done) {
	src(paths.js)
		.pipe(sourcemaps.init())
		.pipe(
			babel({
				presets: ['@babel/env'],
			})
		)
		.pipe(uglify())
		.pipe(rename('./main.min.js'))
		.pipe(sourcemaps.write())
		.pipe(dest(paths.distJs));
	done();
}
function convertImg(done) {
	src(paths.img).pipe(imagemin()).pipe(dest(paths.distImg));
	done();
}
function startBrowserSync(done) {
	browserSync.init({
		server: {
			baseDir: './',
		},
		notify: false,
	});

	done();
}
function handleKits(done) {
	src(paths.html).pipe(kit()).pipe(dest('./'));
	done();
}
function watchForChanges(done) {
	watch('./*.html').on('change', reload);
	watch(
		[paths.html, paths.sass, paths.js],
		parallel(handleKits, sassCompiler, javaScript)
	).on('change', reload);
	watch(paths.img, convertImg);
	done();
}
function cleanStuff(done) {
	src('./dist', { read: false }).pipe(clean());
	done();
}
const mainFunctions = parallel(
	handleKits,
	sassCompiler,
	javaScript,
	convertImg
);
exports.cleanStuff = cleanStuff;
exports.default = series(mainFunctions, startBrowserSync, watchForChanges);
