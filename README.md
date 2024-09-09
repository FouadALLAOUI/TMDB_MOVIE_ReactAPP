## The workflow action file :

~~~bash
name : "Name of the pipeline"

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main
  workflow_dispatch:
jobs:
  deployment:
    runs-on: ubuntu-latest
    environment: production
    steps:
      
      - name: Checkout
        uses: actions/checkout@v4
      - name: <start the pipelining>  
~~~
 

## Run Locally  
Clone the project  

~~~bash  
  az ad sp create-for-rbac \
    --name "ghActionAzureVote" \
    --scope /subscriptions/<SUBSCRIPTION_ID>/resourceGroups/<RESOURCE_GROUP> \
    --role Contributor \
    --json-auth
~~~

Copy the Outpuy

~~~bash  
  {
  "clientId": <clientId>,
  "clientSecret": <clientSecret>,
  "subscriptionId": <subscriptionId>,
  "tenantId": <tenantId>,
  ...
  }
~~~

### Add the output in secrets as azure credentiales 

Create an Azure App Service plan :
~~~bash  
az appservice plan create \
   --resource-group MY_RESOURCE_GROUP \
   --name MY_APP_SERVICE_PLAN \
   --is-linux
~~~

Create a web app :

~~~bash  
az webapp create \
    --name MY_WEBAPP_NAME \
    --plan MY_APP_SERVICE_PLAN \
    --resource-group MY_RESOURCE_GROUP \
    --runtime "NODE|14-lts"
~~~  

Exemple for the build Job: 

~~~bash
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4

    - name: Set up Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'

    - name: npm install, build, and test
      run: |
        npm install
        npm run build --if-present
        npm run test --if-present
    - name: Upload artifact for deployment job
      uses: actions/upload-artifact@v4
      with:
        name: node-app
        path: .
~~~

The Job of deployment to Azure App Service should not be hardcoded (Use secrets & environments variables) :

~~~bash
  deploy:
    runs-on: ubuntu-latest
    needs: build
    environment:
      name: 'production'
      url: ${{ steps.deploy-to-webapp.outputs.webapp-url }}

    steps:
    - name: Download artifact from build job
      uses: actions/download-artifact@v4
      with:
        name: node-app

    - name: 'Deploy to Azure WebApp'
      id: deploy-to-webapp
      uses: azure/webapps-deploy@85270a1854658d167ab239bce43949edb336fa7c
      with:
        app-name: ${{ env.AZURE_WEBAPP_NAME }}
        publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
        package: ${{ env.AZURE_WEBAPP_PACKAGE_PATH }}
~~~

### To deploy it into AKS

~~~bash
    - name: Azure Login
      uses: azure/login@14a755a4e2fd6dff25794233def4f2cf3f866955
      with:
        creds: ${{ secrets.AZURE_CREDENTIALS }}

    - name: Build image on ACR
      uses: azure/CLI@61bb69d64d613b52663984bf12d6bac8fd7b3cc8
      with:
        azcliversion: 2.29.1
        inlineScript: |
          az configure --defaults acr=${{ env.AZURE_CONTAINER_REGISTRY }}
          az acr build -t  -t ${{ env.REGISTRY_URL }}/${{ env.PROJECT_NAME }}:${{ github.sha }}

    - name: Gets K8s context
      uses: azure/aks-set-context@94ccc775c1997a3fcfbfbce3c459fec87e0ab188
      with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}
          resource-group: ${{ env.RESOURCE_GROUP }}
          cluster-name: ${{ env.CLUSTER_NAME }}
      id: login

    - name: Configure deployment
      uses: azure/k8s-bake@61041e8c2f75c1f01186c8f05fb8b24e1fc507d8
      with:
        renderEngine: 'helm'
        helmChart: ${{ env.CHART_PATH }}
        overrideFiles: ${{ env.CHART_OVERRIDE_PATH }}
        overrides: |
          replicas:2
        helm-version: 'latest'
      id: bake

    - name: Deploys application
      uses: Azure/k8s-deploy@dd4bbd13a5abd2fc9ca8bdcb8aee152bb718fa78
      with:
        manifests: ${{ steps.bake.outputs.manifestsBundle }}
        images: |
          ${{ env.AZURE_CONTAINER_REGISTRY }}.azurecr.io/${{ env.PROJECT_NAME }}:${{ github.sha }}
        imagepullsecrets: |
          ${{ env.PROJECT_NAME }}
~~~
