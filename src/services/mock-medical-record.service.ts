import { MedicalRecord, Patient, TreatmentSession, ICDCode, TreatmentType } from './supabase';

export class MockMedicalRecordService {
  private static patients: Patient[] = [
    {
      id: 'patient-dev-123',
      patient_code: '202500100',
      full_name: 'Nguyễn Hoàng Vinh Hiếu', 
      address: 'Masteri, phường Thảo Điền, Quận 2, thành phố Hồ Chí Minh',
      birth_date: '1996-08-13',
      gender: 'male',
      phone: '0962 977 783',
      email: 'vinh.hieu@email.com',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  private static medicalRecords: MedicalRecord[] = [
    {
      id: 'record-1',
      patient_id: 'patient-dev-123',
      doctor_id: '1', // Dr. Nguyễn Văn A
      facility_id: '1',
      record_date: '2025-07-29T16:00:00Z',
      diagnosis: {
        primary_diagnosis: 'Viêm chóp xoay vai trái (M65)',
        secondary_diagnosis: 'Đau thắt lưng (đã chụp MRI), đau mỏi vùng cổ - gáy (M60)',
        complication: 'Đau khớp gối do tổn thương dây chằng chéo trước (M23)'
      },
      treatment_plan: {
        phase1: {
          name: 'Xoa bóp bấm huyệt',
          frequency: '1 lần/ngày x 10 ngày'
        },
        phase2: {
          name: 'Điều trị bằng từ trường ngoài', 
          frequency: '1 lần/ngày x 10 ngày'
        }
      },
      treatment_sessions: [
        {
          id: 'session-1',
          medical_record_id: 'record-1',
          session_date: '2025-07-29',
          phase1_completed: true,
          phase2_completed: true,
          patient_confirmation: true,
          notes: 'Buổi đầu tiên, bệnh nhân cảm thấy đỡ đau',
          attachments: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'session-2',
          medical_record_id: 'record-1',
          session_date: '2025-07-30',
          phase1_completed: true,
          phase2_completed: true,
          patient_confirmation: true,
          notes: 'Tiến triển tốt',
          attachments: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'session-3',
          medical_record_id: 'record-1',
          session_date: '2025-07-31',
          phase1_completed: false,
          phase2_completed: false,
          patient_confirmation: false,
          notes: '',
          attachments: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      notes: 'Bệnh nhân hợp tác tốt trong quá trình điều trị',
      attachments: [],
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  private static icdCodes: ICDCode[] = [
    {
      id: 'icd-m65',
      code: 'M65',
      description: 'Viêm chóp xoay vai trái',
      category: 'Musculoskeletal disorders'
    },
    {
      id: 'icd-m60',
      code: 'M60',  
      description: 'Đau mỏi vùng cổ - gáy',
      category: 'Musculoskeletal disorders'
    },
    {
      id: 'icd-m23',
      code: 'M23',
      description: 'Đau khớp gối do tổn thương dây chằng chéo trước',
      category: 'Musculoskeletal disorders'
    }
  ];

  private static treatmentTypes: TreatmentType[] = [
    {
      id: 'treatment-1',
      name: 'Xoa bóp bấm huyệt',
      description: 'Phương pháp massage điều trị bằng bấm huyệt',
      duration_minutes: 30,
      category: 'massage'
    },
    {
      id: 'treatment-2', 
      name: 'Điều trị bằng từ trường ngoài',
      description: 'Liệu pháp từ trường để giảm đau và viêm',
      duration_minutes: 30,
      category: 'magnetic_therapy'
    }
  ];

  /**
   * Get all medical records for a patient
   */
  static async getPatientRecords(patientId: string): Promise<(MedicalRecord & { patient: Patient })[]> {
    await this.simulateDelay();
    
    const patientRecords = this.medicalRecords.filter(r => r.patient_id === patientId);
    const patient = this.patients.find(p => p.id === patientId);
    
    if (!patient) return [];
    
    return patientRecords.map(record => ({
      ...record,
      patient
    }));
  }

  /**
   * Get medical record by ID
   */
  static async getRecordById(recordId: string): Promise<(MedicalRecord & { patient: Patient }) | null> {
    await this.simulateDelay();
    
    const record = this.medicalRecords.find(r => r.id === recordId);
    if (!record) return null;
    
    const patient = this.patients.find(p => p.id === record.patient_id);
    if (!patient) return null;
    
    return { ...record, patient };
  }

  /**
   * Create new medical record
   */
  static async createMedicalRecord(recordData: Partial<MedicalRecord>): Promise<MedicalRecord> {
    await this.simulateDelay(1000);

    const record: MedicalRecord = {
      id: `record-${Date.now()}`,
      patient_id: recordData.patient_id!,
      doctor_id: recordData.doctor_id!,
      facility_id: recordData.facility_id!,
      record_date: recordData.record_date || new Date().toISOString(),
      diagnosis: recordData.diagnosis!,
      treatment_plan: recordData.treatment_plan!,
      treatment_sessions: recordData.treatment_sessions || [],
      notes: recordData.notes || '',
      attachments: recordData.attachments || [],
      status: recordData.status || 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.medicalRecords.push(record);
    
    // Save to localStorage for persistence
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('kajo-medical-records', JSON.stringify(this.medicalRecords));
        console.log('💾 Medical records saved to localStorage');
      } catch (error) {
        console.error('Error saving medical records to localStorage:', error);
      }
    }
    
    console.log('📋 Medical record created:', record.id);
    return record;
  }

  /**
   * Update treatment session
   */
  static async updateTreatmentSession(
    recordId: string, 
    sessionId: string, 
    updates: Partial<TreatmentSession>
  ): Promise<TreatmentSession | null> {
    await this.simulateDelay();
    
    const recordIndex = this.medicalRecords.findIndex(r => r.id === recordId);
    if (recordIndex === -1) return null;
    
    const sessionIndex = this.medicalRecords[recordIndex].treatment_sessions.findIndex(s => s.id === sessionId);
    if (sessionIndex === -1) return null;
    
    this.medicalRecords[recordIndex].treatment_sessions[sessionIndex] = {
      ...this.medicalRecords[recordIndex].treatment_sessions[sessionIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('kajo-medical-records', JSON.stringify(this.medicalRecords));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }
    
    return this.medicalRecords[recordIndex].treatment_sessions[sessionIndex];
  }

  /**
   * Get ICD codes for autocomplete
   */
  static async getICDCodes(search?: string): Promise<ICDCode[]> {
    await this.simulateDelay();
    
    if (!search) return this.icdCodes;
    
    return this.icdCodes.filter(code => 
      code.code.toLowerCase().includes(search.toLowerCase()) ||
      code.description.toLowerCase().includes(search.toLowerCase())
    );
  }

  /**
   * Get treatment types
   */
  static async getTreatmentTypes(): Promise<TreatmentType[]> {
    await this.simulateDelay();
    return this.treatmentTypes;
  }

  /**
   * Simulate API delay
   */
  private static async simulateDelay(ms: number = 500): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Load data from localStorage
   */
  static loadFromLocalStorage() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('kajo-medical-records');
        if (stored) {
          this.medicalRecords = JSON.parse(stored);
          console.log('📦 Medical records loaded from localStorage');
        }
      } catch (error) {
        console.error('Error loading medical records from localStorage:', error);
      }
    }
  }

  /**
   * Reset all data (for testing)
   */
  static resetData() {
    this.medicalRecords = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kajo-medical-records');
    }
    console.log('🔄 Medical records data reset');
  }
}

// Load data on module initialization
MockMedicalRecordService.loadFromLocalStorage();
