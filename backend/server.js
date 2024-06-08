const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const { JSDOM } = require('jsdom');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const apiKey = 'f98734c16e864cfbadc5bcb9c806f2a3'; // Replace with your actual API key from NewsAPI
const newsApiUrl = `https://newsapi.org/v2/top-headlines?country=in&apiKey=${apiKey}`;

const app = express();
const uri = process.env.MONGO_URI || "mongodb+srv://atulkm189:OLdqvJsxidKuXLOs@cluster0.o6h3xiw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";


app.use(bodyParser.json());
app.use(cors());


app.use('/api/auth', authRoutes);
const Article = require('./models/Article');  
app.post('/api/fetch-article', async (req, res) => {
    const { url } = req.body;

    try {
        const response = await axios.get(url);
        const html = response.data;
        const dom = new JSDOM(html);
        const document = dom.window.document;
        let articleContent = '';

        const mainContent = document.querySelector('article') || document.querySelector('main') || document.querySelector('div[class*="content"]');
        if (!mainContent) {
            return res.status(404).json({ error: 'Content not found' });
        }

        mainContent.querySelectorAll('p, h1, h2, h3, h4, h5, h6, img').forEach(el => {
            if (el.tagName.toLowerCase() === 'img') {
                articleContent += `<img src="${el.src}" alt="${el.alt || 'Image'}">\n\n`;
            } else {
                const textContent = el.textContent.trim();
                if (!isAdContent(textContent) && !hasUnwantedClass(el)) {
                    articleContent += `<${el.tagName.toLowerCase()}>${textContent}</${el.tagName.toLowerCase()}>\n\n`;
                }
            }
        });

        articleContent = articleContent.replace(/\n{3,}/g, '\n\n').trim();

        res.json({ content: articleContent });

    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch article content' });
    }
});

app.post('/api/like', async (req, res) => {
    const { url } = req.body;

    try {
        const article = await Article.findOneAndUpdate(
            { url },
            { $inc: { likes: 1 } },
            { new: true, upsert: true }
        );
        res.json({ likes: article.likes, dislikes: article.dislikes });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update like count' });
    }
});

// Endpoint to handle dislike
app.post('/api/dislike', async (req, res) => {
    const { url } = req.body;

    try {
        const article = await Article.findOneAndUpdate(
            { url },
            { $inc: { dislikes: 1 } },
            { new: true, upsert: true }
        );
        res.json({ likes: article.likes, dislikes: article.dislikes });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update dislike count' });
    }
});

// Endpoint to fetch like/dislike counts
app.get('/api/likes-dislikes', async (req, res) => {
    const { url } = req.query;

    try {
        const article = await Article.findOne({ url });
        if (article) {
            res.json({ likes: article.likes, dislikes: article.dislikes });
        } else {
            res.json({ likes: 0, dislikes: 0 });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch like/dislike counts' });
    }
});

function isAdContent(text) {
    const adKeywords = ['advertisement', 'ad', 'sponsored', 'promotion', 'promoted', 'sponsored content'];
    return adKeywords.some(keyword => text.toLowerCase().includes(keyword));
}

function hasUnwantedClass(element) {
    const unwantedClasses = ['brandwrapper', 'BrandPageWrapper-contentWrapper', 'SearchGroup-container', 'nav-menu-navMenu'];
    return unwantedClasses.some(className => element.classList.contains(className));
}
const connectDB = async () => {
    try {
        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Connection error', error.message);
    }
};

connectDB();


const port = process.env.PORT || 5500;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
