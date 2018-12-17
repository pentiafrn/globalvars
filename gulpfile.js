var gulp = require("gulp")
var postcss = require("gulp-postcss")
var autoprefixer = require("autoprefixer")
var sass = require("gulp-sass")
var sassTypes = sass.compiler.types
var sourcemaps = require('gulp-sourcemaps')
var browserify = require("browserify")
var source = require('vinyl-source-stream')

gulp.task("sass", () => compile({ outputStyle: "nested", destination: "./dist" }))
gulp.task("scripts", () => compileJs())
gulp.task("watch", () => gulp.watch(["./index.scss", "./css-variables.js", "./index.js"], ["sass", "scripts"]))



function compileJs() {
    var bundle = browserify({
        entries: "./index.js",
        debug: true
    })

  return bundle.bundle()
    .pipe(source("index.js"))
    .pipe(gulp.dest("./dist"));
}

function compile(options) {
    var cssVariables = requireUncached("./css-variables.js")
    gulp.src("./index.scss")
    .pipe(sourcemaps.init())
    .pipe(sass.sync({
        outputStyle: options.outputStyle,
        functions: {
            "global-var($variable)": variable => sassTypes.String(cssVariables[variable.getValue()])
        }
    }).on("error", sass.logError))
    .pipe(postcss([autoprefixer()]))
    .pipe(sourcemaps.write('../sourcemap'))
    .pipe(gulp.dest(options.destination))
}

function requireUncached(module) {
    delete require.cache[require.resolve(module)]
    return require(module)
}