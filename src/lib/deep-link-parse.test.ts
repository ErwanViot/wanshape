import { describe, expect, it } from 'vitest';
import { urlToRouterPath } from './deep-link-parse.ts';

describe('urlToRouterPath', () => {
  describe('custom scheme (wan2fit://)', () => {
    it('extracts the host as the route segment when no path', () => {
      expect(urlToRouterPath('wan2fit://reset-password')).toBe('/reset-password');
      expect(urlToRouterPath('wan2fit://upgrade')).toBe('/upgrade');
      expect(urlToRouterPath('wan2fit://parametres')).toBe('/parametres');
    });

    it('preserves query string with custom scheme', () => {
      expect(urlToRouterPath('wan2fit://reset-password?token=xxx')).toBe('/reset-password?token=xxx');
      expect(urlToRouterPath('wan2fit://upgrade?priceId=price_123&session=abc')).toBe(
        '/upgrade?priceId=price_123&session=abc',
      );
    });

    it('preserves hash fragment with custom scheme', () => {
      expect(urlToRouterPath('wan2fit://parametres#notifications')).toBe('/parametres#notifications');
    });

    it('handles host + nested path together', () => {
      // wan2fit://auth/callback parses host='auth' pathname='/callback'
      expect(urlToRouterPath('wan2fit://auth/callback?type=signup')).toBe('/auth/callback?type=signup');
    });

    it('falls back to / for triple-slash custom scheme', () => {
      // wan2fit:/// gives empty host AND empty pathname → root.
      expect(urlToRouterPath('wan2fit:///')).toBe('/');
    });
  });

  describe('Universal Links (https://wan2fit.fr/...)', () => {
    it('extracts pathname directly', () => {
      expect(urlToRouterPath('https://wan2fit.fr/reset-password')).toBe('/reset-password');
      expect(urlToRouterPath('https://wan2fit.fr/upgrade')).toBe('/upgrade');
    });

    it('preserves query and hash', () => {
      expect(urlToRouterPath('https://wan2fit.fr/upgrade?session=xxx')).toBe('/upgrade?session=xxx');
      expect(urlToRouterPath('https://wan2fit.fr/parametres#abos')).toBe('/parametres#abos');
    });

    it('falls back to / when path is empty', () => {
      expect(urlToRouterPath('https://wan2fit.fr/')).toBe('/');
      expect(urlToRouterPath('https://wan2fit.fr')).toBe('/');
    });

    it('handles http: same as https:', () => {
      expect(urlToRouterPath('http://wan2fit.fr/upgrade')).toBe('/upgrade');
    });
  });

  describe('error fallback', () => {
    it('returns / for unparseable input', () => {
      expect(urlToRouterPath('not a url at all')).toBe('/');
      expect(urlToRouterPath('')).toBe('/');
    });
  });
});
