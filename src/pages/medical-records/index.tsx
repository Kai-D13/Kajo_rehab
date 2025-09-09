import React, { useState, useEffect } from 'react';
import { useNavigate, Page, Header, Box } from 'zmp-ui';
import { MedicalRecord, Patient } from '@/services/supabase';
import { MockDatabaseService } from '@/services/mock-database.service';
import TransitionLink from '@/components/transition-link';
import { formatFullDate } from '@/utils/format';

function MedicalRecordsPage() {
  const [records, setRecords] = useState<(MedicalRecord & { patient: Patient })[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const userRecords = MockDatabaseService.getMedicalRecords().filter(record => 
          record.patient_id === 'patient-dev-123'
        );
        setRecords(userRecords);
      } catch (error) {
        console.error('Error fetching medical records:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  if (loading) {
    return (
      <Page>
        <Header showBackIcon title="Hồ sơ bệnh án" />
        <Box className="px-4 py-3">
          <div className="text-center">Loading medical records...</div>
        </Box>
      </Page>
    );
  }

  if (records.length === 0) {
    return (
      <Page>
        <Header showBackIcon title="Hồ sơ bệnh án" />
        <Box className="px-4 py-3">
          <div className="text-center text-gray-500">No medical records found</div>
          <div className="text-center mt-4">
            <button 
              onClick={() => navigate('/medical-records/new')}
              className="bg-primary text-white px-4 py-2 rounded-lg"
            >
              Tạo hồ sơ mới
            </button>
          </div>
        </Box>
      </Page>
    );
  }

  return (
    <Page>
      <Header showBackIcon title="Hồ sơ bệnh án" />
      <Box className="px-4 py-3 space-y-3">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Hồ sơ bệnh án</h1>
          <button 
            onClick={() => navigate('/medical-records/new')}
            className="bg-primary text-white px-3 py-1 rounded text-sm"
          >
            Tạo mới
          </button>
        </div>

        {records.map((record) => (
          <MedicalRecordItem key={record.id} record={record} />
        ))}
      </Box>
    </Page>
  );
}

interface MedicalRecordItemProps {
  record: MedicalRecord & { patient: Patient };
}

function MedicalRecordItem({ record }: MedicalRecordItemProps) {
  const statusColor = {
    active: 'text-blue-600',
    completed: 'text-green-600',
    paused: 'text-yellow-600',
    cancelled: 'text-red-600'
  };

  const statusText = {
    active: 'Đang điều trị',
    completed: 'Hoàn thành',
    paused: 'Tạm dừng',
    cancelled: 'Đã hủy'
  };

  return (
    <TransitionLink
      to={`/medical-records/${record.id}`}
      className="flex w-full flex-col gap-3 rounded-xl bg-white p-4 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div className="text-base font-medium">
          BN: {record.patient.patient_code}
        </div>
        <div className={`text-xs ${statusColor[record.status]}`}>
          {statusText[record.status]}
        </div>
      </div>
      
      <hr className="border-t border-black/10" />
      
      <div className="space-y-2">
        <div>
          <span className="font-medium">Họ tên:</span> {record.patient.full_name}
        </div>
        <div>
          <span className="font-medium">Chẩn đoán:</span> {record.diagnosis.primary_diagnosis}
        </div>
        <div>
          <span className="font-medium">Ngày tạo:</span> {formatFullDate(new Date(record.record_date))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="text-sm text-gray-600">
          {record.treatment_sessions.filter(s => s.patient_confirmation).length}/{record.treatment_sessions.length} buổi hoàn thành
        </div>
        <div className="rounded-md bg-highlight px-2 py-1.5 text-primary text-xs">
          Xem chi tiết
        </div>
      </div>
    </TransitionLink>
  );
}

export default MedicalRecordsPage;
