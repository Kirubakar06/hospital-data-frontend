import {
  Activity, BedDouble, ClipboardList, CreditCard, FlaskConical, FileHeart,
  LayoutDashboard, Pill, ReceiptText, Settings, Stethoscope, Users, UserRound,
  UserCog, Building2, ChartNoAxesCombined, ScrollText, CalendarDays,
} from 'lucide-react';
import { hasPermission } from '../../shared/permissions.js';

export const navigation = [
  { section: 'OVERVIEW', items: [{ label: 'Dashboard', path: '/', icon: LayoutDashboard }] },
  { section: 'CARE & OPERATIONS', items: [
    { label: 'Patients', path: '/patients', icon: Users },
    { label: 'Doctors', path: '/doctors', icon: Stethoscope },
    { label: 'Departments', path: '/departments', icon: Building2 },
    { label: 'Appointments', path: '/appointments', icon: CalendarDays },
    { label: 'Rooms', path: '/rooms', icon: BedDouble },
    { label: 'Admissions', path: '/admissions', icon: ClipboardList },
    { label: 'Medical Records', path: '/medical-records', icon: FileHeart },
    { label: 'Prescriptions', path: '/prescriptions', icon: Pill },
    { label: 'Laboratory', path: '/laboratory', icon: FlaskConical },
  ] },
  { section: 'ADMINISTRATION', items: [
    { label: 'Billing', path: '/billing', icon: ReceiptText },
    { label: 'Payments', path: '/payments', icon: CreditCard },
    { label: 'Staff', path: '/staff', icon: UserRound },
    { label: 'Reports', path: '/reports', icon: ChartNoAxesCombined },
    { label: 'Users', path: '/users', icon: UserCog },
    { label: 'Settings', path: '/settings', icon: Settings },
    { label: 'Audit Logs', path: '/audit-logs', icon: ScrollText },
  ] },
];

const field = (name, label, type = 'text', options, required = false) => ({ name, label, type, options, required });
const status = ['Active', 'Admitted', 'Discharged', 'Inactive'];
const departments = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Emergency', 'Laboratory', 'Administration'];
const commonPatient = field('patient', 'Patient');
const commonDoctor = field('doctor', 'Doctor');
const commonDate = field('date', 'Date', 'date');
const commonStatus = (options = ['Active', 'Pending', 'Completed', 'Cancelled']) => field('status', 'Status', 'select', options);

export const moduleConfigs = {
  patients: { label: 'Patients', singular: 'Patient', route: '/patients', store: 'patients', icon: Users, prefix: 'PT', description: 'Manage patient profiles, care details, and contact information.', idLabel: 'Patient ID', searchFields: ['id', 'name', 'phone', 'email', 'city'], filters: [{ field: 'status', label: 'All statuses' }, { field: 'department', label: 'All departments' }], fields: [
    field('name', 'Patient name', 'text', null, true), field('age', 'Age', 'number'), field('dateOfBirth', 'Date of birth', 'date'), field('gender', 'Gender', 'select', ['Female', 'Male', 'Non-binary', 'Prefer not to say']), field('bloodGroup', 'Blood group', 'select', ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']), field('phone', 'Phone number', 'tel', null, true), field('email', 'Email', 'email'), field('address', 'Address'), field('city', 'City'), field('emergencyContact', 'Emergency contact', 'tel'), field('department', 'Department', 'select', departments), field('doctor', 'Assigned doctor'), field('appointmentDate', 'Appointment date', 'date'), field('symptoms', 'Symptoms', 'textarea'), field('diagnosis', 'Diagnosis', 'textarea'), field('admissionType', 'Admission type', 'select', ['OP', 'IP']), field('status', 'Patient status', 'select', status),
  ], columns: ['id', 'name', 'age', 'phone', 'department', 'doctor', 'status'] },
  doctors: { label: 'Doctors', singular: 'Doctor', route: '/doctors', store: 'doctors', icon: Stethoscope, prefix: 'DR', description: 'Manage your medical team, specialties, and availability.', idLabel: 'Doctor ID', searchFields: ['id', 'name', 'phone', 'email'], filters: [{ field: 'department', label: 'All departments' }, { field: 'availability', label: 'All availability' }], fields: [
    field('name', 'Doctor name', 'text', null, true), field('specialization', 'Specialization', 'text', null, true), field('department', 'Department', 'select', departments), field('phone', 'Phone number', 'tel'), field('email', 'Email', 'email'), field('experience', 'Experience'), field('qualification', 'Qualification'), field('fee', 'Consultation fee', 'number'), field('availability', 'Availability', 'select', ['Available', 'In Surgery', 'On Leave']),
  ], columns: ['id', 'name', 'specialization', 'department', 'phone', 'availability'] },
  departments: { label: 'Departments', singular: 'Department', route: '/departments', store: 'departments', icon: Building2, prefix: 'DEP', description: 'Organize hospital departments and clinical teams.', idLabel: 'Department ID', searchFields: ['id', 'name', 'head', 'location'], filters: [{ field: 'status', label: 'All statuses' }], fields: [field('name', 'Department name', 'text', null, true), field('head', 'Department head'), field('location', 'Location'), field('staff', 'Staff count', 'number'), commonStatus(['Active', 'Inactive'])], columns: ['id', 'name', 'head', 'location', 'staff', 'status'] },
  appointments: { label: 'Appointments', singular: 'Appointment', route: '/appointments', store: 'appointments', icon: CalendarDays, prefix: 'AP', description: 'Schedule visits and keep every appointment on track.', idLabel: 'Appointment ID', searchFields: ['id', 'patient', 'doctor', 'department'], filters: [{ field: 'status', label: 'All statuses' }, { field: 'department', label: 'All departments' }], fields: [field('patient', 'Patient name', 'text', null, true), field('doctor', 'Doctor name', 'text', null, true), field('department', 'Department', 'select', departments), field('date', 'Appointment date', 'date', null, true), field('time', 'Appointment time', 'time', null, true), field('type', 'Appointment type', 'select', ['Consultation', 'Follow-up', 'Check-up', 'Emergency']), field('reason', 'Reason', 'textarea'), commonStatus(['Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'No Show'])], columns: ['id', 'patient', 'doctor', 'date', 'time', 'department', 'status'] },
  rooms: { label: 'Rooms', singular: 'Room', route: '/rooms', store: 'rooms', icon: BedDouble, prefix: 'RM', description: 'Monitor room availability, assignments, and daily rates.', idLabel: 'Room ID', searchFields: ['id', 'room', 'type', 'department'], filters: [{ field: 'status', label: 'All statuses' }, { field: 'type', label: 'All room types' }], fields: [field('room', 'Room number', 'text', null, true), field('type', 'Room type', 'select', ['General', 'Private', 'Semi-private', 'ICU', 'Emergency']), field('department', 'Department', 'select', departments), field('floor', 'Floor'), field('rate', 'Daily rate', 'number'), commonStatus(['Available', 'Occupied', 'Maintenance'])], columns: ['id', 'room', 'type', 'department', 'floor', 'rate', 'status'] },
  admissions: { label: 'Admissions', singular: 'Admission', route: '/admissions', store: 'admissions', icon: ClipboardList, prefix: 'AD', description: 'Coordinate inpatient stays, room assignments, and discharge plans.', idLabel: 'Admission ID', searchFields: ['id', 'patient', 'room', 'doctor'], filters: [{ field: 'status', label: 'All statuses' }], fields: [commonPatient, field('room', 'Room number'), commonDoctor, field('admitDate', 'Admission date', 'date'), field('expectedDischarge', 'Expected discharge', 'date'), field('diagnosis', 'Diagnosis'), commonStatus(['Admitted', 'Discharged', 'Pending'])], columns: ['id', 'patient', 'room', 'doctor', 'admitDate', 'expectedDischarge', 'status'] },
  medicalRecords: { label: 'Medical Records', singular: 'Medical Record', route: '/medical-records', store: 'medicalRecords', icon: FileHeart, prefix: 'MR', description: 'Keep clinical notes, diagnoses, and patient history organized.', idLabel: 'Record ID', searchFields: ['id', 'patient', 'doctor', 'diagnosis'], filters: [{ field: 'type', label: 'All types' }, { field: 'status', label: 'All statuses' }], fields: [commonPatient, commonDoctor, commonDate, field('type', 'Record type', 'select', ['Consultation', 'Imaging', 'Lab result', 'Discharge']), field('diagnosis', 'Diagnosis'), field('notes', 'Clinical notes', 'textarea'), commonStatus(['Open', 'Reviewed', 'Archived'])], columns: ['id', 'patient', 'doctor', 'date', 'type', 'diagnosis', 'status'] },
  prescriptions: { label: 'Prescriptions', singular: 'Prescription', route: '/prescriptions', store: 'prescriptions', icon: Pill, prefix: 'RX', description: 'Manage medication orders and prescription status.', idLabel: 'Prescription ID', searchFields: ['id', 'patient', 'doctor', 'medication'], filters: [{ field: 'status', label: 'All statuses' }], fields: [commonPatient, commonDoctor, field('medication', 'Medication', 'text', null, true), field('dosage', 'Dosage'), field('frequency', 'Frequency'), field('date', 'Prescribed date', 'date'), commonStatus(['Active', 'Completed', 'Discontinued'])], columns: ['id', 'patient', 'doctor', 'medication', 'dosage', 'date', 'status'] },
  laboratory: { label: 'Laboratory', singular: 'Lab Test', route: '/laboratory', store: 'laboratory', icon: FlaskConical, prefix: 'LB', description: 'Track diagnostic tests, priority, and reported results.', idLabel: 'Test ID', searchFields: ['id', 'patient', 'test', 'requestedBy'], filters: [{ field: 'priority', label: 'All priorities' }, { field: 'status', label: 'All statuses' }], fields: [commonPatient, field('test', 'Test name', 'text', null, true), field('requestedBy', 'Requested by'), commonDate, field('priority', 'Priority', 'select', ['Routine', 'Urgent', 'STAT']), field('result', 'Result', 'textarea'), commonStatus(['Pending', 'In Progress', 'Completed', 'Cancelled'])], columns: ['id', 'patient', 'test', 'requestedBy', 'date', 'priority', 'status'] },
  billing: { label: 'Billing', singular: 'Invoice', route: '/billing', store: 'billing', icon: ReceiptText, prefix: 'BL', description: 'Create invoices and follow balances through payment.', idLabel: 'Invoice ID', searchFields: ['id', 'patient', 'service'], filters: [{ field: 'status', label: 'All statuses' }], fields: [commonPatient, commonDate, field('service', 'Service', 'text', null, true), field('amount', 'Amount', 'number', null, true), field('dueDate', 'Due date', 'date'), commonStatus(['Pending', 'Paid', 'Overdue', 'Cancelled'])], columns: ['id', 'patient', 'date', 'service', 'amount', 'dueDate', 'status'] },
  payments: { label: 'Payments', singular: 'Payment', route: '/payments', store: 'payments', icon: CreditCard, prefix: 'PY', description: 'Review payment transactions and methods.', idLabel: 'Payment ID', searchFields: ['id', 'invoice', 'patient', 'method'], filters: [{ field: 'status', label: 'All statuses' }, { field: 'method', label: 'All methods' }], fields: [field('invoice', 'Invoice ID'), commonPatient, commonDate, field('method', 'Payment method', 'select', ['Credit card', 'Cash', 'Insurance', 'Bank transfer']), field('amount', 'Amount', 'number', null, true), commonStatus(['Completed', 'Pending', 'Refunded', 'Failed'])], columns: ['id', 'invoice', 'patient', 'date', 'method', 'amount', 'status'] },
  staff: { label: 'Staff', singular: 'Staff Member', route: '/staff', store: 'staff', icon: UserRound, prefix: 'ST', description: 'Manage staff contacts, roles, and shift assignments.', idLabel: 'Staff ID', searchFields: ['id', 'name', 'role', 'department', 'email'], filters: [{ field: 'department', label: 'All departments' }, { field: 'status', label: 'All statuses' }], fields: [field('name', 'Full name', 'text', null, true), field('role', 'Role', 'text', null, true), field('department', 'Department', 'select', departments), field('phone', 'Phone number', 'tel'), field('email', 'Email', 'email'), field('shift', 'Shift', 'select', ['Day', 'Evening', 'Night']), commonStatus(['Active', 'On Leave', 'Inactive'])], columns: ['id', 'name', 'role', 'department', 'phone', 'shift', 'status'] },
  reports: { label: 'Reports', singular: 'Report', route: '/reports', store: 'reports', icon: ChartNoAxesCombined, prefix: 'RP', description: 'Generate and organize operational and financial reports.', idLabel: 'Report ID', searchFields: ['id', 'name', 'category', 'owner'], filters: [{ field: 'category', label: 'All categories' }, { field: 'status', label: 'All statuses' }], fields: [field('name', 'Report name', 'text', null, true), field('category', 'Category', 'select', ['Financial', 'Operations', 'Clinical', 'Staff']), field('period', 'Reporting period'), field('generated', 'Generated date', 'date'), field('owner', 'Owner'), commonStatus(['Ready', 'Processing', 'Archived'])], columns: ['id', 'name', 'category', 'period', 'generated', 'owner', 'status'] },
  users: { label: 'Users', singular: 'User', route: '/users', store: 'users', icon: UserCog, prefix: 'US', description: 'Manage system accounts and access roles.', idLabel: 'User ID', searchFields: ['id', 'name', 'email', 'role'], filters: [{ field: 'role', label: 'All roles' }, { field: 'status', label: 'All statuses' }], fields: [field('name', 'Full name', 'text', null, true), field('email', 'Email', 'email', null, true), field('password', 'Initial password / new password', 'password'), field('role', 'Role', 'select', ['Administrator', 'Doctor', 'Nurse', 'Receptionist', 'Lab Technician', 'Accountant']), field('department', 'Department', 'select', departments), field('lastLogin', 'Last login'), commonStatus(['Active', 'Inactive', 'Locked'])], columns: ['id', 'name', 'email', 'role', 'department', 'lastLogin', 'status'] },
  settings: { label: 'Settings', singular: 'Setting', route: '/settings', store: 'settings', icon: Settings, prefix: 'SET', description: 'Configure hospital preferences and notification defaults.', idLabel: 'Setting ID', searchFields: ['id', 'setting', 'value', 'category'], filters: [{ field: 'category', label: 'All categories' }], fields: [field('setting', 'Setting name', 'text', null, true), field('value', 'Value', 'text', null, true), field('category', 'Category', 'select', ['General', 'Regional', 'Notifications', 'Security']), field('updated', 'Last updated', 'date')], columns: ['id', 'setting', 'value', 'category', 'updated'] },
  auditLogs: { label: 'Audit Logs', singular: 'Audit Entry', route: '/audit-logs', store: 'auditLogs', icon: ScrollText, prefix: 'LOG', description: 'Review a traceable history of important system activity.', idLabel: 'Log ID', searchFields: ['id', 'user', 'action', 'target', 'ip'], filters: [{ field: 'status', label: 'All statuses' }], fields: [field('user', 'User'), field('action', 'Action', 'text', null, true), field('target', 'Target'), field('date', 'Date and time'), field('ip', 'IP address'), commonStatus(['Success', 'Failed'])], columns: ['id', 'user', 'action', 'target', 'date', 'ip', 'status'] },
};

export function sidebarNavigationForRole(role) {
  const moduleForRoute = Object.fromEntries(Object.values(moduleConfigs).map(({ route, store }) => [route, store]));
  moduleForRoute['/'] = 'dashboard';
  return navigation.map((group) => ({
    ...group,
    items: group.items.map((item) => ({
      ...item,
      allowed: hasPermission(role, moduleForRoute[item.path], 'read'),
    })),
  }));
}

export function navigationForRole(role) {
  return sidebarNavigationForRole(role)
    .map((group) => ({ ...group, items: group.items.filter((item) => item.allowed) }))
    .filter((group) => group.items.length);
}

export const defaultNavIcon = Activity;
