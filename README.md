# k-scratch-node
kscratch allows you to get, edit and immediately send back changes to Azure Functions for fast prototyping. This is a port of k-scratch from .NET Core. 

```
npm install -g jakkaj/k-scratch-node
```

It's still under dev - like heaps of dev :)

At this stage just the -l (log stream output to local console) has been implemented. 

![ksnodefirst](https://cloud.githubusercontent.com/assets/5225782/25368876/39ed6d4a-29c3-11e7-98e8-e0d059a94967.gif)


Grab a publish profile from Azure. Click on your funcion's top level menu item and select "Download publish profile". 

![dlpub](https://cloud.githubusercontent.com/assets/5225782/25368896/5f4f137c-29c3-11e7-9add-01b14554765a.PNG)

Copy the publish profile in to a new empty folder. The publish profile can be in an folder up the path, but it's easiest to pop it in the root of your new editing spot. 

