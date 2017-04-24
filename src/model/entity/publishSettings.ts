interface publishProfile{
    profileName : string;
    publishMethod : string; 
    publishUrl : string;
    msdeploySite : string;
    userName : string;
    userPWD: string;
}

interface publishSettings{
    publishProfile: publishProfile[]
}

export {publishSettings, publishProfile};