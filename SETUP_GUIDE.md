# 🔧 Setup Guide - Sistema Profili e Salvataggio Ricette

Questa guida ti aiuterà a configurare il sistema di gestione utenti e salvataggio ricette per l'app SiChef.

## 📋 Prerequisiti

- Node.js 18+ installato
- Un progetto Supabase attivo
- Account OpenAI per le API (già configurato nell'app)

## 🚀 Installazione

### 1. Variabili di Ambiente

Crea/aggiorna il file `.env.local` nella root del progetto:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Public keys for client-side
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Altre variabili esistenti...
```

### 2. Setup Database Supabase

1. Accedi al tuo progetto Supabase
2. Vai in SQL Editor
3. Esegui lo script `database/schema.sql` per creare le tabelle e le policy di sicurezza

### 3. Installazione Dipendenze

```bash
npm install
# Le dipendenze Supabase sono già incluse nel package.json
```

## 🗄️ Struttura Database

### Tabella `users`
```sql
- id (UUID, Primary Key, riferimento a auth.users)
- email (VARCHAR, NOT NULL, UNIQUE)
- name (VARCHAR, nullable)
- avatar_url (VARCHAR, nullable)
- bio (TEXT, nullable)
- created_at, updated_at (TIMESTAMP)
```

### Tabella `recipes`
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key verso users, nullable)
- device_id (VARCHAR, nullable) -- Per ricette pre-login
- title (VARCHAR, NOT NULL)
- description (TEXT)
- image_url (VARCHAR)
- ingredients (JSONB)
- instructions (JSONB)
- servings, prep_time, cook_time, clean_time (INTEGER)
- calories, proteins, carbs, fats (INTEGER)
- notes (TEXT)
- is_public (BOOLEAN, default: true)
- source_url (VARCHAR)
- created_at, updated_at (TIMESTAMP)
```

## 🔐 Funzionalità Implementate

### 1. **Autenticazione**
- Registrazione utente con email/password
- Login sicuro con Supabase Auth
- Gestione stato autenticazione con React Context
- Logout e gestione sessioni

### 2. **Gestione Ricette Pre-Login**
- Salvataggio ricette con `device_id` per utenti non autenticati
- Migrazione automatica ricette al momento del login/registrazione
- Storage locale temporaneo per continuità utente

### 3. **Editor Ricette**
- Interfaccia completa per modificare ricette prima del salvataggio
- Campi editabili: titolo, descrizione, immagine, ingredienti, istruzioni
- Gestione tempistiche (prep, cottura, pulizia) e valori nutrizionali
- Toggle visibilità pubblica/privata

### 4. **Profilo Utente**
- Dashboard personale con tutte le ricette utente
- Visualizzazione ricette più amate
- Eliminazione ricette con conferma
- Stati di loading e gestione errori

### 5. **Integrazione Homepage**
- Pulsante "Salva ricetta" dopo generazione
- Modal editor integrato
- Flusso completo: genera → modifica → salva

## 🛠️ API tRPC Routes

### Auth Router (`/api/trpc/auth.*`)
- `register` - Registrazione nuovo utente
- `login` - Login utente
- `getCurrentUser` - Recupero profilo utente
- `migrateRecipes` - Migrazione ricette da localStorage

### Recipes Router (`/api/trpc/recipes.*`)
- `create` - Creazione ricetta (utente autenticato)
- `update` - Aggiornamento ricetta
- `delete` - Eliminazione ricetta
- `getById` - Recupero singola ricetta
- `getByUserId` - Ricette di un utente
- `getByDeviceId` - Ricette pre-login per device
- `getPublic` - Ricette pubbliche
- `saveTemporary` - Salvataggio temporaneo pre-login
- `associateToUser` - Associa ricette device a utente

## 🔄 Flusso Utente

### Scenario 1: Utente Non Registrato
1. Genera ricetta da link social
2. Clicca "Salva ricetta" → Modal editor
3. Modifica dettagli ricetta
4. Salva con `device_id` temporaneo
5. Ricetta salvata localmente, può essere recuperata

### Scenario 2: Registrazione Dopo Ricette Salvate
1. Utente con ricette salvate in device
2. Si registra/effettua login
3. Sistema migra automaticamente tutte le ricette device al nuovo user_id
4. Ricette ora accessibili da qualsiasi dispositivo

### Scenario 3: Utente Autenticato
1. Genera ricetta da link social
2. Clicca "Salva ricetta" → Modal editor
3. Modifica dettagli ricetta
4. Salva direttamente associata al suo user_id
5. Visibile immediatamente nel profilo

## 🎨 Componenti UI

### `AuthProvider`
Context provider per gestione stato autenticazione globale

### `AuthModal`
Modal login/registrazione con validazione e gestione errori

### `RecipeEditor`
Editor completo ricette con:
- Form validato per tutti i campi
- Gestione dinamica ingredienti e istruzioni
- Preview immagine
- Toggle visibilità pubblica

### Profilo Aggiornato
- Gestione stati autenticato/non autenticato
- Integrazione con API reali
- Skeleton loading states
- Eliminazione ricette con conferma

## 🛡️ Sicurezza

### Row Level Security (RLS)
- Users: possono vedere/modificare solo il proprio profilo
- Recipes: 
  - Tutti possono vedere ricette pubbliche
  - Users vedono tutte le proprie ricette
  - Solo proprietario può modificare/eliminare

### Validazione
- Schema Zod per validazione input
- Sanitizzazione dati lato server
- Gestione errori appropriata

## 🚀 Deploy e Produzione

1. **Configura Supabase**: Assicurati che le RLS policies siano attive
2. **Environment Variables**: Imposta tutte le variabili di ambiente
3. **Database Migration**: Esegui lo script SQL in produzione
4. **Testing**: Testa tutti i flussi utente

## 🐛 Debug e Troubleshooting

### Problemi Comuni

1. **Errore di autenticazione**: Verifica le chiavi Supabase
2. **Ricette non salvate**: Controlla le RLS policies
3. **Migrazione non funziona**: Verifica device_id nel localStorage

### Log Utili
```bash
# Console browser per device_id
localStorage.getItem('deviceId')

# Query Supabase per debug
SELECT * FROM recipes WHERE device_id = 'your_device_id';
SELECT * FROM recipes WHERE user_id = 'your_user_id';
```

## 📱 Funzionalità Future

- [ ] Social login (Google, Facebook)
- [ ] Condivisione ricette tra utenti
- [ ] Sistema di rating e recensioni
- [ ] Collezioni/categorie ricette
- [ ] Ricerca avanzata ricette
- [ ] Export ricette in PDF
- [ ] Notifiche push per nuove ricette

---

## 🎯 Risultato Finale

Con questa implementazione hai:

✅ Sistema completo di autenticazione  
✅ Gestione ricette pre-login con migrazione automatica  
✅ Editor ricette con interfaccia intuitiva  
✅ Profilo utente dinamico e reattivo  
✅ Integration perfetta con il flusso esistente  
✅ Sicurezza database con RLS  
✅ API scalabili con tRPC  

Il sistema è pronto per essere utilizzato e può gestire migliaia di utenti e ricette con sicurezza e prestazioni ottimali!