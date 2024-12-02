<template>
  <div class="main-container">
    <!-- 搜索框区域 -->
    <div class="search-container" style="margin-bottom: 10px;">
      <h3>课程信息</h3>
      <!-- 学期下拉选择框 -->
      <el-select v-model="searchQuery.semester" placeholder="学期" style="width: 150px; margin-right: 10px;">
        <el-option label="2023-2024秋季" value="2023-2024秋季"></el-option>
        <el-option label="2023-2024冬季" value="2023-2024冬季"></el-option>
        <el-option label="2023-2024春季" value="2023-2024春季"></el-option>
      </el-select>

      <el-input v-model="searchQuery.courseId" placeholder="课程号" style="width: 150px; margin-right: 10px;"></el-input>
      <el-input v-model="searchQuery.courseName" placeholder="课程名" style="width: 150px; margin-right: 10px;"></el-input>
      <el-input v-model="searchQuery.staffId" placeholder="教师号" style="width: 150px; margin-right: 10px;"></el-input>
      <el-input v-model="searchQuery.name" placeholder="教师" style="width: 100px; margin-right: 10px;"></el-input>
      <el-input v-model="searchQuery.classTime" placeholder="上课时间" style="width: 200px;"></el-input>

      <!-- 搜索按钮 -->
      <el-button type="primary" @click="handleSearch" style="margin-left: 10px;">搜索</el-button>

      <!-- 清空按钮 -->
      <el-button @click="clearSearch" style="margin-left: 10px;">清空</el-button>

      <!-- 课程信息表格 -->
      <el-table :data="ClassList" stripe style="width: 100%">
        <el-table-column prop="semester" label="学期" width="180"></el-table-column>
        <el-table-column prop="courseId" label="课程号" width="180"></el-table-column>
        <el-table-column prop="courseName" label="课程名" width="180"></el-table-column>
        <el-table-column prop="staffId" label="教师号"></el-table-column>
        <el-table-column prop="name" label="教师"></el-table-column>
        <el-table-column prop="classTime" label="上课时间"></el-table-column>
        <!-- 操作列 -->
        <el-table-column label="操作" width="150">
          <template slot-scope="scope">
            <el-button @click="handleSelect(scope.row)" size="small">选择</el-button>
          </template>
        </el-table-column>
      </el-table>


      <!-- 分页组件 -->
      <el-pagination :current-page="currentPage" :page-size="pageSize" :total="total" @current-change="handlePageChange"
        layout="total, prev, pager, next, jumper" :page-size-options="[3, 5, 10, 20]" :page-count="pageCount"
        :disabled-next="currentPage >= pageCount">
      </el-pagination>
    </div>


    <div style="display: flex; justify-content: space-between; padding: 10px;">
      <!-- 选课情况 -->
      <div style="flex: 1; margin-right: 10px;">
        <h3>选课情况</h3>
        <!-- 选课情况筛选学期下拉框 -->
        <el-select v-model="selectionQuery.semester" placeholder="筛选学期" style="width: 180px; margin-bottom: 20px;">
          <el-option label="2023-2024秋季" value="2023-2024秋季"></el-option>
          <el-option label="2023-2024冬季" value="2023-2024冬季"></el-option>
          <el-option label="2023-2024春季" value="2023-2024春季"></el-option>
        </el-select>
        <!-- 筛选按钮 -->
        <el-button type="primary" @click="handleSelectionFilter" style="margin-left: 10px;">筛选</el-button>
        <!-- 选课情况表格 -->
        <el-table :data="selectionList" style="width: 100%" height="350px">
          <el-table-column fixed prop="courseId" label="课程号" width="120"></el-table-column>
          <el-table-column prop="courseName" label="课程名" width="120"></el-table-column>
          <el-table-column prop="teacher" label="教师" width="100"></el-table-column>
          <el-table-column prop="credits" label="学分" width="80"></el-table-column>
          <el-table-column prop="classTime" label="上课时间" width="120"></el-table-column>
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
  </div>
</template>


<script>
import axios from 'axios';

export default {
  data() {
    return {
      // 课程信息
      ClassList: [],
      currentPage: 1,
      pageSize: 4,
      total: 0,
      pageCount: 0,
      searchQuery: {
        semester: '2023-2024秋季',
        courseId: '',
        courseName: '',
        staffId: '',
        name: '',
        classTime: ''
      },

      // 选课情况
      selectionQuery: {
        semester: '2023-2024秋季'  // 默认学期为2023-2024秋季
      },
      selectionList: [],

      // 课表数据
      timetable: Array.from({ length: 5 }, () => Array(12).fill(null)),  // 5天12节课的课表

      // 星期的名称映射
      daysOfWeek: ["星期一", "星期二", "星期三", "星期四", "星期五"]

    };
  },
  mounted() {
    this.fetchData();
    this.fetchSelectionData();
  },
  methods: {
    // ******************************
    // ******************************
    // 请求课程数据
    async fetchData() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          this.$message.error('请先登录');
          this.$router.push('/login');  // 如果没有 token，跳转到登录页面
          return;
        }

        const response = await axios.get('http://localhost:8081/student/course', {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          params: {
            page: this.currentPage,
            size: this.pageSize,
            semester: this.searchQuery.semester,
            courseId: this.searchQuery.courseId,
            courseName: this.searchQuery.courseName,
            staffId: this.searchQuery.staffId,
            name: this.searchQuery.name,
            classTime: this.searchQuery.classTime
          }
        });

        this.ClassList = response.data.data;
        this.total = response.data.total;
        this.pageCount = Math.ceil(this.total / this.pageSize);

        if (this.currentPage > this.pageCount) {
          this.currentPage = this.pageCount;
          this.fetchData();  // 重新请求数据
        }
      } catch (error) {
        console.error('请求课程数据失败', error);
        this.$message.error('数据请求失败，请稍后重试');
        if (error.response && error.response.status === 401) {
          this.$router.push('/login');
        }
      }
    },

    // ******************************
    // ******************************
    // 请求选课情况数据
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
        '#F1E0D6', '#D3F2D9', '#F9F3C4', '#D6A2D6', '#A6C8FF', '#A8E6A1', '#FFB3A7', '#F9D699', '#D1D1D1'
      ];


      this.selectionList.forEach(course => {
        const { courseName, classTime } = course;

        // 解析 classTime 格式
        const match = classTime.match(/(星期[一二三四五])(1|2|3|4|5|6|7|8)-(\d+)/);
        if (match) {
          const dayOfWeek = match[1]; // 获取星期几
          const startSlot = parseInt(match[2], 10) - 1; // 获取开始的节次 (1-8) 转换为 0-7
          const endSlot = parseInt(match[3], 10) - 1; // 获取结束的节次 (5-8) 转换为 0-7

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
          const courseColor = colorList[this.selectionList.indexOf(course) % colorList.length];

          // 将课程填充到课表中
          for (let i = startSlot; i <= endSlot; i++) {
            if (this.timetable[dayIndex][i] === null) {
              this.timetable[dayIndex][i] = { courseName, courseColor };
            }
          }
        }
      });
    },


    // ******************************
    // ******************************
    // 选择课程
    async handleSelect(course) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          this.$message.error('请先登录');
          this.$router.push('/login');  // 如果没有 token，跳转到登录页面
          return;
        }

        // 发送选择课程请求
        const response = await axios.post('http://localhost:8081/student/choose', course, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // 打印响应数据，检查结构
        console.log(response.data);  // 打印后端返回的数据

        if (response.data.code === 1) {
          this.$message.success('选课成功');
          this.fetchSelectionData();
        } else {
          this.$message.error('选课失败: ' + response.data.msg);
        }
      } catch (error) {
        console.error('选课请求失败', error);
        this.$message.error('选课失败，请稍后重试');
      }
    },



    // ******************************
    // ******************************
    // 其他零碎功能

    // 处理搜索
    handleSearch() {
      this.fetchData();
    },

    // 清空搜索条件
    clearSearch() {
      this.searchQuery = {
        semester: '',
        courseId: '',
        courseName: '',
        staffId: '',
        name: '',
        classTime: ''
      };
      this.fetchData();
    },

    // 切换分页
    handlePageChange(page) {
      this.currentPage = page;
      this.fetchData();
    },

    // 选课情况筛选
    handleSelectionFilter() {
      this.fetchSelectionData();
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
