echo off
rem �]�m�ƥ����|�H���{�ɤ��
cd /d %~dp0
set BackDir=..\..\..
set TempFolder=..\..\..\Temp\Profiles

rem �ƻs�ؼФ����{�ɤ��

::�R���֨�
del %BackDir%\chrome\UserScriptLoader\require\ /s /q
del %BackDir%\chrome\UserScriptLoader\temp\ /s /q

::�H�U�O���H
xcopy "%BackDir%\adblockedge" %TempFolder%\adblockedge\ /s /y /i
xcopy "%BackDir%\chrome" %TempFolder%\chrome\  /s /y /i
xcopy "%BackDir%\extensions" %TempFolder%\extensions\ /s /y /i
xcopy "%BackDir%\scriptish_scripts" %TempFolder%\scriptish_scripts\ /s /y /i

::�H�U�O���
xcopy "%BackDir%\addons.sqlite" %TempFolder%\ /y
xcopy "%BackDir%\cert8.db" %TempFolder%\ /y
xcopy "%BackDir%\extensions.json" %TempFolder%\ /y
xcopy "%BackDir%\extensions.sqlite" %TempFolder%\ /y
xcopy "%BackDir%\key3.db" %TempFolder%\ /y
xcopy "%BackDir%\signons.sqlite" %TempFolder%\ /y
xcopy "%BackDir%\logins.json" %TempFolder%\ /y
xcopy "%BackDir%\places.sqlite" %TempFolder%\ /y
xcopy "%BackDir%\permissions.sqlite" %TempFolder%\ /y
xcopy "%BackDir%\stylish.sqlite" %TempFolder%\ /y
xcopy "%BackDir%\extensions.ini" %TempFolder%\ /y
xcopy "%BackDir%\localstore.rdf" %TempFolder%\ /y
xcopy "%BackDir%\prefs.js" %TempFolder%\ /y
xcopy "%BackDir%\user.js" %TempFolder%\ /y

::Ū���������M����ήɶ�
for /f "usebackq eol=; tokens=1,2 delims==" %%i in ("..\..\..\..\Firefox\application.ini")do (if %%i==Version set ver=%%j)
set hour=%time:~,2%
if "%time:~,1%"==" " set hour=%time:~1,1%
set backupTime=%date:~0,4%-%date:~5,2%-%date:~8,2%,%hour%-%time:~3,2%-%time:~6,2% 
::�]�m�ƥ������|�H�Τ��W
set ArchiveName=d:\FirefoxBackup\Profiles_%ver%_%date:~0,4%-%date:~5,2%-%date:~8,2%,%hour%H-%time:~3,2%m-%time:~6,2%s.7z
rem �}�l�ƥ�
7z.exe u -up1q3r2x2y2z2w2 %ArchiveName% "%TempFolder%"
@echo �ƥ������I�R���{�ɤ��
rd "%TempFolder%" /s/q
