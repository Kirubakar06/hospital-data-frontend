const rolePermissions = {
  'Super Admin': ['*'],
  Admin: ['*'],
  Doctor: ['patients:read', 'appointments:read', 'appointments:update', 'medicalRecords:*', 'prescriptions:*', 'laboratory:read', 'laboratory:update', 'dashboard:read'],
  Receptionist: ['patients:*', 'appointments:*', 'departments:read', 'doctors:read', 'rooms:read', 'dashboard:read'],
  Nurse: ['patients:read', 'appointments:read', 'admissions:read', 'medicalRecords:read', 'dashboard:read'],
  'Lab Technician': ['patients:read', 'laboratory:*', 'dashboard:read'],
  Accountant: ['billing:*', 'payments:*', 'reports:read', 'dashboard:read'],
};

export function hasPermission(role, module, action) {
  const allowed = rolePermissions[role] || [];
  return allowed.includes('*') || allowed.includes(`${module}:*`) || allowed.includes(`${module}:${action}`);
}
