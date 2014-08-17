@echo off
set dir=%~dp0
jsdb -path "%dir%." "%dir%bin\JSBuilder.js" %*
