# Frontend Engineer Notes: Generative AI (B09)
## By PixelCraft (R-FE) — Date: 2026-03-31

### Text Editor with AI Assist

AI-assisted text editing is the most common generative AI UI pattern:

- **Inline completion**: Ghost text appears ahead of cursor (like GitHub Copilot). Accept with Tab, dismiss with Escape. Debounce keystroke events (300-500ms) before requesting completions. Show at most 2-3 lines of suggestion to avoid visual clutter.
- **Rewrite/refine**: Select text -> context menu with options (rewrite, shorten, expand, change tone, translate). Show diff between original and suggested text. Use a side-by-side or inline-diff view for user to accept/reject changes.
- **Editor integration**: Use ProseMirror or TipTap for rich-text editors with AI extensions. For code, Monaco Editor (VS Code engine) with custom AI provider. Slate.js is another option for custom rich-text.
- **Streaming into editor**: Append tokens directly into the editor DOM. Use `requestAnimationFrame` for smooth rendering. Buffer tokens and flush in batches of 3-5 for visual smoothness.
- **Undo integration**: AI edits should be a single undo step. Group all tokens from one generation into a single transaction in the editor's history.
- **Vietnamese input considerations**: Vietnamese IME (Telex/VNI) interacts with inline suggestions. Disable ghost text while IME composition is active (`compositionstart`/`compositionend` events). Resume suggestions after composition ends.

### Image Generation Playground

A dedicated UI for image generation with full parameter control:

- **Core UI elements**: Prompt textarea (with token count), negative prompt field, aspect ratio selector (1:1, 16:9, 9:16, 4:3), step count slider (20-50), CFG scale slider (1-20), seed input (random or fixed), model selector dropdown.
- **Prompt helpers**: Tag autocomplete from a curated list. Style presets (photorealistic, anime, watercolor, etc.) that inject prompt fragments. Prompt history with search.
- **Generation grid**: Show 2-4 images per generation in a grid. Click to expand. Re-roll individual images. Variation generation (same prompt, different seed).
- **Advanced parameters**: Scheduler selection (Euler, DPM++, etc.), ControlNet input (upload reference image), img2img (upload + denoise strength slider), inpainting (mask brush tool on uploaded image).
- **State management**: Store all parameters in URL query params for shareable generation links. Persist last-used settings in localStorage.

### Gallery and History

Users need to browse and manage their generated content:

- **Masonry layout**: Use CSS Grid or a library like `react-masonry-css` for mixed-aspect-ratio images. Virtualized scrolling (react-window or TanStack Virtual) for large galleries — render only visible items.
- **Metadata overlay**: On hover, show generation parameters (prompt, model, seed, date). Quick actions: download, regenerate, favorite, delete.
- **Search and filter**: Full-text search over prompts. Filter by model, date range, favorited, aspect ratio. Tag-based organization.
- **Text generation history**: List view with prompt preview, model used, token count, date. Expand to see full input/output. Copy button for output text.
- **Storage**: Store metadata locally (IndexedDB) for fast access. Images served from CDN via pre-signed URLs. Lazy-load images with blur-hash placeholders.
- **Export**: Bulk download as ZIP. Export generation history as JSON/CSV for power users.

### Real-time Streaming Text Display

Rendering streamed LLM output requires careful attention:

- **SSE client**: Use `EventSource` API or `fetch` with `ReadableStream` for more control. Parse SSE data events, extract token deltas, accumulate into full response.
- **Markdown rendering**: Use `react-markdown` or `marked` with incremental parsing. Re-render on each token batch, not each token (batch 50-100ms for performance). Handle incomplete markdown gracefully — unclosed code blocks, partial links.
- **Code blocks**: Syntax highlighting with `highlight.js` or `Prism`. Apply highlighting when code block is complete (closing backticks received). Show "typing" indicator during incomplete code blocks.
- **Cursor animation**: Blinking cursor at end of streaming text. CSS animation, removed when generation completes.
- **Stop button**: Prominent "Stop generating" button during streaming. Sends abort signal to cancel the SSE connection. Display partial output cleanly.
- **Copy button**: Appears on completion. Copy full response or individual code blocks. Show "Copied!" toast for 2 seconds.
- **Performance**: For very long responses (10K+ tokens), consider virtualizing the rendered output. DOM nodes for 50K+ characters can cause jank.

### Image Comparison

Comparing generated images is essential for iterative refinement:

- **Side-by-side**: Two images placed horizontally. Synchronized zoom and pan. Useful for comparing different prompts or models.
- **Before/after slider**: Draggable vertical divider between two images. Classic pattern for img2img, inpainting, and upscaling comparisons. Libraries: `react-compare-slider`, or build with pointer events + CSS clip-path.
- **Overlay toggle**: Switch between images with a toggle. Useful for subtle differences. Optional onion-skin (opacity slider) mode.
- **Grid comparison**: Show 4-9 variations in a grid. Select any two for detailed comparison. Highlight the selected/preferred image.
- **Diff visualization**: For img2img workflows, compute and highlight pixel-level differences between source and generated images. Use canvas API for efficient diff computation.

### Progressive Image Loading

Image generation takes 5-30 seconds — keep users engaged:

- **Step-by-step preview**: Some backends (ComfyUI, A1111 API) can return intermediate denoising steps. Show blurry-to-sharp progression every 5-10 steps. Creates a satisfying "reveal" effect.
- **Placeholder strategies**: Blur hash (10-20 byte encoded placeholder) generated from first denoising step. Skeleton loader with aspect ratio preserved. Progress bar or step counter overlay.
- **Latent preview**: Decode latent representation at intermediate steps (fast but low quality). Show decoded preview at steps 5, 10, 15, then final image. Requires backend support.
- **WebSocket for progress**: Connect via WebSocket to receive progress updates. `{ step: 15, total_steps: 30, preview_url: "..." }`. Update progress bar and preview simultaneously.
- **Optimistic UI**: After clicking "Generate," immediately show the prompt in the gallery with a loading state. When the image arrives, animate it in with a fade transition.

### Mobile-Responsive Generation UI

Generative AI must work on mobile (60%+ of Vietnamese internet traffic is mobile):

- **Responsive layout**: Stack parameters vertically on mobile. Collapsible "Advanced settings" accordion. Full-width image display. Bottom sheet for generation parameters instead of sidebar.
- **Touch-optimized controls**: Large touch targets (48px minimum) for sliders and buttons. Swipe between generated images. Pinch-to-zoom on generated images.
- **Input optimization**: Auto-expanding textarea for prompts. Voice input for prompts (Web Speech API) — particularly useful for Vietnamese input where typing diacritics on mobile is slow.
- **Performance**: Compress preview images to WebP. Limit gallery to 20 items with "Load more." Defer non-critical JS. Target < 3s LCP on 4G connections.
- **PWA features**: Install prompt for frequent users. Offline gallery (cached previously generated images). Push notifications for completed async generations.
- **Vietnamese mobile UX**: Support Telex/VNI keyboard input. Test with popular Vietnamese keyboards (Laban Key, Gboard Vietnamese). Ensure diacritics render correctly across Android/iOS.

### Recommendations for B09

1. Use TipTap (ProseMirror-based) for AI-assisted text editing — best extensibility and community support.
2. Implement SSE streaming with token batching (50-100ms) — individual token rendering causes excessive re-renders.
3. Build the image generation playground with shareable URL state from day one — users will share and revisit generations.
4. Use virtualized lists for galleries — even 100 images can cause scroll jank without virtualization.
5. Prioritize mobile-responsive design — Vietnamese users are predominantly mobile.
6. Handle Vietnamese IME composition events carefully in any text input with AI suggestions.
7. Show progressive image previews during generation — the 5-30 second wait without feedback causes abandonment.
