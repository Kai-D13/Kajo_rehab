/**
 * Webhook Handler cho Zalo OA tại kajorehab.gt.tc
 * Xử lý các events từ Zalo OA
 */
import express from 'express';
import crypto from 'crypto';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS cho domain hosting
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://kajorehab.gt.tc');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

/**
 * Verify webhook signature từ Zalo
 */
function verifyZaloSignature(body: string, signature: string): boolean {
  const appSecret = process.env.ZALO_OA_APP_SECRET || '1Yb5YMVFGwGB7J7mSR9C';
  const expectedSignature = crypto
    .createHmac('sha256', appSecret)
    .update(body)
    .digest('hex');
  
  return signature === expectedSignature;
}

/**
 * Webhook endpoint chính cho Zalo OA
 */
app.post('/webhook/zalo-oa', async (req, res) => {
  try {
    console.log('🔔 Webhook received from Zalo OA');
    
    const signature = req.headers['x-zalo-signature'] as string;
    const body = JSON.stringify(req.body);
    
    // Verify signature (production security)
    if (process.env.NODE_ENV === 'production' && signature) {
      if (!verifyZaloSignature(body, signature)) {
        console.error('❌ Invalid webhook signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }
    
    const event = req.body;
    console.log('📨 Event data:', JSON.stringify(event, null, 2));
    
    // Xử lý các loại event khác nhau theo Zalo OA Webhook docs
    switch (event.event_name) {
      case 'follow':
        await handleFollowEvent(event);
        break;
        
      case 'unfollow':
        await handleUnfollowEvent(event);
        break;
        
      case 'user_send_text':
        await handleUserMessage(event);
        break;
        
      case 'user_send_image':
        await handleUserImage(event);
        break;
        
      case 'user_send_sticker':
        await handleUserSticker(event);
        break;
        
      case 'user_click_chatnow':
        await handleChatNowClick(event);
        break;
        
      default:
        console.log('ℹ️ Unhandled event type:', event.event_name);
    }
    
    // Zalo yêu cầu response 200 OK
    res.status(200).json({ 
      status: 'success',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Xử lý khi user follow OA
 */
async function handleFollowEvent(event: any) {
  console.log('👋 New follower:', event.follower);
  
  const welcomeMessage = `🏥 Chào mừng bạn đến với KajoTai Rehab Clinic!

✨ Chúng tôi chuyên cung cấp dịch vụ:
• Vật lý trị liệu
• Phục hồi chức năng
• Massage trị liệu
• Châm cứu

📱 Để đặt lịch khám, vui lòng:
1. Mở Zalo Mini App "KajoTai Rehab"
2. Chọn dịch vụ và thời gian
3. Hoàn tất đặt lịch

📞 Hotline: [Số điện thoại]
📍 Địa chỉ: [Địa chỉ phòng khám]

Cảm ơn bạn đã tin tưởng! 🙏`;

  try {
    const response = await fetch('https://openapi.zalo.me/v2.0/oa/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': process.env.ZALO_OA_ACCESS_TOKEN || ''
      },
      body: JSON.stringify({
        recipient: {
          user_id: event.follower.id
        },
        message: {
          text: welcomeMessage
        }
      })
    });
    
    const result = await response.json();
    console.log('✅ Welcome message sent:', result);
    
  } catch (error) {
    console.error('❌ Failed to send welcome message:', error);
  }
}

/**
 * Xử lý khi user unfollow OA
 */
async function handleUnfollowEvent(event: any) {
  console.log('👋 User unfollowed:', event.follower);
  // Log để analytics, không gửi message (user đã unfollow)
}

/**
 * Xử lý tin nhắn từ user
 */
async function handleUserMessage(event: any) {
  const userId = event.sender.id;
  const messageText = event.message.text.toLowerCase();
  
  console.log(`💬 Message from ${userId}: ${messageText}`);
  
  let responseMessage = '';
  
  // Auto-reply dựa trên keywords
  if (messageText.includes('đặt lịch') || messageText.includes('booking')) {
    responseMessage = `📅 Để đặt lịch khám, bạn vui lòng:

1️⃣ Mở Zalo Mini App "KajoTai Rehab"
2️⃣ Chọn dịch vụ phù hợp
3️⃣ Chọn thời gian khám
4️⃣ Hoàn tất thông tin

📱 Link Mini App: [ZMP Link]
🕐 Giờ làm việc: 8:00 - 17:00 (T2-T7)`;
    
  } else if (messageText.includes('giá') || messageText.includes('chi phí')) {
    responseMessage = `💰 BẢNG GIÁ DỊCH VỤ:

🔸 Vật lý trị liệu: 200,000đ/buổi
🔸 Massage trị liệu: 150,000đ/buổi  
🔸 Châm cứu: 250,000đ/buổi
🔸 Phục hồi chức năng: 300,000đ/buổi

💳 Chấp nhận: Tiền mặt, chuyển khoản
📞 Tư vấn chi tiết: [SĐT]`;
    
  } else if (messageText.includes('địa chỉ') || messageText.includes('đường')) {
    responseMessage = `📍 THÔNG TIN LIÊN HỆ:

🏥 KajoTai Rehab Clinic
📍 Địa chỉ: [Địa chỉ chi tiết]
📞 Hotline: [Số điện thoại]
🕐 Giờ làm việc: 8:00-17:00 (T2-T7)

🚗 Cách đi: [Hướng dẫn đường đi]
🅿️ Bãi đậu xe: Có sẵn`;
    
  } else {
    responseMessage = `Cảm ơn bạn đã nhắn tin! 

📱 Để được hỗ trợ nhanh nhất:
• Đặt lịch: Sử dụng Zalo Mini App
• Tư vấn: Gọi [SĐT] 
• Khẩn cấp: Liên hệ trực tiếp

Chúng tôi sẽ phản hồi sớm nhất! 🙏`;
  }
  
  // Gửi auto-reply
  try {
    await fetch('https://openapi.zalo.me/v2.0/oa/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': process.env.ZALO_OA_ACCESS_TOKEN || ''
      },
      body: JSON.stringify({
        recipient: {
          user_id: userId
        },
        message: {
          text: responseMessage
        }
      })
    });
    
    console.log('✅ Auto-reply sent');
    
  } catch (error) {
    console.error('❌ Failed to send auto-reply:', error);
  }
}

/**
 * Xử lý hình ảnh từ user
 */
async function handleUserImage(event: any) {
  console.log('📷 User sent image:', event.message);
  
  const responseMessage = `📷 Cảm ơn bạn đã gửi hình ảnh!

Nếu đây là ảnh liên quan đến tình trạng sức khỏe:
📞 Vui lòng gọi trực tiếp: [SĐT]
🏥 Hoặc đến trực tiếp phòng khám để bác sĩ thăm khám

⚠️ Lưu ý: Không tự chẩn đoán qua hình ảnh
Cần khám trực tiếp để có kết quả chính xác.`;
  
  try {
    await fetch('https://openapi.zalo.me/v2.0/oa/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': process.env.ZALO_OA_ACCESS_TOKEN || ''
      },
      body: JSON.stringify({
        recipient: {
          user_id: event.sender.id
        },
        message: {
          text: responseMessage
        }
      })
    });
    
  } catch (error) {
    console.error('❌ Failed to reply to image:', error);
  }
}

/**
 * Xử lý sticker từ user
 */
async function handleUserSticker(event: any) {
  console.log('😊 User sent sticker:', event.message);
  
  const responseMessage = `😊 Cảm ơn bạn!

📱 Để đặt lịch khám: Sử dụng Zalo Mini App KajoTai
📞 Cần hỗ trợ: Gọi [SĐT]
🏥 Địa chỉ: [Clinic Address]

Chúc bạn một ngày tốt lành! 🌟`;
  
  try {
    await fetch('https://openapi.zalo.me/v2.0/oa/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': process.env.ZALO_OA_ACCESS_TOKEN || ''
      },
      body: JSON.stringify({
        recipient: {
          user_id: event.sender.id
        },
        message: {
          text: responseMessage
        }
      })
    });
    
  } catch (error) {
    console.error('❌ Failed to reply to sticker:', error);
  }
}

/**
 * Xử lý click chat now button
 */
async function handleChatNowClick(event: any) {
  console.log('💬 User clicked chat now:', event.sender.id);
  
  const welcomeMessage = `💬 Chào mừng bạn đến với KajoTai Rehab Clinic!

🔸 Đặt lịch khám: Sử dụng Mini App
🔸 Tư vấn: Nhắn tin trực tiếp
🔸 Khẩn cấp: Gọi [SĐT]

Tôi có thể giúp gì cho bạn? 😊`;
  
  try {
    await fetch('https://openapi.zalo.me/v2.0/oa/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': process.env.ZALO_OA_ACCESS_TOKEN || ''
      },
      body: JSON.stringify({
        recipient: {
          user_id: event.sender.id
        },
        message: {
          text: welcomeMessage
        }
      })
    });
    
  } catch (error) {
    console.error('❌ Failed to send chat now response:', error);
  }
}

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'KajoTai Rehab Webhook',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

/**
 * Test endpoint cho webhook
 */
app.get('/webhook/zalo-oa', (req, res) => {
  const challenge = req.query.challenge;
  
  if (challenge) {
    console.log('✅ Webhook verification successful');
    res.send(challenge);
  } else {
    res.json({
      message: 'KajoTai Rehab OA Webhook is running',
      endpoint: 'POST /webhook/zalo-oa',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Manual test endpoint
 */
app.post('/test/send-message', async (req, res) => {
  const { userId, message } = req.body;
  
  if (!userId || !message) {
    return res.status(400).json({ error: 'userId and message required' });
  }
  
  try {
    const response = await fetch('https://openapi.zalo.me/v2.0/oa/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': process.env.ZALO_OA_ACCESS_TOKEN || ''
      },
      body: JSON.stringify({
        recipient: { user_id: userId },
        message: { text: message }
      })
    });
    
    const result = await response.json();
    res.json(result);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Server error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 KajoTai Webhook Server running on port ${PORT}`);
  console.log(`📡 Webhook URL: https://kajorehab.gt.tc/webhook/zalo-oa`);
  console.log(`🏥 Health check: https://kajorehab.gt.tc/health`);
});

export default app;
