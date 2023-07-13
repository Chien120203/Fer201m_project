import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { useCookies } from "react-cookie";
import Header from "./Header";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faDeleteLeft,
    faMinus,
    faPlus,
    faRecycle,
    faRemove,
    faTrash,
    faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
const Purchase = () => {
    const { ID, COLORID, TYPE } = useParams();
    const [cookies, setCookie] = useCookies(["productIds"]);
    const [productIds, setProductIds] = useState([]);
    const [listProduct, setListProduct] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [orderDetailId, setOrderDetailId] = useState(0);
    const [listColor, setListColor] = useState([]);
    const firstName = useRef(null);
    const lastName = useRef(null);
    const email = useRef(null);
    const phoneNumber = useRef(null);
    const address = useRef(null);
    const [purchaseMethods, setPurchaseMethods] = useState("Thanh toán khi nhận hàng");
    const navigate = useNavigate();
    useEffect(() => {
        setProductIds(cookies.productIds || []);
    }, [cookies.productIds]);
    const keys = Object.keys(productIds);
    useEffect(() => {
        fetch("http://localhost:9999/Product")
            .then((response) => response.json())
            .then((data) => {
                fetch("http://localhost:9999/Color")
                    .then((res) => res.json())
                    .then((dataColor) => {
                        let listPrCol = [];
                        if (TYPE == 1) {
                            let product = data.find((a) => {
                                return a.id == ID;
                            })
                            let color = dataColor.find((a) => {
                                return a.id == COLORID;
                            })
                            console.log(COLORID)
                            listPrCol.push({
                                ...product,
                                colorName: color.ColorName,
                                imageColor: color.Images[0],
                                quantity: 1,
                                colorID: color.id
                            })

                        }
                        else {
                            data.map((p) => {
                                dataColor.map((col) => {
                                    if (col.ProductId == p.id) {
                                        Object.entries(productIds).map((color) => {
                                            if (p.id == +color[0]) {
                                                Object.entries(color[1]).map((value) => {
                                                    if (col.id == +value[0]) {
                                                        listPrCol.push({
                                                            ...p,
                                                            colorName: col.ColorName,
                                                            imageColor: col.Images[0],
                                                            quantity: value[1],
                                                            colorID: +value[0],
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            });
                        }
                        let sum = 0;
                        for (let i = 0; i < listPrCol.length; i++) {
                            sum = sum + listPrCol[i].Price * (1 - listPrCol[i].SalePrice) * listPrCol[i].quantity
                        }
                        setTotalPrice(sum);
                        setListProduct(listPrCol);
                    });
            });
    }, [productIds]);
    useEffect(() => {
        fetch("http://localhost:9999/Color")
            .then((response) => response.json())
            .then((data) => {
                setListColor(data);
            });
    }, [])
    useEffect(() => {
        fetch("http://localhost:9999/OrderDetail")
            .then((response) => response.json())
            .then((data) => {
                setOrderDetailId(data.length + 1);
            });
    }, [])
    const getQuantity = (id, colId) => {
        let pro = listProduct.find((p) => p.colorID == colId);
        return pro.quantity;
    };
    const minusQuantity = (id, colId) => {
        let quantity = getQuantity(id, colId);
        if (quantity > 0) {
            updateProduct(id, colId, quantity - 1);
        }
    };
    const plusQuantity = (id, colId) => {
        let quantity = getQuantity(id, colId);
        if (quantity > 0) {
            updateProduct(id, colId, quantity + 1);
        }
    };
    const updateProduct = (id, colId, quantity) => {
        let pro = listProduct.find((p) => p.id == id && p.colorID == colId);
        const updatedListProductIds = { ...productIds };
        let colorId = pro.colorID;
        updatedListProductIds[id][colorId] = quantity;
        if(TYPE == 1){
            pro.quantity = quantity;
            setTotalPrice(pro.quantity*pro.Price * (1 - pro.SalePrice))
            setListProduct([pro]);
        }
        else{
            setProductIds(updatedListProductIds);
            setCookie("productIds", updatedListProductIds, { path: "/" });
        }
       
    };
    const deleteProduct = (id, colId) => {
            let pro = listProduct.find((p) => p.id == id && p.colorID == colId);
            const updatedListProductIds = { ...productIds };
            let colorId = pro.colorID;
            delete updatedListProductIds[id][colorId];
            setProductIds(updatedListProductIds);
            setCookie("productIds", updatedListProductIds, { path: "/" });
    };
    const handlePurchase = () => {
        if (listProduct.length === 0) {
            if (window.confirm("Bạn chưa chọn sản phẩm nào") == true) {
                navigate('/dien-thoai/all');
            }
        }
        if (firstName.current.value.trim() === '' || lastName.current.value.trim() === '' || phoneNumber.current.value.trim() === ''
            || address.current.value.trim() === '' || email.current.value.trim() === '') {
            alert('Vui lòng nhập đầy đủ thông tin.')
        }
        else {
            const user = JSON.parse(sessionStorage.getItem("user"));
            let userid = 0;
            if (user == null) userid = null; else userid = user.id;
            const newOrderDetail = {
                firstName: firstName.current.value.trim(),
                lastName: lastName.current.value.trim(),
                phone: phoneNumber.current.value.trim(),
                address: address.current.value.trim(),
                email: email.current.value.trim(),
                purchaseMethod: purchaseMethods,
                userId: userid,
                totalPrice: totalPrice,
                status: 1
            };
            fetch("http://localhost:9999/OrderDetail", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },

                body: JSON.stringify(newOrderDetail),
            })
                .then((response) => {
                    return response.json();
                })

            listProduct.map((product) => {
                const newOrder = {
                    product_id: product.id,
                    Quantity: product.quantity,
                    Price: (product.Price * (1 - product.SalePrice)) * product.quantity,
                    Color: product.colorName,
                    OrderDetailId: orderDetailId
                }
                fetch("http://localhost:9999/Order", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify(newOrder),
                })
                    .then((response) => {
                        return response.json();
                    })
                deleteProduct(product.id, product.colorID);
                const colorUpdate = listColor.find((a) => {
                    return a.id == product.colorID;
                })
                colorUpdate.Quantity = colorUpdate.Quantity - 1;
                fetch(`http://localhost:9999/Color/${colorUpdate.id}`, {
                    method: "PUT",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(colorUpdate)
                })
                    .then((data) => {
                        return data.json();
                    })
            })
            navigate('/dien-thoai/all')
        }
    }
    return (
        <div>
            {
                console.log(listProduct)
            }
            <Header />
            <Container style={{ marginTop: "100px" }}>
                <Row>
                    <Col md={7}>
                        <Row>
                            <Col md={12}>
                                <h3>THÔNG TIN NGƯỜI MUA</h3>
                            </Col>
                        </Row>
                        <Form>
                            <Row>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Họ</Form.Label>
                                        <Form.Control type="text" ref={firstName} />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Tên</Form.Label>
                                        <Form.Control type="text" ref={lastName} />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Form.Group>
                                <Form.Label>Email</Form.Label>
                                <Form.Control type="email" ref={email} />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Số điện thoại</Form.Label>
                                <Form.Control type="number" ref={phoneNumber} />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Địa chỉ</Form.Label>
                                <Form.Control type="text" ref={address} />
                            </Form.Group>
                        </Form>
                        <Row style={{ marginTop: "50px" }}>
                            <Col md={12}>
                                <h3>PHƯƠNG THỨC THANH TOÁN</h3>
                            </Col>
                        </Row>
                        <Form>
                            <div>
                                <input type="radio" id="pt1" name="purchasemethod" defaultChecked="true" value="Thanh toán khi nhận hàng" onClick={(e) => {
                                    setPurchaseMethods(e.target.value);
                                }} />
                                <label for="pt1" style={{ marginLeft: "20px" }}>Thanh toán khi nhận hàng</label>
                            </div>
                            <div>
                                <input type="radio" id="pt2" name="purchasemethod" value="Thanh toán bằng ZaloPay" onClick={(e) => {
                                    setPurchaseMethods(e.target.value);
                                }} />
                                <label for="pt2" style={{ marginLeft: "20px" }}>Thanh toán bằng ZaloPay</label>
                            </div>
                            <div>
                                <input type="radio" id="pt3" name="purchasemethod" value="Thanh toán bằng Momo" onClick={(e) => {
                                    setPurchaseMethods(e.target.value);
                                }} />
                                <label for="pt3" style={{ marginLeft: "20px" }}>Thanh toán bằng Momo</label>
                            </div>
                        </Form>
                    </Col>
                    <Col md={5} style={{ borderLeft: "1px solid black" }}>
                        <Row>
                            <Col md={12}>
                                <h3>Đơn hàng</h3>
                            </Col>
                        </Row>
                        <Row>
                            {
                                listProduct.map((l) => {
                                    return (
                                        <Col md={12}>
                                            <Row>
                                                <Col md={9}>
                                                    <h6 style={{ marginTop: "10px" }}>Tên: {l.Name}</h6>
                                                </Col>
                                                <Col md={3}>
                                                    <button
                                                        className="btn-delete"
                                                        onClick={() => deleteProduct(l.id, l.colorID)}
                                                    >
                                                        <FontAwesomeIcon icon={faTrashAlt} />
                                                        Xoá
                                                    </button>
                                                </Col>
                                            </Row>

                                            <Row>
                                                <Col md={6}>
                                                    <p style={{ marginBottom: "5px" }}>Giá: {new Intl.NumberFormat("vi-VN", {
                                                        style: "currency",
                                                        currency: "VND",
                                                    }).format(((l.Price * (1 - l.SalePrice)) * l.quantity))}</p>
                                                </Col>
                                                <Col md={6} style={{ textAlign: "right" }}>
                                                    <p>Số lượng:
                                                        <button
                                                            className="btn-minus"
                                                            onClick={() => minusQuantity(l.id, l.colorID)}
                                                            disabled={l.quantity == 1}
                                                        >
                                                            <FontAwesomeIcon icon={faMinus} />
                                                        </button>
                                                        <input
                                                            type="text"
                                                            value={l.quantity}
                                                            style={{
                                                                border: "1px solid #e1e4e6",
                                                                width: "13%",
                                                                height: "100%",
                                                            }}
                                                            className="text-center"
                                                            readOnly
                                                        />
                                                        <button
                                                            className="btn-plus"
                                                            onClick={() => plusQuantity(l.id, l.colorID)}
                                                            disabled={l.quantity == 4}
                                                        >
                                                            <FontAwesomeIcon icon={faPlus} />
                                                        </button></p>
                                                </Col>
                                                <Col md={6}>
                                                    <p>Màu sắc: {l.colorName}</p>
                                                </Col>
                                            </Row>
                                        </Col>
                                    )
                                })
                            }
                        </Row>
                        <Container>
                            <Row>
                                <Col md={12} style={{ borderBottom: "1px solid black" }}>
                                </Col>
                            </Row>
                        </Container>
                        <Row>
                            <Col style={{ marginTop: "20px" }}>
                                <h4>Tổng Cộng: {new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                }).format((totalPrice))}</h4>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={12} style={{ textAlign: "center", marginTop: "30px" }}>
                                <button style={{ width: "98%", backgroundColor: "#cb1c22", height: "70px", border: "0", borderRadius: "5px" }}
                                    onClick={() => handlePurchase()}>
                                    <h4 style={{ color: "white" }}>Hoàn tất thanh toán</h4>
                                </button>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}
export default Purchase;