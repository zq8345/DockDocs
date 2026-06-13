# DockDocs 自托管转换引擎(Gotenberg)

把 Office→PDF / html→PDF / url→PDF / PDF/A 的**按次成本换成一台 ~$5/月 VPS 的固定月租**(边际≈$0)。
画质 = CloudConvert 的 `libreoffice` 引擎(同一套软件);html/url→PDF 与付费 API 完全平价。

> 架构:`Netlify 云函数 → (HTTPS + 密钥) → Caddy → Gotenberg(Chromium+LibreOffice)`
> Gotenberg 只在内网,公网只暴露 Caddy;带密钥的请求才放行。

---

## Joe 要做的(约 15 分钟,一次性)

1. **开一台 4GB 海外 VPS** —— 阿里云国际版海外地域 ECS(法兰克福/美国)、Vultr、或任意服务商均可,规格 **2 vCPU / 4GB、Ubuntu 24.04、选海外地域**(别选中国大陆)。记下公网 IP。
2. **加一条 DNS 记录** —— 把一个子域名(例如 `convert.dockdocs.app`)的 **A 记录**指向这台 VPS 的 IP。(TLS 证书需要它。)
3. **SSH 登进去,装 Docker:**
   ```bash
   curl -fsSL https://get.docker.com | sh
   ```
4. **拿到这套配置**(在 VPS 上):
   ```bash
   git clone https://github.com/zq8345/dock-ai-ecosystem.git
   cd dock-ai-ecosystem/infra/gotenberg
   cp .env.example .env
   nano .env          # 填 GOTENBERG_DOMAIN;GOTENBERG_SECRET 用下面命令生成
   openssl rand -hex 32   # 复制输出，粘到 .env 的 GOTENBERG_SECRET
   ```
5. **启动:**
   ```bash
   docker compose up -d --build
   ```
6. **只开必要端口 22 / 80 / 443** —— 先在云服务商的**安全组/防火墙**放行这三个(阿里云 = 安全组入方向规则);VPS 内可选再加 ufw:
   ```bash
   ufw allow 22 && ufw allow 80 && ufw allow 443 && ufw --force enable
   ```
7. **自检** —— 几秒后:
   ```bash
   curl -fsS -H "X-DockDocs-Key: <你的SECRET>" https://convert.dockdocs.app/health
   ```
   返回正常(无 403)即成功。
8. **把这两样发我**:① 子域名 ② SECRET。我接 Netlify 云函数(带回退到付费引擎),并做切前画质横评。

---

## 我(Claude)负责的

- Netlify 云函数:把 Office→PDF / html / url / pdfa 转发到你的 Gotenberg,**失败自动回退**(不回退 CloudConvert——ToS,改 Adobe/Aspose 或排队重试)。
- **url→pdf 防 SSRF**:在函数层校验目标 URL,挡内网 / `169.254.169.254` 云元数据 / `file:` 等(连接时校验,防 DNS rebinding)。
- 切前拿 5–10 份真实复杂文档,自托管 vs 付费引擎肉眼横评,只把"过关"的文档类型路由到自托管。

## 日常维护(很轻,大部分我代劳)

- 升级:`docker compose pull && docker compose up -d --build`(月度级)。
- OS 补丁:`unattended-upgrades`(可设自动)。
- 监控:健康检查 + 告警(我配),挂了你收通知;函数侧已有回退兜底。
- 量大时加内存/副本(我判断+操作)。

## 注意

- **绝不**把 Gotenberg 的 `3000` 端口直接暴露公网——本配置已让它只在内网,只走 Caddy。
- `.env` 不要提交(已在 `.gitignore` 忽略)。
- 复杂 Office 文档(SmartArt/复杂表/PPT 动画)LibreOffice 比 CloudConvert 高保真引擎略差——这类留"高保真付费档"。
