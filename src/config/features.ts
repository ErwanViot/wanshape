// Kill switch — kept temporarily as OR gate with premium tier.
// Will be removed after stabilisation of Stripe integration.
export const FEATURE_CUSTOM_SESSION = import.meta.env.VITE_FEATURE_CUSTOM_SESSION === 'true';
