<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# migration
$ npx prisma  migrate dev --name init
# development
$ npm run start

# watch mode
$ npm run start:dev
# watch mode
$ npm run start:dev
# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

````

### ⚙️ Variables d’environnement (`.env`)
```env
API_KEY=admin
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dexchange
PORT=3000
````

### ▶️ Lancer le projet

```bash
npx prisma migrate dev --name init
npm run start:dev
```

### 📘 Documentation Swagger

> Disponible sur :  
> 👉 [http://localhost:3000/v1/documentation](http://localhost:3000/v1/documentation)

---

## 🔐 Authentification (API Key Guard)

Toutes les routes de l’API sont **protégées** par un guard global (`ApiKeyGuard`).  
Celui-ci vérifie la présence du header :

```http
x-api-key: admin
```

- Si absent → `401 Unauthorized`
- Si incorrect → `403 Forbidden`
- Si valide → accès autorisé à tous les endpoints

> L’utilisateur `admin` est donc autorisé par défaut sur tous les endpoints de l’API.

---

## 🧱 Stack Technique

- **NestJS** — Framework backend modulaire et typé
- **Prisma ORM** — Génère automatiquement les modèles et types TypeScript depuis `schema.prisma`
- **PostgreSQL** (ou autre DB Prisma-compatible)
- **Swagger** — Documentation automatique
- **class-validator / class-transformer** — Validation des DTOs
- **ConfigModule** — Gestion centralisée de la configuration
- **API Key Guard** — Sécurisation des endpoints

---

## 📂 Structure du projet

```
src/
├── main.ts
├── app.module.ts
├── common/
│   └── guards/api-key.guard.ts
├── prisma/
│   ├── prisma.module.ts
│   └── prisma.service.ts
└── transfers/
    ├── dto/
    │   └── create-transfer.dto.ts
    ├── transfers.controller.ts
    ├── transfers.service.ts
    └── transfers.module.ts
```

---

## 🔁 Liste des endpoints `transfers`

### `POST /v1/transfers`

Créer un transfert.

**Body :**

```json
{
  "amount": 12500,
  "currency": "XOF",
  "channel": "WAVE",
  "recipient": { "phone": "+221770000000", "name": "Jane Doe" },
  "metadata": { "orderId": "ABC-123" }
}
```

**Réponse :**

```json
{
  "id": "uuid",
  "reference": "TRF-20251102-1234",
  "status": "PENDING",
  "fees": 100,
  "total": 12600
}
```

---

### `GET /v1/transfers`

Liste paginée des transferts (pagination par curseur, filtres, recherche).

**Query params :**

- `status` — filtre par statut
- `channel` — filtre par canal
- `minAmount`, `maxAmount` — bornes du montant
- `q` — recherche par référence ou nom du destinataire
- `limit`, `cursor` — pagination

---

### `GET /v1/transfers/:id`

Retourne un transfert par ID.

---

### `POST /v1/transfers/:id/process`

Simule le traitement d’un transfert :

- 70 % de chances → `SUCCESS`
- 30 % → `FAILED`

Transitions :

```
PENDING → PROCESSING → SUCCESS | FAILED
```

---

### `POST /v1/transfers/:id/cancel`

Annule un transfert en attente (`PENDING` → `CANCELED`).

---

## 📘 Documentation Swagger

Swagger regroupe et décrit toutes les routes :

- Accessible sur **/v1/documentation**
- Indique les schémas DTO, les exemples et les headers requis (`x-api-key`)
- Généré automatiquement via `@nestjs/swagger`

---

## 🧩 Prisma ORM

Prisma est utilisé pour :

- **Modéliser la base de données** (`prisma/schema.prisma`)
- **Générer automatiquement les types TypeScript**
- **Exécuter les migrations**

Exemple :

```bash
npx prisma generate
npx prisma migrate dev --name init
```

Les tables `Transfer` et `AuditEvent` sont synchronisées avec Prisma et disponibles via le client `PrismaService`.

---

## 🧠 Architecture évolutive (Monorepo PNPM)

Ce projet pourrait être organisé en **monorepo PNPM**, avec 3 packages séparés :

```
apps/
  ├── api/           # Service NestJS (REST API)
  └── dashboard/     # Application front (React, Next, etc.)
packages/
  ├── database/      # Prisma + schémas + migrations
  └── dto/           # Types partagés entre API et dashboard
```

### 🔄 Avantages :

- Partage **des types Prisma** entre API et front
- Contrat fort sur le typage (`DTO` et `Model`)
- Découplage clair entre **données** et **services**
- Maintenance plus simple avec PNPM workspaces

Ainsi :

- L’**API** accède directement à la base (`packages/database`)
- Le **Dashboard** importe uniquement les types nécessaires via `packages/dto`, sans toucher à la BD

---

## 🧪 Tests unitaires

Les tests couvrent :

- Le calcul des frais (`0.8 %`, min `100`, max `1500`)
- Les transitions d’état (`PENDING → SUCCESS/FAILED`)
- Les vérifications du guard (`x-api-key`)

Lancer les tests :

```bash
npm test
```

---

## 📜 Licence

Projet développé à titre de test technique (DEXCHANGE).  
Licence libre à usage d’évaluation et de démonstration.

---
