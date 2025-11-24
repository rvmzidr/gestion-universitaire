@echo off
REM Initialize the database using XAMPP MySQL client (double-click)
SET XAMPP_MYSQL=C:\xampp\mysql\bin\mysql.exe
IF NOT EXIST "%XAMPP_MYSQL%" (
  ECHO MySQL client not found at %XAMPP_MYSQL%.
  ECHO If you have MySQL elsewhere, edit this file and set XAMPP_MYSQL to the correct path.
  PAUSE
  EXIT /B 1
)
cd /d "%~dp0"
"%XAMPP_MYSQL%" -u root -p < db_init.sql
ECHO Done. Press any key to exit.
PAUSE
