This project uses a small in-repo lightweight UI "base" inspired by the project's design tokens and the Base UI ideas.

Guidelines:
- Prefer the components in `src/app/_components/ui/` for consistent buttons and dropdowns.
- Use `lucide-react` icons instead of inline svgs. Import icons at top of file and use them as React components.
- Keep layout and spacing consistent with design tokens in `src/styles/globals.css` and `src/styles/uikit.css`.

Files added:
- `src/app/_components/ui/Button.tsx` — small wrapper around the project's `.btn` styles.
- `src/app/_components/ui/Dropdown.tsx` — simple dropdown container with `placement` support.

When adding new UI elements, follow the token-based classes (`btn`, `card`, `input-field`, etc.) and avoid ad-hoc inline styles.


