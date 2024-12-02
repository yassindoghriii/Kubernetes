// public/script.js
const apiUrl = 'http://localhost:3000/';

async function fetchProducts() {
    const response = await fetch(apiUrl);
    const products = await response.json();
    const productList = document.getElementById('product-list');
    productList.innerHTML = '';
    products.forEach(product => {
        productList.innerHTML += `
            <div>
                <p><strong>${product.name}</strong> - ${product.quantity} unités - $${product.price}</p>
                <button onclick="deleteProduct(${product.id})">Supprimer</button>
                <button onclick="updateProduct(${product.id})">Modifier</button>
            </div>
        `;
    });
}

async function addProduct() {
    const name = document.getElementById('name').value;
    const quantity = document.getElementById('quantity').value;
    const price = document.getElementById('price').value;

    await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, quantity, price })
    });
    fetchProducts();
}

async function deleteProduct(id) {
    await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });
    fetchProducts();
}

async function updateProduct(id) {
    const name = prompt("Nom du produit ?");
    const quantity = prompt("Quantité ?");
    const price = prompt("Prix ?");
    await fetch(`${apiUrl}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, quantity, price })
    });
    fetchProducts();
}

fetchProducts();
