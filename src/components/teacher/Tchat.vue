<template>
    <div>
        <h1>llama3大语言模型</h1>
        <div class="chat-wrapper" >
            <div class="chat-container">
                <!-- 初始提示 -->
                <div v-if="messages.length === 0" class="welcome-message">
                    嘿！有什么需要帮助的吗？🦙🦙
                </div>
                <!-- 聊天记录 -->
                <div class="chat-messages" ref="chatMessages" v-else>
                    <div v-for="(message, index) in messages" :key="index"
                        :class="['message', message.role === 'user' ? 'user-message' : 'assistant-message']">
                        <!-- 头像 -->
                        <div v-if="message.role === 'assistant'" class="avatar">
                            <img src="@/assets/ollama.png" alt="Assistant Avatar" />
                        </div>
                        <div class="message-bubble">
                            <!-- 渲染处理后的 HTML -->
                            <div v-html="renderContent(message.content)" v-if="!message.loading"></div>
                            <div v-else class="loading-spinner">
                                <span class="spinner"></span> <i style="height: 40px; padding-top: 20px ;">正在加载...</i>
                            </div>
                        </div>
                    </div>


                </div>

                <!-- 输入框 -->
                <div class="chat-input" style="padding:20px">
                    <el-input type="textarea" rows="3" placeholder="请输入你的问题..." v-model="userInput"
                        @keyup.enter.native="sendMessage"
                        style="padding-right: 20px; padding-bottom: 20px; font-size: 18px;"></el-input>
                    <el-button type="primary" @click="sendMessage" :loading="loading" icon="el-icon-chat-dot-round"
                        plain>发送</el-button>
                </div>
            </div>
        </div>
    </div>

</template>

<script>
import axios from 'axios';
import {marked} from 'marked'; // 引入 marked
import katex from 'katex'; // 引入 katex
import "katex/dist/katex.min.css"; // 引入 katex 样式


export default {
    data() {
        return {
            messages: [], // 保存聊天记录
            userInput: "", // 用户输入内容
            loading: false, // 加载状态
        };
    },
    methods: {
        renderContent(content) {
            if (!content) return "";

            // Markdown 渲染
            let html = marked(content);

            // 使用 Katex 渲染 LaTeX 公式
            html = html.replace(/\$\$(.+?)\$\$/g, (_, equation) => {
                try {
                    return katex.renderToString(equation, { displayMode: true });
                } catch (err) {
                    console.error("LaTeX 渲染错误", err);
                    return `<span style="color: red;">公式渲染错误</span>`;
                }
            });

            html = html.replace(/\$(.+?)\$/g, (_, equation) => {
                try {
                    return katex.renderToString(equation, { displayMode: false });
                } catch (err) {
                    console.error("LaTeX 渲染错误", err);
                    return `<span style="color: red;">公式渲染错误</span>`;
                }
            });

            return html;
        },

        async sendMessage() {
            if (!this.userInput.trim()) return;

            // 添加用户消息到聊天记录
            this.messages.push({ role: "user", content: this.userInput });
            const userMessage = this.userInput; // 保存输入内容
            this.userInput = ""; // 清空输入框

            // 添加一个加载中的助手消息
            const loadingMessage = { role: "assistant", content: "", loading: true };
            this.messages.push(loadingMessage);

            this.loading = true; // 设置加载状态

            try {
                // 调用后端接口
                const response = await axios.post("http://localhost:11434/api/chat", {
                    model: "llama3",
                    messages: [{ role: "user", content: userMessage }],
                    stream: false,
                });

                if (response.data && response.data.message) {
                    // 使用逐字加载的方式显示内容
                    this.simulateTyping(response.data.message.content, loadingMessage);
                }
            } catch (error) {
                console.error("请求失败", error);
                loadingMessage.content = "请求失败，请稍后重试。";
                loadingMessage.loading = false;
            } finally {
                this.loading = false; // 取消发送按钮的加载状态
            }
        },
        simulateTyping(fullText, loadingMessage) {
            let currentIndex = 0;
            loadingMessage.loading = false; // 停止加载动画

            // 定时器逐字加载
            const interval = setInterval(() => {
                if (currentIndex < fullText.length) {
                    loadingMessage.content += fullText[currentIndex];
                    currentIndex++;
                    this.scrollToBottom(); // 滚动到底部
                } else {
                    clearInterval(interval); // 停止定时器
                }
            }, 10); // 每个字的间隔时间（以毫秒为单位，可以根据需求调整）
        },
        scrollToBottom() {
            const chatMessages = this.$refs.chatMessages;
            if (chatMessages) {
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        },
    },

};
</script>

<style scoped>
.chat-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 80vh;
}

.chat-container {
    display: flex;
    flex-direction: column;
    height: 80%;
    width: 80%;
    background-color: #fff;
    border-radius: 15px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.welcome-message {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 30px;
    color: #888;
    text-align: center;
}

.chat-messages {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
}

.message {
    margin: 20px 0;
    display: flex;
    align-items: flex-start;
}

.message-bubble {
    font-size: 16px;
    line-height: 1.5;
    word-wrap: break-word;
}

.katex-display {
    margin: 10px 0;
    text-align: center;
}

.katex {
    font-size: 1.2em;
}


.user-message .message-bubble {
    background-color: #e1f5fe;
    color: #000;
    text-align: left;
    border-radius: 10px;
    padding-left: 20px;
    padding-right: 20px;
    display: inline-block;
    max-width: 60%;
    margin-left: auto;
}

.assistant-message .message-bubble {
    background-color: #e8f5e9;
    color: #000;
    text-align: left;
    border-radius: 10px;
    padding-left: 20px;
    padding-right: 20px;
    display: inline-block;
    max-width: 60%;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.chat-input {
    border-top: 1px solid #eee;
    width: 60%;
    display: flex;
    align-items: center;
    padding: 10px;
    background-color: #fff;

    margin: 0 auto;
    /* 将其水平居中 */
    position: relative;
    /* 确保不会受到其他布局影响 */
}

.chat-input .el-input {
    flex: 1;
    margin-right: 10px;
}


.loading-spinner {
    display: flex;
    align-items: center;
}

.spinner {
    width: 15px;
    height: 15px;
    border: 2px solid #ccc;
    border-top-color: #000;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-right: 10px;
}

.avatar {
    width: 40px;
    height: 60px;
    margin-right: 10px;
    overflow: hidden;
    flex-shrink: 0;
    display: flex;
    justify-content: center;
    align-items: center;
}

.avatar img {
    width: 60%;
    height: 50%;
    object-fit: cover;
}

.user-message .avatar {
    display: none;
    /* 不显示用户的头像 */
}


@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>
