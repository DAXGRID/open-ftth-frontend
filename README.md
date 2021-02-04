# OPEN-FTTH Frontend

The frontend for the OPEN-FTTH system.

## Development

The easiest way to start the developmen process is by using a local Kubernetes instance using [Minikube](https://github.com/kubernetes/minikube) and setup the [OPEN-FTTH Chart](https://github.com/DAXGRID/open-ftth-chart) using Helm.

When the cluster is fully setup then run the following script in this repo. The script will set the correct settings for the application so you can get started development.

```sh
./scripts/set-env-file-minikube.sh
```

### Requirements

* [NPM](https://www.npmjs.com/)
* [NodeJS](https://nodejs.org/en/)

### Running

``` sh
npm start
```

### Build

``` sh
npm run build
```
