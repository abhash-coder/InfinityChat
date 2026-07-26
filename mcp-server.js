import http from 'http';
import os from 'os';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const PORT = 3001;

// --- 54 NATIVE TOOLS ---
const tools = [
  // --- SYSTEM TOOLS ---
  {
    name: 'sys_cpu_model',
    description: 'Get CPU model information.',
    inputSchema: { type: 'object', properties: {} },
    run: () => {
      const cpus = os.cpus();
      return cpus.length > 0 ? cpus[0].model : 'Unknown CPU';
    }
  },
  {
    name: 'sys_cpu_cores',
    description: 'Get number of CPU cores.',
    inputSchema: { type: 'object', properties: {} },
    run: () => os.cpus().length
  },
  {
    name: 'sys_mem_free',
    description: 'Get free system memory in Megabytes.',
    inputSchema: { type: 'object', properties: {} },
    run: () => Math.round(os.freemem() / (1024 * 1024))
  },
  {
    name: 'sys_mem_total',
    description: 'Get total system memory in Megabytes.',
    inputSchema: { type: 'object', properties: {} },
    run: () => Math.round(os.totalmem() / (1024 * 1024))
  },
  {
    name: 'sys_mem_usage',
    description: 'Get percentage memory usage.',
    inputSchema: { type: 'object', properties: {} },
    run: () => {
      const free = os.freemem();
      const total = os.totalmem();
      return Math.round(((total - free) / total) * 100);
    }
  },
  {
    name: 'sys_uptime',
    description: 'Get server uptime in seconds.',
    inputSchema: { type: 'object', properties: {} },
    run: () => os.uptime()
  },
  {
    name: 'sys_platform',
    description: 'Get OS platform (e.g. linux, darwin, win32).',
    inputSchema: { type: 'object', properties: {} },
    run: () => os.platform()
  },
  {
    name: 'sys_arch',
    description: 'Get CPU architecture (e.g. x64, arm64).',
    inputSchema: { type: 'object', properties: {} },
    run: () => os.arch()
  },
  {
    name: 'sys_loadavg',
    description: 'Get system load averages for 1, 5, and 15 minutes.',
    inputSchema: { type: 'object', properties: {} },
    run: () => os.loadavg()
  },
  {
    name: 'sys_hostname',
    description: 'Get server hostname.',
    inputSchema: { type: 'object', properties: {} },
    run: () => os.hostname()
  },
  {
    name: 'sys_temp_dir',
    description: 'Get temporary directory path.',
    inputSchema: { type: 'object', properties: {} },
    run: () => os.tmpdir()
  },

  // --- FILESYSTEM TOOLS ---
  {
    name: 'fs_list_dir',
    description: 'List files in a directory.',
    inputSchema: {
      type: 'object',
      properties: {
        dirPath: { type: 'string', description: 'Directory path to list files from' }
      },
      required: ['dirPath']
    },
    run: (args) => {
      const p = args.dirPath || '.';
      return fs.readdirSync(p).map(file => {
        const fullPath = path.join(p, file);
        let isDir = false;
        try { isDir = fs.statSync(fullPath).isDirectory(); } catch(e){}
        return { name: file, type: isDir ? 'directory' : 'file' };
      });
    }
  },
  {
    name: 'fs_file_stat',
    description: 'Get file statistics (size, creation date).',
    inputSchema: {
      type: 'object',
      properties: {
        filePath: { type: 'string', description: 'File path' }
      },
      required: ['filePath']
    },
    run: (args) => {
      const stat = fs.statSync(args.filePath);
      return {
        size: stat.size,
        birthtime: stat.birthtime,
        mtime: stat.mtime,
        isFile: stat.isFile(),
        isDirectory: stat.isDirectory()
      };
    }
  },
  {
    name: 'fs_path_join',
    description: 'Join multiple path segments.',
    inputSchema: {
      type: 'object',
      properties: {
        paths: { type: 'array', items: { type: 'string' } }
      },
      required: ['paths']
    },
    run: (args) => path.join(...args.paths)
  },
  {
    name: 'fs_path_ext',
    description: 'Get extension of a file path.',
    inputSchema: {
      type: 'object',
      properties: {
        filePath: { type: 'string' }
      },
      required: ['filePath']
    },
    run: (args) => path.extname(args.filePath)
  },
  {
    name: 'fs_path_basename',
    description: 'Get base name of a file path.',
    inputSchema: {
      type: 'object',
      properties: {
        filePath: { type: 'string' }
      },
      required: ['filePath']
    },
    run: (args) => path.basename(args.filePath)
  },
  {
    name: 'fs_path_dirname',
    description: 'Get directory name of a file path.',
    inputSchema: {
      type: 'object',
      properties: {
        filePath: { type: 'string' }
      },
      required: ['filePath']
    },
    run: (args) => path.dirname(args.filePath)
  },
  {
    name: 'fs_is_absolute',
    description: 'Check if path is absolute.',
    inputSchema: {
      type: 'object',
      properties: {
        filePath: { type: 'string' }
      },
      required: ['filePath']
    },
    run: (args) => path.isAbsolute(args.filePath)
  },
  {
    name: 'fs_sep',
    description: 'Get platform path separator.',
    inputSchema: { type: 'object', properties: {} },
    run: () => path.sep
  },

  // --- TEXT TOOLS ---
  {
    name: 'text_upper',
    description: 'Convert text to uppercase.',
    inputSchema: {
      type: 'object',
      properties: { text: { type: 'string' } },
      required: ['text']
    },
    run: (args) => args.text.toUpperCase()
  },
  {
    name: 'text_lower',
    description: 'Convert text to lowercase.',
    inputSchema: {
      type: 'object',
      properties: { text: { type: 'string' } },
      required: ['text']
    },
    run: (args) => args.text.toLowerCase()
  },
  {
    name: 'text_reverse',
    description: 'Reverse characters in a string.',
    inputSchema: {
      type: 'object',
      properties: { text: { type: 'string' } },
      required: ['text']
    },
    run: (args) => args.text.split('').reverse().join('')
  },
  {
    name: 'text_length',
    description: 'Get length of text (characters and byte size).',
    inputSchema: {
      type: 'object',
      properties: { text: { type: 'string' } },
      required: ['text']
    },
    run: (args) => ({
      characters: args.text.length,
      bytes: Buffer.byteLength(args.text, 'utf8')
    })
  },
  {
    name: 'text_word_count',
    description: 'Count words in a string.',
    inputSchema: {
      type: 'object',
      properties: { text: { type: 'string' } },
      required: ['text']
    },
    run: (args) => args.text.trim() === '' ? 0 : args.text.trim().split(/\s+/).length
  },
  {
    name: 'text_line_count',
    description: 'Count lines in a block of text.',
    inputSchema: {
      type: 'object',
      properties: { text: { type: 'string' } },
      required: ['text']
    },
    run: (args) => args.text.split(/\r?\n/).length
  },
  {
    name: 'text_trim',
    description: 'Trim leading/trailing whitespace.',
    inputSchema: {
      type: 'object',
      properties: { text: { type: 'string' } },
      required: ['text']
    },
    run: (args) => args.text.trim()
  },
  {
    name: 'text_rot13',
    description: 'Apply ROT13 cipher.',
    inputSchema: {
      type: 'object',
      properties: { text: { type: 'string' } },
      required: ['text']
    },
    run: (args) => args.text.replace(/[a-zA-Z]/g, c => String.fromCharCode(c.charCodeAt(0) + (c.toLowerCase() < 'n' ? 13 : -13)))
  },
  {
    name: 'text_base64_encode',
    description: 'Base64 encode a string.',
    inputSchema: {
      type: 'object',
      properties: { text: { type: 'string' } },
      required: ['text']
    },
    run: (args) => Buffer.from(args.text).toString('base64')
  },
  {
    name: 'text_base64_decode',
    description: 'Base64 decode a string.',
    inputSchema: {
      type: 'object',
      properties: { text: { type: 'string' } },
      required: ['text']
    },
    run: (args) => Buffer.from(args.text, 'base64').toString('utf8')
  },
  {
    name: 'text_url_encode',
    description: 'URL encode a string.',
    inputSchema: {
      type: 'object',
      properties: { text: { type: 'string' } },
      required: ['text']
    },
    run: (args) => encodeURIComponent(args.text)
  },
  {
    name: 'text_url_decode',
    description: 'URL decode a string.',
    inputSchema: {
      type: 'object',
      properties: { text: { type: 'string' } },
      required: ['text']
    },
    run: (args) => decodeURIComponent(args.text)
  },

  // --- MATH TOOLS ---
  {
    name: 'math_add',
    description: 'Add two numbers.',
    inputSchema: {
      type: 'object',
      properties: { a: { type: 'number' }, b: { type: 'number' } },
      required: ['a', 'b']
    },
    run: (args) => args.a + args.b
  },
  {
    name: 'math_subtract',
    description: 'Subtract two numbers (a - b).',
    inputSchema: {
      type: 'object',
      properties: { a: { type: 'number' }, b: { type: 'number' } },
      required: ['a', 'b']
    },
    run: (args) => args.a - args.b
  },
  {
    name: 'math_multiply',
    description: 'Multiply two numbers.',
    inputSchema: {
      type: 'object',
      properties: { a: { type: 'number' }, b: { type: 'number' } },
      required: ['a', 'b']
    },
    run: (args) => args.a * args.b
  },
  {
    name: 'math_divide',
    description: 'Divide two numbers (a / b).',
    inputSchema: {
      type: 'object',
      properties: { a: { type: 'number' }, b: { type: 'number' } },
      required: ['a', 'b']
    },
    run: (args) => args.b === 0 ? 'Error: division by zero' : args.a / args.b
  },
  {
    name: 'math_pow',
    description: 'Calculate standard exponent power (a^b).',
    inputSchema: {
      type: 'object',
      properties: { a: { type: 'number' }, b: { type: 'number' } },
      required: ['a', 'b']
    },
    run: (args) => Math.pow(args.a, args.b)
  },
  {
    name: 'math_sqrt',
    description: 'Get square root of a number.',
    inputSchema: {
      type: 'object',
      properties: { a: { type: 'number' } },
      required: ['a']
    },
    run: (args) => Math.sqrt(args.a)
  },
  {
    name: 'math_abs',
    description: 'Get absolute value of a number.',
    inputSchema: {
      type: 'object',
      properties: { a: { type: 'number' } },
      required: ['a']
    },
    run: (args) => Math.abs(args.a)
  },
  {
    name: 'math_round',
    description: 'Round a number to nearest integer.',
    inputSchema: {
      type: 'object',
      properties: { a: { type: 'number' } },
      required: ['a']
    },
    run: (args) => Math.round(args.a)
  },
  {
    name: 'math_ceil',
    description: 'Ceil a number to next highest integer.',
    inputSchema: {
      type: 'object',
      properties: { a: { type: 'number' } },
      required: ['a']
    },
    run: (args) => Math.ceil(args.a)
  },
  {
    name: 'math_floor',
    description: 'Floor a number to next lowest integer.',
    inputSchema: {
      type: 'object',
      properties: { a: { type: 'number' } },
      required: ['a']
    },
    run: (args) => Math.floor(args.a)
  },
  {
    name: 'math_sin',
    description: 'Get sine of angle (in radians).',
    inputSchema: {
      type: 'object',
      properties: { a: { type: 'number' } },
      required: ['a']
    },
    run: (args) => Math.sin(args.a)
  },
  {
    name: 'math_cos',
    description: 'Get cosine of angle (in radians).',
    inputSchema: {
      type: 'object',
      properties: { a: { type: 'number' } },
      required: ['a']
    },
    run: (args) => Math.cos(args.a)
  },
  {
    name: 'math_log',
    description: 'Get natural logarithm (ln(x)).',
    inputSchema: {
      type: 'object',
      properties: { a: { type: 'number' } },
      required: ['a']
    },
    run: (args) => Math.log(args.a)
  },

  // --- RANDOM TOOLS ---
  {
    name: 'gen_random_int',
    description: 'Get a random integer within limits.',
    inputSchema: {
      type: 'object',
      properties: { min: { type: 'number' }, max: { type: 'number' } },
      required: ['min', 'max']
    },
    run: (args) => Math.floor(Math.random() * (args.max - args.min + 1)) + args.min
  },
  {
    name: 'gen_uuid',
    description: 'Generate a random UUID v4.',
    inputSchema: { type: 'object', properties: {} },
    run: () => crypto.randomUUID()
  },
  {
    name: 'gen_random_string',
    description: 'Generate random alphanumeric string.',
    inputSchema: {
      type: 'object',
      properties: { length: { type: 'number' } },
      required: ['length']
    },
    run: (args) => crypto.randomBytes(Math.ceil(args.length / 2)).toString('hex').slice(0, args.length)
  },
  {
    name: 'gen_roll_dice',
    description: 'Roll a standard 6-sided die.',
    inputSchema: { type: 'object', properties: {} },
    run: () => Math.floor(Math.random() * 6) + 1
  },
  {
    name: 'gen_flip_coin',
    description: 'Flip a coin.',
    inputSchema: { type: 'object', properties: {} },
    run: () => Math.random() < 0.5 ? 'Heads' : 'Tails'
  },

  // --- TIME TOOLS ---
  {
    name: 'time_now',
    description: 'Get current ISO timestamp.',
    inputSchema: { type: 'object', properties: {} },
    run: () => new Date().toISOString()
  },
  {
    name: 'time_unix',
    description: 'Get current Unix epoch time in seconds.',
    inputSchema: { type: 'object', properties: {} },
    run: () => Math.floor(Date.now() / 1000)
  },
  {
    name: 'time_days_between',
    description: 'Get number of days between two dates.',
    inputSchema: {
      type: 'object',
      properties: { date1: { type: 'string' }, date2: { type: 'string' } },
      required: ['date1', 'date2']
    },
    run: (args) => {
      const d1 = new Date(args.date1);
      const d2 = new Date(args.date2);
      const diffTime = Math.abs(d2 - d1);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
  },

  // --- HASHING TOOLS ---
  {
    name: 'crypto_sha256',
    description: 'Calculate SHA-256 hash.',
    inputSchema: {
      type: 'object',
      properties: { text: { type: 'string' } },
      required: ['text']
    },
    run: (args) => crypto.createHash('sha256').update(args.text).digest('hex')
  },
  {
    name: 'crypto_md5',
    description: 'Calculate MD5 hash.',
    inputSchema: {
      type: 'object',
      properties: { text: { type: 'string' } },
      required: ['text']
    },
    run: (args) => crypto.createHash('md5').update(args.text).digest('hex')
  }
];

const sessions = new Map();

// Helper to parse POST request body
const parseBody = (req) => new Promise((resolve) => {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => resolve(body));
});

// JSON-RPC Response Helper
const jsonRpcResponse = (id, result, error = null) => {
  const resp = { jsonrpc: '2.0', id };
  if (error) resp.error = error;
  else resp.result = result;
  return JSON.stringify(resp);
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // --- CORS SECURITY BYPASS PROXY ROUTE ---
  if (req.method === 'POST' && parsedUrl.pathname === '/proxy') {
    let proxyBody;
    try {
      const raw = await parseBody(req);
      proxyBody = JSON.parse(raw);
    } catch(err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid Proxy Request JSON' }));
      return;
    }

    const { url, method = 'POST', headers = {}, body = null } = proxyBody;

    try {
      const fetchParams = { method, headers };
      if (body) {
        fetchParams.body = typeof body === 'object' ? JSON.stringify(body) : body;
      }

      const externalRes = await fetch(url, fetchParams);
      const resText = await externalRes.text();

      // Return exact status and body back to frontend client
      res.writeHead(externalRes.status, { 'Content-Type': externalRes.headers.get('content-type') || 'application/json' });
      res.end(resText);
    } catch(err) {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: `Proxy Forward Failure: ${err.message}` }));
    }
    return;
  }

  // --- SSE transport handshake ---
  if (parsedUrl.pathname === '/sse') {
    const sessionId = crypto.randomUUID();
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    sessions.set(sessionId, res);
    res.write(`event: endpoint\ndata: ${encodeURIComponent(`/message?sessionId=${sessionId}`)}\n\n`);

    req.on('close', () => {
      sessions.delete(sessionId);
    });
    return;
  }

  // --- JSON-RPC Message Handler ---
  if (parsedUrl.pathname === '/message') {
    const sessionId = parsedUrl.searchParams.get('sessionId');
    if (!sessionId) {
      res.writeHead(400);
      res.end('Missing sessionId');
      return;
    }

    const rawBody = await parseBody(req);
    let rpcRequest;
    try {
      rpcRequest = JSON.parse(rawBody);
    } catch(e) {
      res.writeHead(400);
      res.end(jsonRpcResponse(null, null, { code: -32700, message: 'Parse error' }));
      return;
    }

    const { method, params, id } = rpcRequest;

    if (method === 'initialize') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(jsonRpcResponse(id, {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'native-54-tools-mcp-server', version: '1.0.0' }
      }));
      return;
    }

    if (method === 'tools/list') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(jsonRpcResponse(id, {
        tools: tools.map(t => ({
          name: t.name,
          description: t.description,
          inputSchema: t.inputSchema
        }))
      }));
      return;
    }

    if (method === 'tools/call') {
      const tool = tools.find(t => t.name === params.name);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      if (!tool) {
        res.end(jsonRpcResponse(id, null, { code: -32601, message: `Tool not found: ${params.name}` }));
        return;
      }

      try {
        const result = tool.run(params.arguments || {});
        res.end(jsonRpcResponse(id, {
          content: [
            {
              type: 'text',
              text: typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)
            }
          ]
        }));
      } catch (err) {
        res.end(jsonRpcResponse(id, null, { code: -32000, message: err.message }));
      }
      return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(jsonRpcResponse(id, {}));
    return;
  }

  // --- Raw catalog list ---
  if (parsedUrl.pathname === '/tools') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(tools.map(t => ({ name: t.name, description: t.description, inputSchema: t.inputSchema }))));
    return;
  }

  // Direct tool execution route for local web client
  if (req.method === 'POST' && parsedUrl.pathname === '/call') {
    let callBody;
    try {
      const raw = await parseBody(req);
      callBody = JSON.parse(raw);
    } catch(err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid JSON body' }));
      return;
    }

    const tool = tools.find(t => t.name === callBody.name);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    if (!tool) {
      res.end(JSON.stringify({ error: `Tool not found: ${callBody.name}` }));
      return;
    }

    try {
      const result = tool.run(callBody.arguments || {});
      res.end(JSON.stringify({
        result: typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)
      }));
    } catch(err) {
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`Standalone Native MCP Server running at http://localhost:${PORT}`);
});
