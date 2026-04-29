# Fiche technique — Calculateur de rentabilité conteneur RDC

## Contexte du projet

Outil web simple pour calculer en temps réel la rentabilité d'un conteneur 40' HC envoyé de Belgique vers la RDC. L'utilisateur (un opérateur logistique) doit pouvoir :

1. Activer/désactiver chaque ligne de frais via une checkbox
2. Modifier les montants par défaut de chaque ligne
3. Ajouter des frais personnalisés (avec choix par conteneur ou par mois)
4. Modifier le nombre de cartons vendus pour simuler différents scénarios
5. Voir en temps réel : revenus, coûts totaux, bénéfice net, seuil de rentabilité, marge par carton

L'outil doit être 100% côté client (pas de backend), avec persistance localStorage pour que les paramètres soient sauvegardés entre les sessions.

## Stack technique recommandé

- **React 18** avec Vite
- **TailwindCSS** pour le styling
- **lucide-react** pour les icônes (Plus, Trash2, RotateCcw)
- **localStorage** pour la persistance
- Aucune dépendance backend, déployable sur Vercel/Netlify en 1 clic

## Architecture des données

### Structure d'une ligne de frais

```javascript
{
  id: "be1",                          // identifiant unique
  category: "belgique",               // belgique | maritime | rdc | fixes
  label: "Transport dépôt → Anvers",
  amount: 400,                        // montant actuel modifiable
  enabled: true                       // checkbox cochée par défaut
}
```

### Données initiales à intégrer

**Catégorie "Belgique" (par conteneur) :**

| ID | Label | Montant |
|----|-------|---------|
| be1 | Transport dépôt → Anvers | 400 |
| be2 | Empotage du conteneur | 300 |
| be3 | Matériel d'emballage | 150 |
| be4 | Déclaration douane export | 200 |
| be5 | Documentation (BL, certifs) | 100 |

**Catégorie "Maritime" (par conteneur) :**

| ID | Label | Montant |
|----|-------|---------|
| m1 | Fret maritime Anvers → Matadi | 5400 |
| m2 | BAF (surcharge carburant) | 300 |
| m3 | THC Anvers | 275 |
| m4 | Surcharges (sécurité, etc.) | 225 |
| m5 | Assurance maritime | 225 |

**Catégorie "RDC" (par conteneur) :**

| ID | Label | Montant |
|----|-------|---------|
| r1 | THC Matadi | 400 |
| r2 | Dédouanement RDC | 750 |
| r3 | Inspection et scanning | 175 |
| r4 | Transport Matadi → Kinshasa | 750 |
| r5 | Dépotage + stockage | 300 |
| r6 | Distribution locale | 450 |
| r7 | Frais informels | 350 |

**Catégorie "Fixes mensuels" (par mois) :**

| ID | Label | Montant |
|----|-------|---------|
| f1 | Local/dépôt Bruxelles | 1000 |
| f2 | Camionnette (leasing) | 450 |
| f3 | Stack digital | 150 |
| f4 | WhatsApp + Twilio | 75 |
| f5 | Assurance RC pro | 150 |
| f6 | Téléphone, internet | 200 |
| f7 | Marketing | 300 |
| f8 | Comptable | 200 |
| f9 | Main-d'œuvre ponctuelle | 750 |
| f10 | Cotisations sociales | 750 |

### Frais personnalisés (ajoutés par l'utilisateur)

```javascript
{
  label: "Bonus partenaire RDC",
  amount: 500,
  enabled: true,
  isMonthly: false  // false = par conteneur, true = par mois
}
```

### Paramètres globaux

```javascript
{
  price: 100,           // prix de vente par carton en €
  capacity: 430,        // capacité du conteneur (60×55×40 = ~430 cartons)
  containers: 1,        // nombre de conteneurs envoyés par mois
  sold: 430             // cartons vendus pour la simulation (max = capacity)
}
```

## Logique de calcul

```javascript
// Coûts variables par conteneur (somme des frais Belgique + Maritime + RDC activés + custom non-mensuels)
const variableCost = sumEnabledFees(['belgique', 'maritime', 'rdc']) 
                   + sumEnabledCustomFees(false);

// Coûts fixes par mois (somme des frais fixes activés + custom mensuels)
const fixedCostsMonthly = sumEnabledFees(['fixes']) + sumEnabledCustomFees(true);

// Coûts fixes alloués par conteneur
const fixedCostPerContainer = fixedCostsMonthly / Math.max(containers, 0.1);

// Coût total par conteneur
const totalCost = variableCost + fixedCostPerContainer;

// Cartons vendus (plafonné à la capacité)
const cartonsSold = Math.min(sold, capacity);

// Taux de remplissage calculé automatiquement
const fillPercent = (cartonsSold / capacity) * 100;

// Revenu
const revenue = cartonsSold * price;

// Bénéfice
const profit = revenue - totalCost;

// Marge en %
const marginPercent = revenue > 0 ? (profit / revenue * 100) : 0;

// Coût variable par carton
const costPerCarton = variableCost / capacity;

// Marge par carton
const marginPerCarton = price - costPerCarton;

// Seuil de rentabilité (cartons à vendre pour atteindre le breakeven)
const breakEvenCartons = Math.ceil(totalCost / price);

// % du conteneur à remplir pour être rentable
const breakEvenPercent = (breakEvenCartons / capacity) * 100;

// Cartons manquants si en perte
const cartonsMissing = profit < 0 ? Math.ceil((totalCost - revenue) / price) : 0;
```

## Interface utilisateur

### Layout général

Layout en deux colonnes sur desktop (50/50), une seule colonne sur mobile.

**Colonne gauche : configuration des frais**

Sections empilées verticalement, chacune avec son titre et son total à droite :

1. Section "Paramètres globaux" avec 4 inputs :
   - Prix par carton (€)
   - Capacité conteneur (cartons)
   - Conteneurs par mois
   - Cartons vendus (simulation)
   
   Plus une rangée de 4 boutons rapides : `Seuil rentabilité` | `50%` | `80%` | `Plein`
   
   Plus un affichage "Remplissage: X% (Y/Z cartons)"

2. Section "Frais Belgique" — total affiché à droite du titre
3. Section "Fret maritime (Remant)" — total affiché à droite
4. Section "Frais RDC" — total affiché à droite
5. Section "Frais fixes mensuels" — total affiché avec "/mois"
6. Section "Frais personnalisés" — bouton "+ Ajouter" à droite du titre
7. Bouton "Réinitialiser tous les paramètres" en bas

**Colonne droite : résultats en temps réel**

5 cards empilées (sticky en haut sur desktop) :

1. **Revenu** — gros chiffre vert, sous-titre "X cartons × Y €"
2. **Coûts totaux par conteneur** — gros chiffre rouge, sous-titre "Variables: X € | Fixes: Y €"
3. **Bénéfice net** — vert si positif, rouge si négatif. Sous-titre :
   - Si rentable : "Marge: X%"
   - Si en perte : "Il manque X cartons pour être rentable"
4. **Seuil de rentabilité** — "X cartons", sous-titre "Y% du conteneur à remplir", barre de progression colorée :
   - Orange si pas encore atteint
   - Verte si dépassé
5. **Marge par carton** — chiffre, sous-titre "Coût variable par carton: X €"

### Composant ligne de frais

```
[✓] [Label de la ligne                    ] [____montant____] €
```
- Checkbox pour activer/désactiver (quand désactivé : opacity 0.4)
- Label en lecture seule (pas modifiable pour les frais standards)
- Input numérique éditable pour le montant

### Composant frais personnalisé

```
[✓] [Description libre__________] [montant] € [/cont. ou /mois] [×]
```
- Checkbox
- Input texte libre pour la description
- Input numérique pour le montant
- Bouton toggle qui alterne entre "/cont." et "/mois"
- Bouton de suppression (icône poubelle)

### Boutons de remplissage rapide

**"Seuil rentabilité"** : calcule le nombre exact de cartons pour breakeven et met à jour `sold`
**"50%"** : `sold = Math.round(capacity * 0.5)`
**"80%"** : `sold = Math.round(capacity * 0.8)`
**"Plein"** : `sold = capacity`

## Persistance localStorage

Sauvegarder dans localStorage à chaque modification.

Clé : `rdc-calc-v2`

Structure sauvegardée :
```javascript
{
  fees: { belgique: [...], maritime: [...], rdc: [...], fixes: [...] },
  custom: [...],
  globals: { price, capacity, containers, sold }
}
```

Bouton "Réinitialiser" demande confirmation puis vide localStorage et restaure les défauts.

## Design

- **Palette** :
  - Fond principal : blanc / `bg-white`
  - Fond secondaire (cards) : `bg-slate-50`
  - Primaire : `slate-900` (texte principal)
  - Vert (succès, bénéfice) : `emerald-600`
  - Rouge (danger, coûts) : `red-600`
  - Orange (warning, pas encore rentable) : `amber-500`
  - Bordures : `slate-200`

- **Typographie** : Inter ou system-ui
- **Style** : moderne, épuré, professionnel (inspiration Linear, Stripe Dashboard)
- **Border radius** : `rounded-lg` partout
- **Espacement** : padding généreux (1rem-1.5rem dans les cards)

## Cas de test à valider

**Test 1 : Configuration par défaut**
- Tous frais activés, valeurs par défaut, `sold = 430`
- Résultat attendu : revenu €43 000, coûts ~€14 800, bénéfice ~€28 200, seuil ~148 cartons

**Test 2 : Bouton "Seuil rentabilité"**
- Cliquer dessus, le bénéfice doit afficher exactement €0 (ou très proche)

**Test 3 : Désactivation de frais**
- Décocher "Assurance maritime" (€225) et "Frais informels" (€350)
- Le total doit baisser de €575

**Test 4 : Frais personnalisé mensuel**
- Ajouter "Salaire assistant" à €1500/mois
- Avec 1 conteneur/mois, les frais fixes augmentent de €1500
- Avec 2 conteneurs/mois, ils n'augmentent que de €750 par conteneur

**Test 5 : Modification de la capacité**
- Si `sold > capacity`, `sold` doit être automatiquement plafonné

**Test 6 : Persistance**
- Modifier des valeurs, recharger la page : tout doit être conservé

## Code de base fonctionnel

Un widget HTML/JS vanilla complet est fourni séparément (`widget-source.html`) que tu peux utiliser comme référence ou comme point de départ. Pour la version React, voir le composant `Calculator.jsx` fourni.

## Livrable attendu

- Application React fonctionnelle avec Vite
- Code propre, commenté en français
- README avec instructions d'installation et de déploiement
- Build optimisé pour la production
- Déployable en 1 clic sur Vercel ou Netlify
- Responsive (mobile + desktop)
