# Wan2Fit Design System

Guide de référence des tokens visuels et conventions UI.

## Couleurs

### Surfaces (élévation)

| Token | Dark | Light | Usage |
|---|---|---|---|
| `surface-0` | `#141419` | `#ffffff` | Fond de page principal |
| `surface-1` | `#1a1a22` | `#f5f5f7` | Fond légèrement élevé |
| `surface-2` | `#22222d` | `#ebedf0` | Cartes, sections |
| `surface-3` | `#2a2a3a` | `#e2e4e8` | Éléments interactifs, hover |

### Texte (hiérarchie)

| Token | Dark | Usage |
|---|---|---|
| `heading` | `#ffffff` | Titres, h1-h3 |
| `strong` | `rgba(255,255,255, 0.92)` | Sous-titres, labels importants |
| `body` | `rgba(255,255,255, 0.72)` | Texte courant |
| `subtle` | `rgba(255,255,255, 0.65)` | Texte secondaire |
| `muted` | `rgba(255,255,255, 0.55)` | Placeholders, légendes |
| `faint` | `rgba(255,255,255, 0.50)` | Texte très discret |

### Bordures

| Token | Dark | Usage |
|---|---|---|
| `divider` | `rgba(255,255,255, 0.08)` | Séparateurs, bordures par défaut |
| `divider-strong` | `rgba(255,255,255, 0.15)` | Bordures accentuées, hover |

### Cartes

| Token | Dark | Usage |
|---|---|---|
| `card-bg` | `rgba(255,255,255, 0.08)` | Fond glass-card |
| `card-border` | `rgba(255,255,255, 0.12)` | Bordure glass-card |

### Brand

| Token | Valeur | Usage |
|---|---|---|
| `brand` | `#4F46E5` | Couleur principale (indigo) |
| `brand-secondary` | `#3B82F6` | Couleur secondaire (blue) |
| `link` | `#818CF8` | Liens texte |

## Border Radius — 3 paliers

| Classe Tailwind | Valeur | Usage |
|---|---|---|
| `rounded-2xl` | 16px | Cartes, modales, sections (`.glass-card`, `.format-card`) |
| `rounded-xl` | 12px | Boutons, inputs, éléments interactifs |
| `rounded-full` | 999px | Pills, badges, avatars, tags |

> **Convention** : ne pas utiliser de valeurs custom (`rounded-[20px]`). S'en tenir aux 3 paliers ci-dessus. `rounded-lg` (8px) est acceptable pour les petits éléments (labels, onglets).

## Composants CSS

### `.glass-card`
Carte avec effet glassmorphism. Utilise `card-bg` + `card-border` + `backdrop-blur`.

```html
<div class="glass-card rounded-2xl p-5">...</div>
```

En mode light, ajoute automatiquement une ombre légère.

### `.cta-gradient`
Bouton gradient brand. **Réservé aux CTA principaux** : lancer une séance, créer un compte (hero), commencer un programme.

```html
<button class="cta-gradient px-8 py-3.5 rounded-full text-sm font-bold text-white">
  Commencer
</button>
```

Ne PAS utiliser pour : form submits (login, signup, reset password), actions secondaires, nudges.

### `.btn-primary`
Bouton solid brand. Pour les form submits et actions secondaires.

```html
<button class="btn-primary py-3 rounded-xl text-white font-semibold">
  Se connecter
</button>
```

### `.gradient-text`
Texte avec dégradé brand.

```html
<span class="gradient-text">Wan2Fit</span>
```

## Typographie

- **Minimum** : 12px (`text-xs`). Ne jamais utiliser `text-[11px]`, `text-[9px]`, etc.
- Titres : `text-2xl` / `text-xl` + `font-bold` + `text-heading`
- Corps : `text-sm` + `text-body`
- Labels : `text-xs` + `font-semibold` + `text-muted`

## Thème

3 modes : `system` (défaut), `dark`, `light`.

- Stockage : `localStorage` clé `wan2fit-theme`
- Attribut : `data-theme="light"` sur `<html>` (absent = dark)
- Player et EndScreen : toujours dark, pas de switch
- Hook : `useTheme()` retourne `{ preference, theme, cycleTheme }`

## Zones exemptées du thème

Le Player et l'EndScreen restent **toujours en mode sombre** quel que soit le thème choisi. Les classes `text-white`, `bg-white/10`, etc. y sont hardcodées volontairement.
