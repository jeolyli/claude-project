## canvas
- viewBox: 0 0 1280 720
- format: PPT 16:9

## colors
- bg: #FAFBFD
- secondary_bg: #F0F2F7
- primary: #1565C0
- accent: #FF85A2
- text: #1E293B
- text_secondary: #64748B
- border: #E2E8F0
- success: #16A34A
- warning: #DC2626

## typography
- title_family: Georgia, "Microsoft YaHei", serif
- body_family: "Microsoft YaHei", "PingFang SC", Arial, sans-serif
- emphasis_family: Georgia, "Microsoft YaHei", serif
- code_family: Consolas, "Courier New", monospace
- body: 20
- title: 36
- subtitle: 26
- annotation: 15
- cover_title: 60
- chapter_title: 40
- hero_number: 48

## icons
- library: phosphor-duotone
- inventory: target, users, cube, gear, chart-line-up, file-text, share-network, chat-circle, calendar, shield-warning, check-circle, arrow-right

## page_rhythm
- P01: anchor
- P02: dense
- P03: breathing
- P04: dense
- P05: dense
- P06: dense
- P07: dense
- P08: dense
- P09: dense
- P10: dense
- P11: breathing
- P12: dense

## page_charts
- P05: icon_grid
- P07: chevron_process
- P12: consulting_table

## forbidden
- Mixing icon libraries
- rgba()
- `<style>`, `class`, `<foreignObject>`, `textPath`, `@font-face`, `<animate*>`, `<script>`, `<iframe>`, `<symbol>`+`<use>`
- `<g opacity>` (set opacity on each child element individually)
- HTML named entities in text — write as raw Unicode; XML reserved chars `& < > " '` escaped as `&amp; &lt; &gt; &quot; &apos;`
