'use strict';

module.exports = function (grunt) {
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	var nodemonIgnoredFiles = [
		'Gruntfile.js',
		'node-inspector.js',
		'/.git/',
		'/node_modules/',
		'/static/'
	];

	grunt.initConfig({
		watch: {
			js: {
				files: [
					'**/*.js',
					'!node_modules/**/*.js'
				],
				tasks: ['jshint']
			},
		},
		jshint: {
			options: {
				'node': true,
				'browser': true,
				'esnext': true,
				'bitwise': true,
				//'camelcase': true,
				'curly': true,
				'eqeqeq': true,
				'immed': true,
				'latedef': true,
				'newcap': true,
				'noarg': true,
				'quotmark': 'single',
				'regexp': true,
				'undef': true,
				'strict': true,
				//'smarttabs': true,
				'globals': {
					'jQuery': true,
					'angular': true,
					'define': true,
					'io': true
				},
				'-W087': true,
				'-W064': true,
				// type coersion
				'-W116': true,
				'-W030': true,
				// W093: Did you mean to return a conditional instead of an assignment?
				'-W093': true,
				// allowed mixed tabs and spaces
				'-W099': true
			},
			all: [
				'**/*.js',
				'!node_modules/**/*.js',
				'!static/js/lib/**/*.js'
			]
		},
		concurrent: {
			nodemon: {
				options: {
					logConcurrentOutput: true,
				},
				tasks: [
					'nodemon:nodeInspector',
					'nodemon:dev',
					'watch'
				]
			}
		},
		nodemon: {
			dev: {
				options: {
					file: 'index.js',
					args: ['development'],
					watchedExtensions: [
						'js'
					],
					debug: true,
					delayTime: 1,
					ignoredFiles: nodemonIgnoredFiles,
					env: {
						PORT: '8000'
					}
				}
			},
			nodeInspector: {
				options: {
					file: 'node-inspector.js',
					watchedExtensions: [
						'js'
					],
					exec: 'node-inspector',
					ignoredFiles: nodemonIgnoredFiles
				},
			},
		}
	});

	grunt.registerTask('default', [
		'jshint',
		'concurrent:nodemon'
	]);
};
