//# sourceMappingURL=file:///location/to/preload.js.map

// Packages
const pinger = require('minecraft-pinger')
const storage = require('electron-json-storage');
const os = require('os');
const process = require('process');
var child = require('child_process').execFile;
const exec = require('child_process').exec;
const path = require('path');
const fs = require('fs');
const { google } = require('googleapis');
var compute = google.compute('v1');
const { ipcRenderer, ipcMain } = require('electron')
const util = require('minecraft-server-util');
const BeeModParser = require('bee-mod-parser')
const authClient = process.env.GOOGLE_APPLICATION_CREDENTIALS
const axios = require('axios');
const { file } = require('googleapis/build/src/apis/file');
const { Client, Authenticator } = require('minecraft-launcher-core');
const launcher = new Client();
const findJavaHome = require('find-java-home')
var env = process.env


//Window controls
const closeWindowBtn = document.getElementById('close-window')
const minWindowBtn = document.getElementById('min-window')
// Close window
closeWindowBtn.addEventListener("click", function (e) {
    ipcRenderer.send('close-window');
});
minWindowBtn.addEventListener("click", function (e) {
    ipcRenderer.send('min-window');
});

// Ping minecraft server every 8 seconds
const playersContainer = document.getElementById('players-container')
const divPlayers = document.getElementById('divPlayers')
// FUNCTION THAT ONLY PINGS THE MINECRAFT SERVER AND NOT THE VM INSTANCE // However, if VM Instance is offline the ping will return the Minecraft Server as offline as well - DUH! Joaquin...
function getPing(serverIp) {
    // Minecraft Server Pinger in action
    pinger.ping(serverIp, 25565, (error, result) => {
        function serverOffline() {
            // Disable enter server button because server is offline 
            document.getElementById('start-minecraft').disabled = true
            // Server status div
            document.getElementById('server-status').innerHTML = 'Server Status: <span class="text-red-500 font-bold" id="span">OFFLINE</span>'
            // Remove and add various CSS classes that come from server being online
            document.getElementById('span').classList.remove('online')
            document.getElementById('ping').classList.remove('block')
            document.getElementById('ping').classList.add('hidden')
            document.getElementById('server-status-spinner').classList.add('hidden')
            divPlayers.classList.remove('block')
            divPlayers.classList.add('hidden')
            // GET request VM Instance in GCP
            authorize(function (authClient) {
                // Authentication
                var request = {
                    // Project ID for this request.
                    project: 'vivid-science-327616',

                    // The name of the zone for this request.
                    zone: 'southamerica-east1-a',

                    // Name of the instance resource to return.
                    instance: 'mine',

                    auth: authClient
                };

                // Actual GET request
                compute.instances.get(request, function (err, response) {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    // Status of VM Instance in GCP // Could be: PROVISIONING, STAGING, RUNNING, STOPPING, SUSPENDING, SUSPENDED, REPAIRING, and TERMINATED
                    resStatus = response.data.status
                    // console.log(resStatus)
                    if (resStatus == 'TERMINATED') {
                        const serverControlsContainer = document.getElementById('server-controls-container')
                        // This is in case STOP SERVER button was clicked so ui for server status needs to change AND a start server button needs to be added now
                        if (serverControlsContainer.innerText == 'Stop Server' || serverControlsContainer.innerText == 'Shutting Down') {
                            document.getElementById('stop-button').remove()
                            const startButton = document.createElement('button')
                            startButton.innerHTML = 'Turn Server On'
                            startButton.setAttribute('id', 'start-button');
                            startButton.classList.add('btn-scale', 'rounded-2xl', 'm-4', 'inline-flex', 'text-white', 'font-bold', 'bg-green-500', 'border-0', 'py-2', 'px-6', 'focus:outline-none', 'hover:bg-green-600', 'rounded', 'text-lg')
                            serverControlsContainer.appendChild(startButton)

                        }

                        // This is in case the application was just launched and the minecraft server is offline, so a start button is added 
                        if (serverControlsContainer.innerText == '') {
                            const startButton = document.createElement('button')
                            startButton.innerHTML = 'Turn Server On'
                            startButton.setAttribute('id', 'start-button');
                            startButton.classList.add('btn-scale', 'rounded-2xl', 'm-4', 'inline-flex', 'text-white', 'font-bold', 'bg-green-500', 'border-0', 'py-2', 'px-6', 'focus:outline-none', 'hover:bg-green-600', 'rounded', 'text-lg')
                            serverControlsContainer.appendChild(startButton)

                        }

                        // Functionality for that start button added
                        document.getElementById('start-button').addEventListener('click', function () {
                            const startButton = document.getElementById('start-button')
                            const spinner = document.createElement('img')
                            spinner.setAttribute('src', './tail-spin.svg')
                            spinner.classList.add('ml-4')
                            startButton.classList.add('cursor-not-allowed', 'opacity-70')
                            startButton.classList.remove('hover:bg-green-600')
                            startButton.innerHTML = 'Starting Server'
                            startButton.appendChild(spinner)
                            authorize(function (authClient) {

                                var request = {
                                    // Project ID for this request.
                                    project: 'vivid-science-327616',

                                    // The name of the zone for this request.
                                    zone: 'southamerica-east1-a',

                                    // Name of the instance resource to return.
                                    instance: 'mine',

                                    auth: authClient
                                };

                                compute.instances.start(request, function (err, response) {
                                    if (err) {
                                        console.error(err);
                                        return;
                                    }
                                });
                            });
                            function authorize(callback) {
                                google.auth.getClient({
                                    scopes: ['https://www.googleapis.com/auth/cloud-platform']
                                }).then(client => {
                                    callback(client);
                                }).catch(err => {
                                    console.error('authentication failed: ', err);
                                });
                            }
                        })
                    }
                });
            });
            function authorize(callback) {
                google.auth.getClient({
                    scopes: ['https://www.googleapis.com/auth/cloud-platform']
                }).then(client => {
                    callback(client);
                }).catch(err => {
                    console.error('authentication failed: ', err);
                });
            }
        }
        if (error) {
            return serverOffline()
        } else {
            // Enable start game button if minecraft server is online
            document.getElementById('start-minecraft').disabled = false

            // Hide spinner from checking server status div  
            document.getElementById('server-status-spinner').classList.add('hidden')

            // GET VIRTUAL MACHINE STATUS
            authorize(function (authClient) {

                var request = {
                    // Project ID for this request.
                    project: 'vivid-science-327616',

                    // The name of the zone for this request.
                    zone: 'southamerica-east1-a',

                    // Name of the instance resource to return.
                    instance: 'mine',

                    auth: authClient
                };
                // GET REQUEST TO VM INSTANCE IN GCP
                compute.instances.get(request, function (err, response) {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    resStatus = response.data.status
                    // console.log(resStatus)
                    if (resStatus == 'RUNNING') {
                        document.getElementById('bottom-box').classList.remove('hidden')
                        const serverControlsContainer = document.getElementById('server-controls-container')

                        // Shows STOP BUTTON to stop VM INSTANCE IN GCP if there are not any players online
                        if (result.players.online === 0) {
                            // document.getElementById('stop-button').classList.add('hidden')
                            if (serverControlsContainer.innerText == 'Turn Server On' || serverControlsContainer.innerText == 'Starting Server') {
                                document.getElementById('start-button').remove()
                                const stopButton = document.createElement('button')
                                stopButton.innerHTML = 'Stop Server'
                                stopButton.setAttribute('id', 'stop-button');
                                stopButton.classList.add('btn-scale', 'rounded-2xl', 'm-4', 'inline-flex', 'text-white', 'font-bold', 'bg-red-500', 'border-0', 'py-2', 'px-6', 'focus:outline-none', 'hover:bg-red-600', 'rounded', 'text-lg')
                                serverControlsContainer.appendChild(stopButton)
                            }
                            if (serverControlsContainer.innerText == '') {
                                const stopButton = document.createElement('button')
                                stopButton.innerHTML = 'Stop Server'
                                stopButton.setAttribute('id', 'stop-button');
                                stopButton.classList.add('btn-scale', 'rounded-2xl', 'm-4', 'inline-flex', 'text-white', 'font-bold', 'bg-red-500', 'border-0', 'py-2', 'px-6', 'focus:outline-none', 'hover:bg-red-600', 'rounded', 'text-lg')
                                serverControlsContainer.appendChild(stopButton)
                            }
                            // Stop Button in click function to stop vm instance
                            document.getElementById('stop-button').addEventListener('click', function () {

                                // First stop Minecraft Server
                                const ip = serverIp
                                const client = new util.RCON(ip, { port: 25575, password: '40575566' });

                                client.on('output', (message) => {
                                    console.log(message);
                                });

                                client.connect()
                                    .then(async () => {
                                        await client.run('stop');

                                        client.close();
                                    })
                                    .catch((error) => {
                                        console.error(error);
                                    });

                                // Second stop the VM Instance
                                authorize(function (authClient) {

                                    var request = {
                                        // Project ID for this request.
                                        project: 'vivid-science-327616',

                                        // The name of the zone for this request.
                                        zone: 'southamerica-east1-a',

                                        // Name of the instance resource to return.
                                        instance: 'mine',

                                        auth: authClient
                                    };

                                    // POST request to stop vm instance
                                    compute.instances.stop(request, function (err, response) {
                                        if (err) {
                                            console.error(err);
                                            return;
                                        }
                                        const stopButton = document.getElementById('stop-button')
                                        const spinner = document.createElement('img')
                                        spinner.setAttribute('src', './tail-spin.svg')
                                        spinner.classList.add('ml-4', 'inline-flex')
                                        stopButton.classList.add('cursor-not-allowed', 'opacity-70')
                                        stopButton.classList.remove('hover:bg-red-600')
                                        stopButton.innerHTML = 'Shutting Down'
                                        stopButton.appendChild(spinner)
                                    });
                                });
                                function authorize(callback) {
                                    google.auth.getClient({
                                        scopes: ['https://www.googleapis.com/auth/cloud-platform']
                                    }).then(client => {
                                        callback(client);
                                    }).catch(err => {
                                        console.error('authentication failed: ', err);
                                    });
                                }
                            })
                        }
                    }
                });
            });
            function authorize(callback) {
                google.auth.getClient({
                    scopes: ['https://www.googleapis.com/auth/cloud-platform']
                }).then(client => {
                    callback(client);
                }).catch(err => {
                    console.error('authentication failed: ', err);
                });
            }
            // Server status div
            document.getElementById('server-status').innerHTML = 'Server Status: <span class="font-bold text-green-500" id="span">ONLINE</span>'
            document.getElementById('span').classList.remove('offline')
            document.getElementById('ping').classList.remove('hidden')
            document.getElementById('ping').classList.add('block')
            document.getElementById('ping').classList.add('text-sm')
            document.getElementById('ping').innerHTML = `Ping: <span id="ping-ms-span">${result.ping}ms</span>`
            if (result.ping <= 90) {
                document.getElementById('ping-ms-span').classList.add('text-green-400', 'font-bold')
            } else if (result.ping <= 220) {
                document.getElementById('ping-ms-span').classList.add('text-yellow-400', 'font-bold')
            } else {
                document.getElementById('ping-ms-span').classList.add('text-red-400', 'font-bold')
            }
            // Online players div
            let divPlayers = document.getElementById('divPlayers')
            divPlayers.classList.remove('hidden')
            divPlayers.classList.add('block')
            divPlayers.innerHTML = ''
            let h3 = document.createElement('h3')

            if (result.players.online == 0) {
                h3.innerHTML = 'No players online'
            } else {
                h3.innerHTML = 'Online players'
            }

            h3.classList.add('mt-4', 'font-bold',)
            divPlayers.appendChild(h3)

            // Get online players names
            if (result.players.online > 0) {
                let players = result.players.sample
                let ul = document.createElement('ul')
                ul.classList.add('flex')
                divPlayers.appendChild(ul)

                const sortedPlayers = players.sort((a, b) => a.name.localeCompare(b.name))
                sortedPlayers.forEach(element => {

                    let li = document.createElement('li')
                    li.textContent = element.name
                    li.classList.add('shadow-md', 'w-min', 'rounded-xl', 'px-2', 'py-1', 'm-2', 'bg-green-500', 'text-white', 'font-bold', 'tracking-wide')
                    ul.appendChild(li)
                });
            }

            storage.get('minecraft', function (error, data2) {
                if (error) console.error
            })
        }
    })
    setTimeout(getPing.bind(null, serverIp), 8000);
}

// Local Storage for settings using package 'electron-json-storage' AND start the game 
storage.setDataPath(os.tmpdir());

storage.has('minecraft', function (error, hasKey) {
    if (error) console.error
    if (!hasKey) {

        // Installing files UI
        document.getElementById('server-status').classList.add('hidden')
        document.getElementById('start-minecraft').classList.add('hidden')
        const statusDiv = document.getElementById('server-status-div')
        const installingDiv = document.createElement('div')
        installingDiv.classList.add('font-bold')
        installingDiv.innerHTML = 'Downloading files'
        statusDiv.appendChild(installingDiv)


        // Get windows user
        const userWindows = os.userInfo().username;
        //Lowercase the string from variable 'userWindows' so that it can be used as part of a directory
        const usernameOs = userWindows.toLowerCase()

        // Create directory for Minecraft
        const dirpath = `C:/Users/${usernameOs}/AppData/Roaming/.minecraft`
        const dirpathMods = `C:/Users/${usernameOs}/AppData/Roaming/.minecraft/mods`
        const dirpathInstallers = `C:/Users/${usernameOs}/AppData/Roaming/.minecraft/installer`
        // Set up minecraft default category
        storage.has('defaultMinecraftDir', function (error, hasKey) {
            if (error) throw error
            if (!hasKey) {
                const userWindows = os.userInfo().username;
                const usernameOs = userWindows.toLowerCase()
                // Create object for minecraft directory with windows user lowercased
                const defaultMinecraftDir = {
                    defaultMinecraftDir: dirpath
                }

                storage.set('defaultMinecraftDir', defaultMinecraftDir, function (error) {
                    if (error) throw error;
                });
            }
        })
        // Get minecraft directory configured, whether default or custom and set to a new unified directory
        storage.has('customMinecraftDir', function (error, hasKey) {
            if (error) throw error;
            // if there is not a key it means that default directory is active. Otherwise, custom directory is active
            if (!hasKey) {
                storage.get('defaultMinecraftDir', function (error, data) {
                    if (error) return error;
                    storage.set('minecraftDirectory', { directory: data.defaultMinecraftDir })
                })
            }
            if (hasKey) {
                storage.get('customMinecraftDir', function (error, data) {
                    if (error) return error;
                    storage.set('minecraftDirectory', { directory: data.minecraftDir })
                })
            }
        });
        storage.set('minecraft', { paths: { dirpath, dirpathMods, dirpathInstallers } }, function (error) {
            if (error) console.error
        });

        const urls = {
            forge: 'https://maven.minecraftforge.net/net/minecraftforge/forge/1.12.2-14.23.5.2855/forge-1.12.2-14.23.5.2855-installer.jar',
            optifine: 'https://1fichier.com/?8fo1lo4lawcsip43siep',
            customSkinLoader: 'https://media.forgecdn.net/files/3400/199/CustomSkinLoader_ForgeLegacy-14.13-SNAPSHOT-282.jar',
            jre: 'https://1fichier.com/?l42aaavludbzgi98u70e'
        }

        fs.mkdirSync(dirpath, { recursive: true })
        fs.mkdirSync(dirpathMods, { recursive: true })
        fs.mkdirSync(dirpathInstallers, { recursive: true })
        ipcRenderer.send('download-installers', { paths: { dirpath, dirpathMods, dirpathInstallers }, urls: urls })
        const defaultMinecraftDir = {
            defaultMinecraftDir: `C:/Users/${usernameOs}/AppData/Roaming/.minecraft`
        }
        ipcRenderer.on("jre-downloaded", (event, data) => {
            console.log('jre downloaded')
            function installJre() {
                exec(`${dirpathInstallers}/jre-8u311-windows-x64.exe`, function (err, data) {
                    console.log(err)
                    console.log(data.toString());
                });
            }
            setTimeout(async function () { installJre(); }, 60000);


        });
        ipcRenderer.on("forge-downloaded", (event, data) => {
            console.log('forge-downloaded')
        });
        ipcRenderer.on("optifine-downloaded", (event, data) => {
            console.log('optifine-downloaded')
        });
        ipcRenderer.on("customSkinLoader-downloaded", (event, data) => {
            console.log('customSkinLoader downloaded')
        });

        // console.log(env)
        // env.ProgramW6432

        function jreFinish() {
            if (fs.existsSync(`${env.programW6432}/Java`) === false) {
                setTimeout(function () { jreFinish(); }, 5000);
            } else {
                function forceReload() {
                    ipcRenderer.send('force-reload')
                }
                setTimeout(function () { forceReload(); }, 60000);
            }
        }

        jreFinish()


    }




    if (hasKey) {
        // GET SERVER IP and Mods (bottom-box)
        storage.has('minecraftServerIp', function (error, hasKey) {
            if (error) throw error;
            if (!hasKey) {
                document.getElementById('server-status').innerHTML = `<div> <label>Please type the server's IP</label> <input type="text" id="serverIP" class="py-1 ml-2 rounded"> <label id="saveServerIP"><button class="ml-2 inline-flex text-white font-bold bg-green-500 border-0 py-1 px-2 focus:outline-none hover:bg-green-600 rounded" id="save-ip-button">Save</button></label><img src="./tail-spin.svg" class="hidden" id="save-ip-spinner"></div>`
                document.getElementById('server-status-spinner').classList.add('hidden')
                document.getElementById('start-minecraft').classList.add('hidden')
                document.getElementById('saveServerIP').addEventListener('click', function () {
                    const setServerIp = document.getElementById('serverIP').value
                    storage.set('minecraftServerIp', { serverIp: setServerIp }, function (error) {
                        if (error) throw error;
                    });
                    const saveBtn = document.getElementById('save-ip-button')
                    saveBtn.innerHTML = 'Saving'
                    saveBtn.classList.add('opacity-70')
                    document.getElementById('save-ip-spinner').classList.remove('hidden')
                    document.getElementById('save-ip-spinner').classList.add('inline-block', 'ml-2')

                    function forceReload() {
                        ipcRenderer.send('force-reload')
                    }
                    setTimeout(function () { forceReload(); }, 2000);
                })
            }
            if (hasKey) {
                const javawPath = {}

                findJavaHome({ allowJre: true }, (err, home) => {
                    if (err) return console.log(err);
                    // console.log(home);
                    javawPath["path"] = `${home}/bin/javaw.exe`

                });
                storage.get('minecraftServerIp', function (error, data) {
                    if (error) throw error;
                    // console.log(data)
                    const serverIp = data.serverIp
                    getPing(serverIp)

                    // Get Mods and download if needed
                    function getGameAndMods() {
                        pinger.ping(serverIp, 25565, (error, result) => {
                            if (error) {
                                console.error
                                setTimeout(getGameAndMods(), 5000);
                            }

                            if (result) {
                                storage.get('minecraft', function (error, data2) {
                                    if (error) console.error
                                    storage.getMany(['ram', 'screenResolution', 'user', 'start'], function (error, settingsData) {
                                        if (error) console.error
                                        // console.log(settingsData.user)
                                        if (!settingsData.ram.max || !settingsData.user.username) {

                                            document.getElementById('incomplete-settings').classList.remove('hidden')
                                            console.log('no ram')
                                            setTimeout(getGameAndMods(), 5000);
                                        } else {
                                            document.getElementById('incomplete-settings').classList.add('hidden')
                                            getMods()
                                            // }

                                            // Get system's ram amount
                                            const totalRAM = os.totalmem();
                                            // Print the result in MB
                                            const ramMB = totalRAM / (1024 * 1024);
                                            // Round number obtained from ramMB
                                            const availableRam = Math.round(ramMB)
                                            function launchMinecraft() {
                                                const javaw = javawPath.path.replace(/\\/g, "/")

                                                // console.log(javaw)
                                                let opts = {
                                                    clientPackage: null,

                                                    authorization: Authenticator.getAuth(settingsData.user.username),
                                                    // authorization: { username: 'ChipiBarijho' },
                                                    root: data2.paths.dirpath,
                                                    version: {
                                                        number: "1.12.2",
                                                        type: "release",

                                                    },
                                                    forge: `${data2.paths.dirpathInstallers}/forge-1.12.2-14.23.5.2855-installer.jar`,
                                                    memory: {
                                                        // max: settingsData.ram.max,
                                                        max: availableRam, // This isnt max ram to use by minecraft but rather the amount of ram that the system has
                                                        min: settingsData.ram.max // this is the max amount of ram to be used by Minecraft
                                                    },
                                                    javaPath: javaw,
                                                    server: {
                                                        host: serverIp,
                                                        port: '25565'
                                                    }
                                                }
                                                
                                                async function startMinecraftGame() {
                                                    console.log(opts)
                                                    await launcher.launch(opts);
                                                }
                                                startMinecraftGame().then(res => {
                                                    console.log('starting minecraft')
                                                    function closeWindow() {
                                                        window.close()
                                                    }
                                                    setTimeout(function () { closeWindow(); }, 15000);
                                                }).catch(e => {
                                                    console.log(e)
                                                })

                                            }
                                            document.getElementById('start-minecraft').addEventListener('click', function (e) {

                                                const startMinecraft = document.getElementById('start-minecraft')

                                                const spinner = document.createElement('img')
                                                spinner.setAttribute('src', './tail-spin.svg')
                                                spinner.classList.add('ml-4', 'inline-flex')
                                                startMinecraft.innerText = 'Entering Server'
                                                startMinecraft.classList.add('cursor-not-allowed', 'opacity-70')
                                                startMinecraft.appendChild(spinner)
                                                // Start Minecraft 
                                                launchMinecraft()


                                                startMinecraft.disabled = true
                                            })
                                        }
                                    })
                                })

                                const user = "chipibarijho"
                                const pass = "#chipi8456#"
                                const token = Buffer.from(`${user}:${pass}`, 'utf8').toString('base64')


                                function getMods() {
                                    // console.log('func getMods() initialized')
                                    axios.get(`http://${serverIp}:25580/mods`, {
                                        headers: {
                                            'Authorization': `Basic ${token}`
                                        }
                                    })
                                        .then((res) => {
                                            const serverMods = []
                                            res.data.forEach(mod => {
                                                serverMods.push(mod)
                                            })

                                            storage.get('minecraftDirectory', function (error, data) {
                                                const clientModsDirectory = `${data.directory}/mods`
                                                const clientFilesInDirectory = fs.readdirSync(clientModsDirectory);
                                                const extension = '.jar'

                                                const clientMods = clientFilesInDirectory.filter(function (mod) {
                                                    return mod.indexOf(extension) !== -1;
                                                });
                                                const parsedClientMods = []
                                                async function getClientMods() {
                                                    await Promise.all(clientMods.map(async mod => {
                                                        const path = `${clientModsDirectory}/${mod}`
                                                        const forgeMetaData = await BeeModParser.readForgeMod(path);
                                                        parsedClientMods.push(forgeMetaData)
                                                    }))
                                                }

                                                async function compareModsList() {
                                                    await getClientMods()

                                                    const filesToDownload = []

                                                    async function getModFile() {

                                                        const parsedClientModsMcModInfo = []
                                                        const parsedClientModsModAnnotations = []
                                                        parsedClientMods.forEach(mod => {
                                                            if (mod.mcmodInfo != '') {
                                                                parsedClientModsMcModInfo.push(mod)
                                                            } else {
                                                                parsedClientModsModAnnotations.push(mod)
                                                            }
                                                        })
                                                        const missingMod = []
                                                        // Check server mods against client mods one by one and find those not in client's 
                                                        await Promise.all(serverMods.map(async mod => {
                                                            if (mod.mcmodInfo != '') {
                                                                let result = mod.mcmodInfo.filter(o1 => !parsedClientModsMcModInfo.some(o2 => o1.modid === o2.mcmodInfo[0].modid));
                                                                if (result != '') {
                                                                    // console.log(result)
                                                                    missingMod.push(result)
                                                                }
                                                            }
                                                            if (mod.mcmodInfo == '') {
                                                                let result = mod.modAnnotations.filter(o1 => !parsedClientMods.some(o2 => o1.modid === o2.modAnnotations[0].modid));
                                                                if (result != '') {
                                                                    missingMod.push(result)
                                                                }
                                                            }
                                                        }))

                                                        missingMod.forEach(mod => {
                                                            if (mod.length === 1) {
                                                                filesToDownload.push(mod)
                                                            } else if (mod.length > 1) {
                                                                mod.forEach(arr => {
                                                                    if (!arr.downloadUrl) {
                                                                        // console.log('no download url')
                                                                    } else {
                                                                        filesToDownload.push(arr)
                                                                    }
                                                                })
                                                            }

                                                        })

                                                    }

                                                    async function triggerAndWaitGetModFile() {
                                                        await getModFile()
                                                        // console.log(filesToDownload)

                                                        document.getElementById('loading-mods-div').classList.add('hidden')
                                                        const updateBtn = document.getElementById('download-mods-button')
                                                        document.getElementById('download-mods-div').classList.remove('hidden')
                                                        if (filesToDownload != '') {
                                                            // console.log(filesToDownload)
                                                            updateBtn.disabled = false
                                                            document.getElementById('text-update-mods').classList.remove('hidden')
                                                            document.getElementById('text-update-mods').classList.add('font-bold', 'text-red-400', 'mr-2')
                                                            updateBtn.innerHTML = 'Update Mods'
                                                            updateBtn.classList.add('btn-scale', 'rounded-2xl', 'inline-flex', 'text-gray-800', 'font-bold', 'bg-yellow-400', 'border-0', 'py-1', 'px-4', 'focus:outline-none', 'hover:bg-yellow-500', 'rounded', 'text-lg', 'uppercase')
                                                        } else {
                                                            updateBtn.classList.add('hidden')
                                                            document.getElementById('text-update-mods').classList.remove('hidden')
                                                            document.getElementById('text-update-mods').classList.add('font-bold', 'text-green-300')
                                                            document.getElementById('text-update-mods').innerHTML = 'Mods Up To Date'
                                                        }

                                                        document.getElementById('download-mods-button').addEventListener('click', function () {

                                                            const spinner = document.createElement('img')
                                                            spinner.setAttribute('src', './tail-spin.svg')
                                                            spinner.classList.add('ml-4', 'inline-flex')
                                                            updateBtn.classList.add('cursor-not-allowed', 'opacity-70')
                                                            updateBtn.classList.remove('hover:bg-yellow-500')
                                                            updateBtn.innerHTML = 'Downloading'
                                                            updateBtn.appendChild(spinner)
                                                            ipcRenderer.send('download-items', { files: filesToDownload, directory: clientModsDirectory })
                                                            updateBtn.disabled = true


                                                        })


                                                    }
                                                    triggerAndWaitGetModFile()

                                                }
                                                compareModsList()

                                            })
                                        })
                                        .catch((error) => {
                                            console.log(error)
                                            setTimeout(getMods(), 10000);
                                        })
                                }
                            }
                        })
                    }
                    getGameAndMods()
                });
            }
        });

    }
})

// START and STOP the Virtual Machine instance on which the minecraft server runs

authorize(function (authClient) {

    var request = {
        // Project ID for this request.
        project: 'vivid-science-327616',  // TODO: Update placeholder value.

        // The name of the zone for this request.
        zone: 'southamerica-east1-a',  // TODO: Update placeholder value.

        // Name of the instance resource to return.
        instance: 'mine',  // TODO: Update placeholder value.

        auth: authClient
    };

    compute.instances.get(request, function (err, response) {
        if (err) {
            console.error(err);
            return;
        }

        resStatus = response.data.status
        if (resStatus == 'RUNNING') {
            // console.log(resStatus)
        }
    });
});
function authorize(callback) {
    google.auth.getClient({
        scopes: ['https://www.googleapis.com/auth/cloud-platform']
    }).then(client => {
        callback(client);
    }).catch(err => {
        console.error('authentication failed: ', err);
    });
}





ipcRenderer.on("download progress", (event, progress) => {
    // console.log(progress); // Progress in fraction, between 0 and 1
    const progressInPercentages = progress * 100; // With decimal point and a bunch of numbers
    const cleanProgressInPercentages = Math.floor(progress.percent * 100); // Without decimal point
    // console.log(cleanProgressInPercentages)
});

ipcRenderer.on("download-complete", (event, file) => {

    document.getElementById('download-mods-button').classList.add('hidden')
    document.getElementById('text-update-mods').classList.add('font-bold', 'text-green-300')
    document.getElementById('text-update-mods').innerHTML = 'Mods updated!'
    // console.log(file); // Full file path
});





/////////////////////////////////////////////////////SETTINGS PAGE/////////////////////////////////////////
const settingsBtn = document.getElementById('settings')
const goBackBtn = document.getElementById('go-back')
const settingsPage = document.getElementById('settings-page')
const mainPage = document.getElementById('main-page')
settingsBtn.addEventListener('click', function () {
    settingsPage.classList.toggle('hidden')
    mainPage.classList.toggle('hidden')
})

goBackBtn.addEventListener('click', function () {
    settingsPage.classList.toggle('hidden')
    mainPage.classList.toggle('hidden')
})

storage.has('minecraftServerIp', function (error, hasKey) {
    if (error) throw error;
    if (!hasKey) {

        document.getElementById('saveServerIP').addEventListener('click', function () {
            const setServerIp = document.getElementById('serverIP').value
            storage.set('minecraftServerIp', { serverIp: setServerIp }, function (error) {
                if (error) throw error;
            });

        })

    }
    if (hasKey) {
        storage.getMany(['minecraftServerIp', 'user', 'minecraftDirectory'], function (error, data) {
            if (error) throw error;
            // console.log(data)
            // Populate ip in input
            document.getElementById('serverIP').value = data.minecraftServerIp.serverIp

            // Check if customskinloader mod has already been initialized and created all its necessary folders
            const customSkinLoaderDir = `${data.minecraftDirectory.directory}/CustomSkinLoader`
            const customSkinLoaderJson = `${data.minecraftDirectory.directory}/CustomSkinLoader/CustomSkinLoader.json`
            // Upload Skin to skin server
            const uploadSkinDiv = document.getElementById('upload-skin-div')
            if (fs.existsSync(customSkinLoaderDir) && fs.existsSync(customSkinLoaderJson)) {

                const skinLoaderJson = fs.readFileSync(customSkinLoaderJson)
                const parsedSkinLoaderJson = JSON.parse(skinLoaderJson)

                const result = parsedSkinLoaderJson.loadlist.filter(item => item.name == 'AdminSkinServer');
                if (result == '') {
                    const customSkinServer = {
                        "name": "AdminSkinServer",
                        "type": "CustomSkinAPI",
                        "root": `http://${data.minecraftServerIp.serverIp}:25580/skins/`
                    }


                    parsedSkinLoaderJson.loadlist.push(customSkinServer)
                    backToJson = JSON.stringify(parsedSkinLoaderJson)
                    fs.writeFileSync(customSkinLoaderJson, backToJson)
                }
                // console.log('both exist')
                // create form to post skin to server
                uploadSkinDiv.innerHTML = `<form action="http://${data.minecraftServerIp.serverIp}:25580/skins" method="post" enctype="multipart/form-data">
                <label class="font-bold" for="skin">Skin</label>
                <label id="label-skin" class="ml-2 px-2 cursor-pointer border-solid border border-gray-300 rounded-2xl bg-white" for="skin">Select file...</label>
                <input type="file" id="skin" name="skins">
                <input name="username" id="username" value="${data.user.username}" class="hidden">
                <input type="submit" value="Upload" id="save-skin" class="text-white font-bold border-0 px-2 focus:outline-none
                rounded-2xl bg-green-500 hover:bg-green-600 ml-2 cursor-not-allowed opacity-70">
                </form>`

                document.getElementById('save-skin').disabled = true

                document.getElementById('skin').addEventListener('change', function(){
                    if ( document.getElementById('skin').value != '') {
                        let filename = this.value
                        let f = filename.replace(/.*[\/\\]/, '')
                        // console.log(f)
                        document.getElementById('label-skin').innerHTML = f
                        document.getElementById('save-skin').disabled = false
                        document.getElementById('save-skin').classList.remove('cursor-not-allowed', 'opacity-70')
                        document.getElementById('save-skin').classList.add('cursor-pointer')
                    } else {
                        document.getElementById('save-skin').disabled = true
                        document.getElementById('save-skin').classList.add('cursor-not-allowed', 'opacity-70')
                        document.getElementById('save-skin').classList.remove('cursor-pointer')
                        document.getElementById('label-skin').innerHTML = 'Seleccionar archivo...'
                    }
                   
                })
                document.getElementById('save-skin').addEventListener('click', function(){
                    document.getElementById('save-skin').classList.add('cursor-not-allowed', 'opacity-70')
                    document.getElementById('save-skin').classList.remove('cursor-pointer')
                })

            } else {
                uploadSkinDiv.innerHTML = `<form action="http://${data.minecraftServerIp.serverIp}:25580/skins" method="post" enctype="multipart/form-data">
                <label class="font-bold" for="skin">Skin</label>
                <div>You need to start Minecraft at least once to upload your skin</div>
                </form>`
            }
        });
        document.getElementById('saveServerIP').addEventListener('click', function () {
            storage.remove('minecraftServerIp')
            const setServerIp = document.getElementById('serverIP').value
            storage.set('minecraftServerIp', { serverIp: setServerIp }, function (error) {
                if (error) throw error;
            });

        })



    }
});

// storage.has('screenResolution', function (error, hasKey) {
//     if (error) console.error
//     if (!hasKey) {
//         const screenRes = document.getElementById('screen-resolution')
//         const saveScreenResBtn = document.getElementById('save-screen-resolution')
//         saveScreenResBtn.addEventListener('click', function () {
//             if (screenRes.value == 'full') {
//                 const windowSize = { fullscreen: true }
//                 storage.set('screenResolution', { windowSize, id: 'full' })
//                 console.log(windowSize)
//             } else if (screenRes.value == '720p') {
//                 const windowSize = { width: '1280', height: '720' }
//                 storage.set('screenResolution', { windowSize, id: '720p' })
//                 console.log(windowSize)
//             } else {
//                 const windowSize = 'default'
//                 storage.set('screenResolution', { windowSize, id: 'default' })
//                 console.log(windowSize)
//             }
//             ipcRenderer.send('force-reload')
//         })
//     }
//     if (hasKey) {
//         const screenRes = document.getElementById('screen-resolution')
//         const saveScreenResBtn = document.getElementById('save-screen-resolution')
//         storage.get('screenResolution', function (error, data) {
//             if (data.id == 'full') {
//                 document.getElementById('full').setAttribute('selected', 'selected')
//             } else if (data.id == '720p') {
//                 document.getElementById('720p').setAttribute('selected', 'selected')
//             } else {
//                 document.getElementById('default').setAttribute('selected', 'selected')
//             }
//         })
//         saveScreenResBtn.addEventListener('click', function () {
//             storage.remove('screenResolution')
//             if (screenRes.value == 'full') {
//                 const windowSize = { fullscreen: true }
//                 storage.set('screenResolution', { windowSize, id: 'full' })
//                 console.log(windowSize)
//             } else if (screenRes.value == '720p') {
//                 const windowSize = { width: '1280', height: '720' }
//                 storage.set('screenResolution', { windowSize, id: '720p' })
//                 console.log(windowSize)
//             } else {
//                 const windowSize = 'default'
//                 storage.set('screenResolution', { windowSize, id: 'default' })
//                 console.log(windowSize)
//             }
//             ipcRenderer.send('force-reload')
//         })
//     }
// })

// Get the number of total memory in Byte
const totalRAM = os.totalmem();
// Print the result in MB
const ramMB = totalRAM / (1024 * 1024);

storage.has('ram', function (error, hasKey) {
    if (error) console.error
    if (!hasKey) {
        const ramDiv = document.getElementById('ram-div')
        ramDiv.innerHTML = `<div class="flex items-center"><label class="font-bold">RAM</label>
        <input type="range" min="2000" max="${Math.round(ramMB)}" value="4000" step="100" class="slider ml-2" id="ram-range"
          oninput="this.nextElementSibling.value = this.value">
        <output id="ram-range-output" class="ml-2">4000</output><output class="ml-1">MB</output>
        <label id="save-ram" class="ml-2"><button
            class="text-white font-bold border-0 px-2 focus:outline-none rounded-2xl bg-green-500 hover:bg-green-600 ml-4">Save</button></label></div>`


        const saveRam = document.getElementById('save-ram')
        saveRam.addEventListener('click', function () {
            const ramRangeOutput = document.getElementById('ram-range-output')
            // console.log(ramRangeOutput.value)
            const maxRam = ramRangeOutput.value
            storage.set('ram', { max: maxRam }, function (error) {
                if (error) console.error
            })
            saveRam.classList.add('opacity-70')
        })
    }
    if (hasKey) {
        const ramDiv = document.getElementById('ram-div')
        storage.get('ram', function (error, data) {
            // console.log(data.max)
            ramDiv.innerHTML = `<div class="flex items-center"><label class="font-bold">RAM</label>
            <input type="range" min="2000" max="${Math.round(ramMB)}" value="${data.max}" step="100" class="slider ml-2" id="ram-range"
              oninput="this.nextElementSibling.value = this.value">
            <output id="ram-range-output" class="ml-2">${data.max}</output><output class="ml-1">MB</output>
            <label id="save-ram" class="ml-2"></div><button
                class="text-white font-bold border-0 px-2 focus:outline-none rounded-2xl bg-green-500 hover:bg-green-600 ml-4">Save</button></label>`

            const saveRam = document.getElementById('save-ram')

            saveRam.addEventListener('click', function () {
                storage.remove('ram')
                const ramRangeOutput = document.getElementById('ram-range-output')
                // console.log(ramRangeOutput.value)
                const maxRam = ramRangeOutput.value
                storage.set('ram', { max: maxRam }, function (error) {
                    if (error) console.error
                })

                saveRam.classList.add('opacity-70')
            })

        })

    }
})

storage.has('user', function (error, hasKey) {
    if (error) console.error
    if (!hasKey) {
        document.getElementById('saveUsername').addEventListener('click', function () {
            const setUsername = document.getElementById('username').value
            storage.set('user', { username: setUsername }, function (error) {
                if (error) throw error;
            });

            document.getElementById('saveUsername').classList.add('opacity-70')
        })
    }
    if (hasKey) {

        storage.get('user', function (error, data) {
            if (error) throw error;
            // console.log(data)
            document.getElementById('username').value = data.username
        });
        document.getElementById('saveUsername').addEventListener('click', function () {
            storage.remove('user')
            const setUsername = document.getElementById('username').value
            storage.set('user', { username: setUsername }, function (error) {
                if (error) throw error;
            });
            document.getElementById('saveUsername').classList.add('opacity-70')
        })

    }
})
