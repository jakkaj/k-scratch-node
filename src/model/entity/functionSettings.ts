interface functionSettings{
    name:string;
    function_app_id:any;
    script_root_path_href:string;
    script_href:string;
    config_href:string;
    secrets_file_href:string;
    href:string;
    config:config;
    files:any;
    test_data:string;   
}

interface config{
    disabled:boolean;
    scriptFile:string;
    entryPoint:string;
    bindings:Array<binding>;
}

interface binding{    
    authLevel:string;
    name:string;
    type:string; 
    direction:string; 
    path:string; 
    connection:string; 
    topicName:string; 
    subscriptionName:string; 
    accessRights:string;     
}

interface nameValuePair
{
    name:string;
    value:string;
}

interface testDataConfig
{
    availableMethods:Array<any>;
    queryStringParams:Array<nameValuePair>;
    headers:Array<nameValuePair>;
    method:string;
    body:string;
}

export{functionSettings, config, binding, nameValuePair, testDataConfig};