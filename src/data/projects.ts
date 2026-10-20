export type ProjectCategory = "Java 微服务" | "AI 应用";

export interface Project {
	slug: string;
	name: string;
	summary: string;
	stack: string[];
	features: string[];
	challenges: string[];
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
		slug: "media-community-backend",
		name: "音视频社区后端",
		summary:
			"微服务架构的音视频社区后端，覆盖账号、商品、订单三条业务链路，以及视频点播、直播和弹幕。",
		stack: [
			"Java 17",
			"Spring Boot",
			"Spring Cloud Gateway",
			"Nacos",
			"Dubbo 3",
			"Go",
			"Gin",
			"GORM",
			"MySQL 8",
			"Redis 7",
			"RabbitMQ",
			"MinIO",
			"SRS",
			"FFmpeg",
			"Docker Compose",
		],
		features: [
			"账号、商品、订单的完整 Java 微服务链路",
			"大文件分片上传与断点续传，异步转码为多码率 HLS",
			"RTMP 推流，HLS / HTTP-FLV / WebRTC 拉流",
			"WebSocket 弹幕广播，含敏感词过滤与双层限流",
		],
		challenges: [
			"Java 与 Go 两套体系共用同一 MySQL / Redis，通过表名前缀与 Key 前缀做硬隔离",
			"统一网关校验 JWT，并向 Java/Go 服务传递一致的 X-User-Id 身份",
			"Java 侧用 Dubbo 做 RPC，Go 侧用 RabbitMQ 事件总线，明确两条通信边界",
			"已知限制：Go 服务未接入 Nacos、弹幕 Hub 为单实例、默认转码为 mock 驱动",
		],
		repoUrl: "https://github.com/YunfeiSHU/media-community-backend",
		category: "Java 微服务",
		featured: true,
		updated: "2026-10-01",
	},
	{
		slug: "ai-assistant",
		name: "个人智能 Agent 平台",
		summary:
			"Go + Python 分层构建的个人 AI Assistant：Go 负责网关、鉴权、会话与配额，Python 负责 LLM、Agent、RAG、Memory 与 MCP。",
		stack: [
			"Go 1.24",
			"Gin",
			"Kratos (gRPC)",
			"Python 3.12",
			"FastAPI",
			"LangChain",
			"LangGraph",
			"MySQL 8",
			"Redis",
			"Milvus",
			"MinIO",
			"Kafka",
			"Docker Compose",
			"OpenTelemetry",
		],
		features: [
			"注册登录、刷新令牌、会话与消息台账",
			"Chat / ChatStream（SSE）流式输出与上下文装配",
			"Agent 工具调用循环，含步数、时长、重复调用护栅",
			"RAG 知识库：解析、切片、嵌入、召回、重排与来源溯源",
			"Memory 三层、MCP 工具接入、异步任务与可观测性",
		],
		challenges: [
			"按“一份数据只有一个权威属主”切分 Go/Python，两侧共用 MySQL 但不重复建表",
			"Chat / ChatStream 走 gRPC，其余接口走 HTTP 透传，流式输出用 SSE",
			"网关侧做配额、限流、熔断与断连传播，Python 只上报 usage",
			"已知差距：Kubernetes 清单与 CI 尚未完成、缺少量化检索评测集",
		],
		repoUrl: "https://github.com/YunfeiSHU/ai-assistant",
		category: "AI 应用",
		featured: true,
		updated: "2026-10-01",
	},
];

export const featuredProjects: Project[] = projects.filter(
	(project) => project.featured,
);
