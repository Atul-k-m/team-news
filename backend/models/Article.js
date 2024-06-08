const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    url: { type: String, required: true, unique: true },
    title: String,
    content: String,
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 }
});

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;
