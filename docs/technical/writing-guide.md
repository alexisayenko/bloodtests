# Writing Guide for Analysis Descriptions

## Simple Description (`info.description`)

The simple description explains the analysis to a regular person — not a doctor, not a scientist. It should feel like a smart friend explaining what this blood marker means and why your body cares about it.

### Rules:
1. **Simple, understandable language** — no medical jargon without explanation
2. **Explain the physiological meaning** — what does this substance actually DO in the body?
3. **Explain the biological role** — why does the body produce/need it? What happens when it's too high or too low?
4. **Deep functional meaning** — not just "what it is" but "how it fits into the bigger picture of health"
5. **2-3 sentences max** — concise but rich in meaning
6. **Use metaphors and analogies** where they help (e.g., "insulin acts like a key that unlocks cells")

### Good example (TSH):
> "The brain's command signal to your thyroid — produced by the pituitary gland, it tells the thyroid how much hormone to make. When thyroid hormones drop, TSH rises to push the thyroid harder; when they're too high, TSH falls. This makes TSH the single most sensitive indicator of thyroid function."

### Bad example (old style):
> "Pituitary hormone that controls thyroid gland activity and hormone production."

### What makes the good example better:
- Uses a metaphor ("command signal")
- Explains the feedback loop (rises when hormones drop, falls when too high)
- Tells you WHY it matters ("most sensitive indicator")
- A normal person can understand it without medical training

## Scientific Description (`info.scientific`)

Taken from the LOINC website (Part Description) or equivalent medical references. This is the technical/biochemical description for medical professionals.

### Rules:
1. Proper medical/scientific terminology
2. Describe the analyte's biochemistry and physiological role
3. Include clinical significance
4. 2-5 sentences
5. Source: LOINC Part Descriptions (loinc.org) when available

## Why Field (`info.why`)

One sentence explaining when/why a doctor would order this test.

## Frequency Field (`info.frequency`)

How often to measure. Format: "Do it: [frequency]" — the "Do it:" prefix is added by the renderer.

## Translations (`info.lang.ru-RU`, `info.lang.uk-UA`)

Translations must match the DEPTH and QUALITY of the English text. Not shortened summaries — full translations with proper medical terminology in each language.

## Panels completed:
- [x] Thyroid Function (7 analyses)
- [x] Glucose Metabolism (9 analyses)
- [ ] Liver Function (14 analyses)
- [ ] Lipid Metabolism (8 analyses)
- [ ] Cardiovascular and Inflammatory Risk (9 analyses)
- [ ] HPG Axis (9 analyses)
- [ ] Vitamins, Minerals and Electrolytes (15 analyses)
- [ ] Iron Metabolism (9 analyses)
- [ ] Kidney Function (5 analyses)
- [ ] Coagulation (8 analyses)
- [ ] General Inflammatory Markers (3 analyses)
- [ ] HPA Axis (2 analyses)
- [ ] Other Markers (5 analyses)
- [ ] Full Blood Count (25 analyses)
