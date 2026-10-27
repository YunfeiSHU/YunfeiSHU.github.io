export type ProjectCategory = "全栈 · Java / Go" | "全栈 · Go / Python";

export interface ProjectModule {
	name: string;
	detail: string;
}

export interface Project {
	slug: string;
	name: string;
	summary: string;
	stack: string[];
	modules: ProjectModule[];
	highlights: string[];
	repoUrl: string;
	category: ProjectCategory;
	featured: boolean;
	updated: string;
}

/**
 * 只列出最近更新、且由本人维护的真实仓库。
 * 数据来自 GitHub 仓库元数据与 README，不补充未写明的性能数字或上线成果。
 */
export const projects: Project[] = [
	{
		slug: "media-community",
		name: "音视频社区",
		summary:
			"React + Java + Go 三层的前后端分离音视频社区：Web 负责页面与播放器，Java 负责账号、交易与权限，Go 负责视频、直播与弹幕。",
		stack: [
			"React 18",
			"TypeScript",
			"TanStack Query",
			"hls.js",
			"Java 17",
			"Spring Boot 3",
			"Spring Cloud Gateway",
			"Nacos",
			"Go 1.25",
			"Gin",
			"MySQL 8",
			"Redis 7",
			"RabbitMQ",
			"MinIO",
			"SRS",
			"FFmpeg",
			"Docker Compose",
		],
		modules: [
			{
				name: "账号与鉴权",
				detail:
					"手机号 / 邮箱注册、验证码、登录刷新登出；网关统一校验 JWT 并注入用户身份。",
			},
			{
				name: "用户与社交",
				detail: "资料与头像编辑、公开主页、关注 / 粉丝分页，关注与取关幂等。",
			},
			{
				name: "点播与上传",
				detail:
					"5 MiB 分片并发上传、断点续传；FFmpeg 转多码率 HLS，投稿可编辑、下架、删除。",
			},
			{
				name: "直播",
				detail:
					"直播间创建、开播 / 结束、OBS 推流地址、心跳与在线人数，观众端 HLS 优先、FLV 兜底。",
			},
			{
				name: "弹幕",
				detail:
					"点播按视频时间轴回放历史弹幕；直播通过 WebSocket 实时广播，进入房间下发最近弹幕。",
			},
			{
				name: "商城与订单",
				detail: "商品 / SKU / 库存校验、下单与模拟支付、订单列表与详情。",
			},
			{
				name: "管理后台",
				detail: "分类与敏感词维护、强制关闭直播间、视频下架、按用户查询。",
			},
		],
		highlights: [
			"Web 只做展示与交互，权限、库存、金额以服务端为准",
			"Java 承担需要事务的账号 / 商品 / 订单，Go 承担大文件、转码与长连接",
			"下游只信任网关注入的 X-User-Id / X-User-Role，不重复解析 JWT",
		],
		repoUrl: "https://github.com/YunfeiSHU/media-community",
		category: "全栈 · Java / Go",
		featured: true,
		updated: "2026-10-27",
	},
	{
		slug: "ai-assistant",
		name: "个人智能 Agent 平台",
		summary:
			"面向个人知识工作的全栈 AI 助手：Web 负责对话与知识库界面，Go 负责身份、会话与配额，Python 负责 Agent、RAG、Memory 与异步任务。",
		stack: [
			"React 19",
			"TypeScript",
			"TanStack Query",
			"Zustand",
			"Go 1.24",
			"Gin",
			"Kratos (gRPC)",
			"Python 3.12",
			"FastAPI",
			"自研 Agent Loop",
			"MCP",
			"Milvus",
			"Kafka",
			"MySQL 8",
			"Redis",
			"MinIO",
			"OpenTelemetry",
			"Docker Compose",
		],
		modules: [
			{
				name: "认证与用户",
				detail:
					"注册登录、刷新、改密；access token 只存内存，refresh 走 HttpOnly Cookie。",
			},
			{
				name: "会话与消息",
				detail:
					"会话置顶 / 归档、消息游标分页、单条删除与重新生成，侧栏按标题和内容搜索。",
			},
			{
				name: "对话与 Agent",
				detail:
					"SSE 流式输出、停止生成、工具调用轨迹；自研 Agent Loop 配合 MCP 工具接入。",
			},
			{
				name: "知识库与 RAG",
				detail:
					"文档解析 → 结构感知切片 → Embedding → Milvus → 召回合并 → 重排 → 来源引用。",
			},
			{
				name: "记忆",
				detail:
					"短期上下文、摘要压缩与长期记忆三层，支持上下文预算、裁剪与记忆开关。",
			},
			{
				name: "异步任务",
				detail:
					"任务状态机、SSE 进度流、取消与失败重试，inline 与 Kafka Worker 两种执行方式。",
			},
			{
				name: "配额与限流",
				detail:
					"6 维配额、用量仪表盘、429 倒计时，网关侧预扣、回滚与限流。",
			},
		],
		highlights: [
			"Web 薄、Go 管身份 / 会话 / 配额、Python 管 AI 能力，数据保持单一属主",
			"对话流式输出走 SSE，其余接口由 Go 网关透传",
			"配额在网关侧预扣与回滚，Python 只上报用量",
		],
		repoUrl: "https://github.com/YunfeiSHU/ai-assistant",
		category: "全栈 · Go / Python",
		featured: true,
		updated: "2026-10-27",
	},
];

export const featuredProjects: Project[] = projects.filter(
	(project) => project.featured,
);
