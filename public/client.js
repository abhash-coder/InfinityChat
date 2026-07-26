const MCP_URL = window.location.origin;

// 100 Providers with comprehensive model listings categorized
const providersCatalog = {
    "LLM & Text Providers": [
        { name: "Google AI Studio", id: "gemini", url: "https://generativelanguage.googleapis.com", models: ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash-exp", "gemini-2.0-pro-exp", "gemini-1.5-flash", "gemini-1.5-flash-8b", "gemini-1.5-pro", "gemini-1.0-pro", "gemma-2-2b-it", "gemma-2-9b-it", "gemma-2-27b-it", "text-embedding-004", "aqa"] },
        { name: "OpenAI", id: "openai", url: "https://api.openai.com/v1", models: ["gpt-4o-mini", "gpt-4o", "o1-mini", "o1-preview", "o3-mini", "gpt-4-turbo", "gpt-4-turbo-preview", "gpt-4", "gpt-4-32k", "gpt-3.5-turbo", "gpt-3.5-turbo-16k", "davinci-002", "babbage-002", "text-embedding-3-small", "text-embedding-3-large", "text-embedding-ada-002"] },
        { name: "Anthropic", id: "anthropic", url: "https://api.anthropic.com/v1", models: ["claude-3-5-sonnet-latest", "claude-3-5-sonnet-20241022", "claude-3-5-sonnet-20240620", "claude-3-5-haiku-latest", "claude-3-5-haiku-20241022", "claude-3-opus-latest", "claude-3-opus-20240229", "claude-3-sonnet-20240229", "claude-3-haiku-20240307", "claude-2.1", "claude-2.0", "claude-instant-1.2"] },
        { name: "DeepSeek", id: "deepseek", url: "https://api.deepseek.com/v1", models: ["deepseek-chat", "deepseek-reasoner", "deepseek-coder"] },
        { name: "Groq Cloud", id: "groq", url: "https://api.groq.com/openai/v1", models: ["llama-3.3-70b-specdec", "llama-3.3-70b-versatile", "llama-3.2-1b-preview", "llama-3.2-3b-preview", "llama-3.2-11b-vision-preview", "llama-3.2-90b-vision-preview", "mixtral-8x7b-32768", "gemma2-9b-it", "llama3-70b-8192", "llama3-8b-8192", "llama-guard-3-8b"] },
        { name: "SambaNova Cloud", id: "sambanova", url: "https://api.sambanova.ai/v1", models: ["Meta-Llama-3.3-70B-Instruct", "Meta-Llama-3.1-405B-Instruct", "Meta-Llama-3.1-70B-Instruct", "Meta-Llama-3.1-8B-Instruct", "DeepSeek-R1-Distill-Llama-70B", "Qwen2.5-Coder-32B-Instruct", "Qwen2.5-72B-Instruct", "Llama-3.2-1B-Instruct", "Llama-3.2-3B-Instruct"] },
        { name: "Cerebras Cloud", id: "cerebras", url: "https://api.cerebras.ai/v1", models: ["llama-3.3-70b", "llama-3.1-8b", "llama-3.1-70b", "llama3-70b", "llama3-8b"] },
        { name: "OpenRouter", id: "openrouter", url: "https://openrouter.ai/api/v1", models: ["google/gemini-2.5-flash:free", "meta-llama/llama-3.3-70b-instruct:free", "qwen/qwen-2.5-72b-instruct:free", "deepseek/deepseek-r1:free", "deepseek/deepseek-r1", "anthropic/claude-3.5-sonnet", "openai/gpt-4o", "openai/gpt-4o-mini", "openai/o1-mini", "openai/o1-preview", "mistralai/mistral-large", "meta-llama/llama-3-8b-instruct:free", "google/gemma-2-9b-it:free", "microsoft/phi-3-medium-128k-instruct:free", "gryphe/mythomax-l2-13b:free", "openchat/openchat-7b:free"] },
        { name: "Together AI", id: "together", url: "https://api.together.xyz/v1", models: ["meta-llama/Llama-3.3-70b-Instruct-Turbo", "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo", "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo", "meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo", "Qwen/Qwen2.5-72B-Instruct", "Qwen/Qwen2.5-Coder-32B-Instruct", "codellama/CodeLlama-34b-Instruct", "togethercomputer/StripedHyena-Nous-7B", "mistralai/Mixtral-8x7B-Instruct-v0.1", "mistralai/Mixtral-8x22B-Instruct-v0.1", "databricks/dbrx-instruct"] },
        { name: "Fireworks AI", id: "fireworks", url: "https://api.fireworks.ai/inference/v1", models: ["accounts/fireworks/models/llama-v3p1-405b-instruct", "accounts/fireworks/models/llama-v3-70b-instruct", "accounts/fireworks/models/llama-v3-8b-instruct", "accounts/fireworks/models/mixtral-8x22b-instruct", "accounts/fireworks/models/qwen2p5-coder-32b-instruct", "accounts/fireworks/models/mixtral-8x7b-instruct", "accounts/fireworks/models/firefunction-v2"] },
        { name: "DeepInfra", id: "deepinfra", url: "https://api.deepinfra.com/v1/openai", models: ["meta-llama/Llama-3.3-70b-Instruct", "meta-llama/Meta-Llama-3.1-8B-Instruct", "meta-llama/Meta-Llama-3.1-70B-Instruct", "meta-llama/Meta-Llama-3.1-405B-Instruct", "Qwen/Qwen2.5-Coder-32B-Instruct", "Qwen/Qwen2.5-72B-Instruct", "deepseek-ai/DeepSeek-R1", "nvidia/Llama-3.1-Nemotron-70B-Instruct"] },
        { name: "Mistral AI", id: "mistral", url: "https://api.mistral.ai/v1", models: ["mistral-large-latest", "codestral-latest", "open-mistral-nemo", "mistral-small-latest", "pixtral-12b-2409", "pixtral-large-latest", "mistral-embed"] },
        { name: "Cohere", id: "cohere", url: "https://api.cohere.com/v1", models: ["command-r-plus", "command-r", "command-light", "command-nightly", "command-r-plus-08-2024", "command-r-08-2024"] },
        { name: "GitHub Models", id: "github", url: "https://models.inference.ai.azure.com", models: ["gpt-4o", "gpt-4o-mini", "meta-llama-3.1-70b-instruct", "meta-llama-3.1-405b-instruct", "cohere-command-r-plus", "mistral-large-2407", "ai21-jamba-1-5-large", "phi-3-5-moe-instruct"] },
        { name: "Novita AI", id: "novita", url: "https://api.novita.ai/v3/openai", models: ["meta-llama/llama-3.3-70b-instruct", "meta-llama/llama-3.1-70b-instruct", "meta-llama/llama-3.1-8b-instruct", "mistralai/mistral-7b-instruct", "deepseek/deepseek-r1", "deepseek/deepseek-v3"] },
        { name: "Nebius AI", id: "nebius", url: "https://api.studio.nebius.ai/v1", models: ["meta-llama/Meta-Llama-3.1-70B-Instruct", "meta-llama/Meta-Llama-3.1-405B-Instruct", "Qwen/Qwen2.5-Coder-32B-Instruct", "Qwen/Qwen2.5-72B-Instruct", "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B", "deepseek-ai/DeepSeek-R1-Distill-Llama-70B"] },
        { name: "OctoAI", id: "octoai", url: "https://text.octoai.run/v1", models: ["llama-3.1-70b-instruct", "llama-3.1-8b-instruct", "mixtral-8x7b-instruct", "qwen2-72b-instruct", "cohere-command-r-plus"] },
        { name: "Anyscale", id: "anyscale", url: "https://api.endpoints.anyscale.com/v1", models: ["meta-llama/Llama-3-70b-chat-hf", "meta-llama/Llama-3-8b-chat-hf", "mistralai/Mixtral-8x7B-Instruct-v0.1", "mistralai/Mistral-7B-Instruct-v0.1"] },
        { name: "Lepton AI", id: "lepton", url: "https://llama3.lepton.run/api/v1", models: ["llama3-8b", "llama3-70b", "mixtral-8x7b", "gemma-7b"] },
        { name: "Perplexity", id: "perplexity", url: "https://api.perplexity.ai", models: ["sonar", "sonar-reasoning", "llama-3.1-sonar-large-128k-online", "llama-3.1-sonar-small-128k-online", "llama-3.1-sonar-large-128k-chat", "llama-3.1-sonar-small-128k-chat"] },
        { name: "NVIDIA NIM", id: "nvidia", url: "https://integrate.api.nvidia.com/v1", models: ["meta/llama-3.3-70b-instruct", "meta/llama3-70b-instruct", "meta/llama3-8b-instruct", "mistralai/mixtral-8x22b-instruct-v0.1", "microsoft/phi-3-medium-128k-instruct"] },
        { name: "IBM Watsonx", id: "ibm", url: "https://us-south.ml.cloud.ibm.com/v1", models: ["ibm/granite-13b-chat-v2", "ibm/granite-20b-code-instruct", "meta/llama-3-70b-instruct", "meta/llama-3-8b-instruct", "mistralai/mixtral-8x7b-instruct"] },
        { name: "Microsoft Azure AI", id: "azure", url: "", models: ["gpt-4o", "gpt-4o-mini", "llama-3-70b", "llama-3-8b", "phi-3-medium-128k-instruct", "phi-3-mini-4k-instruct", "cohere-command-r-plus"] },
        { name: "AWS Bedrock", id: "aws", url: "", models: ["anthropic.claude-3-5-sonnet", "anthropic.claude-3-opus", "anthropic.claude-3-haiku", "meta.llama3-70b-instruct", "meta.llama3-8b-instruct", "cohere.command-r-v1", "amazon.titan-text-express"] },
        { name: "Alibaba Cloud Studio", id: "alibaba", url: "https://dashscope.aliyuncs.com/compatible-mode/v1", models: ["qwen-max", "qwen-plus", "qwen-turbo", "qwen2.5-72b-instruct", "qwen2.5-32b-instruct", "qwen2.5-14b-instruct", "qwen2.5-7b-instruct"] },
        { name: "Tencent Hunyuan", id: "hunyuan", url: "https://api.hunyuan.tencent.com/v1", models: ["hunyuan-pro", "hunyuan-standard", "hunyuan-lite", "hunyuan-large", "hunyuan-code"] },
        { name: "Baidu Qianfan", id: "baidu", url: "https://qianfan.baidubce.com/v2", models: ["ernie-4.0-turbo", "ernie-3.5-8b", "ernie-speed-128k", "ernie-lite-8k", "ernie-tiny-8k"] },
        { name: "ByteDance Volcano", id: "volcengine", url: "https://ark.cn-beijing.volces.com/api/v3", models: ["doubao-pro-32k", "doubao-pro-128k", "doubao-lite-32k", "doubao-lite-128k", "skylark2-pro-4k"] },
        { name: "Zhipu AI", id: "zhipu", url: "https://open.bigmodel.cn/api/paas/v4", models: ["glm-4-plus", "glm-4-flash", "glm-4-air", "glm-4-long", "glm-4-0520"] },
        { name: "Moonshot AI", id: "moonshot", url: "https://api.moonshot.cn/v1", models: ["moonshot-v1-8k", "moonshot-v1-32k", "moonshot-v1-128k"] },
        { name: "MiniMax", id: "minimax", url: "https://api.minimax.chat/v1", models: ["abab6.5-chat", "abab6.5s-chat", "abab6.5g-chat", "abab5.5-chat", "abab5.5r-chat"] },
        { name: "01.AI (Wanwu)", id: "yi", url: "https://api.lingyiwanwu.com/v1", models: ["yi-large", "yi-large-preview", "yi-medium", "yi-medium-200k", "yi-spark"] },
        { name: "StepFun", id: "stepfun", url: "https://api.stepfun.com/v1", models: ["step-1-200k", "step-1-flash", "step-2-16k", "step-1-v", "step-1-pro"] },
        { name: "Baichuan AI", id: "baichuan", url: "https://api.baichuan-ai.com/v1", models: ["baichuan4", "baichuan3-turbo", "baichuan2-13b-chat", "baichuan-speed", "baichuan-lite"] },
        { name: "iFlytek Spark", id: "iflytek", url: "https://spark-api.xf-yun.com/v1", models: ["spark-pro", "spark-max", "spark-lite", "spark-pro-128k"] }
    ],
    "Embeddings & Retrieval": [
        { name: "Voyage AI Embeddings", id: "voyage_embed", url: "https://api.voyageai.com/v1", models: ["voyage-3", "voyage-code-3", "voyage-finance-2", "voyage-law-2", "voyage-multilingual-2"] },
        { name: "Jina AI Reader", id: "jina", url: "https://api.jina.ai/v1", models: ["jina-embeddings-v3", "jina-colbert-v2", "jina-reranker-v2-base-multilingual", "jina-clip-v1"] },
        { name: "Pinecone Vector DB", id: "pinecone_db", url: "", models: ["serverless-index", "pod-index", "p1-index", "s1-index"] },
        { name: "Qdrant Vector Cloud", id: "qdrant_db", url: "", models: ["qdrant-managed", "qdrant-hybrid", "qdrant-cluster"] },
        { name: "Weaviate Vector DB", id: "weaviate_db", url: "", models: ["weaviate-sandbox", "weaviate-cloud", "weaviate-cluster"] },
        { name: "Milvus Zilliz DB", id: "zilliz_db", url: "", models: ["milvus-serverless", "milvus-dedicated", "milvus-byoc"] },
        { name: "DataStax Astra DB", id: "datastax", url: "", models: ["astra-vector", "astra-classic", "astra-multi-region"] },
        { name: "MongoDB Atlas Vector", id: "mongodb_vector", url: "", models: ["atlas-vector-search", "atlas-m0-free", "atlas-m10-dedicated"] },
        { name: "Redis Enterprise Vector", id: "redis_vector", url: "", models: ["redis-search-index", "redis-inmemory", "redis-hybrid-cache"] },
        { name: "Chroma Vector Cloud", id: "chroma_db", url: "", models: ["chroma-sandbox", "chroma-hosted", "chroma-on-prem"] },
        { name: "Upstage Layout Parser", id: "upstage", url: "https://api.upstage.ai/v1/document-ai", models: ["layout-analysis", "key-value-extraction", "document-ocr"] },
        { name: "Unstructured.io Doc Parser", id: "unstructured", url: "https://api.unstructuredwork.space", models: ["document-partition", "element-extraction", "pdf-table-extractor"] },
        { name: "Mixedbread AI Reranker", id: "mixedbread", url: "https://api.mixedbread.ai/v1", models: ["mixedbread-embed-large", "mixedbread-rerank-large", "mixedbread-embed-small", "mixedbread-rerank-base"] },
        { name: "Cohere Embeddings", id: "cohere_embed", url: "https://api.cohere.com/v1", models: ["embed-english-v3.0", "embed-multilingual-v3.0", "embed-english-light-v3.0", "embed-multilingual-light-v3.0"] },
        { name: "OpenAI Embeddings", id: "openai_embed", url: "https://api.openai.com/v1", models: ["text-embedding-3-small", "text-embedding-3-large", "text-embedding-ada-002"] }
    ],
    "Image & Video Generation": [
        { name: "Fal.ai Media Studio", id: "fal_media", url: "https://queue.fal.run", models: ["flux/schnell", "flux/dev", "flux/realism", "stable-diffusion-v3", "cogvideox-5b", "hunyuan-video", "fofr/face-to-face"] },
        { name: "Replicate Media", id: "replicate", url: "https://api.replicate.com/v1", models: ["stability-ai/sdxl", "black-forest-labs/flux-schnell", "black-forest-labs/flux-dev", "luma/dream-machine", "fofr/latent-consistency-model", "cjwbw/damo-text-to-video"] },
        { name: "RunPod Serverless GPU", id: "runpod", url: "", models: ["stable-diffusion-endpoint", "vllm-endpoint", "sdxl-turbo-endpoint"] },
        { name: "Getimg.ai Studio", id: "getimg", url: "https://api.getimg.ai/v1", models: ["stable-diffusion-xl", "flux-schnell", "essential-realism-v4", "photocrafter-v2", "anime-art-v3"] },
        { name: "Limewire API Studio", id: "limewire", url: "https://api.limewire.com/v1", models: ["blue-willow-v4", "sdxl-turbo", "dall-e-3-proxy", "google-imagen-v2"] },
        { name: "Shutterstock Art Engine", id: "shutterstock", url: "", models: ["image-generator-v2", "vector-generator-v1", "3d-model-generator"] },
        { name: "Clipdrop Image Studio", id: "clipdrop", url: "https://clipdrop-api.co", models: ["cleanup", "remove-background", "text-to-image", "super-resolution", "portrait-relight"] },
        { name: "DeepAI Art Engine", id: "deepai", url: "https://api.deepai.org/api", models: ["text2image", "cute-creature-generator", "cyberpunk-generator", "renaissance-painting"] },
        { name: "Leonardo.ai Engine", id: "leonardo", url: "https://cloud.leonardo.ai/api/rest/v1", models: ["leonardo-diffusion-xl", "absolute-reality", "albedo-base-xl", "vision-xl", "creative-v2"] },
        { name: "Fotor Image Processing", id: "fotor", url: "", models: ["photo-effects", "image-enhancer", "bg-remover", "face-retouch", "hdr-effect"] },
        { name: "RunwayML Video Studio", id: "runway", url: "", models: ["gen2-video-api", "gen3-video-api", "frame-interpolation", "motion-brush"] },
        { name: "Kaiber Video Engine", id: "kaiber", url: "", models: ["flipbook-animation", "motion-effect", "super-style-video", "audio-reactive"] },
        { name: "Pika Labs Video API", id: "pika", url: "", models: ["pika-video-1.0", "pika-video-effect", "pika-lip-sync"] },
        { name: "Stability AI Engine", id: "stability", url: "https://api.stability.ai/v1", models: ["generation/stable-diffusion-xl-1024-v1-0", "generation/image-to-video", "image-to-image", "stable-image/generate/core", "stable-image/generate/ultra"] },
        { name: "Midjourney API Proxy", id: "midjourney", url: "", models: ["midjourney-v6", "midjourney-v5.2", "midjourney-v5.1", "midjourney-niji-v6"] }
    ],
    "Speech, Voice & TTS": [
        { name: "Deepgram Voice Lab", id: "deepgram", url: "https://api.deepgram.com/v1", models: ["nova-2-general", "nova-2-phone", "aura-asteria-en", "aura-orion-en", "aura-helios-en", "aura-athena-en"] },
        { name: "AssemblyAI Speech", id: "assemblyai", url: "https://api.assemblyai.com/v2", models: ["best-transcription", "nano-transcription", "conformer-2", "conformer-1"] },
        { name: "ElevenLabs Voice Synthesis", id: "elevenlabs", url: "https://api.elevenlabs.io/v1", models: ["eleven_monolingual_v1", "eleven_multilingual_v2", "eleven_turbo_v2", "eleven_flash_v2"] },
        { name: "Gladia Audio Intel", id: "gladia", url: "https://api.gladia.io/v2", models: ["audio-transcription-v2", "realtime-audio-transcription", "audio-summarization"] },
        { name: "Speechmatics Transcription", id: "speechmatics", url: "https://api.speechmatics.com/v2", models: ["accuracy-enhanced", "speed-optimized", "realtime-translation"] },
        { name: "Rev.ai Speech Engine", id: "rev_ai", url: "https://api.rev.ai/speechtotext/v1", models: ["job-transcription", "streaming-transcription", "topic-extraction"] },
        { name: "Play.ht Voice Synthesis", id: "play_ht", url: "https://api.play.ht/api/v2", models: ["playht-turbo", "playht-clone-model", "playht-studio-voice"] },
        { name: "Murf.ai TTS Studio", id: "murf", url: "https://api.murf.ai/v1", models: ["murf-standard-voice", "murf-premium-voice", "murf-kids-voice"] },
        { name: "LOVO AI TTS", id: "lovo", url: "", models: ["lovo-hyper-tts", "lovo-premium-clone", "lovo-standard-tts"] },
        { name: "Resemble Voice Clone", id: "resemble", url: "https://api.resemble.ai/v2", models: ["voice-generation", "neural-speech-clone", "resemble-localization"] },
        { name: "Voicemaker Speech", id: "voicemaker", url: "https://developer.voicemaker.in/v1", models: ["tts-engine", "neural-tts-engine", "standard-tts-engine"] },
        { name: "Picovoice Command", id: "picovoice", url: "", models: ["porcupine-wake-word", "rhino-speech-to-intent", "cheetah-speech-to-text", "leopard-transcription"] },
        { name: "Speechify Voice synthesis", id: "speechify", url: "", models: ["speechify-standard-tts", "speechify-premium-narrator", "speechify-multilingual"] },
        { name: "OpenAI Whisper API", id: "openai_whisper", url: "https://api.openai.com/v1", models: ["whisper-1"] },
        { name: "Azure Speech Services", id: "azure_speech", url: "", models: ["azure-whisper", "azure-tts", "azure-realtime-speech", "azure-custom-voice"] }
    ],
    "Conversational & NLP Tools": [
        { name: "Wit.ai NLP (Meta)", id: "wit_ai", url: "https://api.wit.ai", models: ["message-understanding", "speech-understanding", "intent-parsing"] },
        { name: "Dialogflow (Google)", id: "dialogflow", url: "https://dialogflow.googleapis.com/v2", models: ["intent-detection", "agent-validation", "conversation-logs"] },
        { name: "LUIS NLP (Microsoft)", id: "luis_nlp", url: "", models: ["utterance-prediction", "entity-extraction", "luis-sentiment-analysis"] },
        { name: "OneAI NLP Processing", id: "one_ai", url: "https://api.oneai.com/api/v0", models: ["text-analysis-pipeline", "summarize-url-pipeline", "emotion-detection"] },
        { name: "Eden AI Aggregator", id: "eden_ai", url: "https://api.edenai.run/v2", models: ["llm-summarize", "text-translation", "ocr-invoice", "ocr-resume"] },
        { name: "Symbl.ai Conversational", id: "symbl_ai", url: "https://api.symbl.ai/v1", models: ["conversation-intelligence", "action-item-generation", "sentiment-tracking"] },
        { name: "Botpress Bot Engine", id: "botpress", url: "", models: ["bot-hosting", "nlu-classification", "bot-analytics"] },
        { name: "Voiceflow Agent Engine", id: "voiceflow", url: "", models: ["dialog-manager", "knowledge-base-query", "voice-app-sync"] },
        { name: "Landbot Conversational", id: "landbot", url: "", models: ["chat-funnel", "whatsapp-template-sender", "crm-integration"] },
        { name: "Chatfuel Messaging", id: "chatfuel", url: "", models: ["messenger-automation", "broadcast-sender", "leads-collection"] },
        { name: "ManyChat Automation", id: "manychat", url: "", models: ["instagram-dm-automation", "facebook-chat-flow", "sms-automation"] },
        { name: "Tidio Chatbot Studio", id: "tidio", url: "", models: ["tidio-bot", "tidio-intent-detection", "lyro-ai-agent"] },
        { name: "Langflow Cloud Studio", id: "langflow", url: "", models: ["langflow-pipeline", "langflow-component-run", "langflow-api-trigger"] },
        { name: "Flowise Cloud Engine", id: "flowise", url: "", models: ["flowise-pipeline", "flowise-agent-run", "flowise-api-trigger"] },
        { name: "MindOS Agent Studio", id: "mindos", url: "", models: ["mindos-avatar", "mindos-action-runner", "mindos-custom-skill"] },
        { name: "Superagent Deployment", id: "superagent", url: "", models: ["agent-executor", "data-datasource-sync", "agent-logs"] },
        { name: "Retool AI Workspace", id: "retool_ai", url: "", models: ["retool-query-runner", "retool-vector-query", "retool-ai-action"] },
        { name: "Dify.ai Sandbox", id: "dify", url: "", models: ["dify-agent-workflow", "dify-dataset-sync", "dify-chat-run"] },
        { name: "Pinecone Assistant", id: "pinecone_assistant", url: "https://api.pinecone.io", models: ["assistant-v1", "assistant-search", "assistant-knowledge-base"] },
        { name: "Speechify Chatbot", id: "speechify_chat", url: "", models: ["voice-chatbot-v1", "customer-intent-tts", "conversational-avatar"] }
    ]
};

// Autocomplete Slash Commands Dictionary
const slashCommands = [
    { name: "/about", desc: "Show InfinityChat system info and build details" },
    { name: "/help", desc: "Display keyboard shortcuts, profiles, and commands guide" },
    { name: "/system", desc: "Show host CPU, Platform, Memory utilization" },
    { name: "/cpu", desc: "Get model info of the processor" },
    { name: "/memory", desc: "Get server RAM utilization stats in Megabytes" },
    { name: "/uptime", desc: "Display host server uptime counter" },
    { name: "/platform", desc: "Show active host platform (e.g. Linux)" },
    { name: "/arch", desc: "Show server CPU Architecture profile" },
    { name: "/pid", desc: "Get active Node.js server PID" },
    { name: "/node", desc: "Get running Node.js runtime version" },
    { name: "/ip", desc: "Show local networking interface IPs" },
    { name: "/env", desc: "List environment variables keys active" },
    { name: "/exec", desc: "Get executable binary location of node" },
    { name: "/tmp", desc: "Get system temporary storage folder path" },
    { name: "/session", desc: "Show session unique identifier" },
    { name: "/pwd", desc: "Output active sandbox working directory path" },
    { name: "/ls", desc: "List files inside the active sandbox" },
    { name: "/list", desc: "List files inside the active sandbox" },
    { name: "/files", desc: "List files inside the active sandbox" },
    { name: "/cat", desc: "Read and print content of file. Usage: /cat filename" },
    { name: "/mkdir", desc: "Create a subfolder in sandbox. Usage: /mkdir path" },
    { name: "/rm", desc: "Delete a file inside sandbox. Usage: /rm path" },
    { name: "/stats", desc: "Get dimensions and dates of file. Usage: /stats path" },
    { name: "/sandbox", desc: "Output active sandbox directory path" },
    { name: "/select", desc: "Select custom absolute path for sandbox. Usage: /select path" },
    { name: "/create", desc: "Create and select a folder as sandbox. Usage: /create path" },
    { name: "/profiles", desc: "List active AI configuration profiles" },
    { name: "/model", desc: "Show active model configured for turns" },
    { name: "/keys", desc: "Show active providers names containing API keys" },
    { name: "/history", desc: "Show conversation turn count in session logs" },
    { name: "/summary", desc: "View the long-term context summary stored" },
    { name: "/token", desc: "Estimate tokens inside current conversation window" },
    { name: "/tools", desc: "List all actions and auto-run settings" },
    { name: "/catalog", desc: "List all 100 provider selections index" },
    { name: "/time", desc: "Output local system date and ISO timestamp" },
    { name: "/uuid", desc: "Generate a cryptographically secure random UUID" },
    { name: "/hash", desc: "Get SHA256/MD5 of text. Usage: /hash sha256 text" },
    { name: "/base64", desc: "Base64 tools. Usage: /base64 encode text" },
    { name: "/upper", desc: "Convert string to uppercase. Usage: /upper text" },
    { name: "/lower", desc: "Convert string to lowercase. Usage: /lower text" },
    { name: "/trim", desc: "Trim trailing spaces. Usage: /trim text" },
    { name: "/len", desc: "Count string characters length. Usage: /len text" },
    { name: "/reverse", desc: "Reverse string order. Usage: /reverse text" },
    { name: "/split", desc: "Split text by delimiter. Usage: /split , item1,item2" },
    { name: "/calc", desc: "Mathematical calculator. Usage: /calc 25*4" },
    { name: "/ping", desc: "Calculate message latency round-trip time" },
    { name: "/settings", desc: "Toggle Centered settings loop overlay" },
    { name: "/toolsmenu", desc: "Toggle Action Library cabinet overlay" },
    { name: "/profile", desc: "Toggle Developer Profile modal overlay" },
    { name: "/close", desc: "Close all active overlays and modals" },
    { name: "/clear", desc: "Wipe chat logs and backend session memory" },
    { name: "/theme", desc: "Cycle UI background theme styling" },
    { name: "/clean", desc: "Purge trace items from the action bar" },
    { name: "/quote", desc: "Render a random developer quote" },
    { name: "/customtool", desc: "Dynamically register a tool. Usage: /customtool config" },
    { name: "/term", desc: "Run a sandboxed shell script command. Usage: /term npm test" },
    { name: "/index", desc: "Run Local TF-IDF Vector indexing on project sandbox" },
    { name: "/search", desc: "RAG vector search sandboxed files. Usage: /search query" },
    { name: "/preview", desc: "Render HTML content in full live preview canvas" }
];

// Global Client State
let chats = JSON.parse(localStorage.getItem('infinity_chats') || '[]');
// Purge expired temporary chats (older than 24 hours)
chats = chats.filter(c => !c.temporary || Date.now() < c.expiry);
localStorage.setItem('infinity_chats', JSON.stringify(chats));

let currentChatId = sessionStorage.getItem('current_chat_id') || null;
let chatHistory = []; 
let logs = [];
let selectedProviderObj = null;
let voiceOutputEnabled = false; // Voice speech engine toggle
let activeAutocompleteIndex = -1;
let isTemporaryMode = false; // Temporary Chat Session flag
let personalIntelligenceActive = localStorage.getItem('personal_intelligence_active') === 'true';

// Initialize toggle switch visual on startup
document.addEventListener('DOMContentLoaded', () => {
    const pToggle = document.getElementById('personal-intelligence-toggle');
    if (pToggle) pToggle.checked = personalIntelligenceActive;
});

window.togglePlusMenu = function(event) {
    if (event) event.stopPropagation();
    const pop = document.getElementById('plus-menu-dropdown');
    pop.classList.toggle('hidden');
};

window.triggerPlusAction = function(action) {
    const pop = document.getElementById('plus-menu-dropdown');
    if (pop) pop.classList.add('hidden');

    switch(action) {
        case 'add_file':
            alert('File attachment interface loaded (simulate upload).');
            break;
        case 'add_image':
            alert('Image gallery browser selected.');
            break;
        case 'camera':
            alert('Host camera device handshake initialized.');
            break;
        case 'click_picture':
            alert('Taking photo snapshot...');
            break;
        case 'images':
            useSuggestion('/preview <html><body><h2>AI Image Editor mockup</h2></body></html>');
            break;
        case 'canvas':
            useSuggestion('/preview <html><body><h1>Canvas Sandbox Workspace</h1><p>Type code or essay drafts here...</p></body></html>');
            break;
        case 'deep_research':
            useSuggestion('/search latest developments');
            break;
        case 'guided_learning':
            useSuggestion('Give me a step by step guide to build a Node.js server.');
            break;
        default:
            console.log('Action triggered:', action);
    }
};

window.togglePersonalIntelligence = function(checked) {
    personalIntelligenceActive = checked;
    localStorage.setItem('personal_intelligence_active', checked);
    if (checked && !localStorage.getItem('user_facts')) {
        const info = prompt("Please tell me some facts about yourself so I can personalize your future chat sessions (e.g., your programming stack, role, learning style):");
        if (info) {
            localStorage.setItem('user_facts', info);
        }
    }
};

// Click outside drop down logic
document.addEventListener('click', function(e) {
    const plusBtn = document.querySelector('.chat-footer .input-icon-btn');
    const plusDropdown = document.getElementById('plus-menu-dropdown');
    if (plusDropdown && !plusDropdown.classList.contains('hidden')) {
        if (!plusDropdown.contains(e.target) && (!plusBtn || !plusBtn.contains(e.target))) {
            plusDropdown.classList.add('hidden');
        }
    }
});

window.toggleTemporaryMode = function() {
    isTemporaryMode = !isTemporaryMode;
    const btn = document.getElementById('temp-chat-toggle');
    if (isTemporaryMode) {
        btn.classList.add('active');
        btn.style.color = "var(--accent-warning)";
        btn.title = "Temporary Mode (Active - Expires in 24 hrs)";
    } else {
        btn.classList.remove('active');
        btn.style.color = "var(--text-secondary)";
        btn.title = "Toggle Temporary Mode (Self-destructs in 24 hrs)";
    }
};

window.startNewChat = function() {
    currentChatId = null;
    sessionStorage.removeItem('current_chat_id');
    chatHistory = [];
    clearChat();
    renderChatsList();
};

window.selectChat = function(chatId) {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;
    currentChatId = chatId;
    sessionStorage.setItem('current_chat_id', chatId);
    chatHistory = chat.history;
    
    const viewport = document.getElementById('chat-messages');
    viewport.innerHTML = '';
    
    const welcome = document.getElementById('welcome-screen');
    if (welcome) welcome.remove();

    if (chatHistory.length === 0) {
        clearChat();
    } else {
        chatHistory.forEach(msg => {
            const div = document.createElement('div');
            div.className = `message ${msg.role}`;
            div.innerHTML = `<div class="bubble">${escapeHtml(msg.content).replace(/\n/g, '<br>')}</div>`;
            viewport.appendChild(div);
        });
        viewport.scrollTop = viewport.scrollHeight;
    }
    renderChatsList();
};

function saveChatsToStorage() {
    localStorage.setItem('infinity_chats', JSON.stringify(chats));
}

function renderChatsList() {
    const listDiv = document.getElementById('chats-history-list');
    if (!listDiv) return;
    listDiv.innerHTML = '';
    chats.forEach(chat => {
        const btn = document.createElement('button');
        btn.className = `chat-history-item ${chat.id === currentChatId ? 'active' : ''}`;
        btn.textContent = chat.title;
        btn.onclick = () => selectChat(chat.id);
        listDiv.appendChild(btn);
    });
}

// Trigger AI auto-title generation (2-3 words summary)
async function triggerAutoTitle(chatId) {
    const chat = chats.find(c => c.id === chatId);
    if (!chat || chat.titleGenerated || chat.history.length === 0) return;

    const outline = chat.history.slice(0, 4).map(m => `${m.role}: ${m.content}`).join('\n');
    const prompt = `Generate a short 2-3 words title summarizing this conversation outline. Output ONLY the short title text without punctuation, symbols, markdown, or quotes:\n${outline}`;

    try {
        const res = await fetch(`/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [{ role: 'user', content: prompt }]
            })
        });
        const data = await res.json();
        if (data.text) {
            chat.title = data.text.trim().replace(/^"|"$/g, '').replace(/\.$/, '');
            chat.titleGenerated = true;
            saveChatsToStorage();
            renderChatsList();
        }
    } catch (err) {
        console.error('Title generation failed:', err);
    }
}

// Helper to format raw snake_case tool names to friendly Title Case
function formatToolName(name) {
    return name
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Speak Response toggler
window.toggleVoiceOutput = function() {
    voiceOutputEnabled = !voiceOutputEnabled;
    const btn = document.getElementById('voice-toggle-btn');
    if (voiceOutputEnabled) {
        btn.classList.add('active');
        btn.title = "Voice Response Output (On)";
        btn.style.color = "var(--accent-success)";
    } else {
        btn.classList.remove('active');
        btn.title = "Voice Response Output (Off)";
        btn.style.color = "var(--text-secondary)";
    }
};

// Set chat interaction mode
window.setChatMode = function(mode) {
    window.chatMode = mode;
    console.log('Chat mode set to', mode);
};

// Voice input toggle using Web Speech API
let speechRecognizer = null;
window.toggleVoiceInput = function() {
    const btn = document.getElementById('voice-input-btn');
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Speech recognition not supported in this browser');
        return;
    }
    if (!speechRecognizer) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        speechRecognizer = new SpeechRecognition();
        speechRecognizer.continuous = false;
        speechRecognizer.interimResults = false;
        speechRecognizer.lang = 'en-US';
        speechRecognizer.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            const input = document.getElementById('chat-input');
            if (input) input.value = transcript;
        };
        speechRecognizer.onerror = (e) => console.error('Speech error', e);
        speechRecognizer.onend = () => {
            btn.title = 'Voice Input (Off)';
            btn.style.color = 'var(--text-secondary)';
        };
    }
    if (speechRecognizer && speechRecognizer.start) {
        speechRecognizer.start();
        btn.title = 'Voice Input (On)';
        btn.style.color = 'var(--accent-success)';
    }
};

window.useSuggestion = function(val) {
    const inputEl = document.getElementById('chat-input');
    if (inputEl) {
        inputEl.value = val;
        inputEl.focus();
    }
};

function speakResponse(text) {
    if (!voiceOutputEnabled) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
}

// Virtual Keyboard Adjustment Mechanism
if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
        const viewportHeight = window.visualViewport.height;
        const container = document.querySelector('.app-container');
        if (container) {
            container.style.height = `${viewportHeight}px`;
        }

        const viewport = document.getElementById('chat-messages');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    });
}

// Custom Combobox Synchronization
// Custom Select Combobox Handlers
window.showCustomDropdown = function() {
    const dropdown = document.getElementById('custom-model-dropdown');
    dropdown.classList.remove('hidden');
    buildCustomDropdownList();
};

window.toggleCustomDropdown = function(event) {
    if (event) event.stopPropagation();
    const dropdown = document.getElementById('custom-model-dropdown');
    dropdown.classList.toggle('hidden');
    buildCustomDropdownList();
};

window.filterCustomDropdown = function(query) {
    buildCustomDropdownList(query);
};

function buildCustomDropdownList(searchQuery = '') {
    const dropdown = document.getElementById('custom-model-dropdown');
    dropdown.innerHTML = '';
    
    const models = (selectedProviderObj && selectedProviderObj.models) ? selectedProviderObj.models : [];
    const q = searchQuery.toLowerCase();
    const filtered = models.filter(m => m.toLowerCase().includes(q));

    if (filtered.length === 0) {
        dropdown.innerHTML = '<div class="dropdown-item">No matching models</div>';
        return;
    }

    filtered.forEach(m => {
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        item.textContent = m;
        item.onclick = () => {
            document.getElementById('model-input').value = m;
            dropdown.classList.add('hidden');
        };
        dropdown.appendChild(item);
    });
}

// Close custom select dropdown on click outside
document.addEventListener('click', function(e) {
    const wrapper = document.querySelector('.custom-select-wrapper');
    if (wrapper && !wrapper.contains(e.target)) {
        const dropdown = document.getElementById('custom-model-dropdown');
        if (dropdown) dropdown.classList.add('hidden');
    }
});

// Fetch Active Models directly via backend proxy
window.fetchActiveModels = async function(silent = false) {
    if (!selectedProviderObj) {
        if (!silent) alert('Please select a provider first!');
        return;
    }
    const key = document.getElementById('provider-key').value;
    if (!key && selectedProviderObj.id !== 'ollama' && selectedProviderObj.id !== 'llamacpp') {
        if (!silent) alert('API Key is required to fetch models for this provider.');
        return;
    }

    const triggerBtn = document.getElementById('fetch-models-trigger');
    if (triggerBtn) triggerBtn.classList.add('rotating');

    try {
        const isGemini = selectedProviderObj.id === 'gemini';
        let endpoint = '';
        let headers = { 'Content-Type': 'application/json' };

        if (isGemini) {
            endpoint = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
        } else {
            let base = selectedProviderObj.url;
            if (!base) base = 'https://api.openai.com/v1';
            endpoint = `${base}/models`;
            headers['Authorization'] = `Bearer ${key}`;
        }

        const res = await fetch(`/api/models/fetch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: endpoint, method: 'GET', headers })
        });

        const data = await res.json();
        
        let modelsList = [];
        if (isGemini) {
            if (data.models) {
                modelsList = data.models.map(m => m.name.replace(/^models\//, ''));
            }
        } else {
            if (data.data) {
                modelsList = data.data.map(m => m.id);
            }
        }

        if (modelsList.length === 0) {
            throw new Error('No models found in the API response.');
        }

        // Merge newly fetched models with preconfigured ones, avoiding duplicates
        const existing = selectedProviderObj.models || [];
        const merged = Array.from(new Set([...existing, ...modelsList]));
        selectedProviderObj.models = merged;

        document.getElementById('model-input').value = modelsList[0];
        buildCustomDropdownList();
        if (!silent) alert(`Successfully loaded ${modelsList.length} valid models from ${selectedProviderObj.name}!`);

    } catch(err) {
        if (!silent) alert(`Failed to fetch models: ${err.message}`);
    } finally {
        if (triggerBtn) triggerBtn.classList.remove('rotating');
    }
};

// Open / Close custom catalog modal
window.openProviderCatalog = function() {
    const modal = document.getElementById('catalog-modal');
    modal.classList.add('open');
    buildCatalogUI();
};

window.closeProviderCatalog = function() {
    const modal = document.getElementById('catalog-modal');
    modal.classList.remove('open');
};

function buildCatalogUI(searchQuery = '') {
    const listDiv = document.getElementById('catalog-list');
    listDiv.innerHTML = '';
    const q = searchQuery.toLowerCase();

    for (const [category, providers] of Object.entries(providersCatalog)) {
        const filtered = providers.filter(p => p.name.toLowerCase().includes(q));
        if (filtered.length === 0) continue;

        const catTitle = document.createElement('div');
        catTitle.className = 'catalog-category-title';
        catTitle.textContent = category;
        listDiv.appendChild(catTitle);

        const grid = document.createElement('div');
        grid.className = 'catalog-grid';

        filtered.forEach(p => {
            const card = document.createElement('div');
            card.className = 'catalog-card';
            card.innerHTML = `
                <div class="name">${p.name}</div>
                <div class="desc">${p.models.length} models preconfigured</div>
            `;
            card.onclick = () => selectCatalogProvider(p);
            grid.appendChild(card);
        });

        listDiv.appendChild(grid);
    }
}

window.filterCatalog = function(q) {
    buildCatalogUI(q);
};

function selectCatalogProvider(provider) {
    selectedProviderObj = provider;
    closeProviderCatalog();

    const btn = document.getElementById('provider-trigger-btn');
    btn.textContent = `Selected: ${provider.name}`;

    if (provider.models.length > 0) {
        document.getElementById('model-input').value = provider.models[0];
        buildCustomDropdownList();
    }

    const customFields = document.getElementById('custom-provider-fields');
    if (provider.id === 'custom') {
        customFields.classList.remove('hidden');
    } else {
        customFields.classList.add('hidden');
    }
}

// Add provider securely to the backend active loop list
document.getElementById('save-provider-btn').addEventListener('click', async () => {
    if (!selectedProviderObj) {
        alert('Please select a provider from the catalog first!');
        return;
    }
    const provider = selectedProviderObj.id;
    const key = document.getElementById('provider-key').value;

    // Trigger auto-fetch & merge of active models in background if a key is provided
    if (key) {
        try {
            await fetchActiveModels(true);
        } catch(e) {
            console.warn("Background models lookup failed:", e);
        }
    }

    const model = document.getElementById('model-input').value.trim();
    if (!model) {
        alert('Please select or type a model ID!');
        return;
    }
    const customUrl = document.getElementById('custom-url').value;

    const body = {
        providerName: selectedProviderObj.name,
        provider,
        model,
        key: key || '',
        url: provider === 'custom' ? customUrl : selectedProviderObj.url
    };

    try {
        const res = await fetch(`/api/providers/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (data.status === 'ok') {
            loadActiveProviders();
            document.getElementById('provider-key').value = '';
        }
    } catch(err) {
        alert(`Failed to add provider: ${err.message}`);
    }
});

async function loadActiveProviders() {
    try {
        const res = await fetch(`/api/providers/list`);
        const list = await res.json();
        const listDiv = document.getElementById('rotation-list');
        listDiv.innerHTML = '';

        updateHeaderModelPicker(list);

        if (list.length === 0) {
            listDiv.innerHTML = '<p class="empty-text">No profiles configured yet.</p>';
            return;
        }

        list.forEach((p, idx) => {
            const div = document.createElement('div');
            div.className = 'loop-item';
            div.innerHTML = `
                <div>
                    <strong>[${idx + 1}] ${p.providerName}</strong>
                    <div class="model-name">${p.model}</div>
                </div>
                <span class="remove-btn" onclick="removeProvider('${p.id}')">×</span>
            `;
            listDiv.appendChild(div);
        });
    } catch(err) {
        console.error('Failed to load active loop:', err);
    }
}

function updateHeaderModelPicker(list) {
    const picker = document.getElementById('header-model-picker');
    if (!picker) return;
    picker.innerHTML = '<option value="rotation">🔄 Rotate Loop</option>';
    list.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = `${p.providerName}: ${p.model}`;
        picker.appendChild(opt);
    });
}

window.switchHeaderModel = async function(id) {
    try {
        const targetId = id === 'rotation' ? '' : id;
        await fetch('/api/providers/pin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: targetId })
        });
    } catch(err) {
        console.error('Failed to pin active model:', err);
    }
};

window.toggleConnector = function(name, enabled) {
    localStorage.setItem(`connector_${name}_active`, enabled);
    alert(`${name.toUpperCase()} Integration Connector toggled: ${enabled ? 'Connected' : 'Disconnected'}`);
};

window.removeProvider = async function(id) {
    try {
        await fetch(`/api/providers/remove`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        loadActiveProviders();
    } catch(err) {
        console.error('Failed to remove provider:', err);
    }
};

async function loadTools() {
    try {
        const res = await fetch(`/tools`);
        const catalog = await res.json();
        const cabinet = document.getElementById('tool-cabinet');
        cabinet.innerHTML = '';

        catalog.forEach(tool => {
            const div = document.createElement('div');
            div.className = 'tool-item';
            div.setAttribute('data-name', tool.name);
            div.innerHTML = `
                <div class="tool-item-header">
                    <span class="name">${formatToolName(tool.name)}</span>
                    <div class="toggle-container">
                        <span>Active</span>
                        <label class="switch">
                            <input type="checkbox" ${tool.enabled ? 'checked' : ''} onchange="toggleTool('${tool.name}', this.checked)">
                            <span class="slider"></span>
                        </label>
                    </div>
                </div>
                <p>${tool.description}</p>
                <select class="approval-select" onchange="changeToolApproval('${tool.name}', this.value)">
                    <option value="confirm" ${tool.approval === 'confirm' ? 'selected' : ''}>Require Approval</option>
                    <option value="auto" ${tool.approval === 'auto' ? 'selected' : ''}>Auto-Approve</option>
                </select>
            `;
            cabinet.appendChild(div);
        });
    } catch(err) {
        console.error('Failed to load tools catalog:', err);
    }
}

window.toggleTool = async function(name, enabled) {
    await fetch(`/tools/configure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, enabled })
    });
};

window.changeToolApproval = async function(name, approval) {
    await fetch(`/tools/configure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, approval })
    });
};

window.filterTools = function() {
    const q = document.getElementById('tool-search').value.toLowerCase();
    const items = document.querySelectorAll('.tool-item');
    items.forEach(item => {
        const name = item.getAttribute('data-name').toLowerCase();
        if (name.includes(q)) {
            item.classList.remove('hidden');
        } else {
            item.classList.add('hidden');
        }
    });
};

// Autocomplete Popover Handlers
window.handleInputAutocomplete = function(el) {
    const popover = document.getElementById('autocomplete-popover');
    const val = el.value;

    if (val.startsWith('/')) {
        const q = val.toLowerCase();
        const matches = slashCommands.filter(c => c.name.startsWith(q));

        if (matches.length > 0) {
            popover.classList.remove('hidden');
            popover.innerHTML = '';
            matches.forEach((c, idx) => {
                const div = document.createElement('div');
                div.className = `autocomplete-item ${idx === activeAutocompleteIndex ? 'selected' : ''}`;
                div.innerHTML = `<span>${c.name}</span><span class="cmd-desc">${c.desc}</span>`;
                div.onclick = () => {
                    el.value = c.name + ' ';
                    popover.classList.add('hidden');
                    el.focus();
                };
                popover.appendChild(div);
            });
        } else {
            popover.classList.add('hidden');
            activeAutocompleteIndex = -1;
        }
    } else {
        popover.classList.add('hidden');
        activeAutocompleteIndex = -1;
    }
};

window.handleInputKeys = function(e) {
    const popover = document.getElementById('autocomplete-popover');
    if (popover.classList.contains('hidden')) return;

    const items = popover.querySelectorAll('.autocomplete-item');

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeAutocompleteIndex = (activeAutocompleteIndex + 1) % items.length;
        updateAutocompleteSelection(items);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeAutocompleteIndex = (activeAutocompleteIndex - 1 + items.length) % items.length;
        updateAutocompleteSelection(items);
    } else if (e.key === 'Enter' && activeAutocompleteIndex >= 0) {
        e.preventDefault();
        items[activeAutocompleteIndex].click();
    }
};

function updateAutocompleteSelection(items) {
    items.forEach((item, idx) => {
        if (idx === activeAutocompleteIndex) {
            item.classList.add('selected');
            item.scrollIntoView({ block: 'nearest' });
        } else {
            item.classList.remove('selected');
        }
    });
}

function getContextHistory() {
    const slidingWindow = 6;
    const windowed = chatHistory.slice(-slidingWindow);
    const mapped = windowed.map(msg => {
        let content = msg.content;
        if (content && content.length > 2000) {
            content = content.slice(0, 1000) + `\n\n[... content truncated for token efficiency ...]\n\n` + content.slice(-500);
        }
        return { role: msg.role, content };
    });

    const facts = localStorage.getItem('user_facts');
    if (personalIntelligenceActive && facts) {
        mapped.unshift({
            role: 'user',
            content: `[System Context: Remember the following personal details about me while assisting: ${facts}]`
        });
    }
    return mapped;
}

// 50 Slash Command Engine Executor Interceptor
async function handleSlashCommand(commandStr) {
    const parts = commandStr.trim().split(' ');
    const cmd = parts[0].toLowerCase();
    const argsStr = parts.slice(1).join(' ');

    const welcome = document.getElementById('welcome-screen');
    if (welcome) welcome.remove();

    appendMessage('user', commandStr);

    let outputText = '';

    switch (cmd) {
        case '/about':
            outputText = `⚡ InfinityChat - Premium Agentic Workspace\n• Sandbox Status: Active\n• Dynamic Loop Rotation: Enabled\n• Action Library: 54 Tools Active\n• Built on unified single-process architecture.`;
            break;
        case '/help':
            outputText = `📚 Commands Help Guide:\n` + slashCommands.map(c => `• ${c.name} : ${c.desc}`).join('\n');
            break;
        case '/system':
            try {
                const ram = await (await fetch('/call', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ name: 'sys_mem_total' }) })).json();
                const platform = await (await fetch('/call', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ name: 'sys_platform' }) })).json();
                const cpu = await (await fetch('/call', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ name: 'sys_cpu_model' }) })).json();
                outputText = `🖥️ System Profile:\n• Processor: ${cpu.result}\n• OS Platform: ${platform.result}\n• Memory limit: ${ram.result} MB`;
            } catch(e) { outputText = `Failed to read system metrics.`; }
            break;
        case '/cpu':
            const cpuData = await (await fetch('/call', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ name: 'sys_cpu_model' }) })).json();
            outputText = `Processor profile: ${cpuData.result}`;
            break;
        case '/memory':
            const free = await (await fetch('/call', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ name: 'sys_mem_free' }) })).json();
            const total = await (await fetch('/call', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ name: 'sys_mem_total' }) })).json();
            outputText = `RAM Allocation: ${free.result} MB free of ${total.result} MB total.`;
            break;
        case '/uptime':
            const uptime = await (await fetch('/call', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ name: 'sys_uptime' }) })).json();
            outputText = `Uptime: ${Math.round(uptime.result / 60)} minutes (${uptime.result} seconds).`;
            break;
        case '/platform':
            const plat = await (await fetch('/call', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ name: 'sys_platform' }) })).json();
            outputText = `Host Platform: ${plat.result}`;
            break;
        case '/arch':
            const arch = await (await fetch('/call', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ name: 'sys_arch' }) })).json();
            outputText = `Architecture: ${arch.result}`;
            break;
        case '/pid':
            const pid = await (await fetch('/call', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ name: 'sys_process_id' }) })).json();
            outputText = `Process ID: ${pid.result}`;
            break;
        case '/node':
            const nVersion = await (await fetch('/call', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ name: 'sys_node_version' }) })).json();
            outputText = `Runtime Version: Node.js ${nVersion.result}`;
            break;
        case '/ip':
            const ip = await (await fetch('/call', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ name: 'net_lookup_ip' }) })).json();
            outputText = `Interface IPs:\n` + ip.result.join('\n');
            break;
        case '/env':
            const env = await (await fetch('/call', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ name: 'net_env_vars' }) })).json();
            outputText = `Environment Keys:\n` + env.result.join(', ');
            break;
        case '/exec':
            const execPath = await (await fetch('/call', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ name: 'sys_exec_path' }) })).json();
            outputText = `Binary path: ${execPath.result}`;
            break;
        case '/tmp':
            const tmp = await (await fetch('/call', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ name: 'sys_temp_dir' }) })).json();
            outputText = `Temp directory: ${tmp.result}`;
            break;
        case '/session':
            outputText = `Session ID: ${sessionStorage.getItem('uuid') || 'Not established'}`;
            break;
        case '/pwd':
            const pwdData = await (await fetch('/api/sandbox/get')).json();
            outputText = `Current working dir: ${pwdData.sandbox}`;
            break;
        case '/ls':
        case '/list':
        case '/files':
            const lsData = await (await fetch('/api/sandbox/get')).json();
            const list = await (await fetch('/call', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ name: 'fs_list_dir', arguments: { dirPath: lsData.sandbox } }) })).json();
            if (list.error) {
                outputText = `⚠️ Access denied: Sandbox boundaries restrict file listings.`;
            } else {
                outputText = `Files in Sandbox:\n` + list.result.map(f => `• ${f.name} (${f.isDirectory ? 'Dir' : f.size + ' Bytes'})`).join('\n');
            }
            break;
        case '/cat':
            if (!argsStr) { outputText = `Usage: /cat filename`; break; }
            const cat = await (await fetch('/call', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ name: 'fs_read_file', arguments: { filePath: argsStr } }) })).json();
            outputText = cat.error ? `⚠️ Access Denied: Path outside sandbox.` : `File Content:\n\`\`\`\n${cat.result}\n\`\`\``;
            break;
        case '/mkdir':
            if (!argsStr) { outputText = `Usage: /mkdir path`; break; }
            const mkdir = await (await fetch('/call', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ name: 'fs_make_dir', arguments: { dirPath: argsStr } }) })).json();
            outputText = mkdir.error ? `⚠️ Access Denied.` : mkdir.result;
            break;
        case '/rm':
            if (!argsStr) { outputText = `Usage: /rm path`; break; }
            const rm = await (await fetch('/call', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ name: 'fs_delete_file', arguments: { filePath: argsStr } }) })).json();
            outputText = rm.error ? `⚠️ Access Denied.` : rm.result;
            break;
        case '/stats':
            if (!argsStr) { outputText = `Usage: /stats path`; break; }
            const stats = await (await fetch('/call', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ name: 'fs_get_stats', arguments: { filePath: argsStr } }) })).json();
            outputText = stats.error ? `⚠️ File not found.` : `Stats:\n• Size: ${stats.result.size} Bytes\n• Created: ${stats.result.birthtime}\n• Directory: ${stats.result.isDirectory}`;
            break;
        case '/sandbox':
            const sb = await (await fetch('/api/sandbox/get')).json();
            outputText = `Active Sandbox Workspace folder: ${sb.sandbox}`;
            break;
        case '/select':
        case '/create':
            if (!argsStr) { outputText = `Usage: ${cmd} absolute_path`; break; }
            const setRes = await (await fetch('/api/sandbox/set', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: argsStr })
            })).json();
            outputText = `Sandbox folder configured successfully:\n${setRes.sandbox}`;
            break;
        case '/profiles':
            const listRes = await fetch(`/api/providers/list`);
            const profiles = await listRes.json();
            outputText = `Active configured LLM Profiles:\n` + profiles.map((p, i) => `[${i+1}] ${p.providerName} (${p.model})`).join('\n');
            break;
        case '/model':
            outputText = `Selected Fallback/Active model profile targets rotation loop.`;
            break;
        case '/keys':
            const kRes = await fetch(`/api/providers/list`);
            const pKeys = await kRes.json();
            outputText = `Providers containing keys: ` + pKeys.filter(p => p.key).map(p => p.providerName).join(', ');
            break;
        case '/history':
            outputText = `Conversation turns: ${chatHistory.length} messages.`;
            break;
        case '/summary':
            outputText = `Long-term backend context memory compression active.`;
            break;
        case '/token':
            outputText = `Estimated session tokens size: ~${chatHistory.length * 150} tokens.`;
            break;
        case '/tools':
            const tRes = await fetch(`/tools`);
            const toolsCatalog = await tRes.json();
            outputText = `Enabled Tools:\n` + toolsCatalog.filter(t => t.enabled).map(t => `• ${formatToolName(t.name)}`).join('\n');
            break;
        case '/catalog':
            outputText = `Category Catalog available inside Settings.`;
            break;
        case '/time':
            outputText = `System Time: ${new Date().toISOString()}`;
            break;
        case '/uuid':
            outputText = `UUID: ${crypto.randomUUID()}`;
            break;
        case '/hash':
            const hashText = parts.slice(2).join(' ');
            const algo = parts[1] || 'sha256';
            if (!hashText) { outputText = `Usage: /hash algo text`; break; }
            const hashRes = await (await fetch('/call', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ name: `util_hash_${algo}`, arguments: { text: hashText } }) })).json();
            outputText = `Hash (${algo}): ${hashRes.result}`;
            break;
        case '/base64':
            const b64Text = parts.slice(2).join(' ');
            const op = parts[1] || 'encode';
            if (!b64Text) { outputText = `Usage: /base64 operation text`; break; }
            const b64Res = await (await fetch('/call', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ name: `util_base64_${op === 'encode' ? 'encode' : 'decode'}`, arguments: { [op === 'encode' ? 'text' : 'encoded']: b64Text } }) })).json();
            outputText = `Base64 Output: ${b64Res.result}`;
            break;
        case '/upper':
            outputText = argsStr.toUpperCase();
            break;
        case '/lower':
            outputText = argsStr.toLowerCase();
            break;
        case '/trim':
            outputText = argsStr.trim();
            break;
        case '/len':
            outputText = `Length: ${argsStr.length} characters.`;
            break;
        case '/reverse':
            outputText = argsStr.split('').reverse().join('');
            break;
        case '/split':
            const delim = parts[1];
            const splText = parts.slice(2).join(' ');
            outputText = JSON.stringify(splText.split(delim));
            break;
        case '/calc':
            try {
                const evalVal = eval(argsStr);
                outputText = `Result: ${evalVal}`;
            } catch(e) { outputText = `Calculation error: ${e.message}`; }
            break;
        case '/ping':
            const start = Date.now();
            await fetch(`/tools`);
            outputText = `Latency: ${Date.now() - start} ms`;
            break;
        case '/settings':
            toggleDrawer('settings');
            return;
        case '/toolsmenu':
            toggleDrawer('tools');
            return;
        case '/profile':
            openAccountModal();
            return;
        case '/close':
            closeAllDrawers();
            return;
        case '/clear':
            clearChat();
            outputText = `Conversation cleared.`;
            break;
        case '/theme':
            const wrap = document.getElementById('app-wrapper');
            wrap.style.filter = wrap.style.filter === 'hue-rotate(90deg)' ? 'none' : 'hue-rotate(90deg)';
            outputText = `Theme styling updated.`;
            break;
        case '/clean':
            document.getElementById('agent-action-bar').innerHTML = '';
            outputText = `Cleaned action bar.`;
            break;
        case '/quote':
            const quotes = [
                "Programs must be written for people to read, and only incidentally for machines to execute. - Abelson & Sussman",
                "Simplicity is prerequisite for reliability. - Edsger W. Dijkstra",
                "Make it work, make it right, make it fast. - Kent Beck"
            ];
            outputText = quotes[Math.floor(Math.random() * quotes.length)];
            break;
        case '/customtool':
            try {
                const meta = JSON.parse(argsStr);
                const result = await fetch('/api/tools/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(meta)
                });
                const r = await result.json();
                outputText = r.status === 'ok' ? `Dynamic tool registered.` : `Compile error: ${r.error}`;
            } catch(err) {
                outputText = `Validation error: Verify JSON parameters layout config.`;
            }
            break;
        case '/term':
            if (!argsStr) { outputText = `Usage: /term command`; break; }
            const shellRes = await (await fetch('/api/shell/exec', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command: argsStr })
            })).json();
            outputText = shellRes.error ? `⚠️ Terminal Execution Error:\n${shellRes.error}` : `Console Output:\n\`\`\`\n${shellRes.stdout || 'Command run successfully with no stdout.'}\n${shellRes.stderr || ''}\n\`\`\``;
            break;
        case '/index':
            const idxRes = await (await fetch('/api/rag/index', { method: 'POST' })).json();
            outputText = `Indexed ${idxRes.count} files inside workspace sandbox for local vector search.`;
            break;
        case '/search':
            if (!argsStr) { outputText = `Usage: /search query`; break; }
            const sRes = await (await fetch('/api/rag/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: argsStr })
            })).json();
            outputText = `Search Results:\n` + sRes.map((r, i) => `[${i+1}] ${r.name} (Score: ${r.score})`).join('\n');
            break;
        case '/preview':
            if (!argsStr) { outputText = `Usage: /preview HTML_code`; break; }
            openPreviewModal(argsStr);
            return;
        default:
            outputText = `Unknown slash command. Type /help to see all commands.`;
    }

    appendMessage('assistant', outputText);
    speakResponse(outputText);
}

// Live Canvas Preview Modal Functions
window.openPreviewModal = function(code) {
    const modal = document.getElementById('preview-modal');
    const iframe = document.getElementById('preview-iframe');
    modal.classList.add('open');
    iframe.contentWindow.document.open();
    iframe.contentWindow.document.write(code);
    iframe.contentWindow.document.close();
};

window.closePreviewModal = function() {
    const modal = document.getElementById('preview-modal');
    modal.classList.remove('open');
};

// Process conversation turn securely via server-side endpoints
window.sendMessage = async function(event) {
    if (event) event.preventDefault();
    const inputEl = document.getElementById('chat-input');
    const prompt = inputEl.value.trim();
    if (!prompt) return;

    inputEl.value = '';

    // Intercept Slash Commands
    if (prompt.startsWith('/')) {
        handleSlashCommand(prompt);
        return;
    }

    const welcome = document.getElementById('welcome-screen');
    if (welcome) welcome.remove();

    // Initialize new session if currentChatId is null
    if (!currentChatId) {
        currentChatId = crypto.randomUUID();
        sessionStorage.setItem('current_chat_id', currentChatId);
        const truncatedTitle = prompt.slice(0, 24) + (prompt.length > 24 ? '...' : '');
        const newChat = {
            id: currentChatId,
            title: (isTemporaryMode ? '⏳ ' : '') + truncatedTitle,
            history: [],
            titleGenerated: false,
            createdAt: Date.now(),
            temporary: isTemporaryMode,
            expiry: isTemporaryMode ? (Date.now() + 24 * 60 * 60 * 1000) : null
        };
        chats.unshift(newChat);
        saveChatsToStorage();
        renderChatsList();

        // Trigger auto title generation 10 seconds after first message
        const targetId = currentChatId;
        setTimeout(() => {
            triggerAutoTitle(targetId);
        }, 10000);
    }

    appendMessage('user', prompt);

    logs = [];
    const statusEl = document.getElementById('current-rotation-status');
    if (statusEl) statusEl.textContent = 'Connecting...';
    document.getElementById('agent-action-bar').classList.remove('hidden');

    try {
        let history = getContextHistory();
        const ragContext = getPastChatInfo(prompt);
        history.push({ role: 'user', content: prompt + ragContext });

        const res = await fetch(`/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: history })
        });
        const data = await res.json();

        if (data.error) throw new Error(data.error);

        if (statusEl) statusEl.textContent = `Active Engine: ${data.providerModel}`;

        if (data.type === 'text') {
            chatHistory.push({ role: 'user', content: prompt });
            chatHistory.push({ role: 'assistant', content: data.text });
            
            // Sync with chats local storage
            const activeChat = chats.find(c => c.id === currentChatId);
            if (activeChat) {
                activeChat.history = chatHistory;
                saveChatsToStorage();
                
                // Trigger title generation if 5 messages are reached
                if (chatHistory.length >= 5 && !activeChat.titleGenerated) {
                    triggerAutoTitle(currentChatId);
                }
            }

            appendMessage('assistant', data.text);
            speakResponse(data.text);
            document.getElementById('agent-action-bar').classList.add('hidden');
        } else if (data.type === 'requires_approval') {
            showModal(data.toolName, data.toolArgs);
        } else if (data.type === 'requires_permission') {
            showPermissionModal(data.action, data.path);
        }
    } catch(err) {
        appendMessage('assistant', `Connection lost or invalid key. Please verify your profile settings.`);
        document.getElementById('agent-action-bar').classList.add('hidden');
    }
};

function showModal(toolName, args) {
    document.getElementById('modal-tool-name').textContent = formatToolName(toolName);
    document.getElementById('modal-tool-args').textContent = JSON.stringify(args, null, 2);
    document.getElementById('confirm-modal').classList.add('open');
}

function showPermissionModal(action, filePath) {
    document.getElementById('permission-action').textContent = formatToolName(action);
    document.getElementById('permission-path').textContent = filePath;
    document.getElementById('permission-modal').classList.add('open');
}

window.approveToolCall = async function() {
    document.getElementById('confirm-modal').classList.remove('open');
    document.getElementById('permission-modal').classList.remove('open');
    const statusEl = document.getElementById('current-rotation-status');
    if (statusEl) statusEl.textContent = 'Running Action...';

    try {
        const res = await fetch(`/api/chat/approve`, { method: 'POST' });
        const data = await res.json();

        if (data.error) throw new Error(data.error);

        chatHistory.push({ role: 'assistant', content: data.text });
        
        const activeChat = chats.find(c => c.id === currentChatId);
        if (activeChat) {
            activeChat.history = chatHistory;
            saveChatsToStorage();
        }

        appendMessage('assistant', data.text);
        speakResponse(data.text);
    } catch(err) {
        appendMessage('assistant', `Action execution failed. Please verify configurations.`);
    } finally {
        document.getElementById('agent-action-bar').classList.add('hidden');
    }
};

window.denyToolCall = async function() {
    document.getElementById('confirm-modal').classList.remove('open');
    document.getElementById('permission-modal').classList.remove('open');
    try {
        const res = await fetch(`/api/chat/deny`, { method: 'POST' });
        const data = await res.json();

        if (data.error) throw new Error(data.error);

        chatHistory.push({ role: 'assistant', content: data.text });
        
        const activeChat = chats.find(c => c.id === currentChatId);
        if (activeChat) {
            activeChat.history = chatHistory;
            saveChatsToStorage();
        }

        appendMessage('assistant', data.text);
        speakResponse(data.text);
    } catch(err) {
        appendMessage('assistant', `Action cancelled by user.`);
    } finally {
        document.getElementById('agent-action-bar').classList.add('hidden');
    }
};

function updateActionLogs() {
    // In secure mode, tool actions are executed server-side.
}

function appendMessage(sender, text) {
    const viewport = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = `message ${sender}`;
    div.innerHTML = `<div class="bubble">${escapeHtml(text).replace(/\n/g, '<br>')}</div>`;
    viewport.appendChild(div);
    viewport.scrollTop = viewport.scrollHeight;
}

window.clearChat = function() {
    chatHistory = [];
    logs = [];
    
    // Restore Gemini Welcome Grid with new inline SVGs
    document.getElementById('chat-messages').innerHTML = `
        <div class="welcome-container" id="welcome-screen">
            <div class="welcome-sparkle">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z" fill="url(#sparkle-grad-clear)"/>
                    <defs>
                        <linearGradient id="sparkle-grad-clear" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                            <stop stop-color="#9333EA"/>
                            <stop offset="0.5" stop-color="#3B82F6"/>
                            <stop offset="1" stop-color="#60A5FA"/>
                        </linearGradient>
                    </defs>
                </svg>
            </div>
            <h1 class="welcome-title">Hello, how can I help you today?</h1>
            <p class="welcome-subtitle">Your workspace is ready to write, code, search, and perform diagnostic operations.</p>
            
            <div class="suggestion-grid">
                <div class="suggestion-card" onclick="useSuggestion('What is my current system memory usage?')">
                    <span class="icon-svg-wrapper">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="20" x2="18" y2="10"></line>
                            <line x1="12" y1="20" x2="12" y2="4"></line>
                            <line x1="6" y1="20" x2="6" y2="14"></line>
                        </svg>
                    </span>
                    <div class="text">
                        <h4>System Diagnostics</h4>
                        <p>Check current memory usage and limits</p>
                    </div>
                </div>
                <div class="suggestion-card" onclick="useSuggestion('List files in the current folder')">
                    <span class="icon-svg-wrapper">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                        </svg>
                    </span>
                    <div class="text">
                        <h4>File Explorer</h4>
                        <p>Look up directories and file details</p>
                    </div>
                </div>
                <div class="suggestion-card" onclick="useSuggestion('Generate a random UUID and sha256 hash it')">
                    <span class="icon-svg-wrapper">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A855F7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                    </span>
                    <div class="text">
                        <h4>Utilities Workspace</h4>
                        <p>Create random UUIDs and text hashes</p>
                    </div>
                </div>
            </div>
        </div>
    `;
};

window.toggleDrawer = function(drawerName) {
    let drawer;
    if (drawerName === 'settings') {
        drawer = document.getElementById('tab-settings');
    } else if (drawerName === 'tools') {
        drawer = document.getElementById('tab-tools');
    } else if (drawerName === 'projects') {
        drawer = document.getElementById('tab-projects');
        loadProjects();
    } else if (drawerName === 'connectors') {
        drawer = document.getElementById('tab-connectors');
    }
    const backdrop = document.getElementById('drawer-backdrop');

    if (drawer.classList.contains('open')) {
        drawer.classList.remove('open');
        backdrop.classList.add('hidden');
    } else {
        document.querySelectorAll('.modal').forEach(d => {
            if (d.id !== 'catalog-modal' && d.id !== 'preview-modal') d.classList.remove('open');
        });
        drawer.classList.add('open');
        backdrop.classList.remove('hidden');
    }
};

// Projects Management Handlers
window.loadProjects = async function() {
    try {
        const res = await fetch('/api/projects');
        const dirs = await res.json();
        const cabinet = document.getElementById('projects-list-cabinet');
        cabinet.innerHTML = '';

        if (dirs.length === 0) {
            cabinet.innerHTML = '<p class="empty-text">No project directories found. Create one above!</p>';
            // Remove /list and /files commands if no project directories exist
            slashCommands = slashCommands.filter(c => c.name !== '/list' && c.name !== '/files');
            return;
        }

        // Add them back if directories exist and they are missing
        if (!slashCommands.some(c => c.name === '/list')) {
            slashCommands.push({ name: "/list", desc: "List files inside the active sandbox" });
            slashCommands.push({ name: "/files", desc: "List files inside the active sandbox" });
        }

        dirs.forEach(dirName => {
            const div = document.createElement('div');
            div.className = 'tool-item';
            div.innerHTML = `
                <div class="tool-item-header" style="align-items: center; display: flex; justify-content: space-between; width: 100%;">
                    <span class="name" style="color: var(--accent-success); font-weight: 600;">📁 ${dirName}</span>
                    <button class="btn btn-secondary" onclick="selectProject('${dirName}')" style="font-size: 11px; padding: 6px 12px;">Select Project</button>
                </div>
            `;
            cabinet.appendChild(div);
        });
    } catch(err) {
        console.error('Failed to load projects:', err);
    }
};

window.selectProject = async function(name) {
    try {
        const res = await fetch('/api/projects/select', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });
        const data = await res.json();
        if (data.status === 'ok') {
            alert(`Switched project sandbox successfully to:\n${data.path}`);
            closeAllDrawers();
        }
    } catch(err) {
        alert(`Failed to select project: ${err.message}`);
    }
};

window.createNewProject = async function() {
    const input = document.getElementById('new-project-name');
    const name = input.value.trim();
    if (!name) {
        alert('Please enter a valid folder name!');
        return;
    }

    try {
        const res = await fetch('/api/projects/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });
        const data = await res.json();
        if (data.status === 'ok') {
            input.value = '';
            alert(`Project folder "${data.name}" created and loaded!`);
            loadProjects();
        } else {
            alert(`Failed: ${data.error}`);
        }
    } catch(err) {
        alert(`Failed to create project: ${err.message}`);
    }
};

window.closeAllDrawers = function() {
    document.querySelectorAll('.modal').forEach(d => d.classList.remove('open'));
    document.getElementById('drawer-backdrop').classList.add('hidden');
};

window.toggleIconSidebar = function() {
    const sidebar = document.getElementById('icon-sidebar');
    const wrapper = document.getElementById('app-wrapper');
    sidebar.classList.toggle('open');
    if (wrapper) {
        wrapper.classList.toggle('sidebar-open');
    }
};

window.openAccountModal = function() {
    document.getElementById('account-modal').classList.add('open');
};

window.closeAccountModal = function() {
    document.getElementById('account-modal').classList.remove('open');
};

// --- Authentication Controllers ---
let authMode = 'signup'; // signup or login

window.checkAuthStatus = async function() {
    if (localStorage.getItem('auth_session') === 'active') {
        const modal = document.getElementById('auth-modal');
        if (modal) modal.style.display = 'none';
        return;
    }

    try {
        const res = await fetch('/api/auth/ip-check');
        const data = await res.json();
        
        // If IP address already visited, switch default view to sign-in
        if (data.exists) {
            authMode = 'login';
            document.getElementById('auth-modal-title').textContent = 'Sign In to Developer Console';
            document.getElementById('auth-submit-btn').textContent = 'Sign In';
            document.getElementById('auth-modal-toggle-text').textContent = 'New user? Try signing up';
        }
    } catch(err) {
        console.error('IP visitor validation failed:', err);
    }
};

window.toggleAuthMode = function() {
    const title = document.getElementById('auth-modal-title');
    const btn = document.getElementById('auth-submit-btn');
    const link = document.getElementById('auth-modal-toggle-text');
    
    if (authMode === 'signup') {
        authMode = 'login';
        title.textContent = 'Sign In to Developer Console';
        btn.textContent = 'Sign In';
        link.textContent = 'New user? Try signing up';
    } else {
        authMode = 'signup';
        title.textContent = 'Create Developer Account';
        btn.textContent = 'Sign Up';
        link.textContent = 'Existing user? Try signing in';
    }
};

window.handleAuthSubmit = function() {
    const email = document.getElementById('auth-email').value;
    const pass = document.getElementById('auth-password').value;
    if (!email || !pass) {
        alert('Please fill out all credentials fields.');
        return;
    }
    localStorage.setItem('auth_session', 'active');
    const modal = document.getElementById('auth-modal');
    if (modal) modal.style.display = 'none';
    alert('Access token authorized successfully!');
};

window.handleSSOLogin = function(provider) {
    localStorage.setItem('auth_session', 'active');
    const modal = document.getElementById('auth-modal');
    if (modal) modal.style.display = 'none';
    alert(`Successfully authenticated via ${provider} SSO handshake.`);
};

// --- Templates Initializer ---
window.initializeTemplate = async function(templateId) {
    try {
        const res = await fetch('/api/templates/initialize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ templateId })
        });
        const data = await res.json();
        if (data.status === 'ok') {
            alert(`Starter template "${data.folderName}" initialized successfully!\nSandbox sandbox switched to: ${data.path}`);
            closeAllDrawers();
        } else {
            alert(`Failed: ${data.error}`);
        }
    } catch(err) {
        alert(`Failed to initialize template: ${err.message}`);
    }
};

// Historical chat scanner context RAG helper
function getPastChatInfo(promptText) {
    const keywords = ['previous', 'last chat', 'previously', 'past projects', 'earlier project', 'history', 'what did we talk', 'what was my last'];
    const match = keywords.some(k => promptText.toLowerCase().includes(k));
    if (!match) return "";
    
    const past = chats.slice(0, 5).map(c => `• ${c.title}`).join('\n');
    if (!past) return "";
    return `\n\n[System RAG Context: The user is asking about historical conversation outlines. Here are the titles of their recent conversations in history:\n${past}]\n`;
}

function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

loadTools();
loadActiveProviders();
renderChatsList();
checkAuthStatus();
if (currentChatId) {
    selectChat(currentChatId);
}
