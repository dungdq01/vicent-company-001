# H2 — Screen → Interview Loop

> Application → take-home → 4 interview stages.

**Owner**: CEO · **Agent**: R-HR (logistics) + Humans (interview)

---

## Stages

| Stage | Format | Owner | Duration |
|---|---|---|---|
| Screen | Application + R-HR scoring | R-HR | async |
| Take-home | 2-4h paid challenge | Candidate · R-HR collect | 1 week |
| Stage 1 | Culture + motivation call | CEO or COO | 45 min |
| Stage 2 | Take-home review + technical | Peer / domain expert | 60 min |
| Stage 3 | Live problem + collaboration | CEO + co-founder | 60 min |
| Stage 4 | Final + offer signal | CEO | 30 min |

## Engine Orchestration

| Step | Agent | Action |
|---|---|---|
| H2.1 | R-HR | Screen applications (score 0-100); polite reject < 60 |
| H2.2 | R-HR | Schedule take-home (with **paid stipend** rule per `15-ops §3`) |
| H2.3 | R-HR | Compile review packet for interviewers |
| H2.4 | R-HR | Schedule loop (Calendly, time zones) |
| H2.5 | R-HR | Collect debrief notes per stage |
| H2.6 | R-HR | Compile full candidate dossier post-Stage 4 |

## Outputs
```
projects/_business/hr/roles/{role-id}/applications/{applicant-id}/
├── application-summary.md
├── take-home-review.md
├── interview-{stage-n}-notes.md
├── full-dossier.md
└── decision.md          ← hire / pass / hold
```

## Definition of Done
- ✅ Take-home is paid (stipend per `15-ops §3`)
- ✅ Each stage has structured questions (not free-form)
- ✅ Each interviewer logs debrief within 24h
- ✅ Diverse panel (≥ 2 different perspectives)
- ✅ Bias-check: scoring on skills only, not photo/name/age
- ✅ Time-from-application to decision: ≤ 21 days

## Failure Modes
- **Free-form interviews**: bias risk; enforce question rubric
- **Take-home unpaid**: signal disrespect; mandatory stipend
- **Single-interviewer decision**: enforce ≥ 2 perspectives per candidate
- **Decision delay > 21 days**: candidate drops; force decision deadline

---
*v1.0*
