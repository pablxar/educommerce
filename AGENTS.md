<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep homepage catalog data and category filtering in a browser-safe module; the page must function without a backend.
- Keep the access-panel WebGL animation in a reusable effect-initialized UI component with CSS palette tokens, reduced-motion support and a static fallback, so SSR and unsupported devices retain a usable sign-in page.
- Configure external login, academy, contact and course destinations through VITE_* environment variables; missing destinations show accessible pending-resource states rather than invented links.
- Use extracted photographs from supplied references only for the study composition; course thumbnails remain explicitly labeled replaceable placeholders.
- Campus pages live under src/routes/_authenticated/ and read user data through the shared campus query in src/lib/campus.ts; module access is granted only by admins (role in user_roles) and enforced by database policies, because there are no payments to unlock content.
