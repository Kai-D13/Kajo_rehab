import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database Types
export interface User {
  id: string;
  zalo_user_id: string;
  name: string;
  avatar?: string;
  phone?: string;
  created_at: string;
}

export interface Facility {
  id: string;
  name: string;
  address: string;
  phone: string;
  website?: string;
  created_at: string;
}

export interface Doctor {
  id: string;
  name: string;
  title?: string;
  specialties?: string[];
  languages?: string[];
  avatar?: string;
  facility_id?: string;
  is_available: boolean;
  working_schedule?: any;
  created_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id?: string;
  facility_id?: string;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  symptoms?: string[];
  description?: string;
  qr_code?: string;
  qr_code_expires_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Medical Record Types (Based on provided form)
export interface Patient {
  id: string;
  patient_code: string; // Mã số BN: 202500100
  full_name: string; // Họ và tên: Nguyễn Hoàng Vinh Hiếu
  address: string; // Địa chỉ: Masteri, phường Thảo Điền, Quận 2, thành phố Hồ Chí Minh
  birth_date: string; // NS: 13/08/1996
  gender: 'male' | 'female'; // Giới tính: Nam
  phone?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface MedicalRecord {
  id: string;
  patient_id: string;
  doctor_id: string;
  facility_id: string;
  record_date: string; // 16 giờ 0 phút ngày 29 tháng 7 năm 2025
  
  // I. Chẩn đoán
  diagnosis: {
    primary_diagnosis: string; // Viêm chóp xoay vai trái (M65)
    secondary_diagnosis?: string; // Đau thắt lưng (dã chụp MRI), đau mỏi vùng cổ - gáy (M60)
    complication?: string; // Đau khớp gối do tổn thương dây chằng chéo trước (M23)
  };

  // II. Phương pháp điều trị
  treatment_plan: {
    phase1: {
      name: string; // Xoa bóp bấm huyệt
      frequency: string; // 1 lần/ngày x 10 ngày
    };
    phase2: {
      name: string; // Điều trị bằng từ trường ngoài
      frequency: string; // 1 lần/ngày x 10 ngày
    };
  };

  // Treatment sessions tracking
  treatment_sessions: TreatmentSession[];
  
  // Additional fields
  notes?: string;
  attachments?: string[]; // URLs to uploaded images/documents
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface TreatmentSession {
  id: string;
  medical_record_id: string;
  session_date: string;
  phase1_completed: boolean;
  phase2_completed: boolean;
  patient_confirmation: boolean; // Bệnh nhân xác nhận (checkbox/ký số)
  notes?: string;
  attachments?: string[]; // Uploaded images from session
  created_at: string;
  updated_at: string;
}

// ICD Codes for diagnosis
export interface ICDCode {
  id: string;
  code: string; // M65, M60, M23
  description: string;
  category: string;
}

// Treatment Types
export interface TreatmentType {
  id: string;
  name: string;
  description?: string;
  duration_minutes?: number;
  category: 'massage' | 'magnetic_therapy' | 'exercise' | 'other';
}

// Notification settings for daily reminders
export interface NotificationSchedule {
  id: string;
  patient_id: string;
  medical_record_id: string;
  notification_type: 'daily_reminder' | 'appointment_reminder';
  message: string;
  scheduled_time: string; // Time of day for daily reminders
  is_active: boolean;
  created_at: string;
}