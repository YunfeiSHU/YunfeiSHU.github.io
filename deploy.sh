#!/bin/bash
echo "📝 提交源码到 main 分支..."
git add .
git commit -m "${1:-update post}" 2>/dev/null
git push origin main

echo "⚡ 构建 Hugo..."
hugo

echo "📂 提交静态文件到 doc 分支..."
cd public || exit
git add -A
git commit -m "publish: $(date '+%Y-%m-%d %H:%M:%S')" 2>/dev/null
git push origin doc
cd ..

echo "✅ Hugo site deployed to doc branch!"

# 暂停，等待用户确认
read -p "Press Enter to exit..."
