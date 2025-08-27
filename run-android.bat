@echo off
echo ========================================
echo    TRINITY FAT LOSS - Android Launcher
echo ========================================

REM Configurazione Java
set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
set PATH=%JAVA_HOME%\bin;%PATH%
echo ✓ Java configurato: %JAVA_HOME%

REM Pulizia processi precedenti
echo.
echo 🧹 Pulizia processi precedenti...
taskkill /f /im java.exe 2>nul >nul
taskkill /f /im qemu*.exe 2>nul >nul
echo ✓ Processi puliti

REM Pulizia cartelle build
echo.
echo 🗑️  Pulizia cartelle build...
rd /s /q android\app\build 2>nul
rd /s /q android\build 2>nul
rd /s /q android\.gradle 2>nul
rd /s /q node_modules\@capacitor\android\capacitor\build 2>nul
echo ✓ Build precedenti rimossi

REM Build e sync
echo.
echo 🔨 Build del progetto React...
npm run build
if %ERRORLEVEL% neq 0 (
    echo ❌ Errore nel build React
    pause
    exit /b 1
)

echo.
echo 📱 Sync con Android...
npx cap sync android
if %ERRORLEVEL% neq 0 (
    echo ❌ Errore nel sync Capacitor
    pause
    exit /b 1
)

REM Avvio emulatore se non è già attivo
echo.
echo 🚀 Controllo emulatore...
adb devices | findstr "emulator" >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo 📱 Avvio emulatore...
    start "" "C:\Users\ClaudioDall'Ara\AppData\Local\Android\Sdk\emulator\emulator.exe" -avd Medium_Phone_API_36.0
    echo ⏳ Aspetto che l'emulatore si avvii...
    timeout /t 30 /nobreak
) else (
    echo ✓ Emulatore già attivo
)

REM Build e install dell'APK
echo.
echo 🔧 Build e installazione APK...
cd android
gradlew installDebug
if %ERRORLEVEL% neq 0 (
    echo ❌ Errore nel build/install APK
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo ✅ SUCCESS! L'app Trinity Fat Loss dovrebbe essere ora disponibile nell'emulatore!
echo.
pause
