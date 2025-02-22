import IpcMainEvent = Electron.IpcMainEvent;
import {BrowserWindow, Notification,nativeImage} from 'electron'
type DbOtions = {
    dbName: string;
    port: string;
    host: string;
    backupPath: string;
    user: string;
    password: string;
    binary: string;

}
const spawn = require('child_process').spawn;

const restoreDb = (dbOptions: DbOtions, event: IpcMainEvent) => {
    const {dbName, host, password, port, user, backupPath, binary} = dbOptions;

    const pgRestoreBinary = `C:\\Program Files (x86)\\PostgreSQL\\10\\bin\\pg_restore.exe`;
    const params = `--host ${host} --port ${port} --username ${user} --role postgres --dbname ${dbName} --verbose ${backupPath}`;

    console.log(binary, 'xdxd');

    const bat = spawn(binary, params.toString().split(" "), {env: {...process.env, PGPASSWORD: password}});
    getBrowserWindow(event)?.setProgressBar(2);
    bat.stdout.setEncoding('utf8');
    bat.stdout.on('data', (data: any) => {
        console.log('data', data.toString());
        event.sender.send('restore-logs', data.toString())
    });
    bat.stderr.setEncoding('utf8');
    bat.stderr.on('data', (data: any) => {
        console.log('error', data.toString());
        event.sender.send('restore-logs', data.toString())
    });

    bat.on('exit', (code: any) => {
        console.log(`Child exited with code ${code}`);
        event.sender.send('restore-logs', `finish-OK`)
    });
    bat.on('error', (code: any) => {
        console.log(`error ${code}`);
        event.sender.send('restore-logs', `error ${code}`)
    });
};

const restoreFinishActions = (event: IpcMainEvent) => {
    //probar con el nistallIcon pero no es la solucion final
  //  const icon = 'app://./favicon.ico';
    //console.log(icon);
    getBrowserWindow(event)?.setProgressBar(-1);
    new Notification({
        title: "Completado",
        body: 'El backup se restauró correctamente',
        //icon:icon
    }).show();
};

const getBrowserWindow = (event: IpcMainEvent): BrowserWindow | null => {
    return BrowserWindow.fromWebContents(event.sender);
};

export {restoreDb, restoreFinishActions};
