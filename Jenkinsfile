// Jenkinsfile — multibranch pipeline for arcana-vue
// Adapted from legacy vue-app-pipeline XML config.
//
// Key differences from the legacy XML-embedded script:
//   * `checkout scm` (no hardcoded branch=main)        — supports every branch + every PR
//   * `pollSCM` trigger removed                        — Jenkins multibranch + GitHub webhook drive triggers
//   * `dir("${env.PROJECTS_DIR}/arcana-vue")` blocks REMOVED — multibranch uses workspace root
//   * "Push to Registry" + "Arch Qube Metrics" gated   — only main pushes to registry; PR builds stay local
//   * SonarQube gets pullrequest.* params on PRs       — PR-decoration in Sonar UI

pipeline {
    agent any

    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '20', artifactNumToKeepStr: '1'))
        disableConcurrentBuilds()
        timestamps()
    }

    environment {
        APP_NAME  = "vue-app"
        REGISTRY  = "localhost:5000"
        IMAGE_TAG = "${REGISTRY}/arcana/${APP_NAME}"
        VERSION   = "1.0.0"
    }

    stages {
        stage("Checkout") {
            steps {
                checkout scm
                sh 'git log -1 --oneline'
                script {
                    echo "Branch: ${env.BRANCH_NAME ?: 'unknown'}"
                    echo "PR: ${env.CHANGE_ID ?: 'no'} (target: ${env.CHANGE_TARGET ?: 'n/a'})"
                }
            }
        }

        stage("Cleanup Old Images") {
            steps {
                sh '''
                    # keep only the previous build image (layer cache); the
                    # registry holds every build-N tag durably
                    docker images --format '{{.Repository}}:{{.Tag}}' \
                        | grep -E "^${IMAGE_TAG}:build-[0-9]+$" \
                        | sed 's/.*:build-//' | sort -rn | tail -n +2 \
                        | sed "s|^|${IMAGE_TAG}:build-|" \
                        | xargs -r docker rmi 2>/dev/null || true
                    # Stop leftover test containers
                    docker compose -f docker-compose.test.yml down \
                        --remove-orphans 2>/dev/null || true
                '''
            }
        }

        stage("Docker Compose Build") {
            steps {
                sh "VERSION=${VERSION} docker compose -f docker-compose.ci.yml build"
                sh "docker tag localhost:5000/arcana/${APP_NAME}:${VERSION} ${IMAGE_TAG}:build-${BUILD_NUMBER}"
            }
        }

        stage("Unit Tests") {
            steps {
                // Run in a NAMED (not --rm) container so coverage can be copied out
                // afterwards. Under DinD the compose bind mount resolves to a stray
                // host path the Jenkins workspace never sees, so the lcov report is
                // streamed back via `docker cp` instead — that lands it in the
                // workspace where the SonarQube scanner reads coverage/lcov.info.
                // The container exit code (vitest's) propagates so a test failure
                // fails this stage.
                sh '''
                    # Container name must be unique per concurrent build on the SHARED
                    # daemon. BUILD_NUMBER alone is per-branch in multibranch, so build #1
                    # of PR-25 / PR-24 / main all collide on "vue-app-test-1". Fold the
                    # (slash-sanitised) BRANCH_NAME in so the name is branch-unique too,
                    # mirroring the already-unique compose project namespace.
                    CNAME="vue-app-test-$(printf '%s' "${BRANCH_NAME}-${BUILD_NUMBER}" | tr -c 'a-zA-Z0-9_.-' '-')"
                    docker rm -f "${CNAME}" 2>/dev/null || true
                    docker compose -f docker-compose.test.yml run --name "${CNAME}" --build test
                    rc=$?
                    rm -rf coverage && mkdir -p coverage
                    docker cp "${CNAME}":/app/coverage/. coverage/ 2>/dev/null || true
                    docker rm -f "${CNAME}" 2>/dev/null || true
                    exit $rc
                '''
            }
        }

        stage("SonarQube Analysis") {
            steps {
                withSonarQubeEnv('SonarQube') {
                        // SonarQube Community Build rejects sonar.pullrequest.*
                        // (Developer Edition feature), so PR builds run a plain
                        // scan without GitHub PR decoration. Quality issues
                        // still surface — just not attached to the PR in the UI.
                        sh """sonar-scanner \
                          -Dsonar.projectKey=vue-app \
                          -Dsonar.projectName="Vue App" \
                          -Dsonar.sources=src \
                          -Dsonar.exclusions=node_modules/**,dist/** \
                          -Dsonar.scm.disabled=true \
                          -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info"""
                        // Community Build has no webhook waitForQualityGate(); poll the CE task
                        // named in report-task.txt, then read the quality-gate by analysisId.
                        sh '''
                            set -e
                            TOKEN="${SONAR_AUTH_TOKEN:-$SONAR_TOKEN}"
                            RT=.scannerwork/report-task.txt
                            [ -f "$RT" ] || { echo "report-task.txt missing"; exit 1; }
                            CE_TASK_ID=$(grep '^ceTaskId=' "$RT" | cut -d= -f2-)
                            ANALYSIS_ID=""
                            for i in $(seq 1 60); do
                                RESP=$(curl -s -u "$TOKEN:" "$SONAR_HOST_URL/api/ce/task?id=$CE_TASK_ID")
                                ST=$(echo "$RESP" | grep -o '"status":"[A-Z_]*"' | head -1 | cut -d'"' -f4)
                                echo "  CE status: ${ST:-?} (try $i)"
                                if [ "$ST" = "SUCCESS" ]; then ANALYSIS_ID=$(echo "$RESP" | grep -o '"analysisId":"[^"]*"' | head -1 | cut -d'"' -f4); break;
                                elif [ "$ST" = "FAILED" ] || [ "$ST" = "CANCELED" ]; then echo "CE $ST"; exit 1; fi
                                sleep 5
                            done
                            [ -n "$ANALYSIS_ID" ] || { echo "CE timeout"; exit 1; }
                            GATE=$(curl -s -u "$TOKEN:" "$SONAR_HOST_URL/api/qualitygates/project_status?analysisId=$ANALYSIS_ID")
                            GST=$(echo "$GATE" | grep -o '"status":"[A-Z]*"' | head -1 | cut -d'"' -f4)
                            echo "Quality gate: ${GST:-UNKNOWN}"
                            if [ "$GST" != "OK" ]; then echo "$GATE"; exit 1; fi
                        '''
                }
            }
        }

        stage("Architecture Qube") {
            steps {
                // Blocking architecture gate at --threshold 90. The old `-v $(pwd):/project`
                // bind mount is empty under DinD (the Jenkins workspace is a named volume the
                // host daemon sees at a different path), so arch-qube scanned nothing. Instead
                // create the container with anonymous volumes and stream the source in via
                // `tar | docker cp`, then copy the report out. `--ci` exits non-zero if < 90.
                sh '''
                    docker rm -f arcana-arch-qube-vue-${BUILD_NUMBER} 2>/dev/null || true
                    docker create --name arcana-arch-qube-vue-${BUILD_NUMBER} --network devops_default \
                        -v /src -v /output \
                        arcana.boo/arcana/arch-qube:latest \
                        scan /src --framework vue --no-ai --ci \
                        --format json,markdown -o /output --threshold 90 || exit 1
                    tar --exclude=./.git --exclude=./node_modules --exclude=./dist \
                        --exclude=./coverage --exclude=./arch-qube-reports -C . -cf - . \
                        | docker cp - arcana-arch-qube-vue-${BUILD_NUMBER}:/src || exit 1
                    docker start -a arcana-arch-qube-vue-${BUILD_NUMBER}
                    AQ_RC=$?
                    mkdir -p arch-qube-reports
                    docker cp arcana-arch-qube-vue-${BUILD_NUMBER}:/output/. arch-qube-reports/ 2>/dev/null || true
                    docker rm -f arcana-arch-qube-vue-${BUILD_NUMBER} 2>/dev/null || true
                    exit $AQ_RC
                '''
            }
        }

        stage("Image Info") {
            steps {
                sh "docker images --format 'table {{.Repository}}:{{.Tag}}\\t{{.Size}}' | grep ${APP_NAME} || true"
            }
        }

        stage("Strict Console Check") {
            // L2 strict gate — fail build on any forbidden transient/error pattern in console.
            // Patterns are infra-level signals we never want to treat as "green":
            // network drops, OOM, dead daemons, missing tags, missing CLIs, k8s timeouts.
            // Build-domain quality (test failures, sonar quality gate) is enforced by L1
            // (catchError UNSTABLE removal — stage exits propagate).
            steps {
                script {
                    def lines = currentBuild.rawBuild.getLog(20000)
                    def log = lines.join('\n')
                    def forbidden = [
                        'Broken pipe',
                        'Could not connect to Kotlin compile daemon',
                        'Using fallback strategy: Compile without Kotlin daemon',
                        'Remote host terminated the handshake',
                        'tag does not exist',
                        'docker: command not found',
                        'failed to extract layer',
                        'OutOfMemoryError',
                        'Connection refused',
                        'timed out waiting for the condition on pods',
                        'failed to copy: httpReadSeeker'
                    ]
                    def hits = forbidden.findAll { p -> log.contains(p) }
                    if (hits) {
                        error "STRICT CHECK FAIL — forbidden console patterns: ${hits.join(', ')}"
                    } else {
                        echo "STRICT CHECK PASS — no forbidden console patterns in ${lines.size()} log lines"
                    }
                }
            }
        }

        stage("Push to Registry") {
            // Only push from main branch builds. PR builds keep the image local
            // for tests but don't pollute the registry with PR tags.
            when { branch 'main' }
            steps {
                sh "docker push ${IMAGE_TAG}:${VERSION}"
                sh "docker push ${IMAGE_TAG}:build-${BUILD_NUMBER}"
            }
        }

        stage("Arch Qube Metrics") {
            // Metrics script writes to shared report dir, only run for main.
            when { branch 'main' }
            steps {
                catchError(buildResult: 'SUCCESS', stageResult: 'SUCCESS') {
                    sh "bash /data/projects/_scripts/arch-qube-metrics.sh \$(pwd) arcana-vue || true"
                }
            }
        }
    }

    post {
        success {
            echo "Pipeline SUCCESS - ${APP_NAME}:${VERSION} branch=${env.BRANCH_NAME ?: '?'} pr=${env.CHANGE_ID ?: 'no'}"
            sh '''
                # self-clean: keep only THIS build's image locally; previous
                # build-N tags stay pullable from the registry
                docker images --format '{{.Repository}}:{{.Tag}}' \
                    | grep -E "^${IMAGE_TAG}:build-[0-9]+$" \
                    | grep -v ":build-${BUILD_NUMBER}$" \
                    | xargs -r docker rmi 2>/dev/null || true
            '''
        }
        failure { echo "Pipeline FAILED - branch=${env.BRANCH_NAME ?: '?'} pr=${env.CHANGE_ID ?: 'no'}" }
        always  { echo "Build number ${BUILD_NUMBER} done" }
    }
}
