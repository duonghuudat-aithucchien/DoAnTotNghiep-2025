import { Table } from "antd";
import React, { useMemo, useState } from "react";
import Loading from "../LoadingComponent/Loading";
// import { DownOutlined } from '@ant-design/icons';
import { Excel } from "antd-table-saveas-excel"

const TableComponent = (props) => {
    const {selectionType = 'checkbox', data:dataSource=[], isPending=false, columns=[], handleDeleteMany } = props
    const newColumnExport = useMemo(() => {
        const arr = columns?.filter((col) => col.dataIndex !== 'action')
        return arr
    }, [columns])
    const [rowSelectedKeys, setRowSelectedKeys] = useState([])

    const rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
            setRowSelectedKeys(selectedRowKeys)
        },
        // getCheckboxProps: (record) => ({
        //     disabled: record.name === 'Disabled User',
        //     // Column configuration not to be checked
        //     name: record.name,
        // }),
    };
    
    // const items = [
    //     {
    //       label: (
    //         <a target="_blank" rel="noopener noreferrer" href="https://www.antgroup.com">
    //           1st menu item
    //         </a>
    //       ),
    //       key: '1',
    //     },
    //     {
    //       label: (
    //         <a target="_blank" rel="noopener noreferrer" href="https://www.aliyun.com">
    //           2nd menu item（disabled）
    //         </a>
    //       ),
    //       key: '2',
    //     },
    //     {
    //       label: '3rd menu item（disabled）',
    //       key: '3',
    //       disabled: true,
    //     },
    //   ];

    const handleDeleteAll = () => {
        handleDeleteMany(rowSelectedKeys)
    }

    const exportExcel = () => {
        const excel = new Excel();
        excel
            .addSheet("test")
            .addColumns(newColumnExport)
            .addDataSource(dataSource, {
                str2Percent: true
            })
            .saveAs("Excel.xlsx")
    }

    return (
        <div>
            <Loading isPending={isPending}>
                {rowSelectedKeys.length > 0 && (
                    <div style={{background: '#1d1ddd', color: '#fff', fontWeight: 'bold', padding: '10px', cursor: 'pointer'}} onClick={handleDeleteAll}>
                    {/* <Dropdown menu={{ items }}>
                        <a onClick={e => e.preventDefault()}>
                            <Space>
                                Hover me
                                <DownOutlined />
                            </Space>
    
                        </a>
                    </Dropdown> */}
    
                    Xoá tất cả
                </div>
                )}

            <button onClick={exportExcel}>Xuất file</button>
            
            <Table 
                rowSelection={{
                    type: selectionType,
                    ...rowSelection,
                }}
                columns={columns}
                dataSource={dataSource}
                {...props}
            />
            </Loading>
        </div>
    )

}

export default TableComponent