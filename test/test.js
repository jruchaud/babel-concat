"use strict";

var assert = require("assert");
var concat = require("../index.js");
var fs = require("fs");

describe("babel-concat", function() {

    describe("#transformFileSync()", function() {

        var result = concat.transformFileSync([
            "test/files/File1.js",
            "test/files/File2.js",
            "test/files/File3.js"
        ], {
            sourceMaps: true
        });

        it("Should return a result with code and map", function() {
            assert.equal(true, !!result);
            assert.equal(true, !!result.code);
            assert.equal(true, !!result.map);
        });
        it("Source map content should contain each file content", function() {
            assert.equal(3, Object.keys(result.map._sourcesContents).length);
        });

    });

    describe("#transform", function() {
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

        it("Should return a result with code and map", function() {
            assert.equal(true, !!result);
            assert.equal(true, !!result.code);
            assert.equal(true, !!result.map);
        });
        it("Source map content should contain each block of code", function() {
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
                assert.equal(true, !!result);
                assert.equal(true, !!result.code);
                assert.equal(true, !!result.map);
                assert.equal(3, Object.keys(result.map._sourcesContents).length);
            });
        });
    });
});
