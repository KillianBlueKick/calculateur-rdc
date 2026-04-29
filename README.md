# Calculateur de rentabilité — Conteneur RDC

Outil web pour calculer en temps réel la rentabilité d'un conteneur 40' HC envoyé de Belgique vers la RDC.

## Stack

- React 18 + Vite
- TailwindCSS
- lucide-react pour les icônes
- localStorage pour la persistance

## Installation

```bash
npm install
npm run dev
```

L'app sera dispo sur http://localhost:5173

## Build pour production

```bash
npm run build
```

Les fichiers sont générés dans `dist/`. À déployer sur Vercel, Netlify, ou n'importe quel hébergement statique.

## Déploiement Vercel (1 clic)

1. Push le repo sur GitHub
2. Connecte-toi sur vercel.com
3. Import du repo, click "Deploy"
4. C'est en ligne en 30 secondes

## Structure du projet

```
calculateur-rdc/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.jsx           # Entry point
    ├── App.jsx            # Wrapper principal
    ├── index.css          # Tailwind imports
    └── components/
        └── Calculator.jsx # Composant principal
```

## Personnalisation

Tous les frais par défaut sont définis dans `src/components/Calculator.jsx` dans la constante `defaultFees`. Tu peux les modifier directement dans le code, ou les modifier via l'interface (ils seront sauvegardés en localStorage).

Pour reset les valeurs par défaut, utilise le bouton "Réinitialiser tous les paramètres" en bas de la page, ou vide le localStorage du navigateur (clé : `rdc-calc-v2`).

## Logique de calcul

```
Coûts variables = somme(Belgique + Maritime + RDC + custom non-mensuels) activés
Coûts fixes/mois = somme(Fixes mensuels + custom mensuels) activés
Coûts fixes/conteneur = Coûts fixes/mois ÷ nombre de conteneurs/mois
Coût total = Coûts variables + Coûts fixes/conteneur

Revenu = cartons vendus × prix par carton
Bénéfice = Revenu − Coût total
Marge par carton = prix − (coûts variables ÷ capacité)
Seuil de rentabilité = Coût total ÷ prix par carton (arrondi sup.)
```
