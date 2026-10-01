# 安全与隐私检查

检查日期：2026-10-01（北京时间）。检查对象为从 `dev` 创建的 `codex/site-fixes-optimization` worktree，包含尚未提交的修复和论文导入。

## 结论

没有发现已暴露的凭据或当前页面中的可执行注入；依赖审计为 0 个已知漏洞。后续已按用户要求修复部署权限和敏感文件忽略规则，其他可选加固及公开信息范围记录如下。没有修改业务图片或改写 Git 历史。

## 已处理的配置问题

### P2：构建任务继承部署写权限

位置：`.github/workflows/deploy.yml`。

原先 `pages: write` 和 `id-token: write` 定义在 workflow 顶层，执行 `npm ci` 和构建的 job 也继承这些权限。若构建依赖或 Action 被攻陷，授权范围会比构建本身需要的大。

已把这两项权限下放到 `deploy` job，顶层只保留 `contents: read`。`configure-pages` 同时移到部署任务，构建任务不获得任何 Pages 或 OIDC 权限。当前没有发现利用或未经授权的部署。

### P2：环境变量文件忽略规则不完整

位置：`.gitignore`。

原先只忽略 `.env` 和 `.env.production`；`.env.local`、`.env.development`、`.env.test` 不在忽略范围内，未来可能误提交含密钥的本地配置。当前工作区及可达 Git 历史中没有发现这些文件。

已采用 `.env`、`.env.*`、`.envrc`，并用 `!.env.example` 明确保留不含凭据的模板；还忽略通用日志和 `.pem`、`.key`、`.p12`、`.pfx` 等密钥/凭据容器文件。忽略规则不代替对已经提交过的凭据进行撤销或轮换。

## 隐私检查

- 页面公开了两名成员的学校邮箱、课程报名邮箱、人员姓名和照片、履历及校园办公地址。这些是网站内容中的业务信息，但邮箱仍可被批量抓取；是否保留具体地址和个人联系方式属于发布范围选择。
- 可达 Git 提交的作者/提交者信息中包含 `foxmail.com` 和 `gmail.com` 邮箱。若仓库公开，这些地址也可被查看；今后可配置 GitHub 提供的 noreply 邮箱。修改 Git 配置只影响后续提交，删除当前文件也不会消除旧提交信息。本次没有改写历史。
- `.vscode` 已从当前 Git 索引移除，文件仍保留在本地。历史中的两份配置只是扩展推荐和开发启动命令，没有发现凭据或本机绝对路径。
- 四张 PNG 未发现 EXIF、XMP 或 GPS 元数据。课程海报的 `Author` 和 `Time` 文本字段为空；没有读取出额外身份信息。没有修改、压缩或重编码任何图片。
- 生成页面没有统计脚本、第三方资源加载、Cookie 操作、表单或其他主动收集访客数据的代码。点击论文、机构或视频链接后，目标站点会按其自身规则处理访问。本检查不能验证 GitHub 或目标站点的内部访问日志。

## 其他可选加固

- **URL 协议白名单**：`src/content.config.ts` 的 `z.url()` 实测接受 `javascript:` 和 `data:`。目前所有生成页面的链接均没有这类协议，且内容由仓库维护者提交；这不是当前已发现的外部输入漏洞。可把网站、论文和视频链接限制为 HTTP/HTTPS，以拦截误填或后续导入的恶意链接。Markdown 正文也应继续按可信源码审核，不能把这个 schema 当作完整的 HTML 清洗器。
- **浏览器策略**：当前生成 HTML 和线上响应未显式设置 CSP 或 Referrer-Policy。现代浏览器默认使用 `strict-origin-when-cross-origin`，跨站访问通常只发送本站 origin；没有发现完整页面路径泄露。若希望进一步减少来源信息，可在公共布局中设置 `no-referrer`。CSP 可以阻止未来意外加入的脚本和外部资源，但需兼容现有内联样式；防嵌入的 `frame-ancestors` 需要 HTTP 响应头，不能靠 meta 实现。
- **HTTP 外链**：`src/data/usefulLinks.ts:23` 的中科大个人主页仍使用 HTTP。HTTP 请求返回 200 且未跳转 HTTPS；HTTPS 探测超时，因此没有直接替换链接。它是点击后离站的链接，不是本站加载的混合内容；目标页传输存在被篡改的可能。可以在确认可用的 HTTPS 入口后更新。
- **供应链**：Actions 使用主版本标签，锁文件包含 311 个官方 npm registry 和 63 个 npmmirror 下载地址，全部使用 HTTPS 且有 integrity。没有发现异常下载源或已知漏洞。可将 Actions 固定到经过核验的完整 commit SHA，并考虑统一官方 registry，减少额外信任来源。

## 检查证据与边界

- 本地扫描覆盖 122 个工作区文件、251 个可达 Git 对象中的 101 个文本 blob，以及 23 个提交的消息。扫描私钥、常见服务令牌、明文凭据字段、URL 内嵌认证、本机路径和手机号/身份证格式，没有发现匹配项；不代表能够识别任意格式的秘密。
- 检查 71 个生成 HTML 页面和 90 个产物文件：没有发布 `.git`、`.vscode`、`.env`、源码目录或 source map，没有脚本、事件处理属性、远程资源或危险 URL 协议。静态站点没有登录、后台 API 或运行时用户输入。
- 对公式渲染进行了 9 组恶意输入检查，涵盖 JavaScript 链接、远程图片、HTML/CSS 命令和引号注入，均没有生成可执行节点或属性；当前 KaTeX 使用 `trust: false` 和 `strict: "error"`。
- `npm audit --registry=https://registry.npmjs.org --json`：374 个依赖，0 个已知漏洞，包含开发依赖。
- 对线上首页进行 HEAD 请求：HTTP 返回 301 到 HTTPS，HTTPS 返回 200 并提供 HSTS；没有 Set-Cookie 响应头。这是检查时的首页响应，不等同于验证所有托管设置。
- 未访问仓库后台、成员权限、分支保护、Actions Secrets 或部署审批配置；这些需要独立检查。报告没有复述个人邮箱完整地址或任何疑似凭据值。

## 外部参考与复现命令

参考 [GitHub Actions 安全使用指南](https://docs.github.com/en/actions/reference/security/secure-use)、[configure-pages v6 配置](https://github.com/actions/configure-pages/blob/v6/action.yml)和 [MDN Referrer-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Referrer-Policy)。

公开文档通过以下命令读取；仓库源码和历史扫描全部在本地执行：

```powershell
smart-search fetch 'https://docs.github.com/en/actions/reference/security/secure-use' --format json
smart-search fetch 'https://raw.githubusercontent.com/actions/configure-pages/v6/action.yml' --format json
smart-search fetch 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Referrer-Policy' --format json
npm audit --registry=https://registry.npmjs.org --json
git check-ignore --no-index .env.local .env.development .env.test .env.production .env
git rev-list --objects --all
```
