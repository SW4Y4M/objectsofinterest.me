# Wishlist Deployment

## Required Environment

- `DATABASE_URL`: Neon Postgres connection string.
- `OWNER_PASSCODE`: Studio unlock passcode.
- `STUDIO_COOKIE_SECRET`: secret used for the local Studio session cookie.
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob token for production image storage.
- `WISHLIST_MODE`: set to `mock` to preview the seeded fixture dataset locally, or leave unset / set to `live` to use the normal data source.
- `NEXT_PUBLIC_PROFILE_TITLE`: public profile title.

## Optional Provider Environment

- `IMAGE_SEARCH_PROVIDER`: set to `http` for a configured HTTP image search service, otherwise fake local results are used.
- `IMAGE_SEARCH_ENDPOINT`: HTTP endpoint that accepts `?q=` and returns `{ "images": ImageCandidate[] }`.
- `IMAGE_SEARCH_API_KEY`: bearer token for the image search endpoint.
- `BACKGROUND_REMOVAL_PROVIDER`: set to `http` for a configured HTTP background-removal service, otherwise fake local processing is used.
- `BACKGROUND_REMOVAL_ENDPOINT`: HTTP endpoint that accepts `{ "imageUrl": string }` and returns `BackgroundRemovalResult`.
- `BACKGROUND_REMOVAL_API_KEY`: bearer token for the background-removal endpoint.

## Release Checks

Run:

```bash
npm run verify
npm run test:e2e
```

The public route must show only visible objects. The Studio route must redirect to `/studio/unlock` without a valid cookie.
When `WISHLIST_MODE=mock`, the Studio header shows a small "Mock data" badge so the owner can tell the app is previewing fixtures.
