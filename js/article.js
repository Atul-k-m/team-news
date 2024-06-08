document.addEventListener('DOMContentLoaded', () => {
    const backButton = document.getElementById('backButton');
    const bookmarkButton = document.getElementById('bookmarkButton');
    const shareButton = document.getElementById('shareButton');
    const summarizeButton = document.getElementById('summarizeButton');
    const factCheckButton = document.getElementById('factCheckButton');
    const articleContent = document.getElementById('articleContent');
    const commentsList = document.getElementById('commentsList');
    const commentInput = document.getElementById('commentInput');
    const submitCommentButton = document.getElementById('submitCommentButton');
    const likeButton = document.getElementById('likeButton');
    const dislikeButton = document.getElementById('dislikeButton');
    const likeCount = document.getElementById('likeCount');
    const dislikeCount = document.getElementById('dislikeCount');
    
    // Fetch the article URL from sessionStorage
    const article = JSON.parse(sessionStorage.getItem('selectedArticle'));

    if (article && article.url) {
        fetchArticleContent(article.url);
        fetchLikeDislikeCounts(article.url);
    } else {
        articleContent.textContent = 'No article selected.';
    }

    backButton.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    bookmarkButton.addEventListener('click', () => {
        alert('Bookmark feature is not implemented yet.');
    });

    shareButton.addEventListener('click', () => {
        alert('Share feature is not implemented yet.');
    });

    summarizeButton.addEventListener('click', async () => {
        if (article && article.url) {
            try {
                const response = await fetch('http://localhost:5000/summarize', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ url: article.url })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.summary) {
                        alert(`Summary: ${data.summary}`);
                    } else {
                        alert('Failed to summarize the article.');
                    }
                } else {
                    alert('Failed to fetch summary.');
                }
            } catch (error) {
                alert('An error occurred while fetching the summary.');
                console.error('Error fetching summary:', error);
            }
        } else {
            alert('No article selected.');
        }
    });

    factCheckButton.addEventListener('click', async () => {
        const text1 = articleContent.textContent.trim();
        if (text1) {
            try {
                const response = await fetch('http://localhost:5000/fact_check', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        text1: text1
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.result) {
                        alert(`Fact Check Result: ${data.result} (Similarity: ${data.similarity.toFixed(2)})`);
                    } else {
                        alert('Failed to perform fact-check.');
                    }
                } else {
                    alert('Failed to fetch fact-check result.');
                }
            } catch (error) {
                alert('An error occurred while fetching the fact-check result.');
                console.error('Error fetching fact-check result:', error);
            }
        } else {
            alert('Article content is empty.');
        }
    });

    submitCommentButton.addEventListener('click', () => {
        const commentText = commentInput.value.trim();
        if (commentText) {
            const commentElement = document.createElement('div');
            commentElement.textContent = commentText;
            commentsList.appendChild(commentElement);
            commentInput.value = '';
        }
    });

    likeButton.addEventListener('click', async () => {
        if (article && article.url) {
            try {
                const response = await fetch('http://localhost:5500/api/like', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ url: article.url })
                });

                if (response.ok) {
                    const data = await response.json();
                    likeCount.textContent = data.likes;
                    dislikeCount.textContent = data.dislikes;
                } else {
                    alert('Failed to update like.');
                }
            } catch (error) {
                console.error('Error updating like:', error);
            }
        }
    });

    dislikeButton.addEventListener('click', async () => {
        if (article && article.url) {
            try {
                const response = await fetch('http://localhost:5500/api/dislike', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ url: article.url })
                });

                if (response.ok) {
                    const data = await response.json();
                    likeCount.textContent = data.likes;
                    dislikeCount.textContent = data.dislikes;
                } else {
                    alert('Failed to update dislike.');
                }
            } catch (error) {
                console.error('Error updating dislike:', error);
            }
        }
    });

    async function fetchLikeDislikeCounts(url) {
        try {
            const response = await fetch(`http://localhost:5500/api/likes-dislikes?url=${encodeURIComponent(url)}`);
            const data = await response.json();
            likeCount.textContent = data.likes;
            dislikeCount.textContent = data.dislikes;
        } catch (error) {
            console.error('Error fetching like/dislike counts:', error);
        }
    }

    async function fetchArticleContent(url) {
        try {
            const response = await fetch('http://localhost:5500/api/fetch-article', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url })
            });

            const data = await response.json();
            if (data.content) {
                articleContent.innerHTML = data.content;
                if (typeof twttr !== 'undefined') {
                    twttr.widgets.load();
                }
            } else {
                articleContent.textContent = 'Failed to load article content.';
            }
        } catch (error) {
            articleContent.textContent = 'An error occurred while fetching article content.';
        }
    }

    async function fetchArticleSummary(url) {
        try {
            const response = await fetch('http://localhost:5000/summarize', {  // Correct Flask server URL
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url })
            });

            const data = await response.json();
            if (data.summary) {
                return data.summary;
            } else {
                return null;
            }
        } catch (error) {
            console.error('Error fetching summary:', error);
            return null;
        }
    }
});
