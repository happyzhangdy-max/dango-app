@echo off
REM Sync web files to Capacitor www directory and patch for Android
set SRC=G:\workcraft\nihongo-corner
set DST=G:\workcraft\nihongo-corner\capacitor_app\www

if not exist "%DST%" mkdir "%DST%"

echo Copying core files...
copy "%SRC%\index.html" "%DST%\index.html" /y >nul
copy "%SRC%\inline.js" "%DST%\inline.js" /y >nul
copy "%SRC%\data.js" "%DST%\data.js" /y >nul
copy "%SRC%\grammar_data.js" "%DST%\grammar_data.js" /y >nul
copy "%SRC%\quiz_data_high.js" "%DST%\quiz_data_high.js" /y >nul
copy "%SRC%\quiz_data_normal.js" "%DST%\quiz_data_normal.js" /y >nul
copy "%SRC%\favicon.svg" "%DST%\favicon.svg" /y >nul

echo Copying game files...
if not exist "%DST%\game" mkdir "%DST%\game"
copy "%SRC%\game\tower-climb.js" "%DST%\game\tower-climb.js" /y >nul
copy "%SRC%\game\boxing.js" "%DST%\game\boxing.js" /y >nul

echo Copying assets...
if not exist "%DST%\assets" mkdir "%DST%\assets"
if exist "%SRC%\assets\*" xcopy "%SRC%\assets\*" "%DST%\assets\" /e /y /q >nul

echo Patching inline.js for Capacitor WebView (empty hostname)...
python -c "f=open('%DST%\\inline.js','r',encoding='utf-8');c=f.read();f.close();c=c.replace(\"h!=='127.0.0.1'\",\"h!=='127.0.0.1'&&h!==''\",1);f=open('%DST%\\inline.js','w',encoding='utf-8');f.write(c);f.close()" 2>nul

echo Syncing to Android...
cd /d %~dp0
call npx cap copy android

echo Done!
