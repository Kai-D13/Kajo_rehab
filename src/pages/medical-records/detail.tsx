import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MedicalRecord, Patient, TreatmentSession } from '@/services/supabase';
import { MockMedicalRecordService } from '@/services/mock-medical-record.service';
import { formatFullDate } from '@/utils/format';
import PolarizedList from '@/components/polarized-list';
import DoctorItem from '@/components/items/doctor';
import { MockDatabaseService } from '@/services/mock-database.service';
import NotFound from '../404';

function MedicalRecordDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<(MedicalRecord & { patient: Patient }) | null>(null);
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecord = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const medicalRecord = await MockMedicalRecordService.getRecordById(id);
        if (medicalRecord) {
          setRecord(medicalRecord);
          
          // Fetch doctor info
          if (medicalRecord.doctor_id) {
            const doctorInfo = await MockDatabaseService.getDoctorById(medicalRecord.doctor_id);
            setDoctor(doctorInfo);
          }
        }
      } catch (error) {
        console.error('Error fetching medical record:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [id]);

  const handleSessionUpdate = async (sessionId: string, updates: Partial<TreatmentSession>) => {
    if (!record) return;
    
    try {
      const updatedSession = await MockMedicalRecordService.updateTreatmentSession(
        record.id, 
        sessionId, 
        updates
      );
      
      if (updatedSession) {
        // Update local state
        const updatedRecord = {
          ...record,
          treatment_sessions: record.treatment_sessions.map(session =>
            session.id === sessionId ? updatedSession : session
          )
        };
        setRecord(updatedRecord);
      }
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div>Loading medical record...</div>
      </div>
    );
  }

  if (!record) {
    return <NotFound />;
  }

  return (
    <div className="flex w-full flex-col px-4 py-3 space-y-4">
      {/* Header */}
      <div className="flex flex-col justify-center gap-3 rounded-xl bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold">HỒ SƠ BỆNH ÁN</div>
          <div className="text-xs text-primary bg-blue-50 px-2 py-1 rounded">
            {record.status === 'active' ? 'Đang điều trị' : 'Hoàn thành'}
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-base font-medium">CÔNG TY TNHH KAJO OSTEOPATHIC</div>
          <div className="text-sm text-gray-600">
            Địa chỉ: 1662 Võ Thị Sáu, Phường Tân Định, HCM
          </div>
          <div className="text-sm text-gray-600">
            Điện thoại: 0962 977 783 - 0934 955 126
          </div>
        </div>
      </div>

      {/* Patient Info */}
      <div className="rounded-xl bg-white p-4">
        <div className="text-base font-medium mb-3">PHIẾU CHỈ ĐỊNH VÀ THEO DÕI ĐIỀU TRỊ</div>
        <PolarizedList
          items={[
            ['Họ và tên', record.patient.full_name],
            ['Mã số BN', record.patient.patient_code],
            ['Địa chỉ', record.patient.address],
            ['Giới tính', record.patient.gender === 'male' ? 'Nam' : 'Nữ'],
            ['NS', formatFullDate(new Date(record.patient.birth_date))],
            ['Ngày tạo hồ sơ', formatFullDate(new Date(record.record_date))]
          ]}
        />
      </div>

      {/* Doctor Info */}
      {doctor && (
        <div className="rounded-xl bg-white p-4">
          <div className="text-base font-medium mb-3">BÁC SĨ ĐIỀU TRỊ</div>
          <DoctorItem doctor={{
            id: parseInt(doctor.id),
            name: doctor.name,
            title: doctor.title || 'Bác sĩ',
            languages: Array.isArray(doctor.languages) ? doctor.languages.join(', ') : 'Vietnamese',
            specialties: Array.isArray(doctor.specialties) ? doctor.specialties.join(', ') : 'General',
            image: doctor.avatar || '/static/doctors/default-avatar.png',
            isAvailable: doctor.is_available
          }} />
        </div>
      )}

      {/* Diagnosis */}
      <div className="rounded-xl bg-white p-4">
        <div className="text-base font-medium mb-3">I. CHẨN ĐOÁN</div>
        <div className="space-y-2 text-sm">
          <div>- <strong>Chính:</strong> {record.diagnosis.primary_diagnosis}</div>
          {record.diagnosis.secondary_diagnosis && (
            <div>- <strong>Phụ:</strong> {record.diagnosis.secondary_diagnosis}</div>
          )}
          {record.diagnosis.complication && (
            <div>- <strong>Biến chứng:</strong> {record.diagnosis.complication}</div>
          )}
        </div>
      </div>

      {/* Treatment Plan */}
      <div className="rounded-xl bg-white p-4">
        <div className="text-base font-medium mb-3">II. PHƯƠNG PHÁP ĐIỀU TRỊ</div>
        <div className="space-y-2 text-sm">
          <div>- <strong>Phương pháp 1:</strong> {record.treatment_plan.phase1.name}</div>
          <div className="ml-4 text-gray-600">{record.treatment_plan.phase1.frequency}</div>
          <div>- <strong>Phương pháp 2:</strong> {record.treatment_plan.phase2.name}</div>
          <div className="ml-4 text-gray-600">{record.treatment_plan.phase2.frequency}</div>
        </div>
      </div>

      {/* Treatment Sessions */}
      <div className="rounded-xl bg-white p-4">
        <div className="text-base font-medium mb-3">BẢNG THEO DÕI ĐIỀU TRỊ</div>
        
        {/* Table Header */}
        <div className="grid grid-cols-5 gap-2 mb-2 text-xs font-medium bg-gray-100 p-2 rounded">
          <div>NGÀY - THỨ</div>
          <div>PP 1</div>
          <div>PP 2</div>
          <div>TỔNG SỐ PP</div>
          <div>BN XÁC NHẬN</div>
        </div>

        {/* Treatment Sessions */}
        <div className="space-y-1">
          {record.treatment_sessions.map((session, index) => (
            <TreatmentSessionRow
              key={session.id}
              session={session}
              index={index}
              onUpdate={handleSessionUpdate}
            />
          ))}
        </div>

        {/* Summary */}
        <div className="mt-4 pt-4 border-t">
          <div className="text-sm">
            <strong>Tổng buổi hoàn thành:</strong> {' '}
            {record.treatment_sessions.filter(s => s.patient_confirmation).length}/
            {record.treatment_sessions.length} buổi
          </div>
        </div>
      </div>

      {/* Notes */}
      {record.notes && (
        <div className="rounded-xl bg-white p-4">
          <div className="text-base font-medium mb-2">GHI CHÚ</div>
          <div className="text-sm text-gray-700">{record.notes}</div>
        </div>
      )}
    </div>
  );
}

interface TreatmentSessionRowProps {
  session: TreatmentSession;
  index: number;
  onUpdate: (sessionId: string, updates: Partial<TreatmentSession>) => void;
}

function TreatmentSessionRow({ session, index, onUpdate }: TreatmentSessionRowProps) {
  const handleToggle = (field: keyof TreatmentSession, value: boolean) => {
    onUpdate(session.id, { [field]: value });
  };

  return (
    <div className="grid grid-cols-5 gap-2 text-xs p-2 border rounded">
      <div>{formatFullDate(new Date(session.session_date))}</div>
      
      <div>
        <input
          type="checkbox"
          checked={session.phase1_completed}
          onChange={(e) => handleToggle('phase1_completed', e.target.checked)}
          className="w-4 h-4"
          title="Hoàn thành phương pháp 1"
        />
      </div>
      
      <div>
        <input
          type="checkbox"
          checked={session.phase2_completed}
          onChange={(e) => handleToggle('phase2_completed', e.target.checked)}
          className="w-4 h-4"
          title="Hoàn thành phương pháp 2"
        />
      </div>
      
      <div className="text-center">
        {(session.phase1_completed ? 1 : 0) + (session.phase2_completed ? 1 : 0)}
      </div>
      
      <div>
        <input
          type="checkbox"
          checked={session.patient_confirmation}
          onChange={(e) => handleToggle('patient_confirmation', e.target.checked)}
          className="w-4 h-4"
          disabled={!session.phase1_completed || !session.phase2_completed}
          title="Bệnh nhân xác nhận buổi điều trị"
        />
      </div>
    </div>
  );
}

export default MedicalRecordDetailPage;
