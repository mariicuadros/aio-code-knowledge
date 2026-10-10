# Instagram Media — @aiocode_

Source platform: Instagram  
Handle: @aiocode_  
Canonical entity: AIO CODE (AIO-001)  
Current system type: DigitalEntityOperatingSystem

## Folders

- `profile/` — reserved for profile/avatar assets when archived.
- `posts/` — reserved for non-carousel feed-post media; currently empty.
- `reels/` — reserved for Reel/video media; currently empty.
- `stories/` — reserved for selected Story media; currently empty.
- `carousels/` — active repository archive for the owner-confirmed carousel collection.

The carousel folder is inventoried by `carousels/manifest.json`. Repository presence proves only that an asset is archived here. Per-post Instagram URLs, IDs and timestamps require source metadata and are never inferred from filenames.

Instagram remains the source platform. GitHub is the provenance/archive layer.
