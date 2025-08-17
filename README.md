# Ricette AI - Un'applicazione T3 con Supabase e Netlify

Questo è un progetto [T3 Stack](https://create.t3.gg/) potenziato con Supabase per l'autenticazione e il database, e configurato per il deploy su Netlify.

## Tecnologie Utilizzate

-   [Next.js](https://nextjs.org) (App Router)
-   [TypeScript](https://www.typescriptlang.org/)
-   [Tailwind CSS](https://tailwindcss.com)
-   [tRPC](https://trpc.io) (per API type-safe)
-   [Supabase](https://supabase.io) (per autenticazione e database PostgreSQL)
-   [Netlify](https://www.netlify.com/) (per hosting e continuous deployment)

## Struttura del Progetto (Principali Cartelle)

-   `src/app/`: Contiene le pagine e i layout dell'applicazione (utilizzando Next.js App Router).
-   `src/server/`: Codice backend, inclusi i router tRPC.
    -   `src/server/api/routers/`: Definizione dei tuoi router tRPC.
    -   `src/server/api/trpc.ts`: Configurazione base di tRPC.
-   `lib/`: Utility e helper.
    -   `lib/supabase.ts`: Configurazione del client Supabase.
-   `public/`: File statici accessibili pubblicamente.
-   `env.js`: Gestione delle variabili d'ambiente (validazione con Zod).
-   `netlify.toml`: File di configurazione per Netlify (build, redirects, etc.).

## Primi Passi e Sviluppo Locale

1.  **Clona il repository (se non l'hai già fatto):**
    ```bash
    git clone https://github.com/arn9ve/bookmark.git
    cd bookmark
    ```

2.  **Installa le dipendenze:**
    ```bash
    npm install
    ```

3.  **Configura le variabili d'ambiente:**
    Copia `.env.example` (se esiste) in `.env` o crea un nuovo file `.env` nella root del progetto e aggiungi le seguenti variabili, sostituendo i placeholder con i tuoi valori reali:
    ```env
    # Supabase
    NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>

    # Altre variabili d'ambiente necessarie al tuo progetto
    # DATABASE_URL="postgresql://user:password@host:port/database" # Esempio se usi un DB diretto con tRPC, ma con Supabase usi il client JS
    ```
    Puoi trovare `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` nelle impostazioni del tuo progetto Supabase (Settings > API).

    **ATTENZIONE:** Non committare mai il tuo file `.env` su Git. Assicurati che `.env` sia presente nel tuo file `.gitignore` per evitare di esporre le tue chiavi segrete.

4.  **Avvia il server di sviluppo (integrato con Netlify CLI):**
    ```bash
    netlify dev
    ```
    Questo avvierà l'applicazione Next.js, rendendola disponibile di default su `http://localhost:8888` (Netlify potrebbe scegliere un'altra porta se quella è occupata). `netlify dev` simula l'ambiente Netlify, incluse le variabili d'ambiente definite nel pannello Netlify.

## Script Utili

-   `npm run dev`: Avvia il server di sviluppo Next.js (senza l'integrazione Netlify).
-   `npm run build`: Compila l'applicazione per la produzione.
-   `npm run start`: Avvia un server di produzione Next.js (dopo `npm run build`).
-   `npm run lint`: Esegue ESLint per l'analisi statica del codice.
-   `npm run format`: Formatta il codice con Prettier.

## Deploy

Il deploy è gestito automaticamente da Netlify. Ogni push sul branch `main` del repository GitHub (`arn9ve/bookmark`) triggererà un nuovo build e deploy del sito.

Puoi monitorare lo stato dei deploy e accedere al tuo sito dalla dashboard di Netlify: [https://app.netlify.com/sites/bookmark](https://app.netlify.com/sites/bookmark) (o l'URL specifico del tuo sito se diverso).

Per un deploy manuale in produzione (generalmente non necessario con il CD attivo):
```bash
npm run build
netlify deploy --prod
```

## Variabili d'Ambiente su Netlify

Ricorda di configurare le variabili d'ambiente `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` anche nell'interfaccia del tuo sito su Netlify (Site settings > Build & deploy > Environment). Questo è cruciale perché il processo di build su Netlify possa accedere a Supabase.

---

Questo README dovrebbe fornire una buona panoramica del progetto.
