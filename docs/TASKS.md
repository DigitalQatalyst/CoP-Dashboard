# Position Navigator — Task List
> Compiled: 2026-04-15  
> Source: AUDIT.md  
> Status: Groups A + B + C + D + E + F + G + H complete

Tasks are grouped by area and ordered by impact within each group.  
Each task references its AUDIT.md section for context.

---

## GROUP A — Critical Contradictions & Broken Trust
*Things that show incorrect or contradictory information. Fix these first — they undermine confidence in the data.*

- [x] **A1** — Surface "Closed card + Critical tier" as a distinct visual warning on position cards. *(AUDIT 4.1, 9.2)*
- [x] **A2** — Renamed "Zero-Fill Positions" → "No Active Headcount"; added data-discrepancy note on Filled+zero cards. *(AUDIT 6.1, 9.3)*
- [x] **A3** — Added Backlogged stage to Command Centre funnel list and chart shape. *(AUDIT 3.2, 5.2, 9.4)*
- [x] **A4** — Added amber warning flag with "Exceeds 100%" note on anomalous conversion rows. *(AUDIT 5.4, 9.1)*
- [x] **A5** — `targetStart` parsed from MM.YY to "Oct 2023" format; past dates flagged "Overdue". *(AUDIT 7.4, 9.5)*
- [x] **A6** — P.01 cards with Candidates (Closed) status get amber warning banner. *(AUDIT 7.3)*

---

## GROUP B — Missing Interactivity (Things That Look Clickable But Aren't)
*Elements that have the visual language of interactive components but do nothing.*

- [x] **B1** — At-Risk Register cards were already clickable (audit was incorrect). Verified working. *(AUDIT 6.2)*
- [x] **B2** — Location Distribution rows now toggle as filters; active row highlighted; filter chip shown. *(AUDIT 7.6)*
- [x] **B3** — Initiative Breakdown rows now toggle as filters with active highlight. *(AUDIT 7.6)*
- [x] **B4** — Fixed Command Centre funnel SVG click handler (Recharts entry payload path was wrong). *(AUDIT 3.1)*
- [x] **B5** — HR badge opens popover: role, data source (mock/live), Refresh data button. *(AUDIT 2.6)*
- [x] **B6** — Contractor cards have explicit `cursor-pointer`; full card area is click target. *(AUDIT 7.2)*
- [x] **B7** — Stage drill-down list items now show `›` chevron; studio/BU drill-down items updated too. *(AUDIT 5.6)*

---

## GROUP C — Action Signals Need Actions
*Content that communicates intent but has no follow-through mechanism.*

- [x] **C1** — Attach a copy-to-clipboard button to each Action Signal in the position drill-down so users can extract it for reporting or messaging. *(AUDIT 2.10)*
- [x] **C2** — Evaluate and, if applicable, add a configurable action link (mailto, ATS deep-link, Teams message) to each Action Signal, pre-populated with position name and signal text. *(AUDIT 2.10)*
- [x] **C3** — Add a "Mark as acknowledged" or "Dismiss" mechanism to Action Signals so users can track which signals have been actioned. *(AUDIT 2.10)*

---

## GROUP D — Missing Filters
*Tabs where the user cannot narrow the view to their context.*

- [x] **D1** — Add filter controls to the **Contractors tab**: filter by Priority, Status, Initiative, Location, SFIA Level. *(AUDIT 7.1)*
- [x] **D2** — Add filter controls to the **Pipeline tab**: filter by Studio and/or BU Tower. *(AUDIT — pipeline no filters)*
- [x] **D3** — Add filter controls to the **Gaps tab**: filter by Studio. *(AUDIT 6.6)*
- [x] **D4** — Add a name/keyword search field to the **Contractors tab**. *(AUDIT 2.1, 7.1)*
- [x] **D5** — Add global search (command palette or header search bar) to find any position or contractor by name across all tabs. *(AUDIT 2.1)*

---

## GROUP E — Navigation & Sidebar
*Layout and navigation issues affecting usability.*

- [x] **E1** — Redesign the collapsed sidebar icon set so each icon is distinct and identifiable without labels. Consider replacing generic icons with tab-specific ones (e.g. a pipeline icon for Pipeline, a gap/delta icon for Gaps). *(AUDIT 2.12)*
- [x] **E2** — Add tooltips to collapsed sidebar icon items showing the tab name on hover. *(AUDIT 2.12)*
- [x] **E3** — Reduce "DQ" logo size in collapsed sidebar state. *(AUDIT 2.12)*
- [x] **E4** — Persist sidebar collapse state to `localStorage` so it survives page refresh. *(AUDIT 2.4)*
- [x] **E5** — Add prev/next navigation arrows to the drill-down panel so users can move between records without closing and reopening. Scope: position drill-down, contractor drill-down. *(AUDIT 2.8, 4.8)*
- [x] **E6** — Make the drill-down panel header (title + subtitle + badges) sticky on scroll. *(AUDIT 2.7, 8.1)*
- [x] **E7** — Add a "back to stage list" navigation option inside the position drill-down when reached via a stage drill-down. *(AUDIT 8.3)*
- [x] **E8** — Increase the size / tap target of the drill-down panel close button. *(AUDIT 8.4)*

---

## GROUP F — Visual & UX Polish
*Things that render correctly but communicate poorly or inconsistently.*

- [x] **F1** — Add tooltips or a glossary entry explaining Vacancy Status values: "Vacant (All)" vs "Vacant (Some)" vs "Interim" vs "Departing" vs "TBC". *(AUDIT 2.11)*
- [x] **F2** — Apply stage-specific colors to pipeline breakdown bars in the position drill-down, matching the funnel color coding in Command and Pipeline tabs. *(AUDIT 4.6)*
- [x] **F3** — Apply stage-specific colors to the pipeline spark bars on position cards in the Positions tab. *(AUDIT 4.4)*
- [x] **F4** — Add a zero-state ring treatment for the DXB Studio Capacity Ring (0/14) so it doesn't appear as an unrendered circle. Show a clear "0% filled" visual. *(AUDIT 3.4)*
- [x] **F5** — Increase visual prominence of the Gap figure (-96) under the Fill Rate KPI card on Command. *(AUDIT 3.5)*
- [x] **F6** — Add visual separation (divider, background, or section label) between alert banners and KPI card content on the Command tab. *(AUDIT 3.6)*
- [x] **F7** — Reduce visual repetition of "No pipeline" orange label on Critical position cards — consider an icon badge approach instead of repeated inline text. *(AUDIT 4.2)*
- [x] **F8** — Add a sort control to the Positions tab (sort by: Gap size, Plan FYE, Name, Pipeline count). *(AUDIT 4.3)*
- [x] **F9** — Move or surface the "Show 4 healthy positions" toggle higher / make it more prominent. Consider a count chip in the tier header row rather than a buried toggle. *(AUDIT 4.5)*
- [x] **F10** — Add tooltips to "Plan YTD" and "Plan FYE" labels in the position drill-down stats grid. *(AUDIT 4.7)*
- [x] **F11** — Fix the "Pipeline by Position" bar chart label truncation on the Pipeline tab: add hover tooltips and/or allow the chart to expand vertically. *(AUDIT 5.3)*
- [x] **F12** — Add a tooltip or legend explaining why the Backlogged KPI card renders in amber. *(AUDIT 5.5)*
- [x] **F13** — Add tooltips on hover to BU tower name labels in the Gap Heat Bars (full name on overflow). *(AUDIT 6.4)*
- [x] **F14** — Add a sub-line to the Gaps alert banner showing Plan vs Actual totals (e.g. "Plan: 116 / Actual: 20 / Gap: -96") to give the headline number context. *(AUDIT 6.5)*
- [x] **F15** — Make P.01 Very Urgent section collapsible, consistent with P.02–P.04. *(AUDIT 7.5)*
- [x] **F16** — Render the `taskBacklog` field in the contractor drill-down panel. *(AUDIT 7.7)*

---

## GROUP G — Data & Timestamp Accuracy

- [x] **G1** — Replace "Last updated just now" with an accurate timestamp reflecting the last successful data fetch or the Excel file's last-modified datetime. *(AUDIT 2.5)*
- [x] **G2** — Add a loading/refresh indicator during SWR's 30-second polling cycle so users know when data is being refreshed. *(AUDIT 2.9)*
- [x] **G3** — Add an `.env.example` file documenting `NEXT_PUBLIC_USE_MOCK_DATA` and all required Graph API environment variables. *(AUDIT 9.6)*

---

## GROUP H — Hidden / Orphaned Features

- [x] **H1** — Surface the Import Dialog: add an "Import" button to the dashboard header or Positions tab toolbar that opens `ImportDialog`. *(AUDIT 2.3)*
- [x] **H2** — Surface the dark mode toggle: place `ThemeToggle` in the dashboard header alongside the "HR" badge. *(AUDIT 2.2)*

---

## Summary Count

| Group | Area | Tasks |
|-------|------|-------|
| A | Critical contradictions & broken trust | 6 |
| B | Missing interactivity | 7 |
| C | Action signals | 3 |
| D | Missing filters | 5 |
| E | Navigation & sidebar | 8 |
| F | Visual & UX polish | 16 |
| G | Data & timestamp accuracy | 3 |
| H | Hidden / orphaned features | 2 |
| **Total** | | **50** |

---

*See AUDIT.md for full findings detail behind each task.*
