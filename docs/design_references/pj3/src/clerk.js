export const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.trim() || '';
export const isClerkConfigured = /^pk_(test|live)_.+/.test(clerkPublishableKey) && !clerkPublishableKey.includes('your_');

export const clerkAppearance = {
  variables: {
    colorBackground: '#0d0e10',
    colorText: '#f7f8f8',
    colorTextSecondary: '#8a8f98',
    colorInputBackground: '#090a0c',
    colorInputText: '#f7f8f8',
    colorPrimary: '#f7f8f8',
    colorPrimaryText: '#08090a',
    colorDanger: '#e78787',
    colorNeutral: '#f7f8f8',
    borderRadius: '8px',
    fontFamily: "'Inter Variable', Inter, sans-serif",
  },
  elements: {
    rootBox: 'axis-clerk-root',
    card: 'axis-clerk-card',
    header: 'axis-clerk-hidden',
    socialButtonsBlockButton: 'axis-clerk-social',
    socialButtonsBlockButtonText: 'axis-clerk-social-text',
    formButtonPrimary: 'axis-clerk-primary',
    formFieldInput: 'axis-clerk-input',
    formFieldLabel: 'axis-clerk-label',
    footerActionLink: 'axis-clerk-link',
    identityPreviewEditButton: 'axis-clerk-link',
    formResendCodeLink: 'axis-clerk-link',
    otpCodeFieldInput: 'axis-clerk-input',
    dividerLine: 'axis-clerk-divider',
    dividerText: 'axis-clerk-divider-text',
    alert: 'axis-clerk-alert',
    formFieldErrorText: 'axis-clerk-error',
    footer: 'axis-clerk-footer',
  },
};
