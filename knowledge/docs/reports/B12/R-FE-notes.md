# Frontend Engineer Notes: Search & RAG (B12)

## 1. Search Bar with Autocomplete and Suggestions

The search bar is the primary entry point. It must feel instant and intelligent.

- **Debounced input**: 200-300ms debounce before firing suggestion requests
- **Autocomplete sources**: Recent searches, popular queries, document titles, entity names
- **Keyboard navigation**: Arrow keys to navigate suggestions, Enter to select, Escape to close
- **Search-as-you-type**: Show results updating live for keyword search (requires <100ms backend)
- **Voice input**: Web Speech API for voice search (important for mobile)
- **Placeholder text**: Rotate helpful examples ("Search policies...", "Ask about benefits...")

### Implementation
- Use Headless UI Combobox or Downshift for accessible autocomplete
- Separate API for suggestions (lightweight) vs full search (heavy)
- Cache suggestions client-side for repeat keystrokes

## 2. Faceted Search and Filters

Filters narrow results and improve findability:

- **Common facets**: Document type, date range, source/department, language, category
- **Dynamic facets**: Show only facets with results (hide empty categories)
- **Multi-select**: Allow selecting multiple values per facet (OR within facet, AND across facets)
- **Date range picker**: Preset ranges (last week, month, year) plus custom range
- **Active filters display**: Show selected filters as removable chips above results
- **URL sync**: Reflect filters in URL query params for shareable searches
- **Filter counts**: Show result count per facet value

## 3. Result Rendering

### Snippets and Highlights
- **Highlighted terms**: Bold matched query terms in title and snippet using `<mark>` tags
- **Context snippets**: Show ~150 chars around the matched section, not document beginning
- **Metadata display**: Source, date, author, document type as secondary info
- **File type icons**: Visual indicators for PDF, DOCX, webpage, etc.
- **Relevance indicators**: Optional relevance score or confidence bar

### Source Attribution
- **Clickable sources**: Link to original document or specific page/section
- **Preview on hover**: Show expanded snippet or document preview in tooltip/popover
- **Open in new tab**: Source links always open in new tab to preserve search context

## 4. RAG Answer Display with Citations

The AI-generated answer requires careful UX design:

- **Answer card**: Prominent card above search results with AI-generated answer
- **Inline citations**: Numbered references [1][2] linking to source documents below
- **Source list**: Expandable list of cited sources with relevance snippets
- **Streaming display**: Show answer tokens appearing in real-time (typewriter effect)
- **Confidence indicator**: Show when the AI is confident vs uncertain
- **Feedback buttons**: Thumbs up/down on answer quality for evaluation data
- **"Show sources" toggle**: Let users expand/collapse the evidence passages
- **Disclaimer**: "AI-generated answer. Verify with original sources."

### Streaming Implementation
- EventSource API for SSE consumption
- Append tokens to answer container with smooth rendering
- Show loading skeleton while waiting for first token
- Display sources after final SSE event

## 5. "Ask AI" vs Traditional Search Toggle

Users need both modes — not everyone wants AI answers:

- **Toggle design**: Pill toggle or tab switch between "Search" and "Ask AI" modes
- **Search mode**: Traditional ranked results list, fast, familiar
- **Ask AI mode**: RAG answer with sources, slower but answers questions directly
- **Auto-detection**: Detect question-like queries ("what", "how", "why") and suggest Ask AI mode
- **Persistent preference**: Remember user's preferred mode in localStorage
- **Keyboard shortcut**: Tab key or Ctrl+/ to switch modes

## 6. Infinite Scroll vs Pagination

- **Pagination**: Better for enterprise search (users want to know total results, jump to pages)
- **Infinite scroll**: Better for casual/consumer search experiences
- **Hybrid**: Show first 10 results with "Load more" button (not auto-scroll)
- **Performance**: Virtualize long result lists with react-window or TanStack Virtual
- **"Back to top" button**: Essential for long result lists

Recommendation: Traditional pagination for enterprise search; it communicates result count and allows deliberate navigation.

## 7. Mobile-Responsive Search

- **Full-screen search**: On mobile, search expands to full screen with results below
- **Filter drawer**: Filters in a bottom sheet or slide-out drawer (not inline)
- **Touch targets**: Minimum 44px touch targets for all interactive elements
- **Swipe actions**: Swipe result cards to bookmark or share
- **Responsive answer card**: RAG answer card should stack gracefully on narrow screens
- **Reduced snippets**: Shorter snippets on mobile to reduce scrolling

## 8. Vietnamese Input Handling (IME)

Vietnamese users type with Input Method Editors (Telex, VNI, VIQR):

- **Composition events**: Handle `compositionstart`, `compositionupdate`, `compositionend` properly
- **Do NOT trigger search during composition**: Wait for compositionend before firing autocomplete
- **Diacritics rendering**: Ensure fonts support all Vietnamese diacritics correctly
- **Common issue**: Debounce must account for IME composition; naive debounce fires mid-character
- **Testing**: Test with Unikey (Telex mode) on Windows, built-in Vietnamese keyboard on mobile

### Implementation
```javascript
let isComposing = false;
input.addEventListener('compositionstart', () => isComposing = true);
input.addEventListener('compositionend', () => { isComposing = false; triggerSearch(); });
input.addEventListener('input', () => { if (!isComposing) triggerSearch(); });
```

## 9. Recommendations

1. Handle Vietnamese IME composition events — this is the most common bug in Vietnamese search UIs
2. Implement SSE streaming for RAG answers from day one; it dramatically improves perceived speed
3. Always provide both search and Ask AI modes; let users choose their workflow
4. Inline citations with numbered references are the gold standard for RAG answer trust
5. Use pagination (not infinite scroll) for enterprise search
6. Sync filters to URL params so searches are shareable and bookmarkable
7. Add feedback buttons on RAG answers — this is your most valuable evaluation data source
