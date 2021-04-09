/**
   Configuration for the testp server running in a small constellation
   with only a6, e6, x6, s3 (for old jobs) and s6.
*/
function (CodeGradX, state) {
    state.servers = {
        // The domain to be suffixed to short hostnames:
        domain: '.codegradx.org',
        // the shortnames of the four kinds of servers:
        names: ['a', 'e', 'x', 's'],
        // default protocol:
        protocol: 'https',
        // Descriptions of the A servers:
        a: {
            // Use that URI to check whether the server is available or not:
            suffix: '/alive',
            protocol: 'https',
            // Description of plausible A servers:
            0: {
                // a full hostname supersedes the default FQDN:
                host: 'a6.codegradx.org',
                enabled: false
            }
        },
        e: {
            suffix: '/alive',
            protocol: 'https',
            0: {
                host: 'e6.codegradx.org',
                enabled: false
            }
        },
        x: {
            suffix: '/dbalive',
            protocol: 'https',
            0: {
                host: 'x6.codegradx.org',
                enabled: false
            }
        },
        s: {
            suffix: '/index.txt',
            protocol: 'https',
            0: { // the real s3:
                host: 's3.codegradx.org',
                enabled: false
            },
            1: { // the real s6:
                host: 's6.codegradx.org',
                enabled: false
            },
            2: { // the fake s9:
                host: 's9.codegradx.org',
                enabled: false
            },
            3: { // the real s0
                host: 's0.codegradx.org',
                enabled: false
            }
        }
    };
}
