pipelineJob('appbtp-backend') {
    displayName('AppBTP Backend CI/CD')
    description('Pipeline for building, testing, and deploying the AppBTP backend')
    
    definition {
        cps {
            script(readFileFromWorkspace('Jenkinsfile.backend'))
            sandbox(true)
        }
    }
    
    triggers {
        pollSCM('H/5 * * * *')
    }
}
