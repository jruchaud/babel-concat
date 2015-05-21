"use strict";

var assert = require("assert");
var concat = require("../index.js");

describe("babel-concat", function() {

    describe("#transformFileSync()", function() {

        var result = concat.transformFileSync([
            "test/files/File1.js",
            "test/files/File1.js",
            "test/files/File1.js"
        ], {
            sourceMap: true
        });

        it("Should return a result with code and map", function() {
            assert.equal(true, !!result);
            assert.equal(true, !!result.code);
            assert.equal(true, !!result.map);
        });
    });
});
