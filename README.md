# Portfolio — Prénom Nom

Site portfolio / CV moderne et futuriste avec motion design au scroll.
100 % statique (HTML / CSS / JS), **aucune étape de build** : il suffit d'héberger le dossier.

## Stack

- **GSAP 3 + ScrollTrigger** — animations, pin, scroll horizontal
- **Lenis** — smooth scroll
- Canvas 2D — grille de points animée dans le hero
- Polices Google : Unbounded, Inter, JetBrains Mono

## Structure

```
portfolio/
├── index.html            # Contenu des 4 sections (à éditer)
├── css/style.css         # Styles (couleurs dans :root)
├── js/main.js            # Animations & interactions
├── assets/
│   ├── favicon.svg
│   └── img/              # Tes images (photo.jpg, etc.)
└── .github/workflows/deploy.yml   # Déploiement auto GitHub Pages
```

## Sections

1. **Qui suis-je** — présentation, photo, chiffres clés, bouton « Demandez mon CV » (→ contact)
2. **Skills** — hard skills (cartes avec niveau) + soft skills (liste)
3. **Expérience** — postes en scroll horizontal (empilés sur mobile)
4. **Contact** — email + réseaux sociaux

## Remplacer le contenu

- Textes : rechercher `Prénom`, `Nom`, `Lorem`, `exemple.com` dans `index.html`
- Photo : mettre `assets/img/photo.jpg` puis remplacer le bloc `about__photo-placeholder`
  par `<img src="assets/img/photo.jpg" alt="Portrait" />`
- Compétence : dupliquer un `<article class="skill-card">` et changer `data-level`
- Poste : dupliquer un `<article class="exp-card">` (le compteur s'adapte seul)
- Couleurs : variables `--accent` et `--accent-2` dans `css/style.css`

## Lancer en local

```bash
python -m http.server 5173
```

Puis ouvrir http://localhost:5173

## Héberger gratuitement

**GitHub Pages (déjà configuré)**

1. Créer un dépôt sur GitHub (ex. `portfolio`)
2. `git remote add origin https://github.com/<user>/portfolio.git`
3. `git push -u origin main`
4. Sur GitHub : *Settings → Pages → Source : GitHub Actions*
5. Le site est en ligne sur `https://<user>.github.io/portfolio/`

Alternatives tout aussi gratuites : **Netlify**, **Vercel** ou **Cloudflare Pages**
(importer le dépôt GitHub, aucun réglage de build, dossier de publication = `/`).
Un nom de domaine perso peut ensuite être branché sur chacun d'eux.
