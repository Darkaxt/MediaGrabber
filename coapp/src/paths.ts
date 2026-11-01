import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { execFileSync } from 'child_process';

const platformFolder = process.platform === 'win32' ? 'win' : process.platform;
const executableSuffix = process.platform === 'win32' ? '.exe' : '';

/** Resolve the user's current Windows known folder without creating a fallback. */
export function getDefaultDownloadDir(): string {
  if (process.platform !== 'win32') return path.join(os.homedir(), 'Downloads');

  try {
    const windows = process.env.SystemRoot || process.env.WINDIR;
    if (!windows) throw new Error('Windows system directory is unavailable');
    const powershell = path.join(windows, 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe');
    // A fixed, read-only Shell query. Base64 keeps Unicode independent of the console code page.
    const query = "[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes((New-Object -ComObject Shell.Application).NameSpace('shell:::{374DE290-123F-4565-9164-39C4925E467B}').Self.Path))";
    const encoded = execFileSync(powershell, ['-NoProfile', '-NonInteractive', '-Command', query], {
      encoding: 'utf8', windowsHide: true, stdio: ['ignore', 'pipe', 'pipe']
    }).trim();
    const directory = Buffer.from(encoded, 'base64').toString('utf8');
    if (!path.isAbsolute(directory) || !fs.statSync(directory).isDirectory()) {
      throw new Error('The configured Downloads location is not an available directory');
    }
    return directory;
  } catch (cause) {
    throw new Error('Unable to resolve the Windows Downloads folder. Check its Location setting and availability.', { cause });
  }
}

export function getInstallDir(): string {
  if (process.env.MEDIAGRABBER_INSTALL_DIR) {
    return process.env.MEDIAGRABBER_INSTALL_DIR;
  }

  if (process.platform === 'win32') {
    return path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'), 'MediaGrabber');
  }

  if (process.platform === 'darwin') {
    return path.join(os.homedir(), 'Library', 'Application Support', 'MediaGrabber');
  }

  return path.join(process.env.XDG_DATA_HOME || path.join(os.homedir(), '.local', 'share'), 'MediaGrabber');
}

export function getRuntimeRoots(): string[] {
  return Array.from(new Set([
    process.env.MEDIAGRABBER_HOME,
    process.cwd(),
    getInstallDir(),
    path.dirname(process.execPath),
    path.resolve(__dirname, '..')
  ].filter((value): value is string => Boolean(value))));
}

export function getRuntimeBinary(kind: 'ffmpeg' | 'ffprobe' | 'ytdlp'): string {
  const name = kind === 'ytdlp' ? `yt-dlp${executableSuffix}` : `${kind}${executableSuffix}`;
  const folder = kind === 'ytdlp' ? 'ytdlp' : 'ffmpeg';
  return path.join(folder, platformFolder, name);
}

export function getHostBinaryPath(): string {
  return path.join(getInstallDir(), `coapp${executableSuffix}`);
}
