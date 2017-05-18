interface publishProfile{
    profileName : string;
    publishMethod : string; 
    publishUrl : string;
    msdeploySite : string;
    userName : string;
    userPWD: string;
    destinationAppUrl: string;
}

interface publishSettings{
    publishProfile: publishProfile[]
}

let publishMethods = {
    msDeploy : "MSDeploy"
}

export {publishSettings, publishProfile, publishMethods};