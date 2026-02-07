---
description: Auto-deploy Frontend (Only LMS_template/index.html) and Backend (GAS)
---

# 🚀 Auto Deployment Workflow
// turbo-all

Workflow này sẽ tự động:
1. Deploy Backend lên Google Apps Script.
2. Xử lý Frontend: Xóa file rác trong `LMS_template`, chỉ giữ `index.html`.
3. Deploy Frontend: Đẩy riêng folder `LMS_template` lên GitHub (nhánh `main`).

## 1. Sync & Prepare
// turbo
1. Run `cmd /c "copy /Y code.gs deploy_gas\Code.js && fc /b code.gs deploy_gas\Code.js"` in `.` (Sync Backend & Verify)
// turbo
2. Run `cmd /c copy /Y "LMS_template\index.html" "deploy_gas\index.html"` in `.` (Sync Frontend to GAS)

## 2. Deploy to Google Apps Script (Backend)
// turbo
3. Run `cmd /c "clasp push -f"` in `./deploy_gas` (Updates @HEAD automatically)
## 3. Deploy to GitHub (Frontend ONLY - index.html)
// turbo
4. Run `cmd /c "git checkout master"` in `.` (Ensure we are on source)
// turbo
5. Run `cmd /c "git branch -D frontend_temp 2>nul"` in `.` (Cleanup old temp)

### 3.1. Extract Frontend \u0026 Push
// turbo
6. Run `cmd /c "git subtree split --prefix LMS_template -b frontend_temp"` in `.`
// turbo
7. Run `cmd /c "git push origin frontend_temp:main -f"` in `.`
// turbo
8. Run `cmd /c "git branch -D frontend_temp"` in `.`

## 4. Troubleshooting

### 🔴 Lỗi: "branch frontend_temp not found"
- **Nguyên nhân:** Lệnh `subtree split` chạy lâu hoặc lỗi.
- **Giải pháp:** Chạy tay lại lệnh `git subtree split...`.

## 5. Report Status
Sau khi deploy xong, Agent **PHẢI** báo cáo:
1. **GAS ID:** `AKfycbypp1thCzYNOmdFQI7zBtGBb5NmYHpLTqZvlSu2hdst7Exb9e0TnXD6H3mm5gaduJ2XWQ`
2. **GitHub:** Đã push **Frontend Only** lên nhánh `main`.

### ✅ RULE: MAIN BRANCH = FRONTEND ONLY.
Tuyệt đối không push file `code.gs` hay file backend nào lên `main`.
Mọi source code đầy đủ lưu ở `master`.


