/* eslint-env node, browsesr, mocha */
/* eslint no-unused-expressions:0 */
var expect = chai.expect;
afterEach(function() {
    "use strict";
    Combokeys.reset();
});

describe("Combokeys.bind", function() {
    "use strict";
    describe("basic", function() {
        it("z key fires when pressing z", function() {
            var spy = sinon.spy();

            Combokeys.bind("z", spy);

            KeyEvent.simulate("Z".charCodeAt(0), 90);

            // really slow for some reason
            // expect(spy).to.have.been.calledOnce;
            expect(spy.callCount).to.equal(1, "callback should fire once");
            expect(spy.args[0][0]).to.be.an.instanceOf(Event, "first argument should be Event");
            expect(spy.args[0][1]).to.equal("z", "second argument should be key combo");
        });

        it("z key fires from keydown", function() {
            var spy = sinon.spy();

            Combokeys.bind("z", spy, "keydown");

            KeyEvent.simulate("Z".charCodeAt(0), 90);

            // really slow for some reason
            // expect(spy).to.have.been.calledOnce;
            expect(spy.callCount).to.equal(1, "callback should fire once");
            expect(spy.args[0][0]).to.be.an.instanceOf(Event, "first argument should be Event");
            expect(spy.args[0][1]).to.equal("z", "second argument should be key combo");
        });

        it("z key does not fire when pressing b", function() {
            var spy = sinon.spy();

            Combokeys.bind("z", spy);

            KeyEvent.simulate("B".charCodeAt(0), 66);

            expect(spy.callCount).to.equal(0);
        });

        it("z key does not fire when holding a modifier key", function() {
            var spy = sinon.spy();
            var modifiers = ["ctrl", "alt", "meta", "shift"];
            var charCode;
            var modifier;

            Combokeys.bind("z", spy);

            for (var i = 0; i < 4; i++) {
                modifier = modifiers[i];
                charCode = "Z".charCodeAt(0);

                // character code is different when alt is pressed
                if (modifier === "alt") {
                    charCode = "Ω".charCodeAt(0);
                }

                spy.reset();

                KeyEvent.simulate(charCode, 90, [modifier]);

                expect(spy.callCount).to.equal(0);
            }
        });

        it("keyup events should fire", function() {
            var spy = sinon.spy();

            Combokeys.bind("z", spy, "keyup");

            KeyEvent.simulate("Z".charCodeAt(0), 90);

            expect(spy.callCount).to.equal(1, "keyup event for `z` should fire");

            // for key held down we should only get one key up
            KeyEvent.simulate("Z".charCodeAt(0), 90, [], document, 10);
            expect(spy.callCount).to.equal(2, "keyup event for `z` should fire once for held down key");
        });

        it("keyup event for 0 should fire", function() {
            var spy = sinon.spy();

            Combokeys.bind("0", spy, "keyup");

            KeyEvent.simulate(0, 48);

            expect(spy.callCount).to.equal(1, "keyup event for `0` should fire");
        });

        it("rebinding a key overwrites the callback for that key", function() {
            var spy1 = sinon.spy();
            var spy2 = sinon.spy();
            Combokeys.bind("x", spy1);
            Combokeys.bind("x", spy2);

            KeyEvent.simulate("X".charCodeAt(0), 88);

            expect(spy1.callCount).to.equal(0, "original callback should not fire");
            expect(spy2.callCount).to.equal(1, "new callback should fire");
        });

        it("binding an array of keys", function() {
            var spy = sinon.spy();
            Combokeys.bind(["a", "b", "c"], spy);

            KeyEvent.simulate("A".charCodeAt(0), 65);
            expect(spy.callCount).to.equal(1, "new callback was called");
            expect(spy.args[0][1]).to.equal("a", "callback should match `a`");

            KeyEvent.simulate("B".charCodeAt(0), 66);
            expect(spy.callCount).to.equal(2, "new callback was called twice");
            expect(spy.args[1][1]).to.equal("b", "callback should match `b`");

            KeyEvent.simulate("C".charCodeAt(0), 67);
            expect(spy.callCount).to.equal(3, "new callback was called three times");
            expect(spy.args[2][1]).to.equal("c", "callback should match `c`");
        });

        it("return false should prevent default and stop propagation", function() {
            var spy = sinon.spy(function() {
                return false;
            });

            Combokeys.bind("command+s", spy);

            KeyEvent.simulate("S".charCodeAt(0), 83, ["meta"]);

            expect(spy.callCount).to.equal(1, "callback should fire");
            expect(spy.args[0][0]).to.be.an.instanceOf(Event, "first argument should be Event");
            expect(spy.args[0][0].cancelBubble).to.be.True;
            expect(spy.args[0][0].defaultPrevented).to.be.True;

            // try without return false
            spy = sinon.spy();
            Combokeys.bind("command+s", spy);
            KeyEvent.simulate("S".charCodeAt(0), 83, ["meta"]);

            expect(spy.callCount).to.equal(1, "callback should fire");
            expect(spy.args[0][0]).to.be.an.instanceOf(Event, "first argument should be Event");
            expect(spy.args[0][0].cancelBubble).to.be.False;
            expect(spy.args[0][0].defaultPrevented).to.be.False;
        });

        it("capslock key is ignored", function() {
            var spy = sinon.spy();
            Combokeys.bind("a", spy);

            KeyEvent.simulate("a".charCodeAt(0), 65);
            expect(spy.callCount).to.equal(1, "callback should fire for lowercase a");

            spy.reset();
            KeyEvent.simulate("A".charCodeAt(0), 65);
            expect(spy.callCount).to.equal(1, "callback should fire for capslock A");

            spy.reset();
            KeyEvent.simulate("A".charCodeAt(0), 65, ["shift"]);
            expect(spy.callCount).to.equal(0, "callback should not fire fort shift+a");
        });
    });

    describe("special characters", function() {
        it("binding special characters", function() {
            var spy = sinon.spy();
            Combokeys.bind("*", spy);

            KeyEvent.simulate("*".charCodeAt(0), 56, ["shift"]);

            expect(spy.callCount).to.equal(1, "callback should fire");
            expect(spy.args[0][1]).to.equal("*", "callback should match *");
        });

        it("binding special characters keyup", function() {
            var spy = sinon.spy();
            Combokeys.bind("*", spy, "keyup");

            KeyEvent.simulate("*".charCodeAt(0), 56, ["shift"]);

            expect(spy.callCount).to.equal(1, "callback should fire");
            expect(spy.args[0][1]).to.equal("*", "callback should match *");
        });

        it("binding keys with no associated charCode", function() {
            var spy = sinon.spy();
            Combokeys.bind("left", spy);

            KeyEvent.simulate(0, 37);

            expect(spy.callCount).to.equal(1, "callback should fire");
            expect(spy.args[0][1]).to.equal("left", "callback should match `left`");
        });
    });

    describe("combos with modifiers", function() {
        it("binding key combinations", function() {
            var spy = sinon.spy();
            Combokeys.bind("command+o", spy);

            KeyEvent.simulate("O".charCodeAt(0), 79, ["meta"]);

            expect(spy.callCount).to.equal(1, "command+o callback should fire");
            expect(spy.args[0][1]).to.equal("command+o", "keyboard string returned is correct");
        });

        it("binding key combos with multiple modifiers", function() {
            var spy = sinon.spy();
            Combokeys.bind("command+shift+o", spy);
            KeyEvent.simulate("O".charCodeAt(0), 79, ["meta"]);
            expect(spy.callCount).to.equal(0, "command+o callback should not fire");

            KeyEvent.simulate("O".charCodeAt(0), 79, ["meta", "shift"]);
            expect(spy.callCount).to.equal(1, "command+o callback should fire");
        });
    });

    describe("sequences", function() {
        it("binding sequences", function() {
            var spy = sinon.spy();
            Combokeys.bind("g i", spy);

            KeyEvent.simulate("G".charCodeAt(0), 71);
            expect(spy.callCount).to.equal(0, "callback should not fire");

            KeyEvent.simulate("I".charCodeAt(0), 73);
            expect(spy.callCount).to.equal(1, "callback should fire");
        });

        it("binding sequences with mixed types", function() {
            var spy = sinon.spy();
            Combokeys.bind("g o enter", spy);

            KeyEvent.simulate("G".charCodeAt(0), 71);
            expect(spy.callCount).to.equal(0, "callback should not fire");

            KeyEvent.simulate("O".charCodeAt(0), 79);
            expect(spy.callCount).to.equal(0, "callback should not fire");

            KeyEvent.simulate(0, 13);
            expect(spy.callCount).to.equal(1, "callback should fire");
        });

        it("binding sequences starting with modifier keys", function() {
            var spy = sinon.spy();
            Combokeys.bind("option enter", spy);
            KeyEvent.simulate(0, 18, ["alt"]);
            KeyEvent.simulate(0, 13);
            expect(spy.callCount).to.equal(1, "callback should fire");

            spy = sinon.spy();
            Combokeys.bind("command enter", spy);
            KeyEvent.simulate(0, 91, ["meta"]);
            KeyEvent.simulate(0, 13);
            expect(spy.callCount).to.equal(1, "callback should fire");

            spy = sinon.spy();
            Combokeys.bind("escape enter", spy);
            KeyEvent.simulate(0, 27);
            KeyEvent.simulate(0, 13);
            expect(spy.callCount).to.equal(1, "callback should fire");
        });

        it("key within sequence should not fire", function() {
            var spy1 = sinon.spy();
            var spy2 = sinon.spy();
            Combokeys.bind("a", spy1);
            Combokeys.bind("c a t", spy2);

            KeyEvent.simulate("A".charCodeAt(0), 65);
            expect(spy1.callCount).to.equal(1, "callback 1 should fire");
            spy1.reset();

            KeyEvent.simulate("C".charCodeAt(0), 67);
            KeyEvent.simulate("A".charCodeAt(0), 65);
            KeyEvent.simulate("T".charCodeAt(0), 84);
            expect(spy1.callCount).to.equal(0, "callback for `a` key should not fire");
            expect(spy2.callCount).to.equal(1, "callback for `c a t` sequence should fire");
        });

        it("keyup at end of sequence should not fire", function() {
            var spy1 = sinon.spy();
            var spy2 = sinon.spy();

            Combokeys.bind("t", spy1, "keyup");
            Combokeys.bind("b a t", spy2);

            KeyEvent.simulate("B".charCodeAt(0), 66);
            KeyEvent.simulate("A".charCodeAt(0), 65);
            KeyEvent.simulate("T".charCodeAt(0), 84);

            expect(spy1.callCount).to.equal(0, "callback for `t` keyup should not fire");
            expect(spy2.callCount).to.equal(1, "callback for `b a t` sequence should fire");
        });

        it("keyup sequences should work", function() {
            var spy = sinon.spy();
            Combokeys.bind("b a t", spy, "keyup");

            KeyEvent.simulate("b".charCodeAt(0), 66);
            KeyEvent.simulate("a".charCodeAt(0), 65);

            // hold the last key down for a while
            KeyEvent.simulate("t".charCodeAt(0), 84, [], document, 10);

            expect(spy.callCount).to.equal(1, "callback for `b a t` sequence should fire on keyup");
        });

        it("extra spaces in sequences should be ignored", function() {
            var spy = sinon.spy();
            Combokeys.bind("b   a  t", spy);

            KeyEvent.simulate("b".charCodeAt(0), 66);
            KeyEvent.simulate("a".charCodeAt(0), 65);
            KeyEvent.simulate("t".charCodeAt(0), 84);

            expect(spy.callCount).to.equal(1, "callback for `b a t` sequence should fire");
        });

        it("modifiers and sequences play nicely", function() {
            var spy1 = sinon.spy();
            var spy2 = sinon.spy();

            Combokeys.bind("ctrl a", spy1);
            Combokeys.bind("ctrl+b", spy2);

            KeyEvent.simulate(0, 17, ["ctrl"]);
            KeyEvent.simulate("A".charCodeAt(0), 65);
            expect(spy1.callCount).to.equal(1, "`ctrl a` should fire");

            KeyEvent.simulate("B".charCodeAt(0), 66, ["ctrl"]);
            expect(spy2.callCount).to.equal(1, "`ctrl+b` should fire");
        });

        it("sequences that start the same work", function() {
            var spy1 = sinon.spy();
            var spy2 = sinon.spy();

            Combokeys.bind("g g l", spy2);
            Combokeys.bind("g g o", spy1);

            KeyEvent.simulate("g".charCodeAt(0), 71);
            KeyEvent.simulate("g".charCodeAt(0), 71);
            KeyEvent.simulate("o".charCodeAt(0), 79);
            expect(spy1.callCount).to.equal(1, "`g g o` should fire");
            expect(spy2.callCount).to.equal(0, "`g g l` should not fire");

            spy1.reset();
            spy2.reset();
            KeyEvent.simulate("g".charCodeAt(0), 71);
            KeyEvent.simulate("g".charCodeAt(0), 71);
            KeyEvent.simulate("l".charCodeAt(0), 76);
            expect(spy1.callCount).to.equal(0, "`g g o` should not fire");
            expect(spy2.callCount).to.equal(1, "`g g l` should fire");
        });

        it("sequences should not fire subsequences", function() {
            var spy1 = sinon.spy();
            var spy2 = sinon.spy();

            Combokeys.bind("a b c", spy1);
            Combokeys.bind("b c", spy2);

            KeyEvent.simulate("A".charCodeAt(0), 65);
            KeyEvent.simulate("B".charCodeAt(0), 66);
            KeyEvent.simulate("C".charCodeAt(0), 67);

            expect(spy1.callCount).to.equal(1, "`a b c` should fire");
            expect(spy2.callCount).to.equal(0, "`b c` should not fire");

            spy1.reset();
            spy2.reset();
            Combokeys.bind("option b", spy1);
            Combokeys.bind("a option b", spy2);

            KeyEvent.simulate("A".charCodeAt(0), 65);
            KeyEvent.simulate(0, 18, ["alt"]);
            KeyEvent.simulate("B".charCodeAt(0), 66);

            expect(spy1.callCount).to.equal(0, "`option b` should not fire");
            expect(spy2.callCount).to.equal(1, "`a option b` should fire");
        });

        it("rebinding same sequence should override previous", function() {
            var spy1 = sinon.spy();
            var spy2 = sinon.spy();
            Combokeys.bind("a b c", spy1);
            Combokeys.bind("a b c", spy2);

            KeyEvent.simulate("a".charCodeAt(0), 65);
            KeyEvent.simulate("b".charCodeAt(0), 66);
            KeyEvent.simulate("c".charCodeAt(0), 67);

            expect(spy1.callCount).to.equal(0, "first callback should not fire");
            expect(spy2.callCount).to.equal(1, "second callback should fire");
        });

        it("broken sequences", function() {
            var spy = sinon.spy();
            Combokeys.bind("h a t", spy);

            KeyEvent.simulate("h".charCodeAt(0), 72);
            KeyEvent.simulate("e".charCodeAt(0), 69);
            KeyEvent.simulate("a".charCodeAt(0), 65);
            KeyEvent.simulate("r".charCodeAt(0), 82);
            KeyEvent.simulate("t".charCodeAt(0), 84);

            expect(spy.callCount).to.equal(0, "sequence for `h a t` should not fire for `h e a r t`");
        });

        it("sequences containing combos should work", function() {
            var spy = sinon.spy();
            Combokeys.bind("a ctrl+b", spy);

            KeyEvent.simulate("a".charCodeAt(0), 65);
            KeyEvent.simulate("B".charCodeAt(0), 66, ["ctrl"]);

            expect(spy.callCount).to.equal(1, "`a ctrl+b` should fire");

            Combokeys.unbind("a ctrl+b");

            spy = sinon.spy();
            Combokeys.bind("ctrl+b a", spy);

            KeyEvent.simulate("b".charCodeAt(0), 66, ["ctrl"]);
            KeyEvent.simulate("a".charCodeAt(0), 65);

            expect(spy.callCount).to.equal(1, "`ctrl+b a` should fire");
        });

        it("sequences starting with spacebar should work", function() {
            var spy = sinon.spy();
            Combokeys.bind("a space b c", spy);

            KeyEvent.simulate("a".charCodeAt(0), 65);
            KeyEvent.simulate(32, 32);
            KeyEvent.simulate("b".charCodeAt(0), 66);
            KeyEvent.simulate("c".charCodeAt(0), 67);

            expect(spy.callCount).to.equal(1, "`a space b c` should fire");
        });

        it("konami code", function() {
            var spy = sinon.spy();
            Combokeys.bind("up up down down left right left right b a enter", spy);

            KeyEvent.simulate(0, 38);
            KeyEvent.simulate(0, 38);
            KeyEvent.simulate(0, 40);
            KeyEvent.simulate(0, 40);
            KeyEvent.simulate(0, 37);
            KeyEvent.simulate(0, 39);
            KeyEvent.simulate(0, 37);
            KeyEvent.simulate(0, 39);
            KeyEvent.simulate("b".charCodeAt(0), 66);
            KeyEvent.simulate("a".charCodeAt(0), 65);
            KeyEvent.simulate(0, 13);

            expect(spy.callCount).to.equal(1, "konami code should fire");
        });

        it("sequence timer resets", function() {
            var spy = sinon.spy();
            var clock = sinon.useFakeTimers();

            Combokeys.bind("h a t", spy);

            KeyEvent.simulate("h".charCodeAt(0), 72);
            clock.tick(600);
            KeyEvent.simulate("a".charCodeAt(0), 65);
            clock.tick(900);
            KeyEvent.simulate("t".charCodeAt(0), 84);

            expect(spy.callCount).to.equal(1, "sequence should fire after waiting");
            clock.restore();
        });

        it("sequences timeout", function() {
            var spy = sinon.spy();
            var clock = sinon.useFakeTimers();

            Combokeys.bind("g t", spy);
            KeyEvent.simulate("g".charCodeAt(0), 71);
            clock.tick(1000);
            KeyEvent.simulate("t".charCodeAt(0), 84);

            expect(spy.callCount).to.equal(0, "sequence callback should not fire");
            clock.restore();
        });
    });

    describe("default actions", function() {
        var keys = {
            keypress: [
                ["a", 65],
                ["A", 65, ["shift"]],
                ["7", 55],
                ["?", 191],
                ["*", 56],
                ["+", 187],
                ["$", 52],
                ["[", 219],
                [".", 190]
            ],
            keydown: [
                ["shift+'", 222, ["shift"]],
                ["shift+a", 65, ["shift"]],
                ["shift+5", 53, ["shift"]],
                ["command+shift+p", 80, ["meta", "shift"]],
                ["space", 32],
                ["left", 37]
            ]
        };

        function getCallback(key, keyCode, type, modifiers) {
            return function() {
                var spy = sinon.spy();
                Combokeys.bind(key, spy);

                KeyEvent.simulate(key.charCodeAt(0), keyCode, modifiers);
                expect(spy.callCount).to.equal(1);
                expect(spy.args[0][0].type).to.equal(type);
            };
        }

        for (var type in keys) {
            for (var i = 0; i < keys[type].length; i++) {
                var key = keys[type][i][0];
                var keyCode = keys[type][i][1];
                var modifiers = keys[type][i][2] || [];
                it("\"" + key + "\" uses \"" + type + "\"", getCallback(key, keyCode, type, modifiers));
            }
        }
    });
});

describe("Combokeys.unbind", function() {
    "use strict";
    it("unbind works", function() {
        var spy = sinon.spy();
        Combokeys.bind("a", spy);
        KeyEvent.simulate("a".charCodeAt(0), 65);
        expect(spy.callCount).to.equal(1, "callback for a should fire");

        Combokeys.unbind("a");
        KeyEvent.simulate("a".charCodeAt(0), 65);
        expect(spy.callCount).to.equal(1, "callback for a should not fire after unbind");
    });

    it("unbind accepts an array", function() {
        var spy = sinon.spy();
        Combokeys.bind(["a", "b", "c"], spy);
        KeyEvent.simulate("a".charCodeAt(0), 65);
        KeyEvent.simulate("b".charCodeAt(0), 66);
        KeyEvent.simulate("c".charCodeAt(0), 67);
        expect(spy.callCount).to.equal(3, "callback should have fired 3 times");

        Combokeys.unbind(["a", "b", "c"]);
        KeyEvent.simulate("a".charCodeAt(0), 65);
        KeyEvent.simulate("b".charCodeAt(0), 66);
        KeyEvent.simulate("c".charCodeAt(0), 67);
        expect(spy.callCount).to.equal(3, "callback should not fire after unbind");
    });
});