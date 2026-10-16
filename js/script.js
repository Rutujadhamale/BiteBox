function calculateItemTotal(price, quantity) {
    return price * quantity;
}

function loadCart() {
    try {
        return JSON.parse(localStorage.getItem("biteboxCart")) || [];
    } catch (error) {
        return [];
    }
}

let cart = loadCart();

function saveCart() {
    localStorage.setItem("biteboxCart", JSON.stringify(cart));
}

function calculateSubtotal() {
    return cart.reduce(function (subtotal, item) {
        return subtotal + calculateItemTotal(item.price, item.quantity);
    }, 0);
}

function calculateDeliveryCharge(subtotal) {
    if (subtotal === 0) {
        return 0;
    } else if (subtotal <= 499) {
        return 40;
    } else if (subtotal <= 999) {
        return 30;
    }

    return 0;
}

function calculatePackagingCharge(subtotal) {
    return subtotal === 0 ? 0 : 20;
}

function calculateDiscount(subtotal) {
    if (subtotal >= 1000) {
        return subtotal * 0.25;
    } else if (subtotal > 799) {
        return subtotal * 0.15;
    } else if (subtotal > 599) {
        return subtotal * 0.10;
    }

    return 0;
}

function calculateTotal(subtotal, deliveryCharge, packagingCharge, discount) {
    return subtotal + deliveryCharge + packagingCharge - discount;
}

function updateOrderSummary() {
    const subtotalElement = document.getElementById("subtotal-amount");

    // The menu page does not have an order summary.
    if (!subtotalElement) {
        return;
    }

    const subtotal = calculateSubtotal();
    const deliveryCharge = calculateDeliveryCharge(subtotal);
    const packagingCharge = calculatePackagingCharge(subtotal);
    const discount = calculateDiscount(subtotal);
    const total = calculateTotal(
        subtotal,
        deliveryCharge,
        packagingCharge,
        discount
    );

    document.getElementById("subtotal-amount").textContent =
        `₹${subtotal.toFixed(2)}`;
    document.getElementById("delivery-amount").textContent =
        `₹${deliveryCharge.toFixed(2)}`;
    document.getElementById("packaging-amount").textContent =
        `₹${packagingCharge.toFixed(2)}`;
    document.getElementById("discount-amount").textContent =
        `₹${discount.toFixed(2)}`;
    document.getElementById("total-amount").textContent =
        `₹${total.toFixed(2)}`;
}

function renderCart() {
    const cartBody = document.querySelector("#shopping-cart tbody");

    // The menu page does not have a cart table.
    if (!cartBody) {
        return;
    }

    cartBody.innerHTML = "";

    if (cart.length === 0) {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td colspan="5">
                <div class="empty-cart">
                    <h3>Your Cart is Empty</h3>
                    <p>Add some delicious food from our Menu!</p>
                </div>
            </td>
        `;
        cartBody.appendChild(row);
        return;
    }

    cart.forEach(function (item, index) {
        const itemTotal = calculateItemTotal(item.price, item.quantity);
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div><h3>${item.name}</h3></div>
                </div>
            </td>
            <td>₹${Number(item.price).toFixed(2)}</td>
            <td>
                <div class="quantity-box">
                    <button type="button" class="decrease" data-index="${index}">−</button>
                    <span>${item.quantity}</span>
                    <button type="button" class="increase" data-index="${index}">+</button>
                </div>
            </td>
            <td>₹${itemTotal.toFixed(2)}</td>
            <td>
                <a href="#" class="remove-item" data-index="${index}">
                    <img src="assest/icon/delete.jpg" alt="Remove ${item.name}" width="25">
                </a>
            </td>
        `;

        cartBody.appendChild(row);
    });
}

function addToCart(card) {
    cart = loadCart();
    const name = card.querySelector("h3")?.textContent.trim();
    const priceText = card.querySelector(".price")?.textContent || "";
    const price = parseFloat(priceText.replace(/[^\d.]/g, ""));
    const image = card.querySelector("img")?.getAttribute("src");

    if (!name || !Number.isFinite(price) || !image) {
        return;
    }

    const existingItem = cart.find(function (item) {
        return item.name === name;
    });

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            name: name,
            price: price,
            image: image,
            quantity: 1
        });
    }

    saveCart();
}

const menuContainer = document.getElementById("menu-items");

if (menuContainer) {
    menuContainer.addEventListener("click", function (event) {
        const button = event.target.closest("button");

        if (!button || !button.textContent.includes("Add to Cart")) {
            return;
        }

        const card = button.closest("article");

        if (card) {
            addToCart(card);
        }
    });
}

function increaseQuantity(index) {
    if (!cart[index]) return;

    cart[index].quantity++;
    saveCart();
    renderCart();
    updateOrderSummary();
}

function decreaseQuantity(index) {
    if (!cart[index]) return;

    if (cart[index].quantity > 1) {
        cart[index].quantity--;
        saveCart();
    }

    renderCart();
    updateOrderSummary();
}

function removeFromCart(index) {
    if (index < 0 || index >= cart.length) return;

    cart.splice(index, 1);
    saveCart();
    renderCart();
    updateOrderSummary();
}

function clearCart() {
    cart = [];
    localStorage.removeItem("biteboxCart");
    renderCart();
    updateOrderSummary();
}

const cartBody = document.querySelector("#shopping-cart tbody");

if (cartBody) {
    cartBody.addEventListener("click", function (event) {
        const button = event.target.closest("button");

        if (button) {
            const index = Number(button.dataset.index);

            if (button.classList.contains("increase")) {
                increaseQuantity(index);
            } else if (button.classList.contains("decrease")) {
                decreaseQuantity(index);
            }

            return;
        }

        const removeLink = event.target.closest("a.remove-item");

        if (removeLink) {
            event.preventDefault();
            removeFromCart(Number(removeLink.dataset.index));
        }
    });
}

const clearCartButton = document.querySelector("#cart-actions button");

if (clearCartButton) {
    clearCartButton.addEventListener("click", clearCart);
}

renderCart();
updateOrderSummary();