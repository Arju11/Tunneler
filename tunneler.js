let currentHostIP = process.argv[2];
let currentPorts = process.argv[3].split(";");
currentPorts.forEach(function (currentPort) {
    let config = {
        username: process.argv[4],
        password: process.argv[5],
        host: currentHostIP,
        port: 22,
        dstHost: currentHostIP,
        dstPort: currentPort,
        localHost: '127.0.0.1',
        localPort: currentPort,
        keepaliveInterval: 2000,
        readyTimeout: 5000
    };
    let tunnel = require('tunnel-ssh');
    let tunnelServer = tunnel(config, function (error, server) {
    });
    process.on('uncaughtException' || 'exit' || 'SIGTERM', function () {
        tunnelServer.close();
    });
});