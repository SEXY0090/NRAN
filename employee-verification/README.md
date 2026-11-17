# Employee E-Verification (Next.js + Vercel)

The URL segment after `/verify/` is used directly as the employee filename in the configured GitHub repository. No employee index or manual mapping is needed.

## GitHub source

Defaults:
- Repository: `SEXY0090/NRAN`
- Branch: `main`
- Employee files: repository root (unless `GITHUB_DATA_DIR` is set)

Example file in the repository:
`121-2026-116597-EN`

Corresponding verification URL after deployment:
`https://YOUR-VERCEL-DOMAIN/verify/121-2026-116597-EN`

The app fetches that exact file from GitHub on the server, extracts employee details from `.mrz-row` HTML elements, table rows, `dt/dd`, `data-label` elements, simple `Label: Value` text, or JSON, and renders the result. Unknown file names show a not-found page. Results are cached for 60 seconds.

## Deploy to Vercel

1. Download and unzip this project.
2. Push the project files to a GitHub repository you control.
3. In Vercel, choose **Add New → Project**, import that repository, and deploy using the default Next.js settings.
4. Optional environment variables in Vercel Project Settings → Environment Variables:
   - `GITHUB_OWNER=SEXY0090`
   - `GITHUB_REPO=NRAN`
   - `GITHUB_BRANCH=main`
   - `GITHUB_DATA_DIR=` (leave empty when employee files are in repository root)
   - `GITHUB_TOKEN=` (only if the source repository is private; keep it server-side)

## Local run

```bash
npm install
npm run dev
```

Open `http://localhost:3000/verify/121-2026-116597-EN`.

Only publish employee information that the company is authorized to disclose. This site reports that a file was found; it does not independently authenticate the issuer or prove legal validity.
