<template>
    <div>
        <!-- 搜索框 -->
        <el-row class="search-row" gutter={20} style="margin: 20px 0;">
            <el-col :span="6">
                <el-select v-model="searchStudentId" multiple filterable remote reserve-keyword placeholder="请输入学号"
                    :remote-method="remoteMethod" :loading="loading">
                    <el-option v-for="item in options" :key="item.value" :label="item.label"
                        :value="item.value"></el-option>
                </el-select>
            </el-col>

            <el-col :span="6">
                <el-select v-model="searchStudentName" multiple filterable remote reserve-keyword placeholder="请输入姓名"
                    :remote-method="remoteMethod" :loading="loading">
                    <el-option v-for="item in options" :key="item.value" :label="item.label"
                        :value="item.value"></el-option>
                </el-select>
            </el-col>

            <el-col :span="6">
                <el-select v-model="searchSemester" filterable placeholder="请选择学期">
                    <el-option v-for="item in options" :key="item.value" :label="item.label"
                        :value="item.value"></el-option>
                </el-select>
            </el-col>

            <el-col :span="6">
                <el-select v-model="searchCourseId" multiple filterable remote reserve-keyword placeholder="请输入课程号"
                    :remote-method="remoteMethod" :loading="loading">
                    <el-option v-for="item in options" :key="item.value" :label="item.label"
                        :value="item.value"></el-option>
                </el-select>
            </el-col>
        </el-row>

        <el-row class="search-row" gutter={20}>
            <el-col :span="6">
                <el-select v-model="searchCourseName" multiple filterable remote reserve-keyword placeholder="请输入课程名称"
                    :remote-method="remoteMethod" :loading="loading">
                    <el-option v-for="item in options" :key="item.value" :label="item.label"
                        :value="item.value"></el-option>
                </el-select>
            </el-col>

            <el-col :span="6">
                <el-select v-model="searchTeacherId" multiple filterable remote reserve-keyword placeholder="请输入教师号"
                    :remote-method="remoteMethod" :loading="loading">
                    <el-option v-for="item in options" :key="item.value" :label="item.label"
                        :value="item.value"></el-option>
                </el-select>
            </el-col>

            <el-col :span="6">
                <el-select v-model="searchTeacherName" multiple filterable remote reserve-keyword placeholder="请输入教师姓名"
                    :remote-method="remoteMethod" :loading="loading">
                    <el-option v-for="item in options" :key="item.value" :label="item.label"
                        :value="item.value"></el-option>
                </el-select>
            </el-col>
        </el-row>

        <!-- 表格 -->
        <el-table :data="tableData" border style="width: 100%">
            <el-table-column fixed prop="student_id" label="学号" width="150"></el-table-column>
            <el-table-column fixed prop="student_name" label="姓名" width="150"></el-table-column>
            <el-table-column prop="semester" label="学期" width="120"></el-table-column>
            <el-table-column prop="course_id" label="课程号" width="120"></el-table-column>
            <el-table-column prop="course_name" label="课程名称" width="120"></el-table-column>
            <el-table-column prop="staff_id" label="教师号" width="300"></el-table-column>
            <el-table-column prop="staff_name" label="教师姓名" width="120"></el-table-column>
            <el-table-column fixed="right" label="操作" width="100">
                <template slot-scope="scope">
                    <el-button @click="handleClick(scope.row)" type="text" size="small">编辑</el-button>
                    <el-button type="text" size="small">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'CourseSelection',

    methods: {
        handleClick(row) {
            console.log(row);
        },

        async fetchData() {
            try {
                // 向后端发送 GET 请求，带上搜索条件
                const response = await axios.get('/api/courses', {
                    params: {
                        student_id: this.searchStudentId,
                        student_name: this.searchStudentName,
                        course_name: this.searchCourseName,
                        semester: this.searchSemester,
                        course_id: this.searchCourseId,
                        teacher_id: this.searchTeacherId,
                        teacher_name: this.searchTeacherName,
                    },
                });

                // 更新表格数据
                this.tableData = response.data;
            } catch (error) {
                console.error('请求数据失败', error);
            }
        }
    },

    data() {
        return {
            searchStudentId: '',    // 学号搜索
            searchStudentName: '',  // 姓名搜索
            searchCourseName: '',   // 课程名称搜索
            searchSemester: '',     // 学期搜索
            searchCourseId: '',     // 课程号搜索
            searchTeacherId: '',    // 教师号搜索
            searchTeacherName: '',  // 教师姓名搜索

            tableData: []  // 存储表格数据
        };
    },

    mounted() {
        // 初始加载表格数据
        this.fetchData();
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
</style>