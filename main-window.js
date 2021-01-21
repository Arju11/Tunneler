const fs = require('fs');
const tunnelProcesseGenerator = require('child_process');
var hostsDetails = new Set();
var allHostTunnelProcesses = [];
function loadHosts() {
    document.getElementById("host-list-id").innerHTML = '';
    fs.readdir(`${__dirname}/host-files/`, function (err1, filenames) {
        if (err1) {
            throw err1;
        }
        filenames.forEach(function (filename) {
            let host = document.createElement("li");
            fs.readFile(`${__dirname}/host-files/` + filename, 'utf-8', function (err2, content) {
                if (err2) {
                    throw err2;
                }
                const data = JSON.parse(content);
                hostsDetails.add(data);
                var hostP = document.createElement("p");
                hostP.appendChild(document.createTextNode(data.hostIp));
                host.appendChild(hostP);

                var hostdiv = document.createElement("div");
                hostdiv.className = "host-div"

                var hostPortsInput = document.createElement("input");
                hostPortsInput.type = "text";
                hostPortsInput.placeholder = "PORT1;PORT2;PORT3;...";
                hostPortsInput.id = "ports-" + data.hostIp;
                hostdiv.appendChild(hostPortsInput);

                var hostTunnelButton = document.createElement("input");
                hostTunnelButton.type = "button";
                hostTunnelButton.className = "tunnel-button";
                hostTunnelButton.value = "TUNNEL";
                hostTunnelButton.id = "tunnel-button-id-" + data.hostIp;

                hostTunnelButton.addEventListener("click", executeTunneling);
                hostdiv.appendChild(hostTunnelButton);

                var hostStopTunnelButton = document.createElement("input");
                hostStopTunnelButton.type = "button";
                hostStopTunnelButton.className = "tunnel-button";
                hostStopTunnelButton.value = "STOP";
                hostStopTunnelButton.id = "stop-tunnel-button-id-" + data.hostIp;

                hostStopTunnelButton.addEventListener("click", function() {
                    let currentHostIP = this.id.substring(22);
                    allHostTunnelProcesses.forEach(function (hostTunnelProcesses) {
                        if(hostTunnelProcesses.hostIp.localeCompare(currentHostIP) == 0) {
                            hostTunnelProcesses.tunnelProcesses.forEach(function(tunnelProcess) {
                                tunnelProcess.kill('SIGTERM');
                            });
                        }
                    });
                    document.getElementById("tunnel-button-id-" + currentHostIP).disabled = false;
                    document.getElementById("tunnel-button-id-" + currentHostIP).style.background = "#ffffff";
                    document.getElementById(this.id).style.background = "#777676";
                    document.getElementById(this.id).disabled = true;
                });
                hostStopTunnelButton.disabled = true;
                hostStopTunnelButton.style.background = "#777676";
                hostdiv.appendChild(hostStopTunnelButton);

                host.appendChild(hostdiv);
                document.getElementById("host-list-id").appendChild(host);
                document.getElementById("host-list-id").appendChild(document.createElement("br"));
            });
        });
    });
}

function openAddHostForm() {
    document.getElementById("main-window-id").style.filter = "blur(10px)";
    document.getElementById("host-list-id").style.filter = "blur(10px)";
    document.getElementById("add-host-form-popup-id").style.display = "block";
}

function closeAddHostForm() {
    document.getElementById("main-window-id").style.filter = "blur(0px)";
    document.getElementById("host-list-id").style.filter = "blur(0px)";
    document.getElementById("add-host-form-popup-id").style.display = "none";
}

function saveAddHostForm() {
    document.getElementById("main-window-id").style.filter = "blur(0px)";
    document.getElementById("host-list-id").style.filter = "blur(0px)";
    let hostDetails = {
        "hostIp": document.getElementById('host-ip').value,
        "userName": document.getElementById('user-name').value,
        "password": document.getElementById('password').value,
    };

    fs.writeFile(`${__dirname}/host-files/` + hostDetails.hostIp + `.json`, JSON.stringify(hostDetails), (err) => {
        if (err) throw err;
    });

    document.getElementById("add-host-form-popup-id").style.display = "none";
}

function openDeleteHostsForm() {//TODO
    fs.readdir(`${__dirname}/host-files/`, function (err1, filenames) {
        if (err1) {
            throw err1;
        }
    });
}

function executeTunneling() {
    document.getElementById(String(this.id)).disabled = true;
    document.getElementById(String(this.id)).style.background = "#777676";
    let currentHostIP = String(this.id).substring(17);
    document.getElementById("stop-tunnel-button-id-" + currentHostIP).disabled = false;
    document.getElementById("stop-tunnel-button-id-" + currentHostIP).style.background = "#ffffff";
    let currentTunnelProcesses = [];
    hostsDetails.forEach(function (currentHostDetails) {
        if (currentHostIP.localeCompare(String(currentHostDetails.hostIp)) == 0) {
            let currentPorts = String(document.getElementById("ports-" + currentHostIP).value).split(",");
            let tunnelProcess = tunnelProcesseGenerator.fork(`${__dirname}/tunneler.js`,[
                currentHostIP,
                String(currentPorts),
                String(currentHostDetails.userName),
                String(currentHostDetails.password)
            ]);
            tunnelProcess.on("error" || "disconnect" || "close", function(){
                document.getElementById(String(this.id)).disabled = false;
                document.getElementById("stop-tunnel-button-id-" + String(this.id)).disabled = true;
            });
            currentTunnelProcesses.push(tunnelProcess);
        }
    });
    allHostTunnelProcesses.push({
        hostIp: currentHostIP,
        tunnelProcesses: currentTunnelProcesses
    })
}

function shutdownProcesses() {
    allHostTunnelProcesses.forEach(function (hostTunnelProcesses) {
        hostTunnelProcesses.tunnelProcesses.forEach(function(tunnelProcess) {
            tunnelProcess.kill('SIGTERM');
        });
    });
}