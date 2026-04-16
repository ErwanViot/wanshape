# Dataset CIQUAL (ANSES)

La base de référence **CIQUAL** est publiée par l'ANSES (Agence nationale de sécurité
sanitaire de l'alimentation) sous **licence Etalab Open License 2.0**. Elle contient les
compositions nutritionnelles d'environ 3 000 aliments consommés en France.

Le fichier CSV n'est **pas versionné** dans ce repo (~3 Mo, référence externe). Il doit
être téléchargé manuellement avant de lancer le seed.

## Téléchargement

1. Aller sur <https://ciqual.anses.fr/>
2. Cliquer "Télécharger la table Ciqual" → choisir le format **CSV français**
3. Extraire l'archive dans ce dossier et renommer le fichier en `ciqual.csv`
4. Le chemin final doit être : `data/ciqual/ciqual.csv`

Alternative stable : <https://www.data.gouv.fr/fr/datasets/table-ciqual-composition-nutritionnelle-des-aliments/>
(ressource "Table Ciqual 2020 - French food composition table").

## Lancement du seed

```bash
# Depuis la racine du projet
VITE_SUPABASE_URL="<url>" SUPABASE_SERVICE_ROLE_KEY="<service-key>" \
  npx tsx scripts/seed-food-reference.ts
```

Par défaut le script lit `data/ciqual/ciqual.csv`. Un chemin alternatif peut être
passé en argument :

```bash
npx tsx scripts/seed-food-reference.ts path/to/other.csv
```

Le script upsert les ~3 000 lignes dans la table `food_reference` par batch de 500.

## Licence et attribution

- **Licence** : [Etalab Open License 2.0](https://www.etalab.gouv.fr/licence-ouverte-open-licence/)
- **Attribution obligatoire** : la mention "ANSES — Table CIQUAL" doit apparaître
  dans les crédits de l'application (footer Legal ou équivalent).
- La redistribution est autorisée. Pas de clause de copyleft.

## Format attendu

Colonnes CSV utilisées par le seed (séparateur `;`, décimales en virgule) :

| Colonne CIQUAL                                 | Colonne `food_reference` |
|------------------------------------------------|--------------------------|
| `alim_code`                                    | `id`                     |
| `alim_nom_fr`                                  | `name_fr`                |
| `alim_grp_nom_fr`                              | `group_fr`               |
| `Energie, Règlement UE N° 1169/2011 (kcal/100 g)` | `calories_100g`       |
| `Protéines, N x 6.25 (g/100 g)`                | `protein_100g`           |
| `Glucides (g/100 g)`                           | `carbs_100g`             |
| `Lipides (g/100 g)`                            | `fat_100g`               |
| `Fibres alimentaires (g/100 g)`                | `fiber_100g`             |

Les valeurs "-", "traces", "< X" sont converties en `NULL`.
