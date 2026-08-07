// worker.js - 部署到 linrui0604.workers.dev
export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    // 处理 CORS 预检
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // ---- API 路由：单次测试 ----
    if (url.pathname === '/api/ping') {
      const target = url.searchParams.get('url');
      if (!target) {
        return Response.json({ error: '缺少 url 参数' }, { 
          status: 400,
          headers: { 'Access-Control-Allow-Origin': '*' }
        });
      }

      try {
        const start = Date.now();
        const response = await fetch(target, {
          method: 'HEAD',
          headers: { 'Cache-Control': 'no-cache' },
          signal: AbortSignal.timeout(5000),
        });
        const latency = Date.now() - start;

        return Response.json({
          success: true,
          latency: latency,
          status: response.status,
          ok: response.ok,
        }, {
          headers: { 'Access-Control-Allow-Origin': '*' }
        });
      } catch (error) {
        return Response.json({
          success: false,
          error: error.message,
        }, {
          status: 500,
          headers: { 'Access-Control-Allow-Origin': '*' }
        });
      }
    }

    // ---- 返回 HTML 页面 ----
    return new Response(HTML, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  },
};

// ============================================================
// 完整的 HTML 页面（压缩版）
// ============================================================
const HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>网络探测 · inrui0604</title>
    <style>
        *{margin:0;padding:0;box-sizing:border-box;font-family:system-ui,sans-serif}
        body{min-height:100vh;background:linear-gradient(145deg,#f6f9fc,#e9f0f5);display:flex;align-items:center;justify-content:center;padding:1.5rem}
        .card{max-width:680px;width:100%;background:rgba(255,255,255,0.85);backdrop-filter:blur(8px);border-radius:2.5rem;padding:2rem;box-shadow:0 20px 40px -12px rgba(0,20,30,0.25);border:1px solid rgba(255,255,255,0.6)}
        h1{font-size:1.9rem;font-weight:600;color:#0b2a3b;margin-bottom:0.3rem}
        h1 small{font-size:0.9rem;font-weight:400;color:#3e6a7a}
        .sub{color:#2c5770;margin-bottom:1.8rem;font-size:.95rem;border-left:4px solid #3b8db0;padding-left:1rem;background:rgba(59,141,176,0.06);border-radius:0 12px 12px 0}
        .status-panel{background:#ffffffcc;backdrop-filter:blur(4px);border-radius:1.8rem;padding:1.8rem;border:1px solid rgba(255,255,255,0.8)}
        .metric-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.2rem 1.8rem;margin-bottom:2rem}
        .metric-label{font-size:.75rem;text-transform:uppercase;letter-spacing:.04em;color:#3f6b7c;font-weight:600}
        .metric-value{font-size:2rem;font-weight:550;color:#083344;display:flex;align-items:baseline;gap:.2rem}
        .metric-unit{font-size:.9rem;font-weight:400;color:#4c7b8c}
        .status-badge{grid-column:span 2;background:#eef5f9;border-radius:3rem;padding:.6rem 1.2rem;display:flex;align-items:center;justify-content:space-between;border:1px solid #d6e3ec}
        .badge-dot{display:inline-block;width:12px;height:12px;border-radius:50%;margin-right:10px;background:#8ba9b9;transition:background .25s}
        .badge-dot.online{background:#2b9c5e;box-shadow:0 0 0 2px #b3e0c9}
        .badge-dot.offline{background:#c74a4a;box-shadow:0 0 0 2px #f5cdcd}
        .badge-dot.checking{background:#e6b45e;box-shadow:0 0 0 2px #f5e1b0}
        .badge-text{font-weight:500;color:#1f495b}
        .action-bar{display:flex;flex-wrap:wrap;gap:1rem;margin-top:.25rem}
        .btn{background:white;border:none;padding:.8rem 2rem;border-radius:3rem;font-weight:550;font-size:.95rem;color:#083344;border:1px solid #cbdae5;cursor:pointer;transition:.2s;flex:1 1 auto;display:inline-flex;align-items:center;justify-content:center;gap:.5rem}
        .btn-primary{background:#1d5b77;border-color:#154c64;color:white;box-shadow:0 8px 14px -8px #1d5b7740}
        .btn-primary:hover{background:#134f69;transform:scale(.98)}
        .btn-secondary{background:#eaf1f7;border-color:#c8d8e5}
        .btn-secondary:hover{background:#dce8f0}
        .btn:disabled{opacity:.55;pointer-events:none}
        .log-area{margin-top:1.8rem;background:#f2f8fc;border-radius:1.4rem;padding:.9rem 1.3rem;font-size:.85rem;color:#17485e;border:1px solid #d7e3ec;display:flex;align-items:center;gap:.5rem;flex-wrap:wrap;min-height:4.2rem}
        .log-icon{font-size:1.2rem;opacity:.7}
        .log-message{word-break:break-word;flex:1}
        .log-timestamp{font-size:.7rem;color:#4a7b8c;background:#dde9f2;padding:.15rem .8rem;border-radius:20px;white-space:nowrap}
        .footer-meta{margin-top:1.2rem;font-size:.7rem;color:#507b8b;text-align:right;opacity:.7}
        @media(max-width:480px){.card{padding:1.5rem}.metric-grid{grid-template-columns:1fr}.status-badge{grid-column:span 1}.action-bar{flex-direction:column}}
    </style>
</head>
<body>
<div class="card">
    <h1>🌐 网络探测 <small>· Worker 版</small></h1>
    <div class="sub">⚡ 通过 Worker 代理 · 无 CORS 限制</div>
    <div class="status-panel">
        <div class="metric-grid">
            <div class="metric-item">
                <span class="metric-label">📡 延迟 (平均)</span>
                <div class="metric-value" id="avgLatency">-- <span class="metric-unit">ms</span></div>
            </div>
            <div class="metric-item">
                <span class="metric-label">⏱️ 上次测试</span>
                <div class="metric-value" id="lastLatency">-- <span class="metric-unit">ms</span></div>
            </div>
            <div class="metric-item">
                <span class="metric-label">📊 成功率</span>
                <div class="metric-value" id="successRate">-- <span class="metric-unit">%</span></div>
            </div>
            <div class="metric-item">
                <span class="metric-label">🔁 测试次数</span>
                <div class="metric-value" id="attemptCount">0</div>
            </div>
            <div class="status-badge">
                <span><span class="badge-dot" id="statusDot"></span><span class="badge-text" id="statusText">就绪</span></span>
                <span style="font-size:.8rem;color:#2b5b70;">🚀 inrui0604.workers.dev</span>
            </div>
        </div>
        <div class="action-bar">
            <button class="btn btn-primary" id="runTestBtn">▶ 运行测试</button>
            <button class="btn btn-secondary" id="resetBtn">↺ 重置统计</button>
        </div>
        <div class="log-area">
            <span class="log-icon">📋</span>
            <span class="log-message" id="logMessage">就绪 · 点击运行测试</span>
            <span class="log-timestamp" id="logTimestamp">现在</span>
        </div>
    </div>
    <div class="footer-meta">⚡ 免费额度: 10万次/天 · inrui0604.workers.dev</div>
</div>

<script>
    (function() {
        const state = {
            totalAttempts: 0,
            totalSuccess: 0,
            totalLatencySum: 0,
            successCount: 0,
            lastLatency: null,
            running: false,
        };

        const CONFIG = {
            endpoints: [
                'https://www.google.com/',
                'https://www.cloudflare.com/',
                'https://www.microsoft.com/',
                'https://www.github.com/',
                'https://www.baidu.com/',
            ],
            requestsPerTest: 3,
        };

        const els = {
            avgLatency: document.getElementById('avgLatency'),
            lastLatency: document.getElementById('lastLatency'),
            successRate: document.getElementById('successRate'),
            attemptCount: document.getElementById('attemptCount'),
            statusDot: document.getElementById('statusDot'),
            statusText: document.getElementById('statusText'),
            logMessage: document.getElementById('logMessage'),
            logTimestamp: document.getElementById('logTimestamp'),
            runBtn: document.getElementById('runTestBtn'),
            resetBtn: document.getElementById('resetBtn'),
        };

        function setLog(msg, isError = false) {
            els.logMessage.textContent = msg;
            els.logTimestamp.textContent = new Date().toLocaleTimeString('zh-CN');
            els.logMessage.style.color = isError ? '#b14a4a' : '#17485e';
        }

        function updateStats() {
            const avg = state.successCount > 0 ? state.totalLatencySum / state.successCount : null;
            els.avgLatency.innerHTML = (avg !== null ? Math.round(avg) : '--') + ' <span class="metric-unit">ms</span>';
            els.lastLatency.innerHTML = (state.lastLatency !== null ? Math.round(state.lastLatency) : '--') + ' <span class="metric-unit">ms</span>';
            const rate = state.totalAttempts > 0 ? (state.totalSuccess / state.totalAttempts) * 100 : null;
            els.successRate.innerHTML = (rate !== null ? Math.round(rate) : '--') + ' <span class="metric-unit">%</span>';
            els.attemptCount.textContent = state.totalAttempts;

            if (state.totalAttempts === 0) {
                els.statusDot.className = 'badge-dot';
                els.statusText.textContent = '就绪';
            } else if (state.totalSuccess === 0) {
                els.statusDot.className = 'badge-dot offline';
                els.statusText.textContent = '⚠️ 全失败';
            } else if (state.totalSuccess < state.totalAttempts) {
                els.statusDot.className = 'badge-dot checking';
                els.statusText.textContent = '🟡 部分成功';
            } else {
                els.statusDot.className = 'badge-dot online';
                els.statusText.textContent = '✅ 在线';
            }
        }

        function resetStats() {
            Object.assign(state, {
                totalAttempts: 0,
                totalSuccess: 0,
                totalLatencySum: 0,
                successCount: 0,
                lastLatency: null,
            });
            updateStats();
            setLog('统计已重置');
            els.statusDot.className = 'badge-dot';
            els.statusText.textContent = '就绪';
        }

        async function measureRequest(url) {
            try {
                const resp = await fetch(\`/api/ping?url=\${encodeURIComponent(url)}\`);
                const data = await resp.json();
                return data.success ? data.latency : null;
            } catch {
                return null;
            }
        }

        async function runTest() {
            if (state.running) return;
            state.running = true;
            els.runBtn.disabled = true;
            els.runBtn.textContent = '⏳ 测试中...';
            setLog('正在通过 Worker 代理测试...');

            const shuffled = [...CONFIG.endpoints].sort(() => Math.random() - 0.5);
            const targets = shuffled.slice(0, CONFIG.requestsPerTest);
            const successLatencies = [];

            for (let i = 0; i < targets.length; i++) {
                const url = targets[i];
                setLog(\`请求 \${i+1}/\${targets.length}: \${new URL(url).hostname}\`);
                const latency = await measureRequest(url);
                state.totalAttempts++;

                if (latency !== null && latency > 0) {
                    successLatencies.push(latency);
                    state.totalSuccess++;
                    state.totalLatencySum += latency;
                    state.successCount++;
                    state.lastLatency = latency;
                } else {
                    setLog(\`⚠️ 请求 \${i+1} 失败\`, true);
                }
                updateStats();
                if (i < targets.length - 1) await new Promise(r => setTimeout(r, 200));
            }

            if (successLatencies.length === 0) {
                setLog('❌ 所有请求均失败', true);
                els.statusDot.className = 'badge-dot offline';
                els.statusText.textContent = '⚠️ 离线';
            } else {
                const avg = successLatencies.reduce((a, b) => a + b, 0) / successLatencies.length;
                setLog(\`✅ 成功 \${successLatencies.length}/\${targets.length}，平均延迟 \${Math.round(avg)} ms\`);
                state.lastLatency = avg;
                updateStats();
            }

            state.running = false;
            els.runBtn.disabled = false;
            els.runBtn.textContent = '▶ 运行测试';
            updateStats();
        }

        els.runBtn.addEventListener('click', runTest);
        els.resetBtn.addEventListener('click', resetStats);
        resetStats();
        setLog('🚀 已部署到 inrui0604.workers.dev');
    })();
</script>
</body>
</html>`;
