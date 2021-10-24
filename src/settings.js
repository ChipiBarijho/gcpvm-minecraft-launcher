const os = require('os');
const storage = require('electron-json-storage');



// Get windows user
const userWindows = os.userInfo().username;

//Lowercase the string from variable 'userWindows' so that it can be used as part of a directory
const usernameOs = userWindows.toLowerCase()

// Create object for minecraft directory with windows user lowercased
const defaultMinecraftDir = {
    defaultMinecraftDir: `C:/Users/${usernameOs}/AppData/Roaming/.minecraft`
}



// Local Storage for settings using package 'electron-json-storage'
storage.setDataPath(os.tmpdir());

// Change defualt minecraft directory
// document.getElementById('changeMinecraftDir').addEventListener('click', function(){
//     const minecraftDir = document.getElementById('minecraftDir').value
//     storage.set('customMinecraftDir', {customMinecraftDir: minecraftDir}, function(error){
//         if(error) throw error;
//         // console.log(minecraftDir)
//     })

// })
// // Reset minecraft directory to default
// document.getElementById('resetMinecraftDir').addEventListener('click', function(){
//     document.getElementById('minecraftDir').value = defaultMinecraftDir.defaultMinecraftDir
//     storage.remove('customMinecraftDir')

// })


// storage.has('customMinecraftDir', function(error, hasKey) {
//     if (error) throw error;
//     if(!hasKey){
//         // Set minecraft directory in storage
//         storage.set('defaultMinecraftDir', defaultMinecraftDir, function(error) {
//             if (error) throw error;
//         });
//         // Get object from storage
//         storage.get('defaultMinecraftDir', function(error, data) {
//             if (error) throw error;

//             document.getElementById('minecraftDir').value = data.defaultMinecraftDir
//         });
//         // return console.log('no custom directory')
//     }
//     if (hasKey) {
//       storage.get('customMinecraftDir', function(error, data){
//           if (error) return error;
//         //   console.log(data)
//           document.getElementById('minecraftDir').value = data.customMinecraftDir
//       })
//     //   console.log('customMinecraftDir is configured');
//     }
// });



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
        storage.get('minecraftServerIp', function (error, data) {
            if (error) throw error;
            // console.log(data)
            document.getElementById('serverIP').value = data.serverIp
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

storage.has('screenResolution', function (error, hasKey) {
    if (error) console.error
    if (!hasKey) {
        const screenRes = document.getElementById('screen-resolution')
        const saveScreenResBtn = document.getElementById('save-screen-resolution')
        saveScreenResBtn.addEventListener('click', function () {
            if (screenRes.value == 'full') {
                const windowSize = { fullscreen: true }
                storage.set('screenResolution', { windowSize, id: 'full' })
                console.log(windowSize)
            } else if (screenRes.value == '720p') {
                const windowSize = { width: '1280', height: '720' }
                storage.set('screenResolution', { windowSize, id: '720p' })
                console.log(windowSize)
            } else {
                const windowSize = 'default'
                storage.set('screenResolution', { windowSize, id: 'default' })
                console.log(windowSize)
            }
        })
    }
    if (hasKey) {
        const screenRes = document.getElementById('screen-resolution')
        const saveScreenResBtn = document.getElementById('save-screen-resolution')
        storage.get('screenResolution', function (error, data) {
            if (data.id == 'full') {
                document.getElementById('full').setAttribute('selected', 'selected')
            } else if (data.id == '720p') {
                document.getElementById('720p').setAttribute('selected', 'selected')
            } else {
                document.getElementById('default').setAttribute('selected', 'selected')
            }
        })
        saveScreenResBtn.addEventListener('click', function () {
            storage.remove('screenResolution')
            if (screenRes.value == 'full') {
                const windowSize = { fullscreen: true }
                storage.set('screenResolution', { windowSize, id: 'full' })
                console.log(windowSize)
            } else if (screenRes.value == '720p') {
                const windowSize = { width: '1280', height: '720' }
                storage.set('screenResolution', { windowSize, id: '720p' })
                console.log(windowSize)
            } else {
                const windowSize = 'default'
                storage.set('screenResolution', { windowSize, id: 'default' })
                console.log(windowSize)
            }
        })
    }
})

// Get the number of total memory in Byte
const totalRAM = os.totalmem();
// Print the result in MB
const ramMB = totalRAM / (1024 * 1024);

// const ramRange = document.getElementById('ram-range')
// ramRange.setAttribute('max', ramMB)
// document.getElementById('ram-range-output').innerHTML = Math.round(ramMB)

storage.has('ram', function (error, hasKey) {
    if (error) console.error
    if (!hasKey) {
        const ramDiv = document.getElementById('ram-div')
        ramDiv.innerHTML = `<label class="font-bold">RAM</label>
        <input type="range" min="2000" max="${Math.round(ramMB)}" value="4000" step="100" class="slider ml-2" id="ram-range"
          oninput="this.nextElementSibling.value = this.value">
        <output id="ram-range-output" class="ml-2">4000</output><output class="ml-1">MB</output>
        <label id="save-ram" class="ml-2"><button
            class="text-white font-bold border-0 px-2 focus:outline-none rounded-2xl bg-green-500 hover:bg-green-600">Guardar</button></label>`


        const saveRam = document.getElementById('save-ram')
        saveRam.addEventListener('click', function () {
            const ramRangeOutput = document.getElementById('ram-range-output')
            // console.log(ramRangeOutput.value)
            const maxRam = ramRangeOutput.value
            storage.set('ram', { max: maxRam })
            saveRam.classList.add('opacity-70')
            saveRam.disabled = true
        })
    }
    if (hasKey) {
        const ramDiv = document.getElementById('ram-div')
        storage.get('ram', function (error, data) {
            // console.log(data.max)
            ramDiv.innerHTML = `<label class="font-bold">RAM</label>
            <input type="range" min="2000" max="${Math.round(ramMB)}" value="${data.max}" step="100" class="slider ml-2" id="ram-range"
              oninput="this.nextElementSibling.value = this.value">
            <output id="ram-range-output" class="ml-2">${data.max}</output><output class="ml-1">MB</output>
            <label id="save-ram" class="ml-2"><button
                class="text-white font-bold border-0 px-2 focus:outline-none rounded-2xl bg-green-500 hover:bg-green-600">Guardar</button></label>`

            const saveRam = document.getElementById('save-ram')

            saveRam.addEventListener('click', function () {
                storage.remove('ram')
                const ramRangeOutput = document.getElementById('ram-range-output')
                // console.log(ramRangeOutput.value)
                const maxRam = ramRangeOutput.value
                storage.set('ram', { max: maxRam })

            })

        })

    }
})