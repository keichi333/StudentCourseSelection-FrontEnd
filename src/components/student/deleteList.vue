<template>
    <div>
        <h3>目前选课</h3>


        <!-- 总学分显示 -->
        <div style="margin-top: 20px;margin-bottom: 20px;">
            <strong>总学分：{{ totalCredits }}</strong>
        </div>

        <!-- 数据表格 -->
        <el-table :data="selectionList" stripe style="width: 100%">
            <el-table-column prop="courseId" label="课程号"></el-table-column>
            <el-table-column prop="courseName" label="课程名"></el-table-column>
            <el-table-column prop="teacherId" label="教师号"></el-table-column>
            <el-table-column prop="teacher" label="教师"></el-table-column>
            <el-table-column prop="credits" label="学分"></el-table-column>
            <el-table-column prop="classTime" label="上课时间"></el-table-column>

            <!-- 操作列 -->
            <el-table-column label="操作" width="150">
                <template slot-scope="scope">
                    <el-button @click="handleDeleteConfirmation(scope.row)" size="small" type="danger">退课</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 二次确认对话框 -->
        <el-dialog title="确认退课" :visible.sync="dialogVisible" width="400px">
            <span>您确定要退选这门课程：{{ courseToDelete?.courseName }} 吗？</span>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleDelete">确认退课</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'deleteList',

    methods: {
        // 获取当前学期
        async fetchSemester() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    this.$message.error('请先登录');
                    this.$router.push('/login');  // 如果没有 token，跳转到登录页面
                    return;
                }

                const response = await axios.get('http://localhost:8081/student/semester', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                });
                this.selectionQuery.semester = response.data.data;

                this.fetchSelectionData();

            } catch (error) {
                console.error('请求学期数据失败', error);
                this.$message.error('数据请求失败，请稍后重试');
                if (error.response && error.response.status === 401) {
                    this.$router.push('/login');
                }
            }
        },


        // 显示逻辑
        async fetchSelectionData() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    this.$message.error('请先登录');
                    this.$router.push('/login');  // 如果没有 token，跳转到登录页面
                    return;
                }

                const response = await axios.get('http://localhost:8081/student/selection', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    params: {
                        semester: this.selectionQuery.semester
                    }
                });

                if (response.data && Array.isArray(response.data.data)) {
                    this.selectionList = response.data.data.map(item => ({
                        courseId: item.courseId,
                        courseName: item.courseName,
                        teacher: item.staffName,
                        credits: item.credit,
                        classTime: item.classTime,
                        teacherId: item.staffId
                    }));
                }
            } catch (error) {
                console.error('请求选课数据失败', error);
                this.$message.error('选课数据请求失败，请稍后重试');
            }
        },
        handleSelectionFilter() {
            this.fetchSelectionData();
        },

        // 显示二次确认对话框
        handleDeleteConfirmation(course) {
            this.courseToDelete = course;
            this.dialogVisible = true;
        },

        // 退课逻辑
        async handleDelete() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    this.$message.error('请先登录');
                    this.$router.push('/login');  // 如果没有 token，跳转到登录页面
                    return;
                }

                const response = await axios.delete('http://localhost:8081/student/delete', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    data: {
                        courseId: this.courseToDelete.courseId,   // 当前行的课程ID
                        semester: this.selectionQuery.semester // 当前学期
                    }
                });

                if (response.data.code === 1) {
                    this.$message.success('退课成功');
                    this.fetchSelectionData();
                    this.dialogVisible = false;  // 退课成功后关闭对话框
                } else {
                    this.$message.error('退课失败: ' + response.data.msg);
                    this.dialogVisible = false;  // 退课失败后关闭对话框
                }
            } catch (error) {
                console.error('退课请求失败', error);
                this.$message.error('退课失败，请稍后重试');
                this.dialogVisible = false;  // 退课失败后关闭对话框
            }
        },
    },

    computed: {
        // 计算总学分
        totalCredits() {
            return this.selectionList.reduce((sum, course) => sum + (course.credits || 0), 0);
        }
    },

    data() {
        return {
            selectionQuery: {
                semester: ''  
            },
            selectionList: [],
            dialogVisible: false,  // 控制对话框是否可见
            courseToDelete: null,  // 要退的课程
        };
    },

    mounted() {
        this.fetchSemester();
        this.fetchSelectionData();
    }
};
</script>

<style scoped>
.search-row {
    margin-bottom: 20px;
}

.el-select {
    width: 100%;
}

strong {
    font-size: 16px;
    color: #575e64;
}
</style>
