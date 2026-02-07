---
description: Tự động khởi tạo Repo Github, Deploy GAS và đẩy lên Vercel cho dự án mới
---

# Quy Trình New Deploy (All-in-One)

Quy trình này sẽ tự động hóa việc đưa dự án từ máy tính lên Cloud: GitHub (lưu code), Google Apps Script (Backend), và Vercel (Frontend).

## 0. Chuẩn bị Quan Trọng (BẮT BUỘC)
Trước khi bắt đầu, bạn cần lấy **Script ID** của dự án Google Apps Script mà bạn muốn deploy code vào.

**Cách lấy Script ID:**
1. Mở dự án trên [script.google.com](https://script.google.com).
2. Nhìn lên thanh địa chỉ (URL).
3. Copy chuỗi ký tự nằm giữa `/d/` và `/edit`.
   * Ví dụ: `https://script.google.com/d/`**`1ABC...XYZ`**`/edit` -> Copy `1ABC...XYZ`
4. **Gửi cho Agent:** "Đây là Script ID của tôi: [PASTE ID VÀO ĐÂY]"

---

Lưu ý: Bạn cần đăng nhập trước các công cụ sau:
- GitHub CLI: `gh auth login`
- Vercel CLI: `npx vercel login`
- Clasp (GAS): `npx @google/clasp login`

## 1. Chuẩn bị Backend (GAS)
Copy code hiện tại vào thư mục deploy để chuẩn bị đẩy lên.

```powershell
// turbo
Copy-Item "code.gs" -Destination "deploy_gas/Code.js" -Force
```

## 2. Khởi tạo & Đẩy lên GitHub
Tạo repository mới và đẩy code lên.

```powershell
// turbo
git init
git add .
git commit -m "Initial commit - Auto deploy by AI"
# Bạn có thể thay "lms-ultimate-system" bằng tên repo bạn muốn
gh repo create lms-ultimate-system --public --source=. --remote=origin --push 
```

## 3. Deploy Backend (Google Apps Script)
Kết nối với Google Sheet của bạn và tạo API.

```powershell
Write-Host "👉 Hãy nhập Google Sheet ID của bạn (Lấy từ URL, chuỗi ký tự dài ở giữa /d/ và /edit):"
$SheetID = Read-Host "Paste Sheet ID here"

cd deploy_gas
# Tạo project GAS gắn liền với Sheet (Container-bound)
cmd /c "npx @google/clasp create --type sheets --parentId $SheetID --title 'LMS Backend API' --rootDir ."

# Đẩy code lên
cmd /c "npx @google/clasp push -f"
# Triển khai version mới
cmd /c "npx @google/clasp deploy --description 'Auto Deploy V1'"
cd ..
```

**Lưu ý sau bước 3**: 
- Terminal sẽ hiện ra URL của Web App (có dạng `https://script.google.com/...`). 
- Hãy **Copy URL đó** và dán vào file `index.html` (dòng chứa `const GAS_API_URL = ...`).
- Sau đó chạy lệnh commit để lưu thay đổi URL:
```powershell
git add index.html
git commit -m "Update GAS API URL"
git push origin main
```

## 4. Deploy Frontend (Vercel)
Kết nối với Vercel và đẩy code lên môi trường Production.

```powershell
$CurrentPath = (Get-Location).Path
Write-Host "--------------------------------------------------------"
Write-Host "⚠️  NẾU CẦN ĐĂNG NHẬP THỦ CÔNG (Khi gặp lỗi credentials):"
Write-Host "1. Mở Terminal mới (PowerShell)."
Write-Host "2. Copy và chạy lệnh sau để vào đúng thư mục:"
Write-Host "   cd '$CurrentPath'"
Write-Host "3. Sau đó chạy đăng nhập:"
Write-Host "   cmd /c 'npx vercel login'"
Write-Host "--------------------------------------------------------"

# Link dự án (Chọn Yes/Enter cho các câu hỏi default)
cmd /c "npx vercel link --yes"
# Deploy lên Production
cmd /c "npx vercel --prod"
```

## 5. Tổng Kết Thông Tin Deploy
Hiển thị lại các thông tin quan trọng.

```powershell
Write-Host "---------------------------------------------------"
Write-Host "🎉 DEPLOYMENT COMPLETE! SUMMARY:"
Write-Host "---------------------------------------------------"
Write-Host "1. GitHub Repository:"
gh repo view --json url --template '{{.url}}'
Write-Host ""

Write-Host "2. Google Apps Script:"
Write-Host "Link Web App: (Xem output Step 3 ở trên)"
cd deploy_gas
Write-Host "Script ID:"
npx @google/clasp setting scriptId
cd ..
Write-Host ""

Write-Host "3. Vercel Frontend:"
Write-Host "Truy cập Dashboard: https://vercel.com/dashboard"
Write-Host "---------------------------------------------------"
```
