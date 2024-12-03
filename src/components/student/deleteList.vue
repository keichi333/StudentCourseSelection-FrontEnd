<template>
    <div>
        <h3>目前选课</h3>
        <!-- 筛选学期 -->
        <el-select v-model="selectionQuery.semester" placeholder="筛选学期" style="width: 180px; margin-bottom: 20px;">
            <el-option label="2023-2024秋季" value="2023-2024秋季"></el-option>
            <el-option label="2023-2024冬季" value="2023-2024冬季"></el-option>
            <el-option label="2023-2024春季" value="2023-2024春季"></el-option>
        </el-select>

        <!-- 筛选按钮 -->
        <el-button type="primary" @click="handleSelectionFilter" style="margin-left: 10px;">筛选</el-button>

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
                    <el-button @click="handleDelete(scope.row)" size="small" type="danger">退课</el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'deleteList',

    methods: {
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

        // 退课逻辑
        async handleDelete(course) {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    this.$message.error('请先登录');
                    this.$router.push('/login');  // 如果没有 token，跳转到登录页面
                    return;
                }
                console.log('Authorization:', `Bearer ${token}`);


                // 发送选择课程请求
                const response = await axios.delete('http://localhost:8081/student/delete', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    data: {
                        courseId: course.courseId,   // 当前行的课程ID
                        semester: this.selectionQuery.semester // 当前学期
                    }

                });

                // 打印响应数据，检查结构
                console.log(response.data);  // 打印后端返回的数据

                if (response.data.code === 1) {
                    this.$message.success('退课成功');
                    this.fetchSelectionData();
                } else {
                    this.$message.error('退课失败: ' + response.data.msg);
                }
            } catch (error) {
                console.error('退课请求失败', error);
                this.$message.error('退课失败，请稍后重试');
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
                semester: '2023-2024秋季'  // 默认学期为2023-2024秋季
            },
            selectionList: [],
        };
    },

    mounted() {
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