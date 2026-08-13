pipelineJob('appbtp-mobile') {
    displayName('AppBTP Mobile CI/CD')
    description('Pipeline for building the AppBTP mobile app')
    
    definition {
        cps {
            script(readFileFromWorkspace('Jenkinsfile.mobile'))
            sandbox(true)
        }
    }
    
    triggers {
        pollSCM('H/5 * * * *')
    }
}
