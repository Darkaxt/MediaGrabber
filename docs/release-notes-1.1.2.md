Windows downloads now follow the current user's system Downloads location, including redirected folders on another drive. MediaGrabber refreshes that destination before downloads and reports an error if the configured folder is unavailable, rather than creating a separate Downloads folder under the user profile.

The installer includes yt-dlp 2026.10.26. Existing extension identity and original-title filenames are preserved.

Verification covers redirected and Unicode paths, changed settings, unavailable folders, the full TypeScript build and an actual native-messaging download to the Windows-configured location.
