import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MedicalRecord, Patient, TreatmentType, ICDCode } from '@/services/supabase';
import { MockMedicalRecordService } from '@/services/mock-medical-record.service';
import { MockDatabaseService } from '@/services/mock-database.service';
import FabForm from '@/components/form/fab-form';
import toast from 'react-hot-toast';
import { AuthService } from '@/services/auth.service';

function NewMedicalRecordPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [treatmentTypes, setTreatmentTypes] = useState<TreatmentType[]>([]);
  const [icdCodes, setICDCodes] = useState<ICDCode[]>([]);
  
  // Form data
  const [formData, setFormData] = useState({
    // Patient Info
    patient_code: '',
    full_name: '',
    address: '',
    birth_date: '',
    gender: 'male' as 'male' | 'female',
    phone: '',
    email: '',
    
    // Medical Record
    doctor_id: '1',
    facility_id: '1',
    primary_diagnosis: '',
    secondary_diagnosis: '',
    complication: '',
    
    // Treatment Plan
    phase1_name: '',
    phase1_frequency: '',
    phase2_name: '',
    phase2_frequency: '',
    
    notes: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [types, codes] = await Promise.all([
          MockMedicalRecordService.getTreatmentTypes(),
          MockMedicalRecordService.getICDCodes()
        ]);
        setTreatmentTypes(types);
        setICDCodes(codes);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
  }, []);

  const handleSubmit = async () => {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) {
        toast.error("Vui lòng đăng nhập!");
        return;
      }

      // Validate required fields
      if (!formData.patient_code || !formData.full_name || !formData.primary_diagnosis) {
        toast.error("Vui lòng điền đầy đủ thông tin bắt buộc!");
        return;
      }

      setLoading(true);
      toast.loading("Đang tạo hồ sơ bệnh án...", { id: "medical-record" });

      // Create patient (assuming same user for now)
      const patientId = 'patient-dev-123'; // In real app, this would be dynamic

      // Create medical record
      const recordData: Partial<MedicalRecord> = {
        patient_id: patientId,
        doctor_id: formData.doctor_id,
        facility_id: formData.facility_id,
        record_date: new Date().toISOString(),
        diagnosis: {
          primary_diagnosis: formData.primary_diagnosis,
          secondary_diagnosis: formData.secondary_diagnosis,
          complication: formData.complication
        },
        treatment_plan: {
          phase1: {
            name: formData.phase1_name,
            frequency: formData.phase1_frequency
          },
          phase2: {
            name: formData.phase2_name,
            frequency: formData.phase2_frequency
          }
        },
        treatment_sessions: [], // Will be added later
        notes: formData.notes,
        status: 'active'
      };

      const medicalRecord = await MockMedicalRecordService.createMedicalRecord(recordData);

      toast.success("Tạo hồ sơ bệnh án thành công!", { id: "medical-record" });
      console.log("✅ Medical record created:", medicalRecord);

      // Navigate to the new record detail
      navigate(`/medical-records/${medicalRecord.id}`);

    } catch (error) {
      console.error("❌ Medical record creation error:", error);
      toast.error("Tạo hồ sơ thất bại. Vui lòng thử lại!", { id: "medical-record" });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.patient_code && formData.full_name && formData.primary_diagnosis;

  return (
    <FabForm
      fab={{
        children: "Tạo hồ sơ",
        disabled: !isFormValid || loading,
        onDisabledClick() {
          toast.error("Vui lòng điền đầy đủ thông tin bắt buộc!");
        },
      }}
      onSubmit={handleSubmit}
    >
      <div className="p-4 space-y-6">
        {/* I. Thông tin bệnh nhân */}
        <div className="bg-white rounded-xl p-4 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">I. Thông tin bệnh nhân</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mã số BN <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.patient_code}
                onChange={(e) => setFormData(prev => ({...prev, patient_code: e.target.value}))}
                placeholder="202500100"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giới tính
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData(prev => ({...prev, gender: e.target.value as 'male'|'female'}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
              >
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData(prev => ({...prev, full_name: e.target.value}))}
              placeholder="Nguyễn Hoàng Vinh Hiếu"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Địa chỉ
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({...prev, address: e.target.value}))}
              placeholder="Masteri, phường Thảo Điền, Quận 2, thành phố Hồ Chí Minh"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày sinh
              </label>
              <input
                type="date"
                value={formData.birth_date}
                onChange={(e) => setFormData(prev => ({...prev, birth_date: e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
                placeholder="0962 977 783"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* II. Chẩn đoán */}
        <div className="bg-white rounded-xl p-4 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">II. Chẩn đoán</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chẩn đoán chính <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.primary_diagnosis}
              onChange={(e) => setFormData(prev => ({...prev, primary_diagnosis: e.target.value}))}
              placeholder="Viêm chóp xoay vai trái (M65)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chẩn đoán phụ
            </label>
            <input
              type="text"
              value={formData.secondary_diagnosis}
              onChange={(e) => setFormData(prev => ({...prev, secondary_diagnosis: e.target.value}))}
              placeholder="Đau thắt lưng (đã chụp MRI), đau mỏi vùng cổ - gáy (M60)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Biến chứng
            </label>
            <input
              type="text"
              value={formData.complication}
              onChange={(e) => setFormData(prev => ({...prev, complication: e.target.value}))}
              placeholder="Đau khớp gối do tổn thương dây chằng chéo trước (M23)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* III. Phương pháp điều trị */}
        <div className="bg-white rounded-xl p-4 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">III. Phương pháp điều trị</h2>
          
          <div className="space-y-3">
            <div className="border rounded-lg p-3 bg-gray-50">
              <h3 className="font-medium text-gray-800 mb-2">Giai đoạn 1</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Phương pháp</label>
                  <input
                    type="text"
                    value={formData.phase1_name}
                    onChange={(e) => setFormData(prev => ({...prev, phase1_name: e.target.value}))}
                    placeholder="Xoa bóp bấm huyệt"
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Tần suất</label>
                  <input
                    type="text"
                    value={formData.phase1_frequency}
                    onChange={(e) => setFormData(prev => ({...prev, phase1_frequency: e.target.value}))}
                    placeholder="1 lần/ngày x 10 ngày"
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-3 bg-gray-50">
              <h3 className="font-medium text-gray-800 mb-2">Giai đoạn 2</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Phương pháp</label>
                  <input
                    type="text"
                    value={formData.phase2_name}
                    onChange={(e) => setFormData(prev => ({...prev, phase2_name: e.target.value}))}
                    placeholder="Điều trị bằng từ trường ngoài"
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Tần suất</label>
                  <input
                    type="text"
                    value={formData.phase2_frequency}
                    onChange={(e) => setFormData(prev => ({...prev, phase2_frequency: e.target.value}))}
                    placeholder="1 lần/ngày x 10 ngày"
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* IV. Ghi chú */}
        <div className="bg-white rounded-xl p-4 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">IV. Ghi chú</h2>
          
          <div>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({...prev, notes: e.target.value}))}
              placeholder="Ghi chú thêm về tình trạng bệnh nhân, phương pháp điều trị..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24 focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />
          </div>
        </div>
      </div>
    </FabForm>
  );
}

export default NewMedicalRecordPage;
