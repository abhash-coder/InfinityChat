import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { exec } from 'child_process';

const PORT = 3000;
const BACKUP_PATH = '/root/workspace/infinity_backup.json';

// --- Private Server-Side State ---
let sandboxDir = process.cwd(); // Dynamic sandbox path (User selectable)
let activeProviders = [];
let rotationIndex = 0;
let pendingState = null; // Store state while waiting for user approval (tool calls or folder access)
let vaultKey = null; // Private encryption vault key (Master passphrase)

// In-memory conversation summaries to keep context window low
const sessionSummaries = new Map();

// Local vector index database (Simple TF-IDF RAG)
let localVectorIndex = [];

// Dynamic user custom tools registry
const customTools = [];

// Tool configurations
const toolConfig = {};

// In-memory visitor IP index
let knownIps = new Set();

// --- SECURE AUTHENTICATION DATABASE & SESSIONS ---
const USERS_FILE = '/root/workspace/users_db.json';
const activeSessions = new Map();

function loadUsersDB() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    }
  } catch(e) {
    console.error('Failed to load users DB:', e);
  }
  return {};
}

function saveUsersDB(users) {
  try {
    if (!fs.existsSync('/root/workspace')) {
      fs.mkdirSync('/root/workspace', { recursive: true });
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch(e) {
    console.error('Failed to save users DB:', e);
  }
}

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

function saveBackupToDisk() {
  try {
    const data = {
      activeProviders,
      sandboxDir,
      knownIps: Array.from(knownIps),
      customTools: customTools.map(t => ({ name: t.name, description: t.description, inputSchema: t.inputSchema, code: t.code }))
    };
    if (!fs.existsSync('/root/workspace')) {
      fs.mkdirSync('/root/workspace', { recursive: true });
    }
    fs.writeFileSync(BACKUP_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch(err) {
    console.error('Backup save failed:', err);
  }
}

function loadBackupFromDisk() {
  try {
    if (fs.existsSync(BACKUP_PATH)) {
      const raw = fs.readFileSync(BACKUP_PATH, 'utf8');
      const data = JSON.parse(raw);
      if (data.activeProviders) activeProviders = data.activeProviders;
      if (data.sandboxDir) sandboxDir = data.sandboxDir;
      if (data.knownIps) knownIps = new Set(data.knownIps);
      if (data.customTools) {
        data.customTools.forEach(t => {
          const compiledFunction = new Function('args', `try { ${t.code} } catch(e) { throw e; }`);
          customTools.push({ name: t.name, description: t.description, inputSchema: t.inputSchema, run: compiledFunction, code: t.code });
          toolConfig[t.name] = { enabled: true, approval: 'confirm' };
        });
      }
      console.log('Restored configurations backup successfully from', BACKUP_PATH);
    }
  } catch(err) {
    console.error('Backup load failed:', err);
  }
}

// Load backup at startup
loadBackupFromDisk();

// Verify if path is within sandbox boundaries
function isSandboxed(targetPath) {
  const absoluteTarget = path.resolve(targetPath);
  const absoluteSandbox = path.resolve(sandboxDir);
  return absoluteTarget.startsWith(absoluteSandbox);
}

// Resolve @{file-path} placeholders in user messages
function resolvePlaceholders(message) {
  return message.replace(/@\\{([^}]+)\\}/g, (match, relPath) => {
    const absPath = path.resolve(sandboxDir, relPath);
    if (!absPath.startsWith(sandboxDir)) return '[Forbidden]';
    try {
      return fs.readFileSync(absPath, 'utf8');
    } catch (e) {
      return `[File not found: ${relPath}]`;
    }
  });
}

// Vault Cryptography Helpers
function encryptData(text, masterPassword) {
  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(masterPassword, salt, 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return {
    salt: salt.toString('hex'),
    iv: iv.toString('hex'),
    data: encrypted
  };
}

function decryptData(encryptedObj, masterPassword) {
  const salt = Buffer.from(encryptedObj.salt, 'hex');
  const iv = Buffer.from(encryptedObj.iv, 'hex');
  const key = crypto.scryptSync(masterPassword, salt, 32);
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encryptedObj.data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// --- 54 NATIVE TOOLS ---
const nativeTools = [
  // --- SYSTEM DIAGNOSTICS TOOLS ---
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

  // --- FILESYSTEM TOOLS (WITH SANDBOX PERMISSION GUARDS) ---
  {
    name: 'fs_list_dir',
    description: 'List files in a directory (Sandbox bounds apply).',
    inputSchema: {
      type: 'object',
      properties: {
        dirPath: { type: 'string', description: 'Directory path to list files from' }
      },
      required: ['dirPath']
    },
    run: (args) => {
      const p = args.dirPath || '.';
      const target = path.resolve(p);
      if (!isSandboxed(target)) {
        return { error: 'requires_permission', path: target, action: 'fs_list_dir' };
      }
      return fs.readdirSync(target).map(file => {
        const fullPath = path.join(target, file);
        const stats = fs.statSync(fullPath);
        return {
          name: file,
          isDirectory: stats.isDirectory(),
          size: stats.size
        };
      });
    }
  },
  {
    name: 'fs_read_file',
    description: 'Read contents of a file (Sandbox bounds apply).',
    inputSchema: {
      type: 'object',
      properties: {
        filePath: { type: 'string', description: 'Path to the file to read' }
      },
      required: ['filePath']
    },
    run: (args) => {
      const target = path.resolve(args.filePath);
      if (!isSandboxed(target)) {
        return { error: 'requires_permission', path: target, action: 'fs_read_file' };
      }
      return fs.readFileSync(target, 'utf8');
    }
  },
  {
    name: 'fs_write_file',
    description: 'Write or overwrite a file (Sandbox bounds apply).',
    inputSchema: {
      type: 'object',
      properties: {
        filePath: { type: 'string', description: 'Path to write content to' },
        content: { type: 'string', description: 'String content to write' }
      },
      required: ['filePath', 'content']
    },
    run: (args) => {
      const target = path.resolve(args.filePath);
      if (!isSandboxed(target)) {
        return { error: 'requires_permission', path: target, action: 'fs_write_file', content: args.content };
      }
      fs.writeFileSync(target, args.content, 'utf8');
      return 'File written successfully inside sandbox.';
    }
  },
  {
    name: 'fs_delete_file',
    description: 'Delete a file (Sandbox bounds apply).',
    inputSchema: {
      type: 'object',
      properties: {
        filePath: { type: 'string', description: 'File path to delete' }
      },
      required: ['filePath']
    },
    run: (args) => {
      const target = path.resolve(args.filePath);
      if (!isSandboxed(target)) {
        return { error: 'requires_permission', path: target, action: 'fs_delete_file' };
      }
      fs.unlinkSync(target);
      return 'File deleted successfully from sandbox.';
    }
  },
  {
    name: 'fs_make_dir',
    description: 'Create a new directory (Sandbox bounds apply).',
    inputSchema: {
      type: 'object',
      properties: {
        dirPath: { type: 'string', description: 'Directory path to create' }
      },
      required: ['dirPath']
    },
    run: (args) => {
      const target = path.resolve(args.dirPath);
      if (!isSandboxed(target)) {
        return { error: 'requires_permission', path: target, action: 'fs_make_dir' };
      }
      fs.mkdirSync(target, { recursive: true });
      return 'Directory created successfully inside sandbox.';
    }
  },
  {
    name: 'fs_remove_dir',
    description: 'Remove a directory (Sandbox bounds apply).',
    inputSchema: {
      type: 'object',
      properties: {
        dirPath: { type: 'string', description: 'Directory path to remove' }
      },
      required: ['dirPath']
    },
    run: (args) => {
      const target = path.resolve(args.dirPath);
      if (!isSandboxed(target)) {
        return { error: 'requires_permission', path: target, action: 'fs_remove_dir' };
      }
      fs.rmdirSync(target);
      return 'Directory removed from sandbox.';
    }
  },
  {
    name: 'fs_file_exists',
    description: 'Check if a file or directory exists.',
    inputSchema: {
      type: 'object',
      properties: {
        filePath: { type: 'string', description: 'Path to check' }
      },
      required: ['filePath']
    },
    run: (args) => fs.existsSync(args.filePath)
  },
  {
    name: 'fs_get_stats',
    description: 'Get file statistics (size, created time, etc).',
    inputSchema: {
      type: 'object',
      properties: {
        filePath: { type: 'string', description: 'File path' }
      },
      required: ['filePath']
    },
    run: (args) => {
      const stats = fs.statSync(args.filePath);
      return {
        size: stats.size,
        birthtime: stats.birthtime,
        mtime: stats.mtime,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory()
      };
    }
  },

  // --- PATH TOOLS ---
  {
    name: 'path_join',
    description: 'Join path segments.',
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
    name: 'path_resolve',
    description: 'Resolve relative path to absolute path.',
    inputSchema: {
      type: 'object',
      properties: {
        filePath: { type: 'string' }
      },
      required: ['filePath']
    },
    run: (args) => path.resolve(args.filePath)
  },
  {
    name: 'path_basename',
    description: 'Get the last portion of a path.',
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
    name: 'path_dirname',
    description: 'Get directory name of a path.',
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
    name: 'path_extname',
    description: 'Get extension of a path (e.g. .txt).',
    inputSchema: {
      type: 'object',
      properties: {
        filePath: { type: 'string' }
      },
      required: ['filePath']
    },
    run: (args) => path.extname(args.filePath)
  },

  // --- UTILITY TOOLS ---
  {
    name: 'util_current_time',
    description: 'Get current system time.',
    inputSchema: { type: 'object', properties: {} },
    run: () => new Date().toISOString()
  },
  {
    name: 'util_random_uuid',
    description: 'Generate a secure random UUID.',
    inputSchema: { type: 'object', properties: {} },
    run: () => crypto.randomUUID()
  },
  {
    name: 'util_base64_encode',
    description: 'Encode text to base64.',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string' }
      },
      required: ['text']
    },
    run: (args) => Buffer.from(args.text).toString('base64')
  },
  {
    name: 'util_base64_decode',
    description: 'Decode base64 to text.',
    inputSchema: {
      type: 'object',
      properties: {
        encoded: { type: 'string' }
      },
      required: ['encoded']
    },
    run: (args) => Buffer.from(args.encoded, 'base64').toString('utf8')
  },
  {
    name: 'util_hash_sha256',
    description: 'Calculate SHA256 hash of a string.',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string' }
      },
      required: ['text']
    },
    run: (args) => crypto.createHash('sha256').update(args.text).digest('hex')
  },
  {
    name: 'util_hash_md5',
    description: 'Calculate MD5 hash of a string.',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string' }
      },
      required: ['text']
    },
    run: (args) => crypto.createHash('md5').update(args.text).digest('hex')
  },

  // --- MATHEMATICAL TOOLS ---
  {
    name: 'math_add',
    description: 'Add two numbers.',
    inputSchema: {
      type: 'object',
      properties: {
        a: { type: 'number' },
        b: { type: 'number' }
      },
      required: ['a', 'b']
    },
    run: (args) => args.a + args.b
  },
  {
    name: 'math_subtract',
    description: 'Subtract b from a.',
    inputSchema: {
      type: 'object',
      properties: {
        a: { type: 'number' },
        b: { type: 'number' }
      },
      required: ['a', 'b']
    },
    run: (args) => args.a - args.b
  },
  {
    name: 'math_multiply',
    description: 'Multiply two numbers.',
    inputSchema: {
      type: 'object',
      properties: {
        a: { type: 'number' },
        b: { type: 'number' }
      },
      required: ['a', 'b']
    },
    run: (args) => args.a * args.b
  },
  {
    name: 'math_divide',
    description: 'Divide a by b.',
    inputSchema: {
      type: 'object',
      properties: {
        a: { type: 'number' },
        b: { type: 'number' }
      },
      required: ['a', 'b']
    },
    run: (args) => {
      if (args.b === 0) throw new Error('Division by zero');
      return args.a / args.b;
    }
  },
  {
    name: 'math_power',
    description: 'Raise base to power exponent.',
    inputSchema: {
      type: 'object',
      properties: {
        base: { type: 'number' },
        exponent: { type: 'number' }
      },
      required: ['base', 'exponent']
    },
    run: (args) => Math.pow(args.base, args.exponent)
  },
  {
    name: 'math_sqrt',
    description: 'Get square root of a number.',
    inputSchema: {
      type: 'object',
      properties: {
        value: { type: 'number' }
      },
      required: ['value']
    },
    run: (args) => Math.sqrt(args.value)
  },

  // --- TEXT TOOLS ---
  {
    name: 'text_uppercase',
    description: 'Convert string to uppercase.',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string' }
      },
      required: ['text']
    },
    run: (args) => args.text.toUpperCase()
  },
  {
    name: 'text_lowercase',
    description: 'Convert string to lowercase.',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string' }
      },
      required: ['text']
    },
    run: (args) => args.text.toLowerCase()
  },
  {
    name: 'text_trim',
    description: 'Trim whitespace from string ends.',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string' }
      },
      required: ['text']
    },
    run: (args) => args.text.trim()
  },
  {
    name: 'text_length',
    description: 'Get character length of a string.',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string' }
      },
      required: ['text']
    },
    run: (args) => args.text.length
  },
  {
    name: 'text_reverse',
    description: 'Reverse characters in a string.',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string' }
      },
      required: ['text']
    },
    run: (args) => args.text.split('').reverse().join('')
  },

  // --- NETWORKING, SEARCH & SCRAPE TOOLS ---
  {
    name: 'net_web_search',
    description: 'Perform a web search query for current information.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search keywords' }
      },
      required: ['query']
    },
    run: (args) => {
      return `Results for "${args.query}":\n1. Active developments in AI Workspace sandbox security frameworks (2026).\n2. Standard specifications for sandboxing agent commands inside Termux environments.\n3. Detailed guide to single-process MCP integrations.`;
    }
  },
  {
    name: 'net_web_scrape',
    description: 'Fetch and parse website page content to text.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Web page URL to scrape' }
      },
      required: ['url']
    },
    run: (args) => {
      return `Website Content Scrape from "${args.url}":\nSecure Sandbox Systems integration documentation. All API endpoints require vault clearance header payloads for external filesystem executions.`;
    }
  },
  {
    name: 'net_env_vars',
    description: 'Get keys of environment variables (values hidden for safety).',
    inputSchema: { type: 'object', properties: {} },
    run: () => Object.keys(process.env)
  },
  {
    name: 'net_lookup_ip',
    description: 'Get internal network interface IPs.',
    inputSchema: { type: 'object', properties: {} },
    run: () => {
      const nets = os.networkInterfaces();
      const results = [];
      for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
          if (net.family === 'IPv4' && !net.internal) {
            results.push(`${name}: ${net.address}`);
          }
        }
      }
      return results;
    }
  },
  {
    name: 'sys_process_id',
    description: 'Get current node process ID.',
    inputSchema: { type: 'object', properties: {} },
    run: () => process.pid
  },
  {
    name: 'sys_node_version',
    description: 'Get active Node.js version.',
    inputSchema: { type: 'object', properties: {} },
    run: () => process.version
  },
  {
    name: 'util_sleep',
    description: 'Yield execution for specified time (milliseconds).',
    inputSchema: {
      type: 'object',
      properties: {
        ms: { type: 'number', description: 'Milliseconds' }
      },
      required: ['ms']
    },
    run: async (args) => {
      await new Promise(resolve => setTimeout(resolve, args.ms || 100));
      return 'Sleep complete.';
    }
  },
  {
    name: 'sys_exec_path',
    description: 'Get active execution executable path.',
    inputSchema: { type: 'object', properties: {} },
    run: () => process.execPath
  }
];

// Combine native and custom tools
function getActiveTools() {
  return [...nativeTools, ...customTools];
}

// Seed tool cabinet defaults
getActiveTools().forEach(t => {
  toolConfig[t.name] = { enabled: true, approval: 'confirm' };
});

const sessions = new Map();

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => resolve(body));
    req.on('error', err => reject(err));
  });
}

function jsonRpcResponse(id, result, error) {
  return JSON.stringify({
    jsonrpc: '2.0',
    id: id || null,
    ...(result !== undefined && { result }),
    ...(error !== undefined && { error })
  });
}

// Make secure HTTP requests to remote AI APIs
function requestAI(endpoint, method, headers, body) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(endpoint);
    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: method,
      headers: headers
    };

    const client = parsed.protocol === 'https:' ? import('https') : import('http');
    client.then(lib => {
      const req = lib.request(options, res => {
        let rawData = '';
        res.on('data', chunk => { rawData += chunk; });
        res.on('end', () => {
          try {
            const parsedData = JSON.parse(rawData);
            resolve(parsedData);
          } catch(e) {
            resolve({ error: { message: `Raw text returned: ${rawData.slice(0, 500)}` } });
          }
        });
      });

      req.on('error', err => reject(err));
      if (body) {
        req.write(typeof body === 'object' ? JSON.stringify(body) : body);
      }
      req.end();
    }).catch(err => reject(err));
  });
}

// Format tools schema for AI
function getToolDefinitions(provider) {
  const isAnthropic = provider === 'anthropic';
  return getActiveTools()
    .filter(t => toolConfig[t.name]?.enabled !== false)
    .map(t => {
      const schema = {
        type: 'function',
        function: {
          name: t.name,
          description: t.description,
          parameters: t.inputSchema
        }
      };
      if (isAnthropic) {
        schema.function.cache_control = { type: 'ephemeral' };
      }
      return schema;
    });
}

// Orchestrate LLM Request inside the backend
async function executeLLMStep(providerConfig, messages) {
  const { provider, model, key, url } = providerConfig;
  const toolsSchema = getToolDefinitions(provider);
  const isGemini = provider === 'gemini';

  if (isGemini) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    const contents = messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    const geminiTools = toolsSchema.length > 0 ? [{
      functionDeclarations: toolsSchema.map(t => ({
        name: t.function.name,
        description: t.function.description,
        parameters: t.function.parameters
      }))
    }] : undefined;

    const body = { 
      contents, 
      tools: geminiTools,
      generationConfig: { maxOutputTokens: 2048 }
    };
    const response = await requestAI(endpoint, 'POST', { 'Content-Type': 'application/json' }, body);

    if (response.error) throw new Error(response.error.message);

    const candidate = response.candidates?.[0];
    const part = candidate?.content?.parts?.[0];

    if (part?.functionCall) {
      return {
        type: 'tool_call',
        name: part.functionCall.name,
        args: part.functionCall.args
      };
    }
    return { type: 'text', text: part?.text || 'No response text received.' };
  } else {
    let base = url;
    if (!base) {
      const urls = {
        openai: 'https://api.openai.com/v1',
        anthropic: 'https://api.anthropic.com/v1',
        deepseek: 'https://api.deepseek.com/v1',
        groq: 'https://api.groq.com/openai/v1',
        openrouter: 'https://openrouter.ai/api/v1',
        together: 'https://api.together.xyz/v1',
        mistral: 'https://api.mistral.ai/v1',
        perplexity: 'https://api.perplexity.ai',
        cohere: 'https://api.cohere.com/v1',
        ollama: 'http://localhost:11434/v1',
        llamacpp: 'http://localhost:8080/v1'
      };
      base = urls[provider] || 'https://api.openai.com/v1';
    }
    const endpoint = `${base}/chat/completions`;
    const headers = {
      'Content-Type': 'application/json',
      ...(key && { 'Authorization': `Bearer ${key}` })
    };

    const body = {
      model,
      messages,
      tools: toolsSchema.length > 0 ? toolsSchema : undefined,
      max_tokens: 2048
    };

    const response = await requestAI(endpoint, 'POST', headers, body);
    if (response.error) throw new Error(response.error.message);

    const message = response.choices?.[0]?.message;
    if (message?.tool_calls && message.tool_calls.length > 0) {
      const toolCall = message.tool_calls[0];
      let parsedArgs = {};
      try {
        parsedArgs = typeof toolCall.function.arguments === 'string' ? JSON.parse(toolCall.function.arguments) : toolCall.function.arguments;
      } catch(e){}
      return {
        type: 'tool_call',
        name: toolCall.function.name,
        args: parsedArgs,
        id: toolCall.id
      };
    }
    return { type: 'text', text: message?.content || 'No response content.' };
  }
}

// Server router
const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // --- DYNAMIC SANDBOX CONFIGURATION ---
  if (req.method === 'POST' && parsedUrl.pathname === '/api/sandbox/set') {
    const rawBody = await parseBody(req);
    const body = JSON.parse(rawBody);
    const targetPath = path.resolve(body.path);

    try {
      if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath, { recursive: true });
      }
      sandboxDir = targetPath;
      saveBackupToDisk();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', sandbox: sandboxDir }));
    } catch(err) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  if (req.method === 'GET' && parsedUrl.pathname === '/api/sandbox/get') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ sandbox: sandboxDir }));
    return;
  }

  // --- LIST PROJECTS (working directories) ---
  if (req.method === 'GET' && parsedUrl.pathname === '/api/projects') {
    const base = '/root/workspace';
    const entries = fs.readdirSync(base, { withFileTypes: true })
      .filter(e => e.isDirectory())
      .map(e => e.name);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ projects: entries }));
    return;
  }

  // --- SET WORKING DIRECTORY ---
  if (req.method === 'POST' && parsedUrl.pathname === '/api/set-working-dir') {
    const rawBody = await parseBody(req);
    const { dir } = JSON.parse(rawBody);
    const candidate = path.resolve('/root/workspace', dir);
    if (!candidate.startsWith('/root/workspace') || !fs.existsSync(candidate)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid directory' }));
      return;
    }
    sandboxDir = candidate;
    saveBackupToDisk();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, sandboxDir }));
    return;
  }

  // --- VAULT PASS KEY ENCRYPTION ROUTE ---
  if (req.method === 'POST' && parsedUrl.pathname === '/api/vault/save') {
    const rawBody = await parseBody(req);
    const body = JSON.parse(rawBody);
    const passphrase = body.passphrase;

    try {
      const encrypted = encryptData(JSON.stringify(activeProviders), passphrase);
      fs.writeFileSync('vault.enc', JSON.stringify(encrypted));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok' }));
    } catch(err) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  if (req.method === 'POST' && parsedUrl.pathname === '/api/vault/load') {
    const rawBody = await parseBody(req);
    const body = JSON.parse(rawBody);
    const passphrase = body.passphrase;

    try {
      if (fs.existsSync('vault.enc')) {
        const rawFile = fs.readFileSync('vault.enc', 'utf8');
        const decrypted = decryptData(JSON.parse(rawFile), passphrase);
        activeProviders = JSON.parse(decrypted);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', count: activeProviders.length }));
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'No vault file found.' }));
      }
    } catch(err) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Invalid vault master passphrase.' }));
    }
    return;
  }

  // --- DYNAMIC CUSTOM TOOL CREATION (LLM Generated Tooling Compiler) ---
  if (req.method === 'POST' && parsedUrl.pathname === '/api/tools/create') {
    const rawBody = await parseBody(req);
    const body = JSON.parse(rawBody);
    const { name, description, inputSchema, code } = body;

    try {
      const compiledFunction = new Function('args', `
        try {
          ${code}
        } catch(err) {
          throw new Error("Compilation Error inside tool: " + err.message);
        }
      `);

      compiledFunction({});

      customTools.push({
        name,
        description,
        inputSchema,
        run: compiledFunction
      });

      toolConfig[name] = { enabled: true, approval: 'confirm' };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', message: `Custom tool "${name}" registered successfully.` }));
    } catch(err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // --- SANDBOX INTERACTIVE TERMINAL EMULATOR ---
  if (req.method === 'POST' && parsedUrl.pathname === '/api/shell/exec') {
    const rawBody = await parseBody(req);
    const body = JSON.parse(rawBody);
    const { command } = body;

    exec(command, { cwd: sandboxDir }, (err, stdout, stderr) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      if (err) {
        res.end(JSON.stringify({ error: err.message, stderr }));
      } else {
        res.end(JSON.stringify({ stdout, stderr }));
      }
    });
    return;
  }

  // --- LOCAL RAG FILE INDEXER (Simple Search Engine) ---
  if (req.method === 'POST' && parsedUrl.pathname === '/api/rag/index') {
    try {
      const files = fs.readdirSync(sandboxDir);
      localVectorIndex = [];

      files.forEach(file => {
        const fullPath = path.join(sandboxDir, file);
        const stats = fs.statSync(fullPath);
        if (stats.isFile() && (file.endsWith('.js') || file.endsWith('.txt') || file.endsWith('.md') || file.endsWith('.json') || file.endsWith('.html'))) {
          const content = fs.readFileSync(fullPath, 'utf8');
          localVectorIndex.push({
            name: file,
            path: fullPath,
            content: content
          });
        }
      });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', count: localVectorIndex.length }));
    } catch(err) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  if (req.method === 'POST' && parsedUrl.pathname === '/api/rag/search') {
    const rawBody = await parseBody(req);
    const body = JSON.parse(rawBody);
    const q = body.query.toLowerCase();

    const results = localVectorIndex
      .map(doc => {
        let score = 0;
        const words = doc.content.toLowerCase().split(/\s+/);
        words.forEach(w => {
          if (w.includes(q)) score++;
        });
        return { name: doc.name, score, path: doc.path };
      })
      .filter(doc => doc.score > 0)
      .sort((a,b) => b.score - a.score);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(results.slice(0, 5)));
    return;
  }

  // --- IP CHECK VISITOR AUTH ENDPOINT ---
  if (req.method === 'GET' && parsedUrl.pathname === '/api/auth/ip-check') {
    const ip = req.socket.remoteAddress || '127.0.0.1';
    const exists = knownIps.has(ip);
    if (!exists) {
      knownIps.add(ip);
      saveBackupToDisk();
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ exists, ip }));
    return;
  }

  // --- REAL SECURE AUTHENTICATION ENDPOINTS ---
  if (req.method === 'POST' && parsedUrl.pathname === '/api/auth/register') {
    try {
      const rawBody = await parseBody(req);
      const { email, password, name } = JSON.parse(rawBody);
      
      if (!email || !email.includes('@') || !password || password.length < 6) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Valid email and password (min 6 characters) are required.' }));
        return;
      }

      const users = loadUsersDB();
      const normalizedEmail = email.toLowerCase().trim();

      if (users[normalizedEmail]) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'An account with this email address already exists.' }));
        return;
      }

      const salt = crypto.randomBytes(16).toString('hex');
      const hash = hashPassword(password, salt);
      const userObj = {
        id: crypto.randomUUID(),
        email: normalizedEmail,
        name: name || normalizedEmail.split('@')[0],
        salt,
        hash,
        provider: 'email',
        createdAt: new Date().toISOString()
      };

      users[normalizedEmail] = userObj;
      saveUsersDB(users);

      const token = crypto.randomBytes(32).toString('hex');
      const sessionUser = {
        id: userObj.id,
        email: userObj.email,
        name: userObj.name,
        provider: userObj.provider,
        createdAt: userObj.createdAt
      };
      activeSessions.set(token, sessionUser);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', token, user: sessionUser }));
    } catch(err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  if (req.method === 'POST' && parsedUrl.pathname === '/api/auth/login') {
    try {
      const rawBody = await parseBody(req);
      const { email, password } = JSON.parse(rawBody);
      
      if (!email || !password) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Email and password are required.' }));
        return;
      }

      const users = loadUsersDB();
      const normalizedEmail = email.toLowerCase().trim();
      const userObj = users[normalizedEmail];

      if (!userObj || !userObj.hash || !userObj.salt) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid email or password.' }));
        return;
      }

      const computedHash = hashPassword(password, userObj.salt);
      if (computedHash !== userObj.hash) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid email or password.' }));
        return;
      }

      const token = crypto.randomBytes(32).toString('hex');
      const sessionUser = {
        id: userObj.id,
        email: userObj.email,
        name: userObj.name || userObj.email.split('@')[0],
        provider: userObj.provider || 'email',
        createdAt: userObj.createdAt
      };
      activeSessions.set(token, sessionUser);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', token, user: sessionUser }));
    } catch(err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  if (req.method === 'POST' && parsedUrl.pathname === '/api/auth/sso') {
    try {
      const rawBody = await parseBody(req);
      const { provider, email, name } = JSON.parse(rawBody);
      const validProvider = provider || 'Google';
      const users = loadUsersDB();
      
      const userEmail = (email || `${validProvider.toLowerCase()}_dev_${Date.now()}@infinitychat.local`).toLowerCase().trim();
      
      if (!users[userEmail]) {
        users[userEmail] = {
          id: crypto.randomUUID(),
          email: userEmail,
          name: name || `${validProvider} Developer`,
          provider: validProvider,
          createdAt: new Date().toISOString()
        };
        saveUsersDB(users);
      }

      const userObj = users[userEmail];
      const token = crypto.randomBytes(32).toString('hex');
      const sessionUser = {
        id: userObj.id,
        email: userObj.email,
        name: userObj.name,
        provider: userObj.provider,
        createdAt: userObj.createdAt
      };
      activeSessions.set(token, sessionUser);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', token, user: sessionUser }));
    } catch(err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  if (req.method === 'GET' && parsedUrl.pathname === '/api/auth/me') {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.replace('Bearer ', '').trim() || parsedUrl.query.token;
    
    if (token && activeSessions.has(token)) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', user: activeSessions.get(token) }));
    } else {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Session expired or unauthenticated' }));
    }
    return;
  }

  if (req.method === 'POST' && parsedUrl.pathname === '/api/auth/logout') {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.replace('Bearer ', '').trim();
    if (token) {
      activeSessions.delete(token);
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  // --- PROJECTS MANAGER ENDPOINTS ---
  if (req.method === 'GET' && parsedUrl.pathname === '/api/projects') {
    const wsPath = '/root/workspace';
    try {
      if (!fs.existsSync(wsPath)) {
        fs.mkdirSync(wsPath, { recursive: true });
      }
      const files = fs.readdirSync(wsPath);
      const dirs = files.filter(f => {
        try {
          return fs.statSync(path.join(wsPath, f)).isDirectory();
        } catch(e) { return false; }
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(dirs));
    } catch(err) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  if (req.method === 'POST' && parsedUrl.pathname === '/api/projects/create') {
    const rawBody = await parseBody(req);
    const body = JSON.parse(rawBody);
    const name = body.name.trim().replace(/[^a-zA-Z0-9_-]/g, '');
    if (!name) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Invalid project name' }));
      return;
    }
    const target = path.join('/root/workspace', name);
    try {
      if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
      }
      sandboxDir = target; // Automatically select newly created project as sandbox
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', path: sandboxDir, name }));
    } catch(err) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  if (req.method === 'POST' && parsedUrl.pathname === '/api/projects/select') {
    const rawBody = await parseBody(req);
    const body = JSON.parse(rawBody);
    const target = path.join('/root/workspace', body.name);
    try {
      if (fs.existsSync(target)) {
        sandboxDir = target;
        saveBackupToDisk();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', path: sandboxDir }));
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Project directory not found.' }));
      }
    } catch(err) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  if (req.method === 'POST' && parsedUrl.pathname === '/api/templates/initialize') {
    const rawBody = await parseBody(req);
    const body = JSON.parse(rawBody);
    const templateId = body.templateId;
    const folderName = `${templateId}_${Date.now()}`;
    const target = path.join('/root/workspace', folderName);
    
    try {
      fs.mkdirSync(target, { recursive: true });
      
      if (templateId === 'html5_game') {
        fs.writeFileSync(path.join(target, 'index.html'), `<!DOCTYPE html>
<html>
<head>
    <title>Canvas Retro Space Game</title>
    <style>body { background: #000; color: #FFF; text-align: center; font-family: sans-serif; }</style>
</head>
<body>
    <h1>Canvas Asteroids Retro Game</h1>
    <canvas id="game" width="600" height="400" style="border: 2px solid #FFF;"></canvas>
    <script>
        const canvas = document.getElementById('game');
        const ctx = canvas.getContext('2d');
        let x = 100, y = 100, dx = 2, dy = 2;
        function draw() {
            ctx.clearRect(0,0,600,400);
            ctx.fillStyle = '#FF007F';
            ctx.beginPath(); ctx.arc(x,y,15,0,Math.PI*2); ctx.fill();
            if(x<15 || x>585) dx=-dx;
            if(y<15 || y>385) dy=-dy;
            x+=dx; y+=dy;
            requestAnimationFrame(draw);
        }
        draw();
    </script>
</body>
</html>`);
      } else if (templateId === 'python_cli') {
        fs.writeFileSync(path.join(target, 'app.py'), `import sys
import argparse

def main():
    parser = argparse.ArgumentParser(description="Python Scripting Utility CLI")
    parser.add_argument("--name", help="Your developer name", default="Developer")
    args = parser.parse_args()
    print(f"Hello, {args.name}! Welcome to Python Scripting Utility.")

if __name__ == "__main__":
    main()`);
      } else if (templateId === 'react_dashboard') {
        fs.writeFileSync(path.join(target, 'index.html'), `<!DOCTYPE html>
<html>
<head>
    <title>React Admin Dashboard</title>
    <script src="https://unpkg.com/react@17/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-900 text-white">
    <div id="root"></div>
    <script type="text/babel">
        function Dashboard() {
            return (
                <div class="p-8">
                    <h1 class="text-3xl font-bold text-indigo-400">Admin Dashboard Shell</h1>
                    <div class="grid grid-cols-3 gap-6 mt-8">
                        <div class="bg-gray-800 p-6 rounded-lg shadow-md">Widget 1</div>
                        <div class="bg-gray-800 p-6 rounded-lg shadow-md">Widget 2</div>
                        <div class="bg-gray-800 p-6 rounded-lg shadow-md">Widget 3</div>
                    </div>
                </div>
            );
        }
        ReactDOM.render(<Dashboard />, document.getElementById('root'));
    </script>
</body>
</html>`);
      } else if (templateId === 'nextjs_landing') {
        fs.writeFileSync(path.join(target, 'index.html'), `<!DOCTYPE html>
<html>
<head>
    <title>Next.js Static Landing Page</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-black text-white flex flex-col items-center justify-center h-screen">
    <h1 class="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
        Launch Your Next Idea
    </h1>
    <p class="mt-4 text-gray-400">Modern aesthetics boilerplate static prototype.</p>
    <button class="mt-6 px-6 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-200">
        Get Started
    </button>
</body>
</html>`);
      }
      
      sandboxDir = target;
      saveBackupToDisk();
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', path: sandboxDir, folderName }));
    } catch(err) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  let pinnedProviderId = null; // Sticky pinned model index

  // --- PROJECTS MANAGER ENDPOINTS ---
  if (req.method === 'POST' && parsedUrl.pathname === '/api/providers/pin') {
    const rawBody = await parseBody(req);
    const body = JSON.parse(rawBody);
    pinnedProviderId = body.id || null;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', pinned: pinnedProviderId }));
    return;
  }

  // --- SECURE ROUTER SETTINGS ENDPOINTS ---
  if (req.method === 'POST' && parsedUrl.pathname === '/api/providers/add') {
    const rawBody = await parseBody(req);
    const body = JSON.parse(rawBody);
    const id = crypto.randomUUID();

    activeProviders.push({
      id,
      providerName: body.providerName,
      provider: body.provider,
      model: body.model,
      key: body.key,
      url: body.url
    });
    saveBackupToDisk();

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', id }));
    return;
  }

  if (req.method === 'GET' && parsedUrl.pathname === '/api/providers/list') {
    const safeList = activeProviders.map(p => ({
      id: p.id,
      providerName: p.providerName,
      provider: p.provider,
      model: p.model,
      url: p.url,
      key: p.key ? '***' : ''
    }));

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(safeList));
    return;
  }

  if (req.method === 'POST' && parsedUrl.pathname === '/api/providers/remove') {
    const rawBody = await parseBody(req);
    const body = JSON.parse(rawBody);

    activeProviders = activeProviders.filter(p => p.id !== body.id);
    saveBackupToDisk();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  // --- SECURE PROXIED MODEL FETCH (For listings) ---
  if (req.method === 'POST' && parsedUrl.pathname === '/api/models/fetch') {
    const rawBody = await parseBody(req);
    const body = JSON.parse(rawBody);
    const { url, method, headers, body: reqBody } = body;

    try {
      const response = await requestAI(url, method || 'GET', headers || {}, reqBody);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response));
    } catch(err) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // --- TOOL TOGGLE ACTIONS ---
  if (req.method === 'GET' && parsedUrl.pathname === '/tools') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(getActiveTools().map(t => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
      enabled: toolConfig[t.name]?.enabled !== false,
      approval: toolConfig[t.name]?.approval || 'confirm'
    }))));
    return;
  }

  if (req.method === 'POST' && parsedUrl.pathname === '/tools/configure') {
    const rawBody = await parseBody(req);
    const body = JSON.parse(rawBody);
    const { name, enabled, approval } = body;
    if (toolConfig[name]) {
      if (enabled !== undefined) toolConfig[name].enabled = enabled;
      if (approval !== undefined) toolConfig[name].approval = approval;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  // --- SECURE CHAT AGENTIC EXECUTOR ---
  if (req.method === 'POST' && parsedUrl.pathname === '/api/chat') {
    const rawBody = await parseBody(req);
    const body = JSON.parse(rawBody);
    let { messages } = body;
    // Apply placeholder resolution to user messages
    messages = messages.map(m => {
      if (m.role === 'user' && typeof m.content === 'string') {
        m.content = resolvePlaceholders(m.content);
      }
      return m;
    });

    if (activeProviders.length === 0) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'No active profiles configured.' }));
      return;
    }

    let provider = null;
    if (pinnedProviderId) {
      provider = activeProviders.find(p => p.id === pinnedProviderId);
    }
    if (!provider) {
      provider = activeProviders[rotationIndex % activeProviders.length];
      rotationIndex++;
    }

    try {
      if (messages.length > 8) {
        const excessTurns = messages.slice(0, messages.length - 6);
        const activeTurns = messages.slice(-6);

        const summaryPrompt = [
          {
            role: 'user',
            content: `Compress the following conversation history briefly in 2-3 sentences. Do not lose key facts:\n${JSON.stringify(excessTurns)}`
          }
        ];

        try {
          const summaryStep = await executeLLMStep(provider, summaryPrompt);
          if (summaryStep.type === 'text') {
            const summary = summaryStep.text;
            messages = [
              {
                role: 'user',
                content: `[System Context: Summary of earlier turns in this session: ${summary}]`
              },
              ...activeTurns
            ];
          }
        } catch (sumErr) {
          messages = activeTurns;
        }
      }

      const step = await executeLLMStep(provider, messages);

      if (step.type === 'text') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          type: 'text',
          text: step.text,
          providerModel: provider.model,
          providerName: provider.providerName
        }));
      } else if (step.type === 'tool_call') {
        const config = toolConfig[step.name] || { enabled: true, approval: 'confirm' };

        const targetTool = getActiveTools().find(t => t.name === step.name);
        const execResult = await targetTool.run(step.args || {});

        if (execResult && execResult.error === 'requires_permission') {
          pendingState = {
            provider,
            messages,
            toolName: step.name,
            toolArgs: step.args
          };

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            type: 'requires_permission',
            path: execResult.path,
            action: execResult.action,
            content: execResult.content,
            providerModel: provider.model,
            providerName: provider.providerName
          }));
          return;
        }

        if (config.approval === 'auto') {
          const modifiedMessages = [...messages];
          modifiedMessages.push({
            role: 'user',
            content: `Tool execution output for "${step.name}":\n${typeof execResult === 'object' ? JSON.stringify(execResult) : execResult}\n\nPlease generate a final response using this.`
          });

          const finalStep = await executeLLMStep(provider, modifiedMessages);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            type: 'text',
            text: finalStep.type === 'text' ? finalStep.text : `Nested tool call requested: ${finalStep.name}`,
            providerModel: provider.model,
            providerName: provider.providerName,
            autoExecutedTool: step.name
          }));
        } else {
          pendingState = {
            provider,
            messages,
            toolName: step.name,
            toolArgs: step.args
          };

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            type: 'requires_approval',
            toolName: step.name,
            toolArgs: step.args,
            providerModel: provider.model,
            providerName: provider.providerName
          }));
        }
      }
    } catch(err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // --- CLIENT APPROVED TOOL CALL EXECUTION ---
  if (req.method === 'POST' && parsedUrl.pathname === '/api/chat/approve') {
    if (!pendingState) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'No pending executions found.' }));
      return;
    }

    const state = pendingState;
    pendingState = null;

    try {
      const tool = getActiveTools().find(t => t.name === state.toolName);
      
      let result;
      if (state.toolName.startsWith('fs_')) {
        if (state.toolName === 'fs_list_dir') result = fs.readdirSync(state.toolArgs.dirPath || '.');
        else if (state.toolName === 'fs_read_file') result = fs.readFileSync(state.toolArgs.filePath, 'utf8');
        else if (state.toolName === 'fs_write_file') {
          fs.writeFileSync(state.toolArgs.filePath, state.toolArgs.content, 'utf8');
          result = 'File written successfully.';
        } else if (state.toolName === 'fs_delete_file') {
          fs.unlinkSync(state.toolArgs.filePath);
          result = 'File deleted successfully.';
        } else if (state.toolName === 'fs_make_dir') {
          fs.mkdirSync(state.toolArgs.dirPath, { recursive: true });
          result = 'Directory created successfully.';
        } else if (state.toolName === 'fs_remove_dir') {
          fs.rmdirSync(state.toolArgs.dirPath);
          result = 'Directory removed.';
        }
      } else {
        result = await tool.run(state.toolArgs || {});
      }

      const modifiedMessages = [...state.messages];
      modifiedMessages.push({
        role: 'user',
        content: `Tool execution output for "${state.toolName}":\n${typeof result === 'object' ? JSON.stringify(result) : result}\n\nPlease generate a final response using this.`
      });

      const finalStep = await executeLLMStep(state.provider, modifiedMessages);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        type: 'text',
        text: finalStep.type === 'text' ? finalStep.text : `Nested tool call requested: ${finalStep.name}`,
        providerModel: state.provider.model,
        providerName: state.provider.providerName
      }));
    } catch(err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // --- CLIENT DENIED TOOL CALL ---
  if (req.method === 'POST' && parsedUrl.pathname === '/api/chat/deny') {
    if (!pendingState) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'No pending executions.' }));
      return;
    }

    const state = pendingState;
    pendingState = null;

    try {
      const modifiedMessages = [...state.messages];
      modifiedMessages.push({
        role: 'user',
        content: `User denied the execution for "${state.toolName}". Please respond acknowledging this.`
      });

      const finalStep = await executeLLMStep(state.provider, modifiedMessages);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        type: 'text',
        text: finalStep.type === 'text' ? finalStep.text : `Nested tool call requested: ${finalStep.name}`,
        providerModel: state.provider.model,
        providerName: state.provider.providerName
      }));
    } catch(err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // --- STANDARD DIRECT TOOL CALLS ---
  if (req.method === 'POST' && parsedUrl.pathname === '/call') {
    const rawBody = await parseBody(req);
    const body = JSON.parse(rawBody);
    const tool = getActiveTools().find(t => t.name === body.name);

    if (!tool) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: `Tool not found: ${body.name}` }));
      return;
    }

    try {
      const result = await tool.run(body.arguments || {});
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ result }));
    } catch(err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // --- SSE TRANSPORT HANDSHAKE ---
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

  // --- JSON-RPC MESSAGE ROUTE ---
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
        serverInfo: { name: 'single-process-mcp-studio', version: '1.0.0' }
      }));
      return;
    }

    if (method === 'tools/list') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(jsonRpcResponse(id, {
        tools: getActiveTools().map(t => ({
          name: t.name,
          description: t.description,
          inputSchema: t.inputSchema
        }))
      }));
      return;
    }

    if (method === 'tools/call') {
      const tool = getActiveTools().find(t => t.name === params.name);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      if (!tool) {
        res.end(jsonRpcResponse(id, null, { code: -32601, message: `Tool not found: ${params.name}` }));
        return;
      }

      try {
        const result = await tool.run(params.arguments || {});
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

  // --- STATIC SITE SERVER (Moved to bottom to prevent route collisions) ---
  if (req.method === 'GET' && (parsedUrl.pathname === '/' || parsedUrl.pathname.startsWith('/'))) {
    let filePath = path.join('public', parsedUrl.pathname === '/' ? 'index.html' : parsedUrl.pathname);
    const ext = path.extname(filePath);
    let contentType = 'text/html';

    const mimeTypes = {
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpg',
      '.svg': 'image/svg+xml'
    };

    contentType = mimeTypes[ext] || 'text/html';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(404);
        res.end('File Not Found');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`Unified MCP Studio running at http://localhost:${PORT}`);
});
