import assert from "node:assert/strict";
import test from "node:test";
import { mapScrollPosition } from "../lib/scroll-sync";

test("without anchors the panes scroll proportionally", () => {
  assert.equal(mapScrollPosition(50, [], 100, 300), 150);
});

test("anchors align exactly and positions between them are interpolated", () => {
  const anchors = [{ from: 40, to: 200 }];
  assert.equal(mapScrollPosition(40, anchors, 100, 300), 200);
  assert.equal(mapScrollPosition(20, anchors, 100, 300), 100);
  assert.equal(mapScrollPosition(70, anchors, 100, 300), 250);
});

test("both ends always align and positions are clamped", () => {
  assert.equal(mapScrollPosition(-10, [{ from: 40, to: 200 }], 100, 300), 0);
  assert.equal(mapScrollPosition(150, [{ from: 40, to: 200 }], 100, 300), 300);
  assert.equal(mapScrollPosition(10, [], 0, 300), 0);
});

test("anchors that run backwards, repeat or fall outside the panes are ignored without throwing", () => {
  const anchors = [{ from: Number.NaN, to: 5 }, { from: 60, to: 100 }, { from: 40, to: 210 }, { from: 40, to: 200 }, { from: 90, to: 900 }];
  let previous = -1;
  for (let position = 0; position <= 100; position += 5) {
    const mapped = mapScrollPosition(position, anchors, 100, 300);
    assert.ok(mapped >= previous && mapped >= 0 && mapped <= 300, `${position} -> ${mapped}`);
    previous = mapped;
  }
  assert.equal(mapScrollPosition(40, anchors, 100, 300), 200);
});
