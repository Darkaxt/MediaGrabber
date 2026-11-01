# Preserve native XMLHttpRequest callbacks

Authorization: the user's MediaGrabber playback regression report and existing source-fix/release/install authorization.

## Specification

- X1: MediaGrabber observation must preserve native XMLHttpRequest event-handler semantics. Assignments to onload, onreadystatechange and onloadend must reach the browser; reads return the assigned function; replacement/removal, callback receiver and Event argument remain native.
- X2: Retain media URL relay observation through independent listeners, without disabling MediaGrabber on Reddit or changing other extensions/system settings. Preserve the existing Downloads fix and download behavior.
- X3: Reproduce the failure with the current bundle, verify the corrected complete injected hook in a real browser, and check the reported Reddit player when available.
- X4: Publish the normal v1.1.3 fork release, retrieve/check delivered artifacts, update the installed extension/native companion, verify installed behavior and clean task artifacts.

## Plan and reconciliation

| Stage | Status | Acceptance |
| --- | --- | --- |
| Native callback preservation | COMPLETE | X1–X3; the old production bundle suppressed all three property callbacks and changed handler identity; the corrected bundle passed real-browser identity, receiver/Event, replacement, clearing and reuse checks. Full build and folder regression checks pass. A source-built candidate was activated for live validation: the reported Reddit video changed from readyState 0/no duration/stuck at 0 to readyState 4, 53.5 seconds duration and advancing playback with decoded frames. MediaGrabber still detects media on that tab. |
| Final release and installation | ACTIVE | X4; published assets and installed extension verified; reported player checked; cleanup complete. |

Current delivery blockers: publication, independently retrieved package validation, final installed-version verification and cleanup. No tracked deferrals. Scope excludes unrelated size-estimate/UI changes and speculative 403 workarounds. The existing independent loadend listener is retained; the fix removes the shadow properties rather than introducing replacement callback machinery. No consolidation is needed.
