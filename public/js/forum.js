class ForumManager {
    constructor() {
        this.posts = [];
        this.currentUser = null;
        this.init();
    }

    async init() {
        // Initialize event listeners
        this.initEventListeners();
        
        // Load initial data
        await this.loadPosts();
        
        // Update stats
        this.updateForumStats();
        
        // Check authentication status
        this.checkAuthStatus();
    }

    initEventListeners() {
        // New post button
        const newPostBtn = document.getElementById('newPostBtn');
        if (newPostBtn) {
            newPostBtn.addEventListener('click', () => this.showNewPostModal());
        }

        // New post form
        const newPostForm = document.getElementById('newPostForm');
        if (newPostForm) {
            newPostForm.addEventListener('submit', (e) => this.handleNewPost(e));
        }

        // Close modal button
        const closeModal = document.querySelector('.close-modal');
        if (closeModal) {
            closeModal.addEventListener('click', () => this.hideNewPostModal());
        }

        // Search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }
    }

    async loadPosts() {
        try {
            // In a real implementation, this would fetch from your backend
            // For now, we'll use mock data
            this.posts = [
                {
                    id: 1,
                    title: 'Welcome to CraftVile Police RP',
                    content: 'Welcome to our community! Please read the rules and guidelines.',
                    author: {
                        name: 'Admin',
                        role: 'Administrator',
                        avatar: 'path/to/avatar.jpg'
                    },
                    date: new Date(),
                    category: 'announcements',
                    pinned: true,
                    reactions: {
                        '👍': ['user1', 'user2'],
                        '❤️': ['user3'],
                        '😄': []
                    },
                    comments: [],
                    views: 0
                }
            ];

            this.renderPosts();
        } catch (error) {
            console.error('Error loading posts:', error);
            this.showError('Failed to load posts. Please try again later.');
        }
    }

    renderPosts() {
        const postsContainer = document.getElementById('forumPosts');
        const template = document.getElementById('postTemplate');
        
        if (!postsContainer || !template) return;

        postsContainer.innerHTML = '';

        // Sort posts (pinned first, then by date)
        const sortedPosts = [...this.posts].sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return new Date(b.date) - new Date(a.date);
        });

        sortedPosts.forEach(post => {
            const postElement = template.content.cloneNode(true);
            
            // Fill in post data
            postElement.querySelector('.post-title').textContent = post.title;
            postElement.querySelector('.post-text').textContent = post.content;
            postElement.querySelector('.author-name').textContent = post.author.name;
            postElement.querySelector('.author-role').textContent = post.author.role;
            postElement.querySelector('.author-avatar').src = post.author.avatar;
            postElement.querySelector('.post-date').textContent = this.formatDate(post.date);

            // Set up reactions
            const reactionsContainer = postElement.querySelector('.reactions');
            Object.entries(post.reactions).forEach(([emoji, users]) => {
                const reactionBtn = reactionsContainer.querySelector(`[data-emoji="${emoji}"]`);
                if (reactionBtn) {
                    reactionBtn.querySelector('.count').textContent = users.length;
                    if (this.currentUser && users.includes(this.currentUser.id)) {
                        reactionBtn.classList.add('active');
                    }
                }
            });

            // Set up post stats
            postElement.querySelector('.views .count').textContent = post.views;
            postElement.querySelector('.comments .count').textContent = post.comments.length;

            // Add event listeners
            this.addPostEventListeners(postElement, post);

            postsContainer.appendChild(postElement);
        });
    }

    addPostEventListeners(postElement, post) {
        // Reaction buttons
        postElement.querySelectorAll('.reaction-btn').forEach(btn => {
            btn.addEventListener('click', () => this.handleReaction(post.id, btn.dataset.emoji));
        });

        // Add reaction button
        const addReactionBtn = postElement.querySelector('.add-reaction');
        if (addReactionBtn) {
            addReactionBtn.addEventListener('click', () => this.showEmojiPicker(post.id));
        }

        // Comment form
        const commentForm = postElement.querySelector('.comment-form');
        if (commentForm) {
            commentForm.addEventListener('submit', (e) => this.handleNewComment(e, post.id));
        }

        // Post actions (if user has permission)
        if (this.currentUser && this.hasPermission(this.currentUser, 'manage_posts')) {
            const editBtn = postElement.querySelector('.edit-post');
            const deleteBtn = postElement.querySelector('.delete-post');
            const pinBtn = postElement.querySelector('.pin-post');

            if (editBtn) editBtn.addEventListener('click', () => this.editPost(post.id));
            if (deleteBtn) deleteBtn.addEventListener('click', () => this.deletePost(post.id));
            if (pinBtn) {
                pinBtn.addEventListener('click', () => this.togglePinPost(post.id));
                if (post.pinned) pinBtn.classList.add('active');
            }
        }
    }

    async handleNewPost(event) {
        event.preventDefault();

        if (!this.currentUser) {
            this.showError('Please log in to create a post');
            return;
        }

        const form = event.target;
        const title = form.title.value.trim();
        const content = form.content.value.trim();
        const category = form.category.value;

        if (!title || !content || !category) {
            this.showError('Please fill in all fields');
            return;
        }

        try {
            // In a real implementation, this would send to your backend
            const newPost = {
                id: this.posts.length + 1,
                title,
                content,
                category,
                author: {
                    name: this.currentUser.name,
                    role: this.currentUser.role,
                    avatar: this.currentUser.avatar
                },
                date: new Date(),
                pinned: false,
                reactions: {
                    '👍': [],
                    '❤️': [],
                    '😄': []
                },
                comments: [],
                views: 0
            };

            this.posts.unshift(newPost);
            this.renderPosts();
            this.hideNewPostModal();
            form.reset();
        } catch (error) {
            console.error('Error creating post:', error);
            this.showError('Failed to create post. Please try again.');
        }
    }

    async handleReaction(postId, emoji) {
        if (!this.currentUser) {
            this.showError('Please log in to react to posts');
            return;
        }

        try {
            const post = this.posts.find(p => p.id === postId);
            if (!post) return;

            const users = post.reactions[emoji] || [];
            const userIndex = users.indexOf(this.currentUser.id);

            if (userIndex === -1) {
                users.push(this.currentUser.id);
            } else {
                users.splice(userIndex, 1);
            }

            post.reactions[emoji] = users;
            this.renderPosts();
        } catch (error) {
            console.error('Error handling reaction:', error);
            this.showError('Failed to update reaction. Please try again.');
        }
    }

    async handleNewComment(event, postId) {
        event.preventDefault();

        if (!this.currentUser) {
            this.showError('Please log in to comment');
            return;
        }

        const form = event.target;
        const content = form.querySelector('input').value.trim();

        if (!content) return;

        try {
            const post = this.posts.find(p => p.id === postId);
            if (!post) return;

            const newComment = {
                id: post.comments.length + 1,
                content,
                author: {
                    name: this.currentUser.name,
                    role: this.currentUser.role,
                    avatar: this.currentUser.avatar
                },
                date: new Date()
            };

            post.comments.push(newComment);
            this.renderPosts();
            form.reset();
        } catch (error) {
            console.error('Error creating comment:', error);
            this.showError('Failed to post comment. Please try again.');
        }
    }

    hasPermission(user, permission) {
        // In a real implementation, this would check against a proper permissions system
        return user && (user.role === 'Administrator' || user.role === 'Moderator');
    }

    showNewPostModal() {
        const modal = document.getElementById('newPostModal');
        if (modal) modal.style.display = 'block';
    }

    hideNewPostModal() {
        const modal = document.getElementById('newPostModal');
        if (modal) modal.style.display = 'none';
    }

    updateForumStats() {
        const memberCount = document.getElementById('memberCount');
        const postCount = document.getElementById('postCount');

        if (memberCount) memberCount.textContent = '0 Members';
        if (postCount) postCount.textContent = `${this.posts.length} Posts`;
    }

    handleSearch(query) {
        if (!query) {
            this.renderPosts();
            return;
        }

        const filteredPosts = this.posts.filter(post => 
            post.title.toLowerCase().includes(query.toLowerCase()) ||
            post.content.toLowerCase().includes(query.toLowerCase())
        );

        this.renderPosts(filteredPosts);
    }

    formatDate(date) {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    }

    showError(message) {
        // In a real implementation, this would show a proper error message UI
        console.error(message);
        alert(message);
    }

    checkAuthStatus() {
        // This should be integrated with your authentication system
        const authStatus = document.querySelector('.auth-status');
        if (!authStatus) return;

        if (this.currentUser) {
            authStatus.innerHTML = `
                <span class="user-info">
                    <img src="${this.currentUser.avatar}" alt="" class="user-avatar">
                    <span class="user-name">${this.currentUser.name}</span>
                </span>
                <button class="logout-btn">Logout</button>
            `;
        } else {
            authStatus.innerHTML = `
                <button class="login-btn">Login with Steam</button>
            `;
        }
    }
}

// Initialize the forum manager
const forumManager = new ForumManager(); 