const app = require('./app');
const http = require('http').Server(app);
const io = require('socket.io')(http);

const osu = require('node-os-utils');
const cpu = osu.cpu;
const osCmd = osu.osCmd;
const drive = osu.drive;
const mem = osu.mem;
const os = osu.os;
const netstat = osu.netstat;

const cpuCount = cpu.count();
const cpuModel = cpu.model();
let osName = 'unknown';
const osPlatform = os.platform();

//get osName just once
os.oos().then(name => {
    osName = name;
});


app.get('/', (req, res) => {
    res.render('index');
});

io.on('connect', (socket) => {
    sendStats(socket);
})

function sendStats(toEmitTo) {
    Promise.all([
        cpu.usage(),
        osCmd.whoami(),
        drive.info(),
        mem.info(),
        netstat.stats()
    ])
        .then(output => {
            toEmitTo.emit('update', {
                osName,
                cpuCount,
                cpuModel,
                osPlatform,
                cpuPercentage: output[0],
                whoami: output[1],
                driveInfo: output[2],
                memInfo: output[3],
                netStat: output[4],
                osUptime: os.uptime(),
                // osIP: os.ip(),
                osHostname: os.hostname(),
                osType: os.type(),
                osArch: os.arch(),
            });
        })
        .catch(err => {
            console.error(err);
        });

}

setInterval(() => {
    sendStats(io);
}, 1000);

http.listen(3000, () => {
    console.log('listening on *:3000');
});
