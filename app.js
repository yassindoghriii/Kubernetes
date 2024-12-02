const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Configuration pour les requêtes JSON
app.use(bodyParser.json());

// Connexion à la base de données MySQL
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'mysql_db',  // Utilisation de l'environnement Kubernetes
    user: 'root',
    password: 'password',
    database: 'stockdb',
    port: 3306
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connecté à la base de données MySQL');
});

// Route pour la page principale
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Gestion de Stock</title>
            <style>
                body { font-family: Arial, sans-serif; background-color: #f0f0f0; text-align: center; }
                h1 { color: #00ffcc; font-size: 2em; margin-top: 20px; }
                p { font-size: 1.2em; color: #333; margin-bottom: 30px; }
                #product-form input { margin: 5px; padding: 10px; }
                #product-form button { padding: 10px 20px; background-color: #00cc66; color: white; border: none; cursor: pointer; }
                table { width: 80%; margin: 20px auto; border-collapse: collapse; }
                table, th, td { border: 1px solid #ddd; }
                th, td { padding: 12px; text-align: left; }
                th { background-color: #f4f4f4; }
                tr:hover { background-color: #f1f1f1; }
                button { padding: 5px 10px; cursor: pointer; }
                .modify-btn { background-color: #ffcc00; }
                .delete-btn { background-color: #ff3333; color: white; }
            </style>
        </head>
        <body>
            <h1>Bienvenue dans l'application de gestion de stock</h1>
            <p>Gérez efficacement vos produits en les ajoutant, modifiant, ou supprimant facilement.</p>
            
            <div id="product-form">
                <input type="text" id="name" placeholder="Nom du produit">
                <input type="number" id="quantity" placeholder="Quantité">
                <input type="number" step="0.01" id="price" placeholder="Prix">
                <button onclick="addProduct()">Ajouter</button>
            </div>

            <h2>Liste des Produits</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nom</th>
                        <th>Quantité</th>
                        <th>Prix</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="product-list"></tbody>
            </table>

            <script>
                async function fetchProducts() {
                    const response = await fetch('/products');
                    const products = await response.json();
                    const productList = document.getElementById('product-list');
                    productList.innerHTML = '';
                    products.forEach(product => {
                        const productRow = document.createElement('tr');
                        productRow.innerHTML = \`
                            <td>\${product.id}</td>
                            <td>\${product.name}</td>
                            <td>\${product.quantity}</td>
                            <td>\${product.price}</td>
                            <td>
                                <button class="modify-btn" onclick="editProduct(\${product.id})">Modifier</button>
                                <button class="delete-btn" onclick="deleteProduct(\${product.id})">Supprimer</button>
                            </td>
                        \`;
                        productList.appendChild(productRow);
                    });
                }

                async function addProduct() {
                    const name = document.getElementById('name').value;
                    const quantity = document.getElementById('quantity').value;
                    const price = document.getElementById('price').value;
                    await fetch('/products', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name, quantity, price })
                    });
                    fetchProducts();
                }

                async function editProduct(id) {
                    const name = prompt("Nouveau nom du produit:");
                    const quantity = prompt("Nouvelle quantité:");
                    const price = prompt("Nouveau prix:");

                    if (name && quantity && price) {
                        await fetch(\`/products/\${id}\`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name, quantity, price })
                        });
                        fetchProducts();
                    }
                }

                async function deleteProduct(id) {
                    if (confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
                        await fetch(\`/products/\${id}\`, { method: 'DELETE' });
                        fetchProducts();
                    }
                }

                fetchProducts();
            </script>
        </body>
        </html>
    `);
});

// Route pour obtenir tous les produits
app.get('/products', (req, res) => {
    db.query('SELECT * FROM products', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Route pour ajouter un nouveau produit
app.post('/products', (req, res) => {
    const { name, quantity, price } = req.body;
    db.query('INSERT INTO products (name, quantity, price) VALUES (?, ?, ?)', [name, quantity, price], (err, result) => {
        if (err) throw err;
        res.json({ id: result.insertId, name, quantity, price });
    });
});

// Route pour mettre à jour un produit
app.put('/products/:id', (req, res) => {
    const { id } = req.params;
    const { name, quantity, price } = req.body;
    db.query('UPDATE products SET name = ?, quantity = ?, price = ? WHERE id = ?', [name, quantity, price, id], (err) => {
        if (err) throw err;
        res.json({ message: 'Produit mis à jour avec succès' });
    });
});

// Route pour supprimer un produit
app.delete('/products/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM products WHERE id = ?', [id], (err) => {
        if (err) throw err;
        res.json({ message: 'Produit supprimé avec succès' });
    });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Serveur démarré sur http://0.0.0.0:${port}`);
});
