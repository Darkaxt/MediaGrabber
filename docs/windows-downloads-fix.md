# Windows Downloads destination correction

Authorization: already_authorized by the user's instruction to make the program respect system settings, and prior instruction to fork if source changes are needed.

## Specification

- R1: On Windows, resolve the current user's Downloads known folder through Windows Shell. Do not assume a drive, user-profile path, English folder name, or registry expansion convention. Preserve existing non-Windows behavior.
- R2: Use that resolution for native `info`, direct downloads, yt-dlp defaults and FileOperations. Refresh the extension's default destination before each download rather than retaining an old path.
- R3: If Windows cannot resolve the configured folder or it is unavailable, return an actionable error. Do not silently fall back to, or recreate, `<profile>/Downloads`. Do not modify Windows settings or move unrelated files.
- R4: Preserve native-host identity, existing extension ID, user settings, original-title naming behavior and the verified current yt-dlp runtime. No unrelated 403 workarounds, title-policy changes or UI redesign.
- R5: Publish a normal versioned fork release with the established installer, extension and runtime assets/checksums. Install the delivered package, confirm native messaging reports the actual Windows folder, and verify a real download reaches that folder while the legacy folder stays unchanged.

## Plan and reconciliation

| Stage | Status | Acceptance |
| --- | --- | --- |
| System destination fix | COMPLETE | R1–R4 integrated; regression checks pass for redirected/Unicode paths, changed setting and unavailable-folder failure; full project build passes; native info resolves the real system setting and a real direct-download fixture was written with matching content in that folder. |
| Final release and installation | ACTIVE | R5; published assets independently retrieved and checked, installed companion and extension verified through Helium; actual download verified; cleanup complete. |

Advancement blockers: final publication, installation, browser verification and cleanup remain in the ACTIVE delivery stage. No tracked deferrals. Closure assessment: one destination resolver replaces the four default constructions; no additional abstraction or consolidation is needed. No further implementation criteria remain.

Implementation choice: one read-only Windows Shell COM query through the system Windows PowerShell executable; base64 transports UTF-8 paths without console-codepage corruption. The query is a single fixed expression, uses no interpolated user input, no execution-policy override, no timeout and no folder-creation operation. All production decisions remain in TypeScript. No new native dependency or general folder framework is needed.
