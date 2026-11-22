import { chromium, expect } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

const base = process.env.TEST_URL || "http://localhost:4173";
const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 960 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();
page.setDefaultTimeout(7000);
const errors = [],
  external = [],
  checks = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
page.on("request", (r) => {
  if (
    !r.url().startsWith(base) &&
    !r.url().startsWith("data:") &&
    !r.url().startsWith("blob:")
  )
    external.push(r.url());
});
const test = async (name, fn) => {
  await fn();
  checks.push(name);
  console.log("PASS", name);
};
const goto = async (path = "/dashboard") => {
  await page.goto(base + path, { waitUntil: "networkidle" });
};
const dialog = () => page.getByRole("dialog");
const close = async () => {
  await page.getByRole("button", { name: "Close dialog", exact: true }).click();
  await expect(dialog()).toHaveCount(0);
};
const local = () =>
  page.evaluate(() =>
    JSON.parse(localStorage.getItem("nalyanya.workspace.v1")),
  );
const confirm = async () => {
  await dialog()
    .getByRole("button", { name: "Review preview", exact: true })
    .click();
  await dialog()
    .getByRole("button", { name: "Confirm simulation", exact: true })
    .click();
  await expect(
    page.getByText("Your preview is ready.", { exact: true }),
  ).toBeVisible();
};
const noOverflow = async () =>
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
await mkdir(".artifacts", { recursive: true });
try {
  await test("Desktop command center has 13 sections and local photography", async () => {
    await goto("/");
    await expect(
      page.getByRole("heading", { name: "Welcome home, Brian." }),
    ).toBeVisible();
    expect(await page.locator("main section").count()).toBe(13);
    await page.waitForTimeout(700);
    await page.screenshot({ path: ".artifacts/desktop-final.png" });
    await noOverflow();
  });
  await test("The eight-blade shutter closes, changes photographs, and opens", async () => {
    const img = page.locator(".ny-welcome-hero .ny-lens-image");
    const first = await img.getAttribute("src");
    await page.getByRole("button", { name: "Next photograph" }).click();
    await expect(page.locator(".ny-welcome-hero .ny-shutter")).toBeVisible();
    await page.waitForTimeout(200);
    await page
      .locator(".ny-welcome-hero")
      .screenshot({ path: ".artifacts/shutter-in-motion.png" });
    await expect(img).not.toHaveAttribute("src", first);
    await page.waitForTimeout(800);
    await page.getByRole("button", { name: "Previous photograph" }).click();
    await expect(img).toHaveAttribute("src", first);
    await page.waitForTimeout(450);
  });
  await test("Command search finds people and supports Escape", async () => {
    await page.keyboard.press("Control+k");
    await page
      .getByRole("textbox", { name: "Search everything" })
      .fill("Faith");
    await dialog()
      .getByRole("button", { name: "Faith Chebet Nalyanya" })
      .click();
    await expect(
      dialog().getByRole("heading", { name: "Faith Chebet Nalyanya" }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog()).toHaveCount(0);
  });
  await test("Branch selection scopes the dashboard and survives reload", async () => {
    await page.getByRole("button", { name: "Switch family branch" }).click();
    await dialog()
      .getByRole("button", { name: "Nairobi 34 family members" })
      .click();
    await expect(page).toHaveURL(/branch=nairobi/);
    await expect(page.locator(".ny-stat-value").first()).toHaveText("34");
    await page.reload();
    await expect(page.locator(".ny-stat-value").first()).toHaveText("34");
    await page.getByRole("button", { name: "Switch family branch" }).click();
    await dialog()
      .getByRole("button", {
        name: "All family branches 248 members across 12 branches",
      })
      .click();
  });
  await test("Money form validates, reviews, simulates, and persists a balanced wallet delta", async () => {
    await page
      .getByRole("button", { name: "Quick actions", exact: true })
      .click();
    await dialog()
      .getByRole("button", { name: /Deposit funds/ })
      .click();
    await dialog().getByRole("spinbutton").fill("5750");
    await dialog().getByRole("textbox").fill("123");
    await dialog().getByRole("button", { name: "Review preview" }).click();
    await expect(dialog().getByRole("alert")).toContainText(
      "Kenyan demo number",
    );
    await dialog().getByRole("textbox").fill("0700000001");
    await confirm();
    expect((await local()).entries[0].delta).toBe(5750);
    await dialog()
      .getByRole("button", { name: "View simulation record" })
      .click();
    await expect(
      dialog().getByText("Simulation record", { exact: true }),
    ).toBeVisible();
    await close();
    await page.reload();
    await expect(page.locator(".ny-stat-value").nth(1)).toContainText(
      "1,290,250",
    );
  });
  await test("Withdraw, internal transfer, allocation and contribution flows", async () => {
    for (const kind of ["withdraw", "transfer", "allocate", "contribute"]) {
      await goto(`/dashboard?panel=${kind}`);
      await dialog().getByRole("spinbutton").fill("1000");
      await confirm();
      expect((await local()).entries[0].kind).toBe(kind);
    }
    const records = (await local()).entries;
    expect(records.find((e) => e.kind === "withdraw").delta).toBe(-1000);
    expect(records.find((e) => e.kind === "transfer").delta).toBe(0);
  });
  await test("M-Pesa preview enforces branch-specific funds", async () => {
    await goto("/dashboard?branch=diaspora&panel=withdraw");
    await dialog().getByRole("spinbutton").fill("100000");
    await dialog().getByRole("button", { name: "Review preview" }).click();
    await expect(dialog().getByRole("alert")).toContainText(
      "available demo balance",
    );
  });
  await test("WhatsApp, SMS and broadcast previews never send messages", async () => {
    for (const kind of ["whatsapp", "sms", "broadcast"]) {
      await goto(`/dashboard?panel=${kind}`);
      await dialog()
        .getByRole("textbox")
        .fill("Hello family, let us meet at the homestead.");
      await confirm();
      await expect(dialog()).toContainText("No messages were sent");
    }
  });
  await test("Drive folder validates and simulates without OAuth or file access", async () => {
    await goto("/dashboard?panel=drive");
    await dialog().getByRole("button", { name: "Use a sample folder" }).click();
    await confirm();
    await expect(dialog()).toContainText("No account was connected");
  });
  await test("New gathering, RSVP persistence and calendar export", async () => {
    await goto("/dashboard?panel=event-create");
    await dialog()
      .getByLabel("Gathering name")
      .fill("Family archive afternoon");
    await dialog()
      .getByLabel("Location", { exact: true })
      .fill("Bungoma homestead");
    await dialog().getByRole("button", { name: "Review gathering" }).click();
    await dialog().getByRole("button", { name: "Save gathering" }).click();
    await dialog().getByRole("button", { name: "View gathering" }).click();
    await dialog().getByRole("button", { name: "Going", exact: true }).click();
    await expect(
      dialog().getByRole("button", { name: "Going", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    const download = page.waitForEvent("download");
    await dialog()
      .getByRole("button", { name: /Add to my calendar/ })
      .click();
    expect((await download).suggestedFilename()).toMatch(/\.ics$/);
    await page.reload();
    await expect(
      dialog().getByRole("button", { name: "Going", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
  });
  await test("Memory lightbox preserves its URL, bookmark, and shutter navigation", async () => {
    await goto("/dashboard/gallery?panel=memory&id=reunion");
    await dialog().getByRole("button", { name: "Save memory" }).click();
    await expect(
      dialog().getByRole("button", { name: "Saved", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await dialog().getByRole("button", { name: "Next photograph" }).click();
    await expect(page).toHaveURL(/id=highlands/);
    await page.reload();
    await expect(
      dialog().getByRole("heading", { name: "A way back home" }),
    ).toBeVisible();
    await close();
    await page.getByRole("button", { name: "Saved memories (1)" }).click();
    await expect(page.locator(".ny-gallery-grid>button")).toHaveCount(1);
  });
  await test("Notifications support acknowledgements and safe dismissal", async () => {
    await goto("/dashboard?panel=notifications");
    await dialog().getByRole("button", { name: "Mark all read" }).click();
    await dialog().getByRole("button", { name: "Show unread only" }).click();
    await expect(dialog()).toContainText("You are all caught up");
    await dialog().getByRole("button", { name: "Show all updates" }).click();
    await dialog()
      .getByRole("button", { name: /Contributions to review/ })
      .click();
    await dialog().getByRole("button", { name: "Dismiss update" }).click();
    expect((await local()).dismissed).toContain("verify");
  });
  await test("All sixteen grouped dashboard routes render real content", async () => {
    for (const slug of [
      "",
      "lineage",
      "members",
      "events",
      "gallery",
      "obituaries",
      "contributions",
      "finances",
      "finance-access",
      "loans",
      "foundation",
      "records",
      "professions",
      "communications",
      "account",
      "settings",
    ]) {
      const res = await page.goto(
        base + "/dashboard" + (slug ? "/" + slug : ""),
      );
      expect(res.status()).toBe(200);
      await expect(page.locator("main h1")).toBeVisible();
      expect(await page.locator("main").innerText()).not.toMatch(
        /not found|find your way home/i,
      );
      await noOverflow();
    }
  });
  await test("Drilldowns and review panels are directly addressable", async () => {
    const panels = {
      health: "",
      wallet: "",
      members: "",
      events: "",
      family: "",
      contributions: "",
      branch: "bungoma",
      chama: "wazee",
      loan: "",
      allocation: "",
      shares: "",
      cause: "education",
      alert: "rotate",
      contribution: "NY-CON-01048",
      member: "NY-MBR-00003",
      event: "NY-EVT-0001",
      calendar: "",
      about: "",
      profile: "",
    };
    for (const [panel, id] of Object.entries(panels)) {
      await page.goto(
        `${base}/dashboard?panel=${panel}${id ? "&id=" + id : ""}`,
      );
      await expect(dialog()).toBeVisible();
      await expect(dialog()).not.toContainText("This record was not found");
    }
  });
  await test("Browser back closes a deep-linked overlay", async () => {
    await goto("/dashboard");
    await page
      .getByRole("button", { name: "Quick actions", exact: true })
      .click();
    await expect(dialog()).toBeVisible();
    await page.goBack();
    await expect(dialog()).toHaveCount(0);
  });
  await test("Responsive layouts at 360, 390, 768, 1024, and 1440 pixels", async () => {
    await goto("/dashboard");
    for (const width of [360, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 844 });
      await page.waitForTimeout(350);
      await noOverflow();
    }
    await page.setViewportSize({ width: 360, height: 800 });
    await page.waitForTimeout(250);
    await page
      .getByRole("button", { name: "Open navigation", exact: true })
      .click();
    await dialog()
      .getByRole("link", { name: "Family members", exact: true })
      .click();
    await expect(page).toHaveURL(/dashboard\/members/);
    await goto("/dashboard");
    await page.screenshot({ path: ".artifacts/mobile-final.png" });
  });
  await test("Elder mode persists with generous controls and a static tree", async () => {
    await page.getByRole("switch", { name: "Elder mode", exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("data-ny-mode", "elder");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-ny-mode", "elder");
    await noOverflow();
    await page.locator(".ny-tree-preview").scrollIntoViewIfNeeded();
    await expect(page.locator(".ny-tree-fallback")).toBeVisible();
    await expect(page.locator(".ny-tree-stage canvas")).toHaveCount(0);
    const h = (await page.locator(".ny-quick-actions").boundingBox()).height;
    expect(h).toBeGreaterThanOrEqual(56);
    await page.getByRole("switch", { name: "Elder mode", exact: true }).click();
  });
  await test("Reduced motion skips the mechanical shutter and uses the SVG tree", async () => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await goto("/dashboard");
    await page.getByRole("button", { name: "Next photograph" }).click();
    await expect(
      page.locator(".ny-welcome-hero .ny-lens-image"),
    ).toHaveAttribute("src", "/images/reunion.webp");
    await expect(
      page.locator(".ny-welcome-hero .ny-shutter"),
    ).not.toBeVisible();
    await page.locator(".ny-tree-preview").scrollIntoViewIfNeeded();
    await expect(page.locator(".ny-tree-fallback")).toBeVisible();
  });
  await test("No external data requests, missing photographs, or browser errors", async () => {
    expect(external).toEqual([]);
    expect(errors).toEqual([]);
    expect(
      await page
        .locator("img")
        .evaluateAll((imgs) =>
          imgs.filter((i) => i.complete && !i.naturalWidth).map((i) => i.src),
        ),
    ).toEqual([]);
  });
  console.log(`Verified ${checks.length} end-to-end checks.`);
} finally {
  await writeFile(
    ".artifacts/verification.json",
    JSON.stringify({ checks, errors, externalRequests: external }, null, 2),
  );
  await browser.close();
}
