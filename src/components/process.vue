<template>
  <div>
    <!-- 表单 -->
    <div class="fd-nav-content">
      <div class="tab">
        <div class="serchinput">
          <el-input v-model="searchTableInfo" size="mini" placeholder="输入流程名称进行搜索">
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
          </el-input>
        </div>
        <div class="btnDiv">
          <el-button icon="el-icon-plus" @click="addRow">新增</el-button>
        </div>
      </div>
      <div class="tableDiv">
        <el-table
          ref="multipleTable"
          :data="tableDataT.slice((currpage - 1) * pagesize, currpage * pagesize)"
          border
          tooltip-effect="dark"
          style="width: 100%"
          @row-click="handRowClick"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" align="center"></el-table-column>
          <el-table-column prop="name" label="流程定义名称" width="220" align="center"></el-table-column>
          <el-table-column prop="createtime" label="日期" width="200" align="center"></el-table-column>
          <el-table-column label="操作" align="center" width="360">
            <template slot-scope="scope">
              <el-button
                size="mini"
                round
                plain
                icon="el-icon-setting"
                @click="handleEdit(scope.$index, scope.row)"
                class="purpleBtn"
              >设计</el-button>
              <el-button
                size="mini"
                type="warning"
                round
                plain
                icon="el-icon-edit"
                @click="modify(scope.$index, scope.row)"
              >修改</el-button>
              <el-button
                size="mini"
                type="danger"
                round
                plain
                icon="el-icon-delete"
                @click="remove(scope.$index, scope.row)"
              >删除</el-button>
            </template>
          </el-table-column>
          <el-table-column prop label align="center"></el-table-column>
        </el-table>
      </div>
      <!-- 分页 分条数 -->
      <div class="page">
        <el-pagination
          center
          background
          layout="prev, pager, next, sizes, total"
          :page-sizes="[4,6,8,10]"
          :page-size="pagesize"
          :total="tableDataT.length"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
        ></el-pagination>
      </div>
    </div>

    <!-- 新增数据 弹窗 -->
    <el-dialog title="新增流程定义" :visible.sync="addVisible">
      <el-form :model="addForm" ref="addForm">
        <el-form-item label="名称：">
          <el-input v-model="addForm.name" style="width:220px"></el-input>
        </el-form-item>
        <div style="float:right;margin-top: -10px;">
          <el-button @click="cancel()">取消</el-button>
          <el-button type="primary" @click="sureAdd()">确定</el-button>
        </div>
      </el-form>
    </el-dialog>

    <!-- 修改数据 弹窗 -->
    <el-dialog title="修改流程定义" :visible.sync="modifyVisible">
      <el-form :model="modifyForm" ref="modifyForm">
        <el-form-item label="名称：">
          <el-input v-model="modifyForm.name" style="width:220px"></el-input>
        </el-form-item>
        <div style="float:right;margin-top: -10px;">
          <el-button @click="cancel()">取消</el-button>
          <el-button type="primary" @click="sureModify()">确定</el-button>
        </div>
      </el-form>
    </el-dialog>
    
  </div>
</template>

<script>
import qs from "qs";
import axios from "axios";
var _index; //定义一个全局变量，以获取行数据的行号
export default {
  created() {
    let Base64 = require("js-base64").Base64;
    this.getTableList();
    this.getJsondata();
  },
  data() {
    return {
      // 接口数据
      dataList: [],
      //搜索条件
      searchTableInfo: "",
      pagesize: 6,
      currpage: 1,
      // 多选
      multipleSelection: [],
      // 新增流程定义弹窗
      addVisible: false,
      addForm: [],
      // 修改数据弹窗
      modifyVisible: false,
      modifyForm: [],
      // 当前时间
      nowtime: "",
      // 新增流程时默认jsondata
      newjson: {},
      // 导航
      ishow: false,
      //当前操作按钮
      current: 0
    };
  },
  mounted() {
    this.showTime();
  },
  methods: {
    // 获取jsondata
    getJsondata() {
      this.$axios.get(`${process.env.BASE_URL}data.json`).then(res => {
        this.newjson = Base64.encode(JSON.stringify(res));
        // console.log(res);
        // console.log(this.newjson);
      });
    },
    // 获取接口表单数据
    getTableList() {
      axios.get("/api/qdc/queryDeploylist").then(data => {
        this.dataList = data.data.data;
        for (let i = 0; i < this.dataList.length; i++) {
          // this.dataList[i].createtime = this.$moment(this.dataList[i].createtime).format("YYYY-MM-DD");
          this.dataList[i].createtime = this.$moment(
            this.dataList[i].createtime
          ).format("YYYY-MM-DD HH: mm :ss");
        }
        // console.log(this.dataList);
      });
    },
    //表格 默认只允许选一条数据
    handleSelectionChange(val) {
      if (val.length > 1) {
        this.$refs.multipleTable.clearSelection();
        this.$refs.multipleTable.toggleRowSelection(val.pop());
      } else {
        this.multipleSelection = val.pop();
      }
    },
    // 点击行触发，选中或不选中框
    handRowClick(row, column, event) {
      this.$refs.multipleTable.toggleRowSelection(row);
    },
    // 新增流程定义
    addRow() {
      this.addVisible = true;
      this.addForm = {
        // name: '',
        // createtime: this.nowtime,
        // // // // // // // // // // // // // // // // // // // //
        createtime: this.nowtime,
        id: 0,
        jsondata: this.newjson,
        name: "",
        versioncode: 0
      };
    },
    // 确认新增弹窗
    sureAdd() {
      // this.getSearchInfo = this.getSearchInfo || []
      // this.getSearchInfo.push({
      //   name: this.addForm.name,
      //   createtime: this.addForm.createtime,
      // })
      // // // // // // // // // // // // // // // // // // // //

      this.$axios({
        method: "post",
        url: "/api/qdc/addDeploy",
        headers: {
          "Content-type": "application/json",
          charset: "UTF-8"
        },
        data: this.addForm
      })
        .then(res => {
          this.getTableList();
          // this.$router.go(0)
        })
        .catch(function(error) {
          console.log(error);
        });

      this.addVisible = false;
    },
    // 翻页
    handleCurrentChange(cpage) {
      this.currpage = cpage;
    },
    // 显示条数
    handleSizeChange(psize) {
      this.pagesize = psize;
    },
    //操作多选
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    // 编辑 - 路由跳转至流程设计界面
    handleEdit(index, row) {
      this.$router.replace({
        path: "/approval/setting",
        query: {
          id: row.id,
          name: row.name,
          jsondata: row.jsondata
        }
      });
      // script 取参  this.$route.query.id [query类似get,页面url拼接参数，?id=1]

      // this.$router.replace({path:'/approval/setting',params:{processVersion:'2020'}})
      // // script 取参  this.$route.params.id [params类似post,页面url不拼接参数]
    },
    // 修改 - 修改名称及日期
    modify(index, row) {
      this.modifyVisible = true;
      this.modifyForm = Object.assign({}, row);
      // console.log( this.modifyForm.id);
      this.modifyForm = {
        createtime: this.nowtime,
        id: this.modifyForm.id,
        jsondata: this.modifyForm.jsondata,
        name: this.modifyForm.name,
        versioncode: this.modifyForm.versioncode
      };
      // console.log(this.modifyForm);//当前行的数据
      _index = index;
    },
    // 确认修改数据
    sureModify() {
      // var editData = _index;
      // this.getSearchInfo[editData].processName = this.modifyForm.processName;
      // this.getSearchInfo[editData].date = this.nowtime;
      // // // // // // // // // // // // // // // // // // // //
      let that = this;
      this.$axios({
        method: "post",
        url: "/api/qdc/updateDeploy",
        headers: {
          "Content-type": "application/json",
          charset: "UTF-8"
        },
        data: that.modifyForm
      })
        .then(res => {
          this.getTableList();
        })
        .catch(function(error) {
          console.log(error);
        });
      this.modifyVisible = false;
    },
    // 取消修改数据
    cancel() {
      this.addVisible = false;
      this.modifyVisible = false;
    },
    // 删除 - 删除流程定义
    remove(index, row) {
      let delid = row.id;
      this.$confirm(`确定删除 < ${row.name} > 吗？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "error"
      }).then(() => {
        // this.getSearchInfo.splice(index,1)
        // // // // // // // // // // // // // // // // // // // //
        this.$axios({
          method: "get",
          url: "/api/qdc/deleteDeploy",
          params: {
            deployid: delid
          }
        })
          .then(res => {
            this.getTableList();
            // this.$router.go(0)
          })
          .catch(function(error) {
            console.log(error);
          });
        // // // // // // // // // // // // // // // // // // // //
        this.$message({
          type: "success",
          message: "成功删除 "
        });
      });
    },
    // 待办任务
    goUntreated() {
      this.$router.replace("/compontents/untreated");
    },
    goHandled() {
      this.$router.replace("/compontents/handled");
    },
    // 日期
    showTime() {
      var _this = this;
      let yy = new Date().getFullYear();
      let mm = new Date().getMonth() + 1;
      let dd = new Date().getDate();
      let hh = new Date().getHours();
      let mf =
        new Date().getMinutes() < 10
          ? "0" + new Date().getMinutes()
          : new Date().getMinutes();
      let ss =
        new Date().getSeconds() < 10
          ? "0" + new Date().getSeconds()
          : new Date().getSeconds();
      // _this.nowtime = yy + "-" + mm + "-" + dd;
      _this.nowtime = new Date();

      //  _this.nowtime = yy+'-'+mm+'-'+dd+' '+hh+':'+mf+':'+ss;
    },
    //显示操作项
    showDialog(index, item) {
      this.ishow = true;
      this.current = index;
    },
    //隐藏蒙层
    hideDialog(index, item) {
      this.ishow = false;
      this.current = null;
    },
    showNav() {
      var id = document.getElementById("conleft");
      id.style.width = "100px";
    }
  },
  //// 计算后 ////
  computed: {
    // 根据计算属性模糊搜索
    tableDataT() {
      const searchTableInfo = this.searchTableInfo;
      if (searchTableInfo) {
        return this.dataList.filter(data => {
          return Object.keys(data).some(key => {
            return (
              String(data[key])
                .toLowerCase()
                .indexOf(searchTableInfo) > -1
            );
          });
        });
      }
      return this.dataList;
    }
  }
};
</script>

<style lang="scss" scoped>
/*workflow.css存放至main.js 中，此处需该方式引入*/
@import "../assets/css/workflow.css";

/* 流程定义页面 */
.fd-nav-content .tab {
  width: 100%;
  height: 80px;
  line-height: 80px;
  background-color: #ffffff;
  border-radius: 4px;
  margin-bottom: 20px;
}

.fd-nav-content .btnDiv {
  float: left;
}

.btnDiv .el-button {
  height: 34px;
  background-color: #5473e8;
  border-radius: 4px;
  font-size: 14px;
  color: #fff;
  border: none;
  vertical-align: middle;
}
.btnDiv .el-button:hover {
  background-color: rgba(84, 115, 232, 0.8) !important;
}

.fd-nav-content .tab .serchinput {
  width: 250px;
  margin-left: 30px;
  margin-right: 30px;
  float: left;
}

.handleDialog {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  background: rgba(0, 0, 0, 0.6);
  width: 100%;
  height: 100%;
  border-radius: 4px;
}

.fd-nav-content .tableDiv {
  .el-table--border,
  .el-table--group {
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
  }
}

.tableDiv el-input {
  display: none;
}

.tableDiv el-input span {
  display: block;
}

.fd-nav-content .page {
  width: 100%;
  height: 70px;
  position: relative;
  background-color: white;
  padding-top: 18px;
  padding-left: 40%;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  border: 1px solid #eaedf8;
  border-top: none;
}

.addDiv .name {
  width: 100%;
  margin-top: 50px;
  margin-left: 20px;
}

.addDiv .date {
  margin-top: 20px;
  margin-left: 20px;
  font-size: 16px;
}

.oo {
  width: 100px;
}
</style>
<style>
.fd-nav-content .tab .el-input__inner {
  width: 250px;
  height: 40px;
  font-size: 14px;
  height: 34px;
  background-color: #f6f7fc;
  border-radius: 4px;
  border: solid 1px #e2e8ee;
}
.tab .serchinput .el-input__inner {
  vertical-align: middle;
}
</style>