document.addEventListener('DOMContentLoaded', () => {
    const supabaseUrl = 'https://vmbswwyglyleazfngger.supabase.co';
    const supabaseKey = 'sb_publishable_0obXWjSNjKrH_PWDt3_U0w_O2oH96Ki';
    
    let _supabase = null;
    if (typeof supabase !== 'undefined') {
        _supabase = supabase.createClient(supabaseUrl, supabaseKey);
    }

    const projectsGrid = document.getElementById('projects-grid');
    const categoryBtns = document.querySelectorAll('section.sticky button');
    let allProjects = [];

    // Fallback data from Company Profile
    const fallbackProjects = [
        { title: '6360 Bulk Head Rehabilitation', description: 'Major rehabilitation works for bulk head and common chute at Mopani Copper Mines.', category: 'Mining', location: 'Mufulira', country: 'Zambia', year: 2024, image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800' },
        { title: 'Acid Proofing Project', description: '5th Floor and columns acid proofing implementation for heavy industrial plant.', category: 'Industrial', location: 'Kitwe', country: 'Zambia', year: 2023, image: 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?w=800' },
        { title: '7 Shaft Walkway Construction', description: 'Construction of walkway between 7 Shaft and Pelleteron Shaft.', category: 'Infrastructure', location: 'Kitwe', country: 'Zambia', year: 2023, image: 'https://images.unsplash.com/photo-1510444558229-3733075c3f68?w=800' },
        { title: 'Wusa-Kile Hospital Rehabilitation', description: 'General refurbishment and rehabilitation works at the hospital for personnel.', category: 'Commercial', location: 'Kitwe', country: 'Zambia', year: 2024, image: 'https://images.unsplash.com/photo-1519494140681-8b17d830a3e9?w=800' },
        { title: '1380L Track Maintenance', description: '12-month contract for rehabilitation and maintenance of tracks on 1380L.', category: 'Mining', location: 'North Shaft', country: 'Zambia', year: 2024, image: 'https://images.unsplash.com/photo-1531834685032-c7446445339c?w=800' }
    ];

    async function loadProjects() {
        console.log('Loading Projects...');
        try {
            if (!_supabase) throw new Error('Supabase not loaded');
            const { data, error } = await _supabase.from('projects').select('*').order('year', { ascending: false });
            if (error) throw error;
            if (!data || data.length === 0) {
                console.warn('Supabase Projects empty, using fallback');
                allProjects = fallbackProjects;
            } else {
                allProjects = data;
            }
            renderProjects(allProjects);
        } catch (error) {
            console.warn('Projects loading issue:', error);
            allProjects = fallbackProjects;
            renderProjects(allProjects);
        }
    }

    function renderProjects(projects) {
        if (!projectsGrid) return;
        projectsGrid.innerHTML = '';

        if (projects.length === 0) {
            projectsGrid.innerHTML = '<div class="col-span-full text-center py-20 bg-white dark:bg-background-dark"><p class="text-slate-500 font-bold tracking-widest uppercase text-xs">No projects found.</p></div>';
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
                        <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-primary bg-primary/10 px-2 py-0.5">${project.category || 'Engineering'}</span>
                        <div class="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <span class="material-symbols-outlined text-xs">location_on</span>
                            <span>${project.country || project.location || 'SADC'}</span>
                        </div>
                    </div>
                    <h3 class="text-2xl font-bold uppercase tracking-tight mb-3 group-hover:text-primary transition-colors">${project.title}</h3>
                    <p class="text-sm text-slate-500 dark:text-slate-400 font-light mb-6 leading-relaxed">
                        ${project.description}
                    </p>
                    <div class="mt-auto flex items-center justify-between pt-6 border-t border-slate-50 dark:border-primary/5">
                        <span class="text-xs font-bold uppercase tracking-widest text-slate-400">Project Year: ${project.year || 'Current'}</span>
                        <button class="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">arrow_forward</button>
                    </div>
                </div>
            `;
            projectsGrid.appendChild(card);
        });

        const countDisplay = document.querySelector('.flex.items-center.gap-4.text-xs span:first-child');
        if (countDisplay) countDisplay.textContent = `Showing ${projects.length} Results`;
    }

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.textContent.trim();
            categoryBtns.forEach(b => {
                const isActive = b.textContent.trim() === category;
                b.className = isActive 
                    ? 'bg-primary text-white px-5 py-2 rounded-sm text-xs font-bold uppercase tracking-widest whitespace-nowrap'
                    : 'hover:bg-slate-100 dark:hover:bg-primary/10 px-5 py-2 rounded-sm text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 whitespace-nowrap';
            });
            const filtered = category === 'All Projects' ? allProjects : allProjects.filter(p => p.category === category);
            renderProjects(filtered);
        });
    });

    loadProjects();
});
