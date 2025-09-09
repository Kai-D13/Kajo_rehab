// Medical Record Service - Stub implementation to avoid errors
export const MedicalRecordService = {
  async getMedicalRecords(userId: string) { 
    console.log('📋 Getting medical records for user:', userId);
    return []; 
  },
  
  async createMedicalRecord(payload: any) { 
    console.log('📋 Creating medical record:', payload);
    return { ok: true, id: crypto.randomUUID() }; 
  },
  
  async updateMedicalRecord(id: string, payload: any) {
    console.log('📋 Updating medical record:', id, payload);
    return { ok: true, id };
  },
  
  async deleteMedicalRecord(id: string) {
    console.log('📋 Deleting medical record:', id);
    return { ok: true };
  }
};

// For backward compatibility
export const MockDatabaseService = {
  getMedicalRecords: MedicalRecordService.getMedicalRecords
};

export default MedicalRecordService;
