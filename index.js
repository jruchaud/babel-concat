"use strict";

var sourceMap = require("source-map");
var babel = require("@babel/core");

var SourceMapGenerator = sourceMap.SourceMapGenerator;
var SourceMapConsumer = sourceMap.SourceMapConsumer;

var nonceVal = Date.now();
var nonce = function() {
    return nonceVal++;
};

/**
 * When concatenating multiple source map, each one need to have a specific source name,
 * otherwize it will the last source will erase the previous ones.
 * @param   {String} sourceFileName source file name original from options
 * @param   {String} code           code associated
 * @returns {String} a generated source file name unique form each codes
 */
var processSourceFileName = function(sourceFileName, code) {

    // If we're processing a block of code,
    // let's try to find a class name in the block to specify the sourceFileName

    var re = /class\s?([^\s]+)(\s?{|\s.*)|\s([^\s]+)\s?=\s?class/;
    var m = re.exec(code);

    return (sourceFileName || "") + (m && m[1] || nonce());
};

/**
 * Process the babel options to adapt the options to avoid some issue after transformation.
 * @param   {Object} options current options for babel
 * @param   {String} code    code associated
 * @returns {Object} options really used during transformation
 */
var processOptions = function(options, code) {
    var rst = JSON.parse(JSON.stringify(options)); // Let's clone options

    // In the case were source maps are activated, we need to make some verifications

    if (rst.sourceMaps) {

        // 1. If we're processing a block of code, we need to ensure that the block will have a specific source name
        if (code) {
            rst.sourceFileName = processSourceFileName(rst.sourceFileName, code);
        }

        // 2. If the sourceMap options equals to "inline" or "both", we need to set it to true before processing babel transform
        // otherwize, the sourceMapUrl will be added by babel to the generated code of each file / block of code.
        // We will take care to handle the "inline" or "both" specification when the concatenated code has been fully generated
        if (rst.sourceMaps === "inline" || rst.sourceMaps === "both") {
            rst.sourceMaps = true;
        }
    }

    return rst;
};

/**
 * Same as transform from babel except that you give a list of code blocks.
 * @param   {Array}  codeBlocks list of code blocks
 * @param   {Object} options    see babel options
 * @returns {Object} return an object with the code and map of all codes
 */
exports.transform = function(codeBlocks, options) {
    var babelResults = [];

    codeBlocks.forEach(function(block) {
        var babelResult = babel.transform(block, processOptions(options, block));
        babelResults.push(babelResult);
    });

    return exports.babelConcat(babelResults, options);
};

/**
 * Same as transformFile from babel with mutilple files.
 * @param {Array}    files    all files to transform
 * @param {Object}   options  see babel options
 * @param {Function} callback call the function after transform with parameter
 *                            an object with the code and map of all files
 */
exports.transformFile = function(files, options, callback) {
    var deferredResults = [];
    files.forEach(function(file) {
        var promise = new Promise(function(resolve) {
            babel.transformFile(file, processOptions(options), function(e, r) {
                resolve(r);
            });
        });
        deferredResults.push(promise);
    });

    Promise.all(deferredResults).then(function(babelResults) {
        callback(exports.babelConcat(babelResults, options));
    });
};

/**
 * Same as transformFileSync from babel with mutilple files.
 * @param   {Array}  files   all files to transform
 * @param   {Object} options see babel options
 * @returns {Object} return an object with the code and map of all files
 */
exports.transformFileSync = function(files, options) {
    var babelResults = [];

    files.forEach(function(file) {
        var babelResult = babel.transformFileSync(file, processOptions(options));
        babelResults.push(babelResult);
    });

    return exports.babelConcat(babelResults, options);
};

/**
 * Concat all result with code and map from babel transform.
 * @param   {Array}  babelResults all results from babel an array of
 *                              object contain code and map
 * @param   {Object} options      options see babel options
 * @returns {Object} return an object with the code and map of all results
 */
exports.babelConcat = function(babelResults, options) {

    var map = new SourceMapGenerator();
    var lastLine = 0;

    var concactMap = function(mapConsumer, offset) {

        mapConsumer.eachMapping(function(callback) {
            map.addMapping({
                source: callback.source,
                original: {
                    line: callback.originalLine,
                    column: callback.originalColumn
                },
                generated: {
                    line: offset + callback.generatedLine,
                    column: callback.generatedColumn
                },
                name: callback.name
            });

            lastLine = offset + callback.generatedLine;
        });
    };

    var concatContent = function(mapConsumer) {
        var sources = mapConsumer.sources;
        var contents = mapConsumer.sourcesContent;

        for (var i = 0, l = sources.length; i < l; i++) {
            map.setSourceContent(sources[i], contents[i]);
        }
    };

    var codes = "";
    var concatCode = function(code) {
        codes += code + "\n";
    };

    babelResults.forEach(function(result) {
        if (result.map) {
            var mapConsumer = new SourceMapConsumer(result.map);

            concactMap(mapConsumer, lastLine);
            concatContent(mapConsumer);
        }

        concatCode(result.code);
    });

    return {
        map: map,
        code: options.sourceMaps ? exports.addSourceMapUrlData(codes, map) : codes
    };
};

/**
 * Insert the source map as data in the code.
 * @param   {String} code code where insert the source map
 * @param   {Object} map  map represents the source map for the code
 * @returns {String} the code with the source map data
 */
exports.addSourceMapUrlData = function(code, map) {
    var mapString = map.toString();
    var mapBase64 = new Buffer(mapString).toString("base64");
    var mapData = "//# " + "sourceMappingURL=data:application/json;base64," + mapBase64;

    return code + "\n" + mapData;
};

/**
 * Insert the source map as url in the code
 * @param   {String} code code where insert the source map
 * @param   {String} url  url to find the source map
 * @returns {String} the code with the source map url
 */
exports.addSourceMapUrl = function(code, url) {
    return code + "//# " + "sourceMappingURL=" + url;
};
