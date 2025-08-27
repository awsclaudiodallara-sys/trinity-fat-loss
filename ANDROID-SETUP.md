# 🚀 TRINITY FAT LOSS - Guida Android

## 📱 Per avviare l'app Android:

1. **Metodo semplice (raccomandato):**

   ```
   .\run-android.bat
   ```

2. **Metodo manuale:**

   ```powershell
   # 1. Configura Java
   $env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
   $env:PATH = "$env:JAVA_HOME\bin;" + $env:PATH

   # 2. Build React
   npm run build

   # 3. Sync Capacitor
   npx cap sync android

   # 4. Build e install
   cd android
   .\gradlew installDebug
   cd ..
   ```

## 🛠️ Troubleshooting:

### Se l'emulatore non si avvia:

```
"C:\Users\ClaudioDall'Ara\AppData\Local\Android\Sdk\emulator\emulator.exe" -avd Medium_Phone_API_36.0
```

### Se ci sono file bloccati:

```powershell
taskkill /f /im java.exe
Remove-Item -Recurse -Force android\app\build
```

### Se l'APK non si installa:

```
cd android
.\gradlew clean
.\gradlew installDebug
```

## 📦 Files importanti:

- `run-android.bat` - Script automatico completo
- `capacitor.config.ts` - Configurazione Capacitor
- `android/gradle.properties` - Configurazioni build Android

## ✅ Status check:

- Java: `java -version`
- Emulatori: `"C:\Users\ClaudioDall'Ara\AppData\Local\Android\Sdk\emulator\emulator.exe" -list-avds`
- Devices: `adb devices`

Perfetto! 🎉 Ora che è partito, creiamo una procedura semplice per le prossime volte!
📝 Script automatico per il futuro
Aggiorniamo il file batch con tutto quello che abbiamo imparato oggi:
run-android.bat+68-10
Creiamo anche un file di setup rapido:
Created ANDROID-SETUP.md
🎯 Per le prossime volte:
Metodo semplice (99% dei casi):

.\run-android.bat
E basta! 🚀

Se hai problemi:
Leggi ANDROID-SETUP.md per troubleshooting
Verifica che l'emulatore sia attivo
Pulisci le build se necessario
File che abbiamo creato:
✅ run-android.bat - Script completo automatico
✅ ANDROID-SETUP.md - Guida completa
✅ gradle.properties - Configurazioni ottimizzate
📱 Workflow tipico:
Modifica codice React/TypeScript
Esegui run-android.bat
Testa sull'emulatore
Ripeti 🔄
Ora hai tutto per lavorare in modo efficiente con Android! 🎉
