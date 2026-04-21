document.addEventListener('DOMContentLoaded', () => {
    // Initialize Supabase
    const supabaseUrl = 'https://vmbswwyglyleazfngger.supabase.co';
    const supabaseKey = 'sb_publishable_0obXWjSNjKrH_PWDt3_U0w_O2oH96Ki';
    
    let _supabase = null;
    if (typeof supabase !== 'undefined') {
        _supabase = supabase.createClient(supabaseUrl, supabaseKey);
    }

    const servicesGrid = document.getElementById('services-grid');
    const categoryBtns = document.querySelectorAll('.service-category-btn');
    let allServices = [];

    async function loadServices() {
        try {
            if (!_supabase) throw new Error('Supabase not loaded');

            const { data, error } = await _supabase
                .from('services')
                .select('*')
                .order('title', { ascending: true });

            if (error) throw error;
            
            allServices = data;
            renderServices(allServices);
        } catch (error) {
            console.error('Error loading services:', error);
            servicesGrid.innerHTML = `
                <div class="col-span-full text-center py-20">
                    <p class="text-primary font-bold">Failed to load services. Please check your database connection.</p>
                </div>
            `;
        }
    }

    function renderServices(services) {
        servicesGrid.innerHTML = '';

        if (services.length === 0) {
            servicesGrid.innerHTML = '<p class="col-span-full text-center py-20 text-slate-500">No services found in this category.</p>';
            return;
        }

        services.forEach(service => {
            const card = document.createElement('div');
            card.className = 'group bg-background-light dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col h-full hover:border-primary transition-colors';
            card.innerHTML = `
                <div class="h-64 overflow-hidden relative">
                    <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 grayscale group-hover:grayscale-0" src="${service.image || 'https://images.unsplash.com/photo-1581094794329-c8112c4e5190?w=800&q=80'}">
                    <div class="absolute top-4 right-4 bg-primary text-white p-2 rounded-sm">
                        <span class="material-symbols-outlined">${service.icon || 'engineering'}</span>
                    </div>
                </div>
                <div class="p-8 flex flex-col flex-1">
                    <h3 class="text-2xl font-bold mb-4">${service.title}</h3>
                    <p class="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                        ${service.description}
                    </p>
                    <div class="mt-auto">
                        <a href="contact.html" class="w-full flex items-center justify-between bg-primary text-white px-6 py-4 font-bold uppercase tracking-widest text-sm rounded hover:bg-primary/90 transition-all group/btn">
                            Request Quote
                            <span class="material-symbols-outlined group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                        </a>
                    </div>
                </div>
            `;
            servicesGrid.appendChild(card);
        });
    }

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            
            // Update UI
            categoryBtns.forEach(b => {
                const isActive = b.dataset.category === category;
                if (isActive) {
                    b.classList.add('bg-primary', 'text-white');
                    b.classList.remove('hover:bg-slate-100', 'dark:hover:bg-slate-800');
                } else {
                    b.classList.remove('bg-primary', 'text-white');
                    b.classList.add('hover:bg-slate-100', 'dark:hover:bg-slate-800');
                }
            });

            // Filter
            const filtered = category === 'all' 
                ? allServices 
                : allServices.filter(s => s.category === category);
            
            renderServices(filtered);
        });
    });

    loadServices();
});
