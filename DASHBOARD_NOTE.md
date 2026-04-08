# CoP Dashboard Narrative Note

## Purpose of the dashboard

The CoP Dashboard is a workforce planning and hiring command surface for FY2026. Its job is to help HR, staffing, and hiring leads answer four questions quickly:

1. What is the current headcount position against plan?
2. Which roles are at risk, vacant, stalled, or under-filled?
3. How healthy is the hiring pipeline from Talent Gate through onboarding?
4. Where do we need immediate action by studio, tower, or contractor priority?

The dashboard is designed as a story, not just a report. It starts with a top-level command view, then lets the user drill into positions, pipeline, headcount gaps, and contractor demand.

## Overall look and interaction model

The UI uses a clean card-based layout with a sticky header and horizontal tab navigation. The look is operational rather than decorative:

- Rounded cards and panels for major sections
- KPI tiles for quick scanning
- Strong status color cues:
  - Red for critical risk or vacancy
  - Amber for attention needed
  - Green/teal for healthy or progressing states
  - Blue shades for pipeline stages
- Right-side slide-out drill-down panel for detail without leaving context

The design intent is that users can scan, identify a signal, click it, and get the detail in a drawer instead of navigating away.

## Primary navigation tabs

### 1. Command tab

This is the executive summary tab and the main entry point.

What it shows:

- Alert banners for urgent issues
- KPI cards for:
  - Total positions
  - Plan FYE
  - Actual YTD
  - Fill rate
  - Active pipeline
  - No pipeline
- Pipeline funnel summary
- Studio capacity rings

Purpose:

- Give leadership a fast picture of overall workforce health
- Surface immediate issues requiring escalation
- Show whether pipeline volume is enough to support headcount plan
- Show whether studios are under-capacity against plan

Flow:

1. User lands on Command tab.
2. User reads alerts first.
3. User scans KPIs for overall status.
4. User clicks a funnel stage or studio ring for drill-down detail.
5. User moves into Positions, Pipeline, or Gaps for action-level follow-up.

Story this tab tells:

"Are we on track overall, where are we weakest, and where should I look next?"

### 2. Positions tab

This tab is the catalogue of internal roles.

What it shows:

- Positions grouped by urgency tier:
  - Critical
  - Needs Attention
  - Healthy
- Filters for:
  - Studio
  - Card status
- Position cards with:
  - Position name
  - Studio
  - Vacancy badge
  - Mini pipeline sparkline
  - Plan vs actual vs gap
  - Card status badge

Purpose:

- Let users review the role catalogue operationally
- Prioritize which positions need intervention
- Narrow the list by studio or demand-card state

Flow:

1. User filters by studio or card status if needed.
2. User reviews critical roles first.
3. User opens a position card.
4. User sees role profile, pipeline stage counts, and action signal in the drill-down.

Story this tab tells:

"Which exact roles are healthy, which are slipping, and which ones need immediate attention?"

### 3. Pipeline tab

This tab is dedicated to funnel health and conversion.

What it shows:

- KPI cards by stage:
  - Talent Gate
  - Trial
  - Contract
  - Onboarding
  - Backlogged
- Funnel visualisation
- Conversion-rate cards and narrative insights
- Pipeline by position stacked bar chart

Purpose:

- Show whether candidate movement is happening across the funnel
- Expose stage bottlenecks
- Help users connect pipeline volume back to specific positions

Flow:

1. User reviews overall stage counts.
2. User checks the funnel shape.
3. User reads conversion insights.
4. User clicks a stage or position to open the drill-down panel.

Story this tab tells:

"Do we just have pipeline volume, or do we have pipeline quality and movement?"

### 4. Gaps tab

This tab focuses on headcount risk against plan.

What it shows:

- Overall planned gap statement
- Gap heat bars by BU / tower
- Zero-fill positions
- At-risk register

Purpose:

- Make the headcount shortfall visible
- Show which towers are furthest from plan
- Highlight roles with no current fill
- Escalate vacant positions with no pipeline

Flow:

1. User starts with the total gap statement.
2. User checks which business towers have the largest deficit.
3. User reviews zero-fill roles.
4. User reviews the at-risk register for intervention candidates.
5. User opens a role drill-down to see action context.

Story this tab tells:

"Where are the gaps, how bad are they, and which specific positions are now becoming a delivery risk?"

### 5. Contractors tab

This tab tracks contractor demand separately from internal positions.

What it shows:

- Contractor KPI cards:
  - Total roles
  - Searching
  - Interviews
  - Onboarding
  - Closed
- Priority buckets:
  - P.01 Very Urgent
  - P.02 Urgent
  - P.03 ASAP
  - P.04 As Planned
- P.01 urgent role list
- Location distribution
- Initiative breakdown
- Expandable sections for P.02, P.03, and P.04

Purpose:

- Separate contractor hiring from internal headcount tracking
- Prioritize urgent contractor needs
- Show sourcing status, location mix, and initiative demand

Flow:

1. User scans total contractor load and sourcing stage counts.
2. User checks urgent P.01 roles first.
3. User reviews initiative and location patterns.
4. User expands lower priorities as needed.
5. User opens a contractor record for full details and ownership.

Story this tab tells:

"What contractor demand is open, how urgent is it, and who owns each step?"

## Drill-down behaviour

The dashboard uses a right-side slide-out panel for drill-downs. This keeps the user in context while exposing the detail behind any card, stage, or grouping.

### Position drill-down

Opened from:

- Position cards
- Pipeline stage lists
- Studio detail
- BU gap detail
- Zero-fill positions
- At-risk register

Shows:

- Plan FYE
- Actual YTD
- Gap
- Plan YTD
- Prior actual
- Full pipeline breakdown
- Role profile:
  - Persona
  - Behavioural values
  - Technical skills
  - Minimum experience
  - Hiring strategy
- Action signal

Purpose:

- Give the full operating picture for one role
- Support hiring or staffing action without leaving the dashboard

### Stage drill-down

Opened from:

- Funnel visual on Command tab
- Funnel visual on Pipeline tab

Shows:

- List of positions with candidates in the selected stage
- Candidate count per position

Purpose:

- Connect overall funnel stage counts back to the actual positions driving them

### Studio drill-down

Opened from:

- Studio capacity rings on Command tab

Shows:

- Positions within the selected studio
- Grouped by urgency tier
- Vacancy status for each role

Purpose:

- Show the workforce health of one studio in detail

### BU / Tower drill-down

Opened from:

- Gap heat bars on Gaps tab

Shows:

- All positions in the selected BU / tower
- Studio and vacancy status

Purpose:

- Explain what is behind the aggregate gap in one business area

### Contractor drill-down

Opened from:

- P.01 urgent roles
- Expanded P.02, P.03, P.04 sections

Shows:

- Location
- Duration
- Target start
- SFIA level
- Minimum years
- Behavioural competencies
- Technical competencies
- Service competencies
- Ownership:
  - Requisition
  - Sourcing
  - Onboarding

Purpose:

- Give a complete contractor brief and show who owns the next action

## End-to-end story of dashboard use

Recommended usage sequence:

1. Start in Command to understand the overall state.
2. Use alerts and KPIs to spot the most urgent concern.
3. Move to Pipeline if the issue is candidate movement.
4. Move to Gaps if the issue is plan versus actual headcount.
5. Move to Positions if the issue is role-by-role prioritisation.
6. Move to Contractors if the issue is contingent hiring demand.
7. Use drill-downs throughout instead of navigating away.

In practical terms, the dashboard supports an operating rhythm such as:

- Leadership reviews Command weekly or daily
- Hiring leads review Pipeline and Positions for execution
- Workforce planners review Gaps for plan risk
- Contractor managers review contractor priorities and ownership

## Current data connection status

The current implementation already contains a real Excel integration path through Microsoft Graph, but it is not fully active in the current setup.

What is implemented now:

- `/api/cop` reads Excel range `CoP 2026!A41:V80`
- `/api/contractors` reads Excel range `CoP.02 (Contractors)!A26:AB79`
- The raw workbook range is transformed into dashboard-friendly JSON
- The frontend polls these APIs on a refresh interval

What is not complete now:

- The app defaults to mock data unless `NEXT_PUBLIC_USE_MOCK_DATA=false`
- The real Graph path also requires:
  - `ONEDRIVE_DRIVE_ID`
  - `ONEDRIVE_FILE_ID`
  - `GRAPH_ACCESS_TOKEN`
- The existing `.env` contains older `VITE_...` SharePoint values, but the active Next.js data path uses different environment variables
- There is no confirmed live token-refresh flow for Graph in the current route implementation

Meaning in plain terms:

The dashboard is structurally ready to read the real Excel workbook, but the live workbook connection is not fully wired in the active environment yet.

## NBAs: next best actions

### Functional review

- Review the wording of each tab title to confirm it matches stakeholder language
- Review all alert logic thresholds to confirm the business rules are correct
- Validate that the urgency-tier logic matches real hiring priorities
- Confirm that all drill-downs expose the minimum detail needed for action

### Data review

- Validate the worksheet names and ranges against the real workbook
- Confirm the workbook columns still match the transform mapping
- Replace mock mode with live mode in the deployed environment
- Add a secure Graph token acquisition and refresh flow instead of relying on a static token
- Confirm whether contractors and internal positions should come from one workbook or separate sheets

### UX review

- Review whether users want cross-filtering between tabs
- Confirm whether healthy roles should remain collapsed by default
- Confirm whether the right-side drawer is sufficient or if some drill-downs need full-page detail
- Review labels such as "Talent Gate", "Trial", and "Card Status" for stakeholder familiarity

### Delivery review

- Capture stakeholder feedback after walkthrough
- Update note wording based on that feedback
- Update dashboard logic and labels where needed
- Connect to the live Excel source and re-test all tabs

## Suggested feedback questions

- Does the story flow match how stakeholders review workforce status today?
- Are the five tabs the right operating structure?
- Are the drill-down details enough for decision-making?
- Which metrics are essential versus optional?
- Which alerts should be critical, warning, or informational?
- What should happen when workbook data is stale or unavailable?

## Summary

Yes, the request makes sense.

The work naturally breaks into three phases:

1. Document the dashboard story and intended use
2. Review and update it based on stakeholder feedback
3. Replace mock data with the real Excel connection and validate the live output

That is the correct sequence, because the narrative and business logic should be agreed before wiring the live workbook and treating the dashboard as authoritative.
