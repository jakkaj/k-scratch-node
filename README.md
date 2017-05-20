# k-scratch
K-Scratch allows you to get, edit and immediately send back changes to Azure Functions for fast prototyping. 

```
npm install -g k-scratch
```

It's still under dev - please raise issues!


    -h, --help                 output usage information
    -V, --version              output the version number
    -l, --log                  Output the Kudulog stream to the console
    -p, --path [functionPath]  The base path of your function (blank for current path)
    -m, --monitor              Monitor the path for changes and send them up
    -g, --get                  Download the Function app ready for editing locally. Works with the -f sub folder option
    -u, --upload               Upload a folder to the server. Works with the -f sub folder option
    -f, --folder [folder]      Sub folder to get or upload. If omitted it will get or send everything under wwwroot from Kudu
    -s, --scm                  Open the Kudu Scm Site
    -k, --key [key]            Function key for use when calling test endpoints
    -d, --diagram [path]       Create a diagram of the function and save it to the file parameter


<img src="https://cloud.githubusercontent.com/assets/5225782/25368876/39ed6d4a-29c3-11e7-98e8-e0d059a94967.gif" width="720"/>

Grab a publish profile from Azure. Click on your Functions top level menu item and select "Download publish profile". 

<img src="https://cloud.githubusercontent.com/assets/5225782/25368896/5f4f137c-29c3-11e7-9add-01b14554765a.PNG" width="720"/>

Copy the publish profile in to a new empty folder. The publish profile can be in any folder up the path, but it's easiest to pop it in the root of your new editing spot then work in a ./src style path. 

    somefunc.publishsettings
        src\host.json
        src\somefuc\run.csx
        etc...

You can run ```ks``` by changing to the folder where your publish settings are are located (or any child) or you can use the -p option to set a path (absolute or relative).

```ks -l -p ~/dev/something```

### Logging
Output the log stream to your local console. 

```ks -l```

### Monitor Files
Monitor and upload files as you edit them
```ks -m```

This works well with the ```-l``` option so you can monitor and see the output. 

### Download Files
Copy your function files to you local path.

 ```ks -g```

### Upload Files

Upload your entire function set of folders to the server.

 ```ks -u```

### Limit to Sub Folder

You can operate on a sub folder by using ```ks -u -f somefunc```. This works with ```-g``` too. 

### Graphing

You can create a [funcgraph](https://github.com/jakkaj/funcgraph) graph - ```ks -d pathToSvgOutput.svg```


<img src="https://cloud.githubusercontent.com/assets/5225782/24825002/35c2318c-1c59-11e7-9c9c-155ce0e14267.png" width="520"/>

### Open Kudu

You can open the Kudu Scm site

```ks -s```

### Compatability

It seems to work around the place... if you have troubles please [create an issue](https://github.com/jakkaj/k-scratch-node/issues)!

### Remote Testing

k-scratch can run your Functions remotely - so you don't have to go in to the portal every time to execute them. 

First, you'll need the master key from the [portal](https://portal.azure.com).

<img src="https://cloud.githubusercontent.com/assets/5225782/26271623/b89d5600-3d4b-11e7-9f0f-cb18f2c73de1.PNG" width="720"/>

Click on your function main node, navigate to "Settings" and copy the master key. 

You now need to pass this in using the ```-k [key]``` option.

It's hand to have the log stream on too!

```ks -l -k <yourKey>```

<img src="https://cloud.githubusercontent.com/assets/5225782/26271681/75ad4d7c-3d4c-11e7-8f05-b7cc0d2ae6e1.gif" width="720"/>
 
Testing will automatically send in the test data that you enter in the portal test run area. It works with HttpTrigger and other string based triggers. I've not had any luck with file based triggers. 

The output from the trigger is shown in your console. 




