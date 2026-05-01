# Ghi chú ML Engineer: B02 — Document Intelligence
## Tác giả: R-MLE — Ngày: 2026-03-31

---

## Góc nhìn chuyên môn

Document Intelligence (Trí tuệ tài liệu) là lĩnh vực giao thoa giữa Computer Vision, NLP và Information Extraction. Từ góc nhìn ML Engineer, đây là một trong những bài toán phức tạp nhất vì yêu cầu xử lý đa phương thức (multimodal) — kết hợp hình ảnh, văn bản, và cấu trúc layout của tài liệu. Các mô hình hiện đại như LayoutLMv3, Donut, và Florence-2 đã chứng minh rằng việc huấn luyện end-to-end cho kết quả vượt trội so với pipeline truyền thống OCR → NLP riêng biệt.

Trong bối cảnh tiếng Việt, thách thức lớn nhất là thiếu hụt dữ liệu huấn luyện chất lượng cao. Các mô hình OCR phổ biến như Tesseract hay PaddleOCR có hỗ trợ tiếng Việt nhưng độ chính xác với tài liệu scan chất lượng thấp, chữ viết tay, hoặc hóa đơn VAT còn hạn chế. Fine-tuning (tinh chỉnh) trên dữ liệu domain-specific là bắt buộc để đạt production-grade accuracy (độ chính xác cấp sản phẩm). Cụ thể, với hóa đơn điện tử Việt Nam, cần xây dựng dataset ít nhất 10,000 mẫu có annotation đầy đủ.

Xu hướng 2025-2026 đang chuyển mạnh sang Vision-Language Models (VLMs — mô hình ngôn ngữ thị giác). Các mô hình như GPT-4V, Gemini Pro Vision, và Qwen-VL có khả năng "đọc" tài liệu trực tiếp từ ảnh mà không cần OCR pipeline riêng. Tuy nhiên, chi phí inference cao và latency lớn khiến chúng phù hợp hơn cho các use case phức tạp (hợp đồng pháp lý, báo cáo tài chính), trong khi các tài liệu đơn giản hơn nên dùng pipeline truyền thống để tối ưu chi phí.

Kiến trúc model serving cho Document Intelligence cần xem xét kỹ lưỡng. GPU inference là bắt buộc cho các mô hình lớn, nhưng nhiều bước tiền xử lý (preprocessing) và hậu xử lý (postprocessing) có thể chạy trên CPU. Việc thiết kế pipeline hybrid CPU-GPU với batching thông minh sẽ tối ưu throughput và giảm chi phí hạ tầng đáng kể. Triton Inference Server hoặc vLLM là lựa chọn phù hợp cho serving.

Transfer learning (học chuyển giao) đóng vai trò then chốt. Thay vì huấn luyện từ đầu, nên bắt đầu từ pre-trained checkpoint của LayoutLMv3 hoặc Donut, sau đó fine-tune qua 2 giai đoạn: (1) trên dataset tiếng Việt tổng quát, (2) trên dataset domain-specific. Chiến lược này giảm thời gian huấn luyện từ tuần xuống ngày và yêu cầu ít dữ liệu hơn đáng kể.

## Khuyến nghị kỹ thuật

1. **Kiến trúc mô hình hai tầng**: Sử dụng lightweight OCR model (PaddleOCR/EasyOCR) cho tài liệu đơn giản và VLM (Qwen-VL-Chat hoặc Florence-2) cho tài liệu phức tạp. Router model phân loại tài liệu để chọn pipeline phù hợp.

2. **Fine-tuning PaddleOCR cho tiếng Việt**: PaddleOCR v4 có kiến trúc PP-OCRv4 nhẹ và chính xác. Fine-tune recognition model trên dataset tiếng Việt với dấu thanh đầy đủ, đặc biệt chú ý các ký tự dễ nhầm: ơ/o, ư/u, ă/a, đ/d.

3. **LayoutLMv3 cho Key-Value Extraction**: Fine-tune LayoutLMv3-base trên task token classification để trích xuất thông tin cấu trúc từ hóa đơn, chứng từ. Input gồm text tokens + 2D positional embeddings + image patches.

4. **Data Augmentation Pipeline**: Xây dựng augmentation pipeline mô phỏng điều kiện thực tế — scan nghiêng, mờ, nhiễu, nền không đồng đều, đóng dấu chồng lên text. Sử dụng Albumentations + custom transforms.

5. **Active Learning Loop**: Triển khai active learning — model tự đánh dấu samples có confidence thấp để human reviewer annotation, liên tục cải thiện model quality theo thời gian.

6. **Quantization cho inference**: Áp dụng INT8 quantization cho production models sử dụng ONNX Runtime hoặc TensorRT. Giảm 2-4x latency với minimal accuracy loss (< 0.5% drop).

7. **Table Detection & Structure Recognition**: Sử dụng Table Transformer (TATR) cho phát hiện và phân tích cấu trúc bảng — bài toán cực kỳ quan trọng với tài liệu tài chính Việt Nam.

8. **Handwriting Recognition Module**: Xây dựng module riêng cho nhận dạng chữ viết tay tiếng Việt, sử dụng TrOCR fine-tuned. Tách biệt vì yêu cầu model architecture khác printed text.

9. **Ensemble Strategy**: Kết hợp kết quả từ multiple OCR engines (PaddleOCR + EasyOCR + Tesseract) bằng voting mechanism cho các tài liệu quan trọng, tăng accuracy lên 2-3%.

10. **Continuous Training Pipeline**: Thiết kế MLOps pipeline với MLflow/Weights&Biases để track experiments, auto-retrain khi accuracy drift, và A/B testing giữa model versions.

## Rủi ro & Thách thức

1. **Dữ liệu tiếng Việt khan hiếm**: Không có public benchmark dataset lớn cho tài liệu tiếng Việt (hóa đơn, chứng từ, hợp đồng). Cần đầu tư đáng kể vào data annotation — ước tính 2-3 tháng cho dataset ban đầu 10K samples. Rủi ro: annotation quality không đồng đều nếu không có guideline chặt chẽ.

2. **Model drift theo thời gian**: Mẫu hóa đơn, chứng từ thay đổi liên tục (cơ quan thuế cập nhật form, doanh nghiệp đổi template). Model cần monitoring liên tục và retrain định kỳ. Nếu không có hệ thống monitoring, accuracy sẽ giảm dần mà không phát hiện được.

3. **GPU cost cho inference**: VLM models yêu cầu GPU A10G/L4 minimum. Với traffic cao (>1000 docs/giờ), chi phí GPU serving có thể lên $3,000-5,000/tháng. Cần cân nhắc kỹ trade-off accuracy vs cost cho từng loại tài liệu.

4. **Đa dạng format tài liệu**: Tài liệu Việt Nam có hàng trăm format khác nhau — hóa đơn VAT, phiếu xuất kho, hợp đồng lao động, bảng lương, sổ đỏ... Mỗi loại cần logic extraction riêng. Complexity tăng tuyến tính theo số document types.

5. **Chất lượng scan input**: Nhiều doanh nghiệp Việt Nam vẫn scan bằng máy cũ hoặc chụp bằng điện thoại. Image quality cực kỳ biến thiên — từ 72 DPI đến 600 DPI, có glare, shadow, wrinkle. Model cần robust với mọi điều kiện input.

## Công cụ & Thư viện đề xuất

| Công cụ | Mục đích | Ghi chú |
|---------|---------|---------|
| **PaddleOCR v4** | OCR engine chính | Tốt nhất cho tiếng Việt, hỗ trợ fine-tune |
| **LayoutLMv3** | Document understanding | Microsoft, pre-trained multimodal |
| **Donut (Naver)** | OCR-free document understanding | End-to-end, không cần OCR riêng |
| **Florence-2** | Vision foundation model | Microsoft, multi-task document AI |
| **Qwen-VL-Chat** | VLM cho complex docs | Alibaba, mạnh với CJK + Vietnamese |
| **Table Transformer** | Table detection & parsing | Microsoft, SOTA cho table structure |
| **TrOCR** | Handwriting recognition | Transformer-based, fine-tunable |
| **Tesseract 5** | OCR backup engine | LSTM-based, ensemble voting |
| **ONNX Runtime** | Model optimization | Quantization, graph optimization |
| **Triton Inference Server** | Model serving | Dynamic batching, multi-model |
| **MLflow** | Experiment tracking | Model registry, deployment |
| **Label Studio** | Data annotation | Custom templates cho document AI |
| **Albumentations** | Image augmentation | Document-specific transforms |
| **Hugging Face Transformers** | Model hub | Pre-trained checkpoints |

## Ghi chú cho R-σ (Consolidation)

- **Điểm mấu chốt**: Document Intelligence cho tiếng Việt cần đầu tư lớn vào data annotation và fine-tuning. Không có giải pháp off-the-shelf nào đạt production accuracy cho tài liệu Việt Nam.
- **Kiến trúc đề xuất**: Two-tier approach — lightweight OCR cho simple docs, VLM cho complex docs. Router model phân loại tự động.
- **Ưu tiên model**: PaddleOCR v4 (fine-tuned) → LayoutLMv3 → Donut. VLM chỉ dùng cho high-value documents.
- **Timeline ước tính**: 3 tháng cho MVP (hóa đơn VAT + chứng từ cơ bản), 6 tháng cho production system đầy đủ.
- **Chi phí GPU**: Ước tính $2,000-5,000/tháng cho production serving, phụ thuộc volume. Quantization có thể giảm 50%.
- **Rủi ro lớn nhất**: Data quality và model drift. Cần monitoring pipeline từ ngày đầu.
