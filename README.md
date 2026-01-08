# CI/CD + Datadog Demo (Jenkins)

This repo gives you a ready-to-demo Jenkins pipeline plus Datadog event hooks so you can show end-to-end CI visibility quickly.

## Quick start (local Jenkins)

1) Prereqs: Docker or Docker Desktop, and a Datadog API key.  
2) Start Jenkins locally:
```
docker compose up -d
```
3) Grab the initial admin password:
```
docker exec -it jenkins-demo cat /var/jenkins_home/secrets/initialAdminPassword
```
4) Login at http://localhost:8080, finish the wizard, and install the **Pipeline** and **Git** plugins if prompted.
5) Install Node inside the Jenkins container (needed for the sample app):
```
docker exec -u 0 -it jenkins-demo bash -lc "apt-get update && apt-get install -y nodejs npm"
```

## Datadog setup (fastest path)

- In Jenkins, create a **Secret text** credential with ID `datadog-api-key` containing your Datadog API key.  
- If your site is not US1, edit `DD_SITE` in `Jenkinsfile` (`datadoghq.eu`, `us3.datadoghq.com`, etc).  
- (Optional, but nice) Install the **Datadog** Jenkins plugin for build metrics/logs, and point it at your API key + site under *Manage Jenkins → Configure System → Datadog Plugin*.

## Create the demo pipeline job

1) New Item → **Pipeline** → name it `cicd-demo`.  
2) Under **Pipeline** choose “Pipeline script from SCM”, select **Git**, and set the repo URL for this project.  
3) Save, then **Build Now**.

The pipeline stages are intentionally short so you can demo quickly:
- Prep (checkout, announce to Datadog, `npm ci`)  
- Lint (`npm run lint` with ESLint)  
- Unit Tests (`npm test` with Jest)  
- Build (`npm run build` writes `build/artifact.txt`)  
- Package Artifact (`npm run package` tars the build output)  
- Security Scan (`npm run security` uses `npm audit --audit-level=high`)  
- Deploy (simulated; lists build artifacts)

Artifacts land in `build/artifact.txt` so you can show archiving.

## What goes to Datadog

- `Jenkinsfile` posts an event at start, on success, and on failure (`pipeline:jenkins-demo`, `job:<job>`, `build:<num>`, `branch:<branch>`, `env:demo`).  
- You can visualize these under **Events Explorer** and build a quick dashboard widget (event stream or timeseries of counts).  
- If you install the Datadog Jenkins plugin, you also get build duration metrics and optional log forwarding without extra code.

## Optional extras to demo

- Turn `echo` steps into real commands (e.g., `npm ci`, `npm test`, `npm run build`, `snyk test`, `kubectl apply`).  
- Add `DD_ENV`, `DD_SERVICE`, `DD_VERSION` environment vars in the pipeline to unify with APM/RUM names.  
- Trigger a failure (e.g., `exit 1` in the Security Scan stage) to show the error event in Datadog.  
- Build a Datadog dashboard with widgets:
  - Event stream filtered by `pipeline:jenkins-demo`  
  - Top jobs by count/duration (Datadog Jenkins plugin metrics)  
  - Monitor: alert on failed builds `status:error pipeline:jenkins-demo`

## Troubleshooting

- Events missing? Verify `DD_API_KEY` credential ID matches `datadog-api-key`, and that outbound HTTPS to `https://api.<site>` works.  
- Using EU or another site? Update `DD_SITE` in `Jenkinsfile`.  
- Jenkins not starting? Ensure ports 8080/50000 are free or change the mapping in `docker-compose.yml`.

