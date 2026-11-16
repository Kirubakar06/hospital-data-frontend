import { useEffect, useState } from 'react';
import { ArrowLeft, UserRound } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { moduleConfigs } from '../data/modules';
import { api, errorMessage } from '../services/api';
import { StatusBadge } from '../components/DataTable';

const detailGroups = [
  {
    title: 'Personal and contact information',
    fields: ['age', 'dateOfBirth', 'gender', 'bloodGroup', 'phone', 'email', 'address', 'city', 'emergencyContact'],
  },
  {
    title: 'Care information',
    fields: ['department', 'doctor', 'appointmentDate', 'admissionType', 'status', 'symptoms', 'diagnosis'],
  },
];

function labelFor(fieldName) {
  return moduleConfigs.patients.fields.find((field) => field.name === fieldName)?.label
    || fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase());
}

function displayValue(value) {
  if (value === undefined || value === null || value === '') return 'Not provided';
  return String(value);
}

export default function PatientDetailPage() {
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setPatient(null);
    setLoading(true);
    setError('');
    api.get(`/patients/${encodeURIComponent(patientId)}`)
      .then((response) => {
        if (active) setPatient(response.data.data);
      })
      .catch((requestError) => {
        if (active) setError(errorMessage(requestError, 'Unable to load this patient.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [patientId]);

  const initials = String(patient?.name || 'Patient').split(' ')
    .map((part) => part[0]).slice(0, 2).join('').toUpperCase();

  return <div className="page-content patient-detail-page">
    <Link className="button button-secondary patient-detail-back" to="/patients"><ArrowLeft size={16} /> Back to patients</Link>
    {loading && <div className="loading-state">Loading patient details…</div>}
    {error && <div className="inline-error" role="alert">{error}</div>}
    {!loading && patient && <>
      <div className="page-heading">
        <div><div className="eyebrow"><UserRound size={14} /> PATIENT PROFILE</div><h1>{patient.name}</h1><p>Patient ID: {patient.id}</p></div>
        <StatusBadge value={patient.status} />
      </div>
      <section className="panel patient-profile-card">
        <span className="patient-profile-avatar">{initials}</span>
        <div><strong>{patient.name}</strong><small>{patient.id}</small></div>
      </section>
      {detailGroups.map((group) => <section className="panel patient-detail-section" key={group.title}>
        <h2>{group.title}</h2>
        <dl className="patient-detail-grid">
          {group.fields.map((fieldName) => <div className="patient-detail-item" key={fieldName}>
            <dt>{labelFor(fieldName)}</dt>
            <dd>{displayValue(patient[fieldName])}</dd>
          </div>)}
        </dl>
      </section>)}
    </>}
  </div>;
}
