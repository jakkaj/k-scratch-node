# k-scratch
K-Scratch allows you to get, edit and immediately send back changes to Azure Functions for fast prototyping. 

**Warning:** This is a tool to aid in the development of Azure Functions - you shouldn't edit your production Functions in this way. 

**Note:** This is a command line tool - it's not meant to be used as a "require". If you want to access your Kudu Scm site through a nice node API, then you're looking for [kudu-api](https://www.npmjs.com/package/kudu-api) (which this project uses :)).

```
npm install -g k-scratch
```

It's still under dev - please raise issues! I'm active on this at the moment - updating lots, so make sure you check back for updates!


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

You can run ```ks``` by changing to the folder where your publish settings are are located (or any child) or you can use the ```-p``` option to set a path (absolute or relative).

It's a good idea to keep your publish settings up the path, outside of your repo so you don't accidentally check it in. 

```ks -l -p ~/dev/something```

### Logging
Output the log stream to your local console. 

```ks -l```

### Monitor Files
Monitor and upload files as soon as you save them.
```ks -m``` 

This works well with the ```-l``` option so you can monitor and see the output.

**Note for Windows Linux Bash:** If you're using Windows Subsystem for Linux you cannot get file monitoring events in Linux for files you edit in Windows (like editing in VS Code, but running k-scratch in Linux for example). You will have to run k-scratch in CMD or Powershell. 

### Download Files
Copy your function files to you local path.

 ```ks -g```

**Note:** Be careful not to overwrite your local changes with this command - it will not ask you before overwriting files that exist!

### Upload Files

Upload your entire function set of folders to the server.

 ```ks -u```

### Limit to Sub Folder

You can operate on a sub folder by using ```ks -u -f somefunc```. This works with ```-g``` too. 

### Graphing

You can create a [funcgraph](https://github.com/jakkaj/funcgraph) graph - ```ks -d pathToSvgOutput.svg```

**Note:** This graph is generated from your local copy of the Functions. Remember to use ```-g``` to get the latest version from the server first. But be careful not to overwrite!

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

```ks -l -k <yourKey>```

<img src="https://cloud.githubusercontent.com/assets/5225782/26271681/75ad4d7c-3d4c-11e7-8f05-b7cc0d2ae6e1.gif" width="720"/>

When the -k option with key is passed in, k-scratch will enumerate all your functions and assign them a number. 

All you have to do is enter the Function number [enter] and k-scratch will run that Function remotely in Azure - automatically passing in any test data you've entered in the Azure Portal Function testing area. 

It's handy to have the log stream (```-l```) on too! 

If you're testing with Blob tiggers, make sure the file really exists (and in the test thing put [container]/path/to/file.txt etc.)

The output from the trigger is shown in your console:

```
[Remote] -> 200
<what ever http returned output from your function if it's a http trigger>
<other outputs from your function if it uses log.Info (needs the -l logging option)>
``` 

### Support for compiled functions

It's super easy to work with pre-compiled functions too. This works in VS2017 as well!

- To set up a web project for usage with Azure Functions, follow along [here](https://blogs.msdn.microsoft.com/appserviceteam/2017/03/16/publishing-a-net-class-library-as-a-function-app/). I did the HttpTrigger sample. 
- Alternatively you can use the Azure Function Tools in Visual Studio 2017.3 and newer. See [this article](https://blogs.msdn.microsoft.com/webdev/2017/05/10/azure-function-tools-for-visual-studio-2017/).
- "Publish" your project to a folder target (in VS, right click web project, select publish and choose the folder option).
- Drop your publish profile in the root of the publish folder target (the folder up from where all the files actually went).
- The first time you do this you will need to upload all the files using the -u option (to upload stuff) with the -p option potining to the publish director (with all the published files in them).  
- Start monitoring using -m and pass in the publish folder (with the published files in them) to the -p option. 

Now you're ready to edit in Visual Studio / Code. When you want to send files to your live function, run the following build command from the command prompt or run the publish command in Visual Studio again. 

```
msbuild <your csproj>.csproj /p:DeployOnBuild=true /p:PublishProfile=<your profile>
```

### Azure Function tooling for Visual Studio 2017 

Visual Studio 2017.3 adds great [support for Azure Functions](https://blogs.msdn.microsoft.com/webdev/2017/05/10/azure-function-tools-for-visual-studio-2017/). k-scratch works really well with this - allowing you to rapidly work with live Functions in Azure. 

Create a new function and set up publishing to Azure, then perform the publish. 

You can then run ```ks -l -m``` from your ```bin\debug\net461``` folder or similar. Every time you build, the changes will be fired to the remote host. 

**Note:** You should use the built in Visual Studio publish to Azure option when even you add or remove a new function. K-scratch sort of gets it right, but I experienced some flakyness. 



### Compatibility with Git / Scm deployment

When you add Git based deployment to your Function, editing in the portal is blocked. Using k-scratch you can edit your function even when it's locked in this way but downloading and editing locally then sending the files back up via Kudu. 

When you check in, Kudu will re-deploy you changes from Git the same as usual. 

**Note:** Again - please don't using k-scratch on production Functions - it's a dev tool only. Sure - write production code with it, but you've been warned about editing in production!






