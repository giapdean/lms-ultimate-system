// ==========================================
// 1. CẤU HÌNH HỆ THỐNG
// ==========================================
const SEPAY_CONFIG = {
  accountNumber: '0362675331',
  accountName: 'TA THIET GIAP',
  bankCode: 'TPB',
  apiToken: '5LKGZR3YANUO2VQY81IEMJP6WQEDGXTMU8JKKZRSKUJQTL5GAY4TGQDTHVFAD3CN',
};

const ZALO_GROUP_LINK = "https://zalo.me/g/uyaqhe591";

// ==========================================
// 2. API ROUTER
// ==========================================

function doGet(e) {
  if (e.parameter.action === 'check_status') {
    return createJSONOutput(checkPaymentStatus(e.parameter.code));
  }
  
  return createJSONOutput({ 
    status: 'running', 
    message: 'AI Automation Master API is active',
    timestamp: new Date()
  });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  
  if (lock.tryLock(10000)) {
    try {
      // WEBHOOK TỪ SEPAY
      if (e.postData && e.postData.type === "application/json") {
        var data = JSON.parse(e.postData.contents);
        
        if (data.transferType === 'in') {
          var content = data.content || data.description || '';
          var transactionCode = extractTransactionCode(content);
          
          if (transactionCode) {
            updatePaymentStatus(transactionCode, 'paid', data.transactionDate, data.referenceCode);
          }
        }
        return createJSONOutput({ success: true, message: 'Webhook processed' });
      }
      
      // REQUEST TỪ FRONT-END
      var action = e.parameter.action;
      
      if (action === 'register' || action === 'create_order') {
        return createJSONOutput(submitRegistration(e.parameter));
      } 
      else if (action === 'check_status') {
        return createJSONOutput(checkPaymentStatus(e.parameter.code));
      }
      else if (action === 'track_visit') {
        logVisit(e.parameter);
        return createJSONOutput({ success: true });
      }

      return createJSONOutput({ success: false, message: 'Unknown action' });

    } catch (error) {
      return createJSONOutput({ success: false, message: error.toString() });
    } finally {
      lock.releaseLock();
    }
  } else {
    return createJSONOutput({ success: false, message: 'Server busy, please try again.' });
  }
}

// ==========================================
// 3. LOGIC XỬ LÝ CHÍNH
// ==========================================

function submitRegistration(params) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('LMS') || ss.insertSheet('LMS');
    
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp', 'Email', 'Name', 'Phone', 'Package', 
        'Message', 'TransactionCode', 'Amount', 'Status', 
        'PaymentTime', 'BankTransactionID'
      ]);
    }
    
    var transactionCode = generateTransactionCode();
    
    var pkg = params.package;
    var amount = 0;
    
    if (pkg === 'marketer') {
      amount = 30000000;
    } else if (pkg === 'business') {
      amount = 70000000;
    } else if (pkg === 'custom') {
      amount = 40000000;
    } else if (pkg === 'basic') {
      amount = 499000;
    } else if (pkg === 'vip') {
      amount = 699000;
    }
    
    sheet.appendRow([
      new Date(),
      params.email,
      params.name,
      "'" + params.phone,
      pkg,
      params.message || '',
      transactionCode,
      amount,
      'pending',
      '',
      ''
    ]);
    
    var qrUrl = `https://img.vietqr.io/image/${SEPAY_CONFIG.bankCode}-${SEPAY_CONFIG.accountNumber}-compact.png?amount=${amount}&addInfo=${transactionCode}&accountName=${encodeURIComponent(SEPAY_CONFIG.accountName)}`;
    
    return { 
      success: true, 
      transactionCode: transactionCode, 
      amount: amount, 
      qrUrl: qrUrl,
      accountNumber: SEPAY_CONFIG.accountNumber,
      accountName: SEPAY_CONFIG.accountName,
      bankCode: SEPAY_CONFIG.bankCode
    };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

function updatePaymentStatus(code, status, time, bankId) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('LMS');
  var data = sheet.getDataRange().getValues();
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][6] == code) {
      sheet.getRange(i + 1, 9).setValue(status);
      sheet.getRange(i + 1, 10).setValue(time || new Date());
      sheet.getRange(i + 1, 11).setValue(bankId || '');
      
      if (status === 'paid') {
        var email = data[i][1];
        var name = data[i][2];
        var phone = data[i][3];
        var packageType = data[i][4];
        var amount = data[i][7];
        
        sendSuccessEmail(email, name, phone, packageType, code, amount);
      }
      break;
    }
  }
}

function checkPaymentStatus(code) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('LMS');
  var data = sheet.getDataRange().getValues();
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][6] === code) {
      return { 
        success: true, 
        status: data[i][8],
        name: data[i][2] 
      };
    }
  }
  return { success: false, status: 'not_found' };
}

function logVisit(params) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Analytics_TruyenNghe') || ss.insertSheet('Analytics_TruyenNghe');
    
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'Referrer', 'User Agent', 'Screen Size', 'Page URL']);
    }

    sheet.appendRow([
      new Date(),
      params.referrer || 'Direct',
      params.userAgent,
      params.screenSize,
      params.pageUrl
    ]);
  } catch(e) {
    Logger.log("Tracking Error: " + e.toString());
  }
}

// ==========================================
// 4. HÀM PHỤ TRỢ
// ==========================================

function generateTransactionCode() {
  var dateStr = Utilities.formatDate(new Date(), 'GMT+7', 'yyMMdd');
  var random = Math.floor(1000 + Math.random() * 9000);
  return 'TNAI' + dateStr + random; // Truyền Nghề AI
}

function extractTransactionCode(content) {
  var match = content.match(/TNAI\d{10}/);
  return match ? match[0] : null;
}

function createJSONOutput(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ==========================================
// 5. GỬI EMAIL XÁC NHẬN
// ==========================================
function sendSuccessEmail(email, name, phone, packageType, code, amount) {
  try {
    var formattedAmount = new Intl.NumberFormat('vi-VN').format(amount);
    
    var packageName = '';
    if (packageType === 'marketer') packageName = 'Gói Marketer (3 tháng)';
    else if (packageType === 'business') packageName = 'Gói Business Master (6 tháng)';
    else if (packageType === 'custom') packageName = 'Gói Customization';
    
    var htmlBody = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #7c3aed 0%, #DC2626 100%); padding: 35px 20px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 26px; font-weight: 800;">THANH TOÁN THÀNH CÔNG!</h1>
          <p style="margin: 10px 0 0; opacity: 0.9; font-size: 16px;">Chào mừng bạn đến với AI Automation Master</p>
        </div>
        
        <div style="padding: 30px; background-color: #ffffff;">
          <p style="font-size: 16px; color: #333;">Xin chào <strong>${name}</strong>,</p>
          <p style="color: #555; line-height: 1.6;">Hệ thống đã xác nhận thanh toán của bạn thành công. Vé tham dự khóa học <strong>${packageName}</strong> đã được kích hoạt.</p>
          
          <div style="background-color: #f8fafc; border-radius: 10px; padding: 20px; margin: 25px 0; border: 1px solid #e2e8f0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Mã đơn hàng:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #0f172a; text-align: right;">${code}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Gói học:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #0f172a; text-align: right;">${packageName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Số điện thoại:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #0f172a; text-align: right;">${phone}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b; font-size: 14px; border-top: 1px dashed #cbd5e1;"><strong>Tổng thanh toán:</strong></td>
                <td style="padding: 8px 0; font-weight: bold; color: #10b981; text-align: right; border-top: 1px dashed #cbd5e1; font-size: 18px;">${formattedAmount}đ</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin-top: 35px;">
            <p style="margin-bottom: 20px; font-weight: 700; color: #7c3aed;">👇 BƯỚC TIẾP THEO QUAN TRỌNG 👇</p>
            
            <a href="${ZALO_GROUP_LINK}" style="display: inline-block; background: #0068FF; color: white; padding: 16px 32px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(0, 104, 255, 0.3);">
              THAM GIA NHÓM ZALO HỌC VIÊN
            </a>
          </div>

          <div style="margin-top: 30px; padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>📌 Lưu ý:</strong> Bạn sẽ nhận được email hướng dẫn chi tiết về lịch học trong vòng 24h.
            </p>
          </div>
        </div>

        <div style="background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0;">Email tự động từ AI Automation Master.</p>
          <p style="margin: 5px 0 0;">Hotline: <strong>0362.675.331</strong> | <a href="https://iaction.vn" style="color: #DC2626;">iaction.vn</a></p>
          <p style="margin: 5px 0 0;">© 2026 iAction. All rights reserved.</p>
        </div>
      </div>
    `;

    MailApp.sendEmail({
      to: email,
      subject: "✅ Đăng ký thành công AI Automation Master - Mã: " + code,
      htmlBody: htmlBody,
      name: "AI Automation Master - iAction"
    });
    
  } catch(e) {
    Logger.log("Email Error: " + e.toString());
  }
}
