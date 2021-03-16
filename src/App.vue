<template>
  <div id="app">
    <!-- 缓存组件，提高运行性能 -->
    <!-- <keep-alive>
      <router-view></router-view>
    </keep-alive> -->

    <router-view></router-view>
    <nav-menu></nav-menu>
  </div>
</template>

<script>
import navMenu from './components/navMenu'
export default {
  name: "app",
  components:{
    navMenu: navMenu
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #333333;
  /* margin-top: 60px; */
}

a,
abbr,
acronym,
address,
applet,
article,
aside,
audio,
b,
big,
blockquote,
body,
canvas,
caption,
center,
cite,
code,
dd,
del,
details,
dfn,
div,
dl,
dt,
em,
fieldset,
figcaption,
figure,
footer,
form,
h1,
h2,
h3,
h4,
h5,
h6,
header,
hgroup,
html,
i,
iframe,
img,
ins,
kbd,
label,
legend,
li,
mark,
menu,
nav,
object,
ol,
p,
pre,
q,
s,
samp,
section,
small,
span,
strike,
strong,
sub,
summary,
sup,
table,
tbody,
td,
tfoot,
th,
thead,
time,
tr,
tt,
u,
ul,
var,
video {
  margin: 0;
  padding: 0;
  border: 0;
  outline: 0;
  font-size: 100%;
  font: inherit;
  vertical-align: baseline;
}

.clear:before,
.clear:after {
  content: " ";
  display: table;
}

.clear:after {
  clear: both;
}

.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.l {
  float: left;
}

input {
  text-indent: 10px;
}

select {
  text-indent: 8px;
}

.ml_10 {
  margin-left: 10px;
}

.mr_10 {
  margin-right: 10px;
}

.radio_box a,
.check_box a {
  font-size: 12px;
  position: relative;
  padding-left: 20px;
  margin-right: 30px;
  cursor: pointer;
  color: #333;
  white-space: pre;
}

.check_box.not a:hover {
  color: #333;
}

.check_box.not a::before,
.check_box.not a:hover::before {
  border: none;
}

.check_box.not.active {
  background: #f3f3f3;
}

.radio_box a:hover::before,
.check_box a:hover::before {
  border: 1px solid #46a6fe;
}

.radio_box a::before,
.check_box a::before {
  position: absolute;
  width: 14px;
  height: 14px;
  border: 1px solid #dcdfe6;
  border-radius: 2px;
  left: 0;
  top: 1px;
  content: "";
}

.radio_box a::before {
  border-radius: 50%;
}

.check-dot.active::after,
.radio_box a.active::after,
.check_box a.active::after {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  top: 3px;
  left: 3px;
  content: "";
}

.radio_box a.active::after {
  background: #46a6fe;
}

.check_box a.active::after {
  background: url(~@/assets/images/check_box.png) no-repeat center;
}

/* 滚动条 */
/* 滚动条的宽度 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.scrollbarSmall::-webkit-scrollbar{
  width: 6px !important;
  height: 6px !important;
}

::-webkit-scrollbar-track,
::-webkit-scrollbar-track:vertical {
  background-color: transparent;
}

/* 内层轨道 */
::-webkit-scrollbar-track-piece {
  background-color: transparent;
}

/* 拖动部分 */
::-webkit-scrollbar-thumb,
::-webkit-scrollbar-thumb:vertical {
  margin-right: 10px;
  background-color: rgba(84, 115, 232, 0.8) !important;
  opacity: 0.3 !important;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}

/* 拖动部分-悬浮 */
::-webkit-scrollbar-thumb:hover,
::-webkit-scrollbar-thumb:vertical:hover {
  background-color: rgb(84, 115, 232) !important;
}

/*边角*/
::-webkit-scrollbar-corner,
::-webkit-scrollbar-corner:vertical {
  /* background-color: #535353; */
  background-color: #d7def5;
}

/*右下角拖动块*/
::-webkit-scrollbar-resizer,
::-webkit-scrollbar-resizer:vertical {
  background-color: #5473e8;
}

/* 表格样式 */
/* 表格 - 头部样式 */
.el-table__header-wrapper {
  background-color: #f6f7fc;
  border-radius: 4px 4px 0px 0px;
}

/* 表格 - 分割线颜色 */
.el-table--border,
.el-table--group {
  border-color: #eaedf8;
}

.el-table--border::after,
.el-table--group::after,
.el-table::before {
  border-color: #eaedf8;
}

.el-table--border th {
  background-color: #f6f7fc;
  border-color: #eaedf8;
  color: #778ca2;
}

.el-table__body td {
  border-color: #eaedf8;
  color: #333333;
}

/* 表格 - 复选框 */
.el-checkbox__input.is-checked .el-checkbox__inner,
.el-checkbox__input.is-indeterminate .el-checkbox__inner {
  background-color: #5473e8;
  border-color: #5473e8;
}
.el-checkbox__input.is-focus .el-checkbox__inner {
  border-color: #5473e8;
}

.el-checkbox__inner:hover {
  border-color: #5473e8;
}

/* 单选 */
.el-radio__input.is-checked .el-radio__inner {
  border-color: #5473e8;
  background: #5473e8;
}
.el-radio__inner:hover {
  border-color: #5473e8;
}

/* 表格 - 分页 */
.el-pagination.is-background .btn-next,
.el-pagination.is-background .btn-prev,
.el-pagination.is-background .el-pager li {
  background-color: #ffffff;
  border-radius: 4px;
  border: solid 1px #d0d9e3;
  color: #778ca2;
}

.el-pagination.is-background .el-pager li:not(.disabled).active {
  background-color: #5473e8;
  border-radius: 4px;
  color: #fff;
}

.el-pagination .el-select .el-input .el-input__inner {
  border-radius: 4px;
  border-color: #e4ebf0;
  color: #778ca2;
}

.el-select-dropdown__item.selected {
  color: #5473e8;
}

.el-pagination__total {
  color: #778ca2;
}

/* 表格 - 行内按钮 */
/* 紫色 */
.purpleBtn {
  background-color: #e9eeff !important;
  /* border-radius: 14px !important; */
  border: solid 1px #5473e7 !important;
  color: #5473e7 !important;
}
.purpleBtn:hover {
  background-color: #5473e7 !important;
  color: #fff !important;
}
.greenBtn {
  background-color: #d8fcff !important;
  /* border-radius: 14px !important; */
  border: solid 1px #23bcca !important;
  color: #23bcca !important;
}
.greenBtn:hover {
  background-color: #23bcca !important;
  color: #fff !important;
}

/* 日期选择器 */
.el-date-table td.end-date span,
.el-date-table td.start-date span {
  background-color: #5473e8;
}

.el-date-table td.today span {
  color: #5473e8;
}

.el-picker-panel__shortcut:hover {
  color: #5473e8;
}

.available:hover {
  color: #5473e8 !important;
}
</style>