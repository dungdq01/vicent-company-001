# Ghi chú Frontend Engineer: B02 — Document Intelligence
## Tác giả: R-FE — Ngày: 2026-03-31

---

## Góc nhìn chuyên môn

Từ góc nhìn Frontend Engineer, Document Intelligence đặt ra những thách thức UI/UX đặc thù mà ít ứng dụng web khác gặp phải. Core của frontend là Document Viewer — component hiển thị tài liệu gốc song song với kết quả extraction, cho phép user verify, correct, và approve. Đây không phải đơn giản là hiển thị ảnh — cần render tài liệu ở chất lượng cao, overlay bounding boxes cho extracted fields, support zoom/pan/rotate, và cung cấp inline editing cho corrections. Performance cực kỳ quan trọng vì users xử lý hàng trăm tài liệu mỗi ngày.

Annotation interface (giao diện đánh dấu) cho Document Intelligence cần thiết kế theo workflow thực tế của người dùng. Nhân viên kế toán không phải AI engineer — họ cần interface đơn giản, trực quan, hỗ trợ keyboard shortcuts cho thao tác nhanh. Flow: xem document → check highlighted fields → Tab qua từng field → sửa nếu sai → Enter để approve → next document. Mỗi giây tiết kiệm × 1000 documents = hàng giờ productivity gain.

Real-time feedback (phản hồi thời gian thực) khi upload và xử lý tài liệu là yếu tố quyết định user experience. User upload 50 hóa đơn — cần thấy progress bar cho từng file, status badges (đang xử lý/hoàn thành/cần review/lỗi), và estimated time remaining. WebSocket hoặc Server-Sent Events (SSE — sự kiện gửi từ server) cho real-time updates, với polling fallback cho reliability.

Responsive design cho Document Intelligence có đặc thù riêng. Desktop là primary platform (nhân viên văn phòng), nhưng mobile cần support cho use case chụp ảnh tài liệu từ điện thoại và quick approval. Desktop layout: split view (document bên trái, extracted data bên phải). Mobile layout: single column với tab switching. Tablet: có thể hỗ trợ split view nếu landscape.

Accessibility (khả năng tiếp cận) và internationalization (đa ngôn ngữ — i18n) cần được tính từ đầu. UI hoàn toàn tiếng Việt cho user-facing elements, nhưng cần support tiếng Anh cho tài liệu song ngữ. ARIA labels cho screen readers, keyboard navigation đầy đủ, color contrast đạt WCAG 2.1 AA cho users có vấn đề về thị lực — đặc biệt quan trọng khi highlight fields trên document.

## Khuyến nghị kỹ thuật

1. **Document Viewer Component Architecture**:
```typescript
// Core components
<DocumentViewer>
  <DocumentCanvas />          // Render document image/PDF
  <BoundingBoxOverlay />      // Highlight extracted fields
  <FieldAnnotationPanel />    // Edit extracted values
  <MiniMap />                 // Navigation cho large docs
  <Toolbar zoom={} rotate={} />
</DocumentViewer>
```
Sử dụng Canvas API hoặc WebGL cho rendering — DOM-based rendering quá chậm cho documents lớn.

2. **PDF Rendering với PDF.js**: Mozilla PDF.js cho native PDF rendering trong browser. Lazy-load pages — chỉ render visible pages + 1 buffer page. Text layer overlay cho selectable text. Annotation layer cho bounding boxes. Custom rendering pipeline cho high DPI displays.

3. **Split-View Layout với Resizable Panels**:
```
┌──────────────────────┬──────────────────┐
│                      │ Extracted Fields  │
│   Document View      │ ┌──────────────┐ │
│   (zoomable,         │ │ Mã HĐ: ___  │ │
│    pannable)         │ │ Ngày: ___    │ │
│                      │ │ MST: ___     │ │
│   [bounding boxes]   │ │ Tổng: ___    │ │
│                      │ └──────────────┘ │
│                      │ [Approve] [Reject]│
└──────────────────────┴──────────────────┘
```
React-resizable-panels cho adjustable split. Click field bên phải → highlight bounding box bên trái. Click bounding box bên trái → focus field bên phải.

4. **Keyboard-First Workflow**:
   - `Tab` / `Shift+Tab`: Navigate giữa fields
   - `Enter`: Approve field
   - `Ctrl+Enter`: Approve all & next document
   - `Ctrl+Z`: Undo correction
   - `Space`: Toggle original vs extracted overlay
   - `+/-`: Zoom in/out
   - `R`: Rotate 90°
   - `Esc`: Cancel editing
   Hiển thị shortcut hints, configurable keybindings.

5. **Batch Processing UI**:
```typescript
// Document queue with status
interface DocumentQueueItem {
  id: string;
  thumbnail: string;
  status: 'uploading' | 'processing' | 'completed' |
          'needs_review' | 'approved' | 'failed';
  confidence: number;
  processingTime: number;
}
```
Sidebar queue hiển thị thumbnails với status badges. Filter by status. Sort by confidence (low first = needs attention). Batch approve cho high-confidence documents.

6. **Real-time Updates với SSE**:
```typescript
// EventSource for processing updates
const eventSource = new EventSource('/api/v1/documents/stream');
eventSource.addEventListener('document.status', (event) => {
  const { documentId, status, progress } = JSON.parse(event.data);
  updateDocumentStatus(documentId, status, progress);
});
```
SSE cho status updates (simpler than WebSocket, automatic reconnection). Fallback polling every 5 seconds nếu SSE disconnected.

7. **Image Optimization Pipeline**:
   - Upload: Client-side compression (browser-image-compression library) trước khi upload
   - Display: Multiple resolution versions (thumbnail 200px, preview 800px, full resolution)
   - Lazy loading: Intersection Observer cho document thumbnails
   - Progressive JPEG cho large document images
   - WebP format với fallback cho browsers cũ

8. **State Management với Zustand/Jotai**:
   - Document state: current document, extracted fields, corrections history
   - Queue state: document list, filters, sorting
   - UI state: zoom level, panel sizes, active field
   - Sync state: SSE connection, pending uploads
   Lightweight state management — Redux quá heavy cho use case này.

9. **Offline-First cho Mobile**:
   - Service Worker cache app shell và static assets
   - IndexedDB store documents chờ upload khi offline
   - Camera capture → queue locally → sync khi online
   - PWA (Progressive Web App) cho install-able mobile experience
   Quan trọng cho field workers chụp chứng từ tại kho, công trường.

10. **Design System cho Document Intelligence**:
    - Color coding: xanh lá = high confidence, vàng = medium, đỏ = low confidence
    - Typography: monospace cho số tiền/mã số, sans-serif cho labels
    - Consistent spacing, clear visual hierarchy
    - Dark mode support (nhân viên làm việc nhiều giờ với documents)
    - Vietnamese-first design — all labels, tooltips, error messages tiếng Việt

## Rủi ro & Thách thức

1. **Performance với large documents**: PDF 100 trang, mỗi trang render ở high resolution. Memory consumption có thể exceed 1GB trong browser tab. Cần virtualized rendering — chỉ render visible pages, dispose offscreen pages. Web Workers cho heavy processing (PDF parsing, image manipulation).

2. **Cross-browser compatibility**: PDF.js rendering có thể khác nhau giữa browsers. Canvas performance varies. Touch events cho tablet annotation cần careful testing. Target: Chrome, Edge, Firefox (desktop), Safari (mobile). IE11 không support.

3. **Bounding box accuracy display**: Bounding boxes từ OCR có thể không chính xác 100% — hơi lệch so với actual text. Nếu hiển thị raw boxes, user thấy "sai" dù extraction đúng. Cần visual smoothing/snapping hoặc chỉ hiển thị field highlighting thay vì exact boxes.

4. **User training và adoption**: Interface phức tạp hơn spreadsheet mà kế toán quen dùng. Cần onboarding flow, contextual help, và progressive disclosure — show basic features first, unlock advanced features gradually. Video tutorials bằng tiếng Việt.

5. **Concurrent editing conflicts**: Hai users cùng review một document. Cần real-time presence indicators (ai đang xem), optimistic locking cho edits, hoặc document-level locking (one reviewer at a time).

## Công cụ & Thư viện đề xuất

| Công cụ | Mục đích | Ghi chú |
|---------|---------|---------|
| **Next.js 14+** | React framework | App Router, SSR |
| **PDF.js** | PDF rendering | Mozilla, robust |
| **Fabric.js / Konva.js** | Canvas manipulation | Bounding boxes, annotations |
| **react-resizable-panels** | Split view layout | Adjustable panels |
| **Zustand** | State management | Lightweight, simple |
| **TanStack Query** | Data fetching | Cache, retry, SSE |
| **Tailwind CSS** | Styling | Utility-first, fast |
| **Radix UI** | Accessible components | WCAG compliant |
| **Framer Motion** | Animations | Smooth transitions |
| **browser-image-compression** | Client-side compression | Reduce upload size |
| **react-dropzone** | File upload UX | Drag & drop |
| **react-hot-toast** | Notifications | Toast messages |
| **Playwright** | E2E testing | Cross-browser |

## Ghi chú cho R-σ (Consolidation)

- **Core component**: Document Viewer với split view — document bên trái, extracted data bên phải. Canvas-based rendering.
- **UX priority**: Keyboard-first workflow cho high-volume processing. Tab/Enter navigation, batch approve.
- **Real-time**: SSE cho processing status updates. Fallback polling. Progress bars cho batch uploads.
- **Mobile**: PWA cho camera capture + offline queue. Quan trọng cho field workers.
- **Performance**: Virtualized rendering cho large docs. Target: smooth interaction với 100-page PDFs.
- **Tech stack**: Next.js + PDF.js + Fabric.js + Zustand + Tailwind. Consistent với MAESTRO platform stack.
- **Key risk**: User adoption — cần onboarding flow và Vietnamese-first design. Đơn giản hóa tối đa.
