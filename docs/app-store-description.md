# Wan2Fit — Store listings (FR)

Brouillon initial des copy stores pour la première soumission iOS App Store + Google Play Store. Toutes les longueurs sont mesurées en caractères affichés (espaces inclus).

> **Statut** : draft. À valider avec une passe ASO + retours après les premiers screenshots définitifs.

---

## App Store (iOS)

### Name (max 30)
`Wan2Fit — sport guidé`

> 22 caractères. Combine la marque et la promesse principale (séance guidée).

### Subtitle (max 30)
`Séances complètes, sans matos`

> 30 caractères. Renforce le bénéfice immédiat.

### Promotional text (max 170, modifiable sans review)
`Une séance complète chaque jour : échauffement, exercices, étirements. 25 à 40 minutes, guidées au timer. Programmes IA, suivi nutritionnel, recettes. Sans matériel.`

> 170 caractères. Prévu pour être réécrit régulièrement à la sortie de nouvelles features.

### Description (max 4000)

```
Ton programme sport, prêt à lancer.

Wan2Fit te livre une séance complète chaque fois que tu ouvres l'app : échauffement, renforcement, cardio, étirements. Tout est guidé, timé, audio. Tu sors le téléphone, tu suis. Pas de calcul, pas de feuille de route à monter, pas de matériel.

— Tes outils —

• 8 formats de séance prêts à jouer : Pyramide, Renforcement, Superset, EMOM, Circuit, AMRAP, HIIT, Tabata.
• 3 programmes structurés : débutant 4 semaines, remise en forme, cardio express.
• Bibliothèque d'exercices au poids du corps avec vidéo et coaching de la posture.
• Suivi de tes séances, progression visualisée, jamais de pression à enchaîner.

— Wan2Fit Premium —

• Génération IA de séances sur mesure (objectifs, équipement, blessures déclarées).
• Programmes personnalisés sur 4 à 12 semaines, recalés quand tu progresses.
• Suivi nutritionnel : journal alimentaire, estimation calorique IA, analyse quotidienne, plus de 40 recettes équilibrées.

— Notre approche —

• On respecte les jours de repos. Pas de série quotidienne forcée, pas de gamification qui culpabilise.
• Des séances vraiment progressives : tu sens la marche, tu n'es pas en sur-régime.
• Confidentialité au cœur : aucune donnée de santé ne sort vers les outils d'analyse, masquage strict, hébergement européen pour les données produit. Détails sur wan2fit.fr/legal/privacy.

— L'abonnement Premium —

L'abonnement Premium se souscrit sur wan2fit.fr (le site web). Il est ensuite reconnu automatiquement dans l'app, sans étape supplémentaire. Tu peux résilier à tout moment depuis ton compte sur wan2fit.fr.

— Important —

Wan2Fit propose des exercices physiques. Consulte un professionnel de santé avant de commencer un programme, surtout en cas de pathologie connue. Les contenus de l'app ne remplacent pas un avis médical.

Édité par WAN SOFT — wan2fit.fr — contact@wan2fit.fr
```

> 1 932 caractères. Largement sous la limite, laisse de la marge pour des sections « nouveautés » ajoutées à chaque release.

### Keywords (max 100, virgules sans espace)

```
fitness,sport,hiit,tabata,séance,musculation,cardio,programme,coach,renforcement,nutrition,exercice
```

> 95 caractères. Mots-clés courts, focus sur l'intention de recherche, pas de répétition de la marque (le name suffit).

### Support URL
`https://wan2fit.fr/contact` *(à créer si non existant — sinon `mailto:contact@wan2fit.fr`)*

### Marketing URL
`https://wan2fit.fr`

### Privacy Policy URL
`https://wan2fit.fr/legal/privacy`

### Category
- Primary : **Health & Fitness**
- Secondary : **Lifestyle**

---

## Google Play Store (Android)

### Title (max 30)
`Wan2Fit — sport guidé`

### Short description (max 80)
`Séance de sport guidée chaque jour. 25 à 40 min, sans matériel. Programmes IA.`

> 80 caractères pile.

### Full description (max 4000)

Reprend la description App Store ci-dessus, à l'identique. Google Play autorise un peu plus de mise en forme (sauts de ligne, listes à puces avec markdown léger), mais la version actuelle s'affiche correctement dans les deux stores.

### Tags / catégorie
- Catégorie : **Santé et remise en forme**
- Tags additionnels (Play Console) : Forme physique, Entraînement personnel

---

## ASO — pistes pour V2 (à arbitrer après les premiers retours)

- Tester un name plus court orienté usage (`Wan2Fit : sport quotidien`).
- Ajouter `pilates`, `mobilité`, `étirements` aux keywords si on a un format dédié à la mobilité visible dans l'app.
- Si on lance les notifications IA-prêtes côté mobile (`ai_generation_ready`), pousser le mot-clé `IA` plus haut dans le subtitle.
- Suivre l'écart de conversion entre keyword `hiit` (très concurrentiel) vs `cardio` / `tabata` pour réallouer les caractères.

---

## Sources

- Description marketing existante : `index.html` (meta description + og:description).
- Liste des formats : `src/data/formats.ts`.
- Liste des programmes fixes : `src/data/programs/`.
- Politique de confidentialité : `src/components/Legal.tsx` (section `Politique de confidentialité`).
