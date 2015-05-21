"use strict";

var assert = require("assert");
var concat = require("../index.js");
var fs = require("fs");

describe("babel-concat", function() {

    describe("#transformFileSync()", function() {

        it("Should return a result with code and map", function() {
            var result = concat.transformFileSync([
                "test/files/File1.js",
                "test/files/File2.js",
                "test/files/File3.js"
            ], {
                sourceMaps: true
            });

            assert(!!result);
            assert(!!result.code);
            assert(!!result.map);
            assert.equal(3, Object.keys(result.map._sourcesContents).length);
        });

    });

    describe("#transform", function() {
        it("Should return a result with code and map", function() {
            var file1 = fs.readFileSync("test/files/File1.js", "utf-8"),
                file2 = fs.readFileSync("test/files/File2.js", "utf-8"),
                file3 = fs.readFileSync("test/files/File3.js", "utf-8");

            var result = concat.transform([
                file1,
                file2,
                file3
            ], {
                sourceMaps: "both"
            });

            assert(!!result);
            assert(!!result.code);
            assert(!!result.map);
            assert.equal(3, Object.keys(result.map._sourcesContents).length);
        });
    });

    describe("#transformFile()", function() {

        it("Should return a result with code and map", function(done) {
            concat.transformFile([
                "test/files/File1.js",
                "test/files/File2.js",
                "test/files/File3.js"
            ], {
                sourceMaps: true
            }, function(result) {
                done();
                assert(!!result);
                assert(!!result.code);
                assert(!!result.map);
                assert.equal(3, Object.keys(result.map._sourcesContents).length);
            });
        });
    });
});
