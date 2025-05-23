import { Table, Button, Space } from "antd";
import React, { useMemo, useState } from "react";
import { Excel } from "antd-table-saveas-excel";
import { DownloadOutlined, DeleteOutlined } from "@ant-design/icons";
import Loading from "../LoadingComponent/Loading";
import { StyledTableWrapper } from "./TableStyle";

const getStatusLabel = (statusCode) => {
    switch (statusCode) {
      case "pending":
        return "Chờ xử lý";
      case "processing":
        return "Đang xử lý";
      case "delivering":
        return "Đang giao hàng";
      case "delivered":
        return "Đã giao";
      case "cancelled":
        return "Đã hủy";
      default:
        return "Không rõ";
    }
  };
  
const TableComponent = (props) => {
  const {
    selectionType = "checkbox",
    data: dataSource = [],
    isPending = false,
    columns = [],
    handleDeleteMany,
    rowKey = "key", // fallback nếu không truyền vào key riêng
  } = props;

  const newColumnExport = useMemo(() => {
    return columns
      ?.filter((col) => col.dataIndex !== "action")
      .map((col) => {
        if (col.dataIndex === "status") {
          return {
            ...col,
            render: undefined, // xóa render function nếu có
          };
        }
        return col;
      });
  }, [columns]);
  

  const [rowSelectedKeys, setRowSelectedKeys] = useState([]);

  const rowSelection = {
    onChange: (selectedRowKeys) => {
      setRowSelectedKeys(selectedRowKeys);
    },
  };

  const handleDeleteAll = () => {
    if (handleDeleteMany) {
      handleDeleteMany(rowSelectedKeys);
    }
  };

  const exportExcel = () => {
    const excel = new Excel();
  
    // map lại dataSource để xuất đúng nhãn status
    const dataExport = dataSource.map((item) => ({
      ...item,
      status: getStatusLabel(item.status),
    }));
  
    excel
      .addSheet("Danh sách")
      .addColumns(newColumnExport)
      .addDataSource(dataExport, {
        str2Percent: true,
      })
      .saveAs("Danh_sach.xlsx");
  };
  
  return (
    <StyledTableWrapper>
      <Loading isPending={isPending}>
        <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {rowSelectedKeys.length > 0 ? (
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              onClick={handleDeleteAll}
            >
              Xoá tất cả
            </Button>
          ) : <div />}
  
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={exportExcel}
          >
            Tạo báo cáo
          </Button>
        </div>
  
        <Table
          bordered
          pagination={{ pageSize: 10 }}
          rowSelection={{
            type: selectionType,
            ...rowSelection,
          }}
          columns={columns}
          dataSource={dataSource}
          rowKey={rowKey}
          {...props}
        />
      </Loading>
    </StyledTableWrapper>
  );
};

export default TableComponent;
