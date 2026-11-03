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

//---------FORM MANIPULATION----------------------

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

if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
        event.preventDefault();
        let name = contactForm.querySelector('input[name="name"]');
        let email = contactForm.querySelector('input[name="email"]');
        let phone = contactForm.querySelector('input[name="phone"]');
        let subject = contactForm.querySelector('input[name="subject"]');
        let message = contactForm.querySelector('textarea[name="message"]');
        if (!name.value.trim()) {
            showToast("Please enter your name..", "error");
            return;
        }
        if (!email.value.trim()) {
            showToast("Please enter your email address..", "email");
            return;
        }
        let phonePattern = /^[6-9]\d{9}$/;
        if (!phone.value.trim()) {
            showToast("⚠ Please enter your phone number.", "error");
            return;
        }

        if (!phonePattern.test(phone.value.trim())) {
            showToast("⚠ Please enter a valid 10-digit phone number.",
                "error");
            return;
        }
        if (!message.value.trim()) {
            showToast("Please enter your message..", "error");
            return;
        }
        showToast("Message sent successfully!", "success");
        contactForm.reset();
    });
}

// ===================== MENU FORM =====================

const addMenuBtn = document.getElementById("add-menu-btn");
const menuModal = document.getElementById("menu-modal");
const cancelMenuForm = document.getElementById("cancel-menu-form");


addMenuBtn.addEventListener("click", function () {
    menuModal.classList.add("show");
});

cancelMenuForm.addEventListener("click", function () {
    menuModal.classList.remove("show");
});


const menuForm = document.getElementById("menu-form");

menuForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const name = document.getElementById("menu-name").value;
    const price = document.getElementById("menu-price").value;
    const category = document.getElementById("menu-category").value;
    const rating = document.getElementById("menu-rating").value;
    const reviews = document.getElementById("menu-reviews").value;
    const image = document.getElementById("menu-image").value;

    const menuItem = {
        name: name,
        price: price,
        category: category,
        rating: rating,
        reviews: reviews,
        image: image
    };

    console.log(menuItem);

    const API_URL = "https://6ae4942228393034b08db984.mockapi.io/menu";
    	
const card = button.closest("article");

   try{
    const response = await fetch(API_URL, {
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify(menuItem)
    });
    const data = await response.json();
    console.log("Menu item added:",data);
    displayMenuItems([data]);
     menuModal.classList.remove("show");
        menuForm.reset();
   }catch(error){
    console.error("Error adding menu item:",error);
   }
   displayMenuItems([menuItem]);
});

async function fetchMenuItems(){
    try{
        const response = await fetch(API_URL);
        const menuItems = await response.json();
        console.log("Menu items fetched:", menuItems);
    }catch(error){
        console.log("Error fetching menu items:", error);
    }
}
    
    function displayMenuItems(menuItems) {
    const menuContainer = document.getElementById("menu-container");
    menuItems.forEach(menuItem => {
        const card = document.createElement("article");
        card.dataset.category = menuItem.category;
        card.classList.add("api-menu-card");
        card.dataset.id = menuItem.id;
        card.innerHTML = `
            <img src="${menuItem.image}" alt="${menuItem.name}">
            <h3>${menuItem.name}</h3>
            <p class="rating">${menuItem.rating} 
            <small>(${menuItem.reviews})</small>
            </p>
            <p class="price">₹${menuItem.price}</p>
         <div class="menu-actions">
          <button type="button" class="update-menu-btn">
            <img src="assest/icon/edit.jpg">
          </button>
                   <button type="button" class="delete-menu-btn">
             <img src="assest/icon/delete.jpg">
          </button>
        </div>

            <button>
                <img src="assest/icon/cart.jpg" alt="Cart" 
                width="14" height="14">
                Add to Cart
            </button>
        `;
        menuContainer.appendChild(card);
    });
}

document.getElementById("menu-container").addEventListener("click", function (event) {
    if (event.target.closest(".update-menu-btn")) {
        const button = event.target.closest(".update-menu-btn");
        const card = button.closest("article");
        const menuId = card.dataset.id;
        updateMenuId = menuId;

        console.log("Menu ID:", menuId);
        
        const menuName = card.querySelector("h3").textContent;
        const price = card.querySelector(".price").textContent.replace("₹", "").trim();
        const rating = card.querySelector(".rating").childNodes[0].textContent.trim();
        const reviews = card.querySelector(".rating small").textContent.replace("(", "")
        .replace(")", "").trim();
        const category = card.dataset.category;
        const image = card.querySelector("img").src;

        console.log("Update clicked for:", menuName);
        console.log("Price:", price);
        console.log("Category:", category);
        console.log("Rating:", rating);
        console.log("Reviews:", reviews);
        console.log("Image:", image);
    }
});

document.getElementById("menu-container").addEventListener("click", function (event) {

    if (event.target.closest(".update-menu-btn")) {

        const button = event.target.closest(".update-menu-btn");
        const card = button.closest("article");


        const menuName = card.querySelector("h3").textContent;

        const price = card.querySelector(".price").textContent
            .replace("₹", "") .trim();

        const rating = card.querySelector(".rating").childNodes[0]
            .textContent.trim();

        const reviews = card.querySelector(".rating small").textContent
            .replace("(", "").replace(")", "").trim();

        const category = card.dataset.category;

        const image = card.querySelector("img").src;


        document.getElementById("menu-name").value = menuName;

        document.getElementById("menu-price").value = price;

        document.getElementById("menu-category").value = category;

        document.getElementById("menu-rating").value = rating;

        document.getElementById("menu-reviews").value = reviews;

        document.getElementById("menu-image").value = image;


        document.querySelector(".modal-header h2").textContent = "Update Menu Item";

        document.querySelector("#menu-form button[type='submit']").textContent =
            "Update Menu Item";

        menuModal.classList.add("show");

    }

});

       