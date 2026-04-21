document.addEventListener('DOMContentLoaded', () => {
    // Initialize Supabase inside the listener to ensure the library is loaded
    const supabaseUrl = 'https://vmbswwyglyleazfngger.supabase.co';
    const supabaseKey = 'sb_publishable_0obXWjSNjKrH_PWDt3_U0w_O2oH96Ki';
    
    let _supabase = null;
    if (typeof supabase !== 'undefined') {
        _supabase = supabase.createClient(supabaseUrl, supabaseKey);
    }

    let allProducts = [];
    const productGrid = document.getElementById('product-grid');
    const categoryTotalsDisplay = {
        'all': document.querySelector('[data-category="all"] .text-\\[10px\\]'),
        'Mining Equipment': document.querySelector('[data-category="Mining Equipment"] .text-\\[10px\\]'),
        'Electrical & Mechanical': document.querySelector('[data-category="Electrical & Mechanical"] .text-\\[10px\\]'),
        'Conveying & Material Handling': document.querySelector('[data-category="Conveying & Material Handling"] .text-\\[10px\\]'),
        'Chemicals': document.querySelector('[data-category="Chemicals"] .text-\\[10px\\]'),
        'Packaging & Consumables': document.querySelector('[data-category="Packaging & Consumables"] .text-\\[10px\\]')
    };

    // Fetch products from Supabase
    async function loadProducts() {
        try {
            if (!_supabase) throw new Error('Supabase library not loaded');

            const { data, error } = await _supabase
                .from('products')
                .select('*');

            if (error) throw error;
            
            allProducts = data;
            renderProducts(allProducts);
            updateCategoryCounts();
        } catch (error) {
            console.warn('Supabase Error, falling back to local data:', error);
            // Fallback to local JSON
            try {
                const response = await fetch('products.json');
                if (!response.ok) throw new Error('Local JSON not found');
                allProducts = await response.json();
                renderProducts(allProducts);
                updateCategoryCounts();
            } catch (jsonError) {
                console.error('Final fallback failed:', jsonError);
                productGrid.innerHTML = '<p class="col-span-full text-center py-10 font-bold text-primary">Failed to load products. Please check your connection.</p>';
            }
        }
    }

    function renderProducts(products) {
        productGrid.innerHTML = '';
        
        if (products.length === 0) {
            productGrid.innerHTML = '<p class="col-span-full text-center py-10 text-slate-500">No products found in this category.</p>';
            return;
        }

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card group bg-white dark:bg-background-dark/40 border border-slate-200 dark:border-slate-800 rounded overflow-hidden hover:border-primary transition-all flex flex-col';
            card.dataset.category = product.category;
            
            card.innerHTML = `
                <div class="relative h-64 overflow-hidden bg-slate-100 dark:bg-slate-900">
                    ${product.newArrival ? '<div class="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold px-2 py-1 tracking-widest uppercase z-10">New Arrival</div>' : ''}
                    <div class="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                        style="background-image: url('${product.image}')"></div>
                </div>
                <div class="p-5 flex flex-col flex-1">
                    <span class="text-[10px] font-bold text-primary dark:text-primary uppercase tracking-widest mb-1">${product.category}</span>
                    <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-tight">${product.name}</h3>
                    <p class="text-sm text-slate-500 mb-4 line-clamp-2">${product.description}</p>
                    <div class="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span class="text-xs font-mono text-slate-400">SKU: ${product.sku}</span>
                        <button class="bg-primary text-white px-4 py-2 text-xs font-bold rounded hover:bg-primary/90 transition-all flex items-center gap-2">
                            QUOTE <span class="material-symbols-outlined text-sm">add_shopping_cart</span>
                        </button>
                    </div>
                </div>
            `;
            productGrid.appendChild(card);
        });

        // Update results display
        document.getElementById('results-range').textContent = `1-${products.length}`;
        document.getElementById('results-total').textContent = products.length;
    }

    function updateCategoryCounts() {
        const counts = {
            'all': allProducts.length,
            'Mining Equipment': allProducts.filter(p => p.category === 'Mining Equipment').length,
            'Electrical & Mechanical': allProducts.filter(p => p.category === 'Electrical & Mechanical').length,
            'Conveying & Material Handling': allProducts.filter(p => p.category === 'Conveying & Material Handling').length,
            'Chemicals': allProducts.filter(p => p.category === 'Chemicals').length,
            'Packaging & Consumables': allProducts.filter(p => p.category === 'Packaging & Consumables').length
        };

        for (const [cat, count] of Object.entries(counts)) {
            if (categoryTotalsDisplay[cat]) {
                categoryTotalsDisplay[cat].textContent = count;
            }
        }
    }

    // Search and Sort
    const searchInput = document.getElementById('product-search');
    const sortSelect = document.getElementById('sort-products');
    const categoryBtns = document.querySelectorAll('.category-btn');
    const activeClasses = ['bg-primary', 'text-white'];
    const inactiveClasses = ['text-slate-600', 'dark:text-slate-400', 'hover:bg-slate-100', 'dark:hover:bg-slate-800'];

    function applyFilters() {
        const activeCategory = document.querySelector('.category-btn.bg-primary').dataset.category;
        const searchTerm = searchInput.value.toLowerCase();
        const sortBy = sortSelect.value;

        let filtered = allProducts;

        // Filter by category
        if (activeCategory !== 'all') {
            filtered = filtered.filter(p => p.category === activeCategory);
        }

        // Search
        if (searchTerm) {
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(searchTerm) || 
                p.description.toLowerCase().includes(searchTerm)
            );
        }

        // Sort
        if (sortBy === 'newest') {
            filtered.sort((a, b) => (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0));
        } else if (sortBy === 'name-asc') {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortBy === 'name-desc') {
            filtered.sort((a, b) => b.name.localeCompare(a.name));
        }

        renderProducts(filtered);
    }

    searchInput.addEventListener('input', applyFilters);
    sortSelect.addEventListener('change', applyFilters);

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            
            // Update button styles
            categoryBtns.forEach(b => {
                const isActive = b.dataset.category === category;
                if (isActive) {
                    b.classList.add(...activeClasses);
                    b.classList.remove(...inactiveClasses);
                } else {
                    b.classList.remove(...activeClasses);
                    b.classList.add(...inactiveClasses);
                }
            });

            applyFilters();
        });
    });

    loadProducts();
});
