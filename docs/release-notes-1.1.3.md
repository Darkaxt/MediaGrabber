Fixes video playback on Reddit and other sites that assign XMLHttpRequest completion handlers. MediaGrabber no longer shadows onload, onreadystatechange or onloadend; the browser keeps ownership of callback registration and delivery. Independent media observation remains enabled.

Verified against a real-browser reproduction of the previous suppression bug, native callback identity/replacement/removal/reuse checks, and playback on the reported Reddit post with MediaGrabber enabled. The Windows system Downloads-folder fix remains included.
