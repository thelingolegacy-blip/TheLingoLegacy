pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        timeout(time: 20, unit: 'MINUTES')
        skipDefaultCheckout(true)
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Toolchain preflight') {
            steps {
                sh '''
                    set -eu
                    command -v python3
                    command -v terraform
                    command -v ansible-playbook
                '''
            }
        }

        stage('YAML validation') {
            steps {
                sh '''
                    set -eu
                    python3 -m pip install --user --disable-pip-version-check yamllint==1.37.1
                    export PATH="$HOME/.local/bin:$PATH"
                    yamllint -s \
                      .github/workflows/devops-foundation-validation.yml \
                      .gitlab-ci.yml \
                      ansible/playbooks/read-only-diagnostics.yml
                '''
            }
        }

        stage('Terraform validation only') {
            steps {
                sh '''
                    set -eu
                    terraform -chdir=infrastructure/terraform fmt -check -recursive
                    terraform -chdir=infrastructure/terraform init -backend=false -input=false
                    terraform -chdir=infrastructure/terraform validate
                '''
            }
        }

        stage('Ansible syntax validation only') {
            steps {
                sh '''
                    set -eu
                    ansible-playbook --syntax-check -i localhost, ansible/playbooks/read-only-diagnostics.yml
                '''
            }
        }

        stage('Governance boundary') {
            steps {
                sh '''
                    set -eu
                    echo "INFRASTRUCTURE_APPLY=NOT_AUTHORIZED"
                    echo "ANSIBLE_MUTATION=NOT_AUTHORIZED"
                    echo "KUBERNETES_DEPLOYMENT=NOT_AUTHORIZED"
                    echo "PRODUCTION_DEPLOYMENT=NOT_AUTHORIZED"
                    echo "G02_ACCEPTANCE=NOT_EVALUATED"
                '''
            }
        }
    }

    post {
        always {
            echo 'This pipeline validates configuration only. It does not provision infrastructure or deploy workloads.'
        }
    }
}
