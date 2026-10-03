targetScope = 'subscription'

@minLength(1)
@maxLength(64)
@description('Name of the environment (used to name all resources), e.g. "interview-prep-dev".')
param environmentName string

@minLength(1)
@description('Azure region for all resources.')
param location string

@description('App Service plan SKU. B1 is the cheapest tier that supports Always On and health checks.')
@allowed(['B1', 'B2', 'S1', 'P0v3', 'P1v3'])
param appServiceSkuName string = 'B1'

var tags = { 'azd-env-name': environmentName }

resource rg 'Microsoft.Resources/resourceGroups@2024-03-01' = {
  name: 'rg-${environmentName}'
  location: location
  tags: tags
}

module resources 'resources.bicep' = {
  name: 'resources'
  scope: rg
  params: {
    environmentName: environmentName
    location: location
    tags: tags
    appServiceSkuName: appServiceSkuName
  }
}

output AZURE_RESOURCE_GROUP string = rg.name
output AZURE_WEBAPP_NAME string = resources.outputs.webAppName
output WEB_URI string = resources.outputs.webAppUri
