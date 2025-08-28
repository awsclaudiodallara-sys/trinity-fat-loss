# Trinity Fat Loss - Fitness Social App 🏋️‍♀️

Trinity Fat Loss è un'app innovativa di fitness sociale che connette persone con obiettivi simili in gruppi di 3 (Trinity) per supporto reciproco e motivazione nel percorso di perdita peso.

## 🎯 Obiettivo dell'App

### **Il Problema**

- La perdita peso è difficile da mantenere senza supporto sociale
- Le app fitness tradizionali sono troppo impersonali
- Manca accountability tra gli utenti
- I coaching 1-on-1 sono costosi e non scalabili

### **La Soluzione Trinity**

**Trinity Fat Loss** risolve questi problemi creando **gruppi di 3 persone** con:

- ✅ **Matching algoritmo intelligente** basato su obiettivi, età, livello fitness
- ✅ **Supporto reciproco** attraverso chat di gruppo e videocall
- ✅ **Accountability condivisa** con check-in giornalieri e settimanali
- ✅ **Gamification** con badge, streak e competizioni amichevoli
- ✅ **Costo accessibile** rispetto al coaching individuale

## 🏆 Funzionalità Principali

### **Core Features**

- 🔍 **Smart Matching**: Algoritmo che trova i 2 partner perfetti per ogni utente
- 💬 **Chat Gruppo**: Comunicazione real-time tra i 3 membri del Trinity
- 📹 **Video Call**: Sessioni di gruppo programmate per supporto face-to-face
- 📊 **Progress Tracking**: Dashboard personalizzata con grafici e statistiche
- ✅ **Check-in Sistema**: Daily e weekly tasks per mantenere l'accountability
- 🏅 **Gamification**: Badge, achievements e streak per mantenere la motivazione

### **Advanced Features**

- 📱 **PWA + Android**: Disponibile come web app e app nativa Android
- 🔔 **Smart Notifications**: Reminder personalizzati e notifiche di gruppo
- 📅 **Calendario Integrato**: Scheduling automatico delle video call
- 💰 **Freemium Model**: Versione gratuita + premium con features avanzate

## 🛠️ Stack Tecnologico

- **Frontend**: React + TypeScript + Vite
- **Backend**: Supabase (Database + Auth + Real-time)
- **Mobile**: Capacitor (PWA + Android nativo)
- **Auth**: Email/Password + Google OAuth (Apple in roadmap)
- **Styling**: TailwindCSS
- **State Management**: React Hooks
- **Monetization**: AdMob + Premium subscriptions

## 🚀 Getting Started

### **Prerequisites**

- Node.js 18+
- npm/yarn
- Supabase account

### **Installation**

1. **Clone il repository**

   ```bash
   git clone https://github.com/boobaGreen/trinity-fat-loss-app.git
   cd trinity-fat-loss-app/frontend-trinity-fat-loss
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Setup environment variables**

   ```bash
   cp .env.example .env.local
   # Aggiungi le tue credenziali Supabase
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Build per production**
   ```bash
   npm run build
   ```

### **Android Build**

```bash
npm run build
npx cap copy android
npx cap open android
```

## 📱 Deployment

- **PWA**: Netlify/Vercel per progressive web app
- **Android**: Google Play Store con Capacitor
- **iOS**: App Store (roadmap future)

## 🔧 Development

### **Available Scripts**

- `npm run dev` - Start development server
- `npm run build` - Build per production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript type checking

### **Project Structure**

```
src/
├── components/     # React components
├── pages/         # Main pages
├── hooks/         # Custom React hooks
├── lib/           # Utilities e Supabase client
├── services/      # API services
└── assets/        # Static assets
```

## 🤝 Contributing

1. Fork il repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Contact

- **Project Link**: [https://github.com/boobaGreen/trinity-fat-loss-app](https://github.com/boobaGreen/trinity-fat-loss-app)
- **Roadmap**: Vedi `ROADMAP.md` per pianificazione dettagliata

## 🚧 ROADMAP - Sviluppi Pianificati

### **🔥 Priorità Immediata (Settimana Corrente)**

#### **🏆 Sistema Achievements & Gamification**

- [ ] **Logiche Achievements Automatiche**

  - [ ] Implementare sistema di controllo automatico per sblocco badge body composition
  - [ ] Integrare achievement tracking con progressi weekly check-in
  - [ ] Database trigger per auto-unlock achievements basati su criteri
  - [ ] Logica achievements trio (gruppo) - coordinazione tra i 3 membri
  - [ ] Sistema punti e leaderboard interno Trinity group

- [ ] **Badge System Funzionale**
  - [ ] Badge per milestone raggiunti (peso, body fat, streak)
  - [ ] Sistema punti e livelli progressivi
  - [ ] Leaderboard tra trio con ranking
  - [ ] Achievement speciali (streaks, peso perso, body recomposition)
  - [ ] UI animazioni per celebration nuovo badge
  - [ ] Profile page con collezione badges utente
  - [ ] Achievement sharing nelle chat di gruppo
  - [ ] Condivisione social dei risultati

#### **📊 Analytics Dashboard di Gruppo**

- [ ] **Sostituzione Analytics User Singolo**

  - [ ] **IMPORTANTE**: Le attuali analytics user singolo sono solo un MOCK/DEMO
  - [ ] Sostituire BodyCompositionAnalyticsDemo con sistema funzionante
  - [ ] Integrare dati reali da database Supabase (body_measurements table)
  - [ ] Collegare progress tracking con dati check-in settimanali reali
  - [ ] Rimuovere tutti i mock data e implementare query database reali

- [ ] **Trinity Group Analytics**

  - [ ] Dashboard aggregata dei 3 membri del gruppo
  - [ ] Comparazione progressi body composition tra membri
  - [ ] Grafici trend di gruppo (media, migliore, obiettivi collettivi)
  - [ ] Insights AI su performance del trio
  - [ ] Challenge/competitions interne al gruppo

- [ ] **Metriche Sociali**
  - [ ] Tracking partecipazione chat e video call
  - [ ] Indice di supporto reciproco (messaggi incoraggianti, reazioni)
  - [ ] Goal setting collettivi con progress condiviso
  - [ ] Weekly/monthly trio report automatici

### **🔔 Sistema Notifiche Completo (Priorità Alta)**

#### **Notifiche Multi-Platform**

- [ ] **Email Notifications (PWA Web)**

  - [ ] Sistema email transazionali (Supabase Auth + SendGrid/Resend)
  - [ ] Welcome email post-registrazione con guida
  - [ ] Notifica matching trovato con dettagli trio
  - [ ] Reminder weekly check-in via email
  - [ ] Reminder video call settimanale (24h + 1h prima)
  - [ ] Summary weekly progress via email
  - [ ] Achievement unlock notifications via email

- [ ] **Push Notifications (Android)**

  - [ ] Integrazione Firebase Cloud Messaging
  - [ ] Push notification matching completato
  - [ ] Daily check-in reminder push
  - [ ] Video call reminder push (timing configurabile)
  - [ ] New chat message push (configurable, non spam)
  - [ ] Achievement unlock celebration push
  - [ ] Trio member progress milestone push

- [ ] **Smart Notification Logic**
  - [ ] User preference center (email/push on/off per tipo)
  - [ ] Time zone aware notifications
  - [ ] Do not disturb hours respect
  - [ ] Frequency capping per evitare spam
  - [ ] A/B testing per ottimizzare engagement

### **👥 Comunicazione & Social (Priorità Media)**

#### **💬 Chat Testuale Gruppo**

- [✅] **Chat Preview Widget**

  - [✅] Componente ChatPreview integrato in Dashboard
  - [✅] Preview ultimi 3 messaggi con timestamp
  - [✅] Indicatore unread count e status membri
  - [✅] Mock data per testing UI/UX
  - [✅] Quick action buttons per aprire chat completa

- [✅] **Chat Full-Screen Page**

  - [✅] Pagina dedicata /trinity-chat (TrinityChat.tsx)
  - [✅] Chat real-time UI con messaggi, typing indicators
  - [✅] Status membri online/offline con avatar
  - [✅] Sistema input con emoji e attachment buttons
  - [✅] Responsive design per mobile e desktop

- [ ] **Chat Backend Integration**
  - [ ] Integrazione Supabase Realtime per messaggi real-time
  - [ ] Database table: trinity_chat_messages
  - [ ] API per send/receive/history messaggi
  - [ ] Push notifications per nuovi messaggi
  - [ ] File upload per sharing foto progress

#### **📹 Video Chat Settimanale & Scheduling**

- [✅] **Video Call Widget Dashboard**

  - [✅] Componente VideoCallWidget integrato in Dashboard
  - [✅] Status next call schedulato con countdown
  - [✅] Participants preview con confirmation status
  - [✅] Quick join/schedule buttons
  - [✅] Mock data per testing UI/UX

- [✅] **Video Call Full-Screen Page**

  - [✅] Pagina dedicata /trinity-video (TrinityVideo.tsx)
  - [✅] Pre-call screen con video preview e agenda
  - [✅] In-call interface con participants grid
  - [✅] Camera/mic controls, screen share buttons
  - [✅] Call duration timer e leave call functionality

- [ ] **Video Call Backend Integration**

- [ ] **📅 Calendario & Voting System**

  - [ ] Sistema di booking per videocall intelligente
  - [ ] Interface per proporre slot orari settimana prossima
  - [ ] Sistema voting democratico tra i 3 membri
  - [ ] Scelta data/ora coordinata tra utenti
  - [ ] Auto-confirmation quando raggiunto consenso maggioranza
  - [ ] Fallback automatico se no consenso (slot predefiniti)
  - [ ] Sincronizzazione tra i 3 membri
  - [ ] Promemoria automatici (24h, 1h prima)
  - [ ] Integration con calendario personale membri
  - [ ] Integrazione calendario esterno (Google Calendar)

- [ ] **Video Call Features Avanzate**
  - [ ] Scheduling automatico delle call ricorrenti
  - [ ] Agenda automatica per ogni call (progress review, goal setting)
  - [ ] Timer Pomodoro integrato per sessioni strutturate
  - [ ] Whiteboard condivisa per planning meals/workouts
  - [ ] Post-call summary automatico con action items
  - [ ] Analytics partecipazione e engagement video call

### **� Monetization & Business (Priorità Media-Bassa)**

#### **👑 Sistema Premium**

- [ ] **Freemium Model**

  - [ ] Piano gratuito vs premium con features differentiate
  - [ ] Features premium (grafici avanzati, coach AI, analytics gruppo)
  - [ ] Unlimited storage foto/documenti per premium
  - [ ] Advanced achievements e leaderboard globali
  - [ ] Priority customer support

- [ ] **Payment & Subscriptions**
  - [ ] Sistema di pagamento (Stripe/PayPal integration)
  - [ ] Gestione abbonamenti mensili/annuali
  - [ ] Trial period gratuito premium (7-14 giorni)
  - [ ] Upgrade/downgrade seamless
  - [ ] Invoice e receipt management

#### **📱 AdMob Integration**

- [ ] **Ads Strategy per Free Users**
  - [ ] Banner ads per utenti free (setup già pronto)
  - [ ] Interstitial ads tra sessioni (non invasivo)
  - [ ] Reward ads per features bonus (extra achievements, etc.)
  - [ ] Video ads per unlock temporary premium features
  - [ ] Ottimizzazione revenue con A/B testing

#### **🍎 Auth Provider Aggiuntivi**

- [ ] **Multi-Provider Authentication**
  - [ ] Apple Sign-In (iOS/macOS users) - priorità per iOS release
  - [ ] Facebook/Meta Login (opzionale, social integration)
  - [ ] Microsoft/LinkedIn (business users)
  - [ ] Enhanced profile sync across providers

### **🔧 Ottimizzazioni Tecniche (Priorità Bassa)**

#### **Performance & Mobile**

- [ ] **Performance Optimization**

  - [ ] Lazy loading per componenti pesanti analytics
  - [ ] Caching intelligente dati achievements e chat
  - [ ] Ottimizzazione query database per dashboard gruppo
  - [ ] Service worker per offline-first chat experience
  - [ ] Image optimization e compression automatica

- [ ] **Mobile Experience**
  - [ ] Enhanced mobile UI per video chat
  - [ ] Gesture navigation per analytics dashboard
  - [ ] Photo/camera integration per progress sharing
  - [ ] Biometric authentication (fingerprint/face)
  - [ ] Haptic feedback per achievements

#### **📈 AI & Analytics Avanzate**

- [ ] **AI Insights per Gruppo**
  - [ ] Predizioni success rate del trio basate su engagement
  - [ ] Suggerimenti personalizzati per migliorare dinamiche gruppo
  - [ ] Early warning system per membri a rischio drop-out
  - [ ] Recommendation engine per challenge trio personalizzate
  - [ ] Natural language processing per sentiment analysis chat
  - [ ] Predictive analytics per goal achievement

---

### **📊 Progress Tracking**

#### **Completamento Features Core**

- **Autenticazione**: 100% ✅
- **Matching System**: 95% ✅
- **Body Composition Analytics**: 80% 🚧
- **Dashboard**: 60% 🚧
- **Achievements System**: 40% 🚧
- **Chat System**: 0% ❌
- **Video Call**: 0% ❌
- **Notifications**: 10% ❌
- **Premium/AdMob**: 0% ❌

#### **Timeline Roadmap**

- **Q4 2025**: Achievements completi, Analytics gruppo, Chat testuale
- **Q1 2026**: Video call, Notifiche complete, Sistema premium MVP
- **Q2 2026**: AdMob optimization, AI insights, Mobile enhancements
- **Q3 2026**: iOS release, Advanced features, Scale optimization

---

**Made with ❤️ for the fitness community**
