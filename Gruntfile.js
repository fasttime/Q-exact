/* jshint node: true */

'use strict';

var JSCS_OPTIONS =
{
    disallowEmptyBlocks: true,
    // Encourage use of abbreviations: "char", "obj", "str".
    disallowIdentifierNames: ['character', 'object', 'string'],
    disallowMultipleLineBreaks: true,
    disallowMultipleVarDecl: true,
    disallowNamedUnassignedFunctions: true,
    disallowSpaceAfterObjectKeys: true,
    disallowSpaceAfterPrefixUnaryOperators: true,
    disallowSpaceBeforeComma: { allExcept: ['sparseArrays'] },
    disallowSpaceBeforePostfixUnaryOperators: true,
    disallowSpaceBeforeSemicolon: true,
    disallowSpacesInCallExpression: true,
    disallowSpacesInFunctionDeclaration: { beforeOpeningRoundBrace: true },
    disallowSpacesInNamedFunctionExpression: { beforeOpeningRoundBrace: true },
    disallowSpacesInsideBrackets: true,
    disallowSpacesInsideParentheses: true,
    disallowTabs: true,
    disallowTrailingWhitespace: 'ignoreEmptyLines',
    disallowYodaConditions: true,
    requireAlignedMultilineParams: true,
    requireBlocksOnNewline: true,
    requireEarlyReturn: true,
    requireKeywordsOnNewLine:
    [
        'break',
        'case',
        'catch',
        'continue',
        'default',
        'do',
        'else',
        'finally',
        'for',
        'return',
        'switch',
        'throw',
        'try',
        'while'
    ],
    requireLineBreakAfterVariableAssignment: true,
    requireLineFeedAtFileEnd: true,
    requireNewlineBeforeBlockStatements: true,
    requireObjectKeysOnNewLine: { allExcept: ['sameLine'] },
    requirePaddingNewLinesAfterUseStrict: true,
    requireSpaceAfterBinaryOperators: true,
    requireSpaceAfterComma: true,
    requireSpaceAfterKeywords: true,
    requireSpaceAfterLineComment: true,
    requireSpaceBeforeBinaryOperators: true,
    requireSpaceBeforeBlockStatements: true,
    requireSpaceBeforeKeywords: ['delete', 'if', 'in', 'instanceof'],
    requireSpaceBeforeObjectValues: true,
    requireSpacesInConditionalExpression: true,
    requireSpacesInForStatement: true,
    requireSpacesInsideObjectBrackets: 'all',
    validateAlignedFunctionParameters: true,
    validateIndentation: { includeEmptyLines: true, value: 4 }
};

var JSHINT_OPTIONS =
{
    // Enforcing options
    eqeqeq: true,
    immed: true,
    maxlen: 100,
    newcap: false,
    noarg: true,
    noempty: true,
    quotmark: true,
    singleGroups: true,
    strict: true,
    trailing: true,
    undef: true,
    unused: true,
    
    // Relaxing options
    boss: true,
    elision: true,
    eqnull: true,
    evil: true,
    validthis: true,
    '-W018': true,
};

module.exports =
    function (grunt)
    {
        // Project configuration.
        grunt.initConfig(
            {
                clean: { default: ['coverage', 'lib/**/*.min.js', 'Q-exact.md'] },
                jscs: { default: ['*.js', 'lib/**/*.js', 'test/**/*.js'], options: JSCS_OPTIONS },
                jsdoc2md: { default: { dest: 'Q-exact.md', src: 'lib/q.js' } },
                jshint:
                {
                    default: ['*.js', 'lib/**/*.js', 'test/**/*.js'],
                    options: JSHINT_OPTIONS
                },
                mocha_istanbul: { default: 'test/**/*.spec.js' },
                uglify:
                {
                    default: { files: { 'lib/q.min.js': 'lib/q.js' } },
                    options: { compress: { global_defs: { DEBUG: false }, hoist_vars: true } }
                }
            }
        );
        
        // These plugins provide necessary tasks.
        grunt.loadNpmTasks('grunt-contrib-clean');
        grunt.loadNpmTasks('grunt-contrib-jshint');
        grunt.loadNpmTasks('grunt-contrib-uglify');
        grunt.loadNpmTasks('grunt-jscs');
        grunt.loadNpmTasks('grunt-jsdoc-to-markdown');
        grunt.loadNpmTasks('grunt-mocha-istanbul');
        
        // Default task.
        grunt.registerTask(
            'default',
            ['clean', 'jshint', 'jscs', 'mocha_istanbul', 'jsdoc2md', 'uglify']
        );
    };
