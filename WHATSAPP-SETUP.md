# Notifications WhatsApp — Meta Cloud API

Les confirmations de réservation et l'alerte équipe partent automatiquement depuis le
webhook Stripe (`/api/booking/webhook`) une fois le paiement confirmé. Tout est
best-effort : si WhatsApp n'est pas configuré, la réservation et l'email fonctionnent quand même.

## 1. Récupérer les identifiants (Meta)

1. https://business.facebook.com → app WhatsApp Business.
2. **WhatsApp > API Setup** : noter le **Phone number ID** → `WHATSAPP_PHONE_NUMBER_ID`.
3. Créer un **System User** (Business Settings > Users) avec un **token permanent** ayant
   les permissions `whatsapp_business_messaging` + `whatsapp_business_management` → `WHATSAPP_TOKEN`.
4. Renseigner le numéro de l'équipe qui reçoit les alertes → `WHATSAPP_TEAM_NUMBER` (chiffres only, ex `66812345678`).

## 2. Créer le template de confirmation (obligatoire)

Un message envoyé par l'entreprise (non sollicité) DOIT utiliser un template approuvé.

- **Meta Business Suite > WhatsApp > Message Templates > Create**
- Nom : `booking_confirmation` (= `WHATSAPP_BOOKING_TEMPLATE`)
- Catégorie : **Utility**
- Langue : English (= `WHATSAPP_TEMPLATE_LANG=en`)
- Corps avec 4 variables, dans cet ordre :

  ```
  Hi {{1}}, your booking at Shi Shi Samui is confirmed ✅
  Activity: {{2}}
  Date: {{3}} at {{4}}
  See you on court!
  ```

  L'ordre des `{{n}}` correspond à `notifyClientBooking` : `{{1}}` nom, `{{2}}` activité, `{{3}}` date, `{{4}}` heure.

> Si tu changes l'ordre/le nombre de variables, adapte `bodyParams` dans `src/lib/whatsapp.ts`.

## 3. Alerte équipe

Envoyée en **message texte libre** (`notifyTeamBooking`). Cela ne marche que si le numéro
de l'équipe a écrit au numéro business dans les dernières 24h (fenêtre de service Meta).
Pour la rendre 100% fiable hors fenêtre, créer aussi un template `team_new_booking` et
remplacer l'appel `sendWhatsAppText` par `sendWhatsAppTemplate` dans `notifyTeamBooking`.

## 4. Variables `.env.local`

```
WHATSAPP_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_API_VERSION=v21.0
WHATSAPP_BOOKING_TEMPLATE=booking_confirmation
WHATSAPP_TEMPLATE_LANG=en
WHATSAPP_TEAM_NUMBER=
```

Le client reçoit la confirmation seulement s'il a saisi un **téléphone** au format
international (le champ téléphone du formulaire de réservation).
