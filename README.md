# NPF Rule — star-trail exposure calculator

A single self-contained HTML page that works out the longest exposure you can shoot
on a fixed tripod before the stars trail. No build step, no dependencies, no network:
open the file and it runs.

**→ [Open the calculator](https://miranukke.github.io/npf/)**

---

## Credit

The NPF rule was devised by **Frédéric Michaud** for the
**[Société Astronomique du Havre](https://www.sahavre.fr/)** (SAH), for photographers
and amateur astronomers.

> No commercial use is allowed, and no claim of authorship. Any work built on this
> formula must credit the author and the SAH.

That condition is inherited by this repository. The original page went offline; this
is a rebuild of it, preserved from the
[Internet Archive snapshot](https://web.archive.org/web/20200220123345/https://www.sahavre.fr/tutoriels/astrophoto/34-regle-npf-temps-de-pose-pour-eviter-le-file-d-etoiles)
of the 2016 version (v1.33).

## What it does

Enter your camera, lens and where you are pointing, and it gives you the exposure
limit — using the full NPF formula, not the simplified one:

$$t_s \approx \frac{0.100 \cdot f_{mm} + 16.85 \cdot N + 13.71 \cdot p_{\mu m}}{f_{mm} \cdot \cos \delta}$$

- **Nine-point grid** across the frame, because the corner of a wide-angle shot sits
  at a very different declination from the centre — the tightest point is what binds.
- Accounts for **anamorphosis**, the geometric stretch that shows up at short focal lengths.
- Knows about **monochrome, Foveon and debayered sensors**, which drop the demosaicing
  term and roughly double the allowed exposure.
- Shows the **500 rule** alongside, so you can see how badly it overstates things on a
  modern high-resolution sensor.
- Suggests the **nearest real shutter setting**, always rounding *down* so you never
  exceed the limit.

## Camera database

**607 bodies across 19 brands.**

| | |
|---|---|
| 406 | original SAH data set (v1.33, April 2016) — unmodified |
| 201 | released 2016–2026, added here |

Pixel pitch for the additions is derived as `sensor width ÷ pixel width`, which is how
the original author derived his. That keeps pitch, crop factor and field of view
mutually consistent. Spot-checked against published figures — Nikon Z8 4.35 µm,
Fujifilm X-T5 3.04 µm, Sony A7R V 3.76 µm, Canon R5 4.39 µm — all within 1%.

The additions are mine, not the SAH's. If you spot a wrong sensor, the data sits near
the top of the `<script>` block in `index.html` as a plain array:

```js
// [name, pixel pitch µm, width px, height px, sensor: c = Bayer | m = mono | f = Foveon]
["EOS R5", 4.39, 8192, 5464, "c"]
```

If your body is not listed, pick **Other / manual entry** and type the sensor in by hand.

## Other things it does

- **French, English and Russian**, including the full derivation of the formula.
- **Dark, light and red night-vision themes** — the red one is for use in the field,
  where white light wrecks your dark adaptation.
- **Works offline.** A service worker caches the app on first visit, so it keeps
  working with no signal — which is the whole point at a dark site.
- **Add to Home Screen** on iOS and Android: opens full-screen with its own icon.
- Remembers your camera and settings between visits.

## Installing it on a phone

Open <https://miranukke.github.io/npf/> and use **Share → Add to Home Screen** (iOS,
in Safari) or **Install app** (Android). It gets its own icon, launches without
browser chrome, and runs offline from then on.

## Files

| | |
|---|---|
| `index.html` | the entire application — open it straight off disk and it works |
| `sw.js` | service worker; cache-first with a background refresh |
| `manifest.webmanifest` | name, colours and icons for the installed app |
| `icon-*.png` | launcher icons, including a maskable one for Android |

Only `index.html` is required. The rest exist so the page can be installed and run
offline; without them it still behaves exactly the same, just online-only.

After changing `index.html`, bump `VERSION` in `sw.js` so installed copies pick the
new build up.

## Verification

The maths is a transcription of the original 2016 JavaScript, checked against it by
running both and diffing the output:

- **6,000 randomised cases** across all 607 bodies → identical to the digit
- **3,750 end-to-end comparisons** driving the real UI and reading the rendered text → identical

The original's literal `3.14159` is kept deliberately; substituting `Math.PI` shifts the
results.

## Running it locally

There is nothing to install. Open `index.html` in a browser, or serve the folder:

```bash
python -m http.server 8000
```
