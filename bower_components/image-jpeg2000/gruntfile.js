/* Copyright (c) 2015, Jean-Francois Pambrun
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.  */

module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        clean: ['dist'],

        version: {
            // options: {},
            defaults: {
                src: ['bower.json']
            }
        },

        jsbeautifier: {
            "default": {
                src: ['gruntfile.js', 'test/**/*.js'],
                options: {
                    js: {
                        jslintHappy: true
                    }
                }
            },
        },

        jshint: {
            options: {
                '-W097': true,
                browser: true, // define globals exposed by modern browsers?
                devel: true,
                nonstandard: true,
                worker: true,
                reporter: require('jshint-stylish') // use jshint-stylish to make our errors look and read good
            },

            // when this task is run, lint the Gruntfile and all js files in src
            dev: ['Grunfile.js', 'ext/core/jpx.js']
        },

        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                    '<%= grunt.template.today("yyyy-mm-dd") %> ' +
                    '| https://github.com/OHIF/image-JPEG2000 */\n'
            },
            prod: {
                files: {
                    'dist/jpx.min.js': ['ext/pdf.js/src/core/jpx.js', 'ext/pdf.js/src/core/arithmetic_decoder.js', 'ext/pdf.js/src/shared/util.js']
                }
            }
        },

        concat: {
            dev: {
                options: {
                    banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                        '<%= grunt.template.today("yyyy-mm-dd") %> ' +
                        '| https://github.com/OHIF/image-JPEG2000 */\n'
                },
                src: ['ext/pdf.js/src/core/jpx.js', 'ext/pdf.js/src/core/arithmetic_decoder.js', 'ext/pdf.js/src/shared/util.js'],
                dest: 'dist/jpx.js'
            }
        },

        nodeunit: {
            all: ['test/*_test.js'],
            options: {
                reporter: 'grunt',
            }
        },


    });


    grunt.registerTask('dev', ['jshint:dev', 'concat:dev']);
    grunt.registerTask('prod', ['uglify:prod']);
    grunt.registerTask('beautify', ['jsbeautifier']);
    grunt.registerTask('default', ['jsbeautifier', 'dev', 'prod']);
    grunt.registerTask('test', ['nodeunit']);

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks("grunt-jsbeautifier");
    grunt.loadNpmTasks('grunt-version');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');

};

// Release process:
//  1) Update version numbers in package.json and bower.json
//     grunt version
//  2) do a build (needed to update dist versions with correct build number)
//  3) commit changes
//      git commit -am "Changes...."
//  4) tag the commit
//      git tag -a 0.1.0 -m "Version 0.1.0"
//  5) push to github
//      git push origin master --tags
