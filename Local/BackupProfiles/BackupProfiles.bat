echo off
Title �ƥ�Firefox�]�m��Ƨ�
ECHO.&ECHO.�Y�N�}�lProfiles���]�C�ݭn����Firefox�{�ǡA�ЫO�s���n�����! �����N���~��I&PAUSE >NUL 2>NUL
@echo ���������s�����Z�۰ʶ}�l�ƥ��K�K
taskkill /im firefox.exe
@echo ����2�� ���ݸ�Ʀ^�s�K�K
::����2�� ���ݸ�Ʀ^�s
ping -n 2 127.0.0.1>nul
rem �]�m�ƥ����|�H���{�ɸ�Ƨ�
cd /d %~dp0
::�q��B�z�Ҧb��m��]�m��Ƨ��]Profiles�^�A�@��F3�h
set BackDir=..\..\..
set TempFolder=..\..\..\Temp\Profiles
rem �ƻs�ؼ��ɮר��{�ɸ�Ƨ�

::::::::::::::::::::�H�U�O��Ƨ�::::::::::::::::::::
::�׼s�i
xcopy "%BackDir%\adblockplus" %TempFolder%\adblockplus\ /s /y /i
::�gblock�]�w
xcopy "%BackDir%\extension-data" %TempFolder%\extension-data\ /s /y /i
::�U���˦�&UC�}��
xcopy "%BackDir%\chrome" %TempFolder%\chrome\  /s /y /i
::�X�R�M��
xcopy "%BackDir%\extensions" %TempFolder%\extensions\ /s /y /i
::bookmarkbackups �ؿ��x�s�F���Ҫ��ƥ��ɮסA�i�Ω�^�_�z�����ҡC
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
::���ҡB�U���P�s�������Gplaces.sqlite �o���ɮץ]�t�z�b Firefox ���Ҧ����ҡB�U�������H�Ϋ��X�L�������M��C
xcopy "%BackDir%\places.sqlite" %TempFolder%\ /y
::�ϥΪ��x�s���b��M�K�X�G�z���K�X�x�s�b key3.db �� logins.json ����ɮפ����C
xcopy "%BackDir%\key3.db" %TempFolder%\ /y
xcopy "%BackDir%\logins.json" %TempFolder%\ /y
::�ϥΪ��x�s���b��M�K�X (*�s���w�L���ɮ� �令logins.json)
::xcopy "%BackDir%\signons.sqlite" %TempFolder%\ /y
::�S������]�w�Gpermissions.sqlite �� content-prefs.sqlite �o����ɮ��x�s�۳\�h Firefox ���v���]�w�]�Ҧp�A���\���Ǻ�����ܼu�X�����^�ΰ��ӧO�����]�m���Y���ҡC
xcopy "%BackDir%\permissions.sqlite" %TempFolder%\ /y
xcopy "%BackDir%\content-prefs.sqlite" %TempFolder%\ /y
::�j�M�����G�ɮ� search.json.mozlz4 �x�s�F Firefox �j�M�C�̩ҨϥΪ����j�M�����C
::xcopy "%BackDir%\search.sqlite" %TempFolder%\ /y
::xcopy "%BackDir%\search.json" %TempFolder%\ /y
::�ӤH�r��Gpersdict.dat �x�s�ۧA�[�J Firefox �r�媺�Ҧ��۩w�q��r�C
xcopy "%BackDir%\persdict.dat" %TempFolder%\ /y
::�۰ʧ����M��Gformhistory.sqlite �x�s�F�A�b�j�M�C�κ�������椤��J�L���r��C
xcopy "%BackDir%\formhistory.sqlite" %TempFolder%\ /y
::Cookie�GCookie �O�A�h�L�������s��b�A�q�������@�Ǹ�T�A�q�`�O�@��������������n�]�w�εn�J���A�C�Ҧ��� Cookie ���x�s�b cookies.sqlite �o���ɮסC
xcopy "%BackDir%\cookies.sqlite" %TempFolder%\ /y
::DOM �x�s�Ŷ��G DOM �x�s�Ŷ��]�p���ت��O���Ѥ@�ؤ� Cookie ��j�B��w���A�ӥB����ϥΪ���T�x�s���N��סC�����������T�s��b webappsstore.sqlite�A�� chromeappsstore.sqlite �h�s��U�� about:* �����C
xcopy "%BackDir%\webappsstore.sqlite" %TempFolder%\ /y
xcopy "%BackDir%\chromeappsstore.sqlite" %TempFolder%\ /y
::�w�����ҳ]�w�Gcert8.db �x�s�A�Ҧ����w�����ҳ]�w�ζפJ Firefox �� SSL ���ҡC  
xcopy "%BackDir%\cert8.db" %TempFolder%\ /y
::�w���˸m�]�w�Gsecmod.db �o���ɮ׬O�w���ʼҲո�Ʈw�C 
xcopy "%BackDir%\secmod.db" %TempFolder%\ /y
::�U���ʧ@�GmimeTypes.rdf �x�s�A��� Firefox ���p��B�z�S�w�榡�ɮת����n�]�w�A�Ҧp�A�I�� PDF �ɮɡA�����H Acrobat Reader �}�ҥ��C
xcopy "%BackDir%\mimeTypes.rdf " %TempFolder%\ /y
::�~���{�� MIME �����Gpluginreg.dat �x�s����A�Ҧw�˥~���{���� ���ں����C�髬���C
xcopy "%BackDir%\pluginreg.dat" %TempFolder%\ /y
::�s�����A�Gsessionstore.js �|�x�s�ثe�}�Ҥ��������M�����C
::xcopy "%BackDir%\sessionstore.js" %TempFolder%\ /y
::�ۭq�u��C�G xulstore.json�o���ɮ��x�s�F�u��C�ε����j�p�P��m���]�w�ȡC
xcopy "%BackDir%\xulstore.json" %TempFolder%\ /y
::�O�ФF�u��C���s�����ǻP��m (*�s���w�L���ɮ� �������xulstore.json)
::xcopy "%BackDir%\localstore.rdf" %TempFolder%\ /y
::�ӤH���n�]�w�Gprefs.js �x�s�F�ϥΪ̦ۭq�����n�]�w�A�Ҧp�A�b Firefox �ﶵ ��ܤ�����ק諸�]�w�C�t�@�D���n�������ɮ׬O user.js�A�p�G�����ܡA�̭����]�w�|�u�����N����ק�L�����n�]�w�C  
xcopy "%BackDir%\prefs.js" %TempFolder%\ /y
xcopy "%BackDir%\user.js" %TempFolder%\ /y
::Stylish���˦��ƾ�
xcopy "%BackDir%\stylish.sqlite" %TempFolder%\ /y
::foxyproxy���N�z�]�w
::xcopy "%BackDir%\foxyproxy.xml" %TempFolder%\ /y

::�ݭn�R������
::del %TempFolder%\chrome\UserScriptLoader\require\  /s /q
::del %TempFolder%\extensions\inspector@mozilla.org\chrome\inspector\locale\de\  /s /q
::del %TempFolder%\extensions\inspector@mozilla.org\chrome\inspector\locale\en-GB\  /s /q
::del %TempFolder%\extensions\inspector@mozilla.org\chrome\inspector\locale\pl\  /s /q
::del %TempFolder%\extensions\inspector@mozilla.org\chrome\inspector\locale\ru\  /s /q
::del %TempFolder%\extensions\inspector@mozilla.org\chrome\inspector\locale\sk\  /s /q
::del %TempFolder%\extensions\support@lastpass.com\platform\Darwin\  /s /q
::del %TempFolder%\extensions\support@lastpass.com\platform\Darwin_x86_64-gcc3\  /s /q
::del %TempFolder%\extensions\support@lastpass.com\platform\Linux_x86_64-gcc3\  /s /q
::del %TempFolder%\extensions\support@lastpass.com\platform\Linux_x86-gcc3\  /s /q

::Ū���������M����ήɶ�
::�q��B�z�Ҧb��m��Firefox�{�Ǹ�Ƨ��]firefox�^�A�@��F4�h
for /f "usebackq eol=; tokens=1,2 delims==" %%i in ("..\..\..\..\Firefox\application.ini")do (if %%i==Version set ver=%%j)

::�]�m�ƥ��ɮ׸��|�H���ɮצW��
::�������M�ɶ�
set tm1=%time:~0,2%
set tm2=%time:~3,2%
set tm3=%time:~6,2%
set tm4=%time:~0,8%
set da1=%date:~0,4%
set da2=%date:~5,2%
set da3=%date:~8,2%
set ArchiveName=D:\FirefoxBackup\Profiles_Firefox_%ver%_%da1%�~%da2%��%da3%��[%tm1%�I%tm2%��%tm3%��].7z
::�p�ɼƤp��10�I�ɪ��ץ�
set /a tm1=%time:~0,2%*1
if %tm1% LSS 10 set tm1=0%tm1%
set ArchiveName=D:\FirefoxBackup\Profiles_Firefox_%ver%_%da1%�~%da2%��%da3%��[%tm1%�I%tm2%��%tm3%��].7z

rem �}�l�ƥ�
7z.exe u -up1q3r2x2y2z2w2 %ArchiveName% "%TempFolder%"
@echo �ƥ������I�çR���{�ɤ��
rd "%TempFolder%" /s/q

ECHO.&ECHO.Firefox�]�m�w���]�����A�Ы����N�� ����Firefox �ðh�XCMD�I&PAUSE >NUL 2>NUL

@echo �Ұ��s����
::"..\..\..\..\Firefox\firefox.exe" pcxFirefox�K����|
::"..\..\..\..\MyFirefox.exe" MyFirefox�K����|
start "Mozilla Firefox" "..\..\..\..\MyFirefox.exe"
::����4������CMD
::ping -n 4 127.0.0.1>nul