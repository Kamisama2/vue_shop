<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 头部搜索框 -->
      <el-row>
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            class="input-with-select"
            v-model="queryInfo.query"
            @clear="getOrderList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getOrderList"
            ></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 表格列表 -->
      <el-table :data="orderList" style="width: 100%" border stripe>
        <el-table-column type="index"> </el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price" width="80">
        </el-table-column>
        <el-table-column label="是否付款" width="80">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.pay_status === '0'" type="danger"
              >未付款</el-tag
            >
            <el-tag v-else type="success">已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="是否发货"
          prop="is_send"
          width="80"
        ></el-table-column>
        <el-table-column label="下单时间" width="150">
          <template>
            {{ this.orderList.create_time | formate }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template>
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showAddressDialog"
            ></el-button>
            <el-button
              type="success"
              icon="el-icon-location"
              size="mini"
              @click="showProgressDialog"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 修改地址的对话框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="addressDialogVisible"
      width="50%"
      @close="addressDialogClosed"
    >
      <!-- 主体内容 -->
      <el-form
        :model="addressForm"
        :rules="addressFormRulse"
        ref="addressFormRef"
        label-width="100px"
      >
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
            v-model="addressForm.address1"
            :options="cityData"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <!-- 下方按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressDialogVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>

    <!-- 查看物流进度的对话框 -->
    <el-dialog
      title="物流进度"
      :visible.sync="progressDialogVisible"
      width="50%"
    >
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in progressList"
          :key="index"
          :timestamp="activity.time"
        >
          {{ activity.context }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
// 导入级联选择框的数据
import cityData from "./citydata";

export default {
  name: "Order",
  data() {
    return {
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10,
      },
      total: 0,
      // 获取的订单列表数据
      orderList: [],
      // 修改地址的对话框显示与隐藏
      addressDialogVisible: false,
      addressForm: {
        // 级联选择框的数据
        address1: [],
        address2: "",
      },
      addressFormRulse: {
        address1: [
          { required: true, message: "请选择省市区县", trigger: "blur" },
        ],
        address2: [
          { required: true, message: "请填写详细地址", trigger: "blur" },
        ],
      },
      // 导入的城市数据
      cityData,
      // 查看物流进度的对话框显示与隐藏
      progressDialogVisible: false,
      // 储存物流信息
      progressList: [],
    };
  },
  created() {
    this.getOrderList();
  },
  methods: {
    async getOrderList() {
      const { data: ret } = await this.$http.get("orders", {
        params: this.queryInfo,
      });
      if (ret.meta.status !== 200) return this.$msg.error(ret.meta.msg);
      // console.log(ret.data);
      this.orderList = ret.data.goods;
      this.total = ret.data.total;
    },
    // 监听 pageSize 变化
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getOrderList();
    },
    // 监听 当前页 变化
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getOrderList();
    },
    // 点击展示修改地址的对话框
    showAddressDialog() {
      this.addressDialogVisible = true;
    },
    // 对话框关闭事件
    addressDialogClosed() {
      this.$refs.addressFormRef.resetFields();
    },
    // 点击展示查看物流进度的对话框
    async showProgressDialog() {
      //   const { data: ret } = await this.$http.get("/kuaidi/1106975712662");

      // 接口有点问题，直接拿到数据
      const ret = {
        data: [
          {
            time: "2018-05-10 09:39:00",
            ftime: "2018-05-10 09:39:00",
            context: "已签收,感谢使用顺丰,期待再次为您服务",
            location: "",
          },
          {
            time: "2018-05-10 08:23:00",
            ftime: "2018-05-10 08:23:00",
            context:
              "[北京市]北京海淀育新小区营业点派件员 顺丰速运 95338正在为您派件",
            location: "",
          },
          {
            time: "2018-05-10 07:32:00",
            ftime: "2018-05-10 07:32:00",
            context: "快件到达 [北京海淀育新小区营业点]",
            location: "",
          },
          {
            time: "2018-05-10 02:03:00",
            ftime: "2018-05-10 02:03:00",
            context:
              "快件在[北京顺义集散中心]已装车,准备发往 [北京海淀育新小区营业点]",
            location: "",
          },
          {
            time: "2018-05-09 23:05:00",
            ftime: "2018-05-09 23:05:00",
            context: "快件到达 [北京顺义集散中心]",
            location: "",
          },
          {
            time: "2018-05-09 21:21:00",
            ftime: "2018-05-09 21:21:00",
            context: "快件在[北京宝胜营业点]已装车,准备发往 [北京顺义集散中心]",
            location: "",
          },
          {
            time: "2018-05-09 13:07:00",
            ftime: "2018-05-09 13:07:00",
            context: "顺丰速运 已收取快件",
            location: "",
          },
          {
            time: "2018-05-09 12:25:03",
            ftime: "2018-05-09 12:25:03",
            context: "卖家发货",
            location: "",
          },
          {
            time: "2018-05-09 12:22:24",
            ftime: "2018-05-09 12:22:24",
            context: "您的订单将由HLA（北京海淀区清河中街店）门店安排发货。",
            location: "",
          },
          {
            time: "2018-05-08 21:36:04",
            ftime: "2018-05-08 21:36:04",
            context: "商品已经下单",
            location: "",
          },
        ],
        meta: { status: 200, message: "获取物流信息成功！" },
      };
      if (ret.meta.status !== 200) return this.$msg.error(ret.meta.msg);
      this.progressList = ret.data;
      //   console.log(ret.data);
      this.progressDialogVisible = true;
    },
  },
};
</script>

<style lang="less" scoped>
// 引入 timeline 的样式
@import "../../plugins/timeline/timeline.css";
@import "../../plugins/timeline-item/timeline-item.css";

.el-cascader {
  width: 100%;
}
</style>