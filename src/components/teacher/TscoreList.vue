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
            :disabled="!selectionQuery.courseId">
            <el-option v-for="option in classOptions" :key="option.value" :label="option.label" :value="option.value" />
        </el-select>

        <!-- 筛选按钮 -->
        <el-button type="primary" @click="handleSelectionFilter" :disabled="!canFilter"
            style="margin-left: 10px;">筛选</el-button>

        <!-- 学生成绩情况表格 -->
        <div class="table-container">
            <el-table :data="studentList" style="width: 100%;" height="500px">
                <el-table-column fixed prop="studentId" label="学号" width="250"></el-table-column>
                <el-table-column prop="studentName" label="学生姓名" width="250"></el-table-column>
                <el-table-column prop="normalScore" label="平时成绩" width="200">
                    <template #default="scope">
                        <el-input v-if="isEditing" v-model="scope.row.normalScore" size="small"></el-input>
                        <span v-else>{{ scope.row.normalScore }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="testScore" label="考试成绩" width="200">
                    <template #default="scope">
                        <el-input v-if="isEditing" v-model="scope.row.testScore" size="small"></el-input>
                        <span v-else>{{ scope.row.testScore }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="totalScore" label="总成绩" width="200">
                    <template #default="scope">
                        <el-input v-if="isEditing" v-model="scope.row.totalScore" size="small"></el-input>
                        <span v-else>{{ scope.row.totalScore }}</span>
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <!-- 操作按钮 -->
        <div class="button-container">
            <el-button type="primary" @click="enableEditing" v-if="!isEditing" style="margin-right: 10px;"
                plain>上传成绩</el-button>
            <el-button v-if="isEditing" type="primary" @click="saveScores" style="margin-right: 10px;">保存成绩</el-button>
            <el-button v-if="isEditing" type="danger" @click="cancelEditing" style="margin-right: 10px;">取消</el-button>
        </div>
    </div>
</template>

<script>
import axios from "axios";

export default {
    data() {
        return {
            selectionQuery: {
                semester: "", // 当前选择的学期
                courseId: "", // 当前选择的课程
                class: "" // 当前选择的班级
            },
            semesterOptions: [
                { label: "2023-2024秋季", value: "2023-2024秋季" },
                { label: "2023-2024冬季", value: "2023-2024冬季" },
                { label: "2023-2024春季", value: "2023-2024春季" }
            ], // 固定学期选项
            courseOptions: [], // 课程选项
            classOptions: [], // 班级选项
            studentList: [],
            isEditing: false, // 是否处于编辑模式
            originalStudentList: [] // 保存原始成绩，用于取消
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
            this.FetchStudentList();
        },

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
                        courseId: item.courseId,
                        courseName: item.courseName,
                        classTime: item.classTime,
                        classId: item.classId,
                        normalScore: item.normalScore,
                        testScore: item.testScore,
                        totalScore: item.totalScore,
                        semester: this.selectionQuery.semester // 添加学期字段
                    }));
                } else {
                    console.error("获取学生列表数据失败:", response.data.msg);
                }
            } catch (error) {
                console.error("加载学生列表数据失败:", error);
                this.$message.error('加载学生列表数据失败，请稍后重试');
            }
        },

        // 启用编辑模式
        enableEditing() {
            this.isEditing = true;
            // 备份当前成绩，供取消时恢复
            this.originalStudentList = JSON.parse(JSON.stringify(this.studentList));
            console.log("原始成绩：", this.originalStudentList);
        },

        // 保存成绩
        async saveScores() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    this.$message.error('请先登录');
                    this.$router.push('/login'); // 如果没有 token，跳转到登录页面
                    return;
                }

                console.log("保存的成绩：", this.studentList);

                const response = await axios.put('http://localhost:8081/teacher/updateScores', this.studentList, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.data.code === 1) {
                    this.$message.success('成绩保存成功');
                    this.isEditing = false;
                    this.FetchStudentList(); // 刷新列表
                } else {
                    this.$message.error('成绩保存失败，请稍后重试');
                }
            } catch (error) {
                console.error("保存成绩失败:", error);
                this.$message.error('保存成绩失败，请稍后重试');
            }
        },

        // 取消编辑模式
        cancelEditing() {
            this.isEditing = false;
            // 恢复到编辑之前的成绩
            this.studentList = JSON.parse(JSON.stringify(this.originalStudentList));
        },
    },
};
</script>

<style scoped>
.table-container {
    margin-top: 20px;
    overflow-y: auto;
}

.button-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
}
</style>
