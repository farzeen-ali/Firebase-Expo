const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | undefined {
  const trimmed = email.trim();
  if (!trimmed) {
    return 'Email is required.';
  }
  if (!EMAIL_PATTERN.test(trimmed)) {
    return 'Enter a valid email address.';
  }
  return undefined;
}

export function validatePassword(password: string, minLength = 1): string | undefined {
  if (!password) {
    return 'Password is required.';
  }
  if (password.length < minLength) {
    return `Use at least ${minLength} characters.`;
  }
  return undefined;
}

export function validateConfirmPassword(password: string, confirmPassword: string): string | undefined {
  if (!confirmPassword) {
    return 'Confirm your password.';
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match.';
  }
  return undefined;
}
