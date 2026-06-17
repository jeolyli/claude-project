---
name: text-to-image
description: >
  文生图工具。调用 GPT-Image-2 API (通过 apimart.ai 代理) 生成图片。
  支持异步任务提交 + 轮询状态 + 自动下载。
  当用户提到生成图片、AI绘画、文生图、AI画图时使用此 skill。
metadata:
  author: jialili
  version: "1.0.0"
  api:
    backend: apimart
    model: gpt-image-2
    base_url: https://api.apimart.ai/v1
---

# Text-to-Image: GPT-Image-2 文生图

通过 apimart.ai 代理调用 GPT-Image-2 生成图片。**不是官方 OpenAI API，请求/响应格式与官方有差异。**

## API 认证

```
API Key: sk-OZCYZtvbNwhr4R1btk1V3AG2GsfTnXK2FSE3Ab52IY2dm5UN
Base URL: https://api.apimart.ai/v1
```

## 生成流程

### Step 1: 提交生成任务

```bash
curl -s -X POST "https://api.apimart.ai/v1/images/generations" \
  -H "Authorization: Bearer sk-OZCYZtvbNwhr4R1btk1V3AG2GsfTnXK2FSE3Ab52IY2dm5UN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-image-2",
    "prompt": "<用户的提示词>",
    "n": 1,
    "size": "<尺寸>"
  }'
```

**参数说明：**

| 参数 | 说明 | 可选值 |
|------|------|--------|
| `prompt` | 图片描述提示词 | 任意文本 |
| `n` | 生成数量 | 固定 `1` |
| `size` | 图片尺寸 | `1024x1024`(1:1), `1792x1024`(16:9), `1024x1792`(9:16) |

**响应：**
```json
{"code": 200, "data": [{"status": "submitted", "task_id": "task_xxx"}]}
```

从中提取 `task_id`。

### Step 2: 轮询任务状态

每隔 **15 秒** 查询一次（不得缩短间隔）：

```bash
curl -s "https://api.apimart.ai/v1/tasks/${TASK_ID}" \
  -H "Authorization: Bearer sk-OZCYZtvbNwhr4R1btk1V3AG2GsfTnXK2FSE3Ab52IY2dm5UN"
```

**轮询响应 — 处理中：**
```json
{"code": 200, "data": {"progress": 50, "status": "processing"}}
```

**轮询响应 — 已完成：**
```json
{"code": 200, "data": {"progress": 100, "result": {"images": [{"url": "https://ts.apib.ai/f/iamge/xxx.png"}]}}}
```

**轮询规则：**
- 间隔固定 15 秒
- 每次向用户汇报当前 `progress` 百分比
- 最多轮询 20 次（约 5 分钟），超时则提示用户稍后重试

### Step 3: 下载图片

拿到 `result.images[0].url` 后下载：

```bash
curl -s -L "<图片URL>" -o "<输出路径>"
```

## 输出路径规则

- 用户指定了目录 → 保存到指定目录
- 用户未指定 → 在当前工作目录创建 `temp/` 文件夹保存
- 文件命名：`image_<timestamp>.png`

## 支持的尺寸

| 场景 | size | 宽高比 |
|------|------|--------|
| 正方形 (头像/默认) | `1024x1024` | 1:1 |
| 横版 (PPT/宽屏) | `1792x1024` | 16:9 |
| 竖版 (手机/海报) | `1024x1792` | 9:16 |

默认使用 `1024x1024`，除非用户明确提到宽屏/横版/PPT配图（→16:9）或竖版/手机/海报（→9:16）。

## 使用示例

```
用户: 帮我生成一张赛博朋克风格的城市夜景图
→ 执行: 提交 1024x1024 任务 → 轮询 15s × N → 下载到 temp/
→ 回复: 已生成: temp/image_20260617_113015.png (1.8 MB)
```

## 注意事项

- 该 API 是异步的——提交后返回 task_id，需要轮询获取结果
- 不支持 `response_format: "b64_json"` 或 `response_format: "url"` 同步模式
- 请求格式与 OpenAI 官方不同，不要套用 OpenAI SDK
- 轮询间隔不能短于 15 秒，短间隔会导致 rate limit
- API Key 已内置，无需用户提供
