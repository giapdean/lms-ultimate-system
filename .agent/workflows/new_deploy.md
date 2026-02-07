---
description: Tự động khởi tạo Repo Github, Deploy GAS và đẩy lên Vercel cho dự án mới
---

# Quy Trình New Deploy (All-in-One)

Quy trình này sẽ tự động hóa việc đưa dự án từ máy tính lên Cloud: GitHub (lưu code), Google Apps Script (Backend), và Vercel (Frontend).

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
Tạo dự án GAS mới, đẩy code lên và triển khai Web App.

```powershell
cd deploy_gas
# Tạo project GAS mới
npx @google/clasp create --type webapp --title "LMS Backend API" --rootDir .
# Đẩy code lên
npx @google/clasp push -f
# Triển khai version mới
npx @google/clasp deploy --description "Auto Deploy V1"
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
# Link dự án (Chọn Yes/Enter cho các câu hỏi default)
npx vercel link
# Deploy lên Production
npx vercel --prod
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
