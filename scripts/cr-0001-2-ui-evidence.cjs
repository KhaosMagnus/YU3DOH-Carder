const assert = require("node:assert/strict"),
  fs = require("node:fs/promises"),
  path = require("node:path");
const { execFileSync } = require("node:child_process");
const { chromium } = require("playwright-core");
const output = process.env.YU3DOH_QA_OUTPUT;
if (!output) throw Error("YU3DOH_QA_OUTPUT required");
const sha = execFileSync("git", ["rev-parse", "HEAD"], {
  encoding: "utf8",
}).trim();
async function api(route, payload) {
  const r = await fetch(
    "http://127.0.0.1:4312" + route,
    payload
      ? {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        }
      : undefined,
  );
  assert(r.ok, await r.clone().text());
  return r.json();
}
async function run() {
  await fs.mkdir(output, { recursive: true });
  const info = await api("/api/v1/workspace/_qa/info");
  assert.equal(info.sha, sha);
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.YU3DOH_QA_CHROMIUM
      ? { executablePath: process.env.YU3DOH_QA_CHROMIUM }
      : {}),
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage({
    viewport: { width: 1500, height: 1100 },
  });
  const requests = [],
    cases = [],
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("request", (r) => {
    if (r.method() === "PATCH")
      requests.push({ url: r.url(), body: r.postDataJSON() });
  });
  const button = (name) => page.getByRole("button", { name, exact: true });
  const input = (name) =>
    page
      .locator(".library-editor-form")
      .getByRole("spinbutton", { name, exact: true });
  const pass = (name) => {
    cases.push({ name, result: "PASS", sha });
    console.log("CR-0001.2 " + name + " PASS");
  };
  const screenshot = (name) =>
    page.screenshot({ path: path.join(output, name + ".png"), fullPage: true });
  const open = async (key) => {
    await page.goto("http://127.0.0.1:3000/ygocarder/library/");
    await page
      .locator(".library-card")
      .filter({ has: page.getByRole("heading", { name: key, exact: true }) })
      .click();
    await button("Edit").click();
    await page.locator(".library-editor-form").waitFor();
  };
  const save = async (key) => {
    const wait = page.waitForResponse(
      (r) =>
        r.request().method() === "PATCH" &&
        new URL(r.url()).pathname ===
          "/api/v1/library/cards/" + info.cards[key],
    );
    await button("Save").click();
    const r = await wait;
    assert.equal(r.status(), 200, await r.text());
    await button("Edit").waitFor();
    return { request: r.request().postDataJSON(), response: await r.json() };
  };
  const proofs = {};
  try {
    for (const [key, field, max, invalid] of [
      ["MAIN", "Level", 12, 18],
      ["XYZ", "Rank", 13, 14],
      ["TOKEN", "Level", 12, 13],
    ]) {
      await open(key);
      const control = input(field);
      for (const [attr, value] of [
        ["min", "0"],
        ["max", String(max)],
        ["step", "1"],
      ])
        assert.equal(await control.getAttribute(attr), value);
      // Native keyboard spinners stop at the advertised boundaries.
      await control.fill(String(max));
      await control.press("ArrowUp");
      assert.equal(await control.inputValue(), String(max));
      await control.fill("0");
      await control.press("ArrowDown");
      assert.equal(await control.inputValue(), "0");
      for (const value of [String(invalid), "-6"]) {
        await control.fill(value);
        await control.blur();
        assert.equal(await control.inputValue(), value);
        assert.equal(await control.getAttribute("aria-invalid"), "true");
        const count = requests.length;
        await button("Save").click();
        await page.getByText("Save failed", { exact: true }).waitFor();
        assert.equal(requests.length, count);
        await screenshot(key + "-invalid-" + value);
      }
      pass(key + " bounds, arrows, typed invalid/no-clamp/no-PATCH");
      for (const value of [String(max), "0", ""]) {
        await control.fill(value);
        const proof = await save(key);
        const expected = value === "" ? null : Number(value);
        assert.equal(proof.response.structure[field.toLowerCase()], expected);
        const reload = await api("/api/v1/library/cards/" + info.cards[key]);
        assert.equal(reload.structure[field.toLowerCase()], expected);
        proofs[key + "-" + (value || "null")] = proof;
        await button("Edit").click();
        assert.equal(await control.inputValue(), value);
      }
      await screenshot(key + "-null-reopen");
      pass(key + " max/zero/null persistence and reopen");
    }
    await open("Historical");
    assert.equal(await input("Level").inputValue(), "18");
    await page
      .getByRole("alert")
      .filter({ hasText: "Out-of-domain" })
      .waitFor();
    await screenshot("historical-exact-18");
    const historical = await api(
      "/api/v1/library/cards/" + info.cards.Historical,
    );
    const review = await api(
      `/api/v1/library/cards/${info.cards.Historical}/confirmation-review`,
      { expected_revision: historical.revision, block: "STRUCTURE" },
    );
    assert.equal(review.validation.code, "DOMAIN_VALIDATION");
    assert.match(review.validation.message, /level.*0\.\.12/);
    proofs.historical_review = review;
    const nameInput = page
      .locator(".library-localization")
      .first()
      .locator("label")
      .filter({ hasText: /^\s*Name/ })
      .locator("input");
    await nameInput.fill("Historical text updated");
    const textSave = await save("Historical");
    assert.equal("structure" in textSave.request, false);
    assert.equal(textSave.response.structure.level, 18);
    proofs.historical_text = textSave;
    await button("Edit").click();
    assert.equal(await input("Level").inputValue(), "18");
    const password = page
      .locator(".library-editor-form label")
      .filter({ hasText: /^\s*Password/ })
      .locator("input");
    await password.fill("87654321");
    let count = requests.length;
    await button("Save").click();
    await page.getByText("Save failed", { exact: true }).waitFor();
    assert.equal(requests.length, count);
    await password.fill("12345678");
    // A structural change that leaves Level invalid is also rejected locally.
    const atk = page
      .locator(".library-editor-form label")
      .filter({ hasText: /^\s*ATK/ })
      .locator("input");
    await atk.fill("10");
    count = requests.length;
    await button("Save").click();
    assert.equal(requests.length, count);
    await input("Level").fill("12");
    const repaired = await save("Historical");
    assert.equal(repaired.response.structure.level, 12);
    const repairedReview = await api(
      `/api/v1/library/cards/${info.cards.Historical}/confirmation-review`,
      { expected_revision: repaired.response.revision, block: "STRUCTURE" },
    );
    assert.equal(repairedReview.validation.status, "PASS");
    proofs.repaired_review = repairedReview;
    pass(
      "historical exact value, TEXT-only save, password/structure gate, repair and Review",
    );
    for (const value of [18, 12]) {
      const card = await api("/api/v1/library/cards/" + info.cards.External);
      const preview = await api(
        `/api/v1/library/external-sources/candidates/${info.candidates[value]}/preview-structure`,
        {
          target_card_id: card.card_id,
          target_expected_revision: card.revision,
        },
      );
      assert.equal(preview.decision, value === 18 ? "INELIGIBLE" : "READY");
      if (value === 18)
        assert(preview.reason_codes.includes("STRUCTURE_VALUE_INVALID"));
      proofs["external-" + value] = preview;
    }
    pass("External Preview 18 ineligible / 12 eligible");
    assert.equal(
      (await api("/api/v1/workspace/_qa/info")).provider_requests,
      0,
    );
    assert.deepEqual(errors, []);
    await fs.writeFile(
      path.join(output, "evidence.json"),
      JSON.stringify(
        { sha, cases, proofs, requests, errors, provider_requests: 0 },
        null,
        2,
      ),
    );
  } finally {
    await browser.close();
  }
}
run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
