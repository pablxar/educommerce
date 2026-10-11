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
- All current and future action controls use the shared Button/buttonVariants in src/components/ui/button.tsx; the Stardust-inspired finishes and interaction states live in semantic CSS tokens so every view inherits one consistent system.
- Keep the access-panel WebGL animation in a reusable effect-initialized UI component with CSS palette tokens, reduced-motion support and a static fallback, so SSR and unsupported devices retain a usable sign-in page.
- Configure external login, academy, contact and course destinations through VITE_* environment variables; missing destinations show accessible pending-resource states rather than invented links.
- This project is the public landing only; the campus and its sign-in live in a separate project served at app.educommerce.cl. "Ingresar" opens that external destination in a new tab via VITE_LOGIN_URL — never add local auth or campus routes here.
- Use extracted photographs from supplied references only for the study composition; course thumbnails remain explicitly labeled replaceable placeholders.
- Keep the catalog program offer in a dedicated presentation component and its commercial values in the browser-safe catalog module so its two-column grid placement and terms stay consistent without backend reads.
