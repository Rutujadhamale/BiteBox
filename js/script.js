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

// function increaseQuantity(index) {
//     if (!cart[index]) return;

//     cart[index].quantity++;
//     saveCart();
//     renderCart();
//     updateOrderSummary();
// }
function increaseQuantity(index) {
    cart[index].quantity++;
    localStorage.setItem(
        "biteboxCart",
        JSON.stringify(cart)
    );
    renderCart();
    updateOrderSummary();
    updateCartCount();
}

// function decreaseQuantity(index) {
//     if (!cart[index]) return;

//     if (cart[index].quantity > 1) {
//         cart[index].quantity--;
//         saveCart();
//     }

//     renderCart();
//     updateCartCount();
//     updateOrderSummary();
// }
function decreaseQuantity(index) {
    if (cart[index].quantity > 1) {
        cart[index].quantity--;
        localStorage.setItem(
            "biteboxCart",
            JSON.stringify(cart)
        );
    }
    renderCart();
    updateOrderSummary();
    updateCartCount();
}

// function removeFromCart(index) {
//     if (index < 0 || index >= cart.length) return;

//     cart.splice(index, 1);
//     saveCart();
//     renderCart();
//     updateOrderSummary();
// }
function removeFromCart(index) {
  
    cart.splice(index, 1);
    localStorage.setItem("biteboxCart", JSON.stringify(cart));

    renderCart();
    updateOrderSummary();
    updateCartCount();

}


function clearCart() {
    cart = [];
    localStorage.removeItem("biteboxCart");
    renderCart();
    updateOrderSummary();
    updateCartCount();
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

let menuCards = document.querySelectorAll("#menu-items article");
 
let searchInput = document.getElementById("menu-search");

let searchButton = document.getElementById("search-button");

function searchMenu (searchText){
    let searchValue = searchText .trim().toLowerCase();

    menuCards.forEach(function(card){
        let foodName = card.querySelector("h3").textContent.trim().toLowerCase();

        if (foodName.includes(searchValue)){
            card.style.display = "";
        }else{
            card.style.display = "none";
        }
    });
}

if (searchButton) {
    searchButton.addEventListener(
        "click",
        function() {

            searchMenu(
                searchInput.value
            );
        }
    );

}

if (searchButton){
    searchButton.addEventListener(
        "click",function(){
            searchMenu(
                searchInput.value
            );
        }
    );
}

let categoryCards = document.querySelectorAll("#categories article");

function filterMenu(category) {
 
    menuCards.forEach(function(card) {
        let cardCategory = card.dataset.category.toLowerCase();
 
        if (cardCategory === category) {
            card.style.display = "";
        }
        else {
            card.style.display = "none";
        }
    });
 
}

categoryCards.forEach(
    function(card) {
 
        card.addEventListener("click",function() {
                let category = card.querySelector("h3")
                        .textContent
                        .trim()
                        .toLowerCase();
                filterMenu(category);
            }
        );
    }
)

let themeButton = document.getElementById("theme-toggle");
 
function toggleTheme(){
    document.body.classList.toggle("dark-theme");

    let themeIcon = themeButton.querySelector(".theme-icon");

    let themeText = themeButton.querySelector(".theme-text");

    if (document.body.classList.contains("dark-theme")){
        themeIcon.textContent = "☾";
        themeText.textContent = "Night Mode";
        localStorage.setItem("biteboxTheme","dark");
    }else{
        themeIcon.textContent = "☀";
        themeText.textContent ="DAY MODE";
        localStorage.setItem("biteboxTheme","light");
    }
}

function loadTheme(){
    let savedTheme = localStorage.getItem("biteTheme");

    /*Disable animation while loading*/
    document.body.classList.add("theme-loading");

    if (savedTheme === "dark"){
        document.body.classList.add("dark-theme");
    }else{
        document.body.classList.remove("dark-theme");
    }

    let themeIcon = themeButton.querySelector(".theme-icon");
    let themeText = themeButton.querySelector(".theme-text");

    if (savedTheme === "dark"){
       if(themeIcon){
        themeIcon.textContent = "☾";
       }
       if  (themeText){
        themeText.textContent = "NIGHT MODE";
       }
    }else{
        if (themeIcon){
            themeIcon.textContent = "☀";
        }
        if (themeText){
            themeText.textContent = "DAY MODE";
        }
    }
    /*Allow animation again*/
    setTimeout(function (){
        document.body.classList.remove("theme-loading");
    },50);
    
}

if (themeButton){
    themeButton.addEventListener("click",function (){
        toggleTheme();
    }
);
}
loadTheme();

function updateCartCount() {

    let cartCount = 0;

    cart.forEach(function (item) {
        cartCount += item.quantity;
    });

    let cartCountElement =
        document.getElementById("cart-count");

    if (cartCountElement) {
        cartCountElement.textContent = cartCount;
    }
}
updateCartCount();

let contactForm = document.querySelector(".right-column form");

function showToast(message, type) {
    let toast = document.createElement("div");
    toast.className = "toast " + type;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(function () {
        toast.classList.add("show");
    }, 100);

    setTimeout(function () {
        toast.classList.remove("show");

        setTimeout(function () {
            toast.remove();
        }, 300);

    }, 3000);
}

let name = contactForm.querySelector('input[name="name"]');
let email = contactForm.querySelector('input[name="email"]');
let phone = contactForm.querySelector('input[name="phone"]');
let subject = contactForm.querySelector('input[name="subject"]');
let message = contactForm.querySelector('textarea[name="message"]');

contactForm.addEventListener("submit", function (event) {
    event.preventDefault();
});

if (contactForm) {
    contactForm.addEventListener(
        "submit",
        function (event) {
            event.preventDefault();
            let name = contactForm.querySelector('input[name="name"]');
            let email = contactForm.querySelector('input[name="email"]');
            let phone = contactForm.querySelector('input[name="phone"]');

            let subject = contactForm.querySelector('input[name="subject"]');
            let message = contactForm.querySelector('textarea[name="message"]');

            if (!name.value.trim()) {
                showToast("⚠ Please enter your name.","error");
                return;
            }

            if (!email.value.trim()) {
                showToast("⚠ Please enter your email address.","error");
                return;
            }

            if (!email.validity.valid) {
                showToast("⚠ Please enter a valid email address.","error");
                return;
            }

            let phonePattern = /^[6-9]\d{9}$/;
            if (!phone.value.trim()) {
                showToast( "⚠ Please enter your phone number.","error");
                return;
            }

            if (!phonePattern.test(phone.value.trim())) {
                showToast("⚠ Please enter a valid 10-digit phone number.", 
                "error");
                return;
            }

 if (!subject.value.trim()) {
                showToast("⚠ Please enter a subject.","error");
                return;
            }
            if (!message.value.trim()) {
                showToast("⚠ Please enter your message.","error");
                return;
            }
            showToast("✓ Message sent successfully!","success");
            contactForm.reset();
        }
    );
}
