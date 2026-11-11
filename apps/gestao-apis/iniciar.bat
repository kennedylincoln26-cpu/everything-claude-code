@echo off
chcp 65001 >nul
title Gestao de APIs
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js nao encontrado. Instale a versao LTS em https://nodejs.org e tente de novo.
  pause
  exit /b 1
)

if not "%XAI_API_KEY%"=="" goto chave_claude
echo Primeira vez: cole sua chave da xAI (Grok) e aperte Enter. Deixe vazio para pular.
set /p XAI_API_KEY=Chave xAI: 
if "%XAI_API_KEY%"=="" goto chave_claude
setx XAI_API_KEY "%XAI_API_KEY%" >nul

:chave_claude
if not "%ANTHROPIC_API_KEY%"=="" goto iniciar
echo Primeira vez: cole sua chave da Anthropic (Claude) e aperte Enter. Deixe vazio para pular.
set /p ANTHROPIC_API_KEY=Chave Anthropic: 
if "%ANTHROPIC_API_KEY%"=="" goto iniciar
setx ANTHROPIC_API_KEY "%ANTHROPIC_API_KEY%" >nul

:iniciar
cls
echo App iniciando. O navegador vai abrir em http://127.0.0.1:4317
echo Para desligar, feche esta janela.
start "" cmd /c "timeout /t 2 >nul & start http://127.0.0.1:4317"
node --no-warnings src\server.js
pause
