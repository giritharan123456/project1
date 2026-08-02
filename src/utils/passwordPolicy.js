const EMPLOYEE_POLICY = {
  minLength: 8,
  requireUpper: true,
  requireLower: true,
  requireNumber: true,
  requireSpecial: true,
};

const EXECUTIVE_POLICY = {
  minLength: 12,
  requireUpper: true,
  requireLower: true,
  requireNumber: true,
  requireSpecial: true,
};

export const PASSWORD_POLICIES = {
  employee: EMPLOYEE_POLICY,
  manager: EMPLOYEE_POLICY,
  hr: EMPLOYEE_POLICY,
  host: EMPLOYEE_POLICY,
  admin: EXECUTIVE_POLICY,
  executive: EXECUTIVE_POLICY,
  ceo: EXECUTIVE_POLICY,
  default: EMPLOYEE_POLICY,
};

export function getPasswordPolicy(role) {
  return PASSWORD_POLICIES[role] || PASSWORD_POLICIES.default;
}

function buildRequirements(policy) {
  const requirements = [];
  requirements.push({
    label: `At least ${policy.minLength} characters`,
    met: (value) => value.length >= policy.minLength,
  });
  if (policy.requireUpper) {
    requirements.push({ label: 'One uppercase letter', met: (value) => /[A-Z]/.test(value) });
  }
  if (policy.requireLower) {
    requirements.push({ label: 'One lowercase letter', met: (value) => /[a-z]/.test(value) });
  }
  if (policy.requireNumber) {
    requirements.push({ label: 'One number', met: (value) => /[0-9]/.test(value) });
  }
  if (policy.requireSpecial) {
    requirements.push({ label: 'One special character', met: (value) => /[^a-zA-Z0-9]/.test(value) });
  }
  return requirements;
}

export function validatePassword(password, policy) {
  const activePolicy = policy || getPasswordPolicy();
  const value = password || '';
  const errors = [];
  if (value.length < activePolicy.minLength) {
    errors.push(`Password must be at least ${activePolicy.minLength} characters`);
  }
  if (activePolicy.requireUpper && !/[A-Z]/.test(value)) {
    errors.push('Password must include at least one uppercase letter');
  }
  if (activePolicy.requireLower && !/[a-z]/.test(value)) {
    errors.push('Password must include at least one lowercase letter');
  }
  if (activePolicy.requireNumber && !/[0-9]/.test(value)) {
    errors.push('Password must include at least one number');
  }
  if (activePolicy.requireSpecial && !/[^a-zA-Z0-9]/.test(value)) {
    errors.push('Password must include at least one special character');
  }
  return { valid: errors.length === 0, errors };
}

export function getPasswordStrength(password, policy) {
  const activePolicy = policy || getPasswordPolicy();
  const requirements = buildRequirements(activePolicy).map((req) => ({
    label: req.label,
    met: req.met(password || ''),
  }));
  const score = requirements.filter((req) => req.met).length;
  const total = requirements.length;
  let label;
  let color;
  let textColor;
  if (score <= 2) {
    label = 'Weak';
    color = 'bg-red-500';
    textColor = 'text-red-500';
  } else if (score < total) {
    label = 'Medium';
    color = 'bg-amber-500';
    textColor = 'text-amber-500';
  } else {
    label = 'Strong';
    color = 'bg-emerald-500';
    textColor = 'text-emerald-500';
  }
  return {
    label,
    score,
    color,
    textColor,
    width: `${(score / total) * 100}%`,
    requirements,
  };
}
