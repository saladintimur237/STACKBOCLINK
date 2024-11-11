import React, { useState, useEffect, useRef } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  doc,
  updateDoc,
  runTransaction,
  orderBy,
  getDocs,
  limit,
} from "firebase/firestore";
import { db } from "../../firebase";
import moment from 'moment';
import {UserOutlined } from "@ant-design/icons";
import { Button, DatePicker, Form, Input, Pagination } from "antd";
const { RangePicker } = DatePicker;

function getDomain(url, subdomain) {
  subdomain = subdomain || false;

  url = url.replace(/(https?:\/\/)?(www.)?/i, '');

  if (!subdomain) {
      url = url.split('.');

      url = url.slice(url.length - 2).join('.');
  }

  if (url.indexOf('/') !== -1) {
      return url.split('/')[0];
  }

  return url;
}

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [totalRecord, setTotalRecords] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);
  const usersRef = collection(db, "links");
  const q = query(usersRef, orderBy("createdAt", "desc"));
  const [reload, setReload] = useState(false);
  const [filter, setFilter] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snapshot = await onSnapshot(q, (querySnapshot) => {
          const userList = querySnapshot.docs.map((doc) => ({
            userID: doc.id,
            ...doc.data(),
          }));

          const offset = (currentPage - 1) * pageSize;
          const usersPerPage = userList.slice(offset, offset + pageSize);
          setUsers(usersPerPage);
          setTotalRecords(userList.length);
          setCurrentPage(1);
          setReload((prev) => !prev);
        });
        return snapshot;
      } catch (error) {
        console.error("Error fetching data from Firestore: ", error);
      }
    };

    // Fetch initial data
    fetchData();
  }, []);

  const filteredUsers = (userList) => {
    const { "range-time": dateRange, findkey } = filter;

    return userList.filter((user) => {
      if (findkey && (!user.email.toLowerCase().includes(findkey.trim().toLowerCase()) && !user.phone.toLowerCase().includes(findkey.trim().toLowerCase()))) {
        return false;
      }

      if (dateRange) {
        const userDate = moment(user.createdAt);
        const startDate = moment(dateRange[0], "YYYY-MM-DD");
        const endDate = moment(dateRange[1], "YYYY-MM-DD");
        if (!userDate.isBetween(startDate, endDate, null, "[]")) {
          return false;
        }
      }

      return true;
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(q);
        let userList = querySnapshot.docs.map((doc) => ({
          userID: doc.id,
          ...doc.data(),
        }));
        userList = filteredUsers(userList);
        const offset = (currentPage - 1) * pageSize;
        const usersPerPage = userList.slice(offset, offset + pageSize);
        setUsers(usersPerPage);
        setTotalRecords(userList.length);
      } catch (error) {
        console.error("Error fetching data from Firestore: ", error);
      }
    };

    fetchData();
  }, [currentPage, reload]);


  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleDelete = async (userID) => {
    try {

      if (confirm('Bạn có chắc muốn xóa dòng này không?')) {
          // Tạo một reference đến tài khoản bạn muốn xóa
          const userRef = doc(db, "links", userID); // Đây giả định rằng ID của người dùng được sử dụng làm ID của tài khoản
          // Gọi hàm xóa dựa trên reference
          await deleteDoc(userRef);
          setReload((prevState) => !prevState);
          alert(`Xóa ID: ${userID} thành công.`)
      }
    } catch (error) {
      alert(`Xóa ID: ${userID} thất bại.`)
    }
  };


  const handleInput = async () => {
    try {
      let counter = prompt("số lượng link cần tạo", "");
      if(!Number.isInteger(parseInt(counter))){
        alert('Số lượng link phải là một con số!');
        return;
      }
      let note = prompt("Nhập ghi chú", "");
      for(let i = 0; i < parseInt(counter); i++){
        await addDoc(collection(db, "links"), {
         counter:0,note:note,createdAt:new Date().getTime()
        });
      }
      alert('Thêm dữ liệu thành công!');
    }
    catch (error) {
    }
  };

  const onFinish = (fieldsValue) => {
    let findkey = fieldsValue["txt-search-key"];
    const values = {
      findkey
    };
    const rangeTimeValue = fieldsValue["range-time"];
    if (rangeTimeValue) {
      values["range-time"] = [
        rangeTimeValue[0].format("YYYY-MM-DD HH:mm:ss"),
        rangeTimeValue[1].format("YYYY-MM-DD HH:mm:ss"),
      ];
    }
    setFilter(values);
    setCurrentPage(1);
    setReload((prv) => !prv);
  };
  

  return (
    <div className="container mx-auto px-4 mt-8">
      <h1 className="text-2xl font-bold mb-4">Danh sách bọc link</h1>
      <div className="w-full flex items-center mt-2 mb-2 gap-3">
      <div className="w-full flex-1 flex items-center mt-2 mb-2 gap-3">
          <Form
            name="time_related_controls"
            onFinish={onFinish}
            layout="inline"
          >
            <Form.Item name="txt-search-key" label="Email/Sđt">
              <Input
                allowClear
                prefix={<UserOutlined className="site-form-item-icon" />}
                placeholder="Email hoặc SĐT"
              />
            </Form.Item>
            <Form.Item name="range-time" label="Ngày">
              <RangePicker format="DD-MM-YYYY" />
            </Form.Item>
            <Form.Item
              wrapperCol={{
                xs: { span: 24, offset: 0 },
                sm: { span: 16, offset: 8 },
              }}
            >
              <Button type="primary" htmlType="submit" className="bg-blue-600">
                Tìm kiếm
              </Button>
            </Form.Item>
          </Form>
          <Button onClick={handleInput} type="primary" htmlType="button" className="bg-green-600 mx-2">
                Tạo mới
          </Button>
        </div>
      </div>
      <div>
      {/* <div className="table-responsive"> */}
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="py-2 px-4 bg-gray-200">URL bọc</th>
            <th className="py-2 px-4 bg-gray-200">Lượt truy cập</th>
            <th className="py-2 px-4 bg-gray-200">Ghi chú</th>
            <th className="py-2 px-4 bg-gray-200">Thời gian tạo</th>
            <th className="py-2 px-4 bg-gray-200" style={{ minWidth: '500px' }}>
            Hành động
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.userID}>
              <td className="py-2 px-4 border border-gray-300">{window.location.protocol +'//'+ window.location.host +'/?id='+ user.userID}</td>
              <td className="py-2 px-4 border border-gray-300">{user.counter}</td>
              <td className="py-2 px-4 border border-gray-300">{user.note}</td>
              <td className="py-2 px-4 border border-gray-300">
                {moment(new Date(user.createdAt)).format("yyyy-MM-DD HH:mm:ss")}
              </td>
              <td className="py-2 px-4 border border-gray-300 flex flex-wrap gap-3">
                <button
                  style={{height:"50%"}}
                  className="w-[100px] btn btn-sm mb-2 btn-danger"
                  onClick={() => handleDelete(user.userID)}
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      <div className="mt-4 flex space-x-2 justify-center">
        <Pagination
          showQuickJumper
          current={currentPage}
          pageSize={pageSize}
          defaultCurrent={1}
          total={totalRecord}
          onChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default AdminPage;
