function localConfig(data)
{

    data.visOptions.method = 'classic';
    data.visOptions.thumbOptions.thumbSize = 88;
    data.visOptions.thumbOptions.navMode = "feedback";
    //data.visOptions.thumbOptions.navModes = ["feedback","browse"];
    data.visOptions.thumbOptions.navModes = ["feedback"];
    data.visOptions.thumbOptions.iconArrange = "grid";
    data.visOptions.thumbOptions.thumbRenderer = "default" ;

    data.visOptions.filterBar.modalities =  {
        "image": {
            label: "Images"
        }, 
        "3d": {
            label: "3D models"
        }, 
        "audio": {
            label: "Audio"
        }, 
        "video": {
            label: "Video"
        }
    }	;

    // vcl.iti.gr
    data.fileUploadServer = 	"http://vcl.iti.gr/is/isearch/server/scripts/upload.php";
    data.queryFormulatorUrl = 	"http://vcl.iti.gr/is/isearch/server/scripts/mqf.php?index=vcl";
    data.userProfileServerUrl = "http://vcl.iti.gr/is/isearch/server/scripts/user.php?mode=Profile&key=";
    data.userLoginServerUrl = 	"http://vcl.iti.gr/is/isearch/server/scripts/user.php?mode=login";
    data.userLogoutServerUrl = 	"http://vcl.iti.gr/is/isearch/server/scripts/user.php?mode=logout";
    data.userRegisterServerUrl ="http://vcl.iti.gr/is/isearch/server/scripts/register.php";
    data.tagServerUrl =         "http://vcl.iti.gr/is/isearch/server/scripts/user.php?mode=tags&index=uc6";
        
    data.useOldAuthentication = true;
}
