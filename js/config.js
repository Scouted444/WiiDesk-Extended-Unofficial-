var def_config = {
    musicVol: 0.5,
    sfxVol: 0.2,
    clock24: true,
}

function wdClone(obj) { return JSON.parse(JSON.stringify(obj)); }

if (typeof(Storage) !== "undefined") {
    if (!localStorage.getItem('wiidesk-demo-settings')) {
        localStorage.setItem("wiidesk-demo-settings", JSON.stringify(def_config));
        location.reload();
    }
} else {
    alert('Local Storage is not support or disabled -- settings will not work!')
}

var userConfig;
try {
    userConfig = JSON.parse(localStorage.getItem('wiidesk-demo-settings'));
} catch (e) {}
if (!userConfig || typeof userConfig !== 'object') userConfig = wdClone(def_config);
// Fill in any settings added in newer versions
Object.keys(def_config).forEach(function (k) {
    if (userConfig[k] === undefined) userConfig[k] = def_config[k];
});
localStorage.setItem('wiidesk-demo-settings', JSON.stringify(userConfig));
console.log("user config:", userConfig);

var def_channels = [
    {
        id: 'disc',
        title: 'Disc Channel',
        assets: 'assets/channels/',
        channelart: 'channelart/',
        disc: true
    },
    {
        id: 'mii',
        title: 'Mii Channel',
        assets: 'assets/channels/',
        channelart: 'channelart/'
    },
    {
        id: 'photo',
        title: 'Photo Channel',
        assets: 'assets/channels/',
        channelart: 'channelart/'
    },
    {
        id: 'shop',
        title: 'Wii Shop Channel',
        assets: 'assets/channels/',
        channelart: 'channelart/',
        target: 'shop/index.html'
    },
    {
        id: 'news',
        title: 'News Channel',
        assets: 'assets/channels/',
        channelart: 'channelart/',
        target: 'news/index.html'
    },
    {
        id: 'wiideskdiscord',
        title: 'WiiDesk Discord',
        assets: 'assets/channels/',
        channelart: 'channelart/',
        target: 'https://discord.gg/BpspqC25zt',
        customArt: {
            icon: 'assets/channels/wiideskdiscord/icon.png',
            previewImage: 'assets/channels/wiideskdiscord/icon.png',
            previewMusic: 'assets/channels/wiideskdiscord/preview-sound.mp3'
        }
    }
]

// Channels used to be overwritten with the defaults on every page load, which
// threw away anything done in Manage Channels. They're now kept between visits.
// Bump CHANNELS_VERSION when a built-in channel is added or gets a new target:
// the next load adds missing built-ins and fills in missing targets, and leaves
// the user's order, edits and custom channels alone.
var CHANNELS_VERSION = 2;
var userChannels;
try {
    userChannels = JSON.parse(localStorage.getItem('wiidesk-demo-channels'));
} catch (e) {}
if (!Array.isArray(userChannels)) {
    userChannels = wdClone(def_channels);
} else if ((+localStorage.getItem('wiidesk-channels-version') || 0) < CHANNELS_VERSION) {
    def_channels.forEach(function (d) {
        var existing = userChannels.find(function (c) { return c.id === d.id; });
        if (!existing) userChannels.push(wdClone(d));
        else if (d.target && !existing.target) existing.target = d.target;
    });
}
localStorage.setItem('wiidesk-demo-channels', JSON.stringify(userChannels));
localStorage.setItem('wiidesk-channels-version', CHANNELS_VERSION);
console.log("user channels: ", userChannels);

function resetConfig(confirm) {
    if (confirm == true) {
        localStorage.setItem("wiidesk-demo-settings", JSON.stringify(def_config));
        userConfig = JSON.parse(localStorage.getItem('wiidesk-demo-settings'));
        console.log("user config reset!:", userConfig);
    } else {
        console.error("loadDefaultConfig: MAKE SURE YOU'D LIKE TO DO THIS BY USING \"loadDefaultConfig(true)\". THERE'S NO TURNING BACK!!")
    }
}
function resetChannels(confirm) {
    if (confirm == true) {
        localStorage.setItem("wiidesk-demo-channels", JSON.stringify(def_channels));
        userChannels = JSON.parse(localStorage.getItem('wiidesk-demo-channels'));
        console.log("user channels reset! (reload page to see):", userChannels);
    } else {
        console.error("loadDefaultChannels: MAKE SURE YOU'D LIKE TO DO THIS BY USING ADDING \"true\" IN THE FUNCTION. THERE'S NO TURNING BACK!!")
    }
}

// Erases everything WiiDesk has saved (settings, channels, messages) and restarts.
function formatSystemMemory() {
    Object.keys(localStorage)
        .filter(function (k) { return k.indexOf('wiidesk') === 0; })
        .forEach(function (k) { localStorage.removeItem(k); });
    location.reload();
}
