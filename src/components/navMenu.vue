<template>
  <div>
    <div class="tabMenu">
      <div :class="{tabActive:tabActive==1}" @click="goProcess(1,'process')">流程定义</div>
      <ul>
        <li
          v-for="(item,index) in tabMenuList"
          :key="index"
          @click="goRouter(item.key,item.name)"
          :class="{tabActive:tabActive==item.key}"
        >
          {{item.navItem}}
          <i class="el-icon-close" @click.stop="closeRouter(item.key,item.name)"></i>
        </li>
      </ul>
    </div>
    <div class="asideMenu">
      <div class="am-header">
        <!-- <img src="../assets/logo.png" alt=""> -->
      </div>
      <el-menu
        :default-active="$route.path"
        class="el-menu-vertical-demo"
        @select="handleSelect"
        @open="handleOpen"
        @close="handleClose"
        :collapse="isCollapse"
        router
      >
        <el-menu-item v-for="(item,i) in asideMenuList" :key="i" :index="item.name">
          <i :class="item.icon"></i>
          <span slot="title">{{ item.navItem }}</span>
        </el-menu-item>
      </el-menu>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* tab导航 */
.tabMenu {
  /* width: calc(100% - 80px); */
  width: calc(100% - 135px);
  height: 40px;
  background-color: #ffffff;
  margin-left: 135px;
  float: left;
  position: fixed;
  z-index: 997;
  box-shadow: 0px 1px 4px 0px rgba(72, 80, 120, 0.1);
}

.tabMenu > div {
  float: left;
  padding: 0 10px;
  background-color: #e5eaf8;
  color: #333333;
  height: 34px;
  line-height: 34px;
  margin-left: 10px;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  font-size: 14px;
  margin-top: 6px;
}

.tabMenu > div:hover {
  background-color: #5473e8 !important;
  color: #fff !important;
}

.tabMenu ul {
  list-style: none;
  height: 34px;
  margin-top: 6px;
}

.tabMenu ul li {
  float: left;
  padding: 0 10px;
  background-color: #e5eaf8;
  color: #333333;
  height: 34px;
  line-height: 34px;
  margin-left: 5px;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  font-size: 14px;
}

.tabMenu ul li:hover {
  background-color: #5473e8;
  color: #fff;
}

.tabMenu ul .indexLi {
  background-color: #5473e8;
  color: #fff;
}

.tabMenu ul li i {
  margin-left: 5px;
  cursor: pointer;
  font-size: 12px;
}

.tabMenu ul li i:hover {
  /* color: #fff; */
}

.tabActive {
  background-color: #5473e8 !important;
  color: #fff !important;
}

/* 左侧菜单导航 */
.asideMenu {
  /* width: 80px; */
  width: 135px;
  height: 100%;
  position: fixed;
  z-index: 997;
  border-right: 1px solid #e6e6e6;
  background-image: linear-gradient(0deg, #363e64 0%, #485078 100%),
    linear-gradient(#485078, #485078);
  background-blend-mode: normal, normal;
}

.asideMenu .el-menu {
  border-right: none;
  background-color: transparent !important;
}

.asideMenu .am-header {
  width: 100%;
  height: 40px;
}

.asideMenu .am-header img {
  width: 40px;
  height: 40px;
  margin-left: calc(50% - 20px);
}

.asideMenu .el-menu-item {
  padding: 0 15px !important;
  height: 50px;
  line-height: 50px;
  font-family: MicrosoftYaHei;
  font-size: 14px;
  font-weight: normal;
  font-stretch: normal;
  letter-spacing: 0px;
  color: #b5b8c8;
}

.asideMenu .el-menu-item span {
  /* display: none;
        width: 0; */
}

.asideMenu .el-menu-item.is-active {
  color: #fff;
  background-color: #5473e8;
}

.asideMenu .el-menu-item:hover {
  color: #fff;
  background-color: #5473e8;
  i {
    color: #fff;
  }
}
</style>
<style>
</style>

<script>
export default {
  data() {
    return {
      isCollapse: false,
      defaultActive: 1, //侧导航默认选中
      tabData: [
        //tab页数组
        {
          name: "待办任务",
          key: 2
        },
        {
          name: "已办任务",
          key: 3
        },
        {
          name: "我发起的",
          key: 4
        }
      ],
      asideMenuList: [
        {
          name: "/compontents/process",
          navItem: "流程定义",
          icon: "el-icon-setting",
          key: 1
        },
        {
          name: "/compontents/untreated",
          navItem: "待办任务",
          icon: "el-icon-time",
          key: 2
        },
        {
          name: "/compontents/handled",
          navItem: "已办任务",
          icon: "el-icon-circle-check",
          key: 3
        },
        {
          name: "/compontents/myLaunch",
          navItem: "我发起的",
          icon: "el-icon-circle-check",
          key: 4
        }
      ],
      tabMenuList: [
        // { name: '/compontents/untreated', navItem: '待办任务', key: 2 },
        // { name: '/compontents/handled', navItem: '已办任务', key: 3 },
      ],
      tabActive: 1 //tab标签页颜色
    };
  },
  mounted() {
    // tab导航 默认路由（保持刷新前显示）
    var arr = {};
    if (this.$route.path != "/compontents/process") {
      if (
        this.$route.path == "/compontents/untreated" ||
        this.$route.path == "/compontents/track"
      ) {
        // 添加数据
        this.$set(arr, "name", "/compontents/untreated");
        this.$set(arr, "navItem", "待办任务");
        this.$set(arr, "key", 2);
        // 路由跳转
        this.tabActive = 2;
        this.tabMenuList.push(arr);
      } else if (
        this.$route.path == "/compontents/handled" ||
        this.$route.path == "/compontents/track"
      ) {
        // 添加数据
        this.$set(arr, "name", "/compontents/handled");
        this.$set(arr, "navItem", "已办任务");
        this.$set(arr, "key", 3);
        // 路由跳转
        this.tabActive = 3;
        this.tabMenuList.push(arr);
      } else if (this.$route.path == "/compontents/myLaunch") {
        // 添加数据
        this.$set(arr, "name", "/compontents/myLaunch");
        this.$set(arr, "navItem", "我发起的");
        this.$set(arr, "key", 4);
        // 路由跳转
        this.tabActive = 4;
        this.tabMenuList.push(arr);
      }
    }
  },
  methods: {
    handleOpen(key, keyPath) {
      console.log(key, keyPath);
    },
    handleClose(key, keyPath) {
      console.log(key, keyPath);
    },

    // 侧导航切换路由 - 联动tab标签页导航
    handleSelect(key, keyPath) {
      // 1.判断与tab导航是否有重复
      var list = this.tabMenuList;
      var stateTxt = 0;
      // 如果点击首页，只跳转路由，不再增加标签页
      if (keyPath == "/compontents/process") {
        stateTxt++;
        this.tabActive = 1;
      } else {
        list.forEach(item => {
          if (item.name == keyPath) {
            stateTxt++;
          }
        });
      }
      // tab选中样式加载
      if (keyPath == "/compontents/untreated") {
        this.tabActive = 2;
      }
      if (keyPath == "/compontents/handled") {
        this.tabActive = 3;
      }
      if (keyPath == "/compontents/myLaunch") {
        this.tabActive = 4;
      }

      // 2.满足条件，加一条数据
      var arr = {};
      if (stateTxt == 0) {
        // console.log("加")
        if (key == "/compontents/untreated") {
          // 添加数据
          this.$set(arr, "name", "/compontents/untreated");
          this.$set(arr, "navItem", "待办任务");
          this.$set(arr, "key", 2);
          // 路由跳转
          this.$router.replace("/compontents/untreated");
        } else if (key == "/compontents/handled") {
          // 添加数据
          this.$set(arr, "name", "/compontents/handled");
          this.$set(arr, "navItem", "已办任务");
          this.$set(arr, "key", 3);
          // 路由跳转
          this.$router.replace("/compontents/handled");
        } else if (key == "/compontents/myLaunch") {
          // 添加数据
          this.$set(arr, "name", "/compontents/myLaunch");
          this.$set(arr, "navItem", "我发起的");
          this.$set(arr, "key", 4);
          // 路由跳转
          this.$router.replace("/compontents/myLaunch");
        }
        this.tabMenuList.push(arr);
      }
      // console.log(this.tabMenuList)
    },

    // 流程定义
    // goProcess(el) {
    //     this.$router.replace('/compontents/process')
    // },
    // // 待办任务
    // goUntreated() {
    //     this.$router.replace('/compontents/untreated');
    //     // this.tabData.
    // },
    // // 已办任务
    // goHandled() {
    //     this.$router.replace('/compontents/handled')
    // },

    // 首页默认路由
    goProcess(index, url) {
      this.tabActive = index;
      this.$router.replace("/compontents/process");
    },

    // tab标签页导航切换路由
    goRouter(index, url) {
      this.tabActive = index;
      if (url == "/compontents/untreated") {
        this.$router.replace("/compontents/untreated");
      } else if (url == "/compontents/handled") {
        this.$router.replace("/compontents/handled");
      } else if(url == "/compontents/myLaunch"){
        this.$router.replace("/compontents/myLaunch");
      }
      return false;
    },

    // 关闭路由 - 关闭标签页
    closeRouter(index, url) {
      // 判断一下，如果在当前页面，关闭其他页面，那只删除标签页，不进行路由跳转
      if (this.$route.path == url) {
        this.tabActive = 1;
        this.$router.replace("/compontents/process");
      }
      // 判断，如果是流程跟踪界面，则跳转至首页
      if (this.$route.path == "/compontents/untreated" || this.$route.path == "/compontents/track" ){
        this.$router.replace("/compontents/process");
      }
      var index_ = index;
      var list = this.tabMenuList;
      list = list.filter(item => {
        return item.key != index_;
      });
      this.tabMenuList = list;
    }
  }
};
</script>