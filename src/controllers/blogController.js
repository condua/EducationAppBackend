const Blog = require("../models/Blog");
// Controller createBlog
exports.createBlog = async (req, res) => {
  try {
    console.log("Request Body:", req.body); // Log dữ liệu nhận được từ frontend

    const { title, content, author, imageTitle } = req.body;

    if (!title || !content || !author || !imageTitle) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    const newBlog = new Blog({
      title,
      content,
      author,
      imageTitle, // Lưu imageTitle vào blog
    });

    await newBlog.save();
    res.status(201).json(newBlog); // Trả về blog đã tạo
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// READ all Blogs
exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.status(200).json(blogs);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// READ one Blog
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.status(200).json(blog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// UPDATE Blog
exports.updateBlog = async (req, res) => {
  try {
    const { title, content, author, imageTitle } = req.body;
    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      { title, content, author, imageTitle },
      { new: true }
    );
    if (!updatedBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.status(200).json(updatedBlog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE Blog
exports.deleteBlog = async (req, res) => {
  try {
    const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
    if (!deletedBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// SHARE Blog (Open Graph for Facebook)
exports.shareBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).send("Blog not found");
    }

    const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta property="og:title" content="${blog.title}" />
          <meta property="og:description" content="${blog.content.slice(
            0,
            100
          )}..." />
          <meta property="og:image" content="${blog.imageTitle}" />
          <meta property="og:type" content="article" />
          

          <title>${blog.title}</title>
        </head>
        <body>
          <p>Redirecting to blog...</p>
        </body>
      </html>
    `;
    res.send(html);
  } catch (error) {
    res.status(500).send("Server Error");
  }
};
