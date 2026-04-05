import { useState } from 'react';
import {
  ClipboardList,
  Users,
  Shield,
  Home,
  FileText,
  ListChecks,
  Clock,
  BookOpen,
  MapPin,
  Clock3,
  Phone,
  Smile,
  Timer,
} from 'lucide-react';

const MOCK_RESULT = {
  patient_name: 'Isabella Garcia',
  referral_summary:
    'Persistent chest pains and shortness of breath (~2 weeks). Fainted twice in past 3 days.',
  detected_specialty: 'Cardiology',
  specialty_simple_name: 'Heart Doctor',
  urgency_level: 'high',
  referred_specialty: 'Cardiology',
  missing_info: [
    'MRI report',
    'Insurance authorization',
    'Prior cardiology notes',
  ],
  tasks: [
    { task: 'Get MRI', responsible: 'Patient', status: 'Missing' },
    { task: 'Insurance authorization', responsible: 'PCP', status: 'Pending' },
    { task: 'Prior cardiology notes', responsible: 'PCP', status: 'Missing' },
  ],
  patient_friendly_explanation:
    'Before seeing the heart doctor, you need an MRI scan and insurance approval.',
  translated_explanation:
    'Antes de ver al médico del corazón, necesitas una resonancia magnética y aprobación del seguro.',
  language_used: 'en',
  status: 'Waiting Info',
};

const btnStyle = {
  background: '#C6C6C6',
  borderRadius: 100,
};
const screen1BtnStyle = {
  borderRadius: 10,
  border: '1px solid #FFF',
  background: '#EFDFE4',
  boxShadow: '4px 4px 4px 0 rgba(255, 255, 255, 0.40) inset',
};

export default function App() {
  const [screen, setScreen] = useState<
    'input' | 'output' | 'tasklist' | 'waiting' | 'notes' | 'notes2'
  >('input');
  const [patientNotes, setPatientNotes] = useState('');
  const [form, setForm] = useState({
    patient_name: '',
    language_preference: 'en',
    reason_for_visit: '',
    insurance_info: '',
    referred_specialty: '',
    current_documents: '',
  });
  const [result, setResult] = useState<any>(MOCK_RESULT);
  const [loading, setLoading] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [generatedSummary, setGeneratedSummary] = useState('');
  const [medications, setMedications] = useState<any[]>([]);
  const [summarizing, setSummarizing] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');
const [selectedTime, setSelectedTime] = useState('');
const [selectedDate, setSelectedDate] = useState('');

  const handleSummarize = async () => {
    setSummarizing(true);
    try {
      const res = await fetch('http://localhost:8000/appointments/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_name: result.patient_name,
          age: null,
          language_preference: form.language_preference,
          notes: [
            'Diagnosed with Unstable Angina Pectoris',
            'Prescribed Aspirin 81mg daily',
            'Prescribed Metoprolol 25mg twice daily',
            'Prescribed Nitroglycerin 0.4mg sublingual PRN',
            'Follow up with Cardiology in 7 days',
            'NPO after midnight before stress test',
            'Monitor BP daily',
          ],
        }),
      });
      const data = await res.json();
      setGeneratedSummary(data.translated_summary);
    } catch (error) {
      console.error('API failed, using mock:', error);
      const summaries: any = {
        en: `You have been diagnosed with Unstable Angina — this means your heart is not getting enough blood. You need to take 3 medications: a small daily aspirin to prevent blood clots, Metoprolol (a pill twice a day to slow your heart and lower blood pressure), and Nitroglycerin (a small tablet under your tongue only if you feel chest pain). Do not eat or drink after midnight before your stress test. See your heart doctor again in 7 days and check your blood pressure every day.`,
        es: `Le han diagnosticado Angina Inestable — esto significa que su corazón no está recibiendo suficiente sangre. Necesita tomar 3 medicamentos: una aspirina pequeña diaria para prevenir coágulos, Metoprolol (una pastilla dos veces al día para reducir su ritmo cardíaco y presión arterial), y Nitroglicerina (una pastilla pequeña bajo la lengua solo si siente dolor en el pecho). No coma ni beba después de medianoche antes de su prueba de esfuerzo. Vea a su médico del corazón en 7 días y revise su presión arterial todos los días.`,
        vi: `Bạn được chẩn đoán mắc Đau thắt ngực không ổn định — điều này có nghĩa là tim bạn không nhận đủ máu. Bạn cần uống 3 loại thuốc: aspirin nhỏ mỗi ngày để ngăn ngừa cục máu đông, Metoprolol (một viên hai lần mỗi ngày để làm chậm nhịp tim và hạ huyết áp), và Nitroglycerin (một viên nhỏ dưới lưỡi chỉ khi bạn cảm thấy đau ngực). Không ăn uống sau nửa đêm trước khi kiểm tra tim. Gặp bác sĩ tim mạch sau 7 ngày và kiểm tra huyết áp mỗi ngày.`,
      };
      setGeneratedSummary(
        summaries[form.language_preference] || summaries['en']
      );
      setMedications([
        {
          name: 'Aspirin',
          explanation: 'Prevents blood clots',
          dosage: '81mg',
          frequency: 'Once daily',
          duration: 'Ongoing',
        },
        {
          name: 'Metoprolol',
          explanation: 'Slows heart and lowers blood pressure',
          dosage: '25mg',
          frequency: 'Twice daily',
          duration: 'Ongoing',
        },
        {
          name: 'Nitroglycerin',
          explanation: 'Relieves chest pain',
          dosage: '0.4mg',
          frequency: 'As needed',
          duration: 'PRN',
        },
      ]);
      setScreen('notes2');
    } finally {
      setSummarizing(false);
    }
  };

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const payload = {
        patient_name: form.patient_name,
        age: null,
        language_preference: form.language_preference,
        location: null,
        insurance: form.insurance_info,
        referral_text: form.reason_for_visit,
      };
      const res = await fetch('http://localhost:8000/referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error('API call failed, using mock data:', error);
      setResult(MOCK_RESULT);
    } finally {
      setLoading(false);
      setScreen('output');
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div
      style={{
        fontFamily: 'Lato, sans-serif',
        background: '#f0f0f0',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: 390,
          minHeight: '100vh',
          background:
            screen === 'input'
              ? 'linear-gradient(180deg, #FFF3C9 0%, #D0A4B1 40%, #A16EB9 70%, #5D4A97 100%)'
              : 'white',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column' as const,
        }}
      >
        {/* SCREEN 1 - Input */}
        {screen === 'input' && (
          <div
            style={{
              flex: 1,
              padding: '48px 24px 100px',
              display: 'flex',
              flexDirection: 'column' as const,
              gap: 12,
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: 8 }}>
              <p
                style={{
                  fontSize: 40,
                  fontWeight: 400,
                  letterSpacing: 0.5,
                  color: '#2A2A5C',
                  marginBottom: 0,
                  fontFamily: 'Lato, sans-serif',
                }}
              >
                Welcome to
              </p>
              <h1
                style={{
                  fontSize: 40,
                  fontWeight: 400,
                  letterSpacing: 0.5,
                  color: '#2A2A5C',
                  lineHeight: 1.1,
                  fontFamily: '"Otomanopee One", sans-serif',
                  textAlign: 'center',
                }}
              >
                VitaSync
              </h1>
              <div
                style={{
                  width: '80%',
                  height: 1,
                  background: '#2A2A5C',
                  margin: '12px auto',
                }}
              />
              <p style={{ fontSize: 13, color: '#2A2A5C' }}>
                Schedule a visit with
                <br />
                your doctor today
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: '#5D4A97',
                  textDecoration: 'underline',
                  marginTop: 6,
                  cursor: 'pointer',
                }}
              >
                {form.language_preference === 'en'
                  ? 'English'
                  : form.language_preference === 'es'
                  ? 'Spanish'
                  : 'Vietnamese'}
              </p>
            </div>

            {/* Patient Demographics */}
            <div>
              <button
                onClick={() => toggleSection('demographics')}
                style={{
                  ...screen1BtnStyle,
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 20px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <ClipboardList size={18} />
                <span style={{ fontSize: 14, fontWeight: 500 }}>
                  Patient demographics
                </span>
              </button>
              {expandedSection === 'demographics' && (
                <div
                  style={{
                    padding: '8px 4px',
                    display: 'flex',
                    flexDirection: 'column' as const,
                    gap: 8,
                  }}
                >
                  <input
                    name="patient_name"
                    value={form.patient_name}
                    onChange={handleChange}
                    placeholder="Full name"
                    style={{
                      ...screen1BtnStyle,
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 20px',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  />
                  <select
                    name="language_preference"
                    value={form.language_preference}
                    onChange={handleChange}
                    style={{
                      ...screen1BtnStyle,
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 20px',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="vi">Vietnamese</option>
                  </select>
                </div>
              )}
            </div>

            {/* Specialty Referral */}
            <div>
              <button
                onClick={() => toggleSection('specialty')}
                style={{
                  ...screen1BtnStyle,
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 20px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <Users size={18} />
                <span style={{ fontSize: 14, fontWeight: 500 }}>
                  Speciality referral
                </span>
              </button>
              {expandedSection === 'specialty' && (
                <div style={{ padding: '8px 4px' }}>
                  <input
                    name="referred_specialty"
                    value={form.referred_specialty}
                    onChange={handleChange}
                    placeholder="e.g. Cardiology (optional — AI will detect)"
                    style={{
                      ...screen1BtnStyle,
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 20px',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  />
                </div>
              )}
            </div>

            {/* Insurance */}
            <div>
              <button
                onClick={() => toggleSection('insurance')}
                style={{
                  ...screen1BtnStyle,
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 20px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <Shield size={18} />
                <span style={{ fontSize: 14, fontWeight: 500 }}>
                  Insurance information
                </span>
              </button>
              {expandedSection === 'insurance' && (
                <div style={{ padding: '8px 4px' }}>
                  <input
                    name="insurance_info"
                    value={form.insurance_info}
                    onChange={handleChange}
                    placeholder="e.g. Blue Cross PPO"
                    style={{
                      ...screen1BtnStyle,
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 20px',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  />
                </div>
              )}
            </div>

            <textarea
              name="reason_for_visit"
              value={form.reason_for_visit}
              onChange={handleChange}
              placeholder="Reason for visit"
              style={{
                width: '100%',
                borderRadius: 10,
                border: '1px solid #FFF',
                background: '#EFDFE4',
                boxShadow: '4px 4px 4px 0 rgba(255, 255, 255, 0.40) inset',
                padding: '12px 16px',
                fontSize: 16,
                fontFamily: 'Lato, sans-serif',
                fontWeight: 500,
                color: '#8A8A8A',
                letterSpacing: 0.5,
                outline: 'none',
                resize: 'none',
                minHeight: 100,
                boxSizing: 'border-box' as const,
              }}
              rows={4}
            />

            <button
              onClick={handleAnalyze}
              disabled={loading}
              style={{
                borderRadius: 100,
                background: '#F4E4AC',
                boxShadow:
                  '0 4px 4px 0 rgba(0, 0, 0, 0.25), 4px 4px 4px 0 #FFF5D3 inset',
                width: 'auto',
                padding: '12px 32px',
                alignSelf: 'center',
                border: 'none',
                cursor: 'pointer',
                fontSize: 16,
                fontWeight: 700,
                color: '#2A2A5C',
                fontFamily: 'Lato, sans-serif',
                letterSpacing: 0.5,
                opacity: loading ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {loading ? (
                'Analyzing...'
              ) : (
                <>
                  Analyze Request
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <g clipPath="url(#clip0_10_1348)">
                      <path
                        d="M11.017 2.81401C11.0599 2.58462 11.1816 2.37743 11.3611 2.22833C11.5406 2.07924 11.7667 1.99762 12 1.99762C12.2334 1.99762 12.4594 2.07924 12.6389 2.22833C12.8184 2.37743 12.9402 2.58462 12.983 2.81401L14.034 8.37201C14.1087 8.76716 14.3007 9.13063 14.585 9.41498C14.8694 9.69934 15.2329 9.89137 15.628 9.96601L21.186 11.017C21.4154 11.0599 21.6226 11.1816 21.7717 11.3611C21.9208 11.5406 22.0024 11.7667 22.0024 12C22.0024 12.2334 21.9208 12.4594 21.7717 12.6389C21.6226 12.8184 21.4154 12.9402 21.186 12.983L15.628 14.034C15.2329 14.1087 14.8694 14.3007 14.585 14.585C14.3007 14.8694 14.1087 15.2329 14.034 15.628L12.983 21.186C12.9402 21.4154 12.8184 21.6226 12.6389 21.7717C12.4594 21.9208 12.2334 22.0024 12 22.0024C11.7667 22.0024 11.5406 21.9208 11.3611 21.7717C11.1816 21.6226 11.0599 21.4154 11.017 21.186L9.96601 15.628C9.89137 15.2329 9.69934 14.8694 9.41498 14.585C9.13063 14.3007 8.76716 14.1087 8.37201 14.034L2.81401 12.983C2.58462 12.9402 2.37743 12.8184 2.22833 12.6389C2.07924 12.4594 1.99762 12.2334 1.99762 12C1.99762 11.7667 2.07924 11.5406 2.22833 11.3611C2.37743 11.1816 2.58462 11.0599 2.81401 11.017L8.37201 9.96601C8.76716 9.89137 9.13063 9.69934 9.41498 9.41498C9.69934 9.13063 9.89137 8.76716 9.96601 8.37201L11.017 2.81401Z"
                        stroke="#2A2A5C"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M20 2V6"
                        stroke="#2A2A5C"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M22 4H18"
                        stroke="#2A2A5C"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M4 22C5.10457 22 6 21.1046 6 20C6 18.8954 5.10457 18 4 18C2.89543 18 2 18.8954 2 20C2 21.1046 2.89543 22 4 22Z"
                        stroke="#2A2A5C"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_10_1348">
                        <rect width="24" height="24" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </>
              )}
            </button>
          </div>
        )}

        {/* SCREEN 2 - Output */}
        {screen === 'output' && result && (
          <div
            style={{
              flex: 1,
              padding: '48px 24px 100px',
              display: 'flex',
              flexDirection: 'column' as const,
              gap: 20,
            }}
          >
            <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #5D4A97', paddingBottom: 4, marginBottom: 4 }}>
  <h2 style={{ fontSize: 24, fontWeight: 400, color: '#5D4A97', fontFamily: '"Otomanopee One", sans-serif', letterSpacing: 0.5 }}>
    Request
  </h2>
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <g clipPath="url(#clip0_req)">
      <path d="M11.017 2.81401C11.0599 2.58462 11.1816 2.37743 11.3611 2.22833C11.5406 2.07924 11.7667 1.99762 12 1.99762C12.2334 1.99762 12.4594 2.07924 12.6389 2.22833C12.8184 2.37743 12.9402 2.58462 12.983 2.81401L14.034 8.37201C14.1087 8.76716 14.3007 9.13063 14.585 9.41498C14.8694 9.69934 15.2329 9.89137 15.628 9.96601L21.186 11.017C21.4154 11.0599 21.6226 11.1816 21.7717 11.3611C21.9208 11.5406 22.0024 11.7667 22.0024 12C22.0024 12.2334 21.9208 12.4594 21.7717 12.6389C21.6226 12.8184 21.4154 12.9402 21.186 12.983L15.628 14.034C15.2329 14.1087 14.8694 14.3007 14.585 14.585C14.3007 14.8694 14.1087 15.2329 14.034 15.628L12.983 21.186C12.9402 21.4154 12.8184 21.6226 12.6389 21.7717C12.4594 21.9208 12.2334 22.0024 12 22.0024C11.7667 22.0024 11.5406 21.9208 11.3611 21.7717C11.1816 21.6226 11.0599 21.4154 11.017 21.186L9.96601 15.628C9.89137 15.2329 9.69934 14.8694 9.41498 14.585C9.13063 14.3007 8.76716 14.1087 8.37201 14.034L2.81401 12.983C2.58462 12.9402 2.37743 12.8184 2.22833 12.6389C2.07924 12.4594 1.99762 12.2334 1.99762 12C1.99762 11.7667 2.07924 11.5406 2.22833 11.3611C2.37743 11.1816 2.58462 11.0599 2.81401 11.017L8.37201 9.96601C8.76716 9.89137 9.13063 9.69934 9.41498 9.41498C9.69934 9.13063 9.89137 8.76716 9.96601 8.37201L11.017 2.81401Z" stroke="#5D4A97" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20 2V6" stroke="#5D4A97" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M22 4H18" stroke="#5D4A97" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4 22C5.10457 22 6 21.1046 6 20C6 18.8954 5.10457 18 4 18C2.89543 18 2 18.8954 2 20C2 21.1046 2.89543 22 4 22Z" stroke="#5D4A97" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
    <defs>
      <clipPath id="clip0_req">
        <rect width="24" height="24" fill="white"/>
      </clipPath>
    </defs>
  </svg>
</div>
              <div
                style={{
                  borderRadius: 10,
                  background:
                    'linear-gradient(0deg, #FFF 0%, #FFF 100%), linear-gradient(180deg, #D0A4B1 0%, #A16EB9 100%)',
                  backgroundBlendMode: 'soft-light, normal',
                  padding: '14px 16px',
                  marginBottom: 10,
                  marginTop: 10,
                }}
              >
                {result.referral_summary
                  .split('.')
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((s: string, i: number) => (
                    <p
                      key={i}
                      style={{
                        fontSize: 16,
                        color: '#2A2A5C',
                        fontFamily: 'Lato, sans-serif',
                        fontWeight: 500,
                        letterSpacing: 0.5,
                        marginBottom: i === 0 ? 6 : 0,
                      }}
                    >
                      {s.trim()}.
                    </p>
                  ))}
              </div>
              <div
                style={{
                  border: '1px solid #000',
                  borderRadius: 12,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 16px',
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: '#8A8A8A',
                    fontFamily: 'Lato, sans-serif',
                    letterSpacing: 0.5,
                    textAlign: 'center' as const,
                  }}
                >
                  Speciality
                </span>
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 500,
                    color: '#2A2A5C',
                    fontFamily: 'Lato, sans-serif',
                    letterSpacing: 0.5,
                    textAlign: 'center' as const,
                  }}
                >
                  {result.detected_specialty || result.referred_specialty}
                </span>
              </div>
              <div
                style={{
                  border: '1px solid #000',
                  borderRadius: 12,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 16px',
                }}
              >
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: '#8A8A8A',
                    fontFamily: 'Lato, sans-serif',
                    letterSpacing: 0.5,
                    textAlign: 'center' as const,
                  }}
                >
                  Urgent
                </span>
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 500,
                    color: '#2A2A5C',
                    fontFamily: 'Lato, sans-serif',
                    letterSpacing: 0.5,
                    textAlign: 'center' as const,
                  }}
                >
                  {result.urgency_level === 'high'
                    ? 'Visit doctor this week'
                    : result.urgency_level === 'medium'
                    ? 'Visit within 2 weeks'
                    : 'Schedule when convenient'}
                </span>
              </div>
            </div>

            <div>
              <h2
                style={{
                  fontSize: 24,
                  fontWeight: 400,
                  color: '#5D4A97',
                  fontFamily: '"Otomanopee One", sans-serif',
                  letterSpacing: 0.5,
                  lineHeight: '28px',
                  marginBottom: 4,
                  borderBottom: '1px solid #5D4A97',
                  paddingBottom: 4,
                }}
              >
                Schedule an appointment
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8, marginTop: 10 }}>
                
                {/* Location */}
                <div style={{ borderRadius: 10, background: 'linear-gradient(0deg, #FFF 0%, #FFF 100%), linear-gradient(180deg, #D0A4B1 0%, #A16EB9 100%)', backgroundBlendMode: 'soft-light, normal', padding: '12px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <MapPin size={18} />
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#A16EB9', fontFamily: 'Lato, sans-serif', letterSpacing: 0.5 }}>Location</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6 }}>
                    {['UCSD Express Care - La Jolla'].map((loc) => (
                      <button
                        key={loc}
                        onClick={() => setSelectedLocation(loc)}
                        style={{
                          borderRadius: 8,
                          padding: '8px 12px',
                          border: selectedLocation === loc ? '2px solid #5D4A97' : '1px solid #ddd',
                          background: selectedLocation === loc ? '#EFDFE4' : 'white',
                          cursor: 'pointer',
                          fontSize: 12,
                          fontWeight: 500,
                          color: '#2A2A5C',
                          fontFamily: 'Lato, sans-serif',
                          textAlign: 'left' as const,
                        }}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>

                  {/* Date - only shows after location selected */}
                {selectedLocation && (
                  <div style={{ borderRadius: 10, background: 'linear-gradient(0deg, #FFF 0%, #FFF 100%), linear-gradient(180deg, #D0A4B1 0%, #A16EB9 100%)', backgroundBlendMode: 'soft-light, normal', padding: '12px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <Clock3 size={18} />
                      <span style={{ fontSize: 16, fontWeight: 700, color: '#A16EB9', fontFamily: 'Lato, sans-serif', letterSpacing: 0.5 }}>Date</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
                      {['Mon Apr 6', 'Tue Apr 7', 'Wed Apr 8', 'Thu Apr 9', 'Fri Apr 10', 'Sat Apr 11'].map((date) => (
                        <button
                          key={date}
                          onClick={() => setSelectedDate(date)}
                          style={{
                            borderRadius: 8,
                            padding: '8px 12px',
                            border: selectedDate === date ? '2px solid #5D4A97' : '1px solid #ddd',
                            background: selectedDate === date ? '#EFDFE4' : 'white',
                            cursor: 'pointer',
                            fontSize: 12,
                            fontWeight: 500,
                            color: '#2A2A5C',
                            fontFamily: 'Lato, sans-serif',
                          }}
                        >
                          {date}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Time - only shows after date selected */}
                {selectedDate && (
                  <div style={{ borderRadius: 10, background: 'linear-gradient(0deg, #FFF 0%, #FFF 100%), linear-gradient(180deg, #D0A4B1 0%, #A16EB9 100%)', backgroundBlendMode: 'soft-light, normal', padding: '12px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <Clock3 size={18} />
                      <span style={{ fontSize: 16, fontWeight: 700, color: '#A16EB9', fontFamily: 'Lato, sans-serif', letterSpacing: 0.5 }}>Time</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
                      {['9:00 AM', '10:00 AM', '11:30 AM', '1:00 PM', '2:30 PM', '4:00 PM'].map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          style={{
                            borderRadius: 8,
                            padding: '8px 12px',
                            border: selectedTime === time ? '2px solid #5D4A97' : '1px solid #ddd',
                            background: selectedTime === time ? '#EFDFE4' : 'white',
                            cursor: 'pointer',
                            fontSize: 12,
                            fontWeight: 500,
                            color: '#2A2A5C',
                            fontFamily: 'Lato, sans-serif',
                          }}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Phone - only shows after time selected */}
                {selectedTime && (
                  <div style={{ borderRadius: 10, background: 'linear-gradient(0deg, #FFF 0%, #FFF 100%), linear-gradient(180deg, #D0A4B1 0%, #A16EB9 100%)', backgroundBlendMode: 'soft-light, normal', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Phone size={18} />
                      <span style={{ fontSize: 16, fontWeight: 700, color: '#A16EB9', fontFamily: 'Lato, sans-serif', letterSpacing: 0.5 }}>Phone</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 500, color: '#2A2A5C', fontFamily: 'Lato, sans-serif', letterSpacing: 0.5 }}>800-926-8273</span>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
  <button
    onClick={() => setScreen('tasklist')}
    style={{
      borderRadius: 100,
      background: '#F4E4AC',
      boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25), 4px 4px 4px 0 #FFF5D3 inset',
      padding: '12px 32px',
      border: 'none',
      cursor: 'pointer',
      fontSize: 16,
      fontWeight: 700,
      color: '#2A2A5C',
      fontFamily: 'Lato, sans-serif',
      letterSpacing: 0.5,
    }}
  >
    Confirm appointment
  </button>
</div>
            </div>

            <button
              onClick={() => setScreen('input')}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 13,
                color: '#888',
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
            >
              ← Back to form
            </button>
          </div>
        )}

        {/* SCREEN 3 - Task List */}
        {screen === 'tasklist' && result && (
          <div
            style={{
              flex: 1,
              padding: '48px 24px 100px',
              display: 'flex',
              flexDirection: 'column' as const,
              gap: 16,
            }}
          >
          <div
  style={{
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 4,
    border: '1px solid rgba(93, 74, 151, 0.5)',
    borderRadius: 40,
    boxShadow: '1px 1px 5px 1px #5D4A97',
    padding: '12px 16px',
    width: '100%',
    background: 'white',
    boxSizing: 'border-box' as const,
  }}
>
  <div
    style={{
      background: '#F4E4AC',
      borderRadius: 100,
      padding: '4px 14px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      alignSelf: 'center',
    }}
  >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 30 30"
                  fill="none"
                >
                  <path
                    d="M15 27.5C21.9036 27.5 27.5 21.9036 27.5 15C27.5 8.09644 21.9036 2.5 15 2.5C8.09644 2.5 2.5 8.09644 2.5 15C2.5 21.9036 8.09644 27.5 15 27.5Z"
                    stroke="#5D4A97"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M11.25 15L13.75 17.5L18.75 12.5"
                    stroke="#5D4A97"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span
                  style={{
                    fontSize: 12,
                    color: '#5D4A97',
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 700,
                    letterSpacing: 0.5,
                    textAlign: 'center' as const,
                  }}
                >
                  Appointment confirmed!
                </span>
              </div>
              <p
                style={{
                  fontSize: 12,
                  color: '#5D4A97',
                  textAlign: 'center' as const,
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 600,
                  letterSpacing: 0.5,
                  marginTop: 4,
                }}
              >
                Please complete the task list below to
                <br />
                prepare for your appointment
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: '#2A2A5C',
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 500,
                  letterSpacing: 0.5,
                  textAlign: 'center' as const,
                }}
              >
                UCSD Express Care - La Jolla
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: '#2A2A5C',
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 500,
                  letterSpacing: 0.5,
                  textAlign: 'center' as const,
                }}
              >
                Monday, April 6 @ 9:00 AM
              </p>
            </div>

            {/* Task list heading with sparkle */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                borderBottom: '1px solid #000',
                paddingBottom: 4,
              }}
            >
              <h2
                style={{
                  fontSize: 24,
                  fontWeight: 400,
                  color: '#5D4A97',
                  fontFamily: '"Otomanopee One", sans-serif',
                  letterSpacing: 0.5,
                }}
              >
                Task list
              </h2>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <g clipPath="url(#clip0_tasklist)">
                  <path
                    d="M11.017 2.81401C11.0599 2.58462 11.1816 2.37743 11.3611 2.22833C11.5406 2.07924 11.7667 1.99762 12 1.99762C12.2334 1.99762 12.4594 2.07924 12.6389 2.22833C12.8184 2.37743 12.9402 2.58462 12.983 2.81401L14.034 8.37201C14.1087 8.76716 14.3007 9.13063 14.585 9.41498C14.8694 9.69934 15.2329 9.89137 15.628 9.96601L21.186 11.017C21.4154 11.0599 21.6226 11.1816 21.7717 11.3611C21.9208 11.5406 22.0024 11.7667 22.0024 12C22.0024 12.2334 21.9208 12.4594 21.7717 12.6389C21.6226 12.8184 21.4154 12.9402 21.186 12.983L15.628 14.034C15.2329 14.1087 14.8694 14.3007 14.585 14.585C14.3007 14.8694 14.1087 15.2329 14.034 15.628L12.983 21.186C12.9402 21.4154 12.8184 21.6226 12.6389 21.7717C12.4594 21.9208 12.2334 22.0024 12 22.0024C11.7667 22.0024 11.5406 21.9208 11.3611 21.7717C11.1816 21.6226 11.0599 21.4154 11.017 21.186L9.96601 15.628C9.89137 15.2329 9.69934 14.8694 9.41498 14.585C9.13063 14.3007 8.76716 14.1087 8.37201 14.034L2.81401 12.983C2.58462 12.9402 2.37743 12.8184 2.22833 12.6389C2.07924 12.4594 1.99762 12.2334 1.99762 12C1.99762 11.7667 2.07924 11.5406 2.22833 11.3611C2.37743 11.1816 2.58462 11.0599 2.81401 11.017L8.37201 9.96601C8.76716 9.89137 9.13063 9.69934 9.41498 9.41498C9.69934 9.13063 9.89137 8.76716 9.96601 8.37201L11.017 2.81401Z"
                    stroke="#5D4A97"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M20 2V6"
                    stroke="#5D4A97"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M22 4H18"
                    stroke="#5D4A97"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M4 22C5.10457 22 6 21.1046 6 20C6 18.8954 5.10457 18 4 18C2.89543 18 2 18.8954 2 20C2 21.1046 2.89543 22 4 22Z"
                    stroke="#5D4A97"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_tasklist">
                    <rect width="24" height="24" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </div>

            {/* Tasks from backend */}
            {result.tasks &&
              result.tasks.map((t: any, i: number) => (
                <div
                  key={i}
                  style={{
                    border:
                      t.status === 'Complete' || t.status === 'Received'
                        ? 'none'
                        : '1px solid #ddd',
                    background:
                      t.status === 'Complete' || t.status === 'Received'
                        ? '#EFDFE4'
                        : 'white',
                    borderRadius: 16,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 20px',
                  }}
                >
                  <span
                    style={{
                      fontSize: 16,
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 700,
                      color: '#8A8A8A',
                      letterSpacing: 0.5,
                      textAlign: 'center' as const,
                    }}
                  >
                    {t.task}
                  </span>
                  <span
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color:
                        t.status === 'Missing'
                          ? '#2A2A5C'
                          : t.status === 'Pending'
                          ? '#A16EB9'
                          : '#A16EB9',
                    }}
                  >
                    {t.status}
                  </span>
                </div>
              ))}

            {/* Patient notes box */}
            <div style={{ position: 'relative' as const }}>
              <textarea
                value={patientNotes}
                onChange={(e) => setPatientNotes(e.target.value)}
                placeholder="Any new symptoms or questions"
                style={{
                  width: '100%',
                  background: '#E8E8E8',
                  border: 'none',
                  borderRadius: 12,
                  padding: '12px 16px',
                  fontSize: 16,
                  color: '#8A8A8A',
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 500,
                  letterSpacing: 0.5,
                  outline: 'none',
                  resize: 'none',
                  minHeight: 80,
                  boxSizing: 'border-box' as const,
                  paddingBottom: 28,
                }}
                rows={3}
              />
              <span
                style={{
                  position: 'absolute' as const,
                  left: 16,
                  bottom: 10,
                  fontSize: 12,
                  color: '#8A8A8A',
                  fontFamily: 'Lato, sans-serif',
                }}
              >
                Patient
              </span>
            </div>

            {/* Instructions */}
            <div
              style={{
                borderRadius: 10,
    background: 'linear-gradient(0deg, #FFF 0%, #FFF 100%), linear-gradient(180deg, #D0A4B1 0%, #A16EB9 100%)',
    backgroundBlendMode: 'soft-light, normal',
    padding: '12px 16px',
    display: 'flex',
    gap: 12,
    alignItems: 'flex-start',
              }}
            >
              <Smile
                size={22}
                color="#2A2A5C"
                style={{ flexShrink: 0, marginTop: 2 }}
              />
              <div>
                <p
                  style={{
                    fontSize: 16,
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 500,
                    color: '#2A2A5C',
                    letterSpacing: 0.5,
                    textAlign: 'center' as const,
                  }}
                >
                  Wear comfortable clothing
                </p>
                <p
                  style={{
                    fontSize: 16,
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 500,
                    color: '#2A2A5C',
                    letterSpacing: 0.5,
                    textAlign: 'center' as const,
                  }}
                >
                  Arrive 15-20 minutes early
                </p>
              </div>
            </div>

            <div
              style={{
                borderRadius: 10,
    background: 'linear-gradient(0deg, #FFF 0%, #FFF 100%), linear-gradient(180deg, #D0A4B1 0%, #A16EB9 100%)',
    backgroundBlendMode: 'soft-light, normal',
    padding: '12px 16px',
    display: 'flex',
    gap: 12,
    alignItems: 'flex-start',
              }}
            >
              <Timer
                size={22}
                color="#2A2A5C"
                style={{ flexShrink: 0, marginTop: 2 }}
              />
              <div>
                <p
                  style={{
                    fontSize: 16,
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 500,
                    color: '#2A2A5C',
                    letterSpacing: 0.5,
                    textAlign: 'center' as const,
                  }}
                >
                  Do not consume caffeine, nicotine, or alcohol 12-24 hours
                  prior
                </p>
              </div>
            </div>

            {/* Check-in button */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={() => setScreen('waiting')}
                style={{
                  borderRadius: 100,
                  background: '#F4E4AC',
                  boxShadow:
                    '0 4px 4px 0 rgba(0, 0, 0, 0.25), 4px 4px 4px 0 #FFF5D3 inset',
                  padding: '12px 32px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#2A2A5C',
                  fontFamily: 'Lato, sans-serif',
                  letterSpacing: 0.5,
                }}
              >
                Check-in
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 4 - Waiting */}
        {screen === 'waiting' && result && (
          <div
            style={{
              flex: 1,
              padding: '48px 24px 100px',
              display: 'flex',
              flexDirection: 'column' as const,
              gap: 16,
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: 24,
                  fontWeight: 400,
                  color: '#5D4A97',
                  fontFamily: '"Otomanopee One", sans-serif',
                  lineHeight: '28px',
                  letterSpacing: 0.5,
                }}
              >
                Your appointment
                <br />
                is today!
              </h1>
              <div
                style={{
                  width: '100%',
                  height: 1,
                  background: '#000',
                  marginTop: 8,
                }}
              />
              <p
                style={{
                  fontSize: 12,
                  color: '#2A2A5C',
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 500,
                  letterSpacing: 0.5,
                  marginTop: 6,
                }}
              >
                Check the status of your appointment, wait time and finalize any
                questions
              </p>
            </div>

            <div style={{ position: 'relative' as const }}>
              <textarea
                value={patientNotes}
                onChange={(e) => setPatientNotes(e.target.value)}
                placeholder="Any new symptoms or questions"
                style={{
                  width: '100%',
                  background: '#C6C6C6',
                  border: 'none',
                  borderRadius: 12,
                  padding: '12px 16px',
                  fontSize: 16,
                  color: '#8A8A8A',
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 500,
                  letterSpacing: 0.5,
                  outline: 'none',
                  resize: 'none',
                  minHeight: 100,
                  boxSizing: 'border-box' as const,
                }}
                rows={4}
              />
              <span
                style={{
                  position: 'absolute' as const,
                  right: 12,
                  top: 12,
                  fontSize: 12,
                  color: '#555',
                  cursor: 'pointer',
                }}
              >
                Edit
              </span>
            </div>

            {/* Patient Name */}
            <div
              style={{
                border: '1px solid #ddd',
                borderRadius: 16,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 20px',
              }}
            >
              <span
                style={{
                  fontSize: 16,
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 500,
                  color: '#2A2A5C',
                  letterSpacing: 0.5,
                  textAlign: 'center' as const,
                }}
              >
                Patient Name
              </span>
              <span
                style={{
                  fontSize: 16,
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 500,
                  color: '#2A2A5C',
                  letterSpacing: 0.5,
                  textAlign: 'center' as const,
                }}
              >
                {result.patient_name}
              </span>
            </div>

            {/* Wait time status with progress bar */}
            <div
              style={{
                border: '1px solid #ddd',
                borderRadius: 16,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  background:
                    'linear-gradient(90deg, #5D4A97 0%, #C9A0DC 100%)',
                  borderRadius: 16,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 20px',
                  width: '68%',
                }}
              >
                <span
                  style={{
                    fontSize: 16,
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 700,
                    color: '#F4E4AC',
                    letterSpacing: 0.5,
                    textAlign: 'center' as const,
                  }}
                >
                  Wait time status
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  padding: '0 20px',
                  marginTop: -32,
                }}
              >
                <span
                  style={{
                    fontSize: 16,
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 500,
                    color: '#2A2A5C',
                    letterSpacing: 0.5,
                    textAlign: 'center' as const,
                  }}
                >
                  68%
                </span>
              </div>
            </div>
          </div>
        )}
        {/* SCREEN 5 - Appointment Notes */}
        {screen === 'notes' && (
          <div
            style={{
              flex: 1,
              padding: '48px 24px 100px',
              display: 'flex',
              flexDirection: 'column' as const,
              gap: 16,
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: 24,
                  fontWeight: 400,
                  color: '#5D4A97',
                  fontFamily: '"Otomanopee One", sans-serif',
                  letterSpacing: 0.5,
                  borderBottom: '1px solid #000',
                  paddingBottom: 4,
                }}
              >
                Appointment notes
              </h1>
              <p
                style={{
                  fontSize: 12,
                  color: '#2A2A5C',
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 500,
                  letterSpacing: 0.5,
                  marginTop: 6,
                }}
              >
                Here are your doctor's notes from your appointment today
              </p>
            </div>

            {/* Doctor notes box with Doctor label */}
            <div
              style={{
                background: '#C6C6C6',
                borderRadius: 16,
                padding: '16px',
                minHeight: 160,
                display: 'flex',
                flexDirection: 'column' as const,
                justifyContent: 'space-between',
              }}
            >
              <p
                style={{
                  fontSize: 14,
                  color: '#444',
                  fontFamily: 'Lato, sans-serif',
                  lineHeight: 1.8,
                }}
              >
                <strong>Diagnosis:</strong> Unstable Angina Pectoris (ICD-10:
                I20.0)
                <br />
                <strong>Medications prescribed:</strong>
                <br />
                - Aspirin 81mg daily (antiplatelet)
                <br />
                - Metoprolol 25mg twice daily (beta-blocker)
                <br />
                - Nitroglycerin 0.4mg sublingual PRN chest pain
                <br />
                <strong>Follow-up:</strong> Cardiology in 7 days. NPO after
                midnight before stress test. Monitor BP daily.
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: '#8A8A8A',
                  fontFamily: 'Lato, sans-serif',
                  marginTop: 8,
                }}
              >
                Doctor
              </p>
            </div>

            {/* More Info button */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={handleSummarize}
                disabled={summarizing}
                style={{
                  borderRadius: 100,
                  background: '#F4E4AC',
                  boxShadow:
                    '0 4px 4px 0 rgba(0, 0, 0, 0.25), 4px 4px 4px 0 #FFF5D3 inset',
                  padding: '12px 32px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 16,
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 700,
                  color: '#2A2A5C',
                  letterSpacing: 0.5,
                  opacity: summarizing ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {summarizing ? 'Processing...' : 'More Info'}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <g clipPath="url(#clip0_10_1348)">
                    <path
                      d="M11.017 2.81401C11.0599 2.58462 11.1816 2.37743 11.3611 2.22833C11.5406 2.07924 11.7667 1.99762 12 1.99762C12.2334 1.99762 12.4594 2.07924 12.6389 2.22833C12.8184 2.37743 12.9402 2.58462 12.983 2.81401L14.034 8.37201C14.1087 8.76716 14.3007 9.13063 14.585 9.41498C14.8694 9.69934 15.2329 9.89137 15.628 9.96601L21.186 11.017C21.4154 11.0599 21.6226 11.1816 21.7717 11.3611C21.9208 11.5406 22.0024 11.7667 22.0024 12C22.0024 12.2334 21.9208 12.4594 21.7717 12.6389C21.6226 12.8184 21.4154 12.9402 21.186 12.983L15.628 14.034C15.2329 14.1087 14.8694 14.3007 14.585 14.585C14.3007 14.8694 14.1087 15.2329 14.034 15.628L12.983 21.186C12.9402 21.4154 12.8184 21.6226 12.6389 21.7717C12.4594 21.9208 12.2334 22.0024 12 22.0024C11.7667 22.0024 11.5406 21.9208 11.3611 21.7717C11.1816 21.6226 11.0599 21.4154 11.017 21.186L9.96601 15.628C9.89137 15.2329 9.69934 14.8694 9.41498 14.585C9.13063 14.3007 8.76716 14.1087 8.37201 14.034L2.81401 12.983C2.58462 12.9402 2.37743 12.8184 2.22833 12.6389C2.07924 12.4594 1.99762 12.2334 1.99762 12C1.99762 11.7667 2.07924 11.5406 2.22833 11.3611C2.37743 11.1816 2.58462 11.0599 2.81401 11.017L8.37201 9.96601C8.76716 9.89137 9.13063 9.69934 9.41498 9.41498C9.69934 9.13063 9.89137 8.76716 9.96601 8.37201L11.017 2.81401Z"
                      stroke="#2A2A5C"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M20 2V6"
                      stroke="#2A2A5C"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M22 4H18"
                      stroke="#2A2A5C"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M4 22C5.10457 22 6 21.1046 6 20C6 18.8954 5.10457 18 4 18C2.89543 18 2 18.8954 2 20C2 21.1046 2.89543 22 4 22Z"
                      stroke="#2A2A5C"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_10_1348">
                      <rect width="24" height="24" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </button>
            </div>
          </div>
        )}
        {/* SCREEN 6 - Generated Notes */}
        {screen === 'notes2' && (
          <div
            style={{
              flex: 1,
              padding: '48px 24px 100px',
              display: 'flex',
              flexDirection: 'column' as const,
              gap: 16,
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  borderBottom: '1px solid #5D4A97',
                  paddingBottom: 4,
                }}
              >
                <h1
                  style={{
                    fontSize: 24,
                    fontWeight: 400,
                    color: '#5D4A97',
                    fontFamily: '"Otomanopee One", sans-serif',
                    letterSpacing: 0.5,
                  }}
                >
                  Appointment notes
                </h1>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <g clipPath="url(#clip0_notes2)">
                    <path
                      d="M11.017 2.81401C11.0599 2.58462 11.1816 2.37743 11.3611 2.22833C11.5406 2.07924 11.7667 1.99762 12 1.99762C12.2334 1.99762 12.4594 2.07924 12.6389 2.22833C12.8184 2.37743 12.9402 2.58462 12.983 2.81401L14.034 8.37201C14.1087 8.76716 14.3007 9.13063 14.585 9.41498C14.8694 9.69934 15.2329 9.89137 15.628 9.96601L21.186 11.017C21.4154 11.0599 21.6226 11.1816 21.7717 11.3611C21.9208 11.5406 22.0024 11.7667 22.0024 12C22.0024 12.2334 21.9208 12.4594 21.7717 12.6389C21.6226 12.8184 21.4154 12.9402 21.186 12.983L15.628 14.034C15.2329 14.1087 14.8694 14.3007 14.585 14.585C14.3007 14.8694 14.1087 15.2329 14.034 15.628L12.983 21.186C12.9402 21.4154 12.8184 21.6226 12.6389 21.7717C12.4594 21.9208 12.2334 22.0024 12 22.0024C11.7667 22.0024 11.5406 21.9208 11.3611 21.7717C11.1816 21.6226 11.0599 21.4154 11.017 21.186L9.96601 15.628C9.89137 15.2329 9.69934 14.8694 9.41498 14.585C9.13063 14.3007 8.76716 14.1087 8.37201 14.034L2.81401 12.983C2.58462 12.9402 2.37743 12.8184 2.22833 12.6389C2.07924 12.4594 1.99762 12.2334 1.99762 12C1.99762 11.7667 2.07924 11.5406 2.22833 11.3611C2.37743 11.1816 2.58462 11.0599 2.81401 11.017L8.37201 9.96601C8.76716 9.89137 9.13063 9.69934 9.41498 9.41498C9.69934 9.13063 9.89137 8.76716 9.96601 8.37201L11.017 2.81401Z"
                      stroke="#5D4A97"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M20 2V6"
                      stroke="#5D4A97"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M22 4H18"
                      stroke="#5D4A97"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M4 22C5.10457 22 6 21.1046 6 20C6 18.8954 5.10457 18 4 18C2.89543 18 2 18.8954 2 20C2 21.1046 2.89543 22 4 22Z"
                      stroke="#5D4A97"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_notes2">
                      <rect width="24" height="24" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </div>
              <p
                style={{
                  fontSize: 12,
                  color: '#2A2A5C',
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 500,
                  letterSpacing: 0.5,
                  marginTop: 6,
                }}
              >
                Here are your doctor's notes from your appointment today
              </p>
            </div>

            {/* Generated Summary */}
            <div
              style={{
                background: '#C6C6C6',
                borderRadius: 16,
                padding: '16px',
                minHeight: 120,
                display: 'flex',
                flexDirection: 'column' as const,
                justifyContent: 'space-between',
              }}
            >
              <p
                style={{
                  fontSize: 14,
                  color: '#444',
                  fontFamily: 'Lato, sans-serif',
                  lineHeight: 1.8,
                }}
              >
                {generatedSummary || 'Generated summary'}
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: '#8A8A8A',
                  fontFamily: 'Lato, sans-serif',
                  marginTop: 8,
                }}
              >
                Generated
              </p>
            </div>

            {/* Medications */}
            {medications.map((med, i) => (
              <div
                key={i}
                style={{
                  borderRadius: 10,
background: 'linear-gradient(0deg, #FFF 0%, #FFF 100%), linear-gradient(180deg, #D0A4B1 0%, #A16EB9 100%)',
backgroundBlendMode: 'soft-light, normal',
padding: '16px',
display: 'flex',
flexDirection: 'column' as const,
gap: 8,
                }}
              >
                <div
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: 12,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 16px',
                    background: 'white',
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#8A8A8A',
                      fontFamily: 'Lato, sans-serif',
                      letterSpacing: 0.5,
                      textAlign: 'center' as const,
                    }}
                  >
                    {med.name}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: '#2A2A5C',
                      fontFamily: 'Lato, sans-serif',
                      letterSpacing: 0.5,
                      textAlign: 'center' as const,
                      maxWidth: '55%',
                    }}
                  >
                    {med.explanation}
                  </span>
                </div>
                {med.dosage && (
                  <div
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: 12,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 16px',
                      background: 'white',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#8A8A8A',
                        fontFamily: 'Lato, sans-serif',
                        letterSpacing: 0.5,
                        textAlign: 'center' as const,
                      }}
                    >
                      Dosage
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: '#2A2A5C',
                        fontFamily: 'Lato, sans-serif',
                        letterSpacing: 0.5,
                        textAlign: 'center' as const,
                        maxWidth: '55%',
                      }}
                    >
                      {med.dosage}
                    </span>
                  </div>
                )}
                {med.frequency && (
                  <div
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: 12,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 16px',
                      background: 'white',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#8A8A8A',
                        fontFamily: 'Lato, sans-serif',
                        letterSpacing: 0.5,
                        textAlign: 'center' as const,
                      }}
                    >
                      Frequency
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: '#2A2A5C',
                        fontFamily: 'Lato, sans-serif',
                        letterSpacing: 0.5,
                        textAlign: 'center' as const,
                        maxWidth: '55%',
                      }}
                    >
                      {med.frequency}
                    </span>
                  </div>
                )}
                {med.duration && (
                  <div
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: 12,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 16px',
                      background: 'white',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#8A8A8A',
                        fontFamily: 'Lato, sans-serif',
                        letterSpacing: 0.5,
                        textAlign: 'center' as const,
                      }}
                    >
                      Duration
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: '#2A2A5C',
                        fontFamily: 'Lato, sans-serif',
                        letterSpacing: 0.5,
                        textAlign: 'center' as const,
                        maxWidth: '55%',
                      }}
                    >
                      {med.duration}
                    </span>
                  </div>
                )}
                <p
                  style={{
                    fontSize: 12,
                    color: '#A16EB9',
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 500,
                  }}
                >
                  Generated
                </p>
              </div>
            ))}

            {/* Back to Doctor's notes */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={() => setScreen('notes')}
                style={{
                  borderRadius: 100,
                  background: '#F4E4AC',
                  boxShadow:
                    '0 4px 4px 0 rgba(0, 0, 0, 0.25), 4px 4px 4px 0 #FFF5D3 inset',
                  padding: '12px 32px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#2A2A5C',
                  fontFamily: 'Lato, sans-serif',
                  letterSpacing: 0.5,
                }}
              >
                Doctor's notes
              </button>
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            width: 390,
            background: 'white',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '12px 16px',
          }}
        >
          <div
            style={{
              background: '#A16EB9',
    borderRadius: 50,
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: 368,
    height: 69,
            }}
          >
            {[
              { icon: <Home size={22} color="#F4E4AC" />, s: 'input' },
              { icon: <FileText size={22} color="#F4E4AC" />, s: 'output' },
              { icon: <ListChecks size={22} color="#F4E4AC" />, s: 'tasklist' },
              { icon: <Clock size={22} color="#F4E4AC" />, s: 'waiting' },
              { icon: <BookOpen size={22} color="#F4E4AC" />, s: 'notes' },
            ].map((item) => (
              <button
                key={item.s}
                onClick={() => setScreen(item.s as any)}
                style={{
                  background:
                    screen === item.s ? 'rgba(244, 228, 172, 0.50)' : 'none',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '50%',
                  width: 53,
                  height: 53,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
