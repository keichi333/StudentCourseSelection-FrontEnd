<template>
    <div>
        <h3>成绩信息</h3>


        <!-- 数据表格 -->
        <el-table :data="selectionList" stripe style="width: 100%">
            <el-table-column prop="courseId" label="课程号"></el-table-column>
            <el-table-column prop="courseName" label="课程名"></el-table-column>
            <el-table-column prop="teacherId" label="教师号"></el-table-column>
            <el-table-column prop="teacher" label="教师"></el-table-column>
            <el-table-column prop="credits" label="学分"></el-table-column>
            <el-table-column prop="normalScore" label="平时成绩"></el-table-column>
            <el-table-column prop="testScore" label="考试成绩"></el-table-column>
            <el-table-column prop="totalScore" label="总成绩"></el-table-column>
            <el-table-column prop="gpa" label="绩点"></el-table-column>

        </el-table>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'scoreList',

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
                        teacherId: item.staffId,
                        normalScore: item.normalScore || '暂未发布',
                        testScore: item.testScore || '暂未发布',
                        totalScore: item.totalScore || '暂未发布',
                        gpa: item.gpa|| '暂未发布'
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

    },

    data() {
        return {
            selectionQuery: {
                semester: ''  
            },
            selectionList: [],
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