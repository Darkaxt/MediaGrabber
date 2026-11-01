"""Exercise native info and a real direct download without changing system settings."""
import argparse
import hashlib
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import struct
import subprocess
import threading
import uuid

parser = argparse.ArgumentParser()
parser.add_argument('--expected', required=True)
parser.add_argument('host', nargs=argparse.REMAINDER)
args = parser.parse_args()
payload = b'MediaGrabber system Downloads integration verification\n'

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Length', str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)
    def log_message(self, *unused):
        pass

server = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
thread = threading.Thread(target=server.serve_forever)
thread.start()
process = subprocess.Popen(args.host, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)

def send(message):
    data = json.dumps(message).encode()
    process.stdin.write(struct.pack('<I', len(data)) + data)
    process.stdin.flush()

def receive():
    header = process.stdout.read(4)
    if len(header) != 4:
        raise RuntimeError('Native host exited before its result')
    return json.loads(process.stdout.read(struct.unpack('<I', header)[0]))

def call(request_id, method, *arguments):
    send({'type':'weh#rpc', '_request':request_id, '_method':method, '_args':arguments})
    while True:
        message = receive()
        if message.get('_reply') == request_id:
            if '_error' in message:
                raise RuntimeError(message['_error'])
            return message['_result']
        if '_request' in message:
            send({'type':'weh#rpc', '_reply':message['_request'], '_result':None})

try:
    info = call(1, 'info')
    if Path(info['downloadDir']).resolve() != Path(args.expected).resolve():
        raise RuntimeError(f'Wrong system destination: {info}')
    filename = '.MediaGrabber-download-check-' + uuid.uuid4().hex + '.txt'
    call(2, 'downloads.download', {'url':f'http://127.0.0.1:{server.server_port}/fixture', 'filename':filename})
    while True:
        message = receive()
        if '_request' not in message:
            continue
        send({'type':'weh#rpc', '_reply':message['_request'], '_result':None})
        if message['_method'] == 'downloadError':
            raise RuntimeError(str(message['_args']))
        if message['_method'] == 'downloadComplete':
            destination = Path(message['_args'][1])
            if destination.parent.resolve() != Path(args.expected).resolve() or destination.read_bytes() != payload:
                raise RuntimeError('Downloaded file has incorrect location or content')
            print(json.dumps({'version':info['version'],'downloadDir':info['downloadDir'],
                              'file':str(destination),'sha256':hashlib.sha256(payload).hexdigest()}), flush=True)
            break
finally:
    if process.poll() is None:
        send({'type':'weh#rpc','_request':99,'_method':'quit','_args':[]})
    process.wait()
    server.shutdown()
    server.server_close()
    thread.join()
