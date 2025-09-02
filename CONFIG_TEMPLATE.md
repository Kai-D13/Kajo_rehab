# 🔧 CONFIGURATION TEMPLATE

## Please fill in the following information to complete the integration:

### 1. **ZALO MINI APP CREDENTIALS**
```json
{
  "zalo_mini_app": {
    "app_id": "PLEASE_PROVIDE_YOUR_MINI_APP_ID",
    "app_secret": "PLEASE_PROVIDE_YOUR_APP_SECRET",
    "redirect_uri": "PLEASE_PROVIDE_YOUR_CALLBACK_URL"
  }
}
```

### 2. **ZALO OFFICIAL ACCOUNT (OA) CREDENTIALS**  
```json
{
  "zalo_oa": {
    "oa_id": "PLEASE_PROVIDE_YOUR_OA_ID",
    "access_token": "PLEASE_PROVIDE_YOUR_OA_ACCESS_TOKEN",
    "webhook_url": "PLEASE_PROVIDE_YOUR_WEBHOOK_URL",
    "verify_token": "PLEASE_PROVIDE_YOUR_VERIFY_TOKEN"
  }
}
```

### 3. **SUPABASE DATABASE CREDENTIALS**
```json
{
  "supabase": {
    "project_url": "PLEASE_PROVIDE_YOUR_SUPABASE_URL",
    "anon_key": "PLEASE_PROVIDE_YOUR_ANON_KEY", 
    "service_role_key": "PLEASE_PROVIDE_YOUR_SERVICE_ROLE_KEY"
  }
}
```

### 4. **HOSTING & DOMAIN INFORMATION**
```json
{
  "hosting": {
    "main_domain": "PLEASE_PROVIDE_YOUR_MAIN_DOMAIN",
    "reception_domain": "PLEASE_PROVIDE_YOUR_RECEPTION_DOMAIN",
    "ssl_required": true
  }
}
```

### 5. **TEST ACCOUNTS**
```json
{
  "test_accounts": [
    {
      "zalo_id": "TEST_ZALO_ID_1",
      "name": "Test User 1",
      "phone": "TEST_PHONE_1",
      "role": "patient"
    },
    {
      "zalo_id": "TEST_ZALO_ID_2", 
      "name": "Test Staff 1",
      "phone": "TEST_PHONE_2",
      "role": "reception"
    }
  ]
}
```

### 6. **BUSINESS REQUIREMENTS**
```json
{
  "clinic_settings": {
    "working_hours": {
      "start": "PLEASE_SPECIFY_START_TIME (e.g., 08:00)",
      "end": "PLEASE_SPECIFY_END_TIME (e.g., 18:00)",
      "break_start": "PLEASE_SPECIFY_BREAK_START (e.g., 12:00)",
      "break_end": "PLEASE_SPECIFY_BREAK_END (e.g., 13:00)"
    },
    "appointment_duration": "PLEASE_SPECIFY_DURATION_IN_MINUTES (e.g., 30)",
    "advance_booking_days": "PLEASE_SPECIFY_MAX_DAYS (e.g., 30)",
    "cancellation_hours": "PLEASE_SPECIFY_HOURS_BEFORE (e.g., 24)"
  }
}
```

### 7. **NOTIFICATION SETTINGS**
```json
{
  "notifications": {
    "booking_confirmation": "PLEASE_PROVIDE_MESSAGE_TEMPLATE",
    "appointment_reminder": "PLEASE_PROVIDE_REMINDER_TEMPLATE", 
    "reminder_hours_before": "PLEASE_SPECIFY_HOURS (e.g., 2)",
    "language": "PLEASE_SPECIFY_LANGUAGE (vi/en)"
  }
}
```

---

## 🚨 **PRIORITY INFORMATION NEEDED NOW:**

### **CRITICAL (Cannot proceed without these):**
1. ✅ **Zalo Mini App ID** - From Zalo Developer Console
2. ✅ **Supabase Project URL** - Your Supabase project dashboard  
3. ✅ **Basic Business Hours** - When is the clinic open?

### **IMPORTANT (Needed this week):**
1. 📋 **Zalo OA Access Token** - For sending notifications
2. 📋 **Test Accounts** - To test the complete flow
3. 📋 **Domain Names** - Where to host the applications

### **CAN WAIT (But needed before go-live):**
1. ⏳ **Detailed notification templates**
2. ⏳ **Advanced business rules**  
3. ⏳ **Staff training schedules**

---

## 📝 **HOW TO GET THIS INFORMATION:**

### **For Zalo Credentials:**
1. Visit [Zalo Developer Console](https://developers.zalo.me/)
2. Login with your Zalo account
3. Create new Mini App project
4. Copy App ID and App Secret
5. For OA: Visit [Zalo OA Console](https://oa.zalo.me/)

### **For Supabase:**
1. Visit [Supabase Dashboard](https://supabase.com/dashboard)
2. Create new project or use existing
3. Go to Settings → API
4. Copy Project URL and API Keys

### **For Business Requirements:**
1. Consult with clinic management
2. Review current appointment scheduling process
3. Identify staff roles and permissions needed

---

**Please fill in as much information as possible and I'll update the system accordingly! 🚀**
