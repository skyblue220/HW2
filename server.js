const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const POSTS_FILE = path.join(__dirname, 'posts.json');

// Load posts from JSON file
function loadPosts() {
  try {
    const data = fs.readFileSync(POSTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// Save posts to JSON file
function savePosts(posts) {
  fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2));
}

// Get anonymous name for comment
function getAnonymousName(post, ip) {
  const existing = post.comments.find(c => c.ip === ip);
  if (existing) return existing.name;
  const usedNumbers = post.comments.map(c => parseInt(c.name.replace('익명', ''))).filter(n => !isNaN(n));
  const nextNum = usedNumbers.length > 0 ? Math.max(...usedNumbers) + 1 : 1;
  return `익명${nextNum}`;
}

app.get('/', (req, res) => {
  const posts = loadPosts();
  let v = process.env.APP_VERSION || 'v0.1';
  if (v.length > 7 && v !== 'dev') v = v.substring(0, 7);
  const version = v;
  const deployTime = process.env.DEPLOY_TIME || 'Unknown Date';
  const title = 'Simple Blog';

  let html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} (Build: ${version})</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f0f2f5;
      color: #333;
      margin: 0;
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .container {
      max-width: 600px;
      width: 100%;
    }
    h1 {
      color: #1877f2;
      text-align: center;
      margin-bottom: 10px;
    }
    .version {
      text-align: center;
      color: #65676b;
      font-size: 14px;
      margin-bottom: 30px;
    }
    .new-post-form {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }
    .new-post-form h2 {
      margin-top: 0;
      color: #1877f2;
    }
    input[type="text"], textarea {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      box-sizing: border-box;
    }
    textarea {
      height: 80px;
      resize: vertical;
    }
    button {
      background-color: #1877f2;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      margin-top: 10px;
    }
    button:hover {
      background-color: #166fe5;
    }
    .post {
      background: white;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .post h3 {
      margin-top: 0;
      color: #1c1e21;
    }
    .post p {
      color: #1c1e21;
      line-height: 1.4;
    }
    .author {
      font-weight: bold;
      color: #1877f2;
    }
    .comments h4 {
      margin-bottom: 10px;
      color: #65676b;
    }
    .comment {
      background: #f8f9fa;
      padding: 10px;
      border-radius: 4px;
      margin-bottom: 10px;
      border-left: 3px solid #1877f2;
    }
    .comment strong {
      color: #1877f2;
    }
    .comment-form {
      margin-top: 15px;
    }
    .comment-form textarea {
      height: 60px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${title}</h1>
    <p class="version">
      <strong>App Version:</strong> ${version} <br>
      <strong>Last Deployed:</strong> ${deployTime}
    </p>

    <div class="new-post-form">
      <h2>New Post</h2>
      <form action="/add-post" method="post">
        <input type="text" name="title" placeholder="Title" required>
        <textarea name="content" placeholder="What's on your mind?" required></textarea>
        <button type="submit">Post</button>
      </form>
    </div>

    <h2>Posts</h2>`;

  posts.forEach(post => {
    html += `<div class="post">
      <h3>${post.title}</h3>
      <p><span class="author">${post.author}</span>: ${post.content}</p>
      <div class="comments">
        <h4>Comments</h4>`;
    post.comments.forEach(comment => {
      html += `<div class="comment"><strong>${comment.name}</strong>: ${comment.content}</div>`;
    });
    html += `<div class="comment-form">
      <form action="/add-comment" method="post">
        <input type="hidden" name="postId" value="${post.id}">
        <textarea name="content" placeholder="Write a comment..." required></textarea>
        <button type="submit">Comment</button>
      </form>
    </div>
      </div>
    </div>`;
  });

  html += `  </div>
</body>
</html>`;

  res.send(html);
});

// DevOps Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    version: process.env.APP_VERSION || 'dev',
    deployTime: process.env.DEPLOY_TIME || 'unknown',
    uptime: process.uptime()
  });
});

app.post('/add-post', (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).send('Title and content are required');
  }

  const posts = loadPosts();
  const newPost = { id: Date.now(), title, content, author: '글쓴이', comments: [] };
  posts.push(newPost);
  savePosts(posts);

  res.redirect('/');
});

app.post('/add-comment', (req, res) => {
  const { postId, content } = req.body;
  if (!postId || !content) {
    return res.status(400).send('Post ID and content are required');
  }

  const posts = loadPosts();
  const post = posts.find(p => p.id == postId);
  if (!post) {
    return res.status(404).send('Post not found');
  }

  const ip = req.ip || req.connection.remoteAddress;
  const name = getAnonymousName(post, ip);
  post.comments.push({ ip, name, content });
  savePosts(posts);

  res.redirect('/');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});