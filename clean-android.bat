@echo off
set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
set PATH=%JAVA_HOME%\bin;%PATH%
echo Java configurato: %JAVA_HOME%

echo Pulizia del progetto Android...
cd android
gradlew clean
echo.
echo Clean completato!
cd..
pause
