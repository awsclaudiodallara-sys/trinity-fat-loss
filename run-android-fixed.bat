@echo off
set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
set PATH=%JAVA_HOME%\bin;%PATH%

echo Terminazione processi Java/Gradle...
taskkill /f /im java.exe 2>nul >nul
taskkill /f /im gradle*.exe 2>nul >nul

echo Pulizia completa delle cartelle di build...
rmdir /s /q android\app\build 2>nul
rmdir /s /q android\build 2>nul
rmdir /s /q android\.gradle 2>nul

echo Attesa per rilascio file...
timeout /t 3 /nobreak >nul

echo Avvio build Android...
npx cap run android --no-sync

pause
