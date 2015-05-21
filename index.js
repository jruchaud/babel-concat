"use strict";

var sourceMap = require("source-map");
var babel = require("babel-core");

var SourceMapGenerator = sourceMap.SourceMapGenerator;
var SourceMapConsumer = sourceMap.SourceMapConsumer;

exports.transform = function(codeBlocks, options) {
    var babelResults = [];

    codeBlocks.forEach(function(block) {
        var babelResult = babel.transform(block, options);
        babelResults.push(babelResult);
    });

    return exports.babelConcat(babelResults, options);
};

exports.transformFile = function(files, options, callback) {
    var deferredResults = [];
    files.forEach(function(file) {
        deferredResults.push(babel.transformFile(file, options));
    });

    Promise.all(deferredResults).then(function(babelResults) {
        callback(exports.babelConcat(babelResults, options));
    });
};

exports.transformFileSync = function(files, options) {
    var babelResults = [];

    files.forEach(function(file) {
        var babelResult = babel.transformFileSync(file, options);
        babelResults.push(babelResult);
    });

    return exports.babelConcat(babelResults, options);
};

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
        code: options.sourceMaps === "both" ? exports.addSourceMapUrlData(codes) : codes
    };
};

exports.addSourceMapUrlData = function(code, map) {
    var mapString = map.toString();
    var mapBase64 = new Buffer(mapString).toString("base64");
    var mapData = "//# " + "sourceMappingURL=data:application/json;base64," + mapBase64;

    return code + "\n" + mapData;
};

exports.addSourceMapUrl = function(code, url) {
    return code + "//# " + "sourceMappingURL=" + url;
};
