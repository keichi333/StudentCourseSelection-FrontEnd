<template>
    <div style="display: flex; justify-content: space-between; padding: 10px; padding-top: 50px">
        <!-- 选课情况 -->
        <div style="flex: 1; margin-right: 10px;">
            <h3>上课情况</h3>
            <!-- 选课情况筛选学期下拉框 -->
            <el-select v-model="semesterFilter" placeholder="筛选学期" style="width: 180px; margin-bottom: 20px;">
                <el-option label="2023-2024秋季" value="2023-2024秋季"></el-option>
                <el-option label="2023-2024冬季" value="2023-2024冬季"></el-option>
                <el-option label="2023-2024春季" value="2023-2024春季"></el-option>
            </el-select>
            <!-- 筛选按钮 -->
            <el-button type="primary" @click="handleSemesterFilter" style="margin-left: 10px;">筛选</el-button>

            <!-- 选课情况表格 -->
            <el-table :data="teachList" style="width: 100%" height="350px">
                <el-table-column fixed prop="courseId" label="课程号" width="120"></el-table-column>
                <el-table-column prop="courseName" label="课程名" width="120"></el-table-column>
                <el-table-column prop="classId" label="班级" width="120"></el-table-column>
                <el-table-column prop="classTime" label="上课时间" width="200"></el-table-column>
            </el-table>
        </div>

        <!-- 课表展示 -->
        <div style="flex: 1; height: 500px; overflow: auto;">
            <h3>课表展示</h3>
            <!-- 课表 -->
            <div class="timetable">
                <div class="time-column">
                    <div v-for="i in 13" :key="i" class="time-slot">
                        <div v-if="i > 1">{{ i - 1 }}</div>
                    </div>
                </div>

                <div v-for="(day, index) in timetable" :key="index" class="day-column">
                    <div class="day">{{ daysOfWeek[index] }}</div>
                    <div v-for="(slot, timeIndex) in day" :key="timeIndex" class="time-slot">
                        <div v-if="slot" class="course" :style="{ backgroundColor: slot.courseColor }">
                            {{ slot.courseName }}<br />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            semesterFilter: '2023-2024秋季',  // 选课情况筛选学期

            // 课程信息
            teachList: [],

            // 课表数据
            timetable: Array.from({ length: 5 }, () => Array(12).fill(null)),  // 5天12节课的课表

            // 星期的名称映射
            daysOfWeek: ["星期一", "星期二", "星期三", "星期四", "星期五"]

        };
    },
    mounted() {
        this.fetchTeachData();
    },
    methods: {
        // ******************************
        // ******************************
        // 请求选课情况数据
        async fetchTeachData() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    this.$message.error('请先登录');
                    this.$router.push('/login');  // 如果没有 token，跳转到登录页面
                    return;
                }

                const response = await axios.get('http://localhost:8081/teacher/course', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    params: {
                        semester: this.semesterFilter
                    }
                });

                if (response.data && Array.isArray(response.data.data)) {
                    this.teachList = response.data.data.map(item => ({
                        semester: item.semester,
                        courseId: item.courseId,
                        courseName: item.courseName,
                        classId: item.classId,
                        classTime: item.classTime
                    }));

                    // 填充课表数据
                    this.updateTimetable();
                }
            } catch (error) {
                console.error('请求选课数据失败', error);
                this.$message.error('选课数据请求失败，请稍后重试');
            }
        },


        // ******************************
        // ******************************
        // 课表展示
        updateTimetable() {
            // 清空现有的课表数据
            this.timetable = Array.from({ length: 5 }, () => Array(12).fill(null));

            // 预定义颜色列表
            const colorList = [
                '#FFCDD2', '#C8E6C9', '#FFF59D', '#E1BEE7', '#B3E5FC', '#C8E6C9', '#FFECB3', '#FFAB91', '#BDBDBD'
            ];

            this.teachList.forEach(course => {
                const { courseName, classTime } = course;

                // 将 classTime 字符串按逗号分割成时间段数组
                const classTimeArray = classTime.split('，');

                // 遍历每个时间段字符串
                classTimeArray.forEach(time => {
                    // 解析 classTime 格式
                    const match = time.match(/(星期[一二三四五])(\d+)-(\d+)/);
                    if (match) {
                        const dayOfWeek = match[1]; // 获取星期几
                        const startSlot = parseInt(match[2], 10) - 1; // 获取开始的节次 (1-8) 转换为 0-7
                        const endSlot = parseInt(match[3], 10) - 1; // 获取结束的节次 (1-8) 转换为 0-7

                        // 星期几的映射（星期一到星期五）
                        const daysMapping = {
                            '星期一': 0,
                            '星期二': 1,
                            '星期三': 2,
                            '星期四': 3,
                            '星期五': 4
                        };

                        // 获取对应星期几的列索引
                        const dayIndex = daysMapping[dayOfWeek];

                        // 为每门课程分配一个唯一颜色
                        const courseColor = colorList[this.teachList.indexOf(course) % colorList.length];

                        // 将课程填充到课表中
                        for (let i = startSlot; i <= endSlot; i++) {
                            if (this.timetable[dayIndex][i] === null) {
                                this.timetable[dayIndex][i] = { courseName, courseColor };
                            }
                        }
                    }
                });
            });
        },

        handleSemesterFilter() {
            this.fetchTeachData();
        },


    },
};
</script>

<style scoped>
.search-container {
    padding: 10px;
}

.timetable {
    display: flex;
}

.time-column {
    width: 60px;
    /* 设置时间列宽度 */
    height: 100%;
    /* 课表高度自适应 */
    text-align: center;
    border: 1px solid #ddd;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.day-column {
    flex: 1;
    height: 100%;
    border: 1px solid #ddd;
    display: flex;
    flex-direction: column;
}

.day {
    text-align: center;
    height: 30px;
}

.time-slot {
    height: 30px;
    /* 每个时间段的高度 */
    display: flex;
    justify-content: center;
    align-items: center;
}

.course {
    background-color: #f2f2f2;
    padding: 7px;
    text-align: center;
    border-radius: 5px;
    font-size: 15px;
}
</style>
