# Frontend Engineer Notes: Conversational AI & Chatbots (B08)
## By Hoa Dang (R-FE) — Date: 2026-03-31

### Chat Widget Design Patterns

**Floating Widget (most common)**
- Fixed-position button (bottom-right corner) that expands into chat panel
- Panel size: 380px wide x 550px tall on desktop; fullscreen on mobile
- States: minimized (bubble with unread count), expanded (chat panel), maximized (full page)
- Z-index: 999999 to float above all page content; use shadow DOM to avoid CSS conflicts

**Embedded Chat**
- Inline component within the page layout — for dedicated support pages
- Responsive: takes full container width, height managed by parent

**Implementation**
- Build as a Web Component or iframe for isolation from host page styles
- Load via single `<script>` tag: `<script src="https://chat.domain.com/widget.js" data-bot-id="xxx"></script>`
- Configuration: theme color, position, welcome message, language, avatar
- Lazy-load: do not load chat resources until user clicks the bubble — reduce impact on host page performance

### Message Rendering

**Text Messages**
- Parse markdown: bold, italic, links, lists — use a lightweight parser (marked.js, markdown-it)
- Code blocks: syntax highlighting with highlight.js; include copy button
- Vietnamese text: ensure proper rendering of diacritics across all fonts; test with "ắ ặ ẵ ấ ầ"

**Rich Content Types**
- Images: inline preview with lightbox on click; lazy load with blur-up placeholder
- Cards: product cards with image, title, price, action button — common for e-commerce
- Carousels: horizontal scrollable card list; 2-3 visible, swipe/arrow navigation
- Quick replies: horizontal button row below bot message; disappear after selection
- Lists: structured list with title + subtitle + action per item (e.g., order list)
- File attachments: upload indicator, file type icon, download link

**Bot vs User Message Styling**
- User messages: right-aligned, solid brand color background, white text
- Bot messages: left-aligned, light gray background, dark text, bot avatar
- System messages: centered, small text, no bubble (e.g., "Agent joined the conversation")

### Typing Indicators & Streaming Display

**Typing Indicator**
- Show animated dots ("...") in a bot message bubble immediately when request is sent
- Timeout: if no response in 30 seconds, show "Still working on your answer..."

**Streaming Display**
- Receive tokens via SSE; append to current bot message in real-time
- Render markdown incrementally: buffer until a complete markdown element is formed
- Smooth appearance: use CSS transitions for message height changes to avoid layout jumps
- Cursor: show blinking cursor at end of streaming text; remove when complete
- Performance: batch DOM updates; do not re-render entire message on each token

**Error States**
- Network disconnect: show banner "Connection lost. Reconnecting..."
- LLM timeout: show "I'm taking longer than expected. Please wait or try again."
- Retry button on failed messages; preserve user's original input

### Conversation History UI

- Store conversation history in localStorage (last 50 messages) for returning users
- Infinite scroll upward for older messages; load in batches of 20
- Date separators between conversation days: "Hôm nay", "Hôm qua", "15 tháng 3"
- Search within conversation: highlight matching text in messages
- "New conversation" button: clear context but keep history accessible
- Unread message indicator when widget is minimized

### Mobile-Responsive Chat

- Breakpoint: 768px — below this, chat takes full screen when opened
- Touch-optimized: minimum tap target 44x44px for all interactive elements
- Keyboard handling: chat input must remain visible above virtual keyboard on iOS/Android
- iOS Safari: handle the viewport resize on keyboard open (use `visualViewport` API)
- Swipe gestures: swipe down to minimize chat on mobile
- Input: auto-grow textarea, max 4 lines before scroll; send button always visible
- Test on: iPhone Safari, Android Chrome, Zalo in-app browser, Facebook Messenger WebView

### Accessibility (WCAG)

- All interactive elements must be keyboard navigable (Tab, Enter, Escape)
- Screen reader: messages announced as they arrive using `aria-live="polite"` region
- Color contrast: minimum 4.5:1 ratio for text; do not rely solely on color for meaning
- Focus management: when chat opens, focus moves to input; when new message arrives, announce but don't steal focus
- Alt text for images; captions for audio messages
- Respect `prefers-reduced-motion`: disable animations for users who set this

### Vietnamese Platform Integration

**Zalo Mini App**
- Build chat UI as a Zalo Mini App for seamless experience within Zalo ecosystem
- Use Zalo Mini App SDK: `getPhoneNumber`, `getUserInfo` for authentication
- Constraints: limited to Zalo's UI framework; follow Zalo design guidelines
- Advantage: direct access to user's Zalo profile, no separate login required

**Website Embed**
- iframe-based or Web Component; communicate with host via postMessage
- Support Vietnamese input methods (Telex, VNI, VIQR) — ensure no conflicts with chat input handling
- Font: use system fonts or load Vietnamese-optimized fonts (Roboto, Be Vietnam Pro)

**Facebook Messenger**
- Messenger Platform Webview: open your custom UI within Messenger via a button
- Alternatively, use Messenger's native templates (generic, receipt, button) — less custom but zero frontend work
- Customer Chat Plugin: embed Messenger chat directly on website

### Rich Message Types Implementation

```typescript
interface BotMessage {
  id: string;
  type: 'text' | 'image' | 'card' | 'carousel' | 'quick_reply' | 'list';
  content: string;           // markdown text for 'text' type
  attachments?: Attachment[];
  quickReplies?: QuickReply[];
  cards?: Card[];
  timestamp: string;
}

interface Card {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  buttons: { label: string; action: string; payload: string }[];
}

interface QuickReply {
  label: string;     // displayed text
  payload: string;   // sent to backend when clicked
  icon?: string;
}
```

- Quick replies: render as horizontal pill buttons; support emoji icons
- Cards: fixed aspect ratio image (16:9), max 2 action buttons
- Carousel: horizontal scroll, peek next card by 20px to hint scrollability

### Recommendations for B08

1. Build as a Web Component with shadow DOM — CSS isolation from host sites is non-negotiable
2. Implement streaming display from v1 — users will not tolerate 5-second wait with no feedback
3. Prioritize Zalo Mini App integration for Vietnamese market — it is where the users are
4. Use Be Vietnam Pro font for consistent Vietnamese rendering across devices
5. Test on Zalo in-app browser extensively — it has quirks not present in standard mobile browsers
6. Store conversation locally but sync with server — users expect continuity across devices
