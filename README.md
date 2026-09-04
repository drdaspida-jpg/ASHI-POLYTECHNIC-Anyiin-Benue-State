# Ashi Polytechnic platform build — test branch

Branch: `platform-build-test`

## Architecture
- GitHub: source code
- Cloudflare Worker: backend API
- Cloudflare R2: PDF object storage
- Supabase Auth: administrator/user authentication
- Supabase PostgreSQL: students, staff, applicants, applications, results and document metadata

## Documents flow
Admin signs in → Documents → selects PDF → Worker authenticates admin → PDF is written to R2 → metadata is written to PostgreSQL → document appears in the Document Centre → public/authorized/admin access is enforced by the API.

## Before launch
Create the Supabase and Cloudflare resources, run `backend/schema.sql`, create the R2 bucket, deploy the Worker with `wrangler.toml`, set Worker secrets, then put the public Supabase URL/key and Worker URL into the frontend configuration.

Never put the Supabase service-role key in browser JavaScript or GitHub.
