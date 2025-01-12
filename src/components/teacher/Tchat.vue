<template>
    <div>
        <h1>llama3大语言模型</h1>
        <div class="chat-wrapper">
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
                    <textarea rows="2" placeholder="请输入你的问题..." v-model="userInput" @keyup.enter="sendMessage"
                        class="custom-input"></textarea>
                    <button @click="sendMessage" :disabled="loading" class="send-button">
                        发送
                    </button>
                </div>



            </div>
        </div>
    </div>

</template>

<script>
import axios from 'axios';
import { marked } from 'marked'; // 引入 marked
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
                    messages: this.messages, // 发送完整的消息上下文
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
                this.scrollToBottom(); // 滚动到底部
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
            }, 20); // 每个字的间隔时间（以毫秒为单位，可以根据需求调整）
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
    height: 90%;
    width: 90%;
    /* 渐变背景 */
    border-radius: 25px;
    /* 更圆的边角 */
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1), inset 0 -1px 5px rgba(255, 255, 255, 0.8);
    /* 柔和阴影 */
    overflow: hidden;
    padding: 20px;
    /* 增加内边距 */
}

.welcome-message {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    /* 改为 flex-start，让内容靠上 */
    margin-top: 200px;
    /* 添加一个向下的偏移量 */
    font-size: 30px;
    color: #888;
    text-align: center;
}


.chat-messages {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    background-color: linear-gradient(145deg, #f8f9fa, #e9ecef);
    border-radius: 15px;
    margin-bottom: 150px;
    /* 保留空间，避免覆盖输入框 */
    /* 内部消息框也圆润 */

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
    background: linear-gradient(145deg, #d0e1ff, #a8c7ff);
    /* 苹果风格渐变 */
    color: #000;
    text-align: left;
    border-radius: 20px;
    padding-left: 20px;
    padding-right: 20px;
    max-width: 60%;
    margin-left: auto;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}

.assistant-message .message-bubble {
    background: linear-gradient(145deg, #e8f6e9, #c8e8cc);
    /* 苹果风格渐变 */
    color: #000;
    text-align: left;
    border-radius: 20px;
    padding-left: 20px;
    padding-right: 20px;
    max-width: 60%;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}


.chat-input {
    width: 50%;
    /* 调整为全宽度 */
    display: flex;
    align-items: center;
    background: rgba(0, 0, 0, 0.03);
    /* 苹果风格浅色背景 */
    border-radius: 15px;
    /* 输入框圆润 */
    position: absolute;
    left: 30%;
    bottom: 10%;
}

.custom-input {
    flex: 1;
    border: none;
    /* 去掉边框 */
    border-radius: 15px;
    padding: 5px;
    font-size: 16px;
    line-height: 1.5;
    background: transparent;
    /* 背景透明，与背景色一致 */
    outline: none;
    /* 去掉聚焦时的边框 */
    resize: none;
    /* 禁止拖动改变大小 */
    color: #333;
    /* 文本颜色 */
}

.custom-input::placeholder {
    color: #aaa;
    /* 占位符颜色 */
    font-style: italic;
}

.send-button {
    border: none;
    border-radius: 15px;
    font-size: 16px;
    padding: 10px 20px;
    background: #d0e8ff;
    /* 按钮渐变背景 */
    color: #333;
    cursor: pointer;
    transition: all 0.3s ease;
    /* 动画效果 */
}

.send-button:hover {
    background: linear-gradient(145deg, #a8d4ff, #d0e8ff);
    /* 按钮渐变反转 */
}

.send-button:disabled {
    background: #ccc;
    /* 禁用时按钮颜色 */
    cursor: not-allowed;
    /* 禁用时鼠标样式 */
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




@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>
