/* eslint-disable no-console */
//  ┌───────────────────────────────────────────────────────────────────────────────────┐
//  │  REQUIRE THIRDPARTY-MODULES DEPENDENCY.                                           │
//  └───────────────────────────────────────────────────────────────────────────────────┘
const gulp = require('gulp');
const eslint = require('gulp-eslint');

// Array of dir path
const ignore = ['!node_modules/**'];

const inspect = [
  'src/**/*.js',
];

const all = [...ignore, ...inspect];

//  ┌───────────────────────────────────────────────────────────────────────────────────┐
//  │  DECLARATION OF TASKS FOR GULP.                                                   │
//  └───────────────────────────────────────────────────────────────────────────────────┘
gulp.task('lint', () =>
  gulp
    .src(all)
    .pipe(
      eslint({
        rules: {},
      }),
    )
    .pipe(eslint.format())
    .pipe(
      eslint.result(result => {
        //  Called for each ESLint result.
        console.log(`ESLint result: ${result.filePath}`);
        console.log(`   # Messages: ${result.messages.length}`);
        console.log(`   # Warnings: ${result.warningCount}`);
        console.log(`     # Errors: ${result.errorCount}`);
        console.log('----------------------------------------------------');
      }),
    )
    .pipe(
      eslint.results(results => {
        //  Called once for all ESLint results.
        //  callback(error);
        console.log(` Total Results: ${results.length}`);
        console.log(`Total Warnings: ${results.warningCount}`);
        console.log(`  Total Errors: ${results.errorCount}`);
        console.log('----------------------------------------------------');
      }),
    )
    .pipe(eslint.failAfterError()),
);
