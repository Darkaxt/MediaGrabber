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
| Final release and installation | COMPLETE | X4; normal v1.1.3 release published from ec2c204766e93285a7b53cc0e8e2dc7f44db8ef2. All eight assets independently retrieved; installer checksums and installed companion/runtime hashes match. Helium extension is enabled at 1.1.3 with no manifest errors. Native messaging returns companion 1.1.3 and D:/Downloads. The reported Reddit video plays with the installed hook enabled: readyState 4, duration 53.5 seconds, playback advanced from 12.9 to 40.7 seconds and decoded 1,226 frames. Task-owned scratch/build output cleaned. |

All X1–X4 requirements are satisfied and verified. No blockers or tracked deferrals remain. Scope excludes unrelated size-estimate/UI changes and speculative 403 workarounds. The existing independent loadend listener is retained; the fix removes the shadow properties rather than introducing replacement callback machinery. No consolidation is needed.

Release: https://github.com/Darkaxt/MediaGrabber/releases/tag/v1.1.3. Hosted release run 41359086320 passed. Independently retrieved packages are retained at D:/Tools/MediaGrabber/releases/1.1.3; the bound extension path remains D:/Tools/MediaGrabber/extension-1.1.1. Installed injected bundle SHA256: EBDB9E074309D178C4583F36F35D792F5DE3C9639DA95647E7A91AEB68D730C2, identical to the verified source-built bundle. Installer extraction used D:/Temp/mediagrabber-install-1.1.3 for native small-file I/O; preflight used E:/Temp/mediagrabber-install-1.1.3. Cleanup transaction b68c7bd8b49e813a78d841403437873f applied all 82 reviewed scratch/build members (475,856 bytes), with no errors or residuals. Browser workflows released their ownership; only the task-created test tab was closed. The earlier user tab was already closed externally before final verification, so final verification used the task-created tab.
