// script.js
// Client-side interactions & Supabase integrations for Shoaib Mahin's portfolio

// Load saved theme on initial startup
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
} else {
    document.documentElement.setAttribute('data-theme', 'dark'); // Default dark mode
}

// =========================================================================
// SUPABASE CONFIGURATION
// =========================================================================
const supabaseUrl = 'https://fdtvqmhnaxdhjzmflkwi.supabase.co';
const supabaseKey = 'sb_publishable_p8pRdWn2jRHCPo-Bh4gJdQ_KW6VPWm8';

let supabaseClient = null;
if (typeof supabase !== 'undefined' && supabaseUrl !== 'YOUR_SUPABASE_URL') {
    supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize viewer or admin views based on DOM elements
    if (document.getElementById('newPasswordForm')) {
        initResetPasswordPage();
    } else if (document.getElementById('loginForm') || document.getElementById('dashboardSection')) {
        initAdminDashboard();
    } else {
        initPortfolioViewer();
    }
});

// =========================================================================
// PORTFOLIO VIEWER PAGE LOGIC (index.html)
// =========================================================================
function initPortfolioViewer() {
    // 1. Mobile Navigation Active Link & Scroll Spy
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.floating-nav .nav-pill .nav-link');

    function highlightNavigation() {
        let currentSectionId = '';
        const scrollPosition = window.scrollY;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (scrollPosition >= (sectionTop - 250)) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${currentSectionId}`) {
                item.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', highlightNavigation);
    highlightNavigation();

    // 2. Light / Dark Theme Toggle
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const htmlEl = document.documentElement;
            const currentTheme = htmlEl.getAttribute('data-theme') || 'dark';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            htmlEl.classList.add('theme-transitioning');
            htmlEl.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            setTimeout(() => {
                htmlEl.classList.remove('theme-transitioning');
            }, 450);
        });
    }

    // 3. Copy Email Action
    const copyEmailBtn = document.getElementById('copyEmailBtn');
    const emailDisplay = document.getElementById('emailDisplay');
    if (copyEmailBtn && emailDisplay) {
        copyEmailBtn.addEventListener('click', () => {
            const email = emailDisplay.textContent;
            navigator.clipboard.writeText(email).then(() => {
                const originalHTML = copyEmailBtn.innerHTML;
                copyEmailBtn.innerHTML = '<i data-lucide="check"></i> Copied!';
                lucide.createIcons();
                copyEmailBtn.style.backgroundColor = '#22c55e';
                copyEmailBtn.style.color = '#ffffff';
                copyEmailBtn.style.borderColor = '#22c55e';
                
                setTimeout(() => {
                    copyEmailBtn.innerHTML = originalHTML;
                    lucide.createIcons();
                    copyEmailBtn.style.backgroundColor = '';
                    copyEmailBtn.style.color = '';
                    copyEmailBtn.style.borderColor = '';
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        });
    }

    // 4. Static Contact Form Submission via Web3Forms
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');

    if (contactForm && formMessage) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            formMessage.style.display = 'none';
            formMessage.className = 'form-message';
            formMessage.textContent = 'Sending message...';
            formMessage.style.display = 'block';

            const formData = new FormData(contactForm);
            const accessKey = formData.get('access_key');
            
            if (accessKey === 'YOUR_ACCESS_KEY_HERE') {
                formMessage.className = 'form-message error';
                formMessage.textContent = 'Please configure your Web3Forms Access Key in index.html!';
                return;
            }

            const object = Object.fromEntries(formData);
            const json = JSON.stringify(object);

            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: json
            })
            .then(async (response) => {
                let res = await response.json();
                if (response.status === 200) {
                    formMessage.className = 'form-message success';
                    formMessage.textContent = 'Thank you! Your message has been sent successfully.';
                    contactForm.reset();
                } else {
                    formMessage.className = 'form-message error';
                    formMessage.textContent = res.message || 'Something went wrong. Please try again.';
                }
            })
            .catch(error => {
                console.error(error);
                formMessage.className = 'form-message error';
                formMessage.textContent = 'Server connection failed. Please check your internet connection.';
            });
        });
    }

    // Initialize Lucide Icons for static elements
    lucide.createIcons();

    // 5. Fetch and render data from Supabase (if configured)
    if (supabaseClient) {
        loadViewerData();
    } else {
        console.log("Supabase not configured. Using pre-loaded HTML content.");
    }
}

async function loadViewerData() {
    try {
        // Fetch Profile
        const { data: profile, error: pError } = await supabaseClient
            .from('profile')
            .select('*')
            .eq('id', 1)
            .single();

        if (profile && !pError) {
            document.title = `${profile.name} | CSE Student & Developer`;
            document.querySelector('.logo').innerHTML = `${profile.name.split(' ')[0]}<span>${profile.name.split(' ').slice(1).join(' ')}</span>`;
            
            // Hero section
            const heroBadge = document.querySelector('#home .hero-badge');
            if (heroBadge) {
                heroBadge.innerHTML = `<span class="status-dot"></span> ${profile.hero_tag || 'Available for new projects'}`;
            }
            document.querySelector('#home .hero-title').innerHTML = `Hi, I'm ${profile.name}.<br>${profile.title}.`;
            document.querySelector('#home .hero-desc').textContent = profile.hero_desc;
            
            // About section
            const aboutParagraphs = document.querySelectorAll('#about .about-info-text p');
            if (aboutParagraphs.length >= 2) {
                aboutParagraphs[0].innerHTML = profile.about_text_1;
                aboutParagraphs[1].innerHTML = profile.about_text_2;
            }
            
            // Education Card
            const eduCard = document.querySelector('#about .education-card');
            if (eduCard) {
                eduCard.querySelector('.year').textContent = profile.education_year;
                eduCard.querySelector('h3').textContent = profile.education_degree;
                eduCard.querySelector('.inst').textContent = profile.education_inst;
                eduCard.querySelector('p:last-child').textContent = profile.education_desc;
            }

            // Contact / Email Display
            const emailDisplay = document.getElementById('emailDisplay');
            const emailMailtoLink = document.getElementById('emailMailtoLink');
            if (emailDisplay && emailMailtoLink) {
                emailDisplay.textContent = profile.email;
                emailMailtoLink.href = `mailto:${profile.email}`;
            }
        }

        // Fetch Skills
        const { data: skills, error: sError } = await supabaseClient
            .from('skills')
            .select('*');

        if (skills && !sError) {
            renderViewerSkills(skills);
        }

        // Fetch Projects
        const { data: projects, error: prError } = await supabaseClient
            .from('projects')
            .select('*')
            .order('id', { ascending: true });

        if (projects && !prError) {
            renderViewerProjects(projects);
        }

    } catch (error) {
        console.error("Error loading Supabase data:", error);
    }
}

function renderViewerSkills(skills) {
    const bentoCardLanguages = document.querySelector('.card-uiux .card-bottom');
    const bentoCardWeb = document.querySelector('.card-programming .card-titles');
    const bentoCardTools = document.querySelector('.card-frontend .card-bottom');
    const bentoCardDesign = document.querySelector('.card-visual .card-bottom');
    const bentoCardSoft = document.querySelector('.card-version .card-bottom');
    
    const skillsMarquee = document.getElementById('skillsMarquee');
    
    if (skillsMarquee) {
        skillsMarquee.innerHTML = '';
        // Duplicate skills three times for infinite marquee scrolling effect
        const doubleSkills = [...skills, ...skills, ...skills];
        doubleSkills.forEach(skill => {
            let icon = 'code';
            if (skill.category === 'Languages') icon = 'terminal-square';
            else if (skill.category === 'Web Technologies') icon = 'code-2';
            else if (skill.category === 'Tools & Platforms') icon = 'git-branch';
            else if (skill.category === 'Soft Skills') icon = 'smile';
            
            const item = document.createElement('div');
            item.className = 'ticker-item';
            item.innerHTML = `<i data-lucide="${icon}"></i> ${skill.name}`;
            skillsMarquee.appendChild(item);
        });
    }

    const getTagsHTML = (catName, isFigmaOnly = null) => {
        let filtered = skills.filter(s => s.category === catName);
        if (isFigmaOnly === true) {
            filtered = filtered.filter(s => s.name.toLowerCase() === 'figma');
        } else if (isFigmaOnly === false) {
            filtered = filtered.filter(s => s.name.toLowerCase() !== 'figma');
        }
        let tags = '';
        filtered.forEach(s => {
            tags += `<span class="tag-badge">${s.name}</span>`;
        });
        return `<div class="card-tags">${tags}</div>`;
    };

    if (bentoCardLanguages) {
        bentoCardLanguages.innerHTML = `
            <h3>Languages</h3>
            ${getTagsHTML('Languages')}
        `;
    }
    if (bentoCardWeb) {
        bentoCardWeb.innerHTML = `
            <h3>Web Technologies</h3>
            ${getTagsHTML('Web Technologies')}
        `;
    }
    if (bentoCardTools) {
        bentoCardTools.innerHTML = `
            <h3>Tools & Platforms</h3>
            ${getTagsHTML('Tools & Platforms', false)}
        `;
    }
    if (bentoCardDesign) {
        bentoCardDesign.innerHTML = `
            <h3>Design Tools</h3>
            ${getTagsHTML('Tools & Platforms', true)}
        `;
    }
    if (bentoCardSoft) {
        bentoCardSoft.innerHTML = `
            <h3>Soft Skills</h3>
            ${getTagsHTML('Soft Skills')}
        `;
    }
    
    lucide.createIcons();
}

function renderViewerProjects(projects) {
    const projectsContainer = document.getElementById('projectsContainer');
    if (!projectsContainer) return;
    projectsContainer.innerHTML = '';

    const gradients = [
        'radial-gradient(circle, #4f46e5 0%, #312e81 100%)',
        'radial-gradient(circle, #3b82f6 0%, #1d4ed8 100%)',
        'radial-gradient(circle, #10b981 0%, #064e3b 100%)',
        'radial-gradient(circle, #ec4899 0%, #831843 100%)',
        'radial-gradient(circle, #8b5cf6 0%, #4c1d95 100%)',
        'radial-gradient(circle, #f59e0b 0%, #78350f 100%)'
    ];

    projects.forEach((project, idx) => {
        const item = document.createElement('a');
        item.href = project.github_url;
        item.target = '_blank';
        item.className = 'feature-item';

        let tagsHTML = '';
        project.tags.forEach(tag => {
            tagsHTML += `<span class="feature-tag">${tag.trim()}</span>`;
        });

        const gradient = gradients[idx % gradients.length];

        item.innerHTML = `
            <div class="feature-content-wrapper">
                <span class="feature-title">${project.title}</span>
                <p class="feature-description">${project.description}</p>
                <div class="feature-tags">
                    ${tagsHTML}
                </div>
            </div>
            <div class="feature-media">
                <div class="feature-media-item" style="background: ${gradient}; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: white;">
                    <i data-lucide="code-2" style="width: 48px; height: 48px; stroke-width: 1.5;"></i>
                </div>
            </div>
        `;
        projectsContainer.appendChild(item);
    });
    
    lucide.createIcons();
}

// =========================================================================
// ADMIN CONTROL PANEL LOGIC (admin.html)
// =========================================================================
let currentSession = null;

function initAdminDashboard() {
    const loginForm = document.getElementById('loginForm');
    const authSection = document.getElementById('authSection');
    const dashboardSection = document.getElementById('dashboardSection');
    const logoutBtn = document.getElementById('logoutBtn');

    if (!supabaseClient) {
        alert("Warning: Supabase credentials are not configured yet! Please update YOUR_SUPABASE_URL and YOUR_SUPABASE_ANON_KEY inside script.js.");
        return;
    }

    // Initialize Auth state listener
    supabaseClient.auth.onAuthStateChange((event, session) => {
        currentSession = session;
        if (session) {
            // Logged in
            authSection.style.display = 'none';
            dashboardSection.style.display = 'block';
            logoutBtn.style.display = 'block';
            loadAdminData();
        } else {
            // Logged out
            authSection.style.display = 'block';
            dashboardSection.style.display = 'none';
            logoutBtn.style.display = 'none';
        }
    });

    // Handle Login Submit
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const msg = document.getElementById('loginMessage');

            msg.style.display = 'none';

            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                msg.className = 'form-message error';
                msg.textContent = error.message;
                msg.style.display = 'block';
            } else {
                msg.className = 'form-message success';
                msg.textContent = 'Login successful!';
                msg.style.display = 'block';
            }
        });
    }

    // Handle Logout Click
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await supabaseClient.auth.signOut();
        });
    }

    // Toggle Forgot Password Form
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const backToLoginLink = document.getElementById('backToLoginLink');
    const resetEmailSection = document.getElementById('resetEmailSection');
    const resetEmailForm = document.getElementById('resetEmailForm');

    if (forgotPasswordLink && backToLoginLink && authSection && resetEmailSection) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            authSection.style.display = 'none';
            resetEmailSection.style.display = 'block';
        });

        backToLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            resetEmailSection.style.display = 'none';
            authSection.style.display = 'block';
        });
    }

    // Handle Reset Password Email Submit
    if (resetEmailForm) {
        resetEmailForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('reset_email').value;
            const msg = document.getElementById('resetEmailMessage');
            const submitBtn = document.getElementById('resetEmailSubmitBtn');
            const originalText = submitBtn.textContent;

            msg.style.display = 'none';
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';

            const { data, error } = await supabaseClient.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + window.location.pathname.replace('admin.html', 'reset-password.html')
            });

            if (error) {
                msg.className = 'form-message error';
                msg.textContent = error.message;
                msg.style.display = 'block';
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            } else {
                msg.className = 'form-message success';
                msg.textContent = 'A password reset link has been sent to your email. Please check your inbox!';
                msg.style.display = 'block';

                submitBtn.style.backgroundColor = '#22c55e'; // Green button state
                submitBtn.style.borderColor = '#22c55e';
                submitBtn.style.color = '#ffffff';
                submitBtn.textContent = 'Reset Link Sent!';

                resetEmailForm.reset();

                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.style.backgroundColor = '';
                    submitBtn.style.borderColor = '';
                    submitBtn.style.color = '';
                    submitBtn.textContent = originalText;
                }, 4000);
            }
        });
    }

    // Setup Tabs switching
    const tabs = document.querySelectorAll('.tab-btn');
    const panels = document.querySelectorAll('.panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));

            tab.classList.add('active');
            const target = tab.getAttribute('data-target');
            document.getElementById(target).classList.add('active');
        });
    });

    // Handle Forms Submission in Admin Dashboard
    setupAdminForms();
}

async function loadAdminData() {
    try {
        // 1. Load Profile
        const { data: profile } = await supabaseClient.from('profile').select('*').eq('id', 1).single();
        if (profile) {
            document.getElementById('prof_name').value = profile.name;
            document.getElementById('prof_title').value = profile.title;
            document.getElementById('prof_tag').value = profile.hero_tag;
            document.getElementById('prof_email').value = profile.email;
            document.getElementById('prof_hero_desc').value = profile.hero_desc;
            document.getElementById('prof_about_1').value = profile.about_text_1;
            document.getElementById('prof_about_2').value = profile.about_text_2;
            document.getElementById('prof_edu_year').value = profile.education_year;
            document.getElementById('prof_edu_degree').value = profile.education_degree;
            document.getElementById('prof_edu_inst').value = profile.education_inst;
            document.getElementById('prof_location').value = profile.location;
            document.getElementById('prof_edu_desc').value = profile.education_desc;
        }

        // 2. Load Skills List
        loadAdminSkillsList();

        // 3. Load Projects List
        loadAdminProjectsList();

    } catch (e) {
        console.error("Error loading admin data:", e);
    }
}

async function loadAdminSkillsList() {
    const { data: skills } = await supabaseClient.from('skills').select('*').order('id', { ascending: true });
    const list = document.getElementById('skillsManagerList');
    if (!list) return;
    list.innerHTML = '';

    if (skills) {
        skills.forEach(skill => {
            const row = document.createElement('div');
            row.className = 'skill-item-row';
            row.innerHTML = `
                <div>
                    <span class="skill-cat-label">${skill.category}</span>
                    <strong>${skill.name}</strong>
                </div>
                <button class="btn-delete" onclick="deleteSkill(${skill.id})">Delete</button>
            `;
            list.appendChild(row);
        });
    }
}

async function loadAdminProjectsList() {
    const { data: projects } = await supabaseClient.from('projects').select('*').order('id', { ascending: true });
    const list = document.getElementById('projectsManagerList');
    if (!list) return;
    list.innerHTML = '';

    if (projects) {
        projects.forEach(project => {
            const card = document.createElement('div');
            card.className = 'project-editor-card';
            card.innerHTML = `
                <h4>${project.title} <span style="font-size:0.8rem; font-weight:500; color:#64748b;">(${project.type})</span></h4>
                <p style="font-size:0.9rem; color:#475569; margin: 0.25rem 0;">${project.description}</p>
                <div style="font-size:0.8rem; color:#64748b;">Tags: ${project.tags.join(', ')}</div>
                <div class="project-editor-actions">
                    <button class="btn btn-secondary" style="padding: 4px 8px; font-size:0.8rem;" onclick="editProject(${JSON.stringify(project).replace(/"/g, '&quot;')})">Edit</button>
                    <button class="btn-delete" style="padding: 4px 8px; font-size:0.8rem;" onclick="deleteProject(${project.id})">Delete</button>
                </div>
            `;
            list.appendChild(card);
        });
    }
}

// Global functions for list buttons
window.deleteSkill = async function(id) {
    if (confirm("Are you sure you want to delete this skill?")) {
        const { error } = await supabaseClient.from('skills').delete().eq('id', id);
        if (error) {
            alert("Delete failed: " + error.message);
        } else {
            loadAdminSkillsList();
        }
    }
};

window.editProject = function(project) {
    document.getElementById('projectFormTitle').textContent = 'Edit Project';
    document.getElementById('projSubmitBtn').textContent = 'Save Changes';
    document.getElementById('projCancelBtn').style.display = 'inline-block';
    
    document.getElementById('proj_id').value = project.id;
    document.getElementById('proj_title').value = project.title;
    document.getElementById('proj_type').value = project.type;
    document.getElementById('proj_tags').value = project.tags.join(', ');
    document.getElementById('proj_github').value = project.github_url;
    document.getElementById('proj_desc').value = project.description;

    document.getElementById('projectForm').scrollIntoView({ behavior: 'smooth' });
};

window.deleteProject = async function(id) {
    if (confirm("Are you sure you want to delete this project?")) {
        const { error } = await supabaseClient.from('projects').delete().eq('id', id);
        if (error) {
            alert("Delete failed: " + error.message);
        } else {
            loadAdminProjectsList();
        }
    }
};

function setupAdminForms() {
    const profileForm = document.getElementById('profileForm');
    const addSkillForm = document.getElementById('addSkillForm');
    const projectForm = document.getElementById('projectForm');
    const projCancelBtn = document.getElementById('projCancelBtn');

    // 1. Submit Profile Form
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const msg = document.getElementById('profileMessage');
            const submitBtn = document.getElementById('profileSubmitBtn');
            const originalText = submitBtn.textContent;
            
            // Set loading state
            submitBtn.disabled = true;
            submitBtn.textContent = 'Saving...';
            msg.style.display = 'none';

            const profileData = {
                name: document.getElementById('prof_name').value,
                title: document.getElementById('prof_title').value,
                hero_tag: document.getElementById('prof_tag').value,
                email: document.getElementById('prof_email').value,
                hero_desc: document.getElementById('prof_hero_desc').value,
                about_text_1: document.getElementById('prof_about_1').value,
                about_text_2: document.getElementById('prof_about_2').value,
                education_year: document.getElementById('prof_edu_year').value,
                education_degree: document.getElementById('prof_edu_degree').value,
                education_inst: document.getElementById('prof_edu_inst').value,
                location: document.getElementById('prof_location').value,
                education_desc: document.getElementById('prof_edu_desc').value
            };

            const { error } = await supabaseClient
                .from('profile')
                .update(profileData)
                .eq('id', 1);

            if (error) {
                msg.className = 'form-message error';
                msg.textContent = error.message;
                msg.style.display = 'block';
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            } else {
                msg.className = 'form-message success';
                msg.textContent = 'Profile successfully updated!';
                msg.style.display = 'block';
                
                // Visual feedback: green button & text change
                submitBtn.style.backgroundColor = '#22c55e'; // Tailwind green-500
                submitBtn.style.borderColor = '#22c55e';
                submitBtn.style.color = '#ffffff';
                submitBtn.textContent = 'Saved Successfully!';
                
                setTimeout(() => {
                    msg.style.display = 'none';
                    submitBtn.disabled = false;
                    submitBtn.style.backgroundColor = '';
                    submitBtn.style.borderColor = '';
                    submitBtn.style.color = '';
                    submitBtn.textContent = originalText;
                }, 3000);
            }
        });
    }

    // 2. Submit Add Skill Form
    if (addSkillForm) {
        addSkillForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const msg = document.getElementById('skillsMessage');
            msg.style.display = 'none';

            const skillData = {
                category: document.getElementById('skill_cat').value,
                name: document.getElementById('skill_name').value
            };

            const { error } = await supabaseClient
                .from('skills')
                .insert([skillData]);

            if (error) {
                msg.className = 'form-message error';
                msg.textContent = error.message;
                msg.style.display = 'block';
            } else {
                document.getElementById('skill_name').value = '';
                msg.className = 'form-message success';
                msg.textContent = 'Skill added successfully!';
                msg.style.display = 'block';
                loadAdminSkillsList();
                setTimeout(() => msg.style.display = 'none', 3000);
            }
        });
    }

    // 3. Submit Add/Edit Project Form
    if (projectForm) {
        projectForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const msg = document.getElementById('projectsMessage');
            msg.style.display = 'none';

            const projId = document.getElementById('proj_id').value;
            const projectData = {
                title: document.getElementById('proj_title').value,
                type: document.getElementById('proj_type').value,
                tags: document.getElementById('proj_tags').value.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
                github_url: document.getElementById('proj_github').value,
                description: document.getElementById('proj_desc').value
            };

            let error = null;

            if (projId) {
                // Edit mode
                const { error: editErr } = await supabaseClient
                    .from('projects')
                    .update(projectData)
                    .eq('id', projId);
                error = editErr;
            } else {
                // Add mode
                const { error: addErr } = await supabaseClient
                    .from('projects')
                    .insert([projectData]);
                error = addErr;
            }

            if (error) {
                msg.className = 'form-message error';
                msg.textContent = error.message;
                msg.style.display = 'block';
            } else {
                resetProjectForm();
                msg.className = 'form-message success';
                msg.textContent = projId ? 'Project updated successfully!' : 'Project added successfully!';
                msg.style.display = 'block';
                loadAdminProjectsList();
                setTimeout(() => msg.style.display = 'none', 3000);
            }
        });
    }

    // Cancel edit click
    if (projCancelBtn) {
        projCancelBtn.addEventListener('click', resetProjectForm);
    }
}

function resetProjectForm() {
    document.getElementById('projectFormTitle').textContent = 'Add New Project';
    document.getElementById('projSubmitBtn').textContent = 'Add Project';
    document.getElementById('projCancelBtn').style.display = 'none';
    
    document.getElementById('proj_id').value = '';
    document.getElementById('proj_title').value = '';
    document.getElementById('proj_type').value = '';
    document.getElementById('proj_tags').value = '';
    document.getElementById('proj_github').value = '';
    document.getElementById('proj_desc').value = '';
}

// =========================================================================
// RESET PASSWORD PAGE LOGIC (reset-password.html)
// =========================================================================
function initResetPasswordPage() {
    const newPasswordForm = document.getElementById('newPasswordForm');
    const msg = document.getElementById('resetMessage');
    const submitBtn = document.getElementById('newPasswordSubmitBtn');

    if (!supabaseClient) {
        alert("Warning: Supabase credentials are not configured!");
        return;
    }

    if (newPasswordForm) {
        newPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const password = document.getElementById('new_password').value;
            const confirmPassword = document.getElementById('confirm_password').value;
            const originalText = submitBtn.textContent;

            msg.style.display = 'none';

            if (password !== confirmPassword) {
                msg.className = 'form-message error';
                msg.textContent = 'Passwords do not match!';
                msg.style.display = 'block';
                return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = 'Updating Password...';

            const { data, error } = await supabaseClient.auth.updateUser({
                password: password
            });

            if (error) {
                msg.className = 'form-message error';
                msg.textContent = error.message;
                msg.style.display = 'block';
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            } else {
                msg.className = 'form-message success';
                msg.textContent = 'Password reset successfully! Redirecting to login...';
                msg.style.display = 'block';

                submitBtn.style.backgroundColor = '#22c55e'; // Green button state
                submitBtn.style.borderColor = '#22c55e';
                submitBtn.style.color = '#ffffff';
                submitBtn.textContent = 'Updated Successfully!';

                newPasswordForm.reset();

                setTimeout(() => {
                    window.location.href = 'admin.html';
                }, 3000);
            }
        });
    }
}
