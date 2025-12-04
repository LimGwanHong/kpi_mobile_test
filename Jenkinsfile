pipeline {

    agent any

    

    // Node.js 버전 설정

    tools {

        nodejs 'NodeJS-18'  // Jenkins에서 설정한 NodeJS 도구 이름

    }

    

    // 빌드 파라미터 (수동 빌드 시 선택)

    parameters {

        choice(

            name: 'DEPLOY_ENV',

            choices: ['dev', 'prd'],

            description: '배포 환경을 선택하세요'

        )

        booleanParam(

            name: 'DEPLOY_ENABLED',

            defaultValue: false,

            description: '빌드 후 배포를 실행하시겠습니까?'

        )

    }

    

    environment {

        // 배포 경로 설정

        DEV_DEPLOY_PATH = '/application/ehub_mobile-kpi/dev'

        PRD_DEPLOY_PATH = '/application/ehub_mobile-kpi/dist'

        

        // SSH 서버 정보 (Jenkins Credentials에 등록)

        DEV_SERVER = 'dev.eland.neos.ai.kr'

        PRD_SERVER = 'eland.neos.ai.kr'

        SSH_CREDENTIALS_ID = 'ec2-ssh-key'

    }

    

    stages {

        // 1. 체크아웃

        stage('Checkout') {

            steps {

                echo "📥 소스 코드 체크아웃"

                checkout scm

            }

        }

        

        // 2. 의존성 설치

        stage('Install Dependencies') {

            steps {

                echo "📦 의존성 설치"

                sh 'node --version'

                sh 'npm --version'

                sh 'npm ci'

            }

        }

        

        // 3. 빌드

        stage('Build') {

            steps {

                script {

                    echo "🔨 빌드 시작: ${params.DEPLOY_ENV} 환경"

                    

                    if (params.DEPLOY_ENV == 'dev') {

                        sh 'npm run build:dev'

                    } else if (params.DEPLOY_ENV == 'prd') {

                        sh 'npm run build:prd'

                    }

                }

            }

        }

        

        // 4. 빌드 결과물 아카이브

        stage('Archive Artifacts') {

            steps {

                echo "📁 빌드 결과물 아카이브"

                archiveArtifacts artifacts: 'dist/**/*', fingerprint: true

            }

        }

        

        // 5. 배포 (선택적)

        stage('Deploy') {

            when {

                expression { params.DEPLOY_ENABLED == true }

            }

            steps {

                script {

                    def deployPath = ''

                    def server = ''

                    

                    if (params.DEPLOY_ENV == 'dev') {

                        deployPath = env.DEV_DEPLOY_PATH

                        server = env.DEV_SERVER

                    } else if (params.DEPLOY_ENV == 'prd') {

                        deployPath = env.PRD_DEPLOY_PATH

                        server = env.PRD_SERVER

                    }

                    

                    echo "🚀 배포 시작: ${server}:${deployPath}"

                    

                    // SSH를 통한 배포

                    sshagent([env.SSH_CREDENTIALS_ID]) {

                        // 기존 파일 백업

                        sh """

                            ssh -o StrictHostKeyChecking=no ec2-user@${server} '

                                if [ -d ${deployPath} ]; then

                                    cp -r ${deployPath} ${deployPath}_backup_\$(date +%Y%m%d_%H%M%S)

                                fi

                            '

                        """

                        

                        // 새 파일 배포

                        sh """

                            rsync -avz --delete dist/ ec2-user@${server}:${deployPath}/

                        """

                        

                        // Nginx 재시작

                        sh """

                            ssh -o StrictHostKeyChecking=no ec2-user@${server} '

                                sudo nginx -t && sudo systemctl reload nginx

                            '

                        """

                    }

                    

                    echo "✅ 배포 완료: ${server}"

                }

            }

        }

    }

    

    post {

        success {

            echo "✅ 파이프라인 성공!"

            echo "환경: ${params.DEPLOY_ENV}"

            echo "배포 여부: ${params.DEPLOY_ENABLED}"

        }

        failure {

            echo "❌ 파이프라인 실패!"

        }

        always {

            // 워크스페이스 정리 (선택적)

            cleanWs(cleanWhenNotBuilt: false,

                    deleteDirs: true,

                    disableDeferredWipeout: true,

                    notFailBuild: true)

        }

    }

}

