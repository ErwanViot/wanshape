// Premium feature gate — controls access to AI-powered custom sessions and programs.
// Originally a kill switch during Stripe integration; now retained as the premium
// tier configuration flag. Not currently imported (premium access is checked via
// subscription tier in the router), but kept as a central feature flag reference.
export const FEATURE_CUSTOM_SESSION = import.meta.env.VITE_FEATURE_CUSTOM_SESSION === 'true';
