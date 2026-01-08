// Declarative Jenkins pipeline with Datadog event hooks for demo purposes.
// Requires a secret text credential named "datadog-api-key" containing your DD API key.

def sendDatadogEvent(String title, String text, String alertType = 'info') {
  if (!env.DD_API_KEY?.trim()) {
    echo "DD_API_KEY missing; skipping Datadog event '${title}'"
    return
  }
  // Send a lightweight event so you can visualize pipeline activity in Datadog.
  sh """
    curl -s -X POST \\
      -H "DD-API-KEY:${env.DD_API_KEY}" \\
      -H "Content-Type: application/json" \\
      -d '{
        "title": "${title}",
        "text": "${text}",
        "alert_type": "${alertType}",
        "tags": [
          "pipeline:jenkins-demo",
          "job:${env.JOB_NAME}",
          "build:${env.BUILD_NUMBER}",
          "branch:${env.GIT_BRANCH}",
          "env:${env.DD_ENV ?: "demo"}"
        ]
      }' \\
      "https://api.${env.DD_SITE ?: 'datadoghq.com'}/api/v1/events"
  """
}

pipeline {
  agent any
  environment {
    // Set DD_API_KEY via Jenkins credential "datadog-api-key".
    DD_API_KEY = credentials('datadog-api-key')
    DD_SITE = "datadoghq.com" // change to datadoghq.eu if needed
    DD_ENV = "demo"
  }
  options {
    timestamps()
    ansiColor('xterm')
  }
  stages {
    stage('Prep') {
      steps {
        script {
          sendDatadogEvent("CI pipeline started", "Build ${env.BUILD_URL} kicked off.")
        }
        checkout scm
        sh '''
          if ! command -v node >/dev/null 2>&1; then
            echo "Node.js is required. Install it in the Jenkins agent (see README)." >&2
            exit 1
          fi
          node -v
          npm -v
          npm ci --ignore-scripts --no-fund
        '''
      }
    }
    stage('Lint') {
      steps {
        sh 'npm run lint'
      }
    }
    stage('Unit Tests') {
      steps {
        sh 'npm test'
      }
    }
    stage('Build') {
      steps {
        sh 'npm run build'
      }
    }
    stage('Package Artifact') {
      steps {
        sh 'npm run package'
      }
    }
    stage('Security Scan') {
      steps {
        sh 'npm run security'
      }
    }
    stage('Deploy (Simulated)') {
      steps {
        sh '''
          echo "Deploying to staging (simulated)"
          ls -l build
        '''
      }
    }
  }
  post {
    success {
      script {
        sendDatadogEvent("CI pipeline succeeded", "Build ${env.BUILD_URL} finished successfully.", "success")
      }
      archiveArtifacts artifacts: 'build/**', fingerprint: true
    }
    failure {
      script {
        sendDatadogEvent("CI pipeline failed", "Build ${env.BUILD_URL} failed. Check Jenkins console.", "error")
      }
    }
    cleanup {
      deleteDir()
    }
  }
}

