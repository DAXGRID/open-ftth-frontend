#!/usr/bin/env bash

DESKTOP_BRIDGE_HOST=$(minikube ip)
DESKTOP_BRIDGE_PORT=$(kubectl describe service openftth-desktop-bridge -n openftth | grep NodePort -m 1 | grep -o '[0-9]\+')

API_GATEWAY_HOST=$(minikube ip)
API_GATEWAY_PORT=$(kubectl describe service openftth-api-gateway -n openftth | grep NodePort -m 1 | grep -o '[0-9]\+')

KEYCLOAK_HOST=$(minikube ip)
KEYCLOAK_PORT=$(kubectl describe service keycloak -n openftth | grep NodePort -m 1 | grep -o '[0-9]\+')

sed -i "s/window.config_API_GATEWAY_URI.*/window.config_API_GATEWAY_URI = \"$API_GATEWAY_HOST:$API_GATEWAY_PORT\";/" public/config-env.js
sed -i "s/window.config_DESKTOP_BRIDGE_URI.*/window.config_DESKTOP_BRIDGE_URI = \"$DESKTOP_BRIDGE_HOST:$DESKTOP_BRIDGE_PORT\";/" public/config-env.js
sed -i "s/window.config_KEYCLOAK_URI.*/window.config_KEYCLOAK_URI = \"http\:\/\/$KEYCLOAK_HOST:$KEYCLOAK_PORT\/auth\";/" public/config-env.js
