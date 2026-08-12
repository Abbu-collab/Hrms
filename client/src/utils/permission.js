export const normalizeRole = (role) => {
  if (!role) return "";
  const r = String(role).trim().toLowerCase();
  if (r === "admin") return "admin";
  if (
    r === "hr" ||
    r === "hr manager" ||
    r === "hr_manager" ||
    r === "human resources" ||
    r === "human_resources"
  ) {
    return "hr_manager";
  }
  if (r === "employee") return "employee";
  return r;
};

const permissions = {
  admin: [
    "dashboard",
    "profile",
    "employee",
    "attendance",
    "leave",
    "payroll",
    "reports",
    "settings",
    "users"
  ],

  hr_manager: [
    "dashboard",
    "profile",
    "employee",
    "attendance",
    "leave",
    "payroll",
    "reports",
    "settings"
  ],

  employee: [
    "dashboard",
    "profile",
    "attendance",
    "leave",
    "settings"
  ]
};

export const canAccessFeature = (role, feature) => {
  if (!role) return false;
  const normalizedRole = normalizeRole(role);
  return permissions[normalizedRole]?.includes(feature) || false;
};