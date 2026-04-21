document.addEventListener('DOMContentLoaded', () => {
    // Initialize Supabase
    const supabaseUrl = 'https://vmbswwyglyleazfngger.supabase.co';
    const supabaseKey = 'sb_publishable_0obXWjSNjKrH_PWDt3_U0w_O2oH96Ki';
    
    let _supabase = null;
    if (typeof supabase !== 'undefined') {
        _supabase = supabase.createClient(supabaseUrl, supabaseKey);
    }

    const projectsGrid = document.getElementById('projects-grid');
    const categoryBtns = document.querySelectorAll('section.sticky button');
    let allProjects = [];

    async function loadProjects() {
        try {
            if (!_supabase) throw new Error('Supabase not loaded');

            const { data, error } = await _supabase
                .from('projects')
                .select('*')
                .order('year', { ascending: false });

            if (error) throw error;
            
            allProjects = data;
            renderProjects(allProjects);
        } catch (error) {
            console.error('Error loading projects:', error);
            projectsGrid.innerHTML = `
                <div class="col-span-full text-center py-20 bg-white dark:bg-background-dark">
                    <p class="text-primary font-bold">Failed to load projects. Please check your database connection.</p>
                </div>
            `;
        }
    }

    function renderProjects(projects) {
        projectsGrid.innerHTML = '';

        if (projects.length === 0) {
            projectsGrid.innerHTML = `
                <div class="col-span-full text-center py-20 bg-white dark:bg-background-dark">
                    <p class="text-slate-500 font-bold tracking-widest uppercase text-xs">No projects found in this category.</p>
                </div>
            `;
            return;
        }

        projects.forEach(project => {
            const card = document.createElement('div');
            card.className = 'group relative bg-white dark:bg-background-dark overflow-hidden flex flex-col';
            card.innerHTML = `
                <div class="aspect-[4/3] overflow-hidden">
                    <img class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="${project.image || 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?w=800&q=80'}">
                </div>
                <div class="p-8 flex flex-col flex-grow border-t border-slate-100 dark:border-primary/5">
                    <div class="flex items-center justify-between mb-4">
                        <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-primary bg-primary/10 px-2 py-0.5">${project.category}</span>
                        <div class="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <span class="material-symbols-outlined text-xs">location_on</span>
                            <span>${project.country || project.location}</span>
                        </div>
                    </div>
                    <h3 class="text-2xl font-bold uppercase tracking-tight mb-3 group-hover:text-primary transition-colors">${project.title}</h3>
                    <p class="text-sm text-slate-500 dark:text-slate-400 font-light mb-6 leading-relaxed">
                        ${project.description}
                    </p>
                    <div class="mt-auto flex items-center justify-between pt-6 border-t border-slate-50 dark:border-primary/5">
                        <span class="text-xs font-bold uppercase tracking-widest text-slate-400">Project Year: ${project.year}</span>
                        <button class="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">arrow_forward</button>
                    </div>
                </div>
            `;
            projectsGrid.appendChild(card);
        });

        // Update count display
        const countDisplay = document.querySelector('.flex.items-center.gap-4.text-xs span:first-child');
        if (countDisplay) {
            countDisplay.textContent = `Showing ${projects.length} Results`;
        }
    }

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.textContent.trim();
            
            // Update UI
            categoryBtns.forEach(b => {
                const isActive = b.textContent.trim() === category;
                if (isActive) {
                    b.className = 'bg-primary text-white px-5 py-2 rounded-sm text-xs font-bold uppercase tracking-widest whitespace-nowrap';
                } else {
                    b.className = 'hover:bg-slate-100 dark:hover:bg-primary/10 px-5 py-2 rounded-sm text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 whitespace-nowrap';
                }
            });

            // Filter
            const filtered = category === 'All Projects' 
                ? allProjects 
                : allProjects.filter(p => p.category === category);
            
            renderProjects(filtered);
        });
    });

    loadProjects();
});
