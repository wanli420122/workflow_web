<template>
    <div>
        <div class="node-wrap" v-if="nodeConfig.type!=4">
            <div class="node-wrap-box" :class="(nodeConfig.type==0?'start-node ':'')+(isTried&&nodeConfig.error?'active error':'')">
                <div>
                    <div class="title" :style="'background: rgb('+ ['87, 106, 149','255, 148, 62','50, 150, 250'][nodeConfig.type] +');'">
                        <span class="iconfont" v-show="nodeConfig.type==1"></span>
                        <span class="iconfont" v-show="nodeConfig.type==2"></span>
                        <span v-if="nodeConfig.type==0">{{nodeConfig.nodeName}}</span>
                        <input type="text" class="ant-input editable-title-input" v-if="nodeConfig.type!=0&&isInput"
                        @blur="blurEvent()" @focus="$event.currentTarget.select()" v-focus
                        v-model="nodeConfig.nodeName" :placeholder="placeholderList[nodeConfig.type]">
                        <span class="editable-title" @click="clickEvent()" v-if="nodeConfig.type!=0&&!isInput">{{nodeConfig.nodeName}}</span>
                        <i class="anticon anticon-close close" v-if="nodeConfig.type!=0" @click="delNode()"></i>
                    </div>
                    <div class="content" @click="setPerson">
                        <div class="text" v-if="nodeConfig.type==0">{{arrToStr(flowPermission)?arrToStr(flowPermission):'所有人'}}</div>
                        <div class="text" v-if="nodeConfig.type==1">
                            <span class="placeholder" v-if="!setApproverStr(nodeConfig)">请选择{{placeholderList[nodeConfig.type]}}</span>
                            {{setApproverStr(nodeConfig)}}
                        </div>
                        <div class="text" v-if="nodeConfig.type==2">
                            <span class="placeholder" v-if="!copyerStr(nodeConfig)">请选择{{placeholderList[nodeConfig.type]}}</span>
                            {{copyerStr(nodeConfig)}}
                        </div>
                        <i class="anticon anticon-right arrow"></i>
                    </div>
                    <div class="error_tip" v-if="isTried&&nodeConfig.error">
                        <i class="anticon anticon-exclamation-circle" style="color: rgb(242, 86, 67);"></i>
                    </div>
                </div>
            </div>
            <addNode :childNodeP.sync="nodeConfig.childNode"></addNode>
        </div>
        <div class="branch-wrap" v-if="nodeConfig.type==4">
            <div class="branch-box-wrap">
                <div class="branch-box">
                    <button class="add-branch" @click="addTerm">添加条件</button>
                    <div class="col-box" v-for="(item,index) in nodeConfig.conditionNodes" :key="index">
                        <div class="condition-node">
                            <div class="condition-node-box">
                                <!-- 未设置条件的红色警示框 -->
                                <!-- <div class="auto-judge" :class="isTried&&item.error?'error active':''"> -->
                                <div class="auto-judge">
                                    <div class="sort-left" v-if="index!=0" @click="arrTransfer(index,-1)">&lt;</div>
                                    <div class="title-wrapper">
                                        <input type="text" class="ant-input editable-title-input" v-if="isInputList[index]"
                                        @blur="blurEvent(index)" @focus="$event.currentTarget.select()" v-focus v-model="item.nodeName">
                                        <span class="editable-title" @click="clickEvent(index)" v-if="!isInputList[index]">{{item.nodeName}}</span>
                                        <span class="priority-title" @click="setPerson(item.priorityLevel)">优先级{{item.priorityLevel}}</span>
                                        <i class="anticon anticon-close close" @click="delTerm(index)"></i>
                                    </div>
                                    <div class="sort-right" v-if="index!=nodeConfig.conditionNodes.length-1"
                                        @click="arrTransfer(index)">&gt;</div>
                                    <!-- 条件描述 -->
                                    <!-- 前端同级显示重复，数据不重复 -->
                                    <div class="content" @click="setExpressions(item.priorityLevel)">{{conditionStr(item,index)}}</div>
                                    <!-- 前端同级显示重复，同级数据也重复-->
                                    <!-- <div class="content" @click="setExpressions(item.priorityLevel)">条件表达式：{{conditionConfig.expressions}}</div> -->
                                    <!-- <div class="content" @click="setPerson(item.priorityLevel)">{{conditionStr(item,index)}}</div> -->
                                    <!-- 未设置条件的红色感叹号 -->
                                    <!-- <div class="error_tip" v-if="isTried&&item.error">
                                        <i class="anticon anticon-exclamation-circle" style="color: rgb(242, 86, 67);"></i>
                                    </div> -->
                                </div>
                                <addNode :childNodeP.sync="item.childNode"></addNode>
                            </div>
                        </div>
                        <nodeWrap v-if="item.childNode && item.childNode" :nodeConfig.sync="item.childNode" :tableId="tableId"
                        :isTried.sync="isTried" :directorMaxLevel="directorMaxLevel"></nodeWrap>
                        <!-- 分支线 -->
                        <div class="top-left-cover-line" v-if="index==0"></div>
                        <div class="bottom-left-cover-line" v-if="index==0"></div>
                        <div class="top-right-cover-line" v-if="index==nodeConfig.conditionNodes.length-1"></div>
                        <div class="bottom-right-cover-line" v-if="index==nodeConfig.conditionNodes.length-1"></div>
                    </div>
                </div>
                <addNode :childNodeP.sync="nodeConfig.childNode"></addNode>
            </div>
        </div>
        <el-drawer title="发起人" :visible.sync="promoterDrawer" direction="rtl" class="set_promoter" size="550px" :before-close="savePromoter"> 
            <div class="demo-drawer__content">
                <div class="promoter_content drawer_content">
                    <p>{{arrToStr(flowPermission1)?arrToStr(flowPermission1):'所有人'}}</p>
                    <el-button class="purpleButton"  @click="addPromoter">添加/修改发起人</el-button>
                </div>
                <div class="demo-drawer__footer clear">
                    <el-button class="purpleButton" @click="savePromoter">确 定</el-button>
                    <el-button @click="promoterDrawer = false">取 消</el-button>
                </div>
                <el-dialog title="选择成员" :visible.sync="promoterVisible" width="600px" append-to-body class="promoter_person">
                    <div class="person_body clear">
                        <div class="person_tree l">
                            <input type="text" placeholder="搜索成员" v-model="promoterSearchName" @input="getDebounceData($event)">
                            <p class="ellipsis tree_nav" v-if="!promoterSearchName">
                                <span @click="getDepartmentList(0)" class="ellipsis">天下</span>
                                <span v-for="(item,index) in departments.titleDepartments" class="ellipsis" 
                                :key="index+'a'" @click="getDepartmentList(item.id)">{{item.departmentName}}</span>   
                            </p>
                            <ul>
                                <li v-for="(item,index) in departments.childDepartments" :key="index+'b'" class="check_box">
                                    <a :class="toggleClass(checkedDepartmentList,item)&&'active'" @click="toChecked(checkedDepartmentList,item)">
                                        <img src="@/assets/images/icon_file.png">{{item.departmentName}}</a>
                                    <i @click="employeesList(item.id)">下级</i>
                                    <!-- 部门下级循环 disabled="disabled"-->
                                    <ul style="height: auto;margin-left:20px;" v-if="item.id == activeNameChecked">
                                        <li v-for="(item,index) in item.departmentEmployees" :key="index+'b_'" class="check_box">
                                            <a :class="toggleClass(checkedDepartmentEmployees,item,'eid')&&'active'" @click="toChecked(checkedDepartmentEmployees,item,'eid')" :title="item.description">
                                                <img src="@/assets/images/icon_people.png">{{item.employeeName}}</a>
                                        </li>
                                    </ul>
                                </li>
                                <li v-for="(item,index) in departments.employees" :key="index+'c'" class="check_box">
                                    <a :class="toggleClass(checkedEmployessList,item)&&'active'" @click="toChecked(checkedEmployessList,item)" :title="item.departmentNames">
                                        <img src="@/assets/images/icon_people.png">{{item.employeeName}}</a>
                                </li>
                            </ul>
                        </div>
                        <div class="has_selected l">
                            <p class="clear">已选（{{checkedDepartmentList.length+checkedEmployessList.length}}）
                                <a @click="checkedDepartmentList=[];checkedEmployessList=[];checkedDepartmentEmployees=[]">清空</a>
                            </p>
                            <ul>
                                <li v-for="(item,index) in checkedDepartmentList" :key="index+'d'">
                                    <img src="@/assets/images/icon_file.png">
                                    <span>{{item.departmentName}}</span>
                                    <img src="@/assets/images/cancel.png" @click="removeEle(checkedDepartmentList,item)">
                                </li>
                                <li v-for="(item,index) in checkedEmployessList" :key="index+'e'">
                                    <img src="@/assets/images/icon_people.png">
                                    <span>{{item.employeeName}}</span>
                                    <img src="@/assets/images/cancel.png" @click="removeEle(checkedEmployessList,item)">
                                </li>
                                <!-- 部门下级 -->
                                <li v-for="(item,index) in checkedDepartmentEmployees" :key="index+'e1_1'">
                                    <img src="@/assets/images/icon_people.png">
                                    <span>{{item.employeeName}}</span>
                                    <img src="@/assets/images/cancel.png" @click="removeEle(checkedDepartmentEmployees,item)">
                                </li>
                            </ul>
                        </div>
                    </div>
                    <span slot="footer" class="dialog-footer">
                        <el-button @click="promoterVisible = false">取 消</el-button>
                        <el-button class="purpleButton" @click="surePromoter">确 定</el-button>
                    </span>
                </el-dialog>
            </div>
        </el-drawer>
        <el-drawer title="审批人设置" :visible.sync="approverDrawer" direction="rtl" class="set_promoter" size="550px" :before-close="saveApprover"> 
            <div class="demo-drawer__content">
                <div class="drawer_content">
                    <!-- 在审批模块中增添环节定义中的属性 Begin-->
                    <div class="addDiv">
                        <p class="selected_list">执行人：
                            <span v-for="(item,index) in approverConfig.nodeUserList" :key="index">{{item.name}}
                                <img src="@/assets/images/add-close1.png" @click="removeEle(approverConfig.nodeUserList,item,'targetId')">
                            </span>
                            <a v-if="approverConfig.nodeUserList&&approverConfig.nodeUserList.length!=0" @click="approverConfig.nodeUserList=[]">清除</a>
                            <button type="submit" @click="addApproverMember">添加审核成员</button>
                        </p>
                        <div class="addList">
                            <!-- <p class="sceneCoding">场景编码:
                                <input type="text" placeholder="请填写场景编码" style="width:380px;" v-model.number="propertyList.sceneCoding">
                            </p> -->
                            <!-- <div class="sqlDiv">
                                <p class="sqlInput">执行sql脚本:
                                    <textarea name="textarea" cols="50" rows="4" v-model="propertyList.sqlString"></textarea>
                                </p>
                            </div>
                            <div style="color:red">sql编写规则：<p>where条件替换字段'{userid}'(发起任务人的用户id),'{fromdataid}(表单任务主键id)'</p></div> -->
                            <p class="ifway" style="margin-bottom:15px">执行方式：
                                <el-radio-group v-model="propertyList.executionMode">
                                    <el-radio :label="1">会签</el-radio>
                                    <el-radio :label="2">竞争</el-radio>
                                </el-radio-group>
                            </p>
                            <p class="ifway">待办人等于发起人时跳过:
                                    <el-checkbox v-model="propertyList.jump" style="margin-left:10px;">跳过</el-checkbox>
                            </p>
                            <!-- <p class="ifway">代办类型：
                                <el-radio-group v-model="propertyList.handlerType">
                                    <el-radio :label="1">知会</el-radio>
                                    <el-radio :label="2">审批</el-radio>
                                </el-radio-group>
                            </p> -->
                        </div>
                    </div>
                    <!-- 在审批模块中增添环节定义中的属性 End -->
                </div>

                <!-- <div class="drawer_content">
                    <div class="approver_content">
                        <el-radio-group v-model="approverConfig.settype" class="clear" @change="changeType">
                            <el-radio :label="1">指定成员</el-radio>
                            <el-radio :label="2">主管</el-radio>
                            <el-radio :label="4">发起人自选</el-radio>
                            <el-radio :label="5">发起人自己</el-radio>
                            <el-radio :label="7">连续多级主管</el-radio>
                        </el-radio-group>
                        <el-button type="primary" @click="addApprover" v-if="approverConfig.settype==1">添加/修改成员</el-button>
                        <p class="selected_list" v-if="approverConfig.settype==1">
                            <span v-for="(item,index) in approverConfig.nodeUserList" :key="index">{{item.name}}
                                <img src="@/assets/images/add-close1.png" @click="removeEle(approverConfig.nodeUserList,item,'targetId')">
                            </span>
                            <a v-if="approverConfig.nodeUserList.length!=0" @click="approverConfig.nodeUserList=[]">清除</a>
                        </p>
                    </div>
                    <div class="approver_manager" v-if="approverConfig.settype==2">
                        <p>
                            <span>发起人的：</span>
                            <select v-model="approverConfig.directorLevel">
                                <option v-for="item in directorMaxLevel" :value="item" :key="item">{{item==1?'直接':'第'+item+'级'}}主管</option>
                            </select>
                        </p>
                        <p class="tip">找不到主管时，由上级主管代审批</p>
                    </div>
                    <div class="approver_self" v-if="approverConfig.settype==5">
                        <p>该审批节点设置“发起人自己”后，审批人默认为发起人</p>
                    </div>
                    <div class="approver_self_select" v-show="approverConfig.settype==4">
                        <el-radio-group v-model="approverConfig.selectMode" style="width: 100%;">
                            <el-radio :label="1">选一个人</el-radio>
                            <el-radio :label="2">选多个人</el-radio>
                        </el-radio-group>
                        <h3>选择范围</h3>
                        <el-radio-group v-model="approverConfig.selectRange" style="width: 100%;" @change="changeRange">
                            <el-radio :label="1">全公司</el-radio>
                            <el-radio :label="2">指定成员</el-radio>
                            <el-radio :label="3">指定角色</el-radio>
                        </el-radio-group>
                        <el-button type="primary" @click="addApprover" v-if="approverConfig.selectRange==2">添加/修改成员</el-button>
                        <el-button type="primary" @click="addRoleApprover" v-if="approverConfig.selectRange==3">添加/修改角色</el-button>
                        <p class="selected_list" v-if="approverConfig.selectRange==2||approverConfig.selectRange==3">
                            <span v-for="(item,index) in approverConfig.nodeUserList" :key="index">{{item.name}}
                                <img src="@/assets/images/add-close1.png" @click="removeEle(approverConfig.nodeUserList,item,'targetId')">
                            </span>
                            <a v-if="approverConfig.nodeUserList.length!=0&&approverConfig.selectRange!=1" @click="approverConfig.nodeUserList=[]">清除</a>
                        </p>
                    </div>
                    <div class="approver_manager" v-if="approverConfig.settype==7">
                        <p>审批终点</p>
                        <p style="padding-bottom:20px">
                            <span>发起人的：</span>
                            <select v-model="approverConfig.examineEndDirectorLevel">
                                <option v-for="item in directorMaxLevel" :value="item" :key="item">{{item==1?'最高':'第'+item}}层级主管</option>
                            </select>
                        </p>
                    </div>
                    <div class="approver_some" v-if="(approverConfig.settype==1&&approverConfig.nodeUserList.length>1)||approverConfig.settype==2||(approverConfig.settype==4&&approverConfig.selectMode==2)">
                        <p>多人审批时采用的审批方式</p>
                        <el-radio-group v-model="approverConfig.examineMode" class="clear">
                            <el-radio :label="1">依次审批</el-radio>
                            <br/>
                            <el-radio :label="2" v-if="approverConfig.settype!=2">会签(须所有审批人同意)</el-radio>
                        </el-radio-group>
                    </div>
                    <div class="approver_some" v-if="approverConfig.settype==2||approverConfig.settype==7">
                        <p>审批人为空时</p>
                        <el-radio-group v-model="approverConfig.noHanderAction" class="clear">
                            <el-radio :label="1">自动审批通过/不允许发起</el-radio>
                            <br/>
                            <el-radio :label="2">转交给审核管理员</el-radio>
                        </el-radio-group>
                    </div>
                </div> -->

                <!-- 在审批模块中增添环节定义中的属性:人员选择 Begin -->
                <el-dialog title="选择审批成员" :visible.sync="approverVisible" width="600px" append-to-body class="promoter_person">
                    <div class="person_body clear">
                        <div class="person_tree l">
                            <input type="text" placeholder="搜索成员" v-model="approverSearchName" @input="getDebounceData($event,activeName)">
                            <el-tabs v-model="activeName" @tab-click="handleClick">
                                <el-tab-pane label="组织架构" name="1"></el-tab-pane>
                                <el-tab-pane label="角色列表" name="2"></el-tab-pane>
                            </el-tabs>
                            <p class="ellipsis tree_nav" v-if="activeName==1&&!approverSearchName">
                                <span @click="getDepartmentList(0)" class="ellipsis">天下</span>
                                <span v-for="(item,index) in departments.titleDepartments" class="ellipsis" 
                                :key="index+'a'" @click="getDepartmentList(item.id)">{{item.departmentName}}</span>   
                            </p>
                            <ul style="height: 360px;" v-if="activeName==1">
                                <li v-for="(item,index) in departments.childDepartments" :key="index+'b'" class="check_box">
                                    <a :class="toggleClass(approverDepartmentList,item)&&'active'" @click="toChecked(approverDepartmentList,item)">
                                        <img src="@/assets/images/icon_file.png">{{item.departmentName}}</a>
                                    <i @click="getDepartmentList(item.id)">下级</i>
                                    <!-- 下级循环 disabled="disabled"-->
                                    <ul style="height: auto;margin-left:20px;" v-if="item.id == activeNameApprover">
                                        <li v-for="(item,index) in item.departmentEmployees" :key="index+'b_'" class="check_box">
                                            <a :class="toggleClass(approverDepartmentEmployees,item,'eid')&&'active'" @click="toChecked(approverDepartmentEmployees,item,'eid')" :title="item.description">
                                                <img src="@/assets/images/icon_people.png">{{item.employeeName}}</a>
                                        </li>
                                    </ul>
                                </li>
                                <li v-for="(item,index) in departments.employees" :key="index+'c'" class="check_box">
                                    <a :class="toggleClass(approverEmployessList,item)&&'active'" @click="toChecked(approverEmployessList,item)" :title="item.departmentNames">
                                        <img src="@/assets/images/icon_people.png">{{item.employeeName}}</a>
                                </li>
                            </ul>
                            <ul style="height: 360px;" v-if="activeName==2">
                                <li v-for="(item,index) in roles" :key="index+'c'" class="check_box">
                                    <a :class="toggleClass(approverRoleList,item,'roleId')&&'active'" @click="toChecked(approverRoleList,item,'roleId')" :title="item.description">
                                        <img src="@/assets/images/icon_role.png">{{item.roleName}}</a>
                                </li>
                            </ul>
                        </div>
                        <div class="has_selected l">
                            <p class="clear">已选（{{approverDepartmentList.length+approverEmployessList.length+approverRoleList.length+approverDepartmentEmployees.length}}）
                                <a @click="approverDepartmentList=[];approverEmployessList=[];approverRoleList=[];approverDepartmentEmployees=[]">清空</a>
                            </p>
                            <ul>
                                <li v-for="(item,index) in approverRoleList" :key="index+'e'">
                                    <img src="@/assets/images/icon_role.png">
                                    <span>{{item.roleName}}</span>
                                    <img src="@/assets/images/cancel.png" @click="removeEle(approverRoleList,item,'roleId')">
                                </li>
                                <li v-for="(item,index) in approverDepartmentList" :key="index+'e1'">
                                    <img src="@/assets/images/icon_file.png">
                                    <span>{{item.departmentName}}</span>
                                    <img src="@/assets/images/cancel.png" @click="removeEle(approverDepartmentList,item)">
                                </li>
                                <!-- 审批人 - 部门下级 -->
                                <li v-for="(item,index) in approverDepartmentEmployees" :key="index+'e1_1'">
                                    <img src="@/assets/images/icon_people.png">
                                    <span>{{item.employeeName}}</span>
                                    <img src="@/assets/images/cancel.png" @click="removeEle(approverDepartmentEmployees,item)">
                                </li>
                                <li v-for="(item,index) in approverEmployessList" :key="index+'e2'">
                                    <img src="@/assets/images/icon_people.png">
                                    <span>{{item.employeeName}}</span>
                                    <img src="@/assets/images/cancel.png" @click="removeEle(approverEmployessList,item)">
                                </li>
                            </ul>
                        </div>
                    </div>
                    <span slot="footer" class="dialog-footer">
                        <el-button @click="approverVisible = false">取 消</el-button>
                        <el-button class="purpleButton" @click="sureApproverMember">确 定</el-button>
                    </span>
                </el-dialog>
                <!-- 在审批模块中增添环节定义中的属性:人员选择 End -->
                <div class="demo-drawer__footer clear">
                    <el-button class="purpleButton" @click="saveApprover">确 定</el-button>
                    <el-button @click="approverDrawer = false">取 消</el-button>
                </div>
                <!-- <el-dialog title="选择成员" :visible.sync="approverVisible" width="600px" append-to-body class="promoter_person">
                    <div class="person_body clear">
                        <div class="person_tree l">
                            <input type="text" placeholder="搜索成员" v-model="approverSearchName" @input="getDebounceData($event)">
                            <p class="ellipsis tree_nav" v-if="!approverSearchName">
                                <span @click="getDepartmentList(0)" class="ellipsis">天下</span>
                                <span v-for="(item,index) in departments.titleDepartments" class="ellipsis" 
                                :key="index+'a'" @click="getDepartmentList(item.id)">{{item.departmentName}}</span>   
                            </p>
                            <ul>
                                <li v-for="(item,index) in departments.childDepartments" :key="index+'b'" class="check_box not">
                                    <a><img src="@/assets/images/icon_file.png">{{item.departmentName}}</a>
                                    <i @click="getDepartmentList(item.id)">下级</i>
                                </li>
                                <li v-for="(item,index) in departments.employees" :key="index+'c'" class="check_box">
                                    <a :class="toggleClass(approverEmplyessList,item)&&'active'" @click="toChecked(approverEmplyessList,item)" :title="item.departmentNames">
                                        <img src="@/assets/images/icon_people.png">{{item.employeeName}}</a>
                                </li>
                            </ul>
                        </div>
                        <div class="has_selected l">
                            <p class="clear">已选（{{approverEmplyessList.length}}）
                                <a @click="approverEmplyessList=[]">清空</a>
                            </p>
                            <ul>
                                <li v-for="(item,index) in approverEmplyessList" :key="index+'e'">
                                    <img src="@/assets/images/icon_people.png">
                                    <span>{{item.employeeName}}</span>
                                    <img src="@/assets/images/cancel.png" @click="removeEle(approverEmplyessList,item)">
                                </li>
                            </ul>
                        </div>
                    </div>
                    <span slot="footer" class="dialog-footer">
                        <el-button @click="approverVisible = false">取 消</el-button>
                        <el-button type="primary" @click="sureApprover">确 定</el-button>
                    </span>
                </el-dialog> -->
                 <!-- <el-dialog title="选择角色" :visible.sync="approverRoleVisible" width="600px" append-to-body class="promoter_person">
                    <div class="person_body clear">
                        <div class="person_tree l">
                            <input type="text" placeholder="搜索角色" v-model="approverRoleSearchName" @input="getDebounceData($event,2)">
                            <ul>
                                <li v-for="(item,index) in roles" :key="index+'b'" class="check_box not"
                                    :class="toggleClass(roleList,item,'roleId')&&'active'" @click="roleList=[item]">
                                    <a :title="item.description"><img src="@/assets/images/icon_role.png">{{item.roleName}}</a>
                                </li>
                            </ul>
                        </div>
                        <div class="has_selected l">
                            <p class="clear">已选（{{roleList.length}}）
                                <a @click="roleList=[]">清空</a>
                            </p>
                            <ul>
                                <li v-for="(item,index) in roleList" :key="index+'e'">
                                    <img src="@/assets/images/icon_role.png">
                                    <span>{{item.roleName}}</span>
                                    <img src="@/assets/images/cancel.png" @click="removeEle(roleList,item,'roleId')">
                                </li>
                            </ul>
                        </div>
                    </div>
                    <span slot="footer" class="dialog-footer">
                        <el-button @click="approverRoleVisible = false">取 消</el-button>
                        <el-button type="primary" @click="sureApprover">确 定</el-button>
                    </span>
                </el-dialog> -->
            </div>
        </el-drawer>
        <el-drawer title="抄送人设置" :visible.sync="copyerDrawer" direction="rtl" class="set_copyer" size="550px" :before-close="saveCopyer"> 
            <div class="demo-drawer__content">
                <div class="copyer_content drawer_content">
                    <el-button class="purpleButton" @click="addCopyer">添加成员</el-button>
                    <p class="selected_list">
                        <span v-for="(item,index) in copyerConfig.nodeUserList" :key="index">{{item.name}}
                            <img src="@/assets/images/add-close1.png" @click="removeEle(copyerConfig.nodeUserList,item,'targetId')">
                        </span>
                        <a v-if="copyerConfig.nodeUserList&&copyerConfig.nodeUserList.length!=0" @click="copyerConfig.nodeUserList=[]">清除</a>
                    </p>
                    <el-checkbox-group v-model="ccSelfSelectFlag" class="clear">
                        <el-checkbox :label="1">允许发起人自选抄送人</el-checkbox>
                    </el-checkbox-group>
                    <!-- 抄送模块增加字段 Begin -->
                    <div class="copyerList">
                        <!-- <p class="sceneCoding">场景编码:
                            <input type="text" placeholder="请填写场景编码" style="width:380px;" v-model.number="propertyList.sceneCoding">
                        </p> -->
                        <!-- <div class="sqlDiv">
                            <p class="sqlInput">执行sql脚本:
                                <textarea name="textarea" cols="50" rows="4" v-model="propertyList.sqlString"></textarea>
                            </p>
                        </div>
                        <div style="color:red">sql编写规则：<p>where条件替换字段'{userid}'(发起任务人的用户id),'{fromdataid}(表单任务主键id)'</p></div> -->
                        <!-- <div class="ifway" style="margin-bottom:15px">执行方式：
                            <el-radio-group v-model="propertyList.executionMode">
                                <el-radio :label="1">会签</el-radio>
                                <el-radio :label="2">竞争</el-radio>
                            </el-radio-group>
                        </div> -->
                        <div class="ifway">待办人等于发起人时跳过:
                                <el-checkbox v-model="propertyList.jump" style="margin-left:10px;">跳过</el-checkbox>
                        </div>
                        <!-- <div class="ifway">代办类型：
                            <el-radio-group v-model="propertyList.handlerType">
                                <el-radio :label="1">知会</el-radio>
                                <el-radio :label="2">审批</el-radio>
                            </el-radio-group>
                        </div> -->
                    </div>
                    <!-- 抄送模块增加字段 End -->
                </div>
                <div class="demo-drawer__footer clear">
                    <el-button class="purpleButton" @click="saveCopyer">确 定</el-button>
                    <el-button @click="copyerDrawer = false">取 消</el-button>
                </div>
                <el-dialog title="选择成员" :visible.sync="copyerVisible" width="600px" append-to-body class="promoter_person">
                    <div class="person_body clear">
                        <div class="person_tree l">
                            <input type="text" placeholder="搜索成员" v-model="copyerSearchName" @input="getDebounceData($event,activeName)">
                            <el-tabs v-model="activeName" @tab-click="handleClick">
                                <el-tab-pane label="组织架构" name="1"></el-tab-pane>
                                <el-tab-pane label="角色列表" name="2"></el-tab-pane>
                            </el-tabs>
                            <p class="ellipsis tree_nav" v-if="activeName==1&&!copyerSearchName">
                                <span @click="getDepartmentList(0)" class="ellipsis">天下</span>
                                <span v-for="(item,index) in departments.titleDepartments" class="ellipsis" 
                                :key="index+'a'" @click="getDepartmentList(item.id)">{{item.departmentName}}</span>   
                            </p>
                            <ul style="height: 360px;" v-if="activeName==1">
                                <li v-for="(item,index) in departments.childDepartments" :key="index+'b'" class="check_box">
                                    <a :class="toggleClass(copyerDepartmentList,item)&&'active'" @click="toChecked(copyerDepartmentList,item)">
                                        <img src="@/assets/images/icon_file.png">{{item.departmentName}}</a>
                                    <i @click="getDepartmentList(item.id)">下级</i>
                                    <!-- 抄送人 - 部门下级循环 disabled="disabled"-->
                                    <ul style="height: auto;margin-left:20px;" v-if="item.id == activeNameCopyer">
                                        <li v-for="(item,index) in item.departmentEmployees" :key="index+'b_'" class="check_box">
                                            <a :class="toggleClass(copyerDepartmentEmployees,item,'eid')&&'active'" @click="toChecked(copyerDepartmentEmployees,item,'eid')" :title="item.description">
                                                <img src="@/assets/images/icon_people.png">{{item.employeeName}}</a>
                                        </li>
                                    </ul>
                                </li>
                                <li v-for="(item,index) in departments.employees" :key="index+'c'" class="check_box">
                                    <a :class="toggleClass(copyerEmployessList,item)&&'active'" @click="toChecked(copyerEmployessList,item)" :title="item.departmentNames">
                                        <img src="@/assets/images/icon_people.png">{{item.employeeName}}</a>
                                </li>
                            </ul>
                            <ul style="height: 360px;" v-if="activeName==2">
                                <li v-for="(item,index) in roles" :key="index+'c'" class="check_box">
                                    <a :class="toggleClass(copyerRoleList,item,'roleId')&&'active'" @click="toChecked(copyerRoleList,item,'roleId')" :title="item.description">
                                        <img src="@/assets/images/icon_role.png">{{item.roleName}}</a>
                                </li>
                            </ul>
                        </div>
                        <div class="has_selected l">
                            <p class="clear">已选（{{copyerEmployessList.length+copyerRoleList.length}}）
                                <a @click="copyerEmployessList=[];copyerRoleList=[];copyerDepartmentEmployees=[];">清空</a>
                            </p>
                            <ul>
                                <li v-for="(item,index) in copyerRoleList" :key="index+'e'">
                                    <img src="@/assets/images/icon_role.png">
                                    <span>{{item.roleName}}</span>
                                    <img src="@/assets/images/cancel.png" @click="removeEle(copyerRoleList,item,'roleId')">
                                </li>
                                <li v-for="(item,index) in copyerDepartmentList" :key="index+'e1'">
                                    <img src="@/assets/images/icon_file.png">
                                    <span>{{item.departmentName}}</span>
                                    <img src="@/assets/images/cancel.png" @click="removeEle(copyerDepartmentList,item)">
                                </li>
                                <!-- 抄送人 - 部门下级 -->
                                <li v-for="(item,index) in copyerDepartmentEmployees" :key="index+'e1_1'">
                                    <img src="@/assets/images/icon_people.png">
                                    <span>{{item.employeeName}}</span>
                                    <img src="@/assets/images/cancel.png" @click="removeEle(copyerDepartmentEmployees,item)">
                                </li>
                                <li v-for="(item,index) in copyerEmployessList" :key="index+'e2'">
                                    <img src="@/assets/images/icon_people.png">
                                    <span>{{item.employeeName}}</span>
                                    <img src="@/assets/images/cancel.png" @click="removeEle(copyerEmployessList,item)">
                                </li>
                            </ul>
                        </div>
                    </div>
                    <span slot="footer" class="dialog-footer">
                        <el-button @click="copyerVisible = false">取 消</el-button>
                        <el-button class="purpleButton" @click="sureCopyer">确 定</el-button>
                    </span>
                </el-dialog>
            </div>
        </el-drawer>
        <el-drawer title="条件设置" :visible.sync="conditionDrawer" direction="rtl" class="condition_copyer" size="550px" :before-close="saveCondition"> 
            <select v-model="conditionConfig.priorityLevel">
                <option v-for="item in conditionsConfig.conditionNodes.length" :value="item" :key="item">优先级{{item}}</option>
            </select>
            <div class="demo-drawer__content">
                <div class="condition_content drawer_content">
                    <!-- 在条件模块中增添旧版属性 Begin -->
                    <p class="formChose" style="margin-bottom:70px">表单选择</p>
                    <div class="tableChose">
                         <select name="tableName" lay-verify="" lay-search style="width:210px;height:40px;font-size:14px;top:0;right: 45px;">
                            <option value="">请选择一个表格</option>
                            <option value="item" v-for="(item,index) in tableName" :key="index">{{item}}</option>
                        </select>
                    </div>
                     <!-- 按钮选择表格 -->
                    <!-- <el-radio-group v-model="conditionConfig.settype" class="clear" @change="changeType">
                        <el-radio :label="index" v-for="(item,index) in tableName" :key="index" @click="getIndex(index)">{{item}}</el-radio>
                    </el-radio-group> -->

                    <p class="formChose">表单属性列表</p>
                    <!-- 未和tableName 动态绑定 -->
                    <div class="approver_some" style="margin-top: -25px;padding-left: 0;padding-right: 0">
                        <el-table :data="formdata"  :header-cell-style="headClass" height="285" border borderstyle="width: 100%" style="font-size:12px" :row-style="{height:'0'}" :cell-style="{padding:'5px'}">
                            <el-table-column prop="name" align="center" label="属性名" width="140"></el-table-column>
                            <el-table-column prop="desc" align="center" label="属性描述"></el-table-column>
                        </el-table>
                    </div>
                    <div class="sqlDiv" style="margin:20px 0px 50px 0px;height:75px">
                        <p class="formChose">条件表达式</p>
                        <el-input type="textarea" :rows="2" placeholder="请输入条件表达式" v-model="conditionConfig.expressions"></el-input>
                    </div>
                    <!-- 在条件模块中增添旧版属性 End -->

                    <!-- <ul>
                        <li v-for="(item,index) in conditionConfig.conditionList" :key="index"> -->
                            <!-- 在条件模块中增添新属性 Begin-->
                            <!-- <p class="sceneCoding">场景编码:
                                <input type="text" placeholder="请填写场景编码" style="width:380px;" v-model="item.sceneCoding">
                            </p> -->
                            <!-- 在条件模块中增添新属性 End -->
                            <!-- <span class="ellipsis">{{item.type==1?'发起人(修改选择人员json)':item.showName}}：</span>
                            <div v-if="item.type==1">
                                <p :class="conditionConfig.nodeUserList.length > 0?'selected_list':''" @click.self="addConditionRole" style="cursor:text">
                                    <span v-for="(item1,index1) in conditionConfig.nodeUserList" :key="index1">
                                        {{item1.name}}<img src="@/assets/images/add-close1.png" @click="removeEle(conditionConfig.nodeUserList,item1,'targetId')">
                                    </span>
                                    <input type="text" placeholder="请选择具体人员/角色/部门" v-if="conditionConfig.nodeUserList.length == 0" @click="addConditionRole">
                                </p>
                            </div>
                            <div v-else-if="item.columnType == 'String' && item.showType == 3">
                                <p class="check_box">
                                    <a :class="toggleStrClass(item,item1.key)&&'active'" @click="toStrChecked(item,item1.key)"
                                    v-for="(item1,index1) in JSON.parse(item.fixedDownBoxValue)" :key="index1">{{item1.value}}</a>
                                </p>
                            </div>
                            <div v-else>
                                <p>
                                    <select v-model="item.optType" :style="'width:'+(item.optType==6?370:100)+'px'" @change="changeOptType(item)">
                                        <option value="1">小于</option>
                                        <option value="2">大于</option>
                                        <option value="3">小于等于</option>
                                        <option value="4">等于</option>
                                        <option value="5">大于等于</option>
                                        <option value="6">介于两个数之间</option>
                                    </select>
                                    <input v-if="item.optType!=6" type="text" :placeholder="'请输入'+item.showName" v-enter-number="2" v-model="item.zdy1">
                                </p>
                                <p v-if="item.optType==6">
                                    <input type="text" style="width:75px;" class="mr_10" v-enter-number="2" v-model="item.zdy1">
                                    <select style="width:60px;" v-model="item.opt1">
                                        <option value="<">&lt;</option>
                                        <option value="≤">≤</option>
                                    </select>
                                    <span class="ellipsis" style="display:inline-block;width:60px;vertical-align: text-bottom;">{{item.showName}}</span>
                                    <select style="width:60px;" class="ml_10" v-model="item.opt2">
                                        <option value="<">&lt;</option>
                                        <option value="≤">≤</option>
                                    </select>
                                    <input type="text" style="width:75px;" v-enter-number="2" v-model="item.zdy2">
                                </p>
                            </div> -->
                            <!-- 条件：选择人员input删除(清空conditionList，无最外围v-for数据) -->
                            <!-- <a v-if="item.type==1" @click="conditionConfig.nodeUserList= [];removeEle(conditionConfig.conditionList,item,'columnId')">删除</a>
                            <a v-if="item.type==2" @click="removeEle(conditionConfig.conditionList,item,'columnId')">删除</a> -->
                        <!-- </li> -->
                        <!-- 在条件模块中增添新属性 Begin-->
                        <!-- <li v-for="(item,index) in conditionConfig.conditionList" :key="'info' + index"> -->
                        <!-- :key="'info' + index" 为了解决有两个一样的v-for -->
                            <!-- <div class="sqlDiv">
                                <p class="sqlInput">执行人sql脚本:
                                    <textarea name="textarea" cols="55" rows="4" v-model="item.sqlString"></textarea>
                                </p>
                            </div>
                            <p style="color:red">sql编写规则：where条件替换字段'{userid}'(发起任务人的用户id),'{fromdataid}(表单任务主键id)'</p>
                            <p class="ifway">执行方式：
                                <el-radio-group v-model="item.executionMode">
                                    <el-radio :label="1">会签</el-radio>
                                    <el-radio :label="2">竞争</el-radio>
                                </el-radio-group>
                            </p>
                            <p class="ifway">待办人等于发起人时跳过:
                                    <el-checkbox v-model="item.jump" style="margin-left:10px;">跳过</el-checkbox>
                            </p>
                            <p class="ifway">代办类型：
                                <el-radio-group v-model="item.handlerType">
                                    <el-radio :label="1">知会</el-radio>
                                    <el-radio :label="2">审批</el-radio>
                                </el-radio-group>
                            </p>
                        </li> -->
                        <!-- 在条件模块中增添新属性 End -->
                    <!-- </ul> -->
                    <!-- <el-button type="primary" @click="addCondition">添加条件</el-button> -->
                    <!-- <el-dialog title="选择条件" :visible.sync="conditionVisible" width="480px" append-to-body class="condition_list">
                        <p>请选择用来区分审批流程的条件字段</p>
                        <p class="check_box">
                            <a :class="toggleClass(conditionList,{columnId:0},'columnId')&&'active'" @click="toChecked(conditionList,{columnId:0},'columnId')">发起人</a>
                            <a v-for="(item,index) in conditions" :key="index" :class="toggleClass(conditionList,item,'columnId')&&'active'" 
                            @click="toChecked(conditionList,item,'columnId')">{{item.showName}}</a>
                        </p>
                        <span slot="footer" class="dialog-footer">
                            <el-button @click="conditionVisible = false">取 消</el-button>
                            <el-button type="primary" @click="sureCondition">确 定</el-button>
                        </span>
                    </el-dialog> -->
                </div>
                <!-- <el-dialog title="选择成员" :visible.sync="conditionRoleVisible" width="600px" append-to-body class="promoter_person">
                    <div class="person_body clear">
                        <div class="person_tree l">
                            <input type="text" placeholder="搜索成员" v-model="conditionRoleSearchName" @input="getDebounceData($event,activeName)">
                            <el-tabs v-model="activeName" @tab-click="handleClick">
                                <el-tab-pane label="组织架构" name="1"></el-tab-pane>
                                <el-tab-pane label="角色列表" name="2"></el-tab-pane>
                            </el-tabs>
                            <p class="ellipsis tree_nav" v-if="activeName==1&&!conditionRoleSearchName">
                                <span @click="getDepartmentList(0)" class="ellipsis">天下</span>
                                <span v-for="(item,index) in departments.titleDepartments" class="ellipsis" 
                                :key="index+'a'" @click="getDepartmentList(item.id)">{{item.departmentName}}</span>   
                            </p>
                            <ul style="height: 360px;" v-if="activeName==1">
                                <li v-for="(item,index) in departments.childDepartments" :key="index+'b'" class="check_box">
                                    <a :class="toggleClass(conditionDepartmentList,item)&&'active'" @click="toChecked(conditionDepartmentList,item)">
                                        <img src="@/assets/images/icon_file.png">{{item.departmentName}}</a>
                                    <i @click="getDepartmentList(item.id)">下级</i>
                                </li>
                                <li v-for="(item,index) in departments.employees" :key="index+'c'" class="check_box">
                                    <a :class="toggleClass(conditionEmployessList,item)&&'active'" @click="toChecked(conditionEmployessList,item)" :title="item.departmentNames">
                                        <img src="@/assets/images/icon_people.png">{{item.employeeName}}</a>
                                </li>
                            </ul>
                            <ul style="height: 360px;" v-if="activeName==2">
                                <li v-for="(item,index) in roles" :key="index+'c'" class="check_box">
                                    <a :class="toggleClass(conditionRoleList,item,'roleId')&&'active'" @click="toChecked(conditionRoleList,item,'roleId')" :title="item.description">
                                        <img src="@/assets/images/icon_role.png">{{item.roleName}}</a>
                                </li>
                            </ul>
                        </div>
                        <div class="has_selected l">
                            <p class="clear">已选（{{conditionDepartmentList.length+conditionEmployessList.length+conditionRoleList.length}}）
                                <a @click="conditionDepartmentList=[];conditionEmployessList=[];conditionRoleList=[]">清空</a>
                            </p>
                            <ul>
                                <li v-for="(item,index) in conditionRoleList" :key="index+'e'">
                                    <img src="@/assets/images/icon_role.png">
                                    <span>{{item.roleName}}</span>
                                    <img src="@/assets/images/cancel.png" @click="removeEle(conditionRoleList,item,'roleId')">
                                </li>
                                <li v-for="(item,index) in conditionDepartmentList" :key="index+'e1'">
                                    <img src="@/assets/images/icon_file.png">
                                    <span>{{item.departmentName}}</span>
                                    <img src="@/assets/images/cancel.png" @click="removeEle(conditionDepartmentList,item)">
                                </li>
                                <li v-for="(item,index) in conditionEmployessList" :key="index+'e2'">
                                    <img src="@/assets/images/icon_people.png">
                                    <span>{{item.employeeName}}</span>
                                    <img src="@/assets/images/cancel.png" @click="removeEle(conditionEmployessList,item)">
                                </li>
                            </ul>
                        </div>
                    </div>
                    <span slot="footer" class="dialog-footer">
                        <el-button @click="conditionRoleVisible = false">取 消</el-button>
                        <el-button type="primary" @click="sureConditionRole">确 定</el-button>
                    </span>
                </el-dialog> -->
                <div class="demo-drawer__footer clear">
                    <el-button class="purpleButton" @click="saveCondition">确 定</el-button>
                    <el-button @click="conditionDrawer = false">取 消</el-button>
                </div>
            </div>
        </el-drawer>
        <nodeWrap v-if="nodeConfig.childNode && nodeConfig.childNode" :nodeConfig.sync="nodeConfig.childNode" :tableId="tableId"
        :isTried.sync="isTried" :directorMaxLevel="directorMaxLevel"></nodeWrap>
    </div>
</template>
<script>
export default {
    props: ["nodeConfig", "flowPermission", "directorMaxLevel", "isTried", "tableId"],
    data() {
        return {
            placeholderList: ["发起人", "审核人", "抄送人"],
            isInputList: [],
            isInput: false,
            promoterVisible: false,
            promoterDrawer: false,
            departments: {},
            checkedDepartmentList: [],
            checkedEmployessList: [],
            checkedDepartmentEmployees: [], // 发起人：部门下级
            activeNameChecked: "",  // 发起人：部门下级
            promoterSearchName: "",
            flowPermission1: this.flowPermission,
            approverDrawer: false,
            approverVisible: false,
            approverRoleVisible: false,
            approverConfig: {},
            approverEmplyessList: [],
            approverSearchName: "",
            //添加审批模块新字段 Begin
            // 增添抄送approverList propertyList
            propertyList: {
                executionMode:1,
                sqlString:'',
                jump:false,
                // sceneCoding:'',
                // handlerType:1
            },
            approverDepartmentList:[],
            approverEmployessList: [],
            approverRoleList: [],
            approverDepartmentEmployees: [], // 审核人:部门下级
            activeNameApprover: "", // 审核人：审批成员下级
            //添加审批模块新字段 End
            roles: [],
            roleList: [],
            approverRoleSearchName: "",
            copyerDrawer: false,
            copyerVisible: false,
            copyerConfig: {},
            // 增添抄送 copyerList propertyList
            propertyList: {
                sqlString:'',
                jump:false,
                executionMode:1,
                // sceneCoding:'',
                // handlerType:1
            },
            copyerSearchName: "",
            activeName: "1",
            // 添加抄送部门列表
            copyerDepartmentList: [],
            copyerEmployessList: [],
            copyerRoleList: [],
            copyerDepartmentEmployees: [], // 抄送人 - 部门下级
            activeNameCopyer: "", // 抄送人 - 部门下级
            ccSelfSelectFlag: [],
            conditionDrawer: false,
            conditionVisible: false,
            conditionConfig: {}, //条件设置
            conditionsConfig: {
                conditionNodes: [],
            },
            bPriorityLevel: "",
            conditions: [],
            conditionList: [],
            conditionRoleVisible: false,
            conditionRoleSearchName: "",
            conditionDepartmentList: [],
            conditionEmployessList: [],
            conditionRoleList: [],
            // 在条件列表中添加新属性
            // 执行方式
            executionMode:1,
            // 场景编码
            // sceneCoding:'',
            // 执行sql脚本
            sqlString:'',
            // 待办人等于发起人时跳过:
            jump:false,
            // 代办类型
            // handlerType:1,
            // 条件模块下的sql
            expressions:'',
            // 条件form表格测试数据
             formdata:[
                {
                "name": "test1",
                "desc": "测试1",
                "value": "10"
                },
                {
                "name": "test2",
                "desc": "测试2",
                "value": "50"
                },
                {
                "name": "test3",
                "desc": "测试3",
                "value": "100"
                }
            ],
            formdataTest:[],
            // 条件from表单名字数据
            tableName:['技术问题申报','我的发起','FromOne','FromTwo','FromThree','FromFour'],
        }
    },
    mounted() {
        if (this.nodeConfig.type == 1) {
            this.nodeConfig.error = !this.setApproverStr(this.nodeConfig)
        } else if (this.nodeConfig.type == 2) {
            this.nodeConfig.error = !this.copyerStr(this.nodeConfig)
        } else if (this.nodeConfig.type == 4) {
            for (var i = 0; i < this.nodeConfig.conditionNodes.length; i++) {
                // 修改请先设置条件
                this.nodeConfig.conditionNodes[i].error = this.conditionStr(this.nodeConfig.conditionNodes[i], i) == "mounted Test" && i != this.nodeConfig.conditionNodes.length - 1
            }
        }
    },
    methods: {
        // el-table 表头居中
        headClass(){
            return "text-align:center";
        },
        clickEvent(index) {
            if (index || index === 0) {
                this.$set(this.isInputList, index, true)
            } else {
                this.isInput = true;
            }
        },
        blurEvent(index) {
            if (index || index === 0) {
                this.$set(this.isInputList, index, false)
                this.nodeConfig.conditionNodes[index].nodeName = this.nodeConfig.conditionNodes[index].nodeName ? this.nodeConfig.conditionNodes[index].nodeName : "条件"
            } else {
                this.isInput = false;
                this.nodeConfig.nodeName = this.nodeConfig.nodeName ? this.nodeConfig.nodeName : this.placeholderList[this.nodeConfig.type]
            }
        },
        // 条件
        conditionStr(item, index) {
            var { conditionList, nodeUserList } = item;
            // if (conditionList.length == 0) {
            if (item.expressions == undefined) {
                // 初始条件显示
                // return (index == this.nodeConfig.conditionNodes.length - 1) && this.nodeConfig.conditionNodes[0].conditionList.length != 0 ? '条件表达式：'+ this.conditionConfig.expressions : '条件表达式：'+ this.conditionConfig.expressions
                // return (index == this.nodeConfig.conditionNodes.length - 1) && this.nodeConfig.conditionNodes[0].conditionList.length != 0 ? '其他条件进入此流程' : '请设置条件'
                return (index == this.nodeConfig.conditionNodes.length - 1) && this.nodeConfig.conditionNodes[0].conditionList.length != 0 ? '请设置条件' : '请设置条件'
            } else {
                // let str = ""
                // for (var i = 0; i < conditionList.length; i++) {
                //     var { columnId, columnType, showType, showName, optType, zdy1, opt1, zdy2, opt2, fixedDownBoxValue } = conditionList[i];
                //     if (columnId == 0) {
                //         if (nodeUserList.length != 0) {
                //             str += '发起人属于：'
                //             str += nodeUserList.map(item => { return item.name }).join("或") + " 并且 "
                //         }
                //     }
                //     if (columnType == "String" && showType == "3") {
                //         if (zdy1) {
                //             str += showName + '属于：' + this.dealStr(zdy1, JSON.parse(fixedDownBoxValue)) + " 并且 "
                //         }
                //     }
                //     if (columnType == "Double") {
                //         if (optType != 6 && zdy1) {
                //             var optTypeStr = ["", "<", ">", "≤", "=", "≥"][optType]
                //             str += `${showName} ${optTypeStr} ${zdy1} 并且 `
                //         } else if (optType == 6 && zdy1 && zdy2) {
                //             str += `${zdy1} ${opt1} ${showName} ${opt2} ${zdy2} 并且 `
                //         }
                //     }
                // }
                // // return str ? str.substring(0, str.length - 4) : '条件表达式：'+ this.conditionConfig.expressions
                // return str ? str.substring(0, str.length - 4) : '请设置条件'
                return item.expressions;
            }
        },
        dealStr(str, obj) {
            let arr = [];
            let list = str.split(",");
            for (var elem in obj) {
                list.map(item => {
                    if (item == elem) {
                        arr.push(obj[elem].value)
                    }
                })
            }
            return arr.join("或")
        },
        addConditionRole() {
            this.conditionRoleSearchName = "";
            this.conditionRoleVisible = true;
            this.activeName = "1";
            this.getDepartmentList();
            this.conditionDepartmentList = [];
            this.conditionEmployessList = [];
            this.conditionRoleList = [];
            for (var i = 0; i < this.conditionConfig.nodeUserList.length; i++) {
                var { type, name, targetId } = this.conditionConfig.nodeUserList[i];
                if (type == 1) {
                    this.conditionEmployessList.push({
                        employeeName: name,
                        id: targetId
                    });
                } else if (type == 2) {
                    this.conditionRoleList.push({
                        roleName: name,
                        roleId: targetId
                    });
                } else if (type == 3) {
                    this.conditionDepartmentList.push({
                        departmentName: name,
                        id: targetId
                    });
                }
            }
        },
        sureConditionRole() {
            this.conditionConfig.nodeUserList = [];
            this.conditionRoleList.map(item => {
                this.conditionConfig.nodeUserList.push({
                    type: 2,
                    targetId: item.roleId,
                    name: item.roleName,
                })
            });
            this.conditionDepartmentList.map(item => {
                this.conditionConfig.nodeUserList.push({
                    type: 3,
                    targetId: item.id,
                    name: item.departmentName,
                })
            });
            this.conditionEmployessList.map(item => {
                this.conditionConfig.nodeUserList.push({
                    type: 1,
                    targetId: item.id,
                    name: item.employeeName,
                })
            });
            this.conditionRoleVisible = false;
        },
        // 添加条件节点
        addCondition() {
            this.conditionList = [];
            this.conditionVisible = true;
            // 
            this.$axios.get(`${process.env.BASE_URL}conditions.json?tableId=${this.tableId}`).then(res => {
                this.conditions = res.data;
                if (this.conditionConfig.conditionList) {
                    for (var i = 0; i < this.conditionConfig.conditionList.length; i++) {
                        var { columnId } = this.conditionConfig.conditionList[i]
                        if (columnId == 0) {
                            // 当添加条件语句字段为空
                            this.conditionList.push({ columnId: 0})
                        } else {
                            this.conditionList.push(this.conditions.filter(item => { return item.columnId == columnId})[0])
                        }
                    }
                }
            })
        },
        changeOptType(item) {
            if (item.optType == 1) {
                item.zdy1 = 2;
            } else {
                item.zdy1 = 1;
                item.zdy2 = 2;
            }
        },
        // 添加条件弹出窗
        sureCondition() {
            //1.弹窗有，外面无+
            //2.弹窗有，外面有不变
            for (var i = 0; i < this.conditionList.length; i++) {
                var { columnId, showName, columnName, showType, columnName, columnType, fixedDownBoxValue} = this.conditionList[i];
                if (this.toggleClass(this.conditionConfig.conditionList, this.conditionList[i], "columnId")) {
                    continue;
                }
                if (columnId == 0) {
                    this.conditionConfig.nodeUserList == [];
                    this.conditionConfig.conditionList.push({
                        "type": 1,
                        "columnId": columnId,
                        "showName": '发起人',
                    });
                } else {
                    if (columnType == "Double") {
                        this.conditionConfig.conditionList.push({
                            "showType": showType,
                            "columnId": columnId,
                            "type": 2,
                            "showName": showName,
                            "optType": "1",
                            "zdy1": "2",
                            "opt1": "<",
                            "zdy2": "",
                            "opt2": "<",
                            "columnDbname": columnName,
                            "columnType": columnType,
                        })
                    } else if (columnType == "String" && showType == "3") {
                        this.conditionConfig.conditionList.push({
                            "showType": showType,
                            "columnId": columnId,
                            "type": 2,
                            "showName": showName,
                            "zdy1": "",
                            "columnDbname": columnName,
                            "columnType": columnType,
                            "fixedDownBoxValue": fixedDownBoxValue,
                        })
                    }
                }
            }
            ////3.弹窗无，外面有-
            for (var i = this.conditionConfig.conditionList.length - 1; i >= 0; i--) {
                if (!this.toggleClass(this.conditionList, this.conditionConfig.conditionList[i], "columnId")) {
                    this.conditionConfig.conditionList.splice(i, 1);
                }
            }
            this.conditionConfig.conditionList.sort(function (a, b) { return a.columnId - b.columnId; });
            this.conditionVisible = false;
        },
        // 条件设置-抽屉-确定按钮
        saveCondition() {
            this.conditionDrawer = false;
            var a = this.conditionsConfig.conditionNodes.splice(this.bPriorityLevel - 1, 1)//截取旧下标
            this.conditionsConfig.conditionNodes.splice(this.conditionConfig.priorityLevel - 1, 0, a[0])//填充新下标
            this.conditionsConfig.conditionNodes.map((item, index) => {
                item.priorityLevel = index + 1
            });

            // for (var i = 0; i < this.conditionsConfig.conditionNodes.length; i++) {
            //     this.conditionsConfig.conditionNodes[i].error = this.conditionStr(this.conditionsConfig.conditionNodes[i], i) == "请设置条件" && i != this.conditionsConfig.conditionNodes.length - 1
            // }
            
            // 条件模块中添加sql表达式 -位置错误待修改
            // this.conditionConfig.conditionList= this.expressions; //覆盖条件模块的conditionList为前端添加的expressions
            this.conditionConfig.expressions = this.conditionConfig.expressions; //在条件模块的字段中新增expressions字段
            this.$emit("update:nodeConfig", this.conditionsConfig);
        },
        getDebounceData(event, type = 1) {
            this.$func.debounce(function () {
                if (event.target.value) {
                    if (type == 1) {
                        this.departments.childDepartments = [];
                        this.$axios.get(`${process.env.BASE_URL}employees.json?searchName=${event.target.value}&pageNum=1&pageSize=30`).then(res => {
                            this.departments.employees = res.data.list
                        })
                    } else {
                        this.$axios.get(`${process.env.BASE_URL}roles.json?searchName=${event.target.value}&pageNum=1&pageSize=30`).then(res => {
                            this.roles = res.data.list
                        })
                    }
                } else {
                    type == 1 ? this.getDepartmentList() : this.getRoleList();
                }
            }.bind(this))()
        },
        handleClick() {
            this.copyerSearchName = "";
            this.conditionRoleSearchName = "";
            if (this.activeName == 1) {
                this.getDepartmentList();
            } else {
                this.getRoleList();
            }
        },
        addCopyer() {
            this.copyerSearchName = "";
            this.copyerVisible = true;
            this.activeName = "1";
            this.getDepartmentList();
            this.copyerEmployessList = [];
            this.copyerRoleList = [];
            this.copyerDepartmentEmployees = [];
            // 添加抄送部门列表 
            this.copyerDepartmentList = [];
            for (var i = 0; i < this.copyerConfig.nodeUserList.length; i++) {
                var { type, name, targetId } = this.copyerConfig.nodeUserList[i];
                if (type == 1) {
                    this.copyerEmployessList.push({
                        employeeName: name,
                        id: targetId,
                    });
                } else if (type == 2) {
                    this.copyerRoleList.push({
                        roleName: name,
                        roleId: targetId,
                    });
                }else if (type == 3) {// 添加抄送部门列 type
                    this.copyerDepartmentList.push({
                        departmentName: name,
                        id: targetId,
                    });
                }else if (type == 4) { // 抄送人 - 下级部门
                    this.copyerDepartmentEmployees.push({
                        departmentName: name,
                        id: targetId,
                    });
                }
            }
        },
        // 抄送人抽屉
        sureCopyer() {
            this.copyerConfig.nodeUserList = [];
            this.copyerEmployessList.map(item => {
                this.copyerConfig.nodeUserList.push({
                    type: 1,
                    targetId: item.id,
                    name: item.employeeName
                });
            });
            this.copyerRoleList.map(item => {
                this.copyerConfig.nodeUserList.push({
                    type: 2,
                    targetId: item.roleId,
                    name: item.roleName
                });
            });
            // 添加抄送部门 push
            this.copyerDepartmentList.map(item => {
                this.copyerConfig.nodeUserList.push({
                    type: 3,
                    targetId: item.id,
                    name: item.departmentName
                });
            });
            // 抄送人 - 下级部门
            this.copyerDepartmentEmployees.map(item => {
                this.copyerConfig.nodeUserList.push({
                    type: 4,
                    targetId: item.eid,
                    name: item.employeeName,
                });
            });
            // 抄送模块添加新字段propertyList[]
            this.copyerConfig.propertyList =this.propertyList; 
            // this.copyerConfig.copyerList =this.copyerList; 
            
            this.copyerVisible = false;
        },
        saveCopyer() {
            this.copyerConfig.ccSelfSelectFlag = this.ccSelfSelectFlag.length == 0 ? 0 : 1;
            this.copyerConfig.error = !this.copyerStr(this.copyerConfig);
            this.$emit("update:nodeConfig", this.copyerConfig);
            this.copyerDrawer = false;
        },
        copyerStr(nodeConfig) {
            if (nodeConfig.nodeUserList.length != 0) {
                return this.arrToStr(nodeConfig.nodeUserList)
            } else {
                if (nodeConfig.ccSelfSelectFlag == 1) {
                    return "发起人自选"
                }
            }
        },
        changeRange(val) {
            this.approverConfig.nodeUserList = [];
        },
        changeType(val) {
            this.approverConfig.nodeUserList = [];
            this.approverConfig.examineMode = 1;
            this.approverConfig.noHanderAction = 2;
            if (val == 2) {
                this.approverConfig.directorLevel = 1;
            } else if (val == 4) {
                this.approverConfig.selectMode = 1;
                this.approverConfig.selectRange = 1;
            } else if (val == 7) {
                this.approverConfig.examineEndDirectorLevel = 1
            }
        },
        // 审批模块新方法 Begin
        addApproverMember(){
            // debugger
            this.conditionList = [];
            this.approverSearchName = "";
            this.approverVisible = true;
            this.activeName = "1";
            this.getDepartmentList();
            this.approverDepartmentList = [];
            this.approverEmployessList = [];
            this.approverRoleList = [];
            this.approverDepartmentEmployees = []; // 审批人 - 部门下级
            for (var i = 0; i < this.approverConfig.nodeUserList.length; i++) {
                var { type, name, targetId , eid } = this.approverConfig.nodeUserList[i];
                // console.log(this.approverConfig.nodeUserList[i])
                if (type == 1) {
                    this.approverEmployessList.push({
                        employeeName: name,
                        id: targetId
                    });
                } else if (type == 2) {
                    this.approverRoleList.push({
                        roleName: name,
                        roleId: targetId
                    });
                } else if (type == 3) {
                    this.approverDepartmentList.push({
                        departmentName: name,
                        id: targetId
                    });
                } else if(type == 4){ // 审批人 - 部门下级
                    this.approverDepartmentEmployees.push({
                        employeeName: name,
                        id: targetId
                    })
                    // console.log( this.departmentEmployeesList)
                }
            }
        },
        // 确定-添加审核人员确定按钮
        sureApproverMember(){
            this.approverConfig.nodeUserList = [];
            this.approverRoleList.map(item => {
                this.approverConfig.nodeUserList.push({
                    type: 2,
                    targetId: item.roleId,
                    name: item.roleName,
                });
            });
            this.approverDepartmentList.map(item => {
                this.approverConfig.nodeUserList.push({
                    type: 3,
                    targetId: item.id,
                    name: item.departmentName,
                })
            });
            this.approverEmployessList.map(item => {
                this.approverConfig.nodeUserList.push({
                    type: 1,
                    targetId: item.id,
                    name: item.employeeName,
                })
            });
            this.approverDepartmentEmployees.map(item => { // 审批人 - 部门下级
                this.approverConfig.nodeUserList.push({
                    type: 4,
                    targetId: item.eid,
                    name: item.employeeName,
                })
            });
            // 审批模块添加新字段propertyList[]
            // this.approverConfig.approverList =this.approverList; 
            this.approverConfig.propertyList =this.propertyList;
              
            this.approverVisible = false;
        },
        // 审批模块新方法 End
        addApprover() {
            this.approverVisible = true;
            this.approverSearchName = "";
            this.getDepartmentList();
            this.approverEmplyessList = [];
            for (var i = 0; i < this.approverConfig.nodeUserList.length; i++) {
                var { name, targetId } = this.approverConfig.nodeUserList[i];
                this.approverEmplyessList.push({
                    employeeName: name,
                    id: targetId
                });
            }
        },
        addRoleApprover() {
            this.approverRoleVisible = true;
            this.approverRoleSearchName = "";
            this.getRoleList();
            this.roleList = [];
            for (var i = 0; i < this.approverConfig.nodeUserList.length; i++) {
                var { name, targetId } = this.approverConfig.nodeUserList[i];
                this.roleList.push({
                    roleName: name,
                    roleId: targetId
                });
            }
        },
        sureApprover() {
            this.approverConfig.nodeUserList = [];
            if (this.approverConfig.settype == 1 || (this.approverConfig.settype == 4 && this.approverConfig.selectRange == 2)) {
                this.approverEmplyessList.map(item => {
                    this.approverConfig.nodeUserList.push({
                        type: 1,
                        targetId: item.id,
                        name: item.employeeName
                    })
                });
                this.approverVisible = false;
            } else if (this.approverConfig.settype == 4 && this.approverConfig.selectRange == 3) {
                this.roleList.map(item => {
                    this.approverConfig.nodeUserList.push({
                        type: 2,
                        targetId: item.roleId,
                        name: item.roleName
                    })
                });
                this.approverRoleVisible = false;
            }
        },
        setApproverStr(nodeConfig) {
            if (nodeConfig.settype == 1) {
                if (nodeConfig.nodeUserList.length == 1) {
                    return nodeConfig.nodeUserList[0].name
                } else if (nodeConfig.nodeUserList.length > 1) {
                    if (nodeConfig.examineMode == 1) {
                        return this.arrToStr(nodeConfig.nodeUserList)
                    } else if (nodeConfig.examineMode == 2) {
                        return nodeConfig.nodeUserList.length + "人会签"
                    }
                }
            } else if (nodeConfig.settype == 2) {
                let level = nodeConfig.directorLevel == 1 ? '直接主管' : '第' + nodeConfig.directorLevel + '级主管'
                if (nodeConfig.examineMode == 1) {
                    return level
                } else if (nodeConfig.examineMode == 2) {
                    return level + "会签"
                }
            } else if (nodeConfig.settype == 4) {
                if (nodeConfig.selectRange == 1) {
                    return "发起人自选"
                } else {
                    if (nodeConfig.nodeUserList.length > 0) {
                        if (nodeConfig.selectRange == 2) {
                            return "发起人自选"
                        } else {
                            return '发起人从' + nodeConfig.nodeUserList[0].name + '中自选'
                        }
                    } else {
                        return "";
                    }
                }
            } else if (nodeConfig.settype == 5) {
                return "发起人自己"
            } else if (nodeConfig.settype == 7) {
                return '从直接主管到通讯录中级别最高的第' + nodeConfig.examineEndDirectorLevel + '个层级主管'
            }
        },
        // 审批模块-抽屉确定按钮
        saveApprover() {
            this.approverConfig.error = !this.setApproverStr(this.approverConfig)
            this.$emit("update:nodeConfig", this.approverConfig);
            this.approverDrawer = false;
        },

        // 发起人
        addPromoter() {
            this.promoterVisible = true;
            this.getDepartmentList();
            this.promoterSearchName = "";
            this.checkedEmployessList = [];
            this.checkedDepartmentList = [];
            this.checkedDepartmentEmployees = []; // 发起人-部门下级
            for (var i = 0; i < this.flowPermission1.length; i++) {
                var { type, name, targetId } = this.flowPermission1[i];
                if (type == 1) {
                    this.checkedEmployessList.push({
                        employeeName: name,
                        id: targetId
                    });
                } else if (type == 3) {
                    this.checkedDepartmentList.push({
                        departmentName: name,
                        id: targetId
                    });
                } else if (type == 4) { // 发起人-部门下级
                    this.checkedDepartmentList.push({
                        departmentName: name,
                        id: targetId
                    });
                }
            }
        },
        // 发起人
        surePromoter() {
            this.flowPermission1 = [];
            this.checkedDepartmentList.map(item => {
                this.flowPermission1.push({
                    type: 3,
                    targetId: item.id,
                    name: item.departmentName
                })
            });
            this.checkedEmployessList.map(item => {
                this.flowPermission1.push({
                    type: 1,
                    targetId: item.id,
                    name: item.employeeName
                })
            });
            // 发起人-部门下级
            this.checkedDepartmentEmployees.map(item => {
                this.flowPermission1.push({
                    type: 4,
                    targetId: item.eid,
                    name: item.employeeName,
                })
            });
            this.promoterVisible = false;
        },
        savePromoter() {
            this.$emit("update:flowPermission", this.flowPermission1);
            this.promoterDrawer = false;
        },
        arrToStr(arr) {
            if (arr) {
                return arr.map(item => { return item.name }).toString()
            }
        },
        toggleStrClass(item, key) {
            let a = item.zdy1 ? item.zdy1.split(",") : []
            return a.some(item => { return item == key });
        },
        toStrChecked(item, key) {
            let a = item.zdy1 ? item.zdy1.split(",") : []
            var isIncludes = this.toggleStrClass(item, key);
            if (!isIncludes) {
                a.push(key)
                item.zdy1 = a.toString()
            } else {
                this.removeStrEle(item, key);
            }
        },
        removeStrEle(item, key) {
            let a = item.zdy1 ? item.zdy1.split(",") : []
            var includesIndex;
            a.map((item, index) => {
                if (item == key) {
                    includesIndex = index
                }
            });
            a.splice(includesIndex, 1);
            item.zdy1 = a.toString()
        },
        toggleClass(arr, elem, key = 'id') {
            return arr.some(item => { return item[key] == elem[key] });
        },

        toChecked(arr, elem, key = 'id') {
            var isIncludes = this.toggleClass(arr, elem, key);
            !isIncludes ? arr.push(elem) : this.removeEle(arr, elem, key);
        },
        removeEle(arr, elem, key = 'id') {
            var includesIndex;
            arr.map((item, index) => {
                if (item[key] == elem[key]) {
                    includesIndex = index
                }
            });
            arr.splice(includesIndex, 1);
        },
        getRoleList() {
            this.$axios.get(`${process.env.BASE_URL}roles.json`).then(res => {
                this.roles = res.data.list;
            })
        },
        // 获取成员列表
        getDepartmentList(parentId = 0) {
            this.$axios.get(`${process.env.BASE_URL}departments.json?parentId=${parentId}`).then(res => {
                this.departments = res.data;
                this.activeNameApprover = parentId;
                this.activeNameCopyer = parentId;
            })
        },
        // 获取部门员工列表
        employeesList(id = 0) {
            this.$axios.get(`${process.env.BASE_URL}departments.json?id=${id}`).then(res => {
                this.departments = res.data;
                this.activeNameChecked = id;
            })
        },
        delNode() {
            this.$emit("update:nodeConfig", this.nodeConfig.childNode);
        },
        addTerm() {
            let len = this.nodeConfig.conditionNodes.length + 1
            this.nodeConfig.conditionNodes.push({
                "nodeName": "条件" + len,
                "type": 3,
                "priorityLevel": len,
                "conditionList": [],
                "nodeUserList": [],
                "childNode": null
            });
            // for (var i = 0; i < this.nodeConfig.conditionNodes.length; i++) {
            //     this.nodeConfig.conditionNodes[i].error = this.conditionStr(this.nodeConfig.conditionNodes[i], i) == "请设置条件" && i != this.nodeConfig.conditionNodes.length - 1
            // }
            this.$emit("update:nodeConfig", this.nodeConfig);
        },
        delTerm(index) {
            this.nodeConfig.conditionNodes.splice(index, 1)
            // for (var i = 0; i < this.nodeConfig.conditionNodes.length; i++) {
            //     this.nodeConfig.conditionNodes[i].error = this.conditionStr(this.nodeConfig.conditionNodes[i], i) == "请设置条件" && i != this.nodeConfig.conditionNodes.length - 1
            // }
            this.$emit("update:nodeConfig", this.nodeConfig);
            if (this.nodeConfig.conditionNodes.length == 1) {
                if (this.nodeConfig.childNode) {
                    if (this.nodeConfig.conditionNodes[0].childNode) {
                        this.reData(this.nodeConfig.conditionNodes[0].childNode, this.nodeConfig.childNode)
                    } else {
                        this.nodeConfig.conditionNodes[0].childNode = this.nodeConfig.childNode
                    }
                }
                this.$emit("update:nodeConfig", this.nodeConfig.conditionNodes[0].childNode);
            }
        },
        reData(data, addData) {
            if (!data.childNode) {
                data.childNode = addData
            } else {
                this.reData(data.childNode, addData)
            }
        },
        setPerson(priorityLevel) {
            var { type } = this.nodeConfig;
            if (type == 0) {
                this.promoterDrawer = true;
                this.flowPermission1 = this.flowPermission;
            } else if (type == 1) {
                this.approverDrawer = true;
                this.approverConfig = JSON.parse(JSON.stringify(this.nodeConfig))
                this.approverConfig.settype = this.approverConfig.settype ? this.approverConfig.settype : 1
            } else if (type == 2) {
                this.copyerDrawer = true;
                this.copyerConfig = JSON.parse(JSON.stringify(this.nodeConfig))
                this.ccSelfSelectFlag = this.copyerConfig.ccSelfSelectFlag == 0 ? [] : [this.copyerConfig.ccSelfSelectFlag]
            } else {
                this.conditionDrawer = true
                this.bPriorityLevel = priorityLevel;
                this.conditionsConfig = JSON.parse(JSON.stringify(this.nodeConfig))
                this.conditionConfig = this.conditionsConfig.conditionNodes[priorityLevel - 1]
            }
        },
        setExpressions(priorityLevel){
            // alert('设置条件抽抽屉中的语句')
            this.conditionDrawer = true
            this.bPriorityLevel = priorityLevel;
            this.conditionsConfig = JSON.parse(JSON.stringify(this.nodeConfig))
            this.conditionConfig = this.conditionsConfig.conditionNodes[priorityLevel - 1]
        },
        arrTransfer(index, type = 1) {//向左-1,向右1
            this.nodeConfig.conditionNodes[index] = this.nodeConfig.conditionNodes.splice(index + type, 1, this.nodeConfig.conditionNodes[index])[0];
            this.nodeConfig.conditionNodes.map((item, index) => {
                item.priorityLevel = index + 1
            })
            // for (var i = 0; i < this.nodeConfig.conditionNodes.length; i++) {
            //     this.nodeConfig.conditionNodes[i].error = this.conditionStr(this.nodeConfig.conditionNodes[i], i) == "请设置条件" && i != this.nodeConfig.conditionNodes.length - 1
            // }
            this.$emit("update:nodeConfig", this.nodeConfig);
        }
    }
}
</script>

<style>
    /* 紫色按钮 */
    .purpleButton{
        background-color: #5473e8 !important;
        color: #fff !important;
        border: none !important;
        height: 30px;
    }
    .purpleButton:hover{
        background-color: rgba(84,115,232, .8) !important;
    }
    .selected_list a{
        color:#5473e8;
    }
    .approver_some .el-table--border th{
        padding: 5px !important;
        color: #778ca2;
    }
    .approver_some .el-table__body td{
        color: #333333;
    }
    .sqlDiv .el-textarea__inner{
        color: #333333;
    }
</style>