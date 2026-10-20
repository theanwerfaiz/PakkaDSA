# Known issues

Open items found during the quality pass. Each has a reason and a suggested next step.

## Hindi pages with large drawings score below 95 for Performance on Lighthouse's simulated phone

The release-gate pages (home, an algorithm page and a track page, mobile profile) score 95–99. The Hindi BFS grid page scores about 88 because its largest text uses the Devanagari handwriting font (Kalam, about 110 KB per weight). Layout shift is 0 and blocking time is low; only the simulated largest paint waits for the font. Options: use Noto Sans Devanagari for Hindi notes (smaller, but loses the handwritten look), or subset Kalam to the glyphs the Hindi text uses. Owner's call; it is a design trade-off.

## English pages download one Devanagari font

The language button shows "हिन्दी" in Devanagari on English pages, which loads Noto Sans Devanagari Medium (about 53 KB). It does not affect the scores above.

## Manual checks the automated suite cannot do

Real-device testing, screen-reader passes and a native-speaker review of the Hindi text are listed in `09_TESTING_AND_QA.md` §2 and are for the owner.
