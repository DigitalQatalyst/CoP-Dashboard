# Position Navigator — UI/UX & Functionality Audit
> Compiled: 2026-04-15  
> Scope: Full live review of all 5 tabs, all drill-downs, codebase scan  
> Status: Findings only — no resolutions applied

---

## 1. App Overview

**Position Navigator** is a DigitalQatalyst workforce intelligence dashboard for FY2026.  
It surfaces two data streams from a Microsoft Excel file via Microsoft Graph API:

- **CoP (Catalogue of Positions)** — 35 internal roles: vacancy status, pipeline stages, headcount plan vs actuals
- **Contractors** — 53 contractor roles across priority buckets and initiatives

**5 tabs:** Command Centre · Positions · Pipeline · Gaps · Contractors  
**Drill-down system:** Right-side Sheet panel, triggered from cards/charts  
**Risk engine:** Classifies positions as Critical / Needs Attention / Healthy  
**Data fallback:** Mock seed data (`/src/data/`) when Graph API is not configured

---

## 2. Cross-Cutting Issues

These affect the entire app regardless of tab.

### 2.1 No Global Search
No way to find a specific position or contractor by name. A user must know which tab it lives on and scan manually. Affects all 5 tabs.

### 2.2 No Dark Mode Toggle in UI
`ThemeProvider` and `theme-toggle.tsx` are wired up and functional in code but the toggle component is not placed anywhere visible in the layout. Users are locked to light mode.

### 2.3 Import Dialog Is Inaccessible
`ImportDialog.tsx` is fully built — drag-and-drop, CSV/Excel preview, column mapping. There is no button or entry point in the UI to open it. Completely dead from the user's perspective.

### 2.4 Sidebar Collapse State Resets on Refresh
Collapse state is stored in React component state only (`navCollapsed` in `DashboardShell.tsx`). Every page reload re-expands the sidebar. Should persist in localStorage.

### 2.5 "Last Updated Just Now" Is Always Stale
The timestamp resets to "just now" on every page load regardless of when the Excel data was last modified. Gives false confidence. Should reflect the actual last-fetch or data-modification timestamp.

### 2.6 "HR" Header Badge Is Inert
Renders as a user avatar/badge in the top-right header. Clicking it does nothing — no profile, no role context, no logout. Looks interactive, functions as decoration.

### 2.7 Drill-Down Panel Header Does Not Stick
When scrolling through a long position or contractor profile in the Sheet panel, the title and subtitle scroll away. Context of what is open is lost mid-scroll.

### 2.8 No Prev/Next Navigation in Drill-Downs
To review multiple items (e.g. all Critical positions) the user must close the panel and reopen it for each one. No arrow/prev/next within the panel.

### 2.9 No Loading/Skeleton State During SWR Refresh
SWR polls every 30 seconds. During refresh there is no indicator beyond "Last updated just now". Can briefly show stale data without signalling it.

### 2.10 Action Signals Have No Action
Position drill-downs surface computed signals:
- *"No candidates in pipeline — open new TG round immediately"*
- *"Card is closed with no candidates — reopen or escalate"*
- *"Pipeline exists but progress is slow — review TG candidates"*

These are read-only strings. There is no button, link, mailto, copy, or acknowledgement mechanism attached to them. They are the most actionable text in the app and the most inert element.

### 2.11 Vacancy Status Labels Are Never Explained
"Vacant (All)", "Vacant (Some)", "Filled", "Interim", "Departing", "TBC" — the distinction between these (especially Vacant All vs Some) is never explained anywhere in the UI. No tooltip, no legend, no glossary.

### 2.12 Collapsed Sidebar Icons Are Not Recognisable
When collapsed, the sidebar shows icon-only navigation. The icons (grid, three lines, branch, bar chart, person) are generic and not distinguishable without labels. A user unfamiliar with the app cannot identify which icon is Pipeline vs Gaps.  
Additional issues:
- The "DQ" logo remains large and dominates the collapsed rail
- The active state (dark pill) looks like a random filled circle when collapsed
- The `>` expand button is small and floats awkwardly
- At 1440px desktop there is no practical reason to collapse — the feature serves ~1024px tablet but icons still aren't distinct enough there

---

## 3. Command Centre Tab

### 3.1 Funnel Shape Is Not Clickable
The Recharts SVG funnel triangle is not interactive. Only the text list items to the right of it are clickable. Users will intuitively try to click the funnel shape first and get no response.

### 3.2 Backlogged KPI Card Disconnected From Funnel
"Backlogged: 5" KPI card renders at the top of the tab. The Command Centre funnel shows TG → Trial → Contract → Onboard only. Backlog is not represented in the funnel shape or list on this tab. The number exists, the card exists, they are visually disconnected.

### 3.3 Alert Banners Push KPIs Below Fold
On load, 3–4 alert banners render before the KPI cards. On a standard viewport the KPIs are pushed below the fold. Users must scroll past alerts before seeing any numbers.

### 3.4 DXB Studio Ring at 0/14 Looks Broken
The ring arc for DXB renders as completely empty (0% fill). There is no zero-state treatment — it looks like a rendering failure rather than communicating "zero fill." NBO | DXB ring at 3/15 also renders with a very thin arc.

### 3.5 Gap: -96 Is Too Small
The gap number (-96) under the Fill Rate KPI renders in very small subtext. This is arguably the most critical number on the page and is the hardest to see.

### 3.6 No Visual Separation Between Alerts and Content
Alert banners and the KPI card row flow together with no clear section break. The content hierarchy is ambiguous on first load.

---

## 4. Positions Tab

### 4.1 "Closed" Card Status Badge — Confusing and Contradictory
The Card Status badge (Active / Paused / Closed) renders at the bottom of each position card identical in style to the Studio and Vacancy badges. Issues:
- A new user has no idea "Closed" means recruitment has stopped
- **Closed + Critical tier is a direct contradiction** — the position needs filling urgently but no one is actively sourcing it. This is not visually alarmed in any way.
- The badge looks like an additional tag rather than a critical status

### 4.2 "No Pipeline" Label Loses Impact Through Repetition
The orange "No pipeline" label appears on ~10 of the 14 Critical cards. Because it is repeated so uniformly it becomes visual noise and loses its urgency signal.

### 4.3 No Sort Control
Positions cannot be sorted by gap size, urgency level, plan headcount, name, or pipeline activity. The default order is effectively arbitrary.

### 4.4 Pipeline Spark Bars Are Identical in Style
The 5-stage pipeline breakdown bars in position cards use the same thin single-color blue bar for all stages. It is difficult to distinguish between stages at a glance. Does not match the color-coded funnel in Command/Pipeline tabs.

### 4.5 "Show 4 Healthy Positions" Toggle Is Hard to Find
The toggle sits at the very bottom of the page below all Critical and Needs Attention cards. A user may scroll past it or never see it.

### 4.6 Drill-Down: Pipeline Bars All Same Color
In the position drill-down, the Pipeline Breakdown shows 5 rows (TG, Trial, Contract, Onboard, Backlog) with identical thin blue progress bars. Stage-specific colors from the funnel should carry through here.

### 4.7 Drill-Down: Plan YTD vs Plan FYE Not Explained
Both fields appear in the stats grid with no tooltip or label explanation. "Plan FYE" (Full Year Estimate) vs "Plan YTD" (Year to Date Plan) is not obvious to a business stakeholder.

### 4.8 Drill-Down: No Navigation Between Positions
To review all Critical positions the user must close the panel and click each card individually. No prev/next navigation within the drill-down panel.

---

## 5. Pipeline Tab

### 5.1 Funnel Duplicates Command Centre With No Added Value
The Pipeline tab funnel is identical to the Command Centre funnel — same shape, same data, same list. The Pipeline tab should go deeper: breakdown by BU, studio, or hiring manager. As-is it adds no information the user hasn't already seen.

### 5.2 Backlogged Stage Excluded From Funnel Chart
Backlogged (5) appears in the KPI cards and as a row in the funnel list, but is not drawn in the funnel shape. The visual funnel ends at Onboard. No explanation for the exclusion. Creates the impression backlog is not part of the pipeline when it is.

### 5.3 "Pipeline by Position" Bar Chart Labels Are Unreadable
Position names in the Y-axis are long (e.g. "Admin Analyst (Digital Operations | Studio Operations)") and are truncated or rendered too small to read at desktop viewport. No tooltip on hover. No scroll on the chart.

### 5.4 133% Contract→Onboard Conversion Has No Resolution Path
The anomaly is flagged in the Conversion Rates panel ("More candidates onboarding than contracted — data may be out of sync") but there is no investigation path, no refresh trigger, no link to the source data. It surfaces in both Command and Pipeline with no remediation.

### 5.5 Backlogged KPI Card Color Has No Explanation
The Backlogged KPI card renders in amber/warning color. No other KPI card changes color. No tooltip or legend explains why Backlog = amber.

### 5.6 Stage Drill-Down Items Have No Click Affordance
Items in the stage drill-down list (positions in a given stage) are clickable through to position detail but have no visual affordance — no underline, no arrow, no hover background change. Users may not discover this.

---

## 6. Gaps Tab

### 6.1 "Filled" Positions Appear in Zero-Fill Section
The "Zero-Fill Positions" grid contains cards showing a green "Filled" vacancy badge (e.g. Content Analyst (Digital Marketers) — Filled). The section label directly contradicts the badge. This is likely because Actual YTD = 0 despite Vacancy Status being Filled, but the label "Zero-Fill" is misleading.

### 6.2 At-Risk Register Cards Are Not Clickable
At-Risk Register cards show name, vacancy status, plan heads, and a reason string. Clicking them opens no drill-down. Every other card in the app is clickable into a position drill-down. This is the most inconsistent interaction in the app, particularly because these are the highest-priority positions a user would want to investigate.

### 6.3 Gap Heat Bars Only Show Negative Gaps
The bars visualise short-staffed BUs only (negative values). There is no view of which BUs are on-plan or over-staffed. No comparative baseline visible.

### 6.4 BU Tower Names Overflow or Truncate
BU names such as "DQ Delivery (Deploy) | Scrum Master (User Stories)" are long and are truncated in the heat bar rows. No tooltip on hover.

### 6.5 Alert Banner Lacks Context
"Total planned gap is 96 heads across the FY2026 catalogue" is a single sentence with no baseline. No sub-line showing Plan: 116 / Actual: 20 to anchor the number. Is 96 improving, worsening, or baseline?

### 6.6 No Filters on Gaps Tab
No studio selector, no BU filter. A manager responsible for DXB only cannot isolate their view. Everything is global.

---

## 7. Contractors Tab

### 7.1 No Filters
53 contractors with no search by name, no filter by Status, Initiative, Location, Priority, or SFIA level. This is the largest functional gap on the tab and will worsen as the pool grows.

### 7.2 Contractor Cards Have No Click Affordance
Contractor cards look static — no cursor change on the card body, no hover state. The drill-down is triggered by clicking the contractor name `<p>` element only (cursor: pointer on that element). The card as a whole does not signal it is interactive.

### 7.3 "Candidates (Closed)" Contractors in P.01 Very Urgent
Several P.01 cards show "Candidates (Closed)" status (e.g. UX Design Engineer A). If sourcing is closed, the P.01 Very Urgent classification is a contradiction that is not flagged or explained.

### 7.4 Ambiguous and Stale Target Start Dates
Target Start renders as "10.23" — ambiguous format (October 2023? Day 10, 2023?). If October 2023, these roles are 18+ months past their target start. No date normalization, no staleness alert.

### 7.5 P.01 Section Cannot Be Collapsed
P.01 Very Urgent is always fully expanded. For 10 roles this creates a long scroll before reaching P.02–P.04. The lower buckets have expand/collapse; P.01 should too for consistency.

### 7.6 Location Distribution and Initiative Breakdown Are Decorative
Both panels show counts (e.g. Offshore: 23, DQ2.0 DBP FSA: 27) that look like filter chips but clicking them does nothing. They should filter the contractor list below.

### 7.7 Task Backlog Field Is Mapped but Never Shown
The `Contractor` type includes a `taskBacklog` field that is populated in the data transform. It is never rendered in the contractor drill-down panel. Data is silently dropped.

---

## 8. Drill-Down System (All)

### 8.1 Drill-Down Panel Title Not Sticky
When scrolling through a long role profile (behavioural values, technical skills, competencies) the panel title scrolls away. The user loses context of which record is open.

### 8.2 No Prev/Next Navigation
Applies to all drill-down types (position, stage, BU, studio, contractor). Must close and reopen for every record.

### 8.3 Stage Drill-Down → Position Drill-Down Back Navigation
Navigating from a stage list into a position detail replaces the stage list with the position detail. There is no "back" within the panel — the only option is to close and re-click the stage.

### 8.4 Drill-Down Close Button Is Small
The X close button is positioned top-right and is small relative to the panel. On touch devices this will be difficult to tap accurately.

---

## 9. Data & Logic Issues

### 9.1 133% Conversion Rate
Contract → Onboard conversion shows 133%. This means more candidates are in Onboarding than were in Contract. Either the data is out of sync or the pipeline stage logic has an error. Surfaces in Command and Pipeline with no resolution path.

### 9.2 Closed Card Status + Critical Urgency Tier
Positions can simultaneously be `cardStatus: "Closed"` and `urgencyTier: "critical"`. The risk engine (`riskEngine.ts`) computes urgency from vacancy and pipeline data only — it does not factor in card status. A closed card with no pipeline looks identical to an active critical card.

### 9.3 "Filled" Positions in Zero-Fill Grid
Positions with `vacancyStatus: "Filled"` but `actualYTD: 0` appear in the Zero-Fill grid. The grid logic filters on headcount metrics but the vacancy status label contradicts the section name.

### 9.4 Backlogged Stage Excluded From Funnel Visuals
`PipelineStages` includes `backlog` as a field. `getFunnelTotals()` returns it. But neither the Command funnel chart nor the Pipeline funnel chart renders the backlog stage in the visual shape — only in the list/KPI cards.

### 9.5 Target Start Date Format Is Ambiguous
Contractor `targetStart` stores values like "10.23". No standardisation to ISO date format. No rendering normalisation. Past dates are not flagged as stale.

### 9.6 Mock Data Always Active in Development
`NEXT_PUBLIC_USE_MOCK_DATA` defaults to active unless explicitly set to `"false"`. The real Graph API is never exercised without an `.env.local` change. No `.env.example` file exists in the repo.

---

*End of audit. See TASKS.md for the corresponding resolution task list.*
