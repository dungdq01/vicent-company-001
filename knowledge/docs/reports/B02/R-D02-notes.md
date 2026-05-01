# Ghi chú Finance Expert: B02 — Document Intelligence
## Tác giả: R-D02 — Ngày: 2026-03-31

---

## Góc nhìn chuyên môn

Từ góc nhìn chuyên gia tài chính, Document Intelligence phải được thiết kế xoay quanh quy trình kế toán và tài chính thực tế tại doanh nghiệp Việt Nam. Đây không đơn thuần là bài toán công nghệ — mà là bài toán nghiệp vụ. Mỗi loại chứng từ có quy định pháp lý riêng, format riêng, và quy trình xử lý riêng theo Luật Kế toán 2015, chuẩn mực kế toán Việt Nam (VAS — Vietnamese Accounting Standards), và các thông tư của Bộ Tài chính.

Hóa đơn điện tử (e-invoice) theo Nghị định 123/2020/NĐ-CP là use case số 1 cho Document Intelligence tại Việt Nam. Từ 01/07/2022, tất cả doanh nghiệp bắt buộc sử dụng hóa đơn điện tử. Hóa đơn có format XML chuẩn (theo Thông tư 78/2021/TT-BTC) nhưng thực tế doanh nghiệp vẫn cần xử lý: ảnh chụp hóa đơn giấy cũ, hóa đơn PDF từ supplier, hóa đơn in từ máy POS, và hóa đơn scan từ đối tác nước ngoài. Document Intelligence cần handle tất cả variants này.

Các trường thông tin bắt buộc trên hóa đơn VAT theo quy định bao gồm: ký hiệu mẫu số, ký hiệu hóa đơn, số hóa đơn, ngày tháng năm lập, tên/địa chỉ/MST người bán, tên/địa chỉ/MST người mua, tên hàng hóa dịch vụ, đơn vị tính, số lượng, đơn giá, thành tiền, thuế suất, tiền thuế, tổng tiền thanh toán. Extraction phải đạt 99%+ accuracy cho các trường tài chính (số tiền, thuế, MST) vì sai lệch dẫn đến sai sổ sách, bị phạt khi thanh tra thuế.

Bên cạnh hóa đơn, doanh nghiệp Việt Nam xử lý hàng loạt chứng từ kế toán khác: phiếu thu, phiếu chi, phiếu nhập kho, phiếu xuất kho, giấy báo nợ/có ngân hàng (bank statement), bảng lương, hợp đồng mua bán, biên bản giao nhận, tờ khai thuế. Mỗi loại có template khác nhau tùy doanh nghiệp nhưng các trường cốt lõi giống nhau. Document Intelligence cần identify loại chứng từ và extract đúng trường cho từng loại.

Đối soát (reconciliation) là quy trình tài chính quan trọng nhất mà Document Intelligence có thể tự động hóa. Hiện tại, kế toán viên dành 30-40% thời gian cho đối soát — so khớp hóa đơn với đơn hàng (PO matching), so khớp hóa đơn với phiếu nhập kho, so khớp chứng từ ngân hàng với sổ quỹ. Document Intelligence extract data từ tất cả chứng từ liên quan, hệ thống tự động đối soát và flag discrepancies (sự chênh lệch). Tiết kiệm hàng trăm giờ nhân công mỗi tháng.

## Khuyến nghị kỹ thuật

1. **Phân loại chứng từ kế toán Việt Nam**: Xây dựng taxonomy (phân loại) đầy đủ:
   - **Chứng từ bán hàng**: Hóa đơn GTGT, hóa đơn bán hàng, phiếu xuất kho
   - **Chứng từ mua hàng**: Hóa đơn mua vào, phiếu nhập kho, đơn đặt hàng
   - **Chứng từ tiền**: Phiếu thu, phiếu chi, giấy báo nợ/có, sổ quỹ tiền mặt
   - **Chứng từ kho**: Phiếu nhập, phiếu xuất, phiếu kiểm kê, thẻ kho
   - **Chứng từ lương**: Bảng chấm công, bảng lương, phiếu lương
   - **Chứng từ thuế**: Tờ khai thuế GTGT, thuế TNCN, thuế TNDN
   - **Chứng từ khác**: Hợp đồng, biên bản, giấy ủy quyền

2. **Extraction Schema cho Hóa đơn VAT**:
```json
{
  "invoice_template": "01GTKT0/001",
  "invoice_series": "AA/22E",
  "invoice_number": "0000123",
  "invoice_date": "2026-03-15",
  "seller": {
    "name": "Công ty TNHH ABC",
    "tax_id": "0123456789",
    "address": "123 Nguyễn Huệ, Q.1, TP.HCM"
  },
  "buyer": {
    "name": "Công ty CP XYZ",
    "tax_id": "9876543210",
    "address": "456 Lê Lợi, Q.1, TP.HCM"
  },
  "items": [
    {
      "description": "Dịch vụ tư vấn",
      "unit": "Lần",
      "quantity": 1,
      "unit_price": 50000000,
      "amount": 50000000
    }
  ],
  "subtotal": 50000000,
  "vat_rate": 10,
  "vat_amount": 5000000,
  "total": 55000000,
  "total_in_words": "Năm mươi lăm triệu đồng"
}
```

3. **Mã số thuế (MST) Validation**: MST Việt Nam có 10 số (doanh nghiệp) hoặc 13 số (chi nhánh, có dấu "-" tách). Implement checksum validation theo công thức của Tổng cục Thuế. Cross-reference với API tra cứu MST công khai để verify tên doanh nghiệp khớp với MST.

4. **Số tiền bằng chữ Validation**: Hóa đơn VN có "Tổng tiền bằng chữ" — dùng để cross-validate với số. Xây module convert số → chữ tiếng Việt (xử lý đặc thù: "mươi"/"mười", "lăm"/"năm", "linh"/"lẻ") và so khớp với OCR result. Mismatch = red flag.

5. **3-Way Matching Automation**: Tự động đối soát 3 chiều:
   - Purchase Order (đơn đặt hàng) → Invoice (hóa đơn) → Goods Receipt (phiếu nhập kho)
   - Match criteria: supplier name, item descriptions, quantities, unit prices, totals
   - Tolerance thresholds: ±1% cho số tiền, ±5% cho số lượng (cho phép hao hụt)
   - Auto-approve nếu match 100%, route to human review nếu discrepancy

6. **Bank Statement Processing**: Xử lý sao kê ngân hàng (bank statement) — format khác nhau mỗi ngân hàng (Vietcombank, BIDV, Techcombank, MB...). Extract: ngày giao dịch, số tham chiếu, nội dung, số tiền ghi nợ/có, số dư. Auto-matching với phiếu thu/chi trong sổ sách.

7. **Thuế GTGT Input/Output Tracking**: Tự động phân loại hóa đơn đầu vào (mua hàng, được khấu trừ thuế) vs đầu ra (bán hàng, phải nộp thuế). Tính toán thuế GTGT phải nộp = Output VAT - Input VAT. Feed trực tiếp vào tờ khai thuế GTGT (mẫu 01/GTGT).

8. **Bảng lương Processing**: Extract thông tin từ bảng lương: họ tên, MST cá nhân, lương gross, các khoản giảm trừ (BHXH 8%, BHYT 1.5%, BHTN 1%), giảm trừ gia cảnh, thu nhập chịu thuế, thuế TNCN, lương net. Validate: tổng cột phải khớp, thuế suất TNCN đúng theo biểu thuế lũy tiến.

9. **Compliance Monitoring Dashboard**: Dashboard cho kế toán trưởng/CFO:
   - Số hóa đơn xử lý hôm nay / tháng này
   - Tỷ lệ auto-approved vs needs-review
   - Top discrepancies (chênh lệch lớn nhất)
   - Hóa đơn quá hạn chưa hạch toán (theo quy định 5 ngày)
   - VAT input/output summary cho kỳ thuế hiện tại

10. **Lưu trữ chứng từ theo Luật Kế toán**: Theo Luật Kế toán 2015, chứng từ kế toán phải lưu trữ tối thiểu:
    - Chứng từ kế toán thông thường: 5 năm
    - Chứng từ liên quan đến tài sản cố định: suốt thời gian sử dụng + 5 năm
    - Chứng từ có tính lịch sử: vĩnh viễn
    System phải enforce retention policies theo quy định, auto-archive, và không cho phép xóa trước hạn.

## Rủi ro & Thách thức

1. **Sai lệch số liệu tài chính**: Extraction error trên trường Tổng tiền hoặc MST dẫn đến hạch toán sai, khai thuế sai. Hậu quả: bị phạt hành chính (phạt 20% số thuế thiếu theo Luật Quản lý thuế), nặng hơn có thể bị truy cứu hình sự. Accuracy 99%+ là bắt buộc, và mọi extraction phải có human verification trước khi hạch toán.

2. **Thay đổi quy định**: Bộ Tài chính thường xuyên ban hành thông tư mới — thay đổi mẫu hóa đơn, biểu thuế, quy trình khai thuế. System cần adapt nhanh — configurable extraction templates, thuế suất, validation rules. Đội ngũ phải monitor Công báo và cập nhật system trong vòng 30 ngày khi có quy định mới.

3. **Đa dạng template hóa đơn**: Mỗi nhà cung cấp phần mềm hóa đơn điện tử (VNPT, Viettel, BKAV, MobiFone, FPT) có template khác nhau dù cùng chuẩn XML. Document Intelligence cần handle 20+ template variants phổ biến, cộng với hóa đơn tự in của doanh nghiệp lớn.

4. **Chữ ký số và xác thực**: Hóa đơn điện tử phải có chữ ký số hợp lệ. System cần verify digital signature, không chỉ extract nội dung. Nếu chữ ký không hợp lệ → flag cho user, không tự động hạch toán.

5. **Tỷ giá ngoại tệ**: Doanh nghiệp xuất nhập khẩu có hóa đơn bằng USD, EUR, JPY... Cần convert sang VND theo tỷ giá Ngân hàng Nhà nước tại ngày giao dịch. Sai tỷ giá = sai sổ sách. System cần auto-fetch tỷ giá NHNN và apply đúng cho từng giao dịch.

## Công cụ & Thư viện đề xuất

| Công cụ | Mục đích | Ghi chú |
|---------|---------|---------|
| **API Tra cứu MST** | Verify mã số thuế | masothue.com API |
| **VNPT/Viettel eInvoice API** | Hóa đơn điện tử | Lấy XML gốc |
| **python-docx / openpyxl** | Xử lý Word/Excel templates | Chứng từ nội bộ |
| **VNĐ number-to-words** | Số tiền bằng chữ | Validate cross-check |
| **Exchange Rate API (NHNN)** | Tỷ giá ngoại tệ | SBV daily rates |
| **xml.etree / lxml** | Parse hóa đơn XML | E-invoice standard |
| **PyPDF2 / pdfplumber** | Extract from PDF invoices | Table extraction |
| **dateparser** | Parse ngày tháng VN | "15 tháng 3 năm 2026" |
| **Pandas** | Data reconciliation | 3-way matching |
| **SAP RFC connector** | ERP integration | SAP Việt Nam |
| **MISA API** | ERP integration | MISA Việt Nam |

## Ghi chú cho R-σ (Consolidation)

- **Use case #1**: Hóa đơn VAT (Nghị định 123/2020). 99%+ accuracy bắt buộc cho số tiền và MST. Hậu quả sai: phạt thuế 20%.
- **Chứng từ taxonomy**: 7 nhóm chính, 20+ loại chứng từ. Mỗi loại cần extraction schema riêng.
- **Đối soát tự động**: 3-way matching (PO → Invoice → Goods Receipt). Tiết kiệm 30-40% thời gian kế toán.
- **Compliance**: Luật Kế toán 2015 — lưu trữ 5 năm minimum. Nghị định 13/2023 — bảo vệ dữ liệu. Thông tư 78/2021 — format hóa đơn điện tử.
- **ROI calculation**: 5 kế toán × 15 triệu/tháng = 75 triệu. Tự động 80% → tiết kiệm 60 triệu/tháng + giảm errors.
- **Critical**: Human-in-the-loop bắt buộc cho financial documents. Không bao giờ full-auto hạch toán.
- **Integration targets**: MISA, SAP, Fast, Bravo. API tra cứu MST. VNPT/Viettel eInvoice API. NHNN exchange rates.
