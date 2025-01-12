<template>
    <div>
        <!-- 学期选择 -->
        <el-select v-model="selectionQuery.semester" placeholder="选择学期" style="width: 180px; margin-bottom: 20px;"
            @change="onSemesterChange">
            <el-option v-for="option in semesterOptions" :key="option.value" :label="option.label"
                :value="option.value" />
        </el-select>

        <!-- 课程选择 -->
        <el-select v-model="selectionQuery.courseId" placeholder="选择课程" style="width: 180px; margin-bottom: 20px;"
            :disabled="!selectionQuery.semester" @change="onSemesterAndCourseChange">
            <el-option v-for="option in courseOptions" :key="option.value" :label="option.label"
                :value="option.value" />
        </el-select>

        <!-- 班级选择 -->
        <el-select v-model="selectionQuery.class" placeholder="选择班级" style="width: 180px; margin-bottom: 20px;"
            :disabled="!selectionQuery.courseId" @change="handleSelectionFilter">
            <el-option v-for="option in classOptions" :key="option.value" :label="option.label" :value="option.value" />
        </el-select>

        <!-- 筛选按钮 -->
        <el-button type="primary" @click="handleSelectionFilter" :disabled="!canFilter"
            style="margin-left: 10px;">筛选</el-button>

        <!-- 已发送通知列表 -->
        <el-table v-if="isFiltered" :data="emailList"
            style="width: 100%; margin-top: 20px; height: 70vh; overflow: auto;">
            <el-table-column type="expand">
                <template slot-scope="props">
                    <div class="email-expand-container">
                        <p class="email-expand-item">
                            <span class="email-expand-label">通知内容：</span>
                            <span class="email-expand-content">{{ props.row.content }}</span>
                        </p>
                        <p class="email-expand-item">
                            <span class="email-expand-label">收件人：</span>
                            <span class="email-expand-content">{{ props.row.studentIds }}</span>
                        </p>
                    </div>
                </template>
            </el-table-column>

            <el-table-column label="通知标题" prop="header" width="200">
            </el-table-column>
            <el-table-column label="通知内容" prop="content" width="400">
                <template slot-scope="scope">
                    <div class="content-ellipsis">{{ scope.row.content }}</div>
                </template>
            </el-table-column>
            <el-table-column label="收件人" prop="studentIds" width="150">
                <template slot-scope="scope">
                    <div class="content-ellipsis">{{ scope.row.studentIds }}</div>
                </template>
            </el-table-column>
            <el-table-column label="发送时间" prop="sendTime" width="160">
            </el-table-column>
        </el-table>


        <!-- 操作按钮 -->
        <div class="button-container" v-if="isFiltered">
            <el-button type="primary" @click="openNewNotificationModal" plain>新建通知</el-button>
        </div>

        <!-- 新通知弹窗 -->
        <el-dialog title="新建通知" :visible.sync="isModalVisible" width="70%">
            <div style="display: flex; gap: 20px;">
                <!-- 左侧：学生选择 -->
                <div style="flex: 1;">
                    <el-table ref="multipleTable" :data="studentList" tooltip-effect="dark"
                        style="width: 100%; height: 400px; overflow-y: auto;"
                        @selection-change="handleStudentSelectionChange">
                        <el-table-column type="selection" width="55"></el-table-column>
                        <el-table-column prop="studentId" label="学号" width="120"></el-table-column>
                        <el-table-column prop="studentName" label="姓名" width="150"></el-table-column>
                    </el-table>
                </div>

                <!-- 右侧：通知编辑 -->
                <div style="flex: 2;">
                    <el-input v-model="newNotification.header" placeholder="通知标题" style="margin-bottom: 10px;" />
                    <el-input type="textarea" v-model="newNotification.content" placeholder="通知内容" rows="10"
                        style="margin-bottom: 10px;" />
                </div>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="isModalVisible = false">取消</el-button>
                <el-button type="primary" @click="sendNotification">发送通知</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import axios from "axios";

export default {
    data() {
        return {
            selectionQuery: {
                semester: "",
                courseId: "",
                class: ""
            },
            semesterOptions: [
                { label: "2023-2024秋季", value: "2023-2024秋季" },
                { label: "2023-2024冬季", value: "2023-2024冬季" },
                { label: "2023-2024春季", value: "2023-2024春季" }
            ],
            courseOptions: [],
            classOptions: [],
            studentList: [], // 班级学生列表
            emailList: [], // 已发送通知列表
            isFiltered: false, // 是否已筛选班级
            isModalVisible: false, // 弹窗是否显示
            newNotification: {
                header: "",
                content: ""
            }, // 新通知信息
            selectedStudents: [] // 选中的学生 ID 列表
        };
    },
    computed: {
        // 只有当学期、课程和班级都选择了，筛选按钮才可用
        canFilter() {
            return this.selectionQuery.semester && this.selectionQuery.courseId && this.selectionQuery.class;
        }
    },
    methods: {
        // 当学期变化时，加载对应课程数据
        async onSemesterChange() {
            this.selectionQuery.courseId = ""; // 清空课程选择
            this.selectionQuery.class = ""; // 清空班级选择
            this.courseOptions = []; // 清空课程列表
            this.classOptions = []; // 清空班级列表

            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    this.$message.error('请先登录');
                    this.$router.push('/login'); // 如果没有 token，跳转到登录页面
                    return;
                }

                const response = await axios.get('http://localhost:8081/teacher/course', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    params: {
                        semester: this.selectionQuery.semester
                    }
                });

                if (response.data.code === 1) {
                    // 去重
                    const rawData = response.data.data;
                    const uniqueData = Array.from(new Map(rawData.map(item => [item.courseId, item])).values());

                    this.courseOptions = uniqueData.map((item) => ({
                        label: item.courseId + " " + item.courseName,
                        value: item.courseId
                    }));
                } else {
                    console.error("获取课程数据失败:", response.data.msg);
                }
            } catch (error) {
                console.error("加载课程数据失败:", error);
                this.$message.error('加载课程数据失败，请稍后重试');
            }
        },

        // 当学期和课程变化时，加载对应班级数据
        async onSemesterAndCourseChange() {
            this.selectionQuery.class = ""; // 清空班级选择
            this.classOptions = []; // 清空班级列表

            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    this.$message.error('请先登录');
                    this.$router.push('/login'); // 如果没有 token，跳转到登录页面
                    return;
                }

                console.log("当前选择的条件：", this.selectionQuery);

                const response = await axios.get('http://localhost:8081/teacher/course', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    params: {
                        semester: this.selectionQuery.semester,
                        courseId: this.selectionQuery.courseId
                    }
                });

                if (response.data.code === 1) {
                    // 去重
                    const rawData = response.data.data;
                    const uniqueData = Array.from(new Map(rawData.map(item => [item.classId, item])).values());

                    this.classOptions = uniqueData.map((item) => ({
                        label: item.classId,
                        value: item.classId
                    }));
                } else {
                    console.error("获取课程数据失败:", response.data.msg);
                }
            } catch (error) {
                console.error("加载课程数据失败:", error);
                this.$message.error('加载课程数据失败，请稍后重试');
            }
        },
        // 筛选按钮点击事件
        handleSelectionFilter() {
            this.FetchEmailList();
            this.isFiltered = true; // 标记为已筛选
        },

        async FetchEmailList() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    this.$message.error('请先登录');
                    this.$router.push('/login'); // 如果没有 token，跳转到登录页面
                    return;
                }

                const response = await axios.get('http://localhost:8081/teacher/EmailList', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    params: {
                        semester: this.selectionQuery.semester,
                        courseId: this.selectionQuery.courseId,
                        classId: this.selectionQuery.class
                    }
                });

                if (response.data.code === 1) {
                    this.emailList = response.data.data.map(item => ({
                        studentIds: item.studentIds,
                        header: item.header,
                        content: item.content,
                        sendTime: this.formatDateTime(item.sendTime)
                    }));
                    console.log(this.emailList);
                } else {
                    console.error("获取通知列表数据失败:", response.data.msg);
                }
            } catch (error) {
                console.error("加载通知列表数据失败:", error);
                this.$message.error('加载通知列表数据失败，请稍后重试');
            }
        },
        // 添加一个用于格式化时间的辅助方法
        formatDateTime(dateString) {
            if (!dateString) return ""; // 防止空值导致错误
            const date = new Date(dateString); // 将字符串转换为 Date 对象
            const options = {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }; // 定义日期格式化选项，不包括时区
            return date.toLocaleString('zh-CN', options); // 使用 zh-CN 格式化
        },

        // 打开新通知弹窗
        openNewNotificationModal() {
            this.FetchStudentList();
            this.isModalVisible = true;
            this.newNotification = {
                title: "",
                content: ""
            };
            this.selectedStudents = [];
        },

        // 获取该班级下的所有学生
        async FetchStudentList() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    this.$message.error('请先登录');
                    this.$router.push('/login'); // 如果没有 token，跳转到登录页面
                    return;
                }

                const response = await axios.get('http://localhost:8081/teacher/studentScoreList', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    params: {
                        semester: this.selectionQuery.semester,
                        courseId: this.selectionQuery.courseId,
                        classId: this.selectionQuery.class
                    }
                });

                if (response.data.code === 1) {
                    this.studentList = response.data.data.map(item => ({
                        studentId: item.studentId,
                        studentName: item.name,
                    }));
                } else {
                    console.error("获取学生列表数据失败:", response.data.msg);
                }
            } catch (error) {
                console.error("加载学生列表数据失败:", error);
                this.$message.error('加载学生列表数据失败，请稍后重试');
            }
        },

        // 处理学生选择
        handleStudentSelectionChange(selected) {
            this.selectedStudents = selected.map((student) => student.studentId);
            console.log("选中的学生 ID 列表：", this.selectedStudents);
        },

        // 发送通知
        async sendNotification() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    this.$message.error('请先登录');
                    this.$router.push('/login'); // 如果没有 token，跳转到登录页面
                    return;
                }
                if (!this.newNotification.header || !this.newNotification.content) {
                    this.$message.error("请填写通知标题和内容");
                    return;
                }

                // 将选中的学生数组转换成字符串
                const studentIdsString = this.selectedStudents.join(",");

                const response = await axios.put('http://localhost:8081/teacher/sendEmail', {
                    semester: this.selectionQuery.semester,
                    courseId: this.selectionQuery.courseId,
                    classId: this.selectionQuery.class,
                    studentIds: studentIdsString,
                    header: this.newNotification.header,
                    content: this.newNotification.content,
                }, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });


                if (response.data.code === 1) {
                    this.$message.success('通知发送成功');
                    this.FetchEmailList(); // 刷新列表
                } else {
                    this.$message.error('通知发送失败，请稍后重试');
                }

                this.isModalVisible = false; // 关闭弹窗
            } catch (error) {
                console.error("通知发送失败:", error);
                this.$message.error('通知发送失败，请稍后重试');
            }
        },

    }
};
</script>

<style scoped>
.button-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
}

.email-expand-container {
    width: 60%;
    color: #333;
    /* 默认字体颜色 */
    line-height: 1.8;
    /* 行高 */
}

.email-expand-item {
    margin-bottom: 10px;
    /* 间距 */
    display: flex;
    /* 横向排列 */
}

.email-expand-label {
    flex-shrink: 0; /* 防止标签被压缩 */
    white-space: nowrap; /* 防止标签换行 */
    font-weight: bold;
    /* 加粗 */
    margin-right: 10px;
    /* 标签和内容的间距 */
}



.content-ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100%;
    /* 确保宽度受限 */
    display: block;
}
</style>
