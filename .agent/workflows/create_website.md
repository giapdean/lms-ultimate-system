---
description: Quy trình Thiết kế & Code Website chuẩn Premium UX/UI (BẮT BUỘC khi User yêu cầu làm web mới)
---

# 🎨 Quy trình Design & Build Website (Premium UX/UI)

Workflow này giúp biến yêu cầu sơ khai của User thành một giao diện **Premium Dark Mode Dashboard** (tương tự mẫu LMS đã làm).

## 🟢 Phase 1: Thấu hiểu (Consultation)
**KHI USER YÊU CẦU:** "Tạo cho tôi một website..." hoặc "Design giao diện..."

**BẠN PHẢI HỎI (Copy câu này):**
> "Để thiết kế giao diện chuẩn Premium cho bạn, tôi cần vài thông tin cốt lõi:
>
> **A. CHIẾN LƯỢC & MỤC TIÊU:**
> 1.  **Mục tiêu chính của LDP:** (Bán hàng ngay? Thu thập Lead tư vấn? Hay chỉ giới thiệu thương hiệu?)
> 2.  **Đối tượng khách hàng:** (Họ là ai? Độ tuổi? Nỗi đau lớn nhất họ đang gặp phải là gì?)
> 3.  **USP (Unique Selling Point):** (Sản phẩm của bạn có gì khác biệt so với đối thủ? Tại sao khách phải mua NGAY?)
>
> **B. THÔNG TIN CƠ BẢN:**
> 4.  **Tên Brand/Dự án:** (Để làm Logo/Header)
> 5.  **Màu chủ đạo (Primary Color):** (Mặc định là **Đỏ #DC2626**. Bạn có muốn giữ nguyên hay đổi sang màu khác?)
> 6.  **Cấu trúc nội dung:**
>     *   *(Gợi ý cấu trúc LDP Bán Hàng chuẩn):*
>         1. **Hero Section:** Headline hấp dẫn + Subheadline + Hình ảnh/Video + CTA ngay trên đầu.
>         2. **Pain Point:** Nêu vấn đề/Nỗi đau của khách hàng.
>         3. **Solution & USP:** Giới thiệu giải pháp & Lợi ích độc nhất.
>         4. **Social Proof:** Feedback/Case Study/Logo đối tác.
>         5. **Pricing & Promotion:** Bảng giá + **Ưu đãi giới hạn (Đếm ngược thời gian)**.
>         6. **FAQ:** Câu hỏi thường gặp.
>         7. **Final CTA:** Lời kêu gọi hành động cuối cùng.
>         8. **Footer:** Thông tin liên hệ.
>     *   Bạn có muốn dùng cấu trúc này không? Hay muốn thêm/bớt mục nào?
>
> **C. KỸ THUẬT & THANH TOÁN:**
> 7.  **Dữ liệu quan trọng:** Những con số nào cần User chú ý nhất? (Để đưa lên Cards nổi bật)
> 8.  **(Nếu có thanh toán):** Bạn có dùng **SePay** không? Xin cung cấp (để config webhook & API):
>     *   Số tài khoản:
>     *   Ngân hàng (MB, VCB,...):
>     *   Tên chủ tài khoản:
>     *   SePay API Token (để kiểm tra giao dịch):
> 9.  **Marketing & Support:**
>     *   Link nhóm Zalo/Telegram (để gửi trong mail cảm ơn):
> 10. **Backend Flow (Quy trình xử lý):** Bạn muốn hệ thống hoạt động thế nào?
>     *   *(Mặc định):* Khách điền Form -> Tạo QR Thanh toán -> Webhook báo về Sheet -> Gửi Email xác nhận kèm Link Zalo.
>     *   *(Tùy chọn):* Chỉ lưu Sheet? Không cần thanh toán? Có gửi Email không?
>     *   *(Agent sẽ config code.gs theo yêu cầu này)*"

---

## 🟡 Phase 2: Bộ Gen thiết kế (The Design System DNA)
Sau khi User cung cấp thông tin, bạn **BẮT BUỘC** sử dụng các nguyên tắc sau khi code HTML/CSS. **KHÔNG** dùng style mặc định trình duyệt.

### 1. Màu sắc (Color Palette) - Dark Mode Only
-   **Background Chính:** `#050507` (Deep Black - tạo chiều sâu hơn #000).
-   **Card Background:** `#121216` (Nhẹ hơn nền, nổi bật khối).
-   **Border:** `1px solid #1F1F23` (Viền siêu mỏng, tinh tế).
-   **Text Chính:** `White` hoặc `#FAFAFA`.
-   **Text Phụ:** `#A1A1AA` (Zinc 400 - Đọc dịu mắt, không dùng Gray thường).
-   **Accent:** Dùng Gradient cho trạng thái Active (Ví dụ: `linear-gradient(90deg, rgba(220,38,38,0.15), transparent)`).

### 2. Hiệu ứng (Effects) - The "Premium" Feel
-   **Glassmorphism:** Dùng cho Header/Modal.
    ```css
    backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
    background: rgba(5,5,7,0.8);
    ```
-   **Glow & Shadow:**
    ```css
    box-shadow: 0 0 40px rgba(VarColor, 0.15);
    ```
-   **Gradient Text (Cho Headline):**
    ```css
    background: linear-gradient(to right, #FFF, #A1A1AA);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    ```
-   **Animated Border (Cho Card VIP):**
    Dùng kỹ thuật `::before` với `background: conic-gradient(...)` để tạo viền xoay chuyển động.
-   **Scroll Reveal:**
    Mặc định 100% các section phải có `opacity: 0; transform: translateY(20px);` và dùng JS `IntersectionObserver` để hiện dần khi cuộn.

### 3. Typography & Icons
-   **Font:** Inter, Outfit, hoặc System Font (San-serif modern).
-   **Icons:** **Lucide Icons** (Bắt buộc). Nét mảnh (Stroke 1.5-2px), size chuẩn 16px-24px.
-   **Uppercase Label:** Các tiêu đề phụ dùng `font-size: 10-11px; text-transform: uppercase; letter-spacing: 0.05em;`.

### 4. Layout (Grid & Flexbox)
-   **Dashboard:** Luôn dùng CSS Grid `grid-template-columns: repeat(4, 1fr)` cho các Card thống kê.
-   **Sidebar:** Fixed width (240-280px), Sticky position.

---

## 🔴 Phase 3: Thực thi (Implementation)
Khi viết code (file `index.html` hoặc `style.css`), hãy copy cấu trúc CSS chuẩn này làm nền tảng:

```css
/* --- CORE VARIABLES --- */
:root {
  --bg-dark: #050507;
  --card-bg: #121216;
  --border: #1F1F23;
  --text-main: #FFFFFF;
  --text-sub: #A1A1AA;
  --accent: #DC2626; /* Màu user chọn */
  --accent-glow: rgba(220, 38, 38, 0.15);
}

body {
  background-color: var(--bg-dark);
  color: var(--text-main);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  margin: 0;
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* --- COMPONENT: CARD --- */
.premium-card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s;
}
.premium-card:hover {
  transform: translateY(-2px);
  border-color: rgba(255,255,255,0.1);
}

/* --- COMPONENT: BUTTON --- */
.btn-primary {
  background: var(--accent);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
```

## 🔵 Phase 4: Kiểm tra UX (Checklist)
Trước khi giao cho User, tự check:
1.  [ ] **Độ tương phản:** Chữ phụ (`#A1A1AA`) có dễ đọc trên nền tối không?
2.  **Spacing:** Padding trong Card tối thiểu `20px-24px` (Không làm chật chội).
3.  **Empty State:** Nếu không có dữ liệu, hiện Icon + Thông báo đẹp (đừng để trống trơn).
4.  **Loading:** Có Skeleton hoặc Spinner khi load dữ liệu không?

---

## 🟣 Phase 5: Deploy & Handover (MỚI)
Quy trình bàn giao và đưa website lên mạng:

1.  **File Naming (QUAN TRỌNG):**
    *   Đặt tên file/ảnh 100% Tiếng Anh, chữ thường, gạch ngang (kebab-case).
    *   🚫 Cấm: `Quản Lý.png`, `Image 1.jpg`, `My File.css`.
    *   ✅ Chuẩn: `admin-dashboard.png`, `image-01.jpg`, `style.css`.
    *   *(Lý do: Tránh lỗi 404 trên môi trường Linux/Vercel)*.

2.  **Encoding:** File `.html`, `.js` bắt buộc lưu chuẩn **UTF-8**. -> *Tránh lỗi font tiếng Việt*.
3.  **Deploy Workflow:** Luôn dùng workflow `/new_deploy` để tự động hóa.
    *   Lưu ý: Dùng `cmd /c` nếu chạy trên PowerShell.
    *   Lưu ý: Check kỹ thư mục (`cd` đúng chỗ) trước khi deploy.
4.  **Backend Link:** Nếu có Google Apps Script, phải chọn mode `Container-bound` (gắn với Sheet ID) để dữ liệu đổ về đúng chỗ.
5.  **First Run Auth (QUAN TRỌNG):** Sau khi deploy, BẮT BUỘC vào Editor chạy thử hàm `checkPaymentStatus` hoặc `doGet` một lần để cấp quyền gửi Email (`MailApp`) và đọc Sheet. Nếu không, Webhook sẽ lỗi quyền truy cập.
