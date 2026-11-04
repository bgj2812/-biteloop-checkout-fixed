// Arjun's tests for the pricing. They pass.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { quote, gstOf } from "../src/pricing.js";

const read = (name) => JSON.parse(readFileSync(new URL(`../data/${name}`, import.meta.url), "utf8"));
const catalogue = { menu: read("menu.json"), coupons: read("coupons.json"), config: read("config.json") };

test("a big order delivers free", () => {
  const order = {"id":"TEST-1","placed_at":"2026-10-19T06:38:00Z","items":[{"item_id":"ALO-PRT","qty":1},{"item_id":"GLB-JMN","qty":1},{"item_id":"MNI-THL","qty":2}],"coupon":null};
  assert.equal(quote(order, catalogue).total, 62580);
});

test("a small order pays for delivery", () => {
  const order = {"id":"TEST-2","placed_at":"2026-10-19T09:14:00Z","items":[{"item_id":"PAV-BHJ","qty":1}],"coupon":null};
  assert.equal(quote(order, catalogue).total, 20195);
});

test("an expired coupon takes nothing off", () => {
  const order = {"id":"TEST-3","placed_at":"2026-10-19T08:21:00Z","items":[{"item_id":"EGG-CRY","qty":2},{"item_id":"MNI-THL","qty":1},{"item_id":"PNR-BTM","qty":1}],"coupon":"DUSSEHRA20"};
  assert.equal(quote(order, catalogue).total, 89880);
});


test("coupon expiry uses the India calendar date", () => {
  const order = {"id":"IST-BOUNDARY","placed_at":"2026-10-18T20:00:00Z","items":[{"item_id":"EGG-CRY","qty":1}],"coupon":"DUSSEHRA20"};
  // 20:00 UTC is 01:30 on 19 October in India, after the 18 October expiry.
  assert.equal(quote(order, catalogue).discount, 0);
});

test("percentage coupon respects its maximum discount", () => {
  const order = {"id":"COUPON-CAP","placed_at":"2026-10-19T06:38:00Z","items":[{"item_id":"FSH-THL","qty":3}],"coupon":"FIRST50"};
  assert.equal(quote(order, catalogue).discount, 10000);
});

test("GST rounds to nearest paisa, with half a paisa up", () => {
  assert.equal(gstOf(10), 1);
  assert.equal(gstOf(30), 2);
});
