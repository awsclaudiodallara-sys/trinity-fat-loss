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

---

**Made with ❤️ for the fitness community**
