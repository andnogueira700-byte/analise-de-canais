@echo off
chcp 65001 >nul
title Renderizar video
cd /d "%~dp0videos\engine"
where node >nul 2>nul || (echo. & echo Falta o Node.js. Baixe a versao LTS em https://nodejs.org , instale e rode este arquivo de novo. & pause & exit /b 1)
if not exist node_modules\playwright (
  echo Primeira vez: instalando o motor. Isso leva alguns minutos...
  call npm install || (echo Falhou a instalacao. & pause & exit /b 1)
)
set PROJETO=%~1
if "%PROJETO%"=="" set PROJETO=..\01-pitbull-t-rex\piloto
node renderizar.js "%PROJETO%"
echo.
pause
