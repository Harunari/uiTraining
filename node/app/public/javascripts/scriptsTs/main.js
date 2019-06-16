"use strict";
var aaa;
(function (aaa) {
    var testClass = /** @class */ (function () {
        function testClass() {
            this.lab = "hamaji";
            this.address = "uji";
            this.roba = "akamerida";
            this.club = "charibu";
            this.age = 3;
        }
        return testClass;
    }());
})(aaa || (aaa = {}));
var test = "world";
var testArray = [2, 3, 4, 5];
console.log(testArray.reduce(function (acc, n) { return n + acc; }));
console.log("Hello " + test);
