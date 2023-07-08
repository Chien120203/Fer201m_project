import "./App.css";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import ListProduct from "./components/Client/ListProduct";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import Home from "./components/Client/Home/Home";
import Login from "./components/common/Login/Login";
import Signup from "./components/common/Register/Register";
import ProductDetail from "./components/Client/ProductDetail";
import ShoppingCard from "./components/Client/ShoppingCard";
import Logout from "./components/common/Logout/Logout";
import Purchase from "./components/Client/Purchase";
import Search from "./components/Client/Search";
import DashBoard from "./components/admin/DashBoard";
import AdminListProduct from "./components/admin/AdminListProduct";
import EditProduct from "./components/admin/EditProduct";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dien-thoai" element={<ListProduct />}></Route>
        <Route path="/dien-thoai/:catId" element={<ListProduct />}></Route>
        <Route
          path="/dien-thoai/product-detail/:ID"
          element={<ProductDetail />}
        />
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/shoppingcard" element={<ShoppingCard />} />
        <Route path="/tim-kiem/:searchname" element={<Search />} />
        <Route path="/tim-kiem" element={<Search />} />
        <Route
          path="dien-thoai/purchase/:ID/:TYPE"
          element={<Purchase />}
        />
        <Route
          path="/dien-thoai/purchase/:TYPE"
          element={<Purchase />}
        />
        <Route
          path="/chi-tiet-san-pham/:ProductID"
          element={<EditProduct />}
        />
        <Route path="/logout" element={<Logout />} />
        <Route path="/dashboard" element={<DashBoard/>} />
        <Route path="/productmanagement" element={<AdminListProduct/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
