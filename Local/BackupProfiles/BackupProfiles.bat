echo off
@echo ���������s�����Z�۰ʶ}�l�ƥ��K�K
taskkill /im firefox.exe
@echo ����3�� ���ݸ�Ʀ^�s�K�K
::����3�� ���ݸ�Ʀ^�s
ping -n 3 127.0.0.1>nul
rem �]�m�ƥ����|�H���{�ɤ��
cd /d %~dp0
set BackDir=..\..\..
set TempFolder=..\..\..\Temp\Profiles
::�R���֨�
del %BackDir%\chrome\UserScriptLoader\require\ /s /q
rem �ƻs�ؼФ����{�ɤ��
::::::::::::::::::::�H�U�O��Ƨ�::::::::::::::::::::
::�׼s�i
xcopy "%BackDir%\adblockplus" %TempFolder%\adblockplus\ /s /y /i
xcopy "%BackDir%\adblockedge" %TempFolder%\adblockedge\ /s /y /i
::�gblock�]�w
xcopy "%BackDir%\extension-data" %TempFolder%\extension-data\ /s /y /i
::�U���˦�&UC�}��
xcopy "%BackDir%\chrome" %TempFolder%\chrome\  /s /y /i
::�X�R�M��
xcopy "%BackDir%\extensions" %TempFolder%\extensions\ /s /y /i
::���Ҫ��ƥ��ɮ�
::xcopy "%BackDir%\bookmarkbackups" %TempFolder%\bookmarkbackups\ /s /y /i
::�ϥΪ̸}��
xcopy "%BackDir%\scriptish_scripts" %TempFolder%\scriptish_scripts\ /s /y /i
xcopy "%BackDir%\gm_scripts" %TempFolder%\gm_scripts\ /s /y /i
::�j�M������Ƨ�
::xcopy "%BackDir%\searchplugins" %TempFolder%\searchplugins\ /s /y /i
::::::::::::::::::::�H�U�O�ɮ�::::::::::::::::::::
::�X�R�M��
xcopy "%BackDir%\addons.sqlite" %TempFolder%\ /y
xcopy "%BackDir%\extensions.json" %TempFolder%\ /y
xcopy "%BackDir%\extensions.sqlite" %TempFolder%\ /y
xcopy "%BackDir%\extensions.ini" %TempFolder%\ /y
::�w�����ҳ]�w  �x�s�A�Ҧ����w�����ҳ]�w�ζפJ Firefox �� SSL ���ҡC 
xcopy "%BackDir%\cert8.db" %TempFolder%\ /y
::Cookie Cookie �O�A�h�L�������s��b�A�q�������@�Ǹ�T�A�q�`�O�@��������������n�]�w�εn�J���A�C
xcopy "%BackDir%\cookies.sqlite" %TempFolder%\ /y
::�ϥΪ��x�s���b��M�K�X
xcopy "%BackDir%\key3.db" %TempFolder%\ /y
xcopy "%BackDir%\signons.sqlite" %TempFolder%\ /y
xcopy "%BackDir%\logins.json" %TempFolder%\ /y
::���ҡB�U���P�s������ �o���ɮץ]�t�z�b Firefox ���Ҧ����ҡB�U�������H�Ϋ��X�L�������M��C
xcopy "%BackDir%\places.sqlite" %TempFolder%\ /y
::�S������]�w Firefox ���v���]�w�]�Ҧp�A���\���Ǻ�����ܼu�X�����^�ΰ��ӧO�����]�m���Y���ҡC
xcopy "%BackDir%\permissions.sqlite" %TempFolder%\ /y
xcopy "%BackDir%\content-prefs.sqlite" %TempFolder%\ /y
::�۰ʧ����M�� �x�s�F�A�b�j�M�C�κ�������椤��J�L���r��C
xcopy "%BackDir%\formhistory.sqlite" %TempFolder%\ /y
::�O�ФF�u��C���s�����ǻP��m
xcopy "%BackDir%\localstore.rdf" %TempFolder%\ /y
::�ӤH���n�]�w prefs.js �x�s�F�ϥΪ̦ۭq�����n�]�w�A�Ҧp�A�b Firefox �ﶵ ��ܤ�����ק諸�]�w�C�t�@�D���n�������ɮ׬O user.js�A�p�G�����ܡA�̭����]�w�|�u�����N����ק�L�����n�]�w�C 
xcopy "%BackDir%\prefs.js" %TempFolder%\ /y
xcopy "%BackDir%\user.js" %TempFolder%\ /y
::Stylish���˦��ƾ�
xcopy "%BackDir%\stylish.sqlite" %TempFolder%\ /y
::LastPass
xcopy "%BackDir%\lp.loginpws" %TempFolder%\ /y
xcopy "%BackDir%\lp.suid" %TempFolder%\ /y
::foxyproxy���N�z�]�w
xcopy "%BackDir%\foxyproxy.xml" %TempFolder%\ /y
::�ۭq�u��C �ɮ��x�s�F�u��C�ε����j�p�P��m���]�w�ȡC
::xcopy "%BackDir%\xulstore.json" %TempFolder%\ /y
::�U���ʧ@ �x�s�A��� Firefox ���p��B�z�S�w�榡�ɮת����n�]�w�A�Ҧp�A�I�� PDF �ɮɡA�����H Acrobat Reader �}�ҥ��C
::xcopy "%BackDir%\mimeTypes.rdf " %TempFolder%\ /y
::�j�M����  �x�s�F Firefox �j�M�C�̩ҨϥΪ����j�M�����C 
::xcopy "%BackDir%\search.sqlite" %TempFolder%\ /y
::xcopy "%BackDir%\search.json" %TempFolder%\ /y
::�ӤH�r��
::xcopy "%BackDir%\persdict.dat" %TempFolder%\ /y
::DOM �s�x DOM �s�x�]�p���ت��O���Ѥ@�ؤ� Cookie ��j�B��w���A�ӥB����ϥΪ���T�s�x���N��סC�����������T�s��b webappsstore.sqlite�A�� chromeappsstore.sqlite �h�s��U�� about:* �����C 
::xcopy "%BackDir%\webappsstore.sqlite" %TempFolder%\ /y
::xcopy "%BackDir%\chromeappsstore.sqlite" %TempFolder%\ /y
::�~���{�� MIME ���� �x�s����A�Ҧw�˥~���{���� ���ں����C�髬���C
::xcopy "%BackDir%\pluginreg.dat" %TempFolder%\ /y
::�s�����A �|�x�s�ثe�}�Ҥ��������M�����C
::xcopy "%BackDir%\sessionstore.js" %TempFolder%\ /y

::Ū���������M����ήɶ�
for /f "usebackq eol=; tokens=1,2 delims==" %%i in ("..\..\..\..\Firefox\application.ini")do (if %%i==Version set ver=%%j)
set hour=%time:~,2%
if "%time:~,1%"==" " set hour=%time:~1,1%
set backupTime=%date:~0,4%-%date:~5,2%-%date:~8,2%,%hour%-%time:~3,2%-%time:~6,2% 
::�]�m�ƥ������|�H�Τ��W
set ArchiveName=d:\FirefoxBackup\Profiles_Firefox_%ver%_%date:~0,4%�~-%date:~5,2%��-%date:~8,2%��[%hour%�I-%time:~3,2%��-%time:~6,2%��].7z
rem �}�l�ƥ�
7z.exe u -up1q3r2x2y2z2w2 %ArchiveName% "%TempFolder%"
@echo �ƥ������I�R���{�ɤ��
rd "%TempFolder%" /s/q
@echo �Ұ��s����
::"..\..\..\..\Firefox\firefox.exe" pcxFirefox�K����|
::"..\..\..\..\MyFirefox.exe" MyFirefox�K����|
start "Mozilla Firefox" "..\..\..\..\MyFirefox.exe"
::����4������CMD
ping -n 4 127.0.0.1>nul