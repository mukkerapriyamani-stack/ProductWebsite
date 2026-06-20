let allProducts = [];

const mainView = document.getElementById("main-view");
const detailsView = document.getElementById("details-view");
const productsDiv = document.getElementById("products");
const searchInput = document.getElementById("searchInput");
const backBtn = document.getElementById("backBtn");
const detailContent = document.getElementById("product-detail-content");

// 1. Fetch data from inventory API
fetch("https://dummyjson.com/products")
    .then(response => {
        if (!response.ok) throw new Error("API Fetch error.");
        return response.json();
    })
    .then(data => {
        allProducts = data.products; 
        renderCategoryWise(allProducts);
    })
    .catch(error => {
        console.error(error);
        if (productsDiv) {
            productsDiv.innerHTML = `<p style="text-align:center; color:red; padding: 20px;">Failed to load products. Check network connection.</p>`;
        }
    });

// 2. Group products into individual category containers
function renderCategoryWise(productsToGroup) {
    if (!productsDiv) return;
    productsDiv.innerHTML = "";

    if (productsToGroup.length === 0) {
        productsDiv.innerHTML = `<p style="text-align: center; color: #777; padding: 20px;">No products match your search.</p>`;
        return;
    }

    const categoriesMap = {};

    productsToGroup.forEach(product => {
        const catKey = (typeof product.category === 'object' && product.category !== null) 
            ? product.category.name 
            : product.category || "Uncategorized";

        if (!categoriesMap[catKey]) {
            categoriesMap[catKey] = [];
        }
        categoriesMap[catKey].push(product);
    });

    for (const categoryName in categoriesMap) {
        const shelfElement = document.createElement("div");
        shelfElement.className = "category-shelf";

        shelfElement.innerHTML = `
            <h2 class="category-title">${categoryName}</h2>
            <div class="category-row" id="shelf-${categoryName.replace(/\s+/g, '-')}"></div>
        `;
        productsDiv.appendChild(shelfElement);

        const targetGrid = shelfElement.querySelector(".category-row");
        populateCards(categoriesMap[categoryName], targetGrid);
    }
}

// 3. Card Population Engine
function populateCards(productsList, targetContainer) {
    let productsHTML = "";
    productsList.forEach(product => {
        const productBrand = product.brand ? product.brand : "Generic";
        const productRating = product.rating ? product.rating : "0.0";

        productsHTML += `
            <div class="card" data-id="${product.id}">
                <img src="${product.thumbnail}" alt="${product.title}">
                <div class="card-content">
                    <div class="brand">${productBrand}</div>
                    <h3>${product.title}</h3>
                    <div class="rating">★ ${productRating}</div>
                    <div class="price">$${product.price}</div>
                </div>
            </div>
        `;
    });
    targetContainer.innerHTML = productsHTML;

    targetContainer.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', () => {
            const productId = card.getAttribute('data-id');
            showProductDetails(productId);
        });
    });
}

// 4. Render Product Details View Only
function showProductDetails(id) {
    const product = allProducts.find(p => p.id == id);
    if (!product) return;

    const productBrand = product.brand ? product.brand : "Generic";
    const productRating = product.rating ? product.rating : "0.0";

    detailContent.innerHTML = `
        <div class="detail-card">
            <img src="${product.images[0] || product.thumbnail}" alt="${product.title}">
            <div class="detail-info">
                <h2>${product.title}</h2>
                <div class="detail-price">$${product.price}</div>
                <p class="detail-desc">${product.description}</p>
                <div class="detail-meta-box">
                    <div class="detail-brand">Brand: <span>${productBrand}</span></div>
                    <div class="rating" style="font-size:1.05rem; margin-bottom: 0;">
                        ★ ${productRating} <span>(User Rating)</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    mainView.classList.add("hidden");
    detailsView.classList.remove("hidden");
    window.scrollTo(0, 0); 
}

// 5. Active search filter loop
function filterProducts() {
    if (!searchInput) return;
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    const filtered = allProducts.filter(product => {
        const titleMatch = product.title && product.title.toLowerCase().includes(searchTerm);
        const brandMatch = product.brand && product.brand.toLowerCase().includes(searchTerm);
        
        let categoryMatch = false;
        if (product.category) {
            if (typeof product.category === 'string') {
                categoryMatch = product.category.toLowerCase().includes(searchTerm);
            } else if (typeof product.category === 'object') {
                const catName = product.category.name ? product.category.name.toLowerCase() : "";
                const catSlug = product.category.slug ? product.category.slug.toLowerCase() : "";
                categoryMatch = catName.includes(searchTerm) || catSlug.includes(searchTerm);
            }
        }
        return titleMatch || brandMatch || categoryMatch;
    });

    renderCategoryWise(filtered);
}

// 6. Global Event Listeners
if (searchInput) {
    searchInput.addEventListener("input", filterProducts);
}

if (backBtn) {
    backBtn.addEventListener("click", () => {
        detailsView.classList.add("hidden");
        mainView.classList.remove("hidden");
    });
}