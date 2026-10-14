// src/comments.js

export function initComments(animeId) {
  const STORAGE_KEY = `anime_comments_${animeId}`;
  
  const commentForm = document.querySelector('#comment-form');
  const commentInput = document.querySelector('#comment-input');
  const ratingInput = document.querySelector('#rating-input');
  const commentsList = document.querySelector('#comments-list');

  if (!commentForm) return; // Exit if the form isn't on the current page

  // Load and render existing comments from localStorage
  function renderComments() {
    const savedComments = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    
    if (savedComments.length === 0) {
      commentsList.innerHTML = '<p class="no-comments">No parent reviews yet. Be the first to share your thoughts!</p>';
      return;
    }

    commentsList.innerHTML = savedComments.map(comment => `
      <div class="comment-card">
        <div class="comment-header">
          <span class="comment-author">Parent Reviewer</span>
          <span class="comment-rating">⭐ ${comment.rating} / 5</span>
        </div>
        <p class="comment-text">${escapeHtml(comment.text)}</p>
        <span class="comment-date">${comment.date}</span>
      </div>
    `).join('');
  }

  // Handle form submission
  commentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const text = commentInput.value.trim();
    const rating = ratingInput ? ratingInput.value : '5';

    if (!text) return;

    const newComment = {
      text,
      rating,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    const savedComments = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    savedComments.unshift(newComment); // Add newest comment to the top
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedComments));

    commentInput.value = '';
    renderComments();
  });

  // Helper to prevent basic injection
  function escapeHtml(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  // Initial load
  renderComments();
}